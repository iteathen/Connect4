import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

function geom(w,h,k){
  const lines=[];
  for(let r=0;r<h;r++)for(let c=0;c<w;c++)for(const[dx,dy]of[[1,0],[0,1],[1,1],[1,-1]]){
    const x=c+(k-1)*dx,y=r+(k-1)*dy;if(x<0||x>=w||y<0||y>=h)continue;
    let m=0n;for(let j=0;j<k;j++)m|=1n<<BigInt((r+j*dy)*w+c+j*dx);lines.push(m);
  }
  const us=new Set();
  for(const line of lines){const cs=[];for(let i=0;i<w*h;i++)if((line>>BigInt(i))&1n)cs.push(i);for(let s=1;s<(1<<k);s++){let m=0n;for(let j=0;j<k;j++)if((s>>j)&1)m|=1n<<BigInt(cs[j]);us.add(m.toString());}}
  const pop=x=>{let n=0;while(x){x&=x-1n;n++;}return n;};
  const req=[...us].map(BigInt).sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),id=new Map(req.map((m,i)=>[m.toString(),i]));
  const up=new Array(req.length);for(let b=0;b<req.length;b++){let z=0n,bm=req[b];for(let r=0;r<req.length;r++)if((bm&~req[r])===0n)z|=1n<<BigInt(r);up[b]=z;}
  return{w,h,k,cells:w*h,lines,req,id,up,pop};
}
function packH(h){let x=0n;for(let c=0;c<h.length;c++)x|=BigInt(h[c])<<BigInt(c*3);return x;}
function run(w,h,k,mode,{limit=0}={}){
  const g=geom(w,h,k),hs=new Uint8Array(w),memo=new Map(),buckets=new Map();
  function canonIds(xs){xs.sort((a,b)=>a-b);const out=[];let prev=-1;outer:for(const rid of xs){if(rid===prev)continue;prev=rid;const m=g.req[rid];for(const p of out)if((g.req[p]&~m)===0n)continue outer;out.push(rid);}return out;}
  const init=canonIds(g.lines.map(m=>g.id.get(m.toString())));
  function recMeta(ids){let bits=0n,upUnion=0n;for(const rid of ids){bits|=1n<<BigInt(rid);upUnion|=g.up[rid];}return{ids,bits,upUnion};}
  function key(a,b){return`${packH(hs).toString(16)}|${a.ids.join('.')}/${b.ids.join('.')}`;}
  function impliesNested(A,B){stats.nestedReqChecks++;if(A.ids.length===0)return true;if(B.ids.length===0)return false;for(const a of A.ids){let ok=false;const am=g.req[a];for(const b of B.ids){stats.nestedPairChecks++;if((g.req[b]&~am)===0n){ok=true;break;}}if(!ok)return false;}return true;}
  function impliesClosure(A,B){stats.closureChecks++;if(A.ids.length===0)return true;if(B.ids.length===0)return false;return (A.bits&~B.upUnion)===0n;}
  const implies=mode==='closure'||mode==='closure8'?impliesClosure:impliesNested;
  function fav(A,B){return implies(B.r0,A.r0)&&implies(A.r1,B.r1);} // A >= B from P0
  function bucket(){const kk=packH(hs).toString(16);let z=buckets.get(kk);if(!z){z={wins:[],losses:[],drawLo:[],drawHi:[]};buckets.set(kk,z);}return z;}
  function trim(list){if(!limit||list.length<=limit)return;list.sort((a,b)=>a.age-b.age);list.splice(0,list.length-limit);stats.evictions++;}
  function insertMin(list,x){for(const y of list){stats.maintChecks++;if(fav(x,y))return;}for(let i=list.length-1;i>=0;i--){stats.maintChecks++;if(fav(list[i],x))list.splice(i,1);}list.push(x);trim(list);}
  function insertMax(list,x){for(const y of list){stats.maintChecks++;if(fav(y,x))return;}for(let i=list.length-1;i>=0;i--){stats.maintChecks++;if(fav(x,list[i]))list.splice(i,1);}list.push(x);trim(list);}
  function lookup(r0,r1){if(mode==='none')return null;const A={r0,r1},z=bucket();let lo=-1,hi=1;for(const y of z.wins){stats.lookupChecks++;if(fav(A,y)){stats.domHits++;return 1;}}for(const y of z.losses){stats.lookupChecks++;if(fav(y,A)){stats.domHits++;return -1;}}for(const y of z.drawLo){stats.lookupChecks++;if(fav(A,y)){lo=0;break;}}for(const y of z.drawHi){stats.lookupChecks++;if(fav(y,A)){hi=0;break;}}if(lo===0&&hi===0){stats.domHits++;return 0;}return null;}
  function store(r0,r1,v){if(mode==='none')return;const x={r0,r1,v,age:++stats.age},z=bucket();if(v===1)insertMin(z.wins,x);else if(v===-1)insertMax(z.losses,x);else{insertMin(z.drawLo,x);insertMax(z.drawHi,x);}const n=z.wins.length+z.losses.length+z.drawLo.length+z.drawHi.length;if(n>stats.maxFrontier)stats.maxFrontier=n;}
  const stats={calls:0,expanded:0,exactHits:0,domHits:0,lookupChecks:0,maintChecks:0,nestedReqChecks:0,nestedPairChecks:0,closureChecks:0,maxFrontier:0,evictions:0,age:0};
  function rec(r0,r1,m){
    stats.calls++;const kk=key(r0,r1);if(memo.has(kk)){stats.exactHits++;return memo.get(kk);}if(r0.ids.length===0&&r1.ids.length===0){memo.set(kk,0);store(r0,r1,0);return 0;}if(m===g.cells){memo.set(kk,0);store(r0,r1,0);return 0;}const d=lookup(r0,r1);if(d!==null)return d;stats.expanded++;const p=m&1;let best=p?1:-1;
    for(let c=0;c<w;c++){const r=hs[c];if(r===h)continue;const bit=1n<<BigInt(r*w+c);hs[c]++;const mine=p?r1:r0,opp=p?r0:r1;let win=false,nm=[];for(const rid of mine.ids){const q=g.req[rid],nq=q&~bit;if(nq===0n){win=true;break;}nm.push(nq);}let v;if(win)v=p?-1:1;else{const no=[];for(const rid of opp.ids){const q=g.req[rid];if((q&bit)===0n)no.push(q);}const a=recMeta(canonIds(nm.map(q=>g.id.get(q.toString())))),b=recMeta(canonIds(no.map(q=>g.id.get(q.toString()))));v=p?rec(b,a,m+1):rec(a,b,m+1);}hs[c]--;if(p){if(v<best)best=v;if(best===-1)break;}else{if(v>best)best=v;if(best===1)break;}}
    memo.set(kk,best);store(r0,r1,best);return best;
  }
  const r0=recMeta(init),r1=recMeta(init),t=performance.now(),score=rec(r0,r1,0),ms=performance.now()-t;let frontierItems=0;for(const z of buckets.values())frontierItems+=z.wins.length+z.losses.length+z.drawLo.length+z.drawHi.length;
  return{geometry:`${w}x${h} connect${k}`,mode,limit,universe:g.req.length,score,states:memo.size,frontierItems,ms,...stats};
}

const games=[[4,3,3],[4,4,4],[5,3,4],[4,5,4]],results=[];
for(const cfg of games){
  const none=run(...cfg,'none'),nested=run(...cfg,'nested'),closure=run(...cfg,'closure'),closure8=run(...cfg,'closure8',{limit:8});
  assert.equal(nested.score,none.score);assert.equal(closure.score,none.score);assert.equal(closure8.score,none.score);
  assert.equal(closure.expanded,nested.expanded,`closure changed full-frontier proof work ${cfg}`);
  assert.equal(closure.domHits,nested.domHits,`closure changed full-frontier hits ${cfg}`);
  results.push({geometry:none.geometry,universe:none.universe,baseline:{expanded:none.expanded,calls:none.calls,ms:none.ms},nested:{expanded:nested.expanded,domHits:nested.domHits,frontierItems:nested.frontierItems,lookupChecks:nested.lookupChecks,maintChecks:nested.maintChecks,nestedReqChecks:nested.nestedReqChecks,nestedPairChecks:nested.nestedPairChecks,ms:nested.ms},closure:{expanded:closure.expanded,domHits:closure.domHits,frontierItems:closure.frontierItems,lookupChecks:closure.lookupChecks,maintChecks:closure.maintChecks,closureChecks:closure.closureChecks,ms:closure.ms},closure8:{expanded:closure8.expanded,domHits:closure8.domHits,frontierItems:closure8.frontierItems,evictions:closure8.evictions,ms:closure8.ms},nodeReductionPct:100*(1-closure.expanded/none.expanded),closureVsNestedSpeedup:nested.ms/closure.ms});
}
console.log(JSON.stringify({kind:'connect4-impl-rid-closure-retest',status:'pass',semantics:'same exact support-height bucket and same Pareto dominance relation; nested mask implication is replaced only by RID activeBits/subsumption-closure containment',results},null,2));
