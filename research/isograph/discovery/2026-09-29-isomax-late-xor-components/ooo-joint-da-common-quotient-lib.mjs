import assert from 'node:assert/strict';
import {coupleFamilyPair} from './ooo-sign-channel-coupling-lib.mjs';

export const PARETO_DA_MODES=Object.freeze([
  ['TOTAL','SIGNED_NET'],['SIGNED_NET','TOTAL'],
  ['ABS_NET','SEPARATED'],['SEPARATED','ABS_NET']
].map(Object.freeze));

export function ownerCountSymbols(){
  // Exhaustive symbolic image of (x+y, |x-y|), x,y nonnegative integers.
  // For D<3, A<=D and A=D mod 2. For D=3+, all A categories occur.
  const out=[];
  for(let d=0;d<=3;d++)for(let a=0;a<=2;a++)
    if(d===3||(a<=d&&(d-a)%2===0))out.push([d,a]);
  return out;
}

export function daDomain(domain){
  assert.ok(['CARTESIAN','OWNER_COUNT_REALIZABLE'].includes(domain));
  const feasible=new Set(ownerCountSymbols().map(x=>x.join(','))),states=[];
  for(let dp=0;dp<=3;dp++)for(let dm=0;dm<=3;dm++)
    for(let ap=0;ap<=2;ap++)for(let am=0;am<=2;am++)
      if(domain==='CARTESIAN'||(feasible.has(dp+','+ap)&&feasible.has(dm+','+am)))
        states.push([dp,dm,ap,am]);
  return states;
}

export function paretoPairKeys([dp,dm,ap,am]){
  return PARETO_DA_MODES.map(([D,A])=>
    coupleFamilyPair('D',dp,dm,D)+'|'+coupleFamilyPair('A',ap,am,A));
}

export function commonQuotient(keyColumns){
  assert.ok(keyColumns.length>0);
  const n=keyColumns[0].length,parent=Array.from({length:n},(_,i)=>i);
  function root(i){while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;}
  for(const keys of keyColumns){
    assert.equal(keys.length,n);
    const first=new Map();
    keys.forEach((key,i)=>{
      if(!first.has(key))first.set(key,i);
      else {const a=root(first.get(key)),b=root(i);parent[Math.max(a,b)]=Math.min(a,b);}
    });
  }
  return parent.map((_,i)=>root(i));
}
