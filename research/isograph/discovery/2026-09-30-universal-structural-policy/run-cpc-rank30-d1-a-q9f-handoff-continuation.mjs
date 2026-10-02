#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const root=resolve(import.meta.dirname,'../../../..');
const SOURCE='CPC_RANK20_FORCED_C3_RANK5_LOCAL_GRAMMAR_PROBE_0_1.json';
const Q9F='CPC_RANK32_Q9F_MONOTONE_PROOF_LIBRARY_CLASSIFICATION_0_1.json';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const LEAF='SECOND_D1_C5_CONTRACTION:A->A';
const ROOT_MOVE=2; // zero-based c3
const Q9F_CLASS='9f6b7a33ab7e9552';

const kernelMod=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const {createSlot64ResidualQuotientKernel}=kernelMod;

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
const q9f=JSON.parse(readFileSync(resolve(import.meta.dirname,Q9F),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank20_forced_c3_rank5_local_grammar_probe.v1');
assert.equal(q9f.schema,'connect4.cpc_rank32_q9f_monotone_proof_library_classification.v1');
assert.equal(q9f.classification,'FORCED_BLOCK_ALL_REPLIES_POSITIVE');
assert.equal(q9f.target.exactQClass,Q9F_CLASS);
assert.equal(q9f.target.exactBridge.pass,true);
assert.equal(q9f.summary.unclosedReplyCount,0);

const src=source.rows.find(x=>x.sourceLeafId===LEAF);
assert(src);assert.equal(src.rank,30);assert.equal(src.exactQClass,'d21a89605c399aca');
assert.deepEqual(src.support,[6,6,2,6,5,5,0]);
const frozenAttempt=src.rootMoveAttempts.find(x=>x.rootMove===3);
assert(frozenAttempt);assert.equal(frozenAttempt.proved,false);
assert.equal(frozenAttempt.firstUnresolved.lowerQClass,Q9F_CLASS);

const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
  cacheEdges:true,prefixClasses:4096,responseClosure:true,
  searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})
});
kernel.prepareSearchStorage();

function replay(sequence){
  let id=kernel.rootId;
  for(const d of sequence){
    const child=kernel.advance(id,Number(d)-1);
    if(!Number.isSafeInteger(child)||child<0)throw new Error('bad replay '+sequence);
    id=child;
  }
  return id;
}
function rank(id){return kernel.supportAccess.rankAt(kernel.states.supportAt(id));}
function landing(id,c){return kernel.supportAccess.landingAt(kernel.states.supportAt(id),c);}
function legal(id){const out=[];for(let c=0;c<7;c++)if(landing(id,c)!==0xff)out.push(c);return out;}
function support(id){
  const out=[];for(let c=0;c<7;c++){const x=landing(id,c);out.push(x===0xff?6:Math.floor(x/7));}return out;
}
function hasBit(term,cell){return cell<32?(((term[0]>>>cell)&1)!==0):(((term[1]>>>(cell-32))&1)!==0);}
function termCells(term){const out=[];for(let i=0;i<42;i++)if(hasBit(term,i))out.push(i);return out;}
function termKeys(id,p){
  const cid=p===0?kernel.states.p0At(id):kernel.states.p1At(id);
  return kernel.classes.terms(cid).map(termCells).map(x=>x.join(',')).sort();
}
function exactKey(id){return 'r'+rank(id)+'|h'+support(id).join(',')+'|p0:'+termKeys(id,0).join(';')+'|p1:'+termKeys(id,1).join(';');}
function qClass(id){return createHash('sha256').update(exactKey(id)).digest('hex').slice(0,16);}
function immediateWinningColumns(id){
  if((rank(id)&1)!==0)return [];
  const out=[];for(const c of legal(id))if(kernel.advance(id,c)===domain.QN_TERMINAL_WIN)out.push(c);return out;
}
function isImmediateWin(id){return immediateWinningColumns(id).length>0;}
function isOverloadLeaf(id){
  if((rank(id)&1)!==1)return false;
  const cols=legal(id);if(!cols.length)return false;
  for(const c of cols){const child=kernel.advance(id,c);if(child===domain.QN_TERMINAL_WIN||child<0||!isImmediateWin(child))return false;}
  return true;
}
function findMoveToOverload(id){
  if((rank(id)&1)!==0)return null;
  for(const c of legal(id)){const child=kernel.advance(id,c);if(child>=0&&isOverloadLeaf(child))return {column:c,child};}
  return null;
}
function rankOne(id){
  const w=findMoveToOverload(id);if(!w)return null;
  return {expression:'E(O)',grammarRank:1,rootMove:w.column+1,rawReplyCount:0,distinctQClassCount:0,distinctExpressionCount:0,consequenceRows:[],proofKind:'RANK1'};
}
function rankThree(id){
  if((rank(id)&1)!==0)return null;
  for(const rootColumn of legal(id)){
    const defender=kernel.advance(id,rootColumn);
    if(defender<0||isOverloadLeaf(defender))continue;
    const replies=legal(defender);if(!replies.length)continue;
    const consequenceRows=[];let valid=true;
    for(const dc of replies){
      const attacker=kernel.advance(defender,dc);
      if(attacker===domain.QN_TERMINAL_WIN||attacker<0){valid=false;break;}
      const wins=immediateWinningColumns(attacker);
      if(wins.length){
        consequenceRows.push({defenderColumn:dc+1,lowerQClass:qClass(attacker),expression:'I',proved:true,witness:{immediateWinningColumns:wins.map(x=>x+1)}});
        continue;
      }
      const r1=rankOne(attacker);if(!r1){valid=false;break;}
      consequenceRows.push({defenderColumn:dc+1,lowerQClass:qClass(attacker),expression:r1.expression,proved:true,witness:{rootMove:r1.rootMove}});
    }
    if(!valid)continue;
    const expr=[...new Set(consequenceRows.map(x=>x.expression))].sort();
    return {expression:'E(A('+expr.join('|')+'))',grammarRank:3,rootMove:rootColumn+1,rawReplyCount:consequenceRows.length,distinctQClassCount:new Set(consequenceRows.map(x=>x.lowerQClass)).size,distinctExpressionCount:expr.length,consequenceRows,proofKind:'RANK3'};
  }
  return null;
}
const cache=new Map();
function lowerProof(id){
  if(cache.has(id))return cache.get(id);
  const qc=qClass(id);let proof=null;
  if(qc===Q9F_CLASS){
    proof={expression:'Q9F_RCIC',grammarRank:null,rootMove:3,rawReplyCount:q9f.summary.replyCount,distinctQClassCount:q9f.summary.replyCount,distinctExpressionCount:1,consequenceRows:[],proofKind:'EXACT_Q9F_HANDOFF',witness:{sourceEvidence:Q9F,classification:q9f.classification}};
  }else{
    const wins=immediateWinningColumns(id);
    if(wins.length)proof={expression:'I',grammarRank:0,rootMove:wins[0]+1,rawReplyCount:0,distinctQClassCount:0,distinctExpressionCount:1,consequenceRows:[],proofKind:'IMMEDIATE',witness:{immediateWinningColumns:wins.map(x=>x+1)}};
    else proof=rankOne(id)??rankThree(id);
  }
  cache.set(id,proof);return proof;
}

const id=replay(src.sequence);
assert.equal(rank(id),30);assert.deepEqual(support(id),src.support);assert.equal(qClass(id),src.exactQClass);
const defender=kernel.advance(id,ROOT_MOVE);assert(defender>=0&&defender!==domain.QN_TERMINAL_WIN);
const replies=legal(defender);assert.equal(replies.length,frozenAttempt.rawDefenderReplyCount);

const defenderReplies=[];let firstUnresolved=null;
for(const dc of replies){
  const attacker=kernel.advance(defender,dc);
  if(attacker===domain.QN_TERMINAL_WIN||attacker<0){
    firstUnresolved={defenderColumn:dc+1,kind:attacker===domain.QN_TERMINAL_WIN?'DEFENDER_TERMINAL':'ILLEGAL',lowerQClass:null,rank:null,support:null};
    defenderReplies.push({...firstUnresolved,proved:false});
    break;
  }
  const lower=lowerProof(attacker);
  if(!lower){
    firstUnresolved={defenderColumn:dc+1,kind:'NO_QUALIFIED_LOWER_PROOF',lowerQClass:qClass(attacker),rank:rank(attacker),support:support(attacker)};
    defenderReplies.push({...firstUnresolved,proved:false});
    break;
  }
  defenderReplies.push({
    defenderColumn:dc+1,lowerQClass:qClass(attacker),rank:rank(attacker),support:support(attacker),
    proved:true,expression:lower.expression,grammarRank:lower.grammarRank,proofKind:lower.proofKind,
    rootMove:lower.rootMove,witness:lower.witness??null
  });
}
const provedReplyCount=defenderReplies.filter(x=>x.proved).length;
const classification=firstUnresolved?'CONTINUATION_UNRESOLVED':'ROOT_MOVE_C3_PROVED';
const expressions=firstUnresolved?[]:[...new Set(defenderReplies.map(x=>x.expression))].sort();
const rank5Expression=firstUnresolved?null:'E(A('+expressions.join('|')+'))';

console.log(JSON.stringify({
  schema:'connect4.cpc_rank30_d1_a_q9f_handoff_continuation.v1',
  date:'2026-10-01',
  sourceEvidence:SOURCE,q9fEvidence:Q9F,
  sourceLeafId:LEAF,sourceExactQClass:qClass(id),sequence:src.sequence,rank:rank(id),support:support(id),
  rootMove:ROOT_MOVE+1,rawDefenderReplyCount:replies.length,provedReplyCount,
  defenderReplies,firstUnresolved,classification,rank5Expression,
  q9fSourceEvidenceAccepted:true,
  oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,jsMinSysModified:false,rankGrammarModified:false,bsfpModified:false,
  conclusion:[
    'The previously qualified q9f result is admitted only as an exact semantic-q proof-library handoff.',
    'The original rank-1/rank-3/rank-5 grammar is otherwise unchanged and the defender-reply loop resumes from the beginning in deterministic order.',
    classification==='ROOT_MOVE_C3_PROVED'
      ? 'All defender replies to the rank-30 c3 root move now close, so that exact root move has a bounded constructive rank-5 proof.'
      : 'The q9f c3 defender reply now closes, but a later defender reply remains outside the bounded proof library; that exact child is preserved as the next obstruction.'
  ],
  boundary:[
    'No solved W/D/L, oracle, minimax, unrestricted free-branch value search, best-move table, BSFP solved value, support-only identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, the rank-1/rank-3/rank-5 grammar, and BSFP remain unchanged.',
    'The q9f handoff is admitted only by exact semantic identity to an independently qualified constructive certificate.'
  ]
},null,2));
