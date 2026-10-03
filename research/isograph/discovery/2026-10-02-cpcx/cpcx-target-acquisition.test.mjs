import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxProtectedResidualTargetAcquisition,
} from './cpcx-target-acquisition.mjs';

const g=createCpcxGeometry();

function residual(position,player,lineLabel){
  const r=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(r,lineLabel);
  return r;
}
function cell(label){
  return (Number(label.slice(1))-1)*g.columns+(label.charCodeAt(0)-65);
}

test('fresh playable protected target contracts cardinality by one',()=>{
  const p=buildCpcxPosition('41',{geometry:g}),
    r=residual(p,0,'D1-E1-F1-G1'),
    c=certifyCpcxProtectedResidualTargetAcquisition(p,{
      controllerResidual:r,
      targetCell:cell('E1'),
    });
  assert.equal(c.kind,'PROTECTED_RESIDUAL_TARGET_ACQUISITION');
  assert.equal(c.exact,true);
  assert.equal(c.missingCountDelta,-1);
  assert.equal(c.supportDebtDelta,0);
  assert.equal(c.sourceMissingCount,3);
  assert.equal(c.childMissingCount,2);
  assert.deepEqual(c.sourceMissingCells.map(x=>x%g.columns),[4,5,6]);
  assert.deepEqual(c.childMissingCells.map(x=>x%g.columns),[5,6]);
  assert.equal(c.child.mover,1);
});

test('protected target acquisition may directly complete the line',()=>{
  const p=buildCpcxPosition('417263',{geometry:g}),
    r=residual(p,0,'D1-E1-F1-G1'),
    c=certifyCpcxProtectedResidualTargetAcquisition(p,{
      controllerResidual:r,
      targetCell:cell('E1'),
    });
  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.exact,true);
  assert.equal(c.player,0);
  assert.equal(c.source,'PROTECTED_TARGET_COMPLETION');
  assert.equal(c.finalMissingCount,0);
});

test('non-protected target fails closed',()=>{
  const p=buildCpcxPosition('41',{geometry:g}),
    r=residual(p,0,'D1-E1-F1-G1'),
    c=certifyCpcxProtectedResidualTargetAcquisition(p,{
      controllerResidual:r,
      targetCell:cell('D2'),
    });
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'TARGET_NOT_IN_PROTECTED_RESIDUAL');
});

test('target acquisition remains search and production isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-target-acquisition.mjs',import.meta.url),
    'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
