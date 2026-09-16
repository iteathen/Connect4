#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Oracle-validation audit only. The 28-line selector uses solved-data premises from
// repository issue #41 (forced center prefix + terminal ply 41). Those premises are
// deliberately NOT fed into the target-free structural theorem for the emergent 28.

const K=4,H=6,W=7,N=W*H,DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const zeros=(r,c)=>Array.from({length:r},()=>Array(c).fill(0));
function rref(M){const a=M.map(r=>r.map(x=>x&1));let row=0;const piv=[];for(let col=0;col<(a[0]?.length??0)&&row<a.length;col++){let p=row;while(p<a.length&&!a[p][col])p++;if(p===a.length)continue;[a[row],a[p]]=[a[p],a[row]];for(let r=0;r<a.length;r++)if(r!==row&&a[r][col])for(let c=col;c<a[0].length;c++)a[r][c]^=a[row][c];piv.push(col);row++;}return{a,piv};}
const rank=M=>rref(M).piv.length;
function nullBasis(M){const {a,piv}=rref(M),n=a[0]?.length??0,ps=new Set(piv),free=Array.from({length:n},(_,i)=>i).filter(i=>!ps.has(i));return free.map(f=>{const v=Array(n).fill(0);v[f]=1;for(let r=0;r<piv.length;r++){let b=0;for(const j of free)b^=a[r][j]&v[j];v[piv[r]]=b;}return v;});}
function mul(A,B){assert.equal(A[0]?.length??0,B.length);const o=zeros(A.length,B[0]?.length??0);for(let i=0;i<A.length;i++)for(let k=0;k<(A[0]?.length??0);k++)if(A[i][k])for(let j=0;j<(B[0]?.length??0);j++)o[i][j]^=B[k][j];return o;}
function cols(M,ids){return M.map(r=>ids.map(i=>r[i]));}
function generateLines(){const out=[];for(let x=0;x<W;x++)for(let y=0;y<H;y++)for(const [dx,dy] of DIRS){const cells=[];let ok=true;for(let i=0;i<K;i++){const xx=x+i*dx,yy=y+i*dy;if(xx<0||xx>=W||yy<0||yy>=H){ok=false;break;}cells.push({x:xx,y:yy,cell:yy*W+xx});}if(ok)out.push({x,y,dx,dy,cells});}return out;}
const lines=generateLines(),L=lines.length;assert.equal(L,69);
const B=zeros(N,L);lines.forEach((l,j)=>l.cells.forEach(p=>B[p.cell][j]=1));assert.equal(rank(B),35);

// Issue #41 solved-oracle premises: first five plies are center; therefore P1
// owns center rows 2 and 4 (one-based), P0 owns center rows 1,3,5; distance-optimal
// play terminates on ply 41, so the final landing is in row 5 or 6 (one-based).
const fixedP1=new Set(['3,1','3,3']);
const fixedP0=new Set(['3,0','3,2','3,4']);
const optimalLineIds=[];
for(let i=0;i<L;i++){
  const l=lines[i];
  const blocked=l.cells.some(p=>fixedP1.has(`${p.x},${p.y}`));
  const canContainFinalLanding=l.cells.some(p=>p.y>=4&&!fixedP0.has(`${p.x},${p.y}`));
  if(!blocked&&canContainFinalLanding)optimalLineIds.push(i);
}
assert.equal(optimalLineIds.length,28);
const orientationCounts={vertical:0,horizontal:0,diagonal:0};
for(const i of optimalLineIds){const l=lines[i];if(l.dx===0)orientationCounts.vertical++;else if(l.dy===0)orientationCounts.horizontal++;else orientationCounts.diagonal++;}
assert.deepEqual(orientationCounts,{vertical:12,horizontal:8,diagonal:8});

const Bopt=cols(B,optimalLineIds),optimalIncidenceRank=rank(Bopt),optimalDependencies=nullBasis(Bopt);
assert.equal(optimalIncidenceRank,26);assert.equal(optimalDependencies.length,2);

const vertical=zeros(W,L);lines.forEach((l,j)=>{if(l.dx===0&&l.dy===1)vertical[l.x][j]=1;});
const embeddedDependencies=optimalDependencies.map(v=>{const x=Array(L).fill(0);for(let i=0;i<v.length;i++)if(v[i])x[optimalLineIds[i]]=1;return x;});
for(const d of embeddedDependencies){assert.deepEqual(mul(B,d.map(x=>[x])).flat(),Array(N).fill(0));assert.deepEqual(mul(vertical,d.map(x=>[x])).flat(),Array(W).fill(0));}
const dependencySupports=embeddedDependencies.map(d=>d.map((bit,i)=>bit?i:-1).filter(i=>i>=0));
assert.deepEqual(dependencySupports,[[34,35,37,43,53,58],[13,14,27,28,61,62]]);

const lineIndex=new Map(lines.map((l,i)=>[l.cells.map(p=>`${p.x},${p.y}`).sort().join('|'),i]));
const reflectedLine=i=>lineIndex.get(lines[i].cells.map(p=>`${W-1-p.x},${p.y}`).sort().join('|'));
assert.deepEqual(dependencySupports[0].map(reflectedLine).sort((a,b)=>a-b),dependencySupports[1].slice().sort((a,b)=>a-b));

const axis=zeros(W+H,N);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=y*W+x;axis[x][c]=1;axis[W+y][c]=1;}
const optimalAxis=mul(axis,Bopt),optimalBoundaryRank=rank(optimalAxis),optimalCellCoreDimension=optimalIncidenceRank-optimalBoundaryRank;
assert.equal(optimalBoundaryRank,6);assert.equal(optimalCellCoreDimension,20);

// Natural 7D axis-interval quotient basis: four K-column intervals plus three K-row intervals.
const Q=zeros(W+H,(W-K+1)+(H-K+1));let qcol=0;
for(let s=0;s<=W-K;s++){for(let i=0;i<K;i++)Q[s+i][qcol]=1;qcol++;}
for(let s=0;s<=H-K;s++){for(let i=0;i<K;i++)Q[W+s+i][qcol]=1;qcol++;}
assert.equal(rank(Q),7);
const missing=[];for(let j=0;j<Q[0].length;j++)if(rank(optimalAxis.map((r,i)=>[...r,Q[i][j]]))>optimalBoundaryRank)missing.push(j);
assert.deepEqual(missing,[4]); // first row-interval coordinate = vertical rows 1..4 one-based.

const fullYcellDimension=28;
const optimalPlusYcellDimension=optimalIncidenceRank+fullYcellDimension-optimalCellCoreDimension;
assert.equal(optimalPlusYcellDimension,34);assert.equal(rank(B)-optimalPlusYcellDimension,1);

console.log(`OPTIMAL_28_INCIDENCE_ORACLE_AUDIT=${JSON.stringify({
  kind:'standard7x6-distance-optimal-28-incidence-oracle-audit-v1',proved:true,
  sourceEvidence:'repository issue #41',
  oraclePremises:{forcedPrefix:'center x5',terminalPly:41,warning:'solved-oracle validation premises; not target-free structural premises'},
  optimalTerminalLines:{count:optimalLineIds.length,orientationCounts,lineIds:optimalLineIds},
  incidenceFiltration:{coordinateDimension:28,incidenceRank:optimalIncidenceRank,lineDependencyDimension:optimalDependencies.length,dependenciesInYLine:true,dependencySupports,horizontalReflectionExchangesDependencies:true,cellCoreIntersectionDimension:optimalCellCoreDimension,axisBoundaryRank:optimalBoundaryRank,decomposition:'28 = 2 line-kernel + 20 cell-core image + 6 axis-boundary'},
  missingAxisCoordinate:{index:4,meaning:'bottom vertical K-row interval (rows 1..4 one-based)',reason:'cannot contain the ply-41 landing in row 5 or 6'},
  relationToCommonY:{directIdentification:false,reason:'E_opt intersects Y_line in dimension 2; B(E_opt) intersects Y_cell in dimension 20, not 28',imagePlusYcellDimension:optimalPlusYcellDimension,codimensionInImB:1},
  wdlOnlyControl:'The earlier 61-line W/D/L-only traversal is broader because all P1 moves at lost positions tie at value -1; distance-to-loss breaks those ties and defines the 28-line object.',
  proofBoundary:'External solved-oracle cross-check only. It validates a structured relationship to Y but is not used to derive the target-free middle theorem.',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
})}`);
