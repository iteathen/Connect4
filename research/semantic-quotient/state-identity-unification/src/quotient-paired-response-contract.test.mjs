import assert from 'node:assert/strict';
import test from 'node:test';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createOnlineSemanticQuotientSearcher } from './quotient-online-semantic-search-lib.mjs';
import { createSemanticSharedTtArena } from './quotient-semantic-shared-tt.mjs';
import { FRONTIER_BOUND_DRAW, FRONTIER_BOUND_MOVER_NO_WIN } from './quotient-negamax-domain-contract.mjs';

test('standard-board response certificates survive hostile play and shared Negamax perspective', () => {
  const spec = { columns: 7, rows: 6, connect: 4 };
  const { kernel: k } = createSlot64ResidualQuotientKernel(spec, { cacheEdges: false });
  const board = new Int8Array(42).fill(-1), heights = new Uint8Array(7);
  const seen = new Set(); let random = 0x91a432b7, checked = 0, highResponses = 0;
  const arena = createSemanticSharedTtArena({ entryCapacity: 4096, termCapacity: 1 << 20, domainSpec: spec });
  const searcher = createOnlineSemanticQuotientSearcher(k, arena, { etc: false });
  function next() { random ^= random << 13; random ^= random >>> 17; random ^= random << 5; return random >>> 0; }
  function place(c, player) { const cell = heights[c] * 7 + c; heights[c]++; board[cell] = player; return cell; }
  function undo(c, cell) { heights[c]--; board[cell] = -1; }
  function win(cell, player) {
    const c = cell % 7, r = Math.floor(cell / 7);
    for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      let n = 1;
      for (const sign of [-1, 1]) for (let d = 1; ; d++) {
        const x = c + sign * d * dc, y = r + sign * d * dr;
        if (x < 0 || x >= 7 || y < 0 || y >= 6 || board[y * 7 + x] !== player) break;
        n++;
      }
      if (n >= 4) return true;
    }
    return false;
  }
  function exact(rank, memo) {
    if (rank === 42) return 0;
    const key = board.join(','); if (memo.has(key)) return memo.get(key);
    let best = -1;
    for (let c = 0; c < 7; c++) if (heights[c] < 6) {
      const cell = place(c, rank & 1);
      const value = win(cell, rank & 1) ? 1 : -exact(rank + 1, memo);
      undo(c, cell); best = Math.max(best, value);
    }
    best = best === 0 ? 0 : best; memo.set(key, best); return best;
  }
  function defend(rank, attacker, memo) {
    const key = board.join(','); if (memo.has(key)) return;
    for (let c = 0; c < 7; c++) if (heights[c] < 6) {
      const attack = place(c, attacker);
      assert.equal(win(attack, attacker), false, 'attacker wins before the promised response');
      assert.ok(heights[c] < 6, 'response cell was not available');
      const response = place(c, 1 - attacker); if (response >= 32) highResponses++;
      if (!win(response, 1 - attacker) && rank + 2 < 42) defend(rank + 2, attacker, memo);
      undo(c, response); undo(c, attack);
    }
    memo.add(key);
  }
  for (let game = 0; game < 2000 && checked < 64; game++) {
    board.fill(-1); heights.fill(0); let id = k.rootId, seed = k.frontierOrder.createRootSeed();
    for (let rank = 0; rank < 42; rank++) {
      const bound = k.frontierBoundCode(id), moverClass = (rank & 1) ? k.states.p1Class[id] : k.states.p0Class[id];
      const key = board.join(',');
      if (rank >= 32 && !k.classes.isEmpty(moverClass) && !seen.has(key)
          && (bound === FRONTIER_BOUND_MOVER_NO_WIN || bound === FRONTIER_BOUND_DRAW)) {
        assert.ok(heights.every(h => (6 - h) % 2 === 0));
        defend(rank, rank & 1, new Set());
        const truth = exact(rank, new Map()); assert.ok(truth <= 0);
        if (bound === FRONTIER_BOUND_DRAW) assert.equal(truth, 0);
        for (const [alpha, beta] of [[-2, 2], [0, 1], [-1, 0]]) {
          const value = searcher.search(id, alpha, beta, seed);
          if (value <= alpha) assert.ok(truth <= value);
          else if (value >= beta) assert.ok(truth >= value);
          else assert.ok(value === truth);
        }
        checked++; seen.add(key);
      }
      const options = [];
      for (let c = 0; c < 7; c++) if (heights[c] < 6) {
        const cell = place(c, rank & 1), won = win(cell, rank & 1); undo(c, cell);
        if (!won) options.push(c);
      }
      if (options.length === 0) break;
      const c = options[next() % options.length], cell = place(c, rank & 1);
      id = k.advance(id, c); assert.ok(id >= 0);
      seed = k.frontierOrder.advanceSeed(seed, rank & 1, cell);
    }
  }
  assert.ok(checked >= 32, `only ${checked} standard response positions exercised`);
  assert.ok(highResponses > 0, 'high u32 lane response cells were not exercised');
});
