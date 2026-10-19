// Combined research-side guarded source-only EMPTY Connect-K dimension
// WDL information classifier. NO game-value search, no future q/policy tree.
// Every statement points to a pre-frozen mathematical source proof.
// Not qualified IsoGraph1.2 authority and not production solver integration.
import {classifyK1K2EmptyBoard} from './source-complete-K1-K2-empty-wdl.mjs';
import {classifyOneRowEmpty} from './source-one-row-all-K-pair-defense.mjs';
export function classifySourceEmptyDimension({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<1)
  throw Error('requires positive integer original W,H,K');
 function exact(value,proof) {
  return {status:'EXACT_EMPTY_ROOT_WDL_BY_SOURCE_DIMENSION_THEOREM',
   originalDimensions:{W,H,K},P0relativeWDL:value,
   P0relativeValueLowerBound:value,P0relativeValueUpperBound:value,
   proof,sourceFutureWdlQueries:0,sourceFutureGameStatesEvaluated:0};
 }
 if(K===1||K===2){
  const x=classifyK1K2EmptyBoard({width:W,height:H,connect:K});
  return exact(x.P0relativeWDL,'TOTAL_K1_K2_CLOSED_DIMENSION_FORMULA');
 }
 if(W<K)return exact(0,'TWO_SIDED_VERTICAL_PAIR_DEFENSE_W_BELOW_K');
 if(H===1){
  const x=classifyOneRowEmpty({width:W,connect:K});
  return exact(x.P0relativeWDL,'ONE_ROW_BOTH_SIDED_ADJACENT_PAIR_DEFENSE_K3PLUS');
 }
 if(K>=3&&H<K&&W>=K&&W<=2*K-1&&((W*H)&1)===0)
  return exact(0,'P0_UPPER_SUPPORT_KERNEL_AND_P1_HORIZONTAL_PAIR_COMPOSE_EXACT_DRAW');
 // Historical 2026-09-14 K4 H<4 two-sided column-pair proof has
 // uncovered P0 first-move and unmatched-column reply gaps. See
 // docs/research/2026-10-19-k4-thin-height-dual-pair-proof-obligation-audit.md.
 // Only the independently proved W<K, H1 and composed even-area
 // horizontal-kernel DRAW families above may return exact DRAW.
 if(K>=3 && H<K && (W*H)%2===1) {
  return {status:'GUARDED_P1_CANNOT_FORCE_WIN_BY_ODD_AREA_P0_MIRROR',
   originalDimensions:{W,H,K},P0relativeWDL:null,
   P0relativeValueLowerBound:0,P0relativeValueUpperBound:1,
   proof:'H_LT_K_ODD_WIDTH_ODD_HEIGHT_P0_OPEN_SPARE_MIRROR_RESPONSE',
   sourceFutureWdlQueries:0,sourceFutureGameStatesEvaluated:0};
 }
 if(K>=4 && H%2===0 && W>=K && W<=2*K-2) {
  return {status:'GUARDED_P0_CANNOT_FORCE_WIN_BY_ALLIS_GENERAL_K_TWO_CENTER',
   originalDimensions:{W,H,K},P0relativeWDL:null,
   P0relativeValueLowerBound:-1,P0relativeValueUpperBound:0,
   proof:'ALLIS_K4_W_LE6_EVEN_HEIGHT_K_GENERALIZATION_TWO_CENTER_P1_RESPONSE',
   attribution:'Allis 1988 K4 W<=6 even H; generalized guarded K>=4 W<=2K-2 here',
   sourceFutureWdlQueries:0,sourceFutureGameStatesEvaluated:0};
 }
 if(H<K&&(W*H)%2===0) {
  return {status:'GUARDED_P0_CANNOT_FORCE_WIN_BY_P1_MIRROR',
   originalDimensions:{W,H,K},P0relativeWDL:null,
   P0relativeValueLowerBound:-1,P0relativeValueUpperBound:0,
   proof:'H_BELOW_K_AND_EVEN_AREA_P1_ALWAYS_DRAW_RESPONSE',
   sourceFutureWdlQueries:0,sourceFutureGameStatesEvaluated:0};
 }
 return {status:'INCOMPLETE_DIMENSION_WDL',
  originalDimensions:{W,H,K},P0relativeWDL:null,
  P0relativeValueLowerBound:-1,P0relativeValueUpperBound:1,
  proof:null,sourceFutureWdlQueries:0,sourceFutureGameStatesEvaluated:0};
}
