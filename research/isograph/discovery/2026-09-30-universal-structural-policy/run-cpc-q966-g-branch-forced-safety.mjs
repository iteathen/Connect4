#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE='CPC_RANK30_D1_A_UNKNOWN_CHILD_STRUCTURAL_DIFFERENTIAL_0_1.json';
const SOURCE_Q='966e6353e06e4d41';
const START_Q='e0a395d3dff723c5';
const START_SEQUENCE='444441566666232222425511515311377';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const root=resolve(import.meta.dirname,'../../../..');

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank30_d1_a_unknown_child_structural_differential.v1');
const sibling=source.siblings.find(x=>x.exactQClass===SOURCE_Q);assert(sibling);
const gMove=sibling.onePlyConsequences.find(x=>x.actionColumn===7);assert(gMove);
assert.equal(gMove.childQ,START_Q);
assert.equal(gMove.cpc.baseline.kind,'CPC_RESTRICT');
assert.equal(gMove.cpc.baseline.forcedColumn,7);

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

const k=makeKernel(),engine=createRepairCapacityProofEngine(k,{maxProofStates:1});
let state=replay(k,START_SEQUENCE),sequence=START_SEQUENCE;
assert.equal(rank(k,state),33);assert.equal(qClass(k,state),START_Q);assert.deepEqual(support(k,state),[6,6,3,6,5,5,2]);

const steps=[],forcedMoves=[];
let classification=null,terminal={};
const horizon=42-rank(k,state);
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
    terminal={kind:'MOVER_IMMEDIATE_TERMINAL',winner:moverName,winningActions:step.immediateTerminalActions};steps.push(step);break;
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
    classification='UNRESOLVED_MULTIPLE_SAFE';terminal={kind:'MULTIPLE_SAFE_ACTIONS',safeActions:step.safeActions};steps.push(step);break;
  }
  const chosen=safe[0];step.forcedAction=chosen.action+1;steps.push(step);forcedMoves.push(chosen.action+1);
  if(chosen.terminal){
    classification=mover===0?'P0_WIN_FORCED_CHAIN':'P0_LOSS_FORCED_CHAIN';
    terminal={kind:'FORCED_ACTION_TERMINAL',winner:moverName,column:chosen.action+1};break;
  }
  sequence+=String(chosen.action+1);state=chosen.child;
}
if(!classification)throw new Error('forced chain exceeded physical horizon');

console.log(JSON.stringify({
  schema:'connect4.cpc_q966_g_branch_forced_safety.v1',
  date:'2026-10-01',jsMinSysSha:EXPECTED,
  design:'CPC_Q966_G_BRANCH_FORCED_SAFETY_DESIGN_0_1.md',
  sourceEvidence:SOURCE,sourceQ:SOURCE_Q,
  startQ:START_Q,startSequence:START_SEQUENCE,startRank:33,startSupport:[6,6,3,6,5,5,2],
  sourceCpcRestriction:{kind:'CPC_RESTRICT',forcedColumn:7},
  steps,forcedSequence:forcedMoves,classification,terminal,
  oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,jsMinSysModified:false,bsfpModified:false,
  conclusion:[
    'The q966 G2 child is reconstructed by exact semantic identity before the forced-safety audit.',
    classification==='P0_WIN_FORCED_CHAIN'
      ? 'The G2 branch follows a unique safe chain to an exact P0 win.'
      : classification==='P0_LOSS_FORCED_CHAIN'
        ? 'The G2 branch follows a unique safe chain to an exact P0 loss.'
        : classification==='DRAW_FULL_BOARD'
          ? 'The G2 branch follows a unique safe chain to an exact draw, so G2 cannot force a P0 win.'
          : 'The G2 branch reaches a multiple-safe state; that exact P1/P0 consequence fork is the next obstruction.'
  ],
  boundary:[
    'No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.',
    'No branching beyond one-ply terminal exposure is recursively evaluated.',
    'Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, and BSFP remain unchanged.'
  ]
},null,2));
