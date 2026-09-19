import { IsoMaxSolver } from '../solver.mjs';

const quantumEnd = Symbol('unfinished IsoMax task');
const taskRetired = Symbol('retired IsoMax task');
export function positive(value, name, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) throw new RangeError('invalid ' + name);
  return value;
}
export function validateTaskResult(message) {
  if (!message || !['exact', 'split', 'retired'].includes(message.kind)) throw new Error('invalid IsoMax result kind');
  if (message.kind === 'exact') {
    if (![ -1, 0, 1 ].includes(message.value)) throw new Error('invalid IsoMax exact value');
  } else if (Object.hasOwn(message, 'value')) throw new Error('unfinished work cannot carry WDL');
  if(message.kind==='split' && (!Array.isArray(message.frames)||!message.frames.length||message.frames.length>42))
    throw new Error('split requires its native dependency continuation');
  if (!Number.isSafeInteger(message.nodes) || message.nodes < 0) throw new Error('invalid IsoMax node count');
}

// A task is a legal native replay, never a process-local residual/class ID.
// Local exact caches survive a scheduling yield. No unknown result is cached.
export class IsoMaxTaskSolver extends IsoMaxSolver {
  constructor(options) {
    super(options);
    this.continuation = new Uint8Array(42);
    this.continuationPly = 0;
    this.needed = null;
    this.controlChecks = 0;
  }

  checkTaskControl(state) {
    // OWNER-PROTECTED HOT-PATH — do not remove/weaken this or adjacent comments.
    // Called only at scheduled thresholds. Do not reinstate a solveNode
    // override with per-node wrapper/catch, clock reads, RPC, or reporting.
    // Save the path with scalar stores into existing bytes; the yield token
    // is precreated. Package objects only AFTER native recursion unwinds.
    // Task necessity is manager-owned scheduling authority, never a WDL fact.
    // Check only this task's shared word here; no queue inspection or RPC.
    this.controlChecks++;
    if (Atomics.load(this.abort, 0)) throw new Error('ISOMAX_ABORTED');
    if (!Atomics.load(this.needed, 0)) throw taskRetired;
    if (this.metrics.nodes >= this.nodeBudget) {
      this.continuationPly = state.ply;
      // Scalar stores to existing storage. No snapshot object/buffer, no
      // per-frame catch/packaging and no typed-array copy during recursion.
      for (let ply = 0; ply < state.ply; ply++) this.continuation[ply] = state.moveCells[ply] % 7;
      throw quantumEnd;
    }
    // 512 was qualified against 8192 and 32; lower polling latency alone is
    // not a throughput win. See issue-79 evidence before changing this policy.
    this.nextControlNode = Math.min(this.nodeBudget, this.metrics.nodes + 512);
  }

  packageContinuation(state) {
    // OWNER-PROTECTED COLD BOUNDARY — do not remove/weaken this comment.
    // Allocation/transport is allowed here because recursion has ended.
    // Do not move packaging into recursive catches, omit proved siblings,
    // restart parent work, or publish a WDL value for an unfinished task.
    const rootPly = state.ply, frames = [];
    // The budget-rejected node itself was never entered. Restore the active
    // ancestor path after recursion has fully unwound, then package cold data.
    while (state.ply + 1 < this.continuationPly) state.applyUnchecked(this.continuation[state.ply]);
    while (true) {
      const moves = [];
      for (let ply = 0; ply < state.ply; ply++) moves.push(this.continuation[ply]);
      const values = [];
      for (let column = 0; column < 7; column++) if (state.canPlay(column)) {
        state.applyUnchecked(column);
        let value;
        try { value = this.transitionCache.get(state); } finally { state.undo(); }
        if (value !== undefined) values.push({ column, value });
      }
      frames.push({ moves, values });
      if (state.ply === rootPly) break;
      state.undo();
    }
    return frames;
  }

  runTask({ moves, rootPly, nodeBudget, abort, needed }) {
    // OWNER-PROTECTED PREPARATION — do not remove/weaken this comment.
    // Validate/admit, preload and seal before entry; preserve external-root
    // ordering and warm caches. The reservation bound below belongs to this
    // ordinary-value profile: do not add consumers without re-proving it.
    positive(nodeBudget, 'task node budget');
    if (this.certificates.size !== 0 || this.valueResolver !== null)
      throw new Error('native worker tasks require the ordinary-value profile');
    if (!Array.isArray(moves) || !Number.isInteger(rootPly) || rootPly < 0 || rootPly > moves.length)
      throw new TypeError('invalid native task replay');
    if (!(abort instanceof SharedArrayBuffer) || abort.byteLength !== 4 ||
        !(needed instanceof SharedArrayBuffer) || needed.byteLength !== 4) throw new TypeError('invalid task controls');
    this.needed = new Int32Array(needed); this.controlChecks = 0;
    if (!Atomics.load(this.needed, 0)) return { kind:'retired', nodes:0, metrics:{} };
    this.abort = new Int32Array(abort); this.nodeBudget = nodeBudget; this.nextControlNode = 0;
    const state = this.createState(moves);
    // At most one own and one block class per entered edge, plus their two
    // reflected classes during q lookup. The unentered budget boundary can
    // create two edge classes; the root lacks that entering edge. Four classes
    // per admitted node therefore bounds this ordinary-value task. Each class
    // creates at most one chunk in each slot. Reserve before recursive entry.
    this.pool.prepareSearchStorage(4 * nodeBudget);
    this.transitionCache.prepareSearchStorage(nodeBudget);
    // Reset through the native entry contract, but preserve EXTERNAL root scope
    // for advisory ordering on a subtree delegated to a worker.
    for (const key of Object.keys(this.metrics)) this.metrics[key] = 0;
    this.orderingRootPly = rootPly;
    let result;
    let yielded = false;
    try { result = { kind:'exact', value:this.solveNode(state) }; }
    catch (error) {
      if (error === quantumEnd) yielded = true;
      else if (error === taskRetired) result = { kind:'retired' };
      else throw error;
    }
    finally {
      this.nextControlNode = Infinity;
      this.pool.releaseSearchStorage();
      this.transitionCache.sealed = false;
    }
    if (yielded) result = { kind:'split',frames:this.packageContinuation(state) };
    if (state.ply !== moves.length) throw new Error('task failed to restore native root');
    return { ...result, nodes:this.metrics.nodes, metrics:{...this.metrics,controlChecks:this.controlChecks} };
  }
}
