#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE='CPC_RANK32_Q966_EXTENDED_REPAIR_COMPOSITION_0_1.json';
const Q='2db2abcb67d530e0';
const SEQ_EF='4444415666662322224255115153113756';
const SEQ_FE='4444415666662322224255115153113765';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const root=resolve(import.meta.dirname,'../../../..');

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank32_q966_extended_repair_composition.v1');
assert(source.actions.some(a=>a.replies.some(r=>r.exactQClass===Q&&r.disposition==='UNKNOWN')));

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

const k=makeKernel(),state=replay(k,SEQ_EF),state2=replay(k,SEQ_FE);
assert.equal(rank(k,state),34);assert.equal(qClass(k,state),Q);assert.equal(qClass(k,state2),Q);
assert.equal(exactKey(k,state),exactKey(k,state2));
assert.deepEqual(support(k,state),[6,6,3,6,6,6,1]);

const engine=createRepairCapacityProofEngine(k,{maxProofStates:1});
const legalP0=legal(k,state);
assert.deepEqual(legalP0,[2,6]);
assert(engine.singleton(state,0,20));
assert.equal(engine.targetDistance(state,20),1);
assert.deepEqual(engine.enabledSingletons(state,1),[]);

const actions=[];
for(const action of legalP0){
  const landingCell=landing(k,state,action);
  const child=k.advance(state,action);
  if(child===domain.QN_TERMINAL_WIN){
    actions.push({p0Column:action+1,p0LandingCell:engine.coord(landingCell),p0ImmediateTerminal:true,childQ:null,childSupport:null,p1ImmediateTerminals:[],enabledP1Singletons:[]});
    continue;
  }
  assert(child>=0&&rank(k,child)===35);
  const p1Terminals=engine.terminalActions(child,1);
  actions.push({
    p0Column:action+1,p0LandingCell:engine.coord(landingCell),p0ImmediateTerminal:false,
    childQ:qClass(k,child),childSupport:support(k,child),
    p1ImmediateTerminals:p1Terminals.map(x=>({column:x.column+1,cell:engine.coord(x.cell)})),
    enabledP1Singletons:engine.enabledSingletons(child,1).map(engine.coord)
  });
}
const immediateWin=actions.some(x=>x.p0ImmediateTerminal);
const allExpose=actions.every(x=>!x.p0ImmediateTerminal&&x.p1ImmediateTerminals.length>0);
const classification=immediateWin?'P0_WIN_IMMEDIATE':allExpose?'P0_LOSS_TERMINAL_EXPOSURE':'UNRESOLVED';

console.log(JSON.stringify({
  schema:'connect4.cpc_q2db_two_column_terminal_exposure.v1',
  date:'2026-10-01',jsMinSysSha:EXPECTED,
  design:'CPC_Q2DB_TWO_COLUMN_TERMINAL_EXPOSURE_DESIGN_0_1.md',
  sourceEvidence:SOURCE,
  exactQClass:Q,rank:rank(k,state),support:support(k,state),
  convergence:{sequenceEF:SEQ_EF,sequenceFE:SEQ_FE,exactKeyEqual:true},
  target:'G3',targetLive:engine.singleton(state,0,20),targetSupportDistance:engine.targetDistance(state,20),
  enabledP1Singletons:engine.enabledSingletons(state,1).map(engine.coord),
  legalP0Columns:legalP0.map(x=>x+1),actions,classification,
  oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,jsMinSysModified:false,bsfpModified:false,
  conclusion:[
    'The two physical E/F cross-reply paths are the same exact rank-34 semantic-q state.',
    classification==='P0_LOSS_TERMINAL_EXPOSURE'
      ? 'Every legal P0 action is nonterminal and exposes an exact immediate P1 terminal; q2db is therefore structurally P0-losing by one-ply terminal exposure.'
      : classification==='P0_WIN_IMMEDIATE'
        ? 'A legal P0 action wins immediately, falsifying the loss hypothesis.'
        : 'At least one legal P0 action is nonterminal without exposing an immediate P1 terminal; that exact child is the next obstruction.'
  ],
  boundary:[
    'No solved W/D/L, oracle, minimax, recursive game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.',
    'The classification uses only exact legal actions and immediate terminal predicates from the current semantic state.',
    'Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, and BSFP remain unchanged.'
  ]
},null,2));
