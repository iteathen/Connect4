import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import {
  createQuotientNativeNegamaxKernel,
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
} from './quotient-native-negamax-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

const TACTICAL_NONE = -100;
const TACTICAL_DRAW = -101;
const TACTICAL_LOSS = -102;
const TACTICAL_IMMEDIATE_BASE = 64;
const CHILD_UNKNOWN = -3;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

class BestChildWitnesses {
  constructor() {
    this.capacity = 4096;
    this.moves = new Int8Array(this.capacity);
    this.moves.fill(-1);
    this.children = new Int32Array(this.capacity);
    this.children.fill(CHILD_UNKNOWN);
    this.stores = 0;
    this.hits = 0;
    this.misses = 0;
    this.grows = 0;
  }

  ensure(stateId) {
    if (stateId < this.capacity) return;
    const capacity = nextPowerOfTwo(stateId + 1);
    const moves = new Int8Array(capacity);
    moves.fill(-1);
    moves.set(this.moves);
    const children = new Int32Array(capacity);
    children.fill(CHILD_UNKNOWN);
    children.set(this.children);
    this.capacity = capacity;
    this.moves = moves;
    this.children = children;
    this.grows += 1;
  }

  get(stateId, move) {
    this.ensure(stateId);
    if (move >= 0 && this.moves[stateId] === move && this.children[stateId] !== CHILD_UNKNOWN) {
      this.hits += 1;
      return this.children[stateId];
    }
    this.misses += 1;
    return CHILD_UNKNOWN;
  }

  peek(stateId, move) {
    this.ensure(stateId);
    if (move >= 0 && this.moves[stateId] === move) return this.children[stateId];
    return CHILD_UNKNOWN;
  }

  set(stateId, move, child) {
    if (move < 0 || child === QN_ILLEGAL) return;
    this.ensure(stateId);
    this.moves[stateId] = move;
    this.children[stateId] = child;
    this.stores += 1;
  }

  bytes() {
    return this.moves.byteLength + this.children.byteLength;
  }

  snapshot() {
    return Object.freeze({
      capacity: this.capacity,
      stores: this.stores,
      hits: this.hits,
      misses: this.misses,
      grows: this.grows,
      bytes: this.bytes(),
    });
  }
}

function createDriverSolver(kernel, config) {
  const { columns, cellCount, states, support, centerOrder, landingCells } = kernel;
  const driver = config.driver;
  const useWitness = config.witness === true;
  const witnessEtc = config.witnessEtc === true;
  const witnesses = useWitness ? new BestChildWitnesses() : null;
  const moveStack = new Int8Array((cellCount + 1) * columns);

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
    transitionsRequested: 0,
    witnessTransitionReuses: 0,
    witnessEtcProbes: 0,
    witnessEtcCutoffs: 0,
    pvsScoutSearches: 0,
    pvsResearches: 0,
    mtdPasses: 0,
    thresholdPasses: 0,
  };

  function prepareMoves(stateId, forcedColumn) {
    const supportIndex = states.support[stateId];
    const rank = support.ranks[supportIndex];
    const base = rank * columns;
    let count = 0;
    if (forcedColumn >= 0) {
      moveStack[base] = forcedColumn;
      metrics.forcedNodes += 1;
      return count + 1;
    }

    const best = states.bestMove[stateId];
    if (best >= 0 && landingCells[supportIndex * columns + best] !== 0xff) {
      moveStack[base + count] = best;
      count += 1;
      metrics.ttMoveOrderHits += 1;
    }
    for (const column of centerOrder) {
      if (column === best) continue;
      if (landingCells[supportIndex * columns + column] === 0xff) continue;
      moveStack[base + count] = column;
      count += 1;
    }
    return count;
  }

  function transition(stateId, column) {
    if (useWitness) {
      const known = witnesses.get(stateId, column);
      if (known !== CHILD_UNKNOWN) {
        metrics.witnessTransitionReuses += 1;
        return known;
      }
    }
    metrics.transitionsRequested += 1;
    return kernel.advance(stateId, column);
  }

  function storeWitness(stateId, move, child) {
    if (useWitness) witnesses.set(stateId, move, child);
  }

  function childScore(child, alpha, beta, usePvs, firstMove) {
    if (child === QN_TERMINAL_WIN) return 1;
    if (!usePvs || firstMove) return -search(child, -beta, -alpha, usePvs);

    metrics.pvsScoutSearches += 1;
    let score = -search(child, -alpha - 1, -alpha, usePvs);
    if (score > alpha && score < beta) {
      metrics.pvsResearches += 1;
      score = -search(child, -beta, -alpha, usePvs);
    }
    return score;
  }

  function search(stateId, alpha, beta, usePvs) {
    metrics.calls += 1;
    const lower = states.lower[stateId];
    const upper = states.upper[stateId];
    if (lower === upper) {
      metrics.ttExactReturns += 1;
      return lower;
    }
    if (lower >= beta) {
      metrics.ttBoundReturns += 1;
      return lower;
    }
    if (upper <= alpha) {
      metrics.ttBoundReturns += 1;
      return upper;
    }

    const tactical = kernel.tacticalCode(stateId);
    if (tactical >= TACTICAL_IMMEDIATE_BASE) {
      const move = tactical - TACTICAL_IMMEDIATE_BASE;
      states.lower[stateId] = 1;
      states.upper[stateId] = 1;
      states.bestMove[stateId] = move;
      storeWitness(stateId, move, QN_TERMINAL_WIN);
      metrics.tacticalExact += 1;
      return 1;
    }
    if (tactical === TACTICAL_LOSS) {
      states.lower[stateId] = -1;
      states.upper[stateId] = -1;
      metrics.tacticalExact += 1;
      return -1;
    }
    if (tactical === TACTICAL_DRAW) {
      states.lower[stateId] = 0;
      states.upper[stateId] = 0;
      metrics.tacticalExact += 1;
      return 0;
    }
    assert(tactical === TACTICAL_NONE || (tactical >= 0 && tactical < columns), 'unexpected tactical code');

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower);
    beta = Math.min(beta, upper);

    if (witnessEtc && useWitness) {
      const bestMove = states.bestMove[stateId];
      const child = witnesses.peek(stateId, bestMove);
      if (child !== CHILD_UNKNOWN) {
        metrics.witnessEtcProbes += 1;
        const parentLower = child === QN_TERMINAL_WIN ? 1 : -states.upper[child];
        if (parentLower >= beta) {
          states.lower[stateId] = Math.max(states.lower[stateId], parentLower);
          metrics.witnessEtcCutoffs += 1;
          return parentLower;
        }
      }
    }

    const forcedColumn = tactical >= 0 ? tactical : -1;
    const moveCount = prepareMoves(stateId, forcedColumn);
    const supportIndex = states.support[stateId];
    const rank = support.ranks[supportIndex];
    const base = rank * columns;

    metrics.expanded += 1;
    let value = -2;
    let selectedMove = -1;
    let selectedChild = CHILD_UNKNOWN;
    for (let index = 0; index < moveCount; index += 1) {
      const column = moveStack[base + index];
      const child = transition(stateId, column);
      assert(child !== QN_ILLEGAL, 'prepared legal quotient action became illegal');
      const score = childScore(child, alpha, beta, usePvs, index === 0);
      if (score > value) {
        value = score;
        selectedMove = column;
        selectedChild = child;
      }
      if (value > alpha) alpha = value;
      if (alpha >= beta) {
        metrics.cutoffs += 1;
        if (index === 0) metrics.firstMoveCutoffs += 1;
        break;
      }
    }

    if (selectedMove >= 0) {
      states.bestMove[stateId] = selectedMove;
      storeWitness(stateId, selectedMove, selectedChild);
    }
    if (value <= originalAlpha) states.upper[stateId] = Math.min(states.upper[stateId], value);
    else if (value >= originalBeta) states.lower[stateId] = Math.max(states.lower[stateId], value);
    else {
      states.lower[stateId] = value;
      states.upper[stateId] = value;
    }
    return value;
  }

  function runFull() {
    return search(kernel.rootId, -2, 2, false);
  }

  function runPvs() {
    return search(kernel.rootId, -2, 2, true);
  }

  function runThreshold() {
    let value = search(kernel.rootId, 0, 1, false);
    metrics.thresholdPasses += 1;
    if (value >= 1) return 1;
    value = search(kernel.rootId, -1, 0, false);
    metrics.thresholdPasses += 1;
    return value >= 0 ? 0 : -1;
  }

  function runMtdf() {
    let guess = 0;
    let lower = -1;
    let upper = 1;
    while (lower < upper) {
      const beta = guess === lower ? guess + 1 : guess;
      guess = search(kernel.rootId, beta - 1, beta, false);
      metrics.mtdPasses += 1;
      if (guess < beta) upper = guess;
      else lower = guess;
    }
    return guess;
  }

  function run() {
    if (driver === 'full') return runFull();
    if (driver === 'pvs') return runPvs();
    if (driver === 'threshold') return runThreshold();
    if (driver === 'mtdf') return runMtdf();
    throw new RangeError(`unknown driver ${driver}`);
  }

  function rootActionValues() {
    const values = Array(columns).fill(null);
    for (let column = 0; column < columns; column += 1) {
      if (landingCells[column] === 0xff) continue;
      const child = transition(kernel.rootId, column);
      values[column] = child === QN_TERMINAL_WIN ? 1 : -search(child, -2, 2, false);
    }
    return values;
  }

  return Object.freeze({ run, rootActionValues, metrics, witnesses });
}

function expectedRootActions(spec, oracle) {
  const result = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0);
    heights[column] = 1;
    result[column] = oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(column) });
  }
  return result;
}

const CANDIDATES = Object.freeze([
  Object.freeze({ name: 'D0-full-window', config: Object.freeze({ driver: 'full', witness: false, witnessEtc: false }) }),
  Object.freeze({ name: 'D1-PVS', config: Object.freeze({ driver: 'pvs', witness: false, witnessEtc: false }) }),
  Object.freeze({ name: 'D2-MTDf', config: Object.freeze({ driver: 'mtdf', witness: false, witnessEtc: false }) }),
  Object.freeze({ name: 'D3-threshold', config: Object.freeze({ driver: 'threshold', witness: false, witnessEtc: false }) }),
  Object.freeze({ name: 'D4-PVS-witness', config: Object.freeze({ driver: 'pvs', witness: true, witnessEtc: true }) }),
  Object.freeze({ name: 'D5-MTDf-witness', config: Object.freeze({ driver: 'mtdf', witness: true, witnessEtc: true }) }),
  Object.freeze({ name: 'D6-threshold-witness', config: Object.freeze({ driver: 'threshold', witness: true, witnessEtc: true }) }),
]);

function runOnce(spec, expectedWdl, expectedActions, candidate, qualifyActions) {
  const started = performance.now();
  const kernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const setupMs = performance.now() - started;
  const solver = createDriverSolver(kernel, candidate.config);
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${candidate.name}: expected root WDL ${expectedWdl}, got ${result}`);

  let rootActions = null;
  if (qualifyActions) {
    rootActions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(rootActions[column] === expectedActions[column], `${candidate.name}: root action ${column} mismatch`);
    }
  }

  const baseMemory = kernel.memoryStats().totalTypedBytes;
  const witnessBytes = solver.witnesses?.bytes() ?? 0;
  return Object.freeze({
    result,
    rootActions,
    setupMs,
    solveMs,
    totalMs: performance.now() - started,
    metrics: Object.freeze({ ...solver.metrics }),
    qStates: kernel.states.count,
    residualClasses: kernel.classes.size,
    baseTypedBytes: baseMemory,
    witnessBytes,
    typedBytesLowerBound: baseMemory + witnessBytes,
    witnessStats: solver.witnesses?.snapshot() ?? null,
  });
}

function benchmarkCandidate(spec, expectedWdl, expectedActions, candidate, repeats = 9) {
  const qualification = runOnce(spec, expectedWdl, expectedActions, candidate, true);
  const runs = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    runs.push(runOnce(spec, expectedWdl, expectedActions, candidate, false));
  }
  const representative = [...runs].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(runs.length / 2)];
  return Object.freeze({
    name: candidate.name,
    config: candidate.config,
    qualificationRootActions: qualification.rootActions,
    totalMsMedian: median(runs.map((run) => run.totalMs)),
    solveMsMedian: median(runs.map((run) => run.solveMs)),
    setupMsMedian: median(runs.map((run) => run.setupMs)),
    representative,
  });
}

const cases = [];
for (const spec of CASES) {
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const candidates = CANDIDATES.map((candidate) => benchmarkCandidate(
    spec,
    oracle.rootWdl,
    expectedActions,
    candidate,
  ));
  const best = [...candidates].sort((a, b) => a.totalMsMedian - b.totalMsMedian)[0];
  const geometry = `${spec.columns}x${spec.rows}:c${spec.connect}`;
  console.error(
    `[quotient-driver] ${geometry}`
    + ` best=${best.name}`
    + ` totalMs=${best.totalMsMedian.toFixed(3)}`
    + ` expanded=${best.representative.metrics.expanded}`
    + ` calls=${best.representative.metrics.calls}`,
  );
  cases.push(Object.freeze({ geometry, expectedWdl: oracle.rootWdl, expectedActions, best: best.name, candidates }));
}

const compact = cases.map((entry) => ({
  geometry: entry.geometry,
  best: entry.best,
  candidates: Object.fromEntries(entry.candidates.map((candidate) => [candidate.name, {
    totalMsMedian: candidate.totalMsMedian,
    solveMsMedian: candidate.solveMsMedian,
    expanded: candidate.representative.metrics.expanded,
    calls: candidate.representative.metrics.calls,
    pvsScouts: candidate.representative.metrics.pvsScoutSearches,
    pvsResearches: candidate.representative.metrics.pvsResearches,
    mtdPasses: candidate.representative.metrics.mtdPasses,
    thresholdPasses: candidate.representative.metrics.thresholdPasses,
    witnessReuses: candidate.representative.metrics.witnessTransitionReuses,
    witnessEtcCutoffs: candidate.representative.metrics.witnessEtcCutoffs,
    qStates: candidate.representative.qStates,
    residualClasses: candidate.representative.residualClasses,
    typedBytesLowerBound: candidate.representative.typedBytesLowerBound,
  }])),
}));

console.error(`QUOTIENT_NATIVE_DRIVER_SUMMARY=${JSON.stringify(compact)}`);
console.log(JSON.stringify({
  kind: 'connect4-quotient-native-driver-campaign-v1',
  status: 'complete',
  date: '2026-09-11',
  sharedKernel: {
    state: 'qID -> support + p0ResidualClass + p1ResidualClass',
    residualTransitions: 'dense current speed baseline',
    quotientEdgeCache: false,
    tacticalClosure: 'quotient-native',
    valueContract: 'WDL fail-soft',
    recursiveColoredBoard: false,
  },
  question: 'Which exact search driver is strongest once real quotient-transition and interning costs are included?',
  candidates: CANDIDATES.map((candidate) => candidate.name),
  cases,
}, null, 2));
