#!/usr/bin/env node
import assert from 'node:assert/strict';
import {ingress,rank,mover,terminal,legal,cofactor,proveAttacker} from './run-cpc-attacker-completion-proof-classes.mjs';

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
  {id:'c6_compliant_23',sequence:'444441566623'},
  {id:'c6_compliant_32',sequence:'444441566632'},
];

const rows=[];
for(const root of roots){
  const q=ingress(root.sequence);
  assert.equal(terminal(q),0);
  const attacker=mover(q),setups=[];
  for(const a of legal(q)){
    const first=cofactor(q,a),p1=polarity(first.term,attacker);
    if(p1==='ATTACKER'){
      setups.push({setupColumn:a+1,closed:true,upper:1,constructor:'IMMEDIATE_TERMINAL',children:[]});
      continue;
    }
    if(p1!=='NONTERMINAL'){
      setups.push({setupColumn:a+1,closed:false,reason:'SETUP_TERMINAL_'+p1,children:[]});
      continue;
    }
    assert.equal(mover(first.q),1-attacker);
    const children=[];let maxChild=0,valid=true;
    for(const d of legal(first.q)){
      const second=cofactor(first.q,d),p2=polarity(second.term,attacker);
      const seq=root.sequence+String(a+1)+String(d+1);
      if(p2!=='NONTERMINAL'){
        children.push({defenderColumn:d+1,sequence:seq,terminal:p2,finiteUpper:null});
        valid=false;continue;
      }
      const cert=proveAttacker(second.q,attacker,4);
      children.push({
        defenderColumn:d+1,
        sequence:seq,
        terminal:null,
        finiteUpper:cert?.upper??null,
        constructor:cert?.constructor??null,
        support:Array.from({length:7},(_,c)=>second.q.words[c]),
        basisSize:second.q.basis.length
      });
      if(cert)maxChild=Math.max(maxChild,cert.upper);else valid=false;
    }
    const unresolved=children.filter(x=>x.terminal===null&&x.finiteUpper===null);
    setups.push({
      setupColumn:a+1,
      closed:valid,
      upper:valid?2+maxChild:null,
      childCount:children.length,
      certifiedChildren:children.filter(x=>x.finiteUpper!==null).length,
      unresolvedCount:unresolved.length,
      unresolved,
      children
    });
  }
  rows.push({
    ...root,
    rank:rank(q),
    attacker:attacker+1,
    support:Array.from({length:7},(_,c)=>q.words[c]),
    finiteSetups:setups.filter(x=>x.closed).map(x=>({column:x.setupColumn,upper:x.upper})),
    bestCoverage:Math.max(...setups.map(x=>x.certifiedChildren??0)),
    setups
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_compliant_survivor_seam.v1',
  oracleUsed:false,
  solvedInputsUsed:false,
  rows,
  compact:rows.map(r=>({
    id:r.id,
    sequence:r.sequence,
    support:r.support,
    finiteSetups:r.finiteSetups,
    best:r.setups
      .filter(x=>(x.certifiedChildren??0)===r.bestCoverage)
      .map(x=>({
        setup:x.setupColumn,
        certifiedChildren:x.certifiedChildren??0,
        childCount:x.childCount??0,
        unresolved:x.unresolved??[]
      }))
  })),
  boundary:[
    'Consumed-training theorem-discovery diagnostic only.',
    'Exactly one unrestricted defender layer is exposed from each already-isolated CPC compliant survivor state.',
    'Child closure uses only the frozen qualified A_D proof grammar.',
    'No recursive expansion of unresolved CPC_NONE descendants is performed.'
  ]
},null,2));
