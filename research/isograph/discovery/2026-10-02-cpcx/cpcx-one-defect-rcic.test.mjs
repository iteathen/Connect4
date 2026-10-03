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

function assertFirstWin(c,label){
  assert.equal(
    c.kind,
    'CERTIFIED_FIRST_WIN',
    `${label}: ${c.seam??'no seam'} ${JSON.stringify({
      failedNode:c.failedNode??null,
      defenderLabel:c.defenderLabel??null,
      repair:c.repair??null,
      reentry:c.reentry?.seam??null,
    })}`,
  );
}

test('rank10 full-coverage control closes by a one-defect RCIC after pair setup',()=>{
  const p=buildCpcxPosition('4444441123',{geometry:g}),
    direct=directRcic(p,2,3*g.columns+4),
    rows=findCpcxPairSetupOneDefectRcicCertificates(p,{attacker:0}),
    c=bySetup(rows,'C2');
  assertFirstWin(direct,'F9 direct RCIC');
  assert.ok(c);
  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.exact,true);
  assert.equal(c.player,0);
  assert.equal(c.source,'PAIR_SETUP_TO_ONE_DEFECT_RCIC');
  assert.equal(c.targetLabel,'E4');
  assert.equal(c.childCertificate.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.childCertificate.player,0);
  assert.equal(c.childCertificate.rcic.responseTotality,true);
  assert.equal(c.childCertificate.rcic.strictDecrease,true);
  assert.ok(c.childCertificate.nodeCount>=1);
  assert.ok(c.childCertificate.edgeCount>=1);
  assert.equal(c.childCertificate.ordinaryGameTreeSearch,false);
  assert.equal(c.childCertificate.lossDelayAssumed,false);
});

test('two-stage renewal control closes with a strictly decreasing RCIC measure',()=>{
  const p=buildCpcxPosition('4444417765',{geometry:g}),
    direct=directRcic(p,4,3*g.columns+2),
    rows=findCpcxPairSetupOneDefectRcicCertificates(p,{attacker:0}),
    c=bySetup(rows,'E2');
  assertFirstWin(direct,'F17 direct RCIC');
  assert.ok(c);
  const rcic=c.childCertificate;
  assert.equal(rcic.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(rcic.player,0);
  assert.ok(rcic.measures.length>=2);
  for(let i=1;i<rcic.measures.length;i++)
    assert.ok(rcic.measures[i]>rcic.measures[i-1]||rcic.measures[i]<rcic.measures[i-1]);
  for(const node of rcic.nodes)for(const edge of node.edges){
    if(edge.result!=='LOWER_ONE_DEFECT')continue;
    const child=rcic.nodes.find(x=>x.key===edge.childKey);
    assert.ok(child);
    assert.ok(child.measure<node.measure);
  }
});

test('ordinary-reservoir handoff control closes without a remoteness premise',()=>{
  const p=buildCpcxPosition('4444417465',{geometry:g}),
    direct=directRcic(p,4,3*g.columns+2),
    rows=findCpcxPairSetupOneDefectRcicCertificates(p,{attacker:0}),
    c=bySetup(rows,'E2');
  assertFirstWin(direct,'F18 direct RCIC');
  assert.ok(c);
  assert.equal(c.childCertificate.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.childCertificate.lossDelayAssumed,false);
  assert.ok(c.childCertificate.nodes.some(node=>
    node.edges.some(edge=>
      edge.result==='BASE_FIRST_WIN'&&
      ['ORDINARY_TARGET_RESERVOIR','EXISTING_CPCX_FIRST_WIN','ATTACKER_TERMINAL']
        .includes(edge.baseClass)
    )
  ));
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

test('one-defect RCIC is standard-board structural and search/oracle isolated',async()=>{
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
