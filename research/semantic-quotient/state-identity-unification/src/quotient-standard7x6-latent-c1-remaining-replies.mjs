#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6;
const C3 = 16, G3 = 20;
const BRANCH_COMPOSER = fileURLToPath(new URL('./quotient-standard7x6-rho-action-branch-composition.mjs', import.meta.url));

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    id = next;
  }
  return id;
}
function col(c) { return String.fromCharCode(65 + c); }
function coord(cell) { return `${col(cell % 7)}${Math.floor(cell / 7) + 1}`; }
function runBranchComposition(sequence) {
  const child = spawnSync(process.execPath, [BRANCH_COMPOSER, sequence, 'C3', 'G'], {
    encoding: 'utf-8', timeout: 270000, maxBuffer: 32 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  if (child.status !== 0) return { proved: false, kind: 'branch_composer_process_error', error: (child.stderr ?? '').slice(-8000) };
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('RHO_ACTION_BRANCH_COMPOSITION='));
  if (!line) return { proved: false, kind: 'branch_composer_output_missing', error: (child.stdout ?? '').slice(-8000) };
  return JSON.parse(line.slice('RHO_ACTION_BRANCH_COMPOSITION='.length));
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });
const root = replay(kernel, ROOT);
assert.equal(e.rank(root), 12);
assert.equal(e.singleton(root, 0, C3), true);
assert.equal(e.singleton(root, 0, G3), true);

const afterC1 = kernel.advance(root, C);
assert.notEqual(afterC1, domain.QN_TERMINAL_WIN);
assert(afterC1 >= 0 && e.rank(afterC1) === 13);
assert.equal(coord(e.landing(afterC1, C)), 'C2');
assert.equal(coord(e.landing(afterC1, G)), 'G1');

// P1:C2 is a refusal of the G1 response obligation but also physically exposes C3.
const afterC2 = kernel.advance(afterC1, C);
assert.notEqual(afterC2, domain.QN_TERMINAL_WIN, 'P1:C2 unexpectedly terminal');
assert(afterC2 >= 0 && e.rank(afterC2) === 14);
const c2Terminals = e.terminalActions(afterC2, 0);
const c3Terminal = c2Terminals.find((x) => x.cell === C3) ?? null;
assert(c3Terminal, 'P1:C2 did not expose immediate P0:C3 terminal');

// P1:G1 is the on-contract response. P0:G2 makes G3 directly playable.
const afterG1 = kernel.advance(afterC1, G);
assert.notEqual(afterG1, domain.QN_TERMINAL_WIN, 'P1:G1 unexpectedly terminal');
assert(afterG1 >= 0 && e.rank(afterG1) === 14);
assert.equal(e.singleton(afterG1, 0, C3), true);
assert.equal(e.singleton(afterG1, 0, G3), true);
assert.equal(e.targetDistance(afterG1, C3), 1);
assert.equal(e.targetDistance(afterG1, G3), 1);
assert.equal(coord(e.landing(afterG1, G)), 'G2');

const afterG2 = kernel.advance(afterG1, G);
assert.notEqual(afterG2, domain.QN_TERMINAL_WIN, 'P0:G2 unexpectedly terminal');
assert(afterG2 >= 0 && e.rank(afterG2) === 15);
assert.equal(coord(e.landing(afterG2, G)), 'G3');

const responses = [];
let onContractClosed = true;
let blockedLeafSequence = null;
let blockedLeafProof = null;
for (const response of e.legal(afterG2)) {
  const responseCell = e.landing(afterG2, response);
  const afterP1 = kernel.advance(afterG2, response);
  if (afterP1 === domain.QN_TERMINAL_WIN) {
    onContractClosed = false;
    responses.push({ response: col(response), responseCell: coord(responseCell), route: 'P1_terminal_override' });
    continue;
  }
  assert(afterP1 >= 0 && e.rank(afterP1) === 16);
  if (responseCell !== G3) {
    const p0Terminal = e.terminalActions(afterP1, 0).find((x) => x.cell === G3);
    if (!p0Terminal) {
      onContractClosed = false;
      responses.push({ response: col(response), responseCell: coord(responseCell), route: 'nonblock_without_G3_terminal' });
    } else {
      responses.push({ response: col(response), responseCell: coord(responseCell), route: 'nonblock_exposes_P0_G3_terminal' });
    }
    continue;
  }
  assert.equal(e.singleton(afterP1, 0, G3), false);
  assert.equal(e.singleton(afterP1, 0, C3), true);
  assert.equal(e.targetDistance(afterP1, C3), 1);
  blockedLeafSequence = ROOT + '3777';
  blockedLeafProof = runBranchComposition(blockedLeafSequence);
  if (!blockedLeafProof.proved) {
    onContractClosed = false;
    responses.push({ response: 'G', responseCell: 'G3', route: 'branch_composed_rho_leaf_unproved', leafSequence: blockedLeafSequence, leafProof: blockedLeafProof });
  } else {
    responses.push({
      response: 'G', responseCell: 'G3', route: 'forced_G3_block_to_branch_composed_rho', leafSequence: blockedLeafSequence,
      leafCertificate: {
        selectedAction: blockedLeafProof.selectedAction,
        beforeMeasure: blockedLeafProof.beforeMeasure,
        afterP0Measure: blockedLeafProof.afterP0Measure,
        branchCount: blockedLeafProof.branchCount,
        certificate: blockedLeafProof.certificate,
      },
    });
  }
}

const result = {
  kind: 'standard7x6-latent-c1-target-column-replies-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rootSequence: ROOT,
  P0Candidate: 'C1',
  P1C2: {
    sequence: ROOT + '33',
    closed: true,
    route: 'immediate_P0_C3_terminal',
    terminalCell: 'C3',
  },
  P1G1: {
    sequence: ROOT + '37',
    responseObligationSatisfied: true,
    P0Witness: 'G2',
    responses,
    blockedLeafSequence,
    blockedLeafProof: blockedLeafProof ? {
      proved: blockedLeafProof.proved,
      selectedAction: blockedLeafProof.selectedAction,
      beforeMeasure: blockedLeafProof.beforeMeasure,
      afterP0Measure: blockedLeafProof.afterP0Measure,
      certificate: blockedLeafProof.certificate,
    } : null,
    closed: onContractClosed,
  },
  proved: Boolean(c3Terminal) && onContractClosed,
  theoremBoundary: 'Exact only for P1:C2 and P1:G1 after P0:C1 at the fixed latent root. Offsystem A/B/D/E/F replies are intentionally excluded and require their own exact refusal contracts. No symmetry or solved-value premise is used.',
  authority: 'Exact C4-0010 transitions/terminal certificates plus branch-composed rho=(delta,mu) at the exact P1:G3 block leaf under unchanged limits.',
};
console.log(`LATENT_C1_REMAINING_REPLIES=${JSON.stringify(result)}`);
assert.equal(result.proved, true, 'C1 target-column reply closure failed');
