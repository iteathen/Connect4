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

// Reconstruct exactly the 84 rank-18 states after the already-qualified forced C4/G4 block and one P1 reply.
const dk=makeKernel(),de=createRepairCapacityProofEngine(dk,{collectAllWinningActions:false,maxProofStates:1});
const roots=[];
for(const fam of [
 {family:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
 {family:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of fam.replies1){
 const s16seq=ROOT+`${fam.resolved+1}${r1+1}${fam.resolved+1}${fam.resolved+1}`;
 const s16=replay(dk,s16seq);assert.equal(de.rank(s16),16);
 const threat=de.landing(s16,fam.resolved);assert(new Set(de.enabledSingletons(s16,1)).has(threat));
 const s17=dk.advance(s16,fam.resolved);assert(s17>=0&&de.rank(s17)===17);
 for(const r2 of de.legal(s17)){
  const cell=de.landing(s17,r2),s18=dk.advance(s17,r2);
  if(s18===domain.QN_TERMINAL_WIN){assert(new Set(de.enabledSingletons(s17,1)).has(cell));continue;}
  assert(s18>=0&&de.rank(s18)===18);
  const sequence=s16seq+String(fam.resolved+1)+String(r2+1);
  roots.push({family:fam.family,r1,r2,sequence,target:fam.target,phase:phase(de,s18),sortedCaps:sortedCaps(de,s18),resolvedHeight:de.heights(s18)[fam.resolved]});
 }
}
assert.equal(roots.length,84,'post-block rank18 domain drift');

const shards=new Map();
for(const row of roots){const key=`${row.target===C3?'C3':'G3'}|p${row.phase}|c${row.sortedCaps}|rh${row.resolvedHeight}`;const a=shards.get(key)??[];a.push(row);shards.set(key,a);}
const ordered=[...shards.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
function isResource(msg){return msg.includes('lex proof-state cap exceeded')||msg.includes('reserved quotient');}

function buildKnown20(k,e){
 const known=new Map();
 for(const c of [
  {prefix:'3733',resolved:C,target:G3},{prefix:'7333',resolved:C,target:G3},
  {prefix:'3777',resolved:G,target:C3},{prefix:'7377',resolved:G,target:C3},
 ]){
  const s19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));assert.equal(e.rank(s19),19);
  for(const r of REPAIRS){const s20=k.advance(s19,r);assert(s20>=0&&e.rank(s20)===20);const old=known.get(s20);if(old)assert.equal(old,c.target);else known.set(s20,c.target);}
 }
 assert.equal(known.size,16);return known;
}

function runShard(shardKey,group){
 const k=makeKernel(),lex=createResolvedTailLexicographicProofEngine(k,{maxProofStates:MAX}),e=lex.repair,known20=buildKnown20(k,e);
 const rows=[];let resourceFailure=null;
 rootLoop: for(const root of group){
  const state=replay(k,root.sequence);assert.equal(e.rank(state),18);const actions=[];let witness=null;
  for(const action of e.legal(state)){
   const actionCell=e.landing(state,action),afterP0=k.advance(state,action);
   if(afterP0===domain.QN_TERMINAL_WIN){witness={column:e.col(action),kind:'P0_terminal_now'};actions.push({column:e.col(action),accepted:true,kind:'P0_terminal_now'});break;}
   assert(afterP0>=0&&e.rank(afterP0)===19);
   let accepted=true,firstFailure=null;const routes={};
   for(const reply of e.legal(afterP0)){
    const replyCell=e.landing(afterP0,reply),child=k.advance(afterP0,reply);
    if(child===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));accepted=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:'P1_terminal'};routes.P1_terminal=(routes.P1_terminal??0)+1;continue;}
    assert(child>=0&&e.rank(child)===20);
    if(e.terminalActions(child,0).length){routes.immediate_P0_terminal=(routes.immediate_P0_terminal??0)+1;continue;}
    const exactTarget=known20.get(child);
    if(exactTarget!==undefined&&exactTarget===root.target){routes.qualified_exact_rank20=(routes.qualified_exact_rank20??0)+1;continue;}
    if(!e.invariant(child,root.target)){accepted=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:'outside_live_target_invariant',targetLive:e.singleton(child,0,root.target),targetDistance:e.targetDistance(child,root.target),enabledP1:e.enabledSingletons(child,1).map(e.coord)};routes.outside_live_target_invariant=(routes.outside_live_target_invariant??0)+1;continue;}
    let proof;
    try{proof=lex.prove(child,root.target);}catch(err){const msg=String(err?.message??err);if(isResource(msg)){resourceFailure=msg;break rootLoop;}throw err;}
    if(proof.proved){routes.lexicographic_induction=(routes.lexicographic_induction??0)+1;continue;}
    accepted=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:proof.kind,measure:proof.measure,rejected:proof.rejected?.slice(0,6)??[]};routes.lexicographic_unproved=(routes.lexicographic_unproved??0)+1;
   }
   actions.push({column:e.col(action),actionCell:e.coord(actionCell),accepted,firstFailure,routes});
   if(accepted){witness={column:e.col(action),kind:'branch_complete_lexicographic_predecessor',routes};break;}
  }
  rows.push({...root,closed:witness!==null,witness,actionAttempts:actions});
 }
 return {shardKey,candidateStates:group.length,evaluatedStates:rows.length,closedStates:rows.filter(x=>x.closed).length,failedStates:rows.filter(x=>!x.closed).length,resourceFailure,stats:lex.stats(),rows};
}

const results=[];
for(const [key,group] of ordered){results.push(runShard(key,group));if(typeof globalThis.gc==='function')globalThis.gc();}
const all=results.flatMap(x=>x.rows),failed=all.filter(x=>!x.closed),resourceShards=results.filter(x=>x.resourceFailure);
const witnessColumns={};for(const x of all.filter(x=>x.closed)){const c=x.witness.column;witnessColumns[c]=(witnessColumns[c]??0)+1;}
const totalCandidates=results.reduce((s,x)=>s+x.candidateStates,0),closedStates=all.filter(x=>x.closed).length;
const maxShardSize=Math.max(...results.map(x=>x.candidateStates)),maxProofStatesObserved=Math.max(...results.map(x=>x.stats.proofStates));
console.log(`POSTBLOCK_LEXICOGRAPHIC_PREDECESSOR=${JSON.stringify({
 kind:'standard7x6-postblock-branch-complete-lexicographic-predecessor-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactRank18States:totalCandidates,structuralShardCount:results.length,maxShardSize,evaluatedStates:all.length,closedStates,failedStates:failed.length,resourceShards:resourceShards.length,maxProofStatesObserved,witnessColumns,
 shards:results.map(x=>({shardKey:x.shardKey,candidateStates:x.candidateStates,evaluatedStates:x.evaluatedStates,closedStates:x.closedStates,failedStates:x.failedStates,resourceFailure:x.resourceFailure,stats:x.stats})),
 failureSamples:failed.slice(0,16).map(x=>({member:`${x.family}:${de.col(x.r1)}->${de.col(x.r2)}`,sequence:x.sequence,target:x.target===C3?'C3':'G3',firstAttempts:x.actionAttempts.slice(0,7)})),
 interpretation:resourceShards.length
  ? 'At least one execution shard hit the unchanged resource boundary. Preserve that shard; do not infer failure for unevaluated rank18 states and do not widen the cap.'
  : failed.length===0
    ? 'All 84 exact post-forced-block rank18 states have an existential branch-complete P0 predecessor witness whose complete P1 reply horizon is discharged by immediate P0 terminality, an exact qualified rank20 contract, or the resolved-tail plus repair lexicographic induction.'
    : 'Some exact post-block states remain unclosed after enumerating every legal P0 action and discharging all possible branches through the qualified contracts. Preserve only those exact rank18 action/reply falsifiers as the next seam; do not try to prove every rank20 gap winning.',
 theoremBoundary:'This is one alternating-predecessor composition step over the exact 84 rank18 post-block states. P0 actions are enumerated only at that predecessor boundary; recursive discharge uses the explicit lexicographic theorem over live-target/support-distance-one states. No solved WDL, arbitrary q-frontier recursion, state equality, or center/root claim is used.'
})}`);
