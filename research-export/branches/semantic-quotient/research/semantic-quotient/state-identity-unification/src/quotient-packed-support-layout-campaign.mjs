import { performance } from 'node:perf_hooks';
import { createBsfpSupportLatticeProfile, BSFP_INVALID_ITEM_U32 } from '../../../../components/bsfp/support-lattice.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
  Object.freeze({ columns: 7, rows: 6, connect: 4 }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function bitsFor(maxInclusive) {
  return Math.max(1, Math.ceil(Math.log2(maxInclusive + 1)));
}

function buildTableLayout(spec, support) {
  const { columns, rows } = spec;
  const landing = new Uint8Array(support.itemCapacity * columns);
  landing.fill(0xff);
  const child = new Uint32Array(support.itemCapacity * columns);
  child.fill(BSFP_INVALID_ITEM_U32);
  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
    for (let column = 0; column < columns; column += 1) {
      const height = Math.floor(supportIndex / support.weights[column]) % support.radix;
      if (height >= rows) continue;
      const edge = supportIndex * columns + column;
      landing[edge] = height * columns + column;
      child[edge] = supportIndex + support.weights[column];
    }
  }
  return Object.freeze({ landing, child });
}

function buildPackedLayout(spec, support) {
  const { columns, rows } = spec;
  const heightBits = bitsFor(rows);
  const rankBits = bitsFor(columns * rows);
  const rankShift = heightBits * columns;
  const totalBits = rankShift + rankBits;
  if (totalBits > 32) throw new RangeError(`packed support descriptor needs ${totalBits} bits`);
  const heightMask = (2 ** heightBits) - 1;
  const rankMask = (2 ** rankBits) - 1;
  const columnShift = new Uint8Array(columns);
  for (let column = 0; column < columns; column += 1) columnShift[column] = column * heightBits;
  const descriptor = new Uint32Array(support.itemCapacity);
  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
    let packed = 0;
    let rank = 0;
    for (let column = 0; column < columns; column += 1) {
      const height = Math.floor(supportIndex / support.weights[column]) % support.radix;
      rank += height;
      packed = (packed | (height << columnShift[column])) >>> 0;
    }
    descriptor[supportIndex] = (packed | (rank << rankShift)) >>> 0;
  }
  return Object.freeze({ descriptor, heightBits, rankBits, rankShift, totalBits, heightMask, rankMask, columnShift });
}

function qualify(spec, support, table, packed) {
  let checkedEdges = 0;
  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
    const word = packed.descriptor[supportIndex];
    const rank = (word >>> packed.rankShift) & packed.rankMask;
    assert(rank === support.ranks[supportIndex], `rank mismatch at support ${supportIndex}`);
    for (let column = 0; column < spec.columns; column += 1) {
      const height = (word >>> packed.columnShift[column]) & packed.heightMask;
      const edge = supportIndex * spec.columns + column;
      const expectedLanding = table.landing[edge];
      const expectedChild = table.child[edge];
      const actualLanding = height >= spec.rows ? 0xff : height * spec.columns + column;
      const actualChild = height >= spec.rows ? BSFP_INVALID_ITEM_U32 : supportIndex + support.weights[column];
      assert(actualLanding === expectedLanding, `landing mismatch ${supportIndex}/${column}`);
      assert(actualChild === expectedChild, `child mismatch ${supportIndex}/${column}`);
      checkedEdges += 1;
    }
  }
  return { checkedSupports: support.itemCapacity, checkedEdges };
}

function makeProbeSequence(itemCapacity, columns, count) {
  const supports = new Uint32Array(count);
  const lanes = new Uint8Array(count);
  let x = 0x9e3779b9;
  for (let index = 0; index < count; index += 1) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    supports[index] = x % itemCapacity;
    lanes[index] = (x >>> 16) % columns;
  }
  return { supports, lanes };
}

function benchAccess(spec, support, table, packed) {
  const probeCount = Math.min(4_000_000, Math.max(500_000, support.itemCapacity * spec.columns * 2));
  const probe = makeProbeSequence(support.itemCapacity, spec.columns, probeCount);

  function tablePass() {
    let checksum = 0;
    const started = performance.now();
    for (let index = 0; index < probeCount; index += 1) {
      const supportIndex = probe.supports[index];
      const column = probe.lanes[index];
      const edge = supportIndex * spec.columns + column;
      checksum = (checksum + support.ranks[supportIndex] + table.landing[edge] + table.child[edge]) >>> 0;
    }
    return { ms: performance.now() - started, checksum };
  }

  function packedPass() {
    let checksum = 0;
    const started = performance.now();
    for (let index = 0; index < probeCount; index += 1) {
      const supportIndex = probe.supports[index];
      const column = probe.lanes[index];
      const word = packed.descriptor[supportIndex];
      const rank = (word >>> packed.rankShift) & packed.rankMask;
      const height = (word >>> packed.columnShift[column]) & packed.heightMask;
      const landing = height >= spec.rows ? 0xff : height * spec.columns + column;
      const child = height >= spec.rows ? BSFP_INVALID_ITEM_U32 : supportIndex + support.weights[column];
      checksum = (checksum + rank + landing + child) >>> 0;
    }
    return { ms: performance.now() - started, checksum };
  }

  // Warm both JIT paths before measurement.
  tablePass();
  packedPass();
  const tableRuns = [];
  const packedRuns = [];
  for (let repeat = 0; repeat < 9; repeat += 1) {
    const first = repeat & 1 ? packedPass() : tablePass();
    const second = repeat & 1 ? tablePass() : packedPass();
    if (repeat & 1) {
      packedRuns.push(first);
      tableRuns.push(second);
    } else {
      tableRuns.push(first);
      packedRuns.push(second);
    }
  }
  for (let index = 0; index < tableRuns.length; index += 1) {
    assert(tableRuns[index].checksum === packedRuns[index].checksum, 'support access checksum mismatch');
  }
  const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  const tableMs = median(tableRuns.map((run) => run.ms));
  const packedMs = median(packedRuns.map((run) => run.ms));
  return { probeCount, tableMs, packedMs, ratioPackedOverTable: packedMs / tableMs };
}

function runCase(spec) {
  const supportStarted = performance.now();
  const support = createBsfpSupportLatticeProfile(spec);
  const supportBuildMs = performance.now() - supportStarted;
  const tableStarted = performance.now();
  const table = buildTableLayout(spec, support);
  const tableBuildMs = performance.now() - tableStarted;
  const packedStarted = performance.now();
  const packed = buildPackedLayout(spec, support);
  const packedBuildMs = performance.now() - packedStarted;
  const qualification = qualify(spec, support, table, packed);
  const access = benchAccess(spec, support, table, packed);
  const weightsBytes = support.weights.byteLength;
  const rankBytes = support.ranks.byteLength;
  const tableBytes = rankBytes + weightsBytes + table.landing.byteLength + table.child.byteLength;
  const packedBytes = weightsBytes + packed.columnShift.byteLength + packed.descriptor.byteLength;
  const result = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    itemCapacity: support.itemCapacity,
    encoding: { heightBits: packed.heightBits, rankBits: packed.rankBits, totalBits: packed.totalBits },
    qualification,
    buildMs: { supportProfile: supportBuildMs, table: tableBuildMs, packed: packedBuildMs },
    bytes: {
      rank: rankBytes,
      weights: weightsBytes,
      landing: table.landing.byteLength,
      child: table.child.byteLength,
      tableTotal: tableBytes,
      packedDescriptor: packed.descriptor.byteLength,
      packedTotal: packedBytes,
      ratioPackedOverTable: packedBytes / tableBytes,
      bytesSaved: tableBytes - packedBytes,
    },
    access,
  };
  console.error(`[support-pack] ${result.geometry} supports=${support.itemCapacity} table=${tableBytes}B packed=${packedBytes}B memRatio=${result.bytes.ratioPackedOverTable.toFixed(3)} accessRatio=${access.ratioPackedOverTable.toFixed(3)}`);
  return result;
}

const cases = CASES.map(runCase);
console.error(`PACKED_SUPPORT_LAYOUT_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, supports: entry.itemCapacity, tableBytes: entry.bytes.tableTotal, packedBytes: entry.bytes.packedTotal, memoryRatio: entry.bytes.ratioPackedOverTable, accessRatio: entry.access.ratioPackedOverTable })))}`);
console.log(JSON.stringify({
  kind: 'connect4-packed-support-layout-v1',
  status: 'complete',
  date: '2026-09-11',
  authority: 'support representation only; no solver semantic change',
  qualification: 'exhaustive support/rank/landing/child equivalence for every support and column',
  caveat: 'access benchmark is a randomized structural microbenchmark, not yet whole-solver promotion evidence',
  cases,
}, null, 2));
