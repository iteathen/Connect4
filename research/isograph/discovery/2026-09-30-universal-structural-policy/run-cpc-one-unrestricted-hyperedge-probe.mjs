#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  ingress, rank, mover, terminal, legal, cofactor, proveAttacker
} from './run-cpc-attacker-completion-proof-classes.mjs';

function attackerTerminalCode(attacker){return attacker===0?3:1;}
function defenderTerminalCode(attacker){return attacker===0?1:3;}
function polarity(code,attacker){
  if(code===0)return 'NONTERMINAL';
  if(code===2)return 'DRAW';
  if(code===attackerTerminalCode(attacker))return 'ATTACKER';
  if(code===defenderTerminalCode(attacker))return 'DEFENDER';
  throw new Error('terminal code '+code);
}

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
];

const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q),setups=[];
  for(const a of legal(q)){
    const first=cofactor(q,a),p1=polarity(first.term,attacker);
    if(p1==='ATTACKER'){
      setups.push({setupColumn:a+1,closed:true,upper:1,constructor:'IMMEDIATE_TERMINAL',children:[]});
      continue;
    }
    if(p1!=='NONTERMINAL'){
      setups.push({setupColumn:a+1,closed:false,reason:'BAD_SETUP_TERMINAL_'+p1,children:[]});
      continue;
    }
    assert.equal(mover(first.q),1-attacker);

    let valid=true,maxChild=0;
    const children=[];
    for(const d of legal(first.q)){
      const second=cofactor(first.q,d),p2=polarity(second.term,attacker);
      if(p2!=='NONTERMINAL'){
        children.push({defenderColumn:d+1,terminal:p2,finiteUpper:null});
        valid=false;
        continue;
      }
      assert.equal(mover(second.q),attacker);
      const cert=proveAttacker(second.q,attacker,4);
      children.push({
        defenderColumn:d+1,
        terminal:null,
        finiteUpper:cert?.upper??null,
        constructor:cert?.constructor??null,
        certificate:cert??null,
        support:Array.from({length:7},(_,c)=>second.q.words[c]),
        basisSize:second.q.basis.length,
      });
      if(!cert)valid=false;
      else maxChild=Math.max(maxChild,cert.upper);
    }

    setups.push({
      setupColumn:a+1,
      closed:valid,
      upper:valid?2+maxChild:null,
      constructor:valid?'ONE_UNRESTRICTED_DEFENDER_LAYER':null,
      maxChildUpper:valid?maxChild:null,
      childCount:children.length,
      certifiedChildren:children.filter(x=>x.finiteUpper!==null).length,
      children
    });
  }
  rows.push({
    ...root,
    rank:rank(q),
    attacker:attacker+1,
    finiteSetups:setups.filter(s=>s.closed).map(s=>({column:s.setupColumn,upper:s.upper})),
    setups
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_one_unrestricted_hyperedge_probe.v1',
  oracleUsed:false,
  solvedInputsUsed:false,
  proofGrammar:'one attacker setup, one unrestricted legal defender response layer, then frozen A_D proof classes only',
  rows,
  summary:rows.map(r=>({
    id:r.id,
    finiteSetups:r.finiteSetups,
    setupCoverage:r.setups.map(s=>({
      setup:s.setupColumn,
      closed:s.closed,
      upper:s.upper,
      childCount:s.childCount??0,
      certifiedChildren:s.certifiedChildren??0
    }))
  })),
  boundary:[
    'This is theorem-discovery evidence only and is not a promoted runtime rule.',
    'No recursion through further CPC_NONE layers is permitted.',
    'If a setup closes, a separate aggregate structural theorem is required before promotion; raw unrestricted branching is not the project target.'
  ]
},null,2));
