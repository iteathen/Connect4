#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const G=6,G3=20;
const FALSIFIERS=Object.freeze([
 '46656555464431333374',
 '46656555464432333374',
]);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}

const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:1});
const rows=[];
for(const sequence of FALSIFIERS){
 const state=replay(k,sequence);assert.equal(e.rank(state),20);assert(e.invariant(state,G3));assert.equal(e.mu(state),16);assert.equal(e.enabledSingletons(state,1).length,0);
 const support=e.landing(state,G);assert.equal(e.coord(support),'G2','live-target support action drift');
 const afterP0=k.advance(state,G);assert(afterP0>=0&&afterP0!==domain.QN_TERMINAL_WIN);assert.equal(e.rank(afterP0),21);assert(e.singleton(afterP0,0,G3));assert.equal(e.landing(afterP0,G),G3);
 const branches=[];
 for(const reply of e.legal(afterP0)){
  const replyCell=e.landing(afterP0,reply),child=k.advance(afterP0,reply);
  if(child===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));branches.push({reply:e.col(reply),replyCell:e.coord(replyCell),route:'P1_terminal'});continue;}
  assert(child>=0&&e.rank(child)===22);
  const immediate=e.terminalActions(child,0);
  if(immediate.length){branches.push({reply:e.col(reply),replyCell:e.coord(replyCell),route:'immediate_P0_terminal',terminalColumns:immediate.map(x=>e.col(x.column))});continue;}
  const targetLive=e.singleton(child,0,G3),targetDistance=e.targetDistance(child,G3),p1Deadlines=e.enabledSingletons(child,1).map(e.coord),p0Enabled=e.enabledSingletons(child,0).map(e.coord);
  branches.push({reply:e.col(reply),replyCell:e.coord(replyCell),route:reply===G?'target_consumed_nonterminal':'target_support_deviation_nonterminal',targetLive,targetDistance,p0Enabled,p1Deadlines,mu:e.mu(child),heights:e.heights(child)});
 }
 rows.push({sequence,supportAction:'G2',branches});
}
const flat=rows.flatMap(x=>x.branches),counts={};for(const x of flat)counts[x.route]=(counts[x.route]??0)+1;
const targetConsumed=flat.filter(x=>x.route==='target_consumed_nonterminal');
const deviations=flat.filter(x=>x.route==='target_support_deviation_nonterminal');
console.log(`G3_MU16_TARGET_SUPPORT_FALSIFIER_ROUTING=${JSON.stringify({
 kind:'standard7x6-g3-mu16-target-support-falsifier-routing-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactFalsifiers:rows.length,branchCount:flat.length,routeCounts:counts,rows,
 targetConsumedBranches:targetConsumed,
 nonterminalDeviationBranches:deviations,
 interpretation:counts.P1_terminal
  ? 'The previously excluded live-target support action is not universally safe: at least one exact P1 terminal override exists.'
  : targetConsumed.length===rows.length&&deviations.length===0
    ? 'Every nonterminal branch is the forced target response; route the two exact target-consumed successors as the next contract seam.'
    : deviations.length===0
      ? 'All P1 deviations from the target response give an immediate P0 terminal certificate. Only the exact target-consumed response remains as a new contract seam.'
      : 'Some nonterminal P1 deviations do not yield immediate P0 terminality; preserve their exact residual/deadline facts before promoting target support.',
 theoremBoundary:'Exact only for the two shared G3/mu16 falsifier roots. This tests the one previously excluded structural action P0:G2 and exhausts its legal P1 reply horizon. It does not infer that target support is safe elsewhere, and it uses no solved WDL or recursive frontier search.'
})}`);
