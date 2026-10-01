#!/usr/bin/env node
import assert from 'node:assert/strict';

const W=7,H=6,K=4;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const key=(x,y)=>x+','+y;
const id=(x,y)=>y*W+x;
const named=cell=>({column:(cell%W)+1,row:Math.floor(cell/W)+1});

function lines(){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){
    const cells=Array.from({length:K},(_,i)=>[x+i*dx,y+i*dy]);
    if(cells.every(([cx,cy])=>cx>=0&&cx<W&&cy>=0&&cy<H))out.push(cells);
  }
  return out;
}
const LINES=lines(); assert.equal(LINES.length,69);
function ownsLine(S,L){return L.every(([x,y])=>S.has(key(x,y)));}
function empty(){return {heights:Array(W).fill(0),stones:[new Set(),new Set()],rank:0,mover:0,win:false};}
function legal(P){return Array.from({length:W},(_,c)=>c).filter(c=>P.heights[c]<H);}
function apply(P,c){
  assert(P.heights[c]<H);
  const heights=P.heights.slice(),stones=[new Set(P.stones[0]),new Set(P.stones[1])];
  const playedBy=P.mover,y=heights[c]++;
  stones[playedBy].add(key(c,y));
  const win=LINES.some(L=>ownsLine(stones[playedBy],L));
  return {heights,stones,rank:P.rank+1,mover:1-playedBy,playedBy,landing:[c,y],win};
}
function position(sequence){
  let P=empty();
  for(let i=0;i<sequence.length;i++){
    const c=Number(sequence[i])-1;
    assert(Number.isInteger(c)&&c>=0&&c<W&&P.heights[c]<H);
    const Q=apply(P,c);
    assert.equal(Q.win,false,'input sequence contains terminal at ply '+(i+1));
    P=Q;
  }
  return P;
}
function normalizeResiduals(xs){
  const uniq=[],seen=new Set();
  for(const cells of xs){
    const a=[...cells].sort((a,b)=>a-b),s=a.join(',');
    if(!seen.has(s)){seen.add(s);uniq.push(a);}
  }
  uniq.sort((a,b)=>a.length-b.length||a.join(',').localeCompare(b.join(',')));
  const out=[];
  outer:for(const a of uniq){
    for(const b of out)if(b.length<=a.length&&b.every(x=>a.includes(x)))continue outer;
    out.push(a);
  }
  return out;
}
function liveResiduals(P,player){
  const opp=1-player,out=[];
  for(const L of LINES){
    if(L.some(([x,y])=>P.stones[opp].has(key(x,y))))continue;
    const missing=L.filter(([x,y])=>!P.stones[player].has(key(x,y))).map(([x,y])=>id(x,y));
    if(missing.length)out.push(missing);
  }
  return normalizeResiduals(out);
}
function sig(cells){return [...cells].sort((a,b)=>a-b).join(',');}
function hasResidual(P,player,cells){
  const s=sig(cells);
  return liveResiduals(P,player).some(r=>sig(r)===s);
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

const C3=id(2,2), E3=id(4,2), G3=id(6,2);
const G2=id(6,1), E4=id(4,3), C6=id(2,5);
const LOWER=[[C3,E3],[E3,G3]];
const UPPER=[[G2,E4],[E4,C6]];
const targetNames={
  C3:named(C3),E3:named(E3),G3:named(G3),
  G2:named(G2),E4:named(E4),C6:named(C6),
};

function singletonSet(P,attacker){
  return new Set(liveResiduals(P,attacker).filter(r=>r.length===1).map(r=>r[0]));
}
function summarizeSingletons(P,attacker){
  return [...singletonSet(P,attacker)].sort((a,b)=>a-b).map(cell=>({
    ...named(cell),
    supportDistance:Math.floor(cell/W)-P.heights[cell%W],
    playable:P.heights[cell%W]===Math.floor(cell/W)
  }));
}

function verifyState(sequence,label){
  const P=position(sequence),attacker=P.mover,defender=1-attacker;
  assert.equal(P.rank,12);
  for(const r of [...LOWER,...UPPER])assert(hasResidual(P,attacker,r),label+' missing pair '+sig(r));

  const eCol=4,e3Row=2,e4Row=3;
  const e3Depth=e3Row-P.heights[eCol];
  assert(e3Depth===0||e3Depth===1,label+' E3 depth must be 0/1');
  assert.equal(e4Row-P.heights[eCol],e3Depth+1);

  const record={
    label,sequence,attacker:attacker+1,heights:P.heights,
    e3Depth,
    pairCore:[...LOWER,...UPPER].map(r=>r.map(named)),
    firstWinGuard:{passed:true,defenderImmediateWinColumns:[]},
    branches:[]
  };

  if(e3Depth===0){
    const A=apply(P,eCol); // attacker takes E3
    if(A.win){
      record.branches.push({kind:'E3_IMMEDIATE',attackerMove:5,terminal:true});
    }else{
      const singles=singletonSet(A,attacker);
      assert(singles.has(C3)&&singles.has(G3),label+' E3 hub must create C3/G3 singleton pair');
      record.branches.push({
        kind:'E3_IMMEDIATE',attackerMove:5,terminal:false,
        singletonResiduals:summarizeSingletons(A,attacker)
      });
    }
    return record;
  }

  // E3 is one support event away: attacker advances E2.
  assert.equal(P.heights[eCol],1,label+' expected E2 frontier');
  const S=apply(P,eCol);
  if(S.win){
    record.branches.push({kind:'E2_TERMINAL',attackerMove:5,terminal:true});
    return record;
  }

  // First-win guard: defender must have no immediate terminal response.
  const defenderWins=winningFrontier(S,defender);
  if(defenderWins.length){
    record.firstWinGuard={
      passed:false,
      defenderImmediateWinColumns:defenderWins.map(c=>c+1),
    };
    record.branches.push({
      kind:'FIRST_WIN_GUARD_FAIL',
      attackerSupportMove:5,
      defenderImmediateWinColumns:defenderWins.map(c=>c+1),
    });
    return record;
  }

  for(const d of legal(S)){
    const D=apply(S,d);
    assert.equal(D.win,false,label+' defender response unexpectedly terminal in column '+(d+1));

    if(d===eCol){
      // Defender occupies E3; E4 is immediately released to attacker.
      assert.equal(D.heights[eCol],3);
      const A=apply(D,eCol);
      if(A.win){
        record.branches.push({defenderReply:d+1,hub:'E4',attackerMove:5,terminal:true});
      }else{
        const singles=singletonSet(A,attacker);
        assert(singles.has(G2)&&singles.has(C6),label+' E4 hub must create G2/C6 singleton pair');
        record.branches.push({
          defenderReply:d+1,hub:'E4',attackerMove:5,terminal:false,
          singletonResiduals:summarizeSingletons(A,attacker)
        });
      }
    }else{
      // Defender did not occupy E3; attacker takes it.
      assert.equal(D.heights[eCol],2);
      const A=apply(D,eCol);
      if(A.win){
        record.branches.push({defenderReply:d+1,hub:'E3',attackerMove:5,terminal:true});
      }else{
        const singles=singletonSet(A,attacker);
        const survivors=[C3,G3].filter(cell=>singles.has(cell));
        assert(survivors.length>=1,label+' E3 hub must leave at least one C3/G3 singleton after defender reply '+(d+1));
        record.branches.push({
          defenderReply:d+1,hub:'E3',attackerMove:5,terminal:false,
          survivingHubSingletons:survivors.map(named),
          singletonResiduals:summarizeSingletons(A,attacker)
        });
      }
    }
  }
  return record;
}

const states=[];
for(const [idRoot,root] of [['candidate2','4444415662'],['candidate3','4444415663']]){
  const setup=root+'6';
  for(let reply=1;reply<=7;reply++){
    states.push(verifyState(setup+String(reply),idRoot+'_setup6_reply'+reply));
  }
}

console.log(JSON.stringify({
  schema:'connect4.cpc_pair_star_hub_ladder.v1',
  oracleUsed:false,
  solvedInputsUsed:false,
  targetCells:targetNames,
  pairStar:{
    lower:LOWER.map(r=>r.map(named)),
    upper:UPPER.map(r=>r.map(named)),
    hubs:[named(E3),named(E4)]
  },
  states,
  controlSummary:{
    guardedStates:states.filter(s=>s.firstWinGuard.passed).length,
    guardFailures:states.filter(s=>!s.firstWinGuard.passed).map(s=>({
      label:s.label,
      defenderImmediateWinColumns:s.firstWinGuard.defenderImmediateWinColumns
    })),
    candidate2AllGuarded:states.filter(s=>s.label.startsWith('candidate2_')).every(s=>s.firstWinGuard.passed),
    candidate3AllGuarded:states.filter(s=>s.label.startsWith('candidate3_')).every(s=>s.firstWinGuard.passed),
  },
  theoremCandidate:[
    'If attacker owns the four pair residuals {x,h},{h,y},{u,h+},{h+,v}, h+ is immediately above h in one column, h is playable or one support event away, attacker moves, and no defender counterwin exists after the support move, then attacker can force terminal or at least one live singleton residual in at most three plies.',
    'If h is playable, take h and both lower pair residuals become singleton residuals.',
    'If h is one support event away, play its support. If defender occupies h, h+ becomes playable and taking h+ creates both upper singletons. Otherwise take h; one defender move can kill at most one distinct lower target, so at least one lower singleton remains.'
  ],
  boundary:[
    'This is a strict residual-progress theorem candidate, not yet a forced terminal upper bound.',
    'The four-pair star was discovered on consumed training evidence; the theorem must be frozen and qualified on fresh structural controls before use as a general CPC rule.',
    'No oracle value is used.'
  ]
},null,2));
