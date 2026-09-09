// Offline, lossless evidence transport only. No benchmark or solver code runs here.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const dir = new URL('../../../docs/research/evidence/', import.meta.url);
const meta = JSON.parse(readFileSync(new URL('2026-09-09-rethink-isolation-qualification.json', dir), 'utf8'));
const rows = readFileSync(new URL('2026-09-09-rethink-isolation-fair-controls.tsv', dir), 'utf8').trimEnd().split('\n').slice(1);
const out = meta.slice(0,-1).map(JSON.stringify);
for (const row of rows) {
  const a=row.split('\t'),pow=+a[0],repeat=+a[1],order=+a[2],mode=a[3],size=2**pow;
  const taskOrder=mode.startsWith('grouped')?[0,2,1]:[0,1,2];
  const descriptorEntries=mode==='splitSameTotal'?size/2:mode==='flatLarge'||mode==='groupedLarge'?size*2:size;
  const results=taskOrder.map(i=>({task:['A1','B','A2'][i],bound:+a[20+i],exactValue:3,nodes:+a[8+i],ms:+a[11+i],ttHits:+a[14+i],writeAttempts:+a[17+i],writeBusy:0,descriptorEntries}));
  out.push(JSON.stringify({kind:'trial',pow,repeat,order,mode,arenaEntries:size*2,arenaBytes:size*28,activeEntries:+a[4],activeBytes:+a[4]*14,wallMs:+a[5],nodes:+a[6],ttHits:+a[7],results}));
}
out.push(JSON.stringify(meta.at(-1)));
const text=out.join('\n')+'\n';
const sha=createHash('sha256').update(text).digest('hex');
assert.equal(sha,'5475278656c649d148efb36eb076cfaa46d29fa668ba7b112b3e9987b496f0d9');
writeFileSync(new URL('2026-09-09-rethink-isolation-fair-controls.restored.jsonl',dir),text);
console.log(JSON.stringify({restoredBytes:Buffer.byteLength(text),lines:out.length,sha256:sha,byteExact:true}));
