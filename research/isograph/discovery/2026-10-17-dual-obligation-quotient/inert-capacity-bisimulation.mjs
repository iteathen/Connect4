// Entire-future dynamic neutral-capacity action quotient, from ORIGINAL
// legal nonterminal q=(h,R0,R1) ONLY. Any two legally playable columns
// with ZERO remaining cells in either player's source residual upsets
// are interchangeable without searching their successor or later games.
// Their capacity tokens form ONE time/turn-preserving neutral pool.
// All original action labels remain reconstructible for WDL ties.
export function createInertCapacityBisimulation({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
   throw Error('invalid Connect-K geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{maxOperations=300000,maxMs=15000,maxSupports=10000}={}){
  const started=Date.now();
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
    q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    q.R0.some(x=>typeof x!=='bigint'||x<=0n)||
    q.R1.some(x=>typeof x!=='bigint'||x<=0n))
    throw Error('normalized nonterminal source q required');
  const rank=q.h.reduce((a,b)=>a+b,0);
  if(rank>=N)throw Error('terminal/full source not supported');
  const stats={
   originalSourceResiduals:q.R0.length+q.R1.length,
   sourceGeneratorUnions:0,
   sourceFutureCellMembershipChecks:0,
   inertFullSuffixGuardChecks:0,
   literalLegalActionLabels:0,
   nonInertLiteralActions:0,
   inertLiteralActions:0,
   neutralTokenCapacity:0,
   groupedActions:0,
   fullFutureValueProofsAvoided:0,
   futureGameStatesVisitedByProducer:0,
   sourceSuccessorQObjectsConstructed:0,
   gameOracleQueries:0,
   operations:0,
   elapsedMs:0
  };
  function charge(kind){
   stats[kind]++;stats.operations++;
   if(stats.operations>maxOperations)throw Error('INERT_CAPACITY_OPERATION_LIMIT');
   if(Date.now()-started>maxMs)throw Error('INERT_CAPACITY_TIME_LIMIT');
  }
  let activeCells=0n;
  for(const mask of q.R0){charge('sourceGeneratorUnions');activeCells|=mask;}
  for(const mask of q.R1){charge('sourceGeneratorUnions');activeCells|=mask;}
  const allLegal=[],inert=[],active=[],fullCapacityBreakdown=[];
  const sourceProofs=[];
  for(let c=0;c<W;c++){
   if(q.h[c]>=H)continue;
   stats.literalLegalActionLabels++;
   allLegal.push(c);
   let fullSuffixMask=0n;
   for(let r=q.h[c];r<H;r++){
    charge('sourceFutureCellMembershipChecks');
    fullSuffixMask|=bit(c,r);
   }
   charge('inertFullSuffixGuardChecks');
   if((fullSuffixMask&activeCells)===0n){
    inert.push(c);stats.inertLiteralActions++;
    const capacity=H-q.h[c];
    fullCapacityBreakdown.push({literalColumn:c,remainingCapacity:capacity});
    sourceProofs.push({literalColumn:c,
      fullRemainingSuffixCellMaskHex:'0x'+fullSuffixMask.toString(16),
      intersectionWithBothSourceResidualUpsetsHex:'0x0',
      noFuturePlayerCanUseThisColumnForAnyRemainingWin:true});
    stats.neutralTokenCapacity+=capacity;
   } else {
    active.push(c);stats.nonInertLiteralActions++;
   }
  }
  const scalarRepresentatives=active.slice();
  if(inert.length)scalarRepresentatives.push(inert[0]);
  stats.groupedActions=Math.max(0,inert.length-1);
  stats.fullFutureValueProofsAvoided=stats.groupedActions;
  stats.elapsedMs=Date.now()-started;
  if(scalarRepresentatives.length>maxSupports)throw Error('INERT_CAPACITY_SUPPORT_REPRESENTATIVE_LIMIT');
  return {
   schema:'connect4.inert-capacity-bisimulation.v0_1',
   sourceRank:rank,
   playerToMove:rank%2,
   originalLegalActionLabels:allLegal,
   activeLiteralColumns:active,
   inertLiteralColumns:inert,
   initialNeutralPoolCapacity:stats.neutralTokenCapacity,
   inertPerColumnCapacity:fullCapacityBreakdown,
   residualCellUnionHex:'0x'+activeCells.toString(16),
   exactFullFutureTiedActionGroups:inert.length>1?[inert.slice()]:[],
   scalarRootValueProofRepresentatives:scalarRepresentatives,
   scalarRootValueProofsEliminated:stats.fullFutureValueProofsAvoided,
   originalLiteralActionLabelsPreserved:true,
   sourceOnlyWitnesses:sourceProofs,
   statistics:stats,
   theoremScope:'Entire remaining first-win/draw/alternating-move game equivalence of plays into currently fully inert columns, by aggregating their neutral tokens. Does not claim exact scalar WDL or classify active columns.'
  };
 }
 return Object.freeze({compute,width:W,height:H,connect:K});
}
