import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { moduleUrl, loadVariant } from './variants.mjs';

// Exercise the ACTUAL isolated candidate with the entire established suite:
// 608 semantic hashes, physical oracle, complete abstract fibers, limits.
const suiteUrl=new URL('../../components/bsfp/test/rba-wdl-reference.test.mjs',import.meta.url);
let suite=fs.readFileSync(suiteUrl,'utf8');
const seam="from '../rba-wdl-reference.mjs'";
if(suite.split(seam).length!==2) throw new Error('qualification import seam drift');
suite=suite.replace(seam,"from '"+moduleUrl('B3-stream')+"'");
suite=suite.replace(/from '(\.[^']+)'/g,(_,p)=>`from '${new URL(p,suiteUrl).href}'`);
await import('data:text/javascript;base64,'+Buffer.from(suite).toString('base64'));

test('streaming product preserves permutations, duplicates, wide bits, both orientations and charges',async()=>{
  const base=await loadVariant('baseline'), stream=await loadVariant('B3-stream');
  let random=197;
  const next=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return BigInt(random);};
  const cases=[[[],[]],[[0n],[0n]],[[1n,1n,3n],[3n,1n,1n]]];
  for(let n=0;n<100;n++) {
    const masks=()=>Array.from({length:1+n%20},()=>next()|(next()<<32n)|(next()<<64n)|(next()<<96n));
    cases.push([masks(),masks()]);
  }
  for(const [a,b] of cases) for(const [left,right] of [[a,b],[b,a],[a.toReversed(),b.toReversed()]]) {
    const expected=base.normalizeBoundary(left.flatMap(x=>right.map(y=>x&y)),true);
    let charged=0;
    assert.deepEqual(stream.intersectLowerBoundaries(left,right,null,()=>charged++),expected);
    assert.equal(charged,left.length*right.length);
  }
});
