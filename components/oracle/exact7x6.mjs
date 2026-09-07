const WIDTH = 7;
const HEIGHT = 6;
const STRIDE = HEIGHT + 1;
const CELLS = WIDTH * HEIGHT;
const INVALID_MOVE = -1000;
const MIN_SCORE = -(WIDTH * HEIGHT) / 2 + 3; // -18 for 7x6
const MAX_SCORE = Math.trunc((WIDTH * HEIGHT + 1) / 2) - 3; // 18 for 7x6
const TT_UPPER_LIMIT = MAX_SCORE - MIN_SCORE + 1;
const TT_LOWER_OFFSET = MAX_SCORE - 2 * MIN_SCORE + 2;
const TT_UPPER_OFFSET = -MIN_SCORE + 1;
const ORDER = Object.freeze([3, 4, 2, 5, 1, 6, 0]);

let bottomMask = 0n;
const columnMasks = new Array(WIDTH);
const bottomMasks = new Array(WIDTH);
const topMasks = new Array(WIDTH);
for (let col = 0; col < WIDTH; col++) {
  const shift = BigInt(col * STRIDE);
  bottomMasks[col] = 1n << shift;
  topMasks[col] = 1n << BigInt(HEIGHT - 1 + col * STRIDE);
  columnMasks[col] = ((1n << BigInt(HEIGHT)) - 1n) << shift;
  bottomMask |= bottomMasks[col];
}
const boardMask = bottomMask * ((1n << BigInt(HEIGHT)) - 1n);

function popcount(value) {
  let count = 0;
  while (value !== 0n) {
    value &= value - 1n;
    count++;
  }
  return count;
}

function winningPositions(position, mask) {
  let result = (position << 1n) & (position << 2n) & (position << 3n);

  let pair = (position << 7n) & (position << 14n);
  result |= pair & (position << 21n);
  result |= pair & (position >> 7n);
  pair = (position >> 7n) & (position >> 14n);
  result |= pair & (position << 7n);
  result |= pair & (position >> 21n);

  pair = (position << 6n) & (position << 12n);
  result |= pair & (position << 18n);
  result |= pair & (position >> 6n);
  pair = (position >> 6n) & (position >> 12n);
  result |= pair & (position << 6n);
  result |= pair & (position >> 18n);

  pair = (position << 8n) & (position << 16n);
  result |= pair & (position << 24n);
  result |= pair & (position >> 8n);
  pair = (position >> 8n) & (position >> 16n);
  result |= pair & (position << 8n);
  result |= pair & (position >> 24n);

  return result & (boardMask ^ mask);
}

function possible(mask) {
  return (mask + bottomMask) & boardMask;
}

function canPlay(mask, col) {
  return (mask & topMasks[col]) === 0n;
}

function isWinningMove(current, mask, col) {
  return (winningPositions(current, mask) & possible(mask) & columnMasks[col]) !== 0n;
}

function playColumnMask(mask, col) {
  return (mask + bottomMasks[col]) & columnMasks[col];
}

function truncHalf(value) {
  return Math.trunc(value / 2);
}

export function fromSequence(sequence) {
  let current = 0n;
  let mask = 0n;
  let moves = 0;
  for (let i = 0; i < sequence.length; i++) {
    const col = sequence.charCodeAt(i) - 49;
    if (col < 0 || col >= WIDTH || !canPlay(mask, col) || isWinningMove(current, mask, col)) {
      throw new RangeError(`invalid oracle sequence at ply ${i + 1}`);
    }
    const move = playColumnMask(mask, col);
    current ^= mask;
    mask |= move;
    moves++;
  }
  return { current, mask, moves };
}

export class ExactConnect4Oracle {
  constructor() {
    // Pascal Pons-style one-bound transposition encoding. Keys are <=49 bits,
    // so converting the bitboard key to Number is exact and avoids BigInt Map keys.
    this.table = new Map();
    this.nodes = 0;
    // Reused move-sort workspace: one 7-way slice per possible ply.
    this.moveBits = new Array((CELLS + 1) * WIDTH).fill(0n);
    this.moveScores = new Int8Array((CELLS + 1) * WIDTH);
  }

  reset() {
    this.table.clear();
    this.nodes = 0;
  }

  solveSequence(sequence) {
    const state = fromSequence(sequence);
    return this.#solveBits(state.current, state.mask, state.moves);
  }

  solve(state) {
    return this.#solveBits(state.current, state.mask, state.moves);
  }

  analyzeSequence(sequence) {
    const state = fromSequence(sequence);
    return this.#analyzeBits(state.current, state.mask, state.moves);
  }

  analyze(state) {
    return this.#analyzeBits(state.current, state.mask, state.moves);
  }

  #solveBits(current, mask, moves) {
    if ((winningPositions(current, mask) & possible(mask)) !== 0n) {
      return truncHalf(CELLS + 1 - moves);
    }

    let min = -truncHalf(CELLS - moves);
    let max = truncHalf(CELLS + 1 - moves);
    while (min < max) {
      let med = min + truncHalf(max - min);
      if (med <= 0 && truncHalf(min) < med) med = truncHalf(min);
      else if (med >= 0 && truncHalf(max) > med) med = truncHalf(max);
      const score = this.#negamax(current, mask, moves, med, med + 1);
      if (score <= med) max = score;
      else min = score;
    }
    return min === 0 ? 0 : min;
  }

  #analyzeBits(current, mask, moves) {
    const scores = new Int16Array(WIDTH);
    scores.fill(INVALID_MOVE);
    for (let col = 0; col < WIDTH; col++) {
      if (!canPlay(mask, col)) continue;
      if (isWinningMove(current, mask, col)) {
        scores[col] = truncHalf(CELLS + 1 - moves);
      } else {
        const move = playColumnMask(mask, col);
        scores[col] = -this.#solveBits(current ^ mask, mask | move, moves + 1);
      }
    }
    return scores;
  }

  #negamax(current, mask, moves, alpha, beta) {
    this.nodes++;

    let candidates = possible(mask);
    const opponentWins = winningPositions(current ^ mask, mask);
    const forced = candidates & opponentWins;
    if (forced !== 0n) {
      if ((forced & (forced - 1n)) !== 0n) return -truncHalf(CELLS - moves);
      candidates = forced;
    }
    candidates &= ~(opponentWins >> 1n);
    if (candidates === 0n) return -truncHalf(CELLS - moves);
    if (moves >= CELLS - 2) return 0;

    let min = -truncHalf(CELLS - 2 - moves);
    if (alpha < min) {
      alpha = min;
      if (alpha >= beta) return alpha;
    }

    let max = truncHalf(CELLS - 1 - moves);
    if (beta > max) {
      beta = max;
      if (alpha >= beta) return beta;
    }

    const key = Number(current + mask);
    const cached = this.table.get(key) ?? 0;
    if (cached !== 0) {
      if (cached > TT_UPPER_LIMIT) {
        min = cached - TT_LOWER_OFFSET;
        if (alpha < min) {
          alpha = min;
          if (alpha >= beta) return alpha;
        }
      } else {
        max = cached - TT_UPPER_OFFSET;
        if (beta > max) {
          beta = max;
          if (alpha >= beta) return beta;
        }
      }
    }

    const base = moves * WIDTH;
    let count = 0;
    for (let orderIndex = 0; orderIndex < WIDTH; orderIndex++) {
      const col = ORDER[orderIndex];
      const move = candidates & columnMasks[col];
      if (move === 0n) continue;
      const score = popcount(winningPositions(current | move, mask));
      let at = count;
      while (at > 0 && this.moveScores[base + at - 1] < score) {
        this.moveScores[base + at] = this.moveScores[base + at - 1];
        this.moveBits[base + at] = this.moveBits[base + at - 1];
        at--;
      }
      this.moveScores[base + at] = score;
      this.moveBits[base + at] = move;
      count++;
    }

    for (let i = 0; i < count; i++) {
      const move = this.moveBits[base + i];
      const score = -this.#negamax(current ^ mask, mask | move, moves + 1, -beta, -alpha);
      if (score >= beta) {
        this.table.set(key, score + TT_LOWER_OFFSET);
        return score;
      }
      if (score > alpha) alpha = score;
    }

    this.table.set(key, alpha + TT_UPPER_OFFSET);
    return alpha;
  }
}

export const ORACLE_CONSTANTS = Object.freeze({ WIDTH, HEIGHT, INVALID_MOVE, MIN_SCORE, MAX_SCORE });
