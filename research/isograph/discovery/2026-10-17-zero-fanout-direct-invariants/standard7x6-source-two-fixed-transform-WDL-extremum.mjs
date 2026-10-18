// ORIGINAL q SOURCE-only WDL order from TWO predetermined transformations:
// (1) swap just two equal-height original first-action columns,
// (2) horizontally REFLECT the entire original board.
// NO search/enumeration of candidate whole-column permutations;
// NO future-game WDL evaluations or game successors. Complete source
// proof frozen before independent true7x6 physical control:
// docs/research/2026-10-17-fixed-transposition-plus-reflection-source-WDL-closure.md
import {createSourceFixedTwoColumnSwapWdlOrder} from './standard7x6-source-fixed-two-column-swap-WDL-order.mjs';
import {createOriginalSourceFixedReflectionWdlOrder} from './standard7x6-original-source-fixed-reflection-WDL-order.mjs';
export function createSourceTwoFixedTransformWdlExtremum({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
    K>Math.min(W,H)||W*H>42)throw Error('invalid true gravity Connect-K');
 const geometry={width:W,height:H,connect:K},
  two=createSourceFixedTwoColumnSwapWdlOrder(geometry),
  mirror=createOriginalSourceFixedReflectionWdlOrder(geometry);
 function compute(q,{maxFixedSubsetTests=120000,maxReflectedSubsetTests=150000}={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
    h.some(z=>!Number.isInteger(z)||z<0||z>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(z=>typeof z!=='bigint'||z<=0n))
   throw Error('current original first-win stopped normalized q expected');
  const n=h.reduce((s,x)=>s+x,0),p=n&1,
   legal=h.flatMap((z,c)=>z<H?[c+1]:[]);
  if(n>=W*H||!legal.length)throw Error('original terminal q rejected');
  const swap=two.compute(q,{maxStaticSubsetTests:maxFixedSubsetTests}),
   reflection=mirror.compute(q,{maxStaticSubsetTests:maxReflectedSubsetTests});
  const stats={
   sourceOriginalRank:n,mover:p,
   literalLegalOriginalColumns:legal.length,
   fixedSwapOriginalActionPairsCompared:
    swap.statistics.originalStaticLiteralActionPairsConsidered,
   fixedSwapOriginalRawGeneratorSubsetChecks:
    swap.statistics.exactOriginalGeneratorSubsetChecks,
   fixedReflectionOriginalRawGeneratorSubsetChecks:
    reflection.statistics.originalQRawGeneratorSubsetTests,
   fixedReflectionExactOriginalQFullGameAutomorphism:
    reflection.originalSourceFullMirrorAutomorphismProved,
   sourceFixedSwapP0WeakOrderEdges:
    swap.sourceProvedOriginalWeakWdlOrderEdges.length,
   sourceFixedReflectionP0WeakOrderEdges:
    reflection.sourceP0WdlWeakOrderEdges.length,
   sourceUnionDistinctWeakP0WdlEdges:0,
   sourceTransitiveClosureActionLabelBooleanOps:0,
   sourceRootBestMovesSelectedByUnion:0,
   sourceRootBestWasProvedByFixedSwapAlone:swap.status==='VALID_CONTINUATION',
   sourceRootBestWasProvedByReflectionAlone:reflection.status==='VALID_CONTINUATION',
   staticWholeColumnPermutationCandidatesEnumerated:0,
   staticColumnPermutationAssignmentNodes:0,
   futureGameQSuccessorObjectsConstructed:0,
   strategicFutureGameValueCalls:0,
   sourceFullGameValueUnknown:true
  };
  const edgeByKey=new Map();
  for(const e of swap.sourceProvedOriginalWeakWdlOrderEdges){
   const a=e.lowerP0ValueLiteralAction,b=e.upperP0ValueLiteralAction;
   edgeByKey.set(a+','+b,{
    lowerP0ValueOriginalLiteralAction:a,
    upperP0ValueOriginalLiteralAction:b,
    fixedOriginalTransformKind:'SWAP_ONLY_TWO_CURRENT_LEGAL_COLUMNS',
    sourceWitness:e
   });
  }
  for(const e of reflection.sourceP0WdlWeakOrderEdges){
   const a=e.lowerP0ValueOriginalLiteralAction,b=e.upperP0ValueOriginalLiteralAction;
   if(!edgeByKey.has(a+','+b))edgeByKey.set(a+','+b,{
    lowerP0ValueOriginalLiteralAction:a,upperP0ValueOriginalLiteralAction:b,
    fixedOriginalTransformKind:'FULL_ORIGINAL_HORIZONTAL_REFLECTION',
    sourceWitness:e
   });
  }
  stats.sourceUnionDistinctWeakP0WdlEdges=edgeByKey.size;
  const map=new Map(legal.map((c,i)=>[c,i])),M=legal.length,
   paths=Array.from({length:M},()=>Array(M).fill(false)),
   next=Array.from({length:M},()=>Array(M).fill(null));
  for(let i=0;i<M;i++){paths[i][i]=true;next[i][i]=i;}
  for(const e of edgeByKey.values()){
   const i=map.get(e.lowerP0ValueOriginalLiteralAction),
    j=map.get(e.upperP0ValueOriginalLiteralAction);
   if(i===undefined||j===undefined)
    throw Error('source fixed transform emitted nonlegal original column');
   paths[i][j]=true;next[i][j]=j;
  }
  for(let k=0;k<M;k++)for(let i=0;i<M;i++)for(let j=0;j<M;j++){
   stats.sourceTransitiveClosureActionLabelBooleanOps++;
   if(paths[i][k]&&paths[k][j]&&!paths[i][j]){
    paths[i][j]=true;next[i][j]=next[i][k];
   }
  }
  const best=legal.filter((a,i)=>legal.every((_,j)=>p===0?paths[j][i]:paths[i][j]));
  const classes=[],seen=new Set();
  for(let i=0;i<M;i++){
   if(seen.has(i))continue;
   const group=[];
   for(let j=0;j<M;j++)if(paths[i][j]&&paths[j][i]){
    seen.add(j);group.push(legal[j]);
   }
   classes.push(group);
  }
  if(!best.length)return{
   status:'INCOMPLETE',
   reason:'FIXED_SWAP_AND_REFLECTION_ORDER_GRAPH_LACKS_GLOBAL_CURRENT_MOVER_EXTREMUM',
   originalCurrentQFullReflectionAutomorphism:
    reflection.originalSourceFullMirrorAutomorphismProved,
   originalLegalLiteralColumns:legal,
   sourceActionEquivalenceClassesFromTwoFixedTransforms:classes,
   sourceProvedWeakOriginalWDLInequalities:[...edgeByKey.values()],
   selectedOriginalLiteralBestColumn:null,ordinaryRootP0RelativeValue:null,
   sourceFutureValuesQueried:0,statistics:stats
  };
  stats.sourceRootBestMovesSelectedByUnion=best.length;
  const chosen=best[0],t=map.get(chosen),cert=[];
  for(let i=0;i<M;i++){
   const a=p===0?i:t,b=p===0?t:i;
   const labels=[legal[a]];let now=a,remaining=0;
   while(now!==b){
    now=next[now][b];
    if(now===null||++remaining>M)throw Error('source fixed transform action order path missing');
    labels.push(legal[now]);
   }
   const originalEdges=[];
   for(let j=1;j<labels.length;j++){
    const e=edgeByKey.get(labels[j-1]+','+labels[j]);
    if(!e)throw Error('source transitive path missing certificate edge');
    originalEdges.push({lowerP0ValueOriginalLiteralAction:labels[j-1],
      upperP0ValueOriginalLiteralAction:labels[j],
      fixedTransformProofKind:e.fixedOriginalTransformKind});
   }
   cert.push({fromOriginalLiteralAction:labels[0],
    toOriginalLiteralAction:labels[labels.length-1],
    provenWeakP0WdlPath:labels,originalFixedProofEdges:originalEdges});
  }
  return {status:'VALID_CONTINUATION',
   kind:'SOURCE_QUALITATIVE_BEST_FROM_FIXED_SWAP_AND_HORIZ_REFLECTION_ONLY',
   mover:p,selectedOriginalLiteralBestColumn:chosen,
   ordinaryRootP0RelativeValue:null,rootBestOutcomeTier:null,
   allBestOriginalLiteralColumnsNotClaimed:true,
   sourceRootBestEvenWithoutWdlScalar:true,
   sourceRootBestWasProvedBySwapAlone:swap.status==='VALID_CONTINUATION',
   sourceRootBestWasProvedByReflectionAlone:reflection.status==='VALID_CONTINUATION',
   sourceCurrentQExactHorizontalReflection:
    reflection.originalSourceFullMirrorAutomorphismProved,
   originalLegalLiteralColumns:legal,
   sourceActionEquivalenceClassesFromTwoFixedTransforms:classes,
   sourceProvedWeakOriginalWDLInequalities:[...edgeByKey.values()],
   sourceBestDominatesAllOriginalLegalActionProof:cert,
   sourceFutureGameValuesIndependentlyComputed:0,
   statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
