import {prepareRba7x6,prepareCoordinateScratch7x6} from './prepare.mjs';
import {basis7x6,cofactor7x6,canonicalize7x6} from './coordinate.mjs';
export {prepareRba7x6};

// COLD external ingress. Legal replay uses the native cofactor itself, never a
// product bitboard. Tests reconstruct physical residuals independently.
export function fromMoves7x6(moves,{geometry=prepareRba7x6(),canonical=true}={}) {
  const words=new Uint32Array(16),basis=new Uint32Array(138),scratch=prepareCoordinateScratch7x6();
  let src=0,dst=8,bi=0,ci=69;
  let n=basis7x6(geometry,0,basis,bi,scratch.seen);
  for(let p=0;p<2;p++)for(let i=0;i<n;i++)words[2+p*3+(i>>>5)]|=1<<(i&31);
  for(const c of moves) {
    if(!Number.isInteger(c)||c<0||c>6)throw new RangeError('invalid column');
    if(words[src+1])throw new RangeError('move after terminal');
    if(((words[src]>>>(c*3))&7)===6)throw new RangeError('column full');
    cofactor7x6(geometry,words,src,basis,bi,n,c,words,dst,basis,ci,scratch.seen,scratch.size,0);
    src^=8;dst^=8;bi=69-bi;ci=69-ci;
    n=scratch.size[0];
  }
  const result=words.slice(src,src+8);
  const reflected=canonical?canonicalize7x6(geometry,result,0,basis,bi,n,scratch):0;
  return {words:result,basis:basis.slice(bi,bi+n),reflected};
}
