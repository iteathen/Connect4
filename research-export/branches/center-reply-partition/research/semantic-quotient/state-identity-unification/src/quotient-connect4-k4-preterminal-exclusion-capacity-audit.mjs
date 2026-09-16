#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Exact finite static audit at the natural K=4 P0 preterminal rank (five plies).
// This is NOT a game-theoretic objective and does not recursively score child
// states.  It measures only how much of P0's parity-capacity maximal-delay
// terminal support envelope a legal five-event prefix can already exclude.

const K=4,PRETERMINAL_PLY=2*K-3;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];

function linesFor(W,H){
  const lines=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){
    let mask=0n;const cells=[];let ok=true;
    for(let i=0;i<K;i++){
      const xx=x+i*dx,yy=y+i*dy;
      if(xx<0||xx>=W||yy<0||yy>=H){ok=false;break;}
      const cell=yy*W+xx;cells.push([xx,yy,cell]);mask|=1n<<BigInt(cell);
    }
    if(ok)lines.push({cells,mask});
  }
  return lines;
}
function latestP0Capacity(W,H){const N=W*H,T=(N&1)?N:N-1,q=N-T+1,t=Math.max(0,H-q);return{T,q,t};}
function envelope(W,H){
  const {T,q,t}=latestP0Capacity(W,H);
  const lines=linesFor(W,H).filter(l=>l.cells.some(([,y])=>y>=t)).map(l=>{
    let landing=0n;for(const [,,cell] of l.cells)if(Math.floor(cell/W)>=t)landing|=1n<<BigInt(cell);
    return {...l,landing};
  });
  return {T,q,t,lines};
}
function statesAtFive(W,H){
  let states=new Map([['0/0',{p0:0n,p1:0n,h:new Uint8Array(W)}]]);
  for(let ply=0;ply<PRETERMINAL_PLY;ply++){
    const next=new Map();
    for(const st of states.values())for(let c=0;c<W;c++){
      const r=st.h[c];if(r>=H)continue;
      const bit=1n<<BigInt(r*W+c),h=st.h.slice();h[c]++;
      const p0=(ply&1)?st.p0:st.p0|bit,p1=(ply&1)?st.p1|bit:st.p1;
      const key=`${p0.toString(16)}/${p1.toString(16)}`;
      if(!next.has(key))next.set(key,{p0,p1,h});
    }
    states=next;
  }
  return [...states.values()];
}
function audit(W,H){
  const env=envelope(W,H),states=statesAtFive(W,H);let maxExcluded=-1,best=[];
  for(const st of states){
    const occupied=st.p0|st.p1;let excluded=0;
    for(const l of env.lines){
      if(l.mask&st.p1){excluded++;continue;}
      if((l.landing&~occupied)===0n)excluded++;
    }
    if(excluded>maxExcluded){maxExcluded=excluded;best=[st];}
    else if(excluded===maxExcluded)best.push(st);
  }
  const Ycell=W*H-W-H-1;
  return {W,H,states:states.length,maximalDelayEnvelope:env.lines.length,maxExcluded,minSurvivors:env.lines.length-maxExcluded,bestStateCount:best.length,Ycell,equalityWithYcell:env.lines.length-maxExcluded===Ycell,bestHeights:best.slice(0,20).map(st=>[...st.h])};
}

const cases=[[5,9],[6,7],[7,5],[7,6],[8,5],[8,7],[13,5]].map(([W,H])=>audit(W,H));
const by=x=>cases.find(c=>c.W===x[0]&&c.H===x[1]);
assert.deepEqual([by([5,9]).maximalDelayEnvelope,by([5,9]).maxExcluded,by([5,9]).minSurvivors],[11,0,11]);
assert.deepEqual([by([6,7]).maximalDelayEnvelope,by([6,7]).maxExcluded,by([6,7]).minSurvivors],[30,5,25]);
assert.deepEqual([by([7,6]).maximalDelayEnvelope,by([7,6]).maxExcluded,by([7,6]).minSurvivors,by([7,6]).bestStateCount],[38,10,28,1]);
assert.deepEqual(by([7,6]).bestHeights,[[0,0,0,5,0,0,0]]);
assert.deepEqual([by([8,5]).maximalDelayEnvelope,by([8,5]).maxExcluded,by([8,5]).minSurvivors],[46,14,32]);
assert.deepEqual([by([8,7]).maximalDelayEnvelope,by([8,7]).maxExcluded,by([8,7]).minSurvivors,by([8,7]).Ycell],[46,6,40,40]);
assert.deepEqual([by([13,5]).maximalDelayEnvelope,by([13,5]).maxExcluded,by([13,5]).minSurvivors],[43,7,36]);
assert.deepEqual(cases.filter(c=>c.equalityWithYcell).map(c=>[c.W,c.H]),[[7,6],[8,7]]);

console.log(`K4_PRETERMINAL_EXCLUSION_CAPACITY=${JSON.stringify({
  proved:true,
  preterminalPly:PRETERMINAL_PLY,
  cases,
  standardInterpretation:'7x6 uniquely maximizes the five-event exclusion in the tested standard neighborhood with one center-stack state, yielding 38-10=28.',
  falsifier:'Equality between minimum surviving maximal-delay envelope and Y_cell is not a universal selector: 8x7 also has 46-6=40=Y_cell.',
  proofBoundary:'Exact finite enumeration of five-ply legal colored prefixes for the listed boards. It is a static capacity audit only; no claim that optimal play maximizes or minimizes this quantity.',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'}
})}`);
