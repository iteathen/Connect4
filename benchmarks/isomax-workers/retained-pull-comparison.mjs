import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { IsoMaxSolver } from '../../components/isometric/solver.mjs';
import { IsoMaxBranchManager } from '../../components/isometric/execution/branch-manager.mjs';
import { IsoMaxPullBranchManager } from '../../components/isometric/execution/pull-manager.mjs';
import { makeCorpus } from '../isomax-ordering/corpus.mjs';

const historicalHard = [
  '717657616532237625',
  '466537327657277224',
  '616767454664457417',
].map(sequence => Array.from(sequence, character => Number(character) - 1));
const corpus = process.env.ISOMAX_RETAINED_PULL_CORPUS ?? 'late';
const executionFactor = Number(process.env.ISOMAX_RETAINED_PULL_EXECUTION_FACTOR ?? 4);
if (!Number.isSafeInteger(executionFactor) || executionFactor < 1 || executionFactor > 16) {
  throw new RangeError('invalid ISOMAX_RETAINED_PULL_EXECUTION_FACTOR');
}
const candidateOrder = (process.env.ISOMAX_RETAINED_PULL_CANDIDATE_ORDER ?? 'fifo').toLowerCase();
if (candidateOrder !== 'fifo' && candidateOrder !== 'lifo') {
  throw new RangeError('invalid ISOMAX_RETAINED_PULL_CANDIDATE_ORDER');
}
const roots = corpus === 'hard'
  ? historicalHard
  : makeCorpus({seed:0x102c0, ply:28, count:3}).map(entry => entry.moves);
if (corpus !== 'late' && corpus !== 'hard') throw new Error('invalid ISOMAX_RETAINED_PULL_CORPUS: ' + corpus);
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
  } else if (variant.startsWith('retained-')) {
    const workers = Number(variant.slice('retained-'.length));
    const manager = new IsoMaxPullBranchManager({
      workers,
      maxTasks:262144,
      maxEdges:262144 * 7,
      executionLimit:workers * executionFactor,
      candidateLifo:candidateOrder === 'lifo',
    });
    try {
      result = await manager.solveMoves(moves, {
        timeoutMs:corpus === 'hard' ? 30000 : 15000,
      });
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
    cleanupMs:result.cleanupMs ?? cleanupMs,
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
    retained:variant.startsWith('retained-') ? {
      canonicalQ:result.canonicalQ,
      canonicalEdges:result.canonicalEdges,
      workAllocated:result.workAllocated,
      occurrenceAllocated:result.occurrenceAllocated,
      executionWorkCount:result.executionWorkCount,
      executionAdmissions:result.metrics?.executionAdmissions ?? 0,
      rematerializedExecutions:result.metrics?.rematerializedExecutions ?? 0,
      maxExecutionWork:result.metrics?.maxExecutionWork ?? 0,
      priorityAdmissionPreemptions:result.metrics?.priorityAdmissionPreemptions ?? 0,
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
      reconcileRecords:result.metrics?.reconcileRecords ?? 0,
      duplicateWorkerResets:result.metrics?.duplicateWorkerResets ?? 0,
      retainedContinuations:result.metrics?.retainedContinuations ?? 0,
      priorityUpdateDeferrals:result.metrics?.priorityUpdateDeferrals ?? 0,
      claims:result.metrics?.worker?.claims ?? 0,
      nativeStateEvaluations:result.metrics?.worker?.nativeStateEvaluations ?? 0,
      retainedDescents:result.metrics?.worker?.retainedDescents ?? 0,
      resetRetirements:result.metrics?.worker?.resetRetirements ?? 0,
      frontiers:result.metrics?.worker?.frontiers ?? 0,
      children:result.metrics?.worker?.children ?? 0,
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
  for (const moves of roots) {
    const started = performance.now();
    try {
      records.push({status:'completed', ...(await runRoot(variant, moves))});
    } catch (error) {
      records.push({
        status:'failed',
        sequence:sequence(moves),
        elapsedMs:performance.now() - started,
        error:error?.message ?? String(error),
        maxRssBytes:process.resourceUsage().maxRSS * 1024,
      });
    }
  }
  const failed = records.some(record => record.status === 'failed');
  process.stdout.write(JSON.stringify({kind:'variant', variant, failed, records}) + '\n');
  if (failed) process.exitCode = 2;
} else {
  const root = new URL('../../', import.meta.url);
  const cwd = fileURLToPath(root);
  let sourceRevision = process.env.ISOMAX_SOURCE_SHA ?? null;
  if (!sourceRevision) {
    try {
      sourceRevision = execFileSync('git', ['rev-parse','HEAD'], {cwd,encoding:'utf8'}).trim();
    } catch {
      sourceRevision = 'unknown';
    }
  }
  const variants = ['serial','central-1','retained-1','central-2','retained-2','central-4','retained-4'];
  const report = {
    sourceRevision,
    node:process.version,
    cpu:os.cpus()[0]?.model ?? null,
    corpus,
    executionFactor,
    candidateOrder,
    roots:roots.map(sequence),
    variants:{},
  };

  let oracle = null;
  for (const variant of variants) {
    const child = spawnSync(process.execPath,
      ['--max-old-space-size=4096', fileURLToPath(import.meta.url), 'child', variant],
      {cwd,encoding:'utf8',timeout:110000,windowsHide:true});
    if (child.error) throw child.error;
    const line = child.stdout.trim().split('\n').filter(Boolean).at(-1);
    if (!line) throw new Error(variant + ' emitted no structured result: ' + child.stderr);
    const parsed = JSON.parse(line);
    report.variants[variant] = parsed.records;
    const completed = parsed.records.filter(record => record.status === 'completed');
    if (oracle === null) {
      if (parsed.failed) throw new Error('serial control failed: ' + child.stderr + '\n' + child.stdout);
      oracle = completed.map(record => [record.sequence,record.value,record.move]);
    } else {
      for (const record of completed) {
        const expected = oracle.find(entry => entry[0] === record.sequence);
        assert.deepEqual([record.sequence,record.value,record.move], expected,
          variant + ' exact decision differs from serial control');
      }
    }
    if (child.status !== 0 && !parsed.failed) {
      throw new Error(variant + ' exited nonzero without a recorded case failure: ' + child.stderr);
    }
  }

  for (const [variant, records] of Object.entries(report.variants)) {
    report.variants[variant] = {
      totalMs:records.reduce((sum,record)=>sum+(record.elapsedMs ?? 0),0),
      resultReadyMs:records.reduce((sum,record)=>sum+(record.resultReadyMs ?? record.elapsedMs ?? 0),0),
      cleanupMs:records.reduce((sum,record)=>sum+(record.cleanupMs ?? 0),0),
      maxRssBytes:Math.max(...records.map(record=>record.maxRssBytes ?? 0)),
      failed:records.some(record => record.status === 'failed'),
      records,
    };
  }
  report.sameExactDecisions = true;
  report.failedVariants = Object.entries(report.variants)
    .filter(([,entry]) => entry.failed)
    .map(([variant]) => variant);

  const sum = values => values.reduce((total, value) => total + (value ?? 0), 0);
  const summary = {
    kind:'retained-comparison-summary',
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
      resultReadyMs:entry.resultReadyMs,
      cleanupMs:entry.cleanupMs,
      maxRssBytes:entry.maxRssBytes,
      failed:entry.failed,
      values:records.map(record => record.status === 'completed'
        ? [record.sequence, record.value, record.move]
        : [record.sequence, 'FAILED', record.error]),
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
    if (variant.startsWith('retained-')) {
      const bands = Array(8).fill(0);
      for (const record of records) {
        for (let index = 0; index < bands.length; index++) bands[index] += record.retained?.claimsByBand?.[index] ?? 0;
      }
      item.retained = {
        canonicalQ:sum(records.map(record => record.retained?.canonicalQ)),
        canonicalEdges:sum(records.map(record => record.retained?.canonicalEdges)),
        workAllocatedMax:Math.max(...records.map(record => record.retained?.workAllocated ?? 0)),
        occurrenceAllocatedMax:Math.max(...records.map(record => record.retained?.occurrenceAllocated ?? 0)),
        executionWorkCountMax:Math.max(...records.map(record => record.retained?.executionWorkCount ?? 0)),
        executionAdmissions:sum(records.map(record => record.retained?.executionAdmissions)),
        rematerializedExecutions:sum(records.map(record => record.retained?.rematerializedExecutions)),
        maxExecutionWork:Math.max(...records.map(record => record.retained?.maxExecutionWork ?? 0)),
        priorityAdmissionPreemptions:sum(records.map(record => record.retained?.priorityAdmissionPreemptions)),
        publications:sum(records.map(record => record.retained?.publications)),
        childOccurrences:sum(records.map(record => record.retained?.childOccurrences)),
        qReuses:sum(records.map(record => record.retained?.qReuses)),
        decisionExpansions:sum(records.map(record => record.retained?.decisionExpansions)),
        passthroughExpansions:sum(records.map(record => record.retained?.passthroughExpansions)),
        duplicateReadyCollapsed:sum(records.map(record => record.retained?.duplicateReadyCollapsed)),
        duplicateRunningRetired:sum(records.map(record => record.retained?.duplicateRunningRetired)),
        exactDuplicateCompletions:sum(records.map(record => record.retained?.exactDuplicateCompletions)),
        workerDeathRequeues:sum(records.map(record => record.retained?.workerDeathRequeues)),
        demandResurrectionRequeues:sum(records.map(record => record.retained?.demandResurrectionRequeues)),
        staleAttempts:sum(records.map(record => record.retained?.staleAttempts)),
        slotReclaims:sum(records.map(record => record.retained?.slotReclaims)),
        priorityUpdates:sum(records.map(record => record.retained?.priorityUpdates)),
        reconcileMs:sum(records.map(record => record.retained?.reconcileMs)),
        reconcileRecords:sum(records.map(record => record.retained?.reconcileRecords)),
        duplicateWorkerResets:sum(records.map(record => record.retained?.duplicateWorkerResets)),
        retainedContinuations:sum(records.map(record => record.retained?.retainedContinuations)),
        priorityUpdateDeferrals:sum(records.map(record => record.retained?.priorityUpdateDeferrals)),
        claims:sum(records.map(record => record.retained?.claims)),
        frontiers:sum(records.map(record => record.retained?.frontiers)),
        children:sum(records.map(record => record.retained?.children)),
        retainedDescents:sum(records.map(record => record.retained?.retainedDescents)),
        resetRetirements:sum(records.map(record => record.retained?.resetRetirements)),
        nativeStateEvaluations:sum(records.map(record => record.retained?.nativeStateEvaluations)),
        transitionAttempts:sum(records.map(record => record.retained?.transitionAttempts)),
        staleQueueRecords:sum(records.map(record => record.retained?.staleQueueRecords)),
        queueDequeues:sum(records.map(record => record.retained?.queueDequeues)),
        freeSlotWaits:sum(records.map(record => record.retained?.freeSlotWaits)),
        workerPathReplays:sum(records.map(record => record.retained?.workerPathReplays)),
        workerPathReplayApplies:sum(records.map(record => record.retained?.workerPathReplayApplies)),
        workerPathReplayUndos:sum(records.map(record => record.retained?.workerPathReplayUndos)),
        claimsByBand:bands,
      };
    }
    summary.variants[variant] = item;
  }

  summary.failedVariants = report.failedVariants;
  if (process.env.ISOMAX_RETAINED_PULL_SUMMARY_ONLY === '1') {
    process.stdout.write(JSON.stringify(summary) + '\n');
  } else {
    process.stdout.write(JSON.stringify(report) + '\n');
    process.stdout.write(JSON.stringify(summary) + '\n');
  }
  if (report.failedVariants.length) process.exitCode = 1;
}
