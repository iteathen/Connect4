#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const ROOT = '466565554644';
const TARGET_COLUMN_CONTROL = fileURLToPath(new URL('./quotient-standard7x6-latent-c1-remaining-replies.mjs', import.meta.url));
const REFUSAL_CONTROL = fileURLToPath(new URL('./quotient-standard7x6-expired-response-refusal-closure.mjs', import.meta.url));
const REFUSALS = Object.freeze({ A: '1', B: '2', D: '4', E: '5', F: '6' });
const CHILD_TIMEOUT_MS = 300000;

function run(script, args, prefix) {
  const child = spawnSync(process.execPath, [script, ...args], {
    encoding: 'utf-8',
    timeout: CHILD_TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  assert.equal(child.status, 0, `${prefix}: child process failed: ${(child.stderr ?? '').slice(-12000)}`);
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith(prefix));
  assert(line, `${prefix}: output missing: ${(child.stdout ?? '').slice(-12000)}`);
  return JSON.parse(line.slice(prefix.length));
}

const targetColumns = run(TARGET_COLUMN_CONTROL, [], 'LATENT_C1_REMAINING_REPLIES=');
assert.equal(targetColumns.rootSequence, ROOT);
assert.equal(targetColumns.P0Candidate, 'C1');
assert.equal(targetColumns.P1C2?.closed, true);
assert.equal(targetColumns.P1G1?.closed, true);
assert.equal(targetColumns.proved, true);

const refusalResults = [];
for (const [name, digit] of Object.entries(REFUSALS)) {
  const result = run(REFUSAL_CONTROL, [name], 'EXPIRED_RESPONSE_REFUSAL_CLOSURE=');
  assert.equal(result.refusalColumn, name);
  assert.equal(result.refusalSequence, ROOT + '3' + digit);
  assert.equal(result.obligationDisposition, 'expired_unsatisfied; never reset');
  assert.equal(typeof result.P0Witness, 'string', `${name}: refusal witness missing`);
  assert(result.P0Witness.length > 0, `${name}: refusal witness empty`);
  assert.equal(result.proved, true, `${name}: refusal theorem not proved`);
  refusalResults.push({
    reply: name,
    sequence: result.refusalSequence,
    witness: result.P0Witness,
    witnessRoute: result.witnessRoute ?? null,
    branchCount: result.branchCount ?? result.branches?.length ?? null,
    proved: result.proved,
  });
}

const coveredReplies = Object.freeze(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
const result = {
  kind: 'standard7x6-latent-c1-full-closure-v2',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rootSequence: ROOT,
  sideToMove: 'P0',
  witness: 'C1',
  coveredP1Replies: coveredReplies,
  targetColumnReplies: {
    C: { sequence: targetColumns.P1C2.sequence, route: targetColumns.P1C2.route, proved: targetColumns.P1C2.closed },
    G: { sequence: targetColumns.P1G1.sequence, route: 'on_contract_G1_then_G2_forced_block_branch_composed_rho', proved: targetColumns.P1G1.closed },
  },
  offsystemRefusals: refusalResults,
  proved: true,
  promotedConsequence: `${ROOT} has a qualified structural P0-winning predecessor certificate via P0:C1`,
  qualificationTimeoutMs: CHILD_TIMEOUT_MS,
  theoremBoundary: 'Exact only for the fixed latent state 466565554644. It composes the independently qualified C2/G1 target-column replies with independently qualified, potentially different A/B/D/E/F refusal witnesses. It does not prove the earlier D3 hinge predecessor, the center opening, the empty-board root, q equality, symmetry between refusal columns, or any solved-table W/D/L fact.',
  authority: 'Exact C4-0010 transitions and terminal facts plus the qualified obligation-first rho=(delta,mu) certificates. C4-0006/C4-0007 remain candidate structural/proof specifications; this is a qualified research theorem inside that calculus, not a silent acceptance-status change.',
};

console.log(`LATENT_C1_FULL_CLOSURE=${JSON.stringify(result)}`);
