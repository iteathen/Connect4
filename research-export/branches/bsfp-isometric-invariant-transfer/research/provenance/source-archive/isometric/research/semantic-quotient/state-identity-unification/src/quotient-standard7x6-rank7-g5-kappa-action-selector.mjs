#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const PROBE = fileURLToPath(new URL('./quotient-standard7x6-rank7-g5-kappa-child-probe.mjs', import.meta.url));
const REPLIES = Object.freeze(['A', 'B', 'D', 'E', 'F', 'G']);
// Prefer the target-support action, then the historically useful resolved/repair alternatives.
const ACTIONS = Object.freeze(['G', 'C', 'A', 'B', 'D', 'E', 'F']);

function runProbe(reply, action) {
  const child = spawnSync(process.execPath, [PROBE], {
    encoding: 'utf-8',
    timeout: 300000,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, REPLY: reply, ACTION: action },
  });
  if (child.error) return { reply, action, kind: 'execution_error', error: child.error.message };
  if (child.status !== 0) return { reply, action, kind: 'process_failure', status: child.status, stderr: (child.stderr ?? '').slice(-4000) };
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('RANK7_G5_KAPPA_CHILD_PROBE='));
  if (!line) return { reply, action, kind: 'missing_output' };
  const result = JSON.parse(line.slice('RANK7_G5_KAPPA_CHILD_PROBE='.length));
  return {
    reply,
    action,
    proved: result.proved === true,
    proofKind: result.proofKind,
    witness: result.witness ?? null,
    witnessKind: result.witnessKind ?? null,
    targetDistance: result.targetDistance,
    measure: result.measure ?? null,
    forcedObligation: result.forcedObligation ?? null,
    error: result.error ?? null,
    rejected: result.rejected ?? [],
    stats: result.stats ?? null,
  };
}

const rows = [];
for (const reply of REPLIES) {
  const attempts = [];
  let selected = null;
  for (const action of ACTIONS) {
    const result = runProbe(reply, action);
    attempts.push(result);
    if (result.proved === true) {
      selected = result;
      break;
    }
  }
  rows.push({ reply, selected, attempts });
}

const provedReplies = rows.filter((x) => x.selected !== null).map((x) => x.reply);
console.log(`RANK7_G5_KAPPA_ACTION_SELECTOR=${JSON.stringify({
  kind: 'standard7x6-rank7-g5-kappa-action-selector-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  startSequence: '466565576643',
  rootWitness: 'G2',
  alreadyQualifiedReply: { reply: 'C', witness: 'G', witnessKind: 'target_support_distance_descent' },
  rows,
  provedReplies,
  allSelected: provedReplies.length === REPLIES.length,
  theoremBoundary: 'Execution selector only. Each attempt launches the exact child proof in a fresh kernel with unchanged proof/quotient limits and a single top-level root action. Recursive descendants retain the complete enabled kappa/rho calculus. A resource or action failure is never interpreted as loss. This selector does not itself promote the parent unless every P1 reply has a proved child certificate.',
})}`);

assert.equal(rows.length, REPLIES.length);
