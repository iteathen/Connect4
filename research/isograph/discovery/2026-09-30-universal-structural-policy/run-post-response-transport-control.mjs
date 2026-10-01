#!/usr/bin/env node
import assert from 'node:assert/strict';

const W=7,H=6,K=4;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const key=(x,y)=>x+','+y;
const id=(x,y)=>y*W+x;
const cellFromId=i=>({column:(i%W)+1,row:Math.floor(i/W)+1});

function generatedLines(){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){
    const cells=Array.from({length:K},(_,i)=>[x+i*dx,y+i*dy]);
    if(cells.every(([cx,cy])=>cx>=0&&cx<W&&cy>=0&&cy<H))out.push(cells);
  }
  return out;
}
const LINES=generatedLines();
assert.equal(LINES.length,69);

function ownsLine(S,L){return L.every(([x,y])=>S.has(key(x,y)));}

function emptyPosition(){
  return {heights:Array(W).fill(0),stones:[new Set(),new Set()],rank:0,mover:0};
}
function legal(P){return Array.from({length:W},(_,c)=>c).filter(c=>P.heights[c]<H);}
function apply(P,c){
  assert(P.heights[c]<H);
  const heights=P.heights.slice(),stones=[new Set(P.stones[0]),new Set(P.stones[1])];
  const playedBy=P.mover,y=heights[c]++;
  stones[playedBy].add(key(c,y));
  const win=LINES.some(L=>ownsLine(stones[playedBy],L));
  return {heights,stones,rank:P.rank+1,mover:1-playedBy,landing:[c,y],playedBy,win};
}
function position(sequence=''){
  let P=emptyPosition();
  for(let i=0;i<sequence.length;i++){
    const c=Number(sequence[i])-1;
    assert(Number.isInteger(c)&&c>=0&&c<W&&P.heights[c]<H);
    const Q=apply(P,c);
    assert.equal(Q.win,false,'input prefix contains terminal at ply '+(i+1));
    P=Q;
  }
  return P;
}
function winningFrontier(P,player){
  const out=[];
  for(const c of legal(P)){
    const S=new Set(P.stones[player]);
    S.add(key(c,P.heights[c]));
    if(LINES.some(L=>ownsLine(S,L)))out.push(c);
  }
  return out;
}
function normalizeResiduals(xs){
  const uniq=[];
  const seen=new Set();
  for(const cells of xs){
    const a=[...cells].sort((a,b)=>a-b);
    const sig=a.join(',');
    if(!seen.has(sig)){seen.add(sig);uniq.push(a);}
  }
  return uniq.filter((a,i)=>!uniq.some((b,j)=>i!==j&&b.length<a.length&&b.every(x=>a.includes(x))));
}
function liveMinimalResiduals(P,player){
  const opp=1-player,out=[];
  for(const L of LINES){
    if(L.some(([x,y])=>P.stones[opp].has(key(x,y))))continue;
    const missing=L.filter(([x,y])=>!P.stones[player].has(key(x,y))).map(([x,y])=>id(x,y));
    if(missing.length)out.push(missing);
  }
  return normalizeResiduals(out);
}
function earliestOptimisticCompletion(P,player,residual){
  const remaining=W*H-P.rank;
  const first=player===P.mover?1:2;
  const needs=residual.map(i=>{
    const x=i%W,y=Math.floor(i/W);
    return y-P.heights[x]+1;
  }).sort((a,b)=>a-b);
  if(needs.some(n=>n<=0))return null;
  let slot=first;
  for(const need of needs){
    while(slot<need)slot+=2;
    if(slot>remaining)return null;
    slot+=2;
  }
  return slot-2;
}
function residualSummary(P,player){
  const rs=liveMinimalResiduals(P,player);
  const deadlineRows=rs.map(cells=>({
    cells,
    size:cells.length,
    earliestOptimisticCompletion:earliestOptimisticCompletion(P,player,cells),
  })).sort((a,b)=>{
    const aa=a.earliestOptimisticCompletion??1e9,bb=b.earliestOptimisticCompletion??1e9;
    return aa-bb||a.size-b.size||a.cells.join(',').localeCompare(b.cells.join(','));
  });
  const bySize={};
  for(const r of deadlineRows)bySize[r.size]=(bySize[r.size]??0)+1;
  const singletonTargets=deadlineRows.filter(r=>r.size===1).map(r=>{
    const i=r.cells[0],x=i%W,y=Math.floor(i/W);
    return {
      target:cellFromId(i),
      supportDistance:y-P.heights[x],
      currentlyPlayable:P.heights[x]===y,
      earliestOptimisticCompletion:r.earliestOptimisticCompletion,
    };
  });
  return {
    count:rs.length,
    bySize,
    earliest:deadlineRows.length?deadlineRows[0].earliestOptimisticCompletion:null,
    firstEight:deadlineRows.slice(0,8).map(r=>({
      size:r.size,
      earliestOptimisticCompletion:r.earliestOptimisticCompletion,
      cells:r.cells.map(cellFromId),
    })),
    singletonTargets,
    signatures:rs.map(r=>r.join(',')),
  };
}
function phase(P){
  const phi=P.heights.map(h=>h&1);
  const derivative=Array.from({length:W-1},(_,i)=>phi[i]^phi[i+1]);
  return {phi,derivative};
}
function oneSetupForks(P){
  const attacker=P.mover,out=[];
  for(const a of legal(P)){
    const Q=apply(P,a);
    if(Q.win)continue;
    if(winningFrontier(Q,Q.mover).length)continue;
    const targets=winningFrontier(Q,attacker);
    if(targets.length>=2)out.push({setupColumn:a+1,targetColumns:targets.map(c=>c+1)});
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
    const R=apply(Q,targets[0]);
    if(R.win)continue;
    out.push({
      setupColumn:a+1,
      forcedBlockColumn:targets[0]+1,
      successorHeights:R.heights,
    });
  }
  return out;
}
function signature(P,absoluteAttacker){
  const attacker=absoluteAttacker,defender=1-attacker;
  return {
    rank:P.rank,
    sideToMove:P.mover+1,
    heights:P.heights,
    legalColumns:legal(P).map(c=>c+1),
    phase:phase(P),
    winningFrontier:{
      attacker:winningFrontier(P,attacker).map(c=>c+1),
      defender:winningFrontier(P,defender).map(c=>c+1),
    },
    attackerResiduals:residualSummary(P,attacker),
    defenderResiduals:residualSummary(P,defender),
    currentUpperGrammar:{
      oneSetupForks:oneSetupForks(P),
      forcedSingletonEdges:forcedSingletonEdges(P),
    },
  };
}

const prefix='444441566';
const rank9=position(prefix);
assert.equal(rank9.mover,1);

const directChildren={};
for(const candidate of [2,3,6]){
  const child=apply(rank9,candidate-1);
  assert.equal(child.win,false);
  const attacker=child.mover;
  directChildren[candidate]=signature(child,attacker);
}

const c6=apply(rank9,5);
const attacker=c6.mover;
assert.equal(attacker,0,'after candidate 6 P1 must be attacker');

function forcedSplit(setup,block){
  const Q=apply(c6,setup-1);
  assert.equal(Q.win,false);
  assert.deepEqual(winningFrontier(Q,Q.mover),[]);
  assert.deepEqual(winningFrontier(Q,attacker),[block-1]);
  const R=apply(Q,block-1);
  assert.equal(R.win,false);
  return R;
}
const split23=forcedSplit(2,3);
const split32=forcedSplit(3,2);
assert.deepEqual(split23.heights,split32.heights);
assert.deepEqual(split23.heights,[1,1,1,5,1,3,0]);

function consumedVector(before,after){
  return before.heights.map((h,c)=>after.heights[c]-h);
}
function transport(before,after){
  const n=consumedVector(before,after);
  const tau=n.map(v=>v&1);
  return {
    consumedPerColumn:n,
    totalConsumed:n.reduce((a,b)=>a+b,0),
    tau,
    phaseBefore:phase(before),
    phaseAfter:phase(after),
  };
}

const s23=signature(split23,attacker);
const s32=signature(split32,attacker);
const commonAttackerResiduals=s23.attackerResiduals.signatures.filter(x=>s32.attackerResiduals.signatures.includes(x));
const only23=s23.attackerResiduals.signatures.filter(x=>!s32.attackerResiduals.signatures.includes(x));
const only32=s32.attackerResiduals.signatures.filter(x=>!s23.attackerResiduals.signatures.includes(x));

const result={
  schema:'connect4.post_response_transport_control.v1',
  oracleUsed:false,
  prefix,
  directChildren,
  candidate6ForcedSplit:{
    before:signature(c6,attacker),
    orientations:[
      {
        setupColumn:2,
        forcedBlockColumn:3,
        ownership:{attacker:[{column:2,row:1}],defender:[{column:3,row:1}]},
        transport:transport(c6,split23),
        after:s23,
      },
      {
        setupColumn:3,
        forcedBlockColumn:2,
        ownership:{attacker:[{column:3,row:1}],defender:[{column:2,row:1}]},
        transport:transport(c6,split32),
        after:s32,
      },
    ],
    branchComparison:{
      identicalSupportFrontier:JSON.stringify(split23.heights)===JSON.stringify(split32.heights),
      identicalPhase:JSON.stringify(phase(split23))===JSON.stringify(phase(split32)),
      commonAttackerMinimalResidualCount:commonAttackerResiduals.length,
      orientation23OnlyAttackerResidualCount:only23.length,
      orientation32OnlyAttackerResidualCount:only32.length,
      commonAttackerMinimalResiduals:commonAttackerResiduals,
      orientation23OnlyAttackerResiduals:only23,
      orientation32OnlyAttackerResiduals:only32,
    },
  },
  theoremBoundary:[
    'The forced 2<->3 exchange has exact consumption vector n=(0,1,1,0,0,0,0), total rank 2, and the same support/phase transport in both ownership orientations.',
    'Ownership-sensitive residual regeneration is not determined by support transport alone; both orientations must retain their exact ownership split.',
    'No oracle, solved value, or terminal distance is consumed.'
  ],
};

console.log(JSON.stringify(result,null,2));
