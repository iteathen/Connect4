// Independent original physical first-win-stopped prefix conformance for
// 2026-10-19 thin-board historical pairing proof-gap/odd spill-debt audit.
// NO game-future value search or optimal action evaluation.
const dirs=[[1,0],[0,1],[1,1],[1,-1]];
function originalWindows(W,H,K){
 let windows=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of dirs){
  const lastC=c+(K-1)*dx,lastR=r+(K-1)*dy;
  if(lastC<0||lastC>=W||lastR<0||lastR>=H)continue;
  let cells=[];for(let j=0;j<K;j++)cells.push((r+j*dy)*W+c+j*dx);
  windows.push(cells);
 }
 return windows;
}
function replay(W,H,K,history){
 const lines=originalWindows(W,H,K);
 let h=Array(W).fill(0),board=new Int8Array(W*H).fill(-1),last=null;
 for(let i=0;i<history.length;i++){
  const c=Number(history[i])-1,p=i%2;
  if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)throw Error('invalid original gravity prefix at move '+(i+1));
  const r=h[c]++,z=r*W+c;
  if(board[z]!==-1)throw Error('cell multiply occupied');
  board[z]=p;
  if(lines.some(line=>line.every(x=>board[x]===p)))throw Error('prefix has an earlier terminal WIN');
  if(i===W*H-1)throw Error('prefix includes full board terminal');
  last={player:p,col:c,row:r};
 }
 return {W,H,K,history,lineCount:lines.length,h,last,
  currentMover:history.length%2,physicalWinner:null,
  legalColumns:h.flatMap((v,c)=>v<H?[c+1]:[])};
}
export function verifyHistoricalThinPairResponseGaps(){
 const a=replay(4,2,4,'12'),b=replay(5,3,4,'555'),c=replay(4,2,4,'1414');
 const aPriorP0Height=[1,0]; // after first P0 at col 1 (zero-based 0)
 const aPairedEqualBeforeP1=aPriorP0Height[0]===aPriorP0Height[1];
 const aAttemptedSameRowMateOriginalCol1ZeroBased=0,
    aP1LandingOriginalRow=0;
 const aMatePhysicallyPlayable=a.h[aAttemptedSameRowMateOriginalCol1ZeroBased]===aP1LandingOriginalRow;
 const bSpareFull=b.h[4]===3,bPairedUntouched=b.h.slice(0,4).every(v=>v===0);
 const cSpareFull=c.h[0]===2&&c.h[3]===2,
       cPairedUntouched=c.h[1]===0&&c.h[2]===0;
 const checks={
  K4_W4_H2_P0_open_in_pair_breaks_equal_before_P1:!aPairedEqualBeforeP1,
  K4_W4_H2_P1_claims_row0_in_pair_P0_same_row_mate_unplayable:!aMatePhysicallyPlayable,
  K4_W5_H3_odd_spare_exhausted_on_P0_move: bSpareFull && bPairedUntouched && b.currentMover===1 && b.legalColumns.length===4,
  K4_W4_H2_two_boundary_spares_exhausted_before_P0_reply:cSpareFull&&cPairedUntouched&&c.currentMover===0&&c.legalColumns.length===2
 };
 return {status:Object.values(checks).every(Boolean)?'PASS_SCOPED_SOURCE_RESPONSE_OBSTRUCTION':'ORIGINAL_PHYSICAL_COUNTEREXAMPLE_TO_AUDIT',
  controls:[a,b,c],checks,overallWDLConclusions:0,
  gameStatesSearchedByProposedSource:0,
  legalFirstWinStoppedPhysicalPrefixesVerified:3};
}
