import fs from 'node:fs';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
import { loadVariant } from './variants.mjs';
import small from '../bsfp-rba-reference/rank33-expected.json' with {type:'json'};
import large from '../bsfp-rba-reference/rank33-larger-expected.json' with {type:'json'};
import { boundaryHash } from '../bsfp-rba-reference/boundary-hash.mjs';
const variant=process.argv[2], { solveRbaWdl }=await loadVariant(variant);
const emit=data=>fs.writeSync(1,JSON.stringify(data)+'\n');
solveRbaWdl({columns:3,rows:2,connect:3}); // identical untimed warmup
const cases=[
  {name:'4x3-c3-complete',geometry:{columns:4,rows:3,connect:3}},
  {name:'rank33-small',...small},
  {name:'rank33-large',...large},
];
for(const c of cases) {
  global.gc?.();
  const entries=[];
  let observedHeapBytes=process.memoryUsage().heapUsed;
  const start=performance.now();
  const result=solveRbaWdl(c.geometry,{minimumHeights:c.minimumHeights,onSupport:entry=>{
    entries.push(entry);
    observedHeapBytes=Math.max(observedHeapBytes,process.memoryUsage().heapUsed);
    if(entries.length%16===0) emit({kind:'progress',variant,case:c.name,
      completedSupports:entries.length,rank:entry.fiber.rank,elapsedMs:performance.now()-start});
  }});
  const elapsedMs=performance.now()-start;
  const fronts=['upper0','upper1','lowerMinus1','lower0'];
  // Equality reporting runs outside the timer. Hashes are evidence checks,
  // never solver identity or a replacement for exact set equality.
  const boundaries=entries.map(e=>({heights:e.fiber.heights,
    fronts:fronts.map(n=>e[n].map(v=>v.toString(16)))}));
  if(c.supports) for(const expected of c.supports) {
    const e=result.frontierAt(expected.heights);
    for(const n of fronts) assert.deepEqual(boundaryHash(e.fiber,e[n]),expected[n]);
  }
  emit({kind:'summary',variant,case:c.name,geometry:c.geometry,minimumHeights:c.minimumHeights??null,
    elapsedMs,rootWdl:result.rootWdl,metrics:result.metrics,observedHeapBytes,
    maxRssBytes:process.resourceUsage().maxRSS*1024,
    boundaryDigest:createHash('sha256').update(JSON.stringify(boundaries)).digest('hex'),
    pinnedHashesChecked:c.supports?c.supports.length*4:0});
}
