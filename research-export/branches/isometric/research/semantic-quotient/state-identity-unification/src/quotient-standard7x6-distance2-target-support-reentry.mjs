#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine, STANDARD7X6_REPAIR_COLUMNS as REPAIRS } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644',C=2,G=6,C3=16,G3=20,MAX=100000;
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function phase(e,state){return e.heights(state).map(x=>x&1).join('');}
function sortedCaps(e,state){return REPAIRS.map(c=>e.capacity(state,c)).sort((a,b)=>a-b).join(',');}
function resolvedCol(target){return target===G3?C:G;}
function isResource(msg){return msg.includes('lex proof-state cap exceeded')||msg.includes('reserved quotient');}

// Reconstruct every unique nonterminal rank20 child from the exact 84 post-block rank18 roots
// whose remaining P0 target singleton is live but still has support distance two.
const dk=makeKernel(),de=createRepairCapacityProofEngine(dk,{collectAllWinningActions:false,maxProofStates:1});
const states=new Map();
for(const fam of [
 {family:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
 {family:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of fam.replies1){
 const s16seq=ROOT+`${fam.resolved+1}${r1+1}${fam.resolved+1}${fam.resolved+1}`;
 const s16=replay(dk,s16seq),s17=dk.advance(s16,fam.resolved);assert(s17>=0&&de.rank(s17)===17);
 for(const r2 of de.legal(s17)){
  const r2Cell=de.landing(s17,r2),s18=dk.advance(s17,r2);if(s18===domain.QN_TERMINAL_WIN){assert(new Set(de.enabledSingletons(s17,1)).has(r2Cell));continue;}assert(s18>=0&&de.rank(s18)===18);
  const rootSeq=s16seq+String(fam.resolved+1)+String(r2+1);
  for(const action of de.legal(s18)){
   const s19=dk.advance(s18,action);if(s19===domain.QN_TERMINAL_WIN)continue;assert(s19>=0&&de.rank(s19)===19);
   for(const reply of de.legal(s19)){
    const cell=de.landing(s19,reply),s20=dk.advance(s19,reply);
    if(s20===domain.QN_TERMINAL_WIN){assert(new Set(de.enabledSingletons(s19,1)).has(cell));continue;}
    assert(s20>=0&&de.rank(s20)===20);if(de.terminalActions(s20,0).length)continue;
    if(!de.singleton(s20,0,fam.target)||de.targetDistance(s20,fam.target)!==2)continue;
    const key=de.exactStateTargetKey(s20,fam.target),sequence=rootSeq+String(action+1)+String(reply+1);
    const old=states.get(key);if(old)old.sources.push({rootSeq,action:de.col(action),reply:de.col(reply),sequence});
    else states.set(key,{sequence,target:fam.target,sources:[{rootSeq,action:de.col(action),reply:de.col(reply),sequence}],phase:phase(de,s20),sortedCaps:sortedCaps(de,s20),resolvedHeight:de.heights(s20)[fam.resolved],rootDeadlines:de.enabledSingletons(s20,1).map(de.coord)});
   }
  }
 }
}
assert(states.size>0,'no distance2 live-target children found');
const rows=[...states.values()];
const shards=new Map();
for(const row of rows){const key=`${row.target===C3?'C3':'G3'}|p${row.phase}|c${row.sortedCaps}|rh${row.resolvedHeight}|d${row.rootDeadlines.join(',')||'none'}`;const a=shards.get(key)??[];a.push(row);shards.set(key,a);}

function runShard(shardKey,group){
 const k=makeKernel(),lex=createResolvedTailLexicographicProofEngine(k,{maxProofStates:MAX}),e=lex.repair;const out=[];let resourceFailure=null;
 for(const row of group){
  const state=replay(k,row.sequence);assert.equal(e.rank(state),20);assert(e.singleton(state,0,row.target));assert.equal(e.targetDistance(state,row.target),2);
  const targetCol=row.target%7,targetSupport=e.landing(state,targetCol);assert.notEqual(targetSupport,0xff);assert.equal(Math.floor(targetSupport/7),0,'distance2 target support should be row1');
  const afterP0=k.advance(state,targetCol);
  if(afterP0===domain.QN_TERMINAL_WIN){out.push({...row,closed:true,witness:e.coord(targetSupport),kind:'P0_terminal_on_target_support',routes:{}});continue;}
  assert(afterP0>=0&&e.rank(afterP0)===21);
  const routes={};let closed=true,firstFailure=null;
  for(const reply of e.legal(afterP0)){
   const replyCell=e.landing(afterP0,reply),child=k.advance(afterP0,reply);
   if(child===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));closed=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:'P1_terminal'};routes.P1_terminal=(routes.P1_terminal??0)+1;continue;}
   assert(child>=0&&e.rank(child)===22);
   if(e.terminalActions(child,0).length){routes.immediate_P0_terminal=(routes.immediate_P0_terminal??0)+1;continue;}
   if(!e.invariant(child,row.target)){closed=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:'outside_distance1_invariant',targetLive:e.singleton(child,0,row.target),targetDistance:e.targetDistance(child,row.target),enabledP1:e.enabledSingletons(child,1).map(e.coord)};routes.outside_distance1_invariant=(routes.outside_distance1_invariant??0)+1;continue;}
   let p;
   try{p=lex.prove(child,row.target);}catch(err){const msg=String(err?.message??err);if(isResource(msg)){resourceFailure=msg;return {shardKey,candidateStates:group.length,evaluatedStates:out.length,closedStates:out.filter(x=>x.closed).length,failedStates:out.filter(x=>!x.closed).length,resourceFailure,stats:lex.stats(),rows:out};}throw err;}
   if(p.proved){routes.lexicographic_induction=(routes.lexicographic_induction??0)+1;continue;}
   closed=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:p.kind,measure:p.measure,rejected:p.rejected?.slice(0,6)??[]};routes.lexicographic_unproved=(routes.lexicographic_unproved??0)+1;
  }
  out.push({...row,closed,witness:e.coord(targetSupport),kind:closed?'target_support_reentry':'rejected',routes,firstFailure});
 }
 return {shardKey,candidateStates:group.length,evaluatedStates:out.length,closedStates:out.filter(x=>x.closed).length,failedStates:out.filter(x=>!x.closed).length,resourceFailure,stats:lex.stats(),rows:out};
}
const results=[];for(const [key,group] of [...shards.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){results.push(runShard(key,group));if(typeof globalThis.gc==='function')globalThis.gc();}
const all=results.flatMap(x=>x.rows),closed=all.filter(x=>x.closed),failed=all.filter(x=>!x.closed),resource=results.filter(x=>x.resourceFailure),routeCounts={};for(const x of all)for(const [r,n] of Object.entries(x.routes??{}))routeCounts[r]=(routeCounts[r]??0)+n;
console.log(`DISTANCE2_TARGET_SUPPORT_REENTRY=${JSON.stringify({
 kind:'standard7x6-distance2-live-target-support-reentry-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactDistance2States:rows.length,structuralShardCount:results.length,evaluatedStates:all.length,closedStates:closed.length,failedStates:failed.length,resourceShards:resource.length,routeCounts,
 shards:results.map(x=>({shardKey:x.shardKey,candidateStates:x.candidateStates,evaluatedStates:x.evaluatedStates,closedStates:x.closedStates,failedStates:x.failedStates,resourceFailure:x.resourceFailure,stats:x.stats})),
 failureSamples:failed.slice(0,20).map(x=>({sequence:x.sequence,target:x.target===C3?'C3':'G3',sources:x.sources.slice(0,4),rootDeadlines:x.rootDeadlines,firstFailure:x.firstFailure,routes:x.routes})),
 interpretation:resource.length
  ? 'At least one execution shard hit the unchanged resource boundary. Preserve that exact shard; do not widen the cap.'
  : failed.length===0
    ? 'Every exact rank20 live-target/support-distance-two child generated at the post-block predecessor boundary has a branch-complete target-support re-entry macro: P0 advances row1 of the target column and every P1 reply either gives an immediate P0 terminal certificate or enters the qualified distance-one lexicographic induction.'
    : 'Target-support re-entry is not universal over the distance-two post-block children. Preserve the exact terminal/invariant/lexicographic falsifiers and refine only that action-conditioned contract.',
 theoremBoundary:'This tests only the exact unique rank20 distance-two live-target children generated from the 84 post-block rank18 states. It uses one fixed P0 target-support action, exact P1 reply enumeration, immediate terminal certificates, and the already-qualified distance-one lexicographic theorem. No solved WDL, arbitrary q-frontier recursion, state equality, or root result is inferred.'
})}`);
