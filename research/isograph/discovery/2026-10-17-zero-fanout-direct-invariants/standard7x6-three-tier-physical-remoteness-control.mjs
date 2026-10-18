// INDEPENDENT 7x6 physical reference ONLY (NOT a zero-branch producer).
// Frozen before run. L1 V, L2 ALL WDL optimal literal actions, L3
// remoteness MIN winner time / MAX losing delay UNDER WDL-FIRST play.
// Nonterminal game sources are legitimate gravity and FIRST-WIN stopped.
// All tests use W=7 H=6 K=4, though geometry parameters are explicit.
const W=7,H=6,K=4,N=W*H;
const bit=(c,r)=>1n<<BigInt(r*W+c),through=Array.from({length:N},()=>[]);
let lines=0;for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const x=c+(K-1)*dx,y=r+(K-1)*dy;
  if(x>=W||y<0||y>=H)continue;
  let mask=0n,ids=[];
  for(let j=0;j<K;j++){
   const id=(r+j*dy)*W+(c+j*dx);ids.push(id);
   mask|=1n<<BigInt(id);
  }
  for(const id of ids)through[id].push(mask);
  lines++;
 }
if(lines!==69)throw Error('wrong original win geometry');
const legal=q=>q.h.flatMap((height,c)=>height<H?[c]:[]);
const blank=()=>({h:Array(W).fill(0),P:[0n,0n],n:0,history:''});
function move(q,c){
 const mover=q.n&1,r=q.h[c],x=bit(c,r);
 if(r>=H)throw Error('gravity illegal');
 const h=q.h.slice();h[c]++;
 const P=q.P.slice();P[mover]|=x;
 const id=r*W+c,win=through[id].some(g=>(P[mover]&g)===g);
 return {h,P,n:q.n+1,history:q.history+String(c+1),win,winner:win?mover:null,terminal:win||q.n+1===N};
}
const memo=new Map(),plainMemo=new Map();
const stats={schema:'connect4.standard7x6.hierarchical_WDL_all_Mstar_remoteness_v0_1',
 date:'2026-10-17',W,H,K,originalWinningLines:69,
 seedStart:0x6317FEC4,sampledTrajectories:0,realLegalLateNonterminalStates:0,
 distinctRootPhysicalPositions:0,literalRootActionValues:0,
 fullWDLAndAllMstarRoots:0,
 rootMinimaxWDLComparisons:0,wrongIndependentPlainWDL:0,
 rootP0Winners:0,rootP1Winners:0,rootDraws:0,
 winningRootMover:0,losingRootMover:0,
 winningMultiBestDifferentDistances:0,losingMultiBestDifferentDistances:0,
 sameWDLButDifferentAllOptimalMasks:null,
 sameWDLAndSameAllOptimalMasksButDifferentRemoteness:null,
 winnerMovesSameWDLDifferentTime:null,loserMovesSameWDLDifferentTime:null,
 distanceBoundFailures:0,
 memoStats:{calls:0,hits:0,states:0},plainMemoStats:{calls:0,hits:0,states:0},
 zeroBranchCandidateGameValuesComputed:0,
 evidenceClass:'INDEPENDENT_RECURSIVE_PHYSICAL_REFERENCE_ONLY',
 seedEnd:null};
let seed=stats.seedStart>>>0;
function rand(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed;}
function key(q){return q.P[0].toString(16)+'|'+q.P[1].toString(16);}
function plain(q){
 stats.plainMemoStats.calls++;
 if(q.win)return q.winner===0?1:-1;
 if(q.n===N)return 0;
 const k=key(q);if(plainMemo.has(k)){stats.plainMemoStats.hits++;return plainMemo.get(k);}
 stats.plainMemoStats.states++;
 let v=q.n%2===0?-1:1;
 for(const a of legal(q)){
  const value=plain(move(q,a));
  v=q.n%2===0?Math.max(v,value):Math.min(v,value);
 }
 plainMemo.set(k,v);return v;
}
function solve(q){
 stats.memoStats.calls++;
 if(q.win)return {V:q.winner===0?1:-1,D:0,M:[],Mtime:[],actions:[]};
 if(q.n===N)return {V:0,D:null,M:[],Mtime:null,actions:[]};
 const k=key(q),known=memo.get(k);
 if(known){stats.memoStats.hits++;return known;}
 stats.memoStats.states++;
 const mover=q.n&1,actionValues=[];
 for(const a of legal(q)){
  const next=move(q,a),r=solve(next);
  actionValues.push({a:a+1,v:r.V,d:r.D===null?null:1+r.D});
 }
 const V=mover===0?Math.max(...actionValues.map(x=>x.v)):Math.min(...actionValues.map(x=>x.v));
 const best=actionValues.filter(x=>x.v===V);
 let D=null,Mtime=null;
 if(V!==0){
  if(best.some(x=>!Number.isInteger(x.d)))throw Error('winning or losing child missing remoteness');
  const moverRelative=(mover===0?1:-1)*V;
  D=moverRelative===1?Math.min(...best.map(x=>x.d)):Math.max(...best.map(x=>x.d));
  if(D<1||D>N-q.n){stats.distanceBoundFailures++;throw Error('impossible time to FIRST terminal');}
  Mtime=best.filter(x=>x.d===D).map(x=>x.a);
 }else if(best.some(x=>x.d!==null)){
  throw Error('draw remoteness is deliberately undefined');
 }
 const out={V,D,M:best.map(x=>x.a),Mtime,actions:actionValues};
 memo.set(k,out);return out;
}
const late=new Map();
for(let trial=0;trial<3700;trial++){
 stats.sampledTrajectories++;
 let q=blank();
 while(q.n<N){
  if(q.n>=32&&legal(q).length>=2){
   const id=key(q);
   if(!late.has(id))late.set(id,q);
   stats.realLegalLateNonterminalStates++;
  }
  const safe=legal(q).map(a=>move(q,a)).filter(next=>!next.win&&!next.terminal);
  if(!safe.length)break;
  q=safe[rand()%safe.length];
 }
}
stats.distinctRootPhysicalPositions=late.size;
const comparisons=new Map(),withSameM=new Map();
function signature(q,r){
 return {history:q.history,n:q.n,heights:q.h.slice(),
  P0:q.P[0].toString(),P1:q.P[1].toString(),mover:q.n&1,
  V:r.V,M:r.M,D:r.D,Mtime:r.Mtime,actionValues:r.actions};
}
let checked=0;
for(const q of late.values()){
 if(q.n<35)continue;
 const r=solve(q);
 checked++;stats.fullWDLAndAllMstarRoots++;
 stats.literalRootActionValues+=r.actions.length;
 if(r.V===1)stats.rootP0Winners++;
 else if(r.V===-1)stats.rootP1Winners++;
 else stats.rootDraws++;
 if(r.V!==0){
  const moverRelative=r.V*(q.n%2===0?1:-1);
  if(moverRelative===1)stats.winningRootMover++;else stats.losingRootMover++;
  const distances=r.actions.filter(x=>r.M.includes(x.a)).map(x=>x.d);
  if(new Set(distances).size>1){
   if(moverRelative===1){
    stats.winningMultiBestDifferentDistances++;
    if(!stats.winnerMovesSameWDLDifferentTime)stats.winnerMovesSameWDLDifferentTime=signature(q,r);
   }else{
    stats.losingMultiBestDifferentDistances++;
    if(!stats.loserMovesSameWDLDifferentTime)stats.loserMovesSameWDLDifferentTime=signature(q,r);
   }
  }
 }
 const Vkey=String(r.V);
 const earlier=comparisons.get(Vkey);
 if(earlier&&earlier.r.M.join(',')!==r.M.join(',')&&!stats.sameWDLButDifferentAllOptimalMasks)
  stats.sameWDLButDifferentAllOptimalMasks={A:signature(earlier.q,earlier.r),B:signature(q,r)};
 else if(!earlier)comparisons.set(Vkey,{q,r});
 if(r.V!==0){
  const Mkey=r.V+':'+r.M.join(',');
  const previous=withSameM.get(Mkey);
  if(previous&&previous.r.D!==r.D&&!stats.sameWDLAndSameAllOptimalMasksButDifferentRemoteness)
   stats.sameWDLAndSameAllOptimalMasksButDifferentRemoteness={
    A:signature(previous.q,previous.r),B:signature(q,r)};
  else if(!previous)withSameM.set(Mkey,{q,r});
 }
 // Plain MIN/MAX is an INDEPENDENT VALUE-only validation of timing layer;
 // it does NOT use any remoteness or complete optimal move information.
 if(checked<=850){
  const p=plain(q);stats.rootMinimaxWDLComparisons++;
  if(p!==r.V){stats.wrongIndependentPlainWDL++;throw Error('timed hierarchy changed ordinary WDL');}
 }
 if(stats.fullWDLAndAllMstarRoots>=2500)break;
}
stats.seedEnd=seed;
console.log(JSON.stringify(stats,null,2));
