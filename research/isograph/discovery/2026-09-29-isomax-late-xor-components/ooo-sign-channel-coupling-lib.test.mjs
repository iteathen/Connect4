import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SIGN_CHANNEL_MODES,
  SIGN_CHANNEL_GRID,
  coupleFamilyPair,
  signChannelPairSignature,
  signChannelTriangleKey
} from './ooo-sign-channel-coupling-lib.mjs';

test('RS-077 coupling catalogs are frozen',()=>{
  assert.deepEqual(SIGN_CHANNEL_MODES,['TOTAL','SIGNED_NET','ABS_NET','UNORDERED_PAIR','SEPARATED']);
  assert.equal(SIGN_CHANNEL_GRID.length,125);
  assert.deepEqual(SIGN_CHANNEL_GRID[0],{C:'TOTAL',D:'TOTAL',A:'TOTAL',key:'C=TOTAL|D=TOTAL|A=TOTAL'});
  assert.deepEqual(SIGN_CHANNEL_GRID.at(-1),{C:'SEPARATED',D:'SEPARATED',A:'SEPARATED',key:'C=SEPARATED|D=SEPARATED|A=SEPARATED'});
});

test('family couplings implement the frozen five maps',()=>{
  assert.equal(coupleFamilyPair(3,1,'TOTAL'),'T=4');
  assert.equal(coupleFamilyPair(3,1,'SIGNED_NET'),'N=2');
  assert.equal(coupleFamilyPair(1,3,'SIGNED_NET'),'N=-2');
  assert.equal(coupleFamilyPair(3,1,'ABS_NET'),'A=2');
  assert.equal(coupleFamilyPair(3,1,'UNORDERED_PAIR'),'U=1,3');
  assert.equal(coupleFamilyPair(3,1,'SEPARATED'),'+=3,-=1');
});

test('selected six-bucket pair signature is coupled familywise only',()=>{
  const raw='C+=1,C-=0|D+=3,D-=1,A+=2,A-=1';
  assert.equal(
    signChannelPairSignature(raw,{C:'TOTAL',D:'SIGNED_NET',A:'UNORDERED_PAIR'}),
    'C{T=1}|D{N=2}|A{U=1,2}'
  );
  assert.equal(
    signChannelPairSignature(raw,{C:'SEPARATED',D:'SEPARATED',A:'SEPARATED'}),
    'C{+=1,-=0}|D{+=3,-=1}|A{+=2,-=1}'
  );
});

test('triangle key is permutation invariant',()=>{
  const A='w1|cap=1|dh0=0:1|dh1=';
  const B='w1|cap=0|dh0=1:1|dh1=';
  const C='w2|cap=1.0|dh0=0:1|dh1=1:1';
  const candidate={C:'TOTAL',D:'SIGNED_NET',A:'UNORDERED_PAIR'};
  const perms=[[A,B,C],[A,C,B],[B,A,C],[B,C,A],[C,A,B],[C,B,A]];
  const key=signChannelTriangleKey(perms[0],candidate);
  for(const p of perms.slice(1))assert.equal(signChannelTriangleKey(p,candidate),key);
});
