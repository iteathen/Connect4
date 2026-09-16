#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import {
  createResolvedTailCapacityProofEngine,
  STANDARD7X6_C3 as C3,
  STANDARD7X6_G3 as G3,
  STANDARD7X6_C_COLUMN as C,
  STANDARD7X6_G_COLUMN as G,
} from './quotient-standard7x6-resolved-tail-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const MAX_PROOF_STATES_PER_STRATUM = 100000;
const EXPECTED_GROUPS = Object.freeze({
  'C3|m15': 101,
  'C3|m16': 52,
  'C3|m17': 20,
  'G3|m15': 59,
  'G3|m16': 37,
  'G3|m17': 18,
});

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

const dk = makeKernel();
const de = createRepairCapacityProofEngine(dk, { collectAllWinningActions: false, maxProofStates: MAX_PROOF_STATES_PER_STRATUM });
function deadlines(state) { return de.enabledSingletons(state, 1).map(de.coord); }

const candidates = new Map();
for (const family of [
  { resolved: C, target: G3, replies1: [0, 1, 3, 4, 5, 6] },
  { resolved: G, target: C3, replies1: [0, 1, 2, 3, 4, 5] },
]) {
  for (const r1 of family.replies1) {
    const prefix = ROOT + `${family.resolved + 1}${r1 + 1}${family.resolved + 1}${family.resolved + 1}`;
    const s16 = replay(dk, prefix);
    const s17 = dk.advance(s16, family.resolved);
    assert(s17 >= 0 && de.rank(s17) === 17);
    for (const r2 of de.legal(s17)) {
      const s18 = dk.advance(s17, r2);
      assert(s18 >= 0 && s18 !== domain.QN_TERMINAL_WIN && de.rank(s18) === 18);
      for (const action of de.legal(s18)) {
        const s19 = dk.advance(s18, action);
        if (s19 === domain.QN_TERMINAL_WIN) continue;
        assert(s19 >= 0 && de.rank(s19) === 19);
        for (const reply of de.legal(s19)) {
          const replyCell = de.landing(s19, reply);
          const s20 = dk.advance(s19, reply);
          if (s20 === domain.QN_TERMINAL_WIN) {
            assert(new Set(de.enabledSingletons(s19, 1)).has(replyCell));
            continue;
          }
          assert(s20 >= 0 && de.rank(s20) === 20);
          if (de.terminalActions(s20, 0).length) continue;
          if (!de.invariant(s20, family.target)) continue;
          if (deadlines(s20).length !== 0) continue;
          const exact = de.exactStateTargetKey(s20, family.target);
          const sequence = prefix + String(family.resolved + 1) + String(r2 + 1) + String(action + 1) + String(reply + 1);
          if (!candidates.has(exact)) {
            candidates.set(exact, {
              sequence,
              target: family.target,
              targetName: de.coord(family.target),
              mu: de.mu(s20),
            });
          }
        }
      }
    }
  }
}
assert.equal(candidates.size, 287, 'clean corpus size drift');

const groups = new Map();
for (const row of candidates.values()) {
  const key = `${row.targetName}|m${row.mu}`;
  const rows = groups.get(key) ?? [];
  rows.push(row);
  groups.set(key, rows);
}
assert.deepEqual(
  Object.fromEntries([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, rows]) => [key, rows.length])),
  EXPECTED_GROUPS,
  'clean corpus stratum drift',
);

const groupResults = [];
for (const [groupKey, rows] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const kernel = makeKernel();
  const engine = createResolvedTailCapacityProofEngine(kernel, {
    collectAllWinningActions: false,
    maxProofStates: MAX_PROOF_STATES_PER_STRATUM,
  });
  let attempted = 0;
  let closed = 0;
  const failures = [];
  let resourceFailure = null;
  for (const row of [...rows].sort((a, b) => a.sequence.localeCompare(b.sequence))) {
    const state = replay(kernel, row.sequence);
    assert.equal(engine.base.rank(state), 20, `${groupKey}: rank drift`);
    assert(engine.base.invariant(state, row.target), `${groupKey}: invariant drift`);
    assert.equal(engine.base.enabledSingletons(state, 1).length, 0, `${groupKey}: root deadline drift`);
    assert.equal(engine.base.mu(state), row.mu, `${groupKey}: mu drift`);
    attempted++;
    let result;
    try {
      result = engine.prove(state, row.target);
    } catch (err) {
      const message = String(err?.message ?? err);
      if (!message.includes('proof-state cap exceeded') && !message.includes('reserved quotient')) throw err;
      resourceFailure = { sequence: row.sequence, message };
      attempted--;
      break;
    }
    if (result.proved) closed++;
    else if (failures.length < 12) {
      failures.push({
        sequence: row.sequence,
        target: row.targetName,
        mu: row.mu,
        nu: engine.nu(state, row.target),
        resolvedColumn: engine.base.col(engine.resolvedColumn(row.target)),
        resolvedCapacity: engine.base.capacity(state, engine.resolvedColumn(row.target)),
        rejected: result.rejected?.slice(0, 6) ?? [],
      });
    }
  }
  const stats = engine.stats();
  groupResults.push({
    groupKey,
    states: rows.length,
    attempted,
    closed,
    logicalFailures: attempted - closed,
    unattempted: rows.length - attempted,
    resourceFailure,
    failureSamples: failures,
    stats,
  });
  if (typeof globalThis.gc === 'function') globalThis.gc();
}

const totalStates = groupResults.reduce((s, x) => s + x.states, 0);
const attemptedStates = groupResults.reduce((s, x) => s + x.attempted, 0);
const closedStates = groupResults.reduce((s, x) => s + x.closed, 0);
const logicalFailures = groupResults.reduce((s, x) => s + x.logicalFailures, 0);
const unattemptedStates = groupResults.reduce((s, x) => s + x.unattempted, 0);
const resourceFailureGroups = groupResults.filter((x) => x.resourceFailure !== null).length;

console.log(`RESOLVED_TAIL_CLEAN_CORPUS_CLOSURE=${JSON.stringify({
  kind: 'standard7x6-resolved-tail-clean-rank20-corpus-closure-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  measure: 'nu = repair_mu(A,B,D,E,F) + remaining_capacity(already_resolved_C_or_G_column)',
  exactCleanCandidateStates: totalStates,
  attemptedStates,
  closedStates,
  logicalFailures,
  unattemptedStates,
  resourceFailureGroups,
  maxProofStatesPerStratum: MAX_PROOF_STATES_PER_STRATUM,
  groupResults,
  interpretation: logicalFailures === 0 && unattemptedStates === 0
    ? 'All 287 exact clean rank-20 live-target states close under the resolved-tail extended predecessor induction. The clean theorem-domain gap is closed for this corpus without adding the live target column or increasing the per-stratum proof-state cap.'
    : logicalFailures > 0
      ? 'At least one exact clean rank-20 state remains logically unproved under the resolved-tail extension. Preserve its exact action/reply rejection as the next structural seam.'
      : 'The bounded per-stratum proof arena did not complete the full clean corpus. Preserve the exact resource-limited stratum; do not infer theorem failure and do not increase the cap without a structural justification.',
  theoremBoundary: 'Exact only for the existing 287-state clean post-block rank-20 corpus: P0 turn, live target singleton, support distance one, and no root P1 deadline. Each target/mu stratum uses a fresh unchanged 100000-state proof arena. This is not q equality, solved-WDL authority, arbitrary frontier search, provenance equivalence, center-opening membership, or a root solve.',
})}`);
