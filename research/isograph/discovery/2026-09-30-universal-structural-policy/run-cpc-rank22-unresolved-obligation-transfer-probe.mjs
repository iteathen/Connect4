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
const P1=0;
const parent='4444415666662322224233';

function qFromSequence(sequence){
  const q=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:q.words,basis:q.basis,n:q.basis.length,terminal:q.words[g.metaOffset]&3};
}
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
function activeMinimal(q,player){
  const active=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function residualDesc(q,id,player){
  const size=g.shapeSize[id],base=id*4,cells=[];
  let aligned=true;
  for(let i=0;i<size;i++){
    const cell=g.shapeCells[base+i];
    const owner=connect4CpcTargetOwner32(g,q.words,0,cell);
    if(owner!==player)aligned=false;
    cells.push({
      cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1,
      projectedOwner:owner+1,
      supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell)
    });
  }
  return {diagnosticId:id,size,cells,fullyAligned:aligned};
}
function cpc(q){
  const kinds=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);
  const out={};
  for(const [name,frontierResponse] of [['baseline',false],['frontier',true]]){
    const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
    out[name]={
      kind:kinds.get(kind),interval:[s.interval[0]-2,s.interval[1]-2],
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
function stateDesc(q){
  const rank=q.words[g.metaOffset]>>>2,mover=rank&1;
  return {
    rank,mover:mover+1,terminal:q.terminal,support:support(q),cpc:cpc(q),
    moverMinimal:activeMinimal(q,mover).map(id=>residualDesc(q,id,mover)),
    p1Aligned:activeMinimal(q,P1).map(id=>residualDesc(q,id,P1)).filter(x=>x.fullyAligned),
  };
}

const root=qFromSequence(parent);
const afterC1=step(root,0);
assert.equal(afterC1.terminal,0);

const rows=[];
for(const defenderReply of [2,6]){ // one-based 3 and 7, unresolved branches
  const reply=step(afterC1,defenderReply);
  assert.equal(reply.terminal,0);
  const row={
    defenderReplyColumn:defenderReply+1,
    state:stateDesc(reply),
    candidates:[]
  };
  for(let p1=0;p1<7;p1++){
    if(reply.words[p1]>=6)continue;
    const a=step(reply,p1);
    const candidate={
      p1Column:p1+1,
      terminal:a.terminal,
      afterP1:stateDesc(a),
      restriction:null,
    };
    if(!a.terminal){
      const ca=cpc(a);
      const b0=ca.baseline, bf=ca.frontier;
      if(
        b0.kind==='CPC_RESTRICT'&&bf.kind==='CPC_RESTRICT'&&
        b0.preemptionCount===1&&bf.preemptionCount===1&&
        b0.forcedColumn===bf.forcedColumn&&b0.forcedColumn!==null
      ){
        const forced=b0.forcedColumn-1;
        if(a.words[forced]<6){
          const d=step(a,forced);
          candidate.restriction={
            forcedDefenderColumn:forced+1,
            defenderTerminal:d.terminal,
            afterForcedDefender:d.terminal?null:stateDesc(d),
          };
        }
      }
    }
    row.candidates.push(candidate);
  }
  rows.push(row);
}

console.log(JSON.stringify({
  schema:'connect4.cpc_rank22_unresolved_obligation_transfer_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  parent:{sequence:parent,rank:22,candidateMoveColumn:1},
  rows,
  conclusion:[
    'Discovery probe only: it follows only exact single-column restrictions already emitted by production CPC.',
    'Candidate Player-1 moves are not assigned values unless they are terminal; the probe records the exact state after a native CPC-forced defender reply when one exists.',
    'The purpose is to detect a finite obligation-transfer macro shared by the two unresolved rank-22 column-1 branches.'
  ],
  boundary:[
    'No oracle, Pons, solved W/D/L, minimax, best-move table, physical-position identity, or sealed holdout is used.',
    'Production CPC and JSMinSys are read-only and unchanged.',
    'Residual IDs are diagnostic only; cell attachment is recorded for meaning.'
  ]
},null,2));
