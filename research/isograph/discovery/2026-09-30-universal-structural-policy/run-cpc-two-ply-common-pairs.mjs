#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];assert(library);
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');
const load=n=>import(pathToFileURL(resolve(library,'addons',n+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {CPC_EXACT,CPC_RESTRICT,prepareConnect4CpcScratch,evaluateConnect4Cpc32}=await load('cpc-connect4');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});

const qstate=s=>connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
const legal=q=>Array.from({length:g.columns},(_,c)=>c).filter(c=>q.words[c]<g.rows);
const coordHas=(w,b,i)=>(w[b+(i>>>5)]&(1<<(i&31)))!==0;
function minimal(q,p){
 const base=p?g.p1Offset:g.p0Offset,a=[];
 for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,base,i))a.push(q.basis[i]);
 return a.filter(id=>!a.some(o=>o!==id&&g.shapeSize[o]<g.shapeSize[id]&&connect4RbaShapeSubset(g,o,id)));
}
function pairIds(q,p){return minimal(q,p).filter(id=>g.shapeSize[id]===2);}
function cells(id){const b=id*4;return [g.shapeCells[b],g.shapeCells[b+1]];}
function cpc(sequence){
 const q=qstate(sequence),scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
 const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
 return {q,kind,interval:[scratch.interval[0]-2,scratch.interval[1]-2],forced:scratch.forcedColumn[0]};
}
function replies(post,attacker){
 const attackerValue=attacker===0?1:-1;
 if((post.q.words[g.metaOffset]&3)!==0)return [];
 if(post.kind===CPC_EXACT&&post.interval[0]===attackerValue&&post.interval[1]===attackerValue)return [];
 if(post.kind===CPC_RESTRICT&&post.forced>=0)return [post.forced];
 return legal(post.q);
}
function describePair(id,children){
 const cs=cells(id);
 return {
  shape:id,
  cells:cs.map(cell=>({column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1})),
  childSupport:children.map(ch=>({
    replyColumn:ch.reply+1,
    depths:cs.map(cell=>g.cellRow[cell]-ch.q.words[g.cellColumn[cell]]),
    playable:cs.map(cell=>g.cellRow[cell]===ch.q.words[g.cellColumn[cell]])
  }))
 };
}
const roots=[
 {id:'candidate2',sequence:'4444415662'},
 {id:'candidate3',sequence:'4444415663'},
 {id:'candidate6',sequence:'4444415666'}
];
const rows=[];
for(const root of roots){
 const base=qstate(root.sequence),attacker=(base.words[g.metaOffset]>>>2)&1,setups=[];
 for(const a of legal(base)){
  const post=cpc(root.sequence+String(a+1)),rs=replies(post,attacker),children=[];
  for(const r of rs){
   const q=qstate(post.q?root.sequence+String(a+1)+String(r+1):'');
   children.push({reply:r,q,pairs:pairIds(q,attacker)});
  }
  let common=[];
  if(children.length){
   common=[...children[0].pairs].filter(id=>children.every(ch=>ch.pairs.includes(id)));
  }
  setups.push({
   setupColumn:a+1,
   replyColumns:rs.map(r=>r+1),
   childPairCounts:children.map(ch=>({replyColumn:ch.reply+1,count:ch.pairs.length})),
   commonPairCount:common.length,
   commonPairs:common.map(id=>describePair(id,children))
  });
 }
 rows.push({...root,attacker:attacker+1,setups});
}
console.log(JSON.stringify({
 schema:'connect4.cpc_two_ply_common_pair_residuals.v1',
 jsMinSysSha:EXPECTED,oracleUsed:false,solvedInputsUsed:false,proofAuthority:false,
 rows,
 boundary:[
  'The intersection is over exact minimal attacker pair residual identities after every CPC-admissible defender response to one attacker setup.',
  'A common pair is a current-state branch-invariant residual consequence for that marked setup, but no forced completion follows without a separate support/deadline theorem.',
  'Pair counts or non-common unions are diagnostic only.'
 ]
},null,2));
