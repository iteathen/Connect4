import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PhysicalControl } from '../qualification/physical-control.mjs';
import { IsometricState, ResidualPool, IsoMaxSolver, IsoMaxCertificateIndex,
  temporalGuard, resourceGuard, realizabilityGuard, exactValueConclusion } from '../index.mjs';
const pairs = JSON.parse(readFileSync(new URL('../qualification/q-collision-controls.json', import.meta.url),'utf8').replace(/^\uFEFF/,''));
const masks = terms => terms.map(([lo,hi])=>BigInt(lo)|(BigInt(hi)<<32n)).sort((a,b)=>a<b?-1:a>b?1:0);

test('deliberate physically distinct q collisions commute through every legal suffix', () => {
  let states = 0, edges = 0;
  const pool = new ResidualPool();
  const solver = new IsoMaxSolver({ pool });
  function check(a,b,na,nb) {
    states++;
    assert.equal(a.status,b.status);
    assert.equal(na.status,a.status); assert.equal(nb.status,b.status);
    assert.deepEqual(na.gameplayKey(),nb.gameplayKey());
    assert.deepEqual(a.legal(),b.legal());
    if (a.status) {
      assert.equal(na.play(0),-1); // No transition after the first win/full board.
      return;
    }
    assert.equal(a.q(),b.q());
    for (const [physical,native] of [[a,na],[b,nb]]) {
      assert.deepEqual(masks(pool.terms(native.p0Class)),physical.residuals(0));
      assert.deepEqual(masks(pool.terms(native.p1Class)),physical.residuals(1));
      assert.deepEqual(Array.from(native.heights),physical.heights);
      const expected = physical.solve();
      assert.equal(solver.solveValue(native).value,expected.value);
      const preserving = [];
      for (const column of physical.legal()) {
        native.play(column);
        if (solver.solveValue(native).value === expected.value) preserving.push(column);
        native.undo();
      }
      assert.deepEqual(preserving,expected.moves);
    }
    assert.deepEqual(a.solve(),b.solve());
    const beforeA = na.gameplayKey(), beforeB = nb.gameplayKey();
    for (const column of a.legal()) {
      edges++;
      const ca = a.play(column), cb = b.play(column);
      assert.equal(ca,cb);
      assert.equal(na.play(column),ca); assert.equal(nb.play(column),cb);
      check(a,b,na,nb);
      a.undo(); b.undo(); na.undo(); nb.undo();
      assert.deepEqual(na.gameplayKey(),beforeA); assert.deepEqual(nb.gameplayKey(),beforeB);
    }
  }
  for (const pair of pairs) for (const mirror of [false,true]) {
    const am = pair.a.map(c=>mirror?6-c:c), bm=pair.b.map(c=>mirror?6-c:c);
    const a = new PhysicalControl(am), b = new PhysicalControl(bm);
    assert.notDeepEqual(a.cells,b.cells);
    assert.equal(a.q(),b.q());
    check(a,b,new IsometricState({pool,moves:am}),new IsometricState({pool,moves:bm}));
  }
  console.log(JSON.stringify({ qCollisionPairs:pairs.length, states, edges, mirrorControls:true }));
  assert.equal(states,100);
  assert.equal(edges,76);
});

test('same-q physical collisions cannot erase resource, deadline, realizability or provenance premises', () => {
  const pool = new ResidualPool(), index = new IsoMaxCertificateIndex(pool);
  const pair = pairs[3];
  let a = new IsometricState({pool,moves:pair.a}), b = new IsometricState({pool,moves:pair.b});
  if (a.structuralSignature()[2]) {
    a = new IsometricState({pool,moves:pair.a.map(c=>6-c)});
    b = new IsometricState({pool,moves:pair.b.map(c=>6-c)});
  }
  assert.deepEqual(a.gameplayKey(),b.gameplayKey());
  for (const [name,constructor] of [['deadline',temporalGuard],['resource',resourceGuard],['realizable',realizabilityGuard]]) {
    const base = {guard:constructor({context:'one'}),conclusion:exactValueConclusion(0),proofIdentity:name,dependencyCone:{source:'A'}};
    index.add(a,base);
    assert.throws(()=>index.add(b,{...base,guard:constructor({context:'two'})}),/collision/);
    assert.throws(()=>index.add(b,{...base,dependencyCone:{source:'B'}}),/collision/);
  }
  assert.equal(index.lookup(b).applicable.length,0);
  assert.equal(index.lookup(b).unresolved.length,3);
});
