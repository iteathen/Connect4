#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createTargetDistanceLexicographicProofEngine } from './quotient-standard7x6-target-distance-lexicographic-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const C3=16,G3=20;
const ROOTS=Object.freeze([
 ...[
  '466565554644323332','466565554644353336','466565554644363335','466565554644343335',
  '466565554644353334','466565554644353333','466565554644343333','466565554644323336',
  '466565554644363332','466565554644323335','466565554644353332','466565554644323334',
  '466565554644343332','466565554644323333','466565554644313334','466565554644343331',
  '466565554644313333',
 ].map(sequence=>({sequence,target:G3,targetName:'G3'})),
 ...[
  '466565554644757774','466565554644757776','466565554644757777',
  '466565554644747775','466565554644767775',
 ].map(sequence=>({sequence,target:C3,targetName:'C3'})),
]);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
const filter=process.env.FILTER_TARGET??null;
const selected=filter?ROOTS.filter(x=>x.targetName===filter):ROOTS;
assert(selected.length>0,'empty target-distance residual selection');
const rows=[];
for(const item of selected){
 const kernel=makeKernel();
 const state=replay(kernel,item.sequence);
 const engine=createTargetDistanceLexicographicProofEngine(kernel,{maxProofStates:100000});
 const e=engine.repair;
 assert.equal(e.rank(state),18,`${item.sequence}: rank drift`);
 assert.equal(e.singleton(state,0,item.target),true,`${item.sequence}: target no longer live`);
 assert.equal(e.targetDistance(state,item.target),2,`${item.sequence}: expected distance2 residual root`);
 let proof,error=null;
 try{proof=engine.prove(state,item.target);}catch(err){error=String(err?.message??err);proof={proved:false,kind:error.includes('cap exceeded')?'resource_cap':'execution_error'};}
 const stats=engine.stats();
 if(item.sequence==='466565554644323332'){
  assert.equal(proof.proved,false,'known exact local-loss root was incorrectly proved');
  assert.equal(proof.kind,'multi_obligation_capacity_defect','known local-loss mechanism drift');
 }
 rows.push({sequence:item.sequence,target:item.targetName,proved:proof.proved,kind:proof.kind,witness:proof.witness??null,witnessKind:proof.witnessKind??null,measure:proof.measure??null,rejected:(proof.rejected??[]).slice(0,8),error,stats});
}
const proved=rows.filter(x=>x.proved).length,failed=rows.length-proved,resource=rows.filter(x=>x.kind==='resource_cap').length,execution=rows.filter(x=>x.kind==='execution_error').length;
console.log(`TARGET_DISTANCE_RESIDUAL_PROBE=${JSON.stringify({
 kind:'standard7x6-target-distance-residual-probe-v1',filterTarget:filter,roots:rows.length,proved,failed,resourceFailures:resource,executionFailures:execution,rows,
 theoremBoundary:'Each root is proved in an isolated kernel under a combined 100000 proof-state cap. Distance2 recursion is restricted to a live C3/G3 singleton with kappa=(target support distance,resolved-tail deficit,repair mu). Every selected P0 action strictly decreases kappa; every exact P1 reply is required not to increase it. Distance1 leaves delegate to the already-qualified rho=(delta,mu) induction. Multi-obligation response-capacity defects are exact loss certificates, not unknown-as-loss. No solved WDL premise, q/frontier expansion, cap increase, center-opening claim, or root solve.'
})}`);
