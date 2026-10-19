// INDEPENDENT original Connect4 W7,H6,K4 physical path-amplitude
// contrast on ONE true rank32 firstwin-free original q, with EXACT
// 5040 hypothetical full gravity-shuffle suffixes; FIRST winning
// original prefix is an ABSORBING projection in a separate channel.
// If one hypothetical completion has monochromatic P0 AND P1
// K4 lines at different sites, do NOT call both actual winners.
// The phase/color complete-wave is expressly hypothetical after
// first winner. This is NOT minimax or source game WDL evaluation.
import {sourceOriginal7x6TwoOwnerHistoryWaveOverlay}
 from './source-original7x6-two-owner-complete-gravity-wave-overlay.mjs';
function original69Physical(){
 const lines=[],touch=Array.from({length:42},()=>[]);
 const dirs=[{n:'vertical',dx:0,dy:1},{n:'rising',dx:1,dy:1},
  {n:'horizontal',dx:1,dy:0},{n:'falling',dx:1,dy:-1}];
 for(let c=0;c<7;c++)for(let r=0;r<6;r++)for(const d of dirs){
  if(c+3*d.dx<0||c+3*d.dx>=7||r+3*d.dy<0||r+3*d.dy>=6)continue;
  const cells=Array.from({length:4},(_,k)=>(r+k*d.dy)*7+c+k*d.dx);
  const id=lines.length;
  lines.push({orientation:d.n,cells,signature:cells.slice().sort((a,b)=>a-b).join(',')});
  cells.forEach(site=>touch[site].push(id));
 }
 if(lines.length!==69)throw Error('original real 69 K4 lines missing');
 return {lines,touch};
}
function actual32state(G){
 const full='123456123456654321654321123456123456777777';
 const prefix=full.slice(0,32),owner=Array(42).fill(-1),h=Array(7).fill(0);
 for(let ply=0;ply<prefix.length;ply++){
  const c=+prefix[ply]-1,r=h[c]++,site=r*7+c,p=ply%2;
  if(r>=6||owner[site]!==-1)throw Error('actual 7x6 original bad gravity prefix');
  owner[site]=p;
  if(G.touch[site].some(id=>G.lines[id].cells.every(z=>owner[z]===p)))
   throw Error('true original source rank32 prefix has earlier first win');
 }
 return {prefix,full,owner,h};
}
export function independentlyCheckOriginal7x6OwnerLineWaveFirstWinFilter(){
 const src=sourceOriginal7x6TwoOwnerHistoryWaveOverlay(),
  q=src.trueFirstWinFreePhysicalDrawPrefix32,
  G=original69Physical(),state=actual32state(G),
  owner=state.owner,h=state.h,sourceLine=new Map(q.exactTwoOwnerK4JointLineWave.map(
   L=>[L.originalPhysicalSites.slice().sort((a,b)=>a-b).join(','),L])),
  errors=[],completeByOwner={P0:0,P1:0,DRAW:0},
  pairOverlap={neither:0,onlyP0:0,onlyP1:0,bothOwners:0},
  firstOwner={P0:0,P1:0,DRAW:0},
  firstWinLineByOwner=[Array(69).fill(0),Array(69).fill(0)],
  finalMonoLineByOwner=[Array(69).fill(0),Array(69).fill(0)],
  firstWinnerPlyDistribution={},firstWinnerMultiplicity={},
  earlierTerminalCompleteScheduleCount={value:0};
 let fullSuffixCount=0;
 const path=[];
 function visit(depth,win){
  if(depth===10){
   fullSuffixCount++;
   let has0=false,has1=false;
   for(let j=0;j<69;j++){
    const L=G.lines[j],v=owner[L.cells[0]];
    if(L.cells.every(z=>owner[z]===v)){
     finalMonoLineByOwner[v][j]++;
     if(v===0)has0=true;else has1=true;
    }
   }
   const key=has0?(has1?'bothOwners':'onlyP0'):
     has1?'onlyP1':'neither';
   pairOverlap[key]++;
   if(!win) {
    firstOwner.DRAW++;
    if(has0||has1)errors.push('original physical had full win but no earlier first win');
   } else {
    const name=win.owner===0?'P0':'P1';
    firstOwner[name]++;
    const k=String(win.ply);
    firstWinnerPlyDistribution[k]=(firstWinnerPlyDistribution[k]??0)+1;
    firstWinnerMultiplicity[win.lines.length]=(firstWinnerMultiplicity[win.lines.length]??0)+1;
    if(win.ply<42)earlierTerminalCompleteScheduleCount.value++;
    for(const lineID of win.lines)firstWinLineByOwner[win.owner][lineID]++;
   }
   return;
  }
  for(let col=0;col<7;col++)if(h[col]<6){
   const row=h[col],site=row*7+col,moveOwner=(32+depth)%2;
   h[col]++;owner[site]=moveOwner;path.push(col+1);
   let first=win;
   if(!first) {
    const lines=G.touch[site].filter(id=>
     G.lines[id].cells.every(z=>owner[z]===moveOwner));
    if(lines.length)first={owner:moveOwner,ply:33+depth,lines};
   }
   visit(depth+1,first);
   path.pop();h[col]--;owner[site]=-1;
  }
 }
 visit(0,null);
 const sum=a=>a.reduce((x,y)=>x+y,0);
 if(fullSuffixCount!==5040||sum(Object.values(pairOverlap))!==5040||
    sum(Object.values(firstOwner))!==5040)
  errors.push('all5040 physical interleavings not classified into exclusive partitions');
 let waveLineRationalChecks=0;
 const byOrientation={};
 for(const ownerID of [0,1]){
  for(let j=0;j<69;j++){
   const line=G.lines[j],source=sourceLine.get(line.signature);
   if(!source){errors.push('source line missing from firstwin checker original69');continue}
   const num=BigInt(ownerID===0?source.P0FullLineNumerator:source.P1FullLineNumerator),
    den=BigInt(source.compressedUniformCompleteShuffleCount);
   if(BigInt(finalMonoLineByOwner[ownerID][j])*den!==num*BigInt(fullSuffixCount))
    errors.push({type:'ORIGINAL_COMPLETE_OWNER_WAVE_DIFFERS_FROM_SOURCE',j,ownerID});
   waveLineRationalChecks++;
   const ori=line.orientation;
   if(!byOrientation[ori])byOrientation[ori]={P0Complete:0,P1Complete:0,
      P0First:0,P1First:0};
   byOrientation[ori][ownerID===0?'P0Complete':'P1Complete']+=finalMonoLineByOwner[ownerID][j];
   byOrientation[ori][ownerID===0?'P0First':'P1First']+=firstWinLineByOwner[ownerID][j];
  }
 }
 const totalCompleteLineEvents=[sum(finalMonoLineByOwner[0]),sum(finalMonoLineByOwner[1])],
  totalFirstWinLineEvents=[sum(firstWinLineByOwner[0]),sum(firstWinLineByOwner[1])];
 const topFirst=[];for(let j=0;j<69;j++)if(firstWinLineByOwner[0][j]||firstWinLineByOwner[1][j])
  topFirst.push({originalPhysicalSites:G.lines[j].cells,orientation:G.lines[j].orientation,
   P0FirstLineCount:firstWinLineByOwner[0][j],P1FirstLineCount:firstWinLineByOwner[1][j],
   completeP0Count:finalMonoLineByOwner[0][j],completeP1Count:finalMonoLineByOwner[1][j]});
 topFirst.sort((a,b)=>
  Math.abs(b.P0FirstLineCount-b.P1FirstLineCount)-
  Math.abs(a.P0FirstLineCount-a.P1FirstLineCount));
 return {status:errors.length?'TRUE7X6_OWNER_OVERLAY_FIRSTWIN_FILTER_FAILED':
    'INDEPENDENT_ORIGINAL7X6_5040_OWNER_WAVE_OVERLAP_AND_FIRSTWIN_FILTER_PASS',
  originalBoard:[7,6,4],genuineOriginalFirstWinFreePrefix:state.prefix,
  hypotheticalFullGravityScheduleCount:fullSuffixCount,
  originalGeometricWinningLines:G.lines.length,
  physicalCompleteOwnerLineSupportPattern:pairOverlap,
  physicalActualFirstWinnerUnderUniformCompleteSchedulePushforward:firstOwner,
  numberOfCounterfactualFullSuffixesWithFirstWinBeforePhysicalEnd:earlierTerminalCompleteScheduleCount.value,
  firstWinAbsolutePlyHistogram:firstWinnerPlyDistribution,
  multipleSameMoveWinningLinesHistogram:firstWinnerMultiplicity,
  ownerLineEventCountsUnderHypotheticalFullColor:[...totalCompleteLineEvents],
  ownerLineEventCountsAfterRealFirstWinAbsorption:[...totalFirstWinLineEvents],
  originalOrientationOverlayWaves:byOrientation,
  completeOwnerWavesAgreedWithEarlierPureSourceRationalCountChecks:waveLineRationalChecks,
  strongestSignedAbsorbingFirstWinLines:topFirst.slice(0,12),
  completedColoringBothOwnersCanHaveFourLinesWhileActualWinnerUnique:pairOverlap.bothOwners>0,
  noAdversarialStrategyWDLComputed:true,
  completeSchedulePushforwardNotUniformActualTerminalHistoryMeasure:true,
  sourceFutureGameValueSearches:0,
  errors:errors.slice(0,12)};
}
