// Symbolic no-search pair-defense policy for original narrow W<K Connect-K.
// Research theorem: docs/research/2026-10-18-arbitrary-k-narrow-width-exact-draw-response-theorem.md
// Any attacker row2j lower of untouched vertical pair induces an immediately
// legal defender upper-mate reply row2j+1. All K>=3 vertical K-runs contain a pair.
export function createNarrowWidthKDrawDefense({width:W,height:H,connect:K,defender:D}){
 if(![W,H,K,D].every(Number.isInteger)||W<1||H<1||K<3||W>=K||!(D===0||D===1))
  throw Error('source vertical co-release strategy requires original W<K and K>=3');
 function firstMove(){
  if(D!==0)throw Error('only P0 defender opens');
  return 0;
 }
 function response({heightBeforeAttack,attackerColumn,attackerRow}){
  const h=heightBeforeAttack.slice();
  if(!Array.isArray(h)||h.length!==W||h.some(x=>!Number.isInteger(x)||x<0||x>H))
   throw Error('original legal height vector required');
  const c=attackerColumn,r=attackerRow;
  if(!Number.isInteger(c)||c<0||c>=W||h[c]!==r||r>=H)
   throw Error('original attacking drop not at column frontier');
  h[c]++;
  if(r%2===0&&r+1<H)return {column:c,kind:'VERTICAL_IMMEDIATE_UPPER_PAIR_MATE',
    mateOriginalRow:r+1,expectedLegalHeight:h[c]};
  for(let i=0;i<W;i++)if(h[i]<H)
   return {column:i,kind:'SAFE_DISCRETIONARY_DEFENDER_DROP'};
  return {column:null,kind:'BOARD_FULL_NO_REPLY_NEEDED'};
 }
 return Object.freeze({defender:D,attacker:1-D,firstMove,response,
  sourceOriginalFutureGamesValued:0});
}
