import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxProtectedDiagonalOpponentResponseEventV2,
  certifyCpcxProtectedDiagonalOpponentResponseDescentV2,
} from './cpcx-opponent-response-descent-v2.mjs';

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

test('v0.2 preserves fresh response-total anchored boundary',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('2244422',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedDiagonalOpponentResponseDescentV2(p,{
      protectedResidual:r,
    });
  if(c.kind!=='PROTECTED_DIAGONAL_OPPONENT_RESPONSE_DESCENT_V2')
    assert.fail(JSON.stringify(c));
  assert.equal(c.exact,true);
  assert.equal(c.allCurrentOpponentEventsCovered,true);
  assert.equal(c.everyEventWinsOrStrictlyDescends,true);
});

test('v0.2 preserves fresh same-track target-block descent',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('11111',{geometry:g}),
    r=residual(p,0,'B4-C3-D2-E1'),
    c=certifyCpcxProtectedDiagonalOpponentResponseEventV2(p,{
      protectedResidual:r,
      eventCell:cell(g,'E1'),
    });
  assert.equal(c.exact,true);
  assert.ok([
    'CERTIFIED_FIRST_WIN',
    'PROTECTED_DIAGONAL_OPPONENT_RESPONSE_EVENT_DESCENT_V2',
  ].includes(c.kind));
  if(c.kind==='PROTECTED_DIAGONAL_OPPONENT_RESPONSE_EVENT_DESCENT_V2')
    assert.equal(c.transportKind,'SAME_TRACK');
});

test('v0.2 preserves fresh anchor-pivot target-block descent',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('2244422',{geometry:g}),
    r=residual(p,0,'A6-B5-C4-D3'),
    c=certifyCpcxProtectedDiagonalOpponentResponseEventV2(p,{
      protectedResidual:r,
      eventCell:cell(g,'B5'),
    });
  assert.equal(c.exact,true);
  assert.ok([
    'CERTIFIED_FIRST_WIN',
    'PROTECTED_DIAGONAL_OPPONENT_RESPONSE_EVENT_DESCENT_V2',
  ].includes(c.kind));
  if(c.kind==='PROTECTED_DIAGONAL_OPPONENT_RESPONSE_EVENT_DESCENT_V2')
    assert.equal(c.transportKind,'ANCHOR_PIVOT');
});

test('fresh strict target-inheritance block composes through v0.2 closure',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('12222',{geometry:g}),
    r=residual(p,0,'B4-C3-D2-E1'),
    c=certifyCpcxProtectedDiagonalOpponentResponseEventV2(p,{
      protectedResidual:r,
      eventCell:cell(g,'E1'),
    });
  if(!c.exact)assert.fail(JSON.stringify(c));
  assert.ok([
    'CERTIFIED_FIRST_WIN',
    'PROTECTED_DIAGONAL_OPPONENT_RESPONSE_EVENT_DESCENT_V2',
  ].includes(c.kind));
  if(c.kind==='PROTECTED_DIAGONAL_OPPONENT_RESPONSE_EVENT_DESCENT_V2'){
    assert.equal(c.transportKind,'TARGET_INHERITANCE');
    assert.equal(c.strictExtendedMeasureDecrease,true);
    assert.equal(c.transportDetail.kind,
      'PROTECTED_DIAGONAL_TARGET_INHERITANCE_HANDOFF');
  }
});

test('v0.2 preserves source immediate precedence',()=>{
  const g=createCpcxGeometry(),
    p=buildCpcxPosition('111111223',{geometry:g}),
    r=scanCpcxObligations(p).find(o=>
      o.player===0&&(o.orientation==='D+'||o.orientation==='D-')
    );
  assert.ok(r);
  const c=certifyCpcxProtectedDiagonalOpponentResponseDescentV2(p,{
    protectedResidual:r,
  });
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SOURCE_IMMEDIATE_PRECEDENCE');
});

test('v0.2 response descent is generic and isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-opponent-response-descent-v2.mjs',import.meta.url),
    'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'U30',
    'U45',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
  assert.match(source,/certifyCpcxProtectedResidualDiagonalTransfer/);
  assert.match(source,/certifyCpcxProtectedDiagonalAnchorPivot/);
  assert.match(source,/certifyCpcxProtectedDiagonalTargetInheritanceHandoff/);
  assert.match(source,/certifyCpcxProtectedDiagonalControllerSaturationV2/);
});
