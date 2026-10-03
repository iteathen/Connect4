import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {
  deriveCpcxSingleOddCapacityDebt,
  certifyCpcxSingleOddCapacityDebtMacro,
  compareCpcxDebtProgress,
} from './cpcx-parity-debt.mjs';

const g=createCpcxGeometry(),center=3;

function candidateResponse(debtColumn,triggerColumn){
  const d=Math.abs(debtColumn-center);
  if(d===1)return debtColumn;
  if(d===2)
    return triggerColumn===0||triggerColumn===6
      ?debtColumn
      :triggerColumn;
  if(d===3)return triggerColumn;
  throw new Error('unexpected debt distance');
}

test('turn6 handoff has exactly one odd side-capacity debt',()=>{
  for(const x of [0,1,2,4,5,6]){
    const p=buildCpcxPosition('44444'+(x+1)+'4',{geometry:g}),
      d=deriveCpcxSingleOddCapacityDebt(p,{
        excludedColumns:[center],
      });
    assert.equal(d.kind,'SINGLE_ODD_CAPACITY_DEBT');
    assert.equal(d.exact,true);
    assert.equal(d.debtColumn,x);
    assert.equal(d.totalRemaining,35);
    assert.equal(d.capacities.filter(y=>y.parity===1).length,1);
  }
});

test('same-column response stutters one odd debt',()=>{
  const p=buildCpcxPosition('4444414',{geometry:g}),
    c=certifyCpcxSingleOddCapacityDebtMacro(p,{
      debtColumn:0,
      triggerColumn:2,
      responseColumn:2,
      excludedColumns:[center],
    });
  assert.equal(c.kind,'SINGLE_ODD_CAPACITY_DEBT_TRANSPORT');
  assert.equal(c.mode,'SELF_STUTTER');
  assert.equal(c.debtColumnBefore,0);
  assert.equal(c.debtColumnAfter,0);
  assert.equal(c.capacityDelta,-2);
});

test('off-pair response in debt column switches debt to trigger column',()=>{
  const p=buildCpcxPosition('4444434',{geometry:g}),
    c=certifyCpcxSingleOddCapacityDebtMacro(p,{
      debtColumn:2,
      triggerColumn:0,
      responseColumn:2,
      excludedColumns:[center],
    });
  assert.equal(c.kind,'SINGLE_ODD_CAPACITY_DEBT_TRANSPORT');
  assert.equal(c.mode,'DEBT_SWITCH');
  assert.equal(c.debtColumnBefore,2);
  assert.equal(c.debtColumnAfter,0);
});

test('qualified defect-distance response rule preserves single debt and never moves it inward',()=>{
  for(const x of [0,1,2,4,5,6]){
    const source=buildCpcxPosition('44444'+(x+1)+'4',{geometry:g}),
      before=deriveCpcxSingleOddCapacityDebt(source,{
        excludedColumns:[center],
      });
    assert.equal(before.debtColumn,x);

    for(const triggerColumn of [0,1,2,4,5,6]){
      const responseColumn=candidateResponse(x,triggerColumn),
        c=certifyCpcxSingleOddCapacityDebtMacro(source,{
          debtColumn:x,
          triggerColumn,
          responseColumn,
          excludedColumns:[center],
        });
      assert.equal(c.kind,'SINGLE_ODD_CAPACITY_DEBT_TRANSPORT',
        'x='+(x+1)+' trigger='+(triggerColumn+1)+' seam='+c.seam);
      assert.equal(c.exact,true);
      const progress=compareCpcxDebtProgress(c.before,c.after,{
        centerColumn:center,
      });
      assert.equal(progress.distanceNondecreasing,true,
        'x='+(x+1)+' trigger='+(triggerColumn+1));
      assert.equal(progress.strictLexicographicDecrease,true,
        'x='+(x+1)+' trigger='+(triggerColumn+1));
    }
  }
});

test('top exhaustion exposes exactly one unmatched parity response debt',()=>{
  const p=buildCpcxPosition('44444411111',{geometry:g}),
    d=deriveCpcxSingleOddCapacityDebt(p,{
      excludedColumns:[center],
    });
  assert.equal(d.exact,true);
  assert.equal(d.debtColumn,0);
  assert.equal(d.capacities.find(x=>x.column===0).capacity,1);

  const c=certifyCpcxSingleOddCapacityDebtMacro(p,{
    debtColumn:0,
    triggerColumn:0,
    responseColumn:0,
    excludedColumns:[center],
  });
  assert.equal(c.kind,'TOP_EXHAUSTION_DEBT_BOUNDARY');
  assert.equal(c.exact,true);
  assert.equal(c.exhaustedColumn,0);
  assert.equal(c.unmatchedResponseCount,1);
});

test('response outside trigger/debt pair is rejected by parity theorem',()=>{
  const p=buildCpcxPosition('4444434',{geometry:g}),
    c=certifyCpcxSingleOddCapacityDebtMacro(p,{
      debtColumn:2,
      triggerColumn:0,
      responseColumn:5,
      excludedColumns:[center],
    });
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'RESPONSE_DOES_NOT_PRESERVE_SINGLE_DEBT_BY_PARITY');
});

test('parity-debt implementation remains solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises'),
    source=await readFile(
      new URL('./cpcx-parity-debt.mjs',import.meta.url),
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
