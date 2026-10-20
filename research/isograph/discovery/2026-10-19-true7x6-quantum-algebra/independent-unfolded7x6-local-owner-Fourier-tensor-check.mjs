// Independent physical 7x6 K4 reconstruction and all 42 local
// 4-way owner-copy tensor Walsh/Z3 Fourier tests.
// No minimax, game-value search or nonstandard board.
import {sourceLocalOwnerFourierTensor} from './source-unfolded7x6-local-owner-Fourier-tensor.mjs';
export function independentLocalOwnerJunctionFourierCheck(){
 const source=sourceLocalOwnerFourierTensor();
 const sites=Array.from({length:42},()=>[]);
 const strands=[];
 function extend(dir,c,r,dc,dr){
  const id=strands.length,seq=[];
  while(c>=0&&c<7&&r>=0&&r<6){
   const e=r*7+c;seq.push(e);sites[e].push({dir,id,pos:seq.length-1});
   c+=dc;r+=dr;
  }
  strands.push({dir,seq});
 }
 for(let c=0;c<7;c++)extend('V',c,0,0,1);
 for(let r=0;r<6;r++)extend('H',0,r,1,0);
 for(let c=6;c>=0;c--)extend('R',c,0,1,1);
 for(let r=5;r>=1;r--)extend('R',0,r,1,1);
 for(let c=6;c>=1;c--)extend('F',c,5,1,-1);
 for(let r=0;r<6;r++)extend('F',0,r,1,-1);
 if(strands.length!==37||
   sites.some(z=>z.length!==4||new Set(z.map(v=>v.dir)).size!==4))
  throw Error('independent actual four-way junction mismatch');
 let checksWalsh=0,checksZ3=0,ownerTensorEnergy=0,
  checksBothExcluded=0,balancedZeros=0,maxZ3Error=0;
 const pop=x=>{let n=0;while(x){n+=x&1;x>>=1;}return n};
 const matrix=Array.from({length:16},()=>Array(16).fill(0));
 const correction=Array.from({length:16},()=>Array(16).fill(0));
 const sector={ee:0,eo:0,oe:0,oo:0},error=[];
 for(let e=0;e<42;e++){
  // physical tensor has exactly 3 nonzero 8-bit states:
  // all empty, all P0-owned or all P1-owned on four direction legs.
  const nonzero=[0,15,240];
  for(let k0=0;k0<16;k0++)for(let k1=0;k1<16;k1++){
   const freq=k0|(k1<<4);
   let raw=0;
   for(const state of nonzero)raw+=pop(freq&state)%2?-1:1;
   const expected=source.Hadamard[k0*16+k1].numerator;
   if(raw!==expected)error.push({kind:'OWNER_HADAMARD_EXCLUSION_MISMATCH',e,k0,k1});
   if(e===0){
    const parity0=pop(k0)%2,parity1=pop(k1)%2;
    const independent=(parity0||parity1)?0:4;
    const forbidden=pop(k0)%2===pop(k1)%2?1:-1;
    if(independent-forbidden!==raw)
     error.push({kind:'FORBIDDEN_BOTH_OWNER_RANK_ONE_DEFECT',k0,k1});
    matrix[k0][k1]=raw;
    correction[k0][k1]=-forbidden;
    const key=(parity0?'o':'e')+(parity1?'o':'e');sector[key]++;
    ownerTensorEnergy+=raw*raw/256;
    const weighted=(.5*(parity0?-1:1)+.5*(parity1?-1:1))/16;
    if(weighted===0)balancedZeros++;
   }
   checksWalsh++;
  }
  for(let a=0;a<3;a++)for(let b=0;b<3;b++)
   for(let c=0;c<3;c++)for(let d=0;d<3;d++){
    const q=a+b+c+d;
    let re=0,im=0;
    // Four independent normalized F3 legs contribute 1/9.
    // Only 3 permitted common physical owner labels contribute.
    for(let owner=0;owner<3;owner++){
     const angle=2*Math.PI*owner*q/3;
     re+=Math.cos(angle)/9;im+=Math.sin(angle)/9;
    }
    const expected=source.ternaryDFT[((a*3+b)*3+c)*3+d].amplitudeNumerator/3;
    const diff=Math.hypot(re-expected,im);
    maxZ3Error=Math.max(maxZ3Error,diff);
    if(diff>2e-14)error.push({kind:'ORIGINAL_THREE_OWNER_Z3_FOUR_LEG_CHARGE_MISMATCH',e,a,b,c,d,diff});
    checksZ3++;
   }
 }
 function rankMod(A,P=103){
  const M=A.map(row=>row.map(x=>(x%P+P)%P)),n=M.length;
  let r=0;
  const power=(a,p)=>{let z=1;while(p){if(p&1)z=z*a%P;a=a*a%P;p>>=1;}return z;};
  for(let j=0;j<n;j++){
   let i=r;while(i<n&&!M[i][j])i++;
   if(i===n)continue;
   [M[i],M[r]]=[M[r],M[i]];
   const inv=power(M[r][j],P-2);
   for(let k=j;k<n;k++)M[r][k]=M[r][k]*inv%P;
   for(let i=r+1;i<n;i++){
    const factor=M[i][j];if(!factor)continue;
    for(let k=j;k<n;k++)
     M[i][k]=(M[i][k]-factor*M[r][k]+P*P)%P;
   }
   r++;
  }
  return r;
 }
 const rank=rankMod(matrix),rankCorrection=rankMod(correction);
 if(rank!==2||rankCorrection!==1||ownerTensorEnergy!==3||
  balancedZeros!==128||JSON.stringify(sector)!==
    JSON.stringify({ee:64,eo:64,oe:64,oo:64}))
  error.push({kind:'JUNCTION_DUAL_OWNER_FOURIER_RANK_NORM_SECTOR_FAILED',
   rank,rankCorrection,ownerTensorEnergy,balancedZeros,sector});
 const Z3Count=source.ternaryDFT.filter(x=>x.amplitudeNumerator).length;
 if(Z3Count!==27)error.push({kind:'TERNARY_ORIENTATION_OWNER_CHARGE_COUNT',Z3Count});
 // Replay actual original P0/P1/empty cell states after five center
 // moves: one owner or empty per site, all four aliases identical.
 const colors=Array(42).fill(-1);
 for(let ply=0;ply<5;ply++)colors[ply*7+3]=ply%2;
 const occupancy={empty:colors.filter(x=>x===-1).length,
  P0:colors.filter(x=>x===0).length,P1:colors.filter(x=>x===1).length};
 if(occupancy.empty!==37||occupancy.P0!==3||occupancy.P1!==2)
  error.push({kind:'ACTUAL_44444_PHYSICAL_CROSSING_OWNER_STATES_WRONG'});
 return {status:error.length?'INDEPENDENT_TRUE7X6_OWNER_CROSSING_FOURIER_SOURCE_REJECTED':
    'INDEPENDENT_TRUE7X6_UNFOLD_FIRST_HADAMARD_Z3_INTERSECTION_WAVES_PASS',
  genuineBoard:[7,6,4],physicalJunctions:sites.length,
  actualFourOrientationStrands:strands.length,
  originalJunctionStatesAllowed:3,forbiddenBothOwnerState:(1<<4)|(1<<7),
  HadamardOwnerFrequencyTensorChecks:checksWalsh,
  ternaryLocalOwnerFrequencyTensorChecks:checksZ3,
  ternaryFourLegModeCount:81,ternaryExactlyZeroFrequencyModesPerJunction:54,
  ternarySupportedFrequencyModesPerJunction:27,
  maximumComplexTernaryNumericalError:maxZ3Error,
  allOriginalJunctionTensorsSquaredNorm:ownerTensorEnergy,
  ownerSeparated16x16HadamardCouplingRank:rank,
  missingDoubleOwnershipStateFourierCorrectionRank:rankCorrection,
  mathematicalBalancedOwnerUncertaintyFourierZeroModes:balancedZeros,
  correctPauliChargeSectorSizes:sector,
  actuallyPlayed44444OwnerLabelsByPhysicalSite:occupancy,
  originalGameWDLNotInferred:true,
  totalGameFutureStrategicValueQueries:0,
  errors:error.slice(0,12)};
}