import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { IsoMaxSolver } from '../../components/isometric/solver.mjs';
import { IsoMaxBranchManager } from '../../components/isometric/execution/branch-manager.mjs';
import { makeCorpus } from '../isomax-ordering/corpus.mjs';

const historicalHard = [
  '717657616532237625',
  '466537327657277224',
  '616767454664457417',
].map(sequence => Array.from(sequence, character => Number(character) - 1));

const corpus = process.env.ISOMAX_RETAINED_PULL_CORPUS ?? 'late';
if (corpus !== 'late' && corpus !== 'hard') {
  throw new Error('invalid ISOMAX_RETAINED_PULL_CORPUS: ' + corpus);
}
const roots = corpus === 'hard'
  ? historicalHard
  : makeCorpus({ seed: 0x102c0, ply: 28, count: 3 }).map(entry => entry.moves);
const sequence = moves => moves.map(column => column + 1).join('');

async function runRoot(variant, moves) {
  const started = performance.now();
  let result;
  if (variant === 'serial') {
    result = new IsoMaxSolver().solveMoves(moves);
  } else if (variant.startsWith('shared-')) {
    const workers = Number(variant.slice('shared-'.length));
    const manager = new IsoMaxBranchManager({
      workers,
      qCapacity: corpus === 'hard' ? 262144 : 131072,
      queueCapacity: corpus === 'hard' ? 65536 : 32768,
      branchCapacity: 8192,
      eventCapacity: 16384,
    });
    try {
      result = await manager.solveMoves(moves, {
        timeoutMs: corpus === 'hard' ? 60000 : 30000,
      });
    } finally {
      await manager.close();
    }
  } else {
    throw new Error('unknown variant ' + variant);
  }

  return {
    sequence: sequence(moves),
    value: result.value,
    move: result.move,
    elapsedMs: performance.now() - started,
    resultReadyMs: result.resultReadyMs ?? null,
    cleanupMs: result.cleanupMs ?? 0,
    maxRssBytes: process.resourceUsage().maxRSS * 1024,
    shared: variant.startsWith('shared-') ? {
      canonicalQ: result.canonicalQ,
      liveQ: result.liveQ,
      manager: result.metrics?.manager ?? {},
      worker: result.metrics?.worker ?? {},
      workerDeathRequeues: result.metrics?.workerDeathRequeues ?? 0,
    } : null,
  };
}

if (process.argv[2] === 'child') {
  const variant = process.argv[3];
  const records = [];
  for (const moves of roots) {
    const started = performance.now();
    try {
      records.push({ status: 'completed', ...(await runRoot(variant, moves)) });
    } catch (error) {
      records.push({
        status: 'failed',
        sequence: sequence(moves),
        elapsedMs: performance.now() - started,
        error: error?.message ?? String(error),
        maxRssBytes: process.resourceUsage().maxRSS * 1024,
      });
    }
  }
  const failed = records.some(record => record.status === 'failed');
  process.stdout.write(JSON.stringify({ kind: 'variant', variant, failed, records }) + '\n');
  if (failed) process.exitCode = 2;
} else {
  const root = new URL('../../', import.meta.url);
  const cwd = fileURLToPath(root);
  let sourceRevision = process.env.ISOMAX_SOURCE_SHA ?? null;
  if (!sourceRevision) {
    try {
      sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim();
    } catch {
      sourceRevision = 'unknown';
    }
  }

  const variants = ['serial', 'shared-1', 'shared-2', 'shared-4'];
  const report = {
    kind: 'retained-shared-tt-comparison',
    sourceRevision,
    node: process.version,
    cpu: os.cpus()[0]?.model ?? null,
    corpus,
    roots: roots.map(sequence),
    variants: {},
  };

  let oracle = null;
  for (const variant of variants) {
    const child = spawnSync(
      process.execPath,
      ['--max-old-space-size=4096', fileURLToPath(import.meta.url), 'child', variant],
      { cwd, encoding: 'utf8', timeout: corpus === 'hard' ? 210000 : 120000, windowsHide: true },
    );
    if (child.error) throw child.error;
    const line = child.stdout.trim().split('\n').filter(Boolean).at(-1);
    if (!line) throw new Error(variant + ' emitted no structured result: ' + child.stderr);
    const parsed = JSON.parse(line);
    report.variants[variant] = parsed.records;

    const completed = parsed.records.filter(record => record.status === 'completed');
    if (oracle === null) {
      if (parsed.failed) throw new Error('serial control failed: ' + child.stderr + '\n' + child.stdout);
      oracle = completed.map(record => [record.sequence, record.value, record.move]);
    } else {
      for (const record of completed) {
        const expected = oracle.find(entry => entry[0] === record.sequence);
        assert.deepEqual(
          [record.sequence, record.value, record.move],
          expected,
          variant + ' exact decision differs from serial control',
        );
      }
    }
  }

  for (const [variant, records] of Object.entries(report.variants)) {
    report.variants[variant] = {
      totalMs: records.reduce((sum, record) => sum + (record.elapsedMs ?? 0), 0),
      resultReadyMs: records.reduce(
        (sum, record) => sum + (record.resultReadyMs ?? record.elapsedMs ?? 0),
        0,
      ),
      cleanupMs: records.reduce((sum, record) => sum + (record.cleanupMs ?? 0), 0),
      maxRssBytes: Math.max(...records.map(record => record.maxRssBytes ?? 0)),
      failed: records.some(record => record.status === 'failed'),
      records,
    };
  }

  report.sameExactDecisions = true;
  report.failedVariants = Object.entries(report.variants)
    .filter(([, entry]) => entry.failed)
    .map(([variant]) => variant);

  if (process.env.ISOMAX_RETAINED_PULL_SUMMARY_ONLY === '1') {
    const summary = {
      kind: report.kind,
      sourceRevision,
      node: report.node,
      cpu: report.cpu,
      corpus,
      roots: report.roots,
      sameExactDecisions: true,
      failedVariants: report.failedVariants,
      variants: {},
    };
    for (const [variant, entry] of Object.entries(report.variants)) {
      summary.variants[variant] = {
        totalMs: entry.totalMs,
        resultReadyMs: entry.resultReadyMs,
        cleanupMs: entry.cleanupMs,
        maxRssBytes: entry.maxRssBytes,
        failed: entry.failed,
        values: entry.records.map(record => record.status === 'completed'
          ? [record.sequence, record.value, record.move]
          : [record.sequence, 'FAILED', record.error]),
        metrics: entry.records.map(record => record.shared).filter(Boolean),
      };
    }
    process.stdout.write(JSON.stringify(summary) + '\n');
  } else {
    process.stdout.write(JSON.stringify(report) + '\n');
  }
  if (report.failedVariants.length) process.exitCode = 1;
}
