// FROZEN WIDE CONTROL before run. Same source q and original physical WDL
// falsifier, larger matching budget and 6000 distinct real late roots.
// FROZEN pre-execution: compare OLD static whole-column transporter
// to TRANSITIVE union of SOURCE fixed-two-swap + global reflection
// on identical true7x6 first-win-stopped original q.
import {createOriginalSourceFixedReflectionWdlOrder} from './standard7x6-original-source-fixed-reflection-WDL-order.mjs';
import {createSourceTwoFixedTransformWdlExtremum} from './standard7x6-source-two-fixed-transform-WDL-extremum.mjs';
// FROZEN real ORIGINAL 7x6 source structural FALSIFIER (not source solver).
// Compare source direct ONE transposition per pair to historically
// qualified STATIC full-future column transport on SAME real legal q.
// No future WDL values in source; independent PHYSICAL recursive
// minimax only IF one old transport-proved weak WDL order lacks
// a certificate from the direct single-fixed-transposition rule.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createSourceFixedTwoColumnSwapWdlOrder} from './standard7x6-source-fixed-two-column-swap-WDL-order.mjs';
import {createEitherMoverExactTransport} from './either-mover-future-transport.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),geom={width:W,height:H,connect:K},
 core=createExactQCore(geom),
 fixed=createSourceFixedTwoColumnSwapWdlOrder(geom),
 mirror=createOriginalSourceFixedReflectionWdlOrder(geom),
 merged=createSourceTwoFixedTransformWdlExtremum(geom),
 full=createEitherMoverExactTransport(geom);
const inc=Array.from({length:N},()=>[]);let lines=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dx>=W||r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
  let G=0n,ids=[];
  for(let j=0;j<K;j++){let id=(r+j*dy)*W+c+j*dx;ids.push(id);G|=bit(c+j*dx,r+j*dy);}
  for(const id of ids)inc[id].push(G);lines++;
 }
if(lines!==69||core.lineCount!==69)throw Error('invalid real original winning-line count');
const blank=()=>({h:Array(W).fill(0),P:[0n,0n],n:0,history:'',terminal:null});
const legal=s=>s.h.flatMap((x,c)=>x<H?[c]:[]);
function move(s,c){
 if(s.terminal!==null||s.h[c]>=H)throw Error('illegal first-win stopped physical move');
 const p=s.n&1,r=s.h[c],id=r*W+c,h=s.h.slice(),P=s.P.slice();h[c]++;
 P[p]|=bit(c,r);
 const win=inc[id].some(G=>(P[p]&G)===G);
 return {h,P,n:s.n+1,history:s.history+String(c+1),
 terminal:win?(p===0?1:-1):s.n+1===N?0:null};
}
let seed=0x17070F7D>>>0;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
const oracleMemo=new Map();
const result={
 schema:'connect4.true7x6.fixed_swap_vs_nonenumerated_capacity_transporter_v0_1',
 frozenDate:'2026-10-17',board:{W,H,K},
 firstWinStoppedPhysicalGamesSampled:0,firstWinStoppedPhysicalStatesVisited:0,
 originalSourceStatesCompared:0,
 positiveFixedOneTranspositionEdges:0,
 fullTransportPositiveEdgeRecords:0,
 fullTransportOnlyWeakWDLEdges:0,
 fullTransportWithDifferentThanSwappedWitness:0,
 fullTransportWithExactSwapWitnessButDirectMissing:0,
 completedStaticColumnTransportPermutationsExploredByVALIDATOR:0,
 oldTransportBudgetPartialSourceRoots:0,
 noGravityValidQFirstWinViolation:0,
 originalPhysicalReferenceWDLCalls:0,
 originalPhysicalReferenceUniqueStates:0,
 physicallyValidatedOldOnlyEdgeCount:0,
 physicallyUnsoundTransportEdgeCount:0,
 firstOldOnlySourceWitness:null,firstLateOldOnlyPhysicallyChecked:null,
 noOldOnlyComparisonFoundBeforeBudget:false,
 comparisonTruncatedOriginalSourcePositions:false,
 status:'NOT_TESTED',finalSeed:null
};
function key(s){return s.P[0].toString(16)+'|'+s.P[1].toString(16);}
function WDL(s){
 result.originalPhysicalReferenceWDLCalls++;
 if(s.terminal!==null)return s.terminal;
 const k=key(s);if(oracleMemo.has(k))return oracleMemo.get(k);
 result.originalPhysicalReferenceUniqueStates++;
 let V=(s.n&1)===0?-1:+1;
 for(const c of legal(s)){
  const x=WDL(move(s,c));V=(s.n&1)===0?Math.max(V,x):Math.min(V,x);
 }
 oracleMemo.set(k,V);return V;
}
const seen=new Set(),MAX_SOURCE_Q=6000;
function inspect(s,frozen=false){
 if(s.terminal!==null)throw Error('first-win stopped original input required');
 result.firstWinStoppedPhysicalStatesVisited++;
 if(!frozen&&(s.n<34||legal(s).length<2))return;
 if(result.originalSourceStatesCompared>=MAX_SOURCE_Q){
  result.comparisonTruncatedOriginalSourcePositions=true;return;
 }
 const id=key(s);if(seen.has(id))return;seen.add(id);
 const q=core.fromPhysical({h:s.h,p0:s.P[0],p1:s.P[1]});
 const legalLabels=legal(s);
 if(!legalLabels.some((a,i)=>legalLabels.some((b,j)=>j>i&&s.h[a]===s.h[b])))return;
 result.originalSourceStatesCompared++;
 const simple=merged.compute(q,{maxFixedSubsetTests:140000,maxReflectedSubsetTests:140000});
 const elaborate=full.compute(q,{maxOperations:1000000,maxMs:120,maxRepresentatives:20000});
 result.positiveFixedOneTranspositionEdges+=simple.statistics.sourceUnionDistinctWeakP0WdlEdges;
 result.completedStaticColumnTransportPermutationsExploredByVALIDATOR+=elaborate.statistics.completeColumnPermutations;
 if(elaborate.status==='BUDGET_PARTIAL')result.oldTransportBudgetPartialSourceRoots++;
 const simpleSet=new Set(simple.sourceProvedWeakOriginalWDLInequalities.map(x=>
  x.lowerP0ValueOriginalLiteralAction+','+x.upperP0ValueOriginalLiteralAction));
 const rootLegal=legalLabels.map(z=>z+1),
  closure=new Map(rootLegal.map(z=>[z,new Set([z])]));
 for(const e of simple.sourceProvedWeakOriginalWDLInequalities)
  closure.get(e.lowerP0ValueOriginalLiteralAction).add(e.upperP0ValueOriginalLiteralAction);
 for(const pivot of rootLegal)for(const from of rootLegal)for(const to of rootLegal)
  if(closure.get(from).has(pivot)&&closure.get(pivot).has(to))
   closure.get(from).add(to);
 for(const pair of elaborate.pairs){
  if(!pair.actions||pair.actions.length!==2)continue;
  const [a,b]=pair.actions;
  const specs=[
   pair.firstNoHigher?[a,b,pair.firstToSecondPermutation]:null,
   pair.secondNoHigher?[b,a,pair.secondToFirstPermutation]:null
  ].filter(Boolean);
  for(const [lower,upper,permutation] of specs){
   result.fullTransportPositiveEdgeRecords++;
   if(simpleSet.has((lower+1)+','+(upper+1))||closure.get(lower+1).has(upper+1))continue;
   result.fullTransportOnlyWeakWDLEdges++;
   const expected=Array.from({length:W},(_,c)=>c);
   expected[a]=b;expected[b]=a;
   const isSwap=permutation&&permutation.every((c,i)=>c===expected[i]);
   if(isSwap)result.fullTransportWithExactSwapWitnessButDirectMissing++;
   else result.fullTransportWithDifferentThanSwappedWitness++;
   if(result.firstOldOnlySourceWitness===null||!result.firstLateOldOnlyPhysicallyChecked&&s.n>=36){
    let physicalAll=null;
    if(s.n>=36){
     physicalAll=legal(s).map(c=>[c+1,WDL(move(s,c))]);
     result.physicallyValidatedOldOnlyEdgeCount++;
     const map=new Map(physicalAll);
     if(map.get(lower+1)>map.get(upper+1)){
      result.physicallyUnsoundTransportEdgeCount++;
     }
    }
    const sourceOldOnly={
     originalLegalHistory:s.history,originalAbsolutePly:s.n,originalCurrentMover:s.n&1,
     h:s.h.slice(),originalLiteralLegalColumns:legalLabels.map(c=>c+1),
     sourceGeneratorCounts:[q.R0.length,q.R1.length],
     originalR0Masks:q.R0.map(m=>'0x'+m.toString(16)),
     originalR1Masks:q.R1.map(m=>'0x'+m.toString(16)),
     originalLowerP0ValueAction:lower+1,originalUpperP0ValueAction:upper+1,
     actualOldTransportPermutationZeroBased:permutation,
     actualOldTransportPermutationOriginalOneBased:permutation?.map(i=>i+1),
     sourceFixedSwapPermutationZeroBased:expected,
     sourceFixedSwapWeakWDLClauseSucceeded:false,
     fixedSwapSourceStatus:simple.status,
     oldTransportSourceStatus:elaborate.status,
     independentlyComputedPhysicalFirstActionWDL:physicalAll,
     oldTransportDirectionConfirmedByPhysical:
      physicalAll===null?null:new Map(physicalAll).get(lower+1)<=new Map(physicalAll).get(upper+1),
     oldSourceTransportPartialGeneratorProofNote:'OLD capacity-compatible whole-column program map, not a first-win game value query'
    };
    if(result.firstOldOnlySourceWitness===null)result.firstOldOnlySourceWitness=sourceOldOnly;
    if(s.n>=36&&!result.firstLateOldOnlyPhysicallyChecked)
     result.firstLateOldOnlyPhysicallyChecked=sourceOldOnly;
   }
  }
 }
}
for(const history of ['','4','44444','444444',
 '475234143513367623351115664414672762',
 '3154462116344525675723565411366431722']){
 let s=blank();for(const c of history)s=move(s,Number(c)-1);
 if(s.terminal!==null)throw Error('input fixed original prefix already terminal');
 inspect(s,true);
}
for(let i=0;i<6500;i++){
 result.firstWinStoppedPhysicalGamesSampled++;
 let s=blank();
 while(s.terminal===null){
  inspect(s);
  if(result.firstLateOldOnlyPhysicallyChecked)break;
  if(result.comparisonTruncatedOriginalSourcePositions)break;
  const futures=legal(s).map(c=>move(s,c)).filter(q=>q.terminal===null);
  if(!futures.length)break;
  s=futures[rand()%futures.length];
 }
 if(result.firstLateOldOnlyPhysicallyChecked||result.comparisonTruncatedOriginalSourcePositions)break;
}
result.finalSeed=seed;
result.noOldOnlyComparisonFoundBeforeBudget=result.fullTransportOnlyWeakWDLEdges===0;
result.comparisonAgainstTransitiveClosureOfTwoFixedSourceMaps=true;
result.status=result.physicallyUnsoundTransportEdgeCount?
 'HISTORICAL_SOURCE_WEAK_ORDER_CONTRADICTED_INDEPENDENT_PHYSICAL_WDL':
 result.firstOldOnlySourceWitness?
 'TRUE7X6_OLD_TRANSPORT_WDL_EDGE_NOT_DERIVABLE_FROM_FIXED_SWAP_AND_REFLECTION':
 'NO_TRANSPORT_ONLY_EDGE_FOUND_IN_BOUNDED_SOURCE_CORPUS';
console.log(JSON.stringify(result,null,2));
