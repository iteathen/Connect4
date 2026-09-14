#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644';
const C=2,G=6,C3=2*7+C,G3=2*7+G;
const REPAIRS=Object.freeze([0,1,3,4,5]);

function replay(kernel,seq){let id=kernel.rootId;for(const d of seq){const n=kernel.advance(id,Number(d)-1);if(!Number.isSafeInteger(n)||n<0)throw new Error(`bad replay ${seq}`);id=n;}return id;}
function rank(kernel,id){return kernel.supportAccess.rankAt(kernel.states.supportAt(id));}
function landing(kernel,id,col){return kernel.supportAccess.landingAt(kernel.states.supportAt(id),col);}
function heights(kernel,id){const s=kernel.states.supportAt(id),out=[];for(let c=0;c<7;c++){const cell=kernel.supportAccess.landingAt(s,c);out.push(cell===0xff?6:Math.floor(cell/7));}return out;}
function phaseBits(kernel,id){return heights(kernel,id).map((h)=>h&1).join('');}
function hasCell([lo,hi],cell){return cell<32?(((lo>>>cell)&1)!==0):(((hi>>>(cell-32))&1)!==0);}
function cellsOf(term){const out=[];for(let cell=0;cell<42;cell++)if(hasCell(term,cell))out.push(cell);return out;}
function terms(kernel,id,p){const cid=p===0?kernel.states.p0At(id):kernel.states.p1At(id);return kernel.classes.terms(cid).map(cellsOf);}
function coord(cell){return `${String.fromCharCode(65+(cell%7))}${Math.floor(cell/7)+1}`;}
function colName(col){return String.fromCharCode(65+col);}
function termKey(term){return term.map(coord).join('-');}
function contains(term,cell){return term.includes(cell);}
function cofactorKey(term,cell){return term.filter((x)=>x!==cell).map(coord).join('-');}
function hasSingleton(kernel,id,cell){return terms(kernel,id,0).some((term)=>term.length===1&&term[0]===cell);}
function localIncidence(kernel,id,cell){
  if(cell===0xff||cell===null)return null;
  const p0=terms(kernel,id,0).filter((term)=>contains(term,cell));
  const p1=terms(kernel,id,1).filter((term)=>contains(term,cell));
  return {
    cell:coord(cell),
    p0Incident:p0.map(termKey).sort(),
    p1Incident:p1.map(termKey).sort(),
    p0Cofactors:p0.map((term)=>cofactorKey(term,cell)).sort(),
    p1Cofactors:p1.map((term)=>cofactorKey(term,cell)).sort(),
  };
}
function stable(value){if(Array.isArray(value))return value.map(stable);if(value===null||typeof value!=='object')return value;const out={};for(const k of Object.keys(value).sort())out[k]=stable(value[k]);return out;}
function key(value){return JSON.stringify(stable(value));}
function diffPaths(left,right,prefix=''){
  if(key(left)===key(right))return[];
  if(left===null||right===null||typeof left!=='object'||typeof right!=='object'||Array.isArray(left)||Array.isArray(right))return[prefix||'$'];
  const out=[];for(const k of [...new Set([...Object.keys(left),...Object.keys(right)])].sort())out.push(...diffPaths(left[k],right[k],prefix?`${prefix}.${k}`:k));return out;
}
function immediateSignature(kernel,id,beforeH,col,target){
  const repairCell=beforeH[col]*7+col;
  const afterRepair=kernel.advance(id,col);assert(afterRepair>=0);
  const remainingCapacity=6-(beforeH[col]+1);
  const p0=terms(kernel,id,0),p1=terms(kernel,id,1);
  const original={
    supportClass:remainingCapacity===5?'ODD_CHAIN_5':remainingCapacity===1?'ODD_TAIL_1':`ODD_CHAIN_${remainingCapacity}`,
    remainingCapacity,
    phaseEffect:'TOGGLE_SELECTED_RESOURCE_BIT',
    targetEffect:'PRESERVE_REMAINING_SINGLETON',
    followMode:remainingCapacity===1?'P0_CONSUMES_FINAL_TAIL_EVENT':'SAME_COLUMN_RESPONSE_AVAILABLE',
    p0Incident:p0.filter((term)=>contains(term,repairCell)).map(termKey).sort(),
    p1Incident:p1.filter((term)=>contains(term,repairCell)).map(termKey).sort(),
    p1Cofactors:p1.filter((term)=>contains(term,repairCell)).map((term)=>cofactorKey(term,repairCell)).sort(),
  };
  const nextCell=landing(kernel,afterRepair,col);
  return {
    afterRepair,
    conservativeProgressSignature:{
      immediateLocalEffect:original,
      exactGF2PhaseLocation:phaseBits(kernel,afterRepair),
      nextEnabledEventDependencyCone:localIncidence(kernel,afterRepair,nextCell),
    },
  };
}
function legalColumns(kernel,id){const out=[];for(let c=0;c<7;c++)if(landing(kernel,id,c)!==0xff)out.push(c);return out;}
function actionObservation(kernel,id,col,target){
  const eventCell=landing(kernel,id,col);
  if(eventCell===0xff)return{legal:false};
  const inputIncidence=localIncidence(kernel,id,eventCell);
  const next=kernel.advance(id,col);
  if(next===domain.QN_TERMINAL_WIN)return{legal:true,eventCell:coord(eventCell),inputIncidence,status:'P0_terminal'};
  if(!Number.isSafeInteger(next)||next<0)return{legal:true,eventCell:coord(eventCell),inputIncidence,status:'invalid'};
  const h=heights(kernel,next),targetCol=target%7;
  const nextSameColumn=landing(kernel,next,col);
  return{
    legal:true,
    eventCell:coord(eventCell),
    inputIncidence,
    status:'nonterminal',
    rank:rank(kernel,next),
    phaseBits:phaseBits(kernel,next),
    remainingTargetSingletonLive:hasSingleton(kernel,next,target),
    remainingTargetSupportDistance:Math.max(0,2-h[targetCol]),
    nextSameColumnIncidence:nextSameColumn===0xff?null:localIncidence(kernel,next,nextSameColumn),
  };
}
function actionVector(kernel,id,target){
  const legal=new Set(legalColumns(kernel,id));
  const out={};for(let col=0;col<7;col++)out[String(col+1)]=legal.has(col)?actionObservation(kernel,id,col,target):{legal:false};return out;
}

const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});
kernel.prepareSearchStorage();
const cases=[
  {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
  {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
  {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
  {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
];
const rows=[];
for(const c of cases){
  const seq=ROOT+c.prefix+String(c.resolved+1).repeat(3);
  const id=replay(kernel,seq),h=heights(kernel,id);
  assert.equal(rank(kernel,id),19);
  for(const col of REPAIRS){
    const built=immediateSignature(kernel,id,h,col,c.target);
    assert.equal(rank(kernel,built.afterRepair),20);
    assert.equal(hasSingleton(kernel,built.afterRepair,c.target),true);
    rows.push({
      member:`${c.name}:${colName(col)}`,
      target:coord(c.target),
      repairColumn:colName(col),
      signature:built.conservativeProgressSignature,
      nextActions:actionVector(kernel,built.afterRepair,c.target),
    });
  }
}
assert.equal(rows.length,20);
const groups=new Map();for(const row of rows){const k=key(row.signature);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(row);}
assert.equal(groups.size,14,'conservative progress-signature count drifted');

const classResults=[],split=[];
for(const [signature,members] of groups){
  const variants=new Map();for(const member of members){const k=key(member.nextActions);if(!variants.has(k))variants.set(k,[]);variants.get(k).push(member.member);}
  const v=[...variants.entries()].map(([observation,m])=>({observation:JSON.parse(observation),members:m}));
  const result={signature:JSON.parse(signature),members:members.map((m)=>m.member),crossActionContinuationClasses:v.length};
  if(v.length>1){
    const separators=new Set();for(let i=0;i<v.length;i++)for(let j=i+1;j<v.length;j++)for(const path of diffPaths(v[i].observation,v[j].observation))separators.add(path);
    result.separatingFields=[...separators].sort();
    result.variants=v;
    split.push(result);
  }
  classResults.push(result);
}
const crossActionClassCount=classResults.reduce((sum,c)=>sum+c.crossActionContinuationClasses,0);

console.log(`OFF_SUBSYSTEM_CROSS_ACTION_CONGRUENCE=${JSON.stringify({
  kind:'standard7x6-off-subsystem-refined-cross-action-congruence-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  physicalAfterRepairStates:rows.length,
  conservativeRefinedClasses:groups.size,
  crossActionObservationClasses:crossActionClassCount,
  splitRefinedClasses:split.length,
  actionCompleteGraphPromotionSafe:split.length===0,
  splitClasses:split,
  classResults,
  interpretation:split.length===0
    ? 'The 14 conservative progress signatures are congruent for every legal immediate P0 action in this bounded domain. They may be used as nodes for a next theorem-class relation, subject to later guarded continuation checks.'
    : 'At least one of the 14 same-column-continuation-congruent signatures splits when all legal immediate P0 action channels are observed. Therefore even the 14-class refinement is not an action-complete progress-state quotient. Retain theorem reuse/action cones locally rather than promoting these signatures to state identity; the reported cross-action fields identify the next missing dependency-cone scope.',
  theoremBoundary:'This is a bounded one-P0-event action-completeness control over the 20 exact post-repair states. It observes exact event incidence, terminality, phase location, target survival/support, and next same-column incidence. It is not recursive search and does not infer W/D/L.',
  authority:'Exact C4-0010 transitions/residuals only. No solved W/D/L labels, recursive q search, Bayesian confidence, or terminal-line cardinality premise.',
})}`);
