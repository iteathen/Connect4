import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {closeCpcxForcedResponses} from './cpcx-closure.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
import {
  classifyCpcxProgress,
} from './cpcx-progress.mjs';
import {
  composeCpcxForcingMacro,
  classifyCpcxSuccessor,
  runCpcxFirstWinCertificate,
} from './cpcx-successor.mjs';
 
const g=createCpcxGeometry();

test('playable two-piece forcing macro composes into one concrete successor',()=>{
  const p=buildCpcxPosition('44444151511355',{geometry:g}),
    progress=classifyCpcxProgress(p,{player:0});
  assert.equal(progress.kind,'CERTIFIED_FORCING_MACRO');
  assert.equal(progress.exact,true);
  const successor=composeCpcxForcingMacro(p,progress);
  assert.equal(successor.exact,true);
  assert.equal(successor.kind,'CONCRETE_SUCCESSOR');
  assert.ok(successor.concretePosition);
  assert.ok(Math.min(...successor.rank.deltaOptions)>=1);
  assert.equal(successor.choiceEnumeration,false);
  const next=classifyCpcxSuccessor(successor,{attacker:0});
  assert.ok([
    'CERTIFIED_FIRST_WIN',
    'FORCED_NORMALIZATION',
    'CERTIFIED_FORCING_MACRO',
    'PROJECTION_ONLY',
    'NO_CERTIFICATE',
  ].includes(next.kind));
});

test('defender-turn vertical preempt/nonpreempt alternatives collapse to one abstract successor',()=>{
  const start=buildCpcxPosition('4444415151',{geometry:g}),
    p=closeCpcxForcedResponses(start).position;
  let selected=null;
  for(const demand of findCpcxVerticalTwoStageObligations(p,{player:0})){
    const certificate=certifyCpcxVerticalTwoStage(p,demand);
    if(certificate.kind==='PREEMPT_OR_FORCED_UPPER'&&certificate.exact){
      selected={demand,certificate};break;
    }
  }
  assert.ok(selected);
  const progress={
    kind:'CERTIFIED_FORCING_MACRO',
    exact:true,
    player:0,
    macro:{
      kind:'VERTICAL_TWO_STAGE',
      primaryCell:selected.demand.lowerCell,
      secondaryCell:selected.demand.upperCell,
      lineId:selected.demand.obligation.lineId,
      ...selected,
    },
  };
  const successor=composeCpcxForcingMacro(p,progress);
  assert.equal(successor.kind,'ABSTRACT_SUCCESSOR');
  assert.equal(successor.exact,true);
  assert.equal(successor.nextMover,0);
  assert.deepEqual(successor.rank.deltaOptions,[1,3]);
  assert.equal(successor.rank.allSameParity,true);
  assert.equal(successor.controlParityEquivalent,true);
  assert.equal(successor.blockerTokens.length,1);
  assert.equal(successor.blockerTokens[0].maxCount,1);
  assert.equal(successor.blockerTokens[0].directKillCapacity,0);
  assert.equal(successor.choiceEnumeration,false);

  const next=classifyCpcxSuccessor(successor,{attacker:0});
  assert.equal(next.kind,'NO_CERTIFICATE');
  assert.equal(next.seam,'ABSTRACT_OPPONENT_SINGLETON_ENVELOPE_MISSING');
});

test('one-sided certificate loop terminates immediately on an exact first win',()=>{
  const p=buildCpcxPosition('172736',{geometry:g}),
    result=runCpcxFirstWinCertificate(p,{attacker:0});
  assert.equal(result.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(result.player,0);
  assert.equal(result.exact,true);
  assert.equal(result.recursive,false);
});

test('unresolved state returns NO_CERTIFICATE and never a draw result',()=>{
  const p=buildCpcxPosition('44444353533655',{geometry:g}),
    result=runCpcxFirstWinCertificate(p,{attacker:0});
  assert.equal(result.kind,'NO_CERTIFICATE');
  assert.equal(result.exact,false);
  assert.equal(Object.prototype.hasOwnProperty.call(result,'draw'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(result,'value'),false);
});

test('first-win ordering guard forces normalization instead of false macro certification',()=>{
  const p=buildCpcxPosition('4444415151',{geometry:g});
  const demand=findCpcxVerticalTwoStageObligations(p,{player:0})[0];
  assert.ok(demand);
  const cert=certifyCpcxVerticalTwoStage(p,demand);
  assert.equal(cert.kind,'REQUIRES_FORCED_NORMALIZATION');
  assert.equal(cert.exact,false);
  assert.ok(cert.opponentSingletons.length>=1);

  const progress=classifyCpcxProgress(p,{player:0});
  assert.equal(progress.kind,'FORCED_NORMALIZATION');
  assert.notEqual(progress.kind,'CERTIFIED_FIRST_WIN');
});

test('successor source contains no draw classifier or global value-preservation premise',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-successor.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    "kind:'DRAW'",
    'WDL_UNKNOWN',
    'global W/D/L',
    'minimax',
    'negamax',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
