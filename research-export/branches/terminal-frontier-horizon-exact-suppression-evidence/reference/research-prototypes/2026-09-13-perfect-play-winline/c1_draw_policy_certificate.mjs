import assert from 'node:assert/strict';

const W = 7;
const H = 6;
const K = 4;
const idx = (c, r) => r * W + c;

const lines = [];
for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const cells = [];
      for (let i = 0; i < K; i++) {
        const x = c + i * dx;
        const y = r + i * dy;
        if (x < 0 || x >= W || y < 0 || y >= H) {
          cells.length = 0;
          break;
        }
        cells.push([x, y]);
      }
      if (cells.length === K) lines.push(cells);
    }
  }
}
assert.equal(lines.length, 69);

const lineMasks = lines.map(line =>
  line.reduce((mask, [c, r]) => mask | (1n << BigInt(idx(c, r))), 0n),
);

function won(bits, lastCell) {
  const bit = 1n << BigInt(lastCell);
  return lineMasks.some(mask => (mask & bit) !== 0n && (bits & mask) === mask);
}

function heights(p0, p1) {
  const occupied = p0 | p1;
  const h = Array(W).fill(0);
  for (let c = 0; c < W; c++) {
    while (h[c] < H && ((occupied >> BigInt(idx(c, h[c]))) & 1n) !== 0n) h[c]++;
  }
  return h;
}

// Mathematical discussion uses 1-based columns. This control starts from
// 1.C1 ...d1, represented here as zero-based columns 2 and 3.
const start = [1n << BigInt(idx(2, 0)), 1n << BigInt(idx(3, 0))];

// Allen/Allis draw-policy shape after 1.C1 ...d1:
// - normally answer directly above P0's last stone;
// - if P0 fills C6, answer at the lowest empty D cell;
// - if P0 fills D6, answer at the lowest empty C cell.
function policyResponse(p0, p1, lastP0Cell) {
  const h = heights(p0, p1);
  const c = lastP0Cell % W;
  const r = Math.trunc(lastP0Cell / W);

  let responseColumn;
  let responseRow;
  if (r < H - 1) {
    responseColumn = c;
    responseRow = r + 1;
  } else if (c === 2) {
    responseColumn = 3;
    responseRow = h[3];
  } else if (c === 3) {
    responseColumn = 2;
    responseRow = h[2];
  } else {
    return -1;
  }

  if (responseRow >= H || h[responseColumn] !== responseRow) return -1;
  return idx(responseColumn, responseRow);
}

const queue = [start];
const seen = new Set([`${start[0]}/${start[1]}`]);
const intermediateStates = [];
let moveEdges = 0;
let p0ImmediateWins = 0;
let p1TerminalWins = 0;
let drawTerminalStates = 0;
let invalidResponses = 0;

for (let qi = 0; qi < queue.length; qi++) {
  const [p0, p1] = queue[qi];
  const h = heights(p0, p1);
  let any = false;

  for (let c = 0; c < W; c++) {
    if (h[c] >= H) continue;
    any = true;
    moveEdges++;

    const p0Cell = idx(c, h[c]);
    const nextP0 = p0 | (1n << BigInt(p0Cell));
    intermediateStates.push([nextP0, p1]);
    if (won(nextP0, p0Cell)) {
      p0ImmediateWins++;
      continue;
    }

    const p1Cell = policyResponse(nextP0, p1, p0Cell);
    if (p1Cell < 0) {
      invalidResponses++;
      continue;
    }

    const nextP1 = p1 | (1n << BigInt(p1Cell));
    if (won(nextP1, p1Cell)) {
      p1TerminalWins++;
      continue;
    }

    const key = `${nextP0}/${nextP1}`;
    if (!seen.has(key)) {
      seen.add(key);
      queue.push([nextP0, nextP1]);
    }
  }

  if (!any) drawTerminalStates++;
}

assert.equal(p0ImmediateWins, 0);
assert.equal(invalidResponses, 0);

// Static singleton blockers: cells P0 never owns, even immediately after its move.
const singletonBlockers = [];
for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    const bit = 1n << BigInt(idx(c, r));
    if (intermediateStates.every(([p0]) => (p0 & bit) === 0n)) singletonBlockers.push([c, r]);
  }
}

// Four reusable pair blockers are sufficient for every line not already
// covered by a singleton except the two race-preempted horizontals.
const pairBlockers = [
  [[2, 2], [2, 3]], // C3,C4
  [[3, 2], [3, 3]], // D3,D4
  [[2, 2], [3, 2]], // C3,D3
  [[2, 4], [3, 4]], // C5,D5
];

for (const pair of pairBlockers) {
  const mask = pair.reduce((m, [c, r]) => m | (1n << BigInt(idx(c, r))), 0n);
  assert(intermediateStates.every(([p0]) => (p0 & mask) !== mask));
}

function lineContainsCell(line, cell) {
  return line.some(([c, r]) => c === cell[0] && r === cell[1]);
}
function lineContainsPair(line, pair) {
  return pair.every(cell => lineContainsCell(line, cell));
}

const classified = { singleton: [], pair: [], race: [] };
for (const line of lines) {
  if (singletonBlockers.some(cell => lineContainsCell(line, cell))) classified.singleton.push(line);
  else if (pairBlockers.some(pair => lineContainsPair(line, pair))) classified.pair.push(line);
  else classified.race.push(line);
}

assert.equal(classified.singleton.length, 56);
assert.equal(classified.pair.length, 11);
assert.equal(classified.race.length, 2);

const oneBased = line => line.map(([c, r]) => [c + 1, r + 1]);
assert.deepEqual(classified.race.map(oneBased), [
  [[4, 3], [5, 3], [6, 3], [7, 3]],
  [[4, 5], [5, 5], [6, 5], [7, 5]],
]);

// Qualify the two race premises over every intermediate policy state.
for (const [p0, p1] of intermediateStates) {
  if ((p0 & (1n << BigInt(idx(3, 2)))) !== 0n) {
    assert((p1 & (1n << BigInt(idx(3, 1)))) !== 0n); // P0 D3 => P1 D2.
  }
  if ((p0 & (1n << BigInt(idx(3, 4)))) !== 0n) {
    assert((p1 & (1n << BigInt(idx(3, 3)))) !== 0n); // P0 D5 => P1 D4.
  }
}

console.log(JSON.stringify({
  geometry: { winningLines: lines.length },
  policy: {
    openingOneBased: [3, 4],
    p0TurnStates: queue.length,
    p0MoveEdges: moveEdges,
    p0ImmediateWins,
    p1TerminalWins,
    drawTerminalStates,
    invalidResponses,
  },
  certificate: {
    singletonBlockerCellsOneBased: singletonBlockers.map(([c, r]) => [c + 1, r + 1]),
    singletonCoveredLines: classified.singleton.length,
    pairBlockersOneBased: pairBlockers.map(oneBased),
    pairCoveredAdditionalLines: classified.pair.length,
    racePreemptedLinesOneBased: classified.race.map(oneBased),
    racePreemptedCount: classified.race.length,
    totalCovered: classified.singleton.length + classified.pair.length + classified.race.length,
  },
}, null, 2));
