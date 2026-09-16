#!/usr/bin/env node

/**
 * Exhaustive semantic falsifier for BSFP constraint-relative antichain ideas.
 *
 * This experiment intentionally does not call a game solver.  For every support
 * vector on a small board it enumerates the exact ownership assignments admitted
 * by the selected local constraint theory C and computes the positive closure of
 * every ownership generator g:
 *
 *   closure_C(g) = intersection of all feasible assignments satisfying g.
 *
 * If there is no feasible assignment satisfying g, g is infeasible.  Otherwise
 * C & g is logically equivalent to C & closure_C(g), so any additional literals
 * in the closure are exact constraint-relative consequences.
 *
 * Constraint tiers:
 *   A. exact P0 stone cardinality at the support rank;
 *   B. tier A plus nonterminal NAE constraints on every fully occupied
 *      geometric winning line.
 *
 * No solved database, minimax/negamax result, opening knowledge, or external
 * oracle is used.
 */

function popcount(value) {
  let x = value >>> 0;
  let count = 0;
  while (x !== 0) {
    x &= x - 1;
    count += 1;
  }
  return count;
}

function winningLines(width, height, connect) {
  const lines = [];
  const index = (column, row) => row * width + column;

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column <= width - connect; column += 1) {
      lines.push(Array.from({ length: connect }, (_, i) => index(column + i, row)));
    }
  }

  for (let column = 0; column < width; column += 1) {
    for (let row = 0; row <= height - connect; row += 1) {
      lines.push(Array.from({ length: connect }, (_, i) => index(column, row + i)));
    }
  }

  for (let column = 0; column <= width - connect; column += 1) {
    for (let row = 0; row <= height - connect; row += 1) {
      lines.push(Array.from({ length: connect }, (_, i) => index(column + i, row + i)));
    }
  }

  for (let column = 0; column <= width - connect; column += 1) {
    for (let row = connect - 1; row < height; row += 1) {
      lines.push(Array.from({ length: connect }, (_, i) => index(column + i, row - i)));
    }
  }

  return lines;
}

function chooseMasks(size, count) {
  const masks = [];

  function visit(position, remaining, mask) {
    if (remaining === 0) {
      masks.push(mask >>> 0);
      return;
    }
    if (size - position < remaining) return;

    visit(position + 1, remaining - 1, mask | (1 << position));
    visit(position + 1, remaining, mask);
  }

  visit(0, count, 0);
  return masks;
}

function enumerateSupports(width, height, callback) {
  const heights = new Array(width).fill(0);

  function visit(column) {
    if (column === width) {
      callback(heights.slice());
      return;
    }

    for (let value = 0; value <= height; value += 1) {
      heights[column] = value;
      visit(column + 1);
    }
  }

  visit(0);
}

function analyzeBoard(width, height, connect, useNonterminalNae) {
  const lines = winningLines(width, height, connect);
  const byRank = new Map();
  let supportCount = 0;
  let noFeasibleSupportCount = 0;

  const global = {
    totalGenerators: 0,
    cardinalityImpossible: 0,
    naeExtraInfeasible: 0,
    feasibleGenerators: 0,
    strengthenedGenerators: 0,
    addedForcedLiterals: 0,
    uniqueClosures: 0,
    rawSubsetImplications: 0,
    relativeImplications: 0,
    supportsWithStrengthening: 0,
    supportsWithExtraInfeasible: 0,
    feasibleAssignments: 0,
  };

  enumerateSupports(width, height, (heights) => {
    supportCount += 1;

    const cells = [];
    const positionToLocal = new Map();
    for (let column = 0; column < width; column += 1) {
      for (let row = 0; row < heights[column]; row += 1) {
        const position = row * width + column;
        positionToLocal.set(position, cells.length);
        cells.push(position);
      }
    }

    const occupiedCount = cells.length;
    const p0Count = Math.ceil(occupiedCount / 2);
    if (occupiedCount >= 31) {
      throw new RangeError("experiment uses 32-bit local masks and supports fewer than 31 occupied cells");
    }

    const generatorCount = 1 << occupiedCount;
    const fullLineMasks = [];

    if (useNonterminalNae) {
      for (const line of lines) {
        let mask = 0;
        let fullyOccupied = true;
        for (const position of line) {
          const local = positionToLocal.get(position);
          if (local === undefined) {
            fullyOccupied = false;
            break;
          }
          mask |= 1 << local;
        }
        if (fullyOccupied) fullLineMasks.push(mask >>> 0);
      }
    }

    const feasibleAssignments = [];
    for (const assignment of chooseMasks(occupiedCount, p0Count)) {
      let admissible = true;
      for (const lineMask of fullLineMasks) {
        const owned = assignment & lineMask;
        if (owned === 0 || owned === lineMask) {
          admissible = false;
          break;
        }
      }
      if (admissible) feasibleAssignments.push(assignment >>> 0);
    }

    if (feasibleAssignments.length === 0) noFeasibleSupportCount += 1;

    // closure[g] == -1 means no feasible assignment contains g.
    const closure = new Int32Array(generatorCount);
    closure.fill(-1);

    // Every submask of a feasible assignment is a satisfied positive generator.
    // ANDing all witness assignments gives its exact positive logical closure.
    for (const assignment of feasibleAssignments) {
      let generator = assignment;
      while (true) {
        if (closure[generator] === -1) {
          closure[generator] = assignment;
        } else {
          closure[generator] &= assignment;
        }

        if (generator === 0) break;
        generator = (generator - 1) & assignment;
      }
    }

    let cardinalityImpossible = 0;
    let naeExtraInfeasible = 0;
    let feasibleGenerators = 0;
    let strengthenedGenerators = 0;
    let addedForcedLiterals = 0;
    let rawSubsetImplications = 0;
    let relativeImplications = 0;
    const uniqueClosures = new Set();

    for (let generator = 0; generator < generatorCount; generator += 1) {
      const generatorCardinality = popcount(generator);
      if (generatorCardinality > p0Count) cardinalityImpossible += 1;

      const canonical = closure[generator];
      if (canonical === -1) {
        if (generatorCardinality <= p0Count) naeExtraInfeasible += 1;
        continue;
      }

      feasibleGenerators += 1;
      uniqueClosures.add(canonical);

      const closureCardinality = popcount(canonical);
      if (canonical !== generator) {
        strengthenedGenerators += 1;
        addedForcedLiterals += closureCardinality - generatorCardinality;
      }

      // Positive conjunction a is implied by generator b exactly when
      // a is a subset of closure_C(b).  Raw subset implication counts only
      // subsets of b itself.
      rawSubsetImplications += 2 ** generatorCardinality;
      relativeImplications += 2 ** closureCardinality;
    }

    const rank = byRank.get(occupiedCount) ?? {
      supports: 0,
      totalGenerators: 0,
      cardinalityImpossible: 0,
      naeExtraInfeasible: 0,
      feasibleGenerators: 0,
      strengthenedGenerators: 0,
      uniqueClosures: 0,
      rawSubsetImplications: 0,
      relativeImplications: 0,
      feasibleAssignments: 0,
      supportsWithStrengthening: 0,
    };

    rank.supports += 1;
    rank.totalGenerators += generatorCount;
    rank.cardinalityImpossible += cardinalityImpossible;
    rank.naeExtraInfeasible += naeExtraInfeasible;
    rank.feasibleGenerators += feasibleGenerators;
    rank.strengthenedGenerators += strengthenedGenerators;
    rank.uniqueClosures += uniqueClosures.size;
    rank.rawSubsetImplications += rawSubsetImplications;
    rank.relativeImplications += relativeImplications;
    rank.feasibleAssignments += feasibleAssignments.length;
    if (strengthenedGenerators !== 0) rank.supportsWithStrengthening += 1;
    byRank.set(occupiedCount, rank);

    global.totalGenerators += generatorCount;
    global.cardinalityImpossible += cardinalityImpossible;
    global.naeExtraInfeasible += naeExtraInfeasible;
    global.feasibleGenerators += feasibleGenerators;
    global.strengthenedGenerators += strengthenedGenerators;
    global.addedForcedLiterals += addedForcedLiterals;
    global.uniqueClosures += uniqueClosures.size;
    global.rawSubsetImplications += rawSubsetImplications;
    global.relativeImplications += relativeImplications;
    global.feasibleAssignments += feasibleAssignments.length;
    if (strengthenedGenerators !== 0) global.supportsWithStrengthening += 1;
    if (naeExtraInfeasible !== 0) global.supportsWithExtraInfeasible += 1;
  });

  return {
    width,
    height,
    connect,
    constraintTier: useNonterminalNae ? "cardinality+nonterminal-NAE" : "cardinality-only",
    supportCount,
    noFeasibleSupportCount,
    global,
    byRank: Object.fromEntries([...byRank.entries()].sort((a, b) => a[0] - b[0])),
  };
}

const boardFamilies = [
  [4, 3, 3],
  [4, 4, 4],
  [5, 3, 4],
];

const results = [];
for (const [width, height, connect] of boardFamilies) {
  results.push(analyzeBoard(width, height, connect, false));
  results.push(analyzeBoard(width, height, connect, true));
}

process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
