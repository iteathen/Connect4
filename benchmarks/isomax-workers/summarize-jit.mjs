// Portable static generated-code/deopt summary. Counts are code sites/events,
// not dynamic instructions, branch misses, or proof of allocation freedom.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const trace = fs.readFileSync(process.argv[2], 'utf8');
const names = new Set(['solveNode', 'applyUnchecked', 'undo', 'ownTransition', 'blockTransition',
  'internBits', 'computeSingletonMasks', 'gameplayKey', 'singletonEffectClass', 'promotedColumn',
  'getPreparedUnchecked', 'setPreparedUnchecked', 'prepareKey',
  'mix32', 'hashSignature', 'hashWords2', 'hashChunkTuple']);
const code = [];
for (const fragment of trace.split('--- Optimized code ---').slice(1)) {
  const block = fragment.split('--- End code ---')[0];
  const name = block.match(/\nname = (.*)\r?\n/)?.[1].trim();
  if (!names.has(name)) continue;
  const inline = block.match(/Inlined functions[^\n]*\n([\s\S]*?)Deoptimization Input Data/)?.[1] ?? '';
  code.push({ name, tier: block.match(/kind = (.*)/)?.[1].trim(),
    instructionBytes: Number(block.match(/Instructions \(size = (\d+)\)/)?.[1]),
    fastCCallSites: (block.match(/external value \(IsolateData::fast_c_call_caller_pc_\)/g) ?? []).length,
    allocationTopReads: (block.match(/movq[^\n]*external value \(IsolateData::new_allocation_info_top_address/g) ?? []).length,
    heapNumberMapLoads: (block.match(/movq[^\n]*root \(heap_number_map\)/g) ?? []).length,
    deoptPoints: Number(block.match(/deopt points = (\d+)/)?.[1] ?? 0),
    inlined: [...inline.matchAll(/<SharedFunctionInfo ([^>]+)>/g)].map(m => m[1]) });
}
const deopts = {};
for (const line of trace.split('\n')) {
  if (!line.includes('bailout (kind:')) continue;
  const name = line.match(/<JSFunction ([^ ]+)/)?.[1] ?? '(unknown)';
  const reason = line.match(/reason: ([^)]*)/)?.[1] ?? '(unknown)';
  const key = name + ': ' + reason;
  deopts[key] = (deopts[key] ?? 0) + 1;
}
const result = { traceSha256: createHash('sha256').update(trace).digest('hex'),
  limits: 'Static sites are not dynamic cost. Deopt events include warmup and repeated lazy frames. No hardware counters captured.',
  code, deopts };
fs.writeFileSync(process.argv[3], JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(code.filter(c => ['applyUnchecked','undo','solveNode'].includes(c.name))));
