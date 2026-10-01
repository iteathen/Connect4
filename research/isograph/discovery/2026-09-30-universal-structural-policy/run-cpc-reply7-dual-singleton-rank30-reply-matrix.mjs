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
const sequence='444441566666232222423317771611';
const ing=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
const root={words:ing.words,basis:ing.basis,n:ing.basis.length,terminal:ing.words[g.metaOffset]&3};
assert.equal(root.terminal,0);
assert.equal(root.words[g.metaOffset]>>>2,30);
assert.equal((root.words[g.metaOffset]>>>2)&1,P1);

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
function key(q){let s='';for(let i=0;i<g.keyWords;i++)s+=q.words[i].toString(36)+'.';return s;}
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
      playable:q.words[g.cellColumn[cell]]===g.cellRow[cell],
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
    projectedForks:Array.from(s.projectedForks),
  };
}
function state(q){
  const rank=q.words[g.metaOffset]>>>2,mover=rank&1;
  return {
    rank,mover:mover+1,terminal:q.terminal,support:support(q),
    cpc:{baseline:cpc(q,false),frontier:cpc(q,true)},
    p1Minimal:minimal(q,P1).map(id=>residual(q,id,P1)),
    p2Minimal:minimal(q,P2).map(id=>residual(q,id,P2)),
  };
}
function immediateWins(q,player){
  const term=player===P1?P1_WIN:P2_WIN,out=[];
  for(let c=0;c<7;c++){
    if(q.words[c]>=6)continue;
    if(step(q,c).terminal===term)out.push(c+1);
  }
  return out;
}

const memo=new Map();let nodes=0,hits=0;
function solve(q){
  nodes++;
  const t=q.words[g.metaOffset]&3;if(t)return t;
  const k=key(q),m=memo.get(k);if(m!==undefined){hits++;return m;}
  const mover=(q.words[g.metaOffset]>>>2)&1;
  let best=mover===P1?0:4;
  for(let c=0;c<7;c++)if(q.words[c]<6){
    const v=solve(step(q,c));
    if(mover===P1){if(v>best)best=v;if(best===P1_WIN)break;}
    else{if(v<best)best=v;if(best===P2_WIN)break;}
  }
  if(best===0||best===4)best=DRAW;
  memo.set(k,best);
  return best;
}

const candidateColumns=[0,4,6]; // discovery-only winning root candidates: 1,5,7
const rows=[];
for(const pc of candidateColumns){
  const afterP1=step(root,pc);
  assert.equal(afterP1.terminal,0);
  const replies=[];
  for(let d=0;d<7;d++){
    if(afterP1.words[d]>=6)continue;
    const afterP2=step(afterP1,d);
    const entry={
      p2Column:d+1,
      terminal:afterP2.terminal,
      support:support(afterP2),
      diagnosticValue:afterP2.terminal||solve(afterP2),
      immediateP1WinningColumns:afterP2.terminal?[]:immediateWins(afterP2,P1),
      state:afterP2.terminal?null:state(afterP2),
    };
    replies.push(entry);
  }
  rows.push({
    p1Column:pc+1,
    supportAfterP1:support(afterP1),
    cpcForP2:{baseline:cpc(afterP1,false),frontier:cpc(afterP1,true)},
    immediateP2WinningColumns:immediateWins(afterP1,P2),
    replies,
  });
}

console.log(JSON.stringify({
  schema:'connect4.rba_reply7_dual_singleton_rank30_reply_matrix.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:true,
  proofPremiseAllowed:false,
  state:{sequence,rank:30,mover:1,support:support(root)},
  candidates:rows,
  diagnosticCounters:{nodes,memoSize:memo.size,memoHits:hits},
  valueEncoding:{1:'P2_WIN',2:'DRAW',3:'P1_WIN'},
  conclusion:[
    'Discovery/falsification matrix for the three rank-30 candidates previously identified as winning by the local exact RBA diagnostic.',
    'Child values are used only to choose the structurally smallest branch family for theorem work.',
    'Current-state CPC/RBA facts are recorded independently for every legal defender reply.'
  ],
  boundary:[
    'The W/D/L recursion is forbidden as a structural theorem or runtime policy premise.',
    'No Pons, external oracle, solved database, opening book, best-move table, physical identity, or sealed holdout is used.',
    'Production CPC and JSMinSys are read-only and unchanged.'
  ]
},null,2));
