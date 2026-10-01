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
const parentSequence='4444415666662322224233';
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

const afterAttack=step(parent,0);
assert.equal(afterAttack.terminal,0);
const rows=[];
for(const reply of [2,4,5,6]){ // one-based 3,5,6,7
  const child=step(afterAttack,reply);
  assert.equal(child.terminal,0);
  const candidates=[];
  for(let move=0;move<7;move++){
    if(child.words[move]>=6)continue;
    const q1=step(child,move);
    const entry={column:move+1,terminal:q1.terminal};
    if(q1.terminal===P1_WIN)entry.immediateP1Win=true;
    else if(!q1.terminal){
      entry.cpcForOpponent={baseline:cpc(q1,false),frontier:cpc(q1,true)};
      const aligned=minimalIds(q1,P1).map(id=>shapeRecord(q1,id)).filter(x=>x.fullyP1Aligned);
      entry.p1AlignedMinimalAfterMove=aligned;
    }
    candidates.push(entry);
  }
  rows.push({
    defenderReplyColumn:reply+1,
    state:stateRecord(child),
    p1CandidateMoves:candidates,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_rank22_alternative_reply_parity_profile.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  parent:{sequence:parentSequence,rank:22,support:support(parent),candidateMoveColumn:1},
  rows,
  conclusion:[
    'This diagnostic profiles exact minimal RBA residual attachment and CPC target-owner parity in the four rank-24 alternative reply states not covered by the consumed reply-1 path.',
    'It also records native CPC output and fully P1-aligned minimal residuals after every legal Player-1 candidate move.',
    'Projected alignment remains diagnostic unless escape/preemption is separately closed.',
  ],
  boundary:[
    'Residual ids are diagnostic only; cells and attachment carry the semantic meaning.',
    'No oracle, solved W/D/L, Pons, minimax, or sealed holdout is used.',
    'Production CPC is read-only and unchanged.',
  ],
},null,2));
