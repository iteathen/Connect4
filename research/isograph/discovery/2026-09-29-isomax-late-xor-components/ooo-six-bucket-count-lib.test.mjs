import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COUNT_MODES,
  transformBucketCount,
  transformSixBucketSignature,
  sixBucketTriangleKey
} from './ooo-six-bucket-count-lib.mjs';

const raw='C+=0,C-=1|D+=2,D-=3,A+=4,A-=5';

test('frozen count modes are exact',()=>{
  assert.deepEqual(COUNT_MODES,[
    'BUCKET_PRESENCE',
    'BUCKET_PARITY',
    'BUCKET_ZOE',
    'BUCKET_CLIP2',
    'BUCKET_CLIP3',
    'BUCKET_EXACT'
  ]);
});

test('uniform bucket transforms match EW-RS-075 definitions',()=>{
  assert.deepEqual([0,1,2,3,4].map(n=>transformBucketCount(n,'BUCKET_PRESENCE')),[0,1,1,1,1]);
  assert.deepEqual([0,1,2,3,4].map(n=>transformBucketCount(n,'BUCKET_PARITY')),[0,1,0,1,0]);
  assert.deepEqual([0,1,2,3,4].map(n=>transformBucketCount(n,'BUCKET_ZOE')),['Z','O','E','O','E']);
  assert.deepEqual([0,1,2,3,4].map(n=>transformBucketCount(n,'BUCKET_CLIP2')),[0,1,2,2,2]);
  assert.deepEqual([0,1,2,3,4].map(n=>transformBucketCount(n,'BUCKET_CLIP3')),[0,1,2,3,3]);
  assert.deepEqual([0,1,2,3,4].map(n=>transformBucketCount(n,'BUCKET_EXACT')),[0,1,2,3,4]);
});

test('six-bucket signature applies one transform uniformly',()=>{
  assert.equal(
    transformSixBucketSignature(raw,'BUCKET_ZOE'),
    'C+=Z,C-=O|D+=E,D-=O,A+=E,A-=O'
  );
  assert.equal(
    transformSixBucketSignature(raw,'BUCKET_CLIP2'),
    'C+=0,C-=1|D+=2,D-=2,A+=2,A-=2'
  );
});

test('exact transform is identity',()=>{
  assert.equal(transformSixBucketSignature(raw,'BUCKET_EXACT'),raw);
});

test('triangle key is permutation invariant',()=>{
  const A='w1|cap=1|dh0=0:1|dh1=';
  const B='w1|cap=0|dh0=1:1|dh1=';
  const C='w2|cap=1.0|dh0=0:1|dh1=1:1';
  const perms=[[A,B,C],[A,C,B],[B,A,C],[B,C,A],[C,A,B],[C,B,A]];
  for(const mode of COUNT_MODES){
    const key=sixBucketTriangleKey(perms[0],mode);
    for(const p of perms.slice(1))assert.equal(sixBucketTriangleKey(p,mode),key,mode);
  }
});
