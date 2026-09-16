#!/usr/bin/env node
import assert from 'node:assert/strict';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createGenericTargetDistanceMuProofEngine } from './quotient-standard7x6-generic-target-distance-mu-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const sequence = process.env.SEQUENCE;
const targetName = process.env.TARGET;
const actionName = process.env.ACTION ?? null;
const maxTargetDistance = Number(process.env.MAX_TARGET_DISTANCE ?? '5');
assert(sequence, 'SEQUENCE is required');
assert(/^[A-G][1-6]$/.test(targetName ?? ''), 'TARGET must be A1..G6');
if (actionName !== null) assert(/^[A-G]$/.test(actionName), 'ACTION must be A..G');

function replay(kernel, seq) {
  let id = kernel.rootId;
  for (const digit of seq) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${seq}`);
    id = next;
  }
  return id;
}
function targetCell(name) {
  return (Number(name[1]) - 1) * 7 + (name.charCodeAt(0) - 65);
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const state = replay(kernel, sequence);
const rootActions = actionName === null ? null : [actionName.charCodeAt(0) - 65];
const proof = createGenericTargetDistanceMuProofEngine(kernel, {
  maxProofStates: 100000, maxTargetDistance, rootActions,
});
const e = proof.repair;
const target = targetCell(targetName);
let result;
try {
  const out = proof.prove(state, target);
  result = {
    proved: out.proved === true,
    proofKind: out.kind,
    measure: out.measure ?? proof.measure(state, target),
    witness: out.witness ?? null,
    witnessKind: out.witnessKind ?? null,
    exactLoss: out.exactLoss === true,
    obligations: out.obligations ?? [],
    forcedDefense: out.forcedDefense ?? null,
    rejected: out.rejected ?? [],
    error: null,
  };
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const kind = message.includes('reserved quotient state capacity exhausted') ? 'quotient_capacity'
    : message.includes('proof-state cap exceeded') ? 'proof_capacity' : 'execution_error';
  result = {
    proved: false, proofKind: kind, measure: proof.measure(state, target), witness: null, witnessKind: null,
    exactLoss: false, obligations: e.enabledSingletons(state, 1).map(e.coord), forcedDefense: null, rejected: [],
    error: { kind, message },
  };
}

console.log(`GENERIC_TARGET_DISTANCE_SEQUENCE_PROBE=${JSON.stringify({
  kind: 'standard7x6-generic-target-distance-sequence-probe-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  sequence, target: targetName, rootAction: actionName,
  targetLive: e.singleton(state, 0, target),
  targetDistance: e.singleton(state, 0, target) ? e.targetDistance(state, target) : null,
  ...result,
  stats: proof.stats(),
  theoremBoundary: 'Exact single-state probe for the generic lambda=(target distance, mu) induction. Optional ACTION restricts only the proof root. It does not import the C/G resolved-tail delta coordinate. Resource failure remains unknown.',
})}`);
