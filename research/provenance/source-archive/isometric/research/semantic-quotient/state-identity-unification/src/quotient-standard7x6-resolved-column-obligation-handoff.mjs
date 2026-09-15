#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6, C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const REPAIRS = Object.freeze([0, 1, 3, 4, 5]);
const MAX_PROOF_STATES = 100000;

function replay(k, seq) { let id=k.rootId; for(const d of seq){id=k.advance(id,Number(d)-1); assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${seq}`);} return id; }
function rank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function landing(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function legal(k,id){const out=[]; for(let c=0;c<7;c++) if(landing(k,id,c)!==0xff) out.push(c); return out;}
function heights(k,id){const out=[]; for(let c=0;c<7;c++){const x=landing(k,id,c); out.push(x===0xff?6:Math.floor(x/7));} return out;}
function capacity(k,id,c){return 6-heights(k,id)[c];}
function mu(k,id){return REPAIRS.reduce((s,c)=>s+capacity(k,id,c),0);}
function col(c){return String.fromCharCode(65+c);}
function coord(x){return `${col(x%7)}${Math.floor(x/7)+1}`;}
function has([lo,hi],x){return x<32?(((lo>>>x)&1)!==0):(((hi>>>(x-32))&1)!==0);}
function cells(term){const out=[]; for(let x=0;x<42;x++) if(has(term,x)) out.push(x); return out;}
function terms(k,id,p){const q=p===0?k.states.p0At(id):k.states.p1At(id); return k.classes.terms(q).map(cells);}
function singleton(k,id,p,x){return terms(k,id,p).some(t=>t.length===1&&t[0]===x);}
function enabledSingletons(k,id,p){return terms(k,id,p).filter(t=>t.length===1).map(t=>t[0]).filter(x=>landing(k,id,x%7)===x).sort((a,b)=>a-b);}
function targetDistance(k,id,target){return Math.max(0,2-heights(k,id)[target%7]);}
function terminalActions(k,id,p){const enabled=new Set(enabledSingletons(k,id,p)),out=[]; for(const c of legal(k,id)){const cell=landing(k,id,c),child=k.advance(id,c); if(child===domain.QN_TERMINAL_WIN){assert(enabled.has(cell),`${p===0?'P0':'P1'} terminal ${coord(cell)} lacks enabled singleton premise`); out.push({column:c,cell});}} return out;}
function repairInvariant(k,id,target){return rank(k,id)%2===0&&singleton(k,id,0,target)&&targetDistance(k,id,target)===1;}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});
k.prepareSearchStorage();

const proofMemo=new Map(); let proofStates=0,proofActionsChecked=0,proofP1BranchesChecked=0,maxDepth=0;
function proveRepairInvariant(state,target,depth=0){
  const key=`${state}:${target}`; if(proofMemo.has(key)) return proofMemo.get(key);
  proofStates++; maxDepth=Math.max(maxDepth,depth); if(proofStates>MAX_PROOF_STATES) throw new Error(`repair proof-state cap exceeded ${MAX_PROOF_STATES}`);
  assert.equal(rank(k,state)%2,0,'repair proof node must be P0 turn'); const m=mu(k,state);
  const immediate=terminalActions(k,state,0); if(immediate.length){const out={proved:true,kind:'immediate_P0_terminal',mu:m}; proofMemo.set(key,out); return out;}
  if(!repairInvariant(k,state,target)){const out={proved:false,kind:'outside_repair_invariant',mu:m,targetLive:singleton(k,state,0,target),targetDistance:targetDistance(k,state,target)}; proofMemo.set(key,out); return out;}
  const rejected=[];
  for(const action of REPAIRS){
    if(landing(k,state,action)===0xff) continue; proofActionsChecked++; const afterP0=k.advance(state,action);
    if(afterP0===domain.QN_TERMINAL_WIN){const out={proved:true,kind:'repair_predecessor',mu:m,witness:col(action),witnessKind:'P0_terminal_now'}; proofMemo.set(key,out); return out;}
    assert(afterP0>=0&&rank(k,afterP0)===rank(k,state)+1); assert.equal(mu(k,afterP0),m-1,'repair action did not decrease mu');
    let accepted=true,rejection=null;
    for(const reply of legal(k,afterP0)){
      const replyCell=landing(k,afterP0,reply); proofP1BranchesChecked++; const afterP1=k.advance(afterP0,reply);
      if(afterP1===domain.QN_TERMINAL_WIN){assert(new Set(enabledSingletons(k,afterP0,1)).has(replyCell),`P1 terminal ${coord(replyCell)} lacks enabled singleton`); accepted=false; rejection={reply:col(reply),reason:'P1_terminal'}; break;}
      assert(afterP1>=0&&rank(k,afterP1)===rank(k,state)+2); assert(mu(k,afterP1)<=m-1,'P1 increased mu');
      if(terminalActions(k,afterP1,0).length) continue; const child=proveRepairInvariant(afterP1,target,depth+1);
      if(!child.proved){accepted=false; rejection={reply:col(reply),reason:child.kind,childMu:child.mu}; break;}
    }
    if(accepted){const out={proved:true,kind:'repair_predecessor',mu:m,witness:col(action),witnessKind:'repair_induction'}; proofMemo.set(key,out); return out;}
    rejected.push({action:col(action),...rejection});
  }
  const out={proved:false,kind:'no_repair_predecessor',mu:m,rejected}; proofMemo.set(key,out); return out;
}

const survivors=[];
for(const attack of [
  {name:'C_first',attackCol:C,attackTarget:C3,remainingTarget:G3,reply1:[0,1,3,4,5,6]},
  {name:'G_first',attackCol:G,attackTarget:G3,remainingTarget:C3,reply1:[0,1,2,3,4,5]},
]){
  for(const r1 of attack.reply1){
    const suffix=`${attack.attackCol+1}${r1+1}${attack.attackCol+1}${attack.attackCol+1}`;
    const state=replay(k,ROOT+suffix);
    assert.equal(rank(k,state),16,`${attack.name}:${col(r1)} rank drift`);
    assert.equal(singleton(k,state,0,attack.attackTarget),false,'resolved target remained P0 singleton');
    assert.equal(singleton(k,state,0,attack.remainingTarget),true,'remaining target singleton drift');
    const resolvedThreat=landing(k,state,attack.attackCol);
    assert.equal(Math.floor(resolvedThreat/7),3,'resolved-column landing is not row 4');
    const enabledP1=new Set(enabledSingletons(k,state,1));
    assert(enabledP1.has(resolvedThreat),`${attack.name}:${col(r1)} missing enabled P1 resolved-column singleton ${coord(resolvedThreat)}`);
    survivors.push({name:`${attack.name}:${col(r1)}`,sequence:ROOT+suffix,state,resolvedCol:attack.attackCol,resolvedThreat,remainingTarget:attack.remainingTarget,remainingDistance:targetDistance(k,state,attack.remainingTarget),mu:mu(k,state)});
  }
}
assert.equal(survivors.length,12);

function testNonBlockingActions(row){
  const out=[];
  for(const action of legal(k,row.state)){
    if(action===row.resolvedCol) continue;
    const afterP0=k.advance(row.state,action);
    if(afterP0===domain.QN_TERMINAL_WIN){out.push({action:col(action),route:'P0_terminal_now'}); continue;}
    assert(afterP0>=0);
    const reply=k.advance(afterP0,row.resolvedCol);
    const threatCell=landing(k,afterP0,row.resolvedCol);
    out.push({action:col(action),resolvedReplyCell:coord(threatCell),p1CanTerminateOnResolvedColumn:reply===domain.QN_TERMINAL_WIN});
  }
  return out;
}

function classifyAfterForcedBlock(row){
  const blockCell=landing(k,row.state,row.resolvedCol);
  assert.equal(blockCell,row.resolvedThreat);
  const afterBlock=k.advance(row.state,row.resolvedCol);
  if(afterBlock===domain.QN_TERMINAL_WIN) return {blockCell:coord(blockCell),blockTerminal:true,replies:[]};
  assert(afterBlock>=0&&rank(k,afterBlock)===17);
  assert.equal(singleton(k,afterBlock,1,row.resolvedThreat),false,'resolved P1 singleton survived P0 block');

  const replies=[];
  for(const reply of legal(k,afterBlock)){
    const replyCell=landing(k,afterBlock,reply);
    const afterP1=k.advance(afterBlock,reply);
    if(afterP1===domain.QN_TERMINAL_WIN){
      assert(new Set(enabledSingletons(k,afterBlock,1)).has(replyCell),`P1 terminal ${coord(replyCell)} lacks enabled singleton after forced block`);
      replies.push({reply:col(reply),replyCell:coord(replyCell),route:'P1_terminal'}); continue;
    }
    assert(afterP1>=0&&rank(k,afterP1)===18);
    const immediate=terminalActions(k,afterP1,0);
    if(immediate.length){replies.push({reply:col(reply),replyCell:coord(replyCell),route:'immediate_P0_terminal',terminalColumns:immediate.map(x=>col(x.column))}); continue;}
    const live=singleton(k,afterP1,0,row.remainingTarget),dist=targetDistance(k,afterP1,row.remainingTarget);
    if(live&&dist===1){
      const proof=proveRepairInvariant(afterP1,row.remainingTarget);
      replies.push({reply:col(reply),replyCell:coord(replyCell),route:proof.proved?'repair_capacity_induction':'repair_invariant_unproved',targetDistance:dist,mu:proof.mu,witness:proof.witness??null,enabledP1Singletons:enabledSingletons(k,afterP1,1).map(coord)}); continue;
    }
    replies.push({reply:col(reply),replyCell:coord(replyCell),route:'post_block_unresolved',targetLive:live,targetDistance:dist,mu:mu(k,afterP1),heights:heights(k,afterP1),enabledP0Singletons:enabledSingletons(k,afterP1,0).map(coord),enabledP1Singletons:enabledSingletons(k,afterP1,1).map(coord)});
  }
  return {blockCell:coord(blockCell),blockTerminal:false,replies};
}

const rows=survivors.map(row=>{
  const nonBlocking=testNonBlockingActions(row);
  const forced=classifyAfterForcedBlock(row);
  return {...row,nonBlocking,allNonBlockingNonterminalActionsLoseImmediatelyToResolvedThreat:nonBlocking.filter(x=>x.route!=='P0_terminal_now').every(x=>x.p1CanTerminateOnResolvedColumn===true),forcedBlock:forced};
});

const forcedDefenseRows=rows.filter(r=>r.allNonBlockingNonterminalActionsLoseImmediatelyToResolvedThreat).length;
const forcedReplies=rows.flatMap(r=>r.forcedBlock.replies.map(x=>({member:r.name,...x})));
const counts={}; for(const x of forcedReplies) counts[x.route]=(counts[x.route]??0)+1;
const unresolved=forcedReplies.filter(x=>x.route==='post_block_unresolved'||x.route==='repair_invariant_unproved');

console.log(`RESOLVED_COLUMN_OBLIGATION_HANDOFF=${JSON.stringify({
  kind:'standard7x6-resolved-column-opponent-singleton-obligation-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  exactSurvivorStates:rows.length,
  forcedDefenseRows,
  survivorSummary:rows.map(r=>({member:r.name,sequence:r.sequence,resolvedThreat:coord(r.resolvedThreat),remainingTarget:coord(r.remainingTarget),remainingDistance:r.remainingDistance,mu:r.mu,nonBlocking:r.nonBlocking,forcedBlockCell:r.forcedBlock.blockCell})),
  postForcedBlockReplyCount:forcedReplies.length,
  postForcedBlockRouteCounts:counts,
  unresolvedCount:unresolved.length,
  unresolved,
  repairProofStates:proofStates,
  repairProofActionsChecked:proofActionsChecked,
  repairProofP1BranchesChecked:proofP1BranchesChecked,
  repairProofMaxDepth:maxDepth,
  interpretation: forcedDefenseRows===rows.length
    ? 'In all exact target-block survivor states, the resolved-column P1 singleton is a true one-turn defensive deadline: every nonterminal P0 action that does not occupy that row-4 cell permits immediate P1 terminality there. The forced block is therefore structural, not a heuristic move choice.'
    : 'The resolved-column singleton is not universally a forced defense; preserve the reported escape actions and do not promote a deadline theorem.',
  theoremBoundary:'Exact only for the 12 survivor states generated by the fixed C-first/G-first target-support macros at 466565554644. The control tests one forced resolved-column block and one complete P1 reply horizon, reusing repair-capacity induction only when its exact live-singleton/support-distance-one invariant holds. It is not q equality, solved-WDL lookup, arbitrary search, center-opening W membership, or a root solve.',
  authority:'Exact C4-0010 support/residual transitions and enabled-singleton terminal certificates; no external W/D/L labels or recursive q-state values.',
})}`);
