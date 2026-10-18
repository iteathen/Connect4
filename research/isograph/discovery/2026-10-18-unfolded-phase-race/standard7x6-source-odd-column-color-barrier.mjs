// Original q=(h,R0,R1) ONLY; deterministic nonlocal equal-owner color trace
// theorem frozen at docs/research/2026-10-18-odd-column-barrier-owner-shuffle-fiber-and-greedy-obstruction.md
// No future words enumerated, no game q children/alternative values materialized.
export function createSourceOddColumnColorBarrier({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<3||H<2||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid original finite gravity geometry');
 const N=W*H,bit=z=>1n<<BigInt(z),id=(c,r)=>r*W+c;
 function prove(q,{a,b,c,L}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||h.some(r=>!Number.isInteger(r)||r<0||r>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('requires original nonterminal (h,R0,R1) with positive original residuals');
  const n=h.reduce((s,v)=>s+v,0),p=n&1,o=1-p;
  if(n>=N)throw Error('terminal root unsupported');
  const ops={rootSourceWinRequirementMaskSubsetChecks:0,
    sourceAlternativeStrategicGameValues:0,sourceFutureQChildren:0,
    sourceCandidateWordEnumeration:0,sourceFutureWordOrStrategySearch:0};
  if(![a,b,c,L].every(Number.isInteger)||a<1||a>W||b<1||b>W||c<1||c>W||
    (new Set([a,b,c])).size!==3||L<1||(L&1)!==1||
    h[a-1]>=H||h[b-1]>=H||h[c-1]+L>H)
   return {status:'INCOMPLETE',reason:'THREE_DISTINCT_ROOT_COLUMNS_ODD_L_AND_GRAVITY_CAPACITY_REQUIRED',ops};
  const first=id(a-1,h[a-1]),last=id(b-1,h[b-1]);
  let Ap=bit(first)|bit(last),Ao=0n;
  for(let j=0;j<L;j++){
   const z=id(c-1,h[c-1]+j);
   if((j&1)===0)Ao|=bit(z);
   else Ap|=bit(z);
  }
  if((Ap&Ao)!==0n)throw Error('owner allocation collision');
  const A=[0n,0n];A[p]=Ap;A[o]=Ao;
  const completions=[false,false];
  for(let color=0;color<2;color++){
   const R=color===0?q.R0:q.R1;
   for(const G of R){
    ops.rootSourceWinRequirementMaskSubsetChecks++;
    if((G&~A[color])===0n)completions[color]=true;
   }
  }
  const base={kind:'TWO_ELEMENT_ODD_COLUMN_BARRIER_PHASE_FIBER',
   originalRootPly:n,originalRootHeights:h.slice(),originalMover:p,
   columns:{a,b,c},oddVerticalColumnLength:L,segmentLength:L+2,
   ownerOriginalPhysicalMaskHex:A.map(x=>'0x'+x.toString(16)),
   firstWordOneBased:a.toString()+c.toString().repeat(L)+b.toString(),
   secondWordOneBased:b.toString()+c.toString().repeat(L)+a.toString(),
   theoremAllEqualOwnerWordsInFixedMultisetExactlyTheseTwo:true,
   minimumSingleLocalWindowRequiredForTraceWordExchange:L+2,
   sourceFixedAllocationTerminalFlags:completions,
   originalRootWDL:null,originalBestLevel2Column:null,
   sourceStrategicInterleavingFactoringUnproved:true,statistics:ops};
  if(completions[0]||completions[1])
   return {status:'INCOMPLETE_POTENTIAL_FIRST_TERMINAL_INSIDE_SEGMENT',
     reason:'SOURCE_NO_WIN_BEFORE_SEGMENT_END_GUARD_FAILED',...base};
  return {status:'CERTIFIED_TWO_ONLY_SAME_OWNER_SHUFFLES_AND_IDENTICAL_NONTERMINAL_Q',
   sourceBothOriginalWordsHaveNoFirstWin:true,
   sourceBothOriginalWordsReachSameOrientedFutureQ:true,...base};
 }
 return Object.freeze({prove});
}
