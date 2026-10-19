// Frozen source-only CONSTRUCTIVE LEGAL DRAW HISTORY (not perfect-play strategy).
// Theorem: docs/research/2026-10-18-all-finite-k4plus-existential-draw-constructive-width-parity-theorem.md
// Original width x height gravity game K>=4. For even-width prefix,
 // fill each complete row in horizontal scan direction determined by
// the 0011 vertical stripe phase. For odd width, append a lone column.
// Makes NO game outcome valuation and no alternative future game search.
export function createUniversalK4PlusDrawWord({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<4||W*H>100000)
  throw Error('positive finite dimensions, K>=4, and producer resource bound required');
 const even=W-(W&1),history=[];
 for(let r=0;r<H;r++){
  const reverse=((r>>1)&1)===1;
  if(reverse)for(let c=even-1;c>=0;c--)history.push(c+1);
  else for(let c=0;c<even;c++)history.push(c+1);
 }
 if(W&1)for(let r=0;r<H;r++)history.push(W);
 if(history.length!==W*H)throw Error('source constructive word size');
 return {
  status:'ORIGINAL_K4PLUS_EXPLICIT_COOPERATIVE_DRAW_HISTORY',
  originalDimensions:{W,H,K},originalLiteralColumnWord:history,
  decomposition:{evenWidthPrefix:even,unmatchedTailColumns:W&1,
   rowPhase:'floor(row/2) mod 2, scan right-to-left if 1',
   tail:'rightmost column played bottom-up after even-width prefix'},
  intendedResult:'LEGAL_FILLED_BOARD_WITH_NO_K_LINE',
  sourceStrategicGameStatesSearched:0,sourceAlternativePoliciesEvaluated:0,
  sourceWdlScalar:null,
  note:'Existence of a legal DRAW history; NOT a perfect-play drawing strategy'
 };
}
