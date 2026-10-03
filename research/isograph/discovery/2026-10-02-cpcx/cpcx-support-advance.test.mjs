import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxProtectedResidualSupportAdvance,
} from './cpcx-support-advance.mjs';

function residual(position,{player,lineLabel}){
  const row=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(row,lineLabel);
  return row;
}

function cell(g,column,row){
  return row*g.columns+column;
}

test('fresh bottom support advance preserves horizontal residual and decreases debt by one',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,{player:0,lineLabel:'A2-B2-C2'}),
    c=certifyCpcxProtectedResidualSupportAdvance(p,{
      controllerResidual:r,
      targetCell:cell(g,0,1), // A2
    });

  assert.equal(c.kind,'PROTECTED_RESIDUAL_SUPPORT_ADVANCE');
  assert.equal(c.exact,true);
  assert.equal(c.actionCell,cell(g,0,0)); // A1
  assert.deepEqual(c.sourceSupportDistances,[1,1,1]);
  assert.deepEqual(c.childSupportDistances,[0,1,1]);
  assert.equal(c.supportDebtDelta,-1);
  assert.equal(c.phaseGauge.relativePhaseInvariant,true);
  assert.equal(c.phaseGauge.projectedOwnerInvariant,true);
  assert.equal(c.childImmediateBoundary.kind,'NO_IMMEDIATE_OBLIGATION');
});

test('fresh non-bottom target support advance remains exact',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,{player:0,lineLabel:'A3-B3-C3'}),
    c=certifyCpcxProtectedResidualSupportAdvance(p,{
      controllerResidual:r,
      targetCell:cell(g,0,2), // A3
    });

  assert.equal(c.kind,'PROTECTED_RESIDUAL_SUPPORT_ADVANCE');
  assert.equal(c.exact,true);
  assert.deepEqual(c.sourceSupportDistances,[2,2,2]);
  assert.deepEqual(c.childSupportDistances,[1,2,2]);
  assert.equal(c.sourceSupportDebt,6);
  assert.equal(c.childSupportDebt,5);
});

test('support event that is itself a missing residual cell is rejected',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,{player:0,lineLabel:'A1-A2-A3'}),
    c=certifyCpcxProtectedResidualSupportAdvance(p,{
      controllerResidual:r,
      targetCell:cell(g,0,1), // A2, but A1 is also missing
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'TARGET_COLUMN_HAS_MULTIPLE_MISSING_CELLS');
});

test('already playable target is not a support-advance edge',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,{player:0,lineLabel:'A1-B1-C1'}),
    c=certifyCpcxProtectedResidualSupportAdvance(p,{
      controllerResidual:r,
      targetCell:cell(g,0,0),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'TARGET_ALREADY_PLAYABLE');
});

test('higher-precedence source obligation rejects support advance',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('1121',{geometry:g}),
    r=residual(p,{player:0,lineLabel:'B1-C2-D3'}),
    c=certifyCpcxProtectedResidualSupportAdvance(p,{
      controllerResidual:r,
      targetCell:cell(g,3,2), // D3
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SOURCE_IMMEDIATE_PRECEDENCE');
  assert.equal(c.boundary.kind,'IMMEDIATE_TERMINAL_AVAILABLE');
});

test('support advance fails closed when it releases an opponent terminal',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('1311',{geometry:g}),
    r=residual(p,{player:0,lineLabel:'A2-B3-C4'}),
    c=certifyCpcxProtectedResidualSupportAdvance(p,{
      controllerResidual:r,
      targetCell:cell(g,1,2), // B3; B1 is the support advance
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'OPPONENT_TERMINAL_AFTER_SUPPORT_ADVANCE');
  assert.equal(c.boundary.kind,'IMMEDIATE_TERMINAL_AVAILABLE');
  assert.deepEqual(c.boundary.winningCells,[cell(g,1,1)]); // B2
});

test('support advance implementation is generic and isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-support-advance.mjs',import.meta.url),
    'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'U4',
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
