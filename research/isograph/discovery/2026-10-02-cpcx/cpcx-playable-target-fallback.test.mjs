import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxProtectedDiagonalHighestTargetDescent,
} from './cpcx-highest-target-descent.mjs';
import {
  certifyCpcxProtectedDiagonalPlayableTargetFallback,
} from './cpcx-playable-target-fallback.mjs';

const g=createCpcxGeometry();

function byLine(position,player,lineLabel){
  const r=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(r,lineLabel);
  return r;
}
function label(cell){
  const column=cell%g.columns,row=Math.floor(cell/g.columns);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

test('fresh poisoned highest target falls back to safe playable target',()=>{
  const p=buildCpcxPosition('23355162534364',{geometry:g}),
    source=byLine(p,0,'A3-B4-C5-D6'),
    highest=certifyCpcxProtectedDiagonalHighestTargetDescent(p,{
      protectedResidual:source,
    });

  assert.equal(highest.kind,'NO_CERTIFICATE');
  assert.equal(highest.seam,'HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON');
  assert.equal(label(highest.selectedTarget),'D6');
  assert.equal(label(highest.releasedCell),'D4');

  const c=certifyCpcxProtectedDiagonalPlayableTargetFallback(p,{
    protectedResidual:source,
  });
  assert.equal(c.kind,'PROTECTED_DIAGONAL_PLAYABLE_TARGET_FALLBACK');
  assert.equal(c.exact,true);
  assert.equal(label(c.fallbackTarget),'C5');
  assert.equal(c.sourceMeasure[0],4);
  assert.equal(c.childMeasure[0],3);
  assert.equal(c.strictMeasureDecrease,true);
  assert.equal(c.childResidual.lineLabel,'A3-B4-C5-D6');
  assert.equal(c.childResidual.missingCount,3);
});

test('fallback rejects when ordinary highest-target descent is already exact',()=>{
  const p=buildCpcxPosition('',{geometry:g}),
    source=byLine(p,0,'A1-B2-C3-D4'),
    highest=certifyCpcxProtectedDiagonalHighestTargetDescent(p,{
      protectedResidual:source,
    });
  assert.equal(highest.exact,true);

  const c=certifyCpcxProtectedDiagonalPlayableTargetFallback(p,{
    protectedResidual:source,
  });
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'HIGHEST_TARGET_POLICY_ALREADY_EXACT');
});

test('fallback rejects non-diagonal protected residuals',()=>{
  const p=buildCpcxPosition('',{geometry:g}),
    source=byLine(p,0,'A1-B1-C1-D1'),
    c=certifyCpcxProtectedDiagonalPlayableTargetFallback(p,{
      protectedResidual:source,
    });
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SOURCE_NOT_DIAGONAL');
});

test('playable-target fallback is generic and search/solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-playable-target-fallback.mjs',import.meta.url),
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
