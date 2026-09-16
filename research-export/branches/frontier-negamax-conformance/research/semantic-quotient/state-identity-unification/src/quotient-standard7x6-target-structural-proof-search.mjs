#!/usr/bin/env node
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const TARGET=process.env.STRUCTURAL_TARGET_SEQUENCE ?? '46656555';
const MAX_PAIRS=Number(process.env.STRUCTURAL_MAX_PAIRS ?? 8);
const STATE_CAP=Number(process.env.STRUCTURAL_STATE_CAP ?? 100000);
const CALL_CAP=Number(process.env.STRUCTURAL_CALL_CAP ?? 250000);
if(!Number.isSafeInteger(MAX_PAIRS)||MAX_PAIRS<1||MAX_PAIRS>12)throw new RangeError('STRUCTURAL_MAX_PAIRS must be 1..12');
if(!Number.isSafeInteger(STATE_CAP)||STATE_CAP<1000||STATE_CAP>500000)throw new RangeError('STRUCTURAL_STATE_CAP invalid');
if(!Number.isSafeInteger(CALL_CAP)||CALL_CAP<1000||CALL_CAP>2000000)throw new RangeError('STRUCTURAL_CALL_CAP invalid');

class CapHit extends Error{constructor(kind){super(kind);this.kind=kind;}}
const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:Math.max(131072,STATE_CAP+4096),classes:1048576,chunksPerSlot:Math.max(131072,STATE_CAP+4096)})});
kernel.prepareSearchStorage();

function cappedAdvance(stateId,column){const child=kernel.advance(stateId,column);if(kernel.states.count>STATE_CAP)throw new CapHit('state-cap');return child;}
function replay(sequence){let stateId=kernel.rootId;for(const digit of sequence){const child=cappedAdvance(stateId,Number(digit)-1);if(!Number.isSafeInteger(child)||child<0)throw new Error(`bad replay ${sequence}`);stateId=child;}return stateId;}
function rank(stateId){return kernel.supportAccess.rankAt(kernel.states.supportAt(stateId));}
function legal(stateId){const support=kernel.states.supportAt(stateId),out=[];for(let c=0;c<7;c+=1)if(kernel.supportAccess.landingAt(support,c)!==0xff)out.push(c);return out;}

const immediateMemo=new Map(),overloadMemo=new Map();
function immediate(stateId){if(immediateMemo.has(stateId))return immediateMemo.get(stateId);let value=false;if((rank(stateId)&1)===0)for(const c of legal(stateId))if(cappedAdvance(stateId,c)===domain.QN_TERMINAL_WIN){value=true;break;}immediateMemo.set(stateId,value);return value;}
function overload(stateId){if(overloadMemo.has(stateId))return overloadMemo.get(stateId);let value=false;if((rank(stateId)&1)===1){const moves=legal(stateId);value=moves.length>0;for(const c of moves){const child=cappedAdvance(stateId,c);if(child===domain.QN_TERMINAL_WIN||child<0||!immediate(child)){value=false;break;}}}overloadMemo.set(stateId,value);return value;}
function shallowBase(stateId){if(immediate(stateId))return {kind:'I'};for(const c of legal(stateId)){const child=cappedAdvance(stateId,c);if(child>=0&&overload(child))return {kind:'E(O)',move:c};}return null;}

let calls=0,cacheHits=0,failCacheHits=0;
const memo=new Map();
function proofSize(node,seen=new Set()){if(!node)return 0;const key=node.stateId===undefined?null:`${node.stateId}:${node.depth}`;if(key&&seen.has(key))return 0;if(key)seen.add(key);let n=1;for(const child of node.children??[])n+=proofSize(child,seen);return n;}
function prove(stateId,depth){
  calls+=1;if(calls>CALL_CAP)throw new CapHit('call-cap');
  const base=shallowBase(stateId);if(base)return {stateId,depth,kind:base.kind,move:base.move??null,children:[]};
  if(depth<=0)return null;
  const key=`${stateId}:${depth}`;
  if(memo.has(key)){const v=memo.get(key);if(v)cacheHits+=1;else failCacheHits+=1;return v;}
  if((rank(stateId)&1)!==0)throw new Error('prove expects P0-to-move state');
  const candidateProfiles=[];
  for(const move of legal(stateId)){
    const defender=cappedAdvance(stateId,move);
    if(defender===domain.QN_TERMINAL_WIN){const proof={stateId,depth,kind:'I',move,children:[]};memo.set(key,proof);return proof;}
    if(defender<0)continue;
    const replies=[];let invalid=false;
    for(const reply of legal(defender)){
      const child=cappedAdvance(defender,reply);
      if(child===domain.QN_TERMINAL_WIN||child<0){invalid=true;break;}
      replies.push({reply,child,base:shallowBase(child)});
    }
    if(invalid)continue;
    candidateProfiles.push({move,defender,replies,unresolved:replies.filter(x=>!x.base).length});
  }
  candidateProfiles.sort((a,b)=>a.unresolved-b.unresolved||a.move-b.move);
  for(const candidate of candidateProfiles){
    const children=[];let ok=true;
    const unique=new Map();
    for(const row of candidate.replies)if(!row.base&&!unique.has(row.child))unique.set(row.child,row.reply);
    for(const [child,reply] of unique){const p=prove(child,depth-1);if(!p){ok=false;break;}children.push({reply,proof:p});}
    if(ok){const proof={stateId,depth,kind:'E(A)',move:candidate.move,rawReplies:candidate.replies.length,hardChildren:unique.size,children:children.map(x=>x.proof)};memo.set(key,proof);return proof;}
  }
  memo.set(key,null);return null;
}

const root=replay(TARGET);if((rank(root)&1)!==0)throw new Error('target must be P0-to-move');
const attempts=[];let result=null,capHit=null;
try{
  for(let depth=1;depth<=MAX_PAIRS;depth+=1){
    const beforeCalls=calls,beforeStates=kernel.states.count;
    const proof=prove(root,depth);
    attempts.push({depth,proved:Boolean(proof),newCalls:calls-beforeCalls,cumulativeCalls:calls,newQStates:kernel.states.count-beforeStates,cumulativeQStates:kernel.states.count,memoEntries:memo.size});
    if(proof){result=proof;break;}
  }
}catch(error){if(error instanceof CapHit)capHit=error.kind;else throw error;}
function summarize(node){if(!node)return null;return{kind:node.kind,move:node.move===null||node.move===undefined?null:node.move+1,hardChildren:node.hardChildren??0,children:(node.children??[]).map(summarize)};}
console.log(`TARGET_STRUCTURAL_PROOF_SEARCH=${JSON.stringify({
  kind:'standard7x6-target-structural-proof-search-control-v1',
  attribution:{researchDirectionAndStructuralTarget:'Josh Oshiro',formalizationImplementationAndQualification:'OpenAI ChatGPT'},
  targetSequence:TARGET,
  maxMacroPairs:MAX_PAIRS,
  stateCap:STATE_CAP,
  callCap:CALL_CAP,
  capHit,
  proved:Boolean(result),
  proofDepth:result?.depth??null,
  proofDagNodes:result?proofSize(result):null,
  attempts,
  materializedQStates:kernel.states.count,
  recursiveCalls:calls,
  cacheHits,
  failCacheHits,
  proofSummary:result?summarize(result):null,
  authority:'No external oracle/value labels are used. This is bounded exact-q structural certificate search over legal P0 existential moves, all legal P1 replies, and I/E(O) base certificates.',
  interpretation:result?'The current base calculus is sufficient for this target; the remaining issue is compact theorem-backed witness synthesis rather than a stronger positive leaf for this state.':'No proof was found inside the declared depth/cap. This is not a negative-value result; it bounds the current base calculus search only.'
})}`);
