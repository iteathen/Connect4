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

function coverTemplate(opening) {
  // For the left half and center, use the Allis Appendix-B pattern generalized
  // by K=4: pair (j,j+1), plus the K-shifted pair when it still fits.
  const pairColumns = [[opening, opening + 1]];
  if (opening + K + 1 <= W) pairColumns.push([opening + K, opening + K + 1]);

  const paired = new Set(pairColumns.flat());
  const evenControlledColumns = [];
  for (let c = 1; c <= W; c++) if (!paired.has(c)) evenControlledColumns.push(c);

  // The defender's first response at opening+1 is a permanent singleton.
  const singletonBlockers = [[opening + 1, 1]];
  for (const c of evenControlledColumns) {
    for (const r of [2, 4, 6]) singletonBlockers.push([c, r]);
  }

  // Pair-column semantics: at least one defender stone in each odd-row cross
  // pair, plus the central vertical pair needed to kill all vertical windows.
  const pairBlockers = [];
  for (const [a, b] of pairColumns) {
    for (const r of [1, 3, 5]) pairBlockers.push([[a, r], [b, r]]);
    pairBlockers.push([[a, 3], [a, 4]], [[b, 3], [b, 4]]);
  }

  const uncovered = [];
  for (const line of lines) {
    if (singletonBlockers.some(cell => hasCell(line, cell))) continue;
    if (pairBlockers.some(pair => hasPair(line, pair))) continue;
    uncovered.push(line);
  }

  const shadowPreemptible = uncovered.filter(line =>
    line.every(([, r]) => r === 3 || r === 5),
  );
  const unpreemptedBottom = uncovered.filter(line => line.every(([, r]) => r === 1));

  return {
    opening,
    response: opening + 1,
    pairColumns,
    evenControlledColumns,
    staticCovered: lines.length - uncovered.length,
    uncovered,
    shadowPreemptible,
    unpreemptedBottom,
  };
}

const templates = [];
for (let opening = 1; opening <= 4; opening++) {
  const t = coverTemplate(opening);
  if (opening < 4) {
    assert.equal(t.staticCovered, 67);
    assert.equal(t.uncovered.length, 2);
    assert.equal(t.shadowPreemptible.length, 2);
    assert.equal(t.unpreemptedBottom.length, 0);
  } else {
    assert.equal(t.staticCovered, 66);
    assert.equal(t.uncovered.length, 3);
    assert.equal(t.shadowPreemptible.length, 2);
    assert.deepEqual(t.unpreemptedBottom, [
      [[1, 1], [2, 1], [3, 1], [4, 1]],
    ]);
  }
  templates.push(t);
}

console.log(JSON.stringify({
  geometry: { W, H, K, winningLines: lines.length },
  templates,
  interpretation: {
    nonCenter: 'openings 1..3: 67 static blockers + 2 lower-shadow preemptions = complete 69-line safety cover',
    center: 'opening 4: 66 static blockers + 2 lower-shadow preemptions = 68; bottom A1-D1 remains because no lower support shadow exists',
  },
}, null, 2));
