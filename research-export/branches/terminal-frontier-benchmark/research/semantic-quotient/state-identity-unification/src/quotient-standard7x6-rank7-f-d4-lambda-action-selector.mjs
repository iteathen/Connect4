#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const PROBE = fileURLToPath(new URL('./quotient-standard7x6-generic-target-distance-sequence-probe.mjs', import.meta.url));
const REPLIES = Object.freeze(['A','B','C','D','E','F','G']);
const ACTIONS = Object.freeze(['D','A','B','E','F']);

function run(reply, action) {
  const sequence = `466565567${reply.charCodeAt(0) - 64}`;
  const child = spawnSync(process.execPath, [PROBE], {
    encoding: 'utf-8', timeout: 300000, maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, SEQUENCE: sequence, TARGET: 'D4', MAX_TARGET_DISTANCE: '2', ACTION: action },
  });
  if (child.error) return { reply, sequence, action, proved: false, proofKind: 'execution_error', error: { kind: 'execution_error', message: child.error.message } };
  if (child.status !== 0) return { reply, sequence, action, proved: false, proofKind: 'process_failure', error: { kind: 'process_failure', message: (child.stderr ?? '').slice(-4000) } };
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('GENERIC_TARGET_DISTANCE_SEQUENCE_PROBE='));
  assert(line, 'generic target probe output missing');
  const x = JSON.parse(line.slice('GENERIC_TARGET_DISTANCE_SEQUENCE_PROBE='.length));
  return {
    reply, sequence, action,
    proved: x.proved === true,
    proofKind: x.proofKind,
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
for (const reply of REPLIES) {
  const attempts = [];
  let selected = null;
  for (const action of ACTIONS) {
    const result = run(reply, action);
    attempts.push(result);
    if (result.proved) { selected = result; break; }
  }
  rows.push({ reply, selected, attempts });
}

console.log(`RANK7_F_D4_LAMBDA_ACTION_SELECTOR=${JSON.stringify({
  kind: 'standard7x6-rank7-f-d4-lambda-action-selector-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  parentChild: '46656556',
  supportWitness: 'G1',
  target: 'D4',
  rows,
  allSelected: rows.every((x) => x.selected !== null),
  theoremBoundary: 'Execution selector for the seven exact children after 46656556 -- P0:G1. Each root action is tried in a fresh kernel under the generic lambda=(distance,mu) theorem with unchanged limits. One proved root action closes that exact child. Failure/resource exhaustion is never loss.',
})}`);
