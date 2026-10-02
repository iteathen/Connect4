#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const DIFFERENTIAL='CPC_RANK30_D1_A_UNKNOWN_CHILD_STRUCTURAL_DIFFERENTIAL_0_1.json';
const MU1='CPC_RANK30_D1_A_MU1_COUPLED_TARGET_OBLIGATION_0_1.json';
const Q966='966e6353e06e4d41';
const Q9F='9f6b7a33ab7e9552';
const SEQUENCE='44444156666623222242551151531137';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const PROOF_CAP=100000;
const root=resolve(import.meta.dirname,'../../../..');

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const differential=JSON.parse(readFileSync(resolve(import.meta.dirname,DIFFERENTIAL),'utf8'));
const mu1=JSON.parse(readFileSync(resolve(import.meta.dirname,MU1),'utf8'));
assert.equal(differential.schema,'connect4.cpc_rank30_d1_a_unknown_child_structural_differential.v1');
assert.equal(mu1.schema,'connect4.cpc_rank30_d1_a_mu1_coupled_target_obligation.v1');
const source=differential.siblings.find(x=>x.exactQClass===Q966);assert(source);assert.equal(source.defenderColumn,7);
assert.equal(mu1.summary.composedWinCount,2);
for(const q of ['8fed7b5f375c7093','2bb8598461e3e623'])assert(mu1.cases.some(x=>x.sourceQ===q&&x.disposition==='COMPOSED_WIN'));
const composedQ=new Set(mu1.cases.filter(x=>x.disposition==='COMPOSED_WIN').map(x=>x.sourceQ));

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {connect4CpcTargetOwner32,connect4CpcTargetSupportDistance32}=await load('cpc-connect4');

const {createSlot64ResidualQuotientKernel}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const {createRepairCapacityProofEngine}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs')).href);

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P0=0,P1=1,P0_WIN=3,P1_WIN=1,TARGET_G3=20;

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
function keyCells(cells){return [...cells].sort((a,b)=>a-b).join(',');}
function keyArray(key){return key===''?[]:key.split(',').map(Number);}
function strictSubset(a,b){const aa=keyArray(a),bb=new Set(keyArray(b));return aa.length<bb.size&&aa.every(x=>bb.has(x));}
function normalize(keys){const u=[...new Set(keys)];return u.filter(k=>!u.some(o=>o!==k&&strictSubset(o,k))).sort();}
function residualKeys(k,id,p){const cid=p===0?k.states.p0At(id):k.states.p1At(id);return normalize(k.classes.terms(cid).map(termCells).map(keyCells));}
function exactKey(k,id){return 'r'+rank(k,id)+'|h'+support(k,id).join(',')+'|p0:'+residualKeys(k,id,0).join(';')+'|p1:'+residualKeys(k,id,1).join(';');}
function qClass(k,id){return createHash('sha256').update(exactKey(k,id)).digest('hex').slice(0,16);}

function immediateWinningColumns(k,id){
  if((rank(k,id)&1)!==0)return [];
  const out=[];for(const c of legal(k,id))if(k.advance(id,c)===domain.QN_TERMINAL_WIN)out.push(c);return out;
}
function isImmediateWin(k,id){return immediateWinningColumns(k,id).length>0;}
function isOverloadLeaf(k,id){
  if((rank(k,id)&1)!==1)return false;
  const cols=legal(k,id);if(!cols.length)return false;
  for(const c of cols){const child=k.advance(id,c);if(child===domain.QN_TERMINAL_WIN||child<0||!isImmediateWin(k,child))return false;}
  return true;
}
function rankOne(k,id){
  if((rank(k,id)&1)!==0)return null;
  for(const c of legal(k,id)){const child=k.advance(id,c);if(child>=0&&isOverloadLeaf(k,child))return {kind:'RANK1',rootMove:c+1};}
  return null;
}
function rankThree(k,id){
  if((rank(k,id)&1)!==0)return null;
  for(const rootColumn of legal(k,id)){
    const defender=k.advance(id,rootColumn);if(defender<0||isOverloadLeaf(k,defender))continue;
    const replies=legal(k,defender);if(!replies.length)continue;
    let valid=true;const consequences=[];
    for(const dc of replies){
      const attacker=k.advance(defender,dc);if(attacker===domain.QN_TERMINAL_WIN||attacker<0){valid=false;break;}
      const wins=immediateWinningColumns(k,attacker);
      if(wins.length){consequences.push({defenderColumn:dc+1,kind:'IMMEDIATE'});continue;}
      const r1=rankOne(k,attacker);if(!r1){valid=false;break;}consequences.push({defenderColumn:dc+1,kind:'RANK1',rootMove:r1.rootMove});
    }
    if(valid)return {kind:'RANK3',rootMove:rootColumn+1,consequences};
  }
  return null;
}

function jsFromSequence(sequence){
  const x=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function coordHas(q,p,index){const base=p?g.p1Offset:g.p0Offset;return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function activeIds(q,p){const out=[];for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);return out;}
function shapeCells(id){const out=[],b=id*4;for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[b+i]);return out;}
function shapeHasCell(id,cell){const b=id*4;for(let i=0;i<g.shapeSize[id];i++)if(g.shapeCells[b+i]===cell)return true;return false;}
function activeSingletonCells(q,p){return activeIds(q,p).filter(id=>g.shapeSize[id]===1).map(id=>g.shapeCells[id*4]);}
function enabledSingletonCells(q,p){return activeSingletonCells(q,p).filter(cell=>q.words[g.cellColumn[cell]]===g.cellRow[cell]);}
function hasActiveSingleton(q,p,cell){return activeSingletonCells(q,p).includes(cell);}
function cellDesc(cell,q){return {cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1,projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1,supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell)};}

function jsStep(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);assert(q.words[column]<6);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,column,words,0,basis,0,seen,sizes,0);
  assert(terminal>=0);return {words,basis,n:sizes[0],terminal};
}
function coverageWitness(q,id,targetCell,partner,length){
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell],cells=shapeCells(id);
  for(const cell of cells){const c=g.cellColumn[cell],r=g.cellRow[cell];if(c===tc&&r>tr)return true;}
  for(const cell of cells){
    const c=g.cellColumn[cell],r=g.cellRow[cell],depth=r-q.words[c],p=partner[c],L=p>=0?length[c]:0;if(depth<0)continue;
    if(depth>=L+1&&((depth-(L+1))&1)===0)return true;
    if(p>=0&&depth<L){const mate=(q.words[p]+depth)*7+p;if(shapeHasCell(id,mate))return true;}
  }return false;
}
function buildPairMap(q,capacity,partner,length){
  const mate=new Int32Array(42);mate.fill(-1);const role=new Uint8Array(42);
  for(let c=0;c<7;c++){
    const h=q.words[c],p=partner[c],L=p>=0?length[c]:0,cap=capacity[c];
    if(p>=0&&c<p){const hp=q.words[p];for(let d=0;d<L;d++){const a=(h+d)*7+c,b=(hp+d)*7+p;mate[a]=b;mate[b]=a;role[a]=role[b]=3;}}
    for(let d=L;d<cap;d+=2){if(d+1>=cap)return null;const lo=(h+d)*7+c,hi=(h+d+1)*7+c;mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;}
  }return {mate,role};
}
function validateTemplate(q,t){
  const mate=Int32Array.from(t.mate),role=Uint8Array.from(t.role),failures=[];let nodes=0,pairs=0;
  function walk(s){
    nodes++;
    for(let c=0;c<7;c++){
      if(s.words[c]>=6)continue;
      const row=s.words[c],cell=row*7+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){failures.push({kind:'unmapped',column:c+1,row:row+1});continue;}
      const d=jsStep(s,c);if(d.terminal===P1_WIN)continue;if(d.terminal)continue;
      const rc=g.cellColumn[m],rr=g.cellRow[m];if(d.words[rc]!==rr){failures.push({kind:'response-not-playable'});continue;}
      const a=jsStep(d,rc);pairs++;if(a.terminal===P0_WIN)continue;if(a.terminal){failures.push({kind:'wrong-terminal'});continue;}walk(a);
    }
  }
  walk(q);return {pass:failures.length===0,defenderNodes:nodes,responsePairs:pairs,failures:failures.slice(0,12)};
}
function directReservoir(q,targetCell){
  if(!hasActiveSingleton(q,P0,targetCell)||connect4CpcTargetOwner32(g,q.words,0,targetCell)!==P0||enabledSingletonCells(q,P1).length)return null;
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell],targetDepth=tr-q.words[tc];if(targetDepth<=0)return null;
  const capacity=new Uint32Array(7),odd=[];let total=0;
  for(let c=0;c<7;c++){const cap=c===tc?tr-q.words[c]+1:6-q.words[c];if(cap<0)return null;capacity[c]=cap;total+=cap;if(cap&1)odd.push(c);}
  if((total&1)||(odd.length&1))return null;
  const defenderIds=activeIds(q,P1),partner=new Int32Array(7);partner.fill(-1);const length=new Uint32Array(7);let found=null;
  function evalT(){
    const L=partner[tc]>=0?length[tc]:0;if(!(targetDepth>=L+1&&((targetDepth-(L+1))&1)===0))return null;
    for(const id of defenderIds)if(!coverageWitness(q,id,targetCell,partner,length))return null;
    return buildPairMap(q,capacity,partner,length);
  }
  function rec(pending){
    if(found)return;if(!pending.length){found=evalT();return;}
    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),max=Math.min(capacity[a],capacity[b]);partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!found;L+=2){length[a]=length[b]=L;if((a===tc||b===tc)&&L>=capacity[tc])continue;rec(rest);}
      partner[a]=partner[b]=-1;length[a]=length[b]=0;
    }
  }
  rec(odd);if(!found)return null;
  const validation=validateTemplate(q,found);return validation.pass?{kind:'DIRECT_TARGET_RESERVOIR_RCIC',target:cellDesc(targetCell,q),validation}:null;
}

function repairCertificates(k,state){
  const e=createRepairCapacityProofEngine(k,{collectAllWinningActions:true,maxProofStates:PROOF_CAP});
  const targets=e.terms(state,0).filter(t=>t.length===1).map(t=>t[0]).filter(t=>e.invariant(state,t));
  const certs=[];let resourceFailure=null;
  for(const target of targets){
    try{const r=e.prove(state,target);if(r.proved)certs.push({kind:'LEGACY_REPAIR_CAPACITY',target:e.coord(target),proofKind:r.kind,witness:r.witness??null});}
    catch(error){resourceFailure={kind:'repair_resource_failure',message:String(error?.message??error)};break;}
  }
  return {certs,targets:targets.map(t=>e.coord(t)),stats:e.stats(),resourceFailure};
}
function positiveCertificates(k,state,sequence){
  const certs=[],qc=qClass(k,state);
  const wins=immediateWinningColumns(k,state);if(wins.length)certs.push({kind:'IMMEDIATE_P0_TERMINAL',winningColumns:wins.map(x=>x+1)});
  if(composedQ.has(qc))certs.push({kind:'EXACT_MU1_COMPOSED_HANDOFF',sourceQ:qc,sourceEvidence:MU1});
  if(qc===Q9F)certs.push({kind:'EXACT_Q9F_HANDOFF'});
  const r1=rankOne(k,state);if(r1)certs.push(r1);else{const r3=rankThree(k,state);if(r3)certs.push(r3);}
  const repair=repairCertificates(k,state);certs.push(...repair.certs);
  const jq=jsFromSequence(sequence);
  for(const target of activeSingletonCells(jq,P0)){const d=directReservoir(jq,target);if(d)certs.push(d);}
  return {certs,repair};
}

const k=makeKernel(),state=replay(k,SEQUENCE),engine=createRepairCapacityProofEngine(k,{maxProofStates:1});
assert.equal(rank(k,state),32);assert.equal(qClass(k,state),Q966);assert.deepEqual(support(k,state),[6,6,3,6,5,5,1]);
assert(engine.singleton(state,0,TARGET_G3));assert.equal(engine.targetDistance(state,TARGET_G3),1);assert.equal(engine.mu(state),2);

let resourceFailureCount=0;
const actions=[];
for(const [label,column] of [['E',4],['F',5]]){
  assert(engine.repairs(state,TARGET_G3).includes(column));
  const afterP0=k.advance(state,column);assert(afterP0>=0&&afterP0!==domain.QN_TERMINAL_WIN);
  const muAfterAction=engine.mu(afterP0);assert.equal(muAfterAction,1);
  const replies=[];
  for(const reply of legal(k,afterP0)){
    const replyCell=landing(k,afterP0,reply),child=k.advance(afterP0,reply),sequence=SEQUENCE+String(column+1)+String(reply+1);
    if(child===domain.QN_TERMINAL_WIN){
      replies.push({replyColumn:reply+1,replyCell:engine.coord(replyCell),exactQClass:null,support:null,disposition:'P1_TERMINAL',positiveCertificates:[]});
      continue;
    }
    assert(child>=0&&rank(k,child)===34);
    const positive=positiveCertificates(k,child,sequence);if(positive.repair.resourceFailure)resourceFailureCount++;
    replies.push({
      replyColumn:reply+1,replyCell:engine.coord(replyCell),sequence,exactQClass:qClass(k,child),support:support(k,child),
      targetLive:engine.singleton(child,0,TARGET_G3),targetSupportDistance:engine.singleton(child,0,TARGET_G3)?engine.targetDistance(child,TARGET_G3):null,
      enabledP1Singletons:engine.enabledSingletons(child,1).map(engine.coord),
      positiveCertificates:positive.certs,repairAudit:{targets:positive.repair.targets,stats:positive.repair.stats,resourceFailure:positive.repair.resourceFailure},
      disposition:positive.certs.length?'P0_WIN':'UNKNOWN'
    });
  }
  const hasTerminal=replies.some(x=>x.disposition==='P1_TERMINAL'),allClosed=replies.length>0&&replies.every(x=>x.disposition==='P0_WIN');
  actions.push({action:label,column:column+1,muAfterAction,replies,disposition:hasTerminal?'COUNTEREXAMPLE':allClosed?'ACCEPTED':'UNRESOLVED'});
}
const accepted=actions.filter(x=>x.disposition==='ACCEPTED');
const classification=accepted.length?'Q966_WIN':actions.every(x=>x.disposition==='COUNTEREXAMPLE')?'Q966_COUNTEREXAMPLE':'Q966_UNRESOLVED';
const unknown=actions.flatMap(x=>x.replies.filter(y=>y.disposition==='UNKNOWN').map(y=>({action:x.action,...y})));

console.log(JSON.stringify({
  schema:'connect4.cpc_rank32_q966_extended_repair_composition.v1',
  date:'2026-10-01',jsMinSysSha:EXPECTED,
  design:'CPC_RANK32_Q966_EXTENDED_REPAIR_COMPOSITION_DESIGN_0_1.md',
  sourceEvidence:{differential:DIFFERENTIAL,mu1:MU1},
  exactQClass:Q966,sequence:SEQUENCE,rank:32,support:support(k,state),target:'G3',mu:2,
  actions,classification,
  acceptedRepairActions:accepted.map(x=>x.action),
  summary:{
    acceptedActionCount:accepted.length,
    acceptedRepairActions:accepted.map(x=>x.action),
    unresolvedActionCount:actions.filter(x=>x.disposition==='UNRESOLVED').length,
    counterexampleActionCount:actions.filter(x=>x.disposition==='COUNTEREXAMPLE').length,
    exactMu1HandoffCount:actions.flatMap(x=>x.replies).filter(y=>y.positiveCertificates.some(z=>z.kind==='EXACT_MU1_COMPOSED_HANDOFF')).length,
    unknownReplyCount:unknown.length,
    smallestUnknownReply:unknown[0]??null,
    resourceFailureCount
  },
  oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,jsMinSysModified:false,legacyRepairModified:false,rcicModified:false,bsfpModified:false,
  conclusion:[
    'q966 is reconstructed by exact semantic identity and both legacy repair candidates E/F are replayed branch-completely.',
    classification==='Q966_WIN'
      ? 'At least one of E/F closes every P1 reply after admitting the newly qualified mu=1 children only by exact q handoff; q966 is therefore constructively P0-winning.'
      : classification==='Q966_COUNTEREXAMPLE'
        ? 'Both repair actions contain an exact P1 terminal counterexample; q966 is not closed by this composition.'
        : 'At least one nonterminal reply remains outside the monotone positive library; the smallest exact obstruction is preserved.',
    accepted.length===2?'Both E and F are valid repair witnesses; neither is privileged by the proof.':'The result preserves exactly which repair actions close.'
  ],
  boundary:[
    'No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.',
    'The two mu=1 results are admitted only by exact semantic-q identity.',
    'Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, and BSFP remain unchanged.'
  ]
},null,2));
