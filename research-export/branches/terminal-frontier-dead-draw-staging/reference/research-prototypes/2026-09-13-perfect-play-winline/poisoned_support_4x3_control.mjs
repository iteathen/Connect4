import assert from 'node:assert/strict';

const W = 4;
const H = 3;
const K = 3;
const lines = [];
for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    for (const [dx, dy] of [[1,0],[0,1],[1,1],[1,-1]]) {
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
        let mask = 0;
        for (const x of cells) mask |= 1 << x;
        lines.push(mask);
      }
    }
  }
}
assert.equal(lines.length, 14);

function state(seq) {
  const h = Array(W).fill(0);
  let p0 = 0;
  let p1 = 0;
  for (let ply = 0; ply < seq.length; ply++) {
    const c = seq[ply] - 1;
    const r = h[c]++;
    const bit = 1 << (r * W + c);
    if (ply & 1) p1 |= bit;
    else p0 |= bit;
  }
  return { h, p0, p1 };
}

function pop(v) {
  let n = 0;
  while (v) { v &= v - 1; n++; }
  return n;
}

function canon(ms) {
  const xs = [...new Set(ms)].sort((a,b) => pop(a) - pop(b) || a - b);
  const out = [];
  outer: for (const m of xs) {
    for (const p of out) if ((p & ~m) === 0) continue outer;
    out.push(m);
  }
  return out;
}

function requirements(s, player) {
  const own = player === 0 ? s.p0 : s.p1;
  const opp = player === 0 ? s.p1 : s.p0;
  const out = [];
  for (const line of lines) {
    if (line & opp) continue;
    const rem = line & ~own;
    if (rem) out.push(rem);
  }
  return canon(out);
}

function singletonCells(s, player) {
  return requirements(s, player)
    .filter(m => pop(m) === 1)
    .map(m => 31 - Math.clz32(m));
}

function playable(s, cell) {
  const r = Math.trunc(cell / W);
  const c = cell - r * W;
  return s.h[c] === r;
}

function name(cell) {
  const r = Math.trunc(cell / W);
  const c = cell - r * W;
  return `${String.fromCharCode(65 + c)}${r + 1}`;
}

function singletonStatus(seq) {
  const s = state(seq);
  return singletonCells(s, 0).map(cell => ({
    cell: name(cell),
    playable: playable(s, cell),
    support: cell >= W ? name(cell - W) : null,
    supportPlayable: cell >= W ? playable(s, cell - W) : false,
  }));
}

// Immediate response overload after B1,B2,C1: P0 can win at A1 or D1.
assert.deepEqual(singletonStatus([2,2,3]), [
  { cell: 'A1', playable: true, support: null, supportPlayable: false },
  { cell: 'D1', playable: true, support: null, supportPlayable: false },
]);

// Forced answer after B1,A1,B2: B3 is immediately playable.
assert.deepEqual(singletonStatus([2,1,2]), [
  { cell: 'B3', playable: true, support: 'B2', supportPlayable: false },
]);

// After the forced B3 block and P0 A2, C2 is a latent singleton whose
// support C1 is currently playable. P1 playing C1 makes C2 playable for P0.
assert.deepEqual(singletonStatus([2,1,2,2,1]), [
  { cell: 'C2', playable: false, support: 'C1', supportPlayable: true },
]);
assert(singletonStatus([2,1,2,2,1,3]).some(x => x.cell === 'C2' && x.playable));

// If P1 avoids C1 with A3, P0 can play C1 and create the two-threat state.
const afterAvoidLeft = singletonStatus([2,1,2,2,1,1,3]);
assert(afterAvoidLeft.some(x => x.cell === 'C2' && x.playable));
assert(afterAvoidLeft.some(x => x.cell === 'D1' && x.playable));

// If P1 avoids C1 with D1, P0 A3 creates a stacked pair of singleton
// requirements C1/C2. C1 is playable; if P1 fills it, C2 becomes playable.
const stacked = singletonStatus([2,1,2,2,1,4,1]);
assert(stacked.some(x => x.cell === 'C1' && x.playable));
assert(stacked.some(x => x.cell === 'C2' && !x.playable && x.support === 'C1'));

console.log(JSON.stringify({
  kind: 'poisoned-support-4x3-control',
  immediateOverload: singletonStatus([2,2,3]),
  forcedAnswer: singletonStatus([2,1,2]),
  latentPoisonedSupport: singletonStatus([2,1,2,2,1]),
  avoidLeftCreatesOverload: afterAvoidLeft,
  avoidRightCreatesStackedThreat: stacked,
}, null, 2));
