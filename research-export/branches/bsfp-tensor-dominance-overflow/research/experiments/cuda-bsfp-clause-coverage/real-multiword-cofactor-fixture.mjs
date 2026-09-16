// Exact terminal-band fixture for the variable-width clause-coverage cofactor.
//
// The authority is the beneficiary-relative variable-array clause recurrence.
// We solve only the 6x5 connect-4 terminal band (ranks 30, 29, 28), then
// capture rank-27 -> rank-28 support-edge cofactors. Rank-28 child dictionaries
// already exceed 64 IDs, so every selected record genuinely requires three
// u32 coverage words. No solved-game database or recursive search is used.

function popcount32(mask) {
  let value = mask >>> 0;
  let count = 0;
  while (value !== 0) { value &= value - 1; count += 1; }
  return count;
}

function subset32(left, right) {
  return ((left & ~right) >>> 0) === 0;
}

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
    let mask = 0;
    for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row);
    result.push(mask >>> 0);
  }
  for (let column = 0; column < columns; column += 1) for (let row = 0; row <= rows - connect; row += 1) {
    let mask = 0;
    for (let step = 0; step < connect; step += 1) mask |= 1 << index(column, row + step);
    result.push(mask >>> 0);
  }
  for (let column = 0; column <= columns - connect; column += 1) for (let row = 0; row <= rows - connect; row += 1) {
    let mask = 0;
    for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row + step);
    result.push(mask >>> 0);
  }
  for (let column = 0; column <= columns - connect; column += 1) for (let row = connect - 1; row < rows; row += 1) {
    let mask = 0;
    for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row - step);
    result.push(mask >>> 0);
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
      for (let current = 0; current < columns; current += 1) {
        for (let row = 0; row < heights[current]; row += 1) universe |= 1 << (row * columns + current);
      }
      result.push({ heights: heights.slice(), universe: universe >>> 0, rank, key: heights.join(',') });
      return;
    }
    for (let height = 0; height <= rows; height += 1) {
      heights[column] = height;
      visit(column + 1, rank + height);
    }
  }
  visit(0, 0);
  return result;
}

function normalizeRecord(clauses) {
  const unique = [...new Set(clauses.map((value) => value >>> 0))];
  if (unique.some((value) => value === 0)) return null;
  unique.sort((left, right) => popcount32(left) - popcount32(right) || left - right);
  const result = [];
  outer: for (const clause of unique) {
    for (const retained of result) if (subset32(retained, clause)) continue outer;
    result.push(clause);
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
      if (subset32(available, required)) { covered = true; break; }
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

function exactIntersect(left, right) {
  if (left.length === 0 || right.length === 0) return [];
  const candidates = [];
  for (const a of left) for (const b of right) {
    const record = normalizeRecord([...a, ...b]);
    if (record !== null) candidates.push(record);
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
  return [...values].sort((a, b) => popcount32(a) - popcount32(b) || a - b);
}

function wordsForBits(bitCount) {
  return Math.max(1, Math.ceil(bitCount / 32));
}

function zeroWords(wordCount) {
  return new Array(wordCount).fill(0);
}

function setCoverageBit(words, id) {
  const word = Math.floor(id / 32);
  const lane = id % 32;
  words[word] = (words[word] | ((1 << lane) >>> 0)) >>> 0;
}

function hasCoverageBit(words, id) {
  const word = Math.floor(id / 32);
  const lane = id % 32;
  return (words[word] & ((1 << lane) >>> 0)) !== 0;
}

function orWords(target, source) {
  for (let word = 0; word < target.length; word += 1) target[word] = (target[word] | source[word]) >>> 0;
}

function equalWords(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function coverageOf(record, dictionary, wordCount) {
  const words = zeroWords(wordCount);
  for (let id = 0; id < dictionary.length; id += 1) {
    for (const clause of record) {
      if (subset32(clause, dictionary[id])) {
        setCoverageBit(words, id);
        break;
      }
    }
  }
  return words;
}

function validMask(count, wordCount) {
  const words = zeroWords(wordCount);
  for (let id = 0; id < count; id += 1) setCoverageBit(words, id);
  return words;
}

function buildMap(childDictionary, parentDictionary, landingCell, ownerTrue, wordCount) {
  const landingBit = (1 << landingCell) >>> 0;
  const killMask = zeroWords(wordCount);
  const contributions = [];
  for (let id = 0; id < childDictionary.length; id += 1) {
    const clause = childDictionary[id];
    let reduced = clause;
    if (ownerTrue) {
      if ((clause & landingBit) !== 0) {
        contributions.push(zeroWords(wordCount));
        continue;
      }
    } else {
      reduced = (clause & ~landingBit) >>> 0;
      if (reduced === 0) {
        setCoverageBit(killMask, id);
        contributions.push(zeroWords(wordCount));
        continue;
      }
    }
    if (!parentDictionary.includes(reduced)) throw new Error('multiword cofactor map escaped parent dictionary');
    contributions.push(coverageOf([reduced], parentDictionary, wordCount));
  }
  return { validMask: validMask(childDictionary.length, wordCount), killMask, contributions };
}

function applyMap(input, map) {
  for (let word = 0; word < input.length; word += 1) {
    if ((input[word] & ~map.validMask[word]) !== 0) throw new Error('multiword input escaped child dictionary');
    if ((input[word] & map.killMask[word]) !== 0) return { keep: 0, words: zeroWords(input.length) };
  }
  const output = zeroWords(input.length);
  for (let id = 0; id < map.contributions.length; id += 1) {
    if (hasCoverageBit(input, id)) orWords(output, map.contributions[id]);
  }
  return { keep: 1, words: output };
}

function solveTerminalBand() {
  const columns = 6;
  const rows = 5;
  const connect = 4;
  const cells = columns * rows;
  const winningLines = createWinningLines(columns, rows, connect);
  const incidence = Array.from({ length: cells }, () => []);
  for (const line of winningLines) for (const cell of setBits32(line)) incidence[cell].push(line);

  // Solve ranks 30,29,28. Keep rank 27 only as the captured parent layer.
  const supports = createSupports(columns, rows, 27);
  const supportByKey = new Map(supports.map((support, index) => [support.key, index]));
  const byRank = Array.from({ length: cells + 1 }, () => []);
  supports.forEach((support, index) => byRank[support.rank].push(index));
  const frontiers = new Array(supports.length);

  for (let rank = cells; rank >= 28; rank -= 1) {
    const mover = rank & 1;
    for (const supportIndex of byRank[rank]) {
      const support = supports[supportIndex];
      let aggregate0 = null;
      let aggregate1 = null;
      for (let column = 0; column < columns; column += 1) {
        const row = support.heights[column];
        if (row >= rows) continue;
        const childHeights = support.heights.slice();
        childHeights[column] += 1;
        const childIndex = supportByKey.get(childHeights.join(','));
        const child = frontiers[childIndex];
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
          if (mover === 0) winner0 = normalizeFrontier([...winner0, ...moverRecords]);
          else winner1 = normalizeFrontier([...winner1, ...moverRecords]);
          const blocker = normalizeRecord(terminalRequirements);
          if (blocker === null) {
            if (mover === 0) winner1 = []; else winner0 = [];
          } else if (mover === 0) winner1 = exactIntersect(winner1, [blocker]);
          else winner0 = exactIntersect(winner0, [blocker]);
        }

        if (aggregate0 === null) {
          aggregate0 = winner0;
          aggregate1 = winner1;
        } else if (mover === 0) {
          aggregate0 = normalizeFrontier([...aggregate0, ...winner0]);
          aggregate1 = exactIntersect(aggregate1, winner1);
        } else {
          aggregate0 = exactIntersect(aggregate0, winner0);
          aggregate1 = normalizeFrontier([...aggregate1, ...winner1]);
        }
      }
      frontiers[supportIndex] = { winner0: aggregate0 ?? [], winner1: aggregate1 ?? [] };
    }
  }

  const segments = [];
  const mover = 27 & 1;
  for (const supportIndex of byRank[27]) {
    const parent = supports[supportIndex];
    for (let column = 0; column < columns; column += 1) {
      const row = parent.heights[column];
      if (row >= rows) continue;
      const childHeights = parent.heights.slice();
      childHeights[column] += 1;
      const childIndex = supportByKey.get(childHeights.join(','));
      const child = supports[childIndex];
      const childFrontier = frontiers[childIndex];
      const landingCell = row * columns + column;
      const childDictionary = localDictionary(winningLines, child);
      const parentDictionary = localDictionary(winningLines, parent);
      const wordCount = wordsForBits(Math.max(childDictionary.length, parentDictionary.length));
      if (wordCount < 3) continue;

      for (let beneficiary = 0; beneficiary <= 1; beneficiary += 1) {
        const frontier = beneficiary === 0 ? childFrontier.winner0 : childFrontier.winner1;
        if (frontier.length === 0) continue;
        const ownerTrue = mover === beneficiary;
        const map = buildMap(childDictionary, parentDictionary, landingCell, ownerTrue, wordCount);
        const input = frontier.map((record) => coverageOf(record, childDictionary, wordCount));
        const expected = frontier.map((record) => {
          const mapped = cofactorRecord(record, landingCell, mover, beneficiary);
          if (mapped === null) return { keep: 0, words: zeroWords(wordCount) };
          return { keep: 1, words: coverageOf(mapped, parentDictionary, wordCount) };
        });
        let killed = 0;
        for (let index = 0; index < input.length; index += 1) {
          const observed = applyMap(input[index], map);
          const authority = expected[index];
          if (observed.keep !== authority.keep || !equalWords(observed.words, authority.words)) {
            throw new Error('multiword packed map disagrees with clause-array authority');
          }
          if (authority.keep === 0) killed += 1;
        }
        segments.push({
          geometry: { columns, rows, connect },
          rank: parent.rank,
          parentSupportHeights: parent.heights.slice(),
          childSupportHeights: child.heights.slice(),
          landingCell,
          column,
          mover,
          beneficiary,
          ownerTrue,
          childDictionary,
          parentDictionary,
          wordCount,
          validMask: map.validMask,
          killMask: map.killMask,
          contributions: map.contributions,
          input,
          expected,
          killed,
        });
      }
    }
  }

  // Keep nontrivial examples from both relation classes, preferring more
  // records, then larger dictionaries, then stronger kill exercise.
  const selected = [];
  for (const ownerTrue of [true, false]) {
    const bucket = segments.filter((segment) => segment.ownerTrue === ownerTrue)
      .sort((a, b) => b.input.length - a.input.length
        || b.childDictionary.length - a.childDictionary.length
        || b.killed - a.killed)
      .slice(0, 4);
    selected.push(...bucket);
  }
  if (!selected.some((segment) => segment.ownerTrue)) throw new Error('multiword fixture lacks owner-true edge');
  if (!selected.some((segment) => !segment.ownerTrue)) throw new Error('multiword fixture lacks owner-false edge');
  if (!selected.every((segment) => segment.wordCount >= 3)) throw new Error('multiword fixture failed to exceed two u32 words');

  return selected;
}

export function createRealCoverageMultiwordCofactorFixture() {
  const segments = solveTerminalBand().map((segment, index) => ({ id: `multiword-cofactor-${index}`, ...segment }));
  const wordCount = Math.max(...segments.map((segment) => segment.wordCount));
  const maxDictionary = Math.max(...segments.map((segment) => segment.childDictionary.length));
  return {
    fixtureKind: 'real-6x5-terminal-band-multiword-cofactor-edges',
    segments,
    wordCount,
    maxDictionary,
    totalRecords: segments.reduce((sum, segment) => sum + segment.input.length, 0),
    killedRecords: segments.reduce((sum, segment) => sum + segment.killed, 0),
    solvedSupportCounts: { rank30: 1, rank29: 6, rank28: 21 },
  };
}
