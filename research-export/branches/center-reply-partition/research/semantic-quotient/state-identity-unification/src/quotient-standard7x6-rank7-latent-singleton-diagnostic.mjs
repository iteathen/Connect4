#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CASES = Object.freeze([
  ['C_post_F5', '4665655366'],
  ['D_post_F5', '4665655466'],
  ['F_child', '46656556'],
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

const cases = [];
for (const [name, sequence] of CASES) {
  const state = replay(kernel, sequence);
  assert.equal(e.rank(state) % 2, 0, `${name}: expected P0 turn`);
  const actions = [];
  for (const action of e.legal(state)) {
    const actionCell = e.landing(state, action);
    const child = kernel.advance(state, action);
    if (child === domain.QN_TERMINAL_WIN) {
      actions.push({ action: e.col(action), actionCell: e.coord(actionCell), route: 'P0_terminal' });
      continue;
    }
    assert(Number.isSafeInteger(child) && child >= 0);
    actions.push({
      action: e.col(action),
      actionCell: e.coord(actionCell),
      route: 'nonterminal',
      P0Singletons: singletonSurface(child, 0),
      P1Singletons: singletonSurface(child, 1),
      P1TerminalActions: e.terminalActions(child, 1).map((x) => e.coord(x.cell)),
    });
  }
  cases.push({
    name,
    sequence,
    rank: e.rank(state),
    P0TerminalActions: e.terminalActions(state, 0).map((x) => e.coord(x.cell)),
    P0Singletons: singletonSurface(state, 0),
    P1Singletons: singletonSurface(state, 1),
    actions,
  });
}

console.log(`RANK7_LATENT_SINGLETON_DIAGNOSTIC=${JSON.stringify({
  kind: 'standard7x6-rank7-latent-singleton-diagnostic-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  cases,
  theoremBoundary: 'Diagnostic only. Reports exact residual singleton requirements, support distance, enabled status, and one-ply action surfaces for C/D post-F5 and original F rank7 children. No singleton is promoted to a winning theorem without a separate branch-complete certificate. No symmetry, solved W/D/L, or quotient-equivalence shortcut is used.',
})}`);
