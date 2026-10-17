// Independent generic finite-lattice falsifier: prove exact root min/max
// and COMPLETE tied-optimal labelled moves without requiring exact numeric
// outcomes of strictly inferior actions. Source intervals are derived from
// certified exact anchors / weak WDL inequalities only.
import {sourceWDLOrderClosure} from './source-wdl-lattice-closure.mjs';
import {certifyOptimalSetFromSourceIntervals} from './source-optimal-set-separation.mjs';
export function runGenericOptimalSetSeparationControl(){
 const labels=[0,1,2,3],directed=[];
 for(let a=0;a<4;a++)for(let b=0;b<4;b++)if(a!==b)directed.push([a,b]);
 const counts={schema:'connect4.optimal-set-interval-separation-generic-control.v0_1',
  status:'PASS',directedWeakWDLOrderGraphs:0,
  independentThreePointActionValueVectors:0,
  orderCompatibleReferenceActionValueVectors:0,
  sourceAnchorSubsets:0,
  moverOptimalSetMembershipChecks:0,
  exactRootAndOptimalMoveCertificates:0,
  exactCertificatesWithInferiorUnfixedNumericWDL:0,
  wrongRootWDLValues:0,wrongCompleteTieSets:0,
  unsupportedNumericWDLFabrications:0};
 for(let graph=0;graph<4096;graph++){
  const edges=[];
  for(let j=0;j<directed.length;j++)if(graph&(1<<j))
   edges.push({lowerP0ValueAction:directed[j][0],
      upperP0ValueAction:directed[j][1]});
  counts.directedWeakWDLOrderGraphs++;
  for(let val=0;val<81;val++){
   let bits=val;
   const values=Array.from({length:4},()=>{
    const n=(bits%3)-1;bits=Math.floor(bits/3);return n;});
   counts.independentThreePointActionValueVectors++;
   if(edges.some(e=>values[e.lowerP0ValueAction]>values[e.upperP0ValueAction]))continue;
   counts.orderCompatibleReferenceActionValueVectors++;
   for(let anchors=0;anchors<16;anchors++){
    const k=labels.filter(c=>anchors&(1<<c)).map(c=>[c,values[c]]);
    const ranges=sourceWDLOrderClosure(labels,k,edges);
    counts.sourceAnchorSubsets++;
    for(const mover of [0,1]){
     const cert=certifyOptimalSetFromSourceIntervals(ranges.intervals,mover);
     counts.moverOptimalSetMembershipChecks++;
     if(cert.status!=='EXACT_ROOT_WDL_AND_COMPLETE_OPTIMAL_SET_WITH_POSSIBLE_INFERIOR_INTERVALS')
      continue;
     counts.exactRootAndOptimalMoveCertificates++;
     const actual=mover===0?Math.max(...values):Math.min(...values);
     const best=labels.filter(c=>values[c]===actual);
     if(cert.exactRootWDL!==actual){
      counts.wrongRootWDLValues++;throw Error('false exact root value');
     }
     if(JSON.stringify(cert.completeOptimalLiteralMoves)!==JSON.stringify(best)){
      counts.wrongCompleteTieSets++;throw Error('false exact full optimal action set');
     }
     if(cert.inferiorActionsWhoseNumericWDLRemainsUnknown.length)
      counts.exactCertificatesWithInferiorUnfixedNumericWDL++;
    }
   }
  }
 }
 return counts;
}
