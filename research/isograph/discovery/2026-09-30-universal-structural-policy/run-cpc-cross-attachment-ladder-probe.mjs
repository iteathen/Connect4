#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  ingress, rank, mover, terminal, legal, cofactor
} from './run-cpc-attacker-completion-proof-classes.mjs';

const roots=[
  {id:'c6_r4',sequence:'444441566614'},
  {id:'c6_r5',sequence:'444441566615'},
  {id:'c6_r6',sequence:'444441566616'},
];

const WATCH=[51,442,530];
function coordHas(q,player,id){
  const base=player===0?8:11; // standard 7x6 pinned geometry offsets: support7 + meta + 3 words/player
  const i=q.basis.indexOf(id);
  if(i<0)return false;
  return (q.words[base+(i>>>5)]&(1<<(i&31)))!==0;
}
function shapeInfo(g,id){
  const cells=[];
  for(let i=0;i<g.shapeSize[id];i++){
    const cell=g.shapeCells[id*4+i];
    cells.push({cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1});
  }
  return cells;
}

// Do not duplicate geometry constants from the RBA library. Obtain geometry
// through the ingress state module's exact cofactor by introspecting standard
// shape IDs from the durable RSF profile instead.
const WATCH_CELLS={
  51:[{column:2,row:1},{column:3,row:1}],
  442:[{column:1,row:3},{column:2,row:3},{column:3,row:3}],
  530:[{column:1,row:5},{column:2,row:5},{column:3,row:5}],
};
function support(q){return Array.from(q.words.slice(0,7));}
function residualState(q,attacker){
  const out={};
  for(const id of WATCH){
    const cells=WATCH_CELLS[id];
    const live=coordHas(q,attacker,id);
    out[id]={
      live,
      cells:cells.map(x=>({
        ...x,
        depth:x.row-1-q.words[x.column-1],
        playable:q.words[x.column-1]===x.row-1
      }))
    };
  }
  return out;
}
function termName(code,attacker){
  if(code===0)return 'NONTERMINAL';
  if(code===2)return 'DRAW';
  return code===(attacker===0?3:1)?'ATTACKER':'DEFENDER';
}

const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q);
  assert.equal(rank(q),12);
  assert.equal(terminal(q),0);
  const trigger=0; // column 1 is the first failed S9 trigger in all three c6 children
  const first=cofactor(q,trigger),p1=termName(first.term,attacker);
  assert.equal(p1,'NONTERMINAL');
  const before=residualState(q,attacker);
  const afterTrigger=residualState(first.q,attacker);
  const replies=[];
  for(const d of legal(first.q)){
    const second=cofactor(first.q,d),p2=termName(second.term,attacker);
    replies.push({
      responseColumn:d+1,
      terminal:p2,
      support:p2==='NONTERMINAL'?support(second.q):null,
      watched:p2==='NONTERMINAL'?residualState(second.q,attacker):null,
      delta:{
        kills51:p2==='NONTERMINAL'&&before[51].live&&!residualState(second.q,attacker)[51].live,
        kills442:p2==='NONTERMINAL'&&before[442].live&&!residualState(second.q,attacker)[442].live,
        kills530:p2==='NONTERMINAL'&&before[530].live&&!residualState(second.q,attacker)[530].live,
      }
    });
  }
  rows.push({
    ...root,attacker:attacker+1,
    supportBefore:support(q),
    watchedBefore:before,
    triggerColumn:1,
    supportAfterTrigger:support(first.q),
    watchedAfterTrigger:afterTrigger,
    replies
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_cross_attachment_ladder_probe.v1',
  oracleUsed:false,
  solvedInputsUsed:false,
  purpose:'Local theorem-discovery probe for the c6 0,0 -> 0,2,2 -> 2,4,4 attachment ladder after the first failed trigger.',
  rows,
  boundary:[
    'All response columns are enumerated only as discovery evidence at three consumed-training states.',
    'No arbitrary-response runtime rule or W/D/L conclusion follows.',
    'The target is a geometry-derived cross-residual support/resource theorem, if one exists.'
  ]
},null,2));