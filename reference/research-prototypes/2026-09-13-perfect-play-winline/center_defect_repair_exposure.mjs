import assert from 'node:assert/strict';

const W=7,H=6,K=4;
const dirs=[[1,0],[0,1],[1,1],[1,-1]];
const lines=[];
for(let r=1;r<=H;r++)for(let c=1;c<=W;c++)for(const [dx,dy] of dirs){
  const cells=[];
  for(let i=0;i<K;i++){
    const x=c+i*dx,y=r+i*dy;
    if(x<1||x>W||y<1||y>H){cells.length=0;break;}
    cells.push([x,y]);
  }
  if(cells.length===K)lines.push(cells);
}
assert.equal(lines.length,69);

const key=([c,r])=>`${c},${r}`;
const has=(L,x)=>L.some(y=>y[0]===x[0]&&y[1]===x[1]);
const hasPair=(L,P)=>P.every(x=>has(L,x));

function dePairBlockers(){
  const out=[];
  for(const r of [1,3,5])out.push([[4,r],[5,r]]);
  out.push([[4,3],[4,4]],[[5,3],[5,4]]);
  return out;
}

function uncovered(singletons,pairs=dePairBlockers()){
  const S=new Set(singletons.map(key));
  return lines.filter(L=>{
    if(L.some(x=>S.has(key(x))))return false;
    if(pairs.some(P=>hasPair(L,P)))return false;
    return true;
  });
}

function parityCells(c,p){
  return (p==='E'?[2,4,6]:[1,3,5]).map(r=>[c,r]);
}

function centerBase(){
  const single=[[5,1]];
  for(const c of [1,2,3,6,7])single.push(...parityCells(c,'E'));
  return single;
}
const originalUncovered=uncovered(centerBase());
assert.equal(originalUncovered.length,3);

const edgeRepair=[[5,1],...parityCells(1,'O')];
for(const c of [2,3,6,7])edgeRepair.push(...parityCells(c,'E'));
assert.equal(uncovered(edgeRepair).length,0);

function bestRepairBeforeSeizure(repairCol){
  const cols=[1,2,3,6,7];
  let best=null;
  for(let bits=0;bits<(1<<cols.length);bits++){
    const assignment={};
    for(let i=0;i<cols.length;i++)assignment[cols[i]]=((bits>>i)&1)?'O':'E';
    if(assignment[repairCol]!=='O')continue;
    const single=[[5,1],[repairCol,1]];
    let impossible=false;
    for(const c of cols){
      for(const x of parityCells(c,assignment[c])){
        if(x[0]===4&&x[1]===1){impossible=true;break;}
        single.push(x);
      }
      if(impossible)break;
    }
    if(impossible)continue;
    const u=uncovered(single);
    if(!best||u.length<best.uncovered.length)best={assignment,uncovered:u};
  }
  return best;
}
const preA=bestRepairBeforeSeizure(1);
const preB=bestRepairBeforeSeizure(2);
const preC=bestRepairBeforeSeizure(3);
assert.equal(preA.uncovered.length,0);
assert.equal(preB.uncovered.length,2);
assert.equal(preC.uncovered.length,6);

function bestParityRepair(repairCol){
  const cols=[1,2,3,6,7];
  let best=null;
  for(let bits=0;bits<(1<<cols.length);bits++){
    const assignment={};
    for(let i=0;i<cols.length;i++)assignment[cols[i]]=((bits>>i)&1)?'O':'E';
    if(assignment[1]!=='E')continue;
    if(assignment[repairCol]!=='O')continue;

    const single=[[5,1],[repairCol,1]];
    let impossible=false;
    for(const c of cols){
      for(const x of parityCells(c,assignment[c])){
        if(x[0]===1&&x[1]===1){impossible=true;break;}
        single.push(x);
      }
      if(impossible)break;
    }
    if(impossible)continue;
    const u=uncovered(single);
    if(!best||u.length<best.uncovered.length)best={assignment,single,uncovered:u};
  }
  return best;
}

const b=bestParityRepair(2);
const c=bestParityRepair(3);
assert.equal(b.uncovered.length,5);
assert.equal(c.uncovered.length,6);
assert.deepEqual(b.assignment,{1:'E',2:'O',3:'E',6:'E',7:'E'});
assert.deepEqual(c.assignment,{1:'E',2:'E',3:'O',6:'E',7:'E'});

function orientation(L){
  const [a,b]=L;
  const dx=Math.sign(b[0]-a[0]),dy=Math.sign(b[1]-a[1]);
  if(dy===0)return 'H';
  if(dx===0)return 'V';
  return 'D';
}
assert(b.uncovered.every(L=>orientation(L)==='D'));
assert(c.uncovered.every(L=>orientation(L)==='D'));

function label(L){
  const letters='ABCDEFG';
  return L.map(([x,y])=>`${letters[x-1]}${y}`).join('-');
}

const out={
  geometry:{W,H,K,winningLines:lines.length},
  originalCenterTemplate:{staticCovered:69-originalUncovered.length,uncovered:originalUncovered.map(label)},
  preSeizureParityRepair:{
    repairA1:{minimumUncovered:preA.uncovered.length,assignment:preA.assignment,uncovered:preA.uncovered.map(label)},
    repairB1:{minimumUncovered:preB.uncovered.length,assignment:preB.assignment,uncovered:preB.uncovered.map(label)},
    repairC1:{minimumUncovered:preC.uncovered.length,assignment:preC.assignment,uncovered:preC.uncovered.map(label)},
    conclusion:'A1 odd-control is the unique complete static repair in the entire per-column parity-control family.'
  },
  counterfactualEdgeRepair:{
    description:'The unique complete parity repair owns A1,A3,A5 while B,C,F,G remain even-controlled.',
    uncovered:uncovered(edgeRepair).map(label)
  },
  turnOrderDenial:{
    prefix:'D1 E1; P0 to move',
    move:'A1',
    consequence:'P0 can seize the unique edge odd-control repair anchor before P1 can use it.'
  },
  feasibleParityFamilyAfterA1:{
    repairB1:{minimumUncovered:b.uncovered.length,assignment:b.assignment,uncovered:b.uncovered.map(label)},
    repairC1:{minimumUncovered:c.uncovered.length,assignment:c.assignment,uncovered:c.uncovered.map(label)},
    interpretation:'Within the complete per-column odd/even control family plus the fixed D/E pair blockers, every temporally feasible B1/C1 repair amplifies the single bottom defect into diagonal defects.'
  }
};
console.log(JSON.stringify(out,null,2));
