#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN={columns:7,rows:6,connect:4};
const ROOT='466565554644';
const C=2,G=6,C3=16,G3=20,REPAIRS=[0,1,3,4,5];
const MAX_PROOF_STATES=100000;

function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function landing(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function rank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function legal(k,id){const out=[];for(let c=0;c<7;c++)if(landing(k,id,c)!==0xff)out.push(c);return out;}
function heights(k,id){const a=[];for(let c=0;c<7;c++){const x=landing(k,id,c);a.push(x===0xff?6:Math.floor(x/7));}return a;}
function capacity(k,id,c){return 6-heights(k,id)[c];}
function mu(k,id){return REPAIRS.reduce((s,c)=>s+capacity(k,id,c),0);}
function col(c){return String.fromCharCode(65+c);}
function coord(x){return `${col(x%7)}${Math.floor(x/7)+1}`;}
function has([lo,hi],x){return x<32?(((lo>>>x)&1)!==0):(((hi>>>(x-32))&1)!==0);}
function cells(t){const a=[];for(let x=0;x<42;x++)if(has(t,x))a.push(x);return a;}
function terms(k,id,p){const q=p===0?k.states.p0At(id):k.states.p1At(id);return k.classes.terms(q).map(cells);}
function singleton(k,id,p,x){return terms(k,id,p).some(t=>t.length===1&&t[0]===x);}
function enabledSingletons(k,id,p){return terms(k,id,p).filter(t=>t.length===1).map(t=>t[0]).filter(x=>landing(k,id,x%7)===x).sort((a,b)=>a-b);}
function targetDistance(k,id,t){return Math.max(0,2-heights(k,id)[t%7]);}
function terminalActions(k,id,p){const enabled=new Set(enabledSingletons(k,id,p)),out=[];for(const c of legal(k,id)){const cell=landing(k,id,c),child=k.advance(id,c);if(child===domain.QN_TERMINAL_WIN){assert(enabled.has(cell),`${p===0?'P0':'P1'} terminal ${coord(cell)} lacks enabled-singleton premise`);out.push({column:c,cell});}}return out;}
function invariant(k,id,target){return rank(k,id)%2===0&&singleton(k,id,0,target)&&targetDistance(k,id,target)===1;}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});k.prepareSearchStorage();

// Reproduce the already-qualified repair proof calculus, but freeze it before the new predecessor layer.
const memo=new Map();
let proofStates=0,candidateActionsChecked=0,p1BranchesChecked=0,maxDepth=0;
function prove(state,target,depth=0){
  const mk=`${state}:${target}`; if(memo.has(mk))return memo.get(mk);
  proofStates++;maxDepth=Math.max(maxDepth,depth);if(proofStates>MAX_PROOF_STATES)throw new Error(`proof-state cap exceeded ${MAX_PROOF_STATES}`);
  assert.equal(rank(k,state)%2,0,'repair proof node must be P0 turn');
  const m=mu(k,state), immediate=terminalActions(k,state,0);
  if(immediate.length){const out={proved:true,kind:'immediate_P0_terminal',mu:m};memo.set(mk,out);return out;}
  if(!invariant(k,state,target)){const out={proved:false,kind:'outside_repair_invariant',mu:m,targetLive:singleton(k,state,0,target),targetDistance:targetDistance(k,state,target)};memo.set(mk,out);return out;}
  const winningActions=[],rejected=[];
  for(const action of REPAIRS){
    if(landing(k,state,action)===0xff)continue;candidateActionsChecked++;
    const x=k.advance(state,action);
    if(x===domain.QN_TERMINAL_WIN){winningActions.push({column:col(action),kind:'P0_terminal_now'});continue;}
    assert(x>=0&&rank(k,x)===rank(k,state)+1);assert.equal(mu(k,x),m-1,'repair action must decrease mu');
    let ok=true,reason=null;
    for(const rc of legal(k,x)){
      const replyCell=landing(k,x,rc);p1BranchesChecked++;const y=k.advance(x,rc);
      if(y===domain.QN_TERMINAL_WIN){assert(new Set(enabledSingletons(k,x,1)).has(replyCell));ok=false;reason=`P1_terminal:${col(rc)}`;break;}
      assert(y>=0&&rank(k,y)===rank(k,state)+2);assert(mu(k,y)<=m-1,'P1 reply increased mu');
      if(terminalActions(k,y,0).length)continue;
      assert(singleton(k,y,0,target),'repair branch killed target singleton');assert.equal(targetDistance(k,y,target),1,'repair branch left support-distance-one invariant');
      const child=prove(y,target,depth+1);if(!child.proved){ok=false;reason=`unproved:${col(rc)}:${child.kind}`;break;}
    }
    if(ok)winningActions.push({column:col(action),kind:'repair_induction'});else rejected.push({column:col(action),reason});
  }
  const out={proved:winningActions.length>0,kind:winningActions.length?'repair_predecessor':'no_repair_predecessor',mu:m,winningActions,rejected};memo.set(mk,out);return out;
}

// Seed exactly the 20 logical / 16 physical rank-20 latent-contract members already qualified.
const known20=new Map();let logical20=0;
for(const c of [
 {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
 {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
 {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
 {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
]){
  const r19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));assert.equal(rank(k,r19),19);
  for(const repair of REPAIRS){
    const r20=k.advance(r19,repair);assert(r20>=0&&rank(k,r20)===20);logical20++;
    const proof=prove(r20,c.target);assert(proof.proved,`${c.name}:${col(repair)} rank20 proof regressed`);
    const member=`${c.name}:${col(repair)}`,prior=known20.get(r20);
    if(prior){assert.equal(prior.target,c.target,'rank20 transposition changed target');prior.members.push(member);}else known20.set(r20,{target:c.target,members:[member]});
  }
}
assert.equal(logical20,20);assert.equal(known20.size,16);
const frozenMemoSize=memo.size;
const certifiedRepairKeys=new Set([...memo.entries()].filter(([,v])=>v.proved).map(([key])=>key));
const certifiedRepairStateCount=new Set([...certifiedRepairKeys].map(key=>key.split(':')[0])).size;

function certifiedLeaf(state,target){
  if(terminalActions(k,state,0).length)return {accepted:true,route:'immediate_P0_terminal'};
  const exact=known20.get(state);if(exact&&exact.target===target)return {accepted:true,route:'qualified_rank20_contract',members:exact.members};
  if(certifiedRepairKeys.has(`${state}:${target}`))return {accepted:true,route:'frozen_repair_proof_DAG',mu:mu(k,state)};
  return {accepted:false,route:'outside_frozen_winning_set',targetLive:singleton(k,state,0,target),targetDistance:targetDistance(k,state,target),mu:mu(k,state),enabledP1Singletons:enabledSingletons(k,state,1).map(coord)};
}

// Build the 12 exact rank-16 survivor states from the fixed target macro and apply the proven forced C4/G4 block.
const survivor16=new Map();
const rank18Rows=[];
for(const x of [
 {family:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
 {family:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
]){
  for(const r1 of x.replies1){
    const seq=ROOT+`${x.resolved+1}${r1+1}${x.resolved+1}${x.resolved+1}`;
    const s16=replay(k,seq);assert.equal(rank(k,s16),16);const threat=landing(k,s16,x.resolved);assert(new Set(enabledSingletons(k,s16,1)).has(threat));
    survivor16.set(s16,{family:x.family,r1,resolved:x.resolved,target:x.target,sequence:seq});
    const s17=k.advance(s16,x.resolved);assert(s17>=0&&rank(k,s17)===17);
    for(const reply of legal(k,s17)){
      const replyCell=landing(k,s17,reply),s18=k.advance(s17,reply);
      if(s18===domain.QN_TERMINAL_WIN){assert(new Set(enabledSingletons(k,s17,1)).has(replyCell));rank18Rows.push({family:x.family,r1,reply,status:'P1_terminal'});continue;}
      assert(s18>=0&&rank(k,s18)===18);rank18Rows.push({family:x.family,r1,reply,status:'nonterminal',state:s18,target:x.target,resolved:x.resolved});
    }
  }
}
assert.equal(survivor16.size,12);assert.equal(rank18Rows.length,84);assert.equal(rank18Rows.filter(x=>x.status==='P1_terminal').length,0);

let predecessorActionsChecked=0,predecessorP1BranchesChecked=0;
function closeOnePredecessor(row){
  const immediate=terminalActions(k,row.state,0);
  if(immediate.length)return {...row,closed:true,kind:'immediate_P0_terminal',witnessColumns:immediate.map(x=>col(x.column))};
  const winning=[],rejected=[];
  for(const action of legal(k,row.state)){
    predecessorActionsChecked++;
    const actionCell=landing(k,row.state,action),s19=k.advance(row.state,action);
    if(s19===domain.QN_TERMINAL_WIN){winning.push({column:col(action),kind:'P0_terminal_now'});continue;}
    assert(s19>=0&&rank(k,s19)===19);
    const routes=[];let ok=true,firstFailure=null;
    for(const reply of legal(k,s19)){
      predecessorP1BranchesChecked++;
      const replyCell=landing(k,s19,reply),s20=k.advance(s19,reply);
      if(s20===domain.QN_TERMINAL_WIN){assert(new Set(enabledSingletons(k,s19,1)).has(replyCell));ok=false;firstFailure={reply:col(reply),replyCell:coord(replyCell),reason:'P1_terminal'};routes.push({reply:col(reply),route:'P1_terminal'});break;}
      assert(s20>=0&&rank(k,s20)===20);
      const leaf=certifiedLeaf(s20,row.target);routes.push({reply:col(reply),replyCell:coord(replyCell),...leaf});
      if(!leaf.accepted){ok=false;firstFailure={reply:col(reply),replyCell:coord(replyCell),...leaf};break;}
    }
    if(ok)winning.push({column:col(action),cell:coord(actionCell),kind:'branch_complete_frozen_predecessor',routes});else rejected.push({column:col(action),firstFailure});
  }
  return {...row,closed:winning.length>0,kind:winning.length?'frozen_predecessor':'no_frozen_predecessor',witnessColumns:winning.map(x=>x.column),winning,rejected};
}

const rank18Results=rank18Rows.filter(x=>x.status==='nonterminal').map(closeOnePredecessor);
assert.equal(rank18Results.length,84);
const rank18Closed=rank18Results.filter(x=>x.closed),rank18Failed=rank18Results.filter(x=>!x.closed);

// If every reply after the forced block is in the frozen winning set, each rank-16 survivor is itself a certified predecessor.
const rank16Results=[];
for(const [state,meta] of survivor16){
  const s17=k.advance(state,meta.resolved);assert(s17>=0&&rank(k,s17)===17);
  const routes=[];let closed=true;
  for(const reply of legal(k,s17)){
    const s18=k.advance(s17,reply);assert(s18>=0&&s18!==domain.QN_TERMINAL_WIN);
    const row=rank18Results.find(x=>x.state===s18&&x.target===meta.target);
    assert(row,'rank18 route reconstruction drift');routes.push({reply:col(reply),closed:row.closed,witnessColumns:row.witnessColumns});if(!row.closed)closed=false;
  }
  rank16Results.push({...meta,state,closed,forcedAction:col(meta.resolved),routes});
}
const rank16ClosedStates=new Set(rank16Results.filter(x=>x.closed).map(x=>x.state));

// Re-evaluate the two exact same-target macros from the fixed latent root using only terminal certificates and closed rank-16 survivors.
function testRootMacro(attack,target){
  const root=replay(k,ROOT);assert.equal(rank(k,root),12);const first=k.advance(root,attack);assert(first>=0&&rank(k,first)===13);
  const firstBranches=[];let closed=true;
  for(const r1 of legal(k,first)){
    const r1cell=landing(k,first,r1),s14=k.advance(first,r1);
    if(s14===domain.QN_TERMINAL_WIN){assert(new Set(enabledSingletons(k,first,1)).has(r1cell));closed=false;firstBranches.push({reply1:col(r1),route:'P1_terminal'});continue;}
    assert(s14>=0&&rank(k,s14)===14);
    if(terminalActions(k,s14,0).length){firstBranches.push({reply1:col(r1),route:'immediate_P0_terminal'});continue;}
    const second=k.advance(s14,attack);
    if(second===domain.QN_TERMINAL_WIN){firstBranches.push({reply1:col(r1),route:'P0_terminal_second_support'});continue;}
    assert(second>=0&&rank(k,second)===15);
    const secondRoutes=[];let branchClosed=true;
    for(const r2 of legal(k,second)){
      const r2cell=landing(k,second,r2),s16=k.advance(second,r2);
      if(s16===domain.QN_TERMINAL_WIN){assert(new Set(enabledSingletons(k,second,1)).has(r2cell));branchClosed=false;secondRoutes.push({reply2:col(r2),route:'P1_terminal'});continue;}
      assert(s16>=0&&rank(k,s16)===16);
      if(terminalActions(k,s16,0).length){secondRoutes.push({reply2:col(r2),route:'immediate_P0_terminal'});continue;}
      if(rank16ClosedStates.has(s16)){secondRoutes.push({reply2:col(r2),route:'closed_rank16_survivor'});continue;}
      branchClosed=false;secondRoutes.push({reply2:col(r2),route:'outside_closed_rank16',targetLive:singleton(k,s16,0,target),targetDistance:targetDistance(k,s16,target),enabledP1Singletons:enabledSingletons(k,s16,1).map(coord)});
    }
    if(!branchClosed)closed=false;firstBranches.push({reply1:col(r1),route:branchClosed?'second_support_branch_closed':'second_support_branch_open',secondRoutes});
  }
  return {attack:col(attack),closed,firstBranches};
}
const rootMacros=[testRootMacro(C,C3),testRootMacro(G,G3)];

assert.equal(memo.size,frozenMemoSize,'new predecessor layer mutated frozen repair proof DAG');
const witnessCounts={};for(const x of rank18Closed)for(const c of x.witnessColumns)witnessCounts[c]=(witnessCounts[c]??0)+1;
const failureReasons={};for(const x of rank18Failed)for(const r of x.rejected){const q=r.firstFailure?.reason??r.firstFailure?.route??'unknown';failureReasons[q]=(failureReasons[q]??0)+1;}

console.log(`CERTIFIED_DAG_PREDECESSOR_CLOSURE=${JSON.stringify({
 kind:'standard7x6-certified-repair-dag-one-layer-predecessor-closure-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 frozenRepairProof:{memoEntries:frozenMemoSize,certifiedStateTargetPairs:certifiedRepairKeys.size,uniqueCertifiedPhysicalStates:certifiedRepairStateCount,proofStates,candidateActionsChecked,p1BranchesChecked,maxDepth,rank20LogicalMembers:logical20,rank20UniquePhysicalStates:known20.size},
 postBlockRank18:{states:rank18Results.length,closed:rank18Closed.length,failed:rank18Failed.length,witnessColumnCounts:witnessCounts,predecessorActionsChecked,predecessorP1BranchesChecked,failureReasonCounts:failureReasons},
 rank16ForcedBlock:{states:rank16Results.length,closed:rank16Results.filter(x=>x.closed).length,failed:rank16Results.filter(x=>!x.closed).length,rows:rank16Results.map(x=>({member:`${x.family}:${col(x.r1)}`,sequence:x.sequence,target:coord(x.target),closed:x.closed,forcedAction:x.forcedAction}))},
 latentRoot:{sequence:ROOT,macros:rootMacros,closedCandidateColumns:rootMacros.filter(x=>x.closed).map(x=>x.attack)},
 failureSamples:rank18Failed.slice(0,16).map(x=>({member:`${x.family}:${col(x.r1)}->${col(x.reply)}`,target:coord(x.target),mu:mu(k,x.state),targetDistance:targetDistance(k,x.state,x.target),enabledP1Singletons:enabledSingletons(k,x.state,1).map(coord),rejected:x.rejected})),
 interpretation:rootMacros.some(x=>x.closed)
   ? 'At least one exact target-support macro at 466565554644 is now branch-complete into immediate P0 terminal certificates or predecessor states whose leaves are contained in the frozen already-qualified repair proof DAG. This licenses promotion of the fixed latent root to a guarded P0-winning predecessor contract, subject to review of the explicit fixed-policy composition and without importing new recursive states.'
   : rank18Failed.length===0
     ? 'The post-block predecessor layer closes completely into the frozen qualified repair proof DAG, but the fixed latent-root target macro still has an exact nonclosing branch outside the closed rank-16 survivor set. Preserve that higher-level separator.'
     : 'The frozen repair proof DAG is insufficient to absorb every post-block rank-18 state in one predecessor layer. Preserve the exact failed states and action/reply separators; do not recurse into new states or increase storage.',
 theoremBoundary:'The repair proof DAG is fully constructed and frozen before the new predecessor layer. New rank-18 states may use one legal P0 action and exhaustive exact P1 replies, but a nonterminal rank-20 leaf is accepted only if it is already in the frozen certified repair state-target set or the exact qualified rank-20 latent contract. No recursive proof call is made from the new predecessor layer.',
 authority:'Exact C4-0010 support/residual transitions, enabled-singleton terminal certificates, the previously-qualified rank-20 latent-contract repair proofs, and one explicit alternating-predecessor layer only; no solved W/D/L labels, arbitrary minimax/frontier search, q equality, or storage widening.'
})}`);
