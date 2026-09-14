#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644';
const C=2,G=6,C3=16,G3=20;
const REPAIR=Object.freeze([0,1,3,4,5]);
const REFUSALS=Object.freeze({D:3,E:4,F:5});
const refusalName=process.argv[2];
if(!(refusalName in REFUSALS))throw new Error('usage: post-seizure-stutter-induction <D|E|F>');
const refusalCol=REFUSALS[refusalName];
const DUAL=fileURLToPath(new URL('./quotient-standard7x6-dual-target-choice-certificate.mjs',import.meta.url));
const MAX_SCHEDULER_STATES=100000;

function replay(k,s){let id=k.rootId;for(const d of s){const n=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(n)&&n>=0,`bad replay ${s}`);id=n;}return id;}
function col(c){return String.fromCharCode(65+c);}
function coord(x){return `${col(x%7)}${Math.floor(x/7)+1}`;}
function phase(e,id){return e.heights(id).map(h=>h&1).join('');}
function runDual(sequence){
 const child=spawnSync(process.execPath,[DUAL,sequence],{encoding:'utf-8',timeout:270000,maxBuffer:64*1024*1024});
 if(child.error)throw child.error;
 if(child.status!==0)return {proved:false,kind:'dual_process_error',error:(child.stderr??'').slice(-8000)};
 const line=(child.stdout??'').split(/\r?\n/).find(x=>x.startsWith('DUAL_TARGET_CHOICE_CERTIFICATE='));
 if(!line)return {proved:false,kind:'dual_output_missing',error:(child.stdout??'').slice(-8000)};
 return JSON.parse(line.slice('DUAL_TARGET_CHOICE_CERTIFICATE='.length));
}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});k.prepareSearchStorage();
const e=createRepairCapacityProofEngine(k,{maxProofStates:1});

function neutralContract(id){
 if((e.rank(id)&1)!==1)return {ok:false,reason:'not_P1_turn'};
 if(!e.singleton(id,0,C3)||!e.singleton(id,0,G3))return {ok:false,reason:'target_not_live'};
 if(e.targetDistance(id,C3)!==1||e.targetDistance(id,G3)!==1)return {ok:false,reason:'target_distance_not_one'};
 const p0Enabled=e.enabledSingletons(id,0),p1Enabled=e.enabledSingletons(id,1);
 if(p0Enabled.length||p1Enabled.length)return {ok:false,reason:'enabled_obligation_present',p0Enabled:p0Enabled.map(coord),p1Enabled:p1Enabled.map(coord)};
 const p1Terminal=e.terminalActions(id,1);
 if(p1Terminal.length)return {ok:false,reason:'P1_terminal_present',p1Terminal:p1Terminal.map(x=>coord(x.cell))};
 return {ok:true,mu:e.mu(id),phaseBits:phase(e,id)};
}

const memo=new Map();
let schedulerStates=0,maxDepth=0,neutralPairs=0,dualExits=0,immediateP0Terminals=0,targetSupportTerminals=0;
const dualMemo=new Map();
function dualCertificate(sequence){
 if(dualMemo.has(sequence))return dualMemo.get(sequence);
 const result=runDual(sequence);dualMemo.set(sequence,result);return result;
}
function prove(state,sequence,depth=0){
 const key=state;
 if(memo.has(key))return memo.get(key);
 schedulerStates++;maxDepth=Math.max(maxDepth,depth);
 if(schedulerStates>MAX_SCHEDULER_STATES)throw new Error(`post-seizure scheduler-state cap exceeded ${MAX_SCHEDULER_STATES}`);
 const contract=neutralContract(state);
 if(!contract.ok){const out={proved:false,kind:'outside_neutral_contract',sequence,contract};memo.set(key,out);return out;}
 const beforeMu=contract.mu,beforePhase=contract.phaseBits;
 const branches=[];
 let proved=true;
 for(const action of e.legal(state)){
  const eventCell=e.landing(state,action);
  const afterP1=k.advance(state,action);
  if(afterP1===domain.QN_TERMINAL_WIN){proved=false;branches.push({P1:col(action),cell:coord(eventCell),route:'P1_terminal'});continue;}
  assert(afterP1>=0&&e.rank(afterP1)===e.rank(state)+1);
  const afterP1Sequence=sequence+String(action+1);
  const immediate=e.terminalActions(afterP1,0);
  if(immediate.length){immediateP0Terminals++;if(action===C||action===G)targetSupportTerminals++;branches.push({P1:col(action),cell:coord(eventCell),route:'immediate_P0_terminal',terminalCells:immediate.map(x=>coord(x.cell))});continue;}
  if(!REPAIR.includes(action)){
    const dual=dualCertificate(afterP1Sequence);
    if(!dual.proved){proved=false;branches.push({P1:col(action),cell:coord(eventCell),route:'target_column_without_terminal_or_dual_certificate',dual});}
    else{dualExits++;branches.push({P1:col(action),cell:coord(eventCell),route:'dual_target_exit',dual:{proved:true,selectedTarget:dual.selectedTarget}});}
    continue;
  }

  const sameCell=e.landing(afterP1,action);
  if(sameCell!==0xff){
    const afterP0=k.advance(afterP1,action);
    if(afterP0===domain.QN_TERMINAL_WIN){immediateP0Terminals++;branches.push({P1:col(action),cell:coord(eventCell),route:'same_column_P0_terminal',P0:col(action),P0cell:coord(sameCell)});continue;}
    assert(afterP0>=0&&e.rank(afterP0)===e.rank(state)+2);
    const restored=neutralContract(afterP0);
    const exactPairProgress=restored.ok&&restored.mu===beforeMu-2&&restored.phaseBits===beforePhase;
    if(exactPairProgress){
      neutralPairs++;
      const child=prove(afterP0,afterP1Sequence+String(action+1),depth+1);
      if(child.proved){branches.push({P1:col(action),cell:coord(eventCell),route:'deadline_free_same_column_stutter',P0:col(action),P0cell:coord(sameCell),beforeMu,afterMu:restored.mu,childKey:afterP0});continue;}
    }
    // Same-column response either failed the neutral contract or its recursive exact successor did not close.
    // Exit from the P0-turn state immediately after the P1 event into the independent dual-target theorem.
    const dual=dualCertificate(afterP1Sequence);
    if(!dual.proved){proved=false;branches.push({P1:col(action),cell:coord(eventCell),route:'stutter_and_dual_exit_unproved',sameColumnRestored:restored,exactPairProgress,dual});}
    else{dualExits++;branches.push({P1:col(action),cell:coord(eventCell),route:'pair_not_used_dual_target_exit',sameColumnRestored:restored,exactPairProgress,dual:{proved:true,selectedTarget:dual.selectedTarget}});}
    continue;
  }

  // Final odd tail: P1 consumed the last event in this repair column, so no pair response exists.
  // The strict resource consumption is already physical; hand the P0-turn state to the dual-target theorem.
  assert(e.mu(afterP1)<=beforeMu-1,'final offsystem tail increased repair capacity');
  const dual=dualCertificate(afterP1Sequence);
  if(!dual.proved){proved=false;branches.push({P1:col(action),cell:coord(eventCell),route:'final_tail_dual_exit_unproved',beforeMu,afterMu:e.mu(afterP1),dual});}
  else{dualExits++;branches.push({P1:col(action),cell:coord(eventCell),route:'final_tail_dual_target_exit',beforeMu,afterMu:e.mu(afterP1),dual:{proved:true,selectedTarget:dual.selectedTarget}});}
 }
 const out={proved,kind:proved?'post_seizure_stutter_induction':'post_seizure_branch_unproved',sequence,mu:beforeMu,phaseBits:beforePhase,branches};
 memo.set(key,out);return out;
}

const activated=replay(k,ROOT+'3');
const refusalCell=e.landing(activated,refusalCol);assert.notEqual(refusalCell,0xff);
const refusal=k.advance(activated,refusalCol);assert(refusal>=0&&refusal!==domain.QN_TERMINAL_WIN&&e.rank(refusal)===14);
const refusalSequence=ROOT+'3'+String(refusalCol+1);
assert.equal(e.landing(refusal,G),G,'expired G1 response cell closed');
const afterG1=k.advance(refusal,G);assert(afterG1>=0&&afterG1!==domain.QN_TERMINAL_WIN&&e.rank(afterG1)===15);
const entrySequence=refusalSequence+'7';
const entryContract=neutralContract(afterG1);assert.equal(entryContract.ok,true,`${refusalName}: post-G1 neutral contract not established`);
const proof=prove(afterG1,entrySequence,0);
const result={
 kind:'standard7x6-deadline-free-post-seizure-stutter-induction-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 refusalColumn:refusalName,refusalCell:coord(refusalCell),refusalSequence,entrySequence,
 expiredObligation:'P0:C1 -> P1:G1 by next_P1_turn',obligationDisposition:'expired before G1 seizure; never reset',
 P0Seizure:'G1',entryContract,proved:proof.proved,proof,
 stats:{schedulerStates,maxDepth,neutralPairs,dualExits,immediateP0Terminals,targetSupportTerminals,dualCertificates:dualMemo.size,schedulerStateCap:MAX_SCHEDULER_STATES},
 promotedConsequence:proof.proved?`${refusalSequence} in W via P0:G1`:null,
 theoremBoundary:proof.proved
  ?'Exact refusal-specific post-G1 scheduler induction. Recursion occurs only after a P1/P0 same-column offsystem pair restores the exact deadline-free dual-target contract, preserves phase, and strictly decreases mu by two. Non-restoring pairs and final odd tails exit to independent dual-target certificates. This is not a generic ownership symmetry theorem and does not reset any expired deadline.'
  :'Exact refusal-specific post-G1 scheduler only. Unproved exits/terminal branches remain explicit; no failure is interpreted as loss.',
 authority:'Exact C4-0010 transitions/residuals and enabled-singleton terminal facts, strict finite mu descent for recursive stutters, and independently qualified dual-target/rho exit certificates under unchanged bounds. No solved labels, external oracle premise, or unrestricted q-frontier recursion.'
};
console.log(`POST_SEIZURE_STUTTER_INDUCTION=${JSON.stringify(result)}`);
assert.equal(proof.proved,true,`${refusalName}: post-seizure stutter induction failed`);
