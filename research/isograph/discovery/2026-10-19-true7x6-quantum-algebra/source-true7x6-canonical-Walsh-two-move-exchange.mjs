// SOURCE-ONLY finite difference / Fourier support theorem census at
// TRUE original standard7x6 K4 q=44444 P1-to-move. Builds NO future
// strategic q successor, WDL, opponent policy or game search tree.
// On each of 21 CURRENT legal original landing pairs x,y, the role
// assignment swap between P1x,P0y vs P1y,P0x has Fourier difference
// f(-,+)-f(+,-)=2(C-B), when f=A+B z_x+C z_y+D z_x z_y.
// Only Fourier terms with ODD incidence among x,y survive; the D
// mixed coupling cancels identically. Static original R_p generator
// masks identify possible raw-cofactor sources by XOR incidence.
import {sourceCanonical44444PauliSplitCofactors}
 from './source-canonical44444-Pauli-split-cofactors.mjs';
export function sourceTrue7x6CanonicalWalshTwoMoveExchange(){
 const q=sourceCanonical44444PauliSplitCofactors();
 const h=q.originalPrefix.h,R0=q.R0.map(BigInt),R1=q.R1.map(BigInt);
 if(h.length!==7||h[3]!==5||R0.length!==48||R1.length!==42)
  throw Error('true 7x6 K4 q canonical source mismatch');
 const bit=z=>1n<<BigInt(z),pairs=[];
 for(let a=0;a<7;a++)for(let b=a+1;b<7;b++){
  const x=h[a]*7+a,y=h[b]*7+b,mx=bit(x),my=bit(y);
  function describe(req){
   let none=0,both=0,odd=0,exactlyX=0,exactlyY=0;
   for(const G of req){
    const gx=(G&mx)!==0n,gy=(G&my)!==0n;
    if(gx&&gy)both++;
    else if(gx){odd++;exactlyX++}
    else if(gy){odd++;exactlyY++}
    else none++;
   }
   return {originalRequirements:req.length,evenNeither:none,
    evenBoth:both,oddIncidence:odd,onlyX:exactlyX,onlyY:exactlyY};
  }
  pairs.push({
   originalFirstColumn:a+1,originalOtherColumn:b+1,
   originalCurrentLandingX:x,originalCurrentLandingY:y,
   sourceP0ResidualIncidence:describe(R0),
   sourceP1ResidualIncidence:describe(R1),
   sourceHamiltonianHeightShiftTwoMovesCommuting:true,
   originalOwnerAssignmentsNotIdentical:true,
   FourierOppositeMoverRoleExchangeCoefficient:'2*(C-B), mixed D cancels',
   sourceFutureQMaterialized:0,sourceGameValueQueries:0
  });
 }
 return {
  status:'SOURCE_TRUE7X6_CANONICAL_WALSH_ODD_INCIDENCE_21_PAIRS',
  originalBoard:[7,6,4],
  actualPrefix:'44444',
  currentMover:'P1',
  rootLiteralColumns:[1,2,3,4,5,6,7],
  countUnorderedLegalOriginalLandingPairs:pairs.length,
  rootOriginalR0:R0.length,rootOriginalR1:R1.length,
  pairs,
  linearMultilinearFourierExchangeTheorem:
   'f(z_x=-1,z_y=+1)-f(z_x=+1,z_y=-1)=2(C-B) for f=A+B z_x+C z_y+D z_x z_y',
  strictGameBoundary:
   'Source is a STATIC q cofactor/Fourier support comparison. Future actual game first-win stops have precedence; no payoff or strategy-value relation asserted.',
  sourceFutureStrategicQStatesConstructed:0,sourceAlternativeWDLValuesComputed:0
 };
}
