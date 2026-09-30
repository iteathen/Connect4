import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

function one(label,directions){
  console.log('vd-characterization',label);
  const r=analyzeDirectResidualOrbitGraph({
    width:5,height:4,k:3,
    winningLineDirections:directions,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
    measureLocalBranchClosure:false,
    auditOpenCapHoleMotif:true,
  });
  const d=r.deeperContinuationPhaseAudit,c=d.binaryPhaseCocycleAudit;
  return {
    label,directions,
    summary:{
      states:r.residualOrbitStates,classes:r.recursiveUnlabelledClasses,
      actionClasses:r.recursiveActionLabelledClasses,
      binaryGroups:d.binaryGroups,binaryEdges:d.binaryContinuationEdges,
      nonbinary:d.nonbinaryContinuationEdges,
      transporter:d.childTransporterEdges,
      erasure:d.childBranchErasureEdges,
      cycleRank:c.cycleRank,zero:c.zeroCycleSyndromes,nonzero:c.nonzeroCycleSyndromes,
      contradictions:c.contradictoryReconvergences,
      motifGroups:c.openCapHoleMotifAudit.motifGroups,
      nonzeroWithMotif:c.openCapHoleMotifAudit.cycleCoverage.nonzeroCyclesWithMotif,
      contradictionWithMotif:c.openCapHoleMotifAudit.contradictionCoverage.withMotif,
    },
    shortestContradictionTransporterAudit:c.shortestContradictionTransporterAudit,
    contradictoryReconvergenceExamples:c.contradictoryReconvergenceExamples,
    obstructionGroupExamples:c.obstructionGroupExamples,
    exits:c.exits,
    outcomeLabelsUsed:c.outcomeLabelsUsed,
  };
}
const rows=[one('H',['H']),one('VD',['V','D'])];
const out={
  schema:'connect4.isomax.discovery.vd_channel_characterization.v1',
  date_author_local:'2026-09-29',warrant:'EW-020',rows,
  interpretation_guard:'Exact finite channel characterization. Canonical IDs/masks are provenance only; any general relation requires a separately relabeling-invariant formulation and fresh test.'
};
fs.writeFileSync(new URL('./VD_CHANNEL_CHARACTERIZATION_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW020_COMPLETE',summaries:rows.map(x=>x.summary),shortest:rows.map(x=>({label:x.label,audit:x.shortestContradictionTransporterAudit}))},null,2));
