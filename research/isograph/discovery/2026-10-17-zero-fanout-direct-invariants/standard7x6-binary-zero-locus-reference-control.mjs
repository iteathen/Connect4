// Independent source-theorem FALSIFIER on actual W=7,H=6,K=4.
// Ordinary physical P0 MAX/P1 MIN reference versus two binary NAND kernels
// with terminal first-win=(0,0), terminal full draw=(p,1 XOR p).
// Both recursive procedures BRANCH by design and are REFERENCE ONLY, never
// used by a claimed zero-strategic-fanout producer. Separate value memo maps.
// Frozen before execution, 2026-10-17, research/semantic-quotient.
const W=7,H=6,K=4,N=W*H,byCell=Array.from({length:N},()=>[]);
let totalLines=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const cc=c+(K-1)*dx,rr=r+(K-1)*dy;
  if(cc<0||cc>=W||rr<0||rr>=H)continue;
  let mask=0n,ids=[];
  for(let j=0;j<K;j++){const id=(r+j*dy)*W+c+j*dx;ids.push(id);mask|=1n<<BigInt(id);}
  for(const id of ids)byCell[id].push(mask);
  totalLines++;
 }
if(totalLines!==69)throw Error('not standard Connect4 geometry');
let randSeed=0xB1A6F042>>>0;
function rand(){randSeed=(Math.imul(randSeed,1664525)+1013904223)>>>0;return randSeed;}
const stats={schema:'connect4.standard7x6.binary_zero_locus_optimal_reconstruction_v0_1',
 board:{W,H,K,geometricWinLines:totalLines},
 sourceSelection:'Actual 7x6 at ply>=36 with at least TWO currently legal literal columns, sorted by count of legal columns (descending) then rank ascending; not unique optimal count',seedStart:randSeed,nonterminalTrajectoriesGenerated:0,eligibleLateSourcePositions:0,
 uniqueLatePhysicalRootPositions:0,rootValuesChecked:0,legalLiteralActionValuesChecked:0,
 wrongRootValues:0,wrongOptimalLiteralMasks:0,wrongFirstActionValues:0,
 tiedBestRootPositions:0,singleBestRootPositions:0,
 zeroLocusReconstructionsChecked:0,wrongNestedLocus:0,wrongReconstructedValue:0,wrongReconstructedBestSet:0,
 drawXORMatches:0,dualZeroLociBothEmpty:0,dualZeroLociBothNonempty:0,
 rootValueDistribution:{P0win:0,draw:0,P1win:0},
 minimax:{calls:0,memoHits:0,nodes:0},
 binaryKernel:{calls:0,memoHits:0,nodes:0,terminalWins:0,terminalDraws:0},
 canonicalSourcePrefixes:['44444','444444','4444442'],
 canonicalSourcePrimaryUnrestrictedWDL:'NOT_COMPUTED',zeroLociComputedFromIndependentBranchingReference:true,sourceOnlyZeroLocusAlgorithmDiscovered:false};
const seeds=Array.from({length:W},()=>0);
const minimaxMemo=new Map(),kernelMemo=new Map();
function stateKey(st){return st.P[0].toString(16)+'|'+st.P[1].toString(16);}
function legal(st){const a=[];for(let c=0;c<W;c++)if(st.h[c]<H)a.push(c);return a;}
function move(st,c){
 const side=st.n%2,row=st.h[c],id=row*W+c,mask=1n<<BigInt(id);
 const h=st.h.slice();h[c]++;
 const P=st.P.slice();P[side]|=mask;
 return {h,P,n:st.n+1,lastCell:id,lastSide:side};
}
function lastMoveWon(st){
 if(st.lastCell===undefined)return false;
 return byCell[st.lastCell].some(mask=>(st.P[st.lastSide]&mask)===mask);
}
function base(st){
 stats.minimax.calls++;
 if(lastMoveWon(st))return st.lastSide===0?1:-1;
 if(st.n===N)return 0;
 const key=stateKey(st),memo=minimaxMemo.get(key);
 if(memo!==undefined){stats.minimax.memoHits++;return memo;}
 stats.minimax.nodes++;
 let best=st.n%2===0?-1:1;
 for(const c of legal(st)){
  const v=base(move(st,c));
  if(st.n%2===0)best=Math.max(best,v);else best=Math.min(best,v);
 }
 minimaxMemo.set(key,best);return best;
}
function nand(st){
 stats.binaryKernel.calls++;
 if(lastMoveWon(st)){stats.binaryKernel.terminalWins++;return [0,0];}
 if(st.n===N){stats.binaryKernel.terminalDraws++;const p=st.n%2;return [p,1^p];}
 const key=stateKey(st),memo=kernelMemo.get(key);
 if(memo!==undefined){stats.binaryKernel.memoHits++;return memo;}
 stats.binaryKernel.nodes++;
 let andWin=1,andNoLoss=1;
 for(const c of legal(st)){
  const g=nand(move(st,c));
  andWin&=g[0];andNoLoss&=g[1];
 }
 const result=[1^andWin,1^andNoLoss];
 kernelMemo.set(key,result);return result;
}
function decode(st,g){
 const p=st.n%2,win=g[0]^p,nonloss=g[1]^p;
 if(win===1&&nonloss===1)return 1;
 if(win===0&&nonloss===1)return 0;
 if(win===0&&nonloss===0)return -1;
 throw Error('invalid two-threshold WDL ordering after XOR');
}
function fresh(){return {h:Array(W).fill(0),P:[0n,0n],n:0};}
function fromHistory(history){
 let st=fresh();
 for(const digit of history){
  const c=Number(digit)-1;
  if(c<0||c>=W||st.h[c]===H)throw Error('invalid canonical move');
  st=move(st,c);
  if(lastMoveWon(st))throw Error('canonical legal source must not already win');
 }
 return st;
}
for(const history of stats.canonicalSourcePrefixes){
 const st=fromHistory(history);
 if(st.n!==history.length)throw Error('canonical chronology misread');
}
let sources=new Map();
for(let tr=0;tr<2700;tr++){
 stats.nonterminalTrajectoriesGenerated++;
 let st=fresh();
 for(let t=0;t<N;t++){
  if(st.n>=36&&st.n<N){
   stats.eligibleLateSourcePositions++;
   const key=stateKey(st);
   if(!sources.has(key))sources.set(key,st);
  }
  const candidates=legal(st).filter(c=>!lastMoveWon(move(st,c)));
  if(!candidates.length)break;
  st=move(st,candidates[rand()%candidates.length]);
 }
}
stats.uniqueLatePhysicalRootPositions=sources.size;
const roots=[...sources.values()].filter(st=>legal(st).length>=2)
  .sort((a,b)=>legal(b).length-legal(a).length||a.n-b.n).slice(0,600);
for(const st of roots){
 const v=base(st),g=nand(st),got=decode(st,g);
 stats.rootValuesChecked++;
 if(got!==v){stats.wrongRootValues++;throw Error('binary NAND transformed root value disagrees physical minimax');}
 const baseAction=[],nandAction=[];
 for(const c of legal(st)){
  const child=move(st,c);
  const ref=base(child),bin=decode(child,nand(child));
  stats.legalLiteralActionValuesChecked++;
  baseAction.push([c+1,ref]);nandAction.push([c+1,bin]);
  if(ref!==bin){stats.wrongFirstActionValues++;throw Error('NAND literal action mismatch');}
 }
 const bestBase=baseAction.filter(([,x])=>x===v).map(([c])=>c);
 const bestNand=nandAction.filter(([,x])=>x===got).map(([c])=>c);
 if(bestBase.join(',')!==bestNand.join(',')){stats.wrongOptimalLiteralMasks++;throw Error('complete optimal action mask mismatch');}
 const zPlus=[],zZero=[];
 for(const c of legal(st)){
  const child=move(st,c),gChild=nand(child);
  if(gChild[0]===0)zPlus.push(c+1);
  if(gChild[1]===0)zZero.push(c+1);
 }
 const mover=st.n%2;
 const subset=(a,b)=>a.every(x=>b.includes(x));
 if(!(mover===0?subset(zPlus,zZero):subset(zZero,zPlus))){
  stats.wrongNestedLocus++;throw Error('threshold zero-locus containment failed');
 }
 const all=legal(st).map(c=>c+1);
 let fromZero,optimalZero;
 if(mover===0){
  if(zPlus.length){fromZero=1;optimalZero=zPlus;}
  else if(zZero.length){fromZero=0;optimalZero=zZero;}
  else {fromZero=-1;optimalZero=all;}
 }else{
  if(zZero.length){fromZero=-1;optimalZero=zZero;}
  else if(zPlus.length){fromZero=0;optimalZero=zPlus;}
  else {fromZero=1;optimalZero=all;}
 }
 if(fromZero!==v){stats.wrongReconstructedValue++;throw Error('zero-locus reconstructed wrong root WDL');}
 if(optimalZero.join(',')!==bestBase.join(',')){
  stats.wrongReconstructedBestSet++;throw Error('zero-locus complete optimal literal mask mismatch');
 }
 if((g[0]^g[1])!==(v===0?1:0))throw Error('draw bit should equal XOR of terminal-tagged kernels');
 stats.drawXORMatches++;stats.zeroLocusReconstructionsChecked++;
 if(!zPlus.length&&!zZero.length)stats.dualZeroLociBothEmpty++;
 if(zPlus.length&&zZero.length)stats.dualZeroLociBothNonempty++;
 if(bestBase.length>1)stats.tiedBestRootPositions++;else stats.singleBestRootPositions++;
 if(v===1)stats.rootValueDistribution.P0win++;
 if(v===0)stats.rootValueDistribution.draw++;
 if(v===-1)stats.rootValueDistribution.P1win++;
}
console.log(JSON.stringify(stats));
