#!/usr/bin/env node
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-native-cpc-v4-boundary-probe.mjs <JSMinSys checkout>');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {
  prepareConnect4CpcScratch,
  evaluateConnect4Cpc32,
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const kindName=new Map([
  [CPC_NONE,'NONE'],
  [CPC_EXACT,'EXACT'],
  [CPC_BOUND,'BOUND'],
  [CPC_RESTRICT,'RESTRICT'],
]);

const rows=[
  {label:'candidate2',sequence:'4444415662'},
  {label:'candidate3',sequence:'4444415663'},
  {label:'candidate6',sequence:'4444415666'},
  {label:'candidate6_split_2_then_3',sequence:'444441566623'},
  {label:'candidate6_split_3_then_2',sequence:'444441566632'},
];

function bitCells(bits){
  const out=[];
  for(let cell=0;cell<g.cellCount;cell++)if(bits[cell>>>5]&(1<<(cell&31)))
    out.push({column:(cell%g.columns)+1,row:Math.floor(cell/g.columns)+1});
  return out;
}
function maskColumns(mask){
  const out=[];
  for(let c=0;c<g.columns;c++)if(mask&(1<<c))out.push(c+1);
  return out;
}

const evidence=[];
for(const row of rows){
  const moves=Array.from(row.sequence,c=>Number(c)-1);
  const q=connect4RbaFromMoves(moves,{geometry:g,canonical:false});
  const policies=[];
  for(const frontierResponse of [false,true]){
    const scratch=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
    policies.push({
      frontierResponse,
      kind,
      kindName:kindName.get(kind),
      absoluteInterval:[scratch.interval[0]-2,scratch.interval[1]-2],
      forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
      preemptionMask32:scratch.preemptionMask32[0]>>>0,
      preemptionColumns:maskColumns(scratch.preemptionMask32[0]>>>0),
      precursorCount:scratch.precursorCount[0],
      preemptionCount:scratch.preemptionCount[0],
      projected:{
        p0Count:scratch.projectedCount[0],
        p1Count:scratch.projectedCount[1],
        p0ForkPairs:scratch.projectedForks[0],
        p1ForkPairs:scratch.projectedForks[1],
      },
      activeSingletonCells:{
        p0:bitCells(scratch.activeSingletonCells),
        p1:bitCells(scratch.activeSingletonCellsOther),
      },
    });
  }
  evidence.push({label:row.label,sequence:row.sequence,basisSize:q.basis.length,policies});
}

console.log(JSON.stringify({
  schema:'connect4.native_cpc_v4_boundary_probe.v1',
  oracleUsed:false,
  jsMinSysRequiredRevision:'6bbba7c71c60afb1018a22b6d5c03f495f5d2c9e',
  semantics:'one native evaluateConnect4Cpc32 call over the complete active residual basis per state/policy',
  rows:evidence,
  boundary:'This probe asks whether native CPC already closes or restricts the v4 remoteness boundary globally. CPC outputs are structural facts only; absence of closure is not a game-value conclusion.',
},null,2));
