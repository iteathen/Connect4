// Original Connect4 q-conditioned four-way Z3 Fourier / defender-frontier proof.
// Run with Node >=20: node verify-q-rebased-fourway-frontier.mjs
// Historical W7 28 per-line witnesses are HELD-BACK diagnostic q39 inputs.
// The producer for q and its defensive frontier uses ALL 69 original K4 windows;
// no root oracle, historical 28-line mask, or recursively valued game positions.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const DIR=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]],H=6;
function geometry(W){
 const lines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [direction,dx,dy] of DIR){
  const coords=Array.from({length:4},(_,i)=>[c+i*dx,r+i*dy]);
  if(coords.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   lines.push({direction,sites:coords.map(([x,y])=>x+W*y),coords});
 }
 return lines;
}
function ray(q,e,p,W){
 const c=e%W,r=Math.floor(e/W);
 for(const [,dx,dy] of DIR){
  let n=1;
  for(const sign of [-1,1]){
   let x=c+sign*dx,y=r+sign*dy;
   while(x>=0&&x<W&&y>=0&&y<H&&q.board[x+W*y]===p){
    n++;x+=sign*dx;y+=sign*dy;
   }
  }
  if(n>=4)return true;
 }
 return false;
}
function replay(word,W,G){
 const board=Array(W*H).fill(-1),height=Array(W).fill(0);
 for(let i=0;i<word.length;i++){
  const c=Number(word[i])-1;
  assert(c>=0&&c<W&&height[c]<H);
  const e=c+W*height[c]++;
  board[e]=i%2;
  const byWindows=G.some(line=>line.sites.every(x=>board[x]===i%2));
  assert.equal(byWindows,ray({board},e,i%2,W));
  assert.equal(byWindows,false,'prefix must be original firstwinner-free');
 }
 return {board,height,ply:word.length};
}
function frontier(q,W){return q.height.flatMap((h,c)=>h<H?[c+W*h]:[])}
function latent(q,p,G){
 const out=new Map;
 for(let j=0;j<G.length;j++){
  const line=G[j];
  if(line.sites.some(e=>q.board[e]===1-p))continue;
  const empty=line.sites.filter(e=>q.board[e]===-1);
  if(empty.length===1){
   const x=empty[0];
   if(!out.has(x))out.set(x,[]);
   out.get(x).push(j);
  }
 }
 return out;
}
function jet(q,p,n,G,W){
 const grouped=new Map;
 for(const line of G){
  if(line.sites.some(e=>q.board[e]===1-p))continue;
  const empty=line.sites.filter(e=>q.board[e]===-1);
  if(empty.length!==n)continue;
  const k=empty.slice().sort((a,b)=>a-b).join(',');
  if(!grouped.has(k))grouped.set(k,{missing:empty.map(e=>[e%W+1,Math.floor(e/W)+1]),directions:[]});
  grouped.get(k).directions.push(line.direction);
 }
 return [...grouped.values()].sort((a,b)=>JSON.stringify(a.missing).localeCompare(JSON.stringify(b.missing)));
}
function actualMove(q,c,W,G){
 assert(q.height[c]<H);
 const p=q.ply%2,e=c+W*q.height[c];
 const a=q.board.slice(),h=q.height.slice();h[c]++;
 a[e]=p;
 const now={board:a,height:h,ply:q.ply+1};
 const win=ray(now,e,p,W);
 assert.equal(win,G.some(line=>line.sites.every(s=>a[s]===p)));
 return {q:now,win,winner:win?p:null,landing:e};
}
function certificate39(q,W,G){
 assert.equal(q.ply,39);
 const F=frontier(q,W),a0=latent(q,0,G),a1=latent(q,1,G);
 if(F.some(x=>a1.has(x)))return {P0ForcedWinBy41:false,reason:'P1 immediate win available'};
 const P0Playable=F.filter(x=>a0.has(x)),rows=[];
 for(const x of F){
  const upper=x+W;
  const nextSites=[...new Set([...P0Playable.filter(y=>y!==x),
   ...(upper<W*H&&a0.has(upper)?[upper]:[])])];
  const actual=actualMove(q,x%W,W,G);
  assert(!actual.win);
  const verified=frontier(actual.q,W).filter(y=>latent(actual.q,0,G).has(y));
  assert.deepEqual([...nextSites].sort((a,b)=>a-b),verified.sort((a,b)=>a-b));
  rows.push({P1column:x%W+1,
    playableP0WinTargets:verified.map(y=>[y%W+1,Math.floor(y/W)+1]),
    releasedLatentAbove:(upper<W*H&&a0.has(upper)),
    P1BlocksCurrentTarget:P0Playable.includes(x)});
 }
 return {P0ForcedWinBy41:rows.every(row=>row.playableP0WinTargets.length>0),
  P0ImmediateBeforeDefense:P0Playable.map(x=>[x%W+1,Math.floor(x/W)+1]),rows};
}
function solveTiny(q,W,G){
 // Independently verify one-round source certificate on q39 only.
 // This is a final-3-ply game-value CHECK, not the source producer.
 assert(q.ply>=39);
 if(q.ply===W*H)return 0;
 const scores=[];
 for(let x of frontier(q,W)){
  const next=actualMove(q,x%W,W,G);
  scores.push(next.win?(next.winner===0?1:-1):solveTiny(next.q,W,G));
 }
 return q.ply%2===0?Math.max(...scores):Math.min(...scores);
}
function fourier(s,K){
 const a=2*Math.PI*((s*K)%3)/3;
 return [Math.cos(a)/9,Math.sin(a)/9];
}
function approx(a,b){assert(Math.abs(a[0]-b[0])<1e-12);assert(Math.abs(a[1]-b[1])<1e-12)}
function rootOfUnityControls(){
 let local={known:[0,0,0],summedNonzero:0,summedZero:0,actionChecks:0};
 for(let kh=0;kh<3;kh++)for(let kv=0;kv<3;kv++)
 for(let kr=0;kr<3;kr++)for(let kf=0;kf<3;kf++){
  const K=(kh+kv+kr+kf)%3;
  const vals=[0,1,2].map(s=>fourier(s,K));
  for(let s=0;s<3;s++){assert(Math.abs(Math.hypot(...vals[s])-1/9)<1e-12);local.known[s]++}
  const add=vals.reduce((sum,z)=>[sum[0]+z[0],sum[1]+z[1]],[0,0]);
  if(K===0){approx(add,[1/3,0]);local.summedNonzero++}
  else{approx(add,[0,0]);local.summedZero++}
  for(let p of [1,2]){
   const delta=[vals[p][0]-vals[0][0],vals[p][1]-vals[0][1]];
   const sourceNext=vals[0].map((v,j)=>v+delta[j]);
   approx(sourceNext,vals[p]);local.actionChecks++;
  }
 }
 assert.deepEqual(local.known,[81,81,81]);
 assert.equal(local.summedNonzero,27);assert.equal(local.summedZero,54);
 return local;
}
const fz={};
for(const W of [6,7]){
 const G=geometry(W),a=replay('424',W,G),b=replay('442',W,G);
 assert.equal(G.length,W===6?54:69);
 assert.deepEqual(a.height,b.height);
 assert.equal(a.ply%2,b.ply%2);
 const jA=jet(a,0,2,G,W),jB=jet(b,0,2,G,W);
 assert.equal(jA.length,1);assert.equal(jB.length,2);
 assert.equal(jA[0].directions[0],'V');
 assert(jB.every(x=>x.directions.every(d=>d==='H')));
 const col4row2=3+W;
 assert.equal(a.board[col4row2],0);
 assert.equal(b.board[col4row2],1);
 const mover=a.ply%2;
 const nextAction=frontier(a,W).map(e=>{
  const pOwner=mover===0?1:2, chargeK1Empty=fourier(0,1);
  const after=actualMove(a,e%W,W,G),s=after.q.board[e]===0?1:2;
  const exact=fourier(s,1),relativeDelta=[
   exact[0]-chargeK1Empty[0],exact[1]-chargeK1Empty[1]
  ];
  const symbolic=[chargeK1Empty[0]+relativeDelta[0],chargeK1Empty[1]+relativeDelta[1]];
  approx(symbolic,exact);
  return e%W+1;
 });
 fz[W+'x6']={sourceLines:G.length,commonColumnHeights:a.height,
  sameHeightAndSameToMove:true,physicallyDifferentCells:a.board.filter((v,i)=>v!==b.board[i]).length,
  P0MissingPairJetsAfter424:jA,P0MissingPairJetsAfter442:jB,
  centerCol4Row2OwnerAfter424:0,centerCol4Row2OwnerAfter442:1,
  knownStateFourierPhaseAtChargeK1ForCenterCell:{
   after424:fourier(1,1),after442:fourier(2,1)
  },
  currentlyLegalNextColumns:nextAction};
}
const historical=JSON.parse(readFileSync(new URL('../2026-10-19-true7x6-quantum-algebra/STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json',import.meta.url),'utf8'));
const rootPrefixes=[...new Set(historical.witnesses.map(w=>w.movesZeroBased))].map(word=>word.split('').map(ch=>+ch+1).join('').slice(0,39));
assert.equal(rootPrefixes.length,27);
const G=geometry(7),sampleOld='444443333636613412225777255525666717751';
const sampleNew='444443336336613412225777255525666717751';
assert(rootPrefixes.includes(sampleOld));
const qold=replay(sampleOld,7,G),qnew=replay(sampleNew,7,G);
assert.deepEqual(qold.height,qnew.height);
const oldC=certificate39(qold,7,G),newC=certificate39(qnew,7,G);
assert.equal(oldC.P0ForcedWinBy41,true);
assert.equal(newC.P0ForcedWinBy41,false);
assert.deepEqual(newC.rows.filter(r=>r.playableP0WinTargets.length===0).map(r=>r.P1column),[1]);
const oldW=solveTiny(qold,7,G),newW=solveTiny(qnew,7,G);
assert.equal(oldW,1);assert.equal(newW,0);
function originalP0Threats(q){const a=latent(q,0,G);return [...a].map(([e,ids])=>({
 target:[e%7+1,Math.floor(e/7)+1],
 lines:ids.map(i=>({orientation:G[i].direction,sites:G[i].coords.map(([c,r])=>[c+1,r+1])}))
}))}
const comparison={
 historicalRootStrongPrefix39:sampleOld,
 rebasedLegalPrefix39:sampleNew,adjacentOppositeOwnerSwappedPly:[9,10],
 sameHeights:qold.height,sameNextMover:'P1',
 changedPhysicalOwnership:qold.board.flatMap((owner,e)=>owner!==qnew.board[e]?[{site:[e%7+1,Math.floor(e/7)+1],originalOwner:owner,revisedOwner:qnew.board[e]}]:[]),
 historicalP0OneMissingOriginalFourwayThreats:originalP0Threats(qold),
 rebasedP0OneMissingOriginalFourwayThreats:originalP0Threats(qnew),
 originalSourceDefensiveCertificate:oldC,
 revisedSourceDefensiveCertificate:newC,
 perfectContinuationFromThisQValidatedByTinyFinal3Ply:{original:oldW,rebased:newW,meaning:{'1':'P0WIN','0':'DRAW','-1':'P1WIN'}},
 originalQ39IsHistoricStrongRootPrefix:true,
 rebasedQ39RootPerfectPrefixProven:false
};
const cohort={historicalRootStrongQ39:rootPrefixes.length,adjacentDifferentColumnSwaps:0,
 stillLegalAndFirstwinfreeSameHeight:0,
 rebasedPerfectWDL:{P0WIN:0,DRAW:0,P1WIN:0},
 instancesWhereOriginalForcedP0Win41CertificateFails:0};
for(const w of rootPrefixes){
 const q=replay(w,7,G);assert.equal(certificate39(q,7,G).P0ForcedWinBy41,true);
 for(let i=0;i<38;i++){
  if(w[i]===w[i+1])continue;
  cohort.adjacentDifferentColumnSwaps++;
  const alt=w.slice(0,i)+w[i+1]+w[i]+w.slice(i+2);
  let z;try{z=replay(alt,7,G)}catch(e){continue}
  cohort.stillLegalAndFirstwinfreeSameHeight++;
  assert.deepEqual(z.height,q.height);
  const wdl=solveTiny(z,7,G);
  cohort.rebasedPerfectWDL[wdl===1?'P0WIN':wdl===0?'DRAW':'P1WIN']++;
  if(!certificate39(z,7,G).P0ForcedWinBy41)
   cohort.instancesWhereOriginalForcedP0Win41CertificateFails++;
 }
}
assert.equal(cohort.adjacentDifferentColumnSwaps,533);
assert.equal(cohort.stillLegalAndFirstwinfreeSameHeight,285);
assert.deepEqual(cohort.rebasedPerfectWDL,{P0WIN:175,DRAW:63,P1WIN:47});
assert.equal(cohort.instancesWhereOriginalForcedP0Win41CertificateFails,110);
const report={schema:1,date:'2026-10-20',
 researchStatus:'CURRENT_GAME_STATE_CONDITIONED_FOURWAY_REBASE_AND_DEFENSIVE_FRONTIER_VERIFIED',
 localOwnerFourwayFourier:rootOfUnityControls(),
 sourceShortPositions:fz,
 rank39OwnerJunctionRebaseExample:comparison,
 diagnosticHistoryVariationCohort:cohort,
 meaning:[
  'The four-way junction geometry and one-site Fourier transform are fixed by board dimensions, but known owner phases and constrained potentiality/action fields depend on current actual q.',
  'A correct q-relative defensive frontier cannot be copied from EMPTY or from a different same-height owner position.',
  'The 27 historic firstwinning words are HELD-BACK perfect-root prefix samples only; swapped historical moves are not asserted root-perfect.',
  'The rank39 signed-WDL checks use a bounded at-most-3-ply independent game verifier solely to validate a state-conditioned ONE-round P0 win-by41 source certificate.',
  'No arbitrary-state universal nonbranching perfect-play WDL or empty-root perfect-play derivation is claimed.'
 ]};
process.stdout.write(JSON.stringify(report,null,2)+'\n');
