// FROZEN BEFORE EITHER independent original7x6 physical WDL or V4 source
// evaluation. Genuine physical 69-window first-win-free histories generated
// deterministically. One current original q checked per selected rank.
// PURE SOURCE uniform ALL-opponent-reply transport, no future q/game value.
// Predeclared seed/rank/game quota and legacy single-ply swap/reflection
// source-only baselines on SAME q. All positives and new edges are persisted.
import {createSourceUniformReplyFiberWdlOrder} from './standard7x6-source-uniform-reply-fiber-WDL-order.mjs';
import {createSourceFixedTwoColumnSwapWdlOrder} from '../2026-10-17-zero-fanout-direct-invariants/standard7x6-source-fixed-two-column-swap-WDL-order.mjs';
import {createOriginalSourceFixedReflectionWdlOrder} from '../2026-10-17-zero-fanout-direct-invariants/standard7x6-original-source-fixed-reflection-WDL-order.mjs';
export function generateFrozenOriginalUniformReplyCandidateCorpus({
 seed=20261018,games=2600,rankMin=26,rankMax=39,rootLimit=12500
}={}){
 const W=7,H=6,N=42,id=(c,r)=>7*r+c,bit=z=>1n<<BigInt(z);
 const lines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const L=Array.from({length:4},(_,k)=>[c+k*dc,r+k*dr]);
  if(L.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H))
   lines.push(L.map(([a,b])=>id(a,b)));
 }
 if(lines.length!==69)throw Error('genuine original7x6 exactly 69 K4 windows');
 const source=createSourceUniformReplyFiberWdlOrder({width:7,height:6,connect:4}),
   swap=createSourceFixedTwoColumnSwapWdlOrder({width:7,height:6,connect:4}),
   reflection=createOriginalSourceFixedReflectionWdlOrder({width:7,height:6,connect:4});
 let state=seed>>>0;
 function rand(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
 const pop=z=>{let n=0;for(;z;z&=z-1n)n++;return n;};
 const norm=xs=>{
  const uniq=[...new Set(xs)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const G of uniq)if(!out.some(B=>(B&G)===B))out.push(G);
  return out;
 };
 const exactQ=(board,h)=>({h:h.slice(),...Object.fromEntries([0,1].map(p=>{
  const raw=[];for(const L of lines){
   if(L.some(i=>board[i]===1-p))continue;
   let mask=0n;for(const i of L)if(board[i]===-1)mask|=bit(i);
   if(mask===0n)throw Error('first-win-stopped physical source q has original terminal line');
   raw.push(mask);
  }
  return ['R'+p,norm(raw)];
 }))});
 function physicalMoveWins(board,c,r,p){
  const i=id(c,r);board[i]=p;
  const w=lines.some(L=>L.includes(i)&&L.every(z=>board[z]===p));
  board[i]=-1;return w;
 }
 const report={schema:'connect4.original7x6.one_round_uniform_reply_fiber_preoracle_source_corpus_v0_1',
  sourceNoWdlOracleCalls:true,seed,games,rankMin,rankMax,rootLimit,
  board:{W,H,K:4,originalFourLines:lines.length},
  implementation:'Physical first-win-free random walk, every rank in [26,39] with >=2 legal first labels. Sampled q not dedup. Source-only compare new all-reply mask proof to existing frozen first-ply swap/reflection masks on SAME q. NO V4/global perm transporter or physical WDL reference in producer.',
  stats:{generatedNonwinningPhysicalHistories:0,
   sampledFirstWinFreeOriginalQ:0,
   sourceRootsWithAtLeastOneEdge:0,
   sourceProvedWeakOrderEdgesTotal:0,
   sourceEdgesAbsentFromOldOnePlySwapAndReflection:0,
   rootsWithAtLeastOneNewDirectSourceWeakOrderEdge:0,
   sourceRootsWithOneProofOfBest:0,
   oldOnePlySourceRootsWithAtLeastOneEdge:0,
   sourceNewBestRootCandidateCount:0,
   sourceSourceStructuralMaskChecks:0,
   sourceOpponentReplyLabelsExamined:0,
   sampledOriginalPlyHistogram:{},
   exactlyPhysicalRootWDLCalls:0,
   V4SourceInvocations:0},
  allSourcePositiveRoots:[],allNewWdlOrderEdgeRoots:[],
  selectedSourceNewBestRoots:[],
  referenceOracleCalled:false};
 const seen=new Set();
 for(let g=0;g<games && report.stats.sampledFirstWinFreeOriginalQ<rootLimit;g++){
  const board=Array(N).fill(-1),h=Array(W).fill(0);
  let history='';
  for(let n=0;n<N && report.stats.sampledFirstWinFreeOriginalQ<rootLimit;n++){
   if(n>=rankMin&&n<=rankMax){
    const legal=h.filter(v=>v<H).length;
    if(legal>=2){
     const q=exactQ(board,h),result=source.certify(q),fixed=swap.compute(q),
      mirrored=reflection.compute(q),legacyEdges=new Set([
       ...fixed.sourceProvedOriginalWeakWdlOrderEdges.map(e=>
        e.lowerP0ValueLiteralAction+','+e.upperP0ValueLiteralAction),
       ...mirrored.sourceP0WdlWeakOrderEdges.map(e=>
        e.lowerP0ValueOriginalLiteralAction+','+e.upperP0ValueOriginalLiteralAction)
      ]);
     const directEdges=result.sourceWeakOriginalActionOrderEdges.map(z=>z.originalFirstActionA+','+z.originalFirstActionB),
       novel=result.sourceWeakOriginalActionOrderEdges.filter(z=>!legacyEdges.has(z.originalFirstActionA+','+z.originalFirstActionB));
     const rec={history,n,heights:h.slice(),RCounts:[q.R0.length,q.R1.length],
      originalCurrentLegalLiteralColumns:h.flatMap((v,c)=>v<H?[c+1]:[]),
      newSourceStatus:result.status,sourceSelectedOriginalBestColumn:result.selectedOriginalBestLiteralColumn,
      newSourceWeakEdges:result.sourceWeakOriginalActionOrderEdges.map(x=>[x.originalFirstActionA,x.originalFirstActionB,x.mapKind]),
      onePlyPriorSourceWeakEdges:[...legacyEdges],
      newBeyondDirectOnePlyEdges:novel.map(z=>[z.originalFirstActionA,z.originalFirstActionB,z.mapKind]),
      sourceStats:result.statistics};
     report.stats.sampledFirstWinFreeOriginalQ++;
     report.stats.sampledOriginalPlyHistogram[n]=(report.stats.sampledOriginalPlyHistogram[n]||0)+1;
     report.stats.sourceProvedWeakOrderEdgesTotal+=directEdges.length;
     report.stats.sourceEdgesAbsentFromOldOnePlySwapAndReflection+=novel.length;
     report.stats.sourceOpponentReplyLabelsExamined+=result.statistics.sourcePairedOpponentReplyOriginalLabelsExamined;
     report.stats.sourceSourceStructuralMaskChecks+=result.statistics.sourceGeneratorSubsetComparisons;
     if(legacyEdges.size)report.stats.oldOnePlySourceRootsWithAtLeastOneEdge++;
     if(directEdges.length){report.stats.sourceRootsWithAtLeastOneEdge++;report.allSourcePositiveRoots.push(rec);}
     if(novel.length){report.stats.rootsWithAtLeastOneNewDirectSourceWeakOrderEdge++;
      report.allNewWdlOrderEdgeRoots.push(rec);}
     if(result.status==='SOURCE_CERTIFIED_ONE_BEST_ORIGINAL_ACTION'){
      report.stats.sourceRootsWithOneProofOfBest++;
      if(novel.length){
       report.stats.sourceNewBestRootCandidateCount++;
       report.selectedSourceNewBestRoots.push(rec);
      }
     }
    }
   }
   const safe=[];
   for(let c=0;c<W;c++)if(h[c]<H&&!physicalMoveWins(board,c,h[c],n&1))safe.push(c);
   if(!safe.length)break;
   const c=safe[rand()%safe.length],z=id(c,h[c]++);
   board[z]=n&1;history+=String(c+1);
  }
  report.stats.generatedNonwinningPhysicalHistories++;
 }
 report.stats.positiveRootsStored=report.allSourcePositiveRoots.length;
 report.stats.newEdgeRootsStored=report.allNewWdlOrderEdgeRoots.length;
 return report;
}
