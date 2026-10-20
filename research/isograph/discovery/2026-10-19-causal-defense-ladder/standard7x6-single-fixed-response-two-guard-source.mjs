// Original 7x6K4: ONE deterministic P0 current response column
// that covers ALL original current P1 action labels by source-only guards.
// Current action cofactors are inspected, NO future strategic game WDL is evaluated.
// This is not literally zero cofactor materialization; it is one-response source
// certification, and INCOMPLETE if ANY original opponent action fails its guard.
import {
  W,H,duplicate,legal,sourceSingletonSites,originalPlace,oneStepExposure,
} from "./standard7x6-single-forced-opponent-lane-source.mjs";
import {proveTwoColumnPairClock} from "./standard7x6-two-column-latent-pair-clock-source.mjs";

export function proveFixedResponseTwoSourceGuards(initial) {
  if(initial.n%2!==1 || initial.n>37)
    return {status:"INCOMPLETE",reason:"not_P1_odd_rank_le37"};
  // P0 currently owns the other three cells of at least one genuine original
  // K4; its missing target lies strictly beyond the current playable frontier.
  const missing=sourceSingletonSites(initial,0);
  const latent=[];
  for(const encoded of missing){
    const c=Math.floor(encoded/H),r=encoded%H;
    if(initial.h[c]<H && r>initial.h[c])
      latent.push({c,r,supportDistance:r-initial.h[c]});
  }
  latent.sort((a,b)=>a.supportDistance-b.supportDistance||a.c-b.c||a.r-b.r);
  if(latent.length===0)
    return {status:"INCOMPLETE",reason:"no_original_P0_latent_target_column"};
  const b=latent[0].c,claims=[];
  // This is a finite direct source conjunction over CURRENT P1 action labels.
  // NO alternative P0 response columns are tried.
  for(const a of legal(initial)){
    const q=duplicate(initial);
    if(originalPlace(q,a,1))
      return {status:"INCOMPLETE",reason:"P1_already_firstwins",failedP1Column:a+1};
    if(q.h[b]===H)
      return {status:"INCOMPLETE",reason:"fixed_P0_response_illegal",
        selectedP0Column:b+1,failedP1Column:a+1};
    if(originalPlace(q,b,0)){
      claims.push({P1Column:a+1,fixedP0Column:b+1,source:"P0_DIRECT_TERMINAL"});
      continue;
    }
    if(q.n%2!==1 || q.n>39)
      return {status:"INCOMPLETE",reason:"next_source_rank_out_of_guard"};
    const next=oneStepExposure(q);
    if(next.safe.length===0){
      claims.push({P1Column:a+1,fixedP0Column:b+1,
        source:"ALL_P1_NEXT_RESPONSES_EXPOSE_IMMEDIATE_P0_WIN"});
      continue;
    }
    const timer=proveTwoColumnPairClock(q);
    if(timer.status==="SOURCE_PROVED_P0_WIN"){
      claims.push({P1Column:a+1,fixedP0Column:b+1,
        source:"TWO_COLUMN_LATENT_P0_PAIR_QUOTA",guardCertificate:timer});
      continue;
    }
    return {status:"INCOMPLETE",reason:"current_opponent_label_not_source_covered",
      selectedP0Column:b+1,failedP1Column:a+1,
      coveredBeforeFailure:claims,sourceNextSafeP1:next.safe.map(x=>x+1)};
  }
  return {status:"SOURCE_PROVED_P0_WIN",method:"ONE_FIXED_REPLY_TWO_SOURCE_GUARDS",
    sourceRootRank:initial.n, fixedP0ColumnOneBased:b+1,
    rootP0LatentTargetCellOneBased:[latent[0].c+1,latent[0].r+1],
    firstResponseCurrentP1LabelsCovered:claims.length,eachP1sourceCase:claims};
}
