import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { r3, synthesizeSupport, semanticKey } from './incremental-oqs.mjs';
import { ProbeBoundary } from './seed-probe.mjs';
import { createBsfpSupportLatticeProfile } from '../../../components/bsfp/support-lattice.mjs';

const [seedPath, selection = '0', budget = '20000', capacity = '65536', reuse = 'baseline'] = process.argv.slice(2);
assert(['baseline', 'reuse'].includes(reuse));
const reuseResidualCofactors = reuse === 'reuse';
const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
assert.equal(seed.kind, 'oqs-exact-completed-seed-sample');
const source = readFileSync(new URL('../../../components/bsfp/ownership-antichain-solver.mjs', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
assert.equal(seed.sourceSha256, createHash('sha256').update(source).digest('hex'), 'seed source identity mismatch');
const spec = seed.spec; const support = createBsfpSupportLatticeProfile(spec);
const selected = seed.frontiers[Number(selection)]; assert(selected);
assert.equal(support.encodeHeights(selected.heights), selected.supportIndex);
const frontier = { wins: selected.wins.map(BigInt), losses: selected.losses.map(BigInt) };
const lines = r3.createConnectWinningLines(spec);
const orderStart = performance.now();
const orderData = r3.optimizeLineOrder(spec, lines);
const orderMs = performance.now() - orderStart;
const prepared = { lines, orderData, solution: { support, frontierAt(index) { assert.equal(index, selected.supportIndex); return frontier; } } };
const budgetMs = Number(budget); const maxCandidates = Number(capacity);
assert([budgetMs, maxCandidates].every(n => Number.isSafeInteger(n) && n > 0));
const start = performance.now(); let completedCuts = 0; let active;
const emit = event => console.log(JSON.stringify({ elapsedMs: performance.now() - start, ...event }));
emit({ event: 'quotient-start', spec, sourceSha256: seed.sourceSha256, supportIndex: selected.supportIndex,
  rank: selected.rank, seedWins: frontier.wins.length, seedLosses: frontier.losses.length,
  budgetMs, maxCandidates, orderMs, validateDirect: true, independentLayerRebuild: false, reuseResidualCofactors });
try {
  const result = synthesizeSupport({ spec, prepared, supportIndex: selected.supportIndex, oracleMode: false, validateDirect: true, reuseResidualCofactors,
    onTransitionStart(value) {
      active = value; emit({ event: 'cut-start', ...value });
      if (value.candidateCount > maxCandidates) throw new ProbeBoundary('candidate-capacity', value);
      if (performance.now() - start >= budgetMs) throw new ProbeBoundary('time-boundary', value);
    },
    onTransition(t) {
      completedCuts++;
      let winRecords = 0; let lossRecords = 0; let maxWins = 0; let maxLosses = 0;
      const inputResiduals = new Set(t.states.map(s => r3.pairKey(s.pair)));
      const outputResiduals = new Map();
      for (const s of t.nextStates) {
        winRecords += s.pair.wins.length; lossRecords += s.pair.losses.length;
        maxWins = Math.max(maxWins, s.pair.wins.length); maxLosses = Math.max(maxLosses, s.pair.losses.length);
        outputResiduals.set(r3.pairKey(s.pair), s.pair);
      }
      const distinctRecords = [...outputResiduals.values()].reduce((n, p) => n + p.wins.length + p.losses.length, 0);
      const stateSetSha256 = createHash('sha256').update(t.nextStates.map(s => semanticKey(s.xMask, s.pair)).sort().join('\n')).digest('hex');
      emit({ event: 'cut-complete', cut: t.cut, states: t.nextStates.length, candidates: t.candidates.length,
        winRecords, lossRecords, maxWins, maxLosses, distinctResidualPairs: outputResiduals.size,
        distinctResidualRecords: distinctRecords, distinctCofactorInputs: inputResiduals.size * t.inputs.length,
        stateSetSha256, cofactorEvaluations: t.cofactorEvaluations, cofactorCacheHits: t.cofactorCacheHits,
        rssBytes: process.memoryUsage().rss });
    },
  });
  const { layerSummaries, ...summary } = result;
  emit({ event: 'quotient-result', outcome: 'selected-seed-quotient-pass', rootWdl: null, completedCuts, ...summary });
} catch (error) {
  if (!(error instanceof ProbeBoundary)) throw error;
  emit({ event: 'quotient-result', outcome: error.kind, boundary: error.detail, active, completedCuts, rootWdl: null });
}
