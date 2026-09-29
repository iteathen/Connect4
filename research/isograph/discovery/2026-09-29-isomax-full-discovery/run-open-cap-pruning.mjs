import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

function run(width,height){
  const r=analyzeDirectResidualOrbitGraph({
    width,height,k:4,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
    opponentOpenCapTerminalDominance:true,
    measureLocalBranchClosure:false,
  });
  const c=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit;
  return {
    width,height,states:r.residualOrbitStates,classes:r.recursiveUnlabelledClasses,
    cycleRank:c.cycleRank,zero:c.zeroCycleSyndromes,nonzero:c.nonzeroCycleSyndromes,
    contradictions:c.contradictoryReconvergences,
    globalPhasePotentialExists:c.globalPhasePotentialExists,
    outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer,
  };
}
const rows=[run(4,5),run(5,4)];
const baseline=[
  {width:4,height:5,cycleRank:40,nonzero:0,contradictions:0},
  {width:5,height:4,cycleRank:644,nonzero:25,contradictions:12}
];
const comparisons=rows.map(row=>{
  const b=baseline.find(x=>x.width===row.width&&x.height===row.height);
  return {
    width:row.width,height:row.height,
    deltaCycleRank:row.cycleRank-b.cycleRank,
    deltaNonzero:row.nonzero-b.nonzero,
    deltaContradictions:row.contradictions-b.contradictions,
    integrabilityStatusPreserved:(row.nonzero===0)===(b.nonzero===0),
  };
});
const out={
  schema:'connect4.isomax.discovery.open_cap_pruning_intervention.v1',
  date_author_local:'2026-09-29',warrant:'EW-009',
  rows,baseline,comparisons,
  interpretation_guard:'Research pruning intervention only.'
};
fs.writeFileSync(new URL('./OPEN_CAP_PRUNING_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW009_COMPLETE',rows,comparisons},null,2));
