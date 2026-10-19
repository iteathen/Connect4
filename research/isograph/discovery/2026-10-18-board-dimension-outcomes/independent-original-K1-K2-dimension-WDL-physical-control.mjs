// Frozen independent original colored-array grid and geometric-line physical
// first-win-stopped validator for the source K1/K2 dimension-to-WDL formula.
// The SOURCE theorem is pinned before this program is run. We enumerate
// P1 second-move replies as an INDEPENDENT FALSIFIER, NOT source solving.
import {classifyK1K2EmptyBoard} from './source-complete-K1-K2-empty-wdl.mjs';
function lines(W,H,K){
 const dirs=[[1,0],[0,1],[1,1],[1,-1]], arr=[],unique=new Set();
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of dirs){
  let ec=c+(K-1)*dx,er=r+(K-1)*dy;
  if(ec<0||ec>=W||er<0||er>=H)continue;
  const cells=[];
  for(let j=0;j<K;j++)cells.push((r+j*dy)*W+c+j*dx);
  const key=cells.slice().sort((a,b)=>a-b).join(',');
  if(unique.has(key))continue;unique.add(key);arr.push(cells);
 }
 return arr;
}
function empty(W,H,K){
 const board=new Int8Array(W*H).fill(-1);
 const all=lines(W,H,K),inc=Array.from({length:W*H},()=>[]);
 all.forEach((L,i)=>L.forEach(z=>inc[z].push(i)));
 return {W,H,K,board,h:Array(W).fill(0),inc,all,moves:0,terminal:null};
}
function clone(p){return {...p,board:p.board.slice(),h:p.h.slice()}}
function put(p,col,player){
 if(p.terminal!==null)throw Error('first-win-stopped: move after terminal');
 const c=col-1;
 if(c<0||c>=p.W||p.h[c]>=p.H)throw Error('original gravity: illegal column');
 const r=p.h[c],z=r*p.W+c;
 if(p.board[z]!==-1)throw Error('already occupied');
 if(player!==(p.moves&1))throw Error('ownership alternation failure');
 p.board[z]=player;p.h[c]++;p.moves++;
 for(const li of p.inc[z]){
  const L=p.all[li];
  if(L.every(k=>p.board[k]===player)){
   p.terminal={outcome:player===0?1:-1,ply:p.moves,winLine:L};return;
  }
 }
 if(p.moves===p.W*p.H)p.terminal={outcome:0,ply:p.moves};
}
export function independentK1K2DimensionWDLControl(){
 const issues=[],caseExamples=[],counts={rootBoards:0,
  k1Boards:0,k2Boards:0,drawRoots:0,p0WinRoots:0,p1WinRoots:0,
  physicalP1ResponsesChecked:0,sourceExactWinWitnessesVerified:0,
  originalPhysicalMovesExecuted:0,firstWinStoppedViolations:0};
 for(let K=1;K<=2;K++)for(let H=1;H<=30;H++)for(let W=1;W<=30;W++){
  counts.rootBoards++;if(K===1)counts.k1Boards++;else counts.k2Boards++;
  const s=classifyK1K2EmptyBoard({width:W,height:H,connect:K});
  if(s.P0relativeWDL===1)counts.p0WinRoots++;else if(s.P0relativeWDL===0)counts.drawRoots++;
  else counts.p1WinRoots++;
  if(K===1) {
   const p=empty(W,H,K);put(p,1,0);counts.originalPhysicalMovesExecuted++;
   if(p.terminal?.outcome!==1||p.terminal?.ply!==1)issues.push({W,H,K,reason:'K1 not first-move win'});
  } else if(s.P0relativeWDL===0){
   let p=empty(W,H,K);
   for(let j=0;j<W*H;j++){
    const c=W===1?1:j+1;put(p,c,j&1);counts.originalPhysicalMovesExecuted++;
    if(j<W*H-1&&p.terminal!==null)issues.push({W,H,K,reason:'DRAW path premature terminal'});
   }
   if(p.terminal?.outcome!==0)issues.push({W,H,K,reason:'alleged forced draw path not drawn'});
  } else {
   const start=empty(W,H,K);put(start,s.sourceOriginalFirstMoveColumn,0);
   counts.originalPhysicalMovesExecuted++;
   if(start.terminal!==null)issues.push({W,H,K,reason:'K2 P0 opener terminal unexpectedly'});
   for(let p1c=1;p1c<=W;p1c++){
    if(start.h[p1c-1]>=H)continue;
    counts.physicalP1ResponsesChecked++;
    let p=clone(start);put(p,p1c,1);counts.originalPhysicalMovesExecuted++;
    if(p.terminal!==null)issues.push({W,H,K,p1c,reason:'P1 single-stone terminal unexpectedly'});
    const c=s.p0SecondMoveAfterReply({opponentOriginalColumn:p1c});
    if(p.terminal!==null)continue;
    put(p,c,0);counts.originalPhysicalMovesExecuted++;
    if(p.terminal?.outcome!==1||p.terminal?.ply!==3)
      issues.push({W,H,K,p1c,c,reason:'P0 response not immediate first win',
        terminal:p.terminal});
    else counts.sourceExactWinWitnessesVerified++;
   }
  }
  if((W===1&&H===30)||(W===2&&H===1)||
     (W===2&&H===2)||(W===3&&H===1)||
     (W===3&&H===2)||(W===30&&H===30))
   caseExamples.push({W,H,K,value:s.P0relativeWDL,status:s.status});
 }
 return {status:issues.length?'K1_K2_PHYSICAL_FALSIFIER_FAILED':'K1_K2_EXACT_DIMENSION_CLASSIFICATION_PHYSICAL_PASS',
  counts,errors:issues.slice(0,20),examples:caseExamples,
  sourceStrategicFutureValueQueries:0,
  physicalValidationOpponentReplyBranchesExhaustive:true,
  externalFormalQualification:'NOT_RUN'};
}
