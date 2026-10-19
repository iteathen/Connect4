// TRUE W7 H6 K4 only. Exact Fourier-after-four-ribbon unfolding
// of original physical cells. This is a geometry/spectral representation,
// NOT four independent games, not a new WDL, not an algorithm for
// strategic future game state valuation, not a toroidal Connect4 game.
// Frozen math: docs/research/2026-10-19-standard7x6-four-ribbon-first-Fourier-directional-convolution-and-cell-gluing.md
export function sourceTrue7x6FourRibbonFirstFourierFrame(){
 const W=7,H=6,K=4,N=W*H,id=(c,r)=>r*W+c;
 const strands=[];
 function add(orientation,label,cells){
  strands.push({orientation,label,length:cells.length,cells,
   K4Windows:cells.length>=4?
    Array.from({length:cells.length-3},(_,t)=>cells.slice(t,t+4)):[],
   validK4WindowStartCount:Math.max(0,cells.length-3)});
 }
 // 6 horizontal original rows, ordered LEFT-to-RIGHT.
 for(let r=0;r<H;r++)add('horizontal','r='+r,
  Array.from({length:W},(_,c)=>id(c,r)));
 // 7 original gravity columns, ordered BOTTOM-to-TOP.
 for(let c=0;c<W;c++)add('vertical','c='+c,
  Array.from({length:H},(_,r)=>id(c,r)));
 // Rising slope +1, sorted by physical c increasing.
 for(let diag=-(H-1);diag<W;diag++){
  const cells=[];
  for(let c=0;c<W;c++){const r=c-diag;if(r>=0&&r<H)cells.push(id(c,r))}
  add('rising','c-r='+diag,cells);
 }
 // Falling slope -1, sorted by physical c increasing.
 for(let sum=0;sum<=W+H-2;sum++){
  const cells=[];
  for(let c=0;c<W;c++){const r=sum-c;if(r>=0&&r<H)cells.push(id(c,r))}
  add('falling','c+r='+sum,cells);
 }
 if(strands.length!==37)throw Error('exact original standard 37 ribbons missing');
 let appearances=0,winlines=0,active=0,activeAppears=0,
  correctionRank=0,aliasCounts=Array(N).fill(0),witnessLengths={};
 function rankReal(m){
  const a=m.map(row=>row.slice());
  let i=0;const cols=a[0].length;
  for(let j=0;j<cols&&i<a.length;j++){
   let p=i;while(p<a.length&&Math.abs(a[p][j])<1e-9)p++;
   if(p===a.length)continue;
   [a[i],a[p]]=[a[p],a[i]];
   const v=a[i][j];
   for(let k=j;k<cols;k++)a[i][k]/=v;
   for(let r=i+1;r<a.length;r++){
    const f=a[r][j];
    for(let k=j;k<cols;k++)a[r][k]-=f*a[i][k];
   }
   i++;
  }
  return i;
 }
 const boundaryDetails=[];
 for(const s of strands){
  const l=s.length;
  witnessLengths[l]=(witnessLengths[l]??0)+1;
  appearances+=l;winlines+=s.K4Windows.length;
  s.cells.forEach(z=>aliasCounts[z]++);
  if(l<K)continue;
  active++;activeAppears+=l;
  const C=Array.from({length:l},(_,t)=>
   Array.from({length:l},(_,x)=>
    [0,1,2,3].some(j=>(t+j)%l===x)?1:0));
  const corrected=Array.from({length:l},(_,t)=>
   t<=l-K?Array(l).fill(0):C[t].slice());
  const rank=rankReal(corrected);
  correctionRank+=rank;
  boundaryDetails.push({orientation:s.orientation,label:s.label,l,
   validFourWindowStarts:l-K+1,rankOfDiscardedCircularFourTaps:rank,
   invalidWrapOutputRows:3,
   FourierMultiplier:'lambda_k=sum_j=0..3 exp(-2pi i k j/l)'});
 }
 if(appearances!==168||winlines!==69||active!==25||activeAppears!==144||
   correctionRank!==67||aliasCounts.some(c=>c!==4))
  throw Error('source ribbon/alias/spectral boundary count mismatch');
 const windows=[];
 for(const s of strands)for(let t=0;t<s.K4Windows.length;t++)
  windows.push({orientation:s.orientation,strand:s.label,start:t,
   originalPhysicalIDs:s.K4Windows[t]});
 return {
  status:'SOURCE_STANDARD7X6_FOUR_RIBBON_FIRST_FOURIER_FRAME',
  originalGame:{W,H,K,firstWinStopped:true},
  originalPhysicalCells:42,originalDirectionStrands:strands.length,
  directionCounts:Object.fromEntries(['horizontal','vertical','rising','falling'].map(d=>
   [d,strands.filter(s=>s.orientation===d).length])),
  originalFourRibbonAppearances:appearances,
  originalAliasedPhysicalCellAppearanceCount:aliasCounts,
  exactAliasFrameGram:'M_transpose M=4 I_42',
  exactAliasFrameIsometry:'M/2',
  liftedPhysicalSubspaceRank:42,liftedInvalidAliasDegreesOfFreedom:126,
  originalValidK4WinningIntervals:windows.length,
  activeK4Strands:active,activeK4AppearanceCount:activeAppears,
  shortDiagonalNoK4AppearanceCount:appearances-activeAppears,
  originalDirectionWinningIntervalCounts:Object.fromEntries(['horizontal','vertical','rising','falling'].map(d=>
   [d,windows.filter(w=>w.orientation===d).length])),
  strandLengthHistogram:witnessLengths,
  strandBoundaryDetails:boundaryDetails,
  circularBoxcarFullOperator:'C_l[v](t)=sum_j=0..3 v[(t+j) mod l]',
  trueNonWrappedK4WindowOperator:'W_l=Q_l C_l, Q_l masks last3 circular wrap outputs',
  K4CircularFourierSymbol:'lambda_l(k)=sum_j=0..3 exp(-2pi i k j/l)',
  exactTotalDroppedCircularBoundaryRank:correctionRank,
  actualGameGravityRetainedInOriginalColumnHeightVector:true,
  originalStrands:strands,originalK4Windows:windows,
  sourceStrategicWDL:null,sourceFutureGameQValuesComputed:0,
  sourceQuantumHardwareSpeedupClaimed:false
 };
}
