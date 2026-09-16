#!/usr/bin/env node

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  buildFactoredFixtures,
  factorOqsFixture,
} from '../../../experiments/cuda-bsfp-oqs-cofactor/factored-fixtures.mjs';
import {
  r3,
  semanticKey,
} from '../../../reference/research-prototypes/2026-09-10-oqs/incremental-oqs.mjs';

const WALL_CLOCK_LIMIT_MS = 30_000;
const LOGICAL_CANDIDATE_BUDGET = 12_000;
const TRANSITION_BUDGET = 11;
const REFLECTION_CHILD_LIMIT_MS = 8_000;
const OQS_4X4_CHILD_LIMIT_MS = 8_000;
const OQS_7X6_CHILD_LIMIT_MS = 14_000;

function pairKey(pair) {
  return r3.pairKey(pair);
}

function addSet(map, key, value) {
  let values = map.get(key);
  if (values === undefined) {
    values = new Set();
    map.set(key, values);
  }
  values.add(value);
  return values;
}

function runOqsWorker(spec) {
  const startedAt = Date.now();
  const fixtures = buildFactoredFixtures(spec);
  const expectedTransitions = spec.columns === 4 ? 10 : 1;
  assert.equal(fixtures.length, expectedTransitions, 'unexpected O3 fixture count');

  let logicalCandidates = 0;
  let residualTransformCandidates = 0;
  let reconstructedCandidates = 0;
  let exactPayloadMismatches = 0;
  let transporterMismatches = 0;
  let occurrenceSidecarCollisionClasses = 0;
  let droppedInputCollisionClasses = 0;
  const localIdsAcrossContexts = new Map();
  const fixtureSummaries = [];

  for (let fixtureIndex = 0; fixtureIndex < fixtures.length; fixtureIndex += 1) {
    const fixture = fixtures[fixtureIndex];
    const factored = factorOqsFixture(fixture);
    const inputCount = fixture.inputs.length;
    assert(inputCount > 0, 'O3 fixture has no input assignments');
    assert.equal(
      fixture.candidates.length,
      fixture.states.length * inputCount,
      'O3 logical candidate Cartesian shape changed',
    );

    const payloadBySignature = new Map();
    const concreteXBySignature = new Map();
    const payloadsByResidualWithoutInput = new Map();

    for (let occurrence = 0; occurrence < fixture.states.length; occurrence += 1) {
      const residualId = factored.occurrenceIds[occurrence];
      const residualPair = factored.states[residualId].pair;
      addSet(localIdsAcrossContexts, residualId, pairKey(residualPair));

      for (let inputOrdinal = 0; inputOrdinal < inputCount; inputOrdinal += 1) {
        const candidateIndex = occurrence * inputCount + inputOrdinal;
        const candidate = fixture.candidates[candidateIndex];
        const signature = `${residualId}|${inputOrdinal}`;
        const payload = pairKey(candidate.pair);
        const existing = payloadBySignature.get(signature);
        if (existing === undefined) payloadBySignature.set(signature, candidate.pair);
        else if (pairKey(existing) !== payload) exactPayloadMismatches += 1;

        const transportedX =
          (fixture.states[occurrence].xMask & fixture.nextCrossingMask)
          | (fixture.inputs[inputOrdinal] & fixture.nextCrossingMask);
        if (transportedX !== candidate.xMask) transporterMismatches += 1;

        const canonicalPayload = payloadBySignature.get(signature);
        if (semanticKey(transportedX, canonicalPayload) !== semanticKey(candidate.xMask, candidate.pair)) {
          transporterMismatches += 1;
        }

        addSet(concreteXBySignature, signature, transportedX.toString(16));
        addSet(payloadsByResidualWithoutInput, residualId, payload);
        reconstructedCandidates += 1;
      }
    }

    const expectedResidualCandidates = factored.states.length * inputCount;
    assert.equal(
      payloadBySignature.size,
      expectedResidualCandidates,
      'O3 guarded operation signature did not span residual-pair/input product',
    );

    let fixtureSidecarCollisions = 0;
    for (const values of concreteXBySignature.values()) if (values.size > 1) fixtureSidecarCollisions += 1;
    let fixtureDroppedInputCollisions = 0;
    for (const values of payloadsByResidualWithoutInput.values()) if (values.size > 1) fixtureDroppedInputCollisions += 1;

    occurrenceSidecarCollisionClasses += fixtureSidecarCollisions;
    droppedInputCollisionClasses += fixtureDroppedInputCollisions;
    logicalCandidates += fixture.candidates.length;
    residualTransformCandidates += expectedResidualCandidates;

    fixtureSummaries.push(Object.freeze({
      cut: fixture.cut,
      occurrences: fixture.states.length,
      residualPairs: factored.states.length,
      inputs: inputCount,
      logicalCandidates: fixture.candidates.length,
      residualTransformCandidates: expectedResidualCandidates,
      occurrenceSidecarCollisionClasses: fixtureSidecarCollisions,
      droppedInputCollisionClasses: fixtureDroppedInputCollisions,
    }));
  }

  let contextScopedIdCollisionIds = 0;
  for (const values of localIdsAcrossContexts.values()) if (values.size > 1) contextScopedIdCollisionIds += 1;

  assert.equal(exactPayloadMismatches, 0, 'same guarded O3 operation signature produced different payloads');
  assert.equal(transporterMismatches, 0, 'O3 occurrence transporter failed to reconstruct exact concrete output');
  assert.equal(reconstructedCandidates, logicalCandidates, 'O3 reconstruction did not cover every logical occurrence');
  assert(logicalCandidates <= LOGICAL_CANDIDATE_BUDGET, 'O3 logical candidate budget exceeded');

  return Object.freeze({
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    transitions: fixtures.length,
    logicalCandidates,
    residualTransformCandidates,
    transformElimination: logicalCandidates - residualTransformCandidates,
    transformEliminationRatio: logicalCandidates === 0 ? 0 : 1 - residualTransformCandidates / logicalCandidates,
    exactPayloadMismatches,
    transporterMismatches,
    occurrenceSidecarCollisionClasses,
    droppedInputCollisionClasses,
    contextScopedIdCollisionIds,
    fixtureSummaries,
    wallMs: Date.now() - startedAt,
  });
}

function parseChildJson(child, label) {
  if (child.error) throw child.error;
  assert.equal(child.signal, null, `${label} terminated by ${child.signal}`);
  assert.equal(child.status, 0, `${label} failed:\n${child.stderr}`);
  return JSON.parse(child.stdout.trim());
}

function remainingMs(startedAt) {
  return Math.max(1, WALL_CLOCK_LIMIT_MS - (Date.now() - startedAt));
}

function runChild(args, preferredLimitMs, startedAt, label) {
  const timeout = Math.min(preferredLimitMs, remainingMs(startedAt));
  assert(timeout > 0, `${label} had no wall-clock budget remaining`);
  return parseChildJson(spawnSync(process.execPath, [fileURLToPath(import.meta.url), ...args], {
    encoding: 'utf8',
    timeout,
    maxBuffer: 16 * 1024 * 1024,
  }), label);
}

if (process.argv[2] === '--oqs-worker') {
  const geometry = process.argv[3];
  const spec = geometry === '4x4'
    ? { columns: 4, rows: 4, connect: 4 }
    : geometry === '7x6'
      ? { columns: 7, rows: 6, connect: 4 }
      : null;
  assert(spec, `unknown O3 worker geometry ${geometry}`);
  process.stdout.write(`${JSON.stringify(runOqsWorker(spec))}\n`);
  process.exit(0);
}

const startedAt = Date.now();
const reflectionPath = fileURLToPath(new URL('./qualify-reflection-coverage.mjs', import.meta.url));
const reflectionChild = spawnSync(process.execPath, [reflectionPath], {
  encoding: 'utf8',
  timeout: Math.min(REFLECTION_CHILD_LIMIT_MS, remainingMs(startedAt)),
  maxBuffer: 16 * 1024 * 1024,
});
const reflection = parseChildJson(reflectionChild, 'reflection commuting-transporter authority');
assert.equal(reflection.mismatchTotal, 0, 'reflection authority reported a mismatch');
assert(reflection.counters.capacityCases > 0, 'reflection guard-preservation cases were not exercised');
assert(reflection.counters.cofactorTermCases > 0, 'reflection cofactor commuting cases were not exercised');
assert(
  reflection.standard7x6OrbitCounts.supportOrbits < reflection.standard7x6OrbitCounts.supports,
  'reflection control did not contain nontrivial two-occurrence orbits',
);
assert(
  reflection.standard7x6OrbitCounts.fixedSupports < reflection.standard7x6OrbitCounts.supports,
  'reflection orientation sidecar negative control has no asymmetric supports',
);

const oqs4x4 = runChild(['--oqs-worker', '4x4'], OQS_4X4_CHILD_LIMIT_MS, startedAt, 'O3 4x4 transporter control');
const oqs7x6 = runChild(['--oqs-worker', '7x6'], OQS_7X6_CHILD_LIMIT_MS, startedAt, 'O3 7x6 transporter control');
const oqs = [oqs4x4, oqs7x6];
const transitions = oqs.reduce((sum, item) => sum + item.transitions, 0);
const logicalCandidates = oqs.reduce((sum, item) => sum + item.logicalCandidates, 0);
const residualTransformCandidates = oqs.reduce((sum, item) => sum + item.residualTransformCandidates, 0);
const exactPayloadMismatches = oqs.reduce((sum, item) => sum + item.exactPayloadMismatches, 0);
const transporterMismatches = oqs.reduce((sum, item) => sum + item.transporterMismatches, 0);
const occurrenceSidecarCollisionClasses = oqs.reduce((sum, item) => sum + item.occurrenceSidecarCollisionClasses, 0);
const droppedInputCollisionClasses = oqs.reduce((sum, item) => sum + item.droppedInputCollisionClasses, 0);
const contextScopedIdCollisionIds = oqs.reduce((sum, item) => sum + item.contextScopedIdCollisionIds, 0);

assert.equal(transitions, TRANSITION_BUDGET, 'O3 transition fixture set changed');
assert(logicalCandidates <= LOGICAL_CANDIDATE_BUDGET, 'combined O3 logical candidate budget exceeded');
assert.equal(exactPayloadMismatches, 0, 'guarded O3 signature was not functionally exact');
assert.equal(transporterMismatches, 0, 'O3 transporter did not commute with the declared transform');
assert(occurrenceSidecarCollisionClasses > 0, 'negative control failed: occurrence sidecar was not observed to be load-bearing');
assert(droppedInputCollisionClasses > 0, 'negative control failed: input ordinal/context was not observed to be load-bearing');
assert(contextScopedIdCollisionIds > 0, 'negative control failed: fixture-local residual IDs did not demonstrate context scoping');
assert(Date.now() - startedAt <= WALL_CLOCK_LIMIT_MS, 'guarded transporter synthesis wall-clock leash exceeded');

const output = Object.freeze({
  schemaVersion: 1,
  kind: 'connect4-bsfp-guarded-commuting-transporter-synthesis',
  attribution: 'Josh Oshiro',
  candidateLaw: 'reuse one representative computation only when exact operation identity, explicit transport, and guard/context preservation make the operation commute; retain occurrence sidecars whenever concrete output is occurrence-sensitive',
  outcome: 'qualified-on-reflection-and-o3-controls',
  reflection: Object.freeze({
    mismatchTotal: reflection.mismatchTotal,
    supportsChecked: reflection.counters.supports,
    edgesChecked: reflection.counters.edges,
    posetComparisons: reflection.counters.posetComparisons,
    capacityCases: reflection.counters.capacityCases,
    cofactorTermCases: reflection.counters.cofactorTermCases,
    standard7x6Supports: reflection.standard7x6OrbitCounts.supports,
    standard7x6SupportOrbits: reflection.standard7x6OrbitCounts.supportOrbits,
    orientationSidecarRequiredByAsymmetricOrbitCount:
      reflection.standard7x6OrbitCounts.supports - reflection.standard7x6OrbitCounts.fixedSupports,
  }),
  oqs: Object.freeze({
    controls: oqs,
    transitions,
    logicalCandidates,
    residualTransformCandidates,
    transformElimination: logicalCandidates - residualTransformCandidates,
    transformEliminationRatio: logicalCandidates === 0 ? 0 : 1 - residualTransformCandidates / logicalCandidates,
    exactPayloadMismatches,
    transporterMismatches,
    negativeControls: Object.freeze({
      occurrenceSidecarCollisionClasses,
      droppedInputCollisionClasses,
      contextScopedIdCollisionIds,
    }),
  }),
  preservationStrength: Object.freeze({
    reflection: 'geometric structural+transition automorphism with guard equivariance',
    oqs: 'operation-specific semantic transform identity with occurrence lift',
    isometric: 'structural signature alone remains candidate discovery only; transition/proof reuse still requires stronger guarded identity',
  }),
  leashes: Object.freeze({
    wallClockMs: WALL_CLOCK_LIMIT_MS,
    transitions: TRANSITION_BUDGET,
    logicalCandidates: LOGICAL_CANDIDATE_BUDGET,
  }),
  wallMs: Date.now() - startedAt,
});

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
