// INDEPENDENT ORIGINAL W7,H6,K4 alternating gravity FIRST-WIN-
 // STOPPED true-board simulator for SOURCE two-field Fourier/Radon
// colored-game representation. It independently generates exact
// 69 physical K4 windows and four LONG original full strand DC
// row/diag moment measurements; precomputes a different GF103
// exact LEFT INVERSE to reconstruct real physical occupancy/P0
// owner fields from BOTH 73-signal channels at every genuine move.
// All tests only actual original prespecified histories, no future
// strategic game tree, no WDL oracle and no different board sizes/K.
import {sourceTrue7x6RadonGameStateMachine}
 from './source-true7x6-original-game-unfolded-Radon-state-transitions.mjs';
function independentPhysicalGeometry(){
 const W=7,H=6,K=4,dir=[[1,0],[0,1],[1,1],[1,-1]],lines=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of dir){
  const X=x+3*dx,Y=y+3*dy;
  if(X<0||X>=W||Y<0||Y>=H)continue;
  lines.push([0,1,2,3].map(i=>(y+i*dy)*W+x+i*dx));
 }
 const select={
  H0:Array.from({length:W},(_,c)=>c),
  H1:Array.from({length:W},(_,c)=>W+c),
  H2:Array.from({length:W},(_,c)=>2*W+c),
  Rminus1:Array.from({length:5},(_,c)=>(c+1)*W+c)
 };
 const measurements=lines.concat([select.H0,select.H1,select.H2,select.Rminus1]);
 if(lines.length!==69||measurements.length!==73||select.Rminus1.length!==5)
  throw Error('incorrect independent actual standard7x6 source geometry');
 return {lines,measurements};
}
function leftInverseGF103(M){
 const prime=103,rows=M.measurements.length,cols=42,
  N=cols+rows,
  A=M.measurements.map((ids,i)=>Array.from({length:N},(_,j)=>
   j<cols?(ids.includes(j)?1:0):j===cols+i?1:0));
 function pow(a,n){let v=1;while(n){if(n&1)v=v*a%prime;a=a*a%prime;n>>=1}return v}
 let rank=0;
 for(let col=0;col<cols;col++){
  let index=rank;while(index<rows&&!A[index][col])index++;
  if(index>=rows)throw Error('exact integer spectrum rank below 42');
  [A[index],A[rank]]=[A[rank],A[index]];
  const inv=pow(A[rank][col],prime-2);
  for(let j=col;j<N;j++)A[rank][j]=A[rank][j]*inv%prime;
  for(let i=0;i<rows;i++)if(i!==rank&&A[i][col]){
   const mul=A[i][col];
   for(let j=col;j<N;j++)
    A[i][j]=(A[i][j]-mul*A[rank][j]+prime*prime)%prime;
  }
  rank++;
 }
 for(let i=0;i<cols;i++)for(let j=0;j<cols;j++)
  if(A[i][j]!==((i===j)?1:0))
   throw Error('left inverse GF103 original physical basis failed');
 const left=A.slice(0,cols).map(row=>row.slice(cols));
 return {rank,left};
}
function independentPhysicalReplay(s, M, LI, history){
 const board=Array(42).fill(-1),h=Array(7).fill(0),
  errors=[],physicalWinners=[],readouts=[];
 let state=s.start();
 for(let i=0;i<history.length;i++){
  const c=Number(history[i])-1,player=i&1;
  if(!Number.isInteger(c)||c<0||c>=7||h[c]>=6)
   throw Error('independently supplied physical game has illegal original move at ply'+(i+1));
  const originalPhysicalCell=h[c]*7+c;
  board[originalPhysicalCell]=player;h[c]++;
  const native= M.lines.some(L=>L.includes(originalPhysicalCell)&&
    L.every(id=>board[id]===player))?
     (player===0?'P0_WIN':'P1_WIN') : h.every(v=>v===6)?'DRAW':null;
  let newSource;
  try{newSource=s.step(state,c)}
  catch(e){errors.push({reason:'SOURCE_RADON_STEP_REJECTED_ORIGINAL_LEGAL_MOVE',ply:i+1,error:String(e)});break}
  const o=board.map(v=>v===-1?0:1),p0=board.map(v=>v===0?1:0);
  const trueOcc=M.measurements.map(L=>L.reduce((a,j)=>a+o[j],0));
  const trueP0=M.measurements.map(L=>L.reduce((a,j)=>a+p0[j],0));
  if(JSON.stringify(trueOcc)!==JSON.stringify(newSource.occupied)||
    JSON.stringify(trueP0)!==JSON.stringify(newSource.P0))
   errors.push({kind:'ORIGINAL_SOURCE_REAL_FOURIER_RADON_SIGNALS_NOT_EXACT',ply:i+1});
  if(JSON.stringify(h)!==JSON.stringify(newSource.h)||newSource.terminal!==native)
   errors.push({kind:'ORIGINAL_SOURCE_RADON_FIRSTWIN_OR_GRAVITY_MISMATCH',ply:i+1,source:newSource.terminal,real:native});
  // Independently invert source spectral cofactor transformation
  // via a precomputed 42×73 modular LEFT INVERSE. All target bits are
  // 0 or1 so equality mod103 proves actual original bit equality.
  function invert(signal){
   return LI.left.map(row=>{
    let v=0;for(let j=0;j<73;j++)v=(v+row[j]*signal[j])%103;
    return v;
   });
  }
  const recO=invert(newSource.occupied),recP0=invert(newSource.P0);
  if(JSON.stringify(recO)!==JSON.stringify(o)||
    JSON.stringify(recP0)!==JSON.stringify(p0))
   errors.push({kind:'TRUE_ORIGINAL_OCCUPANCY_OWNER_NOT_RECOVERED_FROM_TWO_73_SIGNALS',ply:i+1});
  if(native!==null)physicalWinners.push({ply:i+1,result:native,
    actualPhysicalLandingSite:originalPhysicalCell});
  readouts.push({ply:i+1,originalLastLiteralColumn:c+1,
    trueGravityHeightAfter: h.slice(),terminal:native,
    occupiedOriginalCellCount:o.reduce((a,b)=>a+b,0),
    originalP0CellCount:p0.reduce((a,b)=>a+b,0),
    sourceNativeLineCompletionMatchesPhysics:native===newSource.terminal});
  state=newSource;
  if(native!==null&&i!==history.length-1)
   errors.push({kind:'FROZEN_HISTORY_CONTINUES_AFTER_FIRSTWIN',ply:i+1});
 }
 if(state.terminal!==null){
  try{s.step(state,0);errors.push({kind:'SOURCE_ALLOWED_GAME_MOVE_AFTER_TERMINAL'});}
  catch(e){/* correct source action rejects after first win */ }
 }
 return {oneBasedHistory:history,
  physicalFirstWinStops:physicalWinners,
  acceptedOriginalMoves:readouts.length,
  sourceWindowIntegerCounterComparisons:readouts.length*69*2,
  sourceFullStrandDCComparisons:readouts.length*4*2,
  physicalOwnerBitsReconstructed:readouts.length*42*2,
  originalSourceTerminalMatchesAllOriginalMoves:errors.length===0,
  sourceLastNativeStatus:state.terminal,
  selectedTrace:(history==='444444'||history==='44444')?readouts:readouts.slice(-2),
  errors};
}
export function independentlyValidateTrue7x6RadonGameStateConjugacy(){
 const source=sourceTrue7x6RadonGameStateMachine(),
  original=independentPhysicalGeometry(),
  LI=leftInverseGF103(original);
 const histories=[
  '44444',
  '444441',
  '444444',
  '123456123456654321654321123456123456777777',
  '44444421122333',
  '44444411117113333557553553777722'
 ];
 const tests=histories.map(h=>independentPhysicalReplay(source,original,LI,h)),
  failures=tests.flatMap(x=>x.errors);
 const total=(field)=>tests.reduce((a,b)=>a+b[field],0);
 const checks={
  genuinelyPhysicalOriginalWinLines:original.lines.length,
  actualOriginalHistoricGames:histories.length,
  physicallyVerifiedGenuineOriginalMoves:total('acceptedOriginalMoves'),
  direct69OriginalK4WindowCounterComparisons:total('sourceWindowIntegerCounterComparisons'),
  fourGenuineFullStrandIntegerDCComparisons:total('sourceFullStrandDCComparisons'),
  originalP0AndOccupiedCellBitsReconstructed:total('physicalOwnerBitsReconstructed'),
  independentMod103LeftInverseExactRank:LI.rank,
  originalPhysicalWinners:tests.map(x=>({history:x.oneBasedHistory,
    winner:x.sourceLastNativeStatus,pieces:x.acceptedOriginalMoves})),
  originalWinningHistoryDetectedAtExpectedRank14:tests.some(x=>
    x.oneBasedHistory==='44444421122333'&&x.sourceLastNativeStatus==='P1_WIN'&&x.acceptedOriginalMoves===14),
  originalWinningHistoryDetectedAtExpectedRank32:tests.some(x=>
    x.oneBasedHistory==='44444411117113333557553553777722'&&x.sourceLastNativeStatus==='P1_WIN'&&x.acceptedOriginalMoves===32),
  true42PlyDrawTerminatedOnlyAtBoardFull:tests.some(x=>
    x.oneBasedHistory.length===42&&x.sourceLastNativeStatus==='DRAW'&&x.acceptedOriginalMoves===42)
 };
 if(!checks.originalWinningHistoryDetectedAtExpectedRank14||
   !checks.originalWinningHistoryDetectedAtExpectedRank32||
   !checks.true42PlyDrawTerminatedOnlyAtBoardFull)
  failures.push('Original firstwin histories expected exact source terminal status');
 return {
  status:failures.length?'ORIGINAL7X6_RADON_GAME_STATE_CONJUGACY_FAILED':
   'INDEPENDENT_STANDARD7X6_K4_RADON_FULL_GAME_STATE_AND_TERMINAL_CONJUGACY_PASS',
  originalBoard:[7,6,4],
  verified:checks,
  individualReplays:tests,
  noGameTreeWDLSearch:true,
  noNonstandardGameDimensions:true,
  strategyWDLOrBestMoveProven:null,
  errors:failures.slice(0,12)};
}
