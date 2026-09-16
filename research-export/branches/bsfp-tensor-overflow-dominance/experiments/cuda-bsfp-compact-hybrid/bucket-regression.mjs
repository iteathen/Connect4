import assert from 'node:assert/strict';
import { openCudaRuntime } from 'cuda-js';
import { createPacked42PairReducerService } from '../../components/bsfp/cuda/packed42-pair-reducer-tensor-service.mjs';
import { createReferenceReducer } from './qualification.mjs';
import { readCompactHybridOptions } from './run.mjs';

// Short and partial-warp segments in a reused multi-segment arena. High
// cardinalities are initialized by a different warp than many histogram writers.
const widths = [1, 2, 17, 31, 32, 33, 63, 64, 65, 127, 257];
const full = (1n << 42n) - 1n;
let state = 0x13579bdf;
const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state; };
const jobs = Array.from({ length: 256 }, (_, segment) => {
  const direction = segment % 2;
  const right = Array.from({ length: widths[segment % widths.length] }, (_, i) => {
    let mask = full;
    const missing = 1 + (i + segment) % 10;
    for (let bit = 0; bit < missing; bit++) mask &= ~(1n << BigInt(random() % 42));
    return Number(mask);
  });
  return { left: [direction ? Number(full) : 0], right, direction };
});
const reference = createReferenceReducer();
const expected = await reference.reduce(jobs);
await reference.close();
const runtime = await openCudaRuntime({ compiler: true, driver: { memory: {
  maxDeviceBytes: 268435456, maxAllocationBytes: 134217728, maxTransferBytes: 16777216,
} } });
let reducer;
let checks = 0;
try {
  reducer = await createPacked42PairReducerService(runtime, { ...readCompactHybridOptions({}).reducer,
    pairStrategy: 'bucketed-cardinality-v0', packedStrategy: 'bucketed-cardinality-v0' });
  for (let pass = 0; pass < 20; pass++) {
    const indices = Array.from({ length: jobs.length }, (_, i) => (i + pass * 13) % jobs.length);
    const actual = await reducer.reduce(indices.map(i => jobs[i]));
    for (let i = 0; i < indices.length; i++) {
      assert.deepEqual([...actual[i]].sort((a, b) => a - b), [...expected[indices[i]]].sort((a, b) => a - b),
        'bucket histogram reset/scatter parity at pass ' + pass + ' segment ' + i);
      checks++;
    }
  }
} finally {
  if (reducer) await reducer.close();
  assert.equal((await runtime.close()).graceful, true);
}
console.log(JSON.stringify({ outcome: 'native-bucket-reuse-regression-pass', geometry: '7x6:c4',
  rootWdl: null, passes: 20, frontierChecks: checks, mismatches: 0, cleanup: 'graceful' }));
