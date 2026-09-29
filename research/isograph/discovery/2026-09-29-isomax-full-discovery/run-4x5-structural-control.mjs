import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';
const r=analyzeDirectResidualOrbitGraph({width:4,height:5,k:4,nonterminalFrontierBlocker:true,moverFinalCapParity:true,
 measureLocalBranchClosure:true,auditColumnRefinement:true,auditPairColumnRefinement:true,auditBinaryTieStabilizers:true,
 auditOpponentResidualDeletion:true,auditEarliestMergeParents:true,auditEarliestMergeWitness:true});
const c=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit,d=r.opponentResidualDeletionAudit;
const out={schema:'connect4.isomax.discovery.structural_audit_4x5_control.v1',date_author_local:'2026-09-29',warrant:'EW-008',
 summary:{states:r.residualOrbitStates,classes:r.recursiveUnlabelledClasses,earliestMergeRank:r.earliestDynamicMergeRank,
  cycleRank:c.cycleRank,nonzero:c.nonzeroCycleSyndromes,contradictions:c.contradictoryReconvergences,outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer},
 localBranchClosure:r.localBranchClosure,columnRefinementAudit:r.columnRefinementAudit,pairColumnRefinementAudit:r.pairColumnRefinementAudit,
 binaryTieStabilizerAudit:r.binaryTieStabilizerAudit,opponentResidualDeletionAudit:d,
 earliestDynamicMergeParentAudit:r.earliestDynamicMergeParentAudit,earliestDynamicMergeWitnessAudit:r.earliestDynamicMergeWitnessAudit,
 derived:{mergeWitnessMinDepth:r.earliestDynamicMergeWitnessAudit?.minWitnessDepth??null,
  mergeWitnessMaxDepth:r.earliestDynamicMergeWitnessAudit?.maxWitnessDepth??null,
  mergePairs:r.earliestDynamicMergeWitnessAudit?.pairs??0,
  transportOnlyPairs:r.earliestDynamicMergeWitnessAudit?.pairsRequiringTransportInEveryChildClass??0,
  groupsWithCommonParent:r.earliestDynamicMergeParentAudit?.groupsWithCommonParent??0,
  classPreservingDeletions:d?.classPreservingDeletions??0,literalEquivalent:d?.literalContinuationEquivalentDeletions??0,
  unexplainedAfterSupportRelease:d?.unexplainedAfterSupportRelease??0}};
fs.writeFileSync(new URL('./STRUCTURAL_AUDIT_4X5_CONTROL_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW008_COMPLETE',summary:out.summary,derived:out.derived},null,2));
