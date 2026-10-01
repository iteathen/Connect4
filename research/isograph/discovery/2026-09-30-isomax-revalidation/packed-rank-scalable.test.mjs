import assert from 'node:assert/strict';
import {test} from 'node:test';
import {packedRankScalable} from './packed-rank-scalable.mjs';
import {packedRank,sparseRank} from './fresh-polynomial.mjs';
test('independent packed greatest-pivot rank agrees on seeded sparse matrices',()=>{let x=173;for(let k=0;k<60;k++){const rows=Array.from({length:70},()=>Array.from({length:180},(_,i)=>i).filter(()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x%13===0;}));assert.equal(packedRankScalable(rows),packedRank(rows));assert.equal(packedRankScalable(rows),sparseRank(rows));}});
test('packed rank handles empty rows, high columns and XOR duplicate columns',()=>{assert.equal(packedRankScalable([[],[100000],[100000],[1,1],[3,100000],[3]]),2);});
test('common low column does not force quadratic pivot-chain elimination',()=>{const rows=Array.from({length:8000},(_,i)=>[0,i+1]);assert.equal(packedRankScalable(rows),8000);});
