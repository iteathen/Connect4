// Frozen October 18 2026: K-1-column STATIC no-K-line coloring transfer.
// Mathematical theorem: docs/research/2026-10-18-k-column-transfer-static-draw-boundary-and-strategic-gap.md
// This producer does NOT evaluate legal move sequences, adaptive choices,
// first-win timing, recursively solved states, oracle WDL or strategy policies.
// It determines only the possible P0 stone counts in STATIC full-board
// colorings containing no horizontal/vertical/diagonal monochrome K-window.
// Such a coloring need not be attainable by alternating gravity play.
export function createStaticKColumnDrawTransfer({height:H,connect:K,maxBoundaryBits=20}){
 if(![H,K,maxBoundaryBits].every(Number.isInteger)||H<1||H>20||K<2||
    maxBoundaryBits<1||H*(K-1)>maxBoundaryBits)
  throw Error('static transfer resource envelope exceeded; geometry theorem remains general');
 const M=1<<H,B=M-1,hi=Math.pow(M,K-2);
 const pop=new Uint8Array(M),valid=[];
 for(let s=0;s<M;s++){
  pop[s]=s?pop[s>>1]+(s&1):0;
  let bad=false;
  for(let r=0;r+K<=H;r++){
   const v=(s>>r)&((1<<K)-1);
   if(v===0||v===(1<<K)-1){bad=true;break;}
  }
  if(!bad)valid.push(s);
 }
 const widthMask=(1<<Math.min(H*(K-1),30))-1;
 const allowedMemo=new Map();
 function crossAllowed(state,newMask) {
  const words=[];
  for(let i=0;i<K-1;i++)words.push(Math.floor(state/Math.pow(M,i))%M);
  words.push(newMask);
  // Exact original horizontal K-lines spanning these K columns.
  let andOnes=B,andZeros=B;
  for(const x of words){andOnes&=x;andZeros&=B^x;}
  if((andOnes|andZeros)!==0)return false;
  // Exact original ascending and descending K-line windows.
  for(let r=0;r+K<=H;r++){
   let up0=0,up1=0,down0=0,down1=0;
   for(let i=0;i<K;i++){
    const up=(words[i]>>(r+i))&1;
    const down=(words[i]>>(r+K-1-i))&1;
    up0+=up===0;up1+=up===1;
    down0+=down===0;down1+=down===1;
   }
   if(up0===K||up1===K||down0===K||down1===K)return false;
  }
  return true;
 }
 function nextMasks(state,priorCount) {
  if(priorCount<K-1)return valid;
  if(allowedMemo.has(state))return allowedMemo.get(state);
  const out=[];
  for(const mask of valid)if(crossAllowed(state,mask))out.push(mask);
  allowedMemo.set(state,out);
  return out;
 }
 function analyze(width,{mode='existence',maxTransfers=25000000,maxStates=1000000}={}){
  if(!Number.isInteger(width)||width<1||width*H>240)throw Error('unsupported static producer width/total bound');
  if(!['existence','coefficients'].includes(mode))throw Error('unknown static transfer mode');
  const N=width*H,target=Math.ceil(N/2),existence=mode==='existence';
  let cur=new Map([[0,existence?1n:[1n]]]);
  const stats={W:width,H,K,mode,originalPhysicalCells:N,originalGeometricWinningLines:
       H*Math.max(width-K+1,0)+width*Math.max(H-K+1,0)+
       2*Math.max(width-K+1,0)*Math.max(H-K+1,0),
    boundBoundaryBitCount:H*(K-1),verticalAllowedColumnMasks:valid.length,
    rootColumnColoringState:1,maxActiveSuffixStates:1,generatedSourceSuffixStates:0,
    sourceStaticTransitionsTested:0,sourceAcceptedTransfers:0,
    sourceAdaptivePoliciesEvaluated:0,sourceFutureGameStatesEvaluated:0,
    sourceWDLQueries:0,sourceFullBoardColoringPathsEnumerated:0,
    byWidthStep:[],resourcesComplete:true};
  function append(dst,s,mask) {
   const shift=pop[mask];
   const prev=dst.get(s);
   if(existence)dst.set(s,(prev??0n) | (1n<<BigInt(shift)));
   else {
    let poly=prev;
    if(poly===undefined){poly=[];dst.set(s,poly);}
    poly[shift]=(poly[shift]??0n)+1n;
   }
  }
  for(let c=0;c<width;c++){
   const next=new Map(),stored=Math.min(c,K-1);
   for(const [state,counts] of cur){
    for(const mask of nextMasks(state,stored)){
     stats.sourceStaticTransitionsTested++;
     if(stats.sourceStaticTransitionsTested>maxTransfers) {
      return {status:'INCOMPLETE_STATIC_TRANSFER_BUDGET',originalBoard:[width,H,K],stats};
     }
     const ns=stored<K-1 ? state+mask*Math.pow(M,stored) :
                  Math.floor(state/M)+mask*hi;
     if(ns>widthMask)throw Error('suffix state encoding overflow');
     if(existence) {
      const shifted=counts<<BigInt(pop[mask]);
      next.set(ns,(next.get(ns)??0n)|shifted);
     } else {
      let dest=next.get(ns);
      if(dest===undefined){dest=[];next.set(ns,dest);}
      for(let j=0;j<counts.length;j++){
       if(!counts[j])continue;
       dest[j+pop[mask]]=(dest[j+pop[mask]]??0n)+counts[j];
      }
     }
     stats.sourceAcceptedTransfers++;
    }
   }
   if(next.size>maxStates)return {status:'INCOMPLETE_STATIC_STATE_BUDGET',originalBoard:[width,H,K],stats};
   stats.generatedSourceSuffixStates+=next.size;
   stats.maxActiveSuffixStates=Math.max(stats.maxActiveSuffixStates,next.size);
   stats.byWidthStep.push({columnsProcessed:c+1,activeSuffixStates:next.size});
   cur=next;
  }
  if(existence){
   let all=0n;
   for(const bits of cur.values())all|=bits;
   return {status:'STATIC_K_COLUMN_TRANSFER_COMPLETE',originalBoard:[width,H,K],
    balancedTerminalFreeColoringExists:((all>>BigInt(target))&1n)===1n,
    possibleP0StoneCountBitsHex:'0x'+all.toString(16),
    p0RequiredFullDrawStoneCount:target,sourceOrdinaryWDL:null,
    stats};
  }
  const coeff=Array.from({length:N+1},()=>0n);
  for(const poly of cur.values())for(let j=0;j<poly.length;j++)
   if(poly[j])coeff[j]+=poly[j];
  return {status:'STATIC_K_COLUMN_TRANSFER_COMPLETE',originalBoard:[width,H,K],
   balancedTerminalFreeColoringExists:coeff[target]>0n,
   p0RequiredFullDrawStoneCount:target,
   coefficientValues:coeff.map(String),
   totalTerminalFreeStaticColorings:coeff.reduce((a,b)=>a+b,0n).toString(),
   sourceOrdinaryWDL:null,stats};
 }
 return Object.freeze({analyze,verticalColumnMasks:valid.slice(),height:H,connect:K});
}
