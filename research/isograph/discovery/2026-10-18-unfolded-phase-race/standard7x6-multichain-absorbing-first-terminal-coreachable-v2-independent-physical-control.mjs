// V2 CORRECTED SOURCE vs INDEPENDENT ORIGINAL GRID validation; FROZEN before execution.\n// The v1 exact earliest first-WIN claim was PHYSICALLY FALSIFIED when it\n// counted a locally colored terminal PREFIX not extendable to the specified\n// complete color profile. Source now requires backward full-color viability.\n// Physical checker and full 62-case word fiber methodology unchanged.\n// 62 SAME genuine original W7H6K4 selected three-
// chain cases as previous mixed-radix and rank-bound controls.
// Physical oracle independently enumerates and replays all fixed-event
// gravity words (69 ORIGINAL four-in-row windows, first WIN stops actual
// play). SOURCE only uses one chosen original q fixed owner-color profile;
// it MUST agree with complete physical first-terminal outcome sets.
// NO physical recursive minimax or true perfect-play root WDL is computed.
import {createOriginalMultichainIndependentPhysicalControl} from './standard7x6-multichain-independent-original-physical-falsifier.mjs';
import {createOriginalMultichainAbsorbingFirstTerminalCoreachableV2} from './standard7x6-source-multichain-absorbing-first-terminal-coreachable-v2.mjs';
import {createOriginalMultichainRankRace} from './standard7x6-source-multichain-event-rank-race.mjs';
export function runOriginalMultichainAbsorbingFirstTerminalCoreachableV2PhysicalControl(){
 const physical=createOriginalMultichainIndependentPhysicalControl();
 const source=createOriginalMultichainAbsorbingFirstTerminalCoreachableV2({width:7,height:6,connect:4});
 const rankPrior=createOriginalMultichainRankRace({width:7,height:6,connect:4});
 const cases=[];
 for(const history of ['','44444'])
  for(let a=1;a<=3;a++)for(let b=1;b<=3;b++)for(let c=1;c<=3;c++)
   cases.push({history,chains:[{column:1,length:a},{column:2,length:b},{column:3,length:c}]});
 const late='2532541156412471331416356736376672';
 for(let a=1;a<=2;a++)for(let b=1;b<=2;b++)for(let c=1;c<=2;c++)
  cases.push({history:late,chains:[{column:2,length:a},{column:4,length:b},{column:5,length:c}]});
 if(cases.length!==62)throw Error('must use the SAME immutable original 62-case matrix');
 const total={originalPhysicalWinlineCount:69,originalRootCases:62,
  independentlyEnumeratedHypotheticalFixedEventWords:0,
  uniquePhysicallyRealizableSourceOwnerColorFibers:0,
  exactSourceFirstTerminalOutcomeSetMatches:0,
  falseWinnerOrNonterminalSourceResults:0,
  physicallyNoWinnerWithinSegmentProfiles:0,
  physicallyOnlyP0FirstProfiles:0,physicallyOnlyP1FirstProfiles:0,
  physicallyBothP0AndP1FirstPossibleProfiles:0,
  profilesPreviouslySourceDualCompletionRaceIncomplete:0,
  earlierRankBoundAlreadySoundlyWinnerCertified:0,
  newlyExactSourceClosedPriorBoundIncomplete:0,
  newlyExactSourceDemonstratesBothFirstWinnersOnPriorIncomplete:0,
  sourceFirstTerminalWinPlacementRankBoundsChecked:0,
  wrongSourceFirstWinPlacementRankBounds:0,
  sourceIndependentFutureGameWDLQueries:0,
  sourceStrategicPolicySearchNodes:0};
 const witnesses=[],mixed=[],fixed=[],oldIncomplete=[];
 for(const {history,chains} of cases){
  const root=physical.root(history);
  const all=physical.words(chains);
  total.independentlyEnumeratedHypotheticalFixedEventWords+=all.length;
  const fibers=new Map();
  for(const word of all){
   const played=physical.physicalWord(root,word,chains),key=played.key;
   let row=fibers.get(key);
   if(!row){
    row={profile:chains.map((ch,i)=>({column:ch.column,owners:played.ownerWords[i].slice()})),
     physicallyPossibleFirstTerminalLabels:new Set(),winRanks:[[],[]],
     exampleForEachOutcome:new Map()};
    fibers.set(key,row);
   }
   const label=played.firstWin===null?'NO_FIRST_WIN_WITHIN_SEGMENT':
    played.firstWin.winner===0?'P0_FIRST_WIN':'P1_FIRST_WIN';
   row.physicallyPossibleFirstTerminalLabels.add(label);
   if(played.firstWin){
    row.winRanks[played.firstWin.winner].push(played.firstWin.relativeRank);
   }
   if(!row.exampleForEachOutcome.has(label))
    row.exampleForEachOutcome.set(label,{physicalWord:word.join(''),
     firstWinner:played.firstWin?.winner??null,
     firstWinnerRelativeRank:played.firstWin?.relativeRank??null});
  }
  for(const f of fibers.values()){
   total.uniquePhysicallyRealizableSourceOwnerColorFibers++;
   const got=source.compute(root.q,{chains:f.profile});
   if(!Array.isArray(got.exactPossibleTerminalLabels))
    throw Error('physically feasible owner-color profile but no SOURCE exact terminal set');
   const actual=[...f.physicallyPossibleFirstTerminalLabels].sort(),
    claimed=got.exactPossibleTerminalLabels.slice().sort();
   if(JSON.stringify(actual)!==JSON.stringify(claimed)){
    total.falseWinnerOrNonterminalSourceResults++;
    throw Error('FROZEN ORIGINAL PHYSICAL FIRST TERMINAL CONTRADICTS SOURCE '+JSON.stringify({history,profile:f.profile,actual,claimed,sourceStatus:got.status}));
   }
   total.exactSourceFirstTerminalOutcomeSetMatches++;
   if(actual.length===1&&actual[0]==='NO_FIRST_WIN_WITHIN_SEGMENT')
    total.physicallyNoWinnerWithinSegmentProfiles++;
   if(actual.length===1&&actual[0]==='P0_FIRST_WIN')
    total.physicallyOnlyP0FirstProfiles++;
   if(actual.length===1&&actual[0]==='P1_FIRST_WIN')
    total.physicallyOnlyP1FirstProfiles++;
   if(actual.includes('P0_FIRST_WIN')&&actual.includes('P1_FIRST_WIN')){
    total.physicallyBothP0AndP1FirstPossibleProfiles++;
    if(mixed.length<9)mixed.push({history,profile:f.profile,
     physicallyPossibleFirstTerminalLabels:actual,
     firstWinnerExampleWords:[...f.exampleForEachOutcome.values()]});
   }
   for(let p=0;p<2;p++){
    const ranks=f.winRanks[p],bound=got.sourceEarliestAndLatestFirstWinRelativePly[p];
    if(!ranks.length){
     if(bound!==null)throw Error('SOURCE claims a first-winning placement rank without a physical winner');
     continue;
    }
    total.sourceFirstTerminalWinPlacementRankBoundsChecked++;
    if(bound?.earliest!==Math.min(...ranks)||bound.latest!==Math.max(...ranks)){
     total.wrongSourceFirstWinPlacementRankBounds++;
     throw Error('SOURCE exact absorbing FIRST-WIN RELATIVE RANK BOUNDS wrong '+JSON.stringify({history,profile:f.profile,p,bound,min:Math.min(...ranks),max:Math.max(...ranks)}));
    }
   }
   const old=rankPrior.compute(root.q,{chains:f.profile});
   const both=old.sourceOpponentFirstWinCompletionIntervals?.every(z=>z.sourceCompletedGeneratorCount>0);
   if(!both)continue;
   total.profilesPreviouslySourceDualCompletionRaceIncomplete++;
   if(old.status.startsWith('CERTIFIED_FIXED_PROFILE_'))
    total.earlierRankBoundAlreadySoundlyWinnerCertified++;
   else if(old.status==='SOURCE_DUAL_FIRST_WIN_RACE_STILL_INCOMPLETE'){
    if(actual.length===1){
     total.newlyExactSourceClosedPriorBoundIncomplete++;
     if(fixed.length<8)fixed.push({history,profile:f.profile,physicalWinner:actual[0],
      sourceStatus:got.status,example:[...f.exampleForEachOutcome.values()][0]});
    }else{
     total.newlyExactSourceDemonstratesBothFirstWinnersOnPriorIncomplete++;
    }
    if(oldIncomplete.length<3)oldIncomplete.push({history,profile:f.profile,
     previous:old.status,newExact:got.status,outcomeSet:actual});
   }else throw Error('unrecognized previous SOURCE dual race status '+old.status);
   if(witnesses.length<3)witnesses.push({history,profile:f.profile,results:actual});
  }
 }
 if(total.uniquePhysicallyRealizableSourceOwnerColorFibers!==1482||
   total.independentlyEnumeratedHypotheticalFixedEventWords!==10326||
   total.profilesPreviouslySourceDualCompletionRaceIncomplete!==22||
   total.earlierRankBoundAlreadySoundlyWinnerCertified!==1||
   total.newlyExactSourceClosedPriorBoundIncomplete+
    total.newlyExactSourceDemonstratesBothFirstWinnersOnPriorIncomplete!==21||
   total.falseWinnerOrNonterminalSourceResults||
   total.wrongSourceFirstWinPlacementRankBounds)
   throw Error('SAME ORIGINAL ROOT physical controls do NOT reconcile with frozen preceding 62/22 profile campaigns');
 const mandatory=mixed.find(z=>z.history===late&&
  z.profile.map(x=>x.column).join(',')==='2,4,5'&&
  z.profile.map(x=>x.owners.join('')).join('|')==='0|01|1');
 if(!mandatory)throw Error('known genuine rank34 same-colored 2544 / 4425 opposite winner must remain BOTH terminal');
 return {schema:'connect4.original7x6.mixedradix_static_absorbing_first_terminal_all_profiles_v0_1',
  date:'2026-10-18',status:'SOURCE_V2_COREACHABILITY_EXACT_FIXED_COLOR_FIRST_TERMINAL_OUTCOME_SETS_AND_RANKS',
  theorem:'docs/research/2026-10-18-multichain-absorbing-first-terminal-backward-coreachability-repair.md',
  scope:'SAME FROZEN 62 true original7x6 3chain cases, 1482 physically realizable color profiles, independent explicit complete-word enumeration FALSIFIER ONLY',
  totals:total,previouslyUnresolvedExampleComparisons:oldIncomplete,
  newlyClosedSourceFirstWinnerExamples:fixed,
  physicallyTrueDifferentFirstWinnersSameOwnerProfiles:mixed,
  knownMandatoryFourEventOppositeFirstWinnerWitness:mandatory,
  earlierRankGuardCertifiedExamples:witnesses,
  ordinaryPerfectRootWDLBySource:null,
  sourceOneLevel2BestOriginalColumn:null,
  currentQualifiedGameTheoryAuthority:'IsoGraph 1.2 UNCHANGED',
  maintainedNode26CIOrExternalFormalVerifier:'NOT_RUN',
  noSolverBranchMerge:true};
}
