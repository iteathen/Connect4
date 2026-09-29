import fs from 'node:fs';
import {
  analyzeDirectResidualOrbitGraph,
} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

function lineCounts(w,h,k){
  const H=w>=k?(w-k+1)*h:0;
  const V=h>=k?w*(h-k+1):0;
  const D=(w>=k&&h>=k)?2*(w-k+1)*(h-k+1):0;
  return {horizontal:H,vertical:V,diagonal:D,total:H+V+D,horizontalMinusVertical:H-V};
}
function one(width,height,k,frontier,cap){
  const r=analyzeDirectResidualOrbitGraph({
    width,height,k,
    nonterminalFrontierBlocker:frontier,
    moverFinalCapParity:cap,
    measureLocalBranchClosure:false,
  });
  const c=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit;
  return {
    width,height,k,frontier,cap,cells:r.cells,
    lineCounts:lineCounts(width,height,k),
    reportedWinningLineCount:r.winningLineCount,
    residualOrbitStates:r.residualOrbitStates,
    recursiveUnlabelledClasses:r.recursiveUnlabelledClasses,
    binaryGroups:r.deeperContinuationPhaseAudit.binaryGroups,
    binaryContinuationEdges:r.deeperContinuationPhaseAudit.binaryContinuationEdges,
    nonbinaryContinuationEdges:r.deeperContinuationPhaseAudit.nonbinaryContinuationEdges,
    childTransporterEdges:r.deeperContinuationPhaseAudit.childTransporterEdges,
    childBranchErasureEdges:r.deeperContinuationPhaseAudit.childBranchErasureEdges,
    cycleRank:c.cycleRank,zeroCycleSyndromes:c.zeroCycleSyndromes,
    nonzeroCycleSyndromes:c.nonzeroCycleSyndromes,
    contradictoryReconvergences:c.contradictoryReconvergences,
    globalPhasePotentialExists:c.globalPhasePotentialExists,
    gaugeFlipInvariant:c.gaugeFlipInvariant,
    outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer,
  };
}
const rows=[];
for(const [w,h] of [[3,3],[3,4],[4,3]])for(const frontier of [false,true])for(const cap of [false,true]){
  console.log('case',w,h,'frontier',frontier,'cap',cap);
  const row=one(w,h,3,frontier,cap);
  if(row.lineCounts.total!==row.reportedWinningLineCount)throw new Error('line count mismatch');
  rows.push(row);
}
const paired=[];
for(const frontier of [false,true])for(const cap of [false,true]){
  const a=rows.find(x=>x.width===3&&x.height===4&&x.frontier===frontier&&x.cap===cap);
  const b=rows.find(x=>x.width===4&&x.height===3&&x.frontier===frontier&&x.cap===cap);
  paired.push({
    frontier,cap,
    sameCells:a.cells===b.cells,
    sameTotalWinningLines:a.reportedWinningLineCount===b.reportedWinningLineCount,
    horizontalVerticalSurplus:[a.lineCounts.horizontalMinusVertical,b.lineCounts.horizontalMinusVertical],
    nonzeroSyndromes:[a.nonzeroCycleSyndromes,b.nonzeroCycleSyndromes],
    contradictions:[a.contradictoryReconvergences,b.contradictoryReconvergences],
    integrabilityDiffers:a.globalPhasePotentialExists!==b.globalPhasePotentialExists,
  });
}
const balanced=rows.filter(x=>x.width===3&&x.height===3);
const out={
 schema:'connect4.isomax.discovery.k3_transpose_fresh_control.v1',
 date_author_local:'2026-09-29',
 warrant:'EW-002',
 adaptive_lineage:'fresh k=3 observations; orientation dimension selected before observing these cases',
 rows,paired,balanced,
 model_breaking:paired.some(x=>x.sameCells&&x.sameTotalWinningLines&&!x.integrabilityDiffers),
 interpretation_guard:'Observed correlation is discovery evidence only; no universal gravity-orientation theorem follows from this finite family.'
};
fs.writeFileSync(new URL('./K3_TRANSPOSE_OBSERVATIONS_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'K3_TRANSPOSE_COMPLETE',paired,balanced:balanced.map(x=>({frontier:x.frontier,cap:x.cap,nonzero:x.nonzeroCycleSyndromes,contradictions:x.contradictoryReconvergences}))},null,2));
