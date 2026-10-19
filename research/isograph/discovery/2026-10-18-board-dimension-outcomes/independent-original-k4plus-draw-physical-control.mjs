// Independent original-grid PHYSICAL first-win-stopped legality validator.
// Frozen separately from owner source constructor before any test execution.
// Reconstructs all geometric K lines; checks every literal move, alternating
// P0/P1, actual gravity, and immediate first-win stop. NO minimax/oracle.
import {createUniversalK4PlusDrawWord} from './source-universal-k4plus-cooperative-draw-word.mjs';
function originalLines(W,H,K){
 const lines=[],dxdy=[[1,0],[0,1],[1,1],[1,-1]];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of dxdy){
  const X=x+(K-1)*dx,Y=y+(K-1)*dy;
  if(X<0||X>=W||Y<0||Y>=H)continue;
  const cells=[];
  for(let j=0;j<K;j++)cells.push((y+j*dy)*W+x+j*dx);
  lines.push({start:[x,y],dx,dy,cells});
 }
 return lines;
}
function physicalRun(W,H,K,hist){
 if(hist.length!==W*H)throw Error('history not full length');
 const board=new Int8Array(W*H).fill(-1),heights=Array(W).fill(0),playerStones=[0,0];
 const lines=originalLines(W,H,K),byCell=Array.from({length:W*H},()=>[]);
 lines.forEach((line,i)=>line.cells.forEach(z=>byCell[z].push(i)));
 for(let i=0;i<hist.length;i++){
  const c=hist[i]-1,p=i&1;
  if(!Number.isInteger(c)||c<0||c>=W||heights[c]>=H)
   return {status:'ILLEGAL_GRAVITY',ply:i+1,c};
  const r=heights[c]++,z=r*W+c;
  if(board[z]!==-1)return {status:'DOUBLE_OWNERSHIP',ply:i+1,z};
  board[z]=p;playerStones[p]++;
  for(const index of byCell[z]){
   const line=lines[index];
   if(line.cells.every(cell=>board[cell]===p))
    return {status:'EARLY_FIRST_WIN',ply:i+1,winner:p,winningLine:line,c,r};
  }
 }
 if(heights.some(x=>x!==H))return {status:'NOT_FULL'};
 return {status:'ORIGINAL_LEGAL_TERMINAL_DRAW',lineCount:lines.length,
  p0Stones:playerStones[0],p1Stones:playerStones[1],
  board,heights};
}
export function runIndependentOriginalK4PlusDrawControls(){
 const cases=[],byK={},total={cases:0,cellsPlayed:0,originalLinesChecked:0,
  oddWidths:0,evenWidths:0,bothDimensionsAtLeastK:0,failures:[]};
 for(let K=4;K<=8;K++)for(let H=1;H<=16;H++)for(let W=1;W<=16;W++){
  const frozen=createUniversalK4PlusDrawWord({width:W,height:H,connect:K});
  const result=physicalRun(W,H,K,frozen.originalLiteralColumnWord);
  const expectedLines=H*Math.max(W-K+1,0)+W*Math.max(H-K+1,0)
       +2*Math.max(W-K+1,0)*Math.max(H-K+1,0);
  if(result.status!=='ORIGINAL_LEGAL_TERMINAL_DRAW'||result.lineCount!==expectedLines||
     result.p0Stones!==Math.ceil(W*H/2)||result.p1Stones!==Math.floor(W*H/2)){
   total.failures.push({W,H,K,result:{...result,board:undefined,heights:undefined},expectedLines});
  } else {
   const even=W-(W&1);
   for(let c=0;c<W;c++)for(let r=0;r<H;r++){
    const expected=c<even ? ((c&1)^((r>>1)&1)) : (r&1);
    const actual=result.board[r*W+c];
    if(expected!==actual)total.failures.push({W,H,K,problem:'stripe-or-tail-owner',c,r,expected,actual});
   }
  }
  total.cases++;total.cellsPlayed+=W*H;
  total.originalLinesChecked+=expectedLines;
  if(W&1)total.oddWidths++;else total.evenWidths++;
  if(W>=K&&H>=K)total.bothDimensionsAtLeastK++;
  byK[K]=(byK[K]??0)+1;
  if(W===6&&H===4&&K===4||W===7&&H===6&&K===4||W===4&&H===4&&K===4)
   cases.push({W,H,K,status:result.status,lines:result.lineCount,
    historyPrefix:frozen.originalLiteralColumnWord.slice(0,22).join(''),
    historyLength:frozen.originalLiteralColumnWord.length});
 }
 // Scope-negative: applying K>=4 proposed word to K=3 is UNSOUND.
 const outOfScope=createUniversalK4PlusDrawWord({width:3,height:6,connect:4});
 const bad=physicalRun(3,6,3,outOfScope.originalLiteralColumnWord);
 return {status:total.failures.length?'PHYSICAL_VALIDATION_FAILED':'ORIGINAL_PHYSICAL_ALL_CASES_DRAW',
   summary:total,byK,mandatoryCases:cases,
   negativeControlK3OddWidth:{W:3,H:6,K:3,result:{status:bad.status,
      ply:bad.ply??null,winner:bad.winner??null,
      winningLine:bad.winningLine??null},
    note:'No claim of universal K3 failure; this one K4-constructor extension is invalid at K3'},
   prospectiveRootWDLComputed:false,
   branchingStrategicFutureGamesValued:0};
}
