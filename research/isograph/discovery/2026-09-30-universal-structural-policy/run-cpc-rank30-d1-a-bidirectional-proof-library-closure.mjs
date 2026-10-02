#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const LEAF='SECOND_D1_C5_CONTRACTION:A->A';
const LEAF_Q='d21a89605c399aca';
const LEAF_SEQUENCE='444441566666232222425511515311';
const ROOT_MOVE=2; // c3 zero-based
const Q9F='9f6b7a33ab7e9552';
const PROOF_CAP=100000;
const NODE_CAP=100000;
const root=resolve(import.meta.dirname,'../../../..');

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const lossEvidence=JSON.parse(readFileSync(resolve(import.meta.dirname,'CPC_RANK20_RANK32_FORCED_OBLIGATION_LOSS_CENSUS_0_1.json'),'utf8'));
const q9fEvidence=JSON.parse(readFileSync(resolve(import.meta.dirname,'CPC_RANK32_Q9F_MONOTONE_PROOF_LIBRARY_CLASSIFICATION_0_1.json'),'utf8'));
const continuation=JSON.parse(readFileSync(resolve(import.meta.dirname,'CPC_RANK30_D1_A_Q9F_HANDOFF_CONTINUATION_0_1.json'),'utf8'));
assert.equal(lossEvidence.schema,'connect4.cpc_rank20_rank32_forced_obligation_loss_census.v1');
assert.equal(q9fEvidence.schema,'connect4.cpc_rank32_q9f_monotone_proof_library_classification.v1');
assert.equal(q9fEvidence.classification,'FORCED_BLOCK_ALL_REPLIES_POSITIVE');
assert.equal(q9fEvidence.target.exactQClass,Q9F);
assert.equal(continuation.sourceLeafId,LEAF);
assert.equal(continuation.sourceExactQClass,LEAF_Q);

const frozenLeaf=lossEvidence.sourceLeaves.find(x=>x.sourceLeafId===LEAF);assert(frozenLeaf);
assert.equal(frozenLeaf.sequence,LEAF_SEQUENCE);
assert.deepEqual(frozenLeaf.support,[6,6,2,6,5,5,0]);
assert.deepEqual(frozenLeaf.survivingRootMoves,[3]);
const previouslyEliminatedRootMoves=frozenLeaf.rootActions.filter(x=>x.eliminated).map(x=>x.rootMove).sort((a,b)=>a-b);
assert.deepEqual(previouslyEliminatedRootMoves,[5,6,7]);

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
  kernel.prepareSearchStorage();
  return kernel;
}
function replay(k,sequence){
  let id=k.rootId;
  for(const d of sequence){
    const n=k.advance(id,Number(d)-1);
    if(!Number.isSafeInteger(n)||n<0)throw new Error('bad replay '+sequence);
    id=n;
  }
  return id;
}
function semRank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function semLanding(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function semLegal(k,id){const out=[];for(let c=0;c<7;c++)if(semLanding(k,id,c)!==0xff)out.push(c);return out;}
function semSupport(k,id){
  const out=[];for(let c=0;c<7;c++){const x=semLanding(k,id,c);out.push(x===0xff?6:Math.floor(x/7));}return out;
}
function hasBit(term,cell){return cell<32?(((term[0]>>>cell)&1)!==0):(((term[1]>>>(cell-32))&1)!==0);}
function termCells(term){const out=[];for(let c=0;c<42;c++)if(hasBit(term,c))out.push(c);return out;}
function semResidualKeys(k,id,p){
  const cid=p===0?k.states.p0At(id):k.states.p1At(id);
  return k.classes.terms(cid).map(termCells).map(c=>c.join(',')).sort();
}
function exactKey(k,id){
  return 'r'+semRank(k,id)+'|h'+semSupport(k,id).join(',')+'|p0:'+semResidualKeys(k,id,0).join(';')+'|p1:'+semResidualKeys(k,id,1).join(';');
}
function qClass(k,id){return createHash('sha256').update(exactKey(k,id)).digest('hex').slice(0,16);}

function immediateWinningColumns(k,id){
  if((semRank(k,id)&1)!==0)return [];
  const out=[];for(const c of semLegal(k,id))if(k.advance(id,c)===domain.QN_TERMINAL_WIN)out.push(c);return out;
}
function isImmediateWin(k,id){return immediateWinningColumns(k,id).length>0;}
function isOverloadLeaf(k,id){
  if((semRank(k,id)&1)!==1)return false;
  const cols=semLegal(k,id);if(!cols.length)return false;
  for(const c of cols){const child=k.advance(id,c);if(child===domain.QN_TERMINAL_WIN||child<0||!isImmediateWin(k,child))return false;}
  return true;
}
function rankOne(k,id){
  if((semRank(k,id)&1)!==0)return null;
  for(const c of semLegal(k,id)){
    const child=k.advance(id,c);
    if(child>=0&&isOverloadLeaf(k,child))return {kind:'RANK1',expression:'E(O)',rootMove:c+1};
  }
  return null;
}
function rankThree(k,id){
  if((semRank(k,id)&1)!==0)return null;
  for(const rootColumn of semLegal(k,id)){
    const defender=k.advance(id,rootColumn);
    if(defender<0||isOverloadLeaf(k,defender))continue;
    const replies=semLegal(k,defender);if(!replies.length)continue;
    const consequenceRows=[];let valid=true;
    for(const dc of replies){
      const attacker=k.advance(defender,dc);
      if(attacker===domain.QN_TERMINAL_WIN||attacker<0){valid=false;break;}
      const wins=immediateWinningColumns(k,attacker);
      if(wins.length){consequenceRows.push({defenderColumn:dc+1,kind:'IMMEDIATE',winningColumns:wins.map(x=>x+1)});continue;}
      const r1=rankOne(k,attacker);if(!r1){valid=false;break;}
      consequenceRows.push({defenderColumn:dc+1,kind:'RANK1',rootMove:r1.rootMove});
    }
    if(valid)return {kind:'RANK3',expression:'E(A(...))',rootMove:rootColumn+1,consequenceRows};
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
  assert.equal(q.words[g.metaOffset]&3,0);assert(column>=0&&column<7&&q.words[column]<6);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,column,words,0,basis,0,seen,sizes,0);
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function coordHas(q,p,index){const base=p?g.p1Offset:g.p0Offset;return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function activeIds(q,p){const out=[];for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);return out;}
function minimalIds(q,p){const a=activeIds(q,p);return a.filter(id=>!a.some(o=>o!==id&&g.shapeSize[o]<g.shapeSize[id]&&connect4RbaShapeSubset(g,o,id)));}
function shapeCells(id){const out=[],b=id*4;for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[b+i]);return out;}
function shapeHasCell(id,cell){const b=id*4;for(let i=0;i<g.shapeSize[id];i++)if(g.shapeCells[b+i]===cell)return true;return false;}
function keyCells(cells){return [...cells].sort((a,b)=>a-b).join(',');}
function keyArray(key){return key===''?[]:key.split(',').map(Number);}
function strictSubset(a,b){const aa=keyArray(a),bb=new Set(keyArray(b));return aa.length<bb.size&&aa.every(x=>bb.has(x));}
function normalize(keys){const u=[...new Set(keys)];return u.filter(k=>!u.some(o=>o!==k&&strictSubset(o,k))).sort();}
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

function cellDesc(cell,q){
  return {cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1,
    projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1,
    supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell)};
}
function hasActiveSingleton(q,p,cell){return activeIds(q,p).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);}
function activeMinimalSingletonCells(q,p){return minimalIds(q,p).filter(id=>g.shapeSize[id]===1).map(id=>g.shapeCells[id*4]);}
function playableSingletons(q,p){
  const out=[];for(const id of activeIds(q,p)){if(g.shapeSize[id]!==1)continue;const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];if(q.words[c]===r)out.push(cellDesc(cell,q));}return out;
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
function agreedRestriction(x){
  return x.baseline.kind==='CPC_RESTRICT'&&x.frontier.kind==='CPC_RESTRICT'&&
    x.baseline.preemptionCount===1&&x.frontier.preemptionCount===1&&
    x.baseline.forcedColumn===x.frontier.forcedColumn?x.baseline.forcedColumn:null;
}
const KNOWN={
  RANK22_ROUTED:'4444415666662322224233',
  RANK24_ZUGZWANG:'444441566666232222423311',
  RANK24_SINGLETON:'444441566666232222423313',
  RANK24_ROUTED:'444441566666232222423317',
};
const knownStates=Object.fromEntries(Object.entries(KNOWN).map(([k,s])=>[k,jsFromSequence(s)]));
function exactEqual(a,b){
  if(!a||!b||a.terminal!==b.terminal||a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}
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
  }
  return {mate,role};
}
function validateTemplate(q,targetCell,t){
  const mate=Int32Array.from(t.mate),role=Uint8Array.from(t.role),failures=[];let nodes=0,pairs=0,maxPairDepth=0,p1Terminals=0,targetTerminals=0;
  function walk(s,depth=0){
    nodes++;
    for(let c=0;c<7;c++){
      if(s.words[c]>=6)continue;
      const row=s.words[c],cell=row*7+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){failures.push({kind:'unmapped',column:c+1,row:row+1});continue;}
      const d=jsStep(s,c);
      if(d.terminal===P1_WIN){p1Terminals++;continue;}
      if(d.terminal)continue;
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(d.words[rc]!==rr){failures.push({kind:'response-not-playable',column:rc+1,row:rr+1});continue;}
      const a=jsStep(d,rc);pairs++;maxPairDepth=Math.max(maxPairDepth,depth+1);
      if(a.terminal===P0_WIN){targetTerminals++;continue;}
      if(a.terminal){failures.push({kind:'wrong-terminal'});continue;}
      walk(a,depth+1);
    }
  }
  walk(q);
  return {pass:failures.length===0,defenderNodes:nodes,responsePairs:pairs,maxPairDepth,p1Terminals,targetTerminals,failures:failures.slice(0,20)};
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
    const map=buildPairMap(q,capacity,partner,length);
    return {capacity:Array.from(capacity),mate:Array.from(map.mate),role:Array.from(map.role),oddColumns:odd.map(x=>x+1)};
  }
  function rec(pending){
    if(found)return;
    if(!pending.length){found=evalTemplate();return;}
    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!found;L+=2){length[a]=length[b]=L;if((a===tc||b===tc)&&L>=capacity[tc])continue;rec(rest);}
      partner[a]=partner[b]=-1;length[a]=length[b]=0;
    }
  }
  rec(odd);return found;
}
function targetRoute(q,target,kind,extra={}){
  const template=findTargetTemplate(q,target),validation=template?validateTemplate(q,target,template):null;
  return {kind,...extra,target:cellDesc(target,q),accept:!!template&&validation?.pass===true,
    template:template?{capacity:template.capacity,oddColumns:template.oddColumns}:null,validation};
}
function contractionRoutes(before,after,landing,extra={}){
  const out=[];
  for(const pair of alignedMinimalPairs(before)){
    const cells=pair.cells.map(x=>x.cell);if(!cells.includes(landing))continue;
    const other=cells[0]===landing?cells[1]:cells[0];
    if(after.terminal===0&&hasActiveSingleton(after,P0,other))out.push(targetRoute(after,other,'FORCED_PAIR_CONTRACTION_TO_RESERVOIR_RCIC',extra));
  }
  return out;
}
function genericRoutes(q){
  const accepted=[];
  for(let p0=0;p0<7;p0++){
    if(q.words[p0]>=6)continue;
    const child=jsStep(q,p0);
    if(child.terminal===P0_WIN){accepted.push({kind:'EXACT_TERMINAL',p0Column:p0+1});continue;}
    if(child.terminal!==0)continue;
    const kr=knownRoot(child);if(kr)accepted.push({kind:'EXACT_KNOWN_ROOT_HANDOFF',p0Column:p0+1,knownRoot:kr});
    for(const target of activeMinimalSingletonCells(child,P0)){
      const x=targetRoute(child,target,'DIRECT_TARGET_RESERVOIR_RCIC',{p0Column:p0+1});
      if(x.accept)accepted.push({kind:x.kind,p0Column:x.p0Column,target:x.target,validation:x.validation});
    }
    const fc=agreedRestriction(cpc(child));
    if(fc&&child.words[fc-1]<6){
      const forced=jsStep(child,fc-1);
      if(forced.terminal===0){
        for(let f=0;f<7;f++){
          if(forced.words[f]>=6)continue;
          const land=forced.words[f]*7+f,after=jsStep(forced,f);
          if(after.terminal===P0_WIN)accepted.push({kind:'FORCED_EXACT_TERMINAL',p0Column:p0+1,defenderColumn:fc,followupP0Column:f+1});
          else if(after.terminal===0){
            for(const x of contractionRoutes(forced,after,land,{p0Column:p0+1,defenderColumn:fc,followupP0Column:f+1})){
              if(x.accept)accepted.push({kind:x.kind,p0Column:x.p0Column,defenderColumn:x.defenderColumn,followupP0Column:x.followupP0Column,target:x.target,validation:x.validation});
            }
          }
        }
      }
    }
  }
  return accepted;
}

function repairCertificates(sequence){
  const k=makeKernel(),state=replay(k,sequence),engine=createRepairCapacityProofEngine(k,{collectAllWinningActions:true,maxProofStates:PROOF_CAP});
  const targets=engine.terms(state,0).filter(t=>t.length===1).map(t=>t[0]).filter(t=>engine.invariant(state,t));
  const certificates=[];let resourceFailure=null;
  for(const target of targets){
    try{
      const r=engine.prove(state,target);
      if(r.proved)certificates.push({kind:'LEGACY_REPAIR_CAPACITY',targetCell:target,target:engine.coord(target),proofKind:r.kind,witness:r.witness??null,winningActions:(r.winningActions??[]).map(x=>({column:x.column,kind:x.kind}))});
    }catch(error){resourceFailure={kind:'repair_capacity_resource_failure',message:String(error?.message??error)};break;}
  }
  return {certificates,targets:targets.map(t=>engine.coord(t)),resourceFailure,stats:engine.stats()};
}
function compactProof(p,depth=0){
  if(!p)return null;if(depth>8)return {kind:'DEPTH_TRUNCATED'};
  return {loss:p.loss,kind:p.kind,obligation:p.obligation??null,obligations:p.obligations??null,forcedColumn:p.forcedColumn??null,
    adversarialReply:p.adversarialReply??null,replyCell:p.replyCell??null,escapeAction:p.escapeAction??null,escapeReason:p.escapeReason??null,
    child:p.child?compactProof(p.child,depth+1):null};
}
function errorKind(error){
  const m=String(error?.message??error);
  if(m.includes('forced-obligation node cap exceeded'))return 'proof_node_cap_exceeded';
  if(m.includes('reserved quotient state capacity exhausted'))return 'state_capacity_exhausted';
  if(m.includes('reserved quotient class capacity exhausted'))return 'class_capacity_exhausted';
  return 'execution_error';
}
function forcedLoss(sequence,expectedQ){
  const k=makeKernel(),engine=createRepairCapacityProofEngine(k,{maxProofStates:1}),start=replay(k,sequence);
  assert.equal(semRank(k,start),32);assert.equal(qClass(k,start),expectedQ);
  const memo=new Map(),stats={nodes:0,maxDepth:0,multiDefects:0,forcedNodes:0,terminalWitnesses:0,childLossWitnesses:0,zeroObligationNodes:0};
  function prove(state,depth=0){
    if(stats.nodes>=NODE_CAP)throw new Error('forced-obligation node cap exceeded '+NODE_CAP);
    assert.equal(semRank(k,state)&1,0);
    const key=exactKey(k,state);if(memo.has(key))return memo.get(key);
    stats.nodes++;stats.maxDepth=Math.max(stats.maxDepth,depth);
    const p0Terminals=engine.terminalActions(state,0);
    if(p0Terminals.length){const out={loss:false,kind:'P0_TERMINAL_AVAILABLE'};memo.set(key,out);return out;}
    const obligations=[...new Set(engine.enabledSingletons(state,1))];
    if(!obligations.length){stats.zeroObligationNodes++;const out={loss:false,kind:'NO_ENABLED_P1_OBLIGATION'};memo.set(key,out);return out;}
    if(obligations.length>=2){
      const actions=[];
      for(const action of engine.legal(state)){
        const afterP0=k.advance(state,action);
        if(afterP0===domain.QN_TERMINAL_WIN){const out={loss:false,kind:'MULTI_OBLIGATION_P0_TERMINAL_ESCAPE'};memo.set(key,out);return out;}
        assert(afterP0>=0);
        const terminals=engine.terminalActions(afterP0,1);actions.push({action:engine.col(action),p1TerminalCells:terminals.map(x=>engine.coord(x.cell))});
        if(!terminals.length){const out={loss:false,kind:'MULTI_OBLIGATION_ESCAPE',actions};memo.set(key,out);return out;}
      }
      stats.multiDefects++;const out={loss:true,kind:'MULTI_OBLIGATION_CAPACITY_DEFECT',obligations:obligations.map(engine.coord),actions};memo.set(key,out);return out;
    }
    stats.forcedNodes++;
    const threat=obligations[0],forcedColumn=threat%7;
    if(engine.landing(state,forcedColumn)!==threat){const out={loss:false,kind:'SINGLETON_NOT_PLAYABLE_OBLIGATION',obligation:engine.coord(threat)};memo.set(key,out);return out;}
    for(const action of engine.legal(state)){
      if(action===forcedColumn)continue;
      const afterP0=k.advance(state,action);
      if(afterP0===domain.QN_TERMINAL_WIN){const out={loss:false,kind:'SINGLE_OBLIGATION_P0_TERMINAL_ESCAPE'};memo.set(key,out);return out;}
      assert(afterP0>=0);
      if(!engine.terminalActions(afterP0,1).length){const out={loss:false,kind:'SINGLETON_NOT_FORCED',obligation:engine.coord(threat),escapeAction:engine.col(action)};memo.set(key,out);return out;}
    }
    const afterBlock=k.advance(state,forcedColumn);
    if(afterBlock===domain.QN_TERMINAL_WIN){const out={loss:false,kind:'FORCED_BLOCK_IS_P0_TERMINAL',obligation:engine.coord(threat)};memo.set(key,out);return out;}
    assert(afterBlock>=0);
    for(const reply of engine.legal(afterBlock)){
      const replyCell=engine.landing(afterBlock,reply),child=k.advance(afterBlock,reply);
      if(child===domain.QN_TERMINAL_WIN){stats.terminalWitnesses++;const out={loss:true,kind:'FORCED_BLOCK_THEN_P1_TERMINAL',obligation:engine.coord(threat),forcedColumn:engine.col(forcedColumn),adversarialReply:engine.col(reply),replyCell:engine.coord(replyCell)};memo.set(key,out);return out;}
      assert(child>=0);
      if(engine.terminalActions(child,0).length)continue;
      const sub=prove(child,depth+1);
      if(sub.loss){stats.childLossWitnesses++;const out={loss:true,kind:'FORCED_BLOCK_THEN_CHILD_LOSS',obligation:engine.coord(threat),forcedColumn:engine.col(forcedColumn),adversarialReply:engine.col(reply),replyCell:engine.coord(replyCell),child:sub};memo.set(key,out);return out;}
    }
    const out={loss:false,kind:'FORCED_BLOCK_HAS_NO_CERTIFIED_LOSING_REPLY',obligation:engine.coord(threat),forcedColumn:engine.col(forcedColumn)};memo.set(key,out);return out;
  }
  let proof=null,resourceFailure=null;
  try{proof=prove(start);}catch(error){resourceFailure={kind:errorKind(error),message:String(error?.message??error)};}
  return {loss:proof?.loss===true,kind:proof?.kind??null,proofCompleted:resourceFailure===null,compactProof:compactProof(proof),resourceFailure,stats,
    rootObligations:engine.enabledSingletons(start,1).map(engine.coord)};
}

const kernel=makeKernel();
const leaf= replay(kernel,LEAF_SEQUENCE);
assert.equal(semRank(kernel,leaf),30);assert.equal(qClass(kernel,leaf),LEAF_Q);assert.deepEqual(semSupport(kernel,leaf),[6,6,2,6,5,5,0]);
const afterRoot=kernel.advance(leaf,ROOT_MOVE);assert(afterRoot>=0&&afterRoot!==domain.QN_TERMINAL_WIN);
const rootSequence=LEAF_SEQUENCE+'3';
const rootJs=jsStep(jsFromSequence(LEAF_SEQUENCE),ROOT_MOVE);
assert.equal(rootJs.terminal,0);
const defenderReplies=semLegal(kernel,afterRoot);assert.equal(defenderReplies.length,4);

let resourceFailureCount=0;
const children=[];
for(const dc of defenderReplies){
  const sequence=rootSequence+String(dc+1);
  const child=kernel.advance(afterRoot,dc);
  if(child===domain.QN_TERMINAL_WIN){
    children.push({defenderColumn:dc+1,sequence,exactQClass:null,rank:32,support:null,exactBridge:{pass:true},positiveCertificates:[],lossCertificate:{loss:true,kind:'DEFENDER_TERMINAL'},disposition:'P0_LOSS'});
    continue;
  }
  assert(child>=0&&semRank(kernel,child)===32);
  const jsChild=jsStep(rootJs,dc);assert.equal(jsChild.terminal,0);
  const bridge=exactBridge(sequence,jsChild,kernel,child);assert(bridge.pass);
  const qc=bridge.semanticQClass;
  const positiveCertificates=[];

  const immediate=immediateWinningColumns(kernel,child);
  if(immediate.length)positiveCertificates.push({kind:'IMMEDIATE_P0_TERMINAL',winningColumns:immediate.map(x=>x+1)});
  if(qc===Q9F)positiveCertificates.push({kind:'EXACT_Q9F_HANDOFF',sourceEvidence:'CPC_RANK32_Q9F_MONOTONE_PROOF_LIBRARY_CLASSIFICATION_0_1.json',classification:q9fEvidence.classification});

  const r1=rankOne(kernel,child);if(r1)positiveCertificates.push(r1);
  const r3=r1?null:rankThree(kernel,child);if(r3)positiveCertificates.push(r3);

  const repair=repairCertificates(sequence);
  positiveCertificates.push(...repair.certificates);
  if(repair.resourceFailure){resourceFailureCount++;}

  try{positiveCertificates.push(...genericRoutes(jsChild));}
  catch(error){resourceFailureCount++;positiveCertificates.push({kind:'GENERIC_RCIC_RESOURCE_FAILURE',error:String(error?.message??error),nonCertificate:true});}
  const actualPositive=positiveCertificates.filter(x=>x.nonCertificate!==true);

  const lossCertificate=forcedLoss(sequence,qc);
  if(lossCertificate.resourceFailure)resourceFailureCount++;
  assert.equal(actualPositive.length>0&&lossCertificate.loss,true&&false,'positive/loss certificate collision');

  const disposition=actualPositive.length?'P0_WIN':lossCertificate.loss?'P0_LOSS':'UNKNOWN';
  children.push({
    defenderColumn:dc+1,sequence,exactQClass:qc,rank:32,support:semSupport(kernel,child),exactBridge:bridge,
    positiveCertificates:actualPositive,repairAudit:{targets:repair.targets,stats:repair.stats,resourceFailure:repair.resourceFailure},
    lossCertificate,disposition
  });
}
children.sort((a,b)=>a.defenderColumn-b.defenderColumn);
const c3=children.find(x=>x.defenderColumn===3);assert(c3&&c3.exactQClass===Q9F&&c3.positiveCertificates.some(x=>x.kind==='EXACT_Q9F_HANDOFF'));

const anyLoss=children.some(x=>x.disposition==='P0_LOSS');
const allWin=children.every(x=>x.disposition==='P0_WIN');
const rootMoveDisposition=anyLoss?'ELIMINATED':allWin?'WINNING':'UNRESOLVED';
const leafDisposition=rootMoveDisposition==='WINNING'?'P0_WIN':rootMoveDisposition==='ELIMINATED'?'P0_LOSS':'UNKNOWN';

const routeCounts={};
for(const child of children)for(const p of child.positiveCertificates)routeCounts[p.kind]=(routeCounts[p.kind]??0)+1;
const dispositionCounts={P0_WIN:0,P0_LOSS:0,UNKNOWN:0};for(const child of children)dispositionCounts[child.disposition]++;

console.log(JSON.stringify({
  schema:'connect4.cpc_rank30_d1_a_bidirectional_proof_library_closure.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  sourceLeafId:LEAF,sourceExactQClass:LEAF_Q,sequence:LEAF_SEQUENCE,rank:30,support:[6,6,2,6,5,5,0],
  previouslyEliminatedRootMoves,rootMove:3,children,rootMoveDisposition,leafDisposition,
  summary:{
    childCount:children.length,dispositionCounts,positiveRouteCounts:routeCounts,
    lossCertifiedChildCount:children.filter(x=>x.lossCertificate.loss).length,
    unknownChildCount:children.filter(x=>x.disposition==='UNKNOWN').length,
    resourceFailureCount
  },
  oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,jsMinSysModified:false,legacyRepairModified:false,rcicModified:false,forcedLossModified:false,bsfpModified:false,
  conclusion:[
    'The rank-30 c3 root move is re-evaluated against the currently qualified proof library in both directions rather than against RCIC alone.',
    'Positive routing includes exact q9f reuse, bounded rank-1/rank-3 grammar, legacy repair-capacity induction, and generic target-reservoir/forced-contraction RCIC routes.',
    'Negative routing uses the unchanged forced-obligation loss architecture; unknown is never treated as loss.',
    rootMoveDisposition==='WINNING'?'Every legal defender child is constructively P0-winning, so c3 closes the rank-30 leaf as P0-winning.':
      rootMoveDisposition==='ELIMINATED'?'At least one legal defender child is structurally P0-losing; with c5/c6/c7 already eliminated, the rank-30 leaf is P0-losing.':
      'At least one defender child remains outside both qualified positive and negative libraries; the exact child is preserved as the next obstruction.'
  ],
  boundary:[
    'No solved W/D/L, oracle, minimax, unrestricted free-branch game-tree search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.',
    'The legacy latent-contract backward composition is rank-20-domain-specific; its reusable induction component is the legacy repair-capacity engine queried here.',
    'Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-obligation loss semantics, and BSFP remain unchanged.'
  ]
},null,2));
