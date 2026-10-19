// Source-only P0 opening/responder for odd width and odd height H<K,
// K>=3, ordinary ORIGINAL gravity and alternating ownership. The proof
// guarantees a DRAW against all P1 policies; scalar root bound V>=0, not
// an exact DRAW if P0 has another winning strategy.
// Frozen math before physical check:
// docs/research/2026-10-19-horizontal-only-area-parity-complementary-defender-theorem.md
export function createHorizontalOnlyOddAreaFirstDraw({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<3||H>=K||
   (W&1)!==1||(H&1)!==1)
  throw Error('guard: odd W, odd H, H<K, K>=3 required');
 const spare=W-1;
 function opening(){return spare;}
 function reply({heightsBeforeP1:h,p1Column:c}){
  if(!Array.isArray(h)||h.length!==W||h.some(v=>!Number.isInteger(v)||v<0||v>H)||
      !Number.isInteger(c)||c<0||c>=W||h[c]>=H)
   throw Error('original legal P1 drop requires physical heights');
  const row=h[c];
  if(c===spare){
   if((row&1)!==1||row+1>=H)
    throw Error('odd-height spare release guard violated');
   return {originalP0Column:c,originalP1Row:row,originalP0Row:row+1,
    kind:'P0_SPARE_VERTICAL_UPPER_MATE',sourceFutureGameWDLValues:0};
  }
  const mate=c^1;
  if(h[mate]!==row)
   throw Error('paired original column mirror equal-height invariant violated');
  return {originalP0Column:mate,originalP1Row:row,originalP0Row:row,
   kind:'P0_HORIZONTAL_SAME_ROW_PAIR',sourceFutureGameWDLValues:0};
 }
 return Object.freeze({status:'SOURCE_PROVED_P0_CAN_FORCE_DRAW_ON_ODD_AREA_HORIZONTAL_ONLY',
  dimensions:{W,H,K},firstColumnZeroBased:spare,opening,reply,
  P0relativeLowerBound:0,P0relativeExactWDL:null,
  sourceAlternativeFuturePoliciesEnumerated:0,
  sourceGameTreeNodesConstructed:0,sourceFutureGameWDLValuesEvaluated:0});
}
