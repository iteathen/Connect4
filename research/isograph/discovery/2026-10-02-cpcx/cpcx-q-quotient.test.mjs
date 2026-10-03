import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  buildCpcxQCarrier,
  keyCpcxQCarrier,
  permuteCpcxQCarrier,
  canonicalizeCpcxQColumnOrbit,
  findCpcxQColumnTransporter,
} from './cpcx-q-quotient.mjs';

const g=createCpcxGeometry();

function isSubset(a,b){
  return a.every(x=>b.includes(x));
}

test('q_o residual families are normalized antichains',()=>{
  for(const sequence of ['','443','44444','475447511352']){
    const p=buildCpcxPosition(sequence,{geometry:g}),
      q=buildCpcxQCarrier(p);
    for(const family of q.residuals){
      for(let i=0;i<family.length;i++)for(let j=0;j<family.length;j++){
        if(i===j)continue;
        assert.equal(
          isSubset(family[i],family[j]),
          false,
          sequence+' residual '+i+' subset '+j,
        );
      }
    }
  }
});

test('horizontal reflection is an exact q_o column transporter',()=>{
  const a=buildCpcxPosition('32612636',{geometry:g}),
    b=buildCpcxPosition('56276252',{geometry:g}),
    t=findCpcxQColumnTransporter(a,b);
  assert.ok(t);
  assert.equal(t.exact,true);
  assert.deepEqual(t.permutation,[6,5,4,3,2,1,0]);
  assert.equal(
    keyCpcxQCarrier(
      permuteCpcxQCarrier(buildCpcxQCarrier(a),t.permutation)
    ),
    keyCpcxQCarrier(buildCpcxQCarrier(b)),
  );
});

test('q_o transporter commutes with every current legal successor',()=>{
  const a=buildCpcxPosition('32612636',{geometry:g}),
    b=buildCpcxPosition('56276252',{geometry:g}),
    t=findCpcxQColumnTransporter(a,b);
  assert.ok(t);
  for(let c=0;c<g.columns;c++){
    if(a.heights[c]>=g.rows)continue;
    const d=t.permutation[c];
    assert.ok(b.heights[d]<g.rows);
    const ca=applyCpcxForcedEvent(a,a.heights[c]*g.columns+c),
      cb=applyCpcxForcedEvent(b,b.heights[d]*g.columns+d);
    assert.equal(ca.terminal?.player??null,cb.terminal?.player??null);
    if(ca.terminal||cb.terminal)continue;
    assert.equal(
      keyCpcxQCarrier(
        permuteCpcxQCarrier(buildCpcxQCarrier(ca),t.permutation)
      ),
      keyCpcxQCarrier(buildCpcxQCarrier(cb)),
    );
  }
});

test('q_o column orbit contains the exact reflection orbit',()=>{
  const a=buildCpcxPosition('443',{geometry:g}),
    b=buildCpcxPosition('445',{geometry:g}),
    qa=canonicalizeCpcxQColumnOrbit(a),
    qb=canonicalizeCpcxQColumnOrbit(b);
  assert.equal(qa.exact,true);
  assert.equal(qb.exact,true);
  assert.equal(qa.key,qb.key);
});

test('q_o quotient source is generic and isolated from solved/search machinery',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-q-quotient.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    "'44444'",
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'opening book',
    'lossDepth',
    'remoteness',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
  assert.match(source,/normalized P0 residual antichain/);
  assert.match(source,/Q_CONGRUENCE_FINAL_QUALIFICATION_0_2/);
});
