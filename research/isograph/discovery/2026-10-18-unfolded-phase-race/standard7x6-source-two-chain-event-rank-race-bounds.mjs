// ORIGINAL q-only source: exact per-event placement rank intervals across ALL
// schedules compatible with ONE prescribed two-column colored-event projection.
// Sufficient interval-separated FIXED-PROFILE FIRST WINNER proof when both
// players would complete winning source generators. NO future WDL queries,
// NO enumerating alternative words or opponent response-policy trees.
// Theorem frozen in docs/research/2026-10-18-two-chain-causal-event-rank-interval-first-win-race-certificate.md
import {createOriginalTwoChainPhaseBitset} from './standard7x6-source-two-chain-phase-bitset.mjs';
export function createOriginalTwoChainEventRankRaceBounds({width:W,height:H,connect:K}){
 const base=createOriginalTwoChainPhaseBitset({width:W,height:H,connect:K});
 const bit=i=>1n<<BigInt(i),id=(c,r)=>r*W+c;
 function compute(q,profile){
  const previous=base.compute(q,profile);
  if(!previous.sourceFixedColorProjectionFeasible)
   return {status:previous.status,originalFixedProfileFeasible:false,
    exactOriginalEventRankIntervals:null,sourceNoAlternativeFutureWordValuations:true,
    rootOrdinaryWDL:null,rootLevel2BestOriginalColumn:null};
  const A=previous.A,B=previous.B,T=A+B,n=previous.originalRootPly,
   cA=previous.columnA,cB=previous.columnB,ownerA=previous.inputOriginalColumnOwnerBitsA,
   ownerB=previous.inputOriginalColumnOwnerBitsB;
  const Amasks=previous.sourceAntidiagonalAEligibleHex.map(BigInt);
  const Bmasks=previous.sourceAntidiagonalBEligibleHex.map(BigInt);
  const suffix=previous.sourceBackwardSuffixViabilityHex.map(BigInt);
  const prefix=Array(T+1).fill(0n);
  prefix[0]=1n;
  for(let k=0;k<T;k++)
   prefix[k+1]=((prefix[k]&Amasks[k])<<1n)|(prefix[k]&Bmasks[k]);
  if((prefix[T]&bit(A))===0n||(suffix[0]&1n)===0n)
   throw Error('two independently calculated source phase feasibility passes disagree');
  const aBounds=Array.from({length:A},(_,j)=>({column:cA,relativeEventOrdinal:j+1,
    originalPhysicalCellID:id(cA-1,q.h[cA-1]+j),owner:ownerA[j],
    minRelativePlacementRank:Infinity,maxRelativePlacementRank:0}));
  const bBounds=Array.from({length:B},(_,j)=>({column:cB,relativeEventOrdinal:j+1,
    originalPhysicalCellID:id(cB-1,q.h[cB-1]+j),owner:ownerB[j],
    minRelativePlacementRank:Infinity,maxRelativePlacementRank:0}));
  let staticCompatiblePrefixSuffixEventEdgeChecks=0,attainableRankEdges=0;
  for(let k=0;k<T;k++){
   for(let i=Math.max(0,k-B);i<=Math.min(A,k);i++){
    if((prefix[k]&bit(i))===0n)continue;
    const j=k-i,mark=bit(i);
    if(i<A){
     staticCompatiblePrefixSuffixEventEdgeChecks++;
     if((Amasks[k]&mark)!==0n&&(suffix[k+1]&bit(i+1))!==0n){
      const e=aBounds[i],rank=k+1;attainableRankEdges++;
      e.minRelativePlacementRank=Math.min(rank,e.minRelativePlacementRank);
      e.maxRelativePlacementRank=Math.max(rank,e.maxRelativePlacementRank);
     }
    }
    if(j<B){
     staticCompatiblePrefixSuffixEventEdgeChecks++;
     if((Bmasks[k]&mark)!==0n&&(suffix[k+1]&mark)!==0n){
      const e=bBounds[j],rank=k+1;attainableRankEdges++;
      e.minRelativePlacementRank=Math.min(rank,e.minRelativePlacementRank);
      e.maxRelativePlacementRank=Math.max(rank,e.maxRelativePlacementRank);
     }
    }
   }
  }
  const interval=aBounds.concat(bBounds);
  if(interval.some(e=>!Number.isFinite(e.minRelativePlacementRank)||
   e.maxRelativePlacementRank<e.minRelativePlacementRank))
   throw Error('every prescribed event in feasible profile must have a rank interval');
  const completion=[0,1].map(p=>{
   const wanted=BigInt(previous.sourcePhysicalEventAllocationMasksHex[p]);
   const R=p===0?q.R0:q.R1,lines=[];
   for(let i=0;i<R.length;i++){
    const G=R[i];
    if((G&~wanted)!==0n)continue;
    const events=interval.filter(e=>(G&bit(e.originalPhysicalCellID))!==0n);
    if(!events.length)throw Error('original source G supposedly completed with no segment cells');
    lines.push({originalSourceGeneratorIndex:i,originalRequirementMaskHex:'0x'+G.toString(16),
     minGuaranteedCompletionRank:Math.max(...events.map(e=>e.minRelativePlacementRank)),
     maxGuaranteedCompletionRank:Math.max(...events.map(e=>e.maxRelativePlacementRank))});
   }
   return {p,completedOriginalGeneratorCount:lines.length,
    earliestPossibleFirstCompletionLower:lines.length?
      Math.min(...lines.map(e=>e.minGuaranteedCompletionRank)):null,
    guaranteedEarliestCompletionUpper:lines.length?
      Math.min(...lines.map(e=>e.maxGuaranteedCompletionRank)):null,
    completedSourceGeneratorsWithRankEnclosures:lines};
  });
  const [c0,c1]=completion;
  const common={
   kind:'SOURCE_ORIGINAL_TWO_CHAIN_COMPLETE_COLORED_PHASE_RANK_ENCLOSURE',
   sourceOriginalPly:n,
   sourceFixedOwnerProfileHeadColumns:previous.exactFixedProfileFirstHeadColumns,
   sourceUnderlyingFixedProfileStatus:previous.status,
   exactOriginalEventRankIntervals:interval,
   staticOriginalLineCompletionTimeEnclosures:completion,
   sourceForwardPrefixViabilityHex:prefix.map(m=>'0x'+m.toString(16)),
   sourceBackwardSuffixViabilityHex:previous.sourceBackwardSuffixViabilityHex,
   staticCompatiblePrefixSuffixEventEdgeChecks,staticAttainableRankEdges:attainableRankEdges,
   sourceOriginalRootWDL:null,sourceLevel2BestOriginalColumn:null,
   sourceAlternativeFutureGameWDLQueries:0,
   sourceCounterfactualCompleteWordsEnumerated:0,
   sourceAlternateStrategicFutureQStatesEvaluated:0,
   sourceOnlyOneFixedOwnerColorProjectionAnalyzed:true};
  if(c0.completedOriginalGeneratorCount&&c1.completedOriginalGeneratorCount){
   if(c0.guaranteedEarliestCompletionUpper<c1.earliestPossibleFirstCompletionLower)
    return {status:'CERTIFIED_FIXED_PROFILE_P0_FIRST_WIN_UNDER_ALL_COLORED_SHUFFLES',
     fixedOwnerProjectionUnavoidableFirstWinner:0,
     sourceIntervalStrictGap:c1.earliestPossibleFirstCompletionLower-c0.guaranteedEarliestCompletionUpper,
     ...common};
   if(c1.guaranteedEarliestCompletionUpper<c0.earliestPossibleFirstCompletionLower)
    return {status:'CERTIFIED_FIXED_PROFILE_P1_FIRST_WIN_UNDER_ALL_COLORED_SHUFFLES',
     fixedOwnerProjectionUnavoidableFirstWinner:1,
     sourceIntervalStrictGap:c0.earliestPossibleFirstCompletionLower-c1.guaranteedEarliestCompletionUpper,
     ...common};
   return {status:'SOURCE_FEASIBLE_DUAL_FIRST_WIN_RACE_INTERVAL_INCOMPLETE',
    fixedOwnerProjectionUnavoidableFirstWinner:null,...common};
  }
  return {status:'UNCHANGED_SINGLE_OR_NO_OWNER_TERMINAL_SOURCE_CLASS',
   fixedOwnerProjectionUnavoidableFirstWinner:
    c0.completedOriginalGeneratorCount?0:
    c1.completedOriginalGeneratorCount?1:null,
   ...common};
 }
 return Object.freeze({compute});
}
