// FROZEN independent ORIGINAL physical W7 H6 K4 full color-shuffle rank
// interval and FIRST-WINNER falsifier, 76 SAME root+event-count cases as prior.
// The source bitset computes FIXED-PROFILE rank bounds, not alternate outcomes.
// Physical checker enumerates words only to falsify source and observes earliest
// original 69-line WIN. No minimax / game WDL / strategic opponent strategies.
import {createTwoChainIndependentOriginalPhysicalFalsifier} from './standard7x6-two-chain-independent-original-physical-falsifier.mjs';
import {createOriginalTwoChainEventRankRaceBounds} from './standard7x6-source-two-chain-event-rank-race-bounds.mjs';
export function runOriginalTwoChainRankFirstWinnerPhysicalControl(){
 const checker=createTwoChainIndependentOriginalPhysicalFalsifier();
 const source=createOriginalTwoChainEventRankRaceBounds({width:7,height:6,connect:4});
 const configurations=[];
 for(const history of ['','44444'])
  for(let A=1;A<=6;A++)for(let B=1;B<=6;B++)
   configurations.push({history,columnA:1,columnB:2,A,B});
 const late='2532541156412471331416356736376672';
 for(let A=1;A<=2;A++)for(let B=1;B<=2;B++)
  configurations.push({history:late,columnA:2,columnB:4,A,B});
 if(configurations.length!==76)throw Error('mismatched prior frozen 76 original physical configurations');
 const totals={frozenConfigurations:76,originalGeometricK4Windows:69,
  physicalCompleteCounterfactualWordsEnumeratedForFalsification:0,
  originalFeasibleColoredOwnerFibersChecked:0,
  totalSourceEventRankIntervalsCrossChecked:0,
  exactEventRankIntervalErrors:0,
  previouslySourceDualCompletionRaceIncomplete:0,
  newlyExactSourceDualRaceP0First:0,newlyExactSourceDualRaceP1First:0,
  stillSourceDualRaceIncomplete:0,
  physicallyUniqueFirstWinnerButSourceStillIncomplete:0,
  physicallyMultipleFirstWinnersWithSameOwnerPhase:0,
  incorrectSourceFirstWinnerClaims:0,
  sourceRootWDLQueries:0,sourceStrategicallyDifferentGameValues:0,
  maintainedNode26CIOrExternalCheckerDone:false};
 const positives=[],incomplete=[],physicalRaceDivergence=[];
 const countByStatus={};
 const validStatus=new Set([
  'CERTIFIED_FIXED_PROFILE_P0_FIRST_WIN_UNDER_ALL_COLORED_SHUFFLES',
  'CERTIFIED_FIXED_PROFILE_P1_FIRST_WIN_UNDER_ALL_COLORED_SHUFFLES',
  'SOURCE_FEASIBLE_DUAL_FIRST_WIN_RACE_INTERVAL_INCOMPLETE',
  'UNCHANGED_SINGLE_OR_NO_OWNER_TERMINAL_SOURCE_CLASS']);
 for(const {history,columnA,columnB,A,B} of configurations){
  const root=checker.root(history),all=checker.allFixedWords(columnA,columnB,A,B);
  totals.physicalCompleteCounterfactualWordsEnumeratedForFalsification+=all.length;
  const fibers=new Map();
  for(const w of all){
   const physical=checker.physicalWord(root,w,columnA,columnB,A,B);
   let f=fibers.get(physical.key);
   if(!f){
    f={A:physical.colorsA.slice(),B:physical.colorsB.slice(),
      rankMinA:Array(A).fill(Infinity),rankMaxA:Array(A).fill(0),
      rankMinB:Array(B).fill(Infinity),rankMaxB:Array(B).fill(0),
      firstWinnerSet:new Set(),examplePhysicalWord:w.join(''),sampleWords:0};
    fibers.set(physical.key,f);
   }
   f.sampleWords++;
   f.firstWinnerSet.add(physical.firstWinner===null?'D':String(physical.firstWinner));
   let ai=0,bi=0;
   for(let k=0;k<w.length;k++){
    const pos=k+1;
    if(w[k]===columnA){
     f.rankMinA[ai]=Math.min(f.rankMinA[ai],pos);
     f.rankMaxA[ai]=Math.max(f.rankMaxA[ai],pos);ai++;
    }else{
     f.rankMinB[bi]=Math.min(f.rankMinB[bi],pos);
     f.rankMaxB[bi]=Math.max(f.rankMaxB[bi],pos);bi++;
    }
   }
  }
  for(const f of fibers.values()){
   totals.originalFeasibleColoredOwnerFibersChecked++;
   const out=source.compute(root.q,{columnA,columnB,ownersA:f.A,ownersB:f.B});
   if(!validStatus.has(out.status))throw Error('SOURCE unexpectedly marks physically feasible profile invalid: '+out.status);
   const ranks=out.exactOriginalEventRankIntervals;
   if(ranks.length!==A+B)throw Error('source missing colored event rank envelopes');
   const want=[
    ...f.rankMinA.map((lo,i)=>({col:columnA,ordinal:i+1,lo,hi:f.rankMaxA[i]})),
    ...f.rankMinB.map((lo,j)=>({col:columnB,ordinal:j+1,lo,hi:f.rankMaxB[j]}))
   ];
   for(let i=0;i<ranks.length;i++){
    const actual=ranks[i],expected=want[i];
    totals.totalSourceEventRankIntervalsCrossChecked++;
    if(actual.column!==expected.col||actual.relativeEventOrdinal!==expected.ordinal||
      actual.minRelativePlacementRank!==expected.lo||
      actual.maxRelativePlacementRank!==expected.hi){
     totals.exactEventRankIntervalErrors++;
     throw Error('ORIGINAL PHYSICAL EVENT RANK BOUNDS CONTRADICT SOURCE '+JSON.stringify({history,columnA,columnB,A,B,ownersA:f.A,ownersB:f.B,i,actual,expected}));
    }
   }
   const both=out.staticOriginalLineCompletionTimeEnclosures.every(c=>c.completedOriginalGeneratorCount>0);
   countByStatus[out.status]=(countByStatus[out.status]||0)+1;
   if(!both)continue;
   totals.previouslySourceDualCompletionRaceIncomplete++;
   if(f.firstWinnerSet.size>1){
    totals.physicallyMultipleFirstWinnersWithSameOwnerPhase++;
    if(physicalRaceDivergence.length<4)
     physicalRaceDivergence.push({history,columnA,columnB,A,B,ownersA:f.A,ownersB:f.B,
      observedFirstWinners:[...f.firstWinnerSet],sourceStatus:out.status});
   }
   if(out.status==='CERTIFIED_FIXED_PROFILE_P0_FIRST_WIN_UNDER_ALL_COLORED_SHUFFLES'||
      out.status==='CERTIFIED_FIXED_PROFILE_P1_FIRST_WIN_UNDER_ALL_COLORED_SHUFFLES'){
    const expected=out.fixedOwnerProjectionUnavoidableFirstWinner;
    if(f.firstWinnerSet.size!==1||!f.firstWinnerSet.has(String(expected))){
     totals.incorrectSourceFirstWinnerClaims++;
     throw Error('FALSE SOURCE CONDITIONAL FIRST WINNER CLAIM '+JSON.stringify({history,columnA,columnB,A,B,ownersA:f.A,ownersB:f.B,observed:[...f.firstWinnerSet],out}));
    }
    if(expected===0)totals.newlyExactSourceDualRaceP0First++;
    else totals.newlyExactSourceDualRaceP1First++;
    if(positives.length<12)
     positives.push({history,columnA,columnB,A,B,ownersA:f.A,ownersB:f.B,
      originalPhysicalFirstWinner:expected,source:out.status,
      eventCompletionTimeEnclosures:out.staticOriginalLineCompletionTimeEnclosures.map(c=>({
       player:c.p,lo:c.earliestPossibleFirstCompletionLower,hi:c.guaranteedEarliestCompletionUpper})),
      originalFixedProfileExampleWord:f.examplePhysicalWord});
   }else if(out.status==='SOURCE_FEASIBLE_DUAL_FIRST_WIN_RACE_INTERVAL_INCOMPLETE'){
    totals.stillSourceDualRaceIncomplete++;
    if(f.firstWinnerSet.size===1)totals.physicallyUniqueFirstWinnerButSourceStillIncomplete++;
    if(incomplete.length<8)incomplete.push({history,A,B,ownersA:f.A,ownersB:f.B,
      observedFirstWinners:[...f.firstWinnerSet],
      sourceStatus:out.status});
   }else throw Error('dual source flags but source returned nondual status');
  }
 }
 if(totals.originalFeasibleColoredOwnerFibersChecked!==3509||
    totals.physicalCompleteCounterfactualWordsEnumeratedForFalsification!==6850||
    totals.previouslySourceDualCompletionRaceIncomplete!==184||
    totals.incorrectSourceFirstWinnerClaims||totals.exactEventRankIntervalErrors)
  throw Error('original frozen matched-corpus evidence and new source validation disagree');
 if(totals.newlyExactSourceDualRaceP0First+totals.newlyExactSourceDualRaceP1First+
    totals.stillSourceDualRaceIncomplete!==184)
  throw Error('conditional dual original first-winner closure accounting incomplete');
 return {schema:'connect4.standard7x6.original_two_chain_source_colored_event_rank_first_winner_0_1',
  date:'2026-10-18',
  scope:'SAME frozen 76 original true7x6 two-chain colored-profile controls (empty, genuine 44444 and real rank34); independent PHYSICAL enumeration for falsification ONLY',
  firstWinnerBoundTheorem:'docs/research/2026-10-18-two-chain-causal-event-rank-interval-first-win-race-certificate.md',
  status:'EXACT_ORIGINAL_FIXED_PROFILE_RANK_INTERVALS_WITH_CONSERVATIVE_WINNER_CLOSURE',
  totals,sourceStatusCounts:countByStatus,
  newExactFirstWinnerExamples:positives,
  stillIncompleteDualWinnerExamples:incomplete,
  physicalSameOwnerPhaseDifferentWinnerExamples:physicalRaceDivergence,
  sourceNotFullGameWDL:true,sourceNotLevel2BestMove:true,
  canonical44444PerfectWDL:'UNKNOWN',canonical44444BestOriginalColumn:'INCOMPLETE'};
}
