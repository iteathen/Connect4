#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const PARENT = '4665655';
const KNOWN_E_CHILD = '46656555';
const E = 4;

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

const rows = [];
for (const reply of e.legal(root)) {
  const replyCell = e.landing(root, reply);
  const child = kernel.advance(root, reply);
  const letter = e.col(reply);
  const sequence = PARENT + String(reply + 1);
  if (child === domain.QN_TERMINAL_WIN) {
    rows.push({
      reply: letter,
      replyCell: e.coord(replyCell),
      sequence,
      route: 'P1_terminal_from_rank7_parent',
      knownRank8Child: false,
    });
    continue;
  }
  assert(Number.isSafeInteger(child) && child >= 0, `${letter} child invalid`);
  assert.equal(e.rank(child), 8, `${letter} child rank drift`);
  assert.equal(child, replay(kernel, sequence), `${letter} child sequence identity drift`);

  const actions = [];
  for (const action of e.legal(child)) {
    const actionCell = e.landing(child, action);
    const afterP0 = kernel.advance(child, action);
    if (afterP0 === domain.QN_TERMINAL_WIN) {
      actions.push({
        action: e.col(action),
        actionCell: e.coord(actionCell),
        route: 'immediate_P0_terminal',
      });
      continue;
    }
    assert(Number.isSafeInteger(afterP0) && afterP0 >= 0, `${letter}/${e.col(action)} action child invalid`);
    assert.equal(e.rank(afterP0), 9, `${letter}/${e.col(action)} action rank drift`);
    actions.push({
      action: e.col(action),
      actionCell: e.coord(actionCell),
      route: 'nonterminal',
      phaseAfter: phase(e, afterP0),
      P0SingletonsAfter: e.enabledSingletons(afterP0, 0).map(e.coord),
      P1ObligationsAfter: e.enabledSingletons(afterP0, 1).map(e.coord),
      P1TerminalActionsAfter: e.terminalActions(afterP0, 1).map((x) => e.coord(x.cell)),
    });
  }

  const knownRank8Child = reply === E;
  if (knownRank8Child) assert.equal(child, replay(kernel, KNOWN_E_CHILD), 'rank7 E child identity drift');
  rows.push({
    reply: letter,
    replyCell: e.coord(replyCell),
    sequence,
    route: knownRank8Child ? 'exact_known_rank8_child_identity' : 'unclassified_child',
    knownRank8Child,
    phase: phase(e, child),
    P0TerminalActions: e.terminalActions(child, 0).map((x) => e.coord(x.cell)),
    P0Singletons: e.enabledSingletons(child, 0).map(e.coord),
    P1Obligations: e.enabledSingletons(child, 1).map(e.coord),
    legalP0Actions: e.legal(child).map(e.col),
    actions,
  });
}

assert.equal(rows.length, 7, 'rank7 P1 horizon must contain seven legal replies');
assert.deepEqual(rows.map((x) => x.reply), ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'rank7 reply order/coverage drift');
assert.equal(rows.filter((x) => x.knownRank8Child).length, 1, 'expected exactly one exact E child tag');

console.log(`RANK7_REPLY_HORIZON_DIAGNOSTIC=${JSON.stringify({
  kind: 'standard7x6-rank7-reply-horizon-diagnostic-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  parent: PARENT,
  sideToMove: 'P1',
  knownReply: 'E',
  knownChildSequence: KNOWN_E_CHILD,
  rows,
  theoremBoundary: 'Diagnostic only. Enumerates exact rank7 P1 children and immediate P0 action surfaces. The E child is tagged solely by exact sequence identity with 46656555; no P0-winning consequence is consumed here. No symmetry, phase-only forcing, solved W/D/L labels, implicit frame rule, or recursive proof is used.',
})}`);
