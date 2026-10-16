#!/usr/bin/env node
import assert from 'node:assert/strict';

const W=7,H=6,K=4;
function cellBit(c,r){return 1n<<BigInt(r*W+c);}
function pc(x){let n=0;while(x){x&=x-1n;n++;}return n;}
function cmpBig(a,b){return a<b?-1:a>b?1:0;}
function lines(){
  const out=[];
  for(let r=0;r<H;r++)for(let c=0;c<=W-K;c++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c+i,r);out.push(m);}
  for(let c=0;c<W;c++)for(let r=0;r<=H-K;r++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c,r+i);out.push(m);}
  for(let c=0;c<=W-K;c++)for(let r=0;r<=H-K;r++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c+i,r+i);out.push(m);}
  for(let c=0;c<=W-K;c++)for(let r=K-1;r<H;r++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c+i,r-i);out.push(m);}
  return out;
}
const LINES=lines();

function supportMask(h){let s=0n;for(let c=0;c<W;c++)for(let r=0;r<h[c];r++)s|=cellBit(c,r);return s;}
function residualShapes(h){
  const S=supportMask(h),set=new Map();
  for(const l of LINES){const r=l&~S;if(r!==0n)set.set(r.toString(),r);}
  return [...set.values()].sort((a,b)=>pc(a)-pc(b)||cmpBig(a,b));
}
function* perms(a,at=0){
  if(at===a.length){yield a.slice();return;}
  for(let i=at;i<a.length;i++){[a[at],a[i]]=[a[i],a[at]];yield* perms(a,at+1);[a[at],a[i]]=[a[i],a[at]];}
}
function productPermutations(groups,at=0,current=[]){
  if(at===groups.length)return [current.slice()];
  const out=[];
  for(const p of perms(groups[at]))out.push(...productPermutations(groups,at+1,[...current,p]));
  return out;
}
function capacities(h){return h.map(x=>H-x);}
function canonicalizeFiber(h){
  const caps=capacities(h);
  const active=[];
  for(let c=0;c<W;c++)if(caps[c]>0)active.push(c);
  const byLength=new Map();
  for(const c of active){const l=caps[c];if(!byLength.has(l))byLength.set(l,[]);byLength.get(l).push(c);}
  const lengths=[...byLength.keys()].sort((a,b)=>b-a);
  const groups=lengths.map(l=>byLength.get(l));
  let bestKey=null,bestCellMap=null,bestShapeKeys=null,permutationCount=0;
  for(const groupPerms of productPermutations(groups)){
    permutationCount++;
    const cellMap=new Map();
    let nextCell=0;
    for(let gi=0;gi<lengths.length;gi++){
      const l=lengths[gi],order=groupPerms[gi];
      for(const c of order){
        for(let d=0;d<l;d++)cellMap.set(c*H+(h[c]+d),nextCell++);
      }
    }
    const shapeKeys=[];
    for(const shape of residualShapes(h)){
      const ids=[];
      for(let c=0;c<W;c++)for(let r=h[c];r<H;r++){
        const physical=c*H+r;
        if(shape&(1n<<BigInt(r*W+c)))ids.push(cellMap.get(physical));
      }
      ids.sort((a,b)=>a-b);
      shapeKeys.push(ids.join('.'));
    }
    shapeKeys.sort();
    const key=JSON.stringify([lengths.flatMap((l,i)=>Array(groups[i].length).fill(l)),shapeKeys]);
    if(bestKey===null||key<bestKey){bestKey=key;bestCellMap=cellMap;bestShapeKeys=shapeKeys;}
  }
  return {key:bestKey,cellMap:bestCellMap,shapeKeys:bestShapeKeys,permutationCount};
}
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
for(let rank=30;rank<=35;rank++){
  const supports=enumerateSupportsAtRank(rank);
  const reflection=new Set(),fibers=new Map();
  for(const h of supports){
    reflection.add(mirrorKey(h));
    const c=canonicalizeFiber(h);totalPermutations+=c.permutationCount;
    let n=fibers.get(c.key)??0;n++;fibers.set(c.key,n);if(n>maxClass)maxClass=n;
  }
  const row={supports:supports.length,reflection:reflection.size,fibers:fibers.size,maxClass:[...fibers.values()].reduce((a,b)=>Math.max(a,b),0)};
  byRank[rank]=row;
  assert.deepEqual({supports:row.supports,reflection:row.reflection,fibers:row.fibers},expected[rank]);
  supportsTotal+=row.supports;reflectionTotal+=row.reflection;fibersTotal+=row.fibers;
}
assert.equal(supportsTotal,43128);
assert.equal(reflectionTotal,21692);
assert.equal(fibersTotal,20685);
assert.equal(maxClass,12);
console.log(JSON.stringify({
  schema:'standard7x6-g2-fiber-canonicalizer-reconstruction-v0_1',
  byRank,
  totals:{supports:supportsTotal,reflectionClasses:reflectionTotal,exactFiberClasses:fibersTotal,maxClass,totalPermutations},
  expectedHistoricalG2Matched:true
},null,2));
