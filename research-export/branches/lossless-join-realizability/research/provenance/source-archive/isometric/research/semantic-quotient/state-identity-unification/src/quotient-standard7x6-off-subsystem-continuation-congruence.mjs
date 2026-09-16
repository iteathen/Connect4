#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6;
const C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const REPAIRS = Object.freeze([0, 1, 3, 4, 5]); // A,B,D,E,F

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    if (!Number.isSafeInteger(next) || next < 0) throw new Error(`bad replay ${sequence}`);
    id = next;
  }
  return id;
}
function rank(kernel, id) { return kernel.supportAccess.rankAt(kernel.states.supportAt(id)); }
function heights(kernel, id) {
  const support = kernel.states.supportAt(id);
  const out = [];
  for (let col = 0; col < 7; col++) {
    const cell = kernel.supportAccess.landingAt(support, col);
    out.push(cell === 0xff ? 6 : Math.floor(cell / 7));
  }
  return out;
}
function phaseBits(kernel, id) { return heights(kernel, id).map((h) => h & 1); }
function phaseWeight(bits) { return bits.reduce((sum, bit) => sum + bit, 0); }
function hasCell([lo, hi], cell) { return cell < 32 ? (((lo >>> cell) & 1) !== 0) : (((hi >>> (cell - 32)) & 1) !== 0); }
function cellsOf(term) { const out=[]; for(let cell=0;cell<42;cell++) if(hasCell(term,cell)) out.push(cell); return out; }
function terms(kernel, id, player) {
  const classId = player === 0 ? kernel.states.p0At(id) : kernel.states.p1At(id);
  return kernel.classes.terms(classId).map(cellsOf);
}
function coord(cell) { return `${String.fromCharCode(65 + (cell % 7))}${Math.floor(cell / 7) + 1}`; }
function colName(col) { return String.fromCharCode(65 + col); }
function termKey(term) { return term.map(coord).join('-'); }
function contains(term, cell) { return term.includes(cell); }
function cofactorKey(term, cell) { return term.filter((x) => x !== cell).map(coord).join('-'); }
function hasSingleton(kernel, id, cell) { return terms(kernel,id,0).some((term) => term.length === 1 && term[0] === cell); }
function landing(kernel, id, col) { return kernel.supportAccess.landingAt(kernel.states.supportAt(id), col); }
function sideToMove(kernel, id) { return (rank(kernel,id) & 1) === 0 ? 'P0' : 'P1'; }
function supportTail(capacity) {
  if (capacity === 0) return 'EXHAUSTED';
  if (capacity === 1) return 'ODD_TAIL_1';
  return `${capacity & 1 ? 'ODD' : 'EVEN'}_CHAIN_${capacity}`;
}
function localIncidence(kernel, id, cell) {
  if (cell === 0xff || cell === null) return null;
  const p0 = terms(kernel,id,0).filter((term) => contains(term,cell));
  const p1 = terms(kernel,id,1).filter((term) => contains(term,cell));
  return {
    cell: coord(cell),
    p0Incident: p0.map(termKey).sort(),
    p1Incident: p1.map(termKey).sort(),
    p0Cofactors: p0.map((term) => cofactorKey(term,cell)).sort(),
    p1Cofactors: p1.map((term) => cofactorKey(term,cell)).sort(),
  };
}
function originalSignature(kernel, id, beforeH, col, target) {
  const repairCell = beforeH[col] * 7 + col;
  const afterRepair = kernel.advance(id,col);
  assert(Number.isSafeInteger(afterRepair) && afterRepair >= 0);
  assert.equal(hasSingleton(kernel,afterRepair,target),true);
  const remainingCapacity = 6 - (beforeH[col] + 1);
  const p0 = terms(kernel,id,0), p1 = terms(kernel,id,1);
  return {
    repairCell,
    afterRepair,
    signature: {
      supportClass: remainingCapacity === 5 ? 'ODD_CHAIN_5' : remainingCapacity === 1 ? 'ODD_TAIL_1' : `ODD_CHAIN_${remainingCapacity}`,
      remainingCapacity,
      phaseEffect: 'TOGGLE_SELECTED_RESOURCE_BIT',
      targetEffect: 'PRESERVE_REMAINING_SINGLETON',
      followMode: remainingCapacity === 1 ? 'P0_CONSUMES_FINAL_TAIL_EVENT' : 'SAME_COLUMN_RESPONSE_AVAILABLE',
      p0Incident: p0.filter((term) => contains(term,repairCell)).map(termKey).sort(),
      p1Incident: p1.filter((term) => contains(term,repairCell)).map(termKey).sort(),
      p1Cofactors: p1.filter((term) => contains(term,repairCell)).map((term) => cofactorKey(term,repairCell)).sort(),
    },
  };
}
function stateObservation(kernel, id, repairCol, target) {
  const h = heights(kernel,id);
  const bits = phaseBits(kernel,id);
  const nextCell = landing(kernel,id,repairCol);
  const targetCol = target % 7;
  return {
    rank: rank(kernel,id),
    sideToMove: sideToMove(kernel,id),
    repairColumnCapacity: 6 - h[repairCol],
    repairSupportTail: supportTail(6 - h[repairCol]),
    phaseBits: bits.join(''),
    phaseWeight: phaseWeight(bits),
    remainingTargetSingletonLive: hasSingleton(kernel,id,target),
    remainingTargetSupportDistance: Math.max(0,2-h[targetCol]),
    nextRepairCellIncidence: nextCell === 0xff ? null : localIncidence(kernel,id,nextCell),
  };
}
function continuationObservation(kernel, afterRepair, repairCol, target) {
  const before = stateObservation(kernel,afterRepair,repairCol,target);
  const p0next = kernel.advance(afterRepair,repairCol);
  if (p0next === domain.QN_TERMINAL_WIN) {
    return { status:'P0_terminal', before, terminalMover:'P0' };
  }
  assert(Number.isSafeInteger(p0next) && p0next >= 0);
  const afterP0 = stateObservation(kernel,p0next,repairCol,target);
  if (landing(kernel,p0next,repairCol) === 0xff) {
    return { status:'column_exhausted_after_P0', before, afterP0 };
  }
  const p1next = kernel.advance(p0next,repairCol);
  if (p1next === domain.QN_TERMINAL_WIN) {
    return { status:'P1_terminal_response', before, afterP0, terminalMover:'P1' };
  }
  if (!Number.isSafeInteger(p1next) || p1next < 0) {
    return { status:'invalid_P1_same_column_response', before, afterP0 };
  }
  const afterP1 = stateObservation(kernel,p1next,repairCol,target);
  return {
    status:'nonterminal_same_column_response',
    before,
    afterP0,
    afterP1,
    twoPlyPhaseExactlyPreserved: before.phaseBits === afterP1.phaseBits,
    phaseWeightStrictlyDecreased: afterP1.phaseWeight < before.phaseWeight,
  };
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value === null || typeof value !== 'object') return value;
  const out={}; for(const key of Object.keys(value).sort()) out[key]=stable(value[key]); return out;
}
function key(value) { return JSON.stringify(stable(value)); }
function diffPaths(left,right,prefix='') {
  if (key(left) === key(right)) return [];
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object' || Array.isArray(left) || Array.isArray(right)) return [prefix || '$'];
  const paths=[];
  for(const k of [...new Set([...Object.keys(left),...Object.keys(right)])].sort()) paths.push(...diffPaths(left[k],right[k],prefix?`${prefix}.${k}`:k));
  return paths;
}

const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
  cacheEdges:true,prefixClasses:4096,responseClosure:true,
  searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072}),
});
kernel.prepareSearchStorage();

const cases=[
  {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
  {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
  {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
  {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
];
const rows=[];
for(const c of cases){
  const sequence=ROOT+c.prefix+String(c.resolved+1).repeat(3);
  const id=replay(kernel,sequence);
  const h=heights(kernel,id);
  assert.equal(rank(kernel,id),19);
  assert.equal(sideToMove(kernel,id),'P1');
  assert.equal(hasSingleton(kernel,id,c.target),true);
  for(const col of REPAIRS){
    const original=originalSignature(kernel,id,h,col,c.target);
    const continuation=continuationObservation(kernel,original.afterRepair,col,c.target);
    rows.push({
      case:c.name,
      sequence,
      repairColumn:colName(col),
      remainingTarget:coord(c.target),
      originalSignature:original.signature,
      continuation,
    });
  }
}
assert.equal(rows.length,20);

const groups=new Map();
for(const row of rows){
  const k=key(row.originalSignature);
  if(!groups.has(k)) groups.set(k,[]);
  groups.get(k).push(row);
}
assert.equal(groups.size,12,'retained local-effect class count drifted');

const classResults=[];
const splitClasses=[];
for(const [signatureKey,members] of groups){
  const variants=new Map();
  for(const member of members){
    const k=key(member.continuation);
    if(!variants.has(k)) variants.set(k,[]);
    variants.get(k).push(`${member.case}:${member.repairColumn}`);
  }
  const variantList=[...variants.entries()].map(([continuation,m])=>({continuation:JSON.parse(continuation),members:m}));
  const result={
    signature:JSON.parse(signatureKey),
    members:members.map((m)=>`${m.case}:${m.repairColumn}`),
    continuationClassCount:variantList.length,
    continuationVariants:variantList,
  };
  if(variantList.length>1){
    const separators=new Set();
    for(let i=0;i<variantList.length;i++) for(let j=i+1;j<variantList.length;j++) for(const path of diffPaths(variantList[i].continuation,variantList[j].continuation)) separators.add(path);
    result.separatingFields=[...separators].sort();
    splitClasses.push(result);
  }
  classResults.push(result);
}

const continuationClassCount=classResults.reduce((sum,c)=>sum+c.continuationClassCount,0);
const phaseWeightNonDescent=rows.filter((row)=>row.continuation.status==='nonterminal_same_column_response' && !row.continuation.phaseWeightStrictlyDecreased).map((row)=>({
  member:`${row.case}:${row.repairColumn}`,
  beforeWeight:row.continuation.before.phaseWeight,
  afterWeight:row.continuation.afterP1.phaseWeight,
  beforeBits:row.continuation.before.phaseBits,
  afterBits:row.continuation.afterP1.phaseBits,
}));

console.log(`OFF_SUBSYSTEM_CONTINUATION_CONGRUENCE=${JSON.stringify({
  kind:'standard7x6-off-subsystem-local-effect-continuation-congruence-v1',
  attribution:{
    researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',
    formalizationImplementationQualification:'OpenAI ChatGPT',
  },
  physicalTransitions:rows.length,
  retainedImmediateLocalEffectClasses:groups.size,
  continuationObservationClasses:continuationClassCount,
  splitImmediateClasses:splitClasses.length,
  graphPromotionSafeWithoutRefinement:splitClasses.length===0,
  splitClasses,
  classResults,
  phaseWeightStrictDescentCounterexamples:phaseWeightNonDescent,
  interpretation: splitClasses.length===0
    ? 'The retained 12 immediate local-effect classes are continuation-congruent for the tested exact same-column continuation observation; they may be promoted to theorem-class nodes for this bounded seam, subject to separate C/N/terminal/resource guards.'
    : 'At least one retained immediate local-effect class splits under the stronger continuation observation. The 12-class catalog is therefore not yet a sound progress-state quotient; refine by the reported separating fields before building a theorem-class transition graph.',
  theoremBoundary:'Continuation observation includes exact follow terminal/status behavior, side-to-move, support-tail state, full GF(2) defect location, remaining-target support/live state, and exact residual/cofactor incidence at the next repair-column cell. It does not assert global q equality or cover arbitrary later moves.',
  authority:'Exact C4-0010 transitions/residuals only. No solved W/D/L labels, no recursive q-frontier search, no Bayesian confidence, and no terminal-line cardinality premise.',
})}`);
