#!/usr/bin/env node

// Exact representation qualifier for the bounded legal-slice clause guard at
// >64 dictionary IDs. Uses real full-support clause dictionaries for 6x5 c4
// and 7x6 c4; no game search or solved data is involved.

function pop32(mask) {
  let value = mask >>> 0;
  let count = 0;
  while (value !== 0) { value &= value - 1; count += 1; }
  return count;
}

function subset32(left, right) { return ((left & ~right) >>> 0) === 0; }

function setBits32(mask) {
  const result = [];
  let value = mask >>> 0;
  while (value !== 0) {
    const bit = (value & -value) >>> 0;
    result.push(31 - Math.clz32(bit));
    value = (value & (value - 1)) >>> 0;
  }
  return result;
}

function createWinningLines(columns, rows, connect) {
  const result = [];
  const index = (column, row) => row * columns + column;
  for (let row = 0; row < rows; row += 1) for (let column = 0; column <= columns - connect; column += 1) {
    let mask = 0; for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row); result.push(mask >>> 0);
  }
  for (let column = 0; column < columns; column += 1) for (let row = 0; row <= rows - connect; row += 1) {
    let mask = 0; for (let step = 0; step < connect; step += 1) mask |= 1 << index(column, row + step); result.push(mask >>> 0);
  }
  for (let column = 0; column <= columns - connect; column += 1) for (let row = 0; row <= rows - connect; row += 1) {
    let mask = 0; for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row + step); result.push(mask >>> 0);
  }
  for (let column = 0; column <= columns - connect; column += 1) for (let row = connect - 1; row < rows; row += 1) {
    let mask = 0; for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row - step); result.push(mask >>> 0);
  }
  return [...new Set(result)];
}

function fullSupport(columns, rows) {
  if (columns * rows >= 31) throw new RangeError('u32 cell backend requires fewer than 31 cells');
  return ((1 << (columns * rows)) - 1) >>> 0;
}

function dictionaryForFullSupport(columns, rows, connect) {
  const universe = fullSupport(columns, rows);
  const values = new Set();
  for (let cell = 0; cell < columns * rows; cell += 1) values.add((1 << cell) >>> 0);
  for (const line of createWinningLines(columns, rows, connect)) values.add((line & universe) >>> 0);
  return [...values].sort((a, b) => pop32(a) - pop32(b) || a - b);
}

function normalizeRecord(clauses) {
  const unique = [...new Set(clauses.map((value) => value >>> 0))];
  if (unique.some((value) => value === 0)) return null;
  unique.sort((a, b) => pop32(a) - pop32(b) || a - b);
  const result = [];
  outer: for (const clause of unique) {
    for (const retained of result) if (subset32(retained, clause)) continue outer;
    result.push(clause);
  }
  return result;
}

function boundedCapacityKeepRecord(record, universe, exactCount) {
  let forced = 0;
  const residual = [];
  for (const clause of record) {
    if (pop32(clause) === 1) forced = (forced | clause) >>> 0;
    else residual.push(clause);
  }
  const forcedCount = pop32(forced);
  if (forcedCount > exactCount) return false;
  const unsatisfied = residual.filter((clause) => (clause & forced) === 0);
  if (unsatisfied.length === 0) return true;
  if (forcedCount === exactCount) return false;
  if (forcedCount + 1 !== exactCount) return true;
  let common = (universe & ~forced) >>> 0;
  for (const clause of unsatisfied) common &= clause;
  return common !== 0;
}

function wordCountFor(bitCount) { return Math.max(1, Math.ceil(bitCount / 32)); }
function zeroWords(count) { return new Array(count).fill(0); }
function setWordBit(words, id) { const word = Math.floor(id / 32); words[word] = (words[word] | ((1 << (id % 32)) >>> 0)) >>> 0; }
function subsetWords(left, right) { return left.every((value, index) => ((value & ~right[index]) >>> 0) === 0); }

function coverageOf(record, dictionary, wordCount) {
  const words = zeroWords(wordCount);
  for (let id = 0; id < dictionary.length; id += 1) {
    for (const clause of record) {
      if (subset32(clause, dictionary[id])) { setWordBit(words, id); break; }
    }
  }
  return words;
}

function createCoverageMetadata(dictionary, cells, wordCount) {
  const singletonMask = zeroWords(wordCount);
  const singletonBits = Array.from({ length: cells }, () => zeroWords(wordCount));
  const contains = Array.from({ length: cells }, () => zeroWords(wordCount));
  for (let id = 0; id < dictionary.length; id += 1) {
    const clause = dictionary[id];
    if (pop32(clause) === 1) {
      setWordBit(singletonMask, id);
      const cell = 31 - Math.clz32(clause);
      setWordBit(singletonBits[cell], id);
    }
    for (const cell of setBits32(clause)) setWordBit(contains[cell], id);
  }
  return { singletonMask, singletonBits, contains };
}

function capacityKeepCoverage(candidate, metadata, universe, exactCount) {
  let forcedCount = 0;
  for (let word = 0; word < candidate.length; word += 1) forcedCount += pop32(candidate[word] & metadata.singletonMask[word]);
  if (forcedCount > exactCount) return false;

  let forcedCells = 0;
  for (let cell = 0; cell < metadata.singletonBits.length; cell += 1) {
    for (let word = 0; word < candidate.length; word += 1) {
      if ((candidate[word] & metadata.singletonBits[cell][word]) !== 0) {
        forcedCells = (forcedCells | ((1 << cell) >>> 0)) >>> 0;
        break;
      }
    }
  }

  const satisfied = zeroWords(candidate.length);
  for (const cell of setBits32(forcedCells)) {
    for (let word = 0; word < candidate.length; word += 1) satisfied[word] = (satisfied[word] | metadata.contains[cell][word]) >>> 0;
  }
  const extra = candidate.map((value, word) => (value & ~satisfied[word]) >>> 0);
  if (extra.every((value) => value === 0)) return true;
  if (forcedCount === exactCount) return false;
  if (forcedCount + 1 !== exactCount) return true;

  for (const cell of setBits32((universe & ~forcedCells) >>> 0)) {
    if (subsetWords(extra, metadata.contains[cell])) return true;
  }
  return false;
}

function chooseCellsOutside(cells, forbiddenMask, count, requiredMask = 0) {
  const chosen = [];
  for (const cell of setBits32(requiredMask)) chosen.push(cell);
  for (let cell = 0; cell < cells && chosen.length < count; cell += 1) {
    const bit = (1 << cell) >>> 0;
    if ((requiredMask & bit) !== 0) continue;
    if ((forbiddenMask & bit) !== 0) continue;
    chosen.push(cell);
  }
  if (chosen.length !== count) return null;
  return chosen;
}

function singletonClauses(cells) { return cells.map((cell) => (1 << cell) >>> 0); }

function findLineId(dictionary, predicate, minimumId) {
  for (let id = dictionary.length - 1; id >= minimumId; id -= 1) {
    const clause = dictionary[id];
    if (pop32(clause) > 1 && predicate(clause, id)) return { id, clause };
  }
  return null;
}

function buildCases(columns, rows, connect) {
  const cells = columns * rows;
  const universe = fullSupport(columns, rows);
  const dictionary = dictionaryForFullSupport(columns, rows, connect);
  const wordCount = wordCountFor(dictionary.length);
  const metadata = createCoverageMetadata(dictionary, cells, wordCount);
  const exactCount = Math.ceil(cells / 2);
  const highestWordStart = (wordCount - 1) * 32;
  const highest = findLineId(dictionary, () => true, highestWordStart);
  if (!highest) throw new Error('no non-singleton clause in highest coverage word');

  const cases = [];
  function add(name, clauses, expectedClass) {
    const record = normalizeRecord(clauses);
    if (record === null) throw new Error(`${name}: normalized to contradiction`);
    const authority = boundedCapacityKeepRecord(record, universe, exactCount);
    const coverage = coverageOf(record, dictionary, wordCount);
    const packed = capacityKeepCoverage(coverage, metadata, universe, exactCount);
    if (authority !== packed) throw new Error(`${name}: packed guard disagrees with clause authority`);
    if (expectedClass === 'reject' && authority !== false) throw new Error(`${name}: expected rejection`);
    if (expectedClass === 'keep' && authority !== true) throw new Error(`${name}: expected keep`);
    if ((coverage[wordCount - 1] >>> 0) === 0) throw new Error(`${name}: does not exercise highest coverage word`);
    cases.push({ name, expectedClass, authority, dictionarySize: dictionary.length, wordCount, highestWordNonzero: true });
  }

  // Forced singleton overflow. Add the highest-ID line as a cross-word term;
  // overflow remains sufficient to reject.
  const overflowCells = chooseCellsOutside(cells, 0, exactCount + 1);
  add('forced-overflow-high-word', [...singletonClauses(overflowCells), highest.clause], 'reject');

  // Zero slack with an unsatisfied high-ID line.
  const zeroRejectCells = chooseCellsOutside(cells, highest.clause, exactCount);
  add('zero-slack-unsatisfied-high-word', [...singletonClauses(zeroRejectCells), highest.clause], 'reject');

  // Zero slack with the same high-ID line already satisfied. Its high coverage
  // bit remains present through the upward closure of the selected singleton.
  const witnessCell = setBits32(highest.clause)[0];
  const witnessBit = (1 << witnessCell) >>> 0;
  const zeroKeepCells = chooseCellsOutside(cells, highest.clause, exactCount, witnessBit);
  add('zero-slack-satisfied-high-word', [...singletonClauses(zeroKeepCells), highest.clause], 'keep');

  // One free stone: find a high-word line pair with a real common witness.
  let feasiblePair = null;
  let infeasiblePair = null;
  for (let leftId = highestWordStart; leftId < dictionary.length; leftId += 1) {
    const left = dictionary[leftId];
    if (pop32(left) <= 1) continue;
    for (let rightId = Math.max(highestWordStart, leftId + 1); rightId < dictionary.length; rightId += 1) {
      const right = dictionary[rightId];
      if (pop32(right) <= 1) continue;
      const intersection = (left & right) >>> 0;
      if (intersection !== 0 && feasiblePair === null) feasiblePair = { left, right };
      if (intersection === 0 && infeasiblePair === null) infeasiblePair = { left, right };
    }
  }
  if (!feasiblePair) throw new Error('no feasible high-word line pair found');
  if (!infeasiblePair) throw new Error('no infeasible high-word line pair found');

  const feasibleForced = chooseCellsOutside(cells, (feasiblePair.left | feasiblePair.right) >>> 0, exactCount - 1);
  add('one-slack-feasible-high-word', [...singletonClauses(feasibleForced), feasiblePair.left, feasiblePair.right], 'keep');

  const infeasibleForced = chooseCellsOutside(cells, (infeasiblePair.left | infeasiblePair.right) >>> 0, exactCount - 1);
  add('one-slack-infeasible-high-word', [...singletonClauses(infeasibleForced), infeasiblePair.left, infeasiblePair.right], 'reject');

  // Add one case per highest-word line at zero slack to broaden coverage.
  let sweepRejects = 0;
  for (let id = highestWordStart; id < dictionary.length; id += 1) {
    const line = dictionary[id];
    if (pop32(line) <= 1) continue;
    const forced = chooseCellsOutside(cells, line, exactCount);
    if (!forced) continue;
    add(`zero-slack-sweep-id-${id}`, [...singletonClauses(forced), line], 'reject');
    sweepRejects += 1;
  }

  return {
    geometry: { columns, rows, connect },
    cells,
    winningLines: createWinningLines(columns, rows, connect).length,
    dictionarySize: dictionary.length,
    wordCount,
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
  [7, 4, 4],
];

const results = geometries.map((geometry) => buildCases(...geometry));
const output = {
  schemaVersion: 1,
  kind: 'connect4-bsfp-multiword-capacity-guard-qualification',
  authority: 'variable-array clause bounded-capacity guard',
  candidate: 'generic multiword upward-coverage bounded-capacity guard',
  results,
  mismatchTotal: 0,
  caseTotal: results.reduce((sum, result) => sum + result.caseCount, 0),
};
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
