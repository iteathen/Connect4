import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxProtectedDiagonalOpponentResponseEvent,
  certifyCpcxProtectedDiagonalOpponentResponseDescent,
} from './cpcx-opponent-response-descent.mjs';
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

function cell(g,label){
  return (Number(label.slice(1))-1)*g.columns+
    (label.charCodeAt(0)-65);
}

test('fresh anchored standard-board boundary has total strict response descent',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('2244422',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedDiagonalOpponentResponseDescent(p,{
      protectedResidual:r,
    });

  assert.equal(p.mover,1);
  if(c.kind!=='PROTECTED_DIAGONAL_OPPONENT_RESPONSE_DESCENT')
    assert.fail(JSON.stringify(c));
  assert.equal(c.exact,true);
  assert.equal(c.allCurrentOpponentEventsCovered,true);
  assert.equal(c.everyEventWinsOrStrictlyDescends,true);
});

test('controller-saturation output is not automatically response-total outside the admitted band',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,0,'A3-B2-C1'),
    saturation=certifyCpcxProtectedDiagonalControllerSaturation(p,{
      protectedResidual:r,
    });

  assert.equal(saturation.kind,'PROTECTED_DIAGONAL_CONTROLLER_SATURATION');
  assert.equal(saturation.exact,true);
  const c=certifyCpcxProtectedDiagonalOpponentResponseDescent(
    saturation.finalPosition,{
      protectedResidual:saturation.finalResidual,
    }
  );
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'OPPONENT_RESPONSE_TOTALITY_FAILED');
});

test('arbitrary hidden diagonal outside the saturation domain may fail closed',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('1',{geometry:g}),
    r=residual(p,0,'A1-B2-C3'),
    c=certifyCpcxProtectedDiagonalOpponentResponseDescent(p,{
      protectedResidual:r,
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'OPPONENT_RESPONSE_TOTALITY_FAILED');
  assert.ok(c.failures.some(x=>
    x.seam==='DETERMINISTIC_CONTROLLER_CLOSURE_FAILED'
  ));
});

test('fresh same-track protected-target block closes through exact descent stack',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('11111',{geometry:g}),
    r=residual(p,0,'B4-C3-D2-E1'),
    c=certifyCpcxProtectedDiagonalOpponentResponseEvent(p,{
      protectedResidual:r,
      eventCell:cell(g,'E1'),
    });

  assert.equal(p.mover,1);
  assert.equal(c.exact,true);
  assert.ok([
    'CERTIFIED_FIRST_WIN',
    'PROTECTED_DIAGONAL_OPPONENT_RESPONSE_EVENT_DESCENT',
  ].includes(c.kind));
  if(c.kind==='PROTECTED_DIAGONAL_OPPONENT_RESPONSE_EVENT_DESCENT'){
    assert.equal(c.transportKind,'SAME_TRACK');
    assert.equal(c.strictExtendedMeasureDecrease,true);
  }
});

test('fresh anchor-pivot protected-target block closes through exact descent stack',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('2244422',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedDiagonalOpponentResponseEvent(p,{
      protectedResidual:r,
      eventCell:cell(g,'B5'),
    });

  assert.equal(p.mover,1);
  assert.equal(c.exact,true);
  assert.ok([
    'CERTIFIED_FIRST_WIN',
    'PROTECTED_DIAGONAL_OPPONENT_RESPONSE_EVENT_DESCENT',
  ].includes(c.kind));
  if(c.kind==='PROTECTED_DIAGONAL_OPPONENT_RESPONSE_EVENT_DESCENT'){
    assert.equal(c.transportKind,'ANCHOR_PIVOT');
    assert.equal(c.strictExtendedMeasureDecrease,true);
  }
});

test('source immediate precedence is not bypassed',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('111111223',{geometry:g}),
    r=scanCpcxObligations(p).find(o=>
      o.player===0&&(o.orientation==='D+'||o.orientation==='D-')
    );
  assert.ok(r);

  const c=certifyCpcxProtectedDiagonalOpponentResponseDescent(p,{
    protectedResidual:r,
  });
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SOURCE_IMMEDIATE_PRECEDENCE');
});

test('opponent terminal protected-target event fails closed',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('1121212',{geometry:g}),
    r=residual(p,0,'A5-B4-C3-D2'),
    c=certifyCpcxProtectedDiagonalOpponentResponseEvent(p,{
      protectedResidual:r,
      eventCell:cell(g,'A5'),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.exact,false);
  assert.equal(c.seam,'PROTECTED_TARGET_TRANSFER_FAILED');
});

test('opponent-response descent remains generic and search/production isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-opponent-response-descent.mjs',import.meta.url),
    'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'U1',
    'U45',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
  assert.match(source,/certifyCpcxProtectedResidualSupportTransition/);
  assert.match(source,/certifyCpcxProtectedResidualDiagonalTransfer/);
  assert.match(source,/certifyCpcxProtectedDiagonalAnchorPivot/);
  assert.match(source,/certifyCpcxProtectedDiagonalControllerSaturation/);
});
