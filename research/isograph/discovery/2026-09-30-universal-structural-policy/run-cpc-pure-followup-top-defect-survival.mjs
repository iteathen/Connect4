#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  ingress, rank, mover, terminal, legal, cofactor
} from './run-cpc-attacker-completion-proof-classes.mjs';

const W=7,H=6;
function keyOf(q){return Array.from(q.words).join(',')+'|'+Array.from(q.basis).join(',');}
function phase(q){return Array.from({length:W},(_,c)=>q.words[c]&1);}
function derivative(phi){return Array.from({length:phi.length-1},(_,i)=>phi[i]^phi[i+1]);}
function safePhase(q){
  const d=derivative(phase(q));
  for(let i=0;i+2<d.length;i++)if(d[i]===d[i+1]&&d[i]===d[i+2])return false;
  return true;
}
function terminalPolarity(code,attacker){
  if(code===0)return 'NONTERMINAL';
  if(code===2)return 'DRAW';
  const attackerCode=attacker===0?3:1;
  return code===attackerCode?'ATTACKER':'DEFENDER';
}

const memo=new Map(),inProgress=new Set(),cofactorCache=new Map();
let classCalls=0,memoHits=0,branchTests=0,repairTests=0,cofactorCalls=0;
const MAX_BRANCH_TESTS=2_000_000;

function cf(q,c){
  const mk=keyOf(q)+'|'+c;
  if(cofactorCache.has(mk))return cofactorCache.get(mk);
  const x=cofactor(q,c);cofactorCalls++;
  cofactorCache.set(mk,x);return x;
}

function surviveCycles(q,attacker,k,recordRoot=false){
  assert.equal(terminal(q),0);assert.equal(mover(q),attacker);
  if(k<=0)return {accept:true,class:'DONE',witness:null};
  const mk=keyOf(q)+'|A'+attacker+'|K'+k;
  if(memo.has(mk)){memoHits++;return memo.get(mk);}
  if(inProgress.has(mk))throw new Error('unexpected temporal-contract cycle');
  inProgress.add(mk);classCalls++;

  if(!safePhase(q)){
    const r={accept:false,class:'UNSAFE_PHASE'};memo.set(mk,r);inProgress.delete(mk);return r;
  }

  const witnesses=[];
  for(const a of legal(q)){
    branchTests++;
    if(branchTests>MAX_BRANCH_TESTS)throw new Error('branch budget exceeded');
    const first=cf(q,a),p1=terminalPolarity(first.term,attacker);
    if(p1==='ATTACKER'){
      const r={accept:false,class:'ATTACKER_TERMINAL',failedColumn:a+1};
      memo.set(mk,r);inProgress.delete(mk);return r;
    }
    if(p1==='DRAW'||p1==='DEFENDER'){
      witnesses.push({attackerColumn:a+1,closed:p1});
      continue;
    }

    // Ordinary pure follow-up: if the trigger was not the top cell, the
    // defender responds immediately above it in the same column.
    if(first.q.words[a]<H){
      const second=cf(first.q,a),p2=terminalPolarity(second.term,attacker);
      if(p2==='ATTACKER')throw new Error('defender cofactor cannot create attacker terminal');
      if(p2==='DRAW'||p2==='DEFENDER'){
        witnesses.push({attackerColumn:a+1,responseColumn:a+1,mode:'FOLLOWUP',closed:p2});
        continue;
      }
      if(!safePhase(second.q)){
        const r={accept:false,class:'FOLLOWUP_PHASE_DRIFT',failedColumn:a+1};
        memo.set(mk,r);inProgress.delete(mk);return r;
      }
      const child=surviveCycles(second.q,attacker,k-1,false);
      if(!child.accept){
        const r={accept:false,class:'FOLLOWUP_CHILD_FAIL',failedColumn:a+1,childClass:child.class};
        memo.set(mk,r);inProgress.delete(mk);return r;
      }
      witnesses.push({attackerColumn:a+1,responseColumn:a+1,mode:'FOLLOWUP',childClass:child.class});
      continue;
    }

    // Top defect: same-column response is impossible. Transport the one-slot
    // response debt into a different nonfull column, but only through a phase-
    // safe exact successor. The defender may choose the repair after observing
    // the top trigger.
    let found=null;
    for(const rcol of legal(first.q)){
      repairTests++;
      const second=cf(first.q,rcol),p2=terminalPolarity(second.term,attacker);
      if(p2==='ATTACKER')throw new Error('defender repair cannot create attacker terminal');
      if(p2==='DRAW'||p2==='DEFENDER'){
        found={attackerColumn:a+1,responseColumn:rcol+1,mode:'TOP_REPAIR',closed:p2};
        break;
      }
      if(!safePhase(second.q))continue;
      const child=surviveCycles(second.q,attacker,k-1,false);
      if(child.accept){
        found={attackerColumn:a+1,responseColumn:rcol+1,mode:'TOP_REPAIR',childClass:child.class};
        break;
      }
    }
    if(!found){
      const r={accept:false,class:'TOP_REPAIR_EXHAUSTED',failedColumn:a+1};
      memo.set(mk,r);inProgress.delete(mk);return r;
    }
    witnesses.push(found);
  }

  const r={accept:true,class:'PURE_FOLLOWUP_DEFECT',witness:recordRoot?witnesses:null};
  memo.set(mk,r);inProgress.delete(mk);return r;
}

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
  {id:'candidate6_trigger1_response4',sequence:'444441566614'},
  {id:'candidate6_trigger1_response5',sequence:'444441566615'},
  {id:'candidate6_trigger1_response6',sequence:'444441566616'},
];

const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q);
  assert(rank(q)===10||rank(q)===12,'unexpected diagnostic root rank');
  const p=phase(q),d=derivative(p);
  const ladder=[];
  let maxSafe=null,firstFailed=null;
  for(let k=1;k<=16;k++){
    const r=surviveCycles(q,attacker,k,k===1);
    const horizon=2*k-1;
    ladder.push({attackerTurns:k,horizon,accept:r.accept,class:r.class,failedColumn:r.failedColumn??null});
    if(r.accept)maxSafe=horizon;
    else{firstFailed=horizon;break;}
  }
  // Re-evaluate the maximal accepted class solely to expose root response modes.
  const maxK=maxSafe===null?0:(maxSafe+1)/2;
  const witness=maxK?surviveCycles(q,attacker,maxK,true):null;
  rows.push({
    ...root,rootRank:rank(q),attacker:attacker+1,
    phase:p,derivative:d,initialPhaseSafe:safePhase(q),
    maxCertifiedSurvivalHorizon:maxSafe,
    firstFailedHorizon:firstFailed,
    ladder,
    maximalRootWitness:witness?.witness??null
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_pure_followup_top_defect_survival.v1',
  oracleUsed:false,
  solvedInputsUsed:false,
  contract:[
    'ordinary attacker trigger below top -> same-column immediate defender follow-up',
    'top-row attacker trigger -> defender may transport the missing follow-up to any nonfull column whose exact successor remains in the safe phase code and recursively certified contract class',
    'all transitions use exact CPC/RBA cofactors and first-win stopping'
  ],
  rows,
  work:{classCalls,memoHits,branchTests,repairTests,cofactorCalls,memoStates:memo.size,cofactorStates:cofactorCache.size},
  boundary:[
    'This is a constructive restricted defender temporal-contract policy, not minimax and not an exact remoteness claim.',
    'The phase code restricts repair choices; exact residual state is still carried and terminal safety is checked on every realized trigger.',
    'Failure at the next horizon is not an attacker upper bound.'
  ]
},null,2));
