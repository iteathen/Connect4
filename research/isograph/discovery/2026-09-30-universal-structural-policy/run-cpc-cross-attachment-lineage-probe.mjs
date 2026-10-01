#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-cross-attachment-lineage-probe.mjs <JSMinSys checkout>');
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactorKnownHeight}=await load('rba-connect4-coordinate');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const moves=s=>Array.from(s,c=>Number(c)-1);
function ingress(sequence){
  const q=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  return {words:q.words,basis:q.basis};
}
const rank=q=>q.words[g.metaOffset]>>>2;
const mover=q=>rank(q)&1;
const terminal=q=>q.words[g.metaOffset]&3;
function legal(q){const out=[];for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);return out;}
function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function activeIds(q,player){
  const base=player===0?g.p0Offset:g.p1Offset,out=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,base,i))out.push(q.basis[i]);
  return out;
}
function shapeCells(id){
  const out=[],base=id*4,n=g.shapeSize[id];
  for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);
  return out.sort((a,b)=>a-b);
}
const sig=xs=>xs.slice().sort((a,b)=>a-b).join(',');
function cellName(cell){return {cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1};}
function locateExact(q,player,cells){
  const target=sig(cells),matches=[];
  for(const id of activeIds(q,player))if(sig(shapeCells(id))===target)matches.push(id);
  return matches;
}
function termName(code,attacker){
  if(code===0)return 'NONTERMINAL';
  if(code===2)return 'DRAW';
  return code===(attacker===0?3:1)?'ATTACKER':'DEFENDER';
}
let cofactorCount=0;
function cofactor(q,column){
  const words=new Uint32Array(g.keyWords),basisBuf=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(
    g,profile,q.words,0,q.basis,0,q.basis.length,
    column,q.words[column],
    words,0,basisBuf,0,seen,sizes,0
  );
  cofactorCount++;
  return {term,q:{words,basis:basisBuf.slice(0,sizes[0])}};
}

const roots=[
  {id:'c6_r4',sequence:'444441566614'},
  {id:'c6_r5',sequence:'444441566615'},
  {id:'c6_r6',sequence:'444441566616'},
];
const WATCH=[51,442,530];
const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q);
  assert.equal(rank(q),12);assert.equal(terminal(q),0);
  const triggerColumn=0;
  const triggerCell=q.words[triggerColumn]*g.columns+triggerColumn;
  const before=Object.fromEntries(WATCH.map(id=>[
    id,{id,cells:shapeCells(id),active:activeIds(q,attacker).includes(id)}
  ]));
  assert(WATCH.every(id=>before[id].active),root.id+' watched parent residual missing');

  const first=cofactor(q,triggerColumn);
  assert.equal(termName(first.term,attacker),'NONTERMINAL');
  const afterTrigger={};
  for(const id of WATCH){
    const parent=before[id].cells;
    const expected=parent.includes(triggerCell)?parent.filter(x=>x!==triggerCell):parent.slice();
    afterTrigger[id]={
      parentId:id,
      triggerConsumesRequiredCell:parent.includes(triggerCell),
      expectedCells:expected.map(cellName),
      exactDescendantIds:locateExact(first.q,attacker,expected)
    };
  }

  const replies=[];
  for(const d of legal(first.q)){
    const responseCell=first.q.words[d]*g.columns+d;
    const second=cofactor(first.q,d),p2=termName(second.term,attacker);
    const lineage={};
    if(p2==='NONTERMINAL'){
      for(const id of WATCH){
        const parent=before[id].cells;
        const afterA=parent.includes(triggerCell)?parent.filter(x=>x!==triggerCell):parent.slice();
        const defenderHits=afterA.includes(responseCell);
        lineage[id]={
          parentId:id,
          afterAttackerCells:afterA.map(cellName),
          defenderHitsRemainingRequirement:defenderHits,
          expectedAfterResponse:defenderHits?[]:afterA.map(cellName),
          exactDescendantIds:defenderHits?[]:locateExact(second.q,attacker,afterA),
          semanticDisposition:defenderHits?'KILLED_BY_DEFENDER':'PERSISTS'
        };
      }
    }
    replies.push({
      responseColumn:d+1,
      responseCell:cellName(responseCell),
      terminal:p2,
      support:p2==='NONTERMINAL'?Array.from(second.q.words.slice(0,g.columns)):null,
      lineage:p2==='NONTERMINAL'?lineage:null
    });
  }
  rows.push({
    ...root,attacker:attacker+1,
    supportBefore:Array.from(q.words.slice(0,g.columns)),
    triggerColumn:1,triggerCell:cellName(triggerCell),
    watchedBefore:Object.fromEntries(Object.entries(before).map(([id,x])=>[id,{
      active:x.active,cells:x.cells.map(cellName)
    }])),
    afterTrigger,
    replies
  });
}

for(const row of rows){
  for(const [id,x] of Object.entries(row.afterTrigger)){
    assert(x.exactDescendantIds.length>0,row.id+' '+id+' lineage lost after attacker trigger');
  }
  for(const reply of row.replies){
    if(reply.terminal!=='NONTERMINAL')continue;
    for(const [id,x] of Object.entries(reply.lineage)){
      if(x.semanticDisposition==='PERSISTS')
        assert(x.exactDescendantIds.length>0,row.id+' reply '+reply.responseColumn+' '+id+' persistent lineage missing');
    }
  }
}

console.log(JSON.stringify({
  schema:'connect4.cpc_cross_attachment_lineage_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  rows,
  work:{cofactorCount},
  conclusion:[
    'Residual disappearance by fixed shape ID is not treated as semantic destruction.',
    'Attacker occupation of a required cell transports the same line obligation to the exact residual with that cell removed.',
    'Defender occupation of a remaining required cell kills that line obligation.',
    'The probe preserves residual attachment identity across exact CPC/RBA cofactors.'
  ],
  boundary:[
    'Consumed-training local diagnostic only.',
    'This probe tests lineage conservation; it does not prove that residual 51, 442, and 530 form one causal ladder.',
    'Any attachment-transport schema must be derived from the lineage-preserving result, not from fixed-ID disappearance.'
  ]
},null,2));