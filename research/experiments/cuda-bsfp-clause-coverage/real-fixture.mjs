// Deterministic real-workload fixture generator for the experimental
// clause-coverage device profile. The recurrence evolves the exact unfiltered
// beneficiary-relative clause-BSFP frontier; the exact legal-slice filter is
// applied only to each captured Cartesian merge sent to the device qualifier.

function popcount(mask) {
  let value = mask >>> 0;
  let count = 0;
  while (value !== 0) { value &= value - 1; count += 1; }
  return count;
}

function subset(left, right) { return (left & ~right) === 0; }

function setBits(mask) {
  const result = [];
  for (let bit = 0; bit < 31; bit += 1) if ((mask & (1 << bit)) !== 0) result.push(bit);
  return result;
}

function bit64(id) {
  if (id < 32) return { lo: (1 << id) >>> 0, hi: 0 };
  return { lo: 0, hi: (1 << (id - 32)) >>> 0 };
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

function createSupports(columns, rows) {
  const heights = new Array(columns).fill(0);
  const result = [];
  function visit(column) {
    if (column === columns) {
      let universe = 0;
      let rank = 0;
      for (let current = 0; current < columns; current += 1) for (let row = 0; row < heights[current]; row += 1) {
        universe |= 1 << (row * columns + current);
        rank += 1;
      }
      result.push({ heights: heights.slice(), universe: universe >>> 0, rank, key: heights.join(',') });
      return;
    }
    for (let height = 0; height <= rows; height += 1) { heights[column] = height; visit(column + 1); }
  }
  visit(0);
  return result;
}

function prepare(columns, rows, connect) {
  if (columns * rows >= 31) throw new RangeError('real fixture reference backend requires fewer than 31 cells');
  const winningLines = createWinningLines(columns, rows, connect);
  const incidence = Array.from({ length: columns * rows }, () => []);
  for (const line of winningLines) for (const cell of setBits(line)) incidence[cell].push(line);
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
    for (const available of left) if (subset(available, required)) { covered = true; break; }
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

function cofactorRecord(record, landingCell, mover, beneficiary) {
  const bit = 1 << landingCell;
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
  return normalizeRecord(setBits(requirement).map((cell) => (1 << cell) >>> 0));
}

function localDictionary(profile, support) {
  const values = new Set();
  for (const cell of setBits(support.universe)) values.add((1 << cell) >>> 0);
  for (const line of profile.winningLines) {
    const clause = (line & support.universe) >>> 0;
    if (clause !== 0) values.add(clause);
  }
  return [...values].sort((a, b) => popcount(a) - popcount(b) || a - b);
}

function boundedCapacityKeep(record, universe, exactCount) {
  let forcedMask = 0;
  const residual = [];
  for (const clause of record) {
    if (popcount(clause) === 1) forcedMask |= clause;
    else residual.push(clause);
  }
  forcedMask >>>= 0;
  const forcedCount = popcount(forcedMask);
  if (forcedCount > exactCount) return false;
  const unsatisfied = residual.filter((clause) => (clause & forcedMask) === 0);
  if (unsatisfied.length === 0) return true;
  if (forcedCount === exactCount) return false;
  if (forcedCount + 1 !== exactCount) return true;
  let common = (universe & ~forcedMask) >>> 0;
  for (const clause of unsatisfied) common &= clause;
  return common !== 0;
}

function coverageOf(record, dictionary) {
  let lo = 0;
  let hi = 0;
  for (let id = 0; id < dictionary.length; id += 1) {
    for (const clause of record) {
      if (subset(clause, dictionary[id])) {
        const bit = bit64(id);
        lo = (lo | bit.lo) >>> 0;
        hi = (hi | bit.hi) >>> 0;
        break;
      }
    }
  }
  return { lo, hi };
}

function packedMetadata(dictionary, actualCellCount, maxCells) {
  let singletonMaskLo = 0;
  let singletonMaskHi = 0;
  const singletonBits = [];
  const contains = [];
  for (let cell = 0; cell < maxCells; cell += 1) {
    let singleton = { lo: 0, hi: 0 };
    let containing = { lo: 0, hi: 0 };
    if (cell < actualCellCount) {
      for (let id = 0; id < dictionary.length; id += 1) {
        const bit = bit64(id);
        if (popcount(dictionary[id]) === 1 && (dictionary[id] & (1 << cell)) !== 0) {
          singleton = bit;
          singletonMaskLo = (singletonMaskLo | bit.lo) >>> 0;
          singletonMaskHi = (singletonMaskHi | bit.hi) >>> 0;
        }
        if ((dictionary[id] & (1 << cell)) !== 0) {
          containing.lo = (containing.lo | bit.lo) >>> 0;
          containing.hi = (containing.hi | bit.hi) >>> 0;
        }
      }
    }
    singletonBits.push(singleton);
    contains.push(containing);
  }
  return { singletonMaskLo, singletonMaskHi, singletonBits, contains };
}

function captureGeometry(columns, rows, connect, keepTop) {
  const profile = prepare(columns, rows, connect);
  const frontiers = new Array(profile.supports.length);
  const top = [];

  function remember(job) {
    top.push(job);
    top.sort((a, b) => b.rawPairs - a.rawPairs || b.rejected - a.rejected);
    if (top.length > keepTop) top.pop();
  }

  function intersect(left, right, context) {
    if (left.length === 0 || right.length === 0) return [];
    const rawPairs = left.length * right.length;
    const exactCandidates = [];
    const filteredCandidates = [];
    let rejected = 0;
    for (const a of left) for (const b of right) {
      const candidate = normalizeRecord([...a, ...b]);
      if (candidate === null) continue;
      exactCandidates.push(candidate);
      if (boundedCapacityKeep(candidate, context.support.universe, context.exactCount)) filteredCandidates.push(candidate);
      else rejected += 1;
    }
    const exactFrontier = normalizeFrontier(exactCandidates);
    const filteredFrontier = normalizeFrontier(filteredCandidates);
    remember({
      ...context,
      leftRecords: left.map((record) => record.slice()),
      rightRecords: right.map((record) => record.slice()),
      authorityRecords: filteredFrontier.map((record) => record.slice()),
      rawPairs,
      rejected,
      materialized: filteredCandidates.length,
      survivors: filteredFrontier.length,
      dictionary: localDictionary(profile, context.support),
    });
    return exactFrontier;
  }

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
          } else if (mover === 0) {
            winner1 = intersect(winner1, [blocker], { kind: 'terminal', support, rank, mover, beneficiary: 1, exactCount: Math.floor(rank / 2), column });
          } else {
            winner0 = intersect(winner0, [blocker], { kind: 'terminal', support, rank, mover, beneficiary: 0, exactCount: Math.ceil(rank / 2), column });
          }
        }

        if (aggregate0 === null) {
          aggregate0 = winner0;
          aggregate1 = winner1;
        } else if (mover === 0) {
          aggregate0 = normalizeFrontier([...aggregate0, ...winner0]);
          aggregate1 = intersect(aggregate1, winner1, { kind: 'aggregate', support, rank, mover, beneficiary: 1, exactCount: Math.floor(rank / 2), column });
        } else {
          aggregate0 = intersect(aggregate0, winner0, { kind: 'aggregate', support, rank, mover, beneficiary: 0, exactCount: Math.ceil(rank / 2), column });
          aggregate1 = normalizeFrontier([...aggregate1, ...winner1]);
        }
      }
      frontiers[supportIndex] = { winner0: aggregate0 ?? [], winner1: aggregate1 ?? [] };
    }
  }

  return top.map((job, index) => ({
    id: `${columns}x${rows}c${connect}-job${index}`,
    geometry: { columns, rows, connect },
    cellCount: columns * rows,
    rank: job.rank,
    supportHeights: job.support.heights.slice(),
    kind: job.kind,
    mover: job.mover,
    beneficiary: job.beneficiary,
    exactCount: job.exactCount,
    column: job.column,
    dictionary: job.dictionary,
    leftRecords: job.leftRecords,
    rightRecords: job.rightRecords,
    authorityRecords: job.authorityRecords,
    rawPairs: job.rawPairs,
    rejected: job.rejected,
    materialized: job.materialized,
    survivors: job.survivors,
  }));
}

export function createRealCoverage64Fixture() {
  const maxCells = 20;
  const jobs = [
    ...captureGeometry(5, 4, 4, 5),
    ...captureGeometry(4, 5, 4, 2),
    ...captureGeometry(4, 4, 3, 2),
  ];

  const segments = jobs.map((job) => {
    if (job.dictionary.length > 64) throw new RangeError(`${job.id} exceeds fixed-two-u32 qualification width`);
    const metadata = packedMetadata(job.dictionary, job.cellCount, maxCells);
    return {
      id: job.id,
      geometry: job.geometry,
      cellCount: job.cellCount,
      rank: job.rank,
      supportHeights: job.supportHeights,
      kind: job.kind,
      mover: job.mover,
      beneficiary: job.beneficiary,
      exactCount: job.exactCount,
      column: job.column,
      dictionary: {
        clauses: job.dictionary,
        contains: metadata.contains,
        singletonBits: metadata.singletonBits,
        singletonMaskLo: metadata.singletonMaskLo,
        singletonMaskHi: metadata.singletonMaskHi,
      },
      left: job.leftRecords.map((record) => coverageOf(record, job.dictionary)),
      right: job.rightRecords.map((record) => coverageOf(record, job.dictionary)),
      authority: {
        frontier: job.authorityRecords.map((record) => coverageOf(record, job.dictionary)),
        rejected: job.rejected,
      },
      rawPairs: job.rawPairs,
      materialized: job.materialized,
      survivors: job.survivors,
    };
  });

  return {
    fixtureKind: 'real-clause-bsfp-hot-jobs',
    segments,
    totalLeft: segments.reduce((sum, segment) => sum + segment.left.length, 0),
    totalRight: segments.reduce((sum, segment) => sum + segment.right.length, 0),
    totalCandidates: segments.reduce((sum, segment) => sum + segment.left.length * segment.right.length, 0),
    cellCount: maxCells,
    dictionarySize: Math.max(...segments.map((segment) => segment.dictionary.clauses.length)),
  };
}
