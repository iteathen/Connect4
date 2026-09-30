import fs from 'node:fs';
import {
  analyzeDirectResidualOrbitGraph,
} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

function extract(label,width,height){
  console.log('extract carrier',label);
  const r=analyzeDirectResidualOrbitGraph({
    width,height,k:4,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
    supportReleaseTurnCapacity:true,
    measureLocalBranchClosure:false,
    emitPrimitiveWitnessData:true,
  });
  const b=r.primitiveWitnessData.binaryPhase,
    c=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit;
  return {
    label,width,height,k:4,
    raw_source_notice:'edge/state enumeration comes from the existing producer; all graph/cocycle conclusions are recomputed independently by run-carrier-prior-audit.mjs',
    summary_from_source:{
      residualOrbitStates:r.residualOrbitStates,
      recursiveUnlabelledClasses:r.recursiveUnlabelledClasses,
      recursiveActionLabelledClasses:r.recursiveActionLabelledClasses,
      binaryGroups:r.deeperContinuationPhaseAudit.binaryGroups,
      reducedEdges:b.reducedEdges.length,
      cycleRank:c.cycleRank,
      zeroCycleSyndromes:c.zeroCycleSyndromes,
      nonzeroCycleSyndromes:c.nonzeroCycleSyndromes,
      contradictoryReconvergences:c.contradictoryReconvergences,
      globalPhasePotentialExists:c.globalPhasePotentialExists,
    },
    binaryGroupIds:b.binaryGroupIds,
    activeBinaryIds:b.activeBinaryIds,
    edges:b.reducedEdges.map(e=>({
      id:e.id,from:e.from,to:e.to,column:e.column,
      parentRank:e.parentRank,targetRank:e.targetRank,delta:e.delta,
    })),
  };
}

const out={
  schema:'connect4.isomax.foundational_prior_audit.carrier_input.v1',
  date_author_local:'2026-09-29',
  provenance:{
    producer:'existing bounded direct residual-orbit graph',
    independence_boundary:'raw carrier generation is not independent; graph topology, exactness, cycle basis, parity paths and labels are independently recomputed downstream'
  },
  cases:[
    extract('4x5-k4-release-flat',4,5),
    extract('5x4-k4-release-obstructed',5,4),
  ],
};
fs.writeFileSync(new URL('./CARRIER_AUDIT_INPUT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'CARRIER_AUDIT_INPUT_READY',cases:out.cases.map(x=>({label:x.label,groups:x.binaryGroupIds.length,edges:x.edges.length,source:x.summary_from_source}))},null,2));
