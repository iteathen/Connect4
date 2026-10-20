import fs from "node:fs";
import assert from "node:assert/strict";

// Original 7x6 K4 only; zero solved move labels enter the observer.
// The archived historically strong-scored paths are held-back VALIDATION inputs,
// not a generator of the 69-line source quantities or a representative random sample.
const data=JSON.parse(fs.readFileSync(new URL("./STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json",import.meta.url),"utf8"));
const boardW=7,boardH=6,dirs=[[1,0],[0,1],[1,1],[1,-1]];
const L=[];
for(let c=0;c<boardW;c++)for(let r=0;r<boardH;r++)for(const [dc,dr] of dirs){
  const sites=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(sites.every(([x,y])=>x>=0&&x<7&&y>=0&&y<6))L.push(sites);
}
assert.equal(L.length,69);
const sid=(c,r)=>c*6+r;
const fresh=()=>({board:Array.from({length:7},()=>Array(6).fill(-1)),height:Array(7).fill(0),n:0});
const clone=q=>({board:q.board.map(x=>x.slice()),height:q.height.slice(),n:q.n});
const legal=q=>q.height.map((v,c)=>v<6?c:-1).filter(x=>x>=0);
function raywin(board,c,r,p){
 return dirs.some(([dx,dy])=>{
  let count=1;
  for(const s of [-1,1]){
   let x=c+s*dx,y=r+s*dy;
   while(x>=0&&x<7&&y>=0&&y<6&&board[x][y]===p){count++;x+=s*dx;y+=s*dy;}
  }
  return count>=4;
 });
}
function play(q,c,p){
 assert.ok(c>=0&&c<7&&q.height[c]<6);
 const r=q.height[c]++;
 q.board[c][r]=p;q.n++;
 return raywin(q.board,c,r,p);
}
function source(q){
 const S=[new Set(),new Set()],degree=[Array(5).fill(0),Array(5).fill(0)];
 for(const line of L){
  const own=[0,0],vacant=[];
  for(const [c,r] of line){
   const label=q.board[c][r];
   if(label<0)vacant.push(sid(c,r));else own[label]++;
  }
  for(const p of [0,1])if(own[1-p]===0&&vacant.length){
   degree[p][vacant.length]++;
   if(vacant.length===1)S[p].add(vacant[0]);
  }
 }
 return {S,degree};
}
function measure(q,chosen){
 assert.equal(q.n%2,1);
 const a=legal(q),{S,degree}=source(q),[S0,S1]=S;
 const sigma=a.map(c=>Number(S0.has(sid(c,q.height[c]))));
 const omega=a.map(c=>Number(S1.has(sid(c,q.height[c]))));
 const lambda=a.map(c=>Number(q.height[c]+1<6&&S0.has(sid(c,q.height[c]+1))));
 const exposure=a.map((c,j)=>{
  const otherSafeProduct=sigma.reduce((z,v,k)=>j===k?z:z*(1-v),1);
  const predicted=(1-omega[j])*(1-(1-lambda[j])*otherSafeProduct);
  // Independently execute exactly ONE original P1 action and inspect possible
  // physical P0 direct wins with a separate directional-ray checker.
  const child=clone(q),P1first=play(child,c,1);
  let actual=0;
  if(!P1first)for(const b of legal(child)){
   const p0=clone(child);
   if(play(p0,b,0)){actual=1;break;}
  }
  assert.equal(predicted,actual,"source vs independent physical one-step firstwin");
  return predicted;
 });
 const rem=q.height.map(h=>6-h);
 const J=rem.reduce((z,v)=>z+Math.floor(v/2),0),U=rem.reduce((z,v)=>z+(v%2),0);
 assert.equal(42-q.n,2*J+U);
 const E=exposure.reduce((z,v)=>z+v,0);
 return {n:q.n,legal:a.length,E,F:E/a.length,Z:Number(E===a.length),
  B:sigma.reduce((z,v,i)=>z+v*lambda[i],0),
  L:lambda.reduce((z,v)=>z+v,0),
  S:sigma.reduce((z,v)=>z+v,0),
  P1:omega.reduce((z,v)=>z+v,0),
  J,U,sourceDegreeP0:degree[0].slice(1),sourceDegreeP1:degree[1].slice(1),
  chosenP1Exposes:exposure[a.indexOf(chosen)],
  legalColumns:a.map(c=>c+1)};
}
const uniqueWords=new Map();
for(const witness of data.witnesses){
 const group=uniqueWords.get(witness.movesZeroBased)||[];
 group.push(witness.lineId);
 uniqueWords.set(witness.movesZeroBased,group);
}
const traces=[];let actualRootPlayedMoves=0,sourcePhysicalAlternatives=0;
for(const [word,witnessLineIds] of uniqueWords){
 const q=fresh(),points=[];
 assert.equal(word.length,41);
 for(let n=0;n<word.length;n++){
  if(n%2===1){const m=measure(q,+word[n]);sourcePhysicalAlternatives+=m.legal;points.push({...m,prefix:word.slice(0,n)});}
  assert.equal(play(q,+word[n],n%2),n===40);
  actualRootPlayedMoves++;
 }
 traces.push({word,witnessLineIds,points});
}
const draw="123456123456654321654321123456123456777777";
const dq=fresh(),drawPoints=[];
for(let n=0;n<draw.length;n++){
 if(n%2===1&&n<=39)drawPoints.push({...measure(dq,+draw[n]-1),prefix:draw.slice(0,n)});
 assert.equal(play(dq,+draw[n]-1,n%2),false);
}
const summary=[];
function qstat(xs){
 const a=xs.slice().sort((x,y)=>x-y);
 return {min:a[0],median:a[Math.floor(a.length/2)],
   max:a[a.length-1],mean:xs.reduce((s,x)=>s+x,0)/xs.length};
}
for(let n=1;n<=39;n+=2){
 const entries=traces.map(t=>t.points.find(p=>p.n===n));
 const distinct=[...new Map(entries.map(p=>[p.prefix,p])).values()];
 const control=drawPoints.find(p=>p.n===n);
 summary.push({rank:n,historyWitnesses:entries.length,distinctActualPrefixes:distinct.length,
  exposureFraction:qstat(distinct.map(x=>x.F)),
  universallyUnsafe:distinct.filter(x=>x.Z).length,
  anyLowerBlockUpperRelease:distinct.filter(x=>x.B>0).length,
  anyLatentUpper:distinct.filter(x=>x.L>0).length,
  immediateP0:qstat(distinct.map(x=>x.S)),
  P0residualDegree2:qstat(distinct.map(x=>x.sourceDegreeP0[1])),
  onChosenHistoricalP1ActionExposes:distinct.filter(x=>x.chosenP1Exposes).length,
  drawControl:{exposureFraction:control.F,universallyUnsafe:control.Z,
   lowerBlockUpperRelease:control.B,latentUpper:control.L,immediateP0:control.S}});
}
assert.equal(summary.find(x=>x.rank===39).universallyUnsafe,27);
assert.equal(summary.filter(x=>x.rank<39&&x.universallyUnsafe>0).length,0);
assert.equal(summary.filter(x=>x.rank<39&&x.anyLowerBlockUpperRelease>0).length,0);
assert.equal(summary.filter(x=>x.rank<39&&x.onChosenHistoricalP1ActionExposes>0).length,0);
assert.ok(drawPoints.every(x=>x.Z===0));
const output={schema:1,scope:"ONLY_original_7x6K4_true_gravity_P0_P1_alternating_firstwin_stopped",
 evidenceClass:"SOURCE_EXACT_IDENTITY_plus_INTERNAL_INDEPENDENT_PHYSICAL_VALIDATION",
 historicStrongOptimality:"Archived issue41 only; original strong move scores not recomputed",
 frozenDefinitions:"docs/research/2026-10-19-causal-rank-interference-pattern-precursor-frozen.md",
 warnings:["Historical 27 game words were hand-selected as 28-line witnesses, not all game trees or random draws",
  "Distinct prefixes per rank prevent duplicate witnesses from artificially multiplying early data",
  "A bad P1 alternative is one-step physical only, not necessarily a complete root-perfect game",
  "F and Z are immediate-next-turn exposure, NOT WDL or strategy sufficiency",
  "The single known legal full draw is a negative control, not a representative draw population",
  "Earlier unsafe moves along a strong-optimal path are not selected by P1"],
 physicalWindows:L.length,rootWitnessLineRecords:data.witnesses.length,
 distinctHistoricalCompleteGameWords:traces.length,
 physicallyReplayedRootHistoryMoves:actualRootPlayedMoves,
 physicallyCheckedP1Alternatives:sourcePhysicalAlternatives,
 drawControlFullPlayedMoves:42,
 byOddRank:summary,
 distinctTraceMeasurements:traces,
 drawControlMeasurements:drawPoints
};
console.log(JSON.stringify(output,null,2));
