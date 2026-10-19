// SOURCE-only symbolic P0 vertical followup / upper support mirror.
// Formal theorem (frozen before physical tests):
// docs/research/2026-10-19-p0-top-support-mirror-horizontal-only-common-kernel-exact-draw.md
// For K>=3, H<K, K<=W<=2K-1 gives P0 forced NONLOSS (V>=0);
// if WH even, independent fixed P1 drawing policy composes to exact DRAW.
export function createP0TopSupportMirrorHorizontalKernel({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<3||H>=K||
    W<K||W>2*K-1||W*H>100000)
   throw Error('original source guard K>=3 H<K K<=W<=2K-1 required');
 const anchor=W-K;
 function opening(){return anchor}
 function reply({heightsBeforeP1:h,p1Column:c}){
   if(!Array.isArray(h)||h.length!==W||
      h.some(x=>!Number.isInteger(x)||x<0||x>H)||
      !Number.isInteger(c)||c<0||c>=W||h[c]>=H)
     throw Error('original source legal P1 landing heights required');
   const r=h[c];
   if(r+1<H)
      return {p0Column:c,p0LandingRow:r+1,
       kind:'P0_DIRECT_UPPER_MATE_SUPPORT_MIRROR'};
   for(let j=0;j<W;j++)if(j!==c&&h[j]<H)
      return {p0Column:j,p0LandingRow:h[j],
       kind:'P0_LEFTMOST_NONFULL_PREEMPT_AFTER_COLUMN_COMPLETE'};
   return {p0Column:null,p0LandingRow:null,
       kind:'FULL_BOARD_DRAW_NO_P0_RESPONSE'};
 }
 return Object.freeze({
  originalDimensions:{W,H,K},firstOriginalColumn:anchor,opening,reply,
  commonKSpan:{first:W-K,last:K-1,size:2*K-W},
  P0relativeLowerBound:0,P0relativeExactWDL:((W*H)%2===0)?0:null,
  exactDrawWhenEvenArea:true,
  sourceFutureGameStatesMaterialized:0,sourceGameValueQueries:0,
  sourceAlternativeOpponentPoliciesSearched:0
 });
}
