#!/usr/bin/env node

/**
 * Qualifies the support-edge premises for the coverage-signature cofactor.
 *
 * At support edge S -> S' = S union {x}, dictionary clauses are
 *   singleton occupied cells or nonempty line intersections.
 *
 * Beneficiary owns x:
 *   clauses containing x are satisfied/deleted;
 *   every other child clause maps unchanged into D(S).
 *
 * Opponent owns x:
 *   x is removed from every child clause;
 *   singleton {x} is the unique impossible mapping;
 *   every other reduced clause belongs to D(S).
 *
 * The qualifier checks closure and order preservation on every dictionary
 * clause / comparable clause pair for the selected complete support lattices.
 */

function subset(left, right) { return (left & ~right) === 0; }
function popcount(mask) {
  let value = mask >>> 0;
  let count = 0;
  while (value !== 0) { value &= value - 1; count += 1; }
  return count;
}

function createWinningLineMasks(columns, rows, connect) {
  const lines = [];
  const index = (column, row) => row * columns + column;
  for (let row = 0; row < rows; row += 1) for (let column = 0; column <= columns - connect; column += 1) {
    let mask = 0;
    for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row);
    lines.push(mask >>> 0);
  }
  for (let column = 0; column < columns; column += 1) for (let row = 0; row <= rows - connect; row += 1) {
    let mask = 0;
    for (let step = 0; step < connect; step += 1) mask |= 1 << index(column, row + step);
    lines.push(mask >>> 0);
  }
  for (let column = 0; column <= columns - connect; column += 1) for (let row = 0; row <= rows - connect; row += 1) {
    let mask = 0;
    for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row + step);
    lines.push(mask >>> 0);
  }
  for (let column = 0; column <= columns - connect; column += 1) for (let row = connect - 1; row < rows; row += 1) {
    let mask = 0;
    for (let step = 0; step < connect; step += 1) mask |= 1 << index(column + step, row - step);
    lines.push(mask >>> 0);
  }
  return lines;
}

function dictionary(universe, lines, cellCount) {
  const values = new Set();
  for (let cell = 0; cell < cellCount; cell += 1) if ((universe & (1 << cell)) !== 0) values.add((1 << cell) >>> 0);
  for (const line of lines) {
    const clause = (line & universe) >>> 0;
    if (clause !== 0) values.add(clause);
  }
  return [...values].sort((a, b) => popcount(a) - popcount(b) || a - b);
}

function qualifyGeometry(columns, rows, connect) {
  if (columns * rows >= 31) throw new RangeError('qualification backend requires fewer than 31 cells');
  const lines = createWinningLineMasks(columns, rows, connect);
  const heights = new Array(columns).fill(0);
  const stats = {
    columns, rows, connect,
    supports: 0,
    legalEdges: 0,
    childClauseMappings: 0,
    comparablePairs: 0,
    closureFailures: 0,
    orderFailures: 0,
    maxParentDictionary: 0,
    maxChildDictionary: 0,
  };

  function visit(column) {
    if (column !== columns) {
      for (let value = 0; value <= rows; value += 1) {
        heights[column] = value;
        visit(column + 1);
      }
      return;
    }

    stats.supports += 1;
    let parentUniverse = 0;
    for (let c = 0; c < columns; c += 1) for (let r = 0; r < heights[c]; r += 1) parentUniverse |= 1 << (r * columns + c);
    parentUniverse >>>= 0;
    const parentDictionary = dictionary(parentUniverse, lines, columns * rows);
    const parentSet = new Set(parentDictionary);
    stats.maxParentDictionary = Math.max(stats.maxParentDictionary, parentDictionary.length);

    for (let moveColumn = 0; moveColumn < columns; moveColumn += 1) {
      const row = heights[moveColumn];
      if (row >= rows) continue;
      stats.legalEdges += 1;
      const x = row * columns + moveColumn;
      const bit = (1 << x) >>> 0;
      const childUniverse = (parentUniverse | bit) >>> 0;
      const childDictionary = dictionary(childUniverse, lines, columns * rows);
      stats.maxChildDictionary = Math.max(stats.maxChildDictionary, childDictionary.length);

      for (const clause of childDictionary) {
        stats.childClauseMappings += 2;

        // Beneficiary true cofactor.
        if ((clause & bit) === 0 && !parentSet.has(clause)) {
          stats.closureFailures += 1;
          throw new Error(`beneficiary closure failure ${columns}x${rows} c${connect}: clause=0x${clause.toString(16)}`);
        }

        // Opponent false cofactor.
        const reduced = (clause & ~bit) >>> 0;
        if (reduced !== 0 && !parentSet.has(reduced)) {
          stats.closureFailures += 1;
          throw new Error(`opponent closure failure ${columns}x${rows} c${connect}: clause=0x${clause.toString(16)} reduced=0x${reduced.toString(16)}`);
        }
        if (reduced === 0 && clause !== bit) {
          stats.closureFailures += 1;
          throw new Error(`non-singleton mapped to empty ${columns}x${rows} c${connect}`);
        }
      }

      // Mapping every set coverage bit is safe only if redundant child clauses
      // stay redundant after cofactor. Check every comparable dictionary pair.
      for (const lower of childDictionary) for (const upper of childDictionary) {
        if (lower === upper || !subset(lower, upper)) continue;
        stats.comparablePairs += 1;

        // If lower contains x then every superset also contains x and both are
        // satisfied under beneficiary=true. Otherwise any two surviving maps
        // preserve subset order; a satisfied upper contributes nothing.
        const lowerOwnSatisfied = (lower & bit) !== 0;
        const upperOwnSatisfied = (upper & bit) !== 0;
        if (lowerOwnSatisfied && !upperOwnSatisfied) {
          stats.orderFailures += 1;
          throw new Error(`beneficiary order failure ${columns}x${rows} c${connect}`);
        }
        if (!lowerOwnSatisfied && !upperOwnSatisfied && !subset(lower, upper)) {
          stats.orderFailures += 1;
          throw new Error(`beneficiary mapped order failure ${columns}x${rows} c${connect}`);
        }

        const lowerOpp = (lower & ~bit) >>> 0;
        const upperOpp = (upper & ~bit) >>> 0;
        if (lowerOpp !== 0 && upperOpp !== 0 && !subset(lowerOpp, upperOpp)) {
          stats.orderFailures += 1;
          throw new Error(`opponent mapped order failure ${columns}x${rows} c${connect}`);
        }
      }
    }
  }

  visit(0);
  return stats;
}

const requested = process.argv.slice(2).map(Number);
const geometries = requested.length === 3
  ? [requested]
  : [
      [3, 3, 3], [3, 4, 3], [3, 5, 3], [4, 3, 2], [4, 3, 3],
      [4, 4, 3], [4, 4, 4], [4, 5, 4], [5, 3, 4], [5, 4, 4],
    ];

const results = geometries.map(([columns, rows, connect]) => qualifyGeometry(columns, rows, connect));
process.stdout.write(`${JSON.stringify({
  schemaVersion: 1,
  kind: 'connect4-bsfp-clause-coverage-cofactor-qualification',
  results,
  totals: {
    supports: results.reduce((sum, result) => sum + result.supports, 0),
    legalEdges: results.reduce((sum, result) => sum + result.legalEdges, 0),
    childClauseMappings: results.reduce((sum, result) => sum + result.childClauseMappings, 0),
    comparablePairs: results.reduce((sum, result) => sum + result.comparablePairs, 0),
    closureFailures: results.reduce((sum, result) => sum + result.closureFailures, 0),
    orderFailures: results.reduce((sum, result) => sum + result.orderFailures, 0),
  },
}, null, 2)}\n`);
