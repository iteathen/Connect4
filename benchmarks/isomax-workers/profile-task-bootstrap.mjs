// Benchmark-only bootstrap. Instrument COLD task boundaries, never solveNode or
// its recursive helpers. The real production worker and executor remain owners.
import { workerData } from 'node:worker_threads';
import { IsoMaxTaskSolver } from '../../components/isometric/execution/task.mjs';
import { IsoMaxSolver } from '../../components/isometric/solver.mjs';
import { ResidualPool } from '../../components/isometric/residual-pool.mjs';
import { IsoMaxTransitionCache } from '../../components/isometric/isomax-index.mjs';
import { censusColdCopies, censusColdMethods } from './cold-copy-census.mjs';
let active = null, serial = 0;
const pools = new WeakMap();
function wrap(owner, name, label) {
  const original = owner[name];
  owner[name] = function (...args) {
    const start = performance.now();
    try { return original.apply(this, args); }
    finally { if (active) active[label] += performance.now() - start; }
  };
}
wrap(IsoMaxSolver.prototype, 'createState', 'replayMs');
wrap(IsoMaxTaskSolver.prototype, 'packageContinuation', 'packagingMs');
const preparePool = ResidualPool.prototype.prepareSearchStorage;
ResidualPool.prototype.prepareSearchStorage = function (...args) {
  const before = [this.classHashes, this.singletonLo, this.singletonHi, this.reflectionCache,
    this.classHashSlots, ...this.classSlotIds, ...this.slotPools.flatMap(s => [s.words,s.hashSlots])];
  const classHash = this.classHashSlots, classes = this.classCount;
  const widths = this.classSlotIds.map(a => a.BYTES_PER_ELEMENT);
  const chunkHashes = this.slotPools.map(s => s.hashSlots);
  const chunkCounts = this.slotPools.map(s => s.count);
  let chunkPreparationMs = 0, referenceWidthMs = 0;
  const entries = this.slotPools.flatMap(owner => ['ensureCapacity', 'growHash'].map(name =>
    ({ owner, name, record(ms) { chunkPreparationMs += ms; } })));
  entries.push({ owner: this, name: 'ensureReferenceWidth', record(ms) { referenceWidthMs += ms; } });
  const start = performance.now();
  const copies = censusColdCopies(() => censusColdMethods(entries, () => preparePool.apply(this, args)));
  const result = copies.value;
  const elapsed = performance.now() - start;
  const after = [this.classHashes, this.singletonLo, this.singletonHi, this.reflectionCache,
    this.classHashSlots, ...this.classSlotIds, ...this.slotPools.flatMap(s => [s.words,s.hashSlots])];
  if (active) {
    active.poolPreparationMs += elapsed;
    active.chunkPreparationMs += chunkPreparationMs;
    active.referenceWidthMs += referenceWidthMs;
    active.poolCopyOperations += copies.operations;
    active.poolCopySourceBytes += copies.sourceBytes;
    active.poolCopyDestinationBytes += copies.destinationBytes;
    active.classRehashEntries += classHash === this.classHashSlots ? 0 : classes;
    for (let i = 0; i < before.length; i++) if (before[i] !== after[i]) {
      active.replacedBackingBytes += before[i].byteLength; active.replacedArrays++;
    }
    for (let i = 0; i < widths.length; i++) if (widths[i] !== this.classSlotIds[i].BYTES_PER_ELEMENT) active.widenedSlots++;
    for (let i = 0; i < chunkHashes.length; i++)
      if (chunkHashes[i] !== this.slotPools[i].hashSlots) active.chunkRehashEntries += chunkCounts[i];
  }
  return result;
};
const prepareCache = IsoMaxTransitionCache.prototype.prepareSearchStorage;
IsoMaxTransitionCache.prototype.prepareSearchStorage = function (...args) {
  const capacity = this.capacity, count = this.count, start = performance.now();
  const copies = censusColdCopies(() => prepareCache.apply(this, args));
  const result = copies.value;
  if (active) {
    active.cachePreparationMs += performance.now() - start;
    active.cacheCopyOperations += copies.operations;
    active.cacheCopySourceBytes += copies.sourceBytes;
    active.cacheCopyDestinationBytes += copies.destinationBytes;
    if (capacity !== this.capacity) active.cacheRehashEntries += count;
  }
  return result;
};
const run = IsoMaxTaskSolver.prototype.runTask;
IsoMaxTaskSolver.prototype.runTask = function (task) {
  if (!pools.has(this.pool)) pools.set(this.pool, ++serial);
  const phases = { replayMs:0,poolPreparationMs:0,cachePreparationMs:0,packagingMs:0,
    replacedBackingBytes:0,replacedArrays:0,widenedSlots:0,classRehashEntries:0,cacheRehashEntries:0,
    chunkPreparationMs:0,referenceWidthMs:0,chunkRehashEntries:0,
    poolCopyOperations:0,poolCopySourceBytes:0,poolCopyDestinationBytes:0,
    cacheCopyOperations:0,cacheCopySourceBytes:0,cacheCopyDestinationBytes:0,
    poolInstance:pools.get(this.pool), replayMoves:task.moves.length };
  active = phases;
  const start = performance.now();
  try {
    const result = run.call(this, task);
    phases.taskMs = performance.now() - start;
    phases.recursiveAndOtherMs = phases.taskMs - phases.replayMs - phases.poolPreparationMs - phases.cachePreparationMs - phases.packagingMs;
    phases.classes = this.pool.classCount; phases.classCapacity = this.pool.classCapacity;
    phases.cacheEntries = this.transitionCache.count; phases.cacheCapacity = this.transitionCache.capacity;
    return { ...result, qualification:phases };
  } finally { active = null; }
};
await import(workerData.originalWorkerUrl);
