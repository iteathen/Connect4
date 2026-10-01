#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const dir=resolve(import.meta.dirname);
const phase=JSON.parse(readFileSync(resolve(dir,'CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_0_1.json'),'utf8'));
const bridge=JSON.parse(readFileSync(resolve(dir,'CPC_FORMULA_EXCHANGE_PHASE_BRIDGE_PILOT_0_1.json'),'utf8'));

assert.equal(phase.accept,true);
assert.equal(phase.oracleUsed,false);
assert.equal(phase.solvedInputsUsed,false);
assert.equal(bridge.accept,true);
assert.equal(bridge.oracleUsed,false);
assert.equal(bridge.solvedInputsUsed,false);
assert.equal(bridge.tupleClassification.tupleSeparates,true);
assert.equal(phase.jsMinSysSha,bridge.jsMinSysSha);

const stateRows=new Map();
for(const row of bridge.rows){
  if(!stateRows.has(row.state))stateRows.set(row.state,[]);
  stateRows.get(row.state).push(row);
}

const stateInfo={};
for(const [name,st] of Object.entries(bridge.exactStates)){
  const c7=st.channels.find(x=>x.column===7);
  assert(c7);
  stateInfo[name]={
    Bx:st.F[0],
    F:st.F,
    c7Capacity:c7.capacity,
    support:st.support,
    rows:stateRows.get(name)??[],
  };
  assert.equal(st.F[0],1,name+' not inside Bx viability region');
}

const checks=[];
let accept=true;
for(const [name,info] of Object.entries(stateInfo)){
  const rows=info.rows;
  let transferCount=0;
  for(const row of rows){
    const deltaBx=row.deltaF[0];
    const postBx=row.post.F[0];
    if(row.label==='EXPOSE'){
      const ok=deltaBx===1&&postBx===0&&row.responseTerminal===3&&row.next===null;
      checks.push({state:name,p2Column:row.p2Column,label:row.label,deltaBx,postBx,responseTerminal:row.responseTerminal,ok});
      if(!ok)accept=false;
    }else{
      transferCount++;
      const child=stateInfo[row.next];
      const ok=
        deltaBx===0&&postBx===1&&row.responseTerminal===0&&
        !!child&&child.Bx===1&&child.c7Capacity<info.c7Capacity;
      checks.push({
        state:name,p2Column:row.p2Column,label:row.label,deltaBx,postBx,
        responseTerminal:row.responseTerminal,next:row.next,
        c7CapacityBefore:info.c7Capacity,c7CapacityAfter:child?.c7Capacity??null,ok
      });
      if(!ok)accept=false;
    }
  }
  if(info.c7Capacity===0&&transferCount!==0)accept=false;
}

const exactStateNames=['Q','A','B','ZA','ZB','ZC'];
const proofOrder=exactStateNames
  .map(name=>({name,R:stateInfo[name].c7Capacity}))
  .sort((a,b)=>a.R-b.R);

const proved=new Set();
for(const {name,R} of proofOrder){
  const rows=stateInfo[name].rows;
  let ok=true;
  for(const row of rows){
    if(row.label==='EXPOSE'){
      ok&&=row.deltaF[0]===1&&row.responseTerminal===3;
    }else{
      ok&&=row.deltaF[0]===0&&proved.has(row.next);
    }
  }
  if(ok)proved.add(name);
}
const rootProved=proved.has('Q');
accept&&=rootProved;

console.log(JSON.stringify({
  schema:'connect4.cpc_bx_viability_finite_reservoir.v1',
  theoremCandidate:'CPC_BX_VIABILITY_FINITE_RESERVOIR_THEOREM.md',
  jsMinSysSha:bridge.jsMinSysSha,
  oracleUsed:false,
  solvedInputsUsed:false,
  sourceEvidence:{
    phase:'CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_0_1.json',
    bridge:'CPC_FORMULA_EXCHANGE_PHASE_BRIDGE_PILOT_0_1.json',
  },
  invariant:{
    viabilityCoordinate:'Bx = F[0]',
    exposeEquation:'EXPOSE = delta(Bx)',
    rank:'R = remaining c7 capacity',
  },
  stateInfo:Object.fromEntries(Object.entries(stateInfo).map(([name,v])=>[name,{
    Bx:v.Bx,F:v.F,c7Capacity:v.c7Capacity,support:v.support,
    legalTransitionCount:v.rows.length,
    transferCount:v.rows.filter(r=>r.label==='TRANSFER').length,
    exposureCount:v.rows.filter(r=>r.label==='EXPOSE').length,
  }])),
  exactSinkEquality:bridge.exactSinkEquality,
  checks,
  induction:{
    proofOrder,
    provedStates:[...proved],
    rootProved,
  },
  accept,
  conclusion:accept?[
    'Bx=1 is an exact viability invariant on every Player-2 state in the qualified three-column family.',
    'Every exposure edge is exactly delta(Bx)=1 and terminates for Player 1 on the qualified response.',
    'Every transfer edge has delta(Bx)=0, returns to Bx=1, and strictly decreases remaining c7 capacity.',
    'At c7 capacity zero no transfer edge remains; well-founded induction therefore reproves the rank-31 Player-1 win.'
  ]:[
    'At least one frozen viability or rank-descent premise failed.'
  ],
  boundary:[
    'This is a composition of two previously qualified exact structural evidence objects.',
    'No oracle, Pons, solved W/D/L, local game-tree value, old OOO scalar code, best-move table, or sealed holdout is used.',
    'No BSFP solved frontier is imported; only the viability/predecessor proof pattern is reused.',
    'Production CPC and JSMinSys remain unchanged.'
  ]
},null,2));
