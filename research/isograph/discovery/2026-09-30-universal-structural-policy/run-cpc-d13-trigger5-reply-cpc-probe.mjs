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

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const KIND=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);
const parent='444441566666232222423311';
const trigger='5';

function cpc(q){
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  return {
    kind:KIND.get(kind),
    interval:[scratch.interval[0]-2,scratch.interval[1]-2],
    forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
    preemptionCount:scratch.preemptionCount[0],
    precursorCount:scratch.precursorCount[0]
  };
}

const rows=[];
for(let response=1;response<=7;response++){
  const sequence=parent+trigger+String(response);
  let q;
  try{q=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});}catch{continue;}
  const terminal=q.words[g.metaOffset]&3;
  if(q.words.slice(0,7)[response-1] > 6)continue;
  rows.push({
    responseColumn:response,
    sequence,
    rank:sequence.length,
    terminal,
    support:Array.from(q.words.slice(0,7)),
    cpc:terminal?null:cpc(q)
  });
}
console.log(JSON.stringify({
  schema:'connect4.cpc_d13_trigger5_reply_cpc_probe.v1',
  oracleUsed:false,
  solvedInputsUsed:false,
  parentSequence:parent,
  triggerColumn:5,
  rows,
  boundary:[
    'This probe applies the existing native CPC evaluator independently to each legal defender reply after the transported trigger-5 state.',
    'CPC exact/bound/restrict results are native structural certificates only; no oracle or solved W/D/L input is used.',
    'A CPC_NONE result does not imply the state is not game-theoretically decided; it means current CPC grammar does not certify it.'
  ]
},null,2));
