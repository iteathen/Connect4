import {
  hashResidualTermIds,
  hashSemanticQuotientDescriptor,
} from './quotient-semantic-shared-tt.mjs';

export function createLocalSemanticDescriptorCache(kernel) {
  const classCache = [];
  const stateCache = [];
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
    const hash = hashResidualTermIds(ids);
    const descriptor = Object.freeze({ classId, ids, hash });
    classCache[classId] = descriptor;
    metrics.classBuilds += 1;
    metrics.termIdsCached += ids.length;
    return descriptor;
  }

  function stateDescriptor(stateId) {
    const prior = stateCache[stateId];
    if (prior !== undefined) {
      metrics.stateHits += 1;
      return prior;
    }
    const supportIndex = kernel.states.support[stateId];
    const p0 = classDescriptor(kernel.states.p0Class[stateId]);
    const p1 = classDescriptor(kernel.states.p1Class[stateId]);
    const hash = hashSemanticQuotientDescriptor(
      supportIndex,
      p0.hash,
      p1.hash,
      p0.ids.length,
      p1.ids.length,
    );
    const descriptor = Object.freeze({ stateId, supportIndex, p0, p1, hash });
    stateCache[stateId] = descriptor;
    metrics.stateBuilds += 1;
    return descriptor;
  }

  return Object.freeze({
    classDescriptor,
    stateDescriptor,
    metrics,
  });
}
