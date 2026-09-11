import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

// Research-only exact 7x6 residual-win-space prototype.
// Candidate: collapse legal moves related by an exact column transposition that
// preserves heights and both residual requirement antichains.
// Important TT repair discovered during this experiment: an exact interval
// (lo === up) must return immediately rather than narrowing alpha and beta to
// the same value and continuing the search.

const W = 7;
const H = 6;
const CELLS = 42;
const ORDER = [3, 4, 2, 5, 1, 6, 0];

const lines = [];
for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const x = c + 3 * dx;
      const y = r + 3 * dy;
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      let mask = 0n;
      for (let j = 0; j < 4; j++) {
        mask |= 1n << BigInt((r + j * dy) * W + c + j * dx);
      }
      lines.push(mask);
    }
  }
}
assert.equal(lines.length, 69);

function popcount(value) {
  let count = 0;
  while (value) {
    value &= value - 1n;
    count++;
  }
  return count;
}

const universe = new Set();
for (const line of lines) {
  const cells = [];
  for (let i = 0; i < CELLS; i++) {
    if ((line >> BigInt(i)) & 1n) cells.push(i);
  }
  for (let subset = 1; subset < 16; subset++) {
    let mask = 0n;
    for (let j = 0; j < 4; j++) {
      if ((subset >> j) & 1) mask |= 1n << BigInt(cells[j]);
    }
    universe.add(mask.toString());
  }
}

const masks = [...universe]
  .map(BigInt)
  .sort((a, b) => popcount(a) - popcount(b) || (a < b ? -1 : a > b ? 1 : 0));
assert.equal(masks.length, 625);

const id = new Map(masks.map((mask, index) => [mask.toString(), index]));
const reqSize = Uint8Array.from(masks, popcount);
const target = Array.from({ length: CELLS }, () => new Int16Array(625).fill(-1));
const contains = Array.from({ length: CELLS }, () => new Uint8Array(625));

for (let rid = 0; rid < 625; rid++) {
  for (let cell = 0; cell < CELLS; cell++) {
    if (!((masks[rid] >> BigInt(cell)) & 1n)) continue;
    contains[cell][rid] = 1;
    const next = masks[rid] & ~(1n << BigInt(cell));
    target[cell][rid] = next === 0n ? -2 : id.get(next.toString());
  }
}

function canon(ids) {
  ids.sort((a, b) => a - b);
  const out = [];
  let previous = -1;
  outer: for (const rid of ids) {
    if (rid === previous) continue;
    previous = rid;
    const mask = masks[rid];
    for (const prior of out) {
      if ((masks[prior] & ~mask) === 0n) continue outer;
    }
    out.push(rid);
  }
  return out;
}

function ownMove(requirements, cell) {
  const out = [];
  for (const rid of requirements) {
    const next = target[cell][rid];
    if (next === -2) return [null, true];
    out.push(next >= 0 ? next : rid);
  }
  return [canon(out), false];
}

function opponentMove(requirements, cell) {
  const out = [];
  for (const rid of requirements) {
    if (!contains[cell][rid]) out.push(rid);
  }
  return out;
}

function won(bits, bit) {
  for (const line of lines) {
    if ((line & bit) !== 0n && (line & bits) === line) return true;
  }
  return false;
}

function parse(sequence) {
  let p0 = 0n;
  let p1 = 0n;
  const heights = new Uint8Array(W);
  for (let move = 0; move < sequence.length; move++) {
    const col = sequence.charCodeAt(move) - 49;
    const row = heights[col];
    assert(col >= 0 && col < W && row < H);
    const bit = 1n << BigInt(row * W + col);
    if (move & 1) {
      p1 |= bit;
      assert(!won(p1, bit));
    } else {
      p0 |= bit;
      assert(!won(p0, bit));
    }
    heights[col]++;
  }
  return { p0, p1, heights, moves: sequence.length, sequence };
}

function compile(root, player) {
  const occupied = root.p0 | root.p1;
  const opponent = player ? root.p0 : root.p1;
  const out = [];
  for (const line of lines) {
    if ((line & opponent) !== 0n) continue;
    const remaining = line & ~occupied;
    if (remaining) out.push(id.get(remaining.toString()));
  }
  return canon(out);
}

function packHeights(heights) {
  let value = 0;
  for (let col = 0; col < W; col++) value |= heights[col] << (3 * col);
  return value >>> 0;
}

function key(heights, p0Reqs, p1Reqs) {
  return `${packHeights(heights)}|${p0Reqs.join('.')}/${p1Reqs.join('.')}`;
}

const columnMasks = [];
for (let col = 0; col < W; col++) {
  let mask = 0n;
  for (let row = 0; row < H; row++) mask |= 1n << BigInt(row * W + col);
  columnMasks.push(mask);
}

function swapMask(mask, a, b) {
  if (a === b) return mask;
  const ma = columnMasks[a];
  const mb = columnMasks[b];
  const aa = mask & ma;
  const bb = mask & mb;
  const rest = mask & ~(ma | mb);
  const delta = b - a;
  return delta > 0
    ? rest | (aa << BigInt(delta)) | (bb >> BigInt(delta))
    : rest | (aa >> BigInt(-delta)) | (bb << BigInt(-delta));
}

// A swapped requirement need not remain a geometrically valid Connect4
// requirement. Such mappings are recorded as -1 and immediately falsify the
// candidate transposition.
const swapMap = Array.from({ length: W }, () => Array(W).fill(null));
for (let a = 0; a < W; a++) {
  for (let b = a + 1; b < W; b++) {
    const map = new Int16Array(625).fill(-1);
    for (let rid = 0; rid < 625; rid++) {
      const swapped = swapMask(masks[rid], a, b);
      const mapped = id.get(swapped.toString());
      if (mapped !== undefined) map[rid] = mapped;
    }
    swapMap[a][b] = map;
    swapMap[b][a] = map;
  }
}

function hasSorted(values, targetValue) {
  let lo = 0;
  let hi = values.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const value = values[mid];
    if (value === targetValue) return true;
    if (value < targetValue) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}

function invariantUnder(requirements, map) {
  for (const rid of requirements) {
    const mapped = map[rid];
    if (mapped < 0 || !hasSorted(requirements, mapped)) return false;
  }
  return true;
}

function isResidualTransposition(heights, p0Reqs, p1Reqs, a, b, stats) {
  stats.symmetryChecks++;
  if (heights[a] !== heights[b]) return false;
  const map = swapMap[a][b];
  if (!invariantUnder(p0Reqs, map) || !invariantUnder(p1Reqs, map)) return false;
  stats.symmetryHits++;
  return true;
}

function solve(root, { orbits = false, cardinality = false } = {}) {
  const heights = root.heights.slice();
  const tt = new Map();
  const p0Root = compile(root, 0);
  const p1Root = compile(root, 1);
  let nodes = 0;
  let ttCuts = 0;
  let boundCuts = 0;
  let boundTight = 0;
  let boundScans = 0;
  const stats = {
    symmetryChecks: 0,
    symmetryHits: 0,
    movesSkipped: 0,
    orbitNodes: 0,
    maxOrbitSaved: 0,
  };

  function optimisticMagnitude(requirements, player, moves) {
    if (requirements.length === 0) return 0;
    const movesNext = (moves & 1) === player;
    let minNeeded = 99;
    for (const rid of requirements) {
      boundScans++;
      if (reqSize[rid] < minNeeded) minNeeded = reqSize[rid];
    }
    const delta = movesNext ? 2 * minNeeded - 1 : 2 * minNeeded;
    const before = moves + delta - 1;
    if (before >= CELLS) return 0;
    return Math.trunc((CELLS + 1 - before) / 2);
  }

  function rec(p0Reqs, p1Reqs, moves, alpha, beta) {
    nodes++;
    const alphaOriginal = alpha;
    const betaOriginal = beta;
    const stateKey = key(heights, p0Reqs, p1Reqs);
    let entry = tt.get(stateKey);
    if (entry) {
      // Critical correctness repair. The older research harness narrowed alpha
      // and beta to an exact cached value and then continued searching.
      if (entry.lo === entry.up) {
        ttCuts++;
        return entry.lo;
      }
      if (entry.lo >= beta) {
        ttCuts++;
        return entry.lo;
      }
      if (entry.up <= alpha) {
        ttCuts++;
        return entry.up;
      }
      if (alpha < entry.lo) alpha = entry.lo;
      if (beta > entry.up) beta = entry.up;
    }

    if ((p0Reqs.length === 0 && p1Reqs.length === 0) || moves === CELLS) {
      tt.set(stateKey, { lo: 0, up: 0 });
      return 0;
    }

    if (cardinality) {
      const lo = -optimisticMagnitude(p1Reqs, 1, moves);
      const hi = optimisticMagnitude(p0Reqs, 0, moves);
      if (alpha < lo) {
        alpha = lo;
        boundTight++;
      }
      if (beta > hi) {
        beta = hi;
        boundTight++;
      }
      if (lo >= betaOriginal) {
        boundCuts++;
        entry = entry ?? { lo: -99, up: 99 };
        entry.lo = Math.max(entry.lo, lo);
        tt.set(stateKey, entry);
        return lo;
      }
      if (hi <= alphaOriginal) {
        boundCuts++;
        entry = entry ?? { lo: -99, up: 99 };
        entry.up = Math.min(entry.up, hi);
        tt.set(stateKey, entry);
        return hi;
      }
      if (alpha >= beta) {
        boundCuts++;
        return alpha;
      }
    }

    const player = moves & 1;
    let best = player ? 99 : -99;
    const representatives = [];
    let savedHere = 0;

    for (const col of ORDER) {
      const row = heights[col];
      if (row === H) continue;

      if (orbits) {
        let equivalent = false;
        for (const representative of representatives) {
          if (isResidualTransposition(
            heights,
            p0Reqs,
            p1Reqs,
            col,
            representative,
            stats,
          )) {
            equivalent = true;
            break;
          }
        }
        if (equivalent) {
          stats.movesSkipped++;
          savedHere++;
          continue;
        }
        representatives.push(col);
      }

      const cell = row * W + col;
      const mine = player ? p1Reqs : p0Reqs;
      const other = player ? p0Reqs : p1Reqs;
      const [nextMine, win] = ownMove(mine, cell);
      heights[col]++;
      let value;
      if (win) {
        value = player
          ? -Math.trunc((CELLS + 1 - moves) / 2)
          : Math.trunc((CELLS + 1 - moves) / 2);
      } else {
        const nextOther = opponentMove(other, cell);
        value = player
          ? rec(nextOther, nextMine, moves + 1, alpha, beta)
          : rec(nextMine, nextOther, moves + 1, alpha, beta);
      }
      heights[col]--;

      if (!player) {
        if (value > best) best = value;
        if (best > alpha) alpha = best;
      } else {
        if (value < best) best = value;
        if (best < beta) beta = best;
      }
      if (alpha >= beta) break;
    }

    if (savedHere) {
      stats.orbitNodes++;
      if (savedHere > stats.maxOrbitSaved) stats.maxOrbitSaved = savedHere;
    }

    entry = tt.get(stateKey) ?? { lo: -99, up: 99 };
    if (best <= alphaOriginal) entry.up = Math.min(entry.up, best);
    else if (best >= betaOriginal) entry.lo = Math.max(entry.lo, best);
    else entry = { lo: best, up: best };
    assert(entry.lo <= entry.up, `contradictory TT interval at ${stateKey}`);
    tt.set(stateKey, entry);
    return best;
  }

  const started = performance.now();
  const score = rec(p0Root, p1Root, root.moves, -99, 99);
  return {
    score: Object.is(score, -0) ? 0 : score,
    nodes,
    ttSize: tt.size,
    ttCuts,
    boundCuts,
    boundTight,
    boundScans,
    ms: performance.now() - started,
    ...stats,
  };
}

const frozen = [
  ['764353221241721325116531', -2],
  ['5563576621726752473477144213', 7],
  ['3253472274311154254412135', -9],
  ['24763565123272565531172315', 2],
  ['544111352647536626717444135', -8],
  ['3412761563244125763551573', -9],
  ['1174534625627233274533652316', -6],
  ['463141571213634656162165252', 7],
];

const totals = { base: 0, orbit: 0, card: 0, both: 0 };
for (const [sequence, oracle] of frozen) {
  const root = parse(sequence);
  const base = solve(root);
  const orbit = solve(root, { orbits: true });
  const card = solve(root, { cardinality: true });
  const both = solve(root, { orbits: true, cardinality: true });
  for (const result of [base, orbit, card, both]) assert.equal(result.score, oracle);

  totals.base += base.nodes;
  totals.orbit += orbit.nodes;
  totals.card += card.nodes;
  totals.both += both.nodes;
  console.log(JSON.stringify({
    kind: 'case',
    sequence,
    oracle,
    base,
    orbit,
    card,
    both,
    orbitReductionPct: 100 * (1 - orbit.nodes / base.nodes),
    bothVsCardPct: 100 * (1 - both.nodes / card.nodes),
  }));
}

console.log(JSON.stringify({
  kind: 'total',
  ...totals,
  orbitReductionPct: 100 * (1 - totals.orbit / totals.base),
  cardReductionPct: 100 * (1 - totals.card / totals.base),
  bothVsBasePct: 100 * (1 - totals.both / totals.base),
  bothVsCardPct: 100 * (1 - totals.both / totals.card),
}));
