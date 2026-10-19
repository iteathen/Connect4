// Independent ORIGINAL 7x6 K4 first-win-stopped physical replay of one
// proven legal 42-drop DRAW, then intentionally INVALID periodic QFT
// wrap-win detection on same physical P0/P1 coloring. All actual
// Connect4 winlines are generated nonperiodically and examined at
// every move BEFORE any fake torus lines are considered.
import {sourceOriginal7x6K4FlatPeriodicContrast}
 from './source-true7x6-flat-torus-wrapped-K4-contrast.mjs';
function original7x6PhysicalWins(){
 const L=[];
 for(let y=0;y<6;y++)for(let x=0;x<7;x++)
  for(const [name,dc,dr] of [['horizontal',1,0],['vertical',0,1],['rising',1,1],['falling',1,-1]]){
   const tx=x+3*dc,ty=y+3*dr;
   if(tx<0||tx>=7||ty<0||ty>=6)continue;
   const cells=Array.from({length:4},(_,i)=>(y+i*dr)*7+x+i*dc);
   L.push({name,cells,start:[x,y]});
  }
 if(L.length!==69)throw Error('incorrect original real K4 count');
 return L;
}
function wrongPeriodicFourWindows(){
 const W=7,H=6,lines=[],mod=(x,n)=>(x%n+n)%n;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)
  for(const [name,dc,dr] of [['horizontal',1,0],['vertical',0,1],['rising',1,1],['falling',1,-1]]){
   const cells=Array.from({length:4},(_,i)=>(mod(y+i*dr,H)*W+mod(x+i*dc,W)));
   const wrap=(x+3*dc<0||x+3*dc>=W||y+3*dr<0||y+3*dr>=H);
   lines.push({name,start:[x,y],cells,illegalWrappedGameLine:wrap});
  }
 return lines;
}
export function independentOriginal7x6FlatFourierFalseWinDrawControl(){
 const source=sourceOriginal7x6K4FlatPeriodicContrast(),
  original=original7x6PhysicalWins(),periodic=wrongPeriodicFourWindows(),
  errors=[],word='123456123456654321654321123456123456777777';
 const h=Array(7).fill(0),board=Array(42).fill(-1);
 const dirnames=['horizontal','vertical','rising','falling'];
 for(let ply=0;ply<word.length;ply++){
  const c=Number(word[ply])-1,owner=ply%2,r=h[c],id=r*7+c;
  if(!Number.isInteger(c)||c<0||c>=7||r>=6||board[id]!==-1){
   errors.push({kind:'ORIGINAL_ALTERNATING_GRAVITY_ILLEGAL',ply:ply+1});break;
  }
  h[c]++;board[id]=owner;
  const premature=original.find(L=>L.cells.includes(id)&&L.cells.every(z=>board[z]===owner));
  if(premature)errors.push({kind:'CONSTRUCTIVE_DRAW_HAS_PREMATURE_REAL_WIN',
   ply:ply+1,owner,line:premature});
 }
 const fakeWins=[],originalFinalWins=[];
 if(h.some(x=>x!==6)||word.length!==42)
  errors.push({kind:'PHYSICAL_ORIGINAL_DRAW_NOT_FULL'});
 for(const line of original){
  if(line.cells.every(z=>board[z]===board[line.cells[0]]))
   originalFinalWins.push(line);
 }
 for(const line of periodic){
  if(line.cells.every(z=>board[z]===board[line.cells[0]]))
   fakeWins.push({orientation:line.name,initialPhysicalZeroBased:line.start,
    unwrappedOriginalK4Valid:!line.illegalWrappedGameLine,
    owner:board[line.cells[0]]===0?'P0':'P1',
    physicalIdsTraversedModuloOriginalBounds:line.cells});
 }
 const srcStats=source.directionalK4Counts,independentCounts={};
 for(const name of dirnames){
  const a=periodic.filter(L=>L.name===name),
   real=original.filter(L=>L.name===name);
  independentCounts[name]={
   allCyclicProjections:a.length,
   trulyValidOriginalK4Windows:real.length,
   physicallySpuriousWraps:a.filter(L=>L.illegalWrappedGameLine).length,
   cyclicMonoP0FalseWins:fakeWins.filter(L=>L.orientation===name&&L.owner==='P0').length,
   cyclicMonoP1FalseWins:fakeWins.filter(L=>L.orientation===name&&L.owner==='P1').length
  };
  if(independentCounts[name].trulyValidOriginalK4Windows!==srcStats[name].validOriginalK4Windows||
    independentCounts[name].physicallySpuriousWraps!==srcStats[name].physicallyIllegalWrappedWindows)
    errors.push({kind:'INDEPENDENT_DIRECTION_GEOMETRY_DIFFERENT',name});
 }
 if(periodic.length!==168||original.length!==69||periodic.filter(x=>x.illegalWrappedGameLine).length!==99)
  errors.push({kind:'TOTAL_ORIGINAL_VS_WRAPPED_WINLINE_COUNTS'});
 if(originalFinalWins.length||fakeWins.some(L=>L.unwrappedOriginalK4Valid))
  errors.push({kind:'INVALID_PERIODIC_WINLABEL_SANITY'});
 return {
  status:errors.length?'TRUE7X6_PERIODIC_FOURIER_GEOMETRY_CONTROL_FAIL':
   'INDEPENDENT_TRUE7X6_PERIODIC_QFT_REPORTS_FALSE_WINS_ON_ACTUAL_ORIGINAL_DRAW',
  originalBoard:[7,6,4],
  genuineCompleteFirstWinStoppedMoveWord:word,
  physicalGenuineAlternatingGravityMovesChecked:42,
  originalGeometricK4WinningLines:original.length,
  originalPrematureFirstWins:errors.filter(x=>x.kind==='CONSTRUCTIVE_DRAW_HAS_PREMATURE_REAL_WIN').length,
  originalCompletedK4WinsAtDraw:originalFinalWins.length,
  falsePeriodicPotentialK4Winlines:periodic.length,
  physicallyIllegalWrapWinlines:99,
  actuallyMonochromeFalsePeriodicWindows:fakeWins.length,
  fakePeriodicallyDetectedWinsByDirection:independentCounts,
  sampleFalsePeriodicWinlines:fakeWins.slice(0,12),
  originalFullDrawColoringP0Stones:board.filter(v=>v===0).length,
  originalFullDrawColoringP1Stones:board.filter(v=>v===1).length,
  sourceOriginalGameWDLQueried:0,
  deliberatelyFalsePeriodizationNotValidRules:true,
  otherBoardSizesTested:0,errors:errors.slice(0,10)
 };
}
