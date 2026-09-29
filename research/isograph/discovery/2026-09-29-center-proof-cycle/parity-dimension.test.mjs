import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseTable,analyze} from './dimension-outcomes.mjs';
import {phaseFeatures,boundaryCensus,boundaryWitness} from './parity-geometry.mjs';

test('external table axes and outcome labels are preserved, not solver inputs',()=>{
  const html=readFileSync(new URL('BOARD_SIZE_SOURCE.html',import.meta.url),'utf8');
  const rows=parseTable(html);assert.equal(rows.length,37);
  for(const [w,h,v] of [[5,6,0],[7,6,1],[9,6,-1],[7,4,0],[8,8,-1],[6,9,1]])
    assert.equal(rows.find(r=>r.width===w&&r.height===h).firstPlayerWdl,v);
  assert.equal(Object.values(analyze(html).parity).reduce((s,g)=>s+g.boards,0),37);
  assert.throws(()=>parseTable('<tr><th>6</th><td>+</td><td>unknown</td></tr>'));
});
test('center stack parity and finite response defects are different facts',()=>{
  for(let n=1;n<=5;n++){
    const p=phaseFeatures(7,6,Array(n).fill(3));
    assert.equal(p.prefixConsistent,true);assert.equal(p.bulkSafe,!!(n&1));
    assert.equal(p.unmatched.reduce((a,b)=>a+b),n&1);
    if(n&1)assert.equal(p.firstPossibleUnmatchedMove,6-n);
  }
  assert.deepEqual(phaseFeatures(7,5,[3]).unmatched,[1,1,1,0,1,1,1]);
  // Width seven's single safe setup follows incidence, not just odd width.
  for(let w=4;w<=11;w++){
    const safe=Array.from({length:w},(_,c)=>phaseFeatures(w,6,[c])).filter(x=>x.bulkSafe);
    assert.equal(safe.length,Math.max(0,8-w));
  }
});
test('all 4096 endpoints replay from every odd center prefix without an earlier win',()=>{
  const c=boundaryCensus();assert.equal(c.counts.states,4096);
  assert.equal(c.counts.fullDraw,1);assert.equal(c.endpointSetsEqual,true);
  assert.equal(boundaryWitness(3,[3,3,3,3,3,3]).length,42);
  assert.throws(()=>boundaryWitness(2,[0,0,0,0,0,0]));
});
