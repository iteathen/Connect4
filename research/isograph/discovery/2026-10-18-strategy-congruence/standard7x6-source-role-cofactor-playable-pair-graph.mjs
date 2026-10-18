// PURE original q=(h,R0,R1) source projection of playable 2-cell
// original winning requirements after ONE specified root literal move.
// Exact owner/enemy raw cofactor and singleton-dominance filter,
// no successor q, no game WDL, no game-tree/opponent policy enumeration.
// Frozen theorem:
// docs/research/2026-10-18-original-winning-pair-fork-graph-role-dependent-one-event-cofactor.md
export function createOriginalRoleCofactorPlayablePairGraph({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||W>7||H<2||
    K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid original finite gravity geometry');
 const N=W*H,id=(c,r)=>W*r+c,bit=z=>1n<<BigInt(z);
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 const cellColumns=mask=>{
  const a=[];for(let i=0;i<N;i++)if(mask&bit(i))
   a.push({column:i%W+1,row:Math.floor(i/W)+1,originalPhysicalID:i});
  return a;
 };
 function compute(q,originalOneBasedColumn){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||h.some(z=>!Number.isInteger(z)||z<0||z>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1)||
   [...q.R0,...q.R1].some(G=>typeof G!=='bigint'||G<=0n))
   throw Error('requires nonterminal original source q=(h,R0,R1)');
  const n=h.reduce((a,b)=>a+b,0),s=n&1;
  if(n>=N)throw Error('original q full');
  if(!Number.isInteger(originalOneBasedColumn)||originalOneBasedColumn<1||
    originalOneBasedColumn>W||h[originalOneBasedColumn-1]>=H)
   return {status:'INCOMPLETE_NOT_CURRENT_GRAVITY_LEGAL_LITERAL_MOVE',
    sourceNonterminalOriginalPairGraph:null,sourceFutureGameValues:0};
  const c=originalOneBasedColumn-1,x=id(c,h[c]),landing=bit(x);
  let future=0n;
  for(let j=0;j<W;j++)for(let r=h[j];r<H;r++)future|=bit(id(j,r));
  if([...q.R0,...q.R1].some(G=>(G&~future)!==0n))
   throw Error('original source G contains nonfuture physical cell');
  const rootCurrentMover=s,afterH=h.slice();afterH[c]++;
  const meta={kind:'ORIGINAL_ONE_EVENT_PLAYABLE_PAIR_GRAPH_RAW_Q_COFACTOR',
   originalSourcePly:n,originalCurrentMover:s,
   oneOriginalLiteralCurrentAction:originalOneBasedColumn,
   oneOriginalFuturePhysicalLandingID:x,
   afterPhysicalColumnHeights:afterH,
   originalRootRCounts:[q.R0.length,q.R1.length],
   sourceOpposingGameValuesEvaluated:0,
   sourceAlternativeFutureQObjectsConstructed:0,
   sourceMoveTrajectoryPathsEnumerated:0,
   sourceOneSuppliedRootLiteralMoveOnly:true};
  if((s===0?q.R0:q.R1).some(G=>G===landing))
   return {status:'ORIGINAL_MOVE_TERMINAL_FIRST_WIN_NO_POST_MOVE_GRAPH',
    terminalMover:s,terminalValueP0Relative:s===0?1:-1,...meta};
  if(n+1===N)
   return {status:'ORIGINAL_MOVE_TERMINAL_FULL_BOARD_DRAW_NO_POST_MOVE_GRAPH',
    terminalValueP0Relative:0,...meta};
  const Fbefore=new Map(),Fafter=new Map();
  for(let j=0;j<W;j++){
   if(h[j]<H)Fbefore.set(id(j,h[j]),j);
   if(afterH[j]<H)Fafter.set(id(j,afterH[j]),j);
  }
  const describeGraph=(R,front)=>{
   const edges=[],seen=new Set();
   for(const G of R){
    if(pop(G)!==2)continue;
    const cells=cellColumns(G);
    if(cells.length!==2||!cells.every(z=>front.has(z.originalPhysicalID)))continue;
    const aa=front.get(cells[0].originalPhysicalID)+1,bb=front.get(cells[1].originalPhysicalID)+1;
    if(aa===bb)throw Error('currently playable frontier cannot have two levels in same column');
    const key=[aa,bb].sort((a,b)=>a-b).join(',');
    if(seen.has(key))continue;seen.add(key);
    edges.push({originalFrontierColumns:key.split(',').map(Number),
     exactOriginalTwoCellResidualMaskHex:'0x'+G.toString(16)});
   }
   edges.sort((a,b)=>a.originalFrontierColumns[0]-b.originalFrontierColumns[0]||
    a.originalFrontierColumns[1]-b.originalFrontierColumns[1]);
   return edges;
  };
  let ops={originalRawRootGeneratorOwnerAndEnemyTests:0,
   originalCandidatePairMasksConsidered:0,
   originalSingletonDominanceMaskTests:0,
   originalPotentialRemoteEdgeBirthsFound:0,
   originalFutureQGamesMaterialized:0,
   alternativeOpponentGameWDLQueries:0};
  const owners=[0,1].map(p=>{
   const R=p===0?q.R0:q.R1,singletonMasks=new Set(),candidatePairs=[];
   for(const G of R){
    ops.originalRawRootGeneratorOwnerAndEnemyTests++;
    if(p!==s&&(G&landing)!==0n)continue;
    const mask=p===s?(G&~landing):G,card=pop(mask);
    if(card===0)throw Error('unhandled owner FIRST WIN after legal move');
    if(card===1)singletonMasks.add(mask.toString());
    if(card===2){candidatePairs.push(mask);ops.originalCandidatePairMasksConsidered++;}
   }
   const singles=[...singletonMasks].map(BigInt),seen=new Set(),graph=[];
   for(const pair of candidatePairs){
    if(singles.some(one=>{ops.originalSingletonDominanceMaskTests++;
      return (pair&one)===one;}))continue;
    const cells=cellColumns(pair);
    if(cells.length!==2||!cells.every(z=>Fafter.has(z.originalPhysicalID)))continue;
    const a=Fafter.get(cells[0].originalPhysicalID)+1,b=Fafter.get(cells[1].originalPhysicalID)+1;
    if(a===b)throw Error('two gravity frontier cells cannot be in same original column');
    const pairColumns=[a,b].sort((x,y)=>x-y),key=pairColumns.join(',');
    if(seen.has(key))continue;seen.add(key);
    graph.push({originalFrontierColumns:pairColumns,
     exactOriginalTwoCellResidualMaskHex:'0x'+pair.toString(16)});
   }
   graph.sort((x,y)=>x.originalFrontierColumns[0]-y.originalFrontierColumns[0]||
    x.originalFrontierColumns[1]-y.originalFrontierColumns[1]);
   const oldGraph=describeGraph(R,Fbefore);
   const oldKey=new Set(oldGraph.map(z=>z.originalFrontierColumns.join(',')));
   const remote=graph.filter(e=>!e.originalFrontierColumns.includes(originalOneBasedColumn)&&
    !oldKey.has(e.originalFrontierColumns.join(',')));
   ops.originalPotentialRemoteEdgeBirthsFound+=remote.length;
   if(p!==s&&remote.length)
    throw Error('opponent move created a remotely new ORIGINAL playable pair requirement, contradicting source role-locality theorem');
   const newFrontSingles=singles.filter(mask=>{
    const only=cellColumns(mask);return only.length===1&&Fafter.has(only[0].originalPhysicalID);
   }).map(mask=>cellColumns(mask)[0].column).sort((a,b)=>a-b);
   return {originalOwner:p,ownerIsMover:p===s,
    originalPlayablePairGraphEdgesBefore:oldGraph,
    originalPlayablePairGraphEdgesAfter:graph,
    originalCurrentlyPlayableOneCellWinRequirementsAfter:newFrontSingles,
    originalPlayableTwoCellGraphRemoteEdgeBirths:remote,
    sourceNonterminalOriginalRawSingletonRequirements:singles.length,
    sourceRawTwoCellCandidateRequirementsBeforeDominance:candidatePairs.length};
  });
  return {status:'SOURCE_EXACT_ONE_SUPPLIED_MOVE_NONTERMINAL_ROLE_COFATOR_PLAYABLE_PAIR_GRAPH',
   sourceOriginalFuturePairGraphsByOwner:owners,
   sourceObservedRoleLocalityForOpponentBlocker:true,
   sourceObservationDependentNonlocalOwnerContractionPossible:true,
   statistics:ops,...meta};
 }
 return Object.freeze({compute});
}
