import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxProtectedDiagonalAnchorPivot,
} from './cpcx-diagonal-anchor-pivot.mjs';

const g=createCpcxGeometry();

function cell(label){
  return (Number(label.slice(1))-1)*g.columns+
    (label.charCodeAt(0)-65);
}
function residual(position,player,lineLabel){
  const r=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(r,lineLabel);
  return r;
}

test('fresh anchor pivot has strict protected-tuple descent',()=>{
  const p=buildCpcxPosition('2244422',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedDiagonalAnchorPivot(p,{
      protectedResidual:r,
      blockedCell:cell('B5'),
    });

  assert.equal(p.mover,1);
  assert.equal(c.kind,'PROTECTED_DIAGONAL_ANCHOR_PIVOT_TRANSFER');
  assert.equal(c.exact,true);
  assert.equal(c.anchorCell,cell('D3'));
  assert.deepEqual(c.source.tuple,[3,8]);
  assert.equal(c.pivot.lineLabel,'B1-C2-D3-E4');
  assert.deepEqual(c.pivot.tuple,[2,4]);
  assert.notEqual(c.source.orientation,c.pivot.orientation);
  assert.equal(c.protectedTupleNonincreasing,true);
  assert.equal(c.strictExtendedMeasureDecrease,true);
  assert.equal(c.childRemainingCapacity,c.sourceRemainingCapacity-1);
});

test('fresh equal-tuple pivot descends by remaining physical capacity',()=>{
  const p=buildCpcxPosition('724442223',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedDiagonalAnchorPivot(p,{
      protectedResidual:r,
      blockedCell:cell('B5'),
    });

  assert.equal(p.mover,1);
  assert.equal(c.kind,'PROTECTED_DIAGONAL_ANCHOR_PIVOT_TRANSFER');
  assert.equal(c.exact,true);
  assert.deepEqual(c.source.tuple,[3,7]);
  assert.equal(c.pivot.lineLabel,'C2-D3-E4-F5');
  assert.deepEqual(c.pivot.tuple,[3,7]);
  assert.deepEqual(c.extendedMeasure.source.slice(0,2),[3,7]);
  assert.deepEqual(c.extendedMeasure.child.slice(0,2),[3,7]);
  assert.equal(
    c.extendedMeasure.child[2],
    c.extendedMeasure.source[2]-1
  );
  assert.equal(c.strictExtendedMeasureDecrease,true);
});

test('source with multiple owned anchors is rejected',()=>{
  const p=buildCpcxPosition('122',{geometry:g}),
    r=residual(p,0,'A1-B2-C3-D4'),
    c=certifyCpcxProtectedDiagonalAnchorPivot(p,{
      protectedResidual:r,
      blockedCell:cell('C3'),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SOURCE_UNIQUE_ANCHOR_REQUIRED');
  assert.equal(c.anchorCells.length,2);
});

test('non-protected event is not an anchor-pivot block',()=>{
  const p=buildCpcxPosition('2244422',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedDiagonalAnchorPivot(p,{
      protectedResidual:r,
      blockedCell:cell('E1'),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'BLOCK_NOT_PROTECTED_TARGET');
});

test('opponent terminal on protected target rejects pivot',()=>{
  const p=buildCpcxPosition('144171716',{geometry:g}),
    r=residual(p,0,'A5-B4-C3-D2'),
    c=certifyCpcxProtectedDiagonalAnchorPivot(p,{
      protectedResidual:r,
      blockedCell:cell('A5'),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'BLOCK_EVENT_TERMINAL');
  assert.equal(c.terminal.player,1);
});

test('pivot candidates that increase protected tuple fail closed',()=>{
  const p=buildCpcxPosition('42214241217',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedDiagonalAnchorPivot(p,{
      protectedResidual:r,
      blockedCell:cell('B5'),
    });

  assert.deepEqual(
    [r.missingCount,r.events.reduce((n,e)=>n+e.supportDistance,0)],
    [3,5]
  );
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'NO_NONINCREASING_ANCHOR_PIVOT');
});

test('anchor-pivot implementation remains generic and search isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-diagonal-anchor-pivot.mjs',import.meta.url),
    'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'U30',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
