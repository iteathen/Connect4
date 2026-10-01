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
const P1=0,P2=1,P1_WIN=3,DRAW=2,P2_WIN=1;
const sequence='444441566666232222423317755557';

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function rankOf(q){return q.words[g.metaOffset]>>>2;}
function moverOf(q){return rankOf(q)&1;}
function support(q){return Array.from(q.words.slice(0,7));}
function key(q){
  let s='';
  for(let i=0;i<g.keyWords;i++)s+=q.words[i].toString(36)+'.';
  return s;
}
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
    const c=g.cellColumn[cell],r=g.cellRow[cell];
    cells.push({
      cell,column:c+1,row:r+1,
      projectedOwner:owner+1,
      supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell),
      playable:q.words[c]===r,
    });
  }
  return {diagnosticId:id,size,cells,fullyAligned:aligned};
}
function singletonProfile(q,player){
  return activeIds(q,player).filter(id=>g.shapeSize[id]===1).map(id=>residual(q,id,player));
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
    kind:kindName(k),interval:[s.interval[0]-2,s.interval[1]-2],
    forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
    preemptionCount:s.preemptionCount[0],
    preemptionMask32:s.preemptionMask32[0]>>>0,
    precursorCount:s.precursorCount[0],
    projectedCount:Array.from(s.projectedCount),
    projectedForks:Array.from(s.projectedForks),
  };
}
function immediateWins(q,player){
  const target=player===P1?P1_WIN:P2_WIN,out=[];
  for(let c=0;c<7;c++)if(q.words[c]<6&&step(q,c).terminal===target)out.push(c+1);
  return out;
}

const root=fromSequence(sequence);
assert.equal(root.terminal,0);
assert.equal(rankOf(root),30);
assert.equal(moverOf(root),P1);
assert.deepEqual(support(root),[2,6,3,6,5,5,3]);

const memo=new Map();
let nodes=0,hits=0;
function solve(q){
  nodes++;
  const term=q.words[g.metaOffset]&3;
  if(term)return term;
  const k=key(q),cached=memo.get(k);
  if(cached!==undefined){hits++;return cached;}
  const mover=moverOf(q);
  let best=mover===P1?0:4;
  for(let c=0;c<7;c++){
    if(q.words[c]>=6)continue;
    const v=solve(step(q,c));
    if(mover===P1){
      if(v>best)best=v;
      if(best===P1_WIN)break;
    }else{
      if(v<best)best=v;
      if(best===P2_WIN)break;
    }
  }
  if(best===0||best===4)best=DRAW;
  memo.set(k,best);
  return best;
}
function structuralProfile(q){
  return {
    terminal:q.terminal,
    rank:rankOf(q),
    mover:moverOf(q)+1,
    support:support(q),
    cpcForP2:q.terminal===0?{baseline:cpc(q,false),frontier:cpc(q,true)}:null,
    immediateP2WinningColumns:q.terminal===0?immediateWins(q,P2):[],
    p1Minimal:q.terminal===0?minimalIds(q,P1).map(id=>residual(q,id,P1)):[],
    p2Minimal:q.terminal===0?minimalIds(q,P2).map(id=>residual(q,id,P2)):[],
    p1Aligned:q.terminal===0?minimalIds(q,P1).map(id=>residual(q,id,P1)).filter(x=>x.fullyAligned):[],
    p2Aligned:q.terminal===0?minimalIds(q,P2).map(id=>residual(q,id,P2)).filter(x=>x.fullyAligned):[],
    p1Singletons:q.terminal===0?singletonProfile(q,P1):[],
    p2Singletons:q.terminal===0?singletonProfile(q,P2):[],
  };
}

const started=process.hrtime.bigint();
const rootValue=solve(root);
const moves=[];
const childByColumn=new Map();
for(let c=0;c<7;c++){
  if(root.words[c]>=6)continue;
  const q=step(root,c);
  const value=solve(q);
  moves.push({column:c+1,value});
  childByColumn.set(c+1,q);
}
const bestMoves=moves.filter(x=>x.value===rootValue).map(x=>x.column);

const bestMoveBranches=[];
for(const column of bestMoves){
  const child=childByColumn.get(column);
  assert(child&&child.terminal===0);
  assert.equal(rankOf(child),31);
  assert.equal(moverOf(child),P2);
  const defenderMoves=[];
  for(let d=0;d<7;d++){
    if(child.words[d]>=6)continue;
    defenderMoves.push({column:d+1,value:solve(step(child,d))});
  }
  const branchValue=Math.min(...defenderMoves.map(x=>x.value));
  assert.equal(branchValue,rootValue);
  const bestDefenderMoves=defenderMoves.filter(x=>x.value===branchValue).map(x=>x.column);
  bestMoveBranches.push({
    p1Column:column,
    value:branchValue,
    rank:rankOf(child),
    mover:moverOf(child)+1,
    support:support(child),
    defenderMoves,
    bestDefenderMoves,
    structuralProfile:structuralProfile(child),
  });
}
const ended=process.hrtime.bigint();

console.log(JSON.stringify({
  schema:'connect4.rba_rank30_reply7_c5_forced_local_value_discovery.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:true,
  proofPremiseAllowed:false,
  design:'CPC_RANK30_REPLY7_C5_FORCED_LOCAL_VALUE_DISCOVERY_DESIGN_0_1.md',
  state:{
    sequence,rank:30,mover:1,support:support(root),
    cpc:{baseline:cpc(root,false),frontier:cpc(root,true)},
    p1Minimal:minimalIds(root,P1).map(id=>residual(root,id,P1)),
    p2Minimal:minimalIds(root,P2).map(id=>residual(root,id,P2)),
  },
  discovery:{
    value:rootValue,bestMoves,moves,
    nodes,memoSize:memo.size,memoHits:hits,
    elapsedNs:String(ended-started),
  },
  bestMoveBranches,
  valueEncoding:{1:'P2_WIN',2:'DRAW',3:'P1_WIN'},
  conclusion:[
    'Exact local RBA recursion is used only to localize the next Player-1 continuation inside the structurally forced rank-30 c5/c7 child.',
    'All diagnostically best Player-1 children are profiled with current-state CPC/RBA facts and complete legal defender value rows.',
    'The recursive values are not admitted as a structural theorem premise or runtime policy premise.'
  ],
  boundary:[
    'The W/D/L recursion is discovery/falsification evidence only and is forbidden as a structural theorem premise.',
    'No Pons, external oracle, solved database, opening book, best-move table, BSFP solved frontier, physical-position identity, or sealed holdout is used.',
    'Production CPC and JSMinSys are read-only and unchanged; BSFP is unchanged.',
    'Any subsequent theorem must re-prove its selected continuation from current-state RLC facts without consuming these diagnostic values.'
  ]
},null,2));
