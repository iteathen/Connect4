#!/usr/bin/env node
// Oracle-blind local P0-winning fork generator and one fixed predecessor test.
// All verification is rank-local exact geometry, no recursive game solver.
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {replay,move,legal,residual,exactQ,bit,LINES} from './turn6-structural-control.mjs';

const MAX_STATES=50,MAX_ACTION_QUERIES=500,MAX_MS=30000;
const start=performance.now();
let made=0,actionQueries=0;
function bound(){
  if(made>MAX_STATES||actionQueries>MAX_ACTION_QUERIES||performance.now()-start>MAX_MS)
    throw Error('bounded fork probe resource exhausted');
}
function play(s,c){
  made++;bound();
  const next=move(s,c-1);
  if(!next)throw Error('illegal position move '+c);
  return next;
}
function threats(s,player){
  if(s.terminal!==null)return [];
  const own=player===0?s.p0:s.p1,out=[];
  for(const c of legal(s)){
    actionQueries++;bound();
    const now=own|bit(c,s.h[c]);
    if(LINES.some(line=>(line.mask&now)===line.mask))out.push(c+1);
  }
  return out;
}
function residualThreats(s,player){
  const R=residual(s,player);
  return legal(s).filter(c=>R.some(mask=>mask===bit(c,s.h[c]))).map(c=>c+1);
}
export function certifyPositiveFork(s){
  if(s.terminal!==null||s.rank%2!==1)throw Error('fork claim requires P1 to move');
  const p0=threats(s,0),p1=threats(s,1);
  if(JSON.stringify(p0)!==JSON.stringify(residualThreats(s,0))||
     JSON.stringify(p1)!==JSON.stringify(residualThreats(s,1)))
    throw Error('raw geometric threats disagree with independent residual cofactor');
  if(p0.length<2||p1.length>0)
    return {certified:false,p0Threats:p0,p1ImmediateWins:p1,
      failedGuard:p0.length<2?'less than two legal P0 winning replies':'P1 already has immediate win'};
  const defended=[];
  for(const d of legal(s)){
    const afterD=play(s,d+1);
    if(afterD.terminal!==null)
      throw Error('unexpected terminal on guarded no-immediate-win P1 move');
    const answers=threats(afterD,0);
    if(answers.length<1)throw Error('opponent move eliminated both alleged distinct legal threats');
    const response=play(afterD,answers[0]);
    if(response.terminal!==0)throw Error('alleged exact P0 terminal move did not win');
    defended.push({P1Move:d+1,P0CertifiedAnswer:answers[0],P0Answers:answers});
  }
  return {certified:true,rank:s.rank,support:s.h,legalP0Threats:p0,
    immediateP1Wins:p1,universalP1ReplyChecks:defended.length,defended,
    proof:'two distinct legal P0 immediate winning landings; P1 has no immediate terminal; a single P1 move can occupy at most one winning landing',
    q:{R0:exactQ(s).R0.map(x=>x.toString(16)),R1:exactQ(s).R1.map(x=>x.toString(16)),p:s.rank%2}};
}
export function probeForkPredecessor(){
  const s0=replay('444444');
  if(s0.terminal!==null||s0.rank!==6)throw Error('wrong center-full starting state');
  const first=play(s0,2); // propose P0 in one-based column 2
  const byP1=[],positiveStates=new Map();
  for(const b of legal(first)){
    const postP1=play(first,b+1);
    if(postP1.terminal!==null){
      byP1.push({P1Intervention:b+1,terminal:postP1.terminal, fork:false});
      continue;
    }
    const postP0=play(postP1,3); // proposed next P0 placement
    const p0Threats=postP0.terminal===null?threats(postP0,0):[];
    const p1ImmediateWins=postP0.terminal===null?threats(postP0,1):[];
    const fork=postP0.terminal===null&&p0Threats.length>=2&&p1ImmediateWins.length===0;
    if(fork)positiveStates.set(b+1,{predecessor:postP1,forkState:postP0});
    byP1.push({P1Intervention:b+1,postP0Landing:postP1.h[2]+1,
      fork,p0Threats,p1ImmediateWins,
      failedGuard:fork?null:(postP0.terminal!==null?'early terminal':
        p0Threats.length<2?'not two legal P0 winning landings':'P1 has immediate win')});
  }
  const positiveBackwardGenerators=[];
  for(const [b,{predecessor,forkState}] of positiveStates){
    const certificate=certifyPositiveFork(forkState);
    assert.equal(certificate.certified,true);
    assert.equal(certificate.universalP1ReplyChecks,6);
    const q=exactQ(predecessor);
    positiveBackwardGenerators.push({
      rank8Sequence:'4444442'+b,rank8Support:predecessor.h,
      rank8P0WinningGenerator:{R0:q.R0.map(x=>x.toString(16)),R1:q.R1.map(x=>x.toString(16))},
      witnessP0Action:3,rank9ForkCertificate:certificate
    });
  }
  const witness=replay('444444273');
  assert.equal(witness.rank,9);
  const fork=positiveBackwardGenerators.find(x=>x.rank8Sequence==='44444427')?.rank9ForkCertificate;
  if(!fork)throw Error('named candidate 444444273 did not survive');
  assert.deepEqual(fork.legalP0Threats,[1,5]);
  const failures=byP1.filter(x=>!x.fork);
  if(failures.length===0)throw Error('expected limited fixed P0 two-move proposal to have a defensive intervention');
  return {
    schema:'connect4.turn6.positive-fork-generator.v0_2',
    status:'LOCAL_P0_WIN_REGION_GENERATOR_VERIFIED',
    forkExampleSequence:'444444273',fork,
    positiveBackwardGenerators,
    backwardCandidate:{source:'444444',P0First:2,P0SecondProposed:3,
      interveningP1Actions:byP1,
      preservingForkCount:byP1.length-failures.length,
      preemptingActions:failures.map(x=>x.P1Intervention),
      P0PredecessorClosed:false},
    cost:{localMaterializedSuccessors:made,actionThreatPredicates:actionQueries,
      wallMs:+(performance.now()-start).toFixed(3)},
    oracleUsed:false,recursiveSolveUsed:false,
    scope:'Proves three rank8 P0 winning states via one move into fully checked rank9 forks. Does NOT prove the earlier rank7 P1-turn state winning, nor 444444 or 44444.'
  };
}
if(process.argv[1]?.endsWith('turn6-positive-fork-control.mjs')){
 const out=probeForkPredecessor();
 console.log(JSON.stringify(out,null,2));
}
