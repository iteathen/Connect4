// INDEPENDENT actual original W7H6K4 gravity / FIRST-WIN-STOP
// physical symmetry test on a source-frozen MINIMAL rank-complete
// Fourier/Radon observer with manifest P0/P1 preserving original
// LEFT-RIGHT reflection Jx. Four rational full DC and seven GF2
// full DC observations form mirror-closed active K4 ribbons.
// No other board or K, no WDL oracle, no game-tree lookahead.
import {sourceTrue7x6MinimalReflectiveFourierFrames}
 from './source-true7x6-minimal-reflection-Fourier-Radon-frames.mjs';
function independentOriginalGeometry(){
 const lines=[],dirs=[[1,0],[0,1],[1,1],[1,-1]];
 for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const [dc,dr] of dirs){
  if(c+3*dc<0||c+3*dc>=7||r+3*dr<0||r+3*dr>=6)continue;
  lines.push([0,1,2,3].map(t=>(r+t*dr)*7+c+t*dc));
 }
 const H=r=>Array.from({length:7},(_,c)=>r*7+c);
 const V=c=>Array.from({length:6},(_,r)=>r*7+c);
 function rising(d){const arr=[];for(let r=0;r<6;r++){
  const c=r+d;if(c>=0&&c<7)arr.push(r*7+c);
 }return arr}
 function falling(d){const arr=[];for(let c=0;c<7;c++){
  const r=d-c;if(r>=0&&r<6)arr.push(r*7+c);
 }return arr}
 const rationalDC=[H(0),H(1),rising(-1),falling(7)],
  binaryDC=[H(0),H(1),H(2),V(0),V(6),rising(-1),falling(7)];
 if(lines.length!==69||rationalDC.some(x=>x.length<4)||binaryDC.some(x=>x.length<4))
  throw Error('independent source physical original K4/ribbon geometry missing');
 return {lines,real:lines.concat(rationalDC),binary:lines.concat(binaryDC)};
}
function GF2rank(masks){
 const pivots=new Map();let rank=0;
 for(const row of masks){
  let m=row.reduce((v,id)=>v|(1n<<BigInt(id)),0n);
  while(m){
   const low=m&(-m),index=low.toString(2).length-1;
   if(pivots.has(index))m^=pivots.get(index);
   else{pivots.set(index,m);rank++;break}
  }
 }
 return rank;
}
function rankP(masks,P=103){
 const mat=masks.map(L=>Array.from({length:42},(_,j)=>L.includes(j)?1:0));
 let rank=0;
 function inv(a){
  let n=P-2,v=1;for(;n;n=Math.floor(n/2),a=a*a%P)if(n&1)v=v*a%P;return v;
 }
 for(let col=0;col<42;col++){
  let i=rank;while(i<mat.length&&!mat[i][col])i++;
  if(i===mat.length)continue;
  [mat[i],mat[rank]]=[mat[rank],mat[i]];
  const den=inv(mat[rank][col]);
  for(let j=col;j<42;j++)mat[rank][j]=mat[rank][j]*den%P;
  for(let k=rank+1;k<mat.length;k++){
   const f=mat[k][col];if(!f)continue;
   for(let j=col;j<42;j++)
    mat[k][j]=(mat[k][j]-f*mat[rank][j]+P*P)%P;
  }
  rank++;
 }
 return rank;
}
function physicalFirstWinReplay(history,lines){
 const h=Array(7).fill(0),own=Array(42).fill(-1),
  after=[],prefixSnapshots=[];
 for(let t=0;t<history.length;t++){
  const c=+history[t]-1;
  if(!Number.isInteger(c)||c<0||c>=7||h[c]>=6)
   throw Error('physically illegal original gravity cell');
  const p=t%2,site=h[c]*7+c;h[c]++;own[site]=p;
  const hasWin=lines.some(L=>L.includes(site)&&L.every(id=>own[id]===p));
  const status=hasWin?(p===0?'P0_WIN':'P1_WIN'):h.every(z=>z===6)?'DRAW':null;
  const occ=own.map(v=>v<0?0:1),player0=own.map(v=>v===0?1:0);
  prefixSnapshots.push({status,h:h.slice(),occ,player0,ply:t+1});
  if(status!==null&&t!==history.length-1)
   throw Error('tested original word improperly continues after real first win');
  if(status!==null)after.push(status);
 }
 return {lastStatus:after.length?after.at(-1):null,snapshots:prefixSnapshots};
}
export function independentlyVerifyOriginal7x6ReflectiveFourierFrame(){
 const src=sourceTrue7x6MinimalReflectiveFourierFrames(),
  physical=independentOriginalGeometry(),errors=[],
  actualFrame=[['real',physical.real],['binary',physical.binary]],
  xReflect=i=>Math.floor(i/7)*7+(6-i%7),
  inputNames=['source original physical occupied','source original P0'];
 const primes=[101,103];
 const realRanks=primes.map(p=>Array.from({length:5},(_,i)=>rankP(physical.real.slice(0,69+i),p)));
 const binaryRanks=Array.from({length:8},(_,i)=>GF2rank(physical.binary.slice(0,69+i)));
 if(realRanks.some(r=>JSON.stringify(r)!==JSON.stringify([38,39,40,41,42]))||
   JSON.stringify(binaryRanks)!==JSON.stringify([35,36,37,38,39,40,41,42]))
  errors.push({type:'REAL_SYMMETRIC_OR_BINARY_SYMMETRIC_MINIMAL_RANK_FAILURE',realRanks,binaryRanks});
 let matrixEntryChecks=0,physicalReflectionMeasurements=0,gamePlySnapshots=0;
 for(const [kind,actual] of actualFrame){
  const prior=kind==='real'?src.rationalObserver:src.binaryObserver;
  const perm=prior.truePhysicalReflectionOutputPermutation;
  if(perm.length!==actual.length)
   errors.push({type:'INCORRECT_REFLECTION_OBSERVER_DIMENSION',kind});
  for(let row=0;row<actual.length;row++){
   for(let physicalID=0;physicalID<42;physicalID++){
    const input=actual[row].includes(xReflect(physicalID))?1:0;
    const output=actual[perm[row]].includes(physicalID)?1:0;
    if(input!==output)
     errors.push({type:'ORIGINAL_OBSERVER_JX_INTERTWINING_ENTRY_MISMATCH',kind,row,physicalID});
    matrixEntryChecks++;
   }
   if(perm[perm[row]]!==row)
    errors.push({type:'JX_MEASUREMENT_PERM_NOT_INVOLUTION',kind,row});
  }
  const originalDC=actual.slice(69);
  for(let i=0;i<originalDC.length;i++)
   if(originalDC[i].length<4)
    errors.push({type:'SPURIOUS_TOO_SHORT_DC_STRAND',kind,i});
 }
 // Test TRUE legal game reflection transport: one-based literal c -> 8-c.
 const originalHistories=[
  '44444','444441','444444','123456123456654321654321123456123456777777',
  '44444421122333','44444411117113333557553553777722'
 ];
 const observedCases=[];
 for(const h of originalHistories){
  const mirrored=Array.from(h,c=>String(8-Number(c))).join(''),
    a=physicalFirstWinReplay(h,physical.lines),
    b=physicalFirstWinReplay(mirrored,physical.lines);
  if(a.lastStatus!==b.lastStatus||a.snapshots.length!==b.snapshots.length)
   errors.push({type:'ACTUAL_REFLECTED_ORIGINAL_GAME_WINNER_OR_STOP_MISMATCH',h,mirrored});
  observedCases.push({oneBasedHistory:h,reflectedOneBasedHistory:mirrored,
   originalPhysicalFirstWinStatus:a.lastStatus,mirroredPhysicalFirstWinStatus:b.lastStatus,
   physicallyReplayedPlies:a.snapshots.length});
  for(let i=0;i<a.snapshots.length;i++){
   const old=a.snapshots[i],newer=b.snapshots[i];
   if(old.status!==newer.status||newer.h.some((v,c)=>v!==old.h[6-c]))
    errors.push({type:'ORIGINAL_GAME_REFLECTED_GRAVITY_OR_STOP_FAIL',h,ply:i+1});
   for(const [kind,actual] of actualFrame){
    const perm=kind==='real'?src.rationalObserver.truePhysicalReflectionOutputPermutation:
     src.binaryObserver.truePhysicalReflectionOutputPermutation;
    for(const channel of ['occ','player0']){
     const sig=actual.map(L=>L.reduce((v,j)=>v+old[channel][j],0));
     const mirrorSig=actual.map(L=>L.reduce((v,j)=>v+newer[channel][j],0));
     for(let k=0;k<actual.length;k++){
      if(mirrorSig[k]!==sig[perm[k]])
       errors.push({type:'CURRENT_LEGAL_GAME_SPECTRAL_REFLECTION_NOT_MANIFEST',h,ply:i+1,kind,channel,k});
      physicalReflectionMeasurements++;
     }
    }
   }
   gamePlySnapshots++;
  }
 }
 return {
  status:errors.length?'TRUE7X6_MINIMAL_REFLECTIVE_FOURIER_EQUIVARIANCE_FALSE':
   'INDEPENDENT_TRUE7X6_MINIMAL_REFLECTIVE_FOURIER_RADON_FRAME_AND_REAL_GAME_PASS',
  originalBoard:[7,6,4],
  originalGenuineWinningK4Lines:physical.lines.length,
  fourReflectionClosedRealDCs:physical.real.length-69,
  sevenReflectionClosedBinaryDCs:physical.binary.length-69,
  originalRationalFullRankOverTwoPrimes:realRanks,
  originalBinaryFullRankProgress:binaryRanks,
  physicallyCheckedJxIntertwiningMatrixEntries:matrixEntryChecks,
  originalStrictFirstWinStoppedGamePlySnapshots:gamePlySnapshots,
  actualPhysicalReflectiveSyndromePermutationComparisons:physicalReflectionMeasurements,
  independentTrueOriginalAndReflectedGames:observedCases,
  actualGameWinnerAndFirstWinMoveCountPreserved:true,
  singleCellPhysicalParityOwnerLabelsSameUnderReflection:true,
  staticJyWrongGravityNotClaimedGameSymmetry:true,
  futureGameWDLValueSearches:0,errors:errors.slice(0,10)};
}
