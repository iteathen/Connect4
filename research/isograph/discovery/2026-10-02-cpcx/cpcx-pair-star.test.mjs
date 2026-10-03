import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {
  findCpcxPairStarHubLadders,
  certifyCpcxPairStarHubLadder,
  findAndCertifyCpcxPairStarProgress,
} from './cpcx-pair-star.mjs';

const g=createCpcxGeometry();

test('fresh depth-1 pair-star control certifies exact residual progress',()=>{
  const p=buildCpcxPosition('475447511352',{geometry:g}),
    rows=findAndCertifyCpcxPairStarProgress(p,{player:p.mover});
  assert.ok(rows.length>=1);
  const row=rows.find(x=>x.candidate.supportDepth===1)??rows[0];
  assert.equal(row.certificate.kind,'CERTIFIED_PAIR_STAR_PROGRESS');
  assert.equal(row.certificate.exact,true);
  assert.equal(row.certificate.player,p.mover);
  assert.equal(row.certificate.firstWinGuard.passed,true);
  assert.ok(row.certificate.branches.length>=1);
  assert.ok(row.certificate.branches.every(x=>
    ['ATTACKER_TERMINAL','TWO_SINGLETONS','SINGLETON_PROGRESS'].includes(x.result)
  ));
  assert.equal(row.certificate.progressMeasure.fromPairCardinality,2);
  assert.equal(row.certificate.progressMeasure.toResidualCardinality,1);
});

test('fresh direct-hub pair-star control certifies immediate pair contraction',()=>{
  const p=buildCpcxPosition('67224734216647',{geometry:g}),
    rows=findAndCertifyCpcxPairStarProgress(p,{player:p.mover});
  assert.ok(rows.length>=1);
  const row=rows.find(x=>x.candidate.supportDepth===0);
  assert.ok(row);
  assert.equal(row.certificate.kind,'CERTIFIED_PAIR_STAR_PROGRESS');
  assert.equal(row.certificate.exact,true);
  assert.ok([
    'DIRECT_HUB_TO_TWO_SINGLETONS',
    'DIRECT_HUB_TERMINAL',
  ].includes(row.certificate.source));
});

test('fresh second depth-1 control also certifies without coordinate special casing',()=>{
  const p=buildCpcxPosition('74353436774163',{geometry:g}),
    rows=findAndCertifyCpcxPairStarProgress(p,{player:p.mover});
  assert.ok(rows.some(x=>
    x.candidate.supportDepth===1&&
    x.certificate.kind==='CERTIFIED_PAIR_STAR_PROGRESS'
  ));
});

test('retained first-win falsifier rejects support-away pair star',()=>{
  const p=buildCpcxPosition('4124614224',{geometry:g}),
    candidates=findCpcxPairStarHubLadders(p,{player:p.mover});
  assert.ok(candidates.length>=1);
  const rows=candidates.map(candidate=>({
    candidate,
    certificate:certifyCpcxPairStarHubLadder(p,candidate),
  }));
  assert.ok(rows.some(x=>
    x.candidate.supportDepth===1&&
    x.certificate.kind==='FIRST_WIN_GUARD_FAILURE'&&
    x.certificate.exact===false&&
    x.certificate.defenderTerminalCells.length>=1
  ));
});

test('pair-star theorem is generic, nonrecursive, and isolated from solved/search machinery',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-pair-star.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    "'44444'",
    'buildCpcxPosition(',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'opening book',
    'lossDepth',
    'remoteness',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
  assert.ok(source.includes('progress primitive, not a first-win theorem.'));
  assert.ok(source.includes('firstWinGuard')||source.includes('FIRST_WIN_GUARD_FAILURE'));
});
