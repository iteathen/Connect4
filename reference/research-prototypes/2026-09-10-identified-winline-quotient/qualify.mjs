import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';

const UNKNOWN = 2;
const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createCaseGeometry({ columns, rows, connect }) {
  const cellCount = columns * rows;
  assert(cellCount <= 20, 'physical exhaustive quotient harness is intentionally bounded to <=20 cells');

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
    return Object.freeze({ supportIndex, p0Ownership: key - supportIndex * cellMaskCapacity });
  }

  function quotientKey(supportIndex, p0HitMask, p1HitMask) {
    return supportIndex + supportCapacity * (p0HitMask + lineMaskCapacity * p1HitMask);
  }

  function decodeQuotientKey(key) {
    const supportIndex = key % supportCapacity;
    const packed = Math.floor(key / supportCapacity);
    const p0HitMask = packed % lineMaskCapacity;
    const p1HitMask = Math.floor(packed / lineMaskCapacity);
    return Object.freeze({ supportIndex, p0HitMask, p1HitMask });
  }

  function hasWin(stoneMask) {
    for (let lineId = 0; lineId < lineCellMasks.length; lineId += 1) {
      const lineMask = lineCellMasks[lineId];
      if ((stoneMask & lineMask) === lineMask) return true;
    }
    return false;
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
    decodeQuotientKey,
    hasWin,
    terminalPhysical,
    terminalQuotient,
  });
}

function buildPhysicalGraph(g) {
  const maxRank = g.cellCount;
  const ranks = Array.from({ length: maxRank + 1 }, () => new Map());
  const quotientCounts = Array.from({ length: maxRank + 1 }, () => new Map());
  let transitionEdges = 0;
  let terminalEdges = 0;
  let terminalMismatches = 0;
  let successorSignatureMismatches = 0;
  let priorWinSources = 0;

  const rootPhysicalKey = g.physicalKey(0, 0);
  const rootQuotientKey = g.quotientKey(0, 0, 0);
  ranks[0].set(rootPhysicalKey, UNKNOWN);
  quotientCounts[0].set(rootQuotientKey, 1);

  for (let rank = 0; rank <= maxRank; rank += 1) {
    const current = ranks[rank];
    if (rank === maxRank) continue;
    const next = ranks[rank + 1];
    const nextCounts = quotientCounts[rank + 1];
    const mover = rank & 1;

    for (const key of current.keys()) {
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const support = g.support[supportIndex];
      assert(support.rank === rank, `physical support rank mismatch at ${key}`);
      const p1Ownership = (support.occupiedMask ^ p0Ownership) >>> 0;
      if (g.hasWin(p0Ownership) || g.hasWin(p1Ownership)) {
        priorWinSources += 1;
        continue;
      }

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
          throw new Error(`terminal mismatch at ${g.columns}x${g.rows} rank ${rank} support ${supportIndex} column ${landing.column}`);
        }
        if (physicalTerminal) {
          terminalEdges += 1;
          continue;
        }

        const nextP0HitFromOwnership = g.hitByCellSubset[nextP0Ownership];
        const nextP1HitFromOwnership = g.hitByCellSubset[nextP1Ownership];
        const nextP0HitByFormula = mover === 0 ? (p0HitMask | g.cellLineMasks[landing.cell]) >>> 0 : p0HitMask;
        const nextP1HitByFormula = mover === 1 ? (p1HitMask | g.cellLineMasks[landing.cell]) >>> 0 : p1HitMask;

        if (nextP0HitFromOwnership !== nextP0HitByFormula || nextP1HitFromOwnership !== nextP1HitByFormula) {
          successorSignatureMismatches += 1;
          throw new Error(`hit-mask transition mismatch at ${g.columns}x${g.rows} rank ${rank} support ${supportIndex} column ${landing.column}`);
        }

        const childPhysicalKey = g.physicalKey(landing.nextSupportIndex, nextP0Ownership);
        if (!next.has(childPhysicalKey)) {
          next.set(childPhysicalKey, UNKNOWN);
          const qKey = g.quotientKey(landing.nextSupportIndex, nextP0HitFromOwnership, nextP1HitFromOwnership);
          nextCounts.set(qKey, (nextCounts.get(qKey) ?? 0) + 1);
        }
      }
    }
  }

  assert(priorWinSources === 0, `physical graph contained ${priorWinSources} already-terminal source states`);
  return { ranks, quotientCounts, transitionEdges, terminalEdges, terminalMismatches, successorSignatureMismatches };
}

function buildQuotientGraph(g) {
  const maxRank = g.cellCount;
  const ranks = Array.from({ length: maxRank + 1 }, () => new Map());
  let transitionEdges = 0;
  let terminalEdges = 0;
  ranks[0].set(g.quotientKey(0, 0, 0), UNKNOWN);

  for (let rank = 0; rank < maxRank; rank += 1) {
    const mover = rank & 1;
    const current = ranks[rank];
    const next = ranks[rank + 1];

    for (const key of current.keys()) {
      const { supportIndex, p0HitMask, p1HitMask } = g.decodeQuotientKey(key);
      const support = g.support[supportIndex];
      assert(support.rank === rank, `quotient support rank mismatch at ${key}`);

      for (const landing of support.landings) {
        transitionEdges += 1;
        const nextSupport = g.support[landing.nextSupportIndex];
        const terminal = g.terminalQuotient(
          nextSupport.occupiedMask,
          landing.cell,
          mover === 0 ? p1HitMask : p0HitMask,
        );
        if (terminal) {
          terminalEdges += 1;
          continue;
        }

        const nextP0HitMask = mover === 0 ? (p0HitMask | g.cellLineMasks[landing.cell]) >>> 0 : p0HitMask;
        const nextP1HitMask = mover === 1 ? (p1HitMask | g.cellLineMasks[landing.cell]) >>> 0 : p1HitMask;
        const childKey = g.quotientKey(landing.nextSupportIndex, nextP0HitMask, nextP1HitMask);
        if (!next.has(childKey)) next.set(childKey, UNKNOWN);
      }
    }
  }

  return { ranks, transitionEdges, terminalEdges };
}

function compareReachableQuotientSets(g, physical, quotient) {
  let mismatches = 0;
  let maximumClassSize = 0;
  const rankSummaries = [];

  for (let rank = 0; rank <= g.cellCount; rank += 1) {
    const physicalClasses = physical.quotientCounts[rank];
    const quotientClasses = quotient.ranks[rank];
    for (const count of physicalClasses.values()) maximumClassSize = Math.max(maximumClassSize, count);

    if (physicalClasses.size !== quotientClasses.size) mismatches += Math.abs(physicalClasses.size - quotientClasses.size);
    for (const key of physicalClasses.keys()) if (!quotientClasses.has(key)) mismatches += 1;
    for (const key of quotientClasses.keys()) if (!physicalClasses.has(key)) mismatches += 1;

    let physicalCount = 0;
    for (const count of physicalClasses.values()) physicalCount += count;
    rankSummaries.push(Object.freeze({
      rank,
      physicalNonterminalStates: physicalCount,
      quotientNonterminalStates: quotientClasses.size,
      collapse: quotientClasses.size === 0 ? null : physicalCount / quotientClasses.size,
    }));
  }

  assert(mismatches === 0, `reachable quotient-set mismatch count ${mismatches}`);
  return { mismatches, maximumClassSize, rankSummaries };
}

function solveQuotientGraph(g, quotient) {
  for (let rank = g.cellCount; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    const current = quotient.ranks[rank];
    const childRank = rank < g.cellCount ? quotient.ranks[rank + 1] : null;

    for (const key of current.keys()) {
      const { supportIndex, p0HitMask, p1HitMask } = g.decodeQuotientKey(key);
      const support = g.support[supportIndex];
      if (support.landings.length === 0) {
        current.set(key, 0);
        continue;
      }

      let best = mover === 0 ? -2 : 2;
      for (const landing of support.landings) {
        const nextSupport = g.support[landing.nextSupportIndex];
        const terminal = g.terminalQuotient(
          nextSupport.occupiedMask,
          landing.cell,
          mover === 0 ? p1HitMask : p0HitMask,
        );
        let value;
        if (terminal) {
          value = mover === 0 ? 1 : -1;
        } else {
          const nextP0HitMask = mover === 0 ? (p0HitMask | g.cellLineMasks[landing.cell]) >>> 0 : p0HitMask;
          const nextP1HitMask = mover === 1 ? (p1HitMask | g.cellLineMasks[landing.cell]) >>> 0 : p1HitMask;
          const childKey = g.quotientKey(landing.nextSupportIndex, nextP0HitMask, nextP1HitMask);
          value = childRank.get(childKey);
          assert(value !== undefined && value !== UNKNOWN, `missing quotient child WDL at rank ${rank}`);
        }
        best = mover === 0 ? Math.max(best, value) : Math.min(best, value);
      }
      current.set(key, best);
    }
  }
  return quotient.ranks[0].get(g.quotientKey(0, 0, 0));
}

function solvePhysicalAndCompare(g, physical, quotient) {
  let wdlMismatches = 0;
  let comparedStates = 0;

  for (let rank = g.cellCount; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    const current = physical.ranks[rank];
    const childRank = rank < g.cellCount ? physical.ranks[rank + 1] : null;

    for (const key of current.keys()) {
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const support = g.support[supportIndex];
      const p1Ownership = (support.occupiedMask ^ p0Ownership) >>> 0;
      let value;

      if (support.landings.length === 0) {
        value = 0;
      } else {
        let best = mover === 0 ? -2 : 2;
        for (const landing of support.landings) {
          const nextSupport = g.support[landing.nextSupportIndex];
          const landingBit = (1 << landing.cell) >>> 0;
          const nextP0Ownership = mover === 0 ? (p0Ownership | landingBit) >>> 0 : p0Ownership;
          const nextP1Ownership = (nextSupport.occupiedMask ^ nextP0Ownership) >>> 0;
          const moverStoneMask = mover === 0 ? nextP0Ownership : nextP1Ownership;
          let childValue;
          if (g.terminalPhysical(landing.cell, moverStoneMask)) {
            childValue = mover === 0 ? 1 : -1;
          } else {
            const childKey = g.physicalKey(landing.nextSupportIndex, nextP0Ownership);
            childValue = childRank.get(childKey);
            assert(childValue !== undefined && childValue !== UNKNOWN, `missing physical child WDL at rank ${rank}`);
          }
          best = mover === 0 ? Math.max(best, childValue) : Math.min(best, childValue);
        }
        value = best;
      }

      current.set(key, value);
      const p0HitMask = g.hitByCellSubset[p0Ownership];
      const p1HitMask = g.hitByCellSubset[p1Ownership];
      const qKey = g.quotientKey(supportIndex, p0HitMask, p1HitMask);
      const qValue = quotient.ranks[rank].get(qKey);
      comparedStates += 1;
      if (qValue !== value) {
        wdlMismatches += 1;
        throw new Error(`WDL quotient mismatch at ${g.columns}x${g.rows} rank ${rank} support ${supportIndex}`);
      }
    }
  }

  return {
    rootWdl: physical.ranks[0].get(g.physicalKey(0, 0)),
    wdlMismatches,
    comparedStates,
  };
}

function maskReuseCensus(g, quotient) {
  const p0Masks = new Set();
  const p1Masks = new Set();
  const eitherMasks = new Set();
  let quotientStates = 0;

  for (const rank of quotient.ranks) {
    for (const key of rank.keys()) {
      quotientStates += 1;
      const { p0HitMask, p1HitMask } = g.decodeQuotientKey(key);
      p0Masks.add(p0HitMask);
      p1Masks.add(p1HitMask);
      eitherMasks.add(p0HitMask);
      eitherMasks.add(p1HitMask);
    }
  }

  return Object.freeze({
    quotientStates,
    uniqueP0HitMasks: p0Masks.size,
    uniqueP1HitMasks: p1Masks.size,
    uniqueEitherSideHitMasks: eitherMasks.size,
    materializedMaskOccurrences: quotientStates * 2,
    maskOccurrenceToUniqueRatio: eitherMasks.size === 0 ? null : (quotientStates * 2) / eitherMasks.size,
    smallestIntegerRefBits: eitherMasks.size <= 0x10000 ? 16 : 32,
  });
}

function runCase(spec) {
  const started = performance.now();
  const g = createCaseGeometry(spec);
  const physical = buildPhysicalGraph(g);
  const quotient = buildQuotientGraph(g);
  const reachableComparison = compareReachableQuotientSets(g, physical, quotient);
  const quotientRootWdl = solveQuotientGraph(g, quotient);
  const physicalResult = solvePhysicalAndCompare(g, physical, quotient);
  const maskReuse = maskReuseCensus(g, quotient);

  let physicalStates = 0;
  let quotientStates = 0;
  for (let rank = 0; rank <= g.cellCount; rank += 1) {
    physicalStates += physical.ranks[rank].size;
    quotientStates += quotient.ranks[rank].size;
  }

  assert(physicalResult.rootWdl === quotientRootWdl, 'root WDL mismatch');
  assert(physical.terminalMismatches === 0, 'terminal mismatches were observed');
  assert(physical.successorSignatureMismatches === 0, 'successor-signature mismatches were observed');
  assert(reachableComparison.mismatches === 0, 'reachable quotient class mismatches were observed');
  assert(physicalResult.wdlMismatches === 0, 'WDL mismatches were observed');

  return Object.freeze({
    geometry: `${g.columns}x${g.rows}:c${g.connect}`,
    winningLineCount: g.lineCount,
    supportCount: g.supportCapacity,
    physicalNonterminalStates: physicalStates,
    quotientNonterminalStates: quotientStates,
    collapse: quotientStates === 0 ? null : physicalStates / quotientStates,
    maximumPhysicalStatesPerQuotientClass: reachableComparison.maximumClassSize,
    physicalTransitionEdges: physical.transitionEdges,
    quotientTransitionEdges: quotient.transitionEdges,
    physicalTerminalEdges: physical.terminalEdges,
    quotientTerminalEdges: quotient.terminalEdges,
    terminalMismatches: physical.terminalMismatches,
    successorSignatureMismatches: physical.successorSignatureMismatches,
    reachableQuotientSetMismatches: reachableComparison.mismatches,
    exactWdlComparedPhysicalStates: physicalResult.comparedStates,
    wdlMismatches: physicalResult.wdlMismatches,
    physicalRootWdl: physicalResult.rootWdl,
    quotientRootWdl,
    maskReuse,
    rankSummaries: reachableComparison.rankSummaries,
    elapsedMs: performance.now() - started,
  });
}

const results = [];
for (const spec of CASES) {
  const result = runCase(spec);
  results.push(result);
  console.error(`[identified-winline-quotient] ${result.geometry} physical=${result.physicalNonterminalStates} quotient=${result.quotientNonterminalStates} collapse=${result.collapse.toFixed(3)}x root=${result.quotientRootWdl} elapsedMs=${result.elapsedMs.toFixed(1)}`);
  if (global.gc) global.gc();
}

console.log(JSON.stringify({
  kind: 'connect4-identified-winline-quotient-exact-falsification',
  status: 'pass',
  claims: Object.freeze({
    quotientKey: '(support,p0PhysicalLineHitMask,p1PhysicalLineHitMask)',
    terminalObservationEquivalent: true,
    successorSignatureEquivalent: true,
    reachableQuotientGraphEquivalent: true,
    exactWdlEquivalent: true,
    productionSolverClaim: false,
    nativeCudaClaim: false,
  }),
  cases: results,
}, null, 2));
