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
for(const line of lines){
  const cells=[];for(let i=0;i<CELLS;i++)if((line>>BigInt(i))&1n)cells.push(i);
  for(let s=1;s<16;s++){let m=0n;for(let j=0;j<4;j++)if((s>>j)&1)m|=1n<<BigInt(cells[j]);universe.add(m.toString());}
}
const masks=[...universe].map(BigInt).sort((a,b)=>pc(a)-pc(b)||(a<b?-1:a>b?1:0));
assert.equal(masks.length,625);
const id=new Map(masks.map((m,i)=>[m.toString(),i]));
const reqSize=Uint8Array.from(masks,pc);
const reqCells=Array.from({length:625},()=>[]);
const reqCols=new Uint8Array(625);
const reqSupportBase=new Uint8Array(625);
for(let rid=0;rid<625;rid++){
  const highest=new Int8Array(W);highest.fill(-1);let cols=0;
  for(let cell=0;cell<CELLS;cell++)if((masks[rid]>>BigInt(cell))&1n){
    reqCells[rid].push(cell);const row=Math.trunc(cell/W),col=cell-row*W;cols|=1<<col;if(row>highest[col])highest[col]=row;
  }
  let base=0;for(let c=0;c<W;c++)if(highest[c]>=0)base+=highest[c]+1;
  reqCols[rid]=cols;reqSupportBase[rid]=base;
}
function canon(xs){xs.sort((a,b)=>a-b);const out=[];let prev=-1;outer:for(const rid of xs){if(rid===prev)continue;prev=rid;const m=masks[rid];for(const p of out)if((masks[p]&~m)===0n)continue outer;out.push(rid);}return out;}
function won(bits,bit){for(const l of lines)if((l&bit)!==0n&&(l&bits)===l)return true;return false;}
function compile(st,pl){const occ=st.p0|st.p1,opp=pl?st.p0:st.p1,out=[];for(const l of lines){if(l&opp)continue;const rem=l&~occ;if(rem)out.push(id.get(rem.toString()));}return canon(out);}
let seed=0x5e77b00b>>>0;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function randomState(target){let p0=0n,p1=0n;const h=new Uint8Array(W);let moves=0;for(;moves<target;){const cs=[];for(let c=0;c<W;c++)if(h[c]<H){const bit=1n<<BigInt(h[c]*W+c),bits=(moves&1)?p1:p0;if(!won(bits|bit,bit))cs.push(c);}if(!cs.length)break;const c=cs[rnd()%cs.length],bit=1n<<BigInt(h[c]*W+c);if(moves&1)p1|=bit;else p0|=bit;h[c]++;moves++;}return{p0,p1,h,moves};}
function scanFills(rid,h){const highest=new Int8Array(W);highest.fill(-1);for(const cell of reqCells[rid]){const row=Math.trunc(cell/W),col=cell-row*W;if(row>highest[col])highest[col]=row;}let fills=0;for(let c=0;c<W;c++)if(highest[c]>=h[c])fills+=highest[c]-h[c]+1;return fills;}
function eventFills(rid,h){let sum=reqSupportBase[rid],cols=reqCols[rid];while(cols){const bit=cols&-cols;const c=31-Math.clz32(bit);sum-=h[c];cols^=bit;}return sum;}
function deltaForPlayerTurn(delta,player,moves){const wantsOdd=((moves&1)===player);if(((delta&1)===1)!==wantsOdd)delta++;return delta;}
function magnitudeScan(rs,player,moves,h){if(rs.length===0)return 0;let best=99;for(const rid of rs){const fills=scanFills(rid,h),turns=((moves&1)===player)?2*reqSize[rid]-1:2*reqSize[rid];let d=Math.max(fills,turns);d=deltaForPlayerTurn(d,player,moves);if(d<best)best=d;}const before=moves+best-1;return before>=CELLS?0:Math.trunc((CELLS+1-before)/2);}
function magnitudeEvent(rs,player,moves,h){if(rs.length===0)return 0;let best=99;for(const rid of rs){const fills=eventFills(rid,h),turns=((moves&1)===player)?2*reqSize[rid]-1:2*reqSize[rid];let d=Math.max(fills,turns);d=deltaForPlayerTurn(d,player,moves);if(d<best)best=d;}const before=moves+best-1;return before>=CELLS?0:Math.trunc((CELLS+1-before)/2);}

const samples=[];let ridChecks=0,boundChecks=0;
for(const ply of [0,4,8,12,16,20,24,28,32,36,40])for(let k=0;k<220;k++){
  const st=randomState(ply),r0=compile(st,0),r1=compile(st,1);samples.push({st,r0,r1});
  for(const rid of r0){assert.equal(eventFills(rid,st.h),scanFills(rid,st.h));ridChecks++;}
  for(const rid of r1){assert.equal(eventFills(rid,st.h),scanFills(rid,st.h));ridChecks++;}
  assert.equal(magnitudeEvent(r0,0,st.moves,st.h),magnitudeScan(r0,0,st.moves,st.h));boundChecks++;
  assert.equal(magnitudeEvent(r1,1,st.moves,st.h),magnitudeScan(r1,1,st.moves,st.h));boundChecks++;
}

function run(fn){let checksum=0;const t=performance.now();for(let pass=0;pass<25;pass++)for(const {st,r0,r1} of samples){checksum+=fn(r0,0,st.moves,st.h);checksum+=fn(r1,1,st.moves,st.h);}return{ms:performance.now()-t,checksum};}
const reps=9,warm=2,scan=[],event=[];
for(let rep=0;rep<reps;rep++){
  const a=(rep&1)?run(magnitudeEvent):run(magnitudeScan),b=(rep&1)?run(magnitudeScan):run(magnitudeEvent);
  (rep&1?event:scan).push(a);(rep&1?scan:event).push(b);assert.equal(a.checksum,b.checksum);
}
function med(xs){const a=xs.slice(warm).map(x=>x.ms).sort((x,y)=>x-y),n=a.length;return n&1?a[n>>1]:(a[(n>>1)-1]+a[n>>1])/2;}
const scanMs=med(scan),eventMs=med(event);
console.log(JSON.stringify({kind:'connect4-sewb-event-native-micro',status:'pass',samples:samples.length,ridChecks,boundChecks,reps,warmReps:warm,scanMedianMs:scanMs,eventMedianMs:eventMs,speedup:scanMs/eventMs,metadataBytes:reqCols.byteLength+reqSupportBase.byteLength,semantics:'event form precompiles each WSL-625 requirement to column-mask + sum(highest required row+1); fills = supportBase - sum(current heights of participating columns)'},null,2));
