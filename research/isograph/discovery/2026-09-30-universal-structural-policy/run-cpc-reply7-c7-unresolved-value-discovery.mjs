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

function fromSequence(sequence){
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
function key(q){let s='';for(let i=0;i<g.keyWords;i++)s+=q.words[i].toString(36)+'.';return s;}
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,player){const out=[];for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);return out;}
function minimalIds(q,player){
  const active=activeIds(q,player);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function residual(q,id,player){
  const size=g.shapeSize[id],base=id*4,cells=[];let aligned=true;
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
  if(k===CPC_NONE)return 'CPC_NONE';if(k===CPC_EXACT)return 'CPC_EXACT';
  if(k===CPC_BOUND)return 'CPC_BOUND';if(k===CPC_RESTRICT)return 'CPC_RESTRICT';return 'UNKNOWN';
}
function cpc(q,frontierResponse){
  const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
  const k=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
  return {
    kind:kindName(k),interval:[s.interval[0]-2,s.interval[1]-2],
    forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
    preemptionCount:s.preemptionCount[0],preemptionMask32:s.preemptionMask32[0]>>>0,
    precursorCount:s.precursorCount[0],projectedCount:Array.from(s.projectedCount),projectedForks:Array.from(s.projectedForks)
  };
}
function immediateWins(q,player){
  const target=player===P1?P1_WIN:P2_WIN,out=[];
  for(let c=0;c<7;c++)if(q.words[c]<6&&step(q,c).terminal===target)out.push(c+1);
  return out;
}
function solveRoot(root){
  const memo=new Map();let nodes=0,hits=0;
  function solve(q){
    nodes++;
    const term=q.words[g.metaOffset]&3;if(term)return term;
    const k=key(q),cached=memo.get(k);if(cached!==undefined){hits++;return cached;}
    const mover=(q.words[g.metaOffset]>>>2)&1;let best=mover===P1?0:4;
    for(let c=0;c<7;c++){
      if(q.words[c]>=6)continue;
      const v=solve(step(q,c));
      if(mover===P1){if(v>best)best=v;if(best===P1_WIN)break;}
      else{if(v<best)best=v;if(best===P2_WIN)break;}
    }
    if(best===0||best===4)best=DRAW;memo.set(k,best);return best;
  }
  const value=solve(root),moves=[];
  for(let c=0;c<7;c++)if(root.words[c]<6)moves.push({column:c+1,value:solve(step(root,c))});
  return {value,bestMoves:moves.filter(x=>x.value===value).map(x=>x.column),moves,nodes,memoSize:memo.size,memoHits:hits};
}
function profileWinning(root,winning){
  return winning.map(col=>{
    const q=step(root,col-1);
    return {
      column:col,terminal:q.terminal,support:support(q),
      cpcForP2:q.terminal?null:{baseline:cpc(q,false),frontier:cpc(q,true)},
      immediateP2WinningColumns:q.terminal?[]:immediateWins(q,P2),
      p1Aligned:q.terminal?[]:minimalIds(q,P1).map(id=>residual(q,id,P1)).filter(x=>x.fullyAligned),
      p2Aligned:q.terminal?[]:minimalIds(q,P2).map(id=>residual(q,id,P2)).filter(x=>x.fullyAligned),
    };
  });
}

const states=[
  {label:'after-p2-c5',sequence:'44444156666623222242331775',support:[2,6,3,6,2,5,2]},
  {label:'after-p2-c7',sequence:'44444156666623222242331777',support:[2,6,3,6,1,5,3]},
];

const rows=[];
for(const spec of states){
  const root=fromSequence(spec.sequence);
  assert.equal(root.words[g.metaOffset]>>>2,26);
  assert.equal((root.words[g.metaOffset]>>>2)&1,P1);
  assert.deepEqual(support(root),spec.support);
  const started=process.hrtime.bigint(),discovery=solveRoot(root),ended=process.hrtime.bigint();
  const winning=discovery.moves.filter(x=>x.value===P1_WIN).map(x=>x.column);
  rows.push({
    ...spec,rank:26,mover:1,
    cpc:{baseline:cpc(root,false),frontier:cpc(root,true)},
    p1Aligned:minimalIds(root,P1).map(id=>residual(root,id,P1)).filter(x=>x.fullyAligned),
    p2Aligned:minimalIds(root,P2).map(id=>residual(root,id,P2)).filter(x=>x.fullyAligned),
    discovery:{...discovery,elapsedNs:String(ended-started)},
    structurallyProfiledWinningCandidates:profileWinning(root,winning),
  });
}

console.log(JSON.stringify({
  schema:'connect4.rba_rank24_reply7_c7_unresolved_value_discovery.v1',
  jsMinSysSha:EXPECTED,oracleUsed:false,solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:true,proofPremiseAllowed:false,
  sourceHypothesis:'CPC_RANK24_REPLY7_C7_DUAL_OBLIGATION_HYPOTHESIS.md',
  states:rows,
  valueEncoding:{1:'P2_WIN',2:'DRAW',3:'P1_WIN'},
  boundary:[
    'The W/D/L recursion is discovery/falsification evidence only and is forbidden as a structural theorem or runtime policy premise.',
    'The two states were structurally identified before this local diagnostic; no Pons score or oracle value participates.',
    'No external oracle, solved database, opening book, best-move table, physical-position identity, or sealed holdout is used.',
    'Production CPC and JSMinSys are read-only and unchanged.'
  ]
},null,2));
