// INDEPENDENT true7x6 physical array-grid validation of the filled-center
// two-word source XOR shuffle and bridge factorization. FROZEN BEFORE RUN.
// Hypothetical complete suffix words are validation inputs, never strategic
// future-game values, game trees, policies, or hidden zero-locus alternatives.
import {createFilledCenterShuffleBridge} from './standard7x6-center-shuffle-bridge-source.mjs';
const W=7,H=6,K=4,N=W*H,center=3,bit=(c,r)=>1n<<BigInt(r*W+c);
const source=createFilledCenterShuffleBridge({width:W,height:H,connect:K});
const dirs=[[1,0],[0,1],[1,1],[1,-1]],lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of dirs){
 const ce=c+(K-1)*dx,re=r+(K-1)*dy;
 if(ce>=W||re<0||re>=H)continue;
 let mask=0n;for(let j=0;j<K;j++)mask|=bit(c+j*dx,r+j*dy);
 lines.push(mask);
}
if(lines.length!==69)throw Error('not standard 7x6 original-line incidence');
const hist='444444',h=Array(W).fill(0),P=[0n,0n];
for(let n=0;n<hist.length;n++){const c=Number(hist[n])-1,r=h[c]++,p=n&1;P[p]|=bit(c,r);}
const support=P[0]|P[1];
const pop=g=>{let n=0;for(;g;g&=g-1n)n++;return n;};
function normal(arr){
 const gs=[...new Set(arr.map(String))].map(BigInt)
  .sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
 const out=[];for(const g of gs)if(!out.some(x=>(g&x)===x))out.push(g);
 return out;
}
const q={h:h.slice(),R0:[],R1:[]};
for(let p=0;p<2;p++)for(const line of lines){
 if((line&P[1-p])!==0n)continue;
 const mask=line&~support;
 if(mask===0n)throw Error('canonical prefix already terminal');
 (p===0?q.R0:q.R1).push(mask);
}
q.R0=normal(q.R0);q.R1=normal(q.R1);
if(q.R0.length!==42||q.R1.length!==42)throw Error('canonical center-full original residual family count wrong');
const classified=source.classify(q);
if(classified.categories.P0.bridge!==12||classified.categories.P1.bridge!==12)
 throw Error('center cross-side source bridge classification disagrees preserved 7x6 evidence');
let rng=0x4A77D02C>>>0;
const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng;};
function winFromLast(grid,c,r,p){
 for(const [dx,dy] of dirs){
  let run=1;
  for(const direction of [-1,1]){
   let x=c+direction*dx,y=r+direction*dy;
   while(x>=0&&x<W&&y>=0&&y<H&&grid[x][y]===p){
    run++;x+=direction*dx;y+=direction*dy;
   }
  }
  if(run>=K)return true;
 }
 return false;
}
function directFirstWin(suffix){
 const grid=Array.from({length:W},()=>Array(H).fill(-1)),running=Array(W).fill(0);
 for(let i=0;i<hist.length;i++){
  const c=Number(hist[i])-1,r=running[c]++,p=i&1;
  grid[c][r]=p;
  if(winFromLast(grid,c,r,p))throw Error('center-full source already won');
 }
 for(let z=0;z<suffix.length;z++){
  const c=suffix[z],r=running[c]++,p=(hist.length+z)&1;
  if(c===center||r>=H)throw Error('invalid hypothetical gravity suffix');
  grid[c][r]=p;
  if(winFromLast(grid,c,r,p))return {winner:p,absoluteTurn:hist.length+z+1};
 }
 return {winner:null,absoluteTurn:null};
}
function randomFullWord(){
 const counts=Array(W).fill(0),seq=[];
 while(seq.length<N-hist.length){
  const eligible=[];for(let c=0;c<W;c++)if(c!==center&&counts[c]<H-h[c])eligible.push(c);
  const c=eligible[rand()%eligible.length];seq.push(c);counts[c]++;
 }
 return seq;
}
function split(word){
 return {L:word.filter(c=>c<center),R:word.filter(c=>c>center)};
}
function reshuffle(L,R){
 let i=0,j=0,out=[];
 while(i<L.length||j<R.length){
  if(i===L.length)out.push(R[j++]);
  else if(j===R.length)out.push(L[i++]);
  else if((rand()&1)===0)out.push(L[i++]);
  else out.push(R[j++]);
 }
 return out;
}
const results={schema:'connect4.standard7x6.full_center_left_right_shuffle_bridge_v0_1',
 geometry:{W,H,K,originalWinlines:69},history:hist,canonicalResidualCounts:[q.R0.length,q.R1.length],
 categories:classified.categories,seedStart:rng,
 independentPhysicalFirstWinComparisons:0,sourceBridgeConjunctionsChecked:0,
 independentlyVerifiedEventPhaseChecks:0,sampledFixedRegionalWordPairs:0,
 identicalProjectedWordsYetDifferentTerminalWinner:0,
 identicalProjectedWordsYetDifferentFirstWinTime:0,
 fourRibbonBridgeOriginalWindowsVerified:0,
 sourceVsPhysicalWinnerMismatch:0,sourceVsPhysicalFirstWinMismatch:0,
 firstNontrivialShuffleWitness:null,exampleBridges:{P0:[],P1:[]},
 totalHypotheticalCompleteFutureWords:0,sourceGameSemanticValuesQueried:0};
for(let p=0;p<2;p++)for(const row of classified.R[p]){
 if(row.category!=='BRIDGE')continue;
 const projectedIDs=Array.from({length:N},(_,id)=>id).filter(id=>(row.mask&(1n<<BigInt(id)))!==0n);
 if(!lines.some(mask=>(mask&row.mask)===row.mask))
  throw Error('bridge source generator lacks a genuine original K-line');
 results.fourRibbonBridgeOriginalWindowsVerified++;
 if(results.exampleBridges[p===0?'P0':'P1'].length<3)
  results.exampleBridges[p===0?'P0':'P1'].push({
   generator:projectedIDs.map(id=>[id%W+1,Math.floor(id/W)+1]),
   left:projectedIDs.filter(id=>id%W<center).map(id=>[id%W+1,Math.floor(id/W)+1]),
   right:projectedIDs.filter(id=>id%W>center).map(id=>[id%W+1,Math.floor(id/W)+1])
  });
}
for(let t=0;t<2800;t++){
 const a=randomFullWord(),project=split(a),b=reshuffle(project.L,project.R);
 const projectedB=split(b);
 if(project.L.join(',')!==projectedB.L.join(',')||project.R.join(',')!==projectedB.R.join(','))
  throw Error('control shuffle changed internal regional word order');
 const pair=[];
 for(const w of [a,b]){
  const sourceScore=source.evaluate(q,w),physicalScore=directFirstWin(w);
  results.totalHypotheticalCompleteFutureWords++;
  results.independentPhysicalFirstWinComparisons++;
  results.sourceBridgeConjunctionsChecked+=sourceScore.booleanBridgeConjunctionChecks;
  results.independentlyVerifiedEventPhaseChecks+=sourceScore.phaseChecks;
  if(sourceScore.firstWinner!==physicalScore.winner){
   results.sourceVsPhysicalWinnerMismatch++;
   throw Error('two-region source vs physical FIRST winner mismatch');
  }
  if(sourceScore.firstWinAbsoluteTurn!==physicalScore.absoluteTurn){
   results.sourceVsPhysicalFirstWinMismatch++;
   throw Error('two-region source vs physical FIRST win rank mismatch');
  }
  pair.push(sourceScore);
 }
 results.sampledFixedRegionalWordPairs++;
 if(pair[0].firstWinner!==pair[1].firstWinner)
  results.identicalProjectedWordsYetDifferentTerminalWinner++;
 if(pair[0].firstWinAbsoluteTurn!==pair[1].firstWinAbsoluteTurn)
  results.identicalProjectedWordsYetDifferentFirstWinTime++;
 if(!results.firstNontrivialShuffleWitness&&pair[0].firstWinner!==pair[1].firstWinner)
  results.firstNontrivialShuffleWitness={
   firstFullWordOneBased:pair[0].interleavedFullWordOneBased,
   secondFullWordOneBased:pair[1].interleavedFullWordOneBased,
   sameLeftWordOneBased:pair[0].leftWordOneBased,
   sameRightWordOneBased:pair[0].rightWordOneBased,
   resultA:{winner:pair[0].firstWinner,firstWinAbsoluteTurn:pair[0].firstWinAbsoluteTurn,
     generator:pair[0].sourceWinningGenerator},
   resultB:{winner:pair[1].firstWinner,firstWinAbsoluteTurn:pair[1].firstWinAbsoluteTurn,
     generator:pair[1].sourceWinningGenerator}
  };
}
results.seedFinal=rng;
console.log(JSON.stringify(results,null,2));
