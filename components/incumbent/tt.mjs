import { MATE_THRESHOLD, TT_EMPTY, TT_EXACT } from './constants.mjs';

function nextPowerOfTwo(value) {
  if (!Number.isSafeInteger(value) || value < 2 || value > 0x40000000) throw new RangeError('TT capacity must be an integer in 2..2^30');
  let v = 1;
  while (v < value) v *= 2;
  return v;
}

export class PersistentTranspositionTable {
  constructor(positionCapacity = 262144) {
    const totalSlots = nextPowerOfTwo(Math.max(2, positionCapacity));
    this.bucketCount = totalSlots >>> 1;
    this.bucketMask = this.bucketCount - 1;
    this.slotCount = this.bucketCount << 1;
    const n = this.slotCount;
    this.occupied = new Uint8Array(n);
    this.keyLo = new Uint32Array(n);
    this.keyHi = new Uint32Array(n);
    this.turn = new Uint8Array(n);
    this.lastGeneration = new Uint32Array(n);
    this.depth0 = new Uint32Array(n);
    this.depth1 = new Uint32Array(n);
    this.flag0 = new Uint8Array(n);
    this.flag1 = new Uint8Array(n);
    this.score0 = new Float64Array(n);
    this.score1 = new Float64Array(n);
    this.bestMove0 = new Int32Array(n);
    this.bestMove1 = new Int32Array(n);
    this.gen0 = new Uint32Array(n);
    this.gen1 = new Uint32Array(n);
    this.bestMove0.fill(-1);
    this.bestMove1.fill(-1);
    this.generation = 0;
    this.lastAllocationReplaced = false;
  }

  clear() {
    this.occupied.fill(0);
    this.flag0.fill(0);
    this.flag1.fill(0);
    this.depth0.fill(0);
    this.depth1.fill(0);
    this.bestMove0.fill(-1);
    this.bestMove1.fill(-1);
    this.lastGeneration.fill(0);
    this.gen0.fill(0);
    this.gen1.fill(0);
    this.generation = 0;
  }

  nextGeneration() {
    this.generation = (this.generation + 1) >>> 0;
    if (this.generation === 0) this.generation = 1;
    return this.generation;
  }

  bucketBase(hashLo, hashHi, turn) {
    const mixed = (hashLo ^ Math.imul(hashHi, 0x9e3779b1) ^ Math.imul(turn + 1, 0x85ebca6b)) >>> 0;
    return (mixed & this.bucketMask) << 1;
  }

  find(hashLo, hashHi, turn) {
    const base = this.bucketBase(hashLo, hashHi, turn);
    if (this.occupied[base] && this.keyLo[base] === hashLo && this.keyHi[base] === hashHi && this.turn[base] === turn) return base;
    const second = base + 1;
    if (this.occupied[second] && this.keyLo[second] === hashLo && this.keyHi[second] === hashHi && this.turn[second] === turn) return second;
    return -1;
  }

  allocate(hashLo, hashHi, turn) {
    this.lastAllocationReplaced = false;
    const base = this.bucketBase(hashLo, hashHi, turn);
    if (!this.occupied[base]) return this.initializeSlot(base, hashLo, hashHi, turn);
    const second = base + 1;
    if (!this.occupied[second]) return this.initializeSlot(second, hashLo, hashHi, turn);
    const depthA = Math.max(this.depth0[base], this.depth1[base]);
    const depthB = Math.max(this.depth0[second], this.depth1[second]);
    let victim;
    if (this.lastGeneration[base] !== this.lastGeneration[second]) {
      victim = this.lastGeneration[base] < this.lastGeneration[second] ? base : second;
    } else {
      victim = depthA <= depthB ? base : second;
    }
    this.lastAllocationReplaced = true;
    return this.initializeSlot(victim, hashLo, hashHi, turn);
  }

  initializeSlot(slot, hashLo, hashHi, turn) {
    this.occupied[slot] = 1;
    this.keyLo[slot] = hashLo;
    this.keyHi[slot] = hashHi;
    this.turn[slot] = turn;
    this.depth0[slot] = 0;
    this.depth1[slot] = 0;
    this.flag0[slot] = TT_EMPTY;
    this.flag1[slot] = TT_EMPTY;
    this.score0[slot] = 0;
    this.score1[slot] = 0;
    this.bestMove0[slot] = -1;
    this.bestMove1[slot] = -1;
    this.gen0[slot] = 0;
    this.gen1[slot] = 0;
    this.lastGeneration[slot] = this.generation;
    return slot;
  }

  store(slot, perspective, depth, flag, score, bestMove) {
    if (perspective === 0) {
      const oldFlag = this.flag0[slot];
      const oldDepth = this.depth0[slot];
      if (oldFlag === TT_EMPTY || depth > oldDepth || (depth === oldDepth && (flag === TT_EXACT || oldFlag !== TT_EXACT))) {
        this.depth0[slot] = depth;
        this.flag0[slot] = flag;
        this.score0[slot] = score;
        this.bestMove0[slot] = bestMove;
        this.gen0[slot] = this.generation;
      } else if (bestMove >= 0 && this.bestMove0[slot] < 0) {
        this.bestMove0[slot] = bestMove;
      }
    } else {
      const oldFlag = this.flag1[slot];
      const oldDepth = this.depth1[slot];
      if (oldFlag === TT_EMPTY || depth > oldDepth || (depth === oldDepth && (flag === TT_EXACT || oldFlag !== TT_EXACT))) {
        this.depth1[slot] = depth;
        this.flag1[slot] = flag;
        this.score1[slot] = score;
        this.bestMove1[slot] = bestMove;
        this.gen1[slot] = this.generation;
      } else if (bestMove >= 0 && this.bestMove1[slot] < 0) {
        this.bestMove1[slot] = bestMove;
      }
    }
    this.lastGeneration[slot] = this.generation;
  }
}

export function toTTScore(score, ply) {
  if (score > MATE_THRESHOLD) return score + ply;
  if (score < -MATE_THRESHOLD) return score - ply;
  return score;
}

export function fromTTScore(score, ply) {
  if (score > MATE_THRESHOLD) return score - ply;
  if (score < -MATE_THRESHOLD) return score + ply;
  return score;
}
