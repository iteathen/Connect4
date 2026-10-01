#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {CPC_EXACT,CPC_RESTRICT,prepareConnect4CpcScratch,evaluateConnect4Cpc32}=await load('cpc-connect4');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});

const moves=s=>Array.from(s,c=>Number(c)-1);
function qOf(s){return connect4RbaFromMoves(moves(s),{geometry:g,canonical:false});}
function legal(q){const out=[];for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);return out;}
function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function cells(id){const out=[],n=g.shapeSize[id],base=id*4;for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);return out;}
function minimal(q,player){
  const base=player?g.p1Offset:g.p0Offset,active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,base,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)));
}
function earliest(q,id,player){
  const rank=q.words[g.metaOffset]>>>2,mover=rank&1,first=player===mover?1:2,remaining=g.cellCount-rank;
  const needs=cells(id).map(cell=>g.cellRow[cell]-q.words[g.cellColumn[cell]]+1).sort((a,b)=>a-b);
  if(needs.some(n=>n<=0))return null;
  let slot=first;
  for(const need of needs){while(slot<need)slot+=2;if(slot>remaining)return null;slot+=2;}
  return slot-2;
}
function describe(q,id,player){
  return {
    shape:id,size:g.shapeSize[id],deadline:earliest(q,id,player),
    cells:cells(id).map(cell=>({column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1,
      supportDistance:g.cellRow[cell]-q.words[g.cellColumn[cell]]+1}))
  };
}
function evalCpc(sequence){
  const q=qOf(sequence),scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  return {q,kind,scratch,terminal:q.words[g.metaOffset]&3,interval:[scratch.interval[0]-2,scratch.interval[1]-2]};
}
function admissible(post,attacker){
  if(post.terminal!==0)return [];
  const attackerValue=attacker===0?1:-1;
  if(post.kind===CPC_EXACT&&post.interval[0]===attackerValue&&post.interval[1]===attackerValue)return [];
  if(post.kind===CPC_RESTRICT&&post.scratch.preemptionCount[0]===1&&post.scratch.forcedColumn[0]>=0)return [post.scratch.forcedColumn[0]];
  return legal(post.q);
}
function intersect(arrays){
  if(!arrays.length)return [];
  let s=new Set(arrays[0]);
  for(const a of arrays.slice(1)){const t=new Set(a);s=new Set([...s].filter(x=>t.has(x)));}
  return [...s].sort((a,b)=>a-b);
}

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'}
];
const rows=[];
for(const root of roots){
  const base=qOf(root.sequence),attacker=(base.words[g.metaOffset]>>>2)&1,setups=[];
  for(const a of legal(base)){
    const post=evalCpc(root.sequence+String(a+1));
    const replies=admissible(post,attacker);
    const childRows=[];
    for(const r of replies){
      const sequence=root.sequence+String(a+1)+String(r+1);
      const q=qOf(sequence);
      const mins=minimal(q,attacker);
      childRows.push({replyColumn:r+1,sequence,q,mins});
    }
    const common=intersect(childRows.map(x=>x.mins));
    const commonBySize={};
    for(const id of common)(commonBySize[g.shapeSize[id]]??=[]).push(id);
    const witnessState=childRows[0]?.q??post.q;
    setups.push({
      setupColumn:a+1,
      admissibleReplyColumns:replies.map(c=>c+1),
      commonMinimalResidualCount:common.length,
      commonBySize:Object.fromEntries(Object.entries(commonBySize).map(([size,ids])=>[
        size,ids.map(id=>describe(witnessState,id,attacker))
      ])),
      perReply:childRows.map(x=>({
        replyColumn:x.replyColumn,
        minimalCount:x.mins.length,
        pairCount:x.mins.filter(id=>g.shapeSize[id]===2).length,
        tripleCount:x.mins.filter(id=>g.shapeSize[id]===3).length
      }))
    });
  }
  rows.push({...root,attacker:attacker+1,setups});
}

console.log(JSON.stringify({
  schema:'connect4.cpc_marked_common_residual_core.v1',
  createdAt:new Date().toISOString(),
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  proofAuthority:false,
  rows,
  boundary:[
    'Intersection is over exact minimal attacker residual shape IDs after every CPC-admissible defender reply to one attacker setup.',
    'A common residual is only a branch-invariant structural fact. It is not a forcing certificate until a separate CPC support/release theorem proves causal attainability.',
    'This diagnostic is for anti-unification of a current-state CPC rule, not runtime branch enumeration.'
  ]
},null,2));