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
const PN_INF = 0x1fff_ffff;
const SET_INF = null;

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

function saturatingAdd(left, right) {
  const sum = left + right;
  return sum >= PN_INF ? PN_INF : sum;
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

  return Object.freeze({ ...spec, cellCount, support, residual, supportMeta, centerOrder, applyMove });
}

function buildDag(g) {
  const started = performance.now();
  const states = [];
  const keys = [];
  const idByKey = new Map();
  const rankIds = Array.from({ length: g.cellCount + 1 }, () => []);
  const edges = [];
  const incoming = [];

  function intern(state) {
    const key = residualStateKey(state);
    const existing = idByKey.get(key);
    if (existing !== undefined) return existing;
    const id = states.length;
    const rank = g.supportMeta[state.supportIndex].rank;
    assert(state.sideToMove === (rank & 1), 'relational state side-to-move/rank mismatch');
    states.push(state);
    keys.push(key);
    idByKey.set(key, id);
    rankIds[rank].push(id);
    const row = new Int32Array(g.columns);
    row.fill(ILLEGAL);
    edges.push(row);
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
          continue;
        }
        const childId = intern(transition.state);
        edges[id][column] = childId;
        incoming[childId].push(id);
        nonterminalEdges += 1;
      }
    }
  }

  const rankOf = new Uint8Array(states.length);
  const sideOf = new Uint8Array(states.length);
  for (let id = 0; id < states.length; id += 1) {
    rankOf[id] = g.supportMeta[states[id].supportIndex].rank;
    sideOf[id] = states[id].sideToMove;
  }

  const tactical = analyzeTactics(g, { states, edges, rankOf, sideOf });
  return Object.freeze({
    rootId,
    states,
    keys,
    idByKey,
    rankIds,
    edges,
    incoming,
    rankOf,
    sideOf,
    tactical,
    nonterminalEdges,
    terminalEdges,
    buildMs: performance.now() - started,
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
        const score = target === TERMINAL_WIN
          ? Math.trunc((g.cellCount + 1 - rank) / 2)
          : -values[target];
        if (score > best) best = score;
      }
      values[id] = legal === 0 ? 0 : best;
    }
  }
  return values;
}

function exactTargetTruth(dag, strong, id, targetPlayer) {
  const outcome = sign(strong[id]);
  if (outcome === 0) return false;
  return outcome > 0 ? dag.sideOf[id] === targetPlayer : dag.sideOf[id] !== targetPlayer;
}

function tacticalStrongValue(g, dag, id) {
  const rank = dag.rankOf[id];
  if (dag.tactical.immediateWin[id] >= 0) return Math.trunc((g.cellCount + 1 - rank) / 2);
  if (dag.tactical.doubleThreat[id]) return -Math.trunc((g.cellCount - rank) / 2);
  return null;
}

function candidateColumns(g, dag, id, bestMove, tacticalEnabled) {
  if (tacticalEnabled) {
    const forced = dag.tactical.forcedColumn[id];
    if (forced >= 0) return [forced];
  }
  const result = [];
  if (bestMove >= 0 && dag.edges[id][bestMove] !== ILLEGAL) result.push(bestMove);
  for (const column of g.centerOrder) {
    if (column !== bestMove && dag.edges[id][column] !== ILLEGAL) result.push(column);
  }
  return result;
}

function makeNegamaxDriver(g, dag, strong, { mode, tacticalEnabled, bsfpCutRank }) {
  const scoreLimit = g.cellCount + 4;
  const lower = new Int16Array(dag.states.length);
  const upper = new Int16Array(dag.states.length);
  const bestMove = new Int8Array(dag.states.length);
  lower.fill(-scoreLimit);
  upper.fill(scoreLimit);
  bestMove.fill(-1);
  const metrics = {
    calls: 0,
    expanded: 0,
    ttExactReturns: 0,
    ttBoundReturns: 0,
    cutoffs: 0,
    researches: 0,
    bsfpHits: 0,
    tacticalExact: 0,
    forcedNodes: 0,
    mtdPasses: 0,
  };

  function search(id, alpha, beta, pvsMode) {
    metrics.calls += 1;
    if (bsfpCutRank !== null && dag.rankOf[id] >= bsfpCutRank) {
      metrics.bsfpHits += 1;
      return strong[id];
    }

    if (tacticalEnabled) {
      const tactical = tacticalStrongValue(g, dag, id);
      if (tactical !== null) {
        assert(tactical === strong[id], `tactical exact value mismatch at state ${id}`);
        metrics.tacticalExact += 1;
        lower[id] = tactical;
        upper[id] = tactical;
        return tactical;
      }
      if (dag.tactical.forcedColumn[id] >= 0) metrics.forcedNodes += 1;
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
    if (lower[id] > alpha) alpha = lower[id];
    if (upper[id] < beta) beta = upper[id];
    metrics.expanded += 1;

    const columns = candidateColumns(g, dag, id, bestMove[id], tacticalEnabled);
    if (columns.length === 0) {
      lower[id] = 0;
      upper[id] = 0;
      return 0;
    }

    let value = -scoreLimit;
    let selected = -1;
    let first = true;
    for (const column of columns) {
      const target = dag.edges[id][column];
      let score;
      if (target === TERMINAL_WIN) {
        score = Math.trunc((g.cellCount + 1 - dag.rankOf[id]) / 2);
      } else if (pvsMode && !first) {
        score = -search(target, -alpha - 1, -alpha, true);
        if (score > alpha && score < beta) {
          metrics.researches += 1;
          score = -search(target, -beta, -alpha, true);
        }
      } else {
        score = -search(target, -beta, -alpha, pvsMode);
      }
      first = false;
      if (score > value) {
        value = score;
        selected = column;
      }
      if (value > alpha) alpha = value;
      if (alpha >= beta) {
        metrics.cutoffs += 1;
        break;
      }
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

  function run() {
    if (mode === 'mtdf') {
      let guess = 0;
      let lo = -scoreLimit;
      let hi = scoreLimit;
      while (lo < hi) {
        const beta = guess === lo ? guess + 1 : guess;
        guess = search(dag.rootId, beta - 1, beta, false);
        metrics.mtdPasses += 1;
        if (guess < beta) hi = guess;
        else lo = guess;
      }
      return guess;
    }
    return search(dag.rootId, -scoreLimit, scoreLimit, mode === 'pvs');
  }

  return Object.freeze({ run, metrics });
}

function runStrongCandidate(g, dag, strong, config, repeats = 3) {
  const elapsed = [];
  let finalMetrics = null;
  let result = null;
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    const driver = makeNegamaxDriver(g, dag, strong, config);
    const started = performance.now();
    const value = driver.run();
    elapsed.push(performance.now() - started);
    assert(value === strong[dag.rootId], `${config.mode} root strong value mismatch`);
    result = value;
    finalMetrics = driver.metrics;
  }
  return Object.freeze({
    family: 'strong-score',
    method: config.mode,
    composition: config.tacticalEnabled ? 'relational+tt+tactical+center-order' : 'relational+tt+center-order',
    bsfpCutRank: config.bsfpCutRank,
    result,
    elapsedMsMedian: median(elapsed),
    metrics: finalMetrics,
  });
}

function proofKnownTruth(g, dag, strong, id, targetPlayer, tacticalEnabled, bsfpCutRank) {
  if (bsfpCutRank !== null && dag.rankOf[id] >= bsfpCutRank) {
    return exactTargetTruth(dag, strong, id, targetPlayer);
  }
  if (tacticalEnabled) {
    if (dag.tactical.immediateWin[id] >= 0) return dag.sideOf[id] === targetPlayer;
    if (dag.tactical.doubleThreat[id]) return dag.sideOf[id] !== targetPlayer;
  }
  let legal = false;
  for (const target of dag.edges[id]) if (target !== ILLEGAL) { legal = true; break; }
  if (!legal) return false;
  return null;
}

function proofChildTerms(g, dag, id, targetPlayer, tacticalEnabled) {
  const side = dag.sideOf[id];
  if (tacticalEnabled && dag.tactical.forcedColumn[id] >= 0) {
    const column = dag.tactical.forcedColumn[id];
    const target = dag.edges[id][column];
    return target === TERMINAL_WIN
      ? [Object.freeze({ truth: side === targetPlayer, childId: -1 })]
      : [Object.freeze({ truth: null, childId: target })];
  }
  const terms = [];
  for (const column of g.centerOrder) {
    const target = dag.edges[id][column];
    if (target === ILLEGAL) continue;
    if (target === TERMINAL_WIN) terms.push(Object.freeze({ truth: side === targetPlayer, childId: -1 }));
    else terms.push(Object.freeze({ truth: null, childId: target }));
  }
  return terms;
}

function solvePnProposition(g, dag, strong, targetPlayer, { tacticalEnabled, bsfpCutRank }) {
  const pn = new Int32Array(dag.states.length);
  const dn = new Int32Array(dag.states.length);
  const expanded = new Uint8Array(dag.states.length);
  pn.fill(1);
  dn.fill(1);
  const metrics = { expansions: 0, backups: 0, selectionSteps: 0, bsfpKnown: 0, tacticalKnown: 0 };

  for (let id = 0; id < dag.states.length; id += 1) {
    const truth = proofKnownTruth(g, dag, strong, id, targetPlayer, tacticalEnabled, bsfpCutRank);
    if (truth === null) continue;
    if (bsfpCutRank !== null && dag.rankOf[id] >= bsfpCutRank) metrics.bsfpKnown += 1;
    else if (tacticalEnabled && (dag.tactical.immediateWin[id] >= 0 || dag.tactical.doubleThreat[id])) metrics.tacticalKnown += 1;
    if (truth) { pn[id] = 0; dn[id] = PN_INF; }
    else { pn[id] = PN_INF; dn[id] = 0; }
  }

  function recalc(id) {
    if (!expanded[id] || pn[id] === 0 || dn[id] === 0) return false;
    const isOr = dag.sideOf[id] === targetPlayer;
    const terms = proofChildTerms(g, dag, id, targetPlayer, tacticalEnabled);
    let nextPn = isOr ? PN_INF : 0;
    let nextDn = isOr ? 0 : PN_INF;
    for (const term of terms) {
      const childPn = term.truth === null ? pn[term.childId] : term.truth ? 0 : PN_INF;
      const childDn = term.truth === null ? dn[term.childId] : term.truth ? PN_INF : 0;
      if (isOr) {
        if (childPn < nextPn) nextPn = childPn;
        nextDn = saturatingAdd(nextDn, childDn);
      } else {
        nextPn = saturatingAdd(nextPn, childPn);
        if (childDn < nextDn) nextDn = childDn;
      }
    }
    const changed = nextPn !== pn[id] || nextDn !== dn[id];
    pn[id] = nextPn;
    dn[id] = nextDn;
    metrics.backups += 1;
    return changed;
  }

  function propagate(startId) {
    const queue = [startId];
    let cursor = 0;
    const queued = new Set([startId]);
    while (cursor < queue.length) {
      const id = queue[cursor++];
      queued.delete(id);
      if (!recalc(id)) continue;
      for (const parent of dag.incoming[id]) {
        if (!expanded[parent] || queued.has(parent)) continue;
        queued.add(parent);
        queue.push(parent);
      }
    }
  }

  function selectFrontier() {
    let id = dag.rootId;
    while (expanded[id] && pn[id] !== 0 && dn[id] !== 0) {
      const isOr = dag.sideOf[id] === targetPlayer;
      const terms = proofChildTerms(g, dag, id, targetPlayer, tacticalEnabled);
      let chosen = -1;
      let best = PN_INF + 1;
      for (const term of terms) {
        if (term.truth !== null) continue;
        const measure = isOr ? pn[term.childId] : dn[term.childId];
        if (measure < best) {
          best = measure;
          chosen = term.childId;
        }
      }
      assert(chosen >= 0, 'PN selection failed on unresolved node');
      id = chosen;
      metrics.selectionSteps += 1;
    }
    return id;
  }

  while (pn[dag.rootId] !== 0 && dn[dag.rootId] !== 0) {
    const leaf = selectFrontier();
    assert(!expanded[leaf], 'PN selected an already expanded unresolved leaf');
    expanded[leaf] = 1;
    metrics.expansions += 1;
    recalc(leaf);
    for (const parent of dag.incoming[leaf]) if (expanded[parent]) propagate(parent);
  }

  return Object.freeze({ truth: pn[dag.rootId] === 0, metrics });
}

function runPnWdl(g, dag, strong, config) {
  const started = performance.now();
  const p0 = solvePnProposition(g, dag, strong, 0, config);
  let p1 = null;
  let wdl;
  if (p0.truth) wdl = 1;
  else {
    p1 = solvePnProposition(g, dag, strong, 1, config);
    wdl = p1.truth ? -1 : 0;
  }
  assert(wdl === sign(strong[dag.rootId]), 'PN-DAG W/D/L mismatch');
  return Object.freeze({
    family: 'wdl-proof',
    method: 'pn-dag',
    composition: config.tacticalEnabled ? 'relational+transpositions+tactical' : 'relational+transpositions',
    bsfpCutRank: config.bsfpCutRank,
    result: wdl,
    elapsedMs: performance.now() - started,
    metrics: Object.freeze({
      p0: p0.metrics,
      p1: p1?.metrics ?? null,
      totalExpansions: p0.metrics.expansions + (p1?.metrics.expansions ?? 0),
    }),
  });
}

function setEqual(left, right) {
  if (left === SET_INF || right === SET_INF) return left === right;
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) if (left[i] !== right[i]) return false;
  return true;
}

function setMin(left, right) {
  if (left === SET_INF) return right;
  if (right === SET_INF) return left;
  if (left.length !== right.length) return left.length < right.length ? left : right;
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) return left[i] < right[i] ? left : right;
  }
  return left;
}

function setUnion(left, right, metrics) {
  if (left === SET_INF || right === SET_INF) return SET_INF;
  const out = [];
  let i = 0;
  let j = 0;
  while (i < left.length || j < right.length) {
    const a = i < left.length ? left[i] : Number.MAX_SAFE_INTEGER;
    const b = j < right.length ? right[j] : Number.MAX_SAFE_INTEGER;
    if (a === b) { out.push(a); i += 1; j += 1; }
    else if (a < b) { out.push(a); i += 1; }
    else { out.push(b); j += 1; }
  }
  metrics.setElementsProduced += out.length;
  metrics.maxSetSize = Math.max(metrics.maxSetSize, out.length);
  return out;
}

function setIntersectionFirst(left, right) {
  assert(left !== SET_INF && right !== SET_INF, 'PSS unresolved root cannot have infinite frontier set');
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) return left[i];
    if (left[i] < right[j]) i += 1;
    else j += 1;
  }
  return -1;
}

function solvePssProposition(g, dag, strong, targetPlayer, { tacticalEnabled, bsfpCutRank }) {
  const proof = Array(dag.states.length);
  const disproof = Array(dag.states.length);
  const expanded = new Uint8Array(dag.states.length);
  const metrics = { expansions: 0, backups: 0, setElementsProduced: 0, maxSetSize: 1, bsfpKnown: 0, tacticalKnown: 0 };

  for (let id = 0; id < dag.states.length; id += 1) {
    const truth = proofKnownTruth(g, dag, strong, id, targetPlayer, tacticalEnabled, bsfpCutRank);
    if (truth === null) {
      proof[id] = [id];
      disproof[id] = [id];
      continue;
    }
    if (bsfpCutRank !== null && dag.rankOf[id] >= bsfpCutRank) metrics.bsfpKnown += 1;
    else if (tacticalEnabled && (dag.tactical.immediateWin[id] >= 0 || dag.tactical.doubleThreat[id])) metrics.tacticalKnown += 1;
    if (truth) { proof[id] = []; disproof[id] = SET_INF; }
    else { proof[id] = SET_INF; disproof[id] = []; }
  }

  function termSets(term) {
    if (term.truth === null) return [proof[term.childId], disproof[term.childId]];
    return term.truth ? [[], SET_INF] : [SET_INF, []];
  }

  function recalc(id) {
    if (!expanded[id] || proof[id]?.length === 0 || disproof[id]?.length === 0) return false;
    const terms = proofChildTerms(g, dag, id, targetPlayer, tacticalEnabled);
    const isOr = dag.sideOf[id] === targetPlayer;
    let nextProof = isOr ? SET_INF : [];
    let nextDisproof = isOr ? [] : SET_INF;
    for (const term of terms) {
      const [childProof, childDisproof] = termSets(term);
      if (isOr) {
        nextProof = setMin(nextProof, childProof);
        nextDisproof = setUnion(nextDisproof, childDisproof, metrics);
      } else {
        nextProof = setUnion(nextProof, childProof, metrics);
        nextDisproof = setMin(nextDisproof, childDisproof);
      }
    }
    const changed = !setEqual(nextProof, proof[id]) || !setEqual(nextDisproof, disproof[id]);
    proof[id] = nextProof;
    disproof[id] = nextDisproof;
    metrics.backups += 1;
    return changed;
  }

  function propagate(startId) {
    const queue = [startId];
    let cursor = 0;
    const queued = new Set([startId]);
    while (cursor < queue.length) {
      const id = queue[cursor++];
      queued.delete(id);
      if (!recalc(id)) continue;
      for (const parent of dag.incoming[id]) {
        if (!expanded[parent] || queued.has(parent)) continue;
        queued.add(parent);
        queue.push(parent);
      }
    }
  }

  while (proof[dag.rootId]?.length !== 0 && disproof[dag.rootId]?.length !== 0) {
    const mpn = setIntersectionFirst(proof[dag.rootId], disproof[dag.rootId]);
    assert(mpn >= 0, 'PSS failed to find proof/disproof-set intersection');
    assert(!expanded[mpn], 'PSS selected an already expanded node');
    expanded[mpn] = 1;
    metrics.expansions += 1;
    recalc(mpn);
    for (const parent of dag.incoming[mpn]) if (expanded[parent]) propagate(parent);
  }

  return Object.freeze({ truth: proof[dag.rootId]?.length === 0, metrics });
}

function runPssWdl(g, dag, strong, config) {
  if (dag.states.length > 50_000) {
    return Object.freeze({
      family: 'wdl-proof',
      method: 'proof-set-search',
      composition: config.tacticalEnabled ? 'relational+proof-sets+tactical' : 'relational+proof-sets',
      bsfpCutRank: config.bsfpCutRank,
      status: 'scale-deferred',
      reason: 'first campaign caps exact untruncated proof sets at 50k relational states',
    });
  }
  const started = performance.now();
  const p0 = solvePssProposition(g, dag, strong, 0, config);
  let p1 = null;
  let wdl;
  if (p0.truth) wdl = 1;
  else {
    p1 = solvePssProposition(g, dag, strong, 1, config);
    wdl = p1.truth ? -1 : 0;
  }
  assert(wdl === sign(strong[dag.rootId]), 'PSS W/D/L mismatch');
  return Object.freeze({
    family: 'wdl-proof',
    method: 'proof-set-search',
    composition: config.tacticalEnabled ? 'relational+proof-sets+tactical' : 'relational+proof-sets',
    bsfpCutRank: config.bsfpCutRank,
    status: 'complete',
    result: wdl,
    elapsedMs: performance.now() - started,
    metrics: Object.freeze({
      p0: p0.metrics,
      p1: p1?.metrics ?? null,
      totalExpansions: p0.metrics.expansions + (p1?.metrics.expansions ?? 0),
      maxSetSize: Math.max(p0.metrics.maxSetSize, p1?.metrics.maxSetSize ?? 0),
      setElementsProduced: p0.metrics.setElementsProduced + (p1?.metrics.setElementsProduced ?? 0),
    }),
  });
}

function cutRanks(cellCount) {
  return [null, Math.ceil(cellCount * 0.5), Math.ceil(cellCount * 0.7)];
}

function runCase(spec) {
  const g = createGeometry(spec);
  const dag = buildDag(g);
  const strong = solveStrong(g, dag);
  const rootStrong = strong[dag.rootId];
  const rootWdl = sign(rootStrong);
  const candidates = [];

  for (const bsfpCutRank of cutRanks(g.cellCount)) {
    for (const tacticalEnabled of [false, true]) {
      for (const mode of ['alphabeta', 'pvs', 'mtdf']) {
        candidates.push(runStrongCandidate(g, dag, strong, { mode, tacticalEnabled, bsfpCutRank }));
      }
      candidates.push(runPnWdl(g, dag, strong, { tacticalEnabled, bsfpCutRank }));
      candidates.push(runPssWdl(g, dag, strong, { tacticalEnabled, bsfpCutRank }));
    }
  }

  return Object.freeze({
    geometry: `${g.columns}x${g.rows}:c${g.connect}`,
    relationalStates: dag.states.length,
    nonterminalEdges: dag.nonterminalEdges,
    terminalWinEdges: dag.terminalEdges,
    graphBuildMs: dag.buildMs,
    rootStrong,
    rootWdl,
    bsfpBoundaryModel: 'ideal exact q-classifier at rank >= cut; BSFP construction cost excluded',
    candidates,
  });
}

const results = [];
for (const spec of CASES) {
  const result = runCase(spec);
  results.push(result);
  const noBsfp = result.candidates.filter((entry) => entry.bsfpCutRank === null && entry.status !== 'scale-deferred');
  const summary = noBsfp.map((entry) => {
    const work = entry.family === 'strong-score' ? entry.metrics.expanded : entry.metrics.totalExpansions;
    return `${entry.method}/${entry.composition.includes('tactical') ? 'opt' : 'ref'}=${work}`;
  }).join(' ');
  console.error(`[search-campaign] ${result.geometry} states=${result.relationalStates} root=${result.rootStrong} ${summary}`);
  if (global.gc) global.gc();
}

console.log(JSON.stringify({
  kind: 'connect4-relational-search-method-evidence-campaign-v1',
  status: 'complete',
  date: '2026-09-11',
  campaignScope: {
    state: 'BSFP-aligned relational q only',
    positionalBoardInSearch: false,
    strongScoreCandidates: ['relational-negamax-alpha-beta', 'PVS/NegaScout', 'MTD(f)'],
    wdlProofCandidates: ['PN-DAG', 'Proof-Set Search'],
    sharedComposition: ['exact q transpositions', 'center-first order', 'optional relational tactical closure', 'optional ideal exact BSFP boundary'],
    pssScalePolicy: 'exact untruncated proof sets only when relationalStates <= 50000 in campaign v1',
  },
  importantLimits: [
    'precompiled relational DAG isolates search/control economics from transition construction cost',
    'ideal BSFP boundary runs exclude BSFP construction cost and therefore measure forward work-elimination ceiling only',
    'campaign v1 does not yet include df-pn because standard df-pn threshold completeness is not established for transposition-rich DAGs without additional handling',
    'campaign v1 does not yet include truncated PSS, parallelism, residual automorphism canonicalization, or compiled Allis-rule masks',
    'bounded controls are evidence, not standard-7x6 production qualification',
  ],
  cases: results,
}, null, 2));
