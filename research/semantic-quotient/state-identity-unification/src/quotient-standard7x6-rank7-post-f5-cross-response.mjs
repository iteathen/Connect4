#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const C = 2;
const D = 3;
const C1 = 2;
const D2 = 1 * 7 + 3;
const C3 = 2 * 7 + 2;
const G3 = 2 * 7 + 6;
const CASES = Object.freeze([
  ['A', '4665655166'],
  ['B', '4665655266'],
  ['G', '4665655766'],
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
function phase(e, state) {
  return e.heights(state).map((h) => h & 1).join('');
}
function targetView(e, state, cell) {
  return {
    live: e.singleton(state, 0, cell),
    distance: e.targetDistance(state, cell),
  };
}
function stateView(e, state) {
  return {
    phase: phase(e, state),
    P0TerminalActions: e.terminalActions(state, 0).map((x) => e.coord(x.cell)),
    P0Singletons: e.enabledSingletons(state, 0).map(e.coord),
    P1Obligations: e.enabledSingletons(state, 1).map(e.coord),
    C3: targetView(e, state, C3),
    G3: targetView(e, state, G3),
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

function force(startSequence, actionColumn, expectedActionCell, forcedCell, expectedReplyColumn) {
  const start = replay(kernel, startSequence);
  assert.equal(e.rank(start), 10, `${startSequence} rank drift`);
  assert.equal(e.terminalActions(start, 0).length, 0, `${startSequence} unexpected immediate P0 terminal`);
  const actionCell = e.landing(start, actionColumn);
  assert.equal(e.coord(actionCell), expectedActionCell, `${startSequence} action landing drift`);
  const afterAction = kernel.advance(start, actionColumn);
  assert(Number.isSafeInteger(afterAction) && afterAction >= 0 && afterAction !== domain.QN_TERMINAL_WIN, `${startSequence}/${expectedActionCell} terminal/invalid`);
  assert.equal(e.rank(afterAction), 11, `${startSequence}/${expectedActionCell} rank drift`);
  assert.equal(e.terminalActions(afterAction, 1).length, 0, `${startSequence}/${expectedActionCell} P1 terminal override`);
  assert(new Set(e.enabledSingletons(afterAction, 0)).has(forcedCell), `${startSequence}/${expectedActionCell} forced singleton missing`);

  const replies = [];
  let block = null;
  for (const p1 of e.legal(afterAction)) {
    const replyCell = e.landing(afterAction, p1);
    const child = kernel.advance(afterAction, p1);
    assert(child !== domain.QN_TERMINAL_WIN, `${startSequence}/${expectedActionCell} P1 terminal ${e.coord(replyCell)}`);
    assert(Number.isSafeInteger(child) && child >= 0, `${startSequence}/${expectedActionCell} invalid P1 reply`);
    assert.equal(e.rank(child), 12, `${startSequence}/${expectedActionCell} reply rank drift`);
    if (replyCell === forcedCell) {
      assert.equal(p1, expectedReplyColumn, `${startSequence}/${expectedActionCell} forced reply column drift`);
      block = child;
      replies.push({ reply: e.col(p1), replyCell: e.coord(replyCell), route: 'forced_block' });
    } else {
      assert(e.terminalActions(child, 0).some((x) => x.cell === forcedCell), `${startSequence}/${expectedActionCell} nonblock ${e.coord(replyCell)} failed to expose terminal`);
      replies.push({ reply: e.col(p1), replyCell: e.coord(replyCell), route: 'nonblock_exposes_P0_terminal' });
    }
  }
  assert(block !== null, `${startSequence}/${expectedActionCell} forced block missing`);
  const suffix = String(actionColumn + 1) + String(expectedReplyColumn + 1);
  const blockSequence = startSequence + suffix;
  assert.equal(block, replay(kernel, blockSequence), `${startSequence}/${expectedActionCell} block identity drift`);
  return {
    action: e.col(actionColumn),
    actionCell: expectedActionCell,
    forcedReply: e.col(expectedReplyColumn),
    forcedReplyCell: e.coord(forcedCell),
    replies,
    blockSequence,
    blockView: stateView(e, block),
    support: kernel.states.supportAt(block).toString(),
    p0Class: kernel.states.p0At(block),
    p1Class: kernel.states.p1At(block),
  };
}

const cases = [];
for (const [reply, startSequence] of CASES) {
  const viaC = force(startSequence, C, 'C1', D2, D);
  const viaD = force(startSequence, D, 'D2', C1, C);
  cases.push({
    rank7Reply: reply,
    startSequence,
    viaC,
    viaD,
    convergesSupport: viaC.support === viaD.support,
    exactQEqual: viaC.support === viaD.support && viaC.p0Class === viaD.p0Class && viaC.p1Class === viaD.p1Class,
    sameClaimSurface: JSON.stringify(viaC.blockView) === JSON.stringify(viaD.blockView),
  });
}

console.log(`RANK7_POST_F5_CROSS_RESPONSE=${JSON.stringify({
  kind: 'standard7x6-rank7-post-f5-cross-response-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  cases,
  theoremBoundary: 'For exact post-F5-block A/B/G states only, P0:C1 forces the exact D2 block and P0:D2 forces the exact C1 block. Nonblocking P1 replies lose immediately to the created singleton. The two routes are compared only as observed data; support convergence, q equality, or matching claim surfaces are not used as strategy equivalence without a separate theorem. No external solver, symmetry, implicit frame, or cap widening is used.',
})}`);
