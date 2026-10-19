// Exact same frozen RNG/sampling and old SOURCE counters. New mirror+dual only
// classifies the SAME genuine q; no physical WDL/old V4/nonbijective queried.
// FROZEN before the 2500-game same-population source run.
// ORIGINAL W7 H6 K4 sampled true first-win-stopped ROOT q, before any
// independent full physical WDL / old V4 / older full co-release source.
// SOURCE ONLY search for a qualifying hybrid original-q full-future loss
// structural certificate. No game children, prospective move evaluation,
// opponent policy enumeration or minimax in the PROVER.
// Frozen theorem: docs/research/2026-10-18-gravity-vertical-pair-projection-erdos-selfridge-obligation-debt.md
import {createVerticalPairExposedPotentialDualLossV2} from './standard7x6-source-vertical-pair-exposed-potential-dual-loss-v2.mjs';
import {createOriginalSupportMirrorVerticalPairNoFirstWinV2} from './standard7x6-source-support-mirror-vertical-pair-firstwin-veto-v2.mjs';
import {createSourceFractionalTransversal} from '../2026-10-17-zero-fanout-direct-invariants/standard7x6-source-fractional-transversal.mjs';
export function runFrozenSupportMirrorLossVsOldESFullSameCorpus({
 seed=20261018,games=2500,rankMin=15,rankMax=38,minLegal=2,
 maxSourcePositiveWitnesses=25
}={}){
 const W=7,H=6,N=42,id=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z),winlines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xy=Array.from({length:4},(_,k)=>[c+k*dc,r+k*dr]);
  if(xy.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H))
   winlines.push(xy.map(([a,b])=>id(a,b)));
 }
 if(winlines.length!==69)throw Error('original geometry must have exactly 69 K4 windows');
 let state=seed>>>0;
 function rand(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
 function pop(x){let z=0;for(;x;x&=x-1n)z++;return z;}
 function minAntichain(masks){
  const v=[...new Set(masks)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const G of v)if(!out.some(F=>(G&F)===F))out.push(G);
  return out;
 }
 function originalQ(board,h){
  const R=[0,1].map(p=>{
   const xs=[];
   for(const L of winlines){
    if(L.some(z=>board[z]===1-p))continue;
    let G=0n;for(const z of L)if(board[z]===-1)G|=bit(z);
    if(G===0n)throw Error('sample q already has original completed first-winning line');
    xs.push(G);
   }
   return minAntichain(xs);
  });
  return {h:h.slice(),R0:R[0],R1:R[1]};
 }
 function avoidsNextFirstWin(board,c,h,p){
  const z=id(c,h);board[z]=p;
  const won=winlines.some(L=>L.includes(z)&&L.every(t=>board[t]===p));
  board[z]=-1;return !won;
 }
 const source=createVerticalPairExposedPotentialDualLossV2({width:W,height:H,connect:4});
 const mirror=createOriginalSupportMirrorVerticalPairNoFirstWinV2({width:W,height:H,connect:4});
 const dual=createSourceFractionalTransversal({width:W,height:H,connect:4});
 const marginal={newOriginalNoWinObservations:0,
   newDistinctOriginalQCount:0,
   sourceForcedOpponentFirstWinAndRootLossObservations:0,
   sourceSelectedDistinctRootLossCandidates:0,
   sourceOriginalRootFirstTouchCompared:false,
   originalFutureGameWDLQueries:0,
   physicalMinimaxUsed:false};
 const noWinCandidates=[],lossCandidates=[],selectedNoWin=new Set(),selectedLoss=new Set();
 const stats={seed,games,rankMin,rankMax,minLegal,
  originalK4Lines:69,
  actualFirstWinFreePhysicalHistoriesGenerated:0,
  sampledGenuineOriginalQNotDeduplicated:0,
  realSourcePositionsWithR_pNonempty:0,
  exposedProjectionHasEmptyRequirement:0,
  potentialNotStrictlyBelowHalf:0,
  sourceVerticalPairESPotentialStrictBelowHalf:0,
  potentialStrictWithSomeGNotAlreadyPairCovered:0,
  strictPotentialWithOverloadFractionalDualNotFound:0,
  sourceHybridWithOpponentOverloadProvedRootLoss:0,
  sourcePositiveRootsWithAtLeastTwoLegalMoves:0,
  sourceFullFutureGameValueQueries:0,
  sourceChildGameStatesConstructed:0,
  sourceOpponentGamePolicyTreesEnumerated:0,
  noFrozenOldFullPairingSourceOrV4Invoked:true},
 potentialExamples=[],sourcePositives=[],rankCounts={},seenPositive=new Set();
 for(let g=0;g<games;g++){
  const board=Array(42).fill(-1),h=Array(W).fill(0);let history='';
  for(let t=0;t<N;t++){
   if(t>=rankMin&&t<=rankMax&&h.filter(z=>z<H).length>=minLegal){
    stats.sampledGenuineOriginalQNotDeduplicated++;
    rankCounts[t]=(rankCounts[t]||0)+1;
    const q=originalQ(board,h);
    if(q[t%2?'R1':'R0'].length){
     stats.realSourcePositionsWithR_pNonempty++;
     const r=source.compute(q);
     const mirrored=mirror.compute(q);
     const oldPass=r.sourceProvenNoMoverFirstWin===true||
       r.status==='SOURCE_CERTIFIED_CURRENT_MOVER_FORCED_LOSS_VERTICAL_PAIR_EXPOSED_ES_PLUS_DUAL';
     if(mirrored.sourceProvedCurrentMoverCannotFirstWin&&!oldPass){
      marginal.newOriginalNoWinObservations++;
      const fingerprint=h.join(',')+'|'+q.R0.join(',')+'|'+q.R1.join(',');
      if(!selectedNoWin.has(fingerprint)){
       selectedNoWin.add(fingerprint);
       marginal.newDistinctOriginalQCount++;
       if(noWinCandidates.length<30)
        noWinCandidates.push({firstOriginalLegalHistory:history,ply:t,
         mover:t&1,heights:h.slice(),RCounts:[q.R0.length,q.R1.length],
         supportMirrorPreemptions:mirrored.classBOriginalOppositeSupportLineFirstWinPreemptedCount,
         strictESDyadicNumerator:mirrored.originalExposedESPotentialDyadicNumerator,
         originalNoWinOnly:true});
      }
      const opposition=dual.prove({h:h.slice(),R:[q.R0,q.R1]},1-(t&1));
      if(opposition.status==='CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN'){
       marginal.sourceForcedOpponentFirstWinAndRootLossObservations++;
       if(!selectedLoss.has(fingerprint)){
        selectedLoss.add(fingerprint);
        marginal.sourceSelectedDistinctRootLossCandidates++;
        if(lossCandidates.length<120)
         lossCandidates.push({firstOriginalLegalHistory:history,
          originalCurrentPly:t,originalCurrentMover:t&1,
          originalHeights:h.slice(),originalSourceR0:q.R0.map(G=>'0x'+G.toString(16)),
          originalSourceR1:q.R1.map(G=>'0x'+G.toString(16)),
          originalLegalFirstColumns:h.flatMap((z,c)=>z<H?[c+1]:[]),
          rootP0RelativeSourceCertifiedWDL:(1-(t&1))===0?1:-1,
          selectedValidOneOriginalBestColumn:h.findIndex(z=>z<H)+1,
          sourceOpposingOriginalFractionalPacking:opposition.witness,
          originalSupportMirrorClassBCount:mirrored.classBOriginalOppositeSupportLineFirstWinPreemptedCount,
          originalSourcePotentialExactNumerator:mirrored.originalExposedESPotentialDyadicNumerator,
          oldESNoWinSourceFailedStatus:r.status,
          noStrategicFutureGameValueQueries:true});
       }
      }
     }
     const label=r.status;
     if(label==='INCOMPLETE_VERTICAL_PAIRS_EXPOSED_POTENTIAL_NOT_STRICTLY_BELOW_HALF'){
      if(r.projectedOriginalSourceEmptyRequirements>0)
       stats.exposedProjectionHasEmptyRequirement++;
      else stats.potentialNotStrictlyBelowHalf++;
     }else if(label==='INCOMPLETE_OPPONENT_HAS_NO_WIN_REQUIREMENTS'||
      label==='INCOMPLETE_NO_OPPONENT_ORIGINAL_FRACTIONAL_OVERLOAD_WITNESS'||
      label==='SOURCE_CERTIFIED_CURRENT_MOVER_FORCED_LOSS_VERTICAL_PAIR_EXPOSED_ES_PLUS_DUAL'){
      stats.sourceVerticalPairESPotentialStrictBelowHalf++;
      if(r.originalMoverUncoveredOriginalGeneratorCount>0)
       stats.potentialStrictWithSomeGNotAlreadyPairCovered++;
      if(potentialExamples.length<18)potentialExamples.push({history,n:t,sourceStatus:label,
       h:h.slice(),RCounts:[q.R0.length,q.R1.length],
       sourceExposedDyadicWeightNumerator:r.exactErdosSelfridgeDyadicWeightNumerator,
       sourceExposedDyadicWeightDenominator:r.exactErdosSelfridgeDyadicWeightDenominator,
       projectedUncoveredOriginalWinRequirements:r.originalMoverUncoveredOriginalGeneratorCount,
       originalPairCount:r.originalPairBlocksHex?.length});
      if(label==='INCOMPLETE_NO_OPPONENT_ORIGINAL_FRACTIONAL_OVERLOAD_WITNESS')
       stats.strictPotentialWithOverloadFractionalDualNotFound++;
      if(label==='SOURCE_CERTIFIED_CURRENT_MOVER_FORCED_LOSS_VERTICAL_PAIR_EXPOSED_ES_PLUS_DUAL'){
       stats.sourceHybridWithOpponentOverloadProvedRootLoss++;
       if(r.rootOriginalLegalFirstColumns.length>=2)
        stats.sourcePositiveRootsWithAtLeastTwoLegalMoves++;
       const signature=h.join(',')+'|'+q.R0.join(',')+'|'+q.R1.join(',');
       if(sourcePositives.length<maxSourcePositiveWitnesses&&!seenPositive.has(signature)){
        seenPositive.add(signature);
        sourcePositives.push({
         genuineOriginalHistory:history,ply:t,
         originalHeights:h.slice(),
         originalRCounts:[q.R0.length,q.R1.length],
         originalLiteralLegalColumns:r.rootOriginalLegalFirstColumns,
         selectedOriginalBestColumn:r.sourceSelectedOneBestOriginalColumn,
         exactOriginalRootP0RelativeWDLCertified:r.ordinaryRootWDL,
         sourceFullCertificate:r
        });
       }
      }
     }else if(label!=='INCOMPLETE_PREVIOUS_EXTINCT_MOVER_R_ALREADY_APPLIES'){
      throw Error('unrecognized frozen SOURCE outcome '+label);
     }
    }
   }
   const options=[];
   for(let c=0;c<W;c++)if(h[c]<H&&avoidsNextFirstWin(board,c,h[c],t%2))options.push(c);
   if(!options.length)break;
   const c=options[rand()%options.length],z=id(c,h[c]++);
   board[z]=t&1;history+=String(c+1);
  }
  stats.actualFirstWinFreePhysicalHistoriesGenerated++;
 }
 return {schema:'connect4.original7x6.support_mirror_extra_no_win_and_dual_root_loss_preoracle_full_same_2500game_v0_1',
  date:'2026-10-18',status:'SOURCE_CANDIDATE_SELECTION_FROZEN_BEFORE_PHYSICAL_WDL_AND_ALL_PRIOR_SOURCE_V4_COMPARISON',
  exactSameFrozenRandomInputs:{seed,games,rankMin,rankMax,minLegal},
  originalLegacyGeneratorBaseline:{
   observedRealFirstWinFreeQ:stats.sampledGenuineOriginalQNotDeduplicated,
   legacyOldExposedESNoWin:stats.sourceVerticalPairESPotentialStrictBelowHalf,
   legacyOldExposedESAndDualSourceLOSS:stats.sourceHybridWithOpponentOverloadProvedRootLoss},
  sourceMarginalStats:marginal,
  firstThirtyDistinctNewNoWinSourceRootExamples:noWinCandidates,
  selectedDistinctFullCurrentMoverLOSSSourceRootProofs:lossCandidates,
  originalCanonical44444Best:'INCOMPLETE',
  original7x6FutureGameWDLValuesBySource:0,
  independentPhysicalWDLOrV4NeverCalled:true};
}
