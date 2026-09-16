#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import {
  createRepairCapacityProofEngine,
  STANDARD7X6_REPAIR_COLUMNS as REPAIRS,
} from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6, C3 = 16, G3 = 20;
const MAX_PROOF_STATES = 100000;

const NEGATIVE_COMPARATORS = Object.freeze([
  { sequence: '46656555464471777443', target: C3 },
  { sequence: '46656555464472777443', target: C3 },
  { sequence: '46656555464473777445', target: C3 },
  { sequence: '46656555464473777446', target: C3 },
  { sequence: '46656555464473777454', target: C3 },
  { sequence: '46656555464473777565', target: C3 },
  { sequence: '46656555464436333657', target: G3 },
  { sequence: '46656555464435333667', target: G3 },
  { sequence: '46656555464434333667', target: G3 },
  { sequence: '46656555464432333667', target: G3 },
  { sequence: '46656555464431333667', target: G3 },
  { sequence: '46656555464431333575', target: G3 },
]);

const POSITIVE_CASES = Object.freeze([
  { name: 'C_resolved_P0_owned_C1', prefix: '3733', resolved: C, target: G3, adjacentTail: 5 },
  { name: 'C_resolved_P1_owned_C1', prefix: '7333', resolved: C, target: G3, adjacentTail: 5 },
  { name: 'G_resolved_P1_owned_G1', prefix: '3777', resolved: G, target: C3, adjacentTail: 3 },
  { name: 'G_resolved_P0_owned_G1', prefix: '7377', resolved: G, target: C3, adjacentTail: 3 },
]);

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
  let state = kernel.rootId;
  for (const digit of sequence) {
    state = kernel.advance(state, Number(digit) - 1);
    assert(Number.isSafeInteger(state) && state >= 0, `bad replay ${sequence}`);
  }
  return state;
}
function resolvedColumnForTarget(target) {
  if (target === G3) return C;
  if (target === C3) return G;
  throw new Error(`unsupported target ${target}`);
}

function createExtendedEngine(kernel) {
  const base = createRepairCapacityProofEngine(kernel, { collectAllWinningActions: true, maxProofStates: MAX_PROOF_STATES });
  const memo = new Map();
  let proofStates = 0;
  let candidateActionsChecked = 0;
  let p1BranchesChecked = 0;
  let maxDepth = 0;

  function nu(state, target) {
    return base.mu(state) + base.capacity(state, resolvedColumnForTarget(target));
  }
  function actionColumns(target) {
    return [...REPAIRS, resolvedColumnForTarget(target)];
  }
  function exactKey(state, target) {
    return `${base.exactStateTargetKey(state, target)}|resolved=${resolvedColumnForTarget(target)}|nu=${nu(state, target)}`;
  }
  function prove(state, target, depth = 0) {
    const key = exactKey(state, target);
    if (memo.has(key)) return memo.get(key);
    proofStates++;
    maxDepth = Math.max(maxDepth, depth);
    if (proofStates > MAX_PROOF_STATES) throw new Error(`resolved-tail proof-state cap exceeded ${MAX_PROOF_STATES}`);
    assert.equal(base.rank(state) % 2, 0, 'extended proof node must be P0 turn');

    const measure = nu(state, target);
    const immediate = base.terminalActions(state, 0);
    if (immediate.length) {
      const out = { proved: true, kind: 'immediate_P0_terminal', nu: measure };
      memo.set(key, out);
      return out;
    }
    if (!base.invariant(state, target)) {
      const out = {
        proved: false,
        kind: 'outside_live_target_distance1_invariant',
        nu: measure,
        targetLive: base.singleton(state, 0, target),
        targetDistance: base.targetDistance(state, target),
      };
      memo.set(key, out);
      return out;
    }

    const winningActions = [];
    const rejected = [];
    for (const action of actionColumns(target)) {
      const actionCell = base.landing(state, action);
      if (actionCell === 0xff) continue;
      candidateActionsChecked++;
      const afterP0 = kernel.advance(state, action);
      if (afterP0 === domain.QN_TERMINAL_WIN) {
        winningActions.push({ column: base.col(action), role: action === resolvedColumnForTarget(target) ? 'resolved_tail' : 'repair', kind: 'P0_terminal_now' });
        continue;
      }
      assert(afterP0 >= 0 && base.rank(afterP0) === base.rank(state) + 1);
      assert.equal(nu(afterP0, target), measure - 1, 'selected extended action did not strictly decrease nu');

      let accepted = true;
      let rejection = null;
      const branches = [];
      for (const reply of base.legal(afterP0)) {
        const replyCell = base.landing(afterP0, reply);
        p1BranchesChecked++;
        const afterP1 = kernel.advance(afterP0, reply);
        if (afterP1 === domain.QN_TERMINAL_WIN) {
          const enabled = new Set(base.enabledSingletons(afterP0, 1));
          assert(enabled.has(replyCell), `P1 terminal ${base.coord(replyCell)} lacks enabled-singleton premise`);
          accepted = false;
          rejection = { reply: base.col(reply), replyCell: base.coord(replyCell), reason: 'P1_terminal' };
          branches.push({ reply: base.col(reply), result: 'P1_terminal' });
          break;
        }
        assert(afterP1 >= 0 && base.rank(afterP1) === base.rank(state) + 2);
        assert(nu(afterP1, target) <= measure - 1, 'P1 reply increased extended resource measure');
        const p0Terminal = base.terminalActions(afterP1, 0);
        if (p0Terminal.length) {
          branches.push({ reply: base.col(reply), result: 'P0_terminal', nu: nu(afterP1, target) });
          continue;
        }
        assert(base.singleton(afterP1, 0, target), 'nonterminal reply killed live target singleton');
        assert.equal(base.targetDistance(afterP1, target), 1, 'nonterminal reply left live-target distance-one invariant');
        const child = prove(afterP1, target, depth + 1);
        branches.push({ reply: base.col(reply), result: child.proved ? 'induction' : 'unproved', nu: nu(afterP1, target) });
        if (!child.proved) {
          accepted = false;
          rejection = { reply: base.col(reply), replyCell: base.coord(replyCell), reason: child.kind, childNu: child.nu };
          break;
        }
      }
      if (accepted) {
        winningActions.push({
          column: base.col(action),
          role: action === resolvedColumnForTarget(target) ? 'resolved_tail' : 'repair',
          kind: 'extended_induction',
          branches,
        });
      } else {
        rejected.push({ action: base.col(action), role: action === resolvedColumnForTarget(target) ? 'resolved_tail' : 'repair', ...rejection });
      }
    }

    const out = winningActions.length
      ? {
          proved: true,
          kind: 'resolved_tail_extended_predecessor',
          nu: measure,
          witness: winningActions[0].column,
          witnessRole: winningActions[0].role,
          winningActions,
          rejected,
        }
      : { proved: false, kind: 'no_extended_predecessor', nu: measure, rejected };
    memo.set(key, out);
    return out;
  }
  function stats() { return { proofStates, candidateActionsChecked, p1BranchesChecked, maxDepth, memoEntries: memo.size }; }
  return { base, nu, prove, stats };
}

// Reconstruct the sixteen already-qualified mu=15 adjacent-tail starts.
const diagnosticKernel = makeKernel();
const diagnostic = createRepairCapacityProofEngine(diagnosticKernel, { collectAllWinningActions: true, maxProofStates: MAX_PROOF_STATES });
const positives = [];
for (const c of POSITIVE_CASES) {
  const rank19Sequence = ROOT + c.prefix + String(c.resolved + 1).repeat(3);
  const rank19 = replay(diagnosticKernel, rank19Sequence);
  const rank20 = diagnosticKernel.advance(rank19, c.adjacentTail);
  assert(rank20 >= 0 && diagnostic.rank(rank20) === 20);
  const rank21 = diagnosticKernel.advance(rank20, c.adjacentTail);
  assert(rank21 >= 0 && rank21 !== domain.QN_TERMINAL_WIN && diagnostic.rank(rank21) === 21);
  for (const reply of diagnostic.legal(rank21)) {
    const state = diagnosticKernel.advance(rank21, reply);
    assert(state >= 0 && state !== domain.QN_TERMINAL_WIN && diagnostic.rank(state) === 22);
    if (diagnostic.terminalActions(state, 0).length) continue;
    assert(diagnostic.invariant(state, c.target));
    assert.equal(diagnostic.mu(state), 15);
    positives.push({
      name: `${c.name}:${diagnostic.col(c.adjacentTail)}->${diagnostic.col(reply)}`,
      sequence: rank19Sequence + String(c.adjacentTail + 1) + String(c.adjacentTail + 1) + String(reply + 1),
      target: c.target,
    });
  }
}
assert.equal(positives.length, 16, 'positive start inventory drift');

function runExtended(row) {
  const kernel = makeKernel();
  const engine = createExtendedEngine(kernel);
  const state = replay(kernel, row.sequence);
  assert(engine.base.invariant(state, row.target), `${row.sequence}: invariant drift`);
  const resolved = resolvedColumnForTarget(row.target);
  const before = {
    rank: engine.base.rank(state),
    mu: engine.base.mu(state),
    resolvedColumn: engine.base.col(resolved),
    resolvedCapacity: engine.base.capacity(state, resolved),
    nu: engine.nu(state, row.target),
  };
  let result = null;
  let error = null;
  try {
    result = engine.prove(state, row.target);
  } catch (err) {
    error = String(err?.message ?? err);
    if (!error.includes('proof-state cap exceeded') && !error.includes('reserved quotient')) throw err;
  }
  return { before, result, error, stats: engine.stats() };
}

function runOld(row) {
  const kernel = makeKernel();
  const engine = createRepairCapacityProofEngine(kernel, { collectAllWinningActions: true, maxProofStates: MAX_PROOF_STATES });
  const state = replay(kernel, row.sequence);
  assert(engine.invariant(state, row.target));
  let result = null;
  let error = null;
  try {
    result = engine.prove(state, row.target);
  } catch (err) {
    error = String(err?.message ?? err);
    if (!error.includes('proof-state cap exceeded') && !error.includes('reserved quotient')) throw err;
  }
  return { result, error };
}

const negativeRows = [];
for (const row of NEGATIVE_COMPARATORS) {
  const old = runOld(row);
  assert.equal(old.error, null, `${row.sequence}: old comparator proof resource failure`);
  assert.equal(old.result.proved, false, `${row.sequence}: comparator unexpectedly proved under old repair induction`);
  const extended = runExtended(row);
  negativeRows.push({
    sequence: row.sequence,
    target: row.target === C3 ? 'C3' : 'G3',
    oldProved: false,
    extendedCompleted: extended.error === null,
    extendedProved: extended.result?.proved ?? false,
    witness: extended.result?.witness ?? null,
    witnessRole: extended.result?.witnessRole ?? null,
    winningActions: (extended.result?.winningActions ?? []).map((x) => ({ column: x.column, role: x.role })),
    before: extended.before,
    error: extended.error,
    stats: extended.stats,
  });
  if (typeof globalThis.gc === 'function') globalThis.gc();
}

const positiveRows = [];
for (const row of positives) {
  const extended = runExtended(row);
  positiveRows.push({
    name: row.name,
    sequence: row.sequence,
    target: row.target === C3 ? 'C3' : 'G3',
    extendedCompleted: extended.error === null,
    extendedProved: extended.result?.proved ?? false,
    witness: extended.result?.witness ?? null,
    witnessRole: extended.result?.witnessRole ?? null,
    before: extended.before,
    error: extended.error,
  });
  if (typeof globalThis.gc === 'function') globalThis.gc();
}

const negativeCompleted = negativeRows.filter((x) => x.extendedCompleted);
const negativeClosed = negativeCompleted.filter((x) => x.extendedProved);
const negativeFailed = negativeCompleted.filter((x) => !x.extendedProved);
const positiveCompleted = positiveRows.filter((x) => x.extendedCompleted);
const positiveClosed = positiveCompleted.filter((x) => x.extendedProved);
const resolvedWitnessRoots = negativeClosed.filter((x) => x.witnessRole === 'resolved_tail');
const anyResolvedWinningAction = negativeClosed.filter((x) => x.winningActions.some((a) => a.role === 'resolved_tail'));

console.log(`RESOLVED_TAIL_EXTENDED_INDUCTION=${JSON.stringify({
  kind: 'standard7x6-resolved-tail-extended-predecessor-induction-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  measure: 'nu = repair_mu(A,B,D,E,F) + remaining_capacity(already_resolved_C_or_G_column)',
  actionDomain: 'A,B,D,E,F plus only the already-resolved target column; the still-live target column remains excluded',
  oldUnprovedComparatorCount: NEGATIVE_COMPARATORS.length,
  negativeComparatorsCompleted: negativeCompleted.length,
  negativeComparatorsClosedByExtendedInduction: negativeClosed.length,
  negativeComparatorsStillUnproved: negativeFailed.length,
  negativeComparatorResourceFailures: negativeRows.filter((x) => !x.extendedCompleted).length,
  negativeRootsSelectingResolvedTail: resolvedWitnessRoots.length,
  negativeRootsWithAnyResolvedTailWinningAction: anyResolvedWinningAction.length,
  qualifiedPositiveStartCount: positives.length,
  positiveStartsCompleted: positiveCompleted.length,
  positiveStartsClosedByExtendedInduction: positiveClosed.length,
  positiveStartResourceFailures: positiveRows.filter((x) => !x.extendedCompleted).length,
  negativeRows,
  failedNegativeRows: negativeFailed,
  interpretation: negativeFailed.length === 0 && negativeRows.every((x) => x.extendedCompleted)
    ? 'All twelve exact mu=15 clean states that were unproved by the five-column repair induction close when the already-resolved C/G tail is admitted as a sixth strictly-decreasing resource channel. This supports resolved-tail capacity as a missing structural resource, not rank or mu alone.'
    : 'The resolved-tail extension does not yet close every exact comparator. Preserve the exact failing roots/actions/replies; do not promote the extended measure globally.',
  theoremBoundary: 'This is a bounded experimental extension over the twelve exact mu=15 negative comparators and sixteen already-qualified positive starts. It adds only the already-resolved C/G column and ranks it with nu; it does not add the live target column, solved-WDL labels, arbitrary frontier search, q equality, provenance equivalence, center-opening membership, or a root solve.',
  authority: 'Exact C4-0010 support/residual transitions, enabled-singleton terminal certificates, and a visibly well-founded nu measure. The old negative outcomes are independently rechecked under the unchanged five-column proof engine before each extended comparison.',
})}`);
