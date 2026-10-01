#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  ingress, rank, mover, terminal, legal, cofactor
} from './run-cpc-attacker-completion-proof-classes.mjs';

const H=6;
const DEBT=[1,2,5]; // zero-based columns {2,3,6}
const rootToken=new Map([
  ['candidate2',1],
  ['candidate3',2],
  ['candidate6',5],
]);

function keyOf(q){return Array.from(q.words).join(',')+'|'+Array.from(q.basis).join(',');}
function terminalPolarity(code,attacker){
  if(code===0)return 'NONTERMINAL';
  if(code===2)return 'DRAW';
  const attackerCode=attacker===0?3:1;
  return code===attackerCode?'ATTACKER':'DEFENDER';
}

const cfMemo=new Map(),memo=new Map(),inProgress=new Set();
let cfCalls=0,classCalls=0,memoHits=0,branchTests=0,responseTests=0;
const MAX_BRANCH_TESTS=2_000_000;

function cf(q,c){
  const mk=keyOf(q)+'|'+c;
  if(cfMemo.has(mk))return cfMemo.get(mk);
  const r=cofactor(q,c);cfCalls++;cfMemo.set(mk,r);return r;
}

function responseCandidates(firstQ,token,attackerColumn){
  // If the attacker hits the prepaid debt column, consume the next same-column
  // defender cell as a two-ply vertical stutter and keep the same debt token.
  if(attackerColumn===token){
    if(firstQ.words[token]<H)
      return [{column:token,nextToken:token,mode:'SELF_STUTTER'}];

    // Top-debt transport: the attacker has just filled the prepaid column's
    // last cell, so the same-column follow-up no longer exists. Spend this
    // defender turn in another debt-reservoir column and move the token there.
    // This is theorem-discovery policy state; soundness comes from exact
    // cofactor transport and recursive all-trigger verification.
    const out=[];
    for(const q of DEBT){
      if(q===token||firstQ.words[q]>=H)continue;
      out.push({column:q,nextToken:q,mode:'TOP_DEBT_TRANSPORT'});
    }
    return out;
  }

  // Otherwise commute the prepaid placement with one of the other debt columns.
  // The exact same-player commutation theorem applies when token, attacker, and
  // response are pairwise distinct. If attacker is outside the debt set there
  // are two possible switches; if it is another debt column there is one.
  const out=[];
  for(const q of DEBT){
    if(q===token||q===attackerColumn)continue;
    if(firstQ.words[q]>=H)continue;
    out.push({column:q,nextToken:q,mode:'DEBT_SWITCH'});
  }
  return out;
}

function survive(q,attacker,token,k,recordRoot=false){
  assert.equal(terminal(q),0);assert.equal(mover(q),attacker);
  assert(DEBT.includes(token));
  if(k<=0)return {accept:true,class:'DONE'};
  const mk=keyOf(q)+'|A'+attacker+'|T'+token+'|K'+k;
  if(memo.has(mk)){memoHits++;return memo.get(mk);}
  if(inProgress.has(mk))throw new Error('unexpected debt automaton cycle');
  inProgress.add(mk);classCalls++;

  const witnesses=[];
  for(const a of legal(q)){
    branchTests++;
    if(branchTests>MAX_BRANCH_TESTS)throw new Error('branch budget exceeded');
    const first=cf(q,a),p1=terminalPolarity(first.term,attacker);
    if(p1==='ATTACKER'){
      const r={accept:false,class:'ATTACKER_TERMINAL',failedColumn:a+1,token:token+1};
      memo.set(mk,r);inProgress.delete(mk);return r;
    }
    if(p1==='DRAW'||p1==='DEFENDER'){
      witnesses.push({attackerColumn:a+1,closed:p1,tokenBefore:token+1});
      continue;
    }

    let found=null;
    for(const rc of responseCandidates(first.q,token,a)){
      responseTests++;
      const second=cf(first.q,rc.column),p2=terminalPolarity(second.term,attacker);
      if(p2==='ATTACKER')throw new Error('defender placement cannot create attacker terminal');
      if(p2==='DRAW'||p2==='DEFENDER'){
        found={
          attackerColumn:a+1,responseColumn:rc.column+1,mode:rc.mode,
          tokenBefore:token+1,tokenAfter:rc.nextToken+1,closed:p2
        };
        break;
      }
      const child=survive(second.q,attacker,rc.nextToken,k-1,false);
      if(child.accept){
        found={
          attackerColumn:a+1,responseColumn:rc.column+1,mode:rc.mode,
          tokenBefore:token+1,tokenAfter:rc.nextToken+1,childClass:child.class
        };
        break;
      }
    }
    if(!found){
      const r={
        accept:false,class:'DEBT_RESPONSE_EXHAUSTED',
        failedColumn:a+1,token:token+1,
        candidateResponses:responseCandidates(first.q,token,a).map(x=>({
          column:x.column+1,nextToken:x.nextToken+1,mode:x.mode
        }))
      };
      memo.set(mk,r);inProgress.delete(mk);return r;
    }
    witnesses.push(found);
  }

  const r={accept:true,class:'THREE_COLUMN_RESPONSE_DEBT',witness:recordRoot?witnesses:null};
  memo.set(mk,r);inProgress.delete(mk);return r;
}

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
];

const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q),token=rootToken.get(root.id);
  assert.equal(rank(q),10);
  const ladder=[];let max=null,firstFailure=null;
  for(let k=1;k<=16;k++){
    const r=survive(q,attacker,token,k,k===1);
    const horizon=2*k-1;
    ladder.push({
      attackerTurns:k,horizon,absolutePly:10+horizon,
      accept:r.accept,class:r.class,
      failedColumn:r.failedColumn??null,token:r.token??null
    });
    if(r.accept)max=horizon;
    else{firstFailure=horizon;break;}
  }
  const maxK=max===null?0:(max+1)/2;
  // Force a root-only witness by clearing just the selected root memo entry.
  let witness=null;
  if(maxK){
    const mk=keyOf(q)+'|A'+attacker+'|T'+token+'|K'+maxK;
    memo.delete(mk);
    witness=survive(q,attacker,token,maxK,true).witness??null;
  }
  rows.push({
    ...root,attacker:attacker+1,initialDebtColumn:token+1,
    maxCertifiedSurvivalHorizon:max,
    maxCertifiedAbsolutePly:max===null?10:10+max,
    firstFailedHorizon:firstFailure,
    firstFailedAbsolutePly:firstFailure===null?null:10+firstFailure,
    ladder,rootWitness:witness
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_three_column_response_debt_top_repair.v1',
  oracleUsed:false,
  solvedInputsUsed:false,
  debtColumns:DEBT.map(x=>x+1),
  policy:[
    'state memory is one prepaid defender debt column in {2,3,6}',
    'attacker hits current debt column below top -> defender same-column follow-up, debt column unchanged',
    'attacker fills the top of current debt column -> defender transports the one-slot response debt to another debt-reservoir column',
    'attacker plays another column -> defender chooses a distinct debt column and transports the prepaid placement by the exact same-player commutation law',
    'all realized placements use exact CPC/RBA cofactors with first-win stopping'
  ],
  target:{
    rootRank:10,
    absolutePly41RelativeHorizon:31,
    exactMove41DelayWouldRequireSurvivalThroughRelativeHorizon29AndFailureBy31:true
  },
  rows,
  work:{cfCalls,classCalls,memoHits,branchTests,responseTests,memoStates:memo.size,cofactorStates:cfMemo.size},
  boundary:[
    'This is a finite three-state temporal-contract policy, not unrestricted minimax.',
    'Acceptance is a constructive survival certificate only.',
    'Failure is not an attacker forced-completion upper bound.',
    'The same-player commutation interpretation is used only on pairwise-distinct debt-switch transitions; self-stutter and top-debt transports are checked directly by exact cofactors.',
    'Top-debt transport is a theorem-discovery policy constructor here; it is not promoted as a generic theorem by this control alone.'
  ]
},null,2));
