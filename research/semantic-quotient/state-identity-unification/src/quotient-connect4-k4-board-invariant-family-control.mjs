#!/usr/bin/env node
import assert from 'node:assert/strict';

const K=4;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];

function bitLength(v){return v===0n?0:v.toString(2).length;}
function rankMasks(rows){
  const basis=new Map();
  let rank=0;
  for(const input of rows){
    let v=input;
    while(v){
      const p=bitLength(v)-1;
      const b=basis.get(p);
      if(b===undefined){basis.set(p,v);rank++;break;}
      v^=b;
    }
  }
  return rank;
}
function generateLines(W,H){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){
    const cells=[];let ok=true;
    for(let i=0;i<K;i++){
      const xx=x+i*dx,yy=y+i*dy;
      if(xx<0||xx>=W||yy<0||yy>=H){ok=false;break;}
      cells.push(yy*W+xx);
    }
    if(ok)out.push({x,y,dx,dy,cells});
  }
  return out;
}
function geometricCount(W,H){const a=Math.max(W-K+1,0),b=Math.max(H-K+1,0);return H*a+W*b+2*a*b;}
function maximalDelaySupport(W,H,player){const N=W*H, parity=player===0?1:0;const T=(N&1)===parity?N:N-1;const q=N-T+1;const t=Math.max(0,H-q);return {player,latestParityCompatibleTerminal:T,emptyBeforeTerminal:q,minLandingRow:t,supportEnvelope:geometricCount(W,H)-geometricCount(W,t)};}
function invariants(W,H){
  const lines=generateLines(W,H),L=lines.length,N=W*H;
  const cellRows=Array(N).fill(0n),verticalRows=Array(W).fill(0n),axisImages=[];
  const lineCellMasks=[];
  for(let j=0;j<L;j++){
    const bit=1n<<BigInt(j),line=lines[j];
    let cm=0n,axis=0n;
    for(const c of line.cells){
      cellRows[c]^=bit; cm|=1n<<BigInt(c);
      const x=c%W,y=Math.floor(c/W);
      axis^=1n<<BigInt(x);
      axis^=1n<<BigInt(W+y);
    }
    lineCellMasks.push(cm);axisImages.push(axis);
    if(line.dx===0&&line.dy===1)verticalRows[line.x]^=bit;
  }
  const rankB=rankMasks(lineCellMasks);
  const kernel=L-rankB;
  const axisRank=rankMasks(axisImages);
  const phaseRank=rankMasks([...cellRows,...verticalRows])-rankMasks(cellRows);
  return {W,H,L,rankB,kernel,axisRank,phaseRank,Ycell:rankB-axisRank,Yline:kernel-phaseRank,delta:(kernel-phaseRank)-(rankB-axisRank)};
}

const checked=[];
for(let W=4;W<=13;W++)for(let H=4;H<=13;H++){
  const d=invariants(W,H);checked.push(d);
  const expectedL=4*W*H-9*W-9*H+18;
  assert.equal(d.L,expectedL);
  assert.equal(d.axisRank,W+H-6);
  if(W===4&&H===4){
    assert.equal(d.rankB,8);assert.equal(d.phaseRank,2);assert.equal(d.Ycell,6);assert.equal(d.Yline,0);
    continue;
  }
  assert.equal(d.rankB,W*H-7);
  if(W===4&&H===5){
    assert.equal(d.phaseRank,2);assert.equal(d.Ycell,10);assert.equal(d.Yline,2);
    continue;
  }
  assert.equal(d.phaseRank,W-1);
  assert.equal(d.Ycell,W*H-W-H-1);
  assert.equal(d.Yline,3*W*H-10*W-9*H+26);
  assert.equal(d.delta,(W-4)*(2*H-9)-9);
  const t=invariants(H,W);
  if(!(H===4&&W===5) && !(H===4&&W===4)){
    assert.equal(d.delta-t.delta,H-W);
  }
}

const factorPairs=[];
for(const d of [1,3,9]){
  const W=4+d,H=(9+9/d)/2;
  const inv=invariants(W,H);
  assert.equal(inv.delta,0);
  factorPairs.push({W,H,commonCore:inv.Ycell});
}
assert.deepEqual(factorPairs,[{W:5,H:9,commonCore:30},{W:7,H:6,commonCore:28},{W:13,H:5,commonCore:46}]);
const balancedInGrid=checked.filter(d=>d.delta===0&&!(d.W===4&&d.H<=5)).map(d=>[d.W,d.H]);
assert.deepEqual(balancedInGrid.sort((a,b)=>a[0]-b[0]||a[1]-b[1]),[[5,9],[7,6],[13,5]]);
const balancedWithin42=factorPairs.filter(d=>d.W*d.H<=42);
assert.deepEqual(balancedWithin42,[{W:7,H:6,commonCore:28}]);

const standard=invariants(7,6);
const sameCellCore=checked.filter(d=>d.Ycell===standard.Ycell).map(d=>[d.W,d.H]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
const sameLineCore=checked.filter(d=>d.Yline===standard.Yline).map(d=>[d.W,d.H]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
assert.deepEqual(sameCellCore,[[4,11],[6,7],[7,6],[11,4]]);
assert.deepEqual(sameLineCore.filter(([W,H])=>W<=13&&H<=13),[[7,6]]); // other regular solutions lie outside scanned H<=13/W<=13

console.log(`K4_BOARD_INVARIANT_FAMILY=${JSON.stringify({
  proved:true,
  scope:{connect:K,finiteQualification:'4<=W,H<=13',closedFormRegime:'W,H>=4 except explicit (4,4),(4,5) degeneracies'},
  regularClosedForms:{
    lineDimension:'4WH-9W-9H+18',
    incidenceRank:'WH-7',
    axisQuotientRank:'W+H-6',
    phaseQuotientRank:'W-1',
    cellCore:'WH-W-H-1',
    lineCore:'3WH-10W-9H+26',
    gravityDefect:'Y_line-Y_cell=(W-4)(2H-9)-9',
    transposeDefect:'delta(W,H)-delta(H,W)=H-W'
  },
  degeneracies:{'4x4':invariants(4,4),'4x5':invariants(4,5)},
  balancedShapes:factorPairs,
  balancedEquation:'(W-4)(2H-9)=9',
  uniqueBalancedAtMost42Cells:balancedWithin42,
  standardDerived:{...standard,maximalDelaySupport:[maximalDelaySupport(7,6,0),maximalDelaySupport(7,6,1)],sameCellCoreShapesInQualifiedGrid:sameCellCore,sameLineCoreShapesInQualifiedGrid:sameLineCore},
  proofBoundary:'Closed forms are algebraically motivated and finitely qualified here; the executable sweep is not by itself an unbounded proof. Thin boards W<4 or H<4 use the universal rank definitions rather than these regular closed forms.'
})}`);
