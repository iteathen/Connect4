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
  assert(cellCount <= 20, 'MQ3 exhaustive harness is intentionally bounded to <=20 cells');
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
      for (let row = 0; row < height; row += 1) occupiedMask = (occupiedMask | (1 << (row * columns + column))) >>> 0;
      if (height < rows) landings.push(Object.freeze({ column, cell: height * columns + column, nextSupportIndex: supportIndex + supportWeights[column] }));
    }
    support[supportIndex] = Object.freeze({ rank, occupiedMask, landings: Object.freeze(landings) });
  }

  const cellMaskCapacity = 2 ** cellCount;
  const lineMaskCapacity = 2 ** lines.length;
  const hitByCellSubset = new Uint32Array(cellMaskCapacity);
  for (let mask = 1; mask < cellMaskCapacity; mask += 1) {
    const lsb = mask & -mask;
    const cell = 31 - Math.clz32(lsb);
    hitByCellSubset[mask] = (hitByCellSubset[mask ^ lsb] | cellLineMasks[cell]) >>> 0;
  }

  function physicalKey(supportIndex, p0Ownership) { return supportIndex * cellMaskCapacity + p0Ownership; }
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

  return Object.freeze({ columns, rows, connect, cellCount, lines, lineCount: lines.length, lineCellMasks, lineBits, cellLineMasks, cellLineIds, supportCapacity, support, cellMaskCapacity, lineMaskCapacity, hitByCellSubset, physicalKey, decodePhysicalKey, quotientKey, terminalPhysical });
}

function buildPhysicalGraph(g) {
  const ranks = Array.from({ length: g.cellCount + 1 }, () => new Map());
  ranks[0].set(g.physicalKey(0, 0), 0);
  for (let rank = 0; rank < g.cellCount; rank += 1) {
    const mover = rank & 1;
    const next = ranks[rank + 1];
    for (const key of ranks[rank].keys()) {
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const support = g.support[supportIndex];
      const p1Ownership = (support.occupiedMask ^ p0Ownership) >>> 0;
      for (const landing of support.landings) {
        const nextSupport = g.support[landing.nextSupportIndex];
        const landingBit = (1 << landing.cell) >>> 0;
        const nextP0Ownership = mover === 0 ? (p0Ownership | landingBit) >>> 0 : p0Ownership;
        const nextP1Ownership = (nextSupport.occupiedMask ^ nextP0Ownership) >>> 0;
        const moverStoneMask = mover === 0 ? nextP0Ownership : nextP1Ownership;
        if (g.terminalPhysical(landing.cell, moverStoneMask)) continue;
        const childKey = g.physicalKey(landing.nextSupportIndex, nextP0Ownership);
        if (!next.has(childKey)) next.set(childKey, 0);
      }
    }
  }
  return ranks;
}

function assignBehaviorClasses(g, ranks) {
  const signatureToClass = new Map();
  for (let rank = g.cellCount; rank >= 0; rank -= 1) {
    const current = ranks[rank];
    const childRank = rank < g.cellCount ? ranks[rank + 1] : null;
    for (const key of current.keys()) {
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const support = g.support[supportIndex];
      const tokens = Array(g.columns).fill('I');
      for (const landing of support.landings) {
        const nextSupport = g.support[landing.nextSupportIndex];
        const landingBit = (1 << landing.cell) >>> 0;
        const mover = rank & 1;
        const nextP0Ownership = mover === 0 ? (p0Ownership | landingBit) >>> 0 : p0Ownership;
        const nextP1Ownership = (nextSupport.occupiedMask ^ nextP0Ownership) >>> 0;
        const moverStoneMask = mover === 0 ? nextP0Ownership : nextP1Ownership;
        if (g.terminalPhysical(landing.cell, moverStoneMask)) {
          tokens[landing.column] = `T${Math.trunc((g.cellCount + 1 - rank) / 2)}`;
        } else {
          const childClass = childRank.get(g.physicalKey(landing.nextSupportIndex, nextP0Ownership));
          assert(Number.isInteger(childClass), 'missing child behavior class');
          tokens[landing.column] = `C${childClass}`;
        }
      }
      const signature = tokens.join('|');
      let classId = signatureToClass.get(signature);
      if (classId === undefined) {
        classId = signatureToClass.size;
        signatureToClass.set(signature, classId);
      }
      current.set(key, classId);
    }
  }
  return signatureToClass.size;
}

function minimalAntichain(masks) {
  const out = [];
  for (const mask of masks) {
    let redundant = false;
    for (const existing of out) {
      if ((existing & mask) === existing) {
        redundant = true;
        break;
      }
    }
    if (redundant) continue;
    let write = 0;
    for (let i = 0; i < out.length; i += 1) {
      const existing = out[i];
      if ((existing & mask) === mask) continue;
      out[write++] = existing;
    }
    out.length = write;
    out.push(mask >>> 0);
  }
  out.sort((a, b) => a - b);
  return out;
}

function residualPair(g, support, p0HitMask, p1HitMask) {
  const p0 = [];
  const p1 = [];
  const emptyMask = (~support.occupiedMask) >>> 0;
  for (let lineId = 0; lineId < g.lineCount; lineId += 1) {
    const bit = g.lineBits[lineId];
    const residual = (g.lineCellMasks[lineId] & emptyMask) >>> 0;
    if ((p1HitMask & bit) === 0) {
      assert(residual !== 0, `nonterminal state has completed P0 line ${lineId}`);
      p0.push(residual);
    }
    if ((p0HitMask & bit) === 0) {
      assert(residual !== 0, `nonterminal state has completed P1 line ${lineId}`);
      p1.push(residual);
    }
  }
  return [minimalAntichain(p0), minimalAntichain(p1)];
}

function encodeMasks(masks) {
  return masks.map((mask) => mask.toString(16)).join('.');
}

function stateDescriptor(g, key) {
  const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
  const support = g.support[supportIndex];
  const p1Ownership = (support.occupiedMask ^ p0Ownership) >>> 0;
  return {
    rank: support.rank,
    supportIndex,
    p0OwnershipHex: `0x${p0Ownership.toString(16)}`,
    p1OwnershipHex: `0x${p1Ownership.toString(16)}`,
    p0HitMaskHex: `0x${g.hitByCellSubset[p0Ownership].toString(16)}`,
    p1HitMaskHex: `0x${g.hitByCellSubset[p1Ownership].toString(16)}`,
  };
}

function census(g, ranks, behaviorClassCount) {
  const qToBehavior = new Map();
  const qRepresentative = new Map();
  const supportResidualToBehavior = new Map();
  const residualOnlyToBehavior = new Map();
  const behaviorToQ = Array.from({ length: behaviorClassCount }, () => new Set());
  const behaviorToSupportResidual = Array.from({ length: behaviorClassCount }, () => new Set());
  const behaviorToResidualOnly = Array.from({ length: behaviorClassCount }, () => new Set());
  let supportResidualMismatches = 0;
  let residualOnlyMismatches = 0;
  let firstResidualOnlyCounterexample = null;
  let physicalStates = 0;

  for (const rank of ranks) {
    for (const [key, behaviorClass] of rank.entries()) {
      physicalStates += 1;
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const support = g.support[supportIndex];
      const p1Ownership = (support.occupiedMask ^ p0Ownership) >>> 0;
      const p0HitMask = g.hitByCellSubset[p0Ownership];
      const p1HitMask = g.hitByCellSubset[p1Ownership];
      const qKey = g.quotientKey(supportIndex, p0HitMask, p1HitMask);

      const previousQBehavior = qToBehavior.get(qKey);
      if (previousQBehavior === undefined) {
        qToBehavior.set(qKey, behaviorClass);
        qRepresentative.set(qKey, key);
      } else assert(previousQBehavior === behaviorClass, 'MQ1 line class mapped to multiple behavior classes');

      const [p0Residual, p1Residual] = residualPair(g, support, p0HitMask, p1HitMask);
      const residualOnly = `${encodeMasks(p0Residual)}/${encodeMasks(p1Residual)}`;
      const supportResidual = `${supportIndex}|${residualOnly}`;

      const srBehavior = supportResidualToBehavior.get(supportResidual);
      if (srBehavior === undefined) supportResidualToBehavior.set(supportResidual, behaviorClass);
      else if (srBehavior !== behaviorClass) supportResidualMismatches += 1;

      const roBehavior = residualOnlyToBehavior.get(residualOnly);
      if (roBehavior === undefined) residualOnlyToBehavior.set(residualOnly, behaviorClass);
      else if (roBehavior !== behaviorClass) {
        residualOnlyMismatches += 1;
        if (firstResidualOnlyCounterexample === null) {
          firstResidualOnlyCounterexample = {
            residualSignature: residualOnly,
            previousBehaviorClass: roBehavior,
            conflictingBehaviorClass: behaviorClass,
            conflictingState: stateDescriptor(g, key),
          };
        }
      }

      behaviorToQ[behaviorClass].add(qKey);
      behaviorToSupportResidual[behaviorClass].add(supportResidual);
      behaviorToResidualOnly[behaviorClass].add(residualOnly);
    }
  }

  let multiQBehaviorClasses = 0;
  let fullyExplainedBySupportResidual = 0;
  let remainingSupportResidualRedundancyClasses = 0;
  let maxQPerBehavior = 0;
  let maxSupportResidualPerBehavior = 0;
  let maxResidualOnlyPerBehavior = 0;
  let firstUnexplainedSameBehavior = null;

  for (let behaviorClass = 0; behaviorClass < behaviorClassCount; behaviorClass += 1) {
    const qCount = behaviorToQ[behaviorClass].size;
    const srCount = behaviorToSupportResidual[behaviorClass].size;
    const roCount = behaviorToResidualOnly[behaviorClass].size;
    maxQPerBehavior = Math.max(maxQPerBehavior, qCount);
    maxSupportResidualPerBehavior = Math.max(maxSupportResidualPerBehavior, srCount);
    maxResidualOnlyPerBehavior = Math.max(maxResidualOnlyPerBehavior, roCount);
    if (qCount > 1) {
      multiQBehaviorClasses += 1;
      if (srCount === 1) fullyExplainedBySupportResidual += 1;
      else {
        remainingSupportResidualRedundancyClasses += 1;
        if (firstUnexplainedSameBehavior === null) {
          const qKeys = [...behaviorToQ[behaviorClass]];
          const firstKey = qRepresentative.get(qKeys[0]);
          let secondKey = null;
          let firstSr = null;
          for (const qKey of qKeys) {
            const repKey = qRepresentative.get(qKey);
            const { supportIndex, p0Ownership } = g.decodePhysicalKey(repKey);
            const support = g.support[supportIndex];
            const p1Ownership = (support.occupiedMask ^ p0Ownership) >>> 0;
            const [a, b] = residualPair(g, support, g.hitByCellSubset[p0Ownership], g.hitByCellSubset[p1Ownership]);
            const sr = `${supportIndex}|${encodeMasks(a)}/${encodeMasks(b)}`;
            if (firstSr === null) firstSr = sr;
            else if (sr !== firstSr) { secondKey = repKey; break; }
          }
          if (secondKey !== null) {
            firstUnexplainedSameBehavior = {
              behaviorClass,
              first: stateDescriptor(g, firstKey),
              second: stateDescriptor(g, secondKey),
            };
          }
        }
      }
    }
  }

  return {
    physicalStates,
    behaviorClasses: behaviorClassCount,
    identifiedLineClasses: qToBehavior.size,
    supportResidualClasses: supportResidualToBehavior.size,
    residualOnlyClasses: residualOnlyToBehavior.size,
    lineToSupportResidualCollapse: qToBehavior.size / supportResidualToBehavior.size,
    supportResidualToBehaviorCollapse: supportResidualToBehavior.size / behaviorClassCount,
    lineToBehaviorCollapse: qToBehavior.size / behaviorClassCount,
    supportResidualMismatches,
    residualOnlyMismatches,
    residualOnlySufficient: residualOnlyMismatches === 0,
    supportResidualSufficient: supportResidualMismatches === 0,
    multiQBehaviorClasses,
    fullyExplainedBySupportResidual,
    remainingSupportResidualRedundancyClasses,
    fractionMultiQBehaviorClassesFullyExplained: multiQBehaviorClasses === 0 ? 1 : fullyExplainedBySupportResidual / multiQBehaviorClasses,
    maximumLineClassesPerBehaviorClass: maxQPerBehavior,
    maximumSupportResidualClassesPerBehaviorClass: maxSupportResidualPerBehavior,
    maximumResidualOnlyClassesPerBehaviorClass: maxResidualOnlyPerBehavior,
    firstResidualOnlyCounterexample,
    firstUnexplainedSameBehavior,
  };
}

function runCase(spec) {
  const started = performance.now();
  const g = createGeometry(spec);
  const ranks = buildPhysicalGraph(g);
  const behaviorClassCount = assignBehaviorClasses(g, ranks);
  const result = census(g, ranks, behaviorClassCount);
  assert(result.supportResidualMismatches === 0, `${spec.columns}x${spec.rows}: support + minimal residual antichains are not sufficient`);
  return { geometry: `${g.columns}x${g.rows}:c${g.connect}`, winningLineCount: g.lineCount, supportCount: g.supportCapacity, ...result, elapsedMs: performance.now() - started };
}

const results = [];
for (const spec of CASES) {
  const result = runCase(spec);
  results.push(result);
  console.error(`[semantic-quotient MQ3] ${result.geometry} line=${result.identifiedLineClasses} supportResidual=${result.supportResidualClasses} behavior=${result.behaviorClasses} line->SR=${result.lineToSupportResidualCollapse.toFixed(3)}x SR->behavior=${result.supportResidualToBehaviorCollapse.toFixed(3)}x residualOnlySufficient=${result.residualOnlySufficient} elapsedMs=${result.elapsedMs.toFixed(1)}`);
  if (global.gc) global.gc();
}

console.log(JSON.stringify({
  kind: 'connect4-semantic-quotient-mq3-residual-sufficiency',
  status: 'pass',
  candidate: '(support,minimal-P0-residual-antichain,minimal-P1-residual-antichain)',
  claims: {
    supportPlusMinimalResidualAntichainsSufficientOnCompleteControls: true,
    residualOnlySufficiencyReportedPerCase: true,
    productionSolverClaim: false,
    standard7x6Claim: false
  },
  cases: results,
}, null, 2));
