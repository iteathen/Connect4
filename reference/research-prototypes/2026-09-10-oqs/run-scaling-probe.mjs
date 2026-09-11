import { spawnSync } from 'node:child_process';
import { mkdirSync, openSync, closeSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// CPU research supervisor. Children are single Node processes, create no child
// processes and hold no GPU resources. Preserve partial logs on hard timeout.
const directory = path.resolve(process.argv[2]);
mkdirSync(directory, { recursive: false });
if (![undefined, 'widen', 'explosion'].includes(process.argv[3])) throw new Error('unknown probe ladder');
const cases = process.argv[3] === 'explosion'
  ? [[7, 6, 4, 36, 60000, 2097152]]
  : process.argv[3] === 'widen'
  ? [[6, 5, 4, 24, 30000, 262144], [7, 6, 4, 36, 60000, 262144]]
  : [[5, 4, 4, 0, 10000, 65536], [6, 5, 4, 24, 20000, 65536], [7, 6, 4, 36, 20000, 65536]];
const results = [];
for (const args of cases) {
  const name = `${args[0]}x${args[1]}`;
  const output = path.join(directory, `${name}-seeds.json`);
  const stdoutPath = path.join(directory, `${name}.jsonl`);
  const stderrPath = path.join(directory, `${name}.stderr.log`);
  const stdout = openSync(stdoutPath, 'wx'); const stderr = openSync(stderrPath, 'wx');
  const env = { ...process.env }; for (const key of ['CUDA_BSFP_GITHUB_TOKEN', 'GITHUB_TOKEN', 'GH_TOKEN']) delete env[key];
  let result;
  try {
    result = spawnSync(process.execPath, ['--max-old-space-size=1536', fileURLToPath(new URL('run-seed-probe.mjs', import.meta.url)), ...args.map(String), output],
      { stdio: ['ignore', stdout, stderr], env, windowsHide: true, timeout: args[4] + 5000 });
  } finally { closeSync(stdout); closeSync(stderr); }
  const events = readFileSync(stdoutPath, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
  const last = events.at(-1);
  const entry = { name, args, exitCode: result.status, signal: result.signal, supervisorError: result.error?.code ?? null,
    result: last?.event === 'seed-result' ? last : null, lastProgress: last };
  results.push(entry); console.log(JSON.stringify(entry));
  writeFileSync(path.join(directory, 'summary.json'), JSON.stringify({ kind: 'oqs-seed-scaling-probe', results }, null, 2));
  if (result.error && result.error.code !== 'ETIMEDOUT') throw result.error;
  if (!result.error && result.status !== 0) throw new Error(`${name} research child failed; inspect retained stderr`);
}
