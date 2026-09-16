import { performance } from 'node:perf_hooks';
import { Solver as BaselineSolver } from '../../../reference/research-prototypes/2026-09-09-decision-state/solver_compact_decision_rank.mjs';
import { parse } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { ResidualSolver } from './residual_solver.mjs';

const ROOTS = Object.freeze([
  Object.freeze({ seq: '663152175', expected: -4, label: 'anchor-loss' }),
  Object.freeze({ seq: '41267575', expected: 3, label: 'anchor-win' }),
]);

function exact16Banks() {
  const banks = [{ lo: 0, hi: 20, pow: 15, offset: 0 }];
  for (let moves = 21; moves <= 34; moves += 1) {
    banks.push({ lo: moves, hi: moves, pow: 15, offset: (moves - 20) * (1 << 15) });
  }
  banks.push({ lo: 35, hi: 42, pow: 15, offset: 15 * (1 << 15) });
  return banks;
}

function baselineOne(position) {
  const solver = new BaselineSolver(19, true, 0);
  solver.configureBanks(exact16Banks());
  solver.resetMetrics();
  const started = performance.now();
  const score = solver.solveBits(position.cLo, position.cHi, position.mLo, position.mHi, position.moves);
  const elapsedMs = performance.now() - started;
  return {
    score,
    elapsedMs,
    nodes: solver.nodes,
    ttHits: solver.ttHits,
    writes: solver.writeSuccess,
    writeAttempts: solver.writeAttempts,
    forcedTransitions: solver.forcedTransitions,
    ttSlots: solver.size,
    ttTypedBytes: solver.keyLo.byteLength + solver.val.byteLength + solver.ctrl.byteLength + solver.owner.byteLength,
  };
}

function residualOne(position) {
  const solver = new ResidualSolver(19);
  const started = performance.now();
  const score = solver.solve(position);
  const elapsedMs = performance.now() - started;
  return { score, elapsedMs, ...solver.metrics() };
}

const requested = process.argv.slice(2);
const roots = requested.length
  ? ROOTS.filter((root) => requested.includes(root.seq) || requested.includes(root.label))
  : ROOTS;
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
  console.error(`[MQ5] ${root.seq} score=${root.expected} baseline nodes=${baseline.nodes} ms=${baseline.elapsedMs.toFixed(1)} residual nodes=${residual.nodes} ms=${residual.elapsedMs.toFixed(1)} states=${residual.arena.states} nodeRatio=${result.ratios.residualNodesOverBaseline.toFixed(4)}`);
}

console.log(JSON.stringify({
  kind: 'connect4-minimax-mq5-lazy-residual-alpha-beta',
  status: 'pass',
  fairness: {
    baseline: 'compact exact decision-state + intrinsic rank banking, 512K TT slots',
    candidate: 'support + dynamically minimal residual antichains, lazy dense state arena, decision-only TT admission, intrinsic rank banking, 512K TT slots',
    shared: [
      'exact distance-sensitive scoring',
      'same null-window convergence rule',
      'same center-first order tie-break',
      'same immediate threat / forced block semantics',
      'same future winning-cell-count move-order score',
      'same 16x32K intrinsic-rank TT bank layout',
      'same 512K TT slot count'
    ],
    caveats: [
      'candidate uses root-local JS Map/string semantic interning and is not a production packed representation',
      'candidate TT entry is a serial 32-bit semantic state ID plus bound byte; baseline exact TT record is 10 bytes',
      'total-memory fairness is not claimed in this first structural comparison',
      'different exact state identity changes direct-map collision patterns'
    ]
  },
  results
}, null, 2));
