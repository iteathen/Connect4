#!/usr/bin/env node

// Differential qualifier for solving the support-local clause-coverage BSFP
// recurrence only on horizontal-reflection support representatives.
//
// Authority: full unquotiented coverage recurrence.
// Candidate: canonical support representative recurrence with exact mirrored
// child-frontier transport through the support-local dictionary permutation.
// No solved-game database, minimax/Negamax result or external search input.

function popcount32(value) { let x = value >>> 0; let count = 0; while (x !== 0) { x &= x - 1; count += 1; } return count; }
function subset32(left, right) { return ((left & ~right) >>> 0) === 0; }
function forEachSetBit32(mask, callback) { let value = mask >>> 0; while (value !== 0) { const bit = (value & -value) >>> 0; callback(31 - Math.clz32(bit)); value = (value & (value - 1)) >>> 0; } }
function popcountBigInt(value) { let x = value; let count = 0; while (x !== 0n) { x &= x - 1n; count += 1; } return count; }
function bigIntBitIndex(bit) { let index = 0; let value = bit; while (value > 1n) { value >>= 1n; index += 1; } return index; }

function createWinningLineMasks(columns, rows, connect) {
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

function createSupports(columns, rows) {
  const heights = new Array(columns).fill(0); const supports = [];
  function visit(column) {
    if (column === columns) {
      let universe = 0; let rank = 0;
      for (let current = 0; current < columns; current += 1) for (let row = 0; row < heights[current]; row += 1) { universe |= 1 << (row * columns + current); rank += 1; }
      supports.push({ heights: heights.slice(), universe: universe >>> 0, rank, key: heights.join(',') });
      return;
    }
    for (let value = 0; value <= rows; value += 1) { heights[column] = value; visit(column + 1); }
  }
  visit(0); return supports;
}

function normalizeRecord(clauses) {
  const unique = [...new Set(clauses.map((value) => value >>> 0))];
  if (unique.some((value) => value === 0)) return null;
  unique.sort((a, b) => popcount32(a) - popcount32(b) || a - b);
  const result = [];
  outer: for (const candidate of unique) { for (const retained of result) if (subset32(retained, candidate)) continue outer; result.push(candidate); }
  return result;
}
function terminalRecord(requirement) { const clauses = []; forEachSetBit32(requirement, (cell) => clauses.push((1 << cell) >>> 0)); return normalizeRecord(clauses); }

function createDictionary(support, winningLines) {
  const unique = new Set();
  forEachSetBit32(support.universe, (cell) => unique.add((1 << cell) >>> 0));
  for (const line of winningLines) { const clause = (line & support.universe) >>> 0; if (clause !== 0) unique.add(clause); }
  const masks = [...unique].sort((a, b) => popcount32(a) - popcount32(b) || a - b);
  const idByMask = new Map(masks.map((mask, id) => [mask, id]));
  const upwardCoverage = masks.map((mask) => {
    let coverage = 0n;
    for (let id = 0; id < masks.length; id += 1) if (subset32(mask, masks[id])) coverage |= 1n << BigInt(id);
    return coverage;
  });
  return { masks, idByMask, upwardCoverage };
}

function coverageOfRecord(record, dictionary) {
  let coverage = 0n;
  for (const clause of record) {
    const id = dictionary.idByMask.get(clause);
    if (id === undefined) throw new Error(`clause escaped D(S): 0x${clause.toString(16)}`);
    coverage |= dictionary.upwardCoverage[id];
  }
  return coverage;
}

function normalizeCoverageFrontier(values) {
  const unique = [...new Set(values.map((value) => value.toString()))].map(BigInt);
  unique.sort((a, b) => popcountBigInt(a) - popcountBigInt(b) || (a < b ? -1 : a > b ? 1 : 0));
  const result = [];
  outer: for (const candidate of unique) { for (const retained of result) if ((retained & ~candidate) === 0n) continue outer; result.push(candidate); }
  return result;
}
function unionCoverageFrontiers(left, right) { return normalizeCoverageFrontier([...left, ...right]); }
function intersectCoverageFrontiers(left, right, stats) {
  if (left.length === 0 || right.length === 0) return [];
  if (stats) stats.productPairs += left.length * right.length;
  const result = []; for (const a of left) for (const b of right) result.push(a | b); return normalizeCoverageFrontier(result);
}
function equalCoverageFrontiers(left, right) {
  if (left.length !== right.length) return false;
  const a = left.map(String).sort(); const b = right.map(String).sort(); return a.every((value, index) => value === b[index]);
}

function buildCofactorMap(parentDictionary, childDictionary, landingCell, ownerTrue) {
  const landingBit = (1 << landingCell) >>> 0;
  const contributions = new Array(childDictionary.masks.length).fill(0n); let killMask = 0n;
  for (let childId = 0; childId < childDictionary.masks.length; childId += 1) {
    const clause = childDictionary.masks[childId];
    if (ownerTrue) {
      if ((clause & landingBit) !== 0) continue;
      const parentId = parentDictionary.idByMask.get(clause); if (parentId === undefined) throw new Error('owner-true cofactor escaped parent dictionary');
      contributions[childId] = parentDictionary.upwardCoverage[parentId];
    } else {
      const reduced = (clause & ~landingBit) >>> 0;
      if (reduced === 0) { killMask |= 1n << BigInt(childId); continue; }
      const parentId = parentDictionary.idByMask.get(reduced); if (parentId === undefined) throw new Error('owner-false cofactor escaped parent dictionary');
      contributions[childId] = parentDictionary.upwardCoverage[parentId];
    }
  }
  return { contributions, killMask };
}
function applyCofactorMap(coverage, map) {
  if ((coverage & map.killMask) !== 0n) return null;
  let result = 0n; let remaining = coverage;
  while (remaining !== 0n) { const bit = remaining & -remaining; result |= map.contributions[bigIntBitIndex(bit)]; remaining &= remaining - 1n; }
  return result;
}
function cofactorCoverageFrontier(frontier, map) {
  const result = []; for (const coverage of frontier) { const next = applyCofactorMap(coverage, map); if (next !== null) result.push(next); } return normalizeCoverageFrontier(result);
}

function reflectCell(cell, columns) { const row = Math.floor(cell / columns); const column = cell % columns; return row * columns + (columns - 1 - column); }
function reflectMask(mask, columns) { let result = 0; forEachSetBit32(mask, (cell) => { result |= 1 << reflectCell(cell, columns); }); return result >>> 0; }
function reflectHeights(heights) { return [...heights].reverse(); }
function compareHeights(a, b) { for (let i = 0; i < a.length; i += 1) { if (a[i] !== b[i]) return a[i] - b[i]; } return 0; }
function canonicalHeights(heights) { const reflected = reflectHeights(heights); return compareHeights(heights, reflected) <= 0 ? { heights, reflected: false } : { heights: reflected, reflected: true }; }

function reflectionIdMap(source, target, columns) {
  const result = new Array(source.masks.length); const seen = new Set();
  for (let id = 0; id < source.masks.length; id += 1) {
    const targetId = target.idByMask.get(reflectMask(source.masks[id], columns));
    if (targetId === undefined) throw new Error('reflected dictionary term missing');
    if (seen.has(targetId)) throw new Error('reflection dictionary map not injective');
    seen.add(targetId); result[id] = targetId;
  }
  if (seen.size !== target.masks.length) throw new Error('reflection dictionary map not surjective');
  return result;
}
function reflectCoverage(coverage, idMap) {
  let result = 0n; let remaining = coverage;
  while (remaining !== 0n) { const bit = remaining & -remaining; result |= 1n << BigInt(idMap[bigIntBitIndex(bit)]); remaining &= remaining - 1n; }
  return result;
}
function reflectFrontier(frontier, idMap) { return normalizeCoverageFrontier(frontier.map((coverage) => reflectCoverage(coverage, idMap))); }

function solveFull(columns, rows, connect, profile) {
  const { supports, supportsByRank, supportByKey, dictionaries, incidence } = profile;
  const frontiers = new Array(supports.length); const stats = { supportsSolved: 0, edges: 0, productPairs: 0 };
  for (let rank = columns * rows; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    for (const supportIndex of supportsByRank[rank]) {
      const support = supports[supportIndex]; const parentDictionary = dictionaries[supportIndex];
      let aggregate0 = null; let aggregate1 = null;
      for (let column = 0; column < columns; column += 1) {
        const row = support.heights[column]; if (row >= rows) continue;
        const childHeights = support.heights.slice(); childHeights[column] += 1;
        const childIndex = supportByKey.get(childHeights.join(',')); const child = frontiers[childIndex]; const childDictionary = dictionaries[childIndex];
        const landingCell = row * columns + column;
        let winner0 = cofactorCoverageFrontier(child.winner0, buildCofactorMap(parentDictionary, childDictionary, landingCell, mover === 0));
        let winner1 = cofactorCoverageFrontier(child.winner1, buildCofactorMap(parentDictionary, childDictionary, landingCell, mover === 1));
        const terminalRequirements = [];
        for (const line of incidence[landingCell]) { const requirement = (line & ~(1 << landingCell)) >>> 0; if (subset32(requirement, support.universe)) terminalRequirements.push(requirement); }
        if (terminalRequirements.length !== 0) {
          const terminalCoverage = terminalRequirements.map(terminalRecord).filter(Boolean).map((record) => coverageOfRecord(record, parentDictionary));
          if (mover === 0) winner0 = unionCoverageFrontiers(winner0, terminalCoverage); else winner1 = unionCoverageFrontiers(winner1, terminalCoverage);
          const blocker = normalizeRecord(terminalRequirements);
          if (blocker === null) { if (mover === 0) winner1 = []; else winner0 = []; }
          else {
            const blockerCoverage = coverageOfRecord(blocker, parentDictionary);
            if (mover === 0) winner1 = intersectCoverageFrontiers(winner1, [blockerCoverage], stats);
            else winner0 = intersectCoverageFrontiers(winner0, [blockerCoverage], stats);
          }
        }
        if (aggregate0 === null) { aggregate0 = winner0; aggregate1 = winner1; }
        else if (mover === 0) { aggregate0 = unionCoverageFrontiers(aggregate0, winner0); aggregate1 = intersectCoverageFrontiers(aggregate1, winner1, stats); }
        else { aggregate0 = intersectCoverageFrontiers(aggregate0, winner0, stats); aggregate1 = unionCoverageFrontiers(aggregate1, winner1); }
        stats.edges += 1;
      }
      frontiers[supportIndex] = { winner0: aggregate0 ?? [], winner1: aggregate1 ?? [] }; stats.supportsSolved += 1;
    }
  }
  return { frontiers, stats };
}

function solveQuotient(columns, rows, connect, profile) {
  const { supports, supportByKey, dictionaries, incidence } = profile;
  const repIndices = []; const repsByRank = Array.from({ length: columns * rows + 1 }, () => []);
  for (let index = 0; index < supports.length; index += 1) {
    const support = supports[index]; const canonical = canonicalHeights(support.heights);
    if (canonical.heights.join(',') === support.key) { repIndices.push(index); repsByRank[support.rank].push(index); }
  }
  const stored = new Map(); const stats = { supportsSolved: 0, edges: 0, mirroredChildTransports: 0, productPairs: 0 };
  const reflectionMaps = new Map();
  function mapFor(sourceIndex, targetIndex) {
    const key = `${sourceIndex}->${targetIndex}`; let map = reflectionMaps.get(key);
    if (!map) { map = reflectionIdMap(dictionaries[sourceIndex], dictionaries[targetIndex], columns); reflectionMaps.set(key, map); }
    return map;
  }

  for (let rank = columns * rows; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    for (const supportIndex of repsByRank[rank]) {
      const support = supports[supportIndex]; const parentDictionary = dictionaries[supportIndex];
      let aggregate0 = null; let aggregate1 = null;
      for (let column = 0; column < columns; column += 1) {
        const row = support.heights[column]; if (row >= rows) continue;
        const childHeights = support.heights.slice(); childHeights[column] += 1; const childKey = childHeights.join(','); const childIndex = supportByKey.get(childKey);
        const canonical = canonicalHeights(childHeights); const canonicalIndex = supportByKey.get(canonical.heights.join(',')); const canonicalChild = stored.get(canonicalIndex);
        if (!canonicalChild) throw new Error('canonical child frontier missing');
        let child = canonicalChild;
        if (canonical.reflected) {
          const idMap = mapFor(canonicalIndex, childIndex);
          child = { winner0: reflectFrontier(canonicalChild.winner0, idMap), winner1: reflectFrontier(canonicalChild.winner1, idMap) };
          stats.mirroredChildTransports += 1;
        }
        const childDictionary = dictionaries[childIndex]; const landingCell = row * columns + column;
        let winner0 = cofactorCoverageFrontier(child.winner0, buildCofactorMap(parentDictionary, childDictionary, landingCell, mover === 0));
        let winner1 = cofactorCoverageFrontier(child.winner1, buildCofactorMap(parentDictionary, childDictionary, landingCell, mover === 1));
        const terminalRequirements = [];
        for (const line of incidence[landingCell]) { const requirement = (line & ~(1 << landingCell)) >>> 0; if (subset32(requirement, support.universe)) terminalRequirements.push(requirement); }
        if (terminalRequirements.length !== 0) {
          const terminalCoverage = terminalRequirements.map(terminalRecord).filter(Boolean).map((record) => coverageOfRecord(record, parentDictionary));
          if (mover === 0) winner0 = unionCoverageFrontiers(winner0, terminalCoverage); else winner1 = unionCoverageFrontiers(winner1, terminalCoverage);
          const blocker = normalizeRecord(terminalRequirements);
          if (blocker === null) { if (mover === 0) winner1 = []; else winner0 = []; }
          else {
            const blockerCoverage = coverageOfRecord(blocker, parentDictionary);
            if (mover === 0) winner1 = intersectCoverageFrontiers(winner1, [blockerCoverage], stats);
            else winner0 = intersectCoverageFrontiers(winner0, [blockerCoverage], stats);
          }
        }
        if (aggregate0 === null) { aggregate0 = winner0; aggregate1 = winner1; }
        else if (mover === 0) { aggregate0 = unionCoverageFrontiers(aggregate0, winner0); aggregate1 = intersectCoverageFrontiers(aggregate1, winner1, stats); }
        else { aggregate0 = intersectCoverageFrontiers(aggregate0, winner0, stats); aggregate1 = unionCoverageFrontiers(aggregate1, winner1); }
        stats.edges += 1;
      }
      stored.set(supportIndex, { winner0: aggregate0 ?? [], winner1: aggregate1 ?? [] }); stats.supportsSolved += 1;
    }
  }
  return { stored, stats, repIndices, mapFor };
}

function qualifyGeometry(columns, rows, connect) {
  if (columns * rows >= 31) throw new RangeError('complete recurrence control backend requires fewer than 31 cells');
  const winningLines = createWinningLineMasks(columns, rows, connect); const supports = createSupports(columns, rows); const supportByKey = new Map(supports.map((support, index) => [support.key, index]));
  const supportsByRank = Array.from({ length: columns * rows + 1 }, () => []); supports.forEach((support, index) => supportsByRank[support.rank].push(index));
  const incidence = Array.from({ length: columns * rows }, () => []); for (const line of winningLines) forEachSetBit32(line, (cell) => incidence[cell].push(line));
  const dictionaries = supports.map((support) => createDictionary(support, winningLines)); const profile = { supports, supportByKey, supportsByRank, dictionaries, incidence };
  const full = solveFull(columns, rows, connect, profile); const quotient = solveQuotient(columns, rows, connect, profile);

  let frontierMismatches = 0; let reconstructedSupports = 0; let fixedSupportInvariantMismatches = 0;
  for (let supportIndex = 0; supportIndex < supports.length; supportIndex += 1) {
    const support = supports[supportIndex]; const canonical = canonicalHeights(support.heights); const canonicalIndex = supportByKey.get(canonical.heights.join(',')); const stored = quotient.stored.get(canonicalIndex);
    let reconstructed = stored;
    if (canonical.reflected) {
      const map = quotient.mapFor(canonicalIndex, supportIndex);
      reconstructed = { winner0: reflectFrontier(stored.winner0, map), winner1: reflectFrontier(stored.winner1, map) };
    } else if (support.key === reflectHeights(support.heights).join(',')) {
      const map = reflectionIdMap(dictionaries[supportIndex], dictionaries[supportIndex], columns);
      const rw0 = reflectFrontier(stored.winner0, map); const rw1 = reflectFrontier(stored.winner1, map);
      if (!equalCoverageFrontiers(rw0, stored.winner0) || !equalCoverageFrontiers(rw1, stored.winner1)) fixedSupportInvariantMismatches += 1;
    }
    const authority = full.frontiers[supportIndex];
    if (!equalCoverageFrontiers(reconstructed.winner0, authority.winner0) || !equalCoverageFrontiers(reconstructed.winner1, authority.winner1)) frontierMismatches += 1;
    reconstructedSupports += 1;
  }

  return {
    geometry: { columns, rows, connect },
    supports: supports.length,
    supportOrbits: quotient.repIndices.length,
    fullEdges: full.stats.edges,
    quotientEdges: quotient.stats.edges,
    fullProductPairs: full.stats.productPairs,
    quotientProductPairs: quotient.stats.productPairs,
    mirroredChildTransports: quotient.stats.mirroredChildTransports,
    reconstructedSupports,
    frontierMismatches,
    fixedSupportInvariantMismatches,
    supportReduction: 1 - quotient.repIndices.length / supports.length,
    edgeReduction: 1 - quotient.stats.edges / full.stats.edges,
    productReduction: full.stats.productPairs === 0 ? 0 : 1 - quotient.stats.productPairs / full.stats.productPairs,
  };
}

const controls = [[4,3,3],[4,4,4],[5,3,4],[4,4,3]];
const results = controls.map((control) => qualifyGeometry(...control));
const mismatchTotal = results.reduce((sum, result) => sum + result.frontierMismatches + result.fixedSupportInvariantMismatches, 0);
if (mismatchTotal !== 0) throw new Error(`reflection quotient recurrence mismatches: ${mismatchTotal}`);
console.log(JSON.stringify({ schemaVersion: 1, kind: 'connect4-bsfp-reflection-quotient-coverage-recurrence-qualification', authority: 'full support-local coverage recurrence', candidate: 'horizontal-reflection support-orbit recurrence with exact frontier transport', mismatchTotal, results }, null, 2));
