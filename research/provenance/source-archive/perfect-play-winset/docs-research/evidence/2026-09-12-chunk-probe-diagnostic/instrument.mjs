import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const root = 'C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/frontier-audit-results/probe-diagnostic-20260912';
const prefix = 'research/semantic-quotient/state-identity-unification/src';
const changes = [];
async function modify(file, edit) {
  const path = join(root, prefix, file), bytes = await readFile(path);
  const hash = data => createHash('sha256').update(data).digest('hex');
  let source = bytes.toString().replaceAll('\r\n', '\n');
  const replace = (before, after) => {
    assert.equal(source.split(before).length, 2, `instrumentation seam must occur once: ${before}`);
    source = source.replace(before, after);
  };
  edit(replace);
  await writeFile(path, source);
  changes.push({ file, beforeSha256: hash(bytes), instrumentedSha256: hash(source) });
}
await modify('quotient-slot64-residual-pool-v2.mjs', replace => {
  replace('  intern(source, offset) {', `  resetProbeDiagnostic() {
    this.probeSlots = new Uint8Array(this.hashSlots.length);
    this.probeBlocks = new Uint8Array(Math.ceil(this.hashSlots.length / 16));
    this.payloadBlocks = new Uint8Array(Math.ceil(this.capacity / 8));
    Object.assign(this.metrics, { lookupStart: this.metrics.lookups, hashedLookups: 0, emptyBypasses: 0,
      hashReads: 0, candidateReads: 0, collisionRejections: 0, maxProbe: 0,
      uniqueSlots: 0, indexBlocks64: 0, payloadBlocks64: 0, probeHistogram: Array(65).fill(0) });
  }

  recordProbe(steps) {
    if (!this.probeSlots) return;
    this.metrics.hashedLookups++;
    this.metrics.maxProbe = Math.max(this.metrics.maxProbe, steps);
    this.metrics.probeHistogram[Math.min(steps, 64)]++;
  }

  intern(source, offset) {`);
  replace('    if ((word0 | word1) === 0 && this.#emptyId >= 0) {',
    '    if ((word0 | word1) === 0 && this.#emptyId >= 0) {\n      if (this.probeSlots) this.metrics.emptyBypasses++;');
  replace('    let mask = this.hashSlots.length - 1;\n    let slot = hash & mask;',
    '    let mask = this.hashSlots.length - 1;\n    let slot = hash & mask;\n    let steps = 0;');
  replace('      const id = this.hashSlots[slot];\n      if (id === -1) break;', `      steps++;
      if (this.probeSlots) {
        this.metrics.hashReads++;
        if (!this.probeSlots[slot]) { this.probeSlots[slot] = 1; this.metrics.uniqueSlots++; }
        const block = slot >>> 4;
        if (!this.probeBlocks[block]) { this.probeBlocks[block] = 1; this.metrics.indexBlocks64++; }
      }
      const id = this.hashSlots[slot];
      if (id === -1) { this.recordProbe(steps); break; }
      if (this.probeSlots) {
        this.metrics.candidateReads++;
        const block = id >>> 3;
        if (!this.payloadBlocks[block]) { this.payloadBlocks[block] = 1; this.metrics.payloadBlocks64++; }
      }`);
  replace('      if (this.words[base] === word0 && this.words[base + 1] === word1) {',
    '      if (this.words[base] === word0 && this.words[base + 1] === word1) {\n        this.recordProbe(steps);');
  replace('      slot = (slot + 1) & mask;\n    }\n    if (this.count >= UINT32_MAX)',
    '      if (this.probeSlots) this.metrics.collisionRejections++;\n      slot = (slot + 1) & mask;\n    }\n    if (this.count >= UINT32_MAX)');
});
await modify('quotient-bounded-search.mjs', replace => {
  replace('  const storageBefore = kernel.storageGrowthStats();',
    '  for (const chunk of kernel.classes.slotPools) chunk.resetProbeDiagnostic();\n  const storageBefore = kernel.storageGrowthStats();');
});
await writeFile(new URL('./source-manifest.json', import.meta.url), JSON.stringify({ root,
  purpose: 'Isolated diagnostic counters only. Timings are instrumented and are not performance evidence. Production source is unchanged.',
  changes }, null, 2) + '\n');
