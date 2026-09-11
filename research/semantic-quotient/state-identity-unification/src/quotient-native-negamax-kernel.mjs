import { createConnectWinningLines } from '../../../../components/bsfp/geometry.mjs';
import { createBsfpSupportLatticeProfile } from '../../../../components/bsfp/support-lattice.mjs';

export const QN_ILLEGAL = -2;
export const QN_TERMINAL_WIN = -1;
const QN_EDGE_UNKNOWN = -3;
const QN_CLASS_TRANSITION_UNKNOWN = -3;
const QN_CLASS_TERMINAL_WIN = -1;

const TACTICAL_NONE = -100;
const TACTICAL_DRAW = -101;
const TACTICAL_LOSS = -102;
const TACTICAL_IMMEDIATE_BASE = 64;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function popcountPair(pair) {
  return popcount32(pair[0]) + popcount32(pair[1]);
}

function unsignedCompare(left, right) {
  const a = left >>> 0;
  const b = right >>> 0;
  return a === b ? 0 : a < b ? -1 : 1;
}

function pairSubsetOf(aLo, aHi, bLo, bHi) {
  return (((aLo & ~bLo) >>> 0) === 0) && (((aHi & ~bHi) >>> 0) === 0);
}

function normalizePairs(pairs) {
  if (pairs.length <= 1) return pairs.map(([lo, hi]) => [lo >>> 0, hi >>> 0]);
  const ordered = pairs.map(([lo, hi]) => [lo >>> 0, hi >>> 0]);
  ordered.sort((left, right) => {
    const countDelta = popcountPair(left) - popcountPair(right);
    if (countDelta !== 0) return countDelta;
    const hiDelta = unsignedCompare(left[1], right[1]);
    if (hiDelta !== 0) return hiDelta;
    return unsignedCompare(left[0], right[0]);
  });

  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) {
      if (retained[0] === candidate[0] && retained[1] === candidate[1]) continue outer;
      if (pairSubsetOf(retained[0], retained[1], candidate[0], candidate[1])) continue outer;
    }
    result.push(candidate);
  }
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

function hashPairSequence(pairs) {
  let hash = 0x811c9dc5;
  for (const pair of pairs) {
    hash = Math.imul(hash ^ mix32(pair[0]), 0x01000193) >>> 0;
    hash = Math.imul(hash ^ mix32(pair[1]), 0x01000193) >>> 0;
  }
  return mix32(hash ^ pairs.length);
}

function hashStateTriple(supportIndex, p0Class, p1Class) {
  let hash = mix32(supportIndex + 0x9e3779b9);
  hash = mix32(hash ^ Math.imul((p0Class + 1) >>> 0, 0x85ebca6b));
  hash = mix32(hash ^ Math.imul((p1Class + 1) >>> 0, 0xc2b2ae35));
  return hash >>> 0;
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

class ResidualClassPool {
  constructor(cellCount, initialPairs) {
    this.cellCount = cellCount;
    this.starts = [];
    this.lengths = [];
    this.hashes = [];
    this.singletonLo = [];
    this.singletonHi = [];
    this.flatLo = [];
    this.flatHi = [];
    this.hashSlots = new Int32Array(1024);
    this.hashSlots.fill(-1);
    this.transitionClassCapacity = 0;
    this.ownTransitions = new Int32Array(0);
    this.blockTransitions = new Int32Array(0);
    this.metrics = {
      internLookups: 0,
      internHits: 0,
      internMisses: 0,
      ownTransitionHits: 0,
      ownTransitionMisses: 0,
      blockTransitionHits: 0,
      blockTransitionMisses: 0,
    };

    this.emptyClass = this.internNormalized([]);
    this.initialClass = this.intern(initialPairs);
  }

  get size() {
    return this.lengths.length;
  }

  _ensureTransitionCapacity(requiredClasses) {
    if (requiredClasses <= this.transitionClassCapacity) return;
    const nextCapacity = nextPowerOfTwo(Math.max(8, requiredClasses));
    const own = new Int32Array(nextCapacity * this.cellCount);
    const block = new Int32Array(nextCapacity * this.cellCount);
    own.fill(QN_CLASS_TRANSITION_UNKNOWN);
    block.fill(QN_CLASS_TRANSITION_UNKNOWN);
    own.set(this.ownTransitions);
    block.set(this.blockTransitions);
    this.ownTransitions = own;
    this.blockTransitions = block;
    this.transitionClassCapacity = nextCapacity;
  }

  _classEquals(id, pairs) {
    const length = this.lengths[id];
    if (length !== pairs.length) return false;
    const start = this.starts[id];
    for (let index = 0; index < length; index += 1) {
      if ((this.flatLo[start + index] >>> 0) !== (pairs[index][0] >>> 0)) return false;
      if ((this.flatHi[start + index] >>> 0) !== (pairs[index][1] >>> 0)) return false;
    }
    return true;
  }

  _growHash() {
    const oldSlots = this.hashSlots;
    this.hashSlots = new Int32Array(oldSlots.length * 2);
    this.hashSlots.fill(-1);
    const mask = this.hashSlots.length - 1;
    for (let id = 0; id < this.size; id += 1) {
      let slot = this.hashes[id] & mask;
      while (this.hashSlots[slot] !== -1) slot = (slot + 1) & mask;
      this.hashSlots[slot] = id;
    }
  }

  intern(pairs) {
    return this.internNormalized(normalizePairs(pairs));
  }

  internNormalized(pairs) {
    const canonical = pairs.map(([lo, hi]) => [lo >>> 0, hi >>> 0]);
    const hash = hashPairSequence(canonical);
    this.metrics.internLookups += 1;
    if ((this.size + 1) * 10 >= this.hashSlots.length * 7) this._growHash();
    const mask = this.hashSlots.length - 1;
    let slot = hash & mask;
    while (true) {
      const id = this.hashSlots[slot];
      if (id === -1) break;
      if (this.hashes[id] === hash && this._classEquals(id, canonical)) {
        this.metrics.internHits += 1;
        return id;
      }
      slot = (slot + 1) & mask;
    }

    const id = this.size;
    const start = this.flatLo.length;
    let singletonLo = 0;
    let singletonHi = 0;
    for (const [loValue, hiValue] of canonical) {
      const lo = loValue >>> 0;
      const hi = hiValue >>> 0;
      this.flatLo.push(lo);
      this.flatHi.push(hi);
      if (popcount32(lo) + popcount32(hi) === 1) {
        singletonLo = (singletonLo | lo) >>> 0;
        singletonHi = (singletonHi | hi) >>> 0;
      }
    }
    this.starts.push(start);
    this.lengths.push(canonical.length);
    this.hashes.push(hash);
    this.singletonLo.push(singletonLo >>> 0);
    this.singletonHi.push(singletonHi >>> 0);
    this.hashSlots[slot] = id;
    this.metrics.internMisses += 1;
    this._ensureTransitionCapacity(this.size);
    return id;
  }

  terms(id) {
    const start = this.starts[id];
    const length = this.lengths[id];
    const result = [];
    for (let index = 0; index < length; index += 1) {
      result.push([this.flatLo[start + index] >>> 0, this.flatHi[start + index] >>> 0]);
    }
    return result;
  }

  isEmpty(id) {
    return this.lengths[id] === 0;
  }

  hasSingletonAt(id, bitLo, bitHi) {
    return (((this.singletonLo[id] & bitLo) >>> 0) !== 0)
      || (((this.singletonHi[id] & bitHi) >>> 0) !== 0);
  }

  ownTransition(id, cell, bitLo, bitHi) {
    const cacheIndex = id * this.cellCount + cell;
    const cached = this.ownTransitions[cacheIndex];
    if (cached !== QN_CLASS_TRANSITION_UNKNOWN) {
      this.metrics.ownTransitionHits += 1;
      return cached;
    }
    this.metrics.ownTransitionMisses += 1;

    const start = this.starts[id];
    const length = this.lengths[id];
    const next = [];
    for (let index = 0; index < length; index += 1) {
      let lo = this.flatLo[start + index] >>> 0;
      let hi = this.flatHi[start + index] >>> 0;
      const contains = (((lo & bitLo) >>> 0) !== 0) || (((hi & bitHi) >>> 0) !== 0);
      if (contains) {
        lo = (lo & ~bitLo) >>> 0;
        hi = (hi & ~bitHi) >>> 0;
        if (lo === 0 && hi === 0) {
          this.ownTransitions[cacheIndex] = QN_CLASS_TERMINAL_WIN;
          return QN_CLASS_TERMINAL_WIN;
        }
      }
      next.push([lo, hi]);
    }
    const result = this.intern(next);
    this.ownTransitions[cacheIndex] = result;
    return result;
  }

  blockTransition(id, cell, bitLo, bitHi) {
    const cacheIndex = id * this.cellCount + cell;
    const cached = this.blockTransitions[cacheIndex];
    if (cached !== QN_CLASS_TRANSITION_UNKNOWN) {
      this.metrics.blockTransitionHits += 1;
      return cached;
    }
    this.metrics.blockTransitionMisses += 1;

    const start = this.starts[id];
    const length = this.lengths[id];
    const next = [];
    for (let index = 0; index < length; index += 1) {
      const lo = this.flatLo[start + index] >>> 0;
      const hi = this.flatHi[start + index] >>> 0;
      const contains = (((lo & bitLo) >>> 0) !== 0) || (((hi & bitHi) >>> 0) !== 0);
      if (!contains) next.push([lo, hi]);
    }
    const result = this.internNormalized(next);
    this.blockTransitions[cacheIndex] = result;
    return result;
  }

  memoryStats() {
    return Object.freeze({
      classCount: this.size,
      residualTerms: this.flatLo.length,
      logicalTermBytes: this.flatLo.length * 8,
      transitionCacheBytes: this.ownTransitions.byteLength + this.blockTransitions.byteLength,
      hashSlotBytes: this.hashSlots.byteLength,
    });
  }
}

class QuotientStatePool {
  constructor(columns, cacheEdges) {
    this.columns = columns;
    this.cacheEdges = cacheEdges;
    this.count = 0;
    this.capacity = 4096;
    this.support = new Uint32Array(this.capacity);
    this.p0Class = new Uint32Array(this.capacity);
    this.p1Class = new Uint32Array(this.capacity);
    this.lower = new Int8Array(this.capacity);
    this.upper = new Int8Array(this.capacity);
    this.bestMove = new Int8Array(this.capacity);
    this.bestMove.fill(-1);
    this.edges = cacheEdges ? new Int32Array(this.capacity * columns) : null;
    if (this.edges) this.edges.fill(QN_EDGE_UNKNOWN);
    this.hashSlots = new Int32Array(8192);
    this.hashSlots.fill(-1);
    this.hashes = new Uint32Array(this.capacity);
    this.metrics = {
      internLookups: 0,
      internHits: 0,
      internMisses: 0,
      hashGrows: 0,
      stateGrows: 0,
    };
  }

  _ensureStateCapacity(required) {
    if (required <= this.capacity) return;
    const nextCapacity = nextPowerOfTwo(required);
    const copy = (Type, source) => {
      const target = new Type(nextCapacity);
      target.set(source);
      return target;
    };
    this.support = copy(Uint32Array, this.support);
    this.p0Class = copy(Uint32Array, this.p0Class);
    this.p1Class = copy(Uint32Array, this.p1Class);
    this.lower = copy(Int8Array, this.lower);
    this.upper = copy(Int8Array, this.upper);
    const best = new Int8Array(nextCapacity);
    best.fill(-1);
    best.set(this.bestMove);
    this.bestMove = best;
    this.hashes = copy(Uint32Array, this.hashes);
    if (this.cacheEdges) {
      const edges = new Int32Array(nextCapacity * this.columns);
      edges.fill(QN_EDGE_UNKNOWN);
      edges.set(this.edges);
      this.edges = edges;
    }
    this.capacity = nextCapacity;
    this.metrics.stateGrows += 1;
  }

  _growHash() {
    const next = new Int32Array(this.hashSlots.length * 2);
    next.fill(-1);
    const mask = next.length - 1;
    for (let id = 0; id < this.count; id += 1) {
      let slot = this.hashes[id] & mask;
      while (next[slot] !== -1) slot = (slot + 1) & mask;
      next[slot] = id;
    }
    this.hashSlots = next;
    this.metrics.hashGrows += 1;
  }

  intern(supportIndex, p0Class, p1Class) {
    this.metrics.internLookups += 1;
    if ((this.count + 1) * 10 >= this.hashSlots.length * 7) this._growHash();
    const hash = hashStateTriple(supportIndex, p0Class, p1Class);
    const mask = this.hashSlots.length - 1;
    let slot = hash & mask;
    while (true) {
      const id = this.hashSlots[slot];
      if (id === -1) break;
      if (this.hashes[id] === hash
          && this.support[id] === supportIndex
          && this.p0Class[id] === p0Class
          && this.p1Class[id] === p1Class) {
        this.metrics.internHits += 1;
        return id;
      }
      slot = (slot + 1) & mask;
    }

    const id = this.count;
    this._ensureStateCapacity(id + 1);
    this.support[id] = supportIndex;
    this.p0Class[id] = p0Class;
    this.p1Class[id] = p1Class;
    this.lower[id] = -1;
    this.upper[id] = 1;
    this.bestMove[id] = -1;
    this.hashes[id] = hash;
    if (this.edges) {
      const start = id * this.columns;
      this.edges.fill(QN_EDGE_UNKNOWN, start, start + this.columns);
    }
    this.hashSlots[slot] = id;
    this.count += 1;
    this.metrics.internMisses += 1;
    return id;
  }

  edgeAt(id, column) {
    if (!this.edges) return QN_EDGE_UNKNOWN;
    return this.edges[id * this.columns + column];
  }

  setEdge(id, column, target) {
    if (this.edges) this.edges[id * this.columns + column] = target;
  }

  memoryStats() {
    const stateBytes = this.support.byteLength
      + this.p0Class.byteLength
      + this.p1Class.byteLength
      + this.lower.byteLength
      + this.upper.byteLength
      + this.bestMove.byteLength
      + this.hashes.byteLength;
    return Object.freeze({
      stateCount: this.count,
      stateCapacity: this.capacity,
      stateArrayBytes: stateBytes,
      edgeCacheBytes: this.edges?.byteLength ?? 0,
      hashSlotBytes: this.hashSlots.byteLength,
      totalTypedBytes: stateBytes + (this.edges?.byteLength ?? 0) + this.hashSlots.byteLength,
    });
  }
}

export function createQuotientNativeNegamaxKernel(spec, options = {}) {
  const { columns, rows, connect } = spec;
  const cellCount = columns * rows;
  if (!Number.isInteger(columns) || columns < 1) throw new RangeError('columns must be positive');
  if (!Number.isInteger(rows) || rows < 1) throw new RangeError('rows must be positive');
  if (!Number.isInteger(connect) || connect < 1) throw new RangeError('connect must be positive');
  if (cellCount > 64) throw new RangeError('quotient-native two-lane mask kernel currently supports at most 64 cells');

  const cacheEdges = options.cacheEdges !== false;
  const support = createBsfpSupportLatticeProfile(spec);
  const winningLines = createConnectWinningLines(spec);
  const initialPairs = winningLines.map(maskPairFromCells);
  const classes = new ResidualClassPool(cellCount, initialPairs);
  const states = new QuotientStatePool(columns, cacheEdges);

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
  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
    const heights = support.decodeHeights(supportIndex);
    for (let column = 0; column < columns; column += 1) {
      const height = heights[column];
      if (height >= rows) continue;
      const index = supportIndex * columns + column;
      landingCells[index] = height * columns + column;
      childSupports[index] = supportIndex + support.weights[column];
    }
  }

  const centerOrder = Object.freeze(Array.from({ length: columns }, (_, column) => column)
    .sort((a, b) => {
      const center = (columns - 1) / 2;
      const delta = Math.abs(a - center) - Math.abs(b - center);
      return delta !== 0 ? delta : a - b;
    }));

  const rootId = states.intern(0, classes.initialClass, classes.initialClass);
  const transitionMetrics = {
    edgeCacheHits: 0,
    edgeCacheMisses: 0,
    terminalEdges: 0,
    illegalEdges: 0,
  };

  function advance(stateId, column) {
    if (!Number.isInteger(column) || column < 0 || column >= columns) return QN_ILLEGAL;
    const cached = states.edgeAt(stateId, column);
    if (cached !== QN_EDGE_UNKNOWN) {
      transitionMetrics.edgeCacheHits += 1;
      return cached;
    }
    transitionMetrics.edgeCacheMisses += 1;

    const supportIndex = states.support[stateId];
    const edgeIndex = supportIndex * columns + column;
    const landingCell = landingCells[edgeIndex];
    if (landingCell === 0xff) {
      transitionMetrics.illegalEdges += 1;
      states.setEdge(stateId, column, QN_ILLEGAL);
      return QN_ILLEGAL;
    }

    const mover = support.ranks[supportIndex] & 1;
    const p0Class = states.p0Class[stateId];
    const p1Class = states.p1Class[stateId];
    const ownClass = mover === 0 ? p0Class : p1Class;
    const opponentClass = mover === 0 ? p1Class : p0Class;
    const ownNext = classes.ownTransition(ownClass, landingCell, bitLo[landingCell], bitHi[landingCell]);
    if (ownNext === QN_CLASS_TERMINAL_WIN) {
      transitionMetrics.terminalEdges += 1;
      states.setEdge(stateId, column, QN_TERMINAL_WIN);
      return QN_TERMINAL_WIN;
    }
    const opponentNext = classes.blockTransition(
      opponentClass,
      landingCell,
      bitLo[landingCell],
      bitHi[landingCell],
    );
    const childSupport = childSupports[edgeIndex];
    const childId = mover === 0
      ? states.intern(childSupport, ownNext, opponentNext)
      : states.intern(childSupport, opponentNext, ownNext);
    states.setEdge(stateId, column, childId);
    return childId;
  }

  function tacticalCode(stateId) {
    const supportIndex = states.support[stateId];
    const p0Class = states.p0Class[stateId];
    const p1Class = states.p1Class[stateId];
    if (classes.isEmpty(p0Class) && classes.isEmpty(p1Class)) return TACTICAL_DRAW;

    const mover = support.ranks[supportIndex] & 1;
    const ownClass = mover === 0 ? p0Class : p1Class;
    const opponentClass = mover === 0 ? p1Class : p0Class;
    let immediate = -1;
    let forced = -1;
    let threats = 0;
    let legal = 0;
    for (const column of centerOrder) {
      const landingCell = landingCells[supportIndex * columns + column];
      if (landingCell === 0xff) continue;
      legal += 1;
      const lo = bitLo[landingCell];
      const hi = bitHi[landingCell];
      if (immediate < 0 && classes.hasSingletonAt(ownClass, lo, hi)) immediate = column;
      if (classes.hasSingletonAt(opponentClass, lo, hi)) {
        threats += 1;
        if (forced < 0) forced = column;
      }
    }
    if (immediate >= 0) return TACTICAL_IMMEDIATE_BASE + immediate;
    if (threats > 1) return TACTICAL_LOSS;
    if (legal === 0) return TACTICAL_DRAW;
    if (threats === 1) return forced;
    return TACTICAL_NONE;
  }

  function createWdlSolver(config = {}) {
    const etc = config.etc !== false;
    const etcMinRemaining = config.etcMinRemaining ?? 0;
    const wdlMode = config.wdlMode ?? 'full';
    if (wdlMode !== 'full' && wdlMode !== 'threshold') throw new RangeError('wdlMode must be full or threshold');

    const moveStack = new Int8Array((cellCount + 1) * columns);
    const metrics = {
      calls: 0,
      expanded: 0,
      ttExactReturns: 0,
      ttBoundReturns: 0,
      ttMoveOrderHits: 0,
      cutoffs: 0,
      firstMoveCutoffs: 0,
      tacticalExact: 0,
      forcedNodes: 0,
      etcProbes: 0,
      etcCutoffs: 0,
      thresholdPasses: 0,
      transitionsRequested: 0,
    };

    function prepareMoves(stateId, forcedColumn) {
      const supportIndex = states.support[stateId];
      const rank = support.ranks[supportIndex];
      const base = rank * columns;
      let count = 0;
      if (forcedColumn >= 0) {
        moveStack[base] = forcedColumn;
        metrics.forcedNodes += 1;
        return 1;
      }
      const best = states.bestMove[stateId];
      if (best >= 0 && landingCells[supportIndex * columns + best] !== 0xff) {
        moveStack[base + count] = best;
        count += 1;
        metrics.ttMoveOrderHits += 1;
      }
      for (const column of centerOrder) {
        if (column === best) continue;
        if (landingCells[supportIndex * columns + column] === 0xff) continue;
        moveStack[base + count] = column;
        count += 1;
      }
      return count;
    }

    function transition(stateId, column) {
      metrics.transitionsRequested += 1;
      return advance(stateId, column);
    }

    function search(stateId, alpha, beta) {
      metrics.calls += 1;
      const lower = states.lower[stateId];
      const upper = states.upper[stateId];
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

      const tactical = tacticalCode(stateId);
      if (tactical >= TACTICAL_IMMEDIATE_BASE) {
        const move = tactical - TACTICAL_IMMEDIATE_BASE;
        states.lower[stateId] = 1;
        states.upper[stateId] = 1;
        states.bestMove[stateId] = move;
        metrics.tacticalExact += 1;
        return 1;
      }
      if (tactical === TACTICAL_LOSS) {
        states.lower[stateId] = -1;
        states.upper[stateId] = -1;
        metrics.tacticalExact += 1;
        return -1;
      }
      if (tactical === TACTICAL_DRAW) {
        states.lower[stateId] = 0;
        states.upper[stateId] = 0;
        metrics.tacticalExact += 1;
        return 0;
      }

      const originalAlpha = alpha;
      const originalBeta = beta;
      alpha = Math.max(alpha, lower);
      beta = Math.min(beta, upper);

      const forcedColumn = tactical >= 0 ? tactical : -1;
      const moveCount = prepareMoves(stateId, forcedColumn);
      const supportIndex = states.support[stateId];
      const rank = support.ranks[supportIndex];
      const base = rank * columns;
      const remaining = cellCount - rank;
      const etcActive = etc && remaining >= etcMinRemaining;

      if (etcActive) {
        for (let index = 0; index < moveCount; index += 1) {
          const column = moveStack[base + index];
          const child = transition(stateId, column);
          if (child === QN_TERMINAL_WIN) {
            states.lower[stateId] = 1;
            states.upper[stateId] = 1;
            states.bestMove[stateId] = column;
            metrics.etcCutoffs += 1;
            return 1;
          }
          if (child < 0) continue;
          metrics.etcProbes += 1;
          const parentLower = -states.upper[child];
          if (parentLower >= beta) {
            states.lower[stateId] = Math.max(states.lower[stateId], parentLower);
            states.bestMove[stateId] = column;
            metrics.etcCutoffs += 1;
            return parentLower;
          }
        }
      }

      metrics.expanded += 1;
      let value = -2;
      let selected = -1;
      for (let index = 0; index < moveCount; index += 1) {
        const column = moveStack[base + index];
        const child = transition(stateId, column);
        const score = child === QN_TERMINAL_WIN ? 1 : -search(child, -beta, -alpha);
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

      if (selected >= 0) states.bestMove[stateId] = selected;
      if (value <= originalAlpha) states.upper[stateId] = Math.min(states.upper[stateId], value);
      else if (value >= originalBeta) states.lower[stateId] = Math.max(states.lower[stateId], value);
      else {
        states.lower[stateId] = value;
        states.upper[stateId] = value;
      }
      return value;
    }

    function run() {
      if (wdlMode === 'threshold') {
        let value = search(rootId, 0, 1);
        metrics.thresholdPasses += 1;
        if (value >= 1) return 1;
        value = search(rootId, -1, 0);
        metrics.thresholdPasses += 1;
        return value >= 0 ? 0 : -1;
      }
      return search(rootId, -2, 2);
    }

    function rootActionValues() {
      const values = Array(columns).fill(null);
      for (let column = 0; column < columns; column += 1) {
        const child = transition(rootId, column);
        if (child === QN_ILLEGAL) continue;
        values[column] = child === QN_TERMINAL_WIN ? 1 : -search(child, -2, 2);
      }
      return values;
    }

    return Object.freeze({ run, rootActionValues, metrics });
  }

  function stateView(id) {
    if (!Number.isInteger(id) || id < 0 || id >= states.count) throw new RangeError('state id out of range');
    return Object.freeze({
      supportIndex: states.support[id],
      p0Class: states.p0Class[id],
      p1Class: states.p1Class[id],
      lower: states.lower[id],
      upper: states.upper[id],
      bestMove: states.bestMove[id],
    });
  }

  function memoryStats() {
    const state = states.memoryStats();
    const residual = classes.memoryStats();
    const supportBytes = landingCells.byteLength + childSupports.byteLength + bitLo.byteLength + bitHi.byteLength;
    return Object.freeze({
      state,
      residual,
      supportBytes,
      totalTypedBytes: state.totalTypedBytes + residual.transitionCacheBytes + residual.hashSlotBytes + supportBytes,
    });
  }

  return Object.freeze({
    kind: 'connect4-quotient-native-negamax-kernel',
    ...spec,
    cellCount,
    support,
    rootId,
    centerOrder,
    classes,
    states,
    landingCells,
    childSupports,
    bitLo,
    bitHi,
    advance,
    tacticalCode,
    createWdlSolver,
    stateView,
    classTerms: (id) => classes.terms(id),
    memoryStats,
    transitionMetrics,
  });
}
