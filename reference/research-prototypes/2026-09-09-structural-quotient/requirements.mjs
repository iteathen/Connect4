// Cold root compiler. Recursive search receives numeric masks, never these lists.
import {bits} from './domain.mjs';
export function makeGeometry(w=7,h=6,k=4) {
  if(!Number.isInteger(w)||!Number.isInteger(h)||!Number.isInteger(k)||w<1||h<1||k<2||w*(h+1)>63)throw RangeError('unsupported two-word geometry');
  const lo=[],hi=[],stride=h+1,colLo=new Uint32Array(w),colHi=new Uint32Array(w);
  let boardLo=0,boardHi=0;
  for(let c=0;c<w;c++)for(let r=0;r<h;r++) {
    const b=c*stride+r;if(b<32)colLo[c]|=1<<b;else colHi[c]|=1<<(b-32);
  }
  for(let c=0;c<w;c++){boardLo|=colLo[c];boardHi|=colHi[c];}
  for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]])for(let c=0;c<w;c++)for(let r=0;r<h;r++) {
    const ec=c+(k-1)*dc,er=r+(k-1)*dr;if(ec<0||ec>=w||er<0||er>=h)continue;
    let a=0,b=0;for(let j=0;j<k;j++){const z=(c+j*dc)*stride+r+j*dr;if(z<32)a|=1<<z;else b|=1<<(z-32);}
    lo.push(a>>>0);hi.push(b>>>0);
  }
  return {w,h,k,stride,lo:Uint32Array.from(lo),hi:Uint32Array.from(hi),colLo,colHi,boardLo:boardLo>>>0,boardHi:boardHi>>>0};
}
export function pop32(x){x>>>=0;x-=((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return Math.imul((x+(x>>>4))&0x0f0f0f0f,0x01010101)>>>24;}
export function compile(s,g=makeGeometry(s.w,s.h,s.k),minimize=true) {
  const b=bits(s),pLo=[b.p0Lo,(b.p0Lo^b.mLo)>>>0],pHi=[b.p0Hi,(b.p0Hi^b.mHi)>>>0];
  const req=[[],[]],rawCounts=[0,0];let supportLo=0,supportHi=0;
  for(let p=0;p<2;p++) {
    for(let i=0;i<g.lo.length;i++) {
      if((g.lo[i]&pLo[1-p])||(g.hi[i]&pHi[1-p]))continue;
      const lo=(g.lo[i]&~b.mLo)>>>0,hi=(g.hi[i]&~b.mHi)>>>0;
      if((lo|hi)===0)throw Error('compiler requires a nonterminal board');
      req[p].push([lo,hi]);rawCounts[p]++;
    }
    if(minimize) {
      req[p].sort((a,b)=>pop32(a[0])+pop32(a[1])-pop32(b[0])-pop32(b[1])||a[1]-b[1]||a[0]-b[0]);
      const kept=[];
      outer: for(const r of req[p]) {
        for(const q of kept)if(((r[0]&q[0])>>>0)===q[0]&&((r[1]&q[1])>>>0)===q[1])continue outer;
        kept.push(r);
      }
      req[p]=kept;
    }
    for(const r of req[p]){supportLo|=r[0];supportHi|=r[1];}
  }
  let neutralCols=0,neutralCells=0;
  for(let c=0;c<g.w;c++)if(s.heights[c]<g.h&&!(g.colLo[c]&supportLo)&&!(g.colHi[c]&supportHi)){neutralCols|=1<<c;neutralCells+=g.h-s.heights[c];}
  const relevantLo=(b.mLo|supportLo)>>>0,relevantHi=(b.mHi|supportHi)>>>0;
  const erasedCells=pop32((g.boardLo&~relevantLo)>>>0)+pop32((g.boardHi&~relevantHi)>>>0);
  return {req,rawCounts,minCounts:req.map(a=>a.length),supportLo:supportLo>>>0,supportHi:supportHi>>>0,
    relevantLo,relevantHi,neutralCols,neutralColumns:pop32(neutralCols),neutralCells,erasedCells,
    draw:req[0].length===0&&req[1].length===0};
}
