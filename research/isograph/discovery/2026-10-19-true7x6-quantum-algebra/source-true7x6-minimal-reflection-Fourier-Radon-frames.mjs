// SOURCE: standard ORIGINAL W7,H6,K4 ONLY.
// Two exact information-complete 69-short-window + DC-long-strand
// Fourier/Radon observers that are MANIFESTLY equivariant under true
// gravity-preserving original left/right reflection Jx.
// Rational 4 extra active DCs; binary GF2 7 extra active DCs.
// No future WDL, minimax, defensive policy or altered board.
export function sourceTrue7x6MinimalReflectiveFourierFrames(){
 const W=7,H=6,K=4,site=(c,r)=>r*7+c,WIN=[];
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)
  for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
   if(c+3*dc<0||c+3*dc>=W||r+3*dr<0||r+3*dr>=H)continue;
   WIN.push([0,1,2,3].map(k=>site(c+k*dc,r+k*dr)));
  }
 function Hrow(r){return Array.from({length:7},(_,c)=>site(c,r))}
 function Vcol(c){return Array.from({length:6},(_,r)=>site(c,r))}
 function Rise(d){let L=[];for(let c=0;c<7;c++){
  let r=c-d;if(r>=0&&r<6)L.push(site(c,r))}return L}
 function Fall(d){let L=[];for(let c=0;c<7;c++){
  let r=d-c;if(r>=0&&r<6)L.push(site(c,r))}return L}
 const rationalDC=[
  {kind:'H',label:'r0',physicalIDs:Hrow(0)},
  {kind:'H',label:'r1',physicalIDs:Hrow(1)},
  {kind:'R',label:'c-r=-1',physicalIDs:Rise(-1)},
  {kind:'F',label:'c+r=7',physicalIDs:Fall(7)}
 ];
 const binaryDC=[
  {kind:'H',label:'r0',physicalIDs:Hrow(0)},
  {kind:'H',label:'r1',physicalIDs:Hrow(1)},
  {kind:'H',label:'r2',physicalIDs:Hrow(2)},
  {kind:'V',label:'c0',physicalIDs:Vcol(0)},
  {kind:'V',label:'c6',physicalIDs:Vcol(6)},
  {kind:'R',label:'c-r=-1',physicalIDs:Rise(-1)},
  {kind:'F',label:'c+r=7',physicalIDs:Fall(7)}
 ];
 const Jx=i=>Math.floor(i/7)*7+(6-i%7),
  key=L=>L.slice().sort((a,b)=>a-b).join(',');
 const wins=new Map(WIN.map((L,i)=>[key(L),i]));
 const permWin=WIN.map(L=>{
  const idx=wins.get(key(L.map(Jx)));
  if(!Number.isInteger(idx))throw Error('original real K4 winline reflection missing');
  return idx;
 });
 function permDC(S){
  const m=new Map(S.map((L,i)=>[key(L.physicalIDs),i]));
  return S.map(L=>{
   const idx=m.get(key(L.physicalIDs.map(Jx)));
   if(!Number.isInteger(idx))throw Error('spectral source DC selection not closed under physical real Jx');
   return idx;
  });
 }
 const permR=permWin.concat(permDC(rationalDC).map(j=>69+j));
 const permB=permWin.concat(permDC(binaryDC).map(j=>69+j));
 const rationalFrame=WIN.concat(rationalDC.map(s=>s.physicalIDs)),
  binaryFrame=WIN.concat(binaryDC.map(s=>s.physicalIDs));
 function rankMod(F,prime){
  const m=F.map(ids=>Array.from({length:42},(_,i)=>ids.includes(i)?1:0));
  let rank=0;const pow=(a,n)=>{let v=1;for(;n;n=Math.floor(n/2),a=a*a%prime)if(n&1)v=v*a%prime;return v};
  for(let j=0;j<42;j++){
   let i=rank;while(i<m.length&&!m[i][j])i++;
   if(i===m.length)continue;
   [m[i],m[rank]]=[m[rank],m[i]];
   const iv=pow(m[rank][j],prime-2);
   for(let k=j;k<42;k++)m[rank][k]=m[rank][k]*iv%prime;
   for(let k=rank+1;k<m.length;k++)if(m[k][j]){
    const v=m[k][j];
    for(let c=j;c<42;c++)m[k][c]=(m[k][c]-v*m[rank][c]+prime*prime)%prime;
   }
   rank++;
  }
  return rank;
 }
 function rankGF2(F){
  const basis=new Map();let rank=0;
  for(const L of F){let m=L.reduce((v,i)=>v|(1n<<BigInt(i)),0n);
   while(m){const k=m.toString(2).length-1;
    if(basis.has(k))m^=basis.get(k);
    else{basis.set(k,m);rank++;break}
   }
  }
  return rank;
 }
 function checkEquivariant(F,permutation){
  for(let i=0;i<F.length;i++){
   if(key(F[i].map(Jx))!==key(F[permutation[i]]))
    throw Error('original 7x6 Fourier/Radon Jx action not a permutation intertwiner');
  }
 }
 checkEquivariant(rationalFrame,permR);
 checkEquivariant(binaryFrame,permB);
 const primeProgress=Array.from({length:5},(_,i)=>rankMod(WIN.concat(rationalDC.slice(0,i).map(s=>s.physicalIDs)),101));
 const binaryProgress=Array.from({length:8},(_,i)=>rankGF2(WIN.concat(binaryDC.slice(0,i).map(s=>s.physicalIDs))));
 if(JSON.stringify(primeProgress)!==JSON.stringify([38,39,40,41,42])||
  JSON.stringify(binaryProgress)!==JSON.stringify([35,36,37,38,39,40,41,42]))
  throw Error('original 7x6 minimal reflection-complete Fourier observers not rank full');
 return {
  status:'SOURCE_STANDARD7X6_REFLECTION_EQUIVARIANT_MINIMAL_FOURIER_FRAMES',
  board:[W,H,K],physicalOriginalCells:42,
  genuineOriginalK4WindowRows:WIN.length,
  originalTrueGameplayReflectionJx:'(c,r)->(6-c,r)',
  rationalObserver:{
   measurements:rationalFrame,extraLongStrandDC:rationalDC,
   winWindowMeasurementCount:69,addedDC:4,
   exactRankMod101Progression:primeProgress,totalExactRankQ:42,
   truePhysicalReflectionOutputPermutation:permR,
   originalOutputFixedCoordinates:permR.filter((x,i)=>x===i).length,
   outputFourierC2EvenDimension:39,outputFourierC2OddDimension:34,
   reflectedSourceImageC2EvenDimension:24,
   reflectedSourceImageC2OddDimension:18,
   formula:'T_R Jx = P_R T_R; full original physical injection'
  },
  binaryObserver:{
   measurements:binaryFrame,extraLongStrandDC:binaryDC,
   addedDC:7,GF2RankProgression:binaryProgress,
   fullGF2Rank:42,
   truePhysicalReflectionOutputPermutation:permB,
   originalOutputFixedCoordinates:permB.filter((x,i)=>x===i).length,
   formula:'T_GF2 Jx = P_GF2 T_GF2; no + or - eigenspace split asserted in characteristic2'
  },
  originalWDLOrBestMove:null,sourceGameQValuesEvaluated:0,
  solverChanged:false
 };
}
