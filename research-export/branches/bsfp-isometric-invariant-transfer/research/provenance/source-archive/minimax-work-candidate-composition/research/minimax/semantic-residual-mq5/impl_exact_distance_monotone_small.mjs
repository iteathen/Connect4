import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

function popBig(v){let n=0;while(v){v&=v-1n;n++;}return n;}
function geom(w,h,k){
  const lines=[];
  for(let r=0;r<h;r++)for(let c=0;c<w;c++)for(const[dx,dy]of[[1,0],[0,1],[1,1],[1,-1]]){
    const x=c+(k-1)*dx,y=r+(k-1)*dy;if(x<0||x>=w||y<0||y>=h)continue;
    let m=0n;for(let j=0;j<k;j++)m|=1n<<BigInt((r+j*dy)*w+c+j*dx);lines.push(m);
  }
  const us=new Set();for(const line of lines)for(let subset=line;subset!==0n;subset=(subset-1n)&line)us.add(subset);
  const req=[...us].sort((a,b)=>popBig(a)-popBig(b)||(a<b?-1:a>b?1:0));
  const id=new Map(req.map((m,i)=>[m.toString(),i])),up=new Array(req.length),subset=new Uint8Array(req.length*req.length);
  for(let a=0;a<req.length;a++)for(let b=0;b<req.length;b++)if((req[a]&~req[b])===0n)subset[a*req.length+b]=1;
  for(let b=0;b<req.length;b++){let z=0n;for(let r=0;r<req.length;r++)if(subset[b*req.length+r])z|=1n<<BigInt(r);up[b]=z;}
  return{w,h,k,cells:w*h,lines,req,id,up,subset};
}
function packHeight(hs){let x=0;for(let c=0;c<hs.length;c++)x|=hs[c]<<(3*c);return x>>>0;}

function run(w,h,k){
  const g=geom(w,h,k),sideMap=new Map(),sides=[],states=new Map(),bySupport=new Map(),heights=new Uint8Array(w),scratch=[];
  function normalize(ids){
    ids.sort((a,b)=>a-b);let write=0,prev=-1;
    outer:for(const rid of ids){if(rid===prev)continue;prev=rid;for(let j=0;j<write;j++)if(g.subset[ids[j]*g.req.length+rid])continue outer;ids[write++]=rid;}ids.length=write;return ids;
  }
  function internSide(ids,canonical=false){if(!canonical)normalize(ids);const key=ids.join('.'),old=sideMap.get(key);if(old!==undefined)return old;let bits=0n,upUnion=0n;for(const rid of ids){bits|=1n<<BigInt(rid);upUnion|=g.up[rid];}const ref=sides.length;sides.push({ids:[...ids],bits,upUnion});sideMap.set(key,ref);return ref;}
  function implies(aRef,bRef){const A=sides[aRef],B=sides[bRef];if(A.ids.length===0)return true;if(B.ids.length===0)return false;return(A.bits&~B.upUnion)===0n;}
  function fav(aCur,aOpp,bCur,bOpp){return implies(bCur,aCur)&&implies(aOpp,bOpp);}
  function mover(ref,cell){const bit=1n<<BigInt(cell),ids=sides[ref].ids;scratch.length=0;for(const rid of ids){const q=g.req[rid]&~bit;if(q===0n)return-1;scratch.push(g.id.get(q.toString()));}return internSide(scratch,false);}
  function blocker(ref,cell){const bit=1n<<BigInt(cell),ids=sides[ref].ids;scratch.length=0;for(const rid of ids)if((g.req[rid]&bit)===0n)scratch.push(rid);return scratch.length===ids.length?ref:internSide(scratch,true);}
  const init=internSide(g.lines.map(m=>g.id.get(m.toString())),false);
  let calls=0;
  function rec(cur,opp,moves){
    calls++;const support=packHeight(heights),key=`${support}|${cur}/${opp}`,cached=states.get(key);if(cached!==undefined)return cached.value;
    if(sides[cur].ids.length===0&&sides[opp].ids.length===0){const recd={support,cur,opp,moves,value:0};states.set(key,recd);let a=bySupport.get(support);if(!a)bySupport.set(support,a=[]);a.push(recd);return 0;}
    let best=-Infinity,legal=0;
    for(let c=0;c<w;c++){
      const r=heights[c];if(r>=h)continue;legal++;const cell=r*w+c,mc=mover(cur,cell);let value;
      if(mc<0)value=Math.trunc((g.cells+1-moves)/2);
      else{const bo=blocker(opp,cell);heights[c]++;value=-rec(bo,mc,moves+1);heights[c]--;}
      if(value>best)best=value;
    }
    if(legal===0)best=0;
    const recd={support,cur,opp,moves,value:best};states.set(key,recd);let a=bySupport.get(support);if(!a)bySupport.set(support,a=[]);a.push(recd);return best;
  }
  const t0=performance.now(),root=rec(init,init,0),solveMs=performance.now()-t0;
  let pairComparisons=0,dominancePairs=0,violations=0,worstGap=0;
  const t1=performance.now();
  for(const bucket of bySupport.values()){
    for(let i=0;i<bucket.length;i++)for(let j=0;j<bucket.length;j++){
      if(i===j)continue;pairComparisons++;const A=bucket[i],B=bucket[j];if(!fav(A.cur,A.opp,B.cur,B.opp))continue;dominancePairs++;
      // A >= B must imply V(A) >= V(B). This simultaneously validates lower-bound B->A and upper-bound A->B transfer direction.
      if(A.value<B.value){violations++;worstGap=Math.max(worstGap,B.value-A.value);if(violations<=8)console.error('violation',JSON.stringify({support:A.support,a:A.value,b:B.value,aCur:A.cur,aOpp:A.opp,bCur:B.cur,bOpp:B.opp}));}
    }
  }
  const compareMs=performance.now()-t1;assert.equal(violations,0,`${w}x${h} connect${k} exact-distance dominance violation`);
  return{geometry:`${w}x${h} connect${k}`,root,semanticStates:states.size,sideStates:sides.length,supportBuckets:bySupport.size,calls,pairComparisons,dominancePairs,violations,worstGap,solveMs,compareMs};
}

const controls=[[4,3,3],[4,4,4],[5,3,4]],results=[];
for(const x of controls){const r=run(...x);results.push(r);console.error(`[IMPL numeric] ${r.geometry} states=${r.semanticStates} dominance=${r.dominancePairs}/${r.pairComparisons} solve=${r.solveMs.toFixed(1)}ms compare=${r.compareMs.toFixed(1)}ms`);}
console.log(JSON.stringify({kind:'connect4-impl-exact-distance-monotonicity-bounded',status:'pass',claim:'On each complete bounded semantic control, for every reachable pair at identical gravity support, exact residual favorability A>=B implies exact distance-sensitive value V(A)>=V(B). Therefore a lower bound from B transfers only upward to A, and an upper bound from A transfers only downward to B. This is bounded evidence, not a standalone proof for 7x6.',results},null,2));
