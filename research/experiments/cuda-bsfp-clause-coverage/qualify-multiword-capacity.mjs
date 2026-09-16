#!/usr/bin/env node

// Exact representation qualifier for bounded legal-slice clause guards when
// BOTH cell sets and support-local coverage dictionaries cross one-u32/u64
// boundaries. No game search or solved data is used.

function wordCountForBits(bitCount) { return Math.max(1, Math.ceil(bitCount / 32)); }
function zeroWords(count) { return new Array(count).fill(0); }
function cloneWords(words) { return words.map((value) => value >>> 0); }
function setBit(words, id) {
  const word = Math.floor(id / 32);
  words[word] = (words[word] | ((1 << (id % 32)) >>> 0)) >>> 0;
}
function hasBit(words, id) { return (words[Math.floor(id / 32)] & ((1 << (id % 32)) >>> 0)) !== 0; }
function anyWords(words) { return words.some((value) => (value >>> 0) !== 0); }
function subsetWords(left, right) { return left.every((value, index) => ((value & ~right[index]) >>> 0) === 0); }
function intersectsWords(left, right) { return left.some((value, index) => ((value & right[index]) >>> 0) !== 0); }
function orWords(left, right) { return left.map((value, index) => (value | right[index]) >>> 0); }
function andWords(left, right) { return left.map((value, index) => (value & right[index]) >>> 0); }
function wordKey(words) { return words.map((value) => (value >>> 0).toString(16).padStart(8, '0')).join(':'); }
function compareWords(left, right) {
  for (let index = left.length - 1; index >= 0; index -= 1) {
    const a = left[index] >>> 0;
    const b = right[index] >>> 0;
    if (a !== b) return a < b ? -1 : 1;
  }
  return 0;
}
function pop32(mask) {
  let value = mask >>> 0;
  let count = 0;
  while (value !== 0) { value = (value & (value - 1)) >>> 0; count += 1; }
  return count;
}
function popWords(words) { return words.reduce((sum, value) => sum + pop32(value), 0); }
function setBitsWords(words, bitCount) {
  const result = [];
  for (let word = 0; word < words.length; word += 1) {
    let value = words[word] >>> 0;
    while (value !== 0) {
      const bit = (value & -value) >>> 0;
      const offset = 31 - Math.clz32(bit);
      const id = word * 32 + offset;
      if (id < bitCount) result.push(id);
      value = (value & (value - 1)) >>> 0;
    }
  }
  return result;
}

function fullMask(bitCount) {
  const words = zeroWords(wordCountForBits(bitCount));
  for (let id = 0; id < bitCount; id += 1) setBit(words, id);
  return words;
}
function singletonMask(bitCount, id) {
  const words = zeroWords(wordCountForBits(bitCount));
  setBit(words, id);
  return words;
}

function createWinningLines(columns, rows, connect) {
  const cells = columns * rows;
  const cellWords = wordCountForBits(cells);
  const result = [];
  const seen = new Set();
  const index = (column, row) => row * columns + column;
  function add(c0, r0, dc, dr) {
    const line = zeroWords(cellWords);
    for (let step = 0; step < connect; step += 1) setBit(line, index(c0 + dc * step, r0 + dr * step));
    const key = wordKey(line);
    if (!seen.has(key)) { seen.add(key); result.push(line); }
  }
  for (let row = 0; row < rows; row += 1) for (let column = 0; column <= columns - connect; column += 1) add(column, row, 1, 0);
  for (let column = 0; column < columns; column += 1) for (let row = 0; row <= rows - connect; row += 1) add(column, row, 0, 1);
  for (let column = 0; column <= columns - connect; column += 1) for (let row = 0; row <= rows - connect; row += 1) add(column, row, 1, 1);
  for (let column = 0; column <= columns - connect; column += 1) for (let row = connect - 1; row < rows; row += 1) add(column, row, 1, -1);
  return result;
}

function dictionaryForFullSupport(columns, rows, connect) {
  const cells = columns * rows;
  const values = new Map();
  for (let cell = 0; cell < cells; cell += 1) {
    const clause = singletonMask(cells, cell);
    values.set(wordKey(clause), clause);
  }
  for (const line of createWinningLines(columns, rows, connect)) values.set(wordKey(line), line);
  return [...values.values()].sort((a, b) => popWords(a) - popWords(b) || compareWords(a, b));
}

function normalizeRecord(clauses) {
  const unique = new Map();
  for (const clause of clauses) unique.set(wordKey(clause), cloneWords(clause));
  if ([...unique.values()].some((clause) => !anyWords(clause))) return null;
  const ordered = [...unique.values()].sort((a, b) => popWords(a) - popWords(b) || compareWords(a, b));
  const result = [];
  outer: for (const clause of ordered) {
    for (const retained of result) if (subsetWords(retained, clause)) continue outer;
    result.push(clause);
  }
  return result;
}

function boundedCapacityKeepRecord(record, universe, exactCount) {
  let forced = zeroWords(universe.length);
  const residual = [];
  for (const clause of record) {
    if (popWords(clause) === 1) forced = orWords(forced, clause);
    else residual.push(clause);
  }
  const forcedCount = popWords(forced);
  if (forcedCount > exactCount) return false;
  const unsatisfied = residual.filter((clause) => !intersectsWords(clause, forced));
  if (unsatisfied.length === 0) return true;
  if (forcedCount === exactCount) return false;
  if (forcedCount + 1 !== exactCount) return true;
  let common = universe.map((value, index) => (value & ~forced[index]) >>> 0);
  for (const clause of unsatisfied) common = andWords(common, clause);
  return anyWords(common);
}

function coverageOf(record, dictionary, coverageWords) {
  const words = zeroWords(coverageWords);
  for (let id = 0; id < dictionary.length; id += 1) {
    for (const clause of record) {
      if (subsetWords(clause, dictionary[id])) { setBit(words, id); break; }
    }
  }
  return words;
}

function createCoverageMetadata(dictionary, cells, coverageWords) {
  const singletonMaskCoverage = zeroWords(coverageWords);
  const singletonBits = Array.from({ length: cells }, () => zeroWords(coverageWords));
  const contains = Array.from({ length: cells }, () => zeroWords(coverageWords));
  for (let id = 0; id < dictionary.length; id += 1) {
    const clause = dictionary[id];
    const bits = setBitsWords(clause, cells);
    if (bits.length === 1) {
      setBit(singletonMaskCoverage, id);
      setBit(singletonBits[bits[0]], id);
    }
    for (const cell of bits) setBit(contains[cell], id);
  }
  return { singletonMaskCoverage, singletonBits, contains };
}

function capacityKeepCoverage(candidate, metadata, universe, cells, exactCount) {
  let forcedCount = 0;
  for (let word = 0; word < candidate.length; word += 1) {
    forcedCount += pop32(candidate[word] & metadata.singletonMaskCoverage[word]);
  }
  if (forcedCount > exactCount) return false;

  const forcedCells = zeroWords(universe.length);
  for (let cell = 0; cell < cells; cell += 1) {
    if (candidate.some((value, word) => ((value & metadata.singletonBits[cell][word]) >>> 0) !== 0)) setBit(forcedCells, cell);
  }

  const satisfied = zeroWords(candidate.length);
  for (const cell of setBitsWords(forcedCells, cells)) {
    for (let word = 0; word < candidate.length; word += 1) satisfied[word] = (satisfied[word] | metadata.contains[cell][word]) >>> 0;
  }
  const extra = candidate.map((value, word) => (value & ~satisfied[word]) >>> 0);
  if (!anyWords(extra)) return true;
  if (forcedCount === exactCount) return false;
  if (forcedCount + 1 !== exactCount) return true;

  for (let cell = 0; cell < cells; cell += 1) {
    if (hasBit(forcedCells, cell)) continue;
    if (subsetWords(extra, metadata.contains[cell])) return true;
  }
  return false;
}

function chooseCellsOutside(cells, forbidden, count, required = []) {
  const chosen = [...new Set(required)];
  if (chosen.some((cell) => cell < 0 || cell >= cells)) return null;
  for (let cell = 0; cell < cells && chosen.length < count; cell += 1) {
    if (chosen.includes(cell)) continue;
    if (hasBit(forbidden, cell)) continue;
    chosen.push(cell);
  }
  return chosen.length === count ? chosen : null;
}
function singletonClauses(cells, ids) { return ids.map((cell) => singletonMask(cells, cell)); }

function findLineId(dictionary, minimumId) {
  for (let id = dictionary.length - 1; id >= minimumId; id -= 1) {
    if (popWords(dictionary[id]) > 1) return { id, clause: dictionary[id] };
  }
  return null;
}

function buildCases(columns, rows, connect) {
  const cells = columns * rows;
  const universe = fullMask(cells);
  const dictionary = dictionaryForFullSupport(columns, rows, connect);
  const coverageWords = wordCountForBits(dictionary.length);
  const cellWords = wordCountForBits(cells);
  const metadata = createCoverageMetadata(dictionary, cells, coverageWords);
  const exactCount = Math.ceil(cells / 2);
  const highestWordStart = (coverageWords - 1) * 32;
  const highest = findLineId(dictionary, highestWordStart);
  if (!highest) throw new Error('no non-singleton clause in highest coverage word');
  const witness = setBitsWords(highest.clause, cells)[0];

  const cases = [];
  function add(name, clauses, expectedClass) {
    const record = normalizeRecord(clauses);
    if (record === null) throw new Error(`${name}: normalized to contradiction`);
    const authority = boundedCapacityKeepRecord(record, universe, exactCount);
    const coverage = coverageOf(record, dictionary, coverageWords);
    const packed = capacityKeepCoverage(coverage, metadata, universe, cells, exactCount);
    if (authority !== packed) throw new Error(`${name}: packed guard disagrees with clause authority`);
    if (expectedClass === 'reject' && authority !== false) throw new Error(`${name}: expected rejection`);
    if (expectedClass === 'keep' && authority !== true) throw new Error(`${name}: expected keep`);
    if ((coverage[coverageWords - 1] >>> 0) === 0) throw new Error(`${name}: does not exercise highest coverage word`);
    cases.push({ name, expectedClass, dictionarySize: dictionary.length, coverageWords, cellWords, highestWordNonzero: true });
  }

  const overflowForbidden = zeroWords(cellWords);
  const overflowCells = chooseCellsOutside(cells, overflowForbidden, exactCount + 1, [witness]);
  add('forced-overflow-high-word', [...singletonClauses(cells, overflowCells), highest.clause], 'reject');

  const zeroRejectCells = chooseCellsOutside(cells, highest.clause, exactCount);
  add('zero-slack-unsatisfied-high-word', [...singletonClauses(cells, zeroRejectCells), highest.clause], 'reject');

  const zeroKeepCells = chooseCellsOutside(cells, highest.clause, exactCount, [witness]);
  add('zero-slack-satisfied-high-word', [...singletonClauses(cells, zeroKeepCells), highest.clause], 'keep');

  let feasiblePair = null;
  let infeasiblePair = null;
  for (let leftId = highestWordStart; leftId < dictionary.length; leftId += 1) {
    const left = dictionary[leftId];
    if (popWords(left) <= 1) continue;
    for (let rightId = 0; rightId < dictionary.length; rightId += 1) {
      if (rightId === leftId) continue;
      const right = dictionary[rightId];
      if (popWords(right) <= 1) continue;
      if (intersectsWords(left, right) && feasiblePair === null) feasiblePair = { left, right };
      if (!intersectsWords(left, right) && infeasiblePair === null) infeasiblePair = { left, right };
      if (feasiblePair && infeasiblePair) break;
    }
    if (feasiblePair && infeasiblePair) break;
  }
  if (!feasiblePair) throw new Error('no feasible high-word line pair found');
  if (!infeasiblePair) throw new Error('no infeasible high-word line pair found');

  const feasibleUnion = orWords(feasiblePair.left, feasiblePair.right);
  const feasibleForced = chooseCellsOutside(cells, feasibleUnion, exactCount - 1);
  add('one-slack-feasible-high-word', [...singletonClauses(cells, feasibleForced), feasiblePair.left, feasiblePair.right], 'keep');

  const infeasibleUnion = orWords(infeasiblePair.left, infeasiblePair.right);
  const infeasibleForced = chooseCellsOutside(cells, infeasibleUnion, exactCount - 1);
  add('one-slack-infeasible-high-word', [...singletonClauses(cells, infeasibleForced), infeasiblePair.left, infeasiblePair.right], 'reject');

  let sweepRejects = 0;
  for (let id = highestWordStart; id < dictionary.length; id += 1) {
    const line = dictionary[id];
    if (popWords(line) <= 1) continue;
    const forced = chooseCellsOutside(cells, line, exactCount);
    if (!forced) continue;
    add(`zero-slack-sweep-id-${id}`, [...singletonClauses(cells, forced), line], 'reject');
    sweepRejects += 1;
  }

  return {
    geometry: { columns, rows, connect },
    cells,
    cellWords,
    winningLines: createWinningLines(columns, rows, connect).length,
    dictionarySize: dictionary.length,
    coverageWords,
    exactCount,
    highestWordStart,
    highestClauseId: highest.id,
    caseCount: cases.length,
    sweepRejects,
    cases,
  };
}

const geometries = [
  [6, 5, 4],
  [7, 6, 4],
  [8, 6, 4],
];

const results = geometries.map((geometry) => buildCases(...geometry));
const output = {
  schemaVersion: 2,
  kind: 'connect4-bsfp-multiword-cell-and-coverage-capacity-guard-qualification',
  authority: 'variable-array clause bounded-capacity guard over variable-width cell sets',
  candidate: 'generic multiword upward-coverage bounded-capacity guard',
  results,
  mismatchTotal: 0,
  caseTotal: results.reduce((sum, result) => sum + result.caseCount, 0),
};
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
