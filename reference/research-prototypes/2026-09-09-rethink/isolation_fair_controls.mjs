// Research only. Same owned kernel; no changes to negamax, ordering, or TT publication.
// Adds equal-ACTIVE-capacity and grouped-order controls to the preserved A1/B/A2 smoke.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
import { performance } from 'node:perf_hooks';
import { Solver } from '../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';

const REPEATS = Number(process.argv[2] ?? 3);
const POWS = (process.argv[3] ?? '18,19,20').split(',').map(Number);
assert(Number.isInteger(REPEATS) && REPEATS > 0);
assert(POWS.length && POWS.every(p => Number.isInteger(p) && p >= 16 && p <= 21));
const pinnedHead = '990686a094acaddc0bc37d0995759ab138d63aa4';
const kernelBlob = '965c3806c92a7add544dce4777d965b3e12376d6';
const kernel = readFileSync(new URL('../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs', import.meta.url));
const actualBlob = createHash('sha1').update(`blob ${kernel.length}\0`).update(kernel).digest('hex');
assert.equal(actualBlob, kernelBlob);
// Exact task states copied from the pinned owner-controlled interleave prototype.
const tasks = [
  { name:'A1', id:91, sig2:1008138, cLo:1075839104,cHi:7168,mLo:1881145473,mHi:15384,moves:12,alpha:3,beta:4 },
  { name:'B', id:112, sig2:975370, cLo:1075839104,cHi:3088,mLo:4028629121,mHi:3128,moves:12,alpha:3,beta:4 },
  { name:'A2', id:130, sig2:1008138, cLo:1075839104,cHi:3104,mLo:1881145473,mHi:3192,moves:12,alpha:3,beta:4 },
];
function owner(t) { const p0 = t.moves & 1 ? t.cHi ^ t.mHi : t.cHi; return (p0 >>> 4) & 1; }
assert.equal(owner(tasks[0]), owner(tasks[2]));
assert.notEqual(owner(tasks[0]), owner(tasks[1]));
assert(tasks.every(t => ((t.mHi >>> 4) & 1) === 1)); // c5r1 is bit 36.
const emit = x => console.log(JSON.stringify(x));
emit({kind:'environment',pinnedHead,kernelBlob,kernelSha256:createHash('sha256').update(kernel).digest('hex'),node:process.version,v8:process.versions.v8,arch:process.arch,platform:process.platform,cpu:os.cpus()[0]?.model,availableParallelism:os.availableParallelism(),repeats:REPEATS,pows:POWS,tasks,scope:'single-worker fixed-root replay; not whole solve, online scheduler, or concurrent-publication qualification'});
// Qualify full task values separately. This is same-kernel consistency, NOT an independent oracle.
const fullValues = [];
for (const t of tasks) {
  const q = new Solver(19, true, 0); const start = performance.now();
  const value = q.solveBits(t.cLo,t.cHi,t.mLo,t.mHi,t.moves);
  fullValues.push(value);
  emit({kind:'taskFullSolve',task:t.name,value,nodes:q.nodes,ms:performance.now()-start,oracle:'same-kernel cold full-window convergence'});
}
for (const pow of POWS) {
  const size = 2 ** pow, arenaSize = size * 2;
  // One fixed arena for all modes at this capacity; active capacity reported separately.
  const arena = new SharedArrayBuffer(arenaSize * 14);
  const all = [new Uint32Array(arena,0,arenaSize),new Uint32Array(arena,arenaSize*4,arenaSize),new Uint8Array(arena,arenaSize*8,arenaSize),new Int32Array(arena,arenaSize*9,arenaSize),new Uint8Array(arena,arenaSize*13,arenaSize)];
  const solver = new Solver(15,false,0);
  function descriptor(off,n) {
    return {size:n,mask:n-1,keyLo:new Uint32Array(arena,off*4,n),keyHi:new Uint32Array(arena,arenaSize*4+off*4,n),val:new Uint8Array(arena,arenaSize*8+off,n),ctrl:new Int32Array(arena,arenaSize*9+off*4,n),owner:new Uint8Array(arena,arenaSize*13+off,n)};
  }
  const full = descriptor(0,size), large = descriptor(0,arenaSize), extra = descriptor(size,size), lowHalf=descriptor(0,size/2), highHalf=descriptor(size/2,size/2);
  const interleaved = [0,1,2], grouped = [0,2,1];
  const modes = [
    {name:'flatSmall',activeEntries:size,regions:[full,full,full],order:interleaved},
    {name:'splitSameTotal',activeEntries:size,regions:[lowHalf,highHalf,lowHalf],order:interleaved},
    {name:'splitExtra',activeEntries:arenaSize,regions:[full,extra,full],order:interleaved},
    {name:'flatLarge',activeEntries:arenaSize,regions:[large,large,large],order:interleaved},
    {name:'groupedSmall',activeEntries:size,regions:[full,full,full],order:grouped},
    {name:'groupedLarge',activeEntries:arenaSize,regions:[large,large,large],order:grouped},
  ];
  function bind(d) { solver.size=d.size;solver.mask=d.mask;solver.keyLo=d.keyLo;solver.keyHi=d.keyHi;solver.val=d.val;solver.ctrl=d.ctrl;solver.owner=d.owner; }
  function clear() { for (const a of all) a.fill(0); }
  function run(mode) {
    clear(); const begin=performance.now(); const results=[]; let nodes=0,hits=0;
    for (const i of mode.order) {
      const t=tasks[i]; bind(mode.regions[i]); solver.resetMetrics(); solver.limit=Infinity;
      const start=performance.now(); const bound=solver.negamax(t.cLo,t.cHi,t.mLo,t.mHi,t.moves,t.alpha,t.beta);
      const ms=performance.now()-start, v=fullValues[i];
      assert(bound<=t.alpha ? v<=bound : bound>=t.beta ? v>=bound : v===bound);
      results.push({task:t.name,bound,exactValue:v,nodes:solver.nodes,ms,ttHits:solver.ttHits,writeAttempts:solver.writeAttempts,writeBusy:solver.writeBusy,descriptorEntries:mode.regions[i].size});
      nodes+=solver.nodes; hits+=solver.ttHits;
    }
    return {wallMs:performance.now()-begin,nodes,ttHits:hits,results};
  }
  // Warm the identical code/descriptor shapes without including warm-up in raw samples.
  run(modes[0]); run(modes[2]); run(modes[3]);
  const stableNodes = new Map();
  for (let repeat=0;repeat<REPEATS;repeat++) {
    for (let k=0;k<modes.length;k++) {
      // Rotate and reverse ordering across repetitions to reduce drift confounding.
      const idx = repeat & 1 ? (modes.length-1-k+repeat)%modes.length : (k+repeat)%modes.length;
      const mode=modes[idx], r=run(mode);
      if(stableNodes.has(mode.name)) assert.equal(r.nodes,stableNodes.get(mode.name));
      stableNodes.set(mode.name,r.nodes);
      emit({kind:'trial',pow,repeat:repeat+1,order:k,mode:mode.name,arenaEntries:arenaSize,arenaBytes:arena.byteLength,activeEntries:mode.activeEntries,activeBytes:mode.activeEntries*14,...r});
    }
  }
  assert.equal(stableNodes.get('splitExtra'),stableNodes.get('groupedSmall'));
}
emit({kind:'qualification',passed:true,checks:['kernel Git blob identity','irreversible discriminator occupied with opposite owners','bound versus full-value consistency for every task','deterministic per-mode nodes across repeats','splitExtra equals groupedSmall total nodes'],limitation:'Full values share solver ancestry; not an independent exactness oracle. Single worker only.'});
