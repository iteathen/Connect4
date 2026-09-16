#!/usr/bin/env node

// Exact representation qualifier for >64-ID universal clause-frontier merges.
// The authority evolves the unfiltered beneficiary-relative clause-CNF
// recurrence from the 6x5 connect-4 terminal band through rank 27. Real P0
// universal merges at rank 27 are then filtered on the exact legal stone-count
// slice and compared against a three-u32 upward-coverage implementation.

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
  return result;
}

function createSupports(columns, rows, minimumRank) {
  const heights = new Array(columns).fill(0);
  const result = [];
  function visit(column, rank) {
    if (column === columns) {
      if (rank < minimumRank) return;
      let universe = 0;
      for (let current = 0; current < columns; current += 1) for (let row = 0; row < heights[current]; row += 1) universe |= 1 << (row * columns + current);
      result.push({ heights: heights.slice(), universe: universe >>> 0, rank, key: heights.join(',') });
      return;
    }
    for (let height = 0; height <= rows; height += 1) { heights[column] = height; visit(column + 1, rank + height); }
  }
  visit(0, 0);
  return result;
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

function recordKey(record) { return record.map((clause) => clause.toString(16)).join('.'); }

function recordImplies(left, right) {
  for (const required of right) {
    let covered = false;
    for (const available of left) if (subset32(available, required)) { covered = true; break; }
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
    for (let index = result.length - 1; index >= 0; index -= 1) if (recordImplies(result[index], candidate)) result.splice(index, 1);
    result.push(candidate);
  }
  return result;
}

function exactIntersect(left, right) {
  if (left.length === 0 || right.length === 0) return [];
  const candidates = [];
  for (const a of left) for (const b of right) {
    const combined = normalizeRecord([...a, ...b]);
    if (combined !== null) candidates.push(combined);
  }
  return normalizeFrontier(candidates);
}

function cofactorRecord(record, landingCell, mover, beneficiary) {
  const bit = (1 << landingCell) >>> 0;
  const result = [];
  if (mover === beneficiary) {
    for (const clause of record) if ((clause & bit) === 0) result.push(clause);
  } else {
    for (const clause of record) {
      const reduced = (clause & ~bit) >>> 0;
      if (reduced === 0) return null;
      result.push(reduced);
    }
  }
  return normalizeRecord(result);
}

function cofactorFrontier(frontier, landingCell, mover, beneficiary) {
  const result = [];
  for (const record of frontier) {
    const next = cofactorRecord(record, landingCell, mover, beneficiary);
    if (next !== null) result.push(next);
  }
  return normalizeFrontier(result);
}

function terminalRecord(requirement) {
  return normalizeRecord(setBits32(requirement).map((cell) => (1 << cell) >>> 0));
}

function localDictionary(winningLines, support) {
  const values = new Set();
  for (const cell of setBits32(support.universe)) values.add((1 << cell) >>> 0);
  for (const line of winningLines) {
    const clause = (line & support.universe) >>> 0;
    if (clause !== 0) values.add(clause);
  }
  return [...values].sort((a, b) => pop32(a) - pop32(b) || a - b);
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

function filteredIntersectAuthority(left, right, support, exactCount) {
  const candidates = [];
  let rejected = 0;
  for (const a of left) for (const b of right) {
    const combined = normalizeRecord([...a, ...b]);
    if (combined === null) continue;
    if (boundedCapacityKeepRecord(combined, support.universe, exactCount)) candidates.push(combined);
    else rejected += 1;
  }
  return { frontier: normalizeFrontier(candidates), rejected };
}

function wordCountFor(bits) { return Math.max(1, Math.ceil(bits / 32)); }
function zeroWords(count) { return new Array(count).fill(0); }
function setWordBit(words, id) { const word = Math.floor(id / 32); words[word] = (words[word] | ((1 << (id % 32)) >>> 0)) >>> 0; }
function orWords(left, right) { return left.map((value, index) => (value | right[index]) >>> 0); }
function popWords(words) { return words.reduce((sum, word) => sum + pop32(word), 0); }
function subsetWords(left, right) { return left.every((value, index) => ((value & ~right[index]) >>> 0) === 0); }
function wordsKey(words) { return words.map((word) => word.toString(16).padStart(8, '0')).join(':'); }

function coverageOf(record, dictionary, wordCount) {
  const words = zeroWords(wordCount);
  for (let id = 0; id < dictionary.length; id += 1) {
    for (const clause of record) {
      if (subset32(clause, dictionary[id])) { setWordBit(words, id); break; }
    }
  }
  return words;
}

function createCoverageMetadata(dictionary, support, wordCount) {
  const singletonMask = zeroWords(wordCount);
  const singletonBits = new Array(30).fill(null).map(() => zeroWords(wordCount));
  const contains = new Array(30).fill(null).map(() => zeroWords(wordCount));
  for (let id = 0; id < dictionary.length; id += 1) {
    const clause = dictionary[id];
    if (pop32(clause) === 1) {
      setWordBit(singletonMask, id);
      const cell = 31 - Math.clz32(clause);
      setWordBit(singletonBits[cell], id);
    }
    for (const cell of setBits32(clause)) setWordBit(contains[cell], id);
  }
  return { dictionary, supportUniverse: support.universe, singletonMask, singletonBits, contains };
}

function capacityKeepCoverage(candidate, metadata, exactCount) {
  let forcedCells = 0;
  let forcedCount = 0;
  for (let word = 0; word < candidate.length; word += 1) forcedCount += pop32(candidate[word] & metadata.singletonMask[word]);
  if (forcedCount > exactCount) return false;

  for (let cell = 0; cell < 30; cell += 1) {
    let selected = false;
    for (let word = 0; word < candidate.length; word += 1) {
      if ((candidate[word] & metadata.singletonBits[cell][word]) !== 0) { selected = true; break; }
    }
    if (selected) forcedCells = (forcedCells | ((1 << cell) >>> 0)) >>> 0;
  }

  const satisfied = zeroWords(candidate.length);
  for (const cell of setBits32(forcedCells)) {
    for (let word = 0; word < candidate.length; word += 1) satisfied[word] = (satisfied[word] | metadata.contains[cell][word]) >>> 0;
  }
  const extra = candidate.map((value, word) => (value & ~satisfied[word]) >>> 0);
  if (extra.every((value) => value === 0)) return true;
  if (forcedCount === exactCount) return false;
  if (forcedCount + 1 !== exactCount) return true;

  for (const cell of setBits32((metadata.supportUniverse & ~forcedCells) >>> 0)) {
    if (subsetWords(extra, metadata.contains[cell])) return true;
  }
  return false;
}

function normalizeCoverage(values) {
  const unique = new Map();
  for (const value of values) unique.set(wordsKey(value), value);
  const ordered = [...unique.values()].sort((a, b) => popWords(a) - popWords(b) || wordsKey(a).localeCompare(wordsKey(b)));
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (subsetWords(retained, candidate)) continue outer;
    result.push(candidate);
  }
  return result;
}

function compareMerge(left, right, support, winningLines, exactCount) {
  const dictionary = localDictionary(winningLines, support);
  const wordCount = wordCountFor(dictionary.length);
  if (wordCount < 3) return null;
  const metadata = createCoverageMetadata(dictionary, support, wordCount);
  const packedLeft = left.map((record) => coverageOf(record, dictionary, wordCount));
  const packedRight = right.map((record) => coverageOf(record, dictionary, wordCount));
  const packedCandidates = [];
  let packedRejected = 0;
  for (const a of packedLeft) for (const b of packedRight) {
    const candidate = orWords(a, b);
    if (capacityKeepCoverage(candidate, metadata, exactCount)) packedCandidates.push(candidate);
    else packedRejected += 1;
  }
  const packedFrontier = normalizeCoverage(packedCandidates);
  const authority = filteredIntersectAuthority(left, right, support, exactCount);
  const expected = normalizeCoverage(authority.frontier.map((record) => coverageOf(record, dictionary, wordCount)));
  const observedKeys = packedFrontier.map(wordsKey).sort();
  const expectedKeys = expected.map(wordsKey).sort();
  const mismatch = observedKeys.length !== expectedKeys.length || observedKeys.some((value, index) => value !== expectedKeys[index]);
  return {
    dictionarySize: dictionary.length,
    wordCount,
    rawPairs: left.length * right.length,
    leftRecords: left.length,
    rightRecords: right.length,
    authorityRejected: authority.rejected,
    packedRejected,
    authoritySurvivors: authority.frontier.length,
    packedSurvivors: packedFrontier.length,
    mismatch,
  };
}

function run() {
  const columns = 6, rows = 5, connect = 4, cells = columns * rows;
  const winningLines = createWinningLines(columns, rows, connect);
  const incidence = Array.from({ length: cells }, () => []);
  for (const line of winningLines) for (const cell of setBits32(line)) incidence[cell].push(line);
  const supports = createSupports(columns, rows, 27);
  const supportByKey = new Map(supports.map((support, index) => [support.key, index]));
  const byRank = Array.from({ length: cells + 1 }, () => []);
  supports.forEach((support, index) => byRank[support.rank].push(index));
  const frontiers = new Array(supports.length);
  const merges = [];

  for (let rank = cells; rank >= 27; rank -= 1) {
    const mover = rank & 1;
    for (const supportIndex of byRank[rank]) {
      const support = supports[supportIndex];
      let aggregate0 = null;
      let aggregate1 = null;
      for (let column = 0; column < columns; column += 1) {
        const row = support.heights[column];
        if (row >= rows) continue;
        const childHeights = support.heights.slice(); childHeights[column] += 1;
        const child = frontiers[supportByKey.get(childHeights.join(','))];
        const landingCell = row * columns + column;
        let winner0 = cofactorFrontier(child.winner0, landingCell, mover, 0);
        let winner1 = cofactorFrontier(child.winner1, landingCell, mover, 1);

        const terminalRequirements = [];
        for (const line of incidence[landingCell]) {
          const requirement = (line & ~(1 << landingCell)) >>> 0;
          if (subset32(requirement, support.universe)) terminalRequirements.push(requirement);
        }
        if (terminalRequirements.length !== 0) {
          const moverRecords = terminalRequirements.map(terminalRecord).filter((record) => record !== null);
          if (mover === 0) winner0 = normalizeFrontier([...winner0, ...moverRecords]); else winner1 = normalizeFrontier([...winner1, ...moverRecords]);
          const blocker = normalizeRecord(terminalRequirements);
          if (blocker === null) {
            if (mover === 0) winner1 = []; else winner0 = [];
          } else if (mover === 0) winner1 = exactIntersect(winner1, [blocker]);
          else winner0 = exactIntersect(winner0, [blocker]);
        }

        if (aggregate0 === null) {
          aggregate0 = winner0; aggregate1 = winner1;
        } else if (mover === 0) {
          aggregate0 = normalizeFrontier([...aggregate0, ...winner0]);
          aggregate1 = exactIntersect(aggregate1, winner1);
        } else {
          if (rank === 27 && aggregate0.length !== 0 && winner0.length !== 0) {
            const comparison = compareMerge(aggregate0, winner0, support, winningLines, Math.ceil(rank / 2));
            if (comparison !== null) merges.push({ supportHeights: support.heights.slice(), column, ...comparison });
          }
          aggregate0 = exactIntersect(aggregate0, winner0);
          aggregate1 = normalizeFrontier([...aggregate1, ...winner1]);
        }
      }
      frontiers[supportIndex] = { winner0: aggregate0 ?? [], winner1: aggregate1 ?? [] };
    }
  }

  if (merges.length === 0) throw new Error('no >64-ID rank-27 universal merges were captured');
  const mismatchTotal = merges.filter((merge) => merge.mismatch || merge.authorityRejected !== merge.packedRejected || merge.authoritySurvivors !== merge.packedSurvivors).length;
  const hottest = [...merges].sort((a, b) => b.rawPairs - a.rawPairs)[0];
  const output = {
    schemaVersion: 1,
    kind: 'connect4-bsfp-multiword-universal-coverage-qualification',
    geometry: { columns, rows, connect },
    authority: 'unfiltered variable-array beneficiary-relative clause recurrence; exact legal-slice filter only at captured merge',
    candidate: 'three-u32 upward-coverage OR + exact bounded-capacity filter + multiword subset-minimal normalization',
    solvedSupportCounts: { rank30: byRank[30].length, rank29: byRank[29].length, rank28: byRank[28].length, rank27: byRank[27].length },
    mergeCount: merges.length,
    mismatchTotal,
    maximumDictionary: Math.max(...merges.map((merge) => merge.dictionarySize)),
    maximumWordCount: Math.max(...merges.map((merge) => merge.wordCount)),
    hottest,
    totals: {
      rawPairs: merges.reduce((sum, merge) => sum + merge.rawPairs, 0),
      authorityRejected: merges.reduce((sum, merge) => sum + merge.authorityRejected, 0),
      packedRejected: merges.reduce((sum, merge) => sum + merge.packedRejected, 0),
      authoritySurvivors: merges.reduce((sum, merge) => sum + merge.authoritySurvivors, 0),
      packedSurvivors: merges.reduce((sum, merge) => sum + merge.packedSurvivors, 0),
    },
  };
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (mismatchTotal !== 0) process.exitCode = 1;
}

run();
