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
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1_WIN=3,DRAW=2,P2_WIN=1;

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
function key(q){
  let s='';
  for(let i=0;i<g.keyWords;i++)s+=q.words[i].toString(36)+'.';
  return s;
}
function support(q){return Array.from(q.words.slice(0,7));}

function solve(root){
  const memo=new Map();
  let nodes=0,hits=0;
  function rec(q){
    nodes++;
    const terminal=q.words[g.metaOffset]&3;
    if(terminal)return terminal;
    const k=key(q),cached=memo.get(k);
    if(cached!==undefined){hits++;return cached;}
    const rank=q.words[g.metaOffset]>>>2,mover=rank&1;
    let best=mover===0?0:4;
    for(let c=0;c<7;c++){
      if(q.words[c]>=6)continue;
      const child=step(q,c),v=rec(child);
      if(mover===0){
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
  const value=rec(root);
  const mover=(root.words[g.metaOffset]>>>2)&1;
  const moves=[];
  for(let c=0;c<7;c++){
    if(root.words[c]>=6)continue;
    const child=step(root,c),v=rec(child);
    moves.push({column:c+1,value:v});
  }
  const bestValue=mover===0?Math.max(...moves.map(x=>x.value)):Math.min(...moves.map(x=>x.value));
  return {
    value,bestValue,
    bestMoves:moves.filter(x=>x.value===bestValue).map(x=>x.column),
    moves,
    nodes,memoSize:memo.size,memoHits:hits,
  };
}

const rank28Sequence='4444415666662322224233171633';
const rank30Sequence=rank28Sequence+'11';
const rank28=fromSequence(rank28Sequence),rank30=fromSequence(rank30Sequence);
assert.equal(rank28.words[g.metaOffset]>>>2,28);
assert.equal(rank30.words[g.metaOffset]>>>2,30);

const started=process.hrtime.bigint();
const r28=solve(rank28);
const mid=process.hrtime.bigint();
const r30=solve(rank30);
const ended=process.hrtime.bigint();

console.log(JSON.stringify({
  schema:'connect4.rba_local_value_discovery_rank28_rank30.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:true,
  proofPremiseAllowed:false,
  states:[
    {
      label:'rank28-c6-handoff',
      sequence:rank28Sequence,
      rank:28,
      mover:1,
      support:support(rank28),
      discovery:r28,
      elapsedNs:String(mid-started),
    },
    {
      label:'rank30-after-c1-c1',
      sequence:rank30Sequence,
      rank:30,
      mover:1,
      support:support(rank30),
      discovery:r30,
      elapsedNs:String(ended-mid),
    },
  ],
  valueEncoding:{1:'P2_WIN',2:'DRAW',3:'P1_WIN'},
  boundary:[
    'This file is discovery/falsification evidence only and is forbidden as a structural theorem premise or runtime universal policy.',
    'The local solver uses exact RBA cofactors and memoized ordinary game-tree recursion solely to identify which current-state candidates merit structural proof.',
    'No Pons, external oracle, solved database, opening book, best-move table, physical-position identity, or sealed holdout is used.',
    'Production CPC and JSMinSys are read-only and unchanged.'
  ]
},null,2));
