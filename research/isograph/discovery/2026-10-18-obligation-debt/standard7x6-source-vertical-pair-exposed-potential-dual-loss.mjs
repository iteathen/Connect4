// PURE original q=(h,R0,R1) full-future LOSS certificate combining:
// (1) deterministic vertical gravity co-release PAIRED cells;
// (2) classical Erdos-Selfridge Breaker SECOND potential < 1/2 on
//     virtual p-owned pair region's exposed INITIAL FRONTIER residuals;
// (3) previously frozen original opponent winline fractional packing > 
//     CURRENT MOVER remaining full-board blocking turn capacity.
// NO future q states / WDL/action values, opponent policy trees, or
// hypothetically complete game move words are SOURCE evaluated.
// Mathematical theorem frozen first:
// docs/research/2026-10-18-gravity-vertical-pair-projection-erdos-selfridge-obligation-debt.md
import {createSourceFractionalTransversal} from '../2026-10-17-zero-fanout-direct-invariants/standard7x6-source-fractional-transversal.mjs';
export function createVerticalPairExposedPotentialDualLoss({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
   K>Math.min(W,H)||W*H>42)throw Error('invalid original board geometry');
 const N=W*H,bit=z=>1n<<BigInt(z),cell=(c,r)=>r*W+c;
 const fractional=createSourceFractionalTransversal({width:W,height:H,connect:K});
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 function compute(q,{denominators=[1,2,3,4,6,8,12]}={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
    h.some(v=>!Number.isInteger(v)||v<0||v>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(G=>typeof G!=='bigint'||G<=0n))
   throw Error('genuine FIRST-WIN-FREE nonterminal source q needed');
  const n=h.reduce((a,b)=>a+b,0),T=N-n,p=n&1,o=1-p;
  if(T<1)throw Error('original full board');
  const attacker=p===0?q.R0:q.R1,defender=o===0?q.R0:q.R1;
  const originalLegal=h.flatMap((v,c)=>v<H?[c+1]:[]);
  let allFuture=0n;
  for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)allFuture|=bit(cell(c,r));
  if([...attacker,...defender].some(G=>(G&~allFuture)!==0n))
   throw Error('original surviving generator outside future support');
  const ops={sourceAttackerOriginalGeneratorsChecked:0,
   sourceOriginalVerticalConsecutivePairsBuilt:0,
   sourceOriginalPhysicalPairContainmentTests:0,
   sourceExposedDyadicWeightTerms:0,
   sourceOriginalDefenderDualWeightVectors:0,
   sourceOriginalDefenderDualPhysicalIncidenceChecks:0,
   sourceOriginalDefenderDualNumeratorCapacityChecks:0,
   sourceFutureGameStatesConstructed:0,sourceAlternativeStrategicGameWDLQueries:0,
   sourceOpponentPolicySearchPaths:0};
  const base={kind:'SOURCE_VERTICAL_CO_RELEASE_PAIR_EXPOSED_FRONTIER_POTENTIAL_PLUS_DUAL_OVERLOAD',
   originalRootPly:n,originalMover:p,originalRespondingDefender:o,
   originalRootHeights:h.slice(),originalViableMoverGeneratorCount:attacker.length,
   originalViableResponderGeneratorCount:defender.length,
   originalRemainingFutureCells:T,
   rootOriginalLegalFirstColumns:originalLegal,
   selectedOneValidOriginalFirstColumn:null,ordinaryRootWDL:null,
   sourceNoFutureGameValueQueries:true,statistics:ops};
  if(!attacker.length)return {status:'INCOMPLETE_PREVIOUS_EXTINCT_MOVER_R_ALREADY_APPLIES',
    reason:'R_P_EMPTY_OLD_CERTIFICATE',...base};
  const pairMasks=[],mateMap=[];
  let pairedMask=0n,unpairedMask=0n;
  for(let c=0;c<W;c++){
   const remain=H-h[c],offset=remain%2;
   if(offset){
    const f=bit(cell(c,h[c]));unpairedMask|=f;
   }
   for(let r=h[c]+offset;r<H;r+=2){
    const low=cell(c,r),high=cell(c,r+1),mask=bit(low)|bit(high);
    if(r+1>=H)throw Error('unpaired future top event in vertical pair');
    if(pairedMask&mask)throw Error('overlapping source vertical pairs');
    pairedMask|=mask;pairMasks.push(mask);mateMap.push([low,high]);
    ops.sourceOriginalVerticalConsecutivePairsBuilt++;
   }
  }
  if((pairedMask&unpairedMask)!==0n||(pairedMask|unpairedMask)!==allFuture)
   throw Error('pair region and root frontier free cells do not partition all future original cells');
  const projected=[],coveringPairWitnesses=[],uncoveredOriginalSourceIndices=[];
  let dyadicInteger=0,emptyProjectedCount=0;
  for(let i=0;i<attacker.length;i++){
   const G=attacker[i];ops.sourceAttackerOriginalGeneratorsChecked++;
   const pairIndex=pairMasks.findIndex(pair=>{
    ops.sourceOriginalPhysicalPairContainmentTests++;return (G&pair)===pair;
   });
   if(pairIndex>=0){
    coveringPairWitnesses.push({originalMoverGeneratorIndex:i,
     sourceCoveredByVerticalPairIndex:pairIndex});
    continue;
   }
   const rem=G&unpairedMask;
   if((rem&~unpairedMask)!==0n)throw Error('projected requirement outside original exposed frontier');
   const k=pop(rem);
   uncoveredOriginalSourceIndices.push(i);
   if(k===0){emptyProjectedCount++;continue;}
   if(k>K)throw Error('original residual K-line projected cardinality beyond K');
   dyadicInteger+=2**(K-k);
   ops.sourceExposedDyadicWeightTerms++;
   projected.push({originalMoverGeneratorIndex:i,
    rootExposedFutureCellMaskHex:'0x'+rem.toString(16),
    originalExposedResidualCellCount:k});
  }
  const exposed={
   originalPairBlocksHex:pairMasks.map(x=>'0x'+x.toString(16)),
   originalPhysicalPairMemberIDsZeroBased:mateMap,
   originalPairedFuturePhysicalCellsHex:'0x'+pairedMask.toString(16),
   originalExposedInitiallyPlayablePhysicalCellMaskHex:'0x'+unpairedMask.toString(16),
   originalMoverPairCoveredOriginalGeneratorCount:coveringPairWitnesses.length,
   originalMoverUncoveredOriginalGeneratorCount:uncoveredOriginalSourceIndices.length,
   sourcePairCoverWitnesses:coveringPairWitnesses,
   originalExposedProjectedRequirementWitnesses:projected,
   projectedOriginalSourceEmptyRequirements:emptyProjectedCount,
   exactErdosSelfridgeDyadicWeightNumerator:dyadicInteger,
   exactErdosSelfridgeDyadicWeightDenominator:2**K,
   exactErdosSelfridgeStrictHalfThresholdNumerator:2**(K-1),
   exposedOriginalGravityRequirementFrontierOnly:true};
  if(emptyProjectedCount||dyadicInteger>=2**(K-1))
   return {status:'INCOMPLETE_VERTICAL_PAIRS_EXPOSED_POTENTIAL_NOT_STRICTLY_BELOW_HALF',
    reason:emptyProjectedCount?'EXPOSED_SOURCE_REQUIREMENT_EMPTY':
      'EXPOSED_ORIGINAL_MAKER_BREAKER_DYADIC_POTENTIAL_GE_HALF',
    sourceProvenNoMoverFirstWin:false,...exposed,...base};
  // The ES criterion applies to exactly the source initially playable
  // F exposed cells. All delayed pair cells are virtually Maker-owned
  // for this INDEPENDENT upper-bound game, while responding defender
  // pairs immediately when Maker touches pair region.
  if(defender.length===0)return {status:'INCOMPLETE_OPPONENT_HAS_NO_WIN_REQUIREMENTS',
   sourceProvenNoMoverFirstWin:true,...exposed,...base};
  const fractionalResult=fractional.prove({h:h.slice(),R:[q.R0,q.R1]},o,{denominators});
  ops.sourceOriginalDefenderDualWeightVectors=
    fractionalResult.statistics.attemptedStaticWeightVectors;
  ops.sourceOriginalDefenderDualPhysicalIncidenceChecks=
    fractionalResult.statistics.witnessCellIncidenceChecks;
  if(fractionalResult.status!=='CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN')
   return {status:'INCOMPLETE_NO_OPPONENT_ORIGINAL_FRACTIONAL_OVERLOAD_WITNESS',
    sourceProvenNoMoverFirstWin:true,sourceOpponentDualStatus:fractionalResult.status,
    sourceOpponentBestStaticDualIfKnown:fractionalResult.bestKnownStaticWeights??null,
    ...exposed,...base};
  const D=fractionalResult.witness.denominator,
   nums=fractionalResult.witness.numerators.map(Number),maxPBlocking=Math.ceil(T/2);
  if(fractionalResult.attacker!==o||fractionalResult.opponent!==p||
    fractionalResult.opponentTotalTurns!==maxPBlocking||
    nums.length!==defender.length)
   throw Error('prior frozen original fractional packing returned wrong player turn capacity');
  const loads=Array(N).fill(0);let sum=0;
  for(let i=0;i<defender.length;i++){
   const w=nums[i];if(!Number.isInteger(w)||w<0||w>D)
    throw Error('source dual integer weight invalid');
   sum+=w;
   for(let z=0;z<N;z++)if(defender[i]&bit(z)){
    loads[z]+=w;ops.sourceOriginalDefenderDualNumeratorCapacityChecks++;
   }
  }
  if(sum!==fractionalResult.witness.sumNumerator||sum<=maxPBlocking*D||
   loads.some(t=>t>D)||!Number.isInteger(D)||D<1)
   throw Error('fractional source opponent winline capacity proof failed');
  return {status:'SOURCE_CERTIFIED_CURRENT_MOVER_FORCED_LOSS_VERTICAL_PAIR_EXPOSED_ES_PLUS_DUAL',
   sourceProvenNoMoverFirstWin:true,
   sourceProvenOpponentForcesFirstWin:true,
   sourceSelectedOneBestOriginalColumn:originalLegal[0],
   selectedOneValidOriginalFirstColumn:originalLegal[0],
   sourceAllOriginalLegalFirstColumnsEquallyBestLoss:originalLegal.slice(),
   ordinaryRootWDL:o===0?1:-1,
   originalMoverLostUnderUniformOpponentResponderPolicy:true,
   sourceOpponentFractionalOverloadWitness:fractionalResult.witness,
   sourceOpponentBlockingCapacity:maxPBlocking,
   sourceOpponentOverloadStrictNumeratorExcess:sum-maxPBlocking*D,
   sourceOriginalRespondingOpponentESPolicy:'Pair U next vertical released mate if Maker first touches paired cell; otherwise classical ES Breaker-second max-danger strategy on projected exposed FRONTIER family.',
   ...exposed,...base};
 }
 return Object.freeze({compute});
}
