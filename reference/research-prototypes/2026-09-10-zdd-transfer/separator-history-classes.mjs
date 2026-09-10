import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';
import { createBsfpSupportLatticeProfile } from '../../../components/bsfp/support-lattice.mjs';
import {
  normalizeMaximalOwnershipAntichain,
  normalizeMinimalOwnershipAntichain,
  solveBsfpOwnershipAntichainWdl,
} from '../../../components/bsfp/ownership-antichain-solver.mjs';

const STATE_CAP = 250_000;
const HOT_SUPPORTS = 24;

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, selection: 'all' }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, selection: 'all' }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, selection: 'all' }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, selection: 'hot' }),
  Object.freeze({ columns: 5, rows: 4, connect: 4, selection: 'hot' }),
  Object.freeze({ columns: 5, rows: 5, connect: 4, selection: 'hot' }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

class CapacityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CapacityError';
  }
}

function geometryName(spec) {
  return `${spec.columns}x${spec.rows}:c${spec.connect}`;
}

function supportUniverseMask(heights, columns) {
  let mask = 0n;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < heights[column]; row += 1) mask |= 1n << BigInt(row * columns + column);
  }
  return mask;
}

function maskHex(mask) {
  return `0x${mask.toString(16)}`;
}

function pairKey(pair) {
  return `W:${pair.wins.map((mask) => mask.toString(16)).join(',')}|L:${pair.losses.map((mask) => mask.toString(16)).join(',')}`;
}

function frontiersOverlap(pair) {
  for (const win of pair.wins) for (const loss of pair.losses) if ((win & ~loss) === 0n) return true;
  return false;
}

function cofactorPair(pair, cell, p0Owns) {
  const bit = 1n << BigInt(cell);
  let wins;
  let losses;
  if (p0Owns) {
    wins = normalizeMinimalOwnershipAntichain(pair.wins.map((mask) => mask & ~bit));
    losses = normalizeMaximalOwnershipAntichain(
      pair.losses.filter((mask) => (mask & bit) !== 0n).map((mask) => mask & ~bit),
    );
  } else {
    wins = normalizeMinimalOwnershipAntichain(
      pair.wins.filter((mask) => (mask & bit) === 0n).map((mask) => mask & ~bit),
    );
    losses = normalizeMaximalOwnershipAntichain(pair.losses.map((mask) => mask & ~bit));
  }
  const result = Object.freeze({ wins, losses });
  assert(!frontiersOverlap(result), `cofactor overlap after fixing cell ${cell}=${p0Owns ? 1 : 0}`);
  return result;
}

function evaluatePair(pair, p0Mask) {
  const win = pair.wins.some((minimum) => (minimum & ~p0Mask) === 0n);
  const loss = pair.losses.some((maximum) => (p0Mask & ~maximum) === 0n);
  assert(!(win && loss), 'canonical Win/Loss pair overlaps at evaluation');
  return win ? 1 : loss ? -1 : 0;
}

function cofactorPartition(initialPair, cells, label) {
  let states = new Map([[pairKey(initialPair), Object.freeze({
    pair: initialPair,
    weight: 1n,
    witnessMask: 0n,
  })]]);

  for (const cell of cells) {
    const bit = 1n << BigInt(cell);
    const next = new Map();
    for (const state of states.values()) {
      for (const value of [0, 1]) {
        const pair = cofactorPair(state.pair, cell, value === 1);
        const key = pairKey(pair);
        const prior = next.get(key);
        if (prior) {
          next.set(key, Object.freeze({
            pair: prior.pair,
            weight: prior.weight + state.weight,
            witnessMask: prior.witnessMask,
          }));
        } else {
          next.set(key, Object.freeze({
            pair,
            weight: state.weight,
            witnessMask: state.witnessMask | (value ? bit : 0n),
          }));
        }
      }
    }
    if (next.size > STATE_CAP) throw new CapacityError(`${label} exceeded ${STATE_CAP} canonical cofactor states at cell ${cell}`);
    states = next;
  }
  return states;
}

function findDistinguishingAssignment(left, right, cells, index = 0) {
  if (pairKey(left) === pairKey(right)) return null;
  if (index === cells.length) {
    const leftWdl = evaluatePair(left, 0n);
    const rightWdl = evaluatePair(right, 0n);
    assert(leftWdl !== rightWdl, 'distinct canonical residual pairs lacked a W/D/L witness');
    return Object.freeze({ p0Mask: 0n, leftWdl, rightWdl });
  }

  const cell = cells[index];
  for (const value of [0, 1]) {
    const leftNext = cofactorPair(left, cell, value === 1);
    const rightNext = cofactorPair(right, cell, value === 1);
    if (pairKey(leftNext) === pairKey(rightNext)) continue;
    const suffix = findDistinguishingAssignment(leftNext, rightNext, cells, index + 1);
    if (suffix) {
      return Object.freeze({
        p0Mask: suffix.p0Mask | (value ? 1n << BigInt(cell) : 0n),
        leftWdl: suffix.leftWdl,
        rightWdl: suffix.rightWdl,
      });
    }
  }
  throw new Error('failed to construct residual-function distinguishing assignment');
}

function lineOrderScore(lines, cellCount, order) {
  const position = new Int16Array(lines.length);
  for (let index = 0; index < order.length; index += 1) position[order[index]] = index;
  const first = new Int16Array(cellCount);
  const last = new Int16Array(cellCount);
  first.fill(32767);
  last.fill(-1);
  for (let lineId = 0; lineId < lines.length; lineId += 1) {
    for (const cell of lines[lineId]) {
      const pos = position[lineId];
      first[cell] = Math.min(first[cell], pos);
      last[cell] = Math.max(last[cell], pos);
    }
  }
  const profile = [];
  let maximum = 0;
  let sum = 0;
  for (let cut = 1; cut < lines.length; cut += 1) {
    let crossing = 0;
    for (let cell = 0; cell < cellCount; cell += 1) {
      if (first[cell] < cut && last[cell] >= cut) crossing += 1;
    }
    profile.push(crossing);
    maximum = Math.max(maximum, crossing);
    sum += crossing;
  }
  return Object.freeze({ maximum, sum, mean: profile.length ? sum / profile.length : 0, profile, first, last });
}

function compareScore(left, right) {
  if (left.maximum !== right.maximum) return left.maximum - right.maximum;
  return left.sum - right.sum;
}

function optimizeLineOrder(spec, lines) {
  const cellCount = spec.columns * spec.rows;
  const center = (spec.columns - 1) / 2;
  const lineCenters = lines.map((line) => {
    let x = 0;
    let y = 0;
    for (const cell of line) {
      x += cell % spec.columns;
      y += Math.floor(cell / spec.columns);
    }
    return Object.freeze({ x: x / line.length, y: y / line.length });
  });
  let bestOrder = Array.from({ length: lines.length }, (_, lineId) => lineId).sort((a, b) =>
    Math.abs(lineCenters[a].x - center) - Math.abs(lineCenters[b].x - center)
      || lineCenters[a].x - lineCenters[b].x
      || lineCenters[a].y - lineCenters[b].y
      || a - b);
  let bestScore = lineOrderScore(lines, cellCount, bestOrder);

  let changed = true;
  let passes = 0;
  while (changed && passes < 20) {
    changed = false;
    passes += 1;
    let passOrder = bestOrder;
    let passScore = bestScore;
    for (let from = 0; from < lines.length; from += 1) {
      for (let to = 0; to < lines.length; to += 1) {
        if (from === to) continue;
        const candidate = bestOrder.slice();
        const [value] = candidate.splice(from, 1);
        candidate.splice(to, 0, value);
        const score = lineOrderScore(lines, cellCount, candidate);
        if (compareScore(score, passScore) < 0) {
          passOrder = candidate;
          passScore = score;
        }
      }
    }
    if (compareScore(passScore, bestScore) < 0) {
      bestOrder = passOrder;
      bestScore = passScore;
      changed = true;
    }
  }
  return Object.freeze({ order: Object.freeze(bestOrder), score: bestScore, passes });
}

function occupiedCellsForSupport(heights, columns) {
  const cells = [];
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < heights[column]; row += 1) cells.push(row * columns + column);
  }
  return cells;
}

function classifyCut(occupiedCells, first, last, cut) {
  const left = [];
  const crossing = [];
  const right = [];
  for (const cell of occupiedCells) {
    if (last[cell] < cut) left.push(cell);
    else if (first[cell] >= cut) right.push(cell);
    else crossing.push(cell);
  }
  assert(left.length + crossing.length + right.length === occupiedCells.length, 'cut partition lost occupied cells');
  return Object.freeze({ left, crossing, right });
}

function lineMasksFor(spec) {
  return createConnectWinningLines(spec).map((line) => {
    let mask = 0n;
    for (const cell of line) mask |= 1n << BigInt(cell);
    return mask;
  });
}

function hasWin(lineMasks, mask) {
  return lineMasks.some((line) => (line & ~mask) === 0n);
}

function isReachableNonterminalState(spec, targetHeights, fullP0Mask) {
  const support = createBsfpSupportLatticeProfile(spec);
  const lineMasks = lineMasksFor(spec);
  const targetIndex = support.encodeHeights([...targetHeights]);
  const targetRank = support.ranks[targetIndex];
  const reachable = new Uint8Array(support.itemCapacity);
  reachable[0] = 1;

  for (let rank = 0; rank <= targetRank; rank += 1) {
    for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
      if (!reachable[supportIndex] || support.ranks[supportIndex] !== rank) continue;
      const heights = support.decodeHeights(supportIndex);
      let insideTarget = true;
      for (let column = 0; column < spec.columns; column += 1) {
        if (heights[column] > targetHeights[column]) { insideTarget = false; break; }
      }
      if (!insideTarget) continue;
      const universe = supportUniverseMask(heights, spec.columns);
      const p0 = fullP0Mask & universe;
      const p1 = universe & ~fullP0Mask;
      if (hasWin(lineMasks, p0) || hasWin(lineMasks, p1)) continue;
      if (supportIndex === targetIndex) return true;

      const mover = rank & 1;
      for (let column = 0; column < spec.columns; column += 1) {
        const row = heights[column];
        if (row >= targetHeights[column]) continue;
        const cell = row * spec.columns + column;
        const owner = (fullP0Mask & (1n << BigInt(cell))) !== 0n ? 0 : 1;
        if (owner !== mover) continue;
        reachable[supportIndex + support.weights[column]] = 1;
      }
    }
  }
  return false;
}

function historyBits(count) {
  if (count <= 1) return 0;
  return Math.ceil(Math.log2(count));
}

function serializeCollision({ spec, heights, frontier, cut, partition, xState, historyStates }) {
  const values = [...historyStates.values()];
  assert(values.length >= 2, 'collision serialization requires at least two history classes');
  const leftClass = values[0];
  let rightClass = null;
  let distinction = null;
  for (let index = 1; index < Math.min(values.length, 32); index += 1) {
    const candidate = findDistinguishingAssignment(leftClass.pair, values[index].pair, partition.right);
    if (!candidate) continue;
    rightClass = values[index];
    distinction = candidate;
    break;
  }
  assert(rightClass && distinction, 'failed to select collision pair');

  const p0A = xState.witnessMask | leftClass.witnessMask | distinction.p0Mask;
  const p0B = xState.witnessMask | rightClass.witnessMask | distinction.p0Mask;
  const originalA = evaluatePair(frontier, p0A);
  const originalB = evaluatePair(frontier, p0B);
  assert(originalA === distinction.leftWdl && originalB === distinction.rightWdl, 'residual witness did not reproduce original function');
  assert(originalA !== originalB, 'collision witness did not change exact W/D/L');

  return Object.freeze({
    cut,
    heights: [...heights],
    leftCells: partition.left,
    crossingCells: partition.crossing,
    rightCells: partition.right,
    crossingP0Mask: maskHex(xState.witnessMask),
    forgottenP0MaskA: maskHex(leftClass.witnessMask),
    forgottenP0MaskB: maskHex(rightClass.witnessMask),
    suffixP0Mask: maskHex(distinction.p0Mask),
    completeP0MaskA: maskHex(p0A),
    completeP0MaskB: maskHex(p0B),
    wdlA: originalA,
    wdlB: originalB,
    legalNonterminalA: isReachableNonterminalState(spec, heights, p0A),
    legalNonterminalB: isReachableNonterminalState(spec, heights, p0B),
  });
}

function analyzeSupport({ spec, solution, orderData, supportIndex }) {
  const heights = solution.support.decodeHeights(supportIndex);
  const rank = solution.support.ranks[supportIndex];
  const frontier = solution.frontierAt(supportIndex);
  const occupiedCells = occupiedCellsForSupport(heights, spec.columns);
  let maxHistoryClasses = 1;
  let totalWeightedHistoryClasses = 0;
  let totalCrossingAssignments = 0;
  let worstCut = null;
  let firstCollision = null;
  let cutsMeasured = 0;
  let capacityCuts = 0;

  for (let cut = 1; cut < orderData.order.length; cut += 1) {
    const partition = classifyCut(occupiedCells, orderData.score.first, orderData.score.last, cut);
    if (partition.left.length === 0 || partition.right.length === 0) continue;
    cutsMeasured += 1;
    try {
      const xStates = cofactorPartition(frontier, partition.crossing, `${geometryName(spec)}/support-${supportIndex}/cut-${cut}/X`);
      let cutMax = 1;
      let cutWeighted = 0n;
      let cutWeight = 0n;
      let cutCollision = null;

      for (const xState of xStates.values()) {
        const histories = cofactorPartition(xState.pair, partition.left, `${geometryName(spec)}/support-${supportIndex}/cut-${cut}/L`);
        const classes = histories.size;
        cutMax = Math.max(cutMax, classes);
        cutWeighted += xState.weight * BigInt(classes);
        cutWeight += xState.weight;
        if (!cutCollision && classes > 1) {
          cutCollision = serializeCollision({ spec, heights, frontier, cut, partition, xState, historyStates: histories });
        }
      }

      const expectedWeight = 1n << BigInt(partition.crossing.length);
      assert(cutWeight === expectedWeight, `crossing partition weight mismatch at support ${supportIndex}/cut ${cut}`);
      const cutMean = Number(cutWeighted) / Number(cutWeight);
      totalWeightedHistoryClasses += Number(cutWeighted);
      totalCrossingAssignments += Number(cutWeight);
      if (cutMax > maxHistoryClasses || (cutMax === maxHistoryClasses && (!worstCut || cutMean > worstCut.meanHistoryClasses))) {
        maxHistoryClasses = cutMax;
        worstCut = Object.freeze({
          cut,
          leftWidth: partition.left.length,
          crossingWidth: partition.crossing.length,
          rightWidth: partition.right.length,
          canonicalCrossingCofactors: xStates.size,
          maxHistoryClasses: cutMax,
          meanHistoryClasses: cutMean,
        });
      }
      if (!firstCollision && cutCollision) firstCollision = cutCollision;
    } catch (error) {
      if (!(error instanceof CapacityError)) throw error;
      capacityCuts += 1;
    }
  }

  return Object.freeze({
    supportIndex,
    rank,
    heights: [...heights],
    boundaryRecords: frontier.wins.length + frontier.losses.length,
    cutsMeasured,
    capacityCuts,
    maxHistoryClasses,
    historyBits: historyBits(maxHistoryClasses),
    meanHistoryClasses: totalCrossingAssignments === 0 ? 1 : totalWeightedHistoryClasses / totalCrossingAssignments,
    worstCut,
    firstCollision,
  });
}

function chooseSupports(spec, solution, selection) {
  if (selection === 'all') return Array.from({ length: solution.support.itemCapacity }, (_, index) => index);
  const scored = Array.from({ length: solution.support.itemCapacity }, (_, supportIndex) => {
    const frontier = solution.frontierAt(supportIndex);
    return Object.freeze({ supportIndex, score: frontier.wins.length + frontier.losses.length, rank: solution.support.ranks[supportIndex] });
  }).sort((a, b) => b.score - a.score || b.rank - a.rank || a.supportIndex - b.supportIndex);
  const selected = new Set(scored.slice(0, HOT_SUPPORTS).map((entry) => entry.supportIndex));
  const anchors = [
    Array(spec.columns).fill(spec.rows),
    Array(spec.columns).fill(Math.floor(spec.rows / 2)),
    Array.from({ length: spec.columns }, (_, column) => Math.min(spec.rows, column + 1)),
    Array.from({ length: spec.columns }, (_, column) => Math.min(spec.rows, spec.columns - column)),
  ];
  for (const heights of anchors) selected.add(solution.support.encodeHeights(heights));
  return [...selected].sort((a, b) => a - b);
}

function analyzeCase(config) {
  const spec = Object.freeze({ columns: config.columns, rows: config.rows, connect: config.connect });
  const started = performance.now();
  const lines = createConnectWinningLines(spec);
  const orderData = optimizeLineOrder(spec, lines);
  const solvedStarted = performance.now();
  const solution = solveBsfpOwnershipAntichainWdl(spec);
  const solveElapsedMs = performance.now() - solvedStarted;
  const selectedSupports = chooseSupports(spec, solution, config.selection);
  const supports = [];
  let maxHistoryClasses = 1;
  let weightedMeanNumerator = 0;
  let weightedMeanDenominator = 0;
  let worst = null;
  let firstCollision = null;
  let firstPhysicallyLegalCollision = null;
  let capacityCuts = 0;

  for (const supportIndex of selectedSupports) {
    const result = analyzeSupport({ spec, solution, orderData, supportIndex });
    supports.push(result);
    capacityCuts += result.capacityCuts;
    maxHistoryClasses = Math.max(maxHistoryClasses, result.maxHistoryClasses);
    if (result.cutsMeasured > 0) {
      weightedMeanNumerator += result.meanHistoryClasses * result.cutsMeasured;
      weightedMeanDenominator += result.cutsMeasured;
    }
    if (!worst || result.maxHistoryClasses > worst.maxHistoryClasses
      || (result.maxHistoryClasses === worst.maxHistoryClasses && result.meanHistoryClasses > worst.meanHistoryClasses)) worst = result;
    if (!firstCollision && result.firstCollision) firstCollision = Object.freeze({ supportIndex, ...result.firstCollision });
    if (!firstPhysicallyLegalCollision && result.firstCollision
      && result.firstCollision.legalNonterminalA && result.firstCollision.legalNonterminalB) {
      firstPhysicallyLegalCollision = Object.freeze({ supportIndex, ...result.firstCollision });
    }
  }

  return Object.freeze({
    geometry: geometryName(spec),
    selection: config.selection,
    supportCount: solution.support.itemCapacity,
    selectedSupportCount: selectedSupports.length,
    lineCount: lines.length,
    lineOrder: orderData.order,
    lineOrderOptimizationPasses: orderData.passes,
    structuralMaximumCrossingWidth: orderData.score.maximum,
    structuralMeanCrossingWidth: orderData.score.mean,
    c1RootWdl: solution.rootWdl,
    c1BoundaryRecords: solution.stats.totalBoundaryRecords,
    c1SolveElapsedMs: solveElapsedMs,
    maxHistoryClasses,
    historyBits: historyBits(maxHistoryClasses),
    meanOfSupportCutMeans: weightedMeanDenominator === 0 ? 1 : weightedMeanNumerator / weightedMeanDenominator,
    capacityCuts,
    worstSupport: worst,
    firstCollision,
    firstPhysicallyLegalCollision,
    elapsedMs: performance.now() - started,
  });
}

const results = [];
for (const config of CASES) results.push(analyzeCase(config));

console.log(JSON.stringify({
  kind: 'connect4-bsfp-separator-hidden-history-census',
  status: results.some((entry) => entry.capacityCuts > 0) ? 'bounded-capacity' : 'pass',
  semantics: 'exact canonical cofactors of the C1 closed Win/Loss ownership-antichain functions; physical reachability is reported separately for collision witnesses',
  hypothesis: 'crossing occupied cells alone are a complete Markov boundary iff maxHistoryClasses is 1',
  stateCap: STATE_CAP,
  hotSupportCount: HOT_SUPPORTS,
  cases: results,
}, null, 2));
