// FROZEN prior to executing V4: independently compare V4 on the
// SAME 86 original true7x6 direct 2-column swap source-positive q vs
// immutable V3, physical first-win stopped WDL reference, and
// explicitly count eliminated static permutation proof witnesses.
import {createUnifiedOneValidBestActionSourceV4} from './standard7x6-unified-one-valid-best-action-source-v4.mjs';
// FROZEN BEFORE RUN. Compare independent direct fixed two-column
// source WDL inequalities/best action to previously tested unified V3
// on EXACT SAME true7x6 physical q. Original V3 may enumerate STATIC
// column transport permutations; DIRECT certificate does NOT.
import {createUnifiedOneValidBestActionSourceV3} from './standard7x6-unified-one-valid-best-action-source-v3.mjs';
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
 oldV3=createUnifiedOneValidBestActionSourceV3(geometry),
 integratedV4=createUnifiedOneValidBestActionSourceV4(geometry);
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
const v4Metrics={
 schema:'connect4.true7x6.source_V4_replaces_static_permutation_when_fixed_swap_suffices_v0_1',
 directPositiveActual7x6Roots:0,
 v4PreservedAllPreviousScalarV3Results:0,
 v4DirectChosenWhenV3ScalarUnknown:0,
 v4UnexpectedTransportFallbackOnDirectPositive:0,
 v4WrongOriginalLiteralBestOrSourceType:0,
 v4NoPermutationClaimActuallySupported:0,
 staticCompletedPermutationsFromHistoricalV3InDirectClass:0,
 physicalV4ChosenMoveOriginalWDLChecks:0,
 physicalV4BadBestMoveWDL:0,
 v4SuccessfulOriginalRootMoveSamples:[]
};
const relative={
 schema:'connect4.true7x6.direct_fixed_2swap_vs_unifiedV3_same_q_v0_1',
 directRootBestSourceCertificates:0,
 oldV3AlreadyCertifiedBestMoves:0,
 directNewBestMovesWhereV3INCOMPLETE:0,
 oldV3BestSourceWIN:0,oldV3BestSourceDRAW:0,oldV3BestSourceLOSS:0,
 oldV3BestSourceScalarUnknown:0,
 rootExactKnownToOldButNotDirect:0,
 sourceAnyContradictionsAgainstOldV3:0,
 newDirectPhysicalRootChecks:0,newDirectPhysicalChosenActionChecks:0,
 directNoPermutationProofCandidateSearchConfirmed:0,
 sampleNewSourceFirstActions:[]
};
const seen=new Set();
function inspect(s,forced=false){
 if(s.terminal!==null||s.n===N)throw Error('source input must original first-win stopped nonterminal');
 const id=physicalKey(s);if(seen.has(id))return;seen.add(id);stats.actualUniqueSourceQVisited++;
 if(!forced&&(s.n<32||legal(s).length<2))return;
 const q=core.fromPhysical({h:s.h,p0:s.P[0],p1:s.P[1]});
 const res=source.compute(q,{maxStaticSubsetTests:100000});
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
 let old=null,v4=null;
 if(res.status==='VALID_CONTINUATION'){
  stats.sourceEntireRootBestMoveCertified++;
  relative.directRootBestSourceCertificates++;
  old=oldV3.compute(q);
  v4=integratedV4.compute(q);
  v4Metrics.directPositiveActual7x6Roots++;
  if(v4.status!=='VALID_CONTINUATION'){
   v4Metrics.v4WrongOriginalLiteralBestOrSourceType++;
   throw Error('V4 discarded direct source certified best action');
  }
  if(old.status!=='VALID_CONTINUATION')throw Error('previous V3 should already certify fixed swap best');
  if(old.ordinaryRootValueP0Relative!==null){
   if(v4.ordinaryRootValueP0Relative!==old.ordinaryRootValueP0Relative||
      v4.selectedOriginalLiteralColumn!==old.selectedOriginalLiteralColumn||
      v4.v4ProofFamily!=='V2_ALREADY_CERTIFIED_WDL_SCALAR'){
    v4Metrics.v4WrongOriginalLiteralBestOrSourceType++;
    throw Error('V4 altered a previously V3 exact scalar Level2 result');
   }
   v4Metrics.v4PreservedAllPreviousScalarV3Results++;
  }else {
   if(v4.v4ProofFamily==='ENUMERATED_STATIC_COLUMN_TRANSPORT_FALLBACK'){
    v4Metrics.v4UnexpectedTransportFallbackOnDirectPositive++;
    throw Error('V4 enumerated permutations despite sufficient fixed-swap direct certificate');
   }
   if(v4.v4ProofFamily!=='DIRECT_FIXED_TWO_COLUMN_SOURCE_WDL_EXTREMUM_ZERO_PERMUTATIONS'||
      v4.ordinaryRootValueP0Relative!==null||
      v4.v4Statistics.staticColumnPermutationTransportFallbackInvoked!==false||
      v4.v4Statistics.staticCompletedColumnPermutationWitnesses!==0||
      v4.v4Statistics.fixedSourceFullColumnPermutationCandidates!==0){
    v4Metrics.v4WrongOriginalLiteralBestOrSourceType++;
    throw Error('V4 direct source proof violated zero permutation or scalar unknown contract');
   }
   v4Metrics.v4DirectChosenWhenV3ScalarUnknown++;
   v4Metrics.v4NoPermutationClaimActuallySupported++;
   v4Metrics.staticCompletedPermutationsFromHistoricalV3InDirectClass+=
      old.v3Statistics?.staticCompletedColumnPermutationWitnesses??0;
  }
  if(v4Metrics.v4SuccessfulOriginalRootMoveSamples.length<16)
   v4Metrics.v4SuccessfulOriginalRootMoveSamples.push({
    history:s.history,ply:s.n,mover:s.n&1,
    oldV3Status:old.status,oldV3Scalar:old.ordinaryRootValueP0Relative,
    oldV3SelectedLiteral:old.selectedOriginalLiteralColumn,
    v4SelectedLiteral:v4.selectedOriginalLiteralColumn,
    v4ProofFamily:v4.v4ProofFamily,
    v4StaticCompletedPermutations:v4.v4Statistics.staticCompletedColumnPermutationWitnesses,
    historicalV3StaticCompletedPermutations:old.v3Statistics?.staticCompletedColumnPermutationWitnesses??0
   });
  if(old.status==='VALID_CONTINUATION'){
   relative.oldV3AlreadyCertifiedBestMoves++;
   if(old.ordinaryRootValueP0Relative===null)relative.oldV3BestSourceScalarUnknown++;
   else{
    relative.rootExactKnownToOldButNotDirect++;
    relative['oldV3BestSource'+old.bestOutcomeTier]++;
   }
  }else{
   relative.directNewBestMovesWhereV3INCOMPLETE++;
   relative.directNoPermutationProofCandidateSearchConfirmed++;
   if(relative.sampleNewSourceFirstActions.length<20)
    relative.sampleNewSourceFirstActions.push({
     history:s.history,ply:s.n,mover:s.n&1,
     originalLegalColumns:legal(s).map(c=>c+1),
     selectedOriginalBest:res.selectedOriginalLiteralColumn,
     priorV3Source:old.status,sourceNumericRootWDL:null,
     sourceFixedColumnComparisonCount:res.statistics.originalStaticLiteralActionPairsConsidered
    });
  }
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
   (res.status==='VALID_CONTINUATION'&&stats.independentPhysicalRootBestLabelsChecked<160))){
  const all=legal(s).map(c=>[c+1,WDL(move(s,c))]);
  stats.independentPhysicalAllLegalActionValueChecks+=all.length;
  const val=new Map(all);
  if(res.status==='VALID_CONTINUATION'){
   v4Metrics.physicalV4ChosenMoveOriginalWDLChecks++;
   const allV=all.map(z=>z[1]),top=s.n%2===0?Math.max(...allV):Math.min(...allV);
   const v=val.get(v4.selectedOriginalLiteralColumn);
   if(v!==top){
    v4Metrics.physicalV4BadBestMoveWDL++;
    throw Error('integrated V4 chosen move not original physical WDL best');
   }
  }
  if(res.status==='VALID_CONTINUATION'&&old.status==='INCOMPLETE'){
   relative.newDirectPhysicalRootChecks++;
   relative.newDirectPhysicalChosenActionChecks++;
  }else if(res.status==='VALID_CONTINUATION'&&old.ordinaryRootValueP0Relative!==null){
   const r=s.n%2===0?Math.max(...all.map(z=>z[1])):Math.min(...all.map(z=>z[1]));
   if(old.ordinaryRootValueP0Relative!==r){
    relative.sourceAnyContradictionsAgainstOldV3++;
    throw Error('old certified scalar WDL contradicts independent first-win physical value');
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
stats.marginalRelativeToV3=relative;
stats.integratedV4DirectVsV3=v4Metrics;
stats.status=stats.falseWeakWdlEdges||stats.falseSelectedBestActions?
 'SOURCE_DIRECT_TWO_SWAP_REJECTED_BY_PHYSICAL_COUNTEREXAMPLE':
 'SAMPLE_PHYSICAL_NO_FALSIFIER_SOURCE_TWO_SWAP_NEEDS_THEOREM_QUALIFICATION';
console.log(JSON.stringify(stats,null,2));
