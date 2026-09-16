import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const W=7,H=6,CELLS=42;
const lines=[];
for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const x=c+3*dx,y=r+3*dy;if(x<0||x>=W||y<0||y>=H)continue;
  let m=0n;for(let j=0;j<4;j++)m|=1n<<BigInt((r+j*dy)*W+c+j*dx);lines.push(m);
}
assert.equal(lines.length,69);
function pc(v){let n=0;while(v){v&=v-1n;n++;}return n;}
const universe=new Set();
for(const line of lines){const cells=[];for(let i=0;i<CELLS;i++)if((line>>BigInt(i))&1n)cells.push(i);for(let s=1;s<16;s++){let m=0n;for(let j=0;j<4;j++)if((s>>j)&1)m|=1n<<BigInt(cells[j]);universe.add(m.toString());}}
const masks=[...universe].map(BigInt).sort((a,b)=>pc(a)-pc(b)||(a<b?-1:a>b?1:0));assert.equal(masks.length,625);
const id=new Map(masks.map((m,i)=>[m.toString(),i]));
const upBits=new Array(625);
for(let b=0;b<625;b++){let z=0n;const bm=masks[b];for(let r=0;r<625;r++)if((bm&~masks[r])===0n)z|=1n<<BigInt(r);upBits[b]=z;}
function canon(xs){xs.sort((a,b)=>a-b);const out=[];let prev=-1;outer:for(const rid of xs){if(rid===prev)continue;prev=rid;const m=masks[rid];for(const p of out)if((masks[p]&~m)===0n)continue outer;out.push(rid);}return out;}
function won(bits,bit){for(const l of lines)if((l&bit)!==0n&&(l&bits)===l)return true;return false;}
function compile(st,pl){const occ=st.p0|st.p1,opp=pl?st.p0:st.p1,out=[];for(const l of lines){if(l&opp)continue;const rem=l&~occ;if(rem)out.push(id.get(rem.toString()));}return canon(out);}
let seed=0x2badc0de>>>0;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function randomState(ply){let p0=0n,p1=0n;const h=new Uint8Array(W);let moves=0;for(;moves<ply;){const cs=[];for(let c=0;c<W;c++)if(h[c]<H){const bit=1n<<BigInt(h[c]*W+c),bits=(moves&1)?p1:p0;if(!won(bits|bit,bit))cs.push(c);}if(!cs.length)break;const c=cs[rnd()%cs.length],bit=1n<<BigInt(h[c]*W+c);if(moves&1)p1|=bit;else p0|=bit;h[c]++;moves++;}return{p0,p1,h,moves};}
function packH(h){let v=0;for(let c=0;c<W;c++)v|=h[c]<<(3*c);return v>>>0;}
function empty(h,cell){const row=Math.trunc(cell/W),col=cell-row*W;return row>=h[col];}
function eventOwner(row,moves){const delta=(W-1)*H-moves+row+1,pl=moves&1;return(delta&1)?pl:1-pl;}
function reqBits(reqs){let z=0n;for(const rid of reqs)z|=1n<<BigInt(rid);return z;}
function lowBitIndex(z){const lo=Number(z&0xffffffffn);if(lo)return 31-Math.clz32(lo&-lo);let shift=32;z>>=32n;while(z){const w=Number(z&0xffffffffn);if(w)return shift+31-Math.clz32(w&-w);z>>=32n;shift+=32;}return -1;}

function dynamicCover(reqs,h,moves,limit=10000){
  const n=reqs.length;if(!n)return true;const full=(1n<<BigInt(n))-1n,instances=[],controller=1-(moves&1);
  function add(cells,solved){if(solved)instances.push({cells,solved});}
  for(let col=0;col<W;col++)for(let lower=0;lower<H-1;lower++){
    const upper=lower+1,a=lower*W+col,b=upper*W+col;if(!empty(h,a)||!empty(h,b))continue;
    const pair=1n<<BigInt(a)|1n<<BigInt(b);let solved=0n;
    if(eventOwner(upper,moves)===controller){for(let i=0;i<n;i++)if((masks[reqs[i]]>>BigInt(b))&1n)solved|=1n<<BigInt(i);}
    else for(let i=0;i<n;i++)if((masks[reqs[i]]&pair)===pair)solved|=1n<<BigInt(i);
    add(pair,solved);
  }
  const ps=[];for(let c=0;c<W;c++)if(h[c]<H)ps.push(h[c]*W+c);
  for(let x=0;x<ps.length;x++)for(let y=x+1;y<ps.length;y++){
    const pair=1n<<BigInt(ps[x])|1n<<BigInt(ps[y]);let solved=0n;
    for(let i=0;i<n;i++)if((masks[reqs[i]]&pair)===pair)solved|=1n<<BigInt(i);add(pair,solved);
  }
  let union=0n;for(const q of instances)union|=q.solved;if(union!==full)return false;
  const byReq=Array.from({length:n},()=>[]);
  for(let j=0;j<instances.length;j++){let z=instances[j].solved;for(let i=0;z;i++,z>>=1n)if(z&1n)byReq[i].push(j);}
  for(const a of byReq)a.sort((x,y)=>pc(instances[y].solved)-pc(instances[x].solved));
  let steps=0;function dfs(cov,used){if(++steps>limit)return false;if(cov===full)return true;const miss=full&~cov;let ri=0;while(((miss>>BigInt(ri))&1n)===0n)ri++;for(const j of byReq[ri]){const q=instances[j];if(q.cells&used)continue;if((q.solved&~cov)===0n)continue;if(dfs(cov|q.solved,used|q.cells))return true;}return false;}
  return dfs(0n,0n);
}

const programCache=new Map();let programBuilds=0,programCandidates=0,zeroAuthorityPairs=0;
function compileProgram(h,moves){
  const k=`${packH(h)}:${moves&1}`;let p=programCache.get(k);if(p)return p;
  const resources=[],closures=[],byRid=Array.from({length:625},()=>[]),controller=1-(moves&1);
  function add(resource,blockerMask){const bid=id.get(blockerMask.toString());if(bid===undefined){zeroAuthorityPairs++;return;}const idx=resources.length;resources.push(resource);closures.push(upBits[bid]);let z=upBits[bid];while(z){const rid=lowBitIndex(z);byRid[rid].push(idx);z&=z-1n;}}
  for(let col=0;col<W;col++)for(let lower=0;lower<H-1;lower++){
    const upper=lower+1,a=lower*W+col,b=upper*W+col;if(!empty(h,a)||!empty(h,b))continue;
    const pair=1n<<BigInt(a)|1n<<BigInt(b),blocker=eventOwner(upper,moves)===controller?1n<<BigInt(b):pair;add(pair,blocker);
  }
  const ps=[];for(let c=0;c<W;c++)if(h[c]<H)ps.push(h[c]*W+c);
  for(let x=0;x<ps.length;x++)for(let y=x+1;y<ps.length;y++){const pair=1n<<BigInt(ps[x])|1n<<BigInt(ps[y]);add(pair,pair);}
  for(const a of byRid)a.sort((x,y)=>pc(closures[y])-pc(closures[x]));
  p={resources,closures,byRid};programCache.set(k,p);programBuilds++;programCandidates+=resources.length;return p;
}
function compiledCover(reqs,h,moves,limit=10000){
  if(!reqs.length)return true;const active=reqBits(reqs),p=compileProgram(h,moves);let union=0n;
  for(const closure of p.closures)union|=closure&active;if(union!==active)return false;
  let steps=0;function dfs(cov,used){if(++steps>limit)return false;if(cov===active)return true;const missing=active&~cov,rid=lowBitIndex(missing);for(const j of p.byRid[rid]){const res=p.resources[j];if(res&used)continue;const solved=p.closures[j]&active;if((solved&~cov)===0n)continue;if(dfs(cov|solved,used|res))return true;}return false;}
  return dfs(0n,0n);
}

const samples=[];let mismatches=0,covers=0;
for(const ply of [18,20,22,24,26,28,30,32,34,36])for(let k=0;k<180;k++){
  const st=randomState(ply),pl=st.moves&1,reqs=compile(st,pl),a=dynamicCover(reqs,st.h,st.moves),b=compiledCover(reqs,st.h,st.moves);
  if(a!==b){mismatches++;throw new Error(`cover mismatch ply=${ply} support=${packH(st.h)} reqs=${reqs.join('.')}`);}if(a)covers++;samples.push({h:st.h.slice(),moves:st.moves,reqs});
}
assert.equal(mismatches,0);
for(const x of samples)compileProgram(x.h,x.moves);
function run(fn){let hits=0;const t=performance.now();for(let pass=0;pass<20;pass++)for(const x of samples)if(fn(x.reqs,x.h,x.moves))hits++;return{ms:performance.now()-t,hits};}
const reps=9,warm=2,dyn=[],cmp=[];for(let r=0;r<reps;r++){const a=(r&1)?run(compiledCover):run(dynamicCover),b=(r&1)?run(dynamicCover):run(compiledCover);(r&1?cmp:dyn).push(a);(r&1?dyn:cmp).push(b);assert.equal(a.hits,b.hits);}
function med(xs){const a=xs.slice(warm).map(x=>x.ms).sort((x,y)=>x-y),n=a.length;return n&1?a[n>>1]:(a[(n>>1)-1]+a[n>>1])/2;}
const dynamicMs=med(dyn),compiledMs=med(cmp);
console.log(JSON.stringify({kind:'connect4-a123-compiled-u1u2-micro',status:'pass',samples:samples.length,covers,mismatches,programs:programCache.size,programBuilds,avgCandidatesPerProgram:programCandidates/programBuilds,zeroAuthorityPairs,reps,warmReps:warm,dynamicMedianMs:dynamicMs,compiledMedianMs:compiledMs,speedup:dynamicMs/compiledMs,semantics:'support/controller program caches A1/A3/BI resource pairs; blocker authority is precomputed WSL-625 upward closure; runtime cover sees no rule names; resource pairs outside WSL-625 have zero authority and are omitted'},null,2));
