export const TT_EXACT = 0;
export const TT_LOWER = 1;
export const TT_UPPER = 2;

export class PersistentTranspositionTable {
  constructor(power = 19) {
    if (!Number.isInteger(power) || power < 10 || power > 24) throw new RangeError("TT power must be 10..24");
    const capacity = 1 << power;
    this.capacity = capacity;
    this.mask = capacity - 1;
    this.used = new Uint8Array(capacity);
    this.p0Low = new Uint32Array(capacity);
    this.p0High = new Uint32Array(capacity);
    this.p1Low = new Uint32Array(capacity);
    this.p1High = new Uint32Array(capacity);
    this.depth = new Uint8Array(capacity);
    this.flag = new Uint8Array(capacity);
    this.bestMove = new Int8Array(capacity);
    this.rootPlayer = new Uint8Array(capacity);
    this.rootPly = new Uint8Array(capacity);
    this.score = new Float64Array(capacity);
    this.generation = new Uint16Array(capacity);
    this.currentGeneration = 1;
  }

  beginSearch() {
    this.currentGeneration = (this.currentGeneration + 1) & 0xffff;
    if (this.currentGeneration === 0) {
      this.generation.fill(0);
      this.currentGeneration = 1;
    }
  }

  #index(p0Low, p0High, p1Low, p1High) {
    let value = (p0Low ^ Math.imul(p0High, 0x9e3779b1) ^ Math.imul(p1Low, 0x85ebca6b) ^ Math.imul(p1High, 0xc2b2ae35)) >>> 0;
    value ^= value >>> 16;
    value = Math.imul(value, 0x7feb352d) >>> 0;
    value ^= value >>> 15;
    return value & this.mask;
  }

  probe(p0Low, p0High, p1Low, p1High) {
    const index = this.#index(p0Low, p0High, p1Low, p1High);
    if (
      this.used[index] !== 0
      && this.p0Low[index] === (p0Low >>> 0)
      && this.p0High[index] === (p0High >>> 0)
      && this.p1Low[index] === (p1Low >>> 0)
      && this.p1High[index] === (p1High >>> 0)
    ) return index;
    return -1;
  }

  store(p0Low, p0High, p1Low, p1High, remainingDepth, score, bestMove, flag, rootPlayer, rootPly) {
    const index = this.#index(p0Low, p0High, p1Low, p1High);
    const sameKey = this.used[index] !== 0
      && this.p0Low[index] === (p0Low >>> 0)
      && this.p0High[index] === (p0High >>> 0)
      && this.p1Low[index] === (p1Low >>> 0)
      && this.p1High[index] === (p1High >>> 0);

    if (
      !sameKey
      || this.generation[index] !== this.currentGeneration
      || remainingDepth >= this.depth[index]
    ) {
      this.used[index] = 1;
      this.p0Low[index] = p0Low >>> 0;
      this.p0High[index] = p0High >>> 0;
      this.p1Low[index] = p1Low >>> 0;
      this.p1High[index] = p1High >>> 0;
      this.depth[index] = remainingDepth;
      this.score[index] = score;
      this.bestMove[index] = bestMove;
      this.flag[index] = flag;
      this.rootPlayer[index] = rootPlayer;
      this.rootPly[index] = rootPly;
      this.generation[index] = this.currentGeneration;
    }
  }
}
