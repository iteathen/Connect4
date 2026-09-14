#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN={columns:7,rows:6,connect:4};
const ROOT='466565554644';
const C=2,G=6,C3=16,G3=20,TAILS=[3,4,5];

function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(id>=0);}return id;}
function landing(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function rank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function heights(k,id){const a=[];for(let c=0;c<7;c++){const x=landing(k,id,c);a.push(x===0xff?6:Math.floor(x/7));}return a;}
function capacity(k,id,c){return 6-heights(k,id)[c];}
function repairCapacity(k,id){return TAILS.reduce((s,c)=>s+capacity(k,id,c),0);}
function col(c){return String.fromCharCode(65+c);}
function coord(x){return `${col(x%7)}${Math.floor(x/7)+1}`;}
function has([lo,hi],x){return x<32?(((lo>>>x)&1)!==0):(((hi>>>(x-32))&1)!==0);}
function cells(t){const a=[];for(let x=0;x<42;x++)if(has(t,x))a.push(x);return a;}
function terms(k,id,p){const q=p===0?k.states.p0At(id):k.states.p1At(id);return k.classes.terms(q).map(cells);}
function singleton(k,id,p,x){return terms(k,id,p).some(t=>t.length===1&&t[0]===x);}
function enabledSingletons(k,id,p){return terms(k,id,p).filter(t=>t.length===1).map(t=>t[0]).filter(x=>landing(k,id,x%7)===x).sort((a,b)=>a-b);}
function targetDistance(k,id,t){return Math.max(0,2-heights(k,id)[t%7]);}
function terminalReplies(k,id,p){
 const enabled=new Set(enabledSingletons(k,id,p)),out=[];
 for(let c=0;c<7;c++){
  const cell=landing(k,id,c);if(cell===0xff)continue;
  const child=k.advance(id,c);
  if(child===domain.QN_TERMINAL_WIN){assert(enabled.has(cell),`${p===0?'P0':'P1'} terminal ${coord(cell)} lacks enabled singleton premise`);out.push({column:col(c),cell:coord(cell)});}
 }
 return out;
}
function actionClass(k,state,c,target){
 const cell=landing(k,state,c);if(cell===0xff)return {column:col(c),status:'unavailable',qualifiedContinuation:false,certificate:false};
 const before=capacity(k,state,c),beforeRepair=repairCapacity(k,state),x=k.advance(state,c);
 if(x===domain.QN_TERMINAL_WIN)return {column:col(c),cell:coord(cell),status:'P0_terminal_now',certificate:true,qualifiedContinuation:false};
 assert(x>=0&&rank(k,x)===rank(k,state)+1);assert.equal(capacity(k,x,c),before-1);assert(repairCapacity(k,x)<=beforeRepair);
 const p1Term=terminalReplies(k,x,1);
 if(p1Term.length)return {column:col(c),cell:coord(cell),status:'P1_terminal_override',p1TerminalCells:p1Term.map(r=>r.cell),certificate:false,qualifiedContinuation:false};
 const p0Enabled=enabledSingletons(k,x,0);
 if(p0Enabled.length>=2){
  for(let rc=0;rc<7;rc++){
   if(landing(k,x,rc)===0xff)continue;
   const y=k.advance(x,rc);assert(y>=0&&y!==domain.QN_TERMINAL_WIN);
   assert(terminalReplies(k,y,0).length>0,'capacity candidate has a P1 reply leaving no immediate P0 terminal');
  }
  return {column:col(c),cell:coord(cell),status:'P0_response_capacity_circuit',certificate:true,qualifiedContinuation:false,enabledP0Singletons:p0Enabled.map(coord)};
 }
 if(p0Enabled.length===1){
  const threat=p0Enabled[0];let blockState=null;
  for(let rc=0;rc<7;rc++){
   const reply=landing(k,x,rc);if(reply===0xff)continue;
   const y=k.advance(x,rc);assert(y>=0&&y!==domain.QN_TERMINAL_WIN);
   if(reply===threat){blockState=y;continue;}
   assert(terminalReplies(k,y,0).length>0,'non-blocking reply escaped enabled singleton');
  }
  assert(blockState!==null);
  const afterBlock=enabledSingletons(k,blockState,0);
  if(afterBlock.length)return {column:col(c),cell:coord(cell),status:'forced_block_then_terminal',certificate:true,qualifiedContinuation:false,threat:coord(threat)};
  const live=singleton(k,blockState,0,target),distance=targetDistance(k,blockState,target);
  return {column:col(c),cell:coord(cell),status:'forced_block_continuation',certificate:false,qualifiedContinuation:live&&distance>0,threat:coord(threat),targetLive:live,targetDistance:distance,blockState};
 }
 const live=singleton(k,x,0,target),distance=targetDistance(k,x,target);
 if(live&&distance>0)return {column:col(c),cell:coord(cell),status:'safe_nonforcing_continuation',certificate:false,qualifiedContinuation:true,targetLive:true,targetDistance:distance,afterP0:x};
 return {column:col(c),cell:coord(cell),status:'unclassified_target_changed',certificate:false,qualifiedContinuation:false,targetLive:live,targetDistance:distance};
}
function abSafe(k,state,c,target){const x=actionClass(k,state,c,target);return x.certificate||x.qualifiedContinuation;}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});k.prepareSearchStorage();
const cases=[
 {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3,adjacentTail:5},
 {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3,adjacentTail:5},
 {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3,adjacentTail:3},
 {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3,adjacentTail:3},
];

const candidates=[];
for(const c of cases){
 const r19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));
 const r20=k.advance(r19,c.adjacentTail);assert(r20>=0&&rank(k,r20)===20);
 const r21=k.advance(r20,c.adjacentTail);assert(r21>=0&&r21!==domain.QN_TERMINAL_WIN&&rank(k,r21)===21);
 const complementPool=TAILS.filter(x=>x!==c.adjacentTail);
 for(let rc=0;rc<7;rc++){
  const replyCell=landing(k,r21,rc);if(replyCell===0xff)continue;
  const r22=k.advance(r21,rc);assert(r22>=0&&r22!==domain.QN_TERMINAL_WIN&&rank(k,r22)===22);
  if(targetDistance(k,r22,c.target)===0){assert.equal(k.advance(r22,c.target%7),domain.QN_TERMINAL_WIN);continue;}
  if(abSafe(k,r22,0,c.target)||abSafe(k,r22,1,c.target))continue;
  assert(complementPool.includes(rc),'no-A/B reply is outside the complementary-tail pool');
  const response=complementPool.find(x=>x!==rc);assert(Number.isInteger(response));
  const selected=actionClass(k,r22,response,c.target);
  assert.equal(selected.status,'safe_nonforcing_continuation','structural complementary-tail action is not the qualified continuation');
  const qualified=[];for(let pc=0;pc<7;pc++){const a=actionClass(k,r22,pc,c.target);if(a.qualifiedContinuation)qualified.push(pc);}
  assert.deepEqual(qualified,[response],'no-A/B state must have the unique complementary-tail continuation');
  candidates.push({
   member:`${c.name}:${col(c.adjacentTail)}->P1:${col(rc)}->P0:${col(response)}`,
   state:r22,target:c.target,adjacentTail:c.adjacentTail,p1Reply:rc,response,
   beforeRepairCapacity:repairCapacity(k,r22),afterP0:selected.afterP0,
  });
 }
}
assert.equal(candidates.length,8,'must reproduce exact eight unique complementary-tail continuations');

const candidateRows=[];
for(const c of candidates){
 const afterP0=c.afterP0;assert(afterP0>=0&&rank(k,afterP0)===23);
 assert(repairCapacity(k,afterP0)<c.beforeRepairCapacity,'P0 complementary-tail action must strictly reduce D/E/F repair capacity');
 const replyRows=[];
 for(let rc=0;rc<7;rc++){
  const replyCell=landing(k,afterP0,rc);if(replyCell===0xff)continue;
  const y=k.advance(afterP0,rc);
  if(y===domain.QN_TERMINAL_WIN){
   throw new Error(`qualified continuation exposed P1 terminal ${c.member}->${col(rc)}`);
  }
  assert(y>=0&&rank(k,y)===24);
  assert(repairCapacity(k,y)<=repairCapacity(k,afterP0),'P1 reply increased repair capacity');
  const p0Term=terminalReplies(k,y,0);
  if(p0Term.length){
   replyRows.push({replyColumn:col(rc),replyCell:coord(replyCell),route:'P0_immediate_terminal',p0TerminalCells:p0Term.map(r=>r.cell),repairCapacity:repairCapacity(k,y)});
   continue;
  }
  const actions=[];for(let pc=0;pc<7;pc++)actions.push(actionClass(k,y,pc,c.target));
  const certs=actions.filter(a=>a.certificate);
  const conts=actions.filter(a=>a.qualifiedContinuation);
  const route=certs.length?'next_P0_certificate_exists':conts.length?'next_qualified_continuation_exists':'unresolved';
  replyRows.push({
   replyColumn:col(rc),replyCell:coord(replyCell),route,repairCapacity:repairCapacity(k,y),
   certificateActions:certs.map(a=>({column:a.column,status:a.status})),
   continuationActions:conts.map(a=>({column:a.column,status:a.status})),
   unclassifiedActions:actions.filter(a=>a.status==='unclassified_target_changed').map(a=>a.column),
  });
 }
 candidateRows.push({member:c.member,target:coord(c.target),beforeRepairCapacity:c.beforeRepairCapacity,afterP0RepairCapacity:repairCapacity(k,afterP0),replyRows});
}
const allReplies=candidateRows.flatMap(r=>r.replyRows.map(x=>({...x,parent:r.member})));
const routeCounts={};for(const r of allReplies)routeCounts[r.route]=(routeCounts[r.route]??0)+1;
const unresolved=allReplies.filter(r=>r.route==='unresolved');
const nextContinuation=allReplies.filter(r=>r.route==='next_qualified_continuation_exists');
const nextCertificates=allReplies.filter(r=>r.route==='next_P0_certificate_exists'||r.route==='P0_immediate_terminal');
const continuationKey=nextContinuation.map(r=>`${r.parent}->P1:${r.replyColumn}>${r.continuationActions.map(a=>a.column+(a.status==='forced_block_continuation'?'f':'s')).join('')}`).join('__');
console.log(`NOAB_COMPLEMENTARY_TAIL_FORWARD_ROUTING=${JSON.stringify({
 kind:'standard7x6-noab-complementary-tail-forward-routing-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactContinuationCandidates:candidates.length,exactP1Replies:allReplies.length,routeCounts,
 repliesWithP0Certificate:nextCertificates.length,repliesWithQualifiedContinuation:nextContinuation.length,unresolvedReplies:unresolved.length,
 continuationKey,
 unresolvedRows:unresolved,
 structuralRule:'After a target-adjacent D/E/F tail survives and P1 consumes one of the two remaining tail columns, P0 consumes the other remaining tail. On all eight qualified instances this is the unique immediate continuation satisfying the exact safety predicate.',
 progressMeasure:'Each selected complementary-tail P0 action strictly decreases total remaining D/E/F support capacity by one; every P1 reply is nonincreasing in that same measure.',
 interpretation:unresolved.length===0?'Every immediate P1 reply after the unique complementary-tail continuation routes to an exact P0 predecessor certificate or another qualified continuation while the D/E/F repair-capacity measure never increases.':'The complementary-tail rule is locally sound but does not close every reply; preserve only the exact unresolved rows as the next dependency-cone seam.',
 theoremBoundary:'This is a bounded structural continuation control: eight selected P0 actions and their exhaustive immediate P1 replies, followed by one local classification of available P0 actions. It is not recursive q search and does not yet prove induction to terminal for all later replies.',
 authority:'Exact C4-0010 support/residual transitions and previously qualified local terminal/continuation predicates only; no solved W/D/L labels, Bayesian confidence, or output-cardinality premise.'
})}`);
