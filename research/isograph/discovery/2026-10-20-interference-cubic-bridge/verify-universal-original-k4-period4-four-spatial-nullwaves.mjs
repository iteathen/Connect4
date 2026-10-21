// Universal original K4 spatial Fourier nullspace / line-syzygy source-only control.
// Research-only Node ESM. NO game-valued successors, known optimal root labels or ORACLE.
import assert from 'node:assert/strict';

const rays=[[1,0],[0,1],[1,1],[1,-1]];
const u=[1,0,-1,0],v=[0,1,0,-1];
const f=(c,r)=>[(-1)**r*u[c%4],(-1)**r*v[c%4],(-1)**c*u[r%4],(-1)**c*v[r%4]];
function winlines(W,H){
 const out=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of rays){
  const L=Array.from({length:4},(_,i)=>[c+i*dx,r+i*dy]);
  if(L.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))out.push(L);
 }
 return out;
}
function modpow(x,n,p){
 let y=1;while(n>0){if(n%2)y=y*x%p;x=x*x%p;n=Math.floor(n/2)}return y;
}
function rankmod(a,p=1009){
 a=a.map(row=>row.map(x=>(x%p+p)%p));let rank=0;
 for(let j=0;j<a[0].length && rank<a.length;j++){
  let i=rank;while(i<a.length&&!a[i][j])i++;
  if(i===a.length)continue;
  [a[rank],a[i]]=[a[i],a[rank]];
  const inv=modpow(a[rank][j],p-2,p);
  for(let k=j;k<a[rank].length;k++)a[rank][k]=a[rank][k]*inv%p;
  for(let h=rank+1;h<a.length;h++){
   const mult=a[h][j];if(!mult)continue;
   for(let k=j;k<a[h].length;k++)
    a[h][k]=(a[h][k]-mult*a[rank][k]%p+p)%p;
  }
  rank++;
 }
 return rank;
}
function dimension(W,H,{checkRank=true}={}){
 const lines=winlines(W,H),expected=4*W*H-9*(W+H)+18;
 assert.equal(lines.length,expected);
 for(const L of lines)for(let i=0;i<4;i++)
  assert.equal(L.reduce((sum,[c,r])=>sum+f(c,r)[i],0),0);
 const sites=Array.from({length:W*H},(_,e)=>[e%W,Math.floor(e/W)]);
 const basis=sites.map(([c,r])=>f(c,r));
 assert.equal(rankmod(basis),4);
 const physicalN=W*H;
 let rank=null;
 if(checkRank){
  const matrix=lines.map(L=>sites.map(([c,r])=>+(L.some(([x,y])=>x===c&&y===r))));
  rank=rankmod(matrix);
  assert.equal(rank,physicalN-4);
 }
 return {W,H,originalK4Lines:lines.length,sourceSites:physicalN,
  sourceSpatialNullity:4,sourcePhysicalIncidenceRank:physicalN-4,
  lineSyzygyDimension:lines.length-physicalN+4,
  graphRelativeModes:lines.length-1,
  additiveGraphRelativeModes:physicalN-5,
  rankVerifiedByModPrime:rank};
}
let boards=0,windows=0,rankChecked=0;const rows=[];
for(let W=5;W<=12;W++)for(let H=5;H<=12;H++){
 const checked=W*H<=72;
 const row=dimension(W,H,{checkRank:checked});
 boards++;windows+=row.originalK4Lines;
 if(checked)rankChecked++;
 if([[5,5],[5,6],[6,6],[7,5],[7,6],[8,6],[10,6]].some(([w,h])=>w===W&&h===H))
  rows.push(row);
}
for(const [W,H,expectedNullity] of [[4,4,7],[4,5,5],[5,4,5],[4,6,4],[6,4,4]]){
 const L=winlines(W,H);
 const M=L.map(l=>Array.from({length:W*H},(_,e)=>+l.some(([c,r])=>r*W+c===e)));
 assert.equal(W*H-rankmod(M),expectedNullity);
}
process.stdout.write(JSON.stringify({schema:1,date:'2026-10-20',boardRange:'W,H=5..12',boards,
  originalK4WindowsChecked:windows,originalWaveCancellationChecks:windows*4,
  sourceIncidenceRankPrimeChecks:rankChecked,modulus:1009,
  sixOutcomeDimensionIndependentSourceControls:rows,
  physicalBoundaryControls:'4x4 site-nullity7, 4x5 and5x4 site-nullity5, 4x6 and6x4 nullity4',
  claim:'Universal exact theorem from spatial period4 Fourier proof, numerical controls are falsification only',
  caveat:'source geometry, NOT perfect-play WDL; user historical 28 withheld'},null,2)+'\n');
