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
const MAX_PER_TARGET_MU = 4;

const KNOWN = Object.freeze([
  { name: 'C3_mu15_known_negative', sequence: '46656555464471777113', target: C3, expected: false },
  { name: 'C3_mu16_known_negative', sequence: '46656555464471777237', target: C3, expected: false },
  { name: 'C3_mu17_known_positive', sequence: '46656555464471777377', target: C3, expected: true },
  { name: 'G3_mu15_known_negative', sequence: '46656555464431333117', target: G3, expected: false },
  { name: 'G3_mu17_known_positive', sequence: '46656555464431333373', target: G3, expected: true },
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
function stableKey(row) {
  return `${row.targetName}|m${row.mu}|p${row.phase}|c${row.repairCaps.join(',')}|i${row.repairP0IncidentSum}|${row.sequence}`;
}

const k = makeKernel();
const e = createRepairCapacityProofEngine(k, { collectAllWinningActions: true, maxProofStates: MAX_PROOF_STATES });

function phaseBits(state) { return e.heights(state).map((x) => x & 1).join(''); }
function deadlines(state) { return e.enabledSingletons(state, 1).map(e.coord); }
function repairCaps(state) { return REPAIRS.map((column) => e.capacity(state, column)); }
function p0IncidentCountAt(state, cell) {
  return e.terms(state, 0).filter((term) => term.includes(cell)).length;
}
function repairP0IncidentSum(state) {
  let sum = 0;
  for (const column of REPAIRS) {
    const cell = e.landing(state, column);
    if (cell !== 0xff) sum += p0IncidentCountAt(state, cell);
  }
  return sum;
}
function descriptor(state, target, sequence) {
  return {
    state,
    target,
    targetName: e.coord(target),
    sequence,
    mu: e.mu(state),
    rootDeadlines: deadlines(state),
    phase: phaseBits(state),
    repairCaps: repairCaps(state),
    repairP0IncidentSum: repairP0IncidentSum(state),
  };
}

// Exact clean rank-20 candidate corpus used by the matched-differential work.
// No recursive proof is run in this diagnostic kernel.
const candidates = new Map();
for (const family of [
  { resolved: C, target: G3, replies1: [0, 1, 3, 4, 5, 6] },
  { resolved: G, target: C3, replies1: [0, 1, 2, 3, 4, 5] },
]) {
  for (const r1 of family.replies1) {
    const prefix = ROOT + `${family.resolved + 1}${r1 + 1}${family.resolved + 1}${family.resolved + 1}`;
    const s16 = replay(k, prefix);
    const s17 = k.advance(s16, family.resolved);
    assert(s17 >= 0 && e.rank(s17) === 17);
    for (const r2 of e.legal(s17)) {
      const s18 = k.advance(s17, r2);
      assert(s18 >= 0 && s18 !== domain.QN_TERMINAL_WIN && e.rank(s18) === 18);
      for (const action of e.legal(s18)) {
        const s19 = k.advance(s18, action);
        if (s19 === domain.QN_TERMINAL_WIN) continue;
        assert(s19 >= 0 && e.rank(s19) === 19);
        for (const reply of e.legal(s19)) {
          const replyCell = e.landing(s19, reply);
          const s20 = k.advance(s19, reply);
          if (s20 === domain.QN_TERMINAL_WIN) {
            assert(new Set(e.enabledSingletons(s19, 1)).has(replyCell));
            continue;
          }
          assert(s20 >= 0 && e.rank(s20) === 20);
          if (e.terminalActions(s20, 0).length) continue;
          if (!e.invariant(s20, family.target)) continue;
          if (deadlines(s20).length !== 0) continue;
          const exact = e.exactStateTargetKey(s20, family.target);
          const sequence = prefix + String(family.resolved + 1) + String(r2 + 1) + String(action + 1) + String(reply + 1);
          if (!candidates.has(exact)) candidates.set(exact, descriptor(s20, family.target, sequence));
        }
      }
    }
  }
}
assert.equal(candidates.size, 287, 'clean candidate corpus drift');

const corpus = [...candidates.values()];
const groupMap = new Map();
for (const row of corpus) {
  const group = `${row.targetName}|m${row.mu}`;
  const rows = groupMap.get(group) ?? [];
  rows.push(row);
  groupMap.set(group, rows);
}

const selected = [];
const selectedKeys = new Set();
function select(row, reason, name = null) {
  const key = e.exactStateTargetKey(row.state, row.target);
  if (selectedKeys.has(key)) return false;
  selectedKeys.add(key);
  selected.push({ ...row, selectionReason: reason, name: name ?? `probe_${selected.length + 1}` });
  return true;
}

// Preserve the known positive/negative calibration points.
for (const known of KNOWN) {
  const state = replay(k, known.sequence);
  assert.equal(e.rank(state), 20, `${known.name}: rank drift`);
  assert(e.invariant(state, known.target), `${known.name}: invariant drift`);
  assert.equal(deadlines(state).length, 0, `${known.name}: root deadline drift`);
  select(descriptor(state, known.target, known.sequence), 'known_calibration', known.name);
}

// Falsification-directed selection. The current bounded correlations predict:
//   mu >= 17                -> proved
//   repairP0IncidentSum <=12 -> proved
// To make those hypotheses disagree whenever possible, choose the largest incidence sums at
// mu>=17 and the smallest incidence sums at mu<=16. We also require structural diversity by
// phase/capacity profile before taking multiple members of the same stratum.
for (const [group, rows] of [...groupMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const mu = rows[0].mu;
  const ordered = [...rows].sort((a, b) => {
    const primary = mu >= 17
      ? b.repairP0IncidentSum - a.repairP0IncidentSum
      : a.repairP0IncidentSum - b.repairP0IncidentSum;
    return primary || a.phase.localeCompare(b.phase) || a.repairCaps.join(',').localeCompare(b.repairCaps.join(',')) || a.sequence.localeCompare(b.sequence);
  });
  const profiles = new Set();
  let taken = 0;
  for (const row of ordered) {
    const profile = `${row.phase}|${row.repairCaps.join(',')}|${row.repairP0IncidentSum}`;
    if (profiles.has(profile)) continue;
    profiles.add(profile);
    if (select(row, mu >= 17 ? 'attack_mu_with_high_incidence' : 'attack_incidence_with_low_mu')) taken++;
    if (taken >= MAX_PER_TARGET_MU) break;
  }
}

function proveIsolated(row) {
  const proofK = makeKernel();
  const proofE = createRepairCapacityProofEngine(proofK, { collectAllWinningActions: true, maxProofStates: MAX_PROOF_STATES });
  const state = replay(proofK, row.sequence);
  assert.equal(proofE.rank(state), 20, `${row.name}: isolated rank drift`);
  assert(proofE.invariant(state, row.target), `${row.name}: isolated invariant drift`);
  let result = null;
  let error = null;
  try {
    result = proofE.prove(state, row.target);
  } catch (err) {
    error = String(err?.message ?? err);
    if (!error.includes('proof-state cap exceeded') && !error.includes('reserved quotient')) throw err;
  }
  return { result, error, stats: proofE.stats() };
}

const evaluated = [];
for (const row of selected) {
  const proof = proveIsolated(row);
  evaluated.push({
    name: row.name,
    sequence: row.sequence,
    target: row.targetName,
    mu: row.mu,
    rootDeadlines: row.rootDeadlines,
    phase: row.phase,
    repairCaps: row.repairCaps,
    repairP0IncidentSum: row.repairP0IncidentSum,
    selectionReason: row.selectionReason,
    completed: proof.error === null,
    proved: proof.result?.proved ?? false,
    witness: proof.result?.witness ?? null,
    winningActions: (proof.result?.winningActions ?? []).map((x) => x.column),
    error: proof.error,
    proofStats: proof.stats,
  });
  if (typeof globalThis.gc === 'function') globalThis.gc();
}

for (const known of KNOWN) {
  const row = evaluated.find((x) => x.name === known.name);
  assert(row?.completed, `${known.name}: calibration probe incomplete`);
  assert.equal(row.proved, known.expected, `${known.name}: calibration outcome drift`);
}

const completed = evaluated.filter((x) => x.completed);
const resourceFailures = evaluated.filter((x) => !x.completed);
const proved = completed.filter((x) => x.proved);
const unproved = completed.filter((x) => !x.proved);

const matchedOutcomePairs = [];
const outcomeGroups = new Map();
for (const row of completed) {
  const key = `${row.target}|m${row.mu}|rd${row.rootDeadlines.join(',') || 'none'}`;
  const g = outcomeGroups.get(key) ?? { proved: [], unproved: [] };
  g[row.proved ? 'proved' : 'unproved'].push(row);
  outcomeGroups.set(key, g);
}
for (const [key, g] of outcomeGroups) {
  if (!g.proved.length || !g.unproved.length) continue;
  matchedOutcomePairs.push({
    key,
    positive: { name: g.proved[0].name, sequence: g.proved[0].sequence, incidentSum: g.proved[0].repairP0IncidentSum, phase: g.proved[0].phase, repairCaps: g.proved[0].repairCaps },
    negative: { name: g.unproved[0].name, sequence: g.unproved[0].sequence, incidentSum: g.unproved[0].repairP0IncidentSum, phase: g.unproved[0].phase, repairCaps: g.unproved[0].repairCaps },
  });
}

const muThresholdFalsifiers = completed.filter((x) => x.proved !== (x.mu >= 17));
const incidenceThresholdFalsifiers = completed.filter((x) => x.proved !== (x.repairP0IncidentSum <= 12));
const hypothesisConflictRows = completed.filter((x) => (x.mu >= 17) !== (x.repairP0IncidentSum <= 12));

const corpusGroups = [...groupMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, rows]) => ({
  key,
  states: rows.length,
  incidentMin: Math.min(...rows.map((x) => x.repairP0IncidentSum)),
  incidentMax: Math.max(...rows.map((x) => x.repairP0IncidentSum)),
  distinctPhases: new Set(rows.map((x) => x.phase)).size,
  distinctCapacityVectors: new Set(rows.map((x) => x.repairCaps.join(','))).size,
  thresholdConflictCandidates: rows.filter((x) => (x.mu >= 17) !== (x.repairP0IncidentSum <= 12)).length,
}));

console.log(`CLEAN_INVARIANT_THRESHOLD_FALSIFIER=${JSON.stringify({
  kind: 'standard7x6-clean-invariant-threshold-falsifier-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  exactCleanCandidateStates: corpus.length,
  corpusGroups,
  selectedProbes: selected.length,
  completedProbes: completed.length,
  provedProbes: proved.length,
  unprovedProbes: unproved.length,
  resourceFailureCount: resourceFailures.length,
  matchedOutcomePairCount: matchedOutcomePairs.length,
  matchedOutcomePairs,
  hypothesisConflictRows: hypothesisConflictRows.map((x) => ({ name: x.name, target: x.target, mu: x.mu, incidentSum: x.repairP0IncidentSum, proved: x.proved, sequence: x.sequence })),
  muThresholdFalsifierCount: muThresholdFalsifiers.length,
  muThresholdFalsifiers: muThresholdFalsifiers.map((x) => ({ name: x.name, target: x.target, mu: x.mu, incidentSum: x.repairP0IncidentSum, proved: x.proved, sequence: x.sequence })),
  incidenceThresholdFalsifierCount: incidenceThresholdFalsifiers.length,
  incidenceThresholdFalsifiers: incidenceThresholdFalsifiers.map((x) => ({ name: x.name, target: x.target, mu: x.mu, incidentSum: x.repairP0IncidentSum, proved: x.proved, sequence: x.sequence })),
  evaluatedRows: completed.map((x) => ({ name: x.name, selectionReason: x.selectionReason, target: x.target, mu: x.mu, phase: x.phase, repairCaps: x.repairCaps, incidentSum: x.repairP0IncidentSum, proved: x.proved, witness: x.witness, sequence: x.sequence })),
  interpretation: matchedOutcomePairs.length
    ? 'A same-target/same-mu/same-root-deadline proved/unproved pair was found. Mu and root deadline state are therefore insufficient; route directly to the action-conditioned residual/response differences in that pair.'
    : (muThresholdFalsifiers.length || incidenceThresholdFalsifiers.length)
      ? 'At least one current perfect-looking threshold correlation was falsified by the directed sample. Preserve the counterexample and derive the next separator from its exact action-conditioned dependency cone.'
      : 'The directed bounded sample did not falsify either current threshold correlation and did not produce a same-stratum outcome pair. This is still not theorem authority; broaden only structurally diverse sampling within the existing exact 287-state corpus before any promotion.',
  theoremBoundary: 'This is a falsification-directed bounded sample of the existing 287-state exact clean rank-20 corpus. Each recursive proof runs in a fresh kernel with the unchanged 100000-state cap. Mu and repairP0IncidentSum are tested hypotheses only; neither is promoted to a value theorem, q equality, provenance equivalence, or root/center-opening result.',
})}`);
