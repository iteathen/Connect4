import assert from 'node:assert/strict';
import { writeFileSync, renameSync } from 'node:fs';
import { loadSeedProbe, ProbeBoundary } from './seed-probe.mjs';

const [columns, rows, connect, minimumRank, budgetMs, maxRaw] = process.argv.slice(2, 8).map(Number);
const output = process.argv[8];
assert([columns, rows, connect, budgetMs, maxRaw].every(n => Number.isSafeInteger(n) && n > 0));
assert(columns * rows <= 42 && (rows + 1) ** columns <= 1_000_000);
assert(Number.isInteger(minimumRank) && minimumRank >= 0 && minimumRank <= columns * rows);
assert(output);
const spec = { columns, rows, connect };
const { solve, sourceSha256 } = await loadSeedProbe();
const start = performance.now();
const emit = event => console.log(JSON.stringify({ elapsedMs: performance.now() - start, ...event }));
let active; let rank; let completed = 0; let lastProgress = 0; let best = [];
let maxNormalizationInput = 0; let pairCandidates = 0; let normalizationCalls = 0;
let maxPairProduct = 0; let maxWins = 0; let maxLosses = 0; let totalRecords = 0;
let outcome = 'in-progress'; let boundary = null; let rootWdl = null;
const snapshot = () => {
  writeFileSync(`${output}.tmp`, JSON.stringify({ kind: 'oqs-exact-completed-seed-sample', spec, sourceSha256,
    outcome, rootWdl, completed, active, elapsedMs: performance.now() - start,
    selection: 'three largest completed boundary counts; not a representative sample',
    frontiers: best.map(f => ({ ...f, wins: f.wins.map(String), losses: f.losses.map(String) })) }, null, 2));
  renameSync(`${output}.tmp`, output);
};
const check = () => {
  if (performance.now() - start >= budgetMs) throw new ProbeBoundary('time-boundary', { active, budgetMs });
};
emit({ event: 'seed-start', spec, minimumRank, budgetMs, maxRaw, sourceSha256 });
try {
  const result = solve(spec, {
    rank(r) {
      if (rank !== undefined) emit({ event: 'rank-complete', rank, completed, totalRecords, maxWins, maxLosses, pairCandidates });
      if (r < minimumRank) throw new ProbeBoundary('rank-boundary', { minimumRank, lastCompleteRank: rank });
      rank = r; check();
    },
    begin(value) { active = value; check(); },
    normalize(n) {
      normalizationCalls++; maxNormalizationInput = Math.max(maxNormalizationInput, n);
      if (n > maxRaw) throw new ProbeBoundary('normalization-capacity', { active, n, maxRaw });
      check();
    },
    product(a, b) {
      const n = a * b; maxPairProduct = Math.max(maxPairProduct, n);
      if (n > maxRaw) throw new ProbeBoundary('product-capacity', { active, a, b, n, maxRaw });
      pairCandidates += n; check();
    },
    complete(f) {
      completed++; totalRecords += f.wins.length + f.losses.length;
      maxWins = Math.max(maxWins, f.wins.length); maxLosses = Math.max(maxLosses, f.losses.length);
      const width = f.wins.length + f.losses.length;
      if (best.length < 3 || width > best.at(-1).wins.length + best.at(-1).losses.length) {
        best.push(f); best.sort((a, b) => b.wins.length + b.losses.length - a.wins.length - a.losses.length || a.supportIndex - b.supportIndex);
        best = best.slice(0, 3); snapshot();
      }
      if (performance.now() - lastProgress >= 1000) {
        emit({ event: 'support-progress', active, completed, totalRecords, maxWins, maxLosses, pairCandidates,
          maxNormalizationInput, maxPairProduct, rssBytes: process.memoryUsage().rss });
        lastProgress = performance.now();
      }
    },
  });
  outcome = 'full-reference-seed-pass'; rootWdl = result.rootWdl;
} catch (error) {
  if (!(error instanceof ProbeBoundary)) throw error;
  outcome = error.kind; boundary = error.detail;
} finally { snapshot(); }
emit({ event: 'seed-result', outcome, boundary, rootWdl, completed, totalRecords, maxWins, maxLosses,
  pairCandidates, maxPairProduct, maxNormalizationInput, normalizationCalls,
  sample: best.map(f => ({ supportIndex: f.supportIndex, rank: f.rank, wins: f.wins.length, losses: f.losses.length })) });
