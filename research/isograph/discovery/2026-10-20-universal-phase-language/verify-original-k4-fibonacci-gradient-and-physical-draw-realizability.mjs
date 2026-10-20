// Original K4 (W,H>=5) paired COLUMN-PHASE regular language.
// Count 4*F_W K4-free completely alternating-column terminal colorings.
// Independently physically REPLAY every admissible owner-balanced alternating
// board from actual EMPTY under alternating original P0/P1 and gravity.
// Source contains ZERO historically solved WDL labels or optimal move IDs.
// NO claim that one player can force this outcome against an opponent.
import assert from "node:assert/strict";
const dirs=[[1,0],[0,1],[1,1],[1,-1]];
function lines(W,H) {
 const arr=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of dirs){
  const a=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(a.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))arr.push(a);
 }
 return arr;
}
const fib=n=>{
 if(n<1)return 0;
 let a=1,b=1;
 for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}
 return a;
};
const banned=new Set(["0000","1111","0101","1010"]);
const allowed=bits=>bits.every((_,start)=>start+4>bits.length||
 !banned.has(bits.slice(start,start+4).join("")));
function originalIndependentCompleteColoring(bits,H,K4){
 const W=bits.length;
 const board=Array.from({length:W},(_,c)=>Array.from({length:H},(_,r)=>(bits[c]+r)%2));
 const K4Found=K4.some(L=>L.every(([c,r])=>board[c][r]===board[L[0][0]][L[0][1]]));
 return {board,K4Found};
}
function path(bits,H){
 const W=bits.length,zero=[],one=[];
 bits.forEach((v,c)=>(v===0?zero:one).push(c));
 const seq=[];
 if(H%2===0){
  assert.ok(zero.length&&one.length,"admissible column phases contain both types");
  const first=zero[0];
  seq.push(first);
  for(const c of one)for(let r=0;r<H;r++)seq.push(c);
  for(let r=1;r<H;r++)seq.push(first);
  for(const c of zero.slice(1))for(let r=0;r<H;r++)seq.push(c);
 }else{
  assert.equal(zero.length,Math.ceil(W/2),"odd H needs exact alternation-balance");
  assert.equal(one.length,Math.floor(W/2));
  for(let i=0;i<W;i++){
   const c=(i%2===0?zero[i/2]:one[Math.floor(i/2)]);
   for(let r=0;r<H;r++)seq.push(c);
  }
 }
 assert.equal(seq.length,W*H);
 return seq;
}
function checkHistory(bits,H,K4) {
 const W=bits.length,board=Array.from({length:W},()=>Array(H).fill(-1));
 const height=Array(W).fill(0),seq=path(bits,H);
 for(let i=0;i<seq.length;i++){
  const c=seq[i];
  assert.ok(c>=0&&c<W&&height[c]<H,"illegal original gravity");
  const p=i%2,r=height[c]++;
  board[c][r]=p;
  assert.ok(!K4.some(L=>L.every(([x,y])=>board[x][y]===p)),
    "P0/P1 firstwinner occurred in allegedly full DRAW");
 }
 assert.deepEqual(height,Array(W).fill(H));
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)
  assert.equal(board[c][r],(bits[c]+r)%2,"incompatible final owner");
 return {moveCount:seq.length,sequenceZeroBased:seq.join(""),centerFirstColumnOneBased:seq[0]+1};
}
const results=[];
let physicalHistories=0,totalOriginalMoves=0;
for(let W=5;W<=12;W++){
 const K4=lines(W,5),examples={};
 let trueAdmissible=0,disagree=0;
 const weightCounts=Array(W+1).fill(0);
 const admissible=[];
 for(let mask=0;mask<(1<<W);mask++){
  const bits=Array.from({length:W},(_,c)=>(mask>>c)&1);
  const good=allowed(bits);
  const literal=originalIndependentCompleteColoring(bits,5,K4).K4Found;
  if(good===literal)disagree++;
  if(good){
   trueAdmissible++;
   weightCounts[bits.filter(v=>v===0).length]++;
   admissible.push(bits);
  }
 }
 assert.equal(disagree,0,"forbidden-four-bit phase criterion not full-board K4 exact");
 assert.equal(trueAdmissible,4*fib(W),"Fibonacci formula wrong");
 const oddAllowed=weightCounts[Math.ceil(W/2)];
 for(const H of [5,6,7,8]){
  const linesByH=lines(W,H);
  let physicalRealizable=0,staticCompatible=0,balancesRejected=0;
  for(const bits of admissible){
   assert.equal(originalIndependentCompleteColoring(bits,H,linesByH).K4Found,false);
   staticCompatible++;
   const balanceOK=H%2===0||bits.filter(v=>v===0).length===Math.ceil(W/2);
   if(!balanceOK){balancesRejected++;continue;}
   const proof=checkHistory(bits,H,linesByH);
   totalOriginalMoves+=proof.moveCount;
   physicalHistories++;physicalRealizable++;
   examples[H]??={bits:bits.join(""),word:proof.sequenceZeroBased};
  }
  assert.equal(physicalRealizable,H%2===0?4*fib(W):oddAllowed);
  results.push({W,H,staticNoK4AlternatingColumnPhases:staticCompatible,
   physicallyRealizableCompleteDrawPhases:physicalRealizable,
   staticPhaseWordsNotBalancedForActualAlternatingTurns:balancesRejected,
   exactFormula:H%2===0?"4*F_W":"coefficient z^ceil(W/2) of valid phase polynomial",
   originalWinLineCount:linesByH.length,
   firstExample:examples[H]});
 }
}
console.log(JSON.stringify({
 schema:1,status:"PASS_ORIGINAL_K4_PHASE_FIBONACCI_AND_PHYSICAL_DRAW_REALIZABILITY",
 dimensionsTested:results.length,distinctPhysicallyDrawnWords:physicalHistories,
 originalPhysicalMovesReplayChecked:totalOriginalMoves,
 restriction:"full board column-by-column alternating P0/P1 parity class only, not every possible draw board",
 limitation:"Existence of a cooperative DRAW path is NOT a player-enforceable draw strategy or forced game value",
 results
},null,2));
