#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644',C=2,G=6,C3=16,G3=20,MAX=100000;
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}

// Reconstruct the exact clean, deadline-free, mu=15 post-block rank-20 population.
const dk=makeKernel(),de=createRepairCapacityProofEngine(dk,{collectAllWinningActions:false,maxProofStates:1});
const candidates=new Map();
for(const fam of [
 {name:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
 {name:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of fam.replies1){
 const prefix=ROOT+`${fam.resolved+1}${r1+1}${fam.resolved+1}${fam.resolved+1}`,s16=replay(dk,prefix),s17=dk.advance(s16,fam.resolved);assert(s17>=0&&de.rank(s17)===17);
 for(const r2 of de.legal(s17)){
  const s18=dk.advance(s17,r2);assert(s18>=0&&s18!==domain.QN_TERMINAL_WIN&&de.rank(s18)===18);
  for(const action of de.legal(s18)){
   const s19=dk.advance(s18,action);if(s19===domain.QN_TERMINAL_WIN)continue;assert(s19>=0&&de.rank(s19)===19);
   for(const reply of de.legal(s19)){
    const replyCell=de.landing(s19,reply),s20=dk.advance(s19,reply);
    if(s20===domain.QN_TERMINAL_WIN){assert(new Set(de.enabledSingletons(s19,1)).has(replyCell));continue;}
    assert(s20>=0&&de.rank(s20)===20);if(de.terminalActions(s20,0).length||!de.invariant(s20,fam.target)||de.mu(s20)!==15||de.enabledSingletons(s20,1).length)continue;
    const key=de.exactStateTargetKey(s20,fam.target),sequence=prefix+String(fam.resolved+1)+String(r2+1)+String(action+1)+String(reply+1);
    if(!candidates.has(key))candidates.set(key,{sequence,target:fam.target});
   }
  }
 }
}
assert.equal(candidates.size,160,'mu15 clean corpus drift');
const groups=new Map([[C3,[]],[G3,[]]]);for(const row of candidates.values())groups.get(row.target).push(row);

const results=[];
for(const [target,rows] of groups){
 const k=makeKernel(),lex=createResolvedTailLexicographicProofEngine(k,{maxProofStates:MAX});let proved=0,failed=0,resourceFailure=null;const failures=[];const witnessKinds={};
 for(const row of rows){
  const state=replay(k,row.sequence);assert.equal(lex.repair.rank(state),20);assert(lex.repair.invariant(state,target));assert.equal(lex.repair.mu(state),15);assert.equal(lex.tailDeficit(state,target),2);
  let p;try{p=lex.prove(state,target);}catch(err){const msg=String(err?.message??err);if(msg.includes('lex proof-state cap exceeded')||msg.includes('reserved quotient')){resourceFailure=msg;break;}throw err;}
  if(p.proved){proved++;witnessKinds[p.witnessKind]=(witnessKinds[p.witnessKind]??0)+1;}else{failed++;if(failures.length<12)failures.push({sequence:row.sequence,kind:p.kind,measure:p.measure,rejected:p.rejected?.slice(0,6)??[]});}
 }
 results.push({target:target===C3?'C3':'G3',candidateStates:rows.length,provedStates:proved,failedStates:failed,resourceFailure,witnessKinds,stats:lex.stats(),failureSamples:failures});
}
const totalCandidates=results.reduce((s,x)=>s+x.candidateStates,0),totalProved=results.reduce((s,x)=>s+x.provedStates,0),totalFailed=results.reduce((s,x)=>s+x.failedStates,0),resourceFailures=results.filter(x=>x.resourceFailure).length;
console.log(`MU15_LEXICOGRAPHIC_CORPUS_CLOSURE=${JSON.stringify({
 kind:'standard7x6-mu15-clean-post-block-lexicographic-corpus-closure-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactCandidateStates:totalCandidates,provedStates:totalProved,failedStates:totalFailed,resourceFailures,groups:results,
 interpretation:resourceFailures===0&&totalFailed===0&&totalProved===totalCandidates
  ? 'The resolved-tail plus repair lexicographic predecessor schema closes the complete 160-state clean deadline-free mu=15 post-block corpus, not merely the twelve representative probes.'
  : 'The full mu15 corpus exposes either a logical counterexample or a bounded-resource boundary. Preserve the exact group/failure data and do not broaden the cap.',
 theoremBoundary:'Exact only for the reconstructed deadline-free mu=15 rank-20 post-block corpus. The proof uses the explicit lexicographic measure (resolved-tail deficit, repair mu), exact C4 transitions, terminal guards, and live-target/support-distance-one invariant. It is not q equality, arbitrary minimax, solved WDL, center-opening W membership, or a root solve.'
})}`);
