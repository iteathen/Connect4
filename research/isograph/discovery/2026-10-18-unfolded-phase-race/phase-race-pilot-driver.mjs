import { physicalPhaseRaceCheck } from './original7x6-physical-phase-race-falsifier.mjs';
import fs from 'node:fs';
const W=7,H=6,K=4,N=42, seed=20261018;
let state=seed>>>0;
function rng(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
const idx=(c,r)=>7*r+c;
const lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
 const cells=Array.from({length:4},(_,k)=>[c+k*dc,r+k*dr]);
 if(cells.every(([x,y])=>x>=0&&x<7&&y>=0&&y<6))lines.push(cells.map(([x,y])=>idx(x,y)));
}
if(lines.length!==69)throw Error('69-line board mismatch');
function suffixFor(prefix){
 const h=Array(7).fill(0);for(const ch of prefix)h[Number(ch)-1]++;
 const a=[];for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)a.push(c+1);
 for(let i=a.length-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;
}
const report={date:'2026-10-18',seed,runEnvironment:process.version,
 frozenCheckerGitBlob:'5f644ad989f86f350960424a2953db6caacafc53',
 board:'true 7x6 K4, 69 original winning lines, first-win prefix stopped',
 canonicalSourceResiduals:null,canonicalDisjointRacePairCount:null,
 sourceRaceFreeRoots:0,nontrivialSourceRaceFreeRoots:0,
 sampledRootObservations:0,sampledCompleteHypotheticalWords:0,
 dualCompletionWords:0,dualCompletionP0Winner:0,dualCompletionP1Winner:0,
 raceFreeGuardViolations:0,physicalFormulaContradictions:0,
 samePhaseDifferentFirstWinnerWitness:null,
 sourceAlternativeFutureGameWDLQueries:0,allCompleteWordsUsedForValidationOnly:true,
 successful:true};
function record(prefix, suffix){
 const check=physicalPhaseRaceCheck({prefix,suffix});
 report.sampledCompleteHypotheticalWords++;
 if(!check.success){report.successful=false;
  if(check.formula!==check.physical)report.physicalFormulaContradictions++;
  if(check.D===0&&check.phaseFinalCompletions.every(Boolean))report.raceFreeGuardViolations++;
  throw Error('Physical contradiction: '+JSON.stringify({prefix,suffix,check}));
 }
 if(check.phaseFinalCompletions.every(Boolean)){
  report.dualCompletionWords++;
  if(check.formula===1)report.dualCompletionP0Winner++;
  if(check.formula===-1)report.dualCompletionP1Winner++;
 }
 return check;
}
const cq=record('44444',suffixFor('44444'));
report.canonicalSourceResiduals=cq.RCounts;
report.canonicalDisjointRacePairCount=cq.D;
if(String(cq.RCounts)!=='48,42')throw Error('wrong canonical original residuals');
for(let k=0;k<900;k++)record('44444',suffixFor('44444'));
function samplePrefix(){
 let prefix='',h=Array(7).fill(0),board=Array(42).fill(-1);
 for(let t=0;t<42;t++){
  const safe=[];
  for(let c=0;c<W;c++)if(h[c]<H){
   const z=idx(c,h[c]),p=t%2;board[z]=p;
   if(!lines.some(L=>L.every(i=>board[i]===p)))safe.push(c);
   board[z]=-1;
  }
  if(!safe.length)break;
  const c=safe[rng()%safe.length];board[idx(c,h[c]++)]=t%2;prefix+=String(c+1);
  if(prefix.length>=24&&(t%5===0||t>=37)){
   const result=record(prefix,suffixFor(prefix));
   report.sampledRootObservations++;
   if(result.D===0){report.sourceRaceFreeRoots++;
    if(result.RCounts[0]&&result.RCounts[1])report.nontrivialSourceRaceFreeRoots++;
   }
  }
 }
}
for(let k=0;k<400;k++)samplePrefix();
// Same-phase swap: event positions have equal parity, no internal occurrence of either column.
function phase(prefix,w){
 const h=Array(7).fill(0);for(const ch of prefix)h[Number(ch)-1]++;
 const color=Array(42).fill(-1),n=prefix.length;
 for(let k=0;k<w.length;k++){const c=w[k]-1;color[idx(c,h[c]++)]=(n+k)%2;}
 return color.join(',');
}
outer:for(let k=0;k<320;k++){
 const w=suffixFor('44444');
 const a=record('44444',w);
 for(let i=0;i<w.length;i++)for(let j=i+2;j<Math.min(w.length,i+12);j+=2){
  if(w[i]===w[j]||w.slice(i+1,j).includes(w[i])||w.slice(i+1,j).includes(w[j]))continue;
  const v=w.slice();[v[i],v[j]]=[v[j],v[i]];
  if(phase('44444',w)!==phase('44444',v))throw Error('phase preservation guard false');
  const b=record('44444',v);
  if(a.physical!==b.physical){report.samePhaseDifferentFirstWinnerWitness={prefix:'44444',
   relativeSwapRanksOneBased:[i+1,j+1],firstSuffix:w.join(''),secondSuffix:v.join(''),
   equalPhysicalEventOwnerPhases:true,firstWinnerP0Relative:a.physical,secondWinnerP0Relative:b.physical,
   firstWinnerAbsoluteTurnA:a.firstWinningAbsoluteTurn,firstWinnerAbsoluteTurnB:b.firstWinningAbsoluteTurn};break outer;}
 }
}
fs.writeFileSync('PHASE_RACE_PHYSICAL_PILOT.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
