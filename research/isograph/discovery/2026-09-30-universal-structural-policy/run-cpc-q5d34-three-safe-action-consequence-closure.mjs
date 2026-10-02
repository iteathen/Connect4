#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE='CPC_Q5D34_MONOTONE_PROOF_LIBRARY_AUDIT_0_1.json';
const SOURCE_Q='5d34e24395b9d801';
const SOURCE_SEQUENCE='4444415666662322224255115153113777';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const root=resolve(import.meta.dirname,'../../../..');

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_q5d34_monotone_proof_library_audit.v1');
assert.equal(source.exactQClass,SOURCE_Q);
assert.equal(source.sequence,SOURCE_SEQUENCE);
assert.equal(source.rank,34);
assert.deepEqual(source.support,[6,6,3,6,5,5,3]);
assert.deepEqual(source.terminalSafeP0Columns,[5,6,7]);
assert.equal(source.disposition,'UNKNOWN');

const {createSlot64ResidualQuotientKernel}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const {createRepairCapacityProofEngine}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs')).href);

function makeKernel(){
  const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
    cacheEdges:true,prefixClasses:4096,responseClosure:true,
    searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})
  });
  kernel.prepareSearchStorage();return kernel;
}
function replay(k,sequence){
  let id=k.rootId;
  for(const d of sequence){
    const n=k.advance(id,Number(d)-1);
    if(!Number.isSafeInteger(n)||n<0)throw new Error('bad replay '+sequence);
    id=n;
  }
  return id;
}
function rank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function landing(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function legal(k,id){const out=[];for(let c=0;c<7;c++)if(landing(k,id,c)!==0xff)out.push(c);return out;}
function support(k,id){const out=[];for(let c=0;c<7;c++){const x=landing(k,id,c);out.push(x===0xff?6:Math.floor(x/7));}return out;}
function hasBit(term,cell){return cell<32?(((term[0]>>>cell)&1)!==0):(((term[1]>>>(cell-32))&1)!==0);}
function termCells(term){const out=[];for(let i=0;i<42;i++)if(hasBit(term,i))out.push(i);return out;}
function termKeys(k,id,p){const cid=p===0?k.states.p0At(id):k.states.p1At(id);return k.classes.terms(cid).map(termCells).map(x=>x.join(',')).sort();}
function exactKey(k,id){return 'r'+rank(k,id)+'|h'+support(k,id).join(',')+'|p0:'+termKeys(k,id,0).join(';')+'|p1:'+termKeys(k,id,1).join(';');}
function qClass(k,id){return createHash('sha256').update(exactKey(k,id)).digest('hex').slice(0,16);}

function forcedSafety(k,start,startSequence,engine){
  let state=start,sequence=startSequence;
  const startQ=qClass(k,state),startRank=rank(k,state),startSupport=support(k,state);
  const steps=[],forcedMoves=[];
  let classification=null,terminal={};
  const horizon=42-startRank;
  for(let iteration=0;iteration<=horizon;iteration++){
    const r=rank(k,state),mover=r&1,opp=mover^1,moverName=mover===0?'P0':'P1',oppName=opp===0?'P0':'P1';
    const legalActions=legal(k,state),immediate=engine.terminalActions(state,mover);
    const step={
      index:iteration,sequence,exactQClass:qClass(k,state),rank:r,support:support(k,state),mover:moverName,
      legalActions:legalActions.map(x=>x+1),
      immediateTerminalActions:immediate.map(x=>({column:x.column+1,cell:engine.coord(x.cell)})),
      actionAudit:[],safeActions:[],forcedAction:null
    };
    if(immediate.length){
      classification=mover===0?'P0_WIN_FORCED_CHAIN':'P0_LOSS_FORCED_CHAIN';
      terminal={kind:'MOVER_IMMEDIATE_TERMINAL',winner:moverName,winningActions:step.immediateTerminalActions};
      steps.push(step);break;
    }
    if(!legalActions.length){
      classification='DRAW_FULL_BOARD';terminal={kind:'FULL_BOARD_DRAW'};steps.push(step);break;
    }
    const safe=[];
    for(const action of legalActions){
      const actionCell=landing(k,state,action),child=k.advance(state,action);
      if(child===domain.QN_TERMINAL_WIN){
        step.actionAudit.push({column:action+1,cell:engine.coord(actionCell),moverTerminal:true,childQ:null,childSupport:null,opponentImmediateTerminals:[],safe:true});
        safe.push({action,child,terminal:true});continue;
      }
      assert(child>=0&&rank(k,child)===r+1);
      const oppImmediate=engine.terminalActions(child,opp),isSafe=oppImmediate.length===0;
      step.actionAudit.push({
        column:action+1,cell:engine.coord(actionCell),moverTerminal:false,childQ:qClass(k,child),childSupport:support(k,child),
        opponentImmediateTerminals:oppImmediate.map(x=>({column:x.column+1,cell:engine.coord(x.cell)})),safe:isSafe
      });
      if(isSafe)safe.push({action,child,terminal:false});
    }
    step.safeActions=safe.map(x=>x.action+1);
    if(!safe.length){
      classification=opp===0?'P0_WIN_FORCED_CHAIN':'P0_LOSS_FORCED_CHAIN';
      terminal={kind:'ZERO_SAFE_ACTIONS',winner:oppName};steps.push(step);break;
    }
    if(safe.length>1){
      classification='UNRESOLVED_MULTIPLE_SAFE';
      terminal={kind:'MULTIPLE_SAFE_ACTIONS',safeActions:step.safeActions};steps.push(step);break;
    }
    const chosen=safe[0];
    step.forcedAction=chosen.action+1;
    steps.push(step);
    forcedMoves.push(chosen.action+1);
    if(chosen.terminal){
      classification=mover===0?'P0_WIN_FORCED_CHAIN':'P0_LOSS_FORCED_CHAIN';
      terminal={kind:'FORCED_ACTION_TERMINAL',winner:moverName,column:chosen.action+1};break;
    }
    sequence+=String(chosen.action+1);
    state=chosen.child;
  }
  if(!classification)throw new Error('forced-safety chain exceeded physical horizon');
  const finalStep=steps.at(-1);
  const unresolvedFork=classification==='UNRESOLVED_MULTIPLE_SAFE'
    ? {exactQClass:finalStep.exactQClass,sequence:finalStep.sequence,rank:finalStep.rank,support:finalStep.support,mover:finalStep.mover,safeActions:finalStep.safeActions}
    : null;
  return {startQ,startRank,startSupport,startSequence,classification,forcedSequence:forcedMoves,steps,terminal,unresolvedFork};
}

const k=makeKernel(),engine=createRepairCapacityProofEngine(k,{maxProofStates:1});
const sourceState=replay(k,SOURCE_SEQUENCE);
assert.equal(rank(k,sourceState),34);
assert.equal(qClass(k,sourceState),SOURCE_Q);
assert.deepEqual(support(k,sourceState),[6,6,3,6,5,5,3]);
assert.deepEqual(legal(k,sourceState).map(x=>x+1),[3,5,6,7]);
assert.deepEqual(engine.terminalActions(sourceState,0),[]);

const recomputedSafe=[];
const rootActionAudit=[];
for(const action of legal(k,sourceState)){
  const cell=landing(k,sourceState,action),child=k.advance(sourceState,action);
  if(child===domain.QN_TERMINAL_WIN){
    recomputedSafe.push(action+1);
    rootActionAudit.push({column:action+1,cell:engine.coord(cell),moverTerminal:true,safe:true,opponentImmediateTerminals:[]});
    continue;
  }
  assert(child>=0);
  const oppImmediate=engine.terminalActions(child,1),safe=oppImmediate.length===0;
  rootActionAudit.push({
    column:action+1,cell:engine.coord(cell),moverTerminal:false,safe,
    childQ:qClass(k,child),childSupport:support(k,child),
    opponentImmediateTerminals:oppImmediate.map(x=>({column:x.column+1,cell:engine.coord(x.cell)}))
  });
  if(safe)recomputedSafe.push(action+1);
}
assert.deepEqual(recomputedSafe,[5,6,7]);

const children=[];
for(const p0Action of recomputedSafe){
  const action=p0Action-1,cell=landing(k,sourceState,action),child=k.advance(sourceState,action);
  assert(child>=0&&child!==domain.QN_TERMINAL_WIN);
  assert.equal(rank(k,child),35);
  const seq=SOURCE_SEQUENCE+String(p0Action);
  children.push({
    p0Action,
    p0LandingCell:engine.coord(cell),
    ...forcedSafety(k,child,seq,engine)
  });
}
children.sort((a,b)=>a.p0Action-b.p0Action);

let classification;
if(children.some(x=>x.classification==='P0_WIN_FORCED_CHAIN'))classification='P0_WIN_EXISTS_SAFE_ACTION';
else if(children.every(x=>x.classification==='P0_LOSS_FORCED_CHAIN'||x.classification==='DRAW_FULL_BOARD'))classification='P0_NONWIN_ALL_SAFE_ACTIONS';
else classification='UNKNOWN';

const qMembers=new Map();
for(const child of children){
  for(const step of child.steps){
    if(!qMembers.has(step.exactQClass))qMembers.set(step.exactQClass,[]);
    qMembers.get(step.exactQClass).push({p0Action:child.p0Action,sequence:step.sequence,rank:step.rank,mover:step.mover});
  }
}
const exactQMergeGroups=[...qMembers.entries()].map(([exactQClass,members])=>({
  exactQClass,memberCount:members.length,members
})).sort((a,b)=>b.memberCount-a.memberCount||a.exactQClass.localeCompare(b.exactQClass));

console.log(JSON.stringify({
  schema:'connect4.cpc_q5d34_three_safe_action_consequence_closure.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  design:'CPC_Q5D34_THREE_SAFE_ACTION_CONSEQUENCE_CLOSURE_DESIGN_0_1.md',
  sourceEvidence:SOURCE,
  sourceQ:SOURCE_Q,
  sequence:SOURCE_SEQUENCE,
  rank:34,
  support:[6,6,3,6,5,5,3],
  rootActionAudit,
  safeP0Actions:recomputedSafe,
  children,
  exactQMergeGroups,
  classification,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  legacyRepairModified:false,
  rcicModified:false,
  bsfpModified:false,
  conclusion:[
    'q5d34 is reconstructed by exact semantic identity and its complete terminal-safe P0 action set E/F/G is independently rederived.',
    'Each safe action is followed only through the already-qualified one-ply terminal-safety operator; unique-safe consequences are transported and the first multiple-safe fork is preserved without recursive branch search.',
    classification==='P0_WIN_EXISTS_SAFE_ACTION'
      ? 'At least one of E/F/G reaches an exact P0-winning forced-safety chain, giving q5d34 a constructive P0-win certificate.'
      : classification==='P0_NONWIN_ALL_SAFE_ACTIONS'
        ? 'All three safe P0 actions are proved nonwinning by exact forced-safety consequences; the already-known unsafe C action supplies no escape.'
        : 'At least one E/F/G consequence reaches another multiple-safe obstruction and no E/F/G route is yet a qualified P0 win; q5d34 remains unknown.',
    'Exact semantic-q mergers between physical histories are reported separately and are never inferred from support equality.'
  ],
  boundary:[
    'No solved W/D/L, oracle, Pons score, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.',
    'No branching beyond one-ply terminal exposure is recursively evaluated.',
    'Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.'
  ]
},null,2));
