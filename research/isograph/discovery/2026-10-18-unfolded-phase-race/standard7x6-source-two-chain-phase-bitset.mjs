// PURE ORIGINAL current q=(h,R0,R1) two nontrivial columns, with a FIXED
// per-physical-event owner coloring. Exact source-only Boolean antidiagonal
// phase feasibility + COMPLETE fixed-profile first-head set. Theorem frozen:
// docs/research/2026-10-18-two-chain-boolean-antidiagonal-phase-convolution.md
// NO strategically inequivalent future game WDL, no ordinary q child,
// no hypothetical alternative word enumeration. ONE canonical supplied-profile
// schedule is materialized only AFTER suffix-bitset feasibility proof.
export function createOriginalTwoChainPhaseBitset({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
     K>Math.min(W,H)||W*H>42)throw Error('invalid W,H,K gravity game');
 const N=W*H,id=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z);
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 const minAntichain=raw=>{
  const unique=[...new Set(raw)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const m of unique)if(!out.some(k=>(m&k)===k))out.push(m);
  return out;
 };
 function inspect(q){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||h.some(z=>!Number.isInteger(z)||z<0||z>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1)||
   [...q.R0,...q.R1].some(z=>typeof z!=='bigint'||z<=0n))
   throw Error('nonterminal orientation-sensitive original q required');
  const n=h.reduce((s,z)=>s+z,0);
  if(n>=N)throw Error('original root already full');
  let future=0n;
  for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bit(id(c,r));
  for(const G of [...q.R0,...q.R1])if((G&~future)!==0n)
   throw Error('original residual generator contains nonfuture physical cell');
  return n;
 }
 function compute(q,{columnA,columnB,ownersA,ownersB}={}){
  const n=inspect(q),h=q.h;
  const valid=Number.isInteger(columnA)&&Number.isInteger(columnB)&&
   columnA>=1&&columnA<=W&&columnB>=1&&columnB<=W&&columnA!==columnB&&
   Array.isArray(ownersA)&&Array.isArray(ownersB)&&
   ownersA.length>0&&ownersB.length>0&&
   h[columnA-1]+ownersA.length<=H&&h[columnB-1]+ownersB.length<=H&&
   [...ownersA,...ownersB].every(z=>z===0||z===1);
  const ops={originalSourceCurrentRootMaskChecks:0,
   originalAntidiagonalMembershipChecks:0,booleanAntidiagonalBitsetFusions:0,
   numberOfFutureGravityWordsEnumerated:0,
   numberOfStrategicallyDistinctFutureGamesValued:0,
   numberOfStrategicFutureQChildrenConstructed:0,
   sourceBacktrackingOrAlternativePolicyPaths:0,
   sourceCanonicalWordConstructed:0};
  if(!valid)return {status:'INCOMPLETE_INVALID_GUARDS',reason:'TWO_DISTINCT_ROOT_LEGAL_NONEMPTY_CHAIN_COLOR_WORDS_REQUIRED',
   originalRootWDL:null,originalLevel2BestColumn:null,
   exactFixedProfileFirstHeadColumns:null,operations:ops};
  const A=ownersA.length,B=ownersB.length,T=A+B;
  const quota=[0,0],request=[0,0];
  for(let k=0;k<T;k++)quota[(n+k)&1]++;
  for(const z of [...ownersA,...ownersB])request[z]++;
  const original={
   kind:'ORIGINAL_TWO_CHAIN_BOOLEAN_ANTIDIAGONAL_PHASE_CONVOLUTION',
   originalRootPly:n,originalRootMover:n&1,
   originalRootRCounts:[q.R0.length,q.R1.length],
   columnA,columnB,A,B,T,
   inputOriginalColumnOwnerBitsA:ownersA.slice(),
   inputOriginalColumnOwnerBitsB:ownersB.slice(),
   requiredGlobalColorQuota:quota,
   suppliedTargetColorCount:request,
   sourceOriginalWDL:null,sourceLevel2BestOriginalColumn:null};
  if(request[0]!==quota[0]||request[1]!==quota[1])
   return {status:'SOURCE_PROVEN_OWNER_PROJECTION_NOT_REALIZABLE',
    reason:'GLOBAL_ALTERNATING_OWNER_QUOTAS_DIFFER',...original,
    exactFixedProfileFirstHeadColumns:[],operations:ops};
  const ahead=[],bhead=[];
  for(let k=0;k<T;k++){
   let ma=0n,mb=0n;
   for(let i=Math.max(0,k-B);i<=Math.min(A,k);i++){
    const j=k-i,p=(n+k)&1,flag=bit(i);
    if(i<A){
     ops.originalAntidiagonalMembershipChecks++;
     if(ownersA[i]===p)ma|=flag;
    }
    if(j<B){
     ops.originalAntidiagonalMembershipChecks++;
     if(ownersB[j]===p)mb|=flag;
    }
   }
   ahead.push(ma);bhead.push(mb);
  }
  const suffix=Array(T+1).fill(0n);
  suffix[T]=bit(A);
  for(let k=T-1;k>=0;k--){
   suffix[k]=((suffix[k+1]>>1n)&ahead[k])|(suffix[k+1]&bhead[k]);
   ops.booleanAntidiagonalBitsetFusions++;
  }
  const reachable=(suffix[0]&1n)!==0n;
  const suffixHex=suffix.map(m=>'0x'+m.toString(16));
  const shared={...original,
   sourceBackwardSuffixViabilityHex:suffixHex,
   sourceAntidiagonalAEligibleHex:ahead.map(m=>'0x'+m.toString(16)),
   sourceAntidiagonalBEligibleHex:bhead.map(m=>'0x'+m.toString(16)),
   sourceResourceBitsetMaximumWidth:A+1,
   sourceFixedColorProjectionFeasible:reachable,
   operations:ops};
  if(!reachable)
   return {status:'SOURCE_PROVEN_OWNER_PROJECTION_NOT_REALIZABLE',
    reason:'JOINT_TWO_CHAIN_PHASE_PREFIX_DEADLOCK',
    ...shared,exactFixedProfileFirstHeadColumns:[]};
  const p0=n&1,heads=[];
  if(ownersA[0]===p0&&(suffix[1]&bit(1))!==0n)heads.push(columnA);
  if(ownersB[0]===p0&&(suffix[1]&1n)!==0n)heads.push(columnB);
  heads.sort((a,b)=>a-b);
  if(!heads.length)throw Error('source phase proof feasible yet no legal first head');
  const word=[],counts=[0,0];
  for(let k=0;k<T;k++){
   const i=counts[0],j=counts[1],p=(n+k)&1;
   const canA=i<A&&ownersA[i]===p&&(suffix[k+1]&bit(i+1))!==0n;
   const canB=j<B&&ownersB[j]===p&&(suffix[k+1]&bit(i))!==0n;
   if(!canA&&!canB)throw Error('source suffix-bitset canonical witness invariant failed');
   const takeA=canA&&(!canB||columnA<columnB);
   word.push(takeA?columnA:columnB);
   counts[takeA?0:1]++;
  }
  if(counts[0]!==A||counts[1]!==B)
   throw Error('source canonical word did not use exact prescribed gravity events');
  ops.sourceCanonicalWordConstructed=1;
  const owners=[0n,0n];
  for(let i=0;i<A;i++)owners[ownersA[i]]|=bit(id(columnA-1,h[columnA-1]+i));
  for(let j=0;j<B;j++)owners[ownersB[j]]|=bit(id(columnB-1,h[columnB-1]+j));
  if((owners[0]&owners[1])!==0n)throw Error('two distinct gravity columns have overlapping owner cells');
  const flags=[false,false];
  for(let owner=0;owner<2;owner++)for(const G of owner===0?q.R0:q.R1){
   ops.originalSourceCurrentRootMaskChecks++;
   if((G&~owners[owner])===0n)flags[owner]=true;
  }
  const hAfter=h.slice();hAfter[columnA-1]+=A;hAfter[columnB-1]+=B;
  const result={...shared,
   exactFixedProfileFirstHeadColumns:heads,
   sourceFixedProfileUniqueHead:heads.length===1,
   sourceConstructedOneCanonicalGravityWord:word,
   sourcePhysicalEventAllocationMasksHex:owners.map(m=>'0x'+m.toString(16)),
   sourcePossibleOwnerCompletionFlags:flags,
   originalHeightsAfterSegment:hAfter,
   sourceNoGameWDLComputed:true};
  if(flags[0]&&flags[1])
   return {status:'SOURCE_FEASIBLE_BUT_DUAL_FIRST_WIN_RACE_INCOMPLETE',...result};
  if(flags[0]||flags[1])
   return {status:'SOURCE_FEASIBLE_FIXED_SEGMENT_SINGLE_FIRST_WINNER',
    fixedSegmentFirstWinner:flags[0]?0:1,...result};
  if(hAfter.every(z=>z===H))
   return {status:'SOURCE_FEASIBLE_FIXED_SEGMENT_FULL_BOARD_DRAW',...result};
  const after=[0,1].map(owner=>{
   const R=owner===0?q.R0:q.R1,own=owners[owner],enemy=owners[1-owner],raw=[];
   for(const G of R)if((G&enemy)===0n){
    const left=G&~own;
    if(left===0n)throw Error('source batched nonterminal generator became empty');
    raw.push(left);
   }
   return minAntichain(raw);
  });
  return {status:'SOURCE_FEASIBLE_EXACT_BATCH_NONTERMINAL_Q',
   exactOneResultingOrientedQ:{h:hAfter.slice(),R0:after[0],R1:after[1]},
   ...result};
 }
 return Object.freeze({compute});
}
