import { parentPort } from 'node:worker_threads';
import { ResidualPool } from '../residual-pool.mjs';
import { IsometricState } from '../state.mjs';
import { CENTER_ORDER } from '../move-order.mjs';
import {
  CTRL_ABORT,
  CTRL_FAILURE,
  CTRL_OCC_NEXT,
  CTRL_PUB_WAKE,
  CTRL_SESSION,
  CTRL_WORK_NEXT,
  MAX_MOVES,
  PRIORITY_BANDS,
  PUB_CHILD,
  PUB_EXACT,
  PUB_FAILURE,
  PUB_FRONTIER_END,
  PUB_RETIRED,
  SESSION_RUNNING,
  SESSION_STOP,
  WORK_DONE,
  WORK_FREE,
  WORK_READY,
  WORK_RUNNING,
  WORK_WRITING,
  allocateWorkSlot,
  dequeuePublication,
  enqueueReady,
  markReady,
  openSharedWorkPool,
  releaseOccurrenceSlot,
  releaseWorkSlot,
  retireWorkSlot,
  stopSharedPool,
} from './shared-work-pool.mjs';

if (!parentPort) throw new Error('IsoMax pull reconciler requires parentPort');

const Q_UNEXPANDED = 0;
const Q_DECISION = 1;
const Q_PASSTHROUGH = 2;

function positive(value, name, maximum = 1 << 28) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new RangeError('invalid ' + name);
  }
  return value;
}

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function mix32(value) {
  let x = value | 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x | 0;
}

function hashQ(p0, p1, support) {
  let hash = 0x811c9dc5 | 0;
  hash = Math.imul(hash ^ mix32(p0), 0x01000193);
  hash = Math.imul(hash ^ mix32(p1), 0x01000193);
  hash = Math.imul(hash ^ mix32(support | 0), 0x01000193);
  return mix32(hash);
}

class PullReconciler {
  constructor(message) {
    this.shared = openSharedWorkPool(message.pool);
    this.rootMoves = message.moves;
    this.rootPly = message.moves.length;
    this.selectMove = message.selectMove !== false;
    this.maxQ = positive(message.maxTasks, 'maxTasks');
    this.maxEdges = positive(message.maxEdges, 'maxEdges');
    this.progressIntervalMs = Math.max(100, message.progressIntervalMs ?? 1000);
    const requestedExecutionLimit = message.executionLimit ?? this.shared.workerCount * 4;
    this.executionLimit = Math.min(this.shared.workCapacity,
      positive(requestedExecutionLimit, 'executionLimit', this.shared.workCapacity));

    this.pool = new ResidualPool();
    this.state = new IsometricState({ pool:this.pool, moves:this.rootMoves });
    // Manager replay/canonicalization is E2 in this profile. Reserve enough
    // class/chunk/hash space before the publication loop; no growth is admitted
    // once workers can publish decision-frontier occurrences.
    this.pool.prepareSearchStorage(Math.min(2 ** 26, 4 * this.maxQ));

    this.key = new Int32Array(3);
    this.publication = new Int32Array(8);
    this.allocateScratch = new Int32Array(2);
    this.seenAlive = new Uint8Array(this.shared.workerCount);
    this.seenAlive.fill(1);

    this.qP0 = new Int32Array(this.maxQ);
    this.qP1 = new Int32Array(this.maxQ);
    this.qSupport = new Uint32Array(this.maxQ);
    this.qHash = new Int32Array(this.maxQ);
    this.qSide = new Uint8Array(this.maxQ);
    this.qTerminal = new Uint8Array(this.maxQ);
    this.qForm = new Uint8Array(this.maxQ);
    this.qExact = new Uint8Array(this.maxQ);
    this.qValue = new Int8Array(this.maxQ);
    this.qWork = new Int32Array(this.maxQ); this.qWork.fill(-1);
    this.qIncomingHead = new Int32Array(this.maxQ); this.qIncomingHead.fill(-1);
    this.qOutgoingHead = new Int32Array(this.maxQ); this.qOutgoingHead.fill(-1);
    this.qOutgoingTail = new Int32Array(this.maxQ); this.qOutgoingTail.fill(-1);
    this.qParentCount = new Uint32Array(this.maxQ);
    this.qUnresolved = new Uint8Array(this.maxQ);
    this.qDirectMove = new Int8Array(this.maxQ); this.qDirectMove.fill(-1);
    this.qOrderHint = new Uint8Array(this.maxQ);
    this.qPriority = new Uint8Array(this.maxQ);
    this.qAffinity = new Int16Array(this.maxQ); this.qAffinity.fill(-1);
    // Execution seed only: one legal physical replay representative per
    // canonical q. This is not q identity or proof identity. It lets semantic
    // demand outlive READY/RUNNING occurrence records safely.
    this.qReplayLength = new Uint8Array(this.maxQ);
    this.qReplay = new Uint8Array(this.maxQ * MAX_MOVES);

    const qHashCapacity = nextPowerOfTwo(this.maxQ * 2);
    this.qHashSlots = new Int32Array(qHashCapacity);
    this.qHashSlots.fill(-1);
    this.qHashMask = qHashCapacity - 1;
    this.qCount = 0;

    this.edgeParent = new Int32Array(this.maxEdges);
    this.edgeChild = new Int32Array(this.maxEdges);
    this.edgeAction = new Int8Array(this.maxEdges);
    this.edgeNextOut = new Int32Array(this.maxEdges); this.edgeNextOut.fill(-1);
    this.edgeNextIn = new Int32Array(this.maxEdges); this.edgeNextIn.fill(-1);
    this.edgeLive = new Uint8Array(this.maxEdges);
    this.edgeCount = 0;

    const staged = this.shared.workCapacity * 7;
    this.stageAttempt = new Int32Array(this.shared.workCapacity); this.stageAttempt.fill(-1);
    this.stageCount = new Uint8Array(this.shared.workCapacity);
    this.stageChildSlot = new Int32Array(staged);
    this.stageChildGeneration = new Int32Array(staged);
    this.stageAction = new Uint8Array(staged);
    this.stageClass = new Uint8Array(staged);
    this.executionWorkCount = 0;

    this.rootQ = -1;
    this.rootOrientation = 0;
    this.answerValue = null;
    this.answerMove = undefined;
    this.startedAt = performance.now();
    this.lastProgressAt = this.startedAt;
    this.completed = false;

    this.metrics = {
      canonicalQ:0,
      decisionExpansions:0,
      passthroughExpansions:0,
      edges:0,
      publications:0,
      childOccurrences:0,
      exactPublications:0,
      retiredPublications:0,
      stalePublications:0,
      staleAttempts:0,
      duplicateReadyCollapsed:0,
      duplicateRunningRetired:0,
      exactDuplicateCompletions:0,
      workerDeathRequeues:0,
      demandResurrectionRequeues:0,
      rematerializedExecutions:0,
      executionAdmissions:0,
      maxExecutionWork:0,
      priorityAdmissionPreemptions:0,
      priorityUpdates:0,
      slotReclaims:0,
      qReuses:0,
      reconcileBatches:0,
      reconcileRecords:0,
      reconcileMs:0,
      maxAllocatedWork:0,
      maxCanonicalQ:0,
      maxEdges:0,
      failures:0,
    };
  }

  replaySlot(slot, trim = 0) {
    const fullLength = Atomics.load(this.shared.workPathLength, slot);
    const length = fullLength - trim;
    if (length < this.rootPly || fullLength < 0 || fullLength > MAX_MOVES) {
      throw new Error('invalid published pull replay length: slot=' + slot +
        ' full=' + fullLength + ' trim=' + trim + ' root=' + this.rootPly +
        ' state=' + Atomics.load(this.shared.workState, slot) +
        ' generation=' + Atomics.load(this.shared.workGeneration, slot));
    }
    const base = slot * MAX_MOVES;
    for (let ply = 0; ply < this.rootPly; ply++) {
      if (this.shared.workPath[base + ply] !== this.rootMoves[ply]) {
        throw new Error('published pull replay escaped the external root');
      }
    }

    let common = Math.min(this.state.ply, length);
    let prefix = 0;
    while (prefix < common &&
      (this.state.moveCells[prefix] % 7) === this.shared.workPath[base + prefix]) prefix++;
    common = prefix;
    if (common < this.rootPly) throw new Error('reconciler replay lost external-root prefix');

    while (this.state.ply > common) {
      this.state.undo();
      this.metrics.replayUndos++;
    }
    for (let ply = common; ply < length; ply++) {
      const column = this.shared.workPath[base + ply];
      if (!this.state.canPlay(column)) throw new Error('published pull replay is not legal');
      this.state.applyUnchecked(column);
      this.metrics.replayApplies++;
    }
    this.state.gameplayKey(this.key);
    const q = this.internCurrentState();
    this.lastOrientation = this.state.gameplayOrientation();
    return q;
  }

  replayOccurrence(slot, trim = 0) {
    if (slot < 0 || slot >= this.shared.occurrenceCapacity ||
        Atomics.load(this.shared.occurrenceState, slot) !== 1) {
      throw new Error('invalid published occurrence replay slot');
    }
    const fullLength = Atomics.load(this.shared.occurrencePathLength, slot);
    const length = fullLength - trim;
    if (length < this.rootPly || fullLength < 0 || fullLength > MAX_MOVES) {
      throw new Error('invalid published occurrence replay length');
    }
    const base = slot * MAX_MOVES;
    for (let ply = 0; ply < this.rootPly; ply++) {
      if (this.shared.occurrencePath[base + ply] !== this.rootMoves[ply]) {
        throw new Error('published occurrence replay escaped the external root');
      }
    }
    let common = Math.min(this.state.ply, length);
    let prefix = 0;
    while (prefix < common &&
      (this.state.moveCells[prefix] % 7) === this.shared.occurrencePath[base + prefix]) prefix++;
    common = prefix;
    if (common < this.rootPly) throw new Error('occurrence replay lost external-root prefix');
    while (this.state.ply > common) {
      this.state.undo();
      this.metrics.replayUndos++;
    }
    for (let ply = common; ply < length; ply++) {
      const column = this.shared.occurrencePath[base + ply];
      if (!this.state.canPlay(column)) throw new Error('published occurrence replay is not legal');
      this.state.applyUnchecked(column);
      this.metrics.replayApplies++;
    }
    this.state.gameplayKey(this.key);
    const q = this.internCurrentState();
    this.lastOrientation = this.state.gameplayOrientation();
    return q;
  }

  internCurrentState() {
    const p0 = this.key[0];
    const p1 = this.key[1];
    const support = this.key[2] >>> 0;
    const hash = hashQ(p0, p1, support);
    let slot = hash & this.qHashMask;
    while (true) {
      const q = this.qHashSlots[slot];
      if (q === -1) break;
      if (this.qHash[q] === hash &&
          this.qP0[q] === p0 &&
          this.qP1[q] === p1 &&
          this.qSupport[q] === support) {
        this.metrics.qReuses++;
        return q;
      }
      slot = (slot + 1) & this.qHashMask;
    }
    if (this.qCount >= this.maxQ) throw new Error('ISOMAX_PULL_Q_CAPACITY');
    const q = this.qCount++;
    this.qHashSlots[slot] = q;
    this.qHash[q] = hash;
    this.qP0[q] = p0;
    this.qP1[q] = p1;
    this.qSupport[q] = support;
    this.qSide[q] = this.state.sideToMove;
    this.qTerminal[q] = this.state.isTerminal() ? 1 : 0;
    this.qReplayLength[q] = this.state.ply;
    const replayBase = q * MAX_MOVES;
    for (let ply = 0; ply < this.state.ply; ply++) {
      this.qReplay[replayBase + ply] = this.state.moveCells[ply] % 7;
    }
    this.metrics.canonicalQ = this.qCount;
    this.metrics.maxCanonicalQ = Math.max(this.metrics.maxCanonicalQ, this.qCount);
    return q;
  }

  appendEdge(parent, child, canonicalAction) {
    if (this.edgeCount >= this.maxEdges) throw new Error('ISOMAX_PULL_EDGE_CAPACITY');
    const edge = this.edgeCount++;
    this.edgeParent[edge] = parent;
    this.edgeChild[edge] = child;
    this.edgeAction[edge] = canonicalAction;
    this.edgeLive[edge] = 1;
    if (this.qOutgoingTail[parent] === -1) {
      this.qOutgoingHead[parent] = edge;
    } else {
      this.edgeNextOut[this.qOutgoingTail[parent]] = edge;
    }
    this.qOutgoingTail[parent] = edge;
    this.edgeNextIn[edge] = this.qIncomingHead[child];
    this.qIncomingHead[child] = edge;
    this.qParentCount[child]++;
    if (!this.qExact[child]) this.qUnresolved[parent]++;
    this.metrics.edges = this.edgeCount;
    this.metrics.maxEdges = Math.max(this.metrics.maxEdges, this.edgeCount);
    return edge;
  }

  clearStage(parentSlot) {
    const count = this.stageCount[parentSlot];
    const base = parentSlot * 7;
    for (let index = 0; index < count; index++) {
      releaseOccurrenceSlot(this.shared,
        this.stageChildSlot[base + index],
        this.stageChildGeneration[base + index]);
    }
    this.stageCount[parentSlot] = 0;
    this.stageAttempt[parentSlot] = -1;
  }

  releaseIfPossible(slot, generation) {
    if (slot < 0 || slot >= this.shared.workCapacity) return;
    if (Atomics.load(this.shared.workGeneration, slot) !== generation) return;
    if (Atomics.load(this.shared.workState, slot) !== WORK_DONE) return;
    if (releaseWorkSlot(this.shared, slot, generation)) this.metrics.slotReclaims++;
  }

  retireSlot(slot, generation, duplicate = true) {
    if (slot < 0 || slot >= this.shared.workCapacity) return false;
    if (Atomics.load(this.shared.workGeneration, slot) !== generation) return false;
    Atomics.store(this.shared.workNeeded, slot, 0);
    const state = Atomics.load(this.shared.workState, slot);
    if (state === WORK_RUNNING) {
      if (duplicate) this.metrics.duplicateRunningRetired++;
      return true;
    }
    if (state === WORK_FREE) return true;
    // A worker writes DONE before its terminal publication becomes visible.
    // Until EXACT/FRONTIER_END/RETIRED is reconciled, the slot still owns the
    // replay bytes referenced by that in-flight record and cannot be recycled.
    if (state === WORK_DONE) return true;
    if (state === WORK_READY && duplicate) this.metrics.duplicateReadyCollapsed++;
    Atomics.store(this.shared.workState, slot, WORK_DONE);
    this.releaseIfPossible(slot, generation);
    return true;
  }

  ensureExecution(q) {
    if (q < 0 || q >= this.qCount || this.qExact[q] || this.qForm[q] !== Q_UNEXPANDED) return false;
    if (q !== this.rootQ && this.qParentCount[q] === 0) return false;

    const existing = this.qWork[q];
    if (existing >= 0) {
      const generation = Atomics.load(this.shared.workGeneration, existing);
      const state = Atomics.load(this.shared.workState, existing);
      if (generation > 0 && state !== WORK_FREE &&
          Atomics.load(this.shared.workQ, existing) === q &&
          Atomics.load(this.shared.workNeeded, existing) !== 0) {
        this.ensureWorkPriority(q);
        return true;
      }
      this.qWork[q] = -1;
      if (this.executionWorkCount > 0) this.executionWorkCount--;
    }

    if (this.executionWorkCount >= this.executionLimit) return false;
    const slot = allocateWorkSlot(this.shared, this.allocateScratch);
    if (slot < 0) return false;
    const generation = this.allocateScratch[1];
    const length = this.qReplayLength[q];
    const sourceBase = q * MAX_MOVES;
    const targetBase = slot * MAX_MOVES;
    for (let ply = 0; ply < length; ply++) this.shared.workPath[targetBase + ply] = this.qReplay[sourceBase + ply];
    Atomics.store(this.shared.workPathLength, slot, length);
    Atomics.store(this.shared.workQ, slot, q);
    Atomics.store(this.shared.workAffinity, slot, this.qAffinity[q]);
    this.qWork[q] = slot;
    this.executionWorkCount++;
    this.metrics.rematerializedExecutions++;
    this.metrics.executionAdmissions++;
    this.metrics.maxExecutionWork = Math.max(this.metrics.maxExecutionWork, this.executionWorkCount);
    this.ensureWorkPriority(q);
    return Atomics.load(this.shared.workGeneration, slot) === generation;
  }

  evictLowerPriorityReady(minimumBand) {
    let victimSlot = -1;
    let victimQ = -1;
    let victimBand = minimumBand;
    const allocated = Math.min(this.shared.workCapacity, Atomics.load(this.shared.control, CTRL_WORK_NEXT));
    for (let slot = 0; slot < allocated; slot++) {
      if (Atomics.load(this.shared.workState, slot) !== WORK_READY ||
          Atomics.load(this.shared.workNeeded, slot) === 0) continue;
      const band = Atomics.load(this.shared.workPriority, slot);
      if (band >= minimumBand || band >= victimBand) continue;
      const q = Atomics.load(this.shared.workQ, slot);
      if (q < 0 || q === this.rootQ || this.qWork[q] !== slot) continue;
      victimSlot = slot;
      victimQ = q;
      victimBand = band;
    }
    if (victimSlot < 0) return false;
    const generation = Atomics.load(this.shared.workGeneration, victimSlot);
    this.qWork[victimQ] = -1;
    if (this.executionWorkCount > 0) this.executionWorkCount--;
    this.retireSlot(victimSlot, generation, false);
    this.metrics.priorityAdmissionPreemptions++;
    return true;
  }

  refillExecution() {
    let admitted = 0;
    for (let band = PRIORITY_BANDS - 1; band >= 0; band--) {
      for (let q = 0; q < this.qCount; q++) {
        if (this.qPriority[q] !== band || this.qExact[q] || this.qForm[q] !== Q_UNEXPANDED ||
            this.qWork[q] !== -1 || (q !== this.rootQ && this.qParentCount[q] === 0)) continue;
        if (this.executionWorkCount >= this.executionLimit && !this.evictLowerPriorityReady(band)) continue;
        if (this.ensureExecution(q)) admitted++;
      }
    }
    return admitted;
  }

  repairExecutableDemand() {
    for (let q = 0; q < this.qCount; q++) {
      if (this.qExact[q] || this.qForm[q] !== Q_UNEXPANDED) continue;
      if (q !== this.rootQ && this.qParentCount[q] === 0) continue;
      this.ensureWorkPriority(q);
    }
    return this.refillExecution();
  }

  desiredPriority(q) {
    if (q === this.rootQ) return 7;
    let band = this.qOrderHint[q] ? 5 : 4;
    if (this.qParentCount[q] >= 2) band = Math.max(band, 5);

    for (let incoming = this.qIncomingHead[q]; incoming !== -1; incoming = this.edgeNextIn[incoming]) {
      if (!this.edgeLive[incoming]) continue;
      const parent = this.edgeParent[incoming];
      if (this.qExact[parent]) continue;

      // A parent with one unresolved dependency is directly closure-critical.
      if (this.qUnresolved[parent] <= 1) band = Math.max(band, 7);
      else if (this.qUnresolved[parent] <= 2) band = Math.max(band, 6);

      // Preserve the parent's exact/advisory move order globally without
      // reserving ownership. Only its first live unresolved edge receives the
      // ordering boost; later siblings stay visible at lower priority and may
      // still execute on spare workers.
      let firstUnresolved = -1;
      for (let edge = this.qOutgoingHead[parent]; edge !== -1; edge = this.edgeNextOut[edge]) {
        if (!this.edgeLive[edge]) continue;
        const child = this.edgeChild[edge];
        if (this.qExact[child]) continue;
        firstUnresolved = edge;
        break;
      }
      if (firstUnresolved === incoming) {
        band = Math.max(band, parent === this.rootQ ? 7 : 6);
      }
    }
    return band;
  }

  ensureWorkPriority(q) {
    const band = this.desiredPriority(q);
    this.qPriority[q] = band;
    const slot = this.qWork[q];
    if (slot < 0) return;
    const generation = Atomics.load(this.shared.workGeneration, slot);
    if (generation <= 0 || Atomics.load(this.shared.workQ, slot) !== q) return;
    const state = Atomics.load(this.shared.workState, slot);

    if (state === WORK_WRITING) {
      Atomics.store(this.shared.workPriority, slot, band);
      if (Atomics.compareExchange(this.shared.workState, slot, WORK_WRITING, WORK_READY) === WORK_WRITING) {
        if (!enqueueReady(this.shared, slot, generation, band)) {
          throw new Error('ISOMAX_PULL_PRIORITY_QUEUE_CAPACITY');
        }
        this.metrics.priorityUpdates++;
      }
      return;
    }

    if (state === WORK_READY) {
      const previousBand = Atomics.load(this.shared.workPriority, slot);
      if (previousBand === band) return;
      Atomics.store(this.shared.workPriority, slot, band);
      // Priority changes use a new ticket; the old record becomes stale by
      // ticket/band comparison. Do not emit duplicate tickets for unchanged
      // topology.
      if (!enqueueReady(this.shared, slot, generation, band)) {
        throw new Error('ISOMAX_PULL_PRIORITY_QUEUE_CAPACITY');
      }
      this.metrics.priorityUpdates++;
    }
  }

  detachQWork(q, keepSlot = -1) {
    const slot = this.qWork[q];
    if (slot < 0) return;
    if (slot !== keepSlot) {
      const generation = Atomics.load(this.shared.workGeneration, slot);
      this.retireSlot(slot, generation);
    }
    this.qWork[q] = -1;
    if (this.executionWorkCount > 0) this.executionWorkCount--;
  }

  dropOutgoing(q) {
    for (let edge = this.qOutgoingHead[q]; edge !== -1; edge = this.edgeNextOut[edge]) {
      if (!this.edgeLive[edge]) continue;
      this.edgeLive[edge] = 0;
      const child = this.edgeChild[edge];
      if (this.qParentCount[child] > 0) this.qParentCount[child]--;
      if (this.qParentCount[child] === 0 && child !== this.rootQ && !this.qExact[child]) {
        this.detachQWork(child);
        this.dropOutgoing(child);
      } else {
        this.ensureWorkPriority(child);
      }
    }
    this.qUnresolved[q] = 0;
  }

  completeQ(q, value, publishingSlot = -1) {
    if (value !== -1 && value !== 0 && value !== 1) throw new Error('invalid pull exact WDL');
    if (this.qExact[q]) {
      if (this.qValue[q] !== value) throw new Error('conflicting pull exact WDL');
      this.metrics.exactDuplicateCompletions++;
      return;
    }
    this.qExact[q] = 1;
    this.qValue[q] = value;
    this.detachQWork(q, publishingSlot);

    if (q !== this.rootQ) this.dropOutgoing(q);

    for (let edge = this.qIncomingHead[q]; edge !== -1; edge = this.edgeNextIn[edge]) {
      if (!this.edgeLive[edge]) continue;
      const parent = this.edgeParent[edge];
      if (this.qUnresolved[parent] > 0) this.qUnresolved[parent]--;
      this.tryReduce(parent);
      if (!this.qExact[parent]) {
        for (let childEdge = this.qOutgoingHead[parent]; childEdge !== -1; childEdge = this.edgeNextOut[childEdge]) {
          if (!this.edgeLive[childEdge]) continue;
          const child = this.edgeChild[childEdge];
          if (!this.qExact[child]) this.ensureWorkPriority(child);
        }
      }
    }
    if (q === this.rootQ) this.updateRootAnswer();
  }

  tryReduce(q) {
    if (this.qExact[q]) return;
    const form = this.qForm[q];
    if (form === Q_UNEXPANDED) return;
    if (form === Q_PASSTHROUGH) {
      const edge = this.qOutgoingHead[q];
      if (edge !== -1 && this.edgeLive[edge] && this.qExact[this.edgeChild[edge]]) {
        this.completeQ(q, this.qValue[this.edgeChild[edge]]);
      }
      return;
    }

    const target = this.qSide[q] === 0 ? 1 : -1;
    let best = this.qSide[q] === 0 ? -1 : 1;
    let saw = false;
    let unresolved = 0;
    for (let edge = this.qOutgoingHead[q]; edge !== -1; edge = this.edgeNextOut[edge]) {
      if (!this.edgeLive[edge]) continue;
      saw = true;
      const child = this.edgeChild[edge];
      if (!this.qExact[child]) {
        unresolved++;
        continue;
      }
      const value = this.qValue[child];
      if (value === target) {
        this.completeQ(q, target);
        return;
      }
      if (this.qSide[q] === 0) best = Math.max(best, value);
      else best = Math.min(best, value);
    }
    this.qUnresolved[q] = unresolved;
    if (saw && unresolved === 0) this.completeQ(q, best);
  }

  stageChild(parentSlot, generation, attempt, childSlot, childGeneration, action, orderClass) {
    if (parentSlot < 0 || parentSlot >= this.shared.workCapacity ||
        childSlot < 0 || childSlot >= this.shared.occurrenceCapacity) {
      throw new Error('invalid pull child occurrence publication slot');
    }
    if (Atomics.load(this.shared.occurrenceGeneration, childSlot) !== childGeneration ||
        Atomics.load(this.shared.occurrenceState, childSlot) !== 1) {
      this.metrics.stalePublications++;
      return;
    }
    if (Atomics.load(this.shared.workGeneration, parentSlot) !== generation ||
        Atomics.load(this.shared.workAttempt, parentSlot) !== attempt) {
      this.metrics.staleAttempts++;
      releaseOccurrenceSlot(this.shared, childSlot, childGeneration);
      return;
    }
    let stagedAttempt = this.stageAttempt[parentSlot];
    if (stagedAttempt !== -1 && stagedAttempt !== attempt) {
      this.clearStage(parentSlot);
      stagedAttempt = -1;
    }
    if (stagedAttempt === -1) this.stageAttempt[parentSlot] = attempt;
    const count = this.stageCount[parentSlot];
    if (count >= 7) throw new Error('pull frontier published too many children');
    const base = parentSlot * 7 + count;
    this.stageChildSlot[base] = childSlot;
    this.stageChildGeneration[base] = childGeneration;
    this.stageAction[base] = action;
    this.stageClass[base] = orderClass;
    this.stageCount[parentSlot] = count + 1;
    this.metrics.childOccurrences++;
  }

  commitFrontier(parentSlot, generation, attempt, expectedCount, firstDeterministic, affinityWorker) {
    if (parentSlot < 0 || parentSlot >= this.shared.workCapacity ||
        Atomics.load(this.shared.workGeneration, parentSlot) !== generation ||
        Atomics.load(this.shared.workAttempt, parentSlot) !== attempt ||
        this.stageAttempt[parentSlot] !== attempt) {
      this.metrics.staleAttempts++;
      return;
    }
    const count = this.stageCount[parentSlot];
    if (count !== expectedCount || count < 2) throw new Error('incomplete pull frontier publication');

    const parentQ = this.replaySlot(parentSlot, 0);
    const parentOrientation = this.lastOrientation;
    const base = parentSlot * 7;
    const firstSlot = this.stageChildSlot[base];
    const endpointQ = this.replayOccurrence(firstSlot, 1);
    const endpointOrientation = this.lastOrientation;

    this.detachQWork(parentQ, parentSlot);

    if (parentQ !== endpointQ) {
      if (this.qForm[parentQ] === Q_UNEXPANDED) {
        this.qForm[parentQ] = Q_PASSTHROUGH;
        const action = firstDeterministic < 0 ? -1
          : parentOrientation ? 6 - firstDeterministic : firstDeterministic;
        if (action >= 0) this.qDirectMove[parentQ] = action;
        this.appendEdge(parentQ, endpointQ, action);
        this.metrics.passthroughExpansions++;
      } else if (this.qForm[parentQ] !== Q_PASSTHROUGH) {
        throw new Error('canonical pull q changed expansion form');
      }
    }

    const targetQ = endpointQ;
    if (this.qExact[targetQ] || this.qForm[targetQ] !== Q_UNEXPANDED) {
      this.clearStage(parentSlot);
      Atomics.store(this.shared.workState, parentSlot, WORK_DONE);
      this.releaseIfPossible(parentSlot, generation);
      this.tryReduce(parentQ);
      this.refillExecution();
      return;
    }

    this.detachQWork(targetQ, parentSlot);
    this.qForm[targetQ] = Q_DECISION;
    this.qUnresolved[targetQ] = 0;
    this.metrics.decisionExpansions++;

    for (let index = 0; index < count; index++) {
      const childSlot = this.stageChildSlot[base + index];
      const physicalAction = this.stageAction[base + index];
      const canonicalAction = endpointOrientation ? 6 - physicalAction : physicalAction;
      const childQ = this.replayOccurrence(childSlot, 0);
      this.appendEdge(targetQ, childQ, canonicalAction);
      if (this.stageClass[base + index] > this.qOrderHint[childQ]) {
        this.qOrderHint[childQ] = this.stageClass[base + index];
      }
      this.qAffinity[childQ] = affinityWorker;
    }

    this.clearStage(parentSlot);
    Atomics.store(this.shared.workState, parentSlot, WORK_DONE);
    this.releaseIfPossible(parentSlot, generation);

    for (let edge = this.qOutgoingHead[targetQ]; edge !== -1; edge = this.edgeNextOut[edge]) {
      if (this.edgeLive[edge]) this.ensureWorkPriority(this.edgeChild[edge]);
    }
    this.tryReduce(targetQ);
    this.tryReduce(parentQ);
    this.refillExecution();
  }

  acceptExact(slot, generation, attempt, value, directMove) {
    if (slot < 0 || slot >= this.shared.workCapacity ||
        Atomics.load(this.shared.workGeneration, slot) !== generation ||
        Atomics.load(this.shared.workAttempt, slot) !== attempt) {
      this.metrics.staleAttempts++;
      return;
    }
    const q = this.replaySlot(slot, 0);
    const orientation = this.lastOrientation;
    if (directMove >= 0) this.qDirectMove[q] = orientation ? 6 - directMove : directMove;
    this.completeQ(q, value, slot);
    Atomics.store(this.shared.workState, slot, WORK_DONE);
    this.releaseIfPossible(slot, generation);
    this.metrics.exactPublications++;
    this.refillExecution();
  }

  acceptRetired(slot, generation, attempt) {
    if (slot < 0 || slot >= this.shared.workCapacity ||
        Atomics.load(this.shared.workGeneration, slot) !== generation ||
        Atomics.load(this.shared.workAttempt, slot) !== attempt) {
      this.metrics.staleAttempts++;
      return;
    }
    if (this.stageAttempt[slot] === attempt) this.clearStage(slot);
    const q = Atomics.load(this.shared.workQ, slot);
    this.metrics.retiredPublications++;

    // Demand can disappear while RUNNING and reappear through a newly
    // reconciled occurrence before the retirement publication arrives. The
    // portable replay is still exact and owned by this slot, so resurrect the
    // execution reservation instead of failing or inventing semantic state.
    if (q >= 0 && this.qWork[q] === slot &&
        !this.qExact[q] && this.qForm[q] === Q_UNEXPANDED &&
        this.qParentCount[q] > 0 &&
        Atomics.load(this.shared.control, CTRL_SESSION) === SESSION_RUNNING) {
      Atomics.store(this.shared.workNeeded, slot, 1);
      Atomics.store(this.shared.workWorker, slot, -1);
      Atomics.store(this.shared.workState, slot, WORK_READY);
      const band = this.desiredPriority(q);
      this.qPriority[q] = band;
      Atomics.store(this.shared.workPriority, slot, band);
      if (!enqueueReady(this.shared, slot, generation, band)) {
        throw new Error('ISOMAX_PULL_PRIORITY_QUEUE_CAPACITY');
      }
      this.metrics.demandResurrectionRequeues++;
      return;
    }

    if (q >= 0 && this.qWork[q] === slot) {
      this.qWork[q] = -1;
      if (this.executionWorkCount > 0) this.executionWorkCount--;
    }
    Atomics.store(this.shared.workState, slot, WORK_DONE);
    this.releaseIfPossible(slot, generation);
    this.refillExecution();
  }

  handlePublication() {
    const kind = this.publication[0];
    const a = this.publication[1];
    const b = this.publication[2];
    const c = this.publication[3];
    const d = this.publication[4];
    const e = this.publication[5];
    const f = this.publication[6];
    const g = this.publication[7];
    this.metrics.publications++;
    this.metrics.reconcileRecords++;

    if (kind === PUB_CHILD) {
      this.stageChild(a, b, c, d, e, f, g);
    } else if (kind === PUB_FRONTIER_END) {
      this.commitFrontier(a, b, c, d, e, g);
    } else if (kind === PUB_EXACT) {
      this.acceptExact(a, b, c, d, e);
    } else if (kind === PUB_RETIRED) {
      this.acceptRetired(a, b, c);
    } else if (kind === PUB_FAILURE) {
      this.metrics.failures++;
      throw new Error('IsoMax pull evaluator reported failure');
    } else {
      throw new Error('unknown IsoMax pull publication kind: ' + kind);
    }
  }

  updateRootAnswer() {
    if (this.rootQ < 0 || !this.qExact[this.rootQ]) return;
    const value = this.qValue[this.rootQ];
    if (!this.selectMove) {
      this.answerValue = value;
      this.answerMove = null;
      return;
    }
    if (this.qTerminal[this.rootQ]) {
      this.answerValue = value;
      this.answerMove = null;
      return;
    }
    if (this.qDirectMove[this.rootQ] >= 0) {
      const canonical = this.qDirectMove[this.rootQ];
      this.answerValue = value;
      this.answerMove = this.rootOrientation ? 6 - canonical : canonical;
      return;
    }
    if (this.qForm[this.rootQ] !== Q_DECISION) return;

    for (let edge = this.qOutgoingHead[this.rootQ]; edge !== -1; edge = this.edgeNextOut[edge]) {
      if (!this.edgeLive[edge]) continue;
      const child = this.edgeChild[edge];
      if (!this.qExact[child]) return;
      if (this.qValue[child] === value) {
        const canonical = this.edgeAction[edge];
        this.answerValue = value;
        this.answerMove = this.rootOrientation ? 6 - canonical : canonical;
        return;
      }
    }
    throw new Error('exact pull root lacks a preserving action');
  }

  retireRootUnneeded() {
    if (this.rootQ < 0 || this.answerValue === null) return;
    const rootValue = this.answerValue;
    let preservingSeen = false;
    for (let edge = this.qOutgoingHead[this.rootQ]; edge !== -1; edge = this.edgeNextOut[edge]) {
      if (!this.edgeLive[edge]) continue;
      const child = this.edgeChild[edge];
      if (!preservingSeen && this.qExact[child] && this.qValue[child] === rootValue) {
        preservingSeen = true;
        continue;
      }
      if (preservingSeen) {
        this.edgeLive[edge] = 0;
        if (this.qParentCount[child] > 0) this.qParentCount[child]--;
        if (this.qParentCount[child] === 0 && !this.qExact[child]) {
          this.detachQWork(child);
          this.dropOutgoing(child);
        }
      }
    }
  }

  processWorkerDeaths() {
    const alive = this.shared.workerAlive;
    let liveCount = 0;
    for (let worker = 0; worker < alive.length; worker++) {
      const now = Atomics.load(alive, worker);
      if (now) {
        liveCount++;
        continue;
      }
      if (!this.seenAlive[worker]) continue;
      this.seenAlive[worker] = 0;
      const allocated = Math.min(this.shared.workCapacity, Atomics.load(this.shared.control, CTRL_WORK_NEXT));
      for (let slot = 0; slot < allocated; slot++) {
        const state = Atomics.load(this.shared.workState, slot);

        // RUNNING and pre-publication DONE both belong to the dead attempt.
        // Incrementing the attempt makes every late record stale; replay from
        // the same portable slot is then safe if the canonical q is still live.
        if ((state !== WORK_RUNNING && state !== WORK_DONE) ||
            Atomics.load(this.shared.workWorker, slot) !== worker) continue;
        const generation = Atomics.load(this.shared.workGeneration, slot);
        const attempt = Atomics.load(this.shared.workAttempt, slot);
        Atomics.add(this.shared.workAttempt, slot, 1);
        if (this.stageAttempt[slot] === attempt) this.clearStage(slot);
        Atomics.store(this.shared.workWorker, slot, -1);
        if (Atomics.load(this.shared.workNeeded, slot) &&
            Atomics.load(this.shared.control, CTRL_SESSION) === SESSION_RUNNING) {
          Atomics.store(this.shared.workState, slot, WORK_READY);
          const band = Atomics.load(this.shared.workPriority, slot);
          if (!enqueueReady(this.shared, slot, generation, band)) {
            throw new Error('ISOMAX_PULL_PRIORITY_QUEUE_CAPACITY');
          }
          this.metrics.workerDeathRequeues++;
        } else {
          Atomics.store(this.shared.workState, slot, WORK_DONE);
          this.releaseIfPossible(slot, generation);
        }
      }

      const occurrenceAllocated = Math.min(this.shared.occurrenceCapacity,
        Atomics.load(this.shared.control, CTRL_OCC_NEXT));
      for (let slot = 0; slot < occurrenceAllocated; slot++) {
        if (Atomics.load(this.shared.occurrenceState, slot) !== 1 ||
            Atomics.load(this.shared.occurrencePublisher, slot) !== worker) continue;
        releaseOccurrenceSlot(this.shared, slot, Atomics.load(this.shared.occurrenceGeneration, slot));
      }
    }
    this.refillExecution();
    if (liveCount === 0 && !this.completed) throw new Error('all IsoMax pull evaluators exited');
  }

  hasExecutableWork() {
    const allocated = Math.min(this.shared.workCapacity, Atomics.load(this.shared.control, CTRL_WORK_NEXT));
    for (let slot = 0; slot < allocated; slot++) {
      const state = Atomics.load(this.shared.workState, slot);
      if ((state === WORK_READY || state === WORK_RUNNING || state === WORK_WRITING) &&
          Atomics.load(this.shared.workNeeded, slot)) return true;
      // Worker terminal publication is ordered after its DONE state store.
      // While the owning evaluator is still live, this slot represents an
      // in-flight EXACT/FRONTIER_END/RETIRED record rather than deadlock.
      if (state === WORK_DONE &&
          Atomics.load(this.shared.workNeeded, slot) &&
          Atomics.load(this.shared.workWorker, slot) >= 0) return true;
    }
    return false;
  }

  snapshot() {
    return {
      elapsedMs:performance.now() - this.startedAt,
      rootWdl:this.answerValue,
      rootMove:this.answerMove ?? null,
      metrics:{...this.metrics},
      workAllocated:Math.min(this.shared.workCapacity, Atomics.load(this.shared.control, CTRL_WORK_NEXT)),
      qCount:this.qCount,
      edgeCount:this.edgeCount,
    };
  }

  initializeRoot() {
    const root = this.internRoot();
    this.rootQ = root;
    this.rootOrientation = this.state.gameplayOrientation();
    this.qPriority[root] = PRIORITY_BANDS - 1;
    if (!this.ensureExecution(root)) throw new Error('ISOMAX_PULL_WORK_CAPACITY');
  }

  internRoot() {
    this.state.gameplayKey(this.key);
    return this.internCurrentState();
  }

  run() {
    Atomics.store(this.shared.control, CTRL_SESSION, SESSION_RUNNING);
    this.initializeRoot();
    parentPort.postMessage({ type:'pull-reconciler-ready' });

    try {
      while (Atomics.load(this.shared.control, CTRL_SESSION) === SESSION_RUNNING &&
             !Atomics.load(this.shared.control, CTRL_ABORT)) {
        const batchStart = performance.now();
        let records = 0;
        while (records < 4096 && dequeuePublication(this.shared, this.publication)) {
          this.handlePublication();
          records++;
          if (this.answerValue !== null && this.answerMove !== undefined) break;
        }
        if (records > 0) {
          this.metrics.reconcileBatches++;
          this.metrics.reconcileMs += performance.now() - batchStart;
        }
        this.processWorkerDeaths();
        this.refillExecution();
        this.updateRootAnswer();
        this.metrics.maxAllocatedWork = Math.max(this.metrics.maxAllocatedWork,
          Math.min(this.shared.workCapacity, Atomics.load(this.shared.control, CTRL_WORK_NEXT)));

        if (this.answerValue !== null && this.answerMove !== undefined) {
          this.completed = true;
          this.retireRootUnneeded();
          break;
        }

        const now = performance.now();
        if (now - this.lastProgressAt >= this.progressIntervalMs) {
          parentPort.postMessage({ type:'pull-progress', snapshot:this.snapshot() });
          this.lastProgressAt = now;
        }

        if (records === 0) {
          if (!this.hasExecutableWork() &&
              Atomics.load(this.shared.publicationDequeue, 0) >= Atomics.load(this.shared.publicationEnqueue, 0)) {
            if (this.repairExecutableDemand() === 0 || !this.hasExecutableWork()) {
              throw new Error('unresolved IsoMax pull root has no executable work');
            }
          }
          const epoch = Atomics.load(this.shared.control, CTRL_PUB_WAKE);
          if (!dequeuePublication(this.shared, this.publication)) {
            Atomics.wait(this.shared.control, CTRL_PUB_WAKE, epoch, 10);
          } else {
            this.handlePublication();
          }
        }
      }

      if (Atomics.load(this.shared.control, CTRL_ABORT) && !this.completed) {
        throw new Error('ISOMAX_PULL_ABORTED');
      }
      if (!this.completed) throw new Error('IsoMax pull session stopped without exact root');

      for (let slot = 0; slot < Math.min(this.shared.workCapacity, Atomics.load(this.shared.control, CTRL_WORK_NEXT)); slot++) {
        if (Atomics.load(this.shared.workState, slot) === WORK_RUNNING ||
            Atomics.load(this.shared.workState, slot) === WORK_READY ||
            Atomics.load(this.shared.workState, slot) === WORK_WRITING) {
          Atomics.store(this.shared.workNeeded, slot, 0);
        }
      }
      stopSharedPool(this.shared);

      const final = this.snapshot();
      parentPort.postMessage({ type:'pull-result', value:this.answerValue, move:this.answerMove, snapshot:final });
    } catch (error) {
      this.metrics.failures++;
      Atomics.store(this.shared.control, CTRL_FAILURE, 1);
      Atomics.store(this.shared.control, CTRL_ABORT, 1);
      stopSharedPool(this.shared);
      parentPort.postMessage({ type:'pull-reconciler-error', message:error?.message ?? String(error), snapshot:this.snapshot() });
    } finally {
      this.pool.releaseSearchStorage();
    }
  }
}

parentPort.on('message', (message) => {
  if (message?.type !== 'isomax-pull-reconcile') {
    parentPort.postMessage({ type:'pull-reconciler-error', message:'unsupported pull reconciler message' });
    return;
  }
  try {
    new PullReconciler(message).run();
  } catch (error) {
    parentPort.postMessage({ type:'pull-reconciler-error', message:error?.message ?? String(error) });
  }
});


parentPort.postMessage({ type:'pull-reconciler-idle' });
