import { availableParallelism } from 'node:os';
import { performance } from 'node:perf_hooks';
import {
  startOnlineDedupOwner,
  startOnlineSearchWorkers,
  runOnlinePathTasks,
} from './quotient-online-semantic-worker-pool.mjs';
import { createSemanticSharedTtView } from './quotient-semantic-shared-tt.mjs';

const SPEC = Object.freeze({ columns: 4, rows: 5, connect: 4 });
const REPEATS = Number(process.env.REPEATS ?? 5);
const DEPTH = Number(process.env.LOOKAHEAD_DEPTH ?? 2);
const PROBE_DEPTH = Number(process.env.PROBE_DEPTH ?? 2);
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const WORKER_COUNTS = (process.env.WORKER_COUNTS ?? '1,2,3,4')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isInteger(value) && value > 0);
const EXPECTED_ACTIONS = Object.freeze([0, 0, 0, 0]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function assertReduction(reduced, label) {
  assert(reduced.rootWdl === 0, `${label}: root expected draw, got ${reduced.rootWdl}`);
  for (let column = 0; column < EXPECTED_ACTIONS.length; column += 1) {
    assert(reduced.rootActions[column] === EXPECTED_ACTIONS[column], `${label}: column ${column} expected draw, got ${reduced.rootActions[column]}`);
  }
}

const dedup = await startOnlineDedupOwner(SPEC, {
  prefixClasses: PREFIX_CLASSES,
  entryCapacity: 1 << 19,
  termCapacity: 1 << 24,
});
const plan = await dedup.buildPlan(DEPTH, PROBE_DEPTH);
assert(plan.tasks.length > 0, 'lookahead plan produced no online tasks');
for (const task of plan.tasks) {
  assert(Array.isArray(task.path), `planner task ${task.stateId} is missing representative path`);
  assert(task.path.length === DEPTH, `planner task ${task.stateId} path length ${task.path.length} != ${DEPTH}`);
}

const ttUsage = createSemanticSharedTtView(dedup.published.semanticArena);
const results = [];
for (const requested of WORKER_COUNTS) {
  const count = Math.max(1, Math.min(requested, availableParallelism()));
  const workers = await startOnlineSearchWorkers(count, SPEC, dedup.published.semanticArena, {
    prefixClasses: PREFIX_CLASSES,
    etc: false,
  });
  try {
    await dedup.reset();
    const warmup = await runOnlinePathTasks(workers, plan.tasks);
    const warmReduced = await dedup.reducePlan(plan.planId, warmup.frontierValues);
    assertReduction(warmReduced, `${count}-worker warmup`);

    const runs = [];
    for (let repeat = 0; repeat < REPEATS; repeat += 1) {
      await dedup.reset();
      const started = performance.now();
      const taskRun = await runOnlinePathTasks(workers, plan.tasks);
      const reduceStarted = performance.now();
      const reduced = await dedup.reducePlan(plan.planId, taskRun.frontierValues);
      const reduceMs = performance.now() - reduceStarted;
      assertReduction(reduced, `${count}-worker repeat=${repeat}`);
      const usage = ttUsage.stats();
      assert(usage.entries > 0, `${count}-worker semantic TT stayed empty`);
      assert(usage.entries <= usage.entryCapacity, 'semantic TT entry count overflowed capacity');
      assert(usage.termIdsUsed <= usage.termCapacity, 'semantic TT term arena overflowed capacity');
      runs.push(Object.freeze({
        taskMs: taskRun.solveMs,
        reduceMs,
        totalMs: performance.now() - started,
        expanded: taskRun.metrics.expanded ?? 0,
        calls: taskRun.metrics.calls ?? 0,
        ttExactReturns: taskRun.metrics.ttExactReturns ?? 0,
        ttBoundReturns: taskRun.metrics.ttBoundReturns ?? 0,
        ttEntries: usage.entries,
        ttTermIds: usage.termIdsUsed,
        localStateHighWater: taskRun.localStateHighWater,
        localClassHighWater: taskRun.localClassHighWater,
        workerTaskCounts: taskRun.workerTaskCounts,
      }));
      await dedup.cleanup();
    }

    results.push(Object.freeze({
      requestedWorkers: requested,
      workers: count,
      taskMsMedian: median(runs.map((run) => run.taskMs)),
      totalMsMedian: median(runs.map((run) => run.totalMs)),
      expandedMedian: median(runs.map((run) => run.expanded)),
      callsMedian: median(runs.map((run) => run.calls)),
      ttEntriesMedian: median(runs.map((run) => run.ttEntries)),
      ttTermIdsMedian: median(runs.map((run) => run.ttTermIds)),
      runs,
    }));
  } finally {
    await Promise.all(workers.map((worker) => worker.terminate()));
  }
}

await dedup.releasePlan(plan.planId);
await dedup.cleanup();
await dedup.worker.terminate();

const ranked = [...results].sort((a, b) => a.totalMsMedian - b.totalMsMedian);
const summary = Object.freeze({
  kind: 'connect4-online-semantic-shared-tt-worker-v1',
  status: 'complete',
  spec: SPEC,
  repeats: REPEATS,
  lookaheadDepth: DEPTH,
  probeDepth: PROBE_DEPTH,
  availableParallelism: availableParallelism(),
  plan: Object.freeze({
    uniqueNodes: plan.uniqueNodes,
    frontierTasks: plan.frontierTasks,
    transposedParentRefs: plan.transposedParentRefs,
    planMs: plan.planMs,
  }),
  identity: 'support_plus_exact_P0_term_sequence_plus_exact_P1_term_sequence',
  completeGlobalGraphRequiredByRecursiveSearch: false,
  falseHashHitsPermitted: false,
  results,
  best: ranked[0] ?? null,
});

console.error(`ONLINE_SEMANTIC_WORKER_SUMMARY=${JSON.stringify(summary)}`);
console.log(JSON.stringify(summary, null, 2));
