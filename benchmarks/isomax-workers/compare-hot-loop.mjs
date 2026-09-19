// Run baseline and current source in separate processes, alternately. Includes
// worker startup/cleanup; same root corpus and decisions as the worker campaign.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import os from 'node:os';
import { captureProcess } from '../../tools/solver-performance.mjs';
const current = fileURLToPath(new URL('../../', import.meta.url));
const baseline = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3]);
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', windowsHide: true }).trim();
const variants = process.argv[4]?.split(',') ?? ['serial', '1'];
for (const variant of variants) assert.ok(variant === 'serial' || /^[1-9][0-9]*$/.test(variant));
const report = { node: process.version, cpu: os.cpus()[0]?.model, variants, baseline: git(baseline, 'rev-parse', 'HEAD'),
  candidateParent: git(current, 'rev-parse', 'HEAD'),
  candidateDiffSha256: createHash('sha256').update(git(current, 'diff', 'HEAD')).digest('hex'),
  runs: [] };
fs.mkdirSync(output, { recursive: true });
for (let sample = 0; sample < 3; sample++) {
  for (const variant of variants) {
    for (const label of sample === 1 ? ['candidate', 'baseline'] : ['baseline', 'candidate']) {
      const cwd = label === 'baseline' ? baseline : current;
      const directory = path.join(output, sample + '-' + variant + '-' + label);
      const captured = await captureProcess({ command: process.execPath,
        args: ['--max-old-space-size=4096', path.join(cwd, 'benchmarks/isomax-workers/run.mjs'), 'child', variant],
        cwd, directory, timeoutMs: 120000 });
      const records = fs.readFileSync(path.join(directory, 'stdout.log'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
      assert.equal(captured.exitCode, 0); assert.equal(captured.timedOut, false); assert.equal(records.length, 3);
      if (report.runs.length) records.forEach((r, i) => assert.deepEqual([r.sequence, r.value, r.move],
        [report.runs[0].records[i].sequence, report.runs[0].records[i].value, report.runs[0].records[i].move]));
      report.runs.push({ sample, label, variant, records, elapsedMs: records.reduce((s, r) => s + r.elapsedMs, 0),
        nodes: records.reduce((s, r) => s + r.metrics.nodes, 0) });
      fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(report, null, 2) + '\n', { flush: true });
      console.log(JSON.stringify(report.runs.at(-1), (key, value) => key === 'records' ? undefined : value));
    }
  }
}
