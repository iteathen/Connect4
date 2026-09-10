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
try {
  writeFileSync(tempPath, source, 'utf8');
  await import(`${pathToFileURL(tempPath).href}?reporting-corrected=1`);
} finally {
  rmSync(tempPath, { force: true });
}
