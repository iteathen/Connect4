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
  if(message.kind==='split' && (!Array.isArray(message.frames)||!message.frames.length||message.frames.length>42))
    throw new Error('split requires its native dependency continuation');
  if (!Number.isSafeInteger(message.nodes) || message.nodes < 0) throw new Error('invalid IsoMax node count');
}

// A task is a legal native replay, never a process-local residual/class ID.
// Local exact caches survive a scheduling yield. No unknown result is cached.
export class IsoMaxTaskSolver extends IsoMaxSolver {
  solveNode(state) {
    if ((this.metrics.nodes & 8191) === 0 && Atomics.load(this.abort, 0)) throw new Error('ISOMAX_ABORTED');
    if (this.metrics.nodes >= this.nodeBudget) throw quantumEnd;
    try{return super.solveNode(state);}
    catch(error){
      if(error===quantumEnd){
        // All recursive finally/undo blocks have restored this frame. Preserve
        // the in-progress dependency path and already proved sibling values.
        // This runs only on a scheduling yield, never on the normal hot path.
        const moves=Array.from(state.moveCells.subarray(0,state.ply),cell=>cell%7), values=[];
        for(let column=0;column<7;column++)if(state.canPlay(column)){
          state.applyUnchecked(column);
          let value;
          try{value=this.transitionCache.get(state);}finally{state.undo();}
          if(value!==undefined)values.push({column,value});
        }
        this.frames.push({moves,values});
      }
      throw error;
    }
  }

  runTask({ moves, rootPly, nodeBudget, abort, needed }) {
    positive(nodeBudget, 'task node budget');
    if (!Array.isArray(moves) || !Number.isInteger(rootPly) || rootPly < 0 || rootPly > moves.length)
      throw new TypeError('invalid native task replay');
    if (!(abort instanceof SharedArrayBuffer) || abort.byteLength !== 4 ||
        !(needed instanceof SharedArrayBuffer) || needed.byteLength !== 4) throw new TypeError('invalid task controls');
    if (!Atomics.load(new Int32Array(needed), 0)) return { kind:'retired', nodes:0, metrics:{} };
    this.abort = new Int32Array(abort); this.nodeBudget = nodeBudget;this.frames=[];
    const state = this.createState(moves);
    // Reset through the native entry contract, but preserve EXTERNAL root scope
    // for advisory ordering on a subtree delegated to a worker.
    for (const key of Object.keys(this.metrics)) this.metrics[key] = 0;
    this.orderingRootPly = rootPly;
    let result;
    try { result = { kind:'exact', value:this.solveNode(state) }; }
    catch (error) { if (error !== quantumEnd) throw error; result = { kind:'split',frames:this.frames }; }
    if (state.ply !== moves.length) throw new Error('task failed to restore native root');
    return { ...result, nodes:this.metrics.nodes, metrics:{...this.metrics} };
  }
}
