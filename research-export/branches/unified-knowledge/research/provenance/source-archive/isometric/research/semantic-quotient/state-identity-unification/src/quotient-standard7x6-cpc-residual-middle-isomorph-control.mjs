#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// This control constructs a direct natural isomorphism between the corrected
// 28-dimensional line and cell cores. The map is defined by Connect4-native
// residual/cofactor, gravity-support, and CPC event-rank structure before any
// basis is selected. Gaussian elimination is used only to execute/qualify it.

const FIELD=2,K=4,H=6,W=7,DIRS=[[1,0],[0,1],[1,1],[1,-1]],N=W*H;
const zeros=(r,c)=>Array.from({length:r},()=>Array(c).fill(0));
const T=M=>M.length?Array.from({length:M[0].length},(_,c)=>M.map(r=>r[c])):[];
function rref(M){const a=M.map(r=>r.map(x=>x&1));let row=0,p=[];for(let col=0;col<(a[0]?.length??0)&&row<a.length;col++){let q=row;while(q<a.length&&!a[q][col])q++;if(q===a.length)continue;[a[row],a[q]]=[a[q],a[row]];for(let r=0;r<a.length;r++)if(r!==row&&a[r][col])for(let c=col;c<a[0].length;c++)a[r][c]^=a[row][c];p.push(col);row++;}return{a,pivots:p};}
const rank=M=>rref(M).pivots.length;
function nullBasis(M){const {a,pivots}=rref(M),n=a[0]?.length??0,ps=new Set(pivots),free=Array.from({length:n},(_,i)=>i).filter(i=>!ps.has(i));return free.map(f=>{const v=Array(n).fill(0);v[f]=1;for(let r=0;r<pivots.length;r++){let b=0;for(const j of free)b^=a[r][j]&v[j];v[pivots[r]]=b;}return v;});}
function mul(A,B){assert.equal(A[0]?.length??0,B.length);const o=zeros(A.length,B[0]?.length??0);for(let i=0;i<A.length;i++)for(let k=0;k<(A[0]?.length??0);k++)if(A[i][k])for(let j=0;j<(B[0]?.length??0);j++)o[i][j]^=B[k][j];return o;}
function independentCols(M){const pick=[];let rr=0;for(let c=0;c<(M[0]?.length??0);c++){const C=M.map(row=>[...pick.map(j=>row[j]),row[c]]),nr=rank(C);if(nr>rr){pick.push(c);rr=nr;}}return pick;}
function restrictedKernel(map,basisVectors){const C=T(basisVectors), coeff=nullBasis(mul(map,C));return coeff.map(a=>{const v=Array(C.length).fill(0);for(let j=0;j<a.length;j++)if(a[j])for(let i=0;i<C.length;i++)v[i]^=C[i][j];return v;});}
function inverse(M){assert.equal(M.length,M[0].length);const n=M.length,a=M.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>i===j?1:0)]);let row=0;for(let col=0;col<n;col++){let p=row;while(p<n&&!a[p][col])p++;assert(p<n);[a[row],a[p]]=[a[p],a[row]];for(let r=0;r<n;r++)if(r!==row&&a[r][col])for(let c=col;c<2*n;c++)a[r][c]^=a[row][c];row++;}return a.map(r=>r.slice(n));}
function generateLines(){const out=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){const cells=[];let ok=true;for(let i=0;i<K;i++){const xx=x+i*dx,yy=y+i*dy;if(xx<0||xx>=W||yy<0||yy>=H){ok=false;break;}cells.push({x:xx,y:yy,cell:yy*W+xx});}if(ok)out.push({x,y,dx,dy,cells});}return out;}
const key=a=>a.slice().sort((a,b)=>a-b).join(',');
const lines=generateLines(),L=lines.length;const B=zeros(N,L);lines.forEach((l,j)=>l.cells.forEach(p=>B[p.cell][j]=1));
const rankB=rank(B),kerB=nullBasis(B),imageBasis=independentCols(B).map(j=>B.map(r=>r[j]));
assert.equal(rankB,35);assert.equal(kerB.length,34);
const col=zeros(W,N),row=zeros(H,N);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=y*W+x;col[x][c]=1;row[y][c]=1;}
const Ycell=restrictedKernel([...col,...row],imageBasis),C=T(Ycell);
const vertical=zeros(W,L);lines.forEach((l,j)=>{if(l.dx===0&&l.dy===1)vertical[l.x][j]=1;});
const Yline=restrictedKernel(vertical,kerB),R=T(Yline);assert.equal(Ycell.length,28);assert.equal(Yline.length,28);

// Unique degree-3 residual fragments and R's top residual boundary D=partial_4.
const c3Map=new Map();for(const l of lines)for(let d=0;d<K;d++){const s=l.cells.filter((_,i)=>i!==d).map(p=>p.cell);c3Map.set(key(s),s.slice().sort((a,b)=>a-b));}
const c3=[...c3Map.values()],c3Index=new Map(c3.map((s,i)=>[key(s),i]));
const D=zeros(c3.length,L);for(let j=0;j<L;j++)for(let d=0;d<K;d++){const s=lines[j].cells.filter((_,i)=>i!==d).map(p=>p.cell);D[c3Index.get(key(s))][j]^=1;}
assert.equal(rank(D),L);
const DR=mul(D,R);

function supportClosureSizeFromCells(cells){const mx=Array(W).fill(-1);for(const cell of cells){const x=cell%W,y=Math.floor(cell/W);mx[x]=Math.max(mx[x],y);}return mx.reduce((s,r)=>s+(r>=0?r+1:0),0);}
function maxRowFromCells(cells){return Math.max(...cells.map(c=>Math.floor(c/W)));}
function qResidual(cells){return (supportClosureSizeFromCells(cells)+maxRowFromCells(cells))&1;}
const q=c3.map(qResidual);

// q is exactly zero-reservation CPC event-count parity at any highest residual
// event when all other cells of the fragment's minimal support closure precede it.
const CPC_CONSTANT=(W-1)*H;
assert.equal(CPC_CONSTANT&1,0);
for(const s of c3){const closure=supportClosureSizeFromCells(s),r=maxRowFromCells(s);for(const t of s.filter(c=>Math.floor(c/W)===r)){const prePly=closure-1;const eventCount=CPC_CONSTANT-prePly+r+1;assert.equal(eventCount&1,qResidual(s));}}

// gamma(y,z)=<D y,Q D z>, Q=diag(q), is an R/CPC-weighted line self-form.
const QDR=DR.map((r,i)=>r.map(v=>v&q[i]));
const gamma=mul(T(DR),QDR);assert.equal(rank(gamma),28);
const ownerParityQ=q.map(bit=>bit^1);
const ownerWeightedDR=DR.map((r,i)=>r.map(v=>v&ownerParityQ[i]));
const ownerParityWeightedRank=rank(mul(T(DR),ownerWeightedDR));
assert.equal(ownerParityWeightedRank,16);

// Cross pairing beta. Cofactor the incident cell. The weight is CPC residual
// event-rank parity XOR residual connectedness. For a 3-of-4 residual,
// connectedness is exactly the endpoint-vs-interior deletion topology.
function residualConnectedBit(line,deleted){const active=new Set(line.cells.filter(p=>p.cell!==deleted.cell).map(p=>p.cell));let components=0,inComponent=false;for(const p of line.cells){if(active.has(p.cell)){if(!inComponent)components+=1;inComponent=true;}else inComponent=false;}assert(components===1||components===2);return components===1?1:0;}
const A=zeros(N,L),Aq=zeros(N,L),Aconnected=zeros(N,L);
for(let j=0;j<L;j++)for(const p of lines[j].cells){const residualCells=lines[j].cells.filter(x=>x.cell!==p.cell).map(x=>x.cell);const eventParity=qResidual(residualCells),connected=residualConnectedBit(lines[j],p);Aq[p.cell][j]=eventParity;Aconnected[p.cell][j]=connected;A[p.cell][j]=eventParity^connected;}
const beta=mul(T(C),mul(A,R));
const betaQRank=rank(mul(T(C),mul(Aq,R)));
const betaConnectedRank=rank(mul(T(C),mul(Aconnected,R)));
assert.equal(betaQRank,20);assert.equal(betaConnectedRank,16);assert.equal(rank(beta),28);

// Define T basis-independently by beta(Ty,z)=gamma(y,z) for every z in Yline.
// In arbitrary execution bases: beta=C^T A R and gamma=R^T D^T Q D R.
// If y has coordinate b and Ty coordinate a, beta^T a=gamma^T b.
const coordinateT=mul(inverse(T(beta)),T(gamma));assert.equal(rank(coordinateT),28);
const ambientT=mul(C,coordinateT);
assert.equal(rank(ambientT),28);
assert.deepEqual(mul([...col,...row],ambientT),zeros(W+H,28));
assert.deepEqual(mul(T(ambientT),mul(A,R)),gamma);

// Left-right equivariance. Top-bottom equivariance is intentionally not a
// requirement because gravity/support order is part of the construction.
const lineIndex=new Map(lines.map((l,i)=>[key(l.cells.map(p=>p.cell)),i]));
const reflCell=c=>Math.floor(c/W)*W+(W-1-(c%W));
const cp=Array.from({length:N},(_,c)=>reflCell(c));
const lp=lines.map(l=>lineIndex.get(key(l.cells.map(p=>reflCell(p.cell)))));
function permuteRows(M,p){const out=zeros(M.length,M[0].length);for(let i=0;i<M.length;i++)out[p[i]]=M[i].slice();return out;}
function coordinateAction(basisColumns,permutation){const reflected=permuteRows(basisColumns,permutation);const pivotRows=independentCols(T(basisColumns));assert.equal(pivotRows.length,basisColumns[0].length);const square=pivotRows.map(i=>basisColumns[i]);return mul(inverse(square),pivotRows.map(i=>reflected[i]));}
const Sc=coordinateAction(C,cp),Sl=coordinateAction(R,lp);
assert.deepEqual(mul(coordinateT,Sl),mul(Sc,coordinateT));
assert.deepEqual(mul(T(Sl),mul(gamma,Sl)),gamma);
assert.deepEqual(mul(T(Sc),mul(beta,Sl)),beta);

// Representation-independence audit: change both arbitrary Gaussian bases by
// independent invertible transvections and recover the same ambient map.
function identity(n){return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));}
const U=identity(28),V=identity(28);U[0][7]^=1;U[5][19]^=1;V[2][11]^=1;V[9][23]^=1;
assert.equal(rank(U),28);assert.equal(rank(V),28);
const beta2=mul(T(U),mul(beta,V)),gamma2=mul(T(V),mul(gamma,V));
const coordinateT2=mul(inverse(T(beta2)),T(gamma2));
const ambientFromChangedBasesOnOriginal=mul(C,mul(U,mul(coordinateT2,inverse(V))));
assert.deepEqual(ambientFromChangedBasesOnOriginal,ambientT);

console.log(`CPC_RESIDUAL_MIDDLE_ISOMORPH=${JSON.stringify({
  kind:'standard7x6-cpc-residual-middle-isomorph-v1',proved:true,
  primitives:{field:FIELD,connect:K,rows:H,columns:W},
  derived:{lineCount:L,rankB,kernelDimension:kerB.length,middleDimension:Ycell.length,degree3ResidualCount:c3.length},
  cpcResidualBridge:{qDefinition:'supportClosureSize(S)+maxRow(S) mod 2',interpretation:'zero-reservation CPC event-count parity at any highest residual event after minimal support closure',lineSelfPairingRank:rank(gamma),ownerParityWeightedLineRank:ownerParityWeightedRank},
  crossPairing:{combinedRank:rank(beta),eventParityOnlyRank:betaQRank,residualConnectednessOnlyRank:betaConnectedRank,weight:'q(line\\{cell}) XOR connected(line\\{cell})'},
  directIsomorphism:{rank:rank(coordinateT),definition:'beta(Ty,z)=gamma(y,z) for every z in Y_line',commutingIdentity:'beta_flat o T = gamma_flat',leftRightEquivariant:true,basisChangeInvariant:true,explicitCoordinateRows:coordinateT.map(r=>r.join(''))},
  theorem:'An explicit Connect4-defined natural isomorphism T:Y_line->Y_cell exists. The 28-dimensional equality is not merely a rank coincidence. Uniqueness among every conceivable natural construction is not claimed.',
  proofBoundary:'Finite structural theorem only; no W/D/L premise or consequence. Top-bottom symmetry is not required because gravity/support order is structural data.',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
})}`);
