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
const {
  prepareConnect4RbaGeometry,
  connect4RbaShapeSubset,
}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,
  evaluateConnect4Cpc32,
  connect4CpcTargetOwner32,
  connect4CpcTargetSupportDistance32,
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const parentSequence='444441566666232222423311';
const parentMoves=Array.from(parentSequence,c=>Number(c)-1);
const root=connect4RbaFromMoves(parentMoves,{geometry:g,canonical:false});
assert.equal(root.words[g.metaOffset]&3,0);
assert.equal(root.words[g.metaOffset]>>>2,24);
assert.equal((root.words[g.metaOffset]>>>2)&1,0);

const X=4*g.columns+4; // c5 r5, zero-based (4,4)
const Y=2*g.columns+6; // c7 r3, zero-based (6,2)
const ATTACK_COLUMN=4;  // c5 zero-based
const P1_WIN=3,P2_WIN=1;

function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}

function shapeEqualsCells(id,a,b=-1){
  const n=g.shapeSize[id],base=id*4;
  if(b<0)return n===1&&g.shapeCells[base]===a;
  if(n!==2)return false;
  const x=g.shapeCells[base],y=g.shapeCells[base+1];
  return (x===a&&y===b)||(x===b&&y===a);
}

function activeMinimal(q,player){
  const active=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}

function hasMinimalCells(q,player,a,b=-1){
  const minimal=activeMinimal(q,player);
  for(let i=0;i<minimal.length;i++)if(shapeEqualsCells(minimal[i],a,b))return true;
  return false;
}

function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0,'cannot cofactor terminal state');
  assert(column>=0&&column<g.columns);
  assert(q.words[column]<g.rows,'illegal full-column cofactor');
  const words=new Uint32Array(g.keyWords);
  const basis=new Uint32Array(g.maxBasis);
  const seen=new Uint32Array(g.shapeWordCount);
  const sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}

function cpcKindName(kind){
  if(kind===CPC_NONE)return 'CPC_NONE';
  if(kind===CPC_EXACT)return 'CPC_EXACT';
  if(kind===CPC_BOUND)return 'CPC_BOUND';
  if(kind===CPC_RESTRICT)return 'CPC_RESTRICT';
  return 'UNKNOWN';
}

function cpc(q,frontierResponse){
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,scratch);
  return {
    kind:cpcKindName(kind),
    interval:[scratch.interval[0]-2,scratch.interval[1]-2],
    forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
    preemptionCount:scratch.preemptionCount[0],
    preemptionMask32:scratch.preemptionMask32[0]>>>0,
    precursorCount:scratch.precursorCount[0],
  };
}

function support(q){return Array.from(q.words.slice(0,g.columns));}

function firstMoveWinsForP1(q,column){
  if(q.words[g.metaOffset]&3)return false;
  if(q.words[column]>=g.rows)return false;
  return step(q,column).terminal===P1_WIN;
}

const rootMinimalP1=activeMinimal({words:root.words,basis:root.basis,n:root.basis.length},0);
const attachedPair=rootMinimalP1.filter(id=>shapeEqualsCells(id,X,Y));
assert.equal(attachedPair.length,1,'expected one active minimal P1 {c5r5,c7r3} residual by geometry');

const rootState={words:root.words,basis:root.basis,n:root.basis.length,terminal:0};
const firstAttack=step(rootState,ATTACK_COLUMN);
assert.equal(firstAttack.terminal,0,'first c5 trigger unexpectedly terminal');

const rows=[];
let accept=true;
for(let response=0;response<g.columns;response++){
  if(firstAttack.words[response]>=g.rows)continue;
  const reply=step(firstAttack,response);
  const row={
    responseColumn:response+1,
    replyTerminal:reply.terminal,
    replySupport:support(reply),
    mode:null,
  };
  if(reply.terminal!==0){
    row.mode='falsifier-defender-terminal';
    accept=false;
    rows.push(row);
    continue;
  }

  if(response===ATTACK_COLUMN){
    const immediate=step(reply,ATTACK_COLUMN);
    row.mode='direct-c5-reply';
    row.nextAttack={
      column:5,
      terminal:immediate.terminal,
      support:support(immediate),
    };
    row.closesByImmediateP1Win=immediate.terminal===P1_WIN;
    if(!row.closesByImmediateP1Win)accept=false;
    rows.push(row);
    continue;
  }

  if(reply.words[ATTACK_COLUMN]>=g.rows){
    row.mode='falsifier-second-c5-illegal';
    accept=false;
    rows.push(row);
    continue;
  }
  const secondAttack=step(reply,ATTACK_COLUMN);
  row.mode='off-column-compression';
  row.secondAttack={
    column:5,
    terminal:secondAttack.terminal,
    support:support(secondAttack),
  };
  if(secondAttack.terminal!==0){
    row.secondAttackUnexpectedTerminal=true;
    accept=false;
    rows.push(row);
    continue;
  }

  const baselineCpc=cpc(secondAttack,false);
  const frontierCpc=cpc(secondAttack,true);
  row.cpc={baseline:baselineCpc,frontier:frontierCpc};
  const forcedMask=(1<<ATTACK_COLUMN)>>>0;
  row.nativeCpcForcesColumn5=
    baselineCpc.forcedColumn===5&&baselineCpc.preemptionCount===1&&baselineCpc.preemptionMask32===forcedMask&&
    frontierCpc.forcedColumn===5&&frontierCpc.preemptionCount===1&&frontierCpc.preemptionMask32===forcedMask;
  if(!row.nativeCpcForcesColumn5)accept=false;

  const literal=[];
  let avoidingMask=0;
  for(let secondResponse=0;secondResponse<g.columns;secondResponse++){
    if(secondAttack.words[secondResponse]>=g.rows)continue;
    const secondReply=step(secondAttack,secondResponse);
    const entry={
      responseColumn:secondResponse+1,
      responseTerminal:secondReply.terminal,
      preventsImmediateP1C5Win:false,
      nextP1C5Terminal:null,
    };
    if(secondReply.terminal===P2_WIN){
      entry.preventsImmediateP1C5Win=true;
      entry.defenderPreemptsByWin=true;
      avoidingMask|=1<<secondResponse;
    }else if(secondReply.terminal){
      entry.preventsImmediateP1C5Win=true;
      entry.otherTerminal=true;
      avoidingMask|=1<<secondResponse;
    }else if(secondReply.words[ATTACK_COLUMN]>=g.rows){
      entry.preventsImmediateP1C5Win=true;
      entry.c5Illegal=true;
      avoidingMask|=1<<secondResponse;
    }else{
      const nextAttack=step(secondReply,ATTACK_COLUMN);
      entry.nextP1C5Terminal=nextAttack.terminal;
      entry.preventsImmediateP1C5Win=nextAttack.terminal!==P1_WIN;
      if(entry.preventsImmediateP1C5Win)avoidingMask|=1<<secondResponse;
    }
    literal.push(entry);
  }
  row.literalSecondReplyCheck={
    avoidingMask:avoidingMask>>>0,
    avoidingColumns:Array.from({length:g.columns},(_,c)=>c+1).filter((_,c)=>avoidingMask&(1<<c)),
    rows:literal,
  };
  row.literalOnlyColumn5AvoidsImmediateWin=avoidingMask===forcedMask;
  if(!row.literalOnlyColumn5AvoidsImmediateWin)accept=false;

  const forcedReply=step(secondAttack,ATTACK_COLUMN);
  row.forcedReply={
    column:5,
    terminal:forcedReply.terminal,
    support:support(forcedReply),
  };
  if(forcedReply.terminal!==0){
    row.forcedReplyUnexpectedTerminal=true;
    accept=false;
    rows.push(row);
    continue;
  }

  const consume=step(forcedReply,ATTACK_COLUMN);
  row.consumeTarget={
    column:5,
    row:5,
    terminal:consume.terminal,
    support:support(consume),
  };
  if(consume.terminal!==0){
    row.consumeUnexpectedTerminal=true;
    accept=false;
    rows.push(row);
    continue;
  }

  const pairStillMinimalBeforeConsume=hasMinimalCells(forcedReply,0,X,Y);
  const singletonAfterConsume=hasMinimalCells(consume,0,Y);
  const pairAfterConsume=hasMinimalCells(consume,0,X,Y);
  const targetOwner=connect4CpcTargetOwner32(g,consume.words,0,Y);
  const targetSupportDistance=connect4CpcTargetSupportDistance32(g,consume.words,0,Y);
  row.attachment={
    pairStillMinimalBeforeConsume,
    singletonAfterConsume,
    pairAfterConsume,
    remainingTarget:{column:7,row:3,projectedOwner:targetOwner+1,supportDistance:targetSupportDistance},
  };
  row.contractsToProjectedP1Singleton=
    pairStillMinimalBeforeConsume&&singletonAfterConsume&&!pairAfterConsume&&targetOwner===0;
  if(!row.contractsToProjectedP1Singleton)accept=false;
  rows.push(row);
}

const expectedResponseColumns=[1,3,5,6,7];
const observedResponseColumns=rows.map(x=>x.responseColumn);
if(JSON.stringify(observedResponseColumns)!==JSON.stringify(expectedResponseColumns))accept=false;

console.log(JSON.stringify({
  schema:'connect4.cpc_trigger5_forced_compression.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  theoremCandidate:'CPC_TRIGGER5_FORCED_COMPRESSION_LEMMA.md',
  parent:{
    sequence:parentSequence,
    sequenceRole:'consumed qualification locator only; not a runtime proof premise',
    rank:24,
    mover:1,
    support:support(rootState),
    attachedResidual:{
      cells:[{column:5,row:5,cell:X},{column:7,row:3,cell:Y}],
      matchedByGeometry:true,
      diagnosticResidualId:attachedPair[0],
      targetOwners:[
        connect4CpcTargetOwner32(g,rootState.words,0,X)+1,
        connect4CpcTargetOwner32(g,rootState.words,0,Y)+1,
      ],
    },
  },
  firstTrigger:{
    column:5,
    terminal:firstAttack.terminal,
    support:support(firstAttack),
  },
  observedResponseColumns,
  rows,
  accept,
  conclusion:accept?[
    'The repeated trigger-5 obstruction compresses to a finite exact local macro at this qualification state.',
    'A direct c5 reply loses immediately; every off-column reply creates a native CPC-forced c5 block, independently cross-checked against all legal second replies.',
    'After the forced block, P1 consumes c5r5 and the attached minimal pair contracts to a P1-projected singleton at c7r3.',
    'The remaining theorem debt is escape/preemption closure for the c7r3 singleton target and its remaining event reservoirs.',
  ]:[
    'At least one frozen falsifier fired. The local forced-compression lemma is rejected or requires narrowing.',
  ],
  boundary:[
    'All transitions after root reconstruction use exact current-state RBA cofactors.',
    'Production addons/cpc-connect4.mjs is consumed unchanged at the pinned JSMinSys SHA.',
    'The diagnostic residual id is recorded only after geometry matching and is not assumed stable across cofactors.',
    'No oracle, solved W/D/L, best-move label, minimax, physical-position identity, or 49-bit board key is used.',
    'Acceptance is a local theorem result for the stated current RBA state, not a proof that the parent or candidate 6 is game-theoretically winning.',
  ],
},null,2));
