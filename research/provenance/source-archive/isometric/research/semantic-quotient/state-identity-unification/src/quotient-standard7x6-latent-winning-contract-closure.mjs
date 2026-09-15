#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT_SEQUENCE = '466565554644';
const C = 2, G = 6, C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const REPAIRS = Object.freeze([0, 1, 3, 4, 5]); // A,B,D,E,F
const MAX_PROOF_STATES = 100000;

function replay(k, seq) {
  let id = k.rootId;
  for (const d of seq) {
    id = k.advance(id, Number(d) - 1);
    assert(Number.isSafeInteger(id) && id >= 0, `bad replay ${seq}`);
  }
  return id;
}
function rank(k, id) { return k.supportAccess.rankAt(k.states.supportAt(id)); }
function landing(k, id, c) { return k.supportAccess.landingAt(k.states.supportAt(id), c); }
function legal(k, id) {
  const out = [];
  for (let c = 0; c < 7; c++) if (landing(k, id, c) !== 0xff) out.push(c);
  return out;
}
function heights(k, id) {
  const out = [];
  for (let c = 0; c < 7; c++) {
    const x = landing(k, id, c);
    out.push(x === 0xff ? 6 : Math.floor(x / 7));
  }
  return out;
}
function capacity(k, id, c) { return 6 - heights(k, id)[c]; }
function mu(k, id) { return REPAIRS.reduce((s, c) => s + capacity(k, id, c), 0); }
function col(c) { return String.fromCharCode(65 + c); }
function coord(x) { return `${col(x % 7)}${Math.floor(x / 7) + 1}`; }
function has([lo, hi], x) { return x < 32 ? (((lo >>> x) & 1) !== 0) : (((hi >>> (x - 32)) & 1) !== 0); }
function cells(term) { const out = []; for (let x = 0; x < 42; x++) if (has(term, x)) out.push(x); return out; }
function terms(k, id, player) {
  const q = player === 0 ? k.states.p0At(id) : k.states.p1At(id);
  return k.classes.terms(q).map(cells);
}
function singleton(k, id, player, x) { return terms(k, id, player).some((t) => t.length === 1 && t[0] === x); }
function enabledSingletons(k, id, player) {
  return terms(k, id, player)
    .filter((t) => t.length === 1)
    .map((t) => t[0])
    .filter((x) => landing(k, id, x % 7) === x)
    .sort((a, b) => a - b);
}
function targetDistance(k, id, target) { return Math.max(0, 2 - heights(k, id)[target % 7]); }
function terminalActions(k, id, player) {
  const enabled = new Set(enabledSingletons(k, id, player));
  const out = [];
  for (const c of legal(k, id)) {
    const cell = landing(k, id, c);
    const child = k.advance(id, c);
    if (child === domain.QN_TERMINAL_WIN) {
      assert(enabled.has(cell), `${player === 0 ? 'P0' : 'P1'} terminal ${coord(cell)} lacks enabled-singleton premise`);
      out.push({ column: c, cell });
    }
  }
  return out;
}
function repairInvariant(k, id, target) {
  return rank(k, id) % 2 === 0 && singleton(k, id, 0, target) && targetDistance(k, id, target) === 1;
}

const { kernel: k } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
k.prepareSearchStorage();

const proofMemo = new Map();
let proofStates = 0;
let proofActionsChecked = 0;
let proofP1BranchesChecked = 0;
let maxDepth = 0;
function proveRepairInvariant(state, target, depth = 0) {
  const key = `${state}:${target}`;
  if (proofMemo.has(key)) return proofMemo.get(key);
  proofStates++;
  maxDepth = Math.max(maxDepth, depth);
  if (proofStates > MAX_PROOF_STATES) throw new Error(`repair proof-state cap exceeded ${MAX_PROOF_STATES}`);
  assert.equal(rank(k, state) % 2, 0, 'repair proof node must be P0 turn');

  const m = mu(k, state);
  const immediate = terminalActions(k, state, 0);
  if (immediate.length) {
    const out = { proved: true, kind: 'immediate_P0_terminal', mu: m, terminalColumns: immediate.map((x) => col(x.column)) };
    proofMemo.set(key, out);
    return out;
  }
  if (!repairInvariant(k, state, target)) {
    const out = {
      proved: false,
      kind: 'outside_repair_invariant',
      mu: m,
      targetLive: singleton(k, state, 0, target),
      targetDistance: targetDistance(k, state, target),
    };
    proofMemo.set(key, out);
    return out;
  }

  const rejected = [];
  for (const action of REPAIRS) {
    const actionCell = landing(k, state, action);
    if (actionCell === 0xff) continue;
    proofActionsChecked++;
    const afterP0 = k.advance(state, action);
    if (afterP0 === domain.QN_TERMINAL_WIN) {
      const out = { proved: true, kind: 'repair_predecessor', mu: m, witness: col(action), witnessKind: 'P0_terminal_now' };
      proofMemo.set(key, out);
      return out;
    }
    assert(afterP0 >= 0 && rank(k, afterP0) === rank(k, state) + 1);
    assert.equal(mu(k, afterP0), m - 1, 'repair action did not strictly decrease mu');

    let accepted = true;
    let rejection = null;
    for (const reply of legal(k, afterP0)) {
      const replyCell = landing(k, afterP0, reply);
      proofP1BranchesChecked++;
      const afterP1 = k.advance(afterP0, reply);
      if (afterP1 === domain.QN_TERMINAL_WIN) {
        const p1Enabled = new Set(enabledSingletons(k, afterP0, 1));
        assert(p1Enabled.has(replyCell), `P1 terminal ${coord(replyCell)} lacks enabled-singleton premise`);
        accepted = false;
        rejection = { reply: col(reply), replyCell: coord(replyCell), reason: 'P1_terminal' };
        break;
      }
      assert(afterP1 >= 0 && rank(k, afterP1) === rank(k, state) + 2);
      assert(mu(k, afterP1) <= m - 1, 'P1 reply increased mu');
      if (terminalActions(k, afterP1, 0).length) continue;
      const child = proveRepairInvariant(afterP1, target, depth + 1);
      if (!child.proved) {
        accepted = false;
        rejection = { reply: col(reply), replyCell: coord(replyCell), reason: child.kind, childMu: child.mu };
        break;
      }
    }
    if (accepted) {
      const out = { proved: true, kind: 'repair_predecessor', mu: m, witness: col(action), witnessKind: 'repair_induction' };
      proofMemo.set(key, out);
      return out;
    }
    rejected.push({ action: col(action), ...rejection });
  }

  const out = { proved: false, kind: 'no_repair_predecessor', mu: m, rejected };
  proofMemo.set(key, out);
  return out;
}

// First composition boundary: exact one-target scheduler exits at rank 16.
const schedulerExits = [
  { name: 'C_resolved_P0_owned_C1', prefix: '3733', target: G3 },
  { name: 'C_resolved_P1_owned_C1', prefix: '7333', target: G3 },
  { name: 'G_resolved_P1_owned_G1', prefix: '3777', target: C3 },
  { name: 'G_resolved_P0_owned_G1', prefix: '7377', target: C3 },
];
const rank16Results = [];
for (const x of schedulerExits) {
  const state = replay(k, ROOT_SEQUENCE + x.prefix);
  assert.equal(rank(k, state), 16, `${x.name}: rank drift`);
  assert(singleton(k, state, 0, x.target), `${x.name}: remaining target singleton drift`);
  assert.equal(targetDistance(k, state, x.target), 1, `${x.name}: remaining target support-distance drift`);
  const proof = proveRepairInvariant(state, x.target);
  rank16Results.push({
    name: x.name,
    sequence: ROOT_SEQUENCE + x.prefix,
    target: coord(x.target),
    mu: mu(k, state),
    proved: proof.proved,
    kind: proof.kind,
    witness: proof.witness ?? null,
    rejected: proof.rejected ?? [],
  });
}

function immediateP0Route(state) {
  const wins = terminalActions(k, state, 0);
  return wins.length ? { route: 'immediate_P0_terminal', terminalColumns: wins.map((x) => col(x.column)) } : null;
}

// Second boundary: from the exact latent root, try either target as the first support action.
// This is a theorem-guided two-P0-move macro, not unrestricted search. The second support
// move is fixed in the same target column; every P1 deviation is enumerated exactly.
function analyzeTargetMacro(attackCol, attackTarget, otherTarget) {
  const root = replay(k, ROOT_SEQUENCE);
  assert.equal(rank(k, root), 12);
  assert(singleton(k, root, 0, C3) && singleton(k, root, 0, G3), 'latent-root singleton drift');
  assert.equal(targetDistance(k, root, attackTarget), 2, 'attack target support-distance drift');

  const firstCell = landing(k, root, attackCol);
  assert.notEqual(firstCell, 0xff);
  const afterP0First = k.advance(root, attackCol);
  if (afterP0First === domain.QN_TERMINAL_WIN) {
    return { attack: col(attackCol), closed: true, firstMoveTerminal: true, branches: [] };
  }
  assert(afterP0First >= 0 && rank(k, afterP0First) === 13);

  const branches = [];
  for (const reply1 of legal(k, afterP0First)) {
    const reply1Cell = landing(k, afterP0First, reply1);
    const afterP1First = k.advance(afterP0First, reply1);
    if (afterP1First === domain.QN_TERMINAL_WIN) {
      const p1Enabled = new Set(enabledSingletons(k, afterP0First, 1));
      assert(p1Enabled.has(reply1Cell), `first P1 terminal ${coord(reply1Cell)} lacks enabled-singleton premise`);
      branches.push({ reply1: col(reply1), reply1Cell: coord(reply1Cell), route: 'P1_terminal_after_first_support' });
      continue;
    }
    assert(afterP1First >= 0 && rank(k, afterP1First) === 14);

    const immediate = immediateP0Route(afterP1First);
    if (immediate) {
      branches.push({ reply1: col(reply1), reply1Cell: coord(reply1Cell), ...immediate });
      continue;
    }

    const secondCell = landing(k, afterP1First, attackCol);
    if (secondCell === 0xff) {
      branches.push({ reply1: col(reply1), reply1Cell: coord(reply1Cell), route: 'second_support_full' });
      continue;
    }
    const afterP0Second = k.advance(afterP1First, attackCol);
    if (afterP0Second === domain.QN_TERMINAL_WIN) {
      branches.push({ reply1: col(reply1), reply1Cell: coord(reply1Cell), route: 'P0_terminal_on_second_support' });
      continue;
    }
    assert(afterP0Second >= 0 && rank(k, afterP0Second) === 15);

    const reply2Rows = [];
    for (const reply2 of legal(k, afterP0Second)) {
      const reply2Cell = landing(k, afterP0Second, reply2);
      const afterP1Second = k.advance(afterP0Second, reply2);
      if (afterP1Second === domain.QN_TERMINAL_WIN) {
        const p1Enabled = new Set(enabledSingletons(k, afterP0Second, 1));
        assert(p1Enabled.has(reply2Cell), `second P1 terminal ${coord(reply2Cell)} lacks enabled-singleton premise`);
        reply2Rows.push({ reply2: col(reply2), reply2Cell: coord(reply2Cell), route: 'P1_terminal_after_second_support' });
        continue;
      }
      assert(afterP1Second >= 0 && rank(k, afterP1Second) === 16);

      const nextImmediate = immediateP0Route(afterP1Second);
      if (nextImmediate) {
        reply2Rows.push({ reply2: col(reply2), reply2Cell: coord(reply2Cell), ...nextImmediate });
        continue;
      }

      const attackStillLive = singleton(k, afterP1Second, 0, attackTarget);
      const otherLive = singleton(k, afterP1Second, 0, otherTarget);
      const otherDistance = otherLive ? targetDistance(k, afterP1Second, otherTarget) : null;
      if (otherLive && otherDistance === 1) {
        const proof = proveRepairInvariant(afterP1Second, otherTarget);
        reply2Rows.push({
          reply2: col(reply2), reply2Cell: coord(reply2Cell),
          route: proof.proved ? 'repair_capacity_induction' : 'repair_invariant_unproved',
          otherTarget: coord(otherTarget), otherDistance, repairMu: proof.mu,
          repairWitness: proof.witness ?? null, repairKind: proof.kind,
        });
        continue;
      }

      reply2Rows.push({
        reply2: col(reply2), reply2Cell: coord(reply2Cell),
        route: 'unresolved_contract_exit',
        attackTargetLive: attackStillLive,
        otherTargetLive: otherLive,
        otherTargetDistance: otherDistance,
        heights: heights(k, afterP1Second),
        enabledP0Singletons: enabledSingletons(k, afterP1Second, 0).map(coord),
        enabledP1Singletons: enabledSingletons(k, afterP1Second, 1).map(coord),
      });
    }

    const branchClosed = reply2Rows.every((r) => ['immediate_P0_terminal', 'repair_capacity_induction', 'P0_terminal_on_second_support'].includes(r.route));
    branches.push({
      reply1: col(reply1), reply1Cell: coord(reply1Cell), route: branchClosed ? 'second_support_macro_closed' : 'second_support_macro_open',
      secondSupportCell: coord(secondCell), reply2Rows,
    });
  }

  const fatalRoutes = new Set(['P1_terminal_after_first_support', 'second_support_full']);
  const closed = branches.every((b) => !fatalRoutes.has(b.route) && b.route !== 'second_support_macro_open');
  const unresolved = branches.flatMap((b) => b.reply2Rows ?? []).filter((r) => r.route === 'unresolved_contract_exit' || r.route === 'repair_invariant_unproved');
  const p1Terminal = branches.filter((b) => b.route === 'P1_terminal_after_first_support').length
    + branches.flatMap((b) => b.reply2Rows ?? []).filter((r) => r.route === 'P1_terminal_after_second_support').length;
  return {
    attack: col(attackCol), attackTarget: coord(attackTarget), otherTarget: coord(otherTarget),
    closed, branchCount: branches.length, unresolvedCount: unresolved.length, p1TerminalCount: p1Terminal,
    branches, unresolved,
  };
}

const attackC = analyzeTargetMacro(C, C3, G3);
const attackG = analyzeTargetMacro(G, G3, C3);
const rank16Proved = rank16Results.filter((x) => x.proved).length;
const rootClosedCandidates = [attackC, attackG].filter((x) => x.closed).map((x) => x.attack);

console.log(`LATENT_WINNING_CONTRACT_CLOSURE=${JSON.stringify({
  kind: 'standard7x6-latent-winning-contract-composition-control-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rootSequence: ROOT_SEQUENCE,
  rank16SchedulerExits: rank16Results,
  rank16SchedulerExitCount: rank16Results.length,
  rank16SchedulerExitsProvedByRepairInduction: rank16Proved,
  targetMacros: [attackC, attackG],
  rootClosedCandidateColumns: rootClosedCandidates,
  repairProofStates: proofStates,
  repairProofActionsChecked: proofActionsChecked,
  repairProofP1BranchesChecked: proofP1BranchesChecked,
  repairProofMaxDepth: maxDepth,
  repairProofStateCap: MAX_PROOF_STATES,
  interpretation: rootClosedCandidates.length
    ? 'At least one target-support macro closes every exact P1 branch into an immediate P0 terminal certificate or the well-founded repair-capacity induction. This licenses promotion of the fixed latent root to a guarded P0-winning predecessor contract, subject to review of the recorded branch certificates.'
    : 'The four canonical one-target scheduler exits may be repair-closed, but the fixed latent root still has exact target-macro exits outside the qualified repair invariant and/or P1 terminal overrides. Preserve those exits as the next theorem-composition seam; do not infer W membership yet.',
  theoremBoundary: 'This control tests only the exact fixed latent root and the four exact scheduler exits. Its P0 target macro is fixed to two same-column support actions and its recursive closure is restricted to A/B/D/E/F under the live-singleton/support-distance-one repair invariant. It is not q equality, solved-WDL lookup, arbitrary minimax/frontier search, provenance equivalence, center-opening W membership, or a root solve.',
  authority: 'Exact C4-0010 support/residual transitions, enabled-singleton terminal certificates, the target-support temporal macro, and the explicit well-founded repair-capacity induction only; no external W/D/L labels or recursive q-state values.',
})}`);
