// SOURCE-ONLY p forced LOSS despite R_p possibly nonempty.
// One fixed gravity co-release opponent response policy stops EVERY p win,
// while fractional original o winning-line packing > p remaining turns
// forces o win before a full-board draw. ZERO alternative game values.
// Frozen proof: docs/research/2026-10-17-adaptive-gravity-pairing-plus-opponent-overload-forced-loss.md
import {createCoReleasePairBlockProof} from './co-release-pair-block-proof.mjs';
import {createSourceFractionalTransversal} from './standard7x6-source-fractional-transversal.mjs';
export function createPairDefenseDualOverloadLoss({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid true gravity original K game');
 const N=W*H,matcher=createCoReleasePairBlockProof({width:W,height:H,connect:K}),
  dual=createSourceFractionalTransversal({width:W,height:H,connect:K});
 const bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{maxOperations=8000,maxMs=25,maxStaticWitnessStates=2000,
    denominators=[1,2,3,4,6,8,12]}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(v=>!Number.isInteger(v)||v<0||v>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1)||
     [...q.R0,...q.R1].some(x=>typeof x!=='bigint'||x<=0n))
   throw Error('expected ordinary normalized NONTERMINAL source q');
  const n=q.h.reduce((s,v)=>s+v,0),p=n&1,o=1-p,T=N-n,
   legal=q.h.flatMap((v,c)=>v<H?[c]:[]);
  if(n>=N||!legal.length)throw Error('not original first-win-stopped nonterminal');
  const own=p===0?q.R0:q.R1,other=p===0?q.R1:q.R0;
  const stats={originalSourceRank:n,mover:p,opponent:o,
   originalViableMoverGenerators:own.length,originalViableOpponentGenerators:other.length,
   originalFutureCellCount:T,currentMoverFutureBlockingTurns:Math.ceil(T/2),
   staticDualWeightVectorsExamined:0,staticDualCellIncidenceChecks:0,
   staticPairBlockOptionsTried:0,staticPairPartitionsVisited:0,
   staticPairCoverageChecks:0,sourceCrossoverEqualOrdinalPairs:0,
   sourceOriginalPairingPhysicalCellsIndependentlyChecked:0,
   sourceOriginalDualCapacityChecks:0,
   rootGameSuccessorsConstructed:0,rootOtherLiteralActionWDLQueries:0,
   independentStrategicFutureGameValuesEvaluated:0,
   sourceStrategicGameFanout:0,sourceStrategyGraphEnumerations:0,
   sourcePairingBudgetIncomplete:0};
  if(own.length===0)return {status:'INCOMPLETE',
    reason:'ALREADY_COVERED_BY_OLDER_EXTINCT_P_WINLINE_CONDITION',
    selectedOriginalLiteralColumn:null,statistics:stats};
  if(T%2!==0)return {status:'INCOMPLETE',reason:'REQUIRES_DEFENDER_AS_SECOND_WITH_EVEN_REMAINING_CELLS',
    selectedOriginalLiteralColumn:null,statistics:stats};
  // Cheap STATIC packing overload first: if impossible no reason to
  // construct a gravity-safe full-cell matching.
  const packed=dual.prove({h:q.h,R:[q.R0,q.R1]},o,{denominators});
  stats.staticDualWeightVectorsExamined=packed.statistics.attemptedStaticWeightVectors;
  stats.staticDualCellIncidenceChecks=packed.statistics.witnessCellIncidenceChecks;
  if(packed.status!=='CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN')
   return {status:'INCOMPLETE',reason:'NO_OPPONENT_SOURCE_DUAL_OVERLOAD',
    selectedOriginalLiteralColumn:null,statistics:stats};
  const capacity=T/2;
  if(packed.opponent!==p||packed.attacker!==o||
    packed.opponentTotalTurns!==capacity||
    packed.witness.sumNumerator<=capacity*packed.witness.denominator)
   throw Error('dual original player capacity guard contradiction');
  const pairing=matcher.prove(q.h,own,{
    maxOperations,maxMs,maxStaticWitnessStates});
  stats.staticPairBlockOptionsTried=pairing.statistics.staticBlockOptionsTried??0;
  stats.staticPairPartitionsVisited=pairing.statistics.staticColumnPartitionProofStates??0;
  stats.staticPairCoverageChecks=pairing.statistics.sourceRequirementCoverageTests??0;
  if(pairing.status==='RESOURCE_INCOMPLETE')stats.sourcePairingBudgetIncomplete++;
  if(!pairing.certifiedAttackerWinImpossible||
     !pairing.allSourceFutureCellsPaired||
     !pairing.allAttackerWinningRequirementsContainDefenderPair)
   return {status:'INCOMPLETE',
    reason:pairing.status==='RESOURCE_INCOMPLETE'?'SOURCE_STATIC_PAIRING_BUDGET':'NO_FULL_GRAVITY_SAFE_ALL_ATTACKER_LINES_PAIR',
    selectedOriginalLiteralColumn:null,
    opponentPackingFirstWitness:packed.witness,
    statistics:stats};
  // Independent explicit CERTIFICATE recheck using source q and raw
  // pairing blocks: all WH-n cells disjoint/exhaustively paired and
  // every original mover G contains the full physical pair.
  const pairs=pairing.sourceBlocks.flatMap(group=>group.sourcePairMasksHex.map(BigInt));
  let union=0n;
  for(const pair of pairs){
   if((pair&union)!==0n)throw Error('dual pairing source cells collided');
   union|=pair;
   stats.sourceOriginalPairingPhysicalCellsIndependentlyChecked+=2;
  }
  let allFuture=0n;
  for(let c=0;c<W;c++)for(let r=q.h[c];r<H;r++)allFuture|=bit(c,r);
  if(pairs.length!==T/2||union!==allFuture||own.some(G=>!pairs.some(pair=>(pair&G)===pair)))
   throw Error('opponent response pairing physical/source requirement mismatch');
  const loads=Array(N).fill(0),D=packed.witness.denominator,
   nums=packed.witness.numerators.map(Number);
  if(nums.length!==other.length)throw Error('fractional o dual vector dimension inconsistent');
  let sum=0;
  for(let i=0;i<other.length;i++){
   if(!Number.isInteger(nums[i])||nums[i]<0)throw Error('source rational dual numerator invalid');
   sum+=nums[i];
   for(let j=0;j<N;j++){
    if((other[i]&(1n<<BigInt(j)))!==0n){loads[j]+=nums[i];stats.sourceOriginalDualCapacityChecks++;}
   }
  }
  if(loads.some(z=>z>D)||sum!==packed.witness.sumNumerator||sum<=capacity*D)
   throw Error('opponent o source hypergraph fractional dual load/capacity invalid');
  return {status:'VALID_CONTINUATION',
   kind:'ADAPTIVE_OPPONENT_PAIR_DEFENSE_PLUS_SOURCE_WINLINE_DUAL_OVERLOAD',
   certifiedFirstWinningPlayer:o,certifiedLosingCurrentPlayer:p,
   exactRootP0RelativeWDL:o===0?1:-1,
   selectedOriginalLiteralColumn:legal[0]+1,
   allOriginalLiteralEquallyBestLosingMoves:legal.map(c=>c+1),
   completeLossTierLevel2SetCertified:true,
   sourceUniformDefenderReplyPolicy:pairing.sourceBlocks,
   sourceDualOpponentWinCertificate:packed.witness,
   originalMoverStillHasViableWinlines:true,
   sourceStrictOverloadOfMoverBlockingTurns:sum/D-capacity,
   currentMoverMaximumRemainingBlockingTurns:capacity,
   sourceFullGameFirstWinAgainstEveryMoverPolicy:true,
   independentlyValuedFutureGameWDLQueries:0,
   statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
