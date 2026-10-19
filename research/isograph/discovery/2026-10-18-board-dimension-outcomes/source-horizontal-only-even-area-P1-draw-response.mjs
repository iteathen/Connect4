// Source-only P1 policy for original EMPTY gravity Connect-K when H<K,
// K>=3, W*H even. Opponent-universal DRAW guarantee under SOURCE theorem:
// docs/research/2026-10-18-general-k-horizontal-only-even-area-second-player-draw-policy.md
// It is a value BOUND (V<=0), not proof exact root V=0.
export function createHorizontalOnlyEvenAreaSecondDraw({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<3||H>=K||(W*H)%2!==0)
  throw Error('guard: positive W,H, K>=3, H<K, W*H even');
 const evenCols=W-(W&1);
 function reply({heightsBeforeP0,p0Column}){
  const h=heightsBeforeP0;
  if(!Array.isArray(h)||h.length!==W||
     h.some(x=>!Number.isInteger(x)||x<0||x>H)||
     !Number.isInteger(p0Column)||p0Column<0||p0Column>=W||
     h[p0Column]>=H)
   throw Error('requires legal original height and P0 landing');
  let c=p0Column,r=h[c],partner;
  if(c<evenCols){
   partner=c^1;
   if(h[partner]!==r)throw Error('source clean mirror-pair height guard violated');
  } else {
   if((W&1)!==1||c!==evenCols||H%2||r%2||r+1>=H)
    throw Error('source unmatched column immediate vertical partner guard violated');
   partner=c;
  }
  const afterP0HeightAtPartner=h[partner]+(partner===c?1:0);
  if(afterP0HeightAtPartner>=H)throw Error('source partner has no legal drop');
  return {originalP1Column:partner,
   p0PhysicalRow:r,
   p1PhysicalRow:afterP0HeightAtPartner,
   proofCase:c<evenCols?'SAME_ROW_HORIZONTAL_MIRROR':'UNMATCHED_ODD_WIDTH_VERTICAL_MATE',
   sourceGameQValues:0,sourceFuturePoliciesEnumerated:0};
 }
 return Object.freeze({width:W,height:H,connect:K,reply,
  exactConsequence:'P1_FORCES_DRAW_V_EMPTY_LE_ZERO',
  nonclaim:'NOT_A_PROOF_THAT_P1_CANNOT_FORCE_WIN',
  fixedAdjacentColumnPairs:evenCols/2,hasRightmostUnmatchedColumn:Boolean(W&1),
  futureStrategicGameValuesComputed:0});
}
