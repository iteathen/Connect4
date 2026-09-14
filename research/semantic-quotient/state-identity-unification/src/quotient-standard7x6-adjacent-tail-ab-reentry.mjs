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
function terminalReplies(k,id,player){
 const enabled=new Set(enabledSingletons(k,id,player));
 const out=[];
 for(let c=0;c<7;c++){
  const cell=landing(k,id,c);if(cell===0xff)continue;
  const child=k.advance(id,c);
  if(child===domain.QN_TERMINAL_WIN){assert(enabled.has(cell));out.push({column:col(c),cell:coord(cell)});}
 }
 return out;
}
function safeChainAction(k,state,c,target){
 const cell=landing(k,state,c);if(cell===0xff)return {safe:false,status:'full'};
 const before=capacity(k,state,c);
 const afterP0=k.advance(state,c);
 if(afterP0===domain.QN_TERMINAL_WIN)return {safe:true,status:'P0_terminal',cell:coord(cell),beforeCapacity:before};
 assert(afterP0>=0);
 const after=capacity(k,afterP0,c);assert.equal(after,before-1);
 if(!singleton(k,afterP0,0,target))return {safe:false,status:'target_destroyed',cell:coord(cell)};
 if(targetDistance(k,afterP0,target)===0)return {safe:false,status:'target_exposed_on_P1_turn',cell:coord(cell)};
 const p1Terminal=terminalReplies(k,afterP0,1);
 if(p1Terminal.length)return {safe:false,status:'P1_terminal_override',cell:coord(cell),p1Terminal};
 return {safe:true,status:'safe_strict_capacity_descent',cell:coord(cell),beforeCapacity:before,afterCapacity:after};
}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});
k.prepareSearchStorage();
const cases=[
 {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3,adjacentTail:5},
 {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3,adjacentTail:5},
 {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3,adjacentTail:3},
 {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3,adjacentTail:3},
];

const rows=[];
for(const c of cases){
 assert.equal(Math.abs(c.adjacentTail-(c.target%7)),1);
 const r19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));
 const r20=k.advance(r19,c.adjacentTail);assert(r20>=0&&rank(k,r20)===20);
 const actionCell=landing(k,r20,c.adjacentTail);
 const r21=k.advance(r20,c.adjacentTail);assert(r21>=0&&r21!==domain.QN_TERMINAL_WIN&&rank(k,r21)===21);
 for(let rc=0;rc<7;rc++){
  const replyCell=landing(k,r21,rc);if(replyCell===0xff)continue;
  const r22=k.advance(r21,rc);assert(r22>=0&&r22!==domain.QN_TERMINAL_WIN&&rank(k,r22)===22);
  if(targetDistance(k,r22,c.target)===0){
   assert(singleton(k,r22,0,c.target));
   assert.equal(k.advance(r22,c.target%7),domain.QN_TERMINAL_WIN);
   rows.push({member:`${c.name}:${col(c.adjacentTail)}->P1:${col(rc)}`,route:'P0_immediate_target_terminal',target:coord(c.target)});
   continue;
  }
  const A=safeChainAction(k,r22,0,c.target);
  const B=safeChainAction(k,r22,1,c.target);
  const safe=[['A',A],['B',B]].filter(([,x])=>x.safe).map(([name])=>name);
  rows.push({
   member:`${c.name}:${col(c.adjacentTail)}->P1:${col(rc)}`,
   route:safe.length===2?'both_AB_safe':safe.length===1?'one_AB_safe':'no_AB_safe',
   target:coord(c.target),adjacentTail:col(c.adjacentTail),tailActionCell:coord(actionCell),
   safeAB:safe,A,B,
  });
 }
}
assert.equal(rows.length,20,'four adjacent-tail actions should have five legal P1 replies each');
const routeCounts={};for(const r of rows)routeCounts[r.route]=(routeCounts[r.route]??0)+1;
const nonterminal=rows.filter(r=>r.route!=='P0_immediate_target_terminal');
const noAB=nonterminal.filter(r=>r.route==='no_AB_safe');
const bothAB=nonterminal.filter(r=>r.route==='both_AB_safe');
const oneAB=nonterminal.filter(r=>r.route==='one_AB_safe');
assert.equal(noAB.length,0,'adjacent-tail survivor produced a nonterminal reply with no safe A/B re-entry');
console.log(`ADJACENT_TAIL_AB_REENTRY=${JSON.stringify({
 kind:'standard7x6-adjacent-tail-ab-reentry-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactAdjacentTailActions:cases.length,exactP1Replies:rows.length,routeCounts,
 immediateTargetTerminalReplies:rows.filter(r=>r.route==='P0_immediate_target_terminal').length,
 nonterminalReplies:nonterminal.length,bothABSafe:bothAB.length,exactlyOneABSafe:oneAB.length,noABSafe:noAB.length,
 oneABRows:oneAB.map(r=>({member:r.member,safeAB:r.safeAB,A:r.A.status,B:r.B.status})),
 structuralSeparator:'Within the retained D/E/F family, the only tail action not adversarially eliminated is the column at distance 1 from the remaining target: F for G3 and D for C3. This is independent of resolved-singleton owner.',
 interpretation:noAB.length===0
  ? 'Every non-winning P1 reply to an adjacent-tail survivor re-enters through at least one safe A/B strict-capacity-descent action. Thus the four surviving tail actions have a guarded handoff into the previously qualified A/B chain-progress subsystem.'
  : 'At least one adjacent-tail reply lacks A/B re-entry and remains a separate continuation case.',
 theoremBoundary:'This proves only one adjacent-tail action, one P1 reply, and existence of an immediate safe A/B handoff on the retained four contexts. It does not yet prove repeated A/B induction to terminal/re-entry, center-opening W membership, q equality, or provenance equality.',
 authority:'Exact C4-0010 support/residual transitions and qualified terminal/safety predicates only; no solved W/D/L labels, recursive q search, Bayesian confidence, or output-cardinality premise.'
})}`);
