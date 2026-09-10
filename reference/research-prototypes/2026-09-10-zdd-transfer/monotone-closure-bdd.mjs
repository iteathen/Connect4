import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';
import { createBsfpSupportLatticeProfile } from '../../../components/bsfp/support-lattice.mjs';
import { solveBsfpOwnershipAntichainWdl } from '../../../components/bsfp/ownership-antichain-solver.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
  Object.freeze({ columns: 5, rows: 4, connect: 4 }),
]);
const NODE_CAP = 5_000_000;
const APPLY_MISS_CAP = 50_000_000;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

class CapacityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CapacityError';
  }
}

function rowMajorOrder(spec) {
  return Object.freeze(Array.from({ length: spec.columns * spec.rows }, (_, cell) => cell));
}

function columnMajorOrder(spec) {
  const order = [];
  for (let column = 0; column < spec.columns; column += 1) {
    for (let row = 0; row < spec.rows; row += 1) order.push(row * spec.columns + column);
  }
  return Object.freeze(order);
}

function supportUniverseMask(heights, columns) {
  let mask = 0n;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < heights[column]; row += 1) mask |= 1n << BigInt(row * columns + column);
  }
  return mask;
}

function buildLineIncidence(lineMasks, cellCount) {
  const incidence = Array.from({ length: cellCount }, () => []);
  for (const lineMask of lineMasks) {
    for (let cell = 0; cell < cellCount; cell += 1) {
      if ((lineMask & (1n << BigInt(cell))) !== 0n) incidence[cell].push(lineMask);
    }
  }
  return incidence;
}

class Robdd {
  constructor(cellCount, order, { nodeCap, applyMissCap }) {
    assert(order.length === cellCount && new Set(order).size === cellCount, 'BDD order must be a cell permutation');
    this.cellCount = cellCount;
    this.order = order;
    this.levelOfCell = new Int16Array(cellCount);
    for (let level = 0; level < order.length; level += 1) this.levelOfCell[order[level]] = level;
    this.nodeCap = nodeCap;
    this.applyMissCap = applyMissCap;
    this.nodes = [null, null]; // 0=false, 1=true
    this.unique = new Map();
    this.applyCache = new Map();
    this.notCache = new Map();
    this.restrictCache = new Map();
    this.metrics = {
      nodeRequests: 0,
      nodeCreates: 0,
      nodeReuse: 0,
      applyCalls: 0,
      applyHits: 0,
      applyMisses: 0,
      notCalls: 0,
      notHits: 0,
      restrictCalls: 0,
      restrictHits: 0,
      cubeBuilds: 0,
    };
  }

  top(ref) {
    return ref <= 1 ? Number.POSITIVE_INFINITY : this.nodes[ref].level;
  }

  node(level, lo, hi) {
    this.metrics.nodeRequests += 1;
    if (lo === hi) return lo;
    const key = `${level}:${lo}:${hi}`;
    const prior = this.unique.get(key);
    if (prior !== undefined) {
      this.metrics.nodeReuse += 1;
      return prior;
    }
    if (this.nodes.length - 2 >= this.nodeCap) throw new CapacityError(`BDD node cap ${this.nodeCap} reached`);
    const ref = this.nodes.length;
    this.nodes.push(Object.freeze({ level, lo, hi }));
    this.unique.set(key, ref);
    this.metrics.nodeCreates += 1;
    return ref;
  }

  split(ref, level) {
    if (ref <= 1 || this.nodes[ref].level > level) return [ref, ref];
    assert(this.nodes[ref].level === level, 'BDD split ordering violation');
    return [this.nodes[ref].lo, this.nodes[ref].hi];
  }

  apply(op, a, b) {
    this.metrics.applyCalls += 1;
    if (op === 'and') {
      if (a === 0 || b === 0) return 0;
      if (a === 1) return b;
      if (b === 1) return a;
      if (a === b) return a;
    } else if (op === 'or') {
      if (a === 1 || b === 1) return 1;
      if (a === 0) return b;
      if (b === 0) return a;
      if (a === b) return a;
    } else {
      throw new Error(`unknown BDD op ${op}`);
    }
    if (a > b) [a, b] = [b, a];
    const key = `${op}:${a}:${b}`;
    const prior = this.applyCache.get(key);
    if (prior !== undefined) {
      this.metrics.applyHits += 1;
      return prior;
    }
    this.metrics.applyMisses += 1;
    if (this.metrics.applyMisses > this.applyMissCap) throw new CapacityError(`BDD apply miss cap ${this.applyMissCap} reached`);
    const level = Math.min(this.top(a), this.top(b));
    assert(Number.isFinite(level), 'BDD terminal apply escaped simplification');
    const [a0, a1] = this.split(a, level);
    const [b0, b1] = this.split(b, level);
    const result = this.node(level, this.apply(op, a0, b0), this.apply(op, a1, b1));
    this.applyCache.set(key, result);
    return result;
  }

  and(a, b) { return this.apply('and', a, b); }
  or(a, b) { return this.apply('or', a, b); }

  not(ref) {
    this.metrics.notCalls += 1;
    if (ref === 0) return 1;
    if (ref === 1) return 0;
    const prior = this.notCache.get(ref);
    if (prior !== undefined) {
      this.metrics.notHits += 1;
      return prior;
    }
    const node = this.nodes[ref];
    const result = this.node(node.level, this.not(node.lo), this.not(node.hi));
    this.notCache.set(ref, result);
    return result;
  }

  restrict(ref, cell, value) {
    const target = this.levelOfCell[cell];
    return this.#restrictLevel(ref, target, value ? 1 : 0);
  }

  #restrictLevel(ref, target, value) {
    this.metrics.restrictCalls += 1;
    if (ref <= 1) return ref;
    const level = this.nodes[ref].level;
    if (level > target) return ref;
    if (level === target) return value ? this.nodes[ref].hi : this.nodes[ref].lo;
    const key = `${ref}:${target}:${value}`;
    const prior = this.restrictCache.get(key);
    if (prior !== undefined) {
      this.metrics.restrictHits += 1;
      return prior;
    }
    const node = this.nodes[ref];
    const result = this.node(level,
      this.#restrictLevel(node.lo, target, value),
      this.#restrictLevel(node.hi, target, value));
    this.restrictCache.set(key, result);
    return result;
  }

  cubeFromMask(mask, value) {
    this.metrics.cubeBuilds += 1;
    let ref = 1;
    for (let level = this.order.length - 1; level >= 0; level -= 1) {
      const cell = this.order[level];
      const bit = 1n << BigInt(cell);
      if ((mask & bit) === 0n) continue;
      ref = value ? this.node(level, 0, ref) : this.node(level, ref, 0);
    }
    return ref;
  }

  upwardFromMinima(minima) {
    let ref = 0;
    for (const minimum of minima) ref = this.or(ref, this.cubeFromMask(minimum, 1));
    return ref;
  }

  downwardFromCaps(caps, universeMask) {
    let ref = 0;
    for (const cap of caps) ref = this.or(ref, this.cubeFromMask(universeMask & ~cap, 0));
    return ref;
  }

  evaluate(ref, p0Mask) {
    let current = ref;
    while (current > 1) {
      const node = this.nodes[current];
      const cell = this.order[node.level];
      current = (p0Mask & (1n << BigInt(cell))) !== 0n ? node.hi : node.lo;
    }
    return current === 1;
  }

  snapshot() {
    return Object.freeze({
      canonicalNodes: this.nodes.length - 2,
      uniqueEntries: this.unique.size,
      applyCacheEntries: this.applyCache.size,
      notCacheEntries: this.notCache.size,
      restrictCacheEntries: this.restrictCache.size,
      ...this.metrics,
    });
  }
}

function solveBdd(spec, orderName, order) {
  const support = createBsfpSupportLatticeProfile(spec);
  const cellCount = spec.columns * spec.rows;
  const lines = createConnectWinningLines(spec);
  const lineMasks = lines.map((line) => {
    let mask = 0n;
    for (const cell of line) mask |= 1n << BigInt(cell);
    return mask;
  });
  const incidence = buildLineIncidence(lineMasks, cellCount);
  const manager = new Robdd(cellCount, order, { nodeCap: NODE_CAP, applyMissCap: APPLY_MISS_CAP });
  const winRefs = new Uint32Array(support.itemCapacity);
  const lossRefs = new Uint32Array(support.itemCapacity);
  const rankMetrics = [];
  const started = performance.now();

  for (let rank = support.maxRank; rank >= 0; rank -= 1) {
    const before = manager.snapshot();
    let rankSupports = 0;
    for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
      if (support.ranks[supportIndex] !== rank) continue;
      rankSupports += 1;
      const heights = support.decodeHeights(supportIndex);
      const mover = rank & 1;
      const universeMask = supportUniverseMask(heights, spec.columns);
      let aggregateWin = null;
      let aggregateLoss = null;

      for (let column = 0; column < spec.columns; column += 1) {
        const row = heights[column];
        if (row >= spec.rows) continue;
        const landingCell = row * spec.columns + column;
        const landingBit = 1n << BigInt(landingCell);
        const childIndex = supportIndex + support.weights[column];
        let moveWin = manager.restrict(winRefs[childIndex], landingCell, mover === 0);
        let moveLoss = manager.restrict(lossRefs[childIndex], landingCell, mover === 0);

        if (mover === 0) {
          let terminal = 0;
          for (const lineMask of incidence[landingCell]) {
            const required = lineMask & ~landingBit;
            if ((required & ~universeMask) === 0n) terminal = manager.or(terminal, manager.cubeFromMask(required, 1));
          }
          if (terminal !== 0) {
            moveLoss = manager.and(moveLoss, manager.not(terminal));
            moveWin = manager.or(moveWin, terminal);
          }
        } else {
          let terminal = 0;
          for (const lineMask of incidence[landingCell]) {
            const required = lineMask & ~landingBit;
            if ((required & ~universeMask) === 0n) terminal = manager.or(terminal, manager.cubeFromMask(required, 0));
          }
          if (terminal !== 0) {
            moveWin = manager.and(moveWin, manager.not(terminal));
            moveLoss = manager.or(moveLoss, terminal);
          }
        }

        if (aggregateWin === null) {
          aggregateWin = moveWin;
          aggregateLoss = moveLoss;
        } else if (mover === 0) {
          aggregateWin = manager.or(aggregateWin, moveWin);
          aggregateLoss = manager.and(aggregateLoss, moveLoss);
        } else {
          aggregateWin = manager.and(aggregateWin, moveWin);
          aggregateLoss = manager.or(aggregateLoss, moveLoss);
        }
      }

      winRefs[supportIndex] = aggregateWin ?? 0;
      lossRefs[supportIndex] = aggregateLoss ?? 0;
      assert(!(winRefs[supportIndex] === 1 && lossRefs[supportIndex] === 1), `BDD contradiction at support ${supportIndex}`);
    }
    const after = manager.snapshot();
    rankMetrics.push(Object.freeze({
      rank,
      supports: rankSupports,
      nodesCreated: after.nodeCreates - before.nodeCreates,
      applyMisses: after.applyMisses - before.applyMisses,
      restrictCalls: after.restrictCalls - before.restrictCalls,
      elapsedMs: performance.now() - started,
    }));
  }

  const solveSnapshot = manager.snapshot();
  const solveElapsedMs = performance.now() - started;
  const rootWin = manager.evaluate(winRefs[0], 0n);
  const rootLoss = manager.evaluate(lossRefs[0], 0n);
  assert(!(rootWin && rootLoss), 'root Win/Loss overlap');
  const rootWdl = rootWin ? 1 : rootLoss ? -1 : 0;

  const authoritative = solveBsfpOwnershipAntichainWdl(spec);
  let frontierMismatches = 0;
  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
    const heights = support.decodeHeights(supportIndex);
    const universeMask = supportUniverseMask(heights, spec.columns);
    const frontier = authoritative.frontierAt(supportIndex);
    const expectedWin = manager.upwardFromMinima(frontier.wins);
    const expectedLoss = manager.downwardFromCaps(frontier.losses, universeMask);
    if (expectedWin !== winRefs[supportIndex] || expectedLoss !== lossRefs[supportIndex]) frontierMismatches += 1;
  }
  assert(frontierMismatches === 0, `${spec.columns}x${spec.rows}:c${spec.connect}/${orderName} BDD differs from C1`);
  assert(rootWdl === authoritative.rootWdl, `${spec.columns}x${spec.rows}:c${spec.connect}/${orderName} root mismatch`);

  const validationSnapshot = manager.snapshot();
  return Object.freeze({
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    order: orderName,
    status: 'pass',
    rootWdl,
    supportCount: support.itemCapacity,
    winningLineCount: lines.length,
    c1BoundaryRecords: authoritative.stats.totalBoundaryRecords,
    frontierMismatches,
    solveElapsedMs,
    solve: solveSnapshot,
    validationAdditionalNodes: validationSnapshot.nodeCreates - solveSnapshot.nodeCreates,
    validationAdditionalApplyMisses: validationSnapshot.applyMisses - solveSnapshot.applyMisses,
    rankMetrics,
  });
}

function runCase(spec, orderName, order) {
  try {
    return solveBdd(spec, orderName, order);
  } catch (error) {
    if (!(error instanceof CapacityError)) throw error;
    return Object.freeze({
      geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
      order: orderName,
      status: 'capacity',
      reason: error.message,
    });
  }
}

const results = [];
for (const spec of CASES) {
  results.push(runCase(spec, 'row-major', rowMajorOrder(spec)));
  if (global.gc) global.gc();
  results.push(runCase(spec, 'column-major', columnMajorOrder(spec)));
  if (global.gc) global.gc();
}

console.log(JSON.stringify({
  kind: 'connect4-bsfp-monotone-closure-robdd-probe',
  status: results.every((entry) => entry.status === 'pass') ? 'pass' : 'bounded-partial',
  claim: 'research-only exact full-support-lattice BSFP comparison; no CUDA or 7x6 solve claim',
  nodeCap: NODE_CAP,
  applyMissCap: APPLY_MISS_CAP,
  results,
}, null, 2));
