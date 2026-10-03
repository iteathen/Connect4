import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {
  findCpcxVerticalThreeStageObligations,
  certifyCpcxVerticalThreeStageSetup,
} from './cpcx-three-stage.mjs';

const g=createCpcxGeometry();

function bySetup(rows,column,row){
  const cell=row*g.columns+column;
  return rows.find(x=>x.setupCell===cell)??null;
}

test('fresh standard-board three-stage residual hands off exactly to vertical two-stage',()=>{
  const p=buildCpcxPosition('12',{geometry:g}),
    rows=findCpcxVerticalThreeStageObligations(p,{player:0}),
    demand=bySetup(rows,0,1);
  assert.ok(demand);
  const c=certifyCpcxVerticalThreeStageSetup(p,demand);
  assert.equal(c.kind,'VERTICAL_THREE_STAGE_SETUP');
  assert.equal(c.exact,true);
  assert.equal(c.setupCell,1*g.columns+0);
  assert.equal(c.childCertificate.kind,'PREEMPT_OR_FORCED_UPPER');
  assert.equal(c.childCertificate.exact,true);
  assert.deepEqual(c.totalRankDeltaOptions,[2,4]);
  assert.equal(c.totalRankDeltaParity,0);
  assert.equal(c.nextMover,0);
  assert.equal(c.controlParityEquivalent,true);
});

test('three-stage setup works at a nontrivial source rank',()=>{
  const p=buildCpcxPosition('123456',{geometry:g}),
    demand=bySetup(
      findCpcxVerticalThreeStageObligations(p,{player:0}),
      0,1
    );
  assert.ok(demand);
  const c=certifyCpcxVerticalThreeStageSetup(p,demand);
  assert.equal(c.kind,'VERTICAL_THREE_STAGE_SETUP');
  assert.equal(c.exact,true);
  assert.equal(c.child.rank,p.rank+1);
  assert.equal(c.child.mover,1);
});

test('malformed nonconsecutive demand is rejected instead of repaired',()=>{
  const p=buildCpcxPosition('12',{geometry:g}),
    demand=bySetup(
      findCpcxVerticalThreeStageObligations(p,{player:0}),
      0,1
    );
  assert.ok(demand);
  const bad={
    ...demand,
    middleCell:demand.upperCell,
  };
  const c=certifyCpcxVerticalThreeStageSetup(p,bad);
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'DEMAND_NOT_CURRENT_LIVE_THREE_STAGE');
});

test('source immediate obligation has precedence over three-stage setup',()=>{
  const p=buildCpcxPosition('11213',{geometry:g}),
    rows=findCpcxVerticalThreeStageObligations(p,{player:p.mover});
  assert.ok(rows.length>=1);
  const c=certifyCpcxVerticalThreeStageSetup(p,rows[0]);
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SOURCE_IMMEDIATE_PRECEDENCE');
});

test('setup fails closed when it exposes a defender immediate terminal',()=>{
  const p=buildCpcxPosition('755355456253',{geometry:g}),
    rows=findCpcxVerticalThreeStageObligations(p,{player:0}),
    demand=bySetup(rows,3,1);
  assert.ok(demand);
  const c=certifyCpcxVerticalThreeStageSetup(p,demand);
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'DEFENDER_TERMINAL_AFTER_SETUP');
  assert.equal(c.boundary.kind,'IMMEDIATE_TERMINAL_AVAILABLE');
  assert.equal(c.boundary.mover,1);
});

test('three-stage implementation delegates to existing two-stage theorem and remains isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-three-stage.mjs',import.meta.url),
    'utf8'
  );
  assert.match(source,/certifyCpcxVerticalTwoStage/);
  for(const forbidden of [
    "'44444'",
    'U13',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
