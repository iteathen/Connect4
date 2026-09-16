import { availableParallelism } from 'node:os';
import { performance } from 'node:perf_hooks';
import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  tacticalExactValue,
  tacticalForcedColumn,
} from './quotient-negamax-domain-contract.mjs';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const MAX_DEPTH = Number(process.env.MAX_DEPTH ?? 6);
const PROBE_DEPTH = Number(process.env.PROBE_DEPTH ?? 2);
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const MAX_PROFILE_WORKERS = Number(process.env.MAX_PROFILE_WORKERS ?? Math.min(16, availableParallelism()));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function quantile(sorted, fraction) {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * fraction)));
  return sorted[index];
}

function summarizeValues(values) {
  if (values.length === 0) return Object.freeze({ count: 0, min: 0, p50: 0, p90: 0, p95: 0, max: 0, mean: 0, cv: 0 });
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
  return Object.freeze({
    count: values.length,
    min: sorted[0],
    p50: quantile(sorted, 0.50),
    p90: quantile(sorted, 0.90),
    p95: quantile(sorted, 0.95),
    max: sorted[sorted.length - 1],
    mean,
    cv: mean === 0 ? 0 : Math.sqrt(variance) / mean,
  });
}

function lptSchedule(costs, workers) {
  const loads = Array(workers).fill(0);
  const sorted = [...costs].sort((a, b) => b - a);
  for (const cost of sorted) {
    let target = 0;
    for (let worker = 1; worker < workers; worker += 1) {
      if (loads[worker] < loads[target]) target = worker;
    }
    loads[target] += cost;
  }
  const total = loads.reduce((sum, value) => sum + value, 0);
  const ideal = workers > 0 ? total / workers : 0;
  const makespan = Math.max(...loads, 0);
  return Object.freeze({
    workers,
    makespan,
    ideal,
    efficiency: makespan === 0 ? 1 : ideal / makespan,
    maxToMean: ideal === 0 ? 1 : makespan / ideal,
    loads: Object.freeze(loads),
  });
}

const { kernel } = createSlot64ResidualQuotientKernel(SPEC, {
  cacheEdges: false,
  prefixClasses: PREFIX_CLASSES,
});

const layers = [new Set([kernel.rootId])];
const expansion = [];
const logicalClassSets = [];
const allClasses = new Set();
const buildStarted = performance.now();

for (let depth = 0; depth <= MAX_DEPTH; depth += 1) {
  const layer = layers[depth];
  const layerClasses = new Set();
  let tacticalExact = 0;
  let immediateWins = 0;
  let forcedLosses = 0;
  let draws = 0;
  let forcedResponses = 0;
  let openNodes = 0;

  for (const stateId of layer) {
    layerClasses.add(kernel.states.p0Class[stateId]);
    layerClasses.add(kernel.states.p1Class[stateId]);
    const code = kernel.tacticalCode(stateId);
    const exact = tacticalExactValue(code);
    if (exact !== null) {
      tacticalExact += 1;
      if (exact > 0) immediateWins += 1;
      else if (exact < 0) forcedLosses += 1;
      else draws += 1;
    } else if (tacticalForcedColumn(code, SPEC.columns) >= 0) {
      forcedResponses += 1;
    } else {
      openNodes += 1;
    }
  }
  for (const classId of layerClasses) allClasses.add(classId);
  logicalClassSets.push(layerClasses);

  if (depth === MAX_DEPTH) {
    expansion.push(Object.freeze({
      depth,
      layerStates: layer.size,
      layerClasses: layerClasses.size,
      cumulativeClasses: allClasses.size,
      tacticalExact,
      immediateWins,
      forcedLosses,
      draws,
      forcedResponses,
      openNodes,
      edges: 0,
      terminalEdges: 0,
      nonterminalEdges: 0,
      nextUniqueStates: 0,
      duplicateEdges: 0,
      transposedChildren: 0,
      maxFanIn: 0,
      expandMs: 0,
    }));
    break;
  }

  const next = new Set();
  const fanIn = new Map();
  let edges = 0;
  let terminalEdges = 0;
  const expandStarted = performance.now();

  for (const stateId of layer) {
    const code = kernel.tacticalCode(stateId);
    if (tacticalExactValue(code) !== null) continue;
    const forced = tacticalForcedColumn(code, SPEC.columns);
    const moves = forced >= 0 ? [forced] : kernel.centerOrder;
    for (const column of moves) {
      const supportIndex = kernel.states.support[stateId];
      if (kernel.supportAccess.landingAt(supportIndex, column) === 0xff) continue;
      edges += 1;
      const child = kernel.advance(stateId, column);
      if (child === QN_TERMINAL_WIN) {
        terminalEdges += 1;
        continue;
      }
      if (child === QN_ILLEGAL) throw new Error(`legal presearch move became illegal at depth ${depth}, state ${stateId}, column ${column}`);
      next.add(child);
      fanIn.set(child, (fanIn.get(child) ?? 0) + 1);
    }
  }
  const expandMs = performance.now() - expandStarted;
  const nonterminalEdges = edges - terminalEdges;
  const duplicateEdges = nonterminalEdges - next.size;
  let transposedChildren = 0;
  let maxFanIn = 0;
  for (const count of fanIn.values()) {
    if (count > 1) transposedChildren += 1;
    if (count > maxFanIn) maxFanIn = count;
  }

  expansion.push(Object.freeze({
    depth,
    layerStates: layer.size,
    layerClasses: layerClasses.size,
    cumulativeClasses: allClasses.size,
    tacticalExact,
    immediateWins,
    forcedLosses,
    draws,
    forcedResponses,
    openNodes,
    edges,
    terminalEdges,
    nonterminalEdges,
    nextUniqueStates: next.size,
    duplicateEdges,
    transposedChildren,
    maxFanIn,
    expandMs,
  }));
  layers.push(next);
}

const buildMs = performance.now() - buildStarted;
const memoryBeforeProbe = kernel.memoryStats();
const logicalCumulativeStates = [];
let cumulativeStates = 0;
for (const layer of layers) {
  cumulativeStates += layer.size;
  logicalCumulativeStates.push(cumulativeStates);
}

const estimateMemo = new Map();
function estimateWork(stateId, depth) {
  const key = `${stateId}:${depth}`;
  const prior = estimateMemo.get(key);
  if (prior !== undefined) return prior;
  const code = kernel.tacticalCode(stateId);
  if (tacticalExactValue(code) !== null || depth <= 0) {
    estimateMemo.set(key, 1);
    return 1;
  }
  const forced = tacticalForcedColumn(code, SPEC.columns);
  const moves = forced >= 0 ? [forced] : kernel.centerOrder;
  let cost = 1;
  for (const column of moves) {
    const supportIndex = kernel.states.support[stateId];
    if (kernel.supportAccess.landingAt(supportIndex, column) === 0xff) continue;
    const child = kernel.advance(stateId, column);
    if (child === QN_TERMINAL_WIN) cost += 1;
    else if (child !== QN_ILLEGAL) cost += estimateWork(child, depth - 1);
  }
  estimateMemo.set(key, cost);
  return cost;
}

const profiles = [];
const probeStarted = performance.now();
for (let depth = 1; depth <= MAX_DEPTH; depth += 1) {
  const costs = [];
  let closed = 0;
  let forced = 0;
  for (const stateId of layers[depth]) {
    const code = kernel.tacticalCode(stateId);
    if (tacticalExactValue(code) !== null) {
      closed += 1;
      continue;
    }
    if (tacticalForcedColumn(code, SPEC.columns) >= 0) forced += 1;
    costs.push(estimateWork(stateId, PROBE_DEPTH));
  }
  const schedules = [];
  const maxWorkers = Math.max(1, Math.min(MAX_PROFILE_WORKERS, Math.max(1, costs.length)));
  for (let workers = 1; workers <= maxWorkers; workers += 1) schedules.push(lptSchedule(costs, workers));
  profiles.push(Object.freeze({
    depth,
    frontierStates: layers[depth].size,
    dependencyCandidates: costs.length,
    tacticalClosed: closed,
    forcedResponses: forced,
    cost: summarizeValues(costs),
    schedules: Object.freeze(schedules),
  }));
}
const probeMs = performance.now() - probeStarted;
const memoryAfterProbe = kernel.memoryStats();

for (let depth = 0; depth < expansion.length; depth += 1) {
  assert(expansion[depth].layerStates === layers[depth].size, `layer accounting mismatch at depth ${depth}`);
}

const summary = Object.freeze({
  kind: 'connect4-standard7x6-negamax-presearch-profile-v1',
  status: 'complete',
  spec: SPEC,
  maxDepth: MAX_DEPTH,
  probeDepth: PROBE_DEPTH,
  availableParallelism: availableParallelism(),
  buildMs,
  probeMs,
  logicalCumulativeStates: Object.freeze(logicalCumulativeStates),
  expansion: Object.freeze(expansion),
  profiles: Object.freeze(profiles),
  memoryBeforeProbe,
  memoryAfterProbe,
  retainedKernelStatesAfterProbe: kernel.states.count,
  retainedResidualClassesAfterProbe: kernel.classes.size,
});

console.error(`STANDARD7X6_PRESEARCH_SUMMARY=${JSON.stringify(summary)}`);
console.log(JSON.stringify(summary, null, 2));
