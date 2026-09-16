#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN={columns:7,rows:6,connect:4};
const ROOT='466565554644';
const C=2,G=6,C3=16,G3=20,TAILS=[3,4,5],OFF_TARGETS=[0,1,3,4,5];

function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(id>=0);}return id;}
function landing(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function rank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function heights(k,id){const a=[];for(let c=0;c<7;c++){const x=landing(k,id,c);a.push(x===0xff?6:Math.floor(x/7));}return a;}
function col(c){return String.fromCharCode(65+c);}
function coord(x){return `${col(x%7)}${Math.floor(x/7)+1}`;}
function has([lo,hi],x){return x<32?(((lo>>>x)&1)!==0):(((hi>>>(x-32))&1)!==0);}
function cells(t){const a=[];for(let x=0;x<42;x++)if(has(t,x))a.push(x);return a;}
function terms(k,id,p){const q=p===0?k.states.p0At(id):k.states.p1At(id);return k.classes.terms(q).map(cells);}
function singleton(k,id,p,x){return terms(k,id,p).some(t=>t.length===1&&t[0]===x);}
function enabledSingletons(k,id,p){return terms(k,id,p).filter(t=>t.length===1).map(t=>t[0]).filter(x=>landing(k,id,x%7)===x).sort((a,b)=>a-b);}
function targetDistance(k,id,t){return Math.max(0,2-heights(k,id)[t%7]);}
function terminalReplies(k,id,player){
 const enabled=new Set(enabledSingletons(k,id,player));
 const out=[];
 for(let c=0;c<7;c++){
  const cell=landing(k,id,c);if(cell===0xff)continue;
  const child=k.advance(id,c);
  if(child===domain.QN_TERMINAL_WIN){
   assert(enabled.has(cell),`${player===0?'P0':'P1'} terminal ${coord(cell)} lacks enabled singleton premise`);
   out.push({column:col(c),cell:coord(cell)});
  }
 }
 return out;
}
function offTargetSafe(k,state,c,target){
 const cell=landing(k,state,c);if(cell===0xff)return false;
 const afterP0=k.advance(state,c);
 if(afterP0===domain.QN_TERMINAL_WIN)return true;
 assert(afterP0>=0);
 if(!singleton(k,afterP0,0,target))return false;
 if(targetDistance(k,afterP0,target)===0)return false;
 return terminalReplies(k,afterP0,1).length===0;
}
function classifyP0Action(k,state,c){
 const cell=landing(k,state,c);
 if(cell===0xff)return {column:col(c),legal:false,status:'unavailable_full'};
 const afterP0=k.advance(state,c);
 if(afterP0===domain.QN_TERMINAL_WIN){
  return {column:col(c),cell:coord(cell),legal:true,status:'P0_terminal_now',p1TerminalReplies:[]};
 }
 assert(afterP0>=0&&rank(k,afterP0)===23);
 const p1TerminalReplies=terminalReplies(k,afterP0,1);
 return {
  column:col(c),cell:coord(cell),legal:true,
  status:p1TerminalReplies.length>0?'P1_terminal_response_available':'no_immediate_P1_terminal_response',
  p1TerminalReplies,
  enabledP0Singletons:enabledSingletons(k,afterP0,0).map(coord),
  enabledP1Singletons:enabledSingletons(k,afterP0,1).map(coord),
 };
}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});
k.prepareSearchStorage();
const cases=[
 {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
 {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
 {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
 {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
];

const blocking=[];
for(const c of cases){
 const r19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));
 for(const tail of TAILS){
  const r20=k.advance(r19,tail);assert(r20>=0&&rank(k,r20)===20);
  const r21=k.advance(r20,tail);assert(r21>=0&&r21!==domain.QN_TERMINAL_WIN);
  for(let p1c=0;p1c<7;p1c++){
   const p1cell=landing(k,r21,p1c);if(p1cell===0xff)continue;
   const r22=k.advance(r21,p1c);assert(r22>=0&&r22!==domain.QN_TERMINAL_WIN&&rank(k,r22)===22);
   if(targetDistance(k,r22,c.target)===0)continue;
   assert(singleton(k,r22,0,c.target));
   const anySafe=OFF_TARGETS.some(x=>offTargetSafe(k,r22,x,c.target));
   if(!anySafe)blocking.push({
    member:`${c.name}:${col(tail)}->P1:${col(p1c)}`,
    state:r22,target:coord(c.target),targetColumn:col(c.target%7),resolvedColumn:col(c.resolved),
   });
  }
 }
}
assert.equal(blocking.length,12,'must reproduce exact no-safe-off-target blocking set');

const rows=[];
const actionStatusCounts={};
for(const b of blocking){
 const actions=[];
 for(let c=0;c<7;c++){
  const a=classifyP0Action(k,b.state,c);
  actions.push(a);
  actionStatusCounts[a.status]=(actionStatusCounts[a.status]??0)+1;
 }
 const legal=actions.filter(a=>a.legal);
 const immediateP0Wins=legal.filter(a=>a.status==='P0_terminal_now');
 const escapes=legal.filter(a=>a.status==='no_immediate_P1_terminal_response');
 const universalP1TerminalResponse=immediateP0Wins.length===0&&escapes.length===0&&legal.every(a=>a.status==='P1_terminal_response_available');
 rows.push({
  member:b.member,target:b.target,targetColumn:b.targetColumn,resolvedColumn:b.resolvedColumn,
  legalActionCount:legal.length,universalP1TerminalResponse,
  immediateP0WinActions:immediateP0Wins.map(a=>a.column),
  escapeActions:escapes.map(a=>({column:a.column,cell:a.cell,enabledP0Singletons:a.enabledP0Singletons,enabledP1Singletons:a.enabledP1Singletons})),
  actionSummary:actions.map(a=>({column:a.column,cell:a.cell??null,status:a.status,p1TerminalCells:(a.p1TerminalReplies??[]).map(x=>x.cell)})),
 });
}
const universalRows=rows.filter(r=>r.universalP1TerminalResponse);
const escapeRows=rows.filter(r=>!r.universalP1TerminalResponse);
console.log(`BLOCKING_TAIL_ALL_ACTION_TERMINAL_CENSUS=${JSON.stringify({
 kind:'standard7x6-blocking-tail-all-action-terminal-census-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactBlockingStates:rows.length,actionStatusCounts,
 universalP1TerminalResponseStates:universalRows.length,statesWithEscapeOrImmediateP0Win:escapeRows.length,
 universalCertificates:universalRows.map(r=>({member:r.member,legalActionCount:r.legalActionCount,actionSummary:r.actionSummary})),
 escapeRows,
 interpretation:escapeRows.length===0
  ? 'Every legal P0 action in each blocking rank-22 state is answered by an exact immediate P1 terminal reply. These states therefore have a bounded universal terminal-response certificate and the preceding tail route is invalid for a P0 winning policy.'
  : 'At least one blocking state has a legal P0 action with no immediate P1 terminal response or an immediate P0 win. Route only those exact escape actions into the next action-conditioned theorem; do not classify the state as losing.',
 theoremBoundary:'This exhausts all seven P0 columns and one immediate P1 reply horizon only on the exact 12 no-safe-off-target rank-22 states. A universal certificate is valid only where every legal nonterminal P0 action has an exact P1 terminal response. It does not classify unrelated states or solve the root.',
 authority:'Exact C4-0010 support/residual transitions only; no solved W/D/L labels, recursive q search, Bayesian confidence, or output-cardinality premise.'
})}`);
