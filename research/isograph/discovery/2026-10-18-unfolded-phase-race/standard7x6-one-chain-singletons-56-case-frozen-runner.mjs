// FROZEN original true7x6 phase-feasibility pilot matrix, before execution.
// ALL word/per-color enumeration exists only in the physical FALSIFIER,
// source uses linear prefix XOR budget and ONE canonical feasible word.
import {createPhysicalOneChainSingletonChecker} from './standard7x6-one-chain-singletons-independent-physical-control.mjs';
export function runFrozenSingleChainPhaseCases(){
 const validator=createPhysicalOneChainSingletonChecker(), cases=[];
 const singleOptions=[[],[1],[1,2],[1,2,7]];
 for(let L=1;L<=6;L++)for(const singletons of singleOptions)
  cases.push({history:'',c:4,L,singletons});
 const fullCenterPrefix='44444';
 const canonicalSingletonOptions=[[],[2],[2,3],[2,3,4]];
 for(let L=1;L<=6;L++)for(const singletons of canonicalSingletonOptions)
  cases.push({history:fullCenterPrefix,c:1,L,singletons});
 const late='2532541156412471331416356736376672';
 const lateOptions=[[],[4],[4,5],[4,5,7]];
 for(let L=1;L<=2;L++)for(const singletons of lateOptions)
  cases.push({history:late,c:2,L,singletons});
 if(cases.length!==56)throw Error('exact 56 predeclared original physical cases expected');
 const totals={originalCases:cases.length,independentOriginalK4Windows:69,
  physicalGravityHypotheticalWordsEnumeratedForValidationOnly:0,
  physicalOwnerProjectionTargetsChecked:0,physicallyAttainableColoredAssignments:0,
  sourceFeasibleOwnerProjectionCount:0,sourceProvenInfeasibleCount:0,
  sourceAndPhysicalConflicts:0,sourceNonterminalDirectBatchQCovers:0,
  sourceUniqueFixedSegmentFirstWinner:0,sourceDualCompletionRaceStillIncomplete:0,
  sourceFullDraw:0,sourceAlternativeGameValuesEvaluated:0,
  originalLevel2BestOriginalAction:'INCOMPLETE',canonical44444RootPerfectWDL:'UNKNOWN',
  noMaintainedNode26OrFormalCheckerClaimed:true};
 const outputs=[];
 for(const item of cases){
  const result=validator.verifyCase(item.history,{c:item.c,L:item.L,singletons:item.singletons});
  totals.physicalGravityHypotheticalWordsEnumeratedForValidationOnly+=result.physicallyEnumeratedGravityEventWords;
  totals.physicalOwnerProjectionTargetsChecked+=result.sourceAllBinaryOwnerAllocationsConsidered;
  totals.physicallyAttainableColoredAssignments+=result.physicallyAttainableOwnerPatterns;
  totals.sourceFeasibleOwnerProjectionCount+=result.sourceFeasible;
  totals.sourceProvenInfeasibleCount+=result.sourceProvenInfeasible;
  totals.sourceAndPhysicalConflicts+=result.sourceFalsePositive+result.sourceFalseNegative+result.physicalTerminalOrBatchMismatches;
  totals.sourceNonterminalDirectBatchQCovers+=result.feasibleSourceNonterminal;
  totals.sourceUniqueFixedSegmentFirstWinner+=result.feasibleSourceFixedFirstWinner;
  totals.sourceDualCompletionRaceStillIncomplete+=result.feasibleSourceDualCompletionRaceIncomplete;
  totals.sourceFullDraw+=result.feasibleSourceFullDraw;
  outputs.push(result);
 }
 const central=outputs.find(x=>x.rootHistory===''&&x.chainColumn===4&&x.L===5&&
  JSON.stringify(x.singletons)==='[1,2,7]');
 if(!central||central.physicallyEnumeratedGravityEventWords!==336||
   central.physicallyAttainableOwnerPatterns!==62||central.sourceFeasible!==62)
  throw Error('source original empty c4,L5,s3 should reproduce physical 336-word,62-projection reference');
 if(totals.sourceAndPhysicalConflicts!==0)throw Error('source/physical contradiction');
 return {schema:'connect4.original7x6.single_chain_singletons_phase_shuffle_exact_56_case_v0_1',
  date:'2026-10-18',claim:'exact prefix-XOR transition budget and global owner quota iff an alternating gravity shuffle exists for one nontrivial chain plus distinct singleton columns',
  sourceTheorem:'docs/research/2026-10-18-exact-single-chain-singleton-colored-shuffle-elimination.md',
  cases,totals,canonicalC4L5ThreeSingletons:central,perCaseResults:outputs,
  restrictedSourceFeasibilityNotPerfectPlayValue:true,
  independentPhysicalEnumeratorDeliberatelyBranchesOverFixedEventWords:true};
}
