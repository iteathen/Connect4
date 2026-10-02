import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  createCpcxResidualCarrier,
  findCpcxConditionalPrecursors,
  traceCpcxObligationChain,
} from './cpcx-residual.mjs';
import {
  compileCpcxSameColumnPairPolicy,
  compileCpcxPairPolicyStep,
  compileCpcxAnchoredWingPairPlan,
} from './cpcx-pairs.mjs';
import {
  compileCpcxPostActionWingAttack,
  classifyCpcxWingDeviation,
} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';

const g=createCpcxGeometry();

test('three-piece obligation contracts 3 -> 2 -> 1 -> completion algebraically',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const o=scanCpcxObligations(p)
    .find(x=>x.player===0&&x.lineLabel==='D1-E1-F1-G1');
  const t=traceCpcxObligationChain(o,o.missingCells,{owner:0});
  assert.equal(t.choiceEnumeration,false);
  assert.equal(t.exactResidualAlgebra,true);
  assert.deepEqual(
    t.steps.map(s=>s.contracted[0]?[s.contracted[0].fromMissing,s.contracted[0].toMissing]:[1,0]),
    [[3,2],[2,1],[1,0]],
  );
  assert.equal(t.completions.at(-1).lineLabel,'D1-E1-F1-G1');
});

test('four-piece obligation contracts 4 -> 3 -> 2 -> 1 -> completion algebraically',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const o=scanCpcxObligations(p)
    .find(x=>x.player===0&&x.lineLabel==='D6-E5-F4-G3');
  const t=traceCpcxObligationChain(o,o.missingCells,{owner:0});
  assert.equal(t.steps.length,4);
  assert.deepEqual(
    t.steps.map(s=>s.contracted[0]?[s.contracted[0].fromMissing,s.contracted[0].toMissing]:[1,0]),
    [[4,3],[3,2],[2,1],[1,0]],
  );
  assert.equal(t.completions.at(-1).lineLabel,'D6-E5-F4-G3');
});

test('44444 current P0 events already compile genuine 3->2 future obligations',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const rows=findCpcxConditionalPrecursors(p,{player:0});
  const e1=rows.find(x=>x.cell===4);
  assert.ok(e1);
  assert.equal(e1.consequence,'OWNER_LOWER_CARDINALITY');
  assert.ok(e1.contracted.some(x=>
    x.lineLabel==='D1-E1-F1-G1'&&x.fromMissing===3&&x.toMissing===2
  ));
});

test('same-column pair policy on right wing gives P0 odd cells under honored responses',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const plan=compileCpcxAnchoredWingPairPlan(p,{
    player:0,anchorColumn:3,wingColumns:[4,5,6],rows:[0,2,4],
  });
  assert.equal(plan.exactUnderHonoredPolicy,true);
  assert.equal(plan.deviationHandlingCertified,false);
  assert.equal(plan.guaranteedUnderHonoredPolicy.length,3);
  assert.deepEqual(plan.guaranteedUnderHonoredPolicy.map(x=>x.row),[0,2,4]);

  const policy=compileCpcxSameColumnPairPolicy(p,{triggerOwner:0,columns:[4,5,6]});
  const honored=compileCpcxPairPolicyStep(p,policy,{triggerCell:4,actualReplyCell:11});
  const debt=compileCpcxPairPolicyStep(p,policy,{triggerCell:4,actualReplyCell:5});
  assert.equal(honored.kind,'PAIR_HONORED');
  assert.equal(honored.parityDelta,0);
  assert.equal(debt.kind,'PAIR_DEVIATION_DEBT');
  assert.equal(debt.parityDelta,1);
  assert.equal(debt.debt.responseCell,11);
});

test('all seven sixth actions admit an untouched-wing honored-response win on the third trigger',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  for(let column=0;column<7;column++){
    const cell=p.heights[column]*g.columns+column;
    const c=compileCpcxPostActionWingAttack(p,{actionCell:cell,actionOwner:1,attacker:0});
    assert.equal(c.kind,'THREE_TRIGGER_WING_ATTACK',String(column+1));
    assert.equal(c.honoredPath.verification.legal,true,String(column+1));
    assert.equal(c.honoredPath.terminalOnThirdTrigger,true,String(column+1));
    assert.equal(c.honoredPath.verification.terminal.player,0,String(column+1));
    assert.equal(c.deviationContract.forcingCertified,false,String(column+1));
  }
});

test('wing deviation is typed as debt rather than recursively followed',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const c=compileCpcxPostActionWingAttack(p,{actionCell:0,actionOwner:1,attacker:0});
  const honored=classifyCpcxWingDeviation(c,{decisionIndex:0,actualReplyCell:11});
  const stolen=classifyCpcxWingDeviation(c,{decisionIndex:0,actualReplyCell:5});
  assert.equal(honored.kind,'HONORED_RESPONSE');
  assert.equal(stolen.kind,'TRIGGER_STOLEN_DEBT');
  assert.equal(stolen.debt.parityDelta,1);
  assert.equal(stolen.forcingCertified,false);
});

test('universal first-deviation repair passes first-win guard for every sixth move',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  for(let column=0;column<7;column++){
    const cell=p.heights[column]*g.columns+column,
      c=compileCpcxPostActionWingAttack(p,{actionCell:cell,actionOwner:1,attacker:0}),
      d=deriveCpcxUniversalDebtRepair(p,c,{decisionIndex:0});
    assert.equal(d.choiceEnumeration,false,String(column+1));
    assert.equal(d.firstWinGuardPassed,true,String(column+1));
    assert.equal(d.postRepairFirstWinGuardPassed,true,String(column+1));
    assert.equal(d.postRepairTerminalRisks.length,0,String(column+1));
    assert.equal(d.repairLegalAtDecision,true,String(column+1));
    assert.equal(d.terminalDeviationCells.length,0,String(column+1));
    assert.ok(d.guaranteedResiduals.filter(x=>x.missingCount===2).length>=2,String(column+1));
    assert.equal(d.forcingCertified,false,String(column+1));
  }
});

test('second wing response deviation also reduces to deterministic repair plus surviving pair residuals',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  for(let column=0;column<7;column++){
    const cell=p.heights[column]*g.columns+column,
      c=compileCpcxPostActionWingAttack(p,{actionCell:cell,actionOwner:1,attacker:0}),
      d=deriveCpcxUniversalDebtRepair(p,c,{decisionIndex:1});
    assert.equal(d.choiceEnumeration,false,String(column+1));
    assert.equal(d.firstWinGuardPassed,true,String(column+1));
    assert.equal(d.postRepairFirstWinGuardPassed,true,String(column+1));
    assert.equal(d.repairLegalAtDecision,true,String(column+1));
    assert.ok(d.guaranteedResiduals.filter(x=>x.missingCount===2).length>=1,String(column+1));
  }
});

test('canonical right-wing debt repair produces three deviation-invariant pair residuals',()=>{
  const p=buildCpcxPosition('44444',{geometry:g}),
    c=compileCpcxPostActionWingAttack(p,{actionCell:0,actionOwner:1,attacker:0}),
    d=deriveCpcxUniversalDebtRepair(p,c,{decisionIndex:0}),
    pairs=d.guaranteedResiduals.filter(x=>x.missingCount===2),
    labels=new Set(pairs.map(x=>x.lineLabel));
  for(const line of ['D1-E2-F3-G4','E1-E2-E3-E4','B5-C4-D3-E2'])
    assert.ok(labels.has(line),line);
  for(const x of pairs)for(const e of x.events)
    assert.ok(Number.isInteger(e.eventRank));
});

test('new modules remain solved-data and production-CPC isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  for(const file of ['./cpcx-residual.mjs','./cpcx-pairs.mjs','./cpcx-wing.mjs','./cpcx-debt.mjs']){
    const source=await readFile(new URL(file,import.meta.url),'utf8');
    for(const forbidden of ['cpc-connect4','ExactConnect4Oracle','components/oracle','solveSequence('])
      assert.equal(source.includes(forbidden),false,file+' '+forbidden);
  }
});
