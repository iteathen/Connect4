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
const P1_WIN=3;
const C1=0,C5=4,C7=6;
const ROOT='44444156666623222242331775';
const R28='4444415666662322224233177555';
const R30='444441566666232222423317755557';
const R31='4444415666662322224233177555571';

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(column>=0&&column<7&&q.words[column]<6);
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
function rankOf(q){return q.words[g.metaOffset]>>>2;}
function moverOf(q){return rankOf(q)&1;}
function exactEqual(a,b){
  if(a.terminal!==b.terminal||a.n!==b.n)return false;
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
    precursorCount:s.precursorCount[0],
    projectedCount:[s.projectedCount[0],s.projectedCount[1]],
    projectedForks:[s.projectedForks[0],s.projectedForks[1]],
  };
}
function immediateP1Wins(q){
  const columns=[];
  for(let c=0;c<7;c++){
    if(q.words[c]>=6)continue;
    if(step(q,c).terminal===P1_WIN)columns.push(c+1);
  }
  return columns;
}
function literalForcedReplyCensus(afterP1,forcedColumn){
  const rows=[];
  for(let d=0;d<7;d++){
    if(afterP1.words[d]>=6)continue;
    const reply=step(afterP1,d);
    const wins=reply.terminal===0?immediateP1Wins(reply):[];
    rows.push({
      defenderColumn:d+1,
      terminal:reply.terminal,
      immediateP1WinningColumns:wins,
      isForcedColumn:d===forcedColumn,
      offForcedClosed:d===forcedColumn?null:(reply.terminal===P1_WIN||wins.length>0),
    });
  }
  return {
    rows,
    offForcedReplies:rows.filter(x=>!x.isForcedColumn).map(x=>({
      defenderColumn:x.defenderColumn,
      terminal:x.terminal,
      immediateP1WinningColumns:x.immediateP1WinningColumns,
      closed:x.offForcedClosed,
    })),
    allOffForcedClosed:rows.filter(x=>!x.isForcedColumn).every(x=>x.offForcedClosed===true),
  };
}
function forcedCpcPair(q,forcedColumn){
  const baseline=cpc(q,false),frontier=cpc(q,true);
  return {
    baseline,frontier,
    agrees:
      baseline.kind==='CPC_RESTRICT'&&frontier.kind==='CPC_RESTRICT'&&
      baseline.forcedColumn===forcedColumn+1&&frontier.forcedColumn===forcedColumn+1&&
      baseline.preemptionCount===1&&frontier.preemptionCount===1&&
      baseline.preemptionMask32===(1<<forcedColumn)&&frontier.preemptionMask32===(1<<forcedColumn),
  };
}

const q26=fromSequence(ROOT);
const q28Root=fromSequence(R28);
const q30Root=fromSequence(R30);
const q31Root=fromSequence(R31);

assert.equal(q26.terminal,0);
assert.equal(rankOf(q26),26);
assert.equal(moverOf(q26),0);
assert.deepEqual(support(q26),[2,6,3,6,2,5,2]);

const aP1=step(q26,C5);
const layerACpc=aP1.terminal===0?forcedCpcPair(aP1,C5):null;
const layerALiteral=aP1.terminal===0?literalForcedReplyCensus(aP1,C5):null;
const aP2=aP1.terminal===0?step(aP1,C5):null;
const aHandoff=
  !!aP2&&aP2.terminal===0&&exactEqual(aP2,q28Root)&&rankOf(aP2)===28;

const bP1=aHandoff?step(aP2,C5):null;
const layerBCpc=!!bP1&&bP1.terminal===0?forcedCpcPair(bP1,C7):null;
const layerBLiteral=!!bP1&&bP1.terminal===0?literalForcedReplyCensus(bP1,C7):null;
const bP2=!!bP1&&bP1.terminal===0?step(bP1,C7):null;
const bHandoff=
  !!bP2&&bP2.terminal===0&&exactEqual(bP2,q30Root)&&rankOf(bP2)===30;

const cP1=bHandoff?step(bP2,C1):null;
const cHandoff=
  !!cP1&&cP1.terminal===0&&exactEqual(cP1,q31Root)&&rankOf(cP1)===31;

const premise=cHandoff?JSON.parse(execFileSync(
  process.execPath,
  [resolve('research/isograph/discovery/2026-09-30-universal-structural-policy/run-cpc-rank31-c3-target-reservoir-qualification.mjs'),resolve(library)],
  {encoding:'utf8',maxBuffer:64*1024*1024}
)):null;

const premiseValid=
  !!premise&&
  premise.schema==='connect4.cpc_rank31_c3_target_reservoir_qualification.v1'&&
  premise.jsMinSysSha===EXPECTED&&
  premise.oracleUsed===false&&
  premise.solvedInputsUsed===false&&
  premise.ordinaryGameTreeSearchUsed===false&&
  premise.accept===true;

const accept=
  aP1.terminal===0&&
  !!layerACpc?.agrees&&
  !!layerALiteral?.allOffForcedClosed&&
  aHandoff&&
  !!bP1&&bP1.terminal===0&&
  !!layerBCpc?.agrees&&
  !!layerBLiteral?.allOffForcedClosed&&
  bHandoff&&
  !!cP1&&cP1.terminal===0&&
  cHandoff&&
  premiseValid;

let rejectionReason=null;
if(!accept){
  if(aP1.terminal!==0)rejectionReason='layer-a-p1c5-terminal';
  else if(!layerACpc?.agrees)rejectionReason='layer-a-cpc-force-mismatch';
  else if(!layerALiteral?.allOffForcedClosed)rejectionReason='layer-a-off-forced-reply-not-immediate-p1-win';
  else if(!aHandoff)rejectionReason='layer-a-rank28-handoff-mismatch';
  else if(!bP1||bP1.terminal!==0)rejectionReason='layer-b-p1c5-terminal';
  else if(!layerBCpc?.agrees)rejectionReason='layer-b-cpc-force-mismatch';
  else if(!layerBLiteral?.allOffForcedClosed)rejectionReason='layer-b-off-forced-reply-not-immediate-p1-win';
  else if(!bHandoff)rejectionReason='layer-b-rank30-handoff-mismatch';
  else if(!cP1||cP1.terminal!==0)rejectionReason='layer-c-p1c1-terminal';
  else if(!cHandoff)rejectionReason='layer-c-rank31-handoff-mismatch';
  else if(!premiseValid)rejectionReason='rank31-reservoir-premise-failed';
  else rejectionReason='unknown';
}

console.log(JSON.stringify({
  schema:'connect4.cpc_rank26_reply7_forced_chain_win_composition.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:false,
  theoremCandidate:'CPC_RANK26_REPLY7_FORCED_CHAIN_WIN_COMPOSITION_THEOREM.md',
  rank26:{
    sequence:ROOT,
    rank:rankOf(q26),
    mover:moverOf(q26)+1,
    support:support(q26),
  },
  layerA:{
    p1Column:5,
    afterP1:{terminal:aP1.terminal,rank:rankOf(aP1),support:support(aP1)},
    cpc:layerACpc,
    offForcedReplies:layerALiteral?.offForcedReplies??[],
    literalAllOffForcedClosed:layerALiteral?.allOffForcedClosed??false,
    handoff:{
      defenderColumn:5,
      terminal:aP2?.terminal??null,
      rank:aP2?rankOf(aP2):null,
      support:aP2?support(aP2):null,
      exactRbaEqualsExpectedRank28:aHandoff,
      expectedSequence:R28,
    }
  },
  layerB:{
    p1Column:5,
    afterP1:bP1?{terminal:bP1.terminal,rank:rankOf(bP1),support:support(bP1)}:null,
    cpc:layerBCpc,
    offForcedReplies:layerBLiteral?.offForcedReplies??[],
    literalAllOffForcedClosed:layerBLiteral?.allOffForcedClosed??false,
    handoff:{
      defenderColumn:7,
      terminal:bP2?.terminal??null,
      rank:bP2?rankOf(bP2):null,
      support:bP2?support(bP2):null,
      exactRbaEqualsExpectedRank30:bHandoff,
      expectedSequence:R30,
    }
  },
  layerC:{
    p1Column:1,
    handoff:{
      terminal:cP1?.terminal??null,
      rank:cP1?rankOf(cP1):null,
      support:cP1?support(cP1):null,
      exactRbaEqualsExpectedRank31:cHandoff,
      expectedSequence:R31,
    },
    premise:premise?{
      schema:premise.schema,
      jsMinSysSha:premise.jsMinSysSha,
      oracleUsed:premise.oracleUsed,
      solvedInputsUsed:premise.solvedInputsUsed,
      ordinaryGameTreeSearchUsed:premise.ordinaryGameTreeSearchUsed,
      accept:premise.accept,
      proofPremiseAllowed:premise.proofPremiseAllowed,
      target:premise.target,
      validation:premise.validation,
      rejectionReason:premise.rejectionReason,
    }:null
  },
  accept,
  rejectionReason,
  conclusion:accept?[
    'The exact rank-26 reply-7 state is structurally certified as a Player-1 win by column 5.',
    'P1:c5 forces P2:c5; the exact rank-28 handoff then P1:c5 forces P2:c7; P1:c1 reaches exactly the separately qualified rank-31 c3r5 target-reservoir proof class.',
    'Every off-forced defender reply at both CPC restriction layers is independently closed by an immediate exact Player-1 terminal.',
    'No new Connect-Four proof primitive is introduced: this certificate is a composition of forced-response restriction, exact RBA handoff, and an existing target-reservoir theorem.'
  ]:[
    'At least one frozen forced-chain composition premise failed; the candidate is rejected at the recorded seam.'
  ],
  boundary:[
    'No diagnostic W/D/L, local recursive value, best-move table, Pons/oracle value, solved database, opening book, BSFP solved frontier, physical-position identity, or sealed holdout is used.',
    'Every forced layer is checked both by production CPC and by literal exact RBA reply enumeration.',
    'Every handoff requires exact full-RBA equality with its frozen sequence root, not support equality alone.',
    'The rank-31 target-reservoir proof is freshly re-executed against the pinned JSMinSys authority.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
