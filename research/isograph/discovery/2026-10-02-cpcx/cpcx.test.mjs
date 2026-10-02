import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
  buildCpcxEventEffects,
  buildCpcxContractionDag,
  cpcxColumnProfiles,
  cpcxFixedCardinalityComplexity,
} from './cpcx.mjs';

const g=createCpcxGeometry();

test('standard 7x6 geometry has 69 winning lines',()=>{
  assert.equal(g.lines.length,69);
});

test('empty board exposes only four-piece live obligations',()=>{
  const p=buildCpcxPosition('',{geometry:g});
  const obs=scanCpcxObligations(p);
  assert.equal(obs.length,138);
  assert.equal(obs.filter(x=>x.missingCount===4).length,138);
  assert.equal(obs.filter(x=>x.missingCount<4).length,0);
});

test('44444 exposes the expected right-wing 3/3/3/4 obligation core',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const obs=scanCpcxObligations(p);
  const p0=new Map(obs.filter(x=>x.player===0).map(x=>[x.lineLabel,x]));
  for(const line of [
    'D1-E1-F1-G1',
    'D3-E3-F3-G3',
    'D5-E4-F3-G2',
    'D6-E5-F4-G3',
  ])assert.ok(p0.has(line),line);
  assert.equal(p0.get('D1-E1-F1-G1').missingCount,3);
  assert.equal(p0.get('D3-E3-F3-G3').missingCount,3);
  assert.equal(p0.get('D5-E4-F3-G2').missingCount,3);
  assert.equal(p0.get('D6-E5-F4-G3').missingCount,4);
});

test('44444 runtime column profile proves center depletion boundary directly',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const cols=cpcxColumnProfiles(p);
  assert.deepEqual(
    cols.map(x=>[x.height,x.remaining,x.neutralPairCount,x.unmatchedTopDefect]),
    [
      [0,6,3,0],
      [0,6,3,0],
      [0,6,3,0],
      [5,1,0,1],
      [0,6,3,0],
      [0,6,3,0],
      [0,6,3,0],
    ],
  );
});

test('owner-labelled future event contracts every own obligation containing the cell and kills opponent obligations',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const obs=scanCpcxObligations(p);
  const effects=buildCpcxEventEffects(p,obs);
  const e1=0*g.columns+4; // E1
  const p0Effect=effects.find(x=>x.cell===e1&&x.owner===0);
  const p1Effect=effects.find(x=>x.cell===e1&&x.owner===1);
  const target=obs.find(x=>x.player===0&&x.lineLabel==='D1-E1-F1-G1');
  assert.ok(target);
  assert.ok(p0Effect.contracts.some(x=>x.obligationId===target.id&&x.fromMissing===3&&x.toMissing===2));
  assert.ok(p1Effect.kills.some(x=>x.obligationId===target.id&&x.fromMissing===3));
});

test('three-piece obligation produces a bounded residual contraction DAG without board descendants',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const o=scanCpcxObligations(p).find(x=>x.player===0&&x.lineLabel==='D1-E1-F1-G1');
  const dag=buildCpcxContractionDag(o);
  assert.equal(dag.sourceCardinality,3);
  assert.equal(dag.nodes.length,7);
  assert.equal(dag.edges.filter(e=>e.eventOwner===0).length,12);
  assert.equal(dag.edges.filter(e=>e.eventOwner===1).length,12);
  assert.ok(dag.edges.some(e=>e.kind==='OWNER_COMPLETES'));
  assert.ok(dag.edges.some(e=>e.kind==='DEFENDER_KILLS'));
});

test('four-piece closure stays bounded by fixed cardinality four',()=>{
  const bound=cpcxFixedCardinalityComplexity({lineCount:69,maxMissing:4});
  assert.equal(bound.maxResidualStatesPerLiveLine,15);
  assert.equal(bound.maxOwnerEdgesPerLiveLine,32);
  assert.equal(bound.maxTwoPlayerResidualStates,2070);
});

test('prototype source is isolated from production CPC and recursive game solving',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    'cpc-connect4',
    'ExactConnect4Oracle',
    'alpha-beta',
    'negamax',
    'minimax',
    'solveSequence(',
    'search(',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
