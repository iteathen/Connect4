import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { QN_TERMINAL_WIN } from './quotient-negamax-domain-contract.mjs';

// Research only: compare a structural projection with the actual archived
// evaluator. It is not an exact terminal policy or an enabled move-order policy.
const directory = process.argv[2];
if (!directory) throw new Error('Supply the extracted reference/legacy-source/Connect4-engine-source.zip directory');
const manifest = JSON.parse(await readFile(new URL('../../../../reference/legacy-source-manifest.json', import.meta.url)));
for (const name of ['scripts/virtualBoard.js', 'scripts/globalDefinitions.js']) {
  const bytes = await readFile(resolve(directory, name));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest.relevantFiles[name], `source drift: ${name}`);
}
const { virtualBoard } = await import(pathToFileURL(resolve(directory, 'scripts/virtualBoard.js')));

function compileFlags(W, H, kernel) {
  const rowMasks = new Uint32Array(4), evenLo = new Uint32Array(W * H), evenHi = new Uint32Array(W * H);
  for (let c = 0; c < W; c++) {
    const columnMasks = new Uint32Array(4);
    for (let r = 0; r < H; r++) {
      const cell = r * W + c, word = cell < 32 ? 0 : 1, bit = (1 << (cell & 31)) >>> 0;
      columnMasks[(r & 1) * 2 + word] |= bit;
      rowMasks[(r & 1) * 2 + word] |= bit;
    }
    for (let h = 0; h < H; h++) {
      const at = h * W + c, phase = ((h ^ 1) & 1) * 2;
      evenLo[at] = columnMasks[phase]; evenHi[at] = columnMasks[phase + 1];
    }
  }
  const constantPhase = ((W - 1) * H) & 1;
  let queries = 0;
  function intersects(id, lo, hi) { queries++; return kernel.classes.hasSingletonAt(id, lo >>> 0, hi >>> 0); }
  return {
    retainedBytes: rowMasks.byteLength + evenLo.byteLength + evenHi.byteLength,
    queries: () => queries,
    readInto(id, output) {
      const support = kernel.states.support[id], rank = kernel.supportAccess.rankAt(support);
      let playableLo = 0, playableHi = 0, supportEvenLo = 0, supportEvenHi = 0;
      for (let c = 0; c < W; c++) {
        const cell = kernel.supportAccess.landingAt(support, c);
        if (cell === 0xff) continue;
        const bit = (1 << (cell & 31)) >>> 0;
        if (cell < 32) playableLo |= bit; else playableHi |= bit;
        supportEvenLo |= evenLo[cell]; supportEvenHi |= evenHi[cell];
      }
      const phase = ((constantPhase ^ rank) & 1) * 2;
      const singleLo = rowMasks[phase] & ~playableLo, singleHi = rowMasks[phase + 1] & ~playableHi;
      const supportOddLo = ~(supportEvenLo | playableLo), supportOddHi = ~(supportEvenHi | playableHi);
      for (let p = 0; p < 2; p++) {
        const cl = p === 0 ? kernel.states.p0Class[id] : kernel.states.p1Class[id];
        // Each legacy 3-own/1-empty immediate line is visited three times.
        // Any immediate target therefore sets fork, never exactly-one immediate.
        const fork = intersects(cl, playableLo, playableHi);
        const single = intersects(cl, singleLo, singleHi);
        const double = intersects(cl, supportEvenLo, supportEvenHi) && intersects(cl, supportOddLo, supportOddHi);
        output[p] = (fork ? 2 : 0) | (single ? 4 : 0) | (double ? 8 : 0);
      }
    },
  };
}
function pack(flags) {
  return Number(flags.hasImmediateThreat) | (Number(flags.hasForkThreat) << 1)
    | (Number(flags.hasSingleParityThreat) << 2) | (Number(flags.hasDoubleParityThreat) << 3);
}
function boardSnapshot(b) {
  return JSON.stringify({ cells: b.board, heights: b.columnHeights, turn: b.nextTurn,
    ply: b.tokenCount, winner: b.winner, last: b.lastMoveIndex, live: b.playerWinnableStatus,
    order: b.moveOrder, hash: String(b.hash) });
}
let random = 0x2025c0de;
function next() { random ^= random << 13; random ^= random >>> 17; random ^= random << 5; return random >>> 0; }
const results = [];
for (const [W, H] of [[4, 4], [4, 5], [5, 4], [5, 5], [6, 4], [7, 6]]) {
  const { kernel: k } = createSlot64ResidualQuotientKernel({ columns: W, rows: H, connect: 4 }, { cacheEdges: false, responseClosure: false });
  const projected = compileFlags(W, H, k), output = new Uint8Array(2);
  let positions = 0, flagComparisons = 0, slotComparisons = 0, restored = 0, terminalEdges = 0;
  let legacyLiveLineVisits = 0, legacyParityCellVisits = 0, highTargetPositions = 0;
  const flagsObserved = new Set();
  for (let game = 0; game < 64; game++) {
    const b = new virtualBoard(W, H); let id = k.rootId, seed = k.frontierOrder.createRootSeed();
    for (let ply = 0; ply < W * H; ply++) {
      projected.readInto(id, output); positions++;
      for (let p = 0; p < 2; p++) {
        const expected = pack(b._computeThreatFlags(p));
        assert.equal(output[p], expected, `legacy flags differ at ${W}x${H}, game ${game}, ply ${ply}, player ${p}`);
        flagComparisons++; flagsObserved.add(expected);
        const cl = p ? k.states.p1Class[id] : k.states.p0Class[id];
        if (k.classes.hasSingletonAt(cl, 0, 0xffffffff)) highTargetPositions++;
        // Count the original algorithm's traversals, not elapsed CPU time.
        for (const cell of b.moveOrder[p]) for (const lineId of b.positionToWinningLines[cell]) {
          if (!b.playerWinnableStatus[p][lineId]) continue;
          legacyLiveLineVisits++;
          const line = b.baseWinningPositions[lineId], empty = line.filter(x => b.board[x] === null);
          if (empty.length === 1) {
            const target = empty[0], row = Math.floor(target / W), c = target % W;
            legacyParityCellVisits += row + 1;
            if (row - b.columnHeights[c] + 1 > 1) legacyParityCellVisits += (W - 1) * H + row + 1;
          }
        }
        for (let c = 0; c < W; c++) if (b.columnHeights[c] < H) {
          const cell = b.columnHeights[c] * W + c;
          const count = b.positionToWinningLines[cell].filter(line => b.playerWinnableStatus[p][line]).length;
          assert.equal(k.frontierOrder.valueAtSeed(seed, p, cell), count); slotComparisons++;
        }
      }
      const legal = [...b.getPossibleMoves()], c = legal[next() % legal.length], cell = b.columnHeights[c] * W + c;
      const snapshot = game === 0 ? boardSnapshot(b) : null;
      const undo = b.applyMove(c); assert.ok(undo);
      if (snapshot !== null) {
        assert.ok(b.undoMove(undo)); assert.equal(boardSnapshot(b), snapshot); restored++;
        assert.ok(b.applyMove(c));
      }
      const child = k.advance(id, c), winner = b.checkWin();
      if (winner === 0 || winner === 1) { assert.equal(child, QN_TERMINAL_WIN); terminalEdges++; break; }
      assert.ok(child >= 0); id = child;
      seed = k.frontierOrder.advanceSeed(seed, ply & 1, cell);
      if (winner === -1) break;
    }
  }
  results.push({ geometry: `${W}x${H}c4`, games: 64, positions, flagComparisons, slotComparisons,
    restored, terminalEdges, highTargetPositions, flagsObserved: [...flagsObserved].sort((a, b) => a - b),
    legacyLiveLineVisits, legacyLineCellInspections: 4 * legacyLiveLineVisits, legacyParityCellVisits,
    projectedSingletonQueries: projected.queries(), projectedRetainedBytes: projected.retainedBytes });
}
assert.ok(results.at(-1).highTargetPositions > 0);
const result = { kind: 'original-2025-source-to-frontier-projection-study', node: process.version,
  sourceSha256: manifest.relevantFiles['scripts/virtualBoard.js'], productionPolicyChanged: false,
  exactTerminalAuthorityClaimed: false, wallClockSpeedupClaimed: false,
  scope: '64 seeded legal games per geometry; original flags and slot incidence, not old full evaluator or solver equivalence', results };
if (process.argv[3]) await writeFile(process.argv[3], `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
