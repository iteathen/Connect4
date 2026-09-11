import { createBsfpSupportLatticeProfile } from '../../../../components/bsfp/support-lattice.mjs';
import {
  createResidualState,
  createResidualWinspaceProfile,
  normalizeResidualRequirements,
  residualStateKey,
} from '../../../../components/bsfp/residual-winspace.mjs';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sign(value) {
  return value < 0 ? -1 : value > 0 ? 1 : 0;
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return sorted[index];
}

function createExperimentGeometry(spec) {
  const support = createBsfpSupportLatticeProfile(spec);
  const residual = createResidualWinspaceProfile(spec);
  const { columns, rows, connect } = spec;
  const cellCount = columns * rows;
  assert(cellCount <= 20, 'SIU-1 physical oracle is intentionally bounded to <=20 cells');

  const fullCellMask = (1 << cellCount) - 1;
  const cellMaskCapacity = 2 ** cellCount;
  const lineMasks = residual.winningLineMasks.map((mask) => Number(mask));
  const lineIncidence = Array.from({ length: cellCount }, () => []);
  for (const lineMask of lineMasks) {
    for (let cell = 0; cell < cellCount; cell += 1) {
      const bit = 1 << cell;
      if ((lineMask & bit) !== 0) lineIncidence[cell].push(lineMask);
    }
  }

  const supportMeta = Array.from({ length: support.itemCapacity });
  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
    const heights = support.decodeHeights(supportIndex);
    let universeMask = 0;
    const landings = Array(columns).fill(null);
    for (let column = 0; column < columns; column += 1) {
      const height = heights[column];
      for (let row = 0; row < height; row += 1) {
        universeMask |= 1 << (row * columns + column);
      }
      if (height < rows) {
        landings[column] = Object.freeze({
          column,
          landingCell: height * columns + column,
          childSupportIndex: supportIndex + support.weights[column],
        });
      }
    }
    supportMeta[supportIndex] = Object.freeze({
      rank: support.ranks[supportIndex],
      heights,
      universeMask: universeMask >>> 0,
      landings: Object.freeze(landings),
    });
  }

  function physicalKey(supportIndex, p0Ownership) {
    return supportIndex * cellMaskCapacity + (p0Ownership >>> 0);
  }

  function decodePhysicalKey(key) {
    const supportIndex = Math.floor(key / cellMaskCapacity);
    return Object.freeze({
      supportIndex,
      p0Ownership: (key - supportIndex * cellMaskCapacity) >>> 0,
    });
  }

  function isPhysicalTerminalWin(landingCell, moverOwnership) {
    for (const lineMask of lineIncidence[landingCell]) {
      if ((moverOwnership & lineMask) === lineMask) return true;
    }
    return false;
  }

  function relationalFromPhysical(supportIndex, p0Ownership) {
    const meta = supportMeta[supportIndex];
    const p1Ownership = (meta.universeMask ^ p0Ownership) >>> 0;
    const emptyMask = (fullCellMask & ~meta.universeMask) >>> 0;
    const p0Requirements = [];
    const p1Requirements = [];

    for (const lineMask of lineMasks) {
      const residualMask = (lineMask & emptyMask) >>> 0;
      if ((lineMask & p1Ownership) === 0) {
        assert(residualMask !== 0, 'nonterminal physical state contains an already completed P0 line');
        p0Requirements.push(BigInt(residualMask));
      }
      if ((lineMask & p0Ownership) === 0) {
        assert(residualMask !== 0, 'nonterminal physical state contains an already completed P1 line');
        p1Requirements.push(BigInt(residualMask));
      }
    }

    return createResidualState({
      supportIndex,
      sideToMove: meta.rank & 1,
      p0Requirements: normalizeResidualRequirements(p0Requirements),
      p1Requirements: normalizeResidualRequirements(p1Requirements),
    });
  }

  function applyRelationalMove(state, column) {
    const normalized = createResidualState(state);
    const meta = supportMeta[normalized.supportIndex];
    assert(normalized.sideToMove === (meta.rank & 1), 'relational side-to-move disagrees with BSFP support rank');
    if (!Number.isInteger(column) || column < 0 || column >= columns) return Object.freeze({ kind: 'illegal' });
    const landing = meta.landings[column];
    if (landing === null) return Object.freeze({ kind: 'illegal' });

    const placed = residual.applyPlacement({
      p0Requirements: normalized.p0Requirements,
      p1Requirements: normalized.p1Requirements,
      mover: normalized.sideToMove,
      landingCell: landing.landingCell,
    });

    if (placed.kind === 'terminal-win') {
      return Object.freeze({
        kind: 'terminal-win',
        winner: placed.winner,
        column,
        landingCell: landing.landingCell,
      });
    }

    return Object.freeze({
      kind: 'nonterminal',
      column,
      landingCell: landing.landingCell,
      state: createResidualState({
        supportIndex: landing.childSupportIndex,
        sideToMove: normalized.sideToMove ^ 1,
        p0Requirements: placed.p0Requirements,
        p1Requirements: placed.p1Requirements,
      }),
    });
  }

  return Object.freeze({
    ...spec,
    cellCount,
    cellMaskCapacity,
    support,
    residual,
    supportMeta,
    physicalKey,
    decodePhysicalKey,
    isPhysicalTerminalWin,
    relationalFromPhysical,
    applyRelationalMove,
  });
}

function buildRelationalDag(g) {
  const states = [];
  const keys = [];
  const idByKey = new Map();
  const rankIds = Array.from({ length: g.cellCount + 1 }, () => []);
  const edgeTable = [];
  const incoming = [];
  let terminalEdges = 0;
  let nonterminalEdges = 0;

  function intern(state) {
    const normalized = createResidualState(state);
    const key = residualStateKey(normalized);
    const existing = idByKey.get(key);
    if (existing !== undefined) return existing;
    const id = states.length;
    const rank = g.supportMeta[normalized.supportIndex].rank;
    assert(normalized.sideToMove === (rank & 1), 'interned relational state has inconsistent side-to-move');
    states.push(normalized);
    keys.push(key);
    idByKey.set(key, id);
    rankIds[rank].push(id);
    edgeTable.push(Array(g.columns).fill(null));
    incoming.push([]);
    return id;
  }

  const rootRequirements = g.residual.initialRequirements;
  const rootId = intern(createResidualState({
    supportIndex: 0,
    sideToMove: 0,
    p0Requirements: rootRequirements,
    p1Requirements: rootRequirements,
  }));

  for (let rank = 0; rank <= g.cellCount; rank += 1) {
    for (const id of rankIds[rank]) {
      const state = states[id];
      for (let column = 0; column < g.columns; column += 1) {
        const transition = g.applyRelationalMove(state, column);
        if (transition.kind === 'illegal') continue;
        if (transition.kind === 'terminal-win') {
          edgeTable[id][column] = -1;
          terminalEdges += 1;
          continue;
        }
        const childId = intern(transition.state);
        edgeTable[id][column] = childId;
        incoming[childId].push(id * g.columns + column);
        nonterminalEdges += 1;
      }
    }
  }

  return Object.freeze({
    rootId,
    states,
    keys,
    idByKey,
    rankIds,
    edgeTable,
    incoming,
    terminalEdges,
    nonterminalEdges,
  });
}

function solveRelationalStrong(g, dag) {
  const values = new Int16Array(dag.states.length);
  const actionScores = Array.from({ length: dag.states.length }, () => Array(g.columns).fill(null));

  for (let rank = g.cellCount; rank >= 0; rank -= 1) {
    for (const id of dag.rankIds[rank]) {
      let best = -Infinity;
      let legal = 0;
      for (let column = 0; column < g.columns; column += 1) {
        const target = dag.edgeTable[id][column];
        if (target === null) continue;
        legal += 1;
        const score = target === -1
          ? Math.trunc((g.cellCount + 1 - rank) / 2)
          : -values[target];
        actionScores[id][column] = score;
        if (score > best) best = score;
      }
      values[id] = legal === 0 ? 0 : best;
    }
  }

  return Object.freeze({ values, actionScores });
}

function solveRelationalWdlByReverseClosure(g, dag) {
  const UNKNOWN = 2;
  const outcomes = new Int8Array(dag.states.length);
  outcomes.fill(UNKNOWN);
  const remaining = new Uint8Array(dag.states.length);
  const hasDraw = new Uint8Array(dag.states.length);
  const queue = [];

  for (let id = 0; id < dag.states.length; id += 1) {
    let legal = 0;
    let nonterminal = 0;
    let immediateWin = false;
    for (const target of dag.edgeTable[id]) {
      if (target === null) continue;
      legal += 1;
      if (target === -1) immediateWin = true;
      else nonterminal += 1;
    }
    remaining[id] = nonterminal;
    if (immediateWin) {
      outcomes[id] = 1;
      queue.push(id);
    } else if (legal === 0) {
      outcomes[id] = 0;
      queue.push(id);
    }
  }

  let cursor = 0;
  while (cursor < queue.length) {
    const childId = queue[cursor++];
    const childOutcome = outcomes[childId];
    for (const packed of dag.incoming[childId]) {
      const parentId = Math.floor(packed / g.columns);
      if (outcomes[parentId] !== UNKNOWN) continue;
      const actionOutcome = -childOutcome;
      if (actionOutcome === 1) {
        outcomes[parentId] = 1;
        queue.push(parentId);
        continue;
      }
      if (actionOutcome === 0) hasDraw[parentId] = 1;
      assert(remaining[parentId] > 0, 'reverse closure consumed too many child obligations');
      remaining[parentId] -= 1;
      if (remaining[parentId] === 0) {
        outcomes[parentId] = hasDraw[parentId] ? 0 : -1;
        queue.push(parentId);
      }
    }
  }

  let unresolved = 0;
  for (const outcome of outcomes) if (outcome === UNKNOWN) unresolved += 1;
  return Object.freeze({ outcomes, unresolved, finalized: queue.length });
}

function analyzeReverseRelation(g, dag) {
  let childrenWithMultipleParents = 0;
  let maximumParentsPerChild = 0;
  let childColumnPairs = 0;
  let ambiguousChildColumnPairs = 0;
  let maximumParentsPerChildColumn = 0;
  let ambiguousIncomingEdges = 0;

  for (let childId = 0; childId < dag.incoming.length; childId += 1) {
    const incoming = dag.incoming[childId];
    const parentSet = new Set();
    const byColumn = Array.from({ length: g.columns }, () => new Set());
    for (const packed of incoming) {
      const parentId = Math.floor(packed / g.columns);
      const column = packed - parentId * g.columns;
      parentSet.add(parentId);
      byColumn[column].add(parentId);
    }
    if (parentSet.size > 1) childrenWithMultipleParents += 1;
    maximumParentsPerChild = Math.max(maximumParentsPerChild, parentSet.size);
    for (const parents of byColumn) {
      if (parents.size === 0) continue;
      childColumnPairs += 1;
      maximumParentsPerChildColumn = Math.max(maximumParentsPerChildColumn, parents.size);
      if (parents.size > 1) {
        ambiguousChildColumnPairs += 1;
        ambiguousIncomingEdges += parents.size;
      }
    }
  }

  const reverseCsrBytes = (dag.states.length + 1) * 4 + dag.nonterminalEdges * 4;
  const forwardDenseBytes = dag.states.length * g.columns * 4;

  return Object.freeze({
    childrenWithMultipleParents,
    maximumParentsPerChild,
    childColumnPairs,
    ambiguousChildColumnPairs,
    maximumParentsPerChildColumn,
    ambiguousIncomingEdges,
    childColumnFunctionalFraction: childColumnPairs === 0 ? 1 : 1 - ambiguousChildColumnPairs / childColumnPairs,
    reverseCsrBytes,
    forwardDenseBytes,
  });
}

function enumeratePhysicalStates(g, dag) {
  const ranks = Array.from({ length: g.cellCount + 1 }, () => new Map());
  const projectionCounts = new Uint32Array(dag.states.length);
  let projectionMismatches = 0;
  let transitionMismatches = 0;
  let terminalMismatches = 0;

  ranks[0].set(g.physicalKey(0, 0), 0);

  for (let rank = 0; rank <= g.cellCount; rank += 1) {
    const mover = rank & 1;
    for (const key of ranks[rank].keys()) {
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const state = g.relationalFromPhysical(supportIndex, p0Ownership);
      const relationalId = dag.idByKey.get(residualStateKey(state));
      if (relationalId === undefined) {
        projectionMismatches += 1;
        continue;
      }
      projectionCounts[relationalId] += 1;

      const meta = g.supportMeta[supportIndex];
      for (let column = 0; column < g.columns; column += 1) {
        const landing = meta.landings[column];
        if (landing === null) continue;
        const bit = 1 << landing.landingCell;
        const childMeta = g.supportMeta[landing.childSupportIndex];
        const nextP0 = mover === 0 ? (p0Ownership | bit) >>> 0 : p0Ownership;
        const nextP1 = (childMeta.universeMask ^ nextP0) >>> 0;
        const moverOwnership = mover === 0 ? nextP0 : nextP1;
        const physicalTerminal = g.isPhysicalTerminalWin(landing.landingCell, moverOwnership);
        const relationalTransition = g.applyRelationalMove(state, column);

        if (physicalTerminal) {
          if (relationalTransition.kind !== 'terminal-win') terminalMismatches += 1;
          continue;
        }
        if (relationalTransition.kind !== 'nonterminal') {
          terminalMismatches += 1;
          continue;
        }

        const childRelational = g.relationalFromPhysical(landing.childSupportIndex, nextP0);
        if (residualStateKey(childRelational) !== residualStateKey(relationalTransition.state)) {
          transitionMismatches += 1;
        }
        const childKey = g.physicalKey(landing.childSupportIndex, nextP0);
        if (!ranks[rank + 1].has(childKey)) ranks[rank + 1].set(childKey, 0);
      }
    }
  }

  return Object.freeze({
    ranks,
    projectionCounts,
    projectionMismatches,
    transitionMismatches,
    terminalMismatches,
  });
}

function solvePhysicalAndCompare(g, dag, relational, physical, bsfp) {
  let physicalStateCount = 0;
  let stateScoreMismatches = 0;
  let actionScoreMismatches = 0;
  let bsfpWdlMismatches = 0;

  for (let rank = g.cellCount; rank >= 0; rank -= 1) {
    const mover = rank & 1;
    for (const key of physical.ranks[rank].keys()) {
      physicalStateCount += 1;
      const { supportIndex, p0Ownership } = g.decodePhysicalKey(key);
      const meta = g.supportMeta[supportIndex];
      const relationalState = g.relationalFromPhysical(supportIndex, p0Ownership);
      const relationalId = dag.idByKey.get(residualStateKey(relationalState));
      assert(relationalId !== undefined, 'physical state is missing from relational DAG');

      let best = -Infinity;
      let legal = 0;
      const physicalActions = Array(g.columns).fill(null);
      for (let column = 0; column < g.columns; column += 1) {
        const landing = meta.landings[column];
        if (landing === null) continue;
        legal += 1;
        const bit = 1 << landing.landingCell;
        const childMeta = g.supportMeta[landing.childSupportIndex];
        const nextP0 = mover === 0 ? (p0Ownership | bit) >>> 0 : p0Ownership;
        const nextP1 = (childMeta.universeMask ^ nextP0) >>> 0;
        const moverOwnership = mover === 0 ? nextP0 : nextP1;
        let score;
        if (g.isPhysicalTerminalWin(landing.landingCell, moverOwnership)) {
          score = Math.trunc((g.cellCount + 1 - rank) / 2);
        } else {
          const childKey = g.physicalKey(landing.childSupportIndex, nextP0);
          const childScore = physical.ranks[rank + 1].get(childKey);
          assert(childScore !== undefined, 'physical child score is unavailable');
          score = -childScore;
        }
        physicalActions[column] = score;
        if (score > best) best = score;
      }
      const physicalScore = legal === 0 ? 0 : best;
      physical.ranks[rank].set(key, physicalScore);

      if (physicalScore !== relational.values[relationalId]) stateScoreMismatches += 1;
      for (let column = 0; column < g.columns; column += 1) {
        if (physicalActions[column] !== relational.actionScores[relationalId][column]) {
          actionScoreMismatches += 1;
          break;
        }
      }

      const p0Expected = mover === 0 ? sign(physicalScore) : -sign(physicalScore);
      const p0Actual = bsfp.evaluate({
        heights: meta.heights,
        p0OwnershipMask: BigInt(p0Ownership),
      });
      if (p0Expected !== p0Actual) bsfpWdlMismatches += 1;
    }
  }

  return Object.freeze({
    physicalStateCount,
    stateScoreMismatches,
    actionScoreMismatches,
    bsfpWdlMismatches,
  });
}

function summarizeMultiplicity(projectionCounts) {
  const counts = [];
  let mergedRelationalStates = 0;
  let physicalStates = 0;
  let maximum = 0;
  for (const count of projectionCounts) {
    if (count === 0) continue;
    counts.push(count);
    physicalStates += count;
    if (count > 1) mergedRelationalStates += 1;
    maximum = Math.max(maximum, count);
  }
  counts.sort((a, b) => a - b);
  return Object.freeze({
    projectedRelationalStates: counts.length,
    physicalStates,
    meanPhysicalStatesPerRelationalState: counts.length === 0 ? 0 : physicalStates / counts.length,
    mergedRelationalStates,
    maximumPhysicalStatesPerRelationalState: maximum,
    p50PhysicalStatesPerRelationalState: percentile(counts, 0.50),
    p95PhysicalStatesPerRelationalState: percentile(counts, 0.95),
    p99PhysicalStatesPerRelationalState: percentile(counts, 0.99),
  });
}

function runCase(spec) {
  const started = performance.now();
  const g = createExperimentGeometry(spec);
  const relationalDag = buildRelationalDag(g);
  const relationalStrong = solveRelationalStrong(g, relationalDag);
  const reverseWdl = solveRelationalWdlByReverseClosure(g, relationalDag);
  assert(reverseWdl.unresolved === 0, 'reverse relational W/D/L closure left unresolved states');

  let reverseVsStrongMismatches = 0;
  for (let id = 0; id < relationalDag.states.length; id += 1) {
    if (reverseWdl.outcomes[id] !== sign(relationalStrong.values[id])) reverseVsStrongMismatches += 1;
  }

  const reverseRelation = analyzeReverseRelation(g, relationalDag);
  const physical = enumeratePhysicalStates(g, relationalDag);
  const bsfp = solveBsfpOwnershipAntichainWdl(spec);
  const comparison = solvePhysicalAndCompare(g, relationalDag, relationalStrong, physical, bsfp);
  const multiplicity = summarizeMultiplicity(physical.projectionCounts);

  const rootStrongWdl = sign(relationalStrong.values[relationalDag.rootId]);
  const rootP0Wdl = rootStrongWdl;
  assert(rootP0Wdl === bsfp.rootWdl, 'relational root W/D/L disagrees with BSFP root W/D/L');

  const exactnessMismatches = physical.projectionMismatches
    + physical.transitionMismatches
    + physical.terminalMismatches
    + comparison.stateScoreMismatches
    + comparison.actionScoreMismatches
    + comparison.bsfpWdlMismatches
    + reverseVsStrongMismatches;

  return Object.freeze({
    geometry: `${g.columns}x${g.rows}:c${g.connect}`,
    relationalLanguage: 'supportIndex + sideToMove + normalized P0/P1 residual winning requirements',
    physicalBoardInRelationalEngine: false,
    relationalStates: relationalDag.states.length,
    physicalStates: comparison.physicalStateCount,
    compressionRatioPhysicalToRelational: comparison.physicalStateCount / relationalDag.states.length,
    nonterminalEdges: relationalDag.nonterminalEdges,
    terminalWinEdges: relationalDag.terminalEdges,
    rootWdl: rootP0Wdl,
    bsfpRootWdl: bsfp.rootWdl,
    exactness: Object.freeze({
      physicalProjectionMismatches: physical.projectionMismatches,
      forwardTransitionMismatches: physical.transitionMismatches,
      terminalMismatches: physical.terminalMismatches,
      strongStateScoreMismatches: comparison.stateScoreMismatches,
      actionScoreMismatches: comparison.actionScoreMismatches,
      bsfpWdlMismatches: comparison.bsfpWdlMismatches,
      reverseClosureVsStrongMismatches: reverseVsStrongMismatches,
      unresolvedReverseClosureStates: reverseWdl.unresolved,
      totalMismatches: exactnessMismatches,
    }),
    multiplicity,
    reverseRelation,
    bsfpBoundaryRecords: bsfp.stats.totalBoundaryRecords,
    elapsedMs: performance.now() - started,
  });
}

const results = [];
for (const spec of CASES) {
  const result = runCase(spec);
  results.push(result);
  console.error(
    `[SIU-1 relational] ${result.geometry}`
    + ` physical=${result.physicalStates}`
    + ` relational=${result.relationalStates}`
    + ` ratio=${result.compressionRatioPhysicalToRelational.toFixed(3)}`
    + ` reverseAmbiguousPairs=${result.reverseRelation.ambiguousChildColumnPairs}`
    + ` mismatches=${result.exactness.totalMismatches}`
    + ` elapsedMs=${result.elapsedMs.toFixed(1)}`,
  );
  if (global.gc) global.gc();
}

const totalMismatches = results.reduce((sum, result) => sum + result.exactness.totalMismatches, 0);
const ambiguousCases = results.filter((result) => result.reverseRelation.ambiguousChildColumnPairs > 0).length;
assert(totalMismatches === 0, 'SIU-1 relational exactness mismatch');

console.log(JSON.stringify({
  kind: 'connect4-siu1-relational-dual-direction',
  status: 'pass',
  question: 'Can one BSFP-aligned relational state drive forward exact transitions and backward exact W/D/L closure without colored board state?',
  stateContract: {
    supportIndex: 'BSFP support/accessibility skeleton',
    sideToMove: 'explicit player orientation; must equal support-rank parity in ordinary legal play',
    p0Requirements: 'normalized surviving P0 residual winning-requirement antichain',
    p1Requirements: 'normalized surviving P1 residual winning-requirement antichain',
  },
  claims: {
    forwardEngineUsesRelationalStateOnly: true,
    reverseClosureUsesRelationalIdsAndReverseRelationOnly: true,
    coloredBoardUsedOnlyAsIndependentOracle: true,
    exactOnBoundedCompleteControls: true,
    bsfpWdlAgreementOnAllEnumeratedNonterminalStates: true,
    localReverseTransitionProvedFunctional: ambiguousCases === 0,
    standard7x6Claim: false,
    productionPerformanceClaim: false,
  },
  cases: results,
}, null, 2));
