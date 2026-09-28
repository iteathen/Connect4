#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const dir=path.resolve('research/isograph/discovery/2026-09-27-isomax-core020-dp-dts');
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const json=name=>JSON.parse(read(name));

const campaign=read('CAMPAIGN.md');
assert.ok(campaign.includes('4cecb8f4f626bd701548c0951f36cec12d5c4ab5'));
assert.ok(campaign.includes('DP-01 through DP-45'));

const dp=read('DP_PASS_0_1.md');
const protocolIds=[...dp.matchAll(/\| DP-(\d\d) \|/g)].map(m=>Number(m[1]));
assert.deepEqual(protocolIds,Array.from({length:45},(_,i)=>i+1),'DP pass must contain exactly DP-01..DP-45 once');
assert.ok(dp.includes('CPC close-only exact promotion'));
assert.ok(dp.includes('shared-miss stutter suppression'));
assert.ok(dp.includes('3-bit possibility mask'));

const dts=json('DTS_MODEL_0_1.json');
assert.equal(dts.frozen_base,'4cecb8f4f626bd701548c0951f36cec12d5c4ab5');
assert.equal(dts.transitions.length,10);
assert.equal(dts.transition_isomorphs.length,4);
assert.equal(dts.state_spaces.proof.states.length,6);
assert.equal(dts.state_spaces.proof.invalid.mask,0);
assert.equal(dts.state_spaces.proof.max_strict_refinements_from_unknown,2);
assert.equal(dts.state_spaces.proof.refinement,
  'intersection of possible-value sets; equivalent to max lower / min upper; mask realization is bitwise AND');
const transitionIds=new Set(dts.transitions.map(t=>t.id));
for(const id of ['DTS-T01-game-step','DTS-T06-opposite-weak-promote','DTS-T08-repeated-shared-miss-stutter'])
  assert.ok(transitionIds.has(id),'missing DTS transition '+id);

const leads=json('LEAD_LEDGER_0_1.json');
assert.equal(leads.status,'DISCOVERY_PASS_COMPLETE__CPC_CLOSE_REJECTED__OTHER_LEADS_OPEN');
assert.deepEqual(leads.leads.map(x=>x.id),[
  'L1-CPC-CLOSE-ONLY',
  'L2-PROOF-TRANSITION-CENSUS',
  'L3-SHARED-MISS-STUTTER',
  'L4-3BIT-WDL-PROOF-MASK',
  'L5-EXTENSIONAL-COMPREHENSION'
]);
assert.equal(leads.leads[0].semantic_status,'EXACT_RULE');
assert.equal(leads.leads[0].implementation_status,'REJECTED_AFTER_V1_AND_V2_EXACT_CONTROLS');
assert.equal(leads.leads[0].final_disposition,'semantic rule retained; production optimization rejected');
assert.equal(leads.leads[3].implementation_status,'BENCHMARK_REQUIRED');

const cpcResult=read('CPC_CLOSE_ONLY_RESULT_0_1.md');
assert.ok(cpcResult.includes('CPC_CLOSE_ONLY_REJECTED_AS_WHOLE_SOLVE_OPTIMIZATION'));
assert.ok(cpcResult.includes('36382971576'));

for(const required of [
  'DTS_PASS_0_1.md',
  'CPC_CLOSE_ONLY_PLAN_0_1.md',
  'CPC_CLOSE_ONLY_RESULT_0_1.md',
  'SHARED_MISS_STUTTER_PLAN_0_1.md',
  'wdl-proof-refinement-control.mjs'
]) assert.ok(fs.existsSync(path.join(dir,required)),'missing '+required);

console.log(JSON.stringify({
  status:'PASS',
  dpProtocols:protocolIds.length,
  dtsTransitions:dts.transitions.length,
  transitionIsomorphs:dts.transition_isomorphs.length,
  proofStates:dts.state_spaces.proof.states.length,
  prioritizedLeads:leads.leads.length,
  cpcCloseOnly:'REJECTED_AFTER_V1_AND_V2_EXACT_CONTROLS',
  openRepresentationLead:'L4-3BIT-WDL-PROOF-MASK',
  authorityEffect:'canonicalized research; no solver promotion'
},null,2));
