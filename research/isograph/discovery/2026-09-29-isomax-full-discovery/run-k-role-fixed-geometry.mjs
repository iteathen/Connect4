import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';
function one(width,height,k){
 const r=analyzeDirectResidualOrbitGraph({width,height,k,nonterminalFrontierBlocker:true,moverFinalCapParity:true,measureLocalBranchClosure:false});
 const c=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit,d=r.deeperContinuationPhaseAudit;
 return {width,height,k,cells:r.cells,winningLineCount:r.winningLineCount,states:r.residualOrbitStates,classes:r.recursiveUnlabelledClasses,
  binaryGroups:d.binaryGroups,binaryEdges:d.binaryContinuationEdges,cycleRank:c.cycleRank,zero:c.zeroCycleSyndromes,nonzero:c.nonzeroCycleSyndromes,
  contradictions:c.contradictoryReconvergences,globalPhasePotentialExists:c.globalPhasePotentialExists,gaugeFlipInvariant:c.gaugeFlipInvariant,
  exits:c.exits,outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer};
}
console.log('4x5 k3');const a=one(4,5,3);
console.log('5x4 k3');const b=one(5,4,3);
const frozen={c45k4:{cycleRank:40,zero:40,nonzero:0,contradictions:0},c54k4:{cycleRank:644,zero:619,nonzero:25,contradictions:12}};
const out={schema:'connect4.isomax.discovery.k_role_fixed_geometry.v1',date_author_local:'2026-09-29',warrant:'EW-005',
 rows:[a,b],frozen,
 contrasts:{
  c45:{k3:{cycleRank:a.cycleRank,nonzero:a.nonzero,contradictions:a.contradictions},k4:frozen.c45k4},
  c54:{k3:{cycleRank:b.cycleRank,nonzero:b.nonzero,contradictions:b.contradictions},k4:frozen.c54k4}
 },
 interpretation_guard:'Adaptive finite-case discrimination only; no universal k threshold is claimed.'};
fs.writeFileSync(new URL('./K_ROLE_FIXED_GEOMETRY_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW005_COMPLETE',rows:out.rows,contrasts:out.contrasts},null,2));
