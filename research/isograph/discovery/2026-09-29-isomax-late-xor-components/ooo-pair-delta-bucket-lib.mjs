import assert from 'node:assert/strict';
import {ownerQuotientPairDelta} from './ooo-pair-delta-owner-lib.mjs';

export const SIX_BUCKET_COUNT_MODES=[
  'BUCKET_PRESENCE',
  'BUCKET_PARITY',
  'BUCKET_ZOE',
  'BUCKET_CLIP2',
  'BUCKET_CLIP3',
  'BUCKET_EXACT'
];

function parseSix(raw){
  const m=raw.match(/^C\+=(\d+),C-=(\d+)\|D\+=(\d+),D-=(\d+),A\+=(\d+),A-=(\d+)$/);
  assert.ok(m,'unexpected six-bucket owner signature '+raw);
  return {
    cp:Number(m[1]),cm:Number(m[2]),
    dp:Number(m[3]),dm:Number(m[4]),
    ap:Number(m[5]),am:Number(m[6])
  };
}

export function transformBucketCount(n,mode){
  assert.ok(Number.isInteger(n)&&n>=0,'bucket count must be nonnegative integer');
  assert.ok(SIX_BUCKET_COUNT_MODES.includes(mode),'unknown bucket count mode '+mode);
  if(mode==='BUCKET_PRESENCE')return n>0?'1':'0';
  if(mode==='BUCKET_PARITY')return String(n&1);
  if(mode==='BUCKET_ZOE')return n===0?'Z':(n&1)?'O':'E';
  if(mode==='BUCKET_CLIP2')return n>=2?'2+':String(n);
  if(mode==='BUCKET_CLIP3')return n>=3?'3+':String(n);
  return String(n);
}

export function sixBucketPairDelta(aVertex,bVertex,mode){
  const z=parseSix(ownerQuotientPairDelta(aVertex,bVertex,'D_SYMMETRIC_MARGINALS'));
  const f=n=>transformBucketCount(n,mode);
  return [
    'C+='+f(z.cp),'C-='+f(z.cm),
    'D+='+f(z.dp),'D-='+f(z.dm),
    'A+='+f(z.ap),'A-='+f(z.am)
  ].join(',');
}

export function sixBucketTriangleKey(vertices,mode){
  assert.equal(vertices.length,3,'six-bucket triangle requires three vertices');
  return [
    sixBucketPairDelta(vertices[0],vertices[1],mode),
    sixBucketPairDelta(vertices[0],vertices[2],mode),
    sixBucketPairDelta(vertices[1],vertices[2],mode)
  ].sort().join('|||');
}
