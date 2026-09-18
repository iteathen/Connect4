import { createConnectWinningLines } from './geometry.mjs';

function nonnegativeSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`${label} must be a nonnegative safe integer`);
  return value;
}

function player(value, label = 'player') {
  if (value !== 0 && value !== 1) throw new RangeError(`${label} must be 0 or 1`);
  return value;
}

function requirementMask(value, label = 'requirement') {
  if (typeof value !== 'bigint' || value <= 0n) throw new RangeError(`${label} must be a nonzero bigint mask`);
  return value;
}

function popcount(mask) {
  let value = mask;
  let count = 0;
  while (value !== 0n) {
    value &= value - 1n;
    count += 1;
  }
  return count;
}

function requirementOrder(left, right) {
  const countDelta = popcount(left) - popcount(right);
  if (countDelta !== 0) return countDelta;
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizedCopy(requirements, label) {
  if (!Array.isArray(requirements)) throw new TypeError(`${label} must be an array of bigint masks`);
  const unique = new Set();
  for (let index = 0; index < requirements.length; index += 1) {
    unique.add(requirementMask(requirements[index], `${label}[${index}]`));
  }
  const ordered = [...unique].sort(requirementOrder);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) {
      if ((retained & ~candidate) === 0n) continue outer;
    }
    result.push(candidate);
  }
  return Object.freeze(result);
}

export function normalizeResidualRequirements(requirements) {
  return normalizedCopy(requirements, 'requirements');
}

/** Exact monotone-DNF implication for normalized residual winning requirements. */
export function residualRequirementsImply(antecedent, consequent) {
  const left = normalizedCopy(antecedent, 'antecedent');
  const right = normalizedCopy(consequent, 'consequent');
  if (left.length === 0) return true;
  if (right.length === 0) return false;
  for (const leftTerm of left) {
    let covered = false;
    for (const rightTerm of right) {
      if ((rightTerm & ~leftTerm) === 0n) {
        covered = true;
        break;
      }
    }
    if (!covered) return false;
  }
  return true;
}

export function residualRequirementsKey(requirements) {
  return normalizedCopy(requirements, 'requirements').map((mask) => mask.toString(16)).join('.');
}

export function createResidualState({ supportIndex, sideToMove, p0Requirements, p1Requirements }) {
  return Object.freeze({
    supportIndex: nonnegativeSafeInteger(supportIndex, 'supportIndex'),
    sideToMove: player(sideToMove, 'sideToMove'),
    p0Requirements: normalizedCopy(p0Requirements, 'p0Requirements'),
    p1Requirements: normalizedCopy(p1Requirements, 'p1Requirements'),
  });
}

export function residualStateKey(state) {
  const normalized = createResidualState(state);
  return `${normalized.supportIndex}|${normalized.sideToMove}|${residualRequirementsKey(normalized.p0Requirements)}/${residualRequirementsKey(normalized.p1Requirements)}`;
}

/** Candidate >= reference in the exact P0-favourable residual order. */
export function residualStateAtLeastAsFavorableToP0(candidate, reference) {
  const left = createResidualState(candidate);
  const right = createResidualState(reference);
  if (left.supportIndex !== right.supportIndex || left.sideToMove !== right.sideToMove) {
    throw new RangeError('residual dominance requires identical support and side-to-move context');
  }
  return residualRequirementsImply(right.p0Requirements, left.p0Requirements)
    && residualRequirementsImply(left.p1Requirements, right.p1Requirements);
}

export function createResidualWinspaceProfile({ columns, rows, connect }) {
  if (!Number.isSafeInteger(columns) || columns < 1) throw new RangeError('columns must be a positive safe integer');
  if (!Number.isSafeInteger(rows) || rows < 1) throw new RangeError('rows must be a positive safe integer');
  if (!Number.isSafeInteger(connect) || connect < 1) throw new RangeError('connect must be a positive safe integer');
  const cellCount = columns * rows;
  if (!Number.isSafeInteger(cellCount)) throw new RangeError('cell count must fit a safe integer');
  const lines = createConnectWinningLines({ columns, rows, connect });
  const winningLineMasks = Object.freeze(lines.map((line) => {
    let mask = 0n;
    for (const cell of line) mask |= 1n << BigInt(cell);
    return mask;
  }));
  const initialRequirements = normalizeResidualRequirements(winningLineMasks);

  function landingBit(landingCell) {
    nonnegativeSafeInteger(landingCell, 'landingCell');
    if (landingCell >= cellCount) throw new RangeError('landingCell is outside the geometry');
    return 1n << BigInt(landingCell);
  }

  function applyPlacement({ p0Requirements, p1Requirements, mover, landingCell }) {
    const side = player(mover, 'mover');
    const bit = landingBit(landingCell);
    const own = normalizedCopy(side === 0 ? p0Requirements : p1Requirements, 'moverRequirements');
    const opponent = normalizedCopy(side === 0 ? p1Requirements : p0Requirements, 'opponentRequirements');
    const nextOwn = [];

    for (const requirement of own) {
      const reduced = requirement & ~bit;
      if (reduced === 0n) {
        return Object.freeze({
          kind: 'terminal-win',
          winner: side,
          landingCell,
        });
      }
      nextOwn.push(reduced);
    }

    const nextOpponent = opponent.filter((requirement) => (requirement & bit) === 0n);
    const normalizedOwn = normalizeResidualRequirements(nextOwn);
    const normalizedOpponent = normalizeResidualRequirements(nextOpponent);
    const p0 = side === 0 ? normalizedOwn : normalizedOpponent;
    const p1 = side === 0 ? normalizedOpponent : normalizedOwn;

    return Object.freeze({
      kind: 'nonterminal',
      winner: null,
      landingCell,
      p0Requirements: p0,
      p1Requirements: p1,
      bilateralExhausted: p0.length === 0 && p1.length === 0,
    });
  }

  return Object.freeze({
    kind: 'connect4-bsfp-residual-winspace-profile',
    columns,
    rows,
    connect,
    cellCount,
    winningLineCount: lines.length,
    winningLineMasks,
    initialRequirements,
    landingBit,
    applyPlacement,
  });
}
