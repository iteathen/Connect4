// Original q ONLY. Exact owner-color shuffle feasibility for ONE nontrivial
// gravity column chain + each remaining selected original column used ONCE.
// Theorem frozen in docs/research/2026-10-18-exact-single-chain-singleton-colored-shuffle-elimination.md
// Never enumerates future words, alternative q games or adversarial policies.
export function createOneChainSingletonPhaseRealizer({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid original gravity geometry');
 const N=W*H,bit=z=>1n<<BigInt(z),id=(c,r)=>r*W+c,
  pop=m=>{let z=0;for(;m;m&=m-1n)z++;return z;};
 const minAntichain=(xs)=>{
  const uniq=[...new Set(xs)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const out=[];for(const G of uniq)if(!out.some(Z=>(G&Z)===Z))out.push(G);
  return out;
 };
 function compute(q,{chainColumn,L,singletonColumns,chainOwners,singletonOwners}={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||h.some(x=>!Number.isInteger(x)||x<0||x>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1)||
   [...q.R0,...q.R1].some(x=>typeof x!=='bigint'||x<=0n))
   throw Error('genuine nonterminal original q=(h,R0,R1) required');
  const n=h.reduce((a,b)=>a+b,0);
  if(n>=N)throw Error('full original root');
  const meta={sourceRootPly:n,
   sourceRootMover:n&1,originalRCounts:[q.R0.length,q.R1.length],
   operations:{sourceSingleChainParityTransitions:0,
    sourceOriginalGeneratorSubsetChecks:0,
    sourceFutureStrategicGameValuesEvaluated:0,
    sourceFutureGameTreeNodesConstructed:0,
    sourceAlternativeFutureWordsEnumerated:0,
    constructedCanonicalPhysicalSegmentWords:0}};
  const valid=Number.isInteger(chainColumn)&&chainColumn>=1&&chainColumn<=W&&
   Number.isInteger(L)&&L>=1&&h[chainColumn-1]+L<=H&&
   Array.isArray(singletonColumns)&&Array.isArray(chainOwners)&&
   Array.isArray(singletonOwners)&&singletonOwners.length===singletonColumns.length&&
   chainOwners.length===L&&singletonColumns.every(c=>Number.isInteger(c)&&c>=1&&c<=W&&c!==chainColumn&&h[c-1]<H)&&
   new Set(singletonColumns).size===singletonColumns.length&&
   [...chainOwners,...singletonOwners].every(x=>x===0||x===1);
  if(!valid)return {status:'INCOMPLETE_INVALID_GUARDS_OR_PHYSICAL_EVENTS',...meta};
  const s=singletonColumns.length,T=L+s,quota=[0,0],wanted=[0,0];
  for(let t=0;t<T;t++)quota[(n+t)&1]++;
  for(const p of [...chainOwners,...singletonOwners])wanted[p]++;
  const epsilon=[],gaps=Array(L+1).fill(0);
  for(let j=0;j<L;j++){
   const e=chainOwners[j]^((n+j)&1);
   epsilon.push(e);
   gaps[j]=j===0?e:e^epsilon[j-1];
   meta.operations.sourceSingleChainParityTransitions++;
  }
  const M=gaps.slice(0,L).reduce((a,b)=>a+b,0);
  const base={...meta,
   chainColumn,chainNextPhysicalEvents:L,
   singletonColumns:singletonColumns.slice(),
   chainDesiredPhysicalOwnerBits:chainOwners.slice(),
   singletonDesiredPhysicalOwnerBits:singletonOwners.slice(),
   originalSegmentEvents:T,phasePrefixEpsilon:epsilon,
   sourceMinimumSingletonPrefixPhaseTransitions:M,
   sourceAvailableDistinctSingletonEvents:s,
   sourceColorQuotas:quota,sourceDesiredColorCounts:wanted,
   sourceFixedWinnerFlagsNotGameValue:null,
   sourceRootPerfectWDL:null,sourceLevel2BestOriginalColumn:null};
  if(wanted[0]!==quota[0]||wanted[1]!==quota[1])
   return {status:'SOURCE_PROVEN_OWNER_PROJECTION_NOT_REALIZABLE',
    reason:'TOTAL_OWNER_CLOCK_QUOTAS_MISMATCH',...base};
  if(M>s)
   return {status:'SOURCE_PROVEN_OWNER_PROJECTION_NOT_REALIZABLE',
    reason:'INSUFFICIENT_SINGLETONS_FOR_REQUIRED_CHAIN_PREFIX_PHASE_TRANSITIONS',...base};
  gaps[L]=s-M;
  const remaining=[[],[]];
  for(let j=0;j<s;j++)remaining[singletonOwners[j]].push(singletonColumns[j]);
  for(const bucket of remaining)bucket.sort((a,b)=>a-b);
  const template=[];
  for(let j=0;j<L;j++){
   for(let k=0;k<gaps[j];k++)template.push(null);
   template.push(chainColumn);
  }
  for(let k=0;k<gaps[L];k++)template.push(null);
  if(template.length!==T)throw Error('exact canonical phase-template capacity error');
  const canonical=[];
  for(let j=0,seenC=0;j<template.length;j++){
   const owner=(n+j)&1;
   if(template[j]===null){
    if(!remaining[owner].length)throw Error('mathematical phase/quota theorem contradicted');
    canonical.push(remaining[owner].shift());
   } else {
    if(chainOwners[seenC++]!==owner)throw Error('mathematical c-chain phase assignment contradicted');
    canonical.push(chainColumn);
   }
  }
  if(remaining[0].length||remaining[1].length)
   throw Error('owner assignment left unused singleton events');
  meta.operations.constructedCanonicalPhysicalSegmentWords=1;
  const A=[0n,0n];
  for(let j=0;j<L;j++)A[chainOwners[j]]|=bit(id(chainColumn-1,h[chainColumn-1]+j));
  for(let j=0;j<s;j++)A[singletonOwners[j]]|=bit(id(singletonColumns[j]-1,h[singletonColumns[j]-1]));
  if((A[0]&A[1])!==0n)throw Error('physical cells improperly double owned');
  const complete=[false,false];
  for(let p=0;p<2;p++)for(const G of p===0?q.R0:q.R1){
   meta.operations.sourceOriginalGeneratorSubsetChecks++;
   if((G&~A[p])===0n)complete[p]=true;
  }
  const afterH=h.slice();afterH[chainColumn-1]+=L;
  for(const c of singletonColumns)afterH[c-1]++;
  const withCanonical={...base,sourceMinimalGapLengths:gaps,
    oneSourceCanonicalGravityLegalSegment:canonical,
    originalPhysicalOwnerMasksHex:A.map(x=>'0x'+x.toString(16)),
    sourceFixedWinnerFlagsNotGameValue:complete,
    afterOriginalHeights:afterH,
    originalSourceNoAlternativeWordEnumeration:true,
    originalRootOrdinaryWDL:null,
    originalBestLevel2Column:null,
    operations:meta.operations};
  if(complete[0]&&complete[1])
   return {status:'SOURCE_FEASIBLE_PHASE_BUT_INCOMPLETE_DUAL_COMPLETION_RACE',...withCanonical};
  if(complete[0]||complete[1])
   return {status:'SOURCE_FEASIBLE_FIXED_SEGMENT_SINGLE_FIRST_WINNER',
    fixedSegmentFirstWinner:complete[0]?0:1,...withCanonical};
  if(afterH.every(z=>z===H))
   return {status:'SOURCE_FEASIBLE_FIXED_SEGMENT_FULL_DRAW',
    fixedSegmentFirstWinner:null,...withCanonical};
  const Rnew=[0,1].map(p=>{
   const own=A[p],opp=A[1-p],R=p===0?q.R0:q.R1,raw=[];
   for(const G of R)if((G&opp)===0n){
    const m=G&~own;
    if(m===0n)throw Error('owner first WIN missed by source');
    raw.push(m);
   }
   return minAntichain(raw);
  });
  return {status:'SOURCE_FEASIBLE_PHASE_AND_EXACT_NONTERMINAL_BATCH_Q',
   exactOrientedAfterSegmentQ:{h:afterH.slice(),R0:Rnew[0],R1:Rnew[1]},
   sourceFutureGameObjectsConstructed:1,...withCanonical};
 }
 return Object.freeze({compute});
}
