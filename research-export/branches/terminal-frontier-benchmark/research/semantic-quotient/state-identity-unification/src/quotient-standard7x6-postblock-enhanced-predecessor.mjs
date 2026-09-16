#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine, STANDARD7X6_REPAIR_COLUMNS as REPAIRS } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';
import { proveDistance2TargetSupportReentry } from './quotient-standard7x6-distance2-target-support-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644',C=2,G=6,C3=16,G3=20,MAX=100000;
const FILTER=(process.env.FILTER_TARGET??'all').toUpperCase();
assert(['ALL','C3','G3'].includes(FILTER),`bad FILTER_TARGET ${FILTER}`);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function phase(e,state){return e.heights(state).map(x=>x&1).join('');}
function sortedCaps(e,state){return REPAIRS.map(c=>e.capacity(state,c)).sort((a,b)=>a-b).join(',');}
function resolvedCol(target){return target===G3?C:G;}
function targetName(target){return target===C3?'C3':'G3';}
function isResource(msg){return msg.includes('lex proof-state cap exceeded')||msg.includes('reserved quotient');}

const dk=makeKernel(),de=createRepairCapacityProofEngine(dk,{collectAllWinningActions:false,maxProofStates:1});
const roots=[];
for(const fam of [
 {family:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
 {family:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
]){
 if(FILTER!=='ALL'&&FILTER!==targetName(fam.target))continue;
 for(const r1 of fam.replies1){
  const s16seq=ROOT+`${fam.resolved+1}${r1+1}${fam.resolved+1}${fam.resolved+1}`;
  const s16=replay(dk,s16seq);assert.equal(de.rank(s16),16);
  const threat=de.landing(s16,fam.resolved);assert(new Set(de.enabledSingletons(s16,1)).has(threat));
  const s17=dk.advance(s16,fam.resolved);assert(s17>=0&&de.rank(s17)===17);
  for(const r2 of de.legal(s17)){
   const cell=de.landing(s17,r2),s18=dk.advance(s17,r2);
   if(s18===domain.QN_TERMINAL_WIN){assert(new Set(de.enabledSingletons(s17,1)).has(cell));continue;}
   assert(s18>=0&&de.rank(s18)===18);
   roots.push({family:fam.family,r1,r2,sequence:s16seq+String(fam.resolved+1)+String(r2+1),target:fam.target,phase:phase(de,s18),sortedCaps:sortedCaps(de,s18),resolvedHeight:de.heights(s18)[fam.resolved]});
  }
 }
}
assert.equal(roots.length,FILTER==='ALL'?84:42,'post-block filtered rank18 domain drift');

const shards=new Map();
for(const row of roots){const key=`${targetName(row.target)}|p${row.phase}|c${row.sortedCaps}|rh${row.resolvedHeight}`;const a=shards.get(key)??[];a.push(row);shards.set(key,a);}

function buildKnown20(k,e){
 const known=new Map();
 for(const c of [
  {prefix:'3733',resolved:C,target:G3},{prefix:'7333',resolved:C,target:G3},
  {prefix:'3777',resolved:G,target:C3},{prefix:'7377',resolved:G,target:C3},
 ]){
  const s19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));assert.equal(e.rank(s19),19);
  for(const r of REPAIRS){const s20=k.advance(s19,r);assert(s20>=0&&e.rank(s20)===20);const old=known.get(s20);if(old!==undefined)assert.equal(old,c.target);else known.set(s20,c.target);}
 }
 return known;
}
function actionOrder(e,state,target){
 const targetCol=target%7,resolved=resolvedCol(target),preferred=[targetCol,0,1,3,4,5,resolved],legal=new Set(e.legal(state));
 return [...new Set([...preferred,...e.legal(state)])].filter(c=>legal.has(c));
}

function runShard(shardKey,group){
 const k=makeKernel(),lex=createResolvedTailLexicographicProofEngine(k,{maxProofStates:MAX}),e=lex.repair,known20=buildKnown20(k,e);
 const leafCounts={};const rows=[];let resourceFailure=null;
 function bump(k){leafCounts[k]=(leafCounts[k]??0)+1;}
 function discharge(child,target){
  if(e.terminalActions(child,0).length){bump('immediate_P0_terminal');return {closed:true,route:'immediate_P0_terminal'};}
  const exact=known20.get(child);if(exact!==undefined&&exact===target){bump('qualified_exact_rank20');return {closed:true,route:'qualified_exact_rank20'};}
  const live=e.singleton(child,0,target),distance=live?e.targetDistance(child,target):null;
  if(live&&distance===1){const p=lex.prove(child,target);if(p.proved){bump('distance1_lexicographic');return {closed:true,route:'distance1_lexicographic',witness:p.witness??null};}bump('distance1_lexicographic_unproved');return {closed:false,route:'distance1_lexicographic_unproved',measure:p.measure??null,rejected:p.rejected?.slice(0,6)??[]};}
  if(live&&distance===2){const p=proveDistance2TargetSupportReentry(k,lex,child,target);if(p.proved){bump('distance2_target_support_reentry');return {closed:true,route:'distance2_target_support_reentry',witness:p.witness,routes:p.routes};}bump('distance2_target_support_rejected');return {closed:false,route:'distance2_target_support_rejected',firstFailure:p.firstFailure??null,routes:p.routes??{}};}
  bump('outside_supported_contract');return {closed:false,route:'outside_supported_contract',targetLive:live,targetDistance:distance,enabledP1:e.enabledSingletons(child,1).map(e.coord)};
 }
 rootLoop: for(const root of group){
  const state=replay(k,root.sequence);assert.equal(e.rank(state),18);const attempts=[];let witness=null;
  for(const action of actionOrder(e,state,root.target)){
   const actionCell=e.landing(state,action),afterP0=k.advance(state,action);
   if(afterP0===domain.QN_TERMINAL_WIN){witness={column:e.col(action),kind:'P0_terminal_now'};attempts.push({column:e.col(action),accepted:true,kind:'P0_terminal_now'});break;}
   assert(afterP0>=0&&e.rank(afterP0)===19);let accepted=true,firstFailure=null;const routes={};
   for(const reply of e.legal(afterP0)){
    const replyCell=e.landing(afterP0,reply),child=k.advance(afterP0,reply);
    if(child===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));accepted=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:'P1_terminal'};routes.P1_terminal=(routes.P1_terminal??0)+1;break;}
    assert(child>=0&&e.rank(child)===20);
    let d;
    try{d=discharge(child,root.target);}catch(err){const msg=String(err?.message??err);if(isResource(msg)){resourceFailure=msg;break rootLoop;}throw err;}
    routes[d.route]=(routes[d.route]??0)+1;
    if(!d.closed){accepted=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:d.route,detail:d};break;}
   }
   attempts.push({column:e.col(action),actionCell:e.coord(actionCell),accepted,firstFailure,routes});
   if(accepted){witness={column:e.col(action),kind:'branch_complete_enhanced_predecessor',routes};break;}
  }
  rows.push({...root,closed:witness!==null,witness,attempts});
 }
 return {shardKey,candidateStates:group.length,evaluatedStates:rows.length,closedStates:rows.filter(x=>x.closed).length,failedStates:rows.filter(x=>!x.closed).length,resourceFailure,leafCounts,stats:lex.stats(),rows};
}

const results=[];for(const [key,group] of [...shards.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){results.push(runShard(key,group));if(typeof globalThis.gc==='function')globalThis.gc();}
const all=results.flatMap(x=>x.rows),closed=all.filter(x=>x.closed),failed=all.filter(x=>!x.closed),resource=results.filter(x=>x.resourceFailure),witnessColumns={},leafCounts={};
for(const x of closed){const c=x.witness.column;witnessColumns[c]=(witnessColumns[c]??0)+1;}
for(const x of results)for(const [k0,n] of Object.entries(x.leafCounts))leafCounts[k0]=(leafCounts[k0]??0)+n;
console.log(`POSTBLOCK_ENHANCED_PREDECESSOR=${JSON.stringify({
 kind:'standard7x6-postblock-enhanced-branch-complete-predecessor-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 filterTarget:FILTER,exactRank18States:roots.length,structuralShardCount:results.length,evaluatedStates:all.length,closedStates:closed.length,failedStates:failed.length,resourceShards:resource.length,witnessColumns,leafCounts,
 shards:results.map(x=>({shardKey:x.shardKey,candidateStates:x.candidateStates,evaluatedStates:x.evaluatedStates,closedStates:x.closedStates,failedStates:x.failedStates,resourceFailure:x.resourceFailure,stats:x.stats})),
 failureSamples:failed.slice(0,20).map(x=>({member:`${x.family}:${de.col(x.r1)}->${de.col(x.r2)}`,sequence:x.sequence,target:targetName(x.target),attempts:x.attempts})),
 interpretation:resource.length
  ? 'At least one execution shard hit the unchanged resource boundary. Preserve that shard; no failure is inferred for unevaluated roots.'
  : failed.length===0
    ? 'Every exact filtered post-forced-block rank18 state has an existential branch-complete P0 witness after composing immediate terminal leaves, the retained rank20 theorem, distance-one lexicographic induction, and guarded distance-two target-support re-entry.'
    : 'The enhanced predecessor closes additional rank18 states but preserves exact logical falsifiers. Candidate failure is action-relative: a rejected action does not imply state loss. Route only from the reported root/action/reply separators.',
 theoremBoundary:'Exact one-step alternating predecessor over the filtered post-block rank18 domain. Distance-two re-entry is invoked as a guarded leaf and may reject a branch; it is not assumed universal. Recursive proof remains the distance-one lexicographic theorem under unchanged limits. No solved WDL, q equality, arbitrary frontier recursion, center-opening membership, or root solve.'
})}`);
