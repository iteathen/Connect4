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
const RHO_PROBE = fileURLToPath(new URL('./quotient-standard7x6-expired-response-rho-probe.mjs', import.meta.url));
const OFFSYSTEM = new Set([0, 1, 3, 4, 5]); // A,B,D,E,F
const replyName = process.argv[2];
if (!/^[A-G]$/.test(replyName ?? '')) throw new Error('usage: center-reply-partition <A-G>');
const replyColumn = replyName.charCodeAt(0) - 65;

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
function runRhoProbe(sequence, target) {
  const child = spawnSync(process.execPath, [RHO_PROBE, sequence, target], {
    encoding: 'utf-8', timeout: 270000, maxBuffer: 32 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  if (child.status !== 0) return { proved: false, kind: 'rho_probe_process_error', error: (child.stderr ?? '').slice(-8000) };
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('EXPIRED_RESPONSE_RHO_PROBE='));
  if (!line) return { proved: false, kind: 'rho_probe_output_missing', error: (child.stdout ?? '').slice(-8000) };
  return JSON.parse(line.slice('EXPIRED_RESPONSE_RHO_PROBE='.length));
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });

const afterC1Sequence = ROOT + '3';
const afterC1 = replay(kernel, afterC1Sequence);
assert.equal(e.rank(afterC1), 13);
assert.equal(coord(e.landing(afterC1, G)), 'G1');
const legalReplies = e.legal(afterC1);
assert(legalReplies.includes(replyColumn), `${replyName} is not a legal P1 reply after P0:C1`);
const replyCell = e.landing(afterC1, replyColumn);
const state = kernel.advance(afterC1, replyColumn);
assert.notEqual(state, domain.QN_TERMINAL_WIN, `${replyName}${Math.floor(replyCell / 7) + 1} is immediate P1 terminal; partition premise invalid`);
assert(Number.isSafeInteger(state) && state >= 0);
assert.equal(e.rank(state), 14);
const sequence = afterC1Sequence + String(replyColumn + 1);

let result;
if (replyColumn === C) {
  const p0Immediate = e.terminalActions(state, 0);
  const c3 = p0Immediate.find((x) => x.cell === C3);
  assert(c3, 'P1:C2 did not expose immediate P0:C3 terminality');
  result = {
    kind: 'standard7x6-center-reply-partition-v1', reply: replyName, replyCell: coord(replyCell), sequence,
    class: 'target-column-deviation', proved: true, route: 'immediate_P0_C3_terminal',
    terminalCells: p0Immediate.map((x) => coord(x.cell)),
  };
} else if (replyColumn === G) {
  // On-contract P1:G1 is intentionally not identified with a refusal. Probe the
  // already-qualified rho calculus only as a discovery/qualification oracle.
  assert.equal(coord(replyCell), 'G1');
  const c3Probe = runRhoProbe(sequence, 'C3');
  const g3Probe = runRhoProbe(sequence, 'G3');
  const proved = Boolean(c3Probe.proved || g3Probe.proved);
  result = {
    kind: 'standard7x6-center-reply-partition-v1', reply: replyName, replyCell: coord(replyCell), sequence,
    class: 'on-contract-G1', proved,
    route: proved ? 'existing_rho_closes_on_contract_reply' : 'on_contract_reply_not_closed_by_existing_rho_probe',
    C3: { singleton: e.singleton(state, 0, C3), distance: e.targetDistance(state, C3), probe: c3Probe },
    G3: { singleton: e.singleton(state, 0, G3), distance: e.targetDistance(state, G3), probe: g3Probe },
  };
  console.log(`CENTER_REPLY_PARTITION=${JSON.stringify(result)}`);
  assert.equal(proved, true, 'on-contract G1 remains an explicit unresolved separator under the existing rho probe');
  process.exit(0);
} else {
  // Every non-G reply spends the deadline-bearing P1 turn elsewhere. Test the
  // exact support-seizure macro independently rather than generalizing B1 by name.
  assert(OFFSYSTEM.has(replyColumn));
  assert.equal(coord(e.landing(state, G)), 'G1', `${replyName}: expired response event G1 no longer directly playable`);
  assert.equal(e.singleton(state, 0, C3), true, `${replyName}: C3 singleton absent at refusal`);
  assert.equal(e.singleton(state, 0, G3), true, `${replyName}: G3 singleton absent at refusal`);
  assert.equal(e.targetDistance(state, C3), 1, `${replyName}: C3 support distance changed`);
  assert.equal(e.targetDistance(state, G3), 2, `${replyName}: G3 support distance changed`);
  assert.equal(e.terminalActions(state, 0).length, 0, `${replyName}: refusal unexpectedly exposes immediate P0 terminal before seizure`);

  const afterG1 = kernel.advance(state, G);
  assert.notEqual(afterG1, domain.QN_TERMINAL_WIN);
  assert(afterG1 >= 0 && e.rank(afterG1) === 15);
  assert.equal(e.singleton(afterG1, 0, C3), true);
  assert.equal(e.singleton(afterG1, 0, G3), true);
  assert.equal(e.targetDistance(afterG1, C3), 1);
  assert.equal(e.targetDistance(afterG1, G3), 1);

  const topBranches = [];
  let allClosed = true;
  for (const response of e.legal(afterG1)) {
    const responseCell = e.landing(afterG1, response);
    const child = kernel.advance(afterG1, response);
    if (child === domain.QN_TERMINAL_WIN) {
      allClosed = false;
      topBranches.push({ response: col(response), responseCell: coord(responseCell), route: 'P1_terminal_after_P0_G1' });
      continue;
    }
    assert(child >= 0 && e.rank(child) === 16);
    const childSequence = sequence + '7' + String(response + 1);
    const immediate = e.terminalActions(child, 0);
    if (immediate.length) {
      topBranches.push({ response: col(response), responseCell: coord(responseCell), route: 'immediate_P0_terminal', terminalCells: immediate.map((x) => coord(x.cell)) });
      continue;
    }
    if (!OFFSYSTEM.has(response)) {
      allClosed = false;
      topBranches.push({ response: col(response), responseCell: coord(responseCell), route: 'nonterminal_non_offsystem_unclassified' });
      continue;
    }
    assert.equal(e.singleton(child, 0, C3), true, `${replyName}/${col(response)}: C3 died before handoff`);
    assert.equal(e.singleton(child, 0, G3), true, `${replyName}/${col(response)}: G3 died before handoff`);
    assert.equal(e.targetDistance(child, C3), 1, `${replyName}/${col(response)}: C3 distance drift`);
    assert.equal(e.targetDistance(child, G3), 1, `${replyName}/${col(response)}: G3 distance drift`);

    const g2Cell = e.landing(child, G);
    assert.equal(coord(g2Cell), 'G2', `${replyName}/${col(response)}: G2 not directly playable`);
    const afterG2 = kernel.advance(child, G);
    if (afterG2 === domain.QN_TERMINAL_WIN) {
      topBranches.push({ response: col(response), responseCell: coord(responseCell), route: 'P0_terminal_on_G2' });
      continue;
    }
    assert(afterG2 >= 0 && e.rank(afterG2) === 17);
    assert.equal(coord(e.landing(afterG2, G)), 'G3');

    let forcedBlockClosed = true;
    let blockedLeafSequence = null;
    const forceReplies = [];
    for (const p1 of e.legal(afterG2)) {
      const p1Cell = e.landing(afterG2, p1);
      const afterP1 = kernel.advance(afterG2, p1);
      if (afterP1 === domain.QN_TERMINAL_WIN) {
        forcedBlockClosed = false;
        forceReplies.push({ response: col(p1), responseCell: coord(p1Cell), route: 'P1_terminal_override' });
        continue;
      }
      assert(afterP1 >= 0 && e.rank(afterP1) === 18);
      if (p1Cell !== G3) {
        const p0G3 = e.terminalActions(afterP1, 0).find((x) => x.cell === G3);
        if (!p0G3) {
          forcedBlockClosed = false;
          forceReplies.push({ response: col(p1), responseCell: coord(p1Cell), route: 'nonblock_without_G3_terminal' });
        } else forceReplies.push({ response: col(p1), responseCell: coord(p1Cell), route: 'nonblock_exposes_P0_G3_terminal' });
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
      topBranches.push({ response: col(response), responseCell: coord(responseCell), route: 'G3_forced_block_macro_unclosed', forceReplies });
      continue;
    }
    const leafProof = runBranchComposition(blockedLeafSequence);
    if (!leafProof.proved) {
      allClosed = false;
      topBranches.push({ response: col(response), responseCell: coord(responseCell), route: 'branch_composed_rho_leaf_unproved', forceReplies, blockedLeafSequence, leafProof });
      continue;
    }
    topBranches.push({ response: col(response), responseCell: coord(responseCell), route: 'G2_forced_G3_block_to_branch_composed_rho', forceReplies, blockedLeafSequence, leafCertificate: { selectedAction: leafProof.selectedAction, beforeMeasure: leafProof.beforeMeasure, afterP0Measure: leafProof.afterP0Measure, branchCount: leafProof.branchCount, certificate: leafProof.certificate } });
  }
  result = {
    kind: 'standard7x6-center-reply-partition-v1', reply: replyName, replyCell: coord(replyCell), sequence,
    class: 'expired-G1-refusal', proved: allClosed,
    route: allClosed ? 'G1_seizure_then_dual_target_forced_block_then_branch_composed_rho' : 'refusal_macro_unclosed',
    targetSnapshot: { C3: { singleton: true, distance: 1 }, G3: { singleton: true, distance: 2 }, G1Playable: true },
    branches: topBranches,
  };
  console.log(`CENTER_REPLY_PARTITION=${JSON.stringify(result)}`);
  assert.equal(allClosed, true, `${replyName} refusal did not close under the independently requalified support-seizure macro`);
  process.exit(0);
}

console.log(`CENTER_REPLY_PARTITION=${JSON.stringify(result)}`);
