// Source-only attacker-first co-release pairing: certified full-future
// impossibility of victory for the CURRENT mover, for ALL legal first
// choices at once. First-win terminal/turn/gravity semantics guarded.
// No game continuation branching or solved policy evaluation.
import {createCoReleasePairBlockProof} from './co-release-pair-block-proof.mjs';
export function createCoReleaseGlobalNoWinBound(geometry){
 const {width:W,height:H}=geometry,
  matcher=createCoReleasePairBlockProof(geometry),N=W*H;
 function compute(q,{maxOperations=300000,maxMs=15000}={}){
  const rank=q.h.reduce((a,b)=>a+b,0),mover=rank%2,
   legal=q.h.flatMap((h,c)=>h<H?[c]:[]),
   ownRequirements=mover===0?q.R0:q.R1;
  let proof=null;
  if((N-rank)%2===0&&ownRequirements.length)
   proof=matcher.prove(q.h,ownRequirements,{maxOperations,maxMs});
  const proved=!!proof?.certifiedAttackerWinImpossible;
  const lower=proved&&mover===1?0:-1,
    upper=proved&&mover===0?0:1;
  return {schema:'connect4.global-co-release-attacker-no-win.v0_1',
   legalActionLabels:legal,
   firstActionValueIntervals:legal.map(c=>({literalColumn:c,lower,upper})),
   fullFutureAttackerCanNeverWinCertified:proved,
   originalSourcePairCertificate:proved?proof:null,
   candidateGameSemanticFutureFanout:0,
   statistics:{sourceProofOperations:proof?.statistics.sourceOperations??0,
    matchedPairsConstructed:proof?.sourceBlocks?.length??0,
    originalSourceLiveAttackerRequirements:ownRequirements.length,
    sourceQChildrenMaterialized:0,gameContinuationSearchCalls:0}};
 }
 return Object.freeze({compute,width:W,height:H,connect:geometry.connect});
}
