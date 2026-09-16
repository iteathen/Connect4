#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const PROBE = fileURLToPath(new URL('./quotient-standard7x6-generic-target-distance-sequence-probe.mjs', import.meta.url));
const CASES = Object.freeze([
  { id: 'C_reply_D', sequence: '466565536644', targets: ['G5'], maxDistance: 4 },
  { id: 'D_reply_D', sequence: '466565546644', targets: ['C3', 'G3'], maxDistance: 2 },
]);
const ACTIONS = Object.freeze(['A','B','C','D','E','F','G']);

function run(entry, target, action) {
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
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('GENERIC_TARGET_DISTANCE_SEQUENCE_PROBE='));
  assert(line, 'generic target probe output missing');
  const x = JSON.parse(line.slice('GENERIC_TARGET_DISTANCE_SEQUENCE_PROBE='.length));
  return {
    target, action,
    proved: x.proved === true,
    proofKind: x.proofKind,
    targetLive: x.targetLive,
    targetDistance: x.targetDistance,
    measure: x.measure,
    witness: x.witness,
    witnessKind: x.witnessKind,
    exactLoss: x.exactLoss,
    obligations: x.obligations,
    forcedDefense: x.forcedDefense,
    rejected: x.rejected,
    error: x.error,
    stats: x.stats,
  };
}

const rows = [];
for (const entry of CASES) {
  const attempts = [];
  let selected = null;
  outer: for (const target of entry.targets) {
    const targetColumn = target[0];
    const actionOrder = [targetColumn, ...ACTIONS.filter((a) => a !== targetColumn)];
    for (const action of actionOrder) {
      const result = run(entry, target, action);
      attempts.push(result);
      if (result.proved) { selected = result; break outer; }
    }
  }
  rows.push({ ...entry, selected, attempts });
}

console.log(`RANK7_STUBBORN_LAMBDA_SELECTOR=${JSON.stringify({
  kind: 'standard7x6-rank7-stubborn-lambda-selector-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rows,
  allSelected: rows.every((x) => x.selected !== null),
  theoremBoundary: 'Fallback selector only for the two exact C/D children that remained resource-unknown under the C/G kappa implementation. It uses the separate generic lambda=(target distance,mu) induction, fresh kernel per target/action attempt, unchanged limits, and no resolved-tail delta assumption. Failure/resource exhaustion is never loss.',
})}`);
