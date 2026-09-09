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
function parse(seq){let p0=0n,p1=0n;const heights=new Uint8Array(W);for(let mv=0;mv<seq.length;mv++){const c=seq.charCodeAt(mv)-49,r=heights[c];assert(c>=0&&c<W&&r<H);const bit=1n<<BigInt(r*W+c);if(mv&1){p1|=bit;assert(!won(p1,bit));}else{p0|=bit;assert(!won(p0,bit));}heights[c]++;}return {p0,p1,heights,moves:seq.length};}
function compile(root,pl){const occ=root.p0|root.p1,opp=pl?root.p0:root.p1,out=[];for(const l of lines){if(l&opp)continue;const rem=l&~occ;if(rem)out.push(id.get(rem.toString()));}return canon(out);}
function packH(h){let v=0;for(let c=0;c<W;c++)v|=h[c]<<(3*c);return v>>>0;}
function key(h,a,b){return `${packH(h)}|${a.join('.')}/${b.join('.')}`;}

// Residual analog of live-line maturity: minimal obligations only, no legacy multiplicity claim.
function densityLinear(rs){let s=0;for(const rid of rs)s+=4-reqSize[rid];return s;}
function densityExp(rs){let s=0;for(const rid of rs)s+=1<<(4-reqSize[rid]);return s;}
function parityFeature(rs,h,moves){let singleParity=false, parityMask=0, future=0;for(const rid of rs){if(reqSize[rid]!==1)continue;const cell=singletonCell[rid],row=Math.trunc(cell/W),col=cell-row*W;const d=row-h[col]+1;if(d<=1)continue;future++;const tp=(((W-1)*H)-moves+row+1)&1;if(tp===1)singleParity=true;parityMask|=1<<(d&1);}return {cls:(singleParity||parityMask===3)?1:0,future};}

function buildScoredChildren(mode,p0,p1,h,moves,stats){
  const pl=moves&1,mine=pl?p1:p0,other=pl?p0:p1,children=[];
  for(let oi=0;oi<ORDER.length;oi++){
    const col=ORDER[oi],row=h[col];if(row===H)continue;const cell=row*W+col;
    const [nm,win]=ownMove(mine,cell);let no=null,score=1e12;
    if(!win){no=oppMove(other,cell);score=densityExp(nm)-densityExp(no);}
    children.push({col,oi,nm,no,win,score});
  }
  stats.orderBuilds++;
  if(mode==='expCached') children.sort((a,b)=>b.score-a.score||a.oi-b.oi);
  else if(mode==='expFirstCached'){
    let bi=0;for(let i=1;i<children.length;i++)if(children[i].score>children[bi].score)bi=i;
    if(bi>0){const [best]=children.splice(bi,1);children.unshift(best);}
  } else throw new Error(mode);
  return children;
}

function solve(root,{mode='center',cardinality=true,macro=true}={}){
  const h=root.heights.slice(),p0r=compile(root,0),p1r=compile(root,1),tt=new Map();let nodes=0,ttCuts=0,boundCuts=0,forcedTransitions=0,tacticalWins=0,doubleLosses=0;const stats={orderBuilds:0};
  function optimistic(rs,player,moves){if(rs.length===0)return 0;const next=(moves&1)===player;let min=9;for(const rid of rs)if(reqSize[rid]<min)min=reqSize[rid];const delta=next?2*min-1:2*min,before=moves+delta-1;if(before>=CELLS)return 0;return Math.trunc((CELLS+1-before)/2);}
  function playableSingletons(rs){const out=[];for(const rid of rs){if(reqSize[rid]!==1)continue;const cell=singletonCell[rid],row=Math.trunc(cell/W),col=cell-row*W;if(h[col]===row)out.push(cell);}return out;}
  function rec(p0in,p1in,movesIn,alpha,beta){
    let p0=p0in,p1=p1in,moves=movesIn;const forcedCols=[];const undo=()=>{for(let i=forcedCols.length-1;i>=0;i--)h[forcedCols[i]]--;};
    if(macro){while(true){const pl=moves&1,mine=pl?p1:p0,other=pl?p0:p1;const own=playableSingletons(mine);if(own.length){tacticalWins++;const v=pl?-Math.trunc((CELLS+1-moves)/2):Math.trunc((CELLS+1-moves)/2);undo();return v;}const opp=[...new Set(playableSingletons(other))];if(opp.length>=2){doubleLosses++;const op=1-pl,v=op?-Math.trunc((CELLS-moves)/2):Math.trunc((CELLS-moves)/2);undo();return v;}if(opp.length!==1)break;const cell=opp[0],row=Math.trunc(cell/W),col=cell-row*W,[nm,win]=ownMove(mine,cell);assert(!win);const no=oppMove(other,cell);h[col]++;forcedCols.push(col);forcedTransitions++;moves++;if(pl){p1=nm;p0=no;}else{p0=nm;p1=no;}}}
    nodes++;const a0=alpha,b0=beta,k=key(h,p0,p1);let e=tt.get(k);if(e){if(e.lo===e.up){ttCuts++;undo();return e.lo;}if(e.lo>=beta){ttCuts++;undo();return e.lo;}if(e.up<=alpha){ttCuts++;undo();return e.up;}if(alpha<e.lo)alpha=e.lo;if(beta>e.up)beta=e.up;}
    if((p0.length===0&&p1.length===0)||moves===CELLS){tt.set(k,{lo:0,up:0});undo();return 0;}
    if(cardinality){const lo=-optimistic(p1,1,moves),hi=optimistic(p0,0,moves);if(alpha<lo)alpha=lo;if(beta>hi)beta=hi;if(lo>=b0){boundCuts++;e=e??{lo:-99,up:99};e.lo=Math.max(e.lo,lo);tt.set(k,e);undo();return lo;}if(hi<=a0){boundCuts++;e=e??{lo:-99,up:99};e.up=Math.min(e.up,hi);tt.set(k,e);undo();return hi;}if(alpha>=beta){boundCuts++;undo();return alpha;}}
    const pl=moves&1;let best=pl?99:-99;
    if(mode==='center'){
      for(const col of ORDER){const row=h[col];if(row===H)continue;const cell=row*W+col,mine=pl?p1:p0,other=pl?p0:p1,[nm,win]=ownMove(mine,cell);h[col]++;let v;if(win)v=pl?-Math.trunc((CELLS+1-moves)/2):Math.trunc((CELLS+1-moves)/2);else{const no=oppMove(other,cell);v=pl?rec(no,nm,moves+1,alpha,beta):rec(nm,no,moves+1,alpha,beta);}h[col]--;if(!pl){if(v>best)best=v;if(best>alpha)alpha=best;}else{if(v<best)best=v;if(best<beta)beta=best;}if(alpha>=beta)break;}
    } else {
      const children=buildScoredChildren(mode,p0,p1,h,moves,stats);
      for(const ch of children){h[ch.col]++;let v;if(ch.win)v=pl?-Math.trunc((CELLS+1-moves)/2):Math.trunc((CELLS+1-moves)/2);else v=pl?rec(ch.no,ch.nm,moves+1,alpha,beta):rec(ch.nm,ch.no,moves+1,alpha,beta);h[ch.col]--;if(!pl){if(v>best)best=v;if(best>alpha)alpha=best;}else{if(v<best)best=v;if(best<beta)beta=best;}if(alpha>=beta)break;}
    }
    e=tt.get(k)??{lo:-99,up:99};if(best<=a0)e.up=Math.min(e.up,best);else if(best>=b0)e.lo=Math.max(e.lo,best);else e={lo:best,up:best};assert(e.lo<=e.up);tt.set(k,e);undo();return best;
  }
  const t=performance.now(),score=rec(p0r,p1r,root.moves,-99,99);return {score:Object.is(score,-0)?0:score,nodes,ms:performance.now()-t,ttSize:tt.size,ttCuts,boundCuts,forcedTransitions,tacticalWins,doubleLosses,...stats};
}
const frozen=[['764353221241721325116531',-2],['5563576621726752473477144213',7],['3253472274311154254412135',-9],['24763565123272565531172315',2],['544111352647536626717444135',-8],['3412761563244125763551573',-9],['1174534625627233274533652316',-6],['463141571213634656162165252',7]];
const modes=['center','expCached','expFirstCached'];const reps=13,warm=5,recs=[];let dn=null;
for(let rep=0;rep<reps;rep++){const off=rep%modes.length,cyc=modes.slice(off).concat(modes.slice(0,off)),row={rep};for(const mode of cyc){let nodes=0,ms=0;for(const [seq,oracle] of frozen){const r=solve(parse(seq),{mode,cardinality:true,macro:true});assert.equal(r.score,oracle,`${mode} ${seq}`);nodes+=r.nodes;ms+=r.ms;}row[mode]={nodes,ms};}if(!dn)dn=Object.fromEntries(modes.map(m=>[m,row[m].nodes]));else for(const m of modes)assert.equal(row[m].nodes,dn[m]);recs.push(row);console.log(JSON.stringify({kind:'rep',...row}));}
function med(a){a=[...a].sort((x,y)=>x-y);return (a[(a.length-1)>>1]+a[a.length>>1])/2;}
const summary={};for(const m of modes){summary[m]={nodes:dn[m],medianMs:med(recs.slice(warm).map(r=>r[m].ms)),nodePct:100*(1-dn[m]/dn.center)};}for(const m of modes)summary[m].timePct=100*(1-summary[m].medianMs/summary.center.medianMs);console.log(JSON.stringify({kind:'summary',summary}));
