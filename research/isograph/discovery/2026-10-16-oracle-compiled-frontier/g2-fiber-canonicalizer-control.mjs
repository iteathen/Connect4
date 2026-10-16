#!/usr/bin/env node
import assert from 'node:assert/strict';
import { canonicalizeG2Fiber } from '../2026-09-18-policy-frontier/rba-g2-fiber-equivalence.mjs';

const W=7,H=6;
function enumerateSupportsAtRank(rank){
  const out=[],h=Array(W).fill(0);
  function rec(c,left){
    if(c===W){if(left===0)out.push(h.slice());return;}
    const max=Math.min(H,left);
    for(let v=0;v<=max;v++){h[c]=v;rec(c+1,left-v);}
  }
  rec(0,rank);
  return out;
}
function mirrorKey(h){const a=h.join(','),b=h.slice().reverse().join(',');return a<b?a:b;}
const expected={
  30:{supports:15330,reflection:7702,fibers:7593},
  31:{supports:10906,reflection:5476,fibers:5335},
  32:{supports:7420,reflection:3736,fibers:3563},
  33:{supports:4809,reflection:2420,fibers:2223},
  34:{supports:2954,reflection:1494,fibers:1294},
  35:{supports:1709,reflection:864,fibers:677},
};
const byRank={};
let supportsTotal=0,reflectionTotal=0,fibersTotal=0,maxClass=0,totalPermutations=0;
for(let rank=30;rank<=42;rank++){
  const supports=enumerateSupportsAtRank(rank),reflection=new Set(),fibers=new Map();
  for(const h of supports){
    reflection.add(mirrorKey(h));
    const c=canonicalizeG2Fiber(h);totalPermutations+=c.permutationCount;
    const n=(fibers.get(c.key)??0)+1;fibers.set(c.key,n);maxClass=Math.max(maxClass,n);
  }
  const row={supports:supports.length,reflection:reflection.size,fibers:fibers.size,maxClass:[...fibers.values()].reduce((a,b)=>Math.max(a,b),0),supportOverFiber:+(supports.length/fibers.size).toFixed(4),reflectionOverFiber:+(reflection.size/fibers.size).toFixed(4)};
  byRank[rank]=row;
  if(expected[rank])assert.deepEqual({supports:row.supports,reflection:row.reflection,fibers:row.fibers},expected[rank]);
  supportsTotal+=row.supports;reflectionTotal+=row.reflection;fibersTotal+=row.fibers;
}
assert.equal(byRank[30].fibers,7593);
assert.equal(byRank[35].fibers,677);
console.log(JSON.stringify({
  schema:'standard7x6-g2-fiber-census-v0_2',
  byRank,
  totals:{supports:supportsTotal,reflectionClasses:reflectionTotal,exactFiberClasses:fibersTotal,maxClass,totalPermutations,supportOverFiber:+(supportsTotal/fibersTotal).toFixed(4),reflectionOverFiber:+(reflectionTotal/fibersTotal).toFixed(4)},
  historicalRanks30to35Matched:true
},null,2));
