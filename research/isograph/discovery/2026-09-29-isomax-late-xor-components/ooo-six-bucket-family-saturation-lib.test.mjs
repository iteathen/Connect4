import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FAMILY_SATURATION_MODES,
  FAMILY_SATURATION_GRID,
  transformSixBucketByFamily,
  familySaturationPairDelta,
  familySaturationTriangleKey
} from './ooo-six-bucket-family-saturation-lib.mjs';

const A='w1|cap=1|dh0=0:1|dh1=';
const B='w1|cap=0|dh0=1:1|dh1=';
const C='w2|cap=1.0|dh0=0:1|dh1=1:1';

test('family saturation mode catalog and complete grid are frozen',()=>{
  assert.deepEqual(FAMILY_SATURATION_MODES,['PRESENCE','ZOE','CLIP2','CLIP3']);
  assert.equal(FAMILY_SATURATION_GRID.length,64);
  assert.equal(new Set(FAMILY_SATURATION_GRID.map(x=>x.key)).size,64);
  assert.deepEqual(FAMILY_SATURATION_GRID[0],{
    C:'PRESENCE',D:'PRESENCE',A:'PRESENCE',
    key:'C=PRESENCE|D=PRESENCE|A=PRESENCE'
  });
  assert.deepEqual(FAMILY_SATURATION_GRID.at(-1),{
    C:'CLIP3',D:'CLIP3',A:'CLIP3',
    key:'C=CLIP3|D=CLIP3|A=CLIP3'
  });
});

test('family transforms stay paired across plus/minus buckets',()=>{
  const raw='C+=0,C-=1|D+=2,D-=3,A+=4,A-=1';
  assert.equal(
    transformSixBucketByFamily(raw,{C:'PRESENCE',D:'ZOE',A:'CLIP2'}),
    'C+=0,C-=1|D+=E,D-=O,A+=2,A-=1'
  );
  assert.equal(
    transformSixBucketByFamily(raw,{C:'CLIP3',D:'CLIP3',A:'CLIP3'}),
    'C+=0,C-=1|D+=2,D-=3,A+=3,A-=1'
  );
});

test('family-saturation pair signatures are endpoint invariant',()=>{
  for(const candidate of FAMILY_SATURATION_GRID){
    assert.equal(
      familySaturationPairDelta(A,B,candidate),
      familySaturationPairDelta(B,A,candidate),
      candidate.key
    );
  }
});

test('family-saturation triangle keys are permutation invariant',()=>{
  const perms=[[A,B,C],[A,C,B],[B,A,C],[B,C,A],[C,A,B],[C,B,A]];
  for(const candidate of FAMILY_SATURATION_GRID){
    const key=familySaturationTriangleKey(perms[0],candidate);
    for(const p of perms.slice(1))
      assert.equal(familySaturationTriangleKey(p,candidate),key,candidate.key);
  }
});
