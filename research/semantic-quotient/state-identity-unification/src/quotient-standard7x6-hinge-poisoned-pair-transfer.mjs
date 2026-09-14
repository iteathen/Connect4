#!/usr/bin/env node
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const SEQUENCE='466565554644'; // zero-phase core, P0:D3, P1:D4
const C2=1*7+2,C3=2*7+2,G2=1*7+6,G3=2*7+6;
function replay(kernel,seq){let id=kernel.rootId;for(const d of seq){const n=kernel.advance(id,Number(d)-1);if(!Number.isSafeInteger(n)||n<0)throw new Error(`bad replay ${seq}`);id=n;}return id;}
function rank(kernel,id){return kernel.supportAccess.rankAt(kernel.states.supportAt(id));}
function hasCell([lo,hi],cell){return cell<32?(((lo>>>cell)&1)!==0):(((hi>>>(cell-32))&1)!==0);}
function cellsOf(term){const out=[];for(let c=0;c<42;c++)if(hasCell(term,c))out.push(c);return out;}
function terms(kernel,id,p){const cid=p===0?kernel.states.p0At(id):kernel.states.p1At(id);return kernel.classes.terms(cid).map(cellsOf);}
function coord(cell){return `${String.fromCharCode(65+(cell%7))}${Math.floor(cell/7)+1}`;}
function tkey(t){return t.map(coord).join('-');}
function intersects(term,mask){return term.some(c=>mask.has(c));}
function coverage(ts,mask){return ts.filter(t=>intersects(t,mask));}
function noCoverage(ts,mask){return ts.filter(t=>!intersects(t,mask));}
function playableSingleton(ts,cell){return ts.some(t=>t.length===1&&t[0]===cell);}

const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});
kernel.prepareSearchStorage();
const root=replay(kernel,SEQUENCE);
if(rank(kernel,root)!==12)throw new Error('rank drift');
const p0=terms(kernel,root,0);
if(!playableSingleton(p0,C3)||!playableSingleton(p0,G3)){
  // They are live singletons but not currently playable; name kept for compact helper use.
  if(!p0.some(t=>t.length===1&&t[0]===C3)||!p0.some(t=>t.length===1&&t[0]===G3))throw new Error('hinge singleton drift');
}
const fullMask=new Set();for(const r of [1,3,5])for(let c=0;c<7;c++)fullMask.add(r*7+c);
const reducedMask=new Set([...fullMask].filter(c=>c!==C2&&c!==G2));
const fullUncovered=noCoverage(p0,fullMask);
const reducedUncovered=noCoverage(p0,reducedMask);
const fullKeys=new Set(fullUncovered.map(tkey));
const transferred=reducedUncovered.filter(t=>!fullKeys.has(tkey(t)));
function privateTo(cell){const without=new Set([...fullMask].filter(c=>c!==cell));return noCoverage(p0,without).filter(t=>!fullKeys.has(tkey(t)));}

function verifyPoison(columnOneBased,target){
  const lower=kernel.advance(root,columnOneBased-1);if(lower<0)throw new Error('lower illegal/terminal');
  const upper=kernel.advance(lower,columnOneBased-1);if(upper<0)throw new Error('upper response illegal/terminal');
  const targetMove=kernel.advance(upper,columnOneBased-1);
  return {column:columnOneBased,triggerLanding:coord(columnOneBased===3?7+2:7+6),responseLanding:coord(columnOneBased===3?C2:G2),target:coord(target),targetMoveIsImmediateP0Terminal:targetMove===domain.QN_TERMINAL_WIN};
}

console.log(`HINGE_POISON_TRANSFER=${JSON.stringify({
  kind:'standard7x6-hinge-poisoned-vertical-pair-defect-transfer-v1',
  attribution:{researchDirectionInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  sequence:SEQUENCE,
  supportRank:rank(kernel,root),
  liveHingeSingletons:['C3','G3'],
  poisonChecks:[verifyPoison(3,C3),verifyPoison(7,G3)],
  p0ResidualCount:p0.length,
  fullVerticalResponseMaskUncovered:fullUncovered.map(tkey),
  fullVerticalResponseMaskUncoveredCount:fullUncovered.length,
  reducedMaskRemovedContracts:['C1->C2','G1->G2'],
  reducedMaskUncovered:reducedUncovered.map(tkey),
  reducedMaskUncoveredCount:reducedUncovered.length,
  transferredDefects:transferred.map(tkey),
  transferredDefectCount:transferred.length,
  privateCoverage:{C2:privateTo(C2).map(tkey),G2:privateTo(G2).map(tkey)},
  theoremBoundary:'The poison check is an exact three-transition local theorem: if P0 triggers the old lower cell and P1 takes the old vertical response, P0 has an immediate terminal target move. Removing those two response contracts from the static response mask reports only which residual coverage depended on them; it does not by itself prove a replacement policy impossible.',
  authority:'Pure C4-0010 transitions/residuals. No external W/D/L labels and no recursive search.'
})}`);
