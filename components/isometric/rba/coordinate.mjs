import { firstSetBitIndex32 } from '../../../vendor/jsminsys/src/word32.mjs';
import { canonicalPrimaryCompare32 } from '../../../vendor/jsminsys/src/mix32.mjs';

// E0/E1 JSMinSys CONTRACT — KEEP through every callee. Fixed uint32 storage,
// explicit offsets, no arrays/objects/strings/allocation/resize in these paths.
// Geometry is immutable and cold-prepared. Scratch is exclusively caller-owned.
// Local basis derivation is real charged transition work, never hidden setup.
export function basis7x6(g, support, out, offset, seen) {
  for(let w=0;w<20;w++)seen[w]=0;
  for(let l=0;l<69;l++) {
    const b=l*4;
    const bits=(((support>>>g.lineShift[b])&7)<=g.lineRow[b]?1:0)|
      (((support>>>g.lineShift[b+1])&7)<=g.lineRow[b+1]?2:0)|
      (((support>>>g.lineShift[b+2])&7)<=g.lineRow[b+2]?4:0)|
      (((support>>>g.lineShift[b+3])&7)<=g.lineRow[b+3]?8:0);
    if(bits){const id=g.lineShape[l*16+bits];seen[id>>>5]|=1<<(id&31);}
  }
  let n=0;
  for(let w=0;w<20;w++) {
    let bits=seen[w];
    while(bits){const bit=firstSetBitIndex32(bits);out[offset+n++]=w*32+bit;bits&=bits-1;}
  }
  return n;
}

// Return -1 for an inadmissible move; 0 ordinary child; 1/2/3 terminal WDL code.
// Input/output/basis regions must not overlap. No conventional board exists.
export function cofactor7x6(g, source, src, basis, bi, n, column, target, dst,
  childBasis, ci, seen) {
  const meta=source[src],height=(meta>>>(column*3))&7;
  if(source[src+1] || column<0 || column>6 || height>=6)return -1;
  const cell=height*7+column,player=(meta>>>21)&1;
  target[dst]=meta+(1<<(column*3))+(1<<21);
  for(let w=1;w<8;w++)target[dst+w]=0;
  for(let i=0;i<n;i++) {
    if(basis[bi+i]===cell && (source[src+2+player*3+(i>>>5)]&(1<<(i&31)))) {
      target[dst+1]=player?1:3;return target[dst+1];
    }
  }
  if((target[dst]>>>21)===42){target[dst+1]=2;return 2;}
  const cn=basis7x6(g,target[dst],childBasis,ci,seen);
  for(let p=0;p<2;p++)for(let i=0;i<n;i++) {
    if(!(source[src+2+p*3+(i>>>5)]&(1<<(i&31))))continue;
    const id=basis[bi+i];
    if(p!==player && g.contains[id*42+cell])continue;
    const image=p===player?g.remove[id*42+cell]:id;
    for(let j=0;j<cn;j++)if(g.subset[childBasis[ci+j]*625+image])
      target[dst+2+p*3+(j>>>5)]|=1<<(j&31);
  }
  return 0;
}

export function reflectSupport7x6(meta) {
  let reflected=meta&0xffe00000;
  for(let c=0;c<7;c++)reflected|=((meta>>>(c*3))&7)<<((6-c)*3);
  return reflected>>>0;
}

// Canonicalize in place. The flip result transports actions, never q identity.
// Compare support first; full ties select original orientation deterministically.
export function canonicalize7x6(g,words,offset,scratch) {
  const meta=words[offset],reflected=reflectSupport7x6(meta);
  const primary=canonicalPrimaryCompare32(meta,reflected);
  if(primary<0)return 0;
  const n=basis7x6(g,meta,scratch.basis,0,scratch.seen);
  const rn=basis7x6(g,reflected,scratch.mirrorBasis,0,scratch.seen);
  for(let i=0;i<rn;i++)scratch.inverse[scratch.mirrorBasis[i]]=i;
  scratch.mirror[0]=reflected;scratch.mirror[1]=words[offset+1];
  for(let w=2;w<8;w++)scratch.mirror[w]=0;
  for(let p=0;p<2;p++)for(let i=0;i<n;i++)if(words[offset+2+p*3+(i>>>5)]&(1<<(i&31))) {
    const j=scratch.inverse[g.reflect[scratch.basis[i]]];
    scratch.mirror[2+p*3+(j>>>5)]|=1<<(j&31);
  }
  if(primary===0){
    let w=2;while(w<8 && words[offset+w]===scratch.mirror[w])w++;
    if(w===8 || words[offset+w]<scratch.mirror[w])return 0;
  }
  for(let w=0;w<8;w++)words[offset+w]=scratch.mirror[w];
  return 1;
}
