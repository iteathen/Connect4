import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

console.log('surviving 5x4 k4 obstruction under support-release closure');
const r=analyzeDirectResidualOrbitGraph({
 width:5,height:4,k:4,
 nonterminalFrontierBlocker:true,
 moverFinalCapParity:true,
 supportReleaseTurnCapacity:true,
 measureLocalBranchClosure:false,
});
const c=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit;
if(c.contradictoryReconvergences!==1)throw new Error('expected exactly one surviving contradiction');
const one=c.contradictoryReconvergenceExamples[0]??null;
const out={
 schema:'connect4.isomax.discovery.surviving_obstruction.v1',
 date_author_local:'2026-09-29',
 warrant:'EW-014',
 summary:{
  states:r.residualOrbitStates,
  classes:r.recursiveUnlabelledClasses,
  actionClasses:r.recursiveActionLabelledClasses,
  cycleRank:c.cycleRank,
  zero:c.zeroCycleSyndromes,
  nonzero:c.nonzeroCycleSyndromes,
  contradictions:c.contradictoryReconvergences,
  outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer,
 },
 survivingContradiction:one,
 shortestContradictionTransporterAudit:c.shortestContradictionTransporterAudit,
 nonzeroCycleSyndromeExamples:c.nonzeroCycleSyndromeExamples,
 obstructionGroupExamples:c.obstructionGroupExamples,
 baselineMssReference:{
  source:3260,target:574,sourceRank:12,targetRank:14,
  routeLengths:[2,2],totalTraversals:4,distinctEdges:4
 },
 interpretation_guard:'Repair-survival characterization only. Matching IDs across changed carriers is not assumed; structural comparison must use ranks/routes/residual anatomy.'
};
fs.writeFileSync(new URL('./SURVIVING_OBSTRUCTION_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW014_COMPLETE',summary:out.summary,survivor:one,shortestAudit:c.shortestContradictionTransporterAudit},null,2));
