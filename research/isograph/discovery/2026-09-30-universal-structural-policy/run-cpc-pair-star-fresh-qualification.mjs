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
const LINES=lines();
assert.equal(LINES.length,69);

function empty(){return {heights:Array(W).fill(0),stones:[new Set(),new Set()],rank:0,mover:0,win:false};}
function ownsLine(S,L){return L.every(([x,y])=>S.has(key(x,y)));}
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
    if(!Number.isInteger(c)||c<0||c>=W||P.heights[c]>=H)return null;
    const Q=apply(P,c);
    if(Q.win&&i+1<sequence.length)return null;
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
function singletonSet(P,player){
  return new Set(liveResiduals(P,player).filter(r=>r.length===1).map(r=>r[0]));
}
function pairAdjacency(P,player){
  const adj=new Map();
  for(const r of liveResiduals(P,player)){
    if(r.length!==2)continue;
    const [a,b]=r;
    if(!adj.has(a))adj.set(a,new Set());
    if(!adj.has(b))adj.set(b,new Set());
    adj.get(a).add(b);adj.get(b).add(a);
  }
  return adj;
}
function combinations2(xs){
  const out=[];
  for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++)out.push([xs[i],xs[j]]);
  return out;
}

function findPairStars(P){
  const attacker=P.mover,adj=pairAdjacency(P,attacker),out=[];
  for(let c=0;c<W;c++)for(let row=P.heights[c];row+1<H;row++){
    const depth=row-P.heights[c];
    if(depth>1)break;
    const h=id(c,row),hp=id(c,row+1);
    const lower=[...(adj.get(h)??[])].filter(x=>x!==hp);
    const upper=[...(adj.get(hp)??[])].filter(x=>x!==h);
    if(lower.length<2||upper.length<2)continue;
    for(const [x,y] of combinations2(lower)){
      if(x===y)continue;
      for(const [u,v] of combinations2(upper)){
        if(u===v)continue;
        out.push({hub:h,upperHub:hp,column:c,row,depth,x,y,u,v});
      }
    }
  }
  return out;
}

function verifyStar(P,star){
  const attacker=P.mover,defender=1-attacker,c=star.column;
  const result={
    hub:named(star.hub),upperHub:named(star.upperHub),depth:star.depth,
    leaves:{lower:[named(star.x),named(star.y)],upper:[named(star.u),named(star.v)]},
    guard:{passed:true,defenderImmediateWinColumns:[]},
    branches:[]
  };

  if(star.depth===0){
    const A=apply(P,c);
    if(A.win){
      result.branches.push({kind:'DIRECT_HUB',terminal:true});
      return {valid:true,result};
    }
    const singles=singletonSet(A,attacker);
    const ok=singles.has(star.x)&&singles.has(star.y);
    result.branches.push({
      kind:'DIRECT_HUB',terminal:false,
      lowerSingletons:[star.x,star.y].filter(x=>singles.has(x)).map(named)
    });
    return {valid:ok,result};
  }

  assert.equal(star.depth,1);
  const S=apply(P,c); // support directly below h
  if(S.win){
    result.branches.push({kind:'SUPPORT_TERMINAL',terminal:true});
    return {valid:true,result};
  }
  const defenderWins=winningFrontier(S,defender);
  if(defenderWins.length){
    result.guard={passed:false,defenderImmediateWinColumns:defenderWins.map(x=>x+1)};
    return {valid:false,guardFailure:true,result};
  }

  for(const d of legal(S)){
    const D=apply(S,d);
    if(D.win)return {valid:false,reason:'UNEXPECTED_DEFENDER_TERMINAL',result};
    if(d===c){
      // Defender occupies h; attacker takes h+.
      if(D.heights[c]!==star.row+1)return {valid:false,reason:'HUB_HEIGHT_MISMATCH',result};
      const A=apply(D,c);
      if(A.win){
        result.branches.push({defenderReply:d+1,kind:'UPPER_HUB',terminal:true});
        continue;
      }
      const singles=singletonSet(A,attacker);
      const ok=singles.has(star.u)&&singles.has(star.v);
      result.branches.push({
        defenderReply:d+1,kind:'UPPER_HUB',terminal:false,
        upperSingletons:[star.u,star.v].filter(x=>singles.has(x)).map(named)
      });
      if(!ok)return {valid:false,reason:'UPPER_SINGLETON_FAILURE',result};
    }else{
      // h remains playable; attacker takes h.
      if(D.heights[c]!==star.row)return {valid:false,reason:'LOWER_HUB_NOT_PLAYABLE',result};
      const A=apply(D,c);
      if(A.win){
        result.branches.push({defenderReply:d+1,kind:'LOWER_HUB',terminal:true});
        continue;
      }
      const singles=singletonSet(A,attacker);
      const survivors=[star.x,star.y].filter(x=>singles.has(x));
      result.branches.push({
        defenderReply:d+1,kind:'LOWER_HUB',terminal:false,
        survivingLowerSingletons:survivors.map(named)
      });
      if(!survivors.length)return {valid:false,reason:'LOWER_SINGLETON_FAILURE',result};
    }
  }
  return {valid:true,result};
}

function nextRand(x){
  x^=x<<13;x^=x>>>17;x^=x<<5;
  return x>>>0;
}
function randomPrefix(seed,targetRank){
  let x=seed>>>0,P=empty(),sequence='';
  for(let ply=0;ply<targetRank;ply++){
    const ls=legal(P);
    if(!ls.length)return null;
    x=nextRand(x||1);
    const start=x%ls.length;
    let moved=false;
    for(let k=0;k<ls.length;k++){
      const c=ls[(start+k)%ls.length];
      const Q=apply(P,c);
      if(Q.win){
        // Keep terminal only if this is exactly the target rank; theorem input must be nonterminal.
        continue;
      }
      P=Q;sequence+=String(c+1);moved=true;break;
    }
    if(!moved)return null;
  }
  return {sequence,P};
}

const TRAINING='444441566';
const targetControls=24,maxTrials=120000;
const controls=[],guardFailures=[];
let starsExamined=0,qualifyingPositions=0;
for(let trial=1;trial<=maxTrials&&controls.length<targetControls;trial++){
  const rankTarget=8+(trial%13); // ranks 8..20
  const sample=randomPrefix((0x9e3779b9^Math.imul(trial,0x85ebca6b))>>>0,rankTarget);
  if(!sample)continue;
  if(sample.sequence.startsWith(TRAINING))continue;
  const stars=findPairStars(sample.P);
  if(!stars.length)continue;
  qualifyingPositions++;
  for(const star of stars){
    starsExamined++;
    const check=verifyStar(sample.P,star);
    if(check.guardFailure){
      if(guardFailures.length<12)guardFailures.push({
        sequence:sample.sequence,
        attacker:sample.P.mover+1,
        ...check.result
      });
      continue;
    }
    assert.equal(check.valid,true,'fresh pair-star theorem failure at '+sample.sequence);
    controls.push({
      sequence:sample.sequence,
      rank:sample.P.rank,
      attacker:sample.P.mover+1,
      ...check.result
    });
    break;
  }
}

assert(controls.length>=12,'insufficient fresh qualifying controls: '+controls.length);

console.log(JSON.stringify({
  schema:'connect4.cpc_pair_star_fresh_qualification.v1',
  theoremVersion:'0.1',
  oracleUsed:false,
  solvedInputsUsed:false,
  trainingPrefixExcluded:TRAINING,
  corpus:{
    generator:'deterministic xorshift32 legal nonterminal prefixes',
    maxTrials,
    targetControls,
    qualifyingPositions,
    starsExamined,
  },
  controls,
  retainedGuardFailures:guardFailures,
  conclusion:'Every fresh legal state satisfying the frozen pair-star premises and first-win guard satisfied the terminal-or-singleton conclusion. Guard failures are retained as scope evidence rather than treated as theorem contradictions.',
  boundary:'Fresh finite qualification is regression evidence; the theorem proof is the generic residual/turn-order argument in CPC_PAIR_STAR_HUB_LADDER_THEOREM.md.'
},null,2));
