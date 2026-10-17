// Independent PHYSICAL validation only. Uses real 7x6/Connect4 W,H,K.
// Hypothetical full schedules are used to falsify event-XOR/first-win
// identities, NOT to compute optimal game values or source action policies.
// Frozen before first execution on 2026-10-17, research/semantic-quotient.
const W=7,H=6,K=4,N=W*H;
const dirs=[[1,0],[0,1],[1,1],[1,-1]];
const lines=[],byCell=Array.from({length:N},()=>[]);
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of dirs){
  const ec=c+(K-1)*dc,er=r+(K-1)*dr;
  if(ec<0||ec>=W||er<0||er>=H)continue;
  const ids=Array.from({length:K},(_,j)=>(r+j*dr)*W+c+j*dc);
  const mask=ids.reduce((s,x)=>s|(1n<<BigInt(x)),0n);
  const line={ids,mask};lines.push(line);
  for(const id of ids)byCell[id].push(mask);
 }
if(lines.length!==69)throw Error('not standard 69 winning lines');
let seed=0xC4B17E5>>>0;
function rand(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed;}
function makeFull(start){
 const h=Array(W).fill(0),path=[...start].map(x=>Number(x)-1);
 for(const c of path){if(!Number.isInteger(c)||c<0||c>=W||h[c]++>=H)throw Error('invalid prefix');}
 while(path.length<N){
  const legal=[];
  for(let c=0;c<W;c++)if(h[c]<H)legal.push(c);
  const c=legal[rand()%legal.length];path.push(c);h[c]++;
 }
 return path;
}
function physicalFirstWinner(path){
 const h=Array(W).fill(0),p=[0n,0n];
 for(let t=0;t<N;t++){
  const c=path[t],r=h[c]++,id=r*W+c,side=t%2;
  if(r>=H)throw Error('bad column chain');
  p[side]|=1n<<BigInt(id);
  for(const mask of byCell[id])if((p[side]&mask)===mask)return {winner:side,time:t+1};
 }
 return {winner:null,time:null};
}
const stats={schema:'connect4.standard7x6.binary_event_phase_falsification_v0_1',
 geometry:{W,H,K,lines:lines.length},seedStart:seed,
 samplesByPrefix:{},verifiedEventParityIdentities:0,verifiedLineMonochromeConditions:0,
 verifiedEarliestFirstWinSchedules:0,invalidPrefix:0,wrongEventParity:0,wrongFirstWin:0,
 distinctColumnAdjacentSwapChecks:0,wrongAdjacentSwap:0,
 sameOwnerLegalSwapTrials:0,sameFinalOwnershipAssignmentChecks:0,
 sameFinalOwnershipDifferentFirstWinner:null,firstWinEvents:0,drawEvents:0};
function inspect(path,prefix){
 const n=prefix.length,h0=Array(W).fill(0);
 for(let t=0;t<n;t++)h0[path[t]]++;
 const h=Array(W).fill(0),own=Array(N).fill(-1),when=Array(N).fill(-1);
 const p=[0n,0n];let observed=null,expectT=null,expectWinner=null;
 for(let t=0;t<N;t++){
  const c=path[t],r=h[c]++,id=r*W+c,side=t%2;
  if(r>=H)throw Error('column overflow');
  own[id]=side;when[id]=t+1;p[side]|=1n<<BigInt(id);
  if(t>=n){
   const local=t-n,ownColBefore=r-h0[c],otherBefore=local-ownColBefore;
   const exp=(n&1)^(ownColBefore&1)^(otherBefore&1);
   stats.verifiedEventParityIdentities++;
   if(exp!==side){stats.wrongEventParity++;throw Error('XOR event mismatch');}
  }
  if(observed===null)for(const line of byCell[id])if((p[side]&line)===line){
   observed={winner:side,time:t+1};break;
  }
 }
 let minTime=Infinity,bestOwner=null;
 for(const line of lines){
  const bit=own[line.ids[0]];
  let mono=1;
  for(let j=1;j<K;j++)mono&=1^(own[line.ids[j]]^bit);
  stats.verifiedLineMonochromeConditions++;
  if(!mono)continue;
  const t=Math.max(...line.ids.map(id=>when[id]));
  if(t<minTime){minTime=t;bestOwner=bit;}
  else if(t===minTime &&bestOwner!==bit)throw Error('impossible different first winner same move');
 }
 expectT=Number.isFinite(minTime)?minTime:null;
 expectWinner=Number.isFinite(minTime)?bestOwner:null;
 stats.verifiedEarliestFirstWinSchedules++;
 if(!observed)stats.drawEvents++;else stats.firstWinEvents++;
 if((observed?.time??null)!==expectT||(observed?.winner??null)!==expectWinner){
  stats.wrongFirstWin++;throw Error('GF2 line parity vs physical winner mismatch');
 }
 return {observed,own,when};
}
function trySameColorSwaps(path,base){
 const len=path.length;
 for(let attempt=0;attempt<24;attempt++){
  const i=rand()%(len-2),j=i+2+2*(rand()%Math.max(1,Math.floor((len-i-2)/2)));
  if(j>=len||path[i]===path[j])continue;
  let okay=true;
  for(let k=i+1;k<j;k++)if(path[k]===path[i]||path[k]===path[j]){okay=false;break;}
  if(!okay)continue;
  stats.sameOwnerLegalSwapTrials++;
  const alt=path.slice();[alt[i],alt[j]]=[alt[j],alt[i]];
  const altOutcome=physicalFirstWinner(alt);
  if(altOutcome.winner===base.observed?.winner)continue;
  const next=inspect(alt,'');
  stats.sameFinalOwnershipAssignmentChecks++;
  if(!next.own.every((v,k)=>v===base.own[k]))throw Error('same color swap changed event ownership');
  return {sourceScheduleColumns:path.map(c=>c+1).join(''),
   swappedScheduleColumns:alt.map(c=>c+1).join(''),
   swappedOneBasedTurns:[i+1,j+1],
   originalFirstWinner:base.observed,
   swappedFirstWinner:altOutcome,
   identicalFinalPerCellOwners:true};
 }
 return null;
}
for(const [prefix,count] of [['',14000],['44444',3500],['4444442',1500]]){
 stats.samplesByPrefix[prefix||'empty']=count;
 for(let run=0;run<count;run++){
  const path=makeFull(prefix),base=inspect(path,prefix);
  if(run<2500 && !stats.sameFinalOwnershipDifferentFirstWinner && prefix===''){
   const hit=trySameColorSwaps(path,base);
   if(hit)stats.sameFinalOwnershipDifferentFirstWinner=hit;
  }
  if(run<350 && prefix===''){
   const i=rand()%(N-1);
   if(path[i]===path[i+1])continue;
   const alt=path.slice();[alt[i],alt[i+1]]=[alt[i+1],alt[i]];
   const after=inspect(alt,'');
   let diff=0;
   for(let k=0;k<N;k++)if(base.own[k]!==after.own[k])diff++;
   stats.distinctColumnAdjacentSwapChecks++;
   if(diff!==2){stats.wrongAdjacentSwap++;throw Error('two-event XOR phase swap failed');}
  }
 }
}
stats.seedEnd=seed;
console.log(JSON.stringify(stats));
