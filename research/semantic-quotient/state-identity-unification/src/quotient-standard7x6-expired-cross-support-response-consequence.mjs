#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
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
function rank(kernel, id) { return kernel.supportAccess.rankAt(kernel.states.supportAt(id)); }
function landing(kernel, id, col) { return kernel.supportAccess.landingAt(kernel.states.supportAt(id), col); }
function colName(col) { return String.fromCharCode(65 + col); }
function coord(cell) { return `${colName(cell % 7)}${Math.floor(cell / 7) + 1}`; }
function legal(engine, id) { return engine.legal(id); }
function targetSnapshot(engine, id) {
  return {
    C3: { live: engine.singleton(id, 0, C3), supportDistance: engine.targetDistance(id, C3) },
    G3: { live: engine.singleton(id, 0, G3), supportDistance: engine.targetDistance(id, G3) },
  };
}
function phaseBits(engine, id) { return engine.heights(id).map((h) => h & 1).join(''); }
function terminalSurface(engine, id, player) {
  return {
    enabledSingletons: engine.enabledSingletons(id, player).map(coord),
    terminalActions: engine.terminalActions(id, player).map((x) => ({ column: colName(x.column), cell: coord(x.cell) })),
  };
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const engine = createRepairCapacityProofEngine(kernel, { maxProofStates: MAX_PROOF_STATES });

function dualTargetForcedHandoff(state, attackCol, attackTarget, otherTarget) {
  assert.equal(rank(kernel, state) & 1, 0, 'dual-target handoff must start on P0 turn');
  assert.equal(engine.singleton(state, 0, attackTarget), true, 'attack target not live');
  assert.equal(engine.singleton(state, 0, otherTarget), true, 'other target not live');
  assert.equal(engine.targetDistance(state, attackTarget), 1, 'attack target not distance one');
  assert.equal(engine.targetDistance(state, otherTarget), 1, 'other target not distance one');

  const supportCell = landing(kernel, state, attackCol);
  const expectedSupportCell = attackTarget - 7;
  if (supportCell !== expectedSupportCell) {
    return {
      attack: coord(attackTarget), closed: false, reason: 'attack_support_not_direct',
      supportCell: supportCell === 0xff ? null : coord(supportCell), expectedSupportCell: coord(expectedSupportCell),
    };
  }

  const afterSupport = kernel.advance(state, attackCol);
  if (afterSupport === domain.QN_TERMINAL_WIN) {
    return { attack: coord(attackTarget), supportEvent: coord(supportCell), closed: true, route: 'P0_terminal_on_support' };
  }
  assert(Number.isSafeInteger(afterSupport) && afterSupport >= 0);
  assert.equal(rank(kernel, afterSupport), rank(kernel, state) + 1);
  assert.equal(landing(kernel, afterSupport, attackCol), attackTarget, 'attack target did not become directly playable');

  const replies = [];
  let closed = true;
  for (const reply of legal(engine, afterSupport)) {
    const replyCell = landing(kernel, afterSupport, reply);
    const afterP1 = kernel.advance(afterSupport, reply);
    if (afterP1 === domain.QN_TERMINAL_WIN) {
      closed = false;
      replies.push({
        reply: colName(reply), replyCell: coord(replyCell), route: 'P1_terminal_override',
        enabledP1Singletons: engine.enabledSingletons(afterSupport, 1).map(coord),
      });
      continue;
    }
    assert(Number.isSafeInteger(afterP1) && afterP1 >= 0);
    assert.equal(rank(kernel, afterP1), rank(kernel, state) + 2);

    if (replyCell !== attackTarget) {
      const immediate = engine.terminalActions(afterP1, 0);
      const targetWin = immediate.find((x) => x.cell === attackTarget);
      if (targetWin) {
        replies.push({ reply: colName(reply), replyCell: coord(replyCell), route: 'nonblock_exposes_P0_target_terminal', terminalCell: coord(targetWin.cell) });
        continue;
      }
      closed = false;
      replies.push({
        reply: colName(reply), replyCell: coord(replyCell), route: 'nonblock_without_expected_terminal',
        p0TerminalSurface: terminalSurface(engine, afterP1, 0),
      });
      continue;
    }

    const otherLive = engine.singleton(afterP1, 0, otherTarget);
    const otherDistance = otherLive ? engine.targetDistance(afterP1, otherTarget) : null;
    if (!otherLive || otherDistance !== 1) {
      closed = false;
      replies.push({
        reply: colName(reply), replyCell: coord(replyCell), route: 'forced_block_destroyed_other_target_handoff',
        otherTarget: coord(otherTarget), otherLive, otherDistance,
      });
      continue;
    }

    const proof = engine.prove(afterP1, otherTarget);
    if (proof.proved) {
      replies.push({
        reply: colName(reply), replyCell: coord(replyCell), route: 'forced_target_block_to_repair_induction',
        blockedTarget: coord(attackTarget), remainingTarget: coord(otherTarget),
        repairMu: proof.mu, repairWitness: proof.witness ?? null, repairKind: proof.kind,
      });
      continue;
    }

    closed = false;
    replies.push({
      reply: colName(reply), replyCell: coord(replyCell), route: 'forced_target_block_repair_unproved',
      blockedTarget: coord(attackTarget), remainingTarget: coord(otherTarget),
      repairMu: proof.mu, repairKind: proof.kind,
      targetSnapshot: targetSnapshot(engine, afterP1), phaseBits: phaseBits(engine, afterP1),
    });
  }

  return {
    attack: coord(attackTarget), supportEvent: coord(supportCell), closed,
    route: closed ? 'dual_target_forced_block_handoff_closed' : 'dual_target_forced_block_handoff_open',
    replies,
  };
}

// Exact accepted scheduler activation: P0:C1 creates a P1:G1 response obligation
// whose causal deadline is the next P1 turn.
const afterC1 = replay(kernel, ROOT + '3');
assert.equal(rank(kernel, afterC1), 13);
assert.equal(landing(kernel, afterC1, B), B, 'B1 is not the exact refusal event');
assert.equal(landing(kernel, afterC1, G), G, 'G1 is not directly playable at deadline activation');
assert.equal(engine.singleton(afterC1, 0, C3), true);
assert.equal(engine.singleton(afterC1, 0, G3), true);

// P1 declines G1 on the exact deadline turn by playing B1.
const afterRefusal = kernel.advance(afterC1, B);
assert.notEqual(afterRefusal, domain.QN_TERMINAL_WIN, 'P1:B1 unexpectedly terminal');
assert(Number.isSafeInteger(afterRefusal) && afterRefusal >= 0);
assert.equal(rank(kernel, afterRefusal), 14);
assert.equal(landing(kernel, afterRefusal, G), G, 'G1 ceased to be directly playable after refusal');
assert.equal(engine.terminalActions(afterRefusal, 0).length, 0, 'refusal unexpectedly gives immediate P0 terminal before support seizure');

// Candidate refusal consequence: once P1 has spent the required response turn elsewhere,
// P0 may occupy the still-direct G1 event. This does NOT reset or satisfy the expired
// P1-response obligation; it replaces that expired contract with a new P0-owned support fact.
const seizeCell = landing(kernel, afterRefusal, G);
assert.equal(coord(seizeCell), 'G1');
const afterSeize = kernel.advance(afterRefusal, G);
const seizeIsTerminal = afterSeize === domain.QN_TERMINAL_WIN;

const branches = [];
let allRepliesClosed = seizeIsTerminal;
if (!seizeIsTerminal) {
  assert(Number.isSafeInteger(afterSeize) && afterSeize >= 0);
  assert.equal(rank(kernel, afterSeize), 15);
  assert.equal(coord(landing(kernel, afterSeize, G)), 'G2', 'P0:G1 did not advance the G support event to G2');
  assert.equal(engine.singleton(afterSeize, 0, C3), true, 'C3 residual died on P0:G1');
  assert.equal(engine.singleton(afterSeize, 0, G3), true, 'G3 residual died on P0:G1');
  assert.equal(engine.targetDistance(afterSeize, C3), 1, 'C3 support distance drifted after P0:G1');
  assert.equal(engine.targetDistance(afterSeize, G3), 1, 'G3 support distance did not become one after P0:G1');

  allRepliesClosed = true;
  for (const reply of legal(engine, afterSeize)) {
    const replyCell = landing(kernel, afterSeize, reply);
    const child = kernel.advance(afterSeize, reply);
    if (child === domain.QN_TERMINAL_WIN) {
      allRepliesClosed = false;
      branches.push({
        reply: colName(reply), replyCell: coord(replyCell), route: 'P1_terminal',
        enabledP1Singletons: engine.enabledSingletons(afterSeize, 1).map(coord),
      });
      continue;
    }
    assert(Number.isSafeInteger(child) && child >= 0);
    assert.equal(rank(kernel, child), 16);

    const immediateP0 = engine.terminalActions(child, 0);
    if (immediateP0.length) {
      branches.push({
        reply: colName(reply), replyCell: coord(replyCell), route: 'immediate_P0_terminal',
        terminalColumns: immediateP0.map((x) => colName(x.column)),
      });
      continue;
    }

    const targetAttempts = [];
    let proved = null;
    for (const target of [C3, G3]) {
      const live = engine.singleton(child, 0, target);
      const distance = live ? engine.targetDistance(child, target) : null;
      if (!live || distance !== 1) {
        targetAttempts.push({ target: coord(target), eligible: false, live, distance });
        continue;
      }
      const proof = engine.prove(child, target);
      targetAttempts.push({
        target: coord(target), eligible: true, proved: proof.proved, kind: proof.kind,
        mu: proof.mu, witness: proof.witness ?? null,
      });
      if (proof.proved) {
        proved = { target, proof };
        break;
      }
    }

    if (proved) {
      branches.push({
        reply: colName(reply), replyCell: coord(replyCell), route: 'repair_capacity_induction',
        target: coord(proved.target), mu: proved.proof.mu,
        witness: proved.proof.witness ?? null, witnessKind: proved.proof.witnessKind ?? proved.proof.kind,
        targetAttempts,
      });
      continue;
    }

    const handoffs = [
      dualTargetForcedHandoff(child, C, C3, G3),
      dualTargetForcedHandoff(child, G, G3, C3),
    ];
    const handoff = handoffs.find((x) => x.closed) ?? null;
    if (handoff) {
      branches.push({
        reply: colName(reply), replyCell: coord(replyCell), route: 'dual_target_forced_handoff',
        selectedAttack: handoff.attack, handoff, alternativeHandoff: handoffs.find((x) => x !== handoff) ?? null,
        targetAttempts,
      });
      continue;
    }

    allRepliesClosed = false;
    branches.push({
      reply: colName(reply), replyCell: coord(replyCell), route: 'unresolved_after_support_seizure',
      targetSnapshot: targetSnapshot(engine, child),
      p0TerminalSurface: terminalSurface(engine, child, 0),
      p1TerminalSurface: terminalSurface(engine, child, 1),
      mu: engine.mu(child), phaseBits: phaseBits(engine, child), targetAttempts, handoffs,
    });
  }
}

const consequenceKind = seizeIsTerminal
  ? 'immediate_P0_terminal_on_expired_response_cell'
  : allRepliesClosed
    ? 'expired_response_support_seizure_and_dual_target_handoff_predecessor'
    : 'support_seizure_not_yet_branch_complete';

console.log(`EXPIRED_CROSS_SUPPORT_RESPONSE_CONSEQUENCE=${JSON.stringify({
  kind: 'standard7x6-expired-cross-support-response-consequence-v2',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rootSequence: ROOT,
  deadlineActivation: {
    sequence: ROOT + '3', event: 'P0:C1', obligation: 'P1:G1', deadlineClock: 'P1_turn', remaining: 1,
  },
  refusal: {
    sequence: ROOT + '32', event: 'P1:B1', obligationDisposition: 'expired_unsatisfied', elapsedP1Turns: 1, remaining: 0,
    targetSnapshot: targetSnapshot(engine, afterRefusal), phaseBits: phaseBits(engine, afterRefusal),
    p0TerminalSurface: terminalSurface(engine, afterRefusal, 0),
  },
  candidateConsequence: {
    event: 'P0:G1', sequence: ROOT + '327', terminal: seizeIsTerminal,
    obligationDisposition: 'old P1:G1 response obligation remains expired; G1 is instead consumed by a new P0-owned support event',
    targetSnapshotAfterSeizure: seizeIsTerminal ? null : targetSnapshot(engine, afterSeize),
    phaseBitsAfterSeizure: seizeIsTerminal ? null : phaseBits(engine, afterSeize),
    p1TerminalSurfaceAfterSeizure: seizeIsTerminal ? null : terminalSurface(engine, afterSeize, 1),
  },
  dualTargetHandoffRule: 'When both P0 target singletons are live at support-distance one, P0 advances one target support. Any P1 nonblock is checked to expose that target as an immediate P0 terminal; the exact target block must leave the other target live at distance one and hand off to the qualified repair-capacity induction.',
  branchCount: branches.length,
  branches,
  allRepliesClosed,
  consequenceKind,
  repairProofStats: engine.stats(),
  repairProofStateCap: MAX_PROOF_STATES,
  theoremBoundary: allRepliesClosed
    ? 'Exact only for the B1 refusal after P0:C1 at the fixed latent state. The expired P1:G1 obligation remains expired. P0:G1 creates a new support-ownership consequence; every legal P1 reply is discharged by immediate P0 terminality, the existing repair-capacity induction, or a bounded dual-target forced-block handoff into that induction. This does not imply q equality, generalize to other refusal columns, or solve the latent/root position.'
    : 'Exact only for the B1 refusal after P0:C1 at the fixed latent state. The control preserves every unresolved post-seizure/dual-target branch explicitly; failure to close is unknown, not loss. The expired deadline is never reset.',
  authority: 'Exact C4-0010 transitions/residuals, enabled-singleton terminal certificates, the bounded dual-target forced-block macro, and the existing repair-capacity proof engine under its unchanged 100000-state cap. No solved W/D/L labels, external oracle premise, or unrestricted q-frontier recursion.',
})}`);
