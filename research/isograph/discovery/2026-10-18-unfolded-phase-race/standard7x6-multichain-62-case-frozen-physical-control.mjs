// 62 predeclared original W7 H6 K4 three-column physical FALSIFIERS,
// frozen before initial execution. Source mixed-radix bitset evaluates ONE
// specified color profile and never enumerates words/game strategies.
// Physical oracle deliberately enumerates distinct fixed-event shuffles ONLY
// to validate source feasibility, complete first-head sets and direct q.
import {createOriginalMultichainIndependentPhysicalControl} from './standard7x6-multichain-independent-original-physical-falsifier.mjs';
import {createOriginalMultichainPhaseConvolution} from './standard7x6-source-multichain-mixedradix-phase.mjs';
import {createOriginalTwoChainPhaseBitset} from './standard7x6-source-two-chain-phase-bitset.mjs';
export function runFrozenOriginalThreeChainExhaustiveControl(){
 const physical=createOriginalMultichainIndependentPhysicalControl();
 const source=createOriginalMultichainPhaseConvolution({width:7,height:6,connect:4});
 const prior=createOriginalTwoChainPhaseBitset({width:7,height:6,connect:4});
 const cases=[];
 for(const history of ['','44444'])
  for(let A=1;A<=3;A++)for(let B=1;B<=3;B++)for(let C=1;C<=3;C++)
   cases.push({history,chains:[
    {column:1,length:A},{column:2,length:B},{column:3,length:C}]});
 const late='2532541156412471331416356736376672';
 for(let A=1;A<=2;A++)for(let B=1;B<=2;B++)for(let C=1;C<=2;C++)
  cases.push({history:late,chains:[
    {column:2,length:A},{column:4,length:B},{column:5,length:C}]});
 if(cases.length!==62)throw Error('expected exactly 62 frozen original 3chain cases');
 const total={cases:cases.length,originalWinlineCount:69,
  hypotheticalGravityWordsEnumeratedByIndependentPhysicalValidator:0,
  ownerColorPatternsCompared:0,
  physicallyRealizableOwnerColorPatterns:0,
  sourceCorrectlyFeasible:0,sourceCorrectlyInfeasible:0,
  exactSourceAllFirstHeadsCorrect:0,
  sourceExactlyOneFirstHead:0,sourceTwoOrThreeFirstHeads:0,
  sourceDirectExactNonterminalBatchQ:0,
  sourceOneGuaranteedFixedProfileFirstWinner:0,
  sourceDualFirstWinnerRaceIncomplete:0,sourceFullDraw:0,
  sourcePhysicalFeasibilityOrFirstHeadOrBatchMismatches:0,
  sourceIndependentFutureGameWDLQueries:0};
 const perCase=[],positive=[],dual=[];
 for(const item of cases){
  const x=physical.verifyCase(item.history,item.chains);
  perCase.push(x);
  total.hypotheticalGravityWordsEnumeratedByIndependentPhysicalValidator+=x.physicalWordCount;
  total.ownerColorPatternsCompared+=x.allRequestedOwnerProfiles;
  total.physicallyRealizableOwnerColorPatterns+=x.physicalOwnerFiberCount;
  total.sourceCorrectlyFeasible+=x.sourceFeasible;
  total.sourceCorrectlyInfeasible+=x.sourceNotRealizable;
  total.exactSourceAllFirstHeadsCorrect+=x.sourceExactFirstHeads;
  total.sourceExactlyOneFirstHead+=x.sourceFixedProfileUniqueHead;
  total.sourceTwoOrThreeFirstHeads+=x.sourceFixedProfileMultipleHeads;
  total.sourceDirectExactNonterminalBatchQ+=x.sourceDirectNonterminalBatchedQ;
  total.sourceOneGuaranteedFixedProfileFirstWinner+=x.sourceOneOwnerFirstWin;
  total.sourceDualFirstWinnerRaceIncomplete+=x.sourceDualFirstWinRaceIncomplete;
  total.sourceFullDraw+=x.sourceFullBoardDraw;
  total.sourcePhysicalFeasibilityOrFirstHeadOrBatchMismatches+=
   x.sourcePhysicalFeasibilityMismatches+x.sourcePhysicalHeadMismatches+
   x.sourcePhysicalBatchQMismatches+x.sourcePhysicalFirstWinnerMismatches;
  if(positive.length<6&&x.sourceFixedProfileUniqueHead>0)
   positive.push({history:item.history,chains:item.chains,uniqueFirstHeads:x.sourceFixedProfileUniqueHead,
     feasible:x.sourceFeasible,firstWinnerFixed:x.sourceOneOwnerFirstWin});
  if(dual.length<6&&x.firstDualSourceIncompleteExample!==null)
   dual.push({history:item.history,chains:item.chains,first:x.firstDualSourceIncompleteExample});
 }
 const agreement={overlappingOriginalTwoChainProfiles:0,headAndFeasibilityMismatches:0};
 for(const history of ['','44444']){
  const q=physical.root(history).q;
  for(let A=1;A<=3;A++)for(let B=1;B<=3;B++){
   const T=A+B;
   for(let mask=0;mask<2**T;mask++){
    const colors=Array.from({length:T},(_,k)=>(mask>>k)&1);
    const a=colors.slice(0,A),b=colors.slice(A);
    const full=source.compute(q,{chains:[{column:1,owners:a},{column:2,owners:b}]});
    const old=prior.compute(q,{columnA:1,columnB:2,ownersA:a,ownersB:b});
    agreement.overlappingOriginalTwoChainProfiles++;
    const f=full.sourceFixedOwnerProfileFeasible===true,o=old.sourceFixedColorProjectionFeasible===true;
    if(f!==o||JSON.stringify(full.exactFixedProfileFirstHeadColumns)!==
      JSON.stringify(old.exactFixedProfileFirstHeadColumns)){
     agreement.headAndFeasibilityMismatches++;
     throw Error('old 2-column bitset vs generalized mixed-radix source mismatch');
    }
   }
  }
 }
 if(total.hypotheticalGravityWordsEnumeratedByIndependentPhysicalValidator!==10326||
    total.ownerColorPatternsCompared!==5704||
    agreement.overlappingOriginalTwoChainProfiles!==392||
    total.sourcePhysicalFeasibilityOrFirstHeadOrBatchMismatches||
    agreement.headAndFeasibilityMismatches)
  throw Error('frozen real original7x6 three-chain test counts or consistency failed');
 return {schema:'connect4.original7x6.exact_three_chain_fixed_owner_phase_mixedradix_v0_1',
  date:'2026-10-18',
  status:'SOURCE_EXACT_THREE_CHAIN_COLORED_PROFILE_FEASIBILITY_AND_ALL_CAUSAL_HEADS',
  math:'docs/research/2026-10-18-multichain-mixed-radix-colored-shuffle-factorization.md',
  knownTrue7x6RootHistories:['','44444',late],
  total,sourceTwoColumnReductionCrosscheck:agreement,
  firstPositiveConfigurationExamples:positive,firstDualSourceIncompleteExamples:dual,
  perCase,
  sourceAdversarialStrategyValuesNeverComputed:true,
  canonical44444PerfectPlayWDL:'UNKNOWN',canonical44444BestAction:'INCOMPLETE',
  maintainedNode26OrExternalFormalProof:'NOT_RUN',qualifiedIsoGraph12Unchanged:true};
}
