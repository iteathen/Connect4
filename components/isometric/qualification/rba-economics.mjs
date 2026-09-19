import { performance } from 'node:perf_hooks';
import { IsometricState, ResidualPool, IsoMaxSolver, IsoMaxRbaValueResolver } from '../index.mjs';
const games = [
  [1,5,2,3,6,3,2,5,4,4,1,3,0,2,5,0,6,1,6,1,2,2,0,1,5,0,2,5,0,5,0,6,4,4,4,6,1,4,3,3,6,3],
  [3,4,3,0,3,3,2,0,5,2,1,4,3,3,4,5,6,4,4,0,5,6,0,6,4,2,6,5,2,5,1,1,0,2,6,5,2,0,1,6,1,1],
];
const results = [];
const median = values => [...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
for (const game of games) {
  const pool = new ResidualPool();
  const conversionStart = performance.now();
  const state = new IsometricState({pool,moves:game.slice(0,36)});
  const rootConversionMs = performance.now()-conversionStart;
  const constructStart = performance.now();
  const valueResolver = new IsoMaxRbaValueResolver({pool,minimumHeights:Array.from(state.heights)});
  const constructionMs = performance.now()-constructStart;
  const baselineMs = [], boundaryMs = [], queryMs = [];
  let baseline, boundary;
  for (let sample=0;sample<22;sample++) {
    for (const useBoundary of (sample%2?[true,false]:[false,true])) {
      const solver = new IsoMaxSolver({pool,valueResolver:useBoundary?valueResolver:null});
      const start = performance.now();
      const result = solver.solveValue(state);
      const elapsed = performance.now()-start;
      if (useBoundary) boundary = result; else baseline = result;
      if (sample>1) {
        (useBoundary?boundaryMs:baselineMs).push(elapsed);
        if (useBoundary) queryMs.push(result.metrics.valueBoundaryQueryMs);
      }
    }
  }
  if (baseline.value !== boundary.value) throw new Error('economics comparison changed WDL');
  results.push({rank:state.ply,support:Array.from(state.heights),value:baseline.value,rootConversionMs,
    constructionMs,normalizationMs:valueResolver.construction.normalizationMs,
    supports:valueResolver.construction.supports,generatedCandidates:valueResolver.construction.generatedCandidates,
    baselineMedianMs:median(baselineMs),boundarySolveMedianMs:median(boundaryMs),boundaryQueryMedianMs:median(queryMs),
    constructionPlusSolveMs:constructionMs+median(boundaryMs),baseline:baseline.metrics,boundary:boundary.metrics,
    recursiveChildrenAvoided:baseline.metrics.recursiveChildren-boundary.metrics.recursiveChildren,
    forcedTransitionsAvoided:baseline.metrics.forcedTransitions-boundary.metrics.forcedTransitions});
}
console.log(JSON.stringify({node:process.version,profile:'optional-isomax-rba',defaultEnabled:false,results}));
