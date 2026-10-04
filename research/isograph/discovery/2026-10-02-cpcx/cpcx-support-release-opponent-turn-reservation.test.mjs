import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxSupportReleaseOpponentTurnReservation,
} from './cpcx-support-release-opponent-turn-reservation.mjs';

function cell(g,column,row=0){
  return row*g.columns+column;
}
function residual(position,player,lineLabel){
  const row=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(row,lineLabel);
  return row;
}

test('fresh opponent-turn depth-one singleton produces exact reservation',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('11221',{geometry:g}),
    r=residual(p,1,'A2-B2-C2'),
    c=certifyCpcxSupportReleaseOpponentTurnReservation(p,{
      ownerResidual:r,
    });

  assert.equal(p.mover,1);
  assert.equal(r.missingCount,1);
  assert.deepEqual(r.events.map(e=>e.supportDistance),[1]);
  assert.equal(c.kind,'SUPPORT_RELEASE_OPPONENT_TURN_RESERVATION',JSON.stringify(c));
  assert.equal(c.exact,true);
  assert.equal(c.owner,1);
  assert.equal(c.controller,0);
  assert.equal(c.responseEdge.triggerCell,cell(g,2,0)); // C1
  assert.equal(c.responseEdge.responseCell,cell(g,2,1)); // C2
  assert.equal(c.supplyClass.residualKilled,true);
  assert.deepEqual(c.supplyClass.transportedOwnerSingletons,[]);
});

test('supply creating two urgent singleton cells fails closed',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('11222',{geometry:g}),
    r=residual(p,1,'A2-B2-C2'),
    c=certifyCpcxSupportReleaseOpponentTurnReservation(p,{
      ownerResidual:r,
    });

  assert.equal(p.mover,1);
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SUPPLY_RESPONSE_CAPACITY_NOT_UNIT');
  assert.deepEqual(c.urgentCells,[cell(g,2,1),cell(g,0,2)]); // C2,A3
});

test('reserved block that transports another owner singleton fails closed',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('121121',{geometry:g}),
    r=residual(p,0,'A2-B2-C2'),
    c=certifyCpcxSupportReleaseOpponentTurnReservation(p,{
      ownerResidual:r,
    });

  assert.equal(p.mover,0);
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'POST_RESPONSE_OWNER_SINGLETON_TRANSPORT');
  assert.deepEqual(c.cells,[cell(g,2,2)]); // C3
});

test('current playable owner singleton has precedence',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('112213',{geometry:g}),
    rows=scanCpcxObligations(p).filter(o=>
      o.player===p.mover&&o.missingCount===1
    );
  const r=rows.find(o=>o.events[0]?.supportDistance===1);
  if(!r)return;
  const c=certifyCpcxSupportReleaseOpponentTurnReservation(p,{
    ownerResidual:r,
  });
  if(scanCpcxObligations(p).some(o=>
    o.player===p.mover&&o.missingCount===1&&
    o.events[0]?.supportDistance===0
  )){
    assert.equal(c.kind,'NO_CERTIFICATE');
    assert.equal(c.seam,'SOURCE_OWNER_IMMEDIATE_SINGLETON');
  }
});

test('opponent-turn reservation theorem is generic and solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-support-release-opponent-turn-reservation.mjs',import.meta.url),
    'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'Class C',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
