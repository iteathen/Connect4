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

const P1=0,P2=1,P1_WIN=3,P2_WIN=1;
const parentSequence='4444415666662322224233177716';
const rank30Sequence='444441566666232222423317771611';
const C1=0;
const C1R5=4*g.columns+0;
const C3R5=4*g.columns+2;

function fromSequence(sequence){
  const x=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function support(q){return Array.from(q.words.slice(0,7));}
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,player){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);
  return out;
}
function hasActiveSingleton(q,player,cell){
  return activeIds(q,player).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);
}
function exactEqual(a,b){
  if(a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}
function kindName(k){
  if(k===CPC_NONE)return 'CPC_NONE';
  if(k===CPC_EXACT)return 'CPC_EXACT';
  if(k===CPC_BOUND)return 'CPC_BOUND';
  if(k===CPC_RESTRICT)return 'CPC_RESTRICT';
  return 'UNKNOWN';
}
function cpc(q,frontierResponse){
  const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:false});
  const k=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
  return {
    kind:kindName(k),
    interval:[s.interval[0]-2,s.interval[1]-2],
    forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
    preemptionCount:s.preemptionCount[0],
    preemptionMask32:s.preemptionMask32[0]>>>0,
  };
}
function literalOnlyC1AvoidsImmediateWin(q){
  const rows=[];
  let avoidingMask=0;
  for(let d=0;d<7;d++){
    if(q.words[d]>=6)continue;
    const reply=step(q,d);
    let avoids=false,nextP1C1Terminal=null;
    if(reply.terminal){
      avoids=true;
    }else if(reply.words[C1]>=6){
      avoids=true;
    }else{
      const next=step(reply,C1);
      nextP1C1Terminal=next.terminal;
      avoids=next.terminal!==P1_WIN;
    }
    if(avoids)avoidingMask|=1<<d;
    rows.push({
      replyColumn:d+1,
      replyTerminal:reply.terminal,
      nextP1C1Terminal,
      avoidsImmediateP1C1Win:avoids,
    });
  }
  return {
    rows,
    avoidingMask:avoidingMask>>>0,
    avoidingColumns:rows.filter(x=>x.avoidsImmediateP1C1Win).map(x=>x.replyColumn),
    onlyC1:avoidingMask===1,
  };
}

const parent=fromSequence(parentSequence);
const expectedRank30=fromSequence(rank30Sequence);

assert.equal(parent.words[g.metaOffset]>>>2,28);
assert.equal((parent.words[g.metaOffset]>>>2)&1,P1);
assert.equal(parent.terminal,0);
assert.deepEqual(support(parent),[3,6,3,6,1,6,3]);

const move=step(parent,C1);
const c1r5Singleton=move.terminal===0&&hasActiveSingleton(move,P1,C1R5);
const c3r5Singleton=move.terminal===0&&hasActiveSingleton(move,P1,C3R5);

const baseline=move.terminal===0?cpc(move,false):null;
const frontier=move.terminal===0?cpc(move,true):null;
const nativeCpcForcesC1=
  !!baseline&&!!frontier&&
  baseline.forcedColumn===1&&frontier.forcedColumn===1&&
  baseline.preemptionCount===1&&frontier.preemptionCount===1&&
  baseline.preemptionMask32===1&&frontier.preemptionMask32===1;

const literal=move.terminal===0?literalOnlyC1AvoidsImmediateWin(move):{
  rows:[],avoidingMask:0,avoidingColumns:[],onlyC1:false
};

const forced=move.terminal===0?step(move,C1):null;
const exactChildMatchesQualifiedRank30Root=
  !!forced&&forced.terminal===0&&exactEqual(forced,expectedRank30);

const rank30=JSON.parse(execFileSync(
  process.execPath,
  [resolve('research/isograph/discovery/2026-09-30-universal-structural-policy/run-cpc-rank30-phase-transfer-composition.mjs'),resolve(library)],
  {encoding:'utf8',maxBuffer:32*1024*1024}
));
assert.equal(rank30.jsMinSysSha,EXPECTED);
assert.equal(rank30.oracleUsed,false);
assert.equal(rank30.solvedInputsUsed,false);

const accept=
  move.terminal===0&&
  c1r5Singleton&&c3r5Singleton&&
  nativeCpcForcesC1&&literal.onlyC1&&
  !!forced&&forced.terminal===0&&
  exactChildMatchesQualifiedRank30Root&&
  rank30.accept===true;

console.log(JSON.stringify({
  schema:'connect4.cpc_rank28_dual_singleton_handoff_composition.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  theoremCandidate:'CPC_RANK28_DUAL_SINGLETON_HANDOFF_COMPOSITION_THEOREM.md',
  parent:{
    sequence:parentSequence,
    rank:28,
    mover:1,
    support:support(parent),
  },
  move:{
    player:1,
    column:1,
    terminal:move.terminal,
    childSupport:support(move),
    c1r5Singleton,
    c3r5Singleton,
  },
  forcedReply:{
    nativeCpc:{baseline,frontier},
    nativeCpcForcesC1,
    literal,
    literalOnlyC1:literal.onlyC1,
    column:1,
    terminal:forced?.terminal??null,
    childSupport:forced?support(forced):null,
    expectedSequence:rank30Sequence,
    exactChildMatchesQualifiedRank30Root,
  },
  premise:{
    theorem:'CPC_RANK30_PHASE_TRANSFER_COMPOSITION_THEOREM.md',
    accept:rank30.accept,
    parent:rank30.parent,
  },
  accept,
  conclusion:accept?[
    'The exact rank-28 state is a Player-1 win by column 1.',
    'P1:c1 creates simultaneous c1r5 and c3r5 Player-1 singleton obligations; native CPC and literal cofactors uniquely force P2:c1.',
    'The exact post-c1/c1 RBA child equals the already-qualified rank-30 phase-transfer composition root.'
  ]:[
    'At least one frozen rank-28 dual-singleton handoff premise failed; the candidate theorem is rejected or requires narrowing.'
  ],
  boundary:[
    'All transitions and state equality checks use exact RBA cofactors.',
    'Production CPC is consumed unchanged at the pinned JSMinSys authority and every load-bearing forced reply is independently cross-checked by literal exact cofactors.',
    'No oracle, Pons, solved W/D/L input, local game-tree value, minimax, best-move table, physical-position identity, or sealed holdout is used.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
