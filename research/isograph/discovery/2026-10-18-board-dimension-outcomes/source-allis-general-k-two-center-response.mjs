// Source-only fixed defender P1 response contract generalizing Victor Allis
// (1988, K4 W<=6 even-height) to K>=4 and K<=W<=2K-2, even H.
// Proven in docs/research/2026-10-18-allis-central-two-column-general-k-even-height-nonwin.md
// ZERO alternative future game-value evaluation, no game-tree traversal.
// Status: research candidate theorem until independently qualified.
export function createGeneralKCentralSecondNonWin({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<2||K<4||
    H%2!==0||W<K||W>2*K-2)
  throw Error('source guard K>=4, even H, K<=W<=2K-2 required');
 const u=W-K,v=u+1;
 function reply({heightsBeforeP0:h,p0Column:c}){
  if(!Array.isArray(h)||h.length!==W||h.some(t=>!Number.isInteger(t)||t<0||t>H)||
     !Number.isInteger(c)||c<0||c>=W||h[c]>=H)
   throw Error('original P0 legal landing heights required');
  let respond=-1,kind='';
  if(c!==u&&c!==v){
   if(h[c]%2!==0||h[c]+1>=H)
    throw Error('outer immediate odd-row P1 mate guard violated');
   respond=c;kind='ALLIS_OUTER_SAME_COLUMN_EVEN_HEIGHT_RESPONSE';
  }else{
   const a=h[u],b=h[v];
   if(a===0&&b===0){
    respond=(c===u?v:u);
    kind='INITIAL_TWO_CENTER_BOTTOM_SPLIT';
   }else if(a<H&&b<H){
    if((a&1)!==1||(b&1)!==1)
     throw Error('both-center live odd-height invariant violated');
    if(h[c]===H-1){
     respond=c===u?v:u;
     kind='CENTER_TOP_FULL_MIGRATE_TO_OTHER';
    }else{
     respond=c;kind='CENTER_ODD_ROW_TO_EVEN_ROW_LOCAL_PAIR';
    }
   }else {
    const other=c===u?v:u;
    if(h[other]!==H||h[c]%2!==0||h[c]+1>=H)
     throw Error('single-live-center even-height postmigration invariant violated');
    respond=c;kind='POSTMIGRATION_SINGLE_CENTER_PAIR';
   }
  }
  const p0Row=h[c],p1Row=h[respond]+(respond===c?1:0);
  if(p1Row>=H)throw Error('source planned response not gravity-playable');
  return {originalP1Column:respond,originalP0Row:p0Row,
    originalP1Row:p1Row,responseKind:kind,
    sourceFutureGameStatesValued:0,sourceAlternativePoliciesSearched:0};
 }
 return Object.freeze({originalDimensions:{W,H,K},centralPair:[u,v],
  originalP0relativeValueUpperBound:0,originalP0relativeWDL:null,
  exactConsequence:'P1_CAN_PREVENT_P0_FIRST_WIN',
  classicalAttribution:'Victor Allis 1988 §2.2 K4 W<=6 even H; this is K>=4 symbolic extension',
  reply,sourceFutureGameStatesValued:0});
}
