#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const RANK5='CPC_RANK20_FORCED_C3_RANK5_LOCAL_GRAMMAR_PROBE_0_1.json';
const EXCHANGE='CPC_RANK20_RANK32_CONSEQUENCE_EXCHANGE_CENSUS_0_1.json';
const root=resolve(import.meta.dirname,'../../../..');
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const NODE_CAP=100000;

const {createSlot64ResidualQuotientKernel}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const {createRepairCapacityProofEngine}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs')).href);

const rank5=JSON.parse(readFileSync(resolve(import.meta.dirname,RANK5),'utf8'));
const exchange=JSON.parse(readFileSync(resolve(import.meta.dirname,EXCHANGE),'utf8'));
assert.equal(rank5.schema,'connect4.cpc_rank20_forced_c3_rank5_local_grammar_probe.v1');
assert.equal(exchange.schema,'connect4.cpc_rank20_rank32_consequence_exchange_census.v1');
assert.equal(rank5.summary.unresolvedCount,11);
assert.equal(exchange.sourceTransitionCount,36);
assert.equal(exchange.distinctSourceQClasses,24);
for(const x of [rank5,exchange]){
  assert.equal(x.oracleUsed,false);
  assert.equal(x.solvedInputsUsed,false);
  assert.equal(x.productionCpcModified,false);
  assert.equal(x.jsMinSysModified,false);
  assert.equal(x.bsfpModified,false);
}

function makeKernel(){
  const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
    cacheEdges:true,prefixClasses:4096,responseClosure:true,
    searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})
  });
  kernel.prepareSearchStorage();
  return kernel;
}
function replay(kernel,sequence){
  let id=kernel.rootId;
  for(const d of sequence){
    const child=kernel.advance(id,Number(d)-1);
    if(!Number.isSafeInteger(child)||child<0)throw new Error('bad replay '+sequence);
    id=child;
  }
  return id;
}
function support(engine,state){return engine.heights(state);}
function hasBit(term,cell){return cell<32?(((term[0]>>>cell)&1)!==0):(((term[1]>>>(cell-32))&1)!==0);}
function termCells(term){const out=[];for(let c=0;c<42;c++)if(hasBit(term,c))out.push(c);return out;}
function termKeys(kernel,state,p){
  const cid=p===0?kernel.states.p0At(state):kernel.states.p1At(state);
  return kernel.classes.terms(cid).map(termCells).map(c=>c.join(',')).sort();
}
function exactKey(kernel,engine,state){
  return 'r'+engine.rank(state)+'|h'+support(engine,state).join(',')+'|p0:'+termKeys(kernel,state,0).join(';')+'|p1:'+termKeys(kernel,state,1).join(';');
}
function qClass(kernel,engine,state){return createHash('sha256').update(exactKey(kernel,engine,state)).digest('hex').slice(0,16);}
function errorKind(error){
  const m=String(error?.message??error);
  if(m.includes('forced-obligation node cap exceeded'))return 'proof_node_cap_exceeded';
  if(m.includes('reserved quotient state capacity exhausted'))return 'state_capacity_exhausted';
  if(m.includes('reserved quotient class capacity exhausted'))return 'class_capacity_exhausted';
  return 'execution_error';
}
function compactProof(p,depth=0){
  if(!p)return null;
  if(depth>8)return {kind:'DEPTH_TRUNCATED'};
  return {
    loss:p.loss,kind:p.kind,obligation:p.obligation??null,obligations:p.obligations??null,
    forcedColumn:p.forcedColumn??null,adversarialReply:p.adversarialReply??null,
    replyCell:p.replyCell??null,escapeAction:p.escapeAction??null,
    escapeReason:p.escapeReason??null,
    child:p.child?compactProof(p.child,depth+1):null
  };
}

function proveClass(sequence,expectedQ){
  const kernel=makeKernel();
  const engine=createRepairCapacityProofEngine(kernel,{maxProofStates:1});
  const start=replay(kernel,sequence);
  assert.equal(engine.rank(start),32,'rank32 representative drift');
  assert.equal(qClass(kernel,engine,start),expectedQ,'representative q drift');

  const memo=new Map();
  const stats={nodes:0,maxDepth:0,multiDefects:0,forcedNodes:0,terminalWitnesses:0,childLossWitnesses:0,zeroObligationNodes:0};
  function prove(state,depth=0){
    if(stats.nodes>=NODE_CAP)throw new Error('forced-obligation node cap exceeded '+NODE_CAP);
    assert.equal(engine.rank(state)&1,0,'forced-loss node must be P0 turn');
    const key=exactKey(kernel,engine,state);
    if(memo.has(key))return memo.get(key);
    stats.nodes++;stats.maxDepth=Math.max(stats.maxDepth,depth);

    const p0Terminals=engine.terminalActions(state,0);
    if(p0Terminals.length){
      const out={loss:false,kind:'P0_TERMINAL_AVAILABLE',terminalActions:p0Terminals.map(x=>engine.col(x.column))};
      memo.set(key,out);return out;
    }

    const obligations=[...new Set(engine.enabledSingletons(state,1))];
    if(obligations.length===0){
      stats.zeroObligationNodes++;
      const out={loss:false,kind:'NO_ENABLED_P1_OBLIGATION'};
      memo.set(key,out);return out;
    }

    if(obligations.length>=2){
      const actions=[];
      for(const action of engine.legal(state)){
        const actionCell=engine.landing(state,action);
        const afterP0=kernel.advance(state,action);
        if(afterP0===domain.QN_TERMINAL_WIN){
          const out={loss:false,kind:'MULTI_OBLIGATION_P0_TERMINAL_ESCAPE',obligations:obligations.map(engine.coord),escapeAction:engine.col(action),escapeReason:'P0_terminal'};
          memo.set(key,out);return out;
        }
        assert(afterP0>=0);
        const terminals=engine.terminalActions(afterP0,1);
        actions.push({action:engine.col(action),actionCell:engine.coord(actionCell),p1TerminalCells:terminals.map(x=>engine.coord(x.cell))});
        if(terminals.length===0){
          const out={loss:false,kind:'MULTI_OBLIGATION_ESCAPE',obligations:obligations.map(engine.coord),escapeAction:engine.col(action),escapeReason:'no_immediate_P1_terminal',actions};
          memo.set(key,out);return out;
        }
      }
      stats.multiDefects++;
      const out={loss:true,kind:'MULTI_OBLIGATION_CAPACITY_DEFECT',obligations:obligations.map(engine.coord),actions};
      memo.set(key,out);return out;
    }

    stats.forcedNodes++;
    const threat=obligations[0],forcedColumn=threat%7;
    if(engine.landing(state,forcedColumn)!==threat){
      const out={loss:false,kind:'SINGLETON_NOT_PLAYABLE_OBLIGATION',obligation:engine.coord(threat)};
      memo.set(key,out);return out;
    }

    const nonblocking=[];
    for(const action of engine.legal(state)){
      if(action===forcedColumn)continue;
      const afterP0=kernel.advance(state,action);
      if(afterP0===domain.QN_TERMINAL_WIN){
        const out={loss:false,kind:'SINGLE_OBLIGATION_P0_TERMINAL_ESCAPE',obligation:engine.coord(threat),escapeAction:engine.col(action),escapeReason:'P0_terminal'};
        memo.set(key,out);return out;
      }
      assert(afterP0>=0);
      const terminals=engine.terminalActions(afterP0,1);
      nonblocking.push({action:engine.col(action),p1TerminalCells:terminals.map(x=>engine.coord(x.cell))});
      if(terminals.length===0){
        const out={loss:false,kind:'SINGLETON_NOT_FORCED',obligation:engine.coord(threat),escapeAction:engine.col(action),escapeReason:'nonblocking_action_without_P1_terminal',nonblocking};
        memo.set(key,out);return out;
      }
    }

    const afterBlock=kernel.advance(state,forcedColumn);
    if(afterBlock===domain.QN_TERMINAL_WIN){
      const out={loss:false,kind:'FORCED_BLOCK_IS_P0_TERMINAL',obligation:engine.coord(threat),forcedColumn:engine.col(forcedColumn),nonblocking};
      memo.set(key,out);return out;
    }
    assert(afterBlock>=0);

    const replyRows=[];
    for(const reply of engine.legal(afterBlock)){
      const replyCell=engine.landing(afterBlock,reply);
      const child=kernel.advance(afterBlock,reply);
      if(child===domain.QN_TERMINAL_WIN){
        stats.terminalWitnesses++;
        const out={loss:true,kind:'FORCED_BLOCK_THEN_P1_TERMINAL',obligation:engine.coord(threat),forcedColumn:engine.col(forcedColumn),adversarialReply:engine.col(reply),replyCell:engine.coord(replyCell),nonblocking};
        memo.set(key,out);return out;
      }
      assert(child>=0);
      if(engine.terminalActions(child,0).length){
        replyRows.push({reply:engine.col(reply),result:'P0_terminal_available'});
        continue;
      }
      const sub=prove(child,depth+1);
      replyRows.push({reply:engine.col(reply),result:sub.loss?'child_loss':'unknown',childKind:sub.kind});
      if(sub.loss){
        stats.childLossWitnesses++;
        const out={loss:true,kind:'FORCED_BLOCK_THEN_CHILD_LOSS',obligation:engine.coord(threat),forcedColumn:engine.col(forcedColumn),adversarialReply:engine.col(reply),replyCell:engine.coord(replyCell),child:sub,nonblocking,replyRows};
        memo.set(key,out);return out;
      }
    }
    const out={loss:false,kind:'FORCED_BLOCK_HAS_NO_CERTIFIED_LOSING_REPLY',obligation:engine.coord(threat),forcedColumn:engine.col(forcedColumn),nonblocking,replyRows};
    memo.set(key,out);return out;
  }

  let proof=null,resourceFailure=null;
  try{proof=prove(start,0);}
  catch(error){resourceFailure={kind:errorKind(error),message:String(error?.message??error)};}
  return {
    proofCompleted:resourceFailure===null,
    lossCertified:proof?.loss===true,
    proofKind:proof?.kind??null,
    rootObligations:engine.enabledSingletons(start,1).map(engine.coord),
    rootP0TerminalActions:engine.terminalActions(start,0).map(x=>engine.col(x.column)),
    compactProof:compactProof(proof),
    resourceFailure,
    stats
  };
}

const sourceGroups=new Map();
for(const row of exchange.sourceTransitions){
  if(!sourceGroups.has(row.lowerQClass))sourceGroups.set(row.lowerQClass,[]);
  sourceGroups.get(row.lowerQClass).push(row);
}
assert.equal(sourceGroups.size,24);

const rank32Classes=[];
const lossMap=new Map();
let resourceFailureCount=0;
for(const [q,occurrences0] of [...sourceGroups.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){
  const occurrences=[...occurrences0].sort((a,b)=>a.sequence.localeCompare(b.sequence));
  const representative=occurrences[0];
  const result=proveClass(representative.sequence,q);
  if(result.resourceFailure)resourceFailureCount++;

  // Every additional physical occurrence must be exactly the same q, not merely share support.
  const identityChecks=[];
  for(const occurrence of occurrences){
    const k=makeKernel(),e=createRepairCapacityProofEngine(k,{maxProofStates:1}),state=replay(k,occurrence.sequence);
    const actual=qClass(k,e,state);
    identityChecks.push({sequence:occurrence.sequence,expected:q,actual,pass:actual===q});
    assert.equal(actual,q,'shared class physical occurrence q drift');
  }
  const row={
    exactQClass:q,
    rank:32,
    support:representative.lowerSupport,
    occurrenceCount:occurrences.length,
    occurrences,
    identityChecks,
    ...result
  };
  rank32Classes.push(row);
  lossMap.set(q,row);
}

const sourceLeaves=[];
for(const row of rank5.rows){
  const kernel=makeKernel(),engine=createRepairCapacityProofEngine(kernel,{maxProofStates:1});
  const state=replay(kernel,row.sequence);
  assert.equal(engine.rank(state),30);
  assert.equal(qClass(kernel,engine,state),row.exactQClass);

  const rootActions=[];
  for(const attempt of row.rootMoveAttempts){
    const action=attempt.rootMove;
    const afterP0=kernel.advance(state,action-1);
    assert(afterP0>=0&&afterP0!==domain.QN_TERMINAL_WIN,'rank5 root action unexpectedly terminal');
    const u=attempt.firstUnresolved;
    let eliminated=false,eliminationKind='UNRESOLVED',adversarialReply=u?.defenderColumn??null,lowerQClass=u?.lowerQClass??null;

    if(u?.kind==='DEFENDER_TERMINAL'){
      const child=kernel.advance(afterP0,u.defenderColumn-1);
      assert.equal(child,domain.QN_TERMINAL_WIN,'frozen defender terminal drift');
      eliminated=true;eliminationKind='DEFENDER_TERMINAL';
    }else if(u?.kind==='NO_RANK_LE3_PROOF'){
      const child=kernel.advance(afterP0,u.defenderColumn-1);
      assert(child>=0&&child!==domain.QN_TERMINAL_WIN,'rank32 handoff terminal drift');
      assert.equal(qClass(kernel,engine,child),u.lowerQClass);
      const loss=lossMap.get(u.lowerQClass);
      assert(loss);
      if(loss.lossCertified){
        eliminated=true;eliminationKind='RANK32_FORCED_OBLIGATION_LOSS';
      }
    }else{
      eliminationKind='UNHANDLED_SOURCE_FAILURE_KIND';
    }
    rootActions.push({
      rootMove:action,
      adversarialReply,
      sourceFailureKind:u?.kind??null,
      lowerQClass,
      eliminated,
      eliminationKind,
      lowerLossProofKind:lowerQClass?lossMap.get(lowerQClass)?.proofKind??null:null
    });
  }
  const fullyActionEliminated=rootActions.length>0&&rootActions.every(x=>x.eliminated);
  sourceLeaves.push({
    sourceLeafId:row.sourceLeafId,
    sourceStateId:row.sourceStateId,
    sequence:row.sequence,
    exactQClass:row.exactQClass,
    rank:30,
    support:row.support,
    rootActions,
    eliminatedActionCount:rootActions.filter(x=>x.eliminated).length,
    survivingRootMoves:rootActions.filter(x=>!x.eliminated).map(x=>x.rootMove),
    fullyActionEliminated,
    lossCertificate:fullyActionEliminated?{
      kind:'UNIVERSAL_P0_ACTION_ADVERSARIAL_ELIMINATION',
      actionWitnesses:rootActions.map(x=>({rootMove:x.rootMove,adversarialReply:x.adversarialReply,eliminationKind:x.eliminationKind,lowerQClass:x.lowerQClass}))
    }:null
  });
}

const rank32Loss=rank32Classes.filter(x=>x.lossCertified);
const rank30Loss=sourceLeaves.filter(x=>x.fullyActionEliminated);

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_rank32_forced_obligation_loss_census.v1',
  date:'2026-10-01',
  design:'CPC_RANK20_RANK32_FORCED_OBLIGATION_LOSS_CENSUS_DESIGN_0_1.md',
  sourceEvidence:{rank5:RANK5,exchange:EXCHANGE},
  sourceTransitionCount:exchange.sourceTransitionCount,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  rank32Classes,
  sourceLeaves,
  summary:{
    rank32ClassCount:rank32Classes.length,
    rank32LossCertifiedCount:rank32Loss.length,
    rank32LossCertifiedQClasses:rank32Loss.map(x=>x.exactQClass),
    rank32UnknownCount:rank32Classes.length-rank32Loss.length,
    rank30LeafCount:sourceLeaves.length,
    rank30LossCertifiedCount:rank30Loss.length,
    rank30LossCertifiedLeafIds:rank30Loss.map(x=>x.sourceLeafId),
    rank30LeavesWithNewlyEliminatedActions:sourceLeaves.filter(x=>x.rootActions.some(a=>a.eliminationKind==='RANK32_FORCED_OBLIGATION_LOSS')).map(x=>x.sourceLeafId),
    resourceFailureCount
  },
  conclusion:[
    'The 24 exact rank-32 consequence classes are tested with the already-qualified forced-obligation loss architecture; unknown states are never promoted to losses.',
    rank32Loss.length
      ? 'At least one rank-32 consequence class receives an exact forced-obligation P0-loss certificate, so every incoming rank-30 action with that adversarial reply is soundly eliminated.'
      : 'No rank-32 consequence class receives a forced-obligation loss certificate; this loss family does not eliminate additional rank-30 actions.',
    rank30Loss.length
      ? 'At least one rank-30 first-failure leaf has every legal P0 action adversarially eliminated and therefore receives an exact P0-loss certificate.'
      : 'No rank-30 first-failure leaf is fully action-eliminated by the combined immediate-terminal and rank-32 forced-obligation routes.',
    'Resource failures, if any, remain unknown rather than theorem rejections.'
  ],
  boundary:[
    'Unknown is never treated as loss.',
    'This is loss-only structural proof evidence and does not assert that the enclosing rank-28 or rank-20 state is P0-winning.',
    'No oracle, solved W/D/L, minimax, unrestricted value search, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.'
  ]
},null,2));
