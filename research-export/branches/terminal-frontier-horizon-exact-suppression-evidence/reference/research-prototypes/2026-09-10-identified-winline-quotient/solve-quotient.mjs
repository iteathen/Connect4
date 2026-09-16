import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';

const UNKNOWN = 2;
const STATE_CAP = 8_000_000;
const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedRootWdl: 0, expectedStates: 361427 }),
  Object.freeze({ columns: 5, rows: 5, connect: 4, expectedRootWdl: 0, expectedStates: null }),
]);

class StateCapError extends Error {
  constructor(summary) {
    super(`quotient state cap ${STATE_CAP} reached`);
    this.name = 'StateCapError';
    this.summary = summary;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createGeometry({ columns, rows, connect }) {
  const cellCount = columns * rows;
  assert(cellCount <= 30, 'u32 cell-mask quotient probe requires <=30 cells');
  const lines = createConnectWinningLines({ columns, rows, connect });
  assert(lines.length > 0 && lines.length < 31, 'u32 line-hit quotient probe requires 1..30 winning lines');

  const lineCellMasks = new Uint32Array(lines.length);
  const lineBits = new Uint32Array(lines.length);
  const cellLineMasks = new Uint32Array(cellCount);
  const cellLineIds = Array.from({ length: cellCount }, () => []);

  for (let lineId = 0; lineId < lines.length; lineId += 1) {
    let cellMask = 0;
    for (const cell of lines[lineId]) {
      cellMask = (cellMask | (1 << cell)) >>> 0;
      cellLineMasks[cell] = (cellLineMasks[cell] | (1 << lineId)) >>> 0;
      cellLineIds[cell].push(lineId);
    }
    lineCellMasks[lineId] = cellMask;
    lineBits[lineId] = (1 << lineId) >>> 0;
  }

  const supportBase = rows + 1;
  const supportWeights = new Uint32Array(columns);
  let supportCapacity = 1;
  for (let column = 0; column < columns; column += 1) {
    supportWeights[column] = supportCapacity;
    supportCapacity *= supportBase;
  }

  const support = Array.from({ length: supportCapacity });
  const rankItems = Array.from({ length: cellCount + 1 }, () => []);
  for (let supportIndex = 0; supportIndex < supportCapacity; supportIndex += 1) {
    let encoded = supportIndex;
    let rank = 0;
    let occupiedMask = 0;
    const landings = [];

    for (let column = 0; column < columns; column += 1) {
      const height = encoded % supportBase;
      encoded = Math.floor(encoded / supportBase);
      rank += height;
      for (let row = 0; row < height; row += 1) occupiedMask = (occupiedMask | (1 << (row * columns + column))) >>> 0;
      if (height < rows) {
        landings.push(Object.freeze({
          cell: height * columns + column,
          nextSupportIndex: supportIndex + supportWeights[column],
        }));
      }
    }

    support[supportIndex] = Object.freeze({ rank, occupiedMask, landings: Object.freeze(landings) });
    rankItems[rank].push(supportIndex);
  }

  const lineShift = BigInt(lines.length);
  const lineMask = (1n << lineShift) - 1n;
  function pairKey(p0HitMask, p1HitMask) {
    return BigInt(p0HitMask) | (BigInt(p1HitMask) << lineShift);
  }
  function decodePairKey(key) {
    return [Number(key & lineMask), Number(key >> lineShift)];
  }
  function terminal(nextOccupiedMask, landingCell, opponentHitMask) {
    for (const lineId of cellLineIds[landingCell]) {
      if ((opponentHitMask & lineBits[lineId]) !== 0) continue;
      const lineCellMask = lineCellMasks[lineId];
      if ((nextOccupiedMask & lineCellMask) === lineCellMask) return true;
    }
    return false;
  }

  return Object.freeze({
    columns,
    rows,
    connect,
    cellCount,
    lineCount: lines.length,
    supportCapacity,
    support,
    rankItems: Object.freeze(rankItems.map((items) => Object.freeze(items))),
    cellLineMasks,
    pairKey,
    decodePairKey,
    terminal,
  });
}

function generate(g) {
  const states = Array(g.supportCapacity).fill(null);
  states[0] = new Map([[0n, UNKNOWN]]);
  let totalStates = 1;
  let transitionEdges = 0;
  let terminalEdges = 0;
  let maximumSupportFrontier = 1;
  const rankSummaries = [];

  for (let rank = 0; rank <= g.cellCount; rank += 1) {
    let rankStates = 0;
    let activeSupports = 0;
    for (const supportIndex of g.rankItems[rank]) {
      const map = states[supportIndex];
      if (!map) continue;
      activeSupports += 1;
      rankStates += map.size;
      maximumSupportFrontier = Math.max(maximumSupportFrontier, map.size);

      if (rank === g.cellCount) continue;
      const mover = rank & 1;
      const support = g.support[supportIndex];
      for (const key of map.keys()) {
        const [p0HitMask, p1HitMask] = g.decodePairKey(key);
        for (const landing of support.landings) {
          transitionEdges += 1;
          const nextSupport = g.support[landing.nextSupportIndex];
          if (g.terminal(nextSupport.occupiedMask, landing.cell, mover === 0 ? p1HitMask : p0HitMask)) {
            terminalEdges += 1;
            continue;
          }
          const nextP0HitMask = mover === 0 ? (p0HitMask | g.cellLineMasks[landing.cell]) >>> 0 : p0HitMask;
          const nextP1HitMask = mover === 1 ? (p1HitMask | g.cellLineMasks[landing.cell]) >>> 0 : p1HitMask;
          const childKey = g.pairKey(nextP0HitMask, nextP1HitMask);
          let child = states[landing.nextSupportIndex];
          if (!child) {
            child = new Map();
            states[landing.nextSupportIndex] = child;
          }
          if (!child.has(childKey)) {
            child.set(childKey, UNKNOWN);
            totalStates += 1;
            if (totalStates > STATE_CAP) {
              throw new StateCapError({ rank, supportIndex, totalStates, transitionEdges, terminalEdges, maximumSupportFrontier });
            }
          }
        }
      }
    }
    rankSummaries.push(Object.freeze({ rank, activeSupports, quotientStates: rankStates }));
    console.error(`[quotient-scaling] ${g.columns}x${g.rows}:c${g.connect} rank=${rank} states=${rankStates} total=${totalStates}`);
  }

  return { states, totalStates, transitionEdges, terminalEdges, maximumSupportFrontier, rankSummaries };
}

function solve(g, graph) {
  for (let rank = g.cellCount; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    for (const supportIndex of g.rankItems[rank]) {
      const map = graph.states[supportIndex];
      if (!map) continue;
      const support = g.support[supportIndex];
      for (const key of map.keys()) {
        if (support.landings.length === 0) {
          map.set(key, 0);
          continue;
        }
        const [p0HitMask, p1HitMask] = g.decodePairKey(key);
        let best = mover === 0 ? -2 : 2;
        for (const landing of support.landings) {
          const nextSupport = g.support[landing.nextSupportIndex];
          let value;
          if (g.terminal(nextSupport.occupiedMask, landing.cell, mover === 0 ? p1HitMask : p0HitMask)) {
            value = mover === 0 ? 1 : -1;
          } else {
            const nextP0HitMask = mover === 0 ? (p0HitMask | g.cellLineMasks[landing.cell]) >>> 0 : p0HitMask;
            const nextP1HitMask = mover === 1 ? (p1HitMask | g.cellLineMasks[landing.cell]) >>> 0 : p1HitMask;
            const child = graph.states[landing.nextSupportIndex];
            assert(child, `missing child support ${landing.nextSupportIndex}`);
            value = child.get(g.pairKey(nextP0HitMask, nextP1HitMask));
            assert(value !== undefined && value !== UNKNOWN, `missing solved child at rank ${rank}`);
          }
          best = mover === 0 ? Math.max(best, value) : Math.min(best, value);
        }
        map.set(key, best);
      }
    }
  }
  return graph.states[0].get(0n);
}

function maskReuse(g, graph) {
  const either = new Set();
  let occurrences = 0;
  for (const map of graph.states) {
    if (!map) continue;
    for (const key of map.keys()) {
      const [p0HitMask, p1HitMask] = g.decodePairKey(key);
      either.add(p0HitMask);
      either.add(p1HitMask);
      occurrences += 2;
    }
  }
  return Object.freeze({
    uniqueEitherSideHitMasks: either.size,
    materializedMaskOccurrences: occurrences,
    occurrenceToUniqueRatio: occurrences / either.size,
    smallestIntegerRefBits: either.size <= 0x10000 ? 16 : 32,
  });
}

const results = [];
for (const spec of CASES) {
  const started = performance.now();
  const g = createGeometry(spec);
  try {
    const graph = generate(g);
    const generationElapsedMs = performance.now() - started;
    const rootWdl = solve(g, graph);
    const reuse = maskReuse(g, graph);
    if (spec.expectedStates !== null) assert(graph.totalStates === spec.expectedStates, `control state count mismatch: expected ${spec.expectedStates}, observed ${graph.totalStates}`);
    assert(rootWdl === spec.expectedRootWdl, `root WDL mismatch: expected ${spec.expectedRootWdl}, observed ${rootWdl}`);
    results.push(Object.freeze({
      geometry: `${g.columns}x${g.rows}:c${g.connect}`,
      status: 'complete',
      winningLineCount: g.lineCount,
      supportCount: g.supportCapacity,
      quotientStates: graph.totalStates,
      transitionEdges: graph.transitionEdges,
      terminalEdges: graph.terminalEdges,
      maximumSupportFrontier: graph.maximumSupportFrontier,
      rootWdl,
      maskReuse: reuse,
      rankSummaries: graph.rankSummaries,
      generationElapsedMs,
      elapsedMs: performance.now() - started,
    }));
  } catch (error) {
    if (!(error instanceof StateCapError)) throw error;
    results.push(Object.freeze({
      geometry: `${g.columns}x${g.rows}:c${g.connect}`,
      status: 'bounded-state-cap',
      winningLineCount: g.lineCount,
      supportCount: g.supportCapacity,
      stateCap: STATE_CAP,
      ...error.summary,
      elapsedMs: performance.now() - started,
    }));
  }
  if (global.gc) global.gc();
}

console.log(JSON.stringify({
  kind: 'connect4-identified-winline-quotient-direct-recurrence-scaling',
  productionSolverClaim: false,
  nativeCudaClaim: false,
  stateCap: STATE_CAP,
  cases: results,
}, null, 2));
