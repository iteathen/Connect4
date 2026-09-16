#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const PARENT = '466565554';
const KNOWN_CHILD = '4665655546';
const F = 5;
const C3 = 16;
const G3 = 20;

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
const root = replay(kernel, PARENT);
assert.equal(e.rank(root), 9, 'rank9 parent drift');
const knownChildId = replay(kernel, KNOWN_CHILD);
assert.equal(e.rank(knownChildId), 10, 'known child rank drift');

function phaseBits(state) { return e.heights(state).map((h) => h & 1).join(''); }
function cells(xs) { return xs.map(e.coord); }
function targetView(state, target) {
  const live = e.singleton(state, 0, target);
  const landing = e.landing(state, target % 7);
  return {
    live,
    supportDistance: live ? e.targetDistance(state, target) : null,
    landing: landing === 0xff ? null : e.coord(landing),
  };
}

const replies = [];
for (const reply of e.legal(root)) {
  const replyCell = e.landing(root, reply);
  const child = kernel.advance(root, reply);
  const sequence = PARENT + String(reply + 1);
  if (child === domain.QN_TERMINAL_WIN) {
    replies.push({ reply: e.col(reply), replyCell: e.coord(replyCell), sequence, route: 'P1_terminal_now' });
    continue;
  }
  assert(Number.isSafeInteger(child) && child >= 0);
  assert.equal(e.rank(child), 10);
  if (reply === F) assert.equal(child, knownChildId, 'F reply no longer reaches qualified D3 child');
  const row = {
    reply: e.col(reply),
    replyCell: e.coord(replyCell),
    sequence,
    knownQualifiedChild: reply === F ? KNOWN_CHILD : null,
    phase: phaseBits(child),
    enabledP0Singletons: cells(e.enabledSingletons(child, 0)),
    enabledP1Singletons: cells(e.enabledSingletons(child, 1)),
    P0TerminalActions: e.terminalActions(child, 0).map((x) => e.coord(x.cell)),
    C3: targetView(child, C3),
    G3: targetView(child, G3),
    actions: [],
  };

  for (const action of e.legal(child)) {
    const actionCell = e.landing(child, action);
    const afterP0 = kernel.advance(child, action);
    if (afterP0 === domain.QN_TERMINAL_WIN) {
      row.actions.push({ action: e.col(action), actionCell: e.coord(actionCell), route: 'P0_terminal_now' });
      continue;
    }
    assert(Number.isSafeInteger(afterP0) && afterP0 >= 0);
    assert.equal(e.rank(afterP0), 11);
    row.actions.push({
      action: e.col(action),
      actionCell: e.coord(actionCell),
      route: 'nonterminal',
      phase: phaseBits(afterP0),
      P0Threats: cells(e.enabledSingletons(afterP0, 0)),
      P1Obligations: cells(e.enabledSingletons(afterP0, 1)),
      P1TerminalActions: e.terminalActions(afterP0, 1).map((x) => e.coord(x.cell)),
      C3: targetView(afterP0, C3),
      G3: targetView(afterP0, G3),
    });
  }
  replies.push(row);
}

assert(replies.length > 0, 'rank9 parent has no legal replies');
const f = replies.find((x) => x.reply === 'F');
assert(f && f.knownQualifiedChild === KNOWN_CHILD, 'qualified F child absent');

console.log(`RANK9_REPLY_HORIZON_DIAGNOSTIC=${JSON.stringify({
  kind: 'standard7x6-rank9-p1-reply-horizon-diagnostic-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  parent: PARENT,
  sideToMove: 'P1',
  replyCount: replies.length,
  replies,
  theoremBoundary: 'Diagnostic only. Enumerates every legal P1 reply from exact parent 466565554 and one subsequent P0 action ply. Only the exact F child is tagged with the already-qualified 4665655546 theorem. No other child is classified by symmetry, phase, resemblance, or solved W/D/L.',
  authority: 'Exact C4-0010 transitions, residual singleton predicates, support/phase observation, and terminal certificates. No external oracle, symmetry, or unrestricted recursion.',
})}`);
