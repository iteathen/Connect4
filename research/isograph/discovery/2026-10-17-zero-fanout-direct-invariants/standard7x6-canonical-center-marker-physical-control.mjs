// Independent true-standard-7x6 W=7,H=6,K=4 array-grid FIRST win
// controls for a center rank m inserted into the SAME fixed 36-letter
// noncenter word. Hypothetical complete schedules are TEST INPUT only;
// no game-tree/strategic future outcomes or hidden policies evaluated.
// Source theorem/producers frozen before physical control.
import {createSingleCenterMarkerSource} from './standard7x6-canonical-center-marker-source.mjs';
const W=7,H=6,K=4,N=W*H,C=3,bit=(c,r)=>1n<<BigInt(r*W+c);
const factory=createSingleCenterMarkerSource({width:W,height:H,connect:K});
const directions=[[1,0],[0,1],[1,1],[1,-1]],lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of directions){
 const cc=c+(K-1)*dx,rr=r+(K-1)*dy;
 if(cc>=W||rr<0||rr>=H)continue;
 let mask=0n;for(let j=0;j<K;j++)mask|=bit(c+dx*j,r+dy*j);
 lines.push(mask);
}
if(lines.length!==69)throw Error('physical geometry must have 69 K=4 windows');
const prefix='44444',h=Array(W).fill(0),P=[0n,0n];
for(let i=0;i<prefix.length;i++){
 const c=Number(prefix[i])-1,r=h[c]++,p=i%2;
 P[p]|=bit(c,r);
}
const support=P[0]|P[1],R=[[],[]];
for(let p=0;p<2;p++)for(const G of lines){
 if((G&P[1-p])!==0n)continue;
 const g=G&~support;if(g===0n)throw Error('canonical source already terminal');
 R[p].push(g);
}
const pop=x=>{let n=0;for(;x;x&=x-1n)n++;return n;};
function norm(arr){
 const u=[...new Set(arr.map(String))].map(BigInt).sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
 const out=[];for(const g of u)if(!out.some(v=>(g&v)===v))out.push(g);
 return out;
}
const q={h:h.slice(),R0:norm(R[0]),R1:norm(R[1])};
if(q.R0.length!==48||q.R1.length!==42||h[C]!==5)
 throw Error('canonical 44444 source q mismatch');
const centerCellId=(H-1)*W+C;
const centerSourceIncidence={P0:q.R0.filter(x=>(x&bit(C,H-1))!==0n).length,
 P1:q.R1.filter(x=>(x&bit(C,H-1))!==0n).length};
let seed=0x4444A62B>>>0;
const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
function randomNoncenterWord(){
 const current=h.slice(),word=[];
 while(word.length<N-prefix.length-1){
  const a=[];for(let c=0;c<W;c++)if(c!==C&&current[c]<H)a.push(c);
  const c=a[rand()%a.length];word.push(c);current[c]++;
 }
 return word;
}
function winningLineOnGrid(g,c,r,p){
 for(const [dx,dy] of directions){
  let run=1;
  for(const direction of [-1,1]){
   let x=c+direction*dx,y=r+direction*dy;
   while(x>=0&&x<W&&y>=0&&y<H&&g[x][y]===p){
    run++;x+=direction*dx;y+=direction*dy;
   }
  }
  if(run>=K)return true;
 }
 return false;
}
function directCheck(word){
 const g=Array.from({length:W},()=>Array(H).fill(-1)),heights=Array(W).fill(0);
 const moves=prefix.split('').map(x=>Number(x)-1).concat(word);
 let first=null;
 for(let t=0;t<moves.length;t++){
  const c=moves[t],r=heights[c]++,p=t%2;
  if(r>=H)throw Error('gravity word illegal');
  g[c][r]=p;
  if(!first&&winningLineOnGrid(g,c,r,p))
   first={winner:p,absoluteMove:t+1};
 }
 return first??{winner:null,absoluteMove:null};
}
const stats={schema:'connect4.standard7x6.single_center_marker_xor_control_v0_1',
 date:'2026-10-17',board:{W,H,K,geometricKLines:69},
 canonical:prefix,sourceResidual:[q.R0.length,q.R1.length],
 uniqueLastCenterEventOneBased:[C+1,H],
 centerSourceGeneratorIncidence:centerSourceIncidence,
 seedStart:seed,noncenterWords:0,
 hypotheticalMarkerPlacementSchedules:0,
 phaseOwnerRankChecks:0,
 sourceOriginalResidualConjunctionChecks:0,
 physicalFirstWinnerAndRankChecks:0,
 firstWinnerChangedOnlyByCenterRankPairs:0,
 firstWinTimeChangedOnlyByCenterRankPairs:0,
 centerRankParityChangesWinnerPairs:0,
 centerRankSameParityChangedWinnerPairs:0,
 centerMove6ImmediateMarkerCheck:null,
 firstMarkerDifferenceWitness:null,
 firstSameCenterOwnerDifferentWinnerWitness:null,
 sourceVsPhysicalWinnerErrors:0,
 sourceVsPhysicalTerminalRankErrors:0,
 invalidGravityErrors:0,
 sourceStrategicFutureValueQueries:0};
const markers=[1,2,3,12,18,24,35,37];
for(let test=0;test<1500;test++){
 const u=randomNoncenterWord();
 stats.noncenterWords++;
 const scores=[];
 for(const m of markers){
  const result=factory.evaluate(q,u,m),word=result.fullHypotheticalWordOneBased.split('').map(ch=>Number(ch)-1);
  const original=directCheck(word);
  stats.hypotheticalMarkerPlacementSchedules++;
  stats.physicalFirstWinnerAndRankChecks++;
  stats.phaseOwnerRankChecks+=result.phaseChecks+1; // include unique center token
  stats.sourceOriginalResidualConjunctionChecks+=result.generatorTests;
  // Separate physical owner/rank enumeration of ALL 37 future events
  const hh=h.slice(),owner=Array(N).fill(-1),times=Array(N).fill(-1);
  for(let t=0;t<word.length;t++){
   const c=word[t],r=hh[c]++,id=r*W+c;
   owner[id]=(prefix.length+t)%2;times[id]=t+1;
  }
  for(let id=0;id<N;id++)if(result.markerOwnersAndTimesByFutureCell.relativeRank[id]>0){
   if(result.markerOwnersAndTimesByFutureCell.owner[id]!==owner[id]||
      result.markerOwnersAndTimesByFutureCell.relativeRank[id]!==times[id])
    throw Error('independent real-turn check of marker-affected event rank/owner failed');
  }
  if(result.firstWinner!==original.winner){
   stats.sourceVsPhysicalWinnerErrors++;throw Error('marker predicted incorrect FIRST winning player');
  }
  if(result.firstWinAbsoluteMove!==original.absoluteMove){
   stats.sourceVsPhysicalTerminalRankErrors++;throw Error('marker predicted incorrect FIRST terminal time');
  }
  if(m===1&&test===0)
   stats.centerMove6ImmediateMarkerCheck={markerRelativeRank:1,owner:result.centerOwner,
    centerEventuallyFull:true,expectedAfterHistory:'444444'};
  scores.push({m,result});
 }
 for(let i=0;i<scores.length;i++)for(let j=i+1;j<scores.length;j++){
  const a=scores[i],b=scores[j],diff=a.result.firstWinner!==b.result.firstWinner,
   diffTime=a.result.firstWinAbsoluteMove!==b.result.firstWinAbsoluteMove,
   ownerDifferent=a.result.centerOwner!==b.result.centerOwner;
  if(diff){
   stats.firstWinnerChangedOnlyByCenterRankPairs++;
   if(ownerDifferent)stats.centerRankParityChangesWinnerPairs++;
   else stats.centerRankSameParityChangedWinnerPairs++;
  }
  if(diffTime)stats.firstWinTimeChangedOnlyByCenterRankPairs++;
  if(diff&&!stats.firstMarkerDifferenceWitness)
   stats.firstMarkerDifferenceWitness={
    identicalNoncenterWordOneBased:u.map(c=>c+1).join(''),
    insertionRanks:[a.m,b.m],centerOwners:[a.result.centerOwner,b.result.centerOwner],
    completeWords:[a.result.fullHypotheticalWordOneBased,b.result.fullHypotheticalWordOneBased],
    firstOutcomes:[
     {winner:a.result.firstWinner,absoluteMove:a.result.firstWinAbsoluteMove,
       requirement:a.result.firstWinningSourceResidual},
     {winner:b.result.firstWinner,absoluteMove:b.result.firstWinAbsoluteMove,
       requirement:b.result.firstWinningSourceResidual}
    ]};
  if(diff&&!ownerDifferent&&!stats.firstSameCenterOwnerDifferentWinnerWitness)
   stats.firstSameCenterOwnerDifferentWinnerWitness={
    noncenterWord:u.map(c=>c+1).join(''),markerRanks:[a.m,b.m],owner:a.result.centerOwner,
    outcomes:[[a.result.firstWinner,a.result.firstWinAbsoluteMove],
      [b.result.firstWinner,b.result.firstWinAbsoluteMove]]};
 }
}
stats.seedFinal=seed;
console.log(JSON.stringify(stats,null,2));
