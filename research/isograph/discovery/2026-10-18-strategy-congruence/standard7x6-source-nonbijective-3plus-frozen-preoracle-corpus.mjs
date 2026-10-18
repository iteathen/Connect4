// Freeze deterministic ORIGINAL true W7H6K4 nonwinning history corpus BEFORE
// any independent physical minimax WDL or V4 source. SOURCE raw generator
// 69 K-windows and NONBIJECTIVE reply E(r,s) proof only.
import {createOriginalNonbijectiveReplyWdlOrder} from './standard7x6-source-nonbijective-reply-WDL-order.mjs';
import {createSourceBitsetFusedUniformReplyWdlOrder} from './standard7x6-source-bitset-fused-uniform-reply-WDL-order.mjs';
export function generateFrozenNonbijective3PlusCorpus({
 seed=20261018,maxGameHistories=2400,rankMin=29,rankMax=38,
 minLegal=3,maxPositionObservations=7000
}={}){
 const W=7,H=6,N=42,id=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z),line=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xy=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(xy.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H))
   line.push(xy.map(([a,b])=>id(a,b)));
 }
 if(line.length!==69)throw Error('wrong original69 W7H6 K4 winning lines');
 let state=seed>>>0;function rng(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
 const pop=m=>{let x=0;for(;m;m&=m-1n)x++;return x;};
 function antichain(a){
  const v=[...new Set(a)].sort((u,w)=>pop(u)-pop(w)||(u<w?-1:u>w?1:0)),out=[];
  for(const G of v)if(!out.some(M=>(G&M)===M))out.push(G);
  return out;
 }
 function sourceQ(board,h){
  const R=[0,1].map(p=>{
   const raw=[];
   for(const L of line){
    if(L.some(e=>board[e]===1-p))continue;
    let G=0n;for(const e of L)if(board[e]===-1)G|=bit(e);
    if(G===0n)throw Error('nonterminal physical root has original first winner');
    raw.push(G);
   }
   return antichain(raw);
  });
  return {h:h.slice(),R0:R[0],R1:R[1]};
 }
 function immediatePhysicalWin(board,c,r,p){
  const z=id(c,r);board[z]=p;
  const w=line.some(L=>L.includes(z)&&L.every(t=>board[t]===p));
  board[z]=-1;return w;
 }
 const source=createOriginalNonbijectiveReplyWdlOrder({width:W,height:H,connect:4}),
   previous=createSourceBitsetFusedUniformReplyWdlOrder({width:W,height:H,connect:4});
 const results={
  schema:'connect4.original7x6.nonbijective_reply_3plus_preoracle_source_frozen_v0_1',
  originalBoard:{W,H,K:4,geometricWinningLines:69},
  seed,maxGameHistories,rankMin,rankMax,minLegal,maxPositionObservations,
  sourceIndependentFutureGameWDLQueries:0,priorV4OracleQueries:0,
  generation:'Seeded first-win-free original gravity walk; inspect q only with >=3 current legal physical columns at ranks29..38. Original R0/R1 normalized from 69 original K4 windows. Candidate source and old fused SOURCE both run before any WDL, no per-reply future q values.',
  stats:{
   firstWinFreeGameHistoriesGenerated:0,
   trueOriginalNonterminalRootsScreened:0,
   distinctHeightSupportProfiles:0,
   moverP0:0,moverP1:0,
   3Legal:0,4Legal:0,5OrMoreLegal:0,
   sourcePositiveWdlOrderEdges:0,
   sourceRootsWithPositiveWdlEdges:0,
   sourceEdgesNotProvedByPreviousFixedInvolutionReplyMethod:0,
   sourceRootsWithNewWeakWdlEdges:0,
   sourceThreePlusGlobalBestCandidateRoots:0,
   sourceBestCandidateRootsWherePreviousFusedIncomplete:0,
   sourceOriginalGeneratorStaticSubsetChecks:0,
   sourceRootReplyLabelPairTests:0,
   sourceGenuineNoGameWDLValuesRead:0
  },
  sourceAllThreePlusBestCandidates:[],
  sourceBestBeyondPreviousFusedCandidates:[],
  exampleNovelWeakEdges:[],
  canonical44444SourceResult:null,
  knownCausalCounterexampleSourceResult:null
 };
 const histShapes=new Set();
 function evaluate(history,h,board){
  const q=sourceQ(board,h),now=source.analyze(q),old=previous.compute(q);
  const legal=now.originalLegalLiteralFirstActions;
  const oldEdges=new Set(old.sourceWeakOriginalFirstActionOrderEdges.map(e=>e.originalFirstActionA+','+e.originalFirstActionB));
  const novel=now.sourceOriginalWeakP0WdlEdges.filter(e=>
   !oldEdges.has(e.lowerP0RelativeOriginalFirstColumn+','+e.upperP0RelativeOriginalFirstColumn));
  const cand={
   history,n:history.length,
   heights:h.slice(),RCounts:[q.R0.length,q.R1.length],
   currentMover:history.length&1,originalLegalLiteralColumns:legal,
   sourceBest:now.selectedBestOriginalColumn,
   previousFusedStatus:old.status,
   previousFusedBest:old.selectedOriginalLiteralBestColumn,
   sourceOrderEdges:now.sourceOriginalWeakP0WdlEdges.map(z=>[z.lowerP0RelativeOriginalFirstColumn,z.upperP0RelativeOriginalFirstColumn]),
   sourceNewVersusOldFusedEdges:novel.map(e=>[e.lowerP0RelativeOriginalFirstColumn,e.upperP0RelativeOriginalFirstColumn]),
   sourceStats:now.statistics
  };
  results.stats.trueOriginalNonterminalRootsScreened++;
  histShapes.add(h.join(','));
  results.stats[history.length&1?'moverP1':'moverP0']++;
  if(legal.length===3)results.stats['3Legal']++;
  else if(legal.length===4)results.stats['4Legal']++;
  else results.stats['5OrMoreLegal']++;
  results.stats.sourcePositiveWdlOrderEdges+=now.sourceOriginalWeakP0WdlEdges.length;
  if(now.sourceOriginalWeakP0WdlEdges.length)results.stats.sourceRootsWithPositiveWdlEdges++;
  results.stats.sourceEdgesNotProvedByPreviousFixedInvolutionReplyMethod+=novel.length;
  if(novel.length){
   results.stats.sourceRootsWithNewWeakWdlEdges++;
   if(results.exampleNovelWeakEdges.length<100)
    results.exampleNovelWeakEdges.push({
     history,ply:history.length,legal,novelWeakEdges:cand.sourceNewVersusOldFusedEdges,
     newSourceBest:now.selectedBestOriginalColumn});
  }
  if(now.selectedBestOriginalColumn!==null){
   results.stats.sourceThreePlusGlobalBestCandidateRoots++;
   results.sourceAllThreePlusBestCandidates.push(cand);
   if(old.selectedOriginalLiteralBestColumn===null){
    results.stats.sourceBestCandidateRootsWherePreviousFusedIncomplete++;
    results.sourceBestBeyondPreviousFusedCandidates.push(cand);
   }
  }
  results.stats.sourceOriginalGeneratorStaticSubsetChecks+=now.statistics.sourceOriginalGeneratorSubsetChecks;
  results.stats.sourceRootReplyLabelPairTests+=now.statistics.sourceOpponentReplyOriginalLabelPairRelationChecks;
 }
 for(let g=0;g<maxGameHistories && results.stats.trueOriginalNonterminalRootsScreened<maxPositionObservations;g++){
  const board=Array(N).fill(-1),h=Array(W).fill(0);let history='';
  for(let n=0;n<N && results.stats.trueOriginalNonterminalRootsScreened<maxPositionObservations;n++){
   if(n>=rankMin&&n<=rankMax&&h.filter(z=>z<H).length>=minLegal)
    evaluate(history,h,board);
   const candidates=[];
   for(let c=0;c<W;c++)if(h[c]<H&&!immediatePhysicalWin(board,c,h[c],n&1))candidates.push(c);
   if(!candidates.length)break;
   const c=candidates[rng()%candidates.length],z=id(c,h[c]++);
   board[z]=n&1;history+=String(c+1);
  }
  results.stats.firstWinFreeGameHistoriesGenerated++;
 }
 results.stats.distinctHeightSupportProfiles=histShapes.size;
 // Fixed source-only original cases outside the rank-focused source sample;
 // never query any WDL, oracle, V4 or future game in producer.
 function replay(history){
  const board=Array(N).fill(-1),h=Array(W).fill(0);
  for(let n=0;n<history.length;n++){
   const c=Number(history[n])-1,p=n&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)throw Error('fixed original history illegal');
   const z=id(c,h[c]++);board[z]=p;
   if(line.some(L=>L.every(e=>board[e]===p)))throw Error('fixed input already terminal');
  }
  const q=sourceQ(board,h);
  const result=source.analyze(q);
  return {history,ply:history.length,originalLegalLiteralColumns:result.originalLegalLiteralFirstActions,
   sourceStatus:result.status,sourceSelectedBestOriginalColumn:result.selectedBestOriginalColumn,
   sourceEdges:result.sourceOriginalWeakP0WdlEdges.map(e=>
    [e.lowerP0RelativeOriginalFirstColumn,e.upperP0RelativeOriginalFirstColumn]),
   sourceStructuralReplyPairsTested:result.statistics.sourceOpponentReplyOriginalLabelPairRelationChecks};
 }
 results.canonical44444SourceResult=replay('44444');
 results.knownCausalCounterexampleSourceResult=replay('2532541156412471331416356736376672');
 return results;
}
