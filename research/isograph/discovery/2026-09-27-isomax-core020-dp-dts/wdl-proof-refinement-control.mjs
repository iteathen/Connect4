#!/usr/bin/env node
import assert from 'node:assert/strict';

const LOSS=0b100,DRAW=0b010,WIN=0b001;
const states=[
  {name:'UNKNOWN',lo:-1,hi:1,mask:LOSS|DRAW|WIN},
  {name:'LOWER0',lo:0,hi:1,mask:DRAW|WIN},
  {name:'UPPER0',lo:-1,hi:0,mask:LOSS|DRAW},
  {name:'EXACT_LOSS',lo:-1,hi:-1,mask:LOSS},
  {name:'EXACT_DRAW',lo:0,hi:0,mask:DRAW},
  {name:'EXACT_WIN',lo:1,hi:1,mask:WIN},
];
const byInterval=new Map(states.map(s=>[`${s.lo}:${s.hi}`,s]));
const byMask=new Map(states.map(s=>[s.mask,s]));
assert.equal(byInterval.size,6);
assert.equal(byMask.size,6);

function intervalMask(lo,hi){
  let mask=0;
  if(lo<=-1&&-1<=hi)mask|=LOSS;
  if(lo<=0&&0<=hi)mask|=DRAW;
  if(lo<=1&&1<=hi)mask|=WIN;
  return mask;
}
for(const s of states)assert.equal(intervalMask(s.lo,s.hi),s.mask,s.name);

let stutter=0,strict=0,contradiction=0;
const transitions=[];
for(const a of states)for(const b of states){
  const lo=Math.max(a.lo,b.lo),hi=Math.min(a.hi,b.hi),mask=a.mask&b.mask;
  if(lo>hi){
    assert.equal(mask,0,`${a.name} & ${b.name}`);
    contradiction++;
    transitions.push({from:a.name,evidence:b.name,to:'CONTRADICTION',kind:'CONTRADICTION'});
    continue;
  }
  const expected=byInterval.get(`${lo}:${hi}`);
  assert.ok(expected,`missing interval state ${lo}:${hi}`);
  assert.equal(mask,expected.mask,`${a.name} & ${b.name}`);
  assert.equal(byMask.get(mask).name,expected.name);
  const kind=mask===a.mask?'STUTTER':'STRICT_REFINEMENT';
  kind==='STUTTER'?stutter++:strict++;
  transitions.push({from:a.name,evidence:b.name,to:expected.name,kind});
}
assert.deepEqual({stutter,strict,contradiction},{stutter:15,strict:11,contradiction:10});

for(const a of states){
  assert.equal(a.mask&a.mask,a.mask,'idempotence '+a.name);
  for(const b of states){
    assert.equal(a.mask&b.mask,b.mask&a.mask,'commutativity');
    for(const c of states)
      assert.equal((a.mask&b.mask)&c.mask,a.mask&(b.mask&c.mask),'associativity');
  }
}

for(const s of states){
  const exact=s.lo===s.hi;
  assert.equal(exact,(s.mask&(s.mask-1))===0,`exact-test ${s.name}`);
}

const strictEdges=new Map(states.map(s=>[s.name,[]]));
for(const a of states)for(const b of states){
  const r=a.mask&b.mask;
  if(r&&r!==a.mask)strictEdges.get(a.name).push(byMask.get(r).name);
}
function maxStrictDepth(name,seen=new Set()){
  if(seen.has(name))throw new Error('strict-refinement cycle');
  const next=strictEdges.get(name);
  if(!next.length)return 0;
  const nextSeen=new Set(seen);nextSeen.add(name);
  return 1+Math.max(...next.map(n=>maxStrictDepth(n,nextSeen)));
}
assert.equal(maxStrictDepth('UNKNOWN'),2,'WDL proof refinement height');

const oppositeWeak=states.find(s=>s.name==='LOWER0').mask & states.find(s=>s.name==='UPPER0').mask;
assert.equal(oppositeWeak,DRAW);
assert.equal(byMask.get(oppositeWeak).name,'EXACT_DRAW');

console.log(JSON.stringify({
  status:'PASS',
  carrier:'six nonempty convex intervals of {-1,0,+1}',
  representation:{
    LOSS:'0b100',DRAW:'0b010',WIN:'0b001',
    UNKNOWN:'0b111',LOWER0:'0b011',UPPER0:'0b110',
    EXACT_LOSS:'0b100',EXACT_DRAW:'0b010',EXACT_WIN:'0b001'
  },
  refinement:'bitwise AND',
  exactTest:'mask is a power of two',
  contradiction:'mask === 0',
  orderedPairTransitions:{stutter,strict,contradiction,total:transitions.length},
  maximumStrictRefinementsFromUnknown:2,
  lower0AndUpper0:'EXACT_DRAW'
},null,2));
