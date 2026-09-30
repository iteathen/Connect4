import test from 'node:test';
import assert from 'node:assert/strict';
import {freezeGridThenReplay} from './ooo-grid-freeze-lib.mjs';

test('a late structural failure prevents every scalar replay',()=>{
  let scalarReads=0;
  assert.throws(()=>freezeGridThenReplay([0,1,2],candidate=>{
    if(candidate===2)throw new Error('structural failure');
    return {candidate};
  },()=>{scalarReads++;}),/structural failure/);
  assert.equal(scalarReads,0);
});

test('all candidate structures exist before first scalar access',()=>{
  const prepared=[];
  const out=freezeGridThenReplay([0,1,2],candidate=>{
    prepared.push(candidate);
    return {candidate,rows:[[candidate]]};
  },state=>{
    assert.deepEqual(prepared,[0,1,2]);
    assert.ok(Object.isFrozen(state));
    assert.ok(Object.isFrozen(state.rows[0]));
    assert.throws(()=>state.rows[0].push(9),TypeError);
    return state.candidate+10;
  });
  assert.deepEqual(out,[10,11,12]);
});
