// ORIGINAL W7 H6 K4 ONLY. Exact TWO-owner wave potentiality over
// hypothetical COMPLETE GRAVITY-CHAIN SHUFFLES, not perfect-play
// paths or strategic future-game value search. A genuine nonterminal
// empty or canonical 44444 starting prefix is original first-win-free;
// for mathematical full-coloring gravity-shuffle measure, FIRST-WIN
// stopping is SUSPENDED AFTER THAT PREFIX. Count using one-body
// negative-hypergeometric Fourier characteristic function and <=4
// marked columns + one aggregate filler-shuffle lattice for every
// original physical K4 line. P0/P1 overlay exposes exact parity-wave
// cancellation and four-cell joint ownership, not independent marginals.
// Theory pre-frozen at:
// docs/research/2026-10-19-original7x6-two-owner-history-wavefunctions-overlaid-cancellation-and-firstwin-boundary.md
export function sourceOriginal7x6TwoOwnerHistoryWaveOverlay(){
 const W=7,H=6,K=4,nCells=W*H,index=(c,r)=>r*W+c,bit=i=>1n<<BigInt(i);
 const D=[{name:'horizontal',dc:1,dr:0},{name:'vertical',dc:0,dr:1},
  {name:'rising',dc:1,dr:1},{name:'falling',dc:1,dr:-1}];
 const lines=[];
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const d of D){
  const cx=c+3*d.dc,ry=r+3*d.dr;
  if(cx<0||cx>=W||ry<0||ry>=H)continue;
  lines.push({name:d.name,start:[c,r],
   cells:[0,1,2,3].map(k=>index(c+k*d.dc,r+k*d.dr))});
 }
 if(lines.length!==69)throw Error('not original TRUE 69 K4 winlines');
 function choose(n,k){
  if(k<0||k>n)return 0n;
  k=Math.min(k,n-k);let x=1n;
  for(let j=1;j<=k;j++)x=x*BigInt(n-k+j)/BigInt(j);
  return x;
 }
 function factorial(n){let x=1n;for(let j=2;j<=n;j++)x*=BigInt(j);return x}
 function stateFromOriginalHistory(oneBasedWord){
  const owner=Array(nCells).fill(-1),h=Array(W).fill(0);
  for(let t=0;t<oneBasedWord.length;t++){
   const c=Number(oneBasedWord[t])-1,p=t&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)
    throw Error('not original first-win-free gravity history');
   const id=index(c,h[c]++);
   if(owner[id]!==-1)throw Error('original physical cell already owned');
   owner[id]=p;
   if(lines.some(L=>L.cells.includes(id)&&L.cells.every(z=>owner[z]===p)))
    throw Error('input canonical original source prefix already has a FIRST WIN');
  }
  return {word:oneBasedWord,h,owner,ply:oneBasedWord.length,
   unfilledCells:nCells-oneBasedWord.length};
 }
 function marginal(site,q){
  const c=site%W,r=Math.floor(site/W);
  if(q.owner[site]!==-1)
   return {site,status:'FIXED_IN_GENUINE_PREFIX',
    fixedOwner:q.owner[site],P0Numerator:q.owner[site]===0?'1':'0',
    P1Numerator:q.owner[site]===1?'1':'0',denominator:'1',
    signedParityFourierNumerator:q.owner[site]===0?'1':'-1'};
  const m=H-q.h[c],k=r-q.h[c],N=q.unfilledCells;
  if(k<0||k>=m)throw Error('future physical cell local chain rank invalid');
  const den=choose(N,m);
  let numerator=0n;
  for(let t=k;t<=N-m+k;t++){
   const ways=choose(t,k)*choose(N-t-1,m-k-1);
   numerator+=((q.ply+t)&1)?-ways:ways;
  }
  const p0=(den+numerator)/2n,p1=(den-numerator)/2n;
  if(p0+p1!==den||p0<0n||p1<0n||((den+numerator)&1n))
   throw Error('source exact marginal Fourier parity numerator invalid');
  return {site,status:'HYPOTHETICAL_COMPLETE_GRAVITY_SHUFFLE_MARGINAL',
   localColumnChainRank:k,remainingN:N,remainingColumnEvents:m,
   signedParityFourierNumerator:numerator.toString(),
   P0Numerator:p0.toString(),P1Numerator:p1.toString(),
   denominator:den.toString()};
 }
 // Count all ORIGINAL full gravity interleavings of other columns via
 // equal-multiplicity filler symbol. This evaluates STATIC/cooperative
 // full-coloring POTENTIAL, not a first-win-stopped game or minimax.
 function lineOwnerCounts(line,q){
  const known=line.cells.filter(z=>q.owner[z]!==-1);
  const targets=line.cells.filter(z=>q.owner[z]===-1);
  const unique=[...new Set(targets.map(z=>z%W))].sort((a,b)=>a-b);
  if(unique.length>4)throw Error('more than four original K4 designated columns');
  const m=unique.map(c=>H-q.h[c]);
  const filler=q.unfilledCells-m.reduce((a,b)=>a+b,0);
  if(filler<0)throw Error('negative source filler');
  const bounds=m.concat([filler]);
  const strides=bounds.map((_,i)=>i?bounds.slice(0,i).reduce((a,b)=>a*(b+1),1):1);
  const states=bounds.reduce((a,b)=>a*(b+1),1);
  // explicit source computation envelope per original 7x6 K4 line.
  if(states>100000)throw Error('source mathematical shuffled-column lattice budget');
  const needed=unique.map(c=>
   targets.filter(z=>z%W===c).map(z=>Math.floor(z/W)-q.h[c]));
  const dp0=Array(states).fill(0n),dp1=Array(states).fill(0n);
  dp0[0]=known.every(z=>q.owner[z]===0)?1n:0n;
  dp1[0]=known.every(z=>q.owner[z]===1)?1n:0n;
  const last=states-1;
  for(let state=0;state<states;state++){
   const a=dp0[state],b=dp1[state];
   if(a===0n&&b===0n)continue;
   let t=0;const coords=bounds.map((bound,i)=>{
    const v=Math.floor(state/strides[i])%(bound+1);
    t+=v;return v;
   });
   const currentPlayer=(q.ply+t)&1;
   for(let j=0;j<bounds.length;j++){
    if(coords[j]>=bounds[j])continue;
    const next=state+strides[j],
      isTarget=j<m.length&&needed[j].includes(coords[j]);
    if(a!==0n&&(!isTarget||currentPlayer===0))dp0[next]+=a;
    if(b!==0n&&(!isTarget||currentPlayer===1))dp1[next]+=b;
   }
  }
  const den=factorial(q.unfilledCells)/bounds.reduce((a,b)=>a*factorial(b),1n);
  const p0=dp0[last],p1=dp1[last];
  if(p0>den||p1>den||p0<0n||p1<0n||p0+p1>den)
   throw Error('illegal true W7 line-owner potentiality path count');
  return {originalPhysicalSites:line.cells,orientation:line.name,
   sourceGravityCompressedSequenceStates:states,
   distinguishedPhysicalColumns:unique.length,
   compressedUniformCompleteShuffleCount:den.toString(),
   P0FullLineNumerator:p0.toString(),P1FullLineNumerator:p1.toString(),
   signedP0MinusP1Numerator:(p0-p1).toString(),
   mixedOwnerLineNumerator:(den-p0-p1).toString(),
   absoluteLinePotentialP0:Number(p0)/Number(den),
   absoluteLinePotentialP1:Number(p1)/Number(den),
   signedLineContrast:Number(p0-p1)/Number(den),
   totalMonochromaticLinePotential:Number(p0+p1)/Number(den)};
 }
 function sample(q){
  const singles=Array.from({length:nCells},(_,i)=>marginal(i,q));
  const ownerLineWaves=lines.map(L=>lineOwnerCounts(L,q));
  let exactUnderJy=0,failedJy=0,fixedByJy=0,
   exactUnderJx=0,failedJx=0,zeroSigned=0;
  const idline=arr=>arr.slice().sort((a,b)=>a-b).join(',');
  const lookup=new Map(ownerLineWaves.map((a,i)=>[idline(a.originalPhysicalSites),i]));
  const rx=z=>Math.floor(z/W)*W+(W-1-z%W);
  const ry=z=>(H-1-Math.floor(z/W))*W+(z%W);
  const jxPreserved=q.h.every((v,c)=>v===q.h[W-1-c])&&
    q.owner.every((v,z)=>v===q.owner[rx(z)]);
  const jyOwnerSwapTheoremApplies=q.ply===0;
  for(const a of ownerLineWaves){
   if(BigInt(a.signedP0MinusP1Numerator)===0n)zeroSigned++;
   const horiz=ownerLineWaves[lookup.get(idline(a.originalPhysicalSites.map(rx)))];
   const vert=ownerLineWaves[lookup.get(idline(a.originalPhysicalSites.map(ry)))];
   if(!horiz||!vert)throw Error('original 69 K4 line missing reflection partner');
   if(jxPreserved){
    exactUnderJx++;
    const denA=BigInt(a.compressedUniformCompleteShuffleCount),
      denB=BigInt(horiz.compressedUniformCompleteShuffleCount);
    if(BigInt(a.P0FullLineNumerator)*denB!==BigInt(horiz.P0FullLineNumerator)*denA||
       BigInt(a.P1FullLineNumerator)*denB!==BigInt(horiz.P1FullLineNumerator)*denA)
      failedJx++;
   }
   if(jyOwnerSwapTheoremApplies){
    exactUnderJy++;
    const denA=BigInt(a.compressedUniformCompleteShuffleCount),
      denB=BigInt(vert.compressedUniformCompleteShuffleCount);
    if(BigInt(a.P0FullLineNumerator)*denB!==BigInt(vert.P1FullLineNumerator)*denA||
       BigInt(a.P1FullLineNumerator)*denB!==BigInt(vert.P0FullLineNumerator)*denA)
      failedJy++;
    if(idline(a.originalPhysicalSites)===idline(vert.originalPhysicalSites))
     fixedByJy++;
   }
  }
  const byOrientation=Object.fromEntries(D.map(d=>{
   const arr=ownerLineWaves.filter(x=>x.orientation===d.name);
   return [d.name,{originalK4Lines:arr.length,
    exactlyCanceledP0MinusP1LineModes:arr.filter(v=>BigInt(v.signedP0MinusP1Numerator)===0n).length,
    meanP0LinePotential:arr.reduce((a,b)=>a+b.absoluteLinePotentialP0,0)/arr.length,
    meanP1LinePotential:arr.reduce((a,b)=>a+b.absoluteLinePotentialP1,0)/arr.length,
    meanSignedContrast:arr.reduce((a,b)=>a+b.signedLineContrast,0)/arr.length}];
  }));
  return {
   genuineOriginalPrefix:q.word,
   sourceRootAtPrefixFirstWinFree:true,
   originalRemainingGravityEvents:q.unfilledCells,
   completeHypotheticalShuffleModelFirstWinStopSuspended:true,
   oneBodyOwnerParityFourierWave:singles,
   exactTwoOwnerK4JointLineWave:ownerLineWaves,
   orientedWaveSummary:byOrientation,
   physicalJxSameOwnerLineReflectionPairsChecked:exactUnderJx,
   physicalJxWaveSymmetryMismatches:failedJx,
   hypotheticalEmptyReverseJySwapSymmetryPairsChecked:exactUnderJy,
   hypotheticalEmptyReverseJySwapSymmetryMismatches:failedJy,
   originalJyIndividuallyFixedK4Lines:fixedByJy,
   originalK4LineModesWithExactlyZeroOwnerSignedPotential:zeroSigned,
   noOriginalGameWDLOrOptimalActionProved:true
  };
 }
 const empty=sample(stateFromOriginalHistory(''));
 const canonical=sample(stateFromOriginalHistory('44444'));
 if(empty.hypotheticalEmptyReverseJySwapSymmetryMismatches||
   empty.physicalJxWaveSymmetryMismatches||
   canonical.physicalJxWaveSymmetryMismatches||
   empty.originalJyIndividuallyFixedK4Lines!==7)
  throw Error('source actual 7x6 Fourier owner wave gravity symmetry algebra failed');
 return {status:'SOURCE_STANDARD7X6_TWO_OWNER_GRAVITY_SHUFFLE_WAVE_OVERLAY',
  originalGame:[7,6,4],strictFirstWinStoppedTrueForInputPrefixes:true,
  hypotheticalFutureStopRuleSuspendedInCounting:true,
  ownerInterferenceDefinition:'P0/P1 four-cell joint line potentials; signed natural turn-parity Fourier contrast, not measured quantum destructive wave interference',
  perSiteTemporalWave:'negative hypergeometric exact parity characteristic function',
  fourBodyPauliOwnerProjectorDifference:'P0_K4 - P1_K4=(sum of four Z_e + sum of four triple Z_eZ_fZ_g)/8',
  fourBodyPauliOwnerProjectorSum:'P0_K4 + P1_K4=(1+sum of six pairs Z_eZ_f+product of four Z_e)/8',
  originalGeometricK4Lines:lines.length,
  emptyOriginalRoot:empty,
  trueFirstWinFree44444Prefix:canonical,
  sourceStrategicGameValueQueries:0,sourceMinimaxFutureBranching:0,
  actualFutureLegalFirstWinFilteringComputed:false,
  sourceQuantumHardwareInterferenceClaimed:false
 };
}
