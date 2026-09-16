#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const PARENT = '466565554';
const F = 5;
const D = 3;
const C = 2;
const EASY = Object.freeze([0, 1, 3, 4, 6]); // A,B,D,E,G P1 replies
const C1 = 2;
const F5 = 4 * 7 + 5;
const D4 = 3 * 7 + 3;
const C3 = 2 * 7 + 2;
const G3 = 2 * 7 + 6;

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
assert.equal(e.rank(root), 9);

function targetView(state, target) {
  const live = e.singleton(state, 0, target);
  const landing = e.landing(state, target % 7);
  return { live, supportDistance: live ? e.targetDistance(state, target) : null, landing: landing === 0xff ? null : e.coord(landing) };
}

const easyRows = [];
for (const reply of EASY) {
  const child = kernel.advance(root, reply);
  assert(Number.isSafeInteger(child) && child >= 0 && child !== domain.QN_TERMINAL_WIN, `${e.col(reply)} child invalid`);
  assert.equal(e.rank(child), 10);
  const f4Cell = e.landing(child, F);
  assert.equal(e.coord(f4Cell), 'F4', `${e.col(reply)}: F4 witness landing drift`);
  const afterF4 = kernel.advance(child, F);
  assert(Number.isSafeInteger(afterF4) && afterF4 >= 0 && afterF4 !== domain.QN_TERMINAL_WIN);
  assert.equal(e.rank(afterF4), 11);
  assert.equal(e.terminalActions(afterF4, 1).length, 0, `${e.col(reply)}: P1 terminal override after F4`);
  const p0Threats = new Set(e.enabledSingletons(afterF4, 0));
  assert(p0Threats.has(C1) && p0Threats.has(F5), `${e.col(reply)}: F4 did not create exact C1/F5 dual threat`);

  const responses = [];
  let closed = true;
  for (const response of e.legal(afterF4)) {
    const responseCell = e.landing(afterF4, response);
    const afterP1 = kernel.advance(afterF4, response);
    if (afterP1 === domain.QN_TERMINAL_WIN) {
      closed = false;
      responses.push({ response: e.col(response), responseCell: e.coord(responseCell), route: 'P1_terminal_override' });
      continue;
    }
    assert(Number.isSafeInteger(afterP1) && afterP1 >= 0);
    assert.equal(e.rank(afterP1), 12);
    const terminals = new Set(e.terminalActions(afterP1, 0).map((x) => x.cell));
    const expected = responseCell === C1 ? F5 : responseCell === F5 ? C1 : null;
    const survives = expected === null ? (terminals.has(C1) || terminals.has(F5)) : terminals.has(expected);
    if (!survives) {
      closed = false;
      responses.push({
        response: e.col(response), responseCell: e.coord(responseCell), route: 'dual_threat_not_preserved',
        P0Terminals: [...terminals].map(e.coord),
      });
      continue;
    }
    responses.push({
      response: e.col(response), responseCell: e.coord(responseCell),
      route: 'one_response_slot_leaves_P0_terminal',
      P0Terminals: [...terminals].filter((x) => x === C1 || x === F5).map(e.coord),
    });
  }
  assert.equal(closed, true, `${e.col(reply)}: F4 dual-threat closure failed`);
  easyRows.push({
    reply: e.col(reply), sequence: PARENT + String(reply + 1), witness: 'F4',
    threats: ['C1', 'F5'], responseSlots: 1, responses, proved: true,
  });
}
assert.equal(easyRows.length, 5);

// F is already closed by the independently qualified 4665655546 theorem.
const fChild = kernel.advance(root, F);
assert.equal(fChild, replay(kernel, '4665655546'));

// C is the only unclosed reply. D3 creates an exact D4 threat; classify the forced block child.
const cChild = kernel.advance(root, C);
assert(Number.isSafeInteger(cChild) && cChild >= 0 && cChild !== domain.QN_TERMINAL_WIN);
assert.equal(e.rank(cChild), 10);
const d3Cell = e.landing(cChild, D);
assert.equal(e.coord(d3Cell), 'D3');
const afterD3 = kernel.advance(cChild, D);
assert(Number.isSafeInteger(afterD3) && afterD3 >= 0 && afterD3 !== domain.QN_TERMINAL_WIN);
assert.equal(e.rank(afterD3), 11);
assert.equal(e.terminalActions(afterD3, 1).length, 0, 'C branch: P1 terminal override after D3');
assert(new Set(e.enabledSingletons(afterD3, 0)).has(D4), 'C branch: D3 did not create D4 threat');

const cResponses = [];
let blockChild = null;
for (const response of e.legal(afterD3)) {
  const responseCell = e.landing(afterD3, response);
  const afterP1 = kernel.advance(afterD3, response);
  if (afterP1 === domain.QN_TERMINAL_WIN) {
    cResponses.push({ response: e.col(response), responseCell: e.coord(responseCell), route: 'P1_terminal_override' });
    continue;
  }
  assert(Number.isSafeInteger(afterP1) && afterP1 >= 0);
  assert.equal(e.rank(afterP1), 12);
  if (responseCell === D4) {
    blockChild = afterP1;
    cResponses.push({ response: 'D', responseCell: 'D4', route: 'forced_D4_block', sequence: PARENT + '344' });
    continue;
  }
  const d4Terminal = e.terminalActions(afterP1, 0).find((x) => x.cell === D4) ?? null;
  assert(d4Terminal, `C branch: nonblock ${e.coord(responseCell)} did not expose D4 terminal`);
  cResponses.push({ response: e.col(response), responseCell: e.coord(responseCell), route: 'nonblock_exposes_P0_D4_terminal' });
}
assert(blockChild !== null, 'C branch D4 block child missing');
assert.equal(blockChild, replay(kernel, PARENT + '344'));

const blockActions = [];
for (const action of e.legal(blockChild)) {
  const actionCell = e.landing(blockChild, action);
  const afterP0 = kernel.advance(blockChild, action);
  if (afterP0 === domain.QN_TERMINAL_WIN) {
    blockActions.push({ action: e.col(action), actionCell: e.coord(actionCell), route: 'P0_terminal_now' });
    continue;
  }
  assert(Number.isSafeInteger(afterP0) && afterP0 >= 0);
  blockActions.push({
    action: e.col(action), actionCell: e.coord(actionCell), route: 'nonterminal',
    P0Threats: e.enabledSingletons(afterP0, 0).map(e.coord),
    P1Obligations: e.enabledSingletons(afterP0, 1).map(e.coord),
    P1TerminalActions: e.terminalActions(afterP0, 1).map((x) => e.coord(x.cell)),
    C3: targetView(afterP0, C3), G3: targetView(afterP0, G3),
  });
}

console.log(`RANK9_REPLY_FAMILY_CONTROL=${JSON.stringify({
  kind: 'standard7x6-rank9-reply-family-control-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  parent: PARENT,
  easyReplies: easyRows,
  knownFReply: { sequence: '4665655546', route: 'qualified_D3_predecessor_theorem' },
  cReply: {
    sequence: PARENT + '3', witnessCandidate: 'D3', responses: cResponses,
    forcedBlockSequence: PARENT + '344',
    forcedBlockSurface: {
      phase: e.heights(blockChild).map((h) => h & 1).join(''),
      enabledP0Singletons: e.enabledSingletons(blockChild, 0).map(e.coord),
      enabledP1Singletons: e.enabledSingletons(blockChild, 1).map(e.coord),
      P0TerminalActions: e.terminalActions(blockChild, 0).map((x) => e.coord(x.cell)),
      C3: targetView(blockChild, C3), G3: targetView(blockChild, G3),
      actions: blockActions,
    },
  },
  provedEasyReplyCount: easyRows.length,
  remainingUnclosedReply: 'C',
  theoremBoundary: 'Proves only A/B/D/E/G rank9 P1 replies via exact F4 -> {C1,F5} double-threat response-capacity certificates. F is recorded only as an already-qualified child. C is reduced to its exact forced-D4 block child 466565554344 and remains unclassified. No symmetry, solved W/D/L, or phase-only closure is used.',
  authority: 'Exact C4-0010 transitions/residual singleton/terminal certificates and exhaustive one-response-slot verification for the dual threats.',
})}`);
