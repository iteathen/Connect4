// Frozen before validation: repeatable original W7 H6 K4 owner-color barrier pilot.
// Source mathematical theorem / physical checker committed separately.
// Exact specified 630 empty-board (a,b,c,L) combinations PLUS seeded genuine
// first-win-free histories. No game WDL oracle / strategic path valuation.
import {createPhysicalOddColumnBarrierValidator} from './standard7x6-odd-column-barrier-independent-physical-control.mjs';
export function runOriginalOddColorBarrierControls({seed=20261018,games=160}={}){
 const checker=createPhysicalOddColumnBarrierValidator();
 let x=seed>>>0;
 function rnd(){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
 const stats={schema:'connect4.7x6.odd_vertical_barrier_color_fiber_v0_1',
  seed,games,board:'7x6 K4, 69 original source winlines',
  initialPositionExactFiber:checker.enumerateEmptySevenWordFiber(),
  emptyDistinctTripleOddLSourceCases:0,
  emptyDistinctTripleOddLGuardPositive:0,
  emptyDistinctTripleOddLGuardIncomplete:0,
  emptyDistinctTripleOddLPhysicalMismatches:0,
  actualNonwinningPhysicalHistoriesGenerated:0,
  sampledNonterminalGenuinePhysicalPositions:0,
  sampledLateOddBarrierSourcePositive:0,
  sampledLateOddBarrierSourceIncomplete:0,
  sampledLateOddBarrierPhysicalMismatches:0,
  samplePositiveCases:[],sampleIncompleteCases:[],
  rootOrActionWDLQueries:0,sourceStrategyGameValueQueries:0,
  numberOfFullFutureGameWordsEnumeratedBySource:0,
  originalColoredBoardVsSourceSourceConflict:0};
 for(let a=1;a<=7;a++)for(let b=1;b<=7;b++)for(let c=1;c<=7;c++)if(new Set([a,b,c]).size===3){
  for(const L of [1,3,5]){
   stats.emptyDistinctTripleOddLSourceCases++;
   const out=checker.verify('',{a,b,c,L});
   if(out.status==='ORIGINAL_PHYSICAL_GUARDED_TRACE_PASS')
    stats.emptyDistinctTripleOddLGuardPositive++;
   else stats.emptyDistinctTripleOddLGuardIncomplete++;
  }
 }
 for(let k=0;k<games;k++){
  let history='';
  for(let turn=0;turn<42;turn++){
   const choices=[];
   for(let c=1;c<=7;c++){
    try{checker.fromHistory(history+c);choices.push(c);}
    catch(e){if(!/bad gravity history|prefix is NOT genuinely first-win-stopped nonterminal/.test(String(e)))throw e;}
   }
   if(!choices.length)break;
   if(history.length>=8&&history.length<=33&&history.length%3===0&&choices.length>=3){
    stats.sampledNonterminalGenuinePhysicalPositions++;
    const sample=choices.slice();
    for(let i=sample.length-1;i>0;i--){const j=rnd()%(i+1);[sample[i],sample[j]]=[sample[j],sample[i]];}
    const [a,b,c]=sample,remain=6-checker.fromHistory(history).h[c-1];
    const odd=[1,3,5].filter(z=>z<=remain);
    if(odd.length){
     const L=odd[rnd()%odd.length],result=checker.verify(history,{a,b,c,L});
     if(result.status==='ORIGINAL_PHYSICAL_GUARDED_TRACE_PASS'){
      stats.sampledLateOddBarrierSourcePositive++;
      if(stats.samplePositiveCases.length<8)stats.samplePositiveCases.push(result);
     } else {
      stats.sampledLateOddBarrierSourceIncomplete++;
      if(stats.sampleIncompleteCases.length<8)stats.sampleIncompleteCases.push({history,a,b,c,L,reason:result.reason});
     }
    }
   }
   const c=choices[rnd()%choices.length];history+=String(c);
  }
  stats.actualNonwinningPhysicalHistoriesGenerated++;
 }
 if(stats.emptyDistinctTripleOddLSourceCases!==630)throw Error('exact 7P3*3 static enumeration mismatch');
 if(stats.emptyDistinctTripleOddLGuardPositive+stats.emptyDistinctTripleOddLGuardIncomplete!==630)
  throw Error('missing original source empty cases');
 return stats;
}
