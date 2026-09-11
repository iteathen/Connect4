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
function evalPlayer(root,player){
  const own=player?root.p1:root.p0,opp=player?root.p0:root.p1,occ=root.p0|root.p1;let positional=0,immediate=0,singleParity=false,parityMask=0;
  for(const line of lines){const oc=pc(line&own),xc=pc(line&opp);if(xc!==0)continue;positional+=oc*20;if(oc!==3)continue;const em=line&~occ;if(pc(em)!==1)continue;let cell=-1;for(let i=0;i<CELLS;i++)if((em>>BigInt(i))&1n){cell=i;break;}const row=Math.trunc(cell/W),col=cell-row*W,d=row-root.heights[col]+1;if(d===1)immediate+=oc;else if(d>1){const tp=(((W-1)*H)-root.moves+row+1)&1;if(tp===1)singleParity=true;parityMask|=1<<(d&1);}}
  return (((immediate>1?1:0)<<18)|(((singleParity||parityMask===3)?1:0)<<17)|((immediate===1?1:0)<<16)|(Math.min(positional,65535)&0xffff));
}
function evalModes(root){const s0=evalPlayer(root,0),s1=evalPlayer(root,1);return {asym:s0-0.65*s1,sym:s0-s1,own:s0,oppNeg:-s1};}
function winningMove(root,col,player){if(root.heights[col]>=H)return false;const row=root.heights[col],bit=1n<<BigInt(row*W+col),bits=player?root.p1:root.p0;return won(bits|bit,bit);}
let seed=0x243f6a88>>>0;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function randomRoot(targetPly){let p0=0n,p1=0n;const heights=new Uint8Array(W),seq=[];for(let mv=0;mv<targetPly;mv++){const cs=[];for(let c=0;c<W;c++)if(heights[c]<H){const bit=1n<<BigInt(heights[c]*W+c),bits=(mv&1)?p1:p0;if(!won(bits|bit,bit))cs.push(c);}if(!cs.length)return null;const c=cs[rnd()%cs.length],bit=1n<<BigInt(heights[c]*W+c);if(mv&1)p1|=bit;else p0|=bit;heights[c]++;seq.push(String(c+1));}return {p0,p1,heights,moves:targetPly,sequence:seq.join('')};}
function makeChild(root,col){const h=root.heights.slice(),row=h[col],bit=1n<<BigInt(row*W+col);h[col]++;return {p0:root.p0|bit,p1:root.p1,heights:h,moves:root.moves+1,sequence:root.sequence+String(col+1)};}
const modes=['asym','sym','own','oppNeg','center'];const agg=Object.fromEntries(modes.map(m=>[m,{top1:0,rankSum:0,pairsGood:0,pairsBad:0,pairsTie:0}]));let roots=0,parentNodes=0,childNodes=0;const examples=[];
for(const ply of [20,22,24,26,28,30]){let got=0,attempt=0;while(got<6&&attempt++<800){const root=randomRoot(ply);if(!root||root.moves&1)continue;const legal=ORDER.filter(c=>root.heights[c]<H);if(legal.length<2)continue;if(legal.some(c=>winningMove(root,c,0)))continue;let oppThreat=0;for(const c of legal)if(winningMove(root,c,1))oppThreat++;if(oppThreat!==0)continue;const parent=solveExact(root);if(parent.nodes<30||parent.nodes>7000)continue;const children=[];let expensive=false;for(const c of legal){const ch=makeChild(root,c),ex=solveExact(ch);childNodes+=ex.nodes;if(ex.nodes>15000){expensive=true;break;}const ev=evalModes(ch);children.push({col:c,exact:ex.score,...ev});}if(expensive||children.length!==legal.length)continue;got++;roots++;parentNodes+=parent.nodes;const best=Math.max(...children.map(x=>x.exact)),bestCols=new Set(children.filter(x=>x.exact===best).map(x=>x.col));
      for(const mode of modes){let ordered;if(mode==='center')ordered=children.slice().sort((a,b)=>ORDER.indexOf(a.col)-ORDER.indexOf(b.col));else ordered=children.slice().sort((a,b)=>b[mode]-a[mode]||ORDER.indexOf(a.col)-ORDER.indexOf(b.col));const rank=ordered.findIndex(x=>bestCols.has(x.col))+1;agg[mode].rankSum+=rank;if(rank===1)agg[mode].top1++;for(let i=0;i<children.length;i++)for(let j=i+1;j<children.length;j++){const a=children[i],b=children[j],de=Math.sign(a.exact-b.exact);if(de===0)continue;let dh;if(mode==='center')dh=Math.sign(ORDER.indexOf(b.col)-ORDER.indexOf(a.col));else dh=Math.sign(a[mode]-b[mode]);if(dh===0)agg[mode].pairsTie++;else if(dh===de)agg[mode].pairsGood++;else agg[mode].pairsBad++;}}
      if(examples.length<8)examples.push({seq:root.sequence,ply,parentScore:parent.score,parentNodes:parent.nodes,best:[...bestCols],children});
  }}
for(const m of modes){const a=agg[m];a.top1Rate=roots?a.top1/roots:0;a.meanBestRank=roots?a.rankSum/roots:0;a.pairAccuracy=(a.pairsGood+a.pairsBad)?a.pairsGood/(a.pairsGood+a.pairsBad):0;}
console.log(JSON.stringify({kind:'summary',roots,parentNodes,childNodes,agg,examples}));
