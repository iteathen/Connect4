import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const W=7,H=6,CELLS=42,ORDER=[3,4,2,5,1,6,0];
const lines=[];
for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const x=c+3*dx,y=r+3*dy;if(x<0||x>=W||y<0||y>=H)continue;
  let m=0n;for(let j=0;j<4;j++)m|=1n<<BigInt((r+j*dy)*W+c+j*dx);lines.push(m);
}
assert.equal(lines.length,69);
function pc(v){let n=0;while(v){v&=v-1n;n++;}return n;}
const us=new Set();
for(const line of lines){const cs=[];for(let i=0;i<CELLS;i++)if((line>>BigInt(i))&1n)cs.push(i);for(let s=1;s<16;s++){let m=0n;for(let j=0;j<4;j++)if((s>>j)&1)m|=1n<<BigInt(cs[j]);us.add(m.toString());}}
const masks=[...us].map(BigInt).sort((a,b)=>pc(a)-pc(b)||(a<b?-1:a>b?1:0));assert.equal(masks.length,625);
const id=new Map(masks.map((m,i)=>[m.toString(),i]));
const reqSize=Uint8Array.from(masks,pc), singletonCell=new Int16Array(625).fill(-1);
const target=Array.from({length:CELLS},()=>new Int16Array(625).fill(-1));
const contains=Array.from({length:CELLS},()=>new Uint8Array(625));
for(let rid=0;rid<625;rid++){
  if(reqSize[rid]===1){for(let i=0;i<CELLS;i++)if((masks[rid]>>BigInt(i))&1n){singletonCell[rid]=i;break;}}
  for(let cell=0;cell<CELLS;cell++)if((masks[rid]>>BigInt(cell))&1n){contains[cell][rid]=1;const n=masks[rid]&~(1n<<BigInt(cell));target[cell][rid]=n===0n?-2:id.get(n.toString());}
}
function canon(xs){xs.sort((a,b)=>a-b);const out=[];let prev=-1;outer:for(const rid of xs){if(rid===prev)continue;prev=rid;const m=masks[rid];for(const p of out)if((masks[p]&~m)===0n)continue outer;out.push(rid);}return out;}
function ownMove(rs,cell){const out=[];for(const rid of rs){const n=target[cell][rid];if(n===-2)return [null,true];out.push(n>=0?n:rid);}return [canon(out),false];}
function oppMove(rs,cell){const out=[];for(const rid of rs)if(!contains[cell][rid])out.push(rid);return out;}
function won(bits,bit){for(const l of lines)if((l&bit)!==0n&&(l&bits)===l)return true;return false;}
function parse(seq){let p0=0n,p1=0n;const heights=new Uint8Array(W);for(let mv=0;mv<seq.length;mv++){const c=seq.charCodeAt(mv)-49,r=heights[c];assert(c>=0&&c<W&&r<H);const bit=1n<<BigInt(r*W+c);if(mv&1){p1|=bit;assert(!won(p1,bit));}else{p0|=bit;assert(!won(p0,bit));}heights[c]++;}return {p0,p1,heights,moves:seq.length,sequence:seq};}
function compile(root,pl){const occ=root.p0|root.p1,opp=pl?root.p0:root.p1,out=[];for(const l of lines){if(l&opp)continue;const rem=l&~occ;if(rem)out.push(id.get(rem.toString()));}return canon(out);}
function packH(h){let v=0;for(let c=0;c<W;c++)v|=h[c]<<(3*c);return v>>>0;}
function key(h,a,b){return `${packH(h)}|${a.join('.')}/${b.join('.')}`;}

function solveExact(root){
  const h=root.heights.slice(),p0r=compile(root,0),p1r=compile(root,1),tt=new Map();let nodes=0;
  function optimistic(rs,player,moves){if(rs.length===0)return 0;const next=(moves&1)===player;let min=9;for(const rid of rs)if(reqSize[rid]<min)min=reqSize[rid];const delta=next?2*min-1:2*min,before=moves+delta-1;if(before>=CELLS)return 0;return Math.trunc((CELLS+1-before)/2);}
  function playableSingletons(rs){const out=[];for(const rid of rs){if(reqSize[rid]!==1)continue;const cell=singletonCell[rid],row=Math.trunc(cell/W),col=cell-row*W;if(h[col]===row)out.push(cell);}return out;}
  function rec(p0in,p1in,movesIn,alpha,beta){let p0=p0in,p1=p1in,moves=movesIn,forced=[];const undo=()=>{for(let i=forced.length-1;i>=0;i--)h[forced[i]]--;};while(true){const pl=moves&1,mine=pl?p1:p0,other=pl?p0:p1,own=playableSingletons(mine);if(own.length){const v=pl?-Math.trunc((CELLS+1-moves)/2):Math.trunc((CELLS+1-moves)/2);undo();return v;}const opp=[...new Set(playableSingletons(other))];if(opp.length>=2){const op=1-pl,v=op?-Math.trunc((CELLS-moves)/2):Math.trunc((CELLS-moves)/2);undo();return v;}if(opp.length!==1)break;const cell=opp[0],row=Math.trunc(cell/W),col=cell-row*W,[nm,win]=ownMove(mine,cell);assert(!win);const no=oppMove(other,cell);h[col]++;forced.push(col);moves++;if(pl){p1=nm;p0=no;}else{p0=nm;p1=no;}}
    nodes++;const a0=alpha,b0=beta,k=key(h,p0,p1);let e=tt.get(k);if(e){if(e.lo===e.up){undo();return e.lo;}if(e.lo>=beta){undo();return e.lo;}if(e.up<=alpha){undo();return e.up;}if(alpha<e.lo)alpha=e.lo;if(beta>e.up)beta=e.up;}
    if((!p0.length&&!p1.length)||moves===CELLS){tt.set(k,{lo:0,up:0});undo();return 0;}const lo=-optimistic(p1,1,moves),hi=optimistic(p0,0,moves);if(alpha<lo)alpha=lo;if(beta>hi)beta=hi;if(lo>=b0){e=e??{lo:-99,up:99};e.lo=Math.max(e.lo,lo);tt.set(k,e);undo();return lo;}if(hi<=a0){e=e??{lo:-99,up:99};e.up=Math.min(e.up,hi);tt.set(k,e);undo();return hi;}if(alpha>=beta){undo();return alpha;}
    const pl=moves&1;let best=pl?99:-99;for(const col of ORDER){const row=h[col];if(row===H)continue;const cell=row*W+col,mine=pl?p1:p0,other=pl?p0:p1,[nm,win]=ownMove(mine,cell);h[col]++;let v;if(win)v=pl?-Math.trunc((CELLS+1-moves)/2):Math.trunc((CELLS+1-moves)/2);else{const no=oppMove(other,cell);v=pl?rec(no,nm,moves+1,alpha,beta):rec(nm,no,moves+1,alpha,beta);}h[col]--;if(!pl){if(v>best)best=v;if(best>alpha)alpha=best;}else{if(v<best)best=v;if(best<beta)beta=best;}if(alpha>=beta)break;}
    e=tt.get(k)??{lo:-99,up:99};if(best<=a0)e.up=Math.min(e.up,best);else if(best>=b0)e.lo=Math.max(e.lo,best);else e={lo:best,up:best};assert(e.lo<=e.up);tt.set(k,e);undo();return best;}
  const t=performance.now(),score=rec(p0r,p1r,root.moves,-99,99);return {score:Object.is(score,-0)?0:score,nodes,ms:performance.now()-t,p0r,p1r};
}
function emptyCell(h,cell){const row=Math.trunc(cell/W),col=cell-row*W;return row>=h[col];}
function addInst(instances,type,cells,solved){if(solved!==0n)instances.push({type,cells,solved});}
function allisA123(p0Reqs,h){
  const n=p0Reqs.length;if(n===0)return {instances:[],union:0n,target:0n};const targetBits=(1n<<BigInt(n))-1n,instances=[];
  for(let col=0;col<W;col++)for(let lower=0;lower<H-1;lower++){const upper=lower+1;if(((upper+1)&1)!==0)continue;const a=lower*W+col,b=upper*W+col;if(!emptyCell(h,a)||!emptyCell(h,b))continue;let solved=0n;for(let i=0;i<n;i++)if((masks[p0Reqs[i]]>>BigInt(b))&1n)solved|=1n<<BigInt(i);addInst(instances,'CL',(1n<<BigInt(a))|(1n<<BigInt(b)),solved);}
  for(let col=0;col<W;col++)for(let lower=0;lower<H-1;lower++){const upper=lower+1;if(((upper+1)&1)!==1)continue;const a=lower*W+col,b=upper*W+col;if(!emptyCell(h,a)||!emptyCell(h,b))continue;const pair=(1n<<BigInt(a))|(1n<<BigInt(b));let solved=0n;for(let i=0;i<n;i++)if((masks[p0Reqs[i]]&pair)===pair)solved|=1n<<BigInt(i);addInst(instances,'VE',pair,solved);}
  const playable=[];for(let col=0;col<W;col++)if(h[col]<H)playable.push(h[col]*W+col);
  for(let x=0;x<playable.length;x++)for(let y=x+1;y<playable.length;y++){const a=playable[x],b=playable[y],pair=(1n<<BigInt(a))|(1n<<BigInt(b));let solved=0n;for(let i=0;i<n;i++)if((masks[p0Reqs[i]]&pair)===pair)solved|=1n<<BigInt(i);addInst(instances,'BI',pair,solved);}
  let union=0n;for(const q of instances)union|=q.solved;return {instances,union,target:targetBits};
}
function popBig(v){let n=0;while(v){v&=v-1n;n++;}return n;}
function compatibleCover(data,limit=200000){const {instances,target}=data;if(target===0n)return {found:true,steps:0,size:0};const byReq=Array.from({length:popBig(target)},()=>[]);for(let j=0;j<instances.length;j++){let s=instances[j].solved;for(let i=0;s;i++,s>>=1n)if(s&1n)byReq[i].push(j);}for(const a of byReq)a.sort((x,y)=>popBig(instances[y].solved)-popBig(instances[x].solved));let steps=0;let best=null;
  function dfs(covered,usedCells,depth){if(++steps>limit)return false;if(covered===target){best=depth;return true;}let missing=target&~covered,ri=0;while(((missing>>BigInt(ri))&1n)===0n)ri++;for(const j of byReq[ri]){const ins=instances[j];if(ins.cells&usedCells)continue;if((ins.solved&~covered)===0n)continue;if(dfs(covered|ins.solved,usedCells|ins.cells,depth+1))return true;}return false;}
  const found=dfs(0n,0n,0);return {found,steps,capped:steps>limit,size:best};}
let seed=0x9e3779b9>>>0;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function randomRoot(targetPly){let p0=0n,p1=0n;const heights=new Uint8Array(W),seq=[];for(let mv=0;mv<targetPly;mv++){const candidates=[];for(let c=0;c<W;c++)if(heights[c]<H){const bit=1n<<BigInt(heights[c]*W+c),bits=(mv&1)?p1:p0;if(!won(bits|bit,bit))candidates.push(c);}if(!candidates.length)return null;const c=candidates[rnd()%candidates.length],bit=1n<<BigInt(heights[c]*W+c);if(mv&1)p1|=bit;else p0|=bit;heights[c]++;seq.push(String(c+1));}return parse(seq.join(''));}

const stats={roots:0,unionFull:0,coverFound:0,coverCapped:0,falseClaims:0,holdClaims:0,winRoots:0,drawLossRoots:0,byPly:{},types:{CL:0,BI:0,VE:0},typeActive:{CL:0,BI:0,VE:0},solveNodes:0,coverageSum:0,coverageMax:0};const examples=[];
for(const ply of [22,24,26,28,30,32]){stats.byPly[ply]={roots:0,covers:0,unionFull:0,coverageSum:0};let got=0,attempt=0;while(got<5&&attempt++<250){const root=randomRoot(ply);if(!root||root.moves&1)continue;const exact=solveExact(root);if(exact.nodes<40||exact.nodes>10000)continue;got++;stats.roots++;stats.byPly[ply].roots++;stats.solveNodes+=exact.nodes;if(exact.score>0)stats.winRoots++;else stats.drawLossRoots++;const data=allisA123(exact.p0r,root.heights);for(const t of ['CL','BI','VE']){let active=false;for(const q of data.instances)if(q.type===t){stats.types[t]++;active=true;}if(active)stats.typeActive[t]++;}const covered=popBig(data.union),total=exact.p0r.length,frac=total?covered/total:1;stats.coverageSum+=frac;stats.byPly[ply].coverageSum+=frac;if(frac>stats.coverageMax)stats.coverageMax=frac;if(data.union===data.target){stats.unionFull++;stats.byPly[ply].unionFull++;}const cov=compatibleCover(data);if(cov.capped)stats.coverCapped++;if(cov.found){stats.coverFound++;stats.byPly[ply].covers++;if(exact.score>0){stats.falseClaims++;examples.push({kind:'false',seq:root.sequence,ply,score:exact.score,nodes:exact.nodes,requirements:total,coverage:frac,instances:data.instances.length,coverSize:cov.size});}else{stats.holdClaims++;if(examples.length<16)examples.push({kind:'hold',seq:root.sequence,ply,score:exact.score,nodes:exact.nodes,requirements:total,coverage:frac,instances:data.instances.length,coverSize:cov.size});}}}}
for(const ply of Object.keys(stats.byPly)){const x=stats.byPly[ply];x.avgCoverage=x.roots?x.coverageSum/x.roots:0;}
stats.avgCoverage=stats.roots?stats.coverageSum/stats.roots:0;console.log(JSON.stringify({kind:'stats',stats,examples}));
