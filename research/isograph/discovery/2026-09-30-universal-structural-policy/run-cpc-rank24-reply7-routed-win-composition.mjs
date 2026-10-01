#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const DIR=resolve('research/isograph/discovery/2026-09-30-universal-structural-policy');
const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);

const ROOT='444441566666232222423317';
const R26='44444156666623222242331775';
const R27='444441566666232222423317771';
const C1=0,C7=6;

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(column>=0&&column<g.columns&&q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function support(q){return Array.from(q.words.slice(0,g.columns));}
function rankOf(q){return q.words[g.metaOffset]>>>2;}
function moverOf(q){return rankOf(q)&1;}
function exactEqual(a,b){
  if(a.terminal!==b.terminal||a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}
function runJson(script,...args){
  return JSON.parse(execFileSync(
    process.execPath,[resolve(DIR,script),...args],
    {encoding:'utf8',maxBuffer:64*1024*1024}
  ));
}

const q24=fromSequence(ROOT);
assert.equal(q24.terminal,0);
assert.equal(rankOf(q24),24);
assert.equal(moverOf(q24),0);
assert.deepEqual(support(q24),[2,6,3,6,1,5,1]);

const afterP1c7=step(q24,C7);
assert.equal(afterP1c7.terminal,0);
assert.equal(rankOf(afterP1c7),25);

const probe=runJson('run-cpc-rank24-reply7-c7-dual-obligation-probe.mjs',resolve(library));
assert.equal(probe.schema,'connect4.cpc_rank24_reply7_c7_dual_obligation_probe.v1');
assert.equal(probe.jsMinSysSha,EXPECTED);
assert.equal(probe.oracleUsed,false);
assert.equal(probe.solvedInputsUsed,false);
assert.equal(probe.oracleValuesUsed,false);
assert.deepEqual(probe.state,{rank:24,mover:1,support:[2,6,3,6,1,5,1]});
assert.equal(probe.firstMove.column,7);
assert.equal(probe.firstMove.terminal,0);

const probeByReply=new Map(probe.rows.map(x=>[x.defenderReplyColumn,x]));
const legalDefenderReplies=[];
for(let d=0;d<7;d++)if(afterP1c7.words[d]<g.rows)legalDefenderReplies.push(d+1);
assert.deepEqual(legalDefenderReplies,[1,3,5,6,7]);

const routes=[];

for(const c of [1,3,6]){
  const row=probeByReply.get(c);
  assert(row);
  const follow=row.offC7Followup;
  const accept=
    row.replyTerminal===0&&
    row.tookC7R3===false&&
    !!follow&&
    follow.p1Column===7&&
    follow.terminal===0&&
    follow.pairBefore===true&&
    follow.singletonC5R5===true&&
    follow.projectedOwnerC5R5===1&&
    !!follow.targetTemplate&&
    follow.targetTemplate.targetIsResponse===true&&
    !!follow.validation?.pass&&
    Array.isArray(follow.validation.failures)&&
    follow.validation.failures.length===0&&
    follow.accept===true;
  routes.push({
    defenderColumn:c,
    kind:'FRESH_TARGET_RESERVOIR_REENTRY',
    replySupport:row.replySupport,
    followup:{
      p1Column:follow?.p1Column??null,
      support:follow?.support??null,
      singletonC5R5:follow?.singletonC5R5??false,
      projectedOwnerC5R5:follow?.projectedOwnerC5R5??null,
      targetTemplate:follow?.targetTemplate??null,
      validation:follow?.validation??null
    },
    accept
  });
}

const afterP2c5=step(afterP1c7,4);
const q26Root=fromSequence(R26);
const exact26=
  afterP2c5.terminal===0&&
  rankOf(afterP2c5)===26&&
  exactEqual(afterP2c5,q26Root);
const rank26Premise=runJson('run-cpc-rank26-reply7-forced-chain-win-composition.mjs',resolve(library));
const rank26Valid=
  rank26Premise.schema==='connect4.cpc_rank26_reply7_forced_chain_win_composition.v1'&&
  rank26Premise.jsMinSysSha===EXPECTED&&
  rank26Premise.oracleUsed===false&&
  rank26Premise.solvedInputsUsed===false&&
  rank26Premise.ordinaryGameTreeSearchUsed===false&&
  rank26Premise.accept===true;
routes.push({
  defenderColumn:5,
  kind:'EXACT_RANK26_HANDOFF',
  replyTerminal:afterP2c5.terminal,
  replyRank:rankOf(afterP2c5),
  replySupport:support(afterP2c5),
  exactHandoff:exact26,
  expectedSequence:R26,
  premise:{
    schema:rank26Premise.schema,
    accept:rank26Premise.accept,
    rejectionReason:rank26Premise.rejectionReason
  },
  accept:exact26&&rank26Valid
});

const afterP2c7=step(afterP1c7,C7);
const afterP1c1=
  afterP2c7.terminal===0&&afterP2c7.words[C1]<g.rows
    ?step(afterP2c7,C1)
    :null;
const q27Root=fromSequence(R27);
const exact27=
  !!afterP1c1&&afterP1c1.terminal===0&&
  rankOf(afterP1c1)===27&&
  exactEqual(afterP1c1,q27Root);
const rank27Premise=runJson('run-cpc-rank27-reply7-c7-taken-composition.mjs',resolve(library));
const rank27Valid=
  rank27Premise.schema==='connect4.cpc_rank27_reply7_c7_taken_composition.v1'&&
  rank27Premise.jsMinSysSha===EXPECTED&&
  rank27Premise.oracleUsed===false&&
  rank27Premise.solvedInputsUsed===false&&
  rank27Premise.accept===true;
routes.push({
  defenderColumn:7,
  kind:'P1C1_EXACT_RANK27_HANDOFF',
  replyTerminal:afterP2c7.terminal,
  replyRank:rankOf(afterP2c7),
  replySupport:support(afterP2c7),
  p1Column:1,
  childTerminal:afterP1c1?.terminal??null,
  childRank:afterP1c1?rankOf(afterP1c1):null,
  childSupport:afterP1c1?support(afterP1c1):null,
  exactHandoff:exact27,
  expectedSequence:R27,
  premise:{
    schema:rank27Premise.schema,
    accept:rank27Premise.accept
  },
  accept:exact27&&rank27Valid
});

routes.sort((a,b)=>a.defenderColumn-b.defenderColumn);
const accept=
  routes.length===legalDefenderReplies.length&&
  routes.every(x=>x.accept===true);

let rejectionReason=null;
if(!accept){
  const bad=routes.find(x=>x.accept!==true);
  rejectionReason=bad?('route-c'+bad.defenderColumn+'-failed'):'routing-partition-incomplete';
}

console.log(JSON.stringify({
  schema:'connect4.cpc_rank24_reply7_routed_win_composition.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:false,
  theoremCandidate:'CPC_RANK24_REPLY7_ROUTED_WIN_COMPOSITION_THEOREM.md',
  proofSchema:'RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md',
  rank24:{
    sequence:ROOT,
    rank:rankOf(q24),
    mover:moverOf(q24)+1,
    support:support(q24)
  },
  p1Column:7,
  afterP1:{
    terminal:afterP1c7.terminal,
    rank:rankOf(afterP1c7),
    support:support(afterP1c7)
  },
  legalDefenderReplies,
  routes,
  accept,
  rejectionReason,
  conclusion:accept?[
    'The exact rank-24 reply-7 state is structurally certified as a Player-1 win by column 7.',
    'The proof is proof routing: defender replies c1, c3, and c6 re-enter freshly synthesized target-reservoir RCICs; c5 hands off exactly to the qualified rank-26 forced-chain class; c7 followed by P1:c1 hands off exactly to the qualified rank-27 class.',
    'Every legal defender reply is therefore mapped to a known controlled-invariant / ranked controlled-invariant certificate class.',
    'No new game-specific proof primitive is introduced by this rank-24 closure.'
  ]:[
    'At least one frozen proof route failed; the rank-24 routed composition is rejected at the recorded seam.'
  ],
  boundary:[
    'No diagnostic W/D/L, Pons/oracle value, solved database, ordinary game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity, or sealed holdout is used.',
    'Exact RBA equality is required for theorem-root handoffs; support equality alone is not accepted.',
    'The c1/c3/c6 routes are freshly re-executed current-state target-reservoir certificates, not copied value labels.',
    'No new game-specific proof primitive is introduced; this theorem composes already-qualified RLC mechanisms under the controlled-invariant routing schema.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
