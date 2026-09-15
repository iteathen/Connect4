// Cold geometry/compiler and independent cell-array game. Research only.
import assert from 'node:assert/strict';
export const ORDER=[3,4,2,5,1,6,0];
export function geometry(w=7,h=6,k=4){
  assert(w>=1&&w<=7&&h>=1&&h<=6&&w*(h+1)<=49&&k>=2);
  const stride=h+1, bottom=[0,0],board=[0,0],cols=[],bots=[],tops=[],lines=[];
  const bit=i=>i<32?[2**i>>>0,0]:[0,2**(i-32)>>>0];
  const merge=(a,b)=>{a[0]=(a[0]|b[0])>>>0;a[1]=(a[1]|b[1])>>>0;};
  for(let c=0;c<w;c++){
    const cm=[0,0];for(let r=0;r<h;r++)merge(cm,bit(c*stride+r));
    cols.push(cm);bots.push(bit(c*stride));tops.push(bit(c*stride+h-1));merge(bottom,bots[c]);merge(board,cm);
  }
  for(let r=0;r<h;r++)for(let c=0;c<w;c++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
    const x=c+(k-1)*dx,y=r+(k-1)*dy;if(x<0||x>=w||y<0||y>=h)continue;
    const m=[0,0];for(let j=0;j<k;j++)merge(m,bit((c+j*dx)*stride+r+j*dy));lines.push(m);
  }
  const order=w===7?ORDER:Array.from({length:w},(_,i)=>i).sort((a,b)=>Math.abs(a-(w-1)/2)-Math.abs(b-(w-1)/2)||b-a);
  return{w,h,k,stride,cells:w*h,bottom,board,cols,bots,tops,lines,order};
}
export function won(b,w,h,k,c,r,p){
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){let n=1;
    for(const dir of [-1,1]){let x=c+dir*dx,y=r+dir*dy;while(x>=0&&x<w&&y>=0&&y<h&&b[y*w+x]===p){n++;x+=dir*dx;y+=dir*dy;}}
    if(n>=k)return true;
  }return false;
}
export function parse(seq,g=geometry()){
  const b=new Uint8Array(g.cells),heights=new Uint8Array(g.w);let moves=0;
  for(const ch of seq){const c=ch.charCodeAt(0)-49,r=heights[c],p=(moves&1)+1;
    assert(c>=0&&c<g.w&&r<g.h,'illegal move');b[r*g.w+c]=p;heights[c]++;moves++;
    assert(!won(b,g.w,g.h,g.k,c,r,p),'terminal sequence');
  }return{...fromBoard(b,heights,moves,g),seq};
}
export function fromBoard(b,heights,moves,g){
  let cLo=0,cHi=0,mLo=0,mHi=0;const p=(moves&1)+1;
  for(let c=0;c<g.w;c++)for(let r=0;r<heights[c];r++){const i=c*g.stride+r,bit=2**(i<32?i:i-32)>>>0;
    if(i<32){mLo=(mLo|bit)>>>0;if(b[r*g.w+c]===p)cLo=(cLo|bit)>>>0;}
    else {mHi=(mHi|bit)>>>0;if(b[r*g.w+c]===p)cHi=(cHi|bit)>>>0;}
  }return{b,heights,moves,cLo,cHi,mLo,mHi};
}
export const stateArgs=s=>[s.cLo,s.cHi,s.mLo,s.mHi,s.moves];
export function minimal(rs){
  return rs.filter((a,i)=>!rs.some((b,j)=>j!==i&&((b[0]&~a[0])|(b[1]&~a[1]))===0&&(b[0]!==a[0]||b[1]!==a[1]||j<i)));
}
export function compile(s,g,reduce=false,neutral=false){
  const own=[[s.cLo,s.cHi],[(s.cLo^s.mLo)>>>0,(s.cHi^s.mHi)>>>0]],goals=[];let raw=0;
  for(let p=0;p<2;p++){
    const opp=own[1-p],rs=[];
    for(const [lo,hi] of g.lines)if(((lo&opp[0])|(hi&opp[1]))===0){
      const a=(lo&~s.mLo)>>>0,b=(hi&~s.mHi)>>>0;assert((a|b)!==0,'root already won');rs.push([a,b]);
    }
    raw+=rs.length;goals.push(reduce?minimal(rs):rs);
  }
  let liveLo=0,liveHi=0;for(const rs of goals)for(const [lo,hi] of rs){liveLo|=lo;liveHi|=hi;}
  let deadCols=0,deadLo=0,deadHi=0,neutralMoves=0;
  if(neutral)for(let c=0;c<g.w;c++){
    const [lo,hi]=g.cols[c];if(s.heights[c]<g.h&&((liveLo&lo)|(liveHi&hi))===0){
      deadCols|=1<<c;deadLo|=lo;deadHi|=hi;neutralMoves+=g.h-s.heights[c];
    }
  }
  return {goals,raw,reduced:goals[0].length+goals[1].length,deadCols,deadLo:deadLo>>>0,deadHi:deadHi>>>0,neutralMoves};
}
export function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
export function rollout(n,rnd,g=geometry()){
  const b=new Uint8Array(g.cells),heights=new Uint8Array(g.w);let seq='';
  for(let moves=0;moves<n;moves++){
    const legal=[],p=(moves&1)+1;
    for(let c=0;c<g.w;c++){const r=heights[c];if(r===g.h)continue;b[r*g.w+c]=p;
      const win=won(b,g.w,g.h,g.k,c,r,p);b[r*g.w+c]=0;if(!win)legal.push(c);}
    if(!legal.length)return null;const c=legal[rnd()%legal.length];b[heights[c]*g.w+c]=p;heights[c]++;seq+=c+1;
  }return{...fromBoard(b,heights,n,g),seq};
}
export function oracle(s,g,{memo=true}={}){
  const b=s.b.slice(),h=s.heights.slice(),cache=memo?new Map():null;let nodes=0;
  function rec(n){nodes++;if(n===g.cells)return 0;
    const key=cache?`${n}:`+b.join(''):null;if(cache?.has(key))return cache.get(key);
    let best=-99;const p=(n&1)+1;
    for(let c=0;c<g.w;c++){const r=h[c];if(r===g.h)continue;b[r*g.w+c]=p;h[c]++;
      const v=won(b,g.w,g.h,g.k,c,r,p)?Math.trunc((g.cells+1-n)/2):-rec(n+1);
      h[c]--;b[r*g.w+c]=0;if(v>best)best=v;
    }
    if(cache)cache.set(key,best);return best===0?0:best;
  }
  const scores=[];const p=(s.moves&1)+1;
  for(let c=0;c<g.w;c++){const r=h[c];if(r===g.h){scores.push(null);continue;}b[r*g.w+c]=p;h[c]++;
    const v=won(b,g.w,g.h,g.k,c,r,p)?Math.trunc((g.cells+1-s.moves)/2):-rec(s.moves+1);
    scores.push(v===0?0:v);h[c]--;b[r*g.w+c]=0;
  }
  return{score:s.moves===g.cells?0:Math.max(...scores.filter(x=>x!==null)),scores,nodes};
}
