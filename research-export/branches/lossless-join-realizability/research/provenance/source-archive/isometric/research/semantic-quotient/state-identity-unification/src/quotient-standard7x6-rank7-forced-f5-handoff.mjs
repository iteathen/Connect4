#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const PARENT = '4665655';
const F = 5;
const F5 = 4 * 7 + 5;
const CASES = Object.freeze([
  ['A', 0],
  ['B', 1],
  ['C', 2],
  ['D', 3],
  ['G', 6],
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

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });
const root = replay(kernel, PARENT);
assert.equal(e.rank(root), 7, 'rank7 parent rank drift');

const cases = [];
for (const [replyName, reply] of CASES) {
  const childSequence = PARENT + String(reply + 1);
  const child = kernel.advance(root, reply);
  assert(Number.isSafeInteger(child) && child >= 0 && child !== domain.QN_TERMINAL_WIN, `${replyName} child invalid/terminal`);
  assert.equal(child, replay(kernel, childSequence), `${replyName} child identity drift`);
  assert.equal(e.rank(child), 8, `${replyName} child rank drift`);
  assert.equal(e.terminalActions(child, 0).length, 0, `${replyName} has unexpected immediate P0 terminal`);

  const f4 = e.landing(child, F);
  assert.equal(e.coord(f4), 'F4', `${replyName} P0:F landing drift`);
  const afterF4 = kernel.advance(child, F);
  assert(Number.isSafeInteger(afterF4) && afterF4 >= 0 && afterF4 !== domain.QN_TERMINAL_WIN, `${replyName} F4 unexpectedly terminal/invalid`);
  assert.equal(e.rank(afterF4), 9, `${replyName} after F4 rank drift`);
  assert.equal(e.terminalActions(afterF4, 1).length, 0, `${replyName} P1 terminal override after F4`);
  assert(new Set(e.enabledSingletons(afterF4, 0)).has(F5), `${replyName} F5 singleton threat missing after F4`);

  let block = null;
  const replies = [];
  for (const p1 of e.legal(afterF4)) {
    const p1Cell = e.landing(afterF4, p1);
    const afterP1 = kernel.advance(afterF4, p1);
    assert(afterP1 !== domain.QN_TERMINAL_WIN, `${replyName} P1 terminal ${e.coord(p1Cell)} after F4`);
    assert(Number.isSafeInteger(afterP1) && afterP1 >= 0, `${replyName} invalid P1 reply after F4`);
    assert.equal(e.rank(afterP1), 10, `${replyName} post-F4 reply rank drift`);
    if (p1Cell === F5) {
      block = afterP1;
      replies.push({ reply: e.col(p1), replyCell: e.coord(p1Cell), route: 'forced_F5_block' });
      continue;
    }
    const terminals = e.terminalActions(afterP1, 0);
    assert(terminals.some((x) => x.cell === F5), `${replyName} nonblock ${e.coord(p1Cell)} failed to expose P0:F5 terminal`);
    replies.push({ reply: e.col(p1), replyCell: e.coord(p1Cell), route: 'nonblock_exposes_P0_F5_terminal' });
  }
  assert(block !== null, `${replyName} forced F5 block missing`);
  const blockSequence = childSequence + '66';
  assert.equal(block, replay(kernel, blockSequence), `${replyName} F5 block sequence drift`);

  const postBlockActions = [];
  for (const p0 of e.legal(block)) {
    const cell = e.landing(block, p0);
    const afterP0 = kernel.advance(block, p0);
    if (afterP0 === domain.QN_TERMINAL_WIN) {
      postBlockActions.push({ action: e.col(p0), actionCell: e.coord(cell), route: 'immediate_P0_terminal' });
      continue;
    }
    assert(Number.isSafeInteger(afterP0) && afterP0 >= 0, `${replyName} postblock ${e.col(p0)} invalid`);
    assert.equal(e.rank(afterP0), 11, `${replyName} postblock ${e.col(p0)} rank drift`);
    postBlockActions.push({
      action: e.col(p0),
      actionCell: e.coord(cell),
      route: 'nonterminal',
      phaseAfter: phase(e, afterP0),
      P0SingletonsAfter: e.enabledSingletons(afterP0, 0).map(e.coord),
      P1ObligationsAfter: e.enabledSingletons(afterP0, 1).map(e.coord),
      P1TerminalActionsAfter: e.terminalActions(afterP0, 1).map((x) => e.coord(x.cell)),
    });
  }

  cases.push({
    reply: replyName,
    childSequence,
    witness: 'F4',
    replies,
    forcedBlockSequence: blockSequence,
    postBlock: {
      phase: phase(e, block),
      P0TerminalActions: e.terminalActions(block, 0).map((x) => e.coord(x.cell)),
      P0Singletons: e.enabledSingletons(block, 0).map(e.coord),
      P1Obligations: e.enabledSingletons(block, 1).map(e.coord),
      legalP0Actions: e.legal(block).map(e.col),
      actions: postBlockActions,
    },
  });
}

console.log(`RANK7_FORCED_F5_HANDOFF=${JSON.stringify({
  kind: 'standard7x6-rank7-forced-f5-handoff-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  parent: PARENT,
  coveredReplies: CASES.map(([x]) => x),
  cases,
  provedForcedHandoffCount: cases.length,
  theoremBoundary: 'For exact rank7 P1 replies A/B/C/D/G only, P0:F4 creates exact singleton F5 with no P1 terminal override; every P1 non-F5 response exposes immediate P0:F5 terminal, so F5 is the unique survival block. Post-block children are diagnostic only and are not promoted by this theorem. No sibling equivalence, symmetry, phase-only inference, solved W/D/L premise, or cap widening is used.',
})}`);
