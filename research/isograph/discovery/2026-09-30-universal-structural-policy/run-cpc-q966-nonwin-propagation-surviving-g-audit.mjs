#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {predecessorInterval} from './rlc-proof-library-catalog.mjs';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const ROOT_Q='966e6353e06e4d41';
const ROOT_SEQUENCE='44444156666623222242551151531137';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');

const kernelMod=await import('../../../semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs');
const domain=await import('../../../semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs');
const repairMod=await import('../../../semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs');
const {createSlot64ResidualQuotientKernel}=kernelMod;
const {createRepairCapacityProofEngine}=repairMod;

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const P0=0,P1=1;

function makeKernel(){
  const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
    cacheEdges:true,prefixClasses:4096,responseClosure:true,
    searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})
  });
  kernel.prepareSearchStorage();return kernel;
}
function semReplay(k,sequence){
  let id=k.rootId;
  for(const d of sequence){
    const n=k.advance(id,Number(d)-1);
    assert(Number.isSafeInteger(n)&&n>=0,'semantic replay terminal/illegal '+sequence);
    id=n;
  }
  return id;
}
function semRank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function semSupport(k,id){
  const s=k.states.supportAt(id),out=[];
  for(let c=0;c<7;c++){
    const x=k.supportAccess.landingAt(s,c);
    out.push(x===0xff?6:Math.floor(x/7));
  }
  return out;
}
function hasBit(term,cell){return cell<32?(((term[0]>>>cell)&1)!==0):(((term[1]>>>(cell-32))&1)!==0);}
function termCells(term){const out=[];for(let cell=0;cell<42;cell++)if(hasBit(term,cell))out.push(cell);return out;}
function keyCells(cells){return [...cells].sort((a,b)=>a-b).join(',');}
function keyArray(key){return key===''?[]:key.split(',').map(Number);}
function strictSubset(a,b){const aa=keyArray(a),bb=new Set(keyArray(b));return aa.length<bb.size&&aa.every(x=>bb.has(x));}
function normalize(keys){const u=[...new Set(keys)];return u.filter(k=>!u.some(o=>o!==k&&strictSubset(o,k))).sort();}
function semResidualKeys(k,id,p){
  const cid=p===0?k.states.p0At(id):k.states.p1At(id);
  return normalize(k.classes.terms(cid).map(termCells).map(keyCells));
}
function semKey(k,id){
  return 'r'+semRank(k,id)+'|h'+semSupport(k,id).join(',')+
    '|p0:'+semResidualKeys(k,id,P0).join(';')+
    '|p1:'+semResidualKeys(k,id,P1).join(';');
}
function qClass(k,id){return createHash('sha256').update(semKey(k,id)).digest('hex').slice(0,16);}
function jsFromSequence(sequence){
  const x=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function jsRank(q){return q.words[g.metaOffset]>>>2;}
function jsSupport(q){return Array.from(q.words.slice(0,7));}
function coordHas(q,p,index){
  const base=p?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,p){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);
  return out;
}
function shapeCells(id){
  const out=[],b=id*4;
  for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[b+i]);
  return out;
}
function jsResidualKeys(q,p){return normalize(activeIds(q,p).map(id=>keyCells(shapeCells(id))));}
function exactBridge(sequence,expectedQ,expectedRank,expectedSupport,k){
  const sid=semReplay(k,sequence),jsq=jsFromSequence(sequence);
  const checks={
    semanticQ:qClass(k,sid)===expectedQ,
    rank:semRank(k,sid)===expectedRank&&jsRank(jsq)===expectedRank,
    support:JSON.stringify(semSupport(k,sid))===JSON.stringify(expectedSupport)&&
      JSON.stringify(jsSupport(jsq))===JSON.stringify(expectedSupport),
    p0Residuals:JSON.stringify(semResidualKeys(k,sid,P0))===JSON.stringify(jsResidualKeys(jsq,P0)),
    p1Residuals:JSON.stringify(semResidualKeys(k,sid,P1))===JSON.stringify(jsResidualKeys(jsq,P1)),
  };
  return {pass:Object.values(checks).every(Boolean),checks,exactQClass:qClass(k,sid)};
}
function read(name){return JSON.parse(readFileSync(resolve(import.meta.dirname,name),'utf8'));}
const UNKNOWN=()=>[-1,1], NONWIN=()=>[-1,0], LOSS=()=>[-1,-1], WIN=()=>[1,1];

const q966Evidence=read('CPC_RANK32_Q966_EXTENDED_REPAIR_COMPOSITION_0_1.json');
const q2dbExposure=read('CPC_Q2DB_TWO_COLUMN_TERMINAL_EXPOSURE_0_1.json');
const q2dbChain=read('CPC_Q2DB_FORCED_TERMINAL_SAFETY_CHAIN_0_1.json');
const q649Evidence=read('CPC_Q649_TWO_REPLY_CONSEQUENCE_CLASS_CLOSURE_0_1.json');
const q5dEvidence=read('CPC_Q5D34_STRUCTURAL_NONWIN_BACKPROP_0_1.json');

assert.equal(q966Evidence.schema,'connect4.cpc_rank32_q966_extended_repair_composition.v1');
assert.equal(q966Evidence.exactQClass,ROOT_Q);
assert.equal(q2dbExposure.schema,'connect4.cpc_q2db_two_column_terminal_exposure.v1');
assert.equal(q2dbExposure.exactQClass,'2db2abcb67d530e0');
assert.equal(q2dbChain.schema,'connect4.cpc_q2db_forced_terminal_safety_chain.v1');
assert.equal(q649Evidence.schema,'connect4.cpc_q649_two_reply_consequence_class_closure.v1');
assert.equal(q649Evidence.classification,'P0_NONWIN_DRAW_REPLY');
assert.equal(q5dEvidence.schema,'connect4.cpc_q5d34_structural_nonwin_backprop.v1');
assert.equal(q5dEvidence.classification,'P0_NONWIN');

const k=makeKernel();
const e=createRepairCapacityProofEngine(k,{maxProofStates:1});
const rootBridge=exactBridge(ROOT_SEQUENCE,ROOT_Q,32,[6,6,3,6,5,5,1],k);
assert(rootBridge.pass);
const root=semReplay(k,ROOT_SEQUENCE);
assert.equal(semRank(k,root)&1,0);
assert.deepEqual(e.legal(root).map(c=>c+1),[3,5,6,7]);

// q2db structural nonwin: C loses immediately; G enters the previously frozen
// forced-safety chain whose only safe continuation reaches q649, already
// qualified P0-nonwinning.
const q2C=q2dbExposure.actions.find(x=>x.p0Column===3);
const q2G=q2dbExposure.actions.find(x=>x.p0Column===7);
assert(q2C&&q2G);
assert.equal(q2C.p1ImmediateTerminals.some(x=>x.column===3&&x.cell==='C5'),true);
assert.equal(q2G.p1ImmediateTerminals.length,0);
assert.equal(q2dbChain.startQ,'2db2abcb67d530e0');
assert.deepEqual(q2dbChain.forcedSequence,[7,7,7]);
assert.equal(q2dbChain.steps.at(-1).exactQClass,'6496c888c4e2a157');

const q649Interval=NONWIN();
const e5dInterval=predecessorInterval(0,[LOSS(),q649Interval]);
assert.deepEqual(e5dInterval,[-1,0]);
const ff555Interval=predecessorInterval(1,[WIN(),e5dInterval]);
assert.deepEqual(ff555Interval,[-1,0]);
const q2dbInterval=predecessorInterval(0,[LOSS(),ff555Interval]);
assert.deepEqual(q2dbInterval,[-1,0]);

const q2dbPremise={
  exactQClass:'2db2abcb67d530e0',
  classification:'P0_NONWIN',
  interval:{lower:q2dbInterval[0],upper:q2dbInterval[1]},
  derivation:[
    {state:'q2db',action:3,interval:LOSS(),reason:'P1_C5_TERMINAL_REPLY'},
    {state:'q2db',action:7,interval:ff555Interval,reason:'FORCED_SAFETY_CHAIN_TO_Q649_NONWIN'},
  ],
  q649:{
    exactQClass:'6496c888c4e2a157',
    classification:q649Evidence.classification,
    interval:{lower:-1,upper:0},
  },
};

const q5dPremise={
  exactQClass:q5dEvidence.exactQClass,
  classification:q5dEvidence.classification,
  interval:q5dEvidence.interval,
  sourceEvidence:'CPC_Q5D34_STRUCTURAL_NONWIN_BACKPROP_0_1.json',
};
assert.deepEqual(q5dPremise.interval,{lower:-1,upper:0});

// Independent root-action checks.
const cState=k.advance(root,2); // P0:C4
assert(cState>=0);
const cP1Terminals=e.terminalActions(cState,P1).map(x=>({column:x.column+1,cell:e.coord(x.cell)}));
assert(cP1Terminals.some(x=>x.column===3&&x.cell==='C5'));

function actionReplyToQ2db(actionName){
  const row=q966Evidence.actions.find(x=>x.action===actionName);assert(row);
  const q2=row.replies.find(x=>x.exactQClass==='2db2abcb67d530e0');assert(q2);
  const state=k.advance(root,row.column-1);assert(state>=0);
  const child=k.advance(state,q2.replyColumn-1);assert(child>=0);
  assert.equal(qClass(k,child),'2db2abcb67d530e0');
  return {
    action:actionName,
    p0Column:row.column,
    p1ReplyColumn:q2.replyColumn,
    p1ReplyCell:q2.replyCell,
    childQ:q2.exactQClass,
  };
}
const eToQ2=actionReplyToQ2db('E');
const fToQ2=actionReplyToQ2db('F');

const gState=k.advance(root,6); // P0:G2
assert(gState>=0&&semRank(k,gState)===33);
assert.equal(qClass(k,gState),'e0a395d3dff723c5');
const gReplies=e.legal(gState);
const gRows=[];
for(const reply of gReplies){
  const child=k.advance(gState,reply);
  if(child===domain.QN_TERMINAL_WIN){
    gRows.push({p1Column:reply+1,route:'P1_TERMINAL'});
    continue;
  }
  assert(child>=0);
  const p0Immediate=e.terminalActions(child,P0);
  if(p0Immediate.length){
    gRows.push({p1Column:reply+1,route:'P0_IMMEDIATE_AVAILABLE',winningColumns:p0Immediate.map(x=>x.column+1)});
    continue;
  }
  const qc=qClass(k,child);
  gRows.push({p1Column:reply+1,route:qc===q5dPremise.exactQClass?'EXACT_Q5D_NONWIN_HANDOFF':'OTHER',childQ:qc});
}
const gQ5d=gRows.find(x=>x.route==='EXACT_Q5D_NONWIN_HANDOFF');
assert(gQ5d&&gQ5d.p1Column===7);
const gInterval=predecessorInterval(1,gRows.map(x=>{
  if(x.route==='P1_TERMINAL')return LOSS();
  if(x.route==='EXACT_Q5D_NONWIN_HANDOFF')return NONWIN();
  return UNKNOWN();
}));
assert(gInterval[1]<=0);

const rootRaw=[
  {column:3,kind:'P1_TERMINAL_REPLY',interval:LOSS(),witness:cP1Terminals},
  {column:5,kind:'EXACT_Q2DB_NONWIN_REPLY',interval:NONWIN(),witness:eToQ2},
  {column:6,kind:'EXACT_Q2DB_NONWIN_REPLY',interval:NONWIN(),witness:fToQ2},
  {column:7,kind:'EXACT_Q5D_NONWIN_HANDOFF',interval:gInterval,witness:gQ5d},
];
const rootInterval=predecessorInterval(0,rootRaw.map(x=>x.interval));
assert.deepEqual(rootInterval,[-1,0]);
const rootActions=rootRaw.map(x=>({
  column:x.column,
  kind:x.kind,
  interval:{lower:x.interval[0],upper:x.interval[1]},
  witness:x.witness,
}));

console.log(JSON.stringify({
  schema:'connect4.cpc_q966_nonwin_propagation_surviving_g_audit.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  design:'CPC_Q966_NONWIN_PROPAGATION_SURVIVING_G_AUDIT_DESIGN_0_1.md',
  exactQClass:ROOT_Q,
  sequence:ROOT_SEQUENCE,
  rank:32,
  support:[6,6,3,6,5,5,1],
  exactBridge:rootBridge,
  q2dbPremise,
  q5dPremise,
  gBranch:{
    rank33Q:'e0a395d3dff723c5',
    replies:gRows,
    interval:{lower:gInterval[0],upper:gInterval[1]},
  },
  rootActions,
  classification:'Q966_P0_NONWIN',
  interval:{lower:rootInterval[0],upper:rootInterval[1]},
  resourceFailureCount:0,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  conclusion:[
    'q2db is structurally P0-nonwinning: C exposes immediate P1:C5, while G follows the qualified forced-safety chain into q649, whose P1 draw reply bounds P0 above by draw.',
    'q966 E and F each admit an exact P1 cross-reply into q2db, so neither can force a P0 win.',
    'q966 G reaches the exact rank-33 CPC-restricted child where P1:G3 hands off to exact q5d34, now structurally certified P0-nonwinning.',
    'q966 C exposes immediate P1:C5. Therefore every legal q966 P0 action has upper bound <= 0 and q966 is P0_NONWIN with interval [-1,0].',
  ],
  boundary:[
    'This is one-sided P0 nonwin only; it does not assert q966 loss or draw.',
    'Every reusable consequence is admitted only by exact semantic-q identity.',
    'Unknown branches remain unresolved; predecessor bounds use only the existence of an adversarial nonwin reply where sufficient.',
    'No oracle, solved W/D/L input, minimax, unrestricted game-tree value, opening book, best-move table or BSFP solved frontier is used.',
    'Production CPC, JSMinSys and BSFP are unchanged.',
  ],
},null,2));
