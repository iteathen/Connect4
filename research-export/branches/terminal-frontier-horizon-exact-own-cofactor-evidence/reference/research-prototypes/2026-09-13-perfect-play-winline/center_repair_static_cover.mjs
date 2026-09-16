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

const hasCell = (line, [c, r]) => line.some(([x, y]) => x === c && y === r);
const hasPair = (line, pair) => pair.every(cell => hasCell(line, cell));

function blockerField(swappedColumn = null) {
  const singleton = [[5, 1]];
  for (const c of [1, 2, 3, 6, 7]) {
    const rows = c === swappedColumn ? [1, 3, 5] : [2, 4, 6];
    for (const r of rows) singleton.push([c, r]);
  }

  const pairs = [];
  for (const r of [1, 3, 5]) pairs.push([[4, r], [5, r]]);
  pairs.push([[4, 3], [4, 4]], [[5, 3], [5, 4]]);
  return { singleton, pairs };
}

function uncovered(field) {
  return lines.filter(line =>
    !field.singleton.some(cell => hasCell(line, cell)) &&
    !field.pairs.some(pair => hasPair(line, pair))
  );
}

const base = uncovered(blockerField());
assert.equal(base.length, 3);

const repairs = {};
for (const c of [1, 2, 3]) {
  const u = uncovered(blockerField(c));
  repairs[c] = { staticCovered: 69 - u.length, uncovered: u };
}

assert.equal(repairs[1].staticCovered, 69);
assert.equal(repairs[2].staticCovered, 64);
assert.equal(repairs[3].staticCovered, 63);

console.log(JSON.stringify({
  kind: 'center-repair-static-cover',
  baseStaticCovered: 66,
  baseUncovered: base,
  repairs,
}, null, 2));
