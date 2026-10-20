// Proof-carrying source-only P0 WIN sufficient theorem for original 7x6 K4.
// Two remaining playable columns: latent P0 firstwin directly ABOVE dangerous A,
// even safe-disposal column B with deterministic P1-lower/P0-upper pairs.
// No strong-solver labels, historical perfect move data or future game-value search.
import {
 W,H,duplicate,legal,sourceSingletonSites,originalPlace
} from "./standard7x6-single-forced-opponent-lane-source.mjs";
export function proveTwoColumnPairClock(initial) {
  if(initial.n%2!==1 || initial.n>39)
    return {status:"INCOMPLETE",reason:"not_original_P1_turn"};
  const live=legal(initial);
  if(live.length!==2)return {status:"INCOMPLETE",reason:"not_exactly_two_live_columns"};
  const P0=sourceSingletonSites(initial,0);
  for(const A of live){
    const B=live.find(c=>c!==A);
    const capacityA=H-initial.h[A],capacityB=H-initial.h[B];
    if(capacityA<2||capacityB<2||capacityB%2!==0)continue;
    const latentA=(A*H+initial.h[A]+1);
    if(!P0.has(latentA))continue;
    const q=duplicate(initial),steps=[],pairQuota=capacityB/2;
    let violated=null,earlyP0Win=false;
    for(let j=0;j<=pairQuota;j++){
      const P1=sourceSingletonSites(q,1);
      const immediateP1inA=P1.has(A*H+q.h[A]);
      if(immediateP1inA){violated="P1_immediate_in_danger_column";break;}
      if(j===pairQuota)break;
      const immediateP1inB=P1.has(B*H+q.h[B]);
      if(immediateP1inB){violated="P1_immediate_in_resource_column";break;}
      const p1landing=q.h[B],p0landing=p1landing+1;
      if(q.h[B]+1>=H){violated="P0_upper_mate_capacity";break;}
      if(originalPlace(q,B,1)){
        throw Error("P1 original win was missed by SOURCE singleton before placement");
      }
      const p0won=originalPlace(q,B,0);
      steps.push({pairIndex:j,forcedP1Column:B+1,P1rowOneBased:p1landing+1,
        fixedP0Column:B+1,P0rowOneBased:p0landing+1,
        pairedResourceBefore:pairQuota-j,
        actualP0FirstWinsOnMate:p0won});
      if(p0won){earlyP0Win=true;break;}
    }
    if(violated)continue;
    let conclusion;
    if(earlyP0Win) {
      conclusion="P0_firstwins_on_same_column_mate";
    }else{
      if(q.h[B]!==H||q.h[A]!==initial.h[A])throw Error("pair consumption invariant");
      if(originalPlace(q,A,1))
        throw Error("P1 original danger-column preemption missed by source");
      if(!sourceSingletonSites(q,0).has(A*H+q.h[A]))
        throw Error("latent upper P0 winning singleton not released");
      const finalP0row=q.h[A]+1;
      if(!originalPlace(q,A,0))
        throw Error("P0 final K4 singleton not firstwinning");
      conclusion="P0_firstwins_after_safe_resource_exhaustion";
      steps.push({pairIndex:pairQuota,P1forcedDangerColumn:A+1,
        fixedP0WinningColumn:A+1,P0rowOneBased:finalP0row});
    }
    return {status:"SOURCE_PROVED_P0_WIN",method:"two_column_latent_pair_clock",
      atRank:initial.n,dangerColumnOneBased:A+1,
      onlySafeReservoirColumnOneBased:B+1,
      initialDangerRemaining:capacityA,
      initialReservoirRemaining:capacityB,
      sourceOwnedP0WinningSiteOneBased:[A+1,initial.h[A]+2],
      forcedSafePairQuota:pairQuota,
      terminalAbsolutePly:q.n,
      conclusion,certificate:steps};
  }
  return {status:"INCOMPLETE",reason:"no_valid_two_column_latent_source_pair_clock"};
}
