#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine, STANDARD7X6_REPAIR_COLUMNS as REPAIRS } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';
import { proveDistance2TargetSupportReentry } from './quotient-standard7x6-distance2-target-support-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644',C=2,G=6,C3=16,G3=20,MAX=100000;
const PARTS=14,PART=Number(process.env.PART_INDEX??'-1');
assert(Number.isInteger(PART)&&PART>=0&&PART<PARTS,`bad PART_INDEX ${process.env.PART_INDEX}`);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function isResource(msg){return msg.includes('lex proof-state cap exceeded')||msg.includes('reserved quotient');}
function buildKnown20(k,e){
 const known=new Map();
 for(const c of [{prefix:'3733',resolved:C,target:G3},{prefix:'7333',resolved:C,target:G3},{prefix:'3777',resolved:G,target:C3},{prefix:'7377',resolved:G,target:C3}]){
  const s19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));
  for(const r of REPAIRS){const s20=k.advance(s19,r);assert(s20>=0);const old=known.get(s20);if(old!==undefined)assert.equal(old,c.target);else known.set(s20,c.target);}
 }
 return known;
}

// C3 remaining target means this is the G-first family and G4 was the forced block.
const dk=makeKernel(),de=createRepairCapacityProofEngine(dk,{collectAllWinningActions:false,maxProofStates:1});
const roots=[];
for(const r1 of [0,1,2,3,4,5]){
 const s16seq=ROOT+`${G+1}${r1+1}${G+1}${G+1}`;
 const s16=replay(dk,s16seq),g4=de.landing(s16,G);assert(new Set(de.enabledSingletons(s16,1)).has(g4));
 const s17=dk.advance(s16,G);assert(s17>=0&&de.rank(s17)===17);
 for(const r2 of de.legal(s17)){
  const cell=de.landing(s17,r2),s18=dk.advance(s17,r2);
  if(s18===domain.QN_TERMINAL_WIN){assert(new Set(de.enabledSingletons(s17,1)).has(cell));continue;}
  assert(s18>=0&&de.rank(s18)===18);roots.push({r1,r2,sequence:s16seq+String(G+1)+String(r2+1),target:C3});
 }
}
roots.sort((a,b)=>a.sequence.localeCompare(b.sequence));assert.equal(roots.length,42);
const selected=roots.filter((_,i)=>i%PARTS===PART);assert.equal(selected.length,3,`partition ${PART} expected 3 roots`);

function discharge(sequence,action,reply,target){
 const k=makeKernel(),lex=createResolvedTailLexicographicProofEngine(k,{maxProofStates:MAX}),e=lex.repair,known20=buildKnown20(k,e);
 const state=replay(k,sequence),afterP0=k.advance(state,action);assert(afterP0>=0&&afterP0!==domain.QN_TERMINAL_WIN&&e.rank(afterP0)===19);
 const replyCell=e.landing(afterP0,reply),child=k.advance(afterP0,reply);
 if(child===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));return {closed:false,route:'P1_terminal',reply:e.col(reply),replyCell:e.coord(replyCell)};}
 assert(child>=0&&e.rank(child)===20);
 if(e.terminalActions(child,0).length)return {closed:true,route:'immediate_P0_terminal',reply:e.col(reply),replyCell:e.coord(replyCell)};
 const exact=known20.get(child);if(exact!==undefined&&exact===target)return {closed:true,route:'qualified_exact_rank20',reply:e.col(reply),replyCell:e.coord(replyCell)};
 const live=e.singleton(child,0,target),distance=live?e.targetDistance(child,target):null;
 try{
  if(live&&distance===1){const p=lex.prove(child,target);return p.proved?{closed:true,route:'distance1_lexicographic',reply:e.col(reply),replyCell:e.coord(replyCell),witness:p.witness??null}:{closed:false,route:'distance1_lexicographic_unproved',reply:e.col(reply),replyCell:e.coord(replyCell),measure:p.measure??null,rejected:p.rejected?.slice(0,6)??[]};}
  if(live&&distance===2){const p=proveDistance2TargetSupportReentry(k,lex,child,target);return p.proved?{closed:true,route:'distance2_target_support_reentry',reply:e.col(reply),replyCell:e.coord(replyCell),witness:p.witness,routes:p.routes}:{closed:false,route:'distance2_target_support_rejected',reply:e.col(reply),replyCell:e.coord(replyCell),firstFailure:p.firstFailure??null,routes:p.routes??{}};}
 }catch(err){const msg=String(err?.message??err);if(isResource(msg))return {closed:false,route:'resource_boundary',reply:e.col(reply),replyCell:e.coord(replyCell),error:msg};throw err;}
 return {closed:false,route:'outside_supported_contract',reply:e.col(reply),replyCell:e.coord(replyCell),targetLive:live,targetDistance:distance,enabledP1:e.enabledSingletons(child,1).map(e.coord)};
}
function classifyAction(root,action){
 const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:1}),state=replay(k,root.sequence),cell=e.landing(state,action);if(cell===0xff)return {column:e.col(action),accepted:false,reason:'full'};
 const afterP0=k.advance(state,action);if(afterP0===domain.QN_TERMINAL_WIN)return {column:e.col(action),accepted:true,kind:'P0_terminal_now'};assert(afterP0>=0&&e.rank(afterP0)===19);
 const branches=[];
 for(const reply of e.legal(afterP0)){const d=discharge(root.sequence,action,reply,root.target);branches.push(d);if(!d.closed)return {column:e.col(action),accepted:false,firstFailure:d,branches};if(typeof globalThis.gc==='function')globalThis.gc();}
 return {column:e.col(action),accepted:true,kind:'branch_complete_isolated',branches};
}
const rows=[];let resourceBranches=0;
for(const root of selected){
 const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:1}),state=replay(k,root.sequence),legal=e.legal(state),preferred=[C,0,G,1,3,4,5],order=[...new Set([...preferred,...legal])].filter(x=>legal.includes(x));
 const attempts=[];let witness=null;
 for(const a of order){const q=classifyAction(root,a);attempts.push(q);resourceBranches+=q.branches?.filter(x=>x.route==='resource_boundary').length??0;if(q.accepted){witness={column:q.column,kind:q.kind};break;}if(typeof globalThis.gc==='function')globalThis.gc();}
 rows.push({...root,closed:witness!==null,witness,attempts});
}
const closed=rows.filter(x=>x.closed),failed=rows.filter(x=>!x.closed),mechanisms={};
for(const r of failed)for(const a of r.attempts){const f=a.firstFailure;if(!f)continue;const nested=f.firstFailure?.reason??null,key=nested?`${f.route}>${nested}`:f.route;mechanisms[key]=(mechanisms[key]??0)+1;}
console.log(`C3_ENHANCED_ISOLATED_PART=${JSON.stringify({kind:'standard7x6-c3-enhanced-isolated-part-v1',part:PART,parts:PARTS,roots:selected.length,closed:closed.length,failed:failed.length,resourceBranches,mechanisms,rows:rows.map(r=>({member:`G_first:${de.col(r.r1)}->${de.col(r.r2)}`,sequence:r.sequence,closed:r.closed,witness:r.witness,attempts:r.closed?r.attempts.map(a=>({column:a.column,accepted:a.accepted,firstFailure:a.firstFailure?{route:a.firstFailure.route,reply:a.firstFailure.reply,replyCell:a.firstFailure.replyCell,targetDistance:a.firstFailure.targetDistance??a.firstFailure.firstFailure?.targetDistance??null,nested:a.firstFailure.firstFailure?.reason??null,error:a.firstFailure.error??null}:null})):r.attempts}))}));
