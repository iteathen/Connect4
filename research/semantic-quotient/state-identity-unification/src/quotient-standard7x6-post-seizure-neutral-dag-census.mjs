#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644';
const C3=16,G3=20,G=6;
const REPAIR=Object.freeze([0,1,3,4,5]);
const REFUSALS=Object.freeze({D:3,E:4,F:5});
const MAX_NEUTRAL_STATES=100000;

function replay(k,s){let id=k.rootId;for(const d of s){const n=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(n)&&n>=0,`bad replay ${s}`);id=n;}return id;}
function col(c){return String.fromCharCode(65+c);}
function coord(x){return `${col(x%7)}${Math.floor(x/7)+1}`;}
function phase(e,id){return e.heights(id).map(h=>h&1).join('');}

function makeKernel(){
 const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});
 kernel.prepareSearchStorage();
 return kernel;
}

function census(refusalName){
 const refusalCol=REFUSALS[refusalName];
 const k=makeKernel();
 const e=createRepairCapacityProofEngine(k,{maxProofStates:1});
 function neutral(id){
  if((e.rank(id)&1)!==1)return {ok:false,reason:'not_P1_turn'};
  if(!e.singleton(id,0,C3)||!e.singleton(id,0,G3))return {ok:false,reason:'target_not_live'};
  if(e.targetDistance(id,C3)!==1||e.targetDistance(id,G3)!==1)return {ok:false,reason:'target_distance_not_one'};
  const p0=e.enabledSingletons(id,0),p1=e.enabledSingletons(id,1);
  if(p0.length||p1.length)return {ok:false,reason:'enabled_obligation_present'};
  if(e.terminalActions(id,1).length)return {ok:false,reason:'P1_terminal_present'};
  return {ok:true,mu:e.mu(id),phaseBits:phase(e,id)};
 }
 const activated=replay(k,ROOT+'3');
 const refusal=k.advance(activated,refusalCol);assert(refusal>=0&&refusal!==domain.QN_TERMINAL_WIN);
 const refusalSequence=ROOT+'3'+String(refusalCol+1);
 assert.equal(e.landing(refusal,G),G);
 const entry=k.advance(refusal,G);assert(entry>=0&&entry!==domain.QN_TERMINAL_WIN);
 const entrySequence=refusalSequence+'7';
 const entryContract=neutral(entry);assert.equal(entryContract.ok,true,`${refusalName}: neutral entry failed`);

 const seen=new Map([[entry,{sequence:entrySequence,mu:entryContract.mu}]]);
 const queue=[entry];
 const rows=[];
 const exits=new Map();
 const muHistogram={};
 let edgeCount=0,terminalClosures=0,immediateClosures=0,repairTerminalClosures=0,maxRepairCandidates=0;
 while(queue.length){
  const state=queue.pop();
  const info=seen.get(state);
  const contract=neutral(state);assert.equal(contract.ok,true);
  muHistogram[contract.mu]=(muHistogram[contract.mu]??0)+1;
  const branches=[];
  for(const action of e.legal(state)){
   const eventCell=e.landing(state,action);
   const afterP1=k.advance(state,action);
   const afterP1Sequence=info.sequence+String(action+1);
   if(afterP1===domain.QN_TERMINAL_WIN){terminalClosures++;branches.push({P1:col(action),cell:coord(eventCell),route:'P1_terminal'});continue;}
   assert(afterP1>=0&&e.rank(afterP1)===e.rank(state)+1);
   const immediate=e.terminalActions(afterP1,0);
   if(immediate.length){immediateClosures++;branches.push({P1:col(action),cell:coord(eventCell),route:'immediate_P0_terminal'});continue;}
   const candidates=[];
   for(const response of REPAIR){
    const responseCell=e.landing(afterP1,response);if(responseCell===0xff)continue;
    const afterP0=k.advance(afterP1,response);
    if(afterP0===domain.QN_TERMINAL_WIN){repairTerminalClosures++;candidates.push({P0:col(response),route:'P0_terminal'});continue;}
    assert(afterP0>=0&&e.rank(afterP0)===e.rank(state)+2);
    const restored=neutral(afterP0);
    if(!restored.ok||restored.mu>=contract.mu)continue;
    edgeCount++;
    candidates.push({P0:col(response),route:'smaller_neutral',child:afterP0,afterMu:restored.mu});
    if(!seen.has(afterP0)){
      if(seen.size>=MAX_NEUTRAL_STATES)throw new Error(`neutral DAG cap exceeded ${MAX_NEUTRAL_STATES}`);
      seen.set(afterP0,{sequence:afterP1Sequence+String(response+1),mu:restored.mu});
      queue.push(afterP0);
    }
   }
   maxRepairCandidates=Math.max(maxRepairCandidates,candidates.length);
   if(candidates.length){branches.push({P1:col(action),cell:coord(eventCell),route:'repair_candidates',candidates});continue;}
   if(!exits.has(afterP1))exits.set(afterP1,{sequence:afterP1Sequence,muAfterP1:e.mu(afterP1),phaseBits:phase(e,afterP1)});
   branches.push({P1:col(action),cell:coord(eventCell),route:'dual_exit_required',exitState:afterP1});
  }
  rows.push({state,sequence:info.sequence,mu:contract.mu,phaseBits:contract.phaseBits,branches});
 }
 // Every neutral edge must descend, so sorting by mu gives a direct bottom-up qualification order.
 rows.sort((a,b)=>a.mu-b.mu||a.sequence.localeCompare(b.sequence));
 const exitRows=[...exits.entries()].map(([state,x])=>({state,...x})).sort((a,b)=>a.muAfterP1-b.muAfterP1||a.sequence.localeCompare(b.sequence));
 return {
  refusal:refusalName,refusalSequence,entrySequence,entryMu:entryContract.mu,
  neutralStates:rows.length,edgeCount,uniqueDualExits:exitRows.length,
  p1TerminalBranches:terminalClosures,immediateP0TerminalBranches:immediateClosures,
  repairP0TerminalCandidates:repairTerminalClosures,maxRepairCandidates,muHistogram,
  exits:exitRows,
  rows,
 };
}

const requested=process.argv[2];
const names=requested?[requested]:Object.keys(REFUSALS);
for(const name of names)if(!(name in REFUSALS))throw new Error('usage: neutral-dag-census [D|E|F]');
const results=names.map(census);
console.log(`POST_SEIZURE_NEUTRAL_DAG_CENSUS=${JSON.stringify({
 kind:'standard7x6-post-seizure-neutral-ranked-dag-census-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 results,
 theoremBoundary:'Exact reachable neutral-contract DAG only. Edges are P1/P0 repair pairs that re-enter the same deadline-free dual-target contract with strictly smaller mu. Dual exits are retained as unresolved certificate boundaries; this census does not infer W/L or treat candidate failure as loss.',
 authority:'Exact C4-0010 transitions/residuals and terminal surfaces under unchanged quotient bounds. No solved labels, external oracle, or unrestricted q recursion.'
})}`);
