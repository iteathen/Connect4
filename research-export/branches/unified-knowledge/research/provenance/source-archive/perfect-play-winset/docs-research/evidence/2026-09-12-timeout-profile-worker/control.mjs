import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { once } from 'node:events';
import { performance } from 'node:perf_hooks';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const worker = new Worker(new URL('./profile-worker.mjs', import.meta.url), { workerData: {
  profile: fileURLToPath(new URL('./control.cpuprofile', import.meta.url)),
  metadata: fileURLToPath(new URL('./control.json', import.meta.url)), checkpointMs: 500 } });
const saved = new Promise((accept, reject) => {
  worker.on('message', message => { if (message.status === 'saved') accept(); });
  worker.on('error', reject);
});
await once(worker, 'message');
const end = performance.now() + 2000;
let count = 0;
while (performance.now() < end) count++;
await saved;
const metadata = JSON.parse(await readFile(new URL('./control.json', import.meta.url), 'utf8'));
assert.equal(metadata.reason, 'pre-timeout-checkpoint');
assert.ok(metadata.elapsedMs < 1500, 'profiler stop waited for busy loop to finish');
await worker.terminate();
console.log(JSON.stringify({ controlPassed: true, savedDuringBusyMainThread: true, iterations: count, ...metadata }));
