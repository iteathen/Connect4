#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const C3 = 16;
const SEQUENCES = Object.freeze([
  '46656555464434757776',
  '46656555464434757777',
  '46656555464434767775',
  '46656555464435747776',
  '46656555464435747777',
  '46656555464435767774',
  '46656555464435767777',
  '46656555464436747775',
  '46656555464436757774',
  '46656555464436757777',
]);
const REPAIR = Object.freeze([0, 1, 3, 4, 5, 6]);

function col(c) { return String.fromCharCode(65 + c); }
function coord(cell) { return `${col(cell % 7)}${Math.floor(cell / 7) + 1}`; }
function replay(kernel, sequence) {
  let state = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(state, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    state = next;
  }
  return state;
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

function actionSurface(state, action) {
  const cell = e.landing(state, action);
  if (cell === 0xff) return null;
  const child = kernel.advance(state, action);
  if (child === domain.QN_TERMINAL_WIN) return { action: col(action), cell: coord(cell), route: 'P0_terminal' };
  assert(child >= 0);
  return {
    action: col(action),
    cell: coord(cell),
    route: 'nonterminal',
    afterP0Measure: rho.measure(child, C3),
    enabledP1Singletons: e.enabledSingletons(child, 1).map(coord),
    P1TerminalActions: e.terminalActions(child, 1).map((x) => coord(x.cell)),
  };
}

const rows = [];
for (const sequence of [...new Set(SEQUENCES)]) {
  const state = replay(kernel, sequence);
  assert.equal(e.rank(state) & 1, 0, `${sequence}: expected P0 turn`);
  rows.push({
    sequence,
    measure: rho.measure(state, C3),
    C3Live: e.singleton(state, 0, C3),
    C3Distance: e.singleton(state, 0, C3) ? e.targetDistance(state, C3) : null,
    enabledP0Singletons: e.enabledSingletons(state, 0).map(coord),
    enabledP1Singletons: e.enabledSingletons(state, 1).map(coord),
    P0TerminalActions: e.terminalActions(state, 0).map((x) => coord(x.cell)),
    P1TerminalActionsAtRoot: e.terminalActions(state, 1).map((x) => coord(x.cell)),
    actions: REPAIR.map((a) => actionSurface(state, a)).filter(Boolean),
  });
}

console.log(`REFUSAL_HARD_BOUNDARY_DIAGNOSTIC=${JSON.stringify({
  kind: 'standard7x6-refusal-hard-boundary-diagnostic-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  target: 'C3',
  rows,
  theoremBoundary: 'Diagnostic only. Reports exact enabled singleton/terminal surfaces at recurring D/E/F refusal rho failures and after each candidate repair/target-column action. It proves no W/L classification.',
  authority: 'Exact C4-0010 transitions and residual singleton/terminal predicates under unchanged quotient storage. No solved labels or external oracle.',
})}`);
