import assert from 'node:assert/strict';
import test from 'node:test';
import {createOracle, assertCarrier, slotMatching, canonicalComponents, dependencyImage} from './independent-oracle.mjs';

test('carrier boundary is closed; tiny toys are explicitly separate',()=>{
  for(const c of [[6,3,3],[4,5,4],[6,3,4]])assert.doesNotThrow(()=>assertCarrier(...c));
  for(const c of [[3,6,4],[5,3,4],[7,6,4],[2,2,2]])assert.throws(()=>assertCarrier(...c));
  assert.doesNotThrow(()=>assertCarrier(2,2,2,true));
  assert.throws(()=>assertCarrier(3,6,4,true));
});
test('one-column toy is a forced alternating full-board draw',()=>{
  const o=createOracle(1,3,3,{toy:true});o.enumerate();o.solve();
  assert.equal(o.codes.length,4);assert.equal(o.row(0).wdlAbsolute,0);
  assert.equal(o.row(o.codes.at(-1)).terminal,true);
  assert.equal(o.row(o.codes.at(-1)).winner,null);
});
test('2x2 connect2 ends immediately on first alignment',()=>{
  const o=createOracle(2,2,2,{toy:true});o.enumerate();o.solve();
  assert.equal(o.codes.length,13);assert.equal(o.row(0).wdlAbsolute,1);
  for(const code of o.codes){const r=o.row(code);if(r.terminal)assert.equal(r.rank,3);}
  const afterTwo=o.codeFromCells([1,2,0,0]);
  assert.equal(o.row(afterTwo).t2,'W');
});
test('R means distinct alternating slots, not independent deadlines',()=>{
  assert.equal(slotMatching([1,1],0,0,2),false);
  assert.equal(slotMatching([1,3],0,0,3),true);
  assert.equal(slotMatching([2,3],1,0,3),false);
});
test('component canonicalization preserves owner and role-bound phase',()=>{
  const a=canonicalComponents({h:[0,1],r0:[9],r1:[]},2,3);
  const b=canonicalComponents({h:[1,0],r0:[6],r1:[]},2,3);
  assert.deepEqual(a,b);
  const c=canonicalComponents({h:[0,1],r0:[],r1:[9]},2,3);
  assert.notDeepEqual(a.roleCapparZoe,c.roleCapparZoe);
});
test('OOO image uses structural lower-feature kernel',()=>{
  const descriptors=['a','b','c'];
  const rows=Array.from({length:8},(_,bits)=>descriptors.filter((_,i)=>bits&(1<<i)).map(d=>[d,'O']));
  const out=dependencyImage(rows);
  assert.equal(out.lowerRank,7);assert.equal(out.leftNullity,1);assert.equal(out.oooRank,1);
  assert.equal(out.oooColumns.length,1);
});
