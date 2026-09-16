import assert from 'node:assert/strict';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { compileDeviceProgram, openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import { coverageMultiwordCoreAbsorptionExperimentalDeviceProgram } from './absorption-multiword-program.mjs';

const U32_BYTES = 4;
const native = process.argv.includes('native');
const here = dirname(fileURLToPath(import.meta.url));
const authorityPath = join(here, 'qualify-multiword-universal.mjs');
const generatedPath = join(here, '.generated-multiword-absorption-device-authority.mjs');

let source = await readFile(authorityPath, 'utf8');
if (!/\nrun\(\);\s*$/.test(source)) throw new Error('multiword authority entry point changed');
source = source.replace(/\nrun\(\);\s*$/, `
export {
  createWinningLines, createSupports, setBits32, subset32,
  cofactorFrontier, terminalRecord, normalizeFrontier, normalizeRecord, exactIntersect,
  localDictionary, wordCountFor, coverageOf,
};
`);
await writeFile(generatedPath, source, 'utf8');
let authority;
try { authority = await import(`${pathToFileURL(generatedPath).href}?t=${Date.now()}`); }
finally { await unlink(generatedPath).catch(() => {}); }

const {
  createWinningLines, createSupports, setBits32, subset32,
  cofactorFrontier, terminalRecord, normalizeFrontier, normalizeRecord, exactIntersect,
  localDictionary, wordCountFor, coverageOf,
} = authority;

function subsetWords(left, right) { return left.every((value, index) => ((value & ~right[index]) >>> 0) === 0); }
function orWords(left, right) { return left.map((value, index) => (value | right[index]) >>> 0); }
function andWords(left, right) { return left.map((value, index) => (value & right[index]) >>> 0); }
function coreWords(frontier) {
  assert(frontier.length > 0);
  let core = frontier[0].slice();
  for (let index = 1; index < frontier.length; index += 1) core = andWords(core, frontier[index]);
  return core;
}
function cpuMarks(left, right) {
  const coreA = coreWords(left);
  const coreB = coreWords(right);
  const leftAbsorbed = new Uint32Array(left.length);
  const rightAbsorbed = new Uint32Array(right.length);
  for (let i = 0; i < left.length; i += 1) {
    for (let j = 0; j < right.length; j += 1) {
      if (leftAbsorbed[i] === 0 && subsetWords(right[j], orWords(left[i], coreB))) leftAbsorbed[i] = 1;
      if (rightAbsorbed[j] === 0 && subsetWords(left[i], orWords(right[j], coreA))) rightAbsorbed[j] = 1;
    }
  }
  return { coreA, coreB, leftAbsorbed, rightAbsorbed };
}

function createFixture() {
  const columns = 6, rows = 5, connect = 4, cells = columns * rows;
  const winningLines = createWinningLines(columns, rows, connect);
  const incidence = Array.from({ length: cells }, () => []);
  for (const line of winningLines) for (const cell of setBits32(line)) incidence[cell].push(line);
  const supports = createSupports(columns, rows, 27);
  const supportByKey = new Map(supports.map((support, index) => [support.key, index]));
  const byRank = Array.from({ length: cells + 1 }, () => []);
  supports.forEach((support, index) => byRank[support.rank].push(index));
  const frontiers = new Array(supports.length);
  const segments = [];

  function capture(leftClause, rightClause, support, column) {
    const dictionary = localDictionary(winningLines, support);
    const wordCount = wordCountFor(dictionary.length);
    if (wordCount < 3) return;
    const left = leftClause.map((record) => coverageOf(record, dictionary, wordCount));
    const right = rightClause.map((record) => coverageOf(record, dictionary, wordCount));
    const expected = cpuMarks(left, right);
    segments.push({
      id: `multiword-absorption-${segments.length}`,
      supportHeights: support.heights.slice(), column,
      dictionarySize: dictionary.length, wordCount, left, right, expected,
    });
  }

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
          const blocker = normalizeRecord(terminalRequirements);
          if (blocker === null) {
            if (mover === 0) winner1 = []; else winner0 = [];
          } else if (mover === 0) winner1 = exactIntersect(winner1, [blocker]);
          else winner0 = exactIntersect(winner0, [blocker]);
        }

        if (aggregate0 === null) {
          aggregate0 = winner0; aggregate1 = winner1;
        } else if (mover === 0) {
          aggregate0 = normalizeFrontier([...aggregate0, ...winner0]);
          aggregate1 = exactIntersect(aggregate1, winner1);
        } else {
          if (rank === 27 && aggregate0.length !== 0 && winner0.length !== 0) capture(aggregate0, winner0, support, column);
          aggregate0 = exactIntersect(aggregate0, winner0);
          aggregate1 = normalizeFrontier([...aggregate1, ...winner1]);
        }
      }
      frontiers[supportIndex] = { winner0: aggregate0 ?? [], winner1: aggregate1 ?? [] };
    }
  }

  assert(segments.length > 0);
  const wordCount = Math.max(...segments.map((segment) => segment.wordCount));
  assert.equal(wordCount, 3);
  assert(segments.every((segment) => segment.wordCount === wordCount));
  return { geometry: { columns, rows, connect }, segments, wordCount };
}

const fixture = createFixture();
const segmentCount = fixture.segments.length;
const totalLeft = fixture.segments.reduce((sum, segment) => sum + segment.left.length, 0);
const totalRight = fixture.segments.reduce((sum, segment) => sum + segment.right.length, 0);
const leftWordsHost = new Uint32Array(totalLeft * fixture.wordCount);
const rightWordsHost = new Uint32Array(totalRight * fixture.wordCount);
const leftOffsetsHost = new Uint32Array(segmentCount + 1);
const rightOffsetsHost = new Uint32Array(segmentCount + 1);
const expectedLeft = new Uint32Array(totalLeft);
const expectedRight = new Uint32Array(totalRight);
const expectedCoreA = new Uint32Array(segmentCount * fixture.wordCount);
const expectedCoreB = new Uint32Array(segmentCount * fixture.wordCount);
let leftCursor = 0, rightCursor = 0, rawPairs = 0, remainingPairs = 0;
for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
  const segment = fixture.segments[segmentIndex];
  leftOffsetsHost[segmentIndex] = leftCursor;
  rightOffsetsHost[segmentIndex] = rightCursor;
  for (let word = 0; word < fixture.wordCount; word += 1) {
    expectedCoreA[segmentIndex * fixture.wordCount + word] = segment.expected.coreA[word];
    expectedCoreB[segmentIndex * fixture.wordCount + word] = segment.expected.coreB[word];
  }
  for (let i = 0; i < segment.left.length; i += 1) {
    for (let word = 0; word < fixture.wordCount; word += 1) leftWordsHost[leftCursor * fixture.wordCount + word] = segment.left[i][word];
    expectedLeft[leftCursor] = segment.expected.leftAbsorbed[i];
    leftCursor += 1;
  }
  for (let j = 0; j < segment.right.length; j += 1) {
    for (let word = 0; word < fixture.wordCount; word += 1) rightWordsHost[rightCursor * fixture.wordCount + word] = segment.right[j][word];
    expectedRight[rightCursor] = segment.expected.rightAbsorbed[j];
    rightCursor += 1;
  }
  rawPairs += segment.left.length * segment.right.length;
  const liveLeft = segment.expected.leftAbsorbed.reduce((sum, value) => sum + (value === 0 ? 1 : 0), 0);
  const liveRight = segment.expected.rightAbsorbed.reduce((sum, value) => sum + (value === 0 ? 1 : 0), 0);
  remainingPairs += liveLeft * liveRight;
}
leftOffsetsHost[segmentCount] = leftCursor;
rightOffsetsHost[segmentCount] = rightCursor;
assert.equal(leftCursor, totalLeft);
assert.equal(rightCursor, totalRight);

function bytes(values) { return new Uint8Array(values.buffer, values.byteOffset, values.byteLength); }
async function allocate(runtime, count, access = 'read-write') {
  const memory = await runtime.allocateDevice({ byteLength: count * U32_BYTES });
  const view = await memory.view({ dtype: 'u32', elementCount: count, access });
  return { memory, view, count };
}
async function from(runtime, values, allocations) {
  const allocation = await allocate(runtime, values.length, 'read');
  allocations.push(allocation); await allocation.memory.write(bytes(values)); return allocation;
}
async function output(runtime, count, allocations) { const allocation = await allocate(runtime, count); allocations.push(allocation); return allocation; }
async function readWords(allocation) {
  const result = await allocation.memory.read({ byteLength: allocation.count * U32_BYTES });
  return new Uint32Array(result.bytes.buffer, result.bytes.byteOffset, allocation.count);
}
async function closeAllocation(allocation) { await allocation.view.close(); await allocation.memory.close(); }
function binding(name) { return Object.freeze({ binding: name }); }

const runtime = await (native ? openCudaRuntime : openCudaRuntimeForTesting)({ compiler: true });
const allocations = [];
let module, fn, prepared;
try {
  const compiled = await compileDeviceProgram(runtime, coverageMultiwordCoreAbsorptionExperimentalDeviceProgram);
  const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
  assert(artifact && (artifact.format === 'ptx' || artifact.format === 'cubin'));
  module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });
  const entry = compiled.deviceProgram.kernels.find((kernel) => kernel.name === 'markCoreRelativeAbsorptionMultiword');
  assert(entry);
  fn = await module.getFunction({ name: entry.functionName, parameters: entry.parameters });

  const leftWords = await from(runtime, leftWordsHost, allocations);
  const rightWords = await from(runtime, rightWordsHost, allocations);
  const leftOffsets = await from(runtime, leftOffsetsHost, allocations);
  const rightOffsets = await from(runtime, rightOffsetsHost, allocations);
  const leftAbsorbed = await output(runtime, totalLeft, allocations);
  const rightAbsorbed = await output(runtime, totalRight, allocations);
  const coreA = await output(runtime, segmentCount * fixture.wordCount, allocations);
  const coreB = await output(runtime, segmentCount * fixture.wordCount, allocations);
  const status = await output(runtime, segmentCount, allocations);

  prepared = await runtime.prepareOperationDag({ nodes: [{
    id: 'mark-multiword-core-relative-absorption', function: fn,
    grid: { x: segmentCount, y: 1, z: 1 }, block: { x: 256, y: 1, z: 1 },
    arguments: [
      binding('leftWords'), binding('rightWords'), binding('leftOffsets'), binding('rightOffsets'),
      binding('leftAbsorbed'), binding('rightAbsorbed'), binding('coreA'), binding('coreB'), binding('status'),
      totalLeft, totalRight, segmentCount, fixture.wordCount,
    ],
    accesses: [
      { argumentIndex: 0, byteOffset: 0, byteLength: leftWordsHost.length * U32_BYTES, mode: 'read' },
      { argumentIndex: 1, byteOffset: 0, byteLength: rightWordsHost.length * U32_BYTES, mode: 'read' },
      { argumentIndex: 2, byteOffset: 0, byteLength: leftOffsetsHost.length * U32_BYTES, mode: 'read' },
      { argumentIndex: 3, byteOffset: 0, byteLength: rightOffsetsHost.length * U32_BYTES, mode: 'read' },
      { argumentIndex: 4, byteOffset: 0, byteLength: totalLeft * U32_BYTES, mode: 'write' },
      { argumentIndex: 5, byteOffset: 0, byteLength: totalRight * U32_BYTES, mode: 'write' },
      { argumentIndex: 6, byteOffset: 0, byteLength: segmentCount * fixture.wordCount * U32_BYTES, mode: 'write' },
      { argumentIndex: 7, byteOffset: 0, byteLength: segmentCount * fixture.wordCount * U32_BYTES, mode: 'write' },
      { argumentIndex: 8, byteOffset: 0, byteLength: segmentCount * U32_BYTES, mode: 'write' },
    ],
  }] });

  const operation = await prepared.submit({ bindings: {
    leftWords: leftWords.view, rightWords: rightWords.view,
    leftOffsets: leftOffsets.view, rightOffsets: rightOffsets.view,
    leftAbsorbed: leftAbsorbed.view, rightAbsorbed: rightAbsorbed.view,
    coreA: coreA.view, coreB: coreB.view, status: status.view,
  } });
  const terminal = await operation.wait();
  assert.equal(terminal.status, 'completed');
  await operation.close();

  if (native) {
    assert.deepEqual([...await readWords(leftAbsorbed)], [...expectedLeft]);
    assert.deepEqual([...await readWords(rightAbsorbed)], [...expectedRight]);
    assert.deepEqual([...await readWords(coreA)], [...expectedCoreA]);
    assert.deepEqual([...await readWords(coreB)], [...expectedCoreB]);
    assert.deepEqual([...await readWords(status)], new Array(segmentCount).fill(0));
  }

  console.log(JSON.stringify({
    schemaVersion: 1,
    kind: 'connect4-bsfp-multiword-core-absorption-device-qualification',
    mode: native ? 'native' : 'portable',
    outcome: native ? 'native-exact-pass' : 'portable-compile-prepare-submit-pass',
    fixtureKind: 'real-6x5-rank27-three-word-universal-merges',
    geometry: fixture.geometry,
    segments: segmentCount,
    wordCount: fixture.wordCount,
    maximumDictionary: Math.max(...fixture.segments.map((segment) => segment.dictionarySize)),
    totalLeftRecords: totalLeft,
    totalRightRecords: totalRight,
    rawPairs,
    remainingPairs,
    pairEliminationRate: rawPairs === 0 ? 0 : 1 - remainingPairs / rawPairs,
    cpuAuthorityPrepared: true,
    nativeDeviceEqualityChecked: native,
  }, null, 2));
} finally {
  if (prepared) await prepared.close();
  if (fn) await fn.close();
  if (module) await module.close();
  for (let index = allocations.length - 1; index >= 0; index -= 1) await closeAllocation(allocations[index]);
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
}
