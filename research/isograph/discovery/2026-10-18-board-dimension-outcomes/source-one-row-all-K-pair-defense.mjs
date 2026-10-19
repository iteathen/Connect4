// Exact source H=1 empty WDL across any W,K>=1, plus K>=3 no-win pair
// response for EITHER defender. Frozen theorem:
// docs/research/2026-10-18-one-row-all-k-total-empty-wdl-law.md
// ZERO future strategic game value evaluations, no recursive states.
export function classifyOneRowEmpty({width:W,connect:K}){
 if(!Number.isInteger(W)||W<1||!Number.isInteger(K)||K<1)
  throw Error('requires positive width and connection length at H=1');
 return {width:W,height:1,connect:K,
  P0relativeWDL:(K===1||K===2&&W>=3)?1:0,
  theorem:'EXACT_NON_SEARCH_ONE_ROW_ALL_K',
  sourceFutureStrategicGameValuesEvaluated:0};
}
export function createOneRowPairDefender({width:W,connect:K,defender:D}){
 if(![W,K,D].every(Number.isInteger)||W<1||K<3||(D!==0&&D!==1))
  throw Error('one-row both-player pairing only for positive W and K>=3');
 const pairable=W-(W&1);
 function firstMove(){
  if(D!==0)throw Error('only first-player defender opens');
  return 1;
 }
 function response({occupiedAfterAttacker,attackerOriginalColumn}){
  const own=occupiedAfterAttacker;
  if(!Array.isArray(own)||own.length!==W||
    own.some(x=>x!==true&&x!==false)||!Number.isInteger(attackerOriginalColumn)||
    attackerOriginalColumn<1||attackerOriginalColumn>W||
    own[attackerOriginalColumn-1]!==true)
   throw Error('invalid physical H1 occupied source mask or opponent action');
  const a=attackerOriginalColumn-1;
  if(a<pairable) {
   const mate=a^1;
   if(!own[mate])return {column:mate+1,
    kind:'MATE_AVAILABLE_HORIZONTAL_SPLIT',sourceFutureGameValues:0};
  }
  for(let c=0;c<W;c++)if(!own[c])return {column:c+1,
   kind:'SOURCE_DISCRETIONARY_AVAILABLE_CELL',sourceFutureGameValues:0};
  return {column:null,kind:'H1_FULL_BOARD_NO_REPLY'};
 }
 return Object.freeze({firstMove,response,defender:D,attacker:1-D,
  theorem:'PREVENT_OPPONENT_ANY_HORIZONTAL_K_WIN',
  gameValuesSearched:0});
}
