// Exact original-q factor through per-column owner-color projections.
// FROZEN theorem: docs/research/2026-10-18-unfolded-column-owner-projection-batch-cofactor-quotient.md
// Each supplied word is a hypothetical fixed segment; NO game-value search.
// At most ONE resulting nonterminal source q is materialized after equality verification.
export function createOriginalColumnOwnerBatchCofactor({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid original W,H,K');
 const N=W*H,bit=z=>1n<<BigInt(z),pop=m=>{let s=0;for(;m;m&=m-1n)s++;return s;};
 const minAntichain=a=>{
  const v=[...new Set(a)].sort((x,y)=>pop(x)-pop(y)||(x<y?-1:x>y?1:0));
  const out=[];
  for(const m of v)if(!out.some(k=>(m&k)===k))out.push(m);
  return out;
 };
 function inspect(q){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||h.some(x=>!Number.isInteger(x)||x<0||x>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('requires original nonterminal q=(h,R0,R1)');
  const n=h.reduce((a,b)=>a+b,0);
  if(n>=N)throw Error('root is full');
  let future=0n;
  for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bit(r*W+c);
  if([...q.R0,...q.R1].some(m=>(m&~future)!==0n))
   throw Error('source generator not in original future support');
  return n;
 }
 function allocate(q,columns){
  const n=inspect(q);
  if(!Array.isArray(columns)||columns.length>N-n)throw Error('invalid fixed word length');
  const counts=q.h.slice(),ownerMasks=[0n,0n],ownerWords=Array.from({length:W},()=>[]);
  for(let j=0;j<columns.length;j++){
   const c=columns[j]-1;
   if(!Number.isInteger(c)||c<0||c>=W||counts[c]>=H)
    throw Error('illegal literal gravity word at '+j);
   const cell=counts[c]*W+c,p=(n+j)&1;
   ownerMasks[p]|=bit(cell);
   ownerWords[c].push(p);
   counts[c]++;
  }
  if((ownerMasks[0]&ownerMasks[1])!==0n)throw Error('overlapping owner allocations');
  return {n,segmentLength:columns.length,afterHeights:counts,
   ownerMasks,localColumnOwnerWords:ownerWords,
   operations:{suppliedWordEventsRead:columns.length,sourceGameWDLQueries:0,
    alternateStrategicGameEvaluations:0,sourceIntermediateQMaterializations:0}};
 }
 function classifyOneAllocation(q,allocated){
  const [A0,A1]=allocated.ownerMasks;
  const ownerFinish=[q.R0.some(G=>(G&~A0)===0n),q.R1.some(G=>(G&~A1)===0n)];
  const publicAllocation={
    originalPly:allocated.n,afterHeights:allocated.afterHeights,
    eventOwnerMasksHex:['0x'+A0.toString(16),'0x'+A1.toString(16)],
    columnOwnerWords:allocated.localColumnOwnerWords,
    sourceOwnerCompletionFlags:ownerFinish,
    sourceFullGameWDLNotComputed:true,sourceBestOriginalColumn:null,
    operations:{...allocated.operations,
      sourceResidualGeneratorSubsetChecks:q.R0.length+q.R1.length}
  };
  if(ownerFinish[0]&&ownerFinish[1])
   return {status:'INCOMPLETE_DUAL_COMPLETION_FIRST_WIN_RACE',
     reason:'FIRST_WINNER_DEPENDS_ON_ORIGINAL_COMPLETION_ORDER',
     ...publicAllocation};
  if(ownerFinish[0]||ownerFinish[1])
   return {status:'CERTIFIED_FIRST_WINNER_OF_ONE_SUPPLIED_EVENT_OWNER_ALLOCATION',
     fixedAllocationFirstWinningPlayer:ownerFinish[0]?0:1,
     thisIsNotOrdinaryRootWDL:true,...publicAllocation};
  if(allocated.afterHeights.every(x=>x===H))
   return {status:'CERTIFIED_FIXED_ALLOCATION_FULL_BOARD_DRAW',
    fixedAllocationFirstWinningPlayer:null,...publicAllocation};
  const batches=[q.R0,q.R1].map((R,p)=>{
   const own=allocated.ownerMasks[p],other=allocated.ownerMasks[1-p];
   const masks=[];
   for(const G of R)if((G&other)===0n){
    const remaining=G&~own;
    if(remaining===0n)throw Error('a terminal owner-generator escaped Fp');
    masks.push(remaining);
   }
   return minAntichain(masks);
  });
  return {status:'CERTIFIED_EXACT_NONTERMINAL_BATCH_ORIENTED_Q',
    fixedAllocationResultingQ:{h:allocated.afterHeights.slice(),R0:batches[0],R1:batches[1]},
    sourceMaterializedNonterminalQObjects:1,
    ...publicAllocation};
 }
 function batch(q,oneWord){
  const a=allocate(q,oneWord);
  return classifyOneAllocation(q,a);
 }
 function compare(q,word1,word2){
  const x=allocate(q,word1),y=allocate(q,word2);
  if(x.segmentLength!==y.segmentLength||
    x.ownerMasks[0]!==y.ownerMasks[0]||x.ownerMasks[1]!==y.ownerMasks[1])
   return {status:'INCOMPLETE_DIFFERENT_ORIGINAL_EVENT_OWNER_ALLOCATIONS',
    sourceOriginalWDL:null,sourceBestColumn:null,ownerAllocationEquality:false,
    sourceGameValuesComputed:0,sourceQObjectsConstructed:0};
  const res=classifyOneAllocation(q,x);
  return {...res,
   sourceTwoInputWordsSameExactOriginalColumnOwnerProjection:true,
   sourceCandidateWordComparisons:2,sourceEvaluatedStrategicallyDifferentGames:0,
   sourceNoAlternativeFutureQChildCompared:true};
 }
 return Object.freeze({allocate,batch,compare});
}
