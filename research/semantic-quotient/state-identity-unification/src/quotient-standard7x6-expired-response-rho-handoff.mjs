#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const B = 1, C = 2, G = 6;
const C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const MAX_PROOF_STATES = 100000;

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

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const rho = createResolvedTailLexicographicProofEngine(kernel, { maxProofStates: MAX_PROOF_STATES });
const e = rho.repair;

function forceOneTargetThenRho(state, attackCol, attackTarget, otherTarget) {
  assert.equal(e.rank(state) & 1, 0, 'handoff root must be P0 turn');
  assert.equal(e.singleton(state, 0, attackTarget), true);
  assert.equal(e.singleton(state, 0, otherTarget), true);
  assert.equal(e.targetDistance(state, attackTarget), 1);
  assert.equal(e.targetDistance(state, otherTarget), 1);

  const supportCell = e.landing(state, attackCol);
  assert.equal(supportCell, attackTarget - 7, 'target support event not directly playable');
  const afterSupport = kernel.advance(state, attackCol);
  if (afterSupport === domain.QN_TERMINAL_WIN) {
    return { closed: true, attack: coord(attackTarget), supportEvent: coord(supportCell), route: 'P0_terminal_on_support', replies: [] };
  }
  assert(afterSupport >= 0 && e.rank(afterSupport) === e.rank(state) + 1);
  assert.equal(e.landing(afterSupport, attackCol), attackTarget, 'target did not become directly playable');

  const replies = [];
  let closed = true;
  for (const reply of e.legal(afterSupport)) {
    const replyCell = e.landing(afterSupport, reply);
    const child = kernel.advance(afterSupport, reply);
    if (child === domain.QN_TERMINAL_WIN) {
      closed = false;
      replies.push({ reply: col(reply), replyCell: coord(replyCell), route: 'P1_terminal_override' });
      continue;
    }
    assert(child >= 0 && e.rank(child) === e.rank(state) + 2);

    if (replyCell !== attackTarget) {
      const win = e.terminalActions(child, 0).find((x) => x.cell === attackTarget);
      if (win) {
        replies.push({ reply: col(reply), replyCell: coord(replyCell), route: 'nonblock_exposes_P0_target_terminal', terminalCell: coord(attackTarget) });
        continue;
      }
      closed = false;
      replies.push({ reply: col(reply), replyCell: coord(replyCell), route: 'nonblock_without_target_terminal' });
      continue;
    }

    assert.equal(e.singleton(child, 0, attackTarget), false, 'blocked target residual survived ownership by P1');
    const otherLive = e.singleton(child, 0, otherTarget);
    const otherDistance = otherLive ? e.targetDistance(child, otherTarget) : null;
    if (!otherLive || otherDistance !== 1) {
      closed = false;
      replies.push({
        reply: col(reply), replyCell: coord(replyCell), route: 'block_destroyed_other_target',
        otherTarget: coord(otherTarget), otherLive, otherDistance,
      });
      continue;
    }

    const proof = rho.prove(child, otherTarget);
    if (!proof.proved) {
      closed = false;
      replies.push({
        reply: col(reply), replyCell: coord(replyCell), route: 'rho_unproved_after_forced_block',
        blockedTarget: coord(attackTarget), remainingTarget: coord(otherTarget),
        measure: proof.measure, kind: proof.kind, rejected: proof.rejected ?? [],
      });
      continue;
    }

    replies.push({
      reply: col(reply), replyCell: coord(replyCell), route: 'forced_block_to_rho',
      blockedTarget: coord(attackTarget), remainingTarget: coord(otherTarget),
      measure: proof.measure, witness: proof.witness ?? null, witnessKind: proof.witnessKind ?? proof.kind,
    });
  }

  return {
    closed,
    attack: coord(attackTarget),
    supportEvent: coord(supportCell),
    route: closed ? 'dual_target_forced_block_rho_closed' : 'dual_target_forced_block_rho_open',
    replies,
  };
}

// Exact B1 refusal: P0:C1 creates the P1:G1 next-turn obligation; P1 spends
// that turn on B1. The old obligation is expired and never reset here.
const afterRefusal = replay(kernel, ROOT + '32');
assert.equal(e.rank(afterRefusal), 14);
assert.equal(e.landing(afterRefusal, G), G, 'expired response cell G1 is not directly playable');
assert.equal(e.terminalActions(afterRefusal, 0).length, 0);

// Replacement consequence: P0 seizes the expired response cell G1.
const afterSeize = kernel.advance(afterRefusal, G);
assert.notEqual(afterSeize, domain.QN_TERMINAL_WIN);
assert(afterSeize >= 0 && e.rank(afterSeize) === 15);
assert.equal(e.singleton(afterSeize, 0, C3), true);
assert.equal(e.singleton(afterSeize, 0, G3), true);
assert.equal(e.targetDistance(afterSeize, C3), 1);
assert.equal(e.targetDistance(afterSeize, G3), 1);

const branches = [];
let allClosed = true;
for (const reply of e.legal(afterSeize)) {
  const replyCell = e.landing(afterSeize, reply);
  const child = kernel.advance(afterSeize, reply);
  if (child === domain.QN_TERMINAL_WIN) {
    allClosed = false;
    branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'P1_terminal_after_G1_seizure' });
    continue;
  }
  assert(child >= 0 && e.rank(child) === 16);

  const immediate = e.terminalActions(child, 0);
  if (immediate.length) {
    branches.push({
      reply: col(reply), replyCell: coord(replyCell), route: 'immediate_P0_terminal',
      terminalCells: immediate.map((x) => coord(x.cell)),
    });
    continue;
  }

  assert.equal(e.singleton(child, 0, C3), true, `${col(reply)}: C3 target died before dual-target handoff`);
  assert.equal(e.singleton(child, 0, G3), true, `${col(reply)}: G3 target died before dual-target handoff`);
  assert.equal(e.targetDistance(child, C3), 1, `${col(reply)}: C3 distance drift`);
  assert.equal(e.targetDistance(child, G3), 1, `${col(reply)}: G3 distance drift`);

  const handoffs = [
    forceOneTargetThenRho(child, C, C3, G3),
    forceOneTargetThenRho(child, G, G3, C3),
  ];
  const selected = handoffs.find((x) => x.closed) ?? null;
  if (!selected) {
    allClosed = false;
    branches.push({
      reply: col(reply), replyCell: coord(replyCell), route: 'dual_target_rho_handoff_unresolved',
      mu: e.mu(child), heights: e.heights(child), handoffs,
    });
    continue;
  }

  branches.push({
    reply: col(reply), replyCell: coord(replyCell), route: 'dual_target_rho_handoff',
    selectedAttack: selected.attack, handoff: selected,
    alternativeHandoff: handoffs.find((x) => x !== selected) ?? null,
  });
}

console.log(`EXPIRED_RESPONSE_RHO_HANDOFF=${JSON.stringify({
  kind: 'standard7x6-expired-response-support-seizure-dual-target-rho-handoff-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  exactRefusalState: ROOT + '32',
  expiredObligation: 'P0:C1 -> P1:G1 by next_P1_turn',
  obligationDisposition: 'expired_unsatisfied at P1:B1; never reset',
  P0ConsequenceWitness: 'G1',
  sequenceAfterSeizure: ROOT + '327',
  branchCount: branches.length,
  branches,
  allClosed,
  promotedConsequence: allClosed ? `${ROOT}32 in W via P0:G1` : null,
  rhoStats: rho.stats(),
  rhoProofStateCap: MAX_PROOF_STATES,
  theoremBoundary: allClosed
    ? 'Exact B1-refusal consequence only. P0 occupies the expired G1 response cell. C2/G2 replies expose immediate C3/G3 terminals; every remaining off-subsystem P1 reply enters a dual distance-one target state where P0 can force one target block and hand the other target to the qualified rho=(delta,mu) resolved-tail induction. This proves the exact refusal state is in W but does not generalize the refusal column, prove the latent root, imply q equality, or reset the expired deadline.'
    : 'Exact B1-refusal consequence only. Unclosed branches are preserved as unknown separators; failure is not loss and the expired deadline is never reset.',
  authority: 'Exact C4-0010 transitions/residuals and terminal certificates plus the already-qualified resolved-tail rho=(delta,mu) proof engine under its unchanged 100000-state cap. No solved W/D/L label, external oracle premise, or unrestricted q-frontier recursion.',
})}`);
