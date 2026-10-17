// Source-only full-future WDL three-valued lattice closure including
// direct action interval guards from no-winline or certified static
// pairing response proofs. No game q successors or strategic futures.
import {sourceWDLOrderClosure} from './source-wdl-lattice-closure.mjs';
export function closeSourceWDLWithDefensiveBounds(legal,knownExact,sourceWeakEdges,sourceBoundSets){
 const first=sourceWDLOrderClosure(legal,knownExact,sourceWeakEdges);
 const byLabel=new Map(first.intervals.map((x,i)=>[x.literalColumn,i]));
 const lo=first.intervals.map(x=>x.lower),hi=first.intervals.map(x=>x.upper);
 const stats={sourceActionIntervalProofs:0,sourceLowerBoundStrengthenings:0,
  sourceUpperBoundStrengthenings:0,sourceWeakOrderPropagations:0,
  iterations:0,derivedFutureGamePositions:0,strategicFutureFanout:0};
 for(const intervals of sourceBoundSets){
  for(const x of intervals){
   const i=byLabel.get(x.literalColumn);
   if(i===undefined||![-1,0,1].includes(x.lower)||
    ![-1,0,1].includes(x.upper)||x.lower>x.upper)
    throw Error('invalid source full-future WDL bound');
   stats.sourceActionIntervalProofs++;
   if(x.lower>lo[i]){lo[i]=x.lower;stats.sourceLowerBoundStrengthenings++;}
   if(x.upper<hi[i]){hi[i]=x.upper;stats.sourceUpperBoundStrengthenings++;}
   if(lo[i]>hi[i])throw Error('contradictory source WDL value/order proof');
  }
 }
 const edges=sourceWeakEdges.map(x=>{
  const i=byLabel.get(x.lowerP0ValueAction),
        j=byLabel.get(x.upperP0ValueAction);
  if(i===undefined||j===undefined)throw Error('source WDL weak-order label missing');
  return [i,j];
 });
 let changed=true;
 while(changed){
  changed=false;stats.iterations++;
  if(stats.iterations>6*legal.length+1)throw Error('three-point WDL lattice failed convergence');
  for(const [i,j] of edges){
   const Lj=Math.max(lo[j],lo[i]),Ui=Math.min(hi[i],hi[j]);
   if(Lj!==lo[j]){lo[j]=Lj;changed=true;stats.sourceWeakOrderPropagations++;}
   if(Ui!==hi[i]){hi[i]=Ui;changed=true;stats.sourceWeakOrderPropagations++;}
   if(lo[i]>hi[i]||lo[j]>hi[j])throw Error('contradictory globally proven WDL constraints');
  }
 }
 const intervals=legal.map((c,i)=>({literalColumn:c,lower:lo[i],upper:hi[i],
   exact:lo[i]===hi[i],exactValue:lo[i]===hi[i]?lo[i]:null}));
 return {schema:'connect4.source-global-defensive-WDL-order-closure.v0_1',
  intervals,allActionValuesExact:intervals.every(x=>x.exact),
  reachability:first.reachability,
  statistics:{...first.statistics,...stats},
  sourceOnly:true,strategicFutureFanout:0};
}
