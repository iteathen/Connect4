// INDEPENDENT one-column 7-level physical HEIGHT operator check within
// ORIGINAL W7 H6 K4, NOT a different board game. Computes the DFT
// numerically from its definition and separately checks exact integer
// nilpotent/cyclic/defect/parity-relations. Does NOT evaluate WDL.
import {sourceTrue7x6HeightFourierBoundary}
 from './source-true7x6-7level-height-Fourier-boundary.mjs';
function product(A,B){
 const n=A.length,out=Array.from({length:n},()=>Array(n).fill(0));
 for(let i=0;i<n;i++)for(let k=0;k<n;k++)
  if(A[i][k])for(let j=0;j<n;j++)out[i][j]+=A[i][k]*B[k][j];
 return out;
}
function matrixI(n){return Array.from({length:n},(_,i)=>
 Array.from({length:n},(_,j)=>i===j?1:0))}
function matrixIsZero(A){return A.every(row=>row.every(v=>v===0))}
function eq(A,B){return A.every((row,i)=>row.every((v,j)=>v===B[i][j]))}
function complx(re,im){return {re,im}}
function plus(a,b){return complx(a.re+b.re,a.im+b.im)}
function mult(a,b){return complx(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re)}
function conj(a){return complx(a.re,-a.im)}
function hypot(a){return Math.hypot(a.re,a.im)}
export function independentlyValidateTrue7x6SevenHeightFourier(){
 const s=sourceTrue7x6HeightFourierBoundary(),n=7,
  {S,C,B}=s.exactIntegerMatrices,
  errors=[],Tol=2e-14;
 const I=matrixI(n);
 const diffC=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>C[i][j]-B[i][j]));
 if(!eq(diffC,S))errors.push('source original S != C-B');
 let powS=I,powC=I;
 for(let p=0;p<7;p++){powS=product(powS,S);powC=product(powC,C);}
 if(!matrixIsZero(powS)||!eq(powC,I))
  errors.push('physical height nilpotence / invalid cyclic wrap distinction false');
 let defects=0,rankOneMinorsGood=true;
 for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(B[i][j])defects++;
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)
  for(let k=0;k<n;k++)for(let l=k+1;l<n;l++)
   if(B[i][k]*B[j][l]-B[i][l]*B[j][k]!==0)rankOneMinorsGood=false;
 if(defects!==1||!rankOneMinorsGood)errors.push('source wrong rank-one full column boundary');
 // Independent exact original physical parity action identity
 // P|h> = (-1)^h|h>. P S = -S P on each legal shift,
 // even though cyclic C is NOT the same operator.
 let parityTests=0;
 for(let i=0;i<n;i++)for(let j=0;j<n;j++) {
  const pS=(i%2?-1:1)*S[i][j];
  const Sp=S[i][j]*(j%2?-1:1);
  if(pS!==-Sp)errors.push('original height parity raise anticommute false');
  parityTests++;
 }
 // Independent 7-point DFT convention F[k,h] = omega^(k*h)/sqrt(7).
 const F=Array.from({length:n},(_,k)=>Array.from({length:n},(_,h)=>{
  const a=2*Math.PI*k*h/n;
  return complx(Math.cos(a)/Math.sqrt(n),Math.sin(a)/Math.sqrt(n));
 }));
 let maxError=0,entryTests=0,uncorrBoundary=0,examples=[];
 for(let k=0;k<n;k++)for(let l=0;l<n;l++){
  let transformed=complx(0,0),transformedC=complx(0,0);
  for(let a=0;a<n;a++)for(let b=0;b<n;b++){
   const piece=mult(F[k][a],conj(F[l][b]));
   if(S[a][b])transformed=plus(transformed,mult(complx(S[a][b],0),piece));
   if(C[a][b])transformedC=plus(transformedC,mult(complx(C[a][b],0),piece));
  }
  const lambda=complx(Math.cos(2*Math.PI*k/n),Math.sin(2*Math.PI*k/n));
  const bd=complx(Math.cos(2*Math.PI*l/n)/7,Math.sin(2*Math.PI*l/n)/7);
  const expected=plus(k===l?lambda:complx(0,0),mult(complx(-1,0),bd));
  const err=hypot(plus(transformed,mult(complx(-1,0),expected)));
  maxError=Math.max(maxError,err);entryTests++;
  if(err>Tol)errors.push({type:'F7_TRUE_HEIGHT_OPERATOR_MISMATCH',k,l,err});
  // Invalid periodic/cyclic counterpart must be exactly diagonal.
  const cShould=k===l?lambda:complx(0,0);
  if(hypot(plus(transformedC,mult(complx(-1,0),cShould)))>Tol)
   errors.push({type:'F7_CYCLIC_DIAGONAL_CONTROL_FAILED',k,l});
  if(k!==l&&hypot(transformed)>1e-4)uncorrBoundary++;
  if((k===0&&l===0)||(k===0&&l===1)||(k===3&&l===2))
   examples.push({k,l,transformed,expected,absoluteNumericalError:err});
 }
 // Independent K4 canonical 44444 original frontiers,
 // no actual two-player game assumed from height tensor alone.
 const h=Array(7).fill(0);for(let i=0;i<5;i++)h[3]++;
 const legal=h.flatMap((x,c)=>x<6?[c+1]:[]);
 if(legal.length!==7||h[3]!==5||
  JSON.stringify(h)!==JSON.stringify(s.trueOriginalHeightAtCanonical44444))
  errors.push('true canonical rank5 physical support incorrect');
 return {
  status:errors.length?'SOURCE_HEIGHT_FOURIER_PHYSICAL_FAILURE':
    'INDEPENDENT_ORIGINAL7X6_HEIGHT_F7_RANK_ONE_BOUNDARY_PASS',
  gameBoard:[7,6,4],localColumnHeightQuantumLevelCount:7,
  integerPhysicalRaisesS7ExactlyZero:matrixIsZero(powS),
  illegalCyclicWrapC7ExactlyIdentity:eq(powC,I),
  rankOneBoundaryPhysicalFullColumn:true,
  originalPhysicalCanonicalRootLegalActions:legal,
  exactParityAnticommutationIntegerChecks:parityTests,
  FourierTransformMatrixEntriesChecked:entryTests,
  maxFourierNumericalError:maxError,
  offDiagonalEntriesIntroducedByTrueGravityBoundary:uncorrBoundary,
  selectedNumericalMatrixEntries:examples,
  heightOnlyFullBoardTensorDimensions:s.physicalHeightOnlyTensorProductStates,
  lossOfOwnBitHistoryAndSourceR0R1:true,
  quantumHardwareSpeedupNotClaimed:true,
  firstWinnerOrOptimalActionNotInferred:true,
  errors:errors.slice(0,8)
 };
}
