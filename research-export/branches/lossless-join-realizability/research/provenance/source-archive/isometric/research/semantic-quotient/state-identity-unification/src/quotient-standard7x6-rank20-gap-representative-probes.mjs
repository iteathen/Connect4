#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const C3=16,G3=20;
const probes=Object.freeze([
  {name:'C3_mu15_all_five_clean',sequence:'46656555464471777113',target:C3,expectedMu:15,expectedDeadlines:0},
  {name:'C3_mu16_all_five_clean',sequence:'46656555464471777237',target:C3,expectedMu:16,expectedDeadlines:0},
  {name:'C3_mu17_all_five_clean',sequence:'46656555464471777377',target:C3,expectedMu:17,expectedDeadlines:0},
  {name:'G3_mu15_four_clean_one_deadline',sequence:'46656555464431333117',target:G3,expectedMu:15,expectedDeadlines:0},
  {name:'G3_mu17_four_clean_one_deadline',sequence:'46656555464431333373',target:G3,expectedMu:17,expectedDeadlines:0},
]);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function errorKind(error){const m=String(error?.message??error);if(m.includes('reserved quotient state capacity exhausted'))return 'state_capacity_exhausted';if(m.includes('proof-state cap exceeded'))return 'proof_state_cap_exceeded';if(m.includes('reserved quotient class capacity exhausted'))return 'class_capacity_exhausted';return 'unexpected_error';}

const rows=[];
for(const p of probes){
  const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:true,maxProofStates:100000});
  const state=replay(k,p.sequence);
  assert.equal(e.rank(state),20,`${p.name}: rank drift`);
  assert(e.invariant(state,p.target),`${p.name}: repair invariant drift`);
  assert.equal(e.mu(state),p.expectedMu,`${p.name}: mu drift`);
  const deadlines=e.enabledSingletons(state,1).map(e.coord);
  assert.equal(deadlines.length,p.expectedDeadlines,`${p.name}: root deadline drift`);
  let result,error=null;
  try { result=e.prove(state,p.target); } catch (err) { error={kind:errorKind(err),message:String(err?.message??err)}; }
  const stats=e.stats();
  rows.push({
    name:p.name,sequence:p.sequence,target:e.coord(p.target),mu:e.mu(state),rootDeadlines:deadlines,
    completed:error===null,proved:result?.proved??false,proofKind:result?.kind??null,witness:result?.witness??null,
    winningActions:(result?.winningActions??[]).map(x=>({column:x.column,kind:x.kind})),
    rejected:result?.rejected??[],error,stats,
  });
}
const completed=rows.filter(x=>x.completed),proved=rows.filter(x=>x.proved),logicalFailures=completed.filter(x=>!x.proved),resourceFailures=rows.filter(x=>!x.completed);
console.log(`RANK20_GAP_REPRESENTATIVE_PROBES=${JSON.stringify({
  kind:'standard7x6-rank20-gap-representative-direct-induction-probes-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  probes:rows,
  totals:{attempted:rows.length,completed:completed.length,proved:proved.length,logicalFailures:logicalFailures.length,resourceFailures:resourceFailures.length},
  interpretation: proved.length===rows.length
    ? 'All selected dominant gap representatives are proved by the existing repair-capacity induction when seeded directly in isolated fresh kernels. Their earlier failure was therefore finite-certificate coverage, not a new local tactical obstruction in these representatives.'
    : logicalFailures.length
      ? 'At least one dominant representative completes under the existing induction logic but is not proved, which is evidence for a genuinely missing theorem premise rather than certificate coverage alone.'
      : 'At least one representative hits the bounded resource wall before a logical result. Preserve that as an experiment-boundary failure; do not infer loss or enlarge storage without a structural theorem.',
  theoremBoundary:'These are representative probes only, selected from dominant obstruction classes. A successful probe proves only its exact representative through the existing decreasing-mu induction. It does not generalize to its whole diagnostic class without a congruence theorem and does not promote the latent root or center opening to W.',
})}`);
