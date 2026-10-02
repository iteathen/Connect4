#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE_CHAIN='CPC_Q966_G_BRANCH_FORCED_SAFETY_0_1.json';
const SOURCE_AUDIT='CPC_Q5D34_MONOTONE_PROOF_LIBRARY_AUDIT_0_1.json';
const TARGET_Q='5d34e24395b9d801';
const TARGET_SEQUENCE='4444415666662322224255115153113777';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const root=resolve(import.meta.dirname,'../../../..');

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

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
  for(const d of sequence){const n=k.advance(id,Number(d)-1);if(!Number.isSafeInteger(n)||n<0)throw new Error('bad replay '+sequence);id=n;}
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

function forcedSafety(k,start,startSequence){
  const engine=createRepairCapacityProofEngine(k,{maxProofStates:1});
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
    const chosen=safe[0];step.forcedAction=chosen.action+1;steps.push(step);forcedMoves.push(chosen.action+1);
    if(chosen.terminal){
      classification=mover===0?'P0_WIN_FORCED_CHAIN':'P0_LOSS_FORCED_CHAIN';
      terminal={kind:'FORCED_ACTION_TERMINAL',winner:moverName,column:chosen.action+1};break;
    }
    sequence+=String(chosen.action+1);state=chosen.child;
  }
  if(!classification)throw new Error('forced safety exceeded physical horizon');
  return {startQ,startRank,startSupport,startSequence,classification,forcedSequence:forcedMoves,steps,terminal};
}


const sourceChain=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE_CHAIN),'utf8'));
assert.equal(sourceChain.schema,'connect4.cpc_q966_g_branch_forced_safety.v1');
assert.equal(sourceChain.classification,'UNRESOLVED_MULTIPLE_SAFE');
const frozen=sourceChain.steps.at(-1);assert(frozen);
assert.equal(frozen.exactQClass,TARGET_Q);
assert.equal(frozen.sequence,TARGET_SEQUENCE);
assert.equal(frozen.rank,34);
assert.deepEqual(frozen.support,[6,6,3,6,5,5,3]);
assert.deepEqual(frozen.safeActions,[5,6,7]);

const sourceAudit=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE_AUDIT),'utf8'));
assert.equal(sourceAudit.schema,'connect4.cpc_q5d34_monotone_proof_library_audit.v1');
assert.equal(sourceAudit.exactQClass,TARGET_Q);
assert.equal(sourceAudit.disposition,'UNKNOWN');
assert.deepEqual(sourceAudit.terminalSafeP0Columns,[5,6,7]);

const k=makeKernel(),q5d=replay(k,TARGET_SEQUENCE);
assert.equal(rank(k,q5d),34);
assert.equal(qClass(k,q5d),TARGET_Q);
assert.deepEqual(support(k,q5d),[6,6,3,6,5,5,3]);
const engine=createRepairCapacityProofEngine(k,{maxProofStates:1});
assert.deepEqual(engine.terminalActions(q5d,0),[]);

const childQByAction=new Map([[4,'fbb987f9d3becc5b'],[5,'d22c464c13d0aab6'],[6,'a2feb3b4c09b10f3']]);
const children=[];
for(const action of [4,5,6]){
  const cell=landing(k,q5d,action),child=k.advance(q5d,action);
  assert(child>=0&&child!==domain.QN_TERMINAL_WIN);
  const seq=TARGET_SEQUENCE+String(action+1),q=qClass(k,child);
  assert.equal(q,childQByAction.get(action));
  assert.equal(rank(k,child),35);
  const closure=forcedSafety(k,child,seq);
  children.push({p0Action:action+1,p0LandingCell:engine.coord(cell),...closure});
}
children.sort((a,b)=>a.p0Action-b.p0Action);

const winning=children.filter(x=>x.classification==='P0_WIN_FORCED_CHAIN');
const losing=children.filter(x=>x.classification==='P0_LOSS_FORCED_CHAIN');
const draws=children.filter(x=>x.classification==='DRAW_FULL_BOARD');
let classification;
if(winning.length)classification='Q5D_P0_WIN';
else if(losing.length===children.length)classification='Q5D_P0_LOSS';
else if(draws.length&&children.every(x=>x.classification==='DRAW_FULL_BOARD'||x.classification==='P0_LOSS_FORCED_CHAIN'))classification='Q5D_P0_DRAW_OR_LOSS';
else classification='Q5D_UNRESOLVED';

console.log(JSON.stringify({
  schema:'connect4.cpc_q5d34_three_action_forced_safety_census.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  design:'CPC_Q5D34_THREE_ACTION_FORCED_SAFETY_CENSUS_DESIGN_0_1.md',
  sourceEvidence:{forcedSafety:SOURCE_CHAIN,proofLibraryAudit:SOURCE_AUDIT},
  sourceQ:TARGET_Q,
  sequence:TARGET_SEQUENCE,
  rank:34,
  support:support(k,q5d),
  safeP0Actions:[5,6,7],
  children,
  classification,
  winningActions:winning.map(x=>x.p0Action),
  summary:{
    childCount:children.length,
    winCount:winning.length,
    lossCount:losing.length,
    drawCount:draws.length,
    unresolvedCount:children.filter(x=>x.classification==='UNRESOLVED_MULTIPLE_SAFE').length,
    winningActions:winning.map(x=>x.p0Action)
  },
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  conclusion:[
    'q5d34 is reconstructed exactly at the first multiple-safe state of the q966 G branch, after the complete monotone proof library classified the state UNKNOWN.',
    'The three exact terminal-safe P0 consequence classes E6/F6/G4 are each reduced only by the already-qualified forced terminal-safety operator.',
    classification==='Q5D_P0_WIN'
      ? 'At least one P0 action terminates in an exact P0-winning forced-safety certificate; every such action is preserved.'
      : classification==='Q5D_P0_LOSS'
        ? 'All three terminal-safe P0 actions terminate in exact P0-loss forced-safety certificates.'
        : classification==='Q5D_P0_DRAW_OR_LOSS'
          ? 'No P0 action wins; at least one forces a full-board draw and every other action is draw/loss.'
          : 'No child has yet closed P0-winning and at least one reaches another multiple-safe obstruction; exact unresolved classes are preserved.'
  ],
  boundary:[
    'No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.',
    'Each child follows only unique safe actions based on exact one-ply terminal exposure.',
    'Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.'
  ]
},null,2));
