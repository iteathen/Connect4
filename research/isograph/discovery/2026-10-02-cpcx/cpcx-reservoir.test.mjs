import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {
  certifyCpcxTruncatedTargetReservoir,
  findCpcxTruncatedTargetReservoirCertificates,
} from './cpcx-reservoir.mjs';

const g=createCpcxGeometry();

test('qualified rank31 control reconstructs a CPCX truncated target-reservoir first-win certificate',()=>{
  const p=buildCpcxPosition('4444415666662322224233177555571',{geometry:g}),
    target=4*g.columns+2, // C5
    c=certifyCpcxTruncatedTargetReservoir(p,{attacker:0,targetCell:target});
  assert.equal(p.rank,31);
  assert.equal(p.mover,1);
  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.exact,true);
  assert.equal(c.player,0);
  assert.equal(c.target.label,'C5');
  assert.equal(c.target.supportDistance,1);
  assert.equal(c.template.targetIsAttackerResponse,true);
  assert.ok(c.template.defenderResidualCount>=1);
  assert.equal(c.template.coverage.length,c.template.defenderResidualCount);
  assert.equal(c.firstWinGuard.passed,true);
  assert.equal(c.gameTreeTraversal,false);
  assert.equal(c.recursive,false);
});

test('target-reservoir discovery finds the qualified rank31 C5 target mechanically',()=>{
  const p=buildCpcxPosition('4444415666662322224233177555571',{geometry:g}),
    rows=findCpcxTruncatedTargetReservoirCertificates(p,{attacker:0});
  assert.ok(rows.some(x=>x.target.label==='C5'));
  assert.ok(rows.every(x=>x.kind==='CERTIFIED_FIRST_WIN'&&x.exact));
});

test('target-reservoir theorem fails closed when no active nonplayable singleton exists',()=>{
  const p=buildCpcxPosition('443',{geometry:g}),
    rows=findCpcxTruncatedTargetReservoirCertificates(p,{attacker:0});
  assert.deepEqual(rows,[]);
});

test('target-reservoir implementation is current-state structural and isolated from solved/search machinery',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-reservoir.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
    'opening book',
  ])assert.equal(source.includes(forbidden),false,forbidden);
  assert.equal(source.includes('buildCpcxPosition('),false);
});
