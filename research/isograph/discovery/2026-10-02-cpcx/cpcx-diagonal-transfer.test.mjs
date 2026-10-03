import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxProtectedResidualDiagonalTransfer,
} from './cpcx-diagonal-transfer.mjs';

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

test('fresh opponent target block transfers to a strictly smaller diagonal',()=>{
  const p=buildCpcxPosition('2424224',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedResidualDiagonalTransfer(p,{
      protectedResidual:r,
      blockedCell:cell('B5'),
    });
  assert.equal(p.mover,1);
  assert.equal(c.kind,'PROTECTED_RESIDUAL_DIAGONAL_TRANSFER');
  assert.equal(c.exact,true);
  assert.equal(c.source.lineLabel,'A6-B5-C4-D3');
  assert.deepEqual(c.source.tuple,[3,8]);
  assert.equal(c.transfer.lineLabel,'C4-D3-E2-F1');
  assert.deepEqual(c.transfer.tuple,[3,4]);
  assert.deepEqual(
    c.transfer.overlapCells.map(x=>x%g.columns).sort((a,b)=>a-b),
    [2,3]
  );
  assert.equal(c.transfer.overlapCount,2);
  assert.deepEqual(
    c.transfer.currentlyPlayableCells.map(x=>x%g.columns),
    [5]
  );
  assert.equal(c.strictTupleDecrease,true);
  assert.equal(c.sourceKilled,true);
  assert.equal(c.child.mover,0);
});

test('transfer fails closed when the required overlap is unavailable',()=>{
  const p=buildCpcxPosition('2424224',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedResidualDiagonalTransfer(p,{
      protectedResidual:r,
      blockedCell:cell('B5'),
      minOverlap:3,
    });
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'NO_STRICTLY_LOWER_DIAGONAL_TRANSFER');
});

test('non-protected current event is not a transfer block',()=>{
  const p=buildCpcxPosition('2424224',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedResidualDiagonalTransfer(p,{
      protectedResidual:r,
      blockedCell:cell('F1'),
    });
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'BLOCK_NOT_PROTECTED_TARGET');
});

test('diagonal transfer remains search and production isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-diagonal-transfer.mjs',import.meta.url),
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
