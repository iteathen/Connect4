#!/usr/bin/env node
import assert from 'node:assert/strict';

const W=7,H=6,K=4;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const key=(x,y)=>x+','+y;

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
    assert.equal(Q.win,false,'input prefix contains earlier terminal at ply '+(i+1));
    P=Q;
  }
  return P;
}
function stateKey(P){
  const enc=S=>[...S].sort().join(';');
  return [P.rank,P.mover,P.heights.join(','),enc(P.stones[0]),enc(P.stones[1])].join('|');
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

function baseCertificate(P){
  const attacker=P.mover;
  const immediate=winningFrontier(P,attacker);
  if(immediate.length){
    return {upper:1,kind:'IMMEDIATE_WIN',targetColumns:immediate.map(c=>c+1)};
  }
  const forks=[];
  for(const a of legal(P)){
    const Q=apply(P,a);
    if(Q.win)continue;
    if(winningFrontier(Q,Q.mover).length)continue;
    const targets=winningFrontier(Q,attacker);
    if(targets.length>=2){
      forks.push({setupColumn:a+1,targetColumns:targets.map(c=>c+1)});
    }
  }
  if(forks.length){
    return {upper:3,kind:'ONE_SETUP_HALL_FORK',certificates:forks};
  }
  return null;
}

function forcedSingletonEdges(P){
  const attacker=P.mover,out=[];
  for(const a of legal(P)){
    const Q=apply(P,a);
    if(Q.win)continue;
    const defenderImmediate=winningFrontier(Q,Q.mover);
    if(defenderImmediate.length)continue;
    const targets=winningFrontier(Q,attacker);
    if(targets.length!==1)continue;
    const t=targets[0];
    const R=apply(Q,t);
    if(R.win)continue; // the forced block itself must be nonterminal
    out.push({
      setupColumn:a+1,
      forcedBlockColumn:t+1,
      successor:R,
    });
  }
  return out;
}

function closeGrammar(root){
  const nodes=new Map();
  const queue=[{P:root,depth:0}];
  nodes.set(stateKey(root),{P:root,depth:0,edges:null,base:null,upper:null});

  while(queue.length){
    const {P}=queue.shift();
    const k=stateKey(P),rec=nodes.get(k);
    rec.base=baseCertificate(P);
    rec.edges=[];
    if(rec.base)continue;
    for(const e of forcedSingletonEdges(P)){
      const sk=stateKey(e.successor);
      rec.edges.push({setupColumn:e.setupColumn,forcedBlockColumn:e.forcedBlockColumn,successorKey:sk});
      if(!nodes.has(sk)){
        nodes.set(sk,{P:e.successor,depth:rec.depth+1,edges:null,base:null,upper:null});
        queue.push({P:e.successor,depth:rec.depth+1});
      }else{
        nodes.get(sk).depth=Math.min(nodes.get(sk).depth,rec.depth+1);
      }
    }
  }

  const ordered=[...nodes.entries()].sort((a,b)=>b[1].P.rank-a[1].P.rank);
  for(const [k,rec] of ordered){
    let best=rec.base?.upper??null;
    for(const e of rec.edges??[]){
      const child=nodes.get(e.successorKey);
      if(child.upper!==null){
        const lifted=child.upper+2;
        if(best===null||lifted<best)best=lifted;
      }
    }
    rec.upper=best;
  }

  const rootRec=nodes.get(stateKey(root));
  const leaves=[...nodes.values()].filter(r=>!r.base && (r.edges??[]).length===0);
  return {
    finiteUpper:rootRec.upper,
    reachableStates:nodes.size,
    liftEdges:[...nodes.values()].reduce((n,r)=>n+(r.edges??[]).length,0),
    maxLiftDepth:Math.max(...[...nodes.values()].map(r=>r.depth)),
    baseStates:[...nodes.values()].filter(r=>r.base).length,
    unprovedLeaves:leaves.length,
    rootEdges:(rootRec.edges??[]).map(e=>({
      setupColumn:e.setupColumn,
      forcedBlockColumn:e.forcedBlockColumn,
      successor:{
        rank:nodes.get(e.successorKey).P.rank,
        heights:nodes.get(e.successorKey).P.heights,
        baseCertificate:nodes.get(e.successorKey).base,
        furtherLiftEdges:(nodes.get(e.successorKey).edges??[]).length,
        finiteUpper:nodes.get(e.successorKey).upper,
      }
    })),
  };
}

const prefix='444441566';
const root=position(prefix);
assert.equal(root.mover,1,'expected P2 to move at rank 9');

const lower=new Map([[2,3],[3,3],[6,5]]);
const children=[];
for(const candidate of [2,3,6]){
  const P=apply(root,candidate-1);
  assert.equal(P.win,false);
  const closure=closeGrammar(P);
  assert.equal(closure.finiteUpper,null,'current grammar unexpectedly closed candidate '+candidate);
  children.push({
    candidate,
    lowerFromBoundedResponseHorizon:lower.get(candidate),
    upperFromCompleteCurrentGrammar:null,
    interval:[lower.get(candidate),null],
    closure,
  });
}

assert.deepEqual(
  children.map(x=>({
    candidate:x.candidate,
    reachableStates:x.closure.reachableStates,
    liftEdges:x.closure.liftEdges,
    maxLiftDepth:x.closure.maxLiftDepth,
    baseStates:x.closure.baseStates,
    unprovedLeaves:x.closure.unprovedLeaves,
  })),
  [
    {candidate:2,reachableStates:1,liftEdges:0,maxLiftDepth:0,baseStates:0,unprovedLeaves:1},
    {candidate:3,reachableStates:1,liftEdges:0,maxLiftDepth:0,baseStates:0,unprovedLeaves:1},
    {candidate:6,reachableStates:3,liftEdges:2,maxLiftDepth:1,baseStates:0,unprovedLeaves:2},
  ]
);
assert.deepEqual(
  children[2].closure.rootEdges.map(e=>[e.setupColumn,e.forcedBlockColumn]).sort(),
  [[2,3],[3,2]]
);

console.log(JSON.stringify({
  schema:'connect4.forced_singleton_upper_grammar_closure_boundary.v1',
  oracleUsed:false,
  prefix,
  grammar:[
    'immediate winning frontier -> upper 1',
    'one-setup Hall fork -> upper 3',
    'forced-singleton lift -> child upper + 2',
  ],
  closureMethod:'enumerate only qualified forced-singleton lift edges; solve the resulting finite DAG by descending occupied rank',
  children,
  conclusion:'The entire current upper-bound grammar leaves candidates 2, 3, and 6 without finite upper certificates. Intervals remain [3,+infinity], [3,+infinity], [5,+infinity]; no interval separation and no v5 license.',
},null,2));
