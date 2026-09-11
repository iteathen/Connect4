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

function encodeMasks(masks) {
  return masks.map((mask) => mask.toString(16)).join('.');
}

function createGeometry({ columns, rows, connect }) {
  const cellCount = columns * rows;
  assert(cellCount <= 20, 'MQ4 exhaustive harness is intentionally bounded to <=20 cells');
  const lines = createConnectWinningLines({ columns, rows, connect });
  assert(lines.length > 0 && lines.length < 31, 'u32 line-mask harness requires 1..30 winning lines');

  const lineCellMasks = new Uint32Array(lines.length);
  const lineBits = new Uint32Array(lines.length);
  const cellLineMasks = new Uint32Array(cellCount);
  const cellLineIds = Array.from({ length: cellCount }, () => []);
  for (let lineId = 0; lineId < lines.length; lineId += 1) {
    let mask = 0;
    for (const cell of lines[lineId]) {
      mask = (mask | (1 << cell)) >>> 0;
      cellLineMasks[cell] = (cellLineMasks[cell] | (1 << lineId)) >>> 0;
      cellLineIds[cell].push(lineId);
    }
    lineCellMasks[lineId] = mask;
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
  function terminalPhysical(landingCell, moverStoneMask) {
    for (const lineId of cellLineIds[landingCell]) {
      const lineMask = lineCellMasks[lineId];
      if ((moverStoneMask & lineMask) === lineMask) return true;
    }
    return false;
  }

  return Object.freeze({ columns, rows, connect, cellCount, lineCount: lines.length, lineCellMasks, lineBits, supportCapacity, support, cellMaskCapacity, hitByCellSubset, physicalKey, decodePhysicalKey, terminalPhysical });
}

function residualPairFromPhysical(g, support, p0Ownership) {
  const p1Ownership = (support.occupiedMask ^ p0Ownership) >>> 0;
  const p0Hit = g.hitByCellSubset[p0Ownership];
  const p1Hit = g.hitByCellSubset[p1Ownership];
  const emptyMask = (~support.occupiedMask) >>> 0;
  const p0 = [];
  const p1 = [];
  for (let lineId = 0; lineId < g.lineCount; lineId += 1) {
    const bit = g.lineBits[lineId];
    const residual = (g.lineCellMasks[lineId] & emptyMask) >>> 0;
    if ((p1Hit & bit) === 0) {
      assert(residual !== 0, 'nonterminal physical state has completed P0 line');
      p0.push(residual);
    }
    if ((p0Hit & bit) === 0) {
      assert(residual !== 0, 'nonterminal physical state has completed P1 line');
      p1.push(residual);
    }
  }
  return [minimalAntichain(p0), minimalAntichain(p1)];
}

function residualStateKey(supportIndex, p0Residual, p1Residual) {
  return `${supportIndex}|${encodeMasks(p0Residual)}/${encodeMasks(p1Residual)}`;
}

function moverTransition(residuals, cellBit) {
  const next = [];
  for (const residual of residuals) {
    if ((residual & cellBit) !== 0) {
      const reduced = (residual & ~cellBit) >>> 0;
      if (reduced === 0) return { terminal: true, residuals: null };
      next.push(reduced);
    } else next.push(residual);
  }
  return { terminal: false, residuals: minimalAntichain(next) };
}

function opponentTransition(residuals, cellBit) {
  const next = [];
  for (const residual of residuals) if ((residual & cellBit) === 0) next.push(residual);
  return next;
}

function buildResidualAutomaton(g) {
  const ranks = Array.from({ length: g.cellCount + 1 }, () => new Map());
  const rootResidual = minimalAntichain([...g.lineCellMasks]);
  const root = Object.freeze({ supportIndex: 0, p0Residual: rootResidual, p1Residual: rootResidual });
  ranks[0].set(residualStateKey(0, rootResidual, rootResidual), root);
  let transitionEdges = 0;
  let terminalEdges = 0;

  for (let rank = 0; rank < g.cellCount; rank += 1) {
    const mover = rank & 1;
    const nextRank = ranks[rank + 1];
    for (const state of ranks[rank].values()) {
      const support = g.support[state.supportIndex];
      for (const landing of support.landings) {
        transitionEdges += 1;
        const cellBit = (1 << landing.cell) >>> 0;
        const moverResidual = mover === 0 ? state.p0Residual : state.p1Residual;
        const opponentResidual = mover === 0 ? state.p1Residual : state.p0Residual;
        const moved = moverTransition(moverResidual, cellBit);
        if (moved.terminal) {
          terminalEdges += 1;
          continue;
        }
        const blockedOpponent = opponentTransition(opponentResidual, cellBit);
        const p0Residual = mover === 0 ? moved.residuals : blockedOpponent;
        const p1Residual = mover === 1 ? moved.residuals : blockedOpponent;
        const key = residualStateKey(landing.nextSupportIndex, p0Residual, p1Residual);
        if (!nextRank.has(key)) nextRank.set(key, Object.freeze({ supportIndex: landing.nextSupportIndex, p0Residual, p1Residual }));
      }
    }
  }
  return { ranks, transitionEdges, terminalEdges };
}

function buildPhysicalProjection(g) {
  const ranks = Array.from({ length: g.cellCount + 1 }, () => new Map());
  const projection = Array.from({ length: g.cellCount + 1 }, () => new Set());
  ranks[0].set(g.physicalKey(0, 0), 0);
  const rootResidual = minimalAntichain([...g.lineCellMasks]);
  projection[0].add(residualStateKey(0, rootResidual, rootResidual));

  for (let rank = 0; rank < g.cellCount; rank += 1) {
    const mover = rank & 1;
    const next = ranks[rank + 1];
    for (const key of ranks[rank].keys()) {
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const support = g.support[supportIndex];
      for (const landing of support.landings) {
        const nextSupport = g.support[landing.nextSupportIndex];
        const bit = (1 << landing.cell) >>> 0;
        const nextP0Ownership = mover === 0 ? (p0Ownership | bit) >>> 0 : p0Ownership;
        const nextP1Ownership = (nextSupport.occupiedMask ^ nextP0Ownership) >>> 0;
        const moverStoneMask = mover === 0 ? nextP0Ownership : nextP1Ownership;
        if (g.terminalPhysical(landing.cell, moverStoneMask)) continue;
        const childKey = g.physicalKey(landing.nextSupportIndex, nextP0Ownership);
        if (!next.has(childKey)) {
          next.set(childKey, 0);
          const [p0Residual, p1Residual] = residualPairFromPhysical(g, nextSupport, nextP0Ownership);
          projection[rank + 1].add(residualStateKey(landing.nextSupportIndex, p0Residual, p1Residual));
        }
      }
    }
  }
  return { ranks, projection };
}

function compareReachability(g, automaton, projection) {
  let mismatches = 0;
  const rankSummaries = [];
  for (let rank = 0; rank <= g.cellCount; rank += 1) {
    const direct = automaton.ranks[rank];
    const physical = projection[rank];
    let missingFromDirect = 0;
    let extraInDirect = 0;
    for (const key of physical) if (!direct.has(key)) missingFromDirect += 1;
    for (const key of direct.keys()) if (!physical.has(key)) extraInDirect += 1;
    mismatches += missingFromDirect + extraInDirect;
    rankSummaries.push({ rank, residualStates: direct.size, missingFromDirect, extraInDirect });
  }
  return { mismatches, rankSummaries };
}

function solveResidualAutomaton(g, automaton) {
  const values = Array.from({ length: g.cellCount + 1 }, () => new Map());
  const actionVectors = Array.from({ length: g.cellCount + 1 }, () => new Map());

  for (let rank = g.cellCount; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    for (const [key, state] of automaton.ranks[rank]) {
      const support = g.support[state.supportIndex];
      if (support.landings.length === 0) {
        values[rank].set(key, 0);
        actionVectors[rank].set(key, Array(g.columns).fill(null));
        continue;
      }
      let best = -Infinity;
      const actions = Array(g.columns).fill(null);
      for (const landing of support.landings) {
        const cellBit = (1 << landing.cell) >>> 0;
        const moverResidual = mover === 0 ? state.p0Residual : state.p1Residual;
        const opponentResidual = mover === 0 ? state.p1Residual : state.p0Residual;
        const moved = moverTransition(moverResidual, cellBit);
        let score;
        if (moved.terminal) score = Math.trunc((g.cellCount + 1 - rank) / 2);
        else {
          const blockedOpponent = opponentTransition(opponentResidual, cellBit);
          const p0Residual = mover === 0 ? moved.residuals : blockedOpponent;
          const p1Residual = mover === 1 ? moved.residuals : blockedOpponent;
          const childKey = residualStateKey(landing.nextSupportIndex, p0Residual, p1Residual);
          const child = values[rank + 1].get(childKey);
          assert(child !== undefined, `missing residual child value at rank ${rank}`);
          score = -child;
        }
        actions[landing.column] = score;
        if (score > best) best = score;
      }
      values[rank].set(key, best);
      actionVectors[rank].set(key, actions);
    }
  }
  return { values, actionVectors };
}

function solvePhysicalAndCompare(g, physical, residualSolution) {
  let stateScoreMismatches = 0;
  let actionScoreMismatches = 0;
  let comparedStates = 0;

  for (let rank = g.cellCount; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    for (const key of physical.ranks[rank].keys()) {
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const support = g.support[supportIndex];
      const [p0Residual, p1Residual] = residualPairFromPhysical(g, support, p0Ownership);
      const residualKey = residualStateKey(supportIndex, p0Residual, p1Residual);
      const residualValue = residualSolution.values[rank].get(residualKey);
      const residualActions = residualSolution.actionVectors[rank].get(residualKey);
      assert(residualValue !== undefined && residualActions !== undefined, 'missing projected residual solution');

      let physicalValue = 0;
      const physicalActions = Array(g.columns).fill(null);
      if (support.landings.length > 0) {
        physicalValue = -Infinity;
        for (const landing of support.landings) {
          const nextSupport = g.support[landing.nextSupportIndex];
          const bit = (1 << landing.cell) >>> 0;
          const nextP0Ownership = mover === 0 ? (p0Ownership | bit) >>> 0 : p0Ownership;
          const nextP1Ownership = (nextSupport.occupiedMask ^ nextP0Ownership) >>> 0;
          const moverStoneMask = mover === 0 ? nextP0Ownership : nextP1Ownership;
          let score;
          if (g.terminalPhysical(landing.cell, moverStoneMask)) score = Math.trunc((g.cellCount + 1 - rank) / 2);
          else {
            const [c0, c1] = residualPairFromPhysical(g, nextSupport, nextP0Ownership);
            const childResidualKey = residualStateKey(landing.nextSupportIndex, c0, c1);
            const childValue = residualSolution.values[rank + 1].get(childResidualKey);
            assert(childValue !== undefined, 'missing physical child residual value');
            score = -childValue;
          }
          physicalActions[landing.column] = score;
          if (score > physicalValue) physicalValue = score;
        }
      }

      comparedStates += 1;
      if (physicalValue !== residualValue) stateScoreMismatches += 1;
      for (let column = 0; column < g.columns; column += 1) {
        if (physicalActions[column] !== residualActions[column]) {
          actionScoreMismatches += 1;
          break;
        }
      }
    }
  }

  return { comparedStates, stateScoreMismatches, actionScoreMismatches };
}

function compileFlat(g, automaton) {
  const idByKey = new Map();
  const stateById = [];
  for (let rank = 0; rank <= g.cellCount; rank += 1) {
    for (const [key, state] of automaton.ranks[rank]) {
      const id = stateById.length;
      idByKey.set(key, id);
      stateById.push({ rank, key, state });
    }
  }
  const entryCount = stateById.length * g.columns;
  const targetBytes = stateById.length <= 0xffff ? 2 : 4;
  const flatBytes = entryCount * targetBytes;
  let replayMismatches = 0;

  for (let id = 0; id < stateById.length; id += 1) {
    const { rank, state } = stateById[id];
    const mover = rank & 1;
    const support = g.support[state.supportIndex];
    const landingByColumn = new Map(support.landings.map((landing) => [landing.column, landing]));
    for (let column = 0; column < g.columns; column += 1) {
      const landing = landingByColumn.get(column);
      if (landing === undefined) continue;
      const cellBit = (1 << landing.cell) >>> 0;
      const moverResidual = mover === 0 ? state.p0Residual : state.p1Residual;
      const opponentResidual = mover === 0 ? state.p1Residual : state.p0Residual;
      const moved = moverTransition(moverResidual, cellBit);
      if (moved.terminal) continue;
      const blockedOpponent = opponentTransition(opponentResidual, cellBit);
      const p0Residual = mover === 0 ? moved.residuals : blockedOpponent;
      const p1Residual = mover === 1 ? moved.residuals : blockedOpponent;
      const childKey = residualStateKey(landing.nextSupportIndex, p0Residual, p1Residual);
      if (!idByKey.has(childKey)) replayMismatches += 1;
    }
  }

  return { stateCount: stateById.length, entryCount, targetBytes, flatTransitionBytes: flatBytes, replayMismatches };
}

function runCase(spec) {
  const started = performance.now();
  const g = createGeometry(spec);
  const automaton = buildResidualAutomaton(g);
  const physical = buildPhysicalProjection(g);
  const reachability = compareReachability(g, automaton, physical.projection);
  assert(reachability.mismatches === 0, `${spec.columns}x${spec.rows}: residual reachable-set mismatch`);
  const solution = solveResidualAutomaton(g, automaton);
  const physicalComparison = solvePhysicalAndCompare(g, physical, solution);
  assert(physicalComparison.stateScoreMismatches === 0, 'residual strong state score mismatch');
  assert(physicalComparison.actionScoreMismatches === 0, 'residual action score mismatch');
  const flat = compileFlat(g, automaton);
  assert(flat.replayMismatches === 0, 'flat residual transition replay mismatch');
  return {
    geometry: `${g.columns}x${g.rows}:c${g.connect}`,
    residualStates: flat.stateCount,
    residualTransitionEdges: automaton.transitionEdges,
    residualTerminalEdges: automaton.terminalEdges,
    reachableSetMismatches: reachability.mismatches,
    comparedPhysicalStates: physicalComparison.comparedStates,
    stateScoreMismatches: physicalComparison.stateScoreMismatches,
    actionScoreMismatches: physicalComparison.actionScoreMismatches,
    flatTransitionEntries: flat.entryCount,
    flatTargetBytes: flat.targetBytes,
    flatTransitionBytes: flat.flatTransitionBytes,
    flatReplayMismatches: flat.replayMismatches,
    rankSummaries: reachability.rankSummaries,
    elapsedMs: performance.now() - started,
  };
}

const results = [];
for (const spec of CASES) {
  const result = runCase(spec);
  results.push(result);
  console.error(`[semantic-quotient MQ4] ${result.geometry} residualStates=${result.residualStates} transitionBytes=${result.flatTransitionBytes} reachMismatch=${result.reachableSetMismatches} stateMismatch=${result.stateScoreMismatches} actionMismatch=${result.actionScoreMismatches} elapsedMs=${result.elapsedMs.toFixed(1)}`);
  if (global.gc) global.gc();
}

console.log(JSON.stringify({
  kind: 'connect4-semantic-quotient-mq4-residual-automaton',
  status: 'pass',
  transitionLaw: 'support + minimal residual antichain pair + labeled column -> terminal score or next residual state',
  claims: {
    directResidualReachabilityEqualsPhysicalProjection: true,
    exactStrongStateScoreEquivalent: true,
    exactPerColumnActionScoreEquivalent: true,
    flatDenseTransitionReplayComplete: true,
    productionSolverClaim: false,
    standard7x6Claim: false
  },
  cases: results,
}, null, 2));
