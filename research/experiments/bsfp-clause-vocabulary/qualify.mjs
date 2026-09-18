#!/usr/bin/env node

/**
 * Qualifies the geometry-generic support-local clause vocabulary used by the
 * beneficiary-relative monotone clause BSFP recurrence.
 *
 * Target invariant at support S:
 *   every persistent clause is either
 *     - a singleton occupied cell {v}, or
 *     - a nonempty geometric line intersection lambda & S.
 *
 * Therefore the unique clause dictionary is bounded by rank(S)+L(W,H,K).
 * This qualifier fails on the first clause emitted outside that dictionary.
 */

import { performance } from 'node:perf_hooks';

function popcount(mask) {
  let value = mask >>> 0;
  let count = 0;
  while (value !== 0) { value &= value - 1; count += 1; }
  return count;
}

function subset(left, right) { return (left & ~right) === 0; }

function forEachSetBit(mask, callback) {
  let value = mask >>> 0;
  let bit = 0;
  while (value !== 0) {
    if ((value & 1) !== 0) callback(bit);
    value >>>= 1;
    bit += 1;
  }
}

function createWinningLineMasks(columns, rows, connect) {
  const lines = [];
  const index = (column, row) => row * columns + column;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column <= columns - connect; column += 1) {
      let mask = 0;
      for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row);
      lines.push(mask >>> 0);
    }
  }
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row <= rows - connect; row += 1) {
      let mask = 0;
      for (let step = 0; step < connect; step += 1) mask |= 1 << index(column, row + step);
      lines.push(mask >>> 0);
    }
  }
  for (let column = 0; column <= columns - connect; column += 1) {
    for (let row = 0; row <= rows - connect; row += 1) {
      let mask = 0;
      for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row + step);
      lines.push(mask >>> 0);
    }
  }
  for (let column = 0; column <= columns - connect; column += 1) {
    for (let row = connect - 1; row < rows; row += 1) {
      let mask = 0;
      for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row - step);
      lines.push(mask >>> 0);
    }
  }
  return lines;
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
      supports.push({ heights: heights.slice(), universe: universe >>> 0, rank, key: heights.join(',') });
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

function prepare(columns, rows, connect) {
  if (columns * rows >= 31) throw new RangeError('qualifier backend requires fewer than 31 cells');
  const winningLines = createWinningLineMasks(columns, rows, connect);
  const incidence = Array.from({ length: columns * rows }, () => []);
  for (const line of winningLines) forEachSetBit(line, (cell) => incidence[cell].push(line));
  const supports = createSupports(columns, rows);
  const supportByKey = new Map(supports.map((support, index) => [support.key, index]));
  const supportsByRank = Array.from({ length: columns * rows + 1 }, () => []);
  supports.forEach((support, index) => supportsByRank[support.rank].push(index));
  return { winningLines, incidence, supports, supportByKey, supportsByRank };
}

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

function recordKey(record) { return record.map((clause) => clause.toString(16)).join('.'); }

function recordImplies(left, right) {
  for (const required of right) {
    let covered = false;
    for (const available of left) {
      if (subset(available, required)) { covered = true; break; }
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
  const ordered = [...unique.values()].sort((a, b) => a.length - b.length || recordKey(a).localeCompare(recordKey(b)));
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

function cofactorRecord(record, landingCell, mover, beneficiary) {
  const bit = 1 << landingCell;
  const next = [];
  if (mover === beneficiary) {
    for (const clause of record) if ((clause & bit) === 0) next.push(clause);
  } else {
    for (const clause of record) {
      const reduced = (clause & ~bit) >>> 0;
      if (reduced === 0) return null;
      next.push(reduced);
    }
  }
  return normalizeRecord(next);
}

function cofactorFrontier(frontier, landingCell, mover, beneficiary) {
  const result = [];
  for (const record of frontier) {
    const next = cofactorRecord(record, landingCell, mover, beneficiary);
    if (next !== null) result.push(next);
  }
  return normalizeFrontier(result);
}

function intersectFrontiers(left, right) {
  if (left.length === 0 || right.length === 0) return [];
  const result = [];
  for (const a of left) for (const b of right) {
    const combined = normalizeRecord([...a, ...b]);
    if (combined !== null) result.push(combined);
  }
  return normalizeFrontier(result);
}

function terminalRecord(requirement) {
  const clauses = [];
  forEachSetBit(requirement, (cell) => clauses.push((1 << cell) >>> 0));
  return normalizeRecord(clauses);
}

function vocabularyForSupport(profile, support) {
  const dictionary = new Set();
  forEachSetBit(support.universe, (cell) => dictionary.add((1 << cell) >>> 0));
  for (const line of profile.winningLines) {
    const clause = (line & support.universe) >>> 0;
    if (clause !== 0) dictionary.add(clause);
  }
  return dictionary;
}

function solveAndQualify(columns, rows, connect) {
  const profile = prepare(columns, rows, connect);
  const frontiers = new Array(profile.supports.length);
  const stats = {
    supports: profile.supports.length,
    winningLines: profile.winningLines.length,
    records: 0,
    clauses: 0,
    vocabularyViolations: 0,
    maxDictionary: 0,
    maxRankPlusLinesBound: 0,
    maxRecordsPerSupport: 0,
    maxClausesPerRecord: 0,
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

        let winner0 = cofactorFrontier(child.winner0, landingCell, mover, 0);
        let winner1 = cofactorFrontier(child.winner1, landingCell, mover, 1);

        const terminalRequirements = [];
        for (const line of profile.incidence[landingCell]) {
          const requirement = (line & ~(1 << landingCell)) >>> 0;
          if (subset(requirement, support.universe)) terminalRequirements.push(requirement);
        }

        if (terminalRequirements.length !== 0) {
          const moverRecords = terminalRequirements.map(terminalRecord).filter((record) => record !== null);
          if (mover === 0) winner0 = normalizeFrontier([...winner0, ...moverRecords]);
          else winner1 = normalizeFrontier([...winner1, ...moverRecords]);
          const blocker = normalizeRecord(terminalRequirements);
          if (blocker === null) {
            if (mover === 0) winner1 = []; else winner0 = [];
          } else if (mover === 0) winner1 = intersectFrontiers(winner1, [blocker]);
          else winner0 = intersectFrontiers(winner0, [blocker]);
        }

        if (aggregate0 === null) {
          aggregate0 = winner0;
          aggregate1 = winner1;
        } else if (mover === 0) {
          aggregate0 = normalizeFrontier([...aggregate0, ...winner0]);
          aggregate1 = intersectFrontiers(aggregate1, winner1);
        } else {
          aggregate0 = intersectFrontiers(aggregate0, winner0);
          aggregate1 = normalizeFrontier([...aggregate1, ...winner1]);
        }
      }

      const frontier = { winner0: aggregate0 ?? [], winner1: aggregate1 ?? [] };
      frontiers[supportIndex] = frontier;
      const dictionary = vocabularyForSupport(profile, support);
      stats.maxDictionary = Math.max(stats.maxDictionary, dictionary.size);
      stats.maxRankPlusLinesBound = Math.max(stats.maxRankPlusLinesBound, rank + profile.winningLines.length);
      const recordCount = frontier.winner0.length + frontier.winner1.length;
      stats.records += recordCount;
      stats.maxRecordsPerSupport = Math.max(stats.maxRecordsPerSupport, recordCount);

      for (const family of [frontier.winner0, frontier.winner1]) {
        for (const record of family) {
          stats.maxClausesPerRecord = Math.max(stats.maxClausesPerRecord, record.length);
          for (const clause of record) {
            stats.clauses += 1;
            if (!dictionary.has(clause)) {
              stats.vocabularyViolations += 1;
              throw new Error(`clause vocabulary violation on ${columns}x${rows} c${connect} support ${support.key}: 0x${clause.toString(16)}`);
            }
          }
        }
      }
    }
  }

  return stats;
}

const requested = process.argv.slice(2).map(Number);
const geometries = requested.length === 3
  ? [requested]
  : [
      [3, 3, 3], [3, 4, 3], [3, 5, 3], [4, 3, 2], [4, 3, 3],
      [4, 4, 3], [4, 4, 4], [4, 5, 4], [5, 3, 4], [5, 4, 4],
    ];

const started = performance.now();
const results = geometries.map(([columns, rows, connect]) => ({
  columns, rows, connect,
  ...solveAndQualify(columns, rows, connect),
}));

process.stdout.write(`${JSON.stringify({
  schemaVersion: 1,
  kind: 'connect4-bsfp-support-local-clause-vocabulary-qualification',
  semanticClaim: 'persistent clause in D(S)=singletons(S) union nonempty {line intersect S}',
  results,
  elapsedMs: performance.now() - started,
}, null, 2)}\n`);
