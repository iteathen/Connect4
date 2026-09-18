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
const REFUSAL_COLUMNS = Object.freeze({ A: 0, B: 1, D: 3, E: 4, F: 5 });
const OFFSYSTEM = new Set(Object.values(REFUSAL_COLUMNS));
const refusalName = process.argv[2];
if (!(refusalName in REFUSAL_COLUMNS)) throw new Error('usage: expired-response-dual-choice-closure <A|B|D|E|F>');
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
function targetName(target) { return target === C3 ? 'C3' : 'G3'; }
function runBranchComposition(sequence, target, actionCol) {
  const child = spawnSync(process.execPath, [BRANCH_COMPOSER, sequence, targetName(target), col(actionCol)], {
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

function forceTargetThenResolvedTail(state, stateSequence, attackCol, attackTarget, otherTarget) {
  assert.equal(e.rank(state) & 1, 0, 'target-choice root must be P0 turn');
  assert.equal(e.singleton(state, 0, attackTarget), true);
  assert.equal(e.singleton(state, 0, otherTarget), true);
  assert.equal(e.targetDistance(state, attackTarget), 1);
  assert.equal(e.targetDistance(state, otherTarget), 1);
  const supportCell = e.landing(state, attackCol);
  assert.equal(supportCell, attackTarget - 7, `${targetName(attackTarget)} support not directly playable`);

  const afterSupport = kernel.advance(state, attackCol);
  if (afterSupport === domain.QN_TERMINAL_WIN) {
    return { closed: true, attackTarget: targetName(attackTarget), supportEvent: coord(supportCell), route: 'P0_terminal_on_support', responses: [] };
  }
  assert(afterSupport >= 0 && e.rank(afterSupport) === e.rank(state) + 1);
  assert.equal(e.landing(afterSupport, attackCol), attackTarget, 'attack target did not become directly playable');

  let closed = true;
  let blockedLeaf = null;
  const responses = [];
  for (const response of e.legal(afterSupport)) {
    const responseCell = e.landing(afterSupport, response);
    const afterP1 = kernel.advance(afterSupport, response);
    if (afterP1 === domain.QN_TERMINAL_WIN) {
      closed = false;
      responses.push({ response: col(response), responseCell: coord(responseCell), route: 'P1_terminal_override' });
      continue;
    }
    assert(afterP1 >= 0 && e.rank(afterP1) === e.rank(state) + 2);

    if (responseCell !== attackTarget) {
      const terminal = e.terminalActions(afterP1, 0).find((x) => x.cell === attackTarget);
      if (!terminal) {
        closed = false;
        responses.push({ response: col(response), responseCell: coord(responseCell), route: 'nonblock_without_target_terminal' });
      } else {
        responses.push({ response: col(response), responseCell: coord(responseCell), route: 'nonblock_exposes_P0_target_terminal' });
      }
      continue;
    }

    assert.equal(e.singleton(afterP1, 0, attackTarget), false, 'blocked target residual survived P1 ownership');
    const otherLive = e.singleton(afterP1, 0, otherTarget);
    const otherDistance = otherLive ? e.targetDistance(afterP1, otherTarget) : null;
    if (!otherLive || otherDistance !== 1) {
      closed = false;
      responses.push({
        response: col(response), responseCell: coord(responseCell), route: 'block_destroyed_other_target',
        otherTarget: targetName(otherTarget), otherLive, otherDistance,
      });
      continue;
    }

    const digit = String(attackCol + 1);
    const leafSequence = stateSequence + digit + digit;
    const leafProof = runBranchComposition(leafSequence, otherTarget, attackCol);
    blockedLeaf = { leafSequence, leafProof };
    if (!leafProof.proved) {
      closed = false;
      responses.push({
        response: col(response), responseCell: coord(responseCell), route: 'resolved_tail_branch_composition_unproved',
        blockedTarget: targetName(attackTarget), remainingTarget: targetName(otherTarget), leafSequence, leafProof,
      });
      continue;
    }
    responses.push({
      response: col(response), responseCell: coord(responseCell), route: 'forced_block_to_branch_composed_resolved_tail',
      blockedTarget: targetName(attackTarget), remainingTarget: targetName(otherTarget),
      leafSequence,
      leafCertificate: {
        selectedAction: leafProof.selectedAction,
        beforeMeasure: leafProof.beforeMeasure,
        afterP0Measure: leafProof.afterP0Measure,
        branchCount: leafProof.branchCount,
        certificate: leafProof.certificate,
      },
    });
  }

  return {
    closed,
    attackTarget: targetName(attackTarget),
    supportEvent: coord(supportCell),
    route: closed ? 'forced_target_then_resolved_tail_closed' : 'forced_target_then_resolved_tail_open',
    responses,
    blockedLeaf,
  };
}

const activatedSequence = ROOT + '3';
const activated = replay(kernel, activatedSequence);
const refusalCell = e.landing(activated, refusalCol);
assert.notEqual(refusalCell, 0xff, `${refusalName}: refusal illegal`);
const refusal = kernel.advance(activated, refusalCol);
assert.notEqual(refusal, domain.QN_TERMINAL_WIN, `${refusalName}: refusal is terminal`);
assert(refusal >= 0 && e.rank(refusal) === 14);
const refusalSequence = activatedSequence + String(refusalCol + 1);
assert.equal(e.landing(refusal, G), G, `${refusalName}: G1 not open after refusal`);
assert.equal(e.singleton(refusal, 0, C3), true);
assert.equal(e.singleton(refusal, 0, G3), true);
assert.equal(e.targetDistance(refusal, C3), 1);
assert.equal(e.targetDistance(refusal, G3), 2);

const afterG1 = kernel.advance(refusal, G);
assert.notEqual(afterG1, domain.QN_TERMINAL_WIN);
assert(afterG1 >= 0 && e.rank(afterG1) === 15);
assert.equal(e.targetDistance(afterG1, C3), 1);
assert.equal(e.targetDistance(afterG1, G3), 1);

let proved = true;
const branches = [];
for (const reply of e.legal(afterG1)) {
  const replyCell = e.landing(afterG1, reply);
  const child = kernel.advance(afterG1, reply);
  if (child === domain.QN_TERMINAL_WIN) {
    proved = false;
    branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'P1_terminal_after_G1' });
    continue;
  }
  assert(child >= 0 && e.rank(child) === 16);
  const childSequence = refusalSequence + '7' + String(reply + 1);
  const immediate = e.terminalActions(child, 0);
  if (immediate.length) {
    branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'immediate_P0_terminal', terminalCells: immediate.map((x) => coord(x.cell)) });
    continue;
  }
  if (!OFFSYSTEM.has(reply)) {
    proved = false;
    branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'nonterminal_non_offsystem_unclassified' });
    continue;
  }
  assert.equal(e.singleton(child, 0, C3), true);
  assert.equal(e.singleton(child, 0, G3), true);
  assert.equal(e.targetDistance(child, C3), 1);
  assert.equal(e.targetDistance(child, G3), 1);

  const attempts = [];
  const gFirst = forceTargetThenResolvedTail(child, childSequence, G, G3, C3);
  attempts.push(gFirst);
  let selected = gFirst.closed ? gFirst : null;
  if (!selected) {
    const cFirst = forceTargetThenResolvedTail(child, childSequence, C, C3, G3);
    attempts.push(cFirst);
    if (cFirst.closed) selected = cFirst;
  }
  if (!selected) {
    proved = false;
    branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'both_target_orders_unproved', attempts });
    continue;
  }
  branches.push({
    reply: col(reply), replyCell: coord(replyCell), route: 'dual_target_choice_closed',
    selectedTarget: selected.attackTarget, selected, attempts,
  });
}

const result = {
  kind: 'standard7x6-expired-response-dual-target-choice-closure-v1',
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
  branchCount: branches.length,
  branches,
  proved,
  promotedConsequence: proved ? `${refusalSequence} in W via P0:G1` : null,
  theoremBoundary: proved
    ? `Exact ${refusalName}-refusal theorem. After G1 seizure, each offsystem P1 reply may choose G3-first or C3-first independently; the chosen target is forced, its exact block leaves the other target live at distance one, and that target is discharged by branch-composed rho through the corresponding resolved column. No target-order or column symmetry is assumed.`
    : `Exact ${refusalName}-refusal control. Both target orders were tested only where needed; unresolved alternatives remain unknown and no candidate failure is interpreted as loss.`,
  authority: 'Exact C4-0010 transitions/terminal certificates plus branch-composed rho=(delta,mu) certificates under unchanged limits. No solved W/D/L labels, external oracle premise, or unrestricted q-frontier recursion.',
};
console.log(`EXPIRED_RESPONSE_DUAL_CHOICE_CLOSURE=${JSON.stringify(result)}`);
assert.equal(proved, true, `${refusalName}: dual-target refusal closure theorem failed`);
