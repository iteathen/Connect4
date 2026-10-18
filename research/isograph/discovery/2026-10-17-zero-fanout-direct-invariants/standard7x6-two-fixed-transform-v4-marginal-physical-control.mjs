// FROZEN before run: compare source union of TWO FIXED transforms
// against immutable unified V4 source on EXACT SAME original physical
// first-win-stopped 7x6 states. Use PHYSICAL WDL only after source claims.
import {createUnifiedOneValidBestActionSourceV4} from './standard7x6-unified-one-valid-best-action-source-v4.mjs';
// FROZEN before independent true7x6 controls of combined direct
// fixed 2-column swap + one fixed full-board reflection source action
// WDL order. Both source maps are deterministic, not searched.
import {createOriginalSourceFixedReflectionWdlOrder} from './standard7x6-original-source-fixed-reflection-WDL-order.mjs';
import {createSourceTwoFixedTransformWdlExtremum} from './standard7x6-source-two-fixed-transform-WDL-extremum.mjs';
// FROZEN before true7x6 validation of PURE original-q fixed two-column
// transposition source WDL weak-order inequalities. NO source future
// game values or column-permutation enumeration. Independent PHYSICAL
// recursive minimax evaluates only AFTER positive source weak-order
// edges or root extremum; all 69 real K-lines, gravity and FIRST-win.
// Optional old transport checks ONLY for validation corroboration.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createSourceFixedTwoColumnSwapWdlOrder} from './standard7x6-source-fixed-two-column-swap-WDL-order.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
 geometry={width:W,height:H,connect:K},
 core=createExactQCore(geometry),source=createSourceFixedTwoColumnSwapWdlOrder(geometry),
 mirror=createOriginalSourceFixedReflectionWdlOrder(geometry),
 combined=createSourceTwoFixedTransformWdlExtremum(geometry),
 existingV4=createUnifiedOneValidBestActionSourceV4(geometry);
const byCell=Array.from({length:N},()=>[]);let originalWinningLines=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
  let m=0n,ids=[];
  for(let j=0;j<K;j++){const id=(r+j*dr)*W+c+j*dc;m|=bit(c+j*dc,r+j*dr);ids.push(id);}
  for(const id of ids)byCell[id].push(m);originalWinningLines++;
 }
if(originalWinningLines!==69||core.lineCount!==69)
 throw Error('physical original7x6 winning line scanner not 69');
function blank(){return{h:Array(W).fill(0),P:[0n,0n],n:0,history:'',terminal:null};}
function legal(s){return s.h.flatMap((h,c)=>h<H?[c]:[]);}
function move(s,c){
 if(s.terminal!==null||!Number.isInteger(c)||c<0||c>=W||s.h[c]>=H)
  throw Error('independent physical illegal first win stopped move');
 const p=s.n&1,r=s.h[c],cellID=r*W+c,h=s.h.slice(),P=s.P.slice();
 h[c]++;P[p]|=bit(c,r);
 const winner=byCell[cellID].some(G=>(P[p]&G)===G);
 return{h,P,n:s.n+1,history:s.history+String(c+1),
 terminal:winner?(p===0?1:-1):s.n+1===N?0:null};
}
let seed=0x1709A9C6>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const memo=new Map();
const stats={
 schema:'connect4.true7x6.direct_q_two_column_swap_WDL_order_v0_1',
 date:'2026-10-17',originalGeometry:{W,H,K,originalWinningLines:69},
 startingSeed:seed,firstWinStoppedPhysicalTrajectories:0,
 actualUniqueSourceQVisited:0,sourceQExaminedForDirectSwap:0,
 originalLegalActionPairsExamined:0,
 originalEqualHeightLegalPairs:0,originalUnequalHeightExcludedPairs:0,
 directRawP0AndP1SubsetTests:0,
 directPositiveWdlWeakOrderEdges:0,
 directBidirectionalValueTiesCertified:0,
 sourceEntireRootBestMoveCertified:0,
 sourceBestMoveWithUnknownScalarRoot:0,
 sourceBestMoveWithAtLeast2LegalActions:0,
 sourceNoExtremum:0,
 originalCurrentActionLabelsExamined:0,
 directSourceFixedSwapBitOperations:0,
 staticColumnPermutationAssignmentNodes:0,
 completedColumnPermutationCandidatesEnumerated:0,
 sourceGameAlternativeValuesCalculated:0,
 independentPhysicalWeakWdlEdgesChecked:0,
 independentPhysicalRootBestLabelsChecked:0,
 independentPhysicalAllLegalActionValueChecks:0,
 independentPhysicalWdlRecursiveCalls:0,
 independentPhysicalWdlUniqueStates:0,
 falseWeakWdlEdges:0,falseSelectedBestActions:0,
 rootSourcePositiveByPly:{},examples:[],
 firstUnsoundWeakSourceOrderEdge:null,firstIncorrectRootBestMove:null,
 originalCanonical44444Source:null,
 sourceStaticBudgetIncomplete:0,
 status:'NOT_TESTED',endingSeed:null
};
function physicalKey(s){return s.P[0].toString(16)+'|'+s.P[1].toString(16);}
function WDL(s){
 stats.independentPhysicalWdlRecursiveCalls++;
 if(s.terminal!==null)return s.terminal;
 const key=physicalKey(s);if(memo.has(key))return memo.get(key);
 stats.independentPhysicalWdlUniqueStates++;
 let v=(s.n&1)?1:-1;
 for(const a of legal(s)){
  const x=WDL(move(s,a));
  v=(s.n&1)?Math.min(v,x):Math.max(v,x);
 }
 memo.set(key,v);return v;
}
const delta={
 schema:'connect4.true7x6.two_fixed_source_transforms_vs_v4_v0_1',
 selectedByBothFixedSource:0,v4AlreadyValid:0,
 v4KnownWIN:0,v4KnownDRAW:0,v4KnownLOSS:0,
 v4UnknownScalar:0,v4PreviouslyIncompleteNowBest:0,
 oldStaticPermutationFallbackReplaced:0,
 oldStaticCompletedPermutationsAvoided:0,
 newRootsIndependentlyCheckedPhysical:0,
 sourceValueContradictionsVsV4:0,
 sourceBestOriginalActionMismatchWithPhysical:0,
 firstNewBestVsV4:null,
 fixedReflectionOnlyV4Statuses:[]
};
const combinedStats={
 schema:'connect4.true7x6.two_fixed_transforms_union_source_action_WDL_v0_1',
 directOnly:0,mirrorOnly:0,combinedSuccess:0,
 neitherAloneButCombinedSuccess:0,combinedWithEitherAloneSuccess:0,
 combinedOriginalSourceWeakEdges:0,
 independentCombinedPhysicalWDLRootChecks:0,
 independentCombinedPhysicalWeakEdgesChecked:0,
 wrongPhysicalCombinedBest:0,wrongPhysicalCombinedEdge:0,
 sourceFixedStaticCompletedPermutationCandidates:0,
 sourceReflectionAutomorphismCount:0,
 canonical44444:null,firstMixedProofWitness:null,examples:[]
};
const seen=new Set();
function inspect(s,forced=false){
 if(s.terminal!==null||s.n===N)throw Error('source input must original first-win stopped nonterminal');
 const id=physicalKey(s);if(seen.has(id))return;seen.add(id);stats.actualUniqueSourceQVisited++;
 if(!forced&&(s.n<32||legal(s).length<2))return;
 const q=core.fromPhysical({h:s.h,p0:s.P[0],p1:s.P[1]});
 const res=source.compute(q,{maxStaticSubsetTests:100000});
 const m=mirror.compute(q);
 const duo=combined.compute(q);
 let oldResult=null;
 if(duo.status==='VALID_CONTINUATION'){
  oldResult=existingV4.compute(q);
  delta.selectedByBothFixedSource++;
  if(oldResult.status==='VALID_CONTINUATION'){
   delta.v4AlreadyValid++;
   if(oldResult.ordinaryRootValueP0Relative===null){
    delta.v4UnknownScalar++;
    if(oldResult.v4ProofFamily==='ENUMERATED_STATIC_COLUMN_TRANSPORT_FALLBACK'){
     delta.oldStaticPermutationFallbackReplaced++;
     delta.oldStaticCompletedPermutationsAvoided+=oldResult.v4Statistics?.staticCompletedColumnPermutationWitnesses??0;
    }
   }else delta['v4Known'+oldResult.bestOutcomeTier]++;
  }else{
   delta.v4PreviouslyIncompleteNowBest++;
   if(!delta.firstNewBestVsV4)
    delta.firstNewBestVsV4={history:s.history,ply:s.n,mover:s.n&1,
     heights:s.h,legalOriginalColumns:legal(s).map(c=>c+1),
     chosenBest:duo.selectedOriginalLiteralBestColumn,
     sourceTwoFixedProof:duo.sourceBestDominatesAllOriginalLegalActionProof,
     oldV4Status:oldResult.status,
     sourceR0Masks:q.R0.map(String),sourceR1Masks:q.R1.map(String)};
  }
  if(m.status==='VALID_CONTINUATION'&&res.status!=='VALID_CONTINUATION')
   delta.fixedReflectionOnlyV4Statuses.push({
    history:s.history,oldV4:oldResult.status,
    oldV4ProofFamily:oldResult.v4ProofFamily??null,
    selectedNew:duo.selectedOriginalLiteralBestColumn
   });
 }
 const okOne=res.status==='VALID_CONTINUATION',okMirror=m.status==='VALID_CONTINUATION';
 if(okOne)combinedStats.directOnly++;
 if(okMirror)combinedStats.mirrorOnly++;
 if(duo.status==='VALID_CONTINUATION'){
  combinedStats.combinedSuccess++;
  if(!okOne&&!okMirror){
   combinedStats.neitherAloneButCombinedSuccess++;
   if(!combinedStats.firstMixedProofWitness)
    combinedStats.firstMixedProofWitness={history:s.history,ply:s.n,
     mover:s.n&1,heights:s.h,selectedBest:duo.selectedOriginalLiteralBestColumn,
     proofPaths:duo.sourceBestDominatesAllOriginalLegalActionProof,
     allSourceWeakEdges:duo.sourceProvedWeakOriginalWDLInequalities.map(z=>[
      z.lowerP0ValueOriginalLiteralAction,z.upperP0ValueOriginalLiteralAction,z.fixedOriginalTransformKind])};
  }else combinedStats.combinedWithEitherAloneSuccess++;
  if(combinedStats.examples.length<12)combinedStats.examples.push({
   history:s.history,ply:s.n,chosen:duo.selectedOriginalLiteralBestColumn,
   directAlone:okOne,mirrorAlone:okMirror});
 }
 combinedStats.combinedOriginalSourceWeakEdges+=duo.sourceProvedWeakOriginalWDLInequalities.length;
 combinedStats.sourceFixedStaticCompletedPermutationCandidates+=duo.statistics.staticWholeColumnPermutationCandidatesEnumerated;
 if(m.originalSourceFullMirrorAutomorphismProved)combinedStats.sourceReflectionAutomorphismCount++;
 if(s.history==='44444')combinedStats.canonical44444={
   direct:res.status,reflection:m.status,combined:duo.status,
   equivalenceClasses:duo.sourceActionEquivalenceClassesFromTwoFixedTransforms,
   selected:duo.selectedOriginalLiteralBestColumn};

 stats.sourceQExaminedForDirectSwap++;
 stats.originalLegalActionPairsExamined+=res.statistics.originalStaticLiteralActionPairsConsidered;
 stats.originalEqualHeightLegalPairs+=res.statistics.equalCurrentHeightActionPairs;
 stats.originalUnequalHeightExcludedPairs+=res.statistics.unequalHeightExcludedPairs;
 stats.directRawP0AndP1SubsetTests+=res.statistics.exactOriginalGeneratorSubsetChecks;
 stats.directSourceFixedSwapBitOperations+=res.statistics.bitwiseFixedTwoColumnSwaps;
 stats.directPositiveWdlWeakOrderEdges+=res.statistics.sourceProvedWeakP0WdlOrderEdges;
 stats.directBidirectionalValueTiesCertified+=res.statistics.directPositiveBiDirectionalWdlTies;
 stats.staticColumnPermutationAssignmentNodes+=res.statistics.sourceStaticColumnPermutationAssignmentNodes;
 stats.completedColumnPermutationCandidatesEnumerated+=res.statistics.sourceCompletedColumnPermutationCandidatesEnumerated;
 stats.sourceGameAlternativeValuesCalculated+=res.statistics.sourceIndependentGameValueQueries;
 stats.originalCurrentActionLabelsExamined+=legal(s).length;
 if(res.statistics.sourceBudgetIncomplete)stats.sourceStaticBudgetIncomplete++;
 if(forced&&s.history==='44444')
  stats.originalCanonical44444Source={
   history:s.history,ply:s.n,
   status:res.status,sourceReason:res.reason,
   legalOriginalLiteralColumns:legal(s).map(z=>z+1),
   directWeakOrderEdges:res.sourceProvedOriginalWeakWdlOrderEdges.map(e=>[
    e.lowerP0ValueLiteralAction,e.upperP0ValueLiteralAction]),
   selected:res.selectedOriginalLiteralColumn,
   sourceIndependentFutureWdlValueQueries:res.statistics.sourceIndependentGameValueQueries,
   sourcePermutationMappingCandidateCount:res.statistics.sourceCompletedColumnPermutationCandidatesEnumerated
  };
 if(res.status==='VALID_CONTINUATION'){
  stats.sourceEntireRootBestMoveCertified++;
  if(res.ordinaryRootValueP0Relative===null)stats.sourceBestMoveWithUnknownScalarRoot++;
  if(legal(s).length>=2)stats.sourceBestMoveWithAtLeast2LegalActions++;
  const rank=stats.rootSourcePositiveByPly[s.n]??(stats.rootSourcePositiveByPly[s.n]={count:0});
  rank.count++;
  if(stats.examples.length<18)stats.examples.push({
   history:s.history,ply:s.n,currentMover:s.n&1,h:s.h,
   originalLegalColumns:legal(s).map(z=>z+1),
   directFixedSwapBestMove:res.selectedOriginalLiteralColumn,
   exactSourceWeakWdlEdges:res.sourceProvedOriginalWeakWdlOrderEdges.map(e=>[
    e.lowerP0ValueLiteralAction,e.upperP0ValueLiteralAction]),
   numericalOutcomeNotSourceComputed:true
  });
 }else stats.sourceNoExtremum++;
 // Value checking is INDEPENDENT and gated on source-positivity.
 // Check each positive DIRECT edge even when no global best extremum.
 if(s.n>=35&&(stats.independentPhysicalWeakWdlEdgesChecked<850||
   (res.status==='VALID_CONTINUATION'&&stats.independentPhysicalRootBestLabelsChecked<160)||
   (duo.status==='VALID_CONTINUATION'&&combinedStats.independentCombinedPhysicalWDLRootChecks<150))){
  const all=legal(s).map(c=>[c+1,WDL(move(s,c))]);
  stats.independentPhysicalAllLegalActionValueChecks+=all.length;
  const val=new Map(all);
  if(combinedStats.independentCombinedPhysicalWeakEdgesChecked<1800){
   for(const edge of duo.sourceProvedWeakOriginalWDLInequalities){
    combinedStats.independentCombinedPhysicalWeakEdgesChecked++;
    if(val.get(edge.lowerP0ValueOriginalLiteralAction)>val.get(edge.upperP0ValueOriginalLiteralAction)){
     combinedStats.wrongPhysicalCombinedEdge++;
     throw Error('PHYSICAL_REFUTES_SOURCE_TWO_FIXED_TRANSFORM_WDL_EDGE '+s.history);
    }
   }
  }
  if(duo.status==='VALID_CONTINUATION'){
   if(oldResult.status==='INCOMPLETE')delta.newRootsIndependentlyCheckedPhysical++;
   if(oldResult.status==='VALID_CONTINUATION'&&oldResult.ordinaryRootValueP0Relative!==null){
    const trueRoot=s.n%2===0?Math.max(...all.map(z=>z[1])):Math.min(...all.map(z=>z[1]));
    if(oldResult.ordinaryRootValueP0Relative!==trueRoot){
     delta.sourceValueContradictionsVsV4++;
     throw Error('source V4 ordinary root scalar WDL contradicted true7x6 physical WDL');
    }
   }
   combinedStats.independentCombinedPhysicalWDLRootChecks++;
   const best=s.n%2===0?Math.max(...all.map(z=>z[1])):Math.min(...all.map(z=>z[1]));
   if(val.get(duo.selectedOriginalLiteralBestColumn)!==best){
    combinedStats.wrongPhysicalCombinedBest++;
    throw Error('PHYSICAL_REFUTES_SOURCE_TWO_FIXED_TRANSFORM_BEST '+s.history);
   }
  }
  for(const e of res.sourceProvedOriginalWeakWdlOrderEdges){
   stats.independentPhysicalWeakWdlEdgesChecked++;
   if(val.get(e.lowerP0ValueLiteralAction)>val.get(e.upperP0ValueLiteralAction)){
    stats.falseWeakWdlEdges++;
    stats.firstUnsoundWeakSourceOrderEdge={history:s.history,ply:s.n,
     allOriginalLiteralActionWDL:all,sourceWitness:e,
     originalR0Masks:q.R0.map(String),originalR1Masks:q.R1.map(String)};
    break;
   }
  }
  if(res.status==='VALID_CONTINUATION'){
   stats.independentPhysicalRootBestLabelsChecked++;
   const best=s.n%2===0?Math.max(...all.map(z=>z[1])):Math.min(...all.map(z=>z[1]));
   if(val.get(res.selectedOriginalLiteralColumn)!==best){
    stats.falseSelectedBestActions++;
    stats.firstIncorrectRootBestMove={history:s.history,ply:s.n,
     rootScalarPhysicalWDL:best,allOriginalActionWDL:all,
     sourceBest:res.selectedOriginalLiteralColumn,
     sourceOrderProof:res.sourceExtremumProofOverAllRootLegalColumns};
   }
  }
  if(stats.falseWeakWdlEdges||stats.falseSelectedBestActions)return;
 }
}
for(const history of ['','4','44444','444444','444441','4444442',
 '475234143513367623351115664414672762']){
 let s=blank();
 for(const col of history)s=move(s,Number(col)-1);
 if(s.terminal!==null)throw Error('fixed source prefix is original terminal');
 inspect(s,true);
}
for(let g=0;g<2400;g++){
 stats.firstWinStoppedPhysicalTrajectories++;
 let s=blank();
 while(s.terminal===null){
  inspect(s);
  if(stats.falseWeakWdlEdges||stats.falseSelectedBestActions)break;
  const choices=legal(s).map(c=>move(s,c)).filter(x=>x.terminal===null);
  if(!choices.length)break;
  s=choices[rand()%choices.length];
 }
 if(stats.falseWeakWdlEdges||stats.falseSelectedBestActions)break;
}
stats.endingSeed=seed;
stats.combinedTwoFixedTransforms=combinedStats;
stats.marginalTwoFixedAgainstSourceV4=delta;
stats.status=stats.falseWeakWdlEdges||stats.falseSelectedBestActions?
 'SOURCE_DIRECT_TWO_SWAP_REJECTED_BY_PHYSICAL_COUNTEREXAMPLE':
 'SAMPLE_PHYSICAL_NO_FALSIFIER_SOURCE_TWO_SWAP_NEEDS_THEOREM_QUALIFICATION';
console.log(JSON.stringify(stats,null,2));
