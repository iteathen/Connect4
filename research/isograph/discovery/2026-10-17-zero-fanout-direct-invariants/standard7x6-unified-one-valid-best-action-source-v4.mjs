// SOURCE V4: immutable V2 scalar WDL proof, then fixed two-column
// DIRECT transposition q mask inclusion, then historical V3 enumerated
// STATIC transport fallback. Never values alternative FUTURE GAMES.
// Frozen theorem docs/research/2026-10-17-unified-source-v4-fixed-two-column-swap-before-transport.md
// SOURCE-ONLY proof-carrying V3: previously qualified V2 exact
// WIN/DRAW/LOSS scalar proof families PLUS scalar-free Level2 action
// optimality certified via source WDL-order extremum. Does NOT invent
// scalar root outcome for extremal source proof. No alternate future
// GAME VALUE search. Static source permutation witness constructions
// by existing future-column transporter are EXPLICITLY counted.
// Frozen theorem:
// docs/research/2026-10-17-unified-one-certified-best-action-source-protocol.md
import {createUnifiedOneValidBestActionSourceV2} from './standard7x6-unified-one-valid-best-action-source-v2.mjs';
import {createSourceWdlExtremalOneBest} from './standard7x6-source-WDL-order-extremal-one-best.mjs';
import {createSourceFixedTwoColumnSwapWdlOrder} from './standard7x6-source-fixed-two-column-swap-WDL-order.mjs';
export function createUnifiedOneValidBestActionSourceV4({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<1||K<2||
   K>Math.min(W,H)||W*H>42)throw Error('invalid original gravity geometry');
 const geom={width:W,height:H,connect:K},
   prior=createUnifiedOneValidBestActionSourceV2(geom),
   order=createSourceWdlExtremalOneBest(geom),
   fixed=createSourceFixedTwoColumnSwapWdlOrder(geom);
 function compute(q,{priorOptions={},fixedSwapOptions={maxStaticSubsetTests:120000},orderOptions={
  maxOperations:140000,maxMs:100,maxRepresentatives:10000
 }}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
    q.h.some(h=>!Number.isInteger(h)||h<0||h>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(x=>typeof x!=='bigint'||x===0n))
   throw Error('exact first-win-stopped original source q expected');
  const n=q.h.reduce((s,z)=>s+z,0),p=n&1,
   legal=q.h.flatMap((z,c)=>z<H?[c+1]:[]);
  if(n>=W*H||!legal.length)throw Error('nonterminal original q required');
  const previous=prior.compute(q,priorOptions);
  const counters={rootOriginalPly:n,originalCurrentMover:p,
    priorSourceStatus:previous.status,
    v2SourceQStatesMaterializedAlongOneForcedLane:
      previous.statistics?.sourceWinLadderConstructedQCount??0,
    v2MaximumLiveStrategicFutureLane:
      previous.statistics?.sourceGameStrategicFanoutMax??0,
    qualitativeSourceOrderProofOperations:0,
    fixedTwoColumnStaticSourceMaskTests:0,
    fixedSourceLegalActionPairsCompared:0,
    fixedSourcePositiveWdlOrderEdges:0,
    fixedSourceFullColumnPermutationCandidates:0,
    staticColumnPermutationTransportFallbackInvoked:false,
    staticCompletedColumnPermutationWitnesses:0,
    staticSourceFirstActionCofactorDescriptionsConstructed:0,
    scalarRootOutcomeCalculatedByQualitativeSelector:false,
    independentlyValuedStrategicFutureGameValues:0,
    sourceStaticProofSearchMayBranchIntoColumnPermutations:false,
    sourceGameSemanticFutureFanoutMax:
      previous.statistics?.sourceGameStrategicFanoutMax??0};
  if(previous.status==='VALID_CONTINUATION')
   return {...previous,algorithm:'SOURCE_UNIFIED_PROOF_V4',
     v4ProofFamily:'V2_ALREADY_CERTIFIED_WDL_SCALAR',
     v4FixedSwapAndStaticPermutationFallbackNotInvoked:true,
     v4Statistics:counters};
  if(previous.status!=='INCOMPLETE')
   throw Error('previous V2 returned unexpected qualification status');
  // Any one ORIGINAL legal move is optimal if it is the ONLY move.
  // No game VALUE needed and no future q need be calculated by this
  // special operational proof.
  if(legal.length===1)
   return {status:'VALID_CONTINUATION',
    algorithm:'SOURCE_UNIFIED_PROOF_V4',
    type:'PROOF_CARRYING_SOURCE_LEVEL2_BEST_ACTION_SCALAR_UNKNOWN',
    v4ProofFamily:'ONE_ORIGINAL_LEGAL_ACTION_TRIVIALLY_BEST',
    opponentModel:'PERFECT',mover:p,
    selectedOriginalLiteralColumn:legal[0],
    ordinaryRootValueP0Relative:null,bestOutcomeTier:null,
    exactRootOrdinaryWDLCertified:false,
    selectedOriginalActionBestRegardlessOfOutcome:true,
    completeLevel2SetKnown:true,
    allBestOriginalLiteralLabels:legal.slice(),
    sourceCertificate:{soleLegalOriginalLiteralColumn:legal[0],
      noCompetingLegalMovePossible:true},
    sourceIndependentlyValuedFutureGames:0,
    v4Statistics:counters};
  // Direct RAW original source bit-swap and generator containment.
  // Crucially checks a SINGLE predeclared two-column transposition for
  // each equal-height current action-label pair, NEVER enumerates a
  // permutation candidate mapping. No new future game q materialized.
  const direct=fixed.compute(q,fixedSwapOptions);
  counters.fixedTwoColumnStaticSourceMaskTests=
    direct.statistics.exactOriginalGeneratorSubsetChecks;
  counters.fixedSourceLegalActionPairsCompared=
    direct.statistics.originalStaticLiteralActionPairsConsidered;
  counters.fixedSourcePositiveWdlOrderEdges=
    direct.statistics.sourceProvedWeakP0WdlOrderEdges;
  counters.fixedSourceFullColumnPermutationCandidates=
    direct.statistics.sourceCompletedColumnPermutationCandidatesEnumerated;
  if(direct.status==='VALID_CONTINUATION'){
   if(!legal.includes(direct.selectedOriginalLiteralColumn))
    throw Error('source direct swap chose nonlegal original action');
   if(counters.fixedSourceFullColumnPermutationCandidates!==0)
    throw Error('direct source should NOT enumerate full column permutations');
   return {
    status:'VALID_CONTINUATION',
    algorithm:'SOURCE_UNIFIED_PROOF_V4',
    type:'PROOF_CARRYING_SOURCE_LEVEL2_BEST_ACTION_SCALAR_UNKNOWN',
    v4ProofFamily:'DIRECT_FIXED_TWO_COLUMN_SOURCE_WDL_EXTREMUM_ZERO_PERMUTATIONS',
    opponentModel:'PERFECT',mover:p,
    selectedOriginalLiteralColumn:direct.selectedOriginalLiteralColumn,
    ordinaryRootValueP0Relative:null,bestOutcomeTier:null,
    exactRootOrdinaryWDLCertified:false,
    selectedOriginalActionBestRegardlessOfOutcome:true,
    completeLevel2SetKnown:false,allBestOriginalLiteralLabels:null,
    proofOriginalQualitativeWDLOrder:direct.sourceExtremumProofOverAllRootLegalColumns,
    sourceProof:direct,sourceIndependentlyValuedFutureGames:0,
    v4Statistics:counters
   };
  }
  // Existing full-future transport is retained ONLY as a conservative
  // static proof-witness fallback. Its permutation assignment work is
  // logged, unlike the direct branch above.
  counters.staticColumnPermutationTransportFallbackInvoked=true;
  counters.sourceStaticProofSearchMayBranchIntoColumnPermutations=true;
  const proof=order.compute(q,orderOptions);
  counters.qualitativeSourceOrderProofOperations=
    proof.statistics?.sourceColumnTransportOperations??0;
  counters.staticCompletedColumnPermutationWitnesses=
    proof.statistics?.sourceStaticColumnPermutationProofCandidates??0;
  counters.staticSourceFirstActionCofactorDescriptionsConstructed=
    proof.statistics?.staticActionCofactorDescriptionsConstructed??0;
  if(proof.status!=='VALID_CONTINUATION')
   return {status:'INCOMPLETE',algorithm:'SOURCE_UNIFIED_PROOF_V4',
    type:'NO_CURRENT_SOURCE_PROOF_OF_ONE_BEST_FIRST_ACTION',
    opponentModel:'PERFECT',mover:p,
    selectedOriginalLiteralColumn:null,
    ordinaryRootValueP0Relative:null,bestOutcomeTier:null,
    exactRootOrdinaryWDLCertified:false,
    completeLevel2SetKnown:false,
    priorV2Reason:previous.type,
    sourceQualitativeOrderReason:proof.reason,
    sourceIndependentlyValuedFutureGames:0,
    v4Statistics:counters};
  if(!legal.includes(proof.selectedOriginalLiteralColumn))
   throw Error('source optimal-order certificate selected illegal original column');
  return {status:'VALID_CONTINUATION',
    algorithm:'SOURCE_UNIFIED_PROOF_V4',
    type:'PROOF_CARRYING_SOURCE_LEVEL2_BEST_ACTION_SCALAR_UNKNOWN',
    v4ProofFamily:'ENUMERATED_STATIC_COLUMN_TRANSPORT_FALLBACK',
    opponentModel:'PERFECT',mover:p,
    selectedOriginalLiteralColumn:proof.selectedOriginalLiteralColumn,
    ordinaryRootValueP0Relative:null,bestOutcomeTier:null,
    exactRootOrdinaryWDLCertified:false,
    selectedOriginalActionBestRegardlessOfOutcome:true,
    completeLevel2SetKnown:false,
    allBestOriginalLiteralLabels:null,
    proofOriginalQualitativeWDLOrder:proof.proofOfBestAgainstEveryOtherOriginalLegalAction,
    sourceProof:proof,
    sourceIndependentlyValuedFutureGames:0,
    v4Statistics:counters};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
