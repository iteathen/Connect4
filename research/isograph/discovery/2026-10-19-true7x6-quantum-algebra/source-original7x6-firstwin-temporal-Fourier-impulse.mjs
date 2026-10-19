// SOURCE PURE mathematical operator on original W7H6K4 finite time
// winner-existence Boolean indicators B_t of a hypothetical full
// gravity-compatible event word from an ACTUAL firstwin-free q.
 // B_t is MONOTONE when ordinary play is hypothetically continued
// past its FIRST WIN; actual game stops on the single nonzero
// f_t=B_t-B_{t-1}. π-Fourier of f yields P0(+1)/P1(-1)/DRAW(0).
// Does NOT construct B_t, search for a game future or WDL oracle.
// See docs/research/2026-10-19-standard7x6-first-win-temporal-Fourier-derivative-owner-interference-identity.md
export function sourceOriginal7x6FirstWinPiFourierImpulse(cumulativeWinnerBoolean){
 const N=10,initialAbsolutePly=32; // true W7H6K4 rank32
 if(!Array.isArray(cumulativeWinnerBoolean)||
    cumulativeWinnerBoolean.length!==N+1||
    cumulativeWinnerBoolean[0]!==0||
    cumulativeWinnerBoolean.some(x=>x!==0&&x!==1))
  throw Error('requires original true rank32 10-step monotone winner-existence indicator B0..B10');
 const f=Array(N).fill(0),epsilon=Array(N).fill(0),pulse=[];
 let signWave=0,viaTimeIntegral=0;
 for(let t=1;t<=N;t++){
  const prev=cumulativeWinnerBoolean[t-1],
    curr=cumulativeWinnerBoolean[t];
  if(curr<prev)throw Error('once original K4 winner exists, cannot disappear from hypothetical immutable ownership coloring');
  f[t-1]=curr-prev;
  const signed=(initialAbsolutePly+t-1)%2?-1:1;
  epsilon[t-1]=signed;
  signWave+=signed*f[t-1];
  if(f[t-1])pulse.push(t);
 }
 let byParts=epsilon[N-1]*cumulativeWinnerBoolean[N];
 for(let t=1;t<N;t++)
  byParts+=2*epsilon[t-1]*cumulativeWinnerBoolean[t];
 if(pulse.length>1||signWave!==byParts||
    ![-1,0,1].includes(signWave))
  throw Error('exact original firstwin Fourier impulse algebra violated');
 return {
  status:'SOURCE_TRUE7X6_RANK32_ORIGINAL_FIRSTWIN_PI_FOURIER_IDENTITY',
  actualOriginalBoard:[7,6,4],
  actualKnownFirstWinFreeStartingAbsolutePly:initialAbsolutePly,
  hypotheticalFullOriginalGravityFutureSteps:N,
  monotoneAnyOriginalK4AlreadyWon:cumulativeWinnerBoolean.slice(),
  exactTemporalFirstWinImpulse:f,
  exactNaturalAlternationPiPhases:epsilon,
  signedOriginalFirstWinFourierAmplitude:signWave,
  signedOriginalFirstWinFromDiscreteIntegrationByParts:byParts,
  playerAtActualOriginalFirstWin:signWave===1?'P0':signWave===-1?'P1':'DRAW',
  sourceDoesNotFindOrOptimizeFirstWinTiming:true,
  sourceGameStrategicFutureStatesValued:0,
  physicalFirstWinTerminationIsSeparateOriginalGameRule:true
 };
}
