#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE='CPC_RANK20_RANK32_RECURRING_Q_GENERIC_RCIC_AUDIT_0_1.json';
const DESIGN='CPC_RANK20_RANK32_TARGET_RESERVOIR_REJECTION_LOCALIZATION_DESIGN_0_1.md';

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {
  prepareConnect4CpcScratch,evaluateConnect4Cpc32,
  connect4CpcTargetOwner32,connect4CpcTargetSupportDistance32,
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3,P2_WIN=1;

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(column>=0&&column<g.columns&&q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,column,words,0,basis,0,seen,sizes,0);
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function rankOf(q){return q.words[g.metaOffset]>>>2;}
function moverOf(q){return rankOf(q)&1;}
function support(q){return Array.from(q.words.slice(0,g.columns));}
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,player){
  const out=[];for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);return out;
}
function minimalIds(q,player){
  const active=activeIds(q,player);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function shapeCells(id){
  const out=[],base=id*4;for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[base+i]);return out;
}
function shapeHasCell(id,cell){
  const base=id*4;for(let i=0;i<g.shapeSize[id];i++)if(g.shapeCells[base+i]===cell)return true;return false;
}
function cellDesc(cell,q){
  return {
    cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1,
    projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1,
    supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell)
  };
}
function hasActiveSingleton(q,player,cell){
  return activeIds(q,player).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);
}
function activeMinimalSingletonCells(q,player){
  return minimalIds(q,player).filter(id=>g.shapeSize[id]===1).map(id=>g.shapeCells[id*4]);
}
function playableSingletons(q,player){
  const out=[];
  for(const id of activeIds(q,player)){
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(q.words[c]===r)out.push({diagnosticId:id,...cellDesc(cell,q)});
  }
  return out;
}
function coverageWitness(q,id,targetCell,partner,length){
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell];
  for(const cell of shapeCells(id)){
    const c=g.cellColumn[cell],r=g.cellRow[cell];
    if(c===tc&&r>tr)return {kind:'post-target-deferral',...cellDesc(cell,q)};
  }
  for(const cell of shapeCells(id)){
    const c=g.cellColumn[cell],r=g.cellRow[cell],depth=r-q.words[c],p=partner[c],L=p>=0?length[c]:0;
    if(depth<0)continue;
    if(depth>=L+1&&((depth-(L+1))&1)===0)return {kind:'vertical-response',...cellDesc(cell,q)};
    if(p>=0&&depth<L){
      const mate=(q.words[p]+depth)*g.columns+p;
      if(shapeHasCell(id,mate))return {kind:'cross-pair',cells:[cell,mate].map(x=>cellDesc(x,q)),columns:[c+1,p+1],depth,L};
    }
  }
  return null;
}
function buildPairMap(q,capacity,partner,length){
  const mate=new Int32Array(g.cellCount);mate.fill(-1);
  const role=new Uint8Array(g.cellCount);
  for(let c=0;c<g.columns;c++){
    const h=q.words[c],p=partner[c],L=p>=0?length[c]:0,cap=capacity[c];
    if(p>=0&&c<p){
      const hp=q.words[p];
      for(let d=0;d<L;d++){
        const a=(h+d)*g.columns+c,b=(hp+d)*g.columns+p;
        mate[a]=b;mate[b]=a;role[a]=3;role[b]=3;
      }
    }
    for(let d=L;d<cap;d+=2){
      if(d+1>=cap)throw new Error('odd vertical tail');
      const lo=(h+d)*g.columns+c,hi=(h+d+1)*g.columns+c;
      mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;
    }
  }
  return {mate,role};
}
function findTargetTemplate(q,targetCell){
  if(!hasActiveSingleton(q,P1,targetCell))return null;
  if(connect4CpcTargetOwner32(g,q.words,0,targetCell)!==P1)return null;
  if(playableSingletons(q,P2).length)return null;
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell],targetDepth=tr-q.words[tc];
  if(targetDepth<=0)return null;
  const capacity=new Uint32Array(g.columns),odd=[];let total=0;
  for(let c=0;c<g.columns;c++){
    const cap=c===tc?tr-q.words[c]+1:g.rows-q.words[c];
    if(cap<0)return null;
    capacity[c]=cap;total+=cap;if(cap&1)odd.push(c);
  }
  if((total&1)||(odd.length&1))return null;
  const defenderIds=activeIds(q,P2),partner=new Int32Array(g.columns);partner.fill(-1);
  const length=new Uint32Array(g.columns);let found=null;
  function evaluate(){
    const targetL=partner[tc]>=0?length[tc]:0;
    const targetIsResponse=targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0;
    if(!targetIsResponse)return null;
    const coverage=[];
    for(const id of defenderIds){
      const witness=coverageWitness(q,id,targetCell,partner,length);
      if(!witness)return null;
      coverage.push({diagnosticId:id,size:g.shapeSize[id],witness});
    }
    const synchronizedPairs=[];
    for(let c=0;c<g.columns;c++)if(partner[c]>=0&&c<partner[c])synchronizedPairs.push({columns:[c+1,partner[c]+1],prefixLength:length[c]});
    const map=buildPairMap(q,capacity,partner,length);
    return {
      target:cellDesc(targetCell,q),targetDepth,targetPrefixLength:targetL,targetIsResponse,
      capacity:Array.from(capacity),oddColumns:odd.map(c=>c+1),synchronizedPairs,
      defenderResidualCount:defenderIds.length,coverage,mate:Array.from(map.mate),role:Array.from(map.role)
    };
  }
  function rec(pending){
    if(found)return;
    if(!pending.length){found=evaluate();return;}
    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!found;L+=2){
        length[a]=L;length[b]=L;
        if((a===tc||b===tc)&&L>=capacity[tc])continue;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;length[a]=0;length[b]=0;
    }
  }
  rec(odd);return found;
}
function validateTemplate(q,targetCell,template){
  const mate=Int32Array.from(template.mate),role=Uint8Array.from(template.role),failures=[];
  let defenderNodes=0,responsePairs=0,maxPairDepth=0,p1Terminals=0,targetTerminals=0;
  function walk(state,depth){
    defenderNodes++;maxPairDepth=Math.max(maxPairDepth,depth);
    if(moverOf(state)!==P2){failures.push({kind:'wrong-mover',support:support(state)});return;}
    let legal=0;
    for(let c=0;c<g.columns;c++){
      if(state.words[c]>=g.rows)continue;
      legal++;
      const row=state.words[c],cell=row*g.columns+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){failures.push({kind:'unmapped-defender-trigger',column:c+1,row:row+1,role:r});continue;}
      const d=step(state,c);
      if(d.terminal===P2_WIN){failures.push({kind:'defender-terminal',column:c+1,row:row+1});continue;}
      if(d.terminal){failures.push({kind:'other-defender-terminal',terminal:d.terminal});continue;}
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(d.words[rc]!==rr){failures.push({kind:'response-not-playable',trigger:[c+1,row+1],response:[rc+1,rr+1]});continue;}
      const a=step(d,rc);responsePairs++;
      if(a.terminal===P1_WIN){p1Terminals++;if(m===targetCell)targetTerminals++;continue;}
      if(a.terminal){failures.push({kind:'other-response-terminal',terminal:a.terminal});continue;}
      walk(a,depth+1);
    }
    if(!legal)failures.push({kind:'no-legal-before-win'});
  }
  walk(q,0);
  return {pass:failures.length===0,defenderNodes,responsePairs,maxPairDepth,p1Terminals,targetTerminals,failures:failures.slice(0,20)};
}
function cellSetKey(id){
  return shapeCells(id).slice().sort((a,b)=>a-b)
    .map(cell=>(g.cellColumn[cell]+1)+','+(g.cellRow[cell]+1)).join('|');
}
function residualSummary(q,id,minimalSet){
  return {diagnosticId:id,cellSetKey:cellSetKey(id),size:g.shapeSize[id],minimal:minimalSet.has(id),cells:shapeCells(id).map(cell=>cellDesc(cell,q))};
}
function pairingSignature(pairs){
  return pairs.map(x=>x.columns[0]+'-'+x.columns[1]+':'+x.prefixLength).sort().join('|');
}
function enumeratePartial(q,targetCell){
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell],targetDepth=tr-q.words[tc];
  const defenderIds=activeIds(q,P2),minimalSet=new Set(minimalIds(q,P2));
  const allResiduals=defenderIds.map(id=>residualSummary(q,id,minimalSet)).sort((a,b)=>a.cellSetKey.localeCompare(b.cellSetKey));
  if(targetDepth<=0)return {
    structuralPrecondition:'TARGET_DEPTH_NONPOSITIVE',targetDepth,
    capacity:null,oddColumns:[],defenderResidualCount:defenderIds.length,
    totalPairingPrefixCandidates:0,targetResponseValidCandidates:0,
    maximumCoveredCount:0,minimumUncoveredCount:defenderIds.length,
    bestUncoveredSets:[{key:'TARGET_DEPTH_NONPOSITIVE',uncoveredCount:defenderIds.length,residuals:allResiduals,candidateSignatures:[]}]
  };
  const capacity=new Uint32Array(g.columns),odd=[];let total=0;
  for(let c=0;c<g.columns;c++){
    const cap=c===tc?tr-q.words[c]+1:g.rows-q.words[c];
    if(cap<0)return {
      structuralPrecondition:'NEGATIVE_CAPACITY',targetDepth,capacity:null,oddColumns:[],
      defenderResidualCount:defenderIds.length,totalPairingPrefixCandidates:0,targetResponseValidCandidates:0,
      maximumCoveredCount:0,minimumUncoveredCount:defenderIds.length,
      bestUncoveredSets:[{key:'NEGATIVE_CAPACITY',uncoveredCount:defenderIds.length,residuals:allResiduals,candidateSignatures:[]}]
    };
    capacity[c]=cap;total+=cap;if(cap&1)odd.push(c);
  }
  if((total&1)||(odd.length&1)){
    return {
      structuralPrecondition:'ODD_RESERVOIR_PARITY',targetDepth,capacity:Array.from(capacity),oddColumns:odd.map(c=>c+1),
      defenderResidualCount:defenderIds.length,totalPairingPrefixCandidates:0,targetResponseValidCandidates:0,
      maximumCoveredCount:0,minimumUncoveredCount:defenderIds.length,
      bestUncoveredSets:[{key:'ODD_RESERVOIR_PARITY',uncoveredCount:defenderIds.length,residuals:allResiduals,candidateSignatures:[]}]
    };
  }
  const partner=new Int32Array(g.columns);partner.fill(-1);
  const length=new Uint32Array(g.columns);
  let totalPairingPrefixCandidates=0,targetResponseValidCandidates=0,maximumCoveredCount=-1;
  const maxCandidates=new Map();
  function evaluate(){
    totalPairingPrefixCandidates++;
    const targetL=partner[tc]>=0?length[tc]:0;
    if(!(targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0))return;
    targetResponseValidCandidates++;
    const covered=[],uncovered=[],witnessKindHistogram={};
    for(const id of defenderIds){
      const witness=coverageWitness(q,id,targetCell,partner,length);
      if(witness){covered.push({diagnosticId:id,size:g.shapeSize[id],witness});witnessKindHistogram[witness.kind]=(witnessKindHistogram[witness.kind]??0)+1;}
      else uncovered.push(id);
    }
    const synchronizedPairs=[];
    for(let c=0;c<g.columns;c++)if(partner[c]>=0&&c<partner[c])synchronizedPairs.push({columns:[c+1,partner[c]+1],prefixLength:length[c]});
    synchronizedPairs.sort((a,b)=>a.columns[0]-b.columns[0]||a.columns[1]-b.columns[1]||a.prefixLength-b.prefixLength);
    const candidate={
      signature:pairingSignature(synchronizedPairs),targetPrefixLength:targetL,synchronizedPairs,
      coveredCount:covered.length,uncoveredCount:uncovered.length,covered,witnessKindHistogram,
      uncoveredResiduals:uncovered.map(id=>residualSummary(q,id,minimalSet)).sort((a,b)=>a.cellSetKey.localeCompare(b.cellSetKey))
    };
    if(candidate.coveredCount>maximumCoveredCount){maximumCoveredCount=candidate.coveredCount;maxCandidates.clear();}
    if(candidate.coveredCount===maximumCoveredCount)maxCandidates.set(candidate.signature,candidate);
  }
  function rec(pending){
    if(!pending.length){evaluate();return;}
    const a=pending[0];
    for(let j=1;j<pending.length;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max;L+=2){
        length[a]=L;length[b]=L;
        if((a===tc||b===tc)&&L>=capacity[tc])continue;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;length[a]=0;length[b]=0;
    }
  }
  rec(odd);
  if(maximumCoveredCount<0)maximumCoveredCount=0;
  const maximumCoverageCandidates=[...maxCandidates.values()].sort((a,b)=>a.signature.localeCompare(b.signature));
  const uncoveredSets=new Map();
  if(maximumCoverageCandidates.length){
    for(const candidate of maximumCoverageCandidates){
      const key=candidate.uncoveredResiduals.map(x=>x.cellSetKey).sort().join('||')||'EMPTY';
      if(!uncoveredSets.has(key))uncoveredSets.set(key,{key,uncoveredCount:candidate.uncoveredCount,residuals:candidate.uncoveredResiduals,candidateSignatures:[]});
      uncoveredSets.get(key).candidateSignatures.push(candidate.signature);
    }
  }else{
    uncoveredSets.set('NO_TARGET_RESPONSE_VALID_PAIRING',{key:'NO_TARGET_RESPONSE_VALID_PAIRING',uncoveredCount:allResiduals.length,residuals:allResiduals,candidateSignatures:[]});
  }
  return {
    structuralPrecondition:'OK',targetDepth,capacity:Array.from(capacity),oddColumns:odd.map(c=>c+1),
    defenderResidualCount:defenderIds.length,totalPairingPrefixCandidates,targetResponseValidCandidates,
    maximumCoveredCount,minimumUncoveredCount:defenderIds.length-maximumCoveredCount,
    bestUncoveredSets:[...uncoveredSets.values()].sort((a,b)=>a.key.localeCompare(b.key)),
    maximumCoverageCandidateCount:maximumCoverageCandidates.length,
    maximumCoverageCandidates:maximumCoverageCandidates.map(c=>({
      signature:c.signature,targetPrefixLength:c.targetPrefixLength,synchronizedPairs:c.synchronizedPairs,
      coveredCount:c.coveredCount,uncoveredCount:c.uncoveredCount,witnessKindHistogram:c.witnessKindHistogram,
      uncoveredResiduals:c.uncoveredResiduals
    }))
  };
}

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank20_rank32_recurring_q_generic_rcic_audit.v1');
assert.equal(source.jsMinSysSha,EXPECTED);
assert.equal(source.summary.repeatedQClassCount,34);
assert.equal(source.summary.closedClassCount,0);
assert.equal(source.summary.bridgeFailCount,0);

const attempts=[];
for(const row of source.rows){
  assert.equal(row.representativeCount,1);
  const rep=row.representatives[0];
  const q=fromSequence(rep.representativeSequence);
  assert.equal(q.terminal,0);assert.equal(rankOf(q),32);assert.equal(moverOf(q),P1);
  for(let c=0;c<g.columns;c++){
    if(q.words[c]>=g.rows)continue;
    const child=step(q,c);
    if(child.terminal!==0)continue;
    const targets=activeMinimalSingletonCells(child,P1);
    for(const targetCell of targets){
      const owner=connect4CpcTargetOwner32(g,child.words,0,targetCell);
      const p2Playable=playableSingletons(child,P2);
      const target=cellDesc(targetCell,child);
      let disposition,template=null,validation=null,partial=null;
      if(owner!==P1)disposition='TARGET_OWNER_GUARD';
      else if(p2Playable.length)disposition='PLAYABLE_P2_SINGLETON_GUARD';
      else {
        template=findTargetTemplate(child,targetCell);
        if(!template){
          disposition='NO_COMPLETE_TEMPLATE';
          partial=enumeratePartial(child,targetCell);
        }else{
          validation=validateTemplate(child,targetCell,template);
          disposition=validation.pass?'UNEXPECTED_ACCEPT':'TEMPLATE_VALIDATION_FAILURE';
        }
      }
      attempts.push({
        exactQClass:row.exactQClass,representativeSequence:rep.representativeSequence,
        sourceSupport:support(q),setupColumn:c+1,afterSetupSupport:support(child),
        target,projectedOwner:owner+1,playableP2Singletons:p2Playable,
        disposition,
        templateFound:!!template,
        validation:validation?{
          pass:validation.pass,defenderNodes:validation.defenderNodes,responsePairs:validation.responsePairs,
          maxPairDepth:validation.maxPairDepth,p1Terminals:validation.p1Terminals,targetTerminals:validation.targetTerminals,
          failures:validation.failures
        }:null,
        partial
      });
    }
  }
}
assert.equal(attempts.length,142);

const dispositionCounts={};
for(const a of attempts)dispositionCounts[a.disposition]=(dispositionCounts[a.disposition]??0)+1;
const noTemplate=attempts.filter(x=>x.disposition==='NO_COMPLETE_TEMPLATE');

const residualMap=new Map(),setMap=new Map();
for(const a of noTemplate){
  const attemptResidualSeen=new Set(),attemptSetSeen=new Set();
  for(const set of a.partial?.bestUncoveredSets??[]){
    const setKey=set.key;
    if(!attemptSetSeen.has(setKey)){
      attemptSetSeen.add(setKey);
      if(!setMap.has(setKey))setMap.set(setKey,{signature:setKey,count:0,qClasses:new Set(),setupColumns:new Set(),targets:new Set(),uncoveredCount:set.uncoveredCount,residuals:set.residuals});
      const x=setMap.get(setKey);x.count++;x.qClasses.add(a.exactQClass);x.setupColumns.add(a.setupColumn);x.targets.add(a.target.cell);
    }
    for(const residual of set.residuals){
      if(attemptResidualSeen.has(residual.cellSetKey))continue;
      attemptResidualSeen.add(residual.cellSetKey);
      if(!residualMap.has(residual.cellSetKey))residualMap.set(residual.cellSetKey,{
        cellSetKey:residual.cellSetKey,count:0,qClasses:new Set(),setupColumns:new Set(),targets:new Set(),
        sizes:new Set(),minimalCount:0,supports:new Set(),representativeCells:residual.cells.map(x=>({cell:x.cell,column:x.column,row:x.row}))
      });
      const x=residualMap.get(residual.cellSetKey);
      x.count++;x.qClasses.add(a.exactQClass);x.setupColumns.add(a.setupColumn);x.targets.add(a.target.cell);
      x.sizes.add(residual.size);if(residual.minimal)x.minimalCount++;
      x.supports.add(a.afterSetupSupport.join(','));
    }
  }
}
const residualRecurrence=[...residualMap.values()].map(x=>({
  cellSetKey:x.cellSetKey,count:x.count,qClassCount:x.qClasses.size,qClasses:[...x.qClasses].sort(),
  setupColumns:[...x.setupColumns].sort((a,b)=>a-b),targetCells:[...x.targets].sort((a,b)=>a-b),
  sizes:[...x.sizes].sort((a,b)=>a-b),minimalCount:x.minimalCount,
  supports:[...x.supports].sort(),representativeCells:x.representativeCells
})).sort((a,b)=>b.qClassCount-a.qClassCount||b.count-a.count||a.cellSetKey.localeCompare(b.cellSetKey));
const uncoveredSetRecurrence=[...setMap.values()].map(x=>({
  signature:x.signature,count:x.count,qClassCount:x.qClasses.size,qClasses:[...x.qClasses].sort(),
  setupColumns:[...x.setupColumns].sort((a,b)=>a-b),targetCells:[...x.targets].sort((a,b)=>a-b),
  uncoveredCount:x.uncoveredCount,residualCellSets:x.residuals.map(r=>r.cellSetKey)
})).sort((a,b)=>b.qClassCount-a.qClassCount||b.count-a.count||a.signature.localeCompare(b.signature));

const summary={
  sourceQClassCount:source.rows.length,directTargetAttemptCount:attempts.length,
  dispositionCounts,
  unexpectedAcceptCount:dispositionCounts.UNEXPECTED_ACCEPT??0,
  noCompleteTemplateCount:dispositionCounts.NO_COMPLETE_TEMPLATE??0,
  ownerGuardCount:dispositionCounts.TARGET_OWNER_GUARD??0,
  playableP2SingletonGuardCount:dispositionCounts.PLAYABLE_P2_SINGLETON_GUARD??0,
  validationFailureCount:dispositionCounts.TEMPLATE_VALIDATION_FAILURE??0,
  recurringResidualCount:residualRecurrence.filter(x=>x.qClassCount>1).length,
  maxResidualQClassCount:residualRecurrence.length?Math.max(...residualRecurrence.map(x=>x.qClassCount)):0,
  recurringUncoveredSetCount:uncoveredSetRecurrence.filter(x=>x.qClassCount>1).length,
  maxUncoveredSetQClassCount:uncoveredSetRecurrence.length?Math.max(...uncoveredSetRecurrence.map(x=>x.qClassCount)):0
};

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_rank32_target_reservoir_rejection_localization.v1',
  date:'2026-10-01',jsMinSysSha:EXPECTED,
  oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,jsMinSysModified:false,targetReservoirModified:false,bsfpModified:false,
  design:DESIGN,sourceEvidence:SOURCE,
  sourceQClassCount:source.rows.length,directTargetAttemptCount:attempts.length,
  attempts,residualRecurrence,uncoveredSetRecurrence,summary,
  conclusion:[
    'All direct active-minimal-singleton target attempts from the 34 repeated rank-32 q hubs are classified without changing target-reservoir semantics.',
    'When the current synthesizer has no complete template, the exact pairing/prefix family is exhaustively enumerated and its maximum partial covers are preserved.',
    summary.recurringResidualCount
      ? 'Recurring exact uncovered residual geometries span multiple independent q hubs, localizing a candidate missing blocker/response-capacity theorem.'
      : 'No uncovered residual geometry recurs across multiple q hubs; target-reservoir rejection is diffuse at this resolution.'
  ],
  boundary:[
    'This is discovery evidence only and does not certify any rejected target attempt or authorize a new response rule.',
    'No oracle, solved W/D/L, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.'
  ]
},null,2));
