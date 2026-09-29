import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

function run(width,height){
  const r=analyzeDirectResidualOrbitGraph({
    width,height,k:2,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
    measureLocalBranchClosure:false,
  });
  const c=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit;
  return {
    width,height,k:2,cells:r.cells,winningLineCount:r.winningLineCount,
    states:r.residualOrbitStates,classes:r.recursiveUnlabelledClasses,
    binaryGroups:r.deeperContinuationPhaseAudit.binaryGroups,
    binaryEdges:r.deeperContinuationPhaseAudit.binaryContinuationEdges,
    cycleRank:c.cycleRank,zero:c.zeroCycleSyndromes,nonzero:c.nonzeroCycleSyndromes,
    contradictions:c.contradictoryReconvergences,
    globalPhasePotentialExists:c.globalPhasePotentialExists,
    outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer,
  };
}
const rows=[run(4,5),run(5,4)];
const out={
  schema:'connect4.isomax.discovery.k2_special_case_control.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-007',
  rows,
  geometryContrastPersists:rows[0].nonzero===0&&rows[1].nonzero>0,
  interpretation_guard:'Special-case k=2 control only.'
};
fs.writeFileSync(new URL('./K2_SPECIAL_CASE_CONTROL_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW007_COMPLETE',...out},null,2));
