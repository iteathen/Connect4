#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
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
  for (let c = 0; c < 7; c++) {
    const cell = landing(k, id, c);
    if (cell === 0xff) continue;
    const child = k.advance(id, c);
    if (child === domain.QN_TERMINAL_WIN) {
      assert(enabled.has(cell), `${player === 0 ? 'P0' : 'P1'} terminal ${coord(cell)} lacks enabled singleton premise`);
      out.push({ column: c, cell });
    }
  }
  return out;
}
function invariant(k, id, target) {
  return rank(k, id) % 2 === 0 && singleton(k, id, 0, target) && targetDistance(k, id, target) === 1;
}

const { kernel: k } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
k.prepareSearchStorage();

// This is the same restricted well-founded predecessor schema qualified by
// quotient-standard7x6-repair-capacity-predecessor-induction.mjs. It is reapplied here
// only to exact rank-22 successors of the retained rank-20 latent-contract domain.
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
    const out = { proved: true, kind: 'immediate_P0_terminal', mu: m };
    proofMemo.set(key, out);
    return out;
  }
  if (!invariant(k, state, target)) {
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
    for (let reply = 0; reply < 7; reply++) {
      const replyCell = landing(k, afterP0, reply);
      if (replyCell === 0xff) continue;
      proofP1BranchesChecked++;
      const afterP1 = k.advance(afterP0, reply);
      if (afterP1 === domain.QN_TERMINAL_WIN) {
        accepted = false;
        rejection = { reply: col(reply), reason: 'P1_terminal' };
        break;
      }
      assert(afterP1 >= 0 && rank(k, afterP1) === rank(k, state) + 2);
      assert(mu(k, afterP1) <= m - 1, 'P1 reply increased mu');
      if (terminalActions(k, afterP1, 0).length) continue;
      const child = proveRepairInvariant(afterP1, target, depth + 1);
      if (!child.proved) {
        accepted = false;
        rejection = { reply: col(reply), reason: child.kind, childMu: child.mu };
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

const cases = [
  { name: 'C_resolved_P0_owned_C1', prefix: '3733', resolved: C, target: G3 },
  { name: 'C_resolved_P1_owned_C1', prefix: '7333', resolved: C, target: G3 },
  { name: 'G_resolved_P1_owned_G1', prefix: '3777', resolved: G, target: C3 },
  { name: 'G_resolved_P0_owned_G1', prefix: '7377', resolved: G, target: C3 },
];

const rank20 = [];
for (const c of cases) {
  const seq = ROOT + c.prefix + String(c.resolved + 1).repeat(3);
  const rank19 = replay(k, seq);
  assert.equal(rank(k, rank19), 19);
  for (const repair of REPAIRS) {
    const state = k.advance(rank19, repair);
    assert(state >= 0 && rank(k, state) === 20);
    assert(singleton(k, state, 0, c.target), `${c.name}:${col(repair)} lost remaining target singleton`);
    assert.equal(targetDistance(k, state, c.target), 1, `${c.name}:${col(repair)} target support distance changed`);
    rank20.push({ member: `${c.name}:${col(repair)}`, state, target: c.target, sourceRepair: repair });
  }
}
assert.equal(rank20.length, 20, 'expected exact retained 20-state rank-20 domain');

function classifyRank20Action(row, action) {
  const actionCell = landing(k, row.state, action);
  if (actionCell === 0xff) return { column: col(action), legal: false, accepted: false, reason: 'full' };
  const beforeMu = mu(k, row.state);
  const afterP0 = k.advance(row.state, action);
  if (afterP0 === domain.QN_TERMINAL_WIN) {
    return { column: col(action), cell: coord(actionCell), legal: true, accepted: true, kind: 'immediate_P0_terminal', beforeMu };
  }
  assert(afterP0 >= 0 && rank(k, afterP0) === 21);
  const replyRoutes = [];
  let accepted = true;
  let firstFailure = null;
  for (let reply = 0; reply < 7; reply++) {
    const replyCell = landing(k, afterP0, reply);
    if (replyCell === 0xff) continue;
    const afterP1 = k.advance(afterP0, reply);
    if (afterP1 === domain.QN_TERMINAL_WIN) {
      accepted = false;
      firstFailure ??= { reply: col(reply), replyCell: coord(replyCell), reason: 'P1_terminal' };
      replyRoutes.push({ reply: col(reply), replyCell: coord(replyCell), route: 'P1_terminal' });
      continue;
    }
    assert(afterP1 >= 0 && rank(k, afterP1) === 22);
    const immediate = terminalActions(k, afterP1, 0);
    if (immediate.length) {
      replyRoutes.push({ reply: col(reply), replyCell: coord(replyCell), route: 'immediate_P0_terminal', terminalColumns: immediate.map((x) => col(x.column)) });
      continue;
    }
    const child = proveRepairInvariant(afterP1, row.target);
    if (child.proved) {
      replyRoutes.push({ reply: col(reply), replyCell: coord(replyCell), route: 'repair_capacity_induction', childMu: child.mu, childWitness: child.witness ?? null });
      continue;
    }
    accepted = false;
    firstFailure ??= {
      reply: col(reply), replyCell: coord(replyCell), reason: child.kind,
      targetLive: child.targetLive ?? singleton(k, afterP1, 0, row.target),
      targetDistance: child.targetDistance ?? targetDistance(k, afterP1, row.target),
      childMu: child.mu,
    };
    replyRoutes.push({ reply: col(reply), replyCell: coord(replyCell), route: 'unproved', reason: child.kind, childMu: child.mu });
  }
  return {
    column: col(action), cell: coord(actionCell), legal: true, accepted,
    kind: accepted ? 'branch_complete_predecessor' : 'rejected',
    beforeMu, afterP0Mu: mu(k, afterP0),
    firstFailure, replyRoutes,
  };
}

const rows = [];
for (const state of rank20) {
  const actions = [];
  for (let action = 0; action < 7; action++) actions.push(classifyRank20Action(state, action));
  const witnesses = actions.filter((a) => a.accepted);
  rows.push({
    member: state.member,
    target: coord(state.target),
    sourceRepair: col(state.sourceRepair),
    mu: mu(k, state.state),
    closed: witnesses.length > 0,
    witnessColumns: witnesses.map((a) => a.column),
    witnessKinds: witnesses.map((a) => a.kind),
    rejected: actions.filter((a) => a.legal && !a.accepted).map((a) => ({ column: a.column, firstFailure: a.firstFailure })),
  });
}

const closed = rows.filter((r) => r.closed);
const failed = rows.filter((r) => !r.closed);
const witnessColumnCounts = {};
for (const r of closed) for (const c of r.witnessColumns) witnessColumnCounts[c] = (witnessColumnCounts[c] ?? 0) + 1;
const contextClosure = {};
for (const c of cases) {
  const group = rows.filter((r) => r.member.startsWith(`${c.name}:`));
  contextClosure[c.name] = { states: group.length, closed: group.filter((r) => r.closed).length };
}
const failureSamples = failed.slice(0, 8);

console.log(`LATENT_CONTRACT_BACKWARD_COMPOSITION=${JSON.stringify({
  kind: 'standard7x6-latent-contract-backward-composition-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  exactRank20States: rows.length,
  closedRank20States: closed.length,
  failedRank20States: failed.length,
  contextClosure,
  witnessColumnCounts,
  repairProofStates: proofStates,
  repairProofActionsChecked: proofActionsChecked,
  repairProofP1BranchesChecked: proofP1BranchesChecked,
  repairProofMaxDepth: maxDepth,
  repairProofStateCap: MAX_PROOF_STATES,
  closedRows: closed.map((r) => ({ member: r.member, target: r.target, mu: r.mu, witnessColumns: r.witnessColumns })),
  failureSamples,
  interpretation: failed.length === 0
    ? 'All 20 exact retained rank-20 latent-contract states have at least one branch-complete P0 predecessor witness. Every nonterminal P1 successor is discharged by an immediate P0 terminal certificate or the same well-founded repair-capacity induction.'
    : 'The latent-contract rank-20 domain is not yet closed. Preserve the reported exact state/action/reply failures as the next dependency-cone seam; do not broaden to an arbitrary frontier or infer global loss.',
  theoremBoundary: 'This closes only the exact retained 20 rank-20 latent-contract states when failedRank20States is zero. The repair induction is restricted to A/B/D/E/F and the live-singleton/support-distance-one invariant. This is not q equality, solved-WDL lookup, arbitrary frontier search, provenance equivalence, center-opening W membership, or a root solve.',
  authority: 'Exact C4-0010 support/residual transitions, enabled-singleton terminal certificates, and the explicit well-founded repair-capacity induction only; no external W/D/L labels, Bayesian confidence, or output-cardinality premise.',
})}`);
