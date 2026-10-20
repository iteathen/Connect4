// Original standard7x6 K4: a STRICTLY ONE-ROUND source quantifier
// forall CURRENT P1 label a, exists one legal source-certified P0 b.
// Guards: P0 direct K4 firstwinner; otherwise next P1 Z=1; otherwise
// exact multi-reservoir responder P0 firstwin. Never recurse this macro
// or query numerical future WDL or external solved move annotations.
import {
 duplicate,legal,originalPlace,oneStepExposure
} from "../2026-10-19-causal-defense-ladder/standard7x6-single-forced-opponent-lane-source.mjs";
import {sourceMultiReservoirResponderWin} from "./source-general-multireservoir-latent-win.mjs";

export function sourceOneRoundP0Win(q0){
 if(q0.n%2!==1||q0.n>37)
  return {status:"INCOMPLETE",reason:"source_not_odd_P1_rank_le37"};
 const claims=[];let testedCurrentPairs=0;
 for(const a of legal(q0)){
  const qa=duplicate(q0);
  if(originalPlace(qa,a,1))
   return {status:"INCOMPLETE",reason:"P1_immediate_firstwin",
    firstP1ColumnOneBased:a+1,sourcePairsChecked:testedCurrentPairs};
  let proof=null;
  for(const b of legal(qa)){
   testedCurrentPairs++;
   const qab=duplicate(qa);
   if(originalPlace(qab,b,0)){
    proof={P1columnOneBased:a+1,P0replyColumnOneBased:b+1,
      sourceCertificate:"ORIGINAL_DIRECT_P0_K4_FIRSTWIN"};
    break;
   }
   const E=oneStepExposure(qab);
   if(E.safe.length===0){
    proof={P1columnOneBased:a+1,P0replyColumnOneBased:b+1,
      sourceCertificate:"ORIGINAL_Z_UNIVERSAL_NEXT_P1_IMMEDIATE_EXPOSURE"};
    break;
   }
   const multi=sourceMultiReservoirResponderWin({
    W:7,H:6,n:qab.n,h:qab.h,b:qab.b
   },4);
   if(multi.status==="SOURCE_PROVED_RESPONDER_FIRST_WIN"&&multi.sourceAPlayer===0){
    proof={P1columnOneBased:a+1,P0replyColumnOneBased:b+1,
      sourceCertificate:"ORIGINAL_GUARDED_MULTI_EVEN_PAIR_RESERVOIR",multi};
    break;
   }
  }
  if(!proof)return {status:"INCOMPLETE",reason:"one_P1_label_lacks_ANY_local_source_P0_certificate",
    failedP1ColumnOneBased:a+1,sourcePairsChecked:testedCurrentPairs,
    coveredEarlierP1Branches:claims};
  claims.push(proof);
 }
 return {status:"SOURCE_PROVED_P0_WIN",originalSourceRank:q0.n,
  method:"ORIGINAL_ONE_ROUND_FORALL_P1_EXISTS_P0_BOUNDED_SOURCE_CLAUSE",
  actualCurrentP1Labels:claims.length,sourcePairsChecked:testedCurrentPairs,
  sourceWinningResponseTable:claims};
}
