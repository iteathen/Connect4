import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { captureProcess } from '../../tools/solver-performance.mjs';
import { WORKLOADS } from './corpus.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', { flush: true });
if (git('status', '--porcelain')) throw new Error('commit qualification machinery before measuring');
const runId = new Date().toISOString().replace(/[-:.]/g, '') + '-isomax-ordering';
const directory = path.resolve(root, git('rev-parse', '--git-path', 'solver-performance'), runId);
fs.mkdirSync(directory, { recursive: true });
const report = { runId, sourceRevision: git('rev-parse', 'HEAD'), node: process.version,
  cpu: os.cpus()[0]?.model, platform: process.platform, startedAt: new Date().toISOString(),
  policy: { sequence: ['fixed', 'singleton', 'singleton', 'fixed', 'fixed', 'singleton'],
    timeoutMsPerProcess: 120000, freshPoolAndCachePerRoot: true, warmupRootsPerProcess: 8,
    rba: false, timedOperation: 'solve (exact WDL plus value-preserving root move)',
    setupAndForcedGcExcluded: true, singletonIsProduction: true }, runs: [] };
write(path.join(directory, 'result.json'), report);
for (const [index, variant] of report.policy.sequence.entries()) {
  const subdir = path.join(directory, String(index + 1) + '-' + variant);
  console.log(JSON.stringify({ phase: 'start', ordinal: index + 1, variant, runId }));
  const startedAt = new Date().toISOString();
  const captured = await captureProcess({ command: process.execPath,
    args: ['--expose-gc', '--max-old-space-size=4096', fileURLToPath(new URL('child.mjs', import.meta.url)), variant],
    cwd: root, directory: subdir, timeoutMs: report.policy.timeoutMsPerProcess });
  const records = fs.readFileSync(path.join(subdir, 'stdout.log'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
  const summaries = records.filter(r => r.kind === 'summary');
  report.runs.push({ ordinal: index + 1, variant, startedAt, finishedAt: new Date().toISOString(),
    ...captured, summaries });
  write(path.join(directory, 'result.json'), report);
  console.log(JSON.stringify({ phase: 'finish', ordinal: index + 1, variant, ...captured,
    summaries: summaries.map(({ decisions, ...s }) => s) }));
  if (captured.exitCode !== 0 || captured.timedOut || summaries.length !== WORKLOADS.length) {
    throw new Error('incomplete comparison; preserve logs and do not claim speedup');
  }
}
const median = values => values.toSorted((a,b) => a-b)[Math.floor(values.length/2)];
report.comparison = report.runs[0].summaries.map(control => {
  const all = report.runs.flatMap(run => run.summaries).filter(s => s.workload === control.workload);
  for (const summary of all) assert.deepEqual(summary.decisions, control.decisions, 'WDL/root move mismatch');
  const variants = ['fixed', 'singleton'].map(variant => {
    const samples = all.filter(s => s.variant === variant);
    for (const sample of samples) assert.equal(sample.nodes, samples[0].nodes, 'nondeterministic node count');
    return { variant, nodes: samples[0].nodes, promotions: samples[0].promotions,
      medianMs: median(samples.map(s => s.elapsedMs)), samplesMs: samples.map(s => s.elapsedMs),
      medianSetupMs: median(samples.map(s => s.setupMs)) };
  });
  return { workload: control.workload, positions: control.decisions.length, correctness: 'WDL and root moves identical',
    decisionChecksum: createHash('sha256').update(JSON.stringify(control.decisions)).digest('hex'),
    variants, timeChangePercent: (variants[1].medianMs / variants[0].medianMs - 1) * 100,
    nodeChangePercent: (variants[1].nodes / variants[0].nodes - 1) * 100 };
});
// Promotion must reproduce the qualified experiment's exact work and decisions.
const qualified = JSON.parse(fs.readFileSync(new URL('../results/2026-09-19-isomax-ordering.json', import.meta.url), 'utf8'));
for (const run of report.runs) {
  for (const summary of run.summaries) {
    const expected = qualified.runs.find(r => r.variant === run.variant).summaries.find(s => s.workload === summary.workload);
    assert.deepEqual(summary.decisions, expected.decisions, 'promotion changed qualified decisions');
    assert.equal(summary.nodes, expected.nodes, 'promotion changed qualified node counts');
    assert.equal(summary.promotions, expected.promotions, 'promotion changed qualified ordering choices');
  }
}
report.matchesQualifiedExperiment = true;
write(path.join(directory, 'result.json'), report);
console.log(JSON.stringify({ runId, evidence: path.relative(root, directory), comparison: report.comparison }));
