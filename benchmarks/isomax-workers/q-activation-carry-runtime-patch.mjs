import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`q-carry prototype patch missing ${label}`);
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`q-carry prototype patch ambiguous ${label}`);
  }
  return source.slice(0, first) + after + source.slice(first + before.length);
}

function patchFile(root, relative, patches) {
  const file = path.join(root, relative);
  let source = readFileSync(file, 'utf8');
  for (const [before, after, label] of patches) source = replaceOnce(source, before, after, label);
  writeFileSync(file, source);
}

const Q_CARRY_DECL = `const Q_CARRY_FLAG = 1 << 30;\n`;

export function applyQActivationCarryPrototype(root) {
  patchFile(root, 'components/isometric/execution/manager-worker.mjs', [
    [
      'const MC_WORDS = 16;\n',
      `const MC_WORDS = 16;\n${Q_CARRY_DECL}`,
      'manager carry flag declaration',
    ],
    [
`  wakeWorkers() {\n    Atomics.add(tt.control, CTRL_WORKER_WAKE, 1);\n    Atomics.notify(tt.control, CTRL_WORKER_WAKE, Infinity);\n  }\n`,
`  wakeWorkers() {\n    Atomics.add(tt.control, CTRL_WORKER_WAKE, 1);\n    Atomics.notify(tt.control, CTRL_WORKER_WAKE, Infinity);\n  }\n\n  hasQueuedCarry(qIndex) {\n    return (Atomics.load(tt.qPriorityDepth, qIndex) & Q_CARRY_FLAG) !== 0;\n  }\n\n  reserveQueuedCarry(qIndex, generation) {\n    if (!qIsCurrent(tt, qIndex, generation) || this.delta.deficit <= 0) return false;\n    while (true) {\n      const depth = Atomics.load(tt.qPriorityDepth, qIndex);\n      if ((depth & Q_CARRY_FLAG) !== 0) return false;\n      if (Atomics.compareExchange(\n        tt.qPriorityDepth, qIndex, depth, depth | Q_CARRY_FLAG,\n      ) !== depth) continue;\n      this.delta.deficit--;\n      this.delta.exposure++;\n      this.bump(MC_EXPOSURE_GRANTS);\n      return true;\n    }\n  }\n\n  refundQueuedCarry(qIndex) {\n    while (true) {\n      const depth = Atomics.load(tt.qPriorityDepth, qIndex);\n      if ((depth & Q_CARRY_FLAG) === 0) return false;\n      if (Atomics.compareExchange(\n        tt.qPriorityDepth, qIndex, depth, depth & ~Q_CARRY_FLAG,\n      ) !== depth) continue;\n      this.delta.exposure--;\n      this.delta.deficit++;\n      return true;\n    }\n  }\n`,
      'manager carry helpers',
    ],
    [
`  admitReady(qIndex, generation, priority) {\n    if (!this.delta.beginReadyTransfer()) return false;\n    let committed = false;\n    try {\n      committed = enqueueQ(tt, qIndex, generation, priority);\n      if (committed) this.delta.commitReadyTransfer();\n      else this.delta.refundReadyTransfer();\n      return committed;\n    } catch (error) {\n      this.delta.refundReadyTransfer();\n      throw error;\n    }\n  }\n`,
`  admitReady(qIndex, generation, priority) {\n    if (!this.delta.beginReadyTransfer()) return false;\n    let committed = false;\n    let carryWasPresent = this.hasQueuedCarry(qIndex);\n    let carryReserved = false;\n    try {\n      if (!carryWasPresent) carryReserved = this.reserveQueuedCarry(qIndex, generation);\n      committed = enqueueQ(tt, qIndex, generation, priority);\n      if (committed) this.delta.commitReadyTransfer();\n      else {\n        if (carryReserved || carryWasPresent) this.refundQueuedCarry(qIndex);\n        this.delta.refundReadyTransfer();\n      }\n      return committed;\n    } catch (error) {\n      if (carryReserved || carryWasPresent) this.refundQueuedCarry(qIndex);\n      this.delta.refundReadyTransfer();\n      throw error;\n    }\n  }\n`,
      'READY admission carry reserve',
    ],
    [
`    for (let worker = 0; worker < workerCount && this.delta.deficit > 0; worker++) {\n      if (workerIsAvailable(tt, worker)) continue;\n      if (this.delta.grantExposure(worker)) {\n        this.bump(MC_EXPOSURE_GRANTS);\n        changed++;\n      }\n    }\n    return changed;\n`,
`    // R2 research prototype: spare-capacity exposure ownership is attached to\n    // queued q occurrences during READY admission instead of racing the claimed\n    // worker from this post-claim manager pass. Existing worker grants are still\n    // revoked here after an unused transferred carry reaches an idle boundary.\n    return changed;\n`,
      'disable post-claim worker grant loop',
    ],
    [
`      if (execution === EXEC_QUEUED) {\n        if (cancelQueuedQ(tt, qIndex, generation)) this.delta.retireReady();\n        execution = Atomics.load(tt.qExecution, qIndex);\n      }\n`,
`      if (execution === EXEC_QUEUED) {\n        if (cancelQueuedQ(tt, qIndex, generation)) {\n          this.delta.retireReady();\n          this.refundQueuedCarry(qIndex);\n        }\n        execution = Atomics.load(tt.qExecution, qIndex);\n      }\n`,
      'orphan queued carry refund',
    ],
    [
`      if (Atomics.load(tt.qRefCount, qIndex) === 0\n          && Atomics.load(tt.qParentHead, qIndex) === -1\n          && recycleQIfDead(tt, qIndex, generation)) {\n        this.bump(MC_RECYCLED_Q);\n      }\n`,
`      if (Atomics.load(tt.qRefCount, qIndex) === 0\n          && Atomics.load(tt.qParentHead, qIndex) === -1) {\n        this.refundQueuedCarry(qIndex);\n        if (recycleQIfDead(tt, qIndex, generation)) this.bump(MC_RECYCLED_Q);\n      }\n`,
      'orphan carry refund before recycle',
    ],
    [
`      Atomics.store(tt.qPriorityClass, childQ, priority);\n      Atomics.store(tt.qPriorityDepth, childQ, tt.qSupport[childQ] >>> 21);\n`,
`      Atomics.store(tt.qPriorityClass, childQ, priority);\n      const priorDepth = Atomics.load(tt.qPriorityDepth, childQ);\n      Atomics.store(\n        tt.qPriorityDepth, childQ,\n        (priorDepth & Q_CARRY_FLAG) | (tt.qSupport[childQ] >>> 21),\n      );\n`,
      'preserve carry in scheduling depth metadata',
    ],
    [
`    if (priorExecution === EXEC_QUEUED) this.delta.retireReady();\n    else if (executionIsRunning(priorExecution)) this.requestReset(executionWorker(priorExecution));\n`,
`    if (priorExecution === EXEC_QUEUED) {\n      this.delta.retireReady();\n      this.refundQueuedCarry(qIndex);\n    } else if (executionIsRunning(priorExecution)) this.requestReset(executionWorker(priorExecution));\n`,
      'exact queued carry refund',
    ],
  ]);

  patchFile(root, 'components/isometric/execution/worker.mjs', [
    [
`const sessionStopped = Symbol('IsoMax shared session stopped');\n`,
`const sessionStopped = Symbol('IsoMax shared session stopped');\n${Q_CARRY_DECL}`,
      'worker carry flag declaration',
    ],
    [
`      if (owner !== workerId) {\n        runtime.count(WC_DUPLICATE_REACHES);\n        runtime.publishEvent(EVENT_DUPLICATE, qIndex, generation, owner, 0);\n        throw yieldExecution;\n      }\n\n      runtime.executionQ = qIndex;\n`,
`      if (owner !== workerId) {\n        runtime.count(WC_DUPLICATE_REACHES);\n        runtime.publishEvent(EVENT_DUPLICATE, qIndex, generation, owner, 0);\n        throw yieldExecution;\n      }\n      if (!runtime.transferQueuedCarry(qIndex, generation)) throw yieldExecution;\n\n      runtime.executionQ = qIndex;\n`,
      'active claim carry transfer before solve',
    ],
    [
`  publishEvent(kind, qIndex, generation, value, aux) {\n`,
`  transferQueuedCarry(qIndex, generation) {\n    const shared = this.shared;\n    if (Atomics.load(shared.qGeneration, qIndex) !== generation) return false;\n    while (true) {\n      const depth = Atomics.load(shared.qPriorityDepth, qIndex);\n      if ((depth & Q_CARRY_FLAG) === 0) return true;\n      if (Atomics.load(shared.workerExposure, workerId) !== EXPOSURE_NONE) return false;\n      if (Atomics.compareExchange(\n        shared.qPriorityDepth, qIndex, depth, depth & ~Q_CARRY_FLAG,\n      ) !== depth) continue;\n      if (Atomics.compareExchange(\n        shared.workerExposure, workerId, EXPOSURE_NONE, EXPOSURE_GRANTED,\n      ) === EXPOSURE_NONE) return true;\n      Atomics.or(shared.qPriorityDepth, qIndex, Q_CARRY_FLAG);\n      return false;\n    }\n  }\n\n  publishEvent(kind, qIndex, generation, value, aux) {\n`,
      'worker carry transfer helper',
    ],
    [
`  runClaim(qIndex, generation, band) {\n    this.activeQ = qIndex;\n    this.activeGeneration = generation;\n    this.executionQ = qIndex;\n    this.executionGeneration = generation;\n    this.activeRunToken = Atomics.load(this.shared.workerReset, workerId);\n    this.resetMetrics();\n    const state = this.replayQ(qIndex, generation);\n`,
`  runClaim(qIndex, generation, band) {\n    this.activeQ = qIndex;\n    this.activeGeneration = generation;\n    this.executionQ = qIndex;\n    this.executionGeneration = generation;\n    this.activeRunToken = Atomics.load(this.shared.workerReset, workerId);\n    this.resetMetrics();\n    if (!this.transferQueuedCarry(qIndex, generation)) {\n      if (releaseRunningQ(this.shared, qIndex, generation, workerId)) {\n        this.count(WC_RELEASE_EVENTS);\n        this.publishEvent(EVENT_RELEASE, qIndex, generation, 0, 0);\n      }\n      this.executionQ = -1;\n      this.executionGeneration = 0;\n      this.activeQ = -1;\n      this.activeGeneration = 0;\n      this.activeOrientation = 0;\n      this.activeBasePly = 0;\n      return;\n    }\n    const state = this.replayQ(qIndex, generation);\n`,
      'scheduler claim carry transfer before replay/solve',
    ],
  ]);
}
