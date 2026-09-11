import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  normalizeMaximalOwnershipAntichain,
  normalizeMinimalOwnershipAntichain,
} from '../../../components/bsfp/ownership-antichain-solver.mjs';

const ZDD_DIR = new URL('../2026-09-10-zdd-transfer/', import.meta.url);
const R3_SOURCE_URL = new URL('residual-class-transition.mjs', ZDD_DIR);
const R3_TEMP_URL = new URL('.residual-oqs-internals.tmp.mjs', ZDD_DIR);

const R5_5X5_CHECKPOINTS = Object.freeze(new Map([
  [4426, Object.freeze({ totalDenseStates: 16736, maxDenseStates: 1603, transitionEntries: 22598 })],
  [4743, Object.freeze({ totalDenseStates: 40035, maxDenseStates: 3985, transitionEntries: 52129 })],
  [6351, Object.freeze({ totalDenseStates: 21872, maxDenseStates: 2107, transitionEntries: 28444 })],
  [6465, Object.freeze({ totalDenseStates: 86965, maxDenseStates: 9170, transitionEntries: 117573 })],
]));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function exportR3Internals() {
  let source = readFileSync(R3_SOURCE_URL, 'utf8');
  const marker = '\nconst results = CASES.map(analyzeCase);\nconst failures = results.filter((entry) => entry.transitionClosure !== \'pass\');\n';
  const first = source.indexOf(marker);
  const last = source.lastIndexOf(marker);
  assert(first >= 0 && first === last, 'incremental OQS lost the unique R3 execution seam');
  source = source.slice(0, first) + `\nexport {\n  buildLayer,\n  cellsMask,\n  classifyCut,\n  createConnectWinningLines,\n  enumerateAssignments,\n  geometryName,\n  occupiedCellsForSupport,\n  optimizeLineOrder,\n  pairKey,\n  restrictPair,\n  solveBsfpOwnershipAntichainWdl,\n};\n`;
  return source;
}

async function importTemporary(url, source, tag) {
  const path = fileURLToPath(url);
  try {
    writeFileSync(path, source, 'utf8');
    return await import(`${pathToFileURL(path).href}?${tag}=1`);
  } finally {
    rmSync(path, { force: true });
  }
}

const r3 = await importTemporary(R3_TEMP_URL, exportR3Internals(), 'incremental-oqs');
const {
  buildLayer,
  cellsMask,
  classifyCut,
  createConnectWinningLines,
  enumerateAssignments,
  geometryName,
  occupiedCellsForSupport,
  optimizeLineOrder,
  pairKey,
  restrictPair,
  solveBsfpOwnershipAntichainWdl,
} = r3;

function semanticKey(xMask, pair) {
  return `${xMask.toString(16)}|${pairKey(pair)}`;
}

function directRestrictPair(pair, cells, p0Mask) {
  if (cells.length === 0) return pair;
  const fixedMask = cellsMask(cells);
  const p1Mask = fixedMask & ~p0Mask;
  const wins = normalizeMinimalOwnershipAntichain(
    pair.wins
      .filter((mask) => (mask & p1Mask) === 0n)
      .map((mask) => mask & ~fixedMask),
  );
  const losses = normalizeMaximalOwnershipAntichain(
    pair.losses
      .filter((mask) => (p0Mask & ~mask) === 0n)
      .map((mask) => mask & ~fixedMask),
  );
  return Object.freeze({ wins, losses });
}

function oracleStateMap(layer) {
  const result = new Map();
  for (const [xMask, classes] of layer.byX) {
    for (const state of classes.values()) {
      const key = semanticKey(xMask, state.pair);
      assert(!result.has(key), 'independent oracle layer duplicated a semantic state');
      result.set(key, Object.freeze({ xMask, pair: state.pair }));
    }
  }
  assert(result.size === layer.stateCount, 'independent oracle layer state count mismatch');
  return result;
}

function assertSameStateSet(actual, expected, label) {
  assert(actual.size === expected.size, `${label} state count ${actual.size} != oracle ${expected.size}`);
  for (const key of actual.keys()) assert(expected.has(key), `${label} generated state missing from oracle: ${key}`);
  for (const key of expected.keys()) assert(actual.has(key), `${label} oracle state missing from generated quotient: ${key}`);
}

function updateFrontierMetrics(metrics, pair) {
  metrics.maxWinRecords = Math.max(metrics.maxWinRecords, pair.wins.length);
  metrics.maxLossRecords = Math.max(metrics.maxLossRecords, pair.losses.length);
  metrics.maxPairRecords = Math.max(metrics.maxPairRecords, pair.wins.length + pair.losses.length);
}

function summarizeLayer(cut, states, candidateCount, introducedWidth, generatedMs, dedupMs) {
  let winRecords = 0;
  let lossRecords = 0;
  let maxWinRecords = 0;
  let maxLossRecords = 0;
  for (const state of states.values()) {
    winRecords += state.pair.wins.length;
    lossRecords += state.pair.losses.length;
    maxWinRecords = Math.max(maxWinRecords, state.pair.wins.length);
    maxLossRecords = Math.max(maxLossRecords, state.pair.losses.length);
  }
  return Object.freeze({
    cut,
    states: states.size,
    candidateCount,
    introducedWidth,
    fanout: 2 ** introducedWidth,
    dedupRatio: candidateCount === 0 ? 1 : states.size / candidateCount,
    winRecords,
    lossRecords,
    totalPairRecords: winRecords + lossRecords,
    maxWinRecords,
    maxLossRecords,
    generatedMs,
    dedupMs,
  });
}

function synthesizeSupport({ spec, prepared, supportIndex, oracleMode, validateDirect }) {
  const { lines, orderData, solution } = prepared;
  const started = performance.now();
  const heights = solution.support.decodeHeights(supportIndex);
  const rank = solution.support.ranks[supportIndex];
  const occupiedCells = occupiedCellsForSupport(heights, spec.columns);
  const frontier = solution.frontierAt(supportIndex);

  let states = new Map([[semanticKey(0n, frontier), Object.freeze({ xMask: 0n, pair: frontier })]]);
  let totalDenseStates = states.size;
  let maxDenseStates = states.size;
  let transitionEntries = 0;
  let totalCandidates = 0;
  let generationMs = 0;
  let dedupMs = 0;
  let oracleBuildMs = 0;
  let oracleChecks = 0;
  let directChecks = 0;
  const frontierMetrics = { maxWinRecords: frontier.wins.length, maxLossRecords: frontier.losses.length, maxPairRecords: frontier.wins.length + frontier.losses.length };
  const layerSummaries = [summarizeLayer(0, states, 1, 0, 0, 0)];

  if (oracleMode) {
    const partition0 = classifyCut(occupiedCells, orderData.score.first, orderData.score.last, 0);
    const oracleStart = performance.now();
    const oracle = buildLayer({ frontier, partition: partition0, label: `${geometryName(spec)}/support-${supportIndex}/cut-0/oqs-oracle` });
    oracleBuildMs += performance.now() - oracleStart;
    assertSameStateSet(states, oracleStateMap(oracle), `${geometryName(spec)}/support-${supportIndex}/cut-0`);
    oracleChecks += 1;
  }

  for (let cut = 0; cut < lines.length; cut += 1) {
    const nextPartition = classifyCut(occupiedCells, orderData.score.first, orderData.score.last, cut + 1);
    const nextCrossingMask = cellsMask(nextPartition.crossing);
    const introduced = occupiedCells.filter((cell) => orderData.score.first[cell] === cut);
    assert(introduced.length <= spec.connect, `${geometryName(spec)}/support-${supportIndex}/cut-${cut} introduced width exceeds connect length`);
    const inputs = enumerateAssignments(introduced);
    const candidateCount = states.size * inputs.length;
    assert(Number.isSafeInteger(candidateCount), 'incremental OQS candidate count exceeded safe integer range');
    const candidates = new Array(candidateCount);

    let cursor = 0;
    let lap = performance.now();
    for (const state of states.values()) {
      for (const inputMask of inputs) {
        const pair = directRestrictPair(state.pair, introduced, inputMask);
        if (validateDirect) {
          const sequential = restrictPair(state.pair, introduced, inputMask);
          assert(pairKey(pair) === pairKey(sequential), `${geometryName(spec)}/support-${supportIndex}/cut-${cut} direct multi-cell cofactor diverged`);
          directChecks += 1;
        }
        const xMask = (state.xMask & nextCrossingMask) | (inputMask & nextCrossingMask);
        candidates[cursor] = Object.freeze({ xMask, pair });
        updateFrontierMetrics(frontierMetrics, pair);
        cursor += 1;
      }
    }
    const generatedMs = performance.now() - lap;
    generationMs += generatedMs;
    assert(cursor === candidateCount, 'incremental OQS candidate cursor mismatch');

    lap = performance.now();
    const next = new Map();
    for (const candidate of candidates) {
      const key = semanticKey(candidate.xMask, candidate.pair);
      if (!next.has(key)) next.set(key, candidate);
    }
    const layerDedupMs = performance.now() - lap;
    dedupMs += layerDedupMs;

    transitionEntries += candidateCount;
    totalCandidates += candidateCount;
    states = next;
    totalDenseStates += states.size;
    maxDenseStates = Math.max(maxDenseStates, states.size);
    layerSummaries.push(summarizeLayer(cut + 1, states, candidateCount, introduced.length, generatedMs, layerDedupMs));

    if (oracleMode) {
      const oracleStart = performance.now();
      const oracle = buildLayer({
        frontier,
        partition: nextPartition,
        label: `${geometryName(spec)}/support-${supportIndex}/cut-${cut + 1}/oqs-oracle`,
      });
      oracleBuildMs += performance.now() - oracleStart;
      assertSameStateSet(states, oracleStateMap(oracle), `${geometryName(spec)}/support-${supportIndex}/cut-${cut + 1}`);
      oracleChecks += 1;
    }
  }

  const checkpoint = R5_5X5_CHECKPOINTS.get(supportIndex);
  if (spec.columns === 5 && spec.rows === 5 && spec.connect === 4 && checkpoint) {
    assert(totalDenseStates === checkpoint.totalDenseStates, `5x5 support ${supportIndex} total dense states ${totalDenseStates} != R5 ${checkpoint.totalDenseStates}`);
    assert(maxDenseStates === checkpoint.maxDenseStates, `5x5 support ${supportIndex} max dense states ${maxDenseStates} != R5 ${checkpoint.maxDenseStates}`);
    assert(transitionEntries === checkpoint.transitionEntries, `5x5 support ${supportIndex} transitions ${transitionEntries} != R5 ${checkpoint.transitionEntries}`);
  }

  const activeLayerRecords = layerSummaries.reduce((maximum, layer) => Math.max(maximum, layer.totalPairRecords), 0);
  const maxLayerCandidateCount = layerSummaries.reduce((maximum, layer) => Math.max(maximum, layer.candidateCount), 0);
  return Object.freeze({
    supportIndex,
    rank,
    heights: [...heights],
    oracleMode,
    validateDirect,
    oracleChecks,
    directChecks,
    totalDenseStates,
    maxDenseStates,
    transitionEntries,
    totalCandidates,
    maxLayerCandidateCount,
    maxActiveLayerPairRecords: activeLayerRecords,
    maxWinRecordsPerState: frontierMetrics.maxWinRecords,
    maxLossRecordsPerState: frontierMetrics.maxLossRecords,
    maxPairRecordsPerState: frontierMetrics.maxPairRecords,
    generationMs,
    dedupMs,
    oracleBuildMs,
    synthesisMs: generationMs + dedupMs,
    elapsedMs: performance.now() - started,
    layerSummaries,
  });
}

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, selection: 'all', oracleMode: true, validateDirect: true }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, selection: 'all', oracleMode: true, validateDirect: true }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, selection: 'all', oracleMode: true, validateDirect: true }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, selection: 'supports', supports: Object.freeze([1284]), oracleMode: true, validateDirect: true }),
  Object.freeze({ columns: 5, rows: 4, connect: 4, selection: 'supports', supports: Object.freeze([2353]), oracleMode: true, validateDirect: true }),
  Object.freeze({ columns: 5, rows: 5, connect: 4, selection: 'supports', supports: Object.freeze([4426]), oracleMode: true, validateDirect: true }),
  Object.freeze({ columns: 5, rows: 5, connect: 4, selection: 'supports', supports: Object.freeze([4743, 6351, 6465]), oracleMode: false, validateDirect: false }),
]);

function prepareCase(config) {
  const spec = Object.freeze({ columns: config.columns, rows: config.rows, connect: config.connect });
  const lines = createConnectWinningLines(spec);
  let started = performance.now();
  const orderData = optimizeLineOrder(spec, lines);
  const lineOrderMs = performance.now() - started;
  started = performance.now();
  const solution = solveBsfpOwnershipAntichainWdl(spec);
  const c1SolveMs = performance.now() - started;
  const supportIndices = config.selection === 'all'
    ? Array.from({ length: solution.support.itemCapacity }, (_, index) => index)
    : [...config.supports];
  return Object.freeze({ spec, lines, orderData, solution, supportIndices, lineOrderMs, c1SolveMs });
}

const results = [];
for (const config of CASES) {
  const prepared = prepareCase(config);
  const supports = [];
  const started = performance.now();
  for (const supportIndex of prepared.supportIndices) {
    supports.push(synthesizeSupport({
      spec: prepared.spec,
      prepared,
      supportIndex,
      oracleMode: config.oracleMode,
      validateDirect: config.validateDirect,
    }));
  }
  results.push(Object.freeze({
    geometry: geometryName(prepared.spec),
    selection: config.selection,
    supportCount: prepared.supportIndices.length,
    oracleMode: config.oracleMode,
    validateDirect: config.validateDirect,
    lineOrderMs: prepared.lineOrderMs,
    c1SolveMs: prepared.c1SolveMs,
    synthesisElapsedMs: performance.now() - started,
    maxDenseStates: Math.max(...supports.map((entry) => entry.maxDenseStates)),
    maxLayerCandidateCount: Math.max(...supports.map((entry) => entry.maxLayerCandidateCount)),
    maxWinRecordsPerState: Math.max(...supports.map((entry) => entry.maxWinRecordsPerState)),
    maxLossRecordsPerState: Math.max(...supports.map((entry) => entry.maxLossRecordsPerState)),
    maxPairRecordsPerState: Math.max(...supports.map((entry) => entry.maxPairRecordsPerState)),
    totalSynthesisMs: supports.reduce((sum, entry) => sum + entry.synthesisMs, 0),
    totalOracleBuildMs: supports.reduce((sum, entry) => sum + entry.oracleBuildMs, 0),
    totalTransitionEntries: supports.reduce((sum, entry) => sum + entry.transitionEntries, 0),
    supports,
  }));
}

console.log(JSON.stringify({
  kind: 'connect4-bsfp-oqs-incremental-transition-synthesis',
  status: 'pass',
  claim: 'research-only exact incremental OQS construction using the R3 transition-closed residual quotient; direct multi-cell cofactors are checked against sequential cofactors on oracle controls; no CUDA/native-performance or 7x6 completion claim',
  algorithm: 'seed exact C1 residual pair once, then generate next quotient only from previous dense quotient x <= 2^connect local inputs; exact semantic-key dedup; no independent forgotten-history rebuild in the synthesis path',
  r5CheckpointSource: 'GitHub Actions run 34538774305 / commit 0dd21bd2d59d8a28a0c794666f0d2ded00b3ab0f',
  results,
}, null, 2));
