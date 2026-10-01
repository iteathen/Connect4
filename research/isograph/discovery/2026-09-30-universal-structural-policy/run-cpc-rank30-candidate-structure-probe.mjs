#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32,
  connect4CpcTargetOwner32,connect4CpcTargetSupportDistance32,
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3,P2_WIN=1;
const sequence='444441566666232222423317163311';
const ing=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
const root={words:ing.words,basis:ing.basis,n:ing.basis.length,terminal:ing.words[g.metaOffset]&3};
assert.equal(root.terminal,0);
assert.equal(root.words[g.metaOffset]>>>2,30);
assert.equal((root.words[g.metaOffset]>>>2)&1,P1);
assert.deepEqual(Array.from(root.words.slice(0,7)),[5,6,5,6,1,6,1]);

function step(q,column){
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  return {words,basis,n:sizes[0],terminal};
}
function support(q){return Array.from(q.words.slice(0,7));}
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,player){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);
  return out;
}
function minimalIds(q,player){
  const active=activeIds(q,player);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function residual(q,id,player){
  const size=g.shapeSize[id],base=id*4,cells=[];
  let aligned=true;
  for(let i=0;i<size;i++){
    const cell=g.shapeCells[base+i],owner=connect4CpcTargetOwner32(g,q.words,0,cell);
    if(owner!==player)aligned=false;
    cells.push({
      cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1,
      projectedOwner:owner+1,
      supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell),
      playable:q.words[g.cellColumn[cell]]===g.cellRow[cell],
    });
  }
  return {diagnosticId:id,size,cells,fullyAligned:aligned};
}
function kindName(k){
  if(k===CPC_NONE)return 'CPC_NONE';
  if(k===CPC_EXACT)return 'CPC_EXACT';
  if(k===CPC_BOUND)return 'CPC_BOUND';
  if(k===CPC_RESTRICT)return 'CPC_RESTRICT';
  return 'UNKNOWN';
}
function cpc(q,frontierResponse){
  const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
  const k=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
  return {
    kind:kindName(k),
    interval:[s.interval[0]-2,s.interval[1]-2],
    forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
    preemptionCount:s.preemptionCount[0],
    preemptionMask32:s.preemptionMask32[0]>>>0,
    precursorCount:s.precursorCount[0],
    projectedCount:Array.from(s.projectedCount),
    projectedForks:Array.from(s.projectedForks),
  };
}
function state(q){
  const rank=q.words[g.metaOffset]>>>2,mover=rank&1;
  const p1=minimalIds(q,P1).map(id=>residual(q,id,P1));
  const p2=minimalIds(q,P2).map(id=>residual(q,id,P2));
  return {
    rank,mover:mover+1,terminal:q.terminal,support:support(q),
    cpc:{baseline:cpc(q,false),frontier:cpc(q,true)},
    p1Aligned:p1.filter(x=>x.fullyAligned),
    p2Aligned:p2.filter(x=>x.fullyAligned),
    p1Singletons:p1.filter(x=>x.size===1),
    p2Singletons:p2.filter(x=>x.size===1),
  };
}
function immediateWins(q,player){
  const target=player===P1?P1_WIN:P2_WIN,out=[];
  for(let c=0;c<7;c++){
    if(q.words[c]>=6)continue;
    if(step(q,c).terminal===target)out.push(c+1);
  }
  return out;
}

const rows=[];
for(const move of [0,2,6]){
  assert(root.words[move]<6);
  const afterP1=step(root,move);
  const row={
    p1Column:move+1,
    terminal:afterP1.terminal,
    support:support(afterP1),
    state:afterP1.terminal?null:state(afterP1),
    immediateP2WinningColumns:afterP1.terminal?[]:immediateWins(afterP1,P2),
    replies:[],
  };
  if(!afterP1.terminal){
    for(let d=0;d<7;d++){
      if(afterP1.words[d]>=6)continue;
      const afterP2=step(afterP1,d);
      const rr={
        p2Column:d+1,
        terminal:afterP2.terminal,
        support:support(afterP2),
        immediateP1WinningColumns:[],
        state:null,
      };
      if(!afterP2.terminal){
        rr.immediateP1WinningColumns=immediateWins(afterP2,P1);
        rr.state=state(afterP2);
      }
      row.replies.push(rr);
    }
  }
  rows.push(row);
}

console.log(JSON.stringify({
  schema:'connect4.cpc_rank30_candidate_structure_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  start:{sequence,...state(root)},
  candidates:rows,
  conclusion:[
    'Discovery probe only for the three rank-30 moves that survive the exact immediate-danger filter after the c1/c1 handoff.',
    'It records native CPC restrictions, exact immediate terminals, and mover-relative residual attachment after every legal reply.',
    'No unresolved candidate is assigned W/D/L.'
  ],
  boundary:[
    'No oracle, Pons, solved W/D/L, minimax, best-move table, physical-position identity, or sealed holdout is used.',
    'Production CPC and JSMinSys are read-only and unchanged.',
    'Residual ids are diagnostic only; exact cell attachment is recorded.'
  ]
},null,2));
