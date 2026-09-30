import test from 'node:test';
import assert from 'node:assert/strict';
import {commonQuotient,ownerCountSymbols,daDomain,paretoPairKeys} from './ooo-joint-da-common-quotient-lib.mjs';

test('common quotient closes alternating carrier equalities transitively',()=>{
  const result=commonQuotient([[0,0,1,2],[0,1,1,2]]);
  assert.deepEqual(result,[0,0,0,3]);
});

test('owner-count alphabet preserves exact feasibility at saturation boundaries',()=>{
  assert.deepEqual(ownerCountSymbols(),[[0,0],[1,1],[2,0],[2,2],[3,0],[3,1],[3,2]]);
  const observed=new Set();
  for(let x=0;x<=12;x++)for(let y=0;y<=12;y++)
    observed.add(Math.min(3,x+y)+','+Math.min(2,Math.abs(x-y)));
  assert.deepEqual([...observed].sort(),ownerCountSymbols().map(x=>x.join(',')).sort());
  assert.equal(daDomain('CARTESIAN').length,144);
  assert.equal(daDomain('OWNER_COUNT_REALIZABLE').length,49);
});

test('four carrier maps retain interval semantics without arithmetic on codes',()=>{
  assert.deepEqual(paretoPairKeys([3,1,2,1]),[
    'T=[4,+inf]|N=[1,+inf]',
    'N=[2,+inf]|T=[3,+inf]',
    'A=[2,+inf]|+=2+,-=1',
    '+=3+,-=1|A=[1,+inf]'
  ]);
});
