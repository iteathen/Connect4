import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

function one(label,width,height){
  console.log('cap-hole orientation',label);
  const r=analyzeDirectResidualOrbitGraph({
    width,height,k:4,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
    supportReleaseTurnCapacity:true,
    measureLocalBranchClosure:false,
    auditCapHoleOrientation:true,
  });
  const c=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit,
    a=c.capHoleOrientationAudit;
  return {
    label,width,height,k:4,
    states:r.residualOrbitStates,
    classes:r.recursiveUnlabelledClasses,
    cycleRank:c.cycleRank,
    nonzero:c.nonzeroCycleSyndromes,
    contradictions:c.contradictoryReconvergences,
    globalPhasePotentialExists:c.globalPhasePotentialExists,
    audit:a,
    outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer,
  };
}
const rows=[
  one('4x5-k4-release',4,5),
  one('5x4-k4-release',5,4),
];
const flat=rows[0],obstructed=rows[1];
const out={
  schema:'connect4.isomax.discovery.cap_hole_orientation.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-015',
  rows,
  summary:{
    robustContradictionPresent:obstructed.contradictions===1,
    robustContradictoryDefinedPairs:obstructed.audit.contradictoryDefinedPairs,
    robustContradictoryConsistentPairs:obstructed.audit.contradictoryConsistentPairs,
    flatContradictions:flat.contradictions,
    flatDefinedPairs:flat.audit.flatDefinedPairs,
    flatConsistentPairs:flat.audit.flatConsistentPairs,
    flatInconsistentPairs:flat.audit.inconsistentPairs,
    candidateCoversAllRobustStartSheets:
      obstructed.audit.contradictoryDefinedPairs===2,
    candidateMatchesAllDefinedRobustStartSheets:
      obstructed.audit.contradictoryDefinedPairs>0 &&
      obstructed.audit.contradictoryDefinedPairs===
        obstructed.audit.contradictoryConsistentPairs,
    flatControlHasNoDefinedInconsistency:
      flat.audit.inconsistentPairs===0,
  },
  interpretation_guard:'A successful finite audit establishes only a relabeling-covariant local endpoint correction on covered reconvergences. It is not a complete corrected-carrier theorem unless coverage and closure are separately established.'
};
fs.writeFileSync(new URL('./CAP_HOLE_ORIENTATION_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({
  status:'EW015_COMPLETE',
  summary:out.summary,
  coverage:rows.map(x=>({
    label:x.label,
    routePairs:x.audit.routePairsAudited,
    defined:x.audit.definedPairs,
    consistent:x.audit.consistentPairs,
    inconsistent:x.audit.inconsistentPairs,
    contradictoryDefined:x.audit.contradictoryDefinedPairs,
    contradictoryConsistent:x.audit.contradictoryConsistentPairs,
  })),
},null,2));
