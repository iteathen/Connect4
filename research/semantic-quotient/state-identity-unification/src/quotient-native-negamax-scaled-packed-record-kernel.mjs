import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';

const QN_EDGE_UNKNOWN = -3;
const TACTICAL_NONE = -100;
const TACTICAL_DRAW = -101;
const TACTICAL_LOSS = -102;
const TACTICAL_IMMEDIATE_BASE = 64;

const LOWER_MASK = 0b00000011;
const UPPER_MASK = 0b00001100;
const BEST_MASK = 0b01110000;
const INITIAL_RECORD = ((1 + 1) << 2) | (7 << 4); // lower=-1, upper=+1, best=none

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

function hashStateTriple(supportIndex, p0Class, p1Class) {
  let hash = mix32(supportIndex + 0x9e3779b9);
  hash = mix32(hash ^ Math.imul((p0Class + 1) >>> 0, 0x85ebca6b));
  hash = mix32(hash ^ Math.imul((p1Class + 1) >>> 0, 0xc2b2ae35));
  return hash >>> 0;
}

function lowerOf(record) {
  return (record & LOWER_MASK) - 1;
}

function upperOf(record) {
  return ((record & UPPER_MASK) >>> 2) - 1;
}

function bestOf(record) {
  const best = (record & BEST_MASK) >>> 4;
  return best === 7 ? -1 : best;
}

function withLower(record, value) {
  return (record & ~LOWER_MASK) | ((value + 1) & 3);
}

function withUpper(record, value) {
  return (record & ~UPPER_MASK) | (((value + 1) & 3) << 2);
}

function withBest(record, best) {
  return (record & ~BEST_MASK) | (((best < 0 ? 7 : best) & 7) << 4);
}

function withBounds(record, lower, upper) {
  return (record & ~(LOWER_MASK | UPPER_MASK))
    | ((lower + 1) & 3)
    | (((upper + 1) & 3) << 2);
}

function installPackedSearchRecord(states, columns) {
  if (columns > 7) throw new RangeError('packed search record currently supports at most seven columns');
  const oldLowerBytes = states.lower?.byteLength ?? 0;
  const oldUpperBytes = states.upper?.byteLength ?? 0;
  const oldBestBytes = states.bestMove?.byteLength ?? 0;
  let record = new Uint8Array(states.capacity);
  for (let id = 0; id < states.count; id += 1) {
    let value = 0;
    value = withLower(value, states.lower[id]);
    value = withUpper(value, states.upper[id]);
    value = withBest(value, states.bestMove[id]);
    record[id] = value;
  }
  states.record = record;
  states.lower = null;
  states.upper = null;
  states.bestMove = null;

  states._ensureStateCapacity = function ensureStateCapacityPackedRecord(required) {
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
    this.record = copy(Uint8Array, this.record);
    this.hashes = copy(Uint32Array, this.hashes);
    if (this.cacheEdges) {
      const edges = new Int32Array(nextCapacity * this.columns);
      edges.fill(QN_EDGE_UNKNOWN);
      edges.set(this.edges);
      this.edges = edges;
    }
    this.capacity = nextCapacity;
    this.metrics.stateGrows += 1;
  };

  states.intern = function internPackedRecord(supportIndex, p0Class, p1Class) {
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
    this.record[id] = INITIAL_RECORD;
    this.hashes[id] = hash;
    if (this.edges) {
      const start = id * this.columns;
      this.edges.fill(QN_EDGE_UNKNOWN, start, start + this.columns);
    }
    this.hashSlots[slot] = id;
    this.count += 1;
    this.metrics.internMisses += 1;
    return id;
  };

  states.memoryStats = function packedRecordMemoryStats() {
    const stateBytes = this.support.byteLength
      + this.p0Class.byteLength
      + this.p1Class.byteLength
      + this.record.byteLength
      + this.hashes.byteLength;
    return Object.freeze({
      stateCount: this.count,
      stateCapacity: this.capacity,
      stateArrayBytes: stateBytes,
      searchRecordBytes: this.record.byteLength,
      edgeCacheBytes: this.edges?.byteLength ?? 0,
      hashSlotBytes: this.hashSlots.byteLength,
      totalTypedBytes: stateBytes + (this.edges?.byteLength ?? 0) + this.hashSlots.byteLength,
    });
  };

  return Object.freeze({
    bytesReplacedAtInstall: oldLowerBytes + oldUpperBytes + oldBestBytes,
  });
}

function createPackedRecordWdlSolver(kernel, config = {}) {
  const { states, supportAccess, columns, cellCount, centerOrder } = kernel;
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

  function setExact(stateId, value, bestMove = -1) {
    let record = states.record[stateId];
    record = withBounds(record, value, value);
    if (bestMove >= 0) record = withBest(record, bestMove);
    states.record[stateId] = record;
  }

  function prepareMoves(stateId, forcedColumn) {
    const supportIndex = states.support[stateId];
    const rank = supportAccess.rankAt(supportIndex);
    const base = rank * columns;
    let count = 0;
    if (forcedColumn >= 0) {
      moveStack[base] = forcedColumn;
      metrics.forcedNodes += 1;
      return 1;
    }
    const best = bestOf(states.record[stateId]);
    if (best >= 0 && supportAccess.landingAt(supportIndex, best) !== 0xff) {
      moveStack[base + count] = best;
      count += 1;
      metrics.ttMoveOrderHits += 1;
    }
    for (const column of centerOrder) {
      if (column === best) continue;
      if (supportAccess.landingAt(supportIndex, column) === 0xff) continue;
      moveStack[base + count] = column;
      count += 1;
    }
    return count;
  }

  function transition(stateId, column) {
    metrics.transitionsRequested += 1;
    return kernel.advance(stateId, column);
  }

  function search(stateId, alpha, beta) {
    metrics.calls += 1;
    let record = states.record[stateId];
    const lower = lowerOf(record);
    const upper = upperOf(record);
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

    const tactical = kernel.tacticalCode(stateId);
    if (tactical >= TACTICAL_IMMEDIATE_BASE) {
      const move = tactical - TACTICAL_IMMEDIATE_BASE;
      setExact(stateId, 1, move);
      metrics.tacticalExact += 1;
      return 1;
    }
    if (tactical === TACTICAL_LOSS) {
      setExact(stateId, -1);
      metrics.tacticalExact += 1;
      return -1;
    }
    if (tactical === TACTICAL_DRAW) {
      setExact(stateId, 0);
      metrics.tacticalExact += 1;
      return 0;
    }
    if (tactical !== TACTICAL_NONE && tactical < 0) throw new Error(`unknown tactical code ${tactical}`);

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower);
    beta = Math.min(beta, upper);

    const forcedColumn = tactical >= 0 ? tactical : -1;
    const moveCount = prepareMoves(stateId, forcedColumn);
    const supportIndex = states.support[stateId];
    const rank = supportAccess.rankAt(supportIndex);
    const base = rank * columns;
    const remaining = cellCount - rank;
    const etcActive = etc && remaining >= etcMinRemaining;

    if (etcActive) {
      for (let index = 0; index < moveCount; index += 1) {
        const column = moveStack[base + index];
        const child = transition(stateId, column);
        if (child === QN_TERMINAL_WIN) {
          setExact(stateId, 1, column);
          metrics.etcCutoffs += 1;
          return 1;
        }
        if (child < 0) continue;
        metrics.etcProbes += 1;
        const parentLower = -upperOf(states.record[child]);
        if (parentLower >= beta) {
          record = states.record[stateId];
          const currentLower = lowerOf(record);
          record = withLower(record, Math.max(currentLower, parentLower));
          record = withBest(record, column);
          states.record[stateId] = record;
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

    record = states.record[stateId];
    if (selected >= 0) record = withBest(record, selected);
    if (value <= originalAlpha) record = withUpper(record, Math.min(upperOf(record), value));
    else if (value >= originalBeta) record = withLower(record, Math.max(lowerOf(record), value));
    else record = withBounds(record, value, value);
    states.record[stateId] = record;
    return value;
  }

  function run() {
    if (wdlMode === 'threshold') {
      let value = search(kernel.rootId, 0, 1);
      metrics.thresholdPasses += 1;
      if (value >= 1) return 1;
      value = search(kernel.rootId, -1, 0);
      metrics.thresholdPasses += 1;
      return value >= 0 ? 0 : -1;
    }
    return search(kernel.rootId, -2, 2);
  }

  function rootActionValues() {
    const values = Array(columns).fill(null);
    for (let column = 0; column < columns; column += 1) {
      const child = transition(kernel.rootId, column);
      if (child === QN_ILLEGAL) continue;
      values[column] = child === QN_TERMINAL_WIN ? 1 : -search(child, -2, 2);
    }
    return values;
  }

  return Object.freeze({ run, rootActionValues, metrics });
}

function packedStateView(states, id) {
  const record = states.record[id];
  return Object.freeze({
    supportIndex: states.support[id],
    p0Class: states.p0Class[id],
    p1Class: states.p1Class[id],
    lower: lowerOf(record),
    upper: upperOf(record),
    bestMove: bestOf(record),
  });
}

export function createPackedRecordScaledQuotientKernel(spec, options = {}) {
  const wrap = createScaledTermIdQuotientNativeNegamaxKernel(spec, options);
  const packedRecord = installPackedSearchRecord(wrap.kernel.states, spec.columns);
  return Object.freeze({
    ...wrap,
    packedRecord,
    createWdlSolver: (config = {}) => createPackedRecordWdlSolver(wrap.kernel, config),
    stateView: (id) => packedStateView(wrap.kernel.states, id),
  });
}
