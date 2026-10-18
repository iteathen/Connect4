// FROZEN BEFORE EXECUTION: bitset-fused current q opponent response mask
// theorem MUST preserve EVERY positive weak WDL action order and best column
// of prior independent SOURCE per-reply cofactor checker on EXACT same root q.
// Every original q rebuilt from physical 69 K-lines after supplied legal
// first-win-free one-based history. No future game WDL/minimax whatsoever.
import {createSourceUniformReplyFiberWdlOrder} from './standard7x6-source-uniform-reply-fiber-WDL-order.mjs';
import {createSourceBitsetFusedUniformReplyWdlOrder} from './standard7x6-source-bitset-fused-uniform-reply-WDL-order.mjs';
import {generateFrozenOriginalUniformReplyCandidateCorpus} from './standard7x6-uniform-reply-fiber-frozen-preoracle-corpus.mjs';
export function checkFrozenBitsetFusedUniformReplySource(){
 const W=7,H=6,N=42,id=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z),line=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xy=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(xy.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H))line.push(xy.map(([a,b])=>id(a,b)));
 }
 if(line.length!==69)throw Error('physical original window count');
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 const min=xs=>{
  const sorted=[...new Set(xs)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const out=[];for(const G of sorted)if(!out.some(H=>(H&G)===H))out.push(G);
  return out;
 };
 function qFromHistory(history){
  const h=Array(7).fill(0),grid=Array(N).fill(-1);
  for(let k=0;k<history.length;k++){
   const c=Number(history[k])-1,p=k&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)throw Error('original gravity invalid');
   const z=id(c,h[c]++);grid[z]=p;
   if(line.some(L=>L.every(e=>grid[e]===p)))throw Error('history crossed first original terminal');
  }
  const R=[0,1].map(p=>{
   const xs=[];
   for(const L of line){
    if(L.some(e=>grid[e]===1-p))continue;
    let m=0n;for(const e of L)if(grid[e]===-1)m|=bit(e);
    if(m===0n)throw Error('prior original winner missed');
    xs.push(m);
   }
   return min(xs);
  });
  return {h,R0:R[0],R1:R[1]};
 }
 const old=createSourceUniformReplyFiberWdlOrder({width:W,height:H,connect:4});
 const fused=createSourceBitsetFusedUniformReplyWdlOrder({width:W,height:H,connect:4});
 const candidates=generateFrozenOriginalUniformReplyCandidateCorpus();
 const metrics={originalPhysicalWinlines:69,
  sourceOriginalNonwinningRootObservationsPreScreened:candidates.stats.sampledFirstWinFreeOriginalQ,
  oldPerReplySourceRootsWithPositiveWeakEdges:candidates.allSourcePositiveRoots.length,
  sourcePositiveOriginalRootsRechecked:0,
  directOriginalWdlOrderEdgeSetsMatched:0,
  directOriginalWdlOrderEdgeSetMismatches:0,
  sourceCurrentBestActionMatched:0,
  sourceCurrentBestActionMismatches:0,
  oldSourceBestCandidatesMatched:0,
  oldSourceNovelOnePlyOrderEdgesRetained:0,
  sourceExplicitPerReplyTwoPlyCofactorFamilyArraysFusedConstructed:0,
  sourceAlternateFutureGameWdlValuesEvaluated:0,
  anyOriginalPhysicalMinimaxReferenceQueries:0,
  fusedSourceOriginalGeneratorReplyScalarChecks:0,
  fusedSourceOriginalGeneratorReplyBitmaskFusions:0,
  firstMismatch:null};
 for(const item of candidates.allSourcePositiveRoots){
  const q=qFromHistory(item.history);
  if(String(q.h)!==String(item.heights)||q.R0.length!==item.RCounts[0]||
    q.R1.length!==item.RCounts[1])
   throw Error('positive source corpus history source q differs from independent physical');
  const oldResult=old.certify(q),fusedResult=fused.compute(q);
  metrics.sourcePositiveOriginalRootsRechecked++;
  const aa=oldResult.sourceWeakOriginalActionOrderEdges.map(x=>x.originalFirstActionA+','+x.originalFirstActionB).sort(),
   bb=fusedResult.sourceWeakOriginalFirstActionOrderEdges.map(x=>x.originalFirstActionA+','+x.originalFirstActionB).sort();
  if(String(aa)!==String(bb)){
   metrics.directOriginalWdlOrderEdgeSetMismatches++;
   metrics.firstMismatch={originalOneBasedHistory:item.history,ply:item.n,
    oldOriginalActionWdlEdges:aa,newFusedOriginalActionWdlEdges:bb,
    originalPhysicalRCounts:[q.R0.length,q.R1.length]};
   return {status:'SOURCE_FUSED_REPLY_ORDER_REGRESSION_FAIL',metrics};
  }
  metrics.directOriginalWdlOrderEdgeSetsMatched++;
  if(oldResult.selectedOriginalBestLiteralColumn!==fusedResult.selectedOriginalLiteralBestColumn){
   metrics.sourceCurrentBestActionMismatches++;
   metrics.firstMismatch={history:item.history,
    old:oldResult.selectedOriginalBestLiteralColumn,newOne:fusedResult.selectedOriginalLiteralBestColumn};
   return {status:'SOURCE_FUSED_REPLY_BEST_ACTION_REGRESSION_FAIL',metrics};
  }
  metrics.sourceCurrentBestActionMatched++;
  if(oldResult.selectedOriginalBestLiteralColumn!==null)metrics.oldSourceBestCandidatesMatched++;
  metrics.fusedSourceOriginalGeneratorReplyScalarChecks+=
   fusedResult.statistics.sourceOriginalGeneratorPairReplyScalarPredicateChecks;
  metrics.fusedSourceOriginalGeneratorReplyBitmaskFusions+=
   fusedResult.statistics.sourceOriginalGeneratorPairReplyBitwiseMaskFusions;
  metrics.sourceExplicitPerReplyTwoPlyCofactorFamilyArraysFusedConstructed+=
   fusedResult.statistics.sourceRawPerReplyGeneratorFamilyArraysConstructed;
 }
 for(const item of candidates.allNewWdlOrderEdgeRoots){
  const q=qFromHistory(item.history),f=fused.compute(q);
  const e=new Set(f.sourceWeakOriginalFirstActionOrderEdges.map(x=>x.originalFirstActionA+','+x.originalFirstActionB));
  for(const [a,b] of item.newBeyondDirectOnePlyEdges){
   if(!e.has(a+','+b))throw Error('fused source lost previously frozen novel and physically validated weak order edge');
   metrics.oldSourceNovelOnePlyOrderEdgesRetained++;
  }
 }
 if(metrics.oldSourceNovelOnePlyOrderEdgesRetained!==112||
    metrics.sourcePositiveOriginalRootsRechecked!==2851||
    metrics.oldSourceBestCandidatesMatched!==35)throw Error('frozen same-corpus reference unexpectedly changed');
 const canonical=qFromHistory('44444'),core=fused.compute(canonical);
 return {status:'SOURCE_FUSED_REPLY_MASK_EXACT_POSITIVE_EDGE_REGRESSION_PASS',
  originalCanonical44444SourceStatus:core.status,
  originalCanonical44444BestMoveNotProved:core.selectedOriginalLiteralBestColumn===null,
  metrics,sourceProducerNoFutureGameValues:true,firstNovelSourceBestCertificate:
    candidates.selectedSourceNewBestRoots[0]?{
      originalHistory:candidates.selectedSourceNewBestRoots[0].history,
      selectedOriginalLiteralColumn:candidates.selectedSourceNewBestRoots[0].sourceSelectedOriginalBestColumn
    }:null};
}
