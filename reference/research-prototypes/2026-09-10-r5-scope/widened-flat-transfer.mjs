import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ZDD_DIR = new URL('../2026-09-10-zdd-transfer/', import.meta.url);
const R1_SOURCE_URL = new URL('separator-history-classes.mjs', ZDD_DIR);
const R1_TEMP_URL = new URL('.separator-r5-internals.tmp.mjs', ZDD_DIR);
const R4_SOURCE_URL = new URL('flat-transfer-table.mjs', ZDD_DIR);
const R4_TEMP_URL = new URL('.flat-r5-internals.tmp.mjs', ZDD_DIR);
const SAMPLE_5X5 = 4;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function exportR1Internals() {
  let source = readFileSync(R1_SOURCE_URL, 'utf8');
  const marker = '\nconst results = [];\nfor (const config of CASES) results.push(analyzeCase(config));\n\nconsole.log(JSON.stringify({';
  const first = source.indexOf(marker);
  const last = source.lastIndexOf(marker);
  assert(first >= 0 && first === last, 'R5 lost the unique R1 execution seam');
  source = source.slice(0, first) + `\nexport {\n  analyzeSupport,\n  chooseSupports,\n};\n`;
  return source;
}

function exportR4Internals() {
  let source = readFileSync(R4_SOURCE_URL, 'utf8');
  const marker = '\nconst results = [];\nfor (const config of CASES) results.push(await analyzeCase(config));\nconst failures = results.filter((entry) => entry.status !== \'pass\');\n';
  const first = source.indexOf(marker);
  const last = source.lastIndexOf(marker);
  assert(first >= 0 && first === last, 'R5 lost the unique R4 execution seam');
  source = source.slice(0, first) + `\nexport {\n  CapacityError,\n  buildLayer,\n  classifyCut,\n  compileDenseLayer,\n  compileTransition,\n  createConnectWinningLines,\n  flattenTables,\n  geometryName,\n  occupiedCellsForSupport,\n  optimizeLineOrder,\n  solveBsfpOwnershipAntichainWdl,\n};\n`;
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

const r1 = await importTemporary(R1_TEMP_URL, exportR1Internals(), 'r5-r1');
const r4 = await importTemporary(R4_TEMP_URL, exportR4Internals(), 'r5-r4');

const {
  CapacityError,
  buildLayer,
  classifyCut,
  compileDenseLayer,
  compileTransition,
  createConnectWinningLines,
  flattenTables,
  geometryName,
  occupiedCellsForSupport,
  optimizeLineOrder,
  solveBsfpOwnershipAntichainWdl,
} = r4;

function prepareGeometry(spec) {
  const lines = createConnectWinningLines(spec);
  let started = performance.now();
  const orderData = optimizeLineOrder(spec, lines);
  const lineOrderMs = performance.now() - started;
  started = performance.now();
  const solution = solveBsfpOwnershipAntichainWdl(spec);
  const c1SolveMs = performance.now() - started;
  const hotSupports = r1.chooseSupports(spec, solution, 'hot');
  assert(hotSupports.length >= 24 && hotSupports.length <= 28, `${geometryName(spec)} unexpected hot support count ${hotSupports.length}`);
  return Object.freeze({ lines, orderData, solution, hotSupports, lineOrderMs, c1SolveMs });
}

function recordMaximum(current, candidate, field) {
  if (!current || candidate[field] > current[field]) return candidate;
  if (candidate[field] === current[field] && candidate.supportIndex < current.supportIndex) return candidate;
  return current;
}

function qualifySupportSet({ spec, prepared, supportIndices, selection, includeSupportSummaries = false }) {
  const started = performance.now();
  const { lines, orderData, solution } = prepared;
  const phaseMs = { buildLayer: 0, compileDenseLayer: 0, compileTransition: 0, flattenTables: 0 };
  let totalTables = 0;
  let totalDenseStates = 0;
  let totalTransitionEntries = 0;
  let totalRuntimeBytes = 0;
  let totalU32RuntimeBytes = 0;
  let maxDenseStates = 0;
  let maxFlatSlots = 0;
  let maxHistoryClasses = 1;
  let maxHistoryBits = 0;
  let maxKeyBits = 0;
  let maxTargetWidthBytes = 1;
  let maxIntroducedWidth = 0;
  let maxFanout = 1;
  let minTargetCoverage = 1;
  let capacityFailure = null;
  let firstSemanticMismatch = null;
  let firstSerializationMismatch = null;
  let slowestSupport = null;
  let widestStateSupport = null;
  let largestArtifactSupport = null;
  const supportSummaries = [];

  supportLoop:
  for (const supportIndex of supportIndices) {
    assert(supportIndex >= 0 && supportIndex < solution.support.itemCapacity, `${geometryName(spec)} invalid support ${supportIndex}`);
    const supportStarted = performance.now();
    const heights = solution.support.decodeHeights(supportIndex);
    const rank = solution.support.ranks[supportIndex];
    const occupiedCells = occupiedCellsForSupport(heights, spec.columns);
    const supportTables = [];
    let oldLayer = null;
    let supportDenseStates = 0;
    let supportMaxDenseStates = 0;
    let supportMaxFlatSlots = 0;
    let supportMaxHistoryClasses = 1;
    let supportMaxHistoryBits = 0;
    let supportMaxKeyBits = 0;
    let supportMaxIntroducedWidth = 0;
    let supportMaxFanout = 1;
    let supportMinTargetCoverage = 1;
    const supportPhaseMs = { buildLayer: 0, compileDenseLayer: 0, compileTransition: 0, flattenTables: 0 };

    for (let cut = 0; cut <= lines.length; cut += 1) {
      const partition = classifyCut(occupiedCells, orderData.score.first, orderData.score.last, cut);
      let semanticLayer;
      let lap = performance.now();
      try {
        semanticLayer = buildLayer({
          frontier: solution.frontierAt(supportIndex),
          partition,
          label: `${geometryName(spec)}/support-${supportIndex}/cut-${cut}/r5-layer`,
        });
      } catch (error) {
        if (!(error instanceof CapacityError) && !String(error?.message).includes('explicit assignment count')) throw error;
        capacityFailure = Object.freeze({ supportIndex, rank, heights: [...heights], cut, message: String(error.message) });
        break supportLoop;
      }
      const buildMs = performance.now() - lap;
      phaseMs.buildLayer += buildMs;
      supportPhaseMs.buildLayer += buildMs;

      lap = performance.now();
      const layer = compileDenseLayer(semanticLayer);
      const denseMs = performance.now() - lap;
      phaseMs.compileDenseLayer += denseMs;
      supportPhaseMs.compileDenseLayer += denseMs;

      supportDenseStates += layer.stateCount;
      supportMaxDenseStates = Math.max(supportMaxDenseStates, layer.stateCount);
      supportMaxFlatSlots = Math.max(supportMaxFlatSlots, semanticLayer.flatSlots);
      supportMaxHistoryClasses = Math.max(supportMaxHistoryClasses, semanticLayer.maximumClassesPerX);
      supportMaxHistoryBits = Math.max(supportMaxHistoryBits, semanticLayer.historyBits);
      supportMaxKeyBits = Math.max(supportMaxKeyBits, semanticLayer.keyBits);

      if (oldLayer) {
        lap = performance.now();
        const table = compileTransition({
          spec,
          supportIndex,
          cut: cut - 1,
          orderData,
          occupiedCells,
          oldLayer,
          nextLayer: layer,
        });
        const transitionMs = performance.now() - lap;
        phaseMs.compileTransition += transitionMs;
        supportPhaseMs.compileTransition += transitionMs;
        supportTables.push(table);
        supportMaxIntroducedWidth = Math.max(supportMaxIntroducedWidth, table.introducedWidth);
        supportMaxFanout = Math.max(supportMaxFanout, table.fanout);
        supportMinTargetCoverage = Math.min(supportMinTargetCoverage, table.targetCoverage);
        if (!firstSemanticMismatch && table.firstSemanticMismatch) {
          firstSemanticMismatch = Object.freeze({ supportIndex, ...table.firstSemanticMismatch });
        }
      }
      oldLayer = layer;
    }

    let lap = performance.now();
    const artifact = flattenTables(supportTables);
    const flattenMs = performance.now() - lap;
    phaseMs.flattenTables += flattenMs;
    supportPhaseMs.flattenTables += flattenMs;
    if (!firstSerializationMismatch && artifact.firstSerializationMismatch) {
      firstSerializationMismatch = Object.freeze({ supportIndex, ...artifact.firstSerializationMismatch });
    }

    const expectedTables = lines.length;
    assert(supportTables.length === expectedTables, `${geometryName(spec)}/support-${supportIndex} table count ${supportTables.length} != ${expectedTables}`);
    assert(artifact.serializationMismatches === 0, `${geometryName(spec)}/support-${supportIndex} serialization mismatch`);

    const supportElapsedMs = performance.now() - supportStarted;
    const summary = Object.freeze({
      supportIndex,
      rank,
      heights: [...heights],
      denseStates: supportDenseStates,
      maxDenseStates: supportMaxDenseStates,
      maxFlatSlots: supportMaxFlatSlots,
      maxHistoryClasses: supportMaxHistoryClasses,
      maxHistoryBits: supportMaxHistoryBits,
      maxKeyBits: supportMaxKeyBits,
      maxIntroducedWidth: supportMaxIntroducedWidth,
      maxFanout: supportMaxFanout,
      minTargetCoverage: supportMinTargetCoverage,
      tables: supportTables.length,
      transitionEntries: artifact.totalEntries,
      targetWidthBytes: artifact.targetWidthBytes,
      runtimeBytes: artifact.runtimeBytes,
      u32RuntimeBytes: artifact.u32RuntimeBytes,
      phaseMs: Object.freeze({ ...supportPhaseMs }),
      elapsedMs: supportElapsedMs,
    });
    if (includeSupportSummaries) supportSummaries.push(summary);

    totalTables += supportTables.length;
    totalDenseStates += supportDenseStates;
    totalTransitionEntries += artifact.totalEntries;
    totalRuntimeBytes += artifact.runtimeBytes;
    totalU32RuntimeBytes += artifact.u32RuntimeBytes;
    maxDenseStates = Math.max(maxDenseStates, supportMaxDenseStates);
    maxFlatSlots = Math.max(maxFlatSlots, supportMaxFlatSlots);
    maxHistoryClasses = Math.max(maxHistoryClasses, supportMaxHistoryClasses);
    maxHistoryBits = Math.max(maxHistoryBits, supportMaxHistoryBits);
    maxKeyBits = Math.max(maxKeyBits, supportMaxKeyBits);
    maxTargetWidthBytes = Math.max(maxTargetWidthBytes, artifact.targetWidthBytes);
    maxIntroducedWidth = Math.max(maxIntroducedWidth, supportMaxIntroducedWidth);
    maxFanout = Math.max(maxFanout, supportMaxFanout);
    minTargetCoverage = Math.min(minTargetCoverage, supportMinTargetCoverage);
    slowestSupport = recordMaximum(slowestSupport, summary, 'elapsedMs');
    widestStateSupport = recordMaximum(widestStateSupport, summary, 'maxDenseStates');
    largestArtifactSupport = recordMaximum(largestArtifactSupport, summary, 'runtimeBytes');
  }

  const status = capacityFailure || firstSemanticMismatch || firstSerializationMismatch ? 'rejected-or-bounded' : 'pass';
  return Object.freeze({
    geometry: geometryName(spec),
    selection,
    selectedSupportCount: supportIndices.length,
    supportIndices: [...supportIndices],
    status,
    capacityFailure,
    firstSemanticMismatch,
    firstSerializationMismatch,
    totalTables,
    totalDenseStates,
    totalTransitionEntries,
    totalRuntimeBytes,
    totalU32RuntimeBytes,
    runtimeToU32Ratio: totalU32RuntimeBytes === 0 ? 1 : totalRuntimeBytes / totalU32RuntimeBytes,
    maxDenseStates,
    maxFlatSlots,
    maxHistoryClasses,
    maxHistoryBits,
    maxKeyBits,
    maxTargetWidthBytes,
    maxIntroducedWidth,
    maxFanout,
    minTargetCoverage,
    phaseMs: Object.freeze({ ...phaseMs }),
    phaseShare: Object.freeze(Object.fromEntries(Object.entries(phaseMs).map(([key, value]) => [key, value / Math.max(1e-9, Object.values(phaseMs).reduce((sum, item) => sum + item, 0))]))),
    slowestSupport,
    widestStateSupport,
    largestArtifactSupport,
    supportSummaries: includeSupportSummaries ? supportSummaries : undefined,
    elapsedMs: performance.now() - started,
  });
}

function profileView(profile) {
  return Object.freeze({
    supportIndex: profile.supportIndex,
    rank: profile.rank,
    heights: profile.heights,
    boundaryRecords: profile.boundaryRecords,
    maxHistoryClasses: profile.maxHistoryClasses,
    historyBits: profile.historyBits,
    meanHistoryClasses: profile.meanHistoryClasses,
    worstCut: profile.worstCut ? Object.freeze({
      cut: profile.worstCut.cut,
      leftWidth: profile.worstCut.leftWidth,
      crossingWidth: profile.worstCut.crossingWidth,
      rightWidth: profile.worstCut.rightWidth,
      maxHistoryClasses: profile.worstCut.maxHistoryClasses,
      meanHistoryClasses: profile.worstCut.meanHistoryClasses,
    }) : null,
  });
}

function descending(field, fallback = 'supportIndex') {
  return (a, b) => b[field] - a[field] || a[fallback] - b[fallback];
}

function selectAdversarial5x5(profiles) {
  const criteria = [
    Object.freeze({
      reason: 'max-history-classes',
      sorted: [...profiles].sort((a, b) => b.maxHistoryClasses - a.maxHistoryClasses || b.meanHistoryClasses - a.meanHistoryClasses || a.supportIndex - b.supportIndex),
    }),
    Object.freeze({
      reason: 'max-mean-history-classes',
      sorted: [...profiles].sort((a, b) => b.meanHistoryClasses - a.meanHistoryClasses || b.maxHistoryClasses - a.maxHistoryClasses || a.supportIndex - b.supportIndex),
    }),
    Object.freeze({
      reason: 'max-boundary-records',
      sorted: [...profiles].sort(descending('boundaryRecords')),
    }),
    Object.freeze({
      reason: 'widest-r1-worst-cut-crossing',
      sorted: [...profiles].sort((a, b) => (b.worstCut?.crossingWidth ?? -1) - (a.worstCut?.crossingWidth ?? -1)
        || b.maxHistoryClasses - a.maxHistoryClasses || a.supportIndex - b.supportIndex),
    }),
  ];

  const selected = new Map();
  for (const criterion of criteria) {
    const winner = criterion.sorted[0];
    const existing = selected.get(winner.supportIndex);
    if (existing) existing.reasons.push(criterion.reason);
    else selected.set(winner.supportIndex, { profile: winner, reasons: [criterion.reason] });
  }

  if (selected.size < SAMPLE_5X5) {
    const riskOrder = [...profiles].sort((a, b) => b.maxHistoryClasses - a.maxHistoryClasses
      || b.meanHistoryClasses - a.meanHistoryClasses
      || b.boundaryRecords - a.boundaryRecords
      || a.supportIndex - b.supportIndex);
    for (const profile of riskOrder) {
      if (selected.has(profile.supportIndex)) continue;
      selected.set(profile.supportIndex, { profile, reasons: ['risk-fill-distinct-support'] });
      if (selected.size >= SAMPLE_5X5) break;
    }
  }

  if (selected.size > SAMPLE_5X5) {
    const essential = [...selected.values()].sort((a, b) => b.profile.maxHistoryClasses - a.profile.maxHistoryClasses
      || b.profile.meanHistoryClasses - a.profile.meanHistoryClasses
      || b.profile.boundaryRecords - a.profile.boundaryRecords
      || a.profile.supportIndex - b.profile.supportIndex).slice(0, SAMPLE_5X5);
    selected.clear();
    for (const item of essential) selected.set(item.profile.supportIndex, item);
  }

  assert(selected.size === SAMPLE_5X5, `expected ${SAMPLE_5X5} distinct 5x5 supports, got ${selected.size}`);
  return Object.freeze([...selected.values()].sort((a, b) => a.profile.supportIndex - b.profile.supportIndex).map((item) => Object.freeze({
    ...profileView(item.profile),
    reasons: Object.freeze([...item.reasons]),
  })));
}

function summarizeR1Profiles(profiles, selected) {
  const selectedSet = new Set(selected.map((item) => item.supportIndex));
  const maxHistory = [...profiles].sort((a, b) => b.maxHistoryClasses - a.maxHistoryClasses || b.meanHistoryClasses - a.meanHistoryClasses || a.supportIndex - b.supportIndex)[0];
  const maxMean = [...profiles].sort((a, b) => b.meanHistoryClasses - a.meanHistoryClasses || b.maxHistoryClasses - a.maxHistoryClasses || a.supportIndex - b.supportIndex)[0];
  const maxBoundary = [...profiles].sort((a, b) => b.boundaryRecords - a.boundaryRecords || a.supportIndex - b.supportIndex)[0];
  return Object.freeze({
    hotSupportCount: profiles.length,
    maxHistory: profileView(maxHistory),
    maxMeanHistory: profileView(maxMean),
    maxBoundaryRecords: profileView(maxBoundary),
    selectedSupports: selected,
    selectedAreWithinHotSet: selected.every((item) => profiles.some((profile) => profile.supportIndex === item.supportIndex)),
    selectedDistinctCount: selectedSet.size,
  });
}

const specs = Object.freeze({
  fourByFive: Object.freeze({ columns: 4, rows: 5, connect: 4 }),
  fiveByFour: Object.freeze({ columns: 5, rows: 4, connect: 4 }),
  fiveByFive: Object.freeze({ columns: 5, rows: 5, connect: 4 }),
});

const prepared4x5 = prepareGeometry(specs.fourByFive);
const widened4x5 = qualifySupportSet({
  spec: specs.fourByFive,
  prepared: prepared4x5,
  supportIndices: prepared4x5.hotSupports,
  selection: 'full-r1-hot-set',
});

const prepared5x4 = prepareGeometry(specs.fiveByFour);
const widened5x4 = qualifySupportSet({
  spec: specs.fiveByFour,
  prepared: prepared5x4,
  supportIndices: prepared5x4.hotSupports,
  selection: 'full-r1-hot-set',
});

const prepared5x5 = prepareGeometry(specs.fiveByFive);
const r1ProfileStarted = performance.now();
const profiles5x5 = prepared5x5.hotSupports.map((supportIndex) => r1.analyzeSupport({
  spec: specs.fiveByFive,
  solution: prepared5x5.solution,
  orderData: prepared5x5.orderData,
  supportIndex,
}));
const r1ProfileMs = performance.now() - r1ProfileStarted;
assert(profiles5x5.every((profile) => profile.capacityCuts === 0), '5x5 adversarial selection encountered an R1 capacity cut');
const selected5x5 = selectAdversarial5x5(profiles5x5);
const widened5x5 = qualifySupportSet({
  spec: specs.fiveByFive,
  prepared: prepared5x5,
  supportIndices: selected5x5.map((item) => item.supportIndex),
  selection: `r1-adversarial-${SAMPLE_5X5}`,
  includeSupportSummaries: true,
});

const results = [widened4x5, widened5x4, widened5x5];
const failures = results.filter((entry) => entry.status !== 'pass');
const output = Object.freeze({
  kind: 'connect4-bsfp-r5-widened-flat-transfer-qualification',
  status: failures.length === 0 ? 'pass' : 'rejected-or-bounded',
  claim: 'research-only scope widening and compiler-phase profiling for the R3/R4 residual-class flat transfer representation; no CUDA or 7x6 solve claim',
  supportSelection: 'same R1 hot-set rule: top 24 C1 boundary-record supports plus four fixed anchors, deduplicated; 5x5 R4 is limited to four deterministic adversarial supports selected from exact R1 profiles',
  preparation: Object.freeze({
    fourByFive: Object.freeze({ hotSupportCount: prepared4x5.hotSupports.length, lineOrderMs: prepared4x5.lineOrderMs, c1SolveMs: prepared4x5.c1SolveMs }),
    fiveByFour: Object.freeze({ hotSupportCount: prepared5x4.hotSupports.length, lineOrderMs: prepared5x4.lineOrderMs, c1SolveMs: prepared5x4.c1SolveMs }),
    fiveByFive: Object.freeze({ hotSupportCount: prepared5x5.hotSupports.length, lineOrderMs: prepared5x5.lineOrderMs, c1SolveMs: prepared5x5.c1SolveMs, r1ProfileMs }),
  }),
  fiveByFiveR1Selection: summarizeR1Profiles(profiles5x5, selected5x5),
  results,
});

console.log(JSON.stringify(output));
if (failures.length > 0) process.exitCode = 1;
