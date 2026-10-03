import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  findCpcxDirectThreeTriggerWingAttacks,
  compileCpcxDirectThreeTriggerWingAttack,
  compileCpcxPostActionWingAttack,
  certifyCpcxSecondWingDeviation,
} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';

const g=createCpcxGeometry();

function rowCells(row,start=0){
  return [0,1,2,3].map(c=>row*g.columns+start+c);
}
function sameCells(a,b){
  return [...a].sort((x,y)=>x-y).join(',')===[...b].sort((x,y)=>x-y).join(',');
}

test('fresh direct bottom wing is reconstructed from current state only',()=>{
  const p=buildCpcxPosition('47',{geometry:g}),
    rows=findCpcxDirectThreeTriggerWingAttacks(p,{attacker:0}),
    wing=rows.find(x=>sameCells(x.anchoredLine.lineCells,rowCells(0)));

  assert.ok(wing);
  assert.equal(p.mover,0);
  assert.equal(wing.initialEvents.length,0);
  assert.equal(wing.defender,1);
  assert.equal(wing.honoredPath.exact,true);
  assert.equal(wing.honoredPath.verification.terminal.player,0);
  assert.equal(
    wing.honoredPath.verification.terminal.index,
    wing.honoredPath.fixedEvents.length-1
  );

  const repair=deriveCpcxUniversalDebtRepair(p,wing,{decisionIndex:0});
  assert.equal(repair.exact,true);
  assert.equal(repair.attacker,0);
  assert.equal(repair.defender,1);
  assert.equal(repair.prefix.length,1);
  assert.equal(repair.prefix[0].cell,wing.anchoredLine.triggerCells[0]);
});

test('fresh non-bottom direct wing is exact and zero-prefix',()=>{
  // D1,A1,D2,B1,E1,C1 leaves P0 to move with D2 anchoring
  // A2-B2-C2-D2; all three missing row-2 cells are current frontier.
  const p=buildCpcxPosition('414253',{geometry:g}),
    rows=findCpcxDirectThreeTriggerWingAttacks(p,{attacker:0}),
    expected=rowCells(1),
    wing=rows.find(x=>sameCells(x.anchoredLine.lineCells,expected));

  assert.ok(wing);
  assert.equal(p.mover,0);
  assert.equal(wing.initialEvents.length,0);
  assert.equal(wing.honoredPath.exact,true);
  assert.deepEqual(
    wing.anchoredLine.triggerCells.map(cell=>Math.floor(cell/g.columns)),
    [1,1,1]
  );
  assert.equal(wing.honoredPath.verification.terminal.player,0);
});

test('direct compiler rejects a named three-piece residual when one trigger is support-hidden',()=>{
  const p=buildCpcxPosition('4142',{geometry:g}),
    row=scanCpcxObligations(p).find(o=>
      o.player===0&&
      o.orientation==='H'&&
      o.missingCount===3&&
      sameCells(g.lines[o.lineId].cells,rowCells(1))
    );
  assert.ok(row);
  assert.ok(row.events.some(e=>e.supportDistance>0));

  const wing=compileCpcxDirectThreeTriggerWingAttack(p,{
    attacker:0,
    lineId:row.lineId,
  });
  assert.equal(wing.kind,'NO_DIRECT_WING_CANDIDATE');
  assert.equal(wing.exact,false);
});

test('direct second deviation is first-win certified unless it steals final trigger',()=>{
  const p=buildCpcxPosition('47',{geometry:g}),
    wing=findCpcxDirectThreeTriggerWingAttacks(p,{attacker:0})
      .find(x=>sameCells(x.anchoredLine.lineCells,rowCells(0)));
  assert.ok(wing);

  const external=1*g.columns+6, // G2, supported by the existing G1 stone.
    certified=certifyCpcxSecondWingDeviation(p,wing,{
      actualReplyCell:external,
    });
  assert.equal(certified.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(certified.exact,true);
  assert.equal(certified.player,0);

  const stolen=certifyCpcxSecondWingDeviation(p,wing,{
    actualReplyCell:wing.anchoredLine.triggerCells[2],
  });
  assert.equal(stolen.kind,'NO_CERTIFICATE');
  assert.equal(stolen.seam,'FINAL_WING_TRIGGER_STOLEN');
});

test('historical post-action wing retains its explicit one-event prefix',()=>{
  const root=buildCpcxPosition('44444',{geometry:g}),
    actionCell=root.heights[0]*g.columns,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,
      actionOwner:1,
      attacker:0,
    });
  assert.equal(wing.kind,'THREE_TRIGGER_WING_ATTACK');
  assert.equal(wing.exact,true);
  assert.equal(wing.initialEvents.length,1);
  assert.equal(wing.initialEvents[0].cell,actionCell);
  assert.equal(wing.initialEvents[0].owner,1);
  assert.equal(wing.defender,1);
  assert.equal(wing.honoredPath.exact,true);
});

test('direct wing runtime is isolated from solved/search machinery',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-wing.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
