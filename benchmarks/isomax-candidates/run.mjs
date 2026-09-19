import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { captureProcess } from '../../tools/solver-performance.mjs';
import { VARIANTS } from './variants.mjs';
import { WORKLOADS } from '../isomax-ordering/corpus.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
if (git('status', '--porcelain')) throw new Error('commit campaign before measurement');
const runId = new Date().toISOString().replace(/[-:.]/g, '') + '-isomax-candidates';
const directory = path.resolve(root, git('rev-parse', '--git-path', 'solver-performance'), runId);
fs.mkdirSync(directory, { recursive: true });
const report = { runId, sourceRevision: git('rev-parse', 'HEAD'), node: process.version,
  cpu: os.cpus()[0]?.model, startedAt: new Date().toISOString(),
  policy: { timeoutMsPerProcess: 120000, warmupRoots: 8, freshPoolPerRoot: true,
    measured: 'exact WDL and root move; setup and forced GC reported separately/excluded',
    sequence: [...VARIANTS, ...VARIANTS.toReversed(), ...VARIANTS.slice(2), ...VARIANTS.slice(0,2)] },
  runs: [] };
const save = () => fs.writeFileSync(path.join(directory, 'result.json'), JSON.stringify(report, null, 2) + '\n', { flush: true });
save();
for (const [index, variant] of report.policy.sequence.entries()) {
  const subdir = path.join(directory, String(index + 1) + '-' + variant);
  console.log(JSON.stringify({ phase: 'start', ordinal: index + 1, variant, runId }));
  const captured = await captureProcess({ command: process.execPath,
    args: ['--expose-gc', '--max-old-space-size=4096', fileURLToPath(new URL('child.mjs', import.meta.url)), variant],
    cwd: root, directory: subdir, timeoutMs: report.policy.timeoutMsPerProcess });
  const lines = fs.readFileSync(path.join(subdir, 'stdout.log'), 'utf8').trim().split('\n').filter(Boolean);
  const summaries = lines.map(JSON.parse).filter(r => r.kind === 'summary');
  report.runs.push({ ordinal: index + 1, variant, ...captured, summaries }); save();
  if (captured.exitCode !== 0 || captured.timedOut || summaries.length !== WORKLOADS.length)
    throw new Error('incomplete candidate; inspect retained logs before retry');
  console.log(JSON.stringify({ phase: 'finish', variant, elapsedMs: summaries.reduce((s,x)=>s+x.elapsedMs,0) }));
}
const median = v => v.toSorted((a,b)=>a-b)[Math.floor(v.length/2)];
const controls = report.runs.filter(r=>r.variant === 'baseline');
for (const run of report.runs) for (const [i,s] of run.summaries.entries()) {
  assert.deepEqual(s.decisions, controls[0].summaries[i].decisions, 'WDL/root move mismatch');
  const repeat = report.runs.find(r=>r.variant === run.variant).summaries[i];
  assert.deepEqual(s.work, repeat.work, 'nondeterministic exact work');
  if (run.variant === 'I6-empty-facts') assert.deepEqual(s.work, controls[0].summaries[i].work);
}
report.comparison = VARIANTS.map(variant => {
  const samples = report.runs.filter(r=>r.variant === variant);
  return { variant, nodes: samples[0].summaries.reduce((s,x)=>s+x.nodes,0),
    medianMs: median(samples.map(r=>r.summaries.reduce((s,x)=>s+x.elapsedMs,0))),
    samplesMs: samples.map(r=>r.summaries.reduce((s,x)=>s+x.elapsedMs,0)),
    maxRssBytes: Math.max(...samples.flatMap(r=>r.summaries.map(s=>s.maxRssBytes))),
    workloads: WORKLOADS.map((w,i)=>({ name: w.name,
      medianMs: median(samples.map(r=>r.summaries[i].elapsedMs)),
      nodes: samples[0].summaries[i].nodes })) };
});
report.correctness = { sameWdlAndRootMoves: true, repeatableWork: true, emptyFactsSameWork: true,
  decisionSha256: createHash('sha256').update(JSON.stringify(controls[0].summaries.map(s=>s.decisions))).digest('hex') };
report.finishedAt = new Date().toISOString(); save();
console.log(JSON.stringify({ runId, evidence: path.relative(root,directory), comparison: report.comparison }));
