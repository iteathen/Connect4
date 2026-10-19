// Independently reconstruct TRUE original W7,H6,K4 69 physical K4
// lines, six prescribed local original 2-site correlators and owner
// anchor. Compare frozen source 76-bit syndrome and separately invert
// via GF2 equations. Check 42 one-hot + seeded static colorings and
// a TRUE 42-ply gravity/alternation FIRST-WIN-FREE DRAW history.
 // No different board, quantum hardware, game tree, or WDL lookahead.
import {sourceTrue7x6SixLocalPauliSyndrome}
 from './source-true7x6-six-local-Pauli-FFT-syndrome-decoder.mjs';
function buildPhysicalMeasurements() {
 const lines=[],groups=[[1,0],[0,1],[1,1],[1,-1]],
  edgePairs=[[0,1],[1,2],[7,8],[8,9],[0,7],[7,14]];
 for(let c=0;c<7;c++)for(let r=0;r<6;r++)for(const [dc,dr] of groups){
  if(c+3*dc<0||c+3*dc>=7||r+3*dr<0||r+3*dr>=6)continue;
  lines.push([0,1,2,3].map(t=>(r+t*dr)*7+c+t*dc));
 }
 if(lines.length!==69)throw Error('independent original W7 H6 69 K4 line enumeration failed');
 const measurements=lines.concat(edgePairs.map(p=>p.slice()),[[0]]);
 return {lines,pairs:edgePairs,measurements,
  masks:measurements.map(L=>L.reduce((mask,i)=>mask|(1n<<BigInt(i)),0n))};
}
function independentSyndrome(M,owner){
 return M.measurements.map(sites=>sites.reduce((bit,i)=>bit^owner[i],0));
}
function independentDecode(M,syndrome){
 const cells=42,n=M.masks.length;
 const augmented=M.masks.map((mask,i)=>mask|(syndrome[i]?1n<<42n:0n));
 let rank=0,pivots=[];
 for(let column=41;column>=0;column--){
  const bit=1n<<BigInt(column);let r=rank;
  while(r<n&&(augmented[r]&bit)===0n)r++;
  if(r>=n)throw Error('independently reconstructed exact owner pivot missing');
  [augmented[r],augmented[rank]]=[augmented[rank],augmented[r]];
  for(let k=0;k<n;k++)if(k!==rank&&(augmented[k]&bit)!==0n)
   augmented[k]^=augmented[rank];
  pivots.push(column);rank++;
 }
 if(rank!==42||augmented.slice(42).some(x=>x!==0n))
  throw Error('independent owner GF2 reconstruction bad rank/inconsistent');
 const owner=Array(42).fill(0);
 for(let row=0;row<rank;row++){
  owner[pivots[row]]=(augmented[row]&(1n<<42n))!==0n?1:0;
 }
 return owner;
}
function nullByIndependentGF2Rows(original){
 const rows=original.map(r=>r),pivot=[];let rank=0;
 for(let col=41;col>=0;col--){
  const mask=1n<<BigInt(col),n=rows.length;let j=rank;
  while(j<n&&(rows[j]&mask)===0n)j++;
  if(j>=n)continue;
  [rows[j],rows[rank]]=[rows[rank],rows[j]];
  for(let t=0;t<n;t++)if(t!==rank&&(rows[t]&mask)!==0n)rows[t]^=rows[rank];
  pivot.push(col);rank++;
 }
 const free=Array.from({length:42},(_,i)=>i).filter(i=>!pivot.includes(i));
 const basis=free.map(j=>{
  let q=1n<<BigInt(j);
  for(let i=0;i<pivot.length;i++)
   if(rows[i]&(1n<<BigInt(j)))q|=1n<<BigInt(pivot[i]);
  return q;
 });
 let masks=[];
 for(let choose=0;choose<1<<basis.length;choose++){
  let m=0n;for(let j=0;j<basis.length;j++)if(choose&(1<<j))m^=basis[j];
  masks.push(m);
 }
 return {rank,basis,masks};
}
function actualOriginalFullDraw(geom){
 const word='123456123456654321654321123456123456777777',
  owners=Array(42).fill(-1),height=Array(7).fill(0);
 for(let t=0;t<word.length;t++){
  const c=Number(word[t])-1,p=t&1,r=height[c];
  if(r>=6)throw Error('physical source DRAW history illegal gravity');
  const id=r*7+c;
  height[c]++;owners[id]=p;
  if(geom.lines.some(L=>L.includes(id)&&L.every(z=>owners[z]===p)))
   throw Error('source genuine original DRAW history has first winner');
 }
 if(height.some(h=>h!==6)||owners.filter(x=>x===0).length!==21||
   owners.filter(x=>x===1).length!==21)
  throw Error('independent original draw not fully alternating or complete');
 return owners;
}
export function independentlyVerifyTrue7x6SixPauliSyndrome(){
 const s=sourceTrue7x6SixLocalPauliSyndrome(),M=buildPhysicalMeasurements(),
  errors=[],rankSteps=[],pure=M.masks.slice(0,69);
 const rankIndependent=(masks)=>{
  const basis=new Map();let rank=0;
  for(let q of masks)while(q){
   const low=q&(-q),col=low.toString(2).length-1;
   if(basis.has(col))q^=basis.get(col);
   else {basis.set(col,q);rank++;break}
  }
  return rank;
 };
 for(let i=0;i<=6;i++)
  rankSteps.push(rankIndependent(M.masks.slice(0,69+i)));
 const withAnchor=rankIndependent(M.masks);
 if(JSON.stringify(rankSteps)!==JSON.stringify([35,36,37,38,39,40,41])||
   withAnchor!==42)
  errors.push({kind:'INDEPENDENT_ORIGINAL_SYNDROME_RANK_SEQUENCE_DIFFERENT',rankSteps,withAnchor});
 const originalKernel=nullByIndependentGF2Rows(pure);
 let survivingSix=0,survivingAll=0,periodXorChecks=0;
 for(const t of originalKernel.masks){
  let sixZero=true;
  for(const mask of M.masks.slice(69,75)){
   let w=0n,x=t&mask;
   for(;x;x&=x-1n)w^=1n;
   if(w!==0n)sixZero=false;
   periodXorChecks++;
  }
  if(sixZero){survivingSix++;
   if((t&1n)===0n)survivingAll++;
  }
 }
 if(originalKernel.rank!==35||originalKernel.masks.length!==128||
   survivingSix!==2||survivingAll!==1)
  errors.push({kind:'INDEPENDENT_HIDDEN_KERNEL_NOT_REDUCED_TO_GLOBAL_COMPLEMENT',
   originalRank:originalKernel.rank,survivingSix,survivingAll});
 let ownerPatternsChecked=0,allOriginalSyndromeChecks=0,
  ownerBitsReconstructed=0,physicalOriginalDrawsChecked=0;
 function test(x){
  const independent=independentSyndrome(M,x);
  const sourceEncoded=s.encode(x);
  if(independent.join('')!==sourceEncoded.join(''))
   errors.push({kind:'SOURCE_SYNDROME_DIFFERENT_FROM_INDEPENDENT_ORIGINAL_GRID',ownerPatternsChecked});
  const decoded=independentDecode(M,independent);
  const srcDecoded=s.decode(independent);
  if(decoded.join('')!==x.join('')||srcDecoded.join('')!==x.join(''))
   errors.push({kind:'OWNER_SYNDROME_DID_NOT_UNIQUELY_RECONSTRUCT',ownerPatternsChecked});
  const flip=x.map(v=>1-v),flipRead=independentSyndrome(M,flip);
  if(flipRead.slice(0,75).join('')!==independent.slice(0,75).join('')||
    flipRead[75]===independent[75])
   errors.push({kind:'PAULI_RELATIVE_CORRELATIONS_SHOULD_BE_GLOBAL_COLOR_INVARIANT',ownerPatternsChecked});
  ownerPatternsChecked++;allOriginalSyndromeChecks+=76;
  ownerBitsReconstructed+=42;
 }
 // Exact original 42 cell BASIS impulses plus zero field.
 test(Array(42).fill(0));
 for(let i=0;i<42;i++){const x=Array(42).fill(0);x[i]=1;test(x);}
 let state=20261019>>>0;
 const next=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state};
 for(let k=0;k<100;k++){
  const x=Array.from({length:42},()=>((next()>>>8)&1));
  test(x);
 }
 const draw=actualOriginalFullDraw(M);
 test(draw);physicalOriginalDrawsChecked++;
 return {
  status:errors.length?'INDEPENDENT_TRUE7X6_SIX_PAULI_SYNDROME_RECONSTRUCTION_FAILED':
   'INDEPENDENT_TRUE7X6_SIX_LOCAL_PAULI_SYNDROME_FULL_RECONSTRUCTION_PASS',
  strictOriginalGame:[7,6,4],
  actualWinningLineCount:69,
  actualTwoBodyLocalCorrelations:M.pairs,
  original69ParityMapRank:originalKernel.rank,
  sixPhysicalLocalPauliRankProgression:rankSteps,
  withOneAbsoluteCellOwnerAnchorFullRank:withAnchor,
  hiddenXorParityPeriodGroupSize:originalKernel.masks.length,
  hiddenPeriodGroupSizeAfterSix:survivingSix,
  hiddenPeriodGroupAfterAbsoluteAnchor:survivingAll,
  directlyCheckedOriginalParityPeriodsVsSixProbes:periodXorChecks,
  staticAndActualOwnerBitPatternsDecoded:ownerPatternsChecked,
  independentlyEncodedPhysicalSyndromeChecks:allOriginalSyndromeChecks,
  original42BitOwnerReconstructionChecks:ownerBitsReconstructed,
  actualOriginal42MoveFirstWinStoppedDrawsReconstructed:physicalOriginalDrawsChecked,
  relativePauliSyndromeCannotDistinguishGlobalColorFlip:true,
  sixLocalChecksMinimalViaRankDeficit:true,
  sourceGameWDLQueries:0,
  neverInterpretedCompleteBinaryOwnerAsPartialTernaryGamePosition:true,
  errors:errors.slice(0,10)
 };
}
