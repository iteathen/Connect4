#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-post-support-lift-top-profile.mjs <JSMinSys checkout>');
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactorKnownHeight}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const KIND=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);

const roots=[
  {id:'r4_B_guard_after_A4A5',sequence:'4444415666141211',guardColumn:2},
  {id:'r5_B_guard_after_A4A5',sequence:'4444415666151211',guardColumn:2},
  {id:'r6_B_guard_after_A4A5',sequence:'4444415666161211',guardColumn:2},
];

const moves=s=>Array.from(s,c=>Number(c)-1);
function ingress(sequence){
  const q=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  return {words:q.words,basis:q.basis};
}
const rank=q=>q.words[g.metaOffset]>>>2;
const terminal=q=>q.words[g.metaOffset]&3;
const mover=q=>rank(q)&1;
function legal(q){const out=[];for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);return out;}
function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function shapeCells(id){const out=[],n=g.shapeSize[id],base=id*4;for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);return out;}
function activeMinimal(q,player){
  const base=player?g.p1Offset:g.p0Offset,ids=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,base,i))ids.push(q.basis[i]);
  return ids.filter(id=>!ids.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function cell(cell){return {cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1};}
function earliest(q,id,player){
  const r=rank(q),first=player===mover(q)?1:2,remaining=g.cellCount-r;
  const needs=shapeCells(id).map(x=>g.cellRow[x]-q.words[g.cellColumn[x]]+1).sort((a,b)=>a-b);
  if(needs.some(x=>x<=0))return null;
  let slot=first;
  for(const need of needs){while(slot<need)slot+=2;if(slot>remaining)return null;slot+=2;}
  return slot-2;
}
function orientation(id){
  const cs=shapeCells(id);
  if(cs.length<2)return 'SINGLE';
  const a=cs[0],b=cs[1],dc=g.cellColumn[b]-g.cellColumn[a],dr=g.cellRow[b]-g.cellRow[a];
  if(dr===0)return 'H';
  if(dc===0)return 'V';
  return 'D';
}
function cpc(q){
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  return {
    kind:KIND.get(kind),interval:[scratch.interval[0]-2,scratch.interval[1]-2],
    forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
    preemptionCount:scratch.preemptionCount[0],
    preemptionMask32:scratch.preemptionMask32[0]>>>0,
    precursorCount:scratch.precursorCount[0],
  };
}
let cofactorCount=0;
function cofactor(q,c){
  const words=new Uint32Array(g.keyWords),basisBuf=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(
    g,profile,q.words,0,q.basis,0,q.basis.length,c,q.words[c],
    words,0,basisBuf,0,seen,sizes,0
  );
  cofactorCount++;
  return {term,q:{words,basis:basisBuf.slice(0,sizes[0])}};
}
function summary(q,attacker){
  const ids=activeMinimal(q,attacker);
  return {
    rank:rank(q),support:Array.from(q.words.slice(0,7)),cpc:cpc(q),
    residuals:ids.map(id=>{
      const cs=shapeCells(id);
      return {
        id,size:cs.length,orientation:orientation(id),earliest:earliest(q,id,attacker),
        cells:cs.map(cell),
        frontierCells:cs.filter(x=>q.words[g.cellColumn[x]]===g.cellRow[x]).map(cell),
        depthWord:cs.map(x=>g.cellRow[x]-q.words[g.cellColumn[x]]).sort((a,b)=>a-b)
      };
    })
  };
}
function termPol(code,attacker){
  if(code===0)return 'NONTERMINAL';
  if(code===2)return 'DRAW';
  return code===(attacker===0?3:1)?'ATTACKER':'DEFENDER';
}

const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q);
  assert.equal(rank(q),16);
  assert.equal(terminal(q),0);
  assert.equal(q.words[0],5,'A must be height5 before top trigger');
  assert.equal(q.words[root.guardColumn-1],1,'guard column must remain height1');
  const before=summary(q,attacker);
  const first=cofactor(q,0),p1=termPol(first.term,attacker);
  assert.equal(p1,'NONTERMINAL');
  assert.equal(first.q.words[0],6);
  const afterTop=summary(first.q,attacker);
  const replies=[];
  for(const d of legal(first.q)){
    const second=cofactor(first.q,d),p2=termPol(second.term,attacker);
    replies.push({
      responseColumn:d+1,terminal:p2,
      child:p2==='NONTERMINAL'?summary(second.q,attacker):null
    });
  }
  rows.push({
    ...root,attacker:attacker+1,
    before,topTrigger:{column:1,row:6},
    afterTop,replies
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_post_support_lift_top_profile.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  rows,
  work:{cofactorCount},
  boundary:[
    'Consumed-training structural diagnostic only.',
    'All legal defender replies are enumerated only to expose the local response/resource topology at the first post-support-lift top defect.',
    'No reply is promoted merely because its child looks structurally favorable.',
    'Any theorem must be derived from current support/residual attachment and freshly qualified.'
  ]
},null,2));