// Actual 7x6 Connect4 source payoff TWO-SWAP mixed GF2 derivative falsifier.
// Complete schedules are validation inputs, NOT perfect play or a solver.
// Frozen prior to run, original true-source history 44444, W/H/K explicit.
const W=7,H=6,K=4,N=W*H,history='44444',bit=(c,r)=>1n<<BigInt(r*W+c);
const lines=[],incident=Array.from({length:N},()=>[]);
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
 const cc=c+(K-1)*dc,rr=r+(K-1)*dr;if(cc>=W||rr<0||rr>=H)continue;
 const cells=Array.from({length:K},(_,i)=>[(c+i*dc),(r+i*dr)]);
 const mask=cells.reduce((z,[x,y])=>z|bit(x,y),0n);
 const line={mask,cells};
 lines.push(line);
 for(const [x,y] of cells)incident[y*W+x].push(line);
}
if(lines.length!==69)throw Error('wrong geometric Connect4 lines');
let seed=0x7344F012>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function makeSchedule(){
 const h=Array(W).fill(0),seq=history.split('').map(z=>Number(z)-1);
 for(const c of seq){if(h[c]++>=H)throw Error('invalid 44444 prefix');}
 while(seq.length<N){
  let legal=[];for(let c=0;c<W;c++)if(h[c]<H)legal.push(c);
  const c=legal[rand()%legal.length];seq.push(c);h[c]++;
 }
 return seq;
}
function observe(seq){
 let h=Array(W).fill(0),P=[0n,0n];
 for(let t=0;t<seq.length;t++){
  const c=seq[t],row=h[c]++,p=t%2,id=row*W+c;
  if(row>=H)throw Error('gravity overflow');
  P[p]|=bit(c,row);
  for(const line of incident[id])if((P[p]&line.mask)===line.mask)
   return {winner:p,turn:t+1,winline:line.cells.map(([x,y])=>[x+1,y+1])};
 }
 return {winner:null,turn:null,winline:null};
}
function maskOwner(seq){
 const h=Array(W).fill(0),own=Array(N).fill(-1),events=Array(seq.length);
 for(let i=0;i<seq.length;i++){
  const c=seq[i],r=h[c]++,id=r*W+c;
  if(r>=H)throw Error('bad swap gravity');
  own[id]=i%2;events[i]=id;
 }
 return {own,events};
}
function swap(seq,i){const out=seq.slice();[out[i],out[i+1]]=[out[i+1],out[i]];return out;}
function sign(w){return [Number(w.winner===0),Number(w.winner!==1)];}
let q;
{
 const h=Array(W).fill(0),P=[0n,0n];
 for(let t=0;t<history.length;t++){
  const c=Number(history[t])-1,row=h[c]++,p=t%2;
  P[p]|=bit(c,row);
 }
 const support=P[0]|P[1],R=[[],[]];
 for(let p=0;p<2;p++)for(const line of lines)
  if((line.mask&P[1-p])===0n)R[p].push(line.mask&~support);
 function pc(m){let k=0;for(;m;m&=m-1n)k++;return k;}
 function normalize(gs){
  let arr=[...new Set(gs.map(String))].map(BigInt).sort((a,b)=>pc(a)-pc(b)||(a<b?-1:a>b?1:0));
  const ret=[];for(const g of arr)if(!ret.some(z=>(g&z)===z))ret.push(g);return ret;
 }
 q={h,R:R.map(normalize)};
 if(q.R[0].length!==48||q.R[1].length!==42)throw Error('canonical source residual count mismatch');
}
function fromQ(seq){
 const h=q.h.slice(),own=Array(N).fill(-1),time=Array(N).fill(0),n=history.length;
 for(let i=n;i<N;i++){
  const c=seq[i],row=h[c]++,id=row*W+c,z=i-n;
  const rel=row-q.h[c],other=z-rel;
  own[id]=(n&1)^(rel&1)^(other&1);time[id]=z+1;
 }
 let min=Infinity,winner=null;
 for(let p=0;p<2;p++)for(const g of q.R[p]){
  let good=true,latest=0;
  for(let id=0;id<N;id++)if((g&(1n<<BigInt(id)))!==0n){
   if(own[id]!==p){good=false;break;}
   latest=Math.max(latest,time[id]);
  }
  if(good&&latest<min){min=latest;winner=p;}
 }
 const turn=Number.isFinite(min)?min+n:null;
 if(winner!==null&&winner!==((turn-1)&1))throw Error('bad source parity terminal');
 return {winner,turn};
}
const stats={schema:'connect4.standard7x6.gf2_independent_legal_order_swaps_v0_1',
 date:'2026-10-17',geometry:{W,H,K,lines:69},history,
 seedStart:seed,schedulesChecked:0,validTwoSwapPlaquettes:0,
 mixedDerivativeP0Win:0,mixedDerivativeP0Nonloss:0,mixedDerivativeAny:0,
 referenceQPayoffChecks:0,sourceVsPhysicalMismatches:0,
 swapOwnerMaskChecks:0,invalidGravitySwaps:0,
 firstCurvatureWitness:null,strategicGameFutureValuesEvaluated:0,
 disclaimer:'Exhaustive source proof of strategic zero-loci NOT attempted; sampled 4-corner fixed schedules are falsification of affine payoff only.'};
for(let sample=0;sample<18000;sample++){
 const seq=makeSchedule();stats.schedulesChecked++;
 for(let trial=0;trial<18;trial++){
  const i=history.length+(rand()%23);
  const j=i+2+(rand()%Math.max(1,36-i));
  if(j>=N-1||seq[i]===seq[i+1]||seq[j]===seq[j+1])continue;
  const ss=[seq,swap(seq,i),swap(seq,j),swap(swap(seq,i),j)];
  const w=ss.map(observe),v=w.map(sign);
  stats.validTwoSwapPlaquettes++;
  const plus=v[0][0]^v[1][0]^v[2][0]^v[3][0];
  const nonloss=v[0][1]^v[1][1]^v[2][1]^v[3][1];
  if(plus)stats.mixedDerivativeP0Win++;
  if(nonloss)stats.mixedDerivativeP0Nonloss++;
  if(plus||nonloss)stats.mixedDerivativeAny++;
  if(!stats.firstCurvatureWitness&&(plus||nonloss)){
   const own=ss.map(maskOwner),orig=own[0].own;
   for(let k=1;k<4;k++){
    const n=own[k].own.filter((x,id)=>x!==orig[id]).length;
    const needed=k===3?4:2;
    if(n!==needed)throw Error('adjacent swap did not toggle expected event-owner bits');
    stats.swapOwnerMaskChecks++;
   }
   for(let k=0;k<4;k++){
    const src=fromQ(ss[k]);stats.referenceQPayoffChecks++;
    if(src.winner!==w[k].winner||src.turn!==w[k].turn){
     stats.sourceVsPhysicalMismatches++;throw Error('physical winner vs source q XOR mismatch');
    }
   }
   const cellsA=[own[0].events[i],own[0].events[i+1]];
   const cellsB=[own[0].events[j],own[0].events[j+1]];
   let commonResidual=0;
   for(const G of [...q.R[0],...q.R[1]]){
    const touches=(ids)=>ids.some(id=>(G&(1n<<BigInt(id)))!==0n);
    if(touches(cellsA)&&touches(cellsB))commonResidual++;
   }
   stats.firstCurvatureWitness={
    absoluteOneBasedSwapTurns:[i+1,j+1],
    sourceAndFourHypotheticalCompleteSchedules:ss.map(s=>s.map(c=>c+1).join('')),
    eachFirstWin:w,mixedDerivative:{P0Win:plus,P0Nonloss:nonloss},
    firstSwapCellIdsZeroBased:cellsA,secondSwapCellIdsZeroBased:cellsB,
    residualGeneratorsTouchingBothSwapPairs:commonResidual,
    allFourSchedulesShareExactSourceQ:true,
    earliestFirstWinPhysicalMatchesSourceGF2:true
   };
  }
 }
}
stats.seedFinal=seed;
console.log(JSON.stringify(stats,null,2));
