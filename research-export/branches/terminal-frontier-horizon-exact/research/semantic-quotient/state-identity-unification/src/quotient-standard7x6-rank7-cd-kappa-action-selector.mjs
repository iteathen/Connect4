#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const PROBE = fileURLToPath(new URL('./quotient-standard7x6-target-distance-sequence-probe.mjs', import.meta.url));
const CASES = Object.freeze([
  { id: 'C_reply_D', sequence: '466565536644', targets: ['G5'], maxDistance: 4 },
  { id: 'C_reply_G', sequence: '466565536647', targets: ['G5'], maxDistance: 4 },
  { id: 'D_reply_B', sequence: '466565546642', targets: ['C3', 'G3'], maxDistance: 2 },
  { id: 'D_reply_D', sequence: '466565546644', targets: ['C3', 'G3'], maxDistance: 2 },
  { id: 'D_reply_E', sequence: '466565546645', targets: ['C3', 'G3'], maxDistance: 2 },
]);
const ACTIONS_BY_TARGET = Object.freeze({
  G5: ['G', 'C', 'D', 'A', 'B', 'E', 'F'],
  C3: ['C', 'G', 'A', 'B', 'D', 'E', 'F'],
  G3: ['G', 'C', 'A', 'B', 'D', 'E', 'F'],
});

function runProbe(entry, target, action) {
  const child = spawnSync(process.execPath, [PROBE], {
    encoding: 'utf-8', timeout: 300000, maxBuffer: 32 * 1024 * 1024,
    env: {
      ...process.env,
      SEQUENCE: entry.sequence,
      TARGET: target,
      MAX_TARGET_DISTANCE: String(entry.maxDistance),
      ACTION: action,
    },
  });
  if (child.error) return { target, action, proved: false, proofKind: 'execution_error', error: { kind: 'execution_error', message: child.error.message } };
  if (child.status !== 0) return { target, action, proved: false, proofKind: 'process_failure', error: { kind: 'process_failure', message: (child.stderr ?? '').slice(-4000) } };
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('TARGET_DISTANCE_SEQUENCE_PROBE='));
  assert(line, 'target probe output missing');
  const result = JSON.parse(line.slice('TARGET_DISTANCE_SEQUENCE_PROBE='.length));
  return {
    target,
    action,
    proved: result.proved === true,
    proofKind: result.proofKind,
    targetLive: result.targetLive,
    targetDistance: result.targetDistance,
    measure: result.measure,
    witness: result.witness,
    witnessKind: result.witnessKind,
    forcedObligation: result.forcedObligation,
    error: result.error,
    rejected: result.rejected,
    stats: result.stats,
  };
}

const rows = [];
for (const entry of CASES) {
  const attempts = [];
  let selected = null;
  outer: for (const target of entry.targets) {
    for (const action of ACTIONS_BY_TARGET[target]) {
      const result = runProbe(entry, target, action);
      attempts.push(result);
      if (result.proved) { selected = result; break outer; }
    }
  }
  rows.push({ ...entry, selected, attempts });
}

console.log(`RANK7_CD_KAPPA_ACTION_SELECTOR=${JSON.stringify({
  kind: 'standard7x6-rank7-cd-kappa-action-selector-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rows,
  allSelected: rows.every((x) => x.selected !== null),
  theoremBoundary: 'Execution selector for the five exact resource-unknown children from the rank7 C and D handoff candidates. Each target/action attempt runs in a fresh kernel under unchanged limits; one proved target/action witness is sufficient for that exact child. Resource/action failure is not loss and no cross-child symmetry is assumed.',
})}`);
