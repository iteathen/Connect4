import test from 'node:test';
import assert from 'node:assert/strict';
import * as algebra from './control-algebra.mjs';
const {analyzeStandardCenterControlAlgebra,analyzeBoundaryPolynomialAlgebra}=algebra;

test('standard 7x6 center response family has a nontrivial GF(2) defect',()=>{
  const r=analyzeStandardCenterControlAlgebra();
  assert.equal(r.inputs,'geometry/rules only');
  assert.equal(r.lineCount,69);
  assert.equal(r.responsePairs,20);
  assert.equal(r.responsePairRank,19);
  assert.equal(r.responseRelationNullity,1);
  assert.equal(r.unmatchedCenterIndependent,true);
  assert.deepEqual(r.dependencyLabels,[
    'c1:r1-2','c1:r3-4','c1:r5-6',
    'c3:r1-2','c3:r3-4','c3:r5-6',
    'c5:r1-2','c5:r3-4','c5:r5-6',
    'c7:r1-2','c7:r3-4','c7:r5-6',
  ]);
});

test('shared 2108-state boundary first exposes cubic and then complete quartic separation',()=>{
  const r=analyzeBoundaryPolynomialAlgebra();
  assert.equal(r.inputs,'geometry/rules/derived boundary only');
  assert.equal(r.unknownStates,2108);
  assert.equal(r.immediateWinStates,1987);
  assert.deepEqual(r.identitySpace.slice(0,4),[
    {degree:1,monomials:13,rank:13,nullity:0,separatedImmediateWins:0},
    {degree:2,monomials:79,rank:79,nullity:0,separatedImmediateWins:0},
    {degree:3,monomials:299,rank:297,nullity:2,separatedImmediateWins:768},
    {degree:4,monomials:794,rank:751,nullity:43,separatedImmediateWins:1987},
  ]);
  assert.deepEqual(r.cubicFactors,[
    'c3H*c5H*(1 xor c2L)',
    'c3H*c5H*(1 xor c6L)',
  ]);
  assert.equal(r.cubicUnionImmediateWins,768);
});


test('dimension perturbation derives control algebra without outcome labels',()=>{
  assert.equal(typeof algebra.analyzeDimensionControlAlgebra,'function');
  const r=algebra.analyzeDimensionControlAlgebra({widths:[4,5,6,7,8],heights:[4,6,8]});
  assert.equal(r.inputs,'geometry/rules only');
  assert.equal(r.outcomeLabelsRead,false);
  assert.equal(r.rows.length,15);
  const standard=r.rows.find(x=>x.width===7&&x.height===6);
  assert.ok(standard);
  assert.equal(standard.safeDefects.length,1);
  assert.equal(standard.safeDefects[0].column,4);
  assert.equal(standard.safeDefects[0].responsePairs,20);
  assert.equal(standard.safeDefects[0].responsePairRank,19);
  assert.equal(standard.safeDefects[0].unmatchedIndependent,true);
});


test('guard refinement grades the response algebra without outcome labels',()=>{
  assert.equal(typeof algebra.analyzeGuardedResponseProjections,'function');
  const r=algebra.analyzeGuardedResponseProjections();
  assert.equal(r.inputs,'geometry/rules only');
  assert.equal(r.outcomeLabelsRead,false);
  assert.equal(r.responsePairs,20);
  assert.ok(r.projections.length>=5);
  for(const p of r.projections){
    assert.equal(p.responsePairs,20);
    assert.ok(p.rank>=0&&p.rank<=20);
    assert.equal(p.nullity,20-p.rank);
    assert.equal(typeof p.unmatchedIndependent,'boolean');
  }
  const base=r.projections.find(p=>p.id==='player-line');
  assert.ok(base);
  assert.equal(base.rank,19);
  assert.equal(base.nullity,1);
});


test('complete-column XOR cancellation survives height parity and exposes K mod 4',()=>{
  assert.equal(typeof algebra.analyzeFullColumnCancellation,'function');
  const r=algebra.analyzeFullColumnCancellation();
  assert.equal(r.inputs,'geometry/rules only');
  assert.equal(r.outcomeLabelsRead,false);
  assert.equal(r.dimensionSweep.uniformParityFailures.length,0);
  assert.equal(r.dimensionSweep.singleDefectIdentityFailures.length,0);
  assert.deepEqual(r.standardWidth7.map(x=>({
    height:x.height,pairNullity:x.pairNullity,unmatchedTops:x.unmatchedTops,
    completedRelationZero:x.completedRelationZero,
  })),[
    {height:4,pairNullity:1,unmatchedTops:1,completedRelationZero:true},
    {height:5,pairNullity:0,unmatchedTops:6,completedRelationZero:true},
    {height:6,pairNullity:1,unmatchedTops:1,completedRelationZero:true},
    {height:7,pairNullity:0,unmatchedTops:6,completedRelationZero:true},
    {height:8,pairNullity:1,unmatchedTops:1,completedRelationZero:true},
    {height:9,pairNullity:0,unmatchedTops:6,completedRelationZero:true},
  ]);
  assert.deepEqual(r.connectKPeriodicity.map(x=>[x.connectK,x.uniformParityCancellation]),
    [[3,false],[4,true],[5,false],[6,false],[7,false],[8,true]]);
});


test('depth-graded control residue recovers the existing middle derivative',()=>{
  assert.equal(typeof algebra.analyzeDepthPolynomialAnnihilator,'function');
  const r=algebra.analyzeDepthPolynomialAnnihilator();
  assert.equal(r.inputs,'geometry/rules only');
  assert.equal(r.outcomeLabelsRead,false);
  assert.deepEqual(r.standard7x6.nonzeroRelationPolynomials,['1+x^2','x+x^3','x^2+x^4','x^3+x^5']);
  assert.equal(r.standard7x6.gcd,'1+x^2');
  assert.equal(r.standard7x6.existingOperator,'partial^2');
  assert.deepEqual(r.connectK.map(x=>[x.connectK,x.ungradedCancellation]),[
    [3,false],[4,true],[5,false],[6,false],[7,false],
    [8,true],[9,false],[10,false],[11,false],[12,true],
  ]);
  assert.equal(r.connectK.find(x=>x.connectK===4).depthGcd,'1+x^2');
  assert.equal(r.connectK.find(x=>x.connectK===8).depthGcd,'1+x^2+x^4+x^6');
  assert.equal(r.connectK.find(x=>x.connectK===12).depthGcd,'1+x^2+x^4+x^6+x^8+x^10');
});


test('control-response polynomial is the winning window with one derivative removed',()=>{
  assert.equal(typeof algebra.analyzeControlWindowFactorization,'function');
  const r=algebra.analyzeControlWindowFactorization({minK:3,maxK:32});
  assert.equal(r.inputs,'geometry/rules only');
  assert.equal(r.outcomeLabelsRead,false);
  assert.deepEqual(r.mismatches,[]);
  for(const x of r.rows){
    assert.equal(x.ungradedCancellation,x.connectK%4===0);
    if(x.connectK%4===0){
      assert.equal(x.depthGcd,x.windowOverFirstDerivative);
      assert.equal(x.controlDerivativeMultiplicity,x.windowDerivativeMultiplicity-1);
    }
  }
  const k4=r.rows.find(x=>x.connectK===4);
  assert.equal(k4.windowPolynomial,'1+x+x^2+x^3');
  assert.equal(k4.depthGcd,'1+x^2');
  assert.equal(k4.windowDerivativeMultiplicity,3);
  assert.equal(k4.controlDerivativeMultiplicity,2);
});


test('general Connect-K cancellation equals the winning window after removing one response factor',()=>{
  assert.equal(typeof algebra.analyzeControlWindowFactorization,'function');
  const r=algebra.analyzeControlWindowFactorization({minK:3,maxK:32});
  assert.equal(r.inputs,'geometry/rules only');
  assert.equal(r.outcomeLabelsRead,false);
  assert.equal(r.rows.length,30);
  assert.deepEqual(r.mismatches,[]);
  for(const x of r.rows){
    assert.equal(x.ungradedCancellation,x.connectK%4===0);
    if(x.connectK%4===0){
      assert.equal(x.depthGcd,x.windowOverFirstDerivative);
      assert.ok(x.controlDerivativeMultiplicity>=2);
    }
  }
});


test('response-factor law survives rectangular boundary perturbation',()=>{
  assert.equal(typeof algebra.analyzeControlWindowFactorizationRectangles,'function');
  const r=algebra.analyzeControlWindowFactorizationRectangles({
    connectK:[4,8,12,16],margins:[0,1,2,3,5]
  });
  assert.equal(r.inputs,'geometry/rules only');
  assert.equal(r.outcomeLabelsRead,false);
  assert.equal(r.rows.length,100);
  assert.deepEqual(r.failures,[]);
  for(const x of r.rows){
    assert.equal(x.ungradedCancellation,true);
    assert.equal(x.depthGcd,x.windowOverFirstDerivative);
  }
});


test('guarded boundary macro policy isolates a higher-degree strategic layer',()=>{
  assert.equal(typeof algebra.analyzeGuardedBoundaryMacroPolicy,'function');
  const r=algebra.analyzeGuardedBoundaryMacroPolicy();
  assert.equal(r.inputs,'geometry/rules/restricted policy only');
  assert.equal(r.outcomeLabelsRead,false);
  assert.equal(r.boundaryStates,2108);
  assert.equal(r.certifiedP0Wins,160);
  assert.equal(r.uncertifiedStates,1948);
  assert.deepEqual(r.terminalDrawTraps,[
    '4,6,6,6,6,6,6',
    '6,6,4,6,6,6,6',
    '6,6,6,6,4,6,6',
    '6,6,6,6,6,6,4',
  ]);
  assert.deepEqual(r.polynomialSeparation.map(x=>[x.degree,x.certifiedWinsSeparated]),[
    [1,0],[2,0],[3,0],[4,0],[5,136],[6,160],
  ]);
});


test('exhaustive 4x4 audits support plus line partial2 against exact WDL',()=>{
  assert.equal(typeof algebra.analyzeExhaustive4x4DerivativeCarrier,'function');
  const r=algebra.analyzeExhaustive4x4DerivativeCarrier();
  assert.equal(r.inputs,'4x4 connect-4 rules only');
  assert.equal(r.solvedInputsUsed,false);
  assert.equal(r.states,161029);
  assert.equal(r.wdlCounts.loss+r.wdlCounts.draw+r.wdlCounts.win,r.states);
  assert.equal(r.carrier,'support + player-labelled line partial^2');
  assert.ok(r.classes>0&&r.classes<=r.states);
  assert.ok(r.splitClasses>=0&&r.splitClasses<=r.classes);
});


test('exhaustive optimal policy graph branches and collapses under perfect play',()=>{
  assert.equal(typeof algebra.analyzeOptimalBranchCollapse4x4,'function');
  const r=algebra.analyzeOptimalBranchCollapse4x4();
  assert.equal(r.inputs,'4x4 connect-4 rules only');
  assert.equal(r.solvedInputsUsed,false);
  assert.equal(r.states,161029);
  assert.ok(r.optimalEdges>0);
  assert.ok(r.multiOptimalStates>0);
  assert.ok(r.moverWinningMultiOptimalStates>0);
  assert.ok(r.optimalMergeStates>0);
  assert.ok(r.optimalThreePlyDiamonds>0);
  assert.ok(r.winningStatesWithMultipleTerminalLines>0);
  assert.ok(r.maxTerminalWinningLines>1);
  assert.ok(r.exampleBranchCollapse);
  assert.ok(r.exampleBranchCollapse.optimalMoves.length>1);
  assert.ok(r.exampleBranchCollapse.terminalWinningLines.length>1);
});


test('optimal sibling moves are compared under partial2 and terminal-realization quotients',()=>{
  const r=algebra.analyzeOptimalBranchCollapse4x4();
  assert.equal(r.multiOptimalStates,56763);
  assert.ok(r.siblingCarrierAudit);
  const a=r.siblingCarrierAudit;
  assert.equal(a.statesAudited,r.multiOptimalStates);
  assert.equal(
    a.allChildrenSamePartial2+a.childrenSplitAcrossPartial2,
    a.statesAudited
  );
  assert.equal(
    a.allChildrenSameTerminalSet+a.childrenSplitAcrossTerminalSet,
    a.statesAudited
  );
  assert.ok(a.samePartial2DifferentTerminalSetPairs>=0);
  assert.ok(a.differentPartial2SameTerminalSetPairs>=0);
});


test('equivalent optimal sibling deltas define a GF2 gauge candidate',()=>{
  const r=algebra.analyzeOptimalBranchCollapse4x4();
  const g=r.equivalentSiblingDeltaSpace;
  assert.ok(g);
  assert.equal(g.sameTerminalPairs,98702);
  assert.ok(g.sameTerminalDistinctDeltas>0);
  assert.ok(g.sameTerminalDeltaRank>0&&g.sameTerminalDeltaRank<=40);
  assert.equal(g.sameTerminalPairsNotInSpan,0);
  assert.ok(g.differentTerminalPairs>0);
  assert.ok(g.differentTerminalPairsCollapsedBySpan>=0);
  assert.ok(g.allOptimalDeltaRank>=g.sameTerminalDeltaRank);
});


test('optimal sibling GF2 gauge is compared against all legal move-choice deltas',()=>{
  const r=algebra.analyzeOptimalBranchCollapse4x4();
  const g=r.equivalentSiblingDeltaSpace;
  assert.ok(g);
  assert.ok(g.allLegalSiblingPairs>g.sameTerminalPairs);
  assert.ok(g.allLegalDistinctDeltas>=g.allOptimalDistinctDeltas);
  assert.ok(g.allLegalDeltaRank>=g.allOptimalDeltaRank);
  assert.ok(g.legalDeltasOutsideOptimalSpan>=0);
  assert.equal(
    g.optimalDeltaSetEqualsLegal,
    g.legalDeltasOutsideOptimalSpan===0 &&
      g.allLegalDistinctDeltas===g.allOptimalDistinctDeltas
  );
});


test('unlabeled successor quotients expose branch-equivalent control classes',()=>{
  const r=algebra.analyzeOptimalBranchCollapse4x4();
  const q=r.structuralQuotients;
  assert.ok(q);
  assert.equal(q.allLegal.wdlSplitClasses,0);
  assert.equal(q.optimal.wdlSplitClasses,0);
  assert.ok(q.allLegal.classes>0&&q.allLegal.classes<r.states);
  assert.ok(q.optimal.classes>0&&q.optimal.classes<=q.allLegal.classes);
  assert.ok(q.allLegal.statesWithDuplicateEquivalentMoves>0);
  assert.ok(q.optimal.statesWithDuplicateEquivalentMoves>0);
  assert.equal(q.allLegal.rootLegalMoves,4);
  assert.equal(q.optimal.rootLegalMoves,4);
  assert.ok(q.allLegal.rootDistinctChildClasses>=1&&q.allLegal.rootDistinctChildClasses<=4);
  assert.ok(q.optimal.rootDistinctChildClasses>=1&&q.optimal.rootDistinctChildClasses<=4);
});
