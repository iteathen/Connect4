#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const TRANSPORT='CPC_RANK20_RANK32_CONSEQUENCE_CLASS_TRANSPORT_CENSUS_0_1.json';
const RANK5='CPC_RANK20_FORCED_C3_RANK5_LOCAL_GRAMMAR_PROBE_0_1.json';
const DESIGN='CPC_RANK20_RANK32_RECURRING_Q_GENERIC_RCIC_AUDIT_DESIGN_0_1.md';
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

const semanticKernelMod=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const semanticDomain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const {createSlot64ResidualQuotientKernel}=semanticKernelMod;

const transport=JSON.parse(readFileSync(resolve(import.meta.dirname,TRANSPORT),'utf8'));
const rank5=JSON.parse(readFileSync(resolve(import.meta.dirname,RANK5),'utf8'));
assert.equal(transport.schema,'connect4.cpc_rank20_rank32_consequence_class_transport_census.v1');
assert.equal(rank5.schema,'connect4.cpc_rank20_forced_c3_rank5_local_grammar_probe.v1');
assert.equal(transport.summary.repeatedUnresolvedQClassCount,34);
for(const src of [transport,rank5]){
  assert.equal(src.oracleUsed,false);
  assert.equal(src.solvedInputsUsed,false);
  assert.equal(src.productionCpcModified,false);
  assert.equal(src.jsMinSysModified,false);
  assert.equal(src.bsfpModified,false);
}

const semantic=createSlot64ResidualQuotientKernel(DOMAIN,{
  cacheEdges:true,prefixClasses:4096,responseClosure:true,
  searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})
}).kernel;
semantic.prepareSearchStorage();

function semanticReplay(sequence){
  let id=semantic.rootId;
  for(const d of sequence){
    const child=semantic.advance(id,Number(d)-1);
    if(!Number.isSafeInteger(child)||child<0)throw new Error('semantic replay crossed terminal/illegal '+sequence);
    id=child;
  }
  return id;
}
function semRank(id){return semantic.supportAccess.rankAt(semantic.states.supportAt(id));}
function semSupport(id){
  const s=semantic.states.supportAt(id),out=[];
  for(let c=0;c<7;c++){
    const x=semantic.supportAccess.landingAt(s,c);
    out.push(x===0xff?6:Math.floor(x/7));
  }
  return out;
}
function hasSemBit(term,cell){return cell<32?(((term[0]>>>cell)&1)!==0):(((term[1]>>>(cell-32))&1)!==0);}
function semTermCells(term){const out=[];for(let c=0;c<42;c++)if(hasSemBit(term,c))out.push(c);return out;}
function semTermKeys(id,p){
  const cid=p===0?semantic.states.p0At(id):semantic.states.p1At(id);
  return semantic.classes.terms(cid).map(semTermCells).map(cells=>cells.join(',')).sort();
}
function semExactKey(id){return 'r'+semRank(id)+'|h'+semSupport(id).join(',')+'|p0:'+semTermKeys(id,0).join(';')+'|p1:'+semTermKeys(id,1).join(';');}
function semQClass(id){return createHash('sha256').update(semExactKey(id)).digest('hex').slice(0,16);}

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
  const out=[];for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);return out;
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
    cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1,
    projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1,
    supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell)
  };
}
function residualDesc(q,id,player){
  const cells=shapeCells(id).map(cell=>cellDesc(cell,q));
  return {diagnosticId:id,size:g.shapeSize[id],cells,fullyAligned:cells.every(x=>x.projectedOwner===player+1)};
}
function alignedMinimalPairs(q){
  return minimalIds(q,P1).filter(id=>g.shapeSize[id]===2).map(id=>residualDesc(q,id,P1)).filter(x=>x.fullyAligned);
}
function pairKey(desc){
  return desc.cells.map(x=>[x.column,x.row]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]).map(x=>x.join(',')).join('|');
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
function cpc(q){
  const kinds=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);
  const out={};
  for(const [name,frontierResponse] of [['baseline',false],['frontier',true]]){
    const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
    out[name]={
      kind:kinds.get(kind),interval:[s.interval[0]-2,s.interval[1]-2],
      forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
      preemptionCount:s.preemptionCount[0],preemptionMask32:s.preemptionMask32[0]>>>0,
      precursorCount:s.precursorCount[0],projectedCount:Array.from(s.projectedCount),
      projectedForks:Array.from(s.projectedForks)
    };
  }
  return out;
}
function agreedRestriction(c){
  return (
    c.baseline.kind==='CPC_RESTRICT'&&c.frontier.kind==='CPC_RESTRICT'&&
    c.baseline.preemptionCount===1&&c.frontier.preemptionCount===1&&
    c.baseline.forcedColumn!==null&&c.baseline.forcedColumn===c.frontier.forcedColumn
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
    if(!(targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0))return null;
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
      target:cellDesc(targetCell,q),targetDepth,targetPrefixLength:targetL,targetIsResponse:true,
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
    let legalCount=0;
    for(let c=0;c<g.columns;c++){
      if(state.words[c]>=g.rows)continue;
      legalCount++;
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
    if(!legalCount)failures.push({kind:'no-legal-before-win'});
  }
  walk(q,0);
  return {pass:failures.length===0,defenderNodes,responsePairs,maxPairDepth,p1Terminals,targetTerminals,failures:failures.slice(0,20)};
}
function compactTemplate(t){
  return t?{
    target:t.target,targetDepth:t.targetDepth,targetPrefixLength:t.targetPrefixLength,
    targetIsResponse:t.targetIsResponse,capacity:t.capacity,oddColumns:t.oddColumns,
    synchronizedPairs:t.synchronizedPairs,defenderResidualCount:t.defenderResidualCount,coverage:t.coverage
  }:null;
}
function targetReservoirRoute(q,targetCell,kind,extra={}){
  const owner=connect4CpcTargetOwner32(g,q.words,0,targetCell);
  const defenderPlayable=playableSingletons(q,P2);
  const template=owner===P1&&defenderPlayable.length===0?findTargetTemplate(q,targetCell):null;
  const validation=template?validateTemplate(q,targetCell,template):null;
  return {
    kind,...extra,target:cellDesc(targetCell,q),targetProjectedToP1:owner===P1,
    defenderPlayableSingletons:defenderPlayable,targetTemplate:compactTemplate(template),validation,
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
    const base={...extra,pairBefore:pair,consumedEndpoint:cellDesc(landingCell,before),singletonTarget:cellDesc(other,after),contractionToSingleton:singleton};
    if(singleton)routes.push(targetReservoirRoute(after,other,kind,base));
    else routes.push({...base,kind,accept:false,rejectionReason:'pair-did-not-contract-to-active-singleton'});
  }
  return routes;
}

function compactAccepted(route){
  return {
    kind:route.kind,
    p1Column:route.p1Column??route.directAfterP1Column??null,
    defenderColumn:route.defenderColumn??null,
    followupP1Column:route.followupP1Column??null,
    knownRoot:route.knownRoot??null,
    exactTerminal:route.exactTerminal??false,
    target:route.target??null,
    targetTemplate:route.targetTemplate?{
      targetDepth:route.targetTemplate.targetDepth,
      targetPrefixLength:route.targetTemplate.targetPrefixLength,
      oddColumns:route.targetTemplate.oddColumns,
      synchronizedPairs:route.targetTemplate.synchronizedPairs,
      defenderResidualCount:route.targetTemplate.defenderResidualCount
    }:null,
    validation:route.validation?{
      pass:route.validation.pass,defenderNodes:route.validation.defenderNodes,
      responsePairs:route.validation.responsePairs,maxPairDepth:route.validation.maxPairDepth,
      p1Terminals:route.validation.p1Terminals,targetTerminals:route.validation.targetTerminals
    }:null
  };
}
function auditRepresentative(q){
  assert.equal(q.terminal,0);
  assert.equal(rankOf(q),32);
  assert.equal(moverOf(q),P1);
  const accepted=[],candidateSummaries=[];
  for(let p1=0;p1<g.columns;p1++){
    if(q.words[p1]>=g.rows)continue;
    const landingCell=q.words[p1]*g.columns+p1,child=step(q,p1),routes=[];
    const summary={p1Column:p1+1,terminal:child.terminal,afterP1Support:support(child),directTargetAttempts:0,forcedColumn:null,acceptedRouteCount:0};
    if(child.terminal===P1_WIN){
      routes.push({kind:'EXACT_TERMINAL',p1Column:p1+1,exactTerminal:true,accept:true});
    }else if(child.terminal===0){
      const rootName=knownRoot(child);
      if(rootName)routes.push({kind:'EXACT_KNOWN_ROOT_HANDOFF',p1Column:p1+1,knownRoot:rootName,exactHandoff:true,accept:true});
      const targets=activeMinimalSingletonCells(child,P1);
      summary.directTargetAttempts=targets.length;
      for(const targetCell of targets)routes.push(targetReservoirRoute(child,targetCell,'DIRECT_TARGET_RESERVOIR_RCIC',{directAfterP1Column:p1+1,p1Column:p1+1}));
      const cc=cpc(child),forcedColumn=agreedRestriction(cc);
      summary.forcedColumn=forcedColumn;
      if(forcedColumn!==null&&child.words[forcedColumn-1]<g.rows){
        const forced=step(child,forcedColumn-1);
        if(forced.terminal===0){
          const forcedRoot=knownRoot(forced);
          if(forcedRoot)routes.push({kind:'FORCED_KNOWN_ROOT_HANDOFF',p1Column:p1+1,defenderColumn:forcedColumn,knownRoot:forcedRoot,exactHandoff:true,accept:true});
          for(let follow=0;follow<g.columns;follow++){
            if(forced.words[follow]>=g.rows)continue;
            const followLanding=forced.words[follow]*g.columns+follow,afterFollow=step(forced,follow);
            if(afterFollow.terminal===P1_WIN){
              routes.push({kind:'FORCED_PAIR_CONTRACTION_TO_RESERVOIR_RCIC',p1Column:p1+1,defenderColumn:forcedColumn,followupP1Column:follow+1,exactTerminal:true,terminal:P1_WIN,accept:true});
              continue;
            }
            if(afterFollow.terminal!==0)continue;
            routes.push(...contractionRoutes(forced,afterFollow,followLanding,'FORCED_PAIR_CONTRACTION_TO_RESERVOIR_RCIC',{p1Column:p1+1,defenderColumn:forcedColumn,followupP1Column:follow+1}));
          }
        }
      }
    }
    const acceptedHere=routes.filter(x=>x.accept===true).map(compactAccepted);
    summary.acceptedRouteCount=acceptedHere.length;
    accepted.push(...acceptedHere);
    candidateSummaries.push(summary);
  }
  const routeKinds=[...new Set(accepted.map(x=>x.kind))].sort();
  return {
    closedByExistingGrammar:accepted.length>0,
    acceptedRoutes:accepted,
    routeKinds,
    candidateSummaries,
    unresolvedWitness:accepted.length?null:{
      support:support(q),
      cpc:cpc(q),
      alignedMinimalPairs:alignedMinimalPairs(q).map(pairKey).sort(),
      p1MinimalSingletonTargets:activeMinimalSingletonCells(q,P1).map(cell=>cellDesc(cell,q))
    }
  };
}

const sourceSequenceByLeaf=new Map(rank5.rows.map(x=>[x.sourceLeafId,x.sequence]));
const repeated=transport.unresolvedQClasses.filter(x=>x.incomingTransitionCount>1);
assert.equal(repeated.length,34);

const rows=[];
for(const qrow of repeated){
  const incomingSequences=qrow.incoming.map(x=>{
    const sourceSequence=sourceSequenceByLeaf.get(x.sourceLeafId);
    assert(sourceSequence,'missing source leaf sequence '+x.sourceLeafId);
    return {
      sequence:sourceSequence+String(x.p0Move)+String(x.p1Reply),
      sourceLeafId:x.sourceLeafId,sourceQClass:x.sourceQClass,
      p0Move:x.p0Move,p1Reply:x.p1Reply,macroLabel:x.macroLabel
    };
  });
  assert.equal(incomingSequences.length,qrow.incomingTransitionCount);

  let semanticReplayAgreement=true;
  for(const x of incomingSequences){
    const sid=semanticReplay(x.sequence);
    if(semRank(sid)!==32||semQClass(sid)!==qrow.exactQClass)semanticReplayAgreement=false;
  }

  const rbaStates=incomingSequences.map(x=>({...x,state:fromSequence(x.sequence)}));
  for(const x of rbaStates){
    assert.equal(x.state.terminal,0);
    assert.equal(rankOf(x.state),32);
  }
  const representatives=[];
  for(const x of rbaStates){
    let rep=representatives.find(r=>exactEqual(r.state,x.state));
    if(!rep){rep={state:x.state,representativeSequence:x.sequence,memberSequences:[]};representatives.push(rep);}
    rep.memberSequences.push(x.sequence);
  }
  const jsExactRbaBridgePass=representatives.length===1;
  const representativeRows=representatives.map(rep=>({
    representativeSequence:rep.representativeSequence,
    memberSequences:rep.memberSequences.sort(),
    support:support(rep.state),
    audit:auditRepresentative(rep.state)
  }));
  const acceptedRoutes=representativeRows.flatMap(x=>x.audit.acceptedRoutes.map(route=>({representativeSequence:x.representativeSequence,...route})));
  const routeKinds=[...new Set(acceptedRoutes.map(x=>x.kind))].sort();
  rows.push({
    exactQClass:qrow.exactQClass,
    rank:qrow.rank,
    support:qrow.support,
    incomingTransitionCount:qrow.incomingTransitionCount,
    sourceLeafIds:qrow.sourceLeafIds,
    macroLabels:qrow.macroLabels,
    incomingSequences:incomingSequences.map(x=>x.sequence),
    semanticReplayAgreement,
    jsExactRbaBridgePass,
    representativeCount:representatives.length,
    representatives:representativeRows,
    acceptedRoutes,
    routeKinds,
    closedByExistingGrammar:acceptedRoutes.length>0,
    smallestUnresolvedWitness:acceptedRoutes.length?null:representativeRows[0]?.audit.unresolvedWitness??null
  });
}

const closed=rows.filter(x=>x.closedByExistingGrammar),unresolved=rows.filter(x=>!x.closedByExistingGrammar);
const totalIncoming=rows.reduce((s,x)=>s+x.incomingTransitionCount,0),coveredIncoming=closed.reduce((s,x)=>s+x.incomingTransitionCount,0);
const closureByRouteKind={};
for(const row of closed)for(const kind of row.routeKinds)closureByRouteKind[kind]=(closureByRouteKind[kind]??0)+1;
const summary={
  repeatedQClassCount:rows.length,
  bridgePassCount:rows.filter(x=>x.jsExactRbaBridgePass).length,
  bridgeFailCount:rows.filter(x=>!x.jsExactRbaBridgePass).length,
  semanticReplayFailureCount:rows.filter(x=>!x.semanticReplayAgreement).length,
  totalPhysicalRepresentativeCount:rows.reduce((s,x)=>s+x.representativeCount,0),
  closedClassCount:closed.length,
  unresolvedClassCount:unresolved.length,
  closureByRouteKind,
  totalIncomingTransitionCount:totalIncoming,
  coveredIncomingTransitionCount:coveredIncoming,
  uncoveredIncomingTransitionCount:totalIncoming-coveredIncoming,
  coveredIncomingTransitionFraction:totalIncoming?coveredIncoming/totalIncoming:0,
  closedQClasses:closed.map(x=>x.exactQClass),
  unresolvedQClasses:unresolved.map(x=>x.exactQClass)
};

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_rank32_recurring_q_generic_rcic_audit.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,jsMinSysModified:false,bsfpModified:false,
  design:DESIGN,sourceEvidence:{transport:TRANSPORT,rank5:RANK5},
  repeatedQClassCount:rows.length,knownRoots:KNOWN_SEQUENCES,rows,summary,
  conclusion:[
    'Every repeated semantic rank-32 q class is independently replayed and bridged into pinned JSMinSys RBA before any existing-route result is shared across traces.',
    'The route audit uses only the already-qualified generic RCIC grammar: immediate terminal, exact root handoff, direct target-reservoir, and CPC-forced pair-contraction to target-reservoir.',
    summary.closedClassCount
      ? 'At least one recurring rank-32 q hub is already closed by the existing RCIC grammar, so those routes should be integrated into the unified proof router rather than replaced by a new theorem.'
      : 'No recurring rank-32 q hub is closed by the existing RCIC grammar; the consequence-transport obstruction is genuinely beyond the present route library.'
  ],
  boundary:[
    'This is monotone proof-library audit evidence only and does not assign W/D/L value to unresolved q classes.',
    'No oracle, solved W/D/L, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Exact route reuse is shared only after semantic-q replay and exact JSMinSys RBA equality checks.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
