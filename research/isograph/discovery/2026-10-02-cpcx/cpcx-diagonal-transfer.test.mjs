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
  return (Number(label.slice(1))-1)*g.columns+
    (label.charCodeAt(0)-65);
}

test('fresh same-track target block transfers with strict cardinality descent',()=>{
  const p=buildCpcxPosition('11111',{geometry:g}),
    r=residual(p,0,'B4-C3-D2-E1'),
    c=certifyCpcxProtectedResidualDiagonalTransfer(p,{
      protectedResidual:r,
      blockedCell:cell('E1'),
    });

  assert.equal(p.mover,1);
  assert.equal(c.kind,'PROTECTED_DIAGONAL_TRACK_TRANSFER');
  assert.equal(c.exact,true);
  assert.equal(c.source.lineLabel,'B4-C3-D2-E1');
  assert.deepEqual(c.source.tuple,[4,6]);
  assert.equal(c.transfer.lineLabel,'A5-B4-C3-D2');
  assert.deepEqual(c.transfer.tuple,[3,6]);
  assert.equal(c.source.track,c.transfer.track);
  assert.equal(c.source.orientation,c.transfer.orientation);
  assert.deepEqual(
    c.transfer.overlapCells.map(x=>x%g.columns).sort((a,b)=>a-b),
    [1,2,3]
  );
  assert.equal(c.transfer.overlapCount,3);
  assert.equal(c.strictTupleDecrease,true);
  assert.equal(c.sourceCofactorKilled,true);
  assert.equal(c.child.mover,0);
});

test('same-track survivors fail closed when none has a smaller tuple',()=>{
  const p=buildCpcxPosition('111',{geometry:g}),
    r=residual(p,0,'B1-C2-D3-E4'),
    c=certifyCpcxProtectedResidualDiagonalTransfer(p,{
      protectedResidual:r,
      blockedCell:cell('B1'),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'NO_STRICTLY_LOWER_SAME_TRACK_TRANSFER');
});

test('non-diagonal protected source is rejected',()=>{
  const p=buildCpcxPosition('417',{geometry:g}),
    r=residual(p,0,'D1-E1-F1-G1'),
    c=certifyCpcxProtectedResidualDiagonalTransfer(p,{
      protectedResidual:r,
      blockedCell:cell('E1'),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SOURCE_NOT_DIAGONAL');
});

test('non-protected current event is not a transfer block',()=>{
  const p=buildCpcxPosition('11111',{geometry:g}),
    r=residual(p,0,'B4-C3-D2-E1'),
    c=certifyCpcxProtectedResidualDiagonalTransfer(p,{
      protectedResidual:r,
      blockedCell:cell('F1'),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'BLOCK_NOT_PROTECTED_TARGET');
});

test('opponent terminal on a protected target rejects transfer',()=>{
  const p=buildCpcxPosition('1121212',{geometry:g}),
    r=residual(p,0,'A5-B4-C3-D2'),
    c=certifyCpcxProtectedResidualDiagonalTransfer(p,{
      protectedResidual:r,
      blockedCell:cell('A5'),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'BLOCK_EVENT_TERMINAL');
  assert.equal(c.terminal.player,1);
});

test('diagonal transfer remains generic and search/production isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-diagonal-transfer.mjs',import.meta.url),
    'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'U2',
    'A6-B5-C4-D3',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
