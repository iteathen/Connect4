#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const ROOT='44444156666623222242';
const SOURCE='CPC_RANK20_C3_PROOF_ROUTING_DISCOVERY_0_1.json';

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

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3,P2_WIN=1;

const KNOWN_SEQUENCES={
  RANK22_ROUTED:'4444415666662322224233',
  RANK24_ZUGZWANG:'444441566666232222423311',
  RANK24_SINGLETON:'444441566666232222423313',
  RANK24_ROUTED:'444441566666232222423317',
};

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(column>=0&&column<g.columns&&q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function rankOf(q){return q.words[g.metaOffset]>>>2;}
function moverOf(q){return rankOf(q)&1;}
function support(q){return Array.from(q.words.slice(0,g.columns));}
function exactEqual(a,b){
  if(!a||!b||a.terminal!==b.terminal||a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,player){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);
  return out;
}
function minimalIds(q,player){
  const active=activeIds(q,player);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function shapeCells(id){
  const out=[],base=id*4;
  for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[base+i]);
  return out;
}
function shapeHasCell(id,cell){
  const base=id*4;
  for(let i=0;i<g.shapeSize[id];i++)if(g.shapeCells[base+i]===cell)return true;
  return false;
}
function cellDesc(cell,q){
  return {
    cell,
    column:g.cellColumn[cell]+1,
    row:g.cellRow[cell]+1,
    projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1,
    supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell),
  };
}
function residualDesc(q,id,player){
  const cells=shapeCells(id).map(cell=>cellDesc(cell,q));
  return {
    diagnosticId:id,
    size:g.shapeSize[id],
    cells,
    fullyAligned:cells.every(x=>x.projectedOwner===player+1)
  };
}
function alignedMinimalPairs(q){
  return minimalIds(q,P1)
    .filter(id=>g.shapeSize[id]===2)
    .map(id=>residualDesc(q,id,P1))
    .filter(x=>x.fullyAligned);
}
function pairKey(desc){
  return desc.cells
    .map(x=>[x.column,x.row])
    .sort((a,b)=>a[0]-b[0]||a[1]-b[1])
    .map(x=>x.join(','))
    .join('|');
}
function hasActiveSingleton(q,player,cell){
  return activeIds(q,player).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);
}
function activeMinimalSingletonCells(q,player){
  return minimalIds(q,player)
    .filter(id=>g.shapeSize[id]===1)
    .map(id=>g.shapeCells[id*4]);
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
function cpc(q){
  const kinds=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);
  const out={};
  for(const [name,frontierResponse] of [['baseline',false],['frontier',true]]){
    const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
    out[name]={
      kind:kinds.get(kind),
      interval:[s.interval[0]-2,s.interval[1]-2],
      forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
      preemptionCount:s.preemptionCount[0],
      preemptionMask32:s.preemptionMask32[0]>>>0,
      precursorCount:s.precursorCount[0],
      projectedCount:Array.from(s.projectedCount),
      projectedForks:Array.from(s.projectedForks),
    };
  }
  return out;
}
function agreedRestriction(c){
  return (
    c.baseline.kind==='CPC_RESTRICT'&&c.frontier.kind==='CPC_RESTRICT'&&
    c.baseline.preemptionCount===1&&c.frontier.preemptionCount===1&&
    c.baseline.forcedColumn!==null&&
    c.baseline.forcedColumn===c.frontier.forcedColumn
  )?c.baseline.forcedColumn:null;
}

const knownStates=Object.fromEntries(Object.entries(KNOWN_SEQUENCES).map(([name,seq])=>[name,fromSequence(seq)]));
function knownRoot(q){
  if(!q||q.terminal)return null;
  for(const [name,state] of Object.entries(knownStates))if(exactEqual(q,state))return name;
  return null;
}

function coverageWitness(q,id,targetCell,partner,length){
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell];
  const cells=shapeCells(id);
  for(const cell of cells){
    const c=g.cellColumn[cell],r=g.cellRow[cell];
    if(c===tc&&r>tr)return {kind:'post-target-deferral',...cellDesc(cell,q)};
  }
  for(const cell of cells){
    const c=g.cellColumn[cell],r=g.cellRow[cell],
      depth=r-q.words[c],p=partner[c],L=p>=0?length[c]:0;
    if(depth<0)continue;
    if(depth>=L+1&&((depth-(L+1))&1)===0)
      return {kind:'vertical-response',...cellDesc(cell,q)};
    if(p>=0&&depth<L){
      const mate=(q.words[p]+depth)*g.columns+p;
      if(shapeHasCell(id,mate))
        return {
          kind:'cross-pair',
          cells:[cell,mate].map(x=>cellDesc(x,q)),
          columns:[c+1,p+1],
          depth,L
        };
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

  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell];
  const targetDepth=tr-q.words[tc];
  if(targetDepth<=0)return null;

  const capacity=new Uint32Array(g.columns),odd=[];
  let total=0;
  for(let c=0;c<g.columns;c++){
    const cap=c===tc?tr-q.words[c]+1:g.rows-q.words[c];
    if(cap<0)return null;
    capacity[c]=cap;total+=cap;
    if(cap&1)odd.push(c);
  }
  if((total&1)||(odd.length&1))return null;

  const defenderIds=activeIds(q,P2);
  const partner=new Int32Array(g.columns);partner.fill(-1);
  const length=new Uint32Array(g.columns);
  let found=null;

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
    for(let c=0;c<g.columns;c++)if(partner[c]>=0&&c<partner[c])
      synchronizedPairs.push({columns:[c+1,partner[c]+1],prefixLength:length[c]});
    const map=buildPairMap(q,capacity,partner,length);
    return {
      target:cellDesc(targetCell,q),
      targetDepth,targetPrefixLength:targetL,targetIsResponse,
      capacity:Array.from(capacity),
      oddColumns:odd.map(c=>c+1),
      synchronizedPairs,
      defenderResidualCount:defenderIds.length,
      coverage,
      mate:Array.from(map.mate),
      role:Array.from(map.role)
    };
  }
  function rec(pending){
    if(found)return;
    if(!pending.length){found=evaluate();return;}
    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),
        max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!found;L+=2){
        length[a]=L;length[b]=L;
        if((a===tc||b===tc)&&L>=capacity[tc])continue;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;length[a]=0;length[b]=0;
    }
  }
  rec(odd);
  return found;
}
function validateTemplate(q,targetCell,template){
  const mate=Int32Array.from(template.mate),role=Uint8Array.from(template.role);
  const failures=[];
  let defenderNodes=0,responsePairs=0,maxPairDepth=0,p1Terminals=0,targetTerminals=0;
  function walk(state,depth){
    defenderNodes++;maxPairDepth=Math.max(maxPairDepth,depth);
    if(moverOf(state)!==P2){failures.push({kind:'wrong-mover',support:support(state)});return;}
    let legal=0;
    for(let c=0;c<g.columns;c++){
      if(state.words[c]>=g.rows)continue;
      legal++;
      const row=state.words[c],cell=row*g.columns+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){
        failures.push({kind:'unmapped-defender-trigger',column:c+1,row:row+1,role:r});continue;
      }
      const d=step(state,c);
      if(d.terminal===P2_WIN){failures.push({kind:'defender-terminal',column:c+1,row:row+1});continue;}
      if(d.terminal){failures.push({kind:'other-defender-terminal',terminal:d.terminal});continue;}
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(d.words[rc]!==rr){
        failures.push({kind:'response-not-playable',trigger:[c+1,row+1],response:[rc+1,rr+1]});continue;
      }
      const a=step(d,rc);responsePairs++;
      if(a.terminal===P1_WIN){
        p1Terminals++;
        if(m===targetCell)targetTerminals++;
        continue;
      }
      if(a.terminal){failures.push({kind:'other-response-terminal',terminal:a.terminal});continue;}
      walk(a,depth+1);
    }
    if(!legal)failures.push({kind:'no-legal-before-win'});
  }
  walk(q,0);
  return {
    pass:failures.length===0,
    defenderNodes,responsePairs,maxPairDepth,p1Terminals,targetTerminals,
    failures:failures.slice(0,20)
  };
}
function compactTemplate(t){
  return t?{
    target:t.target,
    targetDepth:t.targetDepth,
    targetPrefixLength:t.targetPrefixLength,
    targetIsResponse:t.targetIsResponse,
    capacity:t.capacity,
    oddColumns:t.oddColumns,
    synchronizedPairs:t.synchronizedPairs,
    defenderResidualCount:t.defenderResidualCount,
    coverage:t.coverage
  }:null;
}
function targetReservoirRoute(q,targetCell,kind,extra={}){
  const owner=connect4CpcTargetOwner32(g,q.words,0,targetCell);
  const defenderPlayable=playableSingletons(q,P2);
  const template=owner===P1&&defenderPlayable.length===0?findTargetTemplate(q,targetCell):null;
  const validation=template?validateTemplate(q,targetCell,template):null;
  return {
    kind,
    ...extra,
    target:cellDesc(targetCell,q),
    targetProjectedToP1:owner===P1,
    defenderPlayableSingletons:defenderPlayable,
    targetTemplate:compactTemplate(template),
    validation,
    accept:owner===P1&&defenderPlayable.length===0&&!!template&&!!validation?.pass
  };
}
function contractionRoutes(before,after,landingCell,kind,extra={}){
  const routes=[];
  for(const pair of alignedMinimalPairs(before)){
    const cells=pair.cells.map(x=>x.cell);
    if(!cells.includes(landingCell))continue;
    const other=cells[0]===landingCell?cells[1]:cells[0];
    const singleton=after.terminal===0&&hasActiveSingleton(after,P1,other);
    const base={
      ...extra,
      pairBefore:pair,
      consumedEndpoint:cellDesc(landingCell,before),
      singletonTarget:cellDesc(other,after),
      contractionToSingleton:singleton
    };
    if(singleton)routes.push(targetReservoirRoute(after,other,kind,base));
    else routes.push({...base,kind,accept:false,rejectionReason:'pair-did-not-contract-to-active-singleton'});
  }
  return routes;
}



const setupEvidence=JSON.parse(readFileSync(resolve(import.meta.dirname,'CPC_RANK20_DUAL_OBLIGATION_SETUP_TRANSPORT_PROBE_0_1.json'),'utf8'));
assert.equal(setupEvidence.schema,'connect4.cpc_rank20_dual_obligation_setup_transport_probe.v1');
assert.equal(setupEvidence.jsMinSysSha,EXPECTED);
assert.equal(setupEvidence.oracleUsed,false);
assert.equal(setupEvidence.solvedInputsUsed,false);

const L_C1R3=2*g.columns+0;
const L_C3R5=4*g.columns+2;
const R_C7R3=2*g.columns+6;
const R_C5R5=4*g.columns+4;

function exactPair(q,a,b){
  const key=[cellDesc(a,q),cellDesc(b,q)]
    .map(x=>[x.column,x.row]).sort((x,y)=>x[0]-y[0]||x[1]-y[1])
    .map(x=>x.join(',')).join('|');
  return alignedMinimalPairs(q).find(p=>pairKey(p)===key)??null;
}
function stateProfile(q){
  if(q.terminal)return {terminal:q.terminal,rank:rankOf(q),support:support(q)};
  return {
    terminal:0,
    rank:rankOf(q),
    mover:moverOf(q)+1,
    support:support(q),
    knownRoot:knownRoot(q),
    cpc:cpc(q),
    p1Minimal:minimalIds(q,P1).map(id=>residualDesc(q,id,P1)),
    p2Minimal:minimalIds(q,P2).map(id=>residualDesc(q,id,P2)),
    p1AlignedPairs:alignedMinimalPairs(q)
  };
}
function consumeExactPair(before,responseColumn1,pairA,pairB,targetCell,routeKind,extra={}){
  const responseColumn=responseColumn1-1;
  const pair=exactPair(before,pairA,pairB);
  const endpoint=before.words[responseColumn]*g.columns+responseColumn;
  const endpointExpected=pairA===endpoint||pairB===endpoint;
  const other=endpoint===pairA?pairB:pairA;
  const result={
    defenderColumn:extra.defenderColumn??null,
    p1ResponseColumn:responseColumn1,
    routeKind,
    pairBefore:pair,
    endpoint:cellDesc(endpoint,before),
    endpointExpected,
    responseTerminal:null,
    responseSupport:null,
    contractionToSingleton:false,
    target:cellDesc(targetCell,before),
    targetProjectedToP1:false,
    targetTemplate:null,
    validation:null,
    accept:false,
    rejectionReason:null
  };
  if(!pair||!endpointExpected){
    result.rejectionReason='expected-aligned-pair-endpoint-not-playable';
    return result;
  }
  const after=step(before,responseColumn);
  result.responseTerminal=after.terminal;
  result.responseSupport=support(after);
  if(after.terminal!==0){
    result.accept=after.terminal===P1_WIN;
    result.rejectionReason=result.accept?null:'unexpected-response-terminal';
    return result;
  }
  result.contractionToSingleton=hasActiveSingleton(after,P1,targetCell);
  result.target=cellDesc(targetCell,after);
  if(!result.contractionToSingleton){
    result.rejectionReason='pair-did-not-contract-to-singleton';
    return result;
  }
  const rcic=targetReservoirRoute(after,targetCell,routeKind,{
    ...extra,
    p1ResponseColumn:responseColumn1,
    pairBefore:pair,
    endpoint:cellDesc(endpoint,before),
    contractionToSingleton:true
  });
  Object.assign(result,{
    targetProjectedToP1:rcic.targetProjectedToP1,
    defenderPlayableSingletons:rcic.defenderPlayableSingletons,
    targetTemplate:rcic.targetTemplate,
    validation:rcic.validation,
    accept:rcic.accept,
    rejectionReason:rcic.accept?null:'target-reservoir-rejected'
  });
  return result;
}

const q20=fromSequence(ROOT);
assert.equal(q20.terminal,0);
assert.equal(rankOf(q20),20);
assert.deepEqual(support(q20),[1,6,1,6,1,5,0]);

const afterP1c3=step(q20,2);
const rank22c7=step(afterP1c3,6);
assert.equal(rank22c7.terminal,0);
assert.equal(rankOf(rank22c7),22);
assert.deepEqual(support(rank22c7),[1,6,2,6,1,5,1]);
assert(exactPair(rank22c7,L_C1R3,L_C3R5));
assert(exactPair(rank22c7,R_C7R3,R_C5R5));

const firstSetup=step(rank22c7,6);
assert.equal(firstSetup.terminal,0);
assert.equal(rankOf(firstSetup),23);
assert.deepEqual(support(firstSetup),[1,6,2,6,1,5,2]);

const legalFirstReplies=[];
const routes=[];
for(let d=0;d<g.columns;d++){
  if(firstSetup.words[d]>=g.rows)continue;
  const defenderColumn=d+1;
  legalFirstReplies.push(defenderColumn);
  const afterD=step(firstSetup,d);
  assert.equal(afterD.terminal,0);

  if([1,3,6].includes(defenderColumn)){
    const route=consumeExactPair(
      afterD,7,R_C7R3,R_C5R5,R_C5R5,
      'REQUALIFIED_C7_CONTRACTION_RCIC',
      {defenderColumn}
    );
    routes.push({
      defenderColumn,
      kind:'REQUALIFIED_C7_CONTRACTION_RCIC',
      p1ResponseColumn:7,
      ...route,
    });
    continue;
  }

  if(defenderColumn===5){
    assert(exactPair(afterD,L_C1R3,L_C3R5));
    assert(exactPair(afterD,R_C7R3,R_C5R5));
    const setup2=step(afterD,0);
    assert.equal(setup2.terminal,0);
    assert.equal(setup2.words[0],g.cellRow[L_C1R3]);
    const legalSecondDefenderReplies=[];
    const subroutes=[];
    for(let d2=0;d2<g.columns;d2++){
      if(setup2.words[d2]>=g.rows)continue;
      const secondColumn=d2+1;
      legalSecondDefenderReplies.push(secondColumn);
      const afterD2=step(setup2,d2);
      assert.equal(afterD2.terminal,0);
      if(secondColumn===1){
        subroutes.push(consumeExactPair(
          afterD2,7,R_C7R3,R_C5R5,R_C5R5,
          'R_TO_C5R5_RCIC',
          {defenderColumn:secondColumn}
        ));
      }else{
        subroutes.push(consumeExactPair(
          afterD2,1,L_C1R3,L_C3R5,L_C3R5,
          'L_TO_C3R5_RCIC',
          {defenderColumn:secondColumn}
        ));
      }
    }
    routes.push({
      defenderColumn,
      kind:'DUAL_PAIR_CHOICE_MACRO',
      supportAfterFirstDefender:support(afterD),
      p1SetupColumn:1,
      supportAfterSetup:support(setup2),
      legalSecondDefenderReplies,
      subroutes,
      allClosed:subroutes.every(x=>x.accept===true),
      accept:subroutes.every(x=>x.accept===true)
    });
    continue;
  }

  if(defenderColumn===7){
    assert.equal(afterD.words[6],3);
    assert.equal(exactPair(afterD,R_C7R3,R_C5R5),null);
    assert(exactPair(afterD,L_C1R3,L_C3R5));
    const setup2=step(afterD,0);
    assert.equal(setup2.terminal,0);
    assert.equal(setup2.words[0],g.cellRow[L_C1R3]);
    const legalSecondDefenderReplies=[];
    const subroutes=[];
    let doubleTaken=null;
    for(let d2=0;d2<g.columns;d2++){
      if(setup2.words[d2]>=g.rows)continue;
      const secondColumn=d2+1;
      legalSecondDefenderReplies.push(secondColumn);
      const afterD2=step(setup2,d2);
      assert.equal(afterD2.terminal,0);
      if(secondColumn===1){
        const profile=stateProfile(afterD2);
        doubleTaken={
          defenderColumn:1,
          p1ResponseColumn:null,
          routeKind:'DOUBLE_TAKEN_WITNESS',
          valueClaimed:false,
          accept:false,
          finalState:profile
        };
        subroutes.push(doubleTaken);
      }else{
        subroutes.push(consumeExactPair(
          afterD2,1,L_C1R3,L_C3R5,L_C3R5,
          'L_TO_C3R5_RCIC',
          {defenderColumn:secondColumn}
        ));
      }
    }
    routes.push({
      defenderColumn,
      kind:'TRANSPORTED_SINGLE_PAIR_MACRO',
      supportAfterFirstDefender:support(afterD),
      p1SetupColumn:1,
      supportAfterSetup:support(setup2),
      legalSecondDefenderReplies,
      subroutes,
      offTakenClosed:subroutes.filter(x=>x.defenderColumn!==1).every(x=>x.accept===true),
      allClosed:subroutes.every(x=>x.accept===true),
      accept:subroutes.every(x=>x.accept===true),
      doubleTakenWitness:doubleTaken
    });
    continue;
  }

  throw new Error('unexpected first-stage defender reply '+defenderColumn);
}

assert.deepEqual(legalFirstReplies,[1,3,5,6,7]);
routes.sort((a,b)=>a.defenderColumn-b.defenderColumn);

const c5=routes.find(x=>x.defenderColumn===5);
const c7=routes.find(x=>x.defenderColumn===7);
const failedBeforeFinal=routes.filter(x=>x.defenderColumn!==7&&!x.accept);
const c7OffTakenFailures=c7.subroutes.filter(x=>x.defenderColumn!==1&&!x.accept);
let smallestRemainingWitness=null;
if(failedBeforeFinal.length){
  smallestRemainingWitness={
    kind:'FIRST_STAGE_ROUTE_FAILURE',
    defenderColumn:failedBeforeFinal[0].defenderColumn,
    route:failedBeforeFinal[0]
  };
}else if(c7OffTakenFailures.length){
  smallestRemainingWitness={
    kind:'C7_SECOND_STAGE_OFF_TAKEN_FAILURE',
    defenderColumn:c7OffTakenFailures[0].defenderColumn,
    route:c7OffTakenFailures[0]
  };
}else{
  smallestRemainingWitness={
    kind:'DOUBLE_TAKEN_WITNESS',
    route:c7.doubleTakenWitness
  };
}

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_reply7_dual_pair_choice_elimination_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:false,
  design:'CPC_RANK20_REPLY7_DUAL_PAIR_CHOICE_ELIMINATION_PROBE_DESIGN_0_1.md',
  rank20:{
    sequence:ROOT,
    rank:rankOf(q20),
    mover:moverOf(q20)+1,
    support:support(q20)
  },
  firstStage:{
    rank22DefenderColumn:7,
    rank22State:stateProfile(rank22c7),
    p1SetupColumn:7,
    supportAfterSetup:support(firstSetup),
    legalDefenderReplies:legalFirstReplies,
    routes
  },
  c5ChoiceMacroAllClosed:c5.allClosed,
  c7OffTakenClosed:c7.offTakenClosed,
  smallestRemainingWitness,
  conclusion:[
    'This probe tests response-dependent use of the two aligned obligation pairs in the rank-20 defender-c7 child.',
    'Different defender triggers are allowed to route through different already-qualified singleton target-reservoir RCICs.',
    'The c5 exception uses L/R choice elimination; the c7 taken-endpoint branch transports control to L and is reduced to its exact double-taken witness if every off-c1 route closes.'
  ],
  boundary:[
    'This is discovery evidence only and does not by itself certify the rank-20 root or its defender-c7 child.',
    'No oracle, Pons score, solved W/D/L, minimax, ordinary game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Every accepted subroute requires exact pair contraction plus a freshly synthesized and exhaustively validated target-reservoir RCIC.',
    'The double-taken witness carries no assigned value.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
