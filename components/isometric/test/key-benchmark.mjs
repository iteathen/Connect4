// Run directly; not a correctness test. Also runs against the previous key API
// to measure the same cache workload at the parent revision.
import { performance } from 'node:perf_hooks';
import { IsometricState, ResidualPool, IsoMaxTransitionCache } from '../index.mjs';
const game = [1,5,2,3,6,3,2,5,4,4,1,3,0,2,5,0,6,1,6,1,2,2,0,1,5,0,2,5,0,5,0,6,4,4,4,6,1,4,3,3,6,3];
const pool = new ResidualPool();
const cache = new IsoMaxTransitionCache({ pool });
const states = [];
for (let rank = 0; rank < game.length; rank++) {
  for (const mirror of [false, true]) {
    states.push(new IsometricState({ pool, moves: game.slice(0, rank).map(c => mirror ? 6-c : c) }));
  }
}
states.forEach((state, i) => cache.set(state, i >> 1));
let checksum = 0;
const samples = [];
for (let trial = 0; trial < 9; trial++) {
  const start = performance.now();
  for (let i = 0; i < 250000; i++) checksum += cache.get(states[i % states.length]);
  if (trial > 1) samples.push(performance.now() - start);
}
console.log(JSON.stringify({ queriesPerSample: 250000, samplesMs: samples, medianMs: [...samples].sort((a,b)=>a-b)[3], checksum }));
