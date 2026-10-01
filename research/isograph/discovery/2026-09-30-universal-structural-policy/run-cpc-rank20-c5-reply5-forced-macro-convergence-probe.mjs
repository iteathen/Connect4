#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const ROOT='44444156666623222242';
const DESIGN='CPC_RANK20_C5_REPLY5_FORCED_MACRO_CONVERGENCE_PROBE_DESIGN_0_1.md';

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

const KNOWN_SEQUENCES={
  RANK22_ROUTED:'4444415666662322224233',
  RANK24_ZUGZWANG:'444441566666232222423311',
  RANK24_SINGLETON:'444441566666232222423313',
  RANK24_ROUTED:'444441566666232222423317',
  RANK26_FORCED_CHAIN:'44444156666623222242331775',
};

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(column>=0&&column<g.columns&&q.words[column]<g.rows);
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
function support(q){return Array.from(q.words.slice(0,g.columns));}
function exactEqual(a,b){
  if(!a||!b||a.terminal!==b.terminal||a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
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
function shapeCells(id){
  const out=[],base=id*4;
  for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[base+i]);
  return out;
}
function shapeHasCell(id,cell){
  const base=id*4;
  for(let i=0;i<g.shapeSize[id];i++)if(g.shapeCells[base+i]===cell)return true;
  return false;
}
function cellDesc(cell,q){
  return {
    cell,
    column:g.cellColumn[cell]+1,
    row:g.cellRow[cell]+1,
    projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1,
    supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell),
  };
}
function residualDesc(q,id,player){
  const cells=shapeCells(id).map(cell=>cellDesc(cell,q));
  return {
    diagnosticId:id,
    size:g.shapeSize[id],
    cells,
    fullyAligned:cells.every(x=>x.projectedOwner===player+1)
  };
}
function alignedMinimalPairs(q){
  return minimalIds(q,P1)
    .filter(id=>g.shapeSize[id]===2)
    .map(id=>residualDesc(q,id,P1))
    .filter(x=>x.fullyAligned);
}
function pairKey(desc){
  return desc.cells
    .map(x=>[x.column,x.row])
    .sort((a,b)=>a[0]-b[0]||a[1]-b[1])
    .map(x=>x.join(','))
    .join('|');
}
function hasActiveSingleton(q,player,cell){
  return activeIds(q,player).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);
}
function activeMinimalSingletonCells(q,player){
  return minimalIds(q,player)
    .filter(id=>g.shapeSize[id]===1)
    .map(id=>g.shapeCells[id*4]);
}
function playableSingletons(q,player){
  const out=[];
  for(const id of activeIds(q,player)){
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(q.words[c]===r)out.push({diagnosticId:id,...cellDesc(cell,q)});
  }
  return out;
}
function cpc(q){
  const kinds=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);
  const out={};
  for(const [name,frontierResponse] of [['baseline',false],['frontier',true]]){
    const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
    out[name]={
      kind:kinds.get(kind),
      interval:[s.interval[0]-2,s.interval[1]-2],
      forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
      preemptionCount:s.preemptionCount[0],
      preemptionMask32:s.preemptionMask32[0]>>>0,
      precursorCount:s.precursorCount[0],
      projectedCount:Array.from(s.projectedCount),
      projectedForks:Array.from(s.projectedForks),
    };
  }
  return out;
}
function agreedRestriction(c){
  return (
    c.baseline.kind==='CPC_RESTRICT'&&c.frontier.kind==='CPC_RESTRICT'&&
    c.baseline.preemptionCount===1&&c.frontier.preemptionCount===1&&
    c.baseline.forcedColumn!==null&&
    c.baseline.forcedColumn===c.frontier.forcedColumn
  )?c.baseline.forcedColumn:null;
}

const knownStates=Object.fromEntries(Object.entries(KNOWN_SEQUENCES).map(([name,seq])=>[name,fromSequence(seq)]));
function knownRoot(q){
  if(!q||q.terminal)return null;
  for(const [name,state] of Object.entries(knownStates))if(exactEqual(q,state))return name;
  return null;
}


function basisEqual(a,b){
  if(a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  return true;
}
function activeSet(q,player){return new Set(activeIds(q,player));}
function cellsStatic(id){
  return shapeCells(id).map(cell=>({
    cell,
    column:g.cellColumn[cell]+1,
    row:g.cellRow[cell]+1
  }));
}
function symmetricDifference(a,b,player){
  const A=activeSet(a,player),B=activeSet(b,player);
  const ids=[...new Set([...A,...B])].filter(id=>A.has(id)!==B.has(id)).sort((x,y)=>x-y);
  return ids.map(id=>({
    diagnosticId:id,
    size:g.shapeSize[id],
    inRouteA:A.has(id),
    inRouteB:B.has(id),
    attachedCells:cellsStatic(id),
    routeADescription:A.has(id)?residualDesc(a,id,player):null,
    routeBDescription:B.has(id)?residualDesc(b,id,player):null
  }));
}
function resultProfile(q){
  return {
    terminal:q.terminal,
    rank:rankOf(q),
    mover:moverOf(q)+1,
    support:support(q),
    knownRoot:knownRoot(q),
    cpc:cpc(q),
    basis:Array.from(q.basis.slice(0,q.n)),
    p1ActiveResidualIds:activeIds(q,P1),
    p2ActiveResidualIds:activeIds(q,P2),
    p1Minimal:minimalIds(q,P1).map(id=>residualDesc(q,id,P1)),
    p2Minimal:minimalIds(q,P2).map(id=>residualDesc(q,id,P2)),
    p1AlignedPairs:alignedMinimalPairs(q)
  };
}
function forcedMacro(source,p1Column1,expectedForcedColumn1){
  const afterP1=step(source,p1Column1-1);
  assert.equal(afterP1.terminal,0);
  assert.equal(rankOf(afterP1),23);
  assert.equal(moverOf(afterP1),P2);
  const cc=cpc(afterP1);
  const forced=agreedRestriction(cc);
  assert.equal(forced,expectedForcedColumn1);
  const result=step(afterP1,forced-1);
  assert.equal(result.terminal,0);
  assert.equal(rankOf(result),24);
  assert.equal(moverOf(result),P1);
  return {
    p1Column:p1Column1,
    afterP1:{
      terminal:afterP1.terminal,
      rank:rankOf(afterP1),
      support:support(afterP1),
      cpc:cc
    },
    forcedDefenderColumn:forced,
    result:resultProfile(result),
    state:result
  };
}

const q20=fromSequence(ROOT);
assert.equal(q20.terminal,0);
assert.equal(rankOf(q20),20);
assert.equal(moverOf(q20),P1);
assert.deepEqual(support(q20),[1,6,1,6,1,5,0]);

const afterP1c5=step(q20,4);
assert.equal(afterP1c5.terminal,0);
assert.equal(rankOf(afterP1c5),21);
assert.equal(moverOf(afterP1c5),P2);
assert.deepEqual(support(afterP1c5),[1,6,1,6,2,5,0]);

const q22=step(afterP1c5,4);
assert.equal(q22.terminal,0);
assert.equal(rankOf(q22),22);
assert.equal(moverOf(q22),P1);
assert.deepEqual(support(q22),[1,6,1,6,3,5,0]);

const routeA=forcedMacro(q22,3,5);
const routeB=forcedMacro(q22,5,3);
assert.deepEqual(routeA.result.support,[1,6,2,6,4,5,0]);
assert.deepEqual(routeB.result.support,[1,6,2,6,4,5,0]);

const supportEqual=JSON.stringify(routeA.result.support)===JSON.stringify(routeB.result.support);
const basisSame=basisEqual(routeA.state,routeB.state);
const exactRbaEqual=exactEqual(routeA.state,routeB.state);
const p1ResidualSymmetricDifference=symmetricDifference(routeA.state,routeB.state,P1);
const p2ResidualSymmetricDifference=symmetricDifference(routeA.state,routeB.state,P2);

if(exactRbaEqual){
  assert.equal(basisSame,true);
  assert.equal(p1ResidualSymmetricDifference.length,0);
  assert.equal(p2ResidualSymmetricDifference.length,0);
}else{
  assert(p1ResidualSymmetricDifference.length+p2ResidualSymmetricDifference.length>0);
}

delete routeA.state;
delete routeB.state;

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_c5_reply5_forced_macro_convergence_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  design:DESIGN,
  rank20:{
    sequence:ROOT,
    rank:rankOf(q20),
    mover:moverOf(q20)+1,
    support:support(q20)
  },
  sourcePath:['P1:c5','P2:c5'],
  sourceRank22:{
    rank:rankOf(q22),
    mover:moverOf(q22)+1,
    support:support(q22),
    cpc:cpc(q22),
    p1Minimal:minimalIds(q22,P1).map(id=>residualDesc(q22,id,P1)),
    p2Minimal:minimalIds(q22,P2).map(id=>residualDesc(q22,id,P2)),
    p1AlignedPairs:alignedMinimalPairs(q22)
  },
  routeA,
  routeB,
  comparison:{
    supportEqual,
    basisEqual:basisSame,
    exactRbaEqual,
    p1ResidualSymmetricDifference,
    p2ResidualSymmetricDifference
  },
  conclusion:[
    'This bounded probe compares the two CPC-forced macros exposed by the unresolved P1:c5 / P2:c5 rank-22 child.',
    exactRbaEqual
      ? 'The two macros converge to the same exact RBA state; the apparent support convergence is therefore a genuine semantic convergence class.'
      : 'The two macros share the same support vector but are not the same exact RBA state; support-level convergence is rejected and the residual symmetric difference is preserved.',
    'No value is assigned to either rank-24 result by this probe.'
  ],
  boundary:[
    'This is discovery evidence only and does not certify the rank-20 root or either rank-24 result.',
    'No oracle, Pons score, solved W/D/L, minimax, ordinary game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
