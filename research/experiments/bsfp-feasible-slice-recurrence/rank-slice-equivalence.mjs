#!/usr/bin/env node

/**
 * Differential BSFP control for exact rank-slice pruning.
 *
 * The baseline recurrence keeps ownership antichains over the full support cube.
 * The slice recurrence discards records that cannot intersect the exact P0
 * cardinality slice at the current support rank:
 *
 *   minimal/upward generator g: popcount(g) <= ceil(rank / 2)
 *   maximal/downward cap c:    popcount(c) >= ceil(rank / 2)
 *
 * Every support and every exact-cardinality P0 ownership assignment is then
 * classified through both recurrences.  Any W/D/L mismatch is a falsifier.
 *
 * This is backward symbolic fixed-point evaluation, not minimax/Negamax search,
 * and consumes no solved-game oracle.
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
  const lines = [];
  const index = (column, row) => row * width + column;

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column <= width - connect; column += 1) {
      let mask = 0;
      for (let i = 0; i < connect; i += 1) mask |= 1 << index(column + i, row);
      lines.push(mask >>> 0);
    }
  }

  for (let column = 0; column < width; column += 1) {
    for (let row = 0; row <= height - connect; row += 1) {
      let mask = 0;
      for (let i = 0; i < connect; i += 1) mask |= 1 << index(column, row + i);
      lines.push(mask >>> 0);
    }
  }

  for (let column = 0; column <= width - connect; column += 1) {
    for (let row = 0; row <= height - connect; row += 1) {
      let mask = 0;
      for (let i = 0; i < connect; i += 1) mask |= 1 << index(column + i, row + i);
      lines.push(mask >>> 0);
    }
  }

  for (let column = 0; column <= width - connect; column += 1) {
    for (let row = connect - 1; row < height; row += 1) {
      let mask = 0;
      for (let i = 0; i < connect; i += 1) mask |= 1 << index(column + i, row - i);
      lines.push(mask >>> 0);
    }
  }

  return lines;
}

function chooseSubsets(universeMask, count) {
  const cells = [];
  forEachSetCell(universeMask, (cell) => cells.push(cell));
  const result = [];

  function visit(position, remaining, mask) {
    if (remaining === 0) {
      result.push(mask >>> 0);
      return;
    }
    if (cells.length - position < remaining) return;
    visit(position + 1, remaining - 1, mask | (1 << cells[position]));
    visit(position + 1, remaining, mask);
  }

  visit(0, count, 0);
  return result;
}

function normalizeMinimal(masks, legalP0Count, sliced, stats) {
  const ordered = [...new Set(masks)].sort((a, b) => popcount(a) - popcount(b) || a - b);
  const result = [];
  outer: for (const candidate of ordered) {
    if (sliced && popcount(candidate) > legalP0Count) {
      stats.prunedRecords += 1;
      continue;
    }
    for (const retained of result) if (subset(retained, candidate)) continue outer;
    result.push(candidate);
  }
  return result;
}

function normalizeMaximal(masks, legalP0Count, sliced, stats) {
  const ordered = [...new Set(masks)].sort((a, b) => popcount(b) - popcount(a) || a - b);
  const result = [];
  outer: for (const candidate of ordered) {
    if (sliced && popcount(candidate) < legalP0Count) {
      stats.prunedRecords += 1;
      continue;
    }
    for (const retained of result) if (subset(candidate, retained)) continue outer;
    result.push(candidate);
  }
  return result;
}

function unionUpward(left, right, k0, sliced, stats) {
  return normalizeMinimal([...left, ...right], k0, sliced, stats);
}

function unionDownward(left, right, k0, sliced, stats) {
  return normalizeMaximal([...left, ...right], k0, sliced, stats);
}

function intersectUpward(left, right, k0, sliced, stats) {
  const candidates = [];
  for (const a of left) {
    for (const b of right) {
      const candidate = (a | b) >>> 0;
      stats.pairCandidates += 1;
      if (sliced && popcount(candidate) > k0) {
        stats.prunedBeforeNormalize += 1;
        continue;
      }
      candidates.push(candidate);
    }
  }
  return normalizeMinimal(candidates, k0, sliced, stats);
}

function intersectDownward(left, right, k0, sliced, stats) {
  const candidates = [];
  for (const a of left) {
    for (const b of right) {
      const candidate = (a & b) >>> 0;
      stats.pairCandidates += 1;
      if (sliced && popcount(candidate) < k0) {
        stats.prunedBeforeNormalize += 1;
        continue;
      }
      candidates.push(candidate);
    }
  }
  return normalizeMaximal(candidates, k0, sliced, stats);
}

function cofactorUpward(frontier, landingCell, mover, k0, sliced, stats) {
  const bit = 1 << landingCell;
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) result.push((mask & ~bit) >>> 0);
  } else {
    for (const mask of frontier) if ((mask & bit) === 0) result.push(mask);
  }
  return normalizeMinimal(result, k0, sliced, stats);
}

function cofactorDownward(frontier, landingCell, mover, k0, sliced, stats) {
  const bit = 1 << landingCell;
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) if ((mask & bit) !== 0) result.push((mask & ~bit) >>> 0);
  } else {
    for (const mask of frontier) result.push((mask & ~bit) >>> 0);
  }
  return normalizeMaximal(result, k0, sliced, stats);
}

function subtractUpwardFromDownward(downward, forbiddenUpward, k0, sliced, stats) {
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
      candidates = normalizeMaximal(next, k0, sliced, stats);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }

  return normalizeMaximal(result, k0, sliced, stats);
}

function subtractDownwardFromUpward(upward, forbiddenDownward, universeMask, k0, sliced, stats) {
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
        const available = universeMask & ~forbidden;
        forEachSetCell(available, (cell) => next.push((candidate | (1 << cell)) >>> 0));
      }
      candidates = normalizeMinimal(next, k0, sliced, stats);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }

  return normalizeMinimal(result, k0, sliced, stats);
}

function createSupports(width, height) {
  const result = [];
  const heights = new Array(width).fill(0);

  function visit(column) {
    if (column === width) {
      const stored = heights.slice();
      let universeMask = 0;
      let rank = 0;
      for (let c = 0; c < width; c += 1) {
        for (let r = 0; r < stored[c]; r += 1) {
          universeMask |= 1 << (r * width + c);
          rank += 1;
        }
      }
      result.push({ heights: stored, universeMask: universeMask >>> 0, rank, key: stored.join(",") });
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

function solveBsfp(width, height, connect, sliced) {
  if (width * height >= 31) throw new RangeError("experiment uses 32-bit masks");

  const lineMasks = createWinningLineMasks(width, height, connect);
  const incidence = Array.from({ length: width * height }, () => []);
  for (const lineMask of lineMasks) forEachSetCell(lineMask, (cell) => incidence[cell].push(lineMask));

  const supports = createSupports(width, height);
  const supportByKey = new Map(supports.map((support, index) => [support.key, index]));
  const byRank = Array.from({ length: width * height + 1 }, () => []);
  supports.forEach((support, index) => byRank[support.rank].push(index));

  const frontiers = new Array(supports.length);
  const stats = {
    pairCandidates: 0,
    prunedBeforeNormalize: 0,
    prunedRecords: 0,
    maximumWinFrontier: 0,
    maximumLossFrontier: 0,
  };

  for (let rank = width * height; rank >= 0; rank -= 1) {
    const legalP0Count = Math.ceil(rank / 2);
    const mover = rank & 1;

    for (const supportIndex of byRank[rank]) {
      const support = supports[supportIndex];
      const universeMask = support.universeMask;
      let aggregateWins = null;
      let aggregateLosses = null;

      for (let column = 0; column < width; column += 1) {
        const row = support.heights[column];
        if (row >= height) continue;

        const childHeights = support.heights.slice();
        childHeights[column] += 1;
        const child = frontiers[supportByKey.get(childHeights.join(","))];
        const landingCell = row * width + column;

        let moveWins = cofactorUpward(child.wins, landingCell, mover, legalP0Count, sliced, stats);
        let moveLosses = cofactorDownward(child.losses, landingCell, mover, legalP0Count, sliced, stats);

        if (mover === 0) {
          const terminalWins = [];
          for (const lineMask of incidence[landingCell]) {
            const requiredP0 = lineMask & ~(1 << landingCell);
            if (subset(requiredP0, universeMask)) terminalWins.push(requiredP0 >>> 0);
          }
          const terminalFrontier = normalizeMinimal(terminalWins, legalP0Count, sliced, stats);
          if (terminalFrontier.length !== 0) {
            moveLosses = subtractUpwardFromDownward(moveLosses, terminalFrontier, legalP0Count, sliced, stats);
            moveWins = unionUpward(moveWins, terminalFrontier, legalP0Count, sliced, stats);
          }
        } else {
          const terminalLosses = [];
          for (const lineMask of incidence[landingCell]) {
            const requiredP1 = lineMask & ~(1 << landingCell);
            if (subset(requiredP1, universeMask)) terminalLosses.push((universeMask & ~requiredP1) >>> 0);
          }
          const terminalFrontier = normalizeMaximal(terminalLosses, legalP0Count, sliced, stats);
          if (terminalFrontier.length !== 0) {
            moveWins = subtractDownwardFromUpward(moveWins, terminalFrontier, universeMask, legalP0Count, sliced, stats);
            moveLosses = unionDownward(moveLosses, terminalFrontier, legalP0Count, sliced, stats);
          }
        }

        if (aggregateWins === null) {
          aggregateWins = moveWins;
          aggregateLosses = moveLosses;
        } else if (mover === 0) {
          aggregateWins = unionUpward(aggregateWins, moveWins, legalP0Count, sliced, stats);
          aggregateLosses = intersectDownward(aggregateLosses, moveLosses, legalP0Count, sliced, stats);
        } else {
          aggregateWins = intersectUpward(aggregateWins, moveWins, legalP0Count, sliced, stats);
          aggregateLosses = unionDownward(aggregateLosses, moveLosses, legalP0Count, sliced, stats);
        }
      }

      const frontier = {
        wins: aggregateWins ?? [],
        losses: aggregateLosses ?? [],
      };
      frontiers[supportIndex] = frontier;
      stats.maximumWinFrontier = Math.max(stats.maximumWinFrontier, frontier.wins.length);
      stats.maximumLossFrontier = Math.max(stats.maximumLossFrontier, frontier.losses.length);
    }
  }

  return { supports, frontiers, stats };
}

function classify(frontier, p0Ownership) {
  const win = frontier.wins.some((minimum) => subset(minimum, p0Ownership));
  const loss = frontier.losses.some((maximum) => subset(p0Ownership, maximum));
  if (win && loss) throw new Error("frontier overlap");
  return win ? 1 : loss ? -1 : 0;
}

function compareBoard(width, height, connect) {
  const baseline = solveBsfp(width, height, connect, false);
  const sliced = solveBsfp(width, height, connect, true);

  let checkedAssignments = 0;
  let mismatches = 0;
  let supportsWithDifferentFrontiers = 0;
  const byRank = {};

  for (let index = 0; index < baseline.supports.length; index += 1) {
    const support = baseline.supports[index];
    const legalP0Count = Math.ceil(support.rank / 2);
    const assignments = chooseSubsets(support.universeMask, legalP0Count);
    const frontierDiffers = JSON.stringify(baseline.frontiers[index]) !== JSON.stringify(sliced.frontiers[index]);
    if (frontierDiffers) supportsWithDifferentFrontiers += 1;

    const rank = byRank[support.rank] ?? {
      supports: 0,
      assignments: 0,
      mismatches: 0,
      supportsWithDifferentFrontiers: 0,
    };
    rank.supports += 1;
    rank.assignments += assignments.length;
    if (frontierDiffers) rank.supportsWithDifferentFrontiers += 1;

    for (const assignment of assignments) {
      checkedAssignments += 1;
      const left = classify(baseline.frontiers[index], assignment);
      const right = classify(sliced.frontiers[index], assignment);
      if (left !== right) {
        mismatches += 1;
        rank.mismatches += 1;
      }
    }

    byRank[support.rank] = rank;
  }

  return {
    width,
    height,
    connect,
    checkedAssignments,
    mismatches,
    supportsWithDifferentFrontiers,
    baseline: baseline.stats,
    sliced: sliced.stats,
    byRank,
  };
}

const results = [
  compareBoard(4, 3, 3),
  compareBoard(4, 4, 4),
  compareBoard(5, 3, 4),
];

if (results.some((result) => result.mismatches !== 0)) process.exitCode = 1;
process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
