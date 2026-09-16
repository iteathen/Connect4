import assert from 'node:assert/strict';

function popcount(x) {
  let n = 0;
  while (x) {
    x &= x - 1;
    n++;
  }
  return n;
}

function solveLineOutputAlgebra(W, H, K) {
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const lines = [];

  for (let row = 0; row < H; row++) {
    for (let col = 0; col < W; col++) {
      for (const [dc, dr] of directions) {
        const cells = [];
        let valid = true;
        for (let i = 0; i < K; i++) {
          const c = col + i * dc;
          const r = row + i * dr;
          if (c < 0 || c >= W || r < 0 || r >= H) {
            valid = false;
            break;
          }
          cells.push(r * W + c);
        }
        if (valid) lines.push(cells);
      }
    }
  }

  assert(lines.length < 31, 'small-game control uses one Number bit per line');
  assert(W * H < 31, 'small-game control uses one Number bit per cell');

  const lineMasks = lines.map((line) =>
    line.reduce((mask, cell) => mask | (1 << cell), 0),
  );
  const linesByCell = Array.from({ length: W * H }, () => []);
  lines.forEach((line, lineId) => {
    for (const cell of line) linesByCell[cell].push(lineId);
  });

  const memo = new Map();

  function occupiedFromHeights(heights) {
    let mask = 0;
    for (let col = 0; col < W; col++) {
      for (let row = 0; row < heights[col]; row++) {
        mask |= 1 << (row * W + col);
      }
    }
    return mask;
  }

  function heightCode(heights) {
    let code = 0;
    let scale = 1;
    for (let col = 0; col < W; col++) {
      code += heights[col] * scale;
      scale *= H + 1;
    }
    return code;
  }

  function completedLineMask(playerBits, lastCell) {
    let completed = 0;
    for (const lineId of linesByCell[lastCell]) {
      const line = lineMasks[lineId];
      if ((playerBits & line) === line) completed |= 1 << lineId;
    }
    return completed;
  }

  // G(s) is the set of first-player terminal winning lines possible under
  // W/D/L-perfect play from s, represented as a line bitset.
  //
  // First-player node: union every nonempty winning child. Empty children add
  // nothing because a perfect first player ignores non-winning choices.
  //
  // Second-player node: one empty child annihilates the result because a
  // perfect second player can avoid a first-player win. If every child is
  // nonempty, all moves still lose under W/D/L and are equally perfect, so
  // possible terminal-line identities are their union.
  function G(heights, p0Bits, ply) {
    const key = heightCode(heights) * (2 ** (W * H)) + p0Bits;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;

    const firstToMove = (ply & 1) === 0;
    const occupied = occupiedFromHeights(heights);
    let union = 0;

    for (let col = 0; col < W; col++) {
      const row = heights[col];
      if (row === H) continue;

      const cell = row * W + col;
      const bit = 1 << cell;
      const childHeights = heights.slice();
      childHeights[col]++;
      const childOccupied = occupied | bit;
      const childP0 = firstToMove ? p0Bits | bit : p0Bits;
      const moverBits = firstToMove
        ? childP0
        : childOccupied ^ childP0;
      const completed = completedLineMask(moverBits, cell);

      let child;
      if (completed !== 0) {
        child = firstToMove ? completed : 0;
      } else if (ply + 1 === W * H) {
        child = 0;
      } else {
        child = G(childHeights, childP0, ply + 1);
      }

      if (!firstToMove && child === 0) {
        memo.set(key, 0);
        return 0;
      }

      union |= child;
    }

    memo.set(key, union);
    return union;
  }

  const root = G(Array(W).fill(0), 0, 0);
  return {
    board: `${W}x${H}`,
    connect: K,
    geometricLines: lines.length,
    firstPlayerWin: root !== 0,
    perfectPlayTerminalLines: popcount(root),
    evaluatedProofStates: memo.size,
  };
}

const controls = [
  [4, 3, 3, true, 14],
  [4, 4, 4, false, 0],
  [5, 3, 4, false, 0],
  [4, 5, 4, false, 0],
];

for (const [W, H, K, expectedWin, expectedLines] of controls) {
  const result = solveLineOutputAlgebra(W, H, K);
  assert.equal(result.firstPlayerWin, expectedWin);
  assert.equal(result.perfectPlayTerminalLines, expectedLines);
  console.log(JSON.stringify(result));
}
