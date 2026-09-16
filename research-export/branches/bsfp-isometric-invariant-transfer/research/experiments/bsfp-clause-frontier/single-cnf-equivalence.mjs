#!/usr/bin/env node

/**
 * Exact control for the fully distributed monotone-CNF representation.
 *
 * This is intentionally a comparison/rejection candidate. Each player's entire
 * winner family at one support is stored as one monotone CNF rather than the
 * partially factored OR-of-CNF clause frontier.
 *
 * It is exact, but existential action union requires distributive clause
 * products and can move the Cartesian explosion to the opposite parity.
 */

import { performance } from 'node:perf_hooks';

function popcount(mask) {
  let value = mask >>> 0;
  let count = 0;
  while (value !== 0) { value &= value - 1; count += 1; }
  return count;
}
function subset(left, right) { return (left & ~right) === 0; }
function forEachBit(mask, callback) {
  let value = mask >>> 0;
  let bit = 0;
  while (value !== 0) {
    if ((value & 1) !== 0) callback(bit);
    value >>>= 1;
    bit += 1;
  }
}
function normalizeMinimal(masks) {
  const ordered = [...new Set(masks.map((value) => value >>> 0))]
    .sort((left, right) => popcount(left) - popcount(right) || left - right);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (subset(retained, candidate)) continue outer;
    result.push(candidate);
  }
  return result;
}
function winningLines(columns, rows, connect) {
  const result = [];
  const index = (column, row) => row * columns + column;
  for (let row = 0; row < rows; row += 1) for (let column = 0; column <= columns - connect; column += 1) {
    let mask = 0; for (let i = 0; i < connect; i += 1) mask |= 1 << index(column + i, row); result.push(mask >>> 0);
  }
  for (let column = 0; column < columns; column += 1) for (let row = 0; row <= rows - connect; row += 1) {
    let mask = 0; for (let i = 0; i < connect; i += 1) mask |= 1 << index(column, row + i); result.push(mask >>> 0);
  }
  for (let column = 0; column <= columns - connect; column += 1) for (let row = 0; row <= rows - connect; row += 1) {
    let mask = 0; for (let i = 0; i < connect; i += 1) mask |= 1 << index(column + i, row + i); result.push(mask >>> 0);
  }
  for (let column = 0; column <= columns - connect; column += 1) for (let row = connect - 1; row < rows; row += 1) {
    let mask = 0; for (let i = 0; i < connect; i += 1) mask |= 1 << index(column + i, row - i); result.push(mask >>> 0);
  }
  return result;
}
function supports(columns, rows) {
  const heights = new Array(columns).fill(0);
  const result = [];
  function visit(column) {
    if (column === columns) {
      let universe = 0; let rank = 0;
      for (let c = 0; c < columns; c += 1) for (let row = 0; row < heights[c]; row += 1) { universe |= 1 << (row * columns + c); rank += 1; }
      result.push({ heights: heights.slice(), universe: universe >>> 0, rank, key: heights.join(',') });
      return;
    }
    for (let value = 0; value <= rows; value += 1) { heights[column] = value; visit(column + 1); }
  }
  visit(0);
  return result;
}
function prepare(columns, rows, connect) {
  if (columns * rows >= 31) throw new RangeError('small control uses u32 masks');
  const lines = winningLines(columns, rows, connect);
  const incidence = Array.from({ length: columns * rows }, () => []);
  for (const line of lines) forEachBit(line, (cell) => incidence[cell].push(line));
  const allSupports = supports(columns, rows);
  const supportByKey = new Map(allSupports.map((support, index) => [support.key, index]));
  const byRank = Array.from({ length: columns * rows + 1 }, () => []);
  allSupports.forEach((support, index) => byRank[support.rank].push(index));
  return { lines, incidence, supports: allSupports, supportByKey, byRank };
}

// Positive-generator DNF authority.
function cofactorGenerator(frontier, cell, mover, beneficiary) {
  const bit = 1 << cell; const result = [];
  if (mover === beneficiary) for (const value of frontier) result.push((value & ~bit) >>> 0);
  else for (const value of frontier) if ((value & bit) === 0) result.push(value);
  return normalizeMinimal(result);
}
function unionGenerators(left, right) { return normalizeMinimal([...left, ...right]); }
function intersectGenerators(left, right, stats) {
  const result = [];
  for (const a of left) for (const b of right) { stats.pairs += 1; result.push((a | b) >>> 0); }
  return normalizeMinimal(result);
}
function blockerGenerators(requirement) {
  const result = []; forEachBit(requirement, (cell) => result.push((1 << cell) >>> 0)); return normalizeMinimal(result);
}
function solveOwnership(profile, columns, rows) {
  const frontiers = new Array(profile.supports.length); const stats = { pairs: 0, records: 0, maxRecords: 0 };
  for (let rank = columns * rows; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    for (const supportIndex of profile.byRank[rank]) {
      const support = profile.supports[supportIndex]; let aggregate0 = null; let aggregate1 = null;
      for (let column = 0; column < columns; column += 1) {
        const row = support.heights[column]; if (row >= rows) continue;
        const childHeights = support.heights.slice(); childHeights[column] += 1;
        const child = frontiers[profile.supportByKey.get(childHeights.join(','))]; const cell = row * columns + column;
        let winner0 = cofactorGenerator(child.winner0, cell, mover, 0); let winner1 = cofactorGenerator(child.winner1, cell, mover, 1);
        const terminals = [];
        for (const line of profile.incidence[cell]) { const q = (line & ~(1 << cell)) >>> 0; if (subset(q, support.universe)) terminals.push(q); }
        if (terminals.length !== 0) {
          if (mover === 0) { winner0 = unionGenerators(winner0, terminals); for (const q of terminals) winner1 = intersectGenerators(winner1, blockerGenerators(q), stats); }
          else { winner1 = unionGenerators(winner1, terminals); for (const q of terminals) winner0 = intersectGenerators(winner0, blockerGenerators(q), stats); }
        }
        if (aggregate0 === null) { aggregate0 = winner0; aggregate1 = winner1; }
        else if (mover === 0) { aggregate0 = unionGenerators(aggregate0, winner0); aggregate1 = intersectGenerators(aggregate1, winner1, stats); }
        else { aggregate0 = intersectGenerators(aggregate0, winner0, stats); aggregate1 = unionGenerators(aggregate1, winner1); }
      }
      const frontier = { winner0: aggregate0 ?? [], winner1: aggregate1 ?? [] }; frontiers[supportIndex] = frontier;
      const count = frontier.winner0.length + frontier.winner1.length; stats.records += count; stats.maxRecords = Math.max(stats.maxRecords, count);
    }
  }
  return { frontiers, stats };
}

// One canonical monotone CNF. null = false; [] = true.
function normalizeCnf(clauses) {
  if (clauses === null) return null;
  const values = [...new Set(clauses.map((value) => value >>> 0))];
  if (values.some((value) => value === 0)) return null;
  return normalizeMinimal(values);
}
function andCnf(left, right) {
  if (left === null || right === null) return null;
  return normalizeCnf([...left, ...right]);
}
function orCnf(left, right, stats) {
  if (left === null) return right === null ? null : right.slice();
  if (right === null) return left.slice();
  if (left.length === 0 || right.length === 0) return [];
  const result = [];
  for (const a of left) for (const b of right) { stats.pairs += 1; result.push((a | b) >>> 0); }
  return normalizeCnf(result);
}
function cofactorCnf(cnf, cell, mover, beneficiary) {
  if (cnf === null) return null;
  const bit = 1 << cell; const result = [];
  if (mover === beneficiary) {
    for (const clause of cnf) if ((clause & bit) === 0) result.push(clause);
  } else {
    for (const clause of cnf) { const reduced = (clause & ~bit) >>> 0; if (reduced === 0) return null; result.push(reduced); }
  }
  return normalizeCnf(result);
}
function terminalCnf(requirement) {
  const clauses = []; forEachBit(requirement, (cell) => clauses.push((1 << cell) >>> 0)); return normalizeCnf(clauses);
}
function solveCnf(profile, columns, rows) {
  const frontiers = new Array(profile.supports.length); const stats = { pairs: 0, clauses: 0, maxClauses: 0 };
  for (let rank = columns * rows; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    for (const supportIndex of profile.byRank[rank]) {
      const support = profile.supports[supportIndex]; let aggregate0 = null; let aggregate1 = null; let initialized = false;
      for (let column = 0; column < columns; column += 1) {
        const row = support.heights[column]; if (row >= rows) continue;
        const childHeights = support.heights.slice(); childHeights[column] += 1;
        const child = frontiers[profile.supportByKey.get(childHeights.join(','))]; const cell = row * columns + column;
        let winner0 = cofactorCnf(child.winner0, cell, mover, 0); let winner1 = cofactorCnf(child.winner1, cell, mover, 1);
        const terminals = [];
        for (const line of profile.incidence[cell]) { const q = (line & ~(1 << cell)) >>> 0; if (subset(q, support.universe)) terminals.push(q); }
        if (terminals.length !== 0) {
          if (mover === 0) { for (const q of terminals) winner0 = orCnf(winner0, terminalCnf(q), stats); winner1 = andCnf(winner1, normalizeCnf(terminals)); }
          else { for (const q of terminals) winner1 = orCnf(winner1, terminalCnf(q), stats); winner0 = andCnf(winner0, normalizeCnf(terminals)); }
        }
        if (!initialized) { aggregate0 = winner0; aggregate1 = winner1; initialized = true; }
        else if (mover === 0) { aggregate0 = orCnf(aggregate0, winner0, stats); aggregate1 = andCnf(aggregate1, winner1); }
        else { aggregate0 = andCnf(aggregate0, winner0); aggregate1 = orCnf(aggregate1, winner1, stats); }
      }
      if (!initialized) { aggregate0 = null; aggregate1 = null; }
      frontiers[supportIndex] = { winner0: aggregate0, winner1: aggregate1 };
      for (const cnf of [aggregate0, aggregate1]) if (cnf !== null) { stats.clauses += cnf.length; stats.maxClauses = Math.max(stats.maxClauses, cnf.length); }
    }
  }
  return { frontiers, stats };
}
function minimalTransversals(cnf) {
  if (cnf === null) return [];
  let result = [0];
  for (const clause of cnf) {
    const next = [];
    for (const current of result) {
      if ((current & clause) !== 0) { next.push(current); continue; }
      forEachBit(clause, (cell) => next.push((current | (1 << cell)) >>> 0));
    }
    result = normalizeMinimal(next);
  }
  return result;
}
function equalMasks(left, right) {
  if (left.length !== right.length) return false;
  const a = [...left].sort((x, y) => x - y); const b = [...right].sort((x, y) => x - y);
  return a.every((value, index) => value === b[index]);
}
function compare(columns, rows, connect) {
  const profile = prepare(columns, rows, connect);
  let start = performance.now(); const ownership = solveOwnership(profile, columns, rows); const ownershipMs = performance.now() - start;
  start = performance.now(); const cnf = solveCnf(profile, columns, rows); const cnfMs = performance.now() - start;
  let winner0Mismatches = 0; let winner1Mismatches = 0;
  for (let index = 0; index < profile.supports.length; index += 1) {
    if (!equalMasks(minimalTransversals(cnf.frontiers[index].winner0), ownership.frontiers[index].winner0)) winner0Mismatches += 1;
    if (!equalMasks(minimalTransversals(cnf.frontiers[index].winner1), ownership.frontiers[index].winner1)) winner1Mismatches += 1;
  }
  return { columns, rows, connect, supports: profile.supports.length, winner0Mismatches, winner1Mismatches, ownershipMs, cnfMs, ownership: ownership.stats, cnf: cnf.stats };
}

const [columns, rows, connect] = process.argv.slice(2).map(Number);
const result = compare(columns, rows, connect);
if (result.winner0Mismatches !== 0 || result.winner1Mismatches !== 0) process.exitCode = 1;
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
