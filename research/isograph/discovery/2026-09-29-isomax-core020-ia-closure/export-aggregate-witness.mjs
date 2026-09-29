import fs from 'node:fs';
import {
  analyzeDirectResidualOrbitGraph,
} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';
import {
  analyzeStandardCenterControlAlgebra,
  analyzeOptimalBranchCollapse4x4,
} from '../2026-09-29-center-proof-cycle/control-algebra.mjs';

function phaseCase(label,options,{direct=false}={}){
  const r=analyzeDirectResidualOrbitGraph({
    ...options,
    measureLocalBranchClosure:false,
    emitPrimitiveWitnessData:true,
    emitFullDirectCarrier:direct,
  });
  return {
    label,
    options,
    summary:{
      width:r.width,height:r.height,k:r.k,cells:r.cells,
      winningLineCount:r.winningLineCount,
      residualOrbitStates:r.residualOrbitStates,
      recursiveUnlabelledClasses:r.recursiveUnlabelledClasses,
      recursiveActionLabelledClasses:r.recursiveActionLabelledClasses,
      producerUsesOutcomeLabels:r.outcomeLabelsUsedByProducer,
      physicalBoardStatesEnumerated:r.physicalBoardStatesEnumerated,
      binaryGroups:r.deeperContinuationPhaseAudit.binaryGroups,
      binaryContinuationEdges:r.deeperContinuationPhaseAudit.binaryContinuationEdges,
      nonbinaryContinuationEdges:r.deeperContinuationPhaseAudit.nonbinaryContinuationEdges,
      childTransporterEdges:r.deeperContinuationPhaseAudit.childTransporterEdges,
      childBranchErasureEdges:r.deeperContinuationPhaseAudit.childBranchErasureEdges,
      childTerminalOrUnknownEdges:r.deeperContinuationPhaseAudit.childTerminalOrUnknownEdges,
      cycleRank:r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.cycleRank,
      zeroCycleSyndromes:r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.zeroCycleSyndromes,
      nonzeroCycleSyndromes:r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.nonzeroCycleSyndromes,
      contradictoryReconvergences:r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.contradictoryReconvergences,
      parityWellDefinedFibers:r.lateActionParityAudit.parityWellDefinedFibers,
      pureTransporterDistinctSlotFibers:r.lateActionParityAudit.pureTransporterDistinctSlotFibers,
    },
    witness:r.primitiveWitnessData,
  };
}

const phase4x4=phaseCase('4x4-c4',{
  width:4,height:4,k:4,
},{direct:true});

const phase4x5=phaseCase('4x5-c4',{
  width:4,height:5,k:4,
  nonterminalFrontierBlocker:true,
  moverFinalCapParity:true,
});

const phase5x4=phaseCase('5x4-c4',{
  width:5,height:4,k:4,
  nonterminalFrontierBlocker:true,
  moverFinalCapParity:true,
});

const response=analyzeStandardCenterControlAlgebra({emitPrimitiveWitnessData:true});
const branch=analyzeOptimalBranchCollapse4x4({emitPrimitiveWitnessData:true});

const out={
  schema:'isomax.core020.aggregate_primitive_witness.v1',
  date_author_local:'2026-09-29',
  research_direction:'Joshua Oshiro',
  source:{
    control_algebra_dimensions_blob:'eb463db2e4547a4ed5a85141c94cb3db8ffdde35',
    note:'source blob after export-only primitiveWitnessData instrumentation',
  },
  phase:{phase4x4,phase4x5,phase5x4},
  response:{
    summary:{
      lineCount:response.lineCount,
      responsePairs:response.responsePairs,
      responsePairRank:response.responsePairRank,
      responseRelationNullity:response.responseRelationNullity,
      dependencyLabels:response.dependencyLabels,
      unmatchedCenterIndependent:response.unmatchedCenterIndependent,
      rankWithUnmatchedCenter:response.rankWithUnmatchedCenter,
      outcomeLabelsRead:response.outcomeLabelsRead,
    },
    witness:response.primitiveWitnessData,
  },
  partial2:{
    summary:{
      states:branch.states,
      optimalDistinctDeltas:branch.equivalentSiblingDeltaSpace.allOptimalDistinctDeltas,
      optimalDeltaRank:branch.equivalentSiblingDeltaSpace.allOptimalDeltaRank,
      legalDistinctDeltas:branch.equivalentSiblingDeltaSpace.allLegalDistinctDeltas,
      legalDeltaRank:branch.equivalentSiblingDeltaSpace.allLegalDeltaRank,
      optimalDeltaSetEqualsLegal:branch.equivalentSiblingDeltaSpace.optimalDeltaSetEqualsLegal,
      legalDeltasOutsideOptimalSpan:branch.equivalentSiblingDeltaSpace.legalDeltasOutsideOptimalSpan,
    },
    witness:branch.primitiveWitnessData,
  },
};

const dest=new URL('./AGGREGATE_WITNESS_DATA_0_1.json',import.meta.url);
fs.writeFileSync(dest,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({
  status:'WROTE',
  file:dest.pathname,
  phase:{
    '4x4':phase4x4.summary,
    '4x5':phase4x5.summary,
    '5x4':phase5x4.summary,
  },
  response:out.response.summary,
  partial2:out.partial2.summary,
},null,2));
