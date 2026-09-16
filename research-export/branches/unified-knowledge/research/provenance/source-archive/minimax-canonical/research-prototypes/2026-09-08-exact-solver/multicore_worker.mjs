import { parentPort, workerData } from 'node:worker_threads';
import { Solver } from './twoword_solver_tasklocal.mjs';

const CHUNK_POW = 15;
const TOTAL_POW = 18; // 8 x 32K chunks = 256K entries
const CHUNK_SIZE = 1 << CHUNK_POW;
const TOTAL_SIZE = 1 << TOTAL_POW;

const solver = new Solver(TOTAL_POW, false, CHUNK_POW);
solver.keyLo = new Uint32Array(workerData.keyLoSab);
solver.keyHi = new Uint32Array(workerData.keyHiSab);
solver.val = new Uint8Array(workerData.valSab);

function runTask(t) {
  solver.chunkBase = t.chunkIndex * CHUNK_SIZE;
  solver.nodes = 0;
  solver.limit = Infinity;
  const t0 = process.hrtime.bigint();
  const score = solver.solveBits(t.cLo>>>0, t.cHi>>>0, t.mLo>>>0, t.mHi>>>0, t.moves|0);
  const seconds = Number(process.hrtime.bigint() - t0) / 1e9;
  return { id: t.id, move: t.move, score, nodes: solver.nodes, seconds };
}

parentPort.on('message', (msg) => {
  if (msg.type === 'warm') {
    solver.chunkBase = (msg.chunkIndex ?? 7) * CHUNK_SIZE;
    solver.nodes = 0;
    solver.limit = msg.limit ?? 50000;
    try {
      solver.solveBits(msg.state.cLo>>>0, msg.state.cHi>>>0, msg.state.mLo>>>0, msg.state.mHi>>>0, msg.state.moves|0);
    } catch (e) {
      if (e !== 911) throw e;
    }
    solver.limit = Infinity;
    parentPort.postMessage({ type: 'warmed' });
    return;
  }
  if (msg.type === 'task') {
    parentPort.postMessage({ type: 'result', result: runTask(msg.task) });
    return;
  }
  if (msg.type === 'stop') process.exit(0);
});

parentPort.postMessage({ type: 'ready' });
