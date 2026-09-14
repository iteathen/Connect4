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

function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(id>=0);}return id;}
function landing(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function rank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
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
function terminalActions(k,id,p){
 const enabled=new Set(enabledSingletons(k,id,p)),out=[];
 for(let c=0;c<7;c++){
  const cell=landing(k,id,c);if(cell===0xff)continue;
  const child=k.advance(id,c);
  if(child===domain.QN_TERMINAL_WIN){assert(enabled.has(cell),`${p===0?'P0':'P1'} terminal ${coord(cell)} lacks enabled singleton premise`);out.push({column:c,cell});}
 }
 return out;
}
function invariant(k,id,target){return rank(k,id)%2===0&&singleton(k,id,0,target)&&targetDistance(k,id,target)===1;}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});k.prepareSearchStorage();

// Proof classes are claim-relative proof terms, not state identities. Physical action/reply labels
// are erased only after exact branch coverage has been verified; branch multiplicity and child
// proof classes remain load-bearing. Class 0 is the terminal predecessor base case.
const proofClassIds=new Map([['T',0]]);
const proofClassDefs=[{id:0,mu:null,signature:'T',kind:'immediate_P0_terminal'}];
function internProofClass(m,branchTokens){
 const signature=`M${m}[${[...branchTokens].sort().join(',')}]`;
 let id=proofClassIds.get(signature);
 if(id!==undefined)return {id,signature};
 id=proofClassDefs.length;
 proofClassIds.set(signature,id);
 proofClassDefs.push({id,mu:m,signature,kind:'repair_predecessor'});
 return {id,signature};
}

const memo=new Map();
let proofStates=0,candidateActionsChecked=0,p1BranchesChecked=0,maxDepth=0;
const unprovedSamples=[];
function prove(state,target,depth=0){
 const mk=`${state}:${target}`;
 if(memo.has(mk))return memo.get(mk);
 proofStates++;maxDepth=Math.max(maxDepth,depth);
 if(proofStates>MAX_PROOF_STATES)throw new Error(`proof-state cap exceeded ${MAX_PROOF_STATES}`);
 assert.equal(rank(k,state)%2,0,'proof node must be P0 turn');
 const m=mu(k,state);
 const immediate=terminalActions(k,state,0);
 if(immediate.length){
  const out={proved:true,kind:'immediate_P0_terminal',mu:m,proofClassId:0,proofClassSignature:'T',terminalActions:immediate.map(a=>col(a.column))};memo.set(mk,out);return out;
 }
 if(!invariant(k,state,target)){
  const out={proved:false,kind:'outside_repair_invariant',mu:m,targetLive:singleton(k,state,0,target),targetDistance:targetDistance(k,state,target)};memo.set(mk,out);return out;
 }

 const winningActions=[];
 const rejected=[];
 for(const action of REPAIRS){
  const cell=landing(k,state,action);if(cell===0xff)continue;
  candidateActionsChecked++;
  const x=k.advance(state,action);
  if(x===domain.QN_TERMINAL_WIN){
   winningActions.push({column:col(action),kind:'P0_terminal_now',actionProofClassId:0,actionProofSignature:'T'});
   continue;
  }
  assert(x>=0&&rank(k,x)===rank(k,state)+1);
  assert.equal(mu(k,x),m-1,'repair action must strictly decrease global repair capacity');

  const branches=[];const branchTokens=[];let actionProved=true,reason=null;
  for(let rc=0;rc<7;rc++){
   const replyCell=landing(k,x,rc);if(replyCell===0xff)continue;
   p1BranchesChecked++;
   const y=k.advance(x,rc);
   if(y===domain.QN_TERMINAL_WIN){actionProved=false;reason=`P1_terminal:${col(rc)}`;branches.push({reply:col(rc),result:'P1_terminal'});break;}
   assert(y>=0&&rank(k,y)===rank(k,state)+2);
   assert(mu(k,y)<=m-1,'P1 reply increased global repair capacity');
   const nextImmediate=terminalActions(k,y,0);
   if(nextImmediate.length){
    branches.push({reply:col(rc),result:'P0_terminal',mu:mu(k,y),proofClassId:0});
    branchTokens.push('T');
    continue;
   }
   assert(singleton(k,y,0,target),'nonterminal reply killed live target singleton');
   assert.equal(targetDistance(k,y,target),1,'nonterminal reply neither preserved latent target nor exposed an immediate terminal');
   const child=prove(y,target,depth+1);
   branches.push({reply:col(rc),result:child.proved?'induction':'unproved',mu:mu(k,y),proofClassId:child.proofClassId??null});
   if(!child.proved){actionProved=false;reason=`unproved:${col(rc)}:${child.kind}`;break;}
   branchTokens.push(`C${child.proofClassId}`);
  }
  if(actionProved){
   const actionClass=internProofClass(m,branchTokens);
   winningActions.push({column:col(action),kind:'repair_induction',afterP0Mu:m-1,branches,actionProofClassId:actionClass.id,actionProofSignature:actionClass.signature});
  }else rejected.push({column:col(action),reason});
 }
 const proved=winningActions.length>0;
 let proofClassId=null,proofClassSignature=null,selectedWitnessColumn=null;
 if(proved){
  const selected=[...winningActions].sort((a,b)=>a.actionProofSignature.localeCompare(b.actionProofSignature)||a.column.localeCompare(b.column))[0];
  proofClassId=selected.actionProofClassId;
  proofClassSignature=selected.actionProofSignature;
  selectedWitnessColumn=selected.column;
 }
 const out={proved,kind:proved?'repair_predecessor':'no_repair_predecessor',mu:m,proofClassId,proofClassSignature,selectedWitnessColumn,winningActions,rejected};
 memo.set(mk,out);
 if(!proved&&unprovedSamples.length<12)unprovedSamples.push({state,target:coord(target),rank:rank(k,state),mu:m,rejected});
 return out;
}

const cases=[
 {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3,adjacentTail:5},
 {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3,adjacentTail:5},
 {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3,adjacentTail:3},
 {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3,adjacentTail:3},
];
const starts=[];let adjacentImmediate=0;
for(const c of cases){
 const r19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));
 const r20=k.advance(r19,c.adjacentTail);assert(r20>=0&&rank(k,r20)===20);
 const r21=k.advance(r20,c.adjacentTail);assert(r21>=0&&r21!==domain.QN_TERMINAL_WIN&&rank(k,r21)===21);
 for(let rc=0;rc<7;rc++){
  const replyCell=landing(k,r21,rc);if(replyCell===0xff)continue;
  const y=k.advance(r21,rc);assert(y>=0&&y!==domain.QN_TERMINAL_WIN&&rank(k,y)===22);
  const immediate=terminalActions(k,y,0);
  if(immediate.length){adjacentImmediate++;continue;}
  assert(invariant(k,y,c.target),'adjacent-tail nonterminal successor left repair invariant');
  starts.push({member:`${c.name}:${col(c.adjacentTail)}->P1:${col(rc)}`,state:y,target:c.target,mu:mu(k,y)});
 }
}
assert.equal(adjacentImmediate,4,'expected one immediate target terminal reply per adjacent-tail action');
assert.equal(starts.length,16,'expected 16 nonterminal adjacent-tail successor states');

const startResults=starts.map(s=>({member:s.member,target:coord(s.target),mu:s.mu,...prove(s.state,s.target)}));
const provedStarts=startResults.filter(x=>x.proved);
const failedStarts=startResults.filter(x=>!x.proved);
const muHistogram={},chosenColumnCounts={},proofKindCounts={},provedByMu={},unprovedByMu={},classIdsByMu={};
const classPhysicalCounts={};
for(const v of memo.values()){
 muHistogram[v.mu]=(muHistogram[v.mu]??0)+1;
 proofKindCounts[v.kind]=(proofKindCounts[v.kind]??0)+1;
 if(v.proved){
  provedByMu[v.mu]=(provedByMu[v.mu]??0)+1;
  if(v.proofClassId!==null){
   classPhysicalCounts[v.proofClassId]=(classPhysicalCounts[v.proofClassId]??0)+1;
   (classIdsByMu[v.mu]??=new Set()).add(v.proofClassId);
  }
 }else unprovedByMu[v.mu]=(unprovedByMu[v.mu]??0)+1;
 if(v.proved&&v.winningActions)for(const a of v.winningActions)chosenColumnCounts[a.column]=(chosenColumnCounts[a.column]??0)+1;
}
const distinctClassIdsByMu=Object.fromEntries(Object.entries(classIdsByMu).map(([m,s])=>[m,s.size]));
const topProofClasses=Object.entries(classPhysicalCounts).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([id,count])=>({id:Number(id),count,mu:proofClassDefs[Number(id)]?.mu,signature:proofClassDefs[Number(id)]?.signature}));
const startCertificates=startResults.map(x=>({member:x.member,target:x.target,mu:x.mu,proved:x.proved,winningColumns:(x.winningActions??[]).map(a=>a.column),selectedWitnessColumn:x.selectedWitnessColumn,proofClassId:x.proofClassId,kind:x.kind}));
const startProofClasses=[...new Set(provedStarts.map(x=>x.proofClassId))].sort((a,b)=>a-b);
console.log(`REPAIR_CAPACITY_PREDECESSOR_INDUCTION=${JSON.stringify({
 kind:'standard7x6-repair-capacity-restricted-predecessor-induction-v2',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 measure:'mu=sum remaining capacities in A,B,D,E,F',
 inductionRule:'At a P0 invariant state, choose a repair-column action for which every legal P1 reply is nonterminal and routes either to an immediate P0 terminal certificate or to another invariant P0 state with strictly smaller mu.',
 proofTermAbstraction:'Claim-relative proof terms erase physical P0/P1 column labels only after exact branch coverage. They retain current mu, P1 branch multiplicity, terminal alternatives, and the canonical child proof-class multiset. Equality is proof-reuse equality for this restricted predecessor claim only, not q/state equality.',
 adjacentTailImmediateTerminalReplies:adjacentImmediate,nonterminalStartStates:starts.length,provedStartStates:provedStarts.length,failedStartStates:failedStarts.length,
 proofStates,candidateActionsChecked,p1BranchesChecked,maxDepth,muHistogram,proofKindCounts,provedByMu,unprovedByMu,winningActionOccurrenceCounts:chosenColumnCounts,
 canonicalProofClasses:proofClassDefs.length,nonterminalCanonicalProofClasses:proofClassDefs.length-1,distinctProofClassesByMu:distinctClassIdsByMu,startProofClasses,
 topProofClasses,startCertificates,unprovedSamples,
 interpretation:failedStarts.length===0?'All 16 nonterminal successors of the four qualified adjacent-tail actions admit an exact restricted alternating-predecessor proof over repair actions, with mu strictly decreasing at every selected P0 step. The canonical proof-term counts report the reusable calculus size after erasing physical labels only at the proof-claim boundary.':'The repair-capacity induction does not close every adjacent-tail successor. The reported unproved samples are exact counterexamples to the restricted repair policy, not global P0-loss claims.',
 theoremBoundary:'This is a restricted structural predecessor proof over actions A,B,D,E,F only and exact P1 replies. It does not use solved W/D/L labels or recursive q-state values. Physical state ids are memoization witnesses only; canonical proof classes license reuse only for this predecessor proof claim.',
 authority:'Exact C4-0010 support/residual transitions, enabled-singleton terminal certificates, the explicit well-founded repair-capacity measure, and branch-complete proof-term canonicalization only; no external solver labels, Bayesian confidence, or output-cardinality premise.'
})}`);
