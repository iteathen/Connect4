import assert from 'node:assert/strict';
import {xorSorted} from './ooo-joint-da-scalar-lib.mjs';
import {kernelBasis,rowBasis} from './ooo-common-carrier-level-lib.mjs';
export function defectBasis(rows,commonKernel){
 for(const generator of commonKernel)assert.deepEqual(generator.reduce((sum,i)=>xorSorted(sum,rows[i]),[]),[],'common kernel containment');
 const largerKernel=kernelBasis(rows),pivots=rowBasis(commonKernel).pivots;
 const order=[...pivots.keys()].sort((a,b)=>b-a);
 const remainders=largerKernel.map(input=>{let row=input;for(const p of order)if(row.includes(p))row=xorSorted(row,pivots.get(p));return row;});
 const indices=rowBasis(remainders).indices;
 return {kernelDimension:largerKernel.length,dimension:indices.length,dependencyCombinations:indices.map(i=>largerKernel[i]),quotientRemainders:indices.map(i=>remainders[i])};
}
