import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`parent-necessity prototype patch missing ${label}`);
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`parent-necessity prototype patch ambiguous ${label}`);
  }
  return source.slice(0, first) + after + source.slice(first + before.length);
}

function patchFile(root, relative, patches) {
  const file = path.join(root, relative);
  let source = readFileSync(file, 'utf8');
  for (const [before, after, label] of patches) source = replaceOnce(source, before, after, label);
  writeFileSync(file, source);
}

export function applyParentNecessityPrototype(root) {
  patchFile(root, 'components/isometric/execution/manager-worker.mjs', [
    [
`const MC_EXPOSURE_GRANTS = 14;\nconst MC_EXPOSURES_COMPLETED = 15;\nconst MC_WORDS = 16;\n`,
`const MC_EXPOSURE_GRANTS = 14;\nconst MC_EXPOSURES_COMPLETED = 15;\nconst MC_NECESSITY_ADMISSIONS = 16;\nconst MC_NECESSITY_DEFERRALS = 17;\nconst MC_WORDS = 18;\n`,
      'necessity metric words',
    ],
    [
`    this.candidateHead = new Int32Array(8); this.candidateHead.fill(-1);\n    this.candidateTail = new Int32Array(8); this.candidateTail.fill(-1);\n    this.readyTarget = Math.max(workerCount, workerCount * 4);\n`,
`    this.candidateHead = new Int32Array(8); this.candidateHead.fill(-1);\n    this.candidateTail = new Int32Array(8); this.candidateTail.fill(-1);\n\n    // Research-only scheduling metadata. Canonical q topology and qExecution\n    // remain the sole semantic/work authority; these fixed-width arrays only\n    // remember which surplus child of an unresolved parent is currently\n    // eligible to enter manager READY candidacy.\n    this.needGeneration = new Int32Array(tt.qCapacity);\n    this.needRetainedAction = new Int8Array(tt.qCapacity); this.needRetainedAction.fill(-1);\n    this.needActiveSurplus = new Int8Array(tt.qCapacity); this.needActiveSurplus.fill(-1);\n    this.readyTarget = Math.max(workerCount, workerCount * 4);\n`,
      'necessity fixed-width metadata',
    ],
    [
`  wakeWorkers() {\n    Atomics.add(tt.control, CTRL_WORKER_WAKE, 1);\n    Atomics.notify(tt.control, CTRL_WORKER_WAKE, Infinity);\n  }\n`,
`  wakeWorkers() {\n    Atomics.add(tt.control, CTRL_WORKER_WAKE, 1);\n    Atomics.notify(tt.control, CTRL_WORKER_WAKE, Infinity);\n  }\n\n  initParentNeed(parentQ, parentGeneration, retainedAction) {\n    if (this.needGeneration[parentQ] !== parentGeneration) {\n      this.needGeneration[parentQ] = parentGeneration;\n      this.needActiveSurplus[parentQ] = -1;\n    }\n    this.needRetainedAction[parentQ] = retainedAction;\n  }\n\n  clearParentNeed(parentQ, parentGeneration) {\n    if (this.needGeneration[parentQ] !== parentGeneration) return;\n    this.needGeneration[parentQ] = 0;\n    this.needRetainedAction[parentQ] = -1;\n    this.needActiveSurplus[parentQ] = -1;\n  }\n\n  queueNextNecessarySurplus(parentQ, parentGeneration) {\n    if (!qIsCurrent(tt, parentQ, parentGeneration)\n        || readExactQ(tt, parentQ, parentGeneration) !== Q_EXACT_UNKNOWN\n        || this.needGeneration[parentQ] !== parentGeneration) return false;\n\n    const mask = Atomics.load(tt.qChildMask, parentQ);\n    if (mask === 0) return false;\n    const base = parentQ * 7;\n    const retainedAction = this.needRetainedAction[parentQ];\n    const active = this.needActiveSurplus[parentQ];\n\n    // One unresolved surplus child per parent. Whether it is merely a manager\n    // candidate, READY, claimed, or running does not matter: admitting another\n    // sibling before this child becomes exact would recreate speculative breadth.\n    if (active >= 0 && (mask & (1 << active)) !== 0) {\n      const activeQ = tt.qChildIndex[base + active];\n      const activeGeneration = tt.qChildGeneration[base + active];\n      if (activeQ >= 0\n          && qIsCurrent(tt, activeQ, activeGeneration)\n          && readExactQ(tt, activeQ, activeGeneration) === Q_EXACT_UNKNOWN) {\n        this.bump(MC_NECESSITY_DEFERRALS);\n        return false;\n      }\n      this.needActiveSurplus[parentQ] = -1;\n    }\n\n    // Preserve the manager's existing deterministic global scheduling order:\n    // highest priority band first; equal-band children were previously appended\n    // by attachBranch's action=0..6 loop, so the lowest action wins a tie here.\n    let bestAction = -1;\n    let bestPriority = -1;\n    for (let action = 0; action < 7; action++) {\n      if ((mask & (1 << action)) === 0 || action === retainedAction) continue;\n      const childQ = tt.qChildIndex[base + action];\n      const childGeneration = tt.qChildGeneration[base + action];\n      if (childQ < 0 || !qIsCurrent(tt, childQ, childGeneration)) {\n        throw new Error('parent necessity found stale canonical child');\n      }\n      if (readExactQ(tt, childQ, childGeneration) !== Q_EXACT_UNKNOWN) continue;\n      const priority = Math.max(\n        Atomics.load(tt.qPriorityClass, childQ),\n        tt.qChildEval[base + action],\n      );\n      if (priority > bestPriority) {\n        bestPriority = priority;\n        bestAction = action;\n      }\n    }\n    if (bestAction < 0) return false;\n\n    const childQ = tt.qChildIndex[base + bestAction];\n    const childGeneration = tt.qChildGeneration[base + bestAction];\n    this.needActiveSurplus[parentQ] = bestAction;\n    if (this.queueIfNeeded(childQ, childGeneration, bestPriority)) {\n      this.bump(MC_NECESSITY_ADMISSIONS);\n      return true;\n    }\n\n    // An exact/race may have retired the selected child between inspection and\n    // candidacy insertion. Clear it and retry the bounded seven-child scan so\n    // exact evidence can unlock the next genuinely necessary surplus.\n    this.needActiveSurplus[parentQ] = -1;\n    if (readExactQ(tt, childQ, childGeneration) !== Q_EXACT_UNKNOWN) {\n      return this.queueNextNecessarySurplus(parentQ, parentGeneration);\n    }\n    return false;\n  }\n`,
      'parent necessity helpers',
    ],
    [
`    Atomics.store(tt.qChildMask, qIndex, 0);\n  }\n\n  drainOrphans() {\n`,
`    Atomics.store(tt.qChildMask, qIndex, 0);\n    this.clearParentNeed(qIndex, generation);\n  }\n\n  drainOrphans() {\n`,
      'clear necessity metadata with outgoing topology',
    ],
    [
`      Atomics.store(tt.qPriorityClass, childQ, priority);\n      Atomics.store(tt.qPriorityDepth, childQ, tt.qSupport[childQ] >>> 21);\n      if (action !== retainedAction) this.queueIfNeeded(childQ, childGeneration, priority);\n    }\n    Atomics.store(tt.qChildMask, parentQ, mask);\n    this.bump(MC_BRANCHES);\n    this.tryReduceParent(parentQ, parentGeneration);\n    this.tryReduceParent(startQ, startGeneration);\n`,
`      Atomics.store(tt.qPriorityClass, childQ, priority);\n      Atomics.store(tt.qPriorityDepth, childQ, tt.qSupport[childQ] >>> 21);\n    }\n    this.initParentNeed(parentQ, parentGeneration, retainedAction);\n    Atomics.store(tt.qChildMask, parentQ, mask);\n    this.bump(MC_BRANCHES);\n\n    // Reduce with all already-known exact evidence before spending any READY/D\n    // on surplus breadth. Only an unresolved parent may admit one next surplus.\n    this.tryReduceParent(parentQ, parentGeneration);\n    this.queueNextNecessarySurplus(parentQ, parentGeneration);\n    this.tryReduceParent(startQ, startGeneration);\n`,
      'replace all-sibling admission with parent necessity',
    ],
    [
`        const parentQ = tt.edgeParentQ[edge];\n        const parentGeneration = tt.edgeParentGeneration[edge];\n        this.tryReduceParent(parentQ, parentGeneration);\n        edge = tt.edgeNextIncoming[edge];\n`,
`        const parentQ = tt.edgeParentQ[edge];\n        const parentGeneration = tt.edgeParentGeneration[edge];\n        this.tryReduceParent(parentQ, parentGeneration);\n        this.queueNextNecessarySurplus(parentQ, parentGeneration);\n        edge = tt.edgeNextIncoming[edge];\n`,
      'unlock next surplus only after exact propagation',
    ],
    [
`      exposuresCompleted: this.metrics[MC_EXPOSURES_COMPLETED],\n      exposureOutstanding: delta.exposure,\n`,
`      exposuresCompleted: this.metrics[MC_EXPOSURES_COMPLETED],\n      necessityAdmissions: this.metrics[MC_NECESSITY_ADMISSIONS],\n      necessityDeferrals: this.metrics[MC_NECESSITY_DEFERRALS],\n      exposureOutstanding: delta.exposure,\n`,
      'report necessity counters',
    ],
  ]);
}
