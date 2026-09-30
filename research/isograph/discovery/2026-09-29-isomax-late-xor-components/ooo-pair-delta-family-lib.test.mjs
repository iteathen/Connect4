import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TOKEN_FAMILIES,
  deltaTermFamily,
  filterCompressedPairDelta,
  familyTriangleKey,
  canonicalFamilySubset
} from './ooo-pair-delta-family-lib.mjs';

const A='w1|cap=1|dh0=0:1|dh1=';
const B='w1|cap=0|dh0=1:1|dh1=';
const C='w2|cap=1.0|dh0=0:1|dh1=1:1';

test('token terms map to the frozen four families',()=>{
  assert.equal(deltaTermFamily('W:+'),'W');
  assert.equal(deltaTermFamily('C:0:-'),'C');
  assert.equal(deltaTermFamily('D0:2:+'),'D0');
  assert.equal(deltaTermFamily('D1:1:-'),'D1');
  assert.deepEqual(TOKEN_FAMILIES,['W','C','D0','D1']);
});

test('family filtering deletes whole token families only',()=>{
  assert.equal(filterCompressedPairDelta(A,B,'SIGN',['C']),'C:0:+');
  assert.equal(filterCompressedPairDelta(A,B,'SIGN',['D0']),'D0:0:+,D0:1:-');
  assert.equal(filterCompressedPairDelta(A,B,'SIGN',['W','D1']),'0');
  assert.equal(
    filterCompressedPairDelta(A,B,'SIGN',['C','D0']),
    'C:0:+,D0:0:+,D0:1:-'
  );
});

test('canonical subsets follow frozen W,C,D0,D1 order',()=>{
  assert.deepEqual(canonicalFamilySubset(['D1','W','D0']),['W','D0','D1']);
});

test('triangle keys are permutation invariant',()=>{
  const modes=['SIGN','SIGNED_PARITY'];
  const subsets=[['W'],['C'],['D0','D1'],['W','C','D0','D1']];
  const perms=[[A,B,C],[A,C,B],[B,A,C],[B,C,A],[C,A,B],[C,B,A]];
  for(const mode of modes)for(const subset of subsets){
    const key=familyTriangleKey(perms[0],mode,subset);
    for(const p of perms.slice(1))assert.equal(familyTriangleKey(p,mode,subset),key,mode+' '+subset.join('+'));
  }
});
