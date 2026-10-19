// INDEPENDENT TRUE standard W7 H6 K4 original physical 69-line
// reconstruction for conditional 18-variable canonical44444 Walsh
// function. All 2^18 assignments are STATIC hypothetical P0/P1 owners,
// NOT original legal first-win-stopped game histories or strategic trees.
// Produces direct original-cell truth, independent XOR/bit-flip influences,
// physical reflection and an independently computed integer Walsh spectrum.
// Frozen SOURCE original 12 clause producer before this validator.
import {sourceTrue7x6Canonical18WalshAnalysis}
 from './source-true7x6-canonical-fourier-walsh-18bit.mjs';
function originalCanonicalPhysicalModel(){
 const W=7,H=6,K=4,dir=[[1,0],[0,1],[1,1],[1,-1]],
  lines=[],orig=new Int8Array(42).fill(-1),height=Array(W).fill(0);
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)
  for(const [dx,dy] of dir){
   if(c+3*dx<0||c+3*dx>=W||r+3*dy<0||r+3*dy>=H)continue;
   const sites=[];let mask=0n;
   for(let k=0;k<4;k++){
    const z=(r+k*dy)*W+c+k*dx;sites.push(z);
    mask|=1n<<BigInt(z);
   }
   lines.push({sites,mask});
  }
 if(lines.length!==69)throw Error('independent 7x6 69 original winning lines missing');
 for(let t=0;t<5;t++){
  const c=3,z=height[c]*7+c,player=t%2;
  orig[z]=player;height[c]++;
  for(const L of lines)
   if(L.sites.every(v=>orig[v]===player))
    throw Error('canonical original 44444 terminated early');
 }
 function pop(v){let count=0;for(;v;v&=v-1n)count++;return count;}
 function residuals(p){
  const G=[];
  for(const L of lines){
   if(L.sites.some(z=>orig[z]===1-p))continue;
   let mask=0n;
   for(const z of L.sites)if(orig[z]===-1)mask|=1n<<BigInt(z);
   if(mask===0n)throw Error('root original player winner already present');
   G.push(mask);
  }
  G.sort((x,y)=>pop(x)-pop(y)||(x<y?-1:x>y?1:0));
  const output=[];
  for(const g of G)if(!output.some(x=>(x&g)===x))output.push(g);
  return output;
 }
 const outer=[0,1,2,4,5,6],pairs=[];
 for(const c of outer)for(let r=0;r<=4;r+=2)
  pairs.push({id:pairs.length,c,r,lower:r*7+c,upper:(r+1)*7+c});
 if(pairs.length!==18)throw Error('original canonical paired geometry invalid');
 function gauge(p,G){
  for(const x of pairs){
   const l=1n<<BigInt(x.lower),u=1n<<BigInt(x.upper);
   if((G&l)!==0n&&(G&u)!==0n)return null;
  }
  if(p===0&&(G&(1n<<38n))!==0n)return null;
  let require0=0,require1=0;
  for(const x of pairs){
   const l=1n<<BigInt(x.lower),u=1n<<BigInt(x.upper),b=1<<x.id;
   if(G&l){if(p===0)require0|=b;else require1|=b;}
   if(G&u){if(p===0)require1|=b;else require0|=b;}
  }
  if(require0&require1)throw Error('source pair gauge contradiction not blocked');
  return {G,require0,require1,signature:require0+','+require1};
 }
 const R0=residuals(0),R1=residuals(1),
  a0=R0.map(x=>gauge(0,x)).filter(Boolean),
  a1=R1.map(x=>gauge(1,x)).filter(Boolean);
 const p0signs=new Set(a0.map(x=>x.signature));
 const matchedP1=a1.filter(x=>p0signs.has(x.signature));
 const remain=a1.filter(x=>!p0signs.has(x.signature));
 if(R0.length!==48||R1.length!==42||a0.length!==24||
    a1.length!==24||matchedP1.length!==12||remain.length!==12)
  throw Error('original independent canonical residual 48/42 and 12 duality fail');
 return {W,H,K,orig,lines,R0,R1,pairs,remain,matchedP1};
}
function generateOriginalStaticOwnerGrid(physical,lowerBits,grid){
 grid.set(physical.orig);
 grid[38]=1; // actual future original center c3 row5 under HYPOTHETICAL quota
 for(const pair of physical.pairs){
  const low=(lowerBits>>pair.id)&1;
  grid[pair.lower]=low;
  grid[pair.upper]=1-low;
 }
 return grid;
}
export function independentlyValidateOriginal7x6Canonical18Fourier(){
 const src=sourceTrue7x6Canonical18WalshAnalysis(),
  physics=originalCanonicalPhysicalModel(),N=1<<18,
  truth=new Int32Array(N),grid=new Int8Array(42),failures=[];
 const physicalClauses=physics.remain.map(c=>{
  const sites=[];for(let z=0;z<42;z++)
   if(c.G&(1n<<BigInt(z)))sites.push(z);
  return {mask:'0x'+c.G.toString(16),sites,
   need0:'0x'+c.require0.toString(16),
   need1:'0x'+c.require1.toString(16)};
 });
 const srcClauses=src.includedOriginalSignedCubicRequirements.map(c=>
  c.originalPhysicalMaskHex+':'+c.pairMustLowerOwnerP0Hex+
    ':'+c.pairMustLowerOwnerP1Hex).sort();
 const physicalKeys=physicalClauses.map(c=>
  c.mask+':'+c.need0+':'+c.need1).sort();
 if(JSON.stringify(srcClauses)!==JSON.stringify(physicalKeys))
  failures.push({type:'SOURCE_VS_INDEPENDENT_ORIGINAL_SIGNED_CUBICS_DIFFER'});
 let trueCount=0,balancedChecks=0,originalSiteChecks=0;
 for(let x=0;x<N;x++){
  generateOriginalStaticOwnerGrid(physics,x,grid);
  let p0=0,p1=0;
  for(const p of grid){if(p===0)p0++;else if(p===1)p1++;
    else throw Error('unowned physical cell in full static gauge')}
  if(p0!==21||p1!==21)
   failures.push({type:'STATIC_GAUGE_OWNER_QUOTA',x,p0,p1});
  balancedChecks++;
  let has=false;
  for(const L of physicalClauses){
   originalSiteChecks+=L.sites.length;
   if(L.sites.every(z=>grid[z]===1)){has=true;break;}
  }
  truth[x]=has?1:0;trueCount+=has;
 }
 if(trueCount!==src.sourceSatisfyingStaticGaugeColorings)
  failures.push({type:'STATIC_18_VARIABLE_TRUTH_COUNT',trueCount,source:src.sourceSatisfyingStaticGaugeColorings});
 // Directly from PHYSICAL truth table, compute every one-bit influence
 // and all 18 singleton Walsh sums WITHOUT reading source FFT contents.
 const singleton=Array(18).fill(0),changes=Array(18).fill(0);
 for(let x=0;x<N;x++)if(truth[x]){
  for(let j=0;j<18;j++)singleton[j]+=(x&(1<<j))?-1:1;
 }
 for(let j=0;j<18;j++)
  for(let x=0;x<N;x++)if(truth[x]!==truth[x^(1<<j)])changes[j]++;
 for(let j=0;j<18;j++){
  if(singleton[j]!==src.singletonUnnormalizedWalsh[j])
   failures.push({type:'INDEPENDENT_DIRECT_SINGLETON_WALSH_MISMATCH',j,
      got:singleton[j],source:src.singletonUnnormalizedWalsh[j]});
  if(changes[j]*N!==src.oneBitSpectralInfluenceNumerator[j])
   failures.push({type:'INDEPENDENT_DIRECT_DIFFERENCE_ENERGY_MISMATCH',j,
      got:changes[j]*N,source:src.oneBitSpectralInfluenceNumerator[j]});
 }
 // Independent integer Walsh transform of physically evaluated
 // original K4 grid truth. Different bit-first order / buffer copy.
 const Walsh=Int32Array.from(truth),pop=new Uint8Array(N);
 for(let v=1;v<N;v++)pop[v]=pop[v>>1]+(v&1);
 for(let bit=0;bit<18;bit++){
  const stride=1<<bit,block=stride*2;
  for(let t=0;t<N;t+=block){
   for(let j=0;j<stride;j++){
    const upper=Walsh[t+j],lower=Walsh[t+j+stride];
    Walsh[t+j]=upper+lower;
    Walsh[t+j+stride]=upper-lower;
   }
  }
 }
 const hist=Array(19).fill(0),power=Array(19).fill(0);
 let nonzero=0,maxDegree=0,energy=0;
 for(let k=0;k<N;k++){
  const z=Walsh[k];
  if(z){nonzero++;hist[pop[k]]++;maxDegree=Math.max(maxDegree,pop[k]);}
  power[pop[k]]+=z*z;energy+=z*z;
 }
 if(JSON.stringify(hist)!==JSON.stringify(src.byDegreeNonzero)||
   JSON.stringify(power)!==JSON.stringify(src.byDegreeWalshSquaredNumeratorPower)||
   energy!==N*trueCount||
   nonzero!==src.sourceWalshCoefficientsNonzero||maxDegree!==src.maxExactWalshDegree)
  failures.push({type:'INDEPENDENT_FULL_WALSH_SPECTRUM_DIFFERENCE',
    nonzero,maxDegree,energy,sourceNonzero:src.sourceWalshCoefficientsNonzero,
    sourceDegree:src.maxExactWalshDegree});
 // Reflection is the ORIGINAL 7-column mirror c ->6-c, row unchanged.
 const map=src.physicalColumnReflectionOn18PairVariables;
 if(map.length!==18||map.some((m,j)=>!Number.isInteger(m)||m<0||m>=18||
      map[m]!==j))failures.push({type:'PHYSICAL_REFLECTION_MAP_NONINVOLUTION'});
 let reflectionFailures=0;
 for(let x=0;x<N;x++){
  let mirror=0;
  for(let j=0;j<18;j++)if(x&(1<<j))mirror|=1<<map[j];
  if(truth[x]!==truth[mirror])reflectionFailures++;
 }
 if(reflectionFailures!==0||!src.reflectionPreserves12SignedClauses||
    !src.reflectionPreservesSingletonWalsh)
  failures.push({type:'INDEPENDENT_ORIGINAL_REFLECTION_NOT_SYMMETRY',reflectionFailures});
 // Under a hidden XOR shift t, singleton nonzero Walsh coefficients
 // force each coordinate t_j=0: strict no-period algebraic deduction.
 const all18SingletonNonzero=singleton.every(v=>v!==0);
 if(!all18SingletonNonzero||!src.XORHiddenTranslationPeriodTrivialProved)
  failures.push({type:'SOURCE_HIDDEN_XOR_PERIOD_NO_GO_NOT_CONFIRMED'});
 const variancePower=power.slice(1).reduce((a,b)=>a+b,0);
 return {status:failures.length?'INDEPENDENT_TRUE7X6_FOURIER_FALSIFIER_FAILED':
   'INDEPENDENT_TRUE7X6_CANONICAL18_WALSH_PERIOD_NO_GO_PASS',
  board:[7,6,4],originalLegalPrefix:'44444',
  originalPhysicalWinlines:physics.lines.length,
  originalSourceResiduals:{P0:physics.R0.length,P1:physics.R1.length},
  pairedCausalProjectors:physics.matchedP1.length,
  standaloneP1SignedCubicProjectors:physics.remain.length,
  staticConditionalGaugeConfigurationsExamined:N,
  physicalOwnerQuotaBalancedChecks:balancedChecks,
  independentlyEvaluatedOriginalFuturePhysicalCellLiterals:originalSiteChecks,
  physicalActualStaticP1CompletionTrueCount:trueCount,
  fullWalshSpectrumNonzero:nonzero,
  fullWalshMaxDegree:maxDegree,
  degreeHistogram:hist,
  independentDirectSingletonWalsh:singleton,
  independentlyDirectlyCalculatedBitFlipCounts:changes,
  independentDirectInfluenceDenominator:N,
  independentParsevalIntegerEnergy:energy,
  nonconstantSpectralDegree3Fraction:power.slice(1,4).reduce((a,b)=>a+b,0)/variancePower,
  nonconstantSpectralDegree6Fraction:power.slice(1,7).reduce((a,b)=>a+b,0)/variancePower,
  original7ColumnReflectionChecks:N,
  reflectionFailures,
  exactNoNontrivialXORTranslationPeriod:all18SingletonNonzero,
  sourceFutureGameWDLQueried:0,
  priorFullHypotheticalPairGaugeOnlineEnforceability:'UNPROVED',
  noNewTrueOriginalFirstWinWDLOrBestMove:true,
  errors:failures.slice(0,12)};
}
