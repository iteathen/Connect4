import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxProtectedResidualSupportTransition,
} from './cpcx-support-transition.mjs';

const g=createCpcxGeometry();
const cell=(column,row=0)=>row*g.columns+column;

function residual(position,player,lineLabel){
  const r=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(r,lineLabel);
  return r;
}

test('fresh one-column support event decrements one protected target',()=>{
  const p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,0,'A2-B2-C2-D2'),
    c=certifyCpcxProtectedResidualSupportTransition(p,{
      protectedResidual:r,
      eventCell:cell(0,0),
    });

  assert.equal(c.kind,'PROTECTED_RESIDUAL_SUPPORT_TRANSITION');
  assert.equal(c.exact,true);
  assert.deepEqual(c.beforeSupport,[1,1,1,1]);
  assert.deepEqual(c.afterSupport,[0,1,1,1]);
  assert.equal(c.supportDebtDelta,-1);
  assert.equal(c.touchedTargetCount,1);
  assert.equal(c.supportStateStutter,false);
  assert.equal(c.residualCofactorUnchanged,true);
  assert.equal(c.relativeEventPhaseInvariant,true);
  assert.equal(c.projectedOwnerInvariant,true);
});

test('fresh external event is an exact support-state stutter',()=>{
  const p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,0,'A2-B2-C2-D2'),
    c=certifyCpcxProtectedResidualSupportTransition(p,{
      protectedResidual:r,
      eventCell:cell(6,0),
    });

  assert.equal(c.kind,'PROTECTED_RESIDUAL_SUPPORT_TRANSITION');
  assert.deepEqual(c.afterSupport,c.beforeSupport);
  assert.equal(c.supportDebtDelta,0);
  assert.equal(c.touchedTargetCount,0);
  assert.equal(c.supportStateStutter,true);
  assert.equal(c.globalEventPhaseFlip,1);
});

test('one support event decrements every protected target in its column',()=>{
  const p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,0,'A2-A3-A4-A5'),
    c=certifyCpcxProtectedResidualSupportTransition(p,{
      protectedResidual:r,
      eventCell:cell(0,0),
    });

  assert.equal(c.kind,'PROTECTED_RESIDUAL_SUPPORT_TRANSITION');
  assert.deepEqual(c.beforeSupport,[1,2,3,4]);
  assert.deepEqual(c.afterSupport,[0,1,2,3]);
  assert.equal(c.touchedTargetCount,4);
  assert.equal(c.supportDebtDelta,-4);
});

test('event occupying a protected target is rejected',()=>{
  const p=buildCpcxPosition('',{geometry:g}),
    r=residual(p,0,'A1-A2-A3-A4'),
    c=certifyCpcxProtectedResidualSupportTransition(p,{
      protectedResidual:r,
      eventCell:cell(0,0),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'EVENT_OCCUPIES_PROTECTED_TARGET');
});

test('terminal event stops before nonterminal support transport',()=>{
  const p=buildCpcxPosition('172736',{geometry:g}),
    r=residual(p,0,'E1-E2-E3-E4'),
    c=certifyCpcxProtectedResidualSupportTransition(p,{
      protectedResidual:r,
      eventCell:cell(3,0),
    });

  assert.equal(c.kind,'TERMINAL_EVENT');
  assert.equal(c.exact,true);
  assert.equal(c.terminal.player,0);
  assert.equal(c.nonterminalTransition,false);
  assert.equal(c.firstWinStopping,true);
  assert.equal(Object.prototype.hasOwnProperty.call(c,'afterSupport'),false);
});

test('support transition is generic and isolated from solver/production CPC',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-support-transition.mjs',import.meta.url),
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
});
