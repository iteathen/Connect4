// Frozen source mathematical producer: ORIGINAL W7,H6,K4 ONLY.
// Quantum-inspired Pauli-Z ownership linear affine hull and exact 69
// non-Clifford winning-line projectors. Source is PURE: no game WDL,
// no game successor valuation, no minmax, no qbf, no quantum statevector.
// Ordinary game stops on FIRST WIN. The 42-site full words below are
// counterfactual algebraic GRAVITY LINEAR EXTENSIONS after first win.
// Theorem: docs/research/2026-10-19-true7x6-quantum-pauli-owner-affine-hull-and-nonlinear-operator-pilot.md
export function sourceTrue7x6K4PauliExchange(){
 const W=7,H=6,K=4,N=W*H;
 const directions=[
  {name:'horizontal',dc:1,dr:0},
  {name:'vertical',dc:0,dr:1},
  {name:'rising',dc:1,dr:1},
  {name:'falling',dc:1,dr:-1}
 ];
 const cellID=(c,r)=>r*W+c,physicalCells=[];
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)
  physicalCells.push({id:cellID(c,r),column:c,row:r});
 const windows=[];
 for(const d of directions)for(let c=0;c<W;c++)for(let r=0;r<H;r++){
  const ec=c+(K-1)*d.dc,er=r+(K-1)*d.dr;
  if(ec<0||ec>=W||er<0||er>=H)continue;
  const cells=Array.from({length:K},(_,t)=>cellID(c+t*d.dc,r+t*d.dr));
  let mask=0n;for(const z of cells)mask|=1n<<BigInt(z);
  windows.push({orientation:d.name,cells,maskHex:'0x'+mask.toString(16)});
 }
 // Pauli-Z Fourier coefficient numerator, common denominator 8.
 // Each original 4-site projector contributes identity, 6 pair and 1 quad.
 const coefficients=new Map();
 const add=(mask,weight)=>{
  const key=mask.toString(16);
  const old=coefficients.get(key);
  if(old)old.numerator+=weight;
  else coefficients.set(key,{PauliZSupportMaskHex:'0x'+key,numerator:weight,
   operatorDegree:mask.toString(2).split('1').length-1});
 };
 for(const L of windows){
  add(0n,1);
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)
   add((1n<<BigInt(L.cells[i]))|(1n<<BigInt(L.cells[j])),1);
  add(BigInt(L.maskHex),1);
 }
 const terms=[...coefficients.values()];
 terms.sort((a,b)=>{
  if(a.operatorDegree!==b.operatorDegree)return a.operatorDegree-b.operatorDegree;
  const x=BigInt(a.PauliZSupportMaskHex),y=BigInt(b.PauliZSupportMaskHex);
  return x<y?-1:x>y?1:0;
 });
 const witnesses=[];
 const pivots=Array(N).fill(null);
 let rank=0;
 function addGF2(mask){
  let v=mask;
  for(let high=N-1;high>=0 && v!==0n;high--){
   const bit=1n<<BigInt(high);
   if(!(v&bit))continue;
   if(pivots[high]!==null)v^=pivots[high];
   else{pivots[high]=v;rank++;return;}
  }
 }
 for(let a=0;a<W;a++)for(let b=a+1;b<W;b++)
  for(let r=0;r<H;r++)for(let s=0;s<H;s++){
   const h=Array(W).fill(0),pre=[];
   for(let k=0;k<r;k++){pre.push(a);h[a]++;}
   for(let k=0;k<s;k++){pre.push(b);h[b]++;}
   // x and y have their predecessors already completed.
   const x=cellID(a,r),y=cellID(b,s);
   const h2=h.slice();h2[a]++;h2[b]++;
   const suffix=[];
   for(let c=0;c<W;c++)for(let row=h2[c];row<H;row++)suffix.push(c);
   const wordXY=pre.concat(a,b,suffix),wordYX=pre.concat(b,a,suffix);
   if(wordXY.length!==N||wordYX.length!==N)
    throw Error('hypothetical original full gravity word wrong length');
   const diff=(1n<<BigInt(x))|(1n<<BigInt(y));
   addGF2(diff);
   witnesses.push({a,b,r,s,x,y,
    differenceXorMaskHex:'0x'+diff.toString(16),
    originalHypotheticalCompleteColumnsXY:wordXY,
    originalHypotheticalCompleteColumnsYX:wordYX,
    algebraicDomain:'GRAVITY_COLUMN_SHUFFLES_STOP_RULE_SUSPENDED'});
  }
 return {
  status:'SOURCE_TRUE7X6_K4_EXACT_PAULI_AFFINE_WITNESS',
  geometry:{W,H,K,physicalCells:N,windows:windows.length,
   directionCounts:Object.fromEntries(directions.map(d=>
    [d.name,windows.filter(L=>L.orientation===d.name).length]))},
  physicalCells,windows,terms,witnesses,
  PauliTermsCommonDenominator:8,
  PauliBasis:{identity:terms.filter(x=>x.operatorDegree===0).length,
   ZZ:terms.filter(x=>x.operatorDegree===2).length,
   ZZZZ:terms.filter(x=>x.operatorDegree===4).length,
   ZZWeight:terms.filter(x=>x.operatorDegree===2).reduce((s,x)=>s+x.numerator,0),
   fourZWeight:terms.filter(x=>x.operatorDegree===4).reduce((s,x)=>s+x.numerator,0),
   identityWeight:terms.find(x=>x.operatorDegree===0)?.numerator??null},
  fullGravityWordSwapCount:witnesses.length,
  sourceGF2DifferenceRank:rank,
  sourceUnconditionalLinearOwnerConstraints:N-rank,
  sourceFullWordP1Quota:21,sourceGlobalAllCellZProduct:-1,
  originalGameWDL:null,ordinaryFirstWinProof:null,
  sourceFutureStrategicGameValuesComputed:0,
  sourceOpponentPoliciesSearched:0,sourceQuantumStatevectorBuilt:false
 };
}
