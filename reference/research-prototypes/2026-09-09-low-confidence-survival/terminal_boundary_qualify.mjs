import assert from 'node:assert/strict';
import fs from 'node:fs';

function popcount32(v) {
  v >>>= 0;
  let n = 0;
  while (v) {
    v &= v - 1;
    n++;
  }
  return n;
}

function linesFor(W, H, K) {
  const lines = [];
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
        const x = c + (K - 1) * dx;
        const y = r + (K - 1) * dy;
        if (x < 0 || x >= W || y < 0 || y >= H) continue;
        let mask = 0;
        const cells = [];
        for (let j = 0; j < K; j++) {
          const cell = (r + j * dy) * W + c + j * dx;
          mask += 2 ** cell;
          cells.push(cell);
        }
        lines.push({ mask, cells, c, r, dx, dy });
      }
    }
  }
  return lines;
}

function hasLine(bits, lines) {
  for (const line of lines) {
    if ((bits & line.mask) === line.mask) return true;
  }
  return false;
}

function completedLineIds(bits, landingCell, lines) {
  const out = [];
  const landingBit = 2 ** landingCell;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if ((line.mask & landingBit) !== 0 && (bits & line.mask) === line.mask) out.push(i);
  }
  return out;
}

// Independent geometric check: scan through the newly placed stone in four directions.
// This deliberately does not use the pre-enumerated winning-line masks.
function directionalWin(bits, W, H, K, landingCell) {
  const row = Math.trunc(landingCell / W);
  const col = landingCell - row * W;
  const owns = (c, r) => c >= 0 && c < W && r >= 0 && r < H && (bits & (2 ** (r * W + c))) !== 0;
  for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    let count = 1;
    for (const sign of [-1, 1]) {
      let c = col + sign * dx;
      let r = row + sign * dy;
      while (owns(c, r)) {
        count++;
        c += sign * dx;
        r += sign * dy;
      }
    }
    if (count >= K) return true;
  }
  return false;
}

function landingRow(occupied, W, H, col) {
  for (let row = 0; row < H; row++) {
    if ((occupied & (2 ** (row * W + col))) === 0) return row;
  }
  return H;
}

function validateGravity(bits0, bits1, W, H) {
  const occupied = bits0 | bits1;
  for (let col = 0; col < W; col++) {
    let seenEmpty = false;
    for (let row = 0; row < H; row++) {
      const filled = (occupied & (2 ** (row * W + col))) !== 0;
      if (!filled) seenEmpty = true;
      else assert(!seenEmpty, `floating stone c${col} r${row}`);
    }
  }
}

function exhaustiveTerminalBoundary(W, H, K) {
  const CELLS = W * H;
  const SCALE = 2 ** CELLS;
  const lines = linesFor(W, H, K);
  const seen = new Set();
  const stack = [[0, 0]];
  let states = 0;
  let legalEdges = 0;
  let winTerminalEdges = 0;
  let drawTerminalEdges = 0;
  let terminalPredicateMismatches = 0;
  let terminalBoardMismatches = 0;
  let priorTerminalViolations = 0;
  const hitLines = new Set();

  while (stack.length) {
    const [p0, p1] = stack.pop();
    const key = p0 + p1 * SCALE;
    if (seen.has(key)) continue;
    seen.add(key);
    states++;

    assert.equal(p0 & p1, 0, 'overlapping stones');
    validateGravity(p0, p1, W, H);
    if (hasLine(p0, lines) || hasLine(p1, lines)) {
      priorTerminalViolations++;
      continue;
    }

    const occupied = p0 | p1;
    const moves = popcount32(occupied);
    const player = moves & 1;
    const expectedP0 = Math.ceil(moves / 2);
    const expectedP1 = Math.floor(moves / 2);
    assert.equal(popcount32(p0), expectedP0);
    assert.equal(popcount32(p1), expectedP1);

    for (let col = 0; col < W; col++) {
      const row = landingRow(occupied, W, H, col);
      if (row === H) continue;
      legalEdges++;
      const cell = row * W + col;
      const bit = 2 ** cell;
      const before = player ? p1 : p0;
      const after = before | bit;
      const byMask = completedLineIds(after, cell, lines);
      const byDirection = directionalWin(after, W, H, K, cell);
      if ((byMask.length > 0) !== byDirection) terminalPredicateMismatches++;

      const n0 = player ? p0 : after;
      const n1 = player ? after : p1;
      validateGravity(n0, n1, W, H);

      if (byMask.length > 0) {
        winTerminalEdges++;
        for (const lineId of byMask) hitLines.add(lineId);
        // Terminal board must agree independently: mover wins, opponent does not,
        // and every completed line is newly attributable to the landing stone.
        const moverWin = hasLine(after, lines) && byDirection;
        const opponentBits = player ? p0 : p1;
        const opponentWin = hasLine(opponentBits, lines);
        if (!moverWin || opponentWin) terminalBoardMismatches++;
        for (const lineId of byMask) {
          assert(lines[lineId].cells.includes(cell), 'terminal line does not include landing cell');
        }
        continue; // legal game ends here; never admit post-terminal state.
      }

      if (moves + 1 === CELLS) {
        drawTerminalEdges++;
        if (hasLine(n0, lines) || hasLine(n1, lines)) terminalBoardMismatches++;
        continue;
      }

      const nkey = n0 + n1 * SCALE;
      if (!seen.has(nkey)) stack.push([n0, n1]);
    }
  }

  return {
    profile: `${W}x${H}c${K}`,
    lines: lines.length,
    states,
    legalEdges,
    winTerminalEdges,
    drawTerminalEdges,
    terminalPredicateMismatches,
    terminalBoardMismatches,
    priorTerminalViolations,
    winningLineSchemasHit: hitLines.size,
    winningLineSchemasTotal: lines.length,
  };
}

function parse7x6(sequence) {
  const W = 7, H = 6, K = 4;
  const lines = linesFor(W, H, K);
  let p0 = 0, p1 = 0;
  const heights = new Uint8Array(W);
  for (let ply = 0; ply < sequence.length; ply++) {
    assert(!hasLine(p0, lines) && !hasLine(p1, lines), `known sequence continued after terminal at ply ${ply}`);
    const col = sequence.charCodeAt(ply) - 49;
    assert(col >= 0 && col < W, `bad column in ${sequence}`);
    const row = heights[col];
    assert(row < H, `full column in ${sequence}`);
    const bit = 2 ** (row * W + col);
    if (ply & 1) p1 |= bit;
    else p0 |= bit;
    heights[col]++;
  }
  assert(!hasLine(p0, lines) && !hasLine(p1, lines), `known oracle root is already terminal: ${sequence}`);
  return { p0, p1, heights, moves: sequence.length, lines };
}

function knownSolvedActionTerminalBoundary() {
  const text = fs.readFileSync(new URL('../../../oracles/solved-actions-v1.tsv', import.meta.url), 'utf8').trim();
  const rows = text.split(/\r?\n/);
  assert.equal(rows.length, 128, 'unexpected solved-action vector count');
  let actionSlots = 0;
  let legalActions = 0;
  let immediateTerminalActions = 0;
  let fullBoardDrawActions = 0;
  let terminalPredicateMismatches = 0;
  let knownScoreMismatches = 0;
  let terminalBoardMismatches = 0;
  let maxScoreConsistencyMismatches = 0;
  const hitLines = new Set();
  const examples = [];

  for (const line of rows) {
    const [group, sourceSet, sourceLine, sequence, rootScoreText, scoresText] = line.split('\t');
    const rootScore = Number(rootScoreText);
    const scores = scoresText.split(',').map(Number);
    assert.equal(scores.length, 7);
    assert.equal(Math.max(...scores), rootScore, `frozen max(moveScores) mismatch ${sourceSet}:${sourceLine}`);

    const root = parse7x6(sequence);
    const { p0, p1, heights, moves, lines: winLines } = root;
    const player = moves & 1;
    const occupied = p0 | p1;
    const maximumImmediateScore = Math.trunc((42 + 1 - moves) / 2);
    let rowImmediateCount = 0;

    for (let col = 0; col < 7; col++) {
      actionSlots++;
      const score = scores[col];
      const row = heights[col];
      if (row === 6) {
        assert.equal(score, -1000, `known vector marks full column legal ${sourceSet}:${sourceLine} c${col + 1}`);
        continue;
      }
      legalActions++;
      assert.notEqual(score, -1000, `known vector marks legal column invalid ${sourceSet}:${sourceLine} c${col + 1}`);
      const cell = row * 7 + col;
      const bit = 2 ** cell;
      const before = player ? p1 : p0;
      const after = before | bit;
      const completed = completedLineIds(after, cell, winLines);
      const byDirection = directionalWin(after, 7, 6, 4, cell);
      if ((completed.length > 0) !== byDirection) terminalPredicateMismatches++;

      const n0 = player ? p0 : after;
      const n1 = player ? after : p1;
      validateGravity(n0, n1, 7, 6);

      if (completed.length > 0) {
        rowImmediateCount++;
        immediateTerminalActions++;
        for (const lineId of completed) hitLines.add(lineId);
        if (score !== maximumImmediateScore) knownScoreMismatches++;
        const opponentBits = player ? p0 : p1;
        if (!hasLine(after, winLines) || !byDirection || hasLine(opponentBits, winLines)) terminalBoardMismatches++;
        if (examples.length < 12) examples.push({ group, sourceSet, sourceLine: Number(sourceLine), sequence, col: col + 1, landingRow: row + 1, score, expected: maximumImmediateScore, lineIds: completed });
      } else {
        // The maximum possible exact score at this ply means winning on this move;
        // a non-terminal move cannot legitimately carry that value.
        if (score === maximumImmediateScore) knownScoreMismatches++;
        if (moves + 1 === 42) {
          fullBoardDrawActions++;
          if (score !== 0 || hasLine(n0, winLines) || hasLine(n1, winLines)) terminalBoardMismatches++;
        }
      }
    }

    if ((rootScore === maximumImmediateScore) !== (rowImmediateCount > 0)) maxScoreConsistencyMismatches++;
  }

  return {
    vectors: rows.length,
    actionSlots,
    legalActions,
    immediateTerminalActions,
    fullBoardDrawActions,
    terminalPredicateMismatches,
    knownScoreMismatches,
    terminalBoardMismatches,
    maxScoreConsistencyMismatches,
    winningLineSchemasHit: hitLines.size,
    winningLineSchemasTotal: 69,
    examples,
  };
}

const small = [
  exhaustiveTerminalBoundary(4, 3, 3),
  exhaustiveTerminalBoundary(4, 4, 4),
  exhaustiveTerminalBoundary(5, 3, 4),
  exhaustiveTerminalBoundary(4, 5, 4),
];
const known7x6 = knownSolvedActionTerminalBoundary();

for (const r of small) {
  assert.equal(r.terminalPredicateMismatches, 0, `${r.profile} terminal predicate mismatch`);
  assert.equal(r.terminalBoardMismatches, 0, `${r.profile} terminal board mismatch`);
  assert.equal(r.priorTerminalViolations, 0, `${r.profile} admitted prior-terminal state`);
}
assert.equal(known7x6.terminalPredicateMismatches, 0, '7x6 terminal predicate mismatch');
assert.equal(known7x6.knownScoreMismatches, 0, '7x6 known oracle terminal score mismatch');
assert.equal(known7x6.terminalBoardMismatches, 0, '7x6 reconstructed terminal board mismatch');
assert.equal(known7x6.maxScoreConsistencyMismatches, 0, '7x6 immediate/max-score consistency mismatch');

console.log(JSON.stringify({ kind: 'terminal-boundary-qualification', small, known7x6 }, null, 2));
