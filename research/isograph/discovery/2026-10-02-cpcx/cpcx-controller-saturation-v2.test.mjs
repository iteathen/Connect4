import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxProtectedDiagonalControllerSaturation,
} from './cpcx-controller-saturation.mjs';
import {
  certifyCpcxProtectedDiagonalControllerSaturationV2,
} from './cpcx-controller-saturation-v2.mjs';

function residual(position,player,lineLabel){
  const r=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(r,lineLabel);
  return r;
}

function physicalKey(p){
  return JSON.stringify({
    rank:p.rank,
    mover:p.mover,
    heights:Array.from(p.heights),
    owner:Array.from(p.owner),
    terminal:p.terminal,
  });
}

test('v0.2 preserves ordinary one-step v0.1 saturation exactly',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,0,'A3-B2-C1'),
    a=certifyCpcxProtectedDiagonalControllerSaturation(p,{
      protectedResidual:r,
    }),
    b=certifyCpcxProtectedDiagonalControllerSaturationV2(p,{
      protectedResidual:r,
    });

  assert.equal(a.kind,'PROTECTED_DIAGONAL_CONTROLLER_SATURATION');
  assert.equal(b.kind,'PROTECTED_DIAGONAL_CONTROLLER_SATURATION_V2');
  assert.equal(a.exact,true);
  assert.equal(b.exact,true);
  assert.equal(physicalKey(a.finalPosition),physicalKey(b.finalPosition));
  assert.deepEqual(a.finalResidual.missingCells,b.finalResidual.missingCells);
  assert.deepEqual(a.finalMeasure,b.finalMeasure);
  assert.equal(b.trace.some(x=>
    x.kind==='CONTROLLER_PLAYABLE_TARGET_FALLBACK'
  ),false);
});

test('v0.2 preserves forced-normalization multi-step v0.1 saturation',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('11',{geometry:g}),
    r=residual(p,0,'B4-C3-D2'),
    a=certifyCpcxProtectedDiagonalControllerSaturation(p,{
      protectedResidual:r,
    }),
    b=certifyCpcxProtectedDiagonalControllerSaturationV2(p,{
      protectedResidual:r,
    });

  assert.equal(a.exact,true);
  assert.equal(b.exact,true);
  assert.equal(physicalKey(a.finalPosition),physicalKey(b.finalPosition));
  assert.deepEqual(a.finalResidual.missingCells,b.finalResidual.missingCells);
  assert.deepEqual(a.finalMeasure,b.finalMeasure);
  assert.equal(b.normalizationPassCount,a.normalizationPassCount);
});

test('v0.2 repairs qualified poison-release seam through playable target',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('23355162534364',{geometry:g}),
    r=residual(p,0,'A3-B4-C5-D6'),
    old=certifyCpcxProtectedDiagonalControllerSaturation(p,{
      protectedResidual:r,
    }),
    c=certifyCpcxProtectedDiagonalControllerSaturationV2(p,{
      protectedResidual:r,
    });

  assert.equal(old.kind,'NO_CERTIFICATE');
  assert.equal(old.seam,'HIGHEST_TARGET_DESCENT_FAILED');
  assert.equal(old.descent.seam,'HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON');

  assert.equal(c.kind,'PROTECTED_DIAGONAL_CONTROLLER_SATURATION_V2');
  assert.equal(c.exact,true);
  assert.equal(c.finalPosition.mover,1);
  assert.equal(c.finalBoundary.kind,'NO_IMMEDIATE_OBLIGATION');
  assert.ok(c.trace.some(x=>
    x.kind==='CONTROLLER_PLAYABLE_TARGET_FALLBACK'
  ));
  const row=c.trace.find(x=>
    x.kind==='CONTROLLER_PLAYABLE_TARGET_FALLBACK'
  );
  assert.ok(row);
  assert.equal(row.selectedMode,'PLAYABLE_TARGET_FALLBACK');
  assert.ok(c.finalMeasure[0]<c.sourceMeasure[0]||
    c.finalMeasure[1]<c.sourceMeasure[1]);
});

test('v0.2 preserves direct controller first win',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('312124',{geometry:g}),
    r=residual(p,0,'A3-B2-C1'),
    c=certifyCpcxProtectedDiagonalControllerSaturationV2(p,{
      protectedResidual:r,
    });
  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.exact,true);
  assert.equal(c.player,0);
});

test('controller saturation v0.2 remains generic and isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-controller-saturation-v2.mjs',import.meta.url),
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
  assert.match(source,/certifyCpcxProtectedDiagonalHighestTargetDescent/);
  assert.match(source,/certifyCpcxProtectedDiagonalPlayableTargetFallback/);
  assert.match(source,/certifyCpcxProtectedResidualForcedNormalization/);
});
