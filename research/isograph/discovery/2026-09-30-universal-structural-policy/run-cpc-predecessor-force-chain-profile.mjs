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

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32,
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1_WIN=3,P2_WIN=1;
const startSequence='4444415666';
const ingress=connect4RbaFromMoves(Array.from(startSequence,c=>Number(c)-1),{geometry:g,canonical:false});
let q={words:ingress.words,basis:ingress.basis,n:ingress.basis.length,terminal:ingress.words[g.metaOffset]&3};
assert.equal(q.words[g.metaOffset]>>>2,10);
assert.equal(q.terminal,0);

const pairs=[
  [6,6],
  [2,3],
  [2,2],
  [2,2],
  [4,2],
  [3,3],
  [1,1],
];

function step(state,column){
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,state.words,0,state.basis,0,state.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}

function kindName(k){
  if(k===CPC_NONE)return 'CPC_NONE';
  if(k===CPC_EXACT)return 'CPC_EXACT';
  if(k===CPC_BOUND)return 'CPC_BOUND';
  if(k===CPC_RESTRICT)return 'CPC_RESTRICT';
  return 'UNKNOWN';
}
function cpc(state,frontierResponse){
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,state.words,0,state.basis,0,state.n,scratch);
  return {
    kind:kindName(kind),
    interval:[scratch.interval[0]-2,scratch.interval[1]-2],
    forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
    preemptionCount:scratch.preemptionCount[0],
    preemptionMask32:scratch.preemptionMask32[0]>>>0,
    precursorCount:scratch.precursorCount[0],
  };
}
function support(state){return Array.from(state.words.slice(0,g.columns));}

const rows=[];
let consumed=startSequence;
for(let i=0;i<pairs.length;i++){
  const [attack1,reply1]=pairs[i],attack=attack1-1,reply=reply1-1,
    rank=q.words[g.metaOffset]>>>2;
  assert.equal(rank&1,0,'expected Player 1 attack turn at rank '+rank);
  assert(q.words[attack]<g.rows,'consumed attack illegal at rank '+rank);
  const afterAttack=step(q,attack);
  assert.equal(afterAttack.terminal,0,'consumed attack unexpectedly terminal at rank '+rank);

  const literal=[];
  const avoiding=[];
  for(let d=0;d<g.columns;d++){
    if(afterAttack.words[d]>=g.rows)continue;
    const child=step(afterAttack,d);
    const immediateP1Wins=[];
    if(!child.terminal){
      for(let a=0;a<g.columns;a++){
        if(child.words[a]>=g.rows)continue;
        const grand=step(child,a);
        if(grand.terminal===P1_WIN)immediateP1Wins.push(a+1);
      }
    }
    const avoids=child.terminal===P2_WIN||child.terminal===2||immediateP1Wins.length===0;
    if(avoids)avoiding.push(d+1);
    literal.push({
      defenderReplyColumn:d+1,
      defenderTerminal:child.terminal,
      immediateP1WinningColumns:immediateP1Wins,
      avoidsImmediateP1Win:avoids,
    });
  }

  const baseCpc=cpc(afterAttack,false),frontierCpc=cpc(afterAttack,true);
  const row={
    rankBeforeAttack:rank,
    prefix:consumed,
    supportBefore:support(q),
    attackerColumn:attack1,
    afterAttackSupport:support(afterAttack),
    nativeCpc:{baseline:baseCpc,frontier:frontierCpc},
    consumedReplyColumn:reply1,
    literalReplies:literal,
    repliesAvoidingImmediateP1Win:avoiding,
    consumedReplyIsUniqueImmediateAvoidance:avoiding.length===1&&avoiding[0]===reply1,
    nativeCpcForcesConsumedReply:
      baseCpc.forcedColumn===reply1&&baseCpc.preemptionCount===1&&
      frontierCpc.forcedColumn===reply1&&frontierCpc.preemptionCount===1,
  };

  assert(afterAttack.words[reply]<g.rows,'consumed reply illegal at rank '+(rank+1));
  const next=step(afterAttack,reply);
  row.consumedPairTerminal=next.terminal;
  row.supportAfterConsumedPair=support(next);
  rows.push(row);
  assert.equal(next.terminal,0,'consumed pair unexpectedly terminal before rank24');
  q=next;
  consumed+=String(attack1)+String(reply1);
}

assert.equal(consumed,'444441566666232222423311');
assert.equal(q.words[g.metaOffset]>>>2,24);

console.log(JSON.stringify({
  schema:'connect4.cpc_predecessor_force_chain_profile.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  start:{sequence:startSequence,rank:10,support:Array.from(ingress.words.slice(0,7))},
  consumedEnd:{sequence:consumed,rank:24,support:support(q)},
  rows,
  conclusion:[
    'This is a local predecessor-edge diagnostic only.',
    'nativeCpcForcesConsumedReply identifies edges already restricted by production CPC at the post-attack state.',
    'repliesAvoidingImmediateP1Win independently enumerates exact one-ply defender replies and all immediate Player-1 terminal moves after each reply.',
    'A non-unique avoidance set means the consumed defender reply was a survival-policy choice, not an exact forced edge under this diagnostic.',
  ],
  boundary:[
    'No oracle, solved W/D/L, Pons, best-move labels, minimax, or sealed holdout is used.',
    'The probe does not infer that an alternative defender reply wins or draws; it only distinguishes immediate tactical forcing from non-forcing.',
    'Production CPC is read-only and unchanged.',
  ],
},null,2));
