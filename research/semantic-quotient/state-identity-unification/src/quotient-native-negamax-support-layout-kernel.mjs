import { createConnectWinningLines } from '../../../../components/bsfp/geometry.mjs';
import { createBsfpSupportLatticeProfile, BSFP_INVALID_ITEM_U32 } from '../../../../components/bsfp/support-lattice.mjs';
import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  TACTICAL_DRAW,
  TACTICAL_IMMEDIATE_BASE,
  TACTICAL_LOSS,
  TACTICAL_NONE,
} from './quotient-negamax-domain-contract.mjs';
import { createLocalQuotientProofStore } from './quotient-local-proof-store.mjs';
import { createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';

export { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-negamax-domain-contract.mjs';

const QN_EDGE_UNKNOWN = -3;
const QN_CLASS_TRANSITION_UNKNOWN = -3;
const QN_CLASS_TERMINAL_WIN = -1;

function nextPowerOfTwo(value) {
  if (!Number.isInteger(value) || value < 1 || value > 2 ** 30) throw new RangeError('capacity exceeds positive Int32-indexed power-of-two domain');
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function bitsFor(maxInclusive) {
  return Math.max(1, Math.ceil(Math.log2(maxInclusive + 1)));
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

function createPackedSupportAccess(spec) {
  const { columns, rows, connect } = spec;
  const radix = rows + 1;
  const itemCapacity = radix ** columns;
  if (!Number.isSafeInteger(itemCapacity) || itemCapacity >= BSFP_INVALID_ITEM_U32) {
    throw new RangeError('support lattice does not fit the first u32 item-index profile');
  }
  const weights = new Uint32Array(columns);
  let weight = 1;
  for (let column = 0; column < columns; column += 1) {
    weights[column] = weight;
    weight *= radix;
  }
  const heightBits = bitsFor(rows);
  const rankBits = bitsFor(columns * rows);
  const rankShift = heightBits * columns;
  const totalBits = rankShift + rankBits;
  if (totalBits > 32) throw new RangeError(`packed support descriptor requires ${totalBits} bits`);
  const heightMask = (2 ** heightBits) - 1;
  const rankMask = (2 ** rankBits) - 1;
  const columnShift = new Uint8Array(columns);
  for (let column = 0; column < columns; column += 1) columnShift[column] = column * heightBits;
  let heightParityMask = 0;
  for (let column = 0; column < columns; column += 1) heightParityMask |= 1 << columnShift[column];
  const pairedHeightParity = (rows & 1) === 0 ? 0 : heightParityMask;
  const descriptors = new Uint32Array(itemCapacity);
  for (let supportIndex = 0; supportIndex < itemCapacity; supportIndex += 1) {
    let word = 0;
    let rank = 0;
    for (let column = 0; column < columns; column += 1) {
      const height = Math.floor(supportIndex / weights[column]) % radix;
      rank += height;
      word = (word | (height << columnShift[column])) >>> 0;
    }
    descriptors[supportIndex] = (word | (rank << rankShift)) >>> 0;
  }
  const support = Object.freeze({
    kind: 'connect4-packed-support-lattice-profile',
    columns,
    rows,
    connect,
    radix,
    itemCapacity,
    maxRank: columns * rows,
    maxEmissionsPerItem: columns,
    invalidItemIndex: BSFP_INVALID_ITEM_U32,
    weights,
    descriptors,
    heightBits,
    rankBits,
    rankShift,
    totalBits,
    heightMask,
    rankMask,
    columnShift,
  });
  return Object.freeze({
    kind: 'packed',
    support,
    hasEvenColumnRemainders(supportIndex) {
      assertSupportIndex(supportIndex, itemCapacity);
      return (descriptors[supportIndex] & heightParityMask) === pairedHeightParity;
    },
    landingCells: null,
    childSupports: null,
    rankAt(supportIndex) {
      assertSupportIndex(supportIndex, itemCapacity);
      return (descriptors[supportIndex] >>> rankShift) & rankMask;
    },
    landingAt(supportIndex, column) {
      assertSupportIndex(supportIndex, itemCapacity);
      assertSupportColumn(column, columns);
      const height = (descriptors[supportIndex] >>> columnShift[column]) & heightMask;
      return height >= rows ? 0xff : height * columns + column;
    },
    childAt(supportIndex, column) {
      assertSupportIndex(supportIndex, itemCapacity);
      assertSupportColumn(column, columns);
      if (((descriptors[supportIndex] >>> columnShift[column]) & heightMask) >= rows) return BSFP_INVALID_ITEM_U32;
      return supportIndex + weights[column];
    },
    memoryBytes: weights.byteLength + columnShift.byteLength + descriptors.byteLength,
  });
}

function createTableSupportAccess(spec) {
  const { columns, rows } = spec;
  const support = createBsfpSupportLatticeProfile(spec);
  const landingCells = new Uint8Array(support.itemCapacity * columns);
  landingCells.fill(0xff);
  const childSupports = new Uint32Array(support.itemCapacity * columns);
  childSupports.fill(BSFP_INVALID_ITEM_U32);
  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
    const heights = support.decodeHeights(supportIndex);
    for (let column = 0; column < columns; column += 1) {
      const height = heights[column];
      if (height >= rows) continue;
      const edge = supportIndex * columns + column;
      landingCells[edge] = height * columns + column;
      childSupports[edge] = supportIndex + support.weights[column];
    }
  }
  return Object.freeze({
    kind: 'table',
    support,
    hasEvenColumnRemainders(supportIndex) {
      assertSupportIndex(supportIndex, support.itemCapacity);
      for (let column = 0; column < columns; column += 1) {
        const landing = landingCells[supportIndex * columns + column];
        if (landing !== 0xff && ((rows - Math.floor(landing / columns)) & 1) !== 0) return false;
      }
      return true;
    },
    landingCells,
    childSupports,
    rankAt(supportIndex) {
      assertSupportIndex(supportIndex, support.itemCapacity);
      return support.ranks[supportIndex];
    },
    landingAt(supportIndex, column) {
      assertSupportIndex(supportIndex, support.itemCapacity);
      assertSupportColumn(column, columns);
      return landingCells[supportIndex * columns + column];
    },
    childAt(supportIndex, column) {
      assertSupportIndex(supportIndex, support.itemCapacity);
      assertSupportColumn(column, columns);
      return childSupports[supportIndex * columns + column];
    },
    memoryBytes: support.weights.byteLength + support.ranks.byteLength + landingCells.byteLength + childSupports.byteLength,
  });
}

function createSupportAccess(spec, kind) {
  if (kind === 'table') return createTableSupportAccess(spec);
  if (kind === 'packed') return createPackedSupportAccess(spec);
  throw new RangeError('supportLayout must be table or packed');
}

function assertSupportIndex(index, capacity) {
  if (!Number.isInteger(index) || index < 0 || index >= capacity) throw new RangeError(`support index ${index} outside 0..${capacity - 1}`);
}

function assertSupportColumn(column, columns) {
  if (!Number.isInteger(column) || column < 0 || column >= columns) throw new RangeError(`support column ${column} outside 0..${columns - 1}`);
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

  get size() { return this.lengths.length; }

  _assertClassId(id) {
    if (!Number.isInteger(id) || id < 0 || id >= this.size) throw new RangeError(`residual class id ${id} out of range`);
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

  intern(pairs) { return this.internNormalized(normalizePairs(pairs)); }

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
    this._assertClassId(id);
    const start = this.starts[id];
    const length = this.lengths[id];
    const result = [];
    for (let index = 0; index < length; index += 1) {
      result.push([this.flatLo[start + index] >>> 0, this.flatHi[start + index] >>> 0]);
    }
    return result;
  }

  isEmpty(id) { return this.lengths[id] === 0; }

  hasSingletonAt(id, bitLo, bitHi) {
    return (((this.singletonLo[id] & bitLo) >>> 0) !== 0) || (((this.singletonHi[id] & bitHi) >>> 0) !== 0);
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
    const transitionCacheBytes = this.ownTransitions.byteLength + this.blockTransitions.byteLength;
    const hashSlotBytes = this.hashSlots.byteLength;
    return Object.freeze({
      classCount: this.size,
      residualTerms: this.flatLo.length,
      logicalTermBytes: this.flatLo.length * 8,
      transitionCacheBytes,
      hashSlotBytes,
      totalTypedBytes: transitionCacheBytes + hashSlotBytes,
    });
  }
}

class QuotientStatePool {
  #supportCapacity;
  #classes;

  constructor(columns, cacheEdges, supportCapacity, classes) {
    this.columns = columns;
    this.#supportCapacity = supportCapacity;
    this.#classes = classes;
    this.cacheEdges = cacheEdges;
    this.count = 0;
    this.capacity = 4096;
    this.support = new Uint32Array(this.capacity);
    this.p0Class = new Uint32Array(this.capacity);
    this.p1Class = new Uint32Array(this.capacity);
    this.edges = cacheEdges ? new Int32Array(this.capacity * columns) : null;
    if (this.edges) this.edges.fill(QN_EDGE_UNKNOWN);
    this.hashSlots = new Int32Array(8192);
    this.hashSlots.fill(-1);
    this.hashes = new Uint32Array(this.capacity);
    this.metrics = { internLookups: 0, internHits: 0, internMisses: 0, hashGrows: 0, stateGrows: 0 };
  }

  _ensureStateCapacity(required) {
    if (required <= this.capacity) return;
    const nextCapacity = nextPowerOfTwo(required);
    const copy = (Type, source) => {
      const target = new Type(nextCapacity);
      target.set(source);
      return target;
    };
    const support = copy(Uint32Array, this.support);
    const p0Class = copy(Uint32Array, this.p0Class);
    const p1Class = copy(Uint32Array, this.p1Class);
    const hashes = copy(Uint32Array, this.hashes);
    let edges = null;
    if (this.cacheEdges) {
      edges = new Int32Array(nextCapacity * this.columns);
      edges.fill(QN_EDGE_UNKNOWN);
      edges.set(this.edges);
    }
    this.support = support;
    this.p0Class = p0Class;
    this.p1Class = p1Class;
    this.hashes = hashes;
    this.edges = edges;
    this.capacity = nextCapacity;
    this.metrics.stateGrows += 1;
  }

  _growHash() {
    if (this.hashSlots.length >= 2 ** 30) throw new RangeError('quotient state hash capacity exhausted');
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
    assertSupportIndex(supportIndex, this.#supportCapacity);
    this.#assertClass(p0Class);
    this.#assertClass(p1Class);
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
    this.#assertEdgeAddress(id, column);
    return this.edges ? this.edges[id * this.columns + column] : QN_EDGE_UNKNOWN;
  }

  setEdge(id, column, target) {
    this.#assertEdgeAddress(id, column);
    if (target !== QN_ILLEGAL && target !== QN_TERMINAL_WIN
        && (!Number.isInteger(target) || target < 0 || target >= this.count)) throw new RangeError(`invalid quotient edge target ${target}`);
    if (this.edges) this.edges[id * this.columns + column] = target;
  }

  #assertClass(id) {
    if (!Number.isInteger(id) || id < 0 || id >= this.#classes.size || id > 0xffffffff) throw new RangeError(`invalid quotient residual class ${id}`);
  }

  #assertEdgeAddress(id, column) {
    if (!Number.isInteger(id) || id < 0 || id >= this.count) throw new RangeError(`invalid quotient state ${id}`);
    assertSupportColumn(column, this.columns);
  }

  memoryStats() {
    const stateBytes = this.support.byteLength
      + this.p0Class.byteLength
      + this.p1Class.byteLength
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

export function createQuotientNativeNegamaxSupportLayoutKernel(spec, options = {}) {
  const { columns, rows, connect } = spec;
  const cellCount = columns * rows;
  if (!Number.isInteger(columns) || columns < 1) throw new RangeError('columns must be positive');
  if (!Number.isInteger(rows) || rows < 1) throw new RangeError('rows must be positive');
  if (!Number.isInteger(connect) || connect < 1) throw new RangeError('connect must be positive');
  if (cellCount > 64) throw new RangeError('quotient-native two-lane mask kernel currently supports at most 64 cells');

  const cacheEdges = options.cacheEdges !== false;
  const supportAccess = createSupportAccess(spec, options.supportLayout ?? 'table');
  const support = supportAccess.support;
  const winningLines = createConnectWinningLines(spec);
  const initialPairs = winningLines.map(maskPairFromCells);
  const classes = new ResidualClassPool(cellCount, initialPairs);
  const states = new QuotientStatePool(columns, cacheEdges, support.itemCapacity, classes);
  const bitLo = new Uint32Array(cellCount);
  const bitHi = new Uint32Array(cellCount);
  for (let cell = 0; cell < cellCount; cell += 1) {
    if (cell < 32) bitLo[cell] = (2 ** cell) >>> 0;
    else bitHi[cell] = (2 ** (cell - 32)) >>> 0;
  }
  const centerOrder = Object.freeze(Array.from({ length: columns }, (_, column) => column).sort((a, b) => {
    const center = (columns - 1) / 2;
    const delta = Math.abs(a - center) - Math.abs(b - center);
    return delta !== 0 ? delta : a - b;
  }));
  const rootId = states.intern(0, classes.initialClass, classes.initialClass);
  const proofStore = createLocalQuotientProofStore(states);
  const transitionMetrics = { edgeCacheHits: 0, edgeCacheMisses: 0, terminalEdges: 0, illegalEdges: 0 };

  function assertStateId(stateId) {
    if (!Number.isInteger(stateId) || stateId < 0 || stateId >= states.count) {
      throw new RangeError(`quotient state id ${stateId} is outside current state count ${states.count}`);
    }
  }

  function supportIndexAt(stateId) {
    assertStateId(stateId);
    return states.support[stateId];
  }

  function rankAt(stateId) {
    return supportAccess.rankAt(supportIndexAt(stateId));
  }

  function isLegal(stateId, column) {
    if (!Number.isInteger(column) || column < 0 || column >= columns) return false;
    return supportAccess.landingAt(supportIndexAt(stateId), column) !== 0xff;
  }

  function landingCellAt(stateId, column) {
    if (!Number.isInteger(column) || column < 0 || column >= columns) return 0xff;
    return supportAccess.landingAt(supportIndexAt(stateId), column);
  }

  function advance(stateId, column) {
    assertStateId(stateId);
    if (!Number.isInteger(column) || column < 0 || column >= columns) return QN_ILLEGAL;
    const cached = states.edgeAt(stateId, column);
    if (cached !== QN_EDGE_UNKNOWN) {
      transitionMetrics.edgeCacheHits += 1;
      return cached;
    }
    transitionMetrics.edgeCacheMisses += 1;
    const supportIndex = states.support[stateId];
    const landingCell = supportAccess.landingAt(supportIndex, column);
    if (landingCell === 0xff) {
      transitionMetrics.illegalEdges += 1;
      states.setEdge(stateId, column, QN_ILLEGAL);
      return QN_ILLEGAL;
    }
    const mover = supportAccess.rankAt(supportIndex) & 1;
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
    if (!Number.isInteger(ownNext) || ownNext < 0 || ownNext >= classes.size) {
      throw new Error(`own residual transition returned invalid class ${ownNext}`);
    }
    const opponentNext = classes.blockTransition(opponentClass, landingCell, bitLo[landingCell], bitHi[landingCell]);
    if (!Number.isInteger(opponentNext) || opponentNext < 0 || opponentNext >= classes.size) {
      throw new Error(`opponent residual transition returned invalid class ${opponentNext}`);
    }
    const childSupport = supportAccess.childAt(supportIndex, column);
    if (!Number.isInteger(childSupport) || childSupport < 0 || childSupport >= support.itemCapacity) {
      throw new Error(`support transition returned invalid child ${childSupport}`);
    }
    const childId = mover === 0
      ? states.intern(childSupport, ownNext, opponentNext)
      : states.intern(childSupport, opponentNext, ownNext);
    states.setEdge(stateId, column, childId);
    return childId;
  }

  function tacticalCode(stateId) {
    const supportIndex = supportIndexAt(stateId);
    const p0Class = states.p0Class[stateId];
    const p1Class = states.p1Class[stateId];
    if (classes.isEmpty(p0Class) && classes.isEmpty(p1Class)) return TACTICAL_DRAW;
    const mover = supportAccess.rankAt(supportIndex) & 1;
    const ownClass = mover === 0 ? p0Class : p1Class;
    const opponentClass = mover === 0 ? p1Class : p0Class;
    let immediate = -1;
    let forced = -1;
    let threats = 0;
    let legal = 0;
    for (const column of centerOrder) {
      const landingCell = supportAccess.landingAt(supportIndex, column);
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

  const stateSpacePort = Object.freeze({
    columns,
    cellCount,
    rootId,
    centerOrder,
    proofStore,
    rankAt,
    isLegal,
    landingCellAt,
    transition: advance,
    tacticalCode,
  });

  function createWdlSolver(config = {}) {
    const engine = createQuotientNegamaxEngine(stateSpacePort, config);
    return Object.freeze({
      run: engine.run,
      rootActionValues: engine.rootActionValues,
      metrics: engine.metrics,
    });
  }

  function stateView(id) {
    assertStateId(id);
    return Object.freeze({
      supportIndex: states.support[id],
      p0Class: states.p0Class[id],
      p1Class: states.p1Class[id],
    });
  }

  function memoryStats() {
    const state = states.memoryStats();
    const residual = classes.memoryStats();
    const localProof = proofStore.memoryStats();
    const bitBytes = bitLo.byteLength + bitHi.byteLength;
    const residualBytes = residual.totalTypedBytes ?? ((residual.transitionCacheBytes ?? 0) + (residual.hashSlotBytes ?? 0));
    const supportBytes = supportAccess.memoryBytes;
    return Object.freeze({
      state,
      residual,
      localProof,
      supportLayout: supportAccess.kind,
      supportBytes,
      bitBytes,
      totalTypedBytes: state.totalTypedBytes
        + residualBytes
        + localProof.retainedTypedBytes
        + supportBytes
        + bitBytes,
    });
  }

  return Object.freeze({
    kind: 'connect4-quotient-native-negamax-support-layout-kernel',
    ...spec,
    cellCount,
    support,
    supportAccess,
    rootId,
    centerOrder,
    classes,
    states,
    proofStore,
    landingCells: supportAccess.landingCells,
    childSupports: supportAccess.childSupports,
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
