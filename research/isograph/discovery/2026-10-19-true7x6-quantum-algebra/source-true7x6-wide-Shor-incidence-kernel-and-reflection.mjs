// SOURCE-only W7H6K4 original physical 69-window × 42-cell
// incidence A. Broad Fourier/Shor-style comparison, NOT WDL search:
// GF2 hidden additive period subgroup ker(A mod2), rational sum kernel,
// original left-right gravity symmetry vs static-only vertical mirror,
// and reflection-character blocks over Q. All explicit original 7x6.
export function sourceTrue7x6BroadFourierKernelReflection(){
 const W=7,H=6,K=4,dirs=[[1,0],[0,1],[1,1],[1,-1]],
  lines=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of dirs){
  const X=x+3*dx,Y=y+3*dy;
  if(X<0||X>=W||Y<0||Y>=H)continue;
  const ids=[0,1,2,3].map(i=>(y+i*dy)*W+x+i*dx);
  lines.push(ids);
 }
 if(lines.length!==69)throw Error('original 69 physical Connect4 lines absent');
 const masks=lines.map(ids=>ids.reduce((m,j)=>m|(1n<<BigInt(j)),0n));
 const bit=n=>1n<<BigInt(n),pop=m=>{let t=0;for(let v=m;v;v&=v-1n)t++;return t};
 const rows=masks.slice(),pivot=[],free=[];
 let r=0;
 // Exact RREF in GF2, current original literal physical cell IDs.
 for(let j=0;j<42;j++){
  let i=r;
  while(i<rows.length&&(rows[i]&bit(j))===0n)i++;
  if(i>=rows.length){free.push(j);continue;}
  [rows[r],rows[i]]=[rows[i],rows[r]];
  for(let k=0;k<rows.length;k++)if(k!==r&&(rows[k]&bit(j))!==0n)
   rows[k]^=rows[r];
  pivot.push(j);r++;
 }
 const nullMasks=[];
 for(const col of free){
  let v=bit(col);
  for(let j=0;j<pivot.length;j++)if((rows[j]&bit(col))!==0n)
   v|=bit(pivot[j]);
  nullMasks.push(v);
 }
 const nullWords=[],wordHistogram={};
 for(let k=0;k<(1<<nullMasks.length);k++){
  let v=0n;
  for(let i=0;i<nullMasks.length;i++)if(k&(1<<i))v^=nullMasks[i];
  if(masks.some(row=>(pop(row&v)&1)!==0))
   throw Error('GF2 exact hidden subgroup period preservation failed');
  nullWords.push(v);
  const w=pop(v);wordHistogram[w]=(wordHistogram[w]??0)+1;
 }
 const all42=(1n<<42n)-1n;
 const properNontrivial=nullWords.filter(x=>x!==0n&&x!==all42);
 properNontrivial.sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
 const example=properNontrivial[0];
 const broken=masks.filter(g=>pop(g&example)===2);
 if(!broken.length)throw Error('nontrivial XOR line parity translation left all K4 mono lines intact');
 // REAL/EXACT rational kernel basis (integer) already discovered algebraically,
 // validated here against all original source rows; independently reconstruct.
 const gridCandidates=[
  [[1,-1,1,-1,1,-1,1],[0,0,0,0,0,0,0],[-1,1,-1,1,-1,1,-1],[0,0,0,0,0,0,0],[1,-1,1,-1,1,-1,1],[0,0,0,0,0,0,0]],
  [[-1,0,0,1,-1,0,0],[1,0,0,-1,1,0,0],[0,-1,1,0,0,-1,1],[0,1,-1,0,0,1,-1],[-1,0,0,1,-1,0,0],[1,0,0,-1,1,0,0]],
  [[0,-1,0,1,0,-1,0],[0,1,0,-1,0,1,0],[0,-1,0,1,0,-1,0],[0,1,0,-1,0,1,0],[0,-1,0,1,0,-1,0],[0,1,0,-1,0,1,0]],
  [[1,-1,0,0,1,-1,0],[0,0,1,-1,0,0,1],[0,0,-1,1,0,0,-1],[-1,1,0,0,-1,1,0],[1,-1,0,0,1,-1,0],[0,0,1,-1,0,0,1]]
 ].map(rows=>rows.flat());
 for(const v of gridCandidates)for(const ids of lines)
  if(ids.reduce((a,i)=>a+v[i],0)!==0)
   throw Error('rational kernel witness does not null ALL original K4 window sums');
 function rankPrime(mat,prime=101){
  if(!mat.length||!mat[0].length)return 0;
  const v=mat.map(row=>row.map(x=>(x%prime+prime)%prime));
  let rank=0;function pow(a,n){let p=1;for(;n;n=Math.floor(n/2),a=a*a%prime)if(n&1)p=p*a%prime;return p;}
  for(let col=0;col<v[0].length;col++){
   let pivot=rank;
   while(pivot<v.length&&!v[pivot][col])pivot++;
   if(pivot===v.length)continue;
   [v[rank],v[pivot]]=[v[pivot],v[rank]];
   const inv=pow(v[rank][col],prime-2);
   for(let j=col;j<v[rank].length;j++)v[rank][j]=v[rank][j]*inv%prime;
   for(let k=rank+1;k<v.length;k++){
    const factor=v[k][col];if(!factor)continue;
    for(let j=col;j<v[k].length;j++)
     v[k][j]=(v[k][j]-factor*v[rank][j]+prime*prime)%prime;
   }
   rank++;
  }
  return rank;
 }
 const originalMatrix=lines.map(ids=>Array.from({length:42},(_,i)=>ids.includes(i)?1:0));
 const primeRank=rankPrime(originalMatrix);
 const integerNullRank=rankPrime(Array.from({length:42},(_,i)=>gridCandidates.map(v=>v[i])));
 if(primeRank!==38||integerNullRank!==4||r!==35)
  throw Error('source matrix rational/GF2 exact rank certificate mismatch');
 // A=original 69x42 line-cell incidence is equivariant for horizontal
 // reflection Jx; vertical reflection Jy preserves STATIC winline
 // incidence but breaks physical original gravity prefix order.
 const rx=i=>Math.floor(i/7)*7+(6-(i%7));
 const ry=i=>(5-Math.floor(i/7))*7+(i%7);
 const lineBySet=new Map(lines.map((L,i)=>[L.slice().sort((a,b)=>a-b).join(','),i]));
 const perm=(f)=>lines.map(L=>{
  const key=L.map(f).sort((a,b)=>a-b).join(',');
  if(!lineBySet.has(key))throw Error('reflection maps original line outside source geometry');
  return lineBySet.get(key);
 });
 const Px=perm(rx),Py=perm(ry);
 const PxPy=Px.map(i=>Py[i]);
 const fixed={Jx:Px.filter((i,j)=>i===j).length,
  Jy:Py.filter((i,j)=>i===j).length,JxJy:PxPy.filter((i,j)=>i===j).length};
 const characterBlocks=[];
 for(const sx of [1,-1])for(const sy of [1,-1]){
  // Full normalized character projector is 1/4*(I+sx Jx)*(I+sy Jy).
  // Rational rank preserved by integer numerator in each input column.
  const projected=originalMatrix.map(row=>
    Array.from({length:42},(_,i)=>
      row[i]+sx*row[rx(i)]+sy*row[ry(i)]+sx*sy*row[rx(ry(i))]));
  const inDimension=(42+sx*6)/4; // WRONG for sy? corrected below
  const input=(42+sx*6+sy*0+sx*sy*0)/4;
  const output=(69+sx*fixed.Jx+sy*fixed.Jy+sx*sy*fixed.JxJy)/4;
  const image=rankPrime(projected);
  characterBlocks.push({reflectionXSign:sx,reflectionYSign:sy,
   sourceInputPhysicalDimension:input,sourceOutputWinningLineDimension:output,
   exactRankMod101:image,sourceRationalKernelDimension:input-image,
   mathematicalScope:sy===1?'STATIC_C2xC2; gravity only Jx':'STATIC_ONLY vertical reversal not original game symmetry'});
 }
 const leftOnly={
  inputEven:24,inputOdd:18,winEven:36,winOdd:33,
  rankEven:characterBlocks.filter(b=>b.reflectionXSign===1).reduce((a,b)=>a+b.exactRankMod101,0),
  rankOdd:characterBlocks.filter(b=>b.reflectionXSign===-1).reduce((a,b)=>a+b.exactRankMod101,0)
 };
 return {
  status:'SOURCE_ORIGINAL7X6_K4_BROAD_FOURIER_KERNEL_REFLECTION',
  board:[7,6,4],physicalCells:42,actualK4LineCount:69,
  originalLineMasksHex:masks.map(m=>'0x'+m.toString(16)),
  originalWinLinePhysicalIDs:lines,
  exactGF2WindowParityMap:{
   field:'GF2',rank:r,translationPeriodKernelDimension:42-r,
   exactNumberOfXORHiddenPeriods:nullWords.length,
   kernelGeneratorsHex:nullMasks.map(v=>'0x'+v.toString(16)),
   kernelAll128ElementsHex:nullWords.map(v=>'0x'+v.toString(16)),
   nonGlobalExample:'0x'+example.toString(16),
   exampleWeight:pop(example),exampleK4WindowBecomingMixedFromMonochrome:
    broken[0].toString(16),realWorldWinlinePredicateNotPreserved:true,
   weightHistogram:wordHistogram
  },
  exactRationalFourWindowSumMap:{
   field:'Q',rankCertifiedByReductionMod101:primeRank,
   independentKernelWitnesses:integerNullRank,
   rankOverQ:38,nullityOverQ:4,
   exactFourIntegerNullVectors:gridCandidates,
   projectedIntegerSumsEveryRealK4LineZero:true
  },
  staticRectangleReflectionGroup:{
   staticSymmetryGroupElements:['identity','Jx','Jy','JxJy'],
   fixedOriginalK4Lines:fixed,
   representationCharacterBlocks:characterBlocks,
   horizontalOriginalGravityPreservingReflectionOnly:true,
   horizontalOnlyC2:leftOnly,
   lineIndexMapJx:Px,lineIndexMapJy:Py
  },
  noStrategicWDLOrBestMoveResult:true,
  ShorHiddenSubgroupAnalogyOnlyForSpecifiedGF2WindowParityObservable:true,
  ownerColorMeaningPreservationUnderNonGlobalKernel:false,
  sourceGameValueQueries:0,sourceOpponentGameTreeSearches:0
 };
}
