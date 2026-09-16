#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createTargetDistanceLexicographicProofEngine } from './quotient-standard7x6-target-distance-lexicographic-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const G = 6;
const G5 = 4 * 7 + 6;
const CASES = Object.freeze({
  A: Object.freeze({ sequence: '466565516643', expectedDistance: 4 }),
  B: Object.freeze({ sequence: '466565526643', expectedDistance: 4 }),
  G: Object.freeze({ sequence: '466565576643', expectedDistance: 3 }),
});
const caseName = process.env.CASE;
assert(caseName in CASES, `CASE must be one of ${Object.keys(CASES).join(',')}`);
const selected = CASES[caseName];

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    id = next;
  }
  return id;
}
function classifyError(error) {
  const message = String(error?.message ?? error);
  if (message.includes('reserved quotient state capacity exhausted')) return 'quotient_capacity';
  if (message.includes('target-distance proof-state cap exceeded') || message.includes('lex proof-state cap exceeded')) return 'proof_capacity';
  return 'execution_error';
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const engine = createTargetDistanceLexicographicProofEngine(kernel, {
  maxProofStates: 100000,
  maxTargetDistance: 4,
  rootActions: [G],
});
const e = engine.repair;
const state = replay(kernel, selected.sequence);
assert.equal(e.rank(state), 12, 'post-cross-response rank drift');
assert.equal(e.singleton(state, 0, G5), true, 'latent G5 singleton missing');
assert.equal(e.targetDistance(state, G5), selected.expectedDistance, 'latent G5 distance drift');
assert.equal(e.terminalActions(state, 0).length, 0, 'unexpected immediate P0 terminal before high-distance proof');
assert.equal(e.enabledSingletons(state, 1).length, 0, 'unexpected P1 obligation before high-distance proof');
assert.equal(e.coord(e.landing(state, G)), caseName === 'G' ? 'G2' : 'G1', 'root G support landing drift');

let proof = null;
let error = null;
try {
  proof = engine.prove(state, G5);
} catch (err) {
  error = { kind: classifyError(err), message: String(err?.message ?? err) };
}

const result = {
  kind: 'standard7x6-rank7-post-f5-g5-kappa-probe-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rank7Reply: caseName,
  sequence: selected.sequence,
  target: 'G5',
  initialMeasure: engine.measure(state, G5),
  expectedDistance: selected.expectedDistance,
  rootActionRestriction: 'G',
  proof: proof == null ? null : {
    proved: proof.proved,
    kind: proof.kind,
    measure: proof.measure ?? null,
    witness: proof.witness ?? null,
    witnessKind: proof.witnessKind ?? null,
    forcedObligation: proof.forcedObligation ?? null,
    obligations: proof.obligations ?? null,
    rejected: (proof.rejected ?? []).slice(0, 12),
  },
  error,
  stats: engine.stats(),
  proved: proof?.proved === true,
  theoremBoundary: 'Exact probe only for the selected A/B/G via-D cross-response state and latent P0:G5 singleton. The root is restricted to the G target-support action; recursive descendants retain the full obligation-first target-distance/lexicographic calculus. maxTargetDistance=4 enables only the exact physical distances required here. Proof-state and quotient-storage limits are unchanged; resource failure remains unknown.',
};
console.log(`RANK7_POST_F5_G5_KAPPA_PROBE=${JSON.stringify(result)}`);
if (error?.kind === 'execution_error') process.exitCode = 2;
