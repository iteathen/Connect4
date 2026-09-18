#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6, C3 = 16, G3 = 20;
const REFUSALS = Object.freeze([{name:'D',col:3},{name:'E',col:4},{name:'F',col:5}]);
const REPAIR = Object.freeze([0,1,3,4,5]);

function replay(k,s){let id=k.rootId;for(const d of s){const n=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(n)&&n>=0,`bad replay ${s}`);id=n;}return id;}
function landing(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function rank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function heights(k,id){const out=[];for(let c=0;c<7;c++){const x=landing(k,id,c);out.push(x===0xff?6:Math.floor(x/7));}return out;}
function capacity(k,id,c){return 6-heights(k,id)[c];}
function mu(k,id){return REPAIR.reduce((s,c)=>s+capacity(k,id,c),0);}
function col(c){return String.fromCharCode(65+c);}
function coord(x){return `${col(x%7)}${Math.floor(x/7)+1}`;}
function has([lo,hi],x){return x<32?(((lo>>>x)&1)!==0):(((hi>>>(x-32))&1)!==0);}
function cells(t){const out=[];for(let x=0;x<42;x++)if(has(t,x))out.push(x);return out;}
function terms(k,id,p){const q=p===0?k.states.p0At(id):k.states.p1At(id);return k.classes.terms(q).map(cells);}
function singleton(k,id,p,x){return terms(k,id,p).some(t=>t.length===1&&t[0]===x);}
function enabled(k,id,p){return terms(k,id,p).filter(t=>t.length===1).map(t=>t[0]).filter(x=>landing(k,id,x%7)===x).sort((a,b)=>a-b);}
function distance(k,id,t){return Math.max(0,2-heights(k,id)[t%7]);}
function legal(k,id){const out=[];for(let c=0;c<7;c++)if(landing(k,id,c)!==0xff)out.push(c);return out;}
function terminalActions(k,id,p){
  assert.equal(rank(k,id)&1,p,'terminalActions must query actual mover');
  const en=new Set(enabled(k,id,p)),out=[];
  for(const c of legal(k,id)){
    const cell=landing(k,id,c),child=k.advance(id,c);
    if(child===domain.QN_TERMINAL_WIN){assert(en.has(cell),`terminal ${coord(cell)} lacks enabled singleton`);out.push({column:c,cell});}
  }
  return out;
}
function currentTargets(k,id){return {
  C3:{live:singleton(k,id,0,C3),distance:singleton(k,id,0,C3)?distance(k,id,C3):null},
  G3:{live:singleton(k,id,0,G3),distance:singleton(k,id,0,G3)?distance(k,id,G3):null},
};}
function classifyAction(k,state,action){
  assert.equal(rank(k,state)&1,0,'classifier root must be P0 turn');
  const cell=landing(k,state,action);
  if(cell===0xff)return {column:col(action),status:'unavailable',certificate:false,continuation:false};
  const beforeMu=mu(k,state),beforeCap=capacity(k,state,action);
  const afterP0=k.advance(state,action);
  if(afterP0===domain.QN_TERMINAL_WIN)return {column:col(action),cell:coord(cell),status:'P0_terminal_now',certificate:true,continuation:false,beforeMu};
  assert(afterP0>=0&&rank(k,afterP0)===rank(k,state)+1);
  assert.equal(capacity(k,afterP0,action),beforeCap-1);
  const afterMu=mu(k,afterP0);
  if(REPAIR.includes(action))assert.equal(afterMu,beforeMu-1,'repair action failed mu descent');
  else assert.equal(afterMu,beforeMu,'target action changed repair mu');

  const p1Term=terminalActions(k,afterP0,1);
  if(p1Term.length)return {column:col(action),cell:coord(cell),status:'P1_terminal_override',certificate:false,continuation:false,beforeMu,afterMu,p1TerminalCells:p1Term.map(x=>coord(x.cell)),targetsAfterP0:currentTargets(k,afterP0)};

  const p0Enabled=enabled(k,afterP0,0);
  if(p0Enabled.length>=2){
    const checks=[];let allRepliesLeaveTerminal=true;
    for(const reply of legal(k,afterP0)){
      const replyCell=landing(k,afterP0,reply),child=k.advance(afterP0,reply);
      assert(child!==domain.QN_TERMINAL_WIN&&child>=0,'P1 terminal escaped prior census');
      const terminals=terminalActions(k,child,0);
      if(terminals.length===0)allRepliesLeaveTerminal=false;
      checks.push({reply:col(reply),replyCell:coord(replyCell),p0TerminalCells:terminals.map(x=>coord(x.cell))});
    }
    return {column:col(action),cell:coord(cell),status:allRepliesLeaveTerminal?'P0_response_capacity_circuit':'multi_obligation_unclosed',certificate:allRepliesLeaveTerminal,continuation:false,beforeMu,afterMu,enabledP0Singletons:p0Enabled.map(coord),checks};
  }

  if(p0Enabled.length===1){
    const threat=p0Enabled[0];let blockState=null;const replies=[];let nonblocksClose=true;
    for(const reply of legal(k,afterP0)){
      const replyCell=landing(k,afterP0,reply),child=k.advance(afterP0,reply);
      assert(child!==domain.QN_TERMINAL_WIN&&child>=0,'P1 terminal escaped prior census');
      if(replyCell===threat){blockState=child;replies.push({reply:col(reply),replyCell:coord(replyCell),route:'forced_block'});continue;}
      const terminals=terminalActions(k,child,0);
      if(terminals.length===0)nonblocksClose=false;
      replies.push({reply:col(reply),replyCell:coord(replyCell),route:terminals.length?'nonblock_exposes_P0_terminal':'nonblock_unclosed',p0TerminalCells:terminals.map(x=>coord(x.cell))});
    }
    assert(blockState!==null,'single obligation lacks exact block state');
    const afterBlockEnabled=enabled(k,blockState,0);
    const targetsAfterBlock=currentTargets(k,blockState);
    const continuation=nonblocksClose&&afterBlockEnabled.length===0&&(targetsAfterBlock.C3.live||targetsAfterBlock.G3.live);
    const certificate=nonblocksClose&&afterBlockEnabled.length>0;
    return {column:col(action),cell:coord(cell),status:certificate?'forced_block_then_terminal':continuation?'forced_block_continuation':'forced_block_unclosed',certificate,continuation,beforeMu,afterMu,threat:coord(threat),replies,targetsAfterBlock,afterBlockEnabled:afterBlockEnabled.map(coord)};
  }

  const t=currentTargets(k,afterP0);
  const dualPreserved=t.C3.live&&t.G3.live&&t.C3.distance>0&&t.G3.distance>0;
  const onePreserved=(t.C3.live&&t.C3.distance>0)||(t.G3.live&&t.G3.distance>0);
  return {column:col(action),cell:coord(cell),status:dualPreserved?'safe_dual_target_continuation':onePreserved?'safe_single_target_continuation':'unclassified_target_changed',certificate:false,continuation:onePreserved,beforeMu,afterMu,targetsAfterP0:t};
}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});k.prepareSearchStorage();
const rows=[];
for(const refusal of REFUSALS){
  const afterC1=replay(k,ROOT+'3');
  const refusalState=k.advance(afterC1,refusal.col);assert(refusalState>=0&&refusalState!==domain.QN_TERMINAL_WIN&&rank(k,refusalState)===14);
  const afterG1=k.advance(refusalState,G);assert(afterG1>=0&&afterG1!==domain.QN_TERMINAL_WIN&&rank(k,afterG1)===15);
  const refusalSequence=ROOT+'3'+String(refusal.col+1);
  for(const reply of legal(k,afterG1)){
    const replyCell=landing(k,afterG1,reply),state=k.advance(afterG1,reply);
    if(state===domain.QN_TERMINAL_WIN){rows.push({refusal:refusal.name,refusalSequence,reply:col(reply),replyCell:coord(replyCell),route:'P1_terminal_after_G1',actions:[]});continue;}
    assert(state>=0&&rank(k,state)===16);
    const immediate=terminalActions(k,state,0);
    if(immediate.length){rows.push({refusal:refusal.name,refusalSequence,reply:col(reply),replyCell:coord(replyCell),route:'immediate_P0_terminal',terminalCells:immediate.map(x=>coord(x.cell)),actions:[]});continue;}
    const actions=legal(k,state).map(a=>classifyAction(k,state,a));
    const certificates=actions.filter(a=>a.certificate);
    const continuations=actions.filter(a=>a.continuation);
    const dual=continuations.filter(a=>a.status==='safe_dual_target_continuation');
    rows.push({
      refusal:refusal.name,refusalSequence,reply:col(reply),replyCell:coord(replyCell),route:'classified_P0_actions',
      sequence:refusalSequence+'7'+String(reply+1),mu:mu(k,state),targets:currentTargets(k,state),
      certificateActions:certificates.map(a=>({column:a.column,status:a.status})),
      continuationActions:continuations.map(a=>({column:a.column,status:a.status,afterMu:a.afterMu})),
      dualTargetContinuations:dual.map(a=>({column:a.column,status:a.status,afterMu:a.afterMu})),
      actions,
    });
  }
}
const classified=rows.filter(r=>r.route==='classified_P0_actions');
const noCertificateOrContinuation=classified.filter(r=>r.certificateActions.length===0&&r.continuationActions.length===0);
const uniqueDual=classified.filter(r=>r.dualTargetContinuations.length===1);
const statusCounts={};for(const r of classified)for(const a of r.actions)statusCounts[a.status]=(statusCounts[a.status]??0)+1;
console.log(`EXPIRED_RESPONSE_REFUSAL_ACTION_ROUTING=${JSON.stringify({
  kind:'standard7x6-expired-response-refusal-action-routing-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  exactRows:rows.length,classifiedRows:classified.length,statusCounts,
  rowsWithUniqueDualTargetContinuation:uniqueDual.length,
  rowsWithNoImmediateCertificateOrContinuation:noCertificateOrContinuation.length,
  noCertificateOrContinuationRows:noCertificateOrContinuation,
  rows,
  interpretation:noCertificateOrContinuation.length===0
    ? 'Every nonterminal D/E/F refusal child after G1 has at least one exact immediate certificate or guarded continuation before target-first forcing. The retained next task is to compose only those selected continuations under a finite progress measure.'
    : 'At least one D/E/F refusal child has no exact one-step certificate or guarded continuation under the imported all-action vocabulary. Preserve those exact separators; do not infer loss.',
  theoremBoundary:'One P0 action plus exhaustive immediate P1 terminal/obligation classification at exact rank-16 refusal children. Continuation is not later-strategy closure. No solved labels, q equality, or cap increase.',
  authority:'Exact C4-0010 transitions/residuals and enabled-singleton terminal certificates only.'
})}`);
