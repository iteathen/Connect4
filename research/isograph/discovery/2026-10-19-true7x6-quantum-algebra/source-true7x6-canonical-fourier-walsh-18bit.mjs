// SOURCE exact Walsh/Hadamard on CONDITIONAL 18 pair bits of real
// ORIGINAL 7x6 K4 source q after actual prefix 44444. Quantum-inspired
// finite-group harmonic analysis, NOT quantum speedup, future WDL,
// recursive game solving, or fully physical game-state enumeration.
// Pre-existing source frozen 12 signed residual P1 cubic clauses
// arise after 18 HYPOTHETICAL pairs/center quota and 12 prior vetoes.
import {sourceCanonical44444PauliMatchedCausalAndOneBody}
 from './source-canonical44444-Pauli-dual-veto-and-onebody-cover.mjs';
export function sourceTrue7x6Canonical18WalshAnalysis(){
 const src=sourceCanonical44444PauliMatchedCausalAndOneBody();
 const n=18,N=1<<n;
 const clauses=src.PauliUnmatchedOriginalP1Clauses.map(c=>{
  if(c.gaugeDegree!==3)throw Error('noncubic source canonical clause');
  return {originalMaskHex:c.originalMaskHex,
   must0:Number(BigInt(c.must0Hex)),must1:Number(BigInt(c.must1Hex)),
   sourceOwner:'P1',kind:'STATIC_POSSIBLE_WINLINE_COMPLETION'};
 });
 if(clauses.length!==12||src.originalDimensions.W!==7||
    src.originalDimensions.H!==6||src.originalDimensions.K!==4)
  throw Error('source true7x6 canonical 12 clause geometry guard');
 function value(x) {
  for(const c of clauses)if((x&c.must0)===0&&(x&c.must1)===c.must1)return 1;
  return 0;
 }
 const fft=new Int32Array(N),pop=new Uint8Array(N);
 let satisfying=0;
 for(let x=0;x<N;x++){
  const f=value(x);fft[x]=f;satisfying+=f;
  if(x)pop[x]=pop[x>>1]+(x&1);
 }
 // Exact unnormalized integer Walsh transform; coefficients are W(S)/2^18.
 for(let span=1;span<N;span*=2)
  for(let base=0;base<N;base+=2*span)
   for(let j=base;j<base+span;j++){
    const a=fft[j],b=fft[j+span];
    fft[j]=a+b;fft[j+span]=a-b;
   }
 const byDegreeNonzero=Array(n+1).fill(0),
  byDegreePowerNumerator=Array(n+1).fill(0),
  singletonUnnormalizedWalsh=Array(n).fill(0),
  oneBitSpectralInfluenceNumerator=Array(n).fill(0);
 let nonzeroCoefficients=0,maxDegree=0,WalshNumeratorL2=0;
 for(let mask=0;mask<N;mask++){
  const v=fft[mask],d=pop[mask],power=v*v;
  WalshNumeratorL2+=power;
  byDegreePowerNumerator[d]+=power;
  if(v){
   nonzeroCoefficients++;
   byDegreeNonzero[d]++;
   maxDegree=Math.max(d,maxDegree);
  }
  if(d===1)singletonUnnormalizedWalsh[Math.log2(mask)]=v;
  if(mask)for(let j=0;j<n;j++)if(mask&(1<<j))
   oneBitSpectralInfluenceNumerator[j]+=power*4;
 }
 // Reflection is column c -> 6-c on actual W7 outer physical cells,
 // NOT a cyclic Fourier XOR translation.
 const prior=sourceCanonical44444PauliMatchedCausalAndOneBody();
 const pairSource=
  // source pair IDs order c0,c1,c2,c4,c5,c6 and row0,2,4
  Array.from({length:18},(_,j)=>{
   const cols=[0,1,2,4,5,6],c=cols[Math.floor(j/3)],r=2*(j%3);
   return {id:j,c,r};
  });
 const byPhysical=new Map(pairSource.map(p=>[p.c+','+p.r,p.id]));
 const mirror=pairSource.map(p=>byPhysical.get((6-p.c)+','+p.r));
 if(mirror.some(x=>!Number.isInteger(x)))throw Error('bad original geometric reflection');
 function reflect(m){
  let result=0;
  for(let j=0;j<18;j++)if(m&(1<<j))result|=1<<mirror[j];
  return result;
 }
 const clauseSet=new Set(clauses.map(c=>c.must0+':'+c.must1));
 const reflectionPreserves12SignedClauses=clauses.every(c=>
  clauseSet.has(reflect(c.must0)+':'+reflect(c.must1)));
 const mirrorSingletonEqual=singletonUnnormalizedWalsh.every((x,j)=>
  x===singletonUnnormalizedWalsh[mirror[j]]);
 // Fourier translation invariants of f on GF2^18 are annihilator
 // vectors of all nonzero frequency supports. Nonzero singletons
 // yield rank18 immediately: no nonzero XOR period.
 const singletonNonzeroCount=singletonUnnormalizedWalsh.filter(x=>x!==0).length;
 const translationPeriodSpaceDimensionUpperBound=n-singletonNonzeroCount;
 const totalNonconstantPower=byDegreePowerNumerator.slice(1).reduce((a,b)=>a+b,0);
 const firstKPercent=(k)=>byDegreePowerNumerator.slice(1,k+1).reduce((a,b)=>a+b,0)/
   totalNonconstantPower;
 const sourceReflectionOrbitCount=(N+(1<<9))/2; // 9 mirrored pairs of bits
 return {
  status:'SOURCE_TRUE7X6_CANONICAL12CLAUSE_EXACT_18BIT_WALSH',
  board:{W:7,H:6,K:4,canonicalHistory:'44444',originalR0:48,originalR1:42},
  scope:'STATIC HYPOTHETICAL 18-PAIR OWNER GAUGE, NOT ACTUAL GAME STRATEGIES',
  formula:'f(x)=OR of 12 signed P1 cubic original-requirement clauses',
  numPauliPairVariables:n,totalStaticPairAssignments:N,sourceSignedCubicClauses:clauses.length,
  sourceSatisfyingStaticGaugeColorings:satisfying,
  sourceWalshCoefficientsNonzero:nonzeroCoefficients,
  maxExactWalshDegree:maxDegree,
  byDegreeNonzero:byDegreeNonzero,
  byDegreeWalshSquaredNumeratorPower:byDegreePowerNumerator,
  WalshUnnormalizedS0:fft[0],
  exactParsevalNumeratorEnergy:WalshNumeratorL2,
  exactParsevalExpected:N*satisfying,
  singletonUnnormalizedWalsh:singletonUnnormalizedWalsh,
  oneBitSpectralInfluenceNumerator:oneBitSpectralInfluenceNumerator,
  oneBitSpectralInfluenceDenominator:N*N,
  nonconstantSpectralEnergyThroughDegree3:firstKPercent(3),
  nonconstantSpectralEnergyThroughDegree6:firstKPercent(6),
  allSingletonWalshNonzero:singletonNonzeroCount===18,
  XORHiddenTranslationPeriodDimensionUpperBound:translationPeriodSpaceDimensionUpperBound,
  XORHiddenTranslationPeriodTrivialProved:singletonNonzeroCount===18,
  physicalColumnReflectionOn18PairVariables:mirror,
  reflectionPreserves12SignedClauses,
  reflectionPreservesSingletonWalsh:mirrorSingletonEqual,
  staticGaugeColoringOrbitsUnderOriginalColumnReflection:sourceReflectionOrbitCount,
  includedOriginalSignedCubicRequirements:clauses.map(c=>({
   originalPhysicalMaskHex:c.originalMaskHex,
   pairMustLowerOwnerP0Hex:'0x'+c.must0.toString(16),
   pairMustLowerOwnerP1Hex:'0x'+c.must1.toString(16)})),
  sourceGameFutureWDLValuesComputed:0,
  sourceOriginalGamePolicyAlternativesEnumerated:0,
  sourceDiscreteFourierAlgorithm:'INTEGER_WALSH_HADAMARD_2pow18',
  originalFirstWinGameWDL:null,
  sourceNoNewWDLOrBestMove:true
 };
}
