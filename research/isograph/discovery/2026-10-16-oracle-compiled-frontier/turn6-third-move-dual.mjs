#!/usr/bin/env node
// A deliberately BOUNDED, oracle-blind three-P0-turn dual certificate.
// Candidate discovery searches shallow P1 responses; verification checks only
// the supplied response witness and every universally quantified P0 action.
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {replay,move,legal,residual,bit,LINES} from './turn6-structural-control.mjs';

const REPS=process.argv.includes('--center-only')?[4]:[1,2,3,4]; // complete representative list unless center isolated
const MAX_STATES=400, MAX_PREDICATES=2000, BUDGET_MS=30000;
const ORIGIN='44444';
class BudgetError extends Error {constructor(message){super(message);this.name='BudgetError';}}
function immediateByResidual(state) {
  if(state.terminal!==null||state.rank%2!==0)throw Error('requires nonterminal P0 turn');
  const rs=residual(state,0);
  return legal(state).some(c=>rs.some(m=>m===bit(c,state.h[c])));
}
// Independent verifier path: direct raw geometric four-in-a-row test after
// placing one hypothetical P0 stone, not residual minimalization.
function directP0CanWinNext(state) {
  if(state.terminal!==null||state.rank%2!==0)throw Error('requires nonterminal P0 turn');
  for(const c of legal(state)){
    const possible=state.p0|bit(c,state.h[c]);
    if(LINES.some(x=>(x.mask&possible)===x.mask))return true;
  }
  return false;
}
const source=replay(ORIGIN);
assert.equal(source.rank,5);
assert.equal(source.rank%2,1);
const started=performance.now(),deadline=started+BUDGET_MS;
const cost={materializedDiscoveryStates:0,localPredicates:0};
function checkBudget(){
  if(cost.materializedDiscoveryStates>=MAX_STATES)
    throw new BudgetError('400-state discovery ceiling reached');
  if(cost.localPredicates>=MAX_PREDICATES)
    throw new BudgetError('2000 predicate discovery ceiling reached');
  if(performance.now()>deadline)
    throw new BudgetError('30-second wall-time ceiling reached');
}
function trial(state,c){
  checkBudget();
  cost.materializedDiscoveryStates++;
  const child=move(state,c-1);
  if(!child)throw Error('invalid discovery trial '+c);
  return child;
}
function findP1DelayedReply(afterC) {
  if(afterC.terminal===0)return null;
  for(const d of legal(afterC)){
    cost.localPredicates++;
    const s=trial(afterC,d+1);
    if(s.terminal===1||s.terminal===2)
      return {P1Second:d+1,reason:'terminal for P1 or draw'};
    if(s.terminal!==null)continue;
    if(!immediateByResidual(s))
      return {P1Second:d+1,reason:'no immediate P0 winning landing'};
  }
  return null;
}
function findFirstP1Delay(afterA) {
  if(afterA.terminal===0)return null;
  for(const b of legal(afterA)){
    const s=trial(afterA,b+1);
    if(s.terminal===1||s.terminal===2)
      return {P1First:b+1,terminal:true,defenses:[]};
    if(s.terminal!==null)continue;
    const defenses=[];
    let complete=true;
    for(const c of legal(s)){
      const afterC=trial(s,c+1);
      if(afterC.terminal===0){complete=false;break;}
      const response=findP1DelayedReply(afterC);
      if(response===null){complete=false;break;}
      defenses.push({P0Second:c+1,...response});
    }
    if(complete)
      return {P1First:b+1,terminal:false,defenses};
  }
  return null;
}
function discover(){
  const witness=[];
  for(const first of REPS){
    const node=trial(source,first);
    assert.equal(node.rank,6);
    assert.equal(node.rank%2,0);
    const cases=[];
    for(const a of legal(node)){
      const afterA=trial(node,a+1);
      const b=findFirstP1Delay(afterA);
      if(b===null)
        return {status:'UNCLOSED',witness,uncovered:{P1Turn6:first,P0First:a+1},
          reason:'No P1 first response found that delays P0 win through third P0 turn under the declared finite search; no value conclusion.'};
      cases.push({P0First:a+1,...b});
    }
    witness.push({P1Turn6:first,cases});
  }
  return {status:'CANDIDATE_COMPLETE',witness};
}
function sameIndex(keys,entries){
  if(keys.length!==entries.length)return false;
  return keys.every((x,i)=>x===entries[i]);
}
// Checker is intentionally supplied the entire candidate: it neither
// chooses a P1 move nor recursively invokes itself on child states.
export function verifyTurnSixDelayCertificate(witness){
  if(!Array.isArray(witness)||witness.length!==REPS.length)
    throw Error('missing support representatives');
  const result={checkedRepresentatives:0,checkedP0FirstActions:0,
    checkedP0SecondActions:0,checkedP1ResponseWitnesses:0,
    directP0WinningMoveTests:0,materializedCertificateMoves:0};
  for(let i=0;i<REPS.length;i++){
    const item=witness[i];
    if(item.P1Turn6!==REPS[i])throw Error('noncanonical P1 reply rep');
    const s=move(source,item.P1Turn6-1);
    result.materializedCertificateMoves++;
    if(!s||s.terminal!==null||s.rank!==6)throw Error('invalid initial P1 reply');
    const allFirst=legal(s).map(x=>x+1);
    if(!Array.isArray(item.cases)||
        !sameIndex(allFirst,item.cases.map(x=>x.P0First)))
      throw Error('missing, duplicate or unordered P0 first-action obligations');
    result.checkedRepresentatives++;
    for(const claim of item.cases){
      result.checkedP0FirstActions++;
      const afterA=move(s,claim.P0First-1);
      result.materializedCertificateMoves++;
      if(afterA===null||afterA.terminal===0)
        throw Error('P0 terminalized on first action');
      const afterB=move(afterA,claim.P1First-1);
      result.materializedCertificateMoves++;
      if(afterB===null||afterB.terminal===0)
        throw Error('illegal/losing first defensive response');
      if(afterB.terminal===1||afterB.terminal===2){
        if(!claim.terminal||claim.defenses.length!==0)
          throw Error('incorrect claimed terminal');
        result.checkedP1ResponseWitnesses++;
        continue;
      }
      if(claim.terminal)throw Error('false terminal claim');
      const allSecond=legal(afterB).map(x=>x+1);
      if(!Array.isArray(claim.defenses)||
          !sameIndex(allSecond,claim.defenses.map(x=>x.P0Second)))
        throw Error('missing, duplicate or unordered P0 second-action obligations');
      result.checkedP1ResponseWitnesses++;
      for(const pair of claim.defenses){
        result.checkedP0SecondActions++;
        const afterC=move(afterB,pair.P0Second-1);
        result.materializedCertificateMoves++;
        if(afterC===null||afterC.terminal===0)
          throw Error('P0 forced win on second action');
        if(afterC.terminal===1||afterC.terminal===2)continue;
        const afterD=move(afterC,pair.P1Second-1);
        result.materializedCertificateMoves++;
        if(afterD===null||afterD.terminal===0)
          throw Error('illegal/losing second defensive response');
        result.checkedP1ResponseWitnesses++;
        if(afterD.terminal===1||afterD.terminal===2)continue;
        result.directP0WinningMoveTests++;
        if(directP0CanWinNext(afterD))
          throw Error('P0 has an immediate winning answer to defense');
      }
    }
  }
  const coveredReplies=[...new Set(REPS.flatMap(x=>[x,8-x]))].sort((a,b)=>a-b);
  return {...result,coveredP1Turn6Replies:coveredReplies,
    allSevenP1RepliesCoveredByReflection:coveredReplies.length===7,
    recursiveSolveCalls:0,oracleCalls:0,provesOnly:'P1 can prevent P0 victory within three P0 moves after each rank-6 state'};
}
export function makeTurnSixDelayCandidate() {
  const t=performance.now();
  try {
    const d=discover(),discoveryMs=performance.now()-t;
    if(d.status!=='CANDIDATE_COMPLETE')
      return {...d,cost,discoveryMs:+discoveryMs.toFixed(3),status:'UNCLOSED'};
    const vstart=performance.now();
    const verified=verifyTurnSixDelayCertificate(d.witness);
    const verificationMs=performance.now()-vstart;
    let malformedRejects=0;
    const missing=JSON.parse(JSON.stringify(d.witness));
    missing[0].cases.pop();
    assert.throws(()=>verifyTurnSixDelayCertificate(missing),/missing, duplicate|action obligations/);
    malformedRejects++;
    const illegal=JSON.parse(JSON.stringify(d.witness));
    illegal[0].cases[0].P1First=8;
    assert.throws(()=>verifyTurnSixDelayCertificate(illegal),/illegal|invalid|losing/);
    malformedRejects++;
    const guarded={
      schema:'connect4.turn6.third-move-dual-certificate.v0_1',
      scope:REPS.length===4?'standard7x6 44444 after all seven P1 replies (four exact mirror classes)':'standard7x6 444444 after center P1 reply only',
      status:'EXACT_BOUNDED_DELAY_CERTIFICATE',
      supportRepresentatives:REPS,
      witness:d.witness,
      checked:verified,
      negativeControls:{missingCaseRejected:true,illegalP1MoveRejected:true,count:malformedRejects},
      cost:{...cost,discoveryMs:+discoveryMs.toFixed(3),
        verificationMs:+verificationMs.toFixed(3),
        totalMs:+(performance.now()-started).toFixed(3)},
      disclaimer:'Does not prove a draw, loss, eventual P0 win, or complete perfect play.'
    };
    return guarded;
  }catch(e){
    if(e instanceof BudgetError)
      return {status:'BUDGET_EXHAUSTED',reason:String(e),cost,
        elapsedMs:+(performance.now()-started).toFixed(3),
        note:'Budget exhaustion is not a proof or a counterexample'};
    return {status:'FAIL',reason:String(e),cost,
      elapsedMs:+(performance.now()-started).toFixed(3)};
  }
}
if(process.argv[1]&&process.argv[1].endsWith('turn6-third-move-dual.mjs')){
  const r=makeTurnSixDelayCandidate();
  console.log(JSON.stringify(r,null,2));
  if(r.status!=='EXACT_BOUNDED_DELAY_CERTIFICATE')process.exitCode=1;
}
