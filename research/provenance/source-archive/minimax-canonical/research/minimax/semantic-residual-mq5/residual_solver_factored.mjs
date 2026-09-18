import { geometry, compile, minimal } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';

const G = geometry();
const WIDTH = 7;
const CELLS = 42;
const ORDER = G.order;
const TT_UPPER_LIMIT = 37;
const TT_LOWER_OFFSET = 56;
const TT_UPPER_OFFSET = 19;

function pop32(x) {
  x >>>= 0;
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return Math.imul((x + (x >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24;
}
function popPair(lo, hi) { return pop32(lo) + pop32(hi); }
function canonical(goals) {
  const out = minimal(goals).map(([lo, hi]) => [lo >>> 0, hi >>> 0]);
  out.sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]));
  return out;
}
function goalsKey(goals) {
  let out = '';
  for (const [lo, hi] of goals) out += `${hi.toString(16)}:${lo.toString(16)},`;
  return out;
}
function heightFromArray(heights) {
  let packed = 0;
  for (let c = 0; c < WIDTH; c += 1) packed |= heights[c] << (3 * c);
  return packed >>> 0;
}
function heightAt(packed, column) { return (packed >>> (3 * column)) & 7; }
function bitForCell(cell) { return cell < 32 ? [2 ** cell >>> 0, 0] : [0, 2 ** (cell - 32) >>> 0]; }
function intersects(goal, bit) { return ((goal[0] & bit[0]) | (goal[1] & bit[1])) !== 0; }
function clearBit(goal, bit) { return [(goal[0] & ~bit[0]) >>> 0, (goal[1] & ~bit[1]) >>> 0]; }
function isEmpty(goal) { return (goal[0] | goal[1]) === 0; }
function isSingleton(goal) { return popPair(goal[0], goal[1]) === 1; }

class SideArena {
  constructor() { this.reset(); }
  reset() {
    this.ids = new Map();
    this.goals = [];
    this.winningCounts = [];
    this.moverTransitions = new Map();
    this.blockerTransitions = new Map();
    this.normalizeCalls = 0;
    this.internHits = 0;
    this.keyBytesApprox = 0;
    this.goalPairs = 0;
  }
  intern(goals, alreadyCanonical = false) {
    const value = alreadyCanonical ? goals : canonical(goals);
    const key = goalsKey(value);
    const existing = this.ids.get(key);
    if (existing !== undefined) { this.internHits += 1; return existing; }
    const ref = this.goals.length;
    this.ids.set(key, ref);
    this.keyBytesApprox += key.length * 2;
    this.goalPairs += value.length;
    this.goals.push(value);
    let lo = 0, hi = 0;
    for (const goal of value) if (isSingleton(goal)) { lo |= goal[0]; hi |= goal[1]; }
    this.winningCounts.push(popPair(lo >>> 0, hi >>> 0));
    return ref;
  }
  transitionKey(ref, cell) { return ref * 64 + cell; }
  mover(ref, cell) {
    const cacheKey = this.transitionKey(ref, cell);
    const cached = this.moverTransitions.get(cacheKey);
    if (cached !== undefined) return cached;
    const bit = bitForCell(cell);
    const moved = [];
    for (const goal of this.goals[ref]) {
      if (intersects(goal, bit)) {
        const reduced = clearBit(goal, bit);
        if (isEmpty(reduced)) { this.moverTransitions.set(cacheKey, -1); return -1; }
        moved.push(reduced);
      } else moved.push(goal);
    }
    this.normalizeCalls += 1;
    const nextRef = this.intern(moved, false);
    const encoded = nextRef + 1;
    this.moverTransitions.set(cacheKey, encoded);
    return encoded;
  }
  blocker(ref, cell) {
    const cacheKey = this.transitionKey(ref, cell);
    const cached = this.blockerTransitions.get(cacheKey);
    if (cached !== undefined) return cached;
    const bit = bitForCell(cell);
    const goals = this.goals[ref];
    const kept = [];
    for (const goal of goals) if (!intersects(goal, bit)) kept.push(goal);
    const nextRef = kept.length === goals.length ? ref : this.intern(kept, true);
    const encoded = nextRef + 1;
    this.blockerTransitions.set(cacheKey, encoded);
    return encoded;
  }
  immediateWinningColumns(ref, height) {
    let columns = 0;
    for (const goal of this.goals[ref]) {
      if (!isSingleton(goal)) continue;
      let cell;
      if (goal[0] !== 0) cell = 31 - Math.clz32(goal[0]);
      else cell = 63 - Math.clz32(goal[1]);
      const column = Math.floor(cell / 7);
      const row = cell - column * 7;
      if (column < WIDTH && row === heightAt(height, column)) columns |= 1 << column;
    }
    return columns;
  }
  winningCellCount(ref) { return this.winningCounts[ref]; }
  metrics() {
    return {
      sideStates: this.goals.length,
      goalPairs: this.goalPairs,
      goalPairBytes: this.goalPairs * 8,
      canonicalKeyBytesApprox: this.keyBytesApprox,
      moverTransitionCacheEntries: this.moverTransitions.size,
      blockerTransitionCacheEntries: this.blockerTransitions.size,
      normalizeCalls: this.normalizeCalls,
      internHits: this.internHits,
    };
  }
}

class StateArena {
  constructor(sideArena) {
    this.side = sideArena;
    this.reset();
  }
  reset() {
    this.ids = new Map();
    this.count = 0;
    this.capacity = 1 << 20;
    this.height = new Uint32Array(this.capacity);
    this.moves = new Uint8Array(this.capacity);
    this.currentRef = new Uint32Array(this.capacity);
    this.opponentRef = new Uint32Array(this.capacity);
    this.internHits = 0;
    this.prepareCalls = 0;
  }
  ensure() {
    if (this.count < this.capacity) return;
    const nextCapacity = this.capacity * 2;
    for (const name of ['height', 'currentRef', 'opponentRef']) {
      const next = new Uint32Array(nextCapacity); next.set(this[name]); this[name] = next;
    }
    const nextMoves = new Uint8Array(nextCapacity); nextMoves.set(this.moves); this.moves = nextMoves;
    this.capacity = nextCapacity;
  }
  key(height, currentRef, opponentRef) {
    return (BigInt(height >>> 0) << 64n) | (BigInt(currentRef >>> 0) << 32n) | BigInt(opponentRef >>> 0);
  }
  intern(height, moves, currentRef, opponentRef) {
    const key = this.key(height, currentRef, opponentRef);
    const existing = this.ids.get(key);
    if (existing !== undefined) { this.internHits += 1; return existing; }
    this.ensure();
    const id = this.count++;
    this.ids.set(key, id);
    this.height[id] = height >>> 0;
    this.moves[id] = moves;
    this.currentRef[id] = currentRef >>> 0;
    this.opponentRef[id] = opponentRef >>> 0;
    return id;
  }
  compileRoot(position) {
    this.side.reset();
    this.reset();
    const compiled = compile(position, G, true, false);
    const currentRef = this.side.intern(compiled.goals[0]);
    const opponentRef = this.side.intern(compiled.goals[1]);
    return this.intern(heightFromArray(position.heights), position.moves, currentRef, opponentRef);
  }
  prepare(id, column) {
    this.prepareCalls += 1;
    const height = this.height[id];
    const row = heightAt(height, column);
    if (row >= 6) return null;
    const cell = column * 7 + row;
    const moved = this.side.mover(this.currentRef[id], cell);
    if (moved === -1) return { terminal: true, column };
    const blocked = this.side.blocker(this.opponentRef[id], cell);
    const movedRef = moved - 1;
    const blockedRef = blocked - 1;
    return {
      terminal: false,
      column,
      height: (height + (1 << (3 * column))) >>> 0,
      moves: this.moves[id] + 1,
      currentRef: blockedRef,
      opponentRef: movedRef,
      orderScore: this.side.winningCellCount(movedRef),
    };
  }
  internPrepared(prepared) {
    return this.intern(prepared.height, prepared.moves, prepared.currentRef, prepared.opponentRef);
  }
  metrics() {
    return {
      states: this.count,
      internHits: this.internHits,
      prepareCalls: this.prepareCalls,
      typedStateBytesUsed: this.count * 13,
      typedStateBytesCapacity: this.height.byteLength + this.moves.byteLength + this.currentRef.byteLength + this.opponentRef.byteLength,
      stateMapEntries: this.ids.size,
    };
  }
}

export class FactoredResidualSolver {
  constructor(pow = 19) {
    this.size = 1 << pow;
    this.mask = this.size - 1;
    this.key = new Uint32Array(this.size);
    this.val = new Uint8Array(this.size);
    this.bankOffset = new Uint32Array(CELLS + 1);
    this.bankMask = new Uint32Array(CELLS + 1);
    this.configureExact16Banks(pow);
    this.side = new SideArena();
    this.arena = new StateArena(this.side);
    this.resetMetrics();
  }
  configureExact16Banks(pow) {
    this.bankOffset.fill(0); this.bankMask.fill(this.mask);
    if (pow !== 19) return;
    const bankSize = 1 << 15, bankMask = bankSize - 1;
    for (let moves = 0; moves <= CELLS; moves += 1) {
      const bank = moves <= 20 ? 0 : moves <= 34 ? moves - 20 : 15;
      this.bankOffset[moves] = bank * bankSize;
      this.bankMask[moves] = bankMask;
    }
  }
  resetMetrics() {
    this.nodes = 0;
    this.ttHits = 0;
    this.writeAttempts = 0;
    this.writeSuccess = 0;
    this.forcedTransitions = 0;
    this.drawStops = 0;
  }
  clearTT() { this.key.fill(0); this.val.fill(0); }
  hash(id) {
    let x = (id + 1) >>> 0;
    x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
    x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
    return (x ^ (x >>> 16)) >>> 0;
  }
  probe(id, moves, alpha, beta) {
    const slot = (this.bankOffset[moves] + (this.hash(id) & this.bankMask[moves])) >>> 0;
    if (this.key[slot] !== ((id + 1) >>> 0)) return { slot, alpha, beta, cutoff: false };
    const cached = this.val[slot];
    if (cached === 0) return { slot, alpha, beta, cutoff: false };
    this.ttHits += 1;
    if (cached > TT_UPPER_LIMIT) {
      const low = cached - TT_LOWER_OFFSET;
      if (alpha < low) alpha = low;
    } else {
      const high = cached - TT_UPPER_OFFSET;
      if (beta > high) beta = high;
    }
    return { slot, alpha, beta, cutoff: alpha >= beta };
  }
  publish(slot, id, value) {
    this.writeAttempts += 1;
    this.key[slot] = (id + 1) >>> 0;
    this.val[slot] = value;
    this.writeSuccess += 1;
  }
  solve(position) {
    this.resetMetrics();
    this.clearTT();
    const compileStart = performance.now();
    const root = this.arena.compileRoot(position);
    this.compileMs = performance.now() - compileStart;
    const rootHeight = this.arena.height[root];
    const rootCurrent = this.arena.currentRef[root];
    if (this.side.immediateWinningColumns(rootCurrent, rootHeight) !== 0) {
      this.searchMs = 0;
      return Math.trunc((CELLS + 1 - position.moves) / 2);
    }
    const searchStart = performance.now();
    let min = -Math.trunc((CELLS - position.moves) / 2);
    let max = Math.trunc((CELLS + 1 - position.moves) / 2);
    while (min < max) {
      let med = min + Math.trunc((max - min) / 2);
      if (med <= 0 && Math.trunc(min / 2) < med) med = Math.trunc(min / 2);
      else if (med >= 0 && Math.trunc(max / 2) > med) med = Math.trunc(max / 2);
      const score = this.negamax(root, med, med + 1);
      if (score <= med) max = score; else min = score;
    }
    this.searchMs = performance.now() - searchStart;
    return min === 0 ? 0 : min;
  }
  negamax(id, alpha, beta) {
    this.nodes += 1;
    const moves = this.arena.moves[id];
    const height = this.arena.height[id];
    const currentRef = this.arena.currentRef[id];
    const opponentRef = this.arena.opponentRef[id];

    if (this.side.goals[currentRef].length === 0 && this.side.goals[opponentRef].length === 0) {
      this.drawStops += 1;
      return 0;
    }

    const opponentWins = this.side.immediateWinningColumns(opponentRef, height);
    if ((opponentWins & (opponentWins - 1)) !== 0) return -Math.trunc((CELLS - moves) / 2);

    const candidateColumns = [];
    if (opponentWins !== 0) candidateColumns.push(31 - Math.clz32(opponentWins));
    else for (const column of ORDER) if (heightAt(height, column) < 6) candidateColumns.push(column);

    const survivors = [];
    for (const column of candidateColumns) {
      const prepared = this.arena.prepare(id, column);
      if (prepared === null) continue;
      if (prepared.terminal) return Math.trunc((CELLS + 1 - moves) / 2);
      if (this.side.immediateWinningColumns(prepared.currentRef, prepared.height) !== 0) continue;
      survivors.push(prepared);
    }

    if (survivors.length === 0) return -Math.trunc((CELLS - moves) / 2);
    if (moves >= CELLS - 2) return 0;

    let min = -Math.trunc((CELLS - 2 - moves) / 2);
    if (alpha < min) { alpha = min; if (alpha >= beta) return alpha; }
    let max = Math.trunc((CELLS - 1 - moves) / 2);
    if (beta > max) { beta = max; if (alpha >= beta) return beta; }

    if (survivors.length === 1) {
      this.forcedTransitions += 1;
      const childId = this.arena.internPrepared(survivors[0]);
      return -this.negamax(childId, -beta, -alpha);
    }

    const probe = this.probe(id, moves, alpha, beta);
    alpha = probe.alpha; beta = probe.beta;
    if (probe.cutoff) return alpha;

    survivors.sort((a, b) => b.orderScore - a.orderScore || ORDER.indexOf(a.column) - ORDER.indexOf(b.column));
    for (const prepared of survivors) {
      const childId = this.arena.internPrepared(prepared);
      const score = -this.negamax(childId, -beta, -alpha);
      if (score >= beta) {
        this.publish(probe.slot, id, score + TT_LOWER_OFFSET);
        return score;
      }
      if (score > alpha) alpha = score;
    }
    this.publish(probe.slot, id, alpha + TT_UPPER_OFFSET);
    return alpha;
  }
  metrics() {
    return {
      nodes: this.nodes,
      ttHits: this.ttHits,
      writeAttempts: this.writeAttempts,
      writeSuccess: this.writeSuccess,
      forcedTransitions: this.forcedTransitions,
      drawStops: this.drawStops,
      compileMs: this.compileMs,
      searchMs: this.searchMs,
      totalMs: this.compileMs + this.searchMs,
      stateArena: this.arena.metrics(),
      sideArena: this.side.metrics(),
      ttSlots: this.size,
      ttTypedBytes: this.key.byteLength + this.val.byteLength,
    };
  }
}
