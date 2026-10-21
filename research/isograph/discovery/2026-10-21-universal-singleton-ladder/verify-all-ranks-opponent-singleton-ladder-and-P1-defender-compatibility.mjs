#!/usr/bin/env node
// ORIGINAL 7x6 / control 6x6 Connect4 K4 four-way singleton-support ladder.
// Source has NO Connect4 oracle, historic strong28 mask, or recursive game WDL.
// Current firstwin-free q and real H/V/R/F original K4 window incidence only.
// Checks all legal P1 actions vs a separate four-direction physical ray checker.
import assert from 'node:assert/strict';

const D=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]],H=6;
function world(W){
  const lines=[];
  for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [ori,dc,dr] of D){
    const points=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
    if(points.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
      lines.push({ori,points,sites:points.map(([x,y])=>y*W+x)});
  }
  return {W,lines};
}
function blank(W){
  return {board:Array(W*H).fill(-1),heights:Array(W).fill(0),ply:0,ended:false};
}
function front(q,W){
  return q.heights.flatMap((h,c)=>h<H?[c+W*h]:[]);
}
function ray(b,e,p,W){
  const c=e%W,r=Math.floor(e/W);
  for(const [,dc,dr] of D){
    let n=1;
    for(const k of [-1,1]){
      let x=c+k*dc,y=r+k*dr;
      while(x>=0&&x<W&&y>=0&&y<H&&b[x+W*y]===p){
        n++;x+=k*dc;y+=k*dr;
      }
    }
    if(n>=4)return true;
  }
  return false;
}
function move(q,c,w){
  const {W,lines}=w;
  assert(!q.ended&&c>=0&&c<W&&q.heights[c]<H);
  const b=q.board.slice(),h=q.heights.slice(),p=q.ply%2;
  const e=c+W*h[c]++;b[e]=p;
  const wonRay=ray(b,e,p,W);
  const wonSource=lines.some(L=>L.sites.every(t=>b[t]===p));
  assert.equal(wonRay,wonSource);
  return {board:b,heights:h,ply:q.ply+1,ended:wonRay,placed:e,winner:wonRay?p:null};
}
// Physical singleton fibers: one possible final empty site per original
// already-three-owned K4, tagged by its true one of FOUR directions.
function fibers(q,w,p){
  const a=Array.from({length:w.W},()=>Array(H).fill(0));
  const tags=Array.from({length:w.W},()=>Array.from({length:H},()=>[]));
  for(const L of w.lines){
    if(L.sites.some(t=>q.board[t]===1-p))continue;
    const missing=L.sites.filter(t=>q.board[t]===-1);
    if(missing.length===1){
      const e=missing[0],c=e%w.W,r=Math.floor(e/w.W);
      a[c][r]++;tags[c][r].push(L.ori);
    }
  }
  return {a,tags};
}
function polynomial(f,q,w,c){
  return f.a[c].slice(q.heights[c]);
}
function derived(q,w){
  const p0=fibers(q,w,0),p1=fibers(q,w,1),allowed=front(q,w.W);
  const S=allowed.filter(e=>p0.a[e%w.W][Math.floor(e/w.W)]>0).map(e=>e%w.W);
  const E=allowed.filter(e=>p1.a[e%w.W][Math.floor(e/w.W)]>0).map(e=>e%w.W);
  const release=c=>q.heights[c]+1<H&&p0.a[c][q.heights[c]+1]>0;
  const unsafe=E.length===0&&
    (S.length>=2||
    (S.length===1&&release(S[0]))||
    (S.length===0&&allowed.every(e=>release(e%w.W))));
  return {p0,p1,S,E,release,unsafe};
}
function verticalControls(q,w){
  let count=0,latent=0,positiveDebt=0,verticalPartial=0;
  for(let p=0;p<=1;p++)for(const L of w.lines){
    if(L.ori!=='V')continue;
    if(L.sites.some(e=>q.board[e]===1-p))continue;
    const empty=L.sites.filter(e=>q.board[e]===-1);
    if(empty.length===1){
      count++;
      const x=empty[0],c=x%w.W,r=Math.floor(x/w.W);
      if(q.heights[c]!==r)latent++;
    }
    if(empty.length>0&&empty.length<4){
      verticalPartial++;
      const first=empty[0],c=first%w.W,r=Math.floor(first/w.W);
      if(r!==q.heights[c])positiveDebt++;
    }
  }
  assert.equal(latent,0,'Original vertical one-missing K4 CANNOT be latent');
  assert.equal(positiveDebt,0,'Partially owned live vertical has zero gravity debt');
  return {count,latent,positiveDebt,verticalPartial};
}
function inspect(q,w,stats){
  assert(!q.ended&&q.ply%2===1);
  stats.states++;
  const v=verticalControls(q,w);
  stats.verticalSingletonSeen+=v.count;
  stats.partiallyOwnedVerticalSeen+=v.verticalPartial;
  const d=derived(q,w);
  const F=front(q,w.W);
  const shape=d.E.length>0?'P1_DIRECT_FIRSTWIN':
    d.S.length>=2?'TWO_PLUS_TARGETS':
    d.S.length===1?(d.release(d.S[0])?'BLOCK_RELEASE_TRAP':'SINGLE_SAFE_BLOCK'):
    (F.every(e=>d.release(e%w.W))?'ALL_COLUMNS_FORCED_RELEASE':'SOME_SAFE_NON_RELEASE');
  stats.classification[shape]=(stats.classification[shape]||0)+1;
  if(d.unsafe)stats.forcedP0NextWin++;
  if(d.E.length)stats.P1directFirstwin++;
  let safe=[];
  for(const e of F){
    const c=e%w.W,next=move(q,c,w);
    const p1Immediate=d.E.includes(c);
    assert.equal(next.ended,p1Immediate,'own original P1 K4 singleton vs independent original ray');
    if(next.ended){stats.directP1Actions++;continue}
    stats.nonterminalP1Actions++;
    const now=fibers(next,w,0);
    for(let k=0;k<w.W;k++){
      const f0=polynomial(d.p0,q,w,k);
      const f1=polynomial(now,next,w,k);
      const expected=k===c?f0.slice(1):f0;
      assert.deepEqual(f1,expected,'Opponent shift-and-truncate source polynomial');
      stats.columnPolynomialChecks++;
    }
    // Direct, bounded independent ORIGINAL four-direction ray check for
    // P0 immediate next-ply K4, not a game-tree evaluator.
    const immediate=front(next,w.W).some(t=>move(next,t%w.W,w).ended);
    const predicted=(d.S.some(k=>k!==c)||d.release(c));
    assert.equal(immediate,predicted,'P1 drop P0 threat compatibility source theorem');
    if(!immediate)safe.push(c);
    stats.independentNextP0TerminalChecks++;
  }
  assert.equal(d.unsafe,d.E.length===0&&safe.length===0);
  if(!d.E.length){
    stats.physicalUnsafeSourceMatch++;
    if(shape==='TWO_PLUS_TARGETS'||shape==='BLOCK_RELEASE_TRAP'||
       shape==='ALL_COLUMNS_FORCED_RELEASE')stats.sourceFailureCategories++;
  }
  return {q,d,safe,shape};
}
function replay(s,w){
  let q=blank(w.W);
  for(let j=0;j<s.length;j++){
    const c=Number(s[j])-1;
    q=move(q,c,w);
    assert(!q.ended,'seed must be firstwin-free');
  }
  return q;
}
let rng=0x924d3617;
function randomInt(n){
  rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;
  return (rng>>>0)%n;
}
const summary={schema:1,date:'2026-10-21',
  status:'ALL_RANK_SOURCE_EXACT_P1_DEFENSE_LADDER_AND_NONVERTICAL_LATENT_SINGLETON',
  ownerSource:'ALL original W7K4 unwrapped H/V/R/F physical K4 windows',
  noHistorical28OrSolvedGameData:true,
  proof:'Opposing drop kills only the current singleton K4 sites x and decrements original support depth by one at the same column; if P1 has no own immediate win, P0 wins next iff two distinct currently playable targets, one playable plus directly-above latent target, or all legal P1 drops would expose directly-above latent P0 targets.',
  boards:{}
};
for(const W of [6,7]){
  const w=world(W);
  assert.equal(w.lines.length,W===7?69:54);
  const stats={originalK4:w.lines.length,states:0,verticalSingletonSeen:0,
    partiallyOwnedVerticalSeen:0,columnPolynomialChecks:0,
    independentNextP0TerminalChecks:0,nonterminalP1Actions:0,
    directP1Actions:0,forcedP0NextWin:0,P1directFirstwin:0,
    physicalUnsafeSourceMatch:0,sourceFailureCategories:0,classification:{}};
  // Mandatory guarded early and late original W7 q to link early fork
  // to late block-release and vertical successful block under one law.
  const special=(W===7?[
    '4','44','445','44516',
    '444443333636613412225777255525666717751',
    '4444431617112121323232535355657576667',
    '444443333337777774111111222222555555666666'.slice(0,39),
  ]:['4','44','445','44516']);
  const specials=[];
  for(const s of special){
    const q=replay(s,w);
    if(q.ply%2!==1)continue;
    const data=inspect(q,w,stats);
    specials.push({word:s,ply:q.ply,shape:data.shape,
      P0PlayableColumns:data.d.S.map(c=>c+1),
      P1ImmediateFirstwinnerColumns:data.d.E.map(c=>c+1),
      P0AboveLandingReleaseColumns:front(q,W).filter(e=>data.d.release(e%W)).map(e=>e%W+1),
      safeP1Responses:data.safe.map(c=>c+1),
      P0ForcesWinOnImmediatelyFollowingTurn:data.d.unsafe});
  }
  const trials=W===7?3200:1900;
  for(let trial=0;trial<trials;trial++){
    let q=blank(W);
    const maxMoves=5+randomInt(W*H-4);
    for(let t=0;t<maxMoves&&!q.ended;t++){
      const cols=front(q,W).map(e=>e%W);
      if(!cols.length)break;
      q=move(q,cols[randomInt(cols.length)],w);
      if(q.ended)break;
      if(q.ply%2===1)inspect(q,w,stats);
    }
  }
  assert(stats.states>5000);
  assert.equal(stats.physicalUnsafeSourceMatch,stats.states-stats.P1directFirstwin);
  assert.equal(stats.sourceFailureCategories,stats.forcedP0NextWin);
  summary.boards[W+'x6']={...stats,specials};
}
console.log(JSON.stringify(summary,null,2));
