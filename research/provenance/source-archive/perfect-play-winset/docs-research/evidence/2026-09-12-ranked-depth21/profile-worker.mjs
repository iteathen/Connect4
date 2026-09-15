import { Session } from 'node:inspector';
import { parentPort, workerData } from 'node:worker_threads';
import { writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

const session = new Session();
// Inspector request promises alone do not keep the worker event loop alive.
const keepAlive = setInterval(() => {}, 1000);
session.connectToMainThread();
const post = (method, params = {}) => new Promise((accept, reject) =>
  session.post(method, params, (error, response) => error ? reject(error) : accept(response)));
await post('Profiler.enable');
await post('Profiler.setSamplingInterval', { interval: 1000 });
await post('Profiler.start');
const cpuStart = process.cpuUsage(), started = performance.now();
let stopped = false, timer;
async function stop(reason) {
  if (stopped) return;
  stopped = true; clearTimeout(timer);
  const { profile } = await post('Profiler.stop');
  const elapsedMs = performance.now() - started, cpu = process.cpuUsage(cpuStart);
  const snapshot = await post('Runtime.evaluate', { expression: 'JSON.stringify(globalThis.__c4Counters())', returnByValue: true });
  if (snapshot.exceptionDetails) throw new Error('counter checkpoint failed');
  const counters = JSON.parse(snapshot.result.value);
  await writeFile(workerData.profile, JSON.stringify(profile));
  await writeFile(workerData.metadata, JSON.stringify({ reason, elapsedMs,
    cpuMs: (cpu.user + cpu.system) / 1000, rss: process.memoryUsage().rss, counters,
    scope: 'Main-thread profile; process CPU includes profiler worker. Interval excludes initialization and ends before hard timeout.' }, null, 2));
  session.disconnect(); clearInterval(keepAlive); parentPort.postMessage({ status: 'saved' }); parentPort.close();
}
parentPort.on('message', () => { stop('search-ended').catch(error => { throw error; }); });
timer = setTimeout(() => { stop('pre-timeout-checkpoint').catch(error => { throw error; }); }, workerData.checkpointMs);
parentPort.postMessage({ status: 'ready' });
