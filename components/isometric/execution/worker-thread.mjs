import { workerData } from 'node:worker_threads';
import { prepareWorker, workerStep } from './worker.mjs';
import { STOP, DONE, WAKE } from './shared-tt.mjs';

// COLD preparation/import only. evaluate's complete call graph is part of a
// kernel's qualification scope; this boundary does not exempt it from NEES.
const t = workerData.table;
const kernel = await import(workerData.kernelURL);
const w = prepareWorker(workerData.owner, workerData.workers);
kernel.prepare(w, workerData.kernelData);
const evaluate = kernel.evaluate;
while (!Atomics.load(t.control, STOP) && !Atomics.load(t.control, DONE)) {
  const observed = Atomics.load(t.control, WAKE);
  if (!workerStep(t, w, evaluate)) Atomics.wait(t.control, WAKE, observed, 1);
}
