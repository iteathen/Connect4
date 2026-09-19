import test from 'node:test';
import assert from 'node:assert/strict';
import { IsoMaxSolver } from '../../components/isometric/solver.mjs';
import { portableKey,classHash,sampleHash } from './portable-q-census.mjs';
test('cold census equality uses full canonical content across pools and mirrors',()=>{
  const a=new IsoMaxSolver(),b=new IsoMaxSolver();
  b.createState([0,1,0,1,2,3]);
  const x=a.createState([1,3,2,4]),y=b.createState([5,3,4,2]);
  const q=x.gameplayKey(),r=y.gameplayKey();
  assert.equal(portableKey(a.pool,...q),portableKey(b.pool,...r));
  assert.equal(sampleHash(classHash(a.pool,q[0]),classHash(a.pool,q[1]),q[2]),
    sampleHash(classHash(b.pool,r[0]),classHash(b.pool,r[1]),r[2]));
  assert.notEqual(portableKey(a.pool,...q),portableKey(a.pool,q[0],q[1],q[2]+1));
  assert.notEqual(portableKey(a.pool,-1,0,0),portableKey(a.pool,0,0,0));
});
