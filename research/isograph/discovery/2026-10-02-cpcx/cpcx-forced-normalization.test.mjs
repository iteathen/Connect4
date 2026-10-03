import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxProtectedResidualForcedNormalization,
} from './cpcx-forced-normalization.mjs';

const g=createCpcxGeometry();

function residual(position,player,lineLabel){
  const row=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(row,lineLabel);
  return row;
}

test('fresh forced response may be a protected support stutter',()=>{
  const p=buildCpcxPosition('53252725434454377',{geometry:g}),
    r=residual(p,0,'A1-A2-A3-A4'),
    c=certifyCpcxProtectedResidualForcedNormalization(p,{
      protectedResidual:r,
    });
  assert.equal(c.kind,'PROTECTED_RESIDUAL_FORCED_NORMALIZATION');
  assert.equal(c.exact,true);
  assert.equal(c.rankDelta,1);
  assert.equal(c.steps.length,1);
  assert.equal(c.steps[0].kind,'SUPPORT_STUTTER');
  assert.equal(c.supportDebtDelta,0);
  assert.deepEqual(c.finalMissingCells,c.sourceMissingCells);
  assert.equal(c.finalPosition.mover,0);
});

test('fresh forced response may advance support without changing ancestry',()=>{
  const p=buildCpcxPosition('53252725434454377',{geometry:g}),
    r=residual(p,0,'A5-B5-C5-D5'),
    c=certifyCpcxProtectedResidualForcedNormalization(p,{
      protectedResidual:r,
    });
  assert.equal(c.kind,'PROTECTED_RESIDUAL_FORCED_NORMALIZATION');
  assert.equal(c.steps.length,1);
  assert.equal(c.steps[0].kind,'SUPPORT_ADVANCE');
  assert.equal(c.steps[0].supportDebtDelta,-1);
  assert.equal(c.supportDebtDelta,-1);
  assert.deepEqual(c.sourceSupportVector,[4,1,1,0]);
  assert.deepEqual(c.finalSupportVector,[4,0,1,0]);
});

test('controller forced response may contract the protected residual',()=>{
  const p=buildCpcxPosition('22235465617426',{geometry:g}),
    r=residual(p,0,'B1-C2-D3-E4'),
    c=certifyCpcxProtectedResidualForcedNormalization(p,{
      protectedResidual:r,
    });
  assert.equal(c.kind,'PROTECTED_RESIDUAL_FORCED_NORMALIZATION');
  assert.equal(c.steps.length,1);
  assert.equal(c.steps[0].kind,'RESIDUAL_CONTRACTION');
  assert.deepEqual(c.sourceMissingCells,[9,17,25]);
  assert.deepEqual(c.finalMissingCells,[17,25]);
  assert.equal(c.sourceMissingCount,3);
  assert.equal(c.finalMissingCount,2);
  assert.equal(c.finalPosition.mover,1);
});

test('multi-step deterministic normalization is composed without branching',()=>{
  const p=buildCpcxPosition('72176435157367',{geometry:g}),
    r=residual(p,0,'A1-A2-A3-A4'),
    c=certifyCpcxProtectedResidualForcedNormalization(p,{
      protectedResidual:r,
    });
  assert.equal(c.kind,'PROTECTED_RESIDUAL_FORCED_NORMALIZATION');
  assert.equal(c.exact,true);
  assert.equal(c.rankDelta,2);
  assert.deepEqual(c.steps.map(x=>x.kind),[
    'SUPPORT_STUTTER',
    'SUPPORT_STUTTER',
  ]);
  assert.equal(c.finalPosition.mover,0);
  assert.equal(c.supportDebtDelta,0);
});

test('forced opponent occupation of a protected target fails closed',()=>{
  const p=buildCpcxPosition('53252725434454377',{geometry:g}),
    r=residual(p,0,'B1-B2-B3-B4'),
    c=certifyCpcxProtectedResidualForcedNormalization(p,{
      protectedResidual:r,
    });
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'OPPONENT_KILLS_PROTECTED_RESIDUAL');
});

test('normalization may end at an exact controller immediate terminal',()=>{
  const p=buildCpcxPosition('73423656643221431',{geometry:g}),
    r=residual(p,0,'D1-E2-F3-G4'),
    c=certifyCpcxProtectedResidualForcedNormalization(p,{
      protectedResidual:r,
    });
  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.exact,true);
  assert.equal(c.player,0);
  assert.equal(c.source,'NORMALIZED_CONTROLLER_IMMEDIATE_TERMINAL');
  assert.equal(c.rankDelta,1);
});

test('protected forced normalization remains search and production isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-forced-normalization.mjs',import.meta.url),
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
