#!/usr/bin/env node
// Candidate-first discovery, followed by existing independent exact verifier.
// This is a three-turn P1 *delay* witness, not an eventual WDL solver.
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {replay,move,legal,residual,bit,popcount} from './turn6-structural-control.mjs';
import {verifyTurnSixDelayCertificate} from './turn6-third-move-dual.mjs';

const wantedFlag=process.argv.find(x=>/^--reply=[1-4]$/.test(x));
if(!wantedFlag)throw Error('usage: node turn6-third-move-guess.mjs --reply=1|2|3|4');
const REPLY=Number(wantedFlag.slice(-1));
const MAX_STATES=400, MAX_PREDICATES=2000, BUDGET_MS=30000;
const started=performance.now(),deadline=started+BUDGET_MS;
const cost={candidateMoves:0,localPredicateChecks:0,firstReplyCandidatesTested:0,
  secondReplyCandidatesTested:0};
class BudgetError extends Error{}
function checkBudget(){
 if(cost.candidateMoves>=MAX_STATES||cost.localPredicateChecks>=MAX_PREDICATES||performance.now()>deadline)
   throw new BudgetError('bounded discovery resource exhausted');
}
function moveCandidate(s,c){
 checkBudget();cost.candidateMoves++;
 const child=move(s,c-1);
 if(child===null)throw Error('candidate illegal move '+c);
 return child;
}
function immediateP0After(state){
 cost.localPredicateChecks++;
 if(state.terminal!==null||state.rank%2!==0)throw Error('wrong P0 immediate context');
 const r=residual(state,0);
 return legal(state).some(c=>r.some(x=>x===bit(c,state.h[c])));
}
function scoredDefenses(s,forFirstP1){
 const options=[],r0=residual(s,0),r1=residual(s,1);
 for(const col of legal(s)){
  const x=bit(col,s.h[col]);
  let score=0;
  for(const mask of r0){
    const size=popcount(mask);
    if((mask&x)!==0n)score+=(size===1?10000:size===2?1000:size===3?5:1);
  }
  // Immediate P1 terminal: already a logically sound defensive outcome.
  if(r1.some(mask=>mask===x))score+=1000000;
  // Seeded column-order tie breaker (none needed): center-derived familiar
  // b policy used as guess only, never as a proof or oracle input.
  if(forFirstP1&&col===0)score+=2;
  options.push({action:col+1,score});
 }
 options.sort((a,b)=>b.score-a.score||a.action-b.action);
 return options.map(x=>x.action);
}
function proposeSecondDefense(afterC){
 if(afterC.terminal===0)return null;
 for(const d of scoredDefenses(afterC,false).slice(0,2)){
  cost.secondReplyCandidatesTested++;
  const afterD=moveCandidate(afterC,d);
  if(afterD.terminal===1||afterD.terminal===2)
    return {P1Second:d,reason:'terminal for P1 or draw'};
  if(afterD.terminal===null&&!immediateP0After(afterD))
    return {P1Second:d,reason:'no immediate P0 winning landing'};
 }
 return null;
}
function proposeFirstDefense(afterA){
 if(afterA.terminal===0)return null;
 for(const b of scoredDefenses(afterA,true).slice(0,2)){
  cost.firstReplyCandidatesTested++;
  const afterB=moveCandidate(afterA,b);
  if(afterB.terminal===1||afterB.terminal===2)
   return {P1First:b,terminal:true,defenses:[]};
  const defenses=[];let complete=true,obstruction=null;
  for(const c of legal(afterB)){
    const afterC=moveCandidate(afterB,c+1);
    const d=proposeSecondDefense(afterC);
    if(d===null){
      complete=false;obstruction={P1First:b,P0Second:c+1,reason:'top-two defensive placements do not discharge immediate P0 threat'};
      break;
    }
    defenses.push({P0Second:c+1,...d});
  }
  if(complete)return {P1First:b,terminal:false,defenses};
 }
 return null;
}
export function guessAndCheck(){
 const root=replay('44444');
 let missing=null;
 try {
  const s=moveCandidate(root,REPLY);
  if(s.terminal!==null)throw Error('turn-six reply terminal');
  const cases=[];
  for(const a of legal(s)){
    const afterA=moveCandidate(s,a+1);
    const candidate=proposeFirstDefense(afterA);
    if(candidate===null){
      missing={P1Turn6:REPLY,P0First:a+1,
        reason:'none of top two residual-incidence-ranked first P1 replies produced a complete short-delay certificate'};
      break;
    }
    cases.push({P0First:a+1,...candidate});
  }
  const elapsedDiscoveryMs=performance.now()-started;
  if(missing){
    return {status:'INCOMPLETE_CANDIDATE',reply:REPLY,missing,cost,
      discoveryMs:+elapsedDiscoveryMs.toFixed(3),oracleCalls:0};
  }
  const witness=[{P1Turn6:REPLY,cases}];
  const t=performance.now();
  const verified=verifyTurnSixDelayCertificate(witness);
  const elapsedVerifyMs=performance.now()-t;
  if(JSON.stringify(verified.coveredP1Turn6Replies)!==JSON.stringify(
    REPLY===4?[4]:[REPLY,8-REPLY]))
    throw Error('verifier reply-scope mismatch');
  const malformed=JSON.parse(JSON.stringify(witness));
  malformed[0].cases.pop();
  assert.throws(()=>verifyTurnSixDelayCertificate(malformed),/missing, duplicate/);
  return {
    schema:'connect4.turn6.heuristic-third-move-delay.v0_1',
    status:'EXACT_SCOPED_DELAY_CERTIFICATE',
    reply:REPLY,mirrorReply:8-REPLY,
    witness,verified,
    evidenceClass:'internally exact local verifier, not oracle-based outcome proof',
    cost:{...cost,discoveryMs:+elapsedDiscoveryMs.toFixed(3),
      verificationMs:+elapsedVerifyMs.toFixed(3),
      totalMs:+(performance.now()-started).toFixed(3)},
    negativeControl:'missing P0 first action rejected',
    oracleCalls:0,recursiveGameSolverUsed:false,
    limitation:'Only prevents a P0 win by P0 third subsequent move; not an eventual game value.'
  };
 }catch(e){
  if(e instanceof BudgetError)
    return {status:'BUDGET_EXHAUSTED',reply:REPLY,cost,elapsedMs:+(performance.now()-started).toFixed(3)};
  return {status:'FAIL',reply:REPLY,cost,message:String(e),
   elapsedMs:+(performance.now()-started).toFixed(3)};
 }
}
if(process.argv[1]?.endsWith('turn6-third-move-guess.mjs')){
 const x=guessAndCheck();console.log(JSON.stringify(x,null,2));
 if(x.status!=='EXACT_SCOPED_DELAY_CERTIFICATE')process.exitCode=1;
}
