// FROZEN INDEPENDENT original W7 H6 K4 PHYSICAL 69-line minimax
// and SAME-Q frozen V4 reference benchmark, AFTER pure SOURCE candidate
// packet committed. Physical recursive WDL is VALIDATION ONLY, NEVER used
// to generate source order edges, maps or strategy-congruence hypotheses.
// Source oracle runs on one SOURCE root without future child values.
// Per-root PHYSICAL budget exhaustion => INCOMPLETE, never PASS.
export function checkFrozenUniformReplyFiberCandidates(frozenPacket,{
 createUniformSource,
 createV4Source,
 maxPhysicalUniqueStatesPerRoot=250000,
 maxV4MsPerRoot=500,
 maxV4OperationsPerRoot=180000
}={}){
 if(!frozenPacket||frozenPacket.stats?.sampledFirstWinFreeOriginalQ!==12500||
    frozenPacket.stats?.sourceNewBestRootCandidateCount!==12||
    !Array.isArray(frozenPacket.newOnePlyMarginalOrderCandidates)||
    !Array.isArray(frozenPacket.sourceNewBestCandidates)||
    frozenPacket.stats.rootsWithAtLeastOneNewDirectSourceWeakOrderEdge!==
     frozenPacket.newOnePlyMarginalOrderCandidates.length)
  throw Error('missing immutable exact SOURCE-only original candidate input, physical validation prohibited');
 if(typeof createUniformSource!=='function'||typeof createV4Source!=='function')
  throw Error('source proof factory and maintained V4 SOURCE factory required');
 const W=7,H=6,N=42,id=(c,r)=>7*r+c,bit=z=>1n<<BigInt(z);
 const lines=[],incident=Array.from({length:N},()=>[]);
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const cc=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(!cc.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))continue;
  const cells=cc.map(([x,y])=>id(x,y));
  lines.push(cells);
  for(const z of cells)incident[z].push(cells);
 }
 if(lines.length!==69)throw Error('PHYSICAL control not original 69 winning lines');
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 const normalize=raw=>{
  const unique=[...new Set(raw)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const G of unique)if(!out.some(F=>(G&F)===F))out.push(G);
  return out;
 };
 function rootPhysical(history){
  const h=Array(7).fill(0),board=Array(42).fill(-1);
  const owners=[0n,0n];
  for(let k=0;k<history.length;k++){
   const c=Number(history[k])-1,p=k&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)
    throw Error('immutable SOURCE candidate history illegal original gravity');
   const z=id(c,h[c]++);board[z]=p;owners[p]|=bit(z);
   if(incident[z].some(L=>L.every(i=>board[i]===p)))
    throw Error('immutable source history physically crosses first original winning line');
  }
  const occupied=owners[0]|owners[1];
  const residual=[0,1].map(p=>{
   const raw=[];
   for(const L of lines){
    if(L.some(z=>board[z]===1-p))continue;
    let G=0n;
    for(const z of L)if(board[z]===-1)G|=bit(z);
    if(G===0n)throw Error('a frozen SOURCE root has a completed original winning line');
    raw.push(G);
   }
   return normalize(raw);
  });
  return {h,board,owners,ply:history.length,q:{h:h.slice(),R0:residual[0],R1:residual[1]}};
 }
 class BudgetExceeded extends Error{}
 function fullPhysicalRootActionValues(root){
  const h=root.h.slice(),board=root.board.slice(),stone=root.owners.slice();
  const memo=new Map();
  const stats={recursiveCalls:0,uniquePhysicalStates:0,memoHits:0,physicalOriginalMovesExamined:0,
   physicalFirstWinTerminalEdges:0};
  const winnerFor=(p,z)=>incident[z].some(L=>L.every(i=>board[i]===p));
  function solve(n){
   stats.recursiveCalls++;
   const key=stone[0].toString(16)+'|'+stone[1].toString(16);
   const cached=memo.get(key);
   if(cached!==undefined){stats.memoHits++;return cached;}
   if(stats.uniquePhysicalStates>=maxPhysicalUniqueStatesPerRoot)
    throw new BudgetExceeded('PHYSICAL WDL unique-state reference budget exhausted');
   stats.uniquePhysicalStates++;
   const p=n&1;
   if(n===N){memo.set(key,0);return 0;}
   let value=p===0?-1:1,hasLegal=false;
   for(let c=0;c<W;c++){
    const r=h[c];if(r>=H)continue;
    hasLegal=true;stats.physicalOriginalMovesExamined++;
    const z=id(c,r),mark=bit(z);
    h[c]++;board[z]=p;stone[p]|=mark;
    let v;
    try{
     if(winnerFor(p,z)){stats.physicalFirstWinTerminalEdges++;v=p===0?1:-1;}
     else if(n+1===N)v=0;
     else v=solve(n+1);
    }finally{h[c]--;board[z]=-1;stone[p]&=~mark;}
    if(p===0){value=Math.max(value,v);if(value===1)break;}
    else {value=Math.min(value,v);if(value===-1)break;}
   }
   if(!hasLegal)value=0;
   memo.set(key,value);return value;
  }
  const actionValues={};
  const p=root.ply&1;
  for(let c=0;c<W;c++)if(h[c]<H){
   const z=id(c,h[c]),mark=bit(z);
   h[c]++;board[z]=p;stone[p]|=mark;
   let v;
   try{
    if(winnerFor(p,z)){stats.physicalFirstWinTerminalEdges++;v=p===0?1:-1;}
    else if(root.ply+1===N)v=0;
    else v=solve(root.ply+1);
   }finally{h[c]--;board[z]=-1;stone[p]&=~mark;}
   actionValues[c+1]=v;
  }
  const values=Object.values(actionValues),rootValue=p===0?Math.max(...values):Math.min(...values);
  return {actionValues,rootValue,
   exactBestOriginalLiteralColumns:Object.keys(actionValues).map(Number).filter(c=>actionValues[c]===rootValue),
   physicalStats:{...stats,cachedUniqueStates:memo.size}};
 }
 const newSource=createUniformSource({width:W,height:H,connect:4});
 const v4Source=createV4Source({width:W,height:H,connect:4});
 const bestSet=new Set(frozenPacket.sourceNewBestCandidates.map(x=>x.history));
 const result={schema:'connect4.original7x6.uniform_reply_fiber_source_new_vs_oneply_and_v4_independent_physical_v0_1',
  physicalWorld:'ORIGINAL W7 H6 K4, all 69 actual straight winning windows, first-win stops',
  candidatePacketWasFrozenBeforePhysicalReference:true, sourceCandidateCount:frozenPacket.stats.rootsWithAtLeastOneNewDirectSourceWeakOrderEdge,
  precommittedPhysicalBudget:maxPhysicalUniqueStatesPerRoot,
  V4SourceOnlyOptions:{maxV4MsPerRoot,maxV4OperationsPerRoot},
  metrics:{sourceNovelReplyFiberCandidateRoots:0,physicallyFullySolvedRoots:0,
   physicallyBudgetIncompleteRoots:0,
   physicallyCheckedNovelOriginalWdlWeakEdges:0,
   physicallyFalseSourceOriginalWdlWeakEdges:0,
   sourceNewBestRootCandidates:bestSet.size,sourceNewBestOriginalActionsPhysicallyBest:0,
   sourceNewBestOriginalActionsPhysicallyFalse:0,
   V4AlreadyCertifiedOriginalBestOnSameQ:0,
   V4IncompleteWhereNewSourceCertifiedBest:0,
   V4ErroredOrBudgetedForSameQ:0,
   actuallyNovelBestRootsBeyondFrozenV4:0,
   sourceAlternativeStrategicFutureGameWdlCalls:0},
  status:'VALIDATION_IN_PROGRESS',
  sourceBestRootCases:[],sampleWeakOrderCases:[],budgetIncompleteExamples:[],
  physicallyFalseProofCounterexamples:[]};
 for(const candidate of frozenPacket.newOnePlyMarginalOrderCandidates){
  const root=rootPhysical(candidate.history);
  if(root.ply!==candidate.n||String(root.h)!==String(candidate.headHeights))
   throw Error('original physical root differs from source frozen candidate heights');
  const sourceProof=newSource.certify(root.q);
  const expected=candidate.novelEdges.map(x=>x[0]+','+x[1]),
   actual=new Set(sourceProof.sourceWeakOriginalActionOrderEdges.map(x=>x.originalFirstActionA+','+x.originalFirstActionB));
  for(const edge of expected)if(!actual.has(edge))
   throw Error('frozen SOURCE candidate edge did not reproduce from independently built physical residual q');
  result.metrics.sourceNovelReplyFiberCandidateRoots++;
  let physical;
  try{physical=fullPhysicalRootActionValues(root);}
  catch(e){if(!(e instanceof BudgetExceeded))throw e;
   result.metrics.physicallyBudgetIncompleteRoots++;
   if(result.budgetIncompleteExamples.length<20)
    result.budgetIncompleteExamples.push({history:candidate.history,n:candidate.n,reason:'PHYSICAL_UNRESTRICTED_WDL_BUDGET'});
   continue;
  }
  result.metrics.physicallyFullySolvedRoots++;
  for(const [a,b] of candidate.novelEdges){
   const pass=physical.actionValues[a]<=physical.actionValues[b];
   result.metrics.physicallyCheckedNovelOriginalWdlWeakEdges++;
   if(!pass){
    result.metrics.physicallyFalseSourceOriginalWdlWeakEdges++;
    result.physicallyFalseProofCounterexamples.push({history:candidate.history,a,b,
     originalRootHeights:root.h,physicalActionValues:physical.actionValues,
     originalSourceRCounts:[root.q.R0.length,root.q.R1.length]});
    result.status='SOURCE_ORDER_FALSIFIED';
    return result;
   }
  }
  if(result.sampleWeakOrderCases.length<12)
   result.sampleWeakOrderCases.push({history:candidate.history,n:candidate.n,
    candidateNovelWeakEdges:candidate.novelEdges,
    physicalRootValue:physical.rootValue,
    physicalActionValues:physical.actionValues,
    physicalBestColumns:physical.exactBestOriginalLiteralColumns});
  if(!bestSet.has(candidate.history))continue;
  const selected=sourceProof.selectedOriginalBestLiteralColumn;
  const selectedValid=physical.exactBestOriginalLiteralColumns.includes(selected);
  if(selectedValid)result.metrics.sourceNewBestOriginalActionsPhysicallyBest++;
  else result.metrics.sourceNewBestOriginalActionsPhysicallyFalse++;
  let v4;
  try{
   v4=v4Source.compute(root.q,{orderOptions:{
    maxOperations:maxV4OperationsPerRoot,maxMs:maxV4MsPerRoot,maxRepresentatives:10000
   }});
  }catch(e){
   result.metrics.V4ErroredOrBudgetedForSameQ++;
   v4={status:'SOURCE_V4_ERROR',reason:String(e)};
  }
  const priorValid=v4.status==='VALID_CONTINUATION';
  if(priorValid)result.metrics.V4AlreadyCertifiedOriginalBestOnSameQ++;
  else if(v4.status==='INCOMPLETE')result.metrics.V4IncompleteWhereNewSourceCertifiedBest++;
  if(selectedValid&&v4.status==='INCOMPLETE')
   result.metrics.actuallyNovelBestRootsBeyondFrozenV4++;
  const item={history:candidate.history,originalRootPly:root.ply,rootCurrentMover:root.ply&1,
   rootHeights:root.h,originalSourceRCounts:[root.q.R0.length,root.q.R1.length],
   sourceNewBestLiteralColumn:selected,
   sourceBestProofValidUnderExactPhysicalMinimax:selectedValid,
   originalPhysicalRootWDL:physical.rootValue,
   exactPhysicalActionValues:physical.actionValues,
   physicalBestOriginalLabels:physical.exactBestOriginalLiteralColumns,
   oldV4SourceStatus:v4.status,
   oldV4SourceBestOriginalColumn:v4.selectedOriginalLiteralColumn??null,
   oldV4ProofFamily:v4.v4ProofFamily??null,
   oldV4Reason:v4.reason??v4.priorV2Reason??null,
   independentPhysicalStats:physical.physicalStats};
  result.sourceBestRootCases.push(item);
 }
 result.status=result.metrics.physicallyFalseSourceOriginalWdlWeakEdges?'SOURCE_ORDER_FALSIFIED':
  result.metrics.physicallyBudgetIncompleteRoots?'PHYSICALLY_PARTIAL_BUDGET' : 'PHYSICAL_ORDER_PASSED';
 return result;
}
