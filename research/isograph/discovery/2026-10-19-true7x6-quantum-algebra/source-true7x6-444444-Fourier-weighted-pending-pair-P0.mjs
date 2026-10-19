// Frozen SOURCE-only guarded ORIGINAL W7,H6,K4 policy on the GENUINE
// first-win-free prefix 444444. Center physically FULL after P1 ply6,
// P0 to move. All 18 OUTER true gravity vertical pairs are initially
// virgin. The exact allowed P0 response always preserves exactly one
// P0-lower/empty-upper pending pair after every P0 turn (unless first
// win or actual full board terminates). Choosing which virgin pair is
// determined by independently frozen STATIC 18-bit Walsh influences
// from original canonical44444 12 P1 signed cubics, NOT future WDL.
// P1-FIRST-WIN PREVENTION IS HYPOTHESIS, NOT A CERTIFIED RESULT.
// Source no game tree, future q minimax, QBF, oracle or other board sizes.
import {sourceTrue7x6Canonical18WalshAnalysis}
 from './source-true7x6-canonical-fourier-walsh-18bit.mjs';
export function sourceTrue7x6FourierWeightedP0PendingPair(){
 const q=sourceTrue7x6Canonical18WalshAnalysis();
 if(q.board.W!==7||q.board.H!==6||q.board.K!==4||
    q.oneBitSpectralInfluenceNumerator.length!==18)
  throw Error('standard original Fourier clause source unavailable');
 const cols=[0,1,2,4,5,6],score=q.oneBitSpectralInfluenceNumerator;
 const pairID=(c,r)=>cols.indexOf(c)*3+(r/2);
 const root=[0,0,0,6,0,0,0];
 function requireRealHeight(h){
  if(!Array.isArray(h)||h.length!==7||
    h.some((x,c)=>!Number.isInteger(x)||x<0||x>6||(c===3&&x!==6)))
   throw Error('original current physical 444444 source h invalid');
 }
 function virgin(h){
  requireRealHeight(h);
  const choices=[];
  for(const c of cols){
   const r=h[c];
   if(r>=6||r%2!==0)continue;
   const j=pairID(c,r);
   choices.push({literalColumn:c+1,zeroBasedColumn:c,physicalRow:r,
    pairIndex:j,integerFourierInfluenceNumerator:score[j]});
  }
  return choices.sort((a,b)=>b.integerFourierInfluenceNumerator-a.integerFourierInfluenceNumerator||
    a.zeroBasedColumn-b.zeroBasedColumn||a.physicalRow-b.physicalRow);
 }
 function initialP0(){
  const ready=virgin(root);
  if(!ready.length)throw Error('original center-complete q unexpectedly no virgin');
  return {...ready[0],reason:'FOURIER_MAX_DIRECT_BITFLIP_INFLUENCE_STATIC'};
 }
 function readPending(h){
  requireRealHeight(h);
  const odd=cols.filter(c=>h[c]%2===1);
  if(odd.length!==1)throw Error('P0 pending protocol expects exactly one partly occupied original vertical pair');
  const c=odd[0],r=h[c]-1;
  return {c,r,pairIndex:pairID(c,r)};
 }
 function replyAfterP1({hBeforeP1,attackColumn}){
  requireRealHeight(hBeforeP1);
  if(!Number.isInteger(attackColumn)||attackColumn<0||attackColumn>=7||
      attackColumn===3||hBeforeP1[attackColumn]>=6)
   throw Error('P1 legal original outer column expected');
  const pending=readPending(hBeforeP1);
  const h=hBeforeP1.slice(),attackRow=h[attackColumn]++;
  if(attackColumn===pending.c) {
   if(attackRow!==pending.r+1||h[attackColumn]%2!==0)
    throw Error('P1 pending top original physical row mismatch');
   const candidates=virgin(h);
   if(!candidates.length){
    if(h.some(x=>x!==6))throw Error('No untouched lower pair but non-full');
    return {status:'NO_P0_MOVE_FULL_BOARD_AFTER_P1',P0ReplyOriginalLiteralColumn:null,
     pendingPairClosed:true};
   }
   const x=candidates[0];
   return {status:'SOURCE_P0_REPLY_AVAILABLE',
    P0ReplyOriginalLiteralColumn:x.literalColumn,
    P0ReplyOriginalRow:x.physicalRow,
    pendingPairIndexAfterReply:x.pairIndex,
    reason:'P1_CLOSED_PENDING__FOURIER_PRIORITY_NEW_LOWER_PAIR'};
  }
  if(attackRow%2!==0||attackRow>=6)
   throw Error('P1 attacks only lower row in untouched pair other than pending');
  const afterAttack=h[attackColumn];
  if(afterAttack!==attackRow+1||afterAttack>=6)
   throw Error('P0 immediate upper mate release failed');
  return {status:'SOURCE_P0_REPLY_AVAILABLE',
   P0ReplyOriginalLiteralColumn:attackColumn+1,
   P0ReplyOriginalRow:attackRow+1,
   pendingPairIndexAfterReply:pending.pairIndex,
   reason:'P1_NEW_VIRGIN_LOWER__P0_IMMEDIATE_SAME_COLUMN_UPPER_MATE'};
 }
 return Object.freeze({
  status:'SOURCE_TRUE7X6_444444_FOURIER_WEIGHTED_SINGLE_PENDING_P0_POLICY',
  originalBoard:{W:7,H:6,K:4},
  actualStartingHistoryOneBased:'444444',
  physicalOriginalRootHeight:root,
  firstOriginalP0MoveAfterCenterFull:initialP0(),
  all18OriginalPairInfluenceNumerators:score.slice(),
  pairSourceOrder:cols.flatMap(c=>[0,2,4].map(r=>({c,r,id:pairID(c,r)}))),
  replyAfterP1,
  originalOnlinePairInvariant:'ONE_PENDING_P0_LOWER__ALL_OTHERS_VIRGIN_OR_SPLIT',
  physicalLegalReleaseProof:'P1 attacks virgin lower -> P0 immediate upper; P1 attacks pending upper -> P0 opens another virgin lower; terminal full P1 ends',
  signedP1FirstWinPrevention:'UNPROVED_SOURCE_HYPOTHESIS',
  sourceGameWDLQueries:0,sourceStrategicGameTreeNodesEnumerated:0
 });
}
