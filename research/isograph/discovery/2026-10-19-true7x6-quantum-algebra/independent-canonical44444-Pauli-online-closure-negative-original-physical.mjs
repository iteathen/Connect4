// Independent ORIGINAL true W7 H6 K4 first-win-stopped physical
// falsification of enforcing ONE frozen static 4-Pauli-check witness.
 // No other geometry, no source WDL or alternative future game tree.
import {sourceCanonical44444PauliMatchedCausalAndOneBody}
 from './source-canonical44444-Pauli-dual-veto-and-onebody-cover.mjs';
function reconstructPhysicalOriginalW7H6K4(wordOneBased) {
 const W=7,H=6,K=4, dirs=[[1,0],[0,1],[1,1],[1,-1]],
  geometry=[],board=Array(42).fill(-1),h=Array(W).fill(0),trace=[];
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of dirs){
  const xc=c+3*dx,yr=r+3*dy;
  if(xc<0||xc>=W||yr<0||yr>=H)continue;
  const sites=Array.from({length:4},(_,j)=>(r+j*dy)*W+c+j*dx);
  geometry.push(sites);
 }
 if(geometry.length!==69)throw Error('incorrect original K4 69-line setup');
 for(let t=0;t<wordOneBased.length;t++){
  const c=Number(wordOneBased[t])-1,p=t%2;
  if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)
   throw Error('physical nonlegal column in original prefix at t='+t);
  const r=h[c]++,site=r*7+c;
  if(board[site]!==-1)throw Error('physical ownership collision');
  board[site]=p;
  const win=geometry.some(L=>L.includes(site)&&L.every(z=>board[z]===p));
  trace.push({ply:t+1,oneBasedColumn:c+1,zeroBasedRow:r,player:p,
   originalWinningK4Occurred:win});
  if(win)throw Error('unexpected physically first-won before end of expected prefix');
 }
 return {W,H,K,originalWinlines:geometry.length,board,h,trace,
  originalFutureMoverAfterPrefix:wordOneBased.length%2};
}
export function independentCanonicalPauliFourCheckOnlineNegative(){
 const proposed=sourceCanonical44444PauliMatchedCausalAndOneBody();
 const src=proposed.restrictedOneBodyExtraStabilizerCover.oneStaticCertificate;
 const local=src.find(x=>x.pairVariable===0);
 const errors=[];
 if(!local||local.fixedLowerOwnerBit!==0||src.length!==4)
  errors.push({type:'FROZEN_FOUR_STABILIZER_SOURCE_WITNESS_NOT_EXPECTED'});
 const root=reconstructPhysicalOriginalW7H6K4('44444');
 const after=reconstructPhysicalOriginalW7H6K4('444441');
 const prospectiveCell=0,physicalOwner=after.board[prospectiveCell];
 if(root.board[prospectiveCell]!==-1||
    root.originalFutureMoverAfterPrefix!==1||root.h[0]!==0||
    physicalOwner!==1||after.trace[5].player!==1||
    after.trace[5].oneBasedColumn!==1||
    after.trace[5].zeroBasedRow!==0||
    after.trace[5].originalWinningK4Occurred)
   errors.push({type:'REAL_GAME_P1_CAN_STEAL_P0_FIXED_FUTURE_CELL_NOT_CONFIRMED'});
 const rootPhysicalOriginalLegalColumns=root.h.flatMap((x,c)=>x<6?[c+1]:[]);
 if(rootPhysicalOriginalLegalColumns.length!==7)
  errors.push({type:'TRUE_CANONICAL_ROOT_NOT_SEVEN_LEGAL_COLUMNS'});
 return {status:errors.length?'PHYSICAL_FOURCHECK_ENFORCEMENT_TEST_FAILED':
  'TRUE7X6_STATIC_4CHECK_SOURCE_ONLINE_NONCLOSURE_PHYSICAL_CONFIRMED',
  originalDimensions:[7,6,4],
  sourceStaticFourCheckWitness:src,
  counterHistoryOneBased:'444441',
  originalRanksChecked:after.trace.length,
  originalFullGeometricK4LinesChecked:after.originalWinlines,
  sourceP0RequiredFuturePair0LowerOwner:0,
  actualP1ChosenPhysicalCell:{originalLiteralColumn:1,rowOneBased:1,
   physicalOriginalID:0,actualOwnerBit:physicalOwner},
  originalRootLegalLiteralColumns:rootPhysicalOriginalLegalColumns,
  chosenP1MoveIsLegal:true,
  P1FirstWinBeforeDisruption:false,
  selectedStaticOneBodyCheckCannotHoldInAllOpponentsFutures:true,
  noFutureP0ReplyCanChangeOccupiedOriginalCell:true,
  everyAlternateStaticFourCheckWitnessRejected:false,
  originalWDLOrBestProved:null,
  sourceGameTreeValuesSearched:0,errors};
}
