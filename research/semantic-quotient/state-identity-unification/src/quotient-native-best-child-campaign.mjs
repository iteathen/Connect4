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

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

class BestChildWitnesses {
  constructor(initialCapacity = 4096) {
    this.capacity = nextPowerOfTwo(initialCapacity);
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
    const nextCapacity = nextPowerOfTwo(stateId + 1);
    const moves = new Int8Array(nextCapacity);
    moves.fill(-1);
    moves.set(this.moves);
    const children = new Int32Array(nextCapacity);
    children.fill(CHILD_UNKNOWN);
    children.set(this.children);
    this.moves = moves;
    this.children = children;
    this.capacity = nextCapacity;
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
    this.ensure(stateId);
    this.moves[stateId] = move;
    this.children[stateId] = child;
    this.stores += 1;
  }

  memoryBytes() {
    return this.moves.byteLength + this.children.byteLength;
  }

  stats() {
    return Object.freeze({
      capacity: this.capacity,
      stores: this.stores,
      hits: this.hits,
      misses: this.misses,
      grows: this.grows,
      bytes: this.memoryBytes(),
    });
  }
}

function createWitnessSolver(kernel, config) {
  const { columns, cellCount, states, support, centerOrder, landingCells } = kernel;
  const witnesses = new BestChildWitnesses();
  const useWitnessReuse = config.witnessReuse !== false;
  const useWitnessEtc = config.witnessEtc === true;
  const wdlMode = config.wdlMode ?? 'full';
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
      return 1;
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
    if (useWitnessReuse) {
      const cached = witnesses.get(stateId, column);
      if (cached !== CHILD_UNKNOWN) {
        metrics.witnessTransitionReuses += 1;
        return cached;
      }
    }
    metrics.transitionsRequested += 1;
    return kernel.advance(stateId, column);
  }

  function storeWitness(stateId, move, child) {
    if (move >= 0 && child !== QN_ILLEGAL) witnesses.set(stateId, move, child);
  }

  function search(stateId, alpha, beta) {
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

    if (useWitnessEtc) {
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
      const score = child === QN_TERMINAL_WIN ? 1 : -search(child, -beta, -alpha);
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

  function run() {
    if (wdlMode === 'threshold') {
      let value = search(kernel.rootId, 0, 1);
      metrics.thresholdPasses += 1;
      if (value >= 1) return 1;
      value = search(kernel.rootId, -1, 0);
      metrics.thresholdPasses += 1;
      return value >= 0 ? 0 : -1;
    }
    return search(kernel.rootId, -2, 2);
  }

  function rootActionValues() {
    const values = Array(columns).fill(null);
    for (let column = 0; column < columns; column += 1) {
      if (landingCells[column] === 0xff) continue;
      const child = transition(kernel.rootId, column);
      values[column] = child === QN_TERMINAL_WIN ? 1 : -search(child, -2, 2);
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
  Object.freeze({ name: 'B0-native-baseline', kind: 'builtin', config: Object.freeze({ wdlMode: 'full', etc: false }) }),
  Object.freeze({ name: 'B1-best-child-reuse', kind: 'witness', config: Object.freeze({ wdlMode: 'full', witnessReuse: true, witnessEtc: false }) }),
  Object.freeze({ name: 'B2-best-child-reuse-etc', kind: 'witness', config: Object.freeze({ wdlMode: 'full', witnessReuse: true, witnessEtc: true }) }),
  Object.freeze({ name: 'B3-best-child-threshold-etc', kind: 'witness', config: Object.freeze({ wdlMode: 'threshold', witnessReuse: true, witnessEtc: true }) }),
]);

function runOnce(spec, expectedWdl, expectedActions, candidate, checkActions) {
  const started = performance.now();
  const kernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const setupMs = performance.now() - started;
  const solver = candidate.kind === 'builtin'
    ? kernel.createWdlSolver({ wdlMode: candidate.config.wdlMode, etc: false, etcMinRemaining: 0 })
    : createWitnessSolver(kernel, candidate.config);
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${candidate.name}: root WDL mismatch expected ${expectedWdl}, got ${result}`);

  let rootActions = null;
  if (checkActions && typeof solver.rootActionValues === 'function') {
    rootActions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(rootActions[column] === expectedActions[column], `${candidate.name}: root action ${column} mismatch`);
    }
  }

  const kernelMemory = kernel.memoryStats();
  const witnessBytes = candidate.kind === 'witness' ? solver.witnesses.memoryBytes() : 0;
  return Object.freeze({
    result,
    rootActions,
    setupMs,
    solveMs,
    totalMs: performance.now() - started,
    metrics: Object.freeze({ ...solver.metrics }),
    qStates: kernel.states.count,
    residualClasses: kernel.classes.size,
    baseTypedBytes: kernelMemory.totalTypedBytes,
    witnessBytes,
    typedBytesLowerBound: kernelMemory.totalTypedBytes + witnessBytes,
    witnessStats: candidate.kind === 'witness' ? solver.witnesses.stats() : null,
  });
}

function benchmarkCandidate(spec, expectedWdl, expectedActions, candidate, repeats = 9) {
  // First run also verifies every legal root action. Timed medians use independent fresh runs.
  const qualified = runOnce(spec, expectedWdl, expectedActions, candidate, true);
  const runs = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    runs.push(runOnce(spec, expectedWdl, expectedActions, candidate, false));
  }
  const representative = [...runs].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(runs.length / 2)];
  return Object.freeze({
    name: candidate.name,
    config: candidate.config,
    qualificationRootActions: qualified.rootActions,
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
    `[quotient-best-child] ${geometry}`
    + ` best=${best.name}`
    + ` totalMs=${best.totalMsMedian.toFixed(3)}`
    + ` expanded=${best.representative.metrics.expanded}`
    + ` witnessBytes=${best.representative.witnessBytes}`,
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
    transitionReuses: candidate.representative.metrics.witnessTransitionReuses ?? 0,
    witnessEtcProbes: candidate.representative.metrics.witnessEtcProbes ?? 0,
    witnessEtcCutoffs: candidate.representative.metrics.witnessEtcCutoffs ?? 0,
    qStates: candidate.representative.qStates,
    residualClasses: candidate.representative.residualClasses,
    witnessBytes: candidate.representative.witnessBytes,
    typedBytesLowerBound: candidate.representative.typedBytesLowerBound,
  }])),
}));

console.error(`QUOTIENT_BEST_CHILD_SUMMARY=${JSON.stringify(compact)}`);
console.log(JSON.stringify({
  kind: 'connect4-quotient-native-best-child-witness-campaign-v1',
  status: 'complete',
  date: '2026-09-11',
  question: 'Can one exact TT-best child witness recover useful transition reuse or ETC without a full quotient-edge cache or speculative child construction?',
  witnessContract: 'A witness stores both move tag and exact already-materialized child qID/terminal marker; stale or nonmatching move tags are misses only.',
  cases,
}, null, 2));
