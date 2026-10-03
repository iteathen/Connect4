import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {
  certifyCpcxGlobalEventPhaseGauge,
} from './cpcx-global-event-phase-gauge.mjs';

function cell(g,c,r){return r*g.columns+c;}

test('empty-board relative phase is row parity only',()=>{
  const g=createCpcxGeometry({columns:5,rows:4,connect:4}),
    s=buildCpcxPosition('',{geometry:g}),
    cells=[cell(g,0,0),cell(g,2,1),cell(g,4,3)],
    c=certifyCpcxGlobalEventPhaseGauge(s,s,{cells});
  assert.equal(c.kind,'GLOBAL_EVENT_PHASE_GAUGE');
  assert.equal(c.exact,true);
  assert.deepEqual(c.relativePhase,[0,1,1]);
  assert.equal(c.phaseFlip,0);
});

test('fresh non-bottom cell set preserves relative phase across one ply',()=>{
  const g=createCpcxGeometry({columns:5,rows:5,connect:4}),
    s=buildCpcxPosition('1',{geometry:g}),
    t=buildCpcxPosition('12',{geometry:g}),
    cells=[cell(g,2,2),cell(g,3,3),cell(g,4,4)],
    c=certifyCpcxGlobalEventPhaseGauge(s,t,{cells});
  assert.equal(c.kind,'GLOBAL_EVENT_PHASE_GAUGE');
  assert.equal(c.phaseFlip,1);
  assert.deepEqual(c.targetParity,c.sourceParity.map(x=>x^1));
  assert.deepEqual(c.relativePhase,[0,1,0]);
});

test('two-ply transport restores absolute parity',()=>{
  const g=createCpcxGeometry({columns:5,rows:5,connect:4}),
    s=buildCpcxPosition('1',{geometry:g}),
    t=buildCpcxPosition('123',{geometry:g}),
    cells=[cell(g,2,2),cell(g,3,3),cell(g,4,4)],
    c=certifyCpcxGlobalEventPhaseGauge(s,t,{cells});
  assert.equal(c.kind,'GLOBAL_EVENT_PHASE_GAUGE');
  assert.equal(c.phaseFlip,0);
  assert.deepEqual(c.targetParity,c.sourceParity);
});

test('occupied selected target fails closed',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    s=buildCpcxPosition('',{geometry:g}),
    t=buildCpcxPosition('1',{geometry:g}),
    c=certifyCpcxGlobalEventPhaseGauge(s,t,{cells:[cell(g,0,0),cell(g,1,2)]});
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SELECTED_CELL_OCCUPIED');
});

test('support distances may change while relative phase remains fixed',()=>{
  const g=createCpcxGeometry({columns:5,rows:5,connect:4}),
    s=buildCpcxPosition('12',{geometry:g}),
    t=buildCpcxPosition('1234',{geometry:g}),
    cells=[cell(g,0,3),cell(g,2,4),cell(g,4,2)],
    before=cells.map(cell=>{
      const c=cell%g.columns,r=Math.floor(cell/g.columns);
      return r-s.heights[c];
    }),
    after=cells.map(cell=>{
      const c=cell%g.columns,r=Math.floor(cell/g.columns);
      return r-t.heights[c];
    }),
    cert=certifyCpcxGlobalEventPhaseGauge(s,t,{cells});
  assert.notDeepEqual(before,after);
  assert.equal(cert.kind,'GLOBAL_EVENT_PHASE_GAUGE');
  assert.deepEqual(cert.relativePhase,[0,1,1]);
});

test('global phase gauge implementation is search/oracle isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-global-event-phase-gauge.mjs',import.meta.url),'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'U4',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
