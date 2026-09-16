#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644',C=2,G=6,C3=16,G3=20;
const RESIDUAL=new Set([
 '466565554644323332','466565554644353336','466565554644363335','466565554644343335',
 '466565554644353334','466565554644353333','466565554644343333','466565554644323336',
 '466565554644363332','466565554644323335','466565554644353332','466565554644323334',
 '466565554644343332','466565554644323333','466565554644313334','466565554644343331',
 '466565554644313333','466565554644757774','466565554644757776','466565554644757777',
 '466565554644747775','466565554644767775',
]);
assert.equal(RESIDUAL.size,22);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function resolved(target){return target===G3?C:G;}
function role(column,target){return column===target%7?'target':column===resolved(target)?'resolved':'repair';}
function bump(o,k,n=1){o[k]=(o[k]??0)+n;}
function lexLess(a,b){return a.delta<b.delta||(a.delta===b.delta&&a.mu<b.mu);}
const k=makeKernel(),e=createRepairCapacityProofEngine(k,{maxProofStates:1});
function measure(state,target){return {delta:Math.max(0,6-e.heights(state)[resolved(target)]),mu:e.mu(state)};}

const roots=[];
for(const fam of [
 {family:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
 {family:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of fam.replies1){
 const s16seq=ROOT+`${fam.resolved+1}${r1+1}${fam.resolved+1}${fam.resolved+1}`;
 const s16=replay(k,s16seq);assert.equal(e.rank(s16),16);
 const s17=k.advance(s16,fam.resolved);assert(s17>=0&&e.rank(s17)===17);
 for(const r2 of e.legal(s17)){
  const cell=e.landing(s17,r2),s18=k.advance(s17,r2);
  if(s18===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(s17,1)).has(cell));continue;}
  const sequence=s16seq+String(fam.resolved+1)+String(r2+1);
  roots.push({sequence,state:s18,target:fam.target,label:RESIDUAL.has(sequence)?'residual':'qualified_positive'});
 }
}
assert.equal(roots.length,84);assert.equal(roots.filter(x=>x.label==='residual').length,22);

function forcedProfile(state,target){
 if(e.terminalActions(state,0).length)return null;
 const obligations=[...new Set(e.enabledSingletons(state,1))];
 if(obligations.length!==1)return null;
 const threat=obligations[0],column=threat%7;
 assert.equal(e.landing(state,column),threat);
 for(const action of e.legal(state))if(action!==column){
  const after=k.advance(state,action);assert(after!==domain.QN_TERMINAL_WIN&&after>=0);
  assert(e.terminalActions(after,1).length>0,`${e.coord(threat)} was not actually forced`);
 }
 const before=measure(state,target),beforeDistance=e.singleton(state,0,target)?e.targetDistance(state,target):null;
 const afterBlock=k.advance(state,column);
 if(afterBlock===domain.QN_TERMINAL_WIN)return {role:role(column,target),forcedCell:e.coord(threat),blockTerminal:true,before,strictRhoDecrease:true,distanceBefore:beforeDistance,distanceAfter:null,nextSingleRoles:{},replyRoutes:{P0_terminal_on_block:1}};
 assert(afterBlock>=0);
 const after=measure(afterBlock,target),afterDistance=e.singleton(afterBlock,0,target)?e.targetDistance(afterBlock,target):null;
 const replyRoutes={},nextSingleRoles={};
 for(const reply of e.legal(afterBlock)){
  const replyCell=e.landing(afterBlock,reply),child=k.advance(afterBlock,reply);
  if(child===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterBlock,1)).has(replyCell));bump(replyRoutes,'P1_terminal');continue;}
  if(e.terminalActions(child,0).length){bump(replyRoutes,'P0_terminal');continue;}
  const next=[...new Set(e.enabledSingletons(child,1))];
  if(next.length>=2){bump(replyRoutes,'multi_obligation');continue;}
  if(next.length===1){const rr=role(next[0]%7,target);bump(replyRoutes,`single_${rr}`);bump(nextSingleRoles,rr);continue;}
  const live=e.singleton(child,0,target),d=live?e.targetDistance(child,target):null;
  bump(replyRoutes,live?`no_obligation_d${d}`:'no_obligation_target_dead');
 }
 return {role:role(column,target),forcedCell:e.coord(threat),blockTerminal:false,before,after,strictRhoDecrease:lexLess(after,before),distanceBefore:beforeDistance,distanceAfter:afterDistance,nextSingleRoles,replyRoutes};
}

function classify(root){
 const forcedRoles={},nonRhoForcedRoles={},nextSingleRoles={},replyRoutes={};
 let capacityDefects=0,forcedCount=0,safeActions=0,unsafeActions=0;
 for(const action of e.legal(root.state)){
  const afterP0=k.advance(root.state,action);
  if(afterP0===domain.QN_TERMINAL_WIN)continue;
  const p1Terminal=e.terminalActions(afterP0,1);
  if(p1Terminal.length){unsafeActions++;continue;}
  safeActions++;
  for(const reply of e.legal(afterP0)){
   const child=k.advance(afterP0,reply);assert(child!==domain.QN_TERMINAL_WIN&&child>=0);
   if(e.terminalActions(child,0).length)continue;
   const obligations=[...new Set(e.enabledSingletons(child,1))];
   if(obligations.length>=2){
    let defect=true;
    for(const a of e.legal(child)){
     const x=k.advance(child,a);assert(x!==domain.QN_TERMINAL_WIN&&x>=0);
     if(e.terminalActions(x,1).length===0){defect=false;break;}
    }
    assert(defect,'multi-obligation child lacked exact capacity defect');capacityDefects++;continue;
   }
   const fp=forcedProfile(child,root.target);if(!fp)continue;
   forcedCount++;bump(forcedRoles,fp.role);if(!fp.strictRhoDecrease)bump(nonRhoForcedRoles,fp.role);
   for(const [r,n] of Object.entries(fp.nextSingleRoles))bump(nextSingleRoles,r,n);
   for(const [r,n] of Object.entries(fp.replyRoutes))bump(replyRoutes,r,n);
  }
 }
 const signature=[`safe${safeActions}`,`unsafe${unsafeActions}`,`def${capacityDefects}`,
  ...Object.entries(forcedRoles).sort().map(([x,n])=>`f-${x}:${n}`),
  ...Object.entries(nonRhoForcedRoles).sort().map(([x,n])=>`nr-${x}:${n}`),
  ...Object.entries(nextSingleRoles).sort().map(([x,n])=>`ns-${x}:${n}`),
  ...Object.entries(replyRoutes).sort().map(([x,n])=>`r-${x}:${n}`)].join('|');
 return {...root,safeActions,unsafeActions,capacityDefects,forcedCount,forcedRoles,nonRhoForcedRoles,nextSingleRoles,replyRoutes,signature};
}
const rows=roots.map(classify),positive=rows.filter(x=>x.label==='qualified_positive'),residualRows=rows.filter(x=>x.label==='residual');
function aggregate(group){const forcedRoles={},nonRhoForcedRoles={},nextSingleRoles={},replyRoutes={};let defects=0,forced=0,rootsWithTargetForced=0,rootsWithNonRho=0,rootsWithNextTarget=0;for(const x of group){defects+=x.capacityDefects;forced+=x.forcedCount;for(const [r,n] of Object.entries(x.forcedRoles))bump(forcedRoles,r,n);for(const [r,n] of Object.entries(x.nonRhoForcedRoles))bump(nonRhoForcedRoles,r,n);for(const [r,n] of Object.entries(x.nextSingleRoles))bump(nextSingleRoles,r,n);for(const [r,n] of Object.entries(x.replyRoutes))bump(replyRoutes,r,n);if(x.forcedRoles.target)rootsWithTargetForced++;if(Object.keys(x.nonRhoForcedRoles).length)rootsWithNonRho++;if(x.nextSingleRoles.target)rootsWithNextTarget++;}return {roots:group.length,capacityDefects:defects,forcedDefenses:forced,forcedRoles,nonRhoForcedRoles,nextSingleRoles,replyRoutes,rootsWithTargetForced,rootsWithNonRho,rootsWithNextTarget,signatureCount:new Set(group.map(x=>x.signature)).size};}
const positiveSigs=new Map();for(const x of positive){const a=positiveSigs.get(x.signature)??[];a.push(x.sequence);positiveSigs.set(x.signature,a);}
const matches=residualRows.flatMap(x=>(positiveSigs.get(x.signature)??[]).slice(0,2).map(p=>({residual:x.sequence,positive:p,signature:x.signature})));
console.log(`POSTBLOCK_FORCED_DEFENSE_ROLE_DIFFERENTIAL=${JSON.stringify({
 kind:'standard7x6-postblock-forced-defense-role-differential-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactRoots:rows.length,positive:aggregate(positive),residual:aggregate(residualRows),matchedOppositeRoleSignatures:matches.length,matchedSamples:matches.slice(0,12),
 residualProfiles:residualRows.map(x=>({sequence:x.sequence,safeActions:x.safeActions,unsafeActions:x.unsafeActions,capacityDefects:x.capacityDefects,forcedRoles:x.forcedRoles,nonRhoForcedRoles:x.nonRhoForcedRoles,nextSingleRoles:x.nextSingleRoles,replyRoutes:x.replyRoutes,signature:x.signature})),
 interpretation:matches.length===0?'Forced-defense column role and rank effect remain a complete empirical separator between the 22 residual roots and 62 qualified positives on this exact boundary. This still does not prove value; it identifies the missing guarded action vocabulary to test.':'Role/rank information still collides across positive and residual roots; preserve the matched counterexamples and refine the dependency cone.',
 theoremBoundary:'Diagnostic only. Forcedness and multi-obligation defects are exhaustively certified one turn at a time. Column roles are claim-relative labels (target, resolved, repair), not q equality. No recursive forced-defense proof, WDL premise, cap increase, or root solve.'
})}`);
