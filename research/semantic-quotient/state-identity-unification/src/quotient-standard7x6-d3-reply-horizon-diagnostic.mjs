#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const PREDECESSOR = '4665655546';
const D = 3;
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
const root = replay(kernel, PREDECESSOR);
assert.equal(e.rank(root), 10);
const afterD3 = kernel.advance(root, D);
assert(Number.isSafeInteger(afterD3) && afterD3 >= 0 && afterD3 !== domain.QN_TERMINAL_WIN);
assert.equal(e.rank(afterD3), 11);

function phaseBits(state) {
  return e.heights(state).map((h) => h & 1).join('');
}
function cells(items) { return items.map(e.coord); }

const replies = [];
for (const reply of e.legal(afterD3)) {
  const replyCell = e.landing(afterD3, reply);
  const child = kernel.advance(afterD3, reply);
  if (child === domain.QN_TERMINAL_WIN) {
    replies.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'P1_terminal' });
    continue;
  }
  assert(Number.isSafeInteger(child) && child >= 0);
  assert.equal(e.rank(child), 12);
  const row = {
    reply: e.col(reply),
    replyCell: e.coord(replyCell),
    sequence: PREDECESSOR + '4' + String(reply + 1),
    phase: phaseBits(child),
    enabledP0Singletons: cells(e.enabledSingletons(child, 0)),
    enabledP1Singletons: cells(e.enabledSingletons(child, 1)),
    P0TerminalActions: e.terminalActions(child, 0).map((x) => e.coord(x.cell)),
    C3: {
      live: e.singleton(child, 0, C3),
      supportDistance: e.singleton(child, 0, C3) ? e.targetDistance(child, C3) : null,
      landing: e.coord(e.landing(child, C3 % 7)),
    },
    G3: {
      live: e.singleton(child, 0, G3),
      supportDistance: e.singleton(child, 0, G3) ? e.targetDistance(child, G3) : null,
      landing: e.coord(e.landing(child, G3 % 7)),
    },
    exactKnownRoute: reply === D ? 'qualified_latent_state_466565554644' : null,
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
    assert.equal(e.rank(afterP0), 13);
    row.actions.push({
      action: e.col(action),
      actionCell: e.coord(actionCell),
      route: 'nonterminal',
      phase: phaseBits(afterP0),
      P0Threats: cells(e.enabledSingletons(afterP0, 0)),
      P1Obligations: cells(e.enabledSingletons(afterP0, 1)),
      P1TerminalActions: e.terminalActions(afterP0, 1).map((x) => e.coord(x.cell)),
      C3Live: e.singleton(afterP0, 0, C3),
      G3Live: e.singleton(afterP0, 0, G3),
    });
  }
  replies.push(row);
}

assert.equal(replies.length, 7, 'expected all seven P1 replies after D3');
assert.equal(replies.some((r) => r.route === 'P1_terminal'), false, 'hinge gained an immediate P1 terminal reply');
const d4 = replies.find((r) => r.reply === 'D');
assert(d4 && d4.sequence === '466565554644');

console.log(`D3_REPLY_HORIZON_DIAGNOSTIC=${JSON.stringify({
  kind: 'standard7x6-d3-reply-horizon-diagnostic-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  predecessor: PREDECESSOR,
  P0Candidate: 'D3',
  afterP0Sequence: PREDECESSOR + '4',
  replyCount: replies.length,
  replies,
  theoremBoundary: 'Diagnostic only. Enumerates the exact one-reply D3 horizon and one P0 action ply. At P0 nodes the opponent surface is represented by enabled P1 singleton obligations; P1 terminal actions are queried only after a P0 move makes P1 the side to move. D4 is tagged only because the exact child 466565554644 already has an independently qualified winning theorem. Other replies are not classified by analogy, phase, threat count, or action resemblance.',
  authority: 'Exact C4-0010 transitions, residual singleton predicates, support distances, phase observation, and terminal certificates. No solved-WDL premise, no symmetry, no unrestricted recursion.',
})}`);
