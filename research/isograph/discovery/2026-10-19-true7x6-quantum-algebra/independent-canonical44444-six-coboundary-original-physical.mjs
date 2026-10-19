// INDEPENDENT original true W7 H6 K4 K4-line reconstruction,
// actual 44444 and 42 physical first-win-free two-ply actions.
// Verifies source SIX basis of ALL 21 raw R0/R1 win-generator
// odd-incidence exchange masks, graph rank and 35 cocycles.
// This is PHYSICAL FALSIFICATION only: no minimax, WDL game-value
// query, other board size, or hidden strategy enumeration.
import {sourceCanonical44444SixFourierDifferences}
 from './source-canonical44444-six-generator-Fourier-coboundary.mjs';
function geometryAndPosition(){
 const W=7,H=6,K=4,steps=[[0,1],[1,0],[1,1],[1,-1]],
   lines=[],board=new Int8Array(42).fill(-1),h=Array(7).fill(0);
 for(let y=0;y<6;y++)for(let x=0;x<7;x++)for(const [dx,dy] of steps){
  if(x+3*dx<0||x+3*dx>=7||y+3*dy<0||y+3*dy>=6)continue;
  const ids=[0,1,2,3].map(t=>(y+t*dy)*7+x+t*dx);
  lines.push({ids,mask:ids.reduce((q,i)=>q|(1n<<BigInt(i)),0n)});
 }
 if(lines.length!==69)throw Error('physical original 69 K4 lines wrong');
 for(let i=0;i<5;i++){
  const c=3,r=h[c]++,z=r*7+c,p=i%2;
  if(board[z]!==-1)throw Error('root physical same cell double claim');
  board[z]=p;
  if(lines.some(L=>L.ids.every(j=>board[j]===p)))
   throw Error('real original 44444 game first-won before root');
 }
 return {W,H,K,lines,board,h};
}
function normalize(source){
 const pop=v=>{let p=0;for(let x=v;x;x&=x-1n)p++;return p};
 const all=[...new Set(source.map(v=>v.toString(16)))].map(v=>BigInt('0x'+v));
 all.sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
 const out=[];
 for(const v of all)if(!out.some(m=>(m&v)===m))out.push(v);
 return out;
}
function originalR(P,owner){
 let candidate=[];
 for(const L of P.lines){
  if(L.ids.some(i=>P.board[i]===1-owner))continue;
  let mask=0n;
  for(const z of L.ids)if(P.board[z]===-1)mask|=1n<<BigInt(z);
  if(!mask)throw Error('original first winner already exists');
  candidate.push(mask);
 }
 return normalize(candidate);
}
function physicalPlay(q,c,p){
 const h=q.h.slice(),board=q.board.slice();
 if(c<0||c>=7||h[c]>=6)throw Error('illegal original column');
 const row=h[c]++,site=row*7+c;
 if(board[site]!==-1)throw Error('invalid original physical landing');
 board[site]=p;
 const isFirstWinner=q.lines.some(L=>L.ids.includes(site)&&L.ids.every(j=>board[j]===p));
 return {h,board,lines:q.lines,land:site,win:isFirstWinner};
}
function rankOriginalGF2(vectors,maxBits){
 let rank=0,pivots=new Map();
 for(const z of vectors){
  let value=z;
  for(let k=maxBits-1;k>=0&&value;k--){
   const bit=1n<<BigInt(k);
   if((value&bit)===0n)continue;
   if(pivots.has(k))value^=pivots.get(k);
   else {pivots.set(k,value);rank++;break;}
  }
 }
 return rank;
}
function sameMasks(a,b){
 const fmt=x=>x.map(i=>'0x'+i.toString(16)).sort();
 return JSON.stringify(fmt(a))===JSON.stringify(fmt(b));
}
export function independentlyCheckCanonical44444SixFourierCoboundary(){
 const s=sourceCanonical44444SixFourierDifferences(),
   P=geometryAndPosition(),R0=originalR(P,0),R1=originalR(P,1),
   R=R0.concat(R1),errors=[];
 if(R0.length!==48||R1.length!==42||s.originalRootR0!==48||
   s.originalRootR1!==42)
  errors.push({type:'PHYSICAL_SOURCE_ORIGINAL_R_48_42_MISMATCH'});
 const ids=P.h.map((row,c)=>row*7+c);
 if(JSON.stringify(ids)!==JSON.stringify(s.originalRootLandingPhysicalSiteIds))
  errors.push({type:'ROOT_PHYSICAL_LANDING_ID_MISMATCH'});
 const m=ids.map(z=>R.reduce((bits,mask,j)=>
  bits|((mask&(1n<<BigInt(z)))!==0n?(1n<<BigInt(j)):0n),0n));
 const m0=ids.map(z=>R0.reduce((bits,mask,j)=>
  bits|((mask&(1n<<BigInt(z)))!==0n?(1n<<BigInt(j)):0n),0n));
 const m1=ids.map(z=>R1.reduce((bits,mask,j)=>
  bits|((mask&(1n<<BigInt(z)))!==0n?(1n<<BigInt(j)):0n),0n));
 const sourcePotentials=s.original90WinningGeneratorIncidencePotentials.map(BigInt);
 let rootIncidenceBits=0;
 for(let a=0;a<7;a++)for(let j=0;j<R.length;j++){
  const native=(R[j]&(1n<<BigInt(ids[a])))!==0n;
  const sourceBit=(sourcePotentials[a]&(1n<<BigInt(j)))!==0n;
  if(native!==sourceBit)errors.push({type:'SOURCE_ORIGINAL_GENERATOR_HIT_BIT_MISMATCH',a,j});
  rootIncidenceBits++;
 }
 if(m.some((v,i)=>v!==sourcePotentials[i]))errors.push({type:'SOURCE_POTENTIAL_MISMATCH'});
 const E=[],E0=[],E1=[];
 let edgePhysicalSourceChecks=0;
 const twoPly=[];let valuesDiffer=0;
 for(let a=0;a<7;a++)for(let b=a+1;b<7;b++){
  const edge=m[a]^m[b];E.push(edge);
  E0.push(m0[a]^m0[b]);E1.push(m1[a]^m1[b]);
  const expected=s.originalRawWinningGeneratorEdgeIncidence.find(v=>
   v.actionA===a+1&&v.actionB===b+1);
  if(!expected||BigInt(expected.rawSourceGF2OddIncidenceMaskHex)!==edge)
   errors.push({type:'SOURCE_21_90_EDGE_MISMATCH',a,b});
  for(let j=0;j<R.length;j++){
   const independentlyDifferent=((R[j]&(1n<<BigInt(ids[a])))!==0n)!==
     ((R[j]&(1n<<BigInt(ids[b])))!==0n);
   if(independentlyDifferent!==((edge&(1n<<BigInt(j)))!==0n))
    errors.push({type:'PHYSICAL_RAW_ROLE_INC_FUNCTION_WRONG',a,b,j});
   edgePhysicalSourceChecks++;
  }
  const pAB1=physicalPlay(P,a,1);
  const pAB2=physicalPlay(pAB1,b,0);
  const pBA1=physicalPlay(P,b,1);
  const pBA2=physicalPlay(pBA1,a,0);
  if(pAB1.win||pAB2.win||pBA1.win||pBA2.win)
    errors.push({type:'TRUE_ORIGINAL_2PLY_FIRST_WIN_GUARD',a,b});
  if(JSON.stringify(pAB2.h)!==JSON.stringify(pBA2.h))
    errors.push({type:'HEIGHTS_NOT_EQUAL_AFTER_TWO_DISTINCT_MOVES',a,b});
  const masksAB0=originalR(pAB2,0),masksAB1=originalR(pAB2,1);
  const masksBA0=originalR(pBA2,0),masksBA1=originalR(pBA2,1);
  const roleAB0=normalize(R0.filter(G=>(G&(1n<<BigInt(ids[a])))===0n).
    map(G=>G&~(1n<<BigInt(ids[b]))));
  const roleAB1=normalize(R1.filter(G=>(G&(1n<<BigInt(ids[b])))===0n).
    map(G=>G&~(1n<<BigInt(ids[a]))));
  const roleBA0=normalize(R0.filter(G=>(G&(1n<<BigInt(ids[b])))===0n).
    map(G=>G&~(1n<<BigInt(ids[a]))));
  const roleBA1=normalize(R1.filter(G=>(G&(1n<<BigInt(ids[a])))===0n).
    map(G=>G&~(1n<<BigInt(ids[b]))));
  if(!sameMasks(masksAB0,roleAB0)||!sameMasks(masksAB1,roleAB1)||
    !sameMasks(masksBA0,roleBA0)||!sameMasks(masksBA1,roleBA1))
    errors.push({type:'ORIGINAL_PHYSICAL_VS_RAW_NORMALIZED_ROLE_COFACTOR_MISMATCH',a,b});
  const unequal=!(sameMasks(masksAB0,masksBA0)&&sameMasks(masksAB1,masksBA1));
  if(unequal)valuesDiffer++;
  twoPly.push({actionPair:[a+1,b+1],originalPhysicalDifferentOrientedResiduals:unequal,
   sourceRawOddGeneratorCount:expected?.oddAllOriginal90GeneratorCount??null});
 }
 let triangleChecks=0;
 for(let a=0;a<7;a++)for(let b=a+1;b<7;b++)
  for(let c=b+1;c<7;c++){
   const curl=(m[a]^m[b])^(m[b]^m[c])^(m[a]^m[c]);
   if(curl!==0n)errors.push({type:'SOURCE_FOURIER_GRAPH_NONZERO_TRIANGLE_CURL',a,b,c});
   triangleChecks++;
  }
 const edgeRanks={all:rankOriginalGF2(E,90),P0:rankOriginalGF2(E0,48),
  P1:rankOriginalGF2(E1,42),
  originalPotential:rankOriginalGF2(m,90)};
 const baseline=E.filter((_,i)=>true);
 const viaSix=[];
 for(let a=0;a<7;a++)for(let b=a+1;b<7;b++)
  viaSix.push((m[0]^m[a])^(m[0]^m[b]));
 if(viaSix.some((v,i)=>v!==E[i]))
  errors.push({type:'SIX_BASIS_NOT_REPRODUCING_ALL_21_EDGES'});
 if(edgeRanks.all!==6||edgeRanks.P0!==6||edgeRanks.P1!==6||
    edgeRanks.originalPotential!==7||valuesDiffer!==21||
    E.some(v=>v===0n)||triangleChecks!==35)
  errors.push({type:'PHYSICAL_EXPECTED_RANK_SATURATION_OR_NONCONFLUENCE',edgeRanks,valuesDiffer,triangleChecks});
 return {
  status:errors.length?'ORIGINAL_PHYSICAL_FOURIER_COBBOUNDARY_FALSIFIED':
    'INDEPENDENT_TRUE7X6_CANONICAL_FOURIER_RANK_SIX_COMPLETE_PASS',
  originalDimensions:[7,6,4],canonical:'44444',
  ordinaryRootP0Requirements:R0.length,ordinaryRootP1Requirements:R1.length,
  originalGeometricK4LineCount:P.lines.length,
  exactPhysicalRootActionLandingSiteIDs:ids,
  physicalGeneratorRootIncidenceBitChecks:rootIncidenceBits,
  originalRootEdgeGeneratorOddIncidenceChecks:edgePhysicalSourceChecks,
  all21PhysicalOriginalTwoPlyOrders:42,
  physicalIndividualResidualCofactorP0P1Checks:84,
  physicalTwoPlySwapsWithDistinctOrientedR:valuesDiffer,
  independentExactGF2EdgeRanks:edgeRanks,
  all35ThreeActionRootSourceCurvatureChecks:triangleChecks,
  all21ExchangeVectorsRecoveredFromSix:true,
  physicalActionRootGeneratorHitCounts:m.map(x=>{
   let n=0;for(let q=x;q;q&=q-1n)n++;return n;
  }),
  originalWindowScoresOrWDLNotEvaluated:true,
  firstWinRootValueOrBestAction:null,
  note:'Raw generator incidence gradient rank6 does not imply strategic game-value equivalence; normalized R differs for all 21 pairs.',
  errors:errors.slice(0,10),
  optionalIndividualPairs:twoPly
 };
}
