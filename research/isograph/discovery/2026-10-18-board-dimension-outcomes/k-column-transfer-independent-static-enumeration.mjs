// Frozen independent STATIC original-grid conformance control. Counts all
// 2^(W*H) full two-colorings only for predeclared small fixtures.
// This is NOT a game tree, legal future histories, WDL solver or policy.
// Source transfer under test separately frozen before this checker.
import {createStaticKColumnDrawTransfer} from './source-k-column-static-draw-transfer.mjs';
const DIRECTIONS=[[1,0],[0,1],[1,1],[1,-1]];
function independentlyGenerateLines(W,H,K){
 const masks=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)
 for(const [dx,dy] of DIRECTIONS) {
  const ex=x+(K-1)*dx,ey=y+(K-1)*dy;
  if(ex<0||ex>=W||ey<0||ey>=H)continue;
  let mask=0;
  for(let j=0;j<K;j++)mask|=(1<<((y+j*dy)*W+x+j*dx));
  masks.push(mask);
 }
 return masks;
}
function pop(x){let n=0;for(;x;x&=x-1)n++;return n;}
function enumerate(W,H,K){
 const N=W*H;
 if(N>20)throw Error('external brute static enumerate only N<=20');
 const lines=independentlyGenerateLines(W,H,K),coef=Array(N+1).fill(0);
 for(let coloring=0;coloring<2**N;coloring++){
  let safe=true;
  for(const mask of lines)
   if((coloring&mask)===0||(coloring&mask)===mask){safe=false;break;}
  if(safe)coef[pop(coloring)]++;
 }
 return {coefficientValues:coef.map(String),lineCount:lines.length,
  totalTerminalFreeStaticColorings:coef.reduce((a,b)=>a+b,0)};
}
export function runIndependentStaticEnumerationControls(){
 const fixtures=[
  [3,3,3],[4,3,3],[5,3,3],
  [3,4,4],[4,4,4],[5,4,4],
  [5,4,5],[4,2,3],[6,3,4]
 ];
 const cases=[];
 for(const [W,H,K] of fixtures){
  if(W*H>20)throw Error('oversize frozen control');
  const independent=enumerate(W,H,K),
   source=createStaticKColumnDrawTransfer({height:H,connect:K,maxBoundaryBits:20}).analyze(W,{mode:'coefficients',maxTransfers:30000000});
  if(source.status!=='STATIC_K_COLUMN_TRANSFER_COMPLETE')throw Error('static source budget: '+JSON.stringify(source));
  const a=source.coefficientValues,b=independent.coefficientValues;
  const pass=JSON.stringify(a)===JSON.stringify(b) &&
    source.stats.originalGeometricWinningLines===independent.lineCount;
  cases.push({W,H,K,passed:pass,sourceLines:source.stats.originalGeometricWinningLines,
   independentLines:independent.lineCount,sourceTotal:source.totalTerminalFreeStaticColorings,
   physicalEnumerationTotal:String(independent.totalTerminalFreeStaticColorings),
   sourceStates:source.stats.maxActiveSuffixStates,sourceTransitions:source.stats.sourceStaticTransitionsTested,
   balanced:source.balancedTerminalFreeColoringExists,
   coefficientMismatchIndices:a.flatMap((v,i)=>v!==b[i]?[i]:[])});
 }
 return {status:cases.every(x=>x.passed)?'INDEPENDENT_STATIC_GENERATING_POLYNOMIAL_PASS':'STATIC_MISMATCH',
  controls:cases,anyFalse:cases.some(x=>!x.passed),independentWDLChecks:0,
  gameTreeStatesEnumerated:0};
}
