import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

function one(c){
  console.log('motif-cycle-coverage',c.label);
  const r=analyzeDirectResidualOrbitGraph({
    width:c.width,height:c.height,k:c.k,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
    supportReleaseTurnCapacity:c.supportReleaseTurnCapacity,
    measureLocalBranchClosure:false,
    auditOpenCapHoleMotif:true,
  });
  const coc=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit,
    a=coc.openCapHoleMotifAudit;
  return {
    ...c,
    states:r.residualOrbitStates,
    classes:r.recursiveUnlabelledClasses,
    cycleRank:coc.cycleRank,
    zero:coc.zeroCycleSyndromes,
    nonzero:coc.nonzeroCycleSyndromes,
    contradictions:coc.contradictoryReconvergences,
    audit:a,
    outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer,
  };
}
const rows=[
  one({label:'5x4-k3-standard',width:5,height:4,k:3,supportReleaseTurnCapacity:false}),
  one({label:'5x4-k4-release',width:5,height:4,k:4,supportReleaseTurnCapacity:true}),
];
const summary=rows.map(x=>({
  label:x.label,
  motifGroups:x.audit.motifGroups,
  testedPairs:x.audit.testedPairs,
  ...x.audit.cycleCoverage,
  ...Object.fromEntries(Object.entries(x.audit.contradictionCoverage)
    .map(([k,v])=>['contradiction_'+k,v])),
}));
const out={
  schema:'connect4.isomax.discovery.cap_hole_cycle_coverage.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-018',
  rows,summary,
  crossCase:{
    allObservedNonzeroCyclesContainMotif:
      rows.every(x=>x.audit.cycleCoverage.allObservedNonzeroCyclesContainMotif),
    allObservedContradictionsContainMotif:
      rows.every(x=>x.audit.contradictionCoverage.allObservedContradictionsContainMotif),
    anyObservedZeroCycleContainsMotif:
      rows.some(x=>x.audit.cycleCoverage.zeroCyclesWithMotif>0),
  },
  interpretation_guard:'Finite exact basis-relative coverage. Necessity/sufficiency beyond these carriers is not claimed.'
};
fs.writeFileSync(new URL('./CAP_HOLE_CYCLE_COVERAGE_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW018_COMPLETE',summary,crossCase:out.crossCase},null,2));
