// Pure q=(h,R0,R1) original selected MULTI-column fixed OWNER projection:
// exact physically attainable placement-rank intervals for every target event,
// and a source SUFFICIENT original first-winner race proof when both players
// eventually complete a line. No game WDL/strategic child or alternate word
// valuations. Theorem FROZEN before physical falsification:
// docs/research/2026-10-18-multichain-event-rank-enclosures-and-guarded-first-winner.md
import {createOriginalMultichainPhaseConvolution} from './standard7x6-source-multichain-mixedradix-phase.mjs';
export function createOriginalMultichainRankRace({width:W,height:H,connect:K}){
 const base=createOriginalMultichainPhaseConvolution({width:W,height:H,connect:K});
 const bit=z=>1n<<BigInt(z),id=(c,r)=>r*W+c;
 function compute(q,{chains}={}){
  const prior=base.compute(q,{chains});
  if(prior.sourceFixedOwnerProfileFeasible!==true)
   return {status:prior.status,sourceFixedColorProfileFeasible:false,
    sourceExactEventPlacementRankIntervals:null,sourceRootWDL:null,
    sourceLevel2BestOriginalColumn:null,sourceAlternateGameValues:0};
  const r=chains.length,last=r-1,n=prior.originalRootPly,m=chains.map(c=>c.owners.length),
   T=m.reduce((a,b)=>a+b,0),width=prior.sourceStaticBitsetResourceWidth;
  const stride=Array(r).fill(0);let dim=1,terminalIndex=0;
  for(let d=0;d<last;d++){stride[d]=dim;terminalIndex+=m[d]*dim;dim*=m[d]+1;}
  if(dim!==width)throw Error('source mixed-radix width mismatch');
  const states=Array.from({length:width},(_,I)=>{
   const consumed=Array(last);let subtotal=0;
   for(let d=0;d<last;d++){
    consumed[d]=Math.floor(I/stride[d])%(m[d]+1);subtotal+=consumed[d];
   }
   return {consumed,subtotal};
  });
  const eligible=Array.from({length:T},()=>Array(r).fill(0n));
  let staticMaskedOriginalHeadChecks=0,staticResourcePositionsExamined=0;
  for(let k=0;k<T;k++)for(let I=0;I<width;I++){
   staticResourcePositionsExamined++;
   const state=states[I],lastUsed=k-state.subtotal;
   if(lastUsed<0||lastUsed>m[last])continue;
   const owner=(n+k)&1,mark=bit(I);
   for(let d=0;d<r;d++){
    const used=d===last?lastUsed:state.consumed[d];
    if(used>=m[d])continue;
    staticMaskedOriginalHeadChecks++;
    if(chains[d].owners[used]===owner)eligible[k][d]|=mark;
   }
  }
  const forward=Array(T+1).fill(0n),backward=Array(T+1).fill(0n);
  forward[0]=1n;backward[T]=bit(terminalIndex);
  for(let k=0;k<T;k++){
   let v=0n;
   for(let d=0;d<r;d++)v|=((forward[k]&eligible[k][d])<<BigInt(stride[d]));
   forward[k+1]=v;
  }
  for(let k=T-1;k>=0;k--){
   let v=0n;
   for(let d=0;d<r;d++)v|=((backward[k+1]>>BigInt(stride[d]))&eligible[k][d]);
   backward[k]=v;
  }
  if((forward[T]&bit(terminalIndex))===0n||(backward[0]&1n)===0n)
   throw Error('static general source phase feasibility / rank recomputation contradiction');
  const ranges=chains.map(ch=>ch.owners.map((owner,j)=>({
   originalLiteralColumn:ch.column,originalZeroBasedPhysicalID:id(ch.column-1,q.h[ch.column-1]+j),
   originalColumnRelativeOrdinal:j+1,owner,
   earliestRelativeRank:Infinity,latestRelativeRank:0})));
  let joinedOriginalPhysicalRankEdges=0;
  for(let k=0;k<T;k++)for(let I=0;I<width;I++){
   if((forward[k]&bit(I))===0n)continue;
   const state=states[I],lastUsed=k-state.subtotal;
   if(lastUsed<0||lastUsed>m[last])continue;
   for(let d=0;d<r;d++){
    const used=d===last?lastUsed:state.consumed[d];
    if(used>=m[d]||(eligible[k][d]&bit(I))===0n||
       (backward[k+1]&bit(I+stride[d]))===0n)continue;
    joinedOriginalPhysicalRankEdges++;
    const cell=ranges[d][used],rank=k+1;
    cell.earliestRelativeRank=Math.min(rank,cell.earliestRelativeRank);
    cell.latestRelativeRank=Math.max(rank,cell.latestRelativeRank);
   }
  }
  const allRanges=ranges.flat();
  if(allRanges.some(e=>!Number.isFinite(e.earliestRelativeRank)||
    e.latestRelativeRank<e.earliestRelativeRank))
   throw Error('valid colored original event has no placement rank realization');
  const winning=[0,1].map(p=>{
   const allowed=BigInt(prior.originalOwnerSegmentMaskHex[p]),
    original=p===0?q.R0:q.R1,completed=[];
   for(let i=0;i<original.length;i++){
    const G=original[i];
    if((G&~allowed)!==0n)continue;
    const covered=allRanges.filter(e=>(G&bit(e.originalZeroBasedPhysicalID))!==0n);
    if(!covered.length)throw Error('original owned winning generator not represented by any selected physical event');
    completed.push({originalSourceGeneratorIndex:i,
     sourceOriginalMaskHex:'0x'+G.toString(16),
     firstPossibleCompletionLower:Math.max(...covered.map(z=>z.earliestRelativeRank)),
     alwaysCompleteByUpper:Math.max(...covered.map(z=>z.latestRelativeRank))});
   }
   return {originalPlayer:p,sourceCompletedGeneratorCount:completed.length,
    firstCompletionLower:completed.length?Math.min(...completed.map(z=>z.firstPossibleCompletionLower)):null,
    firstCompletionUpper:completed.length?Math.min(...completed.map(z=>z.alwaysCompleteByUpper)):null,
    sourceGeneratorCompletionEnclosures:completed};
  });
  const [p0,p1]=winning;
  const shared={kind:'ORIGINAL_MULTICHAIN_FIXED_COLOR_EVENT_RANK_SOURCE',
   sourceOriginalRootPly:n,sourceSelectedColumnsAndOwnerWords:chains.map(x=>({column:x.column,owners:x.owners.slice()})),
   exactOriginalPhysicalEventRankIntervals:allRanges,
   sourceOpponentFirstWinCompletionIntervals:winning,
   sourceFixedColorFirstHeadColumns:prior.exactFixedProfileFirstHeadColumns,
   sourceOriginalRCounts:prior.originalSourceRCounts,
   sourceStaticBitsetResourceWidth:width,
   sourceStaticResourcePositionsExamined:staticResourcePositionsExamined,
   sourceStaticOwnerHeadChecks:staticMaskedOriginalHeadChecks,
   sourcePhysicalRankEdgesCertified:joinedOriginalPhysicalRankEdges,
   sourceNewAlternateHypotheticalWordsEvaluated:0,
   sourceStrategicallyInequivalentFutureWDLGamesEvaluated:0,
   sourceOriginalRootWDL:null,
   sourceLevel2BestOriginalColumn:null};
  if(p0.sourceCompletedGeneratorCount&&p1.sourceCompletedGeneratorCount){
   if(p0.firstCompletionUpper<p1.firstCompletionLower)
    return {status:'CERTIFIED_FIXED_PROFILE_P0_FIRST_WIN_MULTICHAIN_RANK_BOUNDS',
     sourceFixedProfileAllShufflesFirstWinner:0,...shared};
   if(p1.firstCompletionUpper<p0.firstCompletionLower)
    return {status:'CERTIFIED_FIXED_PROFILE_P1_FIRST_WIN_MULTICHAIN_RANK_BOUNDS',
     sourceFixedProfileAllShufflesFirstWinner:1,...shared};
   return {status:'SOURCE_DUAL_FIRST_WIN_RACE_STILL_INCOMPLETE',
    sourceFixedProfileAllShufflesFirstWinner:null,...shared};
  }
  return {status:'PRIOR_SOURCE_FIXED_SEGMENT_TERMINAL_CLASS_UNCHANGED',
   sourceFixedProfileAllShufflesFirstWinner:
    p0.sourceCompletedGeneratorCount?0:
    p1.sourceCompletedGeneratorCount?1:null,...shared};
 }
 return Object.freeze({compute});
}
