import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxProtectedDiagonalTargetInheritanceHandoff,
} from './cpcx-diagonal-target-inheritance.mjs';

const g=createCpcxGeometry();

function byLine(position,player,lineLabel){
  const r=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(r,lineLabel);
  return r;
}

function byLabel(s){
  return (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65);
}

test('fresh anchored diagonal block hands off 3->2 through inherited target',()=>{
  const p=buildCpcxPosition('12222',{geometry:g}),
    source=byLine(p,0,'B4-C3-D2-E1'),
    c=certifyCpcxProtectedDiagonalTargetInheritanceHandoff(p,{
      protectedResidual:source,
      blockedCell:byLabel('E1'),
    });

  assert.equal(c.kind,'PROTECTED_DIAGONAL_TARGET_INHERITANCE_HANDOFF');
  assert.equal(c.exact,true);
  assert.equal(c.controller,0);
  assert.equal(c.opponent,1);
  assert.equal(c.sourceResidual.missingCount,3);
  assert.equal(c.handoffResidual.lineLabel,'A1-B2-C3-D4');
  assert.equal(c.handoffResidual.missingCount,2);
  assert.deepEqual(c.inheritedTargets,[byLabel('C3')]);
  assert.equal(c.strictMeasureDecrease,true);
  assert.ok(c.childMeasure[0]<c.sourceMeasure[0]);
  assert.equal(c.child.terminal,null);
});

test('equal-cardinality overlapping diagonals do not qualify',()=>{
  const p=buildCpcxPosition('1',{geometry:g}),
    source=byLine(p,0,'B1-C2-D3-E4'),
    c=certifyCpcxProtectedDiagonalTargetInheritanceHandoff(p,{
      protectedResidual:source,
      blockedCell:byLabel('B1'),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.exact,false);
  assert.equal(c.seam,'NO_STRICT_TARGET_INHERITANCE_CANDIDATE');
});

test('first-terminal opponent block is rejected before handoff',()=>{
  const p=buildCpcxPosition('112131',{geometry:g}),
    source=byLine(p,1,'D1-E2-F3-G4'),
    c=certifyCpcxProtectedDiagonalTargetInheritanceHandoff(p,{
      protectedResidual:source,
      blockedCell:byLabel('D1'),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.exact,false);
  assert.equal(c.seam,'BLOCK_EVENT_TERMINAL');
  assert.equal(c.terminal.player,0);
});

test('hidden protected target cannot be used as block event',()=>{
  const p=buildCpcxPosition('12222',{geometry:g}),
    source=byLine(p,0,'B4-C3-D2-E1'),
    c=certifyCpcxProtectedDiagonalTargetInheritanceHandoff(p,{
      protectedResidual:source,
      blockedCell:byLabel('C3'),
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.exact,false);
  assert.equal(c.seam,'BLOCKED_TARGET_NOT_PLAYABLE');
});

test('target-inheritance implementation is generic and search/solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-diagonal-target-inheritance.mjs',import.meta.url),
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
