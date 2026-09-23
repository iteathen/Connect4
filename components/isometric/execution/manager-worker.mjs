import { workerData } from 'node:worker_threads';
import { runManagerLoop7x6 } from './manager.mjs';

// Prepared thread entry. Rich host messaging is unnecessary: completion and
// failure are numeric shared words. Waiting occurs only with no useful work.
const t = workerData.table;
runManagerLoop7x6(t);
