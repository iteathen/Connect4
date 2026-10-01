#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE='CPC_RANK20_RANK32_FORCED_OBLIGATION_LOSS_CENSUS_0_1.json';
const TARGET_Q='9f6b7a33ab7e9552';
const TARGET_SEQUENCE='44444156666623222242551151531133';
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

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank20_rank32_forced_obligation_loss_census.v1');
const frozen=source.rank32Classes.find(x=>x.exactQClass===TARGET_Q);
assert(frozen);assert.equal(frozen.rank,32);assert.deepEqual(frozen.support,[6,6,4,6,5,5,0]);
assert.equal(frozen.proofKind,'FORCED_BLOCK_HAS_NO_CERTIFIED_LOSING_REPLY');
assert.deepEqual(frozen.rootObligations,['C5']);

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

const k=makeKernel(),sid=semReplay(k,TARGET_SEQUENCE),jsq=jsFromSequence(TARGET_SEQUENCE);
const bridge=exactBridge(TARGET_SEQUENCE,jsq,k,sid);assert(bridge.pass);assert.equal(bridge.semanticQClass,TARGET_Q);assert.equal(jsRank(jsq),32);assert.deepEqual(jsSupport(jsq),frozen.support);
const engine=createRepairCapacityProofEngine(k,{maxProofStates:1});
const obligations=[...new Set(engine.enabledSingletons(sid,1))];assert.equal(obligations.length,1);
const obligation=obligations[0],forcedColumn=obligation%7;assert.equal(forcedColumn,2);assert.equal(engine.landing(sid,forcedColumn),obligation);
const afterBlockSem=k.advance(sid,forcedColumn);assert(afterBlockSem>=0&&afterBlockSem!==domain.QN_TERMINAL_WIN);
const afterBlockJs=jsStep(jsq,forcedColumn);assert.equal(afterBlockJs.terminal,0);
const blockSequence=TARGET_SEQUENCE+String(forcedColumn+1);

let resourceFailureCount=0;
const replies=[];
for(let reply=0;reply<7;reply++){
  if(afterBlockJs.words[reply]>=6)continue;
  const childJs=jsStep(afterBlockJs,reply),replySequence=blockSequence+String(reply+1),routeAttempts=[],acceptedRoutes=[];
  if(childJs.terminal===P1_WIN){
    replies.push({replyColumn:reply+1,replySequence,terminalFor:'P1',rank:34,exactBridge:{pass:true},routeAttempts:[{kind:'P1_TERMINAL',accept:false}],acceptedRoutes:[],legacyRepairTargets:[],closed:false});
    continue;
  }
  assert.equal(childJs.terminal,0);
  const childSem=k.advance(afterBlockSem,reply);assert(childSem>=0&&childSem!==domain.QN_TERMINAL_WIN);
  const childBridge=exactBridge(replySequence,childJs,k,childSem);assert(childBridge.pass);assert.equal(jsRank(childJs),34);

  const inspect=createRepairCapacityProofEngine(k,{collectAllWinningActions:true,maxProofStates:1});
  const immediate=inspect.terminalActions(childSem,0).map(x=>x.column+1);
  if(immediate.length){const x={kind:'IMMEDIATE_P0_TERMINAL',columns:immediate,accept:true};routeAttempts.push(x);acceptedRoutes.push(x);}
  const legacyRepairTargets=[];
  for(const target of inspect.terms(childSem,0).filter(t=>t.length===1).map(t=>t[0]).filter(t=>inspect.invariant(childSem,t))){
    const p=legacyProof(replySequence,target);legacyRepairTargets.push({targetCell:target,targetColumn:(target%7)+1,targetRow:Math.floor(target/7)+1,...p});
    routeAttempts.push({kind:'LEGACY_REPAIR_CAPACITY',targetCell:target,accept:p.proved,proofKind:p.kind??null});
    if(p.proved)acceptedRoutes.push({kind:'LEGACY_REPAIR_CAPACITY',targetCell:target,proofKind:p.kind});
    if(!p.completed)resourceFailureCount++;
  }
  const generic=genericRoutes(childJs);
  routeAttempts.push(...generic.attempts.map(x=>({kind:x.kind,accept:x.accept??false,p0Column:x.p0Column??null,target:x.target??null,validation:x.validation??null})));
  acceptedRoutes.push(...generic.accepted.map(x=>({kind:x.kind,p0Column:x.p0Column??null,target:x.target??null})));

  replies.push({
    replyColumn:reply+1,replySequence,terminalFor:null,rank:34,support:jsSupport(childJs),
    exactQClass:childBridge.semanticQClass,exactBridge:childBridge,
    activeP0SingletonTargets:inspect.terms(childSem,0).filter(t=>t.length===1).map(t=>t[0]),
    enabledP1Singletons:inspect.enabledSingletons(childSem,1).map(inspect.coord),
    immediateP0WinningColumns:immediate,legacyRepairTargets,routeAttempts,acceptedRoutes,
    closed:acceptedRoutes.length>0
  });
}
const closed=replies.filter(x=>x.closed),unclosed=replies.filter(x=>!x.closed);
const acceptedRouteKinds=[...new Set(closed.flatMap(x=>x.acceptedRoutes.map(r=>r.kind)))].sort();
const classification=unclosed.length===0?'FORCED_BLOCK_ALL_REPLIES_POSITIVE':'INCOMPLETE_POSITIVE_LIBRARY';
const smallestUnclosedChild=unclosed.length?{
  replyColumn:unclosed[0].replyColumn,replySequence:unclosed[0].replySequence,exactQClass:unclosed[0].exactQClass??null,
  support:unclosed[0].support??null,enabledP1Singletons:unclosed[0].enabledP1Singletons??null,
  activeP0SingletonTargets:unclosed[0].activeP0SingletonTargets??null,
  routeKindsTried:[...new Set(unclosed[0].routeAttempts.map(x=>x.kind))].sort()
}:null;

console.log(JSON.stringify({
  schema:'connect4.cpc_rank32_q9f_monotone_proof_library_classification.v1',
  date:'2026-10-01',jsMinSysSha:EXPECTED,
  oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,jsMinSysModified:false,repairCapacityModified:false,rcicModified:false,bsfpModified:false,
  design:'CPC_RANK32_Q9F_MONOTONE_PROOF_LIBRARY_CLASSIFICATION_DESIGN_0_1.md',
  sourceEvidence:SOURCE,
  target:{
    exactQClass:TARGET_Q,sequence:TARGET_SEQUENCE,rank:jsRank(jsq),support:jsSupport(jsq),exactBridge:bridge,
    enabledP1Singletons:obligations.map(engine.coord),forcedBlockColumn:forcedColumn+1
  },
  forcedBlock:{column:forcedColumn+1,sequence:blockSequence,terminal:false,support:jsSupport(afterBlockJs)},
  replies,classification,smallestUnclosedChild,
  summary:{
    replyCount:replies.length,closedReplyCount:closed.length,unclosedReplyCount:unclosed.length,
    acceptedRouteKinds,resourceFailureCount
  },
  conclusion:[
    'q9f is reconstructed by exact semantic identity and its frozen forced c3 block is recomputed rather than assumed.',
    'Every rank-34 adversarial child is queried against immediate terminal, legacy repair-capacity, and current generic RCIC positive routes before being called unresolved.',
    classification==='FORCED_BLOCK_ALL_REPLIES_POSITIVE'
      ? 'Every legal P1 reply after the forced block has an existing exact P0 certificate; q9f is therefore constructively P0-winning by monotone proof-library composition.'
      : 'At least one legal P1 reply remains outside every queried qualified positive route; the smallest such exact child is preserved as the next obstruction.',
    'No certificate family is modified by this classification probe.'
  ],
  boundary:[
    'No solved W/D/L, oracle, Pons score, minimax, unrestricted free-branch game-tree search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, repair-capacity semantics, RCIC semantics, target-reservoir semantics, and BSFP remain unchanged.',
    'An unclosed child is unknown, not a loss; a closed child is accepted only through an already-qualified exact route.'
  ]
},null,2));
