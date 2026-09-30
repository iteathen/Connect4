import test from 'node:test';
import assert from 'node:assert/strict';
import {renameCheckpoint} from './independent-io.mjs';
test('transient Windows sharing refusal retries boundedly',()=>{
  let calls=0;const waits=[];
  renameCheckpoint('a','b',{rename:()=>{calls++;if(calls<3)throw Object.assign(new Error('sharing'),{code:'EPERM'});},wait:n=>waits.push(n)});
  assert.equal(calls,3);assert.deepEqual(waits,[10,20]);
});
test('permanent errors and exhausted sharing retries surface',()=>{
  assert.throws(()=>renameCheckpoint('a','b',{rename:()=>{throw Object.assign(new Error('disk'),{code:'ENOSPC'});},wait:()=>{throw Error('must not wait');}}),/disk/);
  let calls=0;assert.throws(()=>renameCheckpoint('a','b',{rename:()=>{calls++;throw Object.assign(new Error('sharing'),{code:'EPERM'});},wait:()=>{}}),/sharing/);assert.equal(calls,7);
});
