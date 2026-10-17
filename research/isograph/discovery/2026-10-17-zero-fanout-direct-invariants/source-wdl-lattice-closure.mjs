// Exact source-certificate WDL interval propagation. NO game q
// successors/strategic continuations; generic finite chain -1<0<+1.
// An edge (a,b) is a source-proved full-future value inequality V(a)<=V(b).
// A known exact value can propagate monotonic min/max bounds through edges.
export function sourceWDLOrderClosure(legal,knownPairs,weakEdges) {
 if(!Array.isArray(legal)||new Set(legal).size!==legal.length||legal.length<1)
  throw Error('nonempty distinct legal literal labels required');
 const index=new Map(legal.map((x,i)=>[x,i]));
 const W=legal.length,lo=Array(W).fill(-1),hi=Array(W).fill(1);
 const stats={inputLabels:W,exactValueAnchors:0,
  sourceProvedWeakEdges:0,boundPropagations:0,
  fixedPointPasses:0,sourceGraphReachabilityChecks:0,
  gameFutureStatesEvaluated:0,
  strategicEvaluationFanout:0};
 for(const [label,v] of knownPairs){
  const i=index.get(label);
  if(i===undefined||![-1,0,1].includes(v))throw Error('unknown label/value source anchor');
  if(v<lo[i]||v>hi[i])throw Error('contradictory fixed source WDL anchors');
  lo[i]=v;hi[i]=v;stats.exactValueAnchors++;
 }
 const graph=Array.from({length:W},(_,i)=>
   Array.from({length:W},(_,j)=>i===j));
 const edges=[];
 for(const e of weakEdges){
  const a=index.get(e.lowerP0ValueAction),b=index.get(e.upperP0ValueAction);
  if(a===undefined||b===undefined)throw Error('source order references illegal action label');
  graph[a][b]=true;edges.push([a,b]);stats.sourceProvedWeakEdges++;
 }
 let changed=true;
 while(changed){
  changed=false;stats.fixedPointPasses++;
  if(stats.fixedPointPasses>6*W+1)throw Error('WDL interval propagation failed finite chain convergence');
  for(const [a,b] of edges){
   const bLo=Math.max(lo[b],lo[a]),aHi=Math.min(hi[a],hi[b]);
   if(bLo!==lo[b]){lo[b]=bLo;changed=true;stats.boundPropagations++;}
   if(aHi!==hi[a]){hi[a]=aHi;changed=true;stats.boundPropagations++;}
   if(lo[a]>hi[a]||lo[b]>hi[b])throw Error('source WDL bounds and dominance proof contradict');
  }
 }
 for(let k=0;k<W;k++)for(let i=0;i<W;i++)for(let j=0;j<W;j++){
  stats.sourceGraphReachabilityChecks++;
  if(graph[i][k]&&graph[k][j])graph[i][j]=true;
 }
 const intervals=legal.map((label,i)=>({
   literalColumn:label,lower:lo[i],upper:hi[i],exact:lo[i]===hi[i],
   exactValue:lo[i]===hi[i]?lo[i]:null}));
 return {schema:'connect4.source-wdl-lattice-closure.v0_1',
   intervals,allActionValuesExact:intervals.every(x=>x.exact),
   reachability:graph,statistics:stats,
   invariant:'Every interval contains the true unrestricted WDL for any values satisfying original source exact anchors and full-future weak-order edges. A value is exact only if all satisfying possibilities collapse to one point. Source-only, no future evaluation.'};
}
