import { createConnectWinningLines } from '../../../../components/bsfp/geometry.mjs';
import { createBsfpSupportLatticeProfile } from '../../../../components/bsfp/support-lattice.mjs';

const EMPTY_SUPPORT = 0xffff_ffff;

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

export function createPhysicalWdlGeometry(spec) {
  const support = createBsfpSupportLatticeProfile(spec);
  const { columns, rows } = spec;
  const cellCount = columns * rows;
  if (cellCount > 64) throw new RangeError('physical two-lane control supports at most 64 cells');

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

  const incidence = Array.from({ length: cellCount }, () => []);
  for (const [lineLo, lineHi] of createConnectWinningLines(spec).map(maskPairFromCells)) {
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

  const typedBytes = support.ranks.byteLength
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
    typedBytes,
  });
}

class SetAssociativePhysicalTt {
  constructor(slotCount, supportRanks, ways = 4) {
    if ((slotCount & (slotCount - 1)) !== 0) throw new RangeError('slotCount must be a power of two');
    if ((ways & (ways - 1)) !== 0 || ways > slotCount) throw new RangeError('ways must be a power of two <= slotCount');
    this.slotCount = slotCount;
    this.ways = ways;
    this.bucketCount = slotCount / ways;
    if ((this.bucketCount & (this.bucketCount - 1)) !== 0) throw new RangeError('bucket count must be a power of two');
    this.bucketMask = this.bucketCount - 1;
    this.supportRanks = supportRanks;
    this.support = new Uint32Array(slotCount);
    this.support.fill(EMPTY_SUPPORT);
    this.p0Lo = new Uint32Array(slotCount);
    this.p0Hi = new Uint32Array(slotCount);
    this.record = new Uint8Array(slotCount);
    this.count = 0;
    this.metrics = {
      probes: 0,
      hits: 0,
      misses: 0,
      inserts: 0,
      replacements: 0,
      exactVictims: 0,
    };
  }

  bucketBase(supportIndex, p0Lo, p0Hi) {
    return (hashPhysical(supportIndex, p0Lo, p0Hi) & this.bucketMask) * this.ways;
  }

  find(supportIndex, p0Lo, p0Hi) {
    this.metrics.probes += 1;
    const base = this.bucketBase(supportIndex, p0Lo, p0Hi);
    for (let offset = 0; offset < this.ways; offset += 1) {
      const slot = base + offset;
      if (this.support[slot] === supportIndex
          && this.p0Lo[slot] === (p0Lo >>> 0)
          && this.p0Hi[slot] === (p0Hi >>> 0)) {
        this.metrics.hits += 1;
        return slot;
      }
    }
    this.metrics.misses += 1;
    return -1;
  }

  chooseVictim(base) {
    let victim = base;
    let victimExact = true;
    let victimRank = -1;
    for (let offset = 0; offset < this.ways; offset += 1) {
      const slot = base + offset;
      const supportIndex = this.support[slot];
      if (supportIndex === EMPTY_SUPPORT) return slot;
      const record = this.record[slot];
      const exact = unpackLower(record) === unpackUpper(record);
      const rank = this.supportRanks[supportIndex];
      if (offset === 0
          || (victimExact && !exact)
          || (victimExact === exact && rank > victimRank)) {
        victim = slot;
        victimExact = exact;
        victimRank = rank;
      }
    }
    return victim;
  }

  allocate(supportIndex, p0Lo, p0Hi) {
    const base = this.bucketBase(supportIndex, p0Lo, p0Hi);
    const slot = this.chooseVictim(base);
    if (this.support[slot] === EMPTY_SUPPORT) {
      this.count += 1;
      this.metrics.inserts += 1;
    } else {
      const previous = this.record[slot];
      if (unpackLower(previous) === unpackUpper(previous)) this.metrics.exactVictims += 1;
      this.metrics.replacements += 1;
    }
    this.support[slot] = supportIndex;
    this.p0Lo[slot] = p0Lo >>> 0;
    this.p0Hi[slot] = p0Hi >>> 0;
    this.record[slot] = packRecord(-1, 1, -1);
    return slot;
  }

  ensure(supportIndex, p0Lo, p0Hi) {
    const found = this.find(supportIndex, p0Lo, p0Hi);
    return found >= 0 ? found : this.allocate(supportIndex, p0Lo, p0Hi);
  }

  bytes() {
    return this.support.byteLength + this.p0Lo.byteLength + this.p0Hi.byteLength + this.record.byteLength;
  }
}

function chooseTtSlots(memoryBudgetBytes, geometryBytes) {
  const available = memoryBudgetBytes - geometryBytes;
  const bytesPerSlot = 13;
  assert(available >= bytesPerSlot * 1024, 'typed-memory budget too small for physical TT');
  let slots = 1024;
  while ((slots * 2) * bytesPerSlot <= available) slots *= 2;
  return slots;
}

export function createPhysicalWdlSolver(spec, memoryBudgetBytes, options = {}) {
  const g = createPhysicalWdlGeometry(spec);
  const ttSlots = chooseTtSlots(memoryBudgetBytes, g.typedBytes);
  const tt = new SetAssociativePhysicalTt(ttSlots, g.support.ranks, options.ways ?? 4);
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

  function transition(supportIndex, p0Lo, p0Hi, column) {
    metrics.transitions += 1;
    const edge = supportIndex * g.columns + column;
    const cell = g.landingCells[edge];
    if (cell === 0xff) return null;
    const mover = g.support.ranks[supportIndex] & 1;
    let childLo = p0Lo >>> 0;
    let childHi = p0Hi >>> 0;
    if (mover === 0) {
      childLo = (childLo | g.bitLo[cell]) >>> 0;
      childHi = (childHi | g.bitHi[cell]) >>> 0;
    }
    return {
      supportIndex: g.childSupports[edge],
      p0Lo: childLo,
      p0Hi: childHi,
    };
  }

  function search(supportIndex, p0Lo, p0Hi, alpha, beta) {
    metrics.calls += 1;
    let slot = tt.find(supportIndex, p0Lo, p0Hi);
    let lower = -1;
    let upper = 1;
    let bestMove = -1;
    if (slot >= 0) {
      const record = tt.record[slot];
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
      if (slot < 0) slot = tt.allocate(supportIndex, p0Lo, p0Hi);
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
      // Tactical classification already proved that no legal move is an
      // immediate mover win at this node, so the hot transition does not repeat
      // line-completion work.
      const next = transition(supportIndex, p0Lo, p0Hi, column);
      assert(next !== null, 'prepared legal physical action became illegal');
      const score = -search(next.supportIndex, next.p0Lo, next.p0Hi, -beta, -alpha);
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

    if (slot < 0) slot = tt.allocate(supportIndex, p0Lo, p0Hi);
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
      if (g.landingCells[column] === 0xff) continue;
      if (g.winningPlacement(0, 0, 0, 0, column)) {
        values[column] = 1;
        continue;
      }
      const next = transition(0, 0, 0, column);
      values[column] = -search(next.supportIndex, next.p0Lo, next.p0Hi, -2, 2);
    }
    return values;
  }

  return Object.freeze({
    run,
    rootActionValues,
    metrics,
    tt,
    geometry: g,
    typedBytes: g.typedBytes + tt.bytes() + moveStack.byteLength,
  });
}
