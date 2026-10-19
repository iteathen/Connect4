// INDEPENDENT ORIGINAL W7 H6 K4 physical 69-winline hypergraph
// verifier for source broad Fourier/hidden subgroup/representation
// theorem. No game tree, no minimax, no other board dimensions/K,
// and no values read from an outcome oracle.
import {sourceTrue7x6BroadFourierKernelReflection}
 from './source-true7x6-wide-Shor-incidence-kernel-and-reflection.mjs';
function geometry(){
 const WIN=4,rows=6,cols=7,directions=[
  {dir:'falling',dx:1,dy:-1},
  {dir:'rising',dx:1,dy:1},
  {dir:'horizontal',dx:1,dy:0},
  {dir:'vertical',dx:0,dy:1}];
 const masks=[],triples=[];
 for(let x=0;x<cols;x++)for(let y=0;y<rows;y++)
  for(const v of directions){
   const xx=x+(WIN-1)*v.dx,yy=y+(WIN-1)*v.dy;
   if(xx<0||xx>=cols||yy<0||yy>=rows)continue;
   const sites=[],ones=[];
   for(let i=0;i<WIN;i++){
    const z=(y+i*v.dy)*cols+x+i*v.dx;
    sites.push(z);ones.push(1n<<BigInt(z));
   }
   masks.push(ones.reduce((a,b)=>a|b,0n));
   triples.push({direction:v.dir,sites});
  }
 if(masks.length!==69)throw Error('independent original lines not 69');
 return {masks,triples};
}
function gf2KernelFromPureOriginalLines(masks){
 const n=42,eq=masks.slice(),pivot=[],N=eq.length;
 let rank=0;
 for(let col=n-1;col>=0;col--){
  const bit=1n<<BigInt(col);
  let t=rank;
  while(t<N&&(eq[t]&bit)===0n)t++;
  if(t>=N)continue;
  [eq[t],eq[rank]]=[eq[rank],eq[t]];
  for(let k=0;k<N;k++)
   if(k!==rank&&(eq[k]&bit)!==0n)eq[k]^=eq[rank];
  pivot.push(col);
  rank++;
 }
 const free=Array.from({length:n},(_,j)=>j).filter(j=>!pivot.includes(j)),B=[];
 for(const j of free){
  let mask=1n<<BigInt(j);
  for(let i=0;i<pivot.length;i++)
   if(eq[i]&(1n<<BigInt(j)))mask|=1n<<BigInt(pivot[i]);
  B.push(mask);
 }
 const elements=[];
 for(let x=0;x<(1<<B.length);x++){
  let m=0n;
  for(let j=0;j<B.length;j++)if(x&(1<<j))m^=B[j];
  elements.push(m);
 }
 return {rank,basis:B,elements};
}
function modRank(m,field=103){
 const M=m.map(r=>r.map(v=>(v%field+field)%field));
 let rank=0;
 const invert=a=>{
  let x=1,z=field-2;
  while(z){if(z&1)x=x*a%field;a=a*a%field;z>>=1}
  return x;
 };
 for(let j=0;j<M[0].length;j++){
  let r=rank;while(r<M.length&&M[r][j]===0)r++;
  if(r===M.length)continue;
  [M[r],M[rank]]=[M[rank],M[r]];
  const inv=invert(M[rank][j]);
  for(let k=j;k<M[rank].length;k++)M[rank][k]=M[rank][k]*inv%field;
  for(let t=rank+1;t<M.length;t++)if(M[t][j]){
   const f=M[t][j];
   for(let k=j;k<M[t].length;k++)M[t][k]=(M[t][k]-f*M[rank][k]+field*field)%field;
  }
  rank++;
 }
 return rank;
}
function directOriginalMove(history){
 const h=Array(7).fill(0),occupied=Array(42).fill(-1),lines=geometry().triples;
 for(let t=0;t<history.length;t++){
  const c=+history[t]-1,p=t%2;
  if(!Number.isInteger(c)||c<0||c>=7||h[c]>=6)
   throw Error('incorrect original gravity history');
  const r=h[c]++,z=r*7+c;occupied[z]=p;
  if(lines.some(L=>L.sites.every(i=>occupied[i]===p)))
   throw Error('actual short history has first winner unexpectedly');
 }
 return {h,occupied};
}
export function independentOriginal7x6BroadHiddenSubgroup(){
 const src=sourceTrue7x6BroadFourierKernelReflection(),G=geometry(),
  errors=[],A=G.triples.map(L=>Array.from({length:42},(_,i)=>L.sites.includes(i)?1:0)),
  keys=G.masks.map(x=>x.toString(16)).sort(),
  sourceKeys=src.originalLineMasksHex.map(x=>BigInt(x).toString(16)).sort();
 if(JSON.stringify(keys)!==JSON.stringify(sourceKeys))
  errors.push('source and independent genuine original 69 lines disagree');
 const B=gf2KernelFromPureOriginalLines(G.masks),pop=v=>{
  let count=0;for(let t=v;t;t&=t-1n)count++;return count;
 };
 if(B.rank!==35||B.basis.length!==7||B.elements.length!==128||
   src.exactGF2WindowParityMap.rank!==35)
  errors.push('seven-dimension GF2 hidden original K4 kernel not found');
 let parityTests=0,universalMonoInvariants=0,nonuniformViolatingTranslation=null;
 for(const t of B.elements){
  const lineParityChanged=G.masks.some(L=>pop(L&t)%2!==0);
  if(lineParityChanged)errors.push('claimed period breaks independent physical parity line sum');
  parityTests+=G.masks.length;
  // A universal XOR symmetry of line completion must toggle either
  // all four or none of each original physical winning line.
  const preservesAllMonochromeLines=G.masks.every(L=>{
   const i=pop(t&L);return i===0||i===4;
  });
  if(preservesAllMonochromeLines)universalMonoInvariants++;
  else if(nonuniformViolatingTranslation===null)
   nonuniformViolatingTranslation=t;
 }
 const allBits=(1n<<42n)-1n;
 if(universalMonoInvariants!==2||!B.elements.includes(0n)||
    !B.elements.includes(allBits))
  errors.push('universal mono-line XOR transformations not only identity/global flip');
 // Identify earliest low-weight proper hidden period directly from
 // physical original windows; source minimal is frozen independently.
 const weights=B.elements.filter(x=>x!==0n&&x!==allBits).map(x=>({
  mask:x,weight:pop(x)})).sort((a,b)=>a.weight-b.weight||
  (a.mask<b.mask?-1:a.mask>b.mask?1:0));
 const minimumProper=weights[0];
 if(minimumProper.weight!==9||minimumProper.mask!==BigInt(src.exactGF2WindowParityMap.nonGlobalExample))
  errors.push('smallest original 7x6 hidden parity kernel shift discrepancy');
 // Construct EXACT independent balanced BINARY complete physical-color
 // fields with identical 69 sum-count measurements, from candidate
 // integer kernel v2 with support +/-1 and sum0. Not legal plays.
 const V=src.exactRationalFourWindowSumMap.exactFourIntegerNullVectors;
 let integerWitnessChecks=0;
 for(const v of V){
  for(const win of G.triples){
   const sum=win.sites.reduce((a,i)=>a+v[i],0);
   integerWitnessChecks++;
   if(sum!==0)errors.push('integer real window zero mode not zero on original physical line');
  }
 }
 const lowerRank=modRank(A,103),
  fourKernalRank=modRank(Array.from({length:42},(_,i)=>V.map(v=>v[i])),103);
 if(lowerRank!==38||fourKernalRank!==4)
  errors.push('independent real/rational rank witness failed');
 const vector=V.find(v=>v.reduce((a,b)=>a+b,0)===0);
 if(!vector)throw Error('no quota-preserving integer kernel candidate available');
 const positives=vector.map((v,i)=>v===1?i:-1).filter(i=>i>=0),
  negatives=vector.map((v,i)=>v===-1?i:-1).filter(i=>i>=0),
  zero=vector.map((v,i)=>v===0?i:-1).filter(i=>i>=0);
 const x=Array(42).fill(0);
 for(const j of negatives)x[j]=1;
 const need=21-negatives.length;
 for(let i=0;i<need;i++)x[zero[i]]=1;
 const y=x.map((val,i)=>val+vector[i]);
 const balanced=x.reduce((a,b)=>a+b,0)===21&&
  y.reduce((a,b)=>a+b,0)===21&&y.every(v=>v===0||v===1);
 const staticEqualEveryLine=G.triples.every(L=>
  L.sites.reduce((a,i)=>a+x[i],0)===
   L.sites.reduce((a,i)=>a+y[i],0));
 if(!balanced||!staticEqualEveryLine||x.every((v,i)=>v===y[i]))
  errors.push('independent balanced binary line-sum kernel witness absent');
 // Independent FOUR character reflection blocks: no imported
 // source line permutation. Jx genuine column reflection, Jy
 // static-only vertical inversion. Infer fixed original lines
 // by physical site-set comparison.
 const rx=id=>Math.floor(id/7)*7+(6-id%7);
 const ry=id=>(5-Math.floor(id/7))*7+(id%7);
 const dict=new Map(G.triples.map((L,i)=>[L.sites.slice().sort((a,b)=>a-b).join(','),i]));
 function perm(f){
  return G.triples.map(L=>{
   const key=L.sites.map(f).sort((a,b)=>a-b).join(',');
   if(!dict.has(key))throw Error('original static reflection not actual window automorphism');
   return dict.get(key);
  });
 }
 const Jx=perm(rx),Jy=perm(ry),Jxy=Jx.map(i=>Jy[i]);
 const fixed={Jx:Jx.filter((v,i)=>v===i).length,
  Jy:Jy.filter((v,i)=>v===i).length,
  JxJy:Jxy.filter((v,i)=>v===i).length};
 if(fixed.Jx!==3||fixed.Jy!==7||fixed.JxJy!==1)
  errors.push('independent 69 K4 fixed reflection line counts incorrect');
 let firstC2ParityBlocks=[];
 for(const sx of [1,-1])for(const sy of [1,-1]){
  const proj=G.triples.map(L=>Array.from({length:42},(_,i)=>{
   const sites=L.sites,has=id=>sites.includes(id)?1:0;
   return has(i)+sx*has(rx(i))+sy*has(ry(i))+sx*sy*has(rx(ry(i)));
  }));
  const rank=modRank(proj,103),
    ins=(42+sx*6)/4,
    input=(42+sx*6+sy*0+sx*sy*0)/4,
    output=(69+sx*fixed.Jx+sy*fixed.Jy+sx*sy*fixed.JxJy)/4;
  firstC2ParityBlocks.push({sx,sy,input,output,rank,nullity:input-rank});
 }
 const sumRank=firstC2ParityBlocks.reduce((a,b)=>a+b.rank,0);
 if(sumRank!==38||JSON.stringify(firstC2ParityBlocks.map(x=>x.rank))!==
   JSON.stringify([11,10,9,8]))
  errors.push('independent static group Fourier rank block decomposition mismatch');
 // Show ordinary gravity is Jx preserving, Jy NOT preserving on the
 // physical original one-move prefix, despite being static winline iso.
 const q=directOriginalMove('4'),mappedTop=ry(3);
 const topRow=Math.floor(mappedTop/7);
 const verticalReflectionOfSingleBottomStoneHasUnsupportedTop=topRow===5&&
   q.occupied[3]===0&&q.occupied[mappedTop]===-1;
 const horizontalHistory=directOriginalMove('444441');
 const horizontallyReflectedHistory=directOriginalMove('444447');
 if(!verticalReflectionOfSingleBottomStoneHasUnsupportedTop||
    horizontallyReflectedHistory.h[6]!==1||horizontalHistory.h[0]!==1)
  errors.push('original gravity Jx equivariance and Jy non-equivalence witness incorrect');
 return {status:errors.length?'INDEPENDENT_ORIGINAL7X6_HIDDEN_FOURIER_SYMMETRY_FAILED':
   'INDEPENDENT_TRUE7X6_BROAD_SHOR_GEO_KERNEL_SYMMETRIES_PASS',
  board:[7,6,4],originalWindows:G.triples.length,
  exactOriginalGF2WindowParityRank:B.rank,exactXORPeriodGroupSize:B.elements.length,
  parityOriginalWindowChecks:parityTests,
  GF2KernelUniversalMonochromaticWinLinePermutations:universalMonoInvariants,
  minimumNontrivialNonGlobalGF2PeriodWeight:minimumProper.weight,
  exampleNontrivialPeriod:'0x'+minimumProper.mask.toString(16),
  nonuniformPeriodBreakingActualMonochromeLine:true,
  rationalOriginalWindowMapLowerBoundMod103:lowerRank,
  rationalExactKernelDimensionFromIndependent4Witnesses:fourKernalRank,
  originalIntegerZeroModeWindowSumsChecked:integerWitnessChecks,
  twoDistinctBalancedPhysicalColoringsWithIDENTICALAll69LineCounts:balanced&&staticEqualEveryLine,
  balancedBinaryStaticWitnessP0StoneCountEach:21,
  coloredSiteDifferenceCount:x.filter((v,i)=>v!==y[i]).length,
  staticWitnessesNotClaimedGravityLegalGame:true,
  independentlyFixedReflectionWindows:fixed,
  staticC2xC2CharacterRanks:firstC2ParityBlocks,
  leftRightOriginalGameplayGravityPreserved:true,
  topBottomStaticGeometryOnlyNotActualGravity:true,
  physicalGameWDLOrBestProved:null,
  sourceOrValidatorStrategicFutureGameStatesValued:0,
  errors:errors.slice(0,12)};
}
