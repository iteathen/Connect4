import fs from "node:fs";
import assert from "node:assert/strict";

// Research-only original W=7,H=6,K=4, no game-value oracle, no strategy tree.
// Standard 28 complete histories are validation records only; NEVER source selection.
const fixture=JSON.parse(fs.readFileSync(new URL("./STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json",import.meta.url),"utf8")).witnesses;
const W=7,H=6,K=4;
const dirs=[[1,0],[0,1],[1,1],[1,-1]];
const windows=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of dirs){
  const a=Array.from({length:K},(_,i)=>[c+i*dx,r+i*dy]);
  if(a.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))windows.push(a);
}
assert.equal(windows.length,69);
const sid=(c,r)=>H*c+r;
const empty=()=>({b:Array.from({length:W},()=>Array(H).fill(-1)),h:Array(W).fill(0),n:0});
const clone=q=>({b:q.b.map(z=>z.slice()),h:q.h.slice(),n:q.n});
const legal=q=>q.h.map((t,c)=>t<H?c:-1).filter(c=>c>=0);
const ray=(b,c,r,p)=>dirs.some(([dx,dy])=>{
  let count=1;
  for(const sign of [-1,1]){
    let x=c+sign*dx,y=r+sign*dy;
    while(x>=0&&x<W&&y>=0&&y<H&&b[x][y]===p){count++;x+=sign*dx;y+=sign*dy;}
  }
  return count>=K;
});
function move(q,c,p){
  assert.ok(c>=0&&c<W&&q.h[c]<H);
  const r=q.h[c]++;
  q.b[c][r]=p;q.n++;
  return ray(q.b,c,r,p);
}
function sourceSingleton(q,p){
  const S=new Set();
  for(const L of windows){
    let mine=0,opp=0,vacant=0,one=-1;
    for(const [c,r] of L){
      const u=q.b[c][r];
      if(u===p)mine++;
      else if(u===-1){vacant++;one=sid(c,r);}
      else opp++;
    }
    if(mine===K-1&&vacant===1&&opp===0)S.add(one);
  }
  return S;
}
const firstWinFromRay=(q,p)=>legal(q).filter(c=>{
  const z=clone(q);return move(z,c,p);
});
function pairs(q){
  const t=q.h.map(h=>H-h);
  const U=t.filter(x=>x%2===1).length;
  const J=t.reduce((s,x)=>s+Math.floor(x/2),0);
  assert.equal(H*W-q.n,2*J+U);
  assert.equal(U%2,q.n%2);
  for(let c=0;c<W;c++)assert.equal(t[c]%2,q.h[c]%2);
  return {U,J,t};
}
function checkOneP1(q,a){
  assert.equal(q.n%2,1);
  const S0=sourceSingleton(q,0),S1=sourceSingleton(q,1);
  const sigma=Array.from({length:W},(_,c)=>Number(q.h[c]<H&&S0.has(sid(c,q.h[c]))));
  const latent=Array.from({length:W},(_,c)=>Number(q.h[c]+1<H&&S0.has(sid(c,q.h[c]+1))));
  const blocked=Number(S1.has(sid(a,q.h[a])));
  const newSigma=sigma.slice();newSigma[a]=latent[a];
  const child=clone(q),p1win=move(child,a,1);
  assert.equal(p1win,blocked===1);
  if(p1win)return {p1win:true,release:false,originalImmediate:sigma.reduce((x,y)=>x+y,0)};
  const physical=Array.from({length:W},(_,c)=>Number(firstWinFromRay(child,0).includes(c)));
  assert.deepEqual(newSigma,physical,"P0 singleton source vs independent physical ray");
  for(let k=0;k<W;k++){
    let beforeR=0,beforeI=0,afterR=0,afterI=0;
    for(let c=0;c<W;c++){
      const theta=2*Math.PI*k*c/W;
      beforeR+=sigma[c]*Math.cos(theta);beforeI-=sigma[c]*Math.sin(theta);
      afterR+=physical[c]*Math.cos(theta);afterI-=physical[c]*Math.sin(theta);
    }
    const theta=2*Math.PI*k*a/W,amplitude=latent[a]-sigma[a];
    assert.ok(Math.abs((afterR-beforeR)-amplitude*Math.cos(theta))<1e-10);
    assert.ok(Math.abs((afterI-beforeI)+amplitude*Math.sin(theta))<1e-10);
  }
  return {p1win:false,release:latent[a]===1,originalImmediate:sigma.reduce((x,y)=>x+y,0),
    originalImmediateColumns:sigma.map((v,c)=>v?c+1:0).filter(Boolean),
    predictedP0NextColumns:physical.map((v,c)=>v?c+1:0).filter(Boolean)};
}
function analyze39(q,label){
  assert.equal(q.n,39);
  const options=legal(q).map(a=>({column:a+1,...checkOneP1(q,a)}));
  return {label,phase:pairs(q),options,
    preexistingP0ThreatCount:options[0]?.originalImmediate??0,
    universal:options.every(x=>!x.p1win&&x.predictedP0NextColumns.length>0),
    anyReleased:options.some(x=>x.release)};
}
let physicalHistoryMoves=0,sourcePhysicalRows=0,alternateFirstwin=0,phasePairEdges=0;
const rank39Records=[], distinct=new Set();
for(const w of fixture){
  assert.equal(w.movesZeroBased.length,41);
  const q=empty(),heights=[q.h.slice()];
  for(let n=0;n<41;n++){
    const c=+w.movesZeroBased[n],p=n%2;
    if(p===1)for(const a of legal(q)){
      const data=checkOneP1(q,a);
      sourcePhysicalRows++;
      if(data.p1win)alternateFirstwin++;
    }
    if(n===39)rank39Records.push(analyze39(q,w.lineId));
    const before=pairs(q),oldParity=q.h.map(x=>x%2);
    const term=move(q,c,p);physicalHistoryMoves++;
    const after=pairs(q);
    assert.equal(after.U,before.U+(oldParity[c]?-1:1));
    assert.equal(after.J,before.J-(oldParity[c]?0:1));
    assert.equal(term,n===40);
    heights.push(q.h.slice());
  }
  assert.equal(q.n,41);
  distinct.add(w.movesZeroBased);
  for(let n=0;n<=39;n++){
    const u=heights[n].map(x=>x%2),v=heights[n+2].map(x=>x%2);
    const a=+w.movesZeroBased[n],b=+w.movesZeroBased[n+1];
    for(let c=0;c<W;c++)assert.equal(v[c],u[c]^Number(c===a)^Number(c===b));
    for(let e=0;e<W-1;e++){
      const left=u[e]^u[e+1];
      const right=v[e]^v[e+1];
      const diff=Number(e===a)^Number(e===b)^Number(e+1===a)^Number(e+1===b);
      assert.equal(right,left^diff);
    }
    phasePairEdges++;
  }
}
const drawWord="123456123456654321654321123456123456777777";
assert.equal(drawWord.length,42);
const dq=empty();
for(let n=0;n<39;n++)assert.equal(move(dq,Number(drawWord[n])-1,n%2),false);
const drawControl=analyze39(dq,"rank39-true42ply-draw-control");
const tally=arr=>Object.fromEntries([...new Set(arr)].sort((a,b)=>a-b).map(x=>[x,arr.filter(y=>y===x).length]));
const report={
  schema:1,status:"PASS_INTERNAL_INDEPENDENT_RAY_CHECK",scope:"ONLY ORIGINAL STANDARD 7x6 K4 gravity/alternate/firstwin",
  historicalScoreQualification:"issue41 historical external strong score only; this physical replay did not recompute scores",
  originalPhysicalWindows:windows.length,sourceOnlyPreterminalTransfer:"sigma0_postP1(c)=sigma0_preP1(c) for c!=a; sigma0_postP1(a)=preP0_singleton(a,h_a+1)",
  rayIndependentOfSource69WindowEnumerator:true,
  archivedWitnessRecords:rank39Records.length,distinctArchiveHistoryWords:distinct.size,
  actualHistoryMovesPhysicallyReplayed:physicalHistoryMoves,
  oneStepP1AlternativeSourceVsIndependentPhysicalRayRows:sourcePhysicalRows,
  oneStepAlternativeP1ImmediateTerminalCasesExcluded:alternateFirstwin,
  twoPlyPhaseLaplacianChecks:phasePairEdges,
  rank39AllP1AlternativesExamined:rank39Records.reduce((n,r)=>n+r.options.length,0),
  rank39AllWitnessRecordsUniversalFirstwin:rank39Records.every(r=>r.universal),
  rank39PreexistingP0ImmediateThreats:tally(rank39Records.map(r=>r.preexistingP0ThreatCount)),
  rank39UnpairedResourceU:tally(rank39Records.map(r=>r.phase.U)),
  rank39PairResourceJ:tally(rank39Records.map(r=>r.phase.J)),
  rank39AnyLatentUpperRelease:rank39Records.filter(r=>r.anyReleased).length,
  negativeControlDrawRank39:drawControl,
  exactRank39Witnesses:rank39Records,
  sourceProvesUnrestrictedEmptyRootWDL:false,
  selectedWitnessCountIsNotExhaustiveStrongOptimalRank39Census:true
};
console.log(JSON.stringify(report,null,2));
