#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const C3 = 16, G3 = 20;
const MAX_PROOF_STATES = 100000;
const sequence = process.argv[2];
const targetName = process.argv[3];
if (!sequence || !['C3', 'G3'].includes(targetName)) throw new Error('usage: rho-probe <sequence> <C3|G3>');
const target = targetName === 'C3' ? C3 : G3;

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const rho = createResolvedTailLexicographicProofEngine(kernel, { maxProofStates: MAX_PROOF_STATES });

let state = kernel.rootId;
for (const digit of sequence) {
  const next = kernel.advance(state, Number(digit) - 1);
  assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
  state = next;
}
assert.equal(rho.repair.rank(state) & 1, 0, 'rho probe must start on P0 turn');
const proof = rho.prove(state, target);
console.log(`EXPIRED_RESPONSE_RHO_PROBE=${JSON.stringify({
  sequence,
  target: targetName,
  proved: proof.proved,
  kind: proof.kind,
  measure: proof.measure,
  witness: proof.witness ?? null,
  witnessKind: proof.witnessKind ?? null,
  rejected: proof.rejected ?? [],
  stats: rho.stats(),
  proofStateCap: MAX_PROOF_STATES,
  authority: 'Fresh execution-isolated kernel with unchanged storage and rho proof-state bounds; isolation is not semantic identity.',
})}`);
