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
 const a=result.selectedOriginalLiteralColumn-1;
 if(!legal(s).includes(a))throw Error('source returned illegal literal');
 if(legal(s).length>=2)report.sourcePositivesWith2OrMoreLegalActions++;
 if(result.exactRootOrdinaryWDL===null&&result.valueOfChosenOriginalAction===null)
  report.sourcePositivesWithNoRootWDLComputedBySource++;
 report.sourceComparedLegalActionsTotal+=legal(s).length;
 if(s.n>=35&&report.independentFullPhysicalRootWDLChecks<140){
  const value=WDL(s);
  report.independentFullPhysicalRootWDLChecks++;
  const all=legal(s).map(c=>{report.independentFullPhysicalAllCurrentActionWDLChecks++;
    return [c+1,WDL(play(s,c))]});
  report.independentFullPhysicalChosenMoveWDLChecks++;
  const selected=all.find(([b])=>b===a+1);
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
console.log(JSON.stringify(report,null,2));
