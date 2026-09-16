#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const BLOCK = '46656555434433';
const G = 6;
const G3 = 2 * 7 + 6;
const replyName = process.env.REPLY;
const actionName = process.env.ACTION ?? null;
assert(/^[A-G]$/.test(replyName ?? ''), `bad reply ${replyName}`);
if (actionName !== null) assert(/^[A-G]$/.test(actionName), `bad action ${actionName}`);
const reply = replyName.charCodeAt(0) - 65;
const rootAction = actionName === null ? null : actionName.charCodeAt(0) - 65;

function makeKernel() {
  const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
    cacheEdges: true,
    prefixClasses: 4096,
    responseClosure: true,
    searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
  });
  kernel.prepareSearchStorage();
  return kernel;
}
function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    id = next;
  }
  return id;
}
function classifyError(error) {
  const message = String(error?.message ?? error);
  if (message.includes('reserved quotient state capacity exhausted')) return 'quotient_capacity';
  if (message.includes('lex proof-state cap exceeded')) return 'proof_capacity';
  return 'execution_error';
}

const kernel = makeKernel();
const engine = createResolvedTailLexicographicProofEngine(kernel, {
  maxProofStates: 100000,
  ...(rootAction === null ? {} : { rootActions: [rootAction] }),
});
const e = engine.repair;
const state = replay(kernel, BLOCK);
assert.equal(e.rank(state), 14);
assert.equal(e.singleton(state, 0, G3), true);
assert.equal(e.targetDistance(state, G3), 2);
const g1 = e.landing(state, G);
assert.equal(e.coord(g1), 'G1');
const afterG1 = kernel.advance(state, G);
assert(Number.isSafeInteger(afterG1) && afterG1 >= 0 && afterG1 !== domain.QN_TERMINAL_WIN);
assert.equal(e.rank(afterG1), 15);

const legal = new Set(e.legal(afterG1));
assert(legal.has(reply), `reply ${replyName} not legal after G1`);
const replyCell = e.landing(afterG1, reply);
const child = kernel.advance(afterG1, reply);
let result;
if (child === domain.QN_TERMINAL_WIN) {
  assert(new Set(e.enabledSingletons(afterG1, 1)).has(replyCell), 'P1 terminal lacks enabled singleton premise');
  result = {
    proved: false,
    proofKind: 'P1_terminal',
    exactLossForP0Route: true,
    reply: replyName,
    replyCell: e.coord(replyCell),
  };
} else {
  assert(Number.isSafeInteger(child) && child >= 0);
  assert.equal(e.rank(child), 16);
  const immediate = e.terminalActions(child, 0);
  if (immediate.length) {
    result = {
      proved: true,
      proofKind: 'immediate_P0_terminal',
      reply: replyName,
      replyCell: e.coord(replyCell),
      terminalColumns: immediate.map((x) => e.col(x.column)),
    };
  } else if (!e.invariant(child, G3)) {
    result = {
      proved: false,
      proofKind: 'outside_distance1_invariant',
      reply: replyName,
      replyCell: e.coord(replyCell),
      targetLive: e.singleton(child, 0, G3),
      targetDistance: e.targetDistance(child, G3),
      obligations: e.enabledSingletons(child, 1).map(e.coord),
    };
  } else {
    let proof = null;
    let error = null;
    try {
      proof = engine.prove(child, G3);
    } catch (err) {
      error = String(err?.message ?? err);
      proof = { proved: false, kind: classifyError(err) };
    }
    result = {
      proved: proof.proved === true,
      proofKind: proof.kind,
      reply: replyName,
      replyCell: e.coord(replyCell),
      childSequence: BLOCK + '7' + String(reply + 1),
      measure: engine.measure(child, G3),
      obligations: engine.p1Obligations(child).map(e.coord),
      forcedDefense: proof.forcedDefense ?? null,
      witness: proof.witness ?? null,
      witnessKind: proof.witnessKind ?? null,
      rejected: (proof.rejected ?? []).slice(0, 12),
      error,
    };
  }
}

console.log(`RANK9_C_REPLY_KAPPA_CHILD_PROBE=${JSON.stringify({
  kind: 'standard7x6-rank9-c-reply-kappa-child-probe-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  blockSequence: BLOCK,
  supportWitness: 'G1',
  reply: replyName,
  rootAction: actionName,
  ...result,
  stats: engine.stats(),
  theoremBoundary: 'One exact P1 reply after P0:G1 at 46656555434433 is isolated in a fresh kernel. If ACTION is set, only that top-level rho action is isolated; recursive descendants retain the full qualified rho calculus. Resource isolation is execution hygiene only and does not widen proof-state or quotient-storage limits.',
})}`);
