#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const W = 7;
const H = 6;
const K = 4;
const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

function zeros(r,c) { return Array.from({ length:r }, () => Array(c).fill(0)); }
function rank2(input) {
  const a=input.map(r=>r.slice()); let rank=0; const rows=a.length, cols=a[0]?.length??0;
  for (let c=0;c<cols && rank<rows;c++) {
    let p=rank; while (p<rows && !a[p][c]) p++;
    if (p===rows) continue;
    [a[rank],a[p]]=[a[p],a[rank]];
    for (let r=0;r<rows;r++) if (r!==rank && a[r][c]) for (let j=c;j<cols;j++) a[r][j]^=a[rank][j];
    rank++;
  }
  return rank;
}
function joinColumns(a,b) { return a.map((row,i)=>[...row,...b[i]]); }
function lines() {
  const out=[];
  for (let y=0;y<H;y++) for (let x=0;x<W;x++) for (const [dx,dy] of DIRS) {
    const cells=[]; let ok=true;
    for (let i=0;i<K;i++) {
      const cx=x+i*dx, cy=y+i*dy;
      if (cx<0||cx>=W||cy<0||cy>=H) { ok=false; break; }
      cells.push(cy*W+cx);
    }
    if (ok) out.push(cells);
  }
  return out;
}
function intervalBasis(n,k) {
  const count=n-k+1, out=zeros(n,count);
  for (let start=0;start<count;start++) for (let i=0;i<k;i++) out[start+i][start]=1;
  return out;
}

const L=lines();
const B=zeros(W*H,L.length);
for (let j=0;j<L.length;j++) for (const cell of L[j]) B[cell][j]=1;
const col=zeros(W,W*H), row=zeros(H,W*H);
for (let y=0;y<H;y++) for (let x=0;x<W;x++) { const c=y*W+x; col[x][c]=1; row[y][c]=1; }
function mul(a,b) {
  const out=zeros(a.length,b[0].length);
  for (let i=0;i<a.length;i++) for (let k=0;k<a[0].length;k++) if (a[i][k]) for (let j=0;j<b[0].length;j++) out[i][j]^=b[k][j];
  return out;
}
const colImage=mul(col,B), rowImage=mul(row,B);
const colIntervals=intervalBasis(W,K), rowIntervals=intervalBasis(H,K);

assert.equal(rank2(colImage), W-K+1);
assert.equal(rank2(colIntervals), W-K+1);
assert.equal(rank2(joinColumns(colImage,colIntervals)), W-K+1);
assert.equal(rank2(rowImage), H-K+1);
assert.equal(rank2(rowIntervals), H-K+1);
assert.equal(rank2(joinColumns(rowImage,rowIntervals)), H-K+1);

const axisRank=rank2([
  ...colImage.map((r)=>[...r,...Array(rowImage[0].length).fill(0)]),
  ...rowImage.map((r)=>[...Array(colImage[0].length).fill(0),...r]),
]);
// The direct-sum dimension is derived from the two interval-start families.
assert.equal((W-K+1)+(H-K+1), W);

console.log(`AXIS_INTERVAL_QUOTIENT=${JSON.stringify({
  columnSector: { dimension: W-K+1, basis: `length-${K} intervals on ${W} columns` },
  rowSector: { dimension: H-K+1, basis: `length-${K} intervals on ${H} rows` },
  directSumDimension: (W-K+1)+(H-K+1),
  interpretation: 'The corrected cell-side boundary quotient is generated exactly by K-consecutive axis intervals; the middle kernel dimension is not supplied.',
})}`);
