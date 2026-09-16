#!/usr/bin/env node

// Bounded >64-bit falsifier for core-relative antichain-product absorption.
// Reuses the existing rank-27 6x5 clause authority implementation rather than
// duplicating its recurrence. No descent below rank 27 is performed.

import { readFile, writeFile, unlink } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const authorityPath = join(here, 'qualify-multiword-universal.mjs');
const generatedPath = join(here, '.generated-multiword-absorption-authority.mjs');

let authoritySource = await readFile(authorityPath, 'utf8');
if (!/\nrun\(\);\s*$/.test(authoritySource)) throw new Error('multiword authority entry point changed');
authoritySource = authoritySource.replace(/\nrun\(\);\s*$/, `
export {
  createWinningLines, createSupports, setBits32, subset32,
  cofactorFrontier, terminalRecord, normalizeFrontier, exactIntersect,
  localDictionary, wordCountFor, createCoverageMetadata, coverageOf,
  capacityKeepCoverage, normalizeCoverage, orWords, subsetWords, wordsKey,
  filteredIntersectAuthority,
};
`);
await writeFile(generatedPath, authoritySource, 'utf8');

let authority;
try {
  authority = await import(`${pathToFileURL(generatedPath).href}?t=${Date.now()}`);
} finally {
  // The generated helper is removed after import; imported module state remains live.
  await unlink(generatedPath).catch(() => {});
}

const {
  createWinningLines, createSupports, setBits32, subset32,
  cofactorFrontier, terminalRecord, normalizeFrontier, exactIntersect,
  localDictionary, wordCountFor, createCoverageMetadata, coverageOf,
  capacityKeepCoverage, normalizeCoverage, orWords, subsetWords, wordsKey,
  filteredIntersectAuthority,
} = authority;

function zeroWords(count) { return new Array(count).fill(0); }
function andWords(left, right) { return left.map((value, index) => (value & right[index]) >>> 0); }
function andNotWords(left, mask) { return left.map((value, index) => (value & ~mask[index]) >>> 0); }
function equalFrontiers(left, right) {
  if (left.length !== right.length) return false;
  const a = left.map(wordsKey).sort();
  const b = right.map(wordsKey).sort();
  return a.every((value, index) => value === b[index]);
}
function coreWords(frontier, wordCount) {
  if (frontier.length === 0) return zeroWords(wordCount);
  let core = frontier[0].slice();
  for (let index = 1; index < frontier.length; index += 1) core = andWords(core, frontier[index]);
  return core;
}
function absorbedResiduals(left, right) {
  const leftAbsorbed = new Array(left.length).fill(false);
  const rightAbsorbed = new Array(right.length).fill(false);
  for (let i = 0; i < left.length; i += 1) {
    for (let j = 0; j < right.length; j += 1) {
      if (!leftAbsorbed[i] && subsetWords(right[j], left[i])) leftAbsorbed[i] = true;
      if (!rightAbsorbed[j] && subsetWords(left[i], right[j])) rightAbsorbed[j] = true;
    }
  }
  return { leftAbsorbed, rightAbsorbed };
}

function qualifyMerge(leftClause, rightClause, support, winningLines, exactCount) {
  const dictionary = localDictionary(winningLines, support);
  const wordCount = wordCountFor(dictionary.length);
  if (wordCount < 3) return null;

  const metadata = createCoverageMetadata(dictionary, support, wordCount);
  const left = leftClause.map((record) => coverageOf(record, dictionary, wordCount));
  const right = rightClause.map((record) => coverageOf(record, dictionary, wordCount));

  const fullCandidates = [];
  let fullRejected = 0;
  for (const a of left) for (const b of right) {
    const candidate = orWords(a, b);
    if (capacityKeepCoverage(candidate, metadata, exactCount)) fullCandidates.push(candidate);
    else fullRejected += 1;
  }
  const fullFrontier = normalizeCoverage(fullCandidates);

  const coreA = coreWords(left, wordCount);
  const coreB = coreWords(right, wordCount);
  const commonCore = orWords(coreA, coreB);
  const residualLeft = normalizeCoverage(left.map((value) => andNotWords(value, commonCore)));
  const residualRight = normalizeCoverage(right.map((value) => andNotWords(value, commonCore)));
  const { leftAbsorbed, rightAbsorbed } = absorbedResiduals(residualLeft, residualRight);

  const factoredCandidates = [];
  let factoredRejected = 0;
  let absorbedRecordEmits = 0;
  let residualPairProducts = 0;
  function emit(residual) {
    const candidate = orWords(residual, commonCore);
    if (capacityKeepCoverage(candidate, metadata, exactCount)) factoredCandidates.push(candidate);
    else factoredRejected += 1;
  }
  for (let i = 0; i < residualLeft.length; i += 1) {
    if (!leftAbsorbed[i]) continue;
    absorbedRecordEmits += 1;
    emit(residualLeft[i]);
  }
  for (let j = 0; j < residualRight.length; j += 1) {
    if (!rightAbsorbed[j]) continue;
    absorbedRecordEmits += 1;
    emit(residualRight[j]);
  }
  for (let i = 0; i < residualLeft.length; i += 1) {
    if (leftAbsorbed[i]) continue;
    for (let j = 0; j < residualRight.length; j += 1) {
      if (rightAbsorbed[j]) continue;
      residualPairProducts += 1;
      emit(orWords(residualLeft[i], residualRight[j]));
    }
  }
  const factoredFrontier = normalizeCoverage(factoredCandidates);

  // Independent clause-array authority is retained as an additional falsifier.
  const clauseAuthority = filteredIntersectAuthority(leftClause, rightClause, support, exactCount);
  const expected = normalizeCoverage(clauseAuthority.frontier.map((record) => coverageOf(record, dictionary, wordCount)));

  const frontierMismatch = !equalFrontiers(fullFrontier, factoredFrontier) || !equalFrontiers(expected, factoredFrontier);
  const rawPairs = left.length * right.length;
  const residualCartesianPairs = residualLeft.length * residualRight.length;
  const generatedOperations = absorbedRecordEmits + residualPairProducts;
  return {
    dictionarySize: dictionary.length,
    wordCount,
    leftRecords: left.length,
    rightRecords: right.length,
    rawPairs,
    fullRejected,
    fullSurvivors: fullFrontier.length,
    coreBits: commonCore.reduce((sum, word) => {
      let value = word >>> 0; let count = 0;
      while (value !== 0) { value &= value - 1; count += 1; }
      return sum + count;
    }, 0),
    residualLeftRecords: residualLeft.length,
    residualRightRecords: residualRight.length,
    residualCartesianPairs,
    leftAbsorbed: leftAbsorbed.filter(Boolean).length,
    rightAbsorbed: rightAbsorbed.filter(Boolean).length,
    residualPairProducts,
    absorbedRecordEmits,
    generatedOperations,
    factoredRejected,
    factoredSurvivors: factoredFrontier.length,
    frontierMismatch,
    generatedOverRaw: rawPairs === 0 ? 0 : generatedOperations / rawPairs,
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
          if (mover === 0) winner0 = normalizeFrontier([...winner0, ...moverRecords]);
          else winner1 = normalizeFrontier([...winner1, ...moverRecords]);
          const blocker = authority.normalizeRecord ? authority.normalizeRecord(terminalRequirements) : null;
          // normalizeRecord is intentionally not exported; terminalRequirements are
          // all nonempty and the same authority effect is obtained via one-record
          // normalization through exactIntersect below when needed.
          const blockerRecord = (() => {
            const unique = [...new Set(terminalRequirements.map((value) => value >>> 0))];
            unique.sort((a, b) => {
              const pc = (x) => { let v = x >>> 0, n = 0; while (v) { v &= v - 1; n += 1; } return n; };
              return pc(a) - pc(b) || a - b;
            });
            const result = [];
            outer: for (const candidate of unique) {
              for (const retained of result) if (subset32(retained, candidate)) continue outer;
              result.push(candidate);
            }
            return result;
          })();
          if (blocker === null && blockerRecord.length === 0) {
            if (mover === 0) winner1 = []; else winner0 = [];
          } else if (mover === 0) winner1 = exactIntersect(winner1, [blockerRecord]);
          else winner0 = exactIntersect(winner0, [blockerRecord]);
        }

        if (aggregate0 === null) {
          aggregate0 = winner0; aggregate1 = winner1;
        } else if (mover === 0) {
          aggregate0 = normalizeFrontier([...aggregate0, ...winner0]);
          aggregate1 = exactIntersect(aggregate1, winner1);
        } else {
          if (rank === 27 && aggregate0.length !== 0 && winner0.length !== 0) {
            const result = qualifyMerge(aggregate0, winner0, support, winningLines, Math.ceil(rank / 2));
            if (result !== null) merges.push({ supportHeights: support.heights.slice(), column, ...result });
          }
          aggregate0 = exactIntersect(aggregate0, winner0);
          aggregate1 = normalizeFrontier([...aggregate1, ...winner1]);
        }
      }
      frontiers[supportIndex] = { winner0: aggregate0 ?? [], winner1: aggregate1 ?? [] };
    }
  }

  if (merges.length === 0) throw new Error('no >64-ID real rank-27 universal merges captured');
  const mismatchTotal = merges.filter((merge) => merge.frontierMismatch).length;
  const totals = merges.reduce((sum, merge) => ({
    rawPairs: sum.rawPairs + merge.rawPairs,
    residualCartesianPairs: sum.residualCartesianPairs + merge.residualCartesianPairs,
    residualPairProducts: sum.residualPairProducts + merge.residualPairProducts,
    absorbedRecordEmits: sum.absorbedRecordEmits + merge.absorbedRecordEmits,
    generatedOperations: sum.generatedOperations + merge.generatedOperations,
    fullRejected: sum.fullRejected + merge.fullRejected,
    factoredRejected: sum.factoredRejected + merge.factoredRejected,
  }), { rawPairs: 0, residualCartesianPairs: 0, residualPairProducts: 0, absorbedRecordEmits: 0, generatedOperations: 0, fullRejected: 0, factoredRejected: 0 });
  const hottest = [...merges].sort((a, b) => b.rawPairs - a.rawPairs)[0];
  const output = {
    schemaVersion: 1,
    kind: 'connect4-bsfp-multiword-core-relative-absorption-qualification',
    geometry: { columns, rows, connect },
    authority: 'existing variable-array clause recurrence plus full three-u32 coverage product',
    candidate: 'three-u32 common-core factor + residual normalization + cross-frontier absorption + residual product + core reattachment',
    solvedRanks: [30, 29, 28, 27],
    mergeCount: merges.length,
    mismatchTotal,
    maximumDictionary: Math.max(...merges.map((merge) => merge.dictionarySize)),
    maximumWordCount: Math.max(...merges.map((merge) => merge.wordCount)),
    totals: {
      ...totals,
      generatedOverRaw: totals.rawPairs === 0 ? 0 : totals.generatedOperations / totals.rawPairs,
      pairProductOverRaw: totals.rawPairs === 0 ? 0 : totals.residualPairProducts / totals.rawPairs,
    },
    hottest,
  };
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (mismatchTotal !== 0) process.exitCode = 1;
}

run();
