#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644';
const C=2,G=6,C3=2*7+C,G3=2*7+G;
const REPAIRS=Object.freeze([0,1,3,4,5]);

function replay(k,seq){let id=k.rootId; for(const d of seq){id=k.advance(id,Number(d)-1); assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${seq}`);} return id;}
function rank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function landing(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function legal(k,id){const o=[]; for(let c=0;c<7;c++) if(landing(k,id,c)!==0xff)o.push(c); return o;}
function heights(k,id){const o=[]; for(let c=0;c<7;c++){const x=landing(k,id,c); o.push(x===0xff?6:Math.floor(x/7));} return o;}
function capacity(k,id,c){return 6-heights(k,id)[c];}
function mu(k,id){return REPAIRS.reduce((s,c)=>s+capacity(k,id,c),0);}
function col(c){return String.fromCharCode(65+c);}
function coord(x){return `${col(x%7)}${Math.floor(x/7)+1}`;}
function has([lo,hi],x){return x<32?(((lo>>>x)&1)!==0):(((hi>>>(x-32))&1)!==0);}
function cells(t){const o=[]; for(let x=0;x<42;x++)if(has(t,x))o.push(x); return o;}
function terms(k,id,p){const q=p===0?k.states.p0At(id):k.states.p1At(id); return k.classes.terms(q).map(cells);}
function singleton(k,id,p,x){return terms(k,id,p).some(t=>t.length===1&&t[0]===x);}
function enabledSingletons(k,id,p){return terms(k,id,p).filter(t=>t.length===1).map(t=>t[0]).filter(x=>landing(k,id,x%7)===x).sort((a,b)=>a-b);}
function targetDistance(k,id,t){return Math.max(0,2-heights(k,id)[t%7]);}
function terminalActions(k,id,p){const e=new Set(enabledSingletons(k,id,p)),o=[]; for(const c of legal(k,id)){const cell=landing(k,id,c),n=k.advance(id,c); if(n===domain.QN_TERMINAL_WIN){assert(e.has(cell),`${p===0?'P0':'P1'} terminal ${coord(cell)} lacks enabled singleton`); o.push({column:c,cell});}} return o;}
function repairInvariant(k,id,t){return rank(k,id)%2===0&&singleton(k,id,0,t)&&targetDistance(k,id,t)===1;}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});
k.prepareSearchStorage();

// Qualified rank-20 contract: retain 20 logical members and exact 16-state transposition set.
const known20=new Map(); let known20Logical=0;
for(const c of [
  {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
  {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
  {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
  {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
]){
  const s19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3)); assert.equal(rank(k,s19),19);
  for(const r of REPAIRS){const s20=k.advance(s19,r); assert(s20>=0&&rank(k,s20)===20); known20Logical++; const m=`${c.name}:${col(r)}`; const p=known20.get(s20); if(p){assert.equal(p.target,c.target);p.members.push(m);}else known20.set(s20,{target:c.target,members:[m]});}
}
assert.equal(known20Logical,20); assert.equal(known20.size,16);

// Reconstruct all 84 exact states after the proven forced C4/G4 block and one P1 reply.
const rows=[];
for(const x of [
  {family:'C_first',resolved:C,target:G3,targetCol:G,replies1:[0,1,3,4,5,6]},
  {family:'G_first',resolved:G,target:C3,targetCol:C,replies1:[0,1,2,3,4,5]},
]){
  for(const r1 of x.replies1){
    const s16=replay(k,ROOT+`${x.resolved+1}${r1+1}${x.resolved+1}${x.resolved+1}`); assert.equal(rank(k,s16),16);
    const threat=landing(k,s16,x.resolved); assert(new Set(enabledSingletons(k,s16,1)).has(threat));
    const s17=k.advance(s16,x.resolved); assert(s17>=0&&rank(k,s17)===17);
    for(const r2 of legal(k,s17)){
      const r2cell=landing(k,s17,r2),s18=k.advance(s17,r2);
      if(s18===domain.QN_TERMINAL_WIN){assert(new Set(enabledSingletons(k,s17,1)).has(r2cell)); rows.push({family:x.family,r1,r2,status:'P1_terminal'}); continue;}
      assert(s18>=0&&rank(k,s18)===18);
      const handoff = r2===x.resolved ? 'resolved_tail_completion' : r2===x.targetCol ? 'remaining_target_support' : 'same_channel_compensation';
      if(handoff==='same_channel_compensation') assert(REPAIRS.includes(r2),`unexpected off-channel ${col(r2)}`);
      rows.push({family:x.family,r1,r2,status:'nonterminal',state:s18,resolved:x.resolved,target:x.target,targetCol:x.targetCol,handoff});
    }
  }
}
assert.equal(rows.length,84);
assert.equal(rows.filter(r=>r.status==='P1_terminal').length,0,'post-block P1 terminal count drift');

function classifyLeaf(s20,target){
  const immediate=terminalActions(k,s20,0);
  if(immediate.length)return {route:'immediate_P0_terminal',terminalColumns:immediate.map(x=>col(x.column))};
  const exact=known20.get(s20);
  if(exact)return {route:'qualified_exact_rank20_contract',members:exact.members};
  if(repairInvariant(k,s20,target))return {route:'repair_invariant_reestablished',mu:mu(k,s20)};
  return {route:'unresolved_leaf',targetLive:singleton(k,s20,0,target),targetDistance:targetDistance(k,s20,target),mu:mu(k,s20),heights:heights(k,s20),enabledP0Singletons:enabledSingletons(k,s20,0).map(coord),enabledP1Singletons:enabledSingletons(k,s20,1).map(coord)};
}

function testTypedHandoff(row){
  const action=row.handoff==='resolved_tail_completion'?row.resolved:row.handoff==='remaining_target_support'?row.targetCol:row.r2;
  const cell=landing(k,row.state,action); assert.notEqual(cell,0xff,`${row.family}:${col(row.r1)}:${col(row.r2)} typed action full`);
  const s19=k.advance(row.state,action);
  if(s19===domain.QN_TERMINAL_WIN)return {...row,action,actionCell:cell,closed:true,route:'P0_terminal_on_typed_action',leaves:[]};
  assert(s19>=0&&rank(k,s19)===19);
  const leaves=[]; let closed=true,firstFailure=null;
  for(const reply of legal(k,s19)){
    const replyCell=landing(k,s19,reply),s20=k.advance(s19,reply);
    if(s20===domain.QN_TERMINAL_WIN){assert(new Set(enabledSingletons(k,s19,1)).has(replyCell)); leaves.push({reply:col(reply),replyCell:coord(replyCell),route:'P1_terminal'}); closed=false; firstFailure??={reply:col(reply),replyCell:coord(replyCell),reason:'P1_terminal'}; continue;}
    assert(s20>=0&&rank(k,s20)===20);
    const leaf=classifyLeaf(s20,row.target); leaves.push({reply:col(reply),replyCell:coord(replyCell),...leaf});
    if(leaf.route==='unresolved_leaf'){closed=false; firstFailure??={reply:col(reply),replyCell:coord(replyCell),reason:'unresolved_leaf',...leaf};}
  }
  return {...row,action,actionCell:cell,closed,route:closed?'typed_handoff_to_qualified_boundary':'typed_handoff_open',firstFailure,leaves};
}

const tested=rows.filter(r=>r.status==='nonterminal').map(testTypedHandoff);
const byKind={};
for(const kind of ['resolved_tail_completion','remaining_target_support','same_channel_compensation']){
  const xs=tested.filter(x=>x.handoff===kind); const leafCounts={}; for(const x of xs)for(const l of x.leaves)leafCounts[l.route]=(leafCounts[l.route]??0)+1;
  byKind[kind]={states:xs.length,closedStates:xs.filter(x=>x.closed).length,failedStates:xs.filter(x=>!x.closed).length,leafRouteCounts:leafCounts,actionColumns:[...new Set(xs.map(x=>col(x.action)))].sort()};
}
const failed=tested.filter(x=>!x.closed);

console.log(`POSTBLOCK_TYPED_HANDOFFS=${JSON.stringify({
  kind:'standard7x6-postblock-typed-handoffs-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  exactRank18States:tested.length,
  knownRank20LogicalMembers:known20Logical,
  knownRank20UniquePhysicalStates:known20.size,
  byKind,
  closedStates:tested.filter(x=>x.closed).length,
  failedStates:failed.length,
  failureSamples:failed.slice(0,16).map(x=>({member:`${x.family}:${col(x.r1)}->${col(x.r2)}`,handoff:x.handoff,action:col(x.action),target:coord(x.target),mu:mu(k,x.state),targetDistance:targetDistance(k,x.state,x.target),firstFailure:x.firstFailure})),
  interpretation:failed.length===0
    ? 'Each post-block state is absorbed by its theorem-shaped typed handoff: resolved-column tail completion, remaining-target support, or same-channel compensation. Every P1 reply then reaches an immediate P0 terminal certificate, an exact qualified rank-20 contract, or the exact repair-invariant boundary. This is a finite contract transition, not physical-tree reconstruction.'
    : 'At least one theorem-shaped typed handoff does not yet reach a qualified boundary. Preserve only the reported failing handoff class(es) for the next theorem; do not widen action enumeration or storage.',
  theoremBoundary:'This classifies one structurally selected P0 action per exact nonterminal rank-18 post-block state. A leaf marked repair_invariant_reestablished is only an exact premise match for the existing repair calculus; this control does not itself recursively re-prove that leaf. It uses no solved W/D/L labels, arbitrary action search, q equality, or state-quotient claim.',
  authority:'Exact C4-0010 support/residual transitions, enabled-singleton terminal certificates, the exact qualified rank-20 member set, and the explicit repair-invariant predicate only.',
})}`);
