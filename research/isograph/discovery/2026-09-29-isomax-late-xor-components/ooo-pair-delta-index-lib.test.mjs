import test from 'node:test';
import assert from 'node:assert/strict';
import {quotientPairDelta,roleDepthTriangleKey} from './ooo-pair-delta-index-lib.mjs';

const A='w1|cap=1|dh0=0:1|dh1=';
const B='w1|cap=0|dh0=1:1|dh1=';
const C='w2|cap=1.0|dh0=0:1|dh1=1:1';

test('roleless capacity preserves signed changed-coordinate counts',()=>{
  assert.equal(
    quotientPairDelta(A,B,'SIGN','C_ROLELESS','D_EXACT_DEPTH'),
    'C{C+=1,C-=0}|D{D0:0:+,D0:1:-}'
  );
});

test('depthless quotient preserves owner and sign counts',()=>{
  assert.equal(
    quotientPairDelta(A,B,'SIGN','C_EXACT_ROLE','D_DEPTHLESS'),
    'C{C:0:+}|D{D0+=1,D0-=1,D1+=0,D1-=0}'
  );
});

test('depth parity quotient preserves owner parity and sign counts',()=>{
  assert.equal(
    quotientPairDelta(A,B,'SIGN','C_EXACT_ROLE','D_DEPTH_PARITY'),
    'C{C:0:+}|D{D0E+=1,D0E-=0,D0O+=0,D0O-=1,D1E+=0,D1E-=0,D1O+=0,D1O-=0}'
  );
});

test('exact role/depth quotient is endpoint-order invariant',()=>{
  assert.equal(
    quotientPairDelta(A,B,'SIGNED_PARITY','C_EXACT_ROLE','D_EXACT_DEPTH'),
    quotientPairDelta(B,A,'SIGNED_PARITY','C_EXACT_ROLE','D_EXACT_DEPTH')
  );
});

test('role-depth triangle key is permutation invariant',()=>{
  const modes=[
    ['SIGN','C_ROLELESS','D_DEPTHLESS'],
    ['SIGN','C_EXACT_ROLE','D_DEPTH_PARITY'],
    ['SIGNED_PARITY','C_EXACT_ROLE','D_EXACT_DEPTH']
  ];
  const perms=[[A,B,C],[A,C,B],[B,A,C],[B,C,A],[C,A,B],[C,B,A]];
  for(const [e,c,d] of modes){
    const key=roleDepthTriangleKey(perms[0],e,c,d);
    for(const p of perms.slice(1))assert.equal(roleDepthTriangleKey(p,e,c,d),key,e+' '+c+' '+d);
  }
});
