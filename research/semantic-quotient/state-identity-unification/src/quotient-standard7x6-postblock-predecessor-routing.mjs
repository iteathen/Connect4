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
const MAX_PROOF_STATES=100000;

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
function cells(t){const o=[]; for(let x=0;x<42;x++) if(has(t,x))o.push(x); return o;}
function terms(k,id,p){const q=p===0?k.states.p0At(id):k.states.p1At(id); return k.classes.terms(q).map(cells);}
function singleton(k,id,p,x){return terms(k,id,p).some(t=>t.length===1&&t[0]===x);}
function enabledSingletons(k,id,p){return terms(k,id,p).filter(t=>t.length===1).map(t=>t[0]).filter(x=>landing(k,id,x%7)===x).sort((a,b)=>a-b);}
function targetDistance(k,id,t){return Math.max(0,2-heights(k,id)[t%7]);}
function terminalActions(k,id,p){const e=new Set(enabledSingletons(k,id,p)),o=[]; for(const c of legal(k,id)){const cell=landing(k,id,c),n=k.advance(id,c); if(n===domain.QN_TERMINAL_WIN){assert(e.has(cell),`${p===0?'P0':'P1'} terminal ${coord(cell)} lacks enabled singleton`); o.push({column:c,cell});}} return o;}
function invariant(k,id,t){return rank(k,id)%2===0&&singleton(k,id,0,t)&&targetDistance(k,id,t)===1;}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});
k.prepareSearchStorage();

const proofMemo=new Map(); let proofStates=0,proofActionsChecked=0,proofP1BranchesChecked=0,maxDepth=0;
function proveRepairInvariant(state,target,depth=0){
  const key=`${state}:${target}`; if(proofMemo.has(key))return proofMemo.get(key); proofStates++; maxDepth=Math.max(maxDepth,depth); if(proofStates>MAX_PROOF_STATES)throw new Error(`repair proof-state cap exceeded ${MAX_PROOF_STATES}`);
  assert.equal(rank(k,state)%2,0); const m=mu(k,state); if(terminalActions(k,state,0).length){const o={proved:true,kind:'immediate_P0_terminal',mu:m}; proofMemo.set(key,o); return o;}
  if(!invariant(k,state,target)){const o={proved:false,kind:'outside_repair_invariant',mu:m,targetLive:singleton(k,state,0,target),targetDistance:targetDistance(k,state,target)}; proofMemo.set(key,o); return o;}
  const rejected=[];
  for(const a of REPAIRS){if(landing(k,state,a)===0xff)continue; proofActionsChecked++; const p1=k.advance(state,a); if(p1===domain.QN_TERMINAL_WIN){const o={proved:true,kind:'repair_predecessor',mu:m,witness:col(a)}; proofMemo.set(key,o); return o;} assert(p1>=0); assert.equal(mu(k,p1),m-1);
    let ok=true,why=null; for(const r of legal(k,p1)){const cell=landing(k,p1,r); proofP1BranchesChecked++; const p0=k.advance(p1,r); if(p0===domain.QN_TERMINAL_WIN){assert(new Set(enabledSingletons(k,p1,1)).has(cell)); ok=false; why={reply:col(r),reason:'P1_terminal'}; break;} assert(p0>=0); assert(mu(k,p0)<=m-1); if(terminalActions(k,p0,0).length)continue; const ch=proveRepairInvariant(p0,target,depth+1); if(!ch.proved){ok=false; why={reply:col(r),reason:ch.kind,childMu:ch.mu}; break;}}
    if(ok){const o={proved:true,kind:'repair_predecessor',mu:m,witness:col(a)}; proofMemo.set(key,o); return o;} rejected.push({action:col(a),...why});
  }
  const o={proved:false,kind:'no_repair_predecessor',mu:m,rejected}; proofMemo.set(key,o); return o;
}

// The qualified rank-20 contract has 20 logical members but four exact transpositions,
// hence only 16 unique physical state ids. Preserve both multiplicities explicitly.
const known20=new Map();
let known20LogicalMembers=0;
for(const c of [
  {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
  {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
  {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
  {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
]){
  const rank19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3)); assert.equal(rank(k,rank19),19);
  for(const r of REPAIRS){
    const s=k.advance(rank19,r); assert(s>=0&&rank(k,s)===20); known20LogicalMembers++;
    const member=`${c.name}:${col(r)}`;
    const prior=known20.get(s);
    if(prior){assert.equal(prior.target,c.target,'rank20 transposition changed target claim'); prior.members.push(member);}
    else known20.set(s,{members:[member],target:c.target});
  }
}
assert.equal(known20LogicalMembers,20,'rank20 logical contract domain drift');
assert.equal(known20.size,16,'rank20 unique physical transposition count drift');

const survivorSpecs=[];
for(const x of [
  {name:'C_first',attack:C,target:G3,replies:[0,1,3,4,5,6]},
  {name:'G_first',attack:G,target:C3,replies:[0,1,2,3,4,5]},
]) for(const r1 of x.replies) survivorSpecs.push({...x,r1,sequence:ROOT+`${x.attack+1}${r1+1}${x.attack+1}${x.attack+1}`});
assert.equal(survivorSpecs.length,12);

const rank18=[];
for(const sp of survivorSpecs){
  const s16=replay(k,sp.sequence); assert.equal(rank(k,s16),16); const threat=landing(k,s16,sp.attack); assert(new Set(enabledSingletons(k,s16,1)).has(threat));
  const s17=k.advance(s16,sp.attack); assert(s17>=0&&rank(k,s17)===17);
  for(const r of legal(k,s17)){
    const cell=landing(k,s17,r),s18=k.advance(s17,r);
    if(s18===domain.QN_TERMINAL_WIN){assert(new Set(enabledSingletons(k,s17,1)).has(cell)); rank18.push({member:`${sp.name}:${col(sp.r1)}->${col(r)}`,status:'P1_terminal',target:sp.target}); continue;}
    assert(s18>=0&&rank(k,s18)===18);
    rank18.push({member:`${sp.name}:${col(sp.r1)}->${col(r)}`,status:'nonterminal',state:s18,target:sp.target,resolved:sp.attack,reply:r,replyCell:cell});
  }
}

function classifyP0Action(row,a){
  const cell=landing(k,row.state,a); if(cell===0xff)return {column:col(a),legal:false,accepted:false,reason:'full'};
  const s19=k.advance(row.state,a);
  if(s19===domain.QN_TERMINAL_WIN)return {column:col(a),cell:coord(cell),legal:true,accepted:true,kind:'immediate_P0_terminal'};
  assert(s19>=0&&rank(k,s19)===19);
  const routes=[]; let accepted=true,firstFailure=null;
  for(const r of legal(k,s19)){
    const rc=landing(k,s19,r),s20=k.advance(s19,r);
    if(s20===domain.QN_TERMINAL_WIN){assert(new Set(enabledSingletons(k,s19,1)).has(rc),`P1 terminal ${coord(rc)} lacks premise`); accepted=false; firstFailure??={reply:col(r),replyCell:coord(rc),reason:'P1_terminal'}; routes.push({reply:col(r),route:'P1_terminal'}); continue;}
    assert(s20>=0&&rank(k,s20)===20);
    const immediate=terminalActions(k,s20,0); if(immediate.length){routes.push({reply:col(r),route:'immediate_P0_terminal'}); continue;}
    if(known20.has(s20)){routes.push({reply:col(r),route:'qualified_exact_rank20_contract',members:known20.get(s20).members}); continue;}
    const proof=proveRepairInvariant(s20,row.target);
    if(proof.proved){routes.push({reply:col(r),route:'repair_capacity_induction',mu:proof.mu,witness:proof.witness??null}); continue;}
    accepted=false; firstFailure??={reply:col(r),replyCell:coord(rc),reason:proof.kind,targetLive:singleton(k,s20,0,row.target),targetDistance:targetDistance(k,s20,row.target),mu:proof.mu,enabledP1Singletons:enabledSingletons(k,s20,1).map(coord)}; routes.push({reply:col(r),route:'unproved',reason:proof.kind});
  }
  return {column:col(a),cell:coord(cell),legal:true,accepted,kind:accepted?'branch_complete_to_qualified_contract':'rejected',firstFailure,routes};
}

const rows=[];
for(const row of rank18){
  if(row.status==='P1_terminal'){rows.push({...row,closed:false,witnessColumns:[],reason:'P1_terminal_before_P0'}); continue;}
  const immediate=terminalActions(k,row.state,0);
  if(immediate.length){rows.push({...row,closed:true,witnessColumns:immediate.map(x=>col(x.column)),kind:'immediate_P0_terminal'}); continue;}
  const actions=legal(k,row.state).map(a=>classifyP0Action(row,a)); const witnesses=actions.filter(a=>a.accepted);
  rows.push({...row,closed:witnesses.length>0,witnessColumns:witnesses.map(a=>a.column),witnessKinds:witnesses.map(a=>a.kind),rejected:actions.filter(a=>!a.accepted).map(a=>({column:a.column,firstFailure:a.firstFailure}))});
}

const nonterminalRows=rows.filter(r=>r.status==='nonterminal');
const closed=nonterminalRows.filter(r=>r.closed),failed=nonterminalRows.filter(r=>!r.closed);
const witnessCounts={}; for(const r of closed)for(const w of r.witnessColumns)witnessCounts[w]=(witnessCounts[w]??0)+1;
const failureReasons={}; for(const r of failed)for(const a of r.rejected??[]){const reason=a.firstFailure?.reason??'unknown'; failureReasons[reason]=(failureReasons[reason]??0)+1;}

console.log(`POSTBLOCK_PREDECESSOR_ROUTING=${JSON.stringify({
  kind:'standard7x6-post-resolved-block-predecessor-routing-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  exactRank18Rows:rows.length,
  p1TerminalBeforeP0:rows.filter(r=>r.status==='P1_terminal').length,
  nonterminalRank18Rows:nonterminalRows.length,
  closedRank18Rows:closed.length,
  failedRank18Rows:failed.length,
  witnessColumnCounts:witnessCounts,
  failureReasonCounts:failureReasons,
  knownQualifiedRank20LogicalMembers:known20LogicalMembers,
  knownQualifiedRank20UniquePhysicalStates:known20.size,
  repairProofStates:proofStates,
  repairProofActionsChecked:proofActionsChecked,
  repairProofP1BranchesChecked:proofP1BranchesChecked,
  repairProofMaxDepth:maxDepth,
  closedRows:closed.map(r=>({member:r.member,target:coord(r.target),mu:mu(k,r.state),targetDistance:targetDistance(k,r.state,r.target),witnessColumns:r.witnessColumns})),
  failureSamples:failed.slice(0,12).map(r=>({member:r.member,target:coord(r.target),mu:mu(k,r.state),targetDistance:targetDistance(k,r.state,r.target),heights:heights(k,r.state),enabledP1Singletons:enabledSingletons(k,r.state,1).map(coord),rejected:r.rejected})),
  interpretation:failed.length===0
    ? 'Every nonterminal rank-18 state after the forced resolved-column block has at least one P0 action whose complete P1 reply set lands in an immediate P0 terminal certificate, an exact already-qualified rank-20 latent contract, or the well-founded repair-capacity induction. This closes the post-block predecessor seam without arbitrary frontier search.'
    : 'Some post-block rank-18 states still fail one-step composition into qualified contracts. Preserve their exact action/reply separators; do not infer loss or widen to arbitrary search.',
  theoremBoundary:'Exact only for rank-18 states generated from the 12 fixed target-block survivors after the proven forced C4/G4 defensive event. Candidate P0 actions are exhausted over legal columns, but leaves are accepted only if already-qualified terminal/rank20/repair contracts discharge every P1 reply. Physical state identity is used only for exact membership in the previously-qualified rank-20 contract; logical-member multiplicity is retained separately.',
  authority:'Exact C4-0010 transitions/residuals, enabled-singleton terminal certificates, the exact rank-20 latent-contract closure, and the well-founded repair-capacity induction; no solved W/D/L labels or recursive q-state values.',
})}`);
