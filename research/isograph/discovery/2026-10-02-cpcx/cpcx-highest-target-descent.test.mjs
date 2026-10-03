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

const g=createCpcxGeometry();

function residual(position,player,lineLabel){
  const row=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(row,lineLabel);
  return row;
}

test('fresh playable highest diagonal target contracts the protected residual',()=>{
  const p=buildCpcxPosition('1112',{geometry:g}),
    r=residual(p,0,'A4-B3-C2-D1'),
    c=certifyCpcxProtectedDiagonalHighestTargetDescent(p,{
      protectedResidual:r,
    });

  assert.equal(c.kind,'PROTECTED_DIAGONAL_HIGHEST_TARGET_DESCENT');
  assert.equal(c.exact,true);
  assert.equal(c.selectedMode,'TARGET_ACQUISITION');
  assert.equal(c.selectedTarget,3*g.columns+0); // A4
  assert.deepEqual(c.sourceMeasure,[4,2]);
  assert.deepEqual(c.childMeasure,[3,2]);
  assert.equal(c.strictMeasureDecrease,true);
  assert.equal(c.childResidual.lineLabel,'A4-B3-C2-D1');
});

test('fresh support-hidden highest target uses one exact local-safe support descent',()=>{
  const p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,0,'A4-B3-C2-D1'),
    c=certifyCpcxProtectedDiagonalHighestTargetDescent(p,{
      protectedResidual:r,
    });

  assert.equal(c.kind,'PROTECTED_DIAGONAL_HIGHEST_TARGET_DESCENT');
  assert.equal(c.exact,true);
  assert.equal(c.selectedMode,'SUPPORT_ADVANCE');
  assert.equal(c.selectedTarget,3*g.columns+0); // A4
  assert.equal(c.actionCell,0); // A1
  assert.deepEqual(c.sourceMeasure,[4,6]);
  assert.deepEqual(c.childMeasure,[4,5]);
  assert.equal(c.strictMeasureDecrease,true);
  assert.equal(c.localSafety.kind,'HIGHEST_TARGET_LOCAL_SAFETY');
  assert.equal(c.localSafety.hazards.length,0);
  assert.ok(c.localSafety.lineWitnesses.length>0);
  assert.ok(c.localSafety.lineWitnesses.every(x=>
    x.classification==='CONTROLLER_BLOCKED'||
    x.classification==='NOT_SINGLETON'
  ));
});

test('highest support descent fails closed when the released cell is an opponent singleton',()=>{
  const p=buildCpcxPosition('2432637446',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedDiagonalHighestTargetDescent(p,{
      protectedResidual:r,
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.exact,false);
  assert.equal(c.seam,'HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON');
  assert.equal(c.selectedTarget,5*g.columns+0); // A6
  assert.equal(c.actionCell,0); // A1
  assert.equal(c.releasedCell,g.columns); // A2
  assert.ok(c.hazards.some(x=>
    x.lineLabel==='A2-B2-C2-D2'&&
    x.classification==='OPPONENT_SINGLETON'
  ));
});

test('higher-precedence forced response is not bypassed by highest-target descent',()=>{
  const p=buildCpcxPosition('111111223',{geometry:g}),
    r=scanCpcxObligations(p).find(o=>
      o.player===p.mover&&
      (o.orientation==='D+'||o.orientation==='D-')
    );
  assert.ok(r);
  const c=certifyCpcxProtectedDiagonalHighestTargetDescent(p,{
    protectedResidual:r,
  });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SOURCE_IMMEDIATE_PRECEDENCE');
  assert.equal(c.boundary.kind,'FORCED_RESPONSE');
  assert.equal(c.boundary.cell,3); // D1
});

test('non-diagonal protected residual is rejected',()=>{
  const p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,0,'A1-B1-C1-D1'),
    c=certifyCpcxProtectedDiagonalHighestTargetDescent(p,{
      protectedResidual:r,
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SOURCE_NOT_DIAGONAL');
});

test('highest-target implementation is generic and production/solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-highest-target-descent.mjs',import.meta.url),
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
});
