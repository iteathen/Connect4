#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6;
const C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const REPAIRS = [0, 1, 3, 4, 5];

function replay(kernel, seq) {
  let id = kernel.rootId;
  for (const d of seq) {
    const next = kernel.advance(id, Number(d) - 1);
    if (!Number.isSafeInteger(next) || next < 0) throw new Error(`bad replay ${seq}`);
    id = next;
  }
  return id;
}
function heightsOf(seq) { const h=Array(7).fill(0); for(const d of seq) h[Number(d)-1]++; return h; }
function hasCell([lo,hi],cell){return cell<32?(((lo>>>cell)&1)!==0):(((hi>>>(cell-32))&1)!==0);}
function cellsOf(term){const out=[];for(let cell=0;cell<42;cell++)if(hasCell(term,cell))out.push(cell);return out;}
function terms(kernel,id,p){const cid=p===0?kernel.states.p0At(id):kernel.states.p1At(id);return kernel.classes.terms(cid).map(cellsOf);}
function coord(cell){return `${String.fromCharCode(65+(cell%7))}${Math.floor(cell/7)+1}`;}
function colName(col){return String.fromCharCode(65+col);}
function key(term){return term.map(coord).join('-');}
function contains(term,cell){return term.includes(cell);}
function hasSingleton(kernel,id,cell){return terms(kernel,id,0).some(t=>t.length===1&&t[0]===cell);}
function localCofactor(term,cell){return term.filter(x=>x!==cell);}

const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
  cacheEdges:true,prefixClasses:4096,responseClosure:true,
  searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072}),
});
kernel.prepareSearchStorage();

const cases=[
  {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,remaining:G,target:G3},
  {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,remaining:G,target:G3},
  {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,remaining:C,target:C3},
  {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,remaining:C,target:C3},
];

const rows=[];
for(const c of cases){
  const seq=ROOT+c.prefix+String(c.resolved+1).repeat(3);
  const id=replay(kernel,seq), h=heightsOf(seq);
  assert.equal(hasSingleton(kernel,id,c.target),true);
  const p0=terms(kernel,id,0),p1=terms(kernel,id,1);
  for(const col of REPAIRS){
    const cell=h[col]*7+col;
    const next=kernel.advance(id,col);assert(next>=0);
    assert.equal(hasSingleton(kernel,next,c.target),true);
    const remainingCapacity=6-(h[col]+1);
    const supportClass=remainingCapacity===5?'ODD_CHAIN_5':remainingCapacity===1?'ODD_TAIL_1':`ODD_CHAIN_${remainingCapacity}`;
    const p0Incident=p0.filter(t=>contains(t,cell)).map(key).sort();
    const p1Incident=p1.filter(t=>contains(t,cell)).map(key).sort();
    const p1Cofactors=p1.filter(t=>contains(t,cell)).map(t=>key(localCofactor(t,cell))).sort();
    const signature={
      supportClass,
      remainingCapacity,
      phaseEffect:'TOGGLE_SELECTED_RESOURCE_BIT',
      targetEffect:'PRESERVE_REMAINING_SINGLETON',
      followMode:remainingCapacity===1?'P0_CONSUMES_FINAL_TAIL_EVENT':'SAME_COLUMN_RESPONSE_AVAILABLE',
      p0Incident,
      p1Incident,
      p1Cofactors,
    };
    rows.push({case:c.name,remainingTarget:coord(c.target),repairColumn:colName(col),repairCell:coord(cell),signature});
  }
}

const groups=new Map();
for(const row of rows){const k=JSON.stringify(row.signature);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(`${row.case}:${row.repairColumn}`);}
const grouped=[...groups.entries()].map(([signature,members])=>({signature:JSON.parse(signature),members}));
const nontrivial=grouped.filter(g=>g.members.length>1);

console.log(`PHASE_DEBT_LOCAL_EFFECT_SIGNATURES=${JSON.stringify({
  kind:'standard7x6-phase-debt-local-semantic-effect-signatures-v1',
  attribution:{researchDirectionInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  transitionCount:rows.length,
  signatureClassCount:grouped.length,
  nontrivialClassCount:nontrivial.length,
  nontrivialClasses:nontrivial,
  singletonClassCount:grouped.length-nontrivial.length,
  rows,
  theoremBoundary:'A local-effect class means the repair event has the same support-tail type, GF2 role, latent-target observation, and exact incident R cofactor data. It licenses reuse of the local event theorem under separately checked C/N guards; it is not q-state equality and does not erase nonincident residual facts.',
  interpretation:'This is an event-dependency-cone signature. Context distinctions outside the event incidence neighborhood are stutters for the local R operator, but remain live global facts unless a stronger congruence theorem removes them.',
  authority:'Pure C4-0010 support/residual transitions. No W/D/L labels and no recursive frontier search.'
})}`);
