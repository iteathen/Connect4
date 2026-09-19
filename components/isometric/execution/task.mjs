import { IsoMaxSolver } from '../solver.mjs';

const quantumEnd = Symbol('unfinished IsoMax task');
export function positive(value, name, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) throw new RangeError('invalid ' + name);
  return value;
}
export function validateTaskResult(message) {
  if (!message || !['exact', 'split', 'retired'].includes(message.kind)) throw new Error('invalid IsoMax result kind');
  if (message.kind === 'exact') {
    if (![ -1, 0, 1 ].includes(message.value)) throw new Error('invalid IsoMax exact value');
  } else if (Object.hasOwn(message, 'value')) throw new Error('unfinished work cannot carry WDL');
  if (!Number.isSafeInteger(message.nodes) || message.nodes < 0) throw new Error('invalid IsoMax node count');
}

// A task is a legal native replay, never a process-local residual/class ID.
// Local exact caches survive a scheduling yield. No unknown result is cached.
export class IsoMaxTaskSolver extends IsoMaxSolver {
  solveNode(state) {
    if ((this.metrics.nodes & 8191) === 0 && Atomics.load(this.abort, 0)) throw new Error('ISOMAX_ABORTED');
    if (this.metrics.nodes >= this.nodeBudget) throw quantumEnd;
    return super.solveNode(state);
  }

  runTask({ moves, rootPly, nodeBudget, abort, needed }) {
    positive(nodeBudget, 'task node budget');
    if (!Array.isArray(moves) || !Number.isInteger(rootPly) || rootPly < 0 || rootPly > moves.length)
      throw new TypeError('invalid native task replay');
    if (!(abort instanceof SharedArrayBuffer) || abort.byteLength !== 4 ||
        !(needed instanceof SharedArrayBuffer) || needed.byteLength !== 4) throw new TypeError('invalid task controls');
    if (!Atomics.load(new Int32Array(needed), 0)) return { kind:'retired', nodes:0, metrics:{} };
    this.abort = new Int32Array(abort); this.nodeBudget = nodeBudget;
    const state = this.createState(moves);
    // Reset through the native entry contract, but preserve EXTERNAL root scope
    // for advisory ordering on a subtree delegated to a worker.
    for (const key of Object.keys(this.metrics)) this.metrics[key] = 0;
    this.orderingRootPly = rootPly;
    let result;
    try { result = { kind:'exact', value:this.solveNode(state) }; }
    catch (error) { if (error !== quantumEnd) throw error; result = { kind:'split' }; }
    if (state.ply !== moves.length) throw new Error('task failed to restore native root');
    return { ...result, nodes:this.metrics.nodes, metrics:{...this.metrics} };
  }
}
