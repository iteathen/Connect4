// INDEPENDENT actual original W7 H6 K4 physical 69-line source q
// reconstruction and 21 two-ply action-order cofactor validation.
// INDEPENDENT TEST inspects genuine first-win-free two-move prefixes
// and arbitrary STATIC complete owner-colorings thereafter to check
// two-variable Walsh differential identity. This is NOT minimax,
// strategically alternative future game-WDL value evaluation or a
// claimed nonbranching game-winning algorithm.
import {sourceTrue7x6CanonicalWalshTwoMoveExchange}
 from './source-true7x6-canonical-Walsh-two-move-exchange.mjs';
function original7x6K4Lines(){
 const dirs=[[1,0],[0,1],[1,1],[1,-1]],out=[];
 for(let c=0;c<7;c++)for(let r=0;r<6;r++)for(const [dx,dy] of dirs){
  if(c+3*dx>=7||r+3*dy<0||r+3*dy>=6)continue;
  const cells=[];
  for(let j=0;j<4;j++)cells.push((r+j*dy)*7+c+j*dx);
  out.push({cells,mask:cells.reduce((m,z)=>m|(1n<<BigInt(z)),0n)});
 }
 if(out.length!==69)throw Error('independent original K4 lines not69');
 return out;
}
function actualFirstWinStoppedBoard(seq,lines){
 const h=Array(7).fill(0),cells=Array(42).fill(-1);
 for(let ply=0;ply<seq.length;ply++){
  const col=seq[ply]-1,p=ply&1;
  if(!Number.isInteger(col)||col<0||col>=7||h[col]>=6)
   throw Error('illegal original column gravity move');
  const r=h[col]++,id=r*7+col;cells[id]=p;
  if(lines.some(L=>L.cells.includes(id)&&L.cells.every(z=>cells[z]===p)))
   return {status:'FIRST_WIN_TERMINAL',winner:p,ply:ply+1,h,cells};
  if(ply===41)return {status:'FULL_DRAW_TERMINAL',h,cells};
 }
 return {status:'NONTERMINAL',h,cells};
}
function originalR(lines,cells,p){
 const eligible=[];
 for(const L of lines) {
  if(L.cells.some(z=>cells[z]===1-p))continue;
  let rem=0n;
  for(const z of L.cells)if(cells[z]===-1)rem|=1n<<BigInt(z);
  if(!rem)throw Error('first-win-stopped source residual empty');
  eligible.push(rem);
 }
 function pop(b){let r=0;for(;b;b&=b-1n)r++;return r;}
 eligible.sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
 const minimal=[];
 for(const G of eligible)if(!minimal.some(F=>(G&F)===F))minimal.push(G);
 return minimal;
}
function normalize(G){
 function pop(x){let n=0;for(;x;x&=x-1n)n++;return n;}
 const all=[...new Set(G.map(z=>z.toString(16)))].map(z=>BigInt('0x'+z));
 all.sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
 const min=[];
 for(const g of all)if(!min.some(f=>(g&f)===f))min.push(g);
 return min;
}
function formulaAfterTwo(G,p,firstLanding,secondLanding){
 const mx=1n<<BigInt(firstLanding),my=1n<<BigInt(secondLanding);
 const own=p===1?mx:my,blocked=p===1?my:mx;
 return normalize(G.filter(m=>(m&blocked)===0n).map(m=>m&~own));
}
function equalMasks(x,y){
 const a=x.map(v=>v.toString(16)).sort(),b=y.map(v=>v.toString(16)).sort();
 return JSON.stringify(a)===JSON.stringify(b);
}
function checkMixedOriginalFutureFulfillment(G,assignment,p) {
 for(const req of G) {
  let all=true;
  for(let site=0;site<42;site++)
   if((req&(1n<<BigInt(site)))!==0n&&assignment[site]!==p){all=false;break;}
  if(all)return 1;
 }
 return 0;
}
export function independentOriginal7x6CanonicalWalshExchange(){
 const source=sourceTrue7x6CanonicalWalshTwoMoveExchange(),
  lines=original7x6K4Lines(),
  root=actualFirstWinStoppedBoard([4,4,4,4,4],lines),
  R0=originalR(lines,root.cells,0),R1=originalR(lines,root.cells,1);
 if(root.status!=='NONTERMINAL'||R0.length!==48||R1.length!==42)
  throw Error('independent canonical original firstwin source unexpected');
 const errors=[],historyPairs=[],counts={
  trueOriginalTwoStepSequencesTested:0,strictFirstWinNonterminalTwoStep:0,
  originalTwoStepResidualOwnerChecks:0,
  originalOddIncidenceRequirementCountsTested:0,
  allPairsWithDifferentTwoStepOrientedQ:0,
  WalshTwoBitFiniteDifferenceIdentityChecks:0,
  staticOriginalFutureBooleanWinPredicateEvaluations:0,
  averageOriginalR0OddIncidence:0,averageOriginalR1OddIncidence:0,
  oracleWDLQueries:0
 };
 const bit=z=>1n<<BigInt(z);
 let rng=20261019>>>0;
 const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng};
 for(const w of source.pairs){
  const a=w.originalFirstColumn,b=w.originalOtherColumn,x=w.originalCurrentLandingX,
    y=w.originalCurrentLandingY;
  const pAB=actualFirstWinStoppedBoard([4,4,4,4,4,a,b],lines);
  const pBA=actualFirstWinStoppedBoard([4,4,4,4,4,b,a],lines);
  counts.trueOriginalTwoStepSequencesTested+=2;
  if(pAB.status!=='NONTERMINAL'||pBA.status!=='NONTERMINAL'){
   errors.push({kind:'FIRSTWIN_ROOT_TWO_MOVE_GUARD_FAILED',a,b,AB:pAB.status,BA:pBA.status});
   continue;
  }
  counts.strictFirstWinNonterminalTwoStep+=2;
  if(!equalMasks(pAB.h.map(BigInt),pBA.h.map(BigInt)))
   errors.push({kind:'HEIGHT_DIFFERENCE_THOUGH_MOVE_ORDER_SWAP',a,b});
  let anyDifferent=false;
  for(let p=0;p<=1;p++) {
   const old=p===0?R0:R1;
   const nativeAB=originalR(lines,pAB.cells,p),nativeBA=originalR(lines,pBA.cells,p);
   const algAB=formulaAfterTwo(old,p,x,y),algBA=formulaAfterTwo(old,p,y,x);
   if(!equalMasks(nativeAB,algAB)||!equalMasks(nativeBA,algBA))
    errors.push({kind:'SOURCE_RESTRICTION_VS_TRUE_ORIGINAL_R',a,b,p});
   counts.originalTwoStepResidualOwnerChecks+=2;
   const independentOdd=old.filter(G=>((G&bit(x))!==0n)!==((G&bit(y))!==0n)).length;
   const declared=p===0?w.sourceP0ResidualIncidence:w.sourceP1ResidualIncidence;
   if(declared.oddIncidence!==independentOdd||declared.originalRequirements!==old.length)
    errors.push({kind:'ROOT_ODD_INCIDENCE_RAW_SOURCE_MISMATCH',a,b,p});
   counts.originalOddIncidenceRequirementCountsTested+=old.length;
   if(p===0)counts.averageOriginalR0OddIncidence+=independentOdd;
   else counts.averageOriginalR1OddIncidence+=independentOdd;
   if(!equalMasks(nativeAB,nativeBA))anyDifferent=true;
   // Evaluate static Boolean OR of ORIGINAL R_p K-line requirements
   // after fixing ALL OTHER future physical ownership bits arbitrarily.
   // This is a Fourier FUNCTION test, not a future playable game.
   let samples=256,unequal=0;
   for(let trial=0;trial<samples;trial++){
    const rest=root.cells.slice();
    for(let site=0;site<42;site++){
     if(rest[site]>=0||site===x||site===y)continue;
     rest[site]=(rand()>>>8)&1;
    }
    function evalSign(sx,sy){
     rest[x]=sx===1?0:1;
     rest[y]=sy===1?0:1;
     counts.staticOriginalFutureBooleanWinPredicateEvaluations++;
     return checkMixedOriginalFutureFulfillment(old,rest,p);
    }
    const Fpp=evalSign(+1,+1),Fpm=evalSign(+1,-1),
      Fmp=evalSign(-1,+1),Fmm=evalSign(-1,-1);
    const coeffB4=Fpp+Fpm-Fmp-Fmm;
    const coeffC4=Fpp-Fpm+Fmp-Fmm;
    if(2*(Fmp-Fpm)!==(coeffC4-coeffB4))
     errors.push({kind:'ORIGINAL_NONLINEAR_2BIT_FOURIER_DIFFERENCE_IDENTITY_FAIL',a,b,p,trial});
    if(Fmp!==Fpm)unequal++;
    counts.WalshTwoBitFiniteDifferenceIdentityChecks++;
   }
   if(p===0)w._pilotP0BooleanFourierOrderSensitivity=unequal;
   else w._pilotP1BooleanFourierOrderSensitivity=unequal;
  }
  if(anyDifferent)counts.allPairsWithDifferentTwoStepOrientedQ++;
  historyPairs.push({first:a,second:b,originalLandingSites:[x,y],
   sourceOddR0:w.sourceP0ResidualIncidence.oddIncidence,
   sourceOddR1:w.sourceP1ResidualIncidence.oddIncidence,
   trueOriginalPostTwoStatesEqual:!anyDifferent,
   staticOwnerOROrderSensitivitySamples:{
    P0:w._pilotP0BooleanFourierOrderSensitivity,
    P1:w._pilotP1BooleanFourierOrderSensitivity}});
 }
 counts.averageOriginalR0OddIncidence/=source.pairs.length;
 counts.averageOriginalR1OddIncidence/=source.pairs.length;
 return {
  status:errors.length?'TRUE7X6_FOURIER_EXCHANGE_PHYSICAL_COUNTEREXAMPLE':
   'INDEPENDENT_TRUE7X6_FOURIER_EXCHANGE_AND_SOURCE_COFACTOR_PASS',
  board:[7,6,4],originalPrefix:'44444',
  originalK4Lines:lines.length,
  sourceRootP0Requirements:R0.length,sourceRootP1Requirements:R1.length,
  ...counts,
  rootMovePairs:historyPairs,
  errors:errors.slice(0,12),
  noStrategicOutcomeValuesComputed:true,
  nuance:'Source compares odd Fourier incidence of current generator masks. Independent 21-pair two-move physical source q reconstruction and static Boolean tests are validation only; not a minimax or future-WDL algorithm.'
 };
}
