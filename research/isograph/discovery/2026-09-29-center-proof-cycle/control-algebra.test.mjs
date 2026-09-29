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
  assert.equal(typeof algebra.analyzeConnectKResponseFactorLaw,'function');
  const r=algebra.analyzeConnectKResponseFactorLaw({minK:3,maxK:32});
  assert.equal(r.inputs,'geometry/rules only');
  assert.equal(r.outcomeLabelsRead,false);
  assert.equal(r.rows.length,30);
  assert.deepEqual(r.failures,[]);
  for(const x of r.rows){
    assert.equal(x.uniformParityCancellation,x.connectK%4===0);
    if(x.connectK%4===0){
      assert.equal(x.depthGcdEqualsResponseQuotient,true);
      assert.equal(x.responseQuotientDivisibleByPartial2,true);
    }
  }
});
