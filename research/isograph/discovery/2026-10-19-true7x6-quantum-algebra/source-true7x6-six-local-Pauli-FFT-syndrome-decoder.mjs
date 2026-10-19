// ORIGINAL W7,H6,K4 42-cell full-BINARY-coloring syndrome.
// SIX real adjacent 2-cell Pauli Z correlation (XOR) measurements
// supplement 69 original K4 line-parities from rank35 to rank41;
// one absolute original cell color anchor makes rank42: unique
// reconstruction by GF2 algebra, ZERO strategic game-state searches.
// Not a WDL classifier or generic original ternary q decoder.
// Frozen math: docs/research/2026-10-19-true7x6-Shor-hidden-subgroup-six-local-Pauli-syndrome-reconstruction.md
export function sourceTrue7x6SixLocalPauliSyndrome(){
 const W=7,H=6,K=4,N=42,dirs=[[1,0],[0,1],[1,1],[1,-1]],
  lines=[],pairs=[[0,1],[1,2],[7,8],[8,9],[0,7],[7,14]];
 function bit(i){return 1n<<BigInt(i)}
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of dirs){
  if(c+3*dx<0||c+3*dx>=W||r+3*dy<0||r+3*dy>=H)continue;
  const sites=[0,1,2,3].map(i=>(r+i*dy)*W+c+i*dx);
  lines.push(sites.reduce((m,i)=>m|bit(i),0n));
 }
 const Pauli2=pairs.map(([i,j])=>bit(i)|bit(j)),anchor=bit(0),
  measurements=lines.concat(Pauli2,anchor);
 function binaryRank(eq){
  const basis=new Map();let rank=0;
  for(let q of eq)while(q){
   const k=q.toString(2).length-1;
   if(basis.has(k))q^=basis.get(k);
   else{basis.set(k,q);rank++;break}
  }
  return rank;
 }
 const rankProgression=Array.from({length:7},(_,i)=>binaryRank(lines.concat(Pauli2.slice(0,i))));
 const fullRank=binaryRank(measurements);
 if(lines.length!==69||rankProgression.some((r,i)=>r!==35+i)||fullRank!==42)
  throw Error('original 7x6 exact six Pauli syndrome repair rank proof failed');
 function encode(physicalOwnerBits) {
  if(!Array.isArray(physicalOwnerBits)||physicalOwnerBits.length!==N||
    physicalOwnerBits.some(x=>x!==0&&x!==1))
   throw Error('requires fully assigned original 42 physical binary bits');
  let owner=0n;
  physicalOwnerBits.forEach((v,i)=>{if(v)owner|=bit(i)});
  function parity(mask) {
   let q=owner&mask,b=0;
   for(;q;q&=q-1n)b^=1;
   return b;
  }
  return measurements.map(parity);
 }
 function decode(syndrome) {
  if(!Array.isArray(syndrome)||syndrome.length!==measurements.length||
    syndrome.some(x=>x!==0&&x!==1))
   throw Error('requires exactly 76 original line/six Pauli/one anchor GF2 bits');
  const rows=measurements.map((m,i)=>m|(syndrome[i]?bit(42):0n));
  const pivots=[];let rank=0;
  for(let col=0;col<N;col++) {
   let i=rank;const flag=bit(col);
   while(i<rows.length&&(rows[i]&flag)===0n)i++;
   if(i===rows.length)throw Error('not enough original 42 physical cell reconstruction constraints');
   [rows[rank],rows[i]]=[rows[i],rows[rank]];
   for(let j=0;j<rows.length;j++)if(j!==rank&&(rows[j]&flag)!==0n)
    rows[j]^=rows[rank];
   pivots.push(col);rank++;
  }
  const owner=new Array(N).fill(0);
  const dataMask=(1n<<42n)-1n;
  for(let i=0;i<N;i++){
   if((rows[i]&dataMask)!==bit(pivots[i]))
    throw Error('original binary owner syndrome not reduced to unique physical bit');
   owner[pivots[i]]=(rows[i]&bit(42))!==0n?1:0;
  }
  for(let i=N;i<rows.length;i++)if(rows[i]!==0n)
   throw Error('inconsistent original 76-bit Pauli syndrome supplied');
  return owner;
 }
 return Object.freeze({
  status:'SOURCE_STANDARD7X6_SIX_LOCAL_PAULI_SYNDROME_COMPLETE_RECONSTRUCTION',
  board:[W,H,K],physicalCells:N,
  originalFourWinWindowParities:lines.length,
  originalK4WindowMasksHex:lines.map(x=>'0x'+x.toString(16)),
  originalLocalPauliTwoBodyProbeSiteIDs:pairs.map(p=>p.slice()),
  syndromeNullityBeforeExtraChecks:7,
  firstSixRankProgression:rankProgression,
  relativeSyndromeRank:rankProgression.at(-1),
  rankIncludingOneAbsolutePhysicalOwnerAnchor:fullRank,
  totalSourceSyndromeBits:measurements.length,
  minimalRelativeAdditionalCorrelations:6,
  remainingAmbiguityWithoutAbsoluteAnchor:'exact global all42 complement',
  parityOnlyShorGroupSizeBeforeExtras:128,
  relativeSyndromeShorGroupSizeAfterSix:2,
  absoluteSyndromeRemainingShorKernelSize:1,
  encode,decode,
  notOriginalGameWDL:true,sourceGameQValuesEnumerated:0,
  originalP0P1TernaryNonterminalStateNotDecodedWithoutOccupancy:true
 });
}
