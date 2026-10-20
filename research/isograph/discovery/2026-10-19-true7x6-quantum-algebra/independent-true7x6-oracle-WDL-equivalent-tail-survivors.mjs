// TEST-ONLY original standard W7,H6,K4 oracle-conditioned
// CONTINUATIONS of the same ten frozen end/easy qualified states.
// Broaden strict strong-score optimal moves to ALL current moves
// preserving the best EXACT W/D/L outcome class from that position:
// if any current move scores >0 choose among positives;
// else if score0 exists choose among zeros;
// else every legal negative move is an outcome-equivalent LOSS.
// No nonstandard board, no firstwin continuation, no attempt to
// classify empty-root WDL from static survival. Oracle is independent
// calibrated validation teacher, not source nonsearch mathematics.
import {createTrue7x6SurvivingLineObserver}
 from './source-true7x6-69-lines-surviving-perfect-action-geometry.mjs';
import {ExactConnect4Oracle}
 from '../../../components/oracle/exact7x6.mjs';
export function independentlySampleOriginal7x6WDLEquivalentTails(frozenTsv){
 const obs=createTrue7x6SurvivingLineObserver();
 const rows=frozenTsv.trim().split('\n').map((row,i)=>{
  const x=row.split('\t');
  return {row:i+1,group:x[0],testSet:x[1],history:x[3],
   score:+x[4],externalPerAction:x[5].split(',').map(Number)};
 });
 const starts=rows.filter(r=>r.testSet==='Test_L3_R1'&&r.history.length>=34).slice(0,10);
 if(starts.length!==10)throw Error('frozen 10 exact original endgame roots not available');
 const errors=[],games=[];let scoresQueried=0,realPlies=0;
 function outcome(v){return v>0?'WIN':v<0?'LOSS':'DRAW'}
 for(const root of starts)for(let variant=0;variant<3;variant++){
  const oracle=new ExactConnect4Oracle();
  let word=root.history;
  let state=obs.board(word),strongMoves=0,nonStrongButWDL=0;
  const expected=Array.from(oracle.analyzeSequence(word));
  if(JSON.stringify(expected)!==JSON.stringify(root.externalPerAction)||
    Math.max(...expected)!==root.score)
   errors.push({kind:'ORACLE_EXTERNALLY_CALIBRATED_PARENT_MISMATCH',row:root.row});
  const trace=[];
  for(let steps=0;state.terminal===null&&steps<42-root.history.length;steps++){
   const scores=Array.from(oracle.analyzeSequence(word));scoresQueried++;
   const best=Math.max(...scores),bestSign=outcome(best);
   const good=scores.flatMap((v,c)=>v!==-1000&&outcome(v)===bestSign?[c+1]:[]);
   if(!good.length){errors.push({kind:'NO_OUTCOME_OPTIMAL_LEGAL_MOVE',row:root.row});break;}
   const col=good[(state.ply+variant)%good.length],chosen=scores[col-1];
   if(chosen===best)strongMoves++;else nonStrongButWDL++;
   const movement=obs.move(state,col);
   word+=col;state=obs.board(word);const after=obs.observe(state);
   if(after.distinctGeometricallySurviving!==movement.survivingDistinctAfter)
    errors.push({kind:'PHYSICAL_SOURCE_LINE_METRICS_DIFFER',row:root.row,col});
   trace.push({absolutePly:state.ply,move:col,
    ownerJustMoved:state.ply%2?'P0':'P1',
    exactCurrentRootOutcomeCategory:bestSign,
    chosenStrongScore:chosen,highestStrongScore:best,
    choicesInWDLCategory:good.length,
    geometricallySurvivingU:after.distinctGeometricallySurviving,
    P0Live:after.liveForP0,P1Live:after.liveForP1,
    deadForBoth:after.dead,emptyForBoth:after.empty,
    ownerLayerMultiplicity:after.bothOwnerLayerMultiplicity,
    firstWinTerminal:state.terminal});
   realPlies++;
  }
  if(state.terminal===null)errors.push({kind:'ORIGINAL_WDL_OPTIMAL_PATH_DID_NOT_END',row:root.row,variant});
  const last=obs.observe(state);
  games.push({externallyQualifiedParentRow:root.row,originalParentHistory:root.history,
   parentAbsolutePly:root.history.length,qualifiedScoreRoot:root.score,
   tieVariant:variant,sourceGameOutcomeFromActualFirstWin:state.terminal,
   fullOriginalHistory:word,exactWDLOptimalMovesChosen:trace.length,
   strictStrongOptimalSteps:strongMoves,
   WDLcorrectButStrongSuboptimalSteps:nonStrongButWDL,
   firstWinStopPly:state.ply,
   terminalGeometricallyUnblockedDistinctK4Lines:last.distinctGeometricallySurviving,
   terminalP0LiveK4Lines:last.liveForP0,terminalP1LiveK4Lines:last.liveForP1,
   trace});
 }
 const near=[],terminal={},byPly={};
 for(const g of games){
  terminal[g.terminalGeometricallyUnblockedDistinctK4Lines]=(terminal[g.terminalGeometricallyUnblockedDistinctK4Lines]??0)+1;
  for(const x of g.trace){
   if(x.geometricallySurvivingU===27||x.geometricallySurvivingU===28)
    near.push({initialParentRow:g.externallyQualifiedParentRow,variant:g.tieVariant,ply:x.absolutePly,U:x.geometricallySurvivingU});
   const key=x.absolutePly,agg=byPly[key]??{n:0,totalU:0,hits27or28:0};
   agg.n++;agg.totalU+=x.geometricallySurvivingU;
   agg.hits27or28+=(x.geometricallySurvivingU===27||x.geometricallySurvivingU===28);
   byPly[key]=agg;
  }
 }
 return {status:errors.length?'QUALIFIED_ORIGINAL7X6_WDL_EQUIVALENT_TAIL_CHECK_FAILED':
   'QUALIFIED_ORIGINAL7X6_CONDITIONALLY_PERFECT_WDL_CLASS_TAILS_PASS',
  strictOriginalBoard:[7,6,4],
  trueGravityFirstWinStopped:true,qualifiedRoots:starts.length,
  gameVariants:games.length,testOracleTotalCalls:scoresQueried,
  originalFuturePhysicalMovesValidated:realPlies,
  strictStrongOptimalSteps:games.reduce((a,g)=>a+g.strictStrongOptimalSteps,0),
  WDLcorrectButStrongSuboptimalSteps:games.reduce((a,g)=>a+g.WDLcorrectButStrongSuboptimalSteps,0),
  exactWDLclassDefinition:'WIN all scores positive if attainable; else DRAW score0; else LOSS all legal negative scores; no heuristic preference for win-distance or loss-delay',
  originalTerminalUHistogram:terminal,
  near27or28OnAnyTestedFutureOptimalMove:near,
  distinctTerminalOneBasedGameHistories:new Set(games.map(g=>g.fullOriginalHistory)).size,
  originalTerminalOutcomes:games.reduce((o,g)=>(o[g.sourceGameOutcomeFromActualFirstWin]=(o[g.sourceGameOutcomeFromActualFirstWin]??0)+1,o),{}),
  byAbsolutePly:Object.fromEntries(Object.entries(byPly).map(([k,v])=>
   [k,{...v,meanU:v.totalU/v.n}])),
  allConditionalGameHistoryRecords:games,
  explicitEarlierHistoryMayHavePlayedImperfectly:true,
  originalRootPerfectPlayDistributionNotEstablished:true,
  futureRootSourceWDLNonsearchAlgorithmNotEstablished:true,
  errors:errors.slice(0,8)};
}
