import assert from 'node:assert/strict';
import {daDomain,paretoPairKeys,commonQuotient} from './ooo-joint-da-common-quotient-lib.mjs';
import {coupleFamilyPair,signChannelPairSignature,SELECTED_FAMILY_SATURATION} from './ooo-sign-channel-coupling-lib.mjs';
import {familySaturationPairDelta} from './ooo-six-bucket-family-saturation-lib.mjs';
export const JOINT_DA_CANDIDATES=Object.freeze([
 {id:'COMMON_CARTESIAN_30',C:'TOTAL',domain:'CARTESIAN'},
 {id:'COMMON_FEASIBLE_31',C:'TOTAL',domain:'OWNER_COUNT_REALIZABLE'},
 {id:'PMEC-01',C:'TOTAL',D:'TOTAL',A:'SIGNED_NET'},
 {id:'PMEC-02',C:'TOTAL',D:'SIGNED_NET',A:'TOTAL'},
 {id:'PMEC-03',C:'TOTAL',D:'ABS_NET',A:'SEPARATED'},
 {id:'PMEC-04',C:'TOTAL',D:'SEPARATED',A:'ABS_NET'},
 {id:'SEPARATED_RECONSTRUCTION',C:'SEPARATED',D:'SEPARATED',A:'SEPARATED'}
].map(Object.freeze));
const partitions=new Map(['CARTESIAN','OWNER_COUNT_REALIZABLE'].map(domain=>{
 const states=daDomain(domain),keys=states.map(paretoPairKeys);
 const labels=commonQuotient([0,1,2,3].map(k=>keys.map(row=>row[k])));
 return [domain,new Map(states.map((state,i)=>[state.join(','),labels[i]]))];
}));
export function jointPairSignature(raw,candidate){
 const match=raw.match(/^C\+=(\d+),C-=(\d+)\|D\+=(\d+),D-=(\d+),A\+=(\d+),A-=(\d+)$/);
 assert.ok(match,'invalid selected pair signature');
 const [cp,cm,dp,dm,ap,am]=match.slice(1).map(Number),key=[dp,dm,ap,am].join(',');
 assert.ok(partitions.get('OWNER_COUNT_REALIZABLE').has(key),'owner-count infeasible pair '+key);
 if(!candidate.domain)return signChannelPairSignature(raw,candidate);
 const label=partitions.get(candidate.domain)?.get(key);
 assert.notEqual(label,undefined,'missing frozen common label');
 return 'C{'+coupleFamilyPair('C',cp,cm,candidate.C)+'}|DA{'+label+'}';
}
export function jointTriangleKey(vertices,candidate){
 assert.equal(vertices.length,3);
 return [[0,1],[0,2],[1,2]].map(([a,b])=>jointPairSignature(
  familySaturationPairDelta(vertices[a],vertices[b],SELECTED_FAMILY_SATURATION),candidate)).sort().join('|||');
}
export function xorSorted(a,b){
 const out=[];let i=0,j=0;
 while(i<a.length||j<b.length){
  if(i===a.length)out.push(b[j++]);else if(j===b.length)out.push(a[i++]);
  else if(a[i]===b[j]){i++;j++;}else if(a[i]<b[j])out.push(a[i++]);else out.push(b[j++]);
 }
 return out;
}
export function prepareRows(source,candidate){
 const keys=new Map(source.triples.map(([i,v])=>[i,jointTriangleKey(v,candidate)]));
 const featureKeys=[...new Set(keys.values())].sort(),index=new Map(featureKeys.map((k,i)=>[k,i]));
 const structuralRows=source.dependencies.map(dep=>{
  const toggles=new Set();for(const ti of dep.oooResidue){
   assert.ok(keys.has(ti),'missing triple');const i=index.get(keys.get(ti));
   if(toggles.has(i))toggles.delete(i);else toggles.add(i);
  }return [...toggles].sort((a,b)=>a-b);
 });
 const pivots=new Map(),basisDependencyIndices=[];
 structuralRows.forEach((input,i)=>{
  let row=input;
  while(row.length){const p=row.at(-1),prior=pivots.get(p);if(!prior){pivots.set(p,row);basisDependencyIndices.push(i);break;}row=xorSorted(row,prior);}
 });
 return {candidate,featureKeys,structuralRows,basisDependencyIndices,imageRank:pivots.size};
}
const span2=codes=>{const n=new Set(codes.filter(x=>x!==0)).size;return n===0?0:n===1?1:2;};
export function replayRows(prepared,codes){
 assert.equal(codes.length,prepared.structuralRows.length);
 assert.ok(codes.every(x=>Number.isInteger(x)&&x>=0&&x<4));
 const pivots=new Map();let contradictions=0,zeroStructuralNonzeroScalar=0,firstContradiction=null;
 prepared.structuralRows.forEach((input,i)=>{
  let row=input,code=codes[i],trace=[i];
  if(!row.length&&code!==0)zeroStructuralNonzeroScalar++;
  while(row.length){
   const p=row.at(-1),prior=pivots.get(p);
   if(!prior){pivots.set(p,{row,code,trace});row=null;break;}
   row=xorSorted(row,prior.row);code^=prior.code;trace=xorSorted(trace,prior.trace);
  }
  if(row!==null&&!row.length&&code!==0){contradictions++;firstContradiction??={dependencyIndex:i,dependencyIndices:trace,reducedCode:code};}
 });
 const scalarDependencyImageDimension=span2(codes),scalarImageDimensionOnBasis=span2(prepared.basisDependencyIndices.map(i=>codes[i]));
 return {contradictions,zeroStructuralNonzeroScalar,firstContradiction,scalarDependencyImageDimension,scalarImageDimensionOnBasis,
  exactScalarFactorization:contradictions===0&&zeroStructuralNonzeroScalar===0&&scalarDependencyImageDimension===scalarImageDimensionOnBasis};
}
