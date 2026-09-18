#!/usr/bin/env node

/**
 * Differential qualifier for a beneficiary-relative monotone-CNF BSFP frontier.
 *
 * A clause record R={C1,...,Cn} denotes beneficiary ownership sets P such that
 * P intersects every clause Ci. A frontier is a union of such records.
 *
 * Exact recurrence:
 *   beneficiary claims x: clauses containing x are satisfied and disappear;
 *   opponent claims x: x is removed from every clause; empty clause kills record;
 *   beneficiary/mover aggregation: frontier union;
 *   opponent/mover aggregation: Cartesian record conjunction (clause-set union);
 *   terminal own-all(q): singleton clause for every x in q;
 *   first-win exclusion: one blocker clause q for each terminal-ready line.
 *
 * The authority is an independent dual-positive ownership-generator BSFP.
 * For exact validation, every clause frontier is expanded to its minimal
 * transversals and compared with the authority's minimal ownership generators.
 *
 * Small controls use u32 masks only as a qualification backend. The semantic
 * calculus is finite-set based and does not assume 32/42 cells.
 */

import { performance } from 'node:perf_hooks';

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

function forEachSetBit(mask, callback) {
  let value = mask >>> 0;
  let bit = 0;
  while (value !== 0) {
    if ((value & 1) !== 0) callback(bit);
    value >>>= 1;
    bit += 1;
  }
}

function normalizeMinimalMasks(masks) {
  const ordered = [...new Set(masks.map((value) => value >>> 0))]
    .sort((left, right) => popcount(left) - popcount(right) || left - right);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (subset(retained, candidate)) continue outer;
    result.push(candidate);
  }
  return result;
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
  const result = [];

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
      result.push({
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
  return result;
}

function prepare(columns, rows, connect) {
  if (columns * rows >= 31) throw new RangeError('reference qualifier uses u32 masks and requires fewer than 31 cells');
  const winningLines = createWinningLineMasks(columns, rows, connect);
  const incidence = Array.from({ length: columns * rows }, () => []);
  for (const line of winningLines) forEachSetBit(line, (cell) => incidence[cell].push(line));
  const supports = createSupports(columns, rows);
  const supportByKey = new Map(supports.map((support, index) => [support.key, index]));
  const supportsByRank = Array.from({ length: columns * rows + 1 }, () => []);
  supports.forEach((support, index) => supportsByRank[support.rank].push(index));
  return { winningLines, incidence, supports, supportByKey, supportsByRank };
}

// ----- independent dual-positive ownership-generator authority -----

function cofactorGeneratorFrontier(frontier, landingCell, mover, beneficiary) {
  const bit = 1 << landingCell;
  const result = [];
  if (mover === beneficiary) {
    for (const generator of frontier) result.push((generator & ~bit) >>> 0);
  } else {
    for (const generator of frontier) if ((generator & bit) === 0) result.push(generator);
  }
  return normalizeMinimalMasks(result);
}

function unionGeneratorFrontiers(left, right) {
  return normalizeMinimalMasks([...left, ...right]);
}

function intersectGeneratorFrontiers(left, right, stats) {
  const result = [];
  for (const a of left) {
    for (const b of right) {
      result.push((a | b) >>> 0);
      stats.productPairs += 1;
    }
  }
  return normalizeMinimalMasks(result);
}

function blockerGenerators(requirement) {
  const result = [];
  forEachSetBit(requirement, (cell) => result.push((1 << cell) >>> 0));
  return normalizeMinimalMasks(result);
}

function solveOwnershipAuthority(profile, columns, rows) {
  const frontiers = new Array(profile.supports.length);
  const stats = { productPairs: 0, records: 0, maxRecords: 0, byRank: {} };

  for (let rank = columns * rows; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    for (const supportIndex of profile.supportsByRank[rank]) {
      const support = profile.supports[supportIndex];
      let aggregate0 = null;
      let aggregate1 = null;

      for (let column = 0; column < columns; column += 1) {
        const row = support.heights[column];
        if (row >= rows) continue;

        const childHeights = support.heights.slice();
        childHeights[column] += 1;
        const child = frontiers[profile.supportByKey.get(childHeights.join(','))];
        const landingCell = row * columns + column;

        let winner0 = cofactorGeneratorFrontier(child.winner0, landingCell, mover, 0);
        let winner1 = cofactorGeneratorFrontier(child.winner1, landingCell, mover, 1);

        const terminalRequirements = [];
        for (const line of profile.incidence[landingCell]) {
          const requirement = (line & ~(1 << landingCell)) >>> 0;
          if (subset(requirement, support.universe)) terminalRequirements.push(requirement);
        }

        if (terminalRequirements.length !== 0) {
          if (mover === 0) {
            winner0 = unionGeneratorFrontiers(winner0, terminalRequirements);
            for (const requirement of terminalRequirements) {
              winner1 = intersectGeneratorFrontiers(winner1, blockerGenerators(requirement), stats);
            }
          } else {
            winner1 = unionGeneratorFrontiers(winner1, terminalRequirements);
            for (const requirement of terminalRequirements) {
              winner0 = intersectGeneratorFrontiers(winner0, blockerGenerators(requirement), stats);
            }
          }
        }

        if (aggregate0 === null) {
          aggregate0 = winner0;
          aggregate1 = winner1;
        } else if (mover === 0) {
          aggregate0 = unionGeneratorFrontiers(aggregate0, winner0);
          aggregate1 = intersectGeneratorFrontiers(aggregate1, winner1, stats);
        } else {
          aggregate0 = intersectGeneratorFrontiers(aggregate0, winner0, stats);
          aggregate1 = unionGeneratorFrontiers(aggregate1, winner1);
        }
      }

      const frontier = { winner0: aggregate0 ?? [], winner1: aggregate1 ?? [] };
      frontiers[supportIndex] = frontier;
      const records = frontier.winner0.length + frontier.winner1.length;
      stats.records += records;
      stats.maxRecords = Math.max(stats.maxRecords, records);
      const rankStats = stats.byRank[rank] ?? { supports: 0, records: 0, maxRecords: 0 };
      rankStats.supports += 1;
      rankStats.records += records;
      rankStats.maxRecords = Math.max(rankStats.maxRecords, records);
      stats.byRank[rank] = rankStats;
    }
  }

  return { frontiers, stats };
}

// ----- monotone-CNF frontier -----

function normalizeRecord(clauses) {
  const unique = [...new Set(clauses.map((value) => value >>> 0))];
  if (unique.some((value) => value === 0)) return null;
  unique.sort((left, right) => popcount(left) - popcount(right) || left - right);
  const result = [];
  outer: for (const clause of unique) {
    for (const retained of result) if (subset(retained, clause)) continue outer;
    result.push(clause);
  }
  return result;
}

function recordKey(record) {
  return record.map((clause) => (clause >>> 0).toString(16)).join('.');
}

function recordImplies(left, right) {
  // Models(left) subset Models(right) iff each clause in right contains at
  // least one clause from left. This criterion is exact for monotone CNFs.
  for (const required of right) {
    let covered = false;
    for (const available of left) {
      if (subset(available, required)) {
        covered = true;
        break;
      }
    }
    if (!covered) return false;
  }
  return true;
}

function normalizeFrontier(records) {
  const unique = new Map();
  for (const raw of records) {
    const record = normalizeRecord(raw);
    if (record !== null) unique.set(recordKey(record), record);
  }

  const ordered = [...unique.values()]
    .sort((left, right) => left.length - right.length || recordKey(left).localeCompare(recordKey(right)));
  const result = [];

  outer: for (const candidate of ordered) {
    // A candidate is redundant in a union if it implies an already retained,
    // broader record.
    for (const retained of result) if (recordImplies(candidate, retained)) continue outer;
    for (let index = result.length - 1; index >= 0; index -= 1) {
      if (recordImplies(result[index], candidate)) result.splice(index, 1);
    }
    result.push(candidate);
  }

  return result;
}

function cofactorRecord(record, landingCell, mover, beneficiary) {
  const bit = 1 << landingCell;
  const next = [];

  if (mover === beneficiary) {
    // x=true: any clause containing x is satisfied and disappears.
    for (const clause of record) if ((clause & bit) === 0) next.push(clause);
  } else {
    // x=false: remove x from each clause. Empty clause makes this record false.
    for (const clause of record) {
      const reduced = (clause & ~bit) >>> 0;
      if (reduced === 0) return null;
      next.push(reduced);
    }
  }

  return normalizeRecord(next);
}

function cofactorClauseFrontier(frontier, landingCell, mover, beneficiary) {
  const result = [];
  for (const record of frontier) {
    const next = cofactorRecord(record, landingCell, mover, beneficiary);
    if (next !== null) result.push(next);
  }
  return normalizeFrontier(result);
}

function unionClauseFrontiers(left, right) {
  return normalizeFrontier([...left, ...right]);
}

function intersectClauseFrontiers(left, right, stats) {
  if (left.length === 0 || right.length === 0) return [];
  const result = [];
  for (const a of left) {
    for (const b of right) {
      stats.productPairs += 1;
      const combined = normalizeRecord([...a, ...b]);
      if (combined !== null) result.push(combined);
    }
  }
  return normalizeFrontier(result);
}

function terminalRecord(requirement) {
  const clauses = [];
  forEachSetBit(requirement, (cell) => clauses.push((1 << cell) >>> 0));
  return normalizeRecord(clauses);
}

function solveClauseFrontier(profile, columns, rows) {
  const frontiers = new Array(profile.supports.length);
  const stats = {
    productPairs: 0,
    records: 0,
    clauses: 0,
    literals: 0,
    maxRecords: 0,
    maxClausesPerRecord: 0,
    byRank: {},
  };

  for (let rank = columns * rows; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    for (const supportIndex of profile.supportsByRank[rank]) {
      const support = profile.supports[supportIndex];
      let aggregate0 = null;
      let aggregate1 = null;

      for (let column = 0; column < columns; column += 1) {
        const row = support.heights[column];
        if (row >= rows) continue;

        const childHeights = support.heights.slice();
        childHeights[column] += 1;
        const child = frontiers[profile.supportByKey.get(childHeights.join(','))];
        const landingCell = row * columns + column;

        let winner0 = cofactorClauseFrontier(child.winner0, landingCell, mover, 0);
        let winner1 = cofactorClauseFrontier(child.winner1, landingCell, mover, 1);

        const terminalRequirements = [];
        for (const line of profile.incidence[landingCell]) {
          const requirement = (line & ~(1 << landingCell)) >>> 0;
          if (subset(requirement, support.universe)) terminalRequirements.push(requirement);
        }

        if (terminalRequirements.length !== 0) {
          const moverTerminalRecords = terminalRequirements
            .map(terminalRecord)
            .filter((record) => record !== null);
          if (mover === 0) winner0 = unionClauseFrontiers(winner0, moverTerminalRecords);
          else winner1 = unionClauseFrontiers(winner1, moverTerminalRecords);

          // Complement of the union of immediate terminal regions:
          // the opponent must own >=1 cell from every terminal prerequisite.
          const blocker = normalizeRecord(terminalRequirements);
          if (blocker === null) {
            if (mover === 0) winner1 = [];
            else winner0 = [];
          } else if (mover === 0) {
            winner1 = intersectClauseFrontiers(winner1, [blocker], stats);
          } else {
            winner0 = intersectClauseFrontiers(winner0, [blocker], stats);
          }
        }

        if (aggregate0 === null) {
          aggregate0 = winner0;
          aggregate1 = winner1;
        } else if (mover === 0) {
          aggregate0 = unionClauseFrontiers(aggregate0, winner0);
          aggregate1 = intersectClauseFrontiers(aggregate1, winner1, stats);
        } else {
          aggregate0 = intersectClauseFrontiers(aggregate0, winner0, stats);
          aggregate1 = unionClauseFrontiers(aggregate1, winner1);
        }
      }

      const frontier = { winner0: aggregate0 ?? [], winner1: aggregate1 ?? [] };
      frontiers[supportIndex] = frontier;

      const rankStats = stats.byRank[rank] ?? {
        supports: 0,
        records: 0,
        clauses: 0,
        literals: 0,
        maxRecords: 0,
        maxClausesPerRecord: 0,
      };
      const recordCount = frontier.winner0.length + frontier.winner1.length;
      stats.records += recordCount;
      stats.maxRecords = Math.max(stats.maxRecords, recordCount);
      rankStats.supports += 1;
      rankStats.records += recordCount;
      rankStats.maxRecords = Math.max(rankStats.maxRecords, recordCount);

      for (const family of [frontier.winner0, frontier.winner1]) {
        for (const record of family) {
          stats.clauses += record.length;
          rankStats.clauses += record.length;
          stats.maxClausesPerRecord = Math.max(stats.maxClausesPerRecord, record.length);
          rankStats.maxClausesPerRecord = Math.max(rankStats.maxClausesPerRecord, record.length);
          for (const clause of record) {
            const literalCount = popcount(clause);
            stats.literals += literalCount;
            rankStats.literals += literalCount;
          }
        }
      }
      stats.byRank[rank] = rankStats;
    }
  }

  return { frontiers, stats };
}

// ----- exact clause-frontier validation through minimal models -----

function minimalTransversals(record) {
  let transversals = [0];
  for (const clause of record) {
    const next = [];
    for (const current of transversals) {
      if ((current & clause) !== 0) {
        next.push(current);
        continue;
      }
      forEachSetBit(clause, (cell) => next.push((current | (1 << cell)) >>> 0));
    }
    transversals = normalizeMinimalMasks(next);
  }
  return transversals;
}

function expandClauseFrontier(frontier) {
  const result = [];
  for (const record of frontier) result.push(...minimalTransversals(record));
  return normalizeMinimalMasks(result);
}

function equalMasks(left, right) {
  if (left.length !== right.length) return false;
  const a = [...left].sort((x, y) => x - y);
  const b = [...right].sort((x, y) => x - y);
  return a.every((value, index) => value === b[index]);
}

function compareGeometry(columns, rows, connect) {
  const profile = prepare(columns, rows, connect);

  const ownershipStart = performance.now();
  const ownership = solveOwnershipAuthority(profile, columns, rows);
  const ownershipSolveMs = performance.now() - ownershipStart;

  const clauseStart = performance.now();
  const clause = solveClauseFrontier(profile, columns, rows);
  const clauseSolveMs = performance.now() - clauseStart;

  let winner0Mismatches = 0;
  let winner1Mismatches = 0;
  let maxExpandedRecords = 0;
  const validationStart = performance.now();

  for (let index = 0; index < profile.supports.length; index += 1) {
    const expanded0 = expandClauseFrontier(clause.frontiers[index].winner0);
    const expanded1 = expandClauseFrontier(clause.frontiers[index].winner1);
    maxExpandedRecords = Math.max(maxExpandedRecords, expanded0.length + expanded1.length);
    if (!equalMasks(expanded0, ownership.frontiers[index].winner0)) winner0Mismatches += 1;
    if (!equalMasks(expanded1, ownership.frontiers[index].winner1)) winner1Mismatches += 1;
  }

  return {
    columns,
    rows,
    connect,
    cells: columns * rows,
    winningLines: profile.winningLines.length,
    supports: profile.supports.length,
    winner0Mismatches,
    winner1Mismatches,
    ownershipSolveMs,
    clauseSolveMs,
    validationMs: performance.now() - validationStart,
    ownership: ownership.stats,
    clause: clause.stats,
    maxExpandedRecords,
  };
}

const [columns, rows, connect] = process.argv.slice(2).map(Number);
if (!Number.isInteger(columns) || !Number.isInteger(rows) || !Number.isInteger(connect)) {
  throw new Error('usage: node clause-frontier-equivalence.mjs COLUMNS ROWS CONNECT');
}

const result = compareGeometry(columns, rows, connect);
if (result.winner0Mismatches !== 0 || result.winner1Mismatches !== 0) process.exitCode = 1;
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
