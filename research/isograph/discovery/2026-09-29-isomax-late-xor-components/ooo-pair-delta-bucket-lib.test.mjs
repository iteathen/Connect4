import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SIX_BUCKET_COUNT_MODES,
  transformBucketCount,
  sixBucketPairDelta,
  sixBucketTriangleKey
} from './ooo-pair-delta-bucket-lib.mjs';

const A='w1|cap=1|dh0=0:1|dh1=';
const B='w1|cap=0|dh0=1:1|dh1=';
const C='w2|cap=1.0|dh0=0:1|dh1=1:1';

test('count-mode catalog is frozen',()=>{
  assert.deepEqual(SIX_BUCKET_COUNT_MODES,[
    'BUCKET_PRESENCE','BUCKET_PARITY','BUCKET_ZOE',
    'BUCKET_CLIP2','BUCKET_CLIP3','BUCKET_EXACT'
  ]);
});

test('bucket transforms implement the frozen count algebras',()=>{
  assert.deepEqual([0,1,2,3,4].map(n=>transformBucketCount(n,'BUCKET_PRESENCE')),['0','1','1','1','1']);
  assert.deepEqual([0,1,2,3,4].map(n=>transformBucketCount(n,'BUCKET_PARITY')),['0','1','0','1','0']);
  assert.deepEqual([0,1,2,3,4].map(n=>transformBucketCount(n,'BUCKET_ZOE')),['Z','O','E','O','E']);
  assert.deepEqual([0,1,2,3,4].map(n=>transformBucketCount(n,'BUCKET_CLIP2')),['0','1','2+','2+','2+']);
  assert.deepEqual([0,1,2,3,4].map(n=>transformBucketCount(n,'BUCKET_CLIP3')),['0','1','2','3+','3+']);
  assert.deepEqual([0,1,2,3,4].map(n=>transformBucketCount(n,'BUCKET_EXACT')),['0','1','2','3','4']);
});

test('six-bucket pair transform is endpoint invariant',()=>{
  for(const mode of SIX_BUCKET_COUNT_MODES){
    assert.equal(sixBucketPairDelta(A,B,mode),sixBucketPairDelta(B,A,mode),mode);
  }
});

test('six-bucket triangle transform is permutation invariant',()=>{
  const perms=[[A,B,C],[A,C,B],[B,A,C],[B,C,A],[C,A,B],[C,B,A]];
  for(const mode of SIX_BUCKET_COUNT_MODES){
    const key=sixBucketTriangleKey(perms[0],mode);
    for(const p of perms.slice(1))assert.equal(sixBucketTriangleKey(p,mode),key,mode);
  }
});
