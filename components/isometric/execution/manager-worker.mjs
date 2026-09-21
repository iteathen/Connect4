import { parentPort, workerData } from 'node:worker_threads';
import { CENTER_ORDER } from '../move-order.mjs';
import {
  CTRL_ABORT,
  CTRL_ERROR,
  CTRL_MANAGER_WAKE,
  CTRL_Q_HIGH_WATER,
  CTRL_ROOT_GENERATION,
  CTRL_ROOT_MOVE,
  CTRL_ROOT_MOVE_READY,
  CTRL_ROOT_ORIENTATION,
  CTRL_ROOT_Q,
  CTRL_ROOT_VALUE,
  CTRL_READY_COUNT,
  CTRL_SESSION,
  CTRL_WORKER_WAKE,
  EXEC_NONE,
  EXEC_QUEUED,
  EXEC_RUNNING_BASE,
  Q_EXACT_UNKNOWN,
  SESSION_DONE,
  SESSION_FAILED,
  SESSION_RUNNING,
  addQRef,
  allocateParentEdge,
  cancelQueuedQ,
  enqueueQ,
  executionWorker,
  openSharedTT,
  publishExactQ,
  qIsCurrent,
  readExactQ,
  recoverWorkerBucketLocks,
  recoverWorkerTTReservations,
  recycleQIfDead,
  releaseParentEdge,
  releaseQRef,
} from './shared-tt.mjs';
import {
  EVENT_DUPLICATE,
  EVENT_EXACT,
  EVENT_RELEASE,
  consumeBranch,
  consumeEvent,
  openSharedEvents,
  recoverUnpublishedBranch,
} from './shared-events.mjs';

if (!parentPort) throw new Error('IsoMax BranchManager worker requires parentPort');

const tt = openSharedTT(workerData.tt);
const events = openSharedEvents(workerData.events);
const workerCount = workerData.workerCount;

const MC_BRANCHES = 0;
const MC_DUPLICATE_BRANCHES = 1;
const MC_EDGES = 2;
const MC_EXACT_EVENTS = 3;
const MC_EXACT_FINALIZED = 4;
const MC_DUPLICATE_RUNNING_RETIRED = 5;
const MC_RELEASE_REQUEUES = 6;
const MC_QUEUE_ADMISSIONS = 7;
const MC_RECYCLED_Q = 8;
const MC_ORPHAN_RETIREMENTS = 9;
const MC_ROOT_WITNESS_WAITS = 10;
const MC_STALE_DESCRIPTORS = 11;
const MC_WORKER_DEATH_RECOVERIES = 12;
const MC_WORKER_DEATH_REQUEUES = 13;
const MC_WORDS = 16;

class SharedBranchManagerLoop {
  constructor() {
    this.metrics = new Int32Array(MC_WORDS);
    this.branchHeader = new Int32Array(9);
    this.branchChildQ = new Int32Array(7);
    this.branchChildGeneration = new Int32Array(7);
    this.branchChildEval = new Int32Array(7);
    this.event = new Int32Array(5);
    this.finalizeQ = new Int32Array(tt.qCapacity);
    this.finalizeGeneration = new Int32Array(tt.qCapacity);
    this.finalizeHead = 0;
    this.finalizeTail = 0;
    this.orphanQ = new Int32Array(tt.qCapacity);
    this.orphanGeneration = new Int32Array(tt.qCapacity);
    this.orphanHead = 0;
    this.orphanTail = 0;

    // Visibility lives in the shared TT. This manager-only intrusive index is
    // scheduling metadata: it selects which visible q enter the bounded ready
    // reservoir without creating another work object or semantic authority.
    this.candidateNext = new Int32Array(tt.qCapacity); this.candidateNext.fill(-1);
    this.candidatePrev = new Int32Array(tt.qCapacity); this.candidatePrev.fill(-1);
    this.candidateGeneration = new Int32Array(tt.qCapacity);
    this.candidateBand = new Int8Array(tt.qCapacity); this.candidateBand.fill(-1);
    this.candidateHead = new Int32Array(8); this.candidateHead.fill(-1);
    this.candidateTail = new Int32Array(8); this.candidateTail.fill(-1);
    this.readyTarget = Math.max(workerCount, workerCount * 4);
  }

  bump(index, delta = 1) {
    this.metrics[index] += delta;
  }

  wakeWorkers() {
    Atomics.add(tt.control, CTRL_WORKER_WAKE, 1);
    Atomics.notify(tt.control, CTRL_WORKER_WAKE, Infinity);
  }

  requestReset(worker) {
    if (worker < 0 || worker >= workerCount) return;
    Atomics.add(tt.workerReset, worker, 1);
    this.bump(MC_DUPLICATE_RUNNING_RETIRED);
  }

  unlinkCandidate(qIndex) {
    const band = this.candidateBand[qIndex];
    if (band < 0) return false;
    const previous = this.candidatePrev[qIndex];
    const next = this.candidateNext[qIndex];
    if (previous >= 0) this.candidateNext[previous] = next;
    else this.candidateHead[band] = next;
    if (next >= 0) this.candidatePrev[next] = previous;
    else this.candidateTail[band] = previous;
    this.candidatePrev[qIndex] = -1;
    this.candidateNext[qIndex] = -1;
    this.candidateBand[qIndex] = -1;
    return true;
  }

  queueIfNeeded(qIndex, generation, priority = Atomics.load(tt.qPriorityClass, qIndex)) {
    if (!qIsCurrent(tt, qIndex, generation)
        || readExactQ(tt, qIndex, generation) !== Q_EXACT_UNKNOWN
        || Atomics.load(tt.qExecution, qIndex) !== EXEC_NONE
        || Atomics.load(tt.qRefCount, qIndex) <= 0) {
      if (qIndex >= 0 && qIndex < tt.qCapacity) this.unlinkCandidate(qIndex);
      return false;
    }
    const band = Math.max(0, Math.min(7, priority | 0));
    Atomics.store(tt.qPriorityClass, qIndex, band);
    const current = this.candidateBand[qIndex];
    const sameGeneration = this.candidateGeneration[qIndex] === generation;
    if (current === band && sameGeneration) return true;
    if (current >= 0) this.unlinkCandidate(qIndex);

    const tail = this.candidateTail[band];
    this.candidatePrev[qIndex] = tail;
    this.candidateNext[qIndex] = -1;
    this.candidateGeneration[qIndex] = generation;
    this.candidateBand[qIndex] = band;
    if (tail >= 0) this.candidateNext[tail] = qIndex;
    else this.candidateHead[band] = qIndex;
    this.candidateTail[band] = qIndex;
    return true;
  }

  popCandidate() {
    for (let band = 7; band >= 0; band--) {
      while (this.candidateHead[band] >= 0) {
        const qIndex = this.candidateHead[band];
        const generation = this.candidateGeneration[qIndex];
        this.unlinkCandidate(qIndex);
        if (!qIsCurrent(tt, qIndex, generation)
            || readExactQ(tt, qIndex, generation) !== Q_EXACT_UNKNOWN
            || Atomics.load(tt.qExecution, qIndex) !== EXEC_NONE
            || Atomics.load(tt.qRefCount, qIndex) <= 0) continue;
        return [qIndex, generation, Math.max(
          band,
          Atomics.load(tt.qPriorityClass, qIndex),
        )];
      }
    }
    return null;
  }

  refillReady() {
    let admitted = 0;
    while (Atomics.load(tt.control, CTRL_READY_COUNT) < this.readyTarget) {
      const candidate = this.popCandidate();
      if (candidate === null) break;
      if (enqueueQ(tt, candidate[0], candidate[1], candidate[2])) {
        this.bump(MC_QUEUE_ADMISSIONS);
        admitted++;
      }
    }
    return admitted;
  }

  pushOrphan(qIndex, generation) {
    if (this.orphanTail >= tt.qCapacity) {
      if (this.orphanHead === this.orphanTail) {
        this.orphanHead = 0;
        this.orphanTail = 0;
      } else {
        throw new Error('ISOMAX_ORPHAN_QUEUE_CAPACITY');
      }
    }
    this.orphanQ[this.orphanTail] = qIndex;
    this.orphanGeneration[this.orphanTail] = generation;
    this.orphanTail++;
  }

  unlinkIncomingEdge(childQ, childGeneration, parentQ, parentGeneration, action) {
    if (!qIsCurrent(tt, childQ, childGeneration)) throw new Error('child q recycled while edge live');
    let edge = Atomics.load(tt.qParentHead, childQ);
    let previous = -1;
    while (edge >= 0) {
      if (tt.edgeParentQ[edge] === parentQ
          && tt.edgeParentGeneration[edge] === parentGeneration
          && tt.edgeChildQ[edge] === childQ
          && tt.edgeChildGeneration[edge] === childGeneration
          && tt.edgeAction[edge] === action) {
        const next = tt.edgeNextIncoming[edge];
        if (previous < 0) Atomics.store(tt.qParentHead, childQ, next);
        else tt.edgeNextIncoming[previous] = next;
        releaseParentEdge(tt, edge);
        Atomics.sub(tt.qFanIn, childQ, 1);
        return true;
      }
      previous = edge;
      edge = tt.edgeNextIncoming[edge];
    }
    return false;
  }

  releaseOutgoing(qIndex, generation) {
    if (!qIsCurrent(tt, qIndex, generation)) return;
    const mask = Atomics.load(tt.qChildMask, qIndex);
    if (mask === 0) return;
    const base = qIndex * 7;
    for (let action = 0; action < 7; action++) {
      if ((mask & (1 << action)) === 0) continue;
      const childQ = tt.qChildIndex[base + action];
      const childGeneration = tt.qChildGeneration[base + action];
      if (childQ < 0 || !qIsCurrent(tt, childQ, childGeneration)) {
        throw new Error('shared topology contains stale child q');
      }
      if (!this.unlinkIncomingEdge(
        childQ, childGeneration, qIndex, generation, action,
      )) throw new Error('shared topology missing incoming edge');
      const remaining = releaseQRef(tt, childQ, childGeneration);
      tt.qChildIndex[base + action] = -1;
      tt.qChildGeneration[base + action] = 0;
      tt.qChildEval[base + action] = 0;
      if (remaining === 0) this.pushOrphan(childQ, childGeneration);
    }
    Atomics.store(tt.qChildMask, qIndex, 0);
  }

  drainOrphans() {
    const rootQ = Atomics.load(tt.control, CTRL_ROOT_Q);
    const rootGeneration = Atomics.load(tt.control, CTRL_ROOT_GENERATION);
    while (this.orphanHead < this.orphanTail) {
      const qIndex = this.orphanQ[this.orphanHead];
      const generation = this.orphanGeneration[this.orphanHead++];
      if (!qIsCurrent(tt, qIndex, generation)) continue;
      if (qIndex === rootQ && generation === rootGeneration) continue;
      if (Atomics.load(tt.qRefCount, qIndex) !== 0) continue;
      this.unlinkCandidate(qIndex);

      let execution = Atomics.load(tt.qExecution, qIndex);
      if (execution >= EXEC_RUNNING_BASE) {
        this.requestReset(executionWorker(execution));
        continue;
      }
      if (execution === EXEC_QUEUED) {
        cancelQueuedQ(tt, qIndex, generation);
        execution = Atomics.load(tt.qExecution, qIndex);
      }
      if (execution !== EXEC_NONE) continue;

      if (Atomics.load(tt.qChildMask, qIndex) !== 0) {
        this.bump(MC_ORPHAN_RETIREMENTS);
        this.releaseOutgoing(qIndex, generation);
      }
      if (Atomics.load(tt.qRefCount, qIndex) === 0
          && Atomics.load(tt.qParentHead, qIndex) === -1
          && recycleQIfDead(tt, qIndex, generation)) {
        this.bump(MC_RECYCLED_Q);
      }
    }
    if (this.orphanHead === this.orphanTail) {
      this.orphanHead = 0;
      this.orphanTail = 0;
    }
  }

  releaseDescriptorRef(qIndex, generation) {
    if (!qIsCurrent(tt, qIndex, generation)) return;
    const remaining = releaseQRef(tt, qIndex, generation);
    if (remaining === 0) this.pushOrphan(qIndex, generation);
  }

  releaseDescriptorChildren(mask) {
    for (let action = 0; action < 7; action++) {
      if ((mask & (1 << action)) === 0) continue;
      this.releaseDescriptorRef(
        this.branchChildQ[action],
        this.branchChildGeneration[action],
      );
    }
  }

  attachPassthrough(startQ, startGeneration, decisionQ, decisionGeneration, firstAction) {
    if (startQ === decisionQ && startGeneration === decisionGeneration) {
      // The decision descriptor carries one temporary q pin even when the
      // decision endpoint is the already-running q. No new topology owns it.
      this.releaseDescriptorRef(decisionQ, decisionGeneration);
      return true;
    }
    if (firstAction < 0 || firstAction >= 7) {
      throw new Error('deterministic q transition lacks canonical first action');
    }
    if (!qIsCurrent(tt, startQ, startGeneration)
        || !qIsCurrent(tt, decisionQ, decisionGeneration)) return false;

    const expectedMask = 1 << firstAction;
    const existingMask = Atomics.load(tt.qChildMask, startQ);
    const base = startQ * 7;

    if (existingMask !== 0) {
      const matches = existingMask === expectedMask
        && tt.qChildIndex[base + firstAction] === decisionQ
        && tt.qChildGeneration[base + firstAction] === decisionGeneration;
      this.releaseDescriptorRef(decisionQ, decisionGeneration);
      if (!matches) throw new Error('conflicting deterministic canonical q topology');
      return true;
    }

    if (readExactQ(tt, startQ, startGeneration) !== Q_EXACT_UNKNOWN) {
      this.releaseDescriptorRef(decisionQ, decisionGeneration);
      return false;
    }

    tt.qChildIndex[base + firstAction] = decisionQ;
    tt.qChildGeneration[base + firstAction] = decisionGeneration;
    tt.qChildEval[base + firstAction] = 7;

    const edge = allocateParentEdge(tt);
    tt.edgeParentQ[edge] = startQ;
    tt.edgeParentGeneration[edge] = startGeneration;
    tt.edgeChildQ[edge] = decisionQ;
    tt.edgeChildGeneration[edge] = decisionGeneration;
    tt.edgeAction[edge] = firstAction;
    tt.edgeNextIncoming[edge] = Atomics.load(tt.qParentHead, decisionQ);
    Atomics.store(tt.qParentHead, decisionQ, edge);
    Atomics.add(tt.qFanIn, decisionQ, 1);
    Atomics.store(tt.qChildMask, startQ, expectedMask);
    this.bump(MC_EDGES);
    this.tryReduceParent(startQ, startGeneration);
    return true;
  }

  attachBranch(worker) {
    const startQ = this.branchHeader[0];
    const startGeneration = this.branchHeader[1];
    const decisionQ = this.branchHeader[2];
    const decisionGeneration = this.branchHeader[3];
    const firstAction = this.branchHeader[4];
    const mask = this.branchHeader[5];
    const retainedAction = this.branchHeader[6];
    const maximizing = this.branchHeader[7];

    if (!qIsCurrent(tt, startQ, startGeneration)
        || !qIsCurrent(tt, decisionQ, decisionGeneration)) {
      this.bump(MC_STALE_DESCRIPTORS);
      this.releaseDescriptorRef(decisionQ, decisionGeneration);
      this.releaseDescriptorChildren(mask);
      return;
    }

    if (!this.attachPassthrough(
      startQ,
      startGeneration,
      decisionQ,
      decisionGeneration,
      firstAction,
    )) {
      this.releaseDescriptorChildren(mask);
      return;
    }

    const parentQ = decisionQ;
    const parentGeneration = decisionGeneration;
    const rootQ = Atomics.load(tt.control, CTRL_ROOT_Q);
    const rootGeneration = Atomics.load(tt.control, CTRL_ROOT_GENERATION);
    const isRoot = parentQ === rootQ && parentGeneration === rootGeneration;
    const parentExact = readExactQ(tt, parentQ, parentGeneration);
    const existingMask = Atomics.load(tt.qChildMask, parentQ);

    // mask=0 is a pure deterministic-link descriptor. The endpoint may already
    // be exact or may already have canonical topology from another worker.
    if (mask === 0) {
      if (parentExact !== Q_EXACT_UNKNOWN) {
        this.scheduleFinalize(parentQ, parentGeneration);
        this.tryReduceParent(startQ, startGeneration);
      } else {
        this.queueIfNeeded(
          parentQ,
          parentGeneration,
          Math.max(Atomics.load(tt.qPriorityClass, parentQ), 7),
        );
      }
      if (isRoot && parentExact !== Q_EXACT_UNKNOWN) this.tryCompleteRoot();
      return;
    }

    if (existingMask !== 0) {
      if (existingMask !== mask
          || Atomics.load(tt.qReductionMaximizing, parentQ) !== maximizing) {
        throw new Error('conflicting canonical q branch topology');
      }
      const base = parentQ * 7;
      for (let action = 0; action < 7; action++) {
        if ((mask & (1 << action)) === 0) continue;
        if (tt.qChildIndex[base + action] !== this.branchChildQ[action]
            || tt.qChildGeneration[base + action] !== this.branchChildGeneration[action]) {
          throw new Error('conflicting canonical q child topology');
        }
      }
      this.bump(MC_DUPLICATE_BRANCHES);
      this.releaseDescriptorChildren(mask);
      if (isRoot && parentExact !== Q_EXACT_UNKNOWN) this.tryCompleteRoot();
      return;
    }

    if (parentExact !== Q_EXACT_UNKNOWN && !isRoot) {
      this.releaseDescriptorChildren(mask);
      this.scheduleFinalize(parentQ, parentGeneration);
      return;
    }

    const base = parentQ * 7;
    Atomics.store(tt.qReductionMaximizing, parentQ, maximizing);
    for (let action = 0; action < 7; action++) {
      if ((mask & (1 << action)) === 0) continue;
      const childQ = this.branchChildQ[action];
      const childGeneration = this.branchChildGeneration[action];
      if (!qIsCurrent(tt, childQ, childGeneration)) {
        throw new Error('branch descriptor contains stale child q');
      }

      // The descriptor's probe pin transfers directly into this edge. Do not
      // add another q ref: one relationship has exactly one ownership pin.
      tt.qChildIndex[base + action] = childQ;
      tt.qChildGeneration[base + action] = childGeneration;
      tt.qChildEval[base + action] = this.branchChildEval[action];

      const edge = allocateParentEdge(tt);
      tt.edgeParentQ[edge] = parentQ;
      tt.edgeParentGeneration[edge] = parentGeneration;
      tt.edgeChildQ[edge] = childQ;
      tt.edgeChildGeneration[edge] = childGeneration;
      tt.edgeAction[edge] = action;
      tt.edgeNextIncoming[edge] = Atomics.load(tt.qParentHead, childQ);
      Atomics.store(tt.qParentHead, childQ, edge);
      Atomics.add(tt.qFanIn, childQ, 1);
      this.bump(MC_EDGES);

      const priority = Math.max(
        Atomics.load(tt.qPriorityClass, childQ),
        this.branchChildEval[action],
      );
      Atomics.store(tt.qPriorityClass, childQ, priority);
      Atomics.store(tt.qPriorityDepth, childQ, tt.qSupport[childQ] >>> 21);
      if (action !== retainedAction) this.queueIfNeeded(childQ, childGeneration, priority);
    }
    Atomics.store(tt.qChildMask, parentQ, mask);
    this.bump(MC_BRANCHES);
    this.tryReduceParent(parentQ, parentGeneration);
    this.tryReduceParent(startQ, startGeneration);
    if (isRoot) this.tryCompleteRoot();
  }

  scheduleFinalize(qIndex, generation) {
    if (!qIsCurrent(tt, qIndex, generation)) return false;
    if (Atomics.compareExchange(tt.qExactFinalized, qIndex, 0, 1) !== 0) return false;
    if (this.finalizeTail >= tt.qCapacity) {
      if (this.finalizeHead === this.finalizeTail) {
        this.finalizeHead = 0;
        this.finalizeTail = 0;
      } else {
        throw new Error('ISOMAX_EXACT_PROPAGATION_CAPACITY');
      }
    }
    this.finalizeQ[this.finalizeTail] = qIndex;
    this.finalizeGeneration[this.finalizeTail] = generation;
    this.finalizeTail++;
    return true;
  }

  managerPublishExact(qIndex, generation, value) {
    const priorExecution = publishExactQ(tt, qIndex, generation, value);
    if (priorExecution < 0) return;
    if (priorExecution >= EXEC_RUNNING_BASE) this.requestReset(executionWorker(priorExecution));
    this.scheduleFinalize(qIndex, generation);
  }

  tryReduceParent(parentQ, parentGeneration) {
    if (!qIsCurrent(tt, parentQ, parentGeneration)) return;
    if (readExactQ(tt, parentQ, parentGeneration) !== Q_EXACT_UNKNOWN) {
      this.scheduleFinalize(parentQ, parentGeneration);
      return;
    }
    const mask = Atomics.load(tt.qChildMask, parentQ);
    if (mask === 0) return;

    const maximizing = Atomics.load(tt.qReductionMaximizing, parentQ) !== 0;
    let best = maximizing ? -1 : 1;
    let allExact = true;
    const base = parentQ * 7;
    for (let action = 0; action < 7; action++) {
      if ((mask & (1 << action)) === 0) continue;
      const childQ = tt.qChildIndex[base + action];
      const childGeneration = tt.qChildGeneration[base + action];
      const value = readExactQ(tt, childQ, childGeneration);
      if (value === Q_EXACT_UNKNOWN) {
        allExact = false;
        continue;
      }
      if (maximizing) {
        if (value > best) best = value;
        if (best === 1) {
          this.managerPublishExact(parentQ, parentGeneration, 1);
          return;
        }
      } else {
        if (value < best) best = value;
        if (best === -1) {
          this.managerPublishExact(parentQ, parentGeneration, -1);
          return;
        }
      }
    }
    if (allExact) this.managerPublishExact(parentQ, parentGeneration, best);
  }

  drainFinalization() {
    const rootQ = Atomics.load(tt.control, CTRL_ROOT_Q);
    const rootGeneration = Atomics.load(tt.control, CTRL_ROOT_GENERATION);
    while (this.finalizeHead < this.finalizeTail) {
      const qIndex = this.finalizeQ[this.finalizeHead];
      const generation = this.finalizeGeneration[this.finalizeHead++];
      if (!qIsCurrent(tt, qIndex, generation)) continue;
      if (readExactQ(tt, qIndex, generation) === Q_EXACT_UNKNOWN) {
        throw new Error('finalizing non-exact q');
      }

      let edge = Atomics.load(tt.qParentHead, qIndex);
      while (edge >= 0) {
        const parentQ = tt.edgeParentQ[edge];
        const parentGeneration = tt.edgeParentGeneration[edge];
        this.tryReduceParent(parentQ, parentGeneration);
        edge = tt.edgeNextIncoming[edge];
      }

      const isRoot = qIndex === rootQ && generation === rootGeneration;
      if (!isRoot) this.releaseOutgoing(qIndex, generation);
      Atomics.store(tt.qExactFinalized, qIndex, 2);
      this.bump(MC_EXACT_FINALIZED);
    }
    if (this.finalizeHead === this.finalizeTail) {
      this.finalizeHead = 0;
      this.finalizeTail = 0;
    }
    this.drainOrphans();
  }

  processEvent(worker) {
    const kind = this.event[0];
    const qIndex = this.event[1];
    const generation = this.event[2];
    const value = this.event[3];
    const aux = this.event[4];

    if (kind === EVENT_EXACT) {
      this.bump(MC_EXACT_EVENTS);
      if (aux >= EXEC_RUNNING_BASE) {
        const owner = executionWorker(aux);
        if (owner !== worker) this.requestReset(owner);
      }
      if (qIsCurrent(tt, qIndex, generation)) {
        const exact = readExactQ(tt, qIndex, generation);
        if (exact !== value) throw new Error('worker exact event disagrees with shared q');
        this.scheduleFinalize(qIndex, generation);
      }
      return;
    }

    if (kind === EVENT_DUPLICATE) {
      if (qIsCurrent(tt, qIndex, generation)
          && readExactQ(tt, qIndex, generation) === Q_EXACT_UNKNOWN
          && aux >= 0 && aux !== worker) {
        this.requestReset(worker);
      }
      return;
    }

    if (kind === EVENT_RELEASE) {
      if (!qIsCurrent(tt, qIndex, generation)) return;
      if (Atomics.load(tt.qRefCount, qIndex) === 0) {
        this.pushOrphan(qIndex, generation);
      } else if (readExactQ(tt, qIndex, generation) === Q_EXACT_UNKNOWN
          && Atomics.load(tt.qExecution, qIndex) === EXEC_NONE) {
        if (this.queueIfNeeded(qIndex, generation)) this.bump(MC_RELEASE_REQUEUES);
      }
      return;
    }

    throw new Error('unknown IsoMax worker event');
  }

  tryRootWitness(rootQ, rootGeneration, value) {
    if (Atomics.load(tt.control, CTRL_ROOT_MOVE_READY)) return true;
    const mask = Atomics.load(tt.qChildMask, rootQ);
    if (mask === 0) {
      this.bump(MC_ROOT_WITNESS_WAITS);
      return false;
    }

    const orientation = Atomics.load(tt.control, CTRL_ROOT_ORIENTATION);
    const base = rootQ * 7;
    for (let index = 0; index < CENTER_ORDER.length; index++) {
      const physical = CENTER_ORDER[index];
      const action = orientation ? 6 - physical : physical;
      if ((mask & (1 << action)) === 0) continue;
      const childQ = tt.qChildIndex[base + action];
      const childGeneration = tt.qChildGeneration[base + action];
      const childValue = readExactQ(tt, childQ, childGeneration);
      if (childValue === Q_EXACT_UNKNOWN) {
        this.queueIfNeeded(
          childQ,
          childGeneration,
          Math.max(Atomics.load(tt.qPriorityClass, childQ), 7),
        );
        this.bump(MC_ROOT_WITNESS_WAITS);
        return false;
      }
      if (childValue === value) {
        Atomics.store(tt.control, CTRL_ROOT_MOVE, physical);
        Atomics.store(tt.control, CTRL_ROOT_MOVE_READY, 1);
        return true;
      }
    }
    throw new Error('exact root lacks deterministic preserving action');
  }

  tryCompleteRoot() {
    const rootQ = Atomics.load(tt.control, CTRL_ROOT_Q);
    const rootGeneration = Atomics.load(tt.control, CTRL_ROOT_GENERATION);
    if (!qIsCurrent(tt, rootQ, rootGeneration)) return false;
    const value = readExactQ(tt, rootQ, rootGeneration);
    if (value === Q_EXACT_UNKNOWN) return false;
    Atomics.store(tt.control, CTRL_ROOT_VALUE, value);
    if (!this.tryRootWitness(rootQ, rootGeneration, value)) return false;

    this.releaseOutgoing(rootQ, rootGeneration);
    Atomics.store(tt.control, CTRL_SESSION, SESSION_DONE);
    this.wakeWorkers();
    return true;
  }

  recoverDeadWorkers() {
    let progress = false;
    for (let worker = 0; worker < workerCount; worker++) {
      const deathGeneration = Atomics.load(tt.workerDeath, worker);
      if (deathGeneration === Atomics.load(tt.workerRecovery, worker)) continue;

      // BranchManager owns failure recovery. A worker ID is not reusable until
      // every lock/reservation/publication owned by its dead generation has a
      // deterministic disposition here.
      recoverWorkerBucketLocks(tt, worker);
      recoverWorkerTTReservations(tt, worker);
      recoverUnpublishedBranch(events, tt, worker);

      const high = Math.min(
        tt.qCapacity,
        Atomics.load(tt.control, CTRL_Q_HIGH_WATER),
      );
      for (let qIndex = 0; qIndex < high; qIndex++) {
        if (Atomics.load(tt.qLive, qIndex) === 0) continue;
        if (Atomics.compareExchange(
          tt.qExecution,
          qIndex,
          EXEC_RUNNING_BASE + worker,
          EXEC_NONE,
        ) !== EXEC_RUNNING_BASE + worker) continue;

        const generation = Atomics.load(tt.qGeneration, qIndex);
        if (readExactQ(tt, qIndex, generation) !== Q_EXACT_UNKNOWN) {
          this.scheduleFinalize(qIndex, generation);
          continue;
        }
        if (Atomics.load(tt.qRefCount, qIndex) > 0) {
          if (this.queueIfNeeded(
            qIndex,
            generation,
            Atomics.load(tt.qPriorityClass, qIndex),
          )) this.bump(MC_WORKER_DEATH_REQUEUES);
        } else {
          this.pushOrphan(qIndex, generation);
        }
      }

      Atomics.store(tt.workerRecovery, worker, deathGeneration);
      Atomics.notify(tt.workerRecovery, worker, Infinity);
      this.bump(MC_WORKER_DEATH_RECOVERIES);
      progress = true;
    }
    return progress;
  }

  drainOnce() {
    let progress = this.recoverDeadWorkers();

    for (let worker = 0; worker < workerCount; worker++) {
      while (consumeBranch(
        events,
        worker,
        this.branchHeader,
        this.branchChildQ,
        this.branchChildGeneration,
        this.branchChildEval,
      )) {
        progress = true;
        this.attachBranch(worker);
      }
    }

    for (let worker = 0; worker < workerCount; worker++) {
      while (consumeEvent(events, worker, this.event)) {
        progress = true;
        this.processEvent(worker);
      }
    }

    this.drainFinalization();
    this.drainOrphans();
    if (this.tryCompleteRoot()) progress = true;
    if (this.refillReady() > 0) progress = true;
    return progress;
  }

  run() {
    while (Atomics.load(tt.control, CTRL_SESSION) === SESSION_RUNNING
        && !Atomics.load(tt.control, CTRL_ABORT)) {
      const progress = this.drainOnce();
      if (Atomics.load(tt.control, CTRL_SESSION) !== SESSION_RUNNING
          || Atomics.load(tt.control, CTRL_ABORT)) break;
      if (!progress) {
        const wake = Atomics.load(tt.control, CTRL_MANAGER_WAKE);
        if (Atomics.load(tt.control, CTRL_SESSION) !== SESSION_RUNNING
            || Atomics.load(tt.control, CTRL_ABORT)) break;
        Atomics.wait(tt.control, CTRL_MANAGER_WAKE, wake, 10);
      }
    }

    if (Atomics.load(tt.control, CTRL_ABORT)
        && Atomics.load(tt.control, CTRL_SESSION) === SESSION_RUNNING) {
      Atomics.store(tt.control, CTRL_SESSION, SESSION_FAILED);
      this.wakeWorkers();
    }

    return {
      branches: this.metrics[MC_BRANCHES],
      duplicateBranches: this.metrics[MC_DUPLICATE_BRANCHES],
      edges: this.metrics[MC_EDGES],
      exactEvents: this.metrics[MC_EXACT_EVENTS],
      exactFinalized: this.metrics[MC_EXACT_FINALIZED],
      duplicateRunningRetired: this.metrics[MC_DUPLICATE_RUNNING_RETIRED],
      releaseRequeues: this.metrics[MC_RELEASE_REQUEUES],
      queueAdmissions: this.metrics[MC_QUEUE_ADMISSIONS],
      recycledQ: this.metrics[MC_RECYCLED_Q],
      orphanRetirements: this.metrics[MC_ORPHAN_RETIREMENTS],
      rootWitnessWaits: this.metrics[MC_ROOT_WITNESS_WAITS],
      staleDescriptors: this.metrics[MC_STALE_DESCRIPTORS],
      workerDeathRecoveries: this.metrics[MC_WORKER_DEATH_RECOVERIES],
      workerDeathRequeues: this.metrics[MC_WORKER_DEATH_REQUEUES],
    };
  }
}

try {
  const manager = new SharedBranchManagerLoop();
  const metrics = manager.run();
  parentPort.postMessage({ type: 'manager-done', metrics });
} catch (error) {
  Atomics.store(tt.control, CTRL_ERROR, 1);
  Atomics.store(tt.control, CTRL_ABORT, 1);
  Atomics.store(tt.control, CTRL_SESSION, SESSION_FAILED);
  Atomics.add(tt.control, CTRL_WORKER_WAKE, 1);
  Atomics.notify(tt.control, CTRL_WORKER_WAKE, Infinity);
  parentPort.postMessage({
    type: 'manager-error',
    message: error?.message ?? String(error),
    stack: error?.stack,
  });
}
