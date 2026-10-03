import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {deriveCpcxCommonRlcGuard} from './cpcx-common-rlc-guard.mjs';

const g=createCpcxGeometry(),center=3;

function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}

test('identical saturated-center states expose their ordinary Pareto set as common guard',()=>{
  const a=buildCpcxPosition('4444443',{geometry:g}),
    b=buildCpcxPosition('4444443',{geometry:g}),
    q=deriveCpcxCommonRlcGuard(a,b,{saturatedColumn:center});
  assert.equal(q.kind,'COMMON_RLC_GUARD');
  assert.equal(q.exact,true);
  assert.equal(q.pairDefectSize,0);
  assert.ok(q.guardSize>0);
  assert.deepEqual(q.guardColumns,q.leftPareto.map(x=>x.column));
  assert.deepEqual(q.guardColumns,q.rightPareto.map(x=>x.column));
});

test('all six turn6 exchange pairs have nonempty common guard after every current side trigger',()=>{
  let cases=0;
  for(const x of [1,2,3,5,6,7]){
    const left=buildCpcxPosition('44444'+x+'4',{geometry:g}),
      right=buildCpcxPosition('444444'+x,{geometry:g});
    for(const eventCell of frontier(left)){
      const l=applyCpcxForcedEvent(left,eventCell),
        r=applyCpcxForcedEvent(right,eventCell);
      assert.equal(l.terminal,null);
      assert.equal(r.terminal,null);
      const q=deriveCpcxCommonRlcGuard(l,r,{saturatedColumn:center});
      assert.equal(q.kind,'COMMON_RLC_GUARD',
        'x='+x+' event='+eventCell+' seam='+q.seam);
      assert.equal(q.exact,true);
      assert.ok(q.guardSize>=1);
      cases++;
    }
  }
  assert.equal(cases,36);
});

test('same-support requirement fails closed when paired states diverge in support',()=>{
  const a=buildCpcxPosition('4444443',{geometry:g}),
    b=buildCpcxPosition('4444445',{geometry:g}),
    q=deriveCpcxCommonRlcGuard(a,b,{saturatedColumn:center});
  assert.equal(q.kind,'NO_CERTIFICATE');
  assert.equal(q.seam,'PAIR_NOT_ADMISSIBLE');
  assert.equal(q.pair.seam,'SUPPORT_MISMATCH');
});

test('common RLC guard operator remains solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises'),
    source=await readFile(
      new URL('./cpcx-common-rlc-guard.mjs',import.meta.url),
      'utf8'
    );
  for(const forbidden of [
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
