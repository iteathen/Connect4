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
  assert.equal(r.firstSeam,'ABSTRACT_OPPONENT_SINGLETON_ENVELOPE_MISSING');

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
      assert.equal(x.result.kind,'NO_CERTIFICATE');
      if(x.successor.kind==='ABSTRACT_SUCCESSOR'){
        assert.equal(x.successor.choiceEnumeration,false);
        assert.equal(x.result.seam,'ABSTRACT_OPPONENT_SINGLETON_ENVELOPE_MISSING');
      }else{
        assert.equal(x.successor.kind,'NO_CERTIFICATE');
        assert.equal(row.actionColumn,2); // one-based move 3 special second-deviation seam
        assert.equal(x.class,'HONOR_FIRST_DEVIATE_SECOND');
        assert.equal(x.result.seam,'VERTICAL_TWO_STAGE_CLASSIFICATION_MISSING');
      }
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
