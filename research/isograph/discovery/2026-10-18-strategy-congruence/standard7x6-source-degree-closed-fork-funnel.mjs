// Pure original current q=(h,R0,R1) one W-bit ORIGINAL attacker
// currently playable size2 residual requirement adjacency graph, with
// CLOSED DEGREE RULE (no neighbor-pair enumeration):
// degree<2 => unconstrained; degree=2 => {x}∪N(x); degree>=3=>{x}.
// Source STATIC mandatory defender action bitmask; for every excluded
// original defender action one explicit 3-placement attacker forcing
// program. Defensive generator minimum cardinality >=3 rules out
// defender FIRST WIN supersession on its next 2 placements.
// No future q objects, no game WDL queries, no game-strategy tree.
// Frozen theorem:
// docs/research/2026-10-18-playable-two-generator-fork-graph-degree-closed-form-strategy-cut.md
export function createOriginalDegreeClosedForkFunnel({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<3||W>7||H<2||K<2||
    K>Math.min(W,H)||W*H>42)throw Error('invalid finite gravity original geometry');
 const N=W*H,id=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z);
 const pop=z=>{let n=0;for(;z;z&=z-1n)n++;return n;};
 const bits=mask=>Array.from({length:W},(_,i)=>mask&(1<<i)?i+1:null).filter(x=>x!==null);
 function compute(q){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
    h.some(x=>!Number.isInteger(x)||x<0||x>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(G=>typeof G!=='bigint'||G<=0n))
   throw Error('genuine original first-win-stopped q=(h,R0,R1) expected');
  const n=h.reduce((a,b)=>a+b,0),defender=n&1,attacker=1-defender;
  if(n>=N)throw Error('original root full');
  const legal=h.flatMap((z,c)=>z<H?[c+1]:[]);
  let future=0n;for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bit(id(c,r));
  if([...q.R0,...q.R1].some(G=>(G&~future)!==0n))
   throw Error('source original R mask outside future physical support');
  const defense=defender===0?q.R0:q.R1,offense=attacker===0?q.R0:q.R1,
   minDef=defense.length?Math.min(...defense.map(pop)):null;
  const stats={sourceDefenderOriginalGeneratorWidthChecks:defense.length,
   sourceAttackerOriginalGeneratorScans:0,
   sourceRootLegalFrontierColumns:legal.length,
   sourcePlayableTwoCellOriginalAttackerGeneratorEdges:0,
   sourceGraphVertexDegreeChecks:0,
   sourceForkNeighborPairCombinationsEnumerated:0,
   sourceDegreeClosedForkCenters:0,
   sourceBitwiseClosedPreemptionIntersections:0,
   sourceExcludedDefenderCurrentLabels:0,
   sourceOpponentConditionalForcingWitnesses:0,
   sourceFutureGameQChildObjects:0,sourceFutureGameWDLQueries:0,
   sourceFutureOpponentReplyTreesEnumerated:0};
  const common={originalSourcePly:n,originalDefenderOwner:defender,
   originalAttackerOwner:attacker,originalHeights:h.slice(),
   originalSourceResidualCounts:[q.R0.length,q.R1.length],
   originalLegalCurrentColumns:legal,
   sourceDefenderSmallestSurvivingRequirement:minDef,statistics:stats};
  if(minDef!==null&&minDef<3)
   return {status:'INCOMPLETE_DEFENDER_TERMINAL_SUPERSESSION_GUARD',
    sourceNecessaryDefenderFirstActionSubsetAgainstThisForkFamily:null,
    sourceExcludedDefenderFirstActionsWithForcedOpponentWin:[],
    sourceLevel2BestOriginalColumn:null,sourceOrdinaryRootWDLP0Relative:null,
    ...common};
  const playable=new Map(legal.map(col=>[id(col-1,h[col-1]),col-1]));
  const adj=Array(W).fill(0),edges=[];
  for(const G of offense){
   stats.sourceAttackerOriginalGeneratorScans++;
   if(pop(G)!==2)continue;
   const cells=[];
   for(let z=0;z<N;z++)if(G&bit(z))cells.push(z);
   if(cells.length!==2||!playable.has(cells[0])||!playable.has(cells[1]))continue;
   const x=playable.get(cells[0]),y=playable.get(cells[1]);
   if(x===y)throw Error('two distinct gravity frontier events share column');
   const markX=1<<x,markY=1<<y;
   if(adj[x]&markY)continue;
   adj[x]|=markY;adj[y]|=markX;
   stats.sourcePlayableTwoCellOriginalAttackerGeneratorEdges++;
   edges.push({originalCurrentLegalColumnPair:[Math.min(x,y)+1,Math.max(x,y)+1],
    exactOriginalSourceResidualMaskHex:'0x'+G.toString(16)});
  }
  const legMask=legal.reduce((m,c)=>m|(1<<(c-1)),0);
  const degreeClosed=[],classicPairTripleForDegree2=[];
  let safe=legMask;
  for(const col of legal){
   const i=col-1,neighbors=bits(adj[i]),degree=neighbors.length;
   stats.sourceGraphVertexDegreeChecks++;
   if(degree<2)continue;
   const local=degree===2?((1<<i)|adj[i]):(1<<i);
   degreeClosed.push({originalForkCenterColumn:col,
    attackerPlayablePairGraphDegree:degree,
    exactSourceMandatoryDefenderPreemptionColumns:bits(local)});
   if(degree===2){
    classicPairTripleForDegree2.push({
     originalAttackerForkCenterColumn:col,
     twoDistinctUnblockableThreatColumnsAfterAttackerEnables:neighbors.slice(),
     defenderPreemptionColumnTriple:[col,...neighbors].sort((a,b)=>a-b),
     rootFrontierColumnMaskHex:'0x'+local.toString(16)});
   }
   stats.sourceDegreeClosedForkCenters++;
   safe&=local;stats.sourceBitwiseClosedPreemptionIntersections++;
  }
  const necessary=bits(safe),excluded=legal.filter(c=>(safe&(1<<(c-1)))===0);
  const witness=[];
  for(const d of excluded){
   let found=null;
   for(const center of degreeClosed){
    if(center.exactSourceMandatoryDefenderPreemptionColumns.includes(d))continue;
    const x=center.originalForkCenterColumn,neighbors=bits(adj[x-1]).filter(c=>c!==d);
    if(neighbors.length<2)throw Error('graph degree closure predicted fork but cannot select two nonblocked neighbors');
    found={excludedDefenderCurrentOriginalColumn:d,
     forcingAttackerOriginalColumnNext:x,
     forcingAttackerThreatChoicesAfterOneMoreDefenderReply:neighbors.slice(0,2),
     attackerGuaranteesOriginalFirstWINByAtMostSecondOwnPlacement:true,
     defenderCannotCompleteAnOriginalLineInItsNextTwoPlacementsByCardinalityGuard:true,
     originalStaticForkTriple:[x,...neighbors.slice(0,2)].sort((a,b)=>a-b)};
    break;
   }
   if(found===null)throw Error('closed SOURCE fork intersection exclusion missing physical witness');
   witness.push(found);stats.sourceOpponentConditionalForcingWitnesses++;
  }
  stats.sourceExcludedDefenderCurrentLabels=excluded.length;
  const unavoidable=necessary.length===0&&legal.length>0;
  return {status:unavoidable?'SOURCE_CERTIFIED_ALL_DEFENDER_MOVES_LOSE_TO_BOUNDED_FORK':
   'SOURCE_PROVED_NECESSARY_ORIGINAL_DEFENSIVE_FORK_PREEMPTION_FUNNEL',
   sourceOriginalPlayablePairThreatGraphEdges:edges,
   sourceCurrentForkDegreeByOriginalLegalColumn:legal.map(c=>({col:c,degree:pop(BigInt(adj[c-1]))})),
   sourceDegreeClosedForkCenterObligations:degreeClosed,
   sourceCurrentForkPreemptionTriples:classicPairTripleForDegree2,
   sourceNecessaryDefenderFirstActionSubsetAgainstThisForkFamily:necessary,
   sourceExcludedDefenderFirstActionsWithForcedOpponentWin:excluded,
   sourcePerExcludedDefenderCurrentActionAttackerForcingWitness:witness,
   sourceCurrentDefenderForcedLossByAllActions:unavoidable,
   sourceOrdinaryRootWDLP0Relative:unavoidable?(attacker===0?1:-1):null,
   sourceLevel2BestOriginalColumn:unavoidable?legal[0]:null,
   sourceNoBestMoveClaimWhenPreemptionSetNonempty:true,
   ...common};
 }
 return Object.freeze({compute});
}
