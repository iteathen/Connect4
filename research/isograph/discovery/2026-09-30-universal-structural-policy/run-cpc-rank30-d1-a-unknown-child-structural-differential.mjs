#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE='CPC_RANK30_D1_A_BIDIRECTIONAL_PROOF_LIBRARY_CLOSURE_0_1.json';
const LEAF='SECOND_D1_C5_CONTRACTION:A->A';
const LEAF_Q='d21a89605c399aca';
const LEAF_SEQUENCE='444441566666232222425511515311';
const ROOT_MOVE=2;
const Q9F='9f6b7a33ab7e9552';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const PROOF_CAP=100000;
const root=resolve(import.meta.dirname,'../../../..');

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank30_d1_a_bidirectional_proof_library_closure.v1');
assert.equal(source.sourceLeafId,LEAF);assert.equal(source.sourceExactQClass,LEAF_Q);
assert.deepEqual(source.children.map(x=>x.defenderColumn),[3,5,6,7]);
assert.equal(source.children.find(x=>x.defenderColumn===3).disposition,'P0_WIN');
for(const c of [5,6,7])assert.equal(source.children.find(x=>x.defenderColumn===c).disposition,'UNKNOWN');

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
function semRank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function landing(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function legal(k,id){const out=[];for(let c=0;c<7;c++)if(landing(k,id,c)!==0xff)out.push(c);return out;}
function support(k,id){const out=[];for(let c=0;c<7;c++){const x=landing(k,id,c);out.push(x===0xff?6:Math.floor(x/7));}return out;}
function hasBit(term,cell){return cell<32?(((term[0]>>>cell)&1)!==0):(((term[1]>>>(cell-32))&1)!==0);}
function termCells(term){const out=[];for(let i=0;i<42;i++)if(hasBit(term,i))out.push(i);return out;}
function keyCells(cells){return [...cells].sort((a,b)=>a-b).join(',');}
function keyArray(key){return key===''?[]:key.split(',').map(Number);}
function strictSubset(a,b){const aa=keyArray(a),bb=new Set(keyArray(b));return aa.length<bb.size&&aa.every(x=>bb.has(x));}
function normalize(keys){const u=[...new Set(keys)];return u.filter(k=>!u.some(o=>o!==k&&strictSubset(o,k))).sort();}
function semResidualKeys(k,id,p){const cid=p===0?k.states.p0At(id):k.states.p1At(id);return normalize(k.classes.terms(cid).map(termCells).map(keyCells));}
function exactKey(k,id){return 'r'+semRank(k,id)+'|h'+support(k,id).join(',')+'|p0:'+semResidualKeys(k,id,0).join(';')+'|p1:'+semResidualKeys(k,id,1).join(';');}
function qClass(k,id){return createHash('sha256').update(exactKey(k,id)).digest('hex').slice(0,16);}

function immediateWinningColumns(k,id){
  if((semRank(k,id)&1)!==0)return [];
  const out=[];for(const c of legal(k,id))if(k.advance(id,c)===domain.QN_TERMINAL_WIN)out.push(c);return out;
}
function isImmediateWin(k,id){return immediateWinningColumns(k,id).length>0;}
function isOverloadLeaf(k,id){
  if((semRank(k,id)&1)!==1)return false;
  const cols=legal(k,id);if(!cols.length)return false;
  for(const c of cols){const child=k.advance(id,c);if(child===domain.QN_TERMINAL_WIN||child<0||!isImmediateWin(k,child))return false;}
  return true;
}
function rankOne(k,id){
  if((semRank(k,id)&1)!==0)return null;
  for(const c of legal(k,id)){const child=k.advance(id,c);if(child>=0&&isOverloadLeaf(k,child))return {kind:'RANK1',rootMove:c+1};}
  return null;
}
function rankThree(k,id){
  if((semRank(k,id)&1)!==0)return null;
  for(const rootColumn of legal(k,id)){
    const defender=k.advance(id,rootColumn);if(defender<0||isOverloadLeaf(k,defender))continue;
    const replies=legal(k,defender);if(!replies.length)continue;
    let valid=true;const rows=[];
    for(const dc of replies){
      const attacker=k.advance(defender,dc);if(attacker===domain.QN_TERMINAL_WIN||attacker<0){valid=false;break;}
      const wins=immediateWinningColumns(k,attacker);
      if(wins.length){rows.push({defenderColumn:dc+1,kind:'IMMEDIATE'});continue;}
      const r1=rankOne(k,attacker);if(!r1){valid=false;break;}rows.push({defenderColumn:dc+1,kind:'RANK1',rootMove:r1.rootMove});
    }
    if(valid)return {kind:'RANK3',rootMove:rootColumn+1,consequences:rows};
  }
  return null;
}

function jsFromSequence(sequence){
  const x=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function jsRank(q){return q.words[g.metaOffset]>>>2;}
function jsMover(q){return jsRank(q)&1;}
function jsSupport(q){return Array.from(q.words.slice(0,g.columns));}
function jsStep(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);assert(q.words[column]<6);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,column,words,0,basis,0,seen,sizes,0);
  assert(terminal>=0);return {words,basis,n:sizes[0],terminal};
}
function coordHas(q,p,index){const base=p?g.p1Offset:g.p0Offset;return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function activeIds(q,p){const out=[];for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);return out;}
function minimalIds(q,p){const a=activeIds(q,p);return a.filter(id=>!a.some(o=>o!==id&&g.shapeSize[o]<g.shapeSize[id]&&connect4RbaShapeSubset(g,o,id)));}
function shapeCells(id){const out=[],b=id*4;for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[b+i]);return out;}
function jsResidualKeys(q,p){return normalize(activeIds(q,p).map(id=>keyCells(shapeCells(id))));}
function exactBridge(sequence,jsq,k,sid){
  const checks={
    rank:jsRank(jsq)===semRank(k,sid)&&jsRank(jsq)===sequence.length,
    mover:jsMover(jsq)===(semRank(k,sid)&1),
    support:JSON.stringify(jsSupport(jsq))===JSON.stringify(support(k,sid)),
    p0Residuals:JSON.stringify(jsResidualKeys(jsq,P0))===JSON.stringify(semResidualKeys(k,sid,P0)),
    p1Residuals:JSON.stringify(jsResidualKeys(jsq,P1))===JSON.stringify(semResidualKeys(k,sid,P1)),
  };
  return {pass:Object.values(checks).every(Boolean),checks,semanticQClass:qClass(k,sid)};
}

function cellDesc(cell,q){
  const c=g.cellColumn[cell],r=g.cellRow[cell];
  return {cell,column:c+1,row:r+1,supportDepth:r-q.words[c],frontierAttached:q.words[c]===r,
    projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1,
    targetSupportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell)};
}
function residualDetails(q,p){
  return minimalIds(q,p).map(id=>({key:keyCells(shapeCells(id)),owner:p,size:g.shapeSize[id],cells:shapeCells(id).map(c=>cellDesc(c,q))})).sort((a,b)=>a.size-b.size||a.key.localeCompare(b.key));
}
function enabledSingletonsJs(q,p){
  return activeIds(q,p).filter(id=>g.shapeSize[id]===1).map(id=>g.shapeCells[id*4]).filter(cell=>q.words[g.cellColumn[cell]]===g.cellRow[cell]).map(cell=>cellDesc(cell,q));
}
function singletonTargetsJs(q,p){
  return activeIds(q,p).filter(id=>g.shapeSize[id]===1).map(id=>g.shapeCells[id*4]).map(cell=>cellDesc(cell,q));
}
function cpc(q){
  const names=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]),out={};
  for(const [name,frontierResponse] of [['baseline',false],['frontier',true]]){
    const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
    out[name]={kind:names.get(kind),forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,preemptionCount:s.preemptionCount[0]};
  }
  return out;
}
function phasePath(supportVector){
  const capacity=supportVector.map(h=>6-h),parity=capacity.map(x=>x&1),derivative=[];
  for(let i=0;i<6;i++)derivative.push(parity[i]^parity[i+1]);
  return {remainingCapacity:capacity,capacityParity:parity,widthDerivative:derivative,topDefectCharge:parity.reduce((a,b)=>a^b,0)};
}

function hasActiveSingleton(q,p,cell){return activeIds(q,p).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);}
function coverageWitness(q,id,targetCell,partner,length){
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell],cells=shapeCells(id);
  for(const cell of cells){const c=g.cellColumn[cell],r=g.cellRow[cell];if(c===tc&&r>tr)return true;}
  for(const cell of cells){
    const c=g.cellColumn[cell],r=g.cellRow[cell],depth=r-q.words[c],p=partner[c],L=p>=0?length[c]:0;if(depth<0)continue;
    if(depth>=L+1&&((depth-(L+1))&1)===0)return true;
    if(p>=0&&depth<L){const mate=(q.words[p]+depth)*7+p;if(shapeCells(id).includes(mate))return true;}
  }
  return false;
}
function buildPairMap(q,capacity,partner,length){
  const mate=new Int32Array(42);mate.fill(-1);const role=new Uint8Array(42);
  for(let c=0;c<7;c++){
    const h=q.words[c],p=partner[c],L=p>=0?length[c]:0,cap=capacity[c];
    if(p>=0&&c<p){const hp=q.words[p];for(let d=0;d<L;d++){const a=(h+d)*7+c,b=(hp+d)*7+p;mate[a]=b;mate[b]=a;role[a]=role[b]=3;}}
    for(let d=L;d<cap;d+=2){if(d+1>=cap)return null;const lo=(h+d)*7+c,hi=(h+d+1)*7+c;mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;}
  }return {mate,role};
}
function validateTemplate(q,targetCell,t){
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
function directReservoirRoute(q,targetCell){
  if(!hasActiveSingleton(q,P0,targetCell)||connect4CpcTargetOwner32(g,q.words,0,targetCell)!==P0||enabledSingletonsJs(q,P1).length)return null;
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell],targetDepth=tr-q.words[tc];if(targetDepth<=0)return null;
  const capacity=new Uint32Array(7),odd=[];let total=0;
  for(let c=0;c<7;c++){const cap=c===tc?tr-q.words[c]+1:6-q.words[c];if(cap<0)return null;capacity[c]=cap;total+=cap;if(cap&1)odd.push(c);}
  if((total&1)||(odd.length&1))return null;
  const defenderIds=activeIds(q,P1),partner=new Int32Array(7);partner.fill(-1);const length=new Uint32Array(7);let found=null;
  function evalT(){
    const L=partner[tc]>=0?length[tc]:0;if(!(targetDepth>=L+1&&((targetDepth-(L+1))&1)===0))return null;
    for(const id of defenderIds)if(!coverageWitness(q,id,targetCell,partner,length))return null;
    const map=buildPairMap(q,capacity,partner,length);if(!map)return null;
    return {mate:Array.from(map.mate),role:Array.from(map.role)};
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
  const validation=validateTemplate(q,targetCell,found);return validation.pass?{kind:'DIRECT_TARGET_RESERVOIR_RCIC',target:cellDesc(targetCell,q),validation}:null;
}

function repairTargetAudit(sequence,target){
  const k=makeKernel(),state=replay(k,sequence),engine=createRepairCapacityProofEngine(k,{collectAllWinningActions:true,maxProofStates:PROOF_CAP});
  const result=engine.prove(state,target);
  const rejected=(result.rejected??[]);
  const failures=[];
  for(const rej of rejected){
    const action=rej.action.charCodeAt(0)-65,reply=rej.reply.charCodeAt(0)-65;
    const afterP0=k.advance(state,action);assert(afterP0>=0&&afterP0!==domain.QN_TERMINAL_WIN);
    const replyCell=engine.landing(afterP0,reply),afterP1=k.advance(afterP0,reply);
    if(afterP1===domain.QN_TERMINAL_WIN){
      failures.push({action:rej.action,reply:rej.reply,reason:rej.reason,terminalFor:'P1',replyCell:engine.coord(replyCell)});
      continue;
    }
    assert(afterP1>=0);
    failures.push({
      action:rej.action,reply:rej.reply,reason:rej.reason,replyCell:engine.coord(replyCell),
      childQ:qClass(k,afterP1),support:support(k,afterP1),
      targetLive:engine.singleton(afterP1,0,target),targetSupportDistance:engine.targetDistance(afterP1,target),
      enabledP1Singletons:engine.enabledSingletons(afterP1,1).map(engine.coord),
      immediateP0WinningColumns:engine.terminalActions(afterP1,0).map(x=>x.column+1)
    });
  }
  return {target:engine.coord(target),proved:result.proved,kind:result.kind,mu:result.mu,witness:result.witness??null,
    winningActions:(result.winningActions??[]).map(x=>({column:x.column,kind:x.kind})),rejected,firstFailureWitnesses:failures,stats:engine.stats()};
}

function typedFields(row){
  const m={};
  row.support.forEach((v,i)=>m['support.c'+(i+1)]=v);
  row.phasePath.remainingCapacity.forEach((v,i)=>m['capacity.c'+(i+1)]=v);
  row.phasePath.capacityParity.forEach((v,i)=>m['capacityParity.c'+(i+1)]=v);
  row.phasePath.widthDerivative.forEach((v,i)=>m['widthDerivative.e'+(i+1)]=v);
  m.topDefectCharge=row.phasePath.topDefectCharge;
  m.p0ResidualCount=row.p0Residuals.length;m.p1ResidualCount=row.p1Residuals.length;
  m.p0MinimalCount=row.p0MinimalResiduals.length;m.p1MinimalCount=row.p1MinimalResiduals.length;
  m.p0EnabledSingletonCount=row.enabledSingletons.P0.length;m.p1EnabledSingletonCount=row.enabledSingletons.P1.length;
  m.repairInvariantTargetCount=row.repairTargets.length;
  m.boundedGrammar=row.boundedGrammar?.kind??null;
  for(const side of ['baseline','frontier']){
    m['cpc.'+side+'.kind']=row.cpc[side].kind;
    m['cpc.'+side+'.forcedColumn']=row.cpc[side].forcedColumn;
    m['cpc.'+side+'.preemptionCount']=row.cpc[side].preemptionCount;
  }
  return m;
}
function differenceFields(a,b){
  const A=typedFields(a),B=typedFields(b),keys=[...new Set([...Object.keys(A),...Object.keys(B)])].sort();
  return keys.filter(k=>JSON.stringify(A[k])!==JSON.stringify(B[k])).map(k=>({field:k,closed:A[k],other:B[k]}));
}
function sharedFields(group){
  const maps=group.map(typedFields),keys=Object.keys(maps[0]).sort(),out=[];
  for(const k of keys)if(maps.every(m=>JSON.stringify(m[k])===JSON.stringify(maps[0][k])))out.push({field:k,value:maps[0][k]});
  return out;
}
function residualDiff(a,b,p){
  const A=new Set(p===0?a.p0Residuals:a.p1Residuals),B=new Set(p===0?b.p0Residuals:b.p1Residuals);
  return {added:[...B].filter(x=>!A.has(x)).sort(),removed:[...A].filter(x=>!B.has(x)).sort()};
}
function stripLocal(key){
  const cells=keyArray(key).filter(cell=>!([4,5,6].includes(cell%7)));
  return keyCells(cells);
}
function nonlocalProjection(row,p){return normalize((p===0?row.p0Residuals:row.p1Residuals).map(stripLocal));}
const perms=[[4,5,6],[4,6,5],[5,4,6],[5,6,4],[6,4,5],[6,5,4]];
function permuteCell(cell,perm){const row=Math.floor(cell/7),c=cell%7;if(c<4)return cell;return row*7+perm[c-4];}
function permuteKey(key,perm){return keyCells(keyArray(key).map(c=>permuteCell(c,perm)));}
function localPermutationMatch(a,b){
  const matches=[];
  for(const perm of perms){
    const hs=[...a.support];const local=[a.support[4],a.support[5],a.support[6]];
    hs[perm[0]]=local[0];hs[perm[1]]=local[1];hs[perm[2]]=local[2];
    if(JSON.stringify(hs)!==JSON.stringify(b.support))continue;
    const p0=normalize(a.p0Residuals.map(k=>permuteKey(k,perm))),p1=normalize(a.p1Residuals.map(k=>permuteKey(k,perm)));
    if(JSON.stringify(p0)===JSON.stringify(b.p0Residuals)&&JSON.stringify(p1)===JSON.stringify(b.p1Residuals))matches.push(perm.map(x=>x+1));
  }
  return matches;
}

const kernel=makeKernel(),leaf=replay(kernel,LEAF_SEQUENCE);
assert.equal(qClass(kernel,leaf),LEAF_Q);
const afterRoot=kernel.advance(leaf,ROOT_MOVE);assert(afterRoot>=0&&afterRoot!==domain.QN_TERMINAL_WIN);
const rootJs=jsStep(jsFromSequence(LEAF_SEQUENCE),ROOT_MOVE);
const siblings=[];
let resourceFailureCount=0;

for(const dc of legal(kernel,afterRoot)){
  const sequence=LEAF_SEQUENCE+'3'+String(dc+1),state=kernel.advance(afterRoot,dc);assert(state>=0&&state!==domain.QN_TERMINAL_WIN);
  const jq=jsStep(rootJs,dc),bridge=exactBridge(sequence,jq,kernel,state);assert(bridge.pass);
  const eng=createRepairCapacityProofEngine(kernel,{maxProofStates:1});
  const repairTargetsRaw=eng.terms(state,0).filter(t=>t.length===1).map(t=>t[0]).filter(t=>eng.invariant(state,t));
  const repairTargets=[];
  for(const target of repairTargetsRaw){
    try{repairTargets.push(repairTargetAudit(sequence,target));}
    catch(error){resourceFailureCount++;repairTargets.push({target:eng.coord(target),proved:false,kind:'RESOURCE_FAILURE',rejected:[],firstFailureWitnesses:[],error:String(error?.message??error)});}
  }
  const qc=bridge.semanticQClass;
  let boundedGrammar=qc===Q9F?{kind:'EXACT_Q9F_HANDOFF'}:rankOne(kernel,state)??rankThree(kernel,state);
  const row={
    defenderColumn:dc+1,sequence,exactQClass:qc,rank:32,support:support(kernel,state),exactBridge:bridge,
    p0Residuals:semResidualKeys(kernel,state,0),p1Residuals:semResidualKeys(kernel,state,1),
    p0MinimalResiduals:residualDetails(jq,P0),p1MinimalResiduals:residualDetails(jq,P1),
    enabledSingletons:{P0:enabledSingletonsJs(jq,P0),P1:enabledSingletonsJs(jq,P1)},
    singletonTargets:{P0:singletonTargetsJs(jq,P0),P1:singletonTargetsJs(jq,P1)},
    cpc:cpc(jq),phasePath:phasePath(support(kernel,state)),boundedGrammar,repairTargets,
    onePlyConsequences:[]
  };
  siblings.push(row);
}
siblings.sort((a,b)=>a.defenderColumn-b.defenderColumn);

for(const row of siblings.filter(x=>x.defenderColumn!==3)){
  const state=replay(kernel,row.sequence),jq=jsFromSequence(row.sequence);
  for(const action of legal(kernel,state)){
    const cell=landing(kernel,state,action),child=kernel.advance(state,action),jsChild=jsStep(jq,action),routes=[];
    if(child===domain.QN_TERMINAL_WIN||jsChild.terminal===P0_WIN){
      routes.push('IMMEDIATE_P0_TERMINAL');
      row.onePlyConsequences.push({actionColumn:action+1,landingCell:cell,terminalFor:'P0',entersExistingPositiveFamily:routes});
      continue;
    }
    assert(child>=0&&jsChild.terminal===0);
    const childQ=qClass(kernel,child),childSupport=support(kernel,child);
    if(isOverloadLeaf(kernel,child))routes.push('RANK1_OVERLOAD');
    const p0Targets=singletonTargetsJs(jsChild,P0);
    const direct=[];
    for(const target of p0Targets){const r=directReservoirRoute(jsChild,target.cell);if(r){direct.push(r);routes.push('DIRECT_TARGET_RESERVOIR_RCIC');}}
    row.onePlyConsequences.push({
      actionColumn:action+1,landingCell:cell,terminalFor:null,childQ,childSupport,
      enabledP1Singletons:enabledSingletonsJs(jsChild,P1),
      p0SingletonTargets:p0Targets,
      cpc:cpc(jsChild),
      entersExistingPositiveFamily:[...new Set(routes)],
      qualifiedDirectReservoirRoutes:direct
    });
  }
}

const closed=siblings.find(x=>x.defenderColumn===3),unresolved=siblings.filter(x=>x.defenderColumn!==3);
const sharedAll=sharedFields(siblings);
const sharedUnresolved=sharedFields(unresolved);
const closedFieldNames=new Set(sharedAll.map(x=>x.field));
const sharedUnresolvedButNotClosed=sharedUnresolved.filter(x=>!closedFieldNames.has(x.field)&&unresolved.every(u=>{
  const d=differenceFields(closed,u);return d.some(z=>z.field===x.field);
}));
const closedVsUnresolved=unresolved.map(u=>({
  defenderColumn:u.defenderColumn,exactQClass:u.exactQClass,
  differingFields:differenceFields(closed,u),
  residualDelta:{P0:residualDiff(closed,u,0),P1:residualDiff(closed,u,1)}
}));
const pairwiseUnknown=[];
for(let i=0;i<unresolved.length;i++)for(let j=i+1;j<unresolved.length;j++){
  const a=unresolved[i],b=unresolved[j];
  pairwiseUnknown.push({
    a:a.defenderColumn,b:b.defenderColumn,
    nonlocalSupportEqual:JSON.stringify(a.support.slice(0,4))===JSON.stringify(b.support.slice(0,4)),
    nonlocalP0ResidualProjectionEqual:JSON.stringify(nonlocalProjection(a,0))===JSON.stringify(nonlocalProjection(b,0)),
    nonlocalP1ResidualProjectionEqual:JSON.stringify(nonlocalProjection(a,1))===JSON.stringify(nonlocalProjection(b,1)),
    exactLocalColumnPermutationMatches:localPermutationMatch(a,b)
  });
}

const allOnePly=unresolved.flatMap(x=>x.onePlyConsequences.map(y=>({defenderColumn:x.defenderColumn,...y})));
const qualifiedOnePly=allOnePly.filter(x=>x.entersExistingPositiveFamily.length);
const repairFailures=unresolved.flatMap(x=>x.repairTargets.filter(t=>!t.proved).flatMap(t=>t.firstFailureWitnesses.map(f=>({defenderColumn:x.defenderColumn,target:t.target,...f}))));

const siblingDifferential={
  sharedAll,
  sharedUnresolved,
  sharedUnresolvedButNotClosed,
  closedVsUnresolved,
  pairwiseUnknown
};

console.log(JSON.stringify({
  schema:'connect4.cpc_rank30_d1_a_unknown_child_structural_differential.v1',
  date:'2026-10-01',jsMinSysSha:EXPECTED,
  design:'CPC_RANK30_D1_A_UNKNOWN_CHILD_STRUCTURAL_DIFFERENTIAL_DESIGN_0_1.md',
  sourceEvidence:SOURCE,sourceLeafId:LEAF,sourceExactQClass:LEAF_Q,
  siblings,siblingDifferential,
  summary:{
    unresolvedSiblingCount:unresolved.length,
    repairInvariantTargetCount:unresolved.reduce((s,x)=>s+x.repairTargets.length,0),
    unprovedRepairTargetCount:unresolved.reduce((s,x)=>s+x.repairTargets.filter(t=>!t.proved).length,0),
    repairFirstFailureWitnessCount:repairFailures.length,
    onePlyConsequenceCount:allOnePly.length,
    onePlyQualifiedEntranceCount:qualifiedOnePly.length,
    onePlyQualifiedEntrances:qualifiedOnePly.map(x=>({defenderColumn:x.defenderColumn,actionColumn:x.actionColumn,routes:x.entersExistingPositiveFamily,childQ:x.childQ??null})),
    pairwiseUnknown,
    resourceFailureCount
  },
  oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,jsMinSysModified:false,legacyRepairModified:false,rcicModified:false,forcedLossModified:false,bsfpModified:false,
  conclusion:[
    'The closed c3 child and all three unresolved siblings are reconstructed with exact semantic-q / JSMinSys RBA equality before any structural comparison.',
    qualifiedOnePly.length
      ? 'At least one unresolved sibling has a one-ply action entering an already-qualified positive certificate family; these entrances are the next monotone proof-library handoff candidates.'
      : 'No unresolved sibling enters an already-qualified positive family in one ply; the reported repair and sibling-difference witnesses localize the next theorem-discovery seam.',
    repairFailures.length
      ? 'Legacy repair-capacity failure is reduced to exact first failing action/reply witnesses rather than a generic no-repair label.'
      : 'No legacy repair failure witness exists in the unresolved sibling set.',
    'No value label or free-branch search is used to select a difference.'
  ],
  boundary:[
    'No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.'
  ]
},null,2));
