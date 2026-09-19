import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PhysicalControl } from '../qualification/physical-control.mjs';
import { IsometricState, ResidualPool, IsoMaxSolver, IsoMaxRbaValueResolver, IsoMaxCertificateIndex,
  rankGuard, exactValueConclusion } from '../index.mjs';
const pairs = JSON.parse(readFileSync(new URL('../qualification/q-collision-controls.json',import.meta.url),'utf8'));
const draw = [1,5,2,3,6,3,2,5,4,4,1,3,0,2,5,0,6,1,6,1,2,2,0,1,5,0,2,5,0,5,0,6,4,4,4,6,1,4,3,3,6,3];
const certificateDraw = [3,4,3,0,3,3,2,0,5,2,1,4,3,3,4,5,6,4,4,0,5,6,0,6,4,2,6,5,2,5,1,1,0,2,6,5,2,0,1,6,1,1];

test('optional boundary membership, solver WDL and every preserving action agree on complete late cones', () => {
  let queries = 0, hits = 0, recursiveControlChildren = 0;
  const pool = new ResidualPool();
  const roots = [...pairs.map(p=>[p.a,p.b]), [draw.slice(0,36)], [certificateDraw.slice(0,36)]];
  for (const group of roots) {
    const valueResolver = new IsoMaxRbaValueResolver({pool,minimumHeights:new PhysicalControl(group[0]).heights});
    const solver = new IsoMaxSolver({pool,valueResolver}), control = new IsoMaxSolver({pool});
    for (const moves of group) for (const mirror of [false,true]) {
      const path = moves.map(c=>mirror?6-c:c);
      const physical = new PhysicalControl(path), native = new IsometricState({pool,moves:path});
      function visit() {
        const expected = physical.solve();
        const before = native.gameplayKey();
        if (!physical.status) { assert.equal(valueResolver.resolve(native),expected.value); queries++; }
        else assert.equal(valueResolver.resolve(native),null);
        control.resetSearchMemory(); solver.resetSearchMemory();
        const baseline = control.solveValue(native), actual = solver.solveValue(native);
        assert.equal(baseline.value,expected.value); assert.equal(actual.value,expected.value);
        hits += actual.metrics.valueBoundaryHits;
        recursiveControlChildren += baseline.metrics.recursiveChildren;
        const preserving = [];
        for (const c of physical.legal()) {
          physical.play(c); native.play(c);
          if (solver.solveValue(native).value === expected.value) preserving.push(c);
          visit(); native.undo(); physical.undo();
        }
        assert.deepEqual(preserving,expected.moves);
        assert.deepEqual(native.gameplayKey(),before);
        assert.equal(solver.certificates.size,0,'ordinary values do not synthesize proof certificates');
      }
      visit();
    }
  }
  assert.ok(hits>0); assert.ok(recursiveControlChildren>0);
  console.log(JSON.stringify({ boundaryMembershipQueries:queries, boundaryHits:hits, recursiveControlChildren }));
});

test('incomplete or uncovered boundary work never becomes WDL; pool ownership is enforced', () => {
  const pool = new ResidualPool();
  const minimumHeights = new PhysicalControl(draw.slice(0,36)).heights;
  assert.throws(()=>new IsoMaxRbaValueResolver({pool,minimumHeights,maxSupports:1}),/incomplete/);
  assert.throws(()=>new IsoMaxRbaValueResolver({pool,minimumHeights,maxCandidates:1}),/incomplete/);
  const resolver = new IsoMaxRbaValueResolver({pool,minimumHeights});
  assert.equal(resolver.resolve(new IsometricState({pool})),null);
  assert.throws(()=>resolver.resolve(new IsometricState()),/pool/);
  assert.throws(()=>new IsoMaxSolver({valueResolver:resolver}),/pool/);
  const unsupported = new IsometricState({pool,moves:certificateDraw.slice(0,36)});
  const baseline = new IsoMaxSolver({pool}).solveValue(unsupported);
  const result = new IsoMaxSolver({pool,valueResolver:resolver}).solveValue(unsupported);
  assert.equal(result.value,baseline.value);
});

test('guarded exact certificates precede value queries and recursive errors restore caller state', () => {
  const pool = new ResidualPool();
  const state = new IsometricState({pool,moves:certificateDraw.slice(0,34)});
  const value = new PhysicalControl(certificateDraw.slice(0,34)).solve().value;
  const certificates = new IsoMaxCertificateIndex(pool);
  certificates.add(state,{guard:rankGuard({min:34,max:34}),conclusion:exactValueConclusion(value)});
  const valueResolver = new IsoMaxRbaValueResolver({pool,minimumHeights:Array(7).fill(6)});
  const result = new IsoMaxSolver({pool,certificates,valueResolver}).solveValue(state);
  assert.equal(result.metrics.valueBoundaryQueries,0);
  // An exception after a play must not leave the caller at its child state.
  class ThrowAtChildIndex extends IsoMaxCertificateIndex {
    lookup(current) { if (current.ply>34) throw new Error('qualification child failure'); return super.lookup(current); }
  }
  const throwing = new ThrowAtChildIndex(pool);
  throwing.add(state,{guard:rankGuard({min:42,max:42}),conclusion:exactValueConclusion(0)});
  const before = {q:state.gameplayKey(),heights:Array.from(state.heights),ply:state.ply,status:state.status,
    support:[state.supportLo,state.supportHi],playable:[state.playableLo,state.playableHi]};
  assert.throws(()=>new IsoMaxSolver({pool,certificates:throwing}).solveValue(state),/child failure/);
  assert.deepEqual({q:state.gameplayKey(),heights:Array.from(state.heights),ply:state.ply,status:state.status,
    support:[state.supportLo,state.supportHi],playable:[state.playableLo,state.playableHi]},before);
});
