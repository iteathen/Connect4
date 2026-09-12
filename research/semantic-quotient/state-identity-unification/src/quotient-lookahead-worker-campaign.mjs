import { availableParallelism } from 'node:os';
import { performance } from 'node:perf_hooks';
import {
  startBranchManager,
  startSearchWorkers,
  runLookaheadTasks,
} from './quotient-shared-worker-pool.mjs';

const SPEC = Object.freeze({ columns: 4, rows: 5, connect: 4 });
const REPEATS = Number(process.env.REPEATS ?? 7);
const DEPTHS = (process.env.LOOKAHEAD_DEPTHS ?? '3,4,2,5')
  .split(',').map((value) => Number(value.trim())).filter(Number.isInteger);
const WORKER_COUNTS = (process.env.WORKER_COUNTS ?? '1,2,3,4')
  .split(',').map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0);
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const PROBE_DEPTH = Number(process.env.PROBE_DEPTH ?? 2);
const EXPECTED_ACTIONS = Object.freeze([0, 0, 0, 0]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function assertReduction(reduced, label) {
  assert(reduced.rootWdl === 0, `${label}: expected root draw, got ${reduced.rootWdl}`);
  for (let column = 0; column < EXPECTED_ACTIONS.length; column += 1) {
    assert(reduced.rootActions[column] === EXPECTED_ACTIONS[column], `${label}: column ${column} expected draw, got ${reduced.rootActions[column]}`);
  }
}

const branchManager = await startBranchManager(SPEC, PREFIX_CLASSES);
const shared = Object.freeze({ spec: SPEC, graph: branchManager.published.graph, arena: branchManager.published.arena });
assert(shared.graph.stateCount === 294593, `q-state mismatch ${shared.graph.stateCount}`);
assert(shared.graph.residualClassCount === 69707, `class mismatch ${shared.graph.residualClassCount}`);

const plans = [];
for (const depth of DEPTHS) {
  const built = await branchManager.buildPlan(depth, PROBE_DEPTH);
  plans.push(Object.freeze({
    depth,
    planId: built.planId,
    planMs: built.planMs,
    uniqueNodes: built.uniqueNodes,
    frontierTasks: built.frontierTasks,
    transposedParentRefs: built.transposedParentRefs,
    tasks: built.tasks,
  }));
}

const workerResults = [];
for (const requested of WORKER_COUNTS) {
  const count = Math.max(1, Math.min(requested, availableParallelism()));
  const workers = await startSearchWorkers(count, shared);
  try {
    for (const plan of plans) {
      await branchManager.reset();
      const warmTasks = await runLookaheadTasks(workers, plan.tasks);
      const warmReduced = await branchManager.reducePlan(plan.planId, warmTasks.frontierValues);
      assertReduction(warmReduced, `warmup depth=${plan.depth} workers=${count}`);

      const runs = [];
      for (let repeat = 0; repeat < REPEATS; repeat += 1) {
        await branchManager.reset();
        const started = performance.now();
        const taskRun = await runLookaheadTasks(workers, plan.tasks);
        const reduceStarted = performance.now();
        const reduced = await branchManager.reducePlan(plan.planId, taskRun.frontierValues);
        const reduceMs = performance.now() - reduceStarted;
        const totalMs = performance.now() - started;
        assertReduction(reduced, `depth=${plan.depth} workers=${count} repeat=${repeat}`);
        runs.push(Object.freeze({
          taskMs: taskRun.solveMs,
          reduceMs,
          totalMs,
          expanded: taskRun.metrics.expanded ?? 0,
          calls: taskRun.metrics.calls ?? 0,
          ttExact: taskRun.metrics.ttExactReturns ?? 0,
          ttBound: taskRun.metrics.ttBoundReturns ?? 0,
          workerTaskCounts: taskRun.workerTaskCounts,
        }));
        await branchManager.cleanup();
      }

      workerResults.push(Object.freeze({
        requestedWorkers: requested,
        workers: count,
        depth: plan.depth,
        planMs: plan.planMs,
        uniqueNodes: plan.uniqueNodes,
        frontierTasks: plan.frontierTasks,
        transposedParentRefs: plan.transposedParentRefs,
        taskMsMedian: median(runs.map((run) => run.taskMs)),
        reduceMsMedian: median(runs.map((run) => run.reduceMs)),
        totalMsMedian: median(runs.map((run) => run.totalMs)),
        expandedMedian: median(runs.map((run) => run.expanded)),
        callsMedian: median(runs.map((run) => run.calls)),
        runs,
      }));
    }
  } finally {
    await Promise.all(workers.map((worker) => worker.terminate()));
  }
}

for (const plan of plans) await branchManager.releasePlan(plan.planId);
await branchManager.cleanup();
await branchManager.worker.terminate();

const ranked = [...workerResults].sort((a, b) => a.totalMsMedian - b.totalMsMedian);
const summary = Object.freeze({
  kind: 'connect4-quotient-lookahead-worker-tournament-v2',
  status: 'complete',
  spec: SPEC,
  repeats: REPEATS,
  probeDepth: PROBE_DEPTH,
  availableParallelism: availableParallelism(),
  depths: DEPTHS,
  workerCounts: WORKER_COUNTS,
  plans: plans.map(({ tasks, ...rest }) => rest),
  results: workerResults,
  best: ranked[0] ?? null,
});

console.error(`LOOKAHEAD_WORKER_SUMMARY=${JSON.stringify(summary)}`);
console.log(JSON.stringify(summary, null, 2));
