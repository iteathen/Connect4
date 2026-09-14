#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine, STANDARD7X6_REPAIR_COLUMNS as REPAIRS } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6, C3 = 16, G3 = 20;
const MAX_PROOF_STATES = 100000;
const NEAREST_PER_POSITIVE = 5;

const KNOWN = Object.freeze([
  { name: 'C3_mu15_all_five_clean', sequence: '46656555464471777113', target: C3, expected: false },
  { name: 'C3_mu16_all_five_clean', sequence: '46656555464471777237', target: C3, expected: false },
  { name: 'C3_mu17_all_five_clean', sequence: '46656555464471777377', target: C3, expected: true },
  { name: 'G3_mu15_four_clean_one_deadline', sequence: '46656555464431333117', target: G3, expected: false },
  { name: 'G3_mu17_four_clean_one_deadline', sequence: '46656555464431333373', target: G3, expected: true },
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
function replay(k, sequence) {
  let id = k.rootId;
  for (const d of sequence) {
    id = k.advance(id, Number(d) - 1);
    assert(Number.isSafeInteger(id) && id >= 0, `bad replay ${sequence}`);
  }
  return id;
}
function hamming(a, b) {
  assert.equal(a.length, b.length);
  let n = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
  return n;
}
function l1(a, b) {
  assert.equal(a.length, b.length);
  return a.reduce((s, x, i) => s + Math.abs(x - b[i]), 0);
}
function mean(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0; }
function minOr(xs, fallback = 0) { return xs.length ? Math.min(...xs) : fallback; }
function maxOr(xs, fallback = 0) { return xs.length ? Math.max(...xs) : fallback; }

// Diagnostic kernel: exact candidate reconstruction and action-conditioned observations only.
// It never runs the recursive repair proof, so diagnostic cone expansion cannot consume an
// isolated proof run's sealed state budget.
const k = makeKernel();
const e = createRepairCapacityProofEngine(k, { collectAllWinningActions: true, maxProofStates: MAX_PROOF_STATES });

function phaseBits(state) { return e.heights(state).map((x) => x & 1).join(''); }
function repairCaps(state) { return REPAIRS.map((c) => e.capacity(state, c)); }
function sortedRepairCaps(state) { return [...repairCaps(state)].sort((a, b) => a - b); }
function deadlines(state) { return e.enabledSingletons(state, 1).map(e.coord); }
function residualLengthHistogram(state, player) {
  const out = [0, 0, 0, 0, 0];
  for (const t of e.terms(state, player)) out[t.length]++;
  return out;
}
function cofactorKey(term, cell) {
  return term.filter((x) => x !== cell).map(e.coord).sort().join('+');
}
function localIncidence(state, cell, target) {
  const p0 = e.terms(state, 0).filter((t) => t.includes(cell));
  const p1 = e.terms(state, 1).filter((t) => t.includes(cell));
  const p0Cof = p0.map((t) => t.filter((x) => x !== cell));
  const p1Cof = p1.map((t) => t.filter((x) => x !== cell));
  return {
    p0IncidentCount: p0.length,
    p1IncidentCount: p1.length,
    p0CofactorSizes: p0Cof.map((x) => x.length).sort((a, b) => a - b),
    p1CofactorSizes: p1Cof.map((x) => x.length).sort((a, b) => a - b),
    p0TargetCoupled: p0Cof.filter((x) => x.includes(target)).length,
    p1TargetCoupled: p1Cof.filter((x) => x.includes(target)).length,
    p0Cofactors: p0.map((t) => cofactorKey(t, cell)).sort(),
    p1Cofactors: p1.map((t) => cofactorKey(t, cell)).sort(),
  };
}

function immediateViableRepairCount(state, target) {
  if (e.terminalActions(state, 0).length) return REPAIRS.length;
  if (!e.invariant(state, target)) return 0;
  let count = 0;
  for (const action of REPAIRS) {
    if (e.landing(state, action) === 0xff) continue;
    const afterP0 = k.advance(state, action);
    if (afterP0 === domain.QN_TERMINAL_WIN) { count++; continue; }
    assert(afterP0 >= 0);
    let ok = true;
    for (const reply of e.legal(afterP0)) {
      const afterP1 = k.advance(afterP0, reply);
      if (afterP1 === domain.QN_TERMINAL_WIN) { ok = false; break; }
      assert(afterP1 >= 0);
      if (e.terminalActions(afterP1, 0).length) continue;
      if (!e.invariant(afterP1, target)) { ok = false; break; }
    }
    if (ok) count++;
  }
  return count;
}

function actionFeature(state, target, action) {
  const cell = e.landing(state, action);
  if (cell === 0xff) return { column: e.col(action), legal: false };
  const incidence = localIncidence(state, cell, target);
  const afterP0 = k.advance(state, action);
  if (afterP0 === domain.QN_TERMINAL_WIN) {
    return {
      column: e.col(action), legal: true, actionCell: e.coord(cell), immediateP0Terminal: true,
      ...incidence, p1TerminalReplies: 0, badInvariantReplies: 0, childDeadlineMax: 0,
      childDeadlineSum: 0, childViableFloor: REPAIRS.length, childViableMean: REPAIRS.length,
      childViableZeroReplies: 0, childP0TerminalReplies: 0,
    };
  }
  assert(afterP0 >= 0);
  let p1TerminalReplies = 0, badInvariantReplies = 0, childP0TerminalReplies = 0;
  const childDeadlines = [], childViable = [];
  for (const reply of e.legal(afterP0)) {
    const replyCell = e.landing(afterP0, reply);
    const afterP1 = k.advance(afterP0, reply);
    if (afterP1 === domain.QN_TERMINAL_WIN) {
      assert(new Set(e.enabledSingletons(afterP0, 1)).has(replyCell));
      p1TerminalReplies++;
      continue;
    }
    assert(afterP1 >= 0);
    if (e.terminalActions(afterP1, 0).length) {
      childP0TerminalReplies++;
      childDeadlines.push(e.enabledSingletons(afterP1, 1).length);
      childViable.push(REPAIRS.length);
      continue;
    }
    if (!e.invariant(afterP1, target)) badInvariantReplies++;
    childDeadlines.push(e.enabledSingletons(afterP1, 1).length);
    childViable.push(immediateViableRepairCount(afterP1, target));
  }
  return {
    column: e.col(action), legal: true, actionCell: e.coord(cell), immediateP0Terminal: false,
    ...incidence,
    p1TerminalReplies, badInvariantReplies,
    childDeadlineMax: maxOr(childDeadlines), childDeadlineSum: childDeadlines.reduce((a, b) => a + b, 0),
    childViableFloor: minOr(childViable), childViableMean: mean(childViable),
    childViableZeroReplies: childViable.filter((x) => x === 0).length,
    childP0TerminalReplies,
  };
}

function stateFeatures(state, target) {
  const actions = REPAIRS.map((a) => actionFeature(state, target, a)).filter((x) => x.legal);
  const p0Hist = residualLengthHistogram(state, 0), p1Hist = residualLengthHistogram(state, 1);
  const numeric = {
    mu: e.mu(state),
    p0ResidualTotal: p0Hist.reduce((a, b) => a + b, 0),
    p1ResidualTotal: p1Hist.reduce((a, b) => a + b, 0),
    p0ResidualSingletons: p0Hist[1], p0ResidualPairs: p0Hist[2], p0ResidualTriples: p0Hist[3],
    p1ResidualSingletons: p1Hist[1], p1ResidualPairs: p1Hist[2], p1ResidualTriples: p1Hist[3],
    repairP0IncidentMin: minOr(actions.map((x) => x.p0IncidentCount)),
    repairP0IncidentMax: maxOr(actions.map((x) => x.p0IncidentCount)),
    repairP0IncidentSum: actions.reduce((s, x) => s + x.p0IncidentCount, 0),
    repairP1IncidentMin: minOr(actions.map((x) => x.p1IncidentCount)),
    repairP1IncidentMax: maxOr(actions.map((x) => x.p1IncidentCount)),
    repairP1IncidentSum: actions.reduce((s, x) => s + x.p1IncidentCount, 0),
    repairP0TargetCoupledSum: actions.reduce((s, x) => s + x.p0TargetCoupled, 0),
    repairP1TargetCoupledSum: actions.reduce((s, x) => s + x.p1TargetCoupled, 0),
    actionsWithoutImmediateP1Terminal: actions.filter((x) => x.p1TerminalReplies === 0).length,
    minImmediateP1TerminalReplies: minOr(actions.map((x) => x.p1TerminalReplies)),
    maxImmediateP1TerminalReplies: maxOr(actions.map((x) => x.p1TerminalReplies)),
    minBadInvariantReplies: minOr(actions.map((x) => x.badInvariantReplies)),
    bestChildViableFloor: maxOr(actions.map((x) => x.childViableFloor)),
    bestChildViableMean: maxOr(actions.map((x) => x.childViableMean)),
    fewestChildViableZeroReplies: minOr(actions.map((x) => x.childViableZeroReplies)),
    lowestChildDeadlineCeiling: minOr(actions.map((x) => x.childDeadlineMax)),
    lowestChildDeadlineSum: minOr(actions.map((x) => x.childDeadlineSum)),
    mostChildP0TerminalReplies: maxOr(actions.map((x) => x.childP0TerminalReplies)),
  };
  return { numeric, actions, p0Hist, p1Hist };
}

function descriptor(state, target) {
  return {
    target: e.coord(target), mu: e.mu(state), rootDeadlines: deadlines(state), phase: phaseBits(state),
    repairCaps: repairCaps(state), sortedRepairCaps: sortedRepairCaps(state),
  };
}
function matchKey(d, tier) {
  const common = `${d.target}|m${d.mu}|rd${d.rootDeadlines.join(',') || 'none'}`;
  if (tier === 1) return `${common}|p${d.phase}|sc${d.sortedRepairCaps.join(',')}`;
  if (tier === 2) return `${common}|p${d.phase}`;
  return common;
}

// Reconstruct the exact post-forced-block rank-20 candidate domain without calling the recursive proof.
const candidateMap = new Map();
for (const family of [
  { name: 'C_first', resolved: C, target: G3, replies1: [0, 1, 3, 4, 5, 6] },
  { name: 'G_first', resolved: G, target: C3, replies1: [0, 1, 2, 3, 4, 5] },
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
          const key = e.exactStateTargetKey(s20, family.target);
          const sequence = prefix + String(family.resolved + 1) + String(r2 + 1) + String(action + 1) + String(reply + 1);
          const old = candidateMap.get(key);
          if (old) old.sources.push(sequence);
          else candidateMap.set(key, { state: s20, target: family.target, sources: [sequence] });
        }
      }
    }
  }
}
assert(candidateMap.size > 0, 'empty clean rank-20 candidate corpus');

const knownStates = new Map();
for (const p of KNOWN) {
  const state = replay(k, p.sequence);
  assert.equal(e.rank(state), 20, `${p.name}: rank drift`);
  assert(e.invariant(state, p.target), `${p.name}: invariant drift`);
  assert.equal(deadlines(state).length, 0, `${p.name}: deadline drift`);
  knownStates.set(p.name, { ...p, state, descriptor: descriptor(state, p.target) });
}
const positiveAnchors = [knownStates.get('C3_mu17_all_five_clean'), knownStates.get('G3_mu17_four_clean_one_deadline')];

const selected = [];
const selectedKeys = new Set();
function addSelected(sequence, target, name, origin) {
  const state = replay(k, sequence);
  const key = e.exactStateTargetKey(state, target);
  if (selectedKeys.has(key)) return;
  selectedKeys.add(key);
  selected.push({ name, origin, sequence, state, target, descriptor: descriptor(state, target) });
}
for (const p of KNOWN) addSelected(p.sequence, p.target, p.name, 'known_probe');

for (const anchor of positiveAnchors) {
  const ranked = [...candidateMap.values()]
    .filter((x) => x.target === anchor.target)
    .map((x) => {
      const d = descriptor(x.state, x.target);
      if (d.mu !== anchor.descriptor.mu || d.rootDeadlines.join(',') !== anchor.descriptor.rootDeadlines.join(',')) return null;
      return {
        ...x, d,
        phaseDistance: hamming(d.phase, anchor.descriptor.phase),
        capDistance: l1(d.repairCaps, anchor.descriptor.repairCaps),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.phaseDistance - b.phaseDistance || a.capDistance - b.capDistance || a.sources[0].localeCompare(b.sources[0]));
  let taken = 0;
  for (const x of ranked) {
    const key = e.exactStateTargetKey(x.state, x.target);
    if (selectedKeys.has(key)) continue;
    addSelected(x.sources[0], x.target, `${anchor.name}_near_${taken + 1}`, 'nearest_mu17_candidate');
    taken++;
    if (taken >= NEAREST_PER_POSITIVE) break;
  }
}

function proveIsolated(row) {
  const proofK = makeKernel();
  const proofE = createRepairCapacityProofEngine(proofK, { collectAllWinningActions: true, maxProofStates: MAX_PROOF_STATES });
  const proofState = replay(proofK, row.sequence);
  assert.equal(proofE.rank(proofState), 20, `${row.name}: proof-kernel rank drift`);
  assert(proofE.invariant(proofState, row.target), `${row.name}: proof-kernel invariant drift`);
  let result = null, error = null;
  try {
    result = proofE.prove(proofState, row.target);
  } catch (err) {
    error = String(err?.message ?? err);
    if (!error.includes('proof-state cap exceeded') && !error.includes('reserved quotient')) throw err;
  }
  return { result, error, stats: proofE.stats() };
}

const evaluated = [];
const proofRunStats = [];
const resourceFailures = [];
for (const row of selected) {
  const proof = proveIsolated(row);
  if (proof.error) resourceFailures.push({ name: row.name, sequence: row.sequence, error: proof.error });
  proofRunStats.push({ name: row.name, ...proof.stats });
  const features = stateFeatures(row.state, row.target);
  evaluated.push({
    name: row.name, origin: row.origin, sequence: row.sequence, target: row.descriptor.target,
    descriptor: row.descriptor, completed: proof.error === null, proved: proof.result?.proved ?? false,
    proofKind: proof.result?.kind ?? null, witness: proof.result?.witness ?? null,
    winningActions: (proof.result?.winningActions ?? []).map((x) => x.column),
    rejected: proof.result?.rejected ?? [], error: proof.error, features,
  });
  if (typeof globalThis.gc === 'function') globalThis.gc();
}

for (const p of KNOWN) {
  const row = evaluated.find((x) => x.name === p.name);
  assert(row?.completed, `${p.name}: direct probe did not complete`);
  assert.equal(row.proved, p.expected, `${p.name}: direct outcome drift`);
}

const completed = evaluated.filter((x) => x.completed);
const proved = completed.filter((x) => x.proved), unproved = completed.filter((x) => !x.proved);

function pairTier(tier) {
  const pg = new Map(), ug = new Map();
  for (const x of proved) { const key = matchKey(x.descriptor, tier); const a = pg.get(key) ?? []; a.push(x); pg.set(key, a); }
  for (const x of unproved) { const key = matchKey(x.descriptor, tier); const a = ug.get(key) ?? []; a.push(x); ug.set(key, a); }
  const pairs = [];
  for (const [key, ps] of pg) {
    const us = ug.get(key); if (!us?.length) continue;
    for (let i = 0; i < Math.min(ps.length, us.length, 4); i++) pairs.push({ tier, key, positive: ps[i], negative: us[i] });
  }
  return pairs;
}
let matchedPairs = pairTier(1), selectedTier = 1;
if (!matchedPairs.length) { matchedPairs = pairTier(2); selectedTier = 2; }
if (!matchedPairs.length) { matchedPairs = pairTier(3); selectedTier = 3; }

function numericDiff(pair) {
  const out = [];
  for (const key of Object.keys(pair.positive.features.numeric).sort()) {
    const p = pair.positive.features.numeric[key], n = pair.negative.features.numeric[key];
    if (typeof p === 'number' && typeof n === 'number' && p !== n) out.push({ field: key, positive: p, negative: n, delta: p - n });
  }
  return out;
}
function actionDiff(pair) {
  const pm = new Map(pair.positive.features.actions.map((x) => [x.column, x]));
  const nm = new Map(pair.negative.features.actions.map((x) => [x.column, x]));
  const fields = ['p0IncidentCount','p1IncidentCount','p0TargetCoupled','p1TargetCoupled','p1TerminalReplies','badInvariantReplies','childDeadlineMax','childDeadlineSum','childViableFloor','childViableMean','childViableZeroReplies','childP0TerminalReplies'];
  const out = [];
  for (const c of REPAIRS.map(e.col)) {
    const p = pm.get(c), n = nm.get(c); if (!p || !n) continue;
    for (const field of fields) if (p[field] !== n[field]) out.push({ column: c, field, positive: p[field], negative: n[field] });
    if (JSON.stringify(p.p0Cofactors) !== JSON.stringify(n.p0Cofactors)) out.push({ column: c, field: 'p0Cofactors', positive: p.p0Cofactors, negative: n.p0Cofactors });
    if (JSON.stringify(p.p1Cofactors) !== JSON.stringify(n.p1Cofactors)) out.push({ column: c, field: 'p1Cofactors', positive: p.p1Cofactors, negative: n.p1Cofactors });
  }
  return out;
}
const pairReports = matchedPairs.slice(0, 12).map((pair) => ({
  tier: pair.tier, key: pair.key,
  positive: { name: pair.positive.name, sequence: pair.positive.sequence, witness: pair.positive.witness },
  negative: { name: pair.negative.name, sequence: pair.negative.sequence },
  numericDifferences: numericDiff(pair), actionConditionedDifferences: actionDiff(pair),
}));

const consistentDirectional = [];
if (matchedPairs.length) {
  for (const field of Object.keys(matchedPairs[0].positive.features.numeric).sort()) {
    const deltas = matchedPairs.map((p) => p.positive.features.numeric[field] - p.negative.features.numeric[field]);
    if (deltas.every((x) => x > 0)) consistentDirectional.push({ field, direction: 'proved_gt_unproved', minDelta: Math.min(...deltas) });
    else if (deltas.every((x) => x < 0)) consistentDirectional.push({ field, direction: 'proved_lt_unproved', maxDelta: Math.max(...deltas) });
  }
}

function balancedAccuracy(rows, field, threshold, direction) {
  let tp=0,tn=0,p=0,n=0;
  for (const r of rows) {
    const value = r.features.numeric[field];
    const pred = direction === 'ge' ? value >= threshold : value <= threshold;
    if (r.proved) { p++; if (pred) tp++; } else { n++; if (!pred) tn++; }
  }
  if (!p || !n) return 0;
  return ((tp / p) + (tn / n)) / 2;
}
const thresholdCandidates = [];
if (proved.length && unproved.length) {
  for (const field of Object.keys(completed[0].features.numeric).sort()) {
    const values = [...new Set(completed.map((x) => x.features.numeric[field]).filter((x) => Number.isFinite(x)))].sort((a,b)=>a-b);
    if (values.length < 2) continue;
    for (let i=0;i<values.length-1;i++) {
      const threshold=(values[i]+values[i+1])/2;
      for (const direction of ['ge','le']) thresholdCandidates.push({field,threshold,direction,balancedAccuracy:balancedAccuracy(completed,field,threshold,direction)});
    }
  }
}
thresholdCandidates.sort((a,b)=>b.balancedAccuracy-a.balancedAccuracy||a.field.localeCompare(b.field)||a.threshold-b.threshold);

const aggregateProofStats = {
  runs: proofRunStats.length,
  totalProofStates: proofRunStats.reduce((s, x) => s + x.proofStates, 0),
  maxProofStatesObserved: maxOr(proofRunStats.map((x) => x.proofStates)),
  totalCandidateActionsChecked: proofRunStats.reduce((s, x) => s + x.candidateActionsChecked, 0),
  totalP1BranchesChecked: proofRunStats.reduce((s, x) => s + x.p1BranchesChecked, 0),
  maxDepthObserved: maxOr(proofRunStats.map((x) => x.maxDepth)),
};

console.log(`MATCHED_CLEAN_INVARIANT_DIFFERENTIAL=${JSON.stringify({
  kind: 'standard7x6-clean-invariant-action-conditioned-matched-differential-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  exactCleanCandidateStates: candidateMap.size,
  selectedDirectProbes: selected.length,
  evaluatedDirectProbes: evaluated.length,
  completedDirectProbes: completed.length,
  provedDirectProbes: proved.length,
  unprovedDirectProbes: unproved.length,
  resourceFailures,
  proofStats: aggregateProofStats,
  selectedMatchingTier: selectedTier,
  matchingTierMeaning: selectedTier===1
    ? 'same target, mu, exact root deadline set, GF2 phase location, and sorted five-column repair-capacity multiset'
    : selectedTier===2
      ? 'same target, mu, exact root deadline set, and GF2 phase location'
      : 'same target, mu, and exact root deadline set',
  matchedPairCount: matchedPairs.length,
  pairReports,
  consistentDirectionalNumericFields: consistentDirectional,
  topNumericThresholdHypotheses: thresholdCandidates.slice(0, 20),
  evaluatedRows: completed.map((x) => ({
    name:x.name,origin:x.origin,sequence:x.sequence,target:x.target,proved:x.proved,witness:x.witness,
    descriptor:x.descriptor,numeric:x.features.numeric,
    actionSummary:x.features.actions.map((a)=>({column:a.column,actionCell:a.actionCell,p0IncidentCount:a.p0IncidentCount,p1IncidentCount:a.p1IncidentCount,p0TargetCoupled:a.p0TargetCoupled,p1TargetCoupled:a.p1TargetCoupled,p1TerminalReplies:a.p1TerminalReplies,badInvariantReplies:a.badInvariantReplies,childDeadlineMax:a.childDeadlineMax,childViableFloor:a.childViableFloor,childViableZeroReplies:a.childViableZeroReplies})),
  })),
  interpretation: matchedPairs.length
    ? 'At least one exact proved/unproved pair exists under the stated matched context. The reported differentials are candidate missing premises only; threshold scores are correlation diagnostics and require corpus-wide falsification before theorem promotion.'
    : 'No proved/unproved pair was found within the bounded direct-probe set under the three declared matching tiers. Preserve the evaluated outcomes and expand only the candidate sampling, not the proof-state cap or physical frontier.',
  theoremBoundary: 'Each direct proof outcome is isolated in a fresh 100k-state repair-proof arena, matching the qualified representative-probe evidence model. Differential features use a separate exact diagnostic kernel. No feature or threshold is promoted to q equality, WDL oracle authority, or a theorem by this control.',
})}`);
