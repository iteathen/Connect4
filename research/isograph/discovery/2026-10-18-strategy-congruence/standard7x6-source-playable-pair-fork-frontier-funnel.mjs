// ORIGINAL current q=(h,R0,R1) rank-local playable 2-cell attacker
// residual generator graph. Defender moves now, attacker moves next.
// Previously established fork precursor/Hall theorem, encoded as one
// source CURRENT frontier graph of 2-cell requirements and W-bit
// intersection of all mandatory defender preemption triples.
// NO future q construction, no game WDL, no opponent strategy tree or
// enumeration of subsequent defense paths in SOURCE.
// Frozen math: docs/research/2026-10-18-canonical44444-center-branch-playable-pair-fork-frontier-strategy-funnel.md
export function createOriginalPlayablePairForkFunnel({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<3||W>7||H<2||
    K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid original finite gravity geometry');
 const N=W*H,bit=z=>1n<<BigInt(z),id=(c,r)=>r*W+c;
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 function analyze(q){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
    h.some(x=>!Number.isInteger(x)||x<0||x>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('true nonterminal ORIGINAL owner-tagged q required');
  const n=h.reduce((s,z)=>s+z,0),defender=n&1,attacker=1-defender;
  if(n>=N)throw Error('full original board');
  let future=0n;
  for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bit(id(c,r));
  if([...q.R0,...q.R1].some(m=>(m&~future)!==0n))
   throw Error('source generator outside currently unfilled physical support');
  const legal=h.flatMap((row,c)=>row<H?[c+1]:[]);
  const front=legal.map(c=>({column:c,physicalID:id(c-1,h[c-1])}));
  const defenderR=defender===0?q.R0:q.R1,attackerR=attacker===0?q.R0:q.R1;
  const stats={originalSourcePly:n,rootCurrentDefender: defender,
   rootAttackerOtherPlayer:attacker,
   originalCurrentLegalFrontierColumns:legal.length,
   originalAttackerGeneratorsInspected:0,
   originalDefenderGeneratorsInspected:0,
   currentPlayableAttackerTwoCellGenerators:0,
   sourceThreatGraphForkCenters:0,
   sourceGraphForkNeighborPairTriples:0,
   sourceDefenderExcludedRootLabels:0,
   sourceGeneratedBoundedForcedWinReplyPrograms:0,
   sourceFutureGameQObjects:0,sourceAlternativeGameWDLValues:0,
   sourceOpponentFutureStrategyBranchesEnumerated:0,
   sourceOriginalGeometryLineOracleCalls:0};
  let minDef=Infinity;
  for(const G of defenderR){
   stats.originalDefenderGeneratorsInspected++;
   minDef=Math.min(minDef,pop(G));
  }
  const base={kind:'ORIGINAL_Q_PLAYABLE_TWO_CELL_FORK_PREEMPTION_GRAPH',
   originalSourcePly:n,originalCurrentDefender:defender,
   originalNextAttacker:attacker,originalHeights:h.slice(),
   originalRCounts:[q.R0.length,q.R1.length],
   originalDefenderMinSurvivingGeneratorCardinality:Number.isFinite(minDef)?minDef:null,
   originalLegalCurrentColumns:legal,
   statistics:stats,
   sourceOrdinaryRootWDL:null,sourceLevel2BestOriginalColumn:null};
  if(minDef<3)
   return {status:'INCOMPLETE_DEFENDER_MAY_WIN_WITHIN_TWO_REPLY_PLACEMENTS',
    sourceNoBoundedForkGuarantee:true,sourceProvenNecessaryDefenderReplies:null,
    ...base};
  const valid=new Set(front.map(z=>z.physicalID));
  const adjacency=Array.from({length:W},()=>new Set()),edges=[];
  for(const G of attackerR){
   stats.originalAttackerGeneratorsInspected++;
   if(pop(G)!==2)continue;
   const cells=[];
   for(let z=0;z<N;z++)if((G&bit(z))!==0n)cells.push(z);
   if(cells.length!==2||!cells.every(z=>valid.has(z)))continue;
   const c=cells.map(z=>z%W);
   if(c[0]===c[1])throw Error('two distinct currently playable frontier cells cannot share a column');
   const a=Math.min(...c),b=Math.max(...c);
   if(adjacency[a].has(b))continue;
   adjacency[a].add(b);adjacency[b].add(a);
   stats.currentPlayableAttackerTwoCellGenerators++;
   edges.push({originalCurrentLegalColumnPair:[a+1,b+1],
    exactOriginalSourceResidualMaskHex:'0x'+G.toString(16)});
  }
  const triples=[];
  let allMask=0;
  for(const c of legal)allMask|=1<<(c-1);
  let safeMask=allMask;
  for(let x=0;x<W;x++){
   const neighbors=[...adjacency[x]].sort((a,b)=>a-b);
   if(neighbors.length<2)continue;
   stats.sourceThreatGraphForkCenters++;
   for(let i=0;i<neighbors.length;i++)for(let j=i+1;j<neighbors.length;j++){
    const y=neighbors[i],z=neighbors[j],mask=(1<<x)|(1<<y)|(1<<z);
    triples.push({originalAttackerForkCenterColumn:x+1,
     twoDistinctUnblockableThreatColumnsAfterAttackerEnables:[y+1,z+1],
     defenderPreemptionColumnTriple:[x+1,y+1,z+1].sort((a,b)=>a-b),
     rootFrontierColumnMaskHex:'0x'+mask.toString(16)});
    stats.sourceGraphForkNeighborPairTriples++;
    safeMask&=mask;
   }
  }
  const safe=legal.filter(c=>safeMask&(1<<(c-1))),
    excluded=legal.filter(c=>!(safeMask&(1<<(c-1))));
  const witnesses=[];
  for(const d of excluded){
   const t=triples.find(t=>!t.defenderPreemptionColumnTriple.includes(d));
   if(!t)throw Error('excluded original defense not supported by an explicit fork source witness');
   witnesses.push({excludedDefenderCurrentOriginalColumn:d,
    forcingAttackerOriginalColumnNext:t.originalAttackerForkCenterColumn,
    forcingAttackerThreatChoicesAfterOneMoreDefenderReply:
      t.twoDistinctUnblockableThreatColumnsAfterAttackerEnables.slice(),
    attackerGuaranteesOriginalFirstWINByAtMostSecondOwnPlacement:true,
    defenderCannotCompleteAnOriginalLineInItsNextTwoPlacementsByCardinalityGuard:true,
    originalStaticForkTriple:t.defenderPreemptionColumnTriple});
   stats.sourceGeneratedBoundedForcedWinReplyPrograms++;
  }
  stats.sourceDefenderExcludedRootLabels=excluded.length;
  return {status:'SOURCE_PROVED_NECESSARY_ORIGINAL_DEFENSIVE_FORK_PREEMPTION_FUNNEL',
   sourceOriginalPlayablePairThreatGraphEdges:edges,
   sourceCurrentForkPreemptionTriples:triples,
   sourceCurrentForkDegreeByOriginalLegalColumn:legal.map(c=>({
    col:c,degree:adjacency[c-1].size})),
   sourceNecessaryDefenderFirstActionSubsetAgainstThisForkFamily:safe,
   sourceExcludedDefenderFirstActionsWithForcedOpponentWin:excluded,
   sourcePerExcludedDefenderCurrentActionAttackerForcingWitness:witnesses,
   noClaimThatRemainingCurrentDefenderChoicesAvoidLoss:true,
   ...base};
 }
 return Object.freeze({analyze});
}
