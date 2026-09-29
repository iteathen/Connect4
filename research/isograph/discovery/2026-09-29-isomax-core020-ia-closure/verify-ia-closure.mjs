import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const here=path.dirname(new URL(import.meta.url).pathname);
const readJson=name=>JSON.parse(fs.readFileSync(path.join(here,name),'utf8'));

const a0=readJson('A0_EXPLICIT_ASSERTIONS_0_1.json');
const rounds=[];
for(let i=1;i<=10;i++)rounds.push(readJson(`ROUND_${String(i).padStart(2,'0')}_0_1.json`));
const fixed=readJson('ROUND_11_FIXED_POINT_0_1.json');

assert.equal(a0.assertions.length,31);
assert.equal(a0.assertions.filter(x=>x.ia_eligible).length,23);

const explicitIds=new Set(a0.assertions.map(x=>x.id));
assert.equal(explicitIds.size,a0.assertions.length);

const known=new Set(explicitIds);
const iaIds=new Set();
const normalized=new Set();
let iaCount=0,supportRefinements=0,quRefinements=0;

const allowedRules=new Set(['B','I','F','Q','C','R','U','S']);

for(const [idx,round] of rounds.entries()){
  assert.equal(round.round,idx+1);
  for(const ia of round.new_assertions??[]){
    assert.match(ia.id,/^SC-IA\d{3}$/);
    assert.ok(!known.has(ia.id),`duplicate assertion id ${ia.id}`);
    assert.ok(allowedRules.has(ia.rule),`forbidden/unrecognized rule ${ia.rule}`);
    assert.equal(ia.support_mode,'EXACT');
    assert.ok(ia.normalized_body);
    assert.ok(!normalized.has(ia.normalized_body),
      `duplicate normalized body ${ia.normalized_body}`);
    for(const premise of ia.premises??[])
      assert.ok(known.has(premise),`unresolved or forward premise ${premise} for ${ia.id}`);
    assert.ok(!/BAYESIAN/i.test(JSON.stringify(ia)));
    iaIds.add(ia.id);
    normalized.add(ia.normalized_body);
    known.add(ia.id);
    iaCount++;
  }
  for(const sr of round.support_refinements??[]){
    assert.ok(explicitIds.has(sr.assertion),
      `support refinement target must be source-explicit: ${sr.assertion}`);
    assert.ok(allowedRules.has(sr.rule));
    for(const premise of sr.premises??[])
      assert.ok(known.has(premise),`unresolved support-refinement premise ${premise}`);
    supportRefinements++;
  }
  for(const qr of round.qu_refinements??[]){
    assert.equal(qr.rule,'U');
    for(const premise of qr.premises??[])
      assert.ok(known.has(premise),`unresolved QU-refinement premise ${premise}`);
    assert.equal(qr.probability_added,false);
    quRefinements++;
  }
}

assert.equal(iaCount,52);
assert.equal(supportRefinements,2);
assert.equal(quRefinements,10);
assert.equal(fixed.round,11);
assert.equal(fixed.new_assertions,0);
assert.equal(fixed.support_refinements,0);
assert.equal(fixed.qu_refinements,0);
assert.equal(fixed.input.explicit_assertions,31);
assert.equal(fixed.input.ia_eligible_explicit_assertions,23);
assert.equal(fixed.input.prior_admitted_implicit_assertions,52);
assert.equal(fixed.input.prior_support_refinements,2);
assert.equal(fixed.input.prior_qu_refinements,10);
assert.equal(fixed.forbidden_support_audit.discovery_protocol_used,false);
assert.equal(fixed.forbidden_support_audit.natural_entropic_identity_used,false);
assert.equal(fixed.forbidden_support_audit.dts_used,false);
assert.equal(fixed.forbidden_support_audit.wdl_or_nimber_bridge_used,false);

const native=fs.readFileSync(path.join(here,'ISOMAX_STRUCTURAL_CONTROL_CORE020_0_1.isg'),'utf8');
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

const xor=(a,b)=>a^b;

function assignments(n,pred){
  const out=[];
  for(let mask=0;mask<(1<<n);mask++){
    const v=Array.from({length:n},(_,i)=>(mask>>i)&1);
    if(pred(v))out.push(v);
  }
  return out;
}

// Original shortest 5x4 quotient system:
// a-b=0, b-d=0, a-c=0, c-d=1.
const coarse=assignments(4,([a,b,c,d])=>
  xor(a,b)===0&&xor(b,d)===0&&xor(a,c)===0&&xor(c,d)===1);
assert.equal(coarse.length,0);

// Target-refined shortest system:
// route A target d0, route B target d1.
const refined=assignments(5,([a,b,c,d0,d1])=>
  xor(a,b)===0&&xor(b,d0)===0&&xor(a,c)===0&&xor(c,d1)===1);
assert.deepEqual(
  refined.map(x=>x.join('')).sort(),
  ['00001','11110']
);
for(const [a,b,c,d0,d1] of refined){
  assert.equal(xor(d0,a),0);
  assert.equal(xor(d1,a),1);
}

// Concrete 4x4 two-route system: all six edge deltas are zero.
const flat4=assignments(6,([s,a,b,t,c,d])=>
  xor(s,a)===0&&xor(a,b)===0&&xor(b,t)===0&&
  xor(s,c)===0&&xor(c,d)===0&&xor(d,t)===0);
assert.deepEqual(
  flat4.map(x=>x.join('')).sort(),
  ['000000','111111']
);

// Binary-tie allowed pairs are exactly Boolean equality / XOR-zero.
const tiePairs=[];
for(const x of [0,1])for(const y of [0,1])
  if(xor(x,y)===0)tiePairs.push([x,y]);
assert.deepEqual(tiePairs,[[0,0],[1,1]]);

console.log(JSON.stringify({
  status:'PASS',
  explicitAssertions:a0.assertions.length,
  iaEligibleExplicitAssertions:a0.assertions.filter(x=>x.ia_eligible).length,
  admittedImplicitAssertions:iaCount,
  supportRefinements,
  quRefinements,
  fixedPointRound:fixed.round,
  coarse5x4Solutions:coarse.length,
  refined5x4Solutions:refined.length,
  flat4x4Solutions:flat4.length,
  nativeDelimiterBalance:{parentheses:par,brackets:br},
  forbiddenSupport:{
    DP:false,
    NEI:false,
    DTS:false,
    WDLBridge:false,
  },
},null,2));
