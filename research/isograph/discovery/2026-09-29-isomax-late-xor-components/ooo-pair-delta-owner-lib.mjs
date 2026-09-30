import assert from 'node:assert/strict';
import {quotientPairDelta} from './ooo-pair-delta-index-lib.mjs';

function sixBuckets(aVertex,bVertex){
  const raw=quotientPairDelta(aVertex,bVertex,'SIGNED_PARITY','C_ROLELESS','D_DEPTHLESS');
  const m=raw.match(/^C\{C\+=(\d+),C-=(\d+)\}\|D\{D0\+=(\d+),D0-=(\d+),D1\+=(\d+),D1-=(\d+)\}$/);
  assert.ok(m,'unexpected six-bucket pair signature '+raw);
  return {
    cp:Number(m[1]),cm:Number(m[2]),
    d0p:Number(m[3]),d0m:Number(m[4]),
    d1p:Number(m[5]),d1m:Number(m[6])
  };
}

export function ownerQuotientPairDelta(aVertex,bVertex,mode){
  const z=sixBuckets(aVertex,bVertex);
  const c='C+='+z.cp+',C-='+z.cm;
  if(mode==='D_MERGED')
    return c+'|D+='+ (z.d0p+z.d1p) +',D-='+(z.d0m+z.d1m);
  if(mode==='D_SYMMETRIC_MARGINALS')
    return c+'|D+='+ (z.d0p+z.d1p) +',D-='+(z.d0m+z.d1m)+
      ',A+='+Math.abs(z.d0p-z.d1p)+',A-='+Math.abs(z.d0m-z.d1m);
  if(mode==='D_UNORDERED_CHANNELS'){
    const ch=['+='+z.d0p+',-='+z.d0m,'+='+z.d1p+',-='+z.d1m].sort();
    return c+'|D{'+ch.join('||')+'}';
  }
  if(mode==='D_SEPARATED')
    return c+'|D0+='+z.d0p+',D0-='+z.d0m+',D1+='+z.d1p+',D1-='+z.d1m;
  throw new Error('unknown owner quotient mode '+mode);
}

export function ownerQuotientTriangleKey(vertices,mode){
  assert.equal(vertices.length,3,'owner quotient triangle requires three vertices');
  return [
    ownerQuotientPairDelta(vertices[0],vertices[1],mode),
    ownerQuotientPairDelta(vertices[0],vertices[2],mode),
    ownerQuotientPairDelta(vertices[1],vertices[2],mode)
  ].sort().join('|||');
}
