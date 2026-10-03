import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {
  createCpcxSaturatedColumnCofactor,
  deriveCpcxSaturatedColumnRlcProfile,
  certifyCpcxSaturatedColumnCofactorEvent,
} from './cpcx-saturated-column-cofactor.mjs';

const g=createCpcxGeometry(),center=3;

function histogram(rows,player){
  const out={};
  for(const r of rows.filter(x=>x.player===player))
    out[r.missingCells.length]=(out[r.missingCells.length]??0)+1;
  return out;
}

test('alternating saturated center compiles to exact 42+42 residual quotient',()=>{
  const p=buildCpcxPosition('444444',{geometry:g}),
    q=createCpcxSaturatedColumnCofactor(p,{column:center});
  assert.equal(q.kind,'SATURATED_COLUMN_COFACTOR');
  assert.equal(q.exact,true);
  assert.deepEqual(q.fixedOwnerWord,[0,1,0,1,0,1]);
  assert.deepEqual(q.sideSupport,[0,0,0,0,0,0]);
  assert.equal(q.residualCount,84);
  assert.deepEqual(histogram(q.residuals,0),{3:24,4:18});
  assert.deepEqual(histogram(q.residuals,1),{3:24,4:18});
  assert.equal(q.residuals.some(r=>r.missingCells.some(cell=>
    cell%g.columns===center
  )),false);
});

test('same RLC A/B/H logic runs on saturated-center cofactor',()=>{
  const p=buildCpcxPosition('444444',{geometry:g}),
    q=deriveCpcxSaturatedColumnRlcProfile(p,{column:center});
  assert.equal(q.kind,'SATURATED_COLUMN_RLC_PROFILE');
  assert.deepEqual(q.candidates.map(x=>[
    x.column+1,x.A,x.B,x.H
  ]),[
    [1,2,2,5],
    [2,4,1,5],
    [3,4,2,5],
    [5,4,2,5],
    [6,4,1,5],
    [7,2,2,5],
  ]);
});

test('every current side event commutes with alternating-center projection',()=>{
  const p=buildCpcxPosition('444444',{geometry:g});
  for(const column of [0,1,2,4,5,6]){
    const eventCell=p.heights[column]*g.columns+column,
      c=certifyCpcxSaturatedColumnCofactorEvent(p,{
        column:center,eventCell,
      });
    assert.equal(c.kind,'SATURATED_COLUMN_COFACTOR_EVENT');
    assert.equal(c.exact,true);
    assert.equal(c.residualHomomorphism,true);
    assert.equal(c.sideSupportHomomorphism,true);
    assert.equal(c.fixedOwnerWordPreserved,true);
  }
});

test('nonalternating saturated center remains an exact cofactor boundary',()=>{
  const p=buildCpcxPosition('4444434',{geometry:g}),
    q=createCpcxSaturatedColumnCofactor(p,{column:center});
  assert.equal(q.exact,true);
  assert.deepEqual(q.fixedOwnerWord,[0,1,0,1,0,0]);
  const eventCell=p.heights[0]*g.columns,
    c=certifyCpcxSaturatedColumnCofactorEvent(p,{
      column:center,eventCell,
    });
  assert.equal(c.exact,true);
  assert.equal(c.kind,'SATURATED_COLUMN_COFACTOR_EVENT');
});

test('saturated edge column also admits exact cofactor transition',()=>{
  const p=buildCpcxPosition('111111',{geometry:g}),
    q=createCpcxSaturatedColumnCofactor(p,{column:0});
  assert.equal(q.exact,true);
  assert.deepEqual(q.fixedOwnerWord,[0,1,0,1,0,1]);
  const eventCell=p.heights[3]*g.columns+3,
    c=certifyCpcxSaturatedColumnCofactorEvent(p,{
      column:0,eventCell,
    });
  assert.equal(c.exact,true);
  assert.equal(c.kind,'SATURATED_COLUMN_COFACTOR_EVENT');
});

test('projected completion preserves the same physical first terminal',()=>{
  const p=buildCpcxPosition('4444441727',{geometry:g}),
    c=certifyCpcxSaturatedColumnCofactorEvent(p,{
      column:center,
      eventCell:2,
    });
  assert.equal(c.kind,'SATURATED_COLUMN_COFACTOR_TERMINAL');
  assert.equal(c.exact,true);
  assert.equal(c.terminal.player,0);
  assert.equal(c.firstWinPreserved,true);
  assert.ok(c.projectedCompletions.some(x=>
    x.player===0&&x.lineId===c.terminal.lineId
  ));
});

test('unsaturated column fails closed',()=>{
  const p=buildCpcxPosition('44444',{geometry:g}),
    q=createCpcxSaturatedColumnCofactor(p,{column:center});
  assert.equal(q.kind,'NO_CERTIFICATE');
  assert.equal(q.seam,'COLUMN_NOT_SATURATED');
});

test('saturated-column cofactor implementation stays solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises'),
    source=await readFile(
      new URL('./cpcx-saturated-column-cofactor.mjs',import.meta.url),
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
