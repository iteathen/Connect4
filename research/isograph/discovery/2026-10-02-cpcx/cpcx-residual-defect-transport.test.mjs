import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {
  createCpcxResidualDefectPair,
  certifyCpcxResidualDefectTransport,
} from './cpcx-residual-defect-transport.mjs';

const g=createCpcxGeometry(),center=3;

function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}

test('identical positions have empty residual defect and preserve it',()=>{
  const a=buildCpcxPosition('12',{geometry:g}),
    b=buildCpcxPosition('12',{geometry:g}),
    pair=createCpcxResidualDefectPair(a,b);
  assert.equal(pair.kind,'RESIDUAL_DEFECT_PAIR');
  assert.equal(pair.exact,true);
  assert.equal(pair.defectSize,0);

  const c=certifyCpcxResidualDefectTransport(a,b,{
    eventCell:3,
  });
  assert.equal(c.kind,'BOUNDED_RESIDUAL_DEFECT_TRANSPORT');
  assert.equal(c.exact,true);
  assert.equal(c.sourceDefectSize,0);
  assert.equal(c.targetDefectSize,0);
});

test('same-support owner swap is represented only by bounded residual defect',()=>{
  const a=buildCpcxPosition('12',{geometry:g}),
    b=buildCpcxPosition('21',{geometry:g}),
    pair=createCpcxResidualDefectPair(a,b);
  assert.equal(pair.exact,true);
  assert.deepEqual(Array.from(a.heights),Array.from(b.heights));
  assert.equal(a.mover,b.mover);
  assert.ok(pair.commonCount>0);
  assert.ok(pair.defectSize>0);
  assert.equal(pair.defectSize,pair.leftDefectCount+pair.rightDefectCount);
});

test('a common external event cannot grow an owner-swap residual defect',()=>{
  const a=buildCpcxPosition('12',{geometry:g}),
    b=buildCpcxPosition('21',{geometry:g}),
    source=createCpcxResidualDefectPair(a,b),
    c=certifyCpcxResidualDefectTransport(a,b,{
      eventCell:3,
    });
  assert.equal(c.kind,'BOUNDED_RESIDUAL_DEFECT_TRANSPORT');
  assert.equal(c.exact,true);
  assert.equal(c.defectNonincreasing,true);
  assert.ok(c.commonSurvivorCount>0);
  assert.ok(c.targetDefectSize<=source.defectSize);
});

test('event through a defect column contracts or kills only existing defect rows',()=>{
  const a=buildCpcxPosition('12',{geometry:g}),
    b=buildCpcxPosition('21',{geometry:g}),
    source=createCpcxResidualDefectPair(a,b),
    a2=7,
    c=certifyCpcxResidualDefectTransport(a,b,{
      eventCell:a2,
    });
  assert.equal(c.kind,'BOUNDED_RESIDUAL_DEFECT_TRANSPORT');
  assert.equal(c.exact,true);
  assert.ok(c.targetDefectSize<=source.defectSize);
  assert.ok(
    c.leftDefectSurvivorCount<source.leftDefectCount||
    c.rightDefectSurvivorCount<source.rightDefectCount||
    c.targetDefectSize<source.defectSize
  );
});

test('first-terminal disagreement is exposed as a defect observation',()=>{
  const a=buildCpcxPosition('121212',{geometry:g}),
    b=buildCpcxPosition('212121',{geometry:g}),
    a4=21,
    c=certifyCpcxResidualDefectTransport(a,b,{
      eventCell:a4,
    });
  assert.equal(c.kind,'DEFECT_OBSERVABLE_FIRST_TERMINAL');
  assert.equal(c.exact,true);
  assert.equal(c.terminalLeft?.player,0);
  assert.equal(c.terminalRight,null);
  assert.equal(c.terminalDifferenceExplainedByDefect,true);
  assert.ok(c.leftDefectCompletions.some(x=>x.player===0));
});

test('all six turn6 exchange pairs begin in three reflected bounded-defect sizes',()=>{
  const rows=[];
  for(const x of [1,2,3,5,6,7]){
    const a=buildCpcxPosition(`44444${x}4`,{geometry:g}),
      b=buildCpcxPosition(`444444${x}`,{geometry:g}),
      pair=createCpcxResidualDefectPair(a,b,{
        saturatedColumn:center,
      });
    assert.equal(pair.exact,true);
    rows.push({
      x,
      distance:Math.abs(x-4),
      defectSize:pair.defectSize,
    });

    for(const eventCell of frontier(a)){
      const c=certifyCpcxResidualDefectTransport(a,b,{
        eventCell,
        saturatedColumn:center,
      });
      assert.equal(c.exact,true,`x=${x} event=${eventCell} seam=${c.seam}`);
      assert.ok([
        'BOUNDED_RESIDUAL_DEFECT_TRANSPORT',
        'COMMON_FIRST_TERMINAL',
        'DEFECT_OBSERVABLE_FIRST_TERMINAL',
      ].includes(c.kind));
      if(c.kind==='BOUNDED_RESIDUAL_DEFECT_TRANSPORT')
        assert.ok(c.targetDefectSize<=c.sourceDefectSize);
    }
  }

  for(const d of [1,2,3]){
    const xs=rows.filter(x=>x.distance===d);
    assert.equal(xs.length,2);
    assert.equal(xs[0].defectSize,xs[1].defectSize);
  }
  assert.deepEqual(
    [...new Set(rows.map(x=>x.defectSize))].sort((a,b)=>a-b),
    [16,17,18]
  );
});

test('residual-defect transport remains solver and search isolated',async()=>{
  const {readFile}=await import('node:fs/promises'),
    source=await readFile(
      new URL('./cpcx-residual-defect-transport.mjs',import.meta.url),
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
