// FROZEN matched ORIGINAL 7x6 physical independent two-column test matrix.
// 36 size combinations (A=1..6,B=1..6) after empty root, same 36 after
// genuine center-5 prefix 44444, and four 34-ply actual-root combinations.
// Source examines fixed owner projections ONLY; physical validator
// exhaustively enumerates event words for falsification, NEVER minimax.
import {createTwoChainIndependentOriginalPhysicalFalsifier} from './standard7x6-two-chain-independent-original-physical-falsifier.mjs';
import {createOriginalTwoChainPhaseBitset} from './standard7x6-source-two-chain-phase-bitset.mjs';
import {createOneChainSingletonPhaseRealizer} from './standard7x6-source-one-chain-singletons-phase-realizer.mjs';
export function runFrozenTwoChainOriginal7x6ExhaustiveControl(){
 const independent=createTwoChainIndependentOriginalPhysicalFalsifier();
 const source=createOriginalTwoChainPhaseBitset({width:7,height:6,connect:4});
 const prior=createOneChainSingletonPhaseRealizer({width:7,height:6,connect:4});
 const cases=[];
 for(let A=1;A<=6;A++)for(let B=1;B<=6;B++)
  cases.push({history:'',columnA:1,columnB:2,A,B});
 for(let A=1;A<=6;A++)for(let B=1;B<=6;B++)
  cases.push({history:'44444',columnA:1,columnB:2,A,B});
 const late='2532541156412471331416356736376672';
 for(let A=1;A<=2;A++)for(let B=1;B<=2;B++)
  cases.push({history:late,columnA:2,columnB:4,A,B});
 if(cases.length!==76)throw Error('must test exact frozen 76 original 7x6 configurations');
 const totals={originalTestCases:cases.length,originalPhysicalWins:69,
  physicalCompleteTwoColumnWordsEnumeratedForFalsification:0,
  binaryOwnerProjectionsExhaustivelyChecked:0,
  physicalFeasibleProjections:0,sourceDeclaredFeasibleProjections:0,
  sourceRejectedProjectionProfiles:0,
  sourceExactCausalFirstHeadMatches:0,
  sourceUniqueFixedProjectionHeadProfiles:0,sourceTwoHeadProfiles:0,
  sourceExactNonterminalBatchedQ:0,
  sourceOneFixedTerminalWinner:0,
  sourceBothTerminalPlayersRaceIncomplete:0,
  sourceFullDraw:0,
  sourceFalsePositive:0,sourceFalseNegative:0,sourcePhysicalMismatches:0,
  sourceFutureStrategicGameValueCalls:0,
  sourceFutureGameTreesOrAlternativeHypotheticalWordsConstructed:0,
  originalRootGameWDLQueried:false,
  completeAllBestLevel2InformationObtained:false};
 const perCase=[],firstDualRace=null,firstNonquotaDeadlock=null;
 for(const item of cases){
  const res=independent.verifyCase(item.history,item);
  perCase.push(res);
  totals.physicalCompleteTwoColumnWordsEnumeratedForFalsification+=res.wordCount;
  totals.binaryOwnerProjectionsExhaustivelyChecked+=res.binaryOwnerColorProfilesChecked;
  totals.physicalFeasibleProjections+=res.physicalOwnerPatternCount;
  totals.sourceDeclaredFeasibleProjections+=res.sourceFeasible;
  totals.sourceRejectedProjectionProfiles+=res.sourceNotRealizable;
  totals.sourceExactCausalFirstHeadMatches+=res.exactSourceFirstHeadMatches;
  totals.sourceUniqueFixedProjectionHeadProfiles+=res.sourceUniqueFirstHead;
  totals.sourceTwoHeadProfiles+=res.sourceMultipleFirstHeads;
  totals.sourceExactNonterminalBatchedQ+=res.sourceFeasibleNonterminalQ;
  totals.sourceOneFixedTerminalWinner+=res.sourceFeasibleOneFirstWinner;
  totals.sourceBothTerminalPlayersRaceIncomplete+=res.sourceFeasibleDualFirstWinRaceIncomplete;
  totals.sourceFullDraw+=res.sourceFullBoardDraw;
  totals.sourceFalsePositive+=res.phaseSourceFalsePositive;
  totals.sourceFalseNegative+=res.phaseSourceFalseNegative;
  totals.sourcePhysicalMismatches+=res.physicalFirstWinnerContradictions+res.sourceBatchedQContradictions;
  if(!firstDualRace&&res.firstDualCompletionWitness)
   firstDualRace={history:item.history,A:item.A,B:item.B,colors:res.firstDualCompletionWitness};
 }
 const emptyRoot=independent.root('').q;
 const mutual=source.compute(emptyRoot,{columnA:1,columnB:2,
  ownersA:[0,0],ownersB:[1,1]});
 if(mutual.status!=='SOURCE_FEASIBLE_EXACT_BATCH_NONTERMINAL_Q'||
    JSON.stringify(mutual.exactFixedProfileFirstHeadColumns)!=='[1]')
  throw Error('physical 1212 mutual phase supply not source-certified');
 const threeEventSource=prior.compute(emptyRoot,{chainColumn:2,L:2,
   singletonColumns:[1],chainOwners:[0,1],singletonOwners:[0]});
 const threeEventTwoChain=source.compute(emptyRoot,{columnA:2,columnB:1,
   ownersA:[0,1],ownersB:[0]});
 if(JSON.stringify(threeEventTwoChain.exactFixedProfileFirstHeadColumns)!=='[2]'||
   JSON.stringify(threeEventTwoChain.exactFixedProfileFirstHeadColumns)!==
    JSON.stringify(threeEventSource.oneSourceCanonicalGravityLegalSegment.slice(0,1)))
  throw Error('first head must equal preceding one-chain theorem');
 // Independently cross-check entire overlapping B=1 color profile family
 // against previously frozen source one-chain M theorem on exact original q.
 let priorOverlapOwnerProfiles=0,priorOverlapMismatches=0;
 for(let A=1;A<=6;A++)for(let mask=0;mask<2**(A+1);mask++){
  const colors=Array.from({length:A+1},(_,i)=>(mask>>i)&1);
  const x=colors.slice(0,A),y=[colors[A]];
  const recent=source.compute(emptyRoot,{columnA:4,columnB:1,ownersA:x,ownersB:y});
  const prev=prior.compute(emptyRoot,{chainColumn:4,L:A,singletonColumns:[1],
   chainOwners:x,singletonOwners:y});
  const a=recent.exactFixedProfileFirstHeadColumns,
   b=prev.status.startsWith('SOURCE_PROVEN_OWNER_PROJECTION_NOT_REALIZABLE')?[]:
      [4,1].filter(z=>{
       // Previous first-head theorem:
       const eps=x[0]^0;
       const M=prev.sourceMinimumSingletonPrefixPhaseTransitions;
       return z===4?eps===0:y[0]===0&&(eps===1||1>=M+2);
      }).sort((u,v)=>u-v);
  priorOverlapOwnerProfiles++;
  if(JSON.stringify(a)!==JSON.stringify(b)){
   priorOverlapMismatches++;
   throw Error('old single-chain M scalar vs new two-chain bitset contradiction');
  }
 }
 if(totals.physicalCompleteTwoColumnWordsEnumeratedForFalsification!==6850||
  totals.binaryOwnerProjectionsExhaustivelyChecked!==31788||
  totals.sourceFalsePositive||totals.sourceFalseNegative||totals.sourcePhysicalMismatches||
  priorOverlapMismatches)
  throw Error('frozen original7x6 complete matrix totals/controls disagree');
 for(let A=1;A<=6&&!firstNonquotaDeadlock;A++)
  for(let B=1;B<=6&&!firstNonquotaDeadlock;B++)
   for(let profile=0;profile<2**(A+B);profile++){
    const colors=Array.from({length:A+B},(_,k)=>(profile>>k)&1);
    const quota=[0,0];for(let k=0;k<A+B;k++)quota[k&1]++;
    const count=[colors.filter(x=>x===0).length,colors.filter(x=>x===1).length];
    if(String(quota)!==String(count))continue;
    const sx=source.compute(emptyRoot,{columnA:1,columnB:2,
      ownersA:colors.slice(0,A),ownersB:colors.slice(A)});
    if(sx.status==='SOURCE_PROVEN_OWNER_PROJECTION_NOT_REALIZABLE'){
     firstNonquotaDeadlock={A,B,ownersA:colors.slice(0,A),ownersB:colors.slice(A),
      quotas:quota,reason:sx.reason};break;
    }
   }
 return {schema:'connect4.original7x6.two_chain_bool_antidiagonal_phase_exhaustion_v0_1',
  date:'2026-10-18',
  status:'SOURCE_FIXED_OWNER_PROJECTION_AND_CAUSAL_HEADS_MATCH_INDEPENDENT_ORIGINAL_PHYSICAL',
  inputs:{twoColumns:[1,2],emptySizes:'1..6 each',canonicalPrefix:'44444',
   latePrefix:late,lateColumnPair:[2,4],lateSizes:'1..2 each'},
  totals,firstQuotaMatchingButJointPrefixInfeasible:firstNonquotaDeadlock,
  firstDualCompletionRaceCorrectlyUnresolved:firstDualRace,
  twoChainMutualPhaseSupply1212:{x:[0,0],y:[1,1],
   feasibleHead:mutual.exactFixedProfileFirstHeadColumns,
   oneSourceCanonicalWord:mutual.sourceConstructedOneCanonicalGravityWord},
  crosscheckPriorOneChainMScalar:{ownerProfiles:priorOverlapOwnerProfiles,
   mismatches:priorOverlapMismatches},
  perCase,
  qualitativeStrength:'SOURCE exact scheduling only; not a perfect-play WDL/best original move',
  originalCanonical44444OrdinaryPerfectWDL:'UNKNOWN',
  originalCanonical44444SourceBestMove:'INCOMPLETE',
  qualifiedGameTheoryAuthorityUnchanged:true,
  noSolverBranchMerge:true};
}
