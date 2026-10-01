#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const here=resolve('research/isograph/discovery/2026-09-30-universal-structural-policy');
function run(name){
  const stdout=execFileSync(
    process.execPath,
    [resolve(here,name),resolve(library)],
    {encoding:'utf8',maxBuffer:32*1024*1024}
  );
  return JSON.parse(stdout);
}

const trigger=run('run-cpc-trigger5-forced-compression.mjs');
const target=run('run-cpc-truncated-target-reservoir-pairing.mjs');

assert.equal(trigger.jsMinSysSha,EXPECTED);
assert.equal(target.jsMinSysSha,EXPECTED);
assert.equal(trigger.oracleUsed,false);
assert.equal(trigger.solvedInputsUsed,false);
assert.equal(target.oracleUsed,false);
assert.equal(target.solvedInputsUsed,false);
assert.equal(trigger.accept,true,'trigger-5 premise rejected');
assert.equal(target.accept,true,'target-reservoir premise rejected');

const direct=trigger.rows.find(x=>x.responseColumn===5);
assert(direct);
assert.equal(direct.closesByImmediateP1Win,true);

const off=trigger.rows
  .filter(x=>x.responseColumn!==5)
  .map(x=>x.responseColumn)
  .sort((a,b)=>a-b);
const targetFamily=target.rows
  .map(x=>x.firstResponseColumn)
  .sort((a,b)=>a-b);
assert.deepEqual(off,[1,3,6,7]);
assert.deepEqual(targetFamily,[1,3,6,7]);
assert.deepEqual(off,targetFamily);

const branches=[];
branches.push({
  defenderReplyColumn:5,
  closure:'immediate-p1-terminal',
  triggerCertificate:true,
  targetReservoirCertificate:false,
});
for(const response of off){
  const a=trigger.rows.find(x=>x.responseColumn===response);
  const b=target.rows.find(x=>x.firstResponseColumn===response);
  assert(a&&b);
  assert.equal(a.contractsToProjectedP1Singleton,true);
  assert.equal(a.nativeCpcForcesColumn5,true);
  assert.equal(a.literalOnlyColumn5AvoidsImmediateWin,true);
  assert.equal(b.accept,true);
  assert.equal(b.target.activeP1Singleton,true);
  assert.equal(b.template.targetIsResponse,true);
  assert.equal(b.validation.pass,true);
  branches.push({
    defenderReplyColumn:response,
    closure:'forced-compression-then-truncated-reservoir-zugzwang',
    triggerCertificate:true,
    targetReservoirCertificate:true,
    compressedSupport:b.support,
    truncatedCapacity:b.truncatedCapacity,
    synchronizedPairs:b.template.synchronizedPairs,
  });
}
branches.sort((a,b)=>a.defenderReplyColumn-b.defenderReplyColumn);
assert.deepEqual(branches.map(x=>x.defenderReplyColumn),[1,3,5,6,7]);

console.log(JSON.stringify({
  schema:'connect4.cpc_rank24_zugzwang_win_composition.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  theoremCandidate:'CPC_RANK24_ZUGZWANG_WIN_COMPOSITION_THEOREM.md',
  qualificationLocator:'444441566666232222423311',
  currentState:{
    rank:trigger.parent.rank,
    mover:trigger.parent.mover,
    support:trigger.parent.support,
  },
  moveCertificate:{
    player:1,
    column:5,
    exactValue:'WIN',
    relativeRemoteness:null,
    legalDefenderReplies:branches.map(x=>x.defenderReplyColumn),
    branches,
  },
  premiseCertificates:{
    trigger5:{
      schema:trigger.schema,
      accept:trigger.accept,
      theorem:trigger.theoremCandidate,
    },
    targetReservoir:{
      schema:target.schema,
      accept:target.accept,
      theorem:target.theoremCandidate,
    },
  },
  accept:true,
  conclusion:[
    'At the exact rank-24 current RBA state, Player 1 has a structurally certified winning move in column 5.',
    'Every legal Player-2 reply is closed: column 5 loses immediately, while replies 1,3,6,7 enter the qualified forced-compression macro and then a qualified truncated-reservoir zugzwang win.',
    'This is exact local W/L, not merely a bounded survival result.',
    'No exact relative remoteness is claimed.',
  ],
  boundary:[
    'The move history string is a qualification locator for this current state, not a universal runtime premise.',
    'The composition freshly executes both finite structural qualification runners at the pinned JSMinSys authority.',
    'No oracle, Pons, solved W/D/L input, minimax/negamax/alpha-beta premise, best-move table, physical-position identity, or sealed holdout is used.',
    'Production CPC is consumed unchanged.',
    'Standard Connect Four is not claimed solved by this local certificate and v5 is not authorized.',
  ],
},null,2));
