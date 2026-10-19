// V2 corrected class C dyadic witness field binding before first source/physical measurement.
// Pure ORIGINAL current q=(h,R0,R1) support-mirror FIRST-WIN veto.
// FIXED vertical gravity co-release pairs: if attacker p owns a UPPER
// paired cell, defender o MUST already own its LOWER mate. Therefore
// if one original viable o winning requirement H is entirely among
// LOWER mates of upper cells required by an original attacker G,
// o must have FIRST-WON before p could complete G. Exclude G from
// exposed root-frontier ES hypergraph of ORIGINAL future requirements.
// Remaining original G either contain a full pair, or project onto
// initially playable unpaired root cells F, with dyadic Maker Breaker
// second-respondent criterion < 1/2 for no p FIRST WIN.
// Mathematical theorem FROZEN before canonical/source statistics:
// docs/research/2026-10-18-support-mirror-vertical-pair-causal-first-win-veto.md
// ZERO future game q construction, opponent policy/game WDL evaluation.
export function createOriginalSupportMirrorVerticalPairNoFirstWinV2({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
    K>Math.min(W,H)||W*H>42)throw Error('original game geometry invalid');
 const N=W*H,id=(c,r)=>W*r+c,bit=z=>1n<<BigInt(z);
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 function compute(q){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
    h.some(x=>!Number.isInteger(x)||x<0||x>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('original first-win-stopped q=(h,R0,R1) required');
  const n=h.reduce((a,b)=>a+b,0),p=n&1,o=1-p,remaining=N-n;
  if(remaining<=0)throw Error('original full board');
  let future=0n;for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bit(id(c,r));
  const Rp=p===0?q.R0:q.R1,Ro=o===0?q.R0:q.R1;
  if([...Rp,...Ro].some(G=>(G&~future)!==0n))
   throw Error('original R has nonfuture physical cell');
  const stats={originalRank:n,currentAttacker:p,respondingDefender:o,
   originalAttackerViableGenerators:Rp.length,
   originalDefenderViableGenerators:Ro.length,
   rootCanonicalVerticalCoReleasePairs:0,
   attackerGContainingFullPair:0,
   attackerGPreemptedByOriginalDefenderSupportMirror:0,
   supporterOriginalRSubsetTests:0,
   originalAttackerResidualGRequiringExposedPotential:0,
   emptyExposedRemainingRequirements:0,
   strictESPotentialChecks:0,
   sourceFutureQStatesConstructed:0,
   sourceStrategicallyInequivalentGameValuesEvaluated:0,
   opponentAdaptiveGamePolicyTreeEnumerated:0,
   sourceCurrentOriginalRootScalarWDLComputed:false};
  const pairMasks=[],upperLower=[],pairs=[],F=[];
  let allPair=0n,rootFree=0n;
  for(let c=0;c<W;c++){
   const remain=H-h[c],offset=remain%2;
   if(offset){
    const z=id(c,h[c]);F.push(z);rootFree|=bit(z);
   }
   for(let r=h[c]+offset;r<H;r+=2){
    const low=id(c,r),high=id(c,r+1);
    if(r+1>=H)throw Error('invalid vertical future paired parity');
    const mask=bit(low)|bit(high);
    pairMasks.push(mask);
    upperLower.push({upper:high,lower:low});
    pairs.push({originalColumn:c+1,lowerPhysicalID:low,upperPhysicalID:high});
    allPair|=mask;stats.rootCanonicalVerticalCoReleasePairs++;
   }
  }
  if((allPair&rootFree)!==0n||(allPair|rootFree)!==future)
   throw Error('original root future physical U plus root-free F incomplete');
  const classA=[],classB=[],classC=[],emptyC=[];
  let phiNumerator=0;
  for(let i=0;i<Rp.length;i++){
   const G=Rp[i];
   const covers=pairMasks.findIndex(P=>(G&P)===P);
   if(covers>=0){
    classA.push({attackerOriginalGeneratorIndex:i,
     verticalFullPairIndex:covers});stats.attackerGContainingFullPair++;
    continue;
   }
   let lows=0n,upperCount=0;
   for(const P of upperLower){
    if((G&bit(P.upper))!==0n){lows|=bit(P.lower);upperCount++;}
   }
   let defenderH=-1;
   if(lows!==0n){
    for(let j=0;j<Ro.length;j++){
     stats.supporterOriginalRSubsetTests++;
     if((Ro[j]&lows)===Ro[j]){
      defenderH=j;break;
     }
    }
   }
   if(defenderH>=0){
    classB.push({attackerOriginalGeneratorIndex:i,
     attackerOriginalResidualMaskHex:'0x'+G.toString(16),
     originalDefenderSupportWinningRequirementIndex:defenderH,
     originalDefenderSupportResidualMaskHex:'0x'+Ro[defenderH].toString(16),
     originalLowerSupportMateMaskHex:'0x'+lows.toString(16),
     originalUpperSupportPhysicalEventCount:upperCount,
     temporalConclusion:'RESPONDING_DEFENDER_COMPLETES_ITS_ORIGINAL_LINE_BEFORE_ATTACKER_CAN_COMPLETE_THIS_LINE'});
    stats.attackerGPreemptedByOriginalDefenderSupportMirror++;
    continue;
   }
   const E=G&rootFree,k=pop(E);
   if(!k){
    emptyC.push({attackerOriginalGeneratorIndex:i,
      originalAttackerResidualMaskHex:'0x'+G.toString(16),
      lowerSupportMateMaskHex:'0x'+lows.toString(16),
      attackerUpperPairedCellCount:upperCount});
    stats.emptyExposedRemainingRequirements++;
    continue;
   }
   if(k>K)throw Error('original K-line exposed projection too large');
   const weightNumerator=2**(K-k);
   phiNumerator+=weightNumerator;
   classC.push({attackerOriginalGeneratorIndex:i,
     exposedRootFrontierMaskHex:'0x'+E.toString(16),
     numberOfExposedPhysicalCells:k,
     dyadicWeightNumerator:weightNumerator});
   stats.originalAttackerResidualGRequiringExposedPotential++;
   stats.strictESPotentialChecks++;
  }
  const ESden=2**K,strictHalf=2**(K-1),positive=!emptyC.length&&phiNumerator<strictHalf;
  const data={
   originalRank:n,originalCurrentMover:p,
   responderOriginalOwner:o,
   originalRootHeights:h.slice(),
   originalSourceRCounts:[q.R0.length,q.R1.length],
   rootFullCanonicalPairCount:pairMasks.length,
   rootCanonicalVerticalCoReleasePairPhysicalIDs:pairs,
   originalPairedFutureCellMaskHex:'0x'+allPair.toString(16),
   originalInitiallyPlayableExposedCellMaskHex:'0x'+rootFree.toString(16),
   classAOriginalFullPairBlockedCount:classA.length,
   classBOriginalOppositeSupportLineFirstWinPreemptedCount:classB.length,
   classCOriginalESProjectedRequirementCount:classC.length,
   originalExposedESPotentialDyadicNumerator:phiNumerator,
   originalExposedESPotentialDyadicDenominator:ESden,
   originalESSufficientStrictHalfDyadicThresholdNumerator:strictHalf,
   sourceOriginalFullPairBlockedClasses:classA,
   sourceOriginalSupportMirrorClassBProofWitnesses:classB,
   sourceOriginalESClassCProjectedRequirements:classC,
   sourceOriginalUnprotectedEmptyExposedRequirements:emptyC,
   sourceProvedCurrentMoverCannotFirstWin:positive,
   sourceAllCurrentLegalRootActionsCannotForceWin:positive,
   sourceCurrentFirstActionBestOriginalLiteralColumn:null,
   sourceOrdinaryRootWDL:null,
   statistics:stats
  };
  if(!Rp.length)return {status:'INCOMPLETE_PREVIOUS_MOVER_GENERATORS_ALREADY_EXTINCT',...data};
  if(positive)return {status:'CERTIFIED_ORIGINAL_CURRENT_MOVER_CANNOT_FORCE_FIRST_WIN_SUPPORT_MIRROR_PLUS_ES',...data};
  return {status:'INCOMPLETE_SUPPORT_MIRROR_EXPOSED_ES',
   reason:emptyC.length?
     'ONE_OR_MORE_ORIGINAL_ATTACKER_G_NEITHER_FULL_PAIR_NOR_MIRROR_VETO_AND_ZERO_ROOT_FRONTIER_EXPOSURE':
     'RESIDUAL_ORIGINAL_EXPOSED_ES_DYADIC_POTENTIAL_NOT_STRICTLY_UNDER_HALF',
   ...data};
 }
 return Object.freeze({compute});
}
