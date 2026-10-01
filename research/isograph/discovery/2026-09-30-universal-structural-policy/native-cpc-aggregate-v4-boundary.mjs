// Read-only aggregate CPC diagnostic for the universal structural-policy boundary.
// One evaluateConnect4Cpc32 call per state. No oracle, no solve, no search.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const [library,out]=process.argv.slice(2);
assert.ok(library&&out);

const EXPECTED_JSMINSYS_SHA='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
const sha=git('rev-parse','HEAD');
assert.equal(sha,EXPECTED_JSMINSYS_SHA);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32
}=await load('cpc-connect4');

const KIND_NAME=new Map([
  [CPC_NONE,'CPC_NONE'],
  [CPC_EXACT,'CPC_EXACT'],
  [CPC_BOUND,'CPC_BOUND'],
  [CPC_RESTRICT,'CPC_RESTRICT'],
]);

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const states=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
  {id:'candidate6_forced_2_then_3',sequence:'444441566623'},
  {id:'candidate6_forced_3_then_2',sequence:'444441566632'},
];

const rows=[];
for(const state of states){
  const q=connect4RbaFromMoves(Array.from(state.sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  rows.push({
    ...state,
    rank:state.sequence.length,
    mover:(state.sequence.length&1)+1,
    basisSize:q.basis.length,
    cpc:{
      kind,
      kindName:KIND_NAME.get(kind),
      absoluteInterval:[scratch.interval[0]-2,scratch.interval[1]-2],
      forcedColumnZeroBased:scratch.forcedColumn[0],
      forcedColumnOneBased:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
      preemptionMask32:scratch.preemptionMask32[0]>>>0,
      preemptionCount:scratch.preemptionCount[0],
      precursorCount:scratch.precursorCount[0],
    },
  });
}

const result={
  schema:'connect4.universal_structural_policy.aggregate_cpc_boundary.v1',
  createdAt:new Date().toISOString(),
  jsMinSysSha:sha,
  geometry:'7x6',
  runtime:process.version,
  solvedInputsUsed:false,
  oracleUsed:false,
  oneCpcCallPerState:true,
  frontierResponse:true,
  projectedAdvisory:false,
  states:rows,
  interpretationBoundary:[
    'CPC output is the aggregate structural closure for the prepared current-state basis.',
    'CPC_EXACT is exact only under CPC\'s implemented guards.',
    'CPC_BOUND is a sound WDL interval bound, not exact strong distance.',
    'CPC_RESTRICT is an exact current-action restriction when emitted.',
    'CPC_NONE means this CPC grammar did not close the state; it is not a game-value statement.',
    'No move-selection ordering is licensed from unresolved intervals alone.'
  ],
};

writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
