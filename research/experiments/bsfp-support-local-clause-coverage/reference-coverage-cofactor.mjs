#!/usr/bin/env node

/**
 * Differential qualifier for support-local monotone-clause coverage BSFP.
 *
 * Authority:
 *   beneficiary-relative OR-of-monotone-CNF clause frontiers.
 *
 * Candidate:
 *   support-local clause dictionary D(S), upward-coverage bitset records,
 *   and precomputed child->parent cofactor maps.
 *
 * The qualifier uses u32 cell masks only because all selected controls have
 * fewer than 31 cells. Coverage records use BigInt so the semantic experiment
 * does not assume one-u64 dictionaries.
 */

import { performance } from 'node:perf_hooks';

function popcount32(value) {
  let x = value >>> 0;
  let count = 0;
  while (x !== 0) {
    x &= x - 1;
    count += 1;
  }
  return count;
}

function subset32(left, right) {
  return ((left & ~right) >>> 0) === 0;
}

function forEachSetBit32(mask, callback) {
  let value = mask >>> 0;
  while (value !== 0) {
    const bit = (value & -value) >>> 0;
    callback(31 - Math.clz32(bit));
    value = (value & (value - 1)) >>> 0;
  }
}

function popcountBigInt(value) {
  let x = value;
  let count = 0;
  while (x !== 0n) {
    x &= x - 1n;
    count += 1;
  }
  return count;
}

function bigIntBitIndex(bit) {
  let index = 0;
  let value = bit;
  while (value > 1n) {
    value >>= 1n;
    index += 1;
  }
  return index;
}

function createWinningLineMasks(columns, rows, connect) {
  const result = [];
  const index = (column, row) => row * columns + column;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column <= columns - connect; column += 1) {
      let mask = 0;
      for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row);
      result.push(mask >>> 0);
    }
  }
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row <= rows - connect; row += 1) {
      let mask = 0;
      for (let step = 0; step < connect; step += 1) mask |= 1 << index(column, row + step);
      result.push(mask >>> 0);
    }
  }
  for (let column = 0; column <= columns - connect; column += 1) {
    for (let row = 0; row <= rows - connect; row += 1) {
      let mask = 0;
      for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row + step);
      result.push(mask >>> 0);
    }
  }
  for (let column = 0; column <= columns - connect; column += 1) {
    for (let row = connect - 1; row < rows; row += 1) {
      let mask = 0;
      for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row - step);
      result.push(mask >>> 0);
    }
  }

  return result;
}

function createSupports(columns, rows) {
  const heights = new Array(columns).fill(0);
  const supports = [];

  function visit(column) {
    if (column === columns) {
      let universe = 0;
      let rank = 0;
      for (let current = 0; current < columns; current += 1) {
        for (let row = 0; row < heights[current]; row += 1) {
          universe |= 1 << (row * columns + current);
          rank += 1;
        }
      }
      supports.push({
        heights: heights.slice(),
        universe: universe >>> 0,
        rank,
        key: heights.join(','),
      });
      return;
    }

    for (let value = 0; value <= rows; value += 1) {
      heights[column] = value;
      visit(column + 1);
    }
  }

  visit(0);
  return supports;
}

function normalizeRecord(clauses) {
  const unique = [...new Set(clauses.map((value) => value >>> 0))];
  if (unique.some((value) => value === 0)) return null;
  unique.sort((left, right) => popcount32(left) - popcount32(right) || left - right);
  const result = [];

  outer: for (const candidate of unique) {
    for (const retained of result) if (subset32(retained, candidate)) continue outer;
    result.push(candidate);
  }
  return result;
}

function recordKey(record) {
  return record.map((clause) => clause.toString(16)).join('.');
}

function recordImplies(left, right) {
  for (const required of right) {
    let covered = false;
    for (const available of left) {
      if (subset32(available, required)) {
        covered = true;
        break;
      }
    }
    if (!covered) return false;
  }
  return true;
}

function normalizeClauseFrontier(records) {
  const unique = new Map();
  for (const raw of records) {
    const record = normalizeRecord(raw);
    if (record !== null) unique.set(recordKey(record), record);
  }
  const ordered = [...unique.values()]
    .sort((left, right) => left.length - right.length || recordKey(left).localeCompare(recordKey(right)));
  const result = [];

  outer: for (const candidate of ordered) {
    for (const retained of result) if (recordImplies(candidate, retained)) continue outer;
    for (let index = result.length - 1; index >= 0; index -= 1) {
      if (recordImplies(result[index], candidate)) result.splice(index, 1);
    }
    result.push(candidate);
  }
  return result;
}

function cofactorClauseFrontier(frontier, landingCell, mover, beneficiary) {
  const bit = (1 << landingCell) >>> 0;
  const result = [];

  for (const record of frontier) {
    const next = [];
    let dead = false;
    if (mover === beneficiary) {
      for (const clause of record) if ((clause & bit) === 0) next.push(clause);
    } else {
      for (const clause of record) {
        const reduced = (clause & ~bit) >>> 0;
        if (reduced === 0) {
          dead = true;
          break;
        }
        next.push(reduced);
      }
    }
    if (!dead) {
      const normalized = normalizeRecord(next);
      if (normalized !== null) result.push(normalized);
    }
  }

  return normalizeClauseFrontier(result);
}

function unionClauseFrontiers(left, right) {
  return normalizeClauseFrontier([...left, ...right]);
}

function intersectClauseFrontiers(left, right) {
  if (left.length === 0 || right.length === 0) return [];
  const result = [];
  for (const a of left) {
    for (const b of right) {
      const combined = normalizeRecord([...a, ...b]);
      if (combined !== null) result.push(combined);
    }
  }
  return normalizeClauseFrontier(result);
}

function terminalRecord(requirement) {
  const clauses = [];
  forEachSetBit32(requirement, (cell) => clauses.push((1 << cell) >>> 0));
  return normalizeRecord(clauses);
}

function createDictionary(support, winningLines) {
  const unique = new Set();
  forEachSetBit32(support.universe, (cell) => unique.add((1 << cell) >>> 0));
  for (const line of winningLines) {
    const clause = (line & support.universe) >>> 0;
    if (clause !== 0) unique.add(clause);
  }

  const masks = [...unique].sort((left, right) => popcount32(left) - popcount32(right) || left - right);
  const idByMask = new Map(masks.map((mask, id) => [mask, id]));
  const upwardCoverage = masks.map((mask) => {
    let coverage = 0n;
    for (let id = 0; id < masks.length; id += 1) {
      if (subset32(mask, masks[id])) coverage |= 1n << BigInt(id);
    }
    return coverage;
  });

  return { masks, idByMask, upwardCoverage };
}

function coverageOfRecord(record, dictionary) {
  let coverage = 0n;
  for (const clause of record) {
    const id = dictionary.idByMask.get(clause);
    if (id === undefined) throw new Error(`exact recurrence emitted clause outside D(S): 0x${clause.toString(16)}`);
    coverage |= dictionary.upwardCoverage[id];
  }
  return coverage;
}

function normalizeCoverageFrontier(values) {
  const unique = [...new Set(values.map((value) => value.toString()))].map(BigInt);
  unique.sort((left, right) => {
    const delta = popcountBigInt(left) - popcountBigInt(right);
    if (delta !== 0) return delta;
    return left < right ? -1 : left > right ? 1 : 0;
  });
  const result = [];

  outer: for (const candidate of unique) {
    for (const retained of result) {
      if ((retained & ~candidate) === 0n) continue outer;
    }
    result.push(candidate);
  }
  return result;
}

function unionCoverageFrontiers(left, right) {
  return normalizeCoverageFrontier([...left, ...right]);
}

function intersectCoverageFrontiers(left, right) {
  if (left.length === 0 || right.length === 0) return [];
  const result = [];
  for (const a of left) for (const b of right) result.push(a | b);
  return normalizeCoverageFrontier(result);
}

function buildCofactorMap(parentDictionary, childDictionary, landingCell, ownerTrue) {
  const landingBit = (1 << landingCell) >>> 0;
  const contributions = new Array(childDictionary.masks.length).fill(0n);
  let killMask = 0n;

  for (let childId = 0; childId < childDictionary.masks.length; childId += 1) {
    const childClause = childDictionary.masks[childId];
    if (ownerTrue) {
      if ((childClause & landingBit) !== 0) continue;
      const parentId = parentDictionary.idByMask.get(childClause);
      if (parentId === undefined) throw new Error('beneficiary cofactor escaped parent dictionary');
      contributions[childId] = parentDictionary.upwardCoverage[parentId];
    } else {
      const reduced = (childClause & ~landingBit) >>> 0;
      if (reduced === 0) {
        killMask |= 1n << BigInt(childId);
        continue;
      }
      const parentId = parentDictionary.idByMask.get(reduced);
      if (parentId === undefined) throw new Error('opponent cofactor escaped parent dictionary');
      contributions[childId] = parentDictionary.upwardCoverage[parentId];
    }
  }

  return { contributions, killMask };
}

function applyCofactorMap(coverage, map) {
  if ((coverage & map.killMask) !== 0n) return null;
  let result = 0n;
  let remaining = coverage;
  while (remaining !== 0n) {
    const bit = remaining & -remaining;
    result |= map.contributions[bigIntBitIndex(bit)];
    remaining &= remaining - 1n;
  }
  return result;
}

function cofactorCoverageFrontier(frontier, map) {
  const result = [];
  for (const coverage of frontier) {
    const next = applyCofactorMap(coverage, map);
    if (next !== null) result.push(next);
  }
  return normalizeCoverageFrontier(result);
}

function equalCoverageFrontiers(left, right) {
  if (left.length !== right.length) return false;
  const a = left.map((value) => value.toString()).sort();
  const b = right.map((value) => value.toString()).sort();
  return a.every((value, index) => value === b[index]);
}

function exactStoneCount(rank, beneficiary) {
  return beneficiary === 0 ? Math.ceil(rank / 2) : Math.floor(rank / 2);
}

function capacityKeepCoverage(candidate, dictionaryMasks, supportUniverse, exactCount) {
  let forcedCells = 0;
  let forcedCount = 0;

  for (let id = 0; id < dictionaryMasks.length; id += 1) {
    const clause = dictionaryMasks[id];
    if (popcount32(clause) !== 1) continue;
    if ((candidate & (1n << BigInt(id))) !== 0n) {
      forcedCells |= clause;
      forcedCount += 1;
    }
  }

  if (forcedCount > exactCount) return false;

  let satisfiedCoverage = 0n;
  for (let id = 0; id < dictionaryMasks.length; id += 1) {
    if ((dictionaryMasks[id] & forcedCells) !== 0) satisfiedCoverage |= 1n << BigInt(id);
  }

  const extra = candidate & ~satisfiedCoverage;
  if (extra === 0n) return true;
  if (forcedCount === exactCount) return false;
  if (forcedCount + 1 !== exactCount) return true;

  let witness = false;
  forEachSetBit32(supportUniverse, (cell) => {
    if (witness) return;
    const cellBit = (1 << cell) >>> 0;
    if ((forcedCells & cellBit) !== 0) return;
    let contains = 0n;
    for (let id = 0; id < dictionaryMasks.length; id += 1) {
      if ((dictionaryMasks[id] & cellBit) !== 0) contains |= 1n << BigInt(id);
    }
    if ((extra & ~contains) === 0n) witness = true;
  });
  return witness;
}

function analyzeUniversalJob(job) {
  if (job === null) return null;
  const accepted = [];
  const uniqueRaw = new Set();
  const uniqueAccepted = new Set();
  let rejected = 0;

  for (const left of job.left) {
    for (const right of job.right) {
      const candidate = left | right;
      uniqueRaw.add(candidate.toString());
      if (capacityKeepCoverage(candidate, job.dictionaryMasks, job.supportUniverse, job.exactCount)) {
        accepted.push(candidate);
        uniqueAccepted.add(candidate.toString());
      } else {
        rejected += 1;
      }
    }
  }

  const normalized = normalizeCoverageFrontier(accepted);
  return {
    supportKey: job.supportKey,
    rank: job.rank,
    mover: job.mover,
    beneficiary: job.beneficiary,
    moveColumn: job.moveColumn,
    dictionarySize: job.dictionaryMasks.length,
    exactCount: job.exactCount,
    leftRecords: job.left.length,
    rightRecords: job.right.length,
    rawPairCandidates: job.left.length * job.right.length,
    uniqueRawOrCandidates: uniqueRaw.size,
    exactDuplicateOrCandidates: job.left.length * job.right.length - uniqueRaw.size,
    rejectedBeforeNormalization: rejected,
    acceptedPairCandidates: accepted.length,
    uniqueAcceptedCandidates: uniqueAccepted.size,
    normalizedSurvivingRecords: normalized.length,
  };
}

function solveGeometry(columns, rows, connect) {
  if (columns * rows >= 31) throw new RangeError('reference cell-mask backend requires fewer than 31 cells');

  const winningLines = createWinningLineMasks(columns, rows, connect);
  const supports = createSupports(columns, rows);
  const supportByKey = new Map(supports.map((support, index) => [support.key, index]));
  const supportsByRank = Array.from({ length: columns * rows + 1 }, () => []);
  supports.forEach((support, index) => supportsByRank[support.rank].push(index));
  const incidence = Array.from({ length: columns * rows }, () => []);
  for (const line of winningLines) forEachSetBit32(line, (cell) => incidence[cell].push(line));

  const dictionaries = supports.map((support) => createDictionary(support, winningLines));
  const clauseFrontiers = new Array(supports.length);
  const coverageFrontiers = new Array(supports.length);
  let supportMismatches = 0;
  let cofactorMapsBuilt = 0;
  let maximumDictionary = 0;
  let totalDictionary = 0;
  let largestUniversalJob = null;
  const dictionaryByRank = {};

  for (let index = 0; index < dictionaries.length; index += 1) {
    const size = dictionaries[index].masks.length;
    maximumDictionary = Math.max(maximumDictionary, size);
    totalDictionary += size;
    const rank = supports[index].rank;
    const entry = dictionaryByRank[rank] ?? { supports: 0, total: 0, min: Number.POSITIVE_INFINITY, max: 0 };
    entry.supports += 1;
    entry.total += size;
    entry.min = Math.min(entry.min, size);
    entry.max = Math.max(entry.max, size);
    dictionaryByRank[rank] = entry;
  }

  for (let rank = columns * rows; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    for (const supportIndex of supportsByRank[rank]) {
      const support = supports[supportIndex];
      const parentDictionary = dictionaries[supportIndex];
      let aggregateClause0 = null;
      let aggregateClause1 = null;
      let aggregateCoverage0 = null;
      let aggregateCoverage1 = null;

      const considerUniversalJob = (beneficiary, left, right, moveColumn) => {
        if (left === null || right === null || left.length === 0 || right.length === 0) return;
        const pairCount = left.length * right.length;
        if (largestUniversalJob !== null && pairCount <= largestUniversalJob.left.length * largestUniversalJob.right.length) return;
        largestUniversalJob = {
          supportKey: support.key,
          supportUniverse: support.universe,
          rank,
          mover,
          beneficiary,
          moveColumn,
          exactCount: exactStoneCount(rank, beneficiary),
          dictionaryMasks: parentDictionary.masks.slice(),
          left: left.slice(),
          right: right.slice(),
        };
      };

      for (let column = 0; column < columns; column += 1) {
        const row = support.heights[column];
        if (row >= rows) continue;

        const childHeights = support.heights.slice();
        childHeights[column] += 1;
        const childIndex = supportByKey.get(childHeights.join(','));
        const childClause = clauseFrontiers[childIndex];
        const childCoverage = coverageFrontiers[childIndex];
        const landingCell = row * columns + column;
        const childDictionary = dictionaries[childIndex];

        const map0 = buildCofactorMap(parentDictionary, childDictionary, landingCell, mover === 0);
        const map1 = buildCofactorMap(parentDictionary, childDictionary, landingCell, mover === 1);
        cofactorMapsBuilt += 2;

        let moveClause0 = cofactorClauseFrontier(childClause.winner0, landingCell, mover, 0);
        let moveClause1 = cofactorClauseFrontier(childClause.winner1, landingCell, mover, 1);
        let moveCoverage0 = cofactorCoverageFrontier(childCoverage.winner0, map0);
        let moveCoverage1 = cofactorCoverageFrontier(childCoverage.winner1, map1);

        const terminalRequirements = [];
        for (const line of incidence[landingCell]) {
          const requirement = (line & ~(1 << landingCell)) >>> 0;
          if (subset32(requirement, support.universe)) terminalRequirements.push(requirement);
        }

        if (terminalRequirements.length !== 0) {
          const moverTerminalRecords = terminalRequirements.map(terminalRecord).filter((record) => record !== null);
          const moverTerminalCoverage = moverTerminalRecords.map((record) => coverageOfRecord(record, parentDictionary));
          if (mover === 0) {
            moveClause0 = unionClauseFrontiers(moveClause0, moverTerminalRecords);
            moveCoverage0 = unionCoverageFrontiers(moveCoverage0, moverTerminalCoverage);
          } else {
            moveClause1 = unionClauseFrontiers(moveClause1, moverTerminalRecords);
            moveCoverage1 = unionCoverageFrontiers(moveCoverage1, moverTerminalCoverage);
          }

          const blocker = normalizeRecord(terminalRequirements);
          if (blocker === null) {
            if (mover === 0) {
              moveClause1 = [];
              moveCoverage1 = [];
            } else {
              moveClause0 = [];
              moveCoverage0 = [];
            }
          } else {
            const blockerCoverage = coverageOfRecord(blocker, parentDictionary);
            if (mover === 0) {
              moveClause1 = intersectClauseFrontiers(moveClause1, [blocker]);
              moveCoverage1 = intersectCoverageFrontiers(moveCoverage1, [blockerCoverage]);
            } else {
              moveClause0 = intersectClauseFrontiers(moveClause0, [blocker]);
              moveCoverage0 = intersectCoverageFrontiers(moveCoverage0, [blockerCoverage]);
            }
          }
        }

        if (aggregateClause0 === null) {
          aggregateClause0 = moveClause0;
          aggregateClause1 = moveClause1;
          aggregateCoverage0 = moveCoverage0;
          aggregateCoverage1 = moveCoverage1;
        } else if (mover === 0) {
          considerUniversalJob(1, aggregateCoverage1, moveCoverage1, column);
          aggregateClause0 = unionClauseFrontiers(aggregateClause0, moveClause0);
          aggregateClause1 = intersectClauseFrontiers(aggregateClause1, moveClause1);
          aggregateCoverage0 = unionCoverageFrontiers(aggregateCoverage0, moveCoverage0);
          aggregateCoverage1 = intersectCoverageFrontiers(aggregateCoverage1, moveCoverage1);
        } else {
          considerUniversalJob(0, aggregateCoverage0, moveCoverage0, column);
          aggregateClause0 = intersectClauseFrontiers(aggregateClause0, moveClause0);
          aggregateClause1 = unionClauseFrontiers(aggregateClause1, moveClause1);
          aggregateCoverage0 = intersectCoverageFrontiers(aggregateCoverage0, moveCoverage0);
          aggregateCoverage1 = unionCoverageFrontiers(aggregateCoverage1, moveCoverage1);
        }
      }

      const winner0 = aggregateClause0 ?? [];
      const winner1 = aggregateClause1 ?? [];
      const coverage0 = aggregateCoverage0 ?? [];
      const coverage1 = aggregateCoverage1 ?? [];
      clauseFrontiers[supportIndex] = { winner0, winner1 };
      coverageFrontiers[supportIndex] = { winner0: coverage0, winner1: coverage1 };

      const expected0 = normalizeCoverageFrontier(winner0.map((record) => coverageOfRecord(record, parentDictionary)));
      const expected1 = normalizeCoverageFrontier(winner1.map((record) => coverageOfRecord(record, parentDictionary)));
      if (!equalCoverageFrontiers(expected0, coverage0) || !equalCoverageFrontiers(expected1, coverage1)) {
        supportMismatches += 1;
      }
    }
  }

  const rankSummary = Object.fromEntries(Object.entries(dictionaryByRank).map(([rank, entry]) => [rank, {
    supports: entry.supports,
    mean: entry.total / entry.supports,
    min: entry.min,
    max: entry.max,
  }]));

  return {
    columns,
    rows,
    connect,
    cells: columns * rows,
    winningLines: winningLines.length,
    supports: supports.length,
    supportMismatches,
    cofactorMapsBuilt,
    largestUniversalIntersection: analyzeUniversalJob(largestUniversalJob),
    dictionary: {
      maximum: maximumDictionary,
      mean: totalDictionary / dictionaries.length,
      byRank: rankSummary,
    },
  };
}

function dictionaryCensus(columns, rows, connect) {
  if (columns * rows >= 31) throw new RangeError('reference cell-mask backend requires fewer than 31 cells');
  const winningLines = createWinningLineMasks(columns, rows, connect);
  const supports = createSupports(columns, rows);
  const byRank = {};
  let maximum = 0;

  for (const support of supports) {
    const size = createDictionary(support, winningLines).masks.length;
    maximum = Math.max(maximum, size);
    const entry = byRank[support.rank] ?? { supports: 0, total: 0, min: Number.POSITIVE_INFINITY, max: 0 };
    entry.supports += 1;
    entry.total += size;
    entry.min = Math.min(entry.min, size);
    entry.max = Math.max(entry.max, size);
    byRank[support.rank] = entry;
  }

  return {
    columns,
    rows,
    connect,
    winningLines: winningLines.length,
    supports: supports.length,
    maximum,
    byRank: Object.fromEntries(Object.entries(byRank).map(([rank, entry]) => [rank, {
      supports: entry.supports,
      mean: entry.total / entry.supports,
      min: entry.min,
      max: entry.max,
    }])),
  };
}

const controls = [
  [4, 3, 3],
  [4, 4, 4],
  [5, 3, 4],
  [4, 4, 3],
  [4, 5, 4],
  [5, 4, 4],
];

const results = [];
let mismatchTotal = 0;
for (const geometry of controls) {
  const started = performance.now();
  const result = solveGeometry(...geometry);
  result.elapsedMs = performance.now() - started;
  results.push(result);
  mismatchTotal += result.supportMismatches;
}

const targetCensus = dictionaryCensus(6, 5, 4);
const output = {
  schemaVersion: 2,
  kind: 'connect4-bsfp-support-local-clause-coverage-cofactor-qualification',
  authority: 'beneficiary-relative OR-of-monotone-CNF clause frontier',
  candidate: 'support-local upward-coverage records with precomputed child-parent cofactor maps',
  results,
  targetCensus,
  mismatchTotal,
};

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
if (mismatchTotal !== 0) process.exitCode = 1;
