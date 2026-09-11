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
function stateKey(height, current, opponent) {
  return `${height.toString(16)}|${goalsKey(current)}/${goalsKey(opponent)}`;
}
function bitForCell(cell) {
  return cell < 32 ? [2 ** cell >>> 0, 0] : [0, 2 ** (cell - 32) >>> 0];
}
function intersects(goal, bit) { return ((goal[0] & bit[0]) | (goal[1] & bit[1])) !== 0; }
function clearBit(goal, bit) { return [(goal[0] & ~bit[0]) >>> 0, (goal[1] & ~bit[1]) >>> 0]; }
function isEmpty(goal) { return (goal[0] | goal[1]) === 0; }
function isSingleton(goal) { return popPair(goal[0], goal[1]) === 1; }

class ResidualArena {
  constructor() { this.reset(); }
  reset() {
    this.ids = new Map();
    this.states = [];
    this.transitionComputations = 0;
    this.normalizeCalls = 0;
    this.internHits = 0;
    this.keyBytesApprox = 0;
  }
  intern(height, moves, current, opponent) {
    const key = stateKey(height, current, opponent);
    const existing = this.ids.get(key);
    if (existing !== undefined) { this.internHits += 1; return existing; }
    const id = this.states.length;
    this.ids.set(key, id);
    this.keyBytesApprox += key.length * 2;
    this.states.push({
      height: height >>> 0,
      moves,
      current,
      opponent,
      targets: new Int32Array(WIDTH), // 0 unknown, -1 illegal, -2 terminal, childId+1 otherwise
      orderScore: new Int8Array(WIDTH),
    });
    return id;
  }
  compileRoot(position) {
    this.reset();
    const compiled = compile(position, G, true, false);
    const current = canonical(compiled.goals[0]);
    const opponent = canonical(compiled.goals[1]);
    return this.intern(heightFromArray(position.heights), position.moves, current, opponent);
  }
  immediateWinningColumns(goals, height) {
    let columns = 0;
    for (const goal of goals) {
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
  winningCellCount(goals) {
    let lo = 0, hi = 0;
    for (const goal of goals) {
      if (!isSingleton(goal)) continue;
      lo |= goal[0]; hi |= goal[1];
    }
    return popPair(lo >>> 0, hi >>> 0);
  }
  transition(id, column) {
    const state = this.states[id];
    const cached = state.targets[column];
    if (cached !== 0) return cached;
    const row = heightAt(state.height, column);
    if (row >= 6) { state.targets[column] = -1; return -1; }
    this.transitionComputations += 1;
    const cell = column * 7 + row;
    const bit = bitForCell(cell);
    const moved = [];
    for (const goal of state.current) {
      if (intersects(goal, bit)) {
        const reduced = clearBit(goal, bit);
        if (isEmpty(reduced)) { state.targets[column] = -2; return -2; }
        moved.push(reduced);
      } else moved.push(goal);
    }
    this.normalizeCalls += 1;
    const movedCanonical = canonical(moved);
    const blockedOpponent = [];
    for (const goal of state.opponent) if (!intersects(goal, bit)) blockedOpponent.push(goal);
    const nextHeight = (state.height + (1 << (3 * column))) >>> 0;
    const childId = this.intern(nextHeight, state.moves + 1, blockedOpponent, movedCanonical);
    state.targets[column] = childId + 1;
    state.orderScore[column] = this.winningCellCount(movedCanonical);
    return childId + 1;
  }
  estimatedSemanticBytes() {
    let goalPairs = 0;
    for (const state of this.states) goalPairs += state.current.length + state.opponent.length;
    // Lower-bound typed-data accounting, plus approximate UTF-16 canonical Map keys reported separately.
    return {
      states: this.states.length,
      goalPairs,
      pairBytes: goalPairs * 8,
      transitionBytes: this.states.length * WIDTH * 4,
      orderBytes: this.states.length * WIDTH,
      fixedStateBytes: this.states.length * 8,
      canonicalKeyBytesApprox: this.keyBytesApprox,
      typedDataBytes: goalPairs * 8 + this.states.length * (WIDTH * 5 + 8),
    };
  }
}

export class ResidualSolver {
  constructor(pow = 19) {
    this.size = 1 << pow;
    this.mask = this.size - 1;
    this.key = new Uint32Array(this.size);
    this.val = new Uint8Array(this.size);
    this.bankOffset = new Uint32Array(CELLS + 1);
    this.bankMask = new Uint32Array(CELLS + 1);
    this.configureExact16Banks(pow);
    this.arena = new ResidualArena();
    this.resetMetrics();
  }
  configureExact16Banks(pow) {
    this.bankOffset.fill(0);
    this.bankMask.fill(this.mask);
    if (pow !== 19) return;
    const bankPow = 15, bankSize = 1 << bankPow, bankMask = bankSize - 1;
    for (let moves = 0; moves <= CELLS; moves += 1) {
      let bank;
      if (moves <= 20) bank = 0;
      else if (moves <= 34) bank = moves - 20;
      else bank = 15;
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
    if (this.key[slot] !== (id + 1 >>> 0)) return { slot, alpha, beta, cutoff: false };
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
    const rootState = this.arena.states[root];
    if (this.arena.immediateWinningColumns(rootState.current, rootState.height) !== 0) {
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
    const state = this.arena.states[id];
    const moves = state.moves;

    if (state.current.length === 0 && state.opponent.length === 0) {
      this.drawStops += 1;
      return 0;
    }

    const opponentWins = this.arena.immediateWinningColumns(state.opponent, state.height);
    if ((opponentWins & (opponentWins - 1)) !== 0) return -Math.trunc((CELLS - moves) / 2);

    const candidateColumns = [];
    if (opponentWins !== 0) {
      candidateColumns.push(31 - Math.clz32(opponentWins));
    } else {
      for (const column of ORDER) if (heightAt(state.height, column) < 6) candidateColumns.push(column);
    }

    const survivors = [];
    for (const column of candidateColumns) {
      const target = this.arena.transition(id, column);
      if (target === -1) continue;
      if (target === -2) return Math.trunc((CELLS + 1 - moves) / 2);
      const childId = target - 1;
      const child = this.arena.states[childId];
      if (this.arena.immediateWinningColumns(child.current, child.height) !== 0) continue;
      survivors.push([column, childId, state.orderScore[column]]);
    }

    if (survivors.length === 0) return -Math.trunc((CELLS - moves) / 2);
    if (moves >= CELLS - 2) return 0;

    let min = -Math.trunc((CELLS - 2 - moves) / 2);
    if (alpha < min) { alpha = min; if (alpha >= beta) return alpha; }
    let max = Math.trunc((CELLS - 1 - moves) / 2);
    if (beta > max) { beta = max; if (alpha >= beta) return beta; }

    if (survivors.length === 1) {
      this.forcedTransitions += 1;
      return -this.negamax(survivors[0][1], -beta, -alpha);
    }

    const probe = this.probe(id, moves, alpha, beta);
    alpha = probe.alpha; beta = probe.beta;
    if (probe.cutoff) return alpha;

    survivors.sort((a, b) => b[2] - a[2] || ORDER.indexOf(a[0]) - ORDER.indexOf(b[0]));
    for (const [, childId] of survivors) {
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
      arena: this.arena.estimatedSemanticBytes(),
      transitionComputations: this.arena.transitionComputations,
      normalizeCalls: this.arena.normalizeCalls,
      internHits: this.arena.internHits,
      ttSlots: this.size,
      ttTypedBytes: this.key.byteLength + this.val.byteLength,
    };
  }
}
