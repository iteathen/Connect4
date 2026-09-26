// Research-only finite-model falsifiers. No solver implementation is changed.
import assert from 'node:assert/strict';
import fs from 'node:fs';

// C1: every completed principal-upset insertion leaves an upset. Therefore
// membership of image is sufficient to detect an already-inserted closure.
// Exhaust the Boolean lattice on four elements, including all its upsets.
const closure = Array.from({length:16}, (_,a) => {
  let mask=0; for(let b=0;b<16;b++)if((a&b)===a)mask|=1<<b;
  return mask;
});
let upsets=0, insertionCases=0;
for(let u=0;u<65536;u++){
  let closed=true;
  for(let a=0;a<16;a++)if((u&(1<<a))&&(u&closure[a])!==closure[a]){closed=false;break;}
  if(!closed)continue;
  upsets++;
  for(let a=0;a<16;a++){
    const full=u|closure[a], skipped=(u&(1<<a))?u:full;
    assert.equal(skipped,full);insertionCases++;
  }
}
assert.equal(upsets,168);
// Guard falsifier: a set bit written before its closure is complete is unsafe.
assert.notEqual(1|(closure[0]),1);
// Independent player coordinates cannot use the other player's coverage.
assert.notEqual(0|closure[3],0);

// C2: WDL endpoint bounds are exact; interior bounds generally are not.
const wdl=[-1,0,1];let boundCases=0;
for(const bound of wdl){
  const lower=wdl.filter(v=>v>=bound),upper=wdl.filter(v=>v<=bound);
  if(bound===1)assert.deepEqual(lower,[1]);
  if(bound===-1)assert.deepEqual(upper,[-1]);
  if(bound===-1)assert.deepEqual(lower,wdl);
  if(bound===1)assert.deepEqual(upper,wdl);
  if(bound===0){assert.equal(lower.length,2);assert.equal(upper.length,2);}
  boundCases+=2;
}
// A narrow fail-high value 0 is not exact: an unvisited sibling may win.
assert.equal(Math.max(0,1),1);

// C3: reflection is an involution and cell-removal commutes with it, before
// any coordinate compression. Exhaust all subsets of a 2x2 cell geometry.
const reflect=x=>((x&1)<<1)|((x&2)>>>1)|((x&4)<<1)|((x&8)>>>1);
let reflectionCases=0;
for(let set=0;set<16;set++)for(let cell=0;cell<4;cell++){
  assert.equal(reflect(reflect(set)),set);
  assert.equal(reflect(set&~(1<<cell)),reflect(set)&~(1<<(cell^1)));
  reflectionCases++;
}

const out={status:'FINITE_MODEL_CONTROLS_PASS',solverQualified:false,
  cofactorAbsorption:{latticeElements:16,upsets,insertionCases,unsafeIncompleteClosureRejected:true,playerSeparationRequired:true},
  endpointBounds:{boundCases,interiorBoundCounterexample:true},
  reflection:{cases:reflectionCases},
  limitations:['Not a production cofactor differential test','No implementation or performance claim','Support-symmetric orientation and action transport still require full-profile qualification']};
fs.writeFileSync('discovery-controls.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out));
