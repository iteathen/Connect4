#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Target-free bridge candidate.  The only scalar game inputs are turn modulus,
// connect arity, height, and width.  No solved W/D/L, terminal-distance label,
// predefined winning-line count, or predefined middle/terminal cardinality is used.
//
// IMPORTANT: this proves an empty-board canonical structural envelope, not yet
// that distance-optimal play is forced to realize that envelope.  That semantic
// selection theorem is the remaining bridge.

const TURN_MODULUS = 2;
const K = 4;
const H = 6;
const W = 7;
const DIRECTIONS = [[1, 0], [0, 1], [1, 1], [1, -1]];

function generateWinningLines(width, height, connect) {
  const lines = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      for (const [dx, dy] of DIRECTIONS) {
        const cells = [];
        let valid = true;
        for (let i = 0; i < connect; i += 1) {
          const cx = x + i * dx;
          const cy = y + i * dy;
          if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
            valid = false;
            break;
          }
          cells.push({ x: cx, y: cy, cell: cy * width + cx });
        }
        if (valid) lines.push({ x, y, dx, dy, cells });
      }
    }
  }
  return lines;
}

function rankGF2(matrix) {
  const a = matrix.map((row) => Uint8Array.from(row));
  const rows = a.length;
  const cols = a[0]?.length ?? 0;
  let rank = 0;
  for (let col = 0; col < cols && rank < rows; col += 1) {
    let pivot = rank;
    while (pivot < rows && a[pivot][col] === 0) pivot += 1;
    if (pivot === rows) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    for (let r = 0; r < rows; r += 1) {
      if (r === rank || a[r][col] === 0) continue;
      for (let c = col; c < cols; c += 1) a[r][c] ^= a[rank][c];
    }
    rank += 1;
  }
  return rank;
}

function incidence(lines, cellCount) {
  const B = Array.from({ length: cellCount }, () => new Uint8Array(lines.length));
  for (let j = 0; j < lines.length; j += 1) {
    for (const { cell } of lines[j].cells) B[cell][j] = 1;
  }
  return B;
}

function cellKey({ x, y }) { return `${x},${y}`; }

const cellCount = W * H;
const lines = generateWinningLines(W, H, K);
const L = lines.length;
const B = incidence(lines, cellCount);
const imageDimension = rankGF2(B);
const kernelDimension = L - imageDimension;

// Existing target-free middle theorem, re-derived here from the generated B.
const imageExcess = imageDimension - W;
const kernelExcess = kernelDimension - H;
assert.equal(imageExcess, kernelExcess);
const structuralMiddle = imageExcess;

// Empty-board symmetry: with odd width there is exactly one column fixed by
// horizontal reflection.  No column choice is supplied as a premise.
const reflectionFixedColumns = Array.from({ length: W }, (_, c) => c)
  .filter((c) => c === W - 1 - c);
assert.equal(reflectionFixedColumns.length, 1);
const criticalColumn = reflectionFixedColumns[0];

// Earliest P0 terminal requires K P0 moves and therefore occurs on ply 2K-1.
// The preceding P0 move is the natural preterminal rank 2K-3.  At that rank P0
// owns K-1 events and P1 owns K-2 events.
const earliestP0TerminalPly = TURN_MODULUS * K - 1;
const criticalPrefixPly = earliestP0TerminalPly - TURN_MODULUS;
assert.equal(criticalPrefixPly, TURN_MODULUS * (K - 1) - 1);
assert(criticalPrefixPly <= H, 'canonical critical stack must fit the board');

// Canonical symmetry-fixed P chain: each complete two-ply pair uses the unique
// reflection-fixed column, so P_{c,c} is a same-column GF(2) stutter and has
// zero phase displacement.  The final event is P0's preterminal event.
const phase = new Uint8Array(W);
const criticalEvents = [];
for (let event = 0; event < criticalPrefixPly; event += 1) {
  criticalEvents.push({
    player: event % TURN_MODULUS,
    x: criticalColumn,
    y: event,
  });
  phase[criticalColumn] ^= 1;
  if ((event + 1) % TURN_MODULUS === 0) {
    assert.equal(phase[criticalColumn], 0, 'same-column two-ply stutter must cancel');
  }
}
const p0Critical = new Set(criticalEvents.filter((e) => e.player === 0).map(cellKey));
const p1Critical = new Set(criticalEvents.filter((e) => e.player === 1).map(cellKey));
assert.equal(p0Critical.size, K - 1);
assert.equal(p1Critical.size, K - 2);

// Maximal-delay boundary derived only from board size and turn parity.  P0 moves
// on odd one-based plies, so its latest possible terminal is the largest odd ply
// not exceeding the board capacity.  This is a structural horizon, NOT yet a
// theorem that optimal defense attains it.
const latestPossibleP0TerminalPly = (cellCount % TURN_MODULUS === 1)
  ? cellCount
  : cellCount - 1;
assert.equal(latestPossibleP0TerminalPly % TURN_MODULUS, 1);
const emptyCellsImmediatelyBeforeTerminal = cellCount - latestPossibleP0TerminalPly + 1;
const minimumFinalLandingRow = Math.max(0, H - emptyCellsImmediatelyBeforeTerminal);

function survivesCanonicalEnvelope(line) {
  // Opponent-owned critical cells permanently block a P0 line.
  if (line.cells.some((cell) => p1Critical.has(cellKey(cell)))) return false;

  // A terminal line at the maximal-delay horizon must contain the newly placed
  // stone.  Gravity restricts that landing to the top q rows, and a critical
  // cell already consumed by either player cannot be the final landing.
  return line.cells.some((cell) =>
    cell.y >= minimumFinalLandingRow
    && !p0Critical.has(cellKey(cell))
    && !p1Critical.has(cellKey(cell)));
}

const canonicalTerminalEnvelope = lines.filter(survivesCanonicalEnvelope);
const canonicalEnvelopeDimension = canonicalTerminalEnvelope.length;

// The central bridge result: two independently generated empty-board objects
// have the same derived cardinality, without either cardinality being supplied.
assert.equal(canonicalEnvelopeDimension, structuralMiddle);

// Independent arithmetic forms already discovered by the target-free incidence
// theorem remain exact at this bridge boundary.
assert.equal(structuralMiddle, W * K);
assert.equal(structuralMiddle, (W * (W + 1)) / TURN_MODULUS);

const orientationCounts = Object.fromEntries(
  [...new Set(DIRECTIONS.map(([dx, dy]) => `${dx},${dy}`))]
    .map((key) => [key, canonicalTerminalEnvelope.filter((line) => `${line.dx},${line.dy}` === key).length]));

console.log(`EMPTY_BOARD_CANONICAL_MIDDLE_BRIDGE=${JSON.stringify({
  kind: 'standard7x6-empty-board-canonical-middle-bridge-v1',
  proved: true,
  primitives: {
    turnModulus: TURN_MODULUS,
    connectArity: K,
    boardHeight: H,
    boardWidth: W,
  },
  generatedIncidence: {
    winningLineDimension: L,
    imageDimension,
    kernelDimension,
    structuralMiddle,
  },
  canonicalCriticalStructure: {
    reflectionFixedColumns,
    criticalColumn,
    earliestP0TerminalPly,
    criticalPrefixPly,
    p0CriticalCells: [...p0Critical],
    p1CriticalCells: [...p1Critical],
    pairedPhaseDisplacement: 'zero for every complete same-column two-ply pair',
  },
  maximalDelayBoundary: {
    latestPossibleP0TerminalPly,
    emptyCellsImmediatelyBeforeTerminal,
    minimumFinalLandingRow,
  },
  canonicalTerminalEnvelope: {
    cardinality: canonicalEnvelopeDimension,
    orientationCounts,
    equalsStructuralMiddle: canonicalEnvelopeDimension === structuralMiddle,
  },
  theoremBoundary: 'Searchless empty-board structural equality only. It does not yet prove that distance-optimal play must realize the canonical critical stack or attain the maximal-delay horizon; that selection theorem remains open.',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
})}`);
