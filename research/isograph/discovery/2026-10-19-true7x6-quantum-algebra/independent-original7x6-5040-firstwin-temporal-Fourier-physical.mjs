// INDEPENDENT original 7x6 K4 physical 69-winline FIRST-WIN-
 // stopped game validator of one newly frozen temporal π Fourier
// derivative identity. Entire hypothetical 10-event suffix is
// enumerated ONLY as 5040 validation column interleavings from a
// genuine firstwin-free rank32 original board; the actual game
// terminates at earliest win, represented as monotone B_t / jump.
 // No WDL minimax, quantum hardware, other board dimensions/K.
import {sourceOriginal7x6FirstWinPiFourierImpulse}
 from './source-original7x6-firstwin-temporal-Fourier-impulse.mjs';
function originalWinLines(){
 const rows=[];
 for(let y=0;y<6;y++)for(let x=0;x<7;x++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(x+3*dx<0||x+3*dx>=7||y+3*dy<0||y+3*dy>=6)continue;
  rows.push([0,1,2,3].map(k=>(y+k*dy)*7+x+k*dx));
 }
 if(rows.length!==69)throw Error('true7x6 69 K4 lines must exist independently');
 const byCell=Array.from({length:42},()=>[]);
 rows.forEach((L,j)=>L.forEach(z=>byCell[z].push(j)));
 return {rows,byCell};
}
function actualPhysicalRoot32(G){
 const hist='12345612345665432165432112345612',
  h=Array(7).fill(0),owner=Array(42).fill(-1);
 if(hist.length!==32)throw Error('not genuine firstwin-free q32');
 for(let t=0;t<32;t++){
  const c=+hist[t]-1,p=t%2,r=h[c],z=r*7+c;
  if(r>=6)throw Error('root original geometry illegal gravity');
  h[c]++;owner[z]=p;
  if(G.byCell[z].some(j=>G.rows[j].every(id=>owner[id]===p)))
   throw Error('chosen true standard 7x6 root had already won');
 }
 return {hist,h,owner};
}
export function independentlyCheckOriginal7x6TemporalFourierFirstWin(){
 const G=originalWinLines(),q=actualPhysicalRoot32(G),
  N=10,errors=[],h=q.h.slice(),owner=q.owner.slice(),
  cumulative=Array(11).fill(0),histogram=Array(11).fill(0),
  BTotal=Array(11).fill(0),deltaTotal=Array(11).fill(0);
 let completeWords=0,FourierValueSum=0,F0ValueSum=0,
  directWinnerSum=0,discreteByPartsSum=0,
  physicalFirstWins={P0:0,P1:0,DRAW:0},
  endgameEarlyCounterfactualContinuations=0,
  invalidFourierImpulses=0,totalBinaryFourierChecks=0;
 const parityPhases=Array.from({length:N},(_,k)=>((32+k)%2?-1:1));
 function search(depth,seenWinner,actualFirstWinner){
  if(depth===N){
   completeWords++;
   let first=actualFirstWinner;
   if(first!==null){
    physicalFirstWins[first.owner===0?'P0':'P1']++;
    if(first.ply<42)endgameEarlyCounterfactualContinuations++;
   }else physicalFirstWins.DRAW++;
   const s=sourceOriginal7x6FirstWinPiFourierImpulse(cumulative.slice());
   FourierValueSum+=s.signedOriginalFirstWinFourierAmplitude;
   discreteByPartsSum+=s.signedOriginalFirstWinFromDiscreteIntegrationByParts;
   const actualDirect=first===null?0:first.owner===0?1:-1;
   directWinnerSum+=actualDirect;
   if(s.signedOriginalFirstWinFourierAmplitude!==actualDirect)
    errors.push({kind:'SOURCE_TEMPORAL_FOURIER_MISMATCH_ACTUAL_REAL_FIRSTWIN'});
   let numberOfNonzero=0,sumJump=0;
   for(let k=1;k<=N;k++){
    const delta=cumulative[k]-cumulative[k-1];
    if(delta!==0){histogram[k]++;numberOfNonzero++;sumJump+=delta;}
    BTotal[k]+=cumulative[k];
    deltaTotal[k]+=delta;
   }
   F0ValueSum+=sumJump;
   if(numberOfNonzero>1||numberOfNonzero!==(first===null?0:1))
    invalidFourierImpulses++;
   totalBinaryFourierChecks+=N;
   return;
  }
  for(let col=0;col<7;col++)if(h[col]<6){
   const row=h[col],cell=row*7+col,p=(32+depth)&1;
   h[col]++;owner[cell]=p;
   const newWinningLine=G.byCell[cell].some(j=>
    G.rows[j].every(z=>owner[z]===p));
   const updatedSeen=seenWinner||newWinningLine,
     first=actualFirstWinner??(newWinningLine?
      {owner:p,ply:33+depth,cell}:null);
   cumulative[depth+1]=updatedSeen?1:0;
   search(depth+1,updatedSeen,first);
   owner[cell]=-1;h[col]--;
  }
 }
 search(0,false,null);
 const expected={P0:1350,P1:564,DRAW:3126};
 if(completeWords!==5040||JSON.stringify(physicalFirstWins)!==JSON.stringify(expected)||
    FourierValueSum!==786||directWinnerSum!==786||
    discreteByPartsSum!==786||F0ValueSum!==1914||
    invalidFourierImpulses)
  errors.push({kind:'TRUE_ORIGINAL_5040_FIRSTWIN_FOURIER_TOTALS_BAD',
   completeWords,physicalFirstWins,FourierValueSum,directWinnerSum,
   discreteByPartsSum,F0ValueSum,invalidFourierImpulses});
 let byPartsAggregate=parityPhases.at(-1)*BTotal[N];
 for(let t=1;t<N;t++)byPartsAggregate+=2*parityPhases[t-1]*BTotal[t];
 if(byPartsAggregate!==FourierValueSum)
  errors.push('aggregate discrete integration-by-parts Fourier failed');
 const rankDistribution=Object.fromEntries(Array.from({length:10},(_,i)=>
  [String(33+i),histogram[i+1]]).filter(([_,count])=>count>0));
 return {status:errors.length?'ORIGINAL7X6_FIRSTWIN_TEMPORAL_FOURIER_FALSIFIED':
   'INDEPENDENT_ORIGINAL7X6_FIRSTWIN_TEMPORAL_PI_FOURIER_WAVE_PASS',
  originalGame:[7,6,4],trueOriginalRootPrefix:q.hist,
  independentlyGeneratedOriginalK4WinLines:G.rows.length,
  completeOriginalHypotheticalGravitySuffixesTested:completeWords,
  realOriginalFirstWinnerForEachSchedule:physicalFirstWins,
  earliestRealFirstWinAbsolutePlyDistribution:rankDistribution,
  truePhysicalTerminalEarlyStopSequences:endgameEarlyCounterfactualContinuations,
  absoluteInitialRank:32,
  expectedFutureRelativeP0P1ParityPhases:parityPhases,
  cumulativeOriginalAnyWinBooleanSumByRelativePly:BTotal,
  originalFirstWinImpulseCountByRelativePly:deltaTotal,
  exactlyOneOrZeroFirstWinImpulseChecks:totalBinaryFourierChecks,
  invalidPhysicalFirstWinJumpCount:invalidFourierImpulses,
  exactExpectedNaturalPiFourierSignedFirstWinNumerator:FourierValueSum,
  sameNumeratorFromActualPhysicalP0MinusP1FirstWinCounts:directWinnerSum,
  sameNumeratorFromEachIndividualSourceIntegrationByParts:discreteByPartsSum,
  sameNumeratorFromAggregateBooleanWaveIntegrationByParts:byPartsAggregate,
  normalizedWavePhaseOwnerContrastRational:'786/5040 = 131/840',
  noOriginalPerfectPlayGameValueComputed:true,
  uniformCompletedSchedulesNotAdaptivePolicies:true,
  noSourceGameStrategicFutureValueSearch:true,
  errors:errors.slice(0,10)};
}
