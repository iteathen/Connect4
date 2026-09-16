#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN={columns:7,rows:6,connect:4};
const ROOT='466565554644';
const C=2,G=6,C3=16,G3=20;
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(id>=0);}return id;}
function landing(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function rank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function heights(k,id){const a=[];for(let c=0;c<7;c++){const x=landing(k,id,c);a.push(x===0xff?6:Math.floor(x/7));}return a;}
function capacity(k,id,c){return 6-heights(k,id)[c];}
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
  if(child===domain.QN_TERMINAL_WIN){assert(enabled.has(cell));out.push({column:col(c),cell:coord(cell)});}
 }
 return out;
}
function abSafe(k,state,c,target){
 const cell=landing(k,state,c);if(cell===0xff)return false;
 const x=k.advance(state,c);if(x===domain.QN_TERMINAL_WIN)return true;
 assert(x>=0);
 if(!singleton(k,x,0,target)||targetDistance(k,x,target)===0)return false;
 return terminalReplies(k,x,1).length===0;
}
function classify(k,state,c,target){
 const cell=landing(k,state,c);if(cell===0xff)return {column:col(c),status:'unavailable'};
 const before=capacity(k,state,c),x=k.advance(state,c);
 if(x===domain.QN_TERMINAL_WIN)return {column:col(c),cell:coord(cell),status:'P0_terminal_now',certificate:true};
 assert(x>=0&&rank(k,x)===23);assert.equal(capacity(k,x,c),before-1);
 const p1Term=terminalReplies(k,x,1);
 if(p1Term.length)return {column:col(c),cell:coord(cell),status:'P1_terminal_override',certificate:false,p1TerminalCells:p1Term.map(r=>r.cell)};
 const p0Enabled=enabledSingletons(k,x,0);
 if(p0Enabled.length>=2){
  for(let rc=0;rc<7;rc++){
   if(landing(k,x,rc)===0xff)continue;
   const y=k.advance(x,rc);assert(y>=0&&y!==domain.QN_TERMINAL_WIN);
   assert(terminalReplies(k,y,0).length>0,'capacity candidate has a P1 reply leaving no immediate P0 terminal');
  }
  return {column:col(c),cell:coord(cell),status:'P0_response_capacity_circuit',certificate:true,enabledP0Singletons:p0Enabled.map(coord)};
 }
 if(p0Enabled.length===1){
  const threat=p0Enabled[0];let blockState=null;
  for(let rc=0;rc<7;rc++){
   const reply=landing(k,x,rc);if(reply===0xff)continue;
   const y=k.advance(x,rc);assert(y>=0&&y!==domain.QN_TERMINAL_WIN);
   if(reply===threat){blockState=y;continue;}
   assert(terminalReplies(k,y,0).length>0,'non-blocking reply escaped enabled singleton');
  }
  assert(blockState!==null,'enabled singleton lacks block state');
  const afterBlockP0=enabledSingletons(k,blockState,0);
  return {column:col(c),cell:coord(cell),status:afterBlockP0.length?'forced_block_then_terminal':'forced_block_continuation',certificate:afterBlockP0.length>0,threat:coord(threat),afterBlockP0:afterBlockP0.map(coord),targetStillLive:singleton(k,blockState,0,target),targetDistance:targetDistance(k,blockState,target)};
 }
 const targetLive=singleton(k,x,0,target),distance=targetDistance(k,x,target);
 if(targetLive&&distance>0)return {column:col(c),cell:coord(cell),status:'safe_nonforcing_continuation',certificate:false,targetLive,distance};
 return {column:col(c),cell:coord(cell),status:'unclassified_target_changed',certificate:false,targetLive,distance,enabledP0Singletons:p0Enabled.map(coord)};
}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});k.prepareSearchStorage();
const cases=[
 {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3,tail:5},
 {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3,tail:5},
 {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3,tail:3},
 {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3,tail:3},
];
const noAB=[];
for(const c of cases){
 const r19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));
 const r20=k.advance(r19,c.tail);assert(r20>=0&&rank(k,r20)===20);
 const r21=k.advance(r20,c.tail);assert(r21>=0&&r21!==domain.QN_TERMINAL_WIN&&rank(k,r21)===21);
 for(let rc=0;rc<7;rc++){
  const reply=landing(k,r21,rc);if(reply===0xff)continue;
  const r22=k.advance(r21,rc);assert(r22>=0&&r22!==domain.QN_TERMINAL_WIN&&rank(k,r22)===22);
  if(targetDistance(k,r22,c.target)===0){assert.equal(k.advance(r22,c.target%7),domain.QN_TERMINAL_WIN);continue;}
  if(!abSafe(k,r22,0,c.target)&&!abSafe(k,r22,1,c.target))noAB.push({member:`${c.name}:${col(c.tail)}->P1:${col(rc)}`,state:r22,target:c.target});
 }
}
assert.equal(noAB.length,8,'must reproduce qualified adjacent-tail no-A/B counterexample set');
const rows=noAB.map(s=>{
 const actions=[];for(let c=0;c<7;c++)actions.push(classify(k,s.state,c,s.target));
 const certificates=actions.filter(a=>a.certificate);
 const safe=actions.filter(a=>a.status==='safe_nonforcing_continuation'||a.status==='forced_block_continuation');
 const unclassified=actions.filter(a=>a.status==='unclassified_target_changed');
 return {member:s.member,target:coord(s.target),certificateActions:certificates.map(a=>({column:a.column,status:a.status})),continuationActions:safe.map(a=>({column:a.column,status:a.status})),unclassifiedActions:unclassified.map(a=>({column:a.column,status:a.status})),actions};
});
const statusCounts={};for(const r of rows)for(const a of r.actions)statusCounts[a.status]=(statusCounts[a.status]??0)+1;
const withCertificate=rows.filter(r=>r.certificateActions.length>0);
const withContinuation=rows.filter(r=>r.certificateActions.length===0&&r.continuationActions.length>0);
const unresolved=rows.filter(r=>r.certificateActions.length===0&&r.continuationActions.length===0);
console.log(`ADJACENT_TAIL_NOAB_ALL_ACTION_ROUTING=${JSON.stringify({
 kind:'standard7x6-adjacent-tail-noab-all-action-routing-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactNoABStates:rows.length,statusCounts,
 statesWithImmediateP0Certificate:withCertificate.length,statesWithSafeContinuationOnly:withContinuation.length,unresolvedStates:unresolved.length,
 certificateRows:withCertificate.map(r=>({member:r.member,target:r.target,certificateActions:r.certificateActions})),
 continuationRows:withContinuation.map(r=>({member:r.member,target:r.target,continuationActions:r.continuationActions})),
 unresolvedRows:unresolved.map(r=>({member:r.member,target:r.target,unclassifiedActions:r.unclassifiedActions,actions:r.actions.map(a=>({column:a.column,status:a.status,p1TerminalCells:a.p1TerminalCells??[]}))})),
 interpretation:unresolved.length===0?'Every qualified no-A/B counterexample has either an exact immediate P0 predecessor certificate or at least one nonterminal action contract that preserves the live target without an immediate P1 terminal override.':'At least one no-A/B counterexample has neither an immediate P0 certificate nor a currently qualified continuation; preserve only those exact rows as the next seam.',
 theoremBoundary:'All seven P0 columns are classified for the exact eight no-A/B rank-22 states over one immediate P1 response horizon. Nonforcing and forced-block continuations are not later-policy closure; target-changed actions remain unclassified rather than treated as losses.',
 authority:'Exact C4-0010 support/residual transitions only; no solved W/D/L labels, recursive q search, Bayesian confidence, or output-cardinality premise.'
})}`);
