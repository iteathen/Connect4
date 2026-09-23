import { cpus } from 'node:os';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { IsoMaxBranchManager } from '../components/isometric/execution/branch-manager.mjs';

// Complete cold operation, including setup, worker startup and cleanup.
// This fixture is not a native Connect Four kernel or performance score.
const graph = [null];
let seed = 0x92abd;
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
for (let rank = 0; rank < 6; rank++) for (let c = 0; c < 6; c++) {
  graph.push(rank === 5 ? { rank, value: random() % 3 + 1 } : {
    rank, children: [3, 2, 4].map(action => [action, (rank + 1) * 6 + 1 + random() % 6]),
  });
}
function oracle(id) {
  const node = graph[id];
  if (node.value) return node.value;
  const values = node.children.map(([, child]) => oracle(child));
  return node.rank & 1 ? Math.min(...values) : Math.max(...values);
}
const expected = oracle(1);
const expectedMove = graph[1].children.find(([, child]) => oracle(child) === expected)[0];
const root = new Uint32Array(42); root[41] = 1;
const samples = [];
// Rotate order so one worker count does not always receive earliest host state.
for (let repeat = 0; repeat < 7; repeat++) for (let i = 0; i < 3; i++) {
  const workers = [1, 2, 4][(repeat + i) % 3];
  const result = await new IsoMaxBranchManager({ workers, capacity: 128, buckets: 128,
    kernelURL: new URL('../test/fixtures/dag-kernel.mjs', import.meta.url).href,
    kernelData: { graph }, timeoutMs: 5000 }).run(root);
  if (result.status !== 'EXACT' || result.rootWdl !== expected - 2 ||
      result.move !== expectedMove || !result.cleanup) throw new Error(JSON.stringify(result));
  samples.push({ repeat, workers, ...result });
}
const summaries = [1, 2, 4].map(workers => {
  const times = samples.filter(s => s.workers === workers).map(s => s.elapsedMs).sort((a, b) => a - b);
  return { workers, medianMs: times[3], minMs: times[0], maxMs: times[6] };
});
const report = {
  kind: 'cold execution-fixture baseline; NOT Connect Four solve performance',
  sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  node: process.version, v8: process.versions.v8, platform: process.platform,
  architecture: process.arch, cpu: cpus()[0].model, expectedWdl: expected - 2,
  expectedMove, summaries, samples,
};
const output = new URL('../docs/qualification/execution-baseline.json', import.meta.url);
mkdirSync(new URL('.', output), { recursive: true });
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ summaries, evidence: fileURLToPath(output) }, null, 2));
