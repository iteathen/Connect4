import { createConnectWinningLines } from './geometry.mjs';
import { createBsfpSupportLatticeProfile } from './support-lattice.mjs';
import { ExactMtbdd } from './symbolic-mtbdd.mjs';

function buildLineIncidence(lines, cellCount) {
  const incidence = Array.from({ length: cellCount }, () => []);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    for (const cell of lines[lineIndex]) incidence[cell].push(lineIndex);
  }
  return Object.freeze(incidence.map((entry) => Object.freeze(entry)));
}

function assertOwnershipBits(bits, cellCount) {
  if (!bits || typeof bits.length !== 'number' || bits.length < cellCount) {
    throw new RangeError('ownershipBits must cover the complete geometry');
  }
}

export function solveBsfpSymbolicWdl({ columns, rows, connect }) {
  const support = createBsfpSupportLatticeProfile({ columns, rows, connect });
  const cellCount = columns * rows;
  const lines = createConnectWinningLines({ columns, rows, connect });
  const incidence = buildLineIncidence(lines, cellCount);
  const manager = new ExactMtbdd();
  const roots = new Array(support.itemCapacity);
  const FALSE = manager.terminal(0);
  const DRAW = manager.terminal(0);

  function immediateWinPredicate(heights, landingCell, mover) {
    let anyLine = FALSE;
    for (const lineIndex of incidence[landingCell]) {
      const line = lines[lineIndex];
      let predicate = manager.terminal(1);
      let possible = true;
      for (const cell of line) {
        if (cell === landingCell) continue;
        const column = cell % columns;
        const row = Math.floor(cell / columns);
        if (heights[column] <= row) {
          possible = false;
          break;
        }
        predicate = manager.and(predicate, manager.literal(cell, mover));
      }
      if (possible) anyLine = manager.or(anyLine, predicate);
    }
    return anyLine;
  }

  for (let rank = support.maxRank; rank >= 0; rank -= 1) {
    for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
      if (support.ranks[supportIndex] !== rank) continue;
      const heights = support.decodeHeights(supportIndex);
      const mover = rank & 1;
      let aggregate = null;

      for (let column = 0; column < columns; column += 1) {
        const row = heights[column];
        if (row >= rows) continue;

        const childSupportIndex = supportIndex + support.weights[column];
        const landingCell = row * columns + column;
        const child = roots[childSupportIndex];
        if (child === undefined) throw new Error('BSFP support rank order is incomplete');

        const continued = manager.restrict(child, landingCell, mover);
        const winsNow = immediateWinPredicate(heights, landingCell, mover);
        const terminalWin = manager.terminal(mover === 0 ? 1 : -1);
        const moveValue = manager.ite(winsNow, terminalWin, continued);

        aggregate = aggregate === null
          ? moveValue
          : mover === 0
            ? manager.max(aggregate, moveValue)
            : manager.min(aggregate, moveValue);
      }

      roots[supportIndex] = aggregate ?? DRAW;
    }
  }

  const rootNode = roots[0];
  if (!manager.isTerminal(rootNode)) {
    throw new Error('empty support skeleton must reduce to an exact W/D/L terminal');
  }

  return Object.freeze({
    kind: 'connect4-bsfp-symbolic-wdl-reference',
    columns,
    rows,
    connect,
    support,
    winningLineCount: lines.length,
    rootWdl: manager.terminalValue(rootNode),
    rootNode,
    stats: manager.stats(),
    evaluateNonterminal({ heights, ownershipBits }) {
      assertOwnershipBits(ownershipBits, cellCount);
      const supportIndex = support.encodeHeights(heights);
      return manager.evaluate(roots[supportIndex], ownershipBits);
    },
  });
}

export function solveBsfp4x3Connect3Reference() {
  return solveBsfpSymbolicWdl({ columns: 4, rows: 3, connect: 3 });
}
