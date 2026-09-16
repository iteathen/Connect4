#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const K = 4;
const H = 6;
const W = 7;
const DIRECTIONS = [[1,0],[0,1],[1,1],[1,-1]];
const zeros = (r,c) => Array.from({length:r}, () => Array(c).fill(0));
function rref(M) {
  const a=M.map(r=>r.slice()); let row=0; const pivots=[];
  for (let col=0; col<(a[0]?.length??0) && row<a.length; col+=1) {
    let p=row; while (p<a.length && !a[p][col]) p+=1;
    if (p===a.length) continue;
    [a[row],a[p]]=[a[p],a[row]];
    for (let r=0;r<a.length;r+=1) if (r!==row && a[r][col]) for (let c=col;c<a[0].length;c+=1) a[r][c]^=a[row][c];
    pivots.push(col); row+=1;
  }
  return {a,pivots};
}
const rank = (M) => rref(M).pivots.length;
function nullBasis(M) {
  const {a,pivots}=rref(M); const n=a[0]?.length??0; const ps=new Set(pivots);
  const free=Array.from({length:n},(_,i)=>i).filter(i=>!ps.has(i));
  return free.map(f=>{ const v=Array(n).fill(0); v[f]=1; for (let r=0;r<pivots.length;r+=1) { let b=0; for (const j of free) b^=a[r][j]&v[j]; v[pivots[r]]=b; } return v; });
}
const T = (M) => M.length ? Array.from({length:M[0].length},(_,c)=>M.map(r=>r[c])) : [];
function mul(A,B) { const o=zeros(A.length,B[0]?.length??0); for(let i=0;i<A.length;i+=1) for(let k=0;k<(A[0]?.length??0);k+=1) if(A[i][k]) for(let j=0;j<(B[0]?.length??0);j+=1) o[i][j]^=B[k][j]; return o; }
function xor(A,B) { return A.map((r,i)=>r.map((v,j)=>v^B[i][j])); }
function independentColumns(M) { const chosen=[]; let current=0; for(let c=0;c<(M[0]?.length??0);c+=1) { const C=M.map(row=>[...chosen.map(j=>row[j]),row[c]]); const next=rank(C); if(next>current){chosen.push(c);current=next;} } return chosen; }
function restrictedKernel(map,basis) {
  const C=T(basis); const coeff=nullBasis(mul(map,C));
  return coeff.map(a=>{ const v=Array(C.length).fill(0); for(let j=0;j<a.length;j+=1) if(a[j]) for(let i=0;i<C.length;i+=1) v[i]^=C[i][j]; return v; });
}
function generateLines() {
  const out=[];
  for(let y=0;y<H;y+=1) for(let x=0;x<W;x+=1) for(const [dx,dy] of DIRECTIONS) {
    const cells=[]; let ok=true;
    for(let i=0;i<K;i+=1){ const cx=x+i*dx, cy=y+i*dy; if(cx<0||cx>=W||cy<0||cy>=H){ok=false;break;} cells.push(cy*W+cx); }
    if(ok) out.push({dx,dy,cells});
  }
  return out;
}
const lines=generateLines(); const N=W*H; const B=zeros(N,lines.length);
lines.forEach((line,j)=>line.cells.forEach(c=>{B[c][j]=1;}));
const imageBasis=independentColumns(B).map(j=>B.map(r=>r[j]));
const col=zeros(W,N), row=zeros(H,N);
for(let y=0;y<H;y+=1) for(let x=0;x<W;x+=1){const c=y*W+x; col[x][c]=1; row[y][c]=1;}
const Ycell=restrictedKernel([...col,...row],imageBasis); const Y=T(Ycell); const Ydim=Ycell.length;

// Native zero-reservation CPC event-count relation: for target t, every event
// in another column contributes, as does the same-column prefix through t.
const CPC=zeros(N,N);
for(let t=0;t<N;t+=1){ const tx=t%W, ty=Math.floor(t/W); for(let e=0;e<N;e+=1){ const ex=e%W, ey=Math.floor(e/W); CPC[t][e]=(ex!==tx||ey<=ty)?1:0; } }
const restrictedRank=(M)=>rank(mul(T(Y),mul(M,Y)));
const cpcRank=restrictedRank(CPC);
assert(cpcRank<Ydim);

function incidenceFor(predicate){ const ids=lines.map((l,i)=>predicate(l)?i:-1).filter(i=>i>=0); const M=zeros(N,ids.length); ids.forEach((lineIndex,j)=>lines[lineIndex].cells.forEach(c=>{M[c][j]=1;})); return M; }
const gram=(I)=>mul(I,T(I));
const forms={
  all: gram(B),
  horizontal: gram(incidenceFor(l=>l.dy===0)),
  vertical: gram(incidenceFor(l=>l.dx===0)),
  risingDiagonal: gram(incidenceFor(l=>l.dx===1&&l.dy===1)),
  fallingDiagonal: gram(incidenceFor(l=>l.dx===1&&l.dy===-1)),
};
const names=Object.keys(forms); let bestRank=cpcRank; const best=[]; let full=0;
for(let mask=0;mask<(1<<names.length);mask+=1){ let M=CPC.map(r=>r.slice()); const used=[]; for(let bit=0;bit<names.length;bit+=1) if((mask>>bit)&1){M=xor(M,forms[names[bit]]);used.push(names[bit]);} const r=restrictedRank(M); if(r>bestRank){bestRank=r;best.length=0;best.push(used);} else if(r===bestRank) best.push(used); if(r===Ydim) full+=1; }
assert.equal(full,0);
assert(bestRank<Ydim);

console.log(`CPC_SELF_DUALITY_AUDIT=${JSON.stringify({
  kind:'standard7x6-cpc-self-duality-audit-v1', proved:true,
  primitives:{connect:K,rows:H,columns:W},
  derived:{cellCoreDimension:Ydim,cpcEventOrderFormRank:cpcRank,bestRankWithSimpleSpatialCoIncidence:bestRank,fullRankCombinationCount:full,bestCombinations:best},
  conclusion:'CPC event order and the tested direction-resolved winning-line co-incidence corrections do not provide a nondegenerate self-pairing of Y_cell.',
  proofBoundary:'Finite natural-candidate falsifier only; does not prove no other Connect4-defined self-duality exists.',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
})}`);
