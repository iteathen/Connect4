import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {certifyCpcxGuardedExternalEventCommutator} from './cpcx-commutator.mjs';

function cell(g,column,row=0){
  return row*g.columns+column;
}

function macro(events,{
  loadBearingCells=events.map(e=>e.cell),
  supportPrerequisiteCells=[],
  premiseResiduals=[],
}={}){
  return {
    kind:'TEST_CERTIFIED_FIXED_BRIDGE',
    exact:true,
    events,
    loadBearingCells,
    supportPrerequisiteCells,
    premiseResiduals,
  };
}

test('fresh bottom-row external events commute around an independent bridge',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('',{geometry:g}),
    x={cell:cell(g,0),owner:0},
    y={cell:cell(g,2),owner:0},
    bridge=macro([{cell:cell(g,1),owner:1}]),
    c=certifyCpcxGuardedExternalEventCommutator(p,{x,y,macro:bridge});

  assert.equal(c.kind,'EXACT_EXTERNAL_EVENT_COMMUTATION');
  assert.equal(c.exact,true);
  assert.equal(c.successor.rank,3);
  assert.equal(c.successor.mover,1);
  assert.deepEqual(c.successor.heights,[1,1,1,0,0,0,0]);
  assert.equal(c.correspondence.globalColumnPermutationRequired,false);
  assert.equal(c.recursive,false);
  assert.equal(c.gameTreeTraversal,false);
});

test('fresh non-bottom control qualifies without bottom-row special casing',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('13',{geometry:g}),
    x={cell:cell(g,0,1),owner:0},
    y={cell:cell(g,2,1),owner:0},
    bridge=macro([{cell:cell(g,1,0),owner:1}]),
    c=certifyCpcxGuardedExternalEventCommutator(p,{x,y,macro:bridge});

  assert.equal(c.kind,'EXACT_EXTERNAL_EVENT_COMMUTATION');
  assert.deepEqual(c.successor.heights,[2,1,2,0,0,0,0]);
  assert.equal(c.successor.rank,5);
});

test('support-dependent external pair fails because the upper event is not an independent current frontier event',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('',{geometry:g}),
    x={cell:cell(g,0,0),owner:0},
    y={cell:cell(g,0,1),owner:0},
    bridge=macro([{cell:cell(g,1,0),owner:1}]),
    c=certifyCpcxGuardedExternalEventCommutator(p,{x,y,macro:bridge});

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'EXTERNAL_NOT_CURRENT_FRONTIER');
  assert.equal(c.yCurrentFrontier,false);
});

test('external event intersecting a load-bearing macro cell fails closed',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('',{geometry:g}),
    x={cell:cell(g,0),owner:0},
    y={cell:cell(g,2),owner:0},
    bridge=macro(
      [{cell:cell(g,1),owner:1}],
      {loadBearingCells:[cell(g,0),cell(g,1)]}
    ),
    c=certifyCpcxGuardedExternalEventCommutator(p,{x,y,macro:bridge});

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'EXTERNAL_INTERSECTS_LOAD_BEARING_CELL');
});

test('external event intersecting an explicit macro support prerequisite fails closed',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('',{geometry:g}),
    x={cell:cell(g,0),owner:0},
    y={cell:cell(g,2),owner:0},
    bridge=macro(
      [{cell:cell(g,1),owner:1}],
      {supportPrerequisiteCells:[cell(g,0)]}
    ),
    c=certifyCpcxGuardedExternalEventCommutator(p,{x,y,macro:bridge});

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'EXTERNAL_INTERSECTS_SUPPORT_PREREQUISITE');
});

test('external event changing a declared load-bearing residual premise fails closed',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('',{geometry:g}),
    x={cell:cell(g,0),owner:0},
    y={cell:cell(g,2),owner:0},
    bridge=macro(
      [{cell:cell(g,1),owner:1}],
      {premiseResiduals:[{
        player:0,
        lineId:0,
        missingCells:[cell(g,0),cell(g,4)],
      }]}
    ),
    c=certifyCpcxGuardedExternalEventCommutator(p,{x,y,macro:bridge});

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'EXTERNAL_ALTERS_MACRO_PREMISE_RESIDUAL');
});

test('first-terminal precedence difference rejects equal final occupancy reasoning',()=>{
  const g=createCpcxGeometry({columns:4,rows:2,connect:2}),
    p=buildCpcxPosition('13',{geometry:g}),
    x={cell:cell(g,1,0),owner:0}, // completes A1-B1 immediately
    y={cell:cell(g,2,1),owner:0}, // nonterminal
    bridge=macro([{cell:cell(g,0,1),owner:1}]), // nonterminal bridge
    c=certifyCpcxGuardedExternalEventCommutator(p,{x,y,macro:bridge});

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'FIRST_TERMINAL_PRECEDENCE_DIFFERS');
  assert.equal(c.terminalA.player,0);
  assert.equal(c.terminalA.index,0);
  assert.equal(c.terminalB.player,0);
  assert.equal(c.terminalB.index,2);
});

test('commutator implementation is generic and production/solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-commutator.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    "'44444'",
    'U12',
    'U18',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
