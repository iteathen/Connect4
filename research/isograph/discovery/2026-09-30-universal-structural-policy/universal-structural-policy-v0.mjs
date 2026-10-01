#!/usr/bin/env node
import assert from 'node:assert/strict';

// PRE-ORACLE FROZEN candidate.
// Outcome-blind structural policy for standard 7x6 Connect Four.
// No solved W/D/L, best-move table, opening book, minimax/negamax, or
// terminal-distance oracle is used by this file.

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
    return {column:c,immediateWin:child.win,...phaseClosure(P,c),...impact(P,c)};
  });
  const immediate=rows.filter(r=>r.immediateWin);
  if(immediate.length)return {rows,selected:immediate,reason:'IMMEDIATE_WIN'};

  const viable=rows.filter(r=>r.viable);
  const pool=viable.length?viable:rows;
  let selected=pool.filter(r=>!pool.some(q=>q.column!==r.column&&dominates(q,r)));
  let reason='CLOSE_THEN_PARETO';

  if(selected.length>1){
    selected=selected.map(r=>({...r,race:race(P,r.column)}));
    const bestMargin=Math.max(...selected.map(r=>r.race.margin));
    selected=selected.filter(r=>r.race.margin===bestMargin);
    if(selected.length>1){
      const bestOwn=Math.min(...selected.map(r=>r.race.ownEarliest));
      selected=selected.filter(r=>r.race.ownEarliest===bestOwn);
    }
    reason='CLOSE_PARETO_THEN_DEADLINE';
  }
  return {rows,selected,reason};
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
    if(cols.length>1&&!symmetric){disposition='NON_SYMMETRIC_TIE';break;}
    const c=Math.min(...cols); // canonical reflection representative only
    const child=apply(P,c);
    sequence+=String(c+1);
    if(child.win){disposition='PLAYER_'+(child.playedBy+1)+'_WIN';break;}
  }
  return {
    schema:'connect4.universal_structural_policy.pre_oracle.v0',
    formula:'structural closure -> Pareto(A,B) -> support/deadline race',
    sequence,disposition,trace
  };
}

console.log(JSON.stringify(run(),null,2));
