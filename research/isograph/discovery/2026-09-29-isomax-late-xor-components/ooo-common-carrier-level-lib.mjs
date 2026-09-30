import assert from 'node:assert/strict';
import {xorSorted} from './ooo-joint-da-scalar-lib.mjs';
export function kernelBasis(rows){
 const pivots=new Map(),kernel=[];
 rows.forEach((input,i)=>{
  let row=input,trace=[i];
  while(row.length){const p=row.at(-1),prior=pivots.get(p);if(!prior){pivots.set(p,{row,trace});return;}row=xorSorted(row,prior.row);trace=xorSorted(trace,prior.trace);}
  kernel.push(trace);
 });return kernel;
}
export function rowBasis(rows){
 const pivots=new Map(),indices=[];
 rows.forEach((input,i)=>{let row=input;while(row.length){const p=row.at(-1),prior=pivots.get(p);if(!prior){pivots.set(p,row);indices.push(i);break;}row=xorSorted(row,prior);}});
 return {pivots,indices};
}
export function linearCommonQuotient(columns){
 const m=columns[0].length;assert.ok(columns.every(c=>c.length===m));
 const kernels=columns.map(kernelBasis),{pivots}=rowBasis(kernels.flat());
 const pivotIndices=[...pivots.keys()].sort((a,b)=>a-b);
 // Clear lower pivots from higher rows for canonical reduced form.
 for(const p of pivotIndices)for(const q of pivotIndices)if(q>p&&pivots.get(q).includes(p))pivots.set(q,xorSorted(pivots.get(q),pivots.get(p)));
 const commonKernel=pivotIndices.map(p=>pivots.get(p));
 const freeCoordinates=Array.from({length:m},(_,i)=>i).filter(i=>!pivots.has(i));
 const freeIndex=new Map(freeCoordinates.map((i,j)=>[i,j]));
 const structuralRows=Array.from({length:m},(_,i)=>{
  const row=pivots.has(i)?xorSorted([i],pivots.get(i)):[i];
  assert.ok(row.every(x=>freeIndex.has(x)));return row.map(x=>freeIndex.get(x));
 });
 return {kernels,commonKernel,freeCoordinates,structuralRows,featureKeys:freeCoordinates.map(i=>'DEPENDENCY_FREE_'+i),
  basisDependencyIndices:rowBasis(structuralRows).indices,imageRank:freeCoordinates.length};
}
