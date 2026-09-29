import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeStandardCenterControlAlgebra,
  analyzeBoundaryPolynomialAlgebra,
} from './control-algebra.mjs';

test('standard 7x6 center response family has a nontrivial GF(2) defect',()=>{
  const r=analyzeStandardCenterControlAlgebra();
  assert.equal(r.inputs,'geometry/rules only');
  assert.equal(r.lineCount,69);
  assert.equal(r.responsePairs,20);
  assert.equal(r.responsePairRank,19);
  assert.equal(r.responseRelationNullity,1);
  assert.equal(r.unmatchedCenterIndependent,true);
  assert.deepEqual(r.dependencyLabels,[
    'c1:r1-2','c1:r3-4','c1:r5-6',
    'c3:r1-2','c3:r3-4','c3:r5-6',
    'c5:r1-2','c5:r3-4','c5:r5-6',
    'c7:r1-2','c7:r3-4','c7:r5-6',
  ]);
});

test('shared 2108-state boundary first exposes cubic and then complete quartic separation',()=>{
  const r=analyzeBoundaryPolynomialAlgebra();
  assert.equal(r.inputs,'geometry/rules/derived boundary only');
  assert.equal(r.unknownStates,2108);
  assert.equal(r.immediateWinStates,1987);
  assert.deepEqual(r.identitySpace.slice(0,4),[
    {degree:1,monomials:13,rank:13,nullity:0,separatedImmediateWins:0},
    {degree:2,monomials:79,rank:79,nullity:0,separatedImmediateWins:0},
    {degree:3,monomials:299,rank:297,nullity:2,separatedImmediateWins:768},
    {degree:4,monomials:794,rank:751,nullity:43,separatedImmediateWins:1987},
  ]);
  assert.deepEqual(r.cubicFactors,[
    'c3H*c5H*(1 xor c2L)',
    'c3H*c5H*(1 xor c6L)',
  ]);
  assert.equal(r.cubicUnionImmediateWins,768);
});
