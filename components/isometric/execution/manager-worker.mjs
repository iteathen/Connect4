import { workerData } from 'node:worker_threads';
import { managerStep } from './manager.mjs';
import { STOP, DONE, WAKE } from './shared-tt.mjs';

// Prepared thread entry. Rich host messaging is unnecessary: completion and
// failure are numeric shared words. Waiting occurs only with no useful work.
const t = workerData.table;
while (!Atomics.load(t.control, STOP) && !Atomics.load(t.control, DONE)) {
  const observed = Atomics.load(t.control, WAKE);
  if (!managerStep(t)) Atomics.wait(t.control, WAKE, observed, 1);
}
