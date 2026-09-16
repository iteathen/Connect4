#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Explicit natural sections for the corrected cell-axis and line-phase exact
// sequences. The line-side quotient is also the correctly typed home of the
// two-ply CPC phase displacement e_a+e_b.

const K=4,H=6,W=7,N=W*H,DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const zeros=(r,c)=>Array.from({length:r},()=>Array(c).fill(0));
const T=M=>M.length?Array.from({length:M[0].length},(_,c)=>M.map(r=>r[c])):[];
function rref(M){const a=M.map(r=>r.slice());let row=0,p=[];for(let c=0;c<(a[0]?.length??0)&&row<a.length;c++){let q=row;while(q<a.length&&!a[q][c])q++;if(q===a.length)continue;[a[row],a[q]]=[a[q],a[row]];for(let r=0;r<a.length;r++)if(r!==row&&a[r][c])for(let j=c;j<a[0].length;j++)a[r][j]^=a[row][j];p.push(c);row++;}return{a,pivots:p};}
const rank=M=>rref(M).pivots.length;
function nullBasis(M){const {a,pivots}=rref(M),n=a[0]?.length??0,ps=new Set(pivots),free=Array.from({length:n},(_,i)=>i).filter(i=>!ps.has(i));return free.map(f=>{const v=Array(n).fill(0);v[f]=1;for(let r=0;r<pivots.length;r++){let b=0;for(const j of free)b^=a[r][j]&v[j];v[pivots[r]]=b;}return v;});}
function mul(A,B){assert.equal(A[0]?.length??0,B.length);const o=zeros(A.length,B[0]?.length??0);for(let i=0;i<A.length;i++)for(let k=0;k<(A[0]?.length??0);k++)if(A[i][k])for(let j=0;j<(B[0]?.length??0);j++)o[i][j]^=B[k][j];return o;}
function genLines(){let o=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){let cells=[],ok=true;for(let i=0;i<K;i++){let xx=x+i*dx,yy=y+i*dy;if(xx<0||xx>=W||yy<0||yy>=H){ok=false;break;}cells.push(yy*W+xx);}if(ok)o.push({x,y,dx,dy,cells});}return o;}
const lines=genLines(),L=lines.length,B=zeros(N,L);lines.forEach((l,j)=>l.cells.forEach(c=>B[c][j]=1));assert.equal(rank(B),35);
const col=zeros(W,N),row=zeros(H,N);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=y*W+x;col[x][c]=1;row[y][c]=1;}const axis=[...col,...row];
const verticalParity=zeros(W,L);lines.forEach((l,j)=>{if(l.dx===0&&l.dy===1)verticalParity[l.x][j]=1;});
function lineIndex(x,y,dx,dy){const j=lines.findIndex(l=>l.x===x&&l.y===y&&l.dx===dx&&l.dy===dy);assert(j>=0,`missing line ${x},${y},${dx},${dy}`);return j;}
const lineCellColumn=j=>B.map(r=>r[j]);

// Cell quotient Q_axis: four length-4 column intervals plus three length-4 row intervals.
const Qaxis=zeros(W+H,(W-K+1)+(H-K+1));
for(let s=0;s<=W-K;s++)for(let i=0;i<K;i++)Qaxis[s+i][s]=1;
for(let s=0;s<=H-K;s++)for(let i=0;i<K;i++)Qaxis[W+s+i][W-K+1+s]=1;
assert.equal(rank(Qaxis),7);
// Section: bottom-row horizontals lift column intervals; center-column verticals lift row intervals.
const Scell=zeros(N,7);for(let s=0;s<=W-K;s++){const v=lineCellColumn(lineIndex(s,0,1,0));for(let c=0;c<N;c++)Scell[c][s]=v[c];}
const center=(W-1)/2;for(let s=0;s<=H-K;s++){const v=lineCellColumn(lineIndex(center,s,0,1));for(let c=0;c<N;c++)Scell[c][W-K+1+s]=v[c];}
assert.deepEqual(mul(axis,Scell),Qaxis);assert.equal(rank(Scell),7);
const YcellDim=rank(B)-rank(mul(axis,B));assert.equal(YcellDim,28);assert.equal(YcellDim+rank(Scell),rank(B));

// Line quotient Even(F2^W): center-star basis e_c+e_center, c != center.
const nonCenter=[0,1,2,4,5,6],phaseBasis=zeros(W,W-1);for(let j=0;j<nonCenter.length;j++){phaseBasis[nonCenter[j]][j]=1;phaseBasis[center][j]=1;}assert.equal(rank(phaseBasis),6);for(const c of T(phaseBasis))assert.equal(c.reduce((a,b)=>a^b,0),0);
function coeffVector(specs){const v=Array(L).fill(0);for(const [x,y,dx,dy] of specs)v[lineIndex(x,y,dx,dy)]^=1;return v;}
// Three left-of-center six-line GF(2) dependency cycles. The three right
// cycles are exact left-right reflections, so the section itself is equivariant.
const leftCycles=[
 coeffVector([[0,0,0,1],[0,0,1,1],[3,0,0,1],[0,1,1,0],[0,2,1,0],[0,3,1,-1]]),
 coeffVector([[1,0,0,1],[1,0,1,1],[0,1,1,0],[0,1,1,1],[3,1,0,1],[1,3,1,0]]),
 coeffVector([[1,0,1,0],[1,0,1,1],[2,0,0,1],[3,0,0,1],[1,3,1,0],[1,3,1,-1]]),
];
const lineKey=l=>l.cells.slice().sort((a,b)=>a-b).join(','),lineMap=new Map(lines.map((l,i)=>[lineKey(l),i]));
const reflCell=c=>Math.floor(c/W)*W+(W-1-(c%W));
const linePerm=lines.map(l=>lineMap.get(l.cells.map(reflCell).sort((a,b)=>a-b).join(',')));
function reflectLineVector(v){const o=Array(L).fill(0);for(let i=0;i<L;i++)o[linePerm[i]]=v[i];return o;}
const Sline=zeros(L,6);for(let j=0;j<3;j++)for(let i=0;i<L;i++)Sline[i][j]=leftCycles[j][i];for(let j=0;j<3;j++){const rv=reflectLineVector(leftCycles[2-j]);for(let i=0;i<L;i++)Sline[i][3+j]=rv[i];}
assert.deepEqual(mul(B,Sline),zeros(N,6));assert.deepEqual(mul(verticalParity,Sline),phaseBasis);assert.equal(rank(Sline),6);
const kernelBasisColumns=T(nullBasis(B)),kerDim=L-rank(B),lineProjectionRank=rank(mul(verticalParity,kernelBasisColumns)),YlineDim=kerDim-lineProjectionRank;
assert.equal(kerDim,34);assert.equal(lineProjectionRank,6);assert.equal(YlineDim,28);assert.equal(YlineDim+rank(Sline),kerDim);

// Both sections respect left-right reflection.
const cellPerm=Array.from({length:N},(_,c)=>reflCell(c));
function permuteRows(M,p){const o=zeros(M.length,M[0].length);for(let i=0;i<M.length;i++)o[p[i]]=M[i].slice();return o;}
const QcellRefl=zeros(7,7);for(let j=0;j<4;j++)QcellRefl[3-j][j]=1;for(let j=4;j<7;j++)QcellRefl[j][j]=1;
assert.deepEqual(permuteRows(Scell,cellPerm),mul(Scell,QcellRefl));
const QphaseRefl=zeros(6,6);for(let j=0;j<6;j++)QphaseRefl[5-j][j]=1;
assert.deepEqual(permuteRows(Sline,linePerm),mul(Sline,QphaseRefl));

// Typed CPC P transport. Every two-ply phase displacement is even-weight and
// therefore lies exactly in the line-side quotient. Lift through Sline.
function phaseDelta(a,b){const d=Array(W).fill(0);d[a]^=1;d[b]^=1;return d;}
function starCoordinates(delta){assert.equal(delta.reduce((a,b)=>a^b,0),0);return nonCenter.map(c=>delta[c]);}
function liftPhase(delta){return mul(Sline,starCoordinates(delta).map(x=>[x])).flat();}
let sameColumnIdentity=0,distinctBoundaryOnly=0;
for(let a=0;a<W;a++)for(let b=0;b<W;b++){
 const d=phaseDelta(a,b),lift=liftPhase(d);
 assert.deepEqual(mul(verticalParity,lift.map(x=>[x])).flat(),d);
 assert.deepEqual(mul(B,lift.map(x=>[x])).flat(),Array(N).fill(0));
 if(a===b){assert(d.every(x=>x===0));assert(lift.every(x=>x===0));sameColumnIdentity+=1;}
 else {assert(d.some(x=>x));assert(lift.some(x=>x));distinctBoundaryOnly+=1;}
}

console.log(`NATURAL_BOUNDARY_SPLITTINGS=${JSON.stringify({
 kind:'standard7x6-natural-boundary-splittings-v1',proved:true,
 primitives:{connect:K,rows:H,columns:W},
 cellSplit:{coreDimension:YcellDim,boundaryDimension:rank(Scell),quotientStructure:'length-4 column intervals (4) + length-4 row intervals (3)',section:'bottom-row horizontals + center-column verticals',identity:'axisProjection o section = Q_axis basis'},
 lineSplit:{coreDimension:YlineDim,boundaryDimension:rank(Sline),quotientStructure:'Even(F2^7)',section:'six center-star geometric dependency cycles',identity:'verticalLineParity o section = center-star phase basis'},
 P:{sameColumnIdentity,distinctColumnCases:distinctBoundaryOnly,typedConclusion:'two-ply CPC phase displacement is exactly a line-boundary quotient coordinate; its section lift changes only the boundary factor and leaves the common Y coordinate fixed'},
 leftRightEquivariant:true,
 theorem:'im(B)=Y_cell direct-sum C_axis and ker(B)=Y_line direct-sum C_phase with explicit Connect4-defined sections. P belongs to the line-phase boundary factor, not the cell-incidence quotient.',
 proofBoundary:'This is a typed structural representation of P displacement, not a claim that adding a line-dependency vector is itself a legal game transition.',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
})}`);
