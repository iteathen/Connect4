// SOURCE ONLY original Connect4 W=7,H=6,K=4, genuine
// first-win-free canonical q after 44444, P1 to move.
// 21 current-action raw winning-generator role-exchange incidence
// vectors are the GF2 coboundary of seven root-action potentials.
// Six independent canonical differences generate all 21.
import {sourceCanonical44444PauliSplitCofactors} from './source-canonical44444-Pauli-split-cofactors.mjs';
export function sourceCanonical44444SixFourierDifferences(){
 const q=sourceCanonical44444PauliSplitCofactors(),h=q.originalPrefix.h;
 const W=7,H=6,K=4, R0=q.R0.map(BigInt),R1=q.R1.map(BigInt),
  requirements=R0.concat(R1);
 if(h.length!==W||h[3]!==5||R0.length!==48||R1.length!==42)
  throw Error('SOURCE original real canonical 44444 q wrong');
 const landing=h.map((r,c)=>r*W+c);
 const m0=R0.map(()=>0n),m1=R1.map(()=>0n);
 const buildPotential=(req)=>landing.map(site=>
  req.reduce((acc,G,j)=>acc|((G&(1n<<BigInt(site)))?
   (1n<<BigInt(j)):0n),0n));
 const potential0=buildPotential(R0),potential1=buildPotential(R1),
  potential=buildPotential(requirements);
 const ranks=(vectors,n)=>{
  const pivots=Array(n).fill(null);let r=0;
  for(let v of vectors)for(let b=n-1;b>=0&&v;b--){
   const m=1n<<BigInt(b);
   if((v&m)===0n)continue;
   if(pivots[b]!==null)v^=pivots[b];
   else{pivots[b]=v;r++;break;}
  }
  return r;
 };
 const base=potential.map(v=>v^potential[0]);
 const base0=potential0.map(v=>v^potential0[0]);
 const base1=potential1.map(v=>v^potential1[0]);
 const edges=[],observedHamming=[];
 const pop=n=>{let t=0;for(let v=n;v;v&=v-1n)t++;return t};
 for(let a=0;a<W;a++)for(let b=a+1;b<W;b++){
  const direct=potential[a]^potential[b];
  const rebuilt=base[a]^base[b];
  if(direct!==rebuilt)throw Error('six-generator source Fourier edge reconstruction mismatch');
  edges.push({actionA:a+1,actionB:b+1,
   physicalSiteA:landing[a],physicalSiteB:landing[b],
   oddOriginalR0GeneratorCount:pop(potential0[a]^potential0[b]),
   oddOriginalR1GeneratorCount:pop(potential1[a]^potential1[b]),
   oddAllOriginal90GeneratorCount:pop(direct),
   rawSourceGF2OddIncidenceMaskHex:'0x'+direct.toString(16),
   staticOriginalFutureGameValuesQueried:0});
  observedHamming.push(pop(direct));
 }
 let triangleChecks=0;
 for(let a=0;a<7;a++)for(let b=a+1;b<7;b++)
  for(let c=b+1;c<7;c++){
   const test=(potential[a]^potential[b])^(potential[b]^potential[c])^
     (potential[a]^potential[c]);
   if(test!==0n)throw Error('root action Fourier coboundary nonzero curl');
   triangleChecks++;
  }
 const E=edges.map(e=>BigInt(e.rawSourceGF2OddIncidenceMaskHex));
 const E0=[];const E1=[];
 for(let a=0;a<W;a++)for(let b=a+1;b<W;b++){
  E0.push(potential0[a]^potential0[b]);
  E1.push(potential1[a]^potential1[b]);
 }
 return {
  status:'SOURCE_STANDARD7X6_CANONICAL_FOURIER_SIX_RANK_ROOT_EXCHANGE',
  originalDimensions:{W,H,K},
  originalFirstWinFreePrefix:'44444',currentPlayer:'P1',
  originalRootR0:R0.length,originalRootR1:R1.length,
  originalRootLandingPhysicalSiteIds:landing,
  original90WinningGeneratorIncidencePotentials:potential.map(v=>'0x'+v.toString(16)),
  sourceSixCanonicalDifferenceBasis:base.slice(1).map(v=>'0x'+v.toString(16)),
  sourceSixBasisP0:base0.slice(1).map(v=>'0x'+v.toString(16)),
  sourceSixBasisP1:base1.slice(1).map(v=>'0x'+v.toString(16)),
  sourceOriginalPerActionWinningGeneratorHits:potential.map(pop),
  sourceOriginalWidth7ActionPotentialRank:ranks(potential,90),
  originalAll90EdgeRank:ranks(E,90),
  originalP0OnlyEdgeRank:ranks(E0,R0.length),
  originalP1OnlyEdgeRank:ranks(E1,R1.length),
  originalRootUnorderedDifferentActions:edges.length,
  exactTriangleSourceCocyclesChecked:triangleChecks,
  independentGF2RawExchangeDirections:6,
  dependentEdgeDirections:edges.length-6,
  all21OddIncidenceVectorsNonzero:E.every(v=>v!==0n),
  originalEdgeHammingWeights:observedHamming,
  originalRawWinningGeneratorEdgeIncidence:edges,
  strategicRoleExchangeNonlinearR_Q_Conjugacy:'NOT_PROVED_BY_GF2',
  ordinaryOriginalWDL:null,sourceOptimalAction:null,
  sourceFutureOriginalGameStatesEvaluated:0,sourceWDLQueries:0
 };
}
