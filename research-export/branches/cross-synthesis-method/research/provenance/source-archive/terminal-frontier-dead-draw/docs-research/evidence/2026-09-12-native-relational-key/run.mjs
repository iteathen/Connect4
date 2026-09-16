// Evidence-only lookup experiment. No production owner or representation changes.
import assert from 'node:assert/strict';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { Session } from 'node:inspector';

const here = new URL('./', import.meta.url);
const src = new URL('../../../../research/semantic-quotient/state-identity-unification/src/', here);
if (process.argv[2] !== '--child') {
  const start = performance.now();
  const child = spawn(process.execPath, ['--max-old-space-size=2048', fileURLToPath(import.meta.url), '--child'],
    { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let out = '', err = '', timedOut = false;
  child.stdout.on('data', b => { out += b; }); child.stderr.on('data', b => { err += b; });
  const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, 60000);
  try {
    const [code, signal] = await once(child, 'close');
    await writeFile(new URL('lifecycle.json', here), JSON.stringify({ code, signal, timedOut,
      elapsedMs: performance.now() - start, childExited: true, totalBudgetMs: 60000 }, null, 2));
    if (out) process.stdout.write(out); if (err) process.stderr.write(err);
    process.exitCode = timedOut ? 124 : code ?? 1;
  } finally { clearTimeout(timer); }
} else {
  const digest = b => createHash('sha256').update(b).digest('hex');
  const names = (await readdir(src)).filter(n => n.endsWith('.mjs'));
  const sourceHashes = Object.fromEntries(await Promise.all(names.map(async n => [n, digest(await readFile(new URL(n, src)))])));
  const { createSlot64ResidualQuotientKernel } = await import(new URL('quotient-native-negamax-slot64-residual-kernel.mjs', src));
  const { createBoundedStoragePlan } = await import(new URL('quotient-bounded-storage-plan.mjs', src));
  const { createSemanticSharedTtArena } = await import(new URL('quotient-semantic-shared-tt.mjs', src));
  const { createOnlineSemanticQuotientSearcher } = await import(new URL('quotient-online-semantic-search-lib.mjs', src));

  // All width selection occurs before lookup. IDs must belong to these frozen owners.
  function layout(supportCapacity, classCapacity) {
    for (const n of [supportCapacity, classCapacity]) {
      if (!Number.isSafeInteger(n) || n < 1 || n > 2 ** 32) throw new RangeError('invalid key capacity');
    }
    const s = Math.ceil(Math.log2(supportCapacity)), c = Math.ceil(Math.log2(classCapacity));
    if (s + 2 * c > 64) throw new RangeError('exact local key exceeds two words');
    let low, high;
    if (s + 2 * c <= 32) {
      low = (a, b, d) => (a | (b << s) | (d << (s + c))) >>> 0;
      high = () => 0;
    } else if (s + c < 32) {
      low = (a, b, d) => (a | (b << s) | (d << (s + c))) >>> 0;
      high = (a, b, d) => d >>> (32 - s - c);
    } else if (s + c === 32) {
      low = (a, b) => (a | (b << s)) >>> 0;
      high = (a, b, d) => d;
    } else if (s === 32) {
      low = a => a;
      high = (a, b, d) => (b | (d << c)) >>> 0;
    } else {
      low = (a, b) => (a | (b << s)) >>> 0;
      high = (a, b, d) => ((b >>> (32 - s)) | (d << (s + c - 32))) >>> 0;
    }
    function validate(a, b, d) {
      if (!Number.isInteger(a) || a < 0 || a >= supportCapacity
          || !Number.isInteger(b) || b < 0 || b >= classCapacity
          || !Number.isInteger(d) || d < 0 || d >= classCapacity) throw new RangeError('invalid local key');
    }
    return { s, c, low, high, validate };
  }
  // Independent arbitrary-precision concatenation checks every width regime,
  // including empty bit fields, signed-bit boundaries and maximum Uint32 fields.
  let controls = 0, rng = 0x5192026;
  const random = () => { rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5; return rng >>> 0; };
  for (let s = 0; s <= 32; s++) for (let c = 0; c <= 32; c++) {
    if (s + 2 * c > 64) { assert.throws(() => layout(2 ** s, 2 ** c)); continue; }
    const l = layout(2 ** s, 2 ** c);
    for (let i = 0; i < 32; i++) {
      const a = i === 0 ? 2 ** s - 1 : random() % 2 ** s;
      const b = i === 0 ? 2 ** c - 1 : random() % 2 ** c;
      const d = i === 0 ? 2 ** c - 1 : random() % 2 ** c;
      l.validate(a, b, d);
      const exact = BigInt(a) | (BigInt(b) << BigInt(s)) | (BigInt(d) << BigInt(s + c));
      assert.equal(l.low(a, b, d), Number(exact & 0xffffffffn));
      assert.equal(l.high(a, b, d), Number(exact >> 32n)); controls++;
    }
    assert.throws(() => l.validate(2 ** s, 0, 0));
    assert.throws(() => l.validate(0, 2 ** c, 0));
    assert.throws(() => l.validate(0, 0, 2 ** c));
  }
  for (const invalid of [-1, NaN, Infinity, 0.5, 2 ** 32 + 1]) {
    assert.throws(() => layout(invalid, 1));
    assert.throws(() => layout(1, invalid));
    assert.throws(() => layout(100, 100).validate(0, invalid, 0));
  }
  const { kernel } = createSlot64ResidualQuotientKernel({ columns: 7, rows: 6, connect: 4 }, { cacheEdges: true, prefixClasses: 4096 });
  const plan = createBoundedStoragePlan(kernel, 8, 2 * 1024 ** 3);
  kernel.prepareSearchStorage(plan.searchStorage);
  const arena = createSemanticSharedTtArena({ ...plan.arena, domainSpec: kernel.domain });
  const searcher = createOnlineSemanticQuotientSearcher(kernel, arena, { etc: false });
  const searchStart = performance.now();
  const result = searcher.searchBounded(kernel.rootId, -2, 2, plan.depth);
  const searchMs = performance.now() - searchStart;
  const reference = JSON.parse(await readFile(new URL('../2026-09-12-ranked-depth21/verified-depth8-1-final.json', here)));
  const operations = { transitions: { ...kernel.transitionMetrics }, states: { ...kernel.states.metrics },
    residual: { ...kernel.classes.metrics }, chunks: kernel.classes.slotPools.map(p => ({ ...p.metrics })) };
  assert.deepEqual(result, reference.result); assert.deepEqual(searcher.stats(), reference.search);
  assert.deepEqual(operations, reference.operations);
  const states = kernel.states, n = states.count;
  const supportCapacity = (kernel.domain.rows + 1) ** kernel.domain.columns;
  const l = layout(supportCapacity, plan.searchStorage.classes), low = l.low, high = l.high;
  const keys = new Uint32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const a = states.support[i], b = states.p0Class[i], d = states.p1Class[i];
    l.validate(a, b, d); keys[i * 2] = low(a, b, d); keys[i * 2 + 1] = high(a, b, d);
    const exact = BigInt(a) | (BigInt(b) << BigInt(l.s)) | (BigInt(d) << BigInt(l.s + l.c));
    assert.equal(BigInt(keys[i * 2]) | (BigInt(keys[i * 2 + 1]) << 32n), exact);
  }
  // This is an isolated replacement layout, not additional production metadata.
  function mix32(v) {
    let x = v >>> 0; x ^= x >>> 16; x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15; x = Math.imul(x, 0x846ca68b) >>> 0; x ^= x >>> 16; return x >>> 0;
  }
  function tripleHash(a, b, d) {
    let h = mix32(a + 0x9e3779b9); h = mix32(h ^ Math.imul((b + 1) >>> 0, 0x85ebca6b));
    return mix32(h ^ Math.imul((d + 1) >>> 0, 0xc2b2ae35));
  }
  function pairHash(lo, hi) { return mix32(lo ^ Math.imul(hi, 0x9e3779b1)); }
  const mask = states.hashSlots.length - 1, slots = new Int32Array(mask + 1); slots.fill(-1);
  let insertProbes = 0;
  for (let id = 0; id < n; id++) {
    let at = pairHash(keys[id * 2], keys[id * 2 + 1]) & mask;
    while (slots[at] !== -1) {
      const other = slots[at];
      assert.ok(((keys[id * 2] ^ keys[other * 2]) | (keys[id * 2 + 1] ^ keys[other * 2 + 1])) !== 0,
        'different canonical states acquired the same exact key');
      at = (at + 1) & mask; insertProbes++;
    }
    slots[at] = id;
  }
  const order = Uint32Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = random() % (i + 1), t = order[i]; order[i] = order[j]; order[j] = t; }
  function tripleBatch(rounds) {
    let sum = 0, probes = 0;
    for (let round = 0; round < rounds; round++) for (let i = 0; i < n; i++) {
      const query = order[i], a = states.support[query], b = states.p0Class[query], d = states.p1Class[query];
      let at = tripleHash(a, b, d) & mask;
      while (true) {
        const id = states.hashSlots[at]; probes++;
        if (id === -1) throw new Error('missing triple');
        if (states.support[id] === a && states.p0Class[id] === b && states.p1Class[id] === d) { sum += id; break; }
        at = (at + 1) & mask;
      }
    }
    return { sum, probes };
  }
  function pairBatch(rounds) {
    let sum = 0, probes = 0;
    for (let round = 0; round < rounds; round++) for (let i = 0; i < n; i++) {
      const query = order[i], a = states.support[query], b = states.p0Class[query], d = states.p1Class[query];
      // Include packing costs: transition currently supplies these three fields.
      const lo = low(a, b, d), hi = high(a, b, d);
      let at = pairHash(lo, hi) & mask;
      while (true) {
        const id = slots[at]; probes++;
        if (id === -1) throw new Error('missing pair');
        if (((keys[id * 2] ^ lo) | (keys[id * 2 + 1] ^ hi)) === 0) { sum += id; break; }
        at = (at + 1) & mask;
      }
    }
    return { sum, probes };
  }
  function nativeBatch(rounds) {
    let sum = 0, probes = 0;
    for (let round = 0; round < rounds; round++) for (let i = 0; i < n; i++) {
      const query = order[i] * 2, lo = keys[query], hi = keys[query + 1];
      let at = pairHash(lo, hi) & mask;
      while (true) {
        const id = slots[at]; probes++;
        if (id === -1) throw new Error('missing native pair');
        if (((keys[id * 2] ^ lo) | (keys[id * 2 + 1] ^ hi)) === 0) { sum += id; break; }
        at = (at + 1) & mask;
      }
    }
    return { sum, probes };
  }
  // Full per-query ID checks, rather than trusting timing checksums alone.
  for (let id = 0; id < n; id++) {
    let at = pairHash(keys[id * 2], keys[id * 2 + 1]) & mask;
    while (((keys[slots[at] * 2] ^ keys[id * 2]) | (keys[slots[at] * 2 + 1] ^ keys[id * 2 + 1])) !== 0) {
      assert.notEqual(slots[at], -1); at = (at + 1) & mask;
    }
    assert.equal(slots[at], id);
  }
  tripleBatch(8); pairBatch(8); nativeBatch(8);
  const rounds = 16, runs = [];
  for (const kind of ['triple', 'pair', 'native', 'native', 'pair', 'triple']) {
    const fn = kind === 'triple' ? tripleBatch : kind === 'pair' ? pairBatch : nativeBatch;
    const start = performance.now(), cpuStart = process.cpuUsage();
    const count = fn(rounds), ms = performance.now() - start, cpu = process.cpuUsage(cpuStart);
    assert.equal(count.sum, rounds * n * (n - 1) / 2);
    runs.push({ kind, ms, cpuMs: (cpu.user + cpu.system) / 1000, queries: rounds * n, ...count });
  }
  // Separate source-mapped CPU sampling; excluded from comparator timings.
  const session = new Session(); session.connect();
  const post = (method, params = {}) => new Promise((ok, fail) => session.post(method, params, (e, v) => e ? fail(e) : ok(v)));
  await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 1000 }); await post('Profiler.start');
  tripleBatch(rounds); pairBatch(rounds); nativeBatch(rounds);
  const { profile } = await post('Profiler.stop'); session.disconnect();
  const means = Object.fromEntries(['triple', 'pair', 'native'].map(kind => {
    const values = runs.filter(r => r.kind === kind);
    return [kind, { ms: values.reduce((a, r) => a + r.ms, 0) / values.length,
      cpuMs: values.reduce((a, r) => a + r.cpuMs, 0) / values.length }];
  }));
  for (const name of names) assert.equal(digest(await readFile(new URL(name, src))), sourceHashes[name], `source changed: ${name}`);
  const summary = { kind: 'exact-two-word-local-key-lookup-experiment', node: process.version,
    domain: kernel.domain, depth: plan.depth, searchMs, result, search: searcher.stats(), operations,
    exactSearchCountersMatch: true, widthControls: controls, states: n,
    layout: { supportCapacity, classCapacity: plan.searchStorage.classes, supportBits: l.s, classBits: l.c, totalBits: l.s + 2 * l.c },
    comparedKeyBytes: { triple: n * 12, pair: keys.byteLength }, tableSlots: mask + 1, insertProbes,
    runs, means, productionRepresentationChanged: false,
    limitations: ['uniform successful local-state lookups; not search-weighted trace or insertion timing',
      'packed layout and bucket mixer changed together', 'shared semantic TT is unchanged; IDs are worker-local',
      'removing production triple arrays also requires measuring field decoding at their consumers'] };
  await writeFile(new URL('results.json', here), JSON.stringify(summary, null, 2));
  await writeFile(new URL('lookup.cpuprofile', here), JSON.stringify(profile));
  await writeFile(new URL('source-hashes.json', here), JSON.stringify(sourceHashes, null, 2));
  console.log(JSON.stringify({ states: n, controls, layout: summary.layout, searchMs, means, runs }));
}
