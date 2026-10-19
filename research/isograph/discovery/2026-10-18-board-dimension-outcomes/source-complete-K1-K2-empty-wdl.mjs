// Research SOURCE-ONLY complete exact empty-board WDL for Connect-1/2.
// All positive W,H; ordinary original gravity, alternating ownership.
// Frozen proof: docs/research/2026-10-18-total-dimension-wdl-classification-connect1-connect2.md
// No minimax, recursion, evaluated successor q, oracle values or policy tree.
export function classifyK1K2EmptyBoard({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||!(K===1||K===2))
  throw Error('exact dimension classifier supports only K=1 or K=2 and positive W,H');
 if(K===1) return {
  status:'EXACT_EMPTY_ROOT_P0_WIN',P0relativeWDL:1,
  sourceOriginalFirstMoveColumn:1,
  sourceWitness:'K1 first stone makes geometric length-one winning line',
  sourceFutureStrategicGameWDLValuesEvaluated:0
 };
 if(W===1||(W===2&&H===1))return {
  status:'EXACT_EMPTY_ROOT_DRAW',P0relativeWDL:0,
  sourceWitness:W===1?'ONE_COLUMN_ALTERNATION_NEVER_MONO_K2':
                           'ONE_ROW_TWO_COLS_FILLED_ONE_STONE_PER_PLAYER',
  sourceFutureStrategicGameWDLValuesEvaluated:0
 };
 const firstCol=H===1?2:1;
 function p0SecondMoveAfterReply({opponentOriginalColumn}){
  if(!Number.isInteger(opponentOriginalColumn)||opponentOriginalColumn<1||
     opponentOriginalColumn>W)
   throw Error('original legal P1 response column required');
  if(H===1) {
   if(opponentOriginalColumn===firstCol)throw Error('illegal opponent duplicate in one row');
   return opponentOriginalColumn===1?3:1;
  }
  return 2;
 }
 return {
  status:'EXACT_EMPTY_ROOT_P0_WIN',P0relativeWDL:1,
  sourceOriginalFirstMoveColumn:firstCol,
  sourceWinOnP0SecondTurn:true,
  sourceResponseRule:H===1?
   'P0 opens col2; after P1 pick free neighbor among col1/col3':
   'P0 opens col1; after P1 plays col2 bottom reply col2 above, otherwise reply col2 bottom',
  p0SecondMoveAfterReply,
  sourceFutureStrategicGameWDLValuesEvaluated:0
 };
}
