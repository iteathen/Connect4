#!/usr/bin/env node
// Original physical 6x6/7x6 K4 source Fourier grade3 vs grade2
// owner-dependent third-row crossing. Historical28, solved root WDL
// and all game-solvers are deliberately absent.
import assert from 'node:assert/strict';
const H=6,D=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]];
function K4(W){
 const out=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [o,dx,dy] of D){
  const cs=Array.from({length:4},(_,i)=>[c+i*dx,r+i*dy]);
  if(cs.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))out.push({o,cs});
 }
 return out;
}
function I(d){
 switch(d%4){
  case 0:return [1,0];
  case 1:return [0,1];
  case 2:return [-1,0];
  default:return [0,-1];
 }
}
function check(W,word,columnOneBased){
 const lines=K4(W),b=Array.from({length:H},()=>Array(W).fill(-1)),h=Array(W).fill(0);
 assert.equal(lines.length,W===7?69:54);
 for(let i=0;i<word.length;i++){
  const c=Number(word[i])-1;
  assert(c>=0&&c<W&&h[c]<H);
  const y=h[c]++,p=i%2;b[y][c]=p;
  assert(!lines.some(L=>L.cs.every(([x,r])=>b[r][x]===p)),
   'original source witness firstwinning before crossed row');
 }
 const c=columnOneBased-1;
 assert.equal(h[c],2);assert.equal(b[2][3],0);assert.equal(b[4][3],0);
 assert(h.every((v,j)=>j===3||v<=2));
 const upperH=lines.filter(L=>L.o==='H'&&L.cs.some(([x])=>x===3)&&
  [2,4].includes(L.cs[0][1]));
 function moments(B,heights){
  const k3=[0,0],k2=[0,0];
  for(const L of upperH){
   if(L.cs.some(([x,y])=>B[y][x]===1))continue;
   const needed=L.cs.filter(([x,y])=>B[y][x]===-1),supp=new Set;
   for(const [x,y] of needed)
    for(let t=heights[x];t<=y;t++)supp.add(x+':'+t);
   const delta=supp.size-needed.length,z=I(delta);
   const moment=needed.length===3?k3:needed.length===2?k2:null;
   if(moment){moment[0]+=z[0];moment[1]+=z[1];}
  }
  return {k3,k2};
 }
 const before=moments(b,h);
 const dvals=[];
 for(const L of upperH){
  if(L.cs[0][1]!==2||!L.cs.some(([x])=>x===c))continue;
  let d=0;
  for(const [x] of L.cs)if(x!==3)d+=2-h[x];
  dvals.push(d);
 }
 assert.deepEqual(before.k3,[0,0]);
 const afterBoard=b.map(row=>row.slice()),nextHeights=h.slice();
 const p=word.length%2;
 afterBoard[nextHeights[c]++][c]=p;
 assert(!lines.some(L=>L.cs.every(([x,y])=>afterBoard[y][x]===p)));
 const after=moments(afterBoard,nextHeights),
  expectedH3=[0,0],expectedH2=[0,0];
 for(const d of dvals){
  const t=I(d+5),v=I(d);
  expectedH3[0]+=t[0];expectedH3[1]+=t[1];
  if(p===0){expectedH2[0]+=v[0];expectedH2[1]+=v[1];}
 }
 assert.deepEqual(after.k3,expectedH3);
 assert.deepEqual(after.k2,expectedH2);
 return {W,actualOriginalK4Windows:lines.length,word,rankBefore:word.length,
  chosenColumn:columnOneBased,mover:p===0?'P0':'P1',
  spanCount:dvals.length,sourceOriginalRow3SupportDebt:dvals,
  upperHGrade3Before:before.k3,upperHGrade3After:after.k3,
  ownerP0UpperHGrade2After:after.k2};
}
const report={schema:1,date:'2026-10-21',
  status:'TRUE_ORIGINAL_UPPER_H_Z4_GRADE3_OWNER_BLINDNESS_VS_GRADE2_INJECTION',
  proof:'For every H 4-column span through center4 and crossing outer c with height2, upper-row3 and row5 owner-P0 grade3 debt differs by6 and cancels at z=i. After either owner claims row3, the row3 K4 leaves grade3 while row5 debt falls by1, so same upper-H grade3 delta SUM(i^(d+5)) for both owner possibilities. Only P0 current owner creates actual original row3 grade2 line, with Fourier character SUM(i^d); P1 destroys it.',
  outcomes:[],noSolverOracleOrHistoric28:true};
for(const [W,word] of [[7,'444446526337114725'],[6,'4444432311255466']])
 for(let c=1;c<=W;c++)if(c!==4)report.outcomes.push(check(W,word,c));
for(const word of ['4444411','44444112'])
 report.outcomes.push(check(7,word,1));
assert.equal(report.outcomes.length,13);
assert.deepEqual(report.outcomes[0].upperHGrade3After,[0,1]);
assert.deepEqual(report.outcomes[0].ownerP0UpperHGrade2After,[1,0]);
assert.deepEqual(report.outcomes[11].ownerP0UpperHGrade2After,[0,0]);
assert.deepEqual(report.outcomes[12].ownerP0UpperHGrade2After,[0,-1]);
console.log(JSON.stringify(report,null,2));
