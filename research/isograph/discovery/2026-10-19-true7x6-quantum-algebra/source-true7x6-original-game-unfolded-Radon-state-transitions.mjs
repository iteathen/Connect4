// SOURCE exact original Connect4 W7,H6,K4 gravity FIRST-WIN-STOPPED
// colored physical board state conjugacy to TWO 73-component INTEGER
// unfolded-Fourier/Radon signals: 69 genuine 4-cell winning-window
// sums + 4 active full-strand DC sums. Signals represent OCCUPIED
// and P0-owned physical bits separately; P1 = OCC-P0.
// No future search, no QBF/BDD, no minimax, no game-WDL prediction.
// Frozen math: docs/research/2026-10-19-true7x6-Fourier-Radon-game-state-conjugacy-two-field-exact-native-winline-terminal.md
import {sourceOriginal7x6UnfoldedRadonDC}
 from './source-true7x6-unfolded-seven-DC-Radon-syndrome.mjs';
export function sourceTrue7x6RadonGameStateMachine(){
 const F=sourceOriginal7x6UnfoldedRadonDC(),
  measurements=F.Rational.sourceMeasurements.map(ids=>ids.slice()),N=73;
 if(measurements.length!==73||F.Rational.fullAugmentedRank!==42)
  throw Error('expected information complete true W7H6K4 integer DC frame');
 const maskByCell=Array.from({length:42},(_,cell)=>measurements.map(L=>
  L.includes(cell)?1:0));
 function start(){
  return {h:Array(7).fill(0),occupied:Array(N).fill(0),
   P0:Array(N).fill(0),terminal:null,ply:0};
 }
 function step(s,column){
  if(!s||s.terminal!==null||!Array.isArray(s.h)||s.h.length!==7||
    !Array.isArray(s.occupied)||s.occupied.length!==N||
    !Array.isArray(s.P0)||s.P0.length!==N)
   throw Error('original source nonterminal Radon signature required; cannot act after first terminal');
  if(!Number.isInteger(column)||column<0||column>=7||s.h[column]>=6)
   throw Error('original physically legal 0-based literal column required');
  const ply=s.h.reduce((a,b)=>a+b,0);
  if(s.ply!==ply||s.h.some(v=>!Number.isInteger(v)||v<0||v>6))
   throw Error('real original gravity/turn parity source signature invalid');
  const mover=ply%2,physicalCell=s.h[column]*7+column;
  const h=s.h.slice();h[column]++;
  const occupied=s.occupied.slice(),P0=s.P0.slice();
  for(let i=0;i<N;i++){
   const bit=maskByCell[physicalCell][i];
   occupied[i]+=bit;
   if(mover===0)P0[i]+=bit;
  }
  let terminal=null,winline=null;
  for(let i=0;i<69;i++){
   const own=mover===0?P0[i]:occupied[i]-P0[i];
   if(own===4){terminal=mover===0?'P0_WIN':'P1_WIN';winline=i;break}
  }
  if(terminal===null&&h.every(v=>v===6))terminal='DRAW';
  return {h,occupied,P0,terminal,ply:ply+1,
   lastPhysicalCell:physicalCell,
   lastOriginalColumn:column,
   currentLastMover:mover,
   originalFirstWinLineIndex:winline,
   sourceGameFuturesValued:0};
 }
 function encodeFullPhysicalFields(occupiedMask,P0Mask){
  if(!Array.isArray(occupiedMask)||occupiedMask.length!==42||
    !Array.isArray(P0Mask)||P0Mask.length!==42||
    occupiedMask.some(x=>x!==0&&x!==1)||
    P0Mask.some((x,i)=>x!==0&&x!==1||x>occupiedMask[i]))
   throw Error('two actual physical source binary fields required, P0 subset occupied');
  return {occupied:measurements.map(L=>L.reduce((a,i)=>a+occupiedMask[i],0)),
   P0:measurements.map(L=>L.reduce((a,i)=>a+P0Mask[i],0))};
 }
 return Object.freeze({
  status:'SOURCE_TRUE7X6_K4_RADON_COLORED_ORIGINAL_GAME_CONJUGACY',
  board:[7,6,4],realPhysicalCellCount:42,
  originalPhysicalK4WindowSums:69,fullStrandDCCounts:4,
  originalPhysicalSignalRankQ:42,
  countChannels:['occupied','P0-owned'],
  frame73PhysicalSiteImpulseTable:maskByCell,
  exactMoveUpdate:'(Fo,Fp,h) -> (Fo+Fe,Fp+[mover=P0]Fe,h+unit_column)',
  firstWinStopInNativeWindowSums:'P0 iff any (Fp)[L]=4, P1 iff any (Fo-Fp)[L]=4 on legal current move; then stop',
  physicalStateReconstructionPossibleFrom73Signals:true,
  sourceNoFutureOriginalGameValueEvaluations:0,
  noPerfectPlayWDLOrBestMoveProof:true,
  start,step,encodeFullPhysicalFields
 });
}
