import assert from 'node:assert/strict';
import {
  SIX_BUCKET_COUNT_MODES,
  transformBucketCount as transformBucketCountRaw,
  sixBucketTriangleKey as sixBucketTriangleKeyRaw
} from './ooo-pair-delta-bucket-lib.mjs';

export const COUNT_MODES=[...SIX_BUCKET_COUNT_MODES];

export function transformBucketCount(n,mode){
  const v=transformBucketCountRaw(n,mode);
  if(mode==='BUCKET_ZOE')return v;
  if(mode==='BUCKET_CLIP2'&&v==='2+')return 2;
  if(mode==='BUCKET_CLIP3'&&v==='3+')return 3;
  return Number(v);
}

function parseRawSignature(raw){
  const m=raw.match(/^C\+=(\d+),C-=(\d+)\|D\+=(\d+),D-=(\d+),A\+=(\d+),A-=(\d+)$/);
  assert.ok(m,'unexpected six-bucket signature '+raw);
  return [Number(m[1]),Number(m[2]),Number(m[3]),Number(m[4]),Number(m[5]),Number(m[6])];
}

export function transformSixBucketSignature(raw,mode){
  const z=parseRawSignature(raw);
  const f=n=>String(transformBucketCount(n,mode));
  return [
    'C+='+f(z[0]),'C-='+f(z[1]),
    'D+='+f(z[2]),'D-='+f(z[3]),
    'A+='+f(z[4]),'A-='+f(z[5])
  ].join(',').replace('C-='+f(z[1])+',D+=','C-='+f(z[1])+'|D+=')
    .replace('D-='+f(z[3])+',A+=','D-='+f(z[3])+',A+=');
}

export function sixBucketTriangleKey(vertices,mode){
  return sixBucketTriangleKeyRaw(vertices,mode);
}
