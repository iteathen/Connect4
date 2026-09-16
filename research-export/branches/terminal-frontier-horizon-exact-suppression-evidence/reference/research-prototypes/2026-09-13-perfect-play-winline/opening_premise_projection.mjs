import assert from 'node:assert/strict';

const W = 7;
const H = 6;
const K = 4;
const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];

const lines = [];
for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    for (const [dx, dy] of DIRS) {
      const cells = [];
      for (let i = 0; i < K; i++) {
        const x = c + i * dx;
        const y = r + i * dy;
        if (x < 0 || x >= W || y < 0 || y >= H) {
          cells.length = 0;
          break;
        }
        cells.push(y * W + x);
      }
      if (cells.length === K) {
        let mask = 0n;
        for (const x of cells) mask |= 1n << BigInt(x);
        lines.push({ cells, mask, dir: [dx, dy] });
      }
    }
  }
}
assert.equal(lines.length, 69);

// Absolute P0 W/D/L values, using 1-based columns. This is an explicitly
// admitted exact opening-value premise for this research control, not a
// terminal-line classification and not an internally derived theorem.
const firstMoveValues = [-1, -1, 0, 1, 0, -1, -1];
const perfectFirstMoves = [];
for (let c = 1; c <= 7; c++) {
  if (firstMoveValues[c - 1] === 1) perfectFirstMoves.push(c);
}
assert.deepEqual(perfectFirstMoves, [4]);

// Exact absolute P0 W/D/L values after:
//   1. P0 column 4
//   1... P1 reply j
//   2. P0 move k
// Values for reply rows 5..7 are reflection-derived from rows 3..1.
const X = 1;
const O = -1;
const E = 0;
const rows = [
  [E, O, X, X, X, X, X],
  [O, X, O, E, E, X, O],
  [O, O, E, E, O, X, X],
  [O, O, O, X, O, O, O],
];
rows.push([...rows[2]].reverse(), [...rows[1]].reverse(), [...rows[0]].reverse());
const thirdMoveValues = rows;
for (let j = 0; j < 7; j++) {
  for (let k = 0; k < 7; k++) {
    assert.equal(thirdMoveValues[j][k], thirdMoveValues[6 - j][6 - k]);
  }
}

const winningThirdMoves = new Map();
let winningEdges = 0;
let drawEdges = 0;
let lossEdges = 0;
for (let j = 1; j <= 7; j++) {
  const ks = [];
  for (let k = 1; k <= 7; k++) {
    const v = thirdMoveValues[j - 1][k - 1];
    if (v === 1) {
      ks.push(k);
      winningEdges++;
    } else if (v === 0) {
      drawEdges++;
    } else {
      lossEdges++;
    }
  }
  winningThirdMoves.set(j, ks);
}
assert.equal(winningEdges, 19);
assert.equal(drawEdges, 10);
assert.equal(lossEdges, 20);

const perfectPrefixes = [];
for (const [reply, thirds] of winningThirdMoves) {
  for (const third of thirds) perfectPrefixes.push([4, reply, third]);
}
assert.equal(perfectPrefixes.length, 19);

function makeState(moves) {
  const h = Array(W).fill(0);
  let p0 = 0n;
  let p1 = 0n;
  for (let i = 0; i < moves.length; i++) {
    const c = moves[i] - 1;
    const r = h[c]++;
    const bit = 1n << BigInt(r * W + c);
    if ((i & 1) === 0) p0 |= bit;
    else p1 |= bit;
  }
  return { h, p0, p1 };
}

function pop(v) {
  let n = 0;
  while (v) {
    v &= v - 1n;
    n++;
  }
  return n;
}

function residualMasks(s, player) {
  const own = player === 0 ? s.p0 : s.p1;
  const opp = player === 0 ? s.p1 : s.p0;
  const raw = [];
  for (const { mask } of lines) {
    if (mask & opp) continue;
    const rem = mask & ~own;
    if (rem) raw.push(rem);
  }
  const uniq = [...new Map(raw.map(m => [m.toString(), m])).values()]
    .sort((a, b) => pop(a) - pop(b) || (a < b ? -1 : a > b ? 1 : 0));
  const mins = [];
  outer: for (const m of uniq) {
    for (const p of mins) {
      if ((p & ~m) === 0n) continue outer;
    }
    mins.push(m);
  }
  return { raw, uniq, mins };
}

function hist(ms) {
  const h = [0, 0, 0, 0];
  for (const m of ms) h[pop(m) - 1]++;
  return h;
}

function sig(x) {
  return JSON.stringify(x);
}

const records = [];
for (let reply = 1; reply <= 7; reply++) {
  for (let third = 1; third <= 7; third++) {
    const s = makeState([4, reply, third]);
    const r0 = residualMasks(s, 0);
    const r1 = residualMasks(s, 1);
    records.push({
      reply,
      third,
      value: thirdMoveValues[reply - 1][third - 1],
      heights: s.h,
      rawHist: [hist(r0.raw), hist(r1.raw)],
      minHist: [hist(r0.mins), hist(r1.mins)],
    });
  }
}

function groupsBy(project) {
  const g = new Map();
  for (const r of records) {
    const k = sig(project(r));
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(r);
  }
  const mixed = [];
  for (const [k, rs] of g) {
    const values = new Set(rs.map(r => r.value));
    if (values.size > 1) {
      mixed.push({
        signature: JSON.parse(k),
        states: rs.map(r => [r.reply, r.third, r.value]),
      });
    }
  }
  return { classes: g.size, mixed };
}

const rawHistGroups = groupsBy(r => r.rawHist);
const minHistGroups = groupsBy(r => r.minHist);
const heightPlusMin = groupsBy(r => [r.heights, r.minHist]);
assert(rawHistGroups.mixed.length > 0);
assert(minHistGroups.mixed.length > 0);
assert.equal(heightPlusMin.mixed.length, 0);

function p1CellOfPrefix(prefix) {
  const h = Array(W).fill(0);
  let p1cell = -1;
  for (let i = 0; i < prefix.length; i++) {
    const c = prefix[i] - 1;
    const r = h[c]++;
    const cell = r * W + c;
    if (i === 1) p1cell = cell;
  }
  return p1cell;
}

const prefixP1Cell = perfectPrefixes.map(p => [p, p1CellOfPrefix(p)]);
const compatCounts = [];
for (const { mask } of lines) {
  let n = 0;
  for (const [, p1cell] of prefixP1Cell) {
    if ((mask & (1n << BigInt(p1cell))) === 0n) n++;
  }
  compatCounts.push(n);
}
const compatHist = {};
for (const n of compatCounts) compatHist[n] = (compatHist[n] ?? 0) + 1;
assert(Math.min(...compatCounts) > 0);

const output = {
  geometry: { winningLines: lines.length },
  opening: { firstMoveValues, perfectFirstMoves },
  thirdPly: {
    winningEdges,
    drawEdges,
    lossEdges,
    winningThirdMoves: Object.fromEntries(winningThirdMoves),
    perfectPrefixCount: perfectPrefixes.length,
  },
  predicateCollision: {
    rawResidualHistogram: {
      classes: rawHistGroups.classes,
      mixedClasses: rawHistGroups.mixed,
    },
    minimalResidualHistogram: {
      classes: minHistGroups.classes,
      mixedClasses: minHistGroups.mixed,
    },
    heightPlusMinimalHistogram: {
      classes: heightPlusMin.classes,
      mixedClassCount: heightPlusMin.mixed.length,
    },
  },
  lineCompatibilityWithPerfectThreePlyPrefix: {
    minimumCompatiblePrefixes: Math.min(...compatCounts),
    maximumCompatiblePrefixes: Math.max(...compatCounts),
    histogram: compatHist,
    linesEliminatedByDirectP1BlockAtPly2: compatCounts.filter(n => n === 0).length,
  },
};

console.log(JSON.stringify(output, null, 2));
