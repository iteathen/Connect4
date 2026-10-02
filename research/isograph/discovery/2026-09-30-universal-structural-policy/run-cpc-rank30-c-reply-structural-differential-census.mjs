#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {classifyThreePlusOneDeferredSingletonTail} from './rlc-3plus1-deferred-singleton-tail-adapter.mjs';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE='CPC_RANK28_D1_PARENT_MONOTONE_NONWIN_AUDIT_0_1.json';
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

const {createSlot64ResidualQuotientKernel}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const {createRepairCapacityProofEngine}=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs')).href);

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P0=0,P1=1,P0_WIN=3,P1_WIN=1;
const CPC_NAMES=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);

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
function semRank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function semLanding(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function semLegal(k,id){const out=[];for(let c=0;c<7;c++)if(semLanding(k,id,c)!==0xff)out.push(c);return out;}
function semSupport(k,id){
  const out=[];for(let c=0;c<7;c++){const x=semLanding(k,id,c);out.push(x===0xff?6:Math.floor(x/7));}
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
  assert.equal(q.words[g.metaOffset]&3,0);assert(column>=0&&column<7&&q.words[column]<6);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,column,words,0,basis,0,seen,sizes,0);
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function coordHas(q,p,index){
  const base=p?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,p){const out=[];for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);return out;}
function minimalIds(q,p){
  const a=activeIds(q,p);
  return a.filter(id=>!a.some(o=>o!==id&&g.shapeSize[o]<g.shapeSize[id]&&connect4RbaShapeSubset(g,o,id)));
}
function shapeCells(id){const out=[],b=id*4;for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[b+i]);return out;}
function shapeHasCell(id,cell){
  const b=id*4;for(let i=0;i<g.shapeSize[id];i++)if(g.shapeCells[b+i]===cell)return true;return false;
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

function cpc(q){
  const out={};
  for(const [name,frontierResponse] of [['baseline',false],['frontier',true]]){
    const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
    out[name]={
      kind:CPC_NAMES.get(kind),
      forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
      preemptionCount:s.preemptionCount[0],
    };
  }
  return out;
}
function cellDesc(cell,q){
  const c=g.cellColumn[cell],r=g.cellRow[cell];
  return {
    cell,column:c+1,row:r+1,
    supportDepth:r-q.words[c],
    frontierAttached:q.words[c]===r,
    projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1,
    targetSupportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell),
  };
}
function residualDesc(q,id){
  return {
    diagnosticId:id,
    size:g.shapeSize[id],
    key:keyCells(shapeCells(id)),
    cells:shapeCells(id).map(cell=>cellDesc(cell,q)),
  };
}
function minimalResiduals(q,p){
  return minimalIds(q,p).map(id=>residualDesc(q,id)).sort((a,b)=>a.size-b.size||a.key.localeCompare(b.key));
}
function singletonTargetCells(k,state,p){
  return [...new Set(semResidualKeys(k,state,p).map(keyArray).filter(x=>x.length===1).map(x=>x[0]))].sort((a,b)=>a-b);
}
function playableSingletons(q,p){
  const out=[];
  for(const id of activeIds(q,p)){
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(q.words[c]===r)out.push(cellDesc(cell,q));
  }
  return out.sort((a,b)=>a.cell-b.cell);
}
function alignedP0Pairs(q){
  return minimalIds(q,P0)
    .filter(id=>g.shapeSize[id]===2)
    .map(id=>residualDesc(q,id))
    .filter(x=>x.cells.every(c=>c.projectedOwner===1));
}
function phasePath(q){
  const rem=Array.from({length:7},(_,c)=>6-q.words[c]);
  return {
    remainingCapacity:rem,
    capacityParity:rem.map(x=>x&1),
    widthDerivative:Array.from({length:6},(_,i)=>Math.abs(rem[i+1]-rem[i])),
  };
}
function frontierCells(q){
  const out=[];
  for(let c=0;c<7;c++)if(q.words[c]<6)out.push(cellDesc(q.words[c]*7+c,q));
  return out;
}

function buildPairMap(q,capacity,partner,length){
  const mate=new Int32Array(42);mate.fill(-1);
  const role=new Uint8Array(42);
  for(let c=0;c<7;c++){
    const h=q.words[c],p=partner[c],L=p>=0?length[c]:0,cap=capacity[c];
    if(p>=0&&c<p){
      const hp=q.words[p];
      for(let d=0;d<L;d++){
        const a=(h+d)*7+c,b=(hp+d)*7+p;
        if(mate[a]!==-1||mate[b]!==-1)throw new Error('pair overlap');
        mate[a]=b;mate[b]=a;role[a]=role[b]=3;
      }
    }
    for(let d=L;d<cap;d+=2){
      if(d+1>=cap)throw new Error('vertical tail must be even');
      const lo=(h+d)*7+c,hi=(h+d+1)*7+c;
      if(mate[lo]!==-1||mate[hi]!==-1)throw new Error('vertical overlap');
      mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;
    }
  }
  return {mate,role};
}
function coverageWitness(q,id,targetCell,partner,length){
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell],cells=shapeCells(id);
  for(const cell of cells){
    const c=g.cellColumn[cell],r=g.cellRow[cell];
    if(c===tc&&r>tr)return {kind:'post-target-deferral',...cellDesc(cell,q)};
  }
  for(const cell of cells){
    const c=g.cellColumn[cell],r=g.cellRow[cell],depth=r-q.words[c],p=partner[c],L=p>=0?length[c]:0;
    if(depth<0)continue;
    if(depth>=L+1&&((depth-(L+1))&1)===0)return {kind:'vertical-response',...cellDesc(cell,q),depth,L};
    if(p>=0&&depth<L){
      const mate=(q.words[p]+depth)*7+p;
      if(shapeHasCell(id,mate)){
        return {kind:'cross-pair',cells:[cell,mate],columns:[c+1,p+1],depth,L};
      }
    }
  }
  return null;
}
function pairingSummary(partner,length){
  const pairs=[];
  for(let c=0;c<7;c++)if(partner[c]>=0&&c<partner[c]){
    pairs.push({columns:[c+1,partner[c]+1],prefixLength:length[c]});
  }
  return pairs;
}
function validateTemplate(q,template){
  const mate=Int32Array.from(template.mate),role=Uint8Array.from(template.role);
  const failures=[];let defenderNodes=0,responsePairs=0,maxPairDepth=0,p0Terminals=0,targetTerminals=0;
  function walk(state,depth){
    defenderNodes++;maxPairDepth=Math.max(maxPairDepth,depth);
    const rank=state.words[g.metaOffset]>>>2;
    if((rank&1)!==P1){failures.push({kind:'wrong-mover',rank,support:jsSupport(state)});return;}
    let legalCount=0;
    for(let c=0;c<7;c++){
      if(state.words[c]>=6)continue;
      legalCount++;
      const row=state.words[c],cell=row*7+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){failures.push({kind:'unmapped-defender-trigger',column:c+1,row:row+1});continue;}
      const afterD=jsStep(state,c);
      if(afterD.terminal===P1_WIN){failures.push({kind:'defender-terminal-before-response',column:c+1,row:row+1});continue;}
      if(afterD.terminal){failures.push({kind:'unexpected-terminal-after-defender',terminal:afterD.terminal});continue;}
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(afterD.words[rc]!==rr){failures.push({kind:'paired-response-not-playable',response:{column:rc+1,row:rr+1}});continue;}
      const afterA=jsStep(afterD,rc);responsePairs++;
      if(afterA.terminal===P0_WIN){p0Terminals++;if(m===template.targetCell)targetTerminals++;continue;}
      if(afterA.terminal){failures.push({kind:'unexpected-terminal-after-response',terminal:afterA.terminal});continue;}
      walk(afterA,depth+1);
    }
    if(!legalCount)failures.push({kind:'no-legal-defender-move-before-p0-win'});
  }
  walk(q,0);
  return {
    pass:failures.length===0,defenderNodes,responsePairs,maxPairDepth,
    p0TerminalResponses:p0Terminals,targetTerminalResponses:targetTerminals,
    failures:failures.slice(0,20),
  };
}
function diagnoseTargetReservoir(q,targetCell){
  const base={target:cellDesc(targetCell,q)};
  const active=activeIds(q,P0).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===targetCell);
  if(!active)return {...base,stage:'TARGET_ABSENT'};
  if(connect4CpcTargetOwner32(g,q.words,0,targetCell)!==P0)return {...base,stage:'TARGET_WRONG_PROJECTED_OWNER'};
  const defenderPlayable=playableSingletons(q,P1);
  if(defenderPlayable.length)return {...base,stage:'PLAYABLE_DEFENDER_SINGLETON_EXISTS',defenderPlayable};
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell],targetDepth=tr-q.words[tc];
  if(targetDepth<=0)return {...base,stage:'TARGET_NOT_AHEAD_OF_SUPPORT',targetDepth};

  const capacity=new Uint32Array(7),odd=[];let total=0;
  for(let c=0;c<7;c++){
    const cap=c===tc?tr-q.words[c]+1:6-q.words[c];
    if(cap<0)return {...base,stage:'TARGET_NOT_AHEAD_OF_SUPPORT',targetDepth,negativeCapacityColumn:c+1};
    capacity[c]=cap;total+=cap;if(cap&1)odd.push(c);
  }
  const capacityArray=Array.from(capacity);
  if((total&1)||(odd.length&1)){
    return {...base,stage:'TRUNCATED_CAPACITY_PARITY_INVALID',targetDepth,capacity:capacityArray,totalRelevant:total,oddColumns:odd.map(x=>x+1)};
  }

  const defenderIds=activeIds(q,P1);
  const partner=new Int32Array(7);partner.fill(-1);
  const length=new Uint32Array(7);
  let completePairings=0,targetCompatible=0,coverageCompatible=0;
  const coverageFailures=[];
  const validationFailures=[];
  let accepted=null;

  function consider(){
    completePairings++;
    const L=partner[tc]>=0?length[tc]:0;
    if(!(targetDepth>=L+1&&((targetDepth-(L+1))&1)===0))return;
    targetCompatible++;
    const coverage=[];
    let uncovered=null;
    for(const id of defenderIds){
      const w=coverageWitness(q,id,targetCell,partner,length);
      if(!w){
        const d=residualDesc(q,id);
        if(!uncovered||d.size<uncovered.size||(d.size===uncovered.size&&d.key<uncovered.key))uncovered=d;
      }else coverage.push({residualId:id,size:g.shapeSize[id],witness:w});
    }
    if(uncovered){
      if(coverageFailures.length<24)coverageFailures.push({pairing:pairingSummary(partner,length),uncoveredResidual:uncovered});
      return;
    }
    coverageCompatible++;
    const map=buildPairMap(q,capacity,partner,length);
    const template={
      targetCell,targetDepth,targetPrefixLength:L,capacity:capacityArray,totalRelevant:total,
      oddColumns:odd.map(x=>x+1),synchronizedPairs:pairingSummary(partner,length),
      defenderResidualCount:defenderIds.length,coverage,mate:Array.from(map.mate),role:Array.from(map.role),
    };
    const validation=validateTemplate(q,template);
    if(validation.pass&&!accepted)accepted={template,validation};
    else if(!validation.pass&&validationFailures.length<12)validationFailures.push({pairing:template.synchronizedPairs,validation});
  }
  function rec(pending){
    if(accepted)return;
    if(!pending.length){consider();return;}
    const a=pending[0];
    for(let j=1;j<pending.length&&!accepted;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!accepted;L+=2){
        length[a]=length[b]=L;
        if((a===tc||b===tc)&&L>=capacity[tc])continue;
        rec(rest);
      }
      partner[a]=partner[b]=-1;length[a]=length[b]=0;
    }
  }
  rec(odd);

  const common={...base,targetDepth,capacity:capacityArray,totalRelevant:total,oddColumns:odd.map(x=>x+1),
    completePairings,targetCompatiblePairings:targetCompatible,coverageCompatiblePairings:coverageCompatible};
  if(accepted)return {...common,stage:'ACCEPTED',template:{
    capacity:accepted.template.capacity,oddColumns:accepted.template.oddColumns,
    synchronizedPairs:accepted.template.synchronizedPairs,coverage:accepted.template.coverage,
  },validation:accepted.validation};
  if(targetCompatible===0)return {...common,stage:'ODD_COLUMN_PAIRING_UNAVAILABLE'};
  if(coverageCompatible===0){
    let smallest=null;
    for(const x of coverageFailures){
      const d=x.uncoveredResidual;
      if(!smallest||d.size<smallest.size||(d.size===smallest.size&&d.key<smallest.key))smallest=d;
    }
    return {...common,stage:'DEFENDER_RESIDUAL_UNCOVERED',smallestUncoveredResidual:smallest,
      attemptedPairingPrefixes:coverageFailures};
  }
  return {...common,stage:'EXACT_VALIDATION_FAILED',validationFailures};
}

function descriptorFingerprint(s){
  const root=s.eventProduct;
  const actionProfile=s.actions.map(a=>({
    column:a.column,
    immediateP1Terminals:a.opponentImmediateTerminals.map(x=>x.cell).sort(),
    targets:a.singletonTargets.P0.map(x=>x.cell),
    stages:a.targetReservoirAttempts.map(x=>x.stage),
    cpc:a.cpc?.baseline?.kind??null,
    tail:a.tailAdapter.applies?a.tailAdapter.kind:a.tailAdapter.reason,
  }));
  return {
    mover:root.P.mover,
    cpcBaseline:root.P.cpc.baseline.kind,
    cpcFrontier:root.P.cpc.frontier.kind,
    forcedColumn:root.P.cpc.baseline.forcedColumn,
    preemptionCount:root.P.cpc.baseline.preemptionCount,
    remainingCapacity:root.E.remainingCapacity,
    capacityParity:root.E.capacityParity,
    widthDerivative:root.E.widthDerivative,
    p0ResidualKeys:root.R.P0.map(x=>x.key),
    p1ResidualKeys:root.R.P1.map(x=>x.key),
    p0SingletonTargets:root.C.singletonTargets.P0.map(x=>x.cell),
    p1SingletonTargets:root.C.singletonTargets.P1.map(x=>x.cell),
    enabledP0Singletons:root.C.enabledSingletons.P0,
    enabledP1Singletons:root.C.enabledSingletons.P1,
    alignedP0PairKeys:root.C.alignedP0Pairs.map(x=>x.key),
    actionProfile,
  };
}
function jsonEq(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function diffFields(a,b){
  const order=[
    'mover','cpcBaseline','cpcFrontier','forcedColumn','preemptionCount',
    'remainingCapacity','capacityParity','widthDerivative','p0ResidualKeys','p1ResidualKeys',
    'p0SingletonTargets','p1SingletonTargets','enabledP0Singletons','enabledP1Singletons',
    'alignedP0PairKeys','actionProfile',
  ];
  return order.filter(k=>!jsonEq(a[k],b[k])).map(k=>({field:k,positive:a[k],unresolved:b[k]}));
}
function allPermutations(n){
  const out=[],a=Array.from({length:n},(_,i)=>i);
  function rec(i){
    if(i===n){out.push([...a]);return;}
    for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];rec(i+1);[a[i],a[j]]=[a[j],a[i]];}
  }
  rec(0);return out;
}
const COLUMN_PERMS=allPermutations(7);
function permuteCell(cell,perm){return Math.floor(cell/7)*7+perm[cell%7];}
function permuteSupport(h,perm){
  const out=new Array(7);
  for(let c=0;c<7;c++)out[perm[c]]=h[c];
  return out;
}
function permuteResidualKeys(keys,perm){
  return normalize(keys.map(key=>keyCells(keyArray(key).map(cell=>permuteCell(cell,perm)))));
}
function findColumnIsomorphism(a,b){
  const a0=a.raw,b0=b.raw;
  for(const perm of COLUMN_PERMS){
    if(!jsonEq(permuteSupport(a0.support,perm),b0.support))continue;
    if(!jsonEq(permuteResidualKeys(a0.p0ResidualKeys,perm),b0.p0ResidualKeys))continue;
    if(!jsonEq(permuteResidualKeys(a0.p1ResidualKeys,perm),b0.p1ResidualKeys))continue;
    return perm.map(x=>x+1);
  }
  return null;
}

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank28_d1_parent_monotone_nonwin_audit.v1');
assert.equal(source.cAction.defenderReplies.length,5);
const expected=new Map([
  ['1e8601e86599ef24','UNKNOWN'],
  ['5b07a7c903c1f4bf','P0_WIN'],
  ['3ff97b02970a6bb5','UNKNOWN'],
  ['373c44db3354a385','UNKNOWN'],
  ['ed03539228914a31','UNKNOWN'],
]);

const k=makeKernel();
const e=createRepairCapacityProofEngine(k,{maxProofStates:1});
const states=[];
const consequenceMembers=new Map();
let resourceFailureCount=0;

for(const src of source.cAction.defenderReplies){
  assert.equal(expected.get(src.exactQClass),src.disposition);
  const sid=replay(k,src.sequence),jsq=jsFromSequence(src.sequence);
  const bridge=exactBridge(src.sequence,jsq,k,sid);
  assert(bridge.pass);assert.equal(bridge.semanticQClass,src.exactQClass);
  assert.equal(semRank(k,sid),30);
  const support=semSupport(k,sid);
  const phase=phasePath(jsq);
  const singletonTargets={
    P0:singletonTargetCells(k,sid,P0).map(cell=>cellDesc(cell,jsq)),
    P1:singletonTargetCells(k,sid,P1).map(cell=>cellDesc(cell,jsq)),
  };
  const enabledSingletons={
    P0:e.enabledSingletons(sid,P0).map(e.coord).sort(),
    P1:e.enabledSingletons(sid,P1).map(e.coord).sort(),
  };
  const rootCpc=cpc(jsq);
  const eventProduct={
    E:{support,remainingCapacity:phase.remainingCapacity,capacityParity:phase.capacityParity,
      widthDerivative:phase.widthDerivative,frontierCells:frontierCells(jsq)},
    P:{mover:'P0',rank:30,cpc:rootCpc},
    R:{P0:minimalResiduals(jsq,P0),P1:minimalResiduals(jsq,P1),
      normalizedAntichain:{P0:semResidualKeys(k,sid,P0),P1:semResidualKeys(k,sid,P1)}},
    C:{singletonTargets,enabledSingletons,alignedP0Pairs:alignedP0Pairs(jsq)},
    N:{sourceDisposition:src.disposition,sourceInterval:src.interval,
      sourcePositiveKinds:src.positiveCertificates.map(x=>x.kind)},
  };

  const actions=[];
  let acceptedReservoirCount=0;
  for(const column0 of semLegal(k,sid)){
    const landing=semLanding(k,sid,column0),semChild=k.advance(sid,column0),jsChild=jsStep(jsq,column0);
    const moverTerminal=semChild===domain.QN_TERMINAL_WIN;
    if(moverTerminal){
      actions.push({
        column:column0+1,landing:cellDesc(landing,jsq),moverTerminal:true,childQ:null,childSupport:null,
        opponentImmediateTerminals:[],cpc:null,enabledSingletons:{P0:[],P1:[]},
        singletonTargets:{P0:[],P1:[]},targetReservoirAttempts:[],
        tailAdapter:{applies:false,reason:'TERMINAL_CHILD'},exactQualifiedHandoffs:[],
      });
      continue;
    }
    assert(semChild>=0);assert.equal(jsChild.terminal,0);
    const seq=src.sequence+String(column0+1);
    const childQ=qClass(k,semChild);
    const childBridge=exactBridge(seq,jsChild,k,semChild);assert(childBridge.pass);
    if(!consequenceMembers.has(childQ))consequenceMembers.set(childQ,[]);
    consequenceMembers.get(childQ).push({sourceQ:src.exactQClass,column:column0+1,sequence:seq});
    const oppTerm=e.terminalActions(semChild,P1).map(x=>({column:x.column+1,cell:e.coord(x.cell)}));
    const childTargets={
      P0:singletonTargetCells(k,semChild,P0).map(cell=>cellDesc(cell,jsChild)),
      P1:singletonTargetCells(k,semChild,P1).map(cell=>cellDesc(cell,jsChild)),
    };
    const targetReservoirAttempts=childTargets.P0.map(t=>diagnoseTargetReservoir(jsChild,t.cell));
    acceptedReservoirCount+=targetReservoirAttempts.filter(x=>x.stage==='ACCEPTED').length;
    const tail=classifyThreePlusOneDeferredSingletonTail(k,semChild);
    const exactQualifiedHandoffs=[];
    actions.push({
      column:column0+1,landing:cellDesc(landing,jsq),moverTerminal:false,
      childQ,childSupport:semSupport(k,semChild),exactBridge:childBridge,
      opponentImmediateTerminals:oppTerm,cpc:cpc(jsChild),
      enabledSingletons:{
        P0:e.enabledSingletons(semChild,P0).map(e.coord).sort(),
        P1:e.enabledSingletons(semChild,P1).map(e.coord).sort(),
      },
      singletonTargets:childTargets,targetReservoirAttempts,
      tailAdapter:tail,exactQualifiedHandoffs,
    });
  }
  const reproducedQualifiedPositive=acceptedReservoirCount>0;
  if(src.disposition==='P0_WIN')assert(reproducedQualifiedPositive,'qualified positive route failed to reproduce');
  else assert(!reproducedQualifiedPositive,'unexpected new reservoir closure in frozen differential');

  const raw={
    support,
    p0ResidualKeys:semResidualKeys(k,sid,P0),
    p1ResidualKeys:semResidualKeys(k,sid,P1),
  };
  states.push({
    exactQClass:src.exactQClass,sequence:src.sequence,rank:30,support,
    sourceDefenderColumn:src.defenderColumn,sourceDisposition:src.disposition,sourceInterval:src.interval,
    exactBridge:bridge,eventProduct,actions,reproducedQualifiedPositive,
    raw,
  });
}

states.sort((a,b)=>a.sourceDefenderColumn-b.sourceDefenderColumn);
const positive=states.find(x=>x.exactQClass==='5b07a7c903c1f4bf');assert(positive);
const unresolved=states.filter(x=>x.sourceDisposition==='UNKNOWN');assert.equal(unresolved.length,4);
const fingerprints=new Map(states.map(x=>[x.exactQClass,descriptorFingerprint(x)]));
const fieldNames=Object.keys(fingerprints.get(states[0].exactQClass));

const identicalAcrossAll=fieldNames.filter(field=>{
  const v=fingerprints.get(states[0].exactQClass)[field];
  return states.slice(1).every(s=>jsonEq(v,fingerprints.get(s.exactQClass)[field]));
});
const unresolvedSharedDifferentFromPositive=fieldNames.filter(field=>{
  const uv=fingerprints.get(unresolved[0].exactQClass)[field];
  return unresolved.slice(1).every(s=>jsonEq(uv,fingerprints.get(s.exactQClass)[field])) &&
    !jsonEq(uv,fingerprints.get(positive.exactQClass)[field]);
}).map(field=>({
  field,
  unresolvedValue:fingerprints.get(unresolved[0].exactQClass)[field],
  positiveValue:fingerprints.get(positive.exactQClass)[field],
}));
const unresolvedSplits=fieldNames.filter(field=>{
  const vals=new Set(unresolved.map(s=>JSON.stringify(fingerprints.get(s.exactQClass)[field])));
  return vals.size>1;
}).map(field=>({
  field,
  groups:[...new Map(unresolved.map(s=>[
    JSON.stringify(fingerprints.get(s.exactQClass)[field]),
    {value:fingerprints.get(s.exactQClass)[field],qClasses:[]}
  ])).values()].map(group=>{
    group.qClasses=unresolved.filter(s=>jsonEq(group.value,fingerprints.get(s.exactQClass)[field])).map(s=>s.exactQClass);
    return group;
  }),
}));

const q1e=states.find(x=>x.exactQClass==='1e8601e86599ef24');assert(q1e);
const q5bVsQ1eDiff=diffFields(fingerprints.get(positive.exactQClass),fingerprints.get(q1e.exactQClass));

const onePlyExactQConvergences=[...consequenceMembers.entries()]
  .filter(([,members])=>members.length>1)
  .map(([exactQClass,members])=>({exactQClass,memberCount:members.length,members}))
  .sort((a,b)=>b.memberCount-a.memberCount||a.exactQClass.localeCompare(b.exactQClass));

const columnPermutationIsomorphisms=[];
for(let i=0;i<states.length;i++)for(let j=i+1;j<states.length;j++){
  const perm=findColumnIsomorphism(states[i],states[j]);
  if(perm)columnPermutationIsomorphisms.push({a:states[i].exactQClass,b:states[j].exactQClass,columnMap:perm});
}

console.log(JSON.stringify({
  schema:'connect4.cpc_rank30_c_reply_structural_differential_census.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  design:'CPC_RANK30_C_REPLY_STRUCTURAL_DIFFERENTIAL_CENSUS_DESIGN_0_1.md',
  sourceEvidence:SOURCE,
  states:states.map(({raw,...x})=>x),
  differential:{
    identicalAcrossAll,
    unresolvedSharedDifferentFromPositive,
    unresolvedSplits,
    q5bVsQ1e:{
      positiveQ:positive.exactQClass,
      unresolvedQ:q1e.exactQClass,
      differences:q5bVsQ1eDiff,
      firstDifference:q5bVsQ1eDiff[0]??null,
    },
    onePlyExactQConvergences,
    columnPermutationIsomorphisms,
  },
  summary:{
    stateCount:states.length,
    positiveControlCount:states.filter(x=>x.reproducedQualifiedPositive).length,
    unresolvedStateCount:unresolved.length,
    onePlyConvergenceCount:onePlyExactQConvergences.length,
    columnPermutationIsomorphismCount:columnPermutationIsomorphisms.length,
    resourceFailureCount,
  },
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  conclusion:[
    'All five rank-30 sibling states are reconstructed by exact semantic q before structural comparison.',
    'The already-qualified q5b07 direct target-reservoir certificate is reproduced independently from the frozen theorem logic.',
    'Every unresolved target-reservoir rejection is localized to an exact guard, pairing, coverage, or validation stage rather than reported as a generic route failure.',
    'Differential fields are descriptive discovery evidence only; no new theorem is promoted by this census.',
  ],
  boundary:[
    'No post-result feature is added to this frozen experiment.',
    'No oracle, solved W/D/L, minimax, unrestricted game-tree value, opening book, best-move table, BSFP solved frontier or support-only state identity is used.',
    'Production CPC, JSMinSys and BSFP are unchanged.',
  ],
},null,2));
