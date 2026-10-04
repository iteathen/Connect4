import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxSupportReleaseSharedAcquisitionBlock,
} from './cpcx-support-release-shared-acquisition-block.mjs';

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

test('fresh 4x4 k3 shared acquisition/block terminal is exact',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('24414112',{geometry:g}),
    r=residual(p,0,'B1-C2-D3'),
    c=certifyCpcxSupportReleaseSharedAcquisitionBlock(p,{
      controllerResidual:r,
      targetCell:cell(g,2,1), // C2
      controllerActionCell:cell(g,1,2), // B3
    });

  assert.equal(p.mover,0);
  assert.equal(c.kind,'SUPPORT_RELEASE_SHARED_ACQUISITION_BLOCK_EDGE',JSON.stringify(c));
  assert.equal(c.exact,true);
  assert.equal(c.sharedEdge.triggerCell,cell(g,2,0)); // C1
  assert.equal(c.sharedEdge.responseCell,cell(g,2,1)); // C2
  assert.deepEqual(c.sharedEdge.opponentUrgentCells,[cell(g,2,1)]);
  assert.equal(c.sharedEdge.controllerResidualCompleted,true);
  assert.equal(c.sharedEdge.controllerResidualContracted,false);
  assert.equal(c.sharedEdge.controllerTerminal?.player,0);
  assert.equal(c.sharedEdge.opponentResidualsKilled,true);
});

test('fresh 4x4 k3 shared acquisition/block contracts without terminal',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('1122',{geometry:g}),
    r=residual(p,0,'B1-C2-D3'),
    c=certifyCpcxSupportReleaseSharedAcquisitionBlock(p,{
      controllerResidual:r,
      targetCell:cell(g,2,1), // C2
      controllerActionCell:cell(g,0,2), // A3
    });

  assert.equal(p.mover,0);
  assert.equal(r.missingCount,2);
  assert.equal(c.kind,'SUPPORT_RELEASE_SHARED_ACQUISITION_BLOCK_EDGE',JSON.stringify(c));
  assert.equal(c.exact,true);
  assert.deepEqual(c.sharedEdge.opponentUrgentCells,[cell(g,2,1)]);
  assert.equal(c.sharedEdge.controllerResidualContracted,true);
  assert.equal(c.sharedEdge.controllerResidualCompleted,false);
  assert.equal(c.sharedEdge.controllerTerminal,null);
  assert.deepEqual(c.sharedEdge.postResponseOpponentSingletons,[]);
});

test('rejected 0.1 nonterminal fixture preserves transported-singleton falsifier',()=>{
  const g=createCpcxGeometry({columns:5,rows:4,connect:3}),
    p=buildCpcxPosition('215112',{geometry:g}),
    r=residual(p,0,'B1-C2-D3'),
    c=certifyCpcxSupportReleaseSharedAcquisitionBlock(p,{
      controllerResidual:r,
      targetCell:cell(g,2,1),
      controllerActionCell:cell(g,4,1),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'POST_SHARED_DISCHARGE_P1_SINGLETON');
  assert.deepEqual(c.cells,[cell(g,2,2)]); // C3
});

test('urgent singleton on a different cell fails shared-cell guard',()=>{
  const g=createCpcxGeometry({columns:7,rows:3,connect:3}),
    p=buildCpcxPosition('322531',{geometry:g}),
    r=residual(p,0,'B2-C2-D2'),
    c=certifyCpcxSupportReleaseSharedAcquisitionBlock(p,{
      controllerResidual:r,
      targetCell:cell(g,3,1), // D2
      controllerActionCell:cell(g,6,0), // G1
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SHARED_URGENT_CELL_MISMATCH');
  assert.deepEqual(c.urgentCells,[cell(g,5,0)]); // F1
});

test('pinned action that supplies the target is rejected',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('24414112',{geometry:g}),
    r=residual(p,0,'B1-C2-D3'),
    c=certifyCpcxSupportReleaseSharedAcquisitionBlock(p,{
      controllerResidual:r,
      targetCell:cell(g,2,1),
      controllerActionCell:cell(g,2,0), // C1
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'PINNED_CONTROLLER_ACTION_SUPPLIES_TARGET');
});

test('shared acquisition/block theorem is generic and solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-support-release-shared-acquisition-block.mjs',import.meta.url),
    'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'Class C',
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
