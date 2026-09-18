import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const result = JSON.parse(await readFile(new URL('./result.json', import.meta.url)));
const baseline = JSON.parse(await readFile(new URL('../2026-09-12-cheap-chunk-hash/2-candidate.json', import.meta.url)));
assert.deepEqual(result.result, baseline.result);
assert.deepEqual(result.search, baseline.search);
assert.deepEqual(result.memory, baseline.memory);
assert.deepEqual(result.storageDuringSearch.before, result.storageDuringSearch.after);
const hist = Array(65).fill(0);
const rows = result.operations.chunks.map((m, slot) => {
  const storage = result.memory.residual.slotDictionaries[slot];
  assert.equal(m.hashedLookups + m.emptyBypasses, m.lookups - m.lookupStart);
  assert.equal(m.hashReads, m.hashedLookups + m.collisionRejections);
  assert.equal(m.probeHistogram.reduce((a,b) => a+b,0), m.hashedLookups);
  const { hashedLookups, emptyBypasses, hashReads, candidateReads, collisionRejections, maxProbe, uniqueSlots, indexBlocks64, payloadBlocks64 } = m;
  m.probeHistogram.forEach((n, i) => { hist[i] += n; });
  return { slot, chunks: storage.chunkCount, capacity: storage.chunkCapacity,
    loadFactor: storage.chunkCount / (storage.hashSlotBytes / 4),
    hashedLookups, emptyBypasses, hashReads, candidateReads, collisionRejections,
    meanProbe: hashReads / hashedLookups, oneSlotPercent: 100 * m.probeHistogram[1] / hashedLookups,
    maxProbe, uniqueSlots, indexBlocks64, payloadBlocks64,
    reservedBytes: storage.totalTypedBytes,
    touchedReadBlocksBytes: (indexBlocks64 + payloadBlocks64) * 64 };
});
const sum = key => rows.reduce((n, r) => n+r[key],0);
const summary = { bounds: result.config, qualification: 'Result, every search/proof/descriptor counter, memory and growth match uninstrumented baseline.',
  interpretation: 'Instrumented lookup counters, not CPU/cache-miss timing. A touched 64-byte block is an address-range count; cache line size, residency, evictions, latency and temporal locality are not measured. Histogram bin 64 includes >=64; maxProbe is exact.',
  hashedLookups: sum('hashedLookups'), emptyBypasses: sum('emptyBypasses'),
  hashReads: sum('hashReads'), collisionRejections: sum('collisionRejections'),
  candidateReads: sum('candidateReads'), meanProbe: sum('hashReads') / sum('hashedLookups'),
  oneSlotPercent: 100 * hist[1] / sum('hashedLookups'),
  maximumProbe: Math.max(...rows.map(r => r.maxProbe)), histogram: hist,
  reservedBytes: sum('reservedBytes'), uniqueIndexSlots: sum('uniqueSlots'),
  touchedReadBlocksBytes: sum('touchedReadBlocksBytes'), rows };
await writeFile(new URL('./summary.json', import.meta.url), JSON.stringify(summary,null,2)+'\n');
let md = '# Chunk probe diagnostic\n\nResearch direction / architecture: Josh Oshiro  \nImplementation / qualification: OpenAI ChatGPT\n\n';
md += summary.interpretation + '\n\n' + summary.qualification + '\n\n';
md += `Mean slots examined: ${summary.meanProbe.toFixed(3)}. One-slot lookups: ${summary.oneSlotPercent.toFixed(2)}%. Maximum: ${summary.maximumProbe}. Extra collision reads: ${summary.collisionRejections}.\n\n`;
md += '| Chunk dictionary | Unique chunks | Hash load | Mean slots | One-slot % | Max slots | Reserved MiB | Touched read blocks MiB |\n|---|---:|---:|---:|---:|---:|---:|---:|\n';
for(const r of rows) md += `| ${r.slot} | ${r.chunks} | ${(r.loadFactor*100).toFixed(3)}% | ${r.meanProbe.toFixed(3)} | ${r.oneSlotPercent.toFixed(2)} | ${r.maxProbe} | ${(r.reservedBytes/1048576).toFixed(2)} | ${(r.touchedReadBlocksBytes/1048576).toFixed(3)} |\n`;
await writeFile(new URL('./report.md', import.meta.url),md);
console.log(JSON.stringify({ ...summary, histogram: undefined, rows: undefined }));
console.log(md);
