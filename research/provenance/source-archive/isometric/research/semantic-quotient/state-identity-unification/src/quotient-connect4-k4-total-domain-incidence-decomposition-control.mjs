#!/usr/bin/env node
import assert from 'node:assert/strict';

const K=4;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];

function rank(rows){
  const basis=new Map();
  let r=0;
  for(const input of rows){
    let v=input;
    while(v){
      const p=v.toString(2).length-1;
      const b=basis.get(p);
      if(b===undefined){basis.set(p,v);r++;break;}
      v^=b;
    }
  }
  return r;
}

function lines(W,H){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){
    const cells=[];
    let ok=true;
    for(let i=0;i<K;i++){
      const xx=x+i*dx,yy=y+i*dy;
      if(xx<0||xx>=W||yy<0||yy>=H){ok=false;break;}
      cells.push(yy*W+xx);
    }
    if(ok)out.push({x,y,dx,dy,cells});
  }
  return out;
}

function generated(W,H){
  const ls=lines(W,H),N=W*H,L=ls.length;
  const cellMasks=[],axisMasks=[],cellRows=Array(N).fill(0n),verticalRows=Array(W).fill(0n);
  for(let j=0;j<L;j++){
    const bit=1n<<BigInt(j),l=ls[j];
    let cm=0n,am=0n;
    for(const c of l.cells){
      cm|=1n<<BigInt(c);
      cellRows[c]^=bit;
      const x=c%W,y=Math.floor(c/W);
      am^=1n<<BigInt(x);
      am^=1n<<BigInt(W+y);
    }
    cellMasks.push(cm);
    axisMasks.push(am);
    if(l.dx===0&&l.dy===1)verticalRows[l.x]^=bit;
  }
  const rankB=rank(cellMasks);
  const axisRank=rank(axisMasks);
  const phaseRank=rank([...cellRows,...verticalRows])-rank(cellRows);
  return {
    L,
    rankB,
    kernel:L-rankB,
    axisRank,
    phaseRank,
    Ycell:rankB-axisRank,
    Yline:L-rankB-phaseRank,
  };
}

function formula(W,H){
  const a=Math.max(W-3,0),b=Math.max(H-3,0);
  const p=Math.min(W,3),q=Math.min(H,3);
  const ab=a*b,d=Math.min(2,ab);
  const phase=
    Math.min(a,ab)
    + Math.min(2,ab,a+Math.floor(Math.max(b-1,0)/2));
  const rankB=W*H-p*q+d;
  const L=H*a+W*b+2*ab;
  const axis=a+b;
  return {
    L,
    rankB,
    kernel:3*ab-d,
    axisRank:axis,
    phaseRank:phase,
    Ycell:rankB-axis,
    Yline:3*ab-d-phase,
  };
}

// Validation/falsification only. The quantified proof is the research note.
for(let W=1;W<=14;W++)for(let H=1;H<=14;H++){
  assert.deepEqual(generated(W,H),formula(W,H),`${W}x${H}`);
}

assert.deepEqual(formula(7,6),{
  L:69,rankB:35,kernel:34,axisRank:7,phaseRank:6,Ycell:28,Yline:28,
});
assert.deepEqual(formula(1,1),{
  L:0,rankB:0,kernel:0,axisRank:0,phaseRank:0,Ycell:0,Yline:0,
});
assert.deepEqual(formula(3,4),{
  L:3,rankB:3,kernel:0,axisRank:1,phaseRank:0,Ycell:2,Yline:0,
});

console.log('TOTAL_DOMAIN_INCIDENCE_DECOMPOSITION_CONTROL=PASS');
console.log('PROOF_BOUNDARY=finite execution is falsification/implementation qualification only; quantified proof is in docs/research/2026-09-14-total-domain-incidence-decomposition.md');
