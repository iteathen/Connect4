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
function universalP1TerminalResponse(k,state){
 let legal=0;
 const actionRows=[];
 for(let c=0;c<7;c++){
  const cell=landing(k,state,c);if(cell===0xff)continue;
  legal++;
  const afterP0=k.advance(state,c);
  if(afterP0===domain.QN_TERMINAL_WIN){
   actionRows.push({column:col(c),cell:coord(cell),status:'P0_terminal_now'});
   return {certified:false,legal,actionRows};
  }
  assert(afterP0>=0);
  const replies=terminalReplies(k,afterP0,1);
  actionRows.push({column:col(c),cell:coord(cell),status:replies.length>0?'P1_terminal_response_available':'escape',p1TerminalCells:replies.map(r=>r.cell)});
  if(replies.length===0)return {certified:false,legal,actionRows};
 }
 return {certified:legal>0,legal,actionRows};
}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});
k.prepareSearchStorage();
const cases=[
 {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
 {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
 {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
 {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
];

const actions=[];
const certifiedStateKeys=new Set();
for(const c of cases){
 const r19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));
 for(const tail of TAILS){
  const r20=k.advance(r19,tail);assert(r20>=0&&rank(k,r20)===20);
  const actionCell=landing(k,r20,tail);assert(actionCell!==0xff);
  const r21=k.advance(r20,tail);assert(r21>=0&&r21!==domain.QN_TERMINAL_WIN&&rank(k,r21)===21);
  const replies=[];
  for(let rc=0;rc<7;rc++){
   const replyCell=landing(k,r21,rc);if(replyCell===0xff)continue;
   const r22=k.advance(r21,rc);
   assert(r22>=0&&r22!==domain.QN_TERMINAL_WIN&&rank(k,r22)===22);
   if(targetDistance(k,r22,c.target)===0){
    assert(singleton(k,r22,0,c.target));
    assert.equal(k.advance(r22,c.target%7),domain.QN_TERMINAL_WIN,'target-support reply lacks immediate P0 terminal consequence');
    replies.push({replyColumn:col(rc),replyCell:coord(replyCell),route:'P0_immediate_target_terminal'});
    continue;
   }
   const cert=universalP1TerminalResponse(k,r22);
   if(cert.certified){
    certifiedStateKeys.add(`${c.name}:${col(tail)}:${col(rc)}`);
    replies.push({replyColumn:col(rc),replyCell:coord(replyCell),route:'universal_P1_terminal_response_state',legalP0Actions:cert.legal});
   }else{
    replies.push({replyColumn:col(rc),replyCell:coord(replyCell),route:'nonterminal_handoff_not_universally_losing'});
   }
  }
  const losingReplies=replies.filter(r=>r.route==='universal_P1_terminal_response_state');
  actions.push({
   member:`${c.name}:${col(tail)}`,
   tailActionCell:coord(actionCell),target:coord(c.target),
   adversariallyEliminated:losingReplies.length>0,
   losingReplyCount:losingReplies.length,
   losingReplies:losingReplies.map(r=>({column:r.replyColumn,cell:r.replyCell})),
   routeCounts:Object.fromEntries([...new Set(replies.map(r=>r.route))].sort().map(route=>[route,replies.filter(r=>r.route===route).length])),
  });
 }
}
assert.equal(actions.length,12);
assert.equal(certifiedStateKeys.size,12,'predecessor routing should recover exactly the 12 universal terminal-response states');
const eliminated=actions.filter(a=>a.adversariallyEliminated);
const surviving=actions.filter(a=>!a.adversariallyEliminated);
console.log(`TAIL_ACTION_ADVERSARIAL_ELIMINATION=${JSON.stringify({
 kind:'standard7x6-tail-action-adversarial-elimination-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactTailActions:actions.length,certifiedUniversalReplyStates:certifiedStateKeys.size,
 adversariallyEliminatedTailActions:eliminated.length,survivingTailActions:surviving.length,
 eliminationRows:eliminated,survivingRows:surviving,
 interpretation:surviving.length===0
  ? 'Every D/E/F same-column tail-consumption action has at least one legal P1 reply that enters an exact universal terminal-response state. Therefore none of these tail actions can occur in a P0 winning policy on the retained domain.'
  : 'Only the reported tail actions are adversarially eliminated. Surviving tail actions remain candidates and must not be discarded without another exact separator.',
 theoremBoundary:'Elimination is action-relative: one adversarial P1 reply to an exact P0-losing successor refutes that P0 action as a winning-policy choice. This does not classify alternative P0 actions at the predecessor state and does not solve the root.',
 authority:'Exact C4-0010 support/residual transitions and the qualified universal terminal-response certificate only; no solved W/D/L labels, recursive q search, Bayesian confidence, or output-cardinality premise.'
})}`);
