// SOURCE-ONLY Fourier decomposition of one of the ACTUAL seven
// original W7,H6,K4 gravity columns, height register |h>, h=0..6.
// h has SEVEN local levels; this is NOT testing a 7x7 game board.
// True partial raise S|6>=0, versus INVALID cyclic wrap C|6>=|0>.
// Exact identity S = C - |0><6|; after F7 Fourier transform,
// F S F^† (k,l) = delta(k,l)omega^k - omega^l/7,
// omega=exp(2pi i/7). Defect has matrix rank exactly one.
// No game q WDL values and no alternate board shapes.
export function sourceTrue7x6HeightFourierBoundary(){
 const W=7,H=6,K=4,levels=H+1,sourceH=[0,0,0,5,0,0,0];
 const S=Array.from({length:levels},()=>Array(levels).fill(0));
 const C=Array.from({length:levels},()=>Array(levels).fill(0));
 const B=Array.from({length:levels},()=>Array(levels).fill(0));
 for(let h=0;h<levels;h++){
  C[(h+1)%levels][h]=1;
  if(h<H)S[h+1][h]=1;
 }
 B[0][H]=1;
 for(let i=0;i<levels;i++)for(let j=0;j<levels;j++)
  if(S[i][j]!==C[i][j]-B[i][j])
   throw Error('true original legal gravity truncated raise != cyclic minus top defect');
 const analyticFourier=Array.from({length:levels},(_,k)=>
  Array.from({length:levels},(_,l)=>({
   rowFourierIndex:k,columnFourierIndex:l,
   deltaDiagonalCoefficient:(k===l?1:0),
   deltaDiagonalRootOfUnityExponent:k,
   boundaryCorrectionNumerator:-1,
   boundaryCorrectionDenominator:7,
   boundaryRootOfUnityExponent:l
  })));
 return {
  status:'SOURCE_ORIGINAL7X6_LOCAL_HEIGHT_DFT_RANK_ONE_FULL_COLUMN_DEFECT',
  originalDimensions:{W,H,K},
  localPhysicalColumnHeightLevels:7,
  physicalHeightOnlyTensorProductStates:823543,
  trueOriginalHeightAtCanonical44444:sourceH,
  trueOriginalLegalRootActionColumns:sourceH.map((v,c)=>v<H?c+1:null).filter(Boolean),
  realRaiseNilpotentIndex:7,
  invalidCyclicWrapPeriod:7,
  cyclicWrapIsNotRealGameAction:true,
  exactIntegerMatrices:{S,C,B},
  analyticSevenRootFourierFormula:'F S F_dagger [k,l]=delta(k,l)*omega^k-omega^l/7',
  analyticSevenRootCoefficients:analyticFourier,
  heightOnlyFourierDoesNotEncodeSourceR0R1:true,
  sourceFutureGameStatesValued:0,sourceGameWDL:null,
  sourceQuantumStatevectorBuilt:false
 };
}
