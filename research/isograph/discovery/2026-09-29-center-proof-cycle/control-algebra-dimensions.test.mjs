import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeDirectResidualOrbitGraph,
  analyzeDirectResidualOrbitGrowthCompact,
  analyzeUnlabelledQuotientDimension,
  analyzeUnlabelledQuotientDimensionMatrix,
} from './control-algebra-dimensions.mjs';

test('generic rule-only quotient reproduces exhaustive 4x4 connect-4 control',()=>{
  const r=analyzeUnlabelledQuotientDimension({width:4,height:4,k:4,auditResidualOrbit:true});
  assert.equal(r.producerUsesOutcomeLabels,false);
  assert.equal(r.states,161029);
  assert.equal(r.successorEdgesProcessed,304574);
  assert.equal(r.classes,8242);
  assert.equal(r.wdlSplitClasses,0);
  assert.equal(r.wdlSplitStates,0);
  assert.equal(r.rootLegalMoves,4);
  assert.equal(r.rootDistinctChildClasses,2);
  assert.ok(r.residualOrbitAudit);
  assert.equal(r.residualOrbitAudit.soundAgainstRecursiveQuotient,true);
  assert.equal(r.residualOrbitAudit.splitOrbitSignatures,0);
  assert.ok(r.residualOrbitAudit.orientationSensitiveClasses>=
    r.residualOrbitAudit.columnOrbitClasses);
  assert.ok(r.residualOrbitAudit.columnOrbitClasses>=r.classes);
});

test('direct residual orbit graph reproduces the recursive 4x4 quotient without physical-board enumeration',()=>{
  const r=analyzeDirectResidualOrbitGraph({width:4,height:4,k:4});
  assert.equal(r.physicalBoardStatesEnumerated,false);
  assert.equal(r.outcomeLabelsUsedByProducer,false);
  assert.equal(r.residualOrbitStates,10507);
  assert.equal(r.recursiveUnlabelledClasses,8242);
  assert.equal(r.wdlSplitClasses,0);
  assert.equal(r.rootValue,0);
  assert.equal(r.rootLegalActions,4);
  assert.equal(r.rootDistinctRecursiveChildren,2);
  assert.equal(r.earliestDynamicMergeRank,6);
  assert.equal(r.dynamicMergeByRank[6].orbitExcess,2);
  assert.ok(r.earliestDynamicMergeGroups.length>0);

  const closed=analyzeDirectResidualOrbitGraph({
    width:4,height:4,k:4,universalFrontierBlocker:true,
  });
  assert.ok(closed.residualOrbitStates<r.residualOrbitStates);
  assert.equal(closed.recursiveUnlabelledClasses,r.recursiveUnlabelledClasses);
  assert.equal(closed.rootValue,r.rootValue);
  assert.equal(closed.wdlSplitClasses,0);
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

test('direct residual orbit producer reproduces recursive quotient across small dimensions',()=>{
  const physical=analyzeUnlabelledQuotientDimensionMatrix();
  for(const row of physical.cases){
    const direct=analyzeDirectResidualOrbitGraph({
      width:row.width,height:row.height,k:row.k,
    });
    assert.equal(direct.physicalBoardStatesEnumerated,false);
    assert.equal(direct.outcomeLabelsUsedByProducer,false);
    assert.equal(direct.recursiveUnlabelledClasses,row.classes);
    assert.equal(direct.rootValue,row.rootValue);
    assert.equal(direct.wdlSplitClasses,0);
    assert.ok(direct.residualOrbitStates<=row.states);
  }
});

test('compact direct-growth evaluator is exactly equivalent on rewritten 4x4 control',()=>{
  const full=analyzeDirectResidualOrbitGraph({
    width:4,height:4,k:4,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
    measureLocalBranchClosure:false,
  }),compact=analyzeDirectResidualOrbitGrowthCompact({
    width:4,height:4,k:4,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
  });
  for(const key of [
    'residualOrbitStates',
    'literalActionEdges',
    'duplicateEquivalentActionEdges',
    'recursiveUnlabelledClasses',
    'wdlSplitClasses',
    'rootValue',
    'rootLegalActions',
    'rootDistinctOrbitChildren',
    'rootDistinctRecursiveChildren',
    'earliestDynamicMergeRank',
  ])assert.equal(compact[key],full[key],key);
  assert.deepEqual(compact.frontier,full.frontier);
  assert.deepEqual(compact.dynamicMergeByRank,full.dynamicMergeByRank);
  assert.equal(compact.fullGraphObjectsRetained,false);
});

test('column refinements are exact wherever they certify search-free canonicalization',()=>{
  const r=analyzeDirectResidualOrbitGraph({
    width:4,height:4,k:4,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
    auditColumnRefinement:true,
    auditPairColumnRefinement:true,
  }),a=r.columnRefinementAudit,b=r.pairColumnRefinementAudit;
  for(const x of [a,b]){
    assert.ok(x);
    assert.ok(x.auditedStates>0);
    assert.equal(x.canonicalCollisions,0);
    assert.equal(x.exactOnSearchFreeStates,true);
    assert.equal(x.searchFreeStates+x.fallbackStates,x.auditedStates);
    assert.ok(x.searchFreeStates>0);
  }
  assert.equal(b.auditedStates,a.auditedStates);
  assert.ok(b.fallbackStates<=a.fallbackStates);
  assert.ok(b.maxPermutationSearchUpperBound<=a.maxPermutationSearchUpperBound);
});

test('local branch closure reaches the exact 4x4 quotient in seven rounds after structural rewrites',()=>{
  const r=analyzeDirectResidualOrbitGraph({
    width:4,height:4,k:4,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
  });
  assert.equal(r.localBranchClosure.roundsToFull,7);
  assert.deepEqual(
    r.localBranchClosure.rounds.map(x=>x.classes),
    [9441,9237,8948,8629,8375,8269,8250,8242],
  );
  assert.equal(
    r.localBranchClosure.rounds.at(-1).matchesFull,
    true,
  );
});

test('final-event cap parity removes mover-unrealizable residuals without changing quotient',()=>{
  const physical=analyzeUnlabelledQuotientDimensionMatrix();
  for(const row of physical.cases){
    const base=analyzeDirectResidualOrbitGraph({
      width:row.width,height:row.height,k:row.k,
      nonterminalFrontierBlocker:true,
    }),closed=analyzeDirectResidualOrbitGraph({
      width:row.width,height:row.height,k:row.k,
      nonterminalFrontierBlocker:true,
      moverFinalCapParity:true,
    });
    assert.equal(closed.recursiveUnlabelledClasses,row.classes);
    assert.equal(closed.rootValue,row.rootValue);
    assert.equal(closed.wdlSplitClasses,0);
    assert.ok(closed.residualOrbitStates<=base.residualOrbitStates);
    assert.ok(closed.literalActionEdges<=base.literalActionEdges);
  }
});

test('nonterminal frontier blocker strengthens universal blocker without changing quotient',()=>{
  const physical=analyzeUnlabelledQuotientDimensionMatrix();
  for(const row of physical.cases){
    const universal=analyzeDirectResidualOrbitGraph({
      width:row.width,height:row.height,k:row.k,
      universalFrontierBlocker:true,
    }),strong=analyzeDirectResidualOrbitGraph({
      width:row.width,height:row.height,k:row.k,
      nonterminalFrontierBlocker:true,
    });
    assert.equal(strong.recursiveUnlabelledClasses,row.classes);
    assert.equal(strong.rootValue,row.rootValue);
    assert.equal(strong.wdlSplitClasses,0);
    assert.ok(strong.residualOrbitStates<=universal.residualOrbitStates);
    assert.ok(strong.literalActionEdges<=universal.literalActionEdges);
  }
});

test('universal frontier blocker preserves direct quotient across small dimensions',()=>{
  const physical=analyzeUnlabelledQuotientDimensionMatrix();
  for(const row of physical.cases){
    const base=analyzeDirectResidualOrbitGraph({
      width:row.width,height:row.height,k:row.k,
    }),closed=analyzeDirectResidualOrbitGraph({
      width:row.width,height:row.height,k:row.k,
      universalFrontierBlocker:true,
    });
    assert.equal(closed.recursiveUnlabelledClasses,row.classes);
    assert.equal(closed.rootValue,row.rootValue);
    assert.equal(closed.wdlSplitClasses,0);
    assert.ok(closed.residualOrbitStates<=base.residualOrbitStates);
    assert.ok(closed.literalActionEdges<=base.literalActionEdges);
  }
});

test('gravity makes width-height perturbation an explicit control rather than a transpose assumption',()=>{
  const a=analyzeUnlabelledQuotientDimension({width:4,height:3,k:3});
  const b=analyzeUnlabelledQuotientDimension({width:3,height:4,k:3});
  assert.equal(a.cells,b.cells);
  assert.ok(a.states!==b.states||a.classes!==b.classes||
    a.successorEdgesProcessed!==b.successorEdgesProcessed);
});
