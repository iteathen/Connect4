import assert from 'node:assert/strict';
import test from 'node:test';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

// Qualification of arithmetic and address meaning, not a terminal publication
// policy. No formula below is installed as an unconditional ownership oracle.
test('CPC event counts reduce to XOR through the actual support/address mapping', (t) => {
  const reports = [];
  for (const [W, H, K] of [
    [1, 4, 3], [2, 5, 4], [3, 4, 3], [4, 3, 3], [4, 4, 4],
    [4, 5, 4], [5, 3, 3], [6, 4, 4], [7, 5, 4], [7, 6, 4],
  ]) {
    const { kernel } = createSlot64ResidualQuotientKernel(
      { columns: W, rows: H, connect: K }, { responseClosure: false, cacheEdges: false },
    );
    const heights = new Uint8Array(W), columnMajor = new Uint8Array(W * H);
    const phase = new Uint8Array(W * H);
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      columnMajor[r * W + c] = c * H + r;
      phase[r * W + c] = (((W - 1) * H) ^ r) & 1;
    }
    let targets = 0, oddHeightAddressCounterexamples = 0, ply = 0;
    const capacity = (H + 1) ** W;
    for (let support = 0; support < capacity; support++) {
      assert.equal(kernel.supportAccess.rankAt(support), ply);
      if ((H & 1) === 0) assert.equal(support & 1, ply & 1);
      for (let c = 0; c < W; c++) for (let r = heights[c]; r < H; r++) {
        // Literal event enumeration is independent of the cancelled equation.
        let events = 0;
        for (let d = 0; d < W; d++) {
          const end = d === c ? r + 1 : H;
          for (let y = heights[d]; y < end; y++) events++;
        }
        const cell = r * W + c;
        const relative = (ply ^ phase[cell]) & 1;
        assert.equal(relative, (events - 1) % 2);
        // Delta changes an established reservoir; this checks arithmetic only.
        for (const delta of [-2, -1, 1, 2]) {
          if (events + delta < 1 || events + delta > W * H) continue;
          assert.equal((ply ^ phase[cell] ^ delta) & 1, (events + delta - 1) % 2);
        }
        const addressParity = (support ^ columnMajor[cell]) & 1;
        if ((H & 1) === 0) assert.equal(addressParity, relative);
        else if (addressParity !== relative) oddHeightAddressCounterexamples++;
        // For odd widths, row-major cell parity XOR column parity is row parity.
        if ((W & 1) === 1) {
          assert.equal((((W - 1) * H) ^ ply ^ cell ^ c) & 1, relative);
        }
        targets++;
      }
      // Independent odometer enumerates heights without decoding support IDs.
      for (let c = 0; c < W; c++) {
        if (heights[c] < H) { heights[c]++; ply++; break; }
        heights[c] = 0; ply -= H;
      }
    }
    if (H & 1) assert.ok(oddHeightAddressCounterexamples > 0);
    reports.push({ geometry: `${W}x${H}c${K}`, supports: capacity, targets, oddHeightAddressCounterexamples });
  }
  t.diagnostic(JSON.stringify(reports));
});

// Independent physical replay and exhaustive continuation. Used only to locate
// the information missing from a proposed base-bit-to-WDL shortcut. This is not
// a falsifier of CPC with its complete relational context.
function fixture(path) {
  const W = 4, H = 3, K = 3, board = new Int8Array(12).fill(-1);
  const heights = new Uint8Array(W), lines = [], memo = new Map();
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const x = c + (K - 1) * dc, y = r + (K - 1) * dr;
      if (x >= 0 && x < W && y >= 0 && y < H) {
        lines.push(Array.from({ length: K }, (_, i) => (r + i * dr) * W + c + i * dc));
      }
    }
  }
  const won = p => lines.some(line => line.every(cell => board[cell] === p));
  let ply = 0;
  for (const digit of path) {
    const c = Number(digit) - 1;
    assert.ok(c >= 0 && c < W && heights[c] < H);
    board[heights[c]++ * W + c] = ply++ & 1;
    assert.equal(won(0) || won(1), false, 'fixture must stop before a win');
  }
  function solve(rank) {
    const key = board.join(',');
    if (memo.has(key)) return memo.get(key);
    let result = rank === 12 ? 0 : -1;
    for (let c = 0; c < W; c++) if (heights[c] < H) {
      const cell = heights[c]++ * W + c;
      board[cell] = rank & 1;
      const value = won(rank & 1) ? 1 : -solve(rank + 1);
      board[cell] = -1; heights[c]--;
      result = Math.max(result, value);
    }
    result = result === 0 ? 0 : result;
    memo.set(key, result); return result;
  }
  const mover = ply & 1, target = 6;
  assert.ok(lines.some(line => line.includes(target)
    && line.every(cell => cell === target ? board[cell] === -1 : board[cell] === mover)));
  assert.ok(heights[2] < 1, 'target must remain unplayable');
  const outside = heights.reduce((n, h, c) => n + (c === 2 ? 0 : H - h), 0);
  const through = 1 - heights[2] + 1;
  return { path, heights: [...heights], mover, outside, through,
    relativeControl: (outside ^ through ^ 1) & 1, wdl: solve(ply) };
}

test('equal base parity operands and target do not erase differing residual context', (t) => {
  const loss = fixture('122442'), win = fixture('124224');
  assert.deepEqual(loss.heights, win.heights);
  assert.equal(loss.outside, win.outside);
  assert.equal(loss.through, win.through);
  assert.equal(loss.relativeControl, 0);
  assert.equal(win.relativeControl, 0);
  assert.equal(loss.wdl, -1);
  assert.equal(win.wdl, 1);
  t.diagnostic(JSON.stringify({ loss, win }));
});
