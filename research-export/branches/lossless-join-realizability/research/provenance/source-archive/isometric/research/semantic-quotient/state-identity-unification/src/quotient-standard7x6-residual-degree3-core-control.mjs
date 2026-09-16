#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Test the corrected 28 -> 21 residual hypothesis. The aggregate cofactor
// boundary itself is injective on Y; the contraction appears only after a new
// support/CPC frontier quotient is exposed in degree-3 residual space.

const K=4,H=6,W=7,N=W*H,DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const zeros=(r,c)=>Array.from({length:r},()=>Array(c).fill(0));
const T=M=>M.length?Array.from({length:M[0].length},(_,c)=>M.map(r=>r[c])):[];
function rref(M){const a=M.map(r=>r.slice());let row=0,p=[];for(let c=0;c<(a[0]?.length??0)&&row<a.length;c++){let q=row;while(q<a.length&&!a[q][c])q++;if(q===a.length)continue;[a[row],a[q]]=[a[q],a[row]];for(let r=0;r<a.length;r++)if(r!==row&&a[r][c])for(let j=c;j<a[0].length;j++)a[r][j]^=a[row][j];p.push(c);row++;}return{a,pivots:p};}
const rank=M=>rref(M).pivots.length;
function nullBasis(M){const {a,pivots}=rref(M),n=a[0]?.length??0,ps=new Set(pivots),free=Array.from({length:n},(_,i)=>i).filter(i=>!ps.has(i));return free.map(f=>{const v=Array(n).fill(0);v[f]=1;for(let r=0;r<pivots.length;r++){let b=0;for(const j of free)b^=a[r][j]&v[j];v[pivots[r]]=b;}return v;});}
function mul(A,B){assert.equal(A[0]?.length??0,B.length);const o=zeros(A.length,B[0]?.length??0);for(let i=0;i<A.length;i++)for(let k=0;k<(A[0]?.length??0);k++)if(A[i][k])for(let j=0;j<(B[0]?.length??0);j++)o[i][j]^=B[k][j];return o;}
function restrictedKernel(map,basis){const C=T(basis),coef=nullBasis(mul(map,C));return coef.map(a=>{const v=Array(C.length).fill(0);for(let j=0;j<a.length;j++)if(a[j])for(let i=0;i<C.length;i++)v[i]^=C[i][j];return v;});}
function gen(){let o=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){let cells=[],ok=true;for(let i=0;i<K;i++){const xx=x+i*dx,yy=y+i*dy;if(xx<0||xx>=W||yy<0||yy>=H){ok=false;break;}cells.push(yy*W+xx);}if(ok)o.push({x,y,dx,dy,cells});}return o;}
const lines=gen(),L=lines.length,B=zeros(N,L);lines.forEach((l,j)=>l.cells.forEach(c=>B[c][j]=1));
const kerB=nullBasis(B),vertical=zeros(W,L);lines.forEach((l,j)=>{if(l.dx===0)vertical[l.x][j]=1;});
const Yline=restrictedKernel(vertical,kerB),R=T(Yline);assert.equal(Yline.length,28);
const key=a=>a.slice().sort((a,b)=>a-b).join(',');
function residualLevel(d){const m=new Map();for(const l of lines){const choose=(arr,k,s=0,p=[])=>{if(p.length===k){m.set(key(p),p.slice().sort((a,b)=>a-b));return;}for(let i=s;i<=arr.length-(k-p.length);i++){p.push(arr[i]);choose(arr,k,i+1,p);p.pop();}};choose(l.cells,d);}return [...m.values()];}
const c3=residualLevel(3),c2=residualLevel(2),i3=new Map(c3.map((s,i)=>[key(s),i])),i2=new Map(c2.map((s,i)=>[key(s),i]));
const D4=zeros(c3.length,L);for(let j=0;j<L;j++)for(let d=0;d<K;d++){const s=lines[j].cells.filter((_,i)=>i!==d);D4[i3.get(key(s))][j]^=1;}assert.equal(rank(D4),L);
const D3=zeros(c2.length,c3.length);for(let j=0;j<c3.length;j++)for(let d=0;d<3;d++){const s=c3[j].filter((_,i)=>i!==d);D3[i2.get(key(s))][j]^=1;}assert.equal(rank(mul(D3,D4)),0);
const DY=mul(D4,R);assert.equal(rank(DY),28);

function supportData(s){const maxByCol=Array(W).fill(-1),coords=s.map(c=>[c%W,Math.floor(c/W)]);for(const [x,y] of coords)maxByCol[x]=Math.max(maxByCol[x],y);const closure=maxByCol.reduce((a,r)=>a+(r>=0?r+1:0),0),maxRow=Math.max(...coords.map(p=>p[1])),phase=maxByCol.map(r=>r>=0?((r+1)&1):0),top=Array(W).fill(0);for(const [x,y] of coords)if(y===maxRow)top[x]^=1;return{closure,maxRow,q:(closure+maxRow)&1,phase,top};}
const topMap=zeros(W,c3.length),phaseMap=zeros(W,c3.length),qPhaseMap=zeros(W,c3.length),pi3=zeros(W,c3.length);
for(let j=0;j<c3.length;j++){const d=supportData(c3[j]);for(let x=0;x<W;x++){topMap[x][j]=d.top[x];phaseMap[x][j]=d.phase[x];qPhaseMap[x][j]=d.q&d.phase[x];pi3[x][j]=d.top[x]^(d.q&d.phase[x]);}}

// Ordinary residual cell incidence and raw support phase vanish on D(Y).
const J3=zeros(N,c3.length);c3.forEach((s,j)=>s.forEach(c=>J3[c][j]=1));
assert.equal(rank(mul(J3,DY)),0);assert.equal(rank(mul(phaseMap,DY)),0);
const topRank=rank(mul(topMap,DY)),qPhaseRank=rank(mul(qPhaseMap,DY)),frontier=mul(pi3,DY),frontierRank=rank(frontier);
assert.equal(topRank,5);assert.equal(qPhaseRank,5);assert.equal(frontierRank,W);
const coefficientCore=nullBasis(frontier);assert.equal(coefficientCore.length,21);
const Y3=mul(DY,T(coefficientCore));assert.equal(rank(Y3),21);assert.equal(rank(Y3),W*(K-1));

// The aggregate simplicial boundary cannot be naively iterated: D3*D4=0.
assert.equal(rank(mul(D3,Y3)),0);

// Basis-change invariance of the ambient 21-space.
const V=Array.from({length:28},(_,i)=>Array.from({length:28},(_,j)=>i===j?1:0));V[1][9]^=1;V[6][20]^=1;
const DY2=mul(DY,V),frontier2=mul(pi3,DY2),core2=mul(DY2,T(nullBasis(frontier2)));
assert.equal(rank(core2),21);assert.equal(rank([...T(Y3),...T(core2)]),21);

// Left-right equivariance of pi3 and invariance of the derived 21-space.
const reflCell=c=>Math.floor(c/W)*W+(W-1-(c%W)),c3Map=new Map(c3.map((s,i)=>[key(s),i])),c3Perm=c3.map(s=>c3Map.get(key(s.map(reflCell)))),colPerm=Array.from({length:W},(_,x)=>W-1-x);
for(let x=0;x<W;x++)for(let j=0;j<c3.length;j++)assert.equal(pi3[colPerm[x]][c3Perm[j]],pi3[x][j]);
function permuteRows(M,p){const o=zeros(M.length,M[0].length);for(let i=0;i<M.length;i++)o[p[i]]=M[i].slice();return o;}
const reflectedY3=permuteRows(Y3,c3Perm);assert.equal(rank([...T(Y3),...T(reflectedY3)]),21);

console.log(`RESIDUAL_DEGREE3_CORE=${JSON.stringify({
 kind:'standard7x6-residual-degree3-core-v1',proved:true,
 sourceCoreDimension:Yline.length,residualImageDimension:rank(DY),
 componentRanks:{ordinaryResidualIncidence:rank(mul(J3,DY)),rawSupportPhase:rank(mul(phaseMap,DY)),topFrontier:topRank,cpcWeightedSupportPhase:qPhaseRank},
 correctedFrontier:{definition:'topColumns(S) XOR q(S)*supportPhase(S)',rank:frontierRank},
 residualCoreDimension:rank(Y3),derivedWidthTimesLowerArity:W*(K-1),
 leftRightEquivariant:true,basisChangeInvariant:true,boundarySquareZero:true,
 theorem:'Inside the first residual-boundary image D(Y), pi3(S)=topColumns(S)+q(S)*supportPhase(S) has rank 7, leaving a natural 21-dimensional kernel. The 28->21 contraction is residualization plus a newly exposed CPC/support frontier quotient, not cofactor arity alone.',
 proofBoundary:'Because partial_3*partial_4=0, this aggregate GF(2) boundary cannot itself be iterated to assert 21->14. Further descent requires a marked/sequential cofactor category.',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
})}`);
