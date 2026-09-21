import fs from 'node:fs';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';

import { loadSolvedActionCorpus } from '../../components/oracle/index.mjs';
import { IsoMaxSolver } from '../../components/isometric/index.mjs';

const corpus = loadSolvedActionCorpus(new URL('../../reference/oracles/solved-actions-v1.meta.json', import.meta.url));
const group = 'middle-easy';
const sourceSet = 'Test_L2_R1';
const limit = Number.parseInt(process.env.C4_EXTERNAL_LIMIT ?? '64', 10);
if (!Number.isInteger(limit) || limit < 1 || limit > 64) throw new RangeError('C4_EXTERNAL_LIMIT must be in [1,64]');

const external = {
  repository: 'megakilo/alphafour',
  revision: 'cf2d4546e5824c155e9dd7e888a572bff3128498',
  path: 'testdata/Test_L2_R1',
  url: 'https://raw.githubusercontent.com/megakilo/alphafour/cf2d4546e5824c155e9dd7e888a572bff3128498/testdata/Test_L2_R1',
};

function parseExternal(text) {
  return text.trim().split(/\r?\n/).map((line, index) => {
    const [sequence, scoreText, ...extra] = line.trim().split(/\s+/);
    if (!sequence || scoreText === undefined || extra.length !== 0) throw new Error(`external row ${index + 1} malformed`);
    const score = Number.parseInt(scoreText, 10);
    if (!Number.isInteger(score)) throw new Error(`external row ${index + 1} score malformed`);
    return { line: index + 1, sequence, score };
  });
}

function movesFromSequence(sequence) {
  const moves = new Uint8Array(sequence.length);
  for (let i = 0; i < sequence.length; i += 1) {
    const move = sequence.charCodeAt(i) - 49;
    if (move < 0 || move > 6) throw new Error(`invalid Pons move digit at ${i}`);
    moves[i] = move;
  }
  return moves;
}

const response = await fetch(external.url, { redirect: 'error' });
if (!response.ok) throw new Error(`external reference fetch failed: ${response.status}`);
const externalText = await response.text();
const externalRows = parseExternal(externalText);
const externalSha256 = crypto.createHash('sha256').update(externalText).digest('hex');

const vectors = corpus.vectors.filter((vector) => vector.group === group && vector.sourceSet === sourceSet).slice(0, limit);
if (vectors.length !== limit) throw new Error(`expected ${limit} frozen vectors, found ${vectors.length}`);

for (const vector of vectors) {
  const row = externalRows[vector.sourceLine - 1];
  if (!row) throw new Error(`external source line ${vector.sourceLine} missing`);
  if (row.sequence !== vector.sequence || row.score !== vector.oracleScore) {
    throw new Error(`external/local mismatch at source line ${vector.sourceLine}`);
  }
}

const cases = [];
let mismatchCount = 0;
let totalNodes = 0;
const started = performance.now();

for (const vector of vectors) {
  const solver = new IsoMaxSolver();
  const caseStart = performance.now();
  const solved = solver.solveMoves(movesFromSequence(vector.sequence));
  const elapsedMs = performance.now() - caseStart;
  const expectedP0Wdl = Math.sign(vector.oracleScore) * (vector.sequence.length % 2 === 0 ? 1 : -1);
  const matched = solved.value === expectedP0Wdl;
  if (!matched) mismatchCount += 1;
  totalNodes += solved.metrics.nodes ?? 0;
  cases.push({
    sourceLine: vector.sourceLine,
    sequence: vector.sequence,
    plies: vector.sequence.length,
    externalPonsScore: vector.oracleScore,
    expectedP0Wdl,
    isoMaxP0Wdl: solved.value,
    matched,
    elapsedMs,
    nodes: solved.metrics.nodes ?? null,
  });
}

const report = {
  schema: 'connect4-external-pons-parent-wdl-v1',
  evidenceClass: 'REFERENCE-GROUNDED',
  solver: 'IsoMax',
  sourceRevision: process.env.C4_SOURCE_REVISION ?? process.env.GITHUB_SHA ?? null,
  externalReference: {
    ...external,
    sha256: externalSha256,
    gitBlobShaFromFrozenMetadata: corpus.provenance.gitBlobShaBySet[sourceSet] ?? null,
    rowsVerifiedAgainstExternal: vectors.length,
  },
  comparison: {
    sourceSet,
    group,
    positionCount: vectors.length,
    interpretation: 'Pons exact score is side-to-move relative; compared to IsoMax P0-relative W/D/L after parity/sign conversion',
    mismatchCount,
    matchedCount: vectors.length - mismatchCount,
    totalNodes,
    elapsedMs: performance.now() - started,
  },
  runtime: {
    node: process.version,
    v8: process.versions.v8,
    platform: process.platform,
    arch: process.arch,
  },
  cases,
};

const output = process.argv[2] ?? 'pons-isomax-l2-result.json';
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  schema: report.schema,
  evidenceClass: report.evidenceClass,
  sourceRevision: report.sourceRevision,
  sourceSet,
  positionCount: vectors.length,
  matchedCount: report.comparison.matchedCount,
  mismatchCount,
  totalNodes,
  elapsedMs: report.comparison.elapsedMs,
  externalSha256,
  output,
}));
if (mismatchCount !== 0) process.exitCode = 1;
