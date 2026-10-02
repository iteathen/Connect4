#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const Q5D_CENSUS='CPC_Q5D34_THREE_ACTION_FORCED_SAFETY_CENSUS_0_1.json';
const Q2DB_CHAIN='CPC_Q2DB_FORCED_TERMINAL_SAFETY_CHAIN_0_1.json';
const Q649_CLOSURE='CPC_Q649_TWO_REPLY_CONSEQUENCE_CLASS_CLOSURE_0_1.json';
const SOURCE_Q='5d34e24395b9d801';
const CONVERGENCE_Q='e5d63da12420fdb3';
const Q649='6496c888c4e2a157';
const ROOT_SEQ='4444415666662322224255115153113777';
const EF_SEQ=ROOT_SEQ+'56';
const FE_SEQ=ROOT_SEQ+'65';
const Q2DB_E5D_SEQ='444441566666232222425511515311375677';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const root=resolve(import.meta.dirname,'../../../..');

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const q5d=JSON.parse(readFileSync(resolve(import.meta.dirname,Q5D_CENSUS),'utf8'));
const q2db=JSON.parse(readFileSync(resolve(import.meta.dirname,Q2DB_CHAIN),'utf8'));
const q649=JSON.parse(readFileSync(resolve(import.meta.dirname,Q649_CLOSURE),'utf8'));
assert.equal(q5d.schema,'connect4.cpc_q5d34_three_action_forced_safety_census.v1');
assert.equal(q2db.schema,'connect4.cpc_q2db_forced_terminal_safety_chain.v1');
assert.equal(q649.schema,'connect4.cpc_q649_two_reply_consequence_class_closure.v1');

const {createSlot64ResidualQuotientKernel}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);

function makeKernel(){
  const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
    cacheEdges:true,prefixClasses:4096,responseClosure:true,
    searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})
  });
  kernel.prepareSearchStorage();return kernel;
}
function replay(k,s){let id=k.rootId;for(const d of s){const n=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(n)&&n>=0,'bad replay '+s);id=n;}return id;}
function rank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function support(k,id){const s=k.states.supportAt(id),out=[];for(let c=0;c<7;c++){const x=k.supportAccess.landingAt(s,c);out.push(x===0xff?6:Math.floor(x/7));}return out;}
function hasBit(term,cell){return cell<32?(((term[0]>>>cell)&1)!==0):(((term[1]>>>(cell-32))&1)!==0);}
function termCells(term){const out=[];for(let i=0;i<42;i++)if(hasBit(term,i))out.push(i);return out;}
function termKeys(k,id,p){const cid=p===0?k.states.p0At(id):k.states.p1At(id);return k.classes.terms(cid).map(termCells).map(x=>x.join(',')).sort();}
function exactKey(k,id){return 'r'+rank(k,id)+'|h'+support(k,id).join(',')+'|p0:'+termKeys(k,id,0).join(';')+'|p1:'+termKeys(k,id,1).join(';');}
function qClass(k,id){return createHash('sha256').update(exactKey(k,id)).digest('hex').slice(0,16);}
function bridge(k,aSeq,bSeq,expectedQ){
  const a=replay(k,aSeq),b=replay(k,bSeq);
  const aq=qClass(k,a),bq=qClass(k,b),ak=exactKey(k,a),bk=exactKey(k,b);
  return {pass:aq===expectedQ&&bq===expectedQ&&ak===bk,aSequence:aSeq,bSequence:bSeq,aQ:aq,bQ:bq,rank:rank(k,a),support:support(k,a)};
}

assert.equal(q5d.sourceQ,SOURCE_Q);
const e=q5d.children.find(x=>x.p0Action===5);assert(e);
const f=q5d.children.find(x=>x.p0Action===6);assert(f);
const eReply=e.steps[0].actionAudit.find(x=>x.column===6);assert(eReply);
const fReply=f.steps[0].actionAudit.find(x=>x.column===5);assert(fReply);
assert.equal(eReply.childQ,CONVERGENCE_Q);
assert.equal(fReply.childQ,CONVERGENCE_Q);

const e5dStep=q2db.steps.find(x=>x.exactQClass===CONVERGENCE_Q);assert(e5dStep);
assert.equal(e5dStep.rank,36);
assert.deepEqual(e5dStep.support,[6,6,3,6,6,6,3]);
assert.deepEqual(e5dStep.safeActions,[7]);
assert.equal(e5dStep.forcedAction,7);
const gAudit=e5dStep.actionAudit.find(x=>x.column===7);assert(gAudit);
assert.equal(gAudit.childQ,Q649);
const cAudit=e5dStep.actionAudit.find(x=>x.column===3);assert(cAudit);
assert.equal(cAudit.safe,false);
assert.ok(cAudit.opponentImmediateTerminals.length>0);

assert.equal(q649.sourceQ,Q649);
assert.equal(q649.classification,'P0_NONWIN_DRAW_REPLY');
const drawChild=q649.children.find(x=>x.p1Action===7);assert(drawChild);
assert.equal(drawChild.classification,'DRAW_FULL_BOARD');

const k=makeKernel();
const efBridge=bridge(k,EF_SEQ,Q2DB_E5D_SEQ,CONVERGENCE_Q);
const feBridge=bridge(k,FE_SEQ,Q2DB_E5D_SEQ,CONVERGENCE_Q);
assert(efBridge.pass&&feBridge.pass);

const efTo649=bridge(k,EF_SEQ+'7',q649.sequence,Q649);
const feTo649=bridge(k,FE_SEQ+'7',q649.sequence,Q649);
assert(efTo649.pass&&feTo649.pass);

const actions=[
  {p0Action:5,adversarialReply:6,replyQ:CONVERGENCE_Q,disposition:'P0_NONWIN',reason:'EXACT_E5D_TO_Q649_DRAW_HANDOFF'},
  {p0Action:6,adversarialReply:5,replyQ:CONVERGENCE_Q,disposition:'P0_NONWIN',reason:'EXACT_E5D_TO_Q649_DRAW_HANDOFF'},
  {p0Action:7,adversarialReply:null,replyQ:null,disposition:'SURVIVING_CANDIDATE',reason:'NOT_CLASSIFIED_BY_THIS_COMPOSITION'}
];

console.log(JSON.stringify({
  schema:'connect4.cpc_q5d34_ef_nonwin_convergence.v1',
  date:'2026-10-01',jsMinSysSha:EXPECTED,
  design:'CPC_Q5D34_EF_NONWIN_CONVERGENCE_DESIGN_0_1.md',
  sourceEvidence:{q5dCensus:Q5D_CENSUS,q2dbForcedChain:Q2DB_CHAIN,q649Closure:Q649_CLOSURE},
  sourceQ:SOURCE_Q,sourceSequence:ROOT_SEQ,rank:34,support:[6,6,3,6,5,5,3],
  convergenceQ:CONVERGENCE_Q,q649:Q649,
  bridges:{
    efToConvergence:efBridge,
    feToConvergence:feBridge,
    convergenceToQ649:{pass:efTo649.pass&&feTo649.pass,ef:efTo649,fe:feTo649}
  },
  convergenceCertificate:{
    q:CONVERGENCE_Q,rank:e5dStep.rank,support:e5dStep.support,
    uniqueSafeP0Action:e5dStep.forcedAction,
    eliminatedAlternative:{column:cAudit.column,opponentImmediateTerminals:cAudit.opponentImmediateTerminals},
    q649Handoff:gAudit.childQ
  },
  q649DrawWitness:{
    q:Q649,p1Action:7,classification:drawChild.classification,
    forcedSequence:drawChild.forcedSequence,
    terminal:drawChild.terminal
  },
  actions,
  classification:'EF_NONWIN_G_SURVIVES',
  oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,jsMinSysModified:false,bsfpModified:false,
  conclusion:[
    'The q5d E6/F6 cross replies are exact semantic-q convergences, not support-only matches.',
    'Both converge to e5d63, whose only terminal-safe P0 action is G4; that exact handoff reaches q649.',
    'At q649, P1 has an exact G5 consequence with a unique forced continuation to a full-board draw. Therefore P0 cannot force a win from e5d63.',
    'Consequently q5d E6 and F6 cannot force a P0 win. G4 is the only remaining q5d winning candidate.'
  ],
  boundary:[
    'This composition does not classify q5d G4 or q5d34 itself.',
    'No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.'
  ]
},null,2));
