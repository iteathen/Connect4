import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

function one(c){
  console.log('channel',c.label,c.directions.join('+'));
  const r=analyzeDirectResidualOrbitGraph({
    width:c.width,height:c.height,k:c.k,
    winningLineDirections:c.directions,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
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
    motifGroups:a.motifGroups,
    testedPairs:a.testedPairs,
    cycleCoverage:a.cycleCoverage,
    contradictionCoverage:a.contradictionCoverage,
    outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer,
  };
}
const rows=[
  one({label:'5x4-k3-H',width:5,height:4,k:3,directions:['H']}),
  one({label:'5x4-k3-VD',width:5,height:4,k:3,directions:['V','D']}),
  one({label:'5x4-k4-HD',width:5,height:4,k:4,directions:['H','D']}),
];
const out={
  schema:'connect4.isomax.discovery.cap_hole_channel_partition.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-019',
  rows,
  channelSummary:Object.fromEntries(rows.map(x=>[x.label,{
    nonzero:x.nonzero,
    nonzeroWithMotif:x.cycleCoverage.nonzeroCyclesWithMotif,
    nonzeroWithoutMotif:x.cycleCoverage.nonzeroCyclesWithoutMotif,
    zeroWithMotif:x.cycleCoverage.zeroCyclesWithMotif,
    contradictions:x.contradictions,
    contradictionsWithMotif:x.contradictionCoverage.withMotif,
    contradictionsWithoutMotif:x.contradictionCoverage.withoutMotif,
  }])),
  interpretation_guard:'Counterfactual line-family channels only. Coverage patterns characterize these fixed producer interventions and are not standard-game theorems.'
};
fs.writeFileSync(new URL('./CAP_HOLE_CHANNEL_PARTITION_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW019_COMPLETE',summary:out.channelSummary},null,2));
