#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644';
const C=2,G=6,C3=16,G3=20;
const REPAIR=Object.freeze([0,1,3,4,5]);
const REFUSALS=Object.freeze({D:3,E:4,F:5});
const MAX_NEUTRAL_STATES=100000;
const refusalName=process.argv[2];
const firstActionName=process.argv[3]||null;
if(!(refusalName in REFUSALS))throw new Error('usage: dual-exit-theorem-class-census <D|E|F> [A-G]');
if(firstActionName&&!/^[A-G]$/.test(firstActionName))throw new Error('first action must be A-G');
const firstAction=firstActionName?firstActionName.charCodeAt(0)-65:null;

function stable(v){if(Array.isArray(v))return v.map(stable);if(v===null||typeof v!=='object')return v;const o={};for(const k of Object.keys(v).sort())o[k]=stable(v[k]);return o;}
function key(v){return JSON.stringify(stable(v));}
function replay(k,s){let id=k.rootId;for(const d of s){const n=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(n)&&n>=0,`bad replay ${s}`);id=n;}return id;}
function col(c){return String.fromCharCode(65+c);}
function coord(x){return `${col(x%7)}${Math.floor(x/7)+1}`;}
function has([lo,hi],x){return x<32?(((lo>>>x)&1)!==0):(((hi>>>(x-32))&1)!==0);}
function cells(term){const out=[];for(let x=0;x<42;x++)if(has(term,x))out.push(x);return out;}
function terms(k,id,p){const q=p===0?k.states.p0At(id):k.states.p1At(id);return k.classes.terms(q).map(cells);}
function termKey(t){return t.map(coord).join('-');}
function contains(t,x){return t.includes(x);}
function cofactorKey(t,x){return t.filter(y=>y!==x).map(coord).join('-');}
function phase(e,id){return e.heights(id).map(h=>h&1).join('');}
function capacities(e,id){const h=e.heights(id);return REPAIR.map(c=>6-h[c]);}
function terminalCells(e,id,p){return e.terminalActions(id,p).map(x=>coord(x.cell)).sort();}
function enabled(e,id,p){return e.enabledSingletons(id,p).map(coord).sort();}
function localIncidence(k,e,id,c){const x=e.landing(id,c);if(x===0xff)return {column:col(c),full:true};const p0=terms(k,id,0).filter(t=>contains(t,x));const p1=terms(k,id,1).filter(t=>contains(t,x));return {column:col(c),cell:coord(x),capacity:6-e.heights(id)[c],p0Incident:p0.map(termKey).sort(),p1Incident:p1.map(termKey).sort(),p0Cofactors:p0.map(t=>cofactorKey(t,x)).sort(),p1Cofactors:p1.map(t=>cofactorKey(t,x)).sort()};}
function lexLess(a,b){return a.delta<b.delta||(a.delta===b.delta&&a.mu<b.mu);}
function lexLe(a,b){return a.delta<b.delta||(a.delta===b.delta&&a.mu<=b.mu);}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});k.prepareSearchStorage();
const rho=createResolvedTailLexicographicProofEngine(k,{maxProofStates:1});
const e=rho.repair;

function neutral(id){
 if((e.rank(id)&1)!==1)return false;
 if(!e.singleton(id,0,C3)||!e.singleton(id,0,G3))return false;
 if(e.targetDistance(id,C3)!==1||e.targetDistance(id,G3)!==1)return false;
 if(e.enabledSingletons(id,0).length||e.enabledSingletons(id,1).length)return false;
 if(e.terminalActions(id,1).length)return false;
 return true;
}
function collectExits(){
 const activated=replay(k,ROOT+'3');const rcol=REFUSALS[refusalName];const refusal=k.advance(activated,rcol);assert(refusal>=0&&refusal!==domain.QN_TERMINAL_WIN);assert.equal(e.landing(refusal,G),G);const entry=k.advance(refusal,G);assert(entry>=0&&entry!==domain.QN_TERMINAL_WIN&&neutral(entry));const entrySeq=ROOT+'3'+String(rcol+1)+'7';
 const seen=new Map([[entry,entrySeq]]),queue=[entry],exits=new Map();
 while(queue.length){const state=queue.pop(),seq=seen.get(state),beforeMu=e.mu(state);const actions=state===entry&&firstAction!==null?[firstAction]:e.legal(state);for(const a of actions){const afterP1=k.advance(state,a);const s1=seq+String(a+1);if(afterP1===domain.QN_TERMINAL_WIN)continue;assert(afterP1>=0);if(e.terminalActions(afterP1,0).length)continue;let repair=false;for(const r of REPAIR){const cell=e.landing(afterP1,r);if(cell===0xff)continue;const afterP0=k.advance(afterP1,r);if(afterP0===domain.QN_TERMINAL_WIN){repair=true;continue;}if(afterP0>=0&&neutral(afterP0)&&e.mu(afterP0)<beforeMu){repair=true;if(!seen.has(afterP0)){if(seen.size>=MAX_NEUTRAL_STATES)throw new Error('neutral DAG cap exceeded');seen.set(afterP0,s1+String(r+1));queue.push(afterP0);}}}if(!repair&&!exits.has(afterP1))exits.set(afterP1,s1);}}
 return [...exits.entries()].map(([state,sequence])=>({state,sequence}));
}
function allowedRhoActions(id,target){const out=[...REPAIR];const resolved=rho.resolvedColumn(target);if(rho.measure(id,target).delta>0&&!out.includes(resolved))out.push(resolved);return [...new Set(out)];}
function rhoBase(id,target){return {target:target===C3?'C3':'G3',measure:rho.measure(id,target),phaseBits:phase(e,id),repairCapacities:capacities(e,id),enabledP0:enabled(e,id,0),enabledP1:enabled(e,id,1),candidates:allowedRhoActions(id,target).map(c=>localIncidence(k,e,id,c))};}
function rhoOnePly(id,target){
 const before=rho.measure(id,target);const actions=[];
 for(const a of allowedRhoActions(id,target)){
  const cell=e.landing(id,a);if(cell===0xff)continue;const afterP0=k.advance(id,a);if(afterP0===domain.QN_TERMINAL_WIN){actions.push({action:col(a),cell:coord(cell),route:'P0_terminal'});continue;}assert(afterP0>=0);const m0=rho.measure(afterP0,target);const descent=lexLess(m0,before);const replies=[];for(const b of e.legal(afterP0)){const bcell=e.landing(afterP0,b),child=k.advance(afterP0,b);if(child===domain.QN_TERMINAL_WIN){replies.push({reply:col(b),cell:coord(bcell),route:'P1_terminal'});continue;}const m1=rho.measure(child,target);const immediate=terminalCells(e,child,0);if(immediate.length){replies.push({reply:col(b),cell:coord(bcell),route:'P0_terminal_next',terminalCells:immediate,measure:m1});continue;}const inv=e.invariant(child,target);replies.push({reply:col(b),cell:coord(bcell),route:inv?'rho_child':'outside_rho',measure:m1,nonincrease:lexLe(m1,m0),targetLive:e.singleton(child,0,target),targetDistance:e.singleton(child,0,target)?e.targetDistance(child,target):null,phaseBits:phase(e,child),repairCapacities:capacities(e,child),enabledP0:enabled(e,child,0),enabledP1:enabled(e,child,1)});}actions.push({action:col(a),cell:coord(cell),route:'nonterminal',afterP0Measure:m0,strictDescent:descent,replies});
 }
 return {before,actions};
}
function targetOrder(id,attack,target,other,mode){
 const out={attack:target===C3?'C3':'G3'};
 if((e.rank(id)&1)!==0)return {...out,status:'not_P0_turn'};
 if(!e.singleton(id,0,target)||!e.singleton(id,0,other))return {...out,status:'dual_target_not_live'};
 if(e.targetDistance(id,target)!==1||e.targetDistance(id,other)!==1)return {...out,status:'dual_target_not_distance_one'};
 const support=e.landing(id,attack),expectedSupport=target-7;out.support=support===0xff?null:coord(support);
 if(support===0xff)return {...out,status:'support_full'};
 if(support!==expectedSupport)return {...out,status:'attack_support_not_direct',expectedSupport:coord(expectedSupport)};
 const afterP0=k.advance(id,attack);if(afterP0===domain.QN_TERMINAL_WIN)return {...out,status:'P0_terminal_support'};assert(afterP0>=0);
 if(e.landing(afterP0,attack)!==target)return {...out,status:'attack_target_not_exposed_after_support'};
 const replies=[];let block=null;for(const b of e.legal(afterP0)){const bcell=e.landing(afterP0,b),child=k.advance(afterP0,b);if(child===domain.QN_TERMINAL_WIN){replies.push({reply:col(b),cell:coord(bcell),route:'P1_terminal'});continue;}if(bcell!==target){const term=terminalCells(e,child,0);replies.push({reply:col(b),cell:coord(bcell),route:term.includes(coord(target))?'nonblock_target_terminal':'nonblock_no_target_terminal',terminalCells:term});continue;}const live=e.singleton(child,0,other),dist=live?e.targetDistance(child,other):null;block={reply:col(b),cell:coord(bcell),otherTarget:other===C3?'C3':'G3',otherLive:live,otherDistance:dist,base:live&&dist===1?rhoBase(child,other):null,continuation:mode==='continuation'&&live&&dist===1?rhoOnePly(child,other):null};replies.push({reply:col(b),cell:coord(bcell),route:'target_block'});}return {...out,status:'nonterminal',phaseAfterSupport:phase(e,afterP0),p1TerminalSurface:terminalCells(e,afterP0,1),replies,block};
}
function proposal(id){return {phaseBits:phase(e,id),repairCapacities:capacities(e,id),enabledP0:enabled(e,id,0),enabledP1:enabled(e,id,1),CFirst:targetOrder(id,C,C3,G3,'base'),GFirst:targetOrder(id,G,G3,C3,'base')};}
function continuation(id){return {CFirst:targetOrder(id,C,C3,G3,'continuation'),GFirst:targetOrder(id,G,G3,C3,'continuation')};}

const exits=collectExits();
const groups=new Map();
for(const row of exits){const sig=proposal(row.state),k0=key(sig);if(!groups.has(k0))groups.set(k0,{signature:sig,members:[]});groups.get(k0).members.push(row);}
const classes=[];let splitClasses=0;let maxClassSize=0;let continuationClasses=0;
for(const g of groups.values()){const variants=new Map();for(const m of g.members){const fp=continuation(m.state),kf=key(fp);if(!variants.has(kf))variants.set(kf,{fingerprint:fp,members:[]});variants.get(kf).members.push(m.sequence);}continuationClasses+=variants.size;maxClassSize=Math.max(maxClassSize,g.members.length);if(variants.size>1)splitClasses++;classes.push({size:g.members.length,continuationClassCount:variants.size,representative:g.members[0].sequence,variantRepresentatives:[...variants.values()].map(v=>({size:v.members.length,representative:v.members[0]}))});}
classes.sort((a,b)=>b.size-a.size||a.representative.localeCompare(b.representative));
const hasDualExits=exits.length>0;const promotionSafeAtOnePly=hasDualExits&&splitClasses===0;
console.log(`DUAL_EXIT_THEOREM_CLASS_CENSUS=${JSON.stringify({kind:'standard7x6-dual-exit-theorem-class-census-v2',attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},refusal:refusalName,firstP1Action:firstActionName,exactDualExits:exits.length,hasDualExits,proposedClasses:groups.size,continuationClasses,splitClasses,maxClassSize,largestClasses:classes.slice(0,20),promotionSafeAtOnePly,interpretation:!hasDualExits?'This execution shard contains no dual-exit theorem instances. One-ply promotion is deliberately false rather than vacuously true.':splitClasses===0?'Every proposed claim-interface class is continuation-congruent through the complete dual-target shell and one exact rho ply. This is necessary but not sufficient for recursive theorem reuse; recursive class closure remains to be qualified.':'At least one proposed class splits under exact continuation. Refine using the continuation separators before any theorem reuse.',theoremBoundary:'Groups exact dual exits only by the declared target/support/rho claim interface, with each target order requiring both targets live at distance one and the selected support event exactly below the attacked target, then checks complete target-order responses and one exact rho continuation ply. No class is treated as q equality or as a proved W/L theorem. One-ply congruence is only a prerequisite for recursive theorem-class promotion, and coverage-empty shards are never promotion-safe.',authority:'Exact C4-0010 transitions/residual incidence, terminal surfaces, and rho=(delta,mu) interface under unchanged quotient bounds. No solved labels, external oracle, or recursive q-frontier search.'})}`);
