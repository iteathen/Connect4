import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeUnlabelledQuotientDimension,
  analyzeUnlabelledQuotientDimensionMatrix,
} from './control-algebra-dimensions.mjs';

test('generic rule-only quotient reproduces exhaustive 4x4 connect-4 control',()=>{
  const r=analyzeUnlabelledQuotientDimension({width:4,height:4,k:4});
  assert.equal(r.producerUsesOutcomeLabels,false);
  assert.equal(r.states,161029);
  assert.equal(r.successorEdgesProcessed,304574);
  assert.equal(r.classes,8242);
  assert.equal(r.wdlSplitClasses,0);
  assert.equal(r.wdlSplitStates,0);
  assert.equal(r.rootLegalMoves,4);
  assert.equal(r.rootDistinctChildClasses,2);
});

test('cross-dimension rule-only quotients remain WDL-homogeneous under post-hoc validation',()=>{
  const r=analyzeUnlabelledQuotientDimensionMatrix();
  assert.equal(r.producerUsesOutcomeLabels,false);
  assert.equal(r.cases.length,5);
  for(const row of r.cases){
    assert.equal(row.producerUsesOutcomeLabels,false);
    assert.equal(row.validationUsesDerivedWdl,true);
    assert.equal(row.wdlSplitClasses,0);
    assert.equal(row.wdlSplitStates,0);
    assert.ok(row.classes>0&&row.classes<=row.states);
    assert.ok(row.successorEdgesProcessed>=row.states-1);
    assert.equal(row.frontier.reduce((n,x)=>n+x.states,0),row.states);
    assert.equal(row.frontier.reduce((n,x)=>n+x.classes,0),row.classes);
  }
});

test('gravity makes width-height perturbation an explicit control rather than a transpose assumption',()=>{
  const a=analyzeUnlabelledQuotientDimension({width:4,height:3,k:3});
  const b=analyzeUnlabelledQuotientDimension({width:3,height:4,k:3});
  assert.equal(a.cells,b.cells);
  assert.ok(a.states!==b.states||a.classes!==b.classes||
    a.successorEdgesProcessed!==b.successorEdgesProcessed);
});
