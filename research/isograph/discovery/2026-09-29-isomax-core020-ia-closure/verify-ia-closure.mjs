import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const here=path.dirname(new URL(import.meta.url).pathname);
const readJson=name=>JSON.parse(fs.readFileSync(path.join(here,name),'utf8'));
const read=name=>fs.readFileSync(path.join(here,name),'utf8');

const a0=readJson('A0_EXPLICIT_ASSERTIONS_0_1.json');
const admission=readJson('STRICT_IA_ADMISSION_0_3.json');
const strictRounds=[
  readJson('STRICT_ROUND_01_0_2.json'),
  readJson('STRICT_ROUND_02_0_2.json'),
  readJson('STRICT_ROUND_04_0_3.json'),
];
const fixed=readJson('STRICT_ROUND_05_FIXED_POINT_0_3.json');
const strictQu=readJson('STRICT_QU_DISPOSITION_0_1.json');
const native=read('ISOMAX_STRUCTURAL_CONTROL_CORE020_0_2.isg');
const nativeIa=read('STRICT_IA_CORE020_0_3.isg');

assert.equal(a0.assertions.length,31);
assert.equal(a0.assertions.filter(x=>x.ia_eligible).length,21);
assert.equal(a0.strict_native_kernel,'ISOMAX_STRUCTURAL_CONTROL_CORE020_0_2.isg');

for(const a of a0.assertions.filter(x=>x.ia_eligible)){
  assert.equal(a.primitive_status,'CLOSED_TO_STRICT_KERNEL');
  for(const support of a.primitive_support??[])
    assert.doesNotMatch(String(support),/SOURCE_MANIFEST|QU-|DERIVED_VIEW|\.md|\.json/i);
}
for(const id of ['SC-E022','SC-E023']){
  const a=a0.assertions.find(x=>x.id===id);
  assert.equal(a.ia_eligible,false);
  assert.equal(a.primitive_status,'PROVENANCE_SCOPE_ONLY__NOT_EXACT_IA_PREMISE');
}
for(const id of ['SC-E024','SC-E025','SC-E026','SC-E027','SC-E028','SC-E029','SC-E030','SC-E031']){
  const a=a0.assertions.find(x=>x.id===id);
  assert.equal(a.ia_eligible,false);
  assert.equal(a.primitive_status,'DERIVED_SOURCE_OBSERVATION__NOT_CORE020_LEAF');
}

// Native syntax.
function balanced(text,label){
  let par=0,br=0,minPar=0,minBr=0;
  for(const ch of text){
    if(ch==='(')par++;
    else if(ch===')')par--;
    else if(ch==='[')br++;
    else if(ch===']')br--;
    minPar=Math.min(minPar,par);
    minBr=Math.min(minBr,br);
  }
  assert.equal(par,0,label+' parentheses');
  assert.equal(br,0,label+' brackets');
  assert.equal(minPar,0,label+' negative parentheses');
  assert.equal(minBr,0,label+' negative brackets');
  return {parentheses:par,brackets:br};
}
const nativeBalance=balanced(native,'kernel');
const nativeIaBalance=balanced(nativeIa,'strict IA');

assert.doesNotMatch(native,/\b740[012]\b/);
assert.doesNotMatch(native,/196120/);

// Finite carrier closure, using the same direct carrier-predicate convention as
// IsoGraph primitive data constructors.
const carrierMembers=new Map();
for(const line of native.split(/\r?\n/)){
  const m=line.match(/^\s*\(\^150010 (196\d{3}) (19\d+)\)\s*$/);
  if(!m)continue;
  let set=carrierMembers.get(m[1]);
  if(!set){set=new Set();carrierMembers.set(m[1],set);}
  set.add(m[2]);
}
const expectedCarrierCounts={
  '196000':10,'196001':10,'196002':4,'196003':5,
  '196004':2,'196005':1,'196006':2,'196007':3,
  '196008':2,'196009':2,'196010':2,'196011':10,
};
for(const [carrier,count] of Object.entries(expectedCarrierCounts))
  assert.equal(carrierMembers.get(carrier)?.size,count,`carrier closure mismatch ${carrier}`);

function tuples(text,rel){
  const out=[];
  const re=new RegExp('^\\s*\\(\\^150024 '+rel+'((?: \\d+)+)\\)\\s*$');
  for(const line of text.split(/\r?\n/)){
    const m=line.match(re);
    if(m)out.push(m[1].trim().split(/\s+/).map(Number));
  }
  return out;
}
const bit0=196900,bit1=196901;
const bit=v=>v===bit0?0:v===bit1?1:assert.fail(`not local bit token ${v}`);
const xor=(a,b)=>a^b;

const slotTokens=[197300,197301,197302,197303,197304];
const slotIndex=new Map(slotTokens.map((x,i)=>[x,i]));
const maps=new Map();
for(const [t,src,dst] of tuples(native,'196113')){
  if(t===197502)continue;
  let m=maps.get(t); if(!m){m=new Map();maps.set(t,m);} m.set(src,dst);
}
for(const t of [197500,197501]){
  const m=maps.get(t);
  assert.equal(m?.size,5);
  assert.deepEqual([...m.keys()].sort((a,b)=>a-b),[...slotTokens]);
  assert.deepEqual([...new Set(m.values())].sort((a,b)=>a-b),[...slotTokens]);
}
const asArray=t=>slotTokens.map(src=>slotIndex.get(maps.get(t).get(src)));
const mapA=asArray(197500),mapB=asArray(197501);
assert.deepEqual(mapA,[0,1,3,2,4]);
assert.deepEqual(mapB,[1,0,2,3,4]);
const invCount=p=>{
  let n=0;
  for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)if(p[i]>p[j])n++;
  return n;
};
assert.equal(invCount(mapA),1);
assert.equal(invCount(mapB),1);
const relative=mapA.map(x=>mapB[x]);
assert.deepEqual(relative,[1,0,3,2,4]);
assert.equal(invCount(relative),2);
assert.deepEqual(relative.map(x=>relative[x]),[0,1,2,3,4]);

assert.deepEqual(tuples(native,'196106'),[
  [197200,197500,197510,197402],
  [197201,197501,197511,197403],
]);
assert.deepEqual(tuples(native,'196118'),[
  [197510,197301,197302],
  [197511,197300,197302],
]);

const edgeRows=new Map(tuples(native,'196101').map(([e,u,v,d,a])=>[e,{u,v,d:bit(d),a}]));
const path2=new Map(tuples(native,'196102').map(([p,e1,e2])=>[p,[e1,e2]]));
const pathPhase=p=>path2.get(p).reduce((acc,e)=>xor(acc,edgeRows.get(e).d),0);
assert.equal(pathPhase(197200),0);
assert.equal(pathPhase(197201),1);

function assignments(n,pred){
  const out=[];
  for(let mask=0;mask<(1<<n);mask++){
    const v=Array.from({length:n},(_,i)=>(mask>>i)&1);
    if(pred(v))out.push(v);
  }
  return out;
}
const coarse=assignments(4,([a,b,c,d])=>
  xor(a,b)===0&&xor(b,d)===0&&xor(a,c)===0&&xor(c,d)===1);
assert.equal(coarse.length,0);
const refined=assignments(5,([a,b,c,d0,d1])=>
  xor(a,b)===0&&xor(b,d0)===0&&xor(a,c)===0&&xor(c,d1)===1);
assert.deepEqual(refined.map(x=>x.join('')).sort(),['00001','11110']);
const flat4=assignments(6,([s,a,b,t,c,d])=>
  xor(s,a)===0&&xor(a,b)===0&&xor(b,t)===0&&
  xor(s,c)===0&&xor(c,d)===0&&xor(d,t)===0);
assert.deepEqual(flat4.map(x=>x.join('')).sort(),['000000','111111']);

for(const q of [199000,199001,199002,199003,199004,199005])
  assert.match(native,new RegExp('\\(\\^150021 '+q+'\\)'));

// Strict IA body admission.
assert.equal(admission.strict_native_file,'STRICT_IA_CORE020_0_3.isg');
assert.equal(admission.strict_admitted_ia_count,14);
assert.equal(admission.predecessor_exact_ia_count_superseded,60);
assert.equal(admission.predecessor_dispositions.length,60);
assert.equal(new Set(admission.predecessor_dispositions.map(x=>x.id)).size,60);
const predecessorExpected=Array.from({length:60},(_,i)=>`SC-IA${String(i+1).padStart(3,'0')}`);
assert.deepEqual(admission.predecessor_dispositions.map(x=>x.id).sort(),predecessorExpected.sort());
const dispCounts=admission.predecessor_dispositions.reduce((m,x)=>{
  m[x.disposition]=(m[x.disposition]??0)+1;return m;
},{});
assert.equal(dispCounts.SUPERSEDED_BY_STRICT_NATIVE_ASSERTION,21);
assert.equal(dispCounts.DERIVED_VIEW_NOT_PRIMITIVE_ASSERTION,39);

const nativeRoots=new Set([...nativeIa.matchAll(/\(\^150019 (210\d+)/g)].map(m=>m[1]));
assert.equal(nativeRoots.size,14);
for(const a of admission.admitted){
  assert.ok(nativeRoots.has(a.native_id),`missing native IA body ${a.native_id}`);
}
assert.equal(new Set(admission.admitted.map(x=>x.id)).size,14);

// Strict IA round lineage.
const eligibleExplicit=new Set(a0.assertions.filter(x=>x.ia_eligible).map(x=>x.id));
const admittedById=new Map(admission.admitted.map(x=>[x.id,x]));
const known=new Set(eligibleExplicit);
const seenStrict=new Set();
for(const round of strictRounds){
  for(const ia of round.new_assertions??[]){
    assert.ok(admittedById.has(ia.id),`strict round IA not admitted: ${ia.id}`);
    assert.equal(ia.native_id,admittedById.get(ia.id).native_id);
    assert.equal(ia.support_mode,'EXACT');
    assert.ok(!seenStrict.has(ia.id),`duplicate strict IA ${ia.id}`);
    for(const p of ia.premises??[])
      assert.ok(known.has(p),`strict IA ${ia.id} unresolved/non-primitive premise ${p}`);
    seenStrict.add(ia.id);
    known.add(ia.id);
  }
}
assert.equal(seenStrict.size,14);
for(const a of admission.admitted)assert.ok(seenStrict.has(a.id));

assert.equal(fixed.status,'STRICT_PRIMITIVE_BODY_FIXED_POINT');
assert.equal(fixed.round,5);
assert.equal(fixed.admitted_native_ias,14);
assert.equal(fixed.new_assertions,0);
assert.equal(fixed.support_refinements,0);
assert.equal(fixed.qu_refinements,0);

assert.equal(strictQu.strict_refinements_admitted,0);
assert.equal(strictQu.predecessor_qu_refinements_demoted,12);
assert.equal(strictQu.native_qu.length,6);
for(const q of strictQu.native_qu)assert.equal(q.status,'QU_UNEXPANDED');

for(const file of [
  'STRICT_PRIMITIVE_REAUDIT_0_1.md',
  'PRIMITIVE_RENDERING_AUDIT_0_2.md',
  'PRIMITIVE_CLOSURE_LEDGER_0_2.json',
  'STRICT_IA_ADMISSION_0_3.json',
  'STRICT_QU_DISPOSITION_0_1.json',
  'STRICT_ROUND_05_FIXED_POINT_0_3.json'
]) assert.ok(fs.existsSync(path.join(here,file)),`missing strict artifact ${file}`);

console.log(JSON.stringify({
  status:'PASS',
  strictPrimitiveKernel:'ISOMAX_STRUCTURAL_CONTROL_CORE020_0_2.isg',
  strictIaKernel:'STRICT_IA_CORE020_0_3.isg',
  explicitAssertions:31,
  iaEligibleExplicitAssertions:21,
  strictAdmittedNativeIAs:14,
  predecessorIaViewsSuperseded:60,
  predecessorViewsWithNativeReplacement:21,
  predecessorDerivedViewsOnly:39,
  strictSupportRefinements:0,
  strictQuRefinements:0,
  generalizedQuUnexpanded:6,
  strictFixedPointRound:5,
  carrierCounts:expectedCarrierCounts,
  transporterA:mapA,
  transporterB:mapB,
  transporterAInversions:invCount(mapA),
  transporterBInversions:invCount(mapB),
  relativeTransporter:relative,
  relativeTransporterInversions:invCount(relative),
  routeAPhase:pathPhase(197200),
  routeBPhase:pathPhase(197201),
  coarse5x4Solutions:coarse.length,
  refined5x4Solutions:refined.length,
  flat4x4Solutions:flat4.length,
  nativeDelimiterBalance:nativeBalance,
  strictIaDelimiterBalance:nativeIaBalance,
  forbiddenSupport:{DP:false,NEI:false,DTS:false,WDLBridge:false},
},null,2));
