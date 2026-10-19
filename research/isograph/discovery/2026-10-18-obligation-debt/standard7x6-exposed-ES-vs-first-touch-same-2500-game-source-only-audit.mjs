// SAME frozen 2500 seeded game population and FIRST-WIN-FREE q; add direct
// first-touch prior-source comparison to every STRICT hybrid ES potential
// no-win positive. NO physical minimax, no V4, no future game values.
// ORIGINAL W7 H6 K4 sampled true first-win-stopped ROOT q, before any
// independent full physical WDL / old V4 / older full co-release source.
// SOURCE ONLY search for a qualifying hybrid original-q full-future loss
// structural certificate. No game children, prospective move evaluation,
// opponent policy enumeration or minimax in the PROVER.
// Frozen theorem: docs/research/2026-10-18-gravity-vertical-pair-projection-erdos-selfridge-obligation-debt.md
import {createVerticalPairExposedPotentialDualLossV2} from './standard7x6-source-vertical-pair-exposed-potential-dual-loss-v2.mjs';
import {createSourceFirstTouchGateBlockerNoWin} from '../2026-10-17-zero-fanout-direct-invariants/standard7x6-source-first-touch-gate-blocker-no-win.mjs';
export function runFrozenVerticalExposedESVsFirstTouchSameCorpusAudit({
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
 const priorFirstTouch=createSourceFirstTouchGateBlockerNoWin({width:W,height:H,connect:4});
 const stats={seed,games,rankMin,rankMax,minLegal,
  originalK4Lines:69,
  actualFirstWinFreePhysicalHistoriesGenerated:0,
  sampledGenuineOriginalQNotDeduplicated:0,
  realSourcePositionsWithR_pNonempty:0,
  exposedProjectionHasEmptyRequirement:0,
  potentialNotStrictlyBelowHalf:0,
  sourceVerticalPairESPotentialStrictBelowHalf:0,
  priorFirstTouchNoWinCertifiedAmongStrictPotential:0,
  priorFirstTouchIncompleteAmongStrictPotential:0,
  strictPotentialWithUncoveredNotTouchCertified:0,
  potentialStrictWithSomeGNotAlreadyPairCovered:0,
  strictPotentialWithOverloadFractionalDualNotFound:0,
  sourceHybridWithOpponentOverloadProvedRootLoss:0,
  sourcePositiveRootsWithAtLeastTwoLegalMoves:0,
  sourceFullFutureGameValueQueries:0,
  sourceChildGameStatesConstructed:0,
  sourceOpponentGamePolicyTreesEnumerated:0,
  noFrozenOldFullPairingSourceOrV4Invoked:true},
 potentialExamples=[],sourcePositives=[],rankCounts={},seenPositive=new Set(),marginalAgainstFirstTouch=[];
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
     const label=r.status;
     if(['INCOMPLETE_OPPONENT_HAS_NO_WIN_REQUIREMENTS',
       'INCOMPLETE_NO_OPPONENT_ORIGINAL_FRACTIONAL_OVERLOAD_WITNESS',
       'SOURCE_CERTIFIED_CURRENT_MOVER_FORCED_LOSS_VERTICAL_PAIR_EXPOSED_ES_PLUS_DUAL'].includes(label)){
      const old=priorFirstTouch.compute(q);
      if(old.status==='CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN')
       stats.priorFirstTouchNoWinCertifiedAmongStrictPotential++;
      else{
       stats.priorFirstTouchIncompleteAmongStrictPotential++;
       if(r.originalMoverUncoveredOriginalGeneratorCount>0)
        stats.strictPotentialWithUncoveredNotTouchCertified++;
       if(marginalAgainstFirstTouch.length<25){
        marginalAgainstFirstTouch.push({history,n:t,heights:h.slice(),
         sourceRCounts:[q.R0.length,q.R1.length],
         oldFirstTouchStatus:old.status,
         sourceExposedDyadicPotentialNumerator:r.exactErdosSelfridgeDyadicWeightNumerator,
         originalMakerUncoveredGeneratorCount:r.originalMoverUncoveredOriginalGeneratorCount,
         originalNewHybridSourceStatus:label});
       }
      }
     }
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
 return {schema:'connect4.original7x6.vertical_pair_ES_exposed_frontier_dual_preoracle_v0_1',
  date:'2026-10-18',
  sourceTheorem:'docs/research/2026-10-18-gravity-vertical-pair-projection-erdos-selfridge-obligation-debt.md',
  sourceCode:'research/isograph/discovery/2026-10-18-obligation-debt/standard7x6-source-vertical-pair-exposed-potential-dual-loss-v2.mjs',
  resultStatus:'FROZEN_SAME_2500_GAME_SAME_SEED_ROOT_CORPUS_HYBRID_EXPOSED_POTENTIAL_VS_PRIOR_FIRST_TOUCH_NO_WIN',
  exactSourceInputs:{seed,games,rankMin,rankMax,minLegal,maxSourcePositiveWitnesses},
  stats,sourceRankObservationHistogram:rankCounts,
  positiveSourceRoots:sourcePositives,firstPotentialStrictExampleRoots:potentialExamples,
  sourceNoWinMarginalAgainstEarlierFirstTouchRootExamples:marginalAgainstFirstTouch,
  neverQueriedPhysicalMinimaxOrUnchangedV4:true,
  remainingProofScope:'SOURCE only; even full positive remains unqualified until independently checked actual7x6 physical; nonuniform repeated roots'};
}
