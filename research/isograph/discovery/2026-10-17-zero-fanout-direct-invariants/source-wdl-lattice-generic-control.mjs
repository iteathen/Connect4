// Exhaustive finite three-valued lattice falsifier, independent of
// Connect4 source games. Verify every claimed exact action WDL from
// source-known anchors and certified full-future value-order edges.
// No strategic game state, WDL table or alternative continuation search.
import {sourceWDLOrderClosure} from './source-wdl-lattice-closure.mjs';
export function runSourceWDLLatticeGenericControl(){
 const labels=[0,1,2,3],pairKeys=[];
 for(let a=0;a<4;a++)for(let b=0;b<4;b++)if(a!==b)pairKeys.push([a,b]);
 const stats={schema:'connect4.source-WDL-interval-finite-lattice-control.v0_1',
  status:'PASS',directedWeakOrderGraphs:0,
  threeValuedWDLAssignmentsInspected:0,
  assignmentsCompatibleWithCertifiedOrder:0,
  knownSourceValueAnchorSubsetsValidated:0,
  generatedActionIntervalComparisons:0,
  labelsCertifiedExact:0,
  wrongNonExactIntervalBounds:0,
  inventedExactActionValues:0,
  contradictingSourceMutationCaught:false};
 for(let mask=0;mask<4096;mask++){
  const edges=[];
  for(let i=0;i<pairKeys.length;i++)if((mask&(1<<i))!==0)
   edges.push({lowerP0ValueAction:pairKeys[i][0],upperP0ValueAction:pairKeys[i][1]});
  stats.directedWeakOrderGraphs++;
  for(let v=0;v<81;v++){
   stats.threeValuedWDLAssignmentsInspected++;
   let x=v,values=Array.from({length:4},()=>{
    const y=x%3-1;x=Math.floor(x/3);return y;});
   if(edges.some(e=>values[e.lowerP0ValueAction]>values[e.upperP0ValueAction]))continue;
   stats.assignmentsCompatibleWithCertifiedOrder++;
   for(let anchored=0;anchored<16;anchored++){
    const known=labels.filter(c=>anchored&(1<<c)).map(c=>[c,values[c]]);
    const out=sourceWDLOrderClosure(labels,known,edges);
    stats.knownSourceValueAnchorSubsetsValidated++;
    for(const result of out.intervals){
     stats.generatedActionIntervalComparisons++;
     const truth=values[result.literalColumn];
     if(truth<result.lower||truth>result.upper){
      stats.wrongNonExactIntervalBounds++;
      throw Error('interval excluded actual WDL value '+mask+'/'+v+'/'+anchored);
     }
     if(result.exact){
      stats.labelsCertifiedExact++;
      if(result.exactValue!==truth){
       stats.inventedExactActionValues++;
       throw Error('WDL lattice exact source inference wrong');
      }
     }
    }
   }
  }
 }
 // A reversed source inequality is NOT sound: anchored P0 WDL values
 // -1,+1 disprove the false relation value(1)<=value(0).
 try{sourceWDLOrderClosure(labels,[[0,-1],[1,1]],
   [{lowerP0ValueAction:1,upperP0ValueAction:0}]);}
 catch(e){stats.contradictingSourceMutationCaught=true;}
 if(!stats.contradictingSourceMutationCaught)throw Error('false source edge mutation went unchallenged by independent anchors');
 return stats;
}
