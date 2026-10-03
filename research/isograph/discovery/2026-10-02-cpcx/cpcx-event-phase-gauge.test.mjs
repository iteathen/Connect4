import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {
  deriveCpcxEventPhaseGauge,
  compareCpcxEventPhaseGauge,
} from './cpcx-event-phase-gauge.mjs';

const g=createCpcxGeometry();
const cell=(column,row)=>row*g.columns+column;

test('empty-board residual-shaped cells have row-relative phase signature',()=>{
  const p=buildCpcxPosition('',{geometry:g}),
    cells=[cell(0,0),cell(1,1),cell(2,2)],
    q=deriveCpcxEventPhaseGauge(p,cells);
  assert.equal(q.kind,'EVENT_PHASE_GAUGE');
  assert.equal(q.exact,true);
  assert.deepEqual(q.absoluteParity,[1,0,1]);
  assert.deepEqual(q.relativeParity,[0,1,0]);
  assert.deepEqual(q.rowRelativeParity,[0,1,0]);
  assert.deepEqual(q.projectedOwners,[0,1,0]);
  assert.deepEqual(q.geometryProjectedOwners,[0,1,0]);
});

test('one exact physical ply globally complements untouched event parity',()=>{
  const a=buildCpcxPosition('',{geometry:g}),
    b=buildCpcxPosition('4',{geometry:g}),
    cells=[cell(0,1),cell(2,2),cell(6,3)],
    q=compareCpcxEventPhaseGauge(a,b,cells);
  assert.equal(q.kind,'EVENT_PHASE_GAUGE_TRANSPORT');
  assert.equal(q.exact,true);
  assert.equal(q.rankDelta,1);
  assert.equal(q.globalFlip,1);
  assert.deepEqual(
    q.absoluteParityAfter,
    q.absoluteParityBefore.map(x=>x^1)
  );
  assert.equal(q.relativePhaseInvariant,true);
  assert.equal(q.projectedOwnerInvariant,true);
  assert.deepEqual(q.projectedOwners,[1,0,1]);
});

test('two physical plies restore absolute event parity on untouched cells',()=>{
  const a=buildCpcxPosition('',{geometry:g}),
    b=buildCpcxPosition('44',{geometry:g}),
    cells=[cell(0,1),cell(2,2),cell(6,3)],
    q=compareCpcxEventPhaseGauge(a,b,cells);
  assert.equal(q.exact,true);
  assert.equal(q.rankDelta,2);
  assert.equal(q.globalFlip,0);
  assert.deepEqual(q.absoluteParityAfter,q.absoluteParityBefore);
  assert.equal(q.relativePhaseInvariant,true);
});

test('relative phase survives a same-column support-distance change',()=>{
  const a=buildCpcxPosition('13',{geometry:g}),
    b=buildCpcxPosition('131',{geometry:g}),
    cells=[cell(0,2),cell(2,3),cell(4,1)],
    qa=deriveCpcxEventPhaseGauge(a,cells),
    qb=deriveCpcxEventPhaseGauge(b,cells),
    q=compareCpcxEventPhaseGauge(a,b,cells);
  assert.equal(qa.supportDistances[0],1);
  assert.equal(qb.supportDistances[0],0);
  assert.equal(q.exact,true);
  assert.equal(q.globalFlip,1);
  assert.deepEqual(q.relativeParity,qa.relativeParity);
  assert.deepEqual(q.relativeParity,qb.relativeParity);
});

test('phase transport fails closed when a selected target becomes occupied',()=>{
  const a=buildCpcxPosition('',{geometry:g}),
    b=buildCpcxPosition('1',{geometry:g}),
    q=compareCpcxEventPhaseGauge(a,b,[cell(0,0),cell(1,1)]);
  assert.equal(q.kind,'NO_CERTIFICATE');
  assert.equal(q.exact,false);
  assert.equal(q.seam,'SELECTED_CELL_OCCUPIED');
  assert.equal(q.side,'AFTER');
});


test('zero-reservation owner is invariant across rank and support changes',()=>{
  const a=buildCpcxPosition('13',{geometry:g}),
    b=buildCpcxPosition('1314',{geometry:g}),
    cells=[cell(0,2),cell(2,3),cell(4,1)],
    qa=deriveCpcxEventPhaseGauge(a,cells),
    qb=deriveCpcxEventPhaseGauge(b,cells);
  assert.equal(qa.exact,true);
  assert.equal(qb.exact,true);
  assert.notDeepEqual(qa.absoluteParity,qb.absoluteParity);
  assert.deepEqual(qa.projectedOwners,qb.projectedOwners);
  assert.deepEqual(qa.projectedOwners,[0,1,1]);
});

test('geometry-only owner gauge includes the rectangular parity offset',()=>{
  const g45=createCpcxGeometry({columns:4,rows:5,connect:4}),
    p=buildCpcxPosition('',{geometry:g45}),
    c=(column,row)=>row*g45.columns+column,
    q=deriveCpcxEventPhaseGauge(p,[c(0,0),c(1,1),c(2,2)]);
  assert.equal(q.exact,true);
  assert.deepEqual(q.projectedOwners,[1,0,1]);
  assert.deepEqual(q.geometryProjectedOwners,[1,0,1]);
  assert.equal(q.ownershipFormula,
    'zeroReservationOwner = (boardRows * (boardColumns - 1) + row) mod 2');
});

test('event-phase module is production CPC and solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-event-phase-gauge.mjs',import.meta.url),
    'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
