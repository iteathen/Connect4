import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { parse } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { TypedA123Solver, A123_GEOMETRY, heightAt } from './residual_solver_wsl625_typed_a123.mjs';

const { WIDTH, CELLS, TT_LOWER_OFFSET, TT_UPPER_OFFSET, G, upBits } = A123_GEOMETRY;
const NONE = 255;

function lowBitIndex(z) {
  const lo = Number(z & 0xffffffffn);
  if (lo) return 31 - Math.clz32(lo & -lo);
  let shift = 32;
  z >>= 32n;
  while (z) {
    const w = Number(z & 0xffffffffn);
    if (w) return shift + 31 - Math.clz32(w & -w);
    z >>= 32n;
    shift += 32;
  }
  return -1;
}

function slotBit(slot) {
  return (1 << slot) >>> 0;
}

function makeList(capacity, directRole) {
  const prev = new Uint8Array(capacity);
  const next = new Uint8Array(capacity);
  prev.fill(NONE);
  next.fill(NONE);
  return {
    capacity,
    directRole,
    size: 0,
    head: NONE,
    tail: NONE,
    liveMask: 0,
    id: new Uint32Array(capacity),
    currentRef: new Uint32Array(capacity),
    opponentRef: new Uint32Array(capacity),
    value: new Int8Array(capacity),
    prev,
    next,
    directMasks: new Map(),
    aggregateDirect: 0n,
  };
}

function unlink(list, slot) {
  const p = list.prev[slot];
  const n = list.next[slot];
  if (p !== NONE) list.next[p] = n;
  else list.head = n;
  if (n !== NONE) list.prev[n] = p;
  else list.tail = p;
  list.prev[slot] = NONE;
  list.next[slot] = NONE;
}

function appendTail(list, slot) {
  list.prev[slot] = list.tail;
  list.next[slot] = NONE;
  if (list.tail !== NONE) list.next[list.tail] = slot;
  else list.head = slot;
  list.tail = slot;
}

function moveTail(list, slot) {
  if (list.tail === slot) return;
  unlink(list, slot);
  appendTail(list, slot);
}

function firstFreeSlot(list) {
  const free = (~list.liveMask) >>> 0;
  assert.notEqual(free, 0, 'expected a free V3 frontier slot');
  const low = (free & -free) >>> 0;
  return 31 - Math.clz32(low);
}

function pop32(x) {
  x >>>= 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

export function makeImplV3Solver(capacity, stageOrder, { verifyBulk = false } = {}) {
  assert(Number.isInteger(capacity) && capacity > 0 && capacity <= 32);
  assert(stageOrder === 'impl-first' || stageOrder === 'a123-first');

  return class TypedA123ImplV3Solver extends TypedA123Solver {
    constructor(pow = 19) {
      super(pow);
      this.implCapacity = capacity;
      this.implStageOrder = stageOrder;
      this.implVerifyBulk = verifyBulk;
    }

    resetMetrics() {
      super.resetMetrics();
      this.implBuckets = new Map();
      this.implSideMeta = [];
      this.implLowerExact = new Map();
      this.implUpperExact = new Map();
      this.implFrontierItems = 0;
      this.implMaxBucketItems = 0;
      this.implLookups = 0;
      this.implSlotScans = 0;
      this.implBulkRidLookups = 0;
      this.implBulkRejected = 0;
      this.implCandidateVisits = 0;
      this.implSecondClosureChecks = 0;
      this.implSecondClosureRejects = 0;
      this.implLowerMatches = 0;
      this.implUpperMatches = 0;
      this.implLowerTightens = 0;
      this.implUpperTightens = 0;
      this.implLowerCuts = 0;
      this.implUpperCuts = 0;
      this.implStores = 0;
      this.implUpdates = 0;
      this.implRefreshes = 0;
      this.implEvictions = 0;
      this.implExactHits = 0;
      this.implRidMaskSets = 0;
      this.implRidMaskClears = 0;
      this.implBulkVerifySlots = 0;
      this.implBulkVerifyMismatches = 0;
    }

    sideMeta(ref) {
      let m = this.implSideMeta[ref];
      if (m !== undefined) return m;
      const n = this.side.length[ref];
      const at = this.side.offset[ref];
      let bits = 0n;
      let upUnion = 0n;
      for (let i = 0; i < n; i += 1) {
        const rid = this.side.flat[at + i];
        bits |= 1n << BigInt(rid);
        upUnion |= upBits[rid];
      }
      m = { length: n, bits, upUnion };
      this.implSideMeta[ref] = m;
      return m;
    }

    bucket(height, create = false) {
      const key = height >>> 0;
      let b = this.implBuckets.get(key);
      if (b === undefined && create) {
        b = { lower: null, upper: null };
        this.implBuckets.set(key, b);
      }
      return b;
    }

    listFor(bucket, kind, create = false) {
      let list = bucket[kind];
      if (list === null && create) {
        list = makeList(this.implCapacity, kind === 'lower' ? 'current' : 'opponent');
        bucket[kind] = list;
      }
      return list;
    }

    directRef(list, slot) {
      return list.directRole === 'current' ? list.currentRef[slot] : list.opponentRef[slot];
    }

    addDirectIndex(list, slot, ref) {
      const at = this.side.offset[ref];
      const n = this.side.length[ref];
      const bit = slotBit(slot);
      for (let i = 0; i < n; i += 1) {
        const rid = this.side.flat[at + i];
        const old = list.directMasks.get(rid) ?? 0;
        list.directMasks.set(rid, (old | bit) >>> 0);
        list.aggregateDirect |= 1n << BigInt(rid);
        this.implRidMaskSets += 1;
      }
    }

    removeDirectIndex(list, slot, ref) {
      const at = this.side.offset[ref];
      const n = this.side.length[ref];
      const bit = slotBit(slot);
      const keep = (~bit) >>> 0;
      for (let i = 0; i < n; i += 1) {
        const rid = this.side.flat[at + i];
        const old = list.directMasks.get(rid);
        assert.notEqual(old, undefined, 'missing V3 direct RID mask on eviction');
        const next = (old & keep) >>> 0;
        if (next === 0) {
          list.directMasks.delete(rid);
          list.aggregateDirect &= ~(1n << BigInt(rid));
        } else {
          list.directMasks.set(rid, next);
        }
        this.implRidMaskClears += 1;
      }
    }

    removeSlot(list, slot, exact) {
      const ref = this.directRef(list, slot);
      this.removeDirectIndex(list, slot, ref);
      unlink(list, slot);
      list.liveMask = (list.liveMask & ~slotBit(slot)) >>> 0;
      list.size -= 1;
      this.implFrontierItems -= 1;
      assert.equal(exact.get(list.id[slot]), slotRecordKey(list, slot));
      exact.delete(list.id[slot]);
    }

    storeBound(kind, id, height, currentRef, opponentRef, value) {
      const bucket = this.bucket(height, true);
      const list = this.listFor(bucket, kind, true);
      const exact = kind === 'lower' ? this.implLowerExact : this.implUpperExact;
      this.implStores += 1;

      const exactKey = exact.get(id);
      if (exactKey !== undefined) {
        this.implExactHits += 1;
        assert.equal(exactKey.list, list, 'exact-state V3 bound mapped to wrong support list');
        const slot = exactKey.slot;
        assert.equal(list.currentRef[slot], currentRef);
        assert.equal(list.opponentRef[slot], opponentRef);
        const stronger = kind === 'lower' ? value > list.value[slot] : value < list.value[slot];
        if (stronger) {
          list.value[slot] = value;
          this.implUpdates += 1;
        } else {
          this.implRefreshes += 1;
        }
        moveTail(list, slot);
        return;
      }

      let slot;
      if (list.size >= list.capacity) {
        slot = list.head;
        assert.notEqual(slot, NONE);
        const oldId = list.id[slot];
        const oldRef = this.directRef(list, slot);
        this.removeDirectIndex(list, slot, oldRef);
        unlink(list, slot);
        list.liveMask = (list.liveMask & ~slotBit(slot)) >>> 0;
        list.size -= 1;
        this.implFrontierItems -= 1;
        const oldKey = exact.get(oldId);
        assert(oldKey && oldKey.list === list && oldKey.slot === slot, 'V3 exact-state eviction index drift');
        exact.delete(oldId);
        this.implEvictions += 1;
      } else {
        slot = firstFreeSlot(list);
      }

      list.id[slot] = id;
      list.currentRef[slot] = currentRef;
      list.opponentRef[slot] = opponentRef;
      list.value[slot] = value;
      appendTail(list, slot);
      list.liveMask = (list.liveMask | slotBit(slot)) >>> 0;
      list.size += 1;
      this.implFrontierItems += 1;
      this.addDirectIndex(list, slot, this.directRef(list, slot));
      exact.set(id, { list, slot });

      const total = (bucket.lower?.size ?? 0) + (bucket.upper?.size ?? 0);
      if (total > this.implMaxBucketItems) this.implMaxBucketItems = total;
    }

    bulkCandidates(list, closure) {
      let missing = list.aggregateDirect & ~closure;
      let invalid = 0;
      while (missing) {
        const rid = lowBitIndex(missing);
        assert(rid >= 0);
        const mask = list.directMasks.get(rid);
        assert.notEqual(mask, undefined, 'V3 aggregate RID missing slot mask');
        invalid = (invalid | mask) >>> 0;
        missing &= ~(1n << BigInt(rid));
        this.implBulkRidLookups += 1;
      }
      const candidates = (list.liveMask & ~invalid) >>> 0;
      this.implBulkRejected += list.size - pop32(candidates);
      return candidates;
    }

    verifyBulkMask(list, candidates, closure) {
      if (!this.implVerifyBulk) return;
      for (let slot = list.tail; slot !== NONE; slot = list.prev[slot]) {
        const direct = this.sideMeta(this.directRef(list, slot));
        const expected = (direct.bits & ~closure) === 0n;
        const actual = (candidates & slotBit(slot)) !== 0;
        this.implBulkVerifySlots += 1;
        if (expected !== actual) this.implBulkVerifyMismatches += 1;
        assert.equal(actual, expected, 'V3 exact RID-mask bulk filter mismatch');
      }
    }

    lookupImpl(height, currentRef, opponentRef, alpha, beta) {
      const bucket = this.bucket(height, false);
      if (bucket === undefined) return { alpha, beta, cutoff: false };
      this.implLookups += 1;
      const tc = this.sideMeta(currentRef);
      const to = this.sideMeta(opponentRef);

      const lower = bucket.lower;
      if (lower !== null && lower.size !== 0) {
        const candidates = this.bulkCandidates(lower, tc.upUnion);
        this.verifyBulkMask(lower, candidates, tc.upUnion);
        for (let slot = lower.tail; slot !== NONE; slot = lower.prev[slot]) {
          this.implSlotScans += 1;
          if ((candidates & slotBit(slot)) === 0) continue;
          this.implCandidateVisits += 1;
          const eo = this.sideMeta(lower.opponentRef[slot]);
          this.implSecondClosureChecks += 1;
          if ((to.bits & ~eo.upUnion) !== 0n) {
            this.implSecondClosureRejects += 1;
            continue;
          }
          this.implLowerMatches += 1;
          const value = lower.value[slot];
          if (alpha < value) {
            alpha = value;
            this.implLowerTightens += 1;
          }
          if (alpha >= beta) {
            this.implLowerCuts += 1;
            return { alpha, beta, cutoff: true };
          }
        }
      }

      const upper = bucket.upper;
      if (upper !== null && upper.size !== 0) {
        const candidates = this.bulkCandidates(upper, to.upUnion);
        this.verifyBulkMask(upper, candidates, to.upUnion);
        for (let slot = upper.tail; slot !== NONE; slot = upper.prev[slot]) {
          this.implSlotScans += 1;
          if ((candidates & slotBit(slot)) === 0) continue;
          this.implCandidateVisits += 1;
          const ec = this.sideMeta(upper.currentRef[slot]);
          this.implSecondClosureChecks += 1;
          if ((tc.bits & ~ec.upUnion) !== 0n) {
            this.implSecondClosureRejects += 1;
            continue;
          }
          this.implUpperMatches += 1;
          const value = upper.value[slot];
          if (beta > value) {
            beta = value;
            this.implUpperTightens += 1;
          }
          if (alpha >= beta) {
            this.implUpperCuts += 1;
            return { alpha, beta, cutoff: true };
          }
        }
      }

      return { alpha, beta, cutoff: false };
    }

    negamax(id, alpha, beta) {
      this.nodes += 1;
      const moves = this.arena.moves[id];
      const height = this.arena.height[id];
      const currentRef = this.arena.currentRef[id];
      const opponentRef = this.arena.opponentRef[id];

      if (this.side.length[currentRef] === 0 && this.side.length[opponentRef] === 0) {
        this.drawStops += 1;
        return 0;
      }

      const opponentWins = this.side.immediateWinningColumns(opponentRef, height);
      if ((opponentWins & (opponentWins - 1)) !== 0) return -Math.trunc((CELLS - moves) / 2);

      const candidateColumns = [];
      if (opponentWins !== 0) candidateColumns.push(31 - Math.clz32(opponentWins));
      else for (const column of G.order) if (heightAt(height, column) < 6) candidateColumns.push(column);

      const survivors = [];
      for (const column of candidateColumns) {
        const prepared = this.arena.prepare(id, column);
        if (prepared === null) continue;
        if (prepared.terminal) return Math.trunc((CELLS + 1 - moves) / 2);
        if (this.side.immediateWinningColumns(prepared.currentRef, prepared.height) !== 0) continue;
        survivors.push(prepared);
      }

      if (survivors.length === 0) return -Math.trunc((CELLS - moves) / 2);
      if (moves >= CELLS - 2) return 0;

      let min = -Math.trunc((CELLS - 2 - moves) / 2);
      if (alpha < min) {
        alpha = min;
        if (alpha >= beta) return alpha;
      }
      let max = Math.trunc((CELLS - 1 - moves) / 2);
      if (beta > max) {
        beta = max;
        if (alpha >= beta) return beta;
      }

      if (survivors.length === 1) {
        this.forcedTransitions += 1;
        return -this.negamax(this.arena.internPrepared(survivors[0]), -beta, -alpha);
      }

      const probe = this.probe(id, moves, alpha, beta);
      alpha = probe.alpha;
      beta = probe.beta;
      if (probe.cutoff) return alpha;

      if (this.implStageOrder === 'impl-first') {
        const q = this.lookupImpl(height, currentRef, opponentRef, alpha, beta);
        alpha = q.alpha;
        beta = q.beta;
        if (q.cutoff) return alpha;
      }

      if (this.side.length[currentRef] !== 0 && this.noWinA123(currentRef, height, moves) && beta > 0) {
        beta = 0;
        if (alpha >= beta) {
          this.a123Cuts += 1;
          this.publish(probe.slot, id, TT_UPPER_OFFSET);
          this.storeBound('upper', id, height, currentRef, opponentRef, 0);
          return beta;
        }
      }

      if (this.implStageOrder === 'a123-first') {
        const q = this.lookupImpl(height, currentRef, opponentRef, alpha, beta);
        alpha = q.alpha;
        beta = q.beta;
        if (q.cutoff) return alpha;
      }

      survivors.sort((a, b) => b.orderScore - a.orderScore || G.order.indexOf(a.column) - G.order.indexOf(b.column));
      for (const p of survivors) {
        const score = -this.negamax(this.arena.internPrepared(p), -beta, -alpha);
        if (score >= beta) {
          this.publish(probe.slot, id, score + TT_LOWER_OFFSET);
          this.storeBound('lower', id, height, currentRef, opponentRef, score);
          return score;
        }
        if (score > alpha) alpha = score;
      }

      this.publish(probe.slot, id, alpha + TT_UPPER_OFFSET);
      this.storeBound('upper', id, height, currentRef, opponentRef, alpha);
      return alpha;
    }

    metrics() {
      return {
        ...super.metrics(),
        impl: {
          form: 'IMPL-RID-EXACTDIST-RIDMASK-V3',
          capacity: this.implCapacity,
          stageOrder: this.implStageOrder,
          buckets: this.implBuckets.size,
          frontierItems: this.implFrontierItems,
          maxBucketItems: this.implMaxBucketItems,
          lowerExact: this.implLowerExact.size,
          upperExact: this.implUpperExact.size,
          lookups: this.implLookups,
          slotScans: this.implSlotScans,
          bulkRidLookups: this.implBulkRidLookups,
          bulkRejected: this.implBulkRejected,
          candidateVisits: this.implCandidateVisits,
          secondClosureChecks: this.implSecondClosureChecks,
          secondClosureRejects: this.implSecondClosureRejects,
          lowerMatches: this.implLowerMatches,
          upperMatches: this.implUpperMatches,
          lowerTightens: this.implLowerTightens,
          upperTightens: this.implUpperTightens,
          lowerCuts: this.implLowerCuts,
          upperCuts: this.implUpperCuts,
          boundCuts: this.implLowerCuts + this.implUpperCuts,
          stores: this.implStores,
          updates: this.implUpdates,
          refreshes: this.implRefreshes,
          exactHits: this.implExactHits,
          evictions: this.implEvictions,
          ridMaskSets: this.implRidMaskSets,
          ridMaskClears: this.implRidMaskClears,
          bulkVerifySlots: this.implBulkVerifySlots,
          bulkVerifyMismatches: this.implBulkVerifyMismatches,
        },
      };
    }
  };
}

function slotRecordKey(list, slot) {
  return { list, slot };
}

const ROOTS = [
  { seq: '663152175', expected: -4, label: 'anchor-loss', controlNodes: 557605, v1: { 'c32-impl-first': 364377, 'c32-a123-first': 364320, 'c4-a123-first': 419408 } },
  { seq: '41267575', expected: 3, label: 'anchor-win', controlNodes: 3161623, v1: { 'c32-impl-first': 1950573, 'c32-a123-first': 1950939, 'c4-a123-first': 2228281 } },
];
const FORMS = [
  { name: 'c32-impl-first', capacity: 32, stageOrder: 'impl-first' },
  { name: 'c32-a123-first', capacity: 32, stageOrder: 'a123-first' },
  { name: 'c4-a123-first', capacity: 4, stageOrder: 'a123-first' },
];
const REPS = 6;
const WARM = 2;

function run(Ctor, pos) {
  const s = new Ctor(19);
  const t = performance.now();
  const score = s.solve(pos);
  const elapsedMs = performance.now() - t;
  return { score, elapsedMs, ...s.metrics() };
}

function median(v) {
  const a = [...v].sort((x, y) => x - y);
  const n = a.length;
  return n & 1 ? a[n >> 1] : (a[n / 2 - 1] + a[n / 2]) / 2;
}

function stable(a, b, label) {
  for (const k of ['score', 'nodes', 'ttHits', 'writeAttempts', 'writeSuccess', 'forcedTransitions', 'drawStops']) {
    assert.equal(b[k], a[k], `${label} ${k}`);
  }
}

const results = [];
for (const root of ROOTS) {
  const pos = parse(root.seq);
  const control = run(TypedA123Solver, pos);
  assert.equal(control.score, root.expected);
  assert.equal(control.nodes, root.controlNodes);

  const screen = [];
  for (const f of FORMS) {
    const Ctor = makeImplV3Solver(f.capacity, f.stageOrder);
    const r = run(Ctor, pos);
    assert.equal(r.score, root.expected, `${root.label} ${f.name}`);
    assert.equal(r.nodes, root.v1[f.name], `${root.label} ${f.name} V3 changed V1 proof tree`);
    screen.push({ ...f, nodeReductionVsControl: 1 - r.nodes / control.nodes, wallRatioVsControl: r.elapsedMs / control.elapsedMs, result: r });
    console.error(`[IMPL V3] ${root.label} ${f.name} nodes=${r.nodes} bulkReject=${r.impl.bulkRejected} candidates=${r.impl.candidateVisits} secondClosure=${r.impl.secondClosureChecks} ms=${r.elapsedMs.toFixed(1)}`);
  }

  if (root.label === 'anchor-loss') {
    for (const f of FORMS.filter((x) => x.capacity === 32)) {
      const VerifyCtor = makeImplV3Solver(f.capacity, f.stageOrder, { verifyBulk: true });
      const verified = run(VerifyCtor, pos);
      assert.equal(verified.score, root.expected);
      assert.equal(verified.nodes, root.v1[f.name]);
      assert(verified.impl.bulkVerifySlots > 0);
      assert.equal(verified.impl.bulkVerifyMismatches, 0);
      console.error(`[IMPL V3 verify] ${f.name} slots=${verified.impl.bulkVerifySlots} mismatches=0`);
    }
  }

  const repeatForms = [
    { name: 'control', Ctor: TypedA123Solver },
    ...FORMS.filter((f) => f.capacity === 32).map((f) => ({ name: f.name, Ctor: makeImplV3Solver(f.capacity, f.stageOrder) })),
  ];
  const rows = [];
  for (let rep = 0; rep < REPS; rep += 1) {
    const shift = rep % repeatForms.length;
    const order = [...repeatForms.slice(shift), ...repeatForms.slice(0, shift)];
    const row = { rep, order: order.map((x) => x.name) };
    for (const f of order) {
      const r = run(f.Ctor, pos);
      assert.equal(r.score, root.expected);
      if (f.name === 'control') assert.equal(r.nodes, root.controlNodes);
      else assert.equal(r.nodes, root.v1[f.name]);
      if (rows.length && rows[0][f.name]) stable(rows[0][f.name], r, `${root.label} ${f.name} rep=${rep}`);
      row[f.name] = r;
    }
    rows.push(row);
  }

  const timed = rows.filter((r) => r.rep >= WARM);
  const repeated = {};
  for (const f of repeatForms) {
    const times = timed.map((r) => r[f.name].elapsedMs);
    repeated[f.name] = { medianMs: median(times), nodes: timed[0][f.name].nodes, speedupVsControl: null };
  }
  for (const f of repeatForms) repeated[f.name].speedupVsControl = repeated.control.medianMs / repeated[f.name].medianMs;

  results.push({
    ...root,
    control,
    screen,
    repeated: { reps: REPS, warm: WARM, timedOrders: timed.map((r) => r.order), forms: repeated },
  });
}

console.log(JSON.stringify({
  kind: 'connect4-minimax-mq5-typed-a123-impl-v3',
  status: 'pass',
  authority: 'V3 preserves V1 bounded-recent frontier membership and recency traversal. One exact RID implication is evaluated in bulk with per-frontier exact requirement-ID slot masks; the remaining implication is checked exactly on survivors. No signature/hash authorizes transfer. Lower/upper directions and null-window authority are unchanged. Matching V1 node counts are asserted for each capacity/order, and the loss anchor differentially verifies every bulk slot decision.',
  results,
}, null, 2));
