#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const G=6,G3=20,C=2;
const ROOTS=Object.freeze([
 '46656555464431333374',
 '46656555464432333374',
]);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:1});
function stateSummary(state){return {rank:e.rank(state),heights:e.heights(state),mu:e.mu(state),G3Live:e.singleton(state,0,G3),G3Distance:e.targetDistance(state,G3),p0Enabled:e.enabledSingletons(state,0).map(e.coord),p1Enabled:e.enabledSingletons(state,1).map(e.coord)};}
function immediateP0(state){return e.terminalActions(state,0).map(x=>e.col(x.column));}

const rows=[];
for(const sequence of ROOTS){
 const root=replay(k,sequence);
 assert.equal(e.rank(root),20);assert(e.invariant(root,G3));assert.equal(e.mu(root),16);assert.equal(e.capacity(root,C),1);
 const targetSupportCell=e.landing(root,G);assert.equal(e.coord(targetSupportCell),'G2','expected live-target support G2');
 const afterSupport=k.advance(root,G);assert(afterSupport>=0&&afterSupport!==domain.QN_TERMINAL_WIN);assert.equal(e.rank(afterSupport),21);
 assert.equal(e.singleton(afterSupport,0,G3),true,'G3 singleton lost after G2 support');
 assert.equal(e.landing(afterSupport,G),G3,'G3 did not become directly playable');
 const replies=[];
 for(const reply of e.legal(afterSupport)){
  const cell=e.landing(afterSupport,reply);
  const child=k.advance(afterSupport,reply);
  if(child===domain.QN_TERMINAL_WIN){
   assert(new Set(e.enabledSingletons(afterSupport,1)).has(cell),`P1 terminal ${e.coord(cell)} lacks enabled singleton premise`);
   replies.push({reply:e.col(reply),replyCell:e.coord(cell),route:'P1_terminal'});continue;
  }
  assert(child>=0&&e.rank(child)===22);
  const p0wins=immediateP0(child);
  const isTargetBlock=reply===G&&cell===G3;
  replies.push({reply:e.col(reply),replyCell:e.coord(cell),route:p0wins.length?'P0_immediate_terminal':(isTargetBlock?'G3_target_block':'nonterminal_no_immediate_P0'),p0TerminalColumns:p0wins,summary:stateSummary(child)});
 }
 const nonBlock=replies.filter(x=>x.reply!=='G');
 const block=replies.find(x=>x.reply==='G');assert(block,'missing G3 reply');
 const forcedTargetBlock=replies.every(x=>x.reply==='G'||x.route==='P0_immediate_terminal')&&block.route==='G3_target_block';

 // At the forced G3-block state, test whether an enabled P1 singleton now imposes an exact one-turn defensive deadline.
 let forcedDefense=null;
 if(block.route==='G3_target_block'){
  const blockState=k.advance(afterSupport,G);assert(blockState>=0&&blockState!==domain.QN_TERMINAL_WIN);
  const p1Deadlines=e.enabledSingletons(blockState,1);
  const defenses=[];
  for(const action of e.legal(blockState)){
   const actionCell=e.landing(blockState,action),afterP0=k.advance(blockState,action);
   if(afterP0===domain.QN_TERMINAL_WIN){defenses.push({action:e.col(action),cell:e.coord(actionCell),route:'P0_terminal'});continue;}
   assert(afterP0>=0);
   const terminalReplies=[];
   for(const reply of e.legal(afterP0)){
    const replyCell=e.landing(afterP0,reply),next=k.advance(afterP0,reply);
    if(next===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));terminalReplies.push({reply:e.col(reply),cell:e.coord(replyCell)});}
   }
   defenses.push({action:e.col(action),cell:e.coord(actionCell),route:terminalReplies.length?'allows_P1_terminal':'no_immediate_P1_terminal',terminalReplies});
  }
  forcedDefense={p1Deadlines:p1Deadlines.map(e.coord),actions:defenses,safeNonterminalActions:defenses.filter(x=>x.route==='no_immediate_P1_terminal').map(x=>x.action),immediateP0Actions:defenses.filter(x=>x.route==='P0_terminal').map(x=>x.action)};
 }
 rows.push({sequence,root:stateSummary(root),targetSupportAction:'G2',forcedTargetBlock,replies,forcedDefense});
}

console.log(`G3_MU16_TARGET_SUPPORT_HANDOFF=${JSON.stringify({
 kind:'standard7x6-g3-mu16-target-support-temporal-handoff-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactFalsifierRoots:rows.length,
 rootsWithForcedG3Block:rows.filter(x=>x.forcedTargetBlock).length,
 rows,
 interpretation:rows.every(x=>x.forcedTargetBlock)
  ? 'At both exact G3/mu16 resolved-tail falsifiers, P0:G2 creates an exact G3 response obligation: every non-G3 nonterminal P1 reply yields an immediate P0 terminal action, so G3 is the unique nonlosing P1 response unless P1 has an immediate terminal override. The post-G3-block state is the next temporal-contract seam.'
  : 'Target support is not universally a forced-block macro on the two exact falsifiers. Preserve the reported nonblocking or P1-terminal reply as the next separator.',
 theoremBoundary:'Exact only for the two G3/mu16 roots preserved by the green resolved-tail clean-corpus control. This is a bounded temporal handoff classifier, not a proof that either root is winning, not q equality, and not solved-WDL/minimax authority.'
})}`);
