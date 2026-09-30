import test from 'node:test';
import assert from 'node:assert/strict';
import {preparePolynomial,xorSorted,sparseRank,packedRank,factorization} from './fresh-polynomial.mjs';
import {createFreshOracle,FRESH_CASES} from './fresh-oracle-adapter.mjs';
import {renameCheckpoint} from './fresh-io.mjs';
const cube=Array.from({length:8},(_,mask)=>['a','b','c'].filter((_,i)=>mask&(1<<i)).map(d=>[d,'O']));
test('complete Boolean cube: degree-two obstruction and one-dimensional OOO kernel image',()=>{
  const p=preparePolynomial(cube);assert.equal(p.classKeys.length,8);assert.equal(p.affineRank,4);assert.equal(p.lowerRank,7);assert.equal(p.oooRank,1);assert.equal(p.leftNullity,1);
  const values=p.classSignatures.map(s=>s.length===3?2:0);const low=factorization(p.rowsLow,values);assert.equal(low.exact,false);assert.equal(low.firstFailure.scalarXor,2);
  const codes=p.dependencies.map(d=>d.sourceIndices.reduce((z,i)=>z^values[i],0));assert.equal(factorization(p.dependencies.map(d=>d.oooResidue),codes).exact,true);
});
test('snapshot ordering independent of input enumeration and duplicate rows',()=>{
  assert.deepEqual(preparePolynomial([...cube].reverse().concat(cube)),preparePolynomial(cube));
});
test('paired source certificate is actual lower kernel and actual OOO image',()=>{
  const p=preparePolynomial(cube);for(const d of p.dependencies){assert.deepEqual(d.sourceIndices.reduce((a,i)=>xorSorted(a,p.rowsLow[i]),[]),[]);assert.deepEqual(d.sourceIndices.reduce((a,i)=>xorSorted(a,p.rowsOoo[i]),[]),d.oooResidue);}
});
test('alternative elimination catches two-bit kernel obstruction with replayable certificate',()=>{
  const rows=[[0,2],[1,2],[0,1]],codes=[1,2,0],result=factorization(rows,codes);
  assert.equal(result.exact,false);assert.equal(result.firstFailure.scalarXor,3);assert.equal(result.packedAugmentedRank,3);assert.equal(result.packedStructuralRank,2);
  assert.equal(sparseRank(rows),packedRank(rows));
});
test('resource and malformed-coordinate failures are explicit',()=>{
  assert.throws(()=>preparePolynomial(cube,{maxClasses:2}),/class cap/);assert.throws(()=>preparePolynomial(cube,{maxOooKeys:0}),/OOO key cap/);assert.throws(()=>preparePolynomial(cube,{maxIncidences:5}),/incidence cap/);assert.throws(()=>preparePolynomial([[['x','O'],['x','E']]]),/descriptor repeated/);
});
test('fresh-only oracle allowlist rejects sealed, trained and standard boards without enumeration',()=>{
  assert.deepEqual(FRESH_CASES,['3x7-k4','7x3-k4']);for(const dims of [[3,6,4],[5,3,4],[6,3,3],[6,3,4],[4,5,4],[7,6,4]])assert.throws(()=>createFreshOracle(...dims));
});
test('OneDrive rename retries are bounded and do not retry other failures',()=>{
  let attempts=0,delays=0;renameCheckpoint('a','b',{rename:()=>{if(++attempts<3)throw Object.assign(new Error('locked'),{code:'EPERM'});},delay:()=>delays++});assert.equal(attempts,3);assert.equal(delays,2);
  let failures=0;assert.throws(()=>renameCheckpoint('a','b',{attempts:3,rename:()=>{failures++;throw Object.assign(new Error('locked'),{code:'EBUSY'});},delay:()=>{}}),/locked/);assert.equal(failures,3);
  assert.throws(()=>renameCheckpoint('a','b',{rename:()=>{throw Object.assign(new Error('missing'),{code:'ENOENT'});},delay:()=>assert.fail('must not delay')}),/missing/);
});
