import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { performance } from 'node:perf_hooks';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const sets = [
  ['Test_L3_R1', 'End-Easy', '180daa64dc3f52f3ac931be95c99c964945554b2'],
  ['Test_L2_R1', 'Middle-Easy', '66089b7cf493c00e44f23ddcf12ad1ea0fe8a1a8'],
  ['Test_L2_R2', 'Middle-Medium', 'bca30d2284f2e2adcfb77f840b0f0862be82edc0'],
  ['Test_L1_R1', 'Begin-Easy', '125e3d872dfec4ea13fe09641606dff992f152ee'],
  ['Test_L1_R2', 'Begin-Medium', '481876168e3690e6bf080c56683b9d506e5ddd58'],
  ['Test_L1_R3', 'Begin-Hard', 'c6e598e8f17adb32b509f5960d443934371f31fb'],
];

if (process.argv[2] === '--child') {
  const { createSlot64ResidualQuotientKernel } = await import('../../../../research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs');
  const { createSemanticSharedTtArena } = await import('../../../../research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs');
  const { createOnlineSemanticQuotientSearcher } = await import('../../../../research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs');
  const { createBoundedStoragePlan } = await import('../../../../research/semantic-quotient/state-identity-unification/src/quotient-bounded-storage-plan.mjs');
  const domain = Object.freeze({ columns: 7, rows: 6, connect: 4 });
  // Pons streaming protocol: input position; output position, WDL, visits, us.
  // All parsing, initialization, path replay and reporting are outside timing.
  const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const sequence of lines) {
    assert.match(sequence, /^[1-7]+$/);
    const path = Array.from(sequence, char => char.charCodeAt(0) - 49);
    const setupStart = performance.now();
    const { kernel } = createSlot64ResidualQuotientKernel(domain, { cacheEdges: true, prefixClasses: 4096 });
    // Full exact solve, not the previous depth-21 unknown-horizon traversal.
    // Use the same 2 GiB budget; reservations derive from initialized geometry.
    const plan = createBoundedStoragePlan(kernel, kernel.cellCount, 2048 * 1048576);
    kernel.prepareSearchStorage(plan.searchStorage);
    const arena = createSemanticSharedTtArena({ ...plan.arena, domainSpec: kernel.domain });
    const searcher = createOnlineSemanticQuotientSearcher(kernel, arena, { etc: false });
    const { stateId, frontierSeed } = searcher.replayPath(path);
    const setupMs = performance.now() - setupStart;
    const before = searcher.metrics.calls;
    const start = performance.now();
    const value = searcher.search(stateId, -2, 2, frontierSeed);
    const elapsedUs = (performance.now() - start) * 1000;
    assert.ok(value === -1 || value === 0 || value === 1);
    const nodes = searcher.metrics.calls - before;
    await new Promise((accept, reject) => process.stdout.write(`${sequence} ${value} ${nodes} ${elapsedUs}\n`, error => error ? reject(error) : accept()));
    await new Promise((accept, reject) => process.stderr.write(JSON.stringify({ sequence, setupMs, expanded: searcher.metrics.expanded,
      cutoffs: searcher.metrics.cutoffs, tacticalExact: searcher.metrics.tacticalExact, ttExactReturns: searcher.metrics.ttExactReturns,
      localStates: kernel.states.count, reservedBytes: plan.estimatedBytes }) + '\n', error => error ? reject(error) : accept()));
  }
} else {
  // Data acquisition is preparation, before the single global benchmark clock.
  await mkdir(resolve(here, 'data'), { recursive: true });
  const revision = 'cf2d4546e5824c155e9dd7e888a572bff3128498';
  const inputs = await Promise.all(sets.map(async ([name, label, sha]) => {
    const url = `https://raw.githubusercontent.com/megakilo/alphafour/${revision}/testdata/${name}`;
    let bytes;
    try { bytes = await readFile(resolve(here, 'data', name)); }
    catch { const response = await fetch(url); assert.equal(response.status, 200); bytes = Buffer.from(await response.arrayBuffer()); await writeFile(resolve(here, 'data', name), bytes); }
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
    assert.equal(blob, sha, 'published dataset blob identity mismatch');
    const rows = bytes.toString('utf8').trim().split(/\r?\n/).map(line => {
      const fields = line.trim().split(/\s+/); assert.equal(fields.length, 2); assert.match(fields[0], /^[1-7]+$/);
      const score = Number(fields[1]); assert.ok(Number.isInteger(score)); return { sequence: fields[0], score };
    });
    assert.equal(rows.length, 1000);
    return { name, label, sha, url, rows };
  }));
  await writeFile(resolve(here, 'provenance.json'), JSON.stringify(inputs.map(({ rows, ...metadata }) => metadata), null, 2));
  const started = performance.now(), deadline = started + 60000, results = [];
  for (let index = 0; index < inputs.length; index++) {
    const input = inputs[index], allowanceMs = Math.max(1, Math.floor((deadline - performance.now()) / (inputs.length - index)));
    const child = spawn(process.execPath, ['--max-old-space-size=2048', fileURLToPath(import.meta.url), '--child'],
      { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    let timedOut = false, stdout = '', stderr = '';
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, allowanceMs);
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => { stdout += chunk; }); child.stderr.on('data', chunk => { stderr += chunk; });
    child.stdin.on('error', error => { if (error.code !== 'EPIPE') console.error(error); });
    child.stdin.end(input.rows.map(row => row.sequence).join('\n') + '\n');
    const [code, signal] = await once(child, 'close'); clearTimeout(timer);
    await writeFile(resolve(here, input.name + '.stdout'), stdout);
    await writeFile(resolve(here, input.name + '.stderr'), stderr);
    const completedLines = stdout.slice(0, stdout.lastIndexOf('\n') + 1).trim();
    const records = completedLines ? completedLines.split('\n').map((line, rowIndex) => {
      const [sequence, valueText, nodesText, timeText] = line.split(' ');
      const expected = input.rows[rowIndex]; assert.equal(sequence, expected.sequence);
      const value = Number(valueText), nodes = Number(nodesText), us = Number(timeText);
      assert.ok(Number.isSafeInteger(nodes) && nodes >= 0 && Number.isFinite(us) && us >= 0);
      return { sourceLine: rowIndex + 1, sequence, expectedScore: expected.score, expectedWdl: Math.sign(expected.score), value, nodes, us, correct: value === Math.sign(expected.score) };
    }) : [];
    const count = records.length, correct = records.filter(row => row.correct).length;
    const result = { name: input.name, label: input.label, total: 1000, completed: count, correct, incorrect: count - correct,
      status: timedOut ? 'partial-timeout' : code === 0 ? 'complete' : 'failed', allowanceMs, code, signal, childExited: true,
      meanUs: count ? records.reduce((sum, row) => sum + row.us, 0) / count : null,
      meanNodes: count ? records.reduce((sum, row) => sum + row.nodes, 0) / count : null, records };
    results.push(result);
    await writeFile(resolve(here, 'results.json'), JSON.stringify({ protocol: 'Pons weak/WDL', budgetMs: 60000,
      elapsedBatchMs: performance.now() - started, independentFreshStateAndProofPerPosition: true, initializationExcludedFromSearchTiming: true,
      sourceRevision: '0317c1c95eeae2e6b3e60040eed57198f4f5f9eb plus current working tree', results }, null, 2));
    const { records: omitted, ...summary } = result; console.log(JSON.stringify(summary));
  }
}
