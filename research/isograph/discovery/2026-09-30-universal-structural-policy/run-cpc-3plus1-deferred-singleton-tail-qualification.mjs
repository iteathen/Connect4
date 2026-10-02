#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE='CPC_RANK38_3PLUS1_TAIL_EVENT_PRODUCT_0_1.json';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const TARGETS=Object.freeze([
  '4f5444dc55bb5371',
  '60fba7c1d1c84a97',
  'e7eb0902f1f7984c',
]);

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');

const kernelMod=await import('../../../semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs');
const domain=await import('../../../semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs');
const repairMod=await import('../../../semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs');
const {createSlot64ResidualQuotientKernel}=kernelMod;
const {createRepairCapacityProofEngine}=repairMod;

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P0=0,P1=1,P0_WIN=3,P1_WIN=1,DRAW=2;

function makeKernel(){
  const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
    cacheEdges:true,prefixClasses:4096,responseClosure:true,
    searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})
  });
  kernel.prepareSearchStorage();
  return kernel;
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
function jsStep(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(q.words[column]<6);
  const words=new Uint32Array(g.keyWords);
  const basis=new Uint32Array(g.maxBasis);
  const seen=new Uint32Array(g.shapeWordCount);
  const sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,column,words,0,basis,0,seen,sizes,0);
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
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
function exactBridge(sequence,jsq,k,sid){
  const checks={
    rank:jsRank(jsq)===semRank(k,sid)&&jsRank(jsq)===sequence.length,
    support:JSON.stringify(jsSupport(jsq))===JSON.stringify(semSupport(k,sid)),
    p0Residuals:JSON.stringify(jsResidualKeys(jsq,P0))===JSON.stringify(semResidualKeys(k,sid,P0)),
    p1Residuals:JSON.stringify(jsResidualKeys(jsq,P1))===JSON.stringify(semResidualKeys(k,sid,P1)),
  };
  return {pass:Object.values(checks).every(Boolean),checks,semanticQClass:qClass(k,sid)};
}
function eventMap(support){
  const open=support.map((h,c)=>({c,h,rem:6-h})).filter(x=>x.rem);
  assert.equal(open.length,2);
  const chain=open.find(x=>x.rem===3);
  const singleton=open.find(x=>x.rem===1);
  assert(chain&&singleton);
  return {
    chainColumn:chain.c,
    singletonColumn:singleton.c,
    A1:chain.h*7+chain.c,
    A2:(chain.h+1)*7+chain.c,
    A3:(chain.h+2)*7+chain.c,
    B:singleton.h*7+singleton.c,
  };
}
function terminalName(code){
  if(code===P0_WIN)return 'P0_WIN';
  if(code===P1_WIN)return 'P1_WIN';
  if(code===DRAW)return 'DRAW';
  return null;
}

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank38_3plus1_tail_event_product.v1');
const sourceByQ=new Map(source.states.map(x=>[x.exactQClass,x]));
const k=makeKernel();
const e=createRepairCapacityProofEngine(k,{maxProofStates:1});
const states=[];

for(const exactQClass of TARGETS){
  const src=sourceByQ.get(exactQClass);assert(src);
  const sequence=src.sequence;
  const sem=semReplay(k,sequence);
  const js=jsFromSequence(sequence);
  const bridge=exactBridge(sequence,js,k,sem);
  assert(bridge.pass);
  assert.equal(bridge.semanticQClass,exactQClass);
  assert.equal(semRank(k,sem),38);
  const support=jsSupport(js);
  const events=eventMap(support);

  const p0=semResidualKeys(k,sem,P0).map(keyArray);
  const p1=semResidualKeys(k,sem,P1).map(keyArray);
  const expectedP0=[events.A1,events.A2,events.A3].sort((a,b)=>a-b);
  const expectedP1=[events.A2];

  const premises={
    poset: support[events.chainColumn]===3 &&
      support[events.singletonColumn]===5 &&
      support.filter(x=>x<6).length===2,
    p0Residual:p0.length===1&&JSON.stringify(p0[0])===JSON.stringify(expectedP0),
    p1Residual:p1.length===1&&JSON.stringify(p1[0])===JSON.stringify(expectedP1),
    noPriorTerminal:js.terminal===0,
  };

  // A1 branch: A1 exposes the exact P1 singleton A2.
  const a1=jsStep(js,events.chainColumn);
  const semA1=k.advance(sem,events.chainColumn);
  assert(a1.terminal===0&&semA1>=0);
  assert(e.enabledSingletons(semA1,P1).includes(events.A2));
  const a2ByP1=jsStep(a1,events.chainColumn);
  const semA2ByP1=k.advance(semA1,events.chainColumn);
  assert.equal(a2ByP1.terminal,P1_WIN);
  assert.equal(semA2ByP1,domain.QN_TERMINAL_WIN);

  // B branch: the independent column is exhausted, leaving one forced chain.
  const b=jsStep(js,events.singletonColumn);
  const semB=k.advance(sem,events.singletonColumn);
  assert(b.terminal===0&&semB>=0);
  assert.deepEqual(e.legal(semB),[events.chainColumn]);

  const ba1=jsStep(b,events.chainColumn);
  const semBA1=k.advance(semB,events.chainColumn);
  assert(ba1.terminal===0&&semBA1>=0);
  assert.deepEqual(e.legal(semBA1),[events.chainColumn]);
  assert(e.enabledSingletons(semBA1,P1).includes(events.A2));

  const ba2=jsStep(ba1,events.chainColumn);
  const semBA2=k.advance(semBA1,events.chainColumn);
  assert(ba2.terminal===0&&semBA2>=0);
  assert.deepEqual(e.legal(semBA2),[events.chainColumn]);
  assert.equal(e.enabledSingletons(semBA2,P1).includes(events.A2),false);

  const ba3=jsStep(ba2,events.chainColumn);
  assert.equal(terminalName(ba3.terminal),'DRAW');

  const stateAccept=Object.values(premises).every(Boolean) &&
    a2ByP1.terminal===P1_WIN &&
    ba3.terminal===DRAW;

  states.push({
    exactQClass,
    sequence,
    rank:38,
    support,
    exactBridge:bridge,
    events:{
      A1:{cell:events.A1,column:events.chainColumn+1,row:4},
      A2:{cell:events.A2,column:events.chainColumn+1,row:5},
      A3:{cell:events.A3,column:events.chainColumn+1,row:6},
      B:{cell:events.B,column:events.singletonColumn+1,row:6},
    },
    premises,
    a1Branch:{
      p0ActionColumn:events.chainColumn+1,
      p1ResponseColumn:events.chainColumn+1,
      p1A2Terminal:a2ByP1.terminal===P1_WIN,
      outcome:'P0_NONWIN',
    },
    bBranch:{
      p0ActionColumn:events.singletonColumn+1,
      forcedTail:true,
      forcedColumns:[events.chainColumn+1,events.chainColumn+1,events.chainColumn+1],
      outcome:terminalName(ba3.terminal),
    },
    noP0WinningAction:stateAccept,
    interval:{lower:-1,upper:0},
    accept:stateAccept,
  });
}

const accept=states.every(x=>x.accept);
console.log(JSON.stringify({
  schema:'connect4.cpc_3plus1_deferred_singleton_tail_qualification.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  theorem:'CPC_3PLUS1_DEFERRED_SINGLETON_TAIL_NONWIN_THEOREM.md',
  sourceEvidence:SOURCE,
  states,
  accept,
  summary:{
    qualifiedStateCount:states.filter(x=>x.accept).length,
    failedStateCount:states.filter(x=>!x.accept).length,
    theoremPremisePattern:{
      remainingPoset:'A1<A2<A3 plus incomparable B',
      p0Residual:['A1','A2','A3'],
      p1Residual:['A2'],
      consequence:'P0 nonwin; B is exact draw',
    },
  },
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  conclusion:[
    'All three independent exact instantiations satisfy the label-free 3+1 tail theorem premises.',
    'A1 exposes the deferred P1 singleton A2 as an immediate terminal response.',
    'B exhausts the independent column and forces the three-event chain to an exact full-board draw.',
    'Therefore neither legal P0 action is winning in every qualified instance.',
  ],
  boundary:[
    'Qualification consumes only exact current-state support, normalized residual antichains, gravity order and exact first-win cofactors.',
    'No oracle, solved W/D/L input, minimax, opening book, best-move table, BSFP solved frontier or support-only state identity is used.',
    'Production CPC, JSMinSys and BSFP are unchanged.',
  ],
},null,2));
