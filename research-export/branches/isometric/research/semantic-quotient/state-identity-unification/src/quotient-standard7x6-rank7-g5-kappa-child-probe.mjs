#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createTargetDistanceLexicographicProofEngine } from './quotient-standard7x6-target-distance-lexicographic-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const START = '466565576643';
const G = 6;
const G5 = 4 * 7 + 6;
const replyName = process.env.REPLY;
const rootActionName = process.env.ACTION ?? null;
assert(/^[A-G]$/.test(replyName ?? ''), `bad REPLY ${replyName}`);
if (rootActionName !== null) assert(/^[A-G]$/.test(rootActionName), `bad ACTION ${rootActionName}`);
const reply = replyName.charCodeAt(0) - 65;
const rootAction = rootActionName === null ? null : rootActionName.charCodeAt(0) - 65;

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
  if (message.includes('target-distance proof-state cap exceeded') || message.includes('lex proof-state cap exceeded')) return 'proof_capacity';
  return 'execution_error';
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const engine = createTargetDistanceLexicographicProofEngine(kernel, {
  maxProofStates: 100000,
  maxTargetDistance: 4,
  ...(rootAction === null ? {} : { rootActions: [rootAction] }),
});
const e = engine.repair;
const state = replay(kernel, START);
assert.equal(e.singleton(state, 0, G5), true);
assert.equal(e.targetDistance(state, G5), 3);
assert.equal(e.coord(e.landing(state, G)), 'G2');
const afterG = kernel.advance(state, G);
assert(Number.isSafeInteger(afterG) && afterG >= 0 && afterG !== domain.QN_TERMINAL_WIN);
assert.equal(e.rank(afterG), 13);
assert.equal(e.terminalActions(afterG, 1).length, 0, 'P1 terminal override after root G support');
const legalReplies = new Set(e.legal(afterG));
assert(legalReplies.has(reply), `P1:${replyName} not legal after root G support`);
const replyCell = e.landing(afterG, reply);
const child = kernel.advance(afterG, reply);

let result;
if (child === domain.QN_TERMINAL_WIN) {
  assert(new Set(e.enabledSingletons(afterG, 1)).has(replyCell), 'P1 terminal lacks singleton premise');
  result = {
    proved: false,
    proofKind: 'P1_terminal',
    exactLossForRootGRoute: true,
    reply: replyName,
    replyCell: e.coord(replyCell),
  };
} else {
  assert(Number.isSafeInteger(child) && child >= 0);
  assert.equal(e.rank(child), 14);
  const immediate = e.terminalActions(child, 0);
  if (immediate.length) {
    result = {
      proved: true,
      proofKind: 'immediate_P0_terminal',
      reply: replyName,
      replyCell: e.coord(replyCell),
      terminalCells: immediate.map((x) => e.coord(x.cell)),
    };
  } else {
    const targetLive = e.singleton(child, 0, G5);
    const targetDistance = targetLive ? e.targetDistance(child, G5) : null;
    let proof = null;
    let error = null;
    if (targetLive && targetDistance >= 1 && targetDistance <= 4) {
      try {
        proof = engine.prove(child, G5);
      } catch (err) {
        error = { kind: classifyError(err), message: String(err?.message ?? err) };
      }
    }
    result = {
      proved: proof?.proved === true,
      proofKind: proof?.kind ?? (targetLive ? (error?.kind ?? 'unproved') : 'target_not_live'),
      reply: replyName,
      replyCell: e.coord(replyCell),
      childSequence: START + '7' + String(reply + 1),
      targetLive,
      targetDistance,
      measure: targetLive ? engine.measure(child, G5) : null,
      obligations: e.enabledSingletons(child, 1).map(e.coord),
      witness: proof?.witness ?? null,
      witnessKind: proof?.witnessKind ?? null,
      forcedObligation: proof?.forcedObligation ?? null,
      rejected: (proof?.rejected ?? []).slice(0, 12),
      error,
    };
  }
}

console.log(`RANK7_G5_KAPPA_CHILD_PROBE=${JSON.stringify({
  kind: 'standard7x6-rank7-g5-kappa-child-probe-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  startSequence: START,
  rootWitness: 'G2',
  reply: replyName,
  rootAction: rootActionName,
  ...result,
  stats: engine.stats(),
  theoremBoundary: 'One exact P1 reply after the G2 target-support action at 466565576643 is isolated in a fresh kernel. Optional ACTION restricts only the child proof root action; recursive descendants retain the complete enabled higher-distance kappa calculus. Resource isolation is execution hygiene only; limits are unchanged.',
})}`);
if (result.error?.kind === 'execution_error') process.exitCode = 2;
