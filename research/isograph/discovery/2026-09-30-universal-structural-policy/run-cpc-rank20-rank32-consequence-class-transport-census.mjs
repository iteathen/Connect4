#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const root=resolve(import.meta.dirname,'../../../..');
const SOURCE='CPC_RANK20_FORCED_C3_RANK5_LOCAL_GRAMMAR_PROBE_0_1.json';
const SHALLOW='CPC_RANK20_FORCED_C3_FIRST_FAILURE_LOCAL_GRAMMAR_PROBE_0_1.json';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});

const kernelMod=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const {createSlot64ResidualQuotientKernel}=kernelMod;

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
const shallow=JSON.parse(readFileSync(resolve(import.meta.dirname,SHALLOW),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank20_forced_c3_rank5_local_grammar_probe.v1');
assert.equal(shallow.schema,'connect4.cpc_rank20_forced_c3_first_failure_local_grammar_probe.v1');
assert.equal(source.sourceLeafCount,11);
assert.equal(source.summary.rank5ProvedCount,0);
assert.equal(shallow.summary.provedCount,0);
for(const src of [source,shallow]){
  assert.equal(src.oracleUsed,false);
  assert.equal(src.solvedInputsUsed,false);
  assert.equal(src.productionCpcModified,false);
  assert.equal(src.jsMinSysModified,false);
  assert.equal(src.bsfpModified,false);
}

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
  const out=[];
  for(let c=0;c<7;c++){const x=landing(id,c);out.push(x===0xff?6:Math.floor(x/7));}
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
  const out=[];for(const c of legal(id))if(kernel.advance(id,c)===domain.QN_TERMINAL_WIN)out.push(c);return out;
}
function isImmediateWin(id){return immediateWinningColumns(id).length>0;}
function isOverloadLeaf(id){
  if((rank(id)&1)!==1)return false;
  const cols=legal(id);if(!cols.length)return false;
  for(const c of cols){
    const child=kernel.advance(id,c);
    if(child===domain.QN_TERMINAL_WIN||child<0||!isImmediateWin(child))return false;
  }
  return true;
}
function findMoveToOverload(id){
  if((rank(id)&1)!==0)return null;
  for(const c of legal(id)){const child=kernel.advance(id,c);if(child>=0&&isOverloadLeaf(child))return {column:c,child};}
  return null;
}
function rankOne(id){
  const w=findMoveToOverload(id);
  return w?{expression:'E(O)',rootMove:w.column+1}:null;
}
function rankThree(id){
  if((rank(id)&1)!==0)return null;
  for(const rootColumn of legal(id)){
    const defender=kernel.advance(id,rootColumn);
    if(defender<0||isOverloadLeaf(defender))continue;
    const replies=legal(defender);if(!replies.length)continue;
    const kinds=[];let valid=true;
    for(const dc of replies){
      const attacker=kernel.advance(defender,dc);
      if(attacker===domain.QN_TERMINAL_WIN||attacker<0){valid=false;break;}
      if(isImmediateWin(attacker)){kinds.push('I');continue;}
      const r1=rankOne(attacker);
      if(!r1){valid=false;break;}
      kinds.push('E(O)');
    }
    if(valid){
      const unique=[...new Set(kinds)].sort();
      return {expression:'E(A('+unique.join('|')+'))',rootMove:rootColumn+1};
    }
  }
  return null;
}
const lowerCache=new Map();
function classifyLower(id){
  if(lowerCache.has(id))return lowerCache.get(id);
  const wins=immediateWinningColumns(id);
  let x;
  if(wins.length)x={kind:'LOWER_I',expression:'I',witness:{immediateWinningColumns:wins.map(c=>c+1)}};
  else {
    const r1=rankOne(id);
    if(r1)x={kind:'LOWER_EO',expression:r1.expression,witness:{rootMove:r1.rootMove}};
    else {
      const r3=rankThree(id);
      x=r3?{kind:'LOWER_RANK3',expression:r3.expression,witness:{rootMove:r3.rootMove}}:{kind:'UNRESOLVED_Q',expression:null,witness:null};
    }
  }
  lowerCache.set(id,x);return x;
}

const rows=[];
const unresolvedInstances=[];
for(const src of source.rows){
  const id=replay(src.sequence);
  assert.equal(rank(id),30);
  assert.equal(qClass(id),src.exactQClass);
  assert.equal(src.rank5Proved,false);
  const transitions=[];
  for(const p0 of legal(id)){
    const defender=kernel.advance(id,p0);
    if(defender===domain.QN_TERMINAL_WIN){
      transitions.push({
        p0Move:p0+1,p1Reply:null,macroLabel:'c'+(p0+1)+'>I',
        kind:'ROOT_I',targetQClass:null,targetRank:null,targetSupport:null,
        proofExpression:'I',proofWitness:{rootMove:p0+1}
      });
      continue;
    }
    if(defender<0)continue;
    for(const p1 of legal(defender)){
      const lower=kernel.advance(defender,p1);
      if(lower===domain.QN_TERMINAL_WIN){
        transitions.push({
          p0Move:p0+1,p1Reply:p1+1,macroLabel:'c'+(p0+1)+'>c'+(p1+1),
          kind:'DEFENDER_TERMINAL',targetQClass:null,targetRank:null,targetSupport:null,
          proofExpression:null,proofWitness:null
        });
        continue;
      }
      if(lower<0)continue;
      assert.equal(rank(lower),32);
      const cls=classifyLower(lower),qid=qClass(lower);
      const row={
        p0Move:p0+1,p1Reply:p1+1,macroLabel:'c'+(p0+1)+'>c'+(p1+1),
        kind:cls.kind,targetQClass:qid,targetRank:rank(lower),targetSupport:support(lower),
        proofExpression:cls.expression,proofWitness:cls.witness
      };
      transitions.push(row);
      if(cls.kind==='UNRESOLVED_Q')unresolvedInstances.push({
        sourceLeafId:src.sourceLeafId,sourceQClass:src.exactQClass,...row
      });
    }
  }
  const unresolvedTargets=transitions.filter(x=>x.kind==='UNRESOLVED_Q').map(x=>x.targetQClass);
  rows.push({
    sourceLeafId:src.sourceLeafId,sourceQClass:src.exactQClass,sourceRank:30,sourceSupport:src.support,
    rawTransitionCount:transitions.length,
    consequenceKinds:[...new Set(transitions.map(x=>x.kind))].sort(),
    unresolvedTargetQClasses:unresolvedTargets,
    quotientUnresolvedArity:new Set(unresolvedTargets).size,
    transitions
  });
}

const groups=new Map();
for(const x of unresolvedInstances){
  if(!groups.has(x.targetQClass))groups.set(x.targetQClass,[]);
  groups.get(x.targetQClass).push(x);
}
const unresolvedQClasses=[...groups].map(([qid,g])=>({
  exactQClass:qid,rank:g[0].targetRank,support:g[0].targetSupport,
  incomingTransitionCount:g.length,
  sourceQClasses:[...new Set(g.map(x=>x.sourceQClass))].sort(),
  sourceLeafIds:[...new Set(g.map(x=>x.sourceLeafId))].sort(),
  p0RootMoves:[...new Set(g.map(x=>x.p0Move))].sort((a,b)=>a-b),
  p1ReplyMoves:[...new Set(g.map(x=>x.p1Reply))].sort((a,b)=>a-b),
  macroLabels:[...new Set(g.map(x=>x.macroLabel))].sort(),
  reachedFromMultipleSourceLeaves:new Set(g.map(x=>x.sourceLeafId)).size>1,
  reachedThroughMultipleMacroLabels:new Set(g.map(x=>x.macroLabel)).size>1,
  incoming:g.map(x=>({sourceLeafId:x.sourceLeafId,sourceQClass:x.sourceQClass,p0Move:x.p0Move,p1Reply:x.p1Reply,macroLabel:x.macroLabel}))
})).sort((a,b)=>b.incomingTransitionCount-a.incomingTransitionCount||a.exactQClass.localeCompare(b.exactQClass));

const rawTransitionCount=rows.reduce((s,x)=>s+x.rawTransitionCount,0);
const unresolvedTransitionCount=unresolvedInstances.length;
const repeated=unresolvedQClasses.filter(x=>x.incomingTransitionCount>1);
const summary={
  sourceLeafCount:rows.length,
  rawTransitionCount,
  unresolvedTransitionCount,
  terminalOrProvedTransitionCount:rawTransitionCount-unresolvedTransitionCount,
  uniqueUnresolvedQClassCount:unresolvedQClasses.length,
  repeatedUnresolvedQClassCount:repeated.length,
  repeatedAcrossSourceLeafCount:unresolvedQClasses.filter(x=>x.reachedFromMultipleSourceLeaves).length,
  repeatedAcrossMacroLabelCount:unresolvedQClasses.filter(x=>x.reachedThroughMultipleMacroLabels).length,
  unresolvedCompressionFraction:unresolvedTransitionCount?1-unresolvedQClasses.length/unresolvedTransitionCount:0,
  maxIncomingMultiplicity:unresolvedQClasses.length?Math.max(...unresolvedQClasses.map(x=>x.incomingTransitionCount)):0,
  maxSourcePhysicalTransitions:Math.max(...rows.map(x=>x.rawTransitionCount)),
  maxSourceQuotientUnresolvedArity:Math.max(...rows.map(x=>x.quotientUnresolvedArity))
};

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_rank32_consequence_class_transport_census.v1',
  date:'2026-10-01',
  sourceEvidence:{rank5:SOURCE,shallowGrammar:SHALLOW},
  sourceLeafCount:rows.length,
  oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,jsMinSysModified:false,bsfpModified:false,
  rows,unresolvedQClasses,summary,
  conclusion:[
    'The census enumerates one complete P0/P1 macro-step from every unresolved rank-30 source q and classifies lower states only by terminal facts or the already-qualified rank<=3 positive grammar.',
    'Unresolved lower states are normalized solely by exact semantic q identity; no value or new proof rule is assigned.',
    repeated.length
      ? 'Multiple physical transition instances converge onto repeated unresolved exact-q consequence classes, so exact-q transport provides real branch compression at this layer.'
      : 'Unresolved transition instances do not materially converge under exact-q identity at this layer.'
  ],
  boundary:[
    'This is consequence-class transport evidence only and does not assign W/D/L value to any unresolved q class.',
    'No oracle, solved W/D/L, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
