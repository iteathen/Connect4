// Frozen independent original7x6 69-win physical colored-board falsifier of
// direct nonterminal original-source batch cofactor / same-owner projection.
import { createOriginal7x6RacePhysicalFalsifier } from './original7x6-gravity-poset-race-physical-falsifier.mjs';
import { createOriginalColumnOwnerBatchCofactor } from './original-q-column-owner-batch-cofactor.mjs';
export function createOriginal7x6ColumnOwnerBatchPhysicalControl(){
 const independent=createOriginal7x6RacePhysicalFalsifier();
 const source=createOriginalColumnOwnerBatchCofactor({width:7,height:6,connect:4});
 const id=(c,r)=>r*7+c;
 const lines=[];
 for(let c=0;c<7;c++)for(let r=0;r<6;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const cc=Array.from({length:4},(_,i)=>[c+dc*i,r+dr*i]);
  if(cc.every(([x,y])=>x>=0&&x<7&&y>=0&&y<6))
   lines.push(cc.map(([x,y])=>id(x,y)));
 }
 if(lines.length!==69)throw Error('physical observer must have 69 original winlines');
 function directPhysical(history,word){
  const root=independent.fromHistory(history),board=root.grid.slice(),h=root.h.slice();
  let first=null;
  for(let j=0;j<word.length;j++){
   const c=word[j]-1,p=(root.n+j)&1;
   if(!Number.isInteger(c)||c<0||c>=7||h[c]>=6)throw Error('illegal physical word');
   const x=id(c,h[c]++);board[x]=p;
   if(first===null&&lines.some(L=>L.every(z=>board[z]===p)))
    first={player:p,absolutePly:root.n+j+1};
  }
  return {first,board,h};
 }
 function equivalentQ(a,b){
  return JSON.stringify(a.h)===JSON.stringify(b.h)&&a.R0.length===b.R0.length&&
   a.R1.length===b.R1.length&&a.R0.every((m,i)=>m===b.R0[i])&&
   a.R1.every((m,i)=>m===b.R1[i]);
 }
 function verify(history,oneWord,twoWord=null){
  const root=independent.fromHistory(history),q=root.q;
  const original=source.batch(q,oneWord),phys=directPhysical(history,oneWord);
  const stats={sourceStatus:original.status,originalHistory:history,
   oneSuppliedWord:oneWord.join(''),physicalFirstWinner:phys.first?.player??null,
   sourceOriginalRootWDLComputed:false,physicalContradictions:0};
  if(original.status==='CERTIFIED_EXACT_NONTERMINAL_BATCH_ORIENTED_Q'){
   if(phys.first!==null)throw Error('PHYSICAL WIN CONTRADICTS SOURCE BATCH');
   const independentlyBuilt=independent.fromHistory(history+oneWord.join(''));
   if(!equivalentQ(original.fixedAllocationResultingQ,independentlyBuilt.q))
    throw Error('BATCH ORIGINAL SOURCE q CONTRADICTS INDEPENDENT q');
  }else if(original.status==='CERTIFIED_FIRST_WINNER_OF_ONE_SUPPLIED_EVENT_OWNER_ALLOCATION'){
   if(phys.first?.player!==original.fixedAllocationFirstWinningPlayer)
    throw Error('FIXED ALLOCATION FIRST WINNER PHYSICAL MISMATCH');
  }else if(original.status==='CERTIFIED_FIXED_ALLOCATION_FULL_BOARD_DRAW'){
   if(phys.first!==null||!phys.h.every(z=>z===6))throw Error('FALSE FULL DRAW');
  }else if(original.status!=='INCOMPLETE_DUAL_COMPLETION_FIRST_WIN_RACE')
   throw Error('unexpected source status '+original.status);
  if(twoWord!==null){
   const comparison=source.compare(q,oneWord,twoWord);
   stats.sourceComparisonStatus=comparison.status;
   if(comparison.status==='CERTIFIED_EXACT_NONTERMINAL_BATCH_ORIENTED_Q'){
    const otherPhysical=directPhysical(history,twoWord);
    if(otherPhysical.first!==null||JSON.stringify(phys.board)!==JSON.stringify(otherPhysical.board))
     throw Error('SAME OWNER ALLOCATION DIFFERENT PHYSICAL FINAL BOARD');
    const otherQ=independent.fromHistory(history+twoWord.join(''));
    if(!equivalentQ(comparison.fixedAllocationResultingQ,otherQ.q))
     throw Error('SAME OWNER ALLOCATION DIFFERENT q');
   }
   if(comparison.status==='CERTIFIED_FIRST_WINNER_OF_ONE_SUPPLIED_EVENT_OWNER_ALLOCATION'){
    const otherPhysical=directPhysical(history,twoWord);
    if(otherPhysical.first?.player!==comparison.fixedAllocationFirstWinningPlayer)
     throw Error('FIRST WINNER NOT PROJECTED OUT OF TIME');
   }
   if(comparison.status==='CERTIFIED_FIXED_ALLOCATION_FULL_BOARD_DRAW'){
    const otherPhysical=directPhysical(history,twoWord);
    if(otherPhysical.first!==null)throw Error('SAME-ALLOCATION FULL-DRAW CONTRADICTION');
   }
  }
  return stats;
 }
 function canonicalRoundReorderSweep(){
  const root='44444',summary={allFourColumnTuples:2401,
    excludedCapacityIllegalTuples:0,physicallyCheckedCapacityLegalPairs:0,
    sourceColoredOwnerAllocationEqualPairs:0,sourceDifferentOwnerAllocationPairs:0,
    certifiedSameFutureQNonterminalPairs:0,
    certifiedSameFixedAllocationUniqueFirstWinnerPairs:0,
    dualCompletionRaceIncompletePairs:0,physicalContradictions:0};
  for(let a=1;a<=7;a++)for(let b=1;b<=7;b++)for(let c=1;c<=7;c++)for(let d=1;d<=7;d++){
   const t=[a,b,c,d],s=[c,d,a,b],centerCount=t.filter(x=>x===4).length;
   if(centerCount>1){summary.excludedCapacityIllegalTuples++;continue;}
   summary.physicallyCheckedCapacityLegalPairs++;
   const out=verify(root,t,s);
   if(out.sourceComparisonStatus==='INCOMPLETE_DIFFERENT_ORIGINAL_EVENT_OWNER_ALLOCATIONS')
    summary.sourceDifferentOwnerAllocationPairs++;
   else{
    summary.sourceColoredOwnerAllocationEqualPairs++;
    if(out.sourceComparisonStatus==='CERTIFIED_EXACT_NONTERMINAL_BATCH_ORIENTED_Q')
     summary.certifiedSameFutureQNonterminalPairs++;
    else if(out.sourceComparisonStatus==='CERTIFIED_FIRST_WINNER_OF_ONE_SUPPLIED_EVENT_OWNER_ALLOCATION')
     summary.certifiedSameFixedAllocationUniqueFirstWinnerPairs++;
    else if(out.sourceComparisonStatus==='INCOMPLETE_DUAL_COMPLETION_FIRST_WIN_RACE')
     summary.dualCompletionRaceIncompletePairs++;
   }
  }
  if(summary.physicallyCheckedCapacityLegalPairs+summary.excludedCapacityIllegalTuples!==2401)
   throw Error('not exact 7^4 coverage');
  return summary;
 }
 return Object.freeze({verify,directPhysical,canonicalRoundReorderSweep});
}
