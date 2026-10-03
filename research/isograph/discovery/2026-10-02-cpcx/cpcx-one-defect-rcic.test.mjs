import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {
  certifyCpcxOneDefectTargetReservoirRcic,
  findCpcxPairSetupOneDefectRcicCertificates,
} from './cpcx-one-defect-rcic.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';

const g=createCpcxGeometry();

function bySetup(rows,label){
  return rows.find(x=>x.setupLabel===label)??null;
}

function directRcic(position,setupColumn,targetCell){
  const setupCell=position.heights[setupColumn]*g.columns+setupColumn,
    child=applyCpcxForcedEvent(position,setupCell);
  assert.equal(child.terminal,null);
  return certifyCpcxOneDefectTargetReservoirRcic(child,{
    attacker:0,targetCell,
  });
}

test('F9 full-static-coverage control falsifies the one-defect RCIC candidate',()=>{
  const p=buildCpcxPosition('4444441123',{geometry:g}),
    direct=directRcic(p,2,3*g.columns+4),
    rows=findCpcxPairSetupOneDefectRcicCertificates(p,{attacker:0});
  assert.equal(direct.kind,'NO_CERTIFICATE');
  assert.equal(direct.exact,false);
  assert.equal(direct.seam,'NO_TRIGGER_ADAPTIVE_ONE_DEFECT_TEMPLATE');
  assert.equal(bySetup(rows,'C2'),null);
  assert.equal(Object.prototype.hasOwnProperty.call(direct,'draw'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(direct,'value'),false);
});

test('F17 renewal control falsifies adaptive RCIC closure at a lower exact state',()=>{
  const p=buildCpcxPosition('4444417765',{geometry:g}),
    direct=directRcic(p,4,3*g.columns+2),
    rows=findCpcxPairSetupOneDefectRcicCertificates(p,{attacker:0});
  assert.equal(direct.kind,'NO_CERTIFICATE');
  assert.equal(direct.exact,false);
  assert.equal(direct.seam,'NO_TRIGGER_ADAPTIVE_ONE_DEFECT_TEMPLATE');
  assert.equal(bySetup(rows,'E2'),null);
});

test('F18 ordinary-reservoir discovery chain is not a universal RCIC proof',()=>{
  const p=buildCpcxPosition('4444417465',{geometry:g}),
    direct=directRcic(p,4,3*g.columns+2),
    rows=findCpcxPairSetupOneDefectRcicCertificates(p,{attacker:0});
  assert.equal(direct.kind,'NO_CERTIFICATE');
  assert.equal(direct.exact,false);
  assert.equal(direct.seam,'NO_TRIGGER_ADAPTIVE_ONE_DEFECT_TEMPLATE');
  assert.equal(bySetup(rows,'E2'),null);
});

test('localized diagonal one-defect coverage gap remains NO_CERTIFICATE',()=>{
  const p=buildCpcxPosition('4444427765',{geometry:g}),
    setupColumn=4,
    setupCell=p.heights[setupColumn]*g.columns+setupColumn,
    child=applyCpcxForcedEvent(p,setupCell),
    target=3*g.columns+2,
    c=certifyCpcxOneDefectTargetReservoirRcic(child,{
      attacker:0,targetCell:target,
    }),
    rows=findCpcxPairSetupOneDefectRcicCertificates(p,{attacker:0});
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.exact,false);
  assert.equal(c.seam,'ONE_DEFECT_STATIC_COVERAGE_GAP');
  assert.equal(bySetup(rows,'E2'),null);
  assert.equal(Object.prototype.hasOwnProperty.call(c,'draw'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(c,'value'),false);
});

test('unpromoted one-defect RCIC candidate remains structural and search/oracle isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-one-defect-rcic.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    "'44444'",
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
    'buildCpcxPosition(',
  ])assert.equal(source.includes(forbidden),false,forbidden);
  assert.match(source,/ranked controlled invariant/i);
  assert.match(source,/totalRelevantEvents/);
});
