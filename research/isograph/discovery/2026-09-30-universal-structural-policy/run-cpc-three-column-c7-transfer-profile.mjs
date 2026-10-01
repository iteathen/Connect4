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

const load=n=>import(pathToFileURL(resolve(library,'addons',n+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32,
  connect4CpcTargetOwner32,connect4CpcTargetSupportDistance32
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3,P2_WIN=1;
const parentSequence='4444415666662322224233177716111';
const ing=connect4RbaFromMoves(Array.from(parentSequence,c=>Number(c)-1),{geometry:g,canonical:false});
const parent={words:ing.words,basis:ing.basis,n:ing.basis.length,terminal:ing.words[g.metaOffset]&3};
assert.equal(parent.terminal,0);
assert.equal(parent.words[g.metaOffset]>>>2,31);
assert.equal((parent.words[g.metaOffset]>>>2)&1,P2);
assert.deepEqual(Array.from(parent.words.slice(0,7)),[6,6,3,6,1,6,3]);

function step(q,c){
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,c,
    words,0,basis,0,seen,sizes,0
  );
  return {words,basis,n:sizes[0],terminal};
}
function support(q){return Array.from(q.words.slice(0,7));}
function coordHas(q,p,i){const b=p?g.p1Offset:g.p0Offset;return !!(q.words[b+(i>>>5)]&(1<<(i&31)));}
function active(q,p){const out=[];for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);return out;}
function minimal(q,p){
  const a=active(q,p);
  return a.filter(id=>!a.some(o=>o!==id&&g.shapeSize[o]<g.shapeSize[id]&&connect4RbaShapeSubset(g,o,id)));
}
function residual(q,id,p){
  const n=g.shapeSize[id],b=id*4,cells=[];let aligned=true;
  for(let i=0;i<n;i++){
    const cell=g.shapeCells[b+i],owner=connect4CpcTargetOwner32(g,q.words,0,cell);
    if(owner!==p)aligned=false;
    cells.push({
      column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1,
      projectedOwner:owner+1,
      supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell),
      playable:q.words[g.cellColumn[cell]]===g.cellRow[cell]
    });
  }
  return {diagnosticId:id,size:n,cells,fullyAligned:aligned};
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
    projectedForks:Array.from(s.projectedForks)
  };
}
function state(q){
  return {
    rank:q.words[g.metaOffset]>>>2,
    mover:((q.words[g.metaOffset]>>>2)&1)+1,
    terminal:q.terminal,
    support:support(q),
    cpc:{baseline:cpc(q,false),frontier:cpc(q,true)},
    p1Minimal:minimal(q,P1).map(id=>residual(q,id,P1)),
    p2Minimal:minimal(q,P2).map(id=>residual(q,id,P2))
  };
}
function immediateWins(q,p){
  const want=p===P1?P1_WIN:P2_WIN,out=[];
  for(let c=0;c<7;c++){
    if(q.words[c]>=6)continue;
    if(step(q,c).terminal===want)out.push(c+1);
  }
  return out;
}

const rows=[];
for(const p2col of [4,6]){ // c5, c7
  const afterP2=step(parent,p2col);
  assert.equal(afterP2.terminal,0);
  const afterP1=step(afterP2,6); // common P1:c7 transfer
  const row={
    p2Column:p2col+1,
    p2Support:support(afterP2),
    p1ResponseColumn:7,
    p1ResponseTerminal:afterP1.terminal,
    p1Support:support(afterP1),
    state:afterP1.terminal?null:state(afterP1),
    immediateP2WinningColumns:afterP1.terminal?[]:immediateWins(afterP1,P2),
    replies:[]
  };
  if(!afterP1.terminal){
    for(let d=0;d<7;d++){
      if(afterP1.words[d]>=6)continue;
      const child=step(afterP1,d);
      row.replies.push({
        p2Column:d+1,
        terminal:child.terminal,
        support:support(child),
        immediateP1WinningColumns:child.terminal?[]:immediateWins(child,P1),
        state:child.terminal?null:state(child)
      });
    }
  }
  rows.push(row);
}

console.log(JSON.stringify({
  schema:'connect4.cpc_three_column_c7_transfer_profile.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  parent:{sequence:parentSequence,rank:31,mover:2,support:support(parent)},
  directC3:{
    p2Column:3,
    childSupport:support(step(parent,2)),
    p1ImmediateWinColumn:3,
    childCpc:{
      baseline:cpc(step(parent,2),false),
      frontier:cpc(step(parent,2),true)
    }
  },
  transferRows:rows,
  conclusion:[
    'Current-state structural probe only.',
    'P2:c3 is recorded as the already-visible direct terminal branch.',
    'For P2:c5 and P2:c7 the common P1:c7 response is profiled for exact CPC restrictions, immediate terminals, and residual attachment.',
    'No unresolved branch is assigned W/D/L.'
  ],
  boundary:[
    'No oracle, Pons, solved W/D/L, minimax, best-move table, local diagnostic value, physical identity, or sealed holdout is used.',
    'Production CPC and JSMinSys are read-only and unchanged.',
    'Residual ids are diagnostic only; exact cell attachment is recorded.'
  ]
},null,2));
