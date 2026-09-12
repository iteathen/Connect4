import {
  buildQuotientLookaheadWorkDag,
  reduceQuotientLookaheadWorkDag,
} from './quotient-lookahead-work-dag.mjs';

export function createQuotientWorkPlanService(graph) {
  const plans = new Map();
  let nextPlanId = 1;
  let plansBuilt = 0;
  let plansReduced = 0;

  function build(splitDepth, probeDepth = 2) {
    const plan = buildQuotientLookaheadWorkDag(graph, splitDepth, { probeDepth });
    const planId = nextPlanId++;
    plans.set(planId, plan);
    plansBuilt += 1;
    return Object.freeze({ planId, plan });
  }

  function reduce(planId, frontierValues) {
    const plan = plans.get(planId);
    if (!plan) throw new Error(`unknown lookahead plan ${planId}`);
    const reduction = reduceQuotientLookaheadWorkDag(plan, frontierValues, graph.spec.columns);
    plansReduced += 1;
    return reduction;
  }

  function release(planId) {
    return plans.delete(planId);
  }

  function stats() {
    return Object.freeze({
      activePlans: plans.size,
      plansBuilt,
      plansReduced,
    });
  }

  return Object.freeze({ build, reduce, release, stats });
}
