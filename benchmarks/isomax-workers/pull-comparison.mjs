import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import os from 'node:os';
import { IsoMaxSolver } from '../../components/isometric/solver.mjs';
import { IsoMaxBranchManager } from '../../components/isometric/execution/branch-manager.mjs';
import { IsoMaxPullBranchManager } from '../../components/isometric/execution/pull-manager.mjs';
import { makeCorpus } from '../isomax-ordering/corpus.mjs';

const historicalHard = [
  '717657616532237625',
  '466537327657277224',
  '616767454664457417',
].map(sequence => Array.from(sequence, character => Number(character) - 1));
const corpus = process.env.ISOMAX_PULL_CORPUS ?? 'late';
const roots = corpus === 'hard'
  ? historicalHard
  : makeCorpus({seed:0x102c0, ply:28, count:3}).map(entry => entry.moves);
if (corpus !== 'late' && corpus !== 'hard') throw new Error('invalid ISOMAX_PULL_CORPUS: ' + corpus);
const sequence = moves => moves.map(column => column + 1).join('');

async function runRoot(variant, moves) {
  const started = performance.now();
  let result;
  let cleanupMs = 0;
  if (variant === 'serial') {
    result = new IsoMaxSolver().solveMoves(moves);
  } else if (variant.startsWith('central-')) {
    const workers = Number(variant.slice('central-'.length));
    const manager = new IsoMaxBranchManager({workers});
    try {
      result = await manager.solveMoves(moves, {timeoutMs:20000});
    } finally {
      const cleanupStarted = performance.now();
      await manager.close();
      cleanupMs = performance.now() - cleanupStarted;
    }
  } else if (variant.startsWith('pull-')) {
    const workers = Number(variant.slice('pull-'.length));
    const manager = new IsoMaxPullBranchManager({
      workers,
      maxTasks:262144,
      maxEdges:262144 * 7,
      workCapacity:131072,
      queueCapacity:131072,
      publicationCapacity:131072,
    });
    try {
      result = await manager.solveMoves(moves, {timeoutMs:20000});
    } finally {
      const cleanupStarted = performance.now();
      await manager.close();
      cleanupMs = performance.now() - cleanupStarted;
    }
  } else {
    throw new Error('unknown variant ' + variant);
  }

  return {
    sequence:sequence(moves),
    value:result.value,
    move:result.move,
    elapsedMs:performance.now() - started,
    cleanupMs,
    resultReadyMs:result.resultReadyMs ?? null,
    maxRssBytes:process.resourceUsage().maxRSS * 1024,
    central:variant.startsWith('central-') ? {
      calls:result.metrics?.nodes ?? 0,
      expandedEntries:result.metrics?.expandedEntries ?? 0,
      transitionAttempts:result.metrics?.transitionAttempts ?? 0,
      managerExpansions:result.metrics?.managerExpansions ?? 0,
      submitted:result.metrics?.submitted ?? 0,
      retiredTaskNodes:result.metrics?.retiredTaskNodes ?? 0,
      qReuses:result.metrics?.qReuses ?? 0,
    } : null,
    pull:variant.startsWith('pull-') ? {
      canonicalQ:result.canonicalQ,
      canonicalEdges:result.canonicalEdges,
      workAllocated:result.workAllocated,
      publications:result.metrics?.publications ?? 0,
      childOccurrences:result.metrics?.childOccurrences ?? 0,
      qReuses:result.metrics?.qReuses ?? 0,
      decisionExpansions:result.metrics?.decisionExpansions ?? 0,
      passthroughExpansions:result.metrics?.passthroughExpansions ?? 0,
      duplicateReadyCollapsed:result.metrics?.duplicateReadyCollapsed ?? 0,
      duplicateRunningRetired:result.metrics?.duplicateRunningRetired ?? 0,
      exactDuplicateCompletions:result.metrics?.exactDuplicateCompletions ?? 0,
      workerDeathRequeues:result.metrics?.workerDeathRequeues ?? 0,
      demandResurrectionRequeues:result.metrics?.demandResurrectionRequeues ?? 0,
      managerReplayApplies:result.metrics?.replayApplies ?? 0,
      managerReplayUndos:result.metrics?.replayUndos ?? 0,
      staleAttempts:result.metrics?.staleAttempts ?? 0,
      slotReclaims:result.metrics?.slotReclaims ?? 0,
      priorityUpdates:result.metrics?.priorityUpdates ?? 0,
      reconcileMs:result.metrics?.reconcileMs ?? 0,
      claims:result.metrics?.worker?.claims ?? 0,
      nativeStateEvaluations:result.metrics?.worker?.nativeStateEvaluations ?? 0,
      transitionAttempts:result.metrics?.worker?.transitionAttempts ?? 0,
      staleQueueRecords:result.metrics?.worker?.staleQueueRecords ?? 0,
      queueDequeues:result.metrics?.worker?.queueDequeues ?? 0,
      freeSlotWaits:result.metrics?.worker?.freeSlotWaits ?? 0,
      workerPathReplays:result.metrics?.worker?.pathReplays ?? 0,
      workerPathReplayApplies:result.metrics?.worker?.pathReplayApplies ?? 0,
      workerPathReplayUndos:result.metrics?.worker?.pathReplayUndos ?? 0,
      claimsByBand:result.metrics?.worker?.claimsByBand ?? [],
    } : null,
  };
}

if (process.argv[2] === 'child') {
  const variant = process.argv[3];
  const records = [];
  for (const moves of roots) records.push(await runRoot(variant, moves));
  process.stdout.write(JSON.stringify({kind:'variant', variant, records}) + '\n');
} else {
  const root = new URL('../../', import.meta.url);
  const cwd = decodeURIComponent(root.pathname);
  const sourceRevision = execFileSync('git', ['rev-parse','HEAD'], {cwd,encoding:'utf8'}).trim();
  const variants = ['serial','central-1','pull-1','central-2','pull-2','central-4','pull-4'];
  const report = {
    sourceRevision,
    node:process.version,
    cpu:os.cpus()[0]?.model ?? null,
    corpus,
    roots:roots.map(sequence),
    variants:{},
  };

  let oracle = null;
  for (const variant of variants) {
    const child = spawnSync(process.execPath,
      ['--max-old-space-size=4096', new URL(import.meta.url).pathname, 'child', variant],
      {cwd,encoding:'utf8',timeout:90000,windowsHide:true});
    if (child.error) throw child.error;
    if (child.status !== 0) {
      throw new Error(variant + ' failed: ' + child.stderr + '\n' + child.stdout);
    }
    const line = child.stdout.trim().split('\n').filter(Boolean).at(-1);
    const parsed = JSON.parse(line);
    report.variants[variant] = parsed.records;
    if (oracle === null) oracle = parsed.records.map(record => [record.sequence,record.value,record.move]);
    else assert.deepEqual(parsed.records.map(record => [record.sequence,record.value,record.move]), oracle,
      variant + ' exact decisions differ from serial control');
  }

  for (const [variant, records] of Object.entries(report.variants)) {
    report.variants[variant] = {
      totalMs:records.reduce((sum,record)=>sum+record.elapsedMs,0),
      maxRssBytes:Math.max(...records.map(record=>record.maxRssBytes)),
      records,
    };
  }
  report.sameExactDecisions = true;

  const sum = values => values.reduce((total, value) => total + (value ?? 0), 0);
  const summary = {
    kind:'pull-comparison-summary',
    sourceRevision,
    node:report.node,
    cpu:report.cpu,
    corpus,
    roots:report.roots,
    sameExactDecisions:true,
    variants:{},
  };
  for (const [variant, entry] of Object.entries(report.variants)) {
    const records = entry.records;
    const item = {
      totalMs:entry.totalMs,
      maxRssBytes:entry.maxRssBytes,
      values:records.map(record => [record.sequence, record.value, record.move]),
    };
    if (variant.startsWith('central-')) {
      item.central = {
        calls:sum(records.map(record => record.central?.calls)),
        expandedEntries:sum(records.map(record => record.central?.expandedEntries)),
        transitionAttempts:sum(records.map(record => record.central?.transitionAttempts)),
        managerExpansions:sum(records.map(record => record.central?.managerExpansions)),
        submitted:sum(records.map(record => record.central?.submitted)),
        retiredTaskNodes:sum(records.map(record => record.central?.retiredTaskNodes)),
        qReuses:sum(records.map(record => record.central?.qReuses)),
      };
    }
    if (variant.startsWith('pull-')) {
      const bands = Array(8).fill(0);
      for (const record of records) {
        for (let index = 0; index < bands.length; index++) bands[index] += record.pull?.claimsByBand?.[index] ?? 0;
      }
      item.pull = {
        canonicalQ:sum(records.map(record => record.pull?.canonicalQ)),
        canonicalEdges:sum(records.map(record => record.pull?.canonicalEdges)),
        workAllocatedMax:Math.max(...records.map(record => record.pull?.workAllocated ?? 0)),
        publications:sum(records.map(record => record.pull?.publications)),
        childOccurrences:sum(records.map(record => record.pull?.childOccurrences)),
        qReuses:sum(records.map(record => record.pull?.qReuses)),
        decisionExpansions:sum(records.map(record => record.pull?.decisionExpansions)),
        passthroughExpansions:sum(records.map(record => record.pull?.passthroughExpansions)),
        duplicateReadyCollapsed:sum(records.map(record => record.pull?.duplicateReadyCollapsed)),
        duplicateRunningRetired:sum(records.map(record => record.pull?.duplicateRunningRetired)),
        exactDuplicateCompletions:sum(records.map(record => record.pull?.exactDuplicateCompletions)),
        workerDeathRequeues:sum(records.map(record => record.pull?.workerDeathRequeues)),
        demandResurrectionRequeues:sum(records.map(record => record.pull?.demandResurrectionRequeues)),
        staleAttempts:sum(records.map(record => record.pull?.staleAttempts)),
        slotReclaims:sum(records.map(record => record.pull?.slotReclaims)),
        priorityUpdates:sum(records.map(record => record.pull?.priorityUpdates)),
        reconcileMs:sum(records.map(record => record.pull?.reconcileMs)),
        claims:sum(records.map(record => record.pull?.claims)),
        nativeStateEvaluations:sum(records.map(record => record.pull?.nativeStateEvaluations)),
        transitionAttempts:sum(records.map(record => record.pull?.transitionAttempts)),
        staleQueueRecords:sum(records.map(record => record.pull?.staleQueueRecords)),
        queueDequeues:sum(records.map(record => record.pull?.queueDequeues)),
        freeSlotWaits:sum(records.map(record => record.pull?.freeSlotWaits)),
        workerPathReplays:sum(records.map(record => record.pull?.workerPathReplays)),
        workerPathReplayApplies:sum(records.map(record => record.pull?.workerPathReplayApplies)),
        workerPathReplayUndos:sum(records.map(record => record.pull?.workerPathReplayUndos)),
        claimsByBand:bands,
      };
    }
    summary.variants[variant] = item;
  }

  if (process.env.ISOMAX_PULL_SUMMARY_ONLY === '1') {
    process.stdout.write(JSON.stringify(summary) + '\n');
  } else {
    process.stdout.write(JSON.stringify(report) + '\n');
    process.stdout.write(JSON.stringify(summary) + '\n');
  }
}
