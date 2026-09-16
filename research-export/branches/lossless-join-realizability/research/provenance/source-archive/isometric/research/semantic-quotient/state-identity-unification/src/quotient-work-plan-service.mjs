import {
  buildQuotientLookaheadWorkDag,
  reduceQuotientLookaheadWorkDag,
} from './quotient-lookahead-work-dag.mjs';

export function createQuotientWorkPlanService(graph, options = {}) {
  if (!graph || typeof graph !== 'object') throw new TypeError('work plan service requires a graph');
  const maxActivePlans = options.maxActivePlans ?? 8;
  if (!Number.isInteger(maxActivePlans) || maxActivePlans < 1) {
    throw new RangeError('maxActivePlans must be a positive integer');
  }

  const plans = new Map();
  let nextPlanId = 1;
  let plansBuilt = 0;
  let plansReduced = 0;
  let plansReleased = 0;

  function assertPlanId(planId) {
    if (!Number.isSafeInteger(planId) || planId < 1) throw new RangeError(`invalid lookahead plan ID ${planId}`);
  }

  function build(splitDepth, probeDepth = 2) {
    if (plans.size >= maxActivePlans) {
      throw new Error(`active lookahead plan capacity ${maxActivePlans} exhausted; release a plan before building another`);
    }
    if (!Number.isSafeInteger(nextPlanId) || nextPlanId < 1) throw new Error('lookahead plan ID domain exhausted');
    const plan = buildQuotientLookaheadWorkDag(graph, splitDepth, { probeDepth });
    const planId = nextPlanId++;
    plans.set(planId, plan);
    plansBuilt += 1;
    return Object.freeze({ planId, plan });
  }

  function reduce(planId, frontierValues) {
    assertPlanId(planId);
    const plan = plans.get(planId);
    if (!plan) throw new Error(`unknown lookahead plan ${planId}`);
    const reduction = reduceQuotientLookaheadWorkDag(plan, frontierValues, graph.spec.columns);
    plansReduced += 1;
    return reduction;
  }

  function release(planId) {
    assertPlanId(planId);
    const released = plans.delete(planId);
    if (released) plansReleased += 1;
    return released;
  }

  function clear() {
    plansReleased += plans.size;
    plans.clear();
  }

  function stats() {
    return Object.freeze({
      activePlans: plans.size,
      maxActivePlans,
      plansBuilt,
      plansReduced,
      plansReleased,
    });
  }

  return Object.freeze({ build, reduce, release, clear, stats });
}
