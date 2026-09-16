import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const here = new URL('./', import.meta.url);
for (const folder of [here, new URL('../2026-09-12-packed-relational-key/', here)]) {
  const profile = JSON.parse(await readFile(new URL('lookup.cpuprofile', folder)));
  const rows = [];
  for (const node of profile.nodes) {
    if (!node.callFrame.url.includes('relational-key/run.mjs')) continue;
    for (const tick of node.positionTicks ?? []) rows.push({ function: node.callFrame.functionName,
      line: tick.line, ticks: tick.ticks });
  }
  rows.sort((a, b) => b.ticks - a.ticks);
  const source = await readFile(new URL('run.mjs', folder), 'utf8');
  const results = JSON.parse(await readFile(new URL('results.json', folder)));
  const measured = Object.entries(results.means).map(([kind, v]) => {
    const fn = kind === 'triple' ? 'tripleBatch' : kind === 'pair' ? 'pairBatch' : 'nativeBatch';
    const line = source.split('\n').findIndex(s => s.includes(`function ${fn}(`)) + 1;
    return `| ${fn} | [run.mjs:${line}](run.mjs#L${line}) | ${v.ms.toFixed(3)} |`;
  });
  await writeFile(new URL('line-samples.md', folder), '# Lookup timing attribution\n\n'
    + 'Measured batch-function elapsed times, including callees:\n\n'
    + '| Function | Source entry | Mean ms |\n|---|---|---:|\n' + measured.join('\n') + '\n\n'
    + 'Separate 1 ms sampling pass; ticks are sampled source attribution, not exact line latency. Comparator timings exclude this pass.\n\n'
    + (rows.length ? '' : '**Sampling limitation:** V8 attributed the synchronous work to the enclosing module with unknown line number. No usable hot-line samples were returned; the saved profile does not establish per-line costs.\n\n')
    + '| Function | Source | Ticks |\n|---|---|---:|\n'
    + rows.map(r => `| ${r.function} | [run.mjs:${r.line}](run.mjs#L${r.line}) | ${r.ticks} |`).join('\n') + '\n');
  const bytes = await readFile(new URL('run.mjs', folder));
  await writeFile(new URL('runner-sha256.txt', folder), createHash('sha256').update(bytes).digest('hex') + '\n');
}
