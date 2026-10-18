// Three DETERMINISTIC original-q source weak-WDL order maps: one fixed
// equal-height 2-column swap, one fixed full reflection, and one
// owner-tagged incidence-footprint ranked column map per ordered pair.
// No alternative mapping enumeration, future game WDL values or
// speculative moves. Frozen mathematical theorem:
// docs/research/2026-10-18-three-deterministic-original-q-maps-WDL-order-closure.md
import {createSourceFixedTwoColumnSwapWdlOrder} from './standard7x6-source-fixed-two-column-swap-WDL-order.mjs';
import {createOriginalSourceFixedReflectionWdlOrder} from './standard7x6-original-source-fixed-reflection-WDL-order.mjs';
import {createDeterministicFootprintWdlSource} from './standard7x6-source-deterministic-column-footprint-WDL-order.mjs';
export function createThreeDeterministicWdlExtremum({width:W,height:H,connect:K}){
 const geometry={width:W,height:H,connect:K},N=W*H;
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||K>Math.min(W,H)||N>42)
  throw Error('invalid original gravity board geometry');
 const swap=createSourceFixedTwoColumnSwapWdlOrder(geometry),
  mirror=createOriginalSourceFixedReflectionWdlOrder(geometry),
  footprint=createDeterministicFootprintWdlSource(geometry);
 function compute(q,{maxFixedSubsetTests=150000,
  maxMirrorSubsetTests=150000,maxFootprintSubsetTests=300000}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
   q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1)||
   [...q.R0,...q.R1].some(x=>typeof x!=='bigint'||x<=0n))
   throw Error('expected current original nonterminal q with residual families');
  const n=q.h.reduce((s,x)=>s+x,0),p=n&1,
    legal=q.h.flatMap((x,c)=>x<H?[c+1]:[]);
  if(n>=N||!legal.length)throw Error('not original first-win-stopped nonterminal');
  const s=swap.compute(q,{maxStaticSubsetTests:maxFixedSubsetTests}),
   r=mirror.compute(q,{maxStaticSubsetTests:maxMirrorSubsetTests}),
   f=footprint.compute(q,{maxSubsetTests:maxFootprintSubsetTests});
  // Only completed positive SOURCE edges are used. Resource-incomplete
  // sub-operators may omit proofs, never fabricate inequalities.
  const edges=new Map(),count={swap:0,reflection:0,footprint:0};
  function add(a,b,kind,proof){
   if(!legal.includes(a)||!legal.includes(b)||a===b)
    throw Error('source component emitted an illegal current action order edge');
   const key=a+','+b;
   if(!edges.has(key))edges.set(key,{lowerP0RelativeAction:a,upperP0RelativeAction:b,
    proofKinds:[],witnesses:[]});
   const e=edges.get(key);
   e.proofKinds.push(kind);e.witnesses.push(proof);count[kind]++;
  }
  for(const e of s.sourceProvedOriginalWeakWdlOrderEdges)
   add(e.lowerP0ValueLiteralAction,e.upperP0ValueLiteralAction,'swap',e);
  for(const e of r.sourceP0WdlWeakOrderEdges)
   add(e.lowerP0ValueOriginalLiteralAction,e.upperP0ValueOriginalLiteralAction,'reflection',e);
  const fEdges=f.sourceProvedWeakP0RelativeActionEdges??f.weakEdgesProvedBeforeGuard??[];
  for(const e of fEdges)
   add(e.sourceLowerP0ValueOriginalLiteralColumn,
       e.sourceUpperP0ValueOriginalLiteralColumn,'footprint',e);
  const M=legal.length,idx=new Map(legal.map((a,i)=>[a,i])),
   reach=Array.from({length:M},()=>Array(M).fill(false)),
   next=Array.from({length:M},()=>Array(M).fill(null));
  for(let i=0;i<M;i++){reach[i][i]=true;next[i][i]=i;}
  for(const e of edges.values()){
   const i=idx.get(e.lowerP0RelativeAction),j=idx.get(e.upperP0RelativeAction);
   reach[i][j]=true;next[i][j]=j;
  }
  let transitive=0;
  for(let k=0;k<M;k++)for(let i=0;i<M;i++)for(let j=0;j<M;j++){
   transitive++;
   if(reach[i][k]&&reach[k][j]&&!reach[i][j]){
    reach[i][j]=true;next[i][j]=next[i][k];
   }
  }
  const good=legal.filter((_,i)=>legal.every((__,j)=>p===0?reach[j][i]:reach[i][j]));
  const classes=[],seen=new Set();
  for(let i=0;i<M;i++)if(!seen.has(i)){
   const one=[];for(let j=0;j<M;j++)if(reach[i][j]&&reach[j][i]){
    seen.add(j);one.push(legal[j]);
   }
   classes.push(one);
  }
  const stats={
   sourceOriginalPly:n,mover:p,legalOriginalLiteralColumnCount:M,
   sourceSwapProvedEdges:count.swap,
   sourceReflectionProvedEdges:count.reflection,
   sourceFootprintProvedEdges:count.footprint,
   sourceDistinctQualifiedWeakWdlOrderEdges:edges.size,
   sourceStaticTwoColumnSwapSubsetTests:s.statistics.exactOriginalGeneratorSubsetChecks,
   sourceStaticReflectionSubsetTests:r.statistics.originalQRawGeneratorSubsetTests,
   sourceStaticFootprintSubsetTests:f.statistics.exactSourceGeneratorSubsetTests,
   deterministicFootprintOneMapPerCompatibleActionPair:
    f.statistics.singleCandidateSourceColumnMapsConstructed,
   originalColumnPermutationMappingCandidatesEnumerated:0,
   sourceGameFutureValuesIndependentlyCalculated:0,
   futureStrategicGameSuccessorQConstructed:0,
   sourceBooleanLabelReachabilityTests:transitive,
   sourceFullRootOrdinaryWdlKnown:false,
   sourceComponentStandaloneStatuses:{
    swap:s.status,reflection:r.status,footprint:f.status},
   sourceAllComponentsCompletedWithoutBudgetExhaustion:
    !s.statistics.sourceBudgetIncomplete&&
    !r.statistics.staticSourceMaskBudgetIncomplete&&
    !f.statistics.sourceStaticGuardExceeded
  };
  const base={
   mover:p,originalLegalLiteralColumns:legal,
   originalSourceQReflectionInvariant:
    r.originalSourceFullMirrorAutomorphismProved===true,
   certifiedOriginalWdlEqualityClasses:classes,
   sourceProvedWeakP0RelativeActionEdges:[...edges.values()],
   selectedOriginalLiteralBestAction:good[0]??null,
   ordinaryRootValueP0Relative:null,
   exactRootOutcomeTier:null,
   sourceFutureGameValuesEvaluated:0,
   sourceColumnPermutationEnumerationPerformed:false,
   statistics:stats
  };
  if(!good.length)return {status:'INCOMPLETE',
   reason:'NO_GLOBAL_CURRENT_MOVER_WDL_ORDER_EXTREMUM_FROM_THREE_DETERMINISTIC_SOURCE_MAPS',
   ...base};
  const chosen=good[0],target=idx.get(chosen),cert=[];
  for(let i=0;i<M;i++){
   const first=p===0?i:target,last=p===0?target:i;
   const labels=[legal[first]],proof=[];let at=first;
   for(let step=0;at!==last;step++){
    if(step>M)throw Error('source action order transit path overflow');
    const hop=next[at][last];
    if(hop===null)throw Error('source action order lost a positive path');
    const edge=edges.get(legal[at]+','+legal[hop]);
    if(!edge)throw Error('source transitive order proof lacks original edge');
    proof.push({lowerP0RelativeAction:legal[at],upperP0RelativeAction:legal[hop],
     exactSourceProofKinds:edge.proofKinds});
    at=hop;labels.push(legal[at]);
   }
   cert.push({fromOriginalLiteral:labels[0],toOriginalLiteral:labels[labels.length-1],
    originalWeakWdlPath:labels,sourceEdgeProofs:proof});
  }
  return {status:'VALID_CONTINUATION',
   kind:'SOURCE_THREE_DETERMINISTIC_MAPS_SCALAR_FREE_BEST_ACTION',
   bestMoveProofsVsEveryLegalFirstMove:cert,
   componentSourceBestStatus:{
    fixedSwap:s.status,fixedReflection:r.status,deterministicFootprint:f.status},
   rootActionOptimalButWdlUnknown:true,
   completeLevel2BestSetNotClaimed:true,
   ...base
  };
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
