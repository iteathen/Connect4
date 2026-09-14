#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine, STANDARD7X6_REPAIR_COLUMNS as REPAIRS } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644',C=2,G=6,C3=16,G3=20,MAX=100000;
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function phase(e,state){return e.heights(state).map(x=>x&1).join('');}
function sortedCaps(e,state){return REPAIRS.map(c=>e.capacity(state,c)).sort((a,b)=>a-b).join(',');}

// Pure reconstruction kernel. Shard identity is execution-only: target + exact phase + sorted repair-capacity multiset.
// No equivalence or proof reuse is inferred from belonging to the same shard.
const dk=makeKernel(),de=createRepairCapacityProofEngine(dk,{collectAllWinningActions:false,maxProofStates:1});
const candidates=new Map();
for(const fam of [
 {name:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
 {name:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of fam.replies1){
 const prefix=ROOT+`${fam.resolved+1}${r1+1}${fam.resolved+1}${fam.resolved+1}`;
 const s16=replay(dk,prefix),s17=dk.advance(s16,fam.resolved);assert(s17>=0&&de.rank(s17)===17);
 for(const r2 of de.legal(s17)){
  const s18=dk.advance(s17,r2);assert(s18>=0&&s18!==domain.QN_TERMINAL_WIN&&de.rank(s18)===18);
  for(const action of de.legal(s18)){
   const s19=dk.advance(s18,action);if(s19===domain.QN_TERMINAL_WIN)continue;assert(s19>=0&&de.rank(s19)===19);
   for(const reply of de.legal(s19)){
    const replyCell=de.landing(s19,reply),s20=dk.advance(s19,reply);
    if(s20===domain.QN_TERMINAL_WIN){assert(new Set(de.enabledSingletons(s19,1)).has(replyCell));continue;}
    assert(s20>=0&&de.rank(s20)===20);
    if(de.terminalActions(s20,0).length||!de.invariant(s20,fam.target)||de.mu(s20)!==15||de.enabledSingletons(s20,1).length)continue;
    const key=de.exactStateTargetKey(s20,fam.target);
    const sequence=prefix+String(fam.resolved+1)+String(r2+1)+String(action+1)+String(reply+1);
    if(!candidates.has(key))candidates.set(key,{sequence,target:fam.target,phase:phase(de,s20),sortedCaps:sortedCaps(de,s20)});
   }
  }
}
assert.equal(candidates.size,160,'mu15 clean corpus drift');

const shards=new Map();
for(const row of candidates.values()){
 const key=`${row.target===C3?'C3':'G3'}|p${row.phase}|c${row.sortedCaps}`;
 const a=shards.get(key)??[];a.push(row);shards.set(key,a);
}
const ordered=[...shards.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
const results=[];
for(const [shardKey,rows] of ordered){
 const k=makeKernel(),lex=createResolvedTailLexicographicProofEngine(k,{maxProofStates:MAX});
 let proved=0,failed=0,resourceFailure=null;const failureSamples=[],witnessKinds={};
 for(const row of rows){
  const state=replay(k,row.sequence);
  assert.equal(lex.repair.rank(state),20);assert(lex.repair.invariant(state,row.target));assert.equal(lex.repair.mu(state),15);assert.equal(lex.tailDeficit(state,row.target),2);
  let p;
  try{p=lex.prove(state,row.target);}catch(err){const msg=String(err?.message??err);if(msg.includes('lex proof-state cap exceeded')||msg.includes('reserved quotient')){resourceFailure=msg;break;}throw err;}
  if(p.proved){proved++;witnessKinds[p.witnessKind]=(witnessKinds[p.witnessKind]??0)+1;}
  else{failed++;if(failureSamples.length<5)failureSamples.push({sequence:row.sequence,kind:p.kind,measure:p.measure,rejected:p.rejected?.slice(0,6)??[]});}
 }
 results.push({shardKey,candidateStates:rows.length,provedStates:proved,failedStates:failed,resourceFailure,witnessKinds,stats:lex.stats(),failureSamples});
}
const totalCandidates=results.reduce((s,x)=>s+x.candidateStates,0),totalProved=results.reduce((s,x)=>s+x.provedStates,0),totalFailed=results.reduce((s,x)=>s+x.failedStates,0),resourceFailures=results.filter(x=>x.resourceFailure).length;
const maxShardSize=Math.max(...results.map(x=>x.candidateStates)),maxProofStatesObserved=Math.max(...results.map(x=>x.stats.proofStates));
console.log(`MU15_LEXICOGRAPHIC_STRUCTURAL_SHARDS=${JSON.stringify({
 kind:'standard7x6-mu15-lexicographic-structural-sharded-qualification-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 shardKeyMeaning:'execution partition only: remaining target + exact GF2 phase location + sorted A/B/D/E/F capacity multiset; no state/q equivalence is inferred',
 exactCandidateStates:totalCandidates,structuralShardCount:results.length,maxShardSize,provedStates:totalProved,failedStates:totalFailed,resourceFailures,maxProofStatesObserved,
 shards:results,
 interpretation:resourceFailures===0&&totalFailed===0&&totalProved===totalCandidates
  ? 'All 160 clean deadline-free mu15 post-block states close under the same resolved-tail plus repair lexicographic predecessor theorem when qualification is partitioned by preexisting structural observables; the earlier whole-target runs were resource-contamination boundaries, not logical failures.'
  : 'At least one structural shard exposes either a logical counterexample or a bounded-resource boundary. Preserve its exact shard and failure data; do not widen proof or quotient caps.',
 theoremBoundary:'Sharding is qualification hygiene only and has no semantic role in the theorem. Each state is proved by exact C4 transitions under the same lexicographic measure (resolved-tail deficit, repair mu), terminal guards, and live-target/support-distance-one invariant. This is not q equality, solved WDL, arbitrary minimax, center-opening W membership, or a root solve.'
})}`);
