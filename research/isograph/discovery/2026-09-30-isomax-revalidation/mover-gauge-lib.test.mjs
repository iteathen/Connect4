import test from 'node:test';
import assert from 'node:assert/strict';
import {swapDescriptorOwners,moverFromSignature,gaugeSignature,selectedVertex} from './mover-gauge-lib.mjs';
test('full descriptor owner swap recanonicalizes capacity roles and is involutive',()=>{
  const d='w2|cap=0.1|r0=0:0,1:1|r1=1:0';
  assert.equal(swapDescriptorOwners(swapDescriptorOwners(d)),d);
  assert.equal(selectedVertex(d),'w2|cap=0.1|dh0=0:1,1:1|dh1=1:1');
});
test('mover parity uses odd descriptor multiplicities and board cell parity',()=>{
  const d='w1|cap=1|r0=|r1=';
  assert.equal(moverFromSignature([[d,'O']],18),1);
  assert.equal(moverFromSignature([[d,'E']],18),0);
  assert.equal(moverFromSignature([[d,'O']],21),0);
});
test('mover normalization is an involution at fixed board parity',()=>{
  const s=[['w1|cap=1|r0=0:0|r1=','O']];
  const t=gaugeSignature(s,18,'MOVER_CANONICAL');
  assert.notDeepEqual(t,s);assert.deepEqual(gaugeSignature(t,18,'MOVER_CANONICAL'),s);
  assert.deepEqual(gaugeSignature(s,21,'MOVER_CANONICAL'),s);
});
