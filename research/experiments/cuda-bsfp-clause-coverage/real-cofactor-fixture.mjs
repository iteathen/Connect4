// Deterministic real support-edge fixture generator for the experimental
// clause-coverage cofactor device profile.
//
// This reference intentionally evolves the unfiltered beneficiary-relative
// clause-CNF recurrence, independently of the device implementation. Each
// selected child record is then mapped both through the clause-array cofactor
// authority and through the precomputed packed coverage map; disagreement is a
// fixture-construction failure before any CUDA submission.

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

function or64(left, right) {
  return { lo: (left.lo | right.lo) >>> 0, hi: (left.hi | right.hi) >>> 0 };
}

function equal64(left, right) {
  return left.lo === right.lo && left.hi === right.hi;
}

function hasBit64(value, id) {
  const bit = bit64(id);
  return (value.lo & bit.lo) !== 0 || (value.hi & bit.hi) !== 0;
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
  if (columns * rows >= 31) throw new RangeError('real cofactor fixture reference backend requires fewer than 31 cells');
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

function exactIntersect(left, right) {
  if (left.length === 0 || right.length === 0) return [];
  const candidates = [];
  for (const a of left) for (const b of right) {
    const candidate = normalizeRecord([...a, ...b]);
    if (candidate !== null) candidates.push(candidate);
  }
  return normalizeFrontier(candidates);
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

function coverageOf(record, dictionary) {
  let result = { lo: 0, hi: 0 };
  for (let id = 0; id < dictionary.length; id += 1) {
    for (const clause of record) {
      if (subset(clause, dictionary[id])) {
        result = or64(result, bit64(id));
        break;
      }
    }
  }
  return result;
}

function validMask64(count) {
  let result = { lo: 0, hi: 0 };
  for (let id = 0; id < count; id += 1) result = or64(result, bit64(id));
  return result;
}

function buildPackedCofactorMap(childDictionary, parentDictionary, landingCell, ownerTrue) {
  const landingBit = (1 << landingCell) >>> 0;
  const contributions = [];
  let killMask = { lo: 0, hi: 0 };
  for (let id = 0; id < childDictionary.length; id += 1) {
    const clause = childDictionary[id];
    let reduced = clause;
    if (ownerTrue) {
      if ((clause & landingBit) !== 0) {
        contributions.push({ lo: 0, hi: 0 });
        continue;
      }
    } else {
      reduced = (clause & ~landingBit) >>> 0;
      if (reduced === 0) {
        killMask = or64(killMask, bit64(id));
        contributions.push({ lo: 0, hi: 0 });
        continue;
      }
    }
    if (!parentDictionary.includes(reduced)) throw new Error('cofactor map escaped parent support-local dictionary');
    contributions.push(coverageOf([reduced], parentDictionary));
  }
  return { validMask: validMask64(childDictionary.length), killMask, contributions };
}

function applyPackedCofactorMap(input, map) {
  if ((input.lo & ~map.validMask.lo) !== 0 || (input.hi & ~map.validMask.hi) !== 0) throw new Error('packed cofactor input escaped child dictionary');
  if ((input.lo & map.killMask.lo) !== 0 || (input.hi & map.killMask.hi) !== 0) return { keep: 0, lo: 0, hi: 0 };
  let output = { lo: 0, hi: 0 };
  for (let id = 0; id < map.contributions.length; id += 1) {
    if (hasBit64(input, id)) output = or64(output, map.contributions[id]);
  }
  return { keep: 1, lo: output.lo, hi: output.hi };
}

function createSegment(profile, parentSupport, childSupport, landingCell, mover, beneficiary, column, childFrontier) {
  const childDictionary = localDictionary(profile, childSupport);
  const parentDictionary = localDictionary(profile, parentSupport);
  if (childDictionary.length > 64 || parentDictionary.length > 64) return null;
  const ownerTrue = mover === beneficiary;
  const map = buildPackedCofactorMap(childDictionary, parentDictionary, landingCell, ownerTrue);
  const input = childFrontier.map((record) => coverageOf(record, childDictionary));
  const expected = childFrontier.map((record) => {
    const mapped = cofactorRecord(record, landingCell, mover, beneficiary);
    if (mapped === null) return { keep: 0, lo: 0, hi: 0 };
    const coverage = coverageOf(mapped, parentDictionary);
    return { keep: 1, lo: coverage.lo, hi: coverage.hi };
  });

  let killed = 0;
  for (let index = 0; index < input.length; index += 1) {
    const observed = applyPackedCofactorMap(input[index], map);
    const authority = expected[index];
    if (observed.keep !== authority.keep || observed.lo !== authority.lo || observed.hi !== authority.hi) {
      throw new Error('packed cofactor map disagrees with clause-array authority');
    }
    if (authority.keep === 0) killed += 1;
  }

  return {
    geometry: profile.geometry,
    rank: parentSupport.rank,
    parentSupportHeights: parentSupport.heights.slice(),
    childSupportHeights: childSupport.heights.slice(),
    landingCell,
    column,
    mover,
    beneficiary,
    ownerTrue,
    childDictionary,
    parentDictionary,
    validMask: map.validMask,
    killMask: map.killMask,
    contributions: map.contributions,
    input,
    expected,
    killed,
  };
}

function captureCofactorGeometry(columns, rows, connect, keepPerRelation) {
  const profile = prepare(columns, rows, connect);
  profile.geometry = { columns, rows, connect };
  const frontiers = new Array(profile.supports.length);
  const ownerTrueTop = [];
  const ownerFalseTop = [];

  function remember(segment) {
    if (segment === null || segment.input.length === 0) return;
    const bucket = segment.ownerTrue ? ownerTrueTop : ownerFalseTop;
    bucket.push(segment);
    bucket.sort((a, b) => b.input.length - a.input.length || b.childDictionary.length - a.childDictionary.length || b.killed - a.killed);
    if (bucket.length > keepPerRelation) bucket.pop();
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
        const childIndex = profile.supportByKey.get(childHeights.join(','));
        const childSupport = profile.supports[childIndex];
        const child = frontiers[childIndex];
        const landingCell = row * columns + column;

        remember(createSegment(profile, support, childSupport, landingCell, mover, 0, column, child.winner0));
        remember(createSegment(profile, support, childSupport, landingCell, mover, 1, column, child.winner1));

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

  return [...ownerTrueTop, ...ownerFalseTop];
}

export function createRealCoverage64CofactorFixture() {
  const segments = [
    ...captureCofactorGeometry(5, 4, 4, 4),
    ...captureCofactorGeometry(4, 4, 3, 2),
  ].map((segment, index) => ({ id: `cofactor-${index}`, ...segment }));

  if (segments.length === 0) throw new Error('real cofactor fixture produced no segments');
  const maxDictionary = Math.max(...segments.map((segment) => segment.childDictionary.length));
  if (maxDictionary > 64) throw new RangeError('fixed-two-u32 cofactor fixture exceeded qualification width');

  return {
    fixtureKind: 'real-clause-bsfp-cofactor-edges',
    segments,
    maxDictionary,
    totalRecords: segments.reduce((sum, segment) => sum + segment.input.length, 0),
    killedRecords: segments.reduce((sum, segment) => sum + segment.killed, 0),
  };
}
