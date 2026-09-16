#!/usr/bin/env node

/**
 * Exact reference qualification for horizontal-reflection support quotienting.
 *
 * Solves each control twice:
 *   1. every support vector;
 *   2. one canonical representative from each reflection orbit.
 *
 * The quotient solver reflects a canonical child frontier back into the
 * physical orientation required by the representative parent before applying
 * the ordinary BSFP recurrence.  Every raw-support frontier is then compared
 * with the lifted quotient frontier.  Reflection-fixed supports are separately
 * checked for frontier-set invariance.
 */

function popcount(mask) {
  let value = mask >>> 0;
  let count = 0;
  while (value !== 0) {
    value &= value - 1;
    count += 1;
  }
  return count;
}

function subset(left, right) {
  return (left & ~right) === 0;
}

function forEachSetCell(mask, callback) {
  let value = mask >>> 0;
  let cell = 0;
  while (value !== 0) {
    if ((value & 1) !== 0) callback(cell);
    value >>>= 1;
    cell += 1;
  }
}

function createWinningLineMasks(width, height, connect) {
  const result = [];
  const index = (column, row) => row * width + column;

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column <= width - connect; column += 1) {
      let mask = 0;
      for (let i = 0; i < connect; i += 1) mask |= 1 << index(column + i, row);
      result.push(mask >>> 0);
    }
  }
  for (let column = 0; column < width; column += 1) {
    for (let row = 0; row <= height - connect; row += 1) {
      let mask = 0;
      for (let i = 0; i < connect; i += 1) mask |= 1 << index(column, row + i);
      result.push(mask >>> 0);
    }
  }
  for (let column = 0; column <= width - connect; column += 1) {
    for (let row = 0; row <= height - connect; row += 1) {
      let mask = 0;
      for (let i = 0; i < connect; i += 1) mask |= 1 << index(column + i, row + i);
      result.push(mask >>> 0);
    }
  }
  for (let column = 0; column <= width - connect; column += 1) {
    for (let row = connect - 1; row < height; row += 1) {
      let mask = 0;
      for (let i = 0; i < connect; i += 1) mask |= 1 << index(column + i, row - i);
      result.push(mask >>> 0);
    }
  }
  return result;
}

function reflectMask(mask, width, height) {
  let reflected = 0;
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const source = row * width + column;
      if ((mask & (1 << source)) !== 0) reflected |= 1 << (row * width + (width - 1 - column));
    }
  }
  return reflected >>> 0;
}

function reflectHeights(heights) {
  return heights.slice().reverse();
}

function supportKey(heights) {
  return heights.join(",");
}

function canonicalizeHeights(heights) {
  const reflected = reflectHeights(heights);
  return supportKey(heights) <= supportKey(reflected)
    ? { heights: heights.slice(), reflected: false }
    : { heights: reflected, reflected: true };
}

function normalizeMinimal(masks) {
  const ordered = [...new Set(masks)].sort((a, b) => popcount(a) - popcount(b) || a - b);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (subset(retained, candidate)) continue outer;
    result.push(candidate);
  }
  return result;
}

function normalizeMaximal(masks) {
  const ordered = [...new Set(masks)].sort((a, b) => popcount(b) - popcount(a) || a - b);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (subset(candidate, retained)) continue outer;
    result.push(candidate);
  }
  return result;
}

function intersectUpward(left, right, stats) {
  const candidates = [];
  for (const a of left) for (const b of right) {
    candidates.push((a | b) >>> 0);
    stats.pairCandidates += 1;
  }
  return normalizeMinimal(candidates);
}

function intersectDownward(left, right, stats) {
  const candidates = [];
  for (const a of left) for (const b of right) {
    candidates.push((a & b) >>> 0);
    stats.pairCandidates += 1;
  }
  return normalizeMaximal(candidates);
}

function cofactorUpward(frontier, landingCell, mover) {
  const bit = 1 << landingCell;
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) result.push((mask & ~bit) >>> 0);
  } else {
    for (const mask of frontier) if ((mask & bit) === 0) result.push(mask);
  }
  return normalizeMinimal(result);
}

function cofactorDownward(frontier, landingCell, mover) {
  const bit = 1 << landingCell;
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) if ((mask & bit) !== 0) result.push((mask & ~bit) >>> 0);
  } else {
    for (const mask of frontier) result.push((mask & ~bit) >>> 0);
  }
  return normalizeMaximal(result);
}

function subtractUpwardFromDownward(downward, forbiddenUpward) {
  if (downward.length === 0 || forbiddenUpward.length === 0) return downward.slice();
  const result = [];
  for (const cap of downward) {
    let candidates = [cap];
    for (const forbidden of forbiddenUpward) {
      const next = [];
      for (const candidate of candidates) {
        if (!subset(forbidden, candidate)) {
          next.push(candidate);
          continue;
        }
        forEachSetCell(forbidden, (cell) => next.push((candidate & ~(1 << cell)) >>> 0));
      }
      candidates = normalizeMaximal(next);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMaximal(result);
}

function subtractDownwardFromUpward(upward, forbiddenDownward, universeMask) {
  if (upward.length === 0 || forbiddenDownward.length === 0) return upward.slice();
  const result = [];
  for (const base of upward) {
    let candidates = [base];
    for (const forbidden of forbiddenDownward) {
      const next = [];
      for (const candidate of candidates) {
        if (!subset(candidate, forbidden)) {
          next.push(candidate);
          continue;
        }
        forEachSetCell(universeMask & ~forbidden, (cell) => next.push((candidate | (1 << cell)) >>> 0));
      }
      candidates = normalizeMinimal(next);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMinimal(result);
}

function supportInfo(heights, width) {
  let universeMask = 0;
  let rank = 0;
  for (let column = 0; column < width; column += 1) {
    for (let row = 0; row < heights[column]; row += 1) {
      universeMask |= 1 << (row * width + column);
      rank += 1;
    }
  }
  return { heights: heights.slice(), universeMask: universeMask >>> 0, rank, key: supportKey(heights) };
}

function createSupports(width, height) {
  const result = [];
  const heights = new Array(width).fill(0);
  function visit(column) {
    if (column === width) {
      result.push(supportInfo(heights, width));
      return;
    }
    for (let value = 0; value <= height; value += 1) {
      heights[column] = value;
      visit(column + 1);
    }
  }
  visit(0);
  return result;
}

function prepare(width, height, connect) {
  const lineMasks = createWinningLineMasks(width, height, connect);
  const incidence = Array.from({ length: width * height }, () => []);
  for (const lineMask of lineMasks) forEachSetCell(lineMask, (cell) => incidence[cell].push(lineMask));
  const supports = createSupports(width, height);
  const supportByKey = new Map(supports.map((support, index) => [support.key, index]));
  const byRank = Array.from({ length: width * height + 1 }, () => []);
  supports.forEach((support, index) => byRank[support.rank].push(index));
  return { incidence, supports, supportByKey, byRank };
}

function solveSupport(support, getChild, width, height, incidence, stats) {
  const mover = support.rank & 1;
  const universeMask = support.universeMask;
  let aggregateWins = null;
  let aggregateLosses = null;

  for (let column = 0; column < width; column += 1) {
    const row = support.heights[column];
    if (row >= height) continue;

    const childHeights = support.heights.slice();
    childHeights[column] += 1;
    const child = getChild(childHeights);
    const landingCell = row * width + column;

    let moveWins = cofactorUpward(child.wins, landingCell, mover);
    let moveLosses = cofactorDownward(child.losses, landingCell, mover);

    if (mover === 0) {
      const terminalWins = [];
      for (const lineMask of incidence[landingCell]) {
        const requiredP0 = lineMask & ~(1 << landingCell);
        if (subset(requiredP0, universeMask)) terminalWins.push(requiredP0 >>> 0);
      }
      const terminalFrontier = normalizeMinimal(terminalWins);
      if (terminalFrontier.length !== 0) {
        moveLosses = subtractUpwardFromDownward(moveLosses, terminalFrontier);
        moveWins = normalizeMinimal([...moveWins, ...terminalFrontier]);
      }
    } else {
      const terminalLosses = [];
      for (const lineMask of incidence[landingCell]) {
        const requiredP1 = lineMask & ~(1 << landingCell);
        if (subset(requiredP1, universeMask)) terminalLosses.push((universeMask & ~requiredP1) >>> 0);
      }
      const terminalFrontier = normalizeMaximal(terminalLosses);
      if (terminalFrontier.length !== 0) {
        moveWins = subtractDownwardFromUpward(moveWins, terminalFrontier, universeMask);
        moveLosses = normalizeMaximal([...moveLosses, ...terminalFrontier]);
      }
    }

    if (aggregateWins === null) {
      aggregateWins = moveWins;
      aggregateLosses = moveLosses;
    } else if (mover === 0) {
      aggregateWins = normalizeMinimal([...aggregateWins, ...moveWins]);
      aggregateLosses = intersectDownward(aggregateLosses, moveLosses, stats);
    } else {
      aggregateWins = intersectUpward(aggregateWins, moveWins, stats);
      aggregateLosses = normalizeMaximal([...aggregateLosses, ...moveLosses]);
    }
  }

  return { wins: aggregateWins ?? [], losses: aggregateLosses ?? [] };
}

function reflectFrontier(frontier, width, height) {
  return {
    wins: normalizeMinimal(frontier.wins.map((mask) => reflectMask(mask, width, height))),
    losses: normalizeMaximal(frontier.losses.map((mask) => reflectMask(mask, width, height))),
  };
}

function solveFull(width, height, connect) {
  const prepared = prepare(width, height, connect);
  const frontiers = new Array(prepared.supports.length);
  const stats = { pairCandidates: 0, supportsSolved: 0 };

  for (let rank = width * height; rank >= 0; rank -= 1) {
    for (const supportIndex of prepared.byRank[rank]) {
      const support = prepared.supports[supportIndex];
      frontiers[supportIndex] = solveSupport(
        support,
        (childHeights) => frontiers[prepared.supportByKey.get(supportKey(childHeights))],
        width,
        height,
        prepared.incidence,
        stats,
      );
      stats.supportsSolved += 1;
    }
  }

  return { ...prepared, frontiers, stats };
}

function solveQuotient(width, height, connect) {
  const prepared = prepare(width, height, connect);
  const representatives = prepared.supports.filter((support) => !canonicalizeHeights(support.heights).reflected);
  const representativeByKey = new Map(representatives.map((support, index) => [support.key, index]));
  const byRank = Array.from({ length: width * height + 1 }, () => []);
  representatives.forEach((support, index) => byRank[support.rank].push(index));
  const frontiers = new Array(representatives.length);
  const stats = { pairCandidates: 0, supportsSolved: 0, reflectedChildLoads: 0 };

  for (let rank = width * height; rank >= 0; rank -= 1) {
    for (const representativeIndex of byRank[rank]) {
      const support = representatives[representativeIndex];
      frontiers[representativeIndex] = solveSupport(
        support,
        (childHeights) => {
          const canonical = canonicalizeHeights(childHeights);
          const child = frontiers[representativeByKey.get(supportKey(canonical.heights))];
          if (!canonical.reflected) return child;
          stats.reflectedChildLoads += 1;
          return reflectFrontier(child, width, height);
        },
        width,
        height,
        prepared.incidence,
        stats,
      );
      stats.supportsSolved += 1;
    }
  }

  return { ...prepared, representatives, representativeByKey, frontiers, stats };
}

function equalSet(left, right) {
  if (left.length !== right.length) return false;
  const a = [...left].sort((x, y) => x - y);
  const b = [...right].sort((x, y) => x - y);
  return a.every((value, index) => value === b[index]);
}

function compareBoard(width, height, connect) {
  const full = solveFull(width, height, connect);
  const quotient = solveQuotient(width, height, connect);
  let frontierMismatches = 0;
  let reflectionFixedSupports = 0;
  let fixedInvariantFailures = 0;

  for (const support of full.supports) {
    const canonical = canonicalizeHeights(support.heights);
    const stored = quotient.frontiers[quotient.representativeByKey.get(supportKey(canonical.heights))];
    const lifted = canonical.reflected ? reflectFrontier(stored, width, height) : stored;
    const authority = full.frontiers[full.supportByKey.get(support.key)];

    if (!equalSet(lifted.wins, authority.wins) || !equalSet(lifted.losses, authority.losses)) {
      frontierMismatches += 1;
    }

    if (supportKey(support.heights) === supportKey(reflectHeights(support.heights))) {
      reflectionFixedSupports += 1;
      const reflected = reflectFrontier(authority, width, height);
      if (!equalSet(reflected.wins, authority.wins) || !equalSet(reflected.losses, authority.losses)) {
        fixedInvariantFailures += 1;
      }
    }
  }

  return {
    width,
    height,
    connect,
    rawSupports: full.supports.length,
    orbitSupports: quotient.representatives.length,
    supportReduction: 1 - quotient.representatives.length / full.supports.length,
    fullPairCandidates: full.stats.pairCandidates,
    quotientPairCandidates: quotient.stats.pairCandidates,
    pairReduction: 1 - quotient.stats.pairCandidates / full.stats.pairCandidates,
    reflectedChildLoads: quotient.stats.reflectedChildLoads,
    frontierMismatches,
    reflectionFixedSupports,
    fixedInvariantFailures,
  };
}

const results = [
  compareBoard(4, 3, 3),
  compareBoard(4, 4, 4),
  compareBoard(5, 3, 4),
];

if (results.some((result) => result.frontierMismatches !== 0 || result.fixedInvariantFailures !== 0)) {
  process.exitCode = 1;
}
process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
