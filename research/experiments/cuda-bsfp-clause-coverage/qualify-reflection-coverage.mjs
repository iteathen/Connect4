#!/usr/bin/env node

// Qualify horizontal reflection as an exact automorphism of the variable-width
// support-local clause-coverage calculus. No game search or solved data.

function wordCountForBits(bitCount) { return Math.max(1, Math.ceil(bitCount / 32)); }
function zeroWords(count) { return new Array(count).fill(0); }
function cloneWords(words) { return words.map((value) => value >>> 0); }
function setBit(words, id) { words[Math.floor(id / 32)] = (words[Math.floor(id / 32)] | ((1 << (id % 32)) >>> 0)) >>> 0; }
function hasBit(words, id) { return (words[Math.floor(id / 32)] & ((1 << (id % 32)) >>> 0)) !== 0; }
function anyWords(words) { return words.some((value) => (value >>> 0) !== 0); }
function subsetWords(a, b) { return a.every((value, i) => ((value & ~b[i]) >>> 0) === 0); }
function intersectsWords(a, b) { return a.some((value, i) => ((value & b[i]) >>> 0) !== 0); }
function orWords(a, b) { return a.map((value, i) => (value | b[i]) >>> 0); }
function andWords(a, b) { return a.map((value, i) => (value & b[i]) >>> 0); }
function withoutWords(a, b) { return a.map((value, i) => (value & ~b[i]) >>> 0); }
function wordsEqual(a, b) { return a.length === b.length && a.every((value, i) => (value >>> 0) === (b[i] >>> 0)); }
function wordKey(words) { return words.map((value) => (value >>> 0).toString(16).padStart(8, '0')).join(':'); }
function compareWords(a, b) {
  for (let i = a.length - 1; i >= 0; i -= 1) {
    const left = a[i] >>> 0; const right = b[i] >>> 0;
    if (left !== right) return left < right ? -1 : 1;
  }
  return 0;
}
function pop32(mask) { let value = mask >>> 0; let count = 0; while (value !== 0) { value = (value & (value - 1)) >>> 0; count += 1; } return count; }
function popWords(words) { return words.reduce((sum, value) => sum + pop32(value), 0); }
function setBitsWords(words, bitCount) {
  const out = [];
  for (let w = 0; w < words.length; w += 1) {
    let value = words[w] >>> 0;
    while (value !== 0) {
      const bit = (value & -value) >>> 0;
      const offset = 31 - Math.clz32(bit);
      const id = w * 32 + offset;
      if (id < bitCount) out.push(id);
      value = (value & (value - 1)) >>> 0;
    }
  }
  return out;
}
function singletonMask(bitCount, id) { const words = zeroWords(wordCountForBits(bitCount)); setBit(words, id); return words; }

function createWinningLines(columns, rows, connect) {
  const cells = columns * rows; const wordCount = wordCountForBits(cells); const lines = []; const seen = new Set();
  const index = (c, r) => r * columns + c;
  function add(c0, r0, dc, dr) {
    const line = zeroWords(wordCount);
    for (let step = 0; step < connect; step += 1) setBit(line, index(c0 + dc * step, r0 + dr * step));
    const key = wordKey(line); if (!seen.has(key)) { seen.add(key); lines.push(line); }
  }
  for (let r = 0; r < rows; r += 1) for (let c = 0; c <= columns - connect; c += 1) add(c, r, 1, 0);
  for (let c = 0; c < columns; c += 1) for (let r = 0; r <= rows - connect; r += 1) add(c, r, 0, 1);
  for (let c = 0; c <= columns - connect; c += 1) for (let r = 0; r <= rows - connect; r += 1) add(c, r, 1, 1);
  for (let c = 0; c <= columns - connect; c += 1) for (let r = connect - 1; r < rows; r += 1) add(c, r, 1, -1);
  return lines;
}

function supportMask(heights, rows) {
  const columns = heights.length; const cells = columns * rows; const mask = zeroWords(wordCountForBits(cells));
  for (let c = 0; c < columns; c += 1) {
    if (!Number.isInteger(heights[c]) || heights[c] < 0 || heights[c] > rows) throw new RangeError('invalid support height');
    for (let r = 0; r < heights[c]; r += 1) setBit(mask, r * columns + c);
  }
  return mask;
}
function reflectHeights(heights) { return [...heights].reverse(); }
function reflectCell(cell, columns) { const row = Math.floor(cell / columns); const col = cell % columns; return row * columns + (columns - 1 - col); }
function reflectMask(mask, columns, rows) {
  const cells = columns * rows; const out = zeroWords(mask.length);
  for (const cell of setBitsWords(mask, cells)) setBit(out, reflectCell(cell, columns));
  return out;
}

function dictionaryForSupport(columns, rows, connect, heights, lines = createWinningLines(columns, rows, connect)) {
  const cells = columns * rows; const support = supportMask(heights, rows); const map = new Map();
  for (const cell of setBitsWords(support, cells)) { const one = singletonMask(cells, cell); map.set(wordKey(one), one); }
  for (const line of lines) { const q = andWords(line, support); if (anyWords(q)) map.set(wordKey(q), q); }
  const dictionary = [...map.values()].sort((a, b) => popWords(a) - popWords(b) || compareWords(a, b));
  return { support, dictionary };
}
function dictionaryIndex(dictionary) { return new Map(dictionary.map((clause, id) => [wordKey(clause), id])); }

function normalizeRecord(clauses) {
  const unique = new Map(); for (const clause of clauses) unique.set(wordKey(clause), cloneWords(clause));
  if ([...unique.values()].some((clause) => !anyWords(clause))) return null;
  const ordered = [...unique.values()].sort((a, b) => popWords(a) - popWords(b) || compareWords(a, b));
  const out = [];
  outer: for (const clause of ordered) { for (const retained of out) if (subsetWords(retained, clause)) continue outer; out.push(clause); }
  return out;
}
function coverageOf(record, dictionary) {
  const words = zeroWords(wordCountForBits(dictionary.length));
  for (let id = 0; id < dictionary.length; id += 1) for (const clause of record) if (subsetWords(clause, dictionary[id])) { setBit(words, id); break; }
  return words;
}
function permuteCoverage(words, idMap, destinationSize) {
  const out = zeroWords(wordCountForBits(destinationSize));
  for (const id of setBitsWords(words, idMap.length)) setBit(out, idMap[id]);
  return out;
}

function createMetadata(dictionary, cells) {
  const coverageWords = wordCountForBits(dictionary.length);
  const singletonMaskCoverage = zeroWords(coverageWords);
  const singletonBits = Array.from({ length: cells }, () => zeroWords(coverageWords));
  const contains = Array.from({ length: cells }, () => zeroWords(coverageWords));
  for (let id = 0; id < dictionary.length; id += 1) {
    const bits = setBitsWords(dictionary[id], cells);
    if (bits.length === 1) { setBit(singletonMaskCoverage, id); setBit(singletonBits[bits[0]], id); }
    for (const cell of bits) setBit(contains[cell], id);
  }
  return { singletonMaskCoverage, singletonBits, contains };
}
function boundedCapacityKeepRecord(record, universe, exactCount) {
  let forced = zeroWords(universe.length); const residual = [];
  for (const clause of record) { if (popWords(clause) === 1) forced = orWords(forced, clause); else residual.push(clause); }
  const forcedCount = popWords(forced); if (forcedCount > exactCount) return false;
  const unsatisfied = residual.filter((clause) => !intersectsWords(clause, forced));
  if (unsatisfied.length === 0) return true; if (forcedCount === exactCount) return false; if (forcedCount + 1 !== exactCount) return true;
  let common = universe.map((value, i) => (value & ~forced[i]) >>> 0); for (const clause of unsatisfied) common = andWords(common, clause); return anyWords(common);
}
function capacityKeepCoverage(candidate, metadata, support, cells, exactCount) {
  let forcedCount = 0; for (let w = 0; w < candidate.length; w += 1) forcedCount += pop32(candidate[w] & metadata.singletonMaskCoverage[w]);
  if (forcedCount > exactCount) return false;
  const forcedCells = zeroWords(support.length);
  for (let cell = 0; cell < cells; cell += 1) if (candidate.some((value, w) => ((value & metadata.singletonBits[cell][w]) >>> 0) !== 0)) setBit(forcedCells, cell);
  const satisfied = zeroWords(candidate.length);
  for (const cell of setBitsWords(forcedCells, cells)) for (let w = 0; w < candidate.length; w += 1) satisfied[w] = (satisfied[w] | metadata.contains[cell][w]) >>> 0;
  const extra = candidate.map((value, w) => (value & ~satisfied[w]) >>> 0); if (!anyWords(extra)) return true;
  if (forcedCount === exactCount) return false; if (forcedCount + 1 !== exactCount) return true;
  for (const cell of setBitsWords(withoutWords(support, forcedCells), cells)) if (subsetWords(extra, metadata.contains[cell])) return true;
  return false;
}

function cofactorTerm(clause, landing, ownerTrue) {
  if (ownerTrue) return intersectsWords(clause, landing) ? { kind: 'satisfied' } : { kind: 'term', clause };
  const reduced = withoutWords(clause, landing); return anyWords(reduced) ? { kind: 'term', clause: reduced } : { kind: 'kill' };
}

function buildIdMap(dictionary, mirrorDictionary, columns, rows) {
  const mirrorIndex = dictionaryIndex(mirrorDictionary); const map = new Array(dictionary.length); const seen = new Set();
  for (let id = 0; id < dictionary.length; id += 1) {
    const reflected = reflectMask(dictionary[id], columns, rows); const target = mirrorIndex.get(wordKey(reflected));
    if (target === undefined) throw new Error('reflected dictionary term missing');
    if (seen.has(target)) throw new Error('reflection dictionary map not injective');
    seen.add(target); map[id] = target;
  }
  if (seen.size !== mirrorDictionary.length) throw new Error('reflection dictionary map not surjective');
  return map;
}

function checkSupport(columns, rows, connect, heights, counters, deep = false) {
  const cells = columns * rows; const lines = createWinningLines(columns, rows, connect); const mirrorHeights = reflectHeights(heights);
  const left = dictionaryForSupport(columns, rows, connect, heights, lines); const right = dictionaryForSupport(columns, rows, connect, mirrorHeights, lines);
  if (!wordsEqual(reflectMask(left.support, columns, rows), right.support)) throw new Error('support reflection mismatch');
  const idMap = buildIdMap(left.dictionary, right.dictionary, columns, rows);
  counters.supports += 1; counters.dictionaryTerms += left.dictionary.length; counters.maxDictionary = Math.max(counters.maxDictionary, left.dictionary.length);
  counters.maxCoverageWords = Math.max(counters.maxCoverageWords, wordCountForBits(left.dictionary.length)); counters.maxCellWords = Math.max(counters.maxCellWords, left.support.length);

  for (let a = 0; a < left.dictionary.length; a += 1) for (let b = 0; b < left.dictionary.length; b += 1) {
    if (subsetWords(left.dictionary[a], left.dictionary[b]) !== subsetWords(right.dictionary[idMap[a]], right.dictionary[idMap[b]])) throw new Error('clause-order reflection mismatch');
    counters.posetComparisons += 1;
  }
  for (let id = 0; id < left.dictionary.length; id += 1) {
    const coverage = coverageOf([left.dictionary[id]], left.dictionary);
    const mirrorCoverage = coverageOf([reflectMask(left.dictionary[id], columns, rows)], right.dictionary);
    if (!wordsEqual(permuteCoverage(coverage, idMap, right.dictionary.length), mirrorCoverage)) throw new Error('coverage reflection mismatch');
    counters.coverageBasis += 1;
  }

  const leftMeta = createMetadata(left.dictionary, cells); const rightMeta = createMetadata(right.dictionary, cells);
  if (!wordsEqual(permuteCoverage(leftMeta.singletonMaskCoverage, idMap, right.dictionary.length), rightMeta.singletonMaskCoverage)) throw new Error('singleton metadata reflection mismatch');
  for (let cell = 0; cell < cells; cell += 1) {
    const mirrorCell = reflectCell(cell, columns);
    if (!wordsEqual(permuteCoverage(leftMeta.contains[cell], idMap, right.dictionary.length), rightMeta.contains[mirrorCell])) throw new Error('contains metadata reflection mismatch');
  }

  if (deep && left.dictionary.length > 0) {
    const rank = heights.reduce((sum, value) => sum + value, 0); const exactCounts = [Math.ceil(rank / 2), Math.floor(rank / 2)];
    const candidateRecords = []; const ids = [0, Math.floor(left.dictionary.length / 2), left.dictionary.length - 1].filter((id, index, all) => id >= 0 && all.indexOf(id) === index);
    for (const id of ids) candidateRecords.push([left.dictionary[id]]);
    for (let a = 0; a < ids.length; a += 1) for (let b = a + 1; b < ids.length; b += 1) { const normalized = normalizeRecord([left.dictionary[ids[a]], left.dictionary[ids[b]]]); if (normalized) candidateRecords.push(normalized); }
    for (const record of candidateRecords) {
      const reflected = normalizeRecord(record.map((clause) => reflectMask(clause, columns, rows)));
      const leftCoverage = coverageOf(record, left.dictionary); const rightCoverage = coverageOf(reflected, right.dictionary);
      if (!wordsEqual(permuteCoverage(leftCoverage, idMap, right.dictionary.length), rightCoverage)) throw new Error('record coverage reflection mismatch');
      for (const exactCount of exactCounts) {
        const authorityLeft = boundedCapacityKeepRecord(record, left.support, exactCount); const authorityRight = boundedCapacityKeepRecord(reflected, right.support, exactCount);
        const packedLeft = capacityKeepCoverage(leftCoverage, leftMeta, left.support, cells, exactCount); const packedRight = capacityKeepCoverage(rightCoverage, rightMeta, right.support, cells, exactCount);
        if (authorityLeft !== authorityRight || packedLeft !== packedRight || authorityLeft !== packedLeft) throw new Error('capacity reflection mismatch');
        counters.capacityCases += 1;
      }
    }
  }

  for (let column = 0; column < columns; column += 1) {
    if (heights[column] >= rows) continue;
    const childHeights = [...heights]; childHeights[column] += 1; const mirrorChildHeights = reflectHeights(childHeights);
    const child = dictionaryForSupport(columns, rows, connect, childHeights, lines); const mirrorChild = dictionaryForSupport(columns, rows, connect, mirrorChildHeights, lines);
    const childMap = buildIdMap(child.dictionary, mirrorChild.dictionary, columns, rows);
    const landingCell = heights[column] * columns + column; const landing = singletonMask(cells, landingCell); const mirrorLanding = singletonMask(cells, reflectCell(landingCell, columns));
    const parentIndex = dictionaryIndex(left.dictionary); const mirrorParentIndex = dictionaryIndex(right.dictionary);
    for (let id = 0; id < child.dictionary.length; id += 1) {
      const q = child.dictionary[id]; const rq = mirrorChild.dictionary[childMap[id]];
      for (const ownerTrue of [true, false]) {
        const a = cofactorTerm(q, landing, ownerTrue); const b = cofactorTerm(rq, mirrorLanding, ownerTrue);
        if (a.kind !== b.kind) throw new Error('cofactor reflection kind mismatch');
        if (a.kind === 'term') {
          if (!wordsEqual(reflectMask(a.clause, columns, rows), b.clause)) throw new Error('cofactor reflected term mismatch');
          if (parentIndex.get(wordKey(a.clause)) === undefined || mirrorParentIndex.get(wordKey(b.clause)) === undefined) throw new Error('cofactor result not in parent dictionary');
        }
        counters.cofactorTermCases += 1;
      }
    }
    counters.edges += 1;
  }
}

function enumerateSupports(columns, rows, visitor) {
  const heights = new Array(columns).fill(0);
  function walk(column) { if (column === columns) { visitor([...heights]); return; } for (let height = 0; height <= rows; height += 1) { heights[column] = height; walk(column + 1); } }
  walk(0);
}
function reflectionOrbitCounts(columns, rows) {
  const supports = (rows + 1) ** columns; const fixedSupports = (rows + 1) ** Math.ceil(columns / 2); const supportOrbits = (supports + fixedSupports) / 2;
  const edges = columns * rows * (rows + 1) ** (columns - 1); const fixedEdges = columns % 2 === 1 ? rows * (rows + 1) ** Math.floor(columns / 2) : 0; const edgeOrbits = (edges + fixedEdges) / 2;
  return { supports, fixedSupports, supportOrbits, edges, fixedEdges, edgeOrbits };
}

const counters = { supports: 0, edges: 0, dictionaryTerms: 0, posetComparisons: 0, coverageBasis: 0, capacityCases: 0, cofactorTermCases: 0, maxDictionary: 0, maxCoverageWords: 0, maxCellWords: 0 };
for (const geometry of [[4,3,3],[4,4,4],[5,3,4]]) { const [columns, rows, connect] = geometry; enumerateSupports(columns, rows, (heights) => checkSupport(columns, rows, connect, heights, counters, false)); }
const targeted = [
  { g:[7,6,4], h:[0,0,0,0,0,0,0] },
  { g:[7,6,4], h:[6,6,6,6,6,6,6] },
  { g:[7,6,4], h:[6,6,6,6,6,6,5] },
  { g:[7,6,4], h:[6,5,4,3,2,1,0] },
  { g:[7,6,4], h:[1,2,3,4,3,2,1] },
  { g:[7,6,4], h:[5,6,6,6,6,6,5] },
  { g:[8,6,4], h:[6,6,6,6,6,6,6,6] },
  { g:[8,6,4], h:[6,6,6,6,6,6,6,5] },
];
for (const entry of targeted) checkSupport(...entry.g, entry.h, counters, true);

const output = {
  schemaVersion: 1,
  kind: 'connect4-bsfp-variable-width-horizontal-reflection-coverage-qualification',
  authority: 'rule-derived horizontal reflection automorphism',
  mismatchTotal: 0,
  completeControlGeometries: [[4,3,3],[4,4,4],[5,3,4]],
  targetedVariableWidthCases: targeted.map((entry) => ({ geometry: entry.g, heights: entry.h })),
  counters,
  standard7x6OrbitCounts: reflectionOrbitCounts(7,6),
  eightBySixOrbitCounts: reflectionOrbitCounts(8,6),
};
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
