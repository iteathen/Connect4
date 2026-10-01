#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const dir=resolve(import.meta.dirname);
const bridge=JSON.parse(readFileSync(resolve(dir,'CPC_FORMULA_EXCHANGE_PHASE_BRIDGE_PILOT_0_1.json'),'utf8'));
const phase=JSON.parse(readFileSync(resolve(dir,'CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_0_1.json'),'utf8'));

assert.equal(bridge.accept,true);
assert.equal(phase.accept,true);
assert.equal(bridge.oracleUsed,false);
assert.equal(bridge.solvedInputsUsed,false);
assert.equal(phase.oracleUsed,false);
assert.equal(phase.solvedInputsUsed,false);

function key(v){return v.join(',');}

const expected={
  TRANSFER:'1,0,0',
  EXPOSE_C3:'0,1,0',
  EXPOSE_C5:'0,0,0',
};

const rows=[];
let accept=true;
const observed=new Set();

for(const row of bridge.rows){
  const post=row.post.F;
  observed.add(key(post));

  let semanticRole;
  if(row.label==='TRANSFER'){
    semanticRole='TRANSFER';
  }else{
    if(row.responseTerminal!==3)throw new Error('exposure row lacks exact P1 terminal');
    if(row.p1ResponseColumn===3)semanticRole='EXPOSE_C3';
    else if(row.p1ResponseColumn===5)semanticRole='EXPOSE_C5';
    else semanticRole='UNEXPECTED_EXPOSURE_TARGET';
  }

  const expectedKey=expected[semanticRole]??null;
  const exact=expectedKey!==null&&key(post)===expectedKey;
  const bxyZero=post[2]===0;
  if(!exact||!bxyZero)accept=false;

  rows.push({
    state:row.state,
    p2Column:row.p2Column,
    p1ResponseColumn:row.p1ResponseColumn,
    qualifiedLabel:row.label,
    semanticRole,
    postF:post,
    expectedF:expectedKey?expectedKey.split(',').map(Number):null,
    exact,
    bxyZero,
  });
}

const allowed=new Set(Object.values(expected));
for(const v of observed)if(!allowed.has(v))accept=false;

const stateBxy=Object.fromEntries(
  Object.entries(bridge.exactStates).map(([name,state])=>[name,state.F[2]])
);
const initialOnlyBxy=
  stateBxy.Q===1 &&
  Object.entries(stateBxy).every(([name,v])=>name==='Q'?v===1:v===0);
if(!initialOnlyBxy)accept=false;

const inverse={};
for(const row of rows){
  const k=key(row.postF);
  if(!inverse[k])inverse[k]=new Set();
  inverse[k].add(row.semanticRole);
}
const inverseSummary=Object.fromEntries(
  Object.entries(inverse).map(([k,s])=>[k,[...s].sort()])
);
const inverseUnique=Object.values(inverse).every(s=>s.size===1);
if(!inverseUnique)accept=false;

console.log(JSON.stringify({
  schema:'connect4.cpc_formula_three_coordinate_local_decoder.v1',
  theoremCandidate:'CPC_FORMULA_THREE_COORDINATE_LOCAL_DECODER_THEOREM.md',
  jsMinSysSha:bridge.jsMinSysSha,
  oracleUsed:false,
  solvedInputsUsed:false,
  sourceEvidence:[
    'CPC_FORMULA_EXCHANGE_PHASE_BRIDGE_PILOT_0_1.json',
    'CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_0_1.json'
  ],
  decoder:{
    transfer:[1,0,0],
    exposeC3:[0,1,0],
    exposeC5:[0,0,0]
  },
  rows,
  observedPostVectors:[...observed].sort(),
  inverseSummary,
  inverseUnique,
  stateBxy,
  initialOnlyBxy,
  accept,
  conclusion:accept?[
    'The post-trigger F vector is an exact three-way structural decoder on the qualified phase machine.',
    'Bx=1 selects transfer; when Bx=0, By selects c3 versus c5 exposure.',
    'Bxy is zero on every post-trigger vector and is nonzero only at the initial Q state among the exact Player-2 states in this family.'
  ]:[
    'The frozen local decoder failed at least one exact row or inverse-uniqueness check.'
  ],
  boundary:[
    'No old formula scalar code, oracle, Pons, solved W/D/L, local game-tree value or best-move table is used.',
    'The theorem is bounded to the already-qualified exact three-column CPC family.',
    'Production CPC and JSMinSys remain unchanged.'
  ]
},null,2));
