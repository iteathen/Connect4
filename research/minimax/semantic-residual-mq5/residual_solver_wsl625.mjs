import { geometry, compile } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';

const G = geometry();
const WIDTH = 7;
const CELLS = 42;
const BIT_SLOTS = WIDTH * 7; // 49-bit sentinel-stride board layout; playable cells occupy bit indices through 47.
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
function popBig(value) {
  let x = value, count = 0;
  while (x !== 0n) { x &= x - 1n; count += 1; }
  return count;
}
function heightFromArray(heights) {
  let packed = 0;
  for (let c = 0; c < WIDTH; c += 1) packed |= heights[c] << (3 * c);
  return packed >>> 0;
}
function heightAt(packed, column) { return (packed >>> (3 * column)) & 7; }
function pairToBig(lo, hi) { return BigInt(lo >>> 0) | (BigInt(hi >>> 0) << 32n); }

function createWsl625() {
  const unique = new Set();
  for (const [lo, hi] of G.lines) {
    const line = pairToBig(lo, hi);
    for (let subset = line; subset !== 0n; subset = (subset - 1n) & line) unique.add(subset);
  }
  const masks = [...unique].sort((a, b) => {
    const d = popBig(a) - popBig(b);
    return d || (a < b ? -1 : a > b ? 1 : 0);
  });
  if (masks.length !== 625) throw new Error(`expected WSL-625, got ${masks.length}`);
  const count = masks.length;
  const idByMask = new Map(masks.map((mask, id) => [mask, id]));
  const card = new Uint8Array(count);
  const singletonCell = new Uint8Array(count); singletonCell.fill(255);
  const subset = new Uint8Array(count * count);
  const remove = new Int16Array(BIT_SLOTS * count);

  for (let id = 0; id < count; id += 1) {
    card[id] = popBig(masks[id]);
    if (card[id] === 1) {
      let cell = 0, x = masks[id];
      while ((x & 1n) === 0n) { x >>= 1n; cell += 1; }
      singletonCell[id] = cell;
    }
  }
  for (let a = 0; a < count; a += 1) {
    const left = masks[a];
    for (let b = 0; b < count; b += 1) if ((left & masks[b]) === left) subset[a * count + b] = 1;
  }
  for (let cell = 0; cell < BIT_SLOTS; cell += 1) {
    const bit = 1n << BigInt(cell);
    for (let id = 0; id < count; id += 1) {
      const mask = masks[id];
      if ((mask & bit) === 0n) remove[cell * count + id] = id;
      else {
        const reduced = mask & ~bit;
        remove[cell * count + id] = reduced === 0n ? -1 : idByMask.get(reduced);
      }
    }
  }

  function idsFromGoals(goals) {
    const ids = [];
    for (const [lo, hi] of goals) {
      const id = idByMask.get(pairToBig(lo, hi));
      if (id === undefined) throw new Error('residual requirement outside WSL-625');
      ids.push(id);
    }
    return ids;
  }

  function normalizeInPlace(ids) {
    ids.sort((a, b) => a - b);
    let write = 0;
    let previous = -1;
    for (let read = 0; read < ids.length; read += 1) {
      const id = ids[read];
      if (id === previous) continue;
      previous = id;
      let dominated = false;
      for (let j = 0; j < write; j += 1) {
        if (subset[ids[j] * count + id]) { dominated = true; break; }
      }
      if (!dominated) ids[write++] = id;
    }
    ids.length = write;
    return ids;
  }

  return Object.freeze({ count, masks, card, singletonCell, subset, remove, idsFromGoals, normalizeInPlace });
}

const WSL = createWsl625();

class PackedSideArena {
  constructor() { this.reset(); }
  reset() {
    this.hashBuckets = new Map();
    this.sideCount = 0;
    this.sideCapacity = 1 << 19;
    this.offset = new Uint32Array(this.sideCapacity);
    this.length = new Uint8Array(this.sideCapacity);
    this.winningCount = new Uint8Array(this.sideCapacity);
    this.flatCapacity = 1 << 22;
    this.flat = new Uint16Array(this.flatCapacity);
    this.flatUsed = 0;
    this.moverTransitions = new Map();
    this.blockerTransitions = new Map();
    this.normalizeCalls = 0;
    this.internHits = 0;
    this.hashCollisions = 0;
    this.scratch = [];
  }
  ensureSides() {
    if (this.sideCount < this.sideCapacity) return;
    const cap = this.sideCapacity * 2;
    for (const name of ['offset']) { const x = new Uint32Array(cap); x.set(this[name]); this[name] = x; }
    for (const name of ['length', 'winningCount']) { const x = new Uint8Array(cap); x.set(this[name]); this[name] = x; }
    this.sideCapacity = cap;
  }
  ensureFlat(extra) {
    if (this.flatUsed + extra <= this.flatCapacity) return;
    let cap = this.flatCapacity;
    while (this.flatUsed + extra > cap) cap *= 2;
    const x = new Uint16Array(cap); x.set(this.flat); this.flat = x; this.flatCapacity = cap;
  }
  hash(ids) {
    let h = (0x811c9dc5 ^ ids.length) >>> 0;
    for (const id of ids) { h ^= id + 1; h = Math.imul(h, 0x01000193) >>> 0; }
    return h;
  }
  equals(ref, ids) {
    const n = this.length[ref];
    if (n !== ids.length) return false;
    const at = this.offset[ref];
    for (let i = 0; i < n; i += 1) if (this.flat[at + i] !== ids[i]) return false;
    return true;
  }
  intern(ids, alreadyCanonical = false) {
    if (!alreadyCanonical) { this.normalizeCalls += 1; WSL.normalizeInPlace(ids); }
    const hash = this.hash(ids);
    const bucket = this.hashBuckets.get(hash);
    if (bucket !== undefined) {
      if (typeof bucket === 'number') {
        if (this.equals(bucket, ids)) { this.internHits += 1; return bucket; }
        this.hashCollisions += 1;
      } else {
        for (const ref of bucket) if (this.equals(ref, ids)) { this.internHits += 1; return ref; }
        this.hashCollisions += 1;
      }
    }
    this.ensureSides(); this.ensureFlat(ids.length);
    const ref = this.sideCount++;
    this.offset[ref] = this.flatUsed;
    this.length[ref] = ids.length;
    let wins = 0;
    for (const id of ids) { this.flat[this.flatUsed++] = id; if (WSL.card[id] === 1) wins += 1; }
    this.winningCount[ref] = wins;
    if (bucket === undefined) this.hashBuckets.set(hash, ref);
    else if (typeof bucket === 'number') this.hashBuckets.set(hash, [bucket, ref]);
    else bucket.push(ref);
    return ref;
  }
  transitionKey(ref, cell) { return ref * 64 + cell; }
  mover(ref, cell) {
    if (cell < 0 || cell >= BIT_SLOTS) throw new RangeError(`invalid board bit index ${cell}`);
    const key = this.transitionKey(ref, cell);
    const cached = this.moverTransitions.get(key);
    if (cached !== undefined) return cached;
    const raw = this.scratch; raw.length = 0;
    const at = this.offset[ref], n = this.length[ref], base = cell * WSL.count;
    for (let i = 0; i < n; i += 1) {
      const mapped = WSL.remove[base + this.flat[at + i]];
      if (mapped < 0) { this.moverTransitions.set(key, -1); return -1; }
      raw.push(mapped);
    }
    const nextRef = this.intern(raw, false);
    const encoded = nextRef + 1;
    this.moverTransitions.set(key, encoded);
    return encoded;
  }
  blocker(ref, cell) {
    if (cell < 0 || cell >= BIT_SLOTS) throw new RangeError(`invalid board bit index ${cell}`);
    const key = this.transitionKey(ref, cell);
    const cached = this.blockerTransitions.get(key);
    if (cached !== undefined) return cached;
    const kept = this.scratch; kept.length = 0;
    const at = this.offset[ref], n = this.length[ref], base = cell * WSL.count;
    for (let i = 0; i < n; i += 1) {
      const id = this.flat[at + i];
      if (WSL.remove[base + id] === id) kept.push(id);
    }
    const nextRef = kept.length === n ? ref : this.intern(kept, true);
    const encoded = nextRef + 1;
    this.blockerTransitions.set(key, encoded);
    return encoded;
  }
  immediateWinningColumns(ref, height) {
    let columns = 0;
    const at = this.offset[ref], n = this.length[ref];
    for (let i = 0; i < n; i += 1) {
      const cell = WSL.singletonCell[this.flat[at + i]];
      if (cell === 255) continue;
      const column = Math.floor(cell / 7), row = cell - column * 7;
      if (row === heightAt(height, column)) columns |= 1 << column;
    }
    return columns;
  }
  metrics() {
    return {
      requirementUniverse: WSL.count,
      sideStates: this.sideCount,
      storedRequirementIds: this.flatUsed,
      storedRequirementBytes: this.flatUsed * 2,
      sideIndexBytesUsed: this.sideCount * 6,
      sideIndexCapacityBytes: this.offset.byteLength + this.length.byteLength + this.winningCount.byteLength,
      moverTransitionCacheEntries: this.moverTransitions.size,
      blockerTransitionCacheEntries: this.blockerTransitions.size,
      normalizeCalls: this.normalizeCalls,
      internHits: this.internHits,
      hashCollisions: this.hashCollisions,
      hashBuckets: this.hashBuckets.size,
    };
  }
}

class StateArena {
  constructor(side) { this.side = side; this.reset(); }
  reset() {
    this.ids = new Map(); this.count = 0; this.capacity = 1 << 20;
    this.height = new Uint32Array(this.capacity); this.moves = new Uint8Array(this.capacity);
    this.currentRef = new Uint32Array(this.capacity); this.opponentRef = new Uint32Array(this.capacity);
    this.internHits = 0; this.prepareCalls = 0;
  }
  ensure() {
    if (this.count < this.capacity) return;
    const cap = this.capacity * 2;
    for (const name of ['height', 'currentRef', 'opponentRef']) { const x = new Uint32Array(cap); x.set(this[name]); this[name] = x; }
    const m = new Uint8Array(cap); m.set(this.moves); this.moves = m; this.capacity = cap;
  }
  key(height, currentRef, opponentRef) { return (BigInt(height >>> 0) << 64n) | (BigInt(currentRef >>> 0) << 32n) | BigInt(opponentRef >>> 0); }
  intern(height, moves, currentRef, opponentRef) {
    const key = this.key(height, currentRef, opponentRef), old = this.ids.get(key);
    if (old !== undefined) { this.internHits += 1; return old; }
    this.ensure(); const id = this.count++; this.ids.set(key, id);
    this.height[id] = height >>> 0; this.moves[id] = moves; this.currentRef[id] = currentRef >>> 0; this.opponentRef[id] = opponentRef >>> 0;
    return id;
  }
  compileRoot(position) {
    this.side.reset(); this.reset();
    const compiled = compile(position, G, true, false);
    const currentRef = this.side.intern(WSL.idsFromGoals(compiled.goals[0]), false);
    const opponentRef = this.side.intern(WSL.idsFromGoals(compiled.goals[1]), false);
    return this.intern(heightFromArray(position.heights), position.moves, currentRef, opponentRef);
  }
  prepare(id, column) {
    this.prepareCalls += 1;
    const height = this.height[id], row = heightAt(height, column);
    if (row >= 6) return null;
    const cell = column * 7 + row;
    const moved = this.side.mover(this.currentRef[id], cell);
    if (moved === -1) return { terminal: true, column };
    const blocked = this.side.blocker(this.opponentRef[id], cell);
    const movedRef = moved - 1, blockedRef = blocked - 1;
    return { terminal: false, column, height: (height + (1 << (3 * column))) >>> 0, moves: this.moves[id] + 1, currentRef: blockedRef, opponentRef: movedRef, orderScore: this.side.winningCount[movedRef] };
  }
  internPrepared(p) { return this.intern(p.height, p.moves, p.currentRef, p.opponentRef); }
  metrics() {
    return { states: this.count, internHits: this.internHits, prepareCalls: this.prepareCalls, typedStateBytesUsed: this.count * 13, typedStateCapacityBytes: this.height.byteLength + this.moves.byteLength + this.currentRef.byteLength + this.opponentRef.byteLength, stateMapEntries: this.ids.size };
  }
}

export class Wsl625ResidualSolver {
  constructor(pow = 19) {
    this.size = 1 << pow; this.mask = this.size - 1;
    this.key = new Uint32Array(this.size); this.val = new Uint8Array(this.size);
    this.bankOffset = new Uint32Array(CELLS + 1); this.bankMask = new Uint32Array(CELLS + 1); this.configureExact16Banks(pow);
    this.side = new PackedSideArena(); this.arena = new StateArena(this.side); this.resetMetrics();
  }
  configureExact16Banks(pow) {
    this.bankOffset.fill(0); this.bankMask.fill(this.mask); if (pow !== 19) return;
    const bankSize = 1 << 15, bankMask = bankSize - 1;
    for (let moves = 0; moves <= CELLS; moves += 1) { const bank = moves <= 20 ? 0 : moves <= 34 ? moves - 20 : 15; this.bankOffset[moves] = bank * bankSize; this.bankMask[moves] = bankMask; }
  }
  resetMetrics() { this.nodes = 0; this.ttHits = 0; this.writeAttempts = 0; this.writeSuccess = 0; this.forcedTransitions = 0; this.drawStops = 0; }
  clearTT() { this.key.fill(0); this.val.fill(0); }
  hash(id) { let x = (id + 1) >>> 0; x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0; x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0; return (x ^ (x >>> 16)) >>> 0; }
  probe(id, moves, alpha, beta) {
    const slot = (this.bankOffset[moves] + (this.hash(id) & this.bankMask[moves])) >>> 0;
    if (this.key[slot] !== ((id + 1) >>> 0)) return { slot, alpha, beta, cutoff: false };
    const cached = this.val[slot]; if (cached === 0) return { slot, alpha, beta, cutoff: false };
    this.ttHits += 1;
    if (cached > TT_UPPER_LIMIT) { const low = cached - TT_LOWER_OFFSET; if (alpha < low) alpha = low; }
    else { const high = cached - TT_UPPER_OFFSET; if (beta > high) beta = high; }
    return { slot, alpha, beta, cutoff: alpha >= beta };
  }
  publish(slot, id, value) { this.writeAttempts += 1; this.key[slot] = (id + 1) >>> 0; this.val[slot] = value; this.writeSuccess += 1; }
  solve(position) {
    this.resetMetrics(); this.clearTT();
    const t0 = performance.now(); const root = this.arena.compileRoot(position); this.compileMs = performance.now() - t0;
    if (this.side.immediateWinningColumns(this.arena.currentRef[root], this.arena.height[root]) !== 0) { this.searchMs = 0; return Math.trunc((CELLS + 1 - position.moves) / 2); }
    const t1 = performance.now(); let min = -Math.trunc((CELLS - position.moves) / 2), max = Math.trunc((CELLS + 1 - position.moves) / 2);
    while (min < max) { let med = min + Math.trunc((max - min) / 2); if (med <= 0 && Math.trunc(min / 2) < med) med = Math.trunc(min / 2); else if (med >= 0 && Math.trunc(max / 2) > med) med = Math.trunc(max / 2); const score = this.negamax(root, med, med + 1); if (score <= med) max = score; else min = score; }
    this.searchMs = performance.now() - t1; return min === 0 ? 0 : min;
  }
  negamax(id, alpha, beta) {
    this.nodes += 1;
    const moves = this.arena.moves[id], height = this.arena.height[id], currentRef = this.arena.currentRef[id], opponentRef = this.arena.opponentRef[id];
    if (this.side.length[currentRef] === 0 && this.side.length[opponentRef] === 0) { this.drawStops += 1; return 0; }
    const opponentWins = this.side.immediateWinningColumns(opponentRef, height);
    if ((opponentWins & (opponentWins - 1)) !== 0) return -Math.trunc((CELLS - moves) / 2);
    const candidateColumns = [];
    if (opponentWins !== 0) candidateColumns.push(31 - Math.clz32(opponentWins));
    else for (const column of ORDER) if (heightAt(height, column) < 6) candidateColumns.push(column);
    const survivors = [];
    for (const column of candidateColumns) {
      const prepared = this.arena.prepare(id, column); if (prepared === null) continue;
      if (prepared.terminal) return Math.trunc((CELLS + 1 - moves) / 2);
      if (this.side.immediateWinningColumns(prepared.currentRef, prepared.height) !== 0) continue;
      survivors.push(prepared);
    }
    if (survivors.length === 0) return -Math.trunc((CELLS - moves) / 2);
    if (moves >= CELLS - 2) return 0;
    let min = -Math.trunc((CELLS - 2 - moves) / 2); if (alpha < min) { alpha = min; if (alpha >= beta) return alpha; }
    let max = Math.trunc((CELLS - 1 - moves) / 2); if (beta > max) { beta = max; if (alpha >= beta) return beta; }
    if (survivors.length === 1) { this.forcedTransitions += 1; return -this.negamax(this.arena.internPrepared(survivors[0]), -beta, -alpha); }
    const probe = this.probe(id, moves, alpha, beta); alpha = probe.alpha; beta = probe.beta; if (probe.cutoff) return alpha;
    survivors.sort((a, b) => b.orderScore - a.orderScore || ORDER.indexOf(a.column) - ORDER.indexOf(b.column));
    for (const p of survivors) { const score = -this.negamax(this.arena.internPrepared(p), -beta, -alpha); if (score >= beta) { this.publish(probe.slot, id, score + TT_LOWER_OFFSET); return score; } if (score > alpha) alpha = score; }
    this.publish(probe.slot, id, alpha + TT_UPPER_OFFSET); return alpha;
  }
  metrics() {
    return { nodes: this.nodes, ttHits: this.ttHits, writeAttempts: this.writeAttempts, writeSuccess: this.writeSuccess, forcedTransitions: this.forcedTransitions, drawStops: this.drawStops, compileMs: this.compileMs, searchMs: this.searchMs, totalMs: this.compileMs + this.searchMs, stateArena: this.arena.metrics(), sideArena: this.side.metrics(), ttSlots: this.size, ttTypedBytes: this.key.byteLength + this.val.byteLength };
  }
}
