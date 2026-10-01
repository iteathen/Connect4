#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const SOURCE='CPC_RANK20_FORCED_C3_TARGET_DISTANCE_LEGACY_REENTRY_PROBE_0_1.json';
const root=resolve(import.meta.dirname,'../../../..');
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const CAP=100000;

const {createSlot64ResidualQuotientKernel}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const {createGenericTargetDistanceMuProofEngine}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-generic-target-distance-mu-proof-lib.mjs')).href);
const {createGenericTargetAuxLexProofEngine}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-generic-target-aux-lex-proof-lib.mjs')).href);
const {createResolvedTailLexicographicProofEngine}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs')).href);
const {proveDistance2TargetSupportReentry}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-distance2-target-support-proof-lib.mjs')).href);
const {createResolvedTailCapacityProofEngine}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-resolved-tail-proof-lib.mjs')).href);

function makeKernel(){
 const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});
 kernel.prepareSearchStorage();return kernel;
}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,'bad replay '+s);}return id;}
function errKind(e){const m=String(e?.message??e);if(m.includes('reserved quotient'))return 'quotient_capacity';if(m.includes('proof-state cap exceeded'))return 'proof_capacity';return 'execution_error';}
function compact(out,stats,measure){
 return {proved:out?.proved===true,proofKind:out?.kind??null,witness:out?.witness??null,witnessKind:out?.witnessKind??out?.witnessRole??null,measure:out?.measure??measure??null,obligations:out?.obligations??[],forcedDefense:out?.forcedDefense??null,rejected:(out?.rejected??[]).slice(0,16),firstFailure:out?.firstFailure??null,routes:out?.routes??null,stats,resourceFailure:null};
}
function runEngine(kind,sequence,target,distance){
 const k=makeKernel(),state=replay(k,sequence);
 if(kind==='LAMBDA'){
  const e=createGenericTargetDistanceMuProofEngine(k,{maxProofStates:CAP,maxTargetDistance:5});
  try{return {engine:kind,applicable:true,...compact(e.prove(state,target),e.stats(),e.measure(state,target))};}
  catch(error){return {engine:kind,applicable:true,proved:false,proofKind:null,resourceFailure:{kind:errKind(error),message:String(error?.message??error)},stats:e.stats()};}
 }
 if(kind==='THETA'){
  const e=createGenericTargetAuxLexProofEngine(k,{maxProofStates:CAP,maxTargetDistance:5});
  try{return {engine:kind,applicable:true,...compact(e.prove(state,target),e.stats(),e.measure(state,target))};}
  catch(error){return {engine:kind,applicable:true,proved:false,proofKind:null,resourceFailure:{kind:errKind(error),message:String(error?.message??error)},stats:e.stats()};}
 }
 if(kind==='DISTANCE2_TARGET_SUPPORT'){
  if(distance!==2)return {engine:kind,applicable:false,reason:'target_distance_not_2',proved:false,resourceFailure:null};
  const lex=createResolvedTailLexicographicProofEngine(k,{maxProofStates:CAP});
  try{return {engine:kind,applicable:true,...compact(proveDistance2TargetSupportReentry(k,lex,state,target),lex.stats(),null)};}
  catch(error){return {engine:kind,applicable:true,proved:false,proofKind:null,resourceFailure:{kind:errKind(error),message:String(error?.message??error)},stats:lex.stats()};}
 }
 if(kind==='DISTANCE1_RESOLVED_TAIL_CAPACITY'){
  if(distance!==1)return {engine:kind,applicable:false,reason:'target_distance_not_1',proved:false,resourceFailure:null};
  const e=createResolvedTailCapacityProofEngine(k,{maxProofStates:CAP});
  try{
   const out=e.prove(state,target);
   return {engine:kind,applicable:true,proved:out.proved===true,proofKind:out.kind,witness:out.witness??null,witnessKind:out.witnessKind??out.witnessRole??null,measure:{nu:out.nu??e.nu(state,target)},obligations:[],forcedDefense:null,rejected:(out.rejected??[]).slice(0,16),firstFailure:null,routes:null,stats:e.stats(),resourceFailure:null};
  }catch(error){return {engine:kind,applicable:true,proved:false,proofKind:null,resourceFailure:{kind:errKind(error),message:String(error?.message??error)},stats:e.stats()};}
 }
 throw new Error('unknown engine '+kind);
}

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank20_forced_c3_target_distance_legacy_reentry_probe.v1');
assert.equal(source.states.length,3);
assert.equal(source.summary.provedCount,0);
assert.equal(source.summary.resourceFailureCount,0);
const order=['LAMBDA','THETA','DISTANCE2_TARGET_SUPPORT','DISTANCE1_RESOLVED_TAIL_CAPACITY'];
const states=[];
let resourceFailureCount=0;
for(const s of source.states){
 assert.equal(s.childExactBridge.pass,true);
 const engines=order.map(kind=>runEngine(kind,s.childSequence,s.target.cell,s.targetDistance));
 resourceFailureCount+=engines.filter(x=>x.resourceFailure).length;
 const legacyUnionClosed=engines.some(x=>x.applicable&&x.proved);
 states.push({id:s.id,childSequence:s.childSequence,target:s.target,targetDistance:s.targetDistance,engines,legacyUnionClosed,closingEngines:engines.filter(x=>x.proved).map(x=>x.engine),enclosingStateCompositionReady:legacyUnionClosed&&s.sourceCpcForcedColumn===3});
}
const closed=states.filter(x=>x.legacyUnionClosed).map(x=>x.id);
console.log(JSON.stringify({
 schema:'connect4.cpc_rank20_forced_c3_legacy_proof_family_matrix.v1',
 date:'2026-10-01',
 sourceEvidence:SOURCE,
 oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
 productionCpcModified:false,jsMinSysModified:false,bsfpModified:false,
 states,
 summary:{stateCount:states.length,legacyUnionClosedCount:closed.length,legacyUnionClosedIds:closed,compositionReadyIds:states.filter(x=>x.enclosingStateCompositionReady).map(x=>x.id),resourceFailureCount,logicalAllFamilyRejectionIds:states.filter(x=>!x.legacyUnionClosed&&!x.engines.some(e=>e.resourceFailure)).map(x=>x.id)},
 conclusion:[
  'This matrix queries the remaining reusable generic legacy proof engines whose guards apply to the exact forced-c3 rank-28 children.',
  closed.length?'At least one exact child is closed by a previously existing proof family omitted from the newer RCIC route catalog.':'Every applicable legacy engine completed without closing any exact child; the obstruction survives this generic legacy proof-family audit.',
  'Inapplicable theorem families are recorded as inapplicable rather than counted as failures; resource failures remain unknown.'
 ],
 boundary:[
  'This is research-side proof-library monotonicity evidence only and does not by itself certify the rank-20 root.',
  'No oracle, solved W/D/L, minimax, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
  'Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.'
 ]
},null,2));
