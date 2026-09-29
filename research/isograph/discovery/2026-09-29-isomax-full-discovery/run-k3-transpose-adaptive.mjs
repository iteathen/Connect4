import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';
function lineCounts(w,h,k){
 const H=w>=k?(w-k+1)*h:0,V=h>=k?w*(h-k+1):0,D=(w>=k&&h>=k)?2*(w-k+1)*(h-k+1):0;
 return {horizontal:H,vertical:V,diagonal:D,total:H+V+D,horizontalMinusVertical:H-V};
}
function one(w,h,k,frontier,cap){
 const r=analyzeDirectResidualOrbitGraph({width:w,height:h,k,nonterminalFrontierBlocker:frontier,moverFinalCapParity:cap,measureLocalBranchClosure:false});
 const c=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit,d=r.deeperContinuationPhaseAudit;
 return {width:w,height:h,k,frontier,cap,cells:r.cells,lineCounts:lineCounts(w,h,k),winningLineCount:r.winningLineCount,
  states:r.residualOrbitStates,classes:r.recursiveUnlabelledClasses,binaryGroups:d.binaryGroups,binaryEdges:d.binaryContinuationEdges,
  cycleRank:c.cycleRank,zero:c.zeroCycleSyndromes,nonzero:c.nonzeroCycleSyndromes,contradictions:c.contradictoryReconvergences,
  topological:c.topologicalReconvergences,globalPhasePotentialExists:c.globalPhasePotentialExists,outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer};
}
const rows=[];
for(const [w,h] of [[3,5],[5,3],[4,4]])for(const frontier of [false,true])for(const cap of [false,true]){
 console.log('case',w,h,frontier,cap);rows.push(one(w,h,3,frontier,cap));
}
const paired=[];
for(const frontier of [false,true])for(const cap of [false,true]){
 const a=rows.find(x=>x.width===3&&x.height===5&&x.frontier===frontier&&x.cap===cap);
 const b=rows.find(x=>x.width===5&&x.height===3&&x.frontier===frontier&&x.cap===cap);
 paired.push({frontier,cap,sameCells:a.cells===b.cells,sameTotalLines:a.winningLineCount===b.winningLineCount,
  surplus:[a.lineCounts.horizontalMinusVertical,b.lineCounts.horizontalMinusVertical],
  cycleRank:[a.cycleRank,b.cycleRank],nonzero:[a.nonzero,b.nonzero],contradictions:[a.contradictions,b.contradictions],
  nonvacuous:[a.cycleRank>0,b.cycleRank>0],
  integrabilityDiffers:a.cycleRank>0&&b.cycleRank>0&&a.globalPhasePotentialExists!==b.globalPhasePotentialExists});
}
const out={schema:'connect4.isomax.discovery.k3_transpose_adaptive_extension.v1',date_author_local:'2026-09-29',warrant:'EW-004',
 rows,paired,nonvacuousRows:rows.filter(x=>x.cycleRank>0),
 coverage:{testedCells:[15,16],k:3,guardSettings:4,transposedPair:'3x5/5x3',balancedControl:'4x4'},
 interpretation_guard:'Adaptive exploratory evidence; zero-cycle cases cannot adjudicate syndrome orientation.'};
fs.writeFileSync(new URL('./K3_TRANSPOSE_ADAPTIVE_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW004_COMPLETE',paired,nonvacuous:out.nonvacuousRows.map(x=>({w:x.width,h:x.height,frontier:x.frontier,cap:x.cap,cycleRank:x.cycleRank,nonzero:x.nonzero}))},null,2));
