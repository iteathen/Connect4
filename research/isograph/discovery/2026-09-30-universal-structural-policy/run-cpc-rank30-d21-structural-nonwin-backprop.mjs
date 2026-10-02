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
const LEAF='SECOND_D1_C5_CONTRACTION:A->A';
const Q='d21a89605c399aca';
const SEQUENCE='444441566666232222425511515311';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');

const {createSlot64ResidualQuotientKernel}=await import('../../../semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs');
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
function support(k,id){
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
  return 'r'+rank(k,id)+'|h'+support(k,id).join(',')+
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
function activeIds(q,p){const out=[];for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);return out;}
function shapeCells(id){const out=[],b=id*4;for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[b+i]);return out;}
function jsResidualKeys(q,p){return normalize(activeIds(q,p).map(id=>keyCells(shapeCells(id))));}
function exactBridge(sequence,expectedQ,expectedRank,expectedSupport,k){
  const sid=replay(k,sequence),jsq=jsFromSequence(sequence);
  const checks={
    semanticQ:qClass(k,sid)===expectedQ,
    rank:rank(k,sid)===expectedRank&&jsRank(jsq)===expectedRank,
    support:JSON.stringify(support(k,sid))===JSON.stringify(expectedSupport)&&JSON.stringify(jsSupport(jsq))===JSON.stringify(expectedSupport),
    p0Residuals:JSON.stringify(semResidualKeys(k,sid,P0))===JSON.stringify(jsResidualKeys(jsq,P0)),
    p1Residuals:JSON.stringify(semResidualKeys(k,sid,P1))===JSON.stringify(jsResidualKeys(jsq,P1)),
  };
  return {pass:Object.values(checks).every(Boolean),checks,exactQClass:qClass(k,sid)};
}
function read(name){return JSON.parse(readFileSync(resolve(import.meta.dirname,name),'utf8'));}
const LOSS=()=>[-1,-1],NONWIN=()=>[-1,0];

const lossEvidence=read('CPC_RANK20_RANK32_FORCED_OBLIGATION_LOSS_CENSUS_0_1.json');
const closure=read('CPC_RANK30_D1_A_BIDIRECTIONAL_PROOF_LIBRARY_CLOSURE_0_1.json');
const q966=read('CPC_Q966_NONWIN_PROPAGATION_SURVIVING_G_AUDIT_0_1.json');

assert.equal(lossEvidence.schema,'connect4.cpc_rank20_rank32_forced_obligation_loss_census.v1');
assert.equal(closure.schema,'connect4.cpc_rank30_d1_a_bidirectional_proof_library_closure.v1');
assert.equal(q966.schema,'connect4.cpc_q966_nonwin_propagation_surviving_g_audit.v1');
assert.equal(q966.classification,'Q966_P0_NONWIN');
assert.deepEqual(q966.interval,{lower:-1,upper:0});

const frozenLeaf=lossEvidence.sourceLeaves.find(x=>x.sourceLeafId===LEAF);assert(frozenLeaf);
assert.equal(frozenLeaf.exactQClass,Q);
assert.equal(frozenLeaf.sequence,SEQUENCE);
assert.deepEqual(frozenLeaf.support,[6,6,2,6,5,5,0]);
assert.deepEqual(frozenLeaf.survivingRootMoves,[3]);

const k=makeKernel();
const root=replay(k,SEQUENCE);
const bridge=exactBridge(SEQUENCE,Q,30,[6,6,2,6,5,5,0],k);
assert(bridge.pass);
const legal=[];
for(let c=0;c<7;c++)if(k.supportAccess.landingAt(k.states.supportAt(root),c)!==0xff)legal.push(c+1);
assert.deepEqual(legal,[3,5,6,7]);

const c7=closure.children.find(x=>x.defenderColumn===7);assert(c7);
assert.equal(c7.exactQClass,q966.exactQClass);
const afterC=k.advance(root,2);assert(afterC>=0);
const afterC7=k.advance(afterC,6);assert(afterC7>=0);
assert.equal(qClass(k,afterC7),q966.exactQClass);

const rootActions=[{
  column:3,
  kind:'EXACT_Q966_NONWIN_REPLY',
  interval:{lower:-1,upper:0},
  witness:{p1Column:7,childQ:q966.exactQClass,sourceEvidence:'CPC_Q966_NONWIN_PROPAGATION_SURVIVING_G_AUDIT_0_1.json'},
}];

for(const column of [5,6,7]){
  const a=frozenLeaf.rootActions.find(x=>x.rootMove===column);assert(a);
  assert.equal(a.eliminated,true);
  assert.equal(a.eliminationKind,'RANK32_FORCED_OBLIGATION_LOSS');
  const childEvidence=lossEvidence.rank32Classes.find(x=>x.exactQClass===a.lowerQClass);assert(childEvidence);
  assert.equal(childEvidence.proofCompleted,true);
  assert.equal(childEvidence.lossCertified,true);
  assert.equal(childEvidence.proofKind,'FORCED_BLOCK_THEN_P1_TERMINAL');
  assert.equal(childEvidence.resourceFailure,null);

  const afterP0=k.advance(root,column-1);assert(afterP0>=0);
  const afterP1=k.advance(afterP0,a.adversarialReply-1);assert(afterP1>=0);
  assert.equal(qClass(k,afterP1),a.lowerQClass);

  rootActions.push({
    column,
    kind:'RANK32_FORCED_OBLIGATION_LOSS',
    interval:{lower:-1,upper:-1},
    witness:{
      p1Column:a.adversarialReply,
      childQ:a.lowerQClass,
      proofKind:childEvidence.proofKind,
      obligation:childEvidence.compactProof?.obligation??null,
      forcedColumn:childEvidence.compactProof?.forcedColumn??null,
      terminalReply:childEvidence.compactProof?.replyCell??null,
    },
  });
}
rootActions.sort((a,b)=>a.column-b.column);
const interval=predecessorInterval(0,rootActions.map(x=>[x.interval.lower,x.interval.upper]));
assert.deepEqual(interval,NONWIN());

console.log(JSON.stringify({
  schema:'connect4.cpc_rank30_d21_structural_nonwin_backprop.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  design:'CPC_RANK30_D21_STRUCTURAL_NONWIN_BACKPROP_DESIGN_0_1.md',
  sourceLeafId:LEAF,
  exactQClass:Q,
  sequence:SEQUENCE,
  rank:30,
  support:[6,6,2,6,5,5,0],
  exactBridge:bridge,
  q966Premise:{
    exactQClass:q966.exactQClass,
    classification:q966.classification,
    interval:q966.interval,
    sourceEvidence:'CPC_Q966_NONWIN_PROPAGATION_SURVIVING_G_AUDIT_0_1.json',
  },
  rootActions,
  classification:'P0_NONWIN',
  interval:{lower:interval[0],upper:interval[1]},
  resourceFailureCount:0,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  conclusion:[
    'The rank-30 d21 state is reconstructed by exact semantic-q / JSMinSys RBA equality.',
    'E, F and G retain their previously qualified adversarial c3 replies into exact rank-32 forced-obligation P0-loss states.',
    'C now has an exact adversarial c7 reply into q966, structurally certified P0-nonwinning.',
    'Every legal P0 action therefore has upper bound <= 0, so the rank-30 d21 state is P0_NONWIN with interval [-1,0].',
  ],
  boundary:[
    'This is one-sided nonwin only; no loss or draw upgrade is implied.',
    'All handoffs require exact semantic-q equality.',
    'No oracle, solved W/D/L input, minimax, unrestricted game-tree value, opening book, best-move table or BSFP solved frontier is used.',
    'Production CPC, JSMinSys and BSFP are unchanged.',
  ],
},null,2));
