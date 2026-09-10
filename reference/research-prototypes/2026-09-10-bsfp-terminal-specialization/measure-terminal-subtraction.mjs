import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';
import {
  normalizeMaximalPacked42Antichain,
  normalizeMinimalPacked42Antichain,
  solveBsfpPacked42AntichainRootWdlRolling,
} from '../../../components/bsfp/ownership-antichain-packed42-rolling-solver.mjs';

const TWO32 = 0x1_0000_0000;
const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
  Object.freeze({ columns: 5, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 5, connect: 4 }),
]);

function low32(value) { return value >>> 0; }
function high10(value) { return Math.floor(value / TWO32) >>> 0; }
function pack42(low, high) { return (low >>> 0) + (high >>> 0) * TWO32; }
function and42(left, right) { return pack42((low32(left) & low32(right)) >>> 0, (high10(left) & high10(right)) >>> 0); }
function subset42(left, right) { return ((low32(left) & ~low32(right)) >>> 0) === 0 && ((high10(left) & ~high10(right)) >>> 0) === 0; }
function intersects42(left, right) { return ((low32(left) & low32(right)) >>> 0) !== 0 || ((high10(left) & high10(right)) >>> 0) !== 0; }
function hasCell(mask, cell) { return cell < 32 ? (low32(mask) & ((1 << cell) >>> 0)) !== 0 : (high10(mask) & (1 << (cell - 32))) !== 0; }
function setCell(mask, cell) { return cell < 32 ? pack42((low32(mask) | ((1 << cell) >>> 0)) >>> 0, high10(mask)) : pack42(low32(mask), (high10(mask) | (1 << (cell - 32))) >>> 0); }
function clearCell(mask, cell) { return cell < 32 ? pack42((low32(mask) & ~((1 << cell) >>> 0)) >>> 0, high10(mask)) : pack42(low32(mask), (high10(mask) & ~(1 << (cell - 32))) >>> 0); }

function setCells(mask) {
  const cells = [];
  let low = low32(mask);
  while (low !== 0) {
    const bit = (low & -low) >>> 0;
    cells.push(31 - Math.clz32(bit));
    low = (low & (low - 1)) >>> 0;
  }
  let high = high10(mask);
  while (high !== 0) {
    const bit = (high & -high) >>> 0;
    cells.push(32 + 31 - Math.clz32(bit));
    high = (high & (high - 1)) >>> 0;
  }
  return cells;
}

function sameFrontier(left, right) {
  if (left.length !== right.length) return false;
  const a = [...left].sort((x, y) => x - y);
  const b = [...right].sort((x, y) => x - y);
  return a.every((value, index) => value === b[index]);
}

function supportUniverseMask(heights, columns) {
  let mask = 0;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < heights[column]; row += 1) mask = setCell(mask, row * columns + column);
  }
  return mask;
}

function lineIncidence(columns, rows, connect) {
  const cellCount = columns * rows;
  const incidence = Array.from({ length: cellCount }, () => []);
  for (const line of createConnectWinningLines({ columns, rows, connect })) {
    let mask = 0;
    for (const cell of line) mask = setCell(mask, cell);
    for (const cell of line) incidence[cell].push(mask);
  }
  return incidence;
}

function cofactorWins(frontier, landingCell, mover) {
  if (mover === 0) return normalizeMinimalPacked42Antichain(frontier.map((mask) => clearCell(mask, landingCell)));
  return normalizeMinimalPacked42Antichain(frontier.filter((mask) => !hasCell(mask, landingCell)));
}

function cofactorLosses(frontier, landingCell, mover) {
  if (mover === 0) return normalizeMaximalPacked42Antichain(frontier.filter((mask) => hasCell(mask, landingCell)).map((mask) => clearCell(mask, landingCell)));
  return normalizeMaximalPacked42Antichain(frontier.map((mask) => clearCell(mask, landingCell)));
}

function genericSubtractTerminalFromLosses(frontier, q, universe) {
  const cells = setCells(q);
  const candidates = [];
  for (const cap of frontier) {
    for (const cell of cells) candidates.push(and42(cap, clearCell(universe, cell)));
  }
  return normalizeMaximalPacked42Antichain(candidates);
}

function specializedSubtractTerminalFromLosses(frontier, q) {
  const cells = setCells(q);
  const candidates = [];
  for (const cap of frontier) {
    if (!subset42(q, cap)) candidates.push(cap);
    else for (const cell of cells) candidates.push(clearCell(cap, cell));
  }
  return normalizeMaximalPacked42Antichain(candidates);
}

function genericSubtractTerminalFromWins(frontier, q) {
  const cells = setCells(q);
  const candidates = [];
  for (const base of frontier) for (const cell of cells) candidates.push(setCell(base, cell));
  return normalizeMinimalPacked42Antichain(candidates);
}

function specializedSubtractTerminalFromWins(frontier, q) {
  const cells = setCells(q);
  const candidates = [];
  for (const base of frontier) {
    if (intersects42(base, q)) candidates.push(base);
    else for (const cell of cells) candidates.push(setCell(base, cell));
  }
  return normalizeMinimalPacked42Antichain(candidates);
}

function newStats() {
  return {
    terminalApplications: 0,
    inputFrontierRecords: 0,
    affectedRecords: 0,
    unaffectedRecords: 0,
    genericPairCandidates: 0,
    specializedCandidates: 0,
    exactMismatches: 0,
  };
}

function addStats(target, source) {
  for (const key of Object.keys(source)) target[key] += source[key];
}

function analyzeCase(spec) {
  const started = performance.now();
  const frontiers = new Map();
  const solved = solveBsfpPacked42AntichainRootWdlRolling({
    ...spec,
    onFrontier(item, frontier) { frontiers.set(item, frontier); },
  });
  const { support } = solved;
  const incidence = lineIncidence(spec.columns, spec.rows, spec.connect);
  const total = newStats();
  const byRank = Array.from({ length: support.maxRank + 1 }, (_, rank) => ({ rank, ...newStats() }));

  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
    const rank = support.ranks[supportIndex];
    if (rank === support.maxRank) continue;
    const mover = rank & 1;
    const heights = support.decodeHeights(supportIndex);
    const universe = supportUniverseMask(heights, spec.columns);
    for (let column = 0; column < spec.columns; column += 1) {
      const row = heights[column];
      if (row >= spec.rows) continue;
      const landingCell = row * spec.columns + column;
      const child = frontiers.get(supportIndex + support.weights[column]);
      assert.ok(child, `missing child frontier at support ${supportIndex}, column ${column}`);
      let opposite = mover === 0
        ? cofactorLosses(child.losses, landingCell, mover)
        : cofactorWins(child.wins, landingCell, mover);
      for (const line of incidence[landingCell]) {
        const q = clearCell(line, landingCell);
        if (!subset42(q, universe)) continue;
        const cells = setCells(q);
        const local = newStats();
        local.terminalApplications = 1;
        local.inputFrontierRecords = opposite.length;
        local.genericPairCandidates = opposite.length * cells.length;
        for (const record of opposite) {
          const affected = mover === 0 ? subset42(q, record) : !intersects42(record, q);
          if (affected) {
            local.affectedRecords += 1;
            local.specializedCandidates += cells.length;
          } else {
            local.unaffectedRecords += 1;
            local.specializedCandidates += 1;
          }
        }
        const generic = mover === 0
          ? genericSubtractTerminalFromLosses(opposite, q, universe)
          : genericSubtractTerminalFromWins(opposite, q);
        const specialized = mover === 0
          ? specializedSubtractTerminalFromLosses(opposite, q)
          : specializedSubtractTerminalFromWins(opposite, q);
        if (!sameFrontier(generic, specialized)) local.exactMismatches += 1;
        assert.equal(local.exactMismatches, 0, `terminal specialization mismatch at ${spec.columns}x${spec.rows}, support ${supportIndex}, column ${column}`);
        opposite = specialized;
        addStats(total, local);
        addStats(byRank[rank], local);
      }
    }
  }

  const usefulRanks = byRank.filter((entry) => entry.terminalApplications > 0).map((entry) => ({
    ...entry,
    candidateReduction: entry.genericPairCandidates === 0 ? 0 : 1 - entry.specializedCandidates / entry.genericPairCandidates,
    unaffectedFraction: entry.inputFrontierRecords === 0 ? 0 : entry.unaffectedRecords / entry.inputFrontierRecords,
  }));
  return Object.freeze({
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    rootWdl: solved.rootWdl,
    supports: support.itemCapacity,
    durationMs: performance.now() - started,
    ...total,
    candidateReduction: total.genericPairCandidates === 0 ? 0 : 1 - total.specializedCandidates / total.genericPairCandidates,
    unaffectedFraction: total.inputFrontierRecords === 0 ? 0 : total.unaffectedRecords / total.inputFrontierRecords,
    byRank: usefulRanks,
  });
}

const results = CASES.map(analyzeCase);
assert.ok(results.every((result) => result.exactMismatches === 0));
console.log(JSON.stringify({
  kind: 'connect4-bsfp-terminal-subtraction-specialization-research',
  outcome: 'exact-equivalent-on-tested-complete-games',
  results,
}, null, 2));
