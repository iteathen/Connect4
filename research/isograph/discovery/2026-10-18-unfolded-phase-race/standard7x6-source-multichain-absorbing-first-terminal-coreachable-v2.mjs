// V2 CORRECTED exact ORIGINAL q first-terminal possibility mask under ONE externally fixed
// future physical owner-color allocation across selected gravity chains.
// The mixed-radix prefix-count BITSET absorbs P0/P1 first-winning transitions.
// NO complete hypothetical words, competing future game WDL, negamax,
// opponent-strategy enumeration, policy-tree or alternate q materialization.
// CRITICAL: each absorbed winner edge must be BACKWARD CO-REACHABLE to a COMPLETE\n// fixed future owner coloring; otherwise early terminal on a dead-end prefix\n// falsely counts as possible complete-profile first winner.\n// Historical v1 was falsified and retained immutable. Explicitly NONZERO\n// static colored resource-prefix combinatorial closure.
// Exact theorem frozen in:
// docs/research/2026-10-18-multichain-absorbing-first-terminal-backward-coreachability-repair.md
import {createOriginalMultichainPhaseConvolution} from './standard7x6-source-multichain-mixedradix-phase.mjs';
export function createOriginalMultichainAbsorbingFirstTerminalCoreachableV2({width:W,height:H,connect:K}){
 const phase=createOriginalMultichainPhaseConvolution({width:W,height:H,connect:K});
 const N=W*H,bit=z=>1n<<BigInt(z),id=(c,row)=>row*W+c;
 function compute(q,{chains}={}, {maxStaticResourceTransitions=350000}={}){
  const initial=phase.compute(q,{chains});
  const ops={staticResourcePrefixLayers:0,staticResourceIndexTests:0,
   staticHeadEligibilityTests:0,originalGeneratorCompletionThresholdTests:0,
   terminalSourceAbsorbingEdgesP0:0,terminalSourceAbsorbingEdgesP1:0,
   nonterminalBitsetTransitions:0,
   backwardFullProfileBitsetFusions:0,
   backwardPhaseEligibilityRootMaskChecks:0,
   sourceNonextendableColoredPrefixEdgesRejected:0,
   sourceCompleteHypotheticalWordsEnumerated:0,
   sourceIndependentStrategicallyInequivalentFutureGameWDLQueries:0,
   sourceOpponentPolicyOrStrategyTreeNodes:0,
   sourceAlternativeOriginalGameQChildrenMaterialized:0};
  if(initial.sourceFixedOwnerProfileFeasible!==true)
   return {status:initial.status,reason:initial.reason||null,
    sourceFixedColorProfileFeasible:false,exactPossibleFirstTerminalResults:null,
    ordinaryRootP0RelativeWDL:null,rootLevel2BestOriginalColumn:null,
    operations:ops};
  const r=chains.length,last=r-1,T=chains.reduce((a,c)=>a+c.owners.length,0),
   len=chains.map(x=>x.owners.length),n=initial.originalRootPly;
  let width=1,finalIndex=0;
  const stride=Array(r).fill(0);
  for(let d=0;d<last;d++){stride[d]=width;finalIndex+=len[d]*width;width*=len[d]+1;}
  if(width!==initial.sourceStaticBitsetResourceWidth)
   throw Error('original source mixed-radix resource width unexpectedly diverged');
  const estimate=width*(T+1)*r;
  if(!Number.isInteger(maxStaticResourceTransitions)||maxStaticResourceTransitions<1)
   throw Error('invalid static resource budget');
  if(estimate>maxStaticResourceTransitions)
   return {status:'INCOMPLETE_STATIC_COLORED_PREFIX_RESOURCE_BUDGET',
    estimatedStaticResourceOperations:estimate,allowedStaticResourceOperations:maxStaticResourceTransitions,
    sourceFixedColorProfileFeasible:true,
    exactPossibleFirstTerminalResults:null,
    ordinaryRootP0RelativeWDL:null,rootLevel2BestOriginalColumn:null,
    operations:ops};
  const states=Array.from({length:width},(_,index)=>{
   const counts=Array(last),sum={n:0};
   for(let d=0;d<last;d++){
    counts[d]=Math.floor(index/stride[d])%(len[d]+1);
    sum.n+=counts[d];
   }
   return {counts,sum:sum.n};
  });
  const originalPhysicalOwnerMask=initial.originalOwnerSegmentMaskHex.map(BigInt);
  const thresholds=[0,1].map(p=>{
   const R=p===0?q.R0:q.R1,valid=[];
   for(let gi=0;gi<R.length;gi++){
    const G=R[gi];
    if((G&~originalPhysicalOwnerMask[p])!==0n)continue;
    const threshold=Array(r).fill(0);
    for(let d=0;d<r;d++){
     const c=chains[d].column-1,base=q.h[c];
     for(let t=0;t<len[d];t++)
      if((G&bit(id(c,base+t)))!==0n)
       threshold[d]=t+1;
    }
    if(threshold.every(z=>z===0))
     throw Error('original nonterminal R generator must require future events');
    valid.push({generatorOriginalIndex:gi,minimumColumnPrefixCounts:threshold});
   }
   return valid;
  });
  // Precompute EXACT original fixed-owner full-color suffix feasibility
  // for EVERY static resource vector, without constructing future game q's.
  // Winning before completing a profile is a valid outcome of THIS fixed
  // complete target-colored word only if its prefix still has a legal
  // COUNTERFACTUAL suffix realizing all unplayed prescribed owner bits.
  const phaseEligibility=Array.from({length:T},()=>Array(r).fill(0n));
  for(let k=0;k<T;k++){
   const owner=(n+k)&1;
   for(let I=0;I<width;I++){
    const s=states[I],remaining=k-s.sum;
    if(remaining<0||remaining>len[last])continue;
    for(let d=0;d<r;d++){
     const used=d===last?remaining:s.counts[d];
     if(used>=len[d])continue;
     ops.backwardPhaseEligibilityRootMaskChecks++;
     if(chains[d].owners[used]===owner)phaseEligibility[k][d]|=bit(I);
    }
   }
  }
  const suffix=Array(T+1).fill(0n);
  suffix[T]=bit(finalIndex);
  for(let k=T-1;k>=0;k--){
   let v=0n;
   for(let d=0;d<r;d++){
    v|=((suffix[k+1]>>BigInt(stride[d]))&phaseEligibility[k][d]);
    ops.backwardFullProfileBitsetFusions++;
   }
   suffix[k]=v;
  }
  if((suffix[0]&1n)===0n)
   throw Error('previous exact phase feasibility source disagrees with V2 backward colored profile co-reachability');
  const live=Array(T+1).fill(0n);
  live[0]=1n;
  const firstWinSeen=[false,false],
   earliestWin=[null,null],latestWin=[null,null];
  for(let k=0;k<T;k++){
   ops.staticResourcePrefixLayers++;
   let next=0n;
   for(let I=0;I<width;I++){
    ops.staticResourceIndexTests++;
    if((live[k]&bit(I))===0n)continue;
    const s=states[I],lastCount=k-s.sum;
    if(lastCount<0||lastCount>len[last])
     throw Error('resource index held by nonterminal bitset with invalid last-column count');
    const counts=s.counts.concat(lastCount),p=(n+k)&1;
    for(let d=0;d<r;d++){
     ops.staticHeadEligibilityTests++;
     if(counts[d]>=len[d]||chains[d].owners[counts[d]]!==p)continue;
     // A locally valid colored HEAD may lead into a prefix that cannot
     // complete the prescribed GLOBAL owner profile. Discard that edge
     // BEFORE even counting its original win as a possible fixed-profile
     // FIRST terminal.
     const targetIndex=I+stride[d];
     if((suffix[k+1]&bit(targetIndex))===0n){
      ops.sourceNonextendableColoredPrefixEdgesRejected++;
      continue;
     }
     const prospective=counts.slice();prospective[d]++;
     let won=false;
     for(const G of thresholds[p]){
      ops.originalGeneratorCompletionThresholdTests++;
      if(G.minimumColumnPrefixCounts.every((minimum,e)=>prospective[e]>=minimum)){
       won=true;break;
      }
     }
     if(won){
      firstWinSeen[p]=true;
      if(p===0)ops.terminalSourceAbsorbingEdgesP0++;
      else ops.terminalSourceAbsorbingEdgesP1++;
      earliestWin[p]=earliestWin[p]===null?k+1:Math.min(earliestWin[p],k+1);
      latestWin[p]=latestWin[p]===null?k+1:Math.max(latestWin[p],k+1);
     }else{
      next|=bit(targetIndex);
      ops.nonterminalBitsetTransitions++;
     }
    }
   }
   live[k+1]=next;
  }
  const survivor=(live[T]&bit(finalIndex))!==0n;
  const terminalSet=[
   ...(firstWinSeen[0]?['P0_FIRST_WIN']:[]),
   ...(firstWinSeen[1]?['P1_FIRST_WIN']:[]),
   ...(survivor?['NO_FIRST_WIN_WITHIN_SEGMENT']:[])
  ];
  if(!terminalSet.length)
   throw Error('source owner-color allocation globally realizable but no terminal or surviving nonterminal path');
  const outcomes={
   P0_FIRST_WIN:firstWinSeen[0],
   P1_FIRST_WIN:firstWinSeen[1],
   NO_FIRST_WIN_WITHIN_SEGMENT:survivor
  };
  if(thresholds[0].length&&thresholds[1].length&&survivor)
   throw Error('profile fills a P0 and P1 source winline but source found no first winner on complete word');
  const status=
   survivor&&!firstWinSeen[0]&&!firstWinSeen[1]?'EXACT_FIXED_PROFILE_NO_FIRST_WIN_IN_SEGMENT':
   firstWinSeen[0]&&!firstWinSeen[1]&&!survivor?'EXACT_FIXED_PROFILE_P0_FIRST_WIN':
   firstWinSeen[1]&&!firstWinSeen[0]&&!survivor?'EXACT_FIXED_PROFILE_P1_FIRST_WIN':
   'EXACT_FIXED_PROFILE_MULTIPLE_FIRST_TERMINAL_POSSIBILITIES';
  return {status,kind:'ORIGINAL_MULTICHAIN_COLORED_SOURCE_ABSORBING_TERMINAL',
   sourceFixedColorProfileFeasible:true,
   originalRootPly:n,originalSourceRCounts:[q.R0.length,q.R1.length],
   chosenOriginalColumnColorWords:chains.map(x=>({column:x.column,owners:x.owners.slice()})),
   originalSelectedFutureEventCount:T,sourceStaticPrefixBitsetWidth:width,
   sourceOriginalCompletingGeneratorCounts:thresholds.map(v=>v.length),
   exactPossibleFirstTerminalResults:outcomes,
   exactPossibleTerminalLabels:terminalSet,
   sourceEarliestAndLatestFirstWinRelativePly:firstWinSeen.map((yes,p)=>
    yes?{player:p,earliest:earliestWin[p],latest:latestWin[p]}:null),
   sourceNoFirstWinnerAtFullOriginalBoard:survivor&&initial.afterOriginalHeights?.every(z=>z===H),
   sourceNonterminalReachableResourceLayersHex:width<=96?live.map(z=>'0x'+z.toString(16)):null,
   sourceCompleteTargetColorBackwardCoreachabilityHex:width<=96?suffix.map(z=>'0x'+z.toString(16)):null,
   sourceCorrectedRequiresFullFixedOwnerProfileCoreachability:true,
   originalSourceRootP0RelativeWDL:null,
   sourceLevel2BestOriginalColumn:null,
   sourcePreservesOppositeWinnerWithinSameOwnerProfile:true,
   sourceDoesNotEvaluateFutureGameWDL:true,operations:ops};
 }
 return Object.freeze({compute});
}
