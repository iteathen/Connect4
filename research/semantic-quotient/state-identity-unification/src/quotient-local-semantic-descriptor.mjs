import {
  createQuotientSemanticDescriptor,
  createResidualSemanticDescriptor,
} from './quotient-semantic-identity.mjs';

export function createLocalSemanticDescriptorCache(kernel) {
  const classCache = [];
  const metrics = {
    classBuilds: 0,
    classHits: 0,
    stateBuilds: 0,
    stateHits: 0,
    termIdsCached: 0,
  };

  function classDescriptor(classId) {
    const prior = classCache[classId];
    if (prior !== undefined) {
      metrics.classHits += 1;
      return prior;
    }
    const ids = kernel.classes.termIds(classId);
    const descriptor = createResidualSemanticDescriptor(classId, ids);
    classCache[classId] = descriptor;
    metrics.classBuilds += 1;
    metrics.termIdsCached += ids.length;
    return descriptor;
  }

  function stateDescriptor(stateId) {
    const supportIndex = kernel.states.support[stateId];
    const p0 = classDescriptor(kernel.states.p0Class[stateId]);
    const p1 = classDescriptor(kernel.states.p1Class[stateId]);
    metrics.stateBuilds += 1;
    return createQuotientSemanticDescriptor(stateId, supportIndex, p0, p1);
  }

  return Object.freeze({
    classDescriptor,
    stateDescriptor,
    metrics,
  });
}
