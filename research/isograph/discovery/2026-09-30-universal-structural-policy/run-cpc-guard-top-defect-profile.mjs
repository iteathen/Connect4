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
assert.equal(git('status','--porcelain'),'');
const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactorKnownHeight}=await load('rba-connect4-coordinate');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const moves=s=>Array.from(s,c=>Number(c)-1);
function ingress(s){const q=connect4RbaFromMoves(moves(s),{geometry:g,canonical:false});return {words:q.words,basis:q.basis};}
const rank=q=>q.words[g.metaOffset]>>>2, mover=q=>rank(q)&1, terminal=q=>q.words[g.metaOffset]&3;
function legal(q){const out=[];for(let c=0;c<7;c++)if(q.words[c]<6)out.push(c);return out;}
function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function activeMinimal(q,p){
  const base=p===0?g.p0Offset:g.p1Offset,ids=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,base,i))ids.push(q.basis[i]);
  return ids.filter(id=>!ids.some(o=>o!==id&&g.shapeSize[o]<g.shapeSize[id]&&connect4RbaShapeSubset(g,o,id)));
}
function shapeCells(id){const out=[];for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[id*4+i]);return out;}
function cellName(cell){return {cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1};}
let cfCount=0;
function cofactor(q,c){
  const words=new Uint32Array(g.keyWords),basisBuf=new Uint32Array(g.maxBasis),seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(g,profile,q.words,0,q.basis,0,q.basis.length,c,q.words[c],words,0,basisBuf,0,seen,sizes,0);
  cfCount++;return {term,q:{words,basis:basisBuf.slice(0,sizes[0])}};
}
function polarity(code,attacker){
  if(code===0)return 'NONTERMINAL';if(code===2)return 'DRAW';return code===(attacker===0?3:1)?'ATTACKER':'DEFENDER';
}
function noImmediateAttackerWin(q,attacker){
  if(terminal(q)!==0||mover(q)!==attacker)return null;
  const winning=[];
  for(const c of legal(q))if(polarity(cofactor(q,c).term,attacker)==='ATTACKER')winning.push(c+1);
  return {safe:winning.length===0,winningColumns:winning};
}
function phase(q){return Array.from({length:7},(_,c)=>q.words[c]&1);}
function derivative(p){return p.slice(0,-1).map((x,i)=>x^p[i+1]);}
const roots=[
  {id:'r4_B',sequence:'4444415666141211',guardCol:1},
  {id:'r4_C',sequence:'4444415666141311',guardCol:2},
  {id:'r5_B',sequence:'4444415666151211',guardCol:1},
  {id:'r5_C',sequence:'4444415666151311',guardCol:2},
  {id:'r6_B',sequence:'4444415666161211',guardCol:1},
  {id:'r6_C',sequence:'4444415666161311',guardCol:2},
];
const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q);
  assert.equal(rank(q),16);assert.equal(q.words[0],5);assert.equal(q.words[root.guardCol],1);
  const first=cofactor(q,0),p1=polarity(first.term,attacker);
  const triggerCell=5*7;
  const postResiduals=first.term===0?activeMinimal(first.q,attacker):[];
  const responses=[];
  if(first.term===0)for(const d of legal(first.q)){
    const responseCell=first.q.words[d]*7+d;
    const attached=postResiduals.filter(id=>shapeCells(id).includes(responseCell));
    const second=cofactor(first.q,d),p2=polarity(second.term,attacker);
    const immediate=p2==='NONTERMINAL'?noImmediateAttackerWin(second.q,attacker):null;
    const ph=p2==='NONTERMINAL'?phase(second.q):null;
    responses.push({
      responseColumn:d+1,responseCell:cellName(responseCell),
      guardPreserved:d!==root.guardCol,
      attachedResidualIds:attached,
      attachedResiduals:attached.map(id=>({id,cells:shapeCells(id).map(cellName)})),
      terminal:p2,
      support:p2==='NONTERMINAL'?Array.from(second.q.words.slice(0,7)):null,
      phase:ph,derivative:ph?derivative(ph):null,
      immediateAttackerSafety:immediate
    });
  }
  rows.push({
    ...root,attacker:attacker+1,
    supportBefore:Array.from(q.words.slice(0,7)),
    guardColumn:root.guardCol+1,
    phaseBefore:phase(q),derivativeBefore:derivative(phase(q)),
    triggerColumn:1,triggerCell:cellName(triggerCell),triggerTerminal:p1,
    postTriggerSupport:first.term===0?Array.from(first.q.words.slice(0,7)):null,
    postTriggerActiveMinimal:postResiduals.map(id=>({id,cells:shapeCells(id).map(cellName)})),
    responses
  });
}
console.log(JSON.stringify({
  schema:'connect4.cpc_guard_top_defect_profile.v1',
  jsMinSysSha:EXPECTED,oracleUsed:false,solvedInputsUsed:false,
  rows,work:{cofactorCount:cfCount},
  interpretation:[
    'Each root is the best guard-established family after the exact A4->A5 support-lift blocker macro.',
    'The profiled trigger is A6, which exhausts column A and creates the one-slot top phase-debt seam.',
    'attachedResidualIds identify defender frontier moves that block at least one live attacker residual in the exact post-trigger state.',
    'immediateAttackerSafety is a diagnostic only; it is not by itself a response theorem.'
  ],
  boundary:[
    'Consumed-training theorem-discovery evidence only.',
    'No response is promoted merely because it is legal or survives one ply.',
    'A phase-debt repair theorem must state a structural resource predicate and preserve the guard plus all downstream proof obligations.'
  ]
},null,2));