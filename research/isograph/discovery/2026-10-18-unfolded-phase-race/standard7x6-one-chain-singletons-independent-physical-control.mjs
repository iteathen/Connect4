// INDEPENDENT original true 7x6 K4 physical enumerator for frozen one-chain
// singleton source phase feasibility: test all fixed-event interleavings and
// all requested owner projections. NOT a strategic game-value algorithm.
import {createOneChainSingletonPhaseRealizer} from './standard7x6-source-one-chain-singletons-phase-realizer.mjs';
export function createPhysicalOneChainSingletonChecker(){
 const W=7,H=6,N=42,id=(c,r)=>7*r+c,bit=z=>1n<<BigInt(z),lines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const cells=Array.from({length:4},(_,j)=>[c+j*dc,r+j*dr]);
  if(cells.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H))
   lines.push(cells.map(([a,b])=>id(a,b)));
 }
 if(lines.length!==69)throw Error('NOT 69 original physical winning K4 lines');
 const source=createOneChainSingletonPhaseRealizer({width:7,height:6,connect:4});
 const pop=m=>{let s=0;for(;m;m&=m-1n)s++;return s;};
 const norm=(xs)=>{
  const u=[...new Set(xs)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const out=[];for(const G of u)if(!out.some(z=>(G&z)===z))out.push(G);return out;
 };
 function buildQ(board,h){
  const R=[0,1].map(p=>{
   const out=[];
   for(const L of lines){
    if(L.some(e=>board[e]===1-p))continue;
    let mask=0n;for(const z of L)if(board[z]===-1)mask|=bit(z);
    if(mask===0n)throw Error('physical root or final board has already won');
    out.push(mask);
   }
   return norm(out);
  });
  return {h:h.slice(),R0:R[0],R1:R[1]};
 }
 function root(history){
  const h=Array(7).fill(0),board=Array(42).fill(-1);
  for(let j=0;j<history.length;j++){
   const c=Number(history[j])-1,p=j&1;
   if(!Number.isInteger(c)||c<0||c>=7||h[c]>=6)throw Error('illegal original root history');
   const z=id(c,h[c]++);board[z]=p;
   if(lines.some(L=>L.every(x=>board[x]===p)))throw Error('root history crosses first win');
  }
  return {h,board,n:history.length,q:buildQ(board,h)};
 }
 function replay(from,word){
  const h=from.h.slice(),board=from.board.slice(),eventOwners=new Map();
  let firstWin=null;
  for(let t=0;t<word.length;t++){
   const c=word[t]-1,p=(from.n+t)&1;
   if(!Number.isInteger(c)||c<0||c>=7||h[c]>=6)throw Error('illegal gravity word in physical control');
   const z=id(c,h[c]++);board[z]=p;eventOwners.set(z,p);
   if(firstWin===null&&lines.some(L=>L.every(x=>board[x]===p)))
    firstWin={winner:p,relativeEvent:t+1};
  }
  return {h,board,eventOwners,firstWin};
 }
 function targetKey(chainOwners,singletonOwners){
  return chainOwners.join('')+'|'+singletonOwners.join('');
 }
 function signature(from,played,c,L,singletons){
  const xc=[];for(let j=0;j<L;j++)xc.push(played.eventOwners.get(id(c-1,from.h[c-1]+j)));
  const ys=singletons.map(z=>played.eventOwners.get(id(z-1,from.h[z-1])));
  if([...xc,...ys].some(z=>z!==0&&z!==1))throw Error('missing fixed future physical event');
  return targetKey(xc,ys);
 }
 function words(c,L,singletons){
  const items=[c,...singletons],counts=new Map(items.map(z=>[z,z===c?L:1])),target=L+singletons.length;
  const out=[],prefix=[];
  function rec(){
   if(prefix.length===target){out.push(prefix.slice());return;}
   for(const col of items){
    const remaining=counts.get(col);
    if(remaining<=0)continue;
    counts.set(col,remaining-1);prefix.push(col);rec();prefix.pop();counts.set(col,remaining);
   }
  }
  rec();return out;
 }
 function verifyCase(history,{c,L,singletons}){
  const from=root(history),T=L+singletons.length;
  if(from.h[c-1]+L>6||singletons.some(a=>a===c||from.h[a-1]>=6)||
   new Set(singletons).size!==singletons.length)
   throw Error('invalid case original capacity');
  const allWords=words(c,L,singletons),distinct=new Map();
  for(const w of allWords){
   const result=replay(from,w),sig=signature(from,result,c,L,singletons);
   if(!distinct.has(sig))distinct.set(sig,[]);
   distinct.get(sig).push(w);
  }
  const tally={status:'EXHAUSTIVE_ORIGINAL_7X6_ONE_CHAIN_CASE_PASS',
   rootHistory:history,rootPly:from.n,sourceRCounts:[from.q.R0.length,from.q.R1.length],
   chainColumn:c,L,singletons:singletons.slice(),
   physicallyEnumeratedGravityEventWords:allWords.length,
   physicallyAttainableOwnerPatterns:distinct.size,
   sourceAllBinaryOwnerAllocationsConsidered:0,
   sourceFeasible:0,sourceProvenInfeasible:0,sourceFalsePositive:0,sourceFalseNegative:0,
   feasibleSourceNonterminal:0,feasibleSourceFixedFirstWinner:0,
   feasibleSourceDualCompletionRaceIncomplete:0,feasibleSourceFullDraw:0,
   physicalTerminalOrBatchMismatches:0,sampleRejectedOwnerPatterns:[]};
  for(let pattern=0;pattern<2**T;pattern++){
   const target=Array.from({length:T},(_,j)=>(pattern>>j)&1);
   const x=target.slice(0,L),ys=target.slice(L),sig=targetKey(x,ys);
   const exists=distinct.has(sig);
   const s=source.compute(from.q,{chainColumn:c,L,singletonColumns:singletons,
    chainOwners:x,singletonOwners:ys});
   tally.sourceAllBinaryOwnerAllocationsConsidered++;
   const feasible=!s.status.startsWith('SOURCE_PROVEN_OWNER_PROJECTION_NOT_REALIZABLE');
   if(s.status==='INCOMPLETE_INVALID_GUARDS_OR_PHYSICAL_EVENTS')throw Error('validator supplied malformed source case');
   if(feasible!==exists){
    if(feasible)tally.sourceFalsePositive++;else tally.sourceFalseNegative++;
    throw Error('EXACT PHASE SHUFFLE FEASIBILITY DISAGREEMENT '+JSON.stringify({history,c,L,singletons,target,s:s.status,exists}));
   }
   if(!feasible){
    tally.sourceProvenInfeasible++;
    if(tally.sampleRejectedOwnerPatterns.length<4)tally.sampleRejectedOwnerPatterns.push({x,ys,M:s.sourceMinimumSingletonPrefixPhaseTransitions,why:s.reason});
    continue;
   }
   tally.sourceFeasible++;
   const canonical=s.oneSourceCanonicalGravityLegalSegment;
   if(!Array.isArray(canonical)||canonical.length!==T||!distinct.get(sig).some(w=>JSON.stringify(w)===JSON.stringify(canonical)))
    throw Error('SOURCE CONSTRUCTED NONEXISTENT CANONICAL PHYSICAL WORD');
   const played=replay(from,canonical);
   if(signature(from,played,c,L,singletons)!==sig)
    throw Error('SOURCE CANONICAL PHASE DOES NOT MATCH PHYSICAL CELLS');
   if(s.status==='SOURCE_FEASIBLE_PHASE_AND_EXACT_NONTERMINAL_BATCH_Q'){
    tally.feasibleSourceNonterminal++;
    if(played.firstWin!==null)throw Error('SOURCE FALSELY CLAIMS NO EARLY WIN');
    const q2=buildQ(played.board,played.h),sq=s.exactOrientedAfterSegmentQ;
    const same=JSON.stringify(q2.h)===JSON.stringify(sq.h)&&
      q2.R0.length===sq.R0.length&&q2.R1.length===sq.R1.length&&
      q2.R0.every((m,i)=>m===sq.R0[i])&&q2.R1.every((m,i)=>m===sq.R1[i]);
    if(!same)throw Error('SOURCE DIRECT BATCH q DOES NOT MATCH INDEPENDENT PHYSICAL q');
   }else if(s.status==='SOURCE_FEASIBLE_FIXED_SEGMENT_SINGLE_FIRST_WINNER'){
    tally.feasibleSourceFixedFirstWinner++;
    if(played.firstWin?.winner!==s.fixedSegmentFirstWinner)
     throw Error('SOURCE FIXED TERMINAL PLAYER DIFFERENT FROM ORIGINAL PHYSICAL FIRST WIN');
   }else if(s.status==='SOURCE_FEASIBLE_PHASE_BUT_INCOMPLETE_DUAL_COMPLETION_RACE'){
    tally.feasibleSourceDualCompletionRaceIncomplete++;
   }else if(s.status==='SOURCE_FEASIBLE_FIXED_SEGMENT_FULL_DRAW'){
    tally.feasibleSourceFullDraw++;
    if(played.firstWin!==null||!played.h.every(z=>z===6))
     throw Error('FALSE SOURCE COMPLETE BOARD DRAW');
   }else throw Error('UNRECOGNIZED SOURCE STRUCTURAL STATUS '+s.status);
  }
  return tally;
 }
 return Object.freeze({root,replay,signature,verifyCase});
}
