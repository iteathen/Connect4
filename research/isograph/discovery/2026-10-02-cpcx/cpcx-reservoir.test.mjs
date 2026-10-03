import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {
  certifyCpcxTruncatedTargetReservoir,
  findCpcxTruncatedTargetReservoirCertificates,
  analyzeCpcxTargetReservoir,
  analyzeCpcxOneDefectTargetReservoir,
} from './cpcx-reservoir.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';

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

test('progress promotes the qualified rank31 reservoir control to first-win',()=>{
  const p=buildCpcxPosition('4444415666662322224233177555571',{geometry:g}),
    progress=classifyCpcxProgress(p,{player:0});
  assert.equal(progress.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(progress.player,0);
  assert.equal(progress.source,'TRUNCATED_TARGET_RESERVOIR');
  assert.equal(progress.exact,true);
});

test('target-reservoir discovery finds the qualified rank31 C5 target mechanically',()=>{
  const p=buildCpcxPosition('4444415666662322224233177555571',{geometry:g}),
    rows=findCpcxTruncatedTargetReservoirCertificates(p,{attacker:0});
  assert.ok(rows.some(x=>x.target.label==='C5'));
  assert.ok(rows.every(x=>x.kind==='CERTIFIED_FIRST_WIN'&&x.exact));
});

test('qualified rank31 reservoir is pairing-parity admissible',()=>{
  const p=buildCpcxPosition('4444415666662322224233177555571',{geometry:g}),
    target=4*g.columns+2,
    a=analyzeCpcxTargetReservoir(p,{attacker:0,targetCell:target});
  assert.equal(a.kind,'PAIRING_PARITY_ADMISSIBLE');
  assert.equal(a.exact,true);
  assert.equal(a.totalParity,0);
  assert.equal(a.oddColumns.length&1,0);
  assert.equal(a.target.label,'C5');
  assert.equal(a.gameTreeTraversal,false);
  assert.equal(a.recursive,false);
});

test('move6 rank10 diagonal setup exposes one odd reservoir defect without promoting a win',()=>{
  const p=buildCpcxPosition('44444377655',{geometry:g}),
    target=3*g.columns+2, // C4
    a=analyzeCpcxTargetReservoir(p,{attacker:0,targetCell:target});
  assert.equal(p.rank,11);
  assert.equal(p.mover,1);
  assert.equal(a.kind,'ODD_RESERVOIR_DEFECT');
  assert.equal(a.exact,true);
  assert.equal(a.totalParity,1);
  assert.equal(a.unmatchedEventCountLowerBound,1);
  assert.equal(a.target.label,'C4');
  assert.match(a.proofBoundary,/not a first-win certificate/i);
});

test('target-reservoir theorem fails closed when no active nonplayable singleton exists',()=>{
  const p=buildCpcxPosition('443',{geometry:g}),
    rows=findCpcxTruncatedTargetReservoirCertificates(p,{attacker:0});
  assert.deepEqual(rows,[]);
});


test('corrected move6 rank10 control admits exact one-defect static reservoir coverage without certifying a win',()=>{
  const p=buildCpcxPosition('4444441123',{geometry:g}),
    setupColumn=2,
    setupCell=p.heights[setupColumn]*g.columns+setupColumn,
    child=applyCpcxForcedEvent(p,setupCell),
    target=3*g.columns+4, // E4
    a=analyzeCpcxOneDefectTargetReservoir(child,{attacker:0,targetCell:target});
  assert.equal(p.rank,10);
  assert.equal(p.mover,0);
  assert.equal(a.kind,'ONE_DEFECT_STATIC_COVERAGE');
  assert.equal(a.exact,true);
  assert.ok(a.fullCoverageTemplateCount>=1);
  assert.equal(a.minimumUncoveredResiduals,0);
  assert.equal(a.totalParity,1);
  assert.ok(a.selectedFullCoverageTemplate);
  assert.equal(a.selectedFullCoverageTemplate.uncoveredResidualCount,0);
  assert.equal(a.firstWinCertified,false);
  assert.match(a.proofBoundary,/transport\/repair viability theorem/i);
});

test('one-defect analyzer preserves the localized diagonal guard falsifier',()=>{
  const p=buildCpcxPosition('4444427765',{geometry:g}),
    setupColumn=4,
    setupCell=p.heights[setupColumn]*g.columns+setupColumn,
    child=applyCpcxForcedEvent(p,setupCell),
    target=3*g.columns+2, // C4
    a=analyzeCpcxOneDefectTargetReservoir(child,{attacker:0,targetCell:target}),
    best=a.bestPartialTemplates[0];
  assert.equal(a.kind,'ONE_DEFECT_STATIC_COVERAGE_GAP');
  assert.equal(a.exact,true);
  assert.equal(a.fullCoverageTemplateCount,0);
  assert.equal(a.minimumUncoveredResiduals,1);
  assert.ok(best);
  assert.equal(best.uncoveredResidualCount,1);
  assert.ok(a.bestPartialTemplates.length>=1);
  assert.ok(a.bestPartialTemplates.every(x=>x.uncoveredResidualCount===1));
  assert.ok(a.bestPartialTemplates.every(x=>
    x.uncovered.length===1&&
    ['D+','D-'].some(orientation=>{
      const line=g.lines[x.uncovered[0].lineId];
      return line?.orientation===orientation;
    })
  ));
  assert.equal(a.firstWinCertified,false);
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
