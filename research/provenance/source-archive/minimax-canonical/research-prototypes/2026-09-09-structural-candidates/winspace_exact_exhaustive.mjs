import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';

function geom(w,h,k){
  const cells=w*h, lines=[];
  for(let r=0;r<h;r++)for(let c=0;c<w;c++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
    const x=c+(k-1)*dx,y=r+(k-1)*dy;
    if(x<0||x>=w||y<0||y>=h)continue;
    let m=0n;for(let j=0;j<k;j++)m|=1n<<BigInt((r+j*dy)*w+c+j*dx);
    lines.push(m);
  }
  const inc=Array.from({length:cells},()=>0n);
  for(let i=0;i<lines.length;i++)for(let x=lines[i];x;x&=x-1n){const b=x&-x,idx=bitIndex(b);inc[idx]|=1n<<BigInt(i);}
  return {w,h,k,cells,lines,inc,allLines:(1n<<BigInt(lines.length))-1n};
}
function bitIndex(b){let n=0;while((b>>BigInt(n))!==1n)n++;return n;}
function popBig(x){let n=0;while(x){x&=x-1n;n++;}return n;}
function packHeights(hs){let x=0n;for(let c=0;c<hs.length;c++)x|=BigInt(hs[c])<<BigInt(c*3);return x;}
function normalize(reqs){
  const a=[...new Set(reqs.map(x=>x.toString()))].map(BigInt).sort((x,y)=>popBig(x)-popBig(y)|| (x<y?-1:x>y?1:0));
  const out=[];
  outer: for(const x of a){for(const y of out)if((y & ~x)===0n)continue outer;out.push(x);}return out;
}
function reqKey(hs,r0,r1){return `${packHeights(hs).toString(16)}|${r0.map(x=>x.toString(16)).join('.')}/${r1.map(x=>x.toString(16)).join('.')}`;}
function liveKey(hs,l0,l1){return `${packHeights(hs).toString(16)}|${l0.toString(16)}/${l1.toString(16)}`;}
function physKey(p0,p1){return `${p0.toString(16)}/${p1.toString(16)}`;}

function run(w,h,k){
  const g=geom(w,h,k), hs=new Uint8Array(w);
  const physMemo=new Map(), liveMemo=new Map(), reqMemo=new Map();
  let physicalCalls=0, liveCalls=0, reqCalls=0, reqDrawCuts=0, liveDrawCuts=0;
  function phys(p0,p1,moves){
    physicalCalls++;const key=physKey(p0,p1);if(physMemo.has(key))return physMemo.get(key);
    if(moves===g.cells){physMemo.set(key,0);return 0;}
    const player=moves&1;let best=-99;
    for(let c=0;c<w;c++){const r=hs[c];if(r===h)continue;const bit=1n<<BigInt(r*w+c);hs[c]++;
      const mine=player===0?(p0|bit):(p1|bit),opp=player===0?p1:p0;
      let win=false;for(const line of g.lines)if((line&bit)!==0n&&(line&mine)===line){win=true;break;}
      const v=win?Math.trunc((g.cells+1-moves)/2):-phys(player===0?mine:opp,player===0?opp:mine,moves+1);
      hs[c]--;if(v>best)best=v;
    }
    best=best===0?0:best;physMemo.set(key,best);return best;
  }
  function live(l0,l1,occ,moves){
    liveCalls++;const key=liveKey(hs,l0,l1);if(liveMemo.has(key))return liveMemo.get(key);
    if((l0|l1)===0n){liveDrawCuts++;liveMemo.set(key,0);return 0;}
    if(moves===g.cells){liveMemo.set(key,0);return 0;}
    const player=moves&1;let best=-99;
    for(let c=0;c<w;c++){const r=hs[c];if(r===h)continue;const cell=r*w+c,bit=1n<<BigInt(cell);hs[c]++;
      let nl0=l0,nl1=l1;if(player===0)nl1&=~g.inc[cell];else nl0&=~g.inc[cell];const nocc=occ|bit;
      let win=false;const my=player===0?nl0:nl1, incident=g.inc[cell]&my;
      for(let z=incident;z;z&=z-1n){const lb=z&-z,li=bitIndex(lb);if((g.lines[li]&nocc)===g.lines[li]){win=true;break;}}
      const v=win?Math.trunc((g.cells+1-moves)/2):-live(nl0,nl1,nocc,moves+1);
      hs[c]--;if(v>best)best=v;
    }
    best=best===0?0:best;liveMemo.set(key,best);return best;
  }
  function req(r0,r1,moves){
    reqCalls++;const key=reqKey(hs,r0,r1);if(reqMemo.has(key))return reqMemo.get(key);
    if(r0.length===0&&r1.length===0){reqDrawCuts++;reqMemo.set(key,0);return 0;}
    if(moves===g.cells){reqMemo.set(key,0);return 0;}
    const player=moves&1;let best=-99;
    for(let c=0;c<w;c++){const r=hs[c];if(r===h)continue;const bit=1n<<BigInt(r*w+c);hs[c]++;
      const mine=player===0?r0:r1,opp=player===0?r1:r0;let win=false;const nMine=[];
      for(const q of mine){const nq=q&~bit;if(nq===0n){win=true;break;}nMine.push(nq);}let v;
      if(win)v=Math.trunc((g.cells+1-moves)/2);else{const nOpp=[];for(const q of opp)if((q&bit)===0n)nOpp.push(q);const a=normalize(nMine),b=normalize(nOpp);v=player===0?-req(a,b,moves+1):-req(b,a,moves+1);}
      hs[c]--;if(v>best)best=v;
    }
    best=best===0?0:best;reqMemo.set(key,best);return best;
  }
  const t0=performance.now(),p=phys(0n,0n,0),t1=performance.now();hs.fill(0);const l=live(g.allLines,g.allLines,0n,0),t2=performance.now();hs.fill(0);const initialReq=normalize(g.lines),rscore=req(initialReq,initialReq,0),t3=performance.now();
  assert.equal(l,p);assert.equal(rscore,p);
  return {geometry:`${w}x${h} connect${k}`,lines:g.lines.length,score:p,physical:{states:physMemo.size,calls:physicalCalls,ms:t1-t0},liveLines:{states:liveMemo.size,calls:liveCalls,drawCuts:liveDrawCuts,ms:t2-t1},minimalRequirements:{states:reqMemo.size,calls:reqCalls,drawCuts:reqDrawCuts,ms:t3-t2},reductionLivePct:100*(1-liveMemo.size/physMemo.size),reductionReqPct:100*(1-reqMemo.size/physMemo.size)};
}

for(const c of [[4,3,3],[4,4,4],[5,3,4],[4,5,4]])console.log(JSON.stringify(run(...c)));
