#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import { createResolvedTailCapacityProofEngine } from './quotient-standard7x6-resolved-tail-proof-lib.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644',C=2,G3=20,MAX=100000;
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}

// Reconstruction only.
const dk=makeKernel(),de=createRepairCapacityProofEngine(dk,{collectAllWinningActions:false,maxProofStates:1});
const candidates=new Map();
for(const r1 of [0,1,3,4,5,6]){
 const prefix=ROOT+`${C+1}${r1+1}${C+1}${C+1}`;
 const s16=replay(dk,prefix),s17=dk.advance(s16,C);assert(s17>=0&&de.rank(s17)===17);
 for(const r2 of de.legal(s17)){
  const s18=dk.advance(s17,r2);assert(s18>=0&&s18!==domain.QN_TERMINAL_WIN&&de.rank(s18)===18);
  for(const action of de.legal(s18)){
   const s19=dk.advance(s18,action);if(s19===domain.QN_TERMINAL_WIN)continue;assert(s19>=0&&de.rank(s19)===19);
   for(const reply of de.legal(s19)){
    const replyCell=de.landing(s19,reply),s20=dk.advance(s19,reply);
    if(s20===domain.QN_TERMINAL_WIN){assert(new Set(de.enabledSingletons(s19,1)).has(replyCell));continue;}
    assert(s20>=0&&de.rank(s20)===20);
    if(de.terminalActions(s20,0).length||!de.invariant(s20,G3)||de.mu(s20)!==16||de.enabledSingletons(s20,1).length)continue;
    const key=de.exactStateTargetKey(s20,G3);
    const sequence=prefix+String(C+1)+String(r2+1)+String(action+1)+String(reply+1);
    if(!candidates.has(key))candidates.set(key,{sequence});
   }
  }
 }
}
assert.equal(candidates.size,37,'G3 mu16 clean corpus drift');
const rows=[...candidates.values()].sort((a,b)=>a.sequence.localeCompare(b.sequence));

function runAdditive(){
 const k=makeKernel(),e=createResolvedTailCapacityProofEngine(k,{collectAllWinningActions:true,maxProofStates:MAX});
 const out=[];
 for(const row of rows){
  const state=replay(k,row.sequence);assert(e.base.invariant(state,G3));assert.equal(e.base.mu(state),16);
  const p=e.prove(state,G3);
  out.push({sequence:row.sequence,proved:p.proved,nu:e.nu(state,G3),witness:p.witness??null,witnessRole:p.witnessRole??null,rejected:p.rejected?.slice(0,8)??[]});
 }
 return {rows:out,stats:e.stats()};
}
function runLexicographic(){
 const k=makeKernel(),e=createResolvedTailLexicographicProofEngine(k,{maxProofStates:MAX});
 const out=[];
 for(const row of rows){
  const state=replay(k,row.sequence);assert(e.repair.invariant(state,G3));assert.equal(e.repair.mu(state),16);
  const p=e.prove(state,G3);
  out.push({sequence:row.sequence,proved:p.proved,measure:e.measure(state,G3),witness:p.witness??null,witnessKind:p.witnessKind??null,rejected:p.rejected?.slice(0,8)??[]});
 }
 return {rows:out,stats:e.stats()};
}

const additive=runAdditive();
if(typeof globalThis.gc==='function')globalThis.gc();
const lexicographic=runLexicographic();
const additiveFailures=additive.rows.filter(x=>!x.proved);
const lexFailures=lexicographic.rows.filter(x=>!x.proved);
const additiveFailureSet=new Set(additiveFailures.map(x=>x.sequence));
const lexFailureSet=new Set(lexFailures.map(x=>x.sequence));
const sharedFailures=[...additiveFailureSet].filter(x=>lexFailureSet.has(x)).sort();
const additiveOnly=[...additiveFailureSet].filter(x=>!lexFailureSet.has(x)).sort();
const lexOnly=[...lexFailureSet].filter(x=>!additiveFailureSet.has(x)).sort();

console.log(`G3_MU16_RESOLVED_TAIL_FALSIFIERS=${JSON.stringify({
 kind:'standard7x6-g3-mu16-resolved-tail-falsifier-comparison-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactCleanStates:rows.length,
 additive:{proved:additive.rows.filter(x=>x.proved).length,failed:additiveFailures.length,stats:additive.stats,failures:additiveFailures},
 lexicographic:{proved:lexicographic.rows.filter(x=>x.proved).length,failed:lexFailures.length,stats:lexicographic.stats,failures:lexFailures},
 sharedFailureCount:sharedFailures.length,sharedFailures,additiveOnlyFailures:additiveOnly,lexicographicOnlyFailures:lexOnly,
 interpretation:sharedFailures.length===additiveFailures.length&&sharedFailures.length===lexFailures.length
  ? 'Additive nu and lexicographic (resolved-tail deficit, repair mu) fail on exactly the same G3/mu16 roots. The remaining obstruction is therefore not resolved by choosing between these two well-founded rankings; route from the exact shared action/reply failures.'
  : 'The two resolved-tail rankings differ on at least one exact root. Preserve the differential before changing the admissible action or contract domain.',
 theoremBoundary:'Exact only for the 37 clean deadline-free G3/mu16 rank-20 states in the existing post-block corpus. Both engines use the same exact C4 transitions, live-target/support-distance-one invariant, A/B/D/E/F plus resolved-C action domain, and unchanged 100000 proof-state cap. No live-target-column action, solved WDL, arbitrary frontier search, q equality, or root result.'
})}`);
