import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  findCpcxLatentSingletonPairHubCandidates,
  certifyCpcxLatentSingletonPairHubOverload,
} from './cpcx-latent-pair-hub.mjs';

function cell(g,column,row=0){
  return row*g.columns+column;
}

test('fresh 4x4 k3 latent pair hub certifies first win',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('12234',{geometry:g}),
    candidates=findCpcxLatentSingletonPairHubCandidates(
      p,{attacker:0}
    ),
    candidate=candidates.find(x=>
      x.targetCell===cell(g,2,2)&&
      x.hubCell===cell(g,2,1)
    );
  assert.ok(candidate);
  assert.ok(candidate.distinctSpokeCount>=2);
  assert.deepEqual(
    candidate.spokes.map(x=>x.cell),
    [cell(g,0,1),cell(g,3,1),cell(g,1,2)]
  );

  const c=certifyCpcxLatentSingletonPairHubOverload(p,candidate);
  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.exact,true);
  assert.equal(c.player,0);
  assert.equal(c.currentFrontierEventCount,4);
  assert.equal(c.firstWinGuardPassed,true);
  assert.ok(c.rows.some(x=>x.class==='HUB_OCCUPATION'));
  assert.ok(c.rows.filter(x=>x.class!=='HUB_OCCUPATION').every(x=>
    x.result==='ATTACKER_SINGLETON_OVERLOAD'||
    x.result==='ATTACKER_TERMINAL_ON_HUB'
  ));
});

test('defender counterterminal after hub fails first-win guard',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('12243',{geometry:g}),
    candidate=findCpcxLatentSingletonPairHubCandidates(
      p,{attacker:0}
    ).find(x=>
      x.targetCell===cell(g,2,2)&&
      x.hubCell===cell(g,2,1)
    );
  assert.ok(candidate);

  const c=certifyCpcxLatentSingletonPairHubOverload(p,candidate);
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.exact,false);
  assert.equal(c.seam,'DEFENDER_COUNTERTERMINAL_AFTER_HUB');
  assert.deepEqual(c.defenderTerminalCells,[cell(g,3,2)]);
});

test('one physical spoke is insufficient',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('1122',{geometry:g}),
    candidates=findCpcxLatentSingletonPairHubCandidates(
      p,{attacker:0}
    );
  assert.equal(candidates.length,0);
});

test('duplicate residual descriptions do not create duplicate spokes',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('12234',{geometry:g}),
    obligations=scanCpcxObligations(p),
    base=findCpcxLatentSingletonPairHubCandidates(
      p,{attacker:0,obligations}
    ).find(x=>x.targetCell===cell(g,2,2));
  assert.ok(base);

  const pair=obligations.find(o=>
    o.player===0&&
    o.missingCount===2&&
    o.missingCells.includes(base.hubCell)
  );
  assert.ok(pair);
  const duplicated=obligations.concat([{
    ...pair,
    id:`${pair.id}:duplicate-control`,
    missingCells:[...pair.missingCells],
    events:pair.events.map(e=>({...e})),
  }]);
  const next=findCpcxLatentSingletonPairHubCandidates(
    p,{attacker:0,obligations:duplicated}
  ).find(x=>x.targetCell===base.targetCell&&x.hubCell===base.hubCell);
  assert.ok(next);
  assert.equal(next.distinctSpokeCount,base.distinctSpokeCount);
  assert.deepEqual(
    next.spokes.map(x=>x.cell),
    base.spokes.map(x=>x.cell)
  );
});

test('source immediate terminal precedence rejects the pair-hub theorem',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('12232',{geometry:g}),
    candidate=findCpcxLatentSingletonPairHubCandidates(
      p,{attacker:0}
    )[0];
  assert.ok(candidate);

  const c=certifyCpcxLatentSingletonPairHubOverload(p,candidate);
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SOURCE_IMMEDIATE_PRECEDENCE');
  assert.equal(c.boundary.kind,'IMMEDIATE_TERMINAL_AVAILABLE');
});

test('latent pair-hub module is generic and solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-latent-pair-hub.mjs',import.meta.url),
    'utf8'
  );
  for(const forbidden of [
    "'44444'",
    'B2 leaf',
    'U13',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
