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
const P1=0,P2=1,P1_WIN=3;
const parentSequence='4444415666662322224233171633';
const ing=connect4RbaFromMoves(Array.from(parentSequence,c=>Number(c)-1),{geometry:g,canonical:false});
const parent={words:ing.words,basis:ing.basis,n:ing.basis.length,terminal:ing.words[g.metaOffset]&3};

function step(q,column){
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,column,words,0,basis,0,seen,sizes,0);
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
function shapeRecord(q,id){
  const n=g.shapeSize[id],base=id*4,cells=[];
  let aligned=true;
  for(let i=0;i<n;i++){
    const cell=g.shapeCells[base+i],owner=connect4CpcTargetOwner32(g,q.words,0,cell),
      distance=connect4CpcTargetSupportDistance32(g,q.words,0,cell);
    if(owner!==P1)aligned=false;
    cells.push({
      cell,
      column:g.cellColumn[cell]+1,
      row:g.cellRow[cell]+1,
      projectedOwner:owner+1,
      supportDistance:distance,
    });
  }
  return {diagnosticId:id,size:n,cells,fullyP1Aligned:aligned};
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
    precursorCount:s.precursorCount[0],
    projectedCount:[s.projectedCount[0],s.projectedCount[1]],
    projectedForks:[s.projectedForks[0],s.projectedForks[1]],
  };
}
function stateRecord(q){
  const p1=minimalIds(q,P1).map(id=>shapeRecord(q,id));
  const p2=minimalIds(q,P2).map(id=>{
    const rec=shapeRecord(q,id);
    rec.fullyP1Aligned=undefined;
    rec.fullyP2Aligned=rec.cells.every(x=>x.projectedOwner===2);
    return rec;
  });
  return {
    rank:q.words[g.metaOffset]>>>2,
    mover:((q.words[g.metaOffset]>>>2)&1)+1,
    support:support(q),
    cpc:{baseline:cpc(q,false),frontier:cpc(q,true)},
    p1Minimal:p1,
    p1FullyAligned:p1.filter(x=>x.fullyP1Aligned),
    p2Minimal:p2,
    p2FullyAligned:p2.filter(x=>x.fullyP2Aligned),
  };
}

assert.equal(parent.words[g.metaOffset]>>>2,28);
assert.equal((parent.words[g.metaOffset]>>>2)&1,P1);
assert.deepEqual(support(parent),[3,6,5,6,1,6,1]);

function immediateWinningColumns(q,playerTerminal){
  const out=[];
  for(let c=0;c<7;c++){
    if(q.words[c]>=6)continue;
    const child=step(q,c);
    if(child.terminal===playerTerminal)out.push(c+1);
  }
  return out;
}

// First zig: P1:c1 creates the c1r5 singleton.
const p1c1=step(parent,0);
assert.equal(p1c1.terminal,0);
const afterP1Cpc={baseline:cpc(p1c1,false),frontier:cpc(p1c1,true)};
const p2Rows=[];
let p2AvoidMask=0;
for(let d=0;d<7;d++){
  if(p1c1.words[d]>=6)continue;
  const reply=step(p1c1,d);
  let p1Immediate=[];
  if(!reply.terminal)p1Immediate=immediateWinningColumns(reply,3);
  const avoids=reply.terminal===1||reply.terminal===2||p1Immediate.length===0;
  if(avoids)p2AvoidMask|=1<<d;
  p2Rows.push({column:d+1,terminal:reply.terminal,p1ImmediateWinningColumns:p1Immediate,avoidsImmediateP1Win:avoids});
}
const p2OnlyC1=p2AvoidMask===1;
const p2c1=step(p1c1,0);
assert.equal(p2c1.terminal,0);

// Zag: inspect whether P2:c1 creates a reciprocal forced c1 block for P1.
const afterP2State=stateRecord(p2c1);
const afterP2Cpc=afterP2State.cpc;
const p1Rows=[];
let p1AvoidMask=0;
for(let a=0;a<7;a++){
  if(p2c1.words[a]>=6)continue;
  const response=step(p2c1,a);
  let p2Immediate=[];
  if(!response.terminal)p2Immediate=immediateWinningColumns(response,1);
  const avoids=response.terminal===3||response.terminal===2||p2Immediate.length===0;
  if(avoids)p1AvoidMask|=1<<a;
  p1Rows.push({column:a+1,terminal:response.terminal,p2ImmediateWinningColumns:p2Immediate,avoidsImmediateP2Win:avoids});
}

const reciprocalForcedColumn=afterP2Cpc.baseline.forcedColumn;
const reciprocalAgrees=
  reciprocalForcedColumn!==null&&
  afterP2Cpc.frontier.forcedColumn===reciprocalForcedColumn&&
  afterP2Cpc.baseline.preemptionCount===1&&afterP2Cpc.frontier.preemptionCount===1;
let reciprocalChild=null;
if(reciprocalForcedColumn!==null&&p2c1.words[reciprocalForcedColumn-1]<6){
  reciprocalChild=step(p2c1,reciprocalForcedColumn-1);
}

console.log(JSON.stringify({
  schema:'connect4.cpc_rank28_c1_zigzag_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  start:{sequence:parentSequence,...stateRecord(parent)},
  first:{
    p1Column:1,
    support:support(p1c1),
    cpc:afterP1Cpc,
    literal:{rows:p2Rows,avoidingMask:p2AvoidMask>>>0,avoidingColumns:p2Rows.filter(x=>x.avoidsImmediateP1Win).map(x=>x.column),onlyC1:p2OnlyC1},
    forcedP2Column:1,
    forcedP2Support:support(p2c1)
  },
  reciprocal:{
    state:afterP2State,
    cpc:afterP2Cpc,
    literal:{rows:p1Rows,avoidingMask:p1AvoidMask>>>0,avoidingColumns:p1Rows.filter(x=>x.avoidsImmediateP2Win).map(x=>x.column)},
    reciprocalForcedColumn,
    reciprocalAgrees,
    child:reciprocalChild?{terminal:reciprocalChild.terminal,support:support(reciprocalChild),state:reciprocalChild.terminal?null:stateRecord(reciprocalChild)}:null
  },
  conclusion:[
    'Discovery probe only. It tests whether the rank-28 c1 move enters an exact same-column alternating CPC restriction chain.',
    'Every native CPC restriction is compared with literal first-win cofactors on all legal responses.',
    'No value is assigned beyond exact terminal/restriction facts.'
  ],
  boundary:[
    'No oracle, Pons, solved W/D/L, minimax, best-move table, physical-position identity, or sealed holdout is used.',
    'Production CPC and JSMinSys are read-only and unchanged.'
  ]
},null,2));
