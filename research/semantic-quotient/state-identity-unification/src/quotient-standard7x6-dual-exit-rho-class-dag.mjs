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
const MAX_NEUTRAL_STATES=100000,MAX_RHO_STATES=100000;
const refusalName=process.argv[2],firstActionName=process.argv[3]||null;
if(!(refusalName in REFUSALS))throw new Error('usage: dual-exit-rho-class-dag <D|E|F> [A-G]');
if(firstActionName&&!/^[A-G]$/.test(firstActionName))throw new Error('first action must be A-G');
const firstAction=firstActionName?firstActionName.charCodeAt(0)-65:null;

function stable(v){if(Array.isArray(v))return v.map(stable);if(v===null||typeof v!=='object')return v;const o={};for(const k of Object.keys(v).sort())o[k]=stable(v[k]);return o;}
function key(v){return JSON.stringify(stable(v));}
function replay(k,s){let id=k.rootId;for(const d of s){const n=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(n)&&n>=0,`bad replay ${s}`);id=n;}return id;}
function col(c){return String.fromCharCode(65+c);}
function coord(x){return `${col(x%7)}${Math.floor(x/7)+1}`;}
function phase(e,id){return e.heights(id).map(h=>h&1).join('');}
function capacities(e,id){const h=e.heights(id);return REPAIR.map(c=>6-h[c]);}
function enabled(e,id,p){return e.enabledSingletons(id,p).map(coord).sort();}
function terminals(e,id,p){return e.terminalActions(id,p).map(x=>coord(x.cell)).sort();}
function lexLess(a,b){return a.delta<b.delta||(a.delta===b.delta&&a.mu<b.mu);}
function lexLe(a,b){return a.delta<b.delta||(a.delta===b.delta&&a.mu<=b.mu);}
function measureCmp(a,b){return a.delta-b.delta||a.mu-b.mu;}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});k.prepareSearchStorage();
const rho=createResolvedTailLexicographicProofEngine(k,{maxProofStates:1});
const e=rho.repair;
function neutral(id){return (e.rank(id)&1)===1&&e.singleton(id,0,C3)&&e.singleton(id,0,G3)&&e.targetDistance(id,C3)===1&&e.targetDistance(id,G3)===1&&e.enabledSingletons(id,0).length===0&&e.enabledSingletons(id,1).length===0&&e.terminalActions(id,1).length===0;}

function collectExits(){
 const activated=replay(k,ROOT+'3'),rcol=REFUSALS[refusalName],refusal=k.advance(activated,rcol);assert(refusal>=0&&refusal!==domain.QN_TERMINAL_WIN);assert.equal(e.landing(refusal,G),G);const entry=k.advance(refusal,G);assert(entry>=0&&entry!==domain.QN_TERMINAL_WIN&&neutral(entry));const entrySeq=ROOT+'3'+String(rcol+1)+'7';
 const seen=new Map([[entry,entrySeq]]),queue=[entry],exits=new Map();
 while(queue.length){const state=queue.pop(),seq=seen.get(state),beforeMu=e.mu(state);const actions=state===entry&&firstAction!==null?[firstAction]:e.legal(state);for(const a of actions){const afterP1=k.advance(state,a),s1=seq+String(a+1);if(afterP1===domain.QN_TERMINAL_WIN)continue;assert(afterP1>=0);if(e.terminalActions(afterP1,0).length)continue;let repair=false;for(const r of REPAIR){const rc=e.landing(afterP1,r);if(rc===0xff)continue;const afterP0=k.advance(afterP1,r);if(afterP0===domain.QN_TERMINAL_WIN){repair=true;continue;}if(afterP0>=0&&neutral(afterP0)&&e.mu(afterP0)<beforeMu){repair=true;if(!seen.has(afterP0)){if(seen.size>=MAX_NEUTRAL_STATES)throw new Error(`neutral DAG cap exceeded ${MAX_NEUTRAL_STATES}`);seen.set(afterP0,s1+String(r+1));queue.push(afterP0);}}}if(!repair&&!exits.has(afterP1))exits.set(afterP1,s1);}}
 return [...exits.entries()].map(([state,sequence])=>({state,sequence}));
}
function rhoActions(id,target){const out=[...REPAIR],resolved=rho.resolvedColumn(target);if(rho.measure(id,target).delta>0&&!out.includes(resolved))out.push(resolved);return [...new Set(out)];}
function dualOrder(root,sequence,attack,target,other){
 const support=e.landing(root,attack);if(support===0xff)return {closedWithoutRho:false,valid:false,reason:'support_full'};
 const afterP0=k.advance(root,attack);if(afterP0===domain.QN_TERMINAL_WIN)return {closedWithoutRho:true,valid:true,reason:'P0_terminal_support'};
 assert(afterP0>=0);let block=null;for(const reply of e.legal(afterP0)){const cell=e.landing(afterP0,reply),child=k.advance(afterP0,reply);if(child===domain.QN_TERMINAL_WIN)return {closedWithoutRho:false,valid:false,reason:'P1_terminal_override',reply:col(reply)};if(cell!==target){if(!terminals(e,child,0).includes(coord(target)))return {closedWithoutRho:false,valid:false,reason:'nonblock_without_target_terminal',reply:col(reply)};continue;}const live=e.singleton(child,0,other),distance=live?e.targetDistance(child,other):null;if(!live||distance!==1)return {closedWithoutRho:false,valid:false,reason:'block_destroyed_other_target'};block={state:child,target:other,sequence:sequence+String(attack+1)+String(reply+1)};}
 assert(block,'exact target block reply missing');return {closedWithoutRho:false,valid:true,block};
}

const exits=collectExits();
const orders=[];const seeds=new Map();
function seed(block){const id=`${block.state}:${block.target}`;if(!seeds.has(id))seeds.set(id,block);return id;}
for(const x of exits){const g=dualOrder(x.state,x.sequence,G,G3,C3),c=dualOrder(x.state,x.sequence,C,C3,G3);orders.push({sequence:x.sequence,G:g.valid?(g.closedWithoutRho?{kind:'closed'}:{kind:'rho',seed:seed(g.block)}):{kind:'invalid',reason:g.reason},C:c.valid?(c.closedWithoutRho?{kind:'closed'}:{kind:'rho',seed:seed(c.block)}):{kind:'invalid',reason:c.reason}});}

const nodes=new Map(),queue=[...seeds.values()];
function nodeId(state,target){return `${state}:${target}`;}
while(queue.length){const item=queue.pop(),id=nodeId(item.state,item.target);if(nodes.has(id))continue;if(nodes.size>=MAX_RHO_STATES)throw new Error(`rho DAG cap exceeded ${MAX_RHO_STATES}`);const state=item.state,target=item.target,measure=rho.measure(state,target);const immediate=terminals(e,state,0);if(immediate.length){nodes.set(id,{id,state,target,sequence:item.sequence,measure,immediate,actions:[]});continue;}assert.equal(e.invariant(state,target),true,`${item.sequence}: rho seed/dependency outside invariant`);const actions=[];for(const a of rhoActions(state,target)){const cell=e.landing(state,a);if(cell===0xff)continue;const afterP0=k.advance(state,a);if(afterP0===domain.QN_TERMINAL_WIN){actions.push({action:a,cell,route:'P0_terminal',replies:[]});continue;}assert(afterP0>=0);const m0=rho.measure(afterP0,target);assert(lexLess(m0,measure),'rho action failed strict descent');const replies=[];for(const b of e.legal(afterP0)){const bcell=e.landing(afterP0,b),child=k.advance(afterP0,b);if(child===domain.QN_TERMINAL_WIN){replies.push({reply:b,cell:bcell,route:'P1_terminal'});continue;}assert(child>=0);const m1=rho.measure(child,target);assert(lexLe(m1,m0),'P1 reply increased rho');const nextTerminal=terminals(e,child,0);if(nextTerminal.length){replies.push({reply:b,cell:bcell,route:'P0_terminal_next',terminalCells:nextTerminal,measure:m1});continue;}if(!e.invariant(child,target)){replies.push({reply:b,cell:bcell,route:'outside_rho',measure:m1,targetLive:e.singleton(child,0,target),targetDistance:e.singleton(child,0,target)?e.targetDistance(child,target):null});continue;}const childSeq=item.sequence+String(a+1)+String(b+1),childId=nodeId(child,target);replies.push({reply:b,cell:bcell,route:'child',childId,measure:m1});if(!nodes.has(childId))queue.push({state:child,target,sequence:childSeq});}actions.push({action:a,cell,route:'nonterminal',afterP0Measure:m0,replies});}nodes.set(id,{id,state,target,sequence:item.sequence,measure,immediate:[],actions});}

const sorted=[...nodes.values()].sort((a,b)=>measureCmp(a.measure,b.measure)||a.sequence.localeCompare(b.sequence));
const classByKey=new Map(),classById=new Map(),classes=[];
for(const n of sorted){let proved=false,witness=null;const actionShapes=[];if(n.immediate.length){proved=true;witness='immediate';}else for(const a of n.actions){let accepted=a.route==='P0_terminal';const replyShapes=[];if(a.route==='nonterminal'){accepted=true;for(const r of a.replies){if(r.route==='P1_terminal'||r.route==='outside_rho'){accepted=false;replyShapes.push({reply:col(r.reply),route:r.route,measure:r.measure??null,targetLive:r.targetLive??null,targetDistance:r.targetDistance??null});continue;}if(r.route==='P0_terminal_next'){replyShapes.push({reply:col(r.reply),route:r.route,measure:r.measure,terminalCells:r.terminalCells});continue;}const childClass=classById.get(r.childId);assert(childClass,`child class missing for ${r.childId}`);if(!childClass.proved)accepted=false;replyShapes.push({reply:col(r.reply),route:'child',measure:r.measure,childClass:childClass.classId,childProved:childClass.proved});}}const shape={action:col(a.action),cell:coord(a.cell),route:a.route,afterP0Measure:a.afterP0Measure??null,replies:replyShapes};actionShapes.push(shape);if(accepted&&witness===null){proved=true;witness=col(a.action);}}
 const descriptor={target:n.target===C3?'C3':'G3',measure:n.measure,phaseBits:phase(e,n.state),repairCapacities:capacities(e,n.state),enabledP0:enabled(e,n.state,0),enabledP1:enabled(e,n.state,1),immediate:n.immediate,actions:actionShapes};const dk=key(descriptor);let cls=classByKey.get(dk);if(!cls){cls={classId:classes.length,descriptor,proved,witness,members:0,representative:n.sequence};classByKey.set(dk,cls);classes.push(cls);}else{assert.equal(cls.proved,proved,'canonical class proof result drift');assert.equal(cls.witness,witness,'canonical class witness drift');}cls.members++;classById.set(n.id,cls);}

let closed=0,open=0,gWins=0,cWins=0;const openSamples=[];
for(const o of orders){const evalOrder=x=>x.kind==='closed'?true:x.kind==='rho'?classById.get(x.seed)?.proved===true:false;const g=evalOrder(o.G),c=evalOrder(o.C);if(g||c){closed++;if(g)gWins++;else cWins++;}else{open++;if(openSamples.length<20)openSamples.push({sequence:o.sequence,G:o.G.kind==='rho'?{classId:classById.get(o.G.seed)?.classId,proved:classById.get(o.G.seed)?.proved}:o.G,C:o.C.kind==='rho'?{classId:classById.get(o.C.seed)?.classId,proved:classById.get(o.C.seed)?.proved}:o.C});}}
const proofClasses=classes.filter(x=>x.proved).length;const maxClassSize=Math.max(0,...classes.map(x=>x.members));
console.log(`DUAL_EXIT_RHO_CLASS_DAG=${JSON.stringify({kind:'standard7x6-dual-exit-rho-class-dag-v1',attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},refusal:refusalName,firstP1Action:firstActionName,exactDualExits:exits.length,uniqueBlockSeeds:seeds.size,rhoStates:nodes.size,rhoStructuralClasses:classes.length,provedRhoClasses:proofClasses,unprovedRhoClasses:classes.length-proofClasses,maxRhoClassSize:maxClassSize,dualExitsClosed:closed,dualExitsOpen:open,GFirstClosures:gWins,CFirstFallbackClosures:cWins,allDualExitsClosed:open===0,openSamples,largestRhoClasses:[...classes].sort((a,b)=>b.members-a.members).slice(0,20).map(x=>({classId:x.classId,members:x.members,proved:x.proved,witness:x.witness,representative:x.representative,measure:x.descriptor.measure,target:x.descriptor.target})),interpretation:open===0?'Every exact dual exit in this execution shard is structurally closed. The rho subproofs are solved once as a well-founded exact dependency DAG and canonically merged only when their full recursive proof-transition descriptors agree.':'Some exact dual exits remain open under the exact rho class DAG. Preserve the reported representatives as the next structural separators; open is not loss.',theoremBoundary:'The rho DAG is not unrestricted game-tree search. It expands only the already-qualified rho=(delta,mu) dependency relation from exact forced-block leaves; every dependency strictly descends rho. Canonical classes include the recursively resolved child class structure, so class reuse is proof-transition congruence for this rho claim, not q equality. Neutral-DAG first-action sharding is execution hygiene only.',authority:'Exact C4-0010 transitions/terminal facts plus the qualified rho action schema under unchanged 100000 dependency-state and quotient-storage bounds. No solved W/D/L labels, external oracle, deadline reset, or arbitrary q-frontier recursion.'})}`);
