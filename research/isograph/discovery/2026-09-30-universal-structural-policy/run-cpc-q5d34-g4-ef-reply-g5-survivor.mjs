#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const G4='CPC_Q5D34_G4_FOUR_REPLY_FORCED_SAFETY_0_1.json';
const Q649_FILE='CPC_Q649_TWO_REPLY_CONSEQUENCE_CLASS_CLOSURE_0_1.json';
const EF_FILE='CPC_Q5D34_EF_NONWIN_CONVERGENCE_0_1.json';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const root=resolve(import.meta.dirname,'../../../..');

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const g4=JSON.parse(readFileSync(resolve(import.meta.dirname,G4),'utf8'));
const q649=JSON.parse(readFileSync(resolve(import.meta.dirname,Q649_FILE),'utf8'));
const ef=JSON.parse(readFileSync(resolve(import.meta.dirname,EF_FILE),'utf8'));
assert.equal(g4.schema,'connect4.cpc_q5d34_g4_four_reply_forced_safety.v1');
assert.equal(q649.schema,'connect4.cpc_q649_two_reply_consequence_class_closure.v1');
assert.equal(q649.classification,'P0_NONWIN_DRAW_REPLY');
assert.equal(ef.classification,'EF_NONWIN_G_SURVIVES');

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
function replay(k,s){let id=k.rootId;for(const d of s){const n=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(n)&&n>=0,'bad replay '+s);id=n;}return id;}
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

function forcedSafety(start,startSequence){
  let state=start,sequence=startSequence;
  const startQ=qClass(k,state),startRank=rank(k,state),startSupport=support(k,state);
  const steps=[],forcedSequence=[];
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
    step.forcedAction=chosen.action+1;steps.push(step);forcedSequence.push(chosen.action+1);
    if(chosen.terminal){
      classification=mover===0?'P0_WIN_FORCED_CHAIN':'P0_LOSS_FORCED_CHAIN';
      terminal={kind:'FORCED_ACTION_TERMINAL',winner:moverName,column:chosen.action+1};break;
    }
    sequence+=String(chosen.action+1);state=chosen.child;
  }
  if(!classification)throw new Error('forced safety exceeded physical horizon');
  return {startQ,startRank,startSupport,startSequence,classification,forcedSequence,steps,terminal};
}

const casesSpec=[
  {p1Reply:5,predecessorQ:'f435a6ec7dd5469e',knownNonwinAction:6,survivorAction:7,survivorQ:'5992c0c8965586f2'},
  {p1Reply:6,predecessorQ:'6c9a60f756817109',knownNonwinAction:5,survivorAction:7,survivorQ:'7cac0ef80f3901f7'}
];
const cases=[];
for(const spec of casesSpec){
  const reply=g4.replies.find(x=>x.p1Action===spec.p1Reply);assert(reply);
  assert.equal(reply.startQ,spec.predecessorQ);
  const step=reply.steps[0];assert(step);
  const unsafe=step.actionAudit.find(x=>x.column===3);assert(unsafe&&!unsafe.safe&&unsafe.opponentImmediateTerminals.length>0);
  const known=step.actionAudit.find(x=>x.column===spec.knownNonwinAction);assert(known&&known.safe);
  assert.equal(known.childQ,'6496c888c4e2a157');
  const survivor=step.actionAudit.find(x=>x.column===spec.survivorAction);assert(survivor&&survivor.safe);
  assert.equal(survivor.childQ,spec.survivorQ);

  const survivorSequence=step.sequence+String(spec.survivorAction);
  const state=replay(k,survivorSequence);
  assert.equal(rank(k,state),37);
  assert.equal(qClass(k,state),spec.survivorQ);
  assert.deepEqual(support(k,state),survivor.childSupport);
  const chain=forcedSafety(state,survivorSequence);
  const predecessorDisposition=
    ['P0_LOSS_FORCED_CHAIN','DRAW_FULL_BOARD'].includes(chain.classification)?'P0_NONWIN':
    chain.classification==='P0_WIN_FORCED_CHAIN'?'P0_WIN':'UNKNOWN';
  cases.push({
    p1Reply:spec.p1Reply,
    predecessorQ:spec.predecessorQ,
    predecessorRank:36,
    alreadyEliminatedAction:{column:3,reason:'IMMEDIATE_P1_TERMINAL_EXPOSURE'},
    knownNonwinAction:{column:spec.knownNonwinAction,childQ:'6496c888c4e2a157',reason:'EXACT_Q649_DRAW_HANDOFF'},
    survivorAction:spec.survivorAction,
    survivorQ:spec.survivorQ,
    survivorRank:37,
    survivorSequence,
    survivorClassification:chain.classification,
    predecessorDisposition,
    ...chain
  });
}

const nonwin=cases.filter(x=>x.predecessorDisposition==='P0_NONWIN');
const classification=nonwin.length?'G4_P0_NONWIN':'G4_STILL_UNRESOLVED';
const q5dImplication=classification==='G4_P0_NONWIN'?'Q5D_P0_NONWIN':'Q5D_UNRESOLVED';

console.log(JSON.stringify({
  schema:'connect4.cpc_q5d34_g4_ef_reply_g5_survivor.v1',
  date:'2026-10-01',jsMinSysSha:EXPECTED,
  design:'CPC_Q5D34_G4_EF_REPLY_G5_SURVIVOR_DESIGN_0_1.md',
  sourceEvidence:{g4:G4,q649:Q649_FILE,efNonwin:EF_FILE},
  cases,classification,q5dImplication,
  oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,jsMinSysModified:false,bsfpModified:false,
  conclusion:[
    'For the q5d:G4 P1:E6 and P1:F6 reply classes, immediate C4 is already unsafe and the E/F completion action reaches exact q649, which is P0-nonwinning by certified draw handoff.',
    'Therefore G5 is the only remaining P0 winning candidate in each predecessor, and this experiment applies only the unchanged forced terminal-safety operator to those two rank-37 survivor q classes.',
    classification==='G4_P0_NONWIN'
      ? 'At least one survivor is P0 loss/draw, so its rank-36 predecessor is P0-nonwinning; P1 can choose that reply after q5d:G4, eliminating G4. Combined with E/F nonwin, q5d34 is P0-nonwinning.'
      : 'Neither survivor is yet certified P0-nonwinning; q5d:G4 and q5d34 remain unresolved.'
  ],
  boundary:[
    'No solved W/D/L, oracle, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.',
    'No branch is followed after a multiple-safe state.',
    'Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.'
  ]
},null,2));
