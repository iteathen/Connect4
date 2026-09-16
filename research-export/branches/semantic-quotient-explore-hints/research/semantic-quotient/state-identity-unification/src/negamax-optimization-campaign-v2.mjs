import { createBsfpSupportLatticeProfile } from '../../../../components/bsfp/support-lattice.mjs';
import {
  createResidualState,
  createResidualWinspaceProfile,
  residualStateKey,
} from '../../../../components/bsfp/residual-winspace.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

const ILLEGAL = -2;
const TERMINAL_WIN = -1;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sign(value) {
  return value < 0 ? -1 : value > 0 ? 1 : 0;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function addMetrics(target, source, prefix = '') {
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'number') target[`${prefix}${key}`] = value;
  }
}

function createGeometry(spec) {
  const support = createBsfpSupportLatticeProfile(spec);
  const residual = createResidualWinspaceProfile(spec);
  const { columns, rows, connect } = spec;
  const cellCount = columns * rows;
  const supportMeta = Array.from({ length: support.itemCapacity });

  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
    const heights = support.decodeHeights(supportIndex);
    const landings = Array(columns).fill(null);
    for (let column = 0; column < columns; column += 1) {
      const height = heights[column];
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
      landings: Object.freeze(landings),
    });
  }

  const centerOrder = Object.freeze(Array.from({ length: columns }, (_, column) => column)
    .sort((a, b) => {
      const center = (columns - 1) / 2;
      const delta = Math.abs(a - center) - Math.abs(b - center);
      return delta !== 0 ? delta : a - b;
    }));
  const centerPriority = new Int8Array(columns);
  for (let index = 0; index < centerOrder.length; index += 1) centerPriority[centerOrder[index]] = index;

  function applyMove(state, column) {
    const meta = supportMeta[state.supportIndex];
    const landing = meta.landings[column];
    if (landing === null || landing === undefined) return Object.freeze({ kind: 'illegal' });
    const placed = residual.applyPlacement({
      p0Requirements: state.p0Requirements,
      p1Requirements: state.p1Requirements,
      mover: state.sideToMove,
      landingCell: landing.landingCell,
    });
    if (placed.kind === 'terminal-win') return Object.freeze({ kind: 'terminal-win' });
    return Object.freeze({
      kind: 'nonterminal',
      state: createResidualState({
        supportIndex: landing.childSupportIndex,
        sideToMove: state.sideToMove ^ 1,
        p0Requirements: placed.p0Requirements,
        p1Requirements: placed.p1Requirements,
      }),
    });
  }

  return Object.freeze({
    ...spec,
    cellCount,
    support,
    residual,
    supportMeta,
    centerOrder,
    centerPriority,
    applyMove,
  });
}

function analyzeTactics(g, dag) {
  const immediateWin = new Int8Array(dag.states.length);
  const forcedColumn = new Int8Array(dag.states.length);
  const doubleThreat = new Uint8Array(dag.states.length);
  immediateWin.fill(-1);
  forcedColumn.fill(-1);

  for (let id = 0; id < dag.states.length; id += 1) {
    const state = dag.states[id];
    const meta = g.supportMeta[state.supportIndex];
    const own = state.sideToMove === 0 ? state.p0Requirements : state.p1Requirements;
    const opponent = state.sideToMove === 0 ? state.p1Requirements : state.p0Requirements;
    const threats = [];

    for (const column of g.centerOrder) {
      const landing = meta.landings[column];
      if (landing === null) continue;
      const bit = 1n << BigInt(landing.landingCell);
      if (own.some((requirement) => requirement === bit)) {
        immediateWin[id] = column;
        break;
      }
      if (opponent.some((requirement) => requirement === bit)) threats.push(column);
    }
    if (immediateWin[id] >= 0) continue;
    const unique = [...new Set(threats)];
    if (unique.length > 1) doubleThreat[id] = 1;
    else if (unique.length === 1) forcedColumn[id] = unique[0];
  }

  return Object.freeze({ immediateWin, forcedColumn, doubleThreat });
}

function buildDag(g) {
  const started = performance.now();
  const states = [];
  const idByKey = new Map();
  const rankIds = Array.from({ length: g.cellCount + 1 }, () => []);
  const edges = [];

  function intern(state) {
    const key = residualStateKey(state);
    const existing = idByKey.get(key);
    if (existing !== undefined) return existing;
    const id = states.length;
    const rank = g.supportMeta[state.supportIndex].rank;
    assert(state.sideToMove === (rank & 1), 'relational state side-to-move/rank mismatch');
    states.push(state);
    idByKey.set(key, id);
    rankIds[rank].push(id);
    const row = new Int32Array(g.columns);
    row.fill(ILLEGAL);
    edges.push(row);
    return id;
  }

  const rootRequirements = g.residual.initialRequirements;
  const rootId = intern(createResidualState({
    supportIndex: 0,
    sideToMove: 0,
    p0Requirements: rootRequirements,
    p1Requirements: rootRequirements,
  }));

  let nonterminalEdges = 0;
  let terminalEdges = 0;
  for (let rank = 0; rank <= g.cellCount; rank += 1) {
    for (const id of rankIds[rank]) {
      const state = states[id];
      for (let column = 0; column < g.columns; column += 1) {
        const transition = g.applyMove(state, column);
        if (transition.kind === 'illegal') continue;
        if (transition.kind === 'terminal-win') {
          edges[id][column] = TERMINAL_WIN;
          terminalEdges += 1;
        } else {
          const childId = intern(transition.state);
          edges[id][column] = childId;
          nonterminalEdges += 1;
        }
      }
    }
  }

  const rankOf = new Uint8Array(states.length);
  for (let id = 0; id < states.length; id += 1) {
    rankOf[id] = g.supportMeta[states[id].supportIndex].rank;
  }

  const dag = { rootId, states, rankIds, edges, rankOf };
  const tactical = analyzeTactics(g, dag);
  return Object.freeze({
    ...dag,
    tactical,
    nonterminalEdges,
    terminalEdges,
    buildMs: performance.now() - started,
  });
}

function strongUpper(g, rank) {
  return Math.trunc((g.cellCount + 1 - rank) / 2);
}

function strongLower(g, rank) {
  return -Math.trunc((g.cellCount - rank) / 2);
}

function solveStrong(g, dag) {
  const values = new Int16Array(dag.states.length);
  for (let rank = g.cellCount; rank >= 0; rank -= 1) {
    for (const id of dag.rankIds[rank]) {
      let best = -32767;
      let legal = 0;
      for (let column = 0; column < g.columns; column += 1) {
        const target = dag.edges[id][column];
        if (target === ILLEGAL) continue;
        legal += 1;
        const score = target === TERMINAL_WIN ? strongUpper(g, rank) : -values[target];
        if (score > best) best = score;
      }
      values[id] = legal === 0 ? 0 : best;
    }
  }
  return values;
}

function tacticalStrongValue(g, dag, id) {
  const rank = dag.rankOf[id];
  if (dag.tactical.immediateWin[id] >= 0) return strongUpper(g, rank);
  if (dag.tactical.doubleThreat[id]) return strongLower(g, rank);
  return null;
}

function makeOrdering(g, dag, config, bestMove, history, killer1, killer2, metrics, id) {
  const forced = dag.tactical.forcedColumn[id];
  if (forced >= 0) {
    metrics.forcedNodes += 1;
    return [forced];
  }

  const remaining = g.cellCount - dag.rankOf[id];
  const seen = new Uint8Array(g.columns);
  const result = [];
  const add = (column, kind) => {
    if (column < 0 || column >= g.columns || seen[column] || dag.edges[id][column] === ILLEGAL) return;
    seen[column] = 1;
    result.push(column);
    if (kind === 'tt') metrics.ttMoveOrderHits += 1;
    else if (kind === 'killer') metrics.killerOrderHits += 1;
  };

  add(bestMove[id], 'tt');
  if (config.dynamicOrdering) {
    add(killer1[remaining], 'killer');
    add(killer2[remaining], 'killer');
  }

  const rest = [];
  for (const column of g.centerOrder) {
    if (!seen[column] && dag.edges[id][column] !== ILLEGAL) rest.push(column);
  }
  if (config.dynamicOrdering) {
    rest.sort((a, b) => {
      const ha = history[remaining * g.columns + a];
      const hb = history[remaining * g.columns + b];
      if (ha !== hb) return hb - ha;
      return g.centerPriority[a] - g.centerPriority[b];
    });
  }
  result.push(...rest);
  return result;
}

function seedStrongBounds(g, dag, config, lower, upper, wdlSeed) {
  if (config.envelope) {
    for (let id = 0; id < dag.states.length; id += 1) {
      const rank = dag.rankOf[id];
      lower[id] = strongLower(g, rank);
      upper[id] = strongUpper(g, rank);
    }
  } else {
    const limit = g.cellCount + 4;
    lower.fill(-limit);
    upper.fill(limit);
  }

  if (wdlSeed) {
    for (let id = 0; id < dag.states.length; id += 1) {
      const lo = wdlSeed.lower[id];
      const hi = wdlSeed.upper[id];
      if (lo >= 1) lower[id] = Math.max(lower[id], 1);
      else if (lo >= 0) lower[id] = Math.max(lower[id], 0);
      if (hi <= -1) upper[id] = Math.min(upper[id], -1);
      else if (hi <= 0) upper[id] = Math.min(upper[id], 0);
      if (lo === 0 && hi === 0) {
        lower[id] = 0;
        upper[id] = 0;
      }
    }
  }
}

function makeStrongNegamax(g, dag, strong, config, wdlSeed = null) {
  const lower = new Int16Array(dag.states.length);
  const upper = new Int16Array(dag.states.length);
  const bestMove = new Int8Array(dag.states.length);
  bestMove.fill(-1);
  seedStrongBounds(g, dag, config, lower, upper, wdlSeed);

  const history = new Int32Array((g.cellCount + 1) * g.columns);
  const killer1 = new Int8Array(g.cellCount + 1);
  const killer2 = new Int8Array(g.cellCount + 1);
  killer1.fill(-1);
  killer2.fill(-1);

  const metrics = {
    calls: 0,
    expanded: 0,
    ttExactReturns: 0,
    ttBoundReturns: 0,
    ttMoveOrderHits: 0,
    cutoffs: 0,
    firstMoveCutoffs: 0,
    tacticalExact: 0,
    forcedNodes: 0,
    etcProbes: 0,
    etcCutoffs: 0,
    childBoundReorders: 0,
    historyUpdates: 0,
    killerOrderHits: 0,
    bsfpHits: 0,
  };

  function childBounds(target) {
    if (target < 0) return null;
    return { lower: lower[target], upper: upper[target] };
  }

  function search(id, alpha, beta) {
    metrics.calls += 1;

    if (config.bsfpCutRank !== null && dag.rankOf[id] >= config.bsfpCutRank) {
      metrics.bsfpHits += 1;
      return strong[id];
    }

    const tactical = tacticalStrongValue(g, dag, id);
    if (tactical !== null) {
      assert(tactical === strong[id], `tactical strong mismatch at ${id}`);
      lower[id] = tactical;
      upper[id] = tactical;
      metrics.tacticalExact += 1;
      return tactical;
    }

    if (lower[id] === upper[id]) {
      metrics.ttExactReturns += 1;
      return lower[id];
    }
    if (lower[id] >= beta) {
      metrics.ttBoundReturns += 1;
      return config.failHard ? beta : lower[id];
    }
    if (upper[id] <= alpha) {
      metrics.ttBoundReturns += 1;
      return config.failHard ? alpha : upper[id];
    }

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower[id]);
    beta = Math.min(beta, upper[id]);

    let columns = makeOrdering(g, dag, config, bestMove, history, killer1, killer2, metrics, id);
    if (columns.length === 0) {
      lower[id] = 0;
      upper[id] = 0;
      return 0;
    }

    const remainingForEtc = g.cellCount - dag.rankOf[id];
    const etcActive = config.etc && remainingForEtc >= (config.etcMinRemaining ?? 0);
    if (etcActive || config.childBoundOrder) {
      const decorated = [];
      for (const column of columns) {
        const target = dag.edges[id][column];
        if (target === TERMINAL_WIN) {
          decorated.push({ column, parentLower: strongUpper(g, dag.rankOf[id]), parentUpper: strongUpper(g, dag.rankOf[id]) });
          continue;
        }
        metrics.etcProbes += 1;
        const bounds = childBounds(target);
        const parentLower = -bounds.upper;
        const parentUpper = -bounds.lower;
        if (etcActive && parentLower >= beta) {
          metrics.etcCutoffs += 1;
          bestMove[id] = column;
          lower[id] = Math.max(lower[id], parentLower);
          return config.failHard ? beta : parentLower;
        }
        decorated.push({ column, parentLower, parentUpper });
      }
      if (config.childBoundOrder) {
        const before = columns.join(',');
        decorated.sort((a, b) => {
          if (a.parentLower !== b.parentLower) return b.parentLower - a.parentLower;
          if (a.parentUpper !== b.parentUpper) return b.parentUpper - a.parentUpper;
          return columns.indexOf(a.column) - columns.indexOf(b.column);
        });
        columns = decorated.map((entry) => entry.column);
        if (columns.join(',') !== before) metrics.childBoundReorders += 1;
      }
    }

    metrics.expanded += 1;
    let value = -(g.cellCount + 4);
    let selected = -1;
    let moveIndex = 0;
    for (const column of columns) {
      const target = dag.edges[id][column];
      const score = target === TERMINAL_WIN
        ? strongUpper(g, dag.rankOf[id])
        : -search(target, -beta, -alpha);
      if (score > value) {
        value = score;
        selected = column;
      }
      if (value > alpha) alpha = value;
      if (alpha >= beta) {
        metrics.cutoffs += 1;
        if (moveIndex === 0) metrics.firstMoveCutoffs += 1;
        if (config.dynamicOrdering) {
          const remaining = g.cellCount - dag.rankOf[id];
          const index = remaining * g.columns + column;
          history[index] += Math.max(1, remaining * remaining);
          metrics.historyUpdates += 1;
          if (killer1[remaining] !== column) {
            killer2[remaining] = killer1[remaining];
            killer1[remaining] = column;
          }
        }
        break;
      }
      moveIndex += 1;
    }

    if (selected >= 0) bestMove[id] = selected;
    if (value <= originalAlpha) upper[id] = Math.min(upper[id], value);
    else if (value >= originalBeta) lower[id] = Math.max(lower[id], value);
    else {
      lower[id] = value;
      upper[id] = value;
    }

    if (!config.failHard) return value;
    if (value <= originalAlpha) return originalAlpha;
    if (value >= originalBeta) return originalBeta;
    return value;
  }

  function run() {
    const alpha = config.envelope ? strongLower(g, 0) - 1 : -(g.cellCount + 4);
    const beta = config.envelope ? strongUpper(g, 0) + 1 : g.cellCount + 4;
    return search(dag.rootId, alpha, beta);
  }

  return { run, metrics, lower, upper };
}

function makeWdlNegamax(g, dag, strong, config) {
  const lower = new Int8Array(dag.states.length);
  const upper = new Int8Array(dag.states.length);
  const bestMove = new Int8Array(dag.states.length);
  lower.fill(-1);
  upper.fill(1);
  bestMove.fill(-1);
  const history = new Int32Array((g.cellCount + 1) * g.columns);
  const killer1 = new Int8Array(g.cellCount + 1);
  const killer2 = new Int8Array(g.cellCount + 1);
  killer1.fill(-1);
  killer2.fill(-1);

  const metrics = {
    calls: 0,
    expanded: 0,
    ttExactReturns: 0,
    ttBoundReturns: 0,
    ttMoveOrderHits: 0,
    cutoffs: 0,
    firstMoveCutoffs: 0,
    tacticalExact: 0,
    forcedNodes: 0,
    etcProbes: 0,
    etcCutoffs: 0,
    childBoundReorders: 0,
    historyUpdates: 0,
    killerOrderHits: 0,
    bsfpHits: 0,
    thresholdPasses: 0,
  };

  function search(id, alpha, beta) {
    metrics.calls += 1;
    if (config.bsfpCutRank !== null && dag.rankOf[id] >= config.bsfpCutRank) {
      metrics.bsfpHits += 1;
      return sign(strong[id]);
    }

    const tactical = tacticalStrongValue(g, dag, id);
    if (tactical !== null) {
      const value = sign(tactical);
      lower[id] = value;
      upper[id] = value;
      metrics.tacticalExact += 1;
      return value;
    }

    if (lower[id] === upper[id]) {
      metrics.ttExactReturns += 1;
      return lower[id];
    }
    if (lower[id] >= beta) {
      metrics.ttBoundReturns += 1;
      return lower[id];
    }
    if (upper[id] <= alpha) {
      metrics.ttBoundReturns += 1;
      return upper[id];
    }

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower[id]);
    beta = Math.min(beta, upper[id]);

    let columns = makeOrdering(g, dag, config, bestMove, history, killer1, killer2, metrics, id);
    if (columns.length === 0) {
      lower[id] = 0;
      upper[id] = 0;
      return 0;
    }

    const remainingForEtc = g.cellCount - dag.rankOf[id];
    const etcActive = config.etc && remainingForEtc >= (config.etcMinRemaining ?? 0);
    if (etcActive || config.childBoundOrder) {
      const decorated = [];
      for (const column of columns) {
        const target = dag.edges[id][column];
        if (target === TERMINAL_WIN) {
          decorated.push({ column, parentLower: 1, parentUpper: 1 });
          continue;
        }
        metrics.etcProbes += 1;
        const parentLower = -upper[target];
        const parentUpper = -lower[target];
        if (etcActive && parentLower >= beta) {
          metrics.etcCutoffs += 1;
          bestMove[id] = column;
          lower[id] = Math.max(lower[id], parentLower);
          return parentLower;
        }
        decorated.push({ column, parentLower, parentUpper });
      }
      if (config.childBoundOrder) {
        const before = columns.join(',');
        const priorIndex = new Int8Array(g.columns);
        for (let i = 0; i < columns.length; i += 1) priorIndex[columns[i]] = i;
        decorated.sort((a, b) => {
          if (a.parentLower !== b.parentLower) return b.parentLower - a.parentLower;
          if (a.parentUpper !== b.parentUpper) return b.parentUpper - a.parentUpper;
          return priorIndex[a.column] - priorIndex[b.column];
        });
        columns = decorated.map((entry) => entry.column);
        if (columns.join(',') !== before) metrics.childBoundReorders += 1;
      }
    }

    metrics.expanded += 1;
    let value = -2;
    let selected = -1;
    let moveIndex = 0;
    for (const column of columns) {
      const target = dag.edges[id][column];
      const score = target === TERMINAL_WIN ? 1 : -search(target, -beta, -alpha);
      if (score > value) {
        value = score;
        selected = column;
      }
      if (value > alpha) alpha = value;
      if (alpha >= beta) {
        metrics.cutoffs += 1;
        if (moveIndex === 0) metrics.firstMoveCutoffs += 1;
        if (config.dynamicOrdering) {
          const remaining = g.cellCount - dag.rankOf[id];
          history[remaining * g.columns + column] += Math.max(1, remaining * remaining);
          metrics.historyUpdates += 1;
          if (killer1[remaining] !== column) {
            killer2[remaining] = killer1[remaining];
            killer1[remaining] = column;
          }
        }
        break;
      }
      moveIndex += 1;
    }

    if (selected >= 0) bestMove[id] = selected;
    if (value <= originalAlpha) upper[id] = Math.min(upper[id], value);
    else if (value >= originalBeta) lower[id] = Math.max(lower[id], value);
    else {
      lower[id] = value;
      upper[id] = value;
    }
    return value;
  }

  return {
    run() {
      if (config.wdlMode === 'threshold') {
        let value = search(dag.rootId, 0, 1);
        metrics.thresholdPasses += 1;
        if (value >= 1) return 1;
        value = search(dag.rootId, -1, 0);
        metrics.thresholdPasses += 1;
        return value >= 0 ? 0 : -1;
      }
      return search(dag.rootId, -2, 2);
    },
    metrics,
    lower,
    upper,
  };
}

function runRepeated(factory, expected, repeats = 3) {
  const elapsed = [];
  let result = null;
  let metrics = null;
  let state = null;
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    const instance = factory();
    const started = performance.now();
    result = instance.run();
    elapsed.push(performance.now() - started);
    metrics = instance.metrics;
    state = instance;
    assert(result === expected, `candidate result mismatch: expected ${expected}, got ${result}`);
  }
  return { result, elapsedMsMedian: median(elapsed), metrics, state };
}

function strongCandidate(g, dag, strong, name, config, repeats = 3) {
  const run = runRepeated(() => makeStrongNegamax(g, dag, strong, config), strong[dag.rootId], repeats);
  return {
    name,
    contract: 'strong-distance',
    config,
    result: run.result,
    elapsedMsMedian: run.elapsedMsMedian,
    metrics: run.metrics,
  };
}

function wdlCandidate(g, dag, strong, name, config, repeats = 3) {
  const run = runRepeated(() => makeWdlNegamax(g, dag, strong, config), sign(strong[dag.rootId]), repeats);
  return {
    name,
    contract: 'wdl',
    config,
    result: run.result,
    elapsedMsMedian: run.elapsedMsMedian,
    metrics: run.metrics,
  };
}

function runCase(spec) {
  const g = createGeometry(spec);
  const dag = buildDag(g);
  const strong = solveStrong(g, dag);
  const rootStrong = strong[dag.rootId];
  const rootWdl = sign(rootStrong);
  const cutRank = Math.round(g.cellCount * 0.5);

  const base = {
    envelope: false,
    etc: false,
    etcMinRemaining: 0,
    childBoundOrder: false,
    dynamicOrdering: false,
    failHard: false,
    wdlMode: 'full',
    bsfpCutRank: null,
  };

  const candidates = [
    strongCandidate(g, dag, strong, 'S0-strong-negamax-baseline', base),
    strongCandidate(g, dag, strong, 'S1-strong-etc-all-nodes', { ...base, etc: true }),
    strongCandidate(g, dag, strong, 'S2-strong-etc-interior-only', { ...base, etc: true, etcMinRemaining: 3 }),
    strongCandidate(g, dag, strong, 'S3-strong-envelope-plus-etc', { ...base, envelope: true, etc: true }),
    wdlCandidate(g, dag, strong, 'W0-wdl-full-window', base),
    wdlCandidate(g, dag, strong, 'W1-wdl-full-window-etc', { ...base, etc: true }),
    wdlCandidate(g, dag, strong, 'W2-wdl-full-window-etc-interior', { ...base, etc: true, etcMinRemaining: 3 }),
    wdlCandidate(g, dag, strong, 'T0-wdl-two-threshold', { ...base, wdlMode: 'threshold' }),
    wdlCandidate(g, dag, strong, 'T1-wdl-two-threshold-etc', { ...base, wdlMode: 'threshold', etc: true }),
    wdlCandidate(g, dag, strong, 'T2-wdl-two-threshold-etc-interior', { ...base, wdlMode: 'threshold', etc: true, etcMinRemaining: 3 }),
    strongCandidate(g, dag, strong, 'H0-strong-etc-with-ideal-bsfp-wall', {
      ...base,
      etc: true,
      bsfpCutRank: cutRank,
    }),
    wdlCandidate(g, dag, strong, 'H1-wdl-threshold-etc-with-ideal-bsfp-wall', {
      ...base,
      wdlMode: 'threshold',
      etc: true,
      bsfpCutRank: cutRank,
    }),
  ];

  const byName = Object.fromEntries(candidates.map((candidate) => [candidate.name, candidate]));
  console.error(
    `[negamax-opt-v2] ${g.columns}x${g.rows}:c${g.connect}`
    + ` states=${dag.states.length}`
    + ` rootStrong=${rootStrong}`
    + ` rootWdl=${rootWdl}`
    + ` S0=${byName['S0-strong-negamax-baseline'].metrics.expanded}`
    + ` S1=${byName['S1-strong-etc-all-nodes'].metrics.expanded}`
    + ` S2=${byName['S2-strong-etc-interior-only'].metrics.expanded}`
    + ` W0=${byName['W0-wdl-full-window'].metrics.expanded}`
    + ` W1=${byName['W1-wdl-full-window-etc'].metrics.expanded}`
    + ` T0=${byName['T0-wdl-two-threshold'].metrics.expanded}`
    + ` T1=${byName['T1-wdl-two-threshold-etc'].metrics.expanded}`
    + ` H1=${byName['H1-wdl-threshold-etc-with-ideal-bsfp-wall'].metrics.expanded}`,
  );

  return {
    geometry: `${g.columns}x${g.rows}:c${g.connect}`,
    relationalStates: dag.states.length,
    graphBuildMs: dag.buildMs,
    rootStrong,
    rootWdl,
    idealBsfpCutRank: cutRank,
    candidates,
  };
}

const cases = [];
for (const spec of CASES) {
  cases.push(runCase(spec));
  if (global.gc) global.gc();
}

const compactSummary = cases.map((entry) => {
  const c = Object.fromEntries(entry.candidates.map((candidate) => [candidate.name, candidate]));
  return {
    geometry: entry.geometry,
    rootStrong: entry.rootStrong,
    rootWdl: entry.rootWdl,
    expanded: {
      S0: c['S0-strong-negamax-baseline'].metrics.expanded,
      S1: c['S1-strong-etc-all-nodes'].metrics.expanded,
      S2: c['S2-strong-etc-interior-only'].metrics.expanded,
      S3: c['S3-strong-envelope-plus-etc'].metrics.expanded,
      W0: c['W0-wdl-full-window'].metrics.expanded,
      W1: c['W1-wdl-full-window-etc'].metrics.expanded,
      W2: c['W2-wdl-full-window-etc-interior'].metrics.expanded,
      T0: c['T0-wdl-two-threshold'].metrics.expanded,
      T1: c['T1-wdl-two-threshold-etc'].metrics.expanded,
      T2: c['T2-wdl-two-threshold-etc-interior'].metrics.expanded,
      H0: c['H0-strong-etc-with-ideal-bsfp-wall'].metrics.expanded,
      H1: c['H1-wdl-threshold-etc-with-ideal-bsfp-wall'].metrics.expanded,
    },
    elapsedMsMedian: {
      S0: c['S0-strong-negamax-baseline'].elapsedMsMedian,
      S1: c['S1-strong-etc-all-nodes'].elapsedMsMedian,
      S2: c['S2-strong-etc-interior-only'].elapsedMsMedian,
      S3: c['S3-strong-envelope-plus-etc'].elapsedMsMedian,
      W0: c['W0-wdl-full-window'].elapsedMsMedian,
      W1: c['W1-wdl-full-window-etc'].elapsedMsMedian,
      W2: c['W2-wdl-full-window-etc-interior'].elapsedMsMedian,
      T0: c['T0-wdl-two-threshold'].elapsedMsMedian,
      T1: c['T1-wdl-two-threshold-etc'].elapsedMsMedian,
      T2: c['T2-wdl-two-threshold-etc-interior'].elapsedMsMedian,
      H0: c['H0-strong-etc-with-ideal-bsfp-wall'].elapsedMsMedian,
      H1: c['H1-wdl-threshold-etc-with-ideal-bsfp-wall'].elapsedMsMedian,
    },
  };
});

console.error(`NEGAMAX_OPT_V2_SUMMARY=${JSON.stringify(compactSummary)}`);

console.log(JSON.stringify({
  kind: 'connect4-negamax-optimization-campaign-v2',
  status: 'complete',
  date: '2026-09-11',
  scope: {
    state: 'BSFP-aligned relational q',
    formulation: 'side-to-move-relative negamax',
    precompiledDag: true,
    focus: 'refine v1 winners and WDL threshold classification',
    bsfpWall: 'ideal exact classifier at approximately 50% rank; construction/query cost excluded',
  },
  candidates: [
    'strong fail-soft baseline',
    'strong ETC all nodes',
    'strong ETC remaining>=3',
    'strong exact distance envelope plus ETC',
    'WDL full-window baseline',
    'WDL full-window ETC',
    'WDL full-window ETC remaining>=3',
    'WDL two-threshold classifier',
    'WDL two-threshold classifier plus ETC',
    'WDL two-threshold classifier plus ETC remaining>=3',
    'ideal BSFP wall composition',
  ],
  cases,
}, null, 2));
