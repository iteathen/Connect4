#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createTargetDistanceLexicographicProofEngine } from './quotient-standard7x6-target-distance-lexicographic-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const TARGET=16;
const ROOTS=new Set(['466565554644757776','466565554644757777','466565554644767775']);
const seq=process.env.ROOT_SEQUENCE;
const actionName=process.env.ACTION;
assert(seq&&ROOTS.has(seq),`unsupported root ${seq}`);
assert(/^[A-G]$/.test(actionName??''),`bad action ${actionName}`);
const action=actionName.charCodeAt(0)-65;
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
const kernel=makeKernel();
const state=replay(kernel,seq);
const engine=createTargetDistanceLexicographicProofEngine(kernel,{maxProofStates:100000,rootActions:[action]});
const e=engine.repair;
assert.equal(e.rank(state),18);
assert.equal(e.singleton(state,0,TARGET),true);
assert.equal(e.targetDistance(state,TARGET),2);
let proof,error=null;
try{proof=engine.prove(state,TARGET);}catch(err){error=String(err?.message??err);proof={proved:false,kind:error.includes('reserved quotient state capacity exhausted')?'quotient_capacity':error.includes('proof-state cap exceeded')?'proof_capacity':'execution_error'};}
const stats=engine.stats();
console.log(`C3_TARGET_DISTANCE_ROOT_ACTION_PROBE=${JSON.stringify({
 kind:'standard7x6-c3-target-distance-root-action-probe-v1',sequence:seq,action:actionName,proved:proof.proved,proofKind:proof.kind,witness:proof.witness??null,witnessKind:proof.witnessKind??null,rejected:proof.rejected??[],error,stats,
 theoremBoundary:'One exact rank18 C3 residual root and one top-level structural P0 action are isolated in a fresh kernel. Recursive descendants retain the complete kappa=(distance,delta,mu) action calculus and the combined 100000 proof-state cap. This isolates execution resources only; it does not make action identity semantic state identity, enlarge quotient storage, or turn resource failure into loss.'
})}`);
