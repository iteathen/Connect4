// Independently physical W=7,H=6,K=4 first-win-stopped colored board control.
// Reuses independently frozen original 69-line physical q constructor.
// Tests both source-selected FOUR-MOVE words only AFTER original source guard.
// Static 7P4 current-column permutations are test cases, not strategic game-WDL valuations.
import { createOriginal7x6RacePhysicalFalsifier } from './original7x6-gravity-poset-race-physical-falsifier.mjs';
import { createOriginalTwoRoundTraceDiamond } from './original-q-two-round-owner-preserving-diamond.mjs';
export function createOriginal7x6TwoRoundPhysicalControl(){
 const physical=createOriginal7x6RacePhysicalFalsifier();
 const source=createOriginalTwoRoundTraceDiamond({width:7,height:6,connect:4});
 function verify(history,cols){
  const root=physical.fromHistory(history);
  const cert=source.check(root.q,cols);
  if(cert.status!=='CERTIFIED_TWO_ROUND_OWNER_PRESERVING_QO_DIAMOND')
   return {status:'SOURCE_INCOMPLETE',reason:cert.reason,columns:cols};
  function replay(w){
   const suffix=w.map(c=>String(c)).join('');
   return physical.fromHistory(history+suffix);
  }
  const a=replay(cert.firstOriginalLiteralFourMoveWord);
  const b=replay(cert.secondOriginalLiteralFourMoveWord);
  const same=JSON.stringify(a.h)===JSON.stringify(b.h)&&
   JSON.stringify(a.grid)===JSON.stringify(b.grid)&&
   a.q.R0.length===b.q.R0.length&&a.q.R1.length===b.q.R1.length&&
   a.q.R0.every((v,i)=>v===b.q.R0[i])&&a.q.R1.every((v,i)=>v===b.q.R1[i]);
  if(!same)throw Error('PHYSICAL FIRST-WIN OR ORIGINAL q ENDPOINT MISMATCH '+history+'/'+cols);
  return {status:'PHYSICAL_EXACT_QO_DIAMOND_PASS',columns:cols,
   firstWord:cert.firstOriginalLiteralFourMoveWord,
   secondWord:cert.secondOriginalLiteralFourMoveWord,
   totalSourceMaskSubsetChecks:cert.statistics.sourceCurrentGeneratorMaskSubsetChecks,
   originalOwnerResidualCountsAfterFourMoves:[a.q.R0.length,a.q.R1.length],
   boardFullDrawAfterBlock:a.n===42,sourceFutureGameWDLCalls:0};
 }
 function sweepCanonical(){
  const history='44444',stats={sourceFourDistinctLabelQuadruples:0,
   certifiedDiamonds:0,sourceNoCertificate:0,
   independentPhysicalFirstWinFreeWholeBlockComparisons:0,
   exactOriginalQEndpointMismatches:0,
   guardedRootLevel2BestMoveClaimed:0,firstGuardedExamples:[]};
  for(let a=1;a<=7;a++)for(let b=1;b<=7;b++)for(let c=1;c<=7;c++)for(let d=1;d<=7;d++){
   if(new Set([a,b,c,d]).size!==4)continue;
   stats.sourceFourDistinctLabelQuadruples++;
   const result=verify(history,[a,b,c,d]);
   if(result.status==='SOURCE_INCOMPLETE'){stats.sourceNoCertificate++;continue;}
   stats.certifiedDiamonds++;
   stats.independentPhysicalFirstWinFreeWholeBlockComparisons++;
   if(stats.firstGuardedExamples.length<8)stats.firstGuardedExamples.push(result.columns);
  }
  if(stats.sourceFourDistinctLabelQuadruples!==840)throw Error('not 7P4 current labels');
  return stats;
 }
 return Object.freeze({verify,sweepCanonical});
}
