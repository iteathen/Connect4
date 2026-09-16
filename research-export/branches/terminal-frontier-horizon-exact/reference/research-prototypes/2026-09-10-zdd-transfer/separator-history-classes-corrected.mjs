import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SOURCE_URL = new URL('./separator-history-classes.mjs', import.meta.url);
const TEMP_URL = new URL('./.separator-history-classes.corrected.tmp.mjs', import.meta.url);
let source = readFileSync(SOURCE_URL, 'utf8');

function replaceExact(label, from, to, expectedCount = 1) {
  let count = 0;
  let cursor = 0;
  for (;;) {
    const index = source.indexOf(from, cursor);
    if (index < 0) break;
    count += 1;
    cursor = index + from.length;
  }
  if (count !== expectedCount) {
    throw new Error(`${label}: expected ${expectedCount} source matches, found ${count}`);
  }
  source = source.split(from).join(to);
}

replaceExact(
  'target-terminal reachability ordering',
  `      const p0 = fullP0Mask & universe;\n      const p1 = universe & ~fullP0Mask;\n      if (hasWin(lineMasks, p0) || hasWin(lineMasks, p1)) continue;\n      if (supportIndex === targetIndex) return true;`,
  `      const p0 = fullP0Mask & universe;\n      const p1 = universe & ~fullP0Mask;\n      if (supportIndex === targetIndex) return true;\n      if (hasWin(lineMasks, p0) || hasWin(lineMasks, p1)) continue;`,
);

replaceExact('reachable witness label A', 'legalNonterminalA', 'physicallyReachableA', 2);
replaceExact('reachable witness label B', 'legalNonterminalB', 'physicallyReachableB', 2);
replaceExact(
  'reachable collision aggregate label',
  'firstPhysicallyLegalCollision',
  'firstPhysicallyReachableCollision',
  4,
);

replaceExact(
  'support weighted-mean sufficient statistics',
  `    meanHistoryClasses: totalCrossingAssignments === 0 ? 1 : totalWeightedHistoryClasses / totalCrossingAssignments,`,
  `    meanHistoryClasses: totalCrossingAssignments === 0 ? 1 : totalWeightedHistoryClasses / totalCrossingAssignments,\n    historyClassAssignmentSum: totalWeightedHistoryClasses,\n    crossingAssignmentCount: totalCrossingAssignments,`,
);

replaceExact(
  'case weighted-mean aggregation',
  `    if (result.cutsMeasured > 0) {\n      weightedMeanNumerator += result.meanHistoryClasses * result.cutsMeasured;\n      weightedMeanDenominator += result.cutsMeasured;\n    }`,
  `    if (result.crossingAssignmentCount > 0) {\n      weightedMeanNumerator += result.historyClassAssignmentSum;\n      weightedMeanDenominator += result.crossingAssignmentCount;\n    }`,
);

replaceExact(
  'case weighted-mean result label',
  '    meanOfSupportCutMeans: weightedMeanDenominator === 0 ? 1 : weightedMeanNumerator / weightedMeanDenominator,',
  '    meanHistoryClassesAcrossCrossingAssignments: weightedMeanDenominator === 0 ? 1 : weightedMeanNumerator / weightedMeanDenominator,',
);

replaceExact(
  'top-level correction metadata',
  `  hotSupportCount: HOT_SUPPORTS,\n  cases: results,`,
  `  hotSupportCount: HOT_SUPPORTS,\n  reportingCorrections: [\n    'target states may be terminal when strict prefixes are nonterminal',\n    'case mean is weighted by crossing assignments rather than support/cut means',\n  ],\n  cases: results,`,
);

const tempPath = fileURLToPath(TEMP_URL);
const originalLog = console.log;
const captured = [];
let parsed = null;
try {
  writeFileSync(tempPath, source, 'utf8');
  console.log = (...args) => captured.push(args.map(String).join(' '));
  await import(`${pathToFileURL(tempPath).href}?reporting-corrected=1`);
  const payload = captured.findLast((message) => message.includes('"kind": "connect4-bsfp-separator-hidden-history-census"'));
  if (!payload) throw new Error('corrected separator census did not emit its expected JSON payload');
  parsed = JSON.parse(payload);
} finally {
  console.log = originalLog;
  rmSync(tempPath, { force: true });
}

const compact = {
  kind: 'connect4-bsfp-separator-hidden-history-census-summary',
  status: parsed.status,
  semantics: parsed.semantics,
  hypothesis: parsed.hypothesis,
  reportingCorrections: parsed.reportingCorrections,
  cases: parsed.cases.map((entry) => ({
    geometry: entry.geometry,
    selection: entry.selection,
    selectedSupportCount: entry.selectedSupportCount,
    structuralMaximumCrossingWidth: entry.structuralMaximumCrossingWidth,
    maxHistoryClasses: entry.maxHistoryClasses,
    historyBits: entry.historyBits,
    meanHistoryClassesAcrossCrossingAssignments: entry.meanHistoryClassesAcrossCrossingAssignments,
    capacityCuts: entry.capacityCuts,
    worstSupport: entry.worstSupport ? {
      supportIndex: entry.worstSupport.supportIndex,
      rank: entry.worstSupport.rank,
      heights: entry.worstSupport.heights,
      maxHistoryClasses: entry.worstSupport.maxHistoryClasses,
      historyBits: entry.worstSupport.historyBits,
      meanHistoryClasses: entry.worstSupport.meanHistoryClasses,
      worstCut: entry.worstSupport.worstCut,
    } : null,
    hasPhysicallyReachableCollision: entry.firstPhysicallyReachableCollision !== null,
    firstPhysicallyReachableCollision: entry.firstPhysicallyReachableCollision,
  })),
};

console.log(JSON.stringify(compact));
