// FROZEN independent ORIGINAL W7H6K4 first-win colored 69-line physical
// full-word validator for MULTICHAIN source event-rank enclosures/guarded
// first-winning-line race. ONLY physical verifier enumerates owner-compatible
// fixed-event interleavings. Not minimax, root/action WDL or a game strategy.
import {createOriginalMultichainIndependentPhysicalControl} from './standard7x6-multichain-independent-original-physical-falsifier.mjs';
import {createOriginalMultichainRankRace} from './standard7x6-source-multichain-event-rank-race.mjs';
export function runOriginalMultichainRankRacePhysicalControl(){
 const phys=createOriginalMultichainIndependentPhysicalControl();
 const source=createOriginalMultichainRankRace({width:7,height:6,connect:4});
 const config=[];
 for(const history of ['','44444'])
  for(let A=1;A<=3;A++)for(let B=1;B<=3;B++)for(let C=1;C<=3;C++)
   config.push({history,chains:[{column:1,length:A},{column:2,length:B},{column:3,length:C}]});
 const late='2532541156412471331416356736376672';
 for(let A=1;A<=2;A++)for(let B=1;B<=2;B++)for(let C=1;C<=2;C++)
  config.push({history:late,chains:[{column:2,length:A},{column:4,length:B},{column:5,length:C}]});
 if(config.length!==62)throw Error('not same original 62 frozen general 3chain configurations');
 const totals={sourcePhysicalSameRootCases:62,
  physicallyEnumeratedHypotheticalWordsValidatorOnly:0,
  sourceFeasibleOwnerProfilesWithRankBounds:0,
  sourceEventRankExtremaIndependentlyPhysicallyChecked:0,
  sourceExactRankIntervalConflicts:0,
  originalDualSourceCompletionProfilesFromPriorResearch:0,
  newSourceGuaranteedP0First:0,newSourceGuaranteedP1First:0,
  newlyUnresolvedOrCorrectlyUnresolvedDualCases:0,
  independentlyPhysicalAmbiguousFirstWinnerColorFibers:0,
  incorrectSourceFirstWinnerClaims:0,
  sourceRootOrActionWDLGameQueries:0,
  sourceFutureStrategicGameValues:0};
 const examples=[],incomplete=[],ambiguous=[];
 for(const {history,chains} of config){
  const root=phys.root(history),all=phys.words(chains),fiber=new Map();
  totals.physicallyEnumeratedHypotheticalWordsValidatorOnly+=all.length;
  for(const word of all){
   const played=phys.physicalWord(root,word,chains);
   let f=fiber.get(played.key);
   if(!f){
    f={owners:played.ownerWords.map(x=>x.slice()),
       rankMin:chains.map(ch=>Array(ch.length).fill(Infinity)),
       rankMax:chains.map(ch=>Array(ch.length).fill(0)),
       physicalFirstWinners:new Set(),examples:new Map()};
    fiber.set(played.key,f);
   }
   const win=played.firstWin===null?'D':String(played.firstWin.winner);
   f.physicalFirstWinners.add(win);
   if(!f.examples.has(win))f.examples.set(win,{word:word.join(''),
     firstWinRelativeRank:played.firstWin?.relativeRank??null});
   const used=Array(chains.length).fill(0);
   for(let k=0;k<word.length;k++){
    const idx=chains.findIndex(ch=>ch.column===word[k]);
    if(idx<0)throw Error('unknown original physical column in test word');
    const ordinal=used[idx]++,rank=k+1;
    f.rankMin[idx][ordinal]=Math.min(f.rankMin[idx][ordinal],rank);
    f.rankMax[idx][ordinal]=Math.max(f.rankMax[idx][ordinal],rank);
   }
  }
  for(const f of fiber.values()){
   const profile=chains.map((ch,i)=>({column:ch.column,owners:f.owners[i]}));
   const result=source.compute(root.q,{chains:profile});
   const expected=profile.flatMap((ch,i)=>ch.owners.map((owner,j)=>({
    originalLiteralColumn:ch.column,ordinal:j+1,
    owner,earliest:f.rankMin[i][j],latest:f.rankMax[i][j]})));
   const got=result.exactOriginalPhysicalEventRankIntervals;
   if(!Array.isArray(got)||got.length!==expected.length)
    throw Error('physically realizable profile lacked complete source multichain rank bounds');
   totals.sourceFeasibleOwnerProfilesWithRankBounds++;
   for(let j=0;j<expected.length;j++){
    const a=expected[j],b=got[j];
    totals.sourceEventRankExtremaIndependentlyPhysicallyChecked++;
    if(a.originalLiteralColumn!==b.originalLiteralColumn||
     a.ordinal!==b.originalColumnRelativeOrdinal||
     a.owner!==b.owner||
     a.earliest!==b.earliestRelativeRank||a.latest!==b.latestRelativeRank){
     totals.sourceExactRankIntervalConflicts++;
     throw Error('independent ORIGINAL physical event extrema mismatch '+JSON.stringify({history,profile,j,expected:a,source:b}));
    }
   }
   const both=result.sourceOpponentFirstWinCompletionIntervals.every(x=>x.sourceCompletedGeneratorCount>0);
   if(!both)continue;
   totals.originalDualSourceCompletionProfilesFromPriorResearch++;
   if(f.physicalFirstWinners.size>1){
    totals.independentlyPhysicalAmbiguousFirstWinnerColorFibers++;
    if(ambiguous.length<8)
     ambiguous.push({history,chains,profile,
      physicalOppositeWinners:[...f.physicalFirstWinners],
      exampleFirstTerminalWords:Object.fromEntries(f.examples),sourceResult:result.status});
   }
   const claimed=result.status==='CERTIFIED_FIXED_PROFILE_P0_FIRST_WIN_MULTICHAIN_RANK_BOUNDS'?0:
    result.status==='CERTIFIED_FIXED_PROFILE_P1_FIRST_WIN_MULTICHAIN_RANK_BOUNDS'?1:null;
   if(claimed!==null){
    if(f.physicalFirstWinners.size!==1||
       !f.physicalFirstWinners.has(String(claimed))){
     totals.incorrectSourceFirstWinnerClaims++;
     throw Error('source claimed false original FIRST WINNER '+JSON.stringify({history,profile,status:result.status,physical:[...f.physicalFirstWinners]}));
    }
    if(claimed===0)totals.newSourceGuaranteedP0First++;
    else totals.newSourceGuaranteedP1First++;
    if(examples.length<10)
     examples.push({history,profile,sourceWinner:claimed,
      originalCompletionBounds:result.sourceOpponentFirstWinCompletionIntervals.map(z=>({
       player:z.originalPlayer,lower:z.firstCompletionLower,upper:z.firstCompletionUpper})),
      physicalExampleFirstWinnerWord:[...f.examples.values()][0]});
   }else if(result.status==='SOURCE_DUAL_FIRST_WIN_RACE_STILL_INCOMPLETE'){
    totals.newlyUnresolvedOrCorrectlyUnresolvedDualCases++;
    if(incomplete.length<8)
     incomplete.push({history,profile,
      independentlyObservedFirstWinners:[...f.physicalFirstWinners]});
   }else throw Error('two source original player completion flags positive but source said '+result.status);
  }
 }
 if(totals.physicallyEnumeratedHypotheticalWordsValidatorOnly!==10326||
    totals.sourceFeasibleOwnerProfilesWithRankBounds!==1482||
    totals.originalDualSourceCompletionProfilesFromPriorResearch!==22||
    totals.sourceExactRankIntervalConflicts!==0||
    totals.incorrectSourceFirstWinnerClaims!==0||
    totals.newSourceGuaranteedP0First+totals.newSourceGuaranteedP1First+
    totals.newlyUnresolvedOrCorrectlyUnresolvedDualCases!==22)
  throw Error('physical matched 62-case source rank control accounting violation');
 const fixedProfile=[{column:2,owners:[0]},{column:4,owners:[0,1]},{column:5,owners:[1]}];
 const protectedResult=source.compute(phys.root(late).q,{chains:fixedProfile});
 if(protectedResult.status!=='SOURCE_DUAL_FIRST_WIN_RACE_STILL_INCOMPLETE')
  throw Error('source incorrectly collapsed original genuine 4-event opposite-first-winner witness');
 return {schema:'connect4.original7x6.multichain_fixed_colored_rank_first_win_race_physical_v0_1',
  date:'2026-10-18',status:'SOURCE_EXACT_MULTI_CHAIN_PHYSICAL_EVENT_RANKS_AND_GUARDED_FIXED_FIRST_WINNER',
  scope:'same 62 frozen original true 7x6 3chain configurations, 1482 feasible fixed owner patterns; original physical word enumeration solely validator',
  sourceRankTheorem:'docs/research/2026-10-18-multichain-event-rank-enclosures-and-guarded-first-winner.md',
  totals,newlySourceCertifiedFirstWinnerExamples:examples,
  trueOppositeFirstWinnerSameColorProfileWitnesses:ambiguous,
  sourceStillRaceIncompleteExamples:incomplete,
  protectedFourEventCounterexampleSourceStatus:protectedResult.status,
  original44444RootPerfectPlayWDL:'UNKNOWN',
  original44444SourceBestOriginalColumn:'INCOMPLETE',
  sourceStrategicGameValuesEvaluated:0,
  Node26CIAndExternalMechanicalProof:'NOT_RUN'};
}
