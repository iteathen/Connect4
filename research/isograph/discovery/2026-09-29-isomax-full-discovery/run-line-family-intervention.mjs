import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';
const subsets=[["H"],["V"],["D"],["H","V"],["H","D"],["V","D"],["H","V","D"]];
function one(w,h,directions){
 const r=analyzeDirectResidualOrbitGraph({width:w,height:h,k:4,winningLineDirections:directions,
  nonterminalFrontierBlocker:true,moverFinalCapParity:true,measureLocalBranchClosure:false});
 const c=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit,d=r.deeperContinuationPhaseAudit;
 return {width:w,height:h,k:4,directions:[...directions],winningLineCount:r.winningLineCount,
  states:r.residualOrbitStates,classes:r.recursiveUnlabelledClasses,binaryGroups:d.binaryGroups,binaryEdges:d.binaryContinuationEdges,
  nonbinary:d.nonbinaryContinuationEdges,transporter:d.childTransporterEdges,erasure:d.childBranchErasureEdges,
  cycleRank:c.cycleRank,zero:c.zeroCycleSyndromes,nonzero:c.nonzeroCycleSyndromes,contradictions:c.contradictoryReconvergences,
  globalPhasePotentialExists:c.globalPhasePotentialExists,outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer};
}
const rows=[];
for(const dirs of subsets)for(const [w,h] of [[4,5],[5,4]]){
 console.log('line-family',w,h,dirs.join('+'));rows.push(one(w,h,dirs));
}
const bySubset=subsets.map(dirs=>{
 const key=dirs.join('+'),a=rows.find(x=>x.width===4&&x.directions.join('+')===key),b=rows.find(x=>x.width===5&&x.directions.join('+')===key);
 return {directions:dirs,c45:{lines:a.winningLineCount,cycleRank:a.cycleRank,nonzero:a.nonzero,contradictions:a.contradictions},
  c54:{lines:b.winningLineCount,cycleRank:b.cycleRank,nonzero:b.nonzero,contradictions:b.contradictions},
  obstructionContrast:a.nonzero!==b.nonzero||a.contradictions!==b.contradictions};
});
const baseline=bySubset.find(x=>x.directions.length===3);
if(!baseline||baseline.c45.nonzero!==0||baseline.c54.nonzero!==25||baseline.c54.contradictions!==12)
 throw new Error('full-family intervention must reproduce frozen baseline');
const obstructing=bySubset.filter(x=>x.c54.nonzero>0);
const minimalObstructing=obstructing.filter(x=>!obstructing.some(y=>y.directions.length<x.directions.length&&y.directions.every(z=>x.directions.includes(z))));
const out={schema:'connect4.isomax.discovery.line_family_intervention.v1',date_author_local:'2026-09-29',warrant:'EW-006',
 rows,bySubset,minimalObstructing,
 necessity:{
  H:!obstructing.some(x=>!x.directions.includes('H')),
  V:!obstructing.some(x=>!x.directions.includes('V')),
  D:!obstructing.some(x=>!x.directions.includes('D'))
 },
 interpretation_guard:'Counterfactual structural producer only. Family necessity/sufficiency is within this intervention and is not a standard-game theorem.'};
fs.writeFileSync(new URL('./LINE_FAMILY_INTERVENTION_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW006_COMPLETE',bySubset,minimalObstructing:out.minimalObstructing,necessity:out.necessity},null,2));
