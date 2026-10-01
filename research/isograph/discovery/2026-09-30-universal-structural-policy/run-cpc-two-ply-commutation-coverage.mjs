#!/usr/bin/env node
import assert from 'node:assert/strict';
import {ingress,mover,terminal,legal,cofactor} from './run-cpc-attacker-completion-proof-classes.mjs';

function key(q){return Array.from(q.words).join(',')+'|'+Array.from(q.basis).join(',');}
function terminalName(code,attacker){
  if(code===0)return 'NONTERMINAL';
  if(code===2)return 'DRAW';
  const attackerCode=attacker===0?3:1;
  return code===attackerCode?'ATTACKER':'DEFENDER';
}

const roots=[
  {id:'c2',sequence:'4444415662'},
  {id:'c3',sequence:'4444415663'},
  {id:'c6',sequence:'4444415666'}
];

const endpoints={};
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q);
  assert.equal(terminal(q),0);
  const rows=[];
  for(const a of legal(q)){
    const first=cofactor(q,a),p1=terminalName(first.term,attacker);
    if(p1!=='NONTERMINAL'){
      rows.push({attackerColumn:a+1,defenderColumn:null,terminal:p1,key:null,sequence:root.sequence+String(a+1)});
      continue;
    }
    for(const d of legal(first.q)){
      const second=cofactor(first.q,d),p2=terminalName(second.term,attacker);
      rows.push({
        attackerColumn:a+1,defenderColumn:d+1,terminal:p2,
        key:p2==='NONTERMINAL'?key(second.q):null,
        sequence:root.sequence+String(a+1)+String(d+1),
        support:p2==='NONTERMINAL'?Array.from({length:7},(_,c)=>second.q.words[c]):null
      });
    }
  }
  endpoints[root.id]={sequence:root.sequence,attacker:attacker+1,rows};
}

function match(left,right){
  const L=endpoints[left].rows.filter(x=>x.key),R=endpoints[right].rows.filter(x=>x.key);
  const byKey=new Map();
  for(const r of R){
    const a=byKey.get(r.key)??[];a.push(r);byKey.set(r.key,a);
  }
  const exact=[];
  for(const l of L)for(const r of byKey.get(l.key)??[])
    exact.push({
      left:{a:l.attackerColumn,d:l.defenderColumn,sequence:l.sequence},
      right:{a:r.attackerColumn,d:r.defenderColumn,sequence:r.sequence},
      sameAttackerColumn:l.attackerColumn===r.attackerColumn,
      support:l.support
    });
  return exact;
}

const c6c2=match('c6','c2'),c6c3=match('c6','c3'),c2c3=match('c2','c3');
function coverage(matches){
  const same=matches.filter(x=>x.sameAttackerColumn);
  const byA={};
  for(const m of same)(byA[m.left.a]??=[]).push({leftD:m.left.d,rightD:m.right.d,rightSequence:m.right.sequence});
  return {sameAttackerMatches:same.length,attackerColumns:Object.keys(byA).map(Number).sort((a,b)=>a-b),byAttackerColumn:byA};
}
const union=new Set([...coverage(c6c2).attackerColumns,...coverage(c6c3).attackerColumns]);

console.log(JSON.stringify({
  schema:'connect4.cpc_two_ply_commutation_coverage.v1',
  oracleUsed:false,
  solvedInputsUsed:false,
  roots:Object.fromEntries(Object.entries(endpoints).map(([k,v])=>[k,{sequence:v.sequence,attacker:v.attacker,nonterminalEndpoints:v.rows.filter(x=>x.key).length}])),
  pairs:{
    c6_c2:{exactMatches:c6c2.length,coverage:coverage(c6c2),sample:c6c2.slice(0,40)},
    c6_c3:{exactMatches:c6c3.length,coverage:coverage(c6c3),sample:c6c3.slice(0,40)},
    c2_c3:{exactMatches:c2c3.length,coverage:coverage(c2c3),sample:c2c3.slice(0,40)}
  },
  c6SameAttackerUnionCoverage:[...union].sort((a,b)=>a-b),
  boundary:[
    'Two-ply local semantic endpoint census only; no value recursion or oracle.',
    'Exact matches compare complete CPC/RBA semantic keys.',
    'Matching endpoints do not by themselves establish strategy dominance or remoteness ordering.'
  ]
},null,2));
