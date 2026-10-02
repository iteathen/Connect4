#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE='CPC_Q5D34_THREE_SAFE_ACTION_CONSEQUENCE_CLOSURE_0_1.json';
const TARGET_Q='5d34e24395b9d801';
const TARGET_SEQUENCE='4444415666662322224255115153113777';
const PROOF_CAP=100000;
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const root=resolve(import.meta.dirname,'../../../..');

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32,
  connect4CpcTargetOwner32,connect4CpcTargetSupportDistance32,
}=await load('cpc-connect4');

const kernelMod=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const repairMod=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs')).href);
const {createSlot64ResidualQuotientKernel}=kernelMod;
const {createRepairCapacityProofEngine}=repairMod;

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P0=0,P1=1,P0_WIN=3,P1_WIN=1;

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
  for(let c=0;c<7;c++){const x=k.supportAccess.landingAt(s,c);out.push(x===0xff?6:Math.floor(x/7));}
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
function semKey(k,id){return 'r'+semRank(k,id)+'|h'+semSupport(k,id).join(',')+'|p0:'+semResidualKeys(k,id,0).join(';')+'|p1:'+semResidualKeys(k,id,1).join(';');}
function qClass(k,id){return createHash('sha256').update(semKey(k,id)).digest('hex').slice(0,16);}

function jsFromSequence(sequence){
  const x=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function jsRank(q){return q.words[g.metaOffset]>>>2;}
function jsMover(q){return jsRank(q)&1;}
function jsSupport(q){return Array.from(q.words.slice(0,g.columns));}
function jsStep(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);assert(column>=0&&column<7&&q.words[column]<6);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,column,words,0,basis,0,seen,sizes,0);
  assert(terminal>=0);return {words,basis,n:sizes[0],terminal};
}
function coordHas(q,p,index){const base=p?g.p1Offset:g.p0Offset;return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function activeIds(q,p){const out=[];for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);return out;}
function minimalIds(q,p){const a=activeIds(q,p);return a.filter(id=>!a.some(o=>o!==id&&g.shapeSize[o]<g.shapeSize[id]&&connect4RbaShapeSubset(g,o,id)));}
function shapeCells(id){const out=[],b=id*4;for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[b+i]);return out;}
function shapeHasCell(id,cell){const b=id*4;for(let i=0;i<g.shapeSize[id];i++)if(g.shapeCells[b+i]===cell)return true;return false;}
function jsResidualKeys(q,p){return normalize(activeIds(q,p).map(id=>keyCells(shapeCells(id))));}
function exactBridge(sequence,jsq,k,sid){
  const checks={
    rank:jsRank(jsq)===semRank(k,sid)&&jsRank(jsq)===sequence.length,
    mover:jsMover(jsq)===(semRank(k,sid)&1),
    support:JSON.stringify(jsSupport(jsq))===JSON.stringify(semSupport(k,sid)),
    p0Residuals:JSON.stringify(jsResidualKeys(jsq,P0))===JSON.stringify(semResidualKeys(k,sid,P0)),
    p1Residuals:JSON.stringify(jsResidualKeys(jsq,P1))===JSON.stringify(semResidualKeys(k,sid,P1)),
  };
  return {pass:Object.values(checks).every(Boolean),checks,semanticQClass:qClass(k,sid)};
}

function cellDesc(cell,q){return {cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1,projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1,supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell)};}
function hasActiveSingleton(q,p,cell){return activeIds(q,p).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);}
function activeMinimalSingletonCells(q,p){return minimalIds(q,p).filter(id=>g.shapeSize[id]===1).map(id=>g.shapeCells[id*4]);}
function playableSingletons(q,p){
  const out=[];for(const id of activeIds(q,p)){if(g.shapeSize[id]!==1)continue;const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];if(q.words[c]===r)out.push({diagnosticId:id,...cellDesc(cell,q)});}return out;
}
function residualDesc(q,id,p){const cells=shapeCells(id).map(c=>cellDesc(c,q));return {diagnosticId:id,size:g.shapeSize[id],cells,fullyAligned:cells.every(x=>x.projectedOwner===p+1)};}
function alignedMinimalPairs(q){return minimalIds(q,P0).filter(id=>g.shapeSize[id]===2).map(id=>residualDesc(q,id,P0)).filter(x=>x.fullyAligned);}

function cpc(q){
  const kinds=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]),out={};
  for(const [name,frontierResponse] of [['baseline',false],['frontier',true]]){
    const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
    out[name]={kind:kinds.get(kind),forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,preemptionCount:s.preemptionCount[0]};
  }
  return out;
}
function agreedRestriction(x){return x.baseline.kind==='CPC_RESTRICT'&&x.frontier.kind==='CPC_RESTRICT'&&x.baseline.preemptionCount===1&&x.frontier.preemptionCount===1&&x.baseline.forcedColumn===x.frontier.forcedColumn?x.baseline.forcedColumn:null;}

const KNOWN={
  RANK22_ROUTED:'4444415666662322224233',
  RANK24_ZUGZWANG:'444441566666232222423311',
  RANK24_SINGLETON:'444441566666232222423313',
  RANK24_ROUTED:'444441566666232222423317',
};
const knownStates=Object.fromEntries(Object.entries(KNOWN).map(([k,s])=>[k,jsFromSequence(s)]));
function exactEqual(a,b){if(!a||!b||a.terminal!==b.terminal||a.n!==b.n)return false;for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;return true;}
function knownRoot(q){for(const [k,v] of Object.entries(knownStates))if(exactEqual(q,v))return k;return null;}

function coverageWitness(q,id,targetCell,partner,length){
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell],cells=shapeCells(id);
  for(const cell of cells){const c=g.cellColumn[cell],r=g.cellRow[cell];if(c===tc&&r>tr)return {kind:'post-target-deferral',...cellDesc(cell,q)};}
  for(const cell of cells){
    const c=g.cellColumn[cell],r=g.cellRow[cell],depth=r-q.words[c],p=partner[c],L=p>=0?length[c]:0;if(depth<0)continue;
    if(depth>=L+1&&((depth-(L+1))&1)===0)return {kind:'vertical-response',...cellDesc(cell,q)};
    if(p>=0&&depth<L){const mate=(q.words[p]+depth)*7+p;if(shapeHasCell(id,mate))return {kind:'cross-pair',columns:[c+1,p+1],depth,L};}
  }
  return null;
}
function buildPairMap(q,capacity,partner,length){
  const mate=new Int32Array(42);mate.fill(-1);const role=new Uint8Array(42);
  for(let c=0;c<7;c++){
    const h=q.words[c],p=partner[c],L=p>=0?length[c]:0,cap=capacity[c];
    if(p>=0&&c<p){const hp=q.words[p];for(let d=0;d<L;d++){const a=(h+d)*7+c,b=(hp+d)*7+p;mate[a]=b;mate[b]=a;role[a]=role[b]=3;}}
    for(let d=L;d<cap;d+=2){if(d+1>=cap)throw new Error('odd vertical tail');const lo=(h+d)*7+c,hi=(h+d+1)*7+c;mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;}
  }return {mate,role};
}
function validateTemplate(q,targetCell,t){
  const mate=Int32Array.from(t.mate),role=Uint8Array.from(t.role),failures=[];let nodes=0,pairs=0;
  function walk(s){nodes++;for(let c=0;c<7;c++){if(s.words[c]>=6)continue;const row=s.words[c],cell=row*7+c,r=role[cell],m=mate[cell];if(r!==1&&r!==3){failures.push({kind:'unmapped',column:c+1,row:row+1});continue;}const d=jsStep(s,c);if(d.terminal===P1_WIN){failures.push({kind:'defender-terminal',column:c+1,row:row+1});continue;}if(d.terminal)continue;const rc=g.cellColumn[m],rr=g.cellRow[m];if(d.words[rc]!==rr){failures.push({kind:'response-not-playable'});continue;}const a=jsStep(d,rc);pairs++;if(a.terminal===P0_WIN)continue;if(a.terminal){failures.push({kind:'wrong-terminal'});continue;}walk(a);}}
  walk(q);return {pass:failures.length===0,defenderNodes:nodes,responsePairs:pairs,failures:failures.slice(0,20)};
}
function findTargetTemplate(q,targetCell){
  if(!hasActiveSingleton(q,P0,targetCell)||connect4CpcTargetOwner32(g,q.words,0,targetCell)!==P0||playableSingletons(q,P1).length)return null;
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell],targetDepth=tr-q.words[tc];if(targetDepth<=0)return null;
  const capacity=new Uint32Array(7),odd=[];let total=0;
  for(let c=0;c<7;c++){const cap=c===tc?tr-q.words[c]+1:6-q.words[c];if(cap<0)return null;capacity[c]=cap;total+=cap;if(cap&1)odd.push(c);}
  if((total&1)||(odd.length&1))return null;
  const defenderIds=activeIds(q,P1),partner=new Int32Array(7);partner.fill(-1);const length=new Uint32Array(7);let found=null;
  function evalTemplate(){
    const L=partner[tc]>=0?length[tc]:0;if(!(targetDepth>=L+1&&((targetDepth-(L+1))&1)===0))return null;
    for(const id of defenderIds)if(!coverageWitness(q,id,targetCell,partner,length))return null;
    const map=buildPairMap(q,capacity,partner,length);return {capacity:Array.from(capacity),mate:Array.from(map.mate),role:Array.from(map.role),oddColumns:odd.map(x=>x+1)};
  }
  function rec(pending){if(found)return;if(!pending.length){found=evalTemplate();return;}const a=pending[0];for(let j=1;j<pending.length&&!found;j++){const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),max=Math.min(capacity[a],capacity[b]);partner[a]=b;partner[b]=a;for(let L=1;L<=max&&!found;L+=2){length[a]=length[b]=L;if((a===tc||b===tc)&&L>=capacity[tc])continue;rec(rest);}partner[a]=partner[b]=-1;length[a]=length[b]=0;}}
  rec(odd);return found;
}
function targetRoute(q,target,kind,extra={}){
  const template=findTargetTemplate(q,target),validation=template?validateTemplate(q,target,template):null;
  return {kind,...extra,target:cellDesc(target,q),accept:!!template&&validation?.pass===true,template:template?{capacity:template.capacity,oddColumns:template.oddColumns}:null,validation};
}
function contractionRoutes(before,after,landing,extra={}){
  const out=[];for(const pair of alignedMinimalPairs(before)){const cells=pair.cells.map(x=>x.cell);if(!cells.includes(landing))continue;const other=cells[0]===landing?cells[1]:cells[0];if(after.terminal===0&&hasActiveSingleton(after,P0,other))out.push(targetRoute(after,other,'FORCED_PAIR_CONTRACTION_TO_RESERVOIR_RCIC',extra));}return out;
}
function genericRoutes(q){
  const attempts=[],accepted=[];
  for(let p0=0;p0<7;p0++){
    if(q.words[p0]>=6)continue;
    const landing=q.words[p0]*7+p0,child=jsStep(q,p0);
    if(child.terminal===P0_WIN){const x={kind:'EXACT_TERMINAL',p0Column:p0+1,accept:true};attempts.push(x);accepted.push(x);continue;}
    if(child.terminal!==0)continue;
    const kr=knownRoot(child);if(kr){const x={kind:'EXACT_KNOWN_ROOT_HANDOFF',p0Column:p0+1,knownRoot:kr,accept:true};attempts.push(x);accepted.push(x);}
    for(const target of activeMinimalSingletonCells(child,P0)){const x=targetRoute(child,target,'DIRECT_TARGET_RESERVOIR_RCIC',{p0Column:p0+1});attempts.push(x);if(x.accept)accepted.push(x);}
    const fc=agreedRestriction(cpc(child));
    if(fc&&child.words[fc-1]<6){
      const forced=jsStep(child,fc-1);
      if(forced.terminal===0){
        for(let f=0;f<7;f++){if(forced.words[f]>=6)continue;const land=forced.words[f]*7+f,after=jsStep(forced,f);if(after.terminal===P0_WIN){const x={kind:'FORCED_EXACT_TERMINAL',p0Column:p0+1,defenderColumn:fc,followupP0Column:f+1,accept:true};attempts.push(x);accepted.push(x);}else if(after.terminal===0){for(const x of contractionRoutes(forced,after,land,{p0Column:p0+1,defenderColumn:fc,followupP0Column:f+1})){attempts.push(x);if(x.accept)accepted.push(x);}}}
      }
    }
  }return {attempts,accepted};
}
function legacyProof(sequence,target){
  const k=makeKernel(),state=semReplay(k,sequence),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:true,maxProofStates:PROOF_CAP});
  try{const r=e.prove(state,target);return {completed:true,proved:r.proved??false,kind:r.kind??null,winningActions:(r.winningActions??[]).map(x=>({column:x.column,kind:x.kind})),stats:e.stats()};}
  catch(err){return {completed:false,proved:false,error:String(err?.message??err),stats:e.stats()};}
}


const Q9F_EVIDENCE='CPC_RANK32_Q9F_MONOTONE_PROOF_LIBRARY_CLASSIFICATION_0_1.json';
const MU1_EVIDENCE='CPC_RANK30_D1_A_MU1_COUPLED_TARGET_OBLIGATION_0_1.json';

const q9fEvidence=JSON.parse(readFileSync(resolve(import.meta.dirname,Q9F_EVIDENCE),'utf8'));
assert.equal(q9fEvidence.schema,'connect4.cpc_rank32_q9f_monotone_proof_library_classification.v1');
assert.equal(q9fEvidence.classification,'FORCED_BLOCK_ALL_REPLIES_POSITIVE');
const mu1Evidence=JSON.parse(readFileSync(resolve(import.meta.dirname,MU1_EVIDENCE),'utf8'));
assert.equal(mu1Evidence.schema,'connect4.cpc_rank30_d1_a_mu1_coupled_target_obligation.v1');

const exactPositiveQ=new Map();
exactPositiveQ.set(q9fEvidence.target.exactQClass,{kind:'EXACT_Q9F_HANDOFF',sourceEvidence:Q9F_EVIDENCE});
for(const x of mu1Evidence.cases.filter(x=>x.disposition==='COMPOSED_WIN')){
  exactPositiveQ.set(x.sourceQ,{kind:'EXACT_MU1_COMPOSED_HANDOFF',sourceEvidence:MU1_EVIDENCE});
}

function semLanding(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function semLegal(k,id){
  const out=[];
  for(let c=0;c<7;c++)if(semLanding(k,id,c)!==0xff)out.push(c);
  return out;
}
function semImmediateWinningColumns(k,id){
  if((semRank(k,id)&1)!==0)return [];
  const out=[];
  for(const c of semLegal(k,id))if(k.advance(id,c)===domain.QN_TERMINAL_WIN)out.push(c);
  return out;
}
function semIsImmediateWin(k,id){return semImmediateWinningColumns(k,id).length>0;}
function semIsOverloadLeaf(k,id){
  if((semRank(k,id)&1)!==1)return false;
  const cols=semLegal(k,id);
  if(!cols.length)return false;
  for(const c of cols){
    const child=k.advance(id,c);
    if(child===domain.QN_TERMINAL_WIN||child<0||!semIsImmediateWin(k,child))return false;
  }
  return true;
}
function boundedRankOne(k,id){
  if((semRank(k,id)&1)!==0)return null;
  for(const c of semLegal(k,id)){
    const child=k.advance(id,c);
    if(child>=0&&semIsOverloadLeaf(k,child))return {kind:'RANK1',rootMove:c+1};
  }
  return null;
}
function boundedRankThree(k,id){
  if((semRank(k,id)&1)!==0)return null;
  for(const rootColumn of semLegal(k,id)){
    const defender=k.advance(id,rootColumn);
    if(defender<0||semIsOverloadLeaf(k,defender))continue;
    const replies=semLegal(k,defender);
    if(!replies.length)continue;
    let valid=true;
    const consequences=[];
    for(const dc of replies){
      const attacker=k.advance(defender,dc);
      if(attacker===domain.QN_TERMINAL_WIN||attacker<0){valid=false;break;}
      const wins=semImmediateWinningColumns(k,attacker);
      if(wins.length){consequences.push({defenderColumn:dc+1,kind:'IMMEDIATE',winningColumns:wins.map(x=>x+1)});continue;}
      const r1=boundedRankOne(k,attacker);
      if(!r1){valid=false;break;}
      consequences.push({defenderColumn:dc+1,kind:'RANK1',rootMove:r1.rootMove});
    }
    if(valid)return {kind:'RANK3',rootMove:rootColumn+1,consequences};
  }
  return null;
}

function currentPositiveLibrary(k,semState,jsState,sequence){
  const routeAttempts=[],acceptedRoutes=[];
  const qc=qClass(k,semState);

  const immediate=semImmediateWinningColumns(k,semState);
  const immediateRoute={kind:'IMMEDIATE_P0_TERMINAL',accept:immediate.length>0,winningColumns:immediate.map(x=>x+1)};
  routeAttempts.push(immediateRoute);
  if(immediateRoute.accept)acceptedRoutes.push(immediateRoute);

  const handoff=exactPositiveQ.get(qc);
  const handoffRoute={kind:'EXACT_QUALIFIED_Q_HANDOFF',accept:!!handoff,exactQClass:qc,handoff:handoff??null};
  routeAttempts.push(handoffRoute);
  if(handoff)acceptedRoutes.push({kind:handoff.kind,exactQClass:qc,sourceEvidence:handoff.sourceEvidence});

  const r1=boundedRankOne(k,semState);
  const r3=r1?null:boundedRankThree(k,semState);
  routeAttempts.push({kind:'BOUNDED_RANK1',accept:!!r1,certificate:r1});
  if(r1)acceptedRoutes.push(r1);
  routeAttempts.push({kind:'BOUNDED_RANK3',accept:!!r3,certificate:r3});
  if(r3)acceptedRoutes.push(r3);

  const inspect=createRepairCapacityProofEngine(k,{collectAllWinningActions:true,maxProofStates:1});
  const invariantTargets=inspect.terms(semState,0).filter(t=>t.length===1).map(t=>t[0]).filter(t=>inspect.invariant(semState,t));
  const legacyRepairTargets=[];
  let resourceFailures=0;
  for(const target of invariantTargets){
    const p=legacyProof(sequence,target);
    legacyRepairTargets.push({targetCell:target,targetColumn:(target%7)+1,targetRow:Math.floor(target/7)+1,...p});
    const attempt={kind:'LEGACY_REPAIR_CAPACITY',targetCell:target,accept:p.proved,proofKind:p.kind??null,completed:p.completed};
    routeAttempts.push(attempt);
    if(p.proved)acceptedRoutes.push({kind:'LEGACY_REPAIR_CAPACITY',targetCell:target,proofKind:p.kind});
    if(!p.completed)resourceFailures++;
  }

  const generic=genericRoutes(jsState);
  for(const x of generic.attempts)routeAttempts.push({
    kind:x.kind,accept:x.accept??false,p0Column:x.p0Column??null,
    knownRoot:x.knownRoot??null,defenderColumn:x.defenderColumn??null,followupP0Column:x.followupP0Column??null,
    target:x.target??null,validation:x.validation??null
  });
  for(const x of generic.accepted)acceptedRoutes.push({
    kind:x.kind,p0Column:x.p0Column??null,knownRoot:x.knownRoot??null,
    defenderColumn:x.defenderColumn??null,followupP0Column:x.followupP0Column??null,target:x.target??null
  });

  const seen=new Set();
  const dedup=[];
  for(const x of acceptedRoutes){
    const key=JSON.stringify(x);
    if(seen.has(key))continue;
    seen.add(key);dedup.push(x);
  }
  return {routeAttempts,acceptedRoutes:dedup,legacyRepairTargets,resourceFailures};
}



const FORCED_LOSS_NODE_CAP=100000;
function compactLossProof(p,depth=0){
  if(!p)return null;
  if(depth>8)return {kind:'DEPTH_TRUNCATED'};
  return {
    loss:p.loss,kind:p.kind,obligation:p.obligation??null,obligations:p.obligations??null,
    forcedColumn:p.forcedColumn??null,adversarialReply:p.adversarialReply??null,
    replyCell:p.replyCell??null,escapeAction:p.escapeAction??null,escapeReason:p.escapeReason??null,
    child:p.child?compactLossProof(p.child,depth+1):null
  };
}
function forcedLossAudit(k,start){
  const e=createRepairCapacityProofEngine(k,{maxProofStates:1});
  const memo=new Map();
  const stats={nodes:0,maxDepth:0,multiDefects:0,forcedNodes:0,terminalWitnesses:0,childLossWitnesses:0,zeroObligationNodes:0};
  function key(state){return qClass(k,state);}
  function prove(state,depth=0){
    if(stats.nodes>=FORCED_LOSS_NODE_CAP)throw new Error('forced-obligation node cap exceeded '+FORCED_LOSS_NODE_CAP);
    assert.equal(semRank(k,state)&1,0,'forced-loss node must be P0 turn');
    const q=key(state);
    if(memo.has(q))return memo.get(q);
    stats.nodes++;stats.maxDepth=Math.max(stats.maxDepth,depth);

    const p0Terminals=e.terminalActions(state,0);
    if(p0Terminals.length){
      const out={loss:false,kind:'P0_TERMINAL_AVAILABLE',terminalActions:p0Terminals.map(x=>e.col(x.column))};
      memo.set(q,out);return out;
    }

    const obligations=[...new Set(e.enabledSingletons(state,1))];
    if(obligations.length===0){
      stats.zeroObligationNodes++;
      const out={loss:false,kind:'NO_ENABLED_P1_OBLIGATION'};
      memo.set(q,out);return out;
    }

    if(obligations.length>=2){
      const actions=[];
      for(const action of e.legal(state)){
        const actionCell=e.landing(state,action),afterP0=k.advance(state,action);
        if(afterP0===domain.QN_TERMINAL_WIN){
          const out={loss:false,kind:'MULTI_OBLIGATION_P0_TERMINAL_ESCAPE',obligations:obligations.map(e.coord),escapeAction:e.col(action),escapeReason:'P0_terminal'};
          memo.set(q,out);return out;
        }
        assert(afterP0>=0);
        const terminals=e.terminalActions(afterP0,1);
        actions.push({action:e.col(action),actionCell:e.coord(actionCell),p1TerminalCells:terminals.map(x=>e.coord(x.cell))});
        if(terminals.length===0){
          const out={loss:false,kind:'MULTI_OBLIGATION_ESCAPE',obligations:obligations.map(e.coord),escapeAction:e.col(action),escapeReason:'no_immediate_P1_terminal',actions};
          memo.set(q,out);return out;
        }
      }
      stats.multiDefects++;
      const out={loss:true,kind:'MULTI_OBLIGATION_CAPACITY_DEFECT',obligations:obligations.map(e.coord),actions};
      memo.set(q,out);return out;
    }

    stats.forcedNodes++;
    const threat=obligations[0],forcedColumn=threat%7;
    if(e.landing(state,forcedColumn)!==threat){
      const out={loss:false,kind:'SINGLETON_NOT_PLAYABLE_OBLIGATION',obligation:e.coord(threat)};
      memo.set(q,out);return out;
    }

    const nonblocking=[];
    for(const action of e.legal(state)){
      if(action===forcedColumn)continue;
      const afterP0=k.advance(state,action);
      if(afterP0===domain.QN_TERMINAL_WIN){
        const out={loss:false,kind:'SINGLE_OBLIGATION_P0_TERMINAL_ESCAPE',obligation:e.coord(threat),escapeAction:e.col(action),escapeReason:'P0_terminal'};
        memo.set(q,out);return out;
      }
      assert(afterP0>=0);
      const terminals=e.terminalActions(afterP0,1);
      nonblocking.push({action:e.col(action),p1TerminalCells:terminals.map(x=>e.coord(x.cell))});
      if(terminals.length===0){
        const out={loss:false,kind:'SINGLETON_NOT_FORCED',obligation:e.coord(threat),escapeAction:e.col(action),escapeReason:'nonblocking_action_without_P1_terminal',nonblocking};
        memo.set(q,out);return out;
      }
    }

    const afterBlock=k.advance(state,forcedColumn);
    if(afterBlock===domain.QN_TERMINAL_WIN){
      const out={loss:false,kind:'FORCED_BLOCK_IS_P0_TERMINAL',obligation:e.coord(threat),forcedColumn:e.col(forcedColumn),nonblocking};
      memo.set(q,out);return out;
    }
    assert(afterBlock>=0);

    const replyRows=[];
    for(const reply of e.legal(afterBlock)){
      const replyCell=e.landing(afterBlock,reply),child=k.advance(afterBlock,reply);
      if(child===domain.QN_TERMINAL_WIN){
        stats.terminalWitnesses++;
        const out={loss:true,kind:'FORCED_BLOCK_THEN_P1_TERMINAL',obligation:e.coord(threat),forcedColumn:e.col(forcedColumn),adversarialReply:e.col(reply),replyCell:e.coord(replyCell),nonblocking};
        memo.set(q,out);return out;
      }
      assert(child>=0);
      if(e.terminalActions(child,0).length){
        replyRows.push({reply:e.col(reply),result:'P0_terminal_available'});
        continue;
      }
      const sub=prove(child,depth+1);
      replyRows.push({reply:e.col(reply),result:sub.loss?'child_loss':'unknown',childKind:sub.kind});
      if(sub.loss){
        stats.childLossWitnesses++;
        const out={loss:true,kind:'FORCED_BLOCK_THEN_CHILD_LOSS',obligation:e.coord(threat),forcedColumn:e.col(forcedColumn),adversarialReply:e.col(reply),replyCell:e.coord(replyCell),child:sub,nonblocking,replyRows};
        memo.set(q,out);return out;
      }
    }
    const out={loss:false,kind:'FORCED_BLOCK_HAS_NO_CERTIFIED_LOSING_REPLY',obligation:e.coord(threat),forcedColumn:e.col(forcedColumn),nonblocking,replyRows};
    memo.set(q,out);return out;
  }

  try{
    const proof=prove(start,0);
    return {proofCompleted:true,loss:proof.loss===true,kind:proof.kind,compactProof:compactLossProof(proof),resourceFailure:null,stats};
  }catch(error){
    return {proofCompleted:false,loss:false,kind:'RESOURCE_FAILURE',compactProof:null,resourceFailure:{message:String(error?.message??error)},stats};
  }
}


const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_q5d34_three_safe_action_consequence_closure.v1');
assert.equal(source.sourceQ,TARGET_Q);
assert.equal(source.sequence,TARGET_SEQUENCE);
assert.equal(source.rank,34);
assert.deepEqual(source.support,[6,6,3,6,5,5,3]);
assert.deepEqual(source.safeP0Actions,[5,6,7]);
assert.equal(source.classification,'UNKNOWN');

const physicalReplyHistories=[];
for(const parent of source.children){
  assert([5,6,7].includes(parent.p0Action));
  assert.equal(parent.startRank,35);
  const step=parent.steps[0]; assert(step);
  assert.equal(step.mover,'P1');
  for(const reply of step.actionAudit.filter(x=>x.safe)){
    assert(reply.childQ);
    physicalReplyHistories.push({
      p0Action:parent.p0Action,
      p1Action:reply.column,
      sequence:parent.startSequence+String(reply.column),
      exactQClass:reply.childQ,
      support:reply.childSupport
    });
  }
}
physicalReplyHistories.sort((a,b)=>a.p0Action-b.p0Action||a.p1Action-b.p1Action);
assert.equal(physicalReplyHistories.length,10);

const grouped=new Map();
for(const h of physicalReplyHistories){
  if(!grouped.has(h.exactQClass))grouped.set(h.exactQClass,[]);
  grouped.get(h.exactQClass).push(h);
}
assert.equal(grouped.size,9);
const expectedMerge=grouped.get('e5d63da12420fdb3');
assert(expectedMerge&&expectedMerge.length===2);
assert.deepEqual(expectedMerge.map(x=>x.p0Action).sort((a,b)=>a-b),[5,6]);

const k=makeKernel();
const qClassifications=[];
let totalResourceFailures=0;
for(const [exactQClass,members] of [...grouped.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){
  const representative=members[0];
  const semState=semReplay(k,representative.sequence);
  const jsState=jsFromSequence(representative.sequence);
  const bridge=exactBridge(representative.sequence,jsState,k,semState);
  assert(bridge.pass);
  assert.equal(bridge.semanticQClass,exactQClass);
  assert.equal(semRank(k,semState),36);
  assert.equal(jsRank(jsState),36);
  assert.equal(jsMover(jsState),P0);
  for(const member of members){
    const sid=semReplay(k,member.sequence);
    assert.equal(qClass(k,sid),exactQClass);
    assert.equal(semKey(k,sid),semKey(k,semState));
  }

  const positive=currentPositiveLibrary(k,semState,jsState,representative.sequence);
  const lossCertificate=forcedLossAudit(k,semState);
  if(positive.acceptedRoutes.length&&lossCertificate.loss)throw new Error('positive/loss certificate collision at '+exactQClass);
  const disposition=positive.acceptedRoutes.length?'P0_WIN':lossCertificate.loss?'P0_LOSS':'UNKNOWN';
  const resourceFailureCount=positive.resourceFailures+(lossCertificate.resourceFailure?1:0);
  totalResourceFailures+=resourceFailureCount;

  qClassifications.push({
    exactQClass,
    rank:36,
    support:semSupport(k,semState),
    representativeSequence:representative.sequence,
    physicalHistoryCount:members.length,
    physicalHistories:members,
    exactBridge:bridge,
    routeAttempts:positive.routeAttempts,
    positiveCertificates:positive.acceptedRoutes,
    legacyRepairTargets:positive.legacyRepairTargets,
    lossCertificate,
    disposition,
    resourceFailureCount
  });
}

const qById=new Map(qClassifications.map(x=>[x.exactQClass,x]));
const rootActions=[];
for(const p0Action of [5,6,7]){
  const histories=physicalReplyHistories.filter(x=>x.p0Action===p0Action);
  const replyQClasses=[...new Set(histories.map(x=>x.exactQClass))].sort();
  const classes=replyQClasses.map(q=>qById.get(q));
  let classification;
  if(classes.every(x=>x.disposition==='P0_WIN'))classification='P0_ACTION_WIN_ALL_REPLIES';
  else if(classes.some(x=>x.disposition==='P0_LOSS'))classification='P0_ACTION_FAILS_LOSS_REPLY';
  else classification='P0_ACTION_UNKNOWN';
  rootActions.push({
    p0Action,
    physicalReplyCount:histories.length,
    replyQClasses,
    classification,
    replyDispositions:replyQClasses.map(q=>({exactQClass:q,disposition:qById.get(q).disposition}))
  });
}

let classification;
if(rootActions.some(x=>x.classification==='P0_ACTION_WIN_ALL_REPLIES'))classification='P0_WIN_EXISTS_ACTION';
else if(rootActions.every(x=>x.classification==='P0_ACTION_FAILS_LOSS_REPLY'))classification='P0_LOSS_ALL_ACTIONS';
else classification='UNKNOWN';

const exactQMergeGroups=[...grouped.entries()].map(([exactQClass,members])=>({
  exactQClass,memberCount:members.length,members
})).sort((a,b)=>b.memberCount-a.memberCount||a.exactQClass.localeCompare(b.exactQClass));

const dispositionCounts={P0_WIN:0,P0_LOSS:0,UNKNOWN:0};
for(const q of qClassifications)dispositionCounts[q.disposition]++;
const firstUnresolved=qClassifications.find(x=>x.disposition==='UNKNOWN')??null;

console.log(JSON.stringify({
  schema:'connect4.cpc_q5d34_rank36_monotone_consequence_composition.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  design:'CPC_Q5D34_RANK36_MONOTONE_CONSEQUENCE_COMPOSITION_DESIGN_0_1.md',
  sourceEvidence:SOURCE,
  sourceQ:TARGET_Q,
  sequence:TARGET_SEQUENCE,
  rank:34,
  support:[6,6,3,6,5,5,3],
  safeP0Actions:[5,6,7],
  physicalReplyHistories,
  physicalReplyHistoryCount:physicalReplyHistories.length,
  exactQMergeGroups,
  uniqueQClassCount:qClassifications.length,
  qClassifications,
  rootActions,
  classification,
  summary:{
    dispositionCounts,
    closedQClassCount:dispositionCounts.P0_WIN+dispositionCounts.P0_LOSS,
    unresolvedQClassCount:dispositionCounts.UNKNOWN,
    totalResourceFailures,
    firstUnresolvedQ:firstUnresolved?{
      exactQClass:firstUnresolved.exactQClass,
      sequence:firstUnresolved.representativeSequence,
      support:firstUnresolved.support,
      routeKindsTried:[...new Set(firstUnresolved.routeAttempts.map(x=>x.kind))].sort(),
      forcedLossKind:firstUnresolved.lossCertificate.kind
    }:null
  },
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  legacyRepairModified:false,
  rcicModified:false,
  forcedLossModified:false,
  bsfpModified:false,
  conclusion:[
    'The ten terminal-safe P1 reply histories under q5d34 E/F/G are reduced only by exact semantic-q equality to nine rank-36 consequence classes.',
    'Every unique rank-36 class is independently bridged into pinned JSMinSys RBA and queried against the complete current monotone positive library plus the unchanged forced-obligation loss calculus.',
    classification==='P0_WIN_EXISTS_ACTION'
      ? 'At least one q5d34 P0 action has every safe P1 reply constructively closed P0-winning.'
      : classification==='P0_LOSS_ALL_ACTIONS'
        ? 'Every terminal-safe q5d34 P0 action has at least one exact P0-losing reply; together with the already-qualified unsafe C action, q5d34 is P0-losing.'
        : 'No q5d34 action is yet universally constructively positive and at least one safe action retains an unknown rank-36 consequence; q5d34 remains unknown.',
    'The E/F commutation merge at q e5d63da12420fdb3 is reused exactly once after semantic-q equality, not inferred from support equality.'
  ],
  boundary:[
    'No solved W/D/L, oracle, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.',
    'Absence of a positive certificate remains UNKNOWN unless the unchanged forced-obligation calculus supplies an exact P0-loss certificate.',
    'Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.'
  ]
},null,2));
