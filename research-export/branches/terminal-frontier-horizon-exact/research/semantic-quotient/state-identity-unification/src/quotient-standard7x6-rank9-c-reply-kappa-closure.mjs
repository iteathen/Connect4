#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';
import { proveDistance2TargetSupportReentry } from './quotient-standard7x6-distance2-target-support-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const PARENT = '466565554';
const C = 2;
const D = 3;
const C3 = 2 * 7 + 2;
const G3 = 2 * 7 + 6;
const D4 = 3 * 7 + 3;
const MAX = 100000;

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

function isResourceFailure(error) {
  const message = String(error?.message ?? error);
  return message.includes('lex proof-state cap exceeded') || message.includes('reserved quotient state capacity exhausted');
}

const kernel = makeKernel();
const lex = createResolvedTailLexicographicProofEngine(kernel, { maxProofStates: MAX });
const e = lex.repair;
const cChildSequence = PARENT + '3';
const cChild = replay(kernel, cChildSequence);
assert.equal(e.rank(cChild), 10, 'rank9 C reply child rank drift');

const d3Cell = e.landing(cChild, D);
assert.equal(e.coord(d3Cell), 'D3', 'C branch D3 witness landing drift');
const afterD3 = kernel.advance(cChild, D);
assert(Number.isSafeInteger(afterD3) && afterD3 >= 0 && afterD3 !== domain.QN_TERMINAL_WIN, 'D3 unexpectedly terminal/invalid');
assert.equal(e.rank(afterD3), 11, 'after D3 rank drift');
assert.equal(e.terminalActions(afterD3, 1).length, 0, 'P1 terminal override after D3');
assert(new Set(e.enabledSingletons(afterD3, 0)).has(D4), 'D3 did not create exact D4 threat');

const d3Responses = [];
let d4Block = null;
for (const reply of e.legal(afterD3)) {
  const replyCell = e.landing(afterD3, reply);
  const child = kernel.advance(afterD3, reply);
  assert(child !== domain.QN_TERMINAL_WIN, `P1 terminal override ${e.coord(replyCell)} after D3`);
  assert(Number.isSafeInteger(child) && child >= 0, 'invalid D3 reply child');
  assert.equal(e.rank(child), 12, 'D3 reply rank drift');
  if (replyCell === D4) {
    d4Block = child;
    d3Responses.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'forced_D4_block' });
    continue;
  }
  const terminals = e.terminalActions(child, 0);
  assert(terminals.some((x) => x.cell === D4), `nonblock ${e.coord(replyCell)} failed to expose P0:D4 terminal`);
  d3Responses.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'nonblock_exposes_P0_D4_terminal' });
}
assert(d4Block !== null, 'forced D4 block child missing');
assert.equal(d4Block, replay(kernel, PARENT + '344'), 'forced D4 block exact-sequence drift');
assert.equal(e.singleton(d4Block, 0, C3), true, 'C3 singleton missing after D4 block');
assert.equal(e.targetDistance(d4Block, C3), 1, 'C3 support distance drift after D4 block');
assert.equal(e.singleton(d4Block, 0, G3), true, 'G3 singleton missing after D4 block');
assert.equal(e.targetDistance(d4Block, G3), 2, 'G3 support distance drift after D4 block');

const c2Cell = e.landing(d4Block, C);
assert.equal(e.coord(c2Cell), 'C2', 'C2 support witness landing drift');
const afterC2 = kernel.advance(d4Block, C);
assert(Number.isSafeInteger(afterC2) && afterC2 >= 0 && afterC2 !== domain.QN_TERMINAL_WIN, 'C2 unexpectedly terminal/invalid');
assert.equal(e.rank(afterC2), 13, 'after C2 rank drift');
assert.equal(e.terminalActions(afterC2, 1).length, 0, 'P1 terminal override after C2');
assert(new Set(e.enabledSingletons(afterC2, 0)).has(C3), 'C2 did not create exact C3 threat');

const c2Responses = [];
let c3Block = null;
for (const reply of e.legal(afterC2)) {
  const replyCell = e.landing(afterC2, reply);
  const child = kernel.advance(afterC2, reply);
  assert(child !== domain.QN_TERMINAL_WIN, `P1 terminal override ${e.coord(replyCell)} after C2`);
  assert(Number.isSafeInteger(child) && child >= 0, 'invalid C2 reply child');
  assert.equal(e.rank(child), 14, 'C2 reply rank drift');
  if (replyCell === C3) {
    c3Block = child;
    c2Responses.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'forced_C3_block' });
    continue;
  }
  const terminals = e.terminalActions(child, 0);
  assert(terminals.some((x) => x.cell === C3), `nonblock ${e.coord(replyCell)} failed to expose P0:C3 terminal`);
  c2Responses.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'nonblock_exposes_P0_C3_terminal' });
}
assert(c3Block !== null, 'forced C3 block child missing');
const c3BlockSequence = PARENT + '34433';
assert.equal(c3Block, replay(kernel, c3BlockSequence), 'forced C3 block exact-sequence drift');
assert.equal(e.singleton(c3Block, 0, G3), true, 'G3 singleton missing after C3 block');
assert.equal(e.targetDistance(c3Block, G3), 2, 'G3 support distance drift after C3 block');

let kappa = null;
let resourceFailure = null;
try {
  kappa = proveDistance2TargetSupportReentry(kernel, lex, c3Block, G3);
} catch (error) {
  if (!isResourceFailure(error)) throw error;
  resourceFailure = String(error?.message ?? error);
}

const proved = resourceFailure === null && kappa?.proved === true;
const summary = {
  kind: 'standard7x6-rank9-c-reply-kappa-closure-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  parent: PARENT,
  reply: 'C',
  cReplySequence: cChildSequence,
  witness: 'D3',
  d3Responses,
  forcedD4BlockSequence: PARENT + '344',
  secondWitness: 'C2',
  c2Responses,
  forcedC3BlockSequence: c3BlockSequence,
  survivingTarget: 'G3',
  survivingTargetDistance: e.targetDistance(c3Block, G3),
  kappa: kappa == null ? null : {
    proved: kappa.proved,
    kind: kappa.kind,
    witness: kappa.witness ?? null,
    witnessCell: kappa.witnessCell ?? null,
    witnessKind: kappa.witnessKind ?? null,
    routes: kappa.routes ?? null,
    firstFailure: kappa.firstFailure ?? null,
  },
  resourceFailure,
  lexStats: lex.stats(),
  proved,
  interpretation: proved
    ? 'The sole nontrivial rank9 C reply closes exactly: P0:D3 forces P1:D4; P0:C2 forces P1:C3; the surviving G3 distance-two contract then closes through the already-qualified target-support re-entry macro and distance-one lexicographic induction.'
    : resourceFailure !== null
      ? 'The exact C branch reached the unchanged execution resource boundary. Preserve this state and do not widen the cap.'
      : 'The planned D3 -> D4 -> C2 -> C3 -> distance-two G3 composition has an exact structural falsifier; preserve the reported helper failure rather than treating it as an opposite outcome.',
  theoremBoundary: 'This classifies only P1:C from rank9 parent 466565554. It uses exact tactical singleton/terminal certificates, exact forced-block sequences, and the previously qualified distance-two target-support and distance-one lexicographic theorems. No solved W/D/L premise, symmetry, q equality, implicit frame rule, or cap widening is used.',
};
console.log(`RANK9_C_REPLY_KAPPA_CLOSURE=${JSON.stringify(summary)}`);
if (!proved) process.exitCode = 2;
