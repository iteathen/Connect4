// ORIGINAL W7 H6 K4 physical-cell geometric SHIFT operators only.
// No game move policies, ownership, future-value valuation or another
// board dimension. Finite board RIGHT/UP/DOWN shifts are TRUNCATED.
 // R = right+up, F=right+down, their commutator is
// [R,F]=X^2(P_top-P_bottom), 10 rank-one actions by boundary site.
export function sourceTrue7x6DirectionalBoundaryCurvature(){
 const W=7,H=6,K=4,N=42,index=(c,r)=>r*W+c;
 function T(dx,dy){
  const A=Array.from({length:N},()=>Array(N).fill(0));
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){
   const x=c+dx,y=r+dy;
   if(x>=0&&x<W&&y>=0&&y<H)A[index(x,y)][index(c,r)]=1;
  }
  return A;
 }
 const X=T(1,0),U=T(0,1),D=T(0,-1),
  Rising=T(1,1),Falling=T(1,-1);
 function prod(A,B){
  const Z=Array.from({length:N},()=>Array(N).fill(0));
  for(let i=0;i<N;i++)for(let k=0;k<N;k++)if(A[i][k])
   for(let j=0;j<N;j++)if(B[k][j])Z[i][j]+=A[i][k]*B[k][j];
  return Z;
 }
 function sub(A,B){return A.map((row,i)=>row.map((v,j)=>v-B[i][j]))}
 function comm(A,B){return sub(prod(A,B),prod(B,A))}
 const exactRF=comm(Rising,Falling),exactUF=comm(U,Falling);
 const expectedRF=Array.from({length:N},()=>Array(N).fill(0)),
  expectedUF=Array.from({length:N},()=>Array(N).fill(0));
 for(let c=0;c<W-2;c++){
  expectedRF[index(c+2,0)][index(c,0)]=-1;
  expectedRF[index(c+2,H-1)][index(c,H-1)]=1;
 }
 for(let c=0;c<W-1;c++){
  expectedUF[index(c+1,0)][index(c,0)]=-1;
  expectedUF[index(c+1,H-1)][index(c,H-1)]=1;
 }
 const eq=(A,B)=>A.every((r,i)=>r.every((v,j)=>v===B[i][j]));
 if(!eq(Rising,prod(X,U))||!eq(Falling,prod(X,D))||
   !eq(exactRF,expectedRF)||!eq(exactUF,expectedUF)||
   !eq(comm(X,Rising),sub(X,X))||!eq(comm(X,Falling),sub(X,X))||
   !eq(comm(U,Rising),sub(X,X)))
  throw Error('original physical diagonal finite-shift algebra contradictory');
 const steps=[];
 for(let col=0;col<N;col++){
  const out=[];
  for(let r=0;r<N;r++)if(exactRF[r][col]!==0)
   out.push({targetPhysicalSiteID:r,weight:exactRF[r][col]});
  if(out.length)steps.push({inputPhysicalSiteID:col,output:out});
 }
 const nonzeroColumns=steps.length;
 if(nonzeroColumns!==10)throw Error('exact original diagonal commutator boundary expected 10');
 const allZeroEigenvaluesBecauseStrictRightwardShift=true;
 return {
  status:'SOURCE_STANDARD7X6_GEOMETRIC_DIAGONAL_BOUNDARY_COMMUTATOR',
  originalGame:[W,H,K],physicalCellCount:N,
  originalShiftAlgebra:{
   rightX:'X|c,r>=|c+1,r> if c<6, otherwise0',
   upU:'U|c,r>=|c,r+1> if r<5, otherwise0',
   downD:'D|c,r>=|c,r-1> if r>0, otherwise0',
   risingR:'R=XU',
   fallingF:'F=XD',
   verticalBoundaryCommutator:'[U,D]=P_top-P_bottom',
   diagonalBoundaryCommutator:'[R,F]=X^2(P_top-P_bottom)',
   mixedBoundaryCommutator:'[U,F]=X(P_top-P_bottom)',
   remainingCommutatorsZero:['[X,R]','[X,F]','[U,R]']
  },
  expectedRankOriginalCommutatorR_F:nonzeroColumns,
  expectedRankOriginalCommutatorU_F:12,
  physicalBasisActionsWithNonzeroRF:steps,
  actualNonzeroRFMatrixEntries:steps.length,
  originalBoundaryRowsOnly:[0,H-1],
  nilpotentR_FPower4Zero:allZeroEigenvaluesBecauseStrictRightwardShift,
  allDiagonalCommutatorEigenvaluesZeroDespiteNonzeroOperator:true,
  notTheCommutatorOfP0P1GameMoves:true,
  sourceGameWDLOrBest:null,
  sourceStrategicGameSearches:0
 };
}
