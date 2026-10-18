// FROZEN BEFORE RUN: independently check integrated unified V3 scalar-FREE
// best move against original true7x6 physical perfect-play minimax on
// previously V2-INCOMPLETE source WDL-order positions. V2 and original
// order source/controls frozen separately with exact Git provenance.
import {createUnifiedOneValidBestActionSourceV3} from './standard7x6-unified-one-valid-best-action-source-v3.mjs';
// FROZEN BEFORE RUN: compare original source-WDL extremal optimality
// with existing V2 one best move on SAME true7x6 source corpus.
import {createUnifiedOneValidBestActionSourceV2} from './standard7x6-unified-one-valid-best-action-source-v2.mjs';
// INDEPENDENT TRUE 7x6 first-win-stopped physical MINIMAX falsifier for
// source WDL-order extremal ONE best literal action without scalar V.
// Source compares static original q cofactors by full future column
// transport, but never queries future game WDL. Physical MINIMAX used
// only AFTER a proven source action-order extremum is produced.
// Frozen before first actual 7x6 run.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createEitherMoverExactTransport} from './either-mover-future-transport.mjs';
import {createSourceWdlExtremalOneBest} from './standard7x6-source-WDL-order-extremal-one-best.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),geom={width:W,height:H,connect:K},
 core=createExactQCore(geom),source=createSourceWdlExtremalOneBest(geom);
const prior=createUnifiedOneValidBestActionSourceV2(geom),
    integratedV3=createUnifiedOneValidBestActionSourceV3(geom);
const byCell=Array.from({length:N},()=>[]);let lineCount=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
  let mask=0n,ids=[];
  for(let z=0;z<K;z++){let id=(r+z*dr)*W+c+z*dc;mask|=bit(c+z*dc,r+z*dr);ids.push(id);}
  for(const id of ids)byCell[id].push(mask);lineCount++;
 }
if(lineCount!==69||core.lineCount!==69)throw Error('not original W=7,H=6,K=4');
const blank=()=>({h:Array(W).fill(0),P:[0n,0n],n:0,history:'',winner:null});
const legal=s=>s.h.flatMap((z,c)=>z<H?[c]:[]);
function play(s,c){
 if(s.winner!==null||s.h[c]>=H)throw Error('invalid original first-win-terminated play');
 const p=s.n&1,r=s.h[c],id=r*W+c,h=s.h.slice(),P=s.P.slice();
 h[c]++;P[p]|=bit(c,r);
 const win=byCell[id].some(m=>(P[p]&m)===m);
 return {h,P,n:s.n+1,history:s.history+String(c+1),
  winner:win?(p===0?1:-1):s.n+1===N?0:null};
}
let rng=0x17009031>>>0;
const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng;};
const memo=new Map();
const report={
 schema:'connect4.true7x6.source_only_full_WDL_weak_order_extremal_best_action_v0_1',
 date:'2026-10-17',board:{W,H,K,originalKLines:69},seedStart:rng,
 nonwinningPhysicalHistoriesSampled:0,
 realNonterminalPhysicalPositionSeen:0,nontrivialLegalActionPositionsAnalyzed:0,
 physicalPositionsSkippedByRank:0,physicalSourceUniquePositions:0,
 sourceTransportOriginalActionWeakOrderEdges:0,
 sourceFullTransportPermutationProofCandidates:0,
 sourceStaticTransportOperations:0,
 sourceBestMoveExtremaProduced:0,
 sourceNoExtremumFound:0,
 sourcePositivesWith2OrMoreLegalActions:0,
 sourcePositivesWithNoRootWDLComputedBySource:0,
 sourceComparedLegalActionsTotal:0,
 independentFullPhysicalRootWDLChecks:0,
 independentFullPhysicalChosenMoveWDLChecks:0,
 independentFullPhysicalAllCurrentActionWDLChecks:0,
 independentPhysicalRecursions:0,independentPhysicalUniqueStates:0,
 sourceBestMoveFalseProofs:0,
 inferredScalarRootFromSource:false,
 unqualifiedTerminalGreedyHypothesisUsed:false,
 sourceIndependentlyValuedCompetingGameFutures:0,
 positiveHistoricalExamples:[],
 canonical44444SourceResult:null,
 byPly:{},
 seedFinal:null
};
function key(s){return s.P[0].toString(16)+'|'+s.P[1].toString(16);}
function WDL(s){
 report.independentPhysicalRecursions++;
 if(s.winner!==null)return s.winner;
 const k=key(s);if(memo.has(k))return memo.get(k);
 report.independentPhysicalUniqueStates++;
 let v=s.n%2===0?-1:1;
 for(const c of legal(s)){
  const w=WDL(play(s,c));v=s.n%2===0?Math.max(v,w):Math.min(v,w);
 }
 memo.set(k,v);return v;
}
const v3Stats={
 schema:'connect4.true7x6.unified_source_V3_scalar_free_best_action_new_vs_V2_v0_1',
 orderSourcePositivePositionsChecked:0,
 integratedV3PreservedExistingV2Certification:0,
 integratedV3NewBestSourceActionsVsV2:0,
 integratedV3NewBestSourceWdlScalarExplicitlyUnknown:0,
 integratedV3NewBestSourceOutcomeTierExplicitlyUnknown:0,
 wrongIntegratedNewBestOriginalLiteralAction:0,
 integratedV3RefusedAPreviouslyProvedSourceOrderWinner:0,
 newActualSourceExamples:[]
};
const relative={
 schema:'connect4.true7x6.source_WDL_order_extremal_vs_unified_v2_same_original_q_v0_1',
 sourceWdlOrderExtremalPositiveOriginalRoots:0,
 oldV2AlreadyValidRoot:0,oldV2INCOMPLETENewOneBestMove:0,
 oldV2KnownWIN:0,oldV2KnownDRAW:0,oldV2KnownLOSS:0,
 contradictionsToEarlierSourceRootWDL:0,
 independentlyCheckedNewOriginalScalarRootWDL:0,
 independentlyCheckedNewBestLiteralActionWDL:0,
 newOverPriorExamples:[]
};
const seen=new Set();
function inspect(s,canonical=false){
 if(s.winner!==null||s.n===N)throw Error('position not real first-win-stopped source');
 report.realNonterminalPhysicalPositionSeen++;
 if(!canonical&&(s.n<33||legal(s).length<2)){
  report.physicalPositionsSkippedByRank++;return;
 }
 const k=key(s);
 if(seen.has(k))return;seen.add(k);report.physicalSourceUniquePositions++;
 const q=core.fromPhysical({h:s.h,p0:s.P[0],p1:s.P[1]});
 const result=source.compute(q,{
  maxOperations:140000,maxMs:100,maxRepresentatives:10000});
 const val=report.byPly[s.n]??(report.byPly[s.n]={sources:0,positive:0,relativeEdges:0});
 val.sources++;
 report.sourceStaticTransportOperations+=result.statistics.sourceColumnTransportOperations;
 report.sourceFullTransportPermutationProofCandidates+=result.statistics.sourceStaticColumnPermutationProofCandidates;
 report.sourceTransportOriginalActionWeakOrderEdges+=result.statistics.certifiedOriginalFirstActionValueInequalityEdges;
 val.relativeEdges+=result.statistics.certifiedOriginalFirstActionValueInequalityEdges;
 if(canonical&&s.history==='44444')
  report.canonical44444SourceResult={
   status:result.status,reason:result.reason,
   chosen:result.selectedOriginalLiteralColumn,
   weakOrderEdges:result.statistics.certifiedOriginalFirstActionValueInequalityEdges,
   sourceStaticWDLGameQueries:result.statistics.sourceIndependentFutureGameWdlEvaluations};
 if(result.status!=='VALID_CONTINUATION'){report.sourceNoExtremumFound++;return;}
 report.sourceBestMoveExtremaProduced++;val.positive++;
 relative.sourceWdlOrderExtremalPositiveOriginalRoots++;
 const prev=prior.compute(q);
 const three=integratedV3.compute(q);
 v3Stats.orderSourcePositivePositionsChecked++;
 if(three.status!=='VALID_CONTINUATION'){
  v3Stats.integratedV3RefusedAPreviouslyProvedSourceOrderWinner++;
  throw Error('unified V3 discarded a positive QUALITATIVE source order best-action certificate');
 }
 if(prev.status==='VALID_CONTINUATION'){
  v3Stats.integratedV3PreservedExistingV2Certification++;
  if(three.v3ProofFamily!=='V2_ALREADY_CERTIFIED_WDL_SCALAR'||
     three.ordinaryRootValueP0Relative!==prev.ordinaryRootValueP0Relative||
     three.selectedOriginalLiteralColumn!==prev.selectedOriginalLiteralColumn)
   throw Error('unified V3 changed a qualified original V2 scalar WDL best action');
 }else{
  v3Stats.integratedV3NewBestSourceActionsVsV2++;
  if(three.ordinaryRootValueP0Relative===null &&
     three.exactRootOrdinaryWDLCertified===false)
   v3Stats.integratedV3NewBestSourceWdlScalarExplicitlyUnknown++;
  else throw Error('unified V3 illegitimately fabricated a root scalar game outcome');
  if(three.bestOutcomeTier===null)v3Stats.integratedV3NewBestSourceOutcomeTierExplicitlyUnknown++;
  else throw Error('unified V3 fabricated a root outcome tier from qualitative order alone');
  if(three.selectedOriginalLiteralColumn!==result.selectedOriginalLiteralColumn)
   throw Error('unified V3 action differs from original certified qualitative source extremum');
  if(v3Stats.newActualSourceExamples.length<15)
   v3Stats.newActualSourceExamples.push({history:s.history,ply:s.n,
    originalLiteralBestAction:three.selectedOriginalLiteralColumn,
    sourceV3ProofKind:three.v3ProofFamily,originalV2Status:prev.status,
    scalarRootWDLFromSource:three.ordinaryRootValueP0Relative});
 }
 if(prev.status==='VALID_CONTINUATION'){
  relative.oldV2AlreadyValidRoot++;
  relative['oldV2Known'+prev.bestOutcomeTier]++;
 }else{
  relative.oldV2INCOMPLETENewOneBestMove++;
  if(relative.newOverPriorExamples.length<25)
   relative.newOverPriorExamples.push({history:s.history,ply:s.n,
    mover:s.n&1,newWdlScalarFreeOriginalBestAction:result.selectedOriginalLiteralColumn,
    oldV2Status:prev.status,
    sourceQualitativeOrderPaths:result.proofOfBestAgainstEveryOtherOriginalLegalAction});
 }
 const a=result.selectedOriginalLiteralColumn-1;
 if(!legal(s).includes(a))throw Error('source returned illegal literal');
 if(legal(s).length>=2)report.sourcePositivesWith2OrMoreLegalActions++;
 if(result.exactRootOrdinaryWDL===null&&result.valueOfChosenOriginalAction===null)
  report.sourcePositivesWithNoRootWDLComputedBySource++;
 report.sourceComparedLegalActionsTotal+=legal(s).length;
 if(s.n>=35&&report.independentFullPhysicalRootWDLChecks<140){
  const value=WDL(s);
  if(prev.status==='INCOMPLETE'){
   relative.independentlyCheckedNewOriginalScalarRootWDL++;
   relative.independentlyCheckedNewBestLiteralActionWDL++;
  }else if(prev.ordinaryRootValueP0Relative!==value){
   relative.contradictionsToEarlierSourceRootWDL++;
   throw Error('previous V2 source exact root WDL contradicts independent physical WDL');
  }
  report.independentFullPhysicalRootWDLChecks++;
  const all=legal(s).map(c=>{report.independentFullPhysicalAllCurrentActionWDLChecks++;
    return [c+1,WDL(play(s,c))]});
  report.independentFullPhysicalChosenMoveWDLChecks++;
  const selected=all.find(([b])=>b===a+1);
  if(prev.status==='INCOMPLETE'){
   const chosen=all.find(([b])=>b===three.selectedOriginalLiteralColumn);
   if(!chosen||chosen[1]!==value){
    v3Stats.wrongIntegratedNewBestOriginalLiteralAction++;
    throw Error('integrated source V3 selected a nonbest original legal action');
   }
  }
  if(selected[1]!==value){
   report.sourceBestMoveFalseProofs++;
   throw Error('SOURCE_WDL_ORDER_EXTREMAL_FALSE_BEST '+JSON.stringify({
    history:s.history,ply:s.n,mover:s.n&1,chosen:a+1,
    chosenValue:selected[1],rootValue:value,allOriginalActionValues:all,
    weakSourceOrderProof:result.proofOfBestAgainstEveryOtherOriginalLegalAction}));
  }
 }
 if(report.positiveHistoricalExamples.length<25)
  report.positiveHistoricalExamples.push({
   history:s.history,ply:s.n,mover:s.n&1,
   originalLegalColumns:legal(s).map(x=>x+1),
   selectedOriginalLiteralBest:a+1,
   soundSourceWeakOrderEdges:result.statistics.certifiedOriginalFirstActionValueInequalityEdges,
   sourceBestVsEveryOtherActionPaths:result.proofOfBestAgainstEveryOtherOriginalLegalAction,
   sourceDoesNotKnowScalarRootWDL:true
  });
}
for(const history of ['','4','44444','444444','444441','4444442',
 '3154462116344525675723565411366431722']){
 let s=blank();
 for(const c of history)s=play(s,Number(c)-1);
 if(s.winner!==null)throw Error('input canonical unexpectedly terminal');
 inspect(s,true);
}
for(let g=0;g<1300;g++){
 report.nonwinningPhysicalHistoriesSampled++;
 let s=blank();
 while(s.winner===null){
  inspect(s);
  const next=legal(s).map(c=>play(s,c)).filter(x=>x.winner===null);
  if(!next.length)break;
  s=next[rand()%next.length];
 }
}
report.seedFinal=rng;
report.relativeToQualifiedV2=relative;
report.integratedV3SourceMarginal=v3Stats;
console.log(JSON.stringify(report,null,2));
