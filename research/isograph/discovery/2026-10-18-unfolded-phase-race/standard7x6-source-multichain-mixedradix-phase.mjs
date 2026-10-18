// PURE original orientation-sensitive q=(h,R0,R1) static FIXED owner-color
// feasibility and FIRST-head theorem for ANY selected number r of distinct
// ascending original gravity columns. Mixed-radix bitset antidiagonal closure;
// DOES scan static resource-count tuples; NO future game value comparisons,
// NO strategy trees, NO enumeration of hypothetical full move words.
// docs/research/2026-10-18-multichain-mixed-radix-colored-shuffle-factorization.md
export function createOriginalMultichainPhaseConvolution({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
  K>Math.min(W,H)||W*H>42)throw Error('invalid original geometry');
 const N=W*H,id=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z);
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 function antichain(raw){
  const uniq=[...new Set(raw)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const G of uniq)if(!out.some(F=>(G&F)===F))out.push(G);
  return out;
 }
 function examine(q){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||h.some(z=>!Number.isInteger(z)||z<0||z>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1)||
   [...q.R0,...q.R1].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('requires genuine original nonterminal q=(h,R0,R1)');
  const n=h.reduce((a,b)=>a+b,0);if(n>=N)throw Error('full source root');
  let future=0n;
  for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bit(id(c,r));
  for(const G of [...q.R0,...q.R1])
   if((G&~future)!==0n)throw Error('original source generator outside future support');
  return n;
 }
 function compute(q,{chains}={}){
  const n=examine(q);
  const ops={staticRootResourceVectorsScanned:0,
   staticOriginalPhysicalColorHeadChecks:0,
   booleanSourceLayerShiftORFusions:0,
   sourceHypotheticalFutureMoveWordsEnumerated:0,
   sourceStrategicallyInequivalentFutureGamesValued:0,
   sourceOpponentPoliciesOrGameTreesGenerated:0,
   sourceNonStrategicCanonicalWordConstructed:0,
   sourceOriginalRSubsetChecks:0};
  const valid=Array.isArray(chains)&&chains.length>=1&&chains.length<=W&&
   chains.every(x=>Number.isInteger(x?.column)&&x.column>=1&&x.column<=W&&
    Array.isArray(x.owners)&&x.owners.length>=1&&
    q.h[x.column-1]+x.owners.length<=H&&
    x.owners.every(v=>v===0||v===1))&&
   new Set(chains.map(x=>x.column)).size===chains.length;
  if(!valid)return {status:'INCOMPLETE_INVALID_ORIGINAL_COLUMN_OWNER_PROFILE',
   exactFixedProfileFirstHeadColumns:null,sourceRootWDL:null,sourceLevel2BestOriginalColumn:null,operations:ops};
  const r=chains.length,m=chains.map(x=>x.owners.length),T=m.reduce((a,b)=>a+b,0);
  const strides=[],last=r-1;
  let width=1;
  for(let d=0;d<last;d++){strides[d]=width;width*=m[d]+1;}
  strides[last]=0;
  let finalIndex=0;
  for(let d=0;d<last;d++)finalIndex+=m[d]*strides[d];
  if(finalIndex>=width)throw Error('original mixed radix final index outside resource width');
  const ownerQuota=[0,0],targetQuota=[0,0];
  for(let k=0;k<T;k++)ownerQuota[(n+k)&1]++;
  for(const ch of chains)for(const owner of ch.owners)targetQuota[owner]++;
  const base={kind:'SOURCE_MIXED_RADIX_MULTICHAIN_FIXED_COLOR_PHASE_CONVOLUTION',
   originalRootPly:n,originalRootMover:n&1,selectedOriginalColumnCount:r,
   selectedOriginalColumnOwnerProfiles:chains.map(ch=>({column:ch.column,owners:ch.owners.slice()})),
   sourceFixedSegmentEventCount:T,
   sourceStaticBitsetResourceWidth:width,
   sourceRequiredOwnerClockQuotas:ownerQuota,
   sourceRequestedEventOwnerCounts:targetQuota,
   originalSourceRCounts:[q.R0.length,q.R1.length],
   sourceOriginalRootWDL:null,sourceLevel2BestOriginalColumn:null};
  if(ownerQuota[0]!==targetQuota[0]||ownerQuota[1]!==targetQuota[1])
   return {status:'SOURCE_PROVEN_FIXED_OWNER_PROJECTION_NOT_REALIZABLE',
    reason:'ALTERNATING_OWNER_QUOTA_MISMATCH',...base,
    sourceFixedOwnerProfileFeasible:false,exactFixedProfileFirstHeadColumns:[],operations:ops};
  const prefixTuples=Array.from({length:width},(_,index)=>{
   const v=Array(last),sum={value:0};
   for(let d=0;d<last;d++){
    v[d]=Math.floor(index/strides[d])%(m[d]+1);
    sum.value+=v[d];
   }
   return {v,sum:sum.value};
  });
  const M=Array.from({length:T},()=>Array(r).fill(0n));
  for(let k=0;k<T;k++){
   const owner=(n+k)&1;
   for(let index=0;index<width;index++){
    ops.staticRootResourceVectorsScanned++;
    const c=prefixTuples[index],lastCount=k-c.sum;
    if(lastCount<0||lastCount>m[last])continue;
    const mark=bit(index);
    for(let d=0;d<r;d++){
     const used=d===last?lastCount:c.v[d];
     if(used>=m[d])continue;
     ops.staticOriginalPhysicalColorHeadChecks++;
     if(chains[d].owners[used]===owner)M[k][d]|=mark;
    }
   }
  }
  const suffix=Array(T+1).fill(0n);
  suffix[T]=bit(finalIndex);
  for(let k=T-1;k>=0;k--){
   let next=0n;
   for(let d=0;d<r;d++){
    next|=((suffix[k+1]>>BigInt(strides[d]))&M[k][d]);
    ops.booleanSourceLayerShiftORFusions++;
   }
   suffix[k]=next;
  }
  const viable=(suffix[0]&1n)!==0n;
  const shared={...base,sourceFixedOwnerProfileFeasible:viable,
   sourceFirstBitOfFullSuffix:(suffix[0]&1n)!==0n,
   sourceBitsetSuffixHexWhenWidthAtMost128:width<=128?suffix.map(z=>'0x'+z.toString(16)):null,
   operations:ops};
  if(!viable)return {status:'SOURCE_PROVEN_FIXED_OWNER_PROJECTION_NOT_REALIZABLE',
   reason:'JOINT_MULTICHAIN_COLOR_PARITY_PREFIX_INFEASIBLE',
   ...shared,exactFixedProfileFirstHeadColumns:[]};
  const heads=[];
  for(let d=0;d<r;d++){
   if(chains[d].owners[0]===(n&1)&&(suffix[1]&bit(strides[d]))!==0n)
    heads.push(chains[d].column);
  }
  heads.sort((a,b)=>a-b);
  if(!heads.length)throw Error('valid source phase but no legal first head');
  const selectedPositions=Array(r).fill(0),canonical=[];
  let encoded=0;
  for(let k=0;k<T;k++){
   let next=null;
   for(let d=0;d<r;d++){
    if(selectedPositions[d]===m[d]||chains[d].owners[selectedPositions[d]]!==((n+k)&1))continue;
    const after=encoded+strides[d];
    if((suffix[k+1]&bit(after))===0n)continue;
    if(next===null||chains[d].column<chains[next].column)next=d;
   }
   if(next===null)throw Error('source fixed profile suffix violated while building ONE legal witness');
   canonical.push(chains[next].column);
   encoded+=strides[next];selectedPositions[next]++;
  }
  if(encoded!==finalIndex||selectedPositions.some((z,i)=>z!==m[i]))
   throw Error('source mixed radix physically legal witness missing a required chain event');
  ops.sourceNonStrategicCanonicalWordConstructed=1;
  const alloc=[0n,0n],afterH=q.h.slice();
  for(const ch of chains){
   const c=ch.column-1;
   for(let z=0;z<ch.owners.length;z++)
    alloc[ch.owners[z]]|=bit(id(c,q.h[c]+z));
   afterH[c]+=ch.owners.length;
  }
  if((alloc[0]&alloc[1])!==0n)throw Error('physical owner allocations not disjoint');
  const ownerWinning=[false,false];
  for(let p=0;p<2;p++)for(const G of p===0?q.R0:q.R1){
   ops.sourceOriginalRSubsetChecks++;
   if((G&~alloc[p])===0n)ownerWinning[p]=true;
  }
  const details={...shared,exactFixedProfileFirstHeadColumns:heads,
   fixedColorProfileUniqueFeasibleFirstColumn:heads.length===1,
   oneDeterministicallyConstructedLegalGravityWord:canonical,
   originalOwnerSegmentMaskHex:alloc.map(z=>'0x'+z.toString(16)),
   fixedOriginalOwnerWinlineCompletionFlags:ownerWinning,
   afterOriginalHeights:afterH,
   sourceOnlyOneFixedColorAllocationExamined:true};
  if(ownerWinning[0]&&ownerWinning[1])
   return {status:'SOURCE_FEASIBLE_DUAL_ORIGINAL_FIRST_WIN_RACE_INCOMPLETE',...details};
  if(ownerWinning[0]||ownerWinning[1])
   return {status:'SOURCE_FEASIBLE_FIXED_SEGMENT_SINGLE_FIRST_WINNER',
    sourceFixedSegmentFirstWinner:ownerWinning[0]?0:1,...details};
  if(afterH.every(z=>z===H))
   return {status:'SOURCE_FEASIBLE_FULL_BOARD_DRAW',...details};
  const R=[0,1].map(p=>{
   const raw=[],old=p===0?q.R0:q.R1;
   for(const G of old)if((G&alloc[1-p])===0n){
    const m=G&~alloc[p];
    if(m===0n)throw Error('source fixed profile win missed in batch q');
    raw.push(m);
   }
   return antichain(raw);
  });
  return {status:'SOURCE_FEASIBLE_EXACT_ORIGINAL_NONTERMINAL_BATCH_Q',
   exactOneOrientedResultQ:{h:afterH.slice(),R0:R[0],R1:R[1]},
   ...details};
 }
 return Object.freeze({compute});
}
