import { performance } from 'node:perf_hooks';
import { createConnectWinningLines } from '../../../../components/bsfp/geometry.mjs';
import { createBsfpSupportLatticeProfile } from '../../../../components/bsfp/support-lattice.mjs';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { createQuotientNativeNegamaxKernel, QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

const EMPTY_SUPPORT = 0xffff_ffff;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function mix32(value) {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

function hashPhysical(supportIndex, p0Lo, p0Hi) {
  let hash = mix32((supportIndex + 0x9e3779b9) >>> 0);
  hash = mix32(hash ^ Math.imul((p0Lo + 1) >>> 0, 0x85ebca6b));
  hash = mix32(hash ^ Math.imul((p0Hi + 1) >>> 0, 0xc2b2ae35));
  return hash >>> 0;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function encodeBound(value) {
  return value + 1;
}

function decodeBound(value) {
  return value - 1;
}

function packRecord(lower, upper, bestMove) {
  const best = bestMove < 0 ? 7 : bestMove;
  return encodeBound(lower) | (encodeBound(upper) << 2) | ((best & 7) << 4);
}

function unpackLower(record) {
  return decodeBound(record & 3);
}

function unpackUpper(record) {
  return decodeBound((record >>> 2) & 3);
}

function unpackBest(record) {
  const best = (record >>> 4) & 7;
  return best === 7 ? -1 : best;
}

function maskPairFromCells(cells) {
  let lo = 0;
  let hi = 0;
  for (const cell of cells) {
    if (cell < 32) lo = (lo | ((2 ** cell) >>> 0)) >>> 0;
    else hi = (hi | ((2 ** (cell - 32)) >>> 0)) >>> 0;
  }
  return [lo >>> 0, hi >>> 0];
}

function pairSubsetOf(aLo, aHi, bLo, bHi) {
  return (((aLo & ~bLo) >>> 0) === 0) && (((aHi & ~bHi) >>> 0) === 0);
}

function createPhysicalGeometry(spec) {
  const support = createBsfpSupportLatticeProfile(spec);
  const { columns, rows } = spec;
  const cellCount = columns * rows;
  assert(cellCount <= 64, 'physical control supports at most 64 cells');

  const bitLo = new Uint32Array(cellCount);
  const bitHi = new Uint32Array(cellCount);
  for (let cell = 0; cell < cellCount; cell += 1) {
    if (cell < 32) bitLo[cell] = (2 ** cell) >>> 0;
    else bitHi[cell] = (2 ** (cell - 32)) >>> 0;
  }

  const landingCells = new Uint8Array(support.itemCapacity * columns);
  landingCells.fill(0xff);
  const childSupports = new Uint32Array(support.itemCapacity * columns);
  childSupports.fill(0xffff_ffff);
  const universeLo = new Uint32Array(support.itemCapacity);
  const universeHi = new Uint32Array(support.itemCapacity);

  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
    const heights = support.decodeHeights(supportIndex);
    let lo = 0;
    let hi = 0;
    for (let column = 0; column < columns; column += 1) {
      const height = heights[column];
      for (let row = 0; row < height; row += 1) {
        const cell = row * columns + column;
        lo = (lo | bitLo[cell]) >>> 0;
        hi = (hi | bitHi[cell]) >>> 0;
      }
      if (height < rows) {
        const edge = supportIndex * columns + column;
        landingCells[edge] = height * columns + column;
        childSupports[edge] = supportIndex + support.weights[column];
      }
    }
    universeLo[supportIndex] = lo;
    universeHi[supportIndex] = hi;
  }

  const lines = createConnectWinningLines(spec).map(maskPairFromCells);
  const incidence = Array.from({ length: cellCount }, () => []);
  for (const [lineLo, lineHi] of lines) {
    for (let cell = 0; cell < cellCount; cell += 1) {
      if ((((lineLo & bitLo[cell]) >>> 0) !== 0) || (((lineHi & bitHi[cell]) >>> 0) !== 0)) {
        incidence[cell].push([lineLo, lineHi]);
      }
    }
  }

  const centerOrder = Object.freeze(Array.from({ length: columns }, (_, column) => column)
    .sort((a, b) => {
      const center = (columns - 1) / 2;
      const delta = Math.abs(a - center) - Math.abs(b - center);
      return delta !== 0 ? delta : a - b;
    }));

  function ownMask(supportIndex, p0Lo, p0Hi, mover) {
    if (mover === 0) return [p0Lo >>> 0, p0Hi >>> 0];
    return [
      (universeLo[supportIndex] ^ p0Lo) >>> 0,
      (universeHi[supportIndex] ^ p0Hi) >>> 0,
    ];
  }

  function winningPlacement(supportIndex, p0Lo, p0Hi, mover, column) {
    const cell = landingCells[supportIndex * columns + column];
    if (cell === 0xff) return false;
    const [ownLo, ownHi] = ownMask(supportIndex, p0Lo, p0Hi, mover);
    const afterLo = (ownLo | bitLo[cell]) >>> 0;
    const afterHi = (ownHi | bitHi[cell]) >>> 0;
    for (const [lineLo, lineHi] of incidence[cell]) {
      if (pairSubsetOf(lineLo, lineHi, afterLo, afterHi)) return true;
    }
    return false;
  }

  const supportBytes = support.ranks.byteLength
    + support.weights.byteLength
    + landingCells.byteLength
    + childSupports.byteLength
    + universeLo.byteLength
    + universeHi.byteLength
    + bitLo.byteLength
    + bitHi.byteLength;

  return Object.freeze({
    ...spec,
    cellCount,
    support,
    bitLo,
    bitHi,
    landingCells,
    childSupports,
    universeLo,
    universeHi,
    incidence,
    centerOrder,
    winningPlacement,
    supportBytes,
  });
}

class ExactPhysicalTt {
  constructor(slotCount) {
    if ((slotCount & (slotCount - 1)) !== 0) throw new RangeError('slotCount must be power of two');
    this.slotCount = slotCount;
    this.mask = slotCount - 1;
    this.support = new Uint32Array(slotCount);
    this.support.fill(EMPTY_SUPPORT);
    this.p0Lo = new Uint32Array(slotCount);
    this.p0Hi = new Uint32Array(slotCount);
    this.record = new Uint8Array(slotCount);
    this.count = 0;
    this.metrics = { probes: 0, hits: 0, inserts: 0, maxProbe: 0 };
  }

  find(supportIndex, p0Lo, p0Hi) {
    this.metrics.probes += 1;
    let slot = hashPhysical(supportIndex, p0Lo, p0Hi) & this.mask;
    let distance = 0;
    while (true) {
      const s = this.support[slot];
      if (s === EMPTY_SUPPORT) {
        if (distance > this.metrics.maxProbe) this.metrics.maxProbe = distance;
        return ~slot;
      }
      if (s === supportIndex && this.p0Lo[slot] === (p0Lo >>> 0) && this.p0Hi[slot] === (p0Hi >>> 0)) {
        this.metrics.hits += 1;
        if (distance > this.metrics.maxProbe) this.metrics.maxProbe = distance;
        return slot;
      }
      slot = (slot + 1) & this.mask;
      distance += 1;
      if (distance >= this.slotCount) throw new Error('physical TT is full');
    }
  }

  ensure(supportIndex, p0Lo, p0Hi) {
    const found = this.find(supportIndex, p0Lo, p0Hi);
    if (found >= 0) return found;
    const slot = ~found;
    this.support[slot] = supportIndex;
    this.p0Lo[slot] = p0Lo >>> 0;
    this.p0Hi[slot] = p0Hi >>> 0;
    this.record[slot] = packRecord(-1, 1, -1);
    this.count += 1;
    this.metrics.inserts += 1;
    return slot;
  }

  bytes() {
    return this.support.byteLength + this.p0Lo.byteLength + this.p0Hi.byteLength + this.record.byteLength;
  }
}

function choosePhysicalTtSlots(memoryBudgetBytes, supportBytes) {
  const available = memoryBudgetBytes - supportBytes;
  const bytesPerSlot = 13;
  assert(available >= bytesPerSlot * 1024, 'memory budget too small for physical TT control');
  let slots = 1024;
  while ((slots * 2) * bytesPerSlot <= available) slots *= 2;
  return slots;
}

function createPhysicalWdlSolver(spec, memoryBudgetBytes) {
  const g = createPhysicalGeometry(spec);
  const ttSlots = choosePhysicalTtSlots(memoryBudgetBytes, g.supportBytes);
  const tt = new ExactPhysicalTt(ttSlots);
  const moveStack = new Int8Array((g.cellCount + 1) * g.columns);

  const metrics = {
    calls: 0,
    expanded: 0,
    ttExactReturns: 0,
    ttBoundReturns: 0,
    ttMoveOrderHits: 0,
    tacticalExact: 0,
    forcedNodes: 0,
    cutoffs: 0,
    firstMoveCutoffs: 0,
    transitions: 0,
    terminalTransitions: 0,
  };

  function prepareMoves(supportIndex, bestMove, forcedColumn) {
    const rank = g.support.ranks[supportIndex];
    const base = rank * g.columns;
    let count = 0;
    if (forcedColumn >= 0) {
      moveStack[base] = forcedColumn;
      metrics.forcedNodes += 1;
      return 1;
    }
    if (bestMove >= 0 && g.landingCells[supportIndex * g.columns + bestMove] !== 0xff) {
      moveStack[base + count] = bestMove;
      count += 1;
      metrics.ttMoveOrderHits += 1;
    }
    for (const column of g.centerOrder) {
      if (column === bestMove) continue;
      if (g.landingCells[supportIndex * g.columns + column] === 0xff) continue;
      moveStack[base + count] = column;
      count += 1;
    }
    return count;
  }

  function tactical(supportIndex, p0Lo, p0Hi) {
    const mover = g.support.ranks[supportIndex] & 1;
    let immediate = -1;
    let forced = -1;
    let threats = 0;
    let legal = 0;
    for (const column of g.centerOrder) {
      if (g.landingCells[supportIndex * g.columns + column] === 0xff) continue;
      legal += 1;
      if (immediate < 0 && g.winningPlacement(supportIndex, p0Lo, p0Hi, mover, column)) immediate = column;
      if (g.winningPlacement(supportIndex, p0Lo, p0Hi, mover ^ 1, column)) {
        threats += 1;
        if (forced < 0) forced = column;
      }
    }
    if (immediate >= 0) return { kind: 'win', column: immediate };
    if (threats > 1) return { kind: 'loss' };
    if (legal === 0) return { kind: 'draw' };
    if (threats === 1) return { kind: 'forced', column: forced };
    return { kind: 'none' };
  }

  function child(supportIndex, p0Lo, p0Hi, column) {
    metrics.transitions += 1;
    const edge = supportIndex * g.columns + column;
    const cell = g.landingCells[edge];
    if (cell === 0xff) return null;
    const mover = g.support.ranks[supportIndex] & 1;
    if (g.winningPlacement(supportIndex, p0Lo, p0Hi, mover, column)) {
      metrics.terminalTransitions += 1;
      return { terminal: true };
    }
    let childLo = p0Lo >>> 0;
    let childHi = p0Hi >>> 0;
    if (mover === 0) {
      childLo = (childLo | g.bitLo[cell]) >>> 0;
      childHi = (childHi | g.bitHi[cell]) >>> 0;
    }
    return {
      terminal: false,
      supportIndex: g.childSupports[edge],
      p0Lo: childLo,
      p0Hi: childHi,
    };
  }

  function search(supportIndex, p0Lo, p0Hi, alpha, beta) {
    metrics.calls += 1;
    let located = tt.find(supportIndex, p0Lo, p0Hi);
    let lower = -1;
    let upper = 1;
    let bestMove = -1;
    if (located >= 0) {
      const record = tt.record[located];
      lower = unpackLower(record);
      upper = unpackUpper(record);
      bestMove = unpackBest(record);
      if (lower === upper) {
        metrics.ttExactReturns += 1;
        return lower;
      }
      if (lower >= beta) {
        metrics.ttBoundReturns += 1;
        return lower;
      }
      if (upper <= alpha) {
        metrics.ttBoundReturns += 1;
        return upper;
      }
    }

    const tact = tactical(supportIndex, p0Lo, p0Hi);
    if (tact.kind === 'win' || tact.kind === 'loss' || tact.kind === 'draw') {
      const value = tact.kind === 'win' ? 1 : tact.kind === 'loss' ? -1 : 0;
      const slot = located >= 0 ? located : tt.ensure(supportIndex, p0Lo, p0Hi);
      tt.record[slot] = packRecord(value, value, tact.column ?? -1);
      metrics.tacticalExact += 1;
      return value;
    }

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower);
    beta = Math.min(beta, upper);

    const forcedColumn = tact.kind === 'forced' ? tact.column : -1;
    const moveCount = prepareMoves(supportIndex, bestMove, forcedColumn);
    const rank = g.support.ranks[supportIndex];
    const base = rank * g.columns;
    metrics.expanded += 1;

    let value = -2;
    let selected = -1;
    for (let index = 0; index < moveCount; index += 1) {
      const column = moveStack[base + index];
      const next = child(supportIndex, p0Lo, p0Hi, column);
      assert(next !== null, 'prepared legal physical move became illegal');
      const score = next.terminal
        ? 1
        : -search(next.supportIndex, next.p0Lo, next.p0Hi, -beta, -alpha);
      if (score > value) {
        value = score;
        selected = column;
      }
      if (value > alpha) alpha = value;
      if (alpha >= beta) {
        metrics.cutoffs += 1;
        if (index === 0) metrics.firstMoveCutoffs += 1;
        break;
      }
    }

    const slot = located >= 0 ? located : tt.ensure(supportIndex, p0Lo, p0Hi);
    if (value <= originalAlpha) upper = Math.min(upper, value);
    else if (value >= originalBeta) lower = Math.max(lower, value);
    else {
      lower = value;
      upper = value;
    }
    tt.record[slot] = packRecord(lower, upper, selected);
    return value;
  }

  function run() {
    return search(0, 0, 0, -2, 2);
  }

  function rootActionValues() {
    const values = Array(g.columns).fill(null);
    for (let column = 0; column < g.columns; column += 1) {
      const next = child(0, 0, 0, column);
      if (next === null) continue;
      values[column] = next.terminal ? 1 : -search(next.supportIndex, next.p0Lo, next.p0Hi, -2, 2);
    }
    return values;
  }

  return Object.freeze({
    run,
    rootActionValues,
    metrics,
    tt,
    geometry: g,
    typedBytes: g.supportBytes + tt.bytes() + moveStack.byteLength,
  });
}

function expectedRootActions(spec, oracle) {
  const result = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0);
    heights[column] = 1;
    result[column] = oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(column) });
  }
  return result;
}

function runQuotientOnce(spec, expectedWdl, expectedActions, qualifyActions) {
  const started = performance.now();
  const kernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const setupMs = performance.now() - started;
  const solver = kernel.createWdlSolver({ wdlMode: 'full', etc: false, etcMinRemaining: 0 });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `quotient root WDL mismatch expected ${expectedWdl}, got ${result}`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `quotient root action ${column} mismatch`);
    }
  }
  return Object.freeze({
    result,
    actions,
    setupMs,
    solveMs,
    totalMs: performance.now() - started,
    metrics: Object.freeze({ ...solver.metrics }),
    qStates: kernel.states.count,
    residualClasses: kernel.classes.size,
    typedBytesLowerBound: kernel.memoryStats().totalTypedBytes,
  });
}

function runPhysicalOnce(spec, expectedWdl, expectedActions, memoryBudget, qualifyActions) {
  const started = performance.now();
  const solver = createPhysicalWdlSolver(spec, memoryBudget);
  const setupMs = performance.now() - started;
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `physical root WDL mismatch expected ${expectedWdl}, got ${result}`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `physical root action ${column} mismatch`);
    }
  }
  assert(solver.typedBytes <= memoryBudget, `physical typed bytes ${solver.typedBytes} exceed quotient budget ${memoryBudget}`);
  return Object.freeze({
    result,
    actions,
    setupMs,
    solveMs,
    totalMs: performance.now() - started,
    metrics: Object.freeze({ ...solver.metrics }),
    tt: Object.freeze({
      slotCount: solver.tt.slotCount,
      occupied: solver.tt.count,
      load: solver.tt.count / solver.tt.slotCount,
      metrics: Object.freeze({ ...solver.tt.metrics }),
    }),
    typedBytes: solver.typedBytes,
    memoryBudget,
  });
}

function benchmarkCase(spec, repeats = 11) {
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);

  const quotientQualification = runQuotientOnce(spec, oracle.rootWdl, expectedActions, true);
  const quotientBudget = quotientQualification.typedBytesLowerBound;
  const physicalQualification = runPhysicalOnce(spec, oracle.rootWdl, expectedActions, quotientBudget, true);

  const quotientRuns = [];
  const physicalRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    quotientRuns.push(runQuotientOnce(spec, oracle.rootWdl, expectedActions, false));
    physicalRuns.push(runPhysicalOnce(spec, oracle.rootWdl, expectedActions, quotientBudget, false));
  }
  const quotientRepresentative = [...quotientRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const physicalRepresentative = [...physicalRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];

  const result = Object.freeze({
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    expectedWdl: oracle.rootWdl,
    expectedActions,
    memoryBudgetTypedBytes: quotientBudget,
    quotient: Object.freeze({
      totalMsMedian: median(quotientRuns.map((run) => run.totalMs)),
      solveMsMedian: median(quotientRuns.map((run) => run.solveMs)),
      setupMsMedian: median(quotientRuns.map((run) => run.setupMs)),
      representative: quotientRepresentative,
    }),
    physical: Object.freeze({
      totalMsMedian: median(physicalRuns.map((run) => run.totalMs)),
      solveMsMedian: median(physicalRuns.map((run) => run.solveMs)),
      setupMsMedian: median(physicalRuns.map((run) => run.setupMs)),
      representative: physicalRepresentative,
      qualification: physicalQualification,
    }),
  });

  console.error(
    `[quotient-vs-physical] ${result.geometry}`
    + ` quotientMs=${result.quotient.totalMsMedian.toFixed(3)}`
    + ` physicalMs=${result.physical.totalMsMedian.toFixed(3)}`
    + ` quotientExpanded=${result.quotient.representative.metrics.expanded}`
    + ` physicalExpanded=${result.physical.representative.metrics.expanded}`
    + ` physicalSlots=${result.physical.representative.tt.slotCount}`,
  );
  return result;
}

const cases = CASES.map((spec) => benchmarkCase(spec));
const compact = cases.map((entry) => ({
  geometry: entry.geometry,
  memoryBudgetTypedBytes: entry.memoryBudgetTypedBytes,
  quotient: {
    totalMsMedian: entry.quotient.totalMsMedian,
    solveMsMedian: entry.quotient.solveMsMedian,
    expanded: entry.quotient.representative.metrics.expanded,
    calls: entry.quotient.representative.metrics.calls,
    qStates: entry.quotient.representative.qStates,
    residualClasses: entry.quotient.representative.residualClasses,
    typedBytesLowerBound: entry.quotient.representative.typedBytesLowerBound,
  },
  physical: {
    totalMsMedian: entry.physical.totalMsMedian,
    solveMsMedian: entry.physical.solveMsMedian,
    expanded: entry.physical.representative.metrics.expanded,
    calls: entry.physical.representative.metrics.calls,
    ttSlots: entry.physical.representative.tt.slotCount,
    ttOccupied: entry.physical.representative.tt.occupied,
    ttLoad: entry.physical.representative.tt.load,
    typedBytes: entry.physical.representative.typedBytes,
  },
  timeRatioQuotientOverPhysical: entry.quotient.totalMsMedian / entry.physical.totalMsMedian,
  expansionRatioQuotientOverPhysical: entry.quotient.representative.metrics.expanded / entry.physical.representative.metrics.expanded,
}));

console.error(`QUOTIENT_VS_PHYSICAL_SUMMARY=${JSON.stringify(compact)}`);
console.log(JSON.stringify({
  kind: 'connect4-quotient-native-vs-physical-wdl-control-v1',
  status: 'complete',
  date: '2026-09-11',
  fairness: {
    valueContract: 'exact WDL fail-soft full-window negamax',
    tacticalClosure: 'immediate-win forced-response double-threat on both sides',
    moveOrder: 'TT-best then center-first',
    physicalIdentity: 'exact supportIndex + exact P0 ownership bitmask; P1 derived from support universe',
    physicalTT: 'exact key equality; no probabilistic Zobrist collision authority',
    physicalTTBudget: 'largest power-of-two exact TT whose typed arrays plus support tables fit within the quotient typed-array lower-bound budget',
    quotientTransitionInterningIncluded: true,
    quotientResidualTransitionCostIncluded: true,
    qualificationOracle: 'independent BSFP WDL root and root-action results',
  },
  caveat: 'Typed-array budget is not complete JS heap accounting for the quotient implementation; this is a bounded-control engineering comparison, not a production 7x6 claim.',
  cases,
}, null, 2));
