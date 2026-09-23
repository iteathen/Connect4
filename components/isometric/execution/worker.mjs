import { enter, leave, take, intern7x6, signal, setExact, tighten7x6, releaseExecution,
  fail, CONTRACT, CANCELLED, KEY_WORDS, ACTIONS, WAKE, READY_COUNT, STOP, DONE } from './shared-tt.mjs';
import {BOUNDARY_INCOMPLETE, QUERY_UNCOVERED, INTERRUPTED} from '../rba/layout.mjs';

// COLD. The prepared kernel may add its private numeric storage here once.
export function prepareWorker7x6(owner, workerCount) {
  if (!Number.isInteger(owner) || owner < 2 || owner > 0x7fffffff ||
      !Number.isInteger(workerCount) || workerCount < 1) throw new RangeError('worker configuration');
  return { owner, allowExpose: workerCount > 1 ? 1 : 0, readyTarget: workerCount * 2,
    expose: 0, q: -1, code: 0,
    count: 0, witness: -1, keys: new Uint32Array(ACTIONS * KEY_WORDS),
    lower:1,upper:3,childMask:127,
    actionLower:new Uint32Array(ACTIONS).fill(1),actionUpper:new Uint32Array(ACTIONS).fill(3),
    childBasis:new Uint32Array(ACTIONS*69),childBasisSize:new Uint32Array(ACTIONS),
    actions: new Uint32Array(ACTIONS), started: 1, claims: 0, continuations: 0, branches: 0,
    boundaryCalls:0,boundaryClosures:0,boundarySteps:0,boundaryFailures:0,boundaryStatus:0,
    transitions:0,actionClosures:0,actionsPruned:0 };
}

// E2 + trusted native-kernel boundary. PRESERVE this contract in callees.
// evaluate is prepared once, never under TT lock, and reads immutable q words
// directly while execution owns their lifetime. 1/2/3 = exact P1/draw/P0;
// 4 = ranked RBA dependencies (including one child); 5 = local continuation.
// expose is scheduling advice, never permission to deny primary q continuation.
// Bounds are exact P0 evidence; childMask selects materialized dependencies.
// Non-child actions must be exact or strictly dominated. Unknown is not WDL.
// No per-call object/view/string, message, promise, replay, or unwind is allowed.
// A completed result remains in this worker's prepared region if lock is busy;
// it is not computed again. New child keys alone require insertion writes.
export function workerStep7x6(t, w, evaluate) {
  if (w.q === -1) {
    if (!enter(t, w.owner)) return 0;
    w.q = take(t, w.owner);
    w.expose = w.allowExpose && t.control[READY_COUNT] < w.readyTarget ? 1 : 0;
    leave(t);
    if (w.q === -1) return 0;
    w.count = 0; w.witness = -1; w.code = 0; w.started = 1; w.claims++;
  } else if (w.code === 0) {
    // A kernel returns CONTINUE only at an amortized control boundary. Retired
    // private continuation is abandoned lazily, with no reconstruction/unwind.
    if (!enter(t, w.owner)) return 0;
    if (!t.refs[w.q] || t.exact[w.q]) {
      releaseExecution(t, w.q, w.owner); w.q = -1;
    }
    w.expose = w.allowExpose && t.control[READY_COUNT] < w.readyTarget ? 1 : 0;
    leave(t);
    if (w.q === -1) return 1;
  }
  if (w.code === 0) { w.code = evaluate(t, w.q, w, w.expose); w.started = 0; }
  if (w.code === 5) { w.code = 0; w.continuations++; return 1; }
  if (!enter(t, w.owner)) return 0;
  const q = w.q;
  let next = -1;
  if (t.execution[q] !== w.owner) fail(t, CONTRACT);
  else if (t.refs[q] === 0) releaseExecution(t, q, w.owner);
  else if (w.code >= 1 && w.code <= 3 && (w.code | 0) === w.code) {
    t.witness[q] = w.witness;
    setExact(t, q, w.code);
    releaseExecution(t, q, w.owner);
  } else if (w.code === 4 && w.count >= 1 && w.count <= ACTIONS &&
             (w.count | 0) === w.count) {
    let actionMask = 0;
    const rank = t.keys[q * KEY_WORDS] >>> 21;
    let good = w.childMask>=0&&w.childMask<=127&&(w.childMask|0)===w.childMask?1:0;
    for (let i = 0; i < w.count; i++) {
      const action = w.actions[i];
      const childRank = w.keys[i * KEY_WORDS] >>> 21;
      const lower=w.actionLower[i],upper=w.actionUpper[i];
      if (action >= ACTIONS || (actionMask & (1 << action)) ||
          lower<1||upper>3||lower>upper ||
          ((w.childMask&(1<<i)) && (childRank <= rank || childRank > 42)) ||
          (!(w.childMask&(1<<i)) && lower!==upper &&
            !((rank&1)?lower>w.upper:upper<w.lower))) { good = 0; break; }
      actionMask |= 1 << action;
    }
    if (!good) fail(t, CONTRACT);
    else {
      const base = q * ACTIONS;
      if(!tighten7x6(t,q,w.lower,w.upper))good=0;
      for (let i = 0; good && i < w.count; i++) {
        const child = (w.childMask&(1<<i))?intern7x6(t, w.keys, i * KEY_WORDS,w.childBasis,i*69,w.childBasisSize[i]):-1;
        if (child < 0 && (w.childMask&(1<<i))) { good = 0; break; }
        const edge = base + i;
        // Pin acquired and installed in one transaction. Never leave a child
        // reference on a detached descriptor or in an unrecorded ownership gap.
        t.child[edge] = child; t.childGeneration[edge] = child<0?0:t.generation[child];
        t.edgeAction[edge] = w.actions[i]; t.edgeAttached[edge] = 0;
        t.edgeLower[edge]=w.actionLower[i];t.edgeUpper[edge]=w.actionUpper[i];
        t.count[q] = i + 1;
        if(child>=0 && !tighten7x6(t,child,w.actionLower[i],w.actionUpper[i]))good=0;
      }
      if (good) {
        t.phase[q] = 2; signal(t, q); w.branches++;
        for(let i=0;i<w.count;i++){
          const first = t.child[base+i];
          if (first>=0 && !t.execution[first] && !t.exact[first] && !t.phase[first]) {
            t.execution[first] = w.owner; next = first;w.claims++;break;
          }
        }
        releaseExecution(t, q, w.owner);
      }
    }
  } else if (w.code >= BOUNDARY_INCOMPLETE && w.code <= QUERY_UNCOVERED && (w.code|0)===w.code) {
    fail(t,16+w.code); releaseExecution(t,q,w.owner);
  } else if (w.code === INTERRUPTED) {
    fail(t,CANCELLED); releaseExecution(t,q,w.owner);
  } else fail(t, CONTRACT);
  leave(t);
  w.q = next; w.code = 0; w.count = 0; w.witness = -1; w.started = 1;
  Atomics.add(t.control, WAKE, 1); Atomics.notify(t.control, WAKE);
  return 1;
}

// E2 enclosing loop is part of the same restricted/measured scope. Telemetry is
// numeric fixed storage at an amortized boundary, never formatted per node.
export function runWorkerLoop7x6(t,w,evaluate,metrics){
  while(!Atomics.load(t.control,STOP)&&!Atomics.load(t.control,DONE)){
    const observed=Atomics.load(t.control,WAKE);
    if(!workerStep7x6(t,w,evaluate))Atomics.wait(t.control,WAKE,observed,1);
    metrics[0]=w.claims;metrics[1]=w.branches;metrics[2]=w.continuations;
    metrics[3]=w.boundaryCalls;metrics[4]=w.boundaryClosures;
    metrics[5]=w.boundarySteps;metrics[6]=w.boundaryFailures;
    metrics[7]=w.transitions;metrics[8]=w.actionClosures;metrics[9]=w.actionsPruned;
  }
}
