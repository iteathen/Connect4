import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxSupportReleaseAcquisition,
} from './cpcx-support-release-acquisition.mjs';

function cell(g,column,row=0){
  return row*g.columns+column;
}

function residual(position,player,lineLabel){
  const row=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(row,lineLabel);
  return row;
}

test('fresh empty-board depth-one target produces an exact acquisition edge',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,0,'A2-B2-C2-D2'),
    c=certifyCpcxSupportReleaseAcquisition(p,{
      controllerResidual:r,
      targetCell:cell(g,0,1),
      controllerActionCell:cell(g,6,0),
    });

  assert.equal(c.kind,'SUPPORT_RELEASE_ACQUISITION_EDGE');
  assert.equal(c.exact,true);
  assert.equal(c.controller,0);
  assert.equal(c.opponent,1);
  assert.equal(c.acquisitionEdge.triggerCell,cell(g,0,0));
  assert.equal(c.acquisitionEdge.acquisitionCell,cell(g,0,1));
  assert.equal(c.acquisitionEdge.contracted,true);
  assert.equal(c.acquisitionEdge.completed,false);
  assert.equal(c.externalClass.targetRemainsUnreleased,true);
  assert.equal(c.firstWinGuardPassed,true);
});

test('fresh non-bottom target preserves acquisition under changed support context',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('27',{geometry:g}),
    r=residual(p,0,'A3-B3-C3-D3'),
    c=certifyCpcxSupportReleaseAcquisition(p,{
      controllerResidual:r,
      targetCell:cell(g,1,2),
      controllerActionCell:cell(g,5,0),
    });

  assert.equal(c.kind,'SUPPORT_RELEASE_ACQUISITION_EDGE');
  assert.equal(c.exact,true);
  assert.equal(c.residual.sourceSupportDistance,1);
  assert.equal(c.acquisitionEdge.triggerCell,cell(g,1,1));
  assert.equal(c.acquisitionEdge.acquisitionCell,cell(g,1,2));
  assert.equal(c.acquisitionEdge.contracted,true);
});

test('pinned action that supplies the target fails closed',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,0,'A2-B2-C2-D2'),
    c=certifyCpcxSupportReleaseAcquisition(p,{
      controllerResidual:r,
      targetCell:cell(g,0,1),
      controllerActionCell:cell(g,0,0),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'PINNED_CONTROLLER_ACTION_SUPPLIES_TARGET');
});

test('opponent-terminal support scenario fails closed before acquisition',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('716273',{geometry:g}),
    r=residual(p,0,'A2-B2-C2-D2'),
    c=certifyCpcxSupportReleaseAcquisition(p,{
      controllerResidual:r,
      targetCell:cell(g,3,1),
      controllerActionCell:cell(g,4,0),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SUPPORT_TRIGGER_TERMINAL');
  assert.equal(c.terminal.player,1);
});

test('support trigger creating a distinct opponent singleton fails capacity guard',()=>{
  const g=createCpcxGeometry({columns:6,rows:3,connect:3}),
    p=buildCpcxPosition('323531',{geometry:g}),
    r=residual(p,0,'B2-C2-D2'),
    c=certifyCpcxSupportReleaseAcquisition(p,{
      controllerResidual:r,
      targetCell:cell(g,3,1),
      controllerActionCell:cell(g,0,1),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SUPPLY_CREATES_OPPONENT_IMMEDIATE_SINGLETON');
  assert.deepEqual(c.cells,[cell(g,5,0)]);
});

test('target outside protected residual is rejected',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,0,'A2-B2-C2-D2'),
    c=certifyCpcxSupportReleaseAcquisition(p,{
      controllerResidual:r,
      targetCell:cell(g,4,1),
      controllerActionCell:cell(g,6,0),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'TARGET_NOT_IN_PROTECTED_RESIDUAL');
});

test('support-release acquisition is production CPC and solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-support-release-acquisition.mjs',import.meta.url),
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
