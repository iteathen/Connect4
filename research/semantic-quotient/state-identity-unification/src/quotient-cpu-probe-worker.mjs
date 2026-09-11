import { isMainThread, parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

function runKernel(durationMs, seed) {
  let x = seed >>> 0;
  let ops = 0;
  const started = performance.now();
  let now = started;
  while (now - started < durationMs) {
    for (let index = 0; index < 4096; index += 1) {
      x = Math.imul((x ^ (x >>> 13)) >>> 0, 0x85ebca6b) >>> 0;
      x = (x + 0x9e3779b9 + (x << 6)) >>> 0;
    }
    ops += 4096;
    now = performance.now();
  }
  return { ops, elapsedMs: now - started, checksum: x >>> 0 };
}

const warmupMs = workerData?.warmupMs ?? Number(process.env.C4_CPU_PROBE_WARMUP_MS ?? 30);
const durationMs = workerData?.durationMs ?? Number(process.env.C4_CPU_PROBE_DURATION_MS ?? 120);
const seed = workerData?.seed ?? 0x12345678;
runKernel(warmupMs, seed ^ 0xa5a5a5a5);

parentPort?.on('message', (message) => {
  if (message?.type === 'probe') {
    const result = runKernel(message.durationMs ?? durationMs, (message.seed ?? seed) ^ message.taskId);
    parentPort.postMessage({
      type: 'probe-result',
      taskId: message.taskId,
      ...result,
      opsPerSecond: result.ops / (result.elapsedMs / 1000),
    });
  } else if (message?.type === 'maintenance') {
    const result = runKernel(message.durationMs ?? Math.max(10, durationMs / 4), (message.seed ?? seed) ^ 0x5a5a5a5a);
    parentPort.postMessage({ type: 'maintenance-result', taskId: message.taskId, ...result });
  }
});

if (isMainThread) {
  const result = runKernel(durationMs, seed);
  process.stdout.write(`${JSON.stringify({ ...result, opsPerSecond: result.ops / (result.elapsedMs / 1000) })}\n`);
}
