import fs from 'node:fs';
import {
  analyzeDirectResidualOrbitGraph,
} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

function run(c){
  console.log('audit',c.label);
  const r=analyzeDirectResidualOrbitGraph({
    width:c.width,height:c.height,k:c.k,
    nonterminalFrontierBlocker:c.nonterminalFrontierBlocker,
    moverFinalCapParity:c.moverFinalCapParity,
    measureLocalBranchClosure:true,
    auditColumnRefinement:true,
    auditPairColumnRefinement:true,
    auditBinaryTieStabilizers:true,
    auditOpponentResidualDeletion:true,
    auditEarliestMergeParents:true,
    auditEarliestMergeWitness:true,
  });
  const coc=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit;
  return {
    case:c,
    summary:{
      residualOrbitStates:r.residualOrbitStates,
      recursiveUnlabelledClasses:r.recursiveUnlabelledClasses,
      recursiveActionLabelledClasses:r.recursiveActionLabelledClasses,
      earliestDynamicMergeRank:r.earliestDynamicMergeRank,
      cycleRank:coc.cycleRank,nonzeroCycleSyndromes:coc.nonzeroCycleSyndromes,
      contradictoryReconvergences:coc.contradictoryReconvergences,
      outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer,
    },
    localBranchClosure:r.localBranchClosure,
    columnRefinementAudit:r.columnRefinementAudit,
    pairColumnRefinementAudit:r.pairColumnRefinementAudit,
    binaryTieStabilizerAudit:r.binaryTieStabilizerAudit,
    opponentResidualDeletionAudit:r.opponentResidualDeletionAudit,
    earliestDynamicMergeParentAudit:r.earliestDynamicMergeParentAudit,
    earliestDynamicMergeWitnessAudit:r.earliestDynamicMergeWitnessAudit,
    earliestDynamicMergeGroups:r.earliestDynamicMergeGroups,
  };
}
const cases=[
 {label:'4x4',width:4,height:4,k:4,nonterminalFrontierBlocker:false,moverFinalCapParity:false},
 {label:'5x4',width:5,height:4,k:4,nonterminalFrontierBlocker:true,moverFinalCapParity:true},
];
const rows=cases.map(run);
const derived=rows.map(x=>{
  const d=x.opponentResidualDeletionAudit??{};
  return {
    label:x.case.label,
    classPreservingDeletions:d.classPreservingDeletions??0,
    literalEquivalent:d.literalContinuationEquivalentDeletions??0,
    supportReleaseExplained:d.supportReleaseExplainedDeletions??0,
    moveCapacityExplained:d.moveCapacityExplainedDeletions??0,
    unexplainedAfterSupportRelease:d.unexplainedAfterSupportRelease??0,
    exactOpenCap:d.exactOpenCapDeletions??0,
    exactOpenCapUnexplained:d.exactOpenCapUnexplained??0,
    exactOpenCapTerminalDominated:d.exactOpenCapTerminalDominated??0,
    earliestClassPreservingRank:d.earliestClassPreservingRank??null,
    earliestMergeRank:x.summary.earliestDynamicMergeRank,
    mergeWitnessMinDepth:x.earliestDynamicMergeWitnessAudit?.minWitnessDepth??null,
    mergeWitnessMaxDepth:x.earliestDynamicMergeWitnessAudit?.maxWitnessDepth??null,
    columnSearchFree:x.columnRefinementAudit?.searchFreeFraction??null,
    pairSearchFree:x.pairColumnRefinementAudit?.searchFreeFraction??null,
    binaryTieDims:x.binaryTieStabilizerAudit?.dimensions??[],
  };
});
const out={
 schema:'connect4.isomax.discovery.structural_audit.v1',
 date_author_local:'2026-09-29',warrant:'EW-003',
 rows,derived,
 model_breaking:derived.filter(x=>x.unexplainedAfterSupportRelease>0||x.literalEquivalent>0),
 interpretation_guard:'Class preservation or literal continuation equivalence is evidence about this frozen producer/quotient only; it is not automatic natural identity or a universal deletion rule.'
};
fs.writeFileSync(new URL('./STRUCTURAL_AUDIT_OBSERVATIONS_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'STRUCTURAL_AUDIT_COMPLETE',derived},null,2));
