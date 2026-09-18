import { createConnectWinningLines } from './geometry.mjs';
import { createBsfpSupportLatticeProfile } from './support-lattice.mjs';

function ownershipMask(value, label) {
  if (typeof value !== 'bigint' || value < 0n) throw new RangeError(`${label} must be a nonnegative bigint mask`);
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

function orderedUnique(masks, descending) {
  if (!Array.isArray(masks)) throw new TypeError('antichain masks must be an array');
  const unique = new Set();
  for (let index = 0; index < masks.length; index += 1) unique.add(ownershipMask(masks[index], `masks[${index}]`));
  return [...unique].sort((left, right) => {
    const delta = popcount(left) - popcount(right);
    if (delta !== 0) return descending ? -delta : delta;
    return left < right ? -1 : left > right ? 1 : 0;
  });
}

/** Minimal generators of an upward-closed set under P0 ownership inclusion. */
export function normalizeMinimalOwnershipAntichain(masks) {
  const ordered = orderedUnique(masks, false);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) {
      if ((retained & ~candidate) === 0n) continue outer;
    }
    result.push(candidate);
  }
  return Object.freeze(result);
}

/** Maximal generators of a downward-closed set under P0 ownership inclusion. */
export function normalizeMaximalOwnershipAntichain(masks) {
  const ordered = orderedUnique(masks, true);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) {
      if ((candidate & ~retained) === 0n) continue outer;
    }
    result.push(candidate);
  }
  return Object.freeze(result);
}

function unionUpward(left, right) {
  return normalizeMinimalOwnershipAntichain([...left, ...right]);
}

function unionDownward(left, right) {
  return normalizeMaximalOwnershipAntichain([...left, ...right]);
}

function intersectUpward(left, right) {
  if (left.length === 0 || right.length === 0) return Object.freeze([]);
  const result = [];
  for (const a of left) for (const b of right) result.push(a | b);
  return normalizeMinimalOwnershipAntichain(result);
}

function intersectDownward(left, right) {
  if (left.length === 0 || right.length === 0) return Object.freeze([]);
  const result = [];
  for (const a of left) for (const b of right) result.push(a & b);
  return normalizeMaximalOwnershipAntichain(result);
}

function cofactorUpward(frontier, landingBit, mover) {
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) result.push(mask & ~landingBit);
  } else {
    for (const mask of frontier) if ((mask & landingBit) === 0n) result.push(mask);
  }
  return normalizeMinimalOwnershipAntichain(result);
}

function cofactorDownward(frontier, landingBit, mover) {
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) if ((mask & landingBit) !== 0n) result.push(mask & ~landingBit);
  } else {
    for (const mask of frontier) result.push(mask & ~landingBit);
  }
  return normalizeMaximalOwnershipAntichain(result);
}

/** Downset minus an upset. Each forbidden minimal term must lose at least one owned bit. */
function subtractUpwardFromDownward(downward, forbiddenUpward) {
  if (downward.length === 0 || forbiddenUpward.length === 0) return Object.freeze(downward.slice());
  const result = [];
  for (const cap of downward) {
    let candidates = [cap];
    for (const forbidden of forbiddenUpward) {
      const next = [];
      for (const candidate of candidates) {
        if ((forbidden & ~candidate) !== 0n) {
          next.push(candidate);
          continue;
        }
        for (let bits = forbidden; bits !== 0n; bits &= bits - 1n) {
          const bit = bits & -bits;
          next.push(candidate & ~bit);
        }
      }
      candidates = normalizeMaximalOwnershipAntichain(next);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMaximalOwnershipAntichain(result);
}

/** Upset minus a downset. Each forbidden maximal cap must gain an owned bit outside that cap. */
function subtractDownwardFromUpward(upward, forbiddenDownward, universeMask) {
  if (upward.length === 0 || forbiddenDownward.length === 0) return Object.freeze(upward.slice());
  const result = [];
  for (const base of upward) {
    let candidates = [base];
    for (const forbidden of forbiddenDownward) {
      const next = [];
      for (const candidate of candidates) {
        if ((candidate & ~forbidden) !== 0n) {
          next.push(candidate);
          continue;
        }
        const available = universeMask & ~forbidden;
        for (let bits = available; bits !== 0n; bits &= bits - 1n) {
          const bit = bits & -bits;
          next.push(candidate | bit);
        }
      }
      candidates = normalizeMinimalOwnershipAntichain(next);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMinimalOwnershipAntichain(result);
}

function supportUniverseMask(heights, columns) {
  let mask = 0n;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < heights[column]; row += 1) {
      mask |= 1n << BigInt(row * columns + column);
    }
  }
  return mask;
}

function buildLineIncidence(lineMasks, cellCount) {
  const incidence = Array.from({ length: cellCount }, () => []);
  for (const lineMask of lineMasks) {
    for (let cell = 0; cell < cellCount; cell += 1) {
      if ((lineMask & (1n << BigInt(cell))) !== 0n) incidence[cell].push(lineMask);
    }
  }
  return Object.freeze(incidence.map((entry) => Object.freeze(entry)));
}

function assertFrontierUniverse(frontier, universeMask, label) {
  for (const mask of frontier) {
    if ((mask & ~universeMask) !== 0n) throw new Error(`${label} escaped its support universe`);
  }
}

function frontiersOverlap(wins, losses) {
  for (const win of wins) for (const loss of losses) if ((win & ~loss) === 0n) return true;
  return false;
}

export function classifyOwnershipAntichainWdl({ wins, losses }, p0OwnershipMask) {
  const p0 = ownershipMask(p0OwnershipMask, 'p0OwnershipMask');
  const win = wins.some((minimum) => (minimum & ~p0) === 0n);
  const loss = losses.some((maximum) => (p0 & ~maximum) === 0n);
  if (win && loss) throw new Error('ownership antichain frontiers overlap');
  return win ? 1 : loss ? -1 : 0;
}

/**
 * Direct BSFP W/D/L over support-conditioned P0-ownership antichains.
 *
 * This is a bottom-up symbolic fixed point. It does not enumerate physical
 * colored board states and does not recursively traverse legal move trees.
 */
export function solveBsfpOwnershipAntichainWdl({ columns, rows, connect }) {
  const support = createBsfpSupportLatticeProfile({ columns, rows, connect });
  const cellCount = columns * rows;
  const lines = createConnectWinningLines({ columns, rows, connect });
  const lineMasks = Object.freeze(lines.map((line) => {
    let mask = 0n;
    for (const cell of line) mask |= 1n << BigInt(cell);
    return mask;
  }));
  const incidence = buildLineIncidence(lineMasks, cellCount);
  const winFrontiers = new Array(support.itemCapacity);
  const lossFrontiers = new Array(support.itemCapacity);
  let totalWinRecords = 0;
  let totalLossRecords = 0;
  let maximumWinFrontier = 0;
  let maximumLossFrontier = 0;
  let terminalWinSubtractions = 0;
  let terminalLossSubtractions = 0;

  for (let rank = support.maxRank; rank >= 0; rank -= 1) {
    for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
      if (support.ranks[supportIndex] !== rank) continue;
      const heights = support.decodeHeights(supportIndex);
      const mover = rank & 1;
      const universeMask = supportUniverseMask(heights, columns);
      let aggregateWins = null;
      let aggregateLosses = null;

      for (let column = 0; column < columns; column += 1) {
        const row = heights[column];
        if (row >= rows) continue;
        const landingCell = row * columns + column;
        const landingBit = 1n << BigInt(landingCell);
        const childSupportIndex = supportIndex + support.weights[column];
        const childWins = winFrontiers[childSupportIndex];
        const childLosses = lossFrontiers[childSupportIndex];
        if (childWins === undefined || childLosses === undefined) throw new Error('ownership antichain rank order is incomplete');

        let moveWins = cofactorUpward(childWins, landingBit, mover);
        let moveLosses = cofactorDownward(childLosses, landingBit, mover);

        if (mover === 0) {
          const terminalWins = [];
          for (const lineMask of incidence[landingCell]) {
            const requiredP0 = lineMask & ~landingBit;
            if ((requiredP0 & ~universeMask) === 0n) terminalWins.push(requiredP0);
          }
          const terminalWinFrontier = normalizeMinimalOwnershipAntichain(terminalWins);
          if (terminalWinFrontier.length > 0) {
            moveLosses = subtractUpwardFromDownward(moveLosses, terminalWinFrontier);
            terminalWinSubtractions += 1;
            moveWins = unionUpward(moveWins, terminalWinFrontier);
          }
        } else {
          const terminalLosses = [];
          for (const lineMask of incidence[landingCell]) {
            const requiredP1 = lineMask & ~landingBit;
            if ((requiredP1 & ~universeMask) === 0n) terminalLosses.push(universeMask & ~requiredP1);
          }
          const terminalLossFrontier = normalizeMaximalOwnershipAntichain(terminalLosses);
          if (terminalLossFrontier.length > 0) {
            moveWins = subtractDownwardFromUpward(moveWins, terminalLossFrontier, universeMask);
            terminalLossSubtractions += 1;
            moveLosses = unionDownward(moveLosses, terminalLossFrontier);
          }
        }

        if (aggregateWins === null) {
          aggregateWins = moveWins;
          aggregateLosses = moveLosses;
        } else if (mover === 0) {
          aggregateWins = unionUpward(aggregateWins, moveWins);
          aggregateLosses = intersectDownward(aggregateLosses, moveLosses);
        } else {
          aggregateWins = intersectUpward(aggregateWins, moveWins);
          aggregateLosses = unionDownward(aggregateLosses, moveLosses);
        }
      }

      const wins = aggregateWins ?? Object.freeze([]);
      const losses = aggregateLosses ?? Object.freeze([]);
      assertFrontierUniverse(wins, universeMask, 'Win frontier');
      assertFrontierUniverse(losses, universeMask, 'Loss frontier');
      if (frontiersOverlap(wins, losses)) throw new Error(`ownership antichain contradiction at support ${supportIndex}`);
      winFrontiers[supportIndex] = wins;
      lossFrontiers[supportIndex] = losses;
      totalWinRecords += wins.length;
      totalLossRecords += losses.length;
      maximumWinFrontier = Math.max(maximumWinFrontier, wins.length);
      maximumLossFrontier = Math.max(maximumLossFrontier, losses.length);
    }
  }

  const rootWdl = classifyOwnershipAntichainWdl({ wins: winFrontiers[0], losses: lossFrontiers[0] }, 0n);

  return Object.freeze({
    kind: 'connect4-bsfp-ownership-antichain-wdl-reference',
    columns,
    rows,
    connect,
    support,
    winningLineCount: lineMasks.length,
    rootWdl,
    stats: Object.freeze({
      totalWinRecords,
      totalLossRecords,
      totalBoundaryRecords: totalWinRecords + totalLossRecords,
      maximumWinFrontier,
      maximumLossFrontier,
      terminalWinSubtractions,
      terminalLossSubtractions,
    }),
    evaluate({ heights, p0OwnershipMask }) {
      const supportIndex = support.encodeHeights(heights);
      const universeMask = supportUniverseMask(heights, columns);
      const p0 = ownershipMask(p0OwnershipMask, 'p0OwnershipMask');
      if ((p0 & ~universeMask) !== 0n) throw new RangeError('p0OwnershipMask contains cells outside the supplied support');
      return classifyOwnershipAntichainWdl({ wins: winFrontiers[supportIndex], losses: lossFrontiers[supportIndex] }, p0);
    },
    frontierAt(supportIndex) {
      if (!Number.isInteger(supportIndex) || supportIndex < 0 || supportIndex >= support.itemCapacity) throw new RangeError('supportIndex is out of range');
      return Object.freeze({ wins: winFrontiers[supportIndex], losses: lossFrontiers[supportIndex] });
    },
  });
}
