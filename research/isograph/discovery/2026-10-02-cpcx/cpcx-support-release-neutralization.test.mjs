import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {certifyCpcxSupportReleaseResponseNeutralization} from './cpcx-support-release-neutralization.mjs';

function cell(g,column,row=0){
  return row*g.columns+column;
}

function residual(position,{player,lineLabel}){
  const row=scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  );
  assert.ok(row,lineLabel);
  return row;
}

test('fresh non-bottom depth-one singleton becomes an exact reserved response edge',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('1122',{geometry:g}),
    r=residual(p,{player:1,lineLabel:'A2-B2-C2'}),
    c=certifyCpcxSupportReleaseResponseNeutralization(p,{
      opponentResidual:r,
      defenderActionCell:cell(g,0,2), // A3
    });

  assert.equal(p.mover,0);
  assert.equal(r.missingCount,1);
  assert.deepEqual(r.events.map(e=>e.supportDistance),[1]);
  assert.equal(c.kind,'SUPPORT_RELEASE_RESPONSE_EDGE');
  assert.equal(c.exact,true);
  assert.equal(c.defender,0);
  assert.equal(c.opponent,1);
  assert.equal(c.responseEdge.triggerCell,cell(g,2,0)); // C1
  assert.equal(c.responseEdge.responseCell,cell(g,2,1)); // C2
  assert.equal(c.responseEdge.reservedResponseSlots,1);
  assert.equal(c.supplyClass.responseDemand,1);
  assert.equal(c.supplyClass.responseCapacity,1);
  assert.equal(c.supplyClass.overload,false);
  assert.equal(c.supplyClass.moverAfterResponse,1);
  assert.equal(c.supplyClass.residualKilled,true);
  assert.deepEqual(c.supplyClass.transportedOpponentSingletons,[]);
  assert.equal(c.externalClass.targetRemainsUnplayable,true);
  assert.equal(c.capacityReservationRequired,true);
});

test('pinned action that supplies the target fails closed',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('1122',{geometry:g}),
    r=residual(p,{player:1,lineLabel:'A2-B2-C2'}),
    c=certifyCpcxSupportReleaseResponseNeutralization(p,{
      opponentResidual:r,
      defenderActionCell:cell(g,2,0), // C1 = support cell
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'PINNED_DEFENDER_ACTION_SUPPLIES_TARGET');
});

test('supply that creates two distinct urgent singletons is retained as overload',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('1122',{geometry:g}),
    r=residual(p,{player:1,lineLabel:'A2-B2-C2'}),
    c=certifyCpcxSupportReleaseResponseNeutralization(p,{
      opponentResidual:r,
      defenderActionCell:cell(g,1,2), // B3
    });

  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SUPPLY_RESPONSE_CAPACITY_NOT_UNIT');
  assert.deepEqual(c.urgentCells,[cell(g,2,1),cell(g,0,2)]); // C2, A3
  assert.equal(c.deficit,1);
});

test('blocking a released singleton fails closed when it transports a new immediate singleton',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('12112',{geometry:g}),
    r=residual(p,{player:0,lineLabel:'A2-B2-C2'}),
    c=certifyCpcxSupportReleaseResponseNeutralization(p,{
      opponentResidual:r,
      defenderActionCell:cell(g,0,3), // A4
    });

  assert.equal(p.mover,1);
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'POST_BLOCK_OPPONENT_SINGLETON_TRANSPORT');
  assert.deepEqual(c.cells,[cell(g,2,2)]); // C3
});

test('support-release theorem is production/solver isolated and move6-generic',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-support-release-neutralization.mjs',import.meta.url),
    'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'U4',
    'U12',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
