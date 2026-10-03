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

function residual(position,player,lineLabel){
  const r=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(r,lineLabel);
  return r;
}

test('fresh one-step saturation stops at the first open opponent boundary',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,0,'A3-B2-C1'),
    c=certifyCpcxProtectedDiagonalControllerSaturation(p,{
      protectedResidual:r,
    });

  assert.equal(c.kind,'PROTECTED_DIAGONAL_CONTROLLER_SATURATION');
  assert.equal(c.exact,true);
  assert.equal(c.controller,0);
  assert.equal(c.finalPosition.mover,1);
  assert.equal(c.finalBoundary.kind,'NO_IMMEDIATE_OBLIGATION');
  assert.equal(c.controllerStepCount,1);
  assert.equal(c.normalizationPassCount,0);
  assert.equal(c.forcedEventCount,0);
  assert.deepEqual(c.sourceMeasure,[3,3]);
  assert.deepEqual(c.finalMeasure,[3,2]);
  assert.equal(c.strictMeasureDecrease,true);
});

test('fresh forced response is normalized and returns control for further descent',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('11',{geometry:g}),
    r=residual(p,0,'B4-C3-D2'),
    c=certifyCpcxProtectedDiagonalControllerSaturation(p,{
      protectedResidual:r,
    });

  assert.equal(c.kind,'PROTECTED_DIAGONAL_CONTROLLER_SATURATION');
  assert.equal(c.exact,true);
  assert.equal(c.finalPosition.mover,1);
  assert.equal(c.finalBoundary.kind,'NO_IMMEDIATE_OBLIGATION');
  assert.equal(c.controllerStepCount,3);
  assert.equal(c.normalizationPassCount,2);
  assert.equal(c.forcedEventCount,2);
  assert.deepEqual(c.sourceMeasure,[3,6]);
  assert.deepEqual(c.finalMeasure,[2,2]);

  const controllerRows=c.trace.filter(x=>x.kind==='CONTROLLER_DESCENT'),
    normalizationRows=c.trace.filter(x=>x.kind==='FORCED_NORMALIZATION');
  assert.equal(controllerRows.length,3);
  assert.equal(normalizationRows.length,2);
  assert.equal(controllerRows[0].boundary.kind,'FORCED_RESPONSE');
  assert.equal(normalizationRows[0].stepCount,1);
  assert.equal(normalizationRows[0].finalMover,0);
  assert.ok(controllerRows[1].sourceMeasure[1]<
    controllerRows[0].sourceMeasure[1]);
});

test('saturation terminates directly when the deterministic highest target wins',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('312124',{geometry:g}),
    r=residual(p,0,'A3-B2-C1'),
    c=certifyCpcxProtectedDiagonalControllerSaturation(p,{
      protectedResidual:r,
    });

  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.exact,true);
  assert.equal(c.player,0);
  assert.equal(c.source,'HIGHEST_TARGET_DESCENT');
  assert.equal(c.controllerStepCount,1);
  assert.equal(c.certificate.kind,'CERTIFIED_FIRST_WIN');
});

test('saturation fails closed when highest-target support releases an opponent singleton',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('2432637446',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedDiagonalControllerSaturation(p,{
      protectedResidual:r,
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.exact,false);
  assert.equal(c.seam,'HIGHEST_TARGET_DESCENT_FAILED');
  assert.equal(c.descent.seam,'HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON');
});

test('controller saturation is generic and production/solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-controller-saturation.mjs',import.meta.url),
    'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'U1',
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
  assert.match(source,/certifyCpcxProtectedResidualForcedNormalization/);
});
