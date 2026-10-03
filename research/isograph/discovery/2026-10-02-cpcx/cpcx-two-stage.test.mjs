import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {closeCpcxForcedResponses} from './cpcx-closure.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
  collapseCpcxVerticalTwoStage,
  deriveCpcxVerticalOpponentSingletonEnvelope,
} from './cpcx-two-stage.mjs';

const g=createCpcxGeometry();

const falsifierStarts=[
  {move:1,seq:'4444415151'},
  {move:2,seq:'4444425252'},
  {move:3,seq:'4444435353'},
  {move:5,seq:'4444451515'},
  {move:6,seq:'4444462626'},
  {move:7,seq:'4444473737'},
];

test('vertical two-stage candidate fails closed before singleton normalization',()=>{
  for(const row of falsifierStarts){
    const p=buildCpcxPosition(row.seq,{geometry:g}),
      demands=findCpcxVerticalTwoStageObligations(p,{player:0});
    assert.ok(demands.length>=1,String(row.move));
    const cert=certifyCpcxVerticalTwoStage(p,demands[0]);
    assert.equal(cert.kind,'REQUIRES_FORCED_NORMALIZATION',String(row.move));
    assert.equal(cert.exact,false,String(row.move));
  }
});

test('forced normalization repairs all retained vertical-tempo falsifiers',()=>{
  for(const row of falsifierStarts){
    const p=buildCpcxPosition(row.seq,{geometry:g}),
      closed=closeCpcxForcedResponses(p),
      demands=findCpcxVerticalTwoStageObligations(closed.position,{player:0});
    assert.ok(demands.length>=1,String(row.move));
    const exact=demands.map(d=>certifyCpcxVerticalTwoStage(closed.position,d))
      .find(x=>x.exact&&(
        x.kind==='PREEMPT_OR_FORCED_UPPER'||
        x.kind==='FORCED_UPPER_RESPONSE'||
        x.kind==='ATTACKER_TERMINAL_ON_LOWER'
      ));
    assert.ok(exact,JSON.stringify({move:row.move,demands}));
    if(exact.kind==='PREEMPT_OR_FORCED_UPPER')
      assert.equal(exact.choiceEnumeration,false,String(row.move));
  }
});

test('defender-turn two-stage alternatives collapse to one CPC parity class',()=>{
  const p=buildCpcxPosition('4444415151',{geometry:g}),
    normalized=closeCpcxForcedResponses(p).position,
    demand=findCpcxVerticalTwoStageObligations(normalized,{player:0})[0],
    cert=certifyCpcxVerticalTwoStage(normalized,demand),
    collapsed=collapseCpcxVerticalTwoStage(normalized,demand,cert);
  assert.equal(cert.kind,'PREEMPT_OR_FORCED_UPPER');
  assert.deepEqual(collapsed.rankDeltaOptions,[1,3]);
  assert.equal(collapsed.rankDeltaParity,1);
  assert.equal(collapsed.controlParityEquivalent,true);
  assert.equal(collapsed.nextMover,0);
  assert.equal(collapsed.choiceEnumeration,false);
  assert.ok(collapsed.guaranteedResiduals.some(r=>
    r.lineLabel==='D1-E2-F3-G4'&&r.missingCount===2
  ));
});


test('vertical envelope carries a conservative defender first-terminal lower horizon',()=>{
  const p=buildCpcxPosition('4444415151',{geometry:g}),
    normalized=closeCpcxForcedResponses(p).position,
    demand=findCpcxVerticalTwoStageObligations(normalized,{player:0})[0],
    cert=certifyCpcxVerticalTwoStage(normalized,demand),
    envelope=deriveCpcxVerticalOpponentSingletonEnvelope(
      normalized,demand,cert
    );
  assert.equal(envelope.kind,'OPPONENT_SINGLETON_ENVELOPE');
  assert.equal(envelope.exact,true);
  assert.equal(envelope.defenderTerminalClasses,0);
  assert.equal(envelope.opponentResidualEnvelope.exact,true);
  assert.ok(envelope.opponentResidualEnvelope.possibleResiduals.length>=
    envelope.opponentResidualEnvelope.guaranteedResiduals.length);
  assert.ok(envelope.opponentResidualEnvelope.possibleResiduals.every(r=>
    r.supportProfilesExact===true&&
    r.supportProfiles.length>=1&&
    r.supportProfiles.every(p=>p.length===r.missingCells.length)
  ));
  assert.equal(Number.isInteger(envelope.defenderEarliestTerminalLowerBound),true);
  assert.ok(envelope.defenderEarliestTerminalLowerBound>=1);
  assert.equal(Object.prototype.hasOwnProperty.call(envelope,'winner'),false);
});

test('move-3 symmetric control transports turn back to attacker and forces upper',()=>{
  const p=buildCpcxPosition('4444435353',{geometry:g}),
    closed=closeCpcxForcedResponses(p);
  assert.equal(closed.position.mover,0);
  assert.equal(closed.steps.length,2);
  const demand=findCpcxVerticalTwoStageObligations(closed.position,{player:0})
    .find(d=>d.obligation.lineLabel==='E1-E2-E3-E4');
  assert.ok(demand);
  const cert=certifyCpcxVerticalTwoStage(closed.position,demand);
  assert.equal(cert.kind,'FORCED_UPPER_RESPONSE');
  assert.equal(cert.exact,true);
});

test('two-stage module is production-CPC and solved-data isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-two-stage.mjs',import.meta.url),'utf8');
  for(const forbidden of ['cpc-connect4','ExactConnect4Oracle','components/oracle','solveSequence('])
    assert.equal(source.includes(forbidden),false,forbidden);
});
