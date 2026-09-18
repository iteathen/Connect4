#!/usr/bin/env node

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

function setBits(mask) {
  const result = [];
  for (let bit = 0; bit < 31; bit += 1) if ((mask & (1 << bit)) !== 0) result.push(bit);
  return result;
}

function createWinningLines(columns, rows, connect) {
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
      result.push({ heights: heights.slice(), universe: universe >>> 0, rank, key: heights.join(',') });
      return;
    }

    for (let height = 0; height <= rows; height += 1) {
      heights[column] = height;
      visit(column + 1);
    }
  }

  visit(0);
  return result;
}

function prepare(columns, rows, connect) {
  if (columns * rows >= 31) throw new RangeError('reference qualifier uses u32 cell masks and requires fewer than 31 cells');
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

function recordKey(record) {
  return record.map((clause) => clause.toString(16)).join('.');
}

function recordImplies(left, right) {
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
  const ordered = [...unique.values()].sort((left, right) => left.length - right.length || recordKey(left).localeCompare(recordKey(right)));
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

function supportDictionary(profile, support) {
  const dictionary = new Set();
  for (const cell of setBits(support.universe)) dictionary.add((1 << cell) >>> 0);
  for (const line of profile.winningLines) {
    const clause = (line & support.universe) >>> 0;
    if (clause !== 0) dictionary.add(clause);
  }
  return [...dictionary];
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

function solve(columns, rows, connect) {
  const profile = prepare(columns, rows, connect);
  const frontiers = new Array(profile.supports.length);
  const jobs = [];

  function intersect(left, right, context) {
    if (left.length === 0 || right.length === 0) return [];
    const rawPairs = left.length * right.length;
    const candidates = [];
    let rejected = 0;

    for (const a of left) {
      for (const b of right) {
        const candidate = normalizeRecord([...a, ...b]);
        if (candidate === null) continue;
        if (boundedCapacityKeep(candidate, context.support.universe, context.exactCount)) candidates.push(candidate);
        else rejected += 1;
      }
    }

    const frontier = normalizeFrontier(candidates);
    jobs.push({
      ...context,
      left: left.length,
      right: right.length,
      rawPairs,
      rejected,
      materialized: rawPairs - rejected,
      survivors: frontier.length,
      dictionarySize: supportDictionary(profile, context.support).length,
    });
    return frontier;
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
          const moverTerminalRecords = terminalRequirements.map(terminalRecord).filter((record) => record !== null);
          if (mover === 0) winner0 = normalizeFrontier([...winner0, ...moverTerminalRecords]);
          else winner1 = normalizeFrontier([...winner1, ...moverTerminalRecords]);

          const blocker = normalizeRecord(terminalRequirements);
          if (blocker === null) {
            if (mover === 0) winner1 = [];
            else winner0 = [];
          } else if (mover === 0) {
            winner1 = intersect(winner1, [blocker], {
              kind: 'terminal', support, rank, mover, beneficiary: 1,
              exactCount: Math.floor(rank / 2), column,
            });
          } else {
            winner0 = intersect(winner0, [blocker], {
              kind: 'terminal', support, rank, mover, beneficiary: 0,
              exactCount: Math.ceil(rank / 2), column,
            });
          }
        }

        if (aggregate0 === null) {
          aggregate0 = winner0;
          aggregate1 = winner1;
        } else if (mover === 0) {
          aggregate0 = normalizeFrontier([...aggregate0, ...winner0]);
          aggregate1 = intersect(aggregate1, winner1, {
            kind: 'aggregate', support, rank, mover, beneficiary: 1,
            exactCount: Math.floor(rank / 2), column,
          });
        } else {
          aggregate0 = intersect(aggregate0, winner0, {
            kind: 'aggregate', support, rank, mover, beneficiary: 0,
            exactCount: Math.ceil(rank / 2), column,
          });
          aggregate1 = normalizeFrontier([...aggregate1, ...winner1]);
        }
      }

      frontiers[supportIndex] = { winner0: aggregate0 ?? [], winner1: aggregate1 ?? [] };
    }
  }

  const sumByKind = (kind, field) => jobs.filter((job) => job.kind === kind).reduce((sum, job) => sum + job[field], 0);
  const totals = {
    jobCount: jobs.length,
    aggregateJobs: jobs.filter((job) => job.kind === 'aggregate').length,
    terminalJobs: jobs.filter((job) => job.kind === 'terminal').length,
    rawPairs: jobs.reduce((sum, job) => sum + job.rawPairs, 0),
    aggregateRawPairs: sumByKind('aggregate', 'rawPairs'),
    terminalRawPairs: sumByKind('terminal', 'rawPairs'),
    rejected: jobs.reduce((sum, job) => sum + job.rejected, 0),
    aggregateRejected: sumByKind('aggregate', 'rejected'),
    terminalRejected: sumByKind('terminal', 'rejected'),
    materialized: jobs.reduce((sum, job) => sum + job.materialized, 0),
    survivors: jobs.reduce((sum, job) => sum + job.survivors, 0),
    maxRawJob: Math.max(0, ...jobs.map((job) => job.rawPairs)),
    maxDictionary: Math.max(0, ...jobs.map((job) => job.dictionarySize)),
  };

  jobs.sort((left, right) => right.rawPairs - left.rawPairs || right.rejected - left.rejected);
  return {
    supports: profile.supports.length,
    winningLines: profile.winningLines.length,
    totals,
    hottestJobs: jobs.slice(0, 30).map((job) => ({
      rank: job.rank,
      support: job.support.key,
      kind: job.kind,
      mover: job.mover,
      beneficiary: job.beneficiary,
      exactCount: job.exactCount,
      column: job.column,
      left: job.left,
      right: job.right,
      rawPairs: job.rawPairs,
      rejected: job.rejected,
      rejectPercent: Number((100 * job.rejected / job.rawPairs).toFixed(2)),
      materialized: job.materialized,
      survivors: job.survivors,
      dictionarySize: job.dictionarySize,
    })),
  };
}

const geometries = process.argv.length === 5
  ? [[Number(process.argv[2]), Number(process.argv[3]), Number(process.argv[4])]]
  : [[5, 4, 4], [4, 5, 4], [4, 4, 3]];

const results = geometries.map(([columns, rows, connect]) => ({
  geometry: { columns, rows, connect },
  ...solve(columns, rows, connect),
}));

process.stdout.write(`${JSON.stringify({
  schemaVersion: 1,
  kind: 'connect4-bsfp-clause-product-capacity-workload-census',
  results,
}, null, 2)}\n`);
