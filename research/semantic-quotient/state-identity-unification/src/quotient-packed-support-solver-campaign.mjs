import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { createTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-term-id-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

const TACTICAL_NONE = -100;
const TACTICAL_DRAW = -101;
const TACTICAL_LOSS = -102;
const TACTICAL_IMMEDIATE_BASE = 64;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function bitsFor(maxInclusive) {
  return Math.max(1, Math.ceil(Math.log2(maxInclusive + 1)));
}

function buildPackedSupport(spec, support) {
  const heightBits = bitsFor(spec.rows);
  const rankBits = bitsFor(spec.columns * spec.rows);
  const rankShift = heightBits * spec.columns;
  const totalBits = rankShift + rankBits;
  if (totalBits > 32) throw new RangeError(`packed support needs ${totalBits} bits`);
  const heightMask = (2 ** heightBits) - 1;
  const rankMask = (2 ** rankBits) - 1;
  const shifts = new Uint8Array(spec.columns);
  for (let column = 0; column < spec.columns; column += 1) shifts[column] = column * heightBits;
  const descriptor = new Uint32Array(support.itemCapacity);
  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
    let word = 0;
    let rank = 0;
    let remaining = supportIndex;
    for (let column = spec.columns - 1; column >= 0; column -= 1) {
      const divisor = support.weights[column];
      const height = Math.floor(remaining / divisor) % support.radix;
      rank += height;
      word = (word | (height << shifts[column])) >>> 0;
    }
    descriptor[supportIndex] = (word | (rank << rankShift)) >>> 0;
  }
  return Object.freeze({ descriptor, shifts, heightMask, rankMask, rankShift, totalBits });
}

function createPackedAdapter(wrap, spec) {
  const { kernel } = wrap;
  const { states, classes, support, centerOrder, bitLo, bitHi } = kernel;
  const packed = buildPackedSupport(spec, support);
  const cellCount = spec.columns * spec.rows;
  const moveStack = new Int8Array((cellCount + 1) * spec.columns);
  const metrics = { calls: 0, expanded: 0, cutoffs: 0, tacticalExact: 0, transitionsRequested: 0 };

  const rankAt = (supportIndex) => (packed.descriptor[supportIndex] >>> packed.rankShift) & packed.rankMask;
  const heightAt = (supportIndex, column) => (packed.descriptor[supportIndex] >>> packed.shifts[column]) & packed.heightMask;

  function advance(stateId, column) {
    metrics.transitionsRequested += 1;
    if (!Number.isInteger(column) || column < 0 || column >= spec.columns) return QN_ILLEGAL;
    const supportIndex = states.support[stateId];
    const height = heightAt(supportIndex, column);
    if (height >= spec.rows) return QN_ILLEGAL;
    const landingCell = height * spec.columns + column;
    const mover = rankAt(supportIndex) & 1;
    const p0Class = states.p0Class[stateId];
    const p1Class = states.p1Class[stateId];
    const ownClass = mover === 0 ? p0Class : p1Class;
    const opponentClass = mover === 0 ? p1Class : p0Class;
    const ownNext = classes.ownTransition(ownClass, landingCell);
    if (ownNext === -1) return QN_TERMINAL_WIN;
    const opponentNext = classes.blockTransition(opponentClass, landingCell);
    const childSupport = supportIndex + support.weights[column];
    return mover === 0
      ? states.intern(childSupport, ownNext, opponentNext)
      : states.intern(childSupport, opponentNext, ownNext);
  }

  function tacticalCode(stateId) {
    const supportIndex = states.support[stateId];
    const p0Class = states.p0Class[stateId];
    const p1Class = states.p1Class[stateId];
    if (classes.isEmpty(p0Class) && classes.isEmpty(p1Class)) return TACTICAL_DRAW;
    const mover = rankAt(supportIndex) & 1;
    const ownClass = mover === 0 ? p0Class : p1Class;
    const opponentClass = mover === 0 ? p1Class : p0Class;
    let immediate = -1;
    let forced = -1;
    let threats = 0;
    let legal = 0;
    for (const column of centerOrder) {
      const height = heightAt(supportIndex, column);
      if (height >= spec.rows) continue;
      legal += 1;
      const landingCell = height * spec.columns + column;
      const lo = bitLo[landingCell];
      const hi = bitHi[landingCell];
      if (immediate < 0 && classes.hasSingletonAt(ownClass, lo, hi)) immediate = column;
      if (classes.hasSingletonAt(opponentClass, lo, hi)) {
        threats += 1;
        if (forced < 0) forced = column;
      }
    }
    if (immediate >= 0) return TACTICAL_IMMEDIATE_BASE + immediate;
    if (threats > 1) return TACTICAL_LOSS;
    if (legal === 0) return TACTICAL_DRAW;
    if (threats === 1) return forced;
    return TACTICAL_NONE;
  }

  function prepareMoves(stateId, forcedColumn) {
    const supportIndex = states.support[stateId];
    const rank = rankAt(supportIndex);
    const base = rank * spec.columns;
    if (forcedColumn >= 0) {
      moveStack[base] = forcedColumn;
      return 1;
    }
    let count = 0;
    const best = states.bestMove[stateId];
    if (best >= 0 && heightAt(supportIndex, best) < spec.rows) moveStack[base + count++] = best;
    for (const column of centerOrder) {
      if (column === best) continue;
      if (heightAt(supportIndex, column) >= spec.rows) continue;
      moveStack[base + count++] = column;
    }
    return count;
  }

  function search(stateId, alpha, beta) {
    metrics.calls += 1;
    const lower = states.lower[stateId];
    const upper = states.upper[stateId];
    if (lower === upper) return lower;
    if (lower >= beta) return lower;
    if (upper <= alpha) return upper;

    const tactical = tacticalCode(stateId);
    if (tactical >= TACTICAL_IMMEDIATE_BASE) {
      states.lower[stateId] = 1;
      states.upper[stateId] = 1;
      states.bestMove[stateId] = tactical - TACTICAL_IMMEDIATE_BASE;
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

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower);
    beta = Math.min(beta, upper);
    const forced = tactical >= 0 ? tactical : -1;
    const count = prepareMoves(stateId, forced);
    const rank = rankAt(states.support[stateId]);
    const base = rank * spec.columns;
    metrics.expanded += 1;
    let value = -2;
    let selected = -1;
    for (let index = 0; index < count; index += 1) {
      const column = moveStack[base + index];
      const child = advance(stateId, column);
      const score = child === QN_TERMINAL_WIN ? 1 : -search(child, -beta, -alpha);
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
    if (selected >= 0) states.bestMove[stateId] = selected;
    if (value <= originalAlpha) states.upper[stateId] = Math.min(states.upper[stateId], value);
    else if (value >= originalBeta) states.lower[stateId] = Math.max(states.lower[stateId], value);
    else {
      states.lower[stateId] = value;
      states.upper[stateId] = value;
    }
    return value;
  }

  function run() {
    return search(kernel.rootId, -2, 2);
  }

  function rootActionValues() {
    const values = Array(spec.columns).fill(null);
    for (let column = 0; column < spec.columns; column += 1) {
      const child = advance(kernel.rootId, column);
      if (child === QN_ILLEGAL) continue;
      values[column] = child === QN_TERMINAL_WIN ? 1 : -search(child, -2, 2);
    }
    return values;
  }

  return Object.freeze({ packed, rankAt, heightAt, advance, tacticalCode, run, rootActionValues, metrics });
}

function expectedRootActions(spec, oracle) {
  const actions = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0);
    heights[column] = 1;
    actions[column] = oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(column) });
  }
  return actions;
}

function qualifyLockstep(spec, expectedWdl, expectedActions) {
  const baseline = createTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const candidate = createTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const packed = createPackedAdapter(candidate, spec);
  let nonterminalEdges = 0;
  let terminalEdges = 0;
  let illegalEdges = 0;
  for (let stateId = 0; stateId < baseline.kernel.states.count; stateId += 1) {
    assert(stateId < candidate.kernel.states.count, `candidate state missing at ${stateId}`);
    const left = baseline.kernel.stateView(stateId);
    const right = candidate.kernel.stateView(stateId);
    assert(left.supportIndex === right.supportIndex && left.p0Class === right.p0Class && left.p1Class === right.p1Class, `state identity drift at ${stateId}`);
    for (let column = 0; column < spec.columns; column += 1) {
      const a = baseline.kernel.advance(stateId, column);
      const b = packed.advance(stateId, column);
      assert(a === b, `edge mismatch state=${stateId} column=${column} baseline=${a} packed=${b}`);
      if (a === QN_ILLEGAL) illegalEdges += 1;
      else if (a === QN_TERMINAL_WIN) terminalEdges += 1;
      else nonterminalEdges += 1;
    }
  }
  assert(baseline.kernel.states.count === candidate.kernel.states.count, 'reachable q-state count drift');
  assert(baseline.kernel.classes.size === candidate.kernel.classes.size, 'residual class count drift');
  const fresh = createTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const freshPacked = createPackedAdapter(fresh, spec);
  const result = freshPacked.run();
  assert(result === expectedWdl, `packed root WDL mismatch expected=${expectedWdl} got=${result}`);
  const actions = freshPacked.rootActionValues();
  for (let column = 0; column < spec.columns; column += 1) assert(actions[column] === expectedActions[column], `packed root action ${column} mismatch`);
  return { states: baseline.kernel.states.count, classes: baseline.kernel.classes.size, nonterminalEdges, terminalEdges, illegalEdges, packedBytes: packed.packed.descriptor.byteLength + packed.packed.shifts.byteLength + candidate.kernel.support.weights.byteLength };
}

function runBaseline(spec) {
  const wrap = createTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const solver = wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const started = performance.now();
  const result = solver.run();
  return { ms: performance.now() - started, result, expanded: solver.metrics.expanded, calls: solver.metrics.calls };
}

function runPacked(spec) {
  const wrap = createTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const solver = createPackedAdapter(wrap, spec);
  const started = performance.now();
  const result = solver.run();
  return { ms: performance.now() - started, result, expanded: solver.metrics.expanded, calls: solver.metrics.calls };
}

function bench(spec, repeats = 31) {
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const qualification = qualifyLockstep(spec, oracle.rootWdl, expectedActions);
  runBaseline(spec);
  runPacked(spec);
  const baselineRuns = [];
  const packedRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    if (repeat & 1) {
      packedRuns.push(runPacked(spec));
      baselineRuns.push(runBaseline(spec));
    } else {
      baselineRuns.push(runBaseline(spec));
      packedRuns.push(runPacked(spec));
    }
  }
  for (const run of baselineRuns) assert(run.result === oracle.rootWdl, 'baseline WDL drift');
  for (const run of packedRuns) assert(run.result === oracle.rootWdl, 'packed WDL drift');
  const baselineMs = median(baselineRuns.map((x) => x.ms));
  const packedMs = median(packedRuns.map((x) => x.ms));
  const baselineRep = [...baselineRuns].sort((a, b) => a.ms - b.ms)[Math.floor(repeats / 2)];
  const packedRep = [...packedRuns].sort((a, b) => a.ms - b.ms)[Math.floor(repeats / 2)];
  assert(baselineRep.expanded === packedRep.expanded && baselineRep.calls === packedRep.calls, 'search work drift');
  const result = { geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`, baselineMs, packedMs, ratioPackedOverBaseline: packedMs / baselineMs, expanded: baselineRep.expanded, calls: baselineRep.calls, qualification };
  console.error(`[support-solver] ${result.geometry} baseline=${baselineMs.toFixed(3)}ms packed=${packedMs.toFixed(3)}ms ratio=${result.ratioPackedOverBaseline.toFixed(3)} states=${qualification.states}`);
  return result;
}

const cases = CASES.map((spec) => bench(spec));
console.error(`PACKED_SUPPORT_SOLVER_SUMMARY=${JSON.stringify(cases)}`);
console.log(JSON.stringify({
  kind: 'connect4-packed-support-term-id-solver-integration-v1',
  status: 'complete',
  date: '2026-09-11',
  authority: 'support access only; term-ID quotient identity/search semantics unchanged',
  qualification: 'lockstep complete graph qID/classID/edge identity plus independent BSFP root/action WDL',
  timing: 'solve-only; candidate still pays legacy support allocation outside timed region, so this isolates hot support access rather than final memory integration',
  cases,
}, null, 2));
