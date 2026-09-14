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
const C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const BRANCH_COMPOSER = fileURLToPath(new URL('./quotient-standard7x6-rho-action-branch-composition.mjs', import.meta.url));
const REFUSAL_COLUMNS = Object.freeze({ A: 0, B: 1, D: 3, E: 4, F: 5 });
const OFFSYSTEM = new Set(Object.values(REFUSAL_COLUMNS));
const refusalName = process.argv[2];
if (!(refusalName in REFUSAL_COLUMNS)) throw new Error('usage: expired-response-refusal-closure <A|B|D|E|F>');
const refusalCol = REFUSAL_COLUMNS[refusalName];

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

const activatedSequence = ROOT + '3'; // P0:C1, creating P1:G1 response deadline on next P1 turn.
const activated = replay(kernel, activatedSequence);
assert.equal(e.rank(activated), 13);
assert.equal(e.landing(activated, G), G, 'G1 not directly playable at response activation');
const refusalCell = e.landing(activated, refusalCol);
assert.notEqual(refusalCell, 0xff, `${refusalName}: refusal event illegal`);
const refusal = kernel.advance(activated, refusalCol);
assert.notEqual(refusal, domain.QN_TERMINAL_WIN, `${refusalName}: refusal event is P1 terminal`);
assert(Number.isSafeInteger(refusal) && refusal >= 0);
assert.equal(e.rank(refusal), 14);
const refusalSequence = activatedSequence + String(refusalCol + 1);
assert.equal(e.landing(refusal, G), G, `${refusalName}: G1 ceased to be directly playable`);
assert.equal(e.singleton(refusal, 0, C3), true);
assert.equal(e.singleton(refusal, 0, G3), true);
assert.equal(e.targetDistance(refusal, C3), 1);
assert.equal(e.targetDistance(refusal, G3), 2);
assert.equal(e.terminalActions(refusal, 0).length, 0, `${refusalName}: immediate P0 terminal changes refusal class`);

const afterG1 = kernel.advance(refusal, G);
assert.notEqual(afterG1, domain.QN_TERMINAL_WIN);
assert(afterG1 >= 0 && e.rank(afterG1) === 15);
assert.equal(e.singleton(afterG1, 0, C3), true);
assert.equal(e.singleton(afterG1, 0, G3), true);
assert.equal(e.targetDistance(afterG1, C3), 1);
assert.equal(e.targetDistance(afterG1, G3), 1);

const topBranches = [];
let allClosed = true;
for (const reply of e.legal(afterG1)) {
  const replyCell = e.landing(afterG1, reply);
  const child = kernel.advance(afterG1, reply);
  if (child === domain.QN_TERMINAL_WIN) {
    allClosed = false;
    topBranches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'P1_terminal_after_G1' });
    continue;
  }
  assert(child >= 0 && e.rank(child) === 16);
  const childSequence = refusalSequence + '7' + String(reply + 1);
  const immediate = e.terminalActions(child, 0);
  if (immediate.length) {
    topBranches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'immediate_P0_terminal', terminalCells: immediate.map((x) => coord(x.cell)) });
    continue;
  }
  if (!OFFSYSTEM.has(reply)) {
    allClosed = false;
    topBranches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'nonterminal_non_offsystem_unclassified' });
    continue;
  }
  assert.equal(e.singleton(child, 0, C3), true, `${refusalName}/${col(reply)}: C3 died before dual-target handoff`);
  assert.equal(e.singleton(child, 0, G3), true, `${refusalName}/${col(reply)}: G3 died before dual-target handoff`);
  assert.equal(e.targetDistance(child, C3), 1);
  assert.equal(e.targetDistance(child, G3), 1);

  const g2Cell = e.landing(child, G);
  assert.equal(coord(g2Cell), 'G2', `${refusalName}/${col(reply)}: G2 not directly playable`);
  const afterG2 = kernel.advance(child, G);
  if (afterG2 === domain.QN_TERMINAL_WIN) {
    topBranches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'P0_terminal_on_G2' });
    continue;
  }
  assert(afterG2 >= 0 && e.rank(afterG2) === 17);
  assert.equal(coord(e.landing(afterG2, G)), 'G3');

  const forceReplies = [];
  let forcedBlockClosed = true;
  let blockedLeafSequence = null;
  for (const response of e.legal(afterG2)) {
    const responseCell = e.landing(afterG2, response);
    const afterP1 = kernel.advance(afterG2, response);
    if (afterP1 === domain.QN_TERMINAL_WIN) {
      forcedBlockClosed = false;
      forceReplies.push({ response: col(response), responseCell: coord(responseCell), route: 'P1_terminal_override' });
      continue;
    }
    assert(afterP1 >= 0 && e.rank(afterP1) === 18);
    if (responseCell !== G3) {
      const terminal = e.terminalActions(afterP1, 0).find((x) => x.cell === G3);
      if (!terminal) {
        forcedBlockClosed = false;
        forceReplies.push({ response: col(response), responseCell: coord(responseCell), route: 'nonblock_without_G3_terminal' });
      } else {
        forceReplies.push({ response: col(response), responseCell: coord(responseCell), route: 'nonblock_exposes_P0_G3_terminal' });
      }
      continue;
    }
    assert.equal(e.singleton(afterP1, 0, G3), false);
    assert.equal(e.singleton(afterP1, 0, C3), true);
    assert.equal(e.targetDistance(afterP1, C3), 1);
    blockedLeafSequence = childSequence + '77';
    forceReplies.push({ response: 'G', responseCell: 'G3', route: 'forced_G3_block_to_C3_rho_leaf', leafSequence: blockedLeafSequence });
  }

  if (!forcedBlockClosed || blockedLeafSequence === null) {
    allClosed = false;
    topBranches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'G3_forced_block_macro_unclosed', forceReplies });
    continue;
  }
  const leafProof = runBranchComposition(blockedLeafSequence);
  if (!leafProof.proved) {
    allClosed = false;
    topBranches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'branch_composed_rho_leaf_unproved', forceReplies, blockedLeafSequence, leafProof });
    continue;
  }
  topBranches.push({
    reply: col(reply), replyCell: coord(replyCell), route: 'G2_forced_G3_block_to_branch_composed_rho',
    forceReplies, blockedLeafSequence,
    leafCertificate: {
      selectedAction: leafProof.selectedAction,
      beforeMeasure: leafProof.beforeMeasure,
      afterP0Measure: leafProof.afterP0Measure,
      branchCount: leafProof.branchCount,
      certificate: leafProof.certificate,
    },
  });
}

const result = {
  kind: 'standard7x6-expired-response-offsystem-refusal-closure-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  refusalColumn: refusalName,
  refusalCell: coord(refusalCell),
  refusalSequence,
  expiredObligation: 'P0:C1 -> P1:G1 by next_P1_turn',
  obligationDisposition: 'expired_unsatisfied; never reset',
  P0Witness: 'G1',
  branchCount: topBranches.length,
  branches: topBranches,
  proved: allClosed,
  promotedConsequence: allClosed ? `${refusalSequence} in W via P0:G1` : null,
  theoremBoundary: allClosed
    ? `Exact only for ${refusalName}-column offsystem refusal after P0:C1 at 466565554644. It proves that exact refusal state is a P0-winning predecessor through G1 seizure, forced G3 block, and branch-composed rho child contracts. No column-renaming symmetry is assumed.`
    : `Exact only for ${refusalName}-column offsystem refusal after P0:C1. Unclosed alternatives remain unknown; no resource failure is interpreted as loss.`,
  authority: 'Exact C4-0010 transitions/terminal certificates plus independently qualified rho=(delta,mu) branch-composition certificates under unchanged bounds. No solved W/D/L labels, external oracle premise, or unrestricted q-frontier recursion.',
};
console.log(`EXPIRED_RESPONSE_REFUSAL_CLOSURE=${JSON.stringify(result)}`);
assert.equal(allClosed, true, `${refusalName}: offsystem refusal closure theorem failed`);
