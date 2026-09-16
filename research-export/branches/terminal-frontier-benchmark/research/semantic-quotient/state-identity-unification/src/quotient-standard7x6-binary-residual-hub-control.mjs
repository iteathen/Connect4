#!/usr/bin/env node
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const SEEDS = Object.freeze([
  ['41414451',1,[3,6],'closed'],
  ['41444151',1,[3,6],'closed'],
  ['42634144',5,[3,6],'closed'],
  ['42674144',5,[3,6],'closed'],
  ['45212345',5,[1,5],'closed'],
  ['46656551',4,[3,6],'closed'],
  ['46656552',4,[3,6],'closed'],
  ['46656557',4,[3,6],'closed'],
  ['46656745',5,[3,6],'closed'],
  ['46673265',4,[3,7],'closed'],
  ['47444737',7,[2,5],'closed'],
  ['47474437',7,[2,5],'closed'],
  ['46656555',4,[3,6],'overflow'],
]);

function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`bad replay ${sequence}`);
    stateId = child;
  }
  return stateId;
}
function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}
function termSize([lo,hi]) { return popcount32(lo)+popcount32(hi); }
function termKey([lo,hi]) { return `${lo>>>0}:${hi>>>0}`; }
function hasCell([lo,hi], cell) { return cell < 32 ? (((lo >>> cell)&1)!==0) : (((hi >>> (cell-32))&1)!==0); }
function p0Terms(kernel,stateId) { return kernel.classes.terms(kernel.states.p0At(stateId)); }
function commonTerms(a,b) {
  const bs = new Set(b.map(termKey));
  return a.filter(term => bs.has(termKey(term)));
}
function landingCell(kernel,stateId,column) { return kernel.supportAccess.landingAt(kernel.states.supportAt(stateId),column); }
function hubFeatures(kernel,left,right) {
  const common = commonTerms(p0Terms(kernel,left),p0Terms(kernel,right));
  const cells=[];
  for(let cell=0;cell<42;cell+=1){
    const incidence=common.filter(t=>hasCell(t,cell)).length;
    if(!incidence)continue;
    const low3=common.filter(t=>termSize(t)<=3&&hasCell(t,cell)).length;
    const low2=common.filter(t=>termSize(t)<=2&&hasCell(t,cell)).length;
    const column=cell%7,row=Math.floor(cell/7);
    const la=landingCell(kernel,left,column),lb=landingCell(kernel,right,column);
    const futureA=la!==0xff&&Math.floor(la/7)<=row;
    const futureB=lb!==0xff&&Math.floor(lb/7)<=row;
    const distanceA=futureA?row-Math.floor(la/7):null;
    const distanceB=futureB?row-Math.floor(lb/7):null;
    cells.push({cell,column:column+1,row:row+1,incidence,low3,low2,futureBoth:futureA&&futureB,maxSupportDistance:futureA&&futureB?Math.max(distanceA,distanceB):null,playableBoth:la===cell&&lb===cell});
  }
  const max = key => Math.max(0,...cells.map(x=>x[key]));
  return {
    commonP0Terms: common.length,
    maxHubIncidence:max('incidence'),
    maxLow3HubIncidence:max('low3'),
    maxLow2HubIncidence:max('low2'),
    low3HubCellsAtLeast3:cells.filter(x=>x.low3>=3).length,
    futureLow3HubCellsAtLeast3:cells.filter(x=>x.low3>=3&&x.futureBoth).length,
    playableLow3HubCellsAtLeast3:cells.filter(x=>x.low3>=3&&x.playableBoth).length,
    minimumSupportDistanceForLow3Hub:Math.min(...cells.filter(x=>x.low3>=3&&x.futureBoth).map(x=>x.maxSupportDistance),Infinity),
    strongestLow3Hubs:cells.filter(x=>x.low3===max('low3')).sort((a,b)=>a.cell-b.cell),
  };
}

const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:65536,classes:262144,chunksPerSlot:65536})});
kernel.prepareSearchStorage();
const records=[];
for(const [root,witness,replies,status] of SEEDS){
  const states=replies.map(reply=>replay(kernel,`${root}${witness}${reply}`));
  records.push({root,status,witness,hardReplies:replies,features:hubFeatures(kernel,states[0],states[1])});
}
const bad=records.find(r=>r.status==='overflow');
const scalarKeys=['commonP0Terms','maxHubIncidence','maxLow3HubIncidence','maxLow2HubIncidence','low3HubCellsAtLeast3','futureLow3HubCellsAtLeast3','playableLow3HubCellsAtLeast3','minimumSupportDistanceForLow3Hub'];
const badUniqueness=scalarKeys.map(key=>({feature:key,badValue:bad.features[key],closedMatches:records.filter(r=>r.status==='closed'&&Object.is(r.features[key],bad.features[key])).map(r=>r.root)}));
console.log(`BINARY_RESIDUAL_HUB_CONTROL=${JSON.stringify({
  kind:'standard7x6-binary-residual-hub-control-v1',
  attribution:{researchDirectionAndStructuralTarget:'Josh Oshiro',formalizationImplementationAndQualification:'OpenAI ChatGPT'},
  records,
  badUniqueness,
  standaloneSeparatorExists:badUniqueness.some(x=>x.closedMatches.length===0),
  interpretation:'A hub scalar is not a theorem merely because it separates this 13-case sample. The control primarily tests whether the 4665655 residual-intersection observation generalizes at all; any separator must still receive semantic derivation and wider falsification.',
  authority:'Pure C4-0010 residual/support analysis over the frozen 13 binary seeds; no solved values or oracle calls.',
})}`);
