// SOURCE ORIGINAL W7,H6,K4 ONLY. Geometry-contrast reference:
// exactly 69 actual finite original K4 lines vs 168 CANDIDATE
// Fourier-cyclic torus four-window paths in the SAME 7x6 rectangle;
// 99 wrapped toroidal windows are intentionally INVALID game lines.
// Never change Connect4 rules, game size, first-win or gravity.
export function sourceOriginal7x6K4FlatPeriodicContrast(){
 const W=7,H=6,K=4,dirs=[
  {name:'horizontal',dx:1,dy:0},{name:'vertical',dx:0,dy:1},
  {name:'rising',dx:1,dy:1},{name:'falling',dx:1,dy:-1}];
 const original=[],fakeTorus=[];
 for(const d of dirs)for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const endX=x+3*d.dx,endY=y+3*d.dy;
  const valid=endX>=0&&endX<W&&endY>=0&&endY<H;
  const modulo=(v,m)=>(v%m+m)%m;
  const cells=Array.from({length:K},(_,j)=>modulo(y+j*d.dy,H)*W+modulo(x+j*d.dx,W));
  const record={orientation:d.name,startPhysicalZeroBased:[x,y],
   originalPhysicalIds:cells,wrapsRealBoundary:!valid};
  fakeTorus.push(record);
  if(valid)original.push(record);
 }
 const directionStats=Object.fromEntries(dirs.map(d=>{
  const num=fakeTorus.filter(x=>x.orientation===d.name).length,
   actual=original.filter(x=>x.orientation===d.name).length;
  return [d.name,{periodicCandidates:num,validOriginalK4Windows:actual,
   physicallyIllegalWrappedWindows:num-actual}];
 }));
 const totalWrapped=fakeTorus.filter(x=>x.wrapsRealBoundary).length;
 if(fakeTorus.length!==168||original.length!==69||totalWrapped!==99)
  throw Error('flat transform original K4 wrap count wrong');
 return {status:'SOURCE_STANDARD7X6_PERIODIC_WRAP_TERMINAL_OBSTRUCTION',
  originalBoard:[W,H,K],actualOriginalK4Windows:original.length,
  periodicNotActuallyLegalK4Candidates:fakeTorus.length,
  physicallySpuriousToroidalK4Windows:totalWrapped,
  directionalK4Counts:directionStats,
  originalK4Windows:original,
  deliberatelyFakePeriodicK4Candidates:fakeTorus,
  type:'GEOMETRIC_PERIODIZATION_NEGATIVE_CONTROL_NOT_ALTERNATIVE_GAME',
  sourceGameWDLQueries:0,sourceQuantumSpeedupClaim:false};
}
