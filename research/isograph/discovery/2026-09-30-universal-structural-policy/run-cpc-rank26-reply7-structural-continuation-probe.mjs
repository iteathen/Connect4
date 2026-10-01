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
const sequence='44444156666623222242331775';

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
    const c=g.cellColumn[cell],r=g.cellRow[cell];
    cells.push({
      cell,
      column:c+1,
      row:r+1,
      projectedOwner:owner+1,
      supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell),
      playable:q.words[c]===r,
    });
  }
  return {diagnosticId:id,size,cells,fullyAligned:aligned};
}
function singletonProfile(q,player){
  return activeIds(q,player)
    .filter(id=>g.shapeSize[id]===1)
    .map(id=>residual(q,id,player));
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
function immediateWins(q,player){
  const target=player===P1?P1_WIN:P2_WIN;
  const out=[];
  for(let c=0;c<7;c++)if(q.words[c]<6&&step(q,c).terminal===target)out.push(c+1);
  return out;
}
function literalDefenderEscapeProfile(q){
  const rows=[];
  const escapeColumns=[];
  for(let d=0;d<7;d++){
    if(q.words[d]>=6)continue;
    const reply=step(q,d);
    const nextP1WinningColumns=reply.terminal===0?immediateWins(reply,P1):[];
    const defenderWins=reply.terminal===P2_WIN;
    const escapesImmediateP1=defenderWins||(reply.terminal===0&&nextP1WinningColumns.length===0);
    if(escapesImmediateP1)escapeColumns.push(d+1);
    rows.push({
      defenderColumn:d+1,
      terminal:reply.terminal,
      defenderWins,
      nextP1WinningColumns,
      escapesImmediateP1,
    });
  }
  return {rows,escapeColumns};
}

const state=fromSequence(sequence);
assert.equal(state.terminal,0);
assert.equal(state.words[g.metaOffset]>>>2,26);
assert.equal((state.words[g.metaOffset]>>>2)&1,P1);
assert.deepEqual(support(state),[2,6,3,6,2,5,2]);

const legalP1Moves=[];
const rows=[];
for(let c=0;c<7;c++){
  if(state.words[c]>=6)continue;
  legalP1Moves.push(c+1);
  const q=step(state,c);
  const row={
    p1Column:c+1,
    terminal:q.terminal,
    support:support(q),
    immediateP2WinningColumns:q.terminal===0?immediateWins(q,P2):[],
    p1Minimal:q.terminal===0?minimalIds(q,P1).map(id=>residual(q,id,P1)):[],
    p2Minimal:q.terminal===0?minimalIds(q,P2).map(id=>residual(q,id,P2)):[],
    p1Singletons:q.terminal===0?singletonProfile(q,P1):[],
    p2Singletons:q.terminal===0?singletonProfile(q,P2):[],
    cpcForP2:null,
    literalImmediateEscape:null,
    forcedChild:null,
  };
  if(q.terminal===0){
    const baseline=cpc(q,false),frontier=cpc(q,true);
    row.cpcForP2={baseline,frontier};
    row.literalImmediateEscape=literalDefenderEscapeProfile(q);
    const sameForced=
      baseline.forcedColumn!==null&&
      baseline.forcedColumn===frontier.forcedColumn&&
      baseline.preemptionCount>0&&frontier.preemptionCount>0;
    if(sameForced){
      const forcedColumn=baseline.forcedColumn-1;
      if(q.words[forcedColumn]<6){
        const child=step(q,forcedColumn);
        row.forcedChild={
          defenderColumn:forcedColumn+1,
          terminal:child.terminal,
          support:support(child),
          immediateP1WinningColumns:child.terminal===0?immediateWins(child,P1):[],
          p1Minimal:child.terminal===0?minimalIds(child,P1).map(id=>residual(child,id,P1)):[],
          p2Minimal:child.terminal===0?minimalIds(child,P2).map(id=>residual(child,id,P2)):[],
          p1Singletons:child.terminal===0?singletonProfile(child,P1):[],
          cpcForP1:child.terminal===0?{baseline:cpc(child,false),frontier:cpc(child,true)}:null,
        };
      }
    }
  }
  rows.push(row);
}

assert.deepEqual(legalP1Moves,[1,3,5,6,7]);

console.log(JSON.stringify({
  schema:'connect4.cpc_rank26_reply7_structural_continuation_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:false,
  design:'CPC_RANK26_REPLY7_STRUCTURAL_CONTINUATION_PROBE_DESIGN_0_1.md',
  state:{
    sequence,
    rank:26,
    mover:1,
    support:support(state),
    p1Minimal:minimalIds(state,P1).map(id=>residual(state,id,P1)),
    p2Minimal:minimalIds(state,P2).map(id=>residual(state,id,P2)),
  },
  legalP1Moves,
  rows,
  conclusion:[
    'Outcome-free current-state scan of every legal Player-1 move from the sole remaining rank-26 reply-7 branch.',
    'Rows record only exact RBA cofactors, CPC projections/restrictions, immediate terminals, residual attachment, and at most one native-CPC-forced defender child.',
    'No move value, best-move label, recursive game-tree result, or external oracle is consumed.'
  ],
  boundary:[
    'No oracle, Pons, solved W/D/L, best-move table, opening book, or ordinary game-tree search is used.',
    'The local W/D/L diagnostic previously recorded for this state is deliberately not loaded.',
    'Production CPC and JSMinSys are read-only and unchanged; BSFP is unchanged.',
    'This probe is discovery evidence only and does not assign value to any nonterminal move.'
  ]
},null,2));
