import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';

// Oracle-blind structural experiment.
// Inputs are only W=7, H=6, K=4, gravity, alternating ownership, and prefix "44".
// No solved table, opening book, WDL result, optimal move, or external oracle is imported.

const W=7,H=6,K=4;
const dirs=[[1,0],[0,1],[1,1],[1,-1]];
const key=(c,r)=>c+','+r;
const lines=[];
for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of dirs){
  const L=[];
  for(let i=0;i<K;i++){
    const x=c+i*dc,y=r+i*dr;
    if(x<0||x>=W||y<0||y>=H){L.length=0;break;}
    L.push([x,y]);
  }
  if(L.length===K)lines.push(L);
}
assert.equal(lines.length,69);

function replay(seq){
  const p0=new Set(),p1=new Set(),height=new Uint8Array(W);
  for(let ply=0;ply<seq.length;ply++){
    const c=seq[ply]-1,r=height[c];
    assert.ok(c>=0&&c<W&&r<H);
    (ply&1?p1:p0).add(key(c,r));height[c]+=1;
  }
  return {p0,p1,height};
}
function cloneState(s){
  return {p0:new Set(s.p0),p1:new Set(s.p1),height:Uint8Array.from(s.height)};
}
function play(s,player,c){
  const q=cloneState(s),r=q.height[c];
  assert.ok(r<H);
  (player?q.p1:q.p0).add(key(c,r));q.height[c]+=1;
  return {state:q,landing:[c,r]};
}
function family(s,player){
  const own=player?s.p1:s.p0,opp=player?s.p0:s.p1;
  const residuals=[];
  for(const L of lines){
    if(L.some(([c,r])=>opp.has(key(c,r))))continue;
    const residual=L.filter(([c,r])=>!own.has(key(c,r))).map(([c,r])=>[c,r]);
    residuals.push(residual);
  }
  const hist={};
  let literalMass=0,playableLiteralMass=0,maxPlayableIncidence=0;
  const playableIncidence=new Map();
  for(const R of residuals){
    literalMass+=R.length;
    hist[R.length]=(hist[R.length]??0)+1;
    for(const [c,r] of R)if(s.height[c]===r){
      const k=key(c,r),n=(playableIncidence.get(k)??0)+1;
      playableIncidence.set(k,n);playableLiteralMass+=1;
      if(n>maxPlayableIncidence)maxPlayableIncidence=n;
    }
  }
  return {
    liveLines:residuals.length,
    residualHistogram:hist,
    residualLiteralMass:literalMass,
    playableLiteralMass,
    playableBoundaryCells:playableIncidence.size,
    maxPlayableIncidence,
  };
}
function summary(s){
  return {p0:family(s,0),p1:family(s,1),heights:Array.from(s.height)};
}
function reflectColumn(c){return W-1-c;}

const q44=replay([4,4]);
const baseSummary=summary(q44);

const candidates=[];
for(let c=0;c<W;c++){
  const first=play(q44,0,c),s=first.state;
  const post=summary(s);
  const replies=[];
  for(let r=0;r<W;r++){
    if(s.height[r]>=H)continue;
    const next=play(s,1,r).state;
    replies.push({reply:r+1,...summary(next)});
  }
  candidates.push({
    move:c+1,
    mirror:reflectColumn(c)+1,
    landing:{column:first.landing[0]+1,row:first.landing[1]+1},
    transitionDelta:{
      ownResidualLiteralReduction:baseSummary.p0.residualLiteralMass-post.p0.residualLiteralMass,
      opponentLiveLinesEliminated:baseSummary.p1.liveLines-post.p1.liveLines,
      opponentResidualLiteralReduction:baseSummary.p1.residualLiteralMass-post.p1.residualLiteralMass,
    },
    post,
    replies,
  });
}

const reps=[4,3,2,1].map(m=>candidates[m-1]);
function reflectedSummary(x){
  return {
    p0:x.p0,
    p1:x.p1,
    heights:[...x.heights].reverse(),
  };
}
for(const m of [1,2,3])assert.deepEqual(
  candidates[m-1].post,
  reflectedSummary(candidates[7-m].post),
  'reflection class mismatch'
);

function replywiseRelaxedDominates(a,b){
  const rows=[];
  for(const ar of a.replies){
    const br=b.replies.find(x=>x.reply===ar.reply);
    assert.ok(br);
    const checks={
      p0LiveLines:ar.p0.liveLines>=br.p0.liveLines,
      p1LiveLines:ar.p1.liveLines<=br.p1.liveLines,
      p0ResidualLiteralMass:ar.p0.residualLiteralMass<=br.p0.residualLiteralMass,
      p1ResidualLiteralMass:ar.p1.residualLiteralMass<=br.p1.residualLiteralMass,
    };
    rows.push({reply:ar.reply,checks,all:Object.values(checks).every(Boolean),
      center:{p0LiveLines:ar.p0.liveLines,p1LiveLines:ar.p1.liveLines,
        p0ResidualLiteralMass:ar.p0.residualLiteralMass,p1ResidualLiteralMass:ar.p1.residualLiteralMass},
      comparator:{p0LiveLines:br.p0.liveLines,p1LiveLines:br.p1.liveLines,
        p0ResidualLiteralMass:br.p0.residualLiteralMass,p1ResidualLiteralMass:br.p1.residualLiteralMass}});
  }
  return {all:rows.every(x=>x.all),rows};
}

const center=reps[0];
const comparisons=reps.slice(1).map(other=>({
  centerMove:4,
  otherClass:[other.move,other.mirror].sort((a,b)=>a-b),
  result:replywiseRelaxedDominates(center,other),
}));
assert.ok(comparisons.every(x=>x.result.all));

const result={
  schema:'connect4.44.geometry-blind-continuation-support.v1',
  oracleBoundary:{
    prefix:'44',
    allowedInputs:['W=7','H=6','K=4','gravity','alternating ownership','geometric winning-line incidence'],
    forbiddenInputs:['solved WDL','solved move scores','opening book','perfect-play map','external oracle'],
    oracleConsulted:false,
  },
  geometry:{W,H,K,lineCount:lines.length},
  symmetryClasses:[[4],[3,5],[2,6],[1,7]],
  prefix:baseSummary,
  candidateRepresentatives:reps.map(x=>({
    move:x.move,mirror:x.mirror,landing:x.landing,
    transitionDelta:x.transitionDelta,post:x.post,
  })),
  replywiseRelaxedDominance:comparisons,
  finding:{
    status:'STRUCTURAL_LEAD_NOT_GAME_THEOREM',
    statement:'Within the exact residual-line relaxation used here, move 4 strictly leads all noncenter symmetry classes at the immediate transition and remains componentwise no-worse after every same-column one-ply opponent reply on own live-line count, opponent live-line count, own residual literal mass, and opponent residual literal mass.',
    firewall:'These metrics are exact properties of the represented residual formulas, but no theorem currently establishes that this componentwise relaxation order implies perfect-play move dominance. Do not call move 4 solved or optimal from this experiment.',
    next:'Use DP/DTS on the gap between this robust residual dominance and true alternating continuation dominance. Search for the minimum deadline/response invariant that makes the implication sound, or produce a geometry-only counterexample.',
  },
};
console.log(JSON.stringify(result,null,2));
if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');
