// ORIGINAL W7 H6 K4 ONLY. TEST-SIDE strong exact oracle is
// externally calibrated against Pons solved parent scores; use it
// to choose only one-step strong-optimal moves at EVERY future ply
// from TEN deterministically selected mid/late original solved
// histories, with 3 different deterministic tied-optimum variants.
 // This is a BOUNDED PERFECT CONTINUATION from an arbitrary solved
// parent. Earlier parent move history MAY be suboptimal vs empty-root
// perfect play. Do not call a full historical game "perfect from root".
 // Source theorem for 69-line survivor counts is NONSEARCH;
 // exact Oracle is used ONLY as independent teacher for empirical
// validation, never as the sought future-free game-WDL algorithm.
import {createTrue7x6SurvivingLineObserver}
 from './source-true7x6-69-lines-surviving-perfect-action-geometry.mjs';
import {ExactConnect4Oracle}
 from '../../../components/oracle/exact7x6.mjs';
export function evaluateQualifiedLateOriginal7x6OptimalTails(tsvText){
 const source=createTrue7x6SurvivingLineObserver(),errors=[],
  rows=tsvText.trim().split('\n').map((line,i)=>{
   const columns=line.split('\t');
   return {group:columns[0],testSet:columns[1],sourceLine:Number(columns[2]),
    word:columns[3],parentStrongScore:Number(columns[4]),
    perActionScore:columns[5].split(',').map(Number),row:i+1};
  });
 const parents=rows.filter(r=>r.testSet==='Test_L3_R1'&&r.word.length>=34).slice(0,10);
 if(parents.length!==10)
  throw Error('frozen qualified original 7x6 end-rank selection count below10');
 const games=[],numberOfExtraGameMoves=0;
 let oracleActionQueries=0,physicalActualGameMoves=0,
  allChosenActionsStrongOptimal=true;
 for(const parent of parents)for(let variant=0;variant<3;variant++){
  const oracle=new ExactConnect4Oracle();
  let word=parent.word,state=source.board(word),horizon=0,terminal=null,
   former=source.observe(state),trace=[];
  if(state.terminal!==null)
   throw Error('exact original qualified root already firstwin-terminal');
  const initialStrong=Array.from(oracle.analyzeSequence(word));
  if(Math.max(...initialStrong)!==parent.parentStrongScore||
    JSON.stringify(initialStrong)!==JSON.stringify(parent.perActionScore))
   errors.push({type:'ORACLE_CHANGED_FROM_EXTERNALLY_CHECKPOINTED_VECTOR',
    sample:parent.row,parentOriginalPly:word.length,
    expected:parent.perActionScore,actual:initialStrong});
  let tiedSome=0;
  while(terminal===null && horizon<42-parent.word.length){
   const scores=Array.from(oracle.analyzeSequence(word));
   oracleActionQueries++;
   const best=Math.max(...scores);
   const strongOptimalColumns=scores.flatMap((v,c)=>v===best?[c+1]:[]);
   if(!strongOptimalColumns.length)
    throw Error('no legal strong-score best original action at nonterminal');
   const col=strongOptimalColumns[(state.ply+variant)%strongOptimalColumns.length];
   if(scores[col-1]!==best){allChosenActionsStrongOptimal=false;errors.push('not an oracle-strong-optimal action')}
   if(strongOptimalColumns.length>1)tiedSome++;
   const delta=source.move(state,col);
   word+=col;
   state=source.board(word);
   const next=source.observe(state);
   if(delta.after.distinctGeometricallySurviving!==next.distinctGeometricallySurviving||
      next.dead+next.empty+next.P0only+next.P1only!==69)
    errors.push({type:'OBSERVED_STRAND_CANCEL_METRICS_DO_NOT_PARTITION_69',row:parent.row,col});
   trace.push({ply:state.ply,playerWhoJustMoved:(state.ply%2)?'P0':'P1',
    originalLiteralMove:col,
    originalActionQualifiedStrongScore:scores[col-1],
    totalStrongOptimalMoveChoices:strongOptimalColumns.length,
    geometricallySurvivingDistinctOriginalK4Lines:next.distinctGeometricallySurviving,
    ownerSpecificOriginalP0Live:next.liveForP0,
    ownerSpecificOriginalP1Live:next.liveForP1,
    uncanceledBothOwnerOriginalK4LiveMultiplicity:next.bothOwnerLayerMultiplicity,
    originalUnownedCompletelyEmptyK4Lines:next.empty,
    originalK4LinesBlockedForBoth:next.dead,
    P0only:next.P0only,P1only:next.P1only,
    newlyCancelledForJustMovedOpponent:delta.immediateNewOpponentBlockedLines,
    newlyDeadForBoth:delta.newlyDoubleDead,
    terminal:next.firstWinTerminal});
   horizon++;physicalActualGameMoves++;
   former=next;terminal=state.terminal;
  }
  if(terminal===null)errors.push({type:'ORIGINAL_ALL_FULL_OR_TERMINAL_NOT_REACHED',parentRow:parent.row,variant});
  const last=source.observe(state);
  games.push({
   frozenOriginalParentRow:parent.row,
   originalExternalTestSet:parent.testSet,
   initialActualWord:parent.word,initialActualPly:parent.word.length,
   initialParentExternallyQualifiedStrongScore:parent.parentStrongScore,
   variant,tieAlternativeDecisionsEncountered:tiedSome,
   finalActualOneBasedWord:word,
   absoluteFirstTerminalMove:state.ply,
   originalTrueTerminal:terminal,
   terminalSurvivingDistinctOriginalK4Lines:last.distinctGeometricallySurviving,
   terminalK4BlockedForBoth:last.dead,
   terminalOwnerLiveP0:last.liveForP0,terminalOwnerLiveP1:last.liveForP1,
   terminalOwnerLayerMultiplicities:last.bothOwnerLayerMultiplicity,
   terminalWinningLineCountForP0:last.linesCurrentlyFullyWonForP0,
   terminalWinningLineCountForP1:last.linesCurrentlyFullyWonForP1,
   fullOptimalContinuationFromParentOnly:true,
   sourceReconstructedAllPhysicalFourOrientations:true,
   oracleNodesUsedForTail:oracle.nodes,
   originalTrace:trace
  });
 }
 const uniqueTerminal=new Set(games.map(x=>x.finalActualOneBasedWord)).size,
  histogram={},hit27=[],byRank={};
 for(const g of games){
  for(const x of g.originalTrace){
   const n=x.geometricallySurvivingDistinctOriginalK4Lines;
   histogram[n]=(histogram[n]??0)+1;
   if(n===27||n===28)hit27.push({
    parentRow:g.frozenOriginalParentRow,variant:g.variant,
    word:g.finalActualOneBasedWord.slice(0,x.ply),ply:x.ply,
    surviving:n,P0Live:x.ownerSpecificOriginalP0Live,
    P1Live:x.ownerSpecificOriginalP1Live});
   const a=byRank[x.ply]??{observations:0,totalU:0,hit27or28:0};
   a.observations++;a.totalU+=n;if(n===27||n===28)a.hit27or28++;
   byRank[x.ply]=a;
  }
 }
 return {status:errors.length?'QUALIFIED_ORACLE_OPTIMAL_TAILS_FAILED':
   'QUALIFIED_7X6_ORIGINAL_CONDITIONALLY_PERFECT_TAILS_COMPLETE',
  board:[7,6,4],qualifiedEndgameParentCount:parents.length,
  deterministicOptimumTieVariantsPerParent:3,
  oracleOptimalContinuationGameSamples:games.length,
  uniqueFullFirstWinTerminalWords:uniqueTerminal,
  allPerPlyActionsWereStrongOracleOptimal:allChosenActionsStrongOptimal,
  sourceOriginalFutureGameWDLQueries:0,
  testSideOracleScoreQueries:oracleActionQueries,
  originalRealFutureMovesReplayed:physicalActualGameMoves,
  terminalDistinctSurvivorHistogram:Object.fromEntries(
   Object.entries(histogram).sort((a,b)=>Number(a[0])-Number(b[0]))),
  near27or28DuringExactOptimalTail:hit27,
  byAbsolutePly:Object.fromEntries(Object.entries(byRank).map(([k,v])=>
   [k,{...v,meanU:v.totalU/v.observations}])),
  outcomeHistogram:games.reduce((a,g)=>(a[g.originalTrueTerminal]=(a[g.originalTrueTerminal]??0)+1,a),{}),
  parentStarts:parents.map(p=>({row:p.row,ply:p.word.length,firstOneBasedHistory:p.word,
   qualifiedParentStrongScore:p.parentStrongScore})),
  games,
  sampleSelectionBias:"end/easy externally solved calibration positions rank>=34; NOT random perfect from initial empty board",
  firstWinStopped:true,allFalseTerminalContinuationsRejected:true,
  perfectGameFromEmptyRootNotProven:true,
  geometric27or28IsNotAUniversalPerfectPlayInvariantWithoutFurtherProof:true,
  errors:errors.slice(0,8)};
}
