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
    assert.equal(Q.win,false,'input sequence contains prior terminal at ply '+(i+1));
    P=Q;
  }
  return P;
}
function withMover(P,mover){
  return {heights:P.heights.slice(),stones:[new Set(P.stones[0]),new Set(P.stones[1])],rank:P.rank,mover};
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
function singletonTargets(P,player){
  const opponent=1-player,seen=new Set(),out=[];
  for(const L of LINES){
    if(L.some(([x,y])=>P.stones[opponent].has(key(x,y))))continue;
    const missing=L.filter(([x,y])=>!P.stones[player].has(key(x,y)));
    if(missing.length!==1)continue;
    const [x,y]=missing[0],k=key(x,y);
    if(!seen.has(k)){seen.add(k);out.push([x,y]);}
  }
  return out;
}
function poisonedSupportColumns(P,attacker){
  const out=new Set();
  for(const [x,y] of singletonTargets(P,attacker)){
    if(y>0 && P.heights[x]===y-1)out.add(x);
  }
  return [...out].sort((a,b)=>a-b);
}
function stackedSingletons(P,attacker){
  const singles=new Set(singletonTargets(P,attacker).map(([x,y])=>key(x,y)));
  const out=[];
  for(const [x,y] of singletonTargets(P,attacker)){
    if(P.heights[x]===y && y+1<H && singles.has(key(x,y+1))){
      out.push({column:x,lower:[x,y],upper:[x,y+1]});
    }
  }
  return out;
}

function oneSetupBaseCertificates(P){
  const attacker=P.mover;
  const out=[];
  const immediate=winningFrontier(P,attacker);
  if(immediate.length){
    out.push({upper:1,kind:'IMMEDIATE_WIN',targets:immediate.map(c=>c+1)});
    return out;
  }
  for(const a of legal(P)){
    const Q=apply(P,a);
    if(Q.win)continue;
    if(winningFrontier(Q,Q.mover).length)continue;

    const targets=winningFrontier(Q,attacker);
    if(targets.length>=2){
      out.push({
        upper:3,kind:'ONE_SETUP_HALL_FORK',setupColumn:a+1,
        targetColumns:targets.map(c=>c+1)
      });
    }
    const stacked=stackedSingletons(Q,attacker);
    if(stacked.length){
      out.push({
        upper:3,kind:'ONE_SETUP_STACKED_SINGLETON',setupColumn:a+1,
        stacked:stacked.map(x=>({
          column:x.column+1,
          lower:[x.lower[0]+1,x.lower[1]+1],
          upper:[x.upper[0]+1,x.upper[1]+1]
        }))
      });
    }
  }
  return out;
}

function oneForcedSingletonLift(P){
  const base=oneSetupBaseCertificates(P);
  if(base.length)return base[0];

  const attacker=P.mover;
  for(const a of legal(P)){
    const Q=apply(P,a);
    if(Q.win)continue;
    if(winningFrontier(Q,Q.mover).length)continue;
    const targets=winningFrontier(Q,attacker);
    if(targets.length!==1)continue;

    const R=apply(Q,targets[0]);
    assert.equal(R.win,false);
    const child=oneSetupBaseCertificates(R);
    if(child.length){
      return {
        upper:child[0].upper+2,
        kind:'FORCED_SINGLETON_LIFT',
        setupColumn:a+1,
        forcedBlockColumn:targets[0]+1,
        child:child[0],
      };
    }
  }
  return null;
}

// Strict reusable precursor guard used by the 2026-09-14 intersection theorem:
// m and both future singleton endpoints are independently current-frontier events.
// This is intentionally narrower than arbitrary future support-release precursors.
function strictFrontierPrecursors(Q){
  const defender=Q.mover,attacker=1-defender;
  if(winningFrontier(Q,defender).length)return [];
  const out=[];

  for(const m of legal(Q)){
    const M=apply(withMover(Q,attacker),m);
    if(M.win)continue;
    if(winningFrontier(M,M.mover).length)continue;

    const targets=winningFrontier(M,attacker).filter(t=>
      t!==m && M.heights[t]===Q.heights[t]
    );
    for(let i=0;i<targets.length;i++)for(let j=i+1;j<targets.length;j++){
      const t1=targets[i],t2=targets[j];
      out.push({
        enabler:m+1,
        targets:[t1+1,t2+1],
        preemptionSet:[m,t1,t2].map(c=>c+1).sort((a,b)=>a-b),
      });
    }
  }
  return out;
}

function firstLayerAudit(P){
  const attacker=P.mover;
  const setups=[];
  for(const a of legal(P)){
    const Q=apply(P,a);
    if(Q.win){
      setups.push({setupColumn:a+1,terminal:true});
      continue;
    }
    const defenderImmediate=winningFrontier(Q,Q.mover).map(c=>c+1);
    const attackerImmediate=winningFrontier(Q,attacker).map(c=>c+1);
    const poison=poisonedSupportColumns(Q,attacker).map(c=>c+1);
    const stacked=stackedSingletons(Q,attacker).map(x=>({
      column:x.column+1,
      lower:[x.lower[0]+1,x.lower[1]+1],
      upper:[x.upper[0]+1,x.upper[1]+1],
    }));
    const precursors=strictFrontierPrecursors(Q);
    let precursorIntersection=null;
    if(precursors.length){
      let current=new Set(precursors[0].preemptionSet);
      for(const p of precursors.slice(1)){
        current=new Set([...current].filter(x=>p.preemptionSet.includes(x)));
      }
      precursorIntersection=[...current].sort((a,b)=>a-b);
    }
    setups.push({
      setupColumn:a+1,
      terminal:false,
      defenderImmediate,
      attackerImmediate,
      poisonedSupportColumns:poison,
      stackedSingletons:stacked,
      strictFrontierPrecursors:precursors,
      strictPrecursorIntersection:precursorIntersection,
      legalDefenderColumns:legal(Q).map(c=>c+1),
    });
  }
  return setups;
}

const prefix='444441566';
const lower=new Map([[2,3],[3,3],[6,5]]);
const children=[];

for(const candidate of [2,3,6]){
  const P=apply(position(prefix),candidate-1);
  assert.equal(P.win,false);

  const immediate=winningFrontier(P,P.mover).map(c=>c+1);
  assert.deepEqual(immediate,[]);

  const base=oneSetupBaseCertificates(P);
  assert.deepEqual(base,[],'local base grammar unexpectedly closes candidate '+candidate);

  const lift=oneForcedSingletonLift(P);
  assert.equal(lift,null,'one forced-singleton lift unexpectedly closes candidate '+candidate);

  const setups=firstLayerAudit(P);
  const emptyPrecursorIntersections=setups.filter(s=>
    Array.isArray(s.strictPrecursorIntersection) && s.strictPrecursorIntersection.length===0
  );
  assert.equal(emptyPrecursorIntersections.length,0,'strict precursor intersection unexpectedly closes candidate '+candidate);

  children.push({
    candidate,
    lowerFromBoundedResponseHorizon:lower.get(candidate),
    upperFromAuditedLocalGrammar:null,
    interval:[lower.get(candidate),null],
    firstLayerSetups:setups,
  });
}

const c6=children.find(x=>x.candidate===6);
const s2=c6.firstLayerSetups.find(x=>x.setupColumn===2);
const s3=c6.firstLayerSetups.find(x=>x.setupColumn===3);
assert.deepEqual(s2.defenderImmediate,[]);
assert.deepEqual(s3.defenderImmediate,[]);
assert.deepEqual(s2.attackerImmediate,[3]);
assert.deepEqual(s3.attackerImmediate,[2]);

for(const candidate of [2,3]){
  const c=children.find(x=>x.candidate===candidate);
  assert(c.firstLayerSetups.every(s=>s.poisonedSupportColumns.length===0));
  assert(c.firstLayerSetups.every(s=>s.strictFrontierPrecursors.length===0));
}

const result={
  schema:'connect4.rank_local_upper_bound_grammar_reuse_audit.v1',
  oracleUsed:false,
  reusedAuthorities:[
    'docs/research/2026-09-13-poisoned-support-progress-calculus.md',
    'docs/research/2026-09-14-fork-precursor-capacity-theorem.md',
    'docs/research/2026-09-14-fork-precursor-intersection-and-merge.md',
    'docs/research/2026-09-13-temporal-response-capacity-calculus.md',
    'docs/research/2026-09-13-response-matroid-defect-transfer.md',
    'docs/research/2026-09-14-response-capacity-hall-closure.md',
  ],
  prefix,
  children,
  exactObservation:{
    candidate6ForcedSplit:{
      setup2ForcesBlock3:true,
      setup3ForcesBlock2:true,
      terminalClaim:false,
      interpretation:'Attacker can choose the orientation of a forced ownership split across columns 2 and 3; no finite upper bound follows from this fact alone.'
    },
    candidate2And3:{
      poisonedSupportAtFirstSetupLayer:false,
      strictFrontierPrecursorAtFirstSetupLayer:false,
    }
  },
  conclusion:'Current composed local upper-bound grammar yields no finite upper bound for candidates 2, 3, or 6. The next seam is post-response transport/support-release consequence closure, not another scalar score.'
};

console.log(JSON.stringify(result,null,2));
