// SOURCE-ONLY revised HYPOTHESIS, genuine W7,H6,K4 first-win-free
// game state after 444444 (P0 to move). Uses SIGNED singleton Walsh
// coefficient of static 12 P1 cubic clauses to choose which currently
// playable virgin vertical pair P0 opens. NO source game-tree search.
// The induction proving pairing/gravity legality is INDEPENDENT OF
// the static Fourier choice. P1 no-firstwin claim UNPROVED.
// Earlier UNSIGNED failure 44444421122333 remains preserved.
import {sourceTrue7x6Canonical18WalshAnalysis}
 from './source-true7x6-canonical-fourier-walsh-18bit.mjs';
export function sourceOriginal7x6SignedWalshP0PendingPair(){
 const f=sourceTrue7x6Canonical18WalshAnalysis();
 const cols=[0,1,2,4,5,6],root=[0,0,0,6,0,0,0],
  signed=f.singletonUnnormalizedWalsh.slice();
 if(signed.length!==18||f.board.W!==7||f.board.H!==6||f.board.K!==4)
  throw Error('wrong original geometric signed Walsh input');
 function validate(h) {
  if(!Array.isArray(h)||h.length!==7||
    h.some((v,c)=>!Number.isInteger(v)||v<0||v>6||(c===3&&v!==6)))
   throw Error('not an original 444444 full-center height state');
 }
 function selectedVirgin(h){
  validate(h);
  const candidates=[];
  for(let k=0;k<cols.length;k++){
   const c=cols[k],r=h[c];
   if(r>=6||(r&1))continue;
   const pairIndex=3*k+r/2;
   candidates.push({literalColumn:c+1,originalColumn:c,zeroBasedRow:r,
    pairIndex,exactSignedWalshNumerator:signed[pairIndex]});
  }
  candidates.sort((a,b)=>a.exactSignedWalshNumerator-b.exactSignedWalshNumerator||
    a.originalColumn-b.originalColumn||a.zeroBasedRow-b.zeroBasedRow);
  return candidates;
 }
 function initial() {
  const v=selectedVirgin(root)[0];
  if(!v)throw Error('true original 444444 root no playable pair');
  return {...v,kind:'P0_PENDING_LOWER_SELECT_MIN_SIGNED_WALSH'};
 }
 function reply({heightBeforeP1:h,P1OriginalColumn:c}){
  validate(h);
  if(!Number.isInteger(c)||c<0||c>=7||c===3||h[c]>=6)
   throw Error('P1 attacked an illegal original physical cell');
  const pending=cols.filter(j=>(h[j]&1));
  if(pending.length!==1)throw Error('source pending invariant broken');
  const attackedRow=h[c],next=h.slice();next[c]++;
  if(c===pending[0]) {
   if(attackedRow%2!==1)
    throw Error('P1 closing pending P0-lower has wrong original row');
   const avail=selectedVirgin(next);
   if(!avail.length){
    if(next.some(z=>z!==6))throw Error('nonterminal P1 move consumed final response resource');
    return {status:'FULL_BOARD_AFTER_P1',P0LiteralColumn:null};
   }
   const take=avail[0];
   return {status:'ORIGINAL_P0_LEGAL_REPLY',
    P0LiteralColumn:take.literalColumn,P0RowZeroBased:take.zeroBasedRow,
    nextPendingPairIndex:take.pairIndex,
    kind:'P1_CLOSED_PENDING_P0_OPENS_NEW_MIN_SIGNED_WALSH'};
  }
  if(attackedRow%2!==0||attackedRow>=6-1)
   throw Error('P1 virgin pair must enter at playable lower even row');
  return {status:'ORIGINAL_P0_LEGAL_REPLY',
   P0LiteralColumn:c+1,P0RowZeroBased:attackedRow+1,
   nextPendingPairIndex:3*cols.indexOf(pending[0])+(h[pending[0]]-1)/2,
   kind:'P1_ENTERED_VIRGIN_LOWER_P0_REPLY_IMMEDIATE_UPPER'};
 }
 return Object.freeze({status:'SOURCE_TRUE7X6_444444_SIGNED_WALSH_P0_PENDING_CANDIDATE',
  originalBoard:[7,6,4],genuineFirstWinFreePrefix:'444444',
  P0OpeningAfterCenterCompletes:initial(),
  singletonStaticFourierWalshNumerators:signed,
  initialOriginalColumnHeightVector:root,
  all18OuterPairLabels:cols.flatMap((c,k)=>[0,2,4].map((r,j)=>({pairIndex:3*k+j,c,r}))),
  response:reply,
  exactSourceStrategyInvariant:'ONE P0 LOWER PENDING PAIR, OTHER PAIRS VIRGIN OR COMPLETE SPLIT; center full',
  originOfSignedDirection:'E[f12|lowerP0]-E[f12|lowerP1]=2 WalshNumerator/262144',
  P1FirstWinSuppression:'UNPROVEN_HYPOTHESIS',
  sourceWDLValuesComputed:0,sourceAlternativeOpponentGameFuturesEvaluated:0});
}
