#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import process from 'node:process';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const SRC = new URL('./', import.meta.url);
const CASE_MARKER = '--depth-case';

function envInteger(name, fallback, minimum, maximum) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be an integer in ${minimum}..${maximum}, got ${raw}`);
  }
  return value;
}

function parseDepths() {
  const raw = process.env.DEPTHS ?? '5,6,7,8,9';
  const values = raw.split(',').map(part => Number(part.trim()));
  if (values.length < 3 || values.some(value => !Number.isSafeInteger(value) || value < 1 || value > 42)) {
    throw new RangeError(`DEPTHS must contain at least three integers in 1..42, got ${raw}`);
  }
  const unique = [...new Set(values)].sort((a, b) => a - b);
  if (unique.length !== values.length) throw new RangeError('DEPTHS must not contain duplicates');
  return unique;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length & 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function sampleStdDev(values) {
  if (values.length < 2) return 0;
  const average = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function solveNormalEquations(rows, values) {
  const width = rows[0].length;
  const matrix = Array.from({ length: width }, () => Array(width + 1).fill(0));
  for (let r = 0; r < rows.length; r += 1) {
    for (let i = 0; i < width; i += 1) {
      matrix[i][width] += rows[r][i] * values[r];
      for (let j = 0; j < width; j += 1) matrix[i][j] += rows[r][i] * rows[r][j];
    }
  }
  for (let pivot = 0; pivot < width; pivot += 1) {
    let best = pivot;
    for (let row = pivot + 1; row < width; row += 1) {
      if (Math.abs(matrix[row][pivot]) > Math.abs(matrix[best][pivot])) best = row;
    }
    if (Math.abs(matrix[best][pivot]) < 1e-12) throw new Error('regression matrix is singular');
    [matrix[pivot], matrix[best]] = [matrix[best], matrix[pivot]];
    const scale = matrix[pivot][pivot];
    for (let column = pivot; column <= width; column += 1) matrix[pivot][column] /= scale;
    for (let row = 0; row < width; row += 1) {
      if (row === pivot) continue;
      const factor = matrix[row][pivot];
      for (let column = pivot; column <= width; column += 1) matrix[row][column] -= factor * matrix[pivot][column];
    }
  }
  return matrix.map(row => row[width]);
}

function fitLogDepthModel(points, degree) {
  if (points.length < degree + 1) return null;
  const features = points.map(point => {
    const row = [1, point.depth];
    if (degree === 2) row.push(point.depth ** 2);
    return row;
  });
  const coefficients = solveNormalEquations(features, points.map(point => Math.log(point.work)));
  const predict = depth => Math.exp(coefficients.reduce((sum, value, index) => {
    if (index === 0) return sum + value;
    if (index === 1) return sum + value * depth;
    return sum + value * depth ** 2;
  }, 0));
  const fitted = points.map(point => predict(point.depth));
  const residuals = points.map((point, index) => Math.log(point.work) - Math.log(fitted[index]));
  const rmseLog = Math.sqrt(mean(residuals.map(value => value ** 2)));
  return Object.freeze({ coefficients, predict, rmseLog });
}

function rollingMape(points, degree) {
  const minimumTrain = degree + 1;
  const errors = [];
  for (let index = minimumTrain; index < points.length; index += 1) {
    const fit = fitLogDepthModel(points.slice(0, index), degree);
    const predicted = fit.predict(points[index].depth);
    errors.push(Math.abs(predicted - points[index].work) / points[index].work);
  }
  return errors.length ? mean(errors) : null;
}

function fitDepthWorkModels(depthRows, key) {
  const points = depthRows.map(row => ({ depth: row.depth, work: row[key] })).filter(point => point.work > 0);
  const models = [];
  for (const degree of [1, 2]) {
    const fit = fitLogDepthModel(points, degree);
    if (!fit) continue;
    models.push(Object.freeze({
      family: degree === 1 ? 'log-linear-exponential' : 'quadratic-log-growth',
      coefficients: fit.coefficients,
      rmseLog: fit.rmseLog,
      rollingMape: rollingMape(points, degree),
      nextDepth: points.at(-1).depth + 1,
      nextPrediction: fit.predict(points.at(-1).depth + 1),
    }));
  }
  return models;
}

function fitWorkTimeModel(depthRows, timeKey) {
  const points = depthRows.filter(row => row.calls > 0 && row[timeKey] > 0);
  if (points.length < 2) return null;
  const rows = points.map(row => [1, Math.log(row.calls)]);
  const coefficients = solveNormalEquations(rows, points.map(row => Math.log(row[timeKey])));
  const predicted = points.map(row => Math.exp(coefficients[0] + coefficients[1] * Math.log(row.calls)));
  const residuals = points.map((row, index) => Math.log(row[timeKey]) - Math.log(predicted[index]));
  return Object.freeze({
    family: 'power-law-time-from-calls',
    coefficients,
    rmseLog: Math.sqrt(mean(residuals.map(value => value ** 2))),
    exponent: coefficients[1],
  });
}

async function buildSearcher(depth, budgetBytes, spec = DOMAIN) {
  const [{ createSlot64ResidualQuotientKernel }, { createSemanticSharedTtArena },
    { createOnlineSemanticQuotientSearcher }, { createBoundedStoragePlan }] = await Promise.all([
    import(new URL('quotient-native-negamax-slot64-residual-kernel.mjs', SRC)),
    import(new URL('quotient-semantic-shared-tt.mjs', SRC)),
    import(new URL('quotient-online-semantic-search-lib.mjs', SRC)),
    import(new URL('quotient-bounded-storage-plan.mjs', SRC)),
  ]);
  const { kernel } = createSlot64ResidualQuotientKernel(spec, {
    cacheEdges: true,
    prefixClasses: 4096,
    responseClosure: true,
  });
  const plan = createBoundedStoragePlan(kernel, depth, budgetBytes);
  kernel.prepareSearchStorage(plan.searchStorage);
  const arena = createSemanticSharedTtArena({ ...plan.arena, domainSpec: spec });
  const searcher = createOnlineSemanticQuotientSearcher(kernel, arena, { etc: false });
  return Object.freeze({ kernel, plan, searcher });
}

async function warmJit() {
  const warmSpec = Object.freeze({ columns: 4, rows: 3, connect: 3 });
  const built = await buildSearcher(2, 256 * 1048576, warmSpec);
  built.searcher.searchBounded(built.kernel.rootId, -2, 2, 2);
}

async function runDepthCase(depth) {
  const budgetMiB = envInteger('BUDGET_MIB', 2048, 256, 6144);
  await warmJit();
  global.gc?.();
  const setupStart = performance.now();
  const { kernel, plan, searcher } = await buildSearcher(depth, budgetMiB * 1048576);
  const setupMs = performance.now() - setupStart;
  const growthBefore = kernel.storageGrowthStats();
  global.gc?.();
  const cpuStart = process.cpuUsage();
  const timeStart = performance.now();
  const result = searcher.searchBounded(kernel.rootId, -2, 2, depth);
  const searchMs = performance.now() - timeStart;
  const cpu = process.cpuUsage(cpuStart);
  const growthAfter = kernel.storageGrowthStats();
  if (JSON.stringify(growthBefore) !== JSON.stringify(growthAfter)) {
    throw new Error('prepared kernel storage grew during bounded timing search');
  }
  const stats = searcher.stats();
  const memory = kernel.memoryStats();
  const row = Object.freeze({
    kind: 'connect4-standard7x6-depth-scaling-case-v1',
    depth,
    result,
    setupMs,
    searchMs,
    cpuMs: (cpu.user + cpu.system) / 1000,
    calls: stats.search.calls,
    expanded: stats.search.expanded,
    frontierBoundCuts: stats.search.frontierBoundCuts,
    tacticalExact: stats.search.tacticalExact,
    forcedNodes: stats.search.forcedNodes,
    forcedMacroChains: stats.search.forcedMacroChains,
    forcedMacroTransitions: stats.search.forcedMacroTransitions,
    proofProbeMisses: stats.search.proofProbeMisses,
    proofAdmissions: stats.search.proofAdmissions,
    transitionsRequested: stats.search.transitionsRequested,
    states: stats.localStates,
    classes: stats.localClasses,
    classBuilds: stats.descriptorCache.classBuilds,
    directTermWrites: stats.descriptorCache.directTermWrites,
    maxBucketScan: stats.semanticTt.maxBucketScan,
    kernelBytes: memory.totalTypedBytes,
    residualBytes: memory.residual?.totalTypedBytes ?? null,
    responseClosure: kernel.responseClosureProfile,
    rss: process.memoryUsage().rss,
    plan: {
      positionUpperBound: plan.positionUpperBound,
      fullBoundCovered: plan.fullBoundCovered,
      limitingResource: plan.limitingResource,
      estimatedBytes: plan.estimatedBytes,
      states: plan.searchStorage.states,
      classes: plan.searchStorage.classes,
      chunksPerSlot: plan.searchStorage.chunksPerSlot,
      arenaEntries: plan.arena.entryCapacity,
      arenaTerms: plan.arena.termCapacity,
    },
  });
  console.log(`DEPTH_CASE=${JSON.stringify(row)}`);
}

function parseCaseOutput(stdout) {
  const line = stdout.split(/\r?\n/).find(entry => entry.startsWith('DEPTH_CASE='));
  if (!line) throw new Error(`depth case did not emit DEPTH_CASE: ${stdout.slice(-2000)}`);
  return JSON.parse(line.slice('DEPTH_CASE='.length));
}

function exactSignature(row) {
  return JSON.stringify({
    result: row.result,
    calls: row.calls,
    expanded: row.expanded,
    frontierBoundCuts: row.frontierBoundCuts,
    tacticalExact: row.tacticalExact,
    forcedNodes: row.forcedNodes,
    forcedMacroChains: row.forcedMacroChains,
    forcedMacroTransitions: row.forcedMacroTransitions,
    proofProbeMisses: row.proofProbeMisses,
    proofAdmissions: row.proofAdmissions,
    transitionsRequested: row.transitionsRequested,
    states: row.states,
    classes: row.classes,
    classBuilds: row.classBuilds,
    directTermWrites: row.directTermWrites,
    maxBucketScan: row.maxBucketScan,
  });
}

function aggregateDepth(depth, runs) {
  const signature = exactSignature(runs[0]);
  for (const run of runs) {
    if (exactSignature(run) !== signature) throw new Error(`exact work drifted across depth-${depth} repeats`);
  }
  const search = runs.map(run => run.searchMs);
  const cpu = runs.map(run => run.cpuMs);
  const setup = runs.map(run => run.setupMs);
  const first = runs[0];
  const searchMeanMs = mean(search);
  const searchStdDevMs = sampleStdDev(search);
  const cpuMeanMs = mean(cpu);
  return Object.freeze({
    depth,
    status: first.result.status,
    value: first.result.value,
    maxReachedDepth: first.result.maxReachedDepth,
    horizonLeaves: first.result.horizonLeaves,
    calls: first.calls,
    expanded: first.expanded,
    frontierBoundCuts: first.frontierBoundCuts,
    tacticalExact: first.tacticalExact,
    forcedNodes: first.forcedNodes,
    forcedMacroChains: first.forcedMacroChains,
    forcedMacroTransitions: first.forcedMacroTransitions,
    proofProbeMisses: first.proofProbeMisses,
    proofAdmissions: first.proofAdmissions,
    transitionsRequested: first.transitionsRequested,
    states: first.states,
    classes: first.classes,
    classBuilds: first.classBuilds,
    directTermWrites: first.directTermWrites,
    maxBucketScan: first.maxBucketScan,
    searchMeanMs,
    searchMedianMs: median(search),
    searchStdDevMs,
    searchCv: searchMeanMs === 0 ? 0 : searchStdDevMs / searchMeanMs,
    cpuMeanMs,
    cpuMedianMs: median(cpu),
    cpuStdDevMs: sampleStdDev(cpu),
    setupMedianMs: median(setup),
    msPerMillionCallsMedian: median(runs.map(run => run.searchMs * 1e6 / run.calls)),
    kernelBytes: first.kernelBytes,
    residualBytes: first.residualBytes,
    rssMedian: median(runs.map(run => run.rss)),
    plan: first.plan,
    responseClosure: first.responseClosure,
    timingRuns: runs.map(run => Object.freeze({ searchMs: run.searchMs, cpuMs: run.cpuMs, setupMs: run.setupMs, rss: run.rss })),
  });
}

function withGrowthRatios(rows) {
  return rows.map((row, index) => Object.freeze({
    ...row,
    callsRatioFromPrevious: index === 0 ? null : row.calls / rows[index - 1].calls,
    expandedRatioFromPrevious: index === 0 ? null : row.expanded / rows[index - 1].expanded,
    timeRatioFromPrevious: index === 0 ? null : row.searchMedianMs / rows[index - 1].searchMedianMs,
  }));
}

function runCampaign() {
  const depths = parseDepths();
  const repeats = envInteger('REPEATS', 3, 1, 9);
  const maxCaseMs = envInteger('MAX_CASE_MS', 120000, 1000, 900000);
  const rows = [];
  let censored = null;
  for (const depth of depths) {
    const runs = [];
    for (let repeat = 0; repeat < repeats; repeat += 1) {
      const child = spawnSync(process.execPath, ['--expose-gc', new URL(import.meta.url).pathname, CASE_MARKER, String(depth)], {
        encoding: 'utf8',
        env: process.env,
        timeout: maxCaseMs,
        maxBuffer: 16 * 1024 * 1024,
      });
      if (child.error?.code === 'ETIMEDOUT') {
        censored = Object.freeze({ depth, reason: 'case-timeout', maxCaseMs, repeat });
        break;
      }
      if (child.status !== 0) {
        process.stderr.write(child.stderr ?? '');
        throw new Error(`depth ${depth} repeat ${repeat} failed with status ${child.status}`);
      }
      const run = parseCaseOutput(child.stdout);
      runs.push(run);
      console.log(`DEPTH_SAMPLE=${JSON.stringify({ depth, repeat: repeat + 1, status: run.result.status,
        maxReachedDepth: run.result.maxReachedDepth, horizonLeaves: run.result.horizonLeaves,
        calls: run.calls, expanded: run.expanded, frontierBoundCuts: run.frontierBoundCuts,
        searchMs: run.searchMs, cpuMs: run.cpuMs, states: run.states, classes: run.classes })}`);
    }
    if (censored) break;
    const aggregated = aggregateDepth(depth, runs);
    rows.push(aggregated);
    console.log(`DEPTH_AGGREGATE=${JSON.stringify(aggregated)}`);
    if (aggregated.status === 'resolved') break;
  }

  if (rows.length < 3) throw new Error('depth scaling requires at least three completed depth points');
  const enriched = withGrowthRatios(rows);
  const resolved = enriched.find(row => row.status === 'resolved') ?? null;
  const callsModels = fitDepthWorkModels(enriched, 'calls');
  const expandedModels = fitDepthWorkModels(enriched, 'expanded');
  const wallFromCalls = fitWorkTimeModel(enriched, 'searchMedianMs');
  const cpuFromCalls = fitWorkTimeModel(enriched, 'cpuMedianMs');
  const summary = Object.freeze({
    kind: 'connect4-standard7x6-depth-scaling-v1',
    status: resolved ? 'exact-horizon-observed' : censored ? 'censored-before-resolution' : 'measured-range-complete',
    domain: DOMAIN,
    repeats,
    maxCaseMs,
    depthsRequested: depths,
    depthsCompleted: enriched.map(row => row.depth),
    exactResolution: resolved ? Object.freeze({
      firstObservedResolvedDepth: resolved.depth,
      value: resolved.value,
      measuredMedianMs: resolved.searchMedianMs,
      measuredCpuMedianMs: resolved.cpuMedianMs,
    }) : null,
    censored,
    rows: enriched,
    models: Object.freeze({ callsByDepth: callsModels, expandedByDepth: expandedModels, wallFromCalls, cpuFromCalls }),
    interpretation: Object.freeze({
      primaryPredictor: 'exact recursive work versus bounded physical depth',
      secondaryCalibration: 'wall/CPU time versus exact recursive calls',
      closureMetric: 'searchBounded resolved/depth-limited plus horizonLeaves',
      parityControlInExecutablePath: enriched[0].responseClosure?.kind ?? null,
      warning: 'do not extrapolate to 42 physical plies; extrapolate only to an independently established or directly observed exact proof horizon',
    }),
  });
  console.log(`DEPTH_SCALING_SUMMARY=${JSON.stringify(summary)}`);
}

if (process.argv[2] === CASE_MARKER) {
  const depth = Number(process.argv[3]);
  if (!Number.isSafeInteger(depth) || depth < 1 || depth > 42) throw new RangeError('invalid depth case');
  await runDepthCase(depth);
} else {
  runCampaign();
}
