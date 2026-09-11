import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';
import { solveBsfpOwnershipAntichainWdl } from '../../../components/bsfp/ownership-antichain-solver.mjs';

const SOURCE_URL = new URL('./separator-history-classes.mjs', import.meta.url);
const TEMP_URL = new URL('./.separator-history-internals.tmp.mjs', import.meta.url);
const DP_STATE_CAP = 250_000;

function loadInternalSource() {
  let source = readFileSync(SOURCE_URL, 'utf8');
  const marker = '\nconst results = [];\nfor (const config of CASES) results.push(analyzeCase(config));\n\nconsole.log(';
  const first = source.indexOf(marker);
  const last = source.lastIndexOf(marker);
  if (first < 0 || first !== last) throw new Error('separator internals adapter lost its unique execution seam');
  source = source.slice(0, first) + `\nexport {\n  CapacityError,\n  CASES,\n  classifyCut,\n  cofactorPair,\n  cofactorPartition,\n  evaluatePair,\n  findDistinguishingAssignment,\n  geometryName,\n  historyBits,\n  maskHex,\n  occupiedCellsForSupport,\n  optimizeLineOrder,\n  pairKey,\n  chooseSupports,\n};\n`;
  return source;
}

const tempPath = fileURLToPath(TEMP_URL);
let internals;
try {
  writeFileSync(tempPath, loadInternalSource(), 'utf8');
  internals = await import(`${pathToFileURL(tempPath).href}?r2-processed-line-accumulator=1`);
} finally {
  rmSync(tempPath, { force: true });
}

const {
  CapacityError,
  CASES,
  classifyCut,
  cofactorPair,
  cofactorPartition,
  evaluatePair,
  findDistinguishingAssignment,
  geometryName,
  historyBits,
  maskHex,
  occupiedCellsForSupport,
  optimizeLineOrder,
  pairKey,
  chooseSupports,
} = internals;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countKey(pair, countCode) {
  return `${pairKey(pair)}|C:${countCode.toString(16)}`;
}

function buildProcessedLineMetadata(lines, order, cut, partition) {
  const positionsByCell = Array.from({ length: Math.max(...lines.flat()) + 1 }, () => []);
  const forgottenCountsByPosition = new Uint8Array(cut);
  const forgotten = new Set(partition.left);

  for (let position = 0; position < cut; position += 1) {
    const line = lines[order[position]];
    for (const cell of line) {
      positionsByCell[cell].push(position);
      if (forgotten.has(cell)) forgottenCountsByPosition[position] += 1;
    }
  }

  for (const cell of partition.left) {
    assert(positionsByCell[cell].length > 0, `forgotten cell ${cell} had no processed-line incidence`);
  }

  let relevantProcessedLines = 0;
  for (const count of forgottenCountsByPosition) if (count > 0) relevantProcessedLines += 1;
  return Object.freeze({ positionsByCell, forgottenCountsByPosition, relevantProcessedLines });
}

function addP0Counts(code, positions) {
  let next = code;
  for (const position of positions) next += 1n << BigInt(position * 3);
  return next;
}

function buildCountStates(initialPair, leftCells, metadata, label) {
  let states = new Map([[countKey(initialPair, 0n), Object.freeze({
    pair: initialPair,
    countCode: 0n,
    weight: 1n,
    witnessMask: 0n,
  })]]);
  let maximumStates = states.size;

  for (const cell of leftCells) {
    const bit = 1n << BigInt(cell);
    const positions = metadata.positionsByCell[cell];
    const next = new Map();
    for (const state of states.values()) {
      for (const value of [0, 1]) {
        const pair = cofactorPair(state.pair, cell, value === 1);
        const countCode = value === 1 ? addP0Counts(state.countCode, positions) : state.countCode;
        const key = countKey(pair, countCode);
        const prior = next.get(key);
        if (prior) {
          next.set(key, Object.freeze({
            pair: prior.pair,
            countCode: prior.countCode,
            weight: prior.weight + state.weight,
            witnessMask: prior.witnessMask,
          }));
        } else {
          next.set(key, Object.freeze({
            pair,
            countCode,
            weight: state.weight,
            witnessMask: state.witnessMask | (value ? bit : 0n),
          }));
        }
      }
    }
    if (next.size > DP_STATE_CAP) throw new CapacityError(`${label} exceeded ${DP_STATE_CAP} pair+line-count states at cell ${cell}`);
    states = next;
    maximumStates = Math.max(maximumStates, states.size);
  }

  let weight = 0n;
  for (const state of states.values()) weight += state.weight;
  assert(weight === (1n << BigInt(leftCells.length)), `${label} lost forgotten assignments`);
  return Object.freeze({ states, maximumStates });
}

function hitSignature(countCode, metadata) {
  let p0Hit = 0n;
  let p1Hit = 0n;
  for (let position = 0; position < metadata.forgottenCountsByPosition.length; position += 1) {
    const total = metadata.forgottenCountsByPosition[position];
    if (total === 0) continue;
    const count = Number((countCode >> BigInt(position * 3)) & 7n);
    assert(count <= total, `processed-line P0 count ${count} exceeded forgotten occupancy ${total}`);
    const bit = 1n << BigInt(position);
    if (count > 0) p0Hit |= bit;
    if (count < total) p1Hit |= bit;
  }
  return `${p0Hit.toString(16)}:${p1Hit.toString(16)}`;
}

function countSignature(state) {
  return state.countCode.toString(16);
}

function inspectCandidate(states, signatureOf) {
  const groups = new Map();
  const exactClasses = new Set();
  let mismatch = null;

  for (const state of states.values()) {
    const exact = pairKey(state.pair);
    const signature = signatureOf(state);
    exactClasses.add(exact);
    const prior = groups.get(signature);
    if (!prior) {
      groups.set(signature, Object.freeze({ exact, state }));
    } else if (!mismatch && prior.exact !== exact) {
      mismatch = Object.freeze({ signature, left: prior.state, right: state });
    }
  }

  return Object.freeze({
    signatureCount: groups.size,
    exactClassCount: exactClasses.size,
    mismatch,
  });
}

function serializeMismatch({ candidate, spec, heights, supportIndex, cut, partition, xState, frontier, mismatch }) {
  const distinction = findDistinguishingAssignment(mismatch.left.pair, mismatch.right.pair, partition.right);
  assert(distinction, `${candidate} mismatch lacked a residual W/D/L distinction`);
  const p0A = xState.witnessMask | mismatch.left.witnessMask | distinction.p0Mask;
  const p0B = xState.witnessMask | mismatch.right.witnessMask | distinction.p0Mask;
  const wdlA = evaluatePair(frontier, p0A);
  const wdlB = evaluatePair(frontier, p0B);
  assert(wdlA !== wdlB, `${candidate} witness failed to change exact W/D/L`);

  return Object.freeze({
    candidate,
    geometry: geometryName(spec),
    supportIndex,
    rank: heights.reduce((sum, height) => sum + height, 0),
    heights: [...heights],
    cut,
    leftWidth: partition.left.length,
    crossingWidth: partition.crossing.length,
    rightWidth: partition.right.length,
    crossingP0Mask: maskHex(xState.witnessMask),
    candidateSignature: mismatch.signature,
    forgottenP0MaskA: maskHex(mismatch.left.witnessMask),
    forgottenP0MaskB: maskHex(mismatch.right.witnessMask),
    suffixP0Mask: maskHex(distinction.p0Mask),
    completeP0MaskA: maskHex(p0A),
    completeP0MaskB: maskHex(p0B),
    wdlA,
    wdlB,
  });
}

function analyzeCase(config, active) {
  const spec = Object.freeze({ columns: config.columns, rows: config.rows, connect: config.connect });
  const started = performance.now();
  const lines = createConnectWinningLines(spec);
  const orderData = optimizeLineOrder(spec, lines);
  const solution = solveBsfpOwnershipAntichainWdl(spec);
  const selectedSupports = chooseSupports(spec, solution, config.selection);

  let supportsVisited = 0;
  let cutsVisited = 0;
  let canonicalXStatesVisited = 0;
  let capacityCuts = 0;
  let maxObservedDpStates = 0;
  let maxRelevantProcessedLines = 0;
  let maxExactHistoryClasses = 1;
  let maxHitSignatures = 1;
  let maxCountSignatures = 1;
  let firstHitMismatch = null;
  let firstCountMismatch = null;

  caseLoop:
  for (const supportIndex of selectedSupports) {
    supportsVisited += 1;
    const heights = solution.support.decodeHeights(supportIndex);
    const frontier = solution.frontierAt(supportIndex);
    const occupiedCells = occupiedCellsForSupport(heights, spec.columns);

    for (let cut = 1; cut < orderData.order.length; cut += 1) {
      const partition = classifyCut(occupiedCells, orderData.score.first, orderData.score.last, cut);
      if (partition.left.length === 0 || partition.right.length === 0) continue;
      cutsVisited += 1;
      for (const cell of partition.left) {
        assert(orderData.score.last[cell] < cut, `forgotten cell ${cell} still had unprocessed incidence at cut ${cut}`);
      }
      const metadata = buildProcessedLineMetadata(lines, orderData.order, cut, partition);
      maxRelevantProcessedLines = Math.max(maxRelevantProcessedLines, metadata.relevantProcessedLines);

      let xStates;
      try {
        xStates = cofactorPartition(frontier, partition.crossing, `${geometryName(spec)}/support-${supportIndex}/cut-${cut}/R2-X`);
      } catch (error) {
        if (!(error instanceof CapacityError)) throw error;
        capacityCuts += 1;
        continue;
      }

      for (const xState of xStates.values()) {
        canonicalXStatesVisited += 1;
        let built;
        try {
          built = buildCountStates(
            xState.pair,
            partition.left,
            metadata,
            `${geometryName(spec)}/support-${supportIndex}/cut-${cut}/R2-L`,
          );
        } catch (error) {
          if (!(error instanceof CapacityError)) throw error;
          capacityCuts += 1;
          continue;
        }
        maxObservedDpStates = Math.max(maxObservedDpStates, built.maximumStates);

        const countResult = inspectCandidate(built.states, countSignature);
        const hitResult = inspectCandidate(built.states, (state) => hitSignature(state.countCode, metadata));
        assert(countResult.exactClassCount === hitResult.exactClassCount, 'candidate projections disagreed on exact residual-class count');
        maxExactHistoryClasses = Math.max(maxExactHistoryClasses, countResult.exactClassCount);
        maxHitSignatures = Math.max(maxHitSignatures, hitResult.signatureCount);
        maxCountSignatures = Math.max(maxCountSignatures, countResult.signatureCount);

        if (active.hit && !firstHitMismatch && hitResult.mismatch) {
          firstHitMismatch = serializeMismatch({
            candidate: 'processed-line-viability-hit-masks', spec, heights, supportIndex, cut, partition, xState, frontier,
            mismatch: hitResult.mismatch,
          });
        }
        if (active.count && !firstCountMismatch && countResult.mismatch) {
          firstCountMismatch = serializeMismatch({
            candidate: 'processed-line-p0-count-vector', spec, heights, supportIndex, cut, partition, xState, frontier,
            mismatch: countResult.mismatch,
          });
        }

        if ((!active.hit || firstHitMismatch) && (!active.count || firstCountMismatch)) break caseLoop;
      }
    }
  }

  return Object.freeze({
    geometry: geometryName(spec),
    selection: config.selection,
    selectedSupportCount: selectedSupports.length,
    supportsVisited,
    cutsVisited,
    canonicalXStatesVisited,
    capacityCuts,
    structuralMaximumCrossingWidth: orderData.score.maximum,
    maxRelevantProcessedLines,
    hitMaskRawBitsUpperBound: maxRelevantProcessedLines * 2,
    p0CountRawBitsUpperBound: maxRelevantProcessedLines * 3,
    maxObservedDpStates,
    maxExactHistoryClasses,
    maxExactHistoryBits: historyBits(maxExactHistoryClasses),
    maxHitSignatures,
    maxHitSignatureBits: historyBits(maxHitSignatures),
    maxCountSignatures,
    maxCountSignatureBits: historyBits(maxCountSignatures),
    firstHitMismatch,
    firstCountMismatch,
    elapsedMs: performance.now() - started,
  });
}

const cases = [];
let firstHitMismatch = null;
let firstCountMismatch = null;
let totalCapacityCuts = 0;

for (const config of CASES) {
  const result = analyzeCase(config, Object.freeze({ hit: !firstHitMismatch, count: !firstCountMismatch }));
  cases.push(result);
  totalCapacityCuts += result.capacityCuts;
  if (!firstHitMismatch && result.firstHitMismatch) firstHitMismatch = result.firstHitMismatch;
  if (!firstCountMismatch && result.firstCountMismatch) firstCountMismatch = result.firstCountMismatch;
  if (firstHitMismatch && firstCountMismatch) break;
}

const statusFor = (mismatch) => mismatch ? 'rejected' : totalCapacityCuts > 0 ? 'bounded-not-rejected' : 'not-rejected-on-tested-controls';

console.log(JSON.stringify({
  kind: 'connect4-bsfp-r2-processed-line-accumulator-falsifier',
  status: 'pass',
  claim: 'research-only exact C1 residual-function accumulator test; no CUDA or 7x6 solve claim',
  oracle: 'canonical C1 Win/Loss residual-function pair after fixing crossing and forgotten ownership',
  candidates: {
    processedLineViabilityHitMasks: {
      semantics: 'for every processed winning line touched by forgotten cells, record whether forgotten P0 and P1 ownership touches the line',
      status: statusFor(firstHitMismatch),
      firstMismatch: firstHitMismatch,
    },
    processedLineP0CountVector: {
      semantics: 'for every processed winning line touched by forgotten cells, record the exact number of forgotten cells owned by P0; support fixes total forgotten occupancy, so P1 count is implied',
      status: statusFor(firstCountMismatch),
      firstMismatch: firstCountMismatch,
    },
  },
  dpStateCap: DP_STATE_CAP,
  totalCapacityCuts,
  cases,
}, null, 2));
