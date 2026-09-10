import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';
import { solveBsfpOwnershipAntichainWdl } from '../../../components/bsfp/ownership-antichain-solver.mjs';

const SOURCE_URL = new URL('./separator-history-classes.mjs', import.meta.url);
const TEMP_URL = new URL('./.separator-transition-internals.tmp.mjs', import.meta.url);
const EXPLICIT_X_CAP = 1 << 16;

function loadInternalSource() {
  let source = readFileSync(SOURCE_URL, 'utf8');
  const marker = '\nconst results = [];\nfor (const config of CASES) results.push(analyzeCase(config));\n\nconsole.log(';
  const first = source.indexOf(marker);
  const last = source.lastIndexOf(marker);
  if (first < 0 || first !== last) throw new Error('separator transition adapter lost its unique execution seam');
  source = source.slice(0, first) + `\nexport {\n  CapacityError,\n  classifyCut,\n  cofactorPair,\n  cofactorPartition,\n  geometryName,\n  historyBits,\n  maskHex,\n  occupiedCellsForSupport,\n  optimizeLineOrder,\n  pairKey,\n};\n`;
  return source;
}

const tempPath = fileURLToPath(TEMP_URL);
let internals;
try {
  writeFileSync(tempPath, loadInternalSource(), 'utf8');
  internals = await import(`${pathToFileURL(tempPath).href}?transition-quotient=1`);
} finally {
  rmSync(tempPath, { force: true });
}

const {
  CapacityError,
  classifyCut,
  cofactorPair,
  cofactorPartition,
  geometryName,
  historyBits,
  maskHex,
  occupiedCellsForSupport,
  optimizeLineOrder,
  pairKey,
} = internals;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function cellsMask(cells) {
  let mask = 0n;
  for (const cell of cells) mask |= 1n << BigInt(cell);
  return mask;
}

function enumerateAssignments(cells) {
  const count = 1 << cells.length;
  assert(count <= EXPLICIT_X_CAP, `explicit assignment count ${count} exceeds ${EXPLICIT_X_CAP}`);
  const result = new Array(count);
  for (let value = 0; value < count; value += 1) {
    let mask = 0n;
    for (let bit = 0; bit < cells.length; bit += 1) {
      if ((value & (1 << bit)) !== 0) mask |= 1n << BigInt(cells[bit]);
    }
    result[value] = mask;
  }
  return result;
}

function restrictPair(pair, cells, p0Mask) {
  let current = pair;
  for (const cell of cells) {
    current = cofactorPair(current, cell, (p0Mask & (1n << BigInt(cell))) !== 0n);
  }
  return current;
}

function buildLayer({ frontier, partition, label }) {
  const xAssignments = enumerateAssignments(partition.crossing);
  const historiesByBasePair = new Map();
  const byX = new Map();
  let stateCount = 0;
  let maximumClassesPerX = 1;
  let totalClasses = 0;

  for (const xMask of xAssignments) {
    const basePair = restrictPair(frontier, partition.crossing, xMask);
    const baseKey = pairKey(basePair);
    let histories = historiesByBasePair.get(baseKey);
    if (!histories) {
      histories = cofactorPartition(basePair, partition.left, `${label}/L`);
      historiesByBasePair.set(baseKey, histories);
    }

    const classes = new Map();
    for (const [key, state] of histories) classes.set(key, state);
    byX.set(xMask, classes);
    stateCount += classes.size;
    totalClasses += classes.size;
    maximumClassesPerX = Math.max(maximumClassesPerX, classes.size);
  }

  const hBits = historyBits(maximumClassesPerX);
  const flatSlots = (1 << partition.crossing.length) * (1 << hBits);
  assert(stateCount <= flatSlots, `${label} dense states exceeded rectangular flat slots`);
  return Object.freeze({
    partition,
    byX,
    xAssignmentCount: xAssignments.length,
    distinctBasePairs: historiesByBasePair.size,
    stateCount,
    maximumClassesPerX,
    historyBits: hBits,
    keyBits: partition.crossing.length + hBits,
    flatSlots,
    flatOccupancy: flatSlots === 0 ? 1 : stateCount / flatSlots,
    meanClassesPerX: totalClasses / xAssignments.length,
  });
}

function setEquals(left, right) {
  if (left.size !== right.size) return false;
  for (const value of left) if (!right.has(value)) return false;
  return true;
}

function transitionLayer({ spec, supportIndex, cut, orderData, occupiedCells, oldLayer, nextLayer }) {
  const introduced = occupiedCells.filter((cell) => orderData.score.first[cell] === cut);
  const expectedIntroduced = new Set(oldLayer.partition.right.filter((cell) => !nextLayer.partition.right.includes(cell)));
  assert(setEquals(new Set(introduced), expectedIntroduced), `support ${supportIndex}/cut ${cut} introduced-cell identity mismatch`);
  assert(introduced.length <= spec.connect, `support ${supportIndex}/cut ${cut} introduced ${introduced.length} cells > connect ${spec.connect}`);

  const inputs = enumerateAssignments(introduced);
  const nextCrossingMask = cellsMask(nextLayer.partition.crossing);
  let transitions = 0;
  let firstClosureMismatch = null;
  const targetStates = new Set();

  for (const [oldXMask, classes] of oldLayer.byX) {
    for (const state of classes.values()) {
      for (const inputMask of inputs) {
        const nextPair = restrictPair(state.pair, introduced, inputMask);
        const nextKey = pairKey(nextPair);
        const nextXMask = (oldXMask & nextCrossingMask) | (inputMask & nextCrossingMask);
        const targetClasses = nextLayer.byX.get(nextXMask);
        if (!targetClasses || !targetClasses.has(nextKey)) {
          if (!firstClosureMismatch) {
            firstClosureMismatch = Object.freeze({
              supportIndex,
              cut,
              oldCrossingCells: oldLayer.partition.crossing,
              nextCrossingCells: nextLayer.partition.crossing,
              introducedCells: introduced,
              oldXMask: maskHex(oldXMask),
              forgottenWitnessMask: maskHex(state.witnessMask),
              inputMask: maskHex(inputMask),
              nextXMask: maskHex(nextXMask),
              missingResidualKey: nextKey,
            });
          }
        } else {
          targetStates.add(`${nextXMask.toString(16)}|${nextKey}`);
        }
        transitions += 1;
      }
    }
  }

  return Object.freeze({
    cut,
    introducedWidth: introduced.length,
    fanout: inputs.length,
    transitions,
    uniqueTargetsReached: targetStates.size,
    nextDenseStates: nextLayer.stateCount,
    targetCoverage: nextLayer.stateCount === 0 ? 1 : targetStates.size / nextLayer.stateCount,
    firstClosureMismatch,
  });
}

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, selection: 'all' }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, selection: 'all' }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, selection: 'all' }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, selection: 'r1-worst', supports: Object.freeze([1284]) }),
  Object.freeze({ columns: 5, rows: 4, connect: 4, selection: 'r1-worst', supports: Object.freeze([2353]) }),
  Object.freeze({ columns: 5, rows: 5, connect: 4, selection: 'r1-worst', supports: Object.freeze([4426]) }),
]);

function analyzeCase(config) {
  const spec = Object.freeze({ columns: config.columns, rows: config.rows, connect: config.connect });
  const started = performance.now();
  const lines = createConnectWinningLines(spec);
  const orderData = optimizeLineOrder(spec, lines);
  const solution = solveBsfpOwnershipAntichainWdl(spec);
  const supportIndices = config.selection === 'all'
    ? Array.from({ length: solution.support.itemCapacity }, (_, index) => index)
    : [...config.supports];

  let supportsVisited = 0;
  let layersBuilt = 0;
  let totalDenseStates = 0;
  let totalTransitions = 0;
  let maxCrossingWidth = 0;
  let maxHistoryClasses = 1;
  let maxHistoryBits = 0;
  let maxKeyBits = 0;
  let maxFlatSlots = 1;
  let maxDenseStates = 1;
  let minFlatOccupancy = 1;
  let maxIntroducedWidth = 0;
  let maxTransitionFanout = 1;
  let minTargetCoverage = 1;
  let firstClosureMismatch = null;
  let capacityFailure = null;
  let worstLayer = null;

  supportLoop:
  for (const supportIndex of supportIndices) {
    assert(supportIndex >= 0 && supportIndex < solution.support.itemCapacity, `${geometryName(spec)} invalid support ${supportIndex}`);
    supportsVisited += 1;
    const heights = solution.support.decodeHeights(supportIndex);
    const occupiedCells = occupiedCellsForSupport(heights, spec.columns);
    let oldLayer = null;

    for (let cut = 0; cut <= lines.length; cut += 1) {
      const partition = classifyCut(occupiedCells, orderData.score.first, orderData.score.last, cut);
      let layer;
      try {
        layer = buildLayer({
          frontier: solution.frontierAt(supportIndex),
          partition,
          label: `${geometryName(spec)}/support-${supportIndex}/cut-${cut}/transition-layer`,
        });
      } catch (error) {
        if (!(error instanceof CapacityError) && !String(error?.message).includes('explicit assignment count')) throw error;
        capacityFailure = Object.freeze({ supportIndex, heights, cut, message: String(error.message) });
        break supportLoop;
      }

      layersBuilt += 1;
      totalDenseStates += layer.stateCount;
      maxCrossingWidth = Math.max(maxCrossingWidth, partition.crossing.length);
      maxHistoryClasses = Math.max(maxHistoryClasses, layer.maximumClassesPerX);
      maxHistoryBits = Math.max(maxHistoryBits, layer.historyBits);
      maxKeyBits = Math.max(maxKeyBits, layer.keyBits);
      maxFlatSlots = Math.max(maxFlatSlots, layer.flatSlots);
      maxDenseStates = Math.max(maxDenseStates, layer.stateCount);
      minFlatOccupancy = Math.min(minFlatOccupancy, layer.flatOccupancy);
      if (!worstLayer || layer.keyBits > worstLayer.keyBits || (layer.keyBits === worstLayer.keyBits && layer.flatSlots > worstLayer.flatSlots)) {
        worstLayer = Object.freeze({
          supportIndex,
          rank: solution.support.ranks[supportIndex],
          heights: [...heights],
          cut,
          crossingWidth: partition.crossing.length,
          maximumClassesPerX: layer.maximumClassesPerX,
          historyBits: layer.historyBits,
          keyBits: layer.keyBits,
          denseStates: layer.stateCount,
          flatSlots: layer.flatSlots,
          flatOccupancy: layer.flatOccupancy,
          meanClassesPerX: layer.meanClassesPerX,
        });
      }

      if (oldLayer) {
        const transition = transitionLayer({
          spec,
          supportIndex,
          cut: cut - 1,
          orderData,
          occupiedCells,
          oldLayer,
          nextLayer: layer,
        });
        totalTransitions += transition.transitions;
        maxIntroducedWidth = Math.max(maxIntroducedWidth, transition.introducedWidth);
        maxTransitionFanout = Math.max(maxTransitionFanout, transition.fanout);
        minTargetCoverage = Math.min(minTargetCoverage, transition.targetCoverage);
        if (!firstClosureMismatch && transition.firstClosureMismatch) firstClosureMismatch = transition.firstClosureMismatch;
      }
      oldLayer = layer;
    }
  }

  return Object.freeze({
    geometry: geometryName(spec),
    selection: config.selection,
    selectedSupportCount: supportIndices.length,
    supportsVisited,
    layersBuilt,
    capacityFailure,
    transitionClosure: firstClosureMismatch ? 'rejected' : capacityFailure ? 'bounded-not-rejected' : 'pass',
    firstClosureMismatch,
    maxCrossingWidth,
    maxHistoryClasses,
    maxHistoryBits,
    maxKeyBits,
    maxFlatSlots,
    maxDenseStates,
    minFlatOccupancy,
    maxIntroducedWidth,
    maxTransitionFanout,
    minTargetCoverage,
    totalDenseStates,
    totalTransitions,
    worstLayer,
    elapsedMs: performance.now() - started,
  });
}

const results = CASES.map(analyzeCase);
const failures = results.filter((entry) => entry.transitionClosure !== 'pass');

console.log(JSON.stringify({
  kind: 'connect4-bsfp-residual-class-transition-quotient',
  status: failures.length === 0 ? 'pass' : 'bounded-or-rejected',
  claim: 'research-only exact adjacent-cut closure test for dense layer-local (X,h) residual classes; no CUDA or 7x6 solve claim',
  transitionInput: 'ownership of occupied cells whose first winning-line incidence is the newly processed line',
  expectedInputWidthBound: 'connect length',
  explicitCrossingAssignmentCap: EXPLICIT_X_CAP,
  results,
}, null, 2));
