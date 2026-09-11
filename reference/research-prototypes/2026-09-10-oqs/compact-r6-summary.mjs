import { execFileSync } from 'node:child_process';

const stdout = execFileSync(
  process.execPath,
  ['--expose-gc', new URL('./incremental-oqs.mjs', import.meta.url).pathname],
  { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 },
);

const full = JSON.parse(stdout);
const results = full.results.map((entry) => {
  const supportSummaries = entry.selection === 'supports'
    ? entry.supports.map((support) => ({
      supportIndex: support.supportIndex,
      rank: support.rank,
      heights: support.heights,
      oracleMode: support.oracleMode,
      totalDenseStates: support.totalDenseStates,
      maxDenseStates: support.maxDenseStates,
      transitionEntries: support.transitionEntries,
      totalCandidates: support.totalCandidates,
      maxLayerCandidateCount: support.maxLayerCandidateCount,
      maxActiveLayerPairRecords: support.maxActiveLayerPairRecords,
      maxWinRecordsPerState: support.maxWinRecordsPerState,
      maxLossRecordsPerState: support.maxLossRecordsPerState,
      maxPairRecordsPerState: support.maxPairRecordsPerState,
      generationMs: support.generationMs,
      dedupMs: support.dedupMs,
      oracleBuildMs: support.oracleBuildMs,
      synthesisMs: support.synthesisMs,
      oracleToSynthesisRatio: support.synthesisMs > 0 && support.oracleBuildMs > 0
        ? support.oracleBuildMs / support.synthesisMs
        : null,
    }))
    : undefined;
  return {
    geometry: entry.geometry,
    selection: entry.selection,
    supportCount: entry.supportCount,
    oracleMode: entry.oracleMode,
    lineOrderMs: entry.lineOrderMs,
    c1SolveMs: entry.c1SolveMs,
    synthesisElapsedMs: entry.synthesisElapsedMs,
    maxDenseStates: entry.maxDenseStates,
    maxLayerCandidateCount: entry.maxLayerCandidateCount,
    maxWinRecordsPerState: entry.maxWinRecordsPerState,
    maxLossRecordsPerState: entry.maxLossRecordsPerState,
    maxPairRecordsPerState: entry.maxPairRecordsPerState,
    totalSynthesisMs: entry.totalSynthesisMs,
    totalOracleBuildMs: entry.totalOracleBuildMs,
    oracleToSynthesisRatio: entry.totalSynthesisMs > 0 && entry.totalOracleBuildMs > 0
      ? entry.totalOracleBuildMs / entry.totalSynthesisMs
      : null,
    totalTransitionEntries: entry.totalTransitionEntries,
    supports: supportSummaries,
  };
});

console.log(JSON.stringify({
  kind: 'connect4-bsfp-oqs-r6-compact-summary',
  sourceKind: full.kind,
  sourceStatus: full.status,
  results,
}, null, 2));
