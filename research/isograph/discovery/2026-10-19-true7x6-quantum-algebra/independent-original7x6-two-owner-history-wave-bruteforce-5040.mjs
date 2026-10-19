// INDEPENDENT ORIGINAL 7x6 K4 physically owned cell checker for a
// genuine FIRST-WIN-FREE prefix of a 42-move real DRAW at ply32.
 // All 5040 original gravity-compatible 10-move full suffix WORDS
// are generated in VALIDATOR ONLY, with true alternating ownership;
// game FIRST-WIN termination is tracked and recorded SEPARATELY,
// while the hypothetical full-owner coloring is still completed solely
// for the mathematical wave model. This is NOT a minimax/WDL solver,
// and no nonstandard W/H/K test is run.
// Source forward compressed-column lattice and hypergeometric formulas
// have already been frozen before this independent checker.
import {sourceOriginal7x6TwoOwnerHistoryWaveOverlay}
 from './source-original7x6-two-owner-complete-gravity-wave-overlay.mjs';
function geometryPhysical(){
 const lines=[],W=7,H=6,dirs=[
  {name:'falling',dx:1,dy:-1},{name:'rising',dx:1,dy:1},
  {name:'vertical',dx:0,dy:1},{name:'horizontal',dx:1,dy:0}];
 for(let x=0;x<W;x++)for(let y=0;y<H;y++)for(const d of dirs){
  const X=x+3*d.dx,Y=y+3*d.dy;
  if(X<0||X>=W||Y<0||Y>=H)continue;
  const sites=[0,1,2,3].map(j=>(y+j*d.dy)*W+x+j*d.dx);
  lines.push({orientation:d.name,sites,key:sites.slice().sort((a,b)=>a-b).join(',')});
 }
 if(lines.length!==69)throw Error('independent 69 true physical K4 winlines not recovered');
 return lines;
}
function physicalOriginalFirstWinFreePrefix(history,geom){
 let h=Array(7).fill(0),owner=Array(42).fill(-1);
 for(let i=0;i<history.length;i++){
  const c=+history[i]-1,r=h[c],p=i%2;
  if(c<0||c>=7||r>=6)throw Error('independent real physical original prefix illegal');
  owner[r*7+c]=p;h[c]++;
  const winner=geom.some(L=>L.sites.every(id=>owner[id]===p));
  if(winner)throw Error('genuine original first-win-free prefix has early WIN');
 }
 return {h,owner};
}
function pauliDirectParityLine(owner,sites){
 const z=sites.map(i=>owner[i]===0?1:-1);
 const l0=sites.every(i=>owner[i]===0)?1:0,
   l1=sites.every(i=>owner[i]===1)?1:0;
 let odd=z.reduce((a,b)=>a+b,0);
 for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)
  for(let k=j+1;k<4;k++)odd+=z[i]*z[j]*z[k];
 let even=1+z.reduce((a,b)=>a*b,1);
 for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)even+=z[i]*z[j];
 return {ownerContrast:odd,ownerSum:even,
  actualOwnerContrast:l0-l1,actualOwnerSum:l0+l1};
}
function factorial(n){let s=1n;for(let k=2;k<=n;k++)s*=BigInt(k);return s}
export function independentOriginal7x6TwoOwnerPotentialityWaveCheck(){
 const source=sourceOriginal7x6TwoOwnerHistoryWaveOverlay(),
  geometry=geometryPhysical(),
  errors=[],
  fullDraw='123456123456654321654321123456123456777777',
  physicalPrefix=fullDraw.slice(0,32),
  initial=physicalOriginalFirstWinFreePrefix(physicalPrefix,geometry),
  originalH=initial.h.slice(),
  originalOwners=initial.owner.slice(),
  sourceLate=source.trueFirstWinFreePhysicalDrawPrefix32,
  bySource=new Map(sourceLate.exactTwoOwnerK4JointLineWave.map(L=>
   [L.originalPhysicalSites.slice().sort((a,b)=>a-b).join(','),L]));
 let remaining=initial.h.map(x=>6-x),
  expected=factorial(10)/remaining.reduce((a,n)=>a*factorial(n),1n);
 if(expected!==5040n||sourceLate.originalRemainingGravityEvents!==10)
  throw Error('independent actual original32 remaining word count must be5040');
 const owner=initial.owner.slice(),h=initial.h.slice(),winLines=geometry,
  lineCount0=Array(69).fill(0n),lineCount1=Array(69).fill(0n),
  cellCount0=Array(42).fill(0n),cellCount1=Array(42).fill(0n);
 let completed=0n,realFirstWinnerOnCounterfactualSchedules={P0:0,P1:0,DRAW:0},
  terminalFirstWinBeforeLast=0,nativeContrastChecks=0,sampleHistories=[];
 const stopWin=(site,p)=>winLines.find(L=>L.sites.includes(site)&&
   L.sites.every(j=>owner[j]===p));
 function recurse(depth,earliest){
  if(depth===10){
   completed++;
   if(!earliest)realFirstWinnerOnCounterfactualSchedules.DRAW++;
   else{
    realFirstWinnerOnCounterfactualSchedules[earliest.owner===0?'P0':'P1']++;
    if(earliest.ply<42)terminalFirstWinBeforeLast++;
   }
   // This is a hypothetical full postterminal coloring if earliest WIN.
   for(let i=0;i<42;i++){
    const p=owner[i];
    if(p===0)cellCount0[i]++;else if(p===1)cellCount1[i]++;
    else throw Error('independent original complete physical ownership missing');
   }
   for(let j=0;j<69;j++){
    const G=winLines[j],p=owner[G.sites[0]];
    if(G.sites.every(z=>owner[z]===p)){
     if(p===0)lineCount0[j]++;else lineCount1[j]++;
    }
    const c=pauliDirectParityLine(owner,G.sites);
    if(c.ownerContrast!==8*c.actualOwnerContrast||
       c.ownerSum!==8*c.actualOwnerSum)
      errors.push({type:'ODD_EVEN_PAULI_OWNER_WAVE_INTERFERENCE_IDENTITY',line:G.key});
    nativeContrastChecks++;
   }
   if(sampleHistories.length<4)sampleHistories.push({
    suffixOneBased:history.join(''),
    actualFirstWinner:earliest?.owner??null,
    actualFirstWinAbsolutePly:earliest?.ply??null});
   return;
  }
  for(let c=0;c<7;c++)if(h[c]<6){
   const row=h[c],site=row*7+c,p=(32+depth)%2;
   owner[site]=p;h[c]++;
   const first=earliest??(stopWin(site,p)?{owner:p,ply:33+depth}:null);
   history.push(c+1);
   recurse(depth+1,first);
   history.pop();h[c]--;owner[site]=-1;
  }
 }
 const history=[];
 recurse(0,null);
 if(completed!==expected)errors.push({type:'ALL_ORIGINAL_5040_GRAVITY_COMBINATIONS_NOT_REPLAYED',completed:String(completed)});
 let cellChecks=0,lineChecks=0;
 for(const L of winLines){
  const k=bySource.get(L.key);
  if(!k){errors.push({type:'SOURCE_LINE_MISSING_FROM_INDEPENDENT_GRID',L:L.key});continue}
  const den=BigInt(k.compressedUniformCompleteShuffleCount);
  const got0=BigInt(k.P0FullLineNumerator),
    got1=BigInt(k.P1FullLineNumerator);
  const i=winLines.indexOf(L);
  if(lineCount0[i]*den!==got0*completed||lineCount1[i]*den!==got1*completed)
   errors.push({type:'SOURCE_OWNER_LINE_JOINT_WAVE_DISTRIBUTION_DISAGREES_WITH_REAL_GRAVITY_SHUFFLE',
    line:L.key,expected0:lineCount0[i].toString(),expected1:lineCount1[i].toString(),
    source0:got0.toString(),source1:got1.toString(),den:den.toString()});
  lineChecks+=2;
 }
 const sourceSingles=sourceLate.oneBodyOwnerParityFourierWave;
 for(let i=0;i<42;i++){
  const s=sourceSingles[i],den=BigInt(s.denominator),
    p0=BigInt(s.P0Numerator),p1=BigInt(s.P1Numerator);
  if(cellCount0[i]*den!==p0*completed||
     cellCount1[i]*den!==p1*completed)
   errors.push({type:'SOURCE_SINGLE_OWNER_PHASE_WAVE_MARGINAL_MISMATCH',
    site:i,physicalP0:cellCount0[i].toString(),physicalP1:cellCount1[i].toString(),
    source:s});
  cellChecks+=2;
 }
 // Inspect source empty and canonical 44444 independently for
 // REQUIRED FORWARD-HISTORY distribution reversal/symmetry and
 // the P0/P1 two-layer line totals; source phase cannot be inferred
 // as physical actual first winner from this validator.
 const empty=source.emptyOriginalRoot,mid=source.trueFirstWinFree44444Prefix;
 if(empty.hypotheticalEmptyReverseJySwapSymmetryMismatches!==0||
    empty.originalJyIndividuallyFixedK4Lines!==7||
    empty.originalK4LineModesWithExactlyZeroOwnerSignedPotential!==15||
    mid.originalK4LineModesWithExactlyZeroOwnerSignedPotential!==3)
  errors.push({type:'SOURCE_GLOBAL_TIME_REVERSAL_OWNER_CANCELLATION_NOT_REPRODUCED'});
 const sumPhysicalLinePotentialByOwner={
  originalPotentialP0LineEvents:lineCount0.reduce((a,b)=>a+b,0n).toString(),
  originalPotentialP1LineEvents:lineCount1.reduce((a,b)=>a+b,0n).toString()
 };
 return {status:errors.length?'INDEPENDENT_TRUE7X6_TWO_OWNER_WAVE_INTERFERENCE_SOURCE_FAILED':
    'INDEPENDENT_TRUE7X6_TWO_OWNER_GRAVITY_WAVE_INTERFERENCE_PASS',
  originalBoard:[7,6,4],genuinePhysicalStartingHistory:physicalPrefix,
  originalRemainderHeightVector:remaining,
  independentCompleteHypotheticalOriginalGravitySuffixes:completed.toString(),
  genuineOriginalFirstWinStoppedReferenceDraw:fullDraw,
  originalPhysicalK4Winlines:geometry.length,
  exactIndependentFourBodyPlayerResolvedLineWavesChecked:lineChecks,
  exactIndependentOneBodySignedFourierMarginalsChecked:cellChecks,
  everyOriginalPauliOddEvenFourSiteOverlayCheck:nativeContrastChecks,
  independentRealFirstWinnerOnUniformHypotheticalCompleteSchedules:realFirstWinnerOnCounterfactualSchedules,
  hypotheticalFullSuffixesThatWouldTerminateEarlyUnderRealFirstWin:terminalFirstWinBeforeLast,
  independentOwnerLineWaveAccumulation:sumPhysicalLinePotentialByOwner,
  originalEmptyGlobalTimeReversalSevenCentralVerticalCancellationExpected:true,
  sourceEmptyZeroSignedLineWaveCount:empty.originalK4LineModesWithExactlyZeroOwnerSignedPotential,
  source44444ZeroSignedLineWaveCount:mid.originalK4LineModesWithExactlyZeroOwnerSignedPotential,
  sourceFutureStrategicGameWDLQueries:0,
  hypotheticalCompletionCountsAreNotPerfectPlayProbabilities:true,
  sampledOriginalCounterfactualSuffixes:sampleHistories,
  errors:errors.slice(0,10)};
}
