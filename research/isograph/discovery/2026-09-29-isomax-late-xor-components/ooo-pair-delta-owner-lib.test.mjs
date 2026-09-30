import test from 'node:test';
import assert from 'node:assert/strict';
import {ownerQuotientPairDelta,ownerQuotientTriangleKey} from './ooo-pair-delta-owner-lib.mjs';

const A='w1|cap=1|dh0=0:1|dh1=';
const B='w1|cap=0|dh0=1:1|dh1=';
const C='w2|cap=1.0|dh0=0:1|dh1=1:1';

test('merged owner quotient sums owner depth channels only',()=>{
  assert.equal(ownerQuotientPairDelta(A,B,'D_MERGED'),'C+=1,C-=0|D+=1,D-=1');
});
test('symmetric marginals retain owner imbalance without owner label',()=>{
  assert.equal(ownerQuotientPairDelta(A,B,'D_SYMMETRIC_MARGINALS'),'C+=1,C-=0|D+=1,D-=1,A+=1,A-=1');
});
test('unordered channels preserve channel pairing but forget labels',()=>{
  assert.equal(ownerQuotientPairDelta(A,B,'D_UNORDERED_CHANNELS'),'C+=1,C-=0|D{+=0,-=0||+=1,-=1}');
});
test('separated owner control is endpoint invariant',()=>{
  assert.equal(ownerQuotientPairDelta(A,B,'D_SEPARATED'),ownerQuotientPairDelta(B,A,'D_SEPARATED'));
});
test('owner quotient triangle is permutation invariant',()=>{
  const modes=['D_MERGED','D_SYMMETRIC_MARGINALS','D_UNORDERED_CHANNELS','D_SEPARATED'];
  const perms=[[A,B,C],[A,C,B],[B,A,C],[B,C,A],[C,A,B],[C,B,A]];
  for(const mode of modes){
    const key=ownerQuotientTriangleKey(perms[0],mode);
    for(const p of perms.slice(1))assert.equal(ownerQuotientTriangleKey(p,mode),key,mode);
  }
});
