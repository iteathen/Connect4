import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {attemptCpcxDisjointWingFirstWin} from './cpcx-move6-certificate.mjs';

const g=createCpcxGeometry();

test('44444 move6 attempt uses flat universal response classes and reports the first exact seam',()=>{
  const root=buildCpcxPosition('44444',{geometry:g}),
    r=attemptCpcxDisjointWingFirstWin(root,{attacker:0});
  assert.equal(r.recursive,false);
  assert.equal(r.flatResponseSetOnly,true);
  assert.equal(r.universalCurrentResponseQuantification,true);
  assert.equal(r.currentResponseSet.length,7);
  assert.equal(r.kind,'NO_CERTIFICATE');
  assert.equal(r.exact,false);
  assert.equal(r.firstSeam,'ABSTRACT_IMMEDIATE_NORMALIZATION_NOT_CLOSED');

  for(const row of r.rows){
    assert.equal(row.exact,true);
    assert.equal(row.selectedMacro,'THREE_TRIGGER_WING_ATTACK');
    assert.equal(row.responseClasses.length,3);
    const names=row.responseClasses.map(x=>x.class);
    assert.deepEqual(names,[
      'HONOR_BOTH',
      'DEVIATE_FIRST',
      'HONOR_FIRST_DEVIATE_SECOND',
    ]);
    assert.equal(row.responseClasses[0].result.kind,'CERTIFIED_FIRST_WIN');
    assert.equal(row.responseClasses[0].result.attacker,0);
    for(const x of row.responseClasses.slice(1)){
      assert.equal(x.setWise,true);
      assert.ok(x.quantifiedCells.length>=1);
      assert.equal(x.successor.kind,'ABSTRACT_SUCCESSOR');
      assert.equal(x.successor.choiceEnumeration,false);
      assert.equal(x.result.kind,'NO_CERTIFICATE');
      assert.equal(x.result.seam,'ABSTRACT_IMMEDIATE_NORMALIZATION_NOT_CLOSED');
    }
  }
});

test('NO_CERTIFICATE from move6 attempt carries no draw or loss conclusion',()=>{
  const root=buildCpcxPosition('44444',{geometry:g}),
    r=attemptCpcxDisjointWingFirstWin(root,{attacker:0});
  assert.equal(r.kind,'NO_CERTIFICATE');
  assert.equal(Object.prototype.hasOwnProperty.call(r,'draw'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(r,'loss'),false);
  assert.match(r.semantics,/no draw\/loss\/value inference/i);
});
