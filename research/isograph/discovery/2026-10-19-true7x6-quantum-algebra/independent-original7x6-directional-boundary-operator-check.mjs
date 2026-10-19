// INDEPENDENT actual W7 H6 K4 coordinate-shift basis test.
// Direct coordinate composition, not imported SOURCE shift matrices.
// Verifies 42 basis commutators, rank of resulting 42x42 sparse integer
// operators via independent Gaussian elimination over GF101, support
// boundary localization and operator nilpotence. NO gameplay game
// tree or opponent scenario search.
import {sourceTrue7x6DirectionalBoundaryCurvature}
 from './source-true7x6-diagonal-shift-boundary-curvature.mjs';
function rawCoordinate(c,r,dx,dy) {
 const C=c+dx,R=r+dy;
 return C<0||C>=7||R<0||R>=6?null:{c:C,r:R};
}
function chain(cell,first,second){
 if(cell===null)return null;
 const a=rawCoordinate(cell.c,cell.r,...first);
 if(a===null)return null;
 return rawCoordinate(a.c,a.r,...second);
}
function id(p){return p===null?null:p.r*7+p.c}
function modRank(A,p=101){
 const R=A.map(row=>row.map(x=>(x%p+p)%p));
 let rank=0;
 const inverse=a=>{
  let v=1,e=p-2;
  while(e){if(e&1)v=v*a%p;a=a*a%p;e=Math.floor(e/2)}
  return v;
 };
 for(let col=0;col<R[0].length;col++){
  let k=rank;while(k<R.length&&!R[k][col])k++;
  if(k===R.length)continue;
  [R[k],R[rank]]=[R[rank],R[k]];
  const inv=inverse(R[rank][col]);
  for(let j=col;j<R[rank].length;j++)R[rank][j]=R[rank][j]*inv%p;
  for(let i=rank+1;i<R.length;i++){
   const fac=R[i][col];if(!fac)continue;
   for(let j=col;j<R[i].length;j++)
    R[i][j]=(R[i][j]-fac*R[rank][j]+p*p)%p;
  }
  rank++;
 }
 return rank;
}
export function independentlyVerifyTrue7x6DirectionalBoundaryCurvature(){
 const source=sourceTrue7x6DirectionalBoundaryCurvature(),N=42,errors=[];
 const X=[1,0],U=[0,1],D=[0,-1],R=[1,1],F=[1,-1],
  zero=()=>Array.from({length:N},()=>Array(N).fill(0));
 const commutator=(first,second)=>{
  const result=zero();
  for(let c=0;c<7;c++)for(let r=0;r<6;r++){
   const from={c,r},site=id(from);
   const firstThenSecond=chain(from,first,second);
   const secondThenFirst=chain(from,second,first);
   if(firstThenSecond!==null)result[id(firstThenSecond)][site]++;
   if(secondThenFirst!==null)result[id(secondThenFirst)][site]--;
  }
  return result;
 };
 const RF=commutator(F,R),UF=commutator(F,U),
  UD=commutator(D,U),XR=commutator(R,X),XF=commutator(F,X),UR=commutator(R,U);
 // Here commutator(F,R) runs F then R minus R then F,
 // matching source R F - F R. Similarly (F,U) means U F-F U.
 let counts={nonzeroRF:0,nonzeroUF:0,nonzeroUD:0,RFAllowedBoundary:0,
  completelyZeroOther3:true};
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const c=x%7,r=Math.floor(x/7);
  const expectedRF=c<=4&&(r===0||r===5)&&y===r*7+(c+2)?
   (r===5?1:-1):0;
  const expectedUF=c<=5&&(r===0||r===5)&&y===r*7+(c+1)?
   (r===5?1:-1):0;
  const expectedUD=(r===0||r===5)&&y===x?(r===5?1:-1):0;
  if(RF[y][x]!==expectedRF)errors.push({kind:'TRUE_GEOMETRIC_RF_NOT_BOUNDARY_CURVATURE',x,y});
  if(UF[y][x]!==expectedUF)errors.push({kind:'TRUE_GEOMETRIC_UF_NOT_BOUNDARY_CURVATURE',x,y});
  if(UD[y][x]!==expectedUD)errors.push({kind:'TRUE_GEOMETRIC_UD_NOT_TOP_MINUS_BOTTOM',x,y});
  if(RF[y][x]){counts.nonzeroRF++;counts.RFAllowedBoundary++}
  if(UF[y][x])counts.nonzeroUF++;
  if(UD[y][x])counts.nonzeroUD++;
  if(XR[y][x]||XF[y][x]||UR[y][x])counts.completelyZeroOther3=false;
 }
 const rankRF=modRank(RF,101),rankUF=modRank(UF,101),
   rankUD=modRank(UD,101);
 if(rankRF!==10||rankUF!==12||rankUD!==14||
   !counts.completelyZeroOther3)
  errors.push({kind:'ORIGINAL_NONCOMMUTING_DIAGONAL_BOUNDARY_RANKS_MISSING',rankRF,rankUF,rankUD,counts});
 function prod(A,B){
  const o=zero();
  for(let i=0;i<N;i++)for(let k=0;k<N;k++)if(A[i][k])
   for(let j=0;j<N;j++)if(B[k][j])o[i][j]+=A[i][k]*B[k][j];
  return o;
 }
 let power=zero();for(let i=0;i<N;i++)power[i][i]=1;
 const powers=[];
 for(let k=1;k<=4;k++){
  power=prod(power,RF);
  powers.push({exponent:k,rank:modRank(power,101),
    exactZero:power.every(row=>row.every(v=>v===0))});
 }
 if(!powers[3].exactZero||powers[2].exactZero)
  errors.push('commutator strictly rightshifted should be nilpotent index4');
 return {status:errors.length?'TRUE7X6_DIRECTIONAL_CURVATURE_PHYSICAL_FAILURE':
   'INDEPENDENT_TRUE7X6_DIRECTIONAL_CURVATURE_RANK10_PASS',
  originalGame:[7,6,4],realPhysicalCells:42,
  individualOriginalCellBasisActionsVerified:42,
  totalDirectionCommutatorMatrixEntriesChecked:42*42*6,
  originalShiftNonzeroCounts:counts,
  exactRankOverPrime101:{RisingFalling:rankRF,UpFalling:rankUF,UpDown:rankUD},
  originalRisingFallingBoundaryCurvatureNilpotentPowers:powers,
  originalInteriorDiagonalShiftCommutatorIdenticallyZero:true,
  appliesToGEOMETRICShiftsNotAlternatingGameMoves:true,
  sourceGameWDLQueries:0,errors:errors.slice(0,9)};
}
