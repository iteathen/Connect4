#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const C3 = 16, G3 = 20;
const MAX_PROOF_STATES = 100000;
const CHILD_TIMEOUT_MS = 300000;
const PROBE = fileURLToPath(new URL('./quotient-standard7x6-expired-response-rho-probe.mjs', import.meta.url));

const sequence = process.argv[2];
const targetName = process.argv[3];
const actionName = process.argv[4];
if (!sequence || !['C3', 'G3'].includes(targetName) || !/^[A-G]$/.test(actionName ?? '')) {
  throw new Error('usage: rho-action-branch-composition <sequence> <C3|G3> <A-G>');
}
const target = targetName === 'C3' ? C3 : G3;
const action = actionName.charCodeAt(0) - 65;

function lexLess(a, b) {
  return a.delta < b.delta || (a.delta === b.delta && a.mu < b.mu);
}
function lexLe(a, b) {
  return a.delta < b.delta || (a.delta === b.delta && a.mu <= b.mu);
}
function col(c) { return String.fromCharCode(65 + c); }
function coord(cell) { return `${col(cell % 7)}${Math.floor(cell / 7) + 1}`; }
function replay(kernel, seq) {
  let id = kernel.rootId;
  for (const digit of seq) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${seq}`);
    id = next;
  }
  return id;
}
function childRhoProof(childSequence) {
  const child = spawnSync(process.execPath, [PROBE, childSequence, targetName], {
    encoding: 'utf-8',
    timeout: CHILD_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  if (child.status !== 0) {
    return { proved: false, kind: 'probe_process_error', error: (child.stderr ?? '').slice(-8000) };
  }
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('EXPIRED_RESPONSE_RHO_PROBE='));
  if (!line) return { proved: false, kind: 'probe_output_missing', error: (child.stdout ?? '').slice(-8000) };
  return JSON.parse(line.slice('EXPIRED_RESPONSE_RHO_PROBE='.length));
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const rho = createResolvedTailLexicographicProofEngine(kernel, { maxProofStates: 1 });
const e = rho.repair;
const root = replay(kernel, sequence);
assert.equal(e.rank(root) & 1, 0, 'branch-composition root must be P0 turn');
const before = rho.measure(root, target);
assert.equal(e.invariant(root, target), true, 'branch-composition root outside rho invariant');
const actionCell = e.landing(root, action);
assert.notEqual(actionCell, 0xff, 'selected root action is illegal');

const afterP0 = kernel.advance(root, action);
let allClosed = true;
const branches = [];
let afterP0Measure = null;
if (afterP0 === domain.QN_TERMINAL_WIN) {
  branches.push({ route: 'P0_terminal_on_selected_action' });
} else {
  assert(Number.isSafeInteger(afterP0) && afterP0 >= 0);
  assert.equal(e.rank(afterP0), e.rank(root) + 1);
  afterP0Measure = rho.measure(afterP0, target);
  assert(lexLess(afterP0Measure, before), 'selected action did not strictly decrease rho');

  for (const reply of e.legal(afterP0)) {
    const replyCell = e.landing(afterP0, reply);
    const child = kernel.advance(afterP0, reply);
    if (child === domain.QN_TERMINAL_WIN) {
      allClosed = false;
      branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'P1_terminal' });
      continue;
    }
    assert(Number.isSafeInteger(child) && child >= 0);
    assert.equal(e.rank(child), e.rank(root) + 2);
    const childMeasure = rho.measure(child, target);
    assert(lexLe(childMeasure, afterP0Measure), 'P1 reply increased rho');

    const immediateP0 = e.terminalActions(child, 0);
    if (immediateP0.length) {
      branches.push({
        reply: col(reply), replyCell: coord(replyCell), route: 'immediate_P0_terminal',
        terminalCells: immediateP0.map((x) => coord(x.cell)), childMeasure,
      });
      continue;
    }

    if (!e.invariant(child, target)) {
      allClosed = false;
      branches.push({
        reply: col(reply), replyCell: coord(replyCell), route: 'outside_rho_invariant',
        targetLive: e.singleton(child, 0, target),
        targetDistance: e.singleton(child, 0, target) ? e.targetDistance(child, target) : null,
        childMeasure,
      });
      continue;
    }

    const childSequence = sequence + String(action + 1) + String(reply + 1);
    const proof = childRhoProof(childSequence);
    if (!proof.proved) {
      allClosed = false;
      branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'rho_child_unproved', childSequence, childMeasure, proof });
      continue;
    }
    branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'exact_rho_child_certificate', childSequence, childMeasure, proof });
  }
}

console.log(`RHO_ACTION_BRANCH_COMPOSITION=${JSON.stringify({
  kind: 'standard7x6-rho-action-branch-composition-v2',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  sequence,
  target: targetName,
  selectedAction: actionName,
  selectedActionCell: coord(actionCell),
  beforeMeasure: before,
  afterP0Measure,
  branchCount: branches.length,
  branches,
  proved: allClosed,
  certificate: allClosed ? {
    kind: 'alternating_predecessor_from_exact_child_contracts',
    witness: actionName,
    exactRootSequence: sequence,
    exactTarget: targetName,
  } : null,
  executionIsolation: {
    oneFreshKernelPerNonterminalChild: true,
    semanticIdentityImplied: false,
    proofStateCapPerChild: MAX_PROOF_STATES,
    childTimeoutMs: CHILD_TIMEOUT_MS,
    quotientStorage: { states: 262144, classes: 524288, chunksPerSlot: 131072 },
    quotientStorageBoundsChanged: false,
  },
  theoremBoundary: 'Composes exactly one declared P0 action at one exact rho-invariant root. Every legal P1 reply must be terminally closed or carry its own exact obligation-first rho certificate. Child execution sharding is not semantic identity and no result is inferred from resource failure. This is a bounded alternating-predecessor composition, not unrestricted q-frontier search.',
  authority: 'Exact C4-0010 transitions/terminal certificates plus independently execution-isolated rho=(delta,mu) child certificates under unchanged limits. No solved W/D/L label or external oracle premise.',
})}`);
