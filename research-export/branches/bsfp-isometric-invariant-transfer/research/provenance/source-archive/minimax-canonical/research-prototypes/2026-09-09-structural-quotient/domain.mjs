// Independent cell-array domain and generation, restored from the saved continuation.
export function won(board,w,h,k,c,r,player) {
  for (const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]) {
    let n=1;
    for (const dir of [-1,1]) {
      let x=c+dc*dir,y=r+dr*dir;
      while(x>=0&&x<w&&y>=0&&y<h&&board[y*w+x]===player) {n++;x+=dc*dir;y+=dr*dir;}
    }
    if(n>=k)return true;
  }
  return false;
}
export function parse(seq,w=7,h=6,k=4) {
  const board=new Uint8Array(w*h),heights=new Uint8Array(w);let moves=0;
  for(const ch of seq) {
    const c=ch.charCodeAt(0)-49;
    if(c<0||c>=w||heights[c]>=h)throw Error(`illegal column at ply ${moves}`);
    const r=heights[c]++,p=(moves&1)+1;board[r*w+c]=p;moves++;
    if(won(board,w,h,k,c,r,p))throw Error(`terminal trajectory at ply ${moves}`);
  }
  return {board,heights,moves,w,h,k};
}
export function bits(s) {
  const stride=s.h+1;let cLo=0,cHi=0,mLo=0,mHi=0,p0Lo=0,p0Hi=0;
  for(let c=0;c<s.w;c++)for(let r=0;r<s.heights[c];r++) {
    const b=c*stride+r,p=s.board[r*s.w+c],v=1<<(b&31);
    if(b<32){mLo|=v;if(p===(s.moves&1)+1)cLo|=v;if(p===1)p0Lo|=v;}
    else {mHi|=v;if(p===(s.moves&1)+1)cHi|=v;if(p===1)p0Hi|=v;}
  }
  return {cLo:cLo>>>0,cHi:cHi>>>0,mLo:mLo>>>0,mHi:mHi>>>0,p0Lo:p0Lo>>>0,p0Hi:p0Hi>>>0,moves:s.moves};
}
export function rng(seed) {let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
export function trajectory(random,target,{avoidWins=false,w=7,h=6,k=4}={}) {
  const s=parse('',w,h,k);let seq='';
  while(s.moves<target) {
    const candidates=[];
    for(let c=0;c<w;c++) {
      const r=s.heights[c];if(r===h)continue;
      if(avoidWins){s.board[r*w+c]=(s.moves&1)+1;const win=won(s.board,w,h,k,c,r,(s.moves&1)+1);s.board[r*w+c]=0;if(win)continue;}
      candidates.push(c);
    }
    if(!candidates.length)return null;
    const c=candidates[random()%candidates.length],r=s.heights[c]++,p=(s.moves&1)+1;
    s.board[r*w+c]=p;s.moves++;seq+=String(c+1);
    if(won(s.board,w,h,k,c,r,p))return null;
  }
  return {seq,state:s};
}
export function brute(s,{neutralCols=0,mergeNeutral=false,deleteNeutral=false,nodeLimit=Infinity}={}) {
  let nodes=0;
  function rec(moves) {
    if(++nodes>nodeLimit)throw Error('oracle-node-limit');
    if(moves===s.w*s.h)return 0;
    const p=(moves&1)+1;let best=-100,seenNeutral=false;
    for(let c=0;c<s.w;c++) {
      const r=s.heights[c];if(r===s.h)continue;
      if(neutralCols&(1<<c)) {if(deleteNeutral||mergeNeutral&&seenNeutral)continue;seenNeutral=true;}
      s.board[r*s.w+c]=p;s.heights[c]++;
      const v=won(s.board,s.w,s.h,s.k,c,r,p)?Math.floor((s.w*s.h+1-moves)/2):-rec(moves+1);
      s.board[r*s.w+c]=0;s.heights[c]--;if(v>best)best=v;
    }
    return best===-100?0:best;
  }
  const value=rec(s.moves);return {value:value||0,nodes};
}
