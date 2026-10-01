#!/usr/bin/env node
import assert from 'node:assert/strict';

// ORACLE-INFORMED candidate v3.
// Structural policy for standard 7x6 Connect Four.
// Repair provenance:
// - v0 ply-11 mismatch: deadline/race must precede local Pareto impact.
// - v1 fresh ply-8 mismatch plus rejected v2 regression: when temporally behind,
//   compare opponent deadline requirements against available blocking capacity.
// No oracle value is consumed at runtime.

const W=7,H=6,K=4;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const key=(x,y)=>x+','+y;

function lines(){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){
    const cells=Array.from({length:K},(_,i)=>[x+i*dx,y+i*dy]);
    if(cells.every(([cx,cy])=>cx>=0&&cx<W&&cy>=0&&cy<H))out.push(cells);
  }
  return out;
}
const LINES=lines();
assert.equal(LINES.length,69);

function position(sequence=''){
  const heights=Array(W).fill(0),stones=[new Set(),new Set()];
  for(let ply=0;ply<sequence.length;ply++){
    const c=Number(sequence[ply])-1;
    assert(Number.isInteger(c)&&c>=0&&c<W&&heights[c]<H);
    stones[ply&1].add(key(c,heights[c]++));
  }
  return {heights,stones,rank:sequence.length,mover:sequence.length&1};
}
function legal(P){return Array.from({length:W},(_,c)=>c).filter(c=>P.heights[c]<H);}
function ownsLine(S,L){return L.every(([x,y])=>S.has(key(x,y)));}
function apply(P,c){
  assert(P.heights[c]<H);
  const heights=P.heights.slice(),stones=[new Set(P.stones[0]),new Set(P.stones[1])];
  const y=heights[c]++;
  stones[P.mover].add(key(c,y));
  return {
    heights,stones,rank:P.rank+1,mover:1-P.mover,
    landing:[c,y],playedBy:P.mover,
    win:LINES.some(L=>ownsLine(stones[P.mover],L)),
  };
}

function derivative(heights){
  const phi=heights.map(h=>h&1);
  return Array.from({length:W-1},(_,i)=>phi[i]^phi[i+1]);
}
function safeDerivative(d){
  for(let i=0;i+2<d.length;i++)if(d[i]===d[i+1]&&d[i+1]===d[i+2])return false;
  return true;
}

// Move-6 refinement generalized: raw opportunity counts are admissible only
// after support/phase closure. Early same-column center moves can be repaired
// because a further landing remains; the top-center sixth event cannot.
function phaseClosure(P,c){
  const child=apply(P,c),d=derivative(child.heights);
  if(safeDerivative(d))return {class:'SAFE',viable:true,derivative:d.join(''),repair:null};
  if(child.heights[c]<H){
    const h=child.heights.slice(); h[c]++;
    const d2=derivative(h);
    if(safeDerivative(d2))return {class:'REPAIRABLE',viable:true,derivative:d.join(''),repair:d2.join('')};
  }
  return {class:'TRAPPED',viable:false,derivative:d.join(''),repair:null};
}

function impact(P,c){
  const mover=P.mover,landing=key(c,P.heights[c]);
  let A=0,B=0;
  for(const L of LINES){
    if(!L.some(([x,y])=>key(x,y)===landing))continue;
    if(!L.some(([x,y])=>P.stones[1-mover].has(key(x,y))))A++;
    if(!L.some(([x,y])=>P.stones[mover].has(key(x,y))))B++;
  }
  return {A,B};
}
function dominates(a,b){
  return a.A>=b.A&&a.B>=b.B&&(a.A>b.A||a.B>b.B);
}

function earliestResidualSlots(P,player){
  const remaining=W*H-P.rank,first=player===P.mover?1:2,out=[];
  for(const L of LINES){
    if(L.some(([x,y])=>P.stones[1-player].has(key(x,y))))continue;
    const missing=L.filter(([x,y])=>!P.stones[player].has(key(x,y)));
    if(missing.length===0){out.push(0);continue;}
    const needs=missing.map(([x,y])=>y-P.heights[x]+1).sort((a,b)=>a-b);
    if(needs.some(n=>n<=0))continue;
    let slot=first,ok=true;
    for(const need of needs){
      while(slot<need)slot+=2;
      if(slot>remaining){ok=false;break;}
      slot+=2;
    }
    if(ok)out.push(slot-2);
  }
  return out.sort((a,b)=>a-b);
}
function race(P,c){
  const child=apply(P,c),p=P.mover,INF=1e9;
  const own=earliestResidualSlots(child,p),opp=earliestResidualSlots(child,1-p);
  const ownEarliest=own.length?own[0]:INF,oppEarliest=opp.length?opp[0]:INF;
  return {ownEarliest,oppEarliest,margin:oppEarliest-ownEarliest};
}

function deadlineResiduals(P,player){
  const remaining=W*H-P.rank,first=player===P.mover?1:2;
  const seen=new Set(),out=[];
  for(const L of LINES){
    if(L.some(([x,y])=>P.stones[1-player].has(key(x,y))))continue;
    const missing=L.filter(([x,y])=>!P.stones[player].has(key(x,y)));
    if(!missing.length)continue;
    const ids=missing.map(([x,y])=>y*W+x).sort((a,b)=>a-b);
    const sig=ids.join(',');
    if(seen.has(sig))continue;
    seen.add(sig);
    const needs=missing.map(([x,y])=>y-P.heights[x]+1).sort((a,b)=>a-b);
    if(needs.some(n=>n<=0))continue;
    let slot=first,ok=true;
    for(const need of needs){
      while(slot<need)slot+=2;
      if(slot>remaining){ok=false;break;}
      slot+=2;
    }
    if(ok)out.push({deadline:slot-2,cells:ids});
  }
  return out;
}

// Exact static transversal size for a deadline-bounded residual family.
// Connect-4 requirements have <=4 cells, so branching on the smallest
// remaining requirement is practical for this research harness.
function minHittingSize(families){
  if(!families.length)return 0;
  let best=1e9;
  const uniq=[...new Map(families.map(cells=>[cells.join(','),cells])).values()];
  function rec(rest,used){
    if(used>=best)return;
    if(!rest.length){best=used;return;}
    let pivot=rest[0];
    for(const f of rest)if(f.length<pivot.length)pivot=f;
    for(const cell of pivot){
      const next=rest.filter(f=>!f.includes(cell));
      rec(next,used+1);
    }
  }
  rec(uniq,0);
  return best;
}

function responseOverload(P,c){
  const child=apply(P,c),opp=1-P.mover;
  const reqs=deadlineResiduals(child,opp);
  const deadlines=[...new Set(reqs.map(r=>r.deadline))].sort((a,b)=>a-b);
  const profile=[];
  for(const t of deadlines){
    const families=reqs.filter(r=>r.deadline<=t).map(r=>r.cells);
    const tau=minHittingSize(families);
    const capacity=Math.floor(t/2); // original mover's response slots 2,4,...,t-1
    const deficit=Math.max(0,tau-capacity);
    profile.push({deadline:t,tau,capacity,deficit});
    if(deficit>0)return {firstOverload:t,firstDeficit:deficit,profile};
  }
  return {firstOverload:1e9,firstDeficit:0,profile};
}

function reflectionSymmetric(P){
  for(let p=0;p<2;p++)for(const s of P.stones[p]){
    const [x,y]=s.split(',').map(Number);
    if(!P.stones[p].has(key(W-1-x,y)))return false;
  }
  return true;
}
function oneReflectionOrbit(P,cols){
  if(cols.length<=1)return true;
  if(!reflectionSymmetric(P))return false;
  const orbit=new Set([cols[0],W-1-cols[0]]);
  return cols.every(c=>orbit.has(c));
}

function select(P){
  const rows=legal(P).map(c=>{
    const child=apply(P,c);
    return {column:c,immediateWin:child.win,...phaseClosure(P,c),...impact(P,c),race:race(P,c)};
  });
  const immediate=rows.filter(r=>r.immediateWin);
  if(immediate.length)return {rows,selected:immediate,reason:'IMMEDIATE_WIN'};

  // Structural closure remains the first admissibility gate.
  const viable=rows.filter(r=>r.viable);
  let pool=viable.length?viable:rows;

  // v1 repair: temporal feasibility/race outranks local opportunity incidence.
  // Maximize opponent-earliest minus mover-earliest, then minimize mover-earliest.
  const bestMargin=Math.max(...pool.map(r=>r.race.margin));
  pool=pool.filter(r=>r.race.margin===bestMargin);
  const bestOwn=Math.min(...pool.map(r=>r.race.ownEarliest));
  pool=pool.filter(r=>r.race.ownEarliest===bestOwn);

  // When every surviving candidate is temporally behind, compare the opponent's
  // deadline requirements against our finite response capacity. Prefer a later
  // first overload; if equal, prefer the smaller overload deficit.
  if(pool.length>1 && bestMargin<0){
    pool=pool.map(r=>({...r,response:responseOverload(P,r.column)}));
    const latest=Math.max(...pool.map(r=>r.response.firstOverload));
    pool=pool.filter(r=>r.response.firstOverload===latest);
    if(pool.length>1 && latest<1e9){
      const deficit=Math.min(...pool.map(r=>r.response.firstDeficit));
      pool=pool.filter(r=>r.response.firstDeficit===deficit);
    }
  }

  // Only after temporal/response closure compare local mover progress / opponent denial.
  const selected=pool.filter(r=>!pool.some(q=>q.column!==r.column&&dominates(q,r)));
  return {rows,selected,reason:'CLOSE_THEN_DEADLINE_RESPONSE_THEN_PARETO'};
}

function run(maxPlies=42){
  let sequence='',disposition='BOARD_FULL';
  const trace=[];
  for(let ply=1;ply<=maxPlies;ply++){
    const P=position(sequence);
    if(!legal(P).length)break;
    const result=select(P),cols=result.selected.map(r=>r.column);
    const symmetric=oneReflectionOrbit(P,cols);
    trace.push({
      ply,sequenceBefore:sequence,mover:P.mover+1,
      selected:cols.map(c=>c+1),symmetryEquivalent:symmetric,reason:result.reason,
      candidates:result.rows.map(r=>({
        move:r.column+1,phase:r.class,derivative:r.derivative,repair:r.repair,
        A:r.A,B:r.B,immediateWin:r.immediateWin,
        race:r.race??null,
      })),
    });
    if(!cols.length){disposition='NO_SELECTION';break;}
    // Multiple certified moves are allowed. Continue with the numerically smallest
    // deterministic representative so later positions can be tested without oracle tie-breaking.
    const c=Math.min(...cols);
    const child=apply(P,c);
    sequence+=String(c+1);
    if(child.win){disposition='PLAYER_'+(child.playedBy+1)+'_WIN';break;}
  }
  return {
    schema:'connect4.universal_structural_policy.oracle_informed.v3',
    formula:'structural closure -> deadline race -> deadline-response overload -> Pareto(A,B)',
    sequence,disposition,trace
  };
}

console.log(JSON.stringify(run(),null,2));
