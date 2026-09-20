import test from 'node:test';
import assert from 'node:assert/strict';
import { IsometricState, ResidualPool, IsoMaxTransitionCache, IsoMaxSolver } from '../index.mjs';
import { makeCorpus } from '../../../benchmarks/isomax-ordering/corpus.mjs';

test('q orbit order and literal action transporter agree independently of proof orientation', () => {
  const pool = new ResidualPool();
  const roots = [...makeCorpus({ seed: 911, ply: 20, count: 96 }).map(r => r.moves),
    [], [0, 6], [0, 1, 1, 0, 2, 3, 3, 2, 4, 5, 5, 4, 6, 6]];
  let orderDisagreements = 0, symmetricSupports = 0;
  const oldToNew = new Map(), newToOld = new Map();
  for (const moves of roots) for (const replay of [moves, moves.map(c => 6 - c)]) {
    const state = new IsometricState({ pool, moves: replay });
    const proof = Array.from(state.structuralSignature());
    const oldSupport = proof[2] ? state.reflectedSupportCode() : proof[3]
      ? Math.min(state.supportCode, state.reflectedSupportCode()) : state.supportCode;
    const oldKey = [proof[0], proof[1], oldSupport].join(',');
    const key = state.gameplayKey(), orientation = state.gameplayOrientation();
    const newKey = Array.from(key).join(',');
    if (oldToNew.has(oldKey)) assert.equal(oldToNew.get(oldKey), newKey);
    if (newToOld.has(newKey)) assert.equal(newToOld.get(newKey), oldKey);
    oldToNew.set(oldKey, newKey); newToOld.set(newKey, oldKey);
    assert.deepEqual(Array.from(state.structuralSignature()), proof, 'q must not change proof retrieval');
    if (proof[3] === 0 && proof[2] !== orientation) orderDisagreements++;
    if (state.supportCode === state.reflectedSupportCode()) symmetricSupports++;
    const canonical = new IsometricState({ pool, moves: replay.map(c => orientation ? 6 - c : c) });
    assert.deepEqual(Array.from(key), [canonical.p0Class, canonical.p1Class, canonical.supportCode]);
    for (let c = 0; c < 7; c++) {
      const transported = orientation ? 6 - c : c;
      assert.equal(state.canPlay(c), canonical.canPlay(transported));
      if (!state.canPlay(c)) continue;
      state.play(c); canonical.play(transported);
      assert.equal(state.status, canonical.status);
      assert.deepEqual(state.gameplayKey(), canonical.gameplayKey());
      state.undo(); canonical.undo();
    }
  }
  assert.ok(orderDisagreements > 0, 'old proof orientation would be an incorrect q transporter');
  assert.ok(symmetricSupports > 0, 'exercise residual tie breaking');
});

test('original support minimum avoids all residual reflection and comparison', () => {
  const pool = new ResidualPool(), state = new IsometricState({ pool, moves: [0] });
  assert.ok(state.supportCode < state.reflectedSupportCode());
  pool.reflectClass = pool.compareClasses = () => { throw new Error('unnecessary residual transform'); };
  assert.deepEqual(Array.from(state.gameplayKey()), [state.p0Class, state.p1Class, state.supportCode]);
  assert.equal(state.gameplayOrientation(), 0);
});

test('gameplay key is exactly a pool-local triple, with transport separate', () => {
  const pool = new ResidualPool();
  const state = new IsometricState({ pool, moves: [0, 1, 0, 2, 6] });
  const mirror = new IsometricState({ pool, moves: [6, 5, 6, 4, 0] });
  assert.equal(state.gameplayKey().length, 3);
  assert.deepEqual(state.gameplayKey(), mirror.gameplayKey());
  assert.notEqual(state.gameplayOrientation(), mirror.gameplayOrientation());
  const cache = new IsoMaxTransitionCache({ pool });
  cache.set(state, 42);
  assert.equal(cache.get(mirror), 42);
  const otherPool = new ResidualPool();
  const other = new IsometricState({ pool: otherPool, moves: [0, 1, 0, 2, 6] });
  assert.throws(() => cache.get(other), /pool/);
  assert.throws(() => cache.set(other, 17), /pool/);
  assert.throws(() => new IsoMaxSolver({ pool: otherPool, transitionCache: cache }), /pool/);
});

test('reflection-canonical q_r transports literal action labels', () => {
  const pool = new ResidualPool();
  const left = new IsometricState({ pool, moves: [0, 0, 0, 0, 0, 0] });
  const right = new IsometricState({ pool, moves: [6, 6, 6, 6, 6, 6] });

  assert.deepEqual(left.gameplayKey(), right.gameplayKey());

  const legalLeft = Array.from({ length: 7 }, (_, column) => column).filter(column => left.canPlay(column));
  const legalRight = Array.from({ length: 7 }, (_, column) => column).filter(column => right.canPlay(column));
  assert.notDeepEqual(legalLeft, legalRight);
  assert.deepEqual(legalLeft.map(column => 6 - column).sort((a, b) => a - b), legalRight);

  const parentKey = Array.from(left.gameplayKey());
  for (const column of legalLeft) {
    const reflectedColumn = 6 - column;
    assert.notEqual(left.play(column), -1);
    assert.notEqual(right.play(reflectedColumn), -1);
    assert.equal(left.status, right.status);
    assert.deepEqual(left.gameplayKey(), right.gameplayKey());
    assert.equal(left.undo(), true);
    assert.equal(right.undo(), true);
    assert.deepEqual(Array.from(left.gameplayKey()), parentKey);
    assert.deepEqual(left.gameplayKey(), right.gameplayKey());
  }
});

test('repeated resize, collisions, mirrors and arbitrary payloads preserve full q equality', () => {
  const pool = new ResidualPool();
  const cache = new IsoMaxTransitionCache({ pool, initialCapacity: 8 });
  const entries = new Map();
  let random = 17;
  for (let game = 0; game < 60; game++) {
    const moves = [];
    const state = new IsometricState({ pool });
    do {
      const key = String(state.gameplayKey());
      if (!entries.has(key)) {
        const value = Object.freeze({ ordinal: entries.size, key });
        cache.set(state, value);
        entries.set(key, { moves: [...moves], value, status: state.status });
      }
      const packed = state.gameplayKey()[2];
      let rank = 0;
      for (let c = 0; c < 7; c++) rank += (packed >>> (3*c)) & 7;
      assert.equal(rank, state.ply);
      assert.equal(packed >>> 21, rank);
      assert.equal(rank & 1, state.sideToMove);
      // Legal replay only: win sentinel identifies its owner; full support draw.
      const status = state.p0Class === -1 ? 1 : state.p1Class === -1 ? 2 : rank === 42 ? 3 : 0;
      assert.equal(state.status, status);
      if (state.isTerminal()) break;
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
      const columns = Array.from({length:7}, (_,c)=>c).filter(c=>state.canPlay(c));
      const c = columns[random % columns.length];
      moves.push(c);
      state.play(c);
    } while (true);
  }
  assert.ok(cache.capacity >= 1024); // At least seven doublings from 8.
  assert.equal(cache.count, entries.size);
  let displaced = 0;
  for (const { moves, value, status } of entries.values()) {
    const state = new IsometricState({ pool, moves });
    const mirror = new IsometricState({ pool, moves: moves.map(c=>6-c) });
    assert.equal(cache.get(state), value);
    assert.equal(cache.get(mirror), value);
    assert.equal(mirror.status, status);
    const slot = cache.findSlot(state.gameplayKey());
    if (cache.used[(slot - 1 + cache.capacity) % cache.capacity]) displaced++;
  }
  assert.ok(displaced > 0, 'exercise occupied probe neighborhoods');
});
