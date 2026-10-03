import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {
  findCpcxLatentSingletonPairHubCandidates,
} from './cpcx-latent-pair-hub.mjs';
import {
  certifyCpcxLatentSingletonPairHubForcedNormalization,
} from './cpcx-latent-pair-hub-normalization.mjs';

function cell(g,column,row=0){
  return row*g.columns+column;
}

test('fresh 5x3 k3 forced normalization re-enters the base pair-hub theorem',()=>{
  const g=createCpcxGeometry({columns:5,rows:3,connect:3}),
    p=buildCpcxPosition('1243345',{geometry:g}),
    candidate=findCpcxLatentSingletonPairHubCandidates(
      p,{attacker:0}
    ).find(x=>
      x.targetCell===cell(g,1,2)&&
      x.hubCell===cell(g,1,1)&&
      x.spokes.some(s=>s.cell===cell(g,0,1))&&
      x.spokes.some(s=>s.cell===cell(g,2,2))
    );

  assert.ok(candidate);
  const c=certifyCpcxLatentSingletonPairHubForcedNormalization(
    p,candidate
  );
  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.exact,true);
  assert.equal(c.player,0);
  assert.equal(c.selfRecursion,false);

  const hazard=c.rows.find(x=>
    x.defenderCell===cell(g,4,1)
  );
  assert.ok(hazard);
  assert.equal(hazard.class,'FORCED_NORMALIZATION_HANDOFF');
  assert.deepEqual(
    hazard.normalization.steps.map(x=>[x.cell,x.player]),
    [[cell(g,4,2),0]]
  );
  assert.equal(hazard.normalization.finalMover,1);
  assert.equal(hazard.normalization.strictCapacityDescent,true);
  assert.equal(hazard.inheritedCandidate.targetCell,cell(g,1,2));
  assert.equal(hazard.inheritedCandidate.hubCell,cell(g,1,1));
  assert.ok(hazard.inheritedCandidate.spokeCells.includes(cell(g,0,1)));
  assert.ok(hazard.inheritedCandidate.spokeCells.includes(cell(g,2,2)));
  assert.equal(hazard.base.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(hazard.base.player,0);
});

test('normalization that destroys the pair-hub role fails closed',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('12243',{geometry:g}),
    candidate=findCpcxLatentSingletonPairHubCandidates(
      p,{attacker:0}
    ).find(x=>
      x.targetCell===cell(g,2,2)&&
      x.hubCell===cell(g,2,1)
    );
  assert.ok(candidate);

  const c=certifyCpcxLatentSingletonPairHubForcedNormalization(
    p,candidate
  );
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.exact,false);
  assert.equal(c.seam,'NORMALIZATION_LOST_PAIR_HUB_ROLE');
});

test('source immediate precedence is not consumed by normalization handoff',()=>{
  const g=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('12232',{geometry:g}),
    candidate=findCpcxLatentSingletonPairHubCandidates(
      p,{attacker:0}
    )[0];
  assert.ok(candidate);

  const c=certifyCpcxLatentSingletonPairHubForcedNormalization(
    p,candidate
  );
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'SOURCE_IMMEDIATE_PRECEDENCE');
  assert.equal(c.boundary.kind,'IMMEDIATE_TERMINAL_AVAILABLE');
});

test('normalization handoff rejects a stale role candidate',()=>{
  const g=createCpcxGeometry({columns:5,rows:3,connect:3}),
    p=buildCpcxPosition('1243345',{geometry:g}),
    candidate=findCpcxLatentSingletonPairHubCandidates(
      p,{attacker:0}
    )[0];
  assert.ok(candidate);
  const stale={
    ...candidate,
    targetCell:candidate.targetCell+1,
    singleton:{...candidate.singleton,targetCell:candidate.targetCell+1},
  };

  const c=certifyCpcxLatentSingletonPairHubForcedNormalization(
    p,stale
  );
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.seam,'CANDIDATE_NOT_CURRENT_LIVE');
});

test('normalization handoff is generic and recursion/solver isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(
    new URL('./cpcx-latent-pair-hub-normalization.mjs',import.meta.url),
    'utf8'
  );
  assert.equal(source.includes(
    'certifyCpcxLatentSingletonPairHubForcedNormalization('
  ),true);
  // One occurrence is the function declaration; there must be no self-call.
  assert.equal(
    source.split(
      'certifyCpcxLatentSingletonPairHubForcedNormalization('
    ).length-1,
    2
  );
  // The second occurrence is the call from the public finder, never from the
  // theorem body itself.
  for(const forbidden of [
    "'44444'",
    'B2 leaf',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
