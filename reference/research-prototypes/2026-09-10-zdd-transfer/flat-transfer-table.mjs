import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SOURCE_URL = new URL('./residual-class-transition.mjs', import.meta.url);
const TEMP_URL = new URL('./.residual-flat-internals.tmp.mjs', import.meta.url);

function loadInternalSource() {
  let source = readFileSync(SOURCE_URL, 'utf8');
  const marker = '\nconst results = CASES.map(analyzeCase);\nconst failures = results.filter((entry) => entry.transitionClosure !== \'pass\');\n';
  const first = source.indexOf(marker);
  const last = source.lastIndexOf(marker);
  if (first < 0 || first !== last) throw new Error('flat transfer adapter lost its unique R3 execution seam');
  source = source.slice(0, first) + `\nexport {\n  CASES,\n  CapacityError,\n  createConnectWinningLines,\n  solveBsfpOwnershipAntichainWdl,\n  buildLayer,\n  cellsMask,\n  classifyCut,\n  enumerateAssignments,\n  geometryName,\n  occupiedCellsForSupport,\n  optimizeLineOrder,\n  pairKey,\n  restrictPair,\n  setEquals,\n  transitionLayer,\n};\n`;
  return source;
}

const tempPath = fileURLToPath(TEMP_URL);
let internals;
try {
  writeFileSync(tempPath, loadInternalSource(), 'utf8');
  internals = await import(`${pathToFileURL(tempPath).href}?flat-transfer-r4=1`);
} finally {
  rmSync(tempPath, { force: true });
}

const {
  CASES,
  CapacityError,
  createConnectWinningLines,
  solveBsfpOwnershipAntichainWdl,
  buildLayer,
  cellsMask,
  classifyCut,
  enumerateAssignments,
  geometryName,
  occupiedCellsForSupport,
  optimizeLineOrder,
  pairKey,
  restrictPair,
  setEquals,
  transitionLayer,
} = internals;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function semanticStateKey(xMask, residualKey) {
  return `${xMask.toString(16)}|${residualKey}`;
}

function elementWidthForMaximum(maximumValue) {
  if (maximumValue <= 0xff) return 1;
  if (maximumValue <= 0xffff) return 2;
  return 4;
}

function unsignedArrayForWidth(width, length) {
  if (width === 1) return new Uint8Array(length);
  if (width === 2) return new Uint16Array(length);
  if (width === 4) return new Uint32Array(length);
  throw new Error(`unsupported unsigned element width ${width}`);
}

function compileDenseLayer(layer) {
  const crossingCells = layer.partition.crossing;
  const xAssignments = enumerateAssignments(crossingCells);
  const denseLookup = new Int32Array(layer.flatSlots);
  denseLookup.fill(-1);

  const states = [];
  const semanticToDense = new Map();
  const semanticKeyByDense = [];
  const packedKeyByDense = new Uint32Array(layer.stateCount);
  const xStride = 2 ** crossingCells.length;
  let denseId = 0;

  for (let xIndex = 0; xIndex < xAssignments.length; xIndex += 1) {
    const xMask = xAssignments[xIndex];
    const classes = layer.byX.get(xMask);
    assert(classes, `missing semantic class bucket for x=${xMask.toString(16)}`);
    const ordered = [...classes.entries()].sort(([left], [right]) => left.localeCompare(right));
    assert(ordered.length <= 2 ** layer.historyBits, 'history class count exceeded layer history-bit capacity');

    for (let historyIndex = 0; historyIndex < ordered.length; historyIndex += 1) {
      const [residualKey, state] = ordered[historyIndex];
      const packedKey = xIndex + historyIndex * xStride;
      assert(Number.isSafeInteger(packedKey) && packedKey >= 0 && packedKey < layer.flatSlots, 'packed key outside rectangular layer');
      assert(denseLookup[packedKey] === -1, 'duplicate packed key in dense layer');
      const semanticKey = semanticStateKey(xMask, residualKey);
      assert(!semanticToDense.has(semanticKey), 'duplicate semantic state key in dense layer');

      denseLookup[packedKey] = denseId;
      packedKeyByDense[denseId] = packedKey;
      semanticToDense.set(semanticKey, denseId);
      semanticKeyByDense[denseId] = semanticKey;
      states.push(Object.freeze({ xMask, pair: state.pair, residualKey }));
      denseId += 1;
    }
  }

  assert(denseId === layer.stateCount, `compiled ${denseId} states != semantic ${layer.stateCount}`);

  const sparseEntries = Array.from({ length: denseId }, (_, id) => Object.freeze({
    packedKey: packedKeyByDense[id],
    denseId: id,
  })).sort((left, right) => left.packedKey - right.packedKey);
  const sparseKeys = new Uint32Array(sparseEntries.length);
  const sparseIdWidth = elementWidthForMaximum(Math.max(0, denseId - 1));
  const sparseIds = unsignedArrayForWidth(sparseIdWidth, sparseEntries.length);
  for (let index = 0; index < sparseEntries.length; index += 1) {
    sparseKeys[index] = sparseEntries[index].packedKey;
    sparseIds[index] = sparseEntries[index].denseId;
  }

  return Object.freeze({
    semantic: layer,
    stateCount: denseId,
    states,
    semanticToDense,
    semanticKeyByDense,
    packedKeyByDense,
    denseLookup,
    sparseKeys,
    sparseIds,
    sparseIdWidth,
    denseLookupBytes: denseLookup.byteLength,
    sparseLookupBytes: sparseKeys.byteLength + sparseIds.byteLength,
  });
}

function introducedCellsForTransition({ occupiedCells, orderData, cut, oldLayer, nextLayer }) {
  const introduced = occupiedCells.filter((cell) => orderData.score.first[cell] === cut);
  const expected = new Set(oldLayer.semantic.partition.right.filter((cell) => !nextLayer.semantic.partition.right.includes(cell)));
  assert(setEquals(new Set(introduced), expected), `cut ${cut} introduced-cell identity mismatch`);
  return introduced;
}

function compileTransition({ spec, supportIndex, cut, orderData, occupiedCells, oldLayer, nextLayer }) {
  const oracle = transitionLayer({
    spec,
    supportIndex,
    cut,
    orderData,
    occupiedCells,
    oldLayer: oldLayer.semantic,
    nextLayer: nextLayer.semantic,
  });
  assert(!oracle.firstClosureMismatch, `${geometryName(spec)}/support-${supportIndex}/cut-${cut} R3 oracle closure mismatch`);

  const introduced = introducedCellsForTransition({ occupiedCells, orderData, cut, oldLayer, nextLayer });
  assert(introduced.length <= spec.connect, `introduced width ${introduced.length} exceeds connect ${spec.connect}`);
  const inputs = enumerateAssignments(introduced);
  const fanout = inputs.length;
  const rawTargets = new Uint32Array(oldLayer.stateCount * fanout);
  const nextCrossingMask = cellsMask(nextLayer.semantic.partition.crossing);
  const targetsReached = new Set();
  let firstSemanticMismatch = null;

  for (let oldDenseId = 0; oldDenseId < oldLayer.stateCount; oldDenseId += 1) {
    const state = oldLayer.states[oldDenseId];
    for (let inputIndex = 0; inputIndex < inputs.length; inputIndex += 1) {
      const inputMask = inputs[inputIndex];
      const nextPair = restrictPair(state.pair, introduced, inputMask);
      const residualKey = pairKey(nextPair);
      const nextXMask = (state.xMask & nextCrossingMask) | (inputMask & nextCrossingMask);
      const semanticKey = semanticStateKey(nextXMask, residualKey);
      const targetDenseId = nextLayer.semanticToDense.get(semanticKey);
      const outputIndex = oldDenseId * fanout + inputIndex;

      if (targetDenseId === undefined) {
        if (!firstSemanticMismatch) {
          firstSemanticMismatch = Object.freeze({
            supportIndex,
            cut,
            oldDenseId,
            inputIndex,
            nextXMask: nextXMask.toString(16),
            residualKey,
          });
        }
        rawTargets[outputIndex] = 0;
      } else {
        rawTargets[outputIndex] = targetDenseId;
        targetsReached.add(targetDenseId);
        assert(nextLayer.semanticKeyByDense[targetDenseId] === semanticKey, 'dense target semantic identity mismatch');
      }
    }
  }

  assert(rawTargets.length === oracle.transitions, `flat compiler transition count ${rawTargets.length} != R3 oracle ${oracle.transitions}`);
  const targetCoverage = nextLayer.stateCount === 0 ? 1 : targetsReached.size / nextLayer.stateCount;
  assert(Math.abs(targetCoverage - oracle.targetCoverage) < 1e-12, 'flat compiler target coverage differs from R3 oracle');

  return Object.freeze({
    supportIndex,
    cut,
    introducedWidth: introduced.length,
    fanout,
    sourceStateCount: oldLayer.stateCount,
    targetStateCount: nextLayer.stateCount,
    rawTargets,
    targetCoverage,
    firstSemanticMismatch,
  });
}

function chooseLookupProbe(current, candidate, context) {
  if (!current || candidate.semantic.flatSlots > current.flatSlots ||
      (candidate.semantic.flatSlots === current.flatSlots && candidate.stateCount > current.stateCount)) {
    return Object.freeze({
      context,
      flatSlots: candidate.semantic.flatSlots,
      stateCount: candidate.stateCount,
      denseLookup: candidate.denseLookup.slice(),
      sparseKeys: candidate.sparseKeys.slice(),
      sparseIds: candidate.sparseIds.slice(),
      denseLookupBytes: candidate.denseLookupBytes,
      sparseLookupBytes: candidate.sparseLookupBytes,
    });
  }
  return current;
}

function binarySearch(keys, values, key) {
  let low = 0;
  let high = keys.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const value = keys[middle];
    if (value === key) return values[middle];
    if (value < key) low = middle + 1;
    else high = middle - 1;
  }
  return -1;
}

function benchmarkLookupProbe(probe) {
  const targetQueries = 2_000_000;
  const repetitions = Math.max(1, Math.ceil(targetQueries / Math.max(1, probe.flatSlots)));
  let denseChecksum = 0;
  let sparseChecksum = 0;
  let queries = 0;

  let started = performance.now();
  for (let repetition = 0; repetition < repetitions; repetition += 1) {
    for (let key = 0; key < probe.flatSlots; key += 1) {
      denseChecksum = (denseChecksum + probe.denseLookup[key] + 1) >>> 0;
      queries += 1;
    }
  }
  const denseMs = performance.now() - started;

  started = performance.now();
  for (let repetition = 0; repetition < repetitions; repetition += 1) {
    for (let key = 0; key < probe.flatSlots; key += 1) {
      sparseChecksum = (sparseChecksum + binarySearch(probe.sparseKeys, probe.sparseIds, key) + 1) >>> 0;
    }
  }
  const sparseMs = performance.now() - started;
  assert(denseChecksum === sparseChecksum, 'dense and sparse lookup probes disagree');

  return Object.freeze({
    context: probe.context,
    flatSlots: probe.flatSlots,
    activeStates: probe.stateCount,
    occupancy: probe.stateCount / probe.flatSlots,
    denseLookupBytes: probe.denseLookupBytes,
    sparseLookupBytes: probe.sparseLookupBytes,
    memoryRatioDenseToSparse: probe.sparseLookupBytes === 0 ? 1 : probe.denseLookupBytes / probe.sparseLookupBytes,
    queries,
    denseMs,
    sparseMs,
    denseNsPerQuery: denseMs * 1e6 / queries,
    sparseNsPerQuery: sparseMs * 1e6 / queries,
    sparseToDenseTimeRatio: denseMs === 0 ? null : sparseMs / denseMs,
    checksum: denseChecksum,
  });
}

function flattenTables(tables) {
  let totalEntries = 0;
  let maximumTargetStateCount = 1;
  for (const table of tables) {
    totalEntries += table.rawTargets.length;
    maximumTargetStateCount = Math.max(maximumTargetStateCount, table.targetStateCount);
  }
  assert(totalEntries <= 0xffffffff, `flat target entry count ${totalEntries} exceeds Uint32 offsets`);

  const targetWidthBytes = elementWidthForMaximum(Math.max(0, maximumTargetStateCount - 1));
  const targets = unsignedArrayForWidth(targetWidthBytes, totalEntries);
  const offsets = new Uint32Array(tables.length + 1);
  const introducedWidths = new Uint8Array(tables.length);
  let cursor = 0;
  let serializationMismatches = 0;
  let firstSerializationMismatch = null;

  for (let tableIndex = 0; tableIndex < tables.length; tableIndex += 1) {
    const table = tables[tableIndex];
    offsets[tableIndex] = cursor;
    introducedWidths[tableIndex] = table.introducedWidth;
    targets.set(table.rawTargets, cursor);
    for (let index = 0; index < table.rawTargets.length; index += 1) {
      if (targets[cursor + index] !== table.rawTargets[index]) {
        serializationMismatches += 1;
        if (!firstSerializationMismatch) {
          firstSerializationMismatch = Object.freeze({ tableIndex, index, expected: table.rawTargets[index], actual: targets[cursor + index] });
        }
      }
    }
    cursor += table.rawTargets.length;
  }
  offsets[tables.length] = cursor;
  assert(cursor === totalEntries, 'flat target cursor mismatch');

  const runtimeBytes = targets.byteLength + offsets.byteLength + introducedWidths.byteLength;
  const u32RuntimeBytes = totalEntries * Uint32Array.BYTES_PER_ELEMENT + offsets.byteLength + introducedWidths.byteLength;
  return Object.freeze({
    targets,
    offsets,
    introducedWidths,
    targetWidthBytes,
    totalEntries,
    runtimeBytes,
    u32RuntimeBytes,
    bytesPerTransitionEntry: totalEntries === 0 ? 0 : runtimeBytes / totalEntries,
    targetBytesVsU32Ratio: totalEntries === 0 ? 1 : targets.byteLength / (totalEntries * Uint32Array.BYTES_PER_ELEMENT),
    serializationMismatches,
    firstSerializationMismatch,
  });
}

function benchmarkFlatTargets(artifact) {
  const targetReads = 20_000_000;
  const repetitions = Math.max(1, Math.ceil(targetReads / Math.max(1, artifact.targets.length)));
  let checksum = 0;
  let reads = 0;
  const started = performance.now();
  for (let repetition = 0; repetition < repetitions; repetition += 1) {
    for (let index = 0; index < artifact.targets.length; index += 1) {
      checksum = (checksum + artifact.targets[index] + 1) >>> 0;
      reads += 1;
    }
  }
  const elapsedMs = performance.now() - started;
  return Object.freeze({
    reads,
    elapsedMs,
    millionReadsPerSecond: elapsedMs === 0 ? null : reads / elapsedMs / 1000,
    checksum,
  });
}

function analyzeCase(config) {
  const spec = Object.freeze({ columns: config.columns, rows: config.rows, connect: config.connect });
  const started = performance.now();
  const lines = createConnectWinningLines(spec);
  const orderData = optimizeLineOrder(spec, lines);
  const solution = solveBsfpOwnershipAntichainWdl(spec);
  const supportIndices = config.selection === 'all'
    ? Array.from({ length: solution.support.itemCapacity }, (_, index) => index)
    : [...config.supports];

  const tables = [];
  let layersBuilt = 0;
  let supportsVisited = 0;
  let totalDenseStates = 0;
  let allDenseLookupBytesIfRetained = 0;
  let allSparseLookupBytesIfRetained = 0;
  let maxDenseStates = 0;
  let maxFlatSlots = 0;
  let maxIntroducedWidth = 0;
  let maxFanout = 0;
  let minTargetCoverage = 1;
  let firstSemanticMismatch = null;
  let capacityFailure = null;
  let lookupProbe = null;

  supportLoop:
  for (const supportIndex of supportIndices) {
    supportsVisited += 1;
    const heights = solution.support.decodeHeights(supportIndex);
    const occupiedCells = occupiedCellsForSupport(heights, spec.columns);
    let oldLayer = null;

    for (let cut = 0; cut <= lines.length; cut += 1) {
      const partition = classifyCut(occupiedCells, orderData.score.first, orderData.score.last, cut);
      let semanticLayer;
      try {
        semanticLayer = buildLayer({
          frontier: solution.frontierAt(supportIndex),
          partition,
          label: `${geometryName(spec)}/support-${supportIndex}/cut-${cut}/r4-layer`,
        });
      } catch (error) {
        if (!(error instanceof CapacityError) && !String(error?.message).includes('explicit assignment count')) throw error;
        capacityFailure = Object.freeze({ supportIndex, cut, message: String(error.message) });
        break supportLoop;
      }

      const layer = compileDenseLayer(semanticLayer);
      layersBuilt += 1;
      totalDenseStates += layer.stateCount;
      allDenseLookupBytesIfRetained += layer.denseLookupBytes;
      allSparseLookupBytesIfRetained += layer.sparseLookupBytes;
      maxDenseStates = Math.max(maxDenseStates, layer.stateCount);
      maxFlatSlots = Math.max(maxFlatSlots, semanticLayer.flatSlots);
      lookupProbe = chooseLookupProbe(lookupProbe, layer, Object.freeze({
        supportIndex,
        rank: solution.support.ranks[supportIndex],
        heights: [...heights],
        cut,
        crossingWidth: partition.crossing.length,
        historyBits: semanticLayer.historyBits,
      }));

      if (oldLayer) {
        const table = compileTransition({
          spec,
          supportIndex,
          cut: cut - 1,
          orderData,
          occupiedCells,
          oldLayer,
          nextLayer: layer,
        });
        tables.push(table);
        maxIntroducedWidth = Math.max(maxIntroducedWidth, table.introducedWidth);
        maxFanout = Math.max(maxFanout, table.fanout);
        minTargetCoverage = Math.min(minTargetCoverage, table.targetCoverage);
        if (!firstSemanticMismatch && table.firstSemanticMismatch) firstSemanticMismatch = table.firstSemanticMismatch;
      }
      oldLayer = layer;
    }
  }

  const artifact = flattenTables(tables);
  const lookup = lookupProbe ? benchmarkLookupProbe(lookupProbe) : null;
  const replay = benchmarkFlatTargets(artifact);
  const expectedTableCount = capacityFailure ? tables.length : supportsVisited * lines.length;
  assert(tables.length === expectedTableCount, `table count ${tables.length} != expected ${expectedTableCount}`);

  return Object.freeze({
    geometry: geometryName(spec),
    selection: config.selection,
    selectedSupportCount: supportIndices.length,
    supportsVisited,
    layersBuilt,
    capacityFailure,
    status: firstSemanticMismatch || artifact.serializationMismatches > 0 ? 'rejected' : capacityFailure ? 'bounded-not-rejected' : 'pass',
    firstSemanticMismatch,
    firstSerializationMismatch: artifact.firstSerializationMismatch,
    totalTables: tables.length,
    totalDenseStates,
    maxDenseStates,
    maxFlatSlots,
    maxIntroducedWidth,
    maxFanout,
    minTargetCoverage,
    flatArtifact: Object.freeze({
      layout: 'single contiguous target array + Uint32 table offsets + Uint8 introduced widths; target IDs are dense and layer-local',
      pointerFreeHotPath: true,
      targetWidthBytes: artifact.targetWidthBytes,
      totalTransitionEntries: artifact.totalEntries,
      targetBytes: artifact.targets.byteLength,
      offsetBytes: artifact.offsets.byteLength,
      introducedWidthBytes: artifact.introducedWidths.byteLength,
      runtimeBytes: artifact.runtimeBytes,
      u32RuntimeBytes: artifact.u32RuntimeBytes,
      bytesPerTransitionEntry: artifact.bytesPerTransitionEntry,
      targetBytesVsU32Ratio: artifact.targetBytesVsU32Ratio,
      serializationMismatches: artifact.serializationMismatches,
    }),
    optionalStateLookup: Object.freeze({
      allDenseLookupBytesIfRetained,
      allSparseLookupBytesIfRetained,
      denseToSparseMemoryRatio: allSparseLookupBytesIfRetained === 0 ? 1 : allDenseLookupBytesIfRetained / allSparseLookupBytesIfRetained,
      representativeWorstLayer: lookup,
      note: 'state lookup is not required in the line-to-line hot transfer loop; measured for boundary/build tradeoff only',
    }),
    cpuReplaySanity: replay,
    elapsedMs: performance.now() - started,
  });
}
const results = [];
for (const config of CASES) results.push(await analyzeCase(config));
const failures = results.filter((entry) => entry.status !== 'pass');

console.log(JSON.stringify({
  kind: 'connect4-bsfp-r4-flat-transfer-table-qualification',
  status: failures.length === 0 ? 'pass' : 'bounded-or-rejected',
  claim: 'research-only physical representation qualification of the R3 residual-class transfer quotient; no CUDA or 7x6 solve claim',
  semanticOracle: 'R3 independently rebuilt adjacent-cut residual classes and transitionLayer closure',
  runtimeShape: 'pointer-free flat typed arrays; stateId and input ordinal index a contiguous target table',
  results,
}, null, 2));
