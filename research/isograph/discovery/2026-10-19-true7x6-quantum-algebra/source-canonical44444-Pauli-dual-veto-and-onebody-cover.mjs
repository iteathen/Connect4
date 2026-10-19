// SOURCE ONLY: W7 H6 K4 canonical 44444 quantum-inspired Pauli
// signed-monomial duals, original same-column first-winner vetoes,
// and restricted STATIC additional one-body Z stabilizer cover.
// No future game q valuation, minimax/negamax, game strategy search,
// WDL oracle, simulated quantum statevector or nonstandard board.
import {sourceCanonical44444PauliSplitCofactors} from './source-canonical44444-Pauli-split-cofactors.mjs';
export function sourceCanonical44444PauliMatchedCausalAndOneBody(){
 const src=sourceCanonical44444PauliSplitCofactors();
 const A=src.PauliP0RequirementProjection.clauses;
 const B=src.PauliP1RequirementProjection.clauses;
 const signature=o=>o.must0Hex+':'+o.must1Hex;
 const byA=new Map(A.map(o=>[signature(o),o]));
 const matches=[],remaining=[];
 function cells(maskHex){
  const m=BigInt(maskHex),out=[];
  for(let site=0;site<42;site++)
   if(m&(1n<<BigInt(site)))out.push({column:site%7,row:Math.floor(site/7),id:site});
  return out;
 }
 for(const p1 of B){
  const id=signature(p1),p0=byA.get(id);
  if(!p0){remaining.push(p1);continue;}
  const low=cells(p0.originalMaskHex),up=cells(p1.originalMaskHex);
  const everyLowerEarlier=low.every(x=>up.some(y=>x.column===y.column&&x.row<y.row));
  const everyUpperEarlier=up.every(x=>low.some(y=>x.column===y.column&&x.row<y.row));
  matches.push({
   identity:id,
   P0OriginalResidualMask:p0.originalMaskHex,
   P1OriginalResidualMask:p1.originalMaskHex,
   P0OriginalFuturePhysicalCells:low,
   P1OriginalFuturePhysicalCells:up,
   trueOriginalGravityAllLowerP0PrecedesUpperP1:everyLowerEarlier,
   reverseGravityOrder:everyUpperEarlier,
   bothSameProjectorUnderConditionalPauliGauge:true,
   kind:'REPRODUCES_PRIOR_SUPPORT_MIRROR_CAUSAL_FIRST_WIN_VETO',
   sourceNoNewIndependentRootWDL:false
  });
 }
 if(A.length!==24||B.length!==24||matches.length!==12||
    remaining.length!==12||
    matches.some(m=>!m.trueOriginalGravityAllLowerP0PrecedesUpperP1||m.reverseGravityOrder))
  throw Error('canonical12 positive signed-dual or strict original gravity guard missing');
 function pop(m){let n=0;for(let t=BigInt(m);t;t&=t-1n)n++;return n;}
 const hist={},matchedClauseSup=new Set(matches.map(m=>m.identity));
 let allSupport=(1n<<18n)-1n;
 const reducedR1=remaining.map((c,i)=>{
  const must0=BigInt(c.must0Hex),must1=BigInt(c.must1Hex);
  const support=must0|must1;
  allSupport&=support;
  hist[pop(c.originalMaskHex)]=(hist[pop(c.originalMaskHex)]??0)+1;
  return {index:i,originalMaskHex:c.originalMaskHex,
   must0Hex:c.must0Hex,must1Hex:c.must1Hex,
   gaugeDegree:c.degree,
   physicalOriginalGeneratorLength:pop(c.originalMaskHex),
   hasCenterTop:c.centerTopP1LiteralConsumed,
   physicalGaugeVariableSupportHex:'0x'+support.toString(16)};
 });
 // Exactly 12 POSITIVE static signed cubic constraints remain.
 // For each of 18 pair lower owner variables, one of three choices:
 // leave free, force0, force1. DP operates on the 12-bit set of
 // Clauses invalidated by a fixed opposite-sign single owner bit.
 const blockers=Array.from({length:18},(_,j)=>{
  let b0=0,b1=0;
  for(const c of reducedR1){
   const bit=1n<<BigInt(j);
   // Forcing lower owner bit0 conflicts with P1 clause literal bit1.
   if((BigInt(c.must1Hex)&bit)!==0n)b0|=1<<c.index;
   // Forcing lower owner bit1 conflicts with P1 clause literal bit0.
   if((BigInt(c.must0Hex)&bit)!==0n)b1|=1<<c.index;
  }
  return {variable:j,force0CoverMask:b0,force1CoverMask:b1};
 });
 let dp=new Map([[0,{numberOfFixedOneBodyPauliChecks:0,chosen:[]}]]);
 for(const a of blockers){
  const next=new Map(dp);
  for(const [mask,prev] of dp)for(const value of [0,1]){
   const cover=value===0?a.force0CoverMask:a.force1CoverMask;
   const covered=mask|cover,cost=prev.numberOfFixedOneBodyPauliChecks+1;
   if(!next.has(covered)||next.get(covered).numberOfFixedOneBodyPauliChecks>cost)
    next.set(covered,{numberOfFixedOneBodyPauliChecks:cost,
     chosen:prev.chosen.concat({pairVariable:a.variable,
      fixedLowerOwnerBit:value,coveredResidualP1ClausesBitMask:cover})});
  }
  dp=next;
 }
 const allCovered=(1<<remaining.length)-1,answer=dp.get(allCovered);
 if(!answer||answer.numberOfFixedOneBodyPauliChecks<1)
  throw Error('finite STATIC restricted conditional one-body projector cover missing');
 const maxSingleCoverage=Math.max(...blockers.map(o=>
   Math.max(pop(BigInt(o.force0CoverMask)),pop(BigInt(o.force1CoverMask)))));
 return {
  status:'SOURCE_CANONICAL44444_PAULI_12_DUALS_4_ONEBODY_STATIC',
  originalDimensions:{W:7,H:6,K:4},originalHistory:'44444',
  originalResidualR0:src.R0.length,originalResidualR1:src.R1.length,
  conditionalSplitPairs:src.pairs.length,
  conditionalCenterTopP1:true,
  originalP1PairBlocked:src.PauliP1RequirementProjection.orthogonalityCategories.ORTHOGONAL_TO_PAIRED_STABILIZERS,
  originalP1MatchedLowerP0EarlierUpperP1:matches.length,
  originalP1StillUnresolved:remaining.length,
  originalRemainingRequirementSizeHistogram:hist,
  PauliMatchedOriginalCausalVetoes:matches,
  PauliUnmatchedOriginalP1Clauses:reducedR1,
  sameProjectedSignedCubicLiteralIdentities:matches.length,
  totalUniqueProjectedSignedCubicClauseIdentities:
    A.length+B.length-matches.length,
  commonIntersectionOf12RemainingGaugeVariableSupportsHex:'0x'+allSupport.toString(16),
  restrictedOneBodyExtraStabilizerCover:{
   constraintsConsidered:remaining.length,freeGaugeVariables:18,
   minFixedPauliZSingleVariableChecks:answer.numberOfFixedOneBodyPauliChecks,
   oneStaticCertificate:answer.chosen,
   maxClausesCoveredByAnySingleOneBodyCheck:maxSingleCoverage,
   DPDistinctCoveredClauseMasks:dp.size,
   coversEachRemainingP1Clause:true,
   onlineStrategyEnforceability:'UNPROVED',
   allowableMultiBodyPauliOrNonlinearContractMinimum:'NOT_EVALUATED'
  },
  sourceGameFutureValueQueries:0,
  sourceWDL:null,sourceBestOriginalAction:null,
  historicalSupportMirrorComparison:'IDENTITY_OF_MATHEMATICAL_MECHANISM_REPRODUCED_NOT_NEW_WDL_MARGINAL'
 };
}
