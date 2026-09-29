import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const read = name => fs.readFileSync(path.join(here, name), 'utf8');
const json = name => JSON.parse(read(name));

const a0 = json('A0_EXPLICIT_ASSERTIONS_0_1.json');
const admission = json('STRICT_IA_ADMISSION_0_3.json');
const r1 = json('STRICT_ROUND_01_0_2.json');
const r2 = json('STRICT_ROUND_02_0_2.json');
const r4 = json('STRICT_ROUND_04_0_3.json');
const r5 = json('STRICT_ROUND_05_FIXED_POINT_0_3.json');
const qu = json('QU_LEDGER_STRICT_0_4.json');
const source = json('SOURCE_MANIFEST_STRICT_0_2.json');
const ledger = json('PRIMITIVE_CLOSURE_LEDGER_STRICT_0_4.json');
const kernel = read('ISOMAX_STRUCTURAL_CONTROL_CORE020_0_2.isg');
const iaNative = read('STRICT_IA_CORE020_0_3.isg');

function delimiterAudit(text) {
  let par = 0, br = 0, minPar = 0, minBr = 0;
  for (const ch of text) {
    if (ch === '(') par++;
    else if (ch === ')') par--;
    else if (ch === '[') br++;
    else if (ch === ']') br--;
    minPar = Math.min(minPar, par);
    minBr = Math.min(minBr, br);
  }
  return {par, br, minPar, minBr};
}

for (const [name,text] of [['kernel',kernel],['iaNative',iaNative]]) {
  const d = delimiterAudit(text);
  assert.deepEqual(d,{par:0,br:0,minPar:0,minBr:0},name + ' delimiter balance');
}

assert.equal(/\b740[012]\b/.test(kernel),false,'external Boolean IDs must not remain');
assert.equal(source.core020_sha256,'9a619b552a6ef7719e5b4b5f3a9df4a732ff4377b9bc7b86c385ed5c992b88e7');
assert.equal(source.qu01_sha256,'1f1510b41e4351726e4d9e714eb32ece0d5e69f0964255aabd7b4a6e94eee4cc');
assert.equal(source.dp_used,false);
assert.equal(source.nei_used,false);
assert.equal(source.dts_used,false);
assert.equal(source.experimental_inquiry_used,false);

assert.equal(a0.assertions.length,31);
assert.equal(a0.assertions.filter(x=>x.ia_eligible).length,21);
for (const a of a0.assertions.filter(x=>x.ia_eligible))
  assert.equal(a.primitive_status,'CLOSED_TO_STRICT_KERNEL','A0 strict status ' + a.id);
for (const id of ['SC-E022','SC-E023','SC-E024','SC-E025','SC-E026','SC-E027','SC-E028','SC-E029','SC-E030','SC-E031'])
  assert.equal(a0.assertions.find(x=>x.id===id).ia_eligible,false,'must remain non-IA premise ' + id);

assert.equal(admission.predecessor_exact_ia_count_superseded,60);
assert.equal(admission.strict_admitted_ia_count,14);
assert.equal(admission.admitted.length,14);
assert.equal(admission.strict_native_file,'STRICT_IA_CORE020_0_3.isg');

assert.equal(r1.new_assertions.length,7);
assert.equal(r2.new_assertions.length,1);
assert.equal(r4.new_assertions.length,6);
assert.equal(r5.admitted_native_ias,14);
assert.equal(r5.new_assertions,0);
assert.equal(r5.support_refinements,0);
assert.equal(r5.qu_refinements,0);

const known = new Set(a0.assertions.filter(x=>x.ia_eligible).map(x=>x.id));
for (const round of [r1,r2,r4]) {
  for (const ia of round.new_assertions) {
    for (const p of ia.premises) assert.ok(known.has(p),'unresolved strict premise ' + p + ' for ' + ia.id);
    known.add(ia.id);
  }
}
assert.equal(known.size,35);

for (let id=210001; id<=210014; id++)
  assert.ok(iaNative.includes('(^150019 ' + id),'missing native IA root ' + id);

for (const relation of ['196104','196105','196113','196116','196117','196119'])
  assert.ok(kernel.includes(relation),'missing strict relation ' + relation);

for (const qid of ['199000','199001','199002','199003','199004','199005'])
  assert.ok(kernel.includes('(^150021 ' + qid + ')'),'missing QU_UNEXPANDED token ' + qid);

const requiredKernelSnippets = [
  '(^150010 196010 196900)',
  '(^150010 196010 196901)',
  '(^150024 196100 196900 196900 196900)',
  '(^150024 196100 196900 196901 196901)',
  '(^150024 196100 196901 196900 196901)',
  '(^150024 196100 196901 196901 196900)',
  '(^150024 196113 197500 197300 197300)',
  '(^150024 196113 197500 197302 197303)',
  '(^150024 196113 197501 197300 197301)',
  '(^150010 196113 197502 ?x ?y)',
  '(^150010 196113 197500 ?x ?z)',
  '(^150010 196113 197501 ?z ?y)',
  '(^150024 196118 197510 197301 197302)',
  '(^150024 196118 197511 197300 197302)',
  '(^150024 196108 197402 197800 197700 196900)',
  '(^150024 196108 197403 197800 197700 196901)'
];
for (const snippet of requiredKernelSnippets)
  assert.ok(kernel.includes(snippet),'missing strict native structure ' + snippet);

const xor = (a,b) => a ^ b;
const assignments = (n,pred) => {
  const out=[];
  for(let mask=0; mask<(1<<n); mask++) {
    const v=Array.from({length:n},(_,i)=>(mask>>i)&1);
    if(pred(v)) out.push(v);
  }
  return out;
};

const coarse = assignments(4,([a,b,c,d]) =>
  xor(a,b)===0 && xor(b,d)===0 && xor(a,c)===0 && xor(c,d)===1);
assert.equal(coarse.length,0);

const refined = assignments(5,([a,b,c,d0,d1]) =>
  xor(a,b)===0 && xor(b,d0)===0 && xor(a,c)===0 && xor(c,d1)===1);
assert.deepEqual(refined.map(x=>x.join('')).sort(),['00001','11110']);

const flat4 = assignments(6,([s,a,b,t,c,d]) =>
  xor(s,a)===0 && xor(a,b)===0 && xor(b,t)===0 &&
  xor(s,c)===0 && xor(c,d)===0 && xor(d,t)===0);
assert.deepEqual(flat4.map(x=>x.join('')).sort(),['000000','111111']);

for (const [a,b,c,d0,d1] of refined) {
  assert.equal(xor(d0,a),0);
  assert.equal(xor(d1,a),1);
}
for (const x of [0,1]) for (const y of [0,1]) {
  const xc=x^1, yc=y^1;
  assert.equal(xor(x,y),xor(xc,yc));
}

const mapA=[0,1,3,2,4];
const mapB=[1,0,2,3,4];
const compose=(left,right)=>left.map(x=>right[x]);
const relative=compose(mapA,mapB);
function inversionParity(map) {
  let p=0;
  for(let i=0;i<map.length;i++) for(let j=i+1;j<map.length;j++)
    if(map[i]>map[j]) p^=1;
  return p;
}
function applyTwice(map) {
  return map.map(x=>map[x]);
}
assert.deepEqual(applyTwice(mapA),[0,1,2,3,4]);
assert.deepEqual(applyTwice(mapB),[0,1,2,3,4]);
assert.equal(inversionParity(mapA),1);
assert.equal(inversionParity(mapB),1);
assert.deepEqual(relative,[1,0,3,2,4]);
assert.deepEqual(applyTwice(relative),[0,1,2,3,4]);
assert.equal(inversionParity(relative),0);

const seqA=[1,2], seqB=[0,2];
assert.equal(seqA[1],seqB[1]);
assert.notEqual(seqA[0],seqB[0]);

const routePhaseA=xor(0,0);
const routePhaseB=xor(0,1);
assert.equal(routePhaseA,0);
assert.equal(routePhaseB,1);
assert.equal(xor(routePhaseA,routePhaseB),1);

const flatRouteA=xor(xor(0,0),0);
const flatRouteB=xor(xor(0,0),0);
assert.equal(xor(flatRouteA,flatRouteB),0);

const tiePairs=[];
for(const x of [0,1]) for(const y of [0,1]) if(xor(x,y)===0) tiePairs.push([x,y]);
assert.deepEqual(tiePairs,[[0,0],[1,1]]);

assert.equal(qu.entries.length,6);
assert.equal(qu.no_probability_added,true);
assert.equal(qu.no_preferred_open_realization_selected,true);
assert.equal(qu.exact_refinements_from_strict_rounds,0);

assert.equal(ledger.strict_ia_bodies.length,14);
assert.equal(ledger.predecessor_views.predecessor_high_level_ias,60);
assert.equal(ledger.predecessor_views.disposition,'NOT_PRIMITIVE_AUTHORITY');
assert.equal(ledger.fixed_point.admitted_native_ias,14);
assert.equal(ledger.fixed_point.new_assertions,0);

console.log(JSON.stringify({
  status:'PASS',
  strictA0Eligible:21,
  predecessorHighLevelIAsSuperseded:60,
  strictNativeIAs:14,
  strictProductiveRounds:[7,1,6],
  strictFixedPointRound:5,
  coarse5x4Solutions:coarse.length,
  targetSplit5x4Solutions:refined.map(x=>x.join('')).sort(),
  flat4x4Solutions:flat4.map(x=>x.join('')).sort(),
  transporterSigns:[inversionParity(mapA),inversionParity(mapB)],
  relativeTransporter:relative,
  relativeTransporterSign:inversionParity(relative),
  routePhaseXor5x4:xor(routePhaseA,routePhaseB),
  routePhaseXor4x4:xor(flatRouteA,flatRouteB),
  actionSequences:{routeA:seqA,routeB:seqB,sharedSecond:true,unequalFirst:true},
  quCount:qu.entries.length,
  forbiddenSupport:{DP:false,NEI:false,DTS:false,EI:false},
  primitiveClosure:'STRICT_NATIVE_BODY_AND_SUPPORT_V3'
},null,2));
