import test from 'node:test';import assert from 'node:assert/strict';
import {defectBasis} from './ooo-contextual-triangle-lib.mjs';
test('defect basis retains only relations beyond the common kernel',()=>{const d=defectBasis([[0],[0],[0]],[[0,1]]);assert.equal(d.dimension,1);assert.deepEqual(d.dependencyCombinations,[[0,2]]);});
test('a claimed common kernel outside triangle kernel is rejected',()=>assert.throws(()=>defectBasis([[0],[1]],[[0,1]]),/contain/));
