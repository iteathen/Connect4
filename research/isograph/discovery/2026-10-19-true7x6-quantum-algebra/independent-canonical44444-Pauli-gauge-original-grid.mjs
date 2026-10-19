// Independent original 7x6 K4 first-win-stopped physical-grid + static
// Pauli gauge checker for FROZEN canonical source producer.
// The 18 split-pair constraints and P1 top-cell lock are hypothetical
// FULL completion parity assumptions, NOT an actually enforced strategy.
// Random gauge orientations below are only STATIC Boolean controls;
// source WDL and opponent game-tree states are NEVER queried.
import {sourceCanonical44444PauliSplitCofactors} from './source-canonical44444-Pauli-split-cofactors.mjs';
function physicalCanonicalOriginal7x6(){
 const W=7,H=6,K=4,grid=Array.from({length:42},()=>-1),h=Array(W).fill(0),
  geometries=[],directions=[{dc:1,dr:0},{dc:0,dr:1},{dc:1,dr:1},{dc:1,dr:-1}];
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const {dc,dr} of directions){
  if(c+3*dc<0||c+3*dc>=W||r+3*dr<0||r+3*dr>=H)continue;
  const cells=[0,1,2,3].map(j=>(r+j*dr)*W+c+j*dc);
  const flag=cells.reduce((m,z)=>m|(1n<<BigInt(z)),0n);
  geometries.push({cells,flag});
 }
 for(let t=0;t<5;t++){
  const c=3,z=h[c]*W+c,p=t%2;
  if(h[c]>=H||grid[z]!==-1)throw Error('original canonical physical prefix not legal');
  grid[z]=p;h[c]++;
  for(const line of geometries)
   if(line.cells.every(j=>grid[j]===p))
    throw Error('physical canonical game terminated before rank5');
 }
 if(geometries.length!==69)throw Error('wrong physical original 69 K4 windows');
 return {W,H,K,grid,h,geometries};
}
function popcount(v){
 let t=0;while(v){t++;v&=v-1n;}return t;
}
function independentlyNormalizeRequirements(grid,lines,player){
 const all=[];
 for(const L of lines){
  if(L.cells.some(z=>grid[z]===1-player))continue;
  let m=0n;
  for(const z of L.cells)if(grid[z]===-1)m|=1n<<BigInt(z);
  if(m===0n)throw Error('physical first win already present');
  all.push(m);
 }
 all.sort((a,b)=>popcount(a)-popcount(b)||(a<b?-1:a>b?1:0));
 const ans=[];
 for(const m of all)if(!ans.some(x=>(m&x)===x))ans.push(m);
 return [...new Set(ans.map(a=>'0x'+a.toString(16)))].sort();
}
function independentlyClassifyConditionalProjector(originalGeneratorHex,p,pairs,z){
 const G=BigInt(originalGeneratorHex);
 for(const pair of pairs){
  const a=1n<<BigInt(pair.lower),b=1n<<BigInt(pair.upper);
  if((G&a)!==0n&&(G&b)!==0n)
   return 'ORTHOGONAL_TO_PAIRED_STABILIZERS';
 }
 if(p===0&&(G&(1n<<BigInt(z)))!==0n)
  return 'ORTHOGONAL_TO_CENTER_QUOTA_STABILIZER';
 return 'NONZERO_SIGNED_SOURCE_PROJECTOR';
}
function fullGaugeColoring(canonical,pairs,lowerBits){
 const grid=canonical.grid.slice();
 const center=3*7+5;grid[center]=1;
 let bits=lowerBits;
 for(const pair of pairs){
  const lo=Number(bits&1n);bits>>=1n;
  grid[pair.lower]=lo;grid[pair.upper]=1-lo;
 }
 if(grid.some(p=>p<0))throw Error('gauge coloring left physical site unowned');
 if(grid.filter(p=>p===0).length!==21||grid.filter(p=>p===1).length!==21)
  throw Error('gauge coloring violates global 42-site quota');
 return grid;
}
function evaluateReducedDNF(clauses,lowerBits){
 for(const item of clauses){
  const must0=BigInt(item.must0Hex),must1=BigInt(item.must1Hex);
  if(((lowerBits&must1)===must1)&&
     ((lowerBits&must0)===0n))
   return true;
 }
 return false;
}
export function independentCanonical44444PauliGaugeControl(){
 const src=sourceCanonical44444PauliSplitCofactors(),
   phys=physicalCanonicalOriginal7x6(),errors=[];
 const native0=independentlyNormalizeRequirements(phys.grid,phys.geometries,0);
 const native1=independentlyNormalizeRequirements(phys.grid,phys.geometries,1);
 const src0=src.R0.slice().sort(),src1=src.R1.slice().sort();
 if(JSON.stringify(native0)!==JSON.stringify(src0)||
    JSON.stringify(native1)!==JSON.stringify(src1))
  errors.push({type:'NORMALIZED_ORIGINAL_PHYSICAL_R_MISMATCH',
   independentR0:native0.length,independentR1:native1.length,
   srcR0:src0.length,srcR1:src1.length});
 if(src.R0.length!==48||src.R1.length!==42||src.board.rank!==5)
  errors.push({type:'CANONICAL_SOURCE_48_42_NOT_REPRODUCED',R0:src.R0.length,R1:src.R1.length});
 const pairSites=new Set(),pairs=src.pairs,z=src.conditionalStabilizerBasis.centerTopPhysicalID;
 for(const pair of pairs){
  if(pair.column===3||pair.upper!==pair.lower+7||
     pair.lowerRow%2!==0||pairSites.has(pair.lower)||pairSites.has(pair.upper))
   errors.push({type:'SOURCE_PAIR_OUTSIDE_18_ORIGINAL_OUTER_DISJOINT',pair});
  pairSites.add(pair.lower);pairSites.add(pair.upper);
 }
 if(pairSites.size!==36||pairs.length!==18||z!==38||pairSites.has(z)||
    src.conditionalStabilizerBasis.impliedCenterTopZEigenvalue!==-1||
    src.conditionalStabilizerBasis.independentFutureOwnerBitsAfterConditionalGauge!==18)
  errors.push({type:'SOURCE_STABILIZER_CENTER_QUOTA_OR_COVERAGE_INVALID'});
 const independentKinds={P0:{},P1:{}},proj=[
  src.PauliP0RequirementProjection,src.PauliP1RequirementProjection];
 [native0,native1].forEach((arr,p)=>{
  const group=independentKinds['P'+p];
  for(const G of arr){
   const key=independentlyClassifyConditionalProjector(G,p,pairs,z);
   group[key]=(group[key]??0)+1;
  }
  for(const [kind,n] of Object.entries(group))
   if((proj[p].orthogonalityCategories[kind]??0)!==n)
    errors.push({type:'PROJECTOR_ORTHOGONALITY_INCORRECT',p,kind,independent:n,
      source:proj[p].orthogonalityCategories[kind]});
 });
 const N=4096,maskAll=(1n<<18n)-1n,originalValues={P0:0,P1:0},
  reducedValues={P0:0,P1:0},counterexamples=[],allFullGaugeBalance=N;
 let rng=20261019>>>0;
 const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng;};
 for(let t=0;t<N;t++){
  const lowerBits=BigInt((rand()>>>7)&Number(maskAll));
  const grid=fullGaugeColoring(phys,pairs,lowerBits);
  for(let p=0;p<2;p++){
   const actual=phys.geometries.some(L=>L.cells.every(z=>grid[z]===p));
   const fromClauses=evaluateReducedDNF(proj[p].clauses,lowerBits);
   if(actual!==fromClauses&&counterexamples.length<6)
    counterexamples.push({t,p,lowerBits:lowerBits.toString(16),actual,fromClauses});
   if(actual)originalValues['P'+p]++;
   if(fromClauses)reducedValues['P'+p]++;
  }
 }
 if(counterexamples.length)errors.push({type:'SOURCE_SIGNED_PAULI_DNF_NOT_ORIGINAL_STATIC_EQUIVALENT',
  counterexamples});
 const cofactors=[],truthStates=[];
 for(let a=0;a<7;a++){
  const grid=phys.grid.slice(),h=phys.h.slice(),land=h[a]*7+a;
  if(grid[land]!==-1)throw Error('physical root action not playable');
  grid[land]=1;h[a]++;
  const physicalWin=phys.geometries.some(L=>L.cells.every(z=>grid[z]===1));
  const physicalFull=h.every(v=>v===6);
  const srcStep=src.sevenOriginalCurrentP1ActionCofactors[a];
  if(srcStep.action!==a+1||srcStep.originalLandingSite!==land) {
   errors.push({type:'SOURCE_P1_ROOT_ACTION_ID_WRONG',a});
   continue;
  }
  if(physicalWin||physicalFull){
   if(srcStep.sourceTerminal!==(physicalWin?'P1_FIRST_WIN':'FULL_DRAW'))
    errors.push({type:'SOURCE_VS_PHYSICAL_TERMINAL_MISMATCH',a});
  }else{
   const actual0=independentlyNormalizeRequirements(grid,phys.geometries,0);
   const actual1=independentlyNormalizeRequirements(grid,phys.geometries,1);
   if(srcStep.sourceTerminal!=='NONTERMINAL'||
      JSON.stringify(actual0)!==JSON.stringify(srcStep.afterR0.slice().sort())||
      JSON.stringify(actual1)!==JSON.stringify(srcStep.afterR1.slice().sort())||
      JSON.stringify(h)!==JSON.stringify(srcStep.afterHeight))
    errors.push({type:'ONE_ACTION_PAULI_COFATOR_VS_INDEPENDENT_PHYSICAL_R_MISMATCH',
      a,expectedR0:actual0.length,expectedR1:actual1.length,
      srcR0:srcStep.afterR0?.length,srcR1:srcStep.afterR1?.length});
   cofactors.push({action:a+1,afterR0:actual0.length,afterR1:actual1.length,
    canonicalTruePhysicalNonterminal:true});
  }
 }
 // Deterministic ORIGINAL hypothetical full gravity extension satisfying
 // all 18 split pairs and pinned top-cell P1. Not claimed first-win legal
 // after some earlier winner, thus never used as source game outcome.
 const hypothetical=[3,3,3,3,3,3];for(let c=0;c<7;c++){
  if(c===3)continue;for(let j=0;j<6;j++)hypothetical.push(c);
 }
 const heights=Array(7).fill(0),colors=Array(42).fill(-1);
 for(let i=0;i<hypothetical.length;i++){
  const c=hypothetical[i],r=heights[c]++,z=r*7+c;
  if(colors[z]!==-1)throw Error('invalid frozen hypothetical center full word');
  colors[z]=i%2;
 }
 if(colors[z]===-1)throw Error('impossible guard'); // overwritten name handled below
 for(const pair of pairs)if(colors[pair.lower]===colors[pair.upper])
  errors.push({type:'ORIGINAL_HYPOTHETICAL_SPLIT_PAIR_VIOLATION'});
 if(colors[src.conditionalStabilizerBasis.centerTopPhysicalID]!==1)
  errors.push({type:'ORIGINAL_HYPOTHETICAL_CENTER_TOP_NOT_P1'});
 const p0Cnt=colors.filter(x=>x===0).length,p1Cnt=colors.filter(x=>x===1).length;
 if(p0Cnt!==21||p1Cnt!==21)
  errors.push({type:'ORIGINAL_HYPOTHETICAL_FULL_SHUFFLE_OWNER_QUOTA',p0Cnt,p1Cnt});
 return {status:errors.length?'SOURCE_PAULI_GAUGE_OR_COFACTOR_COUNTEREXAMPLE':
   'TRUE7X6_CANONICAL44444_ORIGINAL_PAULI_GAUGE_AND_COFACTOR_PASS',
  board:[7,6,4],canonicalOneBasedHistory:'44444',
  actualCanonicalR0:native0.length,actualCanonicalR1:native1.length,
  originalWindowCount:phys.geometries.length,
  physicalFutureCells:37,conditionalSplitPairs:pairs.length,
  conditionalRemainingFreePairBits:18,
  impliedCenterTopOwner:'P1',
  independentProjectorCategories:independentKinds,
  sourceP0SignedReduction:{nonzero:proj[0].signedNonzeroOriginalResidualCount,
    reducedClauses:proj[0].canonicalReducedSignedClauseCount,
    signedDegrees:proj[0].reducedSignedDegreeHistogram,
    hasEmptyClause:proj[0].hasEmptySignedClause},
  sourceP1SignedReduction:{nonzero:proj[1].signedNonzeroOriginalResidualCount,
    reducedClauses:proj[1].canonicalReducedSignedClauseCount,
    signedDegrees:proj[1].reducedSignedDegreeHistogram,
    hasEmptyClause:proj[1].hasEmptySignedClause},
  independentPauliDNFChecks:{fullBalancedStaticGaugeColoringsSampled:N,
    physicalOriginalWindowsEvaluated:N*69,
    reducedDNFBooleanTests:N*2,
    fullQuotaConfirmed:N,
    physicalOwnerLineEventsTrue:originalValues,
    sourceReducedOwnerClauseEventsTrue:reducedValues,
    mismatchCount:counterexamples.length},
  independentOriginalCurrentMoveChecks:{
    P1RootLegalColumns:7,nonterminalCofactorsVerified:cofactors.length,
    sourceOneActionActualGameWDLQueried:0,
    allAfterOriginalResidualCounts:cofactors},
  originalHypotheticalFullWord:{length:hypothetical.length,
    countP0:p0Cnt,countP1:p1Cnt,prefix:'444444',
    all18SplitPauliStabilizersHeld:true,
    pinnedCenterTopP1:true,
    notClaimedFirstWinStoppedGame:true},
  noCompleteSafeP0DefenderStrategyProven:true,
  noNewCanonical44444WDLOrBestMove:true,
  errors:errors.slice(0,12)};
}
