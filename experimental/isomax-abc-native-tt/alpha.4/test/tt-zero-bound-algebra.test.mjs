import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareGeometry} from '../shared/geometry.mjs';
import {SourceState} from '../shared/source-state.mjs';
import {PhysicalState} from '../variants/a-physical/state.mjs';
import {PhysicalTT} from '../variants/a-physical/tt.mjs';
import {ExactTT} from '../variants/b-source/tt.mjs';
import {GuardedTT,FORK_ATTEMPTED_NO_CERTIFICATE} from '../variants/c-guarded/tt.mjs';
function validate(geometry,Type,State,proof=false){
 const g=prepareGeometry(geometry),s=new State(g),tt=new Type(g,0.003);
 const spot=tt.slot(tt.hash(s));
 tt.put(s,spot,4,3,proof);
 assert.equal(tt.probe(s,spot)&7,4);
 tt.put(s,spot,5,-1,false);
 const exact=tt.probe(s,spot);
 assert.equal(exact&7,2,'opposing proven zero bounds must fuse into exact draw');
 if(proof)assert.ok(exact&FORK_ATTEMPTED_NO_CERTIFICATE,'negative proof hint survives same-key merge');
 tt.put(s,spot,4,0,false);
 assert.equal(tt.probe(s,spot)&7,2,'weaker bound must not overwrite exact draw');
 s.apply(0);
 const newSpot=tt.slot(tt.hash(s));
 tt.put(s,newSpot,3,1,false);
 assert.equal(tt.probe(s,newSpot)&7,3);
 // Force exact-slot collision: old key is rejected even though the tag exists.
 if(newSpot!==spot)tt.put(s,spot,3,1,false);
 s.undo(0);
 assert.equal(tt.probe(s,spot)&7,0,'different exact key cannot match');
}
test('A/B/C native transposition rows fuse complementary zero bounds without false key matches',()=>{
 for(const dims of [[4,4],[7,6],[10,10]]){
  const geometry={columns:dims[0],rows:dims[1]};
  validate(geometry,PhysicalTT,PhysicalState);
  validate(geometry,ExactTT,SourceState);
  validate(geometry,GuardedTT,SourceState,true);
 }
});
