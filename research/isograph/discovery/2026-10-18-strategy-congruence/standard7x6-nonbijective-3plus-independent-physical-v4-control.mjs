// FROZEN BEFORE PHYSICAL REFERENCE WDL and legacy V4 source evaluation.
// Independent exact original 7x6 K4 69-window PHYSICAL colored grid minimax
// first-win-stopped validator for one already-frozen SOURCE-only 3+-legal q
// candidate packet. A failed source root weak action WDL order is a true
// FALSIFIER, not a reason to adjust the source theorem to fit the oracle.
// All future strategic q value recursion is in this independent control ONLY.
export function verifyFrozenNonbijective3PlusOriginalPhysical(frozen,{
 createNonbijectiveSource,createImmutableV4Source,
 maxPhysicalUniqueStatesPerRoot=220000,
 maxV4StaticOperations=180000,maxV4SourceMs=750
}={}){
 if(!Array.isArray(frozen?.chosenCandidates)||frozen.chosenCandidates.length!==58||
  frozen?.preOracleSourceStats?.trueOriginalNonterminalRootsScreened!==7000||
  frozen?.frozenScreenInputs?.minLegal!==3||
  typeof createNonbijectiveSource!=='function'||typeof createImmutableV4Source!=='function')
  throw Error('missing pre-frozen original source selection or unchanged V4 factory');
 const W=7,H=6,N=42,id=(c,r)=>7*r+c,bit=z=>1n<<BigInt(z),lines=[];
 const incident=Array.from({length:N},()=>[]);
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xy=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(xy.some(([a,b])=>a<0||a>=W||b<0||b>=H))continue;
  const cells=xy.map(([a,b])=>id(a,b));lines.push(cells);
  for(const z of cells)incident[z].push(cells);
 }
 if(lines.length!==69)throw Error('physical true original 69 K4 winning lines absent');
 const pop=m=>{let z=0;for(;m;m&=m-1n)z++;return z;};
 const antichain=a=>{
  const uniq=[...new Set(a)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const G of uniq)if(!out.some(M=>(G&M)===M))out.push(G);
  return out;
 };
 function rootFromPhysicalHistory(history){
  const h=Array(W).fill(0),board=Array(N).fill(-1),owners=[0n,0n];
  for(let t=0;t<history.length;t++){
   const c=Number(history[t])-1,p=t&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)
    throw Error('frozen original source-history illegal physical gravity');
   const z=id(c,h[c]++);board[z]=p;owners[p]|=bit(z);
   if(incident[z].some(L=>L.every(x=>board[x]===p)))
    throw Error('frozen source candidate history crosses true first WIN');
  }
  const R=[0,1].map(p=>{
   const raw=[];
   for(const L of lines){
    if(L.some(x=>board[x]===1-p))continue;
    let G=0n;for(const z of L)if(board[z]===-1)G|=bit(z);
    if(G===0n)throw Error('nonterminal q first winner missed');
    raw.push(G);
   }
   return antichain(raw);
  });
  return {h,board,owners,ply:history.length,q:{h:h.slice(),R0:R[0],R1:R[1]}};
 }
 class ReferenceBudget extends Error {}
 function exactPhysicalWDL(root){
  const h=root.h.slice(),board=root.board.slice(),stone=root.owners.slice();
  const memo=new Map();
  const stats={uniqueStates:0,recursiveCalls:0,memoHits:0,originalPhysicalMoves:0,
   earlyFirstWinEdges:0};
  function rec(n){
   stats.recursiveCalls++;
   const key=stone[0].toString(16)+'|'+stone[1].toString(16);
   if(memo.has(key)){stats.memoHits++;return memo.get(key);}
   if(stats.uniqueStates++>maxPhysicalUniqueStatesPerRoot)
    throw new ReferenceBudget('reference actual grid WDL state budget');
   if(n===N)return 0;
   const p=n&1;let has=false,best=p===0?-1:1;
   for(let c=0;c<W;c++){
    const row=h[c];if(row===H)continue;
    has=true;stats.originalPhysicalMoves++;
    const z=id(c,row),mask=bit(z);
    h[c]++;board[z]=p;stone[p]|=mask;
    let value;
    try{
     if(incident[z].some(L=>L.every(e=>board[e]===p))){
      stats.earlyFirstWinEdges++;value=p===0?1:-1;
     }else if(n+1===N)value=0;
     else value=rec(n+1);
    }finally{h[c]--;board[z]=-1;stone[p]&=~mask;}
    if(p===0){best=Math.max(best,value);if(best===1)break;}
    else{best=Math.min(best,value);if(best===-1)break;}
   }
   if(!has)best=0;
   memo.set(key,best);return best;
  }
  const values={},p=root.ply&1;
  for(let c=0;c<W;c++){
   if(h[c]===H)continue;
   const row=h[c],z=id(c,row),mask=bit(z);
   h[c]++;board[z]=p;stone[p]|=mask;
   let result;
   try{
    if(incident[z].some(L=>L.every(e=>board[e]===p))){
     stats.earlyFirstWinEdges++;result=p===0?1:-1;
    }else if(root.ply+1===N)result=0;
    else result=rec(root.ply+1);
   }finally{h[c]--;board[z]=-1;stone[p]&=~mask;}
   values[c+1]=result;
  }
  const vals=Object.values(values),rootValue=p===0?Math.max(...vals):Math.min(...vals),
   best=Object.keys(values).map(Number).filter(c=>values[c]===rootValue);
  return {rootValue,values,best,stats:{...stats,cacheEntries:memo.size}};
 }
 const newer=createNonbijectiveSource({width:7,height:6,connect:4}),
   V4=createImmutableV4Source({width:7,height:6,connect:4});
 const summary={schema:'connect4.original7x6.nonbijective_3plus_original_source_wdl_physical_same_q_v4_v0_1',
  status:'PHYSICAL_CONTROL_EXECUTION_IN_PROGRESS',
  originalWorld:'actual W7H6 K4, 69 winning lines, FIRST win stop',
  preOracleInputFrozen:true,
  predeclaredRootObservations:frozen.chosenCandidates.length,
  sourceCandidatesWith3Plus:true,
  counters:{sourceRootsPhysicallyEvaluated:0,sourceRootsWithReferenceBudgetIncomplete:0,
   sourceDistinctRootWeakOrderEdgesPhysicallyChecked:0,
   sourceFalseOriginalP0RelativeWdlOrderEdges:0,
   sourceFirstActionBestClaimsPhysicallyChecked:0,
   sourcePhysicallyWrongSelectedFirstActions:0,
   unchangedV4AlreadyCertifiedBestOnSameQ:0,
   unchangedV4SourceIncompleteWhereNewSourceOriginalBestPhysicallyVerified:0,
   unchangedV4UnstableErrors:0,
   actualP0CurrentMoveRoots:0,actualP1CurrentMoveRoots:0,
   sourceProvedNovelRootWith3Legal:0,
   sourceProvedNovelRootWith4Legal:0,
   sourceProvedNovelRootWith5OrMoreLegal:0,
   physicallyUniqueBestAmongNovelRoots:0,
   sourceFutureGameQValuesEvaluated:0},
  completePerRootEvidence:[],physicalBudgetIncompletes:[],sourceFalsifiers:[]};
 for(const candidate of frozen.chosenCandidates){
  const root=rootFromPhysicalHistory(candidate.history),legal=root.h.flatMap((h,c)=>h<H?[c+1]:[]);
  if(root.ply!==candidate.originalPly||String(root.h)!==String(candidate.originalHeights)||
   String(legal)!==String(candidate.legal)||legal.length<3)
   throw Error('SOURCE candidate frozen physical root histories/heights/actions invalid');
  if(root.q.R0.length!==candidate.originalResidualCounts[0]||
     root.q.R1.length!==candidate.originalResidualCounts[1])
   throw Error('frozen source q does not match physical original 69-window residual generators');
  const current=newer.analyze(root.q);
  if(current.selectedBestOriginalColumn!==candidate.sourceBestOriginalColumn||
     JSON.stringify(current.sourceOriginalWeakP0WdlEdges.map(z=>
      [z.lowerP0RelativeOriginalFirstColumn,z.upperP0RelativeOriginalFirstColumn]))!==
      JSON.stringify(candidate.sourceWeakEdges)){
   throw Error('frozen SOURCE proof not reproduced from independent original physical q');
  }
  let physical;
  try{physical=exactPhysicalWDL(root);}
  catch(e){if(!(e instanceof ReferenceBudget))throw e;
   summary.counters.sourceRootsWithReferenceBudgetIncomplete++;
   summary.physicalBudgetIncompletes.push({history:candidate.history,reason:String(e)});
   continue;
  }
  summary.counters.sourceRootsPhysicallyEvaluated++;
  summary.counters[root.ply&1?'actualP1CurrentMoveRoots':'actualP0CurrentMoveRoots']++;
  for(const pair of candidate.sourceWeakEdges){
   const [a,b]=pair;
   summary.counters.sourceDistinctRootWeakOrderEdgesPhysicallyChecked++;
   if(!(physical.values[a]<=physical.values[b])){
    summary.counters.sourceFalseOriginalP0RelativeWdlOrderEdges++;
    const err={history:candidate.history,rootOriginalHeights:root.h,
     originalSourceRCounts:[root.q.R0.length,root.q.R1.length],
     edgeClaimJ_aLEJ_b:pair,
     actualPhysicalFirstActionValues:physical.values,
     actualPhysicalRootWDL:physical.rootValue};
    summary.sourceFalsifiers.push(err);summary.status='SOURCE_WEAK_WDL_ORDER_FALSIFIED';
    return summary;
   }
  }
  const actualBest=physical.best.includes(current.selectedBestOriginalColumn);
  summary.counters.sourceFirstActionBestClaimsPhysicallyChecked++;
  if(!actualBest){
   summary.counters.sourcePhysicallyWrongSelectedFirstActions++;
   const err={history:candidate.history,sourceBest:current.selectedBestOriginalColumn,
    actualPhysicalFirstActionValues:physical.values,
    actualPhysicalBestOriginalColumns:physical.best};
   summary.sourceFalsifiers.push(err);summary.status='SOURCE_BEST_ORIGINAL_ACTION_FALSIFIED';
   return summary;
  }
  let old;
  try{
   old=V4.compute(root.q,{orderOptions:{
    maxOperations:maxV4StaticOperations,maxMs:maxV4SourceMs,maxRepresentatives:10000
   }});
  }catch(e){old={status:'SOURCE_V4_REFERENCE_ERROR',reason:String(e)};
   summary.counters.unchangedV4UnstableErrors++;
  }
  const v4Already=old.status==='VALID_CONTINUATION';
  if(v4Already)summary.counters.unchangedV4AlreadyCertifiedBestOnSameQ++;
  const sourceNew=old.status==='INCOMPLETE';
  if(sourceNew){
   summary.counters.unchangedV4SourceIncompleteWhereNewSourceOriginalBestPhysicallyVerified++;
   if(legal.length===3)summary.counters.sourceProvedNovelRootWith3Legal++;
   else if(legal.length===4)summary.counters.sourceProvedNovelRootWith4Legal++;
   else summary.counters.sourceProvedNovelRootWith5OrMoreLegal++;
   if(physical.best.length===1)summary.counters.physicallyUniqueBestAmongNovelRoots++;
  }
  summary.completePerRootEvidence.push({
   history:candidate.history,originalPly:root.ply,mover:root.ply&1,
   originalLegalFirstColumns:legal,originalSourceRCounts:candidate.originalResidualCounts,
   sourceBestOriginalLiteralColumn:current.selectedBestOriginalColumn,
   sourceRootWeakWdlOrderEdgeCount:candidate.sourceWeakEdges.length,
   sourceRootFullWdlValueUnknown:true,
   physicallyVerifiedBest:true,
   originalPhysicalRootWdlP0Relative:physical.rootValue,
   originalPhysicalActionWdlP0Relative:physical.values,
   originalPhysicalBestOriginalLiteralColumns:physical.best,
   previousImmutableV4Status:old.status,
   previousImmutableV4BestOriginalColumn:old.selectedOriginalLiteralColumn??null,
   genuineAdditionalBestOverV4:sourceNew,
   independentPhysicalStats:physical.stats
  });
 }
 summary.status=summary.counters.sourceRootsWithReferenceBudgetIncomplete?
  'PARTIAL_ORIGINAL_PHYSICAL_BUDGET':'ALL_SAMPLED_SOURCE_EDGES_AND_BEST_ACTIONS_PHYSICALLY_VERIFIED';
 return summary;
}
