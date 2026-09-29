import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const here=path.dirname(new URL(import.meta.url).pathname);
const readJson=name=>JSON.parse(fs.readFileSync(path.join(here,name),'utf8'));

const a0=readJson('A0_EXPLICIT_ASSERTIONS_0_1.json');
const roundNames=[
  ...Array.from({length:10},(_,i)=>`ROUND_${String(i+1).padStart(2,'0')}_0_1.json`),
  'ROUND_12_0_2.json',
  'ROUND_13_0_2.json',
];
const rounds=roundNames.map(readJson);
const fixed=readJson('ROUND_14_STRICT_FIXED_POINT_0_2.json');
const finalQu=readJson('QU_LEDGER_FINAL_0_4.json');
const native=fs.readFileSync(path.join(here,'ISOMAX_STRUCTURAL_CONTROL_CORE020_0_2.isg'),'utf8');

assert.equal(a0.assertions.length,31);
assert.equal(a0.assertions.filter(x=>x.ia_eligible).length,21);
assert.equal(a0.strict_native_kernel,'ISOMAX_STRUCTURAL_CONTROL_CORE020_0_2.isg');

const explicitIds=new Set(a0.assertions.map(x=>x.id));
assert.equal(explicitIds.size,31);
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

const known=new Set(explicitIds);
const normalized=new Set();
let iaCount=0,supportRefinements=0,quRefinements=0;
const nonEligibleRoots=new Set(a0.assertions.filter(x=>!x.ia_eligible).map(x=>x.id));
const iaPremises=new Map();

for(const round of rounds){
  for(const ia of round.new_assertions??[]){
    assert.match(ia.id,/^SC-IA\d{3}$/);
    assert.equal(ia.support_mode,'EXACT');
    assert.ok(ia.normalized_body);
    assert.ok(!known.has(ia.id),`duplicate assertion id ${ia.id}`);
    assert.ok(!normalized.has(ia.normalized_body),`duplicate normalized body ${ia.normalized_body}`);
    assert.deepEqual(ia.qu_dependencies??[],[],`load-bearing QU dependency on ${ia.id}`);
    for(const p of ia.premises??[])
      assert.ok(known.has(p),`unresolved/forward premise ${p} for ${ia.id}`);
    iaPremises.set(ia.id,[...(ia.premises??[])]);
    known.add(ia.id);
    normalized.add(ia.normalized_body);
    iaCount++;
  }
  for(const sr of round.support_refinements??[]){
    assert.ok(explicitIds.has(sr.assertion),`support refinement target is not explicit: ${sr.assertion}`);
    for(const p of sr.premises??[])assert.ok(known.has(p),`unresolved support premise ${p}`);
    supportRefinements++;
  }
  for(const qr of round.qu_refinements??[]){
    assert.equal(qr.rule,'U');
    assert.equal(qr.probability_added,false);
    for(const p of qr.premises??[])assert.ok(known.has(p),`unresolved QU premise ${p}`);
    quRefinements++;
  }
}
assert.equal(iaCount,60);
assert.equal(supportRefinements,3);
assert.equal(quRefinements,12);

function explicitRoots(id,seen=new Set()){
  if(seen.has(id))return new Set();
  seen.add(id);
  if(explicitIds.has(id))return new Set([id]);
  const ps=iaPremises.get(id)??[];
  const out=new Set();
  for(const p of ps)for(const r of explicitRoots(p,seen))out.add(r);
  return out;
}
for(const id of iaPremises.keys()){
  const roots=explicitRoots(id);
  for(const root of roots)
    assert.ok(!nonEligibleRoots.has(root),`${id} depends on non-eligible explicit root ${root}`);
}

assert.equal(fixed.status,'STRICT_OPERATIONAL_FIXED_POINT');
assert.equal(fixed.round,14);
assert.equal(fixed.input.explicit_assertions,31);
assert.equal(fixed.input.ia_eligible_explicit_assertions,21);
assert.equal(fixed.input.prior_admitted_implicit_assertions,60);
assert.equal(fixed.input.prior_support_refinements,3);
assert.equal(fixed.input.prior_qu_refinements,12);
assert.equal(fixed.new_assertions,0);
assert.equal(fixed.support_refinements,0);
assert.equal(fixed.qu_refinements,0);
for(const v of Object.values(fixed.primitive_firewall))assert.equal(v,false);
for(const v of Object.values(fixed.forbidden_support_audit))assert.equal(v,false);

assert.equal(finalQu.status,'STRICT_PRIMITIVE_FIXED_POINT_QU_STATE');
assert.equal(finalQu.fixed_point_round,14);
assert.equal(finalQu.no_probability_added,true);
assert.equal(finalQu.no_preferred_open_realization_selected,true);
assert.equal(finalQu.entries.length,6);

// Native syntax and forbidden predecessor helpers.
let par=0,br=0,minPar=0,minBr=0;
for(const ch of native){
  if(ch==='(')par++;
  else if(ch===')')par--;
  else if(ch==='[')br++;
  else if(ch===']')br--;
  minPar=Math.min(minPar,par);
  minBr=Math.min(minBr,br);
}
assert.equal(par,0);
assert.equal(br,0);
assert.equal(minPar,0);
assert.equal(minBr,0);
assert.doesNotMatch(native,/\b740[012]\b/);
assert.doesNotMatch(native,/196120/);

// Every quantified finite domain has an explicit native carrier extension.
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

// Primitive raw tuple parser.
function tuples(rel){
  const out=[];
  const re=new RegExp('^\\s*\\(\\^150024 '+rel+'((?: \\d+)+)\\)\\s*$');
  for(const line of native.split(/\r?\n/)){
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
for(const [t,src,dst] of tuples('196113')){
  if(t===197502)continue; // definitionally composed, not raw.
  let m=maps.get(t); if(!m){m=new Map();maps.set(t,m);} m.set(src,dst);
}
for(const t of [197500,197501]){
  const m=maps.get(t);
  assert.equal(m?.size,5);
  assert.deepEqual([...m.keys()].sort((a,b)=>a-b),[...slotTokens]);
  assert.deepEqual([...new Set(m.values())].sort((a,b)=>a-b),[...slotTokens]);
}
const asArray=t=>slotTokens.map(src=>slotIndex.get(maps.get(t).get(src)));
assert.deepEqual(asArray(197500),[0,1,3,2,4]);
assert.deepEqual(asArray(197501),[1,0,2,3,4]);
const invCount=p=>{
  let n=0;
  for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)if(p[i]>p[j])n++;
  return n;
};
assert.equal(invCount(asArray(197500)),1);
assert.equal(invCount(asArray(197501)),1);
const relative=asArray(197500).map(x=>asArray(197501)[x]);
assert.deepEqual(relative,[1,0,3,2,4]);
assert.equal(invCount(relative),2);

// Raw route observation no longer contains reducible phase/sign fields.
const routeObs=tuples('196106');
assert.deepEqual(routeObs,[
  [197200,197500,197510,197402],
  [197201,197501,197511,197403],
]);

// Ordered action-sequence content is extensional.
assert.deepEqual(tuples('196118'),[
  [197510,197301,197302],
  [197511,197300,197302],
]);

// Recompute route phase from edge deltas only.
const edgeRows=new Map(tuples('196101').map(([e,u,v,d,a])=>[e,{u,v,d:bit(d),a}]));
const path2=new Map(tuples('196102').map(([p,e1,e2])=>[p,[e1,e2]]));
const pathPhase=p=>path2.get(p).reduce((acc,e)=>xor(acc,edgeRows.get(e).d),0);
assert.equal(pathPhase(197200),0);
assert.equal(pathPhase(197201),1);

// Boolean systems used by the IA closure.
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

// Native QU boundaries are explicit, not hidden exact leaves.
for(const q of [199000,199001,199002,199003,199004,199005])
  assert.match(native,new RegExp('\\(\\^150021 '+q+'\\)'));

assert.ok(fs.existsSync(path.join(here,'PRIMITIVE_RENDERING_AUDIT_0_2.md')));
assert.ok(fs.existsSync(path.join(here,'PRIMITIVE_CLOSURE_LEDGER_0_2.json')));
assert.ok(fs.existsSync(path.join(here,'STRICT_PRIMITIVE_REAUDIT_0_1.md')));

console.log(JSON.stringify({
  status:'PASS',
  strictPrimitiveKernel:'ISOMAX_STRUCTURAL_CONTROL_CORE020_0_2.isg',
  explicitAssertions:31,
  iaEligibleExplicitAssertions:21,
  admittedImplicitAssertions:60,
  supportRefinements:3,
  quRefinements:12,
  strictFixedPointRound:14,
  externalBooleanIds:false,
  carrierCounts:expectedCarrierCounts,
  transporterA:asArray(197500),
  transporterB:asArray(197501),
  transporterAInversions:1,
  transporterBInversions:1,
  relativeTransporter:relative,
  relativeTransporterInversions:2,
  routeAPhase:pathPhase(197200),
  routeBPhase:pathPhase(197201),
  coarse5x4Solutions:coarse.length,
  refined5x4Solutions:refined.length,
  flat4x4Solutions:flat4.length,
  nativeDelimiterBalance:{parentheses:par,brackets:br},
  forbiddenSupport:{DP:false,NEI:false,DTS:false,WDLBridge:false},
},null,2));
