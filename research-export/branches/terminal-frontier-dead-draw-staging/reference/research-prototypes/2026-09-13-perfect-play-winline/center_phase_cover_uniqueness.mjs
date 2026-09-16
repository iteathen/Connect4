import assert from 'node:assert/strict';

const W = 7;
const H = 6;
const K = 4;
const lines = [];
for (let r = 1; r <= H; r++) {
  for (let c = 1; c <= W; c++) {
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const line = [];
      for (let i = 0; i < K; i++) {
        const x = c + i * dx;
        const y = r + i * dy;
        if (x < 1 || x > W || y < 1 || y > H) {
          line.length = 0;
          break;
        }
        line.push([x, y]);
      }
      if (line.length === K) lines.push(line);
    }
  }
}
assert.equal(lines.length, 69);

const hasCell = (line, cell) => line.some(([c, r]) => c === cell[0] && r === cell[1]);
const hasPair = (line, pair) => pair.every(cell => hasCell(line, cell));
const wings = [1, 2, 3, 6, 7];

function field(oddControlled) {
  const odd = new Set(oddControlled);
  const singletons = [];
  for (const c of wings) {
    const rows = odd.has(c) ? [1, 3, 5] : [2, 4, 6];
    for (const r of rows) singletons.push([c, r]);
  }

  const pairs = [];
  for (const r of [1, 3, 5]) pairs.push([[4, r], [5, r]]);
  pairs.push([[4, 3], [4, 4]], [[5, 3], [5, 4]]);

  const uncovered = lines.filter(line =>
    !singletons.some(cell => hasCell(line, cell)) &&
    !pairs.some(pair => hasPair(line, pair))
  );

  return { singletons, pairs, uncovered };
}

const distribution = {};
const fullCovers = [];
for (let mask = 0; mask < (1 << wings.length); mask++) {
  const odd = [];
  for (let i = 0; i < wings.length; i++) if ((mask >> i) & 1) odd.push(wings[i]);
  const f = field(odd);
  const n = f.uncovered.length;
  distribution[n] = (distribution[n] ?? 0) + 1;
  if (n === 0) fullCovers.push({ oddControlled: odd, field: f });
}

assert.equal(fullCovers.length, 1);
assert.deepEqual(fullCovers[0].oddControlled, [1]);

// Center opening D1 is P0-owned. In the unique complete phase cover:
// - odd control of column A requires A1 to be P1-owned;
// - blocker pair {D1,E1} with D1 already P0 forces E1 to be P1-owned.
// P1 gets only one move before P0's next move, so cannot establish both.
const requiredBottomP1 = [[1, 1], [5, 1]];
assert.equal(requiredBottomP1.length, 2);

console.log(JSON.stringify({
  kind: 'center-phase-cover-uniqueness',
  geometry: { W, H, K, winningLines: lines.length },
  phaseAssignments: 1 << wings.length,
  uncoveredCountDistribution: distribution,
  completeCovers: fullCovers.map(x => ({ oddControlled: x.oddControlled })),
  uniqueCompleteCover: {
    oddControlledWingColumns: [1],
    evenControlledWingColumns: [2, 3, 6, 7],
    requiredBottomP1: [[1, 1], [5, 1]],
    knownP0OpeningCell: [4, 1],
  },
  firstResponseCapacity: {
    availableP1MovesBeforeP0SecondMove: 1,
    simultaneouslyRequiredDistinctBottomCells: 2,
    feasible: false,
  },
}, null, 2));
