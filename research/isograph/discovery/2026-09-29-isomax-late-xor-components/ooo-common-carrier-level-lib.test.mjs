import test from 'node:test';
import assert from 'node:assert/strict';
import {kernelBasis,linearCommonQuotient} from './ooo-common-carrier-level-lib.mjs';
test('kernel basis records all relations among source rows',()=>{
 assert.deepEqual(kernelBasis([[0],[1],[0,1],[]]),[[0,1,2],[3]]);
});
test('common linear quotient kills the sum of different kernels',()=>{
 const q=linearCommonQuotient([[[0],[1],[0]],[[0],[1],[1]]]);
 assert.equal(q.imageRank,1);assert.deepEqual(q.structuralRows,[[0],[0],[0]]);
 assert.equal(q.commonKernel.length,2);
});
test('zero and injective controls give correct common quotient extremes',()=>{
 assert.equal(linearCommonQuotient([[[0],[1]],[[0],[1]]]).imageRank,2);
 assert.equal(linearCommonQuotient([[[0],[1]],[[],[]]]).imageRank,0);
});
