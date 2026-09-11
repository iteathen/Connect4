import{DenseLineSolver}from'./dense_solver.mjs';class Dense extends DenseLineSolver{constructor(mode,budget){super(budget);}}
import assert from 'node:assert/strict';import{readFileSync,writeFileSync}from'node:fs';import{createHash}from'node:crypto';
import{LineSolver}from'./line_solver.mjs';import{FastLineSolver}from'./specialize.mjs';
import{geometry,parse,stateArgs,rng,rollout,oracle,fromBoard,won,minimal}from'./support.mjs';
import{Solver}from'../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';
const G=geometry(),emit=x=>console.log(JSON.stringify(x)),rnd=rng(0x41b23ca7);
let count=0,children=0,windows=0,nonExactBounds=0,oracleNodes=0;const testRoots=[];
function check(s,child=false){
 const truth=oracle(s,G);oracleNodes+=truth.nodes;
 const base=new Solver(10,false),want=truth.score;assert.equal(base.solveBits(...stateArgs(s)),want);
 for(const [label,T,mode]of[['raw',LineSolver,'raw'],['compiled',LineSolver,'compiled'],['specialized',FastLineSolver,'compiled'],['dense',Dense,'compiled']]){
  const q=new T(mode,14*1024);q.compile(s);const got=q.solve();assert.equal(got,want,`${label} ${s.seq}`);
  // Raw internal kernel has no-immediate-current-win entry contract.
  const immediate=truth.scores.some(x=>x===Math.trunc((43-s.moves)/2));
  if(!immediate)for(let a=-4;a<4;a++){
   q.clear();const r=q.search(...q.rootLive,q.eLo,q.eHi,q.height,q.rootMoves,a,a+1);
   assert.equal(r<=a,want<=a);if(r<=a)assert(want<=r);else assert(want>=r);
   if(r!==want)nonExactBounds++;windows++;
  }
 }
 if(child)children++;else{count++;testRoots.push({seq:s.seq,score:want,oracleNodes:truth.nodes});}
}
for(let tries=0;count<96&&tries<20000;tries++){
 const n=34+count%6,s=rollout(n,rnd,G);if(!s)continue;check(s);
 if(count<=24)for(let c=0;c<7;c++){
  if(s.heights[c]===6)continue;
  try{check(parse(s.seq+(c+1)),true);}catch(e){if(e.message==='terminal sequence')continue;throw e;}
 }
}
assert.equal(count,96);emit({kind:'oracle',roots:count,childRoots:children,windowChecks:windows,nonExactBounds,oracleNodes,cases:testRoots});
for(const[seq,expected]of[['121212',18],['663152175',-4],['41267575',3]])for(const[T,mode]of[[LineSolver,'raw'],[LineSolver,'compiled'],[FastLineSolver,'compiled'],[Dense,'compiled']]){
 const q=new T(mode,14*131072);const meta=q.compile(parse(seq));const t=performance.now(),score=q.solve();assert.equal(score,expected);emit({kind:'anchor',seq,mode,type:T.name,score,nodes:q.nodes,ms:performance.now()-t,...meta});
}
// Exhaustive actual-game equivalence, independent 4x3 connect-3 mechanics.
const small=geometry(4,3,3),cache=new Map(),classes=[new Map(),new Map()],b=new Uint8Array(12),heights=new Uint8Array(4);
let transitions=0,merges=[0,0];
function signature(s,reduce){
 const goals=[[],[]];let h=0;for(let c=0;c<4;c++)h|=s.heights[c]<<(3*c);
 const own=[[s.cLo,s.cHi],[(s.cLo^s.mLo)>>>0,(s.cHi^s.mHi)>>>0]];
 for(let p=0;p<2;p++)for(let j=0;j<small.lines.length;j++){
  const[a,z]=small.lines[j];if(((a&own[p^1][0])|(z&own[p^1][1]))===0)goals[p].push(reduce?[(a&~s.mLo)>>>0,(z&~s.mHi)>>>0]:[j,0]);
 }
 if(reduce)for(let p=0;p<2;p++)goals[p]=minimal(goals[p]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 return JSON.stringify([h,s.moves&1,goals]);
}
function visit(n){
 const key=b.join('');if(cache.has(key))return cache.get(key);
 const s=fromBoard(b,heights,n,small),sig=[signature(s,false),signature(s,true)],outs=[[],[]];let best=n===12?0:-99;
 for(let c=0;c<4;c++){
  const r=heights[c];if(r===3){outs[0].push(null);outs[1].push(null);continue;}
  b[r*4+c]=(n&1)+1;heights[c]++;const win=won(b,4,3,3,c,r,(n&1)+1);let value;
  if(win){value=Math.trunc((13-n)/2);outs[0].push(['win',value]);outs[1].push(['win',value]);}
  else{const child=fromBoard(b,heights,n+1,small);outs[0].push(signature(child,false));outs[1].push(signature(child,true));value=-visit(n+1);}
  heights[c]--;b[r*4+c]=0;best=Math.max(best,value);transitions++;
 }
 if(best===0)best=0;cache.set(key,best);
 for(let i=0;i<2;i++){const result=JSON.stringify([best,outs[i]]),old=classes[i].get(sig[i]);if(old!==undefined){assert.equal(old,result);merges[i]++;}else classes[i].set(sig[i],result);}
 return best;
}
const smallScore=visit(0);emit({kind:'exhaustive',dimensions:'4x3-k3',states:cache.size,transitions,rawLineClasses:classes[0].size,minimalRequirementClasses:classes[1].size,merges,rootScore:smallScore});
emit({kind:'PASS',concurrencyClaim:false,earlyPositionsIndependentOracle:false});
