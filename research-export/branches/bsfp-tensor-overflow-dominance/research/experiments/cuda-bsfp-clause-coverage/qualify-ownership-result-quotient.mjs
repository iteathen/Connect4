import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';
import { createBsfpSupportLatticeProfile } from '../../../components/bsfp/support-lattice.mjs';
import {
  normalizeMaximalOwnershipAntichain,
  normalizeMinimalOwnershipAntichain,
  solveBsfpOwnershipAntichainWdl,
} from '../../../components/bsfp/ownership-antichain-solver.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 4, connect: 3 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

const WALL_CLOCK_LIMIT_MS = 30_000;
const RAW_PAIR_BUDGET = 1_000_000;
const SUPPORT_BUDGET = 4_000;

function sameFrontier(left, right) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) if (left[index] !== right[index]) return false;
  return true;
}

function assertSameFrontier(left, right, label) {
  if (!sameFrontier(left, right)) {
    throw new Error(`${label} mismatch: left=${left.length} right=${right.length}`);
  }
}

function createProductStats() {
  return {
    calls: 0,
    rawPairs: 0,
    absorbedRowEmits: 0,
    absorbedColumnEmits: 0,
    residualPairProducts: 0,
    generatedOperations: 0,
    exactResultClasses: 0,
    duplicateOccurrences: 0,
    callsWithDuplicates: 0,
    maximumGeneratedOperations: 0,
    maximumDuplicateOccurrences: 0,
  };
}

function createStats() {
  return {
    supportCount: 0,
    frontierMismatches: 0,
    absorptionQuotientMismatches: 0,
    upward: createProductStats(),
    downward: createProductStats(),
  };
}

function assertBudgets(stats, startedAt) {
  if (Date.now() - startedAt > WALL_CLOCK_LIMIT_MS) {
    throw new Error(`ownership result quotient wall-clock leash exceeded ${WALL_CLOCK_LIMIT_MS} ms`);
  }
  const rawPairs = stats.upward.rawPairs + stats.downward.rawPairs;
  if (rawPairs > RAW_PAIR_BUDGET) {
    throw new Error(`ownership result quotient raw-pair budget exceeded ${RAW_PAIR_BUDGET}`);
  }
  if (stats.supportCount > SUPPORT_BUDGET) {
    throw new Error(`ownership result quotient support budget exceeded ${SUPPORT_BUDGET}`);
  }
}

function intersectionCore(frontier) {
  let core = frontier[0];
  for (let index = 1; index < frontier.length; index += 1) core &= frontier[index];
  return core;
}

function unionEnvelope(frontier) {
  let envelope = 0n;
  for (const mask of frontier) envelope |= mask;
  return envelope;
}

function isSubset(left, right) {
  return (left & ~right) === 0n;
}

function finalizeGenerated(generated, normalize, productStats, label) {
  productStats.generatedOperations += generated.length;
  productStats.maximumGeneratedOperations = Math.max(productStats.maximumGeneratedOperations, generated.length);

  const absorptionFrontier = normalize(generated);
  const unique = [...new Set(generated)];
  const duplicates = generated.length - unique.length;
  productStats.exactResultClasses += unique.length;
  productStats.duplicateOccurrences += duplicates;
  productStats.maximumDuplicateOccurrences = Math.max(productStats.maximumDuplicateOccurrences, duplicates);
  if (duplicates > 0) productStats.callsWithDuplicates += 1;

  const quotientFrontier = normalize(unique);
  assertSameFrontier(absorptionFrontier, quotientFrontier, `${label} absorption-vs-result-quotient`);
  return quotientFrontier;
}

function intersectUpwardAbsorbedQuotiented(left, right, stats) {
  if (left.length === 0 || right.length === 0) return Object.freeze([]);
  const productStats = stats.upward;
  productStats.calls += 1;
  productStats.rawPairs += left.length * right.length;

  const coreA = intersectionCore(left);
  const coreB = intersectionCore(right);
  const absorbedRows = new Uint8Array(left.length);
  const absorbedColumns = new Uint8Array(right.length);
  const generated = [];

  for (let row = 0; row < left.length; row += 1) {
    const candidate = left[row] | coreB;
    for (let column = 0; column < right.length; column += 1) {
      if (!isSubset(right[column], candidate)) continue;
      absorbedRows[row] = 1;
      generated.push(candidate);
      productStats.absorbedRowEmits += 1;
      break;
    }
  }

  for (let column = 0; column < right.length; column += 1) {
    const candidate = right[column] | coreA;
    for (let row = 0; row < left.length; row += 1) {
      if (!isSubset(left[row], candidate)) continue;
      absorbedColumns[column] = 1;
      generated.push(candidate);
      productStats.absorbedColumnEmits += 1;
      break;
    }
  }

  for (let row = 0; row < left.length; row += 1) {
    if (absorbedRows[row]) continue;
    for (let column = 0; column < right.length; column += 1) {
      if (absorbedColumns[column]) continue;
      generated.push(left[row] | right[column]);
      productStats.residualPairProducts += 1;
    }
  }

  return finalizeGenerated(generated, normalizeMinimalOwnershipAntichain, productStats, 'upward');
}

function intersectDownwardAbsorbedQuotiented(left, right, stats) {
  if (left.length === 0 || right.length === 0) return Object.freeze([]);
  const productStats = stats.downward;
  productStats.calls += 1;
  productStats.rawPairs += left.length * right.length;

  const envA = unionEnvelope(left);
  const envB = unionEnvelope(right);
  const absorbedRows = new Uint8Array(left.length);
  const absorbedColumns = new Uint8Array(right.length);
  const generated = [];

  for (let row = 0; row < left.length; row += 1) {
    const candidate = left[row] & envB;
    for (let column = 0; column < right.length; column += 1) {
      if (!isSubset(candidate, right[column])) continue;
      absorbedRows[row] = 1;
      generated.push(candidate);
      productStats.absorbedRowEmits += 1;
      break;
    }
  }

  for (let column = 0; column < right.length; column += 1) {
    const candidate = right[column] & envA;
    for (let row = 0; row < left.length; row += 1) {
      if (!isSubset(candidate, left[row])) continue;
      absorbedColumns[column] = 1;
      generated.push(candidate);
      productStats.absorbedColumnEmits += 1;
      break;
    }
  }

  for (let row = 0; row < left.length; row += 1) {
    if (absorbedRows[row]) continue;
    for (let column = 0; column < right.length; column += 1) {
      if (absorbedColumns[column]) continue;
      generated.push(left[row] & right[column]);
      productStats.residualPairProducts += 1;
    }
  }

  return finalizeGenerated(generated, normalizeMaximalOwnershipAntichain, productStats, 'downward');
}

function unionUpward(left, right) {
  return normalizeMinimalOwnershipAntichain([...left, ...right]);
}

function unionDownward(left, right) {
  return normalizeMaximalOwnershipAntichain([...left, ...right]);
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
    for (let row = 0; row < heights[column]; row += 1) mask |= 1n << BigInt(row * columns + column);
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
  return incidence;
}

function solveCandidate({ columns, rows, connect, authority, stats, startedAt }) {
  const support = createBsfpSupportLatticeProfile({ columns, rows, connect });
  const lines = createConnectWinningLines({ columns, rows, connect });
  const lineMasks = lines.map((line) => {
    let mask = 0n;
    for (const cell of line) mask |= 1n << BigInt(cell);
    return mask;
  });
  const incidence = buildLineIncidence(lineMasks, columns * rows);
  const winFrontiers = new Array(support.itemCapacity);
  const lossFrontiers = new Array(support.itemCapacity);

  for (let rank = support.maxRank; rank >= 0; rank -= 1) {
    for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
      if (support.ranks[supportIndex] !== rank) continue;
      stats.supportCount += 1;
      assertBudgets(stats, startedAt);

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
        if (childWins === undefined || childLosses === undefined) throw new Error('candidate rank order is incomplete');

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
            moveLosses = unionDownward(moveLosses, terminalLossFrontier);
          }
        }

        if (aggregateWins === null) {
          aggregateWins = moveWins;
          aggregateLosses = moveLosses;
        } else if (mover === 0) {
          aggregateWins = unionUpward(aggregateWins, moveWins);
          aggregateLosses = intersectDownwardAbsorbedQuotiented(aggregateLosses, moveLosses, stats);
        } else {
          aggregateWins = intersectUpwardAbsorbedQuotiented(aggregateWins, moveWins, stats);
          aggregateLosses = unionDownward(aggregateLosses, moveLosses);
        }
      }

      const wins = aggregateWins ?? Object.freeze([]);
      const losses = aggregateLosses ?? Object.freeze([]);
      winFrontiers[supportIndex] = wins;
      lossFrontiers[supportIndex] = losses;

      const expected = authority.frontierAt(supportIndex);
      if (!sameFrontier(wins, expected.wins) || !sameFrontier(losses, expected.losses)) {
        stats.frontierMismatches += 1;
        throw new Error(`ownership authority frontier mismatch at support ${supportIndex} rank ${rank}`);
      }
    }
  }

  return Object.freeze({ wins: winFrontiers[0], losses: lossFrontiers[0] });
}

function summarizeProduct(productStats) {
  const generated = productStats.generatedOperations;
  const classes = productStats.exactResultClasses;
  return Object.freeze({
    ...productStats,
    pairProductRatio: productStats.rawPairs === 0 ? 0 : productStats.residualPairProducts / productStats.rawPairs,
    generatedRatio: productStats.rawPairs === 0 ? 0 : generated / productStats.rawPairs,
    quotientRatio: generated === 0 ? 0 : classes / generated,
    duplicateEliminationRatio: generated === 0 ? 0 : productStats.duplicateOccurrences / generated,
  });
}

const overallStart = Date.now();
let totalSupports = 0;
const caseResults = [];
const totals = createStats();

for (const geometry of CASES) {
  const support = createBsfpSupportLatticeProfile(geometry);
  totalSupports += support.itemCapacity;
  if (totalSupports > SUPPORT_BUDGET) throw new Error(`declared support budget exceeded ${SUPPORT_BUDGET}`);

  const authority = solveBsfpOwnershipAntichainWdl(geometry);
  const stats = createStats();
  const root = solveCandidate({ ...geometry, authority, stats, startedAt: overallStart });
  assertSameFrontier(root.wins, authority.frontierAt(0).wins, 'root wins');
  assertSameFrontier(root.losses, authority.frontierAt(0).losses, 'root losses');

  const result = Object.freeze({
    geometry: `${geometry.columns}x${geometry.rows} c${geometry.connect}`,
    supports: support.itemCapacity,
    frontierMismatches: stats.frontierMismatches,
    upward: summarizeProduct(stats.upward),
    downward: summarizeProduct(stats.downward),
  });
  caseResults.push(result);
  console.log(JSON.stringify(result));

  totals.supportCount += stats.supportCount;
  for (const direction of ['upward', 'downward']) {
    for (const key of Object.keys(totals[direction])) {
      if (key.startsWith('maximum')) totals[direction][key] = Math.max(totals[direction][key], stats[direction][key]);
      else totals[direction][key] += stats[direction][key];
    }
  }
  assertBudgets(totals, overallStart);
}

const totalGenerated = totals.upward.generatedOperations + totals.downward.generatedOperations;
const totalClasses = totals.upward.exactResultClasses + totals.downward.exactResultClasses;
const totalDuplicates = totals.upward.duplicateOccurrences + totals.downward.duplicateOccurrences;
const totalRaw = totals.upward.rawPairs + totals.downward.rawPairs;

const summary = Object.freeze({
  method: 'ownership-antichain core/envelope absorption -> exact result quotient -> antichain normalization',
  attribution: 'Josh Oshiro',
  cases: caseResults.length,
  supports: totals.supportCount,
  rawPairs: totalRaw,
  generatedOperationsAfterAbsorption: totalGenerated,
  exactResultClasses: totalClasses,
  duplicateOccurrencesEliminated: totalDuplicates,
  additionalEliminationRatio: totalGenerated === 0 ? 0 : totalDuplicates / totalGenerated,
  generatedToRawRatio: totalRaw === 0 ? 0 : totalGenerated / totalRaw,
  quotientToRawRatio: totalRaw === 0 ? 0 : totalClasses / totalRaw,
  frontierMismatches: totals.frontierMismatches,
  wallMs: Date.now() - overallStart,
  leashes: Object.freeze({
    wallClockMs: WALL_CLOCK_LIMIT_MS,
    rawPairs: RAW_PAIR_BUDGET,
    supports: SUPPORT_BUDGET,
  }),
  upward: summarizeProduct(totals.upward),
  downward: summarizeProduct(totals.downward),
});

if (summary.duplicateOccurrencesEliminated === 0) {
  throw new Error('ownership result quotient falsifier found no post-absorption duplicate result classes');
}
if (summary.upward.duplicateOccurrences === 0 || summary.downward.duplicateOccurrences === 0) {
  throw new Error('ownership result quotient did not reproduce in both OR/minimal and AND/maximal product forms');
}
if (summary.frontierMismatches !== 0) throw new Error('ownership authority mismatches were observed');

console.log(JSON.stringify(summary, null, 2));
