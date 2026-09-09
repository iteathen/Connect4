import { parentPort, workerData } from 'node:worker_threads';
import { Solver } from './twoword_solver_tasklocal.mjs';

const CHUNK_POW = workerData.chunkPow ?? 15;
const CHUNK_SIZE = 1 << CHUNK_POW;
const totalPow = workerData.totalPow ?? (CHUNK_POW + 2);
const solver = new Solver(totalPow, false, CHUNK_POW);
// Use the shared preallocated arena, but each worker gets a distinct physical chunk.
solver.keyLo = new Uint32Array(workerData.keyLoSab);
solver.keyHi = new Uint32Array(workerData.keyHiSab);
solver.val = new Uint8Array(workerData.valSab);
solver.chunkBase = workerData.workerIndex * CHUNK_SIZE;

parentPort.on('message', (m) => {
  if (m.type === 'warm') {
    solver.nodes = 0;
    solver.limit = m.limit ?? 50000;
    try { solver.negamax(m.cLo>>>0,m.cHi>>>0,m.mLo>>>0,m.mHi>>>0,m.moves|0,m.alpha|0,m.beta|0); }
    catch (e) { if (e !== 911) throw e; }
    solver.limit = Infinity;
    parentPort.postMessage({type:'warmed'});
    return;
  }
  if (m.type === 'task') {
    solver.nodes = 0;
    solver.limit = Infinity;
    const t0 = process.hrtime.bigint();
    const score = solver.negamax(m.cLo>>>0,m.cHi>>>0,m.mLo>>>0,m.mHi>>>0,m.moves|0,m.alpha|0,m.beta|0);
    const seconds = Number(process.hrtime.bigint()-t0)/1e9;
    parentPort.postMessage({type:'result', id:m.id, score, nodes:solver.nodes, seconds});
  }
});
parentPort.postMessage({type:'ready'});
