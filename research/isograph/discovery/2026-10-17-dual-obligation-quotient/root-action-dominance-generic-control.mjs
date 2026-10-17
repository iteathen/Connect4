// Algebraic falsifier independent of Connect4: all directed P1 weak-value
// proof graphs on four actions and all 3^4 P0-relative WDL assignments
// satisfying every directed <= edge. Check SCCs, scalar-min reduction,
// omitted-action proof paths and complete tie-label transport.
import {quotientP1RootActionValueObligations} from './root-action-dominance-quotient.mjs';
export function runRootDominanceGenericControl(){
 const labels=[0,1,2,3],edgeSlots=[];
 for(let a=0;a<4;a++)for(let b=0;b<4;b++)if(a!==b)edgeSlots.push([a,b]);
 const report={schema:'connect4.root-scalar-quotient-generic-control.v0_1',
  status:'PASS',directedGraphsChecked:0,WDLVectorsInspected:0,
  vectorsConsistentWithWeakEdges:0,rootScalarMinimumMismatches:0,
  SCCValueTieMismatches:0,omissionPathWDLOrderMismatches:0,
  noValidValuationsGraphs:0,reducedGraphs:0,
  ordinaryMinProofControls:0,
  invalidReversedEdgeMutationRejected:false};
 for(let mask=0;mask<(1<<edgeSlots.length);mask++){
  const edges=new Set();
  for(let z=0;z<edgeSlots.length;z++)if(mask&(1<<z))edges.add(edgeSlots[z].join(':'));
  const pairs=[];
  for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)
   pairs.push({actions:[a,b],firstNoHigher:edges.has(a+':'+b),
     secondNoHigher:edges.has(b+':'+a),exactFutureActionMap:null,
     exactMapIsReflection:false,
     firstToSecondPermutation:null,secondToFirstPermutation:null});
  const source={legalP1Columns:labels,statistics:{operations:0},pairs};
  const out=quotientP1RootActionValueObligations(source);
  if(out.status!=='EXACT_SCALAR_VALUE_OBLIGATION_QUOTIENT')throw Error('generic quotient incomplete');
  report.directedGraphsChecked++;
  if(out.scalarRootValueEvaluationsNotNeeded.length)report.reducedGraphs++;
  let validInGraph=0;
  for(let enc=0;enc<81;enc++){
   let tmp=enc,values=[];
   for(let a=0;a<4;a++){values.push(tmp%3-1);tmp=Math.floor(tmp/3);}
   report.WDLVectorsInspected++;
   if(edgeSlots.some(([a,b])=>edges.has(a+':'+b)&&values[a]>values[b]))continue;
   validInGraph++;report.vectorsConsistentWithWeakEdges++;
   const minAll=Math.min(...values),
    minReps=Math.min(...out.scalarRootValueRepresentatives.map(a=>values[a]));
   if(minAll!==minReps)throw Error('wrong min under certified inequalities graph '+mask+'/'+enc);
   for(const group of out.fullWDLValueEquivalenceClasses)
    if(group.some(x=>values[x]!==values[group[0]]))
      throw Error('false SCC action value tie '+mask+'/'+enc);
   for(const proof of out.scalarRootEvaluationsNotNeeded)
    if(values[proof.retainedNoWorseLiteralColumn]>values[proof.omittedLiteralColumn])
      throw Error('incorrect omitted proof WDL order '+mask+'/'+enc);
   report.ordinaryMinProofControls++;
  }
  if(validInGraph===0)report.noValidValuationsGraphs++;
 }
 // Explicitly construct one *incorrectly oriented* mutation to ensure
 // edge polarity matters: source truth is V0=-1,V1=+1, false edge 1<=0
 // would let the graph drop action 0 and return wrong scalar min.
 const falseProof={legalP1Columns:[0,1],statistics:{operations:0},pairs:[
  {actions:[0,1],firstNoHigher:false,secondNoHigher:true,exactFutureActionMap:null,
   exactMapIsReflection:false,secondToFirstPermutation:null}]};
 const wrong=quotientP1RootActionValueObligations(falseProof);
 report.invalidReversedEdgeMutationRejected=
   Math.min(-1,+1)!==Math.min(...wrong.scalarRootValueRepresentatives.map(a=>a===0?-1:+1));
 if(!report.invalidReversedEdgeMutationRejected)throw Error('reversed weak-order mutation not caught');
 return report;
}
