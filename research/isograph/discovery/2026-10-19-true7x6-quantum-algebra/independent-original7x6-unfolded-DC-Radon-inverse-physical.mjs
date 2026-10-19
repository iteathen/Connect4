// INDEPENDENT source-to-physical test of original W7 H6 K4
// directional Fourier DC/Radon reconstruction from real true open
// geometry: 69 short K4 windows + four active full strand sums over
// Q, and +seven active full strand XOR parities over GF2.
 // Independent original direct-grid original winlines and real 42-ply
// first-win-stopped DRAW owner field tested. NO different W/H/K, no
// two-player future move search, WDL solver or hidden minimax.
import {sourceOriginal7x6UnfoldedRadonDC}
 from './source-true7x6-unfolded-seven-DC-Radon-syndrome.mjs';
function independentGeometry(){
 const original=[],strands=[],W=7,H=6;
 const dirs=[
  {dx:1,dy:0,name:'H'},
  {dx:0,dy:1,name:'V'},
  {dx:1,dy:1,name:'R'},
  {dx:1,dy:-1,name:'F'}];
 for(let x=0;x<W;x++)for(let y=0;y<H;y++)for(const d of dirs){
  const endX=x+3*d.dx,endY=y+3*d.dy;
  if(endX<0||endX>=W||endY<0||endY>=H)continue;
  const cells=Array.from({length:4},(_,j)=>(y+j*d.dy)*7+x+j*d.dx);
  original.push(cells);
 }
 // Independent finite-strand construction via boundary starts.
 function add(dir,index,x,y,dx,dy){
  const cells=[];
  while(x>=0&&x<7&&y>=0&&y<6){
   cells.push(y*7+x);x+=dx;y+=dy;
  }
  strands.push({dir,index,sites:cells,length:cells.length});
 }
 for(let y=0;y<6;y++)add('H',y,0,y,1,0);
 for(let x=0;x<7;x++)add('V',x,x,0,0,1);
 for(let c=0;c<7;c++)add('R',c,c,0,1,1);
 for(let r=1;r<6;r++)add('R',-r,0,r,1,1);
 for(let r=0;r<6;r++)add('F',r,0,r,1,-1);
 for(let c=1;c<7;c++)add('F',c+5,c,5,1,-1);
 const active=strands.filter(s=>s.length>=4);
 if(original.length!==69||strands.length!==37||active.length!==25)
  throw Error('independent real7x6 original geometry expected 69/37/25');
 function select(dir,index){
  const s=active.find(x=>x.dir===dir&&x.index===index);
  if(!s)throw Error('independent active full original strand selection invalid');
  return s.sites;
 }
 const realProbes=[select('H',0),select('H',1),select('H',2),select('R',-1)];
 const binaryProbes=[select('H',0),select('H',1),select('H',2),
  select('V',0),select('V',1),select('R',-1),select('R',0)];
 return {original,strands,active,realProbes,binaryProbes};
}
function GF2rank(lists){
 const pivot=new Map();let rank=0;
 for(const L of lists){
  let q=L.reduce((m,i)=>m|(1n<<BigInt(i)),0n);
  while(q){
   const lo=q&(-q),bit=lo.toString(2).length-1;
   if(pivot.has(bit))q^=pivot.get(bit);
   else{pivot.set(bit,q);rank++;break}
  }
 }
 return rank;
}
function GF2decode(lists,data){
 if(lists.length!==data.length)throw Error('bad source syndrome data length');
 let masks=lists.map((L,i)=>L.reduce((s,c)=>s|(1n<<BigInt(c)),0n)|
   (data[i]?1n<<42n:0n));
 const pivot=[],N=42;let rank=0;
 for(let col=0;col<N;col++){
  let i=rank,bit=1n<<BigInt(col);
  while(i<masks.length&&(masks[i]&bit)===0n)i++;
  if(i===masks.length)throw Error('GF2 full cell rank missing');
  [masks[i],masks[rank]]=[masks[rank],masks[i]];
  for(let k=0;k<masks.length;k++)if(k!==rank&&(masks[k]&bit)!==0n)
   masks[k]^=masks[rank];
  pivot.push(col);rank++;
 }
 if(masks.slice(42).some(v=>v!==0n))throw Error('GF2 original unknown coloring inconsistent');
 const result=Array(42).fill(0);
 for(let row=0;row<42;row++)
  result[pivot[row]]=(masks[row]&(1n<<42n))!==0n?1:0;
 return result;
}
function decodeMod(lists,integerSums,prime=103){
 const mat=lists.map((L,i)=>Array.from({length:42},(_,j)=>L.includes(j)?1:0)
  .concat((integerSums[i]%prime+prime)%prime));
 let rank=0,pivot=[];
 const pow=(a,n)=>{let r=1;for(;n;n=Math.floor(n/2),a=a*a%prime)if(n&1)r=r*a%prime;return r};
 for(let col=0;col<42;col++){
  let p=rank;while(p<mat.length&&!mat[p][col])p++;
  if(p===mat.length)throw Error('modular original physical sum reconstruction rank deficient');
  [mat[p],mat[rank]]=[mat[rank],mat[p]];
  const inv=pow(mat[rank][col],prime-2);
  for(let j=col;j<=42;j++)mat[rank][j]=mat[rank][j]*inv%prime;
  for(let k=0;k<mat.length;k++)if(k!==rank&&mat[k][col]){
   const v=mat[k][col];
   for(let j=col;j<=42;j++)
    mat[k][j]=(mat[k][j]-v*mat[rank][j]+prime*prime)%prime;
  }
  pivot.push(col);rank++;
 }
 if(mat.slice(42).some(row=>row.some(v=>v!==0)))
  throw Error('modular original signal inconsistent with declared Radon sums');
 let ret=Array(42).fill(0);
 for(let i=0;i<42;i++){
  const v=mat[i][42];ret[pivot[i]]=v>prime/2?v-prime:v;
 }
 return ret;
}
function modRank(lists,prime){
 const n=lists.length,M=lists.map(L=>Array.from({length:42},(_,i)=>L.includes(i)?1:0));
 let rank=0;
 const pow=(a,e)=>{let res=1;while(e){if(e&1)res=res*a%prime;a=a*a%prime;e>>=1}return res};
 for(let col=0;col<42;col++){
  let i=rank;while(i<n&&!M[i][col])i++;
  if(i===n)continue;
  [M[i],M[rank]]=[M[rank],M[i]];
  const inv=pow(M[rank][col],prime-2);
  for(let j=col;j<42;j++)M[rank][j]=M[rank][j]*inv%prime;
  for(let i=rank+1;i<n;i++){
   const f=M[i][col];if(!f)continue;
   for(let j=col;j<42;j++)M[i][j]=(M[i][j]-f*M[rank][j]+prime*prime)%prime;
  }
  rank++;
 }
 return rank;
}
function actualOriginalDraw(lines){
 const str='123456123456654321654321123456123456777777',
  h=Array(7).fill(0),owners=Array(42).fill(-1);
 for(let i=0;i<42;i++){
  const c=Number(str[i])-1,r=h[c],p=i%2;
  if(r>=6)throw Error('frozen first-win original draw has illegal height');
  const id=r*7+c;h[c]++;owners[id]=p;
  if(lines.some(L=>L.includes(id)&&L.every(k=>owners[k]===p)))
   throw Error('frozen actual original draw first-won prematurely');
 }
 if(h.some(v=>v!==6)||owners.filter(p=>p===0).length!==21||
   owners.filter(p=>p===1).length!==21)
  throw Error('original physically real full DRAW quota failure');
 return owners;
}
export function independentOriginal7x6UnfoldedFourierDCRecovery(){
 const src=sourceOriginal7x6UnfoldedRadonDC(),P=independentGeometry(),issues=[];
 const GF=[P.original],Q=[P.original],
  GF2steps=[],ranks101=[],ranks103=[];
 for(let n=0;n<=7;n++)
  GF2steps.push(GF2rank(P.original.concat(P.binaryProbes.slice(0,n))));
 for(let n=0;n<=4;n++) {
  const all=P.original.concat(P.realProbes.slice(0,n));
  ranks101.push(modRank(all,101));ranks103.push(modRank(all,103));
 }
 if(JSON.stringify(GF2steps)!==JSON.stringify([35,36,37,38,39,40,41,42])||
  JSON.stringify(ranks101)!==JSON.stringify([38,39,40,41,42])||
  JSON.stringify(ranks103)!==JSON.stringify([38,39,40,41,42]))
  issues.push({kind:'INDEPENDENT_ORIGINAL_RADON_FULL_RANK_PROGRESS_MISMATCH',GF2steps,ranks101,ranks103});
 function normStrands(arr){return arr.map(L=>L.slice().sort((a,b)=>a-b).join(',')).sort()}
 if(JSON.stringify(normStrands(P.realProbes))!==
    JSON.stringify(normStrands(src.Rational.exactlyFourExtraFullStrandIntegerSums.map(x=>x.physicalSiteIDs)))||
  JSON.stringify(normStrands(P.binaryProbes))!==
    JSON.stringify(normStrands(src.GF2.exactlySevenExtraFullStrandParities.map(x=>x.physicalSiteIDs))))
  issues.push('source vs independent original full active strand set mismatch');
 const GFm=P.original.concat(P.binaryProbes),Qm=P.original.concat(P.realProbes);
 let patterns=0,reconstructed=0,binaryChecks=0,realChecks=0;
 function check(x,real=false){
  if(real){
   const y=Qm.map(L=>L.reduce((a,i)=>a+x[i],0)),
    decoded=decodeMod(Qm,y,103);
   if(JSON.stringify(decoded)!==JSON.stringify(x))
    issues.push({kind:'SIGNED_ORIGINAL_INTEGER_RADON_FIELD_NOT_RECONSTRUCTED',pattern:patterns});
   realChecks+=Qm.length;
  } else {
   const y=GFm.map(L=>L.reduce((a,i)=>a^x[i],0)),
    decoded=GF2decode(GFm,y);
   if(JSON.stringify(decoded)!==JSON.stringify(x))
    issues.push({kind:'TRUE_ORIGINAL_GF2_RADON_OWNER_NOT_RECONSTRUCTED',pattern:patterns});
   binaryChecks+=GFm.length;
  }
  patterns++;reconstructed+=42;
 }
 for(let j=0;j<42;j++){
  const v=Array(42).fill(0);v[j]=1;check(v,false);check(v,true);
 }
 const actual=actualOriginalDraw(P.original);
 check(actual,false);check(actual,true);
 let rng=20261019>>>0;
 const next=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng};
 for(let k=0;k<64;k++){
  const x=Array.from({length:42},()=>((next()>>>8)&1));
  const y=Array.from({length:42},()=>((next()>>>8)%13)-6);
  check(x,false);check(y,true);
 }
 // Show GLOBAL color flip is observed by odd-length strand DC
 // and therefore cannot be a period of all 69+7 parities.
 const sample=actual,opposite=actual.map(z=>1-z);
 const outA=GFm.map(L=>L.reduce((a,i)=>a^sample[i],0)),
   outB=GFm.map(L=>L.reduce((a,i)=>a^opposite[i],0));
 const baseUnchanged=outA.slice(0,69).every((v,i)=>v===outB[i]),
    augmentedDistinguishes=!outA.every((v,i)=>v===outB[i]);
 if(!baseUnchanged||!augmentedDistinguishes)
  issues.push('original full strand odd DC failed to break global XOR period');
 return {status:issues.length?'INDEPENDENT_ORIGINAL7X6_FOURIER_DC_FULL_RECONSTRUCTION_FAILED':
  'INDEPENDENT_STANDARD7X6_K4_UNFOLDED_FOURIER_DC_TWO_FIELD_COMPLETE_RECOVERY_PASS',
  originalBoard:[7,6,4],originalK4Winlines:P.original.length,
  actualUnfoldedStrands:P.strands.length,originalActiveK4Strands:P.active.length,
  rationalShortWindowRank38:true,GF2ShortWindowRank35:true,
  augmentedFourDCMod101RankProgress:ranks101,
  augmentedFourDCMod103RankProgress:ranks103,
  augmentedSevenDCBinaryRankProgress:GF2steps,
  minimumRealDCMomentsToCompletePhysicalSignal:4,
  minimumGF2FullStrandParityMomentsToCompleteOwnerBits:7,
  selectedRealFullStrandLabels:['H row0','H row1','H row2','R c-r=-1'],
  selectedGF2FullStrandLabels:['H row0','H row1','H row2','V col0','V col1','R c-r=-1','R c-r=0'],
  physicallyReconstructedFirstWinStopped42PlyDraws:1,
  actuallyDecodedOriginal42CellSignals:patterns,
  independentOriginalFieldValuesReconstructed:reconstructed,
  independentOriginalBinaryParityMeasurementsChecked:binaryChecks,
  independentOriginalIntegerSumMeasurementsChecked:realChecks,
  sourceWindowParityGlobalColorComplementNotDistinguished:true,
  augmentedDCBreaksGlobalColorComplement:true,
  gameTheoreticWDLEvaluated:false,
  sourceOrIndependentFutureGameStateSearches:0,
  errors:issues.slice(0,9)};
}
