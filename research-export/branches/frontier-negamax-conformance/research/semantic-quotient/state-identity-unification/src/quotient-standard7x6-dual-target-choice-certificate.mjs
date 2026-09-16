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
const C=2,G=6,C3=16,G3=20;
const BRANCH_COMPOSER=fileURLToPath(new URL('./quotient-standard7x6-rho-action-branch-composition.mjs',import.meta.url));
const sequence=process.argv[2];
if(!sequence)throw new Error('usage: dual-target-choice-certificate <sequence>');

function replay(k,s){let id=k.rootId;for(const d of s){const n=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(n)&&n>=0,`bad replay ${s}`);id=n;}return id;}
function col(c){return String.fromCharCode(65+c);}
function coord(x){return `${col(x%7)}${Math.floor(x/7)+1}`;}
function targetName(t){return t===C3?'C3':'G3';}
function runBranch(sequence,target,actionCol){
 const child=spawnSync(process.execPath,[BRANCH_COMPOSER,sequence,targetName(target),col(actionCol)],{encoding:'utf-8',timeout:270000,maxBuffer:32*1024*1024});
 if(child.error)throw child.error;
 if(child.status!==0)return {proved:false,kind:'branch_composer_process_error',error:(child.stderr??'').slice(-8000)};
 const line=(child.stdout??'').split(/\r?\n/).find(x=>x.startsWith('RHO_ACTION_BRANCH_COMPOSITION='));
 if(!line)return {proved:false,kind:'branch_composer_output_missing',error:(child.stdout??'').slice(-8000)};
 return JSON.parse(line.slice('RHO_ACTION_BRANCH_COMPOSITION='.length));
}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});k.prepareSearchStorage();
const e=createRepairCapacityProofEngine(k,{maxProofStates:1});
const root=replay(k,sequence);
assert.equal(e.rank(root)&1,0,'dual-target certificate root must be P0 turn');
assert.equal(e.singleton(root,0,C3),true,'C3 not live');
assert.equal(e.singleton(root,0,G3),true,'G3 not live');
assert.equal(e.targetDistance(root,C3),1,'C3 not distance one');
assert.equal(e.targetDistance(root,G3),1,'G3 not distance one');

function tryOrder(attackCol,attackTarget,otherTarget){
 const support=e.landing(root,attackCol);
 if(support!==attackTarget-7)return {closed:false,attack:targetName(attackTarget),reason:'support_not_direct',support:support===0xff?null:coord(support)};
 const afterP0=k.advance(root,attackCol);
 if(afterP0===domain.QN_TERMINAL_WIN)return {closed:true,attack:targetName(attackTarget),route:'P0_terminal_on_support',responses:[]};
 assert(afterP0>=0&&e.rank(afterP0)===e.rank(root)+1);
 assert.equal(e.landing(afterP0,attackCol),attackTarget);
 let closed=true,blockLeaf=null,leafProof=null;const responses=[];
 for(const reply of e.legal(afterP0)){
  const replyCell=e.landing(afterP0,reply),child=k.advance(afterP0,reply);
  if(child===domain.QN_TERMINAL_WIN){closed=false;responses.push({reply:col(reply),replyCell:coord(replyCell),route:'P1_terminal_override'});continue;}
  assert(child>=0&&e.rank(child)===e.rank(root)+2);
  if(replyCell!==attackTarget){
   const terminal=e.terminalActions(child,0).find(x=>x.cell===attackTarget);
   if(!terminal){closed=false;responses.push({reply:col(reply),replyCell:coord(replyCell),route:'nonblock_without_target_terminal'});}
   else responses.push({reply:col(reply),replyCell:coord(replyCell),route:'nonblock_exposes_P0_target_terminal'});
   continue;
  }
  assert.equal(e.singleton(child,0,attackTarget),false);
  const live=e.singleton(child,0,otherTarget),distance=live?e.targetDistance(child,otherTarget):null;
  if(!live||distance!==1){closed=false;responses.push({reply:col(reply),replyCell:coord(replyCell),route:'block_destroyed_other_target',otherTarget:targetName(otherTarget),live,distance});continue;}
  const digit=String(attackCol+1);blockLeaf=sequence+digit+digit;
  leafProof=runBranch(blockLeaf,otherTarget,attackCol);
  if(!leafProof.proved){closed=false;responses.push({reply:col(reply),replyCell:coord(replyCell),route:'resolved_tail_branch_unproved',blockLeaf,leafProof});}
  else responses.push({reply:col(reply),replyCell:coord(replyCell),route:'forced_block_to_branch_composed_rho',blockLeaf,leafCertificate:{selectedAction:leafProof.selectedAction,beforeMeasure:leafProof.beforeMeasure,afterP0Measure:leafProof.afterP0Measure,branchCount:leafProof.branchCount,certificate:leafProof.certificate}});
 }
 return {closed,attack:targetName(attackTarget),supportEvent:coord(support),route:closed?'target_order_closed':'target_order_open',responses,blockLeaf,leafProof:leafProof?{proved:leafProof.proved,selectedAction:leafProof.selectedAction,certificate:leafProof.certificate}:null};
}

const attempts=[];
const gFirst=tryOrder(G,G3,C3);attempts.push(gFirst);
let selected=gFirst.closed?gFirst:null;
if(!selected){const cFirst=tryOrder(C,C3,G3);attempts.push(cFirst);if(cFirst.closed)selected=cFirst;}
const result={
 kind:'standard7x6-dual-target-choice-certificate-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 sequence,proved:Boolean(selected),selectedTarget:selected?.attack??null,selected:selected??null,attempts,
 theoremBoundary:selected
  ?'Exact P0-turn state with both C3/G3 live at support distance one. At least one target-support action is proved by exhaustive P1 response closure and branch-composed rho after the exact block. No target-order symmetry is assumed.'
  :'Exact P0-turn dual-target state only. Both tested target orders remain explicit failures/unknown; no loss inference.',
 authority:'Exact C4-0010 transitions/terminal certificates plus branch-composed rho under unchanged limits. No solved W/D/L label, external oracle, or unrestricted q-frontier recursion.'
};
console.log(`DUAL_TARGET_CHOICE_CERTIFICATE=${JSON.stringify(result)}`);
