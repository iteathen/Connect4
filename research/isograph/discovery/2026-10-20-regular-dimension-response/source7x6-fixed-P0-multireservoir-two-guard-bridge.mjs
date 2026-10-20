// Original 7x6 K4 research source: ONE deterministic P0 reply b covers
// EVERY current P1 first-action label by original firstwin cofactor,
// then exact next-P1 exposure Z or new role-agnostic even multireservoir theorem.
// No solved WDL, no historical optimal labels, no future alternative WDL values.
// Current action-label checks are bounded SOURCE conjunction (not zero literal
// conditional branching), no search/backtracking over P0 action b.
import {sourceMultiReservoirResponderWin} from "./source-general-multireservoir-latent-win.mjs";
import {
 H,duplicate,legal,sourceSingletonSites,originalPlace,oneStepExposure
} from "../2026-10-19-causal-defense-ladder/standard7x6-single-forced-opponent-lane-source.mjs";
export function certifyFixedP0ThenGeneralEvenReservoir(q0){
 if(q0.n%2!==1||q0.n>37)
  return {status:"INCOMPLETE",reason:"wrong_P1_original_rank"};
 const missing=sourceSingletonSites(q0,0),latent=[];
 for(const id of missing){
  const c=Math.floor(id/H),r=id%H;
  if(q0.h[c]<H && r>q0.h[c])
   latent.push({c,r,depth:r-q0.h[c]});
 }
 latent.sort((a,b)=>a.depth-b.depth||a.c-b.c||a.r-b.r);
 if(!latent.length)
  return {status:"INCOMPLETE",reason:"no_current_P0_latent_target"};
 const b=latent[0].c,claims=[];
 for(const a of legal(q0)){
  const q=duplicate(q0);
  if(originalPlace(q,a,1))
   return {status:"INCOMPLETE",reason:"P1_firstwins_before_fixed_P0_reply",failedP1:a+1};
  if(q.h[b]>=H)
   return {status:"INCOMPLETE",reason:"fixed_P0_response_full",selectedP0:b+1,failedP1:a+1};
  if(originalPlace(q,b,0)){
   claims.push({P1columnOneBased:a+1,fixedP0columnOneBased:b+1,cert:"P0_FIRSTWIN_NOW"});
   continue;
  }
  if(q.n%2!==1||q.n>39)
   return {status:"INCOMPLETE",reason:"post_pair_outside_guard"};
  const exposure=oneStepExposure(q);
  if(exposure.safe.length===0){
   claims.push({P1columnOneBased:a+1,fixedP0columnOneBased:b+1,
    cert:"ALL_NEXT_P1_ACTIONS_EXPOSE_DIRECT_P0_FIRSTWIN"});
   continue;
  }
  const multi=sourceMultiReservoirResponderWin({
   W:7,H:6,n:q.n,h:q.h,b:q.b
  },4);
  if(multi.status==="SOURCE_PROVED_RESPONDER_FIRST_WIN"&&multi.sourceAPlayer===0){
   claims.push({P1columnOneBased:a+1,fixedP0columnOneBased:b+1,
    cert:"MULTI_EVEN_COLUMN_P0_LATENT_K4_PAIR_CLOCK",sourceCertificate:multi});
   continue;
  }
  return {status:"INCOMPLETE",reason:"some_original_P1_action_unproved",
   failedP1:a+1,fixedP0:b+1,alreadyProved:claims,
   nextCurrentP1SafeLabels:exposure.safe.map(c=>c+1)};
 }
 return {
  status:"SOURCE_PROVED_P0_WIN",
  originalSourceRank:q0.n,
  fixedFirstP0columnOneBased:b+1,
  originalTargetOneBased:[latent[0].c+1,latent[0].r+1],
  allCurrentlyLegalP1labels:claims.length,claims
 };
}
