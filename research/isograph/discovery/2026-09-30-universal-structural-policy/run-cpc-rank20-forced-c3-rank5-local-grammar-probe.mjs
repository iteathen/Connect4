#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const root=resolve(import.meta.dirname,'../../../..');
const SOURCE='CPC_RANK20_FORCED_C3_FIRST_FAILURE_LOCAL_GRAMMAR_PROBE_0_1.json';
const MATRIX='CPC_RANK20_FORCED_C3_LEGACY_PROOF_FAMILY_MATRIX_0_1.json';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});

const kernelMod=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const {createSlot64ResidualQuotientKernel}=kernelMod;

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
const matrix=JSON.parse(readFileSync(resolve(import.meta.dirname,MATRIX),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank20_forced_c3_first_failure_local_grammar_probe.v1');
assert.equal(matrix.schema,'connect4.cpc_rank20_forced_c3_legacy_proof_family_matrix.v1');
assert.equal(source.sourceLeafCount,11);
assert.equal(source.uniqueExactQLeafCount,11);
assert.equal(source.summary.provedCount,0);
assert.equal(source.summary.unresolvedCount,11);
assert.equal(matrix.summary.legacyUnionClosedCount,0);
assert.equal(matrix.summary.resourceFailureCount,0);
for(const src of [source,matrix]){
  assert.equal(src.oracleUsed,false);
  assert.equal(src.solvedInputsUsed,false);
  assert.equal(src.productionCpcModified,false);
  assert.equal(src.jsMinSysModified,false);
  assert.equal(src.bsfpModified,false);
}

const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
  cacheEdges:true,
  prefixClasses:4096,
  responseClosure:true,
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
  const out=[];
  for(let c=0;c<7;c++){
    const x=landing(id,c);
    out.push(x===0xff?6:Math.floor(x/7));
  }
  return out;
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
  const out=[];
  for(const c of legal(id))if(kernel.advance(id,c)===domain.QN_TERMINAL_WIN)out.push(c);
  return out;
}
function isImmediateWin(id){return immediateWinningColumns(id).length>0;}
function isOverloadLeaf(id){
  if((rank(id)&1)!==1)return false;
  const cols=legal(id);
  if(!cols.length)return false;
  for(const c of cols){
    const child=kernel.advance(id,c);
    if(child===domain.QN_TERMINAL_WIN||child<0)return false;
    if(!isImmediateWin(child))return false;
  }
  return true;
}
function findMoveToOverload(id){
  if((rank(id)&1)!==0)return null;
  for(const c of legal(id)){
    const child=kernel.advance(id,c);
    if(child>=0&&isOverloadLeaf(child))return {column:c,child};
  }
  return null;
}
function rankOne(id){
  const w=findMoveToOverload(id);
  if(!w)return null;
  return {
    expression:'E(O)',grammarRank:1,rootMove:w.column+1,
    rawReplyCount:0,distinctQClassCount:0,distinctExpressionCount:0,
    consequenceRows:[]
  };
}
function rankThree(id){
  if((rank(id)&1)!==0)return null;
  for(const rootColumn of legal(id)){
    const defender=kernel.advance(id,rootColumn);
    if(defender<0)continue;
    if(isOverloadLeaf(defender))continue;
    const replies=legal(defender);
    if(!replies.length)continue;
    const consequenceRows=[];
    let valid=true;
    for(const dc of replies){
      const attacker=kernel.advance(defender,dc);
      if(attacker===domain.QN_TERMINAL_WIN||attacker<0){valid=false;break;}
      const wins=immediateWinningColumns(attacker);
      if(wins.length){
        consequenceRows.push({
          defenderColumn:dc+1,lowerQClass:qClass(attacker),
          expression:'I',proved:true,witness:{immediateWinningColumns:wins.map(x=>x+1)}
        });
        continue;
      }
      const r1=rankOne(attacker);
      if(!r1){valid=false;break;}
      consequenceRows.push({
        defenderColumn:dc+1,lowerQClass:qClass(attacker),
        expression:r1.expression,proved:true,witness:{rootMove:r1.rootMove}
      });
    }
    if(!valid)continue;
    const expr=[...new Set(consequenceRows.map(x=>x.expression))].sort();
    return {
      expression:'E(A('+expr.join('|')+'))',
      grammarRank:3,rootMove:rootColumn+1,
      rawReplyCount:consequenceRows.length,
      distinctQClassCount:new Set(consequenceRows.map(x=>x.lowerQClass)).size,
      distinctExpressionCount:expr.length,
      consequenceRows
    };
  }
  return null;
}
const lowerProofCache=new Map();
function lowerProof(id){
  if(lowerProofCache.has(id))return lowerProofCache.get(id);
  const wins=immediateWinningColumns(id);
  let proof=null;
  if(wins.length){
    proof={
      expression:'I',grammarRank:0,rootMove:wins[0]+1,
      rawReplyCount:0,distinctQClassCount:0,distinctExpressionCount:1,
      consequenceRows:[],witness:{immediateWinningColumns:wins.map(x=>x+1)}
    };
  }else{
    proof=rankOne(id)??rankThree(id);
  }
  lowerProofCache.set(id,proof);
  return proof;
}

function rankFive(id){
  assert.equal(rank(id)&1,0);
  const attempts=[];
  for(const rootColumn of legal(id)){
    const defender=kernel.advance(id,rootColumn);
    if(defender===domain.QN_TERMINAL_WIN){
      throw new Error('source leaf unexpectedly has immediate root terminal on c'+(rootColumn+1));
    }
    if(defender<0){
      attempts.push({rootMove:rootColumn+1,proved:false,firstUnresolved:{kind:'illegal_or_terminal_root'}});
      continue;
    }
    const replies=legal(defender);
    if(!replies.length){
      attempts.push({rootMove:rootColumn+1,proved:false,firstUnresolved:{kind:'no_defender_reply'}});
      continue;
    }
    const lowerConsequences=[];
    let firstUnresolved=null;
    for(const dc of replies){
      const attacker=kernel.advance(defender,dc);
      if(attacker===domain.QN_TERMINAL_WIN||attacker<0){
        firstUnresolved={
          defenderColumn:dc+1,
          kind:attacker===domain.QN_TERMINAL_WIN?'DEFENDER_TERMINAL':'ILLEGAL',
          lowerQClass:null,rank:null,support:null
        };
        break;
      }
      const lower=lowerProof(attacker);
      if(!lower){
        firstUnresolved={
          defenderColumn:dc+1,kind:'NO_RANK_LE3_PROOF',
          lowerQClass:qClass(attacker),rank:rank(attacker),support:support(attacker)
        };
        break;
      }
      lowerConsequences.push({
        defenderColumn:dc+1,
        lowerQClass:qClass(attacker),
        rank:rank(attacker),
        support:support(attacker),
        proved:true,
        expression:lower.expression,
        grammarRank:lower.grammarRank,
        rootMove:lower.rootMove,
        witness:lower.witness??null,
        lowerRawReplyCount:lower.rawReplyCount,
        lowerDistinctQClassCount:lower.distinctQClassCount,
        lowerDistinctExpressionCount:lower.distinctExpressionCount
      });
    }
    if(firstUnresolved){
      attempts.push({
        rootMove:rootColumn+1,proved:false,
        rawDefenderReplyCount:replies.length,
        provedReplyPrefixCount:lowerConsequences.length,
        firstUnresolved
      });
      continue;
    }
    const expressions=[...new Set(lowerConsequences.map(x=>x.expression))].sort();
    const proof={
      rootMove:rootColumn+1,
      proved:true,
      expression:'E(A('+expressions.join('|')+'))',
      rawDefenderReplyCount:replies.length,
      distinctLowerQClassCount:new Set(lowerConsequences.map(x=>x.lowerQClass)).size,
      distinctLowerExpressionCount:expressions.length,
      lowerConsequences
    };
    attempts.push(proof);
    return {proof,attempts};
  }
  return {proof:null,attempts};
}

const rows=[];
for(const src of source.rows){
  assert.equal(src.proved,false);
  assert.equal(src.expression,null);
  const id=replay(src.sequence);
  assert.equal(rank(id),src.rank);
  assert.deepEqual(support(id),src.support);
  assert.equal(qClass(id),src.exactQClass);
  assert.deepEqual(immediateWinningColumns(id),src.immediateP0WinningColumns??[]);
  if(immediateWinningColumns(id).length)throw new Error('source leaf already immediate '+src.leafId);
  if(rankOne(id)||rankThree(id))throw new Error('source shallow-proof drift '+src.leafId);

  const {proof,attempts}=rankFive(id);
  rows.push({
    sourceLeafId:src.leafId,
    sourceStateId:src.sourceStateId,
    sequence:src.sequence,
    rank:rank(id),
    support:support(id),
    exactQClass:qClass(id),
    rank5Proved:!!proof,
    rank5Expression:proof?.expression??null,
    rootMove:proof?.rootMove??null,
    rawDefenderReplyCount:proof?.rawDefenderReplyCount??0,
    distinctLowerQClassCount:proof?.distinctLowerQClassCount??0,
    distinctLowerExpressionCount:proof?.distinctLowerExpressionCount??0,
    lowerConsequences:proof?.lowerConsequences??[],
    rootMoveAttempts:attempts
  });
}

const rank5Proved=rows.filter(x=>x.rank5Proved);
const unresolved=rows.filter(x=>!x.rank5Proved);
const summary={
  sourceLeafCount:rows.length,
  rank5ProvedCount:rank5Proved.length,
  cumulativeBoundedGrammarClosureCount:rank5Proved.length,
  unresolvedCount:unresolved.length,
  provedLeafIds:rank5Proved.map(x=>x.sourceLeafId),
  unresolvedLeafIds:unresolved.map(x=>x.sourceLeafId),
  unresolvedExactQClasses:unresolved.map(x=>x.exactQClass),
  expressionHistogram:Object.fromEntries(
    [...new Set(rank5Proved.map(x=>x.rank5Expression))].sort()
      .map(expr=>[expr,rank5Proved.filter(x=>x.rank5Expression===expr).length])
  )
};

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_forced_c3_rank5_local_grammar_probe.v1',
  date:'2026-10-01',
  sourceEvidence:{localGrammar:SOURCE,legacyMatrix:MATRIX},
  sourceLeafCount:rows.length,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  rows,
  summary,
  conclusion:[
    'The probe extends the existing bounded positive proof grammar by exactly one layer: each defender reply must reduce to I, E(O), or an already-qualified rank-3 E(A(...)) proof.',
    'No rank-5 recursive call is permitted; this is finite constructive composition rather than unrestricted value search.',
    rank5Proved.length
      ? 'At least one previously unresolved exact leaf closes at grammar rank 5, showing that the obstruction is partly compositional rather than requiring a new primitive local predicate.'
      : 'No exact first-failure leaf closes at grammar rank 5; the obstruction survives existing bounded local grammar through this additional composition layer.'
  ],
  boundary:[
    'This is bounded positive proof-grammar evidence only and does not by itself close the enclosing forced-c3 children or the rank-20 root.',
    'No oracle, solved W/D/L, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
