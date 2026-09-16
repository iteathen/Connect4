#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Falsify the naive iterative 28->21->14->7 ladder under two natural marked
// sequentializations of residual cofactor. The qualified 21-space is a first
// formal residual-boundary quotient, not yet a complete legal-play derivative ladder.

const W=7,H=6,K=4,N=W*H,DIRS=[[1,0],[0,1],[1,1],[1,-1]],zeros=(r,c)=>Array.from({length:r},()=>Array(c).fill(0));
const T=M=>M.length?Array.from({length:M[0].length},(_,c)=>M.map(r=>r[c])):[];
function rref(M){const a=M.map(r=>r.slice());let row=0,p=[];for(let c=0;c<(a[0]?.length??0)&&row<a.length;c++){let q=row;while(q<a.length&&!a[q][c])q++;if(q===a.length)continue;[a[row],a[q]]=[a[q],a[row]];for(let r=0;r<a.length;r++)if(r!==row&&a[r][c])for(let j=c;j<a[0].length;j++)a[r][j]^=a[row][j];p.push(c);row++;}return{a,pivots:p};}
const rank=M=>rref(M).pivots.length;
function nullBasis(M){const {a,pivots}=rref(M),n=a[0]?.length??0,ps=new Set(pivots),free=Array.from({length:n},(_,i)=>i).filter(i=>!ps.has(i));return free.map(f=>{const v=Array(n).fill(0);v[f]=1;for(let r=0;r<pivots.length;r++){let b=0;for(const j of free)b^=a[r][j]&v[j];v[pivots[r]]=b;}return v;});}
function mul(A,B){const o=zeros(A.length,B[0]?.length??0);for(let i=0;i<A.length;i++)for(let k=0;k<(A[0]?.length??0);k++)if(A[i][k])for(let j=0;j<(B[0]?.length??0);j++)o[i][j]^=B[k][j];return o;}
function gen(){const o=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){const cells=[];let ok=true;for(let i=0;i<K;i++){const xx=x+i*dx,yy=y+i*dy;if(xx<0||xx>=W||yy<0||yy>=H){ok=false;break;}cells.push(yy*W+xx);}if(ok)o.push({x,y,dx,dy,cells});}return o;}
const lines=gen(),L=lines.length,B=zeros(N,L);lines.forEach((l,j)=>l.cells.forEach(c=>B[c][j]=1));
const kerB=nullBasis(B),vertical=zeros(W,L);lines.forEach((l,j)=>{if(l.dx===0)vertical[l.x][j]=1;});
function restrictedKernel(map,basis){const C=T(basis),coef=nullBasis(mul(map,C));return coef.map(a=>{const v=Array(C.length).fill(0);for(let j=0;j<a.length;j++)if(a[j])for(let i=0;i<C.length;i++)v[i]^=C[i][j];return v;});}
const Yline=restrictedKernel(vertical,kerB),Ycolumns=T(Yline);assert.equal(rank(Ycolumns),28);

function frontierVector(remaining){const maxBy=Array(W).fill(-1),coords=remaining.map(c=>[c%W,Math.floor(c/W)]);for(const [x,y] of coords)maxBy[x]=Math.max(maxBy[x],y);const closure=maxBy.reduce((a,r)=>a+(r>=0?r+1:0),0),maxRow=Math.max(...coords.map(p=>p[1])),q=(closure+maxRow)&1,out=Array(W).fill(0);for(let x=0;x<W;x++){const top=coords.some(([cx,cy])=>cx===x&&cy===maxRow)?1:0,phase=maxBy[x]>=0?((maxBy[x]+1)&1):0;out[x]=top^(q&phase);}return out;}

function runMarked({supportLegal}){
 let states=lines.map((l,i)=>({line:i,remaining:l.cells.slice(),history:[]})),core=Ycolumns,levels=[];
 for(let degree=3;degree>=1;degree--){
  const children=[],parents=[];
  for(let i=0;i<states.length;i++)for(const c of states[i].remaining){
   if(supportLegal){const x=c%W,y=Math.floor(c/W);if(states[i].remaining.some(o=>o%W===x&&Math.floor(o/W)<y))continue;}
   children.push({line:states[i].line,remaining:states[i].remaining.filter(v=>v!==c),history:[...states[i].history,c]});parents.push(i);
  }
  const image=children.map((_,i)=>core[parents[i]].slice()),F=zeros(W,children.length);
  children.forEach((s,j)=>{const v=frontierVector(s.remaining);for(let x=0;x<W;x++)F[x][j]=v[x];});
  const frontier=mul(F,image),frontierRank=rank(frontier),coefficientCore=nullBasis(frontier),next=mul(image,T(coefficientCore));
  levels.push({degree,stateCount:children.length,imageDimension:rank(image),frontierRank,nextCoreDimension:rank(next)});
  states=children;core=next;
 }
 return levels;
}

const formalMarked=runMarked({supportLegal:false});
const supportLegalMarked=runMarked({supportLegal:true});
assert.deepEqual(formalMarked.map(x=>[x.frontierRank,x.nextCoreDimension]),[[7,21],[0,21],[0,21]]);
assert.deepEqual(supportLegalMarked.map(x=>[x.frontierRank,x.nextCoreDimension]),[[6,22],[7,15],[0,15]]);

console.log(`RESIDUAL_SEQUENTIAL_LADDER_FALSIFIER=${JSON.stringify({
 kind:'standard7x6-residual-sequential-ladder-falsifier-v1',proved:true,
 formalMarked,supportLegalMarked,
 falsified:'Neither natural marked interpretation yields the naive 28->21->14->7 ladder under repeated use of the degree-3 frontier rule.',
 interpretation:'The qualified 21-dimensional object is a first formal residual-boundary quotient. Further sequential descent needs additional history/support semantics rather than arity substitution.',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
})}`);
