#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CASES = Object.freeze([
  { id: 'forced_C4', sequence: '466565536644747533', action: 2, obligation: 'C4' },
  { id: 'forced_D6', sequence: '466565536644747534', action: 3, obligation: 'D6' },
]);

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    id = next;
  }
  return id;
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });
const G5 = 4 * 7 + 6;

function singletonSurface(state, player) {
  return e.terms(state, player)
    .filter((term) => term.length === 1)
    .map(([cell]) => ({
      cell: e.coord(cell),
      column: e.col(cell % 7),
      enabled: e.landing(state, cell % 7) === cell,
      distance: e.targetDistance(state, cell),
      landing: e.landing(state, cell % 7) === 0xff ? null : e.coord(e.landing(state, cell % 7)),
    }))
    .sort((a, b) => a.cell.localeCompare(b.cell));
}

const rows = [];
for (const entry of CASES) {
  const state = replay(kernel, entry.sequence);
  assert.equal(e.rank(state) % 2, 0, `${entry.id}: expected P0 turn`);
  const obligations = e.enabledSingletons(state, 1).map(e.coord);
  assert(obligations.includes(entry.obligation), `${entry.id}: expected obligation missing`);
  const actionCell = e.landing(state, entry.action);
  assert.equal(e.coord(actionCell), entry.obligation, `${entry.id}: forced landing drift`);
  const afterP0 = kernel.advance(state, entry.action);
  assert(Number.isSafeInteger(afterP0) && afterP0 >= 0 && afterP0 !== domain.QN_TERMINAL_WIN, `${entry.id}: forced defense unexpectedly terminal`);

  const replies = [];
  for (const reply of e.legal(afterP0)) {
    const replyCell = e.landing(afterP0, reply);
    const child = kernel.advance(afterP0, reply);
    if (child === domain.QN_TERMINAL_WIN) {
      replies.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'P1_terminal' });
      continue;
    }
    assert(Number.isSafeInteger(child) && child >= 0);
    replies.push({
      reply: e.col(reply),
      replyCell: e.coord(replyCell),
      sequence: entry.sequence + String(entry.action + 1) + String(reply + 1),
      route: 'nonterminal',
      P0TerminalActions: e.terminalActions(child, 0).map((x) => e.coord(x.cell)),
      P0Singletons: singletonSurface(child, 0),
      P1Singletons: singletonSurface(child, 1),
      G5: {
        live: e.singleton(child, 0, G5),
        distance: e.singleton(child, 0, G5) ? e.targetDistance(child, G5) : null,
      },
    });
  }

  rows.push({
    id: entry.id,
    sequence: entry.sequence,
    rank: e.rank(state),
    forcedAction: e.col(entry.action),
    forcedCell: e.coord(actionCell),
    rootP1Obligations: obligations,
    beforeP0Singletons: singletonSurface(state, 0),
    afterForcedP0Singletons: singletonSurface(afterP0, 0),
    afterForcedP1Obligations: e.enabledSingletons(afterP0, 1).map(e.coord),
    replies,
  });
}

console.log(`THETA_TARGET_SWITCH_DIAGNOSTIC=${JSON.stringify({
  kind: 'standard7x6-theta-target-switch-diagnostic-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rows,
  theoremBoundary: 'Diagnostic only. At the two exact forced-defense children where same-target G5 theta fails, reports the exact forced defense plus all P1 replies, immediate terminals, residual P0/P1 singleton surfaces, and G5 survival. No target switch is inferred merely from singleton presence; any replacement target requires an independently branch-complete theorem.',
})}`);
