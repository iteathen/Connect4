#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const G = 6, C3 = 16;
const CASES = Object.freeze([
  { name: 'A', sequence: '466565554644327177', priorStatus: 'rho_G_qualified' },
  { name: 'B', sequence: '466565554644327277', priorStatus: 'rho_G_qualified' },
  { name: 'D', sequence: '466565554644327477', priorStatus: 'rho_G_qualified' },
  { name: 'E', sequence: '466565554644327577', priorStatus: 'rho_G_resource_ambiguous' },
  { name: 'F', sequence: '466565554644327677', priorStatus: 'rho_G_resource_ambiguous' },
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
function col(c) { return String.fromCharCode(65 + c); }
function coord(cell) { return `${col(cell % 7)}${Math.floor(cell / 7) + 1}`; }
function has([lo, hi], x) { return x < 32 ? (((lo >>> x) & 1) !== 0) : (((hi >>> (x - 32)) & 1) !== 0); }
function cells(term) { const out = []; for (let x = 0; x < 42; x++) if (has(term, x)) out.push(x); return out; }
function canonicalTerms(kernel, state, player) {
  const q = player === 0 ? kernel.states.p0At(state) : kernel.states.p1At(state);
  return kernel.classes.terms(q).map(cells).map((term) => term.map(coord).join('-')).sort();
}
function localIncidence(kernel, engine, state) {
  const p0 = canonicalTerms(kernel, state, 0);
  const p1 = canonicalTerms(kernel, state, 1);
  const rows = {};
  for (const c of [0,1,3,4,5]) {
    const cell = engine.landing(state, c);
    if (cell === 0xff) { rows[col(c)] = { cell: null, p0: [], p1: [] }; continue; }
    const name = coord(cell);
    rows[col(c)] = {
      cell: name,
      p0: p0.filter((term) => term.split('-').includes(name)),
      p1: p1.filter((term) => term.split('-').includes(name)),
    };
  }
  return rows;
}
function snapshot(kernel, engine, state) {
  const heights = engine.heights(state);
  const rank = engine.rank(state);
  const mover = rank & 1;
  const moverTerminal = engine.terminalActions(state, mover).map((x) => coord(x.cell));
  return {
    rank,
    sideToMove: mover === 0 ? 'P0' : 'P1',
    heights,
    phaseBits: heights.map((h) => h & 1).join(''),
    delta: 6 - heights[G],
    mu: engine.mu(state),
    C3Live: engine.singleton(state, 0, C3),
    C3Distance: engine.singleton(state, 0, C3) ? engine.targetDistance(state, C3) : null,
    p0EnabledSingletons: engine.enabledSingletons(state, 0).map(coord),
    p1EnabledSingletons: engine.enabledSingletons(state, 1).map(coord),
    moverTerminal,
    p0Terminal: mover === 0 ? moverTerminal : [],
    p1Terminal: mover === 1 ? moverTerminal : [],
    p0Terms: canonicalTerms(kernel, state, 0),
    p1Terms: canonicalTerms(kernel, state, 1),
    nextRepairIncidence: localIncidence(kernel, engine, state),
  };
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });

const rows = [];
for (const item of CASES) {
  const root = replay(kernel, item.sequence);
  const before = snapshot(kernel, e, root);
  assert.equal(before.rank & 1, 0, `${item.name}: expected P0 turn`);
  assert.equal(before.C3Live, true, `${item.name}: C3 not live`);
  assert.equal(before.C3Distance, 1, `${item.name}: C3 distance drift`);
  assert.equal(coord(e.landing(root, G)), 'G4', `${item.name}: expected G4 resolved-tail event`);

  const afterG4 = kernel.advance(root, G);
  assert.notEqual(afterG4, domain.QN_TERMINAL_WIN, `${item.name}: G4 unexpectedly P0 terminal`);
  assert(afterG4 >= 0 && e.rank(afterG4) === before.rank + 1);
  const afterP0 = snapshot(kernel, e, afterG4);
  assert.equal(afterP0.delta, before.delta - 1, `${item.name}: G4 failed delta descent`);
  assert.equal(afterP0.mu, before.mu, `${item.name}: G4 changed mu`);

  const replies = [];
  for (const reply of e.legal(afterG4)) {
    const replyCell = e.landing(afterG4, reply);
    const child = kernel.advance(afterG4, reply);
    if (child === domain.QN_TERMINAL_WIN) {
      replies.push({ reply: col(reply), replyCell: coord(replyCell), route: 'P1_terminal' });
      continue;
    }
    assert(child >= 0 && e.rank(child) === before.rank + 2);
    const childSnapshot = snapshot(kernel, e, child);
    replies.push({
      reply: col(reply),
      replyCell: coord(replyCell),
      route: childSnapshot.p0Terminal.length ? 'P0_terminal_available' : 'nonterminal_child',
      child: childSnapshot,
    });
  }

  rows.push({ case: item.name, priorStatus: item.priorStatus, sequence: item.sequence, before, afterG4: afterP0, replies });
}

function replyBy(row, column) { return row.replies.find((x) => x.reply === column) ?? null; }
const comparison = [];
for (const column of ['A','B','C','D','E','F','G']) {
  comparison.push({
    reply: column,
    A: replyBy(rows[0], column)?.route ?? 'illegal',
    B: replyBy(rows[1], column)?.route ?? 'illegal',
    D: replyBy(rows[2], column)?.route ?? 'illegal',
    E: replyBy(rows[3], column)?.route ?? 'illegal',
    F: replyBy(rows[4], column)?.route ?? 'illegal',
    E_p1Enabled: replyBy(rows[3], column)?.child?.p1EnabledSingletons ?? null,
    F_p1Enabled: replyBy(rows[4], column)?.child?.p1EnabledSingletons ?? null,
    E_p0Terminal: replyBy(rows[3], column)?.child?.p0Terminal ?? null,
    F_p0Terminal: replyBy(rows[4], column)?.child?.p0Terminal ?? null,
  });
}

console.log(`EXPIRED_RESPONSE_G4_SEPARATOR=${JSON.stringify({
  kind: 'standard7x6-expired-response-resolved-tail-g4-separator-v2',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  target: 'C3',
  resolvedTailAction: 'P0:G4',
  rows,
  comparison,
  theoremBoundary: 'One exact resolved-tail action plus one complete P1 reply horizon for the A/B/D qualified-rho controls and E/F unresolved leaves. Terminal actions are queried only for the actual side to move. No recursive proof is run here. priorStatus is experimental grouping only and never a W/L premise.',
  authority: 'Exact C4-0010 transitions/residuals, enabled-singleton terminal certificates, and exact support/phase observations only. No solved labels, recursive q search, or cap increase.',
})}`);
