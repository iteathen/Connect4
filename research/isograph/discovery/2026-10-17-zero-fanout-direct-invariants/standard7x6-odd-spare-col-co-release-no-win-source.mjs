// ORIGINAL-q source-only odd future cell count NO-FORCED-MOVER-WIN
// source witness with ONE unmatched currently playable LAST source
// column cell (remaining capacity exactly 1) plus o-second safe pair
// block structure on every other future cell.
// No game q future, WDL oracle, policy graph, minimax or future search.
// Frozen before physical test theorem:
// docs/research/2026-10-17-odd-gravity-spare-cell-co-release-defensive-pairing.md
import {createCoReleasePairBlockProof} from './co-release-pair-block-proof.mjs';
export function createOddSpareColCoReleaseNoWin({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
    K>Math.min(W,H)||W*H>42)throw Error('unsupported original gravity board');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
  matcher=createCoReleasePairBlockProof({width:W,height:H,connect:K});
 function compute(q,{maxOperations=14000,maxMs=50,maxStaticWitnessStates=3500}={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
    h.some(z=>!Number.isInteger(z)||z<0||z>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(x=>typeof x!=='bigint'||x<=0n))
    throw Error('first-win-stopped original source q=(h,R0,R1) expected');
  const n=h.reduce((s,z)=>s+z,0),T=N-n,p=n&1,own=p===0?q.R0:q.R1;
  if(T<=0)throw Error('already terminal original source');
  const stats={rootPly:n,remainingPhysicalCells:T,
   originalCurrentMoverLiveKRequirements:own.length,
   sourceCapacityOneUnmatchedColumnsConsidered:0,
   sourceStaticMatchingCandidateSetsConstructed:0,
   sourceStaticBlockMatchingWorkOps:0,sourceStaticBlockRepresentativesVisited:0,
   sourceStaticOpponentPairResponsePoliciesConstructed:0,
   sourceOriginalPairWinlineIncidenceChecks:0,
   sourceOriginalPhysicalFutureCellCoverageChecks:0,
   sourceGameSuccessorQMaterializations:0,sourceFutureGameWDLValueQueries:0,
   sourceStrategyTreeAlternativesConstructed:0,
   sourceGameStrategicFanout:0,
   sourceStaticProofResourceIncomplete:0};
  if(T%2===0)return{status:'INCOMPLETE',
    reason:'EVEN_REMAINING_CAPACITY_OLD_DIRECT_DEFENDER_PAIR_POLICY',
    sourceCannotForceCurrentMoverWin:false,statistics:stats};
  if(!own.length)return{status:'INCOMPLETE',
    reason:'MOVER_ALREADY_HAS_ZERO_WINLINES_OLD_SOURCE_NO_WIN_THEOREM',
    sourceCannotForceCurrentMoverWin:true,
    selectedUnmatchedLiteralColumn:null,statistics:stats};
  const candidate=h.flatMap((z,c)=>H-z===1?[c]:[]);
  if(!candidate.length)return {status:'INCOMPLETE',
    reason:'NO_ORIGINAL_SOURCE_COLUMN_WITH_EXACTLY_ONE_IMMEDIATELY_PLAYABLE_LAST_CELL',
    sourceCannotForceCurrentMoverWin:false,statistics:stats};
  for(const u of candidate){
   stats.sourceCapacityOneUnmatchedColumnsConsidered++;
   const heights=h.slice();heights[u]=H;
   let result;
   try{
    stats.sourceStaticMatchingCandidateSetsConstructed++;
    result=matcher.prove(heights,own,{
      maxOperations,maxMs,maxStaticWitnessStates});
   }catch(e){
    // Existing matcher can throw this resource guard DURING its static
    // block-candidate construction (before its DFS catch); this is
    // UNKNOWN source proof, never a negative strategic result.
    if(/^CO_RELEASE_PAIR_.*_LIMIT$/.test(String(e.message))){
      stats.sourceStaticProofResourceIncomplete++;
      continue;
    }
    throw e;
   }
   stats.sourceStaticBlockMatchingWorkOps+=result.statistics?.sourceOperations??0;
   stats.sourceStaticBlockRepresentativesVisited+=
    result.statistics?.staticColumnPartitionProofStates??0;
   if(result.status==='RESOURCE_INCOMPLETE'){stats.sourceStaticProofResourceIncomplete++;continue;}
   if(!result.certifiedAttackerWinImpossible||!result.allSourceFutureCellsPaired||
    !result.allAttackerWinningRequirementsContainDefenderPair)continue;
   // CRITICAL original true7x6 falsifier: a dangling preemptively
   // o-marked cross pair j can release the NEXT cross pair j+1 on one
   // source column WITHOUT making its mate gravity playable in the
   // other column. The standard even-T co-release matcher assumes
   // previous cross-prefix pairs COMPLETE. Odd pending policy breaks
   // that assumption. Only ZERO/ONE cross-prefix pairs per block are
   // safely preemptable in the current one-dangling-token proof.
   // See 2026-10-17-odd-spare-gravity-cross-prefix-rejection-and-safe-restriction.md
   if(result.sourceBlocks.some(b=>
       b.kind==='CO_RELEASE_PREFIX_AND_VERTICAL_TAILS'&&
       b.crossPairPrefixLength>1)){
     stats.sourceReturnedUnsafeLongCrossPrefixRejected=
       (stats.sourceReturnedUnsafeLongCrossPrefixRejected??0)+1;
     continue;
   }
   const pairs=result.sourceBlocks.flatMap(b=>b.sourcePairMasksHex.map(BigInt));
   let cells=0n;
   for(const P of pairs){
    if((P&cells)!==0n)throw Error('source pair witness repeats original cell');
    cells|=P;
    stats.sourceOriginalPhysicalFutureCellCoverageChecks+=2;
   }
   let future=0n;
   for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bit(c,r);
   const unmatched=bit(u,h[u]);
   if(pairs.length*2!==T-1||(cells|unmatched)!==future||
     (cells&unmatched)!==0n)throw Error('odd source pair plus spare failed physical support coverage');
   for(const G of own){
    stats.sourceOriginalPairWinlineIncidenceChecks++;
    if(!pairs.some(P=>(G&P)===P))
     throw Error('mover original winning generator not covered by complete pair outside spare');
   }
   // The coRelease blocks have a certificate of safe mate immediately
   // after p first touch in ANY pair. The odd spare slack-token
   // theorem adds one preclaimed virgin pair at a time.
   stats.sourceStaticOpponentPairResponsePoliciesConstructed++;
   const legal=h.flatMap((z,c)=>z<H?[c+1]:[]);
   return {status:'CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN',
    kind:'ODD_SINGLE_ORIGINAL_SPARE_CELL_PLUS_GRAVITY_SAFE_ONE_PENDING_PAIR_DEFENDER_POLICY',
    sourceCannotForceCurrentMoverWin:true,rootCurrentMover:p,originalDefender:oFrom(p),
    remainingOriginalCells:T,sourceUnmatchedLastCell:{
      originalLiteralColumn:u+1,rowZeroBased:h[u],
      physicalCellMaskHex:'0x'+unmatched.toString(16)},
    sourceGravitySafePairBlocks:result.sourceBlocks,
    pairedEveryFuturePhysicalCellOtherThanUnmatched:true,
    everyOriginalMoverWinningResidualContainsOppositeOwnedMatePair:true,
    defenderOnePendingPairSlackTokenPolicy:'If p takes a virgin pair cell, o takes mate. If p takes unmatched U or pending mate, o preclaims one currently playable virgin pair cell; <=one pending pair.',
    futureWinByCurrentMoverExcludedUnderOneAdversarialOResponsePolicy:true,
    certifiedP0RelativeRootValueInterval:p===0?[-1,0]:[0,1],
    allOriginalLegalFirstActionNames:legal,
    directL2BestActionNotYetProved:true,
    sourceOriginalGameFutureWDLEvaluations:0,
    statistics:stats};
  }
  return {status:'INCOMPLETE',
   reason:stats.sourceStaticProofResourceIncomplete?
    'STATIC_PAIRING_RESOURCE_INCOMPLETE_OR_NO_WITNESS':'NO_COVERING_GRAVITY_SAFE_ODD_SPARE_DEFENSE_PAIRING',
   sourceCannotForceCurrentMoverWin:false,statistics:stats};
 }
 function oFrom(p){return 1-p;}
 return Object.freeze({width:W,height:H,connect:K,compute});
}
