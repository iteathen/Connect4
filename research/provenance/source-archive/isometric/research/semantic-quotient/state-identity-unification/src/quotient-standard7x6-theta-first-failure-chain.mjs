#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const PROBE = fileURLToPath(new URL('./quotient-standard7x6-theta-sequence-probe.mjs', import.meta.url));
const start = process.env.SEQUENCE ?? '466565536644747533';
const target = process.env.TARGET ?? 'G5';
const maxDistance = process.env.MAX_TARGET_DISTANCE ?? '4';
const maxSteps = Number(process.env.MAX_STEPS ?? '24');
assert(Number.isInteger(maxSteps) && maxSteps >= 1 && maxSteps <= 64, 'invalid MAX_STEPS');

function digit(column) {
  return String(column.charCodeAt(0) - 64);
}
function probe(sequence) {
  const env = { ...process.env, SEQUENCE: sequence, TARGET: target, MAX_TARGET_DISTANCE: maxDistance };
  delete env.ACTION;
  const child = spawnSync(process.execPath, [PROBE], {
    encoding: 'utf-8', timeout: 300000, maxBuffer: 32 * 1024 * 1024, env,
  });
  if (child.error) return { sequence, proved: false, proofKind: 'execution_error', error: { kind: 'execution_error', message: child.error.message } };
  if (child.status !== 0) return { sequence, proved: false, proofKind: 'process_failure', error: { kind: 'process_failure', message: (child.stderr ?? '').slice(-4000) } };
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('THETA_SEQUENCE_PROBE='));
  assert(line, `theta output missing for ${sequence}`);
  return JSON.parse(line.slice('THETA_SEQUENCE_PROBE='.length));
}

const chain = [];
let sequence = start;
let stop = null;
for (let step = 0; step < maxSteps; step += 1) {
  const result = probe(sequence);
  const row = {
    step,
    sequence,
    proved: result.proved === true,
    proofKind: result.proofKind,
    measure: result.measure ?? null,
    exactLoss: result.exactLoss === true,
    obligations: result.obligations ?? [],
    forcedDefense: result.forcedDefense ?? null,
    witness: result.witness ?? null,
    witnessKind: result.witnessKind ?? null,
    error: result.error ?? null,
    firstRejected: (result.rejected ?? [])[0] ?? null,
  };
  chain.push(row);

  if (row.proved) { stop = { kind: 'proved', step, sequence }; break; }
  if (row.exactLoss) { stop = { kind: 'exact_loss', step, sequence, obligations: row.obligations }; break; }
  if (row.error) { stop = { kind: 'resource_or_execution', step, sequence, error: row.error }; break; }
  if (!row.firstRejected) { stop = { kind: 'no_rejected_witness', step, sequence, proofKind: row.proofKind }; break; }

  const action = row.firstRejected.action;
  const reply = row.firstRejected.reply;
  if (!/^[A-G]$/.test(action ?? '') || !/^[A-G]$/.test(reply ?? '')) {
    stop = { kind: 'non_transition_rejection', step, sequence, rejection: row.firstRejected };
    break;
  }
  const next = sequence + digit(action) + digit(reply);
  const nextMeasure = row.firstRejected.childMeasure ?? null;
  chain[chain.length - 1].nextSequence = next;
  chain[chain.length - 1].nextMeasure = nextMeasure;
  chain[chain.length - 1].adversarialEdge = { action, reply, reason: row.firstRejected.reason };
  sequence = next;
}
if (stop === null) stop = { kind: 'step_cap', step: maxSteps, sequence };

console.log(`THETA_FIRST_FAILURE_CHAIN=${JSON.stringify({
  kind: 'standard7x6-theta-first-failure-chain-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  start,
  target,
  maxDistance: Number(maxDistance),
  chain,
  stop,
  theoremBoundary: 'Diagnostic chain only. At each exact P0 state, re-executes the current theta theorem in a fresh kernel and follows only its first rejected action/reply witness. A step is followed only when both action and adversarial reply are explicit. Exact loss, successful proof, target/basis rejection, and resource failure remain distinct stop kinds.',
})}`);
