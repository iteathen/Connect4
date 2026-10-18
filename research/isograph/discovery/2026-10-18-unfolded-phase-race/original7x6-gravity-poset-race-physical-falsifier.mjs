// ORIGINAL 7x6 physical colored board and 69 K-window independently reconstructed.
// Tests ONLY caller-supplied complete gravity schedules; source computes no future values.
// Strictly separate from original-q-gravity-poset-maximal-race-interface.mjs.
import { createGravityPosetMaximalRaceInterface } from './original-q-gravity-poset-maximal-race-interface.mjs';
export function createOriginal7x6RacePhysicalFalsifier(){
 const W=7,H=6,N=42, id=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z),windows=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const coords=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(coords.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   windows.push(coords.map(([x,y])=>id(x,y)));
 }
 if(windows.length!==69)throw Error('original winline count');
 const source=createGravityPosetMaximalRaceInterface({width:W,height:H,connect:4});
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 const norm=arr=>{
  const unique=[...new Set(arr)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  return unique.filter((v,i)=>!unique.slice(0,i).some(z=>(z&v)===z));
 };
 function fromHistory(history){
  const h=Array(W).fill(0),grid=Array(N).fill(-1);
  for(let t=0;t<history.length;t++){
   const c=Number(history[t])-1,p=t&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)throw Error('illegal physical history');
   const x=id(c,h[c]++);grid[x]=p;
   if(windows.some(L=>L.every(e=>grid[e]===p)))throw Error('history crosses first win');
  }
  const R=[];
  for(let p=0;p<2;p++){
   const a=[];
   for(const L of windows){
    if(L.some(e=>grid[e]===1-p))continue;
    const m=L.reduce((z,e)=>grid[e]===-1?z|bit(e):z,0n);
    if(m===0n)throw Error('root terminal');
    a.push(m);
   }
   R.push(norm(a));
  }
  return {h,grid,n:history.length,q:{h:h.slice(),R0:R[0],R1:R[1]}};
 }
 function testCompleteWord(root,fullFutureWord){
  const {h,grid,n,q}=fromHistory(root);
  const T=N-n;
  if(!Array.isArray(fullFutureWord)||fullFutureWord.length!==T)throw Error('requires one complete word');
  const src=source.analyze(q);
  const placementTimes=Array(N).fill(0),owners=Array(N).fill(-1);
  let first=null;
  for(let k=0;k<T;k++){
   const c=fullFutureWord[k]-1,p=(n+k)&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)throw Error('illegal word');
   const x=id(c,h[c]++);grid[x]=p;owners[x]=p;placementTimes[x]=k+1;
   if(first===null&&windows.some(L=>L.every(z=>grid[z]===p)))
    first=p;
  }
  const F=[[],[]],t=[[],[]];
  for(let p=0;p<2;p++)for(const G of p===0?q.R0:q.R1){
   let complete=true,last=0;
   for(let e=0;e<N;e++)if((G&bit(e))!==0n){
    if(owners[e]!==p){complete=false;break;}
    if(placementTimes[e]>last)last=placementTimes[e];
   }
   F[p].push(complete);t[p].push(last);
  }
  let quotientWinner=null,violations=0;
  if(F[0].some(Boolean)&&F[1].some(Boolean)){
   let earliestP0Witness=false;
   for(let i=0;i<F[0].length;i++)if(F[0][i]){
    let earlierThanAll=true;
    for(let j=0;j<F[1].length;j++)if(F[1][j]){
     const kind=src.flatPairClassRowMajor[i*F[1].length+j];
     const physicallyEarlier=t[0][i]<t[1][j];
     if(kind==='SHARED_CELL_EXCLUSION')violations++;
     if(kind==='P0_FORCED_FIRST'&&!physicallyEarlier)violations++;
     if(kind==='P1_FORCED_FIRST'&&physicallyEarlier)violations++;
     const order=kind==='P0_FORCED_FIRST'?true:kind==='P1_FORCED_FIRST'?false:physicallyEarlier;
     if(!order)earlierThanAll=false;
    }
    if(earlierThanAll){earliestP0Witness=true;break;}
   }
   quotientWinner=earliestP0Witness?0:1;
  } else if(F[0].some(Boolean))quotientWinner=0;
  else if(F[1].some(Boolean))quotientWinner=1;
  const successful=first===quotientWinner&&violations===0;
  return {successful,firstPhysicalWinner:first,quotientWinner,guard:src.status,
   sourceCrossPairs:src.sourceCrossPlayerPairsTotal,
   sourcePairClasses:src.classes,dualCompletion:F[0].some(Boolean)&&F[1].some(Boolean),
   forcedOrderViolations:violations,originalPrefix:root,
   sourceGeneratorCounts:[q.R0.length,q.R1.length],
   eventOwnerPhase:owners,rootWDLNotComputed:true};
 }
 return Object.freeze({fromHistory,testCompleteWord});
}
