#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const Q1E='1e8601e86599ef24';
const Q1E_SEQUENCE='444441566666232222425511515331';
const D21='d21a89605c399aca';
const D21_SEQUENCE='444441566666232222425511515311';
const Q966='966e6353e06e4d41';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const root=resolve(import.meta.dirname,'../../../..');

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const diff=JSON.parse(readFileSync(resolve(import.meta.dirname,'CPC_RANK30_C_REPLY_STRUCTURAL_DIFFERENTIAL_CENSUS_0_1.json'),'utf8'));
const d21Evidence=JSON.parse(readFileSync(resolve(import.meta.dirname,'CPC_RANK30_D21_STRUCTURAL_NONWIN_BACKPROP_0_1.json'),'utf8'));
const q966Evidence=JSON.parse(readFileSync(resolve(import.meta.dirname,'CPC_Q966_NONWIN_PROPAGATION_SURVIVING_G_AUDIT_0_1.json'),'utf8'));
assert.equal(diff.schema,'connect4.cpc_rank30_c_reply_structural_differential_census.v1');
assert.equal(d21Evidence.exactQClass,D21);
assert.equal(d21Evidence.classification,'P0_NONWIN');
assert.deepEqual(d21Evidence.interval,{lower:-1,upper:0});
assert.equal(q966Evidence.exactQClass,Q966);
assert.equal(q966Evidence.classification,'Q966_P0_NONWIN');
assert.deepEqual(q966Evidence.interval,{lower:-1,upper:0});
const frozenQ1e=diff.states.find(x=>x.exactQClass===Q1E);assert(frozenQ1e);
assert.equal(frozenQ1e.sourceDisposition,'UNKNOWN');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');

const {createSlot64ResidualQuotientKernel}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const {createRepairCapacityProofEngine}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const P0=0,P1=1;

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
    assert(Number.isSafeInteger(n)&&n>=0,'bad replay '+sequence);
    id=n;
  }
  return id;
}
function rank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function landing(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function legal(k,id){const out=[];for(let c=0;c<7;c++)if(landing(k,id,c)!==0xff)out.push(c);return out;}
function support(k,id){
  const out=[];for(let c=0;c<7;c++){const x=landing(k,id,c);out.push(x===0xff?6:Math.floor(x/7));}
  return out;
}
function hasBit(term,cell){return cell<32?(((term[0]>>>cell)&1)!==0):(((term[1]>>>(cell-32))&1)!==0);}
function termCells(term){const out=[];for(let cell=0;cell<42;cell++)if(hasBit(term,cell))out.push(cell);return out;}
function keyCells(cells){return [...cells].sort((a,b)=>a-b).join(',');}
function keyArray(key){return key===''?[]:key.split(',').map(Number);}
function strictSubset(a,b){const aa=keyArray(a),bb=new Set(keyArray(b));return aa.length<bb.size&&aa.every(x=>bb.has(x));}
function normalize(keys){const u=[...new Set(keys)];return u.filter(k=>!u.some(o=>o!==k&&strictSubset(o,k))).sort();}
function residualKeys(k,id,p){
  const cid=p===0?k.states.p0At(id):k.states.p1At(id);
  return normalize(k.classes.terms(cid).map(termCells).map(keyCells));
}
function exactKey(k,id){
  return 'r'+rank(k,id)+'|h'+support(k,id).join(',')+
    '|p0:'+residualKeys(k,id,P0).join(';')+
    '|p1:'+residualKeys(k,id,P1).join(';');
}
function qClass(k,id){return createHash('sha256').update(exactKey(k,id)).digest('hex').slice(0,16);}

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
function activeIds(q,p){const out=[];for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);return out;}
function shapeCells(id){const out=[],b=id*4;for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[b+i]);return out;}
function jsResidualKeys(q,p){return normalize(activeIds(q,p).map(id=>keyCells(shapeCells(id))));}
function exactBridge(sequence,k,id,expectedQ){
  const js=jsFromSequence(sequence);
  const checks={
    semanticQ:qClass(k,id)===expectedQ,
    rank:jsRank(js)===rank(k,id)&&jsRank(js)===sequence.length,
    support:JSON.stringify(jsSupport(js))===JSON.stringify(support(k,id)),
    p0Residuals:JSON.stringify(jsResidualKeys(js,P0))===JSON.stringify(residualKeys(k,id,P0)),
    p1Residuals:JSON.stringify(jsResidualKeys(js,P1))===JSON.stringify(residualKeys(k,id,P1)),
  };
  return {pass:Object.values(checks).every(Boolean),checks,exactQClass:qClass(k,id)};
}
function residualDifference(k,a,b){
  const p0a=residualKeys(k,a,P0),p0b=residualKeys(k,b,P0),p1a=residualKeys(k,a,P1),p1b=residualKeys(k,b,P1);
  return {
    p0OnlyA:p0a.filter(x=>!p0b.includes(x)),
    p0OnlyB:p0b.filter(x=>!p0a.includes(x)),
    p1OnlyA:p1a.filter(x=>!p1b.includes(x)),
    p1OnlyB:p1b.filter(x=>!p1a.includes(x)),
  };
}

const k=makeKernel(),engine=createRepairCapacityProofEngine(k,{maxProofStates:1});
const q1e=replay(k,Q1E_SEQUENCE),d21=replay(k,D21_SEQUENCE);
const q1eBridge=exactBridge(Q1E_SEQUENCE,k,q1e,Q1E);
const d21Bridge=exactBridge(D21_SEQUENCE,k,d21,D21);
assert(q1eBridge.pass&&d21Bridge.pass);
assert.equal(rank(k,q1e),30);assert.equal(rank(k,d21),30);
assert.deepEqual(support(k,q1e),[5,6,3,6,5,5,0]);
assert.deepEqual(support(k,d21),[6,6,2,6,5,5,0]);
assert.deepEqual(legal(k,q1e).map(c=>c+1),[1,3,5,6,7]);

const q1eRootActions=[];
for(const c of legal(k,q1e)){
  const after=k.advance(q1e,c);
  assert(after!==domain.QN_ILLEGAL);
  if(c===0)continue;
  assert(after>=0,'unexpected q1e non-A terminal');
  const terminals=engine.terminalActions(after,P1).map(x=>({column:x.column+1,cell:engine.coord(x.cell)}));
  assert(terminals.some(x=>x.column===1&&x.cell==='A6'),'non-A action did not expose P1:A6');
  q1eRootActions.push({
    column:c+1,
    kind:'P1_A6_TERMINAL_REPLY',
    witness:{p1Column:1,cell:'A6'},
    interval:{lower:-1,upper:-1},
  });
}

const q1eAfterA=k.advance(q1e,0);assert(q1eAfterA>=0&&rank(k,q1eAfterA)===31);
const d21AfterC=k.advance(d21,2);assert(d21AfterC>=0&&rank(k,d21AfterC)===31);
const supportA=support(k,q1eAfterA),supportC=support(k,d21AfterC);
const p0A=residualKeys(k,q1eAfterA,P0),p0C=residualKeys(k,d21AfterC,P0);
const p1A=residualKeys(k,q1eAfterA,P1),p1C=residualKeys(k,d21AfterC,P1);
const convergence={
  supportEqual:JSON.stringify(supportA)===JSON.stringify(supportC),
  p0ResidualsEqual:JSON.stringify(p0A)===JSON.stringify(p0C),
  p1ResidualsEqual:JSON.stringify(p1A)===JSON.stringify(p1C),
};
convergence.exactQEqual=convergence.supportEqual&&convergence.p0ResidualsEqual&&convergence.p1ResidualsEqual;
convergence.q1eSuccessorQ=qClass(k,q1eAfterA);
convergence.d21SuccessorQ=qClass(k,d21AfterC);
convergence.residualDifference=convergence.exactQEqual?null:residualDifference(k,q1eAfterA,d21AfterC);
assert.deepEqual(supportA,[6,6,3,6,5,5,0]);
assert.deepEqual(supportC,[6,6,3,6,5,5,0]);
if(convergence.exactQEqual)assert.equal(convergence.q1eSuccessorQ,convergence.d21SuccessorQ);

const d21AfterG=k.advance(d21AfterC,6);assert(d21AfterG>=0&&rank(k,d21AfterG)===32);
assert.equal(qClass(k,d21AfterG),Q966);
const q1eAfterG=k.advance(q1eAfterA,6);
assert(q1eAfterG>=0&&rank(k,q1eAfterG)===32);
const afterG={
  q1eChildQ:qClass(k,q1eAfterG),
  d21ChildQ:qClass(k,d21AfterG),
  sameExactQ:exactKey(k,q1eAfterG)===exactKey(k,d21AfterG),
  q1eSupport:support(k,q1eAfterG),
  d21Support:support(k,d21AfterG),
};

let classification='UNKNOWN',interval={lower:-1,upper:1};
if(convergence.exactQEqual){
  assert.equal(afterG.q1eChildQ,Q966);
  assert.equal(afterG.d21ChildQ,Q966);
  assert.equal(afterG.sameExactQ,true);
  q1eRootActions.push({
    column:1,
    kind:'EXACT_Q966_NONWIN_REPLY_VIA_CONVERGENCE',
    witness:{
      forcedP0Cell:'A6',
      p1Column:7,
      childQ:Q966,
      convergedRank31Q:convergence.q1eSuccessorQ,
      sourceEvidence:'CPC_Q966_NONWIN_PROPAGATION_SURVIVING_G_AUDIT_0_1.json',
    },
    interval:{lower:-1,upper:0},
  });
  classification='P0_NONWIN';
  interval={lower:-1,upper:0};
}else{
  q1eRootActions.push({
    column:1,
    kind:'FORCED_A6_SUCCESSOR_UNRESOLVED',
    witness:{
      successorQ:convergence.q1eSuccessorQ,
      p1GChildQ:afterG.q1eChildQ,
    },
    interval:{lower:-1,upper:1},
  });
}
q1eRootActions.sort((a,b)=>a.column-b.column);

console.log(JSON.stringify({
  schema:'connect4.cpc_q1e_d21_successor_exact_convergence.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  design:'CPC_Q1E_D21_SUCCESSOR_EXACT_CONVERGENCE_DESIGN_0_1.md',
  q1e:{
    exactQClass:Q1E,sequence:Q1E_SEQUENCE,rank:30,support:[5,6,3,6,5,5,0],exactBridge:q1eBridge,
  },
  d21:{
    exactQClass:D21,sequence:D21_SEQUENCE,rank:30,support:[6,6,2,6,5,5,0],exactBridge:d21Bridge,
    classification:d21Evidence.classification,interval:d21Evidence.interval,
  },
  successors:{
    q1eAfterA:{sequence:Q1E_SEQUENCE+'1',exactQClass:qClass(k,q1eAfterA),support:supportA,
      p0Residuals:p0A,p1Residuals:p1A},
    d21AfterC:{sequence:D21_SEQUENCE+'3',exactQClass:qClass(k,d21AfterC),support:supportC,
      p0Residuals:p0C,p1Residuals:p1C},
  },
  convergence,
  afterG,
  q966Premise:{
    exactQClass:Q966,classification:q966Evidence.classification,interval:q966Evidence.interval,
    sourceEvidence:'CPC_Q966_NONWIN_PROPAGATION_SURVIVING_G_AUDIT_0_1.json',
  },
  q1eRootActions,
  classification,
  interval,
  resourceFailureCount:0,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  conclusion:[
    convergence.exactQEqual
      ? 'The q1e forced A6 successor and the d21 C3 successor are the same exact semantic q despite their distinct physical histories.'
      : 'The two rank-31 successors share support but remain distinct exact semantic q states; support equality is not promoted to state equality.',
    convergence.exactQEqual
      ? 'P1:G from the converged successor reaches exact q966, so q1e:A6 is P0-nonwinning.'
      : 'The q1e forced A6 branch remains unresolved under this exact-convergence hypothesis.',
    classification==='P0_NONWIN'
      ? 'All non-A q1e actions lose immediately to P1:A6, and A is nonwinning; q1e is therefore P0_NONWIN [-1,0].'
      : 'q1e remains UNKNOWN.',
  ],
  boundary:[
    'Neutral-token structure motivates the equality test but does not replace exact q equality.',
    'No oracle, solved W/D/L, minimax, unrestricted game-tree value, opening book, best-move table or BSFP solved frontier is used.',
    'Production CPC, JSMinSys and BSFP are unchanged.',
  ],
},null,2));
