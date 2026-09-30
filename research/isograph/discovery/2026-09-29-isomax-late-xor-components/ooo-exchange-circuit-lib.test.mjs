import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSelectedVertex,
  exactPairDelta,
  pairNormProfile,
  exchangeCircuitKey
} from './ooo-exchange-circuit-lib.mjs';

const A='w1|cap=1|dh0=0:1|dh1=';
const B='w1|cap=0|dh0=1:1|dh1=';
const C='w2|cap=1.0|dh0=0:1|dh1=1:1';

test('parses the frozen selected motif vertex exactly',()=>{
  const z=parseSelectedVertex('w2|cap=1.0|dh0=0:2,2:1|dh1=1:1');
  assert.equal(z.width,2);
  assert.deepEqual(z.caps,[1,0]);
  assert.deepEqual([...z.d0.entries()],[[0,2],[2,1]]);
  assert.deepEqual([...z.d1.entries()],[[1,1]]);
});

test('canonical exact pair delta is signed and endpoint-order invariant',()=>{
  assert.equal(
    exactPairDelta(A,B),
    'C:0=1,D0:0=1,D0:1=-1'
  );
  assert.equal(exactPairDelta(A,B),exactPairDelta(B,A));
});

test('pair norm profile is structural and endpoint-order invariant',()=>{
  assert.equal(pairNormProfile(A,B),'dw=0|cap=1|d0=2|d1=0');
  assert.equal(pairNormProfile(A,B),pairNormProfile(B,A));
});

test('every frozen triple circuit key is permutation invariant',()=>{
  const modes=[
    'EXCHANGE_NORM_TRIANGLE',
    'EXCHANGE_EXACT_DELTA_TRIANGLE',
    'BASEFREE_TWO_LEG_EXCHANGE',
    'BASEFREE_PLUS_BASE_WIDTH_CAP',
    'BASEFREE_PLUS_BASE_WIDTH_CAP_OWNER_TOTALS',
    'BASEFREE_PLUS_BASE_WIDTH_CAP_OWNER_DEPTH_PARITY',
    'BASEFREE_PLUS_BASE_FULL_VERTEX',
    'FULL_TRIPLE_MOTIF'
  ];
  const perms=[
    [A,B,C],[A,C,B],[B,A,C],[B,C,A],[C,A,B],[C,B,A]
  ];
  for(const mode of modes){
    const key=exchangeCircuitKey(perms[0],mode);
    for(const p of perms.slice(1))assert.equal(exchangeCircuitKey(p,mode),key,mode);
  }
});

test('base-free exchange forgets a common additive token translation',()=>{
  const X=[
    'w1|cap=0|dh0=0:1|dh1=',
    'w1|cap=1|dh0=1:1|dh1=',
    'w1|cap=0|dh0=2:1|dh1='
  ];
  const Y=[
    'w1|cap=0|dh0=0:2|dh1=',
    'w1|cap=1|dh0=0:1,1:1|dh1=',
    'w1|cap=0|dh0=0:1,2:1|dh1='
  ];
  assert.equal(
    exchangeCircuitKey(X,'BASEFREE_TWO_LEG_EXCHANGE'),
    exchangeCircuitKey(Y,'BASEFREE_TWO_LEG_EXCHANGE')
  );
});
