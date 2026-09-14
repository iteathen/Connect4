#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6;
const C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const MAX_PROOF_STATES = 100000;
const PROBE = fileURLToPath(new URL('./quotient-standard7x6-expired-response-rho-probe.mjs', import.meta.url));
const REPAIR_ACTIONS = Object.freeze(['A', 'B', 'D', 'E', 'F']);

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
function targetName(target) { return target === C3 ? 'C3' : 'G3'; }
function resolvedActionName(target) { return target === C3 ? 'G' : 'C'; }

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
// Observation/terminal helper only. Recursive proof is delegated to fresh rho-probe processes.
const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });

function runRhoProbe(sequence, target, rootAction) {
  const child = spawnSync(process.execPath, [PROBE, sequence, targetName(target), rootAction], {
    encoding: 'utf-8',
    timeout: 270000,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  if (child.status !== 0) {
    return {
      sequence,
      target: targetName(target),
      rootAction,
      proved: false,
      kind: 'probe_process_error',
      error: (child.stderr ?? '').slice(-8000),
    };
  }
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('EXPIRED_RESPONSE_RHO_PROBE='));
  if (!line) {
    return {
      sequence,
      target: targetName(target),
      rootAction,
      proved: false,
      kind: 'probe_output_missing',
      error: (child.stdout ?? '').slice(-8000),
    };
  }
  return JSON.parse(line.slice('EXPIRED_RESPONSE_RHO_PROBE='.length));
}

function isolatedRhoProof(sequence, target) {
  const actionOrder = [resolvedActionName(target), ...REPAIR_ACTIONS.filter((x) => x !== resolvedActionName(target))];
  const attempts = [];
  for (const action of actionOrder) {
    const result = runRhoProbe(sequence, target, action);
    attempts.push(result);
    if (result.proved) {
      return {
        proved: true,
        kind: 'root_action_isolated_rho',
        sequence,
        target: targetName(target),
        witness: result.witness ?? action,
        witnessKind: result.witnessKind ?? result.kind,
        selectedRootAction: action,
        selected: result,
        attempts,
      };
    }
  }
  return {
    proved: false,
    kind: 'no_isolated_rho_root_action',
    sequence,
    target: targetName(target),
    attempts,
  };
}

function forceOneTargetThenRho(state, stateSequence, attackCol, attackTarget, otherTarget) {
  assert.equal(e.rank(state) & 1, 0, 'handoff root must be P0 turn');
  assert.equal(e.singleton(state, 0, attackTarget), true);
  assert.equal(e.singleton(state, 0, otherTarget), true);
  assert.equal(e.targetDistance(state, attackTarget), 1);
  assert.equal(e.targetDistance(state, otherTarget), 1);

  const supportCell = e.landing(state, attackCol);
  assert.equal(supportCell, attackTarget - 7, 'target support event not directly playable');
  const afterSupport = kernel.advance(state, attackCol);
  if (afterSupport === domain.QN_TERMINAL_WIN) {
    return { closed: true, attack: coord(attackTarget), supportEvent: coord(supportCell), route: 'P0_terminal_on_support', replies: [], rhoProof: null };
  }
  assert(afterSupport >= 0 && e.rank(afterSupport) === e.rank(state) + 1);
  assert.equal(e.landing(afterSupport, attackCol), attackTarget, 'target did not become directly playable');

  const replies = [];
  let closed = true;
  let rhoProof = null;
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

    assert.equal(e.singleton(child, 0, attackTarget), false, 'blocked target residual survived P1 ownership');
    const otherLive = e.singleton(child, 0, otherTarget);
    const otherDistance = otherLive ? e.targetDistance(child, otherTarget) : null;
    if (!otherLive || otherDistance !== 1) {
      closed = false;
      replies.push({ reply: col(reply), replyCell: coord(replyCell), route: 'block_destroyed_other_target', otherTarget: coord(otherTarget), otherLive, otherDistance });
      continue;
    }

    const digit = String(attackCol + 1);
    const probeSequence = stateSequence + digit + digit;
    rhoProof = isolatedRhoProof(probeSequence, otherTarget);
    if (!rhoProof.proved) {
      closed = false;
      replies.push({
        reply: col(reply), replyCell: coord(replyCell), route: 'rho_unproved_after_forced_block',
        blockedTarget: coord(attackTarget), remainingTarget: coord(otherTarget), rhoProof,
      });
      continue;
    }

    replies.push({
      reply: col(reply), replyCell: coord(replyCell), route: 'forced_block_to_isolated_rho',
      blockedTarget: coord(attackTarget), remainingTarget: coord(otherTarget), rhoProof,
    });
  }

  return {
    closed,
    attack: coord(attackTarget),
    supportEvent: coord(supportCell),
    route: closed ? 'dual_target_forced_block_rho_closed' : 'dual_target_forced_block_rho_open',
    replies,
    rhoProof,
  };
}

const afterRefusal = replay(kernel, ROOT + '32');
assert.equal(e.rank(afterRefusal), 14);
assert.equal(e.landing(afterRefusal, G), G, 'expired response cell G1 is not directly playable');
assert.equal(e.terminalActions(afterRefusal, 0).length, 0);

const afterSeize = kernel.advance(afterRefusal, G);
assert.notEqual(afterSeize, domain.QN_TERMINAL_WIN);
assert(afterSeize >= 0 && e.rank(afterSeize) === 15);
assert.equal(e.singleton(afterSeize, 0, C3), true);
assert.equal(e.singleton(afterSeize, 0, G3), true);
assert.equal(e.targetDistance(afterSeize, C3), 1);
assert.equal(e.targetDistance(afterSeize, G3), 1);

const branches = [];
let allClosed = true;
let isolatedProbeProcesses = 0;
for (const reply of e.legal(afterSeize)) {
  const replyCell = e.landing(afterSeize, reply);
  const child = kernel.advance(afterSeize, reply);
  const childSequence = ROOT + '327' + String(reply + 1);
  if (child === domain.QN_TERMINAL_WIN) {
    allClosed = false;
    branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'P1_terminal_after_G1_seizure' });
    continue;
  }
  assert(child >= 0 && e.rank(child) === 16);

  const immediate = e.terminalActions(child, 0);
  if (immediate.length) {
    branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'immediate_P0_terminal', terminalCells: immediate.map((x) => coord(x.cell)) });
    continue;
  }

  assert.equal(e.singleton(child, 0, C3), true, `${col(reply)}: C3 target died before dual-target handoff`);
  assert.equal(e.singleton(child, 0, G3), true, `${col(reply)}: G3 target died before dual-target handoff`);
  assert.equal(e.targetDistance(child, C3), 1, `${col(reply)}: C3 distance drift`);
  assert.equal(e.targetDistance(child, G3), 1, `${col(reply)}: G3 distance drift`);

  const attempts = [];
  const first = forceOneTargetThenRho(child, childSequence, C, C3, G3);
  if (first.rhoProof) isolatedProbeProcesses += first.rhoProof.attempts.length;
  attempts.push(first);
  let selected = first.closed ? first : null;
  if (!selected) {
    const second = forceOneTargetThenRho(child, childSequence, G, G3, C3);
    if (second.rhoProof) isolatedProbeProcesses += second.rhoProof.attempts.length;
    attempts.push(second);
    if (second.closed) selected = second;
  }

  if (!selected) {
    allClosed = false;
    branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'dual_target_rho_handoff_unresolved', mu: e.mu(child), heights: e.heights(child), attempts });
    continue;
  }

  branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'dual_target_rho_handoff', selectedAttack: selected.attack, handoff: selected, attempts });
}

console.log(`EXPIRED_RESPONSE_RHO_HANDOFF=${JSON.stringify({
  kind: 'standard7x6-expired-response-support-seizure-dual-target-rho-handoff-v3',
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
  executionIsolation: {
    isolatedRhoProbeProcesses,
    actionOrder: 'resolved-tail first, then A/B/D/E/F',
    reason: 'Each top-level rho candidate action runs in a fresh kernel; recursive descendants retain the complete rho calculus.',
    semanticIdentityImplied: false,
    proofStateCapPerProbe: MAX_PROOF_STATES,
    quotientStorage: { states: 262144, classes: 524288, chunksPerSlot: 131072 },
    quotientStorageBoundsChanged: false,
  },
  theoremBoundary: allClosed
    ? 'Exact B1-refusal consequence only. P0 occupies the expired G1 response cell. C2/G2 replies expose immediate C3/G3 terminals; every remaining off-subsystem P1 reply enters a dual distance-one target state where P0 can force one target block and hand the other target to the qualified rho=(delta,mu) resolved-tail induction. Rho top-level actions are execution-isolated only. This proves the exact refusal state is in W but does not generalize the refusal column, prove the latent root, imply q equality, or reset the expired deadline.'
    : 'Exact B1-refusal consequence only. Unclosed branches and all isolated rho action attempts are preserved as separators; failure/resource exhaustion is not loss and the expired deadline is never reset.',
  authority: 'Exact C4-0010 transitions/residuals and terminal certificates plus root-action-isolated invocations of the already-qualified resolved-tail rho=(delta,mu) proof engine under unchanged proof-state and quotient-storage bounds. No solved W/D/L label, external oracle premise, or unrestricted q-frontier recursion.',
})}`);
