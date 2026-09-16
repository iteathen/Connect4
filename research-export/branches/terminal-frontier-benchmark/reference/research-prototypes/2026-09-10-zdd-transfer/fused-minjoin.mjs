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

const TOP_OPERATIONS = 64;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function popcount(mask) {
  let value = mask;
  let count = 0;
  while (value !== 0n) {
    value &= value - 1n;
    count += 1;
  }
  return count;
}

function orderedUnique(masks, descending = false) {
  const unique = new Set(masks);
  return [...unique].sort((a, b) => {
    const delta = popcount(a) - popcount(b);
    if (delta !== 0) return descending ? -delta : delta;
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

function normalizeMinimal(masks) {
  const ordered = orderedUnique(masks, false);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if ((retained & ~candidate) === 0n) continue outer;
    result.push(candidate);
  }
  return Object.freeze(result);
}

function normalizeMaximal(masks) {
  const ordered = orderedUnique(masks, true);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if ((candidate & ~retained) === 0n) continue outer;
    result.push(candidate);
  }
  return Object.freeze(result);
}

function unionUpward(left, right) {
  return normalizeMinimal([...left, ...right]);
}

function unionDownward(left, right) {
  return normalizeMaximal([...left, ...right]);
}

function explicitMinJoin(left, right) {
  if (left.length === 0 || right.length === 0) return Object.freeze([]);
  const candidates = [];
  for (const a of left) for (const b of right) candidates.push(a | b);
  return normalizeMinimal(candidates);
}

function intersectUpward(left, right) {
  return explicitMinJoin(left, right);
}

function intersectDownward(left, right) {
  if (left.length === 0 || right.length === 0) return Object.freeze([]);
  const candidates = [];
  for (const a of left) for (const b of right) candidates.push(a & b);
  return normalizeMaximal(candidates);
}

function cofactorUpward(frontier, landingBit, mover) {
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) result.push(mask & ~landingBit);
  } else {
    for (const mask of frontier) if ((mask & landingBit) === 0n) result.push(mask);
  }
  return normalizeMinimal(result);
}

function cofactorDownward(frontier, landingBit, mover) {
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) if ((mask & landingBit) !== 0n) result.push(mask & ~landingBit);
  } else {
    for (const mask of frontier) result.push(mask & ~landingBit);
  }
  return normalizeMaximal(result);
}

function subtractUpwardFromDownward(downward, forbiddenUpward) {
  if (downward.length === 0 || forbiddenUpward.length === 0) return Object.freeze(downward.slice());
  const result = [];
  for (const cap of downward) {
    let candidates = [cap];
    for (const forbidden of forbiddenUpward) {
      const next = [];
      for (const candidate of candidates) {
        if ((forbidden & ~candidate) !== 0n) {
          next.push(candidate);
          continue;
        }
        for (let bits = forbidden; bits !== 0n; bits &= bits - 1n) {
          const bit = bits & -bits;
          next.push(candidate & ~bit);
        }
      }
      candidates = normalizeMaximal(next);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMaximal(result);
}

function subtractDownwardFromUpward(upward, forbiddenDownward, universeMask) {
  if (upward.length === 0 || forbiddenDownward.length === 0) return Object.freeze(upward.slice());
  const result = [];
  for (const base of upward) {
    let candidates = [base];
    for (const forbidden of forbiddenDownward) {
      const next = [];
      for (const candidate of candidates) {
        if ((candidate & ~forbidden) !== 0n) {
          next.push(candidate);
          continue;
        }
        const available = universeMask & ~forbidden;
        for (let bits = available; bits !== 0n; bits &= bits - 1n) {
          const bit = bits & -bits;
          next.push(candidate | bit);
        }
      }
      candidates = normalizeMinimal(next);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMinimal(result);
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

function sameFamily(left, right) {
  if (left.length !== right.length) return false;
  const a = left.slice().sort((x, y) => x < y ? -1 : x > y ? 1 : 0);
  const b = right.slice().sort((x, y) => x < y ? -1 : x > y ? 1 : 0);
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
}

class MinimalFamilyZdd {
  constructor(cellCount) {
    this.cellCount = cellCount;
    this.nodes = [null, null]; // 0 = empty family, 1 = { empty set }
    this.unique = new Map();
    this.buildCache = new Map();
    this.unionCache = new Map();
    this.noSubCache = new Map();
    this.notSupersetCache = new Map();
    this.minJoinCache = new Map();
    this.metrics = {
      nodeRequests: 0,
      nodeCreates: 0,
      nodeReuse: 0,
      unionCalls: 0,
      unionHits: 0,
      noSubCalls: 0,
      noSubHits: 0,
      notSupersetCalls: 0,
      notSupersetHits: 0,
      minJoinCalls: 0,
      minJoinHits: 0,
    };
  }

  top(ref) {
    return ref <= 1 ? Number.POSITIVE_INFINITY : this.nodes[ref].level;
  }

  node(level, lo, hi) {
    this.metrics.nodeRequests += 1;
    if (hi === 0) return lo; // ZDD zero suppression
    const key = `${level}:${lo}:${hi}`;
    const prior = this.unique.get(key);
    if (prior !== undefined) {
      this.metrics.nodeReuse += 1;
      return prior;
    }
    const ref = this.nodes.length;
    this.nodes.push(Object.freeze({ level, lo, hi }));
    this.unique.set(key, ref);
    this.metrics.nodeCreates += 1;
    return ref;
  }

  split(ref, level) {
    if (ref <= 1 || this.nodes[ref].level > level) return [ref, 0];
    assert(this.nodes[ref].level === level, 'split level ordering violation');
    return [this.nodes[ref].lo, this.nodes[ref].hi];
  }

  build(masks) {
    const family = orderedUnique(masks, false);
    if (family.length === 0) return 0;
    const key = family.map((mask) => mask.toString(16)).join(',');
    const cached = this.buildCache.get(key);
    if (cached !== undefined) return cached;
    const ref = this.#buildRecursive(family);
    this.buildCache.set(key, ref);
    return ref;
  }

  #buildRecursive(family) {
    if (family.length === 0) return 0;
    if (family.length === 1 && family[0] === 0n) return 1;
    let union = 0n;
    for (const mask of family) union |= mask;
    if (union === 0n) return 1;
    const lowBit = union & -union;
    let level = 0;
    for (let bits = lowBit; bits > 1n; bits >>= 1n) level += 1;
    assert(level < this.cellCount, 'family mask escaped configured universe');
    const loMasks = [];
    const hiMasks = [];
    for (const mask of family) {
      if ((mask & lowBit) === 0n) loMasks.push(mask);
      else hiMasks.push(mask & ~lowBit);
    }
    return this.node(level, this.#buildRecursive(loMasks), this.#buildRecursive(hiMasks));
  }

  containsEmpty(ref) {
    let current = ref;
    while (current > 1) current = this.nodes[current].lo;
    return current === 1;
  }

  union(a, b) {
    this.metrics.unionCalls += 1;
    if (a === 0) return b;
    if (b === 0) return a;
    if (a === b) return a;
    if (a > b) [a, b] = [b, a];
    const key = `${a}:${b}`;
    const cached = this.unionCache.get(key);
    if (cached !== undefined) {
      this.metrics.unionHits += 1;
      return cached;
    }
    const level = Math.min(this.top(a), this.top(b));
    if (!Number.isFinite(level)) {
      // Only possible unresolved terminal pair is {empty} U {empty}, handled by a===b.
      throw new Error('unexpected terminal union state');
    }
    const [a0, a1] = this.split(a, level);
    const [b0, b1] = this.split(b, level);
    const result = this.node(level, this.union(a0, b0), this.union(a1, b1));
    this.unionCache.set(key, result);
    return result;
  }

  notSuperset(p, q) {
    this.metrics.notSupersetCalls += 1;
    if (p === 0) return 0;
    if (q === 0) return p;
    if (this.containsEmpty(q)) return 0;
    if (p === 1) return 1;
    if (p === q) return 0;
    const key = `${p}:${q}`;
    const cached = this.notSupersetCache.get(key);
    if (cached !== undefined) {
      this.metrics.notSupersetHits += 1;
      return cached;
    }
    const tp = this.top(p);
    const tq = this.top(q);
    let result;
    if (tp < tq) {
      const pn = this.nodes[p];
      result = this.node(tp, this.notSuperset(pn.lo, q), this.notSuperset(pn.hi, q));
    } else if (tq < tp) {
      const qn = this.nodes[q];
      result = this.notSuperset(p, qn.lo);
    } else {
      const pn = this.nodes[p];
      const qn = this.nodes[q];
      const low = this.notSuperset(pn.lo, qn.lo);
      const high = this.notSuperset(this.notSuperset(pn.hi, qn.lo), qn.hi);
      result = this.node(tp, low, high);
    }
    this.notSupersetCache.set(key, result);
    return result;
  }

  noSub(ref) {
    this.metrics.noSubCalls += 1;
    if (ref <= 1) return ref;
    const cached = this.noSubCache.get(ref);
    if (cached !== undefined) {
      this.metrics.noSubHits += 1;
      return cached;
    }
    const node = this.nodes[ref];
    const low = this.noSub(node.lo);
    const high0 = this.noSub(node.hi);
    const high = this.notSuperset(high0, low);
    const result = this.node(node.level, low, high);
    this.noSubCache.set(ref, result);
    return result;
  }

  absorbUnion(a, b) {
    if (a === 0) return b;
    if (b === 0) return a;
    if (a === b) return a;
    return this.noSub(this.union(a, b));
  }

  minJoin(a, b) {
    this.metrics.minJoinCalls += 1;
    if (a === 0 || b === 0) return 0;
    if (a === 1) return b;
    if (b === 1) return a;
    if (a === b) return a;
    if (a > b) [a, b] = [b, a];
    const key = `${a}:${b}`;
    const cached = this.minJoinCache.get(key);
    if (cached !== undefined) {
      this.metrics.minJoinHits += 1;
      return cached;
    }
    const level = Math.min(this.top(a), this.top(b));
    const [a0, a1] = this.split(a, level);
    const [b0, b1] = this.split(b, level);
    const low = this.minJoin(a0, b0);
    const h10 = this.minJoin(a1, b0);
    const h01 = this.minJoin(a0, b1);
    const h11 = this.minJoin(a1, b1);
    const highRaw = this.absorbUnion(this.absorbUnion(h10, h01), h11);
    const high = this.notSuperset(highRaw, low);
    const result = this.node(level, low, high);
    this.minJoinCache.set(key, result);
    return result;
  }

  members(ref) {
    const out = [];
    const walk = (nodeRef, prefix) => {
      if (nodeRef === 0) return;
      if (nodeRef === 1) {
        out.push(prefix);
        return;
      }
      const node = this.nodes[nodeRef];
      walk(node.lo, prefix);
      walk(node.hi, prefix | (1n << BigInt(node.level)));
    };
    walk(ref, 0n);
    return normalizeMinimal(out);
  }

  snapshot() {
    return Object.freeze({
      nodes: this.nodes.length - 2,
      ...this.metrics,
      buildCache: this.buildCache.size,
      unionCache: this.unionCache.size,
      noSubCache: this.noSubCache.size,
      notSupersetCache: this.notSupersetCache.size,
      minJoinCache: this.minJoinCache.size,
    });
  }
}

function metricDelta(after, before) {
  const result = {};
  for (const [key, value] of Object.entries(after)) {
    if (typeof value === 'number' && typeof before[key] === 'number') result[key] = value - before[key];
  }
  return result;
}

function selfTestZdd() {
  const manager = new MinimalFamilyZdd(8);
  const samples = [
    [[1n, 2n], [4n, 8n]],
    [[1n, 6n, 24n], [2n, 5n, 16n]],
    [[3n, 12n, 48n], [5n, 10n, 32n]],
    [[0n], [1n, 2n, 4n]],
  ];
  for (const [leftRaw, rightRaw] of samples) {
    const left = normalizeMinimal(leftRaw);
    const right = normalizeMinimal(rightRaw);
    const expected = explicitMinJoin(left, right);
    const actual = manager.members(manager.minJoin(manager.build(left), manager.build(right)));
    assert(sameFamily(actual, expected), `ZDD MinJoin self-test mismatch: expected ${expected} actual ${actual}`);
  }
}

function keepTop(list, entry) {
  list.push(entry);
  list.sort((a, b) => b.pairCount - a.pairCount || a.supportIndex - b.supportIndex);
  if (list.length > TOP_OPERATIONS) list.length = TOP_OPERATIONS;
}

function solveCapture(spec) {
  const authoritative = solveBsfpOwnershipAntichainWdl(spec);
  const support = createBsfpSupportLatticeProfile(spec);
  const cellCount = spec.columns * spec.rows;
  const lines = createConnectWinningLines(spec);
  const lineMasks = lines.map((line) => {
    let mask = 0n;
    for (const cell of line) mask |= 1n << BigInt(cell);
    return mask;
  });
  const incidence = buildLineIncidence(lineMasks, cellCount);
  const winFrontiers = new Array(support.itemCapacity);
  const lossFrontiers = new Array(support.itemCapacity);
  const topOperations = [];
  let hardOperationCount = 0;
  let totalPairCount = 0;
  let frontierMismatches = 0;

  function capture(kind, supportIndex, rank, universeMask, left, right, output) {
    const pairCount = left.length * right.length;
    hardOperationCount += 1;
    totalPairCount += pairCount;
    keepTop(topOperations, Object.freeze({ kind, supportIndex, rank, universeMask, left, right, output, pairCount }));
  }

  for (let rank = support.maxRank; rank >= 0; rank -= 1) {
    for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
      if (support.ranks[supportIndex] !== rank) continue;
      const heights = support.decodeHeights(supportIndex);
      const mover = rank & 1;
      const universeMask = supportUniverseMask(heights, spec.columns);
      let aggregateWins = null;
      let aggregateLosses = null;

      for (let column = 0; column < spec.columns; column += 1) {
        const row = heights[column];
        if (row >= spec.rows) continue;
        const landingCell = row * spec.columns + column;
        const landingBit = 1n << BigInt(landingCell);
        const childSupportIndex = supportIndex + support.weights[column];
        let moveWins = cofactorUpward(winFrontiers[childSupportIndex], landingBit, mover);
        let moveLosses = cofactorDownward(lossFrontiers[childSupportIndex], landingBit, mover);

        if (mover === 0) {
          const terminalWins = [];
          for (const lineMask of incidence[landingCell]) {
            const requiredP0 = lineMask & ~landingBit;
            if ((requiredP0 & ~universeMask) === 0n) terminalWins.push(requiredP0);
          }
          const terminalWinFrontier = normalizeMinimal(terminalWins);
          if (terminalWinFrontier.length > 0) {
            moveLosses = subtractUpwardFromDownward(moveLosses, terminalWinFrontier);
            moveWins = unionUpward(moveWins, terminalWinFrontier);
          }
        } else {
          const terminalLosses = [];
          for (const lineMask of incidence[landingCell]) {
            const requiredP1 = lineMask & ~landingBit;
            if ((requiredP1 & ~universeMask) === 0n) terminalLosses.push(universeMask & ~requiredP1);
          }
          const terminalLossFrontier = normalizeMaximal(terminalLosses);
          if (terminalLossFrontier.length > 0) {
            moveWins = subtractDownwardFromUpward(moveWins, terminalLossFrontier, universeMask);
            moveLosses = unionDownward(moveLosses, terminalLossFrontier);
          }
        }

        if (aggregateWins === null) {
          aggregateWins = moveWins;
          aggregateLosses = moveLosses;
        } else if (mover === 0) {
          aggregateWins = unionUpward(aggregateWins, moveWins);
          const prior = aggregateLosses;
          aggregateLosses = intersectDownward(prior, moveLosses);
          capture('loss-required-p1', supportIndex, rank, universeMask, prior, moveLosses, aggregateLosses);
        } else {
          const prior = aggregateWins;
          aggregateWins = intersectUpward(prior, moveWins);
          capture('win-required-p0', supportIndex, rank, universeMask, prior, moveWins, aggregateWins);
          aggregateLosses = unionDownward(aggregateLosses, moveLosses);
        }
      }

      const wins = aggregateWins ?? Object.freeze([]);
      const losses = aggregateLosses ?? Object.freeze([]);
      winFrontiers[supportIndex] = wins;
      lossFrontiers[supportIndex] = losses;
      const expected = authoritative.frontierAt(supportIndex);
      if (!sameFamily(wins, expected.wins) || !sameFamily(losses, expected.losses)) frontierMismatches += 1;
    }
  }

  assert(frontierMismatches === 0, `${spec.columns}x${spec.rows}:c${spec.connect} capture recurrence diverged from authoritative C1`);
  return Object.freeze({ authoritative, topOperations, hardOperationCount, totalPairCount, frontierMismatches, cellCount });
}

function requirementsForOperation(operation) {
  if (operation.kind === 'win-required-p0') {
    return Object.freeze({
      left: operation.left,
      right: operation.right,
      expected: operation.output,
    });
  }
  const convert = (caps) => normalizeMinimal(caps.map((cap) => operation.universeMask & ~cap));
  return Object.freeze({
    left: convert(operation.left),
    right: convert(operation.right),
    expected: convert(operation.output),
  });
}

function analyzeCase(spec) {
  const captured = solveCapture(spec);
  const manager = new MinimalFamilyZdd(captured.cellCount);
  let analyzedPairCount = 0;
  let analyzedOutputRecords = 0;
  let zddMismatches = 0;
  let minJoinCalls = 0;
  let minJoinMisses = 0;
  let notSupersetCalls = 0;
  let notSupersetMisses = 0;
  let nodeCreates = 0;
  let bestPairToMissRatio = 0;
  let worstPairToMissRatio = Number.POSITIVE_INFINITY;
  const operationSummaries = [];

  for (const operation of captured.topOperations) {
    const requirements = requirementsForOperation(operation);
    const before = manager.snapshot();
    const leftRef = manager.build(requirements.left);
    const rightRef = manager.build(requirements.right);
    const resultRef = manager.minJoin(leftRef, rightRef);
    const actual = manager.members(resultRef);
    const after = manager.snapshot();
    const delta = metricDelta(after, before);
    if (!sameFamily(actual, requirements.expected)) zddMismatches += 1;
    analyzedPairCount += requirements.left.length * requirements.right.length;
    analyzedOutputRecords += actual.length;
    minJoinCalls += delta.minJoinCalls;
    minJoinMisses += delta.minJoinCalls - delta.minJoinHits;
    notSupersetCalls += delta.notSupersetCalls;
    notSupersetMisses += delta.notSupersetCalls - delta.notSupersetHits;
    nodeCreates += delta.nodeCreates;
    const misses = Math.max(1, delta.minJoinCalls - delta.minJoinHits);
    const ratio = (requirements.left.length * requirements.right.length) / misses;
    bestPairToMissRatio = Math.max(bestPairToMissRatio, ratio);
    worstPairToMissRatio = Math.min(worstPairToMissRatio, ratio);
    operationSummaries.push(Object.freeze({
      kind: operation.kind,
      supportIndex: operation.supportIndex,
      rank: operation.rank,
      leftRecords: requirements.left.length,
      rightRecords: requirements.right.length,
      pairCount: requirements.left.length * requirements.right.length,
      outputRecords: actual.length,
      minJoinCalls: delta.minJoinCalls,
      minJoinCacheHits: delta.minJoinHits,
      minJoinMisses: delta.minJoinCalls - delta.minJoinHits,
      notSupersetCalls: delta.notSupersetCalls,
      notSupersetCacheHits: delta.notSupersetHits,
      nodesCreated: delta.nodeCreates,
      pairToMinJoinMissRatio: ratio,
    }));
  }

  assert(zddMismatches === 0, `${spec.columns}x${spec.rows}:c${spec.connect} fused MinJoin mismatch`);
  operationSummaries.sort((a, b) => b.pairCount - a.pairCount || a.supportIndex - b.supportIndex);
  const final = manager.snapshot();
  return Object.freeze({
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    c1RootWdl: captured.authoritative.rootWdl,
    hardOperationCount: captured.hardOperationCount,
    totalC1PairCountAcrossHardOps: captured.totalPairCount,
    analyzedTopOperations: captured.topOperations.length,
    analyzedPairCount,
    analyzedOutputRecords,
    captureFrontierMismatches: captured.frontierMismatches,
    zddMismatches,
    zdd: Object.freeze({
      canonicalNodes: final.nodes,
      nodeCreates,
      minJoinCalls,
      minJoinMisses,
      minJoinCacheHits: minJoinCalls - minJoinMisses,
      notSupersetCalls,
      notSupersetMisses,
      notSupersetCacheHits: notSupersetCalls - notSupersetMisses,
      pairToMinJoinMissRatio: minJoinMisses === 0 ? null : analyzedPairCount / minJoinMisses,
      bestOperationPairToMinJoinMissRatio: bestPairToMissRatio,
      worstOperationPairToMinJoinMissRatio: worstPairToMissRatio === Number.POSITIVE_INFINITY ? null : worstPairToMissRatio,
      finalCaches: Object.freeze({
        build: final.buildCache,
        union: final.unionCache,
        noSub: final.noSubCache,
        notSuperset: final.notSupersetCache,
        minJoin: final.minJoinCache,
      }),
    }),
    hottestOperations: Object.freeze(operationSummaries.slice(0, 12)),
  });
}

selfTestZdd();
const cases = CASES.map(analyzeCase);
console.log(JSON.stringify({
  kind: 'connect4-zdd-inspired-fused-minjoin-reference',
  status: 'pass',
  method: 'canonical-zdd-minjoin-with-subsumpion-during-construction',
  claim: 'research-only exact comparison against actual C1 hard-intersection operands',
  topOperationsPerGeometry: TOP_OPERATIONS,
  cases,
}, null, 2));
