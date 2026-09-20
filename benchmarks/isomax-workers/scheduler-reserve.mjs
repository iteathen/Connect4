import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { IsoMaxSolver } from '../../components/isometric/solver.mjs';
import { IsoMaxBranchManager } from '../../components/isometric/execution/branch-manager.mjs';

const roots = ['717657616532237625','466537327657277224','616767454664457417'];
const emit = data => fs.writeSync(1, JSON.stringify(data) + '\n');
const median = values => {
  const sorted = [...values].sort((a,b)=>a-b);
  return sorted[Math.floor(sorted.length/2)];
};

if (process.argv[2] === 'child') {
  const workers = Number(process.argv[3]);
  const reserve = Number(process.argv[4] ?? 0);
  for (const sequence of roots) {
    const moves = Array.from(sequence, c => Number(c) - 1);
    const start = performance.now();
    let result;
    if (workers === 0) {
      result = new IsoMaxSolver().solveMoves(moves);
    } else {
      const manager = new IsoMaxBranchManager({ workers, readyReserve: reserve });
      try {
        result = await manager.solveMoves(moves, { timeoutMs: 30000 });
      } finally {
        await manager.close();
      }
    }
    emit({
      kind: 'root',
      workers,
      reserve,
      sequence,
      wallMs: performance.now() - start,
      value: result.value,
      move: result.move,
      nodes: result.metrics?.nodes ?? result.metrics?.recursiveCalls ?? 0,
      resultReadyMs: result.resultReadyMs ?? null,
      metrics: result.metrics ?? null,
      executor: result.executor ?? null,
      scheduler: result.scheduler ?? null,
      maxRssBytes: process.resourceUsage().maxRSS * 1024,
    });
  }
} else {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const output = path.resolve(process.argv[2] ?? path.join(root, 'issue-102-scheduler-reserve.json'));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
  if (git('status','--porcelain')) throw new Error('commit source before measuring');

  const configs = [
    { label:'serial', workers:0, reserve:0 },
    { label:'w1-r0', workers:1, reserve:0 },
    { label:'w1-r1', workers:1, reserve:1 },
    { label:'w2-r0', workers:2, reserve:0 },
    { label:'w2-r1', workers:2, reserve:1 },
    { label:'w2-r2', workers:2, reserve:2 },
    { label:'w4-r0', workers:4, reserve:0 },
    { label:'w4-r1', workers:4, reserve:1 },
    { label:'w4-r4', workers:4, reserve:4 },
  ];
  const byLabel = new Map(configs.map(c => [c.label,c]));
  const orders = [
    ['serial','w1-r0','w1-r1','w2-r0','w2-r1','w2-r2','w4-r0','w4-r1','w4-r4'],
    ['w4-r4','w4-r0','w4-r1','w2-r2','w2-r0','w2-r1','w1-r1','w1-r0','serial'],
    ['serial','w1-r1','w1-r0','w2-r1','w2-r0','w2-r2','w4-r1','w4-r0','w4-r4'],
  ];

  const report = {
    issue: 102,
    sourceRevision: git('rev-parse','HEAD'),
    node: process.version,
    cpu: os.cpus()[0]?.model ?? null,
    availableParallelism: os.availableParallelism(),
    roots,
    policy: {
      freshProcessPerConfigSample: true,
      samplesPerConfig: 3,
      timeoutMsPerRoot: 30000,
      taskQuantum: 'incumbent worker-count policy',
      candidateOnlyChangesReadyReserve: true,
    },
    runs: [],
  };

  let oracle = null;
  for (let sample = 0; sample < orders.length; sample++) {
    for (const label of orders[sample]) {
      const config = byLabel.get(label);
      emit({ phase:'start', sample, ...config });
      const stdout = execFileSync(process.execPath, [
        '--max-old-space-size=4096',
        fileURLToPath(import.meta.url),
        'child',
        String(config.workers),
        String(config.reserve),
      ], {
        cwd: root,
        encoding: 'utf8',
        windowsHide: true,
        timeout: 120000,
        maxBuffer: 16 * 1024 * 1024,
      });
      const records = stdout.trim().split('\n').filter(Boolean).map(JSON.parse);
      assert.equal(records.length, roots.length);
      if (oracle === null) oracle = records.map(r => [r.sequence,r.value,r.move]);
      records.forEach((r,i)=>assert.deepEqual([r.sequence,r.value,r.move], oracle[i]));

      const run = {
        sample,
        ...config,
        records,
        wallMs: records.reduce((sum,r)=>sum+r.wallMs,0),
        resultReadyMs: records.reduce((sum,r)=>sum+(r.resultReadyMs ?? r.wallMs),0),
        nodes: records.reduce((sum,r)=>sum+r.nodes,0),
        maxRssBytes: Math.max(...records.map(r=>r.maxRssBytes)),
        submitted: records.reduce((sum,r)=>sum+(r.metrics?.submitted ?? 0),0),
        retiredTasks: records.reduce((sum,r)=>sum+(r.metrics?.retiredTasks ?? 0),0),
        zeroNodeRetiredTasks: records.reduce((sum,r)=>sum+(r.metrics?.zeroNodeRetiredTasks ?? 0),0),
        idleWithReadyEvents: records.reduce((sum,r)=>sum+(r.metrics?.idleWithReadyEvents ?? 0),0),
        readySamples: records.reduce((sum,r)=>sum+(r.metrics?.readySamples ?? 0),0),
        readyLeavesTotal: records.reduce((sum,r)=>sum+(r.metrics?.readyLeavesTotal ?? 0),0),
        redispatchIdleMsTotal: records.reduce((sum,r)=>sum+(r.executor?.redispatchIdleMsTotal ?? 0),0),
        redispatchIdleMsMax: Math.max(...records.map(r=>r.executor?.redispatchIdleMsMax ?? 0)),
        queueWaitMsTotal: records.reduce((sum,r)=>sum+(r.executor?.queueWaitMsTotal ?? 0),0),
        queueWaitMsMax: Math.max(...records.map(r=>r.executor?.queueWaitMsMax ?? 0)),
        maxQueued: Math.max(...records.map(r=>r.executor?.maxQueued ?? 0)),
        maxPending: Math.max(...records.map(r=>r.metrics?.maxPending ?? 0)),
      };
      report.runs.push(run);
      emit({ phase:'finish', sample, label, wallMs:run.wallMs, nodes:run.nodes,
        redispatchIdleMsTotal:run.redispatchIdleMsTotal, maxQueued:run.maxQueued,
        zeroNodeRetiredTasks:run.zeroNodeRetiredTasks });
    }
  }

  report.sameExactDecisions = true;
  report.summary = configs.map(config => {
    const samples = report.runs.filter(r=>r.label===config.label);
    return {
      ...config,
      wallMs: samples.map(r=>r.wallMs),
      medianWallMs: median(samples.map(r=>r.wallMs)),
      resultReadyMs: samples.map(r=>r.resultReadyMs),
      medianResultReadyMs: median(samples.map(r=>r.resultReadyMs)),
      nodes: samples.map(r=>r.nodes),
      medianNodes: median(samples.map(r=>r.nodes)),
      redispatchIdleMsTotal: samples.map(r=>r.redispatchIdleMsTotal),
      medianRedispatchIdleMsTotal: median(samples.map(r=>r.redispatchIdleMsTotal)),
      idleWithReadyEvents: samples.map(r=>r.idleWithReadyEvents),
      zeroNodeRetiredTasks: samples.map(r=>r.zeroNodeRetiredTasks),
      maxQueued: Math.max(...samples.map(r=>r.maxQueued)),
      maxPending: Math.max(...samples.map(r=>r.maxPending)),
      maxRssBytes: Math.max(...samples.map(r=>r.maxRssBytes)),
      queueWaitMsMax: Math.max(...samples.map(r=>r.queueWaitMsMax)),
      redispatchIdleMsMax: Math.max(...samples.map(r=>r.redispatchIdleMsMax)),
    };
  });

  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flush:true });
  console.log('ISOMAX_SCHEDULER_SUMMARY ' + JSON.stringify(report.summary));
  console.log('ISOMAX_SCHEDULER_REPORT_PATH ' + output);
}
