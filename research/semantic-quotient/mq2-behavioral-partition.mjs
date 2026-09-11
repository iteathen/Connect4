import { createConnectWinningLines } from '../../components/bsfp/geometry.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function bytesForCardinality(count) {
  if (count <= 0x100) return 1;
  if (count <= 0x10000) return 2;
  return 4;
}

function createGeometry({ columns, rows, connect }) {
  const cellCount = columns * rows;
  assert(cellCount <= 20, 'MQ2 exhaustive harness is intentionally bounded to <=20 cells');

  const lines = createConnectWinningLines({ columns, rows, connect });
  assert(lines.length > 0 && lines.length < 31, 'u32 line-mask harness requires 1..30 winning lines');

  const lineCellMasks = new Uint32Array(lines.length);
  const lineBits = new Uint32Array(lines.length);
  const cellLineMasks = new Uint32Array(cellCount);
  const cellLineIds = Array.from({ length: cellCount }, () => []);

  for (let lineId = 0; lineId < lines.length; lineId += 1) {
    let cellMask = 0;
    for (const cell of lines[lineId]) {
      cellMask = (cellMask | (1 << cell)) >>> 0;
      cellLineMasks[cell] = (cellLineMasks[cell] | (1 << lineId)) >>> 0;
      cellLineIds[cell].push(lineId);
    }
    lineCellMasks[lineId] = cellMask;
    lineBits[lineId] = (1 << lineId) >>> 0;
  }

  const supportBase = rows + 1;
  const supportWeights = new Uint32Array(columns);
  let supportCapacity = 1;
  for (let column = 0; column < columns; column += 1) {
    supportWeights[column] = supportCapacity;
    supportCapacity *= supportBase;
  }

  const support = Array.from({ length: supportCapacity });
  for (let supportIndex = 0; supportIndex < supportCapacity; supportIndex += 1) {
    let encoded = supportIndex;
    let rank = 0;
    let occupiedMask = 0;
    const landings = [];

    for (let column = 0; column < columns; column += 1) {
      const height = encoded % supportBase;
      encoded = Math.floor(encoded / supportBase);
      rank += height;
      for (let row = 0; row < height; row += 1) {
        occupiedMask = (occupiedMask | (1 << (row * columns + column))) >>> 0;
      }
      if (height < rows) {
        landings.push(Object.freeze({
          column,
          cell: height * columns + column,
          nextSupportIndex: supportIndex + supportWeights[column],
        }));
      }
    }

    support[supportIndex] = Object.freeze({ rank, occupiedMask, landings: Object.freeze(landings) });
  }

  const cellMaskCapacity = 2 ** cellCount;
  const lineMaskCapacity = 2 ** lines.length;
  assert(Number.isSafeInteger(supportCapacity * cellMaskCapacity), 'physical key range exceeds safe integer');
  assert(Number.isSafeInteger(supportCapacity * lineMaskCapacity * lineMaskCapacity), 'quotient key range exceeds safe integer');

  const hitByCellSubset = new Uint32Array(cellMaskCapacity);
  for (let mask = 1; mask < cellMaskCapacity; mask += 1) {
    const lsb = mask & -mask;
    const cell = 31 - Math.clz32(lsb);
    hitByCellSubset[mask] = (hitByCellSubset[mask ^ lsb] | cellLineMasks[cell]) >>> 0;
  }

  function physicalKey(supportIndex, p0Ownership) {
    return supportIndex * cellMaskCapacity + p0Ownership;
  }

  function decodePhysicalKey(key) {
    const supportIndex = Math.floor(key / cellMaskCapacity);
    return { supportIndex, p0Ownership: key - supportIndex * cellMaskCapacity };
  }

  function quotientKey(supportIndex, p0HitMask, p1HitMask) {
    return supportIndex + supportCapacity * (p0HitMask + lineMaskCapacity * p1HitMask);
  }

  function terminalPhysical(landingCell, moverStoneMask) {
    for (const lineId of cellLineIds[landingCell]) {
      const lineMask = lineCellMasks[lineId];
      if ((moverStoneMask & lineMask) === lineMask) return true;
    }
    return false;
  }

  function terminalQuotient(nextOccupiedMask, landingCell, opponentHitMask) {
    for (const lineId of cellLineIds[landingCell]) {
      const lineMask = lineCellMasks[lineId];
      if ((opponentHitMask & lineBits[lineId]) !== 0) continue;
      if ((nextOccupiedMask & lineMask) === lineMask) return true;
    }
    return false;
  }

  return Object.freeze({
    columns,
    rows,
    connect,
    cellCount,
    lineCount: lines.length,
    supportCapacity,
    support,
    cellMaskCapacity,
    lineMaskCapacity,
    cellLineMasks,
    hitByCellSubset,
    physicalKey,
    decodePhysicalKey,
    quotientKey,
    terminalPhysical,
    terminalQuotient,
  });
}

function buildPhysicalGraph(g) {
  const ranks = Array.from({ length: g.cellCount + 1 }, () => new Map());
  ranks[0].set(g.physicalKey(0, 0), 0);
  let transitionEdges = 0;
  let terminalEdges = 0;

  for (let rank = 0; rank < g.cellCount; rank += 1) {
    const mover = rank & 1;
    const next = ranks[rank + 1];

    for (const key of ranks[rank].keys()) {
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const support = g.support[supportIndex];
      const p1Ownership = (support.occupiedMask ^ p0Ownership) >>> 0;
      const p0HitMask = g.hitByCellSubset[p0Ownership];
      const p1HitMask = g.hitByCellSubset[p1Ownership];

      for (const landing of support.landings) {
        transitionEdges += 1;
        const nextSupport = g.support[landing.nextSupportIndex];
        const landingBit = (1 << landing.cell) >>> 0;
        const nextP0Ownership = mover === 0 ? (p0Ownership | landingBit) >>> 0 : p0Ownership;
        const nextP1Ownership = (nextSupport.occupiedMask ^ nextP0Ownership) >>> 0;
        const moverStoneMask = mover === 0 ? nextP0Ownership : nextP1Ownership;
        const terminal = g.terminalPhysical(landing.cell, moverStoneMask);
        const quotientTerminal = g.terminalQuotient(
          nextSupport.occupiedMask,
          landing.cell,
          mover === 0 ? p1HitMask : p0HitMask,
        );
        assert(terminal === quotientTerminal, `terminal mismatch at rank ${rank}, support ${supportIndex}, column ${landing.column}`);
        if (terminal) {
          terminalEdges += 1;
          continue;
        }

        const nextP0HitFromOwnership = g.hitByCellSubset[nextP0Ownership];
        const nextP1HitFromOwnership = g.hitByCellSubset[nextP1Ownership];
        const nextP0HitByFormula = mover === 0 ? (p0HitMask | g.cellLineMasks[landing.cell]) >>> 0 : p0HitMask;
        const nextP1HitByFormula = mover === 1 ? (p1HitMask | g.cellLineMasks[landing.cell]) >>> 0 : p1HitMask;
        assert(
          nextP0HitFromOwnership === nextP0HitByFormula && nextP1HitFromOwnership === nextP1HitByFormula,
          `successor quotient mismatch at rank ${rank}, support ${supportIndex}, column ${landing.column}`,
        );

        const childKey = g.physicalKey(landing.nextSupportIndex, nextP0Ownership);
        if (!next.has(childKey)) next.set(childKey, 0);
      }
    }
  }

  return { ranks, transitionEdges, terminalEdges };
}

function describeState(g, key) {
  const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
  const support = g.support[supportIndex];
  const p1Ownership = (support.occupiedMask ^ p0Ownership) >>> 0;
  const p0HitMask = g.hitByCellSubset[p0Ownership];
  const p1HitMask = g.hitByCellSubset[p1Ownership];
  return {
    physicalKey: key,
    rank: support.rank,
    supportIndex,
    p0OwnershipHex: `0x${p0Ownership.toString(16)}`,
    p1OwnershipHex: `0x${p1Ownership.toString(16)}`,
    p0HitMaskHex: `0x${p0HitMask.toString(16)}`,
    p1HitMaskHex: `0x${p1HitMask.toString(16)}`,
    quotientKey: g.quotientKey(supportIndex, p0HitMask, p1HitMask),
  };
}

function minimizeBehavior(g, graph) {
  const signatureToClass = new Map();
  const classPhysicalCount = [];
  const classQCount = [];
  const classFirstRank = [];
  const classFirstSupport = [];
  const classFirstQKey = [];
  const classFirstPhysicalKey = [];
  const classCrossRank = [];
  const classCrossSupport = [];
  const qToClass = new Map();
  const terminalScores = new Set();
  const rankSummaries = [];

  let qBehaviorMismatches = 0;
  let firstLineClassMerge = null;

  function classForSignature(signature, rank, supportIndex, qKey, physicalKey) {
    let classId = signatureToClass.get(signature);
    if (classId === undefined) {
      classId = signatureToClass.size;
      signatureToClass.set(signature, classId);
      classPhysicalCount[classId] = 0;
      classQCount[classId] = 0;
      classFirstRank[classId] = rank;
      classFirstSupport[classId] = supportIndex;
      classFirstQKey[classId] = qKey;
      classFirstPhysicalKey[classId] = physicalKey;
      classCrossRank[classId] = false;
      classCrossSupport[classId] = false;
    } else {
      if (classFirstRank[classId] !== rank) classCrossRank[classId] = true;
      if (classFirstSupport[classId] !== supportIndex) classCrossSupport[classId] = true;
    }
    return classId;
  }

  for (let rank = g.cellCount; rank >= 0; rank -= 1) {
    const current = graph.ranks[rank];
    const childRank = rank < g.cellCount ? graph.ranks[rank + 1] : null;
    const rankQ = new Set();
    const rankBehavior = new Set();

    for (const key of current.keys()) {
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const support = g.support[supportIndex];
      const p1Ownership = (support.occupiedMask ^ p0Ownership) >>> 0;
      const p0HitMask = g.hitByCellSubset[p0Ownership];
      const p1HitMask = g.hitByCellSubset[p1Ownership];
      const qKey = g.quotientKey(supportIndex, p0HitMask, p1HitMask);
      rankQ.add(qKey);

      const tokens = Array(g.columns).fill('I');
      for (const landing of support.landings) {
        const nextSupport = g.support[landing.nextSupportIndex];
        const landingBit = (1 << landing.cell) >>> 0;
        const mover = rank & 1;
        const nextP0Ownership = mover === 0 ? (p0Ownership | landingBit) >>> 0 : p0Ownership;
        const nextP1Ownership = (nextSupport.occupiedMask ^ nextP0Ownership) >>> 0;
        const moverStoneMask = mover === 0 ? nextP0Ownership : nextP1Ownership;

        if (g.terminalPhysical(landing.cell, moverStoneMask)) {
          const terminalScore = Math.trunc((g.cellCount + 1 - rank) / 2);
          terminalScores.add(terminalScore);
          tokens[landing.column] = `T${terminalScore}`;
        } else {
          const childKey = g.physicalKey(landing.nextSupportIndex, nextP0Ownership);
          const childClass = childRank.get(childKey);
          assert(Number.isInteger(childClass), `missing child behavior class at rank ${rank}, column ${landing.column}`);
          tokens[landing.column] = `C${childClass}`;
        }
      }

      const signature = tokens.join('|');
      const classId = classForSignature(signature, rank, supportIndex, qKey, key);
      current.set(key, classId);
      rankBehavior.add(classId);
      classPhysicalCount[classId] += 1;

      const existingQClass = qToClass.get(qKey);
      if (existingQClass === undefined) {
        qToClass.set(qKey, classId);
        classQCount[classId] += 1;

        if (classFirstQKey[classId] !== qKey) {
          const candidate = {
            rank,
            behaviorClassId: classId,
            firstLineClass: describeState(g, classFirstPhysicalKey[classId]),
            mergedLineClass: describeState(g, key),
            actionSignature: signature,
          };
          if (firstLineClassMerge === null || rank < firstLineClassMerge.rank) firstLineClassMerge = candidate;
        }
      } else if (existingQClass !== classId) {
        qBehaviorMismatches += 1;
        throw new Error(`identified-line class maps to multiple behavior classes at rank ${rank}, q=${qKey}`);
      }
    }

    rankSummaries.push({
      rank,
      physicalStates: current.size,
      identifiedLineClasses: rankQ.size,
      behaviorClasses: rankBehavior.size,
      lineToBehaviorCollapse: rankBehavior.size === 0 ? null : rankQ.size / rankBehavior.size,
      physicalToBehaviorCollapse: rankBehavior.size === 0 ? null : current.size / rankBehavior.size,
    });
  }

  rankSummaries.reverse();

  const behaviorClasses = signatureToClass.size;
  const identifiedLineClasses = qToClass.size;
  let physicalStates = 0;
  for (const rank of graph.ranks) physicalStates += rank.size;

  let maxPhysicalPerBehavior = 0;
  let maxLineClassesPerBehavior = 0;
  let multiLineBehaviorClasses = 0;
  let crossRankBehaviorClasses = 0;
  let crossSupportBehaviorClasses = 0;
  for (let classId = 0; classId < behaviorClasses; classId += 1) {
    maxPhysicalPerBehavior = Math.max(maxPhysicalPerBehavior, classPhysicalCount[classId]);
    maxLineClassesPerBehavior = Math.max(maxLineClassesPerBehavior, classQCount[classId]);
    if (classQCount[classId] > 1) multiLineBehaviorClasses += 1;
    if (classCrossRank[classId]) crossRankBehaviorClasses += 1;
    if (classCrossSupport[classId]) crossSupportBehaviorClasses += 1;
  }

  const denseLineClassIdBytes = bytesForCardinality(identifiedLineClasses);
  const denseBehaviorClassIdBytes = bytesForCardinality(behaviorClasses);
  const actionSymbolCount = behaviorClasses + terminalScores.size + 1;
  const actionSymbolBytes = bytesForCardinality(actionSymbolCount);
  const flatActionEntries = behaviorClasses * g.columns;
  const flatTransitionBytes = flatActionEntries * actionSymbolBytes;
  const rawLineTupleBits = Math.ceil(Math.log2(g.supportCapacity)) + 2 * g.lineCount;
  const denseBehaviorIdBits = Math.max(1, Math.ceil(Math.log2(Math.max(1, behaviorClasses))));

  return {
    physicalStates,
    identifiedLineClasses,
    behaviorClasses,
    physicalToLineCollapse: physicalStates / identifiedLineClasses,
    lineToBehaviorCollapse: identifiedLineClasses / behaviorClasses,
    physicalToBehaviorCollapse: physicalStates / behaviorClasses,
    multiLineBehaviorClasses,
    maximumLineClassesPerBehaviorClass: maxLineClassesPerBehavior,
    maximumPhysicalStatesPerBehaviorClass: maxPhysicalPerBehavior,
    crossRankBehaviorClasses,
    crossSupportBehaviorClasses,
    qBehaviorMismatches,
    firstLineClassMerge,
    encoding: {
      rawLineTupleBits,
      denseLineClassIdBytes,
      denseBehaviorIdBits,
      denseBehaviorClassIdBytes,
      terminalScoreSymbols: terminalScores.size,
      flatActionEntries,
      actionSymbolBytes,
      flatTransitionBytes,
    },
    rankSummaries,
  };
}

function runCase(spec) {
  const started = performance.now();
  const g = createGeometry(spec);
  const graph = buildPhysicalGraph(g);
  const result = minimizeBehavior(g, graph);
  assert(result.qBehaviorMismatches === 0, 'identified-line quotient did not refine behavioral classes');

  return {
    geometry: `${g.columns}x${g.rows}:c${g.connect}`,
    winningLineCount: g.lineCount,
    supportCount: g.supportCapacity,
    transitionEdges: graph.transitionEdges,
    terminalEdges: graph.terminalEdges,
    ...result,
    elapsedMs: performance.now() - started,
  };
}

const requested = process.argv.slice(2);
const cases = requested.length === 0
  ? CASES
  : requested.map((token) => {
      const match = /^(\d+)x(\d+):c(\d+)$/.exec(token);
      assert(match, `invalid geometry token ${token}; expected CxR:cK`);
      return Object.freeze({ columns: Number(match[1]), rows: Number(match[2]), connect: Number(match[3]) });
    });

const results = [];
for (const spec of cases) {
  const result = runCase(spec);
  results.push(result);
  console.error(
    `[semantic-quotient MQ2] ${result.geometry} physical=${result.physicalStates} line=${result.identifiedLineClasses} ` +
    `behavior=${result.behaviorClasses} line->behavior=${result.lineToBehaviorCollapse.toFixed(3)}x ` +
    `physical->behavior=${result.physicalToBehaviorCollapse.toFixed(3)}x crossSupport=${result.crossSupportBehaviorClasses} ` +
    `crossRank=${result.crossRankBehaviorClasses} elapsedMs=${result.elapsedMs.toFixed(1)}`,
  );
  if (global.gc) global.gc();
}

console.log(JSON.stringify({
  kind: 'connect4-semantic-quotient-mq2-behavioral-partition',
  status: 'pass',
  equivalence: 'coarsest deterministic action-labelled future behavior on the bounded acyclic game graph',
  actionSignature: 'column -> illegal | immediate-terminal-score | child-behavior-class',
  claims: {
    identifiedLineClassRefinesBehavioralClass: true,
    labeledActionsPreserved: true,
    immediateTerminalTimingPreserved: true,
    deterministicSuccessorBehaviorPreserved: true,
    productionSolverClaim: false,
    standard7x6Claim: false,
  },
  cases: results,
}, null, 2));
