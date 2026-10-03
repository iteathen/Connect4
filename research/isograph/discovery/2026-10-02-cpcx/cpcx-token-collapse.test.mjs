import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {compileCpcxPostActionWingAttack} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {collapseCpcxDebtRepairTokenProduct} from './cpcx-token-collapse.mjs';

const g=createCpcxGeometry();

function collapse(move,decisionIndex){
  const root=buildCpcxPosition('44444',{geometry:g}),
    column=move-1,
    actionCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,
      actionOwner:1,
      attacker:0,
    }),
    repair=deriveCpcxUniversalDebtRepair(root,wing,{decisionIndex});
  return collapseCpcxDebtRepairTokenProduct(root,wing,repair);
}

test('first-deviation classes collapse without arbitrary second-frontier product',()=>{
  for(let move=1;move<=7;move++){
    const c=collapse(move,0);
    assert.equal(c.kind,'ABSTRACT_SUCCESSOR',String(move));
    assert.equal(c.exact,true,String(move));
    assert.equal(c.nextMover,0,String(move));
    assert.equal(c.rank.allSameParity,true,String(move));
    assert.equal(c.rank.parity,0,String(move));
    assert.equal(c.choiceEnumeration,false,String(move));
    assert.ok(c.responseClassCount>=1,String(move));
    assert.ok(c.guaranteedResiduals.length>=1,String(move));
    assert.ok(c.classes.every(x=>
      [
        'DIRECT_VERTICAL',
        'VERTICAL_SAFE_RESPONSE_SET',
        'NORMALIZATION_HAZARD',
        'IMMEDIATE_NORMALIZATION',
      ].includes(x.deviationClass)
    ),String(move));
  }
});

test('reflection-canonical second-deviation class advances for every sixth move',()=>{
  for(let move=1;move<=7;move++){
    const c=collapse(move,1);
    assert.equal(c.kind,'ABSTRACT_SUCCESSOR',String(move));
    assert.equal(c.exact,true,String(move));
    assert.equal(c.nextMover,0,String(move));
    assert.equal(c.rank.allSameParity,true,String(move));
    assert.equal(c.rank.parity,0,String(move));
    assert.equal(c.choiceEnumeration,false,String(move));
  }
});

test('token collapse source contains no deviation x free-frontier Cartesian product loop',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-token-collapse.mjs',import.meta.url),'utf8');
  assert.equal(source.includes('for(const freeCell of frontier'),false);
  assert.equal(source.includes('responseClassProductSize'),false);
  assert.match(source,/no arbitrary second-frontier product/i);
});

test('token collapse remains solved-data and production-CPC isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-token-collapse.mjs',import.meta.url),'utf8');
  for(const forbidden of ['cpc-connect4','ExactConnect4Oracle','components/oracle','solveSequence('])
    assert.equal(source.includes(forbidden),false,forbidden);
});
