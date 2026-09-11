import { performance } from 'node:perf_hooks';
import { Solver as BaselineSolver } from '../../../reference/research-prototypes/2026-09-09-decision-state/solver_compact_decision_rank.mjs';
import { parse } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { FactoredResidualSolver } from './residual_solver_factored.mjs';

const ROOTS = Object.freeze([
  Object.freeze({ seq: '663152175', expected: -4, label: 'anchor-loss' }),
  Object.freeze({ seq: '41267575', expected: 3, label: 'anchor-win' }),
]);

function exact16Banks() {
  const banks = [{ lo: 0, hi: 20, pow: 15, offset: 0 }];
  for (let moves = 21; moves <= 34; moves += 1) banks.push({ lo: moves, hi: moves, pow: 15, offset: (moves - 20) * (1 << 15) });
  banks.push({ lo: 35, hi: 42, pow: 15, offset: 15 * (1 << 15) });
  return banks;
}

function baselineOne(position) {
  const solver = new BaselineSolver(19, true, 0);
  solver.configureBanks(exact16Banks());
  solver.resetMetrics();
  const started = performance.now();
  const score = solver.solveBits(position.cLo, position.cHi, position.mLo, position.mHi, position.moves);
  return {
    score,
    elapsedMs: performance.now() - started,
    nodes: solver.nodes,
    ttHits: solver.ttHits,
    writes: solver.writeSuccess,
    forcedTransitions: solver.forcedTransitions,
    ttSlots: solver.size,
    ttTypedBytes: solver.keyLo.byteLength + solver.val.byteLength + solver.ctrl.byteLength + solver.owner.byteLength,
  };
}

function residualOne(position) {
  const solver = new FactoredResidualSolver(19);
  const started = performance.now();
  const score = solver.solve(position);
  return { score, elapsedMs: performance.now() - started, ...solver.metrics() };
}

const requested = process.argv.slice(2);
const roots = requested.length ? ROOTS.filter((root) => requested.includes(root.seq) || requested.includes(root.label)) : ROOTS;
if (roots.length === 0) throw new Error('no requested roots matched');

const results = [];
for (const root of roots) {
  const position = parse(root.seq);
  const baseline = baselineOne(position);
  if (baseline.score !== root.expected) throw new Error(`${root.seq}: baseline expected ${root.expected}, got ${baseline.score}`);
  const residual = residualOne(position);
  if (residual.score !== root.expected) throw new Error(`${root.seq}: residual expected ${root.expected}, got ${residual.score}`);
  if (baseline.score !== residual.score) throw new Error(`${root.seq}: score mismatch`);
  const result = {
    ...root,
    moves: position.moves,
    baseline,
    residual,
    ratios: {
      residualNodesOverBaseline: residual.nodes / baseline.nodes,
      residualElapsedOverBaseline: residual.elapsedMs / baseline.elapsedMs,
      residualSearchMsOverBaselineElapsed: residual.searchMs / baseline.elapsedMs,
      residualWritesOverBaseline: residual.writeSuccess / baseline.writes,
      residualHitsOverBaseline: residual.ttHits / baseline.ttHits,
    },
  };
  results.push(result);
  console.error(`[MQ5 factored] ${root.seq} score=${root.expected} baseline nodes=${baseline.nodes} ms=${baseline.elapsedMs.toFixed(1)} residual nodes=${residual.nodes} ms=${residual.elapsedMs.toFixed(1)} states=${residual.stateArena.states} sides=${residual.sideArena.sideStates} normalizes=${residual.sideArena.normalizeCalls} nodeRatio=${result.ratios.residualNodesOverBaseline.toFixed(4)}`);
}

console.log(JSON.stringify({
  kind: 'connect4-minimax-mq5-factored-residual-alpha-beta',
  status: 'pass',
  candidate: 'whole state = (support,currentSideRef,opponentSideRef); side antichains interned and transformed independently; whole state interned only on traversed edges',
  fairness: {
    baseline: 'compact exact decision-state + intrinsic rank banking, 512K TT slots',
    candidate: 'factored exact residual state + decision-only TT admission + intrinsic rank banking, 512K TT slots',
    caveats: [
      'single-side antichain interning still uses JS Map/string keys',
      'whole-state interning uses exact BigInt tuple keys',
      'candidate TT record is smaller than baseline; equal-total-memory is not yet claimed',
      'direct-map collision patterns differ because semantic identity differs'
    ]
  },
  results
}, null, 2));
