#!/usr/bin/env node
import assert from 'node:assert/strict';

const W=7,H=6,K=4;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const cellId=(x,y)=>y*W+x;
const cellKey=(x,y)=>x+','+y;
const cellName=id=>String.fromCharCode(65+(id%W))+String(Math.floor(id/W)+1);

function generatedLines(){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){
    const cells=Array.from({length:K},(_,i)=>[x+i*dx,y+i*dy]);
    if(cells.every(([cx,cy])=>cx>=0&&cx<W&&cy>=0&&cy<H)){
      out.push({id:out.length,cells,cellsIds:cells.map(([cx,cy])=>cellId(cx,cy))});
    }
  }
  return out;
}
const LINES=generatedLines();
assert.equal(LINES.length,69);

function ownsLine(S,L){return L.cells.every(([x,y])=>S.has(cellKey(x,y)));}
function emptyPosition(){return {heights:Array(W).fill(0),stones:[new Set(),new Set()],rank:0,mover:0};}
function legal(P){return Array.from({length:W},(_,c)=>c).filter(c=>P.heights[c]<H);}
function apply(P,c){
  assert(P.heights[c]<H);
  const heights=P.heights.slice(),stones=[new Set(P.stones[0]),new Set(P.stones[1])];
  const playedBy=P.mover,y=heights[c]++;
  stones[playedBy].add(cellKey(c,y));
  const win=LINES.some(L=>ownsLine(stones[playedBy],L));
  return {heights,stones,rank:P.rank+1,mover:1-playedBy,landing:[c,y],playedBy,win};
}
function position(sequence=''){
  let P=emptyPosition();
  for(let i=0;i<sequence.length;i++){
    const c=Number(sequence[i])-1;
    assert(Number.isInteger(c)&&c>=0&&c<W&&P.heights[c]<H);
    const Q=apply(P,c);
    assert.equal(Q.win,false,'input prefix contains earlier terminal at ply '+(i+1));
    P=Q;
  }
  return P;
}
function winningFrontier(P,player){
  const out=[];
  for(const c of legal(P)){
    const S=new Set(P.stones[player]);
    S.add(cellKey(c,P.heights[c]));
    if(LINES.some(L=>ownsLine(S,L)))out.push(c);
  }
  return out;
}
function forcedSingletonEdges(P){
  const attacker=P.mover,out=[];
  for(const a of legal(P)){
    const Q=apply(P,a);
    if(Q.win)continue;
    if(winningFrontier(Q,Q.mover).length)continue;
    const targets=winningFrontier(Q,attacker);
    if(targets.length!==1)continue;
    const t=targets[0],R=apply(Q,t);
    if(R.win)continue;
    out.push({setupColumn:a,forcedBlockColumn:t,Q,R});
  }
  return out;
}

function phi(P){return P.heights.map(h=>h&1);}
function derivative(bits){return Array.from({length:bits.length-1},(_,i)=>bits[i]^bits[i+1]);}
function xorVec(a,b){assert.equal(a.length,b.length);return a.map((x,i)=>x^b[i]);}
function consumption(P,R){return P.heights.map((h,c)=>R.heights[c]-h);}
function mod2(xs){return xs.map(x=>x&1);}

function residualLineMap(P,player){
  const opp=1-player,out=[];
  for(const L of LINES){
    if(L.cells.some(([x,y])=>P.stones[opp].has(cellKey(x,y))))continue;
    const residual=L.cellsIds.filter(id=>{
      const x=id%W,y=Math.floor(id/W);
      return !P.stones[player].has(cellKey(x,y));
    });
    if(residual.length)out.push({lineId:L.id,residual:residual.slice().sort((a,b)=>a-b)});
  }
  return out;
}
function transportResidualMap(before,newOwn,newOpp){
  const own=new Set(newOwn),opp=new Set(newOpp),out=[];
  for(const r of before){
    if(r.residual.some(id=>opp.has(id)))continue;
    const residual=r.residual.filter(id=>!own.has(id));
    if(residual.length)out.push({lineId:r.lineId,residual});
  }
  return out;
}
function residualMapObject(rows){
  return Object.fromEntries(rows.map(r=>[String(r.lineId),r.residual.join(',')]));
}
function minimalAntichain(rows){
  const uniq=[...new Set(rows.map(r=>r.residual.join(',')))]
    .map(s=>s.split(',').filter(Boolean).map(Number))
    .sort((a,b)=>a.length-b.length||a.join(',').localeCompare(b.join(',')));
  const out=[];
  outer:for(const a of uniq){
    for(const b of out){
      if(b.length<=a.length&&b.every(x=>a.includes(x)))continue outer;
    }
    out.push(a);
  }
  return out;
}
function sig(r){return r.join(',');}
function named(r){return r.map(cellName);}

const prefix='444441566';
const root=position(prefix);
const candidate6=apply(root,5);
assert.equal(candidate6.win,false);
assert.equal(candidate6.mover,0);

const edges=forcedSingletonEdges(candidate6);
assert.deepEqual(edges.map(e=>[e.setupColumn+1,e.forcedBlockColumn+1]).sort(),[[2,3],[3,2]]);

const beforePhi=phi(candidate6);
const beforeD=derivative(beforePhi);
assert.deepEqual(candidate6.heights,[1,0,0,5,1,3,0]);
assert.deepEqual(beforePhi,[1,0,0,1,1,1,0]);
assert.deepEqual(beforeD,[1,0,1,0,0,1]);

const fragments=edges.map(e=>{
  const attacker=candidate6.mover,defender=1-attacker;
  const setupId=cellId(e.Q.landing[0],e.Q.landing[1]);
  const blockId=cellId(e.R.landing[0],e.R.landing[1]);
  assert.equal(e.Q.playedBy,attacker);
  assert.equal(e.R.playedBy,defender);

  const n=consumption(candidate6,e.R),tau=mod2(n);
  const afterPhi=phi(e.R),afterD=derivative(afterPhi),deltaTau=derivative(tau);
  assert.deepEqual(afterPhi,xorVec(beforePhi,tau));
  assert.deepEqual(afterD,xorVec(beforeD,deltaTau));

  const attackerBefore=residualLineMap(candidate6,attacker);
  const defenderBefore=residualLineMap(candidate6,defender);
  const attackerAfter=residualLineMap(e.R,attacker);
  const defenderAfter=residualLineMap(e.R,defender);

  const attackerTransported=transportResidualMap(attackerBefore,[setupId],[blockId]);
  const defenderTransported=transportResidualMap(defenderBefore,[blockId],[setupId]);
  assert.deepEqual(residualMapObject(attackerTransported),residualMapObject(attackerAfter));
  assert.deepEqual(residualMapObject(defenderTransported),residualMapObject(defenderAfter));

  return {
    setupColumn:e.setupColumn+1,
    forcedBlockColumn:e.forcedBlockColumn+1,
    newlyOwned:{
      attacker:cellName(setupId),
      defender:cellName(blockId),
    },
    consumption:n,
    tau,
    supportAfter:e.R.heights,
    phiAfter:afterPhi,
    derivativeAfter:afterD,
    residuals:{
      attacker:{
        fullLiveLines:attackerAfter.length,
        minimal:minimalAntichain(attackerAfter),
      },
      defender:{
        fullLiveLines:defenderAfter.length,
        minimal:minimalAntichain(defenderAfter),
      },
    },
  };
});

assert.deepEqual(fragments[0].consumption,fragments[1].consumption);
assert.deepEqual(fragments[0].tau,fragments[1].tau);
assert.deepEqual(fragments[0].supportAfter,fragments[1].supportAfter);
assert.deepEqual(fragments[0].phiAfter,fragments[1].phiAfter);
assert.deepEqual(fragments[0].derivativeAfter,fragments[1].derivativeAfter);
assert.deepEqual(fragments[0].consumption,[0,1,1,0,0,0,0]);
assert.deepEqual(fragments[0].tau,[0,1,1,0,0,0,0]);
assert.deepEqual(fragments[0].phiAfter,[1,1,1,1,1,1,0]);
assert.deepEqual(fragments[0].derivativeAfter,[0,0,0,0,0,1]);

function compareMin(a,b){
  const A=new Map(a.map(r=>[sig(r),r])),B=new Map(b.map(r=>[sig(r),r]));
  const common=[...A.keys()].filter(k=>B.has(k));
  const onlyA=[...A.entries()].filter(([k])=>!B.has(k)).map(([,r])=>r);
  const onlyB=[...B.entries()].filter(([k])=>!A.has(k)).map(([,r])=>r);
  return {common:common.length,onlyA,onlyB};
}
const attackerDiff=compareMin(fragments[0].residuals.attacker.minimal,fragments[1].residuals.attacker.minimal);
const defenderDiff=compareMin(fragments[0].residuals.defender.minimal,fragments[1].residuals.defender.minimal);

assert.equal(fragments[0].residuals.attacker.minimal.length,30);
assert.equal(fragments[1].residuals.attacker.minimal.length,30);
assert.equal(attackerDiff.common,27);
assert.equal(attackerDiff.onlyA.length,3);
assert.equal(attackerDiff.onlyB.length,3);
assert.equal(fragments[0].residuals.defender.minimal.length,29);
assert.equal(fragments[1].residuals.defender.minimal.length,29);
assert.equal(defenderDiff.common,26);
assert.equal(defenderDiff.onlyA.length,3);
assert.equal(defenderDiff.onlyB.length,3);

const bySetup=new Map(fragments.map(f=>[f.setupColumn,f]));
assert.equal(bySetup.get(2).residuals.attacker.fullLiveLines,33);
assert.equal(bySetup.get(2).residuals.defender.fullLiveLines,33);
assert.equal(bySetup.get(3).residuals.attacker.fullLiveLines,32);
assert.equal(bySetup.get(3).residuals.defender.fullLiveLines,32);

const c2e4='9,25'; // C2 (id 9), E4 (id 25)
assert(bySetup.get(2).residuals.attacker.minimal.some(r=>sig(r)===c2e4));
assert(!bySetup.get(3).residuals.attacker.minimal.some(r=>sig(r)===c2e4));

for(const f of fragments){
  f.residuals.attacker.minimal=f.residuals.attacker.minimal.map(named);
  f.residuals.defender.minimal=f.residuals.defender.minimal.map(named);
}
const namedDiff=(d)=>({
  common:d.common,
  onlyFirst:d.onlyA.map(named),
  onlySecond:d.onlyB.map(named),
});

const candidate2=apply(root,1),candidate3=apply(root,2);
assert.equal(forcedSingletonEdges(candidate2).length,0);
assert.equal(forcedSingletonEdges(candidate3).length,0);

console.log(JSON.stringify({
  schema:'connect4.rank_local_post_response_transport.v1',
  oracleUsed:false,
  prefix,
  candidate6:{
    supportBefore:candidate6.heights,
    phiBefore:beforePhi,
    derivativeBefore:beforeD,
    forcedFragments:fragments,
    attackerMinimalResidualComparison:namedDiff(attackerDiff),
    defenderMinimalResidualComparison:namedDiff(defenderDiff),
    exactObservation:'Both forced 2<->3 fragments have identical support/phase transport but different typed ownership and residual line families; transport/phase alone is not a sound proof-state merge key.',
  },
  candidate2And3Boundary:{
    candidate2ForcedSingletonFragments:0,
    candidate3ForcedSingletonFragments:0,
  },
  theoremBoundary:'Certified fragment transport exactly updates support, phase, and line-indexed residuals. It does not by itself prove a finite upper bound; regenerated unit-capacity obligations are still required before Hall deficiency may be invoked.',
},null,2));
