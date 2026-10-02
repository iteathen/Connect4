import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {closeCpcxForcedResponses} from './cpcx-closure.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
  collapseCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
import {
  analyzeCpcxMacroUncertainty,
  buildCpcxSupportLiftGraph,
} from './cpcx-capacity.mjs';

const g=createCpcxGeometry();

function firstExactCollapse(sequence){
  const normalized=closeCpcxForcedResponses(buildCpcxPosition(sequence,{geometry:g})).position;
  for(const d of findCpcxVerticalTwoStageObligations(normalized,{player:0})){
    const cert=certifyCpcxVerticalTwoStage(normalized,d);
    if(cert.exact)return {
      position:normalized,
      demand:d,
      cert,
      collapse:collapseCpcxVerticalTwoStage(normalized,d,cert),
    };
  }
  throw new Error('no exact two-stage collapse');
}

test('optional external macro token has zero direct kill capacity',()=>{
  const x=firstExactCollapse('4444415151'),
    a=analyzeCpcxMacroUncertainty(x.position,x.collapse);
  assert.equal(a.exact,true);
  assert.equal(a.externalPlacementOptional,true);
  assert.equal(a.directKillEdges,0);
  assert.equal(a.directBlockCapacity,0);
  assert.ok(a.supportLiftEdges>0);
  assert.ok(a.residuals.every(r=>r.directKillCandidates.length===0));
});

test('support-lift graph has at most one active token and only nonpositive support deltas',()=>{
  const x=firstExactCollapse('4444415151'),
    graph=buildCpcxSupportLiftGraph(x.position,x.collapse);
  assert.equal(graph.maxActiveTokens,1);
  assert.ok(graph.tokens.length>0);
  assert.ok(graph.edges.length>0);
  assert.ok(graph.edges.every(e=>e.delta===-1));
});

test('forced-upper macro has no external uncertainty token',()=>{
  const x=firstExactCollapse('4444435353'),
    a=analyzeCpcxMacroUncertainty(x.position,x.collapse);
  assert.equal(x.cert.kind,'FORCED_UPPER_RESPONSE');
  assert.equal(a.externalPlacementOptional,false);
  assert.equal(a.candidateCells.length,0);
  assert.equal(a.directKillEdges,0);
  assert.equal(a.supportLiftEdges,0);
});

test('all retained outer classes preserve guaranteed residuals from direct external blocking',()=>{
  for(const sequence of [
    '4444415151',
    '4444425252',
    '4444451515',
    '4444462626',
    '4444473737',
  ]){
    const x=firstExactCollapse(sequence),
      a=analyzeCpcxMacroUncertainty(x.position,x.collapse);
    assert.equal(a.directKillEdges,0,sequence);
    assert.equal(a.directBlockCapacity,0,sequence);
  }
});

test('capacity module is isolated from production CPC and solved data',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-capacity.mjs',import.meta.url),'utf8');
  for(const forbidden of ['cpc-connect4','ExactConnect4Oracle','components/oracle','solveSequence('])
    assert.equal(source.includes(forbidden),false,forbidden);
});
