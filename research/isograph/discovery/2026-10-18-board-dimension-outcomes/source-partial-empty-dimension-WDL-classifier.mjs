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
 if(K===4&&Math.min(W,H)<4)
  return exact(0,'INHERITED_20260914_K4_THIN_BOARD_DRAW_DEDUCTIVE_THEOREM');
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
