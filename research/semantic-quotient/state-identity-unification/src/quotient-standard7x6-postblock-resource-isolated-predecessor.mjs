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
const ACTION_ORDER=Object.freeze([0,2,6,1,3,4,5]); // observed witnesses first; exhaustive fallback remains exact.
const RESOURCE_SHARDS=new Set([
 'C3|p0000000|c2,2,2,4,6|rh4',
 'C3|p0000011|c1,2,2,6,6|rh5',
 'C3|p0000110|c1,1,2,6,6|rh4',
 'C3|p0100001|c2,2,2,5,6|rh5',
 'C3|p0100010|c1,2,2,5,6|rh4',
 'C3|p0100100|c1,2,2,5,6|rh4',
 'C3|p1000001|c2,2,2,5,6|rh5',
 'C3|p1000010|c1,2,2,5,6|rh4',
 'C3|p1000100|c1,2,2,5,6|rh4',
 'G3|p0000000|c2,2,2,4,6|rh4',
]);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function phase(e,state){return e.heights(state).map(x=>x&1).join('');}
function sortedCaps(e,state){return REPAIRS.map(c=>e.capacity(state,c)).sort((a,b)=>a-b).join(',');}
function resolvedCol(target){return target===G3?C:G;}
function shardKey(e,state,target){return `${target===C3?'C3':'G3'}|p${phase(e,state)}|c${sortedCaps(e,state)}|rh${e.heights(state)[resolvedCol(target)]}`;}
function isResource(msg){return msg.includes('lex proof-state cap exceeded')||msg.includes('reserved quotient');}

// Reconstruct the exact 84 rank18 states and retain only the ten resource-contaminated shards reported by the broad run.
const dk=makeKernel(),de=createRepairCapacityProofEngine(dk,{collectAllWinningActions:false,maxProofStates:1});
const roots=[];
for(const fam of [
 {family:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
 {family:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of fam.replies1){
 const s16seq=ROOT+`${fam.resolved+1}${r1+1}${fam.resolved+1}${fam.resolved+1}`;
 const s16=replay(dk,s16seq),threat=de.landing(s16,fam.resolved);assert(new Set(de.enabledSingletons(s16,1)).has(threat));
 const s17=dk.advance(s16,fam.resolved);assert(s17>=0&&de.rank(s17)===17);
 for(const r2 of de.legal(s17)){
  const replyCell=de.landing(s17,r2),s18=dk.advance(s17,r2);
  if(s18===domain.QN_TERMINAL_WIN){assert(new Set(de.enabledSingletons(s17,1)).has(replyCell));continue;}
  assert(s18>=0&&de.rank(s18)===18);
  const key=shardKey(de,s18,fam.target);
  if(RESOURCE_SHARDS.has(key))roots.push({family:fam.family,r1,r2,target:fam.target,sequence:s16seq+String(fam.resolved+1)+String(r2+1),shardKey:key});
 }
}
assert.equal(roots.length,15,'resource-root population drift');

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

function classifyReply(root,action,reply){
 const k=makeKernel(),lex=createResolvedTailLexicographicProofEngine(k,{maxProofStates:MAX}),e=lex.repair,known20=buildKnown20(k,e);
 const state=replay(k,root.sequence),afterP0=k.advance(state,action);assert(afterP0>=0&&afterP0!==domain.QN_TERMINAL_WIN);
 const replyCell=e.landing(afterP0,reply),child=k.advance(afterP0,reply);
 if(child===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));return {closed:false,route:'P1_terminal',reply:e.col(reply),replyCell:e.coord(replyCell),stats:lex.stats()};}
 assert(child>=0&&e.rank(child)===20);
 if(e.terminalActions(child,0).length)return {closed:true,route:'immediate_P0_terminal',reply:e.col(reply),replyCell:e.coord(replyCell),stats:lex.stats()};
 const exactTarget=known20.get(child);if(exactTarget!==undefined&&exactTarget===root.target)return {closed:true,route:'qualified_exact_rank20',reply:e.col(reply),replyCell:e.coord(replyCell),stats:lex.stats()};
 if(!e.invariant(child,root.target))return {closed:false,route:'outside_live_target_invariant',reply:e.col(reply),replyCell:e.coord(replyCell),targetLive:e.singleton(child,0,root.target),targetDistance:e.targetDistance(child,root.target),enabledP1:e.enabledSingletons(child,1).map(e.coord),stats:lex.stats()};
 try{
  const proof=lex.prove(child,root.target);
  return proof.proved
   ? {closed:true,route:'lexicographic_induction',reply:e.col(reply),replyCell:e.coord(replyCell),witness:proof.witness??null,stats:lex.stats()}
   : {closed:false,route:'lexicographic_unproved',reply:e.col(reply),replyCell:e.coord(replyCell),measure:proof.measure,rejected:proof.rejected?.slice(0,6)??[],stats:lex.stats()};
 }catch(err){const msg=String(err?.message??err);if(!isResource(msg))throw err;return {closed:false,route:'resource_boundary',reply:e.col(reply),replyCell:e.coord(replyCell),error:msg,stats:lex.stats()};}
}

function classifyAction(root,action){
 const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:1}),state=replay(k,root.sequence),cell=e.landing(state,action);
 if(cell===0xff)return {column:e.col(action),legal:false,accepted:false};
 const afterP0=k.advance(state,action);
 if(afterP0===domain.QN_TERMINAL_WIN)return {column:e.col(action),actionCell:e.coord(cell),legal:true,accepted:true,kind:'P0_terminal_now',branches:[]};
 assert(afterP0>=0&&e.rank(afterP0)===19);
 const replies=e.legal(afterP0),branches=[];
 for(const reply of replies){const branch=classifyReply(root,action,reply);branches.push(branch);if(!branch.closed)return {column:e.col(action),actionCell:e.coord(cell),legal:true,accepted:false,firstFailure:branch,branches};if(typeof globalThis.gc==='function')globalThis.gc();}
 return {column:e.col(action),actionCell:e.coord(cell),legal:true,accepted:true,kind:'branch_complete_isolated',branches};
}

const rows=[];let resourceReplyCount=0;
for(const root of roots){
 const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:1}),state=replay(k,root.sequence),legal=new Set(e.legal(state));
 const ordered=[...ACTION_ORDER.filter(a=>legal.has(a)),...e.legal(state).filter(a=>!ACTION_ORDER.includes(a))];
 const attempts=[];let witness=null;
 for(const action of ordered){const result=classifyAction(root,action);attempts.push(result);resourceReplyCount+=result.branches?.filter(x=>x.route==='resource_boundary').length??0;if(result.accepted){witness={column:result.column,kind:result.kind};break;}if(typeof globalThis.gc==='function')globalThis.gc();}
 rows.push({...root,closed:witness!==null,witness,attempts});
}
const closed=rows.filter(x=>x.closed),failed=rows.filter(x=>!x.closed),witnessColumns={};for(const x of closed){witnessColumns[x.witness.column]=(witnessColumns[x.witness.column]??0)+1;}
console.log(`POSTBLOCK_RESOURCE_ISOLATED_PREDECESSOR=${JSON.stringify({
 kind:'standard7x6-postblock-resource-shards-action-reply-isolated-predecessor-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactResourceShardRoots:roots.length,closedRoots:closed.length,failedRoots:failed.length,resourceReplyCount,witnessColumns,
 rows:rows.map(x=>({member:`${x.family}:${de.col(x.r1)}->${de.col(x.r2)}`,sequence:x.sequence,target:x.target===C3?'C3':'G3',shardKey:x.shardKey,closed:x.closed,witness:x.witness,attempts:x.closed?x.attempts.map(a=>({column:a.column,accepted:a.accepted,firstFailure:a.firstFailure?{route:a.firstFailure.route,reply:a.firstFailure.reply,replyCell:a.firstFailure.replyCell,targetDistance:a.firstFailure.targetDistance??null,error:a.firstFailure.error??null}:null})):x.attempts})),
 interpretation:resourceReplyCount
  ? 'At least one individual P1 branch still hits the unchanged proof/quotient resource boundary even after root/action/reply isolation. Preserve that exact branch; do not widen the cap.'
  : failed.length===0
    ? 'All fifteen roots previously hidden by shard-level resource contamination have exact branch-complete P0 witnesses when action and reply proof work is isolated. Resource sharing, not theorem failure, caused the broad-run ambiguity.'
    : 'Resource ambiguity is removed for all isolated branches, but some exact rank18 roots still have no branch-complete witness under the qualified leaves. Preserve those logical failures as the next seam.',
 theoremBoundary:'This re-evaluates only the fifteen roots from resource-contaminated broad-run shards. Each P0 action and, when needed, each P1 reply is qualified in a fresh unchanged 100000-state lexicographic proof arena. Isolation is execution hygiene only; no state/q equality, solved WDL, arbitrary frontier search, or cap increase is used.'
})}`);
