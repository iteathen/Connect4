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

function createGeometry({ columns, rows, connect }) {
  const cellCount = columns * rows;
  assert(cellCount <= 20, 'MQ1 exhaustive harness is intentionally bounded to <=20 cells');
  assert(columns <= 5, 'MQ1 compact action signature currently supports <=5 columns');

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

    support[supportIndex] = Object.freeze({
      rank,
      occupiedMask,
      landings: Object.freeze(landings),
    });
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
  let terminalMismatches = 0;
  let successorSignatureMismatches = 0;

  for (let rank = 0; rank < g.cellCount; rank += 1) {
    const mover = rank & 1;
    const current = ranks[rank];
    const next = ranks[rank + 1];

    for (const key of current.keys()) {
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const support = g.support[supportIndex];
      assert(support.rank === rank, `support rank mismatch at ${key}`);
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
        const physicalTerminal = g.terminalPhysical(landing.cell, moverStoneMask);
        const quotientTerminal = g.terminalQuotient(
          nextSupport.occupiedMask,
          landing.cell,
          mover === 0 ? p1HitMask : p0HitMask,
        );

        if (physicalTerminal !== quotientTerminal) {
          terminalMismatches += 1;
          continue;
        }
        if (physicalTerminal) {
          terminalEdges += 1;
          continue;
        }

        const nextP0HitFromOwnership = g.hitByCellSubset[nextP0Ownership];
        const nextP1HitFromOwnership = g.hitByCellSubset[nextP1Ownership];
        const nextP0HitByFormula = mover === 0
          ? (p0HitMask | g.cellLineMasks[landing.cell]) >>> 0
          : p0HitMask;
        const nextP1HitByFormula = mover === 1
          ? (p1HitMask | g.cellLineMasks[landing.cell]) >>> 0
          : p1HitMask;

        if (nextP0HitFromOwnership !== nextP0HitByFormula || nextP1HitFromOwnership !== nextP1HitByFormula) {
          successorSignatureMismatches += 1;
          continue;
        }

        const childKey = g.physicalKey(landing.nextSupportIndex, nextP0Ownership);
        if (!next.has(childKey)) next.set(childKey, 0);
      }
    }
  }

  assert(terminalMismatches === 0, `terminal mismatch count ${terminalMismatches}`);
  assert(successorSignatureMismatches === 0, `successor signature mismatch count ${successorSignatureMismatches}`);

  return { ranks, transitionEdges, terminalEdges, terminalMismatches, successorSignatureMismatches };
}

function encodeActions(actions) {
  let packed = 0;
  for (let column = 0; column < actions.length; column += 1) {
    const score = actions[column];
    const code = score === null ? 63 : score + 16;
    assert(code >= 0 && code < 64, `action score code out of range: ${score}`);
    packed = (packed | (code << (column * 6))) >>> 0;
  }
  return packed;
}

function decodeActions(packed, columns) {
  const out = [];
  for (let column = 0; column < columns; column += 1) {
    const code = (packed >>> (column * 6)) & 63;
    out.push(code === 63 ? null : code - 16);
  }
  return out;
}

function stateDescriptor(g, key) {
  const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
  const support = g.support[supportIndex];
  const p1Ownership = (support.occupiedMask ^ p0Ownership) >>> 0;
  const p0HitMask = g.hitByCellSubset[p0Ownership];
  const p1HitMask = g.hitByCellSubset[p1Ownership];
  return {
    physicalKey: key,
    supportIndex,
    rank: support.rank,
    p0OwnershipHex: `0x${p0Ownership.toString(16)}`,
    p1OwnershipHex: `0x${p1Ownership.toString(16)}`,
    p0HitMaskHex: `0x${p0HitMask.toString(16)}`,
    p1HitMaskHex: `0x${p1HitMask.toString(16)}`,
    quotientKey: g.quotientKey(supportIndex, p0HitMask, p1HitMask),
  };
}

function solveAndQualify(g, graph) {
  let comparedStates = 0;
  let comparedMultiMemberStates = 0;
  let quotientClasses = 0;
  let multiMemberClasses = 0;
  let maximumClassSize = 0;
  let stateScoreMismatches = 0;
  let actionScoreMismatches = 0;
  let terminalTimingMismatches = 0;
  let successorClassMismatches = 0;
  let minimalCounterexample = null;

  const rankSummaries = [];

  for (let rank = g.cellCount; rank >= 0; rank -= 1) {
    const current = graph.ranks[rank];
    const childRank = rank < g.cellCount ? graph.ranks[rank + 1] : null;
    const classRefs = new Map();
    const classCounts = new Map();

    for (const key of current.keys()) {
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const support = g.support[supportIndex];
      const p1Ownership = (support.occupiedMask ^ p0Ownership) >>> 0;
      const p0HitMask = g.hitByCellSubset[p0Ownership];
      const p1HitMask = g.hitByCellSubset[p1Ownership];
      const qKey = g.quotientKey(supportIndex, p0HitMask, p1HitMask);
      const actions = Array(g.columns).fill(null);

      if (support.landings.length === 0) {
        current.set(key, 0);
      } else {
        let best = -Infinity;
        for (const landing of support.landings) {
          const nextSupport = g.support[landing.nextSupportIndex];
          const landingBit = (1 << landing.cell) >>> 0;
          const mover = rank & 1;
          const nextP0Ownership = mover === 0 ? (p0Ownership | landingBit) >>> 0 : p0Ownership;
          const nextP1Ownership = (nextSupport.occupiedMask ^ nextP0Ownership) >>> 0;
          const moverStoneMask = mover === 0 ? nextP0Ownership : nextP1Ownership;
          const physicalTerminal = g.terminalPhysical(landing.cell, moverStoneMask);
          const quotientTerminal = g.terminalQuotient(
            nextSupport.occupiedMask,
            landing.cell,
            mover === 0 ? p1HitMask : p0HitMask,
          );

          if (physicalTerminal !== quotientTerminal) terminalTimingMismatches += 1;

          let actionScore;
          if (physicalTerminal) {
            actionScore = Math.trunc((g.cellCount + 1 - rank) / 2);
          } else {
            const childKey = g.physicalKey(landing.nextSupportIndex, nextP0Ownership);
            const childScore = childRank.get(childKey);
            assert(childScore !== undefined, `missing child strong score at rank ${rank}, column ${landing.column}`);
            actionScore = -childScore;

            const nextP0HitFromOwnership = g.hitByCellSubset[nextP0Ownership];
            const nextP1HitFromOwnership = g.hitByCellSubset[nextP1Ownership];
            const nextP0HitByFormula = mover === 0
              ? (p0HitMask | g.cellLineMasks[landing.cell]) >>> 0
              : p0HitMask;
            const nextP1HitByFormula = mover === 1
              ? (p1HitMask | g.cellLineMasks[landing.cell]) >>> 0
              : p1HitMask;
            const physicalChildQ = g.quotientKey(
              landing.nextSupportIndex,
              nextP0HitFromOwnership,
              nextP1HitFromOwnership,
            );
            const formulaChildQ = g.quotientKey(
              landing.nextSupportIndex,
              nextP0HitByFormula,
              nextP1HitByFormula,
            );
            if (physicalChildQ !== formulaChildQ) successorClassMismatches += 1;
          }

          actions[landing.column] = actionScore;
          if (actionScore > best) best = actionScore;
        }
        current.set(key, best);
      }

      const value = current.get(key);
      const actionSignature = encodeActions(actions);
      const count = (classCounts.get(qKey) ?? 0) + 1;
      classCounts.set(qKey, count);
      const representative = classRefs.get(qKey);

      if (representative === undefined) {
        classRefs.set(qKey, { key, value, actionSignature });
      } else {
        comparedStates += 1;
        comparedMultiMemberStates += 1;
        let mismatchKind = null;
        if (representative.value !== value) {
          stateScoreMismatches += 1;
          mismatchKind = 'state-score';
        }
        if (representative.actionSignature !== actionSignature) {
          actionScoreMismatches += 1;
          mismatchKind ??= 'action-score';
        }
        if (mismatchKind !== null && (minimalCounterexample === null || rank < minimalCounterexample.rank)) {
          minimalCounterexample = {
            kind: mismatchKind,
            rank,
            quotientKey: qKey,
            representative: {
              ...stateDescriptor(g, representative.key),
              value: representative.value,
              actions: decodeActions(representative.actionSignature, g.columns),
            },
            conflicting: {
              ...stateDescriptor(g, key),
              value,
              actions,
            },
          };
        }
      }
    }

    quotientClasses += classRefs.size;
    let rankMultiMemberClasses = 0;
    let rankMaxClass = 0;
    for (const count of classCounts.values()) {
      rankMaxClass = Math.max(rankMaxClass, count);
      maximumClassSize = Math.max(maximumClassSize, count);
      if (count > 1) {
        multiMemberClasses += 1;
        rankMultiMemberClasses += 1;
      }
    }

    rankSummaries.push({
      rank,
      physicalNonterminalStates: current.size,
      quotientClasses: classRefs.size,
      multiMemberClasses: rankMultiMemberClasses,
      maximumClassSize: rankMaxClass,
    });
  }

  rankSummaries.reverse();

  let physicalStates = 0;
  for (const rank of graph.ranks) physicalStates += rank.size;

  return {
    physicalStates,
    quotientClasses,
    collapse: quotientClasses === 0 ? null : physicalStates / quotientClasses,
    multiMemberClasses,
    maximumClassSize,
    comparedStates,
    comparedMultiMemberStates,
    stateScoreMismatches,
    actionScoreMismatches,
    terminalTimingMismatches,
    successorClassMismatches,
    minimalCounterexample,
    rootStrongScore: graph.ranks[0].get(g.physicalKey(0, 0)),
    rankSummaries,
  };
}

function runCase(spec) {
  const started = performance.now();
  const g = createGeometry(spec);
  const graph = buildPhysicalGraph(g);
  const result = solveAndQualify(g, graph);

  assert(result.terminalTimingMismatches === 0, `${spec.columns}x${spec.rows}: terminal timing mismatch`);
  assert(result.successorClassMismatches === 0, `${spec.columns}x${spec.rows}: successor class mismatch`);
  assert(result.stateScoreMismatches === 0, `${spec.columns}x${spec.rows}: strong state score mismatch`);
  assert(result.actionScoreMismatches === 0, `${spec.columns}x${spec.rows}: per-column action score mismatch`);

  return {
    geometry: `${g.columns}x${g.rows}:c${g.connect}`,
    winningLineCount: g.lineCount,
    supportCount: g.supportCapacity,
    physicalTransitionEdges: graph.transitionEdges,
    physicalTerminalEdges: graph.terminalEdges,
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
    `[semantic-quotient MQ1] ${result.geometry} physical=${result.physicalStates} classes=${result.quotientClasses} ` +
    `collapse=${result.collapse.toFixed(3)}x rootStrong=${result.rootStrongScore} ` +
    `stateMismatch=${result.stateScoreMismatches} actionMismatch=${result.actionScoreMismatches} ` +
    `elapsedMs=${result.elapsedMs.toFixed(1)}`,
  );
  if (global.gc) global.gc();
}

console.log(JSON.stringify({
  kind: 'connect4-semantic-quotient-mq1-strong-score',
  status: 'pass',
  candidate: '(support,p0PhysicalLineHitMask,p1PhysicalLineHitMask)',
  scoreSemantics: 'side-to-move exact distance-sensitive score; faster wins and slower losses preferred; draws=0',
  claims: {
    completeSmallGamePhysicalGraph: true,
    legalActionSetPreservedBySupport: true,
    terminalTimingEquivalent: true,
    successorQuotientClassEquivalent: true,
    exactStrongStateScoreEquivalentWithinClass: true,
    exactPerColumnActionScoreEquivalentWithinClass: true,
    productionSolverClaim: false,
    standard7x6Claim: false,
  },
  cases: results,
}, null, 2));
