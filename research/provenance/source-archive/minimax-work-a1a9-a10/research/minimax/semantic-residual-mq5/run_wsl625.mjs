import { performance } from 'node:perf_hooks';
import { Solver as BaselineSolver } from '../../../reference/research-prototypes/2026-09-09-decision-state/solver_compact_decision_rank.mjs';
import { parse } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { Wsl625ResidualSolver } from './residual_solver_wsl625.mjs';

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
  const solver = new BaselineSolver(19, true, 0); solver.configureBanks(exact16Banks()); solver.resetMetrics();
  const t = performance.now(); const score = solver.solveBits(position.cLo, position.cHi, position.mLo, position.mHi, position.moves);
  return { score, elapsedMs: performance.now() - t, nodes: solver.nodes, ttHits: solver.ttHits, writes: solver.writeSuccess, forcedTransitions: solver.forcedTransitions, ttSlots: solver.size, ttTypedBytes: solver.keyLo.byteLength + solver.val.byteLength + solver.ctrl.byteLength + solver.owner.byteLength };
}
function residualOne(position) {
  const solver = new Wsl625ResidualSolver(19); const t = performance.now(); const score = solver.solve(position);
  return { score, elapsedMs: performance.now() - t, ...solver.metrics() };
}
const requested = process.argv.slice(2);
const roots = requested.length ? ROOTS.filter((root) => requested.includes(root.seq) || requested.includes(root.label)) : ROOTS;
if (!roots.length) throw new Error('no requested roots matched');
const results = [];
for (const root of roots) {
  const position = parse(root.seq), baseline = baselineOne(position);
  if (baseline.score !== root.expected) throw new Error(`${root.seq}: baseline expected ${root.expected}, got ${baseline.score}`);
  const residual = residualOne(position);
  if (residual.score !== root.expected) throw new Error(`${root.seq}: WSL residual expected ${root.expected}, got ${residual.score}`);
  const ratios = { nodes: residual.nodes / baseline.nodes, elapsed: residual.elapsedMs / baseline.elapsedMs, search: residual.searchMs / baseline.elapsedMs, writes: residual.writeSuccess / baseline.writes, hits: residual.ttHits / baseline.ttHits };
  results.push({ ...root, moves: position.moves, baseline, residual, ratios });
  console.error(`[MQ5 WSL625] ${root.seq} baseline nodes=${baseline.nodes} ms=${baseline.elapsedMs.toFixed(1)} residual nodes=${residual.nodes} ms=${residual.elapsedMs.toFixed(1)} states=${residual.stateArena.states} sides=${residual.sideArena.sideStates} normalizes=${residual.sideArena.normalizeCalls} nodeRatio=${ratios.nodes.toFixed(4)}`);
}
console.log(JSON.stringify({ kind: 'connect4-minimax-mq5-wsl625-residual-alpha-beta', status: 'pass', candidate: 'WSL-625 Uint16 residual antichain IDs + numeric exact side interning + BigInt whole-state tuple identity', fairness: { baseline: 'compact exact decision-state + intrinsic rank banking, 512K TT slots', candidate: 'WSL-625 residual exact state + same decision/rank search structure, 512K TT slots', caveats: ['equal total memory not yet claimed', 'JS Maps still own side/state interning and transition caches', 'direct-map collision patterns differ with semantic identity'] }, results }, null, 2));
